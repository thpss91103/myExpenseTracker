'use strict'
const { DataTypes, Model } = require('sequelize')

module.exports = sequelize => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Record, { foreignKey: 'categoryId' })
    }
  }
  Category.init(
    {
      name: DataTypes.STRING,
      icon: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Category',
      tableName: 'Categories',
      underscored: true
    }
  )
  return Category
}