test:
  deno test --allow-read

examples:
  (cd examples/simple && ./test.sh)
  (cd examples/nested && ./test.sh)

presubmit: test examples
  deno fmt --check
