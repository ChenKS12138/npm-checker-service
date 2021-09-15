import { Context } from "koa";
import { ValidationError } from "koa-bouncer";
import ErrorCode from "../constant/error-code";

class RecoverResponse<T> {
  code: number;
  msg: string;
  data: T;
  constructor(code: number, msg: string, data: T) {
    this.code = code;
    this.msg = msg;
    this.data = data;
  }
}

const recoverMiddleware = async (ctx: Context, next: () => void) => {
  try {
    ctx.ok = <T>(data: T) => {
      ctx.body = new RecoverResponse(0, "ok", data);
    };
    await next();
  } catch (e) {
    (e as Error)?.stack && console.error((e as Error).stack);

    if (e instanceof ValidationError) {
      console.error(e);
      ctx.body = new RecoverResponse(
        ErrorCode.CHECKER_INPUT_INVALID_ERROR,
        `${ErrorCode[ErrorCode.CHECKER_INPUT_INVALID_ERROR]}:${e.message}`,
        null
      );
    } else if (typeof e === "number" && Reflect.has(ErrorCode, e)) {
      ctx.body = new RecoverResponse(e, ErrorCode[e], null);
    } else {
      ctx.body = new RecoverResponse(-1, String(e), null);
    }
  }
};

declare module "koa" {
  interface Context {
    ok: <T>(data: T) => void;
  }
}

export default recoverMiddleware;
