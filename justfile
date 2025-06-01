test:
  deno test *.ts
  (cd example && deno test -A)

fix:
  deno fmt
  deno lint --fix
