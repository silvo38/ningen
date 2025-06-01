test:
  deno test --allow-read *.ts
  (cd example && deno test -A)

fix:
  deno fmt
  deno lint --fix

presubmit: test
  deno fmt --check
  deno lint

# Updates the version number.
bump version:
  sed -i '' -E 's|("version": ")[0-9]+\.[0-9]+\.[0-9]+"|\1{{version}}"|' deno.jsonc
  sed -i '' -E 's|(jsr:@silvo38/ningen@)[0-9]+\.[0-9]+\.[0-9]+"|\1{{version}}"|' README.md
  git commit deno.jsonc README.md -m "Release version {{version}}"

publish: presubmit
  deno publish --dry-run
  read -r -p "Press ENTER to publish:" response
  deno publish
