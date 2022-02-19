// TODO: Give real deno.land URL.
import { File, init } from "../../../mod.ts";

const { rule, build, file } = init(import.meta.url);

// Define a Rule for the `append.sh` script.
const appendRule = rule({
  name: "append",
  // TODO: Need a way of getting filename for append.sh!!
  command: "$binary $in $out",
  binary: file("append.sh"),
});

// Define a helper function that invokes the rule. Exported, so other BUILD.ts
// files can use it.
export function append(src: File) {
  build({
    rule: appendRule,
    inputs: [src],
    outputs: [src.replaceExtension(".out")],
  });
}
