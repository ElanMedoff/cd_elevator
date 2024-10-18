import { init, KEY, log, logKv, readKv } from "./shared.ts";
import { parseArgs } from "jsr:@std/cli/parse-args";

const { after_nav_pwd, before_nav_pwd, debug: debugFlag } = parseArgs(
  Deno.args,
  {
    string: ["after_nav_pwd"],
    boolean: ["debug"],
  },
);
const afterNavPwd = after_nav_pwd as string;
const beforeNavPwd = before_nav_pwd as string;

const kv = await init({ beforeNavPwd, debugFlag });
const { currIndex, stack } = await readKv(kv);

log(debugFlag, "BEGIN: running push_stack script...");
await logKv({ kv, debugFlag });
await kv.set(KEY, {
  currIndex: currIndex + 1,
  stack: [...stack, afterNavPwd],
});
log(debugFlag, "END: ran push_stack script\n");
await logKv({ kv, debugFlag });
