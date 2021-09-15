import * as path from "path";
import resolve from "resolve";

export const ensureDirSync = (dir: string, fs: any) => {
  if (!fs.existsSync(dir)) {
    ensureDirSync(path.dirname(dir), fs);
    fs.mkdirSync(dir);
  }
};

export const resolveModule = (id: string, fs: any) => {
  return resolve.sync(id, {
    readFileSync: fs.readFileSync,
    isFile(file: string) {
      try {
        var stat = fs.statSync(file);
      } catch (e) {
        if (
          e &&
          ((e as any).code === "ENOENT" || (e as any).code === "ENOTDIR")
        )
          return false;
        throw e;
      }
      return stat.isFile() || stat.isFIFO();
    },
    isDirectory(dir: string) {
      try {
        var stat = fs.statSync(dir);
      } catch (e) {
        if (
          e &&
          ((e as any).code === "ENOENT" || (e as any).code === "ENOTDIR")
        )
          return false;
        throw e;
      }
      return stat.isDirectory();
    },
    realpathSync(x: string) {
      const realpathFS =
        fs.realpathSync && typeof fs.realpathSync.native === "function"
          ? fs.realpathSync.native
          : fs.realpathSync;
      try {
        return realpathFS(x);
      } catch (realpathErr) {
        if ((realpathErr as any).code !== "ENOENT") {
          throw realpathErr;
        }
      }
      return x;
    },
  });
};
