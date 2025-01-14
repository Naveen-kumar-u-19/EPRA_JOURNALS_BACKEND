const { sequelize } = require('../models');

async function getPageData(PageCode) {
    try {
      const [result] = await sequelize.query(
        'SELECT * FROM pages WHERE PageCode = :pageCode',
        {
          replacements: { pageCode: PageCode },
          type: sequelize.QueryTypes.SELECT, // Specify query type
        }
      );
      return result; // Return the first row (single page)
    } catch (error) {
      console.error('Error fetching page data:', error);
      throw error;
    }
  }
  
  module.exports = { getPageData };