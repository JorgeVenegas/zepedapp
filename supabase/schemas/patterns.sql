create table "patterns" (
  "id" uuid primary key default gen_random_uuid(),
  "title" text not null,
  "description" text not null,
  "filters" jsonb default '{}'::jsonb,
  "priority" integer not null check (priority >= 1 and priority <= 5),
  "frequency" integer default 0,
  "created_at" timestamp with time zone default now(),
  "updated_at" timestamp with time zone default now()
);

create index "idx_patterns_title" on "patterns" ("title");
create index "idx_patterns_priority" on "patterns" ("priority");
create index "idx_patterns_frequency" on "patterns" ("frequency" desc);
create index "idx_patterns_filters" on "patterns" using gin ("filters");

alter table "patterns" disable row level security;
