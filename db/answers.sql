create table answers (
  id serial not null,
  question_id int,
  body text,
  date_written bigint,
  answerer_name varchar(40),
  answerer_email varchar(40),
  reported boolean,
  helpful int,
  primary key(id),
  constraint fk_question
    foreign key (question_id)
      references questions(id)
);

\copy answers (id, question_id, body, date_written, answerer_name, answerer_email, reported, helpful)
from '/Users/ximing_chen/Desktop/work/SDC/data/answers.csv'
delimiter ','
csv header;
CREATE INDEX question_idx ON answers (question_id);