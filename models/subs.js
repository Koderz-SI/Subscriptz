const mongoose = require('mongoose');

const subsSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        required: true,
    },
    expr_date: {
        type: Date,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    platform: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('subs', subsSchema);