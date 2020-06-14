var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
	try {
		const user = await req.app.get("db").collection("users").find({ email: req.body.email }).toArray();
		if (user.length === 0) throw "User doesnt exists";

		if (!bcrypt.compareSync(req.body.password, user[0].password)) throw "Wrong password";

		res.status(200).json(user[0]);
	} catch (error) {
		res.status(500).json({ error: error });
	}
});

module.exports = router;
