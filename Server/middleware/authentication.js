const { User } = require("../models");
const { signToken, verifyToken } = require("../helper/jwt");

async function authentication(req, res, next) {
  try {
    if (!req.headers.authorization) {
      throw { name: "InvalidToken", message: "Invalid token" };
    }

    const [type, accessToken] = req.headers.authorization.split(" ");
    if (!accessToken) {
      throw { name: "InvalidToken", message: "Invalid token" };
    }

    const data = verifyToken(accessToken);
    const user = await User.findByPk(data.id);

    if (!user) {
      throw { name: "InvalidToken", message: "Invalid token" };
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
}

module.exports = authentication;
