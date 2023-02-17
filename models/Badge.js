const mongoose = require("mongoose");

const validator = require("validator");

const BadgeModel = mongoose.Schema({
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

BadgeModel.statics.isTitleTaken = async function (title) {
  return await this.findOne({ title: title.trim() });
};

module.exports = user = mongoose.model("badges", BadgeModel);
