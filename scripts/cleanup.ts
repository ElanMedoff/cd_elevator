import { parseArgs } from "@std/cli/parse-args";

const { script_dir } = parseArgs(Deno.args, { string: ["script_dir"] });
const scriptDir = script_dir as string;

Deno.writeTextFileSync(
  `${scriptDir}/log.txt`,
  "",
);
