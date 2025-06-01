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
    generator.write({
      rules: [{
        name: "myRule",
        cmd: "my-cmd $in $out",
      }],
    });
    assertContents(
      generator.toString(),
      `
      rule myRule
        command = my-cmd $in $out`,
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
