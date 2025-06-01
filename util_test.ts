import { getRuleName, sorted } from "./util.ts";
import { assertEquals, assertStrictEquals } from "@std/assert";

Deno.test("util: sorted: no keyFn", () => {
  assertEquals(sorted(["c", "a", "b", "a"]), ["a", "a", "b", "c"]);
});

Deno.test("util: sorted: keyFn", () => {
  assertEquals(
    sorted([
      { num: 1, text: "c" },
      { num: 4, text: "a" },
      { num: 3, text: "b" },
      { num: 2, text: "a" },
    ], (x) => x.text),
    [
      { num: 4, text: "a" },
      { num: 2, text: "a" },
      { num: 3, text: "b" },
      { num: 1, text: "c" },
    ],
  );
});

Deno.test("getRuleName", () => {
  assertStrictEquals(getRuleName("foo"), "foo");
  assertStrictEquals(getRuleName({ name: "foo", cmd: "cmd" }), "foo");
});
