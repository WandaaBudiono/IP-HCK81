const { Favorite, User } = require("../models");
const { comparePassword } = require("../helper/bcrypt");
const { signToken } = require("../helper/jwt");

module.exports = class userController {
  static async register(req, res) {
    try {
      const { username, email, password, house } = req.body;

      if (!username || !email || !password || !house) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const newUser = await User.create({
        username,
        email,
        password: hashPassword(password),
        house,
      });

      res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        house: newUser.house,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email) return res.status(401).json({ message: "Email is required" });
      if (!password)
        return res.status(401).json({ message: "Password is required" });
      const user = await User.findOne({ where: { email } });
      if (!user || !comparePassword(password, user.password)) {
        return res.status(401).json({ message: "Email/Password is Invalid" });
      }

      const access_token = signToken({ id: user.id });
      res.status(200).json({ access_token });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
