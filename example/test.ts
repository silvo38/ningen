import { assertEquals } from "@std/assert/equals";
import { assertStrictEquals } from "@std/assert/strict-equals";

// Test file must be run from this directory.

Deno.test("IntegrationTest", async (t) => {
  await t.step("run BUILD.ts", async () => {
    const command = new Deno.Command("./BUILD.ts");
    const { code, stdout, stderr } = await command.output();
    console.log(new TextDecoder().decode(stdout));
    console.error(new TextDecoder().decode(stderr));
    assertEquals(code, 0, "Failure when running BUILD.ts");
  });

  await t.step("build.ninja is correct", async () => {
    const actual = await Deno.readTextFile("build.ninja");
    const expected = await Deno.readTextFile("build.ninja.expected");
    assertStrictEquals(
      actual,
      expected,
      "build.ninja does not match build.ninja.expected",
    );
  });
});
