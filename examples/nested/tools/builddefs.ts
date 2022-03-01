// In your own code, use:
// import { File, init } from "https://deno.land/x/ningen@0.0.5/mod.ts";
import { File, init } from "../../../mod.ts";

const ng = init(import.meta.url);

// Define a Rule for the `append.sh` script.
const appendRule = ng.rule({
  name: "append",
  command: "$binary $in $out",
  binary: ng.file("append.sh"),
  description: "Appending text",
});

// Define a helper function that invokes the rule. Exported, so other BUILD.ts
// files can use it.
export function append(src: File) {
  ng.build({
    rule: appendRule,
    inputs: [src],
    outputs: [src.replaceExtension(".out")],
  });
}
