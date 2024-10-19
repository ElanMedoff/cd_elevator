import { parseArgs } from "@std/cli/parse-args";
import { buildLog, getKey, init, logKv, readKv } from "./shared.ts";

const {
  after_nav_pwd,
  before_nav_pwd,
  debug: debugFlag,
  pid: _pid,
  script_dir,
} = parseArgs(
  Deno.args,
  {
    string: ["after_nav_pwd", "before_nav_pwd", "pid", "script_dir"],
    boolean: "debug",
  },
);
const afterNavPwd = after_nav_pwd as string;
const beforeNavPwd = before_nav_pwd as string;
const scriptDir = script_dir as string;
const pid = _pid as string;

const log = buildLog({ scriptDir, debugFlag });

const kv = await init({ beforeNavPwd, debugFlag, pid, log });

const { currIndex, stack } = await readKv({ kv, pid });

log("BEGIN: running backwards script...");
await logKv({ debugFlag, kv, pid, log });
if (currIndex === 0) {
  log(
    "currIndex is 0, moving afterNavPwd to the front of the stack",
  );
  await kv.set(getKey(pid), {
    currIndex,
    stack: [afterNavPwd, ...stack],
  });
} else {
  log(
    "currIndex is not 0, moving the currIndex backwards",
  );
  await kv.set(getKey(pid), {
    currIndex: currIndex - 1,
    stack,
  });
}
log("BEGIN: ran backwards script\n");
await logKv({ debugFlag, kv, pid, log });
