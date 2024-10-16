import { parseArgs } from "@std/cli/parse-args";
import { cecho, KEY, readKv } from "./shared.ts";

const { after_nav_pwd } = parseArgs(Deno.args, {
  string: ["after_nav_pwd"],
});
const afterNavPwd = after_nav_pwd as string;

const { currIndex, stack } = await readKv();
const kv = await Deno.openKv();

if (currIndex === 0) {
  cecho(
    "doing",
    "currIndex is 0, moving afterNavPwd to the front of the stack",
  );
  await kv.set(KEY, {
    currIndex,
    stack: [afterNavPwd, ...stack],
  });
} else {
  cecho(
    "doing",
    "currIndex is not 0, moving moving the currIndex",
  );
  await kv.set(KEY, {
    currIndex: currIndex - 1,
    stack,
  });
}
