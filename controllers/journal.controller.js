const router = require('express').Router();
const { sequelize } = require('../models');

/**
 * Function used to get all journal details for list page
 */
const getAllJournals = async (req, res) => {
  try {
    const [getJournal] = await sequelize.query(
      'SELECT * FROM "journal" WHERE "is_deleted"=false'
    );
    res.status(200).json({
      success: true,
      result: getJournal,
      message: 'Get journals successfully.'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to get journal'
    });
  }
};


/**
 * Function used to create journal
 */
const createJournal = async (req, res) => {
  try {
    const [createJournal] = await sequelize.query(
      'INSERT INTO "journal" ("name","category","eissn","pissn","sjif","isi","status","short_code") values (:name,:category,:eissn, :pissn, :sjif, :isi, :status, :short_code)',
      {
        replacements: req.body,
        type: sequelize.QueryTypes.INSERT
      }
    )
    res.status(200).json({
      success: true,
      result: true,
      message: 'Journal created successfully.'
    });

  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to create journal.'
    })
  }
}

/**
 * Function used to update journal
 * @param {*} req 
 * @param {*} res 
 */
const updateJournal = async (req, res) => {
  try {
    req.body['id'] = req.params?.id;
    const [updateJournal] = await sequelize.query(
      'UPDATE "journal" set "name" = :name, "category" = :category, "eissn"= :eissn, "pissn" = :pissn, "sjif"= :sjif, "isi"= :isi, "status" = :status, "short_code"= :short_code where "id" = :id',
      {
        replacements: req.body
      }
    );
    res.status(200).json({
      success: true,
      result: true,
      message: 'Journal updated successfully.'
    });
  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to update journal.'
    })
  }
}

/**
 * Function used to delete journal
 * @param {*} req 
 * @param {*} res 
 */
const deleteJournal = async (req, res) => {
  try {
    let id = req.params?.id;
    const [deleteJournal] = await sequelize.query(
      'UPDATE "journal" SET "is_deleted"= true WHERE "id"= :id',
      {
        replacements: { id }
      }
    )

    res.status(200).json({
      success: true,
      result: true,
      message: 'Journal deleted successfully.'
    })

  }
  catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || error,
      message: 'Failed to delete journal.'
    })
  }
}


router.get('', getAllJournals);
router.post('/', createJournal);
router.put('/:id', updateJournal);
router.delete('/:id', deleteJournal);

module.exports = router;