import { path } from "./deps.ts";

export type FileFn = (path: string) => File;

/**
 * Returns a list of files. Supply either a single `string[]`, or a variable
 * number of strings.
 */
export type FilesFn = (...filenames: (string | string[])[]) => Files;

export class File {
  constructor(private readonly path: string) {}

  getAbsolutePath(): string {
    return this.path;
  }

  getRelativePath(directory: string): string {
    return path.relative(directory, this.path);
  }

  withSuffix(suffix: string): File {
    return new File(this.path + suffix);
  }
}

export type Files = readonly File[];

/**
 * Constructs a {@link File} object from the given filename. If {@code filename}
 * is a relative path, uses {@code directory} as the root directory.
 */
export function file(directory: string, filename: string): File {
  if (path.isAbsolute(filename)) {
    return new File(filename);
  } else {
    return new File(path.join(directory, filename));
  }
}

/**
 * Constructs a list of {@link File} objects from the given filenames. You can
 * supply either an array of filenames, or a vararg list of filenames.
 */
export function files(
  directory: string,
  ...filenames: (string | string[])[]
): Files {
  if (filenames.length == 1) {
    const elem = filenames[0];
    if (typeof elem === "string") {
      // Single string.
      return [file(directory, elem)];
    } else {
      // Single array of strings.
      return elem.map((f) => file(directory, f));
    }
  }
  // Vararg list of (hopefully) strings. Throw if not.
  return filenames.map((f, index) => {
    if (typeof f !== "string") {
      throw new Error(
        `Expected list of strings but element at index ${index} was ${f}`,
      );
    }
    return file(directory, f);
  });
}
