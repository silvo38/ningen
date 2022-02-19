import { assertEquals, assertThrows } from "./deps.ts";
import { file, Files, files } from "./file.ts";

function getPaths(files: Files) {
  return files.map((f) => f.getAbsolutePath());
}

Deno.test("file: keeps absolute path", () => {
  assertEquals(
    file("/root/dir", "/a/b/c.txt").getAbsolutePath(),
    "/a/b/c.txt",
  );
});

Deno.test("file: converts relative path", () => {
  assertEquals(
    file("/root/dir", "x.txt").getAbsolutePath(),
    "/root/dir/x.txt",
  );
});

Deno.test("file: getRelativePath: returns relative path", () => {
  const f = file("/root/dir", "x.txt");

  assertEquals(f.getRelativePath("/"), "root/dir/x.txt");
  assertEquals(f.getRelativePath("/root"), "dir/x.txt");
  assertEquals(f.getRelativePath("/root/dir"), "x.txt");
});

Deno.test("file: withSuffix: returns new file with suffix", () => {
  const f = file("/root/dir", "x.txt").withSuffix(".out");

  assertEquals(f.getAbsolutePath(), "/root/dir/x.txt.out");
  assertEquals(f.getRelativePath("/root/dir"), "x.txt.out");
});

Deno.test("files: converts a single path", () => {
  assertEquals(
    getPaths(files("/root/dir", "x.txt")),
    ["/root/dir/x.txt"],
  );
});

Deno.test("files: converts a single array of paths", () => {
  assertEquals(
    getPaths(files(
      "/root/dir",
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
    getPaths(files(
      "/root/dir",
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
      getPaths(files(
        "/root/dir",
        "a.txt",
        ["b.txt", "c.txt"],
      )),
    Error,
    "element at index 1",
  );
});
