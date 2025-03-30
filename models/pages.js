const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize) => {

  const Page = sequelize.define('Page', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    pageCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    pageTitle: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    metaDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metaKeywords: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    headerScripts: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    footerScripts: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ogTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ogDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ogImage: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ogUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ogType: {
      type: DataTypes.STRING(50),
      defaultValue: 'website',
      allowNull: true,
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
    },
  }, {
    tableName: 'page', // Specify the table name
    underscored: true,
  });
  return Page;
};
