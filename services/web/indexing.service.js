const { sequelize } = require('../../models');
const cache = require('../../cache');

class indexingService {
  static async getIndexing() {
        const cacheKey = 'indexing';
        let indexing = cache.get(cacheKey);
        if (!indexing) {
            const records = await sequelize.query(
                `SELECT url, img_url
                 FROM indexing 
                 WHERE is_deleted = :isDeleted
                 ORDER BY created_at DESC`, 
                { 
                    type: sequelize.QueryTypes.SELECT,
                    replacements: { isDeleted: false } // Prevents SQL injection
                }
            );
            console.log(records);
            if(records){
                cache.set(cacheKey, records); // Store in cache
            }
            indexing = records;
        }
        return indexing;
    
    }
}

module.exports = indexingService;
