require('dotenv').config({ path: "config/config.env" });
const mongoose = require("mongoose");

const connectDatabase = () => {
    mongoose.connect(process.env.DB_URI).then((data) => {
        console.log(`Mongodb Database Connected`);
    }).then(() => { }).catch((e) => {
        console.log(e)
    })
}

module.exports = connectDatabase; 