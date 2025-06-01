import { expandGlobSync } from "@std/fs";
import { relative } from "@std/path";

/**
 * Returns all files matching the given glob(s). Optionally can supply other
 * globs to exclude certain paths.
 *
 * Supply either a single string, e.g. `glob("*.jpg")`, or an array of
 * strings, e.g. `glob(["*.jpg", "*.png"])`.
 */
export function glob(
  globs: string | string[],
  { exclude, canBeEmpty }: { exclude?: string[]; canBeEmpty?: boolean } = {},
): string[] {
  canBeEmpty = canBeEmpty ?? false;
  if (typeof globs == "string") {
    globs = [globs];
  }
  // Store as a Set to de-dupe paths included in multiple globs.
  const paths: Set<string> = new Set();
  for (const glob of globs) {
    const files = expandGlobSync(glob, { exclude });
    for (const file of files) {
      paths.add(file.path);
    }
  }
  const relativePaths = [...paths].map((path) => relative(".", path));
  relativePaths.sort();
  return relativePaths;
}
