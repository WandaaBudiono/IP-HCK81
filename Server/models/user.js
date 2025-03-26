"use strict";
const { Model } = require("sequelize");
const { hashPassword } = require("../helper/bcrypt");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Favorite, { foreignKey: "UserId" });
    }
  }
  User.init(
    {
      username: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
          notEmpty: { msg: "Email is required" },
          notNull: { msg: "Email is required" },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true, // Bisa null untuk akun Google
        validate: {
          len: {
            args: [5],
            msg: "Password must be at least 5 characters long",
          },
          notEmpty(value) {
            if (!this.isGoogleAccount && !value) {
              throw new Error("Password is required for non-Google accounts");
            }
          },
        },
      },
      house: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isGoogleAccount: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      hooks: {
        beforeCreate: (user) => {
          user.password = hashPassword(user.password);
        },
      },
    }
  );
  return User;
};
