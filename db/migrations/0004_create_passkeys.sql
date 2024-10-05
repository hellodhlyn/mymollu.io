create table if not exists passkeys (
  id integer primary key autoincrement,
  uid text not null,
  userId integer not null,
  memo text not null,
  keyId text not null,
  publicKey text not null,
  rawRequest text not null,
  counter integer not null default 0,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp
);

create index if not exists passkeys_userId on passkeys (userId);
create unique index if not exists passkeys_keyId on passkeys (keyId);
