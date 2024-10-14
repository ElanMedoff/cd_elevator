import { KEY, readKv } from "./shared.ts";

const { currIndex, stack } = await readKv();
const kv = await Deno.openKv();

if (currIndex === stack.length - 1) {
  Deno.exit(1);
}

const cdDir = stack[currIndex + 1];

await kv.set(KEY, {
  currIndex: currIndex + 1,
  stack,
});

// NOTE: only console once, output is parsed by main.sh
console.log(cdDir);
