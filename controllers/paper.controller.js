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
      'SELECT COUNT(*) as count FROM `paper` WHERE `is_deleted`= false AND `paper_title` LIKE :searchText', {
      replacements: {
        searchText: `%${searchText}%`
      }
    }
    );

    // Get the paper list
    const [paperDetails] = await sequelize.query(
      'SELECT * FROM `paper` WHERE `is_deleted`= false and `paper_title` LIKE :searchText ORDER BY `id` DESC LIMIT :limit OFFSET :offset',
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
      'SELECT * FROM `paper` WHERE `id` =:id AND `is_deleted` =false',
      {
        replacements: {
          id: id
        }
      }
    );
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
        message: 'Failed to get paper detail'
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