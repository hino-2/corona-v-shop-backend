if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

const express = require("express");
const history = require("connect-history-api-fallback");
const initMongo = require("./mongodb-config").initMongo;

{
	// const passport = require("passport");
	// const initPassport = require("./passport-config");
	// const flash = require("express-flash");
	// const session = require("express-session");
	// const path = require("path");
	// const ejs = require("ejs");
	// const fs = require("fs");
	// const methodOverride = require("method-override");
}

const app = express();

// mongo start
(async function () {
	const db = await initMongo();
	app.set("db", db);
})();
// mongo end

{
	// initPassport(
	// 	passport,
	// 	(email) => users.find((user) => user.email == email),
	// 	(id) => users.find((user) => user.id == id)
	// );
}

app.use(history());
app.use("/", express.static(__dirname + "/"));
app.use("/static", express.static(__dirname + "/static"));
app.use("/img", express.static(__dirname + "/img"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

{
	// app.set('view-engine', 'ejs')
	// app.use(flash());
	// app.use(
	// 	session({
	// 		genid: () => uuidv4(),
	// 		secret: "process.env.SESSION_SECRET",
	// 		resave: false,
	// 		saveUninitialized: false,
	// 	})
	// );
	// app.use(passport.initialize());
	// app.use(passport.session());
	// app.use(methodOverride("_method"));
}

const categoriesRouter = require("./routes/categories");
const productsAmountRouter = require("./routes/productsAmount");
const productsRouter = require("./routes/products");
const ordersRouter = require("./routes/orders");
const orderRouter = require("./routes/order");
const registerRouter = require("./routes/register");
const loginRouter = require("./routes/login");
const registerOrderRouter = require("./routes/registerOrder");

app.use("/categories", categoriesRouter);
app.use("/productsAmount", productsAmountRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);
app.use("/order", orderRouter);
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/registerOrder", registerOrderRouter);

const server = app.listen(process.env.PORT || 8080);

module.exports = server;

/// ===================================================================================================
/// ========================================= THE END =================================================
/// ===================================================================================================

{
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

	app.delete("/logoutUser", (req, res) => {
		// if (req.body.userID === undefined) return res.sendStatus(403);
		// const user = users.find((user) => user.id === req.body.userID);
		// user.isLoggedIn = false;
		// req.logOut();
		// res.send(JSON.stringify({ result: "success" }));
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
}
