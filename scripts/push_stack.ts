import { getKey, init, log, logKv, readKv } from "./shared.ts";
import { parseArgs } from "jsr:@std/cli/parse-args";

const { after_nav_pwd, before_nav_pwd, debug: debugFlag, pid: _pid } =
  parseArgs(
    Deno.args,
    {
      string: ["after_nav_pwd", "pid"],
      boolean: ["debug"],
    },
  );
const afterNavPwd = after_nav_pwd as string;
const beforeNavPwd = before_nav_pwd as string;
const pid = _pid as string;

const kv = await init({ beforeNavPwd, debugFlag, pid });
const { currIndex, stack } = await readKv({ kv, pid });

log(debugFlag, "BEGIN: running push_stack script...");
await logKv({ kv, debugFlag, pid });
await kv.set(getKey(pid), {
  currIndex: currIndex + 1,
  stack: [...stack, afterNavPwd],
});
log(debugFlag, "END: ran push_stack script\n");
await logKv({ kv, debugFlag, pid });
