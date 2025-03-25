const { Favorite, User } = require("../models");
const { Op } = require("sequelize");
const axios = require("axios");
const { getGroqChatCompletion } = require("../helper/groqhelper");
require("dotenv").config();

module.exports = class favController {
  static async getAll(req, res, next) {
    try {
      const response = await axios.get(
        "https://hp-api.onrender.com/api/characters"
      );
      res
        .status(200)
        .json({ message: "Data retrieved successfully", data: response.data });
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
      const { answers } = req.body;

      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: "Invalid answers format" });
      }

      const chatCompletion = await getGroqChatCompletion(answers);
      const house =
        chatCompletion.choices[0]?.message?.content || "No response";

      res.json({ house });
    } catch (error) {
      next(error);
    }
  }

  static async getAllPublic(req, res, next) {
    try {
      let { CategoryId, q, pageNumber, pageSize, sortBy, sortOrder } =
        req.query;

      const paramQuerySQL = {
        where: {},
        order: [["createdAt", "DESC"]],
        limit: 10,
        offset: 0,
      };

      if (CategoryId) {
        paramQuerySQL.where.CategoryId = Number(CategoryId);
      }

      if (q) {
        paramQuerySQL.where.name = {
          [Op.iLike]: `%${q}%`,
        };
      }

      if (
        sortBy &&
        sortOrder &&
        ["ASC", "DESC"].includes(sortOrder.toUpperCase())
      ) {
        paramQuerySQL.order = [[sortBy, sortOrder.toUpperCase()]];
      }

      const page = Number(pageNumber) || 1;
      const size = Number(pageSize) || 10;
      paramQuerySQL.limit = size;
      paramQuerySQL.offset = (page - 1) * size;

      const { count, rows } = await Cuisine.findAndCountAll(paramQuerySQL);

      res.status(200).json({
        message: "Data retrieved successfully",
        totalItems: count,
        totalPages: Math.ceil(count / paramQuerySQL.limit),
        currentPage: page,
        data: rows,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getIdPublic(req, res, next) {
    try {
      const { id } = req.params;
      const cuisine = await Cuisine.findByPk(id);
      if (!cuisine)
        throw { name: "NotFound", message: `Cuisine with ID ${id} not found` };

      res
        .status(200)
        .json({ message: "Data retrieved successfully", data: cuisine });
    } catch (error) {
      next(error);
    }
  }
};
