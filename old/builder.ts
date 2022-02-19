import { Target, TargetOpts } from "./target.ts";
import { AlreadyDefinedError } from "./errors.ts";
import { Rule, RuleOpts } from "./rule.ts";
import {
  addAll,
  checkRepoRelativePath,
  isRepoRelativePath,
  resolveRepoRelativePath,
} from "./util.ts";
import { join } from "https://deno.land/std@0.88.0/path/mod.ts";
import { glob } from "./glob.ts";
import { NinjaWriter } from "./writer.ts";
import { ExpandGlobOptions } from "https://deno.land/std@0.88.0/fs/mod.ts";

export function root(builderFn: (ng: Builder) => void) {
  builderFn(Builder.create());
}

export class Builder {
  private directory = "";
  readonly rules: Map<string, Rule> = new Map();
  readonly targets: Target[] = [];
  private readonly outputs: Set<string> = new Set();

  /** Constructs a new `Builder`. */
  static create(): Builder {
    return new Builder(new Map(), [], new Set());
  }

  protected constructor(
    rules: Map<string, Rule>,
    targets: Target[],
    outputs: Set<string>,
  ) {
    this.rules = rules;
    this.targets = targets;
    this.outputs = outputs;
  }

  /**
   * Convenience method to shorten paths. Call this at the very top of a
   * `BUILD.ts` file with the path of the directory the `BUILD.ts` file is in.
   *
   * Path must be a repo-relative path (starting with `//`).
   */
  setDirectory(directory: string) {
    this.directory = resolveRepoRelativePath(directory);
  }

  /** Defines a Ninja rule. */
  rule({ name, command, implicit, generator, depfile }: RuleOpts): Rule {
    if (this.rules.has(name)) {
      throw new AlreadyDefinedError(`a rule named ${name}`);
    }
    implicit = this.resolveAll(implicit ?? []);
    const rule = new Rule({ name, command, implicit, generator, depfile });
    this.rules.set(rule.name, rule);
    return rule;
  }

  /** Defines a Ninja build target. */
  build({ rule, inputs, outputs, implicit }: TargetOpts): Target {
    inputs = this.resolveAll(inputs);
    outputs = this.resolveAll(outputs);
    implicit = this.resolveAll(implicit || []);
    for (const output of outputs) {
      if (this.outputs.has(output)) {
        throw new AlreadyDefinedError(`a build target for output '${output}'`);
      }
    }
    const target = new Target({ rule, inputs, outputs, implicit });
    this.targets.push(target);
    addAll(target.outputs, this.outputs);
    return target;
  }

  /**
   * Loads rules and targets from a builder function (e.g. from another
   * `BUILD.ts` file.)
   */
  load(builderFn: (ng: Builder) => void) {
    const generator = new Builder(this.rules, this.targets, this.outputs);
    builderFn(generator);
  }

  /**
   * Writes out the `build.ninja` file. Call this at the end of your `BUILD.ts`
   * file.
   */
  generate({ ninjaFile, regen, ningenFile }: GenerateOpts = {}) {
    ninjaFile = ninjaFile ?? defaultNinjaFile;
    regen = regen ?? true;
    ningenFile = ningenFile ?? defaultNingenFile;

    if (regen) {
      this.addRegenRule(ningenFile, ninjaFile);
    }

    const writer = new NinjaWriter();
    writer.write(this);

    this.writeFile(ninjaFile, writer.toString());
  }

  glob(expr: string, opts?: ExpandGlobOptions): string[] {
    opts = opts ? { ...opts } : {};
    if (!opts.root && this.directory) {
      opts.root = this.directory;
    }
    return glob(expr, opts);
  }

  protected writeFile(path: string, data: string) {
    Deno.writeTextFileSync(path, data);
  }

  /** Creates a rule to regenerate the ninja file. */
  private addRegenRule(ningenFile: string, ninjaFile: string) {
    const regen = this.rule({
      name: "ningen",
      command: `./${ningenFile}`,
      generator: true,
    });

    this.build({
      rule: regen,
      // TODO: Should rebuild if any BUILD.ts file changes...
      inputs: [ningenFile],
      outputs: [ninjaFile],
    });
  }

  private resolve(path: string): string {
    if (isRepoRelativePath(path)) {
      return path;
    }
    return "//" + join(this.directory, path);
  }

  private resolveAll(paths: ReadonlyArray<string>): string[] {
    return paths.map((p) => this.resolve(p));
  }
}

export interface GenerateOpts {
  /**
   * Path for where to write the ninja file, defaults to `ninja.build`.
   */
  ninjaFile?: string;

  /** Whether to emit a rule to regenerate via ningen, defaults to true. */
  regen?: boolean;

  /**
   * Path to the ningen build file that should be run when regenerating.
   * Defaults to `BUILD.ts`. Has no effect if `regen` is false.
   */
  ningenFile?: string;
}

const defaultNinjaFile = "build.ninja";
const defaultNingenFile = "BUILD.ts";
