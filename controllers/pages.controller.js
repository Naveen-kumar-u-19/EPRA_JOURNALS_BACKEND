const router = require('express').Router();
const { sequelize } = require('../models');

/**
 * Function used to get all pages
 */
const getAllPages = async (req, res) => {
  try {
    const { offset = 0, limit = 10, searchText = '' } = req.query;

    // Get the overall count of pages list
    const [countResult] = await sequelize.query(
      'SELECT COUNT(*) as count FROM `page` WHERE `is_deleted` = false AND `page_title` LIKE :searchText', {
      replacements: {
        searchText: `%${searchText}%`
      },
    }
    );

    // Get the pages list
    const [getPages] = await sequelize.query(
      'SELECT * FROM `page` WHERE `is_deleted` = false AND `page_title` LIKE :searchText ORDER BY `id` DESC LIMIT :limit OFFSET :offset',
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
        rows: getPages
      },
      message: 'Get Pages successfully.'
    });
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to get pages'
    });
  }
}

/**
 * Function used to create page
 */
const createPage = async (req, res) => {
  try {
    const [createPage] = await sequelize.query(
      `INSERT INTO page (page_code, page_title, meta_description, meta_keywords, content, header_scripts,footer_scripts,og_title,og_description, og_image, og_url,og_type) 
      VALUES (:page_code, :page_title, :meta_description, :meta_keywords, :content, :header_scripts, :footer_scripts, :og_title, :og_description, :og_image, :og_url, :og_type)`,
      {
        replacements: req.body,
        type: sequelize.QueryTypes.INSERT,
      }
    );
    res.status(200).json({
      success: true,
      result: true,
      message: 'Page created successfully.',
    });
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to create page.',
    });
  }
}

/**
 * Function used to update page
 */
const updatePageDetail = async (req, res) => {
  try {
    req.body['id'] = req.params?.id;
    req.body['updatedAt'] = new Date();

    const [updatePage] = await sequelize.query(
      `UPDATE page 
       SET page_title = :page_title,
           meta_description = :meta_description,
           meta_keywords = :meta_keywords,
           content = :content,
           header_scripts = :header_scripts,
           footer_scripts = :footer_scripts,
           og_title = :og_title,
           og_description = :og_description,
           og_image = :og_image,
           og_url = :og_url,
           og_type = :og_type,
           updated_at = :updatedAt
       WHERE id = :id and is_deleted = false`,
      {
        replacements: req.body,
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    res.status(200).json({
      success: true,
      result: updatePage,
      message: 'Page updated successfully.'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to update page.'
    });
  }
};

/**
 * Function used to get one page details
 */
const getOnePageDetail = async (req, res) => {
  try {
    const id = req.params?.id;
    // Get the pages list
    const [getPageDetail] = await sequelize.query(
      'SELECT * FROM `page` WHERE `is_deleted` = false AND `id` = :id',
      {
        replacements: {
          id: id
        },
      });

    if (getPageDetail?.length) {
      res.status(200).json({
        success: true,
        result: getPageDetail[0],
        message: 'Get page detail successfully.',
      });
    }
    else {
      res.status(400).json({
        success: false,
        message: 'Failed to get page detail.',
      });
    }
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to get page detail.',
    });
  }
}

/**
 * Function used to delete page
 */
const deletePage = async (req, res) => {
  try {
    const id = req.params?.id;
    const [deletePage] = await (sequelize.query(
      'UPDATE `page` SET `is_deleted`= true WHERE `id` =:id', {
      replacements: {
        id: id
      }
    }
    ))
    res.status(200).json({
      success: true,
      result: deletePage,
      message: 'Page deleted successfully.'
    })
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to delete page.',
    });
  }
}
router.get('', getAllPages);
router.get('/:id', getOnePageDetail);
router.post('', createPage);
router.put('/:id', updatePageDetail);
router.delete('/:id', deletePage);
module.exports = router;