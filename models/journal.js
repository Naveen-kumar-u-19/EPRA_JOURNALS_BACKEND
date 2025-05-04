const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize) => {
  const Journal = sequelize.define('Journal', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    imgUrl: {
      type: DataTypes.STRING(255),
    },
    category: {
      type: DataTypes.ENUM('ONLINE', 'PRINT', 'BOTH'),
      allowNull: false
    },
    eissn: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    pissn: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    sjif: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    isi: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    shortCode: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    topImgUrl: {
      type: DataTypes.STRING(255)
    },
    sideImgUrl: {
      type: DataTypes.STRING(255)
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
    tableName: 'journal',
    underscored: true,
  });

  Journal.associate = (models) => {
    Journal.hasMany(models.Paper, { foreignKey: 'journal_id', as: 'paper' });
  };

  return Journal;
};
