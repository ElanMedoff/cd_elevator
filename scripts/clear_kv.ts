import { parseArgs } from "@std/cli/parse-args";
import { buildLog, deleteAll } from "./shared.ts";

const { debug: debugFlag, script_dir } = parseArgs(Deno.args, {
  string: ["script_dir"],
  boolean: ["debug"],
});
const scriptDir = script_dir as string;
const log = buildLog({ debugFlag, scriptDir });

log("BEGIN: running clear_kv script...");
const kv = await Deno.openKv();
await deleteAll(kv);
log("END: ran clear_kv script");
