//EXPRESS
const express = require("express");
const app = express();

//Connection to mongoDB
require("./config/db/conn");

//CORS
const cors = require("cors");
app.use(cors());

const bodyParser = require("body-parser");
const formidableMiddleware = require("express-formidable");

const usersRoute = require("./routes/users");

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(formidableMiddleware());

app.use("/users", usersRoute);

app.listen(3000, () => {
  console.log("Server is running (port 3000)!");
});
