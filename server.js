if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

const DOCS_PER_PAGE = 4;

const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const initPassport = require("./passport-config");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const history = require("connect-history-api-fallback");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const fs = require("fs");
const MongoClient = require("mongodb").MongoClient;

const app = express();

// mongo
const uri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASS}@hino-2-cluster-yminm.mongodb.net/corona?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let db;
(async function () {
	await client.connect();
	db = client.db("corona");
})();
// mongo end

initPassport(
	passport,
	(email) => users.find((user) => user.email == email),
	(id) => users.find((user) => user.id == id)
);

const transporter = nodemailer.createTransport({
	service: "Mail.ru",
	auth: {
		user: "info-corona@mail.ru",
		pass: "coronavirusshop",
	},
});

app.use(history());
app.use("/", express.static(__dirname + "/"));
app.use("/static", express.static(__dirname + "/static"));
app.use("/img", express.static(__dirname + "/img"));
app.use(express.urlencoded({ extended: false }));
// app.set('view-engine', 'ejs')
app.use(flash());
app.use(
	session({
		genid: () => uuidv4(),
		secret: "process.env.SESSION_SECRET",
		resave: false,
		saveUninitialized: false,
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(express.json());

app.get("/categories", async (req, res) => {
	try {
		const categories = await db.collection("category").find({}).toArray();

		res.status(200).json(categories);
	} catch (error) {
		res.status(500).json({ error: error });
	}
});

app.get("/productsAmount/:category?", async (req, res) => {
	try {
		const amount = await db
			.collection("products")
			.countDocuments(req.params.category === "Все" ? {} : { category: req.params.category });
		res.status(200).json(amount);
	} catch (error) {
		res.status(500).json({ error: error });
	}
});

app.get("/products/:category?/:sort?/:page?", async (req, res) => {
	if (req.params.page > 0) req.params.page--;
	const docsOffset = req.params.page ? req.params.page * DOCS_PER_PAGE : 0;

	try {
		let products = await db
			.collection("products")
			.find(req.params.category === "Все" ? {} : { category: req.params.category })
			.sort({ price: req.params.sort === "desc" ? -1 : 1 })
			.skip(docsOffset)
			.limit(DOCS_PER_PAGE)
			.toArray();

		res.status(200).json(products);
	} catch (error) {
		res.status(500).json({ error: error });
	}
});

app.get("/orders/:userId", async (req, res) => {
	try {
		const orders = await db.collection("orders").find({ user: req.params.userId }).toArray();

		res.status(200).json(orders);
	} catch (error) {
		res.status(500).json({ error: error });
	}
});

{
	// app.get('/', checkAuthenticated, (req, res) => {
	//     console.log(req.user.email)
	//     res.render('index.ejs', { email: req.user.email })
	// })
	// app.get('/register', checkNotAuthenticated, (req, res) => {
	//     res.render('register.ejs')
	// })
	// app.get('/login', checkNotAuthenticated, (req, res) => {
	//     res.render('login.ejs')
	// })
}

app.post("/register", async (req, res) => {
	try {
		const isExist = (await db.collection("users").find({ email: req.body.email }).toArray()).length > 0;
		if (isExist) throw "existing email";

		const hashedPassword = await bcrypt.hash(req.body.password, 10);

		const result = await db.collection("users").insertOne({
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

{
	// app.post('/login', checkNotAuthenticated, (req, res) => {
	//     console.log(req.body)
	//     // passport.authenticate('local', {
	//     //     successRedirect: 'http://localhost:3000/',
	//     //     failureRedirect: 'http://localhost:3000/login',
	//     //     failureFlash: true
	//     // })
	//     passport.authenticate('local', () => {
	//         console.log('authed')
	//         res.send(users.find(user => user.email == req.body.email).id).end()
	//     })
	// })
}

app.post("/login", async (req, res) => {
	try {
		const user = await db.collection("users").find({ email: req.body.email }).toArray();
		if (user.length === 0) throw "User doesnt exists";

		if (!bcrypt.compareSync(req.body.password, user[0].password)) throw "Wrong password";

		res.status(200).json(user[0]);
	} catch (error) {
		res.status(500).json({ error: error });
	}
});

app.post("/registerOrder", async (req, res) => {
	req.body.order.orderID = uuidv4();

	try {
		const result = await db.collection("orders").insertOne(req.body.order);

		res.status(200).json({ insertedCount: result.insertedCount, orderID: orderID });
	} catch (error) {
		res.status(500).json({ error: error });
	}

	if (!req.body.order.userID) return;
	// else email

	try {
		const user = await db.collection("users").find({ userId: req.body.order.userID }).toArray();
		if (user.length === 0) throw `No user found, ID: ${req.body.order.userID}`;

		req.body.order.userName = user[0].name;
		const mailOptions = {
			from: "info-corona@mail.ru",
			to: user[0].email,
			subject: `Ваш заказ № ${req.body.order.orderID} зарегистрирован // Шестой русский магазин КОРОНА`,
			html: ejs.render(fs.readFileSync("./templates/email.ejs", { encoding: "utf-8" }), req.body.order),
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

app.get("/search/:mask/:sort?/:page?", async (req, res) => {
	const docsOffset = req.params.page ? req.params.page * DOCS_PER_PAGE : 0;

	try {
		const result = await db
			.collection("products")
			.find({ name: { $regex: new RegExp(req.params.mask, "i") } })
			.sort({ price: req.params.sort === "desc" ? -1 : 1 })
			.skip(docsOffset)
			.limit(DOCS_PER_PAGE)
			.toArray();

		res.status(200).json(result);
	} catch (error) {
		res.status(500).json({ error: error });
	}
});

app.delete("/logoutUser", (req, res) => {
	// if (req.body.userID === undefined) return res.sendStatus(403);
	// const user = users.find((user) => user.id === req.body.userID);
	// user.isLoggedIn = false;
	// req.logOut();
	// res.send(JSON.stringify({ result: "success" }));
});

app.listen(process.env.PORT || 8080);

/// ===================================================================================================
app.post("/login", (req, res, next) => {
	passport.authenticate("local", (err, user, info) => {
		req.login(user, (err) => {
			if (!req.user) return res.send(JSON.stringify({ userID: null }));

			const user = users.find((user) => user.id === req.user.id);
			user.isLoggedIn = true;

			return res.send(JSON.stringify({ userID: user.id, username: user.name, saldo: user.saldo }));
		});
	})(req, res, next);
});

app.post("/addMoney", (req, res) => {
	let user = users.find((user) => user.id === req.body.userID);

	if (!user) {
		res.send(
			JSON.stringify({
				result: "no user specified",
			})
		);
		return;
	}

	user.saldo += parseInt(req.body.amount);
	res.send(
		JSON.stringify({
			result: "money added",
		})
	);
});

const checkAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) return next();

	res.redirect("http://localhost:3000/login");
};

const checkNotAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) return res.redirect("http://localhost:3000/");

	next();
};
