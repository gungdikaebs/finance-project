#!/usr/bin/env bash
set -euo pipefail

umask 077

task_api_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)
task_backup_dir=${1:-"$task_api_dir/backups"}
mkdir -p "$task_backup_dir"
task_backup_dir=$(cd "$task_backup_dir" && pwd -P)

task_backup_name="nalara-$(date -u +%Y%m%dT%H%M%SZ).db"
task_backup_path="$task_backup_dir/$task_backup_name"
task_container_path="/tmp/$task_backup_name"

if [[ -e "$task_backup_path" ]]; then
  printf 'Backup sudah ada: %s\n' "$task_backup_path" >&2
  exit 1
fi

cd "$task_api_dir"
docker compose exec -T api test -s /data/finance.db
docker compose exec -T api sqlite3 /data/finance.db ".backup '$task_container_path'"

task_integrity=$(docker compose exec -T api sqlite3 "$task_container_path" 'PRAGMA integrity_check;')
if [[ "$task_integrity" != "ok" ]]; then
  printf 'Pemeriksaan integritas backup gagal: %s\n' "$task_integrity" >&2
  exit 1
fi

docker compose cp "api:$task_container_path" "$task_backup_path"
docker compose exec -T api rm -- "$task_container_path"

printf 'Backup SQLite tersimpan: %s\n' "$task_backup_path"
printf 'Salin backup ini ke lokasi lain di luar VPS dan uji pemulihannya secara berkala.\n'
