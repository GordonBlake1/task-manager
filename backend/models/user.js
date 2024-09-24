"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Task, {
        foreignKey: "userId",
        as: "tasks",
      });
      User.hasMany(models.UserColors, {
        foreignKey: "userId",
        as: "colors",
      });
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensure email is unique
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );

  return User;
};
