import { checkRepoRelativePath, sortedUnique } from "./util.ts";

export interface RuleOpts {
  /** The name for the rule in the generated ninja file. */
  name: string;

  /** The command to run. */
  command: string;

  /**
   * Specifies that the rule is used to generate the ninja build file. Defaults
   * to false.
   */
  generator?: boolean;

  /**
   * Optional implicit inputs that will be added to every build target that uses
   * the rule, e.g. you might put the executable used in the command here, or a
   * shell script for it, etc.
   */
  implicit?: string[];

  /** Optional path for a generated gcc-style depfile produced by the rule. */
  depfile?: string;
}

export class Rule {
  readonly name: string;
  readonly command: string;
  readonly implicit: ReadonlyArray<string>;
  readonly generator: boolean;
  readonly depfile?: string;

  constructor({ name, command, implicit, generator, depfile }: RuleOpts) {
    this.name = name;
    this.command = command;
    this.generator = generator ?? false;
    this.implicit = sortedUnique(implicit ?? []);
    this.depfile = depfile;

    this.implicit.forEach((f) => checkRepoRelativePath(f));
  }
}
