create table "incidents" (
  "id" uuid primary key default gen_random_uuid(),
  "time" timestamp with time zone not null,
  "service" text not null,
  "source" text not null,
  "subservice" text not null,
  "priority" integer not null check (priority >= 1 and priority <= 5),
  "category" text not null,
  "sentiment_analysis" text,
  "summary" text not null,
  "original" text not null,
  "keywords" text[] default '{}',
  "created_at" timestamp with time zone default now(),
  "updated_at" timestamp with time zone default now()
);

create index "idx_incidents_time" on "incidents" ("time" desc);
create index "idx_incidents_service" on "incidents" ("service");
create index "idx_incidents_priority" on "incidents" ("priority");
create index "idx_incidents_category" on "incidents" ("category");
create index "idx_incidents_keywords" on "incidents" using gin ("keywords");

alter table "incidents" disable row level security;
