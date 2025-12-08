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
app.get("auth/me", (req,res) =>
{
    console.log(req.status)
    if (req.session.userId) {
        return res.json({loggedIn: true})
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
        res.json(error)
    }
})
app.post("auth/signin", (req,res) => {
    try {
        const { username, password } = req.body

        if (!username || !password) {
            return res
                .status(400)
                .json({ error: 'Username and password are required' })
        }

        const db = await readDB()
        const user = db.users.find((u) => u.username === username)

        if (!user) {
            return res
                .status(401)
                .json({ error: 'Invalid username or password' })
        }

        const validPassword = await bcrypt.compare(password, user.password)

        if (!validPassword) {
            return res
                .status(401)
                .json({ error: 'Invalid username or password' })
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' },
        )

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Server error during login' })
    }
})
app.listen("3000", () => {
    console.log("Порт3000")
})
