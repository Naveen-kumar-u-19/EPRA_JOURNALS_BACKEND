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

    const isActive = detail.isActive ?? true;

    if (isActive) {
      const [updateExistingPublication] = await sequelize.query(
        'UPDATE `publication_schedule` SET `is_active` = false WHERE `is_active` = true and is_deleted = false'
      );
    }

    //Create publication
    const [createPublication] = await sequelize.query(
      'INSERT INTO `publication_schedule` (`next_publication_time`, `is_active`) VALUES (:nextPublicationTime, :isActive)',
      {
        replacements: { nextPublicationTime, isActive },
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
      'SELECT COUNT(*) as count FROM `publication_schedule` WHERE `is_deleted` = false'
    );

    // Get the publication detail list
    const [getPublicationDetail] = await sequelize.query(
      'SELECT * FROM `publication_schedule` WHERE `is_deleted` = false ORDER BY `id` DESC LIMIT :limit OFFSET :offset',
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
    if (!id) {
      res.status(400).json({
        success: false,
        error: error.message || error,
        message: 'Failed to delete.'
      });
    }

    const [deletePublication] = await sequelize.query(
      `UPDATE publication_schedule SET is_active = false, is_deleted = true where id = :id`,
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
router.delete('/:id', deletePublicationDate);

module.exports = router;