#!/usr/bin/env bash
#===============================================================================
# fetch_openf1_data.sh — Fetch OpenF1 data (2023–2025) with resume support
# Requires: bash (arrays, arithmetic), curl, jq, mktemp
# Usage:
#   chmod +x fetch_openf1_data.sh
#   ./fetch_openf1_data.sh
#===============================================================================

set -euo pipefail

BASE_URL="https://api.openf1.org/v1"
YEARS=(2023 2024 2025)

GENERAL_ENDPOINTS=(meetings sessions)
SESSION_ENDPOINTS=(drivers intervals laps pit position race_control stints team_radio weather)
# car_data & location handled specially below

mkdir -p data

for YEAR in "${YEARS[@]}"; do
  echo "=== 🌟 Season $YEAR ==="

  # --- Load or initialize checkpoint ---
  STATE_FILE="data/state_${YEAR}.json"
  if [[ -f "$STATE_FILE" ]]; then
    LAST_SESSION=$(jq -r '.last_session' "$STATE_FILE")
    echo "🔄 Resuming after session: $LAST_SESSION"
  else
    LAST_SESSION=""
    echo "🔄 No checkpoint; starting from beginning"
  fi

  # 1) Fetch general endpoints (always)
  for EP in "${GENERAL_ENDPOINTS[@]}"; do
    echo "📅 Fetching ${EP}?year=${YEAR}..."
    curl -s "${BASE_URL}/${EP}?year=${YEAR}" > "data/${EP}_${YEAR}.json"
  done

  # 2) Build ordered array of session_keys
  mapfile -t SESSIONS < <(jq -r '.[].session_key' "data/sessions_${YEAR}.json")
  echo "🔑 Sessions: ${SESSIONS[*]}"

  # 3) Determine start index: two sessions before LAST_SESSION (or 0)
  START_IDX=0
  if [[ -n "$LAST_SESSION" ]]; then
    for i in "${!SESSIONS[@]}"; do
      if [[ "${SESSIONS[i]}" == "$LAST_SESSION" ]]; then
        (( START_IDX = i - 2 < 0 ? 0 : i - 2 ))
        break
      fi
    done
  fi
  echo "🚀 Will begin at index $START_IDX (session ${SESSIONS[START_IDX]})"

  # 4) Initialize/ensure session-based files exist
  for EP in "${SESSION_ENDPOINTS[@]}"; do
    echo "✏️  Init data/${EP}_${YEAR}.json"
    [[ -f "data/${EP}_${YEAR}.json" ]] || echo "[]" > "data/${EP}_${YEAR}.json"
  done
  for EP in car_data location; do
    echo "✏️  Init data/${EP}_${YEAR}.json"
    [[ -f "data/${EP}_${YEAR}.json" ]] || echo "[]" > "data/${EP}_${YEAR}.json"
  done

  # 5) Loop through sessions, starting at START_IDX
  for (( idx = START_IDX; idx < ${#SESSIONS[@]}; idx++ )); do
    SK="${SESSIONS[idx]}"
    echo
    echo "🔄 Processing Session $SK (index $idx)"

    # a) Fetch drivers (to learn driver_numbers)
    TMP=$(mktemp)
    echo "🏁 Fetching drivers?session_key=${SK}..."
    curl -s "${BASE_URL}/drivers?session_key=${SK}" > "$TMP"
    if jq -e . "$TMP" >/dev/null 2>&1 && jq -e 'type=="array"' "$TMP" >/dev/null; then
      jq -s '.[0] + .[1]' "data/drivers_${YEAR}.json" "$TMP" > /tmp/merge && mv /tmp/merge "data/drivers_${YEAR}.json"
    else
      echo "    ⚠️  Skipped drivers: invalid or non-array JSON"
    fi
    DRIVER_NUMS=($(jq -r '.[].driver_number' "$TMP"))
    rm "$TMP"

    # b) car_data & location per driver (NDJSON fallback)
    for DN in "${DRIVER_NUMS[@]}"; do
      # car_data
      TMP=$(mktemp)
      echo "🏎️ Fetching car_data?session_key=${SK}&driver_number=${DN}..."
      curl -s "${BASE_URL}/car_data?session_key=${SK}&driver_number=${DN}" > "$TMP"
      # if not valid JSON, try slurp NDJSON into array
      if ! jq -e . "$TMP" >/dev/null 2>&1; then
        echo "    ↪️  Normal parse failed; slurping NDJSON..."
        jq -s '.' "$TMP" > "${TMP}.nd" 2>/dev/null && mv "${TMP}.nd" "$TMP"
      fi
      if jq -e 'type=="array"' "$TMP" >/dev/null; then
        jq -s '.[0] + .[1]' "data/car_data_${YEAR}.json" "$TMP" > /tmp/merge && mv /tmp/merge "data/car_data_${YEAR}.json"
      else
        echo "    ⚠️  Skipped car_data for driver $DN: not an array after slurp"
      fi
      rm "$TMP"

      # location
      TMP=$(mktemp)
      echo "📍 Fetching location?session_key=${SK}&driver_number=${DN}..."
      curl -s "${BASE_URL}/location?session_key=${SK}&driver_number=${DN}" > "$TMP"
      if ! jq -e . "$TMP" >/dev/null 2>&1; then
        echo "    ↪️  Normal parse failed; slurping NDJSON..."
        jq -s '.' "$TMP" > "${TMP}.nd" 2>/dev/null && mv "${TMP}.nd" "$TMP"
      fi
      if jq -e 'type=="array"' "$TMP" >/dev/null; then
        jq -s '.[0] + .[1]' "data/location_${YEAR}.json" "$TMP" > /tmp/merge && mv /tmp/merge "data/location_${YEAR}.json"
      else
        echo "    ⚠️  Skipped location for driver $DN: not an array after slurp"
      fi
      rm "$TMP"
    done

    # c) Other session-scoped endpoints
    for EP in "${SESSION_ENDPOINTS[@]}"; do
      TMP=$(mktemp)
      echo "⏱️ Fetching ${EP}?session_key=${SK}..."
      curl -s "${BASE_URL}/${EP}?session_key=${SK}" > "$TMP"
      if jq -e . "$TMP" >/dev/null 2>&1 && jq -e 'type==\"array\"' "$TMP" >/dev/null; then
        jq -s '.[0] + .[1]' "data/${EP}_${YEAR}.json" "$TMP" > /tmp/merge && mv /tmp/merge "data/${EP}_${YEAR}.json"
      else
        echo "    ⚠️  Skipped ${EP}: invalid or not array"
      fi
      rm "$TMP"
    done

    # d) Update checkpoint: mark this session as done
    echo "{\"last_session\":\"${SK}\"}" > "$STATE_FILE"  # persist checkpoint
    echo "✅ Completed session $SK; checkpoint updated"
  done

  echo "🎉 Completed season $YEAR"
done

echo "🏁 All seasons fetched. See data/ for JSON files."

