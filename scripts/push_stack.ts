import {
  buildLog,
  deleteOld,
  getKey,
  init,
  type KvValue,
  logKv,
  readKv,
} from "./shared.ts";
import { parseArgs } from "jsr:@std/cli/parse-args";

const {
  after_nav_pwd,
  before_nav_pwd,
  debug: debugFlag,
  pid: _pid,
  script_dir,
} = parseArgs(
  Deno.args,
  {
    string: ["after_nav_pwd", "pid", "script_dir"],
    boolean: ["debug"],
  },
);
const afterNavPwd = after_nav_pwd as string;
const beforeNavPwd = before_nav_pwd as string;
const scriptDir = script_dir as string;
const pid = _pid as string;

const log = buildLog({ debugFlag, scriptDir });
const kv = await Deno.openKv();

// running this on a script that's sent to the background
log("BEGIN: running deleteOld fn...");
await deleteOld({ kv, log });
log("END: ran deleteOld fn\n");

await init({ beforeNavPwd, debugFlag, pid, log, kv });
const { currIndex, stack } = await readKv({ kv, pid });

log("BEGIN: running push_stack script...");
await logKv({ kv, debugFlag, pid, log });
await kv.set(
  getKey(pid),
  {
    currIndex: currIndex + 1,
    stack: [...stack, afterNavPwd],
    lastAccess: Date.now(),
  } satisfies KvValue,
);
log("END: ran push_stack script\n");
await logKv({ kv, debugFlag, pid, log });
