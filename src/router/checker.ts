import type { Context, Next } from "koa";
import Router from "koa-router";
import { DEFAULT_REGISTRY } from "../constant/registry";
import controllerChecker from "../controller/checker";

const router = new Router();

type RouterContext = Context;

router.get(
  "/",
  async (ctx: RouterContext, next: Next): Promise<void> => {
    // moduleName
    ctx.validateQuery("packageName").required().isString().trim();

    // version
    ctx
      .validateQuery("version")
      .required()
      .isString()
      .match(
        /^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/,
        "Expected A Validate Semver Version"
      )
      .trim();

    // registry
    ctx.validateQuery("registry").defaultTo(DEFAULT_REGISTRY).isString().trim();
    await next();
  },
  controllerChecker.check
);

export default router.routes();
