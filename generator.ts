import type { Rule, Target } from "./mod.ts";
import { getRuleName, sorted } from "./util.ts";

/** Generates a ninja build file. */
export class Generator {
  private readonly output: string[] = [];
  private readonly rules: Map<string, Rule>;

  constructor(
    rules: readonly Rule[] | Map<string, Rule>,
    private readonly targets: readonly Target[],
  ) {
    if (rules instanceof Map) {
      this.rules = rules;
    } else {
      // Reconstruct the rules map. (This is mostly just for convenience in unit
      // tests. The prod code passes in a Map.)
      this.rules = new Map();
      for (const rule of rules) {
        this.rules.set(rule.name, rule);
      }
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

  private writeRule(rule: Rule) {
    // TODO: Escaping.
    this.addLine(`rule ${rule.name}`);
    this.addLine(`command = ${rule.cmd}`, 1);
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

    let line = `build ${outputs}: ${rule.name} ${inputs}`;
    if (deps.length > 0) {
      line += " | " + deps.join(" ");
    }
    this.addLine(line);
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
