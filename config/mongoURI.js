const dotenv = require("dotenv");

dotenv.config();

module.exports = `mongodb+srv://admin:${process.env.PASSWORD}@subscriptz.2ozq8.mongodb.net/Koderz?retryWrites=true&w=majority`;
