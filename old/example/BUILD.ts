#!/usr/bin/env -S deno run --allow-read --allow-write --unstable
// The shebang above lets you execute this BUILD.ts file directly.

// In your own code, import from:
// "https://gitlab.com/silvo/ningen/-/raw/master/mod.ts" .
import { root, Target } from "../mod.ts";

root((ng) => {
  const appendRule = ng.rule({
    name: "append",
    command: "./append.sh $in $out",
    implicit: ["append.sh"],
  });

  function append(src: string): Target {
    return ng.build({
      rule: appendRule,
      inputs: [src],
      outputs: [src + ".out"],
    });
  }

  const processed = append("abc.txt");

  ng.generate();
});
