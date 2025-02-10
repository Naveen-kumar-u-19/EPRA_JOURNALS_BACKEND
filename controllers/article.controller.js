const router = require('express').Router();
const { sequelize } = require('../models');

/**
 * Function used tp create article
 */
const createArticle = async (req, res) => {
  try {
    if (req.body?.published_on) {
      req.body['published_on'] = new Date(req.body['published_on']);
    }
    const [createArticle] = await sequelize.query(
      'INSERT INTO `article` (`doi`, `google_search_link`, `google_scholar_link`, `published_on`, `order`, `abstract`, `keywords`,`paper_id`) VALUES (:doi, :google_search_link, :google_scholar_link, :published_on, :order, :abstract, :keywords, :paper_id)',
      {
        replacements: req.body,
        type: sequelize.QueryTypes.INSERT,
      }
    );
    res.status(200).json({
      success: true,
      result: true,
      message: 'Article created successfully.',
    });
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to create article.',
    });
  }
}

/**
 * Function used to get article detail for list
 */
const getArtcleDetail = async (req, res) => {
  try {

    const { offset = 0, limit = 10, searchText = '' } = req.query;

    // Get the overall count of article list
    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) as count FROM article 
          INNER JOIN paper ON article.paper_id = paper.id
          WHERE article.is_deleted= false and paper.is_deleted = false AND (paper.paper_title LIKE :searchText OR paper.paper_index LIKE :searchText)`, {
      replacements: {
        searchText: `%${searchText}%`,
      }
    }
    );

    // Get the overall count of article list with paper detail
    const [articleDetails] = await sequelize.query(
      `SELECT article.id as article_id, article.doi, article.google_search_link, article.google_scholar_link, article.order, article.published_on, article.abstract, article.keywords, paper.* FROM article 
          INNER JOIN paper ON article.paper_id = paper.id
          WHERE article.is_deleted= false and paper.is_deleted = false AND (paper.paper_title LIKE :searchText OR paper.paper_index LIKE :searchText) ORDER BY article_id DESC LIMIT :limit OFFSET :offset`, {
      replacements: {
        searchText: `%${searchText}%`,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    }
    );

    res.status(200).json({
      success: true,
      result: {
        count: Number(countResult?.[0]?.count),
        rows: articleDetails
      },
      message: 'Get Articles successfully.'
    })

  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to get article.',
    });
  }
}

router.get('', getArtcleDetail);
router.post('', createArticle);
module.exports = router;