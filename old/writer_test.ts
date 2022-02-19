import { assertEquals } from "https://deno.land/std@0.88.0/testing/asserts.ts";
import { Target } from "./target.ts";
import { Rule } from "./rule.ts";
import { NinjaWriter } from "./writer.ts";
import { Builder } from "./builder.ts";

const testRule = new Rule({
  name: "ttt",
  command: "ttt -o $out $in",
});

Deno.test("NinjaWriter: writeRule", () => {
  const writer = new NinjaWriter();

  writer.writeRule(new Rule({ name: "rrr", command: "cmd goes here" }));

  assertEquals(
    writer.toString(),
    `rule rrr
  command = cmd goes here`,
  );
});

Deno.test("NinjaWriter: writeRule: generator", () => {
  const writer = new NinjaWriter();

  writer.writeRule(
    new Rule({ name: "rrr", command: "cmd goes here", generator: true }),
  );

  assertEquals(
    writer.toString(),
    `rule rrr
  command = cmd goes here
  generator = 1`,
  );
});

Deno.test("NinjaWriter: writeRule: depfile", () => {
  const writer = new NinjaWriter();

  writer.writeRule(
    new Rule({ name: "rrr", command: "cmd", depfile: "$out.d" }),
  );

  assertEquals(
    writer.toString(),
    `rule rrr
  command = cmd
  depfile = $out.d
  deps = gcc`,
  );
});

Deno.test("NinjaWriter: writeTarget: single input and output", () => {
  const writer = new NinjaWriter();

  writer.writeTarget(
    new Target({ rule: testRule, inputs: ["//i"], outputs: ["//o"] }),
  );

  assertEquals(writer.toString(), `build o: ttt i`);
});

Deno.test("NinjaWriter: writeTarget: multiple inputs and outputs", () => {
  const writer = new NinjaWriter();

  writer.writeTarget(
    new Target({
      rule: testRule,
      inputs: ["//i1", "//i2"],
      outputs: ["//o1", "//o2"],
    }),
  );

  assertEquals(writer.toString(), `build o1 o2: ttt i1 i2`);
});

Deno.test("NinjaWriter: writeTarget: with implicit inputs", () => {
  const writer = new NinjaWriter();

  writer.writeTarget(
    new Target({
      rule: testRule,
      inputs: ["//i"],
      outputs: ["//o"],
      implicit: ["//x1", "//x2"],
    }),
  );

  assertEquals(writer.toString(), `build o: ttt i | x1 x2`);
});

Deno.test("NinjaWriter: write", () => {
  const builder = Builder.create();
  const r1 = builder.rule({ name: "r1", command: "c1" });
  builder.build({ rule: r1, inputs: ["i1"], outputs: ["o1"] });
  const r2 = builder.rule({ name: "r2", command: "c2" });
  builder.build({ rule: r2, inputs: ["i2"], outputs: ["o2"] });
  const r3 = builder.rule({ name: "r3", command: "c3" });
  builder.build({ rule: r3, inputs: ["i3"], outputs: ["o3"] });

  const writer = new NinjaWriter();
  writer.write(builder);

  assertEquals(
    writer.toString(),
    `
rule r1
  command = c1
rule r2
  command = c2
rule r3
  command = c3

build o1: r1 i1
build o2: r2 i2
build o3: r3 i3
`.trimLeft(),
  );
});

Deno.test("NinjaWriter: write: rules written in sorted order", () => {
  const builder = Builder.create();
  builder.rule({ name: "rrr2", command: "cmd goes here" });
  builder.rule({ name: "rrr1", command: "cmd goes here" });

  const writer = new NinjaWriter();
  writer.write(builder);

  assertEquals(
    writer.toString(),
    `
rule rrr1
  command = cmd goes here
rule rrr2
  command = cmd goes here

`.trimLeft(),
  );
});

Deno.test("NinjaWriter: write: targets written in original order", () => {
  const builder = Builder.create();
  const r = builder.rule({
    name: "ttt",
    command: "ttt",
  });
  builder.build({ rule: testRule, inputs: ["i3"], outputs: ["o3"] });
  builder.build({ rule: testRule, inputs: ["i2"], outputs: ["o2"] });
  builder.build({ rule: testRule, inputs: ["i1"], outputs: ["o1"] });

  const writer = new NinjaWriter();
  writer.write(builder);

  assertEquals(
    writer.toString(),
    `
rule ttt
  command = ttt

build o3: ttt i3
build o2: ttt i2
build o1: ttt i1
`.trimLeft(),
  );
});
