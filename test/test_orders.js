process.env.NODE_ENV = "test";

const expect = require("chai").expect;
const request = require("supertest");

const app = require("../server.js");
const initMongoTest = require("../mongodb-config").initMongoTest;
const disconnectMongo = require("../mongodb-config").disconnectMongo;

const fakeUserID = "1278f727-7407-4548-ab72-25babe1c3e66";

describe("Post and get orders", () => {
	let conn, orderID;

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

	it("OK, creating new order works", (done) => {
		request(app)
			.post("/registerOrder")
			.send({
				order: {
					delivery: {
						addressTo: "ул Черепанова",
						areaTo: null,
						cashOfDelivery: 11280,
						cityTo: "г Екатеринбург",
						indexTo: "991153",
						mailType: "ECOM",
						regionTo: "обл Свердловская",
					},
					listOfProducts: [
						{
							category: "Бункеры",
							desc:
								"Средний 4к. бункер. Бетонированные удобства с защищенным проходом и телевизором. На улице.",
							id: 3,
							name: "Safe Bunker Digital Deluxe",
							photo: "/img/bunker/3.png",
							price: 25000,
							Комнаты: 4,
						},
						{
							category: "Бункеры",
							desc:
								"Средний 4к. бункер. Бетонированные удобства с защищенным проходом и телевизором. На улице.",
							id: 3,
							name: "Safe Bunker Digital Deluxe",
							photo: "/img/bunker/3.png",
							price: 25000,
							Комнаты: 4,
						},
					],
					total: 50112.8,
					userID: fakeUserID,
				},
			})
			.then((res) => {
				expect(res.body.insertedCount).to.equal(1);
				expect(res.body).to.contain.property("orderID");
				orderID = res.body.orderID;
				done();
			})
			.catch((err) => done(err));
	});

	it("OK, recieving list of orders works", (done) => {
		request(app)
			.get(`/orders/${fakeUserID}`)
			.then((res) => {
				expect(res.body[0].orderID).to.equal(orderID);
				done();
			})
			.catch((err) => done(err));
	});

	it("OK, recieving order details works", (done) => {
		request(app)
			.get(`/order/${orderID}`)
			.then((res) => {
				expect(res.body).to.contain.property("orderID");
				expect(res.body).to.contain.property("delivery");
				expect(res.body).to.contain.property("listOfProducts");
				expect(res.body).to.contain.property("total");
				done();
			})
			.catch((err) => done(err));
	});
});
