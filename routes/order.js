var express = require("express");
var router = express.Router();

router.get("/:orderId", async (req, res) => {
	try {
		const order = await req.app.get("db").collection("orders").find({ orderID: req.params.orderId }).toArray();

		res.status(200).json({
			orderID: order[0].orderID,
			total: order[0].total,
			details: generateOrderDetailsTable(order[0].listOfProducts),
		});
	} catch (error) {
		res.status(500).json({ error: error });
	}
});

module.exports = router;

const generateOrderDetailsTable = (listOfProducts) => {
	let productsGroups = new Set();
	let productTable = [];

	listOfProducts.forEach((product) => productsGroups.add(product.name));

	productsGroups.forEach((name) => {
		productTable.push({
			name: name,
			category: listOfProducts.find((item) => item.name === name).category,
			amount: listOfProducts.filter((item) => item.name === name).length,
			pricePerUnit: listOfProducts.find((item) => item.name === name).price,
			priceTotal: Number(
				listOfProducts
					.filter((item) => item.name === name)
					.reduce((total, item) => {
						return (total += item.price);
					}, 0)
					.toFixed(2)
			),
		});
	});

	return productTable;
};
