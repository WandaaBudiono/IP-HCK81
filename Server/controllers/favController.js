const { Cuisine, User } = require("../models");
const { Op } = require("sequelize");

module.exports = class cuisinesController {
  static async getAll(req, res, next) {
    try {
      const cuisines = await Cuisine.findAll({
        include: { model: User, attributes: { exclude: ["password"] } },
      });
      res
        .status(200)
        .json({ message: "Data retrieved successfully", data: cuisines });
    } catch (error) {
      next(error);
    }
  }

  static async add(req, res, next) {
    try {
      req.body.AuthorId = req.user.id;
      const cuisine = await Cuisine.create(req.body);
      res.status(201).json({
        message: `Cuisine ${cuisine.name} created successfully`,
        data: cuisine,
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
