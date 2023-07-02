'use strict';
const bcrypt = require('bcryptjs')

const generateUsers = async () => {
  const users = []
  for (let i = 1; i <= 2; i++) {
    const user = {
      email: `user${i}@example.com`,
      password: await bcrypt.hash('123456', 10),
      name: `user${i}`,
      created_at: new Date(),
      updated_at: new Date()
    }
    users.push(user)
  }
  return users
}

module.exports = {
  async up (queryInterface, Sequelize) {
    const users = await generateUsers()
    await queryInterface.bulkInsert('Users', users)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {})
  }
};
