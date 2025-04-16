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

    // To get Journal Id for journal Short Code
    static async getJournalIdByCode(journalCode) {

        const cacheKey = `${journalCode}_journal_id`;
        let journalId = cache.get(cacheKey);

        if (!journalId) {
            const query = `SELECT id FROM journal WHERE short_code = :journalCode AND is_deleted = false LIMIT 1;`;
            journalId = await sequelize.query(query, { replacements: { journalCode }, type: sequelize.QueryTypes.SELECT });

            if (journalId.length > 0) {
                journalId = journalId[0].id;
                cache.set(cacheKey, journalId);
            } else {
                throw { status: 404, message: 'Journal not found' };
            }
        }

        return journalId;
    }

    static async getOneJournalById(journalId) {
        // const cacheKey = `${journalId}_journal_full`;
        // let journal = cache.get(cacheKey);
        let journal;

        if (!journal) {
            const query = `SELECT * FROM journal WHERE id = :journalId AND is_deleted = false limit 1;`;
            journal = await sequelize.query(query, { replacements: { journalId }, type: sequelize.QueryTypes.SELECT });

            // if (journal.length > 0) {
            //     journal = journal[0];
            //     cache.set(cacheKey, journal);
            // } else {
            //     throw { status: 404, message: 'Journal not found' };
            // }
        }

        return journal;
    }

    //  Next 3 Services for Each Journal Home page
    static async getArtilcesArchives(journalId) {
        const cacheKey = `${journalId}_all_articles_archives`;
        let articlesArchives = cache.get(cacheKey), finalOutput;
        // let articlesArchives = cache.get(cacheKey);

        if (!articlesArchives) {
            const query = `SELECT id, month, year, articles_count FROM issue_period WHERE journal_id = :journalId and is_deleted = 0 ORDER BY id ASC;`;
            articlesArchives = await sequelize.query(query, { replacements: { journalId }, type: sequelize.QueryTypes.SELECT });

            const groupedByYear = {};

            articlesArchives.forEach(row => {
                const { year, month, articles_count } = row;

                if (!groupedByYear[year]) {
                    groupedByYear[year] = [];
                }

                groupedByYear[year].push({
                    month,
                    articles_count
                });
            });

            // Optional: convert to array format
            articlesArchives = Object.keys(groupedByYear).map(year => ({
                year,
                months: groupedByYear[year]
            }));

            cache.set(cacheKey, articlesArchives);
        }

        return articlesArchives;
    }

    static async getJournalWithLatestIssue(journalId) {
        const query = `
            SELECT 
              j.*, 
              ip.year, ip.month, ip.volume, ip.issue, ip.articles_count
            FROM 
              journal j
            LEFT JOIN 
              issue_period ip 
                ON j.id = ip.journal_id 
                AND ip.is_latest = 1 
                AND ip.is_deleted = 0
            WHERE 
              j.id = :journalId 
              AND j.is_deleted = false
            LIMIT 1;
          `;

        const journalWithIssuePeriod = await sequelize.query(query, {
            replacements: { journalId },
            type: sequelize.QueryTypes.SELECT
        });

        return journalWithIssuePeriod;
    }

    static async getArticlesList(issueId) {
        // const cacheKey = `${issueId}_articles_list`;
        // let articlesList = cache.get(cacheKey);
        let articlesList;
        if (!articlesList) {
            const query = `SELECT * FROM article WHERE issue_id = :issueId AND is_deleted = false ORDER BY id ASC;`;
            articlesList = await sequelize.query(query, { replacements: { issueId }, type: sequelize.QueryTypes.SELECT });

            // cache.set(cacheKey, articlesList);
        }

        return articlesList;
    }

    // To display on article details page
    static async getOneArticleById(articleId) {

        //     const query = `
        //     SELECT 
        //       a.*, 
        //       ip.year, ip.month, ip.volume, ip.issue, ip.articles_count,
        //       j.name AS journal_name, 
        //       j.short_code AS journal_short_code
        //     FROM 
        //       article a
        //     LEFT JOIN 
        //       issue_period ip ON a.issue_id = ip.id AND ip.is_deleted = false
        //     LEFT JOIN 
        //       journal j ON ip.journal_id = j.id AND j.is_deleted = false
        //     WHERE 
        //       a.id = :articleId 
        //       AND a.is_deleted = false
        //     LIMIT 1;
        //   `;

        const query = `
            SELECT 
                a.*, 
                ip.year, ip.month, ip.volume, ip.issue, ip.articles_count,
                j.name AS journal_name, 
                j.short_code AS journal_short_code,
                p.paper_title
            FROM 
                article a
            LEFT JOIN 
                issue_period ip ON a.issue_id = ip.id AND ip.is_deleted = false
            LEFT JOIN 
                journal j ON ip.journal_id = j.id AND j.is_deleted = false
            LEFT JOIN 
                paper p ON a.paper_id = p.id
            WHERE 
                a.id = :articleId 
                AND a.is_deleted = false
            LIMIT 1;`;
        const article = await sequelize.query(query, {
            replacements: { articleId },
            type: sequelize.QueryTypes.SELECT
        });
        return article;

    }

    // Utility function to get current issue id for a journal
    static async getCurrentIssueId(journalId) {
        const query = `
            SELECT id FROM issue_period 
            WHERE journal_id = :journalId 
            AND is_latest = 1 
            AND is_deleted = 0 
            LIMIT 1;
        `;

        const result = await sequelize.query(query, {
            replacements: { journalId },
            type: sequelize.QueryTypes.SELECT
        });

        return result.length > 0 ? result[0].id : null;
    }

    static async getCurrentIssueIdWithYearAndMonth(year, month) {
        const query = `
            SELECT id FROM issue_period 
            WHERE year = :year and month = :month
            AND is_latest = 1 
            AND is_deleted = 0 
            LIMIT 1;
        `;

        const result = await sequelize.query(query, {
            replacements: { year, month },
            type: sequelize.QueryTypes.SELECT
        });

        return result.length > 0 ? result[0].id : null;
    }

}

module.exports = JournalService;
