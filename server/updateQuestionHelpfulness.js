const db = require('../db/index.js');

const updateQuestionHelpfulness = async (req, res) => {
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
};

module.exports = updateQuestionHelpfulness;