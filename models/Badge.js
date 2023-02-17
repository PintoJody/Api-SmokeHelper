const mongoose = require("mongoose");

const validator = require("validator");

const UserModel = mongoose.Schema({
  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    required: true,
    trim: true,
  },
});

UserModel.statics.isEmailTaken = async function (email) {
  return await this.findOne({ email: email.trim() });
};
UserModel.statics.isUsernameTaken = async function (username) {
  return await this.findOne({ username: username.trim() });
};

module.exports = user = mongoose.model("users", UserModel);
