import { assertEquals, assertThrows, path } from "./deps.ts";
import { Files } from "./file.ts";
import { Ningen } from "./mod.ts";

const root = path.dirname(path.fromFileUrl(import.meta.url));

const ng = new Ningen(root);

function getRelativePaths(files: Files): string[] {
  return files.map((f) => f.getRelativePath(root));
}

Deno.test("glob: *.txt", () => {
  assertEquals(
    getRelativePaths(ng.glob("testdata/*.txt")),
    ["testdata/a.txt", "testdata/b.txt", "testdata/c.txt"],
  );
});

Deno.test("glob: [*.txt, *.old]", () => {
  assertEquals(
    getRelativePaths(ng.glob(["testdata/*.txt", "testdata/*.old"])),
    [
      "testdata/a.old",
      "testdata/a.txt",
      "testdata/b.txt",
      "testdata/c.txt",
    ],
  );
});

Deno.test("glob: [*.txt, a.*]", () => {
  assertEquals(
    getRelativePaths(ng.glob(["testdata/*.txt", "testdata/a.*"])),
    [
      "testdata/a.old",
      "testdata/a.txt",
      "testdata/b.txt",
      "testdata/c.txt",
    ],
  );
});

Deno.test("glob: **/*.txt", () => {
  assertEquals(
    getRelativePaths(ng.glob("testdata/**/*.txt")),
    [
      "testdata/A/a.txt",
      "testdata/A/b.txt",
      "testdata/A/c.txt",
      "testdata/B/a.txt",
      "testdata/B/b.txt",
      "testdata/B/c.txt",
      "testdata/a.txt",
      "testdata/b.txt",
      "testdata/c.txt",
    ],
  );
});

Deno.test("glob: exclude a.*", () => {
  assertEquals(
    getRelativePaths(
      ng.glob("testdata/**/*.txt", { exclude: ["testdata/a.*"] }),
    ),
    [
      "testdata/A/a.txt",
      "testdata/A/b.txt",
      "testdata/A/c.txt",
      "testdata/B/a.txt",
      "testdata/B/b.txt",
      "testdata/B/c.txt",
      "testdata/b.txt",
      "testdata/c.txt",
    ],
  );
});

Deno.test("glob: exclude a.* across multiple globs", () => {
  assertEquals(
    getRelativePaths(
      ng.glob(["testdata/**/*.txt", "testdata/**/*.old"], {
        exclude: ["testdata/a.*"],
      }),
    ),
    [
      "testdata/A/a.old",
      "testdata/A/a.txt",
      "testdata/A/b.txt",
      "testdata/A/c.txt",
      "testdata/B/a.old",
      "testdata/B/a.txt",
      "testdata/B/b.txt",
      "testdata/B/c.txt",
      "testdata/b.txt",
      "testdata/c.txt",
    ],
  );
});

Deno.test("glob: exclude **/a.*", () => {
  assertEquals(
    getRelativePaths(
      ng.glob("testdata/**/*.txt", { exclude: ["testdata/**/a.*"] }),
    ),
    [
      "testdata/A/b.txt",
      "testdata/A/c.txt",
      "testdata/B/b.txt",
      "testdata/B/c.txt",
      // Weird that a.txt is _included_ by **/*.txt, but _excluded_ by **/a.*
      "testdata/a.txt",
      "testdata/b.txt",
      "testdata/c.txt",
    ],
  );
});

Deno.test("glob: multiple excludes", () => {
  assertEquals(
    getRelativePaths(
      ng.glob("testdata/**/*.txt", {
        exclude: ["testdata/*.txt", "testdata/A/*.txt", "testdata/B/a.*"],
      }),
    ),
    [
      "testdata/B/b.txt",
      "testdata/B/c.txt",
    ],
  );
});

Deno.test("glob: empty results throws error when not suppressed", () => {
  assertThrows(
    () => ng.glob("testdata/*.txt", { exclude: ["testdata/*.txt"] }),
    Error,
    "Glob expanded to empty set: testdata/*.txt, -testdata/*.txt",
  );
});

Deno.test("glob: empty results does not throw error when suppressed", () => {
  assertEquals(
    getRelativePaths(
      ng.glob("testdata/*.txt", {
        exclude: ["testdata/*.txt"],
        canBeEmpty: true,
      }),
    ),
    [],
  );
});
