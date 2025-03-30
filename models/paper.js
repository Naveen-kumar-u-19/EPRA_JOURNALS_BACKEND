const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize) => {
  const Paper = sequelize.define('Paper',{
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    paperIndex: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
   
    paperTitle: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    fileUrl: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
  
    status: {
      type: DataTypes.ENUM('PER', 'UNR', 'FOR', 'ACC', 'PUB', 'REV', 'CAN', 'REJ'),
      allowNull: false
    },
  
    localIp: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    journalId: {
      type: DataTypes.INTEGER,
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
    isArticleCreated: {
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
    tableName: 'paper',
    underscored: true,
  });

  Paper.associate = (models) => {
    Paper.belongsTo(models.Journal, { foreignKey: 'journal_id', as: 'journal' });
  };

  return Paper;
};
