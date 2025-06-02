import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals, assertThrows } from "@std/assert";
import { build, EXPORT_FOR_TESTING, pool, rule } from "./mod.ts";

const { allRules, allTargets, allPools } = EXPORT_FOR_TESTING;

describe("Ningen", () => {
  beforeEach(() => {
    allRules.clear();
    allTargets.length = 0;
    allPools.clear();
  });

  it("can add a new rule", () => {
    rule({ name: "foo", cmd: "cmd" });
    assertEquals(allRules.get("foo"), { name: "foo", cmd: "cmd" });
  });

  it("the return value of a rule can create build targets", () => {
    const myRule = rule({ name: "foo", cmd: "cmd" });
    myRule({ srcs: "srcs1", out: "out1" });
    myRule({ srcs: "srcs2", out: "out2" });
    assertEquals(allTargets, [
      { out: "out1", rule: "foo", srcs: "srcs1" },
      { out: "out2", rule: "foo", srcs: "srcs2" },
    ]);
  });

  it("throws when added duplicate rule", () => {
    rule({ name: "foo", cmd: "foo1" });
    assertThrows(
      () => rule({ name: "foo", cmd: "foo2" }),
      Error,
      "Duplicate rule: foo",
    );
  });

  it("can add a new build target", () => {
    rule({ name: "foo", cmd: "cmd" });
    const target = { rule: "foo", srcs: "srcs", out: "out" };
    build(target);
    assertEquals(allTargets, [target]);
  });

  it("throws when adding target with unknown rule", () => {
    assertThrows(
      () =>
        build({
          rule: "foo",
          srcs: "srcs",
          out: "out",
        }),
      Error,
      "Rule does not exist: foo",
    );
  });

  it("can add a new pool", () => {
    pool({ name: "foo", depth: 2 });
    assertEquals(allPools.get("foo"), { name: "foo", depth: 2 });
  });

  it("throws when adding a duplicate pool", () => {
    pool({ name: "foo", depth: 2 });
    assertThrows(
      () => pool({ name: "foo", depth: 2 }),
      Error,
      "Duplicate pool: foo",
    );
  });

  it("throws when adding a console pool", () => {
    assertThrows(
      () => pool({ name: "console", depth: 1 }),
      Error,
      "The console pool cannot be redefined",
    );
  });
});
