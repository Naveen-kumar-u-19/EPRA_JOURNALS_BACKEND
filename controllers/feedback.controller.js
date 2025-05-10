const router = require('express').Router();
const { sequelize } = require('../models');

/**
 * Function used to create feedback
 */
const createFeedback = async (req, res) => {
  try {
    const [createIssue] = await sequelize.query(
      'INSERT INTO `feedback` (`full_name`, `email`, `feedback`, `status`) VALUES (:full_name, :email, :feedback, :status)',
      {
        replacements: req.body,
        type: sequelize.QueryTypes.INSERT,
      }
    );

    res.status(200).json({
      success: true,
      result: createIssue,
      message: 'Feedback created successfully.',
    });
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to get author detail.',
    });
  }
}

/**
 * Function used to get feedback
 */
const getFeedback = async (req, res) => {
  try {

    const { offset = 0, limit, searchText = '' } = req.query;

    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) AS count FROM feedback f
      WHERE f.is_deleted = false and (f.full_name LIKE :searchText)
      `, {
      replacements: {
        searchText: `%${searchText}%`,
      }
    }
    )

    const [getFeedback] = await sequelize.query(
      `SELECT f.* FROM feedback f
      WHERE f.is_deleted = false AND (f.full_name LIKE :searchText)
      ORDER BY f.id DESC LIMIT :limit OFFSET :offset`, {
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
        rows: getFeedback
      },
      message: 'Get feedback detail successfully.'
    })

  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to get feedback.',
    });
  }
}

/**
 * Function used to update feedback
 */
const updateFeedback = async (req, res) => {
  try {
    req.body['updatedAt'] = new Date();

    const [update] = await sequelize.query(
      'UPDATE `feedback` SET `full_name` = :full_name, `email` = :email, `feedback` = :feedback, `status` = :status, `updated_at`= :updatedAt WHERE `id` = :id',
      {
        replacements: req.body,
      }
    );

    res.status(200).json({
      success: true,
      result: true,
      message: 'Feedback updated successfully.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to update feedback.',
    });
  }
};

/**
 * Function used to delete feedback
 */
const deleteFeedback = async (req, res) => {
  try {
    const id = req.params?.id;

    const [deleteFeedback] = await sequelize.query(
      'UPDATE `feedback` SET `is_deleted` = true WHERE `id` = :id',
      {
        replacements: { id },
      }
    );

    res.status(200).json({
      success: true,
      result: true,
      message: 'Feedback deleted successfully.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to delete feedback.',
    });
  }
}

router.post('', createFeedback);
router.get('', getFeedback);
router.put('', updateFeedback);
router.delete('/:id', deleteFeedback);
module.exports = router;