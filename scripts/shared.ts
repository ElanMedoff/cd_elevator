export const getKey = (pid: string) => ["__cd_stack_key", pid];

export function log(
  debugFlag: boolean,
  str: string,
) {
  if (!debugFlag) return;

  const currContent = Deno.readTextFileSync(
    "/home/elan/Desktop/cd_time_machine/log.txt",
  );
  Deno.writeTextFileSync(
    "/home/elan/Desktop/cd_time_machine/log.txt",
    `${currContent ?? "BEGIN"}\n${str}`,
  );
}

export async function logKv(
  { kv, debugFlag, pid }: { kv: Deno.Kv; debugFlag: boolean; pid: string },
) {
  if (!debugFlag) return;
  const { currIndex, stack } = await readKv({ kv, pid });
  log(
    debugFlag,
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

export async function readKv({ kv, pid }: { kv: Deno.Kv; pid: string }) {
  const { value } = await kv.get(getKey(pid));
  const { currIndex, stack } = value as {
    currIndex: number;
    stack: string[];
  };
  return { currIndex, stack: [...stack] };
}

export async function init(
  { beforeNavPwd, debugFlag, pid }: {
    beforeNavPwd: string;
    debugFlag: boolean;
    pid: string;
  },
) {
  const kv = await Deno.openKv();

  const initCheck = await kv.get(getKey(pid));
  log(debugFlag, "BEGIN: initializing the kv store...");
  if (initCheck.value === null) {
    log(debugFlag, "kv store is empty, setting initial store");
    await kv.set(getKey(pid), {
      currIndex: 0,
      stack: [],
    });
  } else {
    log(debugFlag, "kv store is already populated");
  }
  log(debugFlag, "DONE: kv store initialized\n");

  const { stack: uninitializedStack } = await readKv({ kv, pid });

  log(debugFlag, "BEGIN: initializing the stack...");
  await logKv({ kv, debugFlag, pid });
  if (uninitializedStack.length === 0) {
    log(
      debugFlag,
      `stack is length 0, pushing before_nav_pwd: ${beforeNavPwd}`,
    );
    await kv.set(getKey(pid), {
      currIndex: 0,
      stack: [beforeNavPwd],
    });
  } else {
    log(debugFlag, "stack is already populated");
  }
  log(debugFlag, "DONE: stack initialized\n");

  // TODO: ideally only wread from kv once, write to kv once
  const { currIndex, stack: initializedStack } = await readKv({ kv, pid });

  log(debugFlag, "BEGIN: initializing the currIndex...");
  await logKv({ kv, debugFlag, pid });
  if (initializedStack[currIndex] !== beforeNavPwd) {
    log(
      debugFlag,
      `stack[currIndex] (${
        initializedStack[currIndex]
      }) is not beforeNavPwd (${beforeNavPwd}), resetting the stack`,
    );
    await kv.set(getKey(pid), {
      currIndex: 0,
      stack: [beforeNavPwd],
    });
  } else {
    log(debugFlag, "stack[currIndex] is already the current dir");
  }
  log(debugFlag, "DONE: currIndex initialized\n");

  return kv;
}

export async function deleteAll(kv: Deno.Kv) {
  const allKeys: Deno.KvKey[] = [];
  const entries = kv.list({ prefix: [] });
  for await (const entry of entries) {
    allKeys.push(entry.key);
  }

  for (const key of allKeys) {
    await kv.delete(key);
  }
}
