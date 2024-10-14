import { parseArgs } from "@std/cli/parse-args";
import { KEY, readKv } from "./shared.ts";
import * as path from "jsr:@std/path";

const { pwd: _currentPwd } = parseArgs(Deno.args, {
  string: ["pwd"],
});
const currentPwd = _currentPwd as string;

let cdDir: string;

const { currIndex, stack } = await readKv();
const kv = await Deno.openKv();

if (currIndex === 0) {
  cdDir = path.normalize(path.join(currentPwd, ".."));
  await kv.set(KEY, {
    currIndex,
    stack: [cdDir, ...stack],
  });
} else {
  cdDir = stack[currIndex - 1];

  await kv.set(KEY, {
    currIndex: currIndex - 1,
    stack,
  });
}

// NOTE: only console once, output is parsed by main.sh
console.log(cdDir);
