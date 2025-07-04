import { describe, it } from "@std/testing/bdd";
import { Generator } from "./generator.ts";
import { assertStrictEquals } from "@std/assert";

describe("Generator", () => {
  it("generates an empty file", () => {
    assertContents(new Generator([], [], []).toString(), "");
  });

  it("generates rule definitions", () => {
    const generator = new Generator(
      [{
        name: "myRule",
        cmd: "my-cmd $in $out",
        desc: "My description",
        pool: "console",
        deps: ["should", "not", "appear"],
        vars: { should: "1", not: "2", appear: "3" },
      }],
      [],
      [],
    );
    assertContents(
      generator.toString(),
      `
      rule myRule
        command = my-cmd $in $out
        pool = console`,
    );
  });

  it("rules are sorted by name", () => {
    const generator = new Generator(
      [
        { name: "rule2", cmd: "cmd2" },
        { name: "rule1", cmd: "cmd1" },
      ],
      [],
      [],
    );
    assertContents(
      generator.toString(),
      `
      rule rule1
        command = cmd1

      rule rule2
        command = cmd2`,
    );
  });

  it("generates build targets", () => {
    const generator = new Generator([
      { name: "foo", cmd: "cmd" },
    ], [
      { rule: "foo", srcs: ["src1", "src2"], out: ["out1", "out2"] },
    ], []);
    assertContents(
      generator.toString(),
      `
      rule foo
        command = cmd

      build out1 out2: foo src1 src2`,
    );
  });

  it("build srcs can be empty", () => {
    const generator = new Generator([
      { name: "foo", cmd: "cmd" },
    ], [
      { rule: "foo", srcs: [], out: "out", vars: { v: "1" } },
    ], []);
    assertContents(
      generator.toString(),
      `
      rule foo
        command = cmd

      build out: foo
        v = 1`,
    );
  });

  it("build target includes vars from rule and target", () => {
    const generator = new Generator([
      { name: "foo", cmd: "cmd", vars: { a: "defaultA", b: "defaultB" } },
    ], [{
      rule: "foo",
      srcs: [],
      out: "out",
      vars: { b: "overriddenB", c: "newC" },
    }], []);
    assertContents(
      generator.toString(),
      `
      rule foo
        command = cmd

      build out: foo
        a = defaultA
        b = overriddenB
        c = newC`,
    );
  });

  it("generates build targets with deps from rule and from target", () => {
    const generator = new Generator([
      { name: "foo", cmd: "cmd", deps: ["dep1", "dep3"] },
    ], [
      {
        rule: "foo",
        srcs: ["src1", "src2"],
        out: ["out1", "out2"],
        deps: ["dep2", "dep4"],
      },
    ], []);
    assertContents(
      generator.toString(),
      `
      rule foo
        command = cmd

      build out1 out2: foo src1 src2 | dep1 dep2 dep3 dep4`,
    );
  });

  it("targets are printed in order", () => {
    const generator = new Generator([
      { name: "foo", cmd: "cmd" },
    ], [
      { rule: "foo", srcs: "src2", out: "out2" },
      { rule: "foo", srcs: "src1", out: "out1" },
    ], []);
    assertContents(
      generator.toString(),
      `
      rule foo
        command = cmd

      build out2: foo src2

      build out1: foo src1`,
    );
  });

  it("generates pools", () => {
    const generator = new Generator([], [], [
      { name: "foo", depth: 2 },
    ]);
    assertContents(
      generator.toString(),
      `
      pool foo
        depth = 2`,
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
