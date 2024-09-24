"use strict";
const { Model } = require("sequelize");
const fs = require("fs");
const path = require("path");

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      Task.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }

  Task.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      color: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Task",
    }
  );

  return Task;
};
