import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.88.0/testing/asserts.ts";
import { EmptyListError, NotARepoPathError } from "./errors.ts";
import { Rule } from "./rule.ts";
import { Target } from "./target.ts";

const testRule = new Rule({
  name: "ttt",
  command: "ttt -o $out $in",
});

Deno.test("Target: throws when inputs are empty", () => {
  assertThrows(
    () => new Target({ rule: testRule, inputs: [], outputs: ["//o"] }),
    EmptyListError,
    "inputs",
  );
});

Deno.test("Target: throws when outputs are empty", () => {
  assertThrows(
    () => new Target({ rule: testRule, inputs: ["//i"], outputs: [] }),
    EmptyListError,
    "outputs",
  );
});

Deno.test("Target: sorts inputs, outputs, implicit", () => {
  const target = new Target({
    rule: testRule,
    inputs: ["//c", "//b", "//a"],
    outputs: ["//z", "//y", "//x"],
    implicit: ["//3", "//2", "//1"],
  });

  assertEquals(target.inputs, ["//a", "//b", "//c"]);
  assertEquals(target.outputs, ["//x", "//y", "//z"]);
  assertEquals(target.implicit, ["//1", "//2", "//3"]);
});

Deno.test("Target: dedupes inputs, outputs, implicit", () => {
  const target = new Target({
    rule: testRule,
    inputs: ["//a", "//a"],
    outputs: ["//b", "//b"],
    implicit: ["//c", "//c"],
  });

  assertEquals(target.inputs, ["//a"]);
  assertEquals(target.outputs, ["//b"]);
  assertEquals(target.implicit, ["//c"]);
});

Deno.test("Target: adds implicit inputs from rule", () => {
  const r = new Rule({ name: "r", command: "c", implicit: ["//i2", "//i1"] });

  const target = new Target({
    rule: r,
    inputs: ["//a"],
    outputs: ["//b"],
    implicit: ["//i3", "//i2"],
  });

  assertEquals(target.inputs, ["//a"]);
  assertEquals(target.outputs, ["//b"]);
  assertEquals(target.implicit, ["//i1", "//i2", "//i3"]);
});

Deno.test("Target: requires repo-relative paths", () => {
  assertThrows(() => {
    new Target({
      rule: testRule,
      inputs: ["a"],
      outputs: ["//b"],
      implicit: ["//i"],
    });
  }, NotARepoPathError);

  assertThrows(() => {
    new Target({
      rule: testRule,
      inputs: ["//a"],
      outputs: ["b"],
      implicit: ["//i"],
    });
  }, NotARepoPathError);

  assertThrows(() => {
    new Target({
      rule: testRule,
      inputs: ["//a"],
      outputs: ["//b"],
      implicit: ["i"],
    });
  }, NotARepoPathError);
});
