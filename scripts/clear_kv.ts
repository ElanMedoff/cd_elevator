import { parseArgs } from "@std/cli/parse-args";
import { KEY, log } from "./shared.ts";

const { debug: debugFlag } = parseArgs(Deno.args, {
  boolean: ["debug"],
});

log(debugFlag, "BEGIN: running clear_kv script...");
const kv = await Deno.openKv();
await kv.delete(KEY);
log(debugFlag, "END: ran clear_kv script");
