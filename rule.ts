import { Files } from "./file.ts";

/**
 * Defines a rule. {@code srcs} is an optional list of implicit input files.
 */
export type RuleFn = (
  { name, command, srcs }: { name: string; command: string; srcs?: Files },
) => Rule;

export class Rule {
  constructor(
    readonly name: string,
    readonly command: string,
    readonly srcs: Files,
  ) {}
}

export function rule(
  { name, command, srcs }: { name: string; command: string; srcs?: Files },
): Rule {
  return new Rule(name, command, srcs ?? []);
}
