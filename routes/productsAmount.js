var express = require("express");
var router = express.Router();

router.get("/:category?/:namemask?", async (req, res) => {
	let searchParams = req.params.category === "Все" ? {} : { category: req.params.category };
	if (req.params.namemask) searchParams = { name: { $regex: new RegExp(req.params.namemask, "i") } };

	try {
		const amount = await req.app.get("db").collection("products").countDocuments(searchParams);
		res.status(200).json(amount);
	} catch (error) {
		res.status(500).json({ error: error });
	}
});

module.exports = router;
