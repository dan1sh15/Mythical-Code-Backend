const express = require('express');
const router = express.Router();
const { addProblem, getAllProblems, getProblem, checkProblem, getProblemCode } = require('../controllers/problems');
const { auth } = require("../middlewares/auth");

router.post('/addProblem', auth, addProblem);
router.get('/getAllProblems', getAllProblems);
router.get('/getProblem/:id', getProblem);
router.post('/checkProblem/:slug', auth, checkProblem);
router.get('/getProblemCode/:slug', auth, getProblemCode);

module.exports = router;