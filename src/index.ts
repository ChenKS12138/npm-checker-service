import Koa from "koa";
import routes from "./router";
import bouncer from "koa-bouncer";
import recoverMiddleware from "./middleware/recover";
import { BaseDao } from "./dao/base";

(async () => {
  const app = new Koa();
  await BaseDao.client.connect();
  console.log("db connected!");
  app.on("close", () => {
    BaseDao.client.close();
  });

  app.use(recoverMiddleware);
  app.use(bouncer.middleware());
  app.use(routes);
  app.listen(3000, () => {
    console.log("Service Start!");
  });
})();
