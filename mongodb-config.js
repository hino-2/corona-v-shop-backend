const MongoClient = require("mongodb").MongoClient;
const Cursor = require("mongodb").Cursor;

const initMongo = async () => {
	const uri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASS}@hino-2-cluster-yminm.mongodb.net/corona?retryWrites=true&w=majority`;
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

	await client.connect();
	const db = client.db("corona");

	Cursor.prototype.pagination = function (pageStart, pageEnd) {
		if (pageStart === "none") return this;

		return this.skip(pageStart).limit(pageEnd);
	};

	return db;
};

module.exports = initMongo;
