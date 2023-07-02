'use strict'

const generateRandomDate = (from, to) => {
  return new Date(
    from.getTime() +
    Math.random() * (to.getTime() - from.getTime()),
  );
}

module.exports = {
  async up (queryInterface, Sequelize) {
    const accounts = await queryInterface.sequelize.query(
      'SELECT id FROM Accounts;',
      {
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    )
    const categories = await queryInterface.sequelize.query(
      'SELECT id FROM Categories;',
      {
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    )
    const records = []

    for (const account of accounts) {
      for (let i = 1; i <= 5; i++) {
        const randomDate = generateRandomDate(new Date(2023, 1, 1), new Date(2023, 6, 30))
        records.push({
          name: `花費${i}`,
          amount: Number(Math.random()*100),
          date: randomDate,
          created_at: new Date(),
          updated_at: new Date(),
          account_id: account.id,
          category_id: categories[Math.floor(Math.random() * categories.length)].id
        })
      }
    }
    await queryInterface.bulkInsert('Records', records)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Records', {})
  }
};
