import { cecho, consoleKv, KEY, readKv } from "./shared.ts";
import { parseArgs } from "@std/cli/parse-args";

const { pwd: _currentPwd } = parseArgs(Deno.args, {
  string: ["pwd"],
});
const currentPwd = _currentPwd as string;

const kv = await Deno.openKv();
const { currIndex, stack } = await readKv();

if (stack.length === 0) {
  cecho("doing", `stack is length 0, pushing pwd: ${currentPwd}`);
  await kv.set(KEY, {
    currIndex: 0,
    stack: [currentPwd],
  });
  await consoleKv();
  Deno.exit(0);
} else {
  cecho("noop", `stack is populated: ${JSON.stringify(stack, null, 2)}`);
}

if (stack[currIndex] !== currentPwd) {
  cecho("doing", `stack[currIndex] is not the current dir, resetting stack`);
  await kv.set(KEY, {
    currIndex: 0,
    stack: [],
  });
  await consoleKv();
} else {
  cecho("noop", "stack[currIndex] is the current dir");
}
