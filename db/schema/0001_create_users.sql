drop table if exists users;
create table users (
  id               integer primary key,
  username         text    not null unique,
  active           boolean not null default FALSE,
  googleId         text,
  profileStudentId text,
  createdAt        timestamp default current_timestamp
);
