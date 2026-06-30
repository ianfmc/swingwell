#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: publish_dashboard_s3.sh <bucket-name> [--profile PROFILE] [--region REGION] [--configure-website] [--delete-dashboard-root]

Publishes:
  Dashboard/      -> s3://<bucket>/
  Diary Entries/  -> s3://<bucket>/Diary Entries/
  Media/          -> s3://<bucket>/Media/
USAGE
}

if [[ $# -lt 1 ]]; then
  usage
  exit 2
fi

BUCKET="$1"
shift

AWS_ARGS=()
CONFIGURE_WEBSITE=0
DELETE_DASHBOARD_ROOT=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --profile)
      AWS_ARGS+=(--profile "$2")
      shift 2
      ;;
    --region)
      AWS_ARGS+=(--region "$2")
      shift 2
      ;;
    --configure-website)
      CONFIGURE_WEBSITE=1
      shift
      ;;
    --delete-dashboard-root)
      DELETE_DASHBOARD_ROOT=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 2
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

if [[ "$CONFIGURE_WEBSITE" == "1" ]]; then
  aws s3 website "s3://$BUCKET" \
    --index-document index.html \
    --error-document index.html \
    ${AWS_ARGS[@]+"${AWS_ARGS[@]}"}
fi

DASHBOARD_DELETE_ARGS=()
if [[ "$DELETE_DASHBOARD_ROOT" == "1" ]]; then
  DASHBOARD_DELETE_ARGS+=(--delete)
fi

aws s3 sync "$ROOT/Dashboard/" "s3://$BUCKET/" \
  --exclude ".DS_Store" \
  ${DASHBOARD_DELETE_ARGS[@]+"${DASHBOARD_DELETE_ARGS[@]}"} \
  ${AWS_ARGS[@]+"${AWS_ARGS[@]}"}

aws s3 sync "$ROOT/Diary Entries/" "s3://$BUCKET/Diary Entries/" \
  --exclude ".DS_Store" \
  ${AWS_ARGS[@]+"${AWS_ARGS[@]}"}

aws s3 sync "$ROOT/Media/" "s3://$BUCKET/Media/" \
  --exclude ".DS_Store" \
  ${AWS_ARGS[@]+"${AWS_ARGS[@]}"}

echo "Published SWINGWELL dashboard to s3://$BUCKET/"
