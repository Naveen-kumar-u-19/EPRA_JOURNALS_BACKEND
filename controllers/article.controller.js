const router = require('express').Router();
const { sequelize } = require('../models');
const { uploadFile, upload } = require('./s3.controller');
/**
 * Function used tp create article
 */
const createArticle = async (req, res) => {
  try {
    if (req.body?.published_on) {
      req.body['published_on'] = new Date(req.body['published_on']);
    }
    if (!Number(req.body?.order)) {
      req.body['order'] = null;
    }
    const uploadDetail = await uploadFile(req); //Upload Doc
    if (uploadDetail.key) {
      req.body['doc_url'] = uploadDetail?.key;
      console.log(req.body);
      //Create article
      const [createArticle] = await sequelize.query(
        'INSERT INTO `article` (`doi`, `google_search_link`, `google_scholar_link`, `published_on`, `order`, `abstract`, `keywords`,`paper_id`, `doc_url`) VALUES (:doi, :google_search_link, :google_scholar_link, :published_on, :order, :abstract, :keywords, :paper_id, :doc_url)',
        {
          replacements: req.body,
          type: sequelize.QueryTypes.INSERT,
        }
      );
      //Update the paper table
      const [updatePaper] = await sequelize.query(
        'UPDATE `paper` SET `is_article_Created` = 1,`status`="PUB" where `id` =:paper_id', {
        replacements: req.body
      })

      res.status(200).json({
        success: true,
        result: true,
        message: 'Article created successfully.',
      });
    }
    else {
      res.status(400).json({
        success: false,
        error: 'Failed to upload.',
        message: 'Failed to upload.',
      });
    }
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to create article.',
    });
  }
}

/**
 * Function used to update article
 */
const updateArticle = async (req, res) => {
  try {
    if (req.body?.published_on) {
      req.body['published_on'] = new Date(req.body['published_on']);
    }
    if (!Number(req.body?.order)) {
      req.body['order'] = null;
    }
    if (req.file?.originalname) {
      const uploadDetail = await uploadFile(req); //Upload Doc
      if (uploadDetail.key) {
        req.body['doc_url'] = uploadDetail?.key;
      }
    }
    //Update article
    const [updateArticle] = await sequelize.query(
      'UPDATE `article` SET `doi` = :doi, `google_search_link` = :google_search_link, `google_scholar_link` = :google_scholar_link, `published_on` = :published_on, `order` = :order, `abstract` = :abstract, `keywords` = :keywords, `doc_url` = :doc_url WHERE `id` = :id',
      { replacements: { id: req.params.id, ...req.body }, type: sequelize.QueryTypes.UPDATE })

    res.status(200).json({
      success: true,
      result: true,
      result: updateArticle,
      message: 'Article updated successfully.',
    });

  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to update article.',
    });
  }

}

/**
 * Function used to get article detail for list
 */
const getArtcleDetail = async (req, res) => {
  try {

    const { offset = 0, limit = 10, searchText = '' } = req.query;

    // Get the overall count of article list
    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) as count FROM article 
          INNER JOIN paper ON article.paper_id = paper.id
          WHERE article.is_deleted= false and paper.is_deleted = false AND (paper.paper_title LIKE :searchText OR paper.paper_index LIKE :searchText)`, {
      replacements: {
        searchText: `%${searchText}%`,
      }
    }
    );

    // Get the overall count of article list with paper detail
    const [articleDetails] = await sequelize.query(
      `SELECT article.id as article_id, article.doi, article.doc_url, article.google_search_link, article.google_scholar_link, article.order, article.published_on, article.abstract, article.keywords, paper.* FROM article 
          INNER JOIN paper ON article.paper_id = paper.id
          WHERE article.is_deleted= false and paper.is_deleted = false AND (paper.paper_title LIKE :searchText OR paper.paper_index LIKE :searchText) ORDER BY article_id DESC LIMIT :limit OFFSET :offset`, {
      replacements: {
        searchText: `%${searchText}%`,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    }
    );

    res.status(200).json({
      success: true,
      result: {
        count: Number(countResult?.[0]?.count),
        rows: articleDetails
      },
      message: 'Get Articles successfully.'
    })

  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to get article.',
    });
  }
}

/**
 * Function used to delete article
 */
const deleteArticle = async (req, res) => {
  try {
    const id = req.params?.id;
    const paperId = req.params?.paper_id;
    if (id) {
      //Delete article
      const [deletePaper] = await (sequelize.query(
        'UPDATE `article` SET `is_deleted`= true WHERE `id` =:id', {
        replacements: {
          id: id
        }
      }
      ));
      //Update the paper table
      const [updatePaper] = await sequelize.query(
        'UPDATE `paper` SET `is_article_Created` = 0, `status`="ACC"  where `id` =:paper_id', {
        replacements: {
          paper_id: paperId
        }
      })
      res.status(200).json({
        success: true,
        result: true,
        message: 'Article deleted successfully.',
      });
    }
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to delete article.',
    });
  }
}

router.get('', getArtcleDetail);
router.post('', upload.single("file"), createArticle);
router.put('/:id', upload.single("file"), updateArticle);
router.delete('/:id/paper/:paper_id', deleteArticle);
module.exports = router;