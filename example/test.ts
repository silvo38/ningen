import { assertEquals } from "@std/assert/equals";
import { assertStrictEquals } from "@std/assert/strict-equals";

// Test file must be run from this directory.

Deno.test("IntegrationTest", async (t) => {
  await t.step("run BUILD.ts", async () => {
    await runCommand("./BUILD.ts");
  });

  await t.step("build.ninja is correct", async () => {
    assertStrictEquals(
      await Deno.readTextFile("build.ninja"),
      await Deno.readTextFile("build.ninja.expected"),
      "build.ninja does not match build.ninja.expected",
    );
  });

  await t.step("run ninja", async () => {
    await runCommand("ninja");
  });

  await t.step("check output files", async () => {
    assertStrictEquals(
      await Deno.readTextFile("count1.out"),
      "       2       5      24 input1.txt\n",
      "count1.out is incorrect",
    );
    assertStrictEquals(
      await Deno.readTextFile("count2.out"),
      "       2       2      12 input2.txt\n",
      "count2.out is incorrect",
    );
  });
});

async function runCommand(cmd: string) {
  const command = new Deno.Command(cmd);
  const { code, stdout, stderr } = await command.output();
  console.log(new TextDecoder().decode(stdout));
  console.error(new TextDecoder().decode(stderr));
  assertEquals(code, 0, `Error when running: ${cmd}`);
}
