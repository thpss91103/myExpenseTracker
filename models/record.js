'use strict'
const { DataTypes, Model } = require('sequelize')

module.exports = sequelize => {
  class Record extends Model {
    static associate(models) {
      Record.belongsTo(models.Account, { foreignKey: 'accountId' })
      Record.belongsTo(models.Category, { foreignKey: 'categoryId' })
    }
  }
  Record.init(
    {
      name: DataTypes.STRING,
      amount: DataTypes.INTEGER,
      date: DataTypes.DATE,
      AccountId: DataTypes.INTEGER,
      CategoryId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'Record',
      tableName: 'Records',
      underscored: true
    }
  )
  return Record
}