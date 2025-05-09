
const { sequelize } = require('../../models');
const { uploadFile, upload } = require('../../controllers/s3.controller');

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
                    a.authors_all,
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
   
    static async generatePaperIndex(journalId) {
        const now = new Date();
        const year = now.getFullYear();                     // e.g., 2025
        const month = String(now.getMonth() + 1).padStart(2, '0'); // e.g., "05"
        var [journalResult] = await sequelize.query(
            `SELECT short_code FROM journal WHERE id = :journalId;`,
            {
                type: sequelize.QueryTypes.SELECT,
                replacements: { journalId }
            }
        );
        console.log('journalResult', journalResult);
        journalResult = journalResult || { short_code: '01' }; // Default to 'XX' if not found
        const journalNo = String(journalResult.short_code).padStart(2, '0');
        var [submissionResult] = await sequelize.query(
            `SELECT IFNULL(MAX(id), 0) + 1 AS nextId FROM paper;`,
            { type: sequelize.QueryTypes.SELECT }
        );
        submissionResult = submissionResult || { nextId: 9999 }; // Default to 1 if no submissions exist
        const submissionNo = String(submissionResult.nextId).padStart(6, '0');
        const paperIndex = `${year}${month}-${journalNo}-${submissionNo}`;
    
        return paperIndex;
    }
    
    static async submitPaper(req, res) {
        const t = await sequelize.transaction(); // Start transaction

        try {
            // const uploadDetail = await uploadFile(req); //Upload Doc
            // console.log('req.body.data', req.body.data);
            const { paperTitle, journalId,  authors } = JSON.parse(req.body.data); // need to add file and authors
            const file = req.file; // File from multer
            console.log(paperTitle, journalId , authors, authors?.length === 0 )
            if (!paperTitle || !journalId  || !authors || authors?.length === 0 ) { // need to add file || authors || authors.length === 0
                // return res.status(400).json({ success: false, message: "All fields and a file are required." });
                throw new Error('All fields and a file are required.');
                
            }
    
            // Upload file to AWS S3
            const fileUrl = await uploadFile(req, 'papers');
            // const fileUrl = 'doc';
            // console.log('req.file', fileUrl.key);
    
            const paperIndex = await this.generatePaperIndex(journalId)
            // console.log('paperIndex', paperIndex);
            // Insert Paper
            const [paperResult] = await sequelize.query(
                `INSERT INTO paper (paper_index, paper_title, file_url, status, local_ip, journal_id, created_at, updated_at) 
                 VALUES (:paperIndex, :paperTitle, :fileUrl, 'PER', NULL, :journalId, NOW(), NOW())`,
                {
                    replacements: {
                        paperIndex,
                        paperTitle,
                        fileUrl: fileUrl.Key,
                        journalId
                    },
                    type: sequelize.QueryTypes.INSERT,
                    transaction: t
                }
            );
            console.log(paperResult);
            const paperId = paperResult; 
    
            // Ensure authors is a valid array
            const authorRecords = (Array.isArray(authors) ? authors : JSON.parse(authors)).map(author => [
                author.authorName,
                author.mobile,
                author.email,
                author.designation,
                author.department,
                author.college,
                // author.city,
                author.country,
                author.state,
                paperId,
                // author.dob ? new Date(author.dob) : null,
                false // isMainAuthor
            ]);
            console.log(authorRecords);
            // Insert Authors
            await sequelize.query(
                `INSERT INTO author (author_name, mobile, email, designation, dept, college_university, country, state, paper_id, is_main_author, created_at, updated_at)
                 VALUES ${authorRecords.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, false, NOW(), NOW())").join(", ")}`,
                {
                    replacements: authorRecords.flat(),
                    type: sequelize.QueryTypes.INSERT,
                    transaction: t
                }
            );
    
            await t.commit(); // Commit transaction
            return paperResult;
    
        } catch (error) {
            await t.rollback(); // Rollback transaction
            console.error("Error submitting paper:", error);
            return error;
            // return res.status(500).json({ success: false, message: error.message });
        }
    }

 
}

module.exports = PaperService;
