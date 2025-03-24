const { User } = require("../models");
const { signToken, verifyToken } = require("../helper/jwt");

async function authentication(req, res, next) {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const [type, accessToken] = req.headers.authorization.split(" ");
    if (!accessToken) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const data = verifyToken(accessToken);
    const user = await User.findByPk(data.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = authentication;
