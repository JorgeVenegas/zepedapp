create table "solutions" (
  "id" uuid primary key default gen_random_uuid(),
  "name" text not null,
  "description" text not null,
  "cost_min" integer not null check (cost_min >= 0),
  "cost_max" integer not null check (cost_max >= cost_min),
  "feasibility" integer not null check (feasibility >= 1 and feasibility <= 10),
  "implementation_start_date" timestamp with time zone not null,
  "implementation_end_date" timestamp with time zone not null check (implementation_end_date >= implementation_start_date),
  "created_at" timestamp with time zone default now(),
  "updated_at" timestamp with time zone default now()
);

create index "idx_solutions_name" on "solutions" ("name");
create index "idx_solutions_feasibility" on "solutions" ("feasibility" desc);
create index "idx_solutions_cost" on "solutions" ("cost_min", "cost_max");
create index "idx_solutions_implementation_dates" on "solutions" ("implementation_start_date", "implementation_end_date");

alter table "solutions" disable row level security;
