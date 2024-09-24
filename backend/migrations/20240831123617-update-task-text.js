"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update any existing NULL values to a placeholder before enforcing NOT NULL
    await queryInterface.sequelize.query(`
      UPDATE "Tasks"
      SET "text" = 'No description'  -- or empty string ''
      WHERE "text" IS NULL;
    `);

    // Change the column to enforce NOT NULL
    await queryInterface.changeColumn("Tasks", "text", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the NOT NULL constraint and allow NULL values again
    await queryInterface.changeColumn("Tasks", "text", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Optionally, revert the placeholder values to NULL
    await queryInterface.sequelize.query(`
      UPDATE "Tasks"
      SET "text" = NULL
      WHERE "text" = 'No description';  -- or empty string ''
    `);
  },
};
