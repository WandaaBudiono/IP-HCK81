const { Favorite, User } = require("../models");
const { Op } = require("sequelize");
const axios = require("axios");
const { getGroqChatCompletion } = require("../helper/groqhelper");
require("dotenv").config();
const { sendWelcomeEmail } = require("../helper/emailService");

module.exports = class favController {
  static async getAll(req, res, next) {
    try {
      let { house, q, pageNumber, pageSize, sortBy, sortOrder } = req.query;

      const response = await axios.get(
        "https://hp-api.onrender.com/api/characters"
      );
      let characters = response.data;

      if (house) {
        characters = characters.filter(
          (char) => char.house.toLowerCase() === house.toLowerCase()
        );
      }
      if (q) {
        characters = characters.filter((char) =>
          char.name.toLowerCase().includes(q.toLowerCase())
        );
      }

      if (sortBy) {
        sortOrder = sortOrder && sortOrder.toUpperCase() === "DESC" ? -1 : 1;
        characters.sort((a, b) => {
          if (a[sortBy] < b[sortBy]) return -sortOrder;
          if (a[sortBy] > b[sortBy]) return sortOrder;
          return 0;
        });
      }

      const page = Number(pageNumber) || 1;
      const size = Number(pageSize) || 10;
      const totalItems = characters.length;
      const totalPages = Math.ceil(totalItems / size);
      const paginatedData = characters.slice((page - 1) * size, page * size);

      res.status(200).json({
        message: "Data retrieved successfully",
        totalItems,
        totalPages,
        currentPage: page,
        data: paginatedData,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async add(req, res, next) {
    try {
      req.body.UserId = req.user.id;
      const { CharacterId } = req.params;
      const { UserId } = req.body;

      if (!CharacterId || !UserId) {
        return res
          .status(400)
          .json({ message: "CharacterId and UserId are required" });
      }

      const response = await axios.get(
        "https://hp-api.onrender.com/api/characters"
      );
      const character = response.data.find((char) => char.id === CharacterId);

      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }

      const existingFavorite = await Favorite.findOne({
        where: { CharacterId, UserId },
      });

      if (existingFavorite) {
        return res
          .status(400)
          .json({ message: "Character is already in favorites" });
      }

      const newFavorite = await Favorite.create({
        CharacterId: character.id,
        characterName: character.name,
        house: character.house || "Unknown",
        imageUrl: character.image || "",
        UserId,
      });

      res.status(201).json({
        message: "Favorite character added successfully",
        data: newFavorite,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCharacterDetail(req, res, next) {
    try {
      const { CharacterId } = req.params;
      const response = await axios.get(
        "https://hp-api.onrender.com/api/characters"
      );
      const character = response.data.find((char) => char.id === CharacterId);

      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }

      res.status(200).json({
        message: "Character detail retrieved successfully",
        data: {
          id: character.id,
          name: character.name,
          house: character.house || "Unknown",
          species: character.species,
          gender: character.gender,
          patronus: character.patronus || "Unknown",
          actor: character.actor || "Unknown",
          imageUrl: character.image || "",
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteFavorite(req, res, next) {
    try {
      const { CharacterId } = req.params;
      const UserId = req.user.id;

      const favorite = await Favorite.findOne({
        where: { CharacterId, UserId },
      });

      if (!favorite) {
        return res
          .status(404)
          .json({ message: "Favorite character not found" });
      }
      await favorite.destroy();

      res
        .status(200)
        .json({ message: "Favorite character removed successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async sortHat(req, res, next) {
    try {
      const userId = req.user.id;
      const { answers } = req.body;

      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: "Invalid input" });
      }

      const chatCompletion = await getGroqChatCompletion(answers);
      console.log(
        "Groq API Response:",
        JSON.stringify(chatCompletion, null, 2)
      );

      const houseData = chatCompletion.choices?.[0]?.message?.content;

      if (!houseData) {
        return res.status(400).json({ error: "Invalid Groq response" });
      }

      const parsedHouse = JSON.parse(houseData);

      if (!parsedHouse.house || typeof parsedHouse.house !== "string") {
        return res.status(400).json({ error: "House must be a string" });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.house = parsedHouse.house;
      await user.save();

      await sendWelcomeEmail(user.email, user.username, user.house);

      res.status(201).json({
        house: parsedHouse.house,
        explanation: parsedHouse.explanation,
        message: "Sorting completed and email sent!",
      });
    } catch (error) {
      console.error("Groq API Error:", error.response?.data || error.message);
      next(error);
    }
  }
};
