alter table "public"."incidents" drop constraint "incidents_priority_check";

alter table "public"."incidents" alter column "time" set data type timestamp with time zone using "time"::timestamp with time zone;

alter table "public"."incidents" add constraint "incidents_priority_check" CHECK (((priority >= 0) AND (priority <= 5))) not valid;

alter table "public"."incidents" validate constraint "incidents_priority_check";


