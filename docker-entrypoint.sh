#!/bin/sh
set -eu

drain_marker=/tmp/ddasilver-draining
drain_seconds=${DDA_SHUTDOWN_DRAIN_SECONDS:-8}
child_pid=""

rm -f "$drain_marker"

begin_shutdown() {
  trap - TERM INT
  touch "$drain_marker"
  sleep "$drain_seconds"
  if [ -n "$child_pid" ]; then
    kill -TERM "$child_pid" 2>/dev/null || true
  fi
}

trap begin_shutdown TERM INT

node server.js &
child_pid=$!
wait "$child_pid"
