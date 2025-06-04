import type { Pool, Rule, Target, Vars } from "./mod.ts";
import { getRuleName, sorted } from "./util.ts";

/** Generates a ninja build file. */
export class Generator {
  private readonly output: string[] = [];
  private readonly rules: ReadonlyMap<string, Rule>;
  private readonly pools: ReadonlyMap<string, Pool>;

  constructor(
    rules: readonly Rule[] | ReadonlyMap<string, Rule>,
    private readonly targets: readonly Target[],
    pools: readonly Pool[] | ReadonlyMap<string, Pool>,
  ) {
    this.rules = toMap(rules);
    this.pools = toMap(pools);

    for (const pool of sorted(this.pools.values(), (pool) => pool.name)) {
      this.writePool(pool);
      this.newline();
    }
    for (const rule of sorted(this.rules.values(), (rule) => rule.name)) {
      this.writeRule(rule);
      this.newline();
    }
    for (const target of targets) {
      this.writeTarget(target);
      this.newline();
    }
  }

  toString() {
    return this.output.join("\n");
  }

  private writePool(pool: Pool) {
    this.addLine(`pool ${pool.name}`);
    this.addLine(`depth = ${pool.depth}`, 1);
  }

  private writeRule(rule: Rule) {
    // TODO: Escaping.
    this.addLine(`rule ${rule.name}`);
    this.addLine(`command = ${rule.cmd}`, 1);
    if (rule.pool) {
      const poolName = rule.pool === "console" ? "console" : rule.pool.name;
      this.addLine(`pool = ${poolName}`, 1);
    }
  }

  private writeTarget(target: Target) {
    // TODO: Escaping.
    // TODO: Add implicit deps from Rule.
    const rule = this.getRule(target.rule);
    const inputs = toStringArray(target.srcs).join(" ");
    const outputs = toStringArray(target.out).join(" ");

    // Collect deps from both the target and the rule.
    const deps = [];
    if (rule.deps) {
      deps.push(...rule.deps);
    }
    if (target.deps) {
      deps.push(...target.deps);
    }
    deps.sort();

    let line = `build ${outputs}: ${rule.name}`;
    if (inputs) {
      line += ` ${inputs}`;
    }
    if (deps.length > 0) {
      line += " | " + deps.join(" ");
    }
    this.addLine(line);

    if (rule.vars || target.vars) {
      this.writeVars({ ...rule.vars, ...target.vars });
    }
  }

  private writeVars(vars: Vars) {
    for (const key of sorted(Object.keys(vars))) {
      const value = vars[key];
      this.addLine(`${key} = ${value}`, 1);
    }
  }

  private getRule(rule: string | Rule): Rule {
    rule = getRuleName(rule);
    const result = this.rules.get(rule);
    if (!result) {
      throw new Error(`Missing rule: ${rule}`);
    }
    return result;
  }

  private newline() {
    this.output.push("");
  }

  private addLine(line: string, indent = 0) {
    this.output.push("  ".repeat(indent) + line);
  }
}

/**
 * Returns the given value as a string array. A string input is converted to an
 * array with a single element.
 */
function toStringArray(value: string | readonly string[]): readonly string[] {
  if (typeof value === "string") {
    return [value];
  } else {
    return value;
  }
}

/**
 * Returns the given value as a map. If the input is a map, it is returned
 * directly. If it is an array, it is converted to a map using the `name` field
 * as a key.
 */
function toMap<T extends { name: string }>(
  value: readonly T[] | ReadonlyMap<string, T>,
): ReadonlyMap<string, T> {
  if (value instanceof Map) {
    return value;
  }
  const map = new Map();
  for (const element of value as readonly T[]) {
    map.set(element.name, element);
  }
  return map;
}
