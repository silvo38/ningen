// In your own code, use:
// import { init } from "https://deno.land/x/ningen@v0.0.3/mod.ts";
import { init } from "../../../mod.ts";

// Import append rule from other file.
import { append } from "../tools/builddefs.ts";

// Initialises Ningen and retrieves the functions for defining rules and build
// targets.
const ng = init(import.meta.url);

// Process a file.
append(ng.file("foo.txt"));

// Don't call generate() here, it's called from ../BUILD.ts instead.
