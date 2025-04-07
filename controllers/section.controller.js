const router = require('express').Router();
const { sequelize } = require('../models');

/**
 * Function used to get all sections
 */
const getAllSection = async (req, res) => {
  try {
    const { offset = 0, limit = 10, searchText = '' } = req.query;

    // Get the overall count of sections list
    const [countResult] = await sequelize.query(
      'SELECT COUNT(*) as count FROM `section` WHERE `is_deleted` = false AND `title` LIKE :searchText', {
      replacements: {
        searchText: `%${searchText}%`
      },
    }
    );

    // Get the sections list
    const [getSection] = await sequelize.query(
      'SELECT * FROM `section` WHERE `is_deleted` = false AND `title` LIKE :searchText ORDER BY `id` DESC LIMIT :limit OFFSET :offset',
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
        rows: getSection
      },
      message: 'Get Sections successfully.'
    });
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to get sections.'
    });
  }
}

/**
 * Function used to create section
 */
const createSection = async (req, res) => {
  try {
    const [createSection] = await sequelize.query(
      `INSERT INTO section (section_code, title,content) 
      VALUES (:section_code, :title, :content)`,
      {
        replacements: req.body,
        type: sequelize.QueryTypes.INSERT,
      }
    );
    res.status(200).json({
      success: true,
      result: true,
      message: 'Section created successfully.',
    });
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to create section.',
    });
  }
}

/**
 * Function used to update section
 */
const updateSection = async (req, res) => {
  try {
    if (!req.params?.id || !req.body) {
      res.status(400).json({
        success: false,
        message: 'Update data is missing.',
      });
    }


    req.body['id'] = req.params?.id;
    req.body['updatedAt'] = new Date();

    const [updateSection] = await sequelize.query(
      `UPDATE section 
       SET title = :title,
           updated_at = :updatedAt,
           content = :content
       WHERE id = :id and is_deleted = false`,
      {
        replacements: req.body,
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    res.status(200).json({
      success: true,
      result: updateSection,
      message: 'Section updated successfully.'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to update section.'
    });
  }
};

/**
 * Function used to get one section detail
 */
const getOneSectionDetail = async (req, res) => {
  try {
    const id = req.params?.id;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Id is missing.',
      });
    }
    // Get the section detail
    const [getSectionDetail] = await sequelize.query(
      'SELECT * FROM `section` WHERE `is_deleted` = false AND `id` = :id',
      {
        replacements: {
          id: id
        },
      });

    if (getSectionDetail?.length) {
      res.status(200).json({
        success: true,
        result: getSectionDetail[0],
        message: 'Get section detail successfully.',
      });
    }
    else {
      res.status(400).json({
        success: false,
        message: 'Failed to get section detail.',
      });
    }
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to get section detail.',
    });
  }
}

/**
 * Function used to delete section
 */
const deleteSection = async (req, res) => {
  try {
    const id = req.params?.id;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Id is missing.',
      });
    }
    const [deleteSection] = await (sequelize.query(
      'UPDATE `section` SET `is_deleted`= true WHERE `id` =:id', {
      replacements: {
        id: id
      }
    }
    ))
    res.status(200).json({
      success: true,
      result: deleteSection,
      message: 'Section deleted successfully.'
    })
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to delete section.',
    });
  }
}
router.get('', getAllSection);
router.get('/:id', getOneSectionDetail);
router.post('', createSection);
router.put('/:id', updateSection);
router.delete('/:id', deleteSection);
module.exports = router;