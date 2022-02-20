import { assertEquals } from "./deps.ts";
import { Ningen } from "./mod.ts";

const ng = new Ningen("/root/dir");

const testRule = ng.rule({
  name: "ttt",
  command: "ttt -o $out $in",
  srcs: [],
});

Deno.test("generate: writeRule", () => {
  ng.reset();
  ng.rule({ name: "rrr", command: "cmd goes here" });

  assertEquals(
    ng.generateToString().trim(),
    `rule rrr
  command = cmd goes here`,
  );
});

Deno.test("generate: writeRule: string vars", () => {
  ng.reset();
  ng.rule({
    name: "rrr",
    command: "cmd goes here",
    vars: {
      c: "ccc",
      b: "bbb",
      a: "aaa",
    },
  });

  assertEquals(
    ng.generateToString().trim(),
    `rule rrr
  command = cmd goes here
  c = ccc
  b = bbb
  a = aaa`,
  );
});

Deno.test("generate: writeRule: file vars", () => {
  ng.reset();
  ng.rule({
    name: "rrr",
    command: "cmd goes here",
    vars: {
      c: ng.file("/root/dir/ccc"),
      b: ng.file("/abs/bbb"),
      a: ng.file("/root/dir/nested/aaa"),
    },
  });

  assertEquals(
    ng.generateToString().trim(),
    `rule rrr
  command = cmd goes here
  c = ccc
  b = ../../abs/bbb
  a = nested/aaa`,
  );
});

Deno.test("generate: writeRule: binary does not appear in rule def", () => {
  ng.reset();
  ng.rule({
    name: "rrr",
    command: "something $binary something",
    binary: ng.file("/root/dir/mybinary"),
  });

  assertEquals(
    ng.generateToString().trim(),
    `
rule rrr
  command = something $binary something
`.trim(),
  );
});

// Deno.test("generate: writeRule: generator", () => {
//     ng.rule({ name: "rrr", command: "cmd goes here", generator: true }),
//   );
//   assertEquals(
//     ng.generateToString().trim(),
//     `rule rrr
//   command = cmd goes here
//   generator = 1`,
//   );
// });

// Deno.test("generate: writeRule: depfile", () => {
//     ng.rule({ name: "rrr", command: "cmd", depfile: "$out.d" }),
//   );
//   assertEquals(
//     ng.generateToString().trim(),
//     `rule rrr
//   command = cmd
//   depfile = $out.d
//   deps = gcc`,
//   );
// });

Deno.test("generate: writeTarget: single input and output", () => {
  ng.reset();
  ng.build({
    rule: testRule,
    inputs: ng.files("i"),
    outputs: ng.files("o"),
  });

  assertEquals(ng.generateToString().trim(), `build o: ttt i`);
});

Deno.test("generate: writeTarget: multiple inputs and outputs", () => {
  ng.reset();
  ng.build({
    rule: testRule,
    inputs: ng.files("i1", "i2"),
    outputs: ng.files("o1", "o2"),
  });

  assertEquals(
    ng.generateToString().trim(),
    `build o1 o2: ttt i1 i2`,
  );
});

Deno.test("generate: writeTarget: with implicit inputs", () => {
  ng.reset();
  const r = ng.rule({
    name: "r",
    command: "c",
    srcs: ng.files("x1", "x2"),
  });

  ng.build({
    rule: r,
    inputs: ng.files("i"),
    outputs: ng.files("o"),
  });

  assertEquals(
    ng.generateToString().trim(),
    `
rule r
  command = c

build o: r i | x1 x2
`.trim(),
  );
});

Deno.test("generate: writeTarget: vars", () => {
  ng.reset();
  ng.build({
    rule: testRule,
    inputs: ng.files("i"),
    outputs: ng.files("o"),
    vars: {
      varA: "A",
      varB: ng.file("b/b"),
    },
  });

  assertEquals(
    ng.generateToString().trim(),
    `
build o: ttt i
  varA = A
  varB = b/b
`.trim(),
  );
});

Deno.test("generate: writeRule: binary added to vars", () => {
  ng.reset();
  const r = ng.rule({
    name: "r",
    command: "$binary 123",
    binary: ng.file("mybinary"),
  });
  ng.build({
    rule: r,
    inputs: ng.files("i"),
    outputs: ng.files("o"),
  });
  assertEquals(
    ng.generateToString().trim(),
    `
rule r
  command = $binary 123

build o: r i | mybinary
  binary = mybinary
`.trim(),
  );
});

Deno.test("generate: write", () => {
  ng.reset();
  const rule0 = ng.rule({ name: "r0", command: "c0" });
  const rule1 = ng.rule({ name: "r1", command: "c1" });
  const rule2 = ng.rule({ name: "r2", command: "c2" });
  ng.build({
    rule: rule0,
    inputs: ng.files("i0"),
    outputs: ng.files("o0"),
  });
  ng.build({
    rule: rule1,
    inputs: ng.files("i1"),
    outputs: ng.files("o1"),
  });
  ng.build({
    rule: rule2,
    inputs: ng.files("i2"),
    outputs: ng.files("o2"),
  });

  assertEquals(
    ng.generateToString().trim(),
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
`.trim(),
  );
});

Deno.test("generate: write: rules written in sorted order", () => {
  ng.reset();
  ng.rule({ name: "rrr2", command: "cmd goes here" });
  ng.rule({ name: "rrr1", command: "cmd goes here" });

  assertEquals(
    ng.generateToString().trim(),
    `
rule rrr1
  command = cmd goes here
rule rrr2
  command = cmd goes here
`.trim(),
  );
});

Deno.test("generate: write: targets written in original order", () => {
  ng.reset();
  ng.rule({
    name: "ttt",
    command: "ttt",
  });
  ng.build({
    rule: testRule,
    inputs: ng.files("i3"),
    outputs: ng.files("o3"),
  });
  ng.build({
    rule: testRule,
    inputs: ng.files("i2"),
    outputs: ng.files("o2"),
  });
  ng.build({
    rule: testRule,
    inputs: ng.files("i1"),
    outputs: ng.files("o1"),
  });

  assertEquals(
    ng.generateToString().trim(),
    `
rule ttt
  command = ttt

build o3: ttt i3
build o2: ttt i2
build o1: ttt i1
`.trim(),
  );
});
