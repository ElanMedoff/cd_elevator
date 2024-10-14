import "npm:zx/globals";
import { chalk } from "npm:zx";

// export function trimNewline(str: string) {
//   if (!str.endsWith("\n")) return str;
//   return str.slice(0, str.indexOf("\n"));
// }

export const KEY = ["cd_stack_key"];

export function cecho(
  mode: "error" | "query" | "noop" | "doing",
  str: string,
) {
  const prefix = "DEBUG: ";
  switch (mode) {
    case "error": {
      console.log(prefix, chalk.red(str));
      break;
    }
    case "query": {
      console.log(prefix, chalk.green(str));
      break;
    }
    case "noop": {
      console.log(prefix, chalk.blue(str));
      break;
    }
    case "doing": {
      console.log(prefix, chalk.magenta(str));
      break;
    }
  }
}

export async function consoleKv() {
  const { currIndex, stack } = await readKv();
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
}

export async function readKv() {
  const kv = await Deno.openKv();
  const { value } = await kv.get(KEY);
  const { currIndex, stack } = value as {
    currIndex: number;
    stack: string[];
  };
  // TODO: validate with something like zod
  return { currIndex, stack: [...stack] };
}
