import { parseArgs } from "@std/cli/parse-args";
import { init, KEY, log, logKv, readKv } from "./shared.ts";

const { after_nav_pwd, before_nav_pwd, debug: debugFlag } = parseArgs(
  Deno.args,
  {
    string: ["after_nav_pwd", "before_nav_pwd"],
    boolean: "debug",
  },
);
const afterNavPwd = after_nav_pwd as string;
const beforeNavPwd = before_nav_pwd as string;

const kv = await init({ beforeNavPwd, debugFlag });

const { currIndex, stack } = await readKv(kv);

log(debugFlag, "BEGIN: running backwards script...");
await logKv({ debugFlag, kv });
if (currIndex === 0) {
  log(
    debugFlag,
    "currIndex is 0, moving afterNavPwd to the front of the stack",
  );
  await kv.set(KEY, {
    currIndex,
    stack: [afterNavPwd, ...stack],
  });
} else {
  log(
    debugFlag,
    "currIndex is not 0, moving the currIndex backwards",
  );
  await kv.set(KEY, {
    currIndex: currIndex - 1,
    stack,
  });
}
log(debugFlag, "BEGIN: ran backwards script\n");
await logKv({ debugFlag, kv });
