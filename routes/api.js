const express = require('express');
const router = express.Router();
const JournalController = require('../controllers/journal.controller');
const PaperController = require('../controllers/paper.controller');
const ArticleController = require('../controllers/article.controller');
const AdminAuthController = require('../controllers/adminAuth.controller');
const IssuePeriodController = require('../controllers/issuePeriod.controller');
const PagesController = require('../controllers/pages.controller');
const SectionController = require('../controllers/section.controller');
const NextPublicationController = require('../controllers/nextPublication.controller');
const IndexingController = require('../controllers/indexing.controller');
const AuthorController = require('../controllers/author.controller');
const passport = require('passport');

router.use('/journal', passport.authenticate('jwt', { session: false }), JournalController); //For Journal related API's
router.use('/paper', passport.authenticate('jwt', { session: false }), PaperController); //For Paper related API's
router.use('/article', passport.authenticate('jwt', { session: false }), ArticleController); //For Article related API's
router.use('/issue-period', passport.authenticate('jwt', { session: false }), IssuePeriodController);//For Issue period API's
router.use('/pages', passport.authenticate('jwt', { session: false }), PagesController); //For Admin pages
router.use('/section', passport.authenticate('jwt', { session: false }), SectionController); //For Admin sections
router.use('/next-publication', passport.authenticate('jwt', { session: false }), NextPublicationController); //For Next publication
router.use('/indexing', passport.authenticate('jwt', { session: false }), IndexingController); //For Indexing
router.use('/author', passport.authenticate('jwt', { session: false }), AuthorController); //For Author
router.use('/adminAuth', AdminAuthController); //For Admin auth API's

module.exports = router;