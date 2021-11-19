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
      reported,
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

// post questions api

app.post('/questions', async (req, res) => {

  const question_body = req.body.question_body;
  const asker_name = req.body.asker_name;
  const asker_email = req.body.asker_email;
  const product_id = req.body.product_id;

  const id = await db.query('select MAX(id) from questions')
    .catch(() => {
      console.log('get question id err');
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
    .then(() => res.sendStatus(201))
    .catch(err => {
      console.log('question post ', err);
      res.sendStatus(500);
    })
});

// post answer api

app.post('/answers', async (req, res) => {
  const body = req.body.body;
  const name = req.body.name;
  const email = req.body.email;
  const question_id = req.body.question_id;
  const photos = req.body.photos;

  const id = await db.query(`select max(id) from answers`)
    .catch(err => console.log('get answer id err'));

  const imgId = await db.query('select max(id) from photos')
    .catch(err => console.log('get photo id err'));


  const aPost = `
    insert into
      answers (
        id,
        question_id,
        body,
        date_written,
        answerer_name,
        answerer_email,
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

      const imgPost = `
      insert into
        photos (
          id,
          answer_id,
          url
        )
        values (
          $1,
          $2,
          $3
        )`;

  await db.none(aPost, [
    id[0].max + 1,
    question_id,
    body,
    Date.now(),
    name,
    email,
    false,
    0
  ])
    .then(() => {
      if (photos.length > 0) {
        for(let i = 0; i < photos.length; i++) {

           db.none(imgPost, [
            imgId[0].max + 1 + i,
            id[0].max + 1,
            photos
          ]).catch(err => console.log('photos', err))

        }
      }
    })
    .then(() => res.sendStatus(201))
    .catch((err) => {
      console.log('post answer ', err);
      res.sendStatus(500);
    });


});


// update question helpfulness

app.put('/questions/helpfulness', async (req, res) => {
  const question_id = req.body.question_id;

  const currHelpfulness = await db.query(`select helpful from questions where id = ${question_id}`);

  const helpStr = `
    update questions
      set helpful = ${currHelpfulness[0].helpful + 1}
      where id = ${question_id}`;

  db.none(helpStr)
  .then(() => res.sendStatus(200))
  .catch(err => {
    console.log('update question helpfulness', err);
    res.sendStatus(400);
  })
});



// update answer helpfulness

app.put('/answers/helpfulness', async (req, res) => {
  const answer_id = req.body.answer_id;

  const currHelpfulness = await db.query(`select helpful from answers where id = ${answer_id}`);

  const helpStr = `
    update answers
      set helpful = ${currHelpfulness[0].helpful + 1}
      where id = ${answer_id}`;

  db.none(helpStr)
  .then(() => res.sendStatus(200))
  .catch(err => {
    console.log('update answer helpfulness', err);
    res.sendStatus(400);
  })
});

//update question report
app.put ('/questions/report', async (req, res) => {
  const question_id = req.body.question_id;

  const reportStr = `
    update questions
      set reported = ${true}
      where id = ${question_id}
    `;

    db.none(reportStr)
    .then(() => res.sendStatus(200))
    .catch(err => console.log ('report question', err));
});

//update answer report
app.put ('/answers/report', async (req, res) => {
  const answer_id = req.body.answer_id;

  const reportStr = `
    update answers
      set reported = ${true}
      where id = ${answer_id}
    `;

    db.none(reportStr)
    .then(() => {res.sendStatus(200)})
    .catch(err => console.log ('report answer', err));
});

app.listen(port, () => {
  console.log(`listening at port: ${port}`);
})



