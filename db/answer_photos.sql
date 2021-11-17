create table photos {
  id serial,
  answer_id int,
  url varchar (300),
  primary key (id),
  constraint fk_answer
    foreign key (answer_id)
      references answer(id)
};