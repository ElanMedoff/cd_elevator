import { parseArgs } from "@std/cli/parse-args";
import {
  buildLog,
  getKey,
  init,
  type KvValue,
  logKv,
  readKv,
} from "./shared.ts";

const { before_nav_pwd, debug: debugFlag, pid: _pid, script_dir } = parseArgs(
  Deno.args,
  {
    string: ["before_nav_pwd", "pid", "script_dir"],
    boolean: ["debug"],
  },
);
const beforeNavPwd = before_nav_pwd as string;
const pid = _pid as string;
const scriptDir = script_dir as string;

const log = buildLog({ debugFlag, scriptDir });
const kv = await init({ beforeNavPwd, debugFlag, pid, log });

const { currIndex, stack } = await readKv({ kv, pid });

log("BEGIN: running forwards script...");
await logKv({ debugFlag, kv, pid, log });
if (stack.length === 0) {
  log("stack length is 0, returning __err");
  console.log("__err");
  Deno.exit();
}

if (currIndex === stack.length - 1) {
  log("at the end of the stack, returning __err");
  console.log("__err");
  Deno.exit();
}

log("incrementing currIndex");
const cdDir = stack[currIndex + 1];
await kv.set(
  getKey(pid),
  {
    currIndex: currIndex + 1,
    stack,
    lastAccess: Date.now(),
  } satisfies KvValue,
);
log("END: ran forwards script\n");

await logKv({ debugFlag, kv, pid, log });
// NOTE: only console once, output is parsed by main.sh
console.log(cdDir);
