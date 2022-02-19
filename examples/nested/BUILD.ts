#!/usr/bin/env -S deno run --allow-read --allow-write --unstable
// The shebang above lets you execute this BUILD.ts file directly.

// Import nested BUILD.ts files for side-effects.
import "./subdir/BUILD.ts";

// TODO: Give real deno.land URL.
import { init } from "../../mod.ts";

// Initialises Ningen and retrieves the functions for defining rules and build
// targets.
const { generate } = init(import.meta.url);

// Write the build.ninja file. Can override the output file if you like.
generate();
