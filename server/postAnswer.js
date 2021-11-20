const db = require('../db/index.js');


const postAnswer = async (req, res) => {
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


};

module.exports = postAnswer;