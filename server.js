if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express        = require('express')
const bcrypt         = require('bcrypt')
const passport       = require("passport")
const initPassport   = require('./passport-config')
const flash          = require('express-flash')
const session        = require('express-session')
const methodOverride = require('method-override')
const { v4: uuidv4 } = require('uuid')
const path 			 = require('path')
var history          = require('connect-history-api-fallback')

const app = express()

initPassport(
    passport, 
    email => users.find(user => user.email == email),
    id => users.find(user => user.id == id)
)

app.use(history())
app.use("/", express.static(__dirname + '/'))
app.use("/static", express.static(__dirname + '/static'))
app.use("/img", express.static(__dirname + '/img'))
app.use(express.urlencoded({ extended: false }))
// app.set('view-engine', 'ejs')
app.use(flash())
app.use(session({
    genid: () => uuidv4(),
    secret: 'process.env.SESSION_SECRET',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(express.json())

let users = [
    // {
    //     id: uuidv4(),
    //     name: 'Иван',
    //     email: 'w@w',
    //     password: 'w',
    //     saldo: 58354123,
    //     isLoggedIn: false
    // },
    // {
    //     id: uuidv4(),
    //     name: 'Петр',
    //     email: 'q@q',
    //     password: 'q',
    //     saldo: 100500,
    //     isLoggedIn: false
    // }
]

let orders = []

const checkAuthenticated = (req, res, next) =>  {
    if(req.isAuthenticated()) 
        return next()

    res.redirect('http://localhost:3000/login')
}

const checkNotAuthenticated = (req, res, next) =>  {
    if(req.isAuthenticated()) 
        return res.redirect('http://localhost:3000/')

    next()
}

app.get('/users', (req, res) => {
    // res.json(users)
})

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


app.post('/register', /*checkNotAuthenticated,*/ async (req, res) => {
    if(users.find(user => user.email === req.body.email))
        return res.send(JSON.stringify({result: "existing email"}))

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: uuidv4(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            saldo: 0,
            isLoggedIn: false
        })
        res.send(JSON.stringify({result: "success"}))
    } catch (error) {
        res.send(JSON.stringify({result: "fail"}))
    }
    console.log(users)
})

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

app.post('/login', /*checkNotAuthenticated,*/ (req, res, next) => {
    console.log('Inside POST /login callback')
    passport.authenticate('local', (err, user, info) => {
        // console.log('Inside passport.authenticate() callback');
        // console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
        // console.log(`req.user: ${JSON.stringify(req.user)}`)
        req.login(user, (err) => {
            // console.log('Inside req.login() callback')
            // console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
            // console.log(`req.user: ${JSON.stringify(req.user)}`)
            if (!req.user) 
                return res.send(JSON.stringify({userID: null}))

            const user = users.find(user => user.id === req.user.id)
            user.isLoggedIn = true
            
            return res.send(JSON.stringify({userID: user.id, username: user.name, saldo: user.saldo}));
      })
    })(req, res, next);
})

app.post('/registerOrder', (req, res) => {
    const orderID = uuidv4()
    req.body.order.orderID = orderID
    orders.push(req.body.order)
    res.send(JSON.stringify({orderID: orderID}))
    // console.log(orders)
})

app.post('/getOrders', (req, res) => {
    if(req.body.userID)
        res.send(JSON.stringify(
            orders.filter(
                order => order.userID === req.body.userID
            ))
        )
    else
        res.send(JSON.stringify([]))
})

app.delete('/logoutUser', (req, res) => {
    if(req.body.userID === undefined) 
        return res.sendStatus(403);

    const user = users.find(user => user.id === req.body.userID)
    user.isLoggedIn = false
    
    req.logOut()
    res.send(JSON.stringify({result: "success"}))
})

app.listen(3001)