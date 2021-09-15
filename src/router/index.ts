import Router from "koa-router";

import createTimeoutMiddleware from "../middleware/timeout";
import checkerRoutes from "./checker";

const router = new Router({
  prefix: "/api/v1",
});

router.use("/checker", createTimeoutMiddleware(30000), checkerRoutes);

export default router.routes();
