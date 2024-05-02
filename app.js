require("dotenv").config();
const express = require("express");
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoutes = require("./routes/userRoute");
const googleAuthRoutes = require("./routes/googleAuthRoute");

const app = express();

app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));

require('./googleAuth')(passport);

// Session configuration 
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

// Middleware for Errors
app.use(errorMiddleware);

module.exports = app;