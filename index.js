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

// ROUTES
const usersRoute = require("./routes/users");
const badgesRoute = require("./routes/badges");
const cigarettesRoute = require("./routes/cigarettes");

app.use("/users", usersRoute);
app.use("/badges", badgesRoute);
app.use("/cigarettes", cigarettesRoute);

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(formidableMiddleware());

app.listen(3000, () => {
  console.log("Server is running (port 3000)!");
});
