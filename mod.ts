export { glob } from "./glob.ts";

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

  /** Optional build pool in which this rule should be run. */
  pool?: "console" | Pool;
}

/** The definition of a Ninja build target. */
export interface Target {
  /** The name of the rule used to build the target. */
  rule: string;

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

/** The definition of a Ninja build pool. */
export interface Pool {
  name: string;
  depth: number;
}

/** A target definition, with an implicit rule. */
export type TargetDef = Omit<Target, "rule">;

/** A function which will add a build target, using a predetermined rule. */
export type BuildFn = (targetDef: TargetDef) => void;

/** Collects all registered rules. */
const allRules: Map<string, Rule> = new Map();

/**
 * Defines a new Ninja rule. The returned value is a function which, when
 * invoked, will create a new build target using the rule.
 */
export function rule(rule: Rule): BuildFn {
  if (allRules.has(rule.name)) {
    throw new Error(`Duplicate rule: ${rule.name}`);
  }
  // TODO: Check for dupes.
  allRules.set(rule.name, rule);

  // Return a function which binds the rule name for you.
  return (targetDef) => build({ rule: rule.name, ...targetDef });
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

/** Collects all registered pools. */
const allPools: Map<string, Pool> = new Map();

/** Defines a new Ninja build pool. */
export function pool(pool: Pool) {
  if (pool.name === "console") {
    throw new Error(`The console pool cannot be redefined`);
  }
  if (allPools.has(pool.name)) {
    throw new Error(`Duplicate pool: ${pool.name}`);
  }
  allPools.set(pool.name, pool);
}

/** Generates the build.ninja file. */
export function generate() {
  const contents = new Generator(allRules, allTargets, allPools).toString();
  Deno.writeTextFileSync("build.ninja", contents);
}

/** Export globals for unit testing. */
export const EXPORT_FOR_TESTING = {
  allRules,
  allTargets,
  allPools,
};
