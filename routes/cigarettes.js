const express = require("express");
const router = express.Router();
const objectId = require("mongoose").Types.ObjectId;

const { ObjectId } = require("mongodb");

const CigModel = require("../models/Cigarette");
router.get("/", (req, res) => {
  CigModel.find((err, docs) => {
    if (!err) res.send(docs);
    else console.log("Could not get data : " + err);
  });
});

router.get("/:id", (req, res) => {
  CigModel.findById(req.params.id).then((data, err) => {
    if (!err) res.send(data);
    else console.log("Could not get data : " + err);
  });
});

router.post("/create", async (req, res) => {
  // user verif
  if (!req.fields.userId || !objectId.isValid(req.fields.userId)) {
    res.status(400).send("Aucun utilisateur spécifié ou ID invalide.");
  }

  const newBadge = new CigModel(req.fields);
  newBadge.save((err, docs) => {
    if (!err) res.send(docs);
    else res.status(400).send(err);
  });
});

// delete
router.delete("/:id", (req, res) => {
  if (!objectId.isValid(req.params.id))
    return res.status(400).send("ID unknown ! " + req.params.id);

  CigModel.findByIdAndRemove(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else console.log("Delete error : " + err);
  });
});

module.exports = router;
