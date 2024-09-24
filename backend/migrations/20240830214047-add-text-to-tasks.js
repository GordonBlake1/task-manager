"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the column without a default value
    await queryInterface.addColumn("Tasks", "text", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Optionally, update only where text is NULL
    await queryInterface.sequelize.query(`
      UPDATE "Tasks"
      SET "text" = 'Some Default Text'
      WHERE "text" IS NULL;
    `);

    // Change column to disallow nulls
    await queryInterface.changeColumn("Tasks", "text", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Tasks", "text");
  },
};
