test:
  deno test --allow-read *.ts
  (cd example && deno test -A)

fix:
  deno fmt
  deno lint --fix

presubmit: test
  deno fmt --check
  deno lint
  deno publish --dry-run --allow-dirty

publish: presubmit
  deno publish --dry-run
  read -r -p "Press ENTER to publish:" response
  deno publish
