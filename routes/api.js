const express = require('express');
const router = express.Router();
const JournalController = require('../controllers/journal.controller');


router.use('/journal', JournalController);//For Journal related API's


module.exports = router;