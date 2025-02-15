const router = require('express').Router();
const { sequelize } = require('../models');

/**
 * Function used to get paper details
 */
const getPaperDetails = async (req, res) => {
  try {
    const { offset = 0, limit, searchText = '' } = req.query;
    let status = ""; //Used to filter by status
    if (req.query?.filterDetail) {
      const filterDetail = JSON.parse(req.query?.filterDetail);
      status = filterDetail.status ?? '';
    }

    // Get the overall count of paper list
    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) as count FROM paper 
      INNER JOIN journal ON paper.journal_id = journal.id
      WHERE paper.is_deleted= false and journal.is_deleted = false AND (:status = '' OR paper.status = :status) AND (paper.paper_title LIKE :searchText OR paper.paper_index LIKE :searchText)`, {
      replacements: {
        searchText: `%${searchText}%`,
        status: status
      }
    }
    );

    // Get the paper list
    const [paperDetails] = await sequelize.query(
      `SELECT paper.*,journal.name AS journal_name, journal.is_deleted as journal_is_deleted FROM paper 
      INNER JOIN journal ON paper.journal_id = journal.id
      WHERE paper.is_deleted= false AND journal.is_deleted = false AND (:status = '' OR paper.status = :status) AND (paper.paper_title LIKE :searchText OR paper.paper_index LIKE :searchText) ORDER BY id DESC LIMIT :limit OFFSET :offset`,
      {
        replacements: {
          status: status,
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
      message: 'Failed to get papers.'
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
        message: 'Invalid paper id.'
      });
    }
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to get paper detail.'
    });
  }
}

/**
 * Function used to update paper detail
 */
const updatePaperDetail = async (req, res) => {
  try {
    req.body['id'] = req.params?.id;
    req.body['updateaAt'] = new Date();

    const [updateJournal] = await sequelize.query(
      'UPDATE `paper` SET `paper_title` =:paper_title, `author_name` =:author_name, `mobile` =:mobile,`email` =:email,`designation`=:designation,`dept`=:dept,`college_university`=:college_university,`institution_place`=:institution_place, `state`=:state,`country`=:country,`local_ip`=:local_ip,`status`=:status where `id` =:id', {
      replacements: req.body
    }
    )
    res.status(200).json({
      success: true,
      result: updateJournal,
      message: 'Paper updated sucessfully.'
    })

  }
  catch (err) {
    res.status(400).json({
      success: false,
      error: err.message | err,
      message: 'Failed to update paper.'
    })
  }
}

/**
 * Function used to delete paper detail
 */
const deletePaperDetail = async (req, res) => {
  try {
    const id = req.params?.id;

    const [deletePaper] = await (sequelize.query(
      'UPDATE `paper` SET `is_deleted`= true WHERE `id` =:id', {
      replacements: {
        id: id
      }
    }
    ))
    res.status(200).json({
      success: true,
      result: deletePaper,
      message: 'Paper deleted successfully.'
    })
  }
  catch (err) {
    res.status(400).json({
      success: false,
      error: err.message | err,
      message: 'Failed to delete paper.'
    })
  }
}

/**
 * Function used to get paper detail by status
 */
const getPaperForNewArticle = async (req, res) => {
  try {
    const status = req.query?.status;

    // Get the paper list
    const [paperDetails] = await sequelize.query(
      `SELECT paper.id, paper.paper_index, journal.id as journal_id, journal.name as journal_name FROM paper 
        INNER JOIN journal ON paper.journal_id = journal.id
        WHERE paper.is_deleted= false AND journal.is_deleted = false AND paper.is_article_Created=0 AND (:status = '' OR paper.status = :status) ORDER BY id DESC`,
      {
        replacements: {
          status: status,
        }
      }
    )

    res.status(200).json({
      success: true,
      paperDetails: paperDetails,
      message: 'Get Papers successfully.'
    })

  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to get papers.'
    });
  }
}

router.get('', getPaperDetails);
router.get('/readyforarticle', getPaperForNewArticle);
router.get('/:id', getOnePaperDetail);
router.put('/:id', updatePaperDetail);
router.delete('/:id', deletePaperDetail);
module.exports = router;