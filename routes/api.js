const express = require('express');
const router = express.Router();
const JournalController = require('../controllers/journal.controller');
const PaperController = require('../controllers/paper.controller');
const ArticleController = require('../controllers/article.controller');

router.use('/journal', JournalController); //For Journal related API's
router.use('/paper', PaperController); //For Paper related API's
router.use('/article', ArticleController); //For Article related API's

module.exports = router;