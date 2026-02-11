const express = require("express");
const router = express.Router();
const { listerFaq } = require("../../controllers/support/faqControllers");

// FAQ
router.get("/faq", listerFaq);

module.exports = router;