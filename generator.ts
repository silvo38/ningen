import type { Rule } from "./mod.ts";
import { sorted } from "./util.ts";

/** Generates a ninja build file. */
export class Generator {
  private readonly output: string[] = [];

  toString() {
    return this.output.join("\n");
  }

  write({ rules }: { rules: readonly Rule[] }) {
    for (const rule of sorted(rules.values(), (rule) => rule.name)) {
      this.writeRule(rule);
      this.newline();
    }
  }

  writeRule(rule: Rule) {
    this.addLine(`rule ${rule.name}`);
    this.addLine(`command = ${rule.cmd}`, 1);
  }

  private newline() {
    this.output.push("");
  }

  private addLine(line: string, indent = 0) {
    this.output.push("  ".repeat(indent) + line);
  }
}
