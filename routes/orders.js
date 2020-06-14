var express = require("express");
var router = express.Router();

router.get("/:userId", async (req, res) => {
	try {
		const orders = await req.app.get("db").collection("orders").find({ userID: req.params.userId }).toArray();

		res.status(200).json(orders);
	} catch (error) {
		res.status(500).json({ error: error });
	}
});

module.exports = router;
