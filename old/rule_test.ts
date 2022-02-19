import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.88.0/testing/asserts.ts";
import { NotARepoPathError } from "./errors.ts";
import { Rule } from "./rule.ts";

Deno.test("Rule: constructor", () => {
  const r = new Rule({ name: "rrr", command: "cmd", implicit: ["//i"] });
  assertEquals(r.name, "rrr");
  assertEquals(r.command, "cmd");
  assertEquals(r.implicit, ["//i"]);
  assertEquals(r.generator, false);
  assertEquals(r.depfile, undefined);
});

Deno.test("Rule: depfile", () => {
  const r = new Rule({ name: "rrr", command: "cmd", depfile: "$out.d" });
  assertEquals(r.depfile, "$out.d");
});

Deno.test("Rule: sorts and dedupes implicit inputs", () => {
  const r = new Rule({
    name: "rrr",
    command: "cmd",
    implicit: ["//i3", "//i2", "//i2", "//i1"],
  });
  assertEquals(r.implicit, ["//i1", "//i2", "//i3"]);
});

Deno.test("Rule: requires repo-relative implicit inputs", () => {
  assertThrows(() => {
    new Rule({
      name: "rrr",
      command: "cmd",
      implicit: ["i"],
    });
  }, NotARepoPathError);
});
