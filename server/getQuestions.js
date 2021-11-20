const db = require('../db/index.js');
require ('regenerator-runtime/runtime');

const getQuestions = async (req, res) => {
  // fetch all the questions and answers, this function should format the questions.
  const response = {};

  let product_id = req.query.product_id;
  response.product_id = product_id;

  response.results = await db.query(`
    select
      id as question_id,
      body as question_body,
      to_timestamp(date_written/1000) as question_date,
      asker_name,
      helpful as question_helpfullness,
      reported
    from questions
    where product_id = ${product_id}
    order by question_helpfullness desc`
    )
    .catch(err => console.log(err))

  for (let q of response.results) {
    let id = q.question_id;
    q.answers = {};
    let query = `
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
      WHERE question_id = ${id}
      GROUP BY answers.id`;

      const answers = await db.query(query)
      .catch(err => res.sendStatus(500));

      for (let a of answers) {

        q.answers[a.answer_id] = a;

        if(a.photos[0].id === null) {
          a.photos = [];
        }
      }
  }
  res.send(response);

  // let qStr = `
  //   select
  //     questions.id as question_id,
  //     questions.body as question_body,
  //     to_timestamp(questions.date_written/1000) as question_date,
  //     questions.asker_name,
  //     questions.helpful as question_helpfullness,
  //     questions.reported,
  //     json_agg(
  //       json_build_object(
  //         'id', answers.id,
  //         'body', answers.body,
  //         'date', to_timestamp(answers.date_written/1000),
  //         'answerer_name', answers.answerer_name,
  //         'helpfulness',  answers.helpful
  //         )
  //     )
  //     AS answers
  //     from questions
  //     left join answers
  //     on answers.question_id = questions.id
  //     where product_id = ${product_id}
  //     group by questions.id
  //     order by question_helpfullness desc`;

  // db.query(qStr)
  //   .then((data) => {
  //     response.results = data;
  //     res.send(response);
  //   })
  //   .catch((err) => {
  //     console.log('query question err', err);
  //     res.sendStatus(500);
  //   });
};

module.exports = getQuestions;