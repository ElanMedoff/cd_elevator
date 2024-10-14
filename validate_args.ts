import "npm:zx/globals";
import { parseArgs } from "jsr:@std/cli/parse-args";
import { cecho } from "./shared.ts";

cecho("doing", "running args.ts...");

const { changeDir, forwards, backwards, _ } = parseArgs(Deno.args, {
  boolean: ["changeDir", "forwards", "backwards"],
});

const onlyOneTrue =
  [changeDir, forwards, backwards].filter(Boolean).length === 1;
if (!onlyOneTrue) {
  throw new Error(
    "expected only one of --changeDir, --forwards, or --backwards to have been passed.",
  );
}

if (forwards || backwards) {
  if (_.length !== 0) {
    throw new Error("with --forwards or --backwards, expected no cd args");
  }
}

if (changeDir) {
  if (_.length !== 1) {
    throw new Error(`expected only 1 main arg, received: ${_.length}`);
  }
  Deno.exit();
}

cecho("noop", "ran args.ts, --changeDir and 1 arg");
