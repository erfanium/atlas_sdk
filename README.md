# Atlas SDK

> **atlas_sdk** is a TypeSafe
> [MongoDB Atlas Data API](https://www.mongodb.com/docs/atlas/api/data-api/#introduction)
> SDK for Deno & Deno Deploy & Web

[![Discord server](https://img.shields.io/discord/768918486575480863?color=blue&label=Ask%20for%20help%20here&logo=discord&style=flat-square)](https://discord.gg/HEdTCvZUSf)

## Why

- [x/mongo](https://github.com/denodrivers/deno_mongo) is not production ready
  and reliable, but this module is
- It's serverless friendly. because atlas data api uses `https` protocol,
  there's no need to wait for MongoClient to be connected. this will reduce cold
  start time.
- Can be used on Web and Node.js v17+ environments, because this module only
  depends on `fetch`

## Links

- [Docs](https://doc.deno.land/https/deno.land/x/atlas_sdk/mod.ts)

## Permissions

This module needs `net` permission. use `deno run --allow-net` command

### Import

Replace `LATEST_VERSION` with
[current latest version](https://deno.land/x/atlas_sdk)

```ts
import {
  MongoClient,
  ObjectId,
} from "https://deno.land/x/atlas_sdk@LATEST_VERSION/mod.ts";
```

### Constructor

#### Authenticate via email and password

[Documentation](https://www.mongodb.com/docs/atlas/app-services/authentication/email-password/#std-label-email-password-authentication)

```ts
const client = new MongoClient({
  endpoint: "https://data.mongodb-api.com/app/YOUR_APP_ID/endpoint/data/v1",
  dataSource: "YOUR_CLUSTER_NAME", // e.g. "Cluster0"
  auth: {
    email: "YOUR_EMAIL",
    password: "YOUR_PASSWORD",
  },
});
```

#### Authenticate via api-key

[Documentation](https://www.mongodb.com/docs/atlas/app-services/authentication/api-key/#std-label-api-key-authentication)

```ts
const client = new MongoClient({
  endpoint: "https://data.mongodb-api.com/app/YOUR_APP_ID/endpoint/data/v1",
  dataSource: "YOUR_CLUSTER_NAME", // e.g. "Cluster0"
  auth: {
    apiKey: "YOUR_API_KEY",
  },
});
```

#### Authenticate via custom JWT

[Documentation](https://www.mongodb.com/docs/atlas/app-services/authentication/custom-jwt/#std-label-custom-jwt-authentication)

```ts
const client = new MongoClient({
  endpoint: "https://data.mongodb-api.com/app/YOUR_APP_ID/endpoint/data/v1",
  dataSource: "YOUR_CLUSTER_NAME", // e.g. "Cluster0"
  auth: {
    jwtTokenString: "YOUR_JWT",
  },
});
```

### Define Schema Type

```ts
interface UserSchema {
  _id: ObjectId;
  username: string;
  password: string;
}

const db = client.database("test");
const users = db.collection<UserSchema>("users");
```

### Insert

#### insertOne

```ts
const insertId = await users.insertOne({
  _id: new ObjectId(),
  username: "user1",
  password: "pass1",
});
```

#### insertMany

```ts
const insertIds = await users.insertMany([{
  _id: new ObjectId(),
  username: "user1",
  password: "pass1",
}, {
  _id: new ObjectId(),
  username: "user2",
  password: "pass2",
}]);
```

### Find

#### findOne

```ts
const user1_id = await users.findOne({
  _id: new ObjectId("SOME OBJECTID STRING"),
});
```

#### find

```ts
const allActiveUsers = await users.find({ active: true });
```

### Count

#### countDocuments

```ts
// count of all active users
const count = await users.countDocuments({ active: true });
```

#### estimatedDocumentCount

```ts
// estimated count of all active users
const estimatedCount = await users.estimatedDocumentCount({ active: true });
```

### Aggregation

```ts
const docs = await users.aggregate([
  { $match: { username: "many" } },
  { $group: { _id: "$username", total: { $sum: 1 } } },
]);
```

### Update

#### updateOne

```ts
const { matchedCount, modifiedCount, upsertedId } = await users.updateOne(
  { username: { $ne: null } },
  { $set: { username: "USERNAME" } },
);
```

#### updateMany

```ts
const { matchedCount, modifiedCount, upsertedId } = await users.updateMany(
  { username: { $ne: null } },
  { $set: { username: "USERNAME" } },
);
```

### Replace

```ts
const { matchedCount, modifiedCount, upsertedId } = await users.replaceOne(
  { username: "a" },
  {
    username: "user1",
    password: "pass1",
  }, // new document
);
```

### Delete

#### deleteOne

```ts
const deleteCount = await users.deleteOne({ _id: insertId });
```

#### deleteMany

```ts
const deleteCount = await users.deleteMany({ username: "test" });
```
