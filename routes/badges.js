const express = require("express");
const router = express.Router();
const objectId = require("mongoose").Types.ObjectId;

const BadgeModel = require("../models/Badge");
const UserModel = require("../models/User");

var slug = require("slug");

router.get("/", (req, res) => {
  BadgeModel.find((err, docs) => {
    if (!err) res.send(docs);
    else console.log("Could not get data : " + err);
  });
});

router.get("/:id", (req, res) => {
  BadgeModel.findById(req.params.id).then((data, err) => {
    if (!err) res.send(data);
    else console.log("Could not get data : " + err);
  });
});

router.get("/user/:slug", async (req, res) => {
  // const idOrSlug = req.params.idOrSlug;
  const slug = req.params.slug;
  const user = await UserModel.aggregate([
    {
      $match: { slug: { $eq: slug } },
    },
    {
      $lookup: {
        from: "badges",
        localField: "badges",
        foreignField: "_id",
        as: "badges",
      },
    },
    {
      $project: {
        badges: 1,
      },
    },
  ]);
  if (user[0]) res.send(user[0].badges);
  else res.status(400).send("Aucun utilisateur trouvé.");
});

router.post("/create", async (req, res) => {
  const errors = {};
  let exists;

  // title verif
  if (
    !req.fields.title ||
    req.fields.title.length <= 3 ||
    req.fields.title.length >= 30
  ) {
    errors.title = "Veuillez entrer entre 3 et 30 caractères.";
  } else {
    exists = await BadgeModel.isTitleTaken(req.fields.title);
    if (exists) {
      errors.title = "Titre indisponible.";
    } else {
      req.fields.slug = slug(req.fields.title);
    }
  }

  // description verif
  if (
    req.fields.description &&
    req.fields.description.length >= 20 &&
    req.fields.description.length <= 300
  ) {
  } else {
    errors.description = "Veuillez entrer entre 20 et 300 caractères.";
  }

  console.log(errors);
  if (Object.keys(errors).length !== 0) {
    res.status(400).send(errors);
    return;
  }

  const newBadge = new BadgeModel(req.fields);
  newBadge.save((err, docs) => {
    if (!err) res.send(docs);
    else res.status(400).send(err);
  });
});

// update
router.put("/:id", (req, res) => {
  if (!objectId.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  const updateItem = req.fields;

  BadgeModel.findByIdAndUpdate(
    req.params.id,
    { $set: updateItem },
    { new: true },
    (err, docs) => {
      if (!err) res.send(docs);
      else console.log("Update error : " + err);
    }
  );
});

// delete
router.delete("/:id", (req, res) => {
  if (!objectId.isValid(req.params.id))
    return res.status(400).send("ID unknown ! " + req.params.id);

  BadgeModel.findByIdAndRemove(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else console.log("Delete error : " + err);
  });
});

module.exports = router;
