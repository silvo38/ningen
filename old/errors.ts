export class NingenError extends Error {}

export class EmptyListError extends NingenError {
  constructor(readonly listName: string) {
    super(`${listName} list cannot be empty.`);
  }
}

export class AlreadyDefinedError extends NingenError {
  constructor(readonly symbolDescription: string) {
    super(`A definition for ${symbolDescription} already exists.`);
  }
}

export class NotARepoPathError extends NingenError {
  constructor(readonly path: string) {
    super(`Path '${path}' not start with '//'.`);
  }
}
