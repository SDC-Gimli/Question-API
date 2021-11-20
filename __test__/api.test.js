import getQuestions from '../server/getQuestions.js';
import getAnswers from '../server/getAnswers.js';
import postQuestion from '../server/postQuestion.js';
import postAnswer from '../server/postAnswer.js';
import updateQuestionHelpfulness from '../server/updateQuestionHelpfulness.js';
import reportQuestion from '../server/reportQuestion.js';
import updateAnswerHelpfulness from '../server/updateAnswerHelpfulness.js';
import reportAnswer from '../server/reportAnswer.js';

import db from '../db';

const deleteQuestion = async (id) => {
  await db.query(`delete from questions where id = ${id}`);
};

const deleteAnswer = async (id) => {
  await db.query(`delete from answers where id = ${id}`)
};

const setFalse = async (table, id) => {
  await db.query(`update ${table} set reported = ${false} where id = ${id}`);
}

const decrementHelpfulness = async (table, id, target) => {
  await db.query(`update ${table} set helpful = ${target} where id = ${id}`);
}

describe('get questions', () => {

  it('should query questions', async () => {
    const req = {query: {product_id: 23}};
    const res = {
      data:'',
      sendStatus: 0,
      sendStatus: (number) => {res.status = number},
      send: (input) => {
        res.data = input;
      }
    }

    await getQuestions(req, res);

    expect(res.data === '').toEqual(false);
  });

  it('output should be an object', async () => {
    const req = {query: {product_id: 23}};
    const res = {
      data:'',
      sendStatus: 0,
      sendStatus: (number) => {res.status = number},
      send: (input) => {
        res.data = input;
      }
    }

    await getQuestions(req, res);

    expect(typeof res.data).toEqual('object');
    expect(res.data.product_id).toEqual(req.query.product_id);
    expect(Array.isArray(res.data.results)).toBe(true);
  });

});

describe ('get answers', () => {

  it('should query the answers', async () => {
    const req = {query: {question_id: 1004}};
    const res = {
      data:'',
      sendStatus: 0,
      sendStatus: (number) => {res.status = number},
      send: (input) => {
        res.data = input;
      }
    }

    await getAnswers (req, res);

    expect(typeof res.data).toEqual('object');
    expect(Array.isArray(res.data)).toEqual(true);
  });

  it('should includes photos in the answers', async () => {
    const req = {query: {question_id: 1004}};
    const res = {
      data:'',
      sendStatus: 0,
      sendStatus: (number) => {res.status = number},
      send: (input) => {
        res.data = input;
      }
    }

    await getAnswers (req, res);

    for(let a of res.data) {
      expect(a.photos).toBeDefined();
    }

  });

})

describe ('post question',  () => {

  it('should be able to post a question', async () => {
    let maxId = await db.query('select MAX(id) from questions');
    const req = {
      body: {
        product_id: 88,
        question_body: 'testing Jest',
        asker_name: 'builder',
        asker_email: 'lalal@gmail.com'
      }
    };

    const res = {
      status: 0,
      sendStatus: (num) => {res.status = num}
    };

    await postQuestion(req, res);

    let id = await db.query('select MAX(id) from questions');

    expect(id[0].max).toEqual(maxId[0].max + 1);
    expect(res.status).toEqual(201);

    //delete the question
    deleteQuestion(id[0].max);
  });

  it('question content should be correct', async () => {
    let maxId = await db.query('select MAX(id) from questions');
    const req = {
      body: {
        product_id: 88,
        question_body: 'testing Jest',
        asker_name: 'builder',
        asker_email: 'lalal@gmail.com'
      }
    };

    const res = {
      status: 0,
      sendStatus: (num) => {res.status = num}
    };

    postQuestion(req, res);

    let id = await db.query('select MAX(id) from questions');
    let question = await db.query(`select * from questions where id = ${id[0].max}`);

    expect(question[0].body).toEqual(req.body.question_body);
    expect(question[0].product_id).toEqual(req.body.product_id);
    expect(question[0].asker_email).toEqual(req.body.asker_email);
    expect(question[0].asker_name).toEqual(req.body.asker_name);
    expect(res.status).toEqual(201);

    //delete the question
    deleteQuestion(id[0].max);
  });
})

