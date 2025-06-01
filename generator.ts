import type { Rule, Target } from "./mod.ts";
import { getTargetRuleName, sorted } from "./util.ts";

/** Generates a ninja build file. */
export class Generator {
  private readonly output: string[] = [];

  toString() {
    return this.output.join("\n");
  }

  write(
    { rules, targets }: { rules: readonly Rule[]; targets: readonly Target[] },
  ) {
    for (const rule of sorted(rules, (rule) => rule.name)) {
      this.writeRule(rule);
      this.newline();
    }
    for (const target of targets) {
      this.writeTarget(target);
      this.newline();
    }
  }

  writeRule(rule: Rule) {
    // TODO: Escaping.
    this.addLine(`rule ${rule.name}`);
    this.addLine(`command = ${rule.cmd}`, 1);
  }

  writeTarget(target: Target) {
    // TODO: Escaping.
    // TODO: Add implicit deps from Rule.
    const rule = getTargetRuleName(target);
    const inputs = toStringArray(target.srcs).join(" ");
    const outputs = toStringArray(target.out).join(" ");
    this.addLine(`build ${outputs}: ${rule} ${inputs}`);
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
