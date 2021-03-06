import { assertEquals, assertThrows } from "./deps.ts";
import { Ningen } from "./mod.ts";

const ng = new Ningen("/root/dir");

const testRule = ng.rule({
  name: "ttt",
  command: "ttt -o $out $in",
  srcs: [],
});

function generate(): string {
  return ng.generateToString({ enableGeneratorRule: false }).trim();
}

Deno.test("generate: writePool: outputs pool", () => {
  ng.reset();
  ng.pool({
    name: "my_pool",
    depth: 2,
  });

  assertEquals(
    generate(),
    `
pool my_pool
  depth = 2
`.trim(),
  );
});

Deno.test("generate: writeRule", () => {
  ng.reset();
  ng.rule({ name: "rrr", command: "cmd goes here" });

  assertEquals(
    generate(),
    `
rule rrr
  command = cmd goes here
`.trim(),
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
    generate(),
    `
rule rrr
  command = cmd goes here
  c = ccc
  b = bbb
  a = aaa
`.trim(),
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
    generate(),
    `
rule rrr
  command = cmd goes here
  c = ccc
  b = ../../abs/bbb
  a = nested/aaa
`.trim(),
  );
});

Deno.test("generate: writeRule: $binary substituted in command", () => {
  ng.reset();
  ng.rule({
    name: "rrr",
    command: "something $binary something",
    binary: ng.file("/root/dir/mybinary"),
  });

  assertEquals(
    generate(),
    `
rule rrr
  command = something ./mybinary something
`.trim(),
  );
});

Deno.test("generate: writeRule: error if $binary is not in rule command", () => {
  ng.reset();
  ng.rule({
    name: "rrr",
    command: "something something",
    binary: ng.file("/root/dir/mybinary"),
  });

  assertThrows(
    () => generate(),
    Error,
    "binary property defined in rule rrr but not referenced in command: something something",
  );
});

Deno.test("generate: writeRule: generator", () => {
  ng.reset();
  ng.rule({ name: "rrr", command: "cmd goes here", generator: true });
  assertEquals(
    generate(),
    `
rule rrr
  command = cmd goes here
  generator = 1
`.trim(),
  );
});

Deno.test("generate: writeRule: using a pool", () => {
  ng.reset();
  const pool = ng.pool({ name: "my_pool", depth: 1 });
  ng.rule({ name: "rrr", command: "cmd goes here", pool });
  assertEquals(
    generate(),
    `
pool my_pool
  depth = 1

rule rrr
  command = cmd goes here
  pool = my_pool
`.trim(),
  );
});

Deno.test("generate: writeRule: using the console pool", () => {
  ng.reset();
  ng.rule({ name: "rrr", command: "cmd goes here", pool: "console" });
  assertEquals(
    generate(),
    `
rule rrr
  command = cmd goes here
  pool = console
`.trim(),
  );
});

Deno.test("generate: writeRule: substitutes $dir", () => {
  ng.reset();
  ng.rule({
    name: "r1",
    command: "cd $dir && something in root",
  });

  const subdirNg = new Ningen("/root/dir/subdir");
  subdirNg.rule({
    name: "r2",
    command: "cd $dir && something in subdir",
  });

  assertEquals(
    generate(),
    `
rule r1
  command = cd ./ && something in root

rule r2
  command = cd ./subdir && something in subdir
`.trim(),
  );
});

Deno.test("generate: writeRule: includes description", () => {
  ng.reset();
  ng.rule({
    name: "r",
    command: "rrr",
    description: "my description",
  });

  assertEquals(
    generate(),
    `
rule r
  command = rrr
  description = my description
`.trim(),
  );
});

// Deno.test("generate: writeRule: depfile", () => {
//     ng.rule({ name: "rrr", command: "cmd", depfile: "$out.d" }),
//   );
//   assertEquals(
//     generate(),
//     `
// rule rrr
//   command = cmd
//   depfile = $out.d
//   deps = gcc
// `.trim(),
//   );
// });

Deno.test("generate: writeTarget: single input and output", () => {
  ng.reset();
  ng.build({
    rule: testRule,
    inputs: ng.files("i"),
    outputs: ng.files("o"),
  });

  assertEquals(generate(), `build o: ttt i`);
});

Deno.test("generate: writeTarget: multiple inputs and outputs", () => {
  ng.reset();
  ng.build({
    rule: testRule,
    inputs: ng.files("i1", "i2"),
    outputs: ng.files("o1", "o2"),
  });

  assertEquals(
    generate(),
    `build o1 o2: ttt i1 i2
`.trim(),
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
    generate(),
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
    generate(),
    `
build o: ttt i
  varA = A
  varB = b/b
`.trim(),
  );
});

