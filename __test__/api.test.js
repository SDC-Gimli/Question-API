import getQuestions from '../server/getQuestions.js';
import getAnswers from '../server/getAnswers.js';

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
    expect(res.data[0].photos).toBeDefined();
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