"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "Tasks", // Table name
      "image", // Column name
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Tasks", "image");
  },
};
