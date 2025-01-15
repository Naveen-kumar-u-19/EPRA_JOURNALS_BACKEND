const router = require('express').Router();
const { sequelize } = require('../models');

/**
 * Function used to get paper details
 */
const getPaperDetails = async (req, res) => {
  try {
    const { offset = 0, limit = 10, searchText = '' } = req.query;
    // Get the overall count of paper list
    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) as count FROM paper 
      INNER JOIN journal ON paper.journal_id = journal.id
      WHERE paper.is_deleted= false and journal.is_deleted = false AND paper.paper_title LIKE :searchText`, {
      replacements: {
        searchText: `%${searchText}%`
      }
    }
    );

    // Get the paper list
    const [paperDetails] = await sequelize.query(
      `SELECT paper.*,journal.name AS journal_name, journal.is_deleted as journal_is_deleted FROM paper 
      INNER JOIN journal ON paper.journal_id = journal.id
      WHERE paper.is_deleted= false and journal.is_deleted = false and paper.paper_title LIKE :searchText ORDER BY id DESC LIMIT :limit OFFSET :offset`,
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
        rows: paperDetails
      },
      message: 'Get Papers successfully.'
    })

  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to get papers'
    });
  }
}

/**
 * Function used to get paper detail
 */
const getOnePaperDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const [getOnePaper] = await sequelize.query(
      `SELECT paper.*,  journal.id AS journal_id, journal.name AS journal_name, journal.category AS journal_category, journal.status AS journal_status, journal.is_deleted as journal_is_deleted 
      FROM paper INNER JOIN journal ON paper.journal_id = journal.id 
      WHERE paper.id = :id AND paper.is_deleted = false AND  journal.is_deleted = false`,
      {
        replacements: {
          id: id
        }
      }
    );
    console.log(getOnePaper);
    if (getOnePaper?.length) {
      res.status(200).json({
        success: true,
        result: getOnePaper[0],
        message: 'Get paper detail successfully.'
      })
    }
    else {
      res.status(400).json({
        success: false,
        error: error.message || error,
        message: 'Invalid paper id'
      });
    }
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to get paper detail'
    });
  }
}

router.get('', getPaperDetails);
router.get('/:id', getOnePaperDetail);

module.exports = router;