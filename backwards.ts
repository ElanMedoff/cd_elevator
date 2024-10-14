import { KEY, readKv } from "./shared.ts";

// TODO: navigate backwards? then what?

const { currIndex, stack } = await readKv();
const kv = await Deno.openKv();

if (currIndex === 0) {
  Deno.exit(1);
}

const cdDir = stack[currIndex - 1];

await kv.set(KEY, {
  currIndex: currIndex - 1,
  stack,
});

// NOTE: only console once, output is parsed by main.sh
console.log(cdDir);
