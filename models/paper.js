const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize) => {
  const Paper = sequelize.define('Paper', {
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
    authorName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    dob: {
      type: DataTypes.DATE,
      allowNull: false
    },
    designation: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    dept: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    collegeUniversity: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    institutionPlace: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    mobile: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    paperTitle: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    file: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    volume: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    issue: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('PER', 'UNR', 'FOR', 'ACC', 'PUB', 'REV', 'CAN', 'REJ'),
      allowNull: false
    },
    doj: {
      type: DataTypes.DATE,
      allowNull: false
    },
    doc: {
      type: DataTypes.DATE,
      allowNull: false
    },
    articleStatus: {
      type: DataTypes.ENUM('P', 'N'),
      allowNull: false
    },
    localIp: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    imonth: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    captcha: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    isStatus: {
      type: DataTypes.ENUM('0', '1'),
      allowNull: false
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
