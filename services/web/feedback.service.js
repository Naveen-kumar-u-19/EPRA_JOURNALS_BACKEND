const Feedback = require('../../models/feedback');
const { sequelize } = require('../../models');

// const NodeCache = require('node-cache');
// const cache = new NodeCache({ stdTTL: 300, checkperiod: 600 }); // Cache for 5 mins
const cache = require('../../cache');

class FeedbackService {
    // Fetch last 10 approved feedbacks (cached)
    static async getLast10Feedbacks() {
        // const cacheKey = 'last_10_feedbacks';
        // let feedbacks = cache.get(cacheKey);
        let feedbacks;
        // if (!feedbacks) {
            const records = await sequelize.query(
                `SELECT full_name, email, feedback 
                 FROM feedback 
                 WHERE status = :status AND is_deleted = :isDeleted
                 ORDER BY created_at DESC 
                 LIMIT 10;`, 
                { 
                    type: sequelize.QueryTypes.SELECT,
                    replacements: { status: 'APPROVED', isDeleted: false } // Prevents SQL injection
                }
            );
            console.log(records);
            // if(records){
            //     cache.set(cacheKey, records); // Store in cache
            // }
            feedbacks = records;
        // }
    
        return feedbacks;
    
    }

    // Submit new feedback
    static async submitFeedback(fullName, email, feedback) {
        const [result] = await sequelize.query(
            `INSERT INTO feedback (full_name, email, feedback, status, created_at, updated_at) 
             VALUES (:fullName, :email, :feedback, 'PENDING', NOW(), NOW());`,
            { 
                type: sequelize.QueryTypes.INSERT,
                replacements: { fullName, email, feedback } // Prevents SQL injection
            }
        );
    
        return result;
    }

    // Fetch feedback list with pagination
    static async getFeedbackList(page, pageSize) {
        const offset = (page - 1) * pageSize;

        // Get total count of feedbacks
        const [{total}] = await sequelize.query(
            `SELECT COUNT(*) as total 
             FROM feedback 
             WHERE is_deleted = false;`,
            { type: sequelize.QueryTypes.SELECT }
        );
        console.log(total);
        // Get paginated feedback list
        const feedbacks = await sequelize.query(
            `SELECT * 
             FROM feedback 
             WHERE is_deleted = false 
             ORDER BY created_at DESC 
             LIMIT :pageSize OFFSET :offset;`,
            { 
                type: sequelize.QueryTypes.SELECT,
                replacements: { pageSize, offset } // Prevents SQL injection
            }
        );
    
        return {
            total,
            feedbacks
        };
    }
}

module.exports = FeedbackService;
