const router = require('express').Router();
const { sequelize } = require('../models');

/**
 * Function used to get all issue period details for list page
 */
const getAllIssuePeriod = async (req, res) => {
  try {
    const { offset = 0, limit = 10, searchText = '' } = req.query;
    // Get the overall count of issue period
    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) as count FROM issue_period
      INNER JOIN journal ON issue_period.journal_id = journal.id 
      WHERE issue_period.is_deleted= false and journal.is_deleted = false`
    );

    // Get the issue period
    const [getIssuePeriod] = await sequelize.query(
      `SELECT issue_period.*,issue_period.id as issue_id, journal.name, journal.id FROM issue_period
      INNER JOIN journal ON issue_period.journal_id = journal.id
      WHERE issue_period.is_deleted = false and journal.is_deleted = false ORDER BY issue_period.id DESC LIMIT :limit OFFSET :offset`,
      {
        replacements: {
          offset: parseInt(offset),
          limit: parseInt(limit),
          searchText: `%${searchText}%`
        },
      }
    );

    res.status(200).json({
      success: true,
      result: {
        count: Number(countResult?.[0]?.count),
        rows: getIssuePeriod
      },
      message: 'Get Issue period successfully.'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to get isssue period.'
    });
  }
};

/**
 * Function used to create the issue period
 */
const createIssuePeriod = async (req, res) => {
  try {
    if (req.body?.status) {
      req.body.status = JSON.parse(req.body.status);
    }
    const [createIssue] = await sequelize.query(
      'INSERT INTO `issue_period` (`month`, `year`, `volume`, `issue`, `journal_id`) VALUES (:month, :year, :volume, :issue, :journal_id)',
      {
        replacements: req.body,
        type: sequelize.QueryTypes.INSERT,
      }
    );
    res.status(200).json({
      success: true,
      result: createIssue,
      message: 'Issue created successfully.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to create issue.',
    });
  }
}

/**
 * Function used to update the issue period
 */
const updateIssuePeriod = async (req, res) => {
  try {
    const { id } = req.params;
    const [updateIssue] = await sequelize.query(
      `UPDATE issue_period SET month = :month, year = :year, volume = :volume, issue = :issue, journal_id = :journal_id WHERE id = :id and is_deleted = false`,
      {
        replacements: {
          id: parseInt(id),
          ...req.body
        },
        type: sequelize.QueryTypes.UPDATE,
      }
    );
    res.status(200).json({
      success: true,
      result: updateIssue,
      message: 'Issue updated successfully.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to update issue.',
    });
  }
}

/**
 * Function used to delete issue period
 */
const deleteIssuePeriod = async (req, res) => {
  try {
    const { id } = req.params;
    const [deleteIssue] = await sequelize.query(
      `UPDATE issue_period SET is_deleted = true WHERE id = :id`,
      {
        replacements: {
          id: parseInt(id)
        },
        type: sequelize.QueryTypes.UPDATE,
      }
    );
    res.status(200).json({
      success: true,
      result: true,
      message: 'Issue deleted successfully.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to delete issue.',
    });
  }
}

router.get('', getAllIssuePeriod);
router.post('/', createIssuePeriod);
router.put('/:id', updateIssuePeriod);
router.delete('/:id', deleteIssuePeriod);

module.exports = router;