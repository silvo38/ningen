import { assertEquals } from "./deps.ts";
import { Ningen } from "./mod.ts";

const ng = new Ningen("/root");

Deno.test("rule: binary added to srcs", () => {
  const binary = ng.file("/root/mybinary");
  const r = ng.rule({
    name: "r",
    command: "c",
    binary,
  });
  assertEquals(r.binary, binary);
  assertEquals(r.srcs, [binary]);
});

Deno.test("rule: existing srcs preserved", () => {
  const r = ng.rule({
    name: "r",
    command: "c",
    binary: ng.file("/root/mybinary"),
    srcs: ng.files("/root/mybinary", "/root/existing"),
  });
  assertEquals(
    r.srcs,
    ng.files("/root/mybinary", "/root/existing"),
  );
});
