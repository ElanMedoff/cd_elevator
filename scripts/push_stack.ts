import { cecho, consoleKv, KEY, readKv } from "./shared.ts";
import { parseArgs } from "jsr:@std/cli/parse-args";
import * as path from "jsr:@std/path";

const { pwd: _currentPwd, _ } = parseArgs(Deno.args, {
  string: ["pwd"],
});
const currentPwd = _currentPwd as string;
const cdDir = path.join(currentPwd, _[0] as string);

const { currIndex, stack } = await readKv();
const kv = await Deno.openKv();

cecho("doing", "updating stack...");
await kv.set(KEY, {
  currIndex: currIndex + 1,
  stack: [...stack, cdDir],
});
await consoleKv();
cecho("noop", "updated stack");
