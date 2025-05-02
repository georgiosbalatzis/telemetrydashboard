#!/usr/bin/env bash
#===============================================================================
# fetch_openf1_2025.sh — Season 2025, 10-way parallel, resumable, with progress
#  • Control-char cleanup via tr
#  • Unique temp files for merges
#  • Ctrl+C trap to stop cleanly
#===============================================================================

# Ensure we’re under Bash
if [ -z "${BASH_VERSION:-}" ]; then
  exec /usr/bin/env bash "$0" "$@"
fi

# Trap Ctrl+C to kill background jobs and exit
trap 'echo -e "\n⏹ Stopping all sessions…"; jobs -p | xargs -r kill; exit 1' SIGINT

set -euo pipefail

BASE_URL="https://api.openf1.org/v1"
YEAR=2023
GENERAL_ENDPOINTS=(meetings sessions)
SESSION_ENDPOINTS=(drivers intervals laps pit position race_control stints team_radio weather)
MAX_JOBS=10    # ← Updated to 10 threads
STATE_FILE="data/state_${YEAR}.json"

mkdir -p data

update_state(){
  local idx=$1 sk=$2 cur
  cur=$(jq -r '.last_index // -1' "$STATE_FILE")
  if (( idx > cur )); then
    jq -n --arg ls "$sk" --argjson li "$idx" \
       '{last_session:$ls,last_index:$li}' > "${STATE_FILE}.tmp" \
      && mv "${STATE_FILE}.tmp" "$STATE_FILE"
  fi
}

clean_and_load(){
  # Strip control chars (U+0000–U+001F) via tr
  local f=$1 tmpf
  tmpf=$(mktemp)
  tr -d '\000-\037' < "$f" > "$tmpf"
  mv "$tmpf" "$f"
}

process_session(){
  local SK=$1 idx=$2 progress=$(( idx+1 ))
  echo "[${progress}/${TOTAL}] 🔄 Starting session ${SK}"

  # 1) drivers
  local TMP=$(mktemp) MERGE
  curl -s "${BASE_URL}/drivers?session_key=${SK}" > "$TMP"
  clean_and_load "$TMP"
  if jq -e . "$TMP" &>/dev/null && jq -e 'type=="array"' "$TMP" &>/dev/null; then
    MERGE=$(mktemp)
    jq -s '.[0] + .[1]' "data/drivers_${YEAR}.json" "$TMP" > "$MERGE"
    mv "$MERGE" "data/drivers_${YEAR}.json"
  fi
  local DRIVER_NUMS=()
  while IFS= read -r dn; do DRIVER_NUMS+=( "$dn" ); done < <(jq -r '.[].driver_number' "$TMP")
  rm "$TMP"

  # 2) car_data & location per driver
  for DN in "${DRIVER_NUMS[@]}"; do
    for EP in car_data location; do
      local emoji="🏎️"
      [[ $EP == location ]] && emoji="📍"
      TMP=$(mktemp)
      curl -s "${BASE_URL}/${EP}?session_key=${SK}&driver_number=${DN}" > "$TMP"
      clean_and_load "$TMP"
      if ! jq -e . "$TMP" &>/dev/null; then
        jq -s '.' "$TMP" > "${TMP}.nd" 2>/dev/null && mv "${TMP}.nd" "$TMP"
      fi
      if jq -e 'type=="array"' "$TMP" &>/dev/null; then
        MERGE=$(mktemp)
        jq -s '.[0] + .[1]' "data/${EP}_${YEAR}.json" "$TMP" > "$MERGE"
        mv "$MERGE" "data/${EP}_${YEAR}.json"
      fi
      rm "$TMP"
    done
  done

  # 3) other session endpoints
  for EP in "${SESSION_ENDPOINTS[@]}"; do
    TMP=$(mktemp)
    curl -s "${BASE_URL}/${EP}?session_key=${SK}" > "$TMP"
    clean_and_load "$TMP"
    if jq -e . "$TMP" &>/dev/null && jq -e 'type=="array"' "$TMP" &>/dev/null; then
      MERGE=$(mktemp)
      jq -s '.[0] + .[1]' "data/${EP}_${YEAR}.json" "$TMP" > "$MERGE"
      mv "$MERGE" "data/${EP}_${YEAR}.json"
    fi
    rm "$TMP"
  done

  # 4) checkpoint
  update_state "$idx" "$SK"
  echo "[${progress}/${TOTAL}] ✅ Completed session ${SK}"
}

#─── MAIN ──────────────────────────────────────────────────────────────────────

# 1) Load or init checkpoint
if [[ -f "$STATE_FILE" ]]; then
  LAST_IDX=$(jq -r '.last_index' "$STATE_FILE")
  echo "→ Resuming from index ${LAST_IDX}"
else
  echo '{"last_index":-1}' > "$STATE_FILE"
  LAST_IDX=-1
  echo "→ No checkpoint; starting fresh"
fi

# 2) Fetch general endpoints
for EP in "${GENERAL_ENDPOINTS[@]}"; do
  echo "📅 Fetching ${EP}?year=${YEAR}..."
  curl -s "${BASE_URL}/${EP}?year=${YEAR}" > "data/${EP}_${YEAR}.json"
done

# 3) Build sessions array
SESSIONS=( $(jq -r '.[].session_key' "data/sessions_${YEAR}.json") )
TOTAL=${#SESSIONS[@]}
echo "🔑 Found ${TOTAL} sessions for ${YEAR}"

# 4) Compute START_IDX (rewind two)
if (( LAST_IDX > 1 )); then
  START_IDX=$(( LAST_IDX - 2 ))
else
  START_IDX=0
fi
echo "→ Starting at index ${START_IDX} (session ${SESSIONS[$START_IDX]})"

# 5) Ensure data files exist
for EP in "${SESSION_ENDPOINTS[@]}"; do
  [[ -f "data/${EP}_${YEAR}.json" ]] || echo "[]" > "data/${EP}_${YEAR}.json"
done
for EP in car_data location; do
  [[ -f "data/${EP}_${YEAR}.json" ]] || echo "[]" > "data/${EP}_${YEAR}.json"
done

# 6) Process sessions in parallel
job_count=0
for (( idx=START_IDX; idx<TOTAL; idx++ )); do
  SK=${SESSIONS[idx]}
  process_session "$SK" "$idx" &

  (( job_count++ ))
  while (( job_count >= MAX_JOBS )); do
    sleep 0.5
    job_count=$(jobs -p | wc -l)
  done
done

# Wait for all jobs
wait
echo "🎉 All ${TOTAL} sessions complete for ${YEAR}. Data in data/."
