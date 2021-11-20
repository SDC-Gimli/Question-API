const db = require('../db/index.js');


const reportQuestion = async (req, res) => {
  const question_id = req.body.question_id;

  const reportStr = `
    update questions
      set reported = ${true}
      where id = ${question_id}
    `;

    db.none(reportStr)
    .then(() => res.sendStatus(200))
    .catch(err => console.log ('report question', err));
};

module.exports = reportQuestion;