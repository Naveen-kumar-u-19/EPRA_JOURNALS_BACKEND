
const { sequelize } = require('../../models');

const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); // Cache for 1 hour

class PaperService {
    static async getPaperStatus(paperIndex) {
        if (!paperIndex) {
            throw new Error('Paper Index is required');
        }
    
        const [record] = await sequelize.query(
            `SELECT paper_title, status 
             FROM paper 
             WHERE paper_index = :paperIndex 
             AND is_deleted = false 
             LIMIT 1;`,
            { 
                type: sequelize.QueryTypes.SELECT,
                replacements: { paperIndex } // Prevents SQL injection
            }
        );
    
        return record ? record : null;
    }

    static async getPaperAuthors(paperIndex) {
        if (!paperIndex) {
            throw new Error('Paper Index is required');
        }
    
        // Fetch the paper details
        const [paper] = await sequelize.query(
            `SELECT id, paper_title, status 
             FROM paper 
             WHERE paper_index = :paperIndex 
             AND is_deleted = false 
             LIMIT 1;`,
            { 
                type: sequelize.QueryTypes.SELECT,
                replacements: { paperIndex } // Prevents SQL injection
            }
        );
    
        if (!paper) {
            return null; // Paper not found
        }
    
        // Fetch authors related to this paper
        const authors = await sequelize.query(
            `SELECT id, author_name, college_university 
             FROM author 
             WHERE paper_id = :paperId 
             AND is_deleted = false;`,
            { 
                type: sequelize.QueryTypes.SELECT,
                replacements: { paperId: paper.id } // Prevents SQL injection
            }
        );
    
        return {
            paper,
            authors
        };
    
    }

    static async getLast15Articles() {
        const cacheKey = 'last_15_articles';
        let articles = cache.get(cacheKey);

        if (!articles) {
            const query = `
                SELECT 
                    a.id AS article_id, 
                    a.doc_url AS article_url, 
                    p.paper_index, 
                    p.paper_title
                FROM article a
                JOIN paper p ON a.paper_id = p.id
                WHERE a.is_deleted = false
                ORDER BY a.created_at DESC
                LIMIT 15;
            `;

            articles = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
            cache.set(cacheKey, articles);
        }

        return articles;
    }

    static async incrementCount(articleId, type) {
        if (!['download', 'view'].includes(type)) {
            throw new Error('Invalid type. Allowed values: "download", "view".');
        }
    
        const field = type === 'download' ? 'download_count' : 'views_count';
    
        const query = `
            UPDATE article 
            SET ${field} = ${field} + 1
            WHERE id = :articleId AND is_deleted = false;
        `;
    
        const [result] = await sequelize.query(query, {
            replacements: { articleId },
            type: sequelize.QueryTypes.UPDATE,
        });
    
        if (result === 0) {
            throw new Error('Article not found or already deleted.');
        }
    
        return { success: true, message: `${type} count updated successfully.` };
    }
  
 
}

module.exports = PaperService;
