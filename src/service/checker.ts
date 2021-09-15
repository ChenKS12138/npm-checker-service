import * as registryOpenApi from "../domain/npm-registry/open-api";
import * as stream from "stream";
import * as zlib from "zlib";
import * as path from "path";
import * as Module from "module";
import { createFsFromVolume, Volume } from "memfs";
import tar from "tar-stream";
import * as babel from "@babel/core";

import { ensureDirSync, resolveModule } from "../util/fs-extra";
import ErrorCode from "../constant/error-code";

class ServiceChecker {
  static async checkPackageByTarball(tarball: string): Promise<{
    internalModules: string[];
    visitedFiles: string[];
    externalModules: string[];
    unknownModules: string[];
  }> {
    const tarballStream = await registryOpenApi.downloadTarball(tarball);
    const vol = new Volume();
    const fs = createFsFromVolume(vol);
    const extract = tar.extract();
    return new Promise((resolve, reject) => {
      extract.on("entry", (header, fileStream, next) => {
        fileStream.on("end", () => {
          next();
        });
        const targetPath = path.join("/", header.name);
        ensureDirSync(path.dirname(targetPath), fs);
        fileStream.pipe(fs.createWriteStream(targetPath));
      });
      stream.pipeline(tarballStream, zlib.createUnzip(), extract, () => {
        try {
          const entryWorkingDirectory = "/package";
          const packageJson = JSON.parse(
            fs
              .readFileSync(path.join(entryWorkingDirectory, "package.json"))
              .toString()
          );
          if (!packageJson.main) {
            reject(ErrorCode.CHECKER_EMPTYMAIN_ERROR);
            return;
          }
          const entryFile = path.resolve(
            path.join(entryWorkingDirectory, packageJson.main)
          );
          const queue = [];
          try {
            queue.push(resolveModule(entryFile, fs));
          } catch (e) {
            throw ErrorCode.CHECKER_MAINFILE_NOTFOUND_ERROR;
          }
          const explicitDependencies = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies,
            ...packageJson.peerDependencies,
            ...packageJson.bundledDependencies,
            ...packageJson.optionalDependencies,
          };

          const internalModuleSet = new Set<string>();
          const visitedFiles = new Set<string>();
          const externalModuleSet = new Set<string>();
          const unknownModuleSet = new Set<string>();
          while (queue.length) {
            const current = queue.shift()!;
            if (visitedFiles.has(current)) {
              continue;
            }
            visitedFiles.add(current);
            const content = fs.readFileSync(current).toString();
            try {
              const { ast } = babel.transformSync(content, { ast: true })!;
              babel.traverse(ast, {
                CallExpression(nodePath) {
                  if (
                    (nodePath.node.callee as babel.types.V8IntrinsicIdentifier)
                      .name === "require"
                  ) {
                    const moduleId = (nodePath.node.arguments[0] as any).value;
                    if (moduleId) {
                      if (Module.builtinModules.includes(moduleId)) {
                        internalModuleSet.add(moduleId);
                      } else if (Reflect.has(explicitDependencies, moduleId)) {
                        externalModuleSet.add(
                          `${moduleId}@${explicitDependencies[moduleId]}`
                        );
                      } else {
                        try {
                          queue.push(
                            resolveModule(
                              path.join(path.dirname(current), moduleId),
                              fs
                            )
                          );
                        } catch (e) {
                          unknownModuleSet.add(moduleId);
                        }
                      }
                    }
                  }
                },
              });
            } catch (_e) {}
          }
          resolve({
            internalModules: Array.from(internalModuleSet),
            visitedFiles: Array.from(visitedFiles),
            externalModules: Array.from(externalModuleSet),
            unknownModules: Array.from(unknownModuleSet),
          });
        } catch (e) {
          reject(e);
        }
      });
    });
  }
}

export default ServiceChecker;
