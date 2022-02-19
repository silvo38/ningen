import { assertEquals } from "https://deno.land/std@0.88.0/testing/asserts.ts";
import { glob } from "./glob.ts";

Deno.test("glob: star", () => {
  assertEquals(
    glob("*.md"),
    ["//README.md"],
  );
});

Deno.test("glob: double star", () => {
  assertEquals(
    glob("**/*.md"),
    ["//README.md", "//example/README.md"],
  );
});

Deno.test("glob: double star", () => {
  assertEquals(
    glob("*.md", { root: "example" }),
    ["//example/README.md"],
  );
});
