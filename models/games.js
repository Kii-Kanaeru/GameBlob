const mongoose = require("mongoose")

const gameDisplaySchema = new mongoose.Schema({
    name : String,
    desc : String,
    price : Number,
    img: {
        high_res:[{
            type: String
        }],
        title_img : String
    },
    sys_req : String
})

module.exports = mongoose.model("game", gameDisplaySchema); 