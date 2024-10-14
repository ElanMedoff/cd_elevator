import "npm:zx/globals";
import { parseArgs } from "jsr:@std/cli/parse-args";
import { cecho } from "./shared.ts";

cecho("doing", "running args.ts...");
const { changeDir: shouldChangeDir, _ } = parseArgs(Deno.args, {
  boolean: ["changeDir"],
});

if (!shouldChangeDir) {
  throw new Error("only supports --changeDir for now");
}

if (_.length !== 1) {
  throw new Error(`expected only 1 main arg, received: ${_.length}`);
}

cecho("noop", "ran args.ts, --changeDir and 1 arg");
