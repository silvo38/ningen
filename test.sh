#!/bin/bash
# Presubmit script
set -e

deno test "$@"
deno fmt --check

(cd examples/simple && ./test.sh)
(cd examples/nested && ./test.sh)
