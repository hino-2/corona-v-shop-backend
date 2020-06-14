var express = require("express");
var router = express.Router();

router.get("/:orderId", async (req, res) => {
	try {
		const order = await req.app.get("db").collection("orders").find({ orderID: req.params.orderId }).toArray();

		res.status(200).json(order[0]);
	} catch (error) {
		res.status(500).json({ error: error });
	}
});

module.exports = router;
