const app = require("./app");
const dotenv = require("dotenv");
const connectDatabase = require("./db.js");
const cors = require("cors");

app.use(cors());
//Handling Uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`shutting down server due to Uncaught Exception`);
    process.exit(1);
});

// Config
dotenv.config({ path: "config/config.env" });

//connecting to database
connectDatabase();
// require('./config/database');
const port = process.env.PORT || 8080;

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