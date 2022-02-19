import { Files } from "./file.ts";
import { Rule } from "./rule.ts";

export type BuildFn = (
  { rule, inputs, outputs }: {
    rule: Rule;
    inputs: Files;
    outputs: Files;
  },
) => void;

export class Target {
  constructor(
    readonly rule: Rule,
    readonly inputs: Files,
    readonly outputs: Files,
    readonly implicit: Files,
  ) {}
}

export function build(
  { rule, inputs, outputs }: {
    rule: Rule;
    inputs: Files;
    outputs: Files;
  },
): Target {
  const implicit = rule.srcs;
  return new Target(rule, inputs, outputs, implicit);
}
