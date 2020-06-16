var express = require("express");
var router = express.Router();
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");

const transporter = nodemailer.createTransport({
	service: "Mail.ru",
	auth: {
		user: "info-corona@mail.ru",
		pass: "coronavirusshop",
	},
});

router.post("/", async (req, res) => {
	req.body.order.orderID = uuidv4();

	try {
		const result = await req.app.get("db").collection("orders").insertOne(req.body.order);

		res.status(200).json({ insertedCount: result.insertedCount, orderID: req.body.order.orderID });
	} catch (error) {
		res.status(500).json({ error: error });
	}

	if (!req.body.order.userID || process.env.NODE_ENV === "test") return;
	// no user or testing mode -> done, else email

	try {
		const user = await req.app.get("db").collection("users").find({ id: req.body.order.userID }).toArray();
		if (user.length === 0) throw `No user found, ID: ${req.body.order.userID}`;

		req.body.order.userName = user[0].name;
		const mailOptions = {
			from: "info-corona@mail.ru",
			to: user[0].email,
			subject: `Ваш заказ № ${req.body.order.orderID} зарегистрирован // Шестой русский магазин КОРОНА`,
			html: ejs.render(
				fs.readFileSync(path.join(__dirname, "../templates/email.ejs"), { encoding: "utf-8" }),
				req.body.order
			),
		};
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.log(error);
				return;
			}
			console.log(`Email sent: ${info.response}`);
		});
	} catch (error) {
		console.log(`Wanted to send email to user with ID ${req.body.order.userID} and FAILED:`, error);
	}
});

module.exports = router;
