export const getKey = (pid: string) => ["__cd_stack_key", pid];

export function buildLog(
  { debugFlag, scriptDir }: { debugFlag: boolean; scriptDir: string },
) {
  if (!debugFlag) return (_str: string) => {};

  return (str: string) => {
    const currContent = Deno.readTextFileSync(
      `${scriptDir}/log.txt`,
    );
    Deno.writeTextFileSync(
      `${scriptDir}/log.txt`,
      `${currContent ?? "BEGIN"}\n${str}`,
    );
  };
}

export async function logKv(
  { kv, debugFlag, pid, log }: {
    kv: Deno.Kv;
    debugFlag: boolean;
    pid: string;
    log: (str: string) => void;
  },
) {
  if (!debugFlag) return;
  const { currIndex, stack } = await readKv({ kv, pid });
  log(
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
  { beforeNavPwd, debugFlag, pid, log }: {
    beforeNavPwd: string;
    debugFlag: boolean;
    pid: string;
    log: (str: string) => void;
  },
) {
  const kv = await Deno.openKv();

  const initCheck = await kv.get(getKey(pid));
  log("BEGIN: initializing the kv store...");
  if (initCheck.value === null) {
    log("kv store is empty, setting initial store");
    await kv.set(getKey(pid), {
      currIndex: 0,
      stack: [],
    });
  } else {
    log("kv store is already populated");
  }
  log("DONE: kv store initialized\n");

  const { stack: uninitializedStack } = await readKv({ kv, pid });

  log("BEGIN: initializing the stack...");
  await logKv({ kv, debugFlag, pid, log });
  if (uninitializedStack.length === 0) {
    log(
      `stack is length 0, pushing before_nav_pwd: ${beforeNavPwd}`,
    );
    await kv.set(getKey(pid), {
      currIndex: 0,
      stack: [beforeNavPwd],
    });
  } else {
    log("stack is already populated");
  }
  log("DONE: stack initialized\n");

  // TODO: ideally only wread from kv once, write to kv once
  const { currIndex, stack: initializedStack } = await readKv({ kv, pid });

  log("BEGIN: initializing the currIndex...");
  await logKv({ kv, debugFlag, pid, log });
  if (initializedStack[currIndex] !== beforeNavPwd) {
    log(
      `stack[currIndex] (${
        initializedStack[currIndex]
      }) is not beforeNavPwd (${beforeNavPwd}), resetting the stack`,
    );
    await kv.set(getKey(pid), {
      currIndex: 0,
      stack: [beforeNavPwd],
    });
  } else {
    log("stack[currIndex] is already the current dir");
  }
  log("DONE: currIndex initialized\n");

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
