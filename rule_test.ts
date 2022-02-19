import { assertEquals } from "./deps.ts";
import { file, files } from "./file.ts";
import { rule } from "./rule.ts";

Deno.test("rule: binary added to srcs", () => {
  const binary = file("/root", "/root/mybinary");
  const r = rule({
    name: "r",
    command: "c",
    binary,
  });
  assertEquals(r.binary, binary);
  assertEquals(r.srcs, [binary]);
});

Deno.test("rule: existing srcs preserved", () => {
  const r = rule({
    name: "r",
    command: "c",
    binary: file("/root", "/root/mybinary"),
    srcs: files("/root", "/root/mybinary", "/root/existing"),
  });
  assertEquals(
    r.srcs,
    files("/root", "/root/mybinary", "/root/existing"),
  );
});
