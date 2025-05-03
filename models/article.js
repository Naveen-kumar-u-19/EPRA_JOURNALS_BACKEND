const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize) => {
  const Article = sequelize.define('Article', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    doi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googleSearchLink: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    googleScholarLink: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    publishedOn: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    articleOrder: { // Changed from `order`
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    docUrl: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    abstract: {
      type: DataTypes.TEXT, // Allows long abstracts
      allowNull: true,
    },
    keywords: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paperId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'papers', // Ensure this matches your `Paper` model table name
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    issueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'issue_periods', // Ensure this matches your `IssuePeriod` model table name
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    downloadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    viewsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    authorsAll: {
      type: DataTypes.STRING,
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
    }
  }, {
    tableName: 'article',
    underscored: true,
  });

  Article.associate = (models) => {
    Article.belongsTo(models.Paper, { foreignKey: 'paper_id', as: 'paper' });
    Article.belongsTo(models.IssuePeriod, { foreignKey: 'issue_id', as: 'issue_period' });
  };
  return Article;
};
