# Ningen: a simple Ninja build generator

Ningen is a work-in-progress build generator for
[Ninja](https://ninja-build.org).

With Ningen, you define your Ninja build targets and rules using a simple
TypeScript API, and it generates a `build.ninja` file for you. The build files
are just regular TypeScript files, run with [Deno](https://deno.land), so you're
free to extend them and make them as complex and powerful as you need to.

## Installation

1. Install Deno: https://deno.land
2. Install Ninja: https://ninja-build.org
3. There's no need to download or install Ningen yourself, Deno will do that for
   you.

## Getting started

**TODO:** Update these instructions when the new API works.

(Also take a look at the [examples](examples/) folder.)

1. Define a `BUILD.ts` file at the root of your repo. This file will define the
   build rules for your entire project. Make it executable:

   ```
   chmod +x BUILD.ts
   ```

2. Add this shebang line so that executing `BUILD.ts` will run it with Deno:

   ```
   #!/usr/bin/env -S deno run --allow-read --allow-write --unstable
   ```

3. Import the `root` function from Ningen, and add the following skeleton:

   ```typescript
   import { root } from "https://gitlab.com/silvo/ningen/-/raw/master/mod.ts";

   root((ng) => {
     // Rules and targets go here.

     ng.generate();
   });
   ```

   The `root` function will pass a `Builder` instance (conventionally called
   `ng`, short for "ningen") to its callback. That builder lets you define Ninja
   rules and targets. The Ningen API for those looks very similar to the Ninja
   syntax.

   Be sure to call the `generate` method at the very end to generate the
   `build.ninja` file. By default it will define a generator rule called
   `ningen` that will cause Ninja to regenerate the `build.ninja` file if the
   `BUILD.ts` file changes (this behaviour can be overridden).

4. Define Ninja rules using the `rule` method. e.g. this rule invokes a shell
   script called `append.sh`:

   ```typescript
   const appendRule = ng.rule({
     name: "append",
     command: "./append.sh $in $out",
     implicit: ["append.sh"],
   });
   ```

   The `implicit` argument does not have an equivalent in Ninja. It lets you
   list files in the rule itself that will be added as implicit inputs to any
   targets that use the rule. e.g. in the example above, if the `append.sh`
   script is modified, everything that uses the `append` rule will be rebuilt.

5. Define Ninja build targets using the `build` method:

   ```typescript
   ng.build({
     rule: appendRule,
     inputs: ["file.txt"],
     outputs: ["file.txt.out"],
   });
   ```

6. You can define helper functions too, which is helpful when you have lots of
   files:

   ```typescript
   function append(src) {
     ng.build({
       rule: appendRule,
       inputs: [src],
       outputs: [src + ".out"],
     });
   }

   append("file1.txt");
   append("file2.txt");
   append("file3.txt");
   ```

7. The `glob` method lets you easily operate over many files:

   ```typescript
   function append(src) {
     ng.build({
       rule: appendRule,
       inputs: [src],
       outputs: [src + ".out"],
     });
   }

   ng.glob("*.txt").forEach((src) => append(src));
   ```

   You can also use globs directly in calls to `build`:

   ```typescript
   ng.build({
     rule: appendRule,
     inputs: ng.glob("*.txt"),
     outputs: ["everything.out"],
   });
   ```

## Design notes

### Relative files, //-paths, absolute paths, etc.

The only way to get relative paths to work is to use `meta.import.url`. But that
gives you a `file://` url, e.g.
`file:///home/silvo/code/ningen/example/BUILD.ts`.

Resolving everything to an absolute path would work. Maybe that's the best idea?

```ts
const appendRule = rule({
  name: "append",
  command: "./append.sh $in $out",
  srcs: files("append.sh"),
});
```

How to get `./append.sh` to execute in the right directory? Maybe needs a
`cd {dir} && ...` at the start of the command? Yuck.
