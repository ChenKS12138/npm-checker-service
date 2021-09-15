const TIMEOUT = Symbol("sleep timeout");

export const sleep = (timeout: number): Promise<typeof TIMEOUT> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(TIMEOUT);
    }, timeout);
  });

sleep.TIMEOUT = TIMEOUT;
