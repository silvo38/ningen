import { Generator } from "./generator.ts";
import { getRuleName } from "./util.ts";

/** The definition of a Ninja rule.  */
export interface Rule {
  /** The name of the rule. */
  name: string;

  /** The command to run. Use `$in` and $out` to reference the */
  cmd: string;

  /** Description printed when the rule is being run. */
  desc?: string;

  /** Implicit deps added to every build target using this rule. */
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

  /**
   * Implicit deps needed by the build rule. These will not appear in the `$in`
   * variable in the build command, but will cause the target to be rebuilt if
   * they change.
   */
  deps?: string[];
}

/** Collects all registered rules. */
const allRules: Map<string, Rule> = new Map();

/** Defines and returns a new Ninja rule. */
export function rule(rule: Rule): Rule {
  if (allRules.has(rule.name)) {
    throw new Error(`Duplicate rule: ${rule.name}`);
  }
  // TODO: Check for dupes.
  allRules.set(rule.name, rule);
  return rule;
}

/** Collects all registered targets. */
const allTargets: Target[] = [];

/** Defines a new Ninja build target. */
export function build(target: Target) {
  const rule = getRuleName(target.rule);
  if (!allRules.has(rule)) {
    throw new Error(`Rule does not exist: ${rule}`);
  }
  // TODO: Check for dupes.
  allTargets.push(target);
}

/** Generates the build.ninja file. */
export function generate() {
  const contents = generateString();
  Deno.writeTextFileSync("build.ninja", contents);
}

/** Generates and returns the ninja build file as a string. */
export function generateString(): string {
  return new Generator(allRules, allTargets).toString();
}

/** Export globals for unit testing. */
export const EXPORT_FOR_TESTING = {
  allRules,
  allTargets,
};
