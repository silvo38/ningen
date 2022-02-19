#!/usr/bin/env -S deno run --allow-read --allow-write --unstable
// The shebang above lets you execute this BUILD.ts file directly.

// TODO: Give real deno.land URL.
import { File, init, Target } from "../mod.ts";

// Initialises Ningen and retrieves the functions for defining rules and build
// targets.
const { build, rule, file, files, generate } = init(import.meta.url);

// Define a Rule for the `append.sh` script.
const appendRule = rule({
  name: "append",
  command: "./append.sh $in $out",
  srcs: files("append.sh"),
});

// Define a helper function that invokes the rule.
function append(src: File) {
  build({
    rule: appendRule,
    inputs: [src],
    outputs: [src.withSuffix(".out")],
  });
}

// Process a file.
append(file("abc.txt"));

// Write the build.ninja file. Can override the output file if you like.
generate();
