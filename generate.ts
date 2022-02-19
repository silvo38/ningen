import { Rule } from "./rule.ts";
import { Target } from "./build.ts";
import { sorted } from "./util.ts";

export function generate(
  directory: string,
  rules: readonly Rule[],
  targets: readonly Target[],
  filename: string,
) {
  const generator = new Generator(directory);
  generator.write(rules, targets);
  Deno.writeTextFileSync(filename, generator.toString());
}

/** Generates a ninja build file. Default filename is `build.ninja`. */
export type GenerateFn = (filename?: string) => void;

export class Generator {
  private readonly output: string[] = [];

  constructor(private readonly directory: string) {}

  toString() {
    return this.output.join("\n");
  }

  write(rules: readonly Rule[], targets: readonly Target[]) {
    for (const rule of sorted(rules.values(), (r) => r.name)) {
      this.writeRule(rule);
    }

    this.newline();

    for (const target of targets) {
      this.writeTarget(target);
    }

    this.newline();
  }

  writeRule(rule: Rule) {
    this.addLine(`rule ${rule.name}`);
    this.addLine(`command = ${rule.command}`, 1);
    // if (rule.generator) {
    //   this.addLine(`generator = 1`, 1);
    // }
    // if (rule.depfile) {
    //   this.addLine(`depfile = ${rule.depfile}`, 1);
    //   this.addLine(`deps = gcc`, 1);
    // }
  }

  writeTarget(target: Target) {
    const outputs = target.outputs.map((f) => f.getRelativePath(this.directory))
      .join(" ");
    const inputs = target.inputs.map((f) => f.getRelativePath(this.directory))
      .join(" ");
    const implicit = target.implicit.map((f) =>
      f.getRelativePath(this.directory)
    ).join(" ");
    const rule = target.rule.name;

    let s = `build ${outputs}: ${rule} ${inputs}`;
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
