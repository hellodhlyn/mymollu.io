create table if not exists parties (
  id integer primary key autoincrement,
  uid text not null,
  name text not null,
  userId integer not null,
  raidId text,
  students jsonb not null,
  memo text,
  showAsRaidTip boolean not null default false,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp
);

create unique index if not exists parties_uid on parties (uid);
create index if not exists parties_userId on parties (userId);
create index if not exists parties_raidId on parties (raidId);
