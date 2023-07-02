'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const categories = [
      {
        name: '飲食',
        icon: '/images/food.png'
      },
      {
        name: '生活雜物',
        icon: '/images/cart.png'
      },
      {
        name: '娛樂',
        icon: '/images/movie.png'
      },
      {
        name: '交通',
        icon: '/images/bus.png'
      },
      {
        name: '其他',
        icon: '/images/tag.png'
      }
    ]

    await queryInterface.bulkInsert('Categories', 
      categories.map(item => {
        return {
          name: item.name,
          icon: item.icon,
          created_at: new Date(),
          updated_at: new Date()
        }
      }))
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', {})
  }
};
