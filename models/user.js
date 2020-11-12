const mongoose  = require("mongoose");

const userSchema = new mongoose.Schema({
    username : {
        type: String,
        required : [true, "Username cannot be blank!"]
    },

    password : {
        type: String,
        required : [true, "Password cannot be blank!"]
    },

    email : {
        type: String,
        required : [true, "Email address cannot be blank!"]
    },

    totalCorrect : {
        type: Number,
        min : 0
    },

    totalIncorrect : {
        type: Number,
        min : 0
    },

    totalSkipped : {
        type: Number,
        min : 0
    }

})

module.exports = mongoose.model("user", userSchema);