import { assertEquals } from "@std/assert/equals";

// Test file must be run from this directory.

Deno.test("Run BUILD.ts", async () => {
  const command = new Deno.Command("./BUILD.ts");
  const { code, stdout, stderr } = await command.output();
  console.log(new TextDecoder().decode(stdout));
  console.error(new TextDecoder().decode(stderr));
  assertEquals(code, 0, "Failure when running BUILD.ts");
});
