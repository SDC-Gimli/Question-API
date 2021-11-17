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

  let product_id = req.query.product_id;

  let queryStr = `select * from questions where product_id = ${product_id}`;
  db.query(queryStr)
    .then((data) => res.send(data))
    .catch((err) => console.log('server err', err));

})


app.listen (port, () => {
  console.log(`listening at port: ${port}`);
})