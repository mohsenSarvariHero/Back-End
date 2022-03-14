const mongoose = require('mongoose');
const HomeSchema = new mongoose.Schema({
    name: {
        type: String,

    },
    ability: {
        type: String,

    },
    date: {
        type: String,
        default: Date()
    }
});
const Home = mongoose.model('Home', HomeSchema);
module.exports = Home;