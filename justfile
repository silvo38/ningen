test:
  deno test --allow-read "$@"
  (cd examples/simple && ./test.sh)
  (cd examples/nested && ./test.sh)

presubmit: test
  deno fmt --check
