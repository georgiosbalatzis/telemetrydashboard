#!/usr/bin/env bash
#===============================================================================
# fetch_gp_data.sh — Fetch GP weekend data from OpenF1 with flexible options
#
# Usage:
#   ./fetch_gp_data.sh
#     → For seasons 2023–2025, fetch ALL GPs of each year (all sessions).
#
#   ./fetch_gp_data.sh --year 2024
#     → For 2024 only, fetch ALL GPs of that year.
#
#   ./fetch_gp_data.sh --year 2024 --gp 12
#     → For 2024 only, fetch the first 12 GPs.
#
#   ./fetch_gp_data.sh --latest
#     → Fetch the single most recent GP weekend overall.
#
#   ./fetch_gp_data.sh --latest --drivers 4 Verstappen Hamilton
#     → In latest mode, only fetch data for those two drivers.
#
#   ./fetch_gp_data.sh --year 2025 --drivers 99
#     → Fetch all drivers for that year (or GP if --gp also given).
#===============================================================================
set -euo pipefail

BASE="https://api.openf1.org/v1"
ALL_YEARS=(2023 2024 2025)
OUTDIR="data"
SESSION_EPS=(drivers intervals laps pit position race_control stints team_radio)
TELEMETRY_EPS=(car_data location)

#── parse arguments ──────────────────────────────────────────────────────────────
LATEST_MODE=false
YEAR_SPEC=""
GP_SPEC=0
DRIVERS_COUNT=0
DRIVERS_NAMES=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --latest) LATEST_MODE=true; shift ;;
    --year)   YEAR_SPEC=$2; shift 2 ;;
    --gp)     GP_SPEC=$2; shift 2 ;;
    --drivers)
      DRIVERS_COUNT=$2
      shift 2
      # collect up to DRIVERS_COUNT names if provided
      for ((i=0;i<DRIVERS_COUNT && $#>0;i++)); do
        case "$1" in --*) break ;; *) DRIVERS_NAMES+=("$1"); shift ;; esac
      done
      ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

mkdir -p "$OUTDIR"

#── safely merge two JSON arrays, log endpoint on failure ────────────────────────
merge_array(){
  local target=$1 tmp=$2 ep_label
  ep_label=$(basename "$target" .json)
  if jq -e 'type=="array"' "$tmp" >/dev/null 2>&1; then
    jq -s '.[0] + .[1]' "$target" "$tmp" > "${target}.new"
    mv "${target}.new" "$target"
  else
    echo "⚠️  Skipping invalid JSON for endpoint '$ep_label', temp file '$tmp'" >&2
  fi
}

#── fetchers ───────────────────────────────────────────────────────────────────
fetch_session_ep(){
  local ep=$1 tag=$2 sk=$3 tmp
  tmp=$(mktemp)
  curl -s "${BASE}/${ep}?session_key=${sk}" > "$tmp"
  merge_array "${OUTDIR}/${ep}_${tag}.json" "$tmp"
  rm "$tmp"
}
fetch_driver_ep(){
  local ep=$1 tag=$2 sk=$3 dn=$4 tmp
  tmp=$(mktemp)
  curl -s "${BASE}/${ep}?session_key=${sk}&driver_number=${dn}" > "$tmp"
  merge_array "${OUTDIR}/${ep}_${tag}.json" "$tmp"
  rm "$tmp"
}

#── initialize files for a tag ─────────────────────────────────────────────────
init_tag_files(){
  local tag=$1
  printf '[]' > "${OUTDIR}/sessions_${tag}.json"
  printf '[]' > "${OUTDIR}/drivers_${tag}.json"
  for ep in "${SESSION_EPS[@]}" "${TELEMETRY_EPS[@]}"; do
    printf '[]' > "${OUTDIR}/${ep}_${tag}.json"
  done
}

