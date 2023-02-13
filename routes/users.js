const express = require("express");
const router = express.Router();
const objectId = require("mongoose").Types.ObjectId;

const UserModel = require("../models/User");

const bodyParser = require("body-parser");

const jsonParser = bodyParser.json();

router.get("/", (req, res) => {
  UserModel.find((err, docs) => {
    if (!err) res.send(docs);
    else console.log("Could not get data : " + err);
  });
});

router.get("/:id", (req, res) => {
  UserModel.findById(req.params.id).then((data, err) => {
    if (!err) res.send(data);
    else console.log("Could not get data : " + err);
  });
});

router.post("/", (req, res) => {
  const newUser = new UserModel({
    username: req.fields.username,
  });

  newUser.save((err, docs) => {
    if (!err) res.send(docs);
    else console.log("Error creating new data : " + err);
  });
});

router.put("/:id", (req, res) => {
  if (!objectId.isValid(req.params.id))
    return res.status(400).send("ID unknown ! " + req.params.id);

  const updateItem = req.fields;

  UserModel.findByIdAndUpdate(
    req.params.id,
    { $set: updateItem },
    { new: true },
    (err, docs) => {
      if (!err) res.send(docs);
      else console.log("Update error : " + err);
    }
  );
});

router.delete("/:id", (req, res) => {
  if (!objectId.isValid(req.params.id))
    return res.status(400).send("ID unknow ! " + req.params.id);

  UserModel.findByIdAndRemove(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else console.log("Delete error : " + err);
  });
});

module.exports = router;
