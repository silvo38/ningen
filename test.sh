#!/bin/bash
# Presubmit script
set -e

deno test --allow-read "$@"
deno fmt --check

(cd examples/simple && ./test.sh)
(cd examples/nested && ./test.sh)
