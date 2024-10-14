import "npm:zx/globals";
import { cecho, KEY } from "./shared.ts";

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

cecho("doing", "CLEARING KV");
kv.delete(KEY);
