var express = require("express");
var router = express.Router();

router.get("/", async (req, res) => {
	try {
		const categories = await req.app.get("db").collection("category").find({}).toArray();

		res.status(200).json(categories);
	} catch (error) {
		res.status(500).json({ error: error });
	}
});

module.exports = router;
