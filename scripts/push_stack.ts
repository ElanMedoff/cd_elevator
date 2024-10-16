import { cecho, consoleKv, KEY, readKv } from "./shared.ts";
import { parseArgs } from "jsr:@std/cli/parse-args";

const { after_nav_pwd } = parseArgs(Deno.args, {
  string: ["after_nav_pwd"],
});
const afterNavPwd = after_nav_pwd as string;

const { currIndex, stack } = await readKv();
const kv = await Deno.openKv();

cecho("doing", "updating stack...");
await kv.set(KEY, {
  currIndex: currIndex + 1,
  stack: [...stack, afterNavPwd],
});
await consoleKv();
cecho("noop", "updated stack");
