create table questions (
  id SERIAL NOT NULL,
  product_id int not null,
  body text,
  date_written bigint,
  asker_name varchar(40),
  asker_email varchar(40),
  reported boolean,
  helpful int,
  primary key (id)
)

\copy questions (id, product_id, body, date_written, asker_name, asker_email, reported, helpful)
from '/Users/ximing_chen/Desktop/work/SDC/data/questions.csv'
delimiter ','
csv header;
CREATE INDEX product_idx on questions (product_id);