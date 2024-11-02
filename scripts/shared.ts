export interface KvValue {
  currIndex: number;
  stack: string[];
  lastAccess: number;
}

export type Log = (str: string) => void;

export const getKey = (pid: string) => ["__cd_time_machine_key", pid];

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
    log: Log;
  },
) {
  if (!debugFlag) return;
  const value = await readKv({ kv, pid });
  log(
    `reading from the kv store, value is: ${
      JSON.stringify(
        value,
        null,
        2,
      )
    }`,
  );
}

export async function readKv({ kv, pid }: { kv: Deno.Kv; pid: string }) {
  const { currIndex, stack, lastAccess } = (await kv.get(getKey(pid)))
    .value as KvValue;
  return { currIndex, stack: [...stack], lastAccess };
}

export async function initKv({ pid, log, kv }: {
  pid: string;
  log: Log;
  kv?: Deno.Kv;
}) {
  if (!kv) {
    kv = await Deno.openKv();
  }

  const initCheck = await kv.get(getKey(pid));
  log("BEGIN: initializing the kv store...");
  if (initCheck.value === null) {
    log("kv store is empty, setting initial store");
    await kv.set(
      getKey(pid),
      {
        currIndex: 0,
        stack: [],
        lastAccess: Date.now(),
      } satisfies KvValue,
    );
  } else {
    log("kv store is already populated");
  }
  log("DONE: kv store initialized\n");
}

export async function init(
  { beforeNavPwd, debugFlag, pid, log, kv }: {
    beforeNavPwd: string;
    debugFlag: boolean;
    pid: string;
    log: Log;
    kv?: Deno.Kv;
  },
) {
  if (!kv) {
    kv = await Deno.openKv();
  }

  await initKv({ log, pid, kv });
  const { stack: uninitializedStack } = await readKv({ kv, pid });

  log("BEGIN: initializing the stack...");
  await logKv({ kv, debugFlag, pid, log });
  if (uninitializedStack.length === 0) {
    log(
      `stack is length 0, pushing before_nav_pwd: ${beforeNavPwd}`,
    );
    await kv.set(
      getKey(pid),
      {
        currIndex: 0,
        stack: [beforeNavPwd],
        lastAccess: Date.now(),
      } satisfies KvValue,
    );
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
    await kv.set(
      getKey(pid),
      {
        currIndex: 0,
        stack: [beforeNavPwd],
        lastAccess: Date.now(),
      } satisfies KvValue,
    );
  } else {
    log("stack[currIndex] is already the current dir");
  }
  log("DONE: currIndex initialized\n");

  return kv;
}

export async function getAllKeys(kv: Deno.Kv) {
  const allKeys: Deno.KvKey[] = [];
  const entries = kv.list({ prefix: [] });
  for await (const entry of entries) {
    allKeys.push(entry.key);
  }
  return allKeys;
}

export async function deleteAll(kv: Deno.Kv) {
  const allKeys = await getAllKeys(kv);

  for (const key of allKeys) {
    await kv.delete(key);
  }
}

const isOlderThanTwoDays = (
  lastAccess: number,
) => {
  const now = Date.now();
  const second = 1_000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const twoDay = 2 * day;

  return (now - lastAccess) > twoDay;
};

export async function deleteOld({ kv, log }: {
  kv: Deno.Kv;
  log: Log;
}) {
  const allKeys = await getAllKeys(kv);
  let deleted = false;
  for (const key of allKeys) {
    const { lastAccess } = (await kv.get(key)).value as KvValue;
    if (isOlderThanTwoDays(lastAccess)) {
      deleted = true;
      log(`DELETING: ${JSON.stringify(key, null, 2)}`);
      await kv.delete(key);
    }
  }
  if (!deleted) log("No kv entries deleted");
}
