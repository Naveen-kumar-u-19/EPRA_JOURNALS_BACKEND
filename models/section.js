const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize) => {
  const Section = sequelize.define('Section',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    section_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,  // Can store JSON or HTML
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
    tableName: 'section',
    timestamps: true,
});

  return Section;
};