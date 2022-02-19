import { path } from "./deps.ts";
import { build, BuildFn, Target } from "./build.ts";
import { File, file, FileFn, files, FilesFn } from "./file.ts";
import { Rule, rule, RuleFn } from "./rule.ts";
import { generate, GenerateFn } from "./generate.ts";

export { File, Target };

interface NingenFns {
  rule: RuleFn;
  build: BuildFn;
  file: FileFn;
  files: FilesFn;
  generate: GenerateFn;
}

/**
 * Initialises Ningen.
 *
 * Returned functions are the ones to use to actually define build rules.
 *
 * @param importUrl the {@code import.meta.url} property of the calling module.
 *   Supply this to ensure that relative paths work correctly.
 */
export function init(importUrl: string): NingenFns {
  const directory = path.dirname(path.fromFileUrl(importUrl));
  const rules: Rule[] = [];
  const targets: Target[] = [];

  return {
    rule: (opts) => {
      const r = rule(opts);
      rules.push(r);
      return r;
    },
    build: (opts) => {
      const t = build(opts);
      targets.push(t);
    },
    file: (filename) => file(directory, filename),
    files: (...filenames) => files(directory, ...filenames),
    generate: (filename) =>
      generate(directory, rules, targets, filename ?? "build.ninja"),
  };
}
