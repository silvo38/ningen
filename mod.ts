import * as path from "https://deno.land/std@0.126.0/path/mod.ts";

export interface NingenFns {
  rule: RuleFn;
  build: BuildFn;
  file: FileFn;
  files: FilesFn;
  generate: GenerateFn;
}

/**
 * Defines a rule. {@code srcs} is an optional list of implicit input files.
 */
export type RuleFn = (
  { name, command, srcs }: { name: string; command: string; srcs?: Files },
) => Rule;

export type BuildFn = ({ name }: { name: string }) => Build;
export type FileFn = (path: string) => File;

/**
 * Returns a list of files. Supply either a single `string[]`, or a variable
 * number of strings.
 */
export type FilesFn = (...filenames: (string | string[])[]) => Files;

export type GenerateFn = () => void;

export class Rule {
  constructor(
    readonly name: string,
    readonly command: string,
    readonly srcs: Files,
  ) {}
}

export class Build {
  private constructor() {}
}

export class File {
  constructor(readonly path: string) {}
}

export type Files = readonly File[];

/**
 * Initialises Ningen.
 *
 * Returned functions are the ones to use to actually define build rules.
 *
 * @param importUrl the {@code import.meta.url} property of the calling module.
 *   Supply this to ensure that relative paths work correctly.
 */
export function init(importUrl: string): NingenFns {
  const ng = new Ningen(importUrl);
  return {
    rule: (opts) => ng.rule(opts),
    build: () => ng.build(),
    file: (filename) => ng.file(filename),
    files: (...filenames) => ng.files(...filenames),
    generate: () => ng.generate(),
  };
}

class Ningen {
  private readonly directory: string;

  constructor(importUrl: string) {
    this.directory = path.dirname(path.fromFileUrl(importUrl));
  }

  rule(
    { name, command, srcs }: { name: string; command: string; srcs?: Files },
  ): Rule {
    return new Rule(name, command, srcs ?? []);
  }

  build(): Build {
    throw new Error("Not implemented");
  }

  file(filename: string): File {
    if (path.isAbsolute(filename)) {
      return new File(filename);
    } else {
      return new File(path.join(this.directory, filename));
    }
  }

  files(...filenames: (string | string[])[]): Files {
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

  generate() {
    throw new Error("Not implemented");
  }
}
