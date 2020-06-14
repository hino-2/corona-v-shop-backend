var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

router.post("/", async (req, res) => {
	try {
		const isExist =
			(await req.app.get("db").collection("users").find({ email: req.body.email }).toArray()).length > 0;
		if (isExist) throw "existing email";

		const hashedPassword = await bcrypt.hash(req.body.password, 10);

		const result = await req.app.get("db").collection("users").insertOne({
			id: uuidv4(),
			name: req.body.name,
			email: req.body.email,
			password: hashedPassword,
			saldo: 0,
		});

		res.status(200).json({ result: "success" });
	} catch (error) {
		res.status(500).json({ error: error });
	}
});

module.exports = router;
