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

/** Collects all registered rules. */
const allRules: Rule[] = [];

/** Defines and returns a new Ninja rule. */
export function rule(rule: Rule): Rule {
  allRules.push(rule);
  return rule;
}

/** Writes the ninja build file. */
export function generate() {
}
