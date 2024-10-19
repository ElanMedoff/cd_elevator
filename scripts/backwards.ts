import { parseArgs } from "@std/cli/parse-args";
import { getKey, init, log, logKv, readKv } from "./shared.ts";

const { after_nav_pwd, before_nav_pwd, debug: debugFlag, pid: _pid } =
  parseArgs(
    Deno.args,
    {
      string: ["after_nav_pwd", "before_nav_pwd", "pid"],
      boolean: "debug",
    },
  );
const afterNavPwd = after_nav_pwd as string;
const beforeNavPwd = before_nav_pwd as string;
const pid = _pid as string;

const kv = await init({ beforeNavPwd, debugFlag, pid });

const { currIndex, stack } = await readKv({ kv, pid });

log(debugFlag, "BEGIN: running backwards script...");
await logKv({ debugFlag, kv, pid });
if (currIndex === 0) {
  log(
    debugFlag,
    "currIndex is 0, moving afterNavPwd to the front of the stack",
  );
  await kv.set(getKey(pid), {
    currIndex,
    stack: [afterNavPwd, ...stack],
  });
} else {
  log(
    debugFlag,
    "currIndex is not 0, moving the currIndex backwards",
  );
  await kv.set(getKey(pid), {
    currIndex: currIndex - 1,
    stack,
  });
}
log(debugFlag, "BEGIN: ran backwards script\n");
await logKv({ debugFlag, kv, pid });
