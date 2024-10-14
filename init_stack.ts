import { cecho, KEY } from "./shared.ts";
import { parseArgs } from "@std/cli/parse-args";

const { pwd: _currentPwd } = parseArgs(Deno.args, {
  string: ["pwd"],
});
const currentPwd = _currentPwd as string;

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

if (stack.length === 0) {
  cecho("doing", `stack is length 0, pushing pwd: ${currentPwd}`);
  await kv.set(KEY, {
    currIndex,
    stack: [currentPwd],
  });
  Deno.exit(0);
} else {
  cecho("noop", `stack is populated: ${JSON.stringify(stack, null, 2)}`);
}

if (stack[currIndex] !== currentPwd) {
  cecho("doing", `stack[currIndex] is not the current dir, resetting stack`);
  await kv.set(KEY, {
    currIndex,
    stack: [],
  });
} else {
  cecho("noop", "stack[currIndex] is the current dir");
}
