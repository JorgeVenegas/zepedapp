
  create table "public"."incidents" (
    "id" uuid not null default gen_random_uuid(),
    "time" timestamp not null,
    "service" text not null,
    "source" text not null,
    "subservice" text not null,
    "priority" integer not null,
    "category" text not null,
    "sentiment_analysis" text,
    "summary" text not null,
    "original" text not null,
    "keywords" text[] default '{}'::text[],
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );



  create table "public"."patterns" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "description" text not null,
    "filters" jsonb default '{}'::jsonb,
    "priority" integer not null,
    "frequency" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );



  create table "public"."solutions" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text not null,
    "cost_min" integer not null,
    "cost_max" integer not null,
    "feasibility" integer not null,
    "implementation_start_date" timestamp with time zone not null,
    "implementation_end_date" timestamp with time zone not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


CREATE INDEX idx_incidents_category ON public.incidents USING btree (category);

CREATE INDEX idx_incidents_keywords ON public.incidents USING gin (keywords);

CREATE INDEX idx_incidents_priority ON public.incidents USING btree (priority);

CREATE INDEX idx_incidents_service ON public.incidents USING btree (service);

CREATE INDEX idx_incidents_time ON public.incidents USING btree ("time" DESC);

CREATE INDEX idx_patterns_filters ON public.patterns USING gin (filters);

CREATE INDEX idx_patterns_frequency ON public.patterns USING btree (frequency DESC);

CREATE INDEX idx_patterns_priority ON public.patterns USING btree (priority);

CREATE INDEX idx_patterns_title ON public.patterns USING btree (title);

CREATE INDEX idx_solutions_cost ON public.solutions USING btree (cost_min, cost_max);

CREATE INDEX idx_solutions_feasibility ON public.solutions USING btree (feasibility DESC);

CREATE INDEX idx_solutions_implementation_dates ON public.solutions USING btree (implementation_start_date, implementation_end_date);

CREATE INDEX idx_solutions_name ON public.solutions USING btree (name);

CREATE UNIQUE INDEX incidents_pkey ON public.incidents USING btree (id);

CREATE UNIQUE INDEX patterns_pkey ON public.patterns USING btree (id);

CREATE UNIQUE INDEX solutions_pkey ON public.solutions USING btree (id);

alter table "public"."incidents" add constraint "incidents_pkey" PRIMARY KEY using index "incidents_pkey";

alter table "public"."patterns" add constraint "patterns_pkey" PRIMARY KEY using index "patterns_pkey";

alter table "public"."solutions" add constraint "solutions_pkey" PRIMARY KEY using index "solutions_pkey";

alter table "public"."incidents" add constraint "incidents_priority_check" CHECK (((priority >= 0) AND (priority <= 5))) not valid;

alter table "public"."incidents" validate constraint "incidents_priority_check";

alter table "public"."patterns" add constraint "patterns_priority_check" CHECK (((priority >= 1) AND (priority <= 5))) not valid;

alter table "public"."patterns" validate constraint "patterns_priority_check";

alter table "public"."solutions" add constraint "solutions_check" CHECK ((cost_max >= cost_min)) not valid;

alter table "public"."solutions" validate constraint "solutions_check";

alter table "public"."solutions" add constraint "solutions_check1" CHECK ((implementation_end_date >= implementation_start_date)) not valid;

alter table "public"."solutions" validate constraint "solutions_check1";

alter table "public"."solutions" add constraint "solutions_cost_min_check" CHECK ((cost_min >= 0)) not valid;

alter table "public"."solutions" validate constraint "solutions_cost_min_check";

alter table "public"."solutions" add constraint "solutions_feasibility_check" CHECK (((feasibility >= 1) AND (feasibility <= 10))) not valid;

alter table "public"."solutions" validate constraint "solutions_feasibility_check";

grant delete on table "public"."incidents" to "anon";

grant insert on table "public"."incidents" to "anon";

grant references on table "public"."incidents" to "anon";

grant select on table "public"."incidents" to "anon";

grant trigger on table "public"."incidents" to "anon";

grant truncate on table "public"."incidents" to "anon";

grant update on table "public"."incidents" to "anon";

grant delete on table "public"."incidents" to "authenticated";

grant insert on table "public"."incidents" to "authenticated";

grant references on table "public"."incidents" to "authenticated";

grant select on table "public"."incidents" to "authenticated";

grant trigger on table "public"."incidents" to "authenticated";

grant truncate on table "public"."incidents" to "authenticated";

grant update on table "public"."incidents" to "authenticated";

grant delete on table "public"."incidents" to "service_role";

grant insert on table "public"."incidents" to "service_role";

grant references on table "public"."incidents" to "service_role";

grant select on table "public"."incidents" to "service_role";

grant trigger on table "public"."incidents" to "service_role";

grant truncate on table "public"."incidents" to "service_role";

grant update on table "public"."incidents" to "service_role";

grant delete on table "public"."patterns" to "anon";

grant insert on table "public"."patterns" to "anon";

grant references on table "public"."patterns" to "anon";

grant select on table "public"."patterns" to "anon";

grant trigger on table "public"."patterns" to "anon";

grant truncate on table "public"."patterns" to "anon";

grant update on table "public"."patterns" to "anon";

grant delete on table "public"."patterns" to "authenticated";

grant insert on table "public"."patterns" to "authenticated";

grant references on table "public"."patterns" to "authenticated";

grant select on table "public"."patterns" to "authenticated";

grant trigger on table "public"."patterns" to "authenticated";

grant truncate on table "public"."patterns" to "authenticated";

grant update on table "public"."patterns" to "authenticated";

grant delete on table "public"."patterns" to "service_role";

grant insert on table "public"."patterns" to "service_role";

grant references on table "public"."patterns" to "service_role";

grant select on table "public"."patterns" to "service_role";

grant trigger on table "public"."patterns" to "service_role";

grant truncate on table "public"."patterns" to "service_role";

grant update on table "public"."patterns" to "service_role";

grant delete on table "public"."solutions" to "anon";

grant insert on table "public"."solutions" to "anon";

grant references on table "public"."solutions" to "anon";

grant select on table "public"."solutions" to "anon";

grant trigger on table "public"."solutions" to "anon";

grant truncate on table "public"."solutions" to "anon";

grant update on table "public"."solutions" to "anon";

grant delete on table "public"."solutions" to "authenticated";

grant insert on table "public"."solutions" to "authenticated";

grant references on table "public"."solutions" to "authenticated";

grant select on table "public"."solutions" to "authenticated";

grant trigger on table "public"."solutions" to "authenticated";

grant truncate on table "public"."solutions" to "authenticated";

grant update on table "public"."solutions" to "authenticated";

grant delete on table "public"."solutions" to "service_role";

grant insert on table "public"."solutions" to "service_role";

grant references on table "public"."solutions" to "service_role";

grant select on table "public"."solutions" to "service_role";

grant trigger on table "public"."solutions" to "service_role";

grant truncate on table "public"."solutions" to "service_role";

grant update on table "public"."solutions" to "service_role";


