#!/usr/bin/env -S deno run --allow-read --allow-write
// The shebang above lets you execute this BUILD.ts file directly.

// Import nested BUILD.ts files for side-effects.
import "./subdir/BUILD.ts";

// In your own code, use: import { init } from "https://deno.land/x/ningen";
import { init } from "../../mod.ts";

// Initialises Ningen and retrieves the functions for defining rules and build
// targets.
const ng = init(import.meta.url);

// Optional: define a generator rule for this BUILD.ts script.
const ningenRule = ng.rule({
  name: "ningen",
  command: "$binary",
  binary: ng.file("BUILD.ts"),
  generator: true,
  description: "Regenerating ninja file",
});

ng.build({
  rule: ningenRule,
  inputs: [],
  outputs: ng.files("build.ninja"),
});

// Write the build.ninja file. Can override the output file if you like.
ng.generate();
