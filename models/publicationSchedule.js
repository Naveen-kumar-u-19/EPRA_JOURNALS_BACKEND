const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize) => {
  const PublicationSchedule = sequelize.define('PublicationSchedule', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nextPublicationTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.fn('NOW'),
      allowNull: true
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.fn('NOW'),
      allowNull: true
    }
  }, {
    tableName: 'publication_schedule',
    underscored: true,
  }
  );

  return PublicationSchedule;
};