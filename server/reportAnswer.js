const db = require('../db/index.js');

const reportAnswer = async (req, res) => {
  const answer_id = req.body.answer_id;

  const reportStr = `
    update answers
      set reported = ${true}
      where id = ${answer_id}
    `;

    db.none(reportStr)
    .then(() => {res.sendStatus(200)})
    .catch(err => console.log ('report answer', err));
};

module.exports = reportAnswer;