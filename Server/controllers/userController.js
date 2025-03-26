const { User } = require("../models");
const { comparePassword } = require("../helper/bcrypt");
const { signToken } = require("../helper/jwt");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports = class userController {
  static async register(req, res) {
    try {
      const { username, email, password, house } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const newUser = await User.create({
        username,
        email,
        password,
      });

      res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email) return res.status(400).json({ message: "Email is required" });
      if (!password)
        return res.status(400).json({ message: "Password is required" });

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

  static async googleLogin(req, res) {
    try {
      const { googleToken } = req.body;

      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      const [user, created] = await User.findOrCreate({
        where: { email: payload.email },
        defaults: {
          username: payload.name,
          email: payload.email,
          password: "google_id",
          house: null,
          isGoogleAccount: true,
        },
        hooks: false,
      });

      const access_token = signToken({ id: user.id });

      res.status(created ? 201 : 200).json({
        message: created ? "User created successfully" : "User logged in",
        access_token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          picture: user.picture,
        },
      });
    } catch (error) {
      console.error("Google Login Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
