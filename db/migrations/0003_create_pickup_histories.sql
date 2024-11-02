create table if not exists pickup_histories (
  id integer primary key autoincrement,
  uid text not null,
  userId integer not null,
  eventId text not null,
  result jsonb not null,
  rawResult text,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp
);

create unique index if not exists pickup_histories_uid on pickup_histories (uid);
create index if not exists pickup_histories_userId on pickup_histories (userId);
