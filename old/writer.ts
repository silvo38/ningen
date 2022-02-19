import { Rule } from "./rule.ts";
import { Target } from "./target.ts";
import { resolveRepoRelativePaths, sorted } from "./util.ts";
import { Builder } from "./builder.ts";

export class NinjaWriter {
  private readonly output: string[] = [];

  toString() {
    return this.output.join("\n");
  }

  write(builder: Builder) {
    for (const rule of sorted(builder.rules.values(), (r) => r.name)) {
      this.writeRule(rule);
    }

    this.newline();

    for (const target of builder.targets) {
      this.writeTarget(target);
    }

    this.newline();
  }

  writeRule(rule: Rule) {
    this.addLine(`rule ${rule.name}`);
    this.addLine(`command = ${rule.command}`, 1);
    if (rule.generator) {
      this.addLine(`generator = 1`, 1);
    }
    if (rule.depfile) {
      this.addLine(`depfile = ${rule.depfile}`, 1);
      this.addLine(`deps = gcc`, 1);
    }
  }

  writeTarget(target: Target) {
    const outputs = resolveRepoRelativePaths(target.outputs).join(" ");
    const inputs = resolveRepoRelativePaths(target.inputs).join(" ");
    const implicit = resolveRepoRelativePaths(target.implicit).join(" ");
    const rule = target.rule.name;

    var s = `build ${outputs}: ${rule} ${inputs}`;
    if (implicit.length > 0) {
      s += " | " + implicit;
    }
    this.addLine(s);
  }

  private newline() {
    this.output.push("");
  }

  private addLine(line: string, indent = 0) {
    this.output.push("  ".repeat(indent) + line);
  }
}
