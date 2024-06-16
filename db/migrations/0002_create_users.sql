create table if not exists senseis (
  id integer primary key autoincrement,
  uid text not null,
  username text not null,
  friendCode text,
  profileStudentId text,
  googleId text,
  active booklean not null default false,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp
);

create unique index if not exists senseis_uid on senseis (uid);
create unique index if not exists senseis_username on senseis (username);
create unique index if not exists senseis_googleId on senseis (googleId);


create table if not exists followerships (
  id integer primary key autoincrement,
  followerId integer not null,
  followeeId integer not null,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp
);

create index if not exists followerships_followerId on followerships (followerId);
create index if not exists followerships_followeeId on followerships (followeeId);


create table if not exists user_activities (
  id integer primary key autoincrement,
  uid text not null,
  userId integer not null,
  activityType text not null,
  payload jsonb not null,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp
);

create unique index if not exists user_activities_uid on user_activities (uid);
create index if not exists user_activities_userId on user_activities (userId);
