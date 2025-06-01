/** The definition of a Ninja rule.  */
export interface Rule {
  /** The name of the rule. */
  name: string;

  /** The command to run. Use `$in` and $out` to reference the */
  cmd: string;

  /** Description printed when the rule is being run. */
  desc?: string;

  deps?: string[];
}

/** The definition of a Ninja build target. */
export interface Target {
  /** The rule used to build the target. Can be an object or the rule name. */
  rule: Rule | string;

  /** Input files needed for the build. Appears in `$in` in the command. */
  srcs: string | string[];

  /** Output files produced by the build. Appears in `$out` in the command. */
  out: string | string[];
}

/** Collects all registered rules. */
const allRules: Rule[] = [];

/** Defines and returns a new Ninja rule. */
export function rule(rule: Rule): Rule {
  // TODO: Check for dupes.
  allRules.push(rule);
  return rule;
}

/** Collects all registered targets. */
const allTargets: Target[] = [];

/** Defines a new Ninja build target. */
export function build(target: Target) {
  // TODO: Check for dupes.
  // TODO: Check rule exists.
  allTargets.push(target);
}

/** Writes the ninja build file. */
export function generate() {
}
