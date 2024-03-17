const dotenv = require("dotenv");
const connectDatabase = require("./db.js");
const cors = require("cors");
require("dotenv").config();
const express = require("express");
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoute");
const googleAuthRoutes = require("./routes/googleAuthRoute");


// Config
dotenv.config({ path: "config/config.env" });
const port = process.env.PORT || 8080;

const app = express();
app.use(cors());

connectDatabase();
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));

require('./googleAuth')(passport);

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'keyboard cat', // Use environment variable for secret
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/v1", userRoutes);
app.use("/auth", googleAuthRoutes);
app.post('/', (req, res) => {
    // Send a response with a status code of 200 (OK) and a JSON object
    res.status(200).json({ message: 'Hello, world!' });
});

// Middleware for Errors
app.use(errorMiddleware);

//Handling Uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`shutting down server due to Uncaught Exception`);
    process.exit(1);
});

const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Unhandled Promise Rejection --> Mogodb Server Error
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down server due to Unhandled Promis Rejection`);
    server.close(() => {
        process.exit(1);
    });
});