import { Middleware, Next } from "koa";
import ErrorCode from "../constant/error-code";
import { sleep } from "../util/promise-extra";

const creatTimeoutMiddleware = (timeout: number): Middleware => {
  return async (ctx: any, next: Next) => {
    const result = await Promise.race([sleep(timeout), next()]);
    if (result === sleep.TIMEOUT) {
      throw ErrorCode.CHECKER_TIMEOUT_ERROR;
    }
  };
};

export default creatTimeoutMiddleware;
