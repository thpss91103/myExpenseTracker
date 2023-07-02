'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM Users;',
      {
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    )
    const accounts = []

    for (const user of users) {
      for (let i = 1; i <= 3; i++) {
        accounts.push({
          name: `account${i}`,
          date: Number(i + (i + 2)),
          created_at: new Date(),
          updated_at: new Date(),
          user_id: user.id
        })
      }
    }
    await queryInterface.bulkInsert('Accounts', accounts)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Accounts', {})
  }
};
