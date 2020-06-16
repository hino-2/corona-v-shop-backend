const MongoClient = require("mongodb").MongoClient;
const Cursor = require("mongodb").Cursor;

Cursor.prototype.pagination = function (pageStart, pageEnd) {
	if (pageStart === "none") return this;
	return this.skip(pageStart).limit(pageEnd);
};

const mongoUser = process.env.NODE_ENV === "test" ? process.env.MONGOUSERTEST : process.env.MONGOUSER;
const mongoPass = process.env.NODE_ENV === "test" ? process.env.MONGOPASSTEST : process.env.MONGOPASS;
const mongoDB = process.env.NODE_ENV === "test" ? "corona-test" : "corona";

const uri = `mongodb+srv://${mongoUser}:${mongoPass}@hino-2-cluster-yminm.mongodb.net/${mongoDB}?retryWrites=true&w=majority`;

const initMongo = async () => {
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

	await client.connect();
	const db = client.db(mongoDB);

	return db;
};

const initMongoTest = async () => {
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

	return client.connect();
};

const disconnectMongo = (conn) => {
	return conn.close(true);
};

module.exports = { initMongo, disconnectMongo, initMongoTest };
