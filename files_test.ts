import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.88.0/testing/asserts.ts";
import { Files, init } from "./mod.ts";

const { file, files } = init("file:///root/dir/BUILD.ts");

function getPaths(files: Files) {
  return files.map((f) => f.path);
}

Deno.test("file: keeps absolute path", () => {
  assertEquals(
    file("/a/b/c.txt").path,
    "/a/b/c.txt",
  );
});

Deno.test("file: converts relative path", () => {
  assertEquals(
    file("x.txt").path,
    "/root/dir/x.txt",
  );
});

Deno.test("files: converts a single path", () => {
  assertEquals(
    getPaths(files("x.txt")),
    ["/root/dir/x.txt"],
  );
});

Deno.test("files: converts a single array of paths", () => {
  assertEquals(
    getPaths(files([
      "a.txt",
      "b.txt",
      "c.txt",
    ])),
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
        "a.txt",
        ["b.txt", "c.txt"],
      )),
    Error,
    "element at index 1",
  );
});
