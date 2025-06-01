import type { Rule } from "./mod.ts";

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

/** Returns the name of the rule. */
export function getRuleName(rule: string | Rule): string {
  return typeof rule === "string" ? rule : rule.name;
}
