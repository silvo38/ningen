import { path } from "./deps.ts";
import { File, Files } from "./file.ts";
import { Generator } from "./generate.ts";

export { File };

/** Variables usable in the shell command for a rule. */
export type Vars = Record<string, string | File>;

/** A rule definition. */
export class Rule {
  constructor(
    readonly name: string,
    readonly command: string,
    readonly binary: File | null,
    readonly srcs: Files,
    readonly description: string | null,
    readonly vars: Vars,
    readonly generator: boolean,
    /** The directory the rule was defined in. */
    readonly directory: string,
  ) {}
}

/** A build target. */
export class Target {
  constructor(
    readonly rule: Rule,
    readonly inputs: Files,
    readonly outputs: Files,
    readonly implicit: Files,
    readonly vars: Vars,
  ) {}
}

/**
 * Initialises Ningen.
 *
 * Returned functions are the ones to use to actually define build rules.
 *
 * @param importUrl the {@code import.meta.url} property of the calling module.
 *   Supply this to ensure that relative paths work correctly.
 */
export function init(importUrl: string): Ningen {
  const directory = path.dirname(path.fromFileUrl(importUrl));
  return new Ningen(directory);
}

export class Ningen {
  constructor(private readonly directory: string) {}

  rule(
    { name, command, binary, srcs, description, vars, generator }: {
      /** The name for the rule. */
      name: string;
      /** The shell command to invoke. */
      command: string;
      /**
       * An optional binary name or path to invoke. Available in the shell command
       * as a special `$binary` variable.
       */
      binary?: File;
      /** Optional implicit deps to add to build targets using this rule. */
      srcs?: Files;
      /** Optional description to print when this rule is running. */
      description?: string;
      /**
       * Optional environment variables set to their default values. These can be
       * used in the command, and can be overridden in individual build targets.
       */
      vars?: Vars;
      /** Defines this rule as a generator rule. Defaults to false. */
      generator?: boolean;
    },
  ): Rule {
    srcs = srcs ?? [];
    vars = vars ?? {};
    if (binary != null) {
      // Add bin to srcs if missing, if it's a File.
      if (typeof binary != "string" && !srcs.some((f) => f.equals(binary))) {
        srcs = [...srcs, binary];
      }
    }
    const r = new Rule(
      name,
      command,
      binary ?? null,
      srcs,
      description ?? null,
      vars,
      generator ?? false,
      this.directory,
    );
    rules.push(r);
    return r;
  }

  build(
    { rule, inputs, outputs, vars }: {
      /** The rule to invoke. */
      rule: Rule;
      /** The input files to build. */
      inputs: Files;
      /** The output files that get built. */
      outputs: Files;
      /** Variables to pass in to the rule. */
      vars?: Vars;
    },
  ): Target {
    const implicit = rule.srcs;
    vars = vars ?? {};

    const t = new Target(rule, inputs, outputs, implicit, vars);
    targets.push(t);
    return t;
  }

  /**
   * Constructs a {@link File} object from the given filename. If {@code filename}
   * is a relative path, uses {@code directory} as the root directory.
   */
  file(filename: string): File {
    if (path.isAbsolute(filename)) {
      return new File(filename);
    } else {
      return new File(path.join(this.directory, filename));
    }
  }

  /**
   * Constructs a list of {@link File} objects from the given filenames. You can
   * supply either an array of filenames, or a vararg list of filenames.
   */
  files(
    ...filenames: (string | string[])[]
  ): Files {
    if (filenames.length == 1) {
      const elem = filenames[0];
      if (typeof elem === "string") {
        // Single string.
        return [this.file(elem)];
      } else {
        // Single array of strings.
        return elem.map((f) => this.file(f));
      }
    }
    // Vararg list of (hopefully) strings. Throw if not.
    return filenames.map((f, index) => {
      if (typeof f !== "string") {
        throw new Error(
          `Expected list of strings but element at index ${index} was ${f}`,
        );
      }
      return this.file(f);
    });
  }

  generate(
    filename?: string,
  ) {
    filename = filename ?? "build.ninja";
    Deno.writeTextFileSync(filename, this.generateToString());
  }

  generateToString(): string {
    const generator = new Generator(this.directory);
    generator.write(rules, targets);
    return generator.toString();
  }

  /** Clears all defined rules and targets. Use only for testing. */
  reset() {
    rules.length = 0;
    targets.length = 0;
  }
}

// Static. Accumulated across all modules that invoke Ningen functions.
const rules: Rule[] = [];
const targets: Target[] = [];
