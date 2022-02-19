import { assertEquals } from "./deps.ts";
import { addLeadingDotSlash, sorted } from "./util.ts";

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

Deno.test("util: addLeadingDotSlash", () => {
  assertEquals(addLeadingDotSlash("foo"), "./foo");
  assertEquals(addLeadingDotSlash("foo/bar"), "./foo/bar");
  assertEquals(addLeadingDotSlash("/foo"), "/foo");
  assertEquals(addLeadingDotSlash("./foo"), "./foo");
  assertEquals(addLeadingDotSlash("../foo"), "../foo");
});
