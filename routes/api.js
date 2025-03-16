const express = require('express');
const router = express.Router();
const JournalController = require('../controllers/journal.controller');
const PaperController = require('../controllers/paper.controller');
const ArticleController = require('../controllers/article.controller');
const AdminAuthController = require('../controllers/adminAuth.controller');
const passport = require('passport');

router.use('/journal', passport.authenticate('jwt', { session: false }), JournalController); //For Journal related API's
router.use('/paper', passport.authenticate('jwt', { session: false }), PaperController); //For Paper related API's
router.use('/article', passport.authenticate('jwt', { session: false }), ArticleController); //For Article related API's
router.use('/adminAuth', AdminAuthController); //Fo Admin auth API'S

module.exports = router;