/**
 * @see {@link https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md}
 */

import axios from "axios";
import { setupCache } from "axios-cache-adapter";
import { DEFAULT_REGISTRY } from "../../constant/registry";
import { IPackage } from "./types";

const cache = setupCache({
  maxAge: 15 * 60 * 1000,
});

const instance = axios.create({
  adapter: cache.adapter,
});

export const queryPackage = async (
  packageName: string,
  registry = DEFAULT_REGISTRY
): Promise<IPackage> => (await instance.get(`${registry}${packageName}`)).data;

export const queryTarball = async (
  packageName: string,
  version: string,
  registry = DEFAULT_REGISTRY
): Promise<string | undefined> => {
  const targetPackage = await queryPackage(packageName, registry);
  return targetPackage.versions?.[version]?.dist?.tarball;
};

export const downloadTarball = async (
  tarball: string
): Promise<ReadableStream> =>
  (
    await instance.get(tarball, {
      responseType: "stream",
    })
  ).data;
