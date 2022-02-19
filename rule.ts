import { File, Files } from "./file.ts";

export type RuleFn = (
  opts: {
    name: string;
    command: string;
    binary?: File;
    srcs?: Files;
    vars?: Vars;
  },
) => Rule;

/** Variables usable in the shell command for a rule. */
export type Vars = Record<string, string | File>;

export class Rule {
  constructor(
    readonly name: string,
    readonly command: string,
    readonly binary: File | null,
    readonly srcs: Files,
    readonly vars: Vars,
  ) {}
}

export function rule(
  { name, command, binary, srcs, vars }: {
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
    /**
     * Optional environment variables set to their default values. These can be
     * used in the command, and can be overridden in individual build targets.
     */
    vars?: Vars;
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
  return new Rule(name, command, binary ?? null, srcs, vars);
}
