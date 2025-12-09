const db = require("./db")
const express = require("express")
const cors = require("cors")
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const session = require("express-session")

const app = express()

app.set('trust proxy', 1)

app.use(cookieParser())
app.use(express.json())

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie']
}));

app.use(session({
    secret: "asdasdasdasdasdasd",
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "none", // только для codespaces
        secure: true, // false если localhost
        domain: undefined //Для codespaces
    }
}))

app.get("/me", (req, res) => {
    console.log(req.session)
    if (req.session.userId) {
        return res.json({
            loggedIn: true,
            user: {
                id: req.session.userId,
                email: req.session.email
            }
        });
    }

    res.json({ loggedIn: false });
});
app.get("/auth/me", (req, res) => {
    console.log(req.status)
    if (req.session.userId) {
        return res.json({ loggedIn: true })
    }
})
app.post("/signup", (req, res) => {
    try {
        const hashed = bcrypt.hashSync(req.body.password, 10)
        const newUser = db
            .prepare(`INSERT INTO users (email, password) VALUES (?, ?)`)
            .run(req.body.email, hashed);
        const createdUser = db
            .prepare(`SELECT * FROM users WHERE id = ?`)
            .get(newUser.lastInsertRowid);

        req.session.userId = createdUser.id;
        req.session.email = createdUser.email;



        res.status(201).json({
            message: "User registered",
            user: createdUser
        });
    } catch (error) {
        console.error(error)
        res.status(400).json(error)
    }
})

app.post("/signin", (req, res) => {
    const { email, password } = req.body
    const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email)

    if (!user) 
        res.status(401).json({ error: "Неправильные данные1" })
    const validPassword = bcrypt.compareSync(password, user.password)
    if (!validPassword) 
        res.status(401).json({ error: "Неправильные данные2" })
    req.session.email = user.email
    req.session.userId = user.id
    res.status(200).json(user)
})

app.listen("3000", () => {
    console.log("Порт3000")
})
