process.env.NODE_ENV = "test";

const expect = require("chai").expect;
const request = require("supertest");

const app = require("../server.js");
const initMongoTest = require("../mongodb-config").initMongoTest;
const disconnectMongo = require("../mongodb-config").disconnectMongo;

describe("Get categories", () => {
	let conn;

	before((done) => {
		initMongoTest()
			.then((_conn) => {
				conn = _conn;
				done();
			})
			.catch((err) => done(err));
	});

	after((done) => {
		disconnectMongo(conn)
			.then(() => done())
			.catch((err) => done(err));
	});

	it("OK, recieving categories works", (done) => {
		request(app)
			.get("/categories")
			.then((res) => {
				expect(res.body[0]).to.contain.property("name");
				done();
			})
			.catch((err) => done(err));
	});
});
