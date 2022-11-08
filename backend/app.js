const dotenv = require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const router = require("./routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(cookieParser());
app.disable("x-powered-by");

app.use(express.static("public"));

app.use("/", router);

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
