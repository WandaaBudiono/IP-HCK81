const { JsonWebTokenError } = require("jsonwebtoken");

function errorHandler(err, req, res, next) {
  console.log("Ini error handler:", err);

  if (err.name === "Unauthorized") {
    res.status(401).json({ message: err.message });
    return;
  }

  if (err.name === "InvalidToken" || err.name === "JsonWebTokenError") {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  if (err.name === "NotFound") {
    res.status(404).json({ message: err.message });
    return;
  }

  if (err.name === "BadRequest") {
    if (err.message === "Email/Password is invalid") {
      res.status(401).json({ message: err.message });
    } else {
      res.status(400).json({ message: err.message });
    }
    return;
  }

  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    res.status(400).json({ message: err.errors[0].message });
    return;
  }

  if (err.name === "Forbidden") {
    res.status(403).json({ message: err.message });
    return;
  }
  res.status(500).json({ message: "Internal server error from error handler" });
  return;
}

module.exports = errorHandler;
