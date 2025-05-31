import type { Pool, Rule, Target, Vars } from "./mod.ts";
import { addLeadingDotSlash, sorted } from "./util.ts";
import { path } from "./deps.ts";

export class Generator {
  private readonly output: string[] = [];

  constructor(private readonly directory: string) {}

  toString() {
    return this.output.join("\n");
  }

  write(
    pools: readonly Pool[],
    rules: readonly Rule[],
    targets: readonly Target[],
  ) {
    for (const pool of sorted(pools.values(), (p) => p.name)) {
      this.writePool(pool);
      this.newline();
    }

    for (const rule of sorted(rules.values(), (r) => r.name)) {
      this.writeRule(rule);
      this.newline();
    }

    for (const target of targets) {
      this.writeTarget(target);
      this.newline();
    }

    const allTargetsAreDefault = targets.every((t) => t.isDefault);
    if (!allTargetsAreDefault) {
      targets.filter((t) => t.isDefault).forEach((t) => this.writeDefault(t));
      this.newline();
    }
  }

  writePool(pool: Pool) {
    this.addLine(`pool ${pool.name}`);
    this.addLine(`depth = ${pool.depth}`, 1);
  }

  writeRule(rule: Rule) {
    let command = rule.command;

    // Substitute $binary.
    if (rule.binary) {
      command = command.replaceAll(
        /\$binary\b/g,
        addLeadingDotSlash(rule.binary.getRelativePath(this.directory)),
      );
      if (command == rule.command) {
        throw new Error(
          `binary property defined in rule ${rule.name} but not referenced in command: ${rule.command}`,
        );
      }
    }

    // Substitute $dir.
    command = command.replaceAll(
      /\$dir\b/g,
      addLeadingDotSlash(path.relative(this.directory, rule.directory)),
    );

    this.addLine(`rule ${rule.name}`);
    this.addLine(`command = ${command}`, 1);
    this.writeVars(rule.vars);
    // if (rule.depfile) {
    //   this.addLine(`depfile = ${rule.depfile}`, 1);
    //   this.addLine(`deps = gcc`, 1);
    // }
    if (rule.description) {
      this.addLine(`description = ${rule.description}`, 1);
    }
    if (rule.generator) {
      this.addLine(`generator = 1`, 1);
    }
    if (rule.pool != null) {
      this.writePoolAssignment(rule.pool);
    }
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

    if (target.pool != null) {
      this.writePoolAssignment(target.pool);
    }

    this.writeVars(target.vars);
  }

  private writeDefault(target: Target) {
    target.outputs.map((f) => f.getRelativePath(this.directory)).forEach(
      (output) => this.addLine(`default ${output}`),
    );
  }

  private writePoolAssignment(pool: Pool | "console" | "") {
    const poolName = typeof pool == "string" ? pool : pool.name;
    this.addLine(`pool = ${poolName}`, 1);
  }

  private writeVars(vars: Vars) {
    for (const [key, value] of Object.entries(vars)) {
      if (typeof value === "string") {
        this.addLine(`${key} = ${value}`, 1);
      } else {
        this.addLine(`${key} = ${value.getRelativePath(this.directory)}`, 1);
      }
    }
  }

  private newline() {
    this.output.push("");
  }

  private addLine(line: string, indent = 0) {
    this.output.push("  ".repeat(indent) + line);
  }
}
