import { MongoClient } from "mongodb";

export interface BaseEntity {}

export abstract class BaseDao<T extends BaseEntity> {
  static client = new MongoClient(
    `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:27017`
  );
  private dbName: string;
  private collectionName: string;
  constructor(dbName: string, collectionName: string) {
    this.dbName = dbName;
    this.collectionName = collectionName;
  }
  protected get collection() {
    return BaseDao.client.db(this.dbName).collection<T>(this.collectionName);
  }
}
