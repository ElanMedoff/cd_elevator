import { parseArgs } from "@std/cli/parse-args";
import { getKey, init, log, logKv, readKv } from "./shared.ts";

const { before_nav_pwd, debug: debugFlag, pid: _pid } = parseArgs(Deno.args, {
  string: ["before_nav_pwd", "pid"],
  boolean: ["debug"],
});
const beforeNavPwd = before_nav_pwd as string;
const pid = _pid as string;

const kv = await init({ beforeNavPwd, debugFlag, pid });

const { currIndex, stack } = await readKv({ kv, pid });

log(debugFlag, "BEGIN: running forwards script...");
await logKv({ debugFlag, kv, pid });
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
await kv.set(getKey(pid), {
  currIndex: currIndex + 1,
  stack,
});
log(debugFlag, "END: ran forwards script\n");

await logKv({ debugFlag, kv, pid });
// NOTE: only console once, output is parsed by main.sh
console.log(cdDir);
