import {
  assert,
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.88.0/testing/asserts.ts";
import { EmptyListError, NotARepoPathError } from "./errors.ts";
import {
  addAll,
  checkRepoRelativePath,
  isRepoRelativePath,
  requireNonEmptySrcs,
  resolveRepoRelativePath,
  resolveRepoRelativePaths,
  sorted,
  sortedUnique,
} from "./util.ts";

Deno.test("util: requireNonEmptySrcs", () => {
  // Should not throw.
  requireNonEmptySrcs(["a"], "abc");

  // Should throw.
  assertThrows(() => requireNonEmptySrcs([], "abc"), EmptyListError);
});

Deno.test("util: addAll", () => {
  const set = new Set();

  addAll(["a"], set);
  assert(set.has("a"));

  addAll(["b", "c"], set);
  assert(set.has("b"));
  assert(set.has("c"));

  addAll(new Set(["d"]), set);
  assert(set.has("d"));
});

Deno.test("util: sortedUnique", () => {
  assertEquals(sortedUnique(["c", "a", "b", "a"]), ["a", "b", "c"]);
});

Deno.test("util: isRepoRelativePath", () => {
  assert(!isRepoRelativePath(""));
  assert(!isRepoRelativePath("a"));
  assert(!isRepoRelativePath("/a"));
  assert(isRepoRelativePath("//a"));
  assert(isRepoRelativePath("//a/b"));
});

Deno.test("util: isRepoRelativePath", () => {
  checkRepoRelativePath("//a");
  assertThrows(() => checkRepoRelativePath("a"), NotARepoPathError);
});

Deno.test("util: resolveRepoRelativePath", () => {
  assertEquals(resolveRepoRelativePath("//a"), "a");
  assertEquals(resolveRepoRelativePath("//a/b"), "a/b");
  assertThrows(() => resolveRepoRelativePath("a"), NotARepoPathError);
});

Deno.test("util: resolveRepoRelativePaths", () => {
  assertEquals(resolveRepoRelativePaths(["//a", "//b"]), ["a", "b"]);
  assertThrows(() => resolveRepoRelativePaths(["//a", "b"]), NotARepoPathError);
});
