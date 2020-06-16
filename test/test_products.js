process.env.NODE_ENV = "test";

const expect = require("chai").expect;
const request = require("supertest");

const app = require("../server.js");
const initMongoTest = require("../mongodb-config").initMongoTest;
const disconnectMongo = require("../mongodb-config").disconnectMongo;

describe("Get products", () => {
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

	it("OK, find products by category works", (done) => {
		request(app)
			.get("/products/%D0%91%D1%83%D0%BD%D0%BA%D0%B5%D1%80%D1%8B")
			.then((res) => {
				expect(res.body[0]).to.contain.property("_id");
				expect(res.body[0]).to.contain.property("id");
				done();
			})
			.catch((err) => done(err));
	});

	it("OK, asc sorting by price works", (done) => {
		request(app)
			.get("/products/%D0%91%D1%83%D0%BD%D0%BA%D0%B5%D1%80%D1%8B/asc")
			.then((res) => {
				expect(res.body[1].price).to.be.above(res.body[0].price);
				done();
			})
			.catch((err) => done(err));
	});

	it("OK, desc sorting by price works", (done) => {
		request(app)
			.get("/products/%D0%91%D1%83%D0%BD%D0%BA%D0%B5%D1%80%D1%8B/desc")
			.then((res) => {
				expect(res.body[0].price).to.be.above(res.body[1].price);
				done();
			})
			.catch((err) => done(err));
	});

	it("OK, desktop pagination works", (done) => {
		request(app)
			.get("/products/%D0%92%D1%81%D0%B5/asc/1")
			.then((res) => {
				expect(res.body.length).to.equal(4);
				done();
			})
			.catch((err) => done(err));
	});

	it("OK, mobile pagination works", (done) => {
		request(app)
			.get("/products/%D0%92%D1%81%D0%B5/asc/2")
			.set(
				"User-Agent",
				"Mozilla/5.0 (Linux; Android 6.0.1; SM-G920V Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.98 Mobile Safari/537.36"
			)
			.then((res) => {
				expect(res.body.length).to.equal(2);
				done();
			})
			.catch((err) => done(err));
	});

	it("OK, searching works", (done) => {
		request(app)
			.get("/products/%D0%92%D1%81%D0%B5/asc/1/deluxe")
			.then((res) => {
				expect(res.body).to.be.a("array");
				done();
			})
			.catch((err) => done(err));
	});

	it("OK, getting amount of products in category works", (done) => {
		request(app)
			.get("/productsAmount/%D0%92%D1%81%D0%B5/")
			.then((res) => {
				expect(res.body).to.be.a("number");
				done();
			})
			.catch((err) => done(err));
	});

	it("OK, getting amount of products in search results works", (done) => {
		request(app)
			.get("/productsAmount/%D0%92%D1%81%D0%B5/deluxe")
			.then((res) => {
				expect(res.body).to.be.a("number");
				done();
			})
			.catch((err) => done(err));
	});
});
