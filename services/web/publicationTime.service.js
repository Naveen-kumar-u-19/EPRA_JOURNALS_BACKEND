const PublicationSchedule = require('../../models/publicationSchedule');
const PublicationScheduleLogs = require('../../models/publicationScheduleLog');
const { sequelize } = require('../../models');

// const NodeCache = require('node-cache');
// const cache = new NodeCache({ stdTTL: 43200, checkperiod: 120 });

const cache = require('../../cache');
class PublicationService {
    static async getNextPublicationTime() {
        const cacheKey = 'next_publication_time';
        // let nextPublicationTime = cache.get(cacheKey);
        let nextPublicationTime ;

        if (!nextPublicationTime) {
            const [records] = await sequelize.query(
                `SELECT next_publication_time 
                 FROM publication_schedule 
                 ORDER BY id DESC 
                 LIMIT 1;`, 
                { type: sequelize.QueryTypes.SELECT }
            );
        
            if (!records) return null;
        
            nextPublicationTime = records.next_publication_time;
            cache.set(cacheKey, nextPublicationTime);
        }

        return nextPublicationTime;
    }

    static async updateNextPublicationTime(newPublicationTime, adminUser) {
        const currentRecord = await PublicationSchedule.findOne({ order: [['id', 'DESC']] });

        if (currentRecord) {
            // Save to logs before updating
            await PublicationScheduleLogs.create({
                previous_publication_time: currentRecord.next_publication_time,
                new_publication_time: newPublicationTime,
                updated_by: adminUser,
            });

            // Update the latest publication time
            currentRecord.next_publication_time = newPublicationTime;
            await currentRecord.save();
        } else {
            // If no record exists, create a new one
            await PublicationSchedule.create({ next_publication_time: newPublicationTime });
        }

        // Clear cache to update it
        cache.del('next_publication_time');

        return { message: 'Publication time updated successfully' };
    }
}

module.exports = PublicationService;