Deno.test("generate: writeRule: binary not added to vars", () => {
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
    generate(),
    `
rule r
  command = ./mybinary 123

build o: r i | mybinary
`.trim(),
  );
});

Deno.test("generate: writeTarget: overriding default pool with new pool", () => {
  ng.reset();
  const pool1 = ng.pool({ name: "my_pool1", depth: 1 });
  const pool2 = ng.pool({ name: "my_pool2", depth: 1 });
  const rule = ng.rule({ name: "rrr", command: "cmd goes here", pool: pool1 });

  ng.build({
    rule,
    inputs: ng.files("i"),
    outputs: ng.files("o"),
    pool: pool2,
  });

  assertEquals(
    generate(),
    `
pool my_pool1
  depth = 1

pool my_pool2
  depth = 1

rule rrr
  command = cmd goes here
  pool = my_pool1

build o: rrr i
  pool = my_pool2
`.trim(),
  );
});

Deno.test("generate: writeTarget: overriding default pool with empty string", () => {
  ng.reset();
  const pool = ng.pool({ name: "my_pool", depth: 1 });
  const rule = ng.rule({ name: "rrr", command: "cmd goes here", pool });

  ng.build({
    rule,
    inputs: ng.files("i"),
    outputs: ng.files("o"),
    pool: "",
  });

  assertEquals(
    generate(),
    `
pool my_pool
  depth = 1

rule rrr
  command = cmd goes here
  pool = my_pool

build o: rrr i
  pool =
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
    generate(),
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
    generate(),
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
    generate(),
    `
rule ttt
  command = ttt

build o3: ttt i3

build o2: ttt i2

build o1: ttt i1
`.trim(),
  );
});

Deno.test("generate: isDefault: non-default targets don't get default statements", () => {
  ng.reset();
  ng.build({
    rule: testRule,
    inputs: ng.files("i1"),
    outputs: ng.files("o1"),
    isDefault: true,
  });
  ng.build({
    rule: testRule,
    inputs: ng.files("i2"),
    outputs: ng.files("o2"),
    // isDefault omitted (should be true)
  });
  ng.build({
    rule: testRule,
    inputs: ng.files("i3"),
    outputs: ng.files("o3"),
    isDefault: false,
  });

  assertEquals(
    generate(),
    `
build o1: ttt i1

build o2: ttt i2

build o3: ttt i3

default o1
default o2
`.trim(),
  );
});

Deno.test("generate: isDefault: when everything is default, no default statements get printed", () => {
  ng.reset();
  ng.build({
    rule: testRule,
    inputs: ng.files("i1"),
    outputs: ng.files("o1"),
    isDefault: true,
  });
  ng.build({
    rule: testRule,
    inputs: ng.files("i2"),
    outputs: ng.files("o2"),
    // isDefault omitted (should be true)
  });

  assertEquals(
    generate(),
    `
build o1: ttt i1

build o2: ttt i2
`.trim(),
  );
});

Deno.test("generate: using default generator rule", () => {
  ng.reset();

  assertEquals(
    ng.generateToString({}).trim(),
    `
rule ningen
  command = ./BUILD.ts
  description = Regenerating Ninja file
  generator = 1

build build.ninja: ningen  | BUILD.ts
`.trim(),
  );
});

Deno.test("generate: override output file", () => {
  ng.reset();

  assertEquals(
    ng.generateToString({ output: ng.file("override.ninja") }).trim(),
    `
rule ningen
  command = ./BUILD.ts
  description = Regenerating Ninja file
  generator = 1

build override.ninja: ningen  | BUILD.ts
`.trim(),
  );
});

Deno.test("generate: override inputs", () => {
  ng.reset();

  assertEquals(
    ng.generateToString({ inputs: ng.files("a.txt", "b.txt") }).trim(),
    `
rule ningen
  command = ./BUILD.ts
  description = Regenerating Ninja file
  generator = 1

build build.ninja: ningen a.txt b.txt | BUILD.ts
`.trim(),
  );
});

Deno.test("generate: override generator rule", () => {
  ng.reset();
  const myGeneratorRule = ng.rule({
    name: "my-generator",
    command: "ggg",
    srcs: ng.files("f"),
    generator: true,
  });

  assertEquals(
    ng.generateToString({ generatorRule: myGeneratorRule }).trim(),
    `
rule my-generator
  command = ggg
  generator = 1

build build.ninja: my-generator  | f
`.trim(),
  );
});

Deno.test("generate: throws if overridden rule is not a generator rule", () => {
  ng.reset();
  const myGeneratorRule = ng.rule({
    name: "my-generator",
    command: "ggg",
    srcs: ng.files("f"),
    // generator not set => false
  });

  assertThrows(
    () => ng.generateToString({ generatorRule: myGeneratorRule }),
    Error,
    "my-generator is not a generator rule",
  );
});
