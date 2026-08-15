# Ningen: a simple Ninja build generator

Ningen is a build generator for [Ninja](https://ninja-build.org).

## Installation

1. Install Deno: https://deno.land
2. Install Ninja: https://ninja-build.org
3. There's no need to download or install Ningen yourself, Deno will do that for
   you.

## Getting started

To create your `BUILD.ts` file, run the following Bash script:

```sh
touch BUILD.ts
chmod +x BUILD.ts
cat <<EOF > BUILD.ts
#!/usr/bin/env -S deno run --allow-read --allow-write
import { generate, rule } from "jsr:@silvo38/ningen@0.1.1";

// Define rules here.

generate();
EOF
```

Or if you would rather copy and paste just the file contents:

```ts
#!/usr/bin/env -S deno run --allow-write
import { generate, rule } from "jsr:@silvo38/ningen@0.1.1";

// Define rules here.

generate();
```

## Defining build rules

Use the `rule()` function to define a new build rule. The `cmd` parameter will
define what command gets run to actually build the file(s). You can use the
`$in` variable to refer to input `srcs`, and the `$out` variable to refer to
output files. This is equivalent to a `rule` statement in Ninja.

You can run a build rule by using the `build()` function. This is eqivalent to a
`build` statement in Ninja. You supply it the name of the rule, as well as the
`srcs` and `out` files, which correspond to the `$in` and `$out` variables.

Alternatively, the return value of `rule()` is a function that you can call to
define a build target. It supplies the correct rule name for you, so can be more
convenient.

Here is an example:

```ts
const compile = rule({
  name: "cc",
  cmd: "gcc -c $in -o $out",
  desc: "gcc $out",
});

compile({
  srcs: "foo.c",
  out: "foo.o",
});
```

`desc` is optional, but lets you provide a shorter string when the command is
being run (it might be helpful to include `$in` or `$out` so you can tell what
file(s) are being compiled).

This generates the following `build.ninja` file:

```
rule cc
  command = gcc -c $in -o $out
  description = gcc $out

build foo.o: cc foo.c
```

## Deps

Both the `rule()` and `build()` functions accept a `deps` parameter. These are
_implicit deps_: if any of these deps change, the build rule will be rerun.
However, these deps will not appear in the `$in` variable.

You can supply the deps in either the `rule()` or `build()` functions; the
former is used for deps that are common to _every_ invocation of that rule,
whereas the latter is used for deps that are specific to that build target.

e.g. if a C file imports a header file `foo.h`, you would list `foo.h` as a dep
for the `build()` target. Whereas if a `rule` invokes a script `generate.sh`,
you would list `generate.sh` as a dep for the `rule()`, so that every build
target that uses it is rerun whenever the script is modified:

```ts
rule({
  name: "generate",
  cmd: "generate.sh $in $out",
  deps: ["generate.sh"],
});

compile({
  srcs: "bar.c",
  out: "bar.o",
  deps: ["foo.h"],
});
```

## Globs

Import the `glob()` function to glob files together or to use in for-loops:

```ts
bundle({
  srcs: glob("*.js"),
  out: "bundle.js",
});

for (const src of glob("*.c")) {
  compile({
    srcs: src,
    out: src + ".o",
  });
}
```

## Pools

You can use the `pool()` function to define a new Ninja build pool, which
controls the amount of parallelism. There is also the special `console` pool
which is predefined, which will run one build task at a time.

```ts
const myPool = pool({ name: "myPool", depth: 4 });

rule({
  name: "myRule",
  pool: myPool,
  // ...
});

rule({
  name: "expensiveMultithreadedCompilation",
  pool: "console",
  // ...
});
```

## Vars

Custom variables can be used in the `cmd` of a rule. You access them using a
dollar sign, e.g. `$foo`. You can set default values for each variable in the
rule definition, and you can override those values in each build target, e.g.:

```ts
const compile = rule({
  name: "gcc",
  cmd: "gcc $cflags -c $in -o $out",
  vars: { cflags: "-Wall -Werror" },
});

// This uses the default $cflags var.
compile({
  srcs: "foo.c",
  out: "foo.o",
});

// This overrides the $cflags var.
compile({
  srcs: "bar.c",
  out: "bar.o",
  vars: { cflags: "-Wall" },
});
```

## Generating the `build.ninja` file

Make sure you call `generate()` at the end of your file! This will generate the
`build.ninja` file. You need to run the `ninja` command yourself.

## Development notes

### Publishing

Bump the version number using `deno bump-version`, e.g.
`deno bump-version patch`. Then manually update this `README.md` file to use the
new version number.

Before creating the git commit, check that everything works using

```sh
just presubmit
```

If that works, commit to the git repo:

```sh
jj commit -m "Release version x.y.z"
```

and then publish via `just publish`.
