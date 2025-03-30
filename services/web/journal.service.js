const { sequelize } = require('../../models');

const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); // Cache for 1 hour

class JournalService {
    // Fetch all journals (full version)
    static async getAllJournalsFull() {
        const cacheKey = 'all_journals_full';
        let journals = cache.get(cacheKey);

        if (!journals) {
            const query = `SELECT * FROM journal WHERE is_deleted = false ORDER BY id ASC;`;
            journals = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

            cache.set(cacheKey, journals);
        }

        return journals;
    }

    // Fetch all journals (short version)
    static async getAllJournalsShort() {
        const cacheKey = 'all_journals_short';
        let journals = cache.get(cacheKey);

        if (!journals) {
            const query = `SELECT id, name, img_url, short_code FROM journal WHERE is_deleted = false ORDER BY id ASC;`;
            journals = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

            cache.set(cacheKey, journals);
        }

        return journals;
    }
}

module.exports = JournalService;
