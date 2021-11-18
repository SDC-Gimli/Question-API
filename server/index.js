const express = require('express');
const db = require('../db/index.js');

const app = express();
const port = 3030;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {

  res.send('get ok');
});

// get requests for answers API

app.get('/answers', (req, res) => {
  let question_id = req.query.question_id;
  let response = {};
  // const aStr = `select id, body, to_timestamp(date_written/1000) as date, answerer_name, helpful as helpfulness from answers where question_id = ${question_id} order by helpfulness desc`;

  const aStr = `
    SELECT
      answers.id as answer_id,
      answers.body,
      to_timestamp(answers.date_written/1000) as date,
      answers.answerer_name,
      answers.helpful as helpfulness,
      json_agg
        (json_build_object
            ('id', photos.id,
            'url', photos.url)
          ) AS photos
      FROM answers
      LEFT JOIN photos
      ON photos.answer_id = answers.id
      WHERE question_id = ${question_id}
      GROUP BY answers.id
      order by helpfulness desc`;

  db.query(aStr)
    .then(data => {
      res.send(data)
    })
    .catch(err => {
      console.log('answer query err', err);
      res.sendStatus(500);
    });
});


// get request for all questions and asnwers

app.get('/questions', async (req, res) => {
  // fetch all the questions and answers, this function should format the questions.
  const response = {};

  let product_id = req.query.product_id;
  response.product_id = product_id;

  // response.results = await db.query(`select id as question_id, body as question_body, to_timestamp(date_written/1000) as question_date,asker_name, helpful as question_helpfullness, reported from questions where product_id = ${product_id} order by question_helpfullness desc`);

  // console.log(response.results);

  let qStr = `
    select
      questions.id as question_id,
      questions.body as question_body,
      to_timestamp(questions.date_written/1000) as question_date,
      questions.asker_name,
      questions.helpful as question_helpfullness,
      questions.reported,
      json_agg(
        json_build_object(
          'id', answers.id,
          'body', answers.body,
          'date', to_timestamp(answers.date_written/1000),
          'answerer_name', answers.answerer_name,
          'helpfulness',  answers.helpful
          )
      )
      AS answers
      from questions
      left join answers
      on answers.question_id = questions.id
      where product_id = ${product_id}
      group by questions.id
      order by question_helpfullness desc`;

  db.query(qStr)
    .then((data) => {
      response.results = data;
      res.send(response);
    })
    .catch((err) => {
      console.log('query question err', err);
      res.sendStatus(500);
    });

});

app.post('/questions', async (req, res) => {

  const question_body = req.body.question_body;
  const asker_name = req.body.asker_name;
  const asker_email = req.body.asker_email;
  const product_id = req.body.product_id;

  const id = await db.query('SELECT MAX(id) from questions')
    .catch(() => {
      console.log('get id err');
      res.sendStatus(500);
    });

  const qPost = `
    insert into
      questions (
        id,
        product_id,
        body,
        date_written,
        asker_name,
        asker_email,
        reported,
        helpful
      )
      values (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
      )`;

  db.none(qPost, [
    id[0].max + 1,
    product_id,
    question_body,
    Date.now(),
    asker_name,
    asker_email,
    false,
    0
  ])
    .then((msg) => res.send(msg))
    .catch(err => {
      console.log('question post err', err);
      res.sendStatus(500);
    })
});


app.listen(port, () => {
  console.log(`listening at port: ${port}`);
})



