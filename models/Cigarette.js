const mongoose = require("mongoose");

const validator = require("validator");
const { ObjectId } = require("mongodb");

const CigaretteModel = mongoose.Schema({
  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
  userId: {
    type: ObjectId,
    required: true,
  },
});

module.exports = cigarette = mongoose.model("cigarettes", CigaretteModel);
