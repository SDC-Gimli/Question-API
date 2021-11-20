const db = require('../db/index.js');


const postQuestion = async (req, res) => {

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
};

module.exports = postQuestion;