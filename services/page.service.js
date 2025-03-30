const { sequelize } = require('../models');

async function getPageData(PageCode) {
    try {
      const [result] = await sequelize.query(
        'SELECT * FROM page WHERE PageCode = :pageCode',
        {
          replacements: { pageCode: PageCode },
          type: sequelize.QueryTypes.SELECT, // Specify query type
        }
      );
      console.log(result);
      if(!result) {
        throw { status: 404, message: 'Section not available' };
      }
      return result; // Return the first row (single page)
    } catch (error) {
      console.error('Error fetching page data:', error);
      throw error;
    }
  }
  
  module.exports = { getPageData };