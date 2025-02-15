const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize) => {
  const Article = sequelize.define('Article', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    doi: {
      type: DataTypes.STRING,
      allowNull: true
    },
    googleSearchLink: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    googleScholarLink: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    publishedOn: {
      type: DataTypes.DATE,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    docUrl: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    abstract: {
      type: DataTypes.STRING,
      allowNull: true
    },
    keywords: {
      type: DataTypes.STRING,
      allowNull: true
    },
    paperId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'paper',
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
    tableName: 'article',
    underscored: true,
  });

  Article.associate = (models) => {
    Article.belongsTo(models.Paper, { foreignKey: 'paper_id', as: 'paper' });
  };
  return Article;
};
