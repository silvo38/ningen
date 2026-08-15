import { assertEquals, assertGreater } from "@std/assert";

Deno.test("version in README is correct", async () => {
  const config = JSON.parse(await Deno.readTextFile("deno.jsonc"));
  const version = config.version;
  assertEquals(
    typeof version,
    "string",
    "deno.jsonc file does not have a valid version number",
  );
  const readme = await Deno.readTextFile("README.md");

  const matches = [...readme.matchAll(/jsr:@silvo38\/ningen@(\d+\.\d+\.\d+)/g)];
  assertGreater(
    matches.length,
    0,
    "No version numbers were found in README.md",
  );

  for (const match of matches) {
    assertEquals(match.length, 2, "Match is weird??");
    assertEquals(match[1], version, "README.md contains wrong version number");
  }
});
