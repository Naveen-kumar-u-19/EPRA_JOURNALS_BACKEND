const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize) => {
    const PublicationScheduleLog = sequelize.define('PublicationScheduleLog', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nextPublicationTime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        scheduleId: {
            type: DataTypes.INTEGER,
            allowNull: false
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
        },
    }, {
        tableName: 'publication_schedule_log',
        underscored: true,
    }
    );

    return PublicationScheduleLog;
};