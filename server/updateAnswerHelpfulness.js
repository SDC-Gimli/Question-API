const db = require('../db/index.js');

const updateAnswerHelpfulness = async (req, res) => {
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
};

module.exports = updateAnswerHelpfulness;