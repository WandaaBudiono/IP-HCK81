const { Favorite, User } = require("../models");
const { Op } = require("sequelize");
const axios = require("axios");

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
      const { characterName, house, imageUrl, UserId } = req.body;
      if (!characterName || !UserId) {
        return res
          .status(400)
          .json({ message: "characterName and UserId are required" });
      }

      const newFavorite = await Favorite.create({
        characterName,
        house,
        imageUrl,
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

  static async getId(req, res, next) {
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

  static async updateById(req, res, next) {
    try {
      const { id } = req.params;
      const cuisine = await Cuisine.findByPk(id);
      if (!cuisine)
        throw { name: "NotFound", message: `Cuisine with ID ${id} not found` };

      await cuisine.update(req.body);
      res.status(200).json({
        message: `Cuisine ${cuisine.name} updated successfully`,
        data: cuisine,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCuisineById(req, res, next) {
    try {
      const { id } = req.params;
      const cuisine = await Cuisine.findByPk(id);
      if (!cuisine)
        throw { name: "NotFound", message: `Cuisine with ID ${id} not found` };

      await cuisine.destroy();
      res.status(200).json({ message: `${cuisine.name} success to delete` });
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

  static async updateImage(req, res, next) {
    try {
      const { id } = req.params;
      const cuisine = await Cuisine.findByPk(id);
      if (!cuisine) {
        throw { name: `NotFound`, message: `Cuisine id ${id} not found` };
      }

      if (!req.file) {
        throw { name: `BadRequest`, message: `Image is required` };
      }

      const img = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
        `base64`
      )}`;

      const result = await cloudinary.uploader.upload(img, {
        public_id: req.file.originalname.split(".")[0],
        folder: "Cuisine-cover",
      });

      await Cuisine.update(
        {
          imgUrl: result.secure_url,
        },
        {
          where: {
            id: id,
          },
        }
      );

      res.json({
        message: `Image ${cuisine.name} success to update`,
      });
    } catch (error) {
      next(error);
    }
  }
};
