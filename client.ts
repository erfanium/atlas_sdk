import type { AuthOptions } from "./auth_types.d.ts";
import { Document, EJSON } from "./deps.ts";

export interface MongoClientConstructorOptions {
  dataSource: string;
  auth: AuthOptions;
  endpoint: string;
  fetch?: typeof fetch;
}

export class MongoClient {
  dataSource: string;
  endpoint: string;
  fetch = fetch;
  headers = new Headers();

  constructor(
    { dataSource, auth, endpoint, fetch }: MongoClientConstructorOptions,
  ) {
    this.dataSource = dataSource;
    this.endpoint = endpoint;

    if (fetch) {
      this.fetch = fetch;
    }

    this.headers.set("Content-Type", "application/ejson");
    this.headers.set("Accept", "application/ejson");

    if ("apiKey" in auth) {
      this.headers.set("api-key", auth.apiKey);
      return;
    }

    if ("jwtTokenString" in auth) {
      this.headers.set("jwtTokenString", auth.jwtTokenString);
      return;
    }

    if ("email" in auth && "password" in auth) {
      this.headers.set("email", auth.email);
      this.headers.set("password", auth.password);
      return;
    }

    throw new Error("Invalid auth options");
  }

  database(name: string) {
    return new Database(name, this);
  }
}

class Database {
  name: string;
  client: MongoClient;

  constructor(name: string, client: MongoClient) {
    this.name = name;
    this.client = client;
  }

  collection<T = Document>(name: string) {
    return new Collection<T>(name, this);
  }
}

class Collection<T> {
  name: string;
  database: Database;
  client: MongoClient;

  constructor(name: string, database: Database) {
    this.name = name;
    this.database = database;
    this.client = database.client;
  }

  insertOne(doc: T): Promise<{ insertedId: string }> {
    return this.callApi("insertOne", { document: doc });
  }

  insertMany(docs: T[]): Promise<{ insertedIds: string[] }> {
    return this.callApi("insertMany", { documents: docs });
  }

  async findOne(
    filter: Document,
    { projection }: { projection?: Document } = {},
  ): Promise<T> {
    const result = await this.callApi("findOne", {
      filter,
      projection,
    });
    return result.document;
  }

  async find(
    filter?: Document,
    { projection, sort, limit, skip }: {
      projection?: Document;
      sort?: Document;
      limit?: number;
      skip?: number;
    } = {},
  ): Promise<T[]> {
    const result = await this.callApi("find", {
      filter,
      projection,
      sort,
      limit,
      skip,
    });
    return result.documents;
  }

  updateOne(
    filter: Document,
    update: Document,
    { upsert }: { upsert?: boolean },
  ): Promise<
    { matchedCount: number; modifiedCount: number; upsertedId?: string }
  > {
    return this.callApi("updateOne", {
      filter,
      update,
      upsert,
    });
  }

  updateMany(
    filter: Document,
    update: Document,
    { upsert }: { upsert?: boolean },
  ): Promise<
    { matchedCount: number; modifiedCount: number; upsertedId?: string }
  > {
    return this.callApi("updateMany", {
      filter,
      update,
      upsert,
    });
  }

  replaceOne(
    filter: Document,
    replacement: Document,
    { upsert }: { upsert?: boolean },
  ): Promise<
    { matchedCount: number; modifiedCount: number; upsertedId?: string }
  > {
    return this.callApi("replaceOne", {
      filter,
      replacement,
      upsert,
    });
  }

  deleteOne(filter: Document): Promise<{ deletedCount: number }> {
    return this.callApi("deleteOne", { filter });
  }

  deleteMany(filter: Document): Promise<{ deletedCount: number }> {
    return this.callApi("deleteMany", { filter });
  }

  async aggregate<T = Document>(pipeline: Document[]): Promise<T[]> {
    const result = await this.callApi("aggregate", { pipeline });
    return result.documents;
  }

  async countDocuments(
    filter?: Document,
    options?: { limit?: number; skip?: number },
  ): Promise<number> {
    const pipeline: Document[] = [];
    if (filter) {
      pipeline.push({ $match: filter });
    }

    if (typeof options?.skip === "number") {
      pipeline.push({ $skip: options.limit });
    }

    if (typeof options?.limit === "number") {
      pipeline.push({ $limit: options.limit });
    }

    pipeline.push({ $group: { _id: 1, n: { $sum: 1 } } });

    const [result] = await this.aggregate<{ n: number }>(pipeline);
    if (result) return result.n;
    return 0;
  }

  async estimatedDocumentCount(): Promise<number> {
    const pipeline = [
      { $collStats: { count: {} } },
      { $group: { _id: 1, n: { $sum: "$count" } } },
    ];

    const [result] = await this.aggregate<{ n: number }>(pipeline);
    if (result) return result.n;
    return 0;
  }

  // deno-lint-ignore no-explicit-any
  async callApi(method: string, extra: Document): Promise<any> {
    const { endpoint, dataSource, headers } = this.client;
    const url = `${endpoint}/action/${method}`;

    const response = await this.client.fetch(url, {
      method: "POST",
      headers,
      body: EJSON.stringify({
        collection: this.name,
        database: this.database.name,
        dataSource: dataSource,
        ...extra,
      }),
    });

    const body = await response.text();

    if (!response.ok) {
      throw new Error(`${response.statusText}: ${body}`);
    }

    return EJSON.parse(body);
  }
}
