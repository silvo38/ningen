#!/usr/bin/env -S deno run --allow-read --allow-write --unstable
// The shebang above lets you execute this BUILD.ts file directly.

// In your own code, use:
// import { File, init } from "https://deno.land/x/ningen@0.0.6/mod.ts";
import { File, init } from "../../mod.ts";

// Initialises Ningen and retrieves the functions for defining rules and build
// targets.
const ng = init(import.meta.url);

// Define a Rule for the `append.sh` script.
const appendRule = ng.rule({
  name: "append",
  command: "./append.sh $in $out",
  srcs: ng.files("append.sh"),
  description: "Appending text",
});

// Define a helper function that invokes the rule.
function append(src: File) {
  ng.build({
    rule: appendRule,
    inputs: [src],
    outputs: [src.replaceExtension(".out")],
  });
}

// Process a file.
append(ng.file("foo.txt"));

// Write the build.ninja file. Can override the output file if you like.
ng.generate();
