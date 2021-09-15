import { BaseDao, BaseEntity } from "./base";

export interface PackageEntity extends BaseEntity {
  packageName: string;
  version: string;
  registry: string;
  tarball: string;
  checkerVersion: number;
  internalModules: string[];
  visitedFiles: string[];
  externalModules: string[];
  unknownModules: string[];
}

export class PackageDao extends BaseDao<PackageEntity> {
  constructor() {
    super("npm-checker", "package");
  }
  async queryPackage(
    packageName: string,
    version: string,
    tarball: string,
    registry: string
  ) {
    const item = await this.collection.findOne(
      {
        packageName,
        version,
        registry,
        tarball,
      },
      {
        projection: {
          _id: 0,
          externalModules: 1,
          internalModules: 1,
          unknownModules: 1,
          visitedFiles: 1,
        },
      }
    );
    return item;
  }
  async insertPackage(packageEntity: PackageEntity) {
    const {
      packageName,
      version,
      registry,
      tarball,
      externalModules,
      internalModules,
      unknownModules,
      visitedFiles,
    } = packageEntity;
    const item = await this.collection.findOneAndUpdate(
      {
        packageName,
        version,
        registry,
        tarball,
      },
      {
        $set: {
          externalModules,
          internalModules,
          unknownModules,
          visitedFiles,
        },
      },
      {
        upsert: true,
      }
    );
    return item;
  }
}
