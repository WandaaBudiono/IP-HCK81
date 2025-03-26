if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const router = require("./routes");
const errorHandler = require("./middleware/errorHandler");
var cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", router);
app.use(errorHandler);
if (process.env.NODE_ENV === "test") {
  app.use((req, res, next) => {
    req.user = { id: "1" };
    next();
  });
}

module.exports = app;
