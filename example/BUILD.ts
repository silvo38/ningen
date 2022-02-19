#!/usr/bin/env -S deno run --allow-read --allow-write --unstable
// The shebang above lets you execute this BUILD.ts file directly.

// TODO: Give real deno.land URL.
import { init } from "../mod.ts";

// Initialises Ningen and retrieves the functions for defining rules and build
// targets.
const { build, rule, file, generate } = init(import.meta.url);

const appendRule = rule({
  name: "append",
  command: "./append.sh $in $out",
  srcs: [file("append.sh")],
});

// function append(src: string): Target {
//   return ng.build({
//     rule: appendRule,
//     inputs: [src],
//     outputs: [src + ".out"],
//   });
// }

// const processed = append("abc.txt");

// Write the build.ninja file.
generate();
