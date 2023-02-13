const mongoose = require("mongoose");

const UserModel = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
});

module.exports = user = mongoose.model("users", UserModel);
