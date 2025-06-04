#!/usr/bin/env -S deno run --allow-read --allow-write

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
  pool: "console",
});

wordCount({
  srcs: "input1.txt",
  out: "count1.out",
});

wordCount({
  srcs: "input2.txt",
  out: "count2.out",
});

// Echos the given word. Demonstrates how to use and override variables.
const echo = rule({
  name: "echo",
  cmd: "echo $name > $out",
  vars: {
    word: "foo",
  },
});

echo({
  srcs: [],
  out: "foo.out",
  // Uses default value of "foo".
});

echo({
  srcs: [],
  out: "bar.out",
  // Overrides default word to "bar".
  vars: {
    word: "bar",
  },
});

generate();
