interface IAuthor {
  name: string;
  url?: string;
  email?: string;
}

export interface IRegistry {
  db_name: string;
  doc_count: number;
  doc_del_count: number;
  update_seq: number;
  purge_seq: number;
  compact_running: boolean;
  disk_size: number;
  data_size: number;
  instance_start_time: string;
  disk_format_version: number;
  committed_update_seq: number;
}

export interface IPackage {
  _id: string;
  _rev: string;
  _name: string;
  description: string;
  "dist-tags": {
    latest: string;
  };
  versions: {
    [version: string]: IVersion;
  };
  time: {
    [key: string]: string;
  };
  author: IAuthor;
  repository: {
    type: string;
    url: string;
  };
  readme: string;
}

export interface IVersion {
  name: string;
  version: string;
  homepage: string;
  repository: {
    type: string;
    url: string;
  };
  dependencies: {
    [moduleName: string]: string;
  };
  devDependencies: {
    [moduleName: string]: string;
  };
  scripts: {
    [scriptName: string]: string;
  };
  author: IAuthor;
  license: string;
  readme: string;
  readmeFilename: string;
  _id: string;
  description: string;
  dist: {
    shasum: string;
    tarball: string;
  };
  _npmVersion: string;
  _npmUser: string;
  maintainers: IAuthor[];
}
