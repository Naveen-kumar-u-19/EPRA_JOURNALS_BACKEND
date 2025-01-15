const express = require('express');
const router = express.Router();
const { getPageData } = require('../services/page.service');

router.get('', (req, res) => {
    res.send('Welcome 123');
});

router.get('/web', (req, res) => {
    res.send('Web 123');
});

router.get('/:PageCode', async (req, res) => {
    const { PageCode } = req.params;
    console.log('PageCode: ', PageCode);
    try {
      const pageData = await getPageData(PageCode);
      console.log(pageData);
      if (pageData) {
        res.render('commonPage', { page: pageData });
      } else {
        res.status(404).send('Page not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
module.exports = router;
