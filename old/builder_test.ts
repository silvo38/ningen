import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.88.0/testing/asserts.ts";
import { Builder, GenerateOpts } from "./builder.ts";
import { AlreadyDefinedError, NotARepoPathError } from "./errors.ts";
import { Rule } from "./rule.ts";
import { Target } from "./target.ts";

const testRule = new Rule({ name: "ttt", command: "ccc" });

class TestBuilder extends Builder {
  outputPath?: string;
  outputData?: string;

  constructor() {
    super(new Map(), [], new Set());
  }

  protected writeFile(path: string, data: string) {
    this.outputPath = path;
    this.outputData = data;
  }
}

Deno.test("Builder: rule: adds rule to builder", () => {
  const builder = Builder.create();

  const rule = builder.rule({ name: "rrr", command: "ccc" });

  assert(builder.rules.has("rrr"));
  assertEquals(builder.rules.get("rrr"), rule);
});

Deno.test("Builder: rule: throws if already defined", () => {
  const builder = Builder.create();
  builder.rule({ name: "rrr", command: "ccc" });

  assertThrows(
    () => builder.rule({ name: "rrr", command: "ccc" }),
    AlreadyDefinedError,
  );
});

Deno.test("Builder: rule: uses current directory", () => {
  const builder = Builder.create();

  builder.setDirectory("//aaa/bbb");
  const rule = builder.rule({ name: "rrr", command: "ccc", implicit: ["i"] });

  assertEquals(rule.implicit, ["//aaa/bbb/i"]);
});

Deno.test("Builder: rule: ignores current directory for //-paths", () => {
  const builder = Builder.create();

  builder.setDirectory("//aaa/bbb");
  const rule = builder.rule({ name: "rrr", command: "ccc", implicit: ["//i"] });

  assertEquals(rule.implicit, ["//i"]);
});

Deno.test("Builder: build: adds target to builder", () => {
  const builder = Builder.create();

  const target = builder.build({
    rule: testRule,
    inputs: ["i"],
    outputs: ["o"],
  });

  assertArrayIncludes(builder.targets, [target]);
});

Deno.test("Builder: build: throws if output already defined", () => {
  const builder = Builder.create();
  builder.build({ rule: testRule, inputs: ["i1"], outputs: ["o"] });

  assertThrows(
    () => builder.build({ rule: testRule, inputs: ["i2"], outputs: ["o"] }),
    AlreadyDefinedError,
  );
});

Deno.test("Builder: build: uses current directory", () => {
  const builder = Builder.create();

  builder.setDirectory("//aaa/bbb");
  const target = builder.build({
    rule: testRule,
    inputs: ["a"],
    outputs: ["b"],
    implicit: ["c"],
  });

  assertEquals(target.inputs, ["//aaa/bbb/a"]);
  assertEquals(target.outputs, ["//aaa/bbb/b"]);
  assertEquals(target.implicit, ["//aaa/bbb/c"]);
});

Deno.test("Builder: build: ignores current directory for //-paths", () => {
  const builder = Builder.create();

  builder.setDirectory("//aaa/bbb");
  const target = builder.build({
    rule: testRule,
    inputs: ["//a"],
    outputs: ["//b"],
    implicit: ["//c"],
  });

  assertEquals(target.inputs, ["//a"]);
  assertEquals(target.outputs, ["//b"]);
  assertEquals(target.implicit, ["//c"]);
});

Deno.test("Builder: build: throws if output already defined, respecting current directory", () => {
  const builder = Builder.create();
  builder.build({ rule: testRule, inputs: ["aaa/i1"], outputs: ["aaa/o"] });

  builder.setDirectory("//aaa");

  assertThrows(
    () => builder.build({ rule: testRule, inputs: ["i2"], outputs: ["o"] }),
    AlreadyDefinedError,
  );
});

Deno.test("Builder: generate: default ninjaFile", () => {
  const builder = new TestBuilder();
  builder.generate();
  assertEquals(builder.outputPath, "build.ninja");
});

Deno.test("Builder: generate: overridden ninjaFile", () => {
  const builder = new TestBuilder();
  builder.generate({ ninjaFile: "abc/def" });
  assertEquals(builder.outputPath, "abc/def");
});

Deno.test("Builder: generate: regen rule enabled by default", () => {
  const builder = new TestBuilder();

  builder.generate();

  assertEquals(
    builder.outputData,
    `
rule ningen
  command = deno run --allow-write BUILD.ts
  generator = 1

build build.ninja: ningen BUILD.ts
`.trimLeft(),
  );
});

Deno.test("Builder: generate: overridden ningenFile", () => {
  const builder = new TestBuilder();

  builder.generate({ ningenFile: "abc" });

  assertEquals(
    builder.outputData,
    `
rule ningen
  command = deno run --allow-write abc
  generator = 1

build build.ninja: ningen abc
`.trimLeft(),
  );
});

Deno.test("Builder: generate: regen rule disabled", () => {
  const builder = new TestBuilder();

  builder.generate({ regen: false });

  assertEquals(builder.outputData, "\n");
});

Deno.test("Builder: setDirectory: requires //-path", () => {
  const builder = new TestBuilder();

  assertThrows(() => builder.setDirectory("aaa"), NotARepoPathError);
});

Deno.test("Builder: setDirectory: root // dir is ok", () => {
  const builder = new TestBuilder();
  builder.setDirectory("//");
});

Deno.test("Builder: glob: uses current directory", () => {
  const builder = new TestBuilder();

  builder.setDirectory("//example");
  assertEquals(builder.glob("*.md"), ["//example/README.md"]);

  builder.setDirectory("//");
  assertEquals(builder.glob("*.md"), ["//README.md"]);
});