describe ('post answer', () => {

  it('should post an answer', async () => {
    const maxId = await db.query('select max(id) from answers');

    const req = {
      body: {
        question_id: 289,
        body: 'jest test',
        name: 'test',
        email: 'test@gmail.com',
        photos: []
      }
    };

    const res = {
      status: 0,
      sendStatus: (num) => {res.status = num}
    };

    await postAnswer (req, res);

    let id = await db.query(`select max(id) from answers`);

    expect(id[0].max).toEqual(maxId[0].max + 1);
    expect(res.status).toEqual(201);

    deleteAnswer(id[0].max);
  });

  it('answer content should match', async () => {
    let maxId = await db.query('select max(id) from answers');

    const req = {
      body: {
        question_id: 289,
        body: 'jest test',
        name: 'test',
        email: 'test@gmail.com',
        photos: []
      }
    };

    const res = {
      status: 0,
      sendStatus: (num) => {res.status = num}
    };

    await postAnswer (req, res);

    let id = await db.query(`select max(id) from answers`);
    let answer = await db.query (`select * from answers where id = ${id[0].max}`);

    expect(answer[0].question_id).toEqual(req.body.question_id);
    expect(answer[0].body).toEqual(req.body.body);
    expect(answer[0].answerer_name).toEqual(req.body.name);
    expect(answer[0].answerer_email).toEqual(req.body.email);
    expect(res.status).toEqual(201);

    await deleteAnswer(id[0].max);
  });
})

describe ('question helpfulness and report', () => {

  it('should update helpfulness' , async () => {
    const req = {
      body: {
        question_id: 289
      }
    }

    const res = {
      status: 0,
      sendStatus: (num) => res.status = num
    };

    let curr = await db.query(`select helpful from questions where id = 289`);

    await updateQuestionHelpfulness(req, res);

    let updated = await db.query(`select helpful from questions where id = 289`);

    expect (updated[0].helpful).toEqual(curr[0].helpful + 1);
    expect(res.status).toEqual(200);

    decrementHelpfulness('questions', 289, curr[0].helpful);
  });

  it('should report the problem', async () => {
    const req = {
      body: {
        question_id: 289
      }
    }

    const res = {
      status: 0,
      sendStatus: (num) => res.status = num
    };

    let isReported = await db.query(`select reported from questions where id = 289`);

    expect(isReported[0].reported).toEqual(false);

    await reportQuestion(req, res);

    isReported = await db.query(`select reported from questions where id = 289`);
    expect(isReported[0].reported).toEqual(true);

    setFalse('questions', 289);
  });
})

describe ('answer helpfulness and report', () => {
  it('should update helpfulness', async () => {
    const req = {
      body: {
        answer_id: 6879320
      }
    };

    const res = {
      status: 0,
      sendStatus: (num) => res.status = num
    };

    let curr = await db.query(`select helpful from answers where id = 6879320`);

    await updateAnswerHelpfulness(req, res);

    let updated = await db.query(`select helpful from answers where id = 6879320`);

    expect(updated[0].helpful).toEqual(curr[0].helpful + 1);

    decrementHelpfulness('answers', 6879320, curr[0].helpful);

  });

  it('should report an answer', async () => {
    const req = {
      body: {
        answer_id: 6879320
      }
    };

    const res = {
      status: 0,
      sendStatus: (num) => res.status = num
    };

    let isReported = await db.query(`select reported from answers where id = 6879320`);

    expect(isReported[0].reported).toEqual(false);

    await reportAnswer(req, res);

    isReported = await db.query(`select reported from answers where id = 6879320`);
    expect(isReported[0].reported).toEqual(true);

    setFalse('answers', 6879320);
  });
})