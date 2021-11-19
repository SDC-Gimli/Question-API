const express = require('express');
const db = require('../db/index.js');
const getAnswers = require('./getAnswers.js');
const getQuestions = require('./getQuestions.js');
const postQuestion = require('./postQuestion.js');
const postAnswer = require('./postAnswer.js');
const updateQuestionHelpfulness = require('./updateQuestionHelpfulness.js');
const updateAnswerHelpfulness = require('./updateAnswerHelpfulness.js');
const reportQuestion = require('./reportQuestion.js');
const reportAnswer = require('./reportAnswer.js');

const app = express();
const port = 3030;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {

  res.send('get ok');
});

// get requests for answers API

app.get('/answers', getAnswers);


// get request for all questions and asnwers

app.get('/questions', getQuestions);

// post questions api

app.post('/questions', postQuestion);

// post answer api

app.post('/answers', postAnswer);


// update question helpfulness

app.put('/questions/helpfulness', updateQuestionHelpfulness);



// update answer helpfulness

app.put('/answers/helpfulness', updateAnswerHelpfulness);

//update question report
app.put ('/questions/report', reportQuestion);

//update answer report
app.put ('/answers/report', reportAnswer);

app.listen(port, () => {
  console.log(`listening at port: ${port}`);
})



module.exports = app;