import { assertEquals, assertThrows } from "@std/assert";
import { glob } from "./glob.ts";

Deno.test("glob: *.txt", () => {
  assertEquals(
    glob("testdata/*.txt"),
    ["testdata/a.txt", "testdata/b.txt", "testdata/c.txt"],
  );
});

Deno.test("glob: [*.txt, *.old]", () => {
  assertEquals(
    glob(["testdata/*.txt", "testdata/*.old"]),
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
    glob(["testdata/*.txt", "testdata/a.*"]),
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
    glob("testdata/**/*.txt"),
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
    glob("testdata/**/*.txt", { exclude: ["testdata/a.*"] }),
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
    glob(["testdata/**/*.txt", "testdata/**/*.old"], {
      exclude: ["testdata/a.*"],
    }),
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
    glob("testdata/**/*.txt", { exclude: ["testdata/**/a.*"] }),
    [
      "testdata/A/b.txt",
      "testdata/A/c.txt",
      "testdata/B/b.txt",
      "testdata/B/c.txt",
      "testdata/b.txt",
      "testdata/c.txt",
    ],
  );
});

Deno.test("glob: multiple excludes", () => {
  assertEquals(
    glob("testdata/**/*.txt", {
      exclude: ["testdata/*.txt", "testdata/A/*.txt", "testdata/B/a.*"],
    }),
    [
      "testdata/B/b.txt",
      "testdata/B/c.txt",
    ],
  );
});

Deno.test("glob: empty results does not throw error when suppressed", () => {
  assertEquals(
    glob("testdata/*.txt", { exclude: ["testdata/*.txt"] }),
    [],
  );
});
