const express = require ('express');
const db = require('../db/index.js');

const app = express();
const port = 3030;
app.use (express.json());
app.use (express.urlencoded({extended: true}));

app.get('/', (req, res) => {

  res.send('get');
});

app.get('/questions', (req, res) => {
  // fetch all the answer, this function should format the questions.
})


app.listen (port, () => {
  console.log(`listening at port: ${port}`);
})