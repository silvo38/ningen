// TODO: Give real deno.land URL.
import { init } from "../../../mod.ts";

// Import append rule from other file.
import { append } from "../tools/builddefs.ts";

// Initialises Ningen and retrieves the functions for defining rules and build
// targets.
const { file } = init(import.meta.url);

// Process a file.
append(file("foo.txt"));

// Don't call generate() here, it's called from ../BUILD.ts instead.
