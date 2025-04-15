const router = require('express').Router();
const { sequelize } = require('../models');

/**
 * Function used to get author detail
 */
const getAuthorDetail = async (req, res) => {
  try {
    const { offset = 0, limit, searchText = '' } = req.query;
    // Get the overall count of author list
    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) as count FROM author 
          INNER JOIN paper ON paper.id = author.paper_id
          WHERE paper.is_deleted = false and author.is_deleted = false and (author.author_name LIKE :searchText OR paper.paper_index LIKE :searchText)`, {
      replacements: {
        searchText: `%${searchText}%`,
      }
    }
    );
    // Get the overall count of author list
    const [authorDetail] = await sequelize.query(
      `SELECT * FROM author 
      INNER JOIN paper ON paper.id = author.paper_id
          WHERE paper.is_deleted = false and author.is_deleted = false and (author.author_name LIKE :searchText OR paper.paper_index LIKE :searchText) ORDER BY author.id DESC LIMIT :limit OFFSET :offset`,
      {
        replacements: {
          searchText: `%${searchText}%`,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      }
    )
    res.status(200).json({
      success: true,
      result: {
        count: Number(countResult?.[0]?.count),
        rows: authorDetail
      },
      message: 'Get author detail successfully.'
    })

  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to get author detail.',
    });
  }
}

router.get('', getAuthorDetail);
module.exports = router;
