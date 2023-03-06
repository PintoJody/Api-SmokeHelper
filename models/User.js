const mongoose = require("mongoose");

const validator = require("validator");
const { ObjectId } = require("mongodb");

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
  username: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid e-mail address format.");
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    default: "user",
  },
  resetPasswordToken: {
    type: String,
    default: "",
  },
  confirmationToken: {
    type: String,
    default: "",
  },
  confirmed: {
    type: Boolean,
    required: true,
    default: false,
  },
  banned: {
    type: Boolean,
    required: true,
    default: false,
  },
  badges: [
    {
      unlockedAt: {
        type: Date,
        required: true,
        default: new Date(),
      },
      badge: { type: ObjectId, required: true },
    },
  ],
  featuredBadge: {
    type: ObjectId,
    required: false,
  },
  mentorToken: {
    type: String,
    default: "",
  },
  cigInfo: {
    averagePackPrice: {
      type: Number,
      default: null,
    },
    cigsPerPack: {
      type: Number,
      default: null,
    },
    estimatedAveragePerDay: {
      type: Number,
      default: null,
    },
  },
});

UserModel.statics.isEmailTaken = async function (email) {
  return await this.findOne({ email: email.trim() });
};
UserModel.statics.isUsernameTaken = async function (username) {
  return await this.findOne({ username: username.trim() });
};

module.exports = user = mongoose.model("users", UserModel);
