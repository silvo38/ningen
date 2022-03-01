#!/usr/bin/env -S deno run --allow-read --allow-write
// The shebang above lets you execute this BUILD.ts file directly.

// Import nested BUILD.ts files for side-effects.
import "./subdir/BUILD.ts";

// In your own code, use:
// import { init } from "https://deno.land/x/ningen@0.0.5/mod.ts";
import { init } from "../../mod.ts";

// Initialises Ningen and retrieves the functions for defining rules and build
// targets.
const ng = init(import.meta.url);

// Write the build.ninja file. Can override the output file if you like.
ng.generate({
  inputs: ng.glob("**/*.ts"),
});
