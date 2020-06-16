process.env.NODE_ENV = "test";

const expect = require("chai").expect;
const request = require("supertest");
const randomEmail = require("random-email");

const app = require("../server.js");
const initMongoTest = require("../mongodb-config").initMongoTest;
const disconnectMongo = require("../mongodb-config").disconnectMongo;

const fakeEmail = randomEmail();

describe("Authentication", () => {
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

	it("OK, creating new user works", (done) => {
		request(app)
			.post("/register")
			.send({
				id: "1278f727-7407-4548-ab72-25babe1c3e66",
				name: "igor",
				email: fakeEmail,
				password: "password",
				saldo: 0,
			})
			.then((res) => {
				expect(res.body.result).to.equal("success");
				done();
			})
			.catch((err) => done(err));
	});

	it("OK, creating new user with existing email fails", (done) => {
		request(app)
			.post("/register")
			.send({
				id: "1278f727-7407-4548-ab72-25babe1c3e66",
				name: "igor",
				email: fakeEmail,
				password: "password",
				saldo: 0,
			})
			.then((res) => {
				expect(res.body.result).to.equal("existing email");
				done();
			})
			.catch((err) => done(err));
	});

	it("OK, login of existing user works", (done) => {
		request(app)
			.post("/login")
			.send({
				id: "1278f727-7407-4548-ab72-25babe1c3e66",
				name: "igor",
				email: fakeEmail,
				password: "password",
				saldo: 0,
			})
			.then((res) => {
				expect(res.body).to.contain.property("_id");
				expect(res.body).to.contain.property("id");
				expect(res.body).to.contain.property("name");
				expect(res.body).to.contain.property("email");
				expect(res.body).to.contain.property("password");
				expect(res.body).to.contain.property("saldo");
				done();
			})
			.catch((err) => done(err));
	});

	it("OK, login of not existing user fails", (done) => {
		request(app)
			.post("/login")
			.send({
				email: "asd",
				password: "w",
			})
			.then((res) => {
				expect(res.body.error).to.equal("User doesnt exists");
				done();
			})
			.catch((err) => done(err));
	});

	it("OK, login of existing user with wrong password fails", (done) => {
		request(app)
			.post("/login")
			.send({
				id: "1278f727-7407-4548-ab72-25babe1c3e66",
				name: "igor",
				email: fakeEmail,
				password: "wrong password",
				saldo: 0,
			})
			.then((res) => {
				expect(res.body.error).to.equal("Wrong password");
				done();
			})
			.catch((err) => done(err));
	});
});
