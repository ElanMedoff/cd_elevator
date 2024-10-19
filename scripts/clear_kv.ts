import { parseArgs } from "@std/cli/parse-args";
import { deleteAll, log } from "./shared.ts";

const { debug: debugFlag } = parseArgs(Deno.args, {
  boolean: ["debug"],
});

log(debugFlag, "BEGIN: running clear_kv script...");
const kv = await Deno.openKv();
await deleteAll(kv);
log(debugFlag, "END: ran clear_kv script");
