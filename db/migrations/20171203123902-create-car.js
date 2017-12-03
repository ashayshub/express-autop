'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Cars', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING(120)
      },
      car_type: {
        type: Sequelize.STRING(20)
      },
      car_make: {
        type: Sequelize.STRING(120)
      },
      car_model: {
        type: Sequelize.STRING(120)
      },
      year: {
        type: Sequelize.STRING(120)
      },
      summary: {
        type: Sequelize.STRING(255)
      },
      image: {
        type: Sequelize.STRING(255)
      },
      price_query: {
        type: Sequelize.STRING(255)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Cars');
  }
};