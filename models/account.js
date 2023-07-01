'use strict'
const { DataTypes, Model } = require('sequelize')

module.exports = sequelize => {
  class Account extends Model {
    static associate(models) {
      Account.belongsTo(models.User, { foreignKey: 'userId' })
      Account.hasMany(models.Record, { foreignKey: 'accountId' })
    }
  }
  Account.init(
    {
      name: DataTypes.STRING,
      date: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'Account',
      tableName: 'Accounts',
      underscored: true
    }
  )
  return Account
}