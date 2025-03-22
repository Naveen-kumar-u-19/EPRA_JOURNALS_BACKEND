const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize) => {
  const IssuePeriod = sequelize.define('IssuePeriod', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    month: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    year: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    volume: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    issue: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    isLatest: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    journalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'journal',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
    tableName: 'issue_period',
    underscored: true,
  });


  IssuePeriod.associate = (models) => {
    IssuePeriod.belongsTo(models.Journal, { foreignKey: 'journal_id', as: 'journal' });
  };
  return IssuePeriod;
};
