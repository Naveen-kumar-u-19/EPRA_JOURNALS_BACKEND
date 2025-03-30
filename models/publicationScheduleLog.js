const { DataTypes, Sequelize } = require('sequelize');



module.exports = (sequelize) => {
  const PublicationScheduleLog = sequelize.define('PublicationScheduleLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    previous_publication_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    new_publication_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updated_by: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'publication_schedule_log',
    timestamps: false,
}
);

  return PublicationScheduleLog;
};