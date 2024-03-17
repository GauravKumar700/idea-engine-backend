require('dotenv').config({ path: "config/config.env" });
const mongoose = require("mongoose");

const connectDatabase = () => {
    mongoose.connect(process.env.DB_URI).then((data) => {
        console.log(`Mongodb Database Connected`);
    });
}

module.exports = connectDatabase; 