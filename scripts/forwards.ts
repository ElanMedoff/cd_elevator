import { KEY, readKv } from "./shared.ts";

const { currIndex, stack } = await readKv();
const kv = await Deno.openKv();

if (stack.length === 0) {
  console.log("__err");
  Deno.exit();
}

if (currIndex === stack.length - 1) {
  console.log("__err");
  Deno.exit();
}

const cdDir = stack[currIndex + 1];

await kv.set(KEY, {
  currIndex: currIndex + 1,
  stack,
});

// NOTE: only console once, output is parsed by main.sh
console.log(cdDir);
