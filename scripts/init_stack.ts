import { cecho, consoleKv, KEY, readKv } from "./shared.ts";
import { parseArgs } from "@std/cli/parse-args";

const { before_nav_pwd } = parseArgs(Deno.args, {
  string: ["before_nav_pwd"],
});
const beforeNavPwd = before_nav_pwd as string;

const kv = await Deno.openKv();
const { currIndex, stack } = await readKv();

if (stack.length === 0) {
  cecho("doing", `stack is length 0, pushing before_nav_pwd: ${beforeNavPwd}`);
  await kv.set(KEY, {
    currIndex: 0,
    stack: [beforeNavPwd],
  });
  await consoleKv();
  Deno.exit(0);
} else {
  cecho("noop", `stack is populated: ${JSON.stringify(stack, null, 2)}`);
}

if (stack[currIndex] !== beforeNavPwd) {
  cecho("doing", `stack[currIndex] is not the current dir, resetting stack`);
  await kv.set(KEY, {
    currIndex: 0,
    stack: [],
  });
  await consoleKv();
} else {
  cecho("noop", "stack[currIndex] is the current dir");
}
