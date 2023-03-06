const express = require("express");
const router = express.Router();
const objectId = require("mongoose").Types.ObjectId;

const bcrypt = require("bcrypt");
const saltRounds = 10;

const UserModel = require("../models/User");

var slug = require("slug");
const validator = require("validator");
const nodemailer = require("nodemailer");

// GENERATES A RANDOM TOKEN
function makeToken(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

router.get("/", (req, res) => {
  UserModel.find((err, docs) => {
    if (!err) res.send(docs);
    else console.log("Could not get data : " + err);
  });
});

router.get("/:slug", async (req, res) => {
  let data = {};
  const user = await UserModel.aggregate([
    {
      $match: { slug: { $eq: req.params.slug } },
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
        username: 1,
        badges: 1,
        createdAt: 1,
        banned: 1,
      },
    },
  ]);
  if (user[0]) res.send(user[0]);
  else res.status(400).send("Aucun utilisateur trouvé.");
});

router.post("/register/step1", async (req, res) => {
  req.fields.slug = slug(req.fields.username);
  req.fields.mentorToken = req.fields.slug + makeToken(30);
  req.fields.confirmationToken = req.fields.slug + makeToken(30);
  const errors = {};
  let exists;
  let transporter = nodemailer.createTransport({
    // service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "smokehelper1@gmail.com",
      pass: process.env.NODEMAILER_PASS,
    },
  });

  // email verif
  if (!validator.isEmail(req.fields.email)) {
    errors.email = "Format d'adresse e-mail invalide.";
  } else {
    exists = await UserModel.isEmailTaken(req.fields.email);
    if (exists) {
      console.log(res);
      errors.email = "Adresse e-mail indisponible.";
    }
  }

  // username verif
  if (
    req.fields.username &&
    req.fields.username.length >= 3 &&
    req.fields.username.length <= 26
  ) {
    exists = await UserModel.isUsernameTaken(req.fields.username);
    if (exists) {
      errors.username = "Nom d'utilisateur indisponible.";
    }
  } else {
    errors.username = "Veuillez entrer entre 3 et 26 caractères.";
  }

  // verif mdp

  if (
    req.fields.password &&
    req.fields.password.length >= 8 &&
    req.fields.password.length <= 50
  ) {
    if (
      !req.fields.password.match(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
      )
    ) {
      errors.password =
        "Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre.";
    }
  } else {
    errors.password = "Veuillez entrer entre 8 et 50 caractères.";
  }

  if (Object.keys(errors).length !== 0) {
    res.status(400).send(errors);
    return;
  }

  // PASSWORD HASH
  bcrypt.hash(req.fields.password, saltRounds, function (err, hash) {
    if (err) {
      res.status(400).send(err);
      return;
    }
    req.fields.password = hash;
    const newUser = new UserModel(req.fields);
    console.log(hash);
    newUser.save((err, docs) => {
      if (!err) {
        const mailConfig = {
          from: "SmokeHelper <smokehelper1@gmail.com>",
          to: req.fields.email,
          subject: "Confirmez votre adresse mail",
          text: "Bonjour",
          html:
            "<p>Bonjour " +
            req.fields.username +
            ", veuillez copier le code ci-dessous pour confirmer votre adresse mail, puis vous connecter à votre compte. Il vous sera demandé d'entrer ce code lors de votre premiere connection.</p><span style='background-color: #55886F;padding: 5px;color: white;font-weight: bold'>" +
            req.fields.confirmationToken +
            "</span>",
        };
        transporter.sendMail(mailConfig, (err, info) => {
          console.log(info);
          if (err) {
            console.log(err);
          }
        });
        res.send(docs);
      } else {
        res.status(400).send(err);
      }
    });
  });
});

router.post("/login", async (req, res) => {
  const user = await UserModel.aggregate([
    //   check if email or username exists
    {
      $match: {
        $and: [
          {
            $or: [
              { username: { $eq: req.fields.usernameEmail } },
              { email: { $eq: req.fields.usernameEmail } },
            ],
          },
          { banned: { $eq: false } },
        ],
      },
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
        username: 1,
        slug: 1,
        email: 1,
        confirmed: 1,
        role: 1,
        password: 1,
        badges: 1,
        cigInfo: 1,
      },
    },
  ]);
  if (user[0]) {
    bcrypt.compare(
      req.fields.password,
      user[0].password,
      function (err, result) {
        delete user[0].password;
        if (user[0] && result === true) res.send(user[0]);
        else res.status(400).send("Aucun utilisateur trouvé.");
      }
    );
  } else res.status(400).send("Aucun utilisateur trouvé.");
});

router.post("/confirmMail/:token", async (req, res) => {
  if (!req.fields.userId || !objectId.isValid(req.fields.userId)) {
    res.status(400).send("Aucun utilisateur spécifié ou ID invalide.");
  }
  if (!req.params.token) {
    res.status(400).send("Aucun token spécifié.");
  }
  const token = req.params.token;
  const userId = objectId(req.fields.userId);
  let userFound = await UserModel.findOneAndUpdate(
    {
      _id: userId,
      banned: false,
      confirmed: false,
      confirmationToken: token,
    },
    { $set: { confirmed: true, confirmationToken: null } }
  );
  if (!userFound) {
    res.status(400).send("Aucun utilisateur trouvé.");
  }
  res.status(200).send({ status: "success", data: userFound });
});

// update
router.put("/:id", (req, res) => {
  if (!objectId.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

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

// delete
router.delete("/:id", (req, res) => {
  if (!objectId.isValid(req.params.id))
    return res.status(400).send("ID unknow ! " + req.params.id);

  UserModel.findByIdAndRemove(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else console.log("Delete error : " + err);
  });
});

module.exports = router;
