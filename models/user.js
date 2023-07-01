'use strict'
const { DataTypes, Model } = require('sequelize')

module.exports = sequelize => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Account, { foreignKey: 'userId' })
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      name: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      underscored: true
    }
  )
  return User
}