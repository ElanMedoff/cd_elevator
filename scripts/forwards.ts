import { parseArgs } from "@std/cli/parse-args";
import { init, KEY, log, logKv, readKv } from "./shared.ts";

const { before_nav_pwd, debug: debugFlag } = parseArgs(Deno.args, {
  string: ["before_nav_pwd"],
  boolean: ["debug"],
});
const beforeNavPwd = before_nav_pwd as string;

const kv = await init({ beforeNavPwd, debugFlag });

const { currIndex, stack } = await readKv(kv);

log(debugFlag, "BEGIN: running forwards script...");
await logKv({ debugFlag, kv });
if (stack.length === 0) {
  log(debugFlag, "stack length is 0, returning __err");
  console.log("__err");
  Deno.exit();
}

if (currIndex === stack.length - 1) {
  log(debugFlag, "at the end of the stack, returning __err");
  console.log("__err");
  Deno.exit();
}

log(debugFlag, "incrementing currIndex");
const cdDir = stack[currIndex + 1];
await kv.set(KEY, {
  currIndex: currIndex + 1,
  stack,
});
log(debugFlag, "END: ran forwards script\n");

await logKv({ debugFlag, kv });
// NOTE: only console once, output is parsed by main.sh
console.log(cdDir);
