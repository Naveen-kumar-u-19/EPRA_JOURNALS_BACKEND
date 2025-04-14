const router = require('express').Router();
const { sequelize } = require('../models');

/**
 * Function used to create publication date
 */
const createPublicationDate = async (req, res) => {
  try {
    const detail = req.body;
    if (!detail?.nextPublicationTime) {
      res.status(400).json({
        success: false,
        message: 'Failed to create new publication date.',
      });
    }
    // Convert ISO date string to MySQL DATETIME format
    const nextPublicationTime = new Date(detail.nextPublicationTime)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    const isActive = true;

    //Delete existing publication schedule
    const [deletePublication] = await sequelize.query(
      'DELETE FROM publication_schedule'
    );
    if (deletePublication) {
      //Insert new publication schedule
      const [createNew] = await sequelize.query(
        'INSERT INTO `publication_schedule` (`next_publication_time`) VALUES (:nextPublicationTime)',
        {
          replacements: { nextPublicationTime },
          type: sequelize.QueryTypes.INSERT,
        }
      );
      if (createNew) {
        //Update log
        const [updateExistingPublication] = await sequelize.query(
          'UPDATE `publication_schedule_log` SET `is_active` = false WHERE `is_active` = true and is_deleted = false'
        );
        //Create publication schedule log
        const [createPublication] = await sequelize.query(
          'INSERT INTO `publication_schedule_log` (`next_publication_time`, `is_active`, `schedule_id`) VALUES (:nextPublicationTime, :isActive, :createNew)',
          {
            replacements: { nextPublicationTime, isActive, createNew },
            type: sequelize.QueryTypes.INSERT,
          }
        );
        if (createPublication) {
          res.status(200).json({
            success: true,
            detail: createPublication,
            message: 'Next publication date created successfully.',
          });
        }
      }
    }
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to create new publication date.',
    });
  }
}

/**
 * Function used to get publication date
 */
const getPublicationDate = async (req, res) => {
  try {
    const { offset = 0, limit = 10 } = req.query;

    // Get the overall count of publication date
    const [countResult] = await sequelize.query(
      'SELECT COUNT(*) as count FROM `publication_schedule_log` WHERE `is_deleted` = false'
    );

    // Get the publication detail list
    const [getPublicationDetail] = await sequelize.query(
      'SELECT * FROM `publication_schedule_log` WHERE `is_deleted` = false ORDER BY `id` DESC LIMIT :limit OFFSET :offset',
      {
        replacements: {
          offset: parseInt(offset),
          limit: parseInt(limit)
        },
      }
    );

    res.status(200).json({
      success: true,
      result: {
        count: Number(countResult?.[0]?.count),
        rows: getPublicationDetail
      },
      message: 'Get publication detail successfully.'
    });
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to get publication date and time.'
    });
  }
}

/**
 * Function used to delete publication date
 */
const deletePublicationDate = async (req, res) => {
  try {
    const id = req.params?.id;
    const scheduleId = req.params?.scheduleId;
    if (!id || !scheduleId) {
      res.status(400).json({
        success: false,
        error: error.message || error,
        message: 'Failed to delete.'
      });
    }

    const [deleteScheduledPublication] = await sequelize.query(
      `DELETE FROM publication_schedule WHERE id = :id`, {
      replacements: {
        id: scheduleId
      }
    }
    )

    const [deletePublicationLog] = await sequelize.query(
      `UPDATE publication_schedule_log SET is_active = false, is_deleted = true where id = :id`,
      {
        replacements: {
          id: id
        }
      }
    )

    res.status(200).json({
      success: true,
      message: 'Publication deleted successfully.'
    });

  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to delete.'
    });
  }
}


router.get('', getPublicationDate);
router.post('', createPublicationDate);
router.delete('/:id/schedule/:scheduleId', deletePublicationDate);

module.exports = router;