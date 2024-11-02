import { parseArgs } from "@std/cli/parse-args";
import { buildLog, getKey, initKv, readKv } from "./shared.ts";
import { logKv } from "./shared.ts";

const { debug: debugFlag, script_dir, pid: _pid } = parseArgs(Deno.args, {
  string: ["script_dir", "pid"],
  boolean: ["debug"],
});
const pid = _pid as string;
const scriptDir = script_dir as string;
const log = buildLog({ debugFlag, scriptDir });

log("BEGIN: running print_kv script...");
const kv = await Deno.openKv();
await initKv({ log, pid, kv });
await logKv({ debugFlag, kv, log, pid });
const value = await readKv({ kv, pid });
console.log(
  `${JSON.stringify(getKey(pid))}: ${
    JSON.stringify(
      value,
      null,
      2,
    )
  }`,
);
log("END: ran print_kv script");
