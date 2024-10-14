import "npm:zx/globals";
import { cecho, KEY } from "./shared.ts";
import { parseArgs } from "jsr:@std/cli/parse-args";

const { pwd: _currentPwd, _ } = parseArgs(Deno.args, {
  string: ["pwd"],
});
const currentPwd = _currentPwd as string;
const cdDir = path.join(currentPwd, _[0] as string);

const kv = await Deno.openKv();
const { value } = await kv.get(KEY);
const { currIndex, stack } = value as {
  currIndex: number;
  stack: string[];
};
cecho(
  "doing",
  `reading from the kv store, value is: ${
    JSON.stringify(
      {
        currIndex,
        stack,
      },
      null,
      2,
    )
  }`,
);

cecho("doing", "updating stack...");
await kv.set(KEY, {
  currIndex,
  stack: [...stack, cdDir],
});
cecho("noop", "updated stack");
