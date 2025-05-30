import { path } from "./deps.ts";

export class File {
  constructor(private readonly path: string) {}

  getAbsolutePath(): string {
    return this.path;
  }

  getRelativePath(directory: string): string {
    return path.relative(directory, this.path);
  }

  equals(other: File): boolean {
    return this.path === other.path;
  }

  addSuffix(suffix: string): File {
    return new File(this.path + suffix);
  }

  replaceExtension(ext: string): File {
    if (!ext.startsWith(".")) {
      throw new Error(`Extension must start with a dot: ${ext}`);
    }
    const oldExt = path.extname(this.path);
    if (oldExt == "") {
      throw new Error(`File has no extension: ${this.path}`);
    }
    const newPath = this.path.slice(0, this.path.length - oldExt.length) + ext;
    return new File(newPath);
  }
}

export type Files = readonly File[];
