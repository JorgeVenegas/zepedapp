alter table "public"."incidents" drop constraint "incidents_priority_check";

alter table "public"."incidents" add constraint "incidents_priority_check" CHECK (((priority >= 0) AND (priority <= 5))) not valid;

alter table "public"."incidents" validate constraint "incidents_priority_check";


