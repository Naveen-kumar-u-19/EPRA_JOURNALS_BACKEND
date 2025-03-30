const { DataTypes  } = require('sequelize');



module.exports = (sequelize) => {
  const PublicationSchedule = sequelize.define('PublicationSchedule', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    next_publication_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
        createdAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          allowNull: true
        },
        updatedAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          allowNull: true
        }
}, {
    tableName: 'publication_schedule',
    timestamps: true,
}
);

  return PublicationSchedule;
};