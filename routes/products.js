var express = require("express");
const mobile = require("is-mobile");

var router = express.Router();

router.get("/:category?/:sort?/:page?/:namemask?", async (req, res) => {
	DOCS_PER_PAGE = mobile({ ua: req.headers["user-agent"] }) && req.params.page != 1 ? 2 : 4;
	if (req.params.page > 0) req.params.page--;
	const docsOffset = isNaN(req.params.page) ? "none" : req.params.page * DOCS_PER_PAGE;

	let searchParams = req.params.category === "Все" ? {} : { category: req.params.category };
	if (req.params.namemask) searchParams = { name: { $regex: new RegExp(req.params.namemask, "i") } };

	try {
		let products = await req.app
			.get("db")
			.collection("products")
			.find(searchParams)
			.sort({ price: req.params.sort === "desc" ? -1 : 1 })
			.pagination(docsOffset, DOCS_PER_PAGE)
			.toArray();

		res.status(200).json(products);
	} catch (error) {
		res.status(500).json({ error: error });
	}
});

module.exports = router;
