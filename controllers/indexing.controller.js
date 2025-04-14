const router = require('express').Router();
const { sequelize } = require('../models');
const { uploadFile, upload } = require('./s3.controller');

/**
 * Function used to create indexing
 */
const createIndexing = async (req, res) => {
  try {
    const uploadDetail = await uploadFile(req, 'indexing'); //Upload Image
    if (uploadDetail?.key) {
      req.body['img_url'] = uploadDetail.key;
      //Create indexing
      const [createIndexing] = await sequelize.query(
        'INSERT INTO `indexing` (`url`, `img_url`) VALUES (:url, :img_url)',
        {
          replacements: req.body,
          type: sequelize.QueryTypes.INSERT,
        }
      );

      res.status(200).json({
        success: true,
        result: true,
        message: 'Indexing created successfully.',
      });
    }
    else {
      res.status(400).json({
        success: false,
        error: 'Failed to upload image.',
        message: 'Failed to upload image.',
      });
    }
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to create indexing.',
    });
  }
}

/**
 * Function used to get publication date
 */
const getIndexing = async (req, res) => {
  try {
    const { offset = 0, limit = 10 } = req.query;

    // Get the overall count of indexing
    const [countResult] = await sequelize.query(
      'SELECT COUNT(*) as count FROM `indexing` WHERE `is_deleted` = false'
    );

    // Get the indexing list
    const [getIndexing] = await sequelize.query(
      'SELECT * FROM `indexing` WHERE `is_deleted` = false ORDER BY `id` DESC LIMIT :limit OFFSET :offset',
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
        rows: getIndexing
      },
      message: 'Get Indexing detail successfully.'
    });
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to get indexing detail'
    });
  }
}

/**
 * Function used to delete indexing
 */
const deleteIndexing = async (req, res) => {
  try {
    const id = req.params?.id;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Failed to delete indexing.'
      });
    }

    const [deleteIndexing] = await sequelize.query(
      `UPDATE indexing SET is_deleted = true where id = :id`,
      {
        replacements: {
          id: id
        }
      }
    )

    res.status(200).json({
      success: true,
      message: 'Indexing deleted successfully.'
    });
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to delete indexing.'
    });
  }
}

router.get('', getIndexing);
router.post('', upload.single("file"), createIndexing);
router.delete('/:id', deleteIndexing);

module.exports = router;