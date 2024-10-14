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
