import { Rule } from "./rule.ts";
import {
  checkRepoRelativePath,
  requireNonEmptySrcs,
  sortedUnique,
} from "./util.ts";

export interface TargetOpts {
  rule: Rule;
  inputs: ReadonlyArray<string>;
  outputs: ReadonlyArray<string>;
  implicit?: ReadonlyArray<string>;
}

export class Target {
  readonly rule: Rule;
  readonly inputs: ReadonlyArray<string>;
  readonly outputs: ReadonlyArray<string>;
  readonly implicit: ReadonlyArray<string>;

  constructor({ rule, inputs, outputs, implicit }: TargetOpts) {
    this.rule = rule;
    this.inputs = sortedUnique(requireNonEmptySrcs(inputs, "inputs"));
    this.outputs = sortedUnique(requireNonEmptySrcs(outputs, "outputs"));
    implicit = [...(implicit ?? []), ...rule.implicit];
    this.implicit = sortedUnique(implicit);

    this.inputs.forEach((f) => checkRepoRelativePath(f));
    this.outputs.forEach((f) => checkRepoRelativePath(f));
    this.implicit.forEach((f) => checkRepoRelativePath(f));
  }
}
