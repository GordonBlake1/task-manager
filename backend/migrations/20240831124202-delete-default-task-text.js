"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Delete tasks with "Default Task Text"
    await queryInterface.sequelize.query(`
      DELETE FROM "Tasks"
      WHERE "text" = 'Default Task Text';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Optionally, you could reinsert the tasks or leave this blank
    // if you don't want to rollback this operation.
  },
};
