import { path } from "./deps.ts";
import { File, Files } from "./file.ts";
import { Generator } from "./generate.ts";
import { fs } from "./deps.ts";

export { File };

/** Variables usable in the shell command for a rule. */
export type Vars = Record<string, string | File>;

/** A build pool. */
export class Pool {
  constructor(readonly name: string, readonly depth: number) {}
}

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
    readonly pool: Pool | "console" | null,
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
    readonly pool: Pool | "console" | "" | null,
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
    { name, command, binary, srcs, description, vars, generator, pool }: {
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
      /** Optional pool to use for this rule. */
      pool?: Pool | "console";
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
      pool ?? null,
    );
    rules.push(r);
    return r;
  }

  build(
    { rule, inputs, outputs, vars, pool }: {
      /** The rule to invoke. */
      rule: Rule;
      /** The input files to build. */
      inputs: Files;
      /** The output files that get built. */
      outputs: Files;
      /** Variables to pass in to the rule. */
      vars?: Vars;
      /**
       * Optional pool to use for this build target. Can supply the empty string
       * to override the default pool defined for the rule.
       */
      pool?: Pool | "";
    },
  ): Target {
    const implicit = rule.srcs;
    vars = vars ?? {};

    const t = new Target(rule, inputs, outputs, implicit, vars, pool ?? null);
    targets.push(t);
    return t;
  }

  pool({ name, depth }: { name: string; depth: number }): Pool {
    const p = new Pool(name, depth);
    pools.push(p);
    return p;
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

  /**
   * Returns all files matching the given glob. Optionally can supply other
   * globs to exclude certain paths.
   */
  glob(
    glob: string,
    { exclude, canBeEmpty }: { exclude?: string[]; canBeEmpty?: boolean } = {},
  ): Files {
    canBeEmpty = canBeEmpty ?? false;
    const results: File[] = [];
    const files = fs.expandGlobSync(glob, { root: this.directory, exclude });
    for (const file of files) {
      results.push(this.file(file.path));
    }
    if (results.length == 0 && !canBeEmpty) {
      const globDescription = [
        glob,
        ...(exclude ?? []).map((x) => `-${x}`),
      ].join(", ");
      throw new Error(`Glob expanded to empty set: ${globDescription}`);
    }
    return results;
  }

  /**
   * Imports other `BUILD.ts` files. Convenience function, if you want to
   * import other files using a glob.
   */
  async import(files: Files) {
    for (const file of files) {
      await import(file.getAbsolutePath());
    }
  }

  generate(
    filename?: string,
  ) {
    filename = filename ?? "build.ninja";
    Deno.writeTextFileSync(filename, this.generateToString());
  }

  generateToString(): string {
    const generator = new Generator(this.directory);
    generator.write(pools, rules, targets);
    return generator.toString();
  }

  /** Clears all defined rules and targets. Use only for testing. */
  reset() {
    pools.length = 0;
    rules.length = 0;
    targets.length = 0;
  }
}

// Static. Accumulated across all modules that invoke Ningen functions.
const pools: Pool[] = [];
const rules: Rule[] = [];
const targets: Target[] = [];
