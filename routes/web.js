const express = require('express');
const router = express.Router();

const PublicationService = require('../services/web/publicationTime.service');
const FeedbackService = require('../services/web/feedback.service');
const SectionService = require('../services/web/section.service');
const ContactService = require('../services/web/contactUs.service');
const JournalService = require('../services/web/journal.service');
const PaperService = require('../services/web/paper.service');
const PageService = require('../services/web/page.service');

const PaperController = require('../controllers/web/paper.controller');
const CertificateController = require('../controllers/web/certificate.controller');
// const { upload, uploadToLocal } = require('../controllers/s3.controller');
const multer = require('multer');
// const upload = multer({ dest: 'assets/uploads' });
const storage = multer.diskStorage({
  destination: 'assets/uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // e.g., 1623456789012-myfile.pdf
  }
});

const upload = multer({ storage: storage });

const { getPageData } = require('../services/web/page.service');
const sanitizeHtml = require('sanitize-html');

router.get('', (req, res) => {
  res.send('Welcome 123');
});

router.get('/web', (req, res) => {
  res.send('Web 123');
});


// Page rendering Routes
// To render Main the pages
router.get('/pages/:PageCode', async (req, res) => {
  const { PageCode } = req.params;
  const publicationTime = '2025-03-25T10:30:00Z';
  try {
    var pageData = await PageService.getPageData(PageCode);
    const publicationTime = await PublicationService.getNextPublicationTime();
    const sections = await SectionService.getThreeSections();
    const latestFeedbacks = await FeedbackService.getLast10Feedbacks();
    const safeHtml = sanitizeHtml(sections.LATEST_NEWS.content, {
      allowedTags: ['p', 'b', 'i', 'em', 'strong', 'ul', 'ol', 'li', 'br', 'a'],
      allowedAttributes: {
        'a': ['href', 'target'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
    });
    // pageData.content =  sanitizeHtml(pageData.content, {
    //   allowedTags: [ 'p', 'b', 'i', 'em', 'strong', 'ul', 'ol', 'li', 'br', 'a' ],
    //   allowedAttributes: {
    //     'a': [ 'href', 'target' ],
    //   },
    //   allowedSchemes: ['http', 'https', 'mailto'],
    // });
    console.log('pageData', pageData, publicationTime, sections, latestFeedbacks, safeHtml);
    if (pageData) {
      res.render('commonPage', { page: pageData, publicationTime, sections, latestFeedbacks, 
        safeHtml, isJournalPage: false, isArticlePage: false });
    } else {
      res.status(404).send('Page not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

//Journal home Page rendering route
router.get('/journal/:journalCode', async (req, res) => {
  const { journalCode } = req.params;
  try {
    var pageData = await PageService.getPageData(journalCode);
    const publicationTime = await PublicationService.getNextPublicationTime();
    const journalId = await JournalService.getJournalIdByCode(journalCode);
    const articlesArchives = await JournalService.getArtilcesArchives(journalId);
    const journalData = await JournalService.getJournalWithLatestIssue(journalId);
    const currentIssueId = await JournalService.getCurrentIssueId(journalId);
    const articlesList = await JournalService.getArticlesList(currentIssueId);

    // const sections = await SectionService.getThreeSections();
    // const latestFeedbacks = await FeedbackService.getLast10Feedbacks();
    // console.log('pageData', pageData, publicationTime, sections, latestFeedbacks, safeHtml);
    const archives = [
      {
        "year": 2025,
        "months": [
          { "month": "January", "articles_count": 5 },

          { "month": "March", "articles_count": 3 }
        ]
      },
      {
        "year": 2024,
        "months": [
          { "month": "February", "articles_count": 4 }
        ]
      }, {
        "year": 2023,
        "months": [
          { "month": "January", "articles_count": 5 },

          { "month": "March", "articles_count": 3 }
        ]
      },
    ];

    console.log(journalId, articlesArchives, journalData, currentIssueId, articlesList);
    if (pageData) {
      res.render('commonPage', { page: pageData, publicationTime, journalData: journalData[0] , articles: articlesList,
         archives: articlesArchives, isJournalPage: true, isArticlePage: false });
    } else {
      res.status(404).send('Page not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/journal/:journalCode/archives/:period', async (req, res) => {
  const { journalCode, period } = req.params;
  try {
    if(journalCode && period){
      const pageData = await PageService.getPageData(journalCode);
      const [year, month] = period.split('-');
      const publicationTime = await PublicationService.getNextPublicationTime();
      const journalId = await JournalService.getJournalIdByCode(journalCode);
      const articlesArchives = await JournalService.getArtilcesArchives(journalId);
      const journalData = await JournalService.getJournalWithLatestIssue(journalId);
      const currentIssueId = await JournalService.getCurrentIssueIdWithYearAndMonth(year, month);
      const articlesList = await JournalService.getArticlesList(currentIssueId);
  
      // const sections = await SectionService.getThreeSections();
      // const latestFeedbacks = await FeedbackService.getLast10Feedbacks();
      // console.log('pageData', pageData, publicationTime, sections, latestFeedbacks, safeHtml);
      console.log(journalId, articlesArchives, journalData, currentIssueId, articlesList);
      if (pageData) {
        res.render('commonPage', { page: pageData, publicationTime, journalData: journalData[0] , articles: articlesList,
           archives: articlesArchives, isJournalPage: true, isArticlePage: false });
      } else {
        res.status(404).send('Page not found');
      }
    } else {
      res.status(400).send('Invalid journal code or period');
    }
   
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Article View Page rendering route
router.get('/article/:articleId', async (req, res) => {
  const { articleId } = req.params;
  try {
    var pageData = await PageService.getPageData('demo'); // We should prepare a page for article view from articles
    const publicationTime = await PublicationService.getNextPublicationTime();
    const articleDetails = await JournalService.getOneArticleById(articleId);
    console.log('pageData', articleDetails);
    if (pageData) {
      res.render('commonPage', { page: pageData, article: articleDetails[0], publicationTime, isJournalPage: false, isArticlePage: true });
    } else {
      res.status(404).send('Page not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// API Routes
router.get('/nextPublicationTime', async (req, res) => {
  try {
    const nextPublicationTime = await PublicationService.getNextPublicationTime();
    if (!nextPublicationTime) {
      return res.status(404).json({ message: 'Next publication time not set' });
    }
    res.json({ next_publication_time: nextPublicationTime });
  } catch (error) {
    console.error('Error fetching publication time:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/sections/:sectionCode', async (req, res) => {
  const { sectionCode } = req.params;
  const publicationTime = '2025-01-15T10:30:00Z';
  console.log('sectionCode: ', sectionCode);
  try {
    const pageData = await getPageData(sectionCode);
    console.log('pageData', pageData);
    if (pageData) {
      // res.render('commonPage', { page: pageData, publicationTime  });
      res.send(pageData.content);
    } else {
      res.status(404).send('Page not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
module.exports = router;


// GET Section by Code
router.get('/getSection/:sectionCode', async (req, res) => {
  try {
    const { sectionCode } = req.params;
    const section = await SectionService.getSectionByCode(sectionCode);

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.json(section);
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET last 10 approved feedbacks
router.get('/feedbacks/latest', async (req, res) => {
  try {
    const feedbacks = await FeedbackService.getLast10Feedbacks();
    if (feedbacks) {
      res.json(feedbacks);
    } else {
      res.json({ message: 'No Feedbacks available' });
    }
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// GET feedback list with pagination
router.get('/feedbacks', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const result = await FeedbackService.getFeedbackList(page, pageSize);
    // res.json(result);
    if (result) {
      res.json(result);
    } else {
      res.json({ message: 'No Feedbacks available' });
    }
  } catch (error) {
    console.error('Error fetching feedback list:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/home/sections', async (req, res) => {
  try {
    const nextPublicationTime = await PublicationService.getNextPublicationTime();
    const sections = await SectionService.getThreeSections();
    console.log(nextPublicationTime, sections)
    // if (!nextPublicationTime) {
    //   return res.status(404).json({ message: 'Next publication time not set' });
    // }
    res.json({ next_publication_time: nextPublicationTime, sections });
  } catch (error) {
    console.error('Error fetching publication time:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/home/apis', async (req, res) => {
  try {
    const journals = await JournalService.getAllJournalsShort();
    const latestFeedbacks = await FeedbackService.getLast10Feedbacks();
    const latestArticles = await PaperService.getLast15Articles();
    console.log(latestArticles);
    res.json({ journals, latestFeedbacks, latestArticles });
  } catch (error) {
    console.error('Error fetching publication time:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST: Submit Contact Form
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const contact = await ContactService.submitContactForm(name, email, phone, subject, message);
    res.json({ message: 'Contact form submitted successfully', contact });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/journal/full', async (req, res) => {
  try {
    const journals = await JournalService.getAllJournalsFull();
    res.json({ success: true, data: journals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error });
  }
});

// Short version - Fetch journals with only id, name, imgUrl, and short_code
router.get('/journal/short', async (req, res) => {
  try {
    const journals = await JournalService.getAllJournalsShort();
    res.json({ success: true, data: journals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error });
  }
});

router.get('/articles/latest', async (req, res) => {
  try {
    const articles = await PaperService.getLast15Articles();
    if (articles) {
      res.json(articles);
    } else {
      res.json({ message: 'No Articles available' });
    }
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// POST create new feedback
router.post('/feedback', async (req, res) => {
  try {
    const { fullName, email, feedback } = req.body;
    if (!fullName || !email || !feedback) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newFeedback = await FeedbackService.submitFeedback(fullName, email, feedback);
    res.json({ message: 'Feedback submitted successfully', feedback: newFeedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Increment views or downloads
router.post('article/increment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // "download" or "view"

    if (!id || !type) {
      return res.status(400).json({ success: false, message: 'Article ID and type are required.' });
    }

    const result = await PaperService.incrementCount(id, type);
    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

//  Paper Submission
router.post('/paper/submit', upload.single("file"), async (req, res) => {
  try {
    console.log(req.body);
    const paperSubmission = await PaperService.submitPaper(req, res);
    res.json({ message: 'Paper  submitted successfully', paperSubmission });
  } catch (error) {
    console.error('Error submitting paper:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// GET paper status by paperIndex
router.get('/paper/status', PaperController.getPaperStatus);
router.get('/paper/authors', PaperController.getPaperAuthors);
// GET certificate details by certificateId
router.get('/details', CertificateController.getCertificateDetails);

module.exports = router;

