#!/usr/bin/env -S deno run --allow-write

// Example BUILD.ts file showing off some of its features. Also serves as an
// integration test.

// Replace ../mod.ts with jsr:@silvo38/ningen when using this in your own
// project. See README.md in repo root for an example.
import { generate, rule } from "../mod.ts";

// Runs the wc program to count the number of words in the input file.
const wordCount = rule({
  name: "wordcount",
  cmd: "wc $in > $out",
  desc: "Counting words",
});

wordCount({
  srcs: "input1.txt",
  out: "count1.out",
});

wordCount({
  srcs: "input2.txt",
  out: "count2.out",
});

generate();
