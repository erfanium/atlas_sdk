# Atlas

> **atlas** is a TypeSafe **MongoDB Atlas Data API** SDK for Deno & Deno Deploy

[![Discord server](https://img.shields.io/discord/768918486575480863?color=blue&label=Ask%20for%20help%20here&logo=discord&style=flat-square)](https://discord.gg/HEdTCvZUSf)

## Links

- [Docs](https://doc.deno.land/https/deno.land/x/atlas/mod.ts)

### Import

Replace `LATEST_VERSION` with
[current latest version](https://deno.land/x/atlas)

```ts
import {
  Bson,
  MongoClient,
} from "https://deno.land/x/atlas@LATEST_VERSION/mod.ts";
```

### Connect

```ts
const client = new MongoClient({
   appId: "YOUR_APP_ID",
   dataSource: "YOUR_CLUSTER_NAME",
   apiKey: "YOUR_API_KEY",
});
```

### Access Collection

```ts
// Defining schema interface
interface UserSchema {
  _id: ObjectId | string;
  username: string;
  password: string;
}

const db = client.database("test");
const users = db.collection<UserSchema>("users");
```

### Insert

```ts
const insertId = await users.insertOne({
  username: "user1",
  password: "pass1",
});

const insertIds = await users.insertMany([
  {
    username: "user1",
    password: "pass1",
  },
  {
    username: "user2",
    password: "pass2",
  },
]);
```

### Find

```ts
const user1 = await users.findOne({ _id: insertId });

const all_users = await users.find({ username: { $ne: null } });

// find by ObjectId
const user1_id = await users.findOne({
  _id: new ObjectId("SOME OBJECTID STRING"),
});
```

### Count

```ts
const count = await users.countDocuments({ username: { $ne: null } });

const estimatedCount = await users.estimatedDocumentCount({
  username: { $ne: null },
});
```

### Aggregation

```ts
const docs = await users.aggregate([
  { $match: { username: "many" } },
  { $group: { _id: "$username", total: { $sum: 1 } } },
]);
```

### Update

```ts
const { matchedCount, modifiedCount, upsertedId } = await users.updateOne(
  { username: { $ne: null } },
  { $set: { username: "USERNAME" } },
);

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

```ts
const deleteCount = await users.deleteOne({ _id: insertId });

const deleteCount2 = await users.deleteMany({ username: "test" });
```