import { assertEquals } from "./deps.ts";
import { build } from "./build.ts";
import { rule } from "./rule.ts";
import { Generator } from "./generate.ts";
import { files } from "./file.ts";

const testRule = rule({
  name: "ttt",
  command: "ttt -o $out $in",
  srcs: [],
});

Deno.test("Generator: writeRule", () => {
  const generator = new Generator("/");

  generator.writeRule(rule({ name: "rrr", command: "cmd goes here" }));

  assertEquals(
    generator.toString(),
    `rule rrr
  command = cmd goes here`,
  );
});

// Deno.test("Generator: writeRule: generator", () => {
//   const generator = new Generator("/");

//   generator.writeRule(
//     rule({ name: "rrr", command: "cmd goes here", generator: true }),
//   );

//   assertEquals(
//     generator.toString(),
//     `rule rrr
//   command = cmd goes here
//   generator = 1`,
//   );
// });

// Deno.test("Generator: writeRule: depfile", () => {
//   const generator = new Generator("/");

//   generator.writeRule(
//     rule({ name: "rrr", command: "cmd", depfile: "$out.d" }),
//   );

//   assertEquals(
//     generator.toString(),
//     `rule rrr
//   command = cmd
//   depfile = $out.d
//   deps = gcc`,
//   );
// });

Deno.test("Generator: writeTarget: single input and output", () => {
  const generator = new Generator("/");

  generator.writeTarget(
    build({
      rule: testRule,
      inputs: files("/", "i"),
      outputs: files("/", "o"),
    }),
  );

  assertEquals(generator.toString(), `build o: ttt i`);
});

Deno.test("Generator: writeTarget: multiple inputs and outputs", () => {
  const generator = new Generator("/");

  generator.writeTarget(
    build({
      rule: testRule,
      inputs: files("/", "i1", "//i2"),
      outputs: files("/", "o1", "//o2"),
    }),
  );

  assertEquals(generator.toString(), `build o1 o2: ttt i1 i2`);
});

Deno.test("Generator: writeTarget: with implicit inputs", () => {
  const r = rule({ name: "r", command: "c", srcs: files("/", "x1", "x2") });
  const generator = new Generator("/");

  generator.writeTarget(
    build({
      rule: r,
      inputs: files("/", "i"),
      outputs: files("/", "o"),
    }),
  );

  assertEquals(generator.toString(), `build o: r i | x1 x2`);
});

Deno.test("Generator: write", () => {
  const rules = [
    rule({ name: "r0", command: "c0" }),
    rule({ name: "r1", command: "c1" }),
    rule({ name: "r2", command: "c2" }),
  ];
  const targets = [
    build({
      rule: rules[0],
      inputs: files("/", "i0"),
      outputs: files("/", "o0"),
    }),
    build({
      rule: rules[1],
      inputs: files("/", "i1"),
      outputs: files("/", "o1"),
    }),
    build({
      rule: rules[2],
      inputs: files("/", "i2"),
      outputs: files("/", "o2"),
    }),
  ];

  const generator = new Generator("/");
  generator.write(rules, targets);

  assertEquals(
    generator.toString(),
    `
rule r0
  command = c0
rule r1
  command = c1
rule r2
  command = c2

build o0: r0 i0
build o1: r1 i1
build o2: r2 i2
`.trimStart(),
  );
});

Deno.test("Generator: write: rules written in sorted order", () => {
  const rules = [
    rule({ name: "rrr2", command: "cmd goes here" }),
    rule({ name: "rrr1", command: "cmd goes here" }),
  ];

  const generator = new Generator("/");
  generator.write(rules, []);

  assertEquals(
    generator.toString(),
    `
rule rrr1
  command = cmd goes here
rule rrr2
  command = cmd goes here

`.trimStart(),
  );
});

Deno.test("Generator: write: targets written in original order", () => {
  const r = rule({
    name: "ttt",
    command: "ttt",
  });
  const targets = [
    build({
      rule: testRule,
      inputs: files("/", "i3"),
      outputs: files("/", "o3"),
    }),
    build({
      rule: testRule,
      inputs: files("/", "i2"),
      outputs: files("/", "o2"),
    }),
    build({
      rule: testRule,
      inputs: files("/", "i1"),
      outputs: files("/", "o1"),
    }),
  ];

  const generator = new Generator("/");
  generator.write([r], targets);

  assertEquals(
    generator.toString(),
    `
rule ttt
  command = ttt

build o3: ttt i3
build o2: ttt i2
build o1: ttt i1
`.trimStart(),
  );
});
