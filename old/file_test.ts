import { assertEquals, assertThrows } from "./deps.ts";
import { Files } from "./file.ts";
import { Ningen } from "./mod.ts";

function getPaths(files: Files) {
  return files.map((f) => f.getAbsolutePath());
}

const ng = new Ningen("/root/dir");

Deno.test("file: keeps absolute path", () => {
  assertEquals(
    ng.file("/a/b/c.txt").getAbsolutePath(),
    "/a/b/c.txt",
  );
});

Deno.test("file: converts relative path", () => {
  assertEquals(
    ng.file("x.txt").getAbsolutePath(),
    "/root/dir/x.txt",
  );
});

Deno.test("file: getRelativePath: returns relative path", () => {
  const f = ng.file("x.txt");

  assertEquals(f.getRelativePath("/"), "root/dir/x.txt");
  assertEquals(f.getRelativePath("/root"), "dir/x.txt");
  assertEquals(f.getRelativePath("/root/dir"), "x.txt");
});

Deno.test("file: addSuffix: returns new file with suffix", () => {
  const f = ng.file("x.txt").addSuffix(".out");

  assertEquals(f.getAbsolutePath(), "/root/dir/x.txt.out");
  assertEquals(f.getRelativePath("/root/dir"), "x.txt.out");
});

Deno.test("file: replaceExtension: swaps extension", () => {
  const f = ng.file("x.txt").replaceExtension(".out");

  assertEquals(f.getAbsolutePath(), "/root/dir/x.out");
  assertEquals(f.getRelativePath("/root/dir"), "x.out");
});

Deno.test("file: replaceExtension: throws if file has no extension", () => {
  assertThrows(
    () => ng.file("x").replaceExtension(".out"),
    Error,
    "File has no extension",
  );
});

Deno.test("file: replaceExtension: throws if extension does not start with a dot", () => {
  assertThrows(
    () => ng.file("x.txt").replaceExtension("out"),
    Error,
    "Extension must start with a dot",
  );
});

Deno.test("files: converts a single path", () => {
  assertEquals(
    getPaths(ng.files("x.txt")),
    ["/root/dir/x.txt"],
  );
});

Deno.test("files: converts a single array of paths", () => {
  assertEquals(
    getPaths(ng.files(
      [
        "a.txt",
        "b.txt",
        "c.txt",
      ],
    )),
    [
      "/root/dir/a.txt",
      "/root/dir/b.txt",
      "/root/dir/c.txt",
    ],
  );
});

Deno.test("files: converts a vararg list of paths", () => {
  assertEquals(
    getPaths(ng.files(
      "a.txt",
      "b.txt",
      "c.txt",
    )),
    [
      "/root/dir/a.txt",
      "/root/dir/b.txt",
      "/root/dir/c.txt",
    ],
  );
});

Deno.test("files: throws for a nested list", () => {
  assertThrows(
    () =>
      getPaths(ng.files(
        "a.txt",
        ["b.txt", "c.txt"],
      )),
    Error,
    "element at index 1",
  );
});