#── driver selection: names, count > available, or random ───────────────────────
select_drivers(){
  local tmp=$1
  IFS=$'\n' read -d '' -r -a ALL_ENTRIES < <(
    jq -r '.[] | "\(.driver_number)::\(.name)"' "$tmp" && printf '\0'
  )
  ALL_DN=(); for e in "${ALL_ENTRIES[@]}"; do ALL_DN+=( "${e%%::*}" ); done
  local total=${#ALL_DN[@]}

  if (( DRIVERS_COUNT > 0 )); then
    if (( DRIVERS_COUNT >= total )); then
      DRIVER_NUMS=( "${ALL_DN[@]}" )
      return
    fi
    if (( ${#DRIVERS_NAMES[@]} > 0 )); then
      DRIVER_NUMS=()
      for e in "${ALL_ENTRIES[@]}"; do
        dn=${e%%::*}; nm=${e#*::}
        for want in "${DRIVERS_NAMES[@]}"; do
          if [[ "${nm,,}" == *"${want,,}"* ]]; then
            DRIVER_NUMS+=( "$dn" )
          fi
        done
      done
      return
    fi
    # count < total & no names → pick that many random
    tmp_dn=( "${ALL_DN[@]}" )
    DRIVER_NUMS=()
    while (( ${#DRIVER_NUMS[@]} < DRIVERS_COUNT )); do
      idx=$(( RANDOM % ${#tmp_dn[@]} ))
      DRIVER_NUMS+=( "${tmp_dn[idx]}" )
      unset 'tmp_dn[idx]'; tmp_dn=( "${tmp_dn[@]}" )
    done
  else
    # default random 4
    tmp_dn=( "${ALL_DN[@]}" )
    local pick=4; (( pick>total )) && pick=$total
    DRIVER_NUMS=()
    while (( ${#DRIVER_NUMS[@]} < pick )); do
      idx=$(( RANDOM % ${#tmp_dn[@]} ))
      DRIVER_NUMS+=( "${tmp_dn[idx]}" )
      unset 'tmp_dn[idx]'; tmp_dn=( "${tmp_dn[@]}" )
    done
  fi
}

#── run one season ─────────────────────────────────────────────────────────────
run_year(){
  local YEAR=$1 tag=$YEAR
  echo "=== 🌟 Season $YEAR ==="
  init_tag_files "$tag"

  # meetings & meeting_keys
  curl -s "${BASE}/meetings?year=${YEAR}" > "${OUTDIR}/meetings_${YEAR}.json"
  IFS=$'\n' read -d '' -r -a MKS < <(
    jq -r 'map(select(.season!=null and .round!=null))|sort_by(.season,.round)|.[].meeting_key' \
      "${OUTDIR}/meetings_${YEAR}.json" && printf '\0'
  )
  if (( GP_SPEC>0 && GP_SPEC<${#MKS[@]} )); then
    MKS=( "${MKS[@]:0:GP_SPEC}" )
  fi

  for MK in "${MKS[@]}"; do
    echo "→ Meeting $MK"
    curl -s "${BASE}/sessions?meeting_key=${MK}" > "${OUTDIR}/sessions_${tag}.json"
    IFS=$'\n' read -d '' -r -a SESSION_KEYS < <(
      jq -r '.[].session_key' "${OUTDIR}/sessions_${tag}.json" && printf '\0'
    )
    echo "   Sessions: ${SESSION_KEYS[*]}"

    for SK in "${SESSION_KEYS[@]}"; do
      echo "  🏁 Session $SK"
      tmp=$(mktemp)
      curl -s "${BASE}/drivers?session_key=${SK}" > "$tmp"
      merge_array "${OUTDIR}/drivers_${tag}.json" "$tmp"
      select_drivers "$tmp"
      rm "$tmp"

      for DN in "${DRIVER_NUMS[@]}"; do
        for EP in "${TELEMETRY_EPS[@]}"; do
          fetch_driver_ep "$EP" "$tag" "$SK" "$DN"
        done
      done
      for EP in "${SESSION_EPS[@]}"; do
        fetch_session_ep "$EP" "$tag" "$SK"
      done
    done
  done
  echo "✅ Season $YEAR complete"
  echo
}

#── run latest GP ───────────────────────────────────────────────────────────────
run_latest(){
  echo "=== 🔥 Running in --latest mode ==="
  local tag="latest"
  init_tag_files "$tag"

  ALL_SESSIONS=$(mktemp); printf '[]' >"$ALL_SESSIONS"
  for Y in "${ALL_YEARS[@]}"; do
    tmp=$(mktemp)
    curl -s "${BASE}/sessions?year=${Y}" > "$tmp"
    merge_array "$ALL_SESSIONS" "$tmp"
    rm "$tmp"
  done

  MK=$(jq -r 'sort_by(.date//.dateStart)|last.meeting_key' "$ALL_SESSIONS")
  echo "→ Latest meeting_key: $MK"

  curl -s "${BASE}/sessions?meeting_key=${MK}" > "${OUTDIR}/sessions_${tag}.json"
  IFS=$'\n' read -d '' -r -a SESSION_KEYS < <(
    jq -r '.[].session_key' "${OUTDIR}/sessions_${tag}.json" && printf '\0'
  )
  echo "   Sessions: ${SESSION_KEYS[*]}"

  for SK in "${SESSION_KEYS[@]}"; do
    echo "  🏁 Session $SK"
    tmp=$(mktemp)
    curl -s "${BASE}/drivers?session_key=${SK}" > "$tmp"
    merge_array "${OUTDIR}/drivers_${tag}.json" "$tmp"
    select_drivers "$tmp"
    rm "$tmp"

    for DN in "${DRIVER_NUMS[@]}"; do
      for EP in "${TELEMETRY_EPS[@]}"; do
        fetch_driver_ep "$EP" "$tag" "$SK" "$DN"
      done
    done
    for EP in "${SESSION_EPS[@]}"; do
      fetch_session_ep "$EP" "$tag" "$SK"
    done
  done

  rm "$ALL_SESSIONS"
  echo "✅ Latest GP ($MK) complete"
}

#── entrypoint ────────────────────────────────────────────────────────────────
if $LATEST_MODE; then
  run_latest
else
  if [[ -n "$YEAR_SPEC" ]]; then
    run_year "$YEAR_SPEC"
  else
    for Y in "${ALL_YEARS[@]}"; do
      run_year "$Y"
    done
  fi
fi

echo "🏁 All done! JSON files in $OUTDIR/."
