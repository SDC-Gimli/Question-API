CREATE TABLE photos (
  id SERIAL,
  answer_id INT,
  url VARCHAR (255),
  PRIMARY KEY (id),
  CONSTRAINT fk_answer
    FOREIGN KEY(answer_id)
      REFERENCES answers(id)
);

\copy photos (id, answer_id, url)
from '/Users/ximing_chen/Desktop/work/SDC/data/answers_photos.csv'
delimiter ','
csv header;
CREATE INDEX answer_idx ON answers (id);