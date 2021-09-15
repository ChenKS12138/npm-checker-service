import type { Context } from "koa";
import serviceChecker from "../service/checker";
import * as registryOpenApi from "../domain/npm-registry/open-api";
import ErrorCode from "../constant/error-code";
import { PackageDao } from "../dao/package";
import { Vals } from "../util/types";
import { DEFAULT_CHECKER_VERSION } from "../constant/registry";

class ControllerChecker {
  static async check(
    ctx: Context &
      Vals<{ packageName: string; version: string; registry: string }>
  ) {
    const packageDao = new PackageDao();
    const { packageName, version, registry } = ctx.vals;
    const tarball = await registryOpenApi.queryTarball(
      packageName,
      version,
      registry
    );
    if (!tarball) {
      throw ErrorCode.CHECKER_TARBALL_NOTFOUND_ERROR;
    }
    const cachedResult = await packageDao.queryPackage(
      packageName,
      version,
      tarball,
      registry
    );
    if (cachedResult !== null) {
      ctx.ok(cachedResult);
    } else {
      const result = await serviceChecker.checkPackageByTarball(tarball);
      await packageDao.insertPackage({
        checkerVersion: DEFAULT_CHECKER_VERSION,
        packageName,
        registry,
        tarball,
        version,
        ...result,
      });
      ctx.ok(result);
    }
  }
}

export default ControllerChecker;
