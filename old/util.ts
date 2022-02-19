import { EmptyListError, NotARepoPathError } from "./errors.ts";

/**
 * Throws an exception if `srcs` is empty. `symbol` is used in the exception
 * message to indicate the name of the array.
 */
export function requireNonEmptySrcs(
  srcs: ReadonlyArray<string>,
  symbol: string,
): ReadonlyArray<string> {
  if (srcs.length == 0) {
    throw new EmptyListError(symbol);
  }
  return srcs;
}

/** Adds all elements from `iterable` to `set`. */
export function addAll<T>(iterable: Iterable<T>, set: Set<T>) {
  for (const element of iterable) {
    set.add(element);
  }
}

/**
 * Returns a sorted copy of an iterable. Optionally provide a `keyFn` that will
 * be used when sorting.
 */
export function sorted<T>(
  input: Iterable<T>,
  keyFn?: (elem: T) => string,
): T[] {
  const copy = [...input];
  if (keyFn) {
    copy.sort((a, b) => {
      const keyA = keyFn(a);
      const keyB = keyFn(b);
      if (keyA < keyB) {
        return -1;
      } else if (keyA > keyB) {
        return 1;
      } else {
        return 0;
      }
    });
  } else {
    copy.sort();
  }
  return copy;
}

/** Returns a de-duped and sorted copy of the input array. */
export function sortedUnique<T>(input: Iterable<T>): T[] {
  return sorted(new Set(input));
}

/**
 * Convert the given `path` to a repo-relative path starting with `//`. A no-op
 * if the path is already repo-relative.
 */
export function toRepoRelativePath(path: string): string {
  if (isRepoRelativePath(path)) {
    return path;
  }
  // TODO: What to do with absolute paths?
  return "//" + path;
}

/** Checks if the given `path` is a repo-relative path starting with `//`. */
export function isRepoRelativePath(path: string): boolean {
  return path.startsWith("//");
}

/** Checks that the given `path` is a repo-relative path starting with `//`. */
export function checkRepoRelativePath(path: string) {
  if (!isRepoRelativePath(path)) {
    throw new NotARepoPathError(path);
  }
}

/**
 * Converts a repo-relative path (e.g. `//abc/123`) to a standard relative path
 * (e.g. `abc/123`).
 */
export function resolveRepoRelativePath(path: string): string {
  checkRepoRelativePath(path);
  return path.slice(2);
}

/**
 * Converts a repo-relative path (e.g. `//abc/123`) to a standard relative path
 * (e.g. `abc/123`).
 */
export function resolveRepoRelativePaths(
  paths: ReadonlyArray<string>,
): string[] {
  return paths.map((p) => resolveRepoRelativePath(p));
}
