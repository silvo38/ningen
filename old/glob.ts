import {
  ExpandGlobOptions,
  expandGlobSync,
} from "https://deno.land/std@0.88.0/fs/mod.ts";
import { relative } from "https://deno.land/std@0.88.0/path/mod.ts";

/**
 * Returns a list of all files matching the given glob expression. See official
 * Deno documentation for `expandGlobSync` syntax, but in short: `*.txt` matches
 * `.txt` files in the current directory, and `**` matches 0 or more folders.
 * 
 * Returns paths are all repo-relative paths, starting with `//`.
 */
export function glob(expr: string, opts?: ExpandGlobOptions): string[] {
  const result = [];
  // TODO: Handle //-paths in opts.root, opts.exclude, etc.?
  for (const file of expandGlobSync(expr, opts)) {
    const path = "//" + relative(Deno.cwd(), file.path);
    result.push(path);
  }
  return result;
}
