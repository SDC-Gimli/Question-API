const db = require('../db/index.js');
require ('regenerator-runtime/runtime');

const getAnswers = async (req, res) => {

  let question_id = req.query.question_id;
  let response = {};
  // const aStr = `select id, body, to_timestamp(date_written/1000) as date, answerer_name, helpful as helpfulness from answers where question_id = 1 order by helpfulness desc`;

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

  await db.query(aStr)
    .then(data => {
      for(let a of data) {
        if(a.photos[0].id === null) {
          a.photos = [];
        }
      }
      res.send(data)
    })
    .catch(err => {
      console.log('answer query err', err);
      res.sendStatus(500);
    });
}

module.exports = getAnswers;