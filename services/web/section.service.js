const Section = require('../../models/section');
const { sequelize } = require('../../models');

// const NodeCache = require('node-cache');
// const cache = new NodeCache({ stdTTL: 300, checkperiod: 600 }); // Cache expires in 5 mins

const cache = require('../../cache'); // Assuming you have a cache module
class SectionService {
    static async getSectionByCode(sectionCode) {
        const cacheKey = `section_${sectionCode}`;
        let section = cache.get(cacheKey);

        if (!section) {
            const [records] = await sequelize.query(
                `SELECT title, content 
                 FROM section 
                 WHERE section_code = :sectionCode 
                 LIMIT 1;`,
                {
                    type: sequelize.QueryTypes.SELECT,
                    replacements: { sectionCode } // Prevents SQL injection
                }
            );

            if (!records) return null;

            cache.set(cacheKey, records); // Store in cache
            section = records;
        }

        return section;
    }

    static async getThreeSections() {
        const cacheKey = 'news_Lnews_cfp';
        let cachedData = cache.get(cacheKey);

        // Return from cache if available
        if (cachedData) {
            console.log("Returning cached data");
            return cachedData;
        }

        const sectionCodes = ['NEWS', 'LATEST_NEWS',  'CALL_FOR_PAPER'];

        const records = await sequelize.query(
            `SELECT section_code, title, content 
         FROM section 
         WHERE section_code IN (:sectionCodes);`,
            {
                type: sequelize.QueryTypes.SELECT,
                replacements: { sectionCodes }
            }
        );

        // Transform result into key-value format
        const result = {};
        records.forEach(record => {
            result[record.section_code] = {
                title: record.title,
                content: record.content
            };
        });

        // Store in cache
        cache.set(cacheKey, result);
        console.log("Cached new data");

        return result;
    }


    static async updateSection(sectionCode, title, content) {
        let section = await Section.findOne({ where: { section_code: sectionCode } });

        if (section) {
            section.title = title;
            section.content = content;
            await section.save();
        } else {
            section = await Section.create({ section_code: sectionCode, title, content });
        }

        cache.set(`section_${sectionCode}`, section); // Update cache

        return section;
    }
}

module.exports = SectionService;
