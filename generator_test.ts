import { beforeEach, describe, it } from "@std/testing/bdd";
import { Generator } from "./generator.ts";
import { assertStrictEquals } from "@std/assert";

describe("Generator", () => {
  let generator: Generator;

  beforeEach(() => {
    generator = new Generator();
  });

  it("generates an empty file", () => {
    assertContents(generator.toString(), "");
  });

  it("generates a basic rule", () => {
    generator.writeRule({
      name: "myRule",
      cmd: "my-cmd $in $out",
    });
    assertContents(
      generator.toString(),
      `
      rule myRule
        command = my-cmd $in $out`,
    );
  });

  it("rules are sorted by name", () => {
    generator.write({
      rules: [
        { name: "rule2", cmd: "cmd2" },
        { name: "rule1", cmd: "cmd1" },
      ],
      targets: [],
    });
    assertContents(
      generator.toString(),
      `
      rule rule1
        command = cmd1

      rule rule2
        command = cmd2`,
    );
  });

  it("targets are printed in order", () => {
    generator.write({
      targets: [
        { rule: "rule2", srcs: "src2", out: "out2" },
        { rule: "rule1", srcs: "src1", out: "out1" },
      ],
      rules: [],
    });
    assertContents(
      generator.toString(),
      `
      build out2: rule2 src2

      build out1: rule1 src1`,
    );
  });
});

function assertContents(actual: string, expected: string) {
  const lines = expected.split("\n");
  const firstLine = lines[0].trim() ? lines[0] : lines[1] ?? "";
  let numSpaces = 0;
  for (; numSpaces < firstLine.length; numSpaces++) {
    if (firstLine[numSpaces] !== " ") {
      break;
    }
  }
  expected = lines.map((line) => line.substring(numSpaces)).join("\n");
  expected = expected.trim();
  actual = actual.trim();
  assertStrictEquals(actual, expected);
}
