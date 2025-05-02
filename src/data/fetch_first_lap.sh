#!/usr/bin/env bash
#===============================================================================
# fetch_last_race_firstlap.sh — Fetch only lap 1 data for the latest Race session
#  • No unsupported firstlap= param
#  • Full download + local jq filter for lap_number==1
#===============================================================================

set -euo pipefail

# CONFIG
YEAR=2025
BASE="https://api.openf1.org/v1"
OUTDIR="test_data_last_race_lap1"
SESSION_EPS=(drivers intervals laps pit position race_control stints team_radio weather)

mkdir -p "$OUTDIR"

echo "🔍 Fetching all sessions for ${YEAR}..."
ALL_JSON=$(curl -s "${BASE}/sessions?year=${YEAR}")

# find the most recent Race session by any of session_type/name/type
LATEST_SESSION_KEY=$(echo "$ALL_JSON" | jq -r '
  [ .[] 
    | select(
        ((.session_type // .sessionType // .type // .name)
         | ascii_downcase) == "race"
      )
  ]
  | sort_by(.date // .dateStart)
  | last
  | .session_key
')

if [[ -z "$LATEST_SESSION_KEY" || "$LATEST_SESSION_KEY" == "null" ]]; then
  echo "⚠️  Could not find a valid Race session for ${YEAR}" >&2
  exit 1
fi

echo "→ Latest Race session_key: ${LATEST_SESSION_KEY}"
echo

# 1) drivers
echo "🏁 Fetching drivers…"
curl -s "${BASE}/drivers?session_key=${LATEST_SESSION_KEY}" \
  | jq '.' \
  > "${OUTDIR}/drivers_${LATEST_SESSION_KEY}.json"

# build driver list
DRIVER_NUMS=( $(
  jq -r '.[].driver_number' "${OUTDIR}/drivers_${LATEST_SESSION_KEY}.json"
) )

# 2) car_data & location for lap 1 only
for DN in "${DRIVER_NUMS[@]}"; do
  echo "   – Telemetry (lap 1) for driver ${DN}"
  curl -s "${BASE}/car_data?session_key=${LATEST_SESSION_KEY}&driver_number=${DN}" \
    | jq '[ .[] | select(.lap_number==1) ]' \
    > "${OUTDIR}/car_data_${LATEST_SESSION_KEY}_drv${DN}_lap1.json"

  echo "   – Location (lap 1) for driver ${DN}"
  curl -s "${BASE}/location?session_key=${LATEST_SESSION_KEY}&driver_number=${DN}" \
    | jq '[ .[] | select(.lap_number==1) ]' \
    > "${OUTDIR}/location_${LATEST_SESSION_KEY}_drv${DN}_lap1.json"
done

# 3) other session endpoints:
#    "laps" already returns one object per lap, so filter it down to lap 1
for EP in "${SESSION_EPS[@]}"; do
  echo "🌐 Fetching ${EP} (lap 1)…"
  URL="${BASE}/${EP}?session_key=${LATEST_SESSION_KEY}"
  case "$EP" in
    laps)
      curl -s "$URL" \
        | jq '[ .[] | select(.lap_number==1) ]' \
        > "${OUTDIR}/${EP}_${LATEST_SESSION_KEY}_lap1.json"
      ;;
    *)
      # these endpoints are not lap-specific; just download full
      curl -s "$URL" \
        > "${OUTDIR}/${EP}_${LATEST_SESSION_KEY}.json"
      ;;
  esac
done

echo
echo "✅ Lap 1 data for session ${LATEST_SESSION_KEY} saved under '${OUTDIR}/'."
