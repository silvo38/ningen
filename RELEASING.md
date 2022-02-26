# Releasing

Releases are deployed to deno.land: https://deno.land/x/ningen

To create a new release, just create a new tag and push it:

```sh
git tag -a 0.0.1
git push origin 0.0.1
```

Tags are immutable in deno.land, so I'm also maintaining separate branches for
each minor release, to make it easy to patch them. e.g. this branch contains all
`v0.0.x` tags:

```sh
git checkout -b 0.0
```

Use `0.0` for testing-only releases. `0.1` and onwards will be for real
releases.
