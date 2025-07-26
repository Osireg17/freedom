revoke delete on table "public"."behavioral_questions" from "anon";

revoke insert on table "public"."behavioral_questions" from "anon";

revoke references on table "public"."behavioral_questions" from "anon";

revoke select on table "public"."behavioral_questions" from "anon";

revoke trigger on table "public"."behavioral_questions" from "anon";

revoke truncate on table "public"."behavioral_questions" from "anon";

revoke update on table "public"."behavioral_questions" from "anon";

revoke delete on table "public"."behavioral_questions" from "authenticated";

revoke insert on table "public"."behavioral_questions" from "authenticated";

revoke references on table "public"."behavioral_questions" from "authenticated";

revoke select on table "public"."behavioral_questions" from "authenticated";

revoke trigger on table "public"."behavioral_questions" from "authenticated";

revoke truncate on table "public"."behavioral_questions" from "authenticated";

revoke update on table "public"."behavioral_questions" from "authenticated";

revoke delete on table "public"."behavioral_questions" from "service_role";

revoke insert on table "public"."behavioral_questions" from "service_role";

revoke references on table "public"."behavioral_questions" from "service_role";

revoke select on table "public"."behavioral_questions" from "service_role";

revoke trigger on table "public"."behavioral_questions" from "service_role";

revoke truncate on table "public"."behavioral_questions" from "service_role";

revoke update on table "public"."behavioral_questions" from "service_role";

revoke delete on table "public"."interview_answers" from "anon";

revoke insert on table "public"."interview_answers" from "anon";

revoke references on table "public"."interview_answers" from "anon";

revoke select on table "public"."interview_answers" from "anon";

revoke trigger on table "public"."interview_answers" from "anon";

revoke truncate on table "public"."interview_answers" from "anon";

revoke update on table "public"."interview_answers" from "anon";

revoke delete on table "public"."interview_answers" from "authenticated";

revoke insert on table "public"."interview_answers" from "authenticated";

revoke references on table "public"."interview_answers" from "authenticated";

revoke select on table "public"."interview_answers" from "authenticated";

revoke trigger on table "public"."interview_answers" from "authenticated";

revoke truncate on table "public"."interview_answers" from "authenticated";

revoke update on table "public"."interview_answers" from "authenticated";

revoke delete on table "public"."interview_answers" from "service_role";

revoke insert on table "public"."interview_answers" from "service_role";

revoke references on table "public"."interview_answers" from "service_role";

revoke select on table "public"."interview_answers" from "service_role";

revoke trigger on table "public"."interview_answers" from "service_role";

revoke truncate on table "public"."interview_answers" from "service_role";

revoke update on table "public"."interview_answers" from "service_role";

revoke delete on table "public"."interview_questions" from "anon";

revoke insert on table "public"."interview_questions" from "anon";

revoke references on table "public"."interview_questions" from "anon";

revoke select on table "public"."interview_questions" from "anon";

revoke trigger on table "public"."interview_questions" from "anon";

revoke truncate on table "public"."interview_questions" from "anon";

revoke update on table "public"."interview_questions" from "anon";

revoke delete on table "public"."interview_questions" from "authenticated";

revoke insert on table "public"."interview_questions" from "authenticated";

revoke references on table "public"."interview_questions" from "authenticated";

revoke select on table "public"."interview_questions" from "authenticated";

revoke trigger on table "public"."interview_questions" from "authenticated";

revoke truncate on table "public"."interview_questions" from "authenticated";

revoke update on table "public"."interview_questions" from "authenticated";

revoke delete on table "public"."interview_questions" from "service_role";

revoke insert on table "public"."interview_questions" from "service_role";

revoke references on table "public"."interview_questions" from "service_role";

revoke select on table "public"."interview_questions" from "service_role";

revoke trigger on table "public"."interview_questions" from "service_role";

revoke truncate on table "public"."interview_questions" from "service_role";

revoke update on table "public"."interview_questions" from "service_role";

revoke delete on table "public"."interviews" from "anon";

revoke insert on table "public"."interviews" from "anon";

revoke references on table "public"."interviews" from "anon";

revoke select on table "public"."interviews" from "anon";

revoke trigger on table "public"."interviews" from "anon";

revoke truncate on table "public"."interviews" from "anon";

revoke update on table "public"."interviews" from "anon";

revoke delete on table "public"."interviews" from "authenticated";

revoke insert on table "public"."interviews" from "authenticated";

revoke references on table "public"."interviews" from "authenticated";

revoke select on table "public"."interviews" from "authenticated";

revoke trigger on table "public"."interviews" from "authenticated";

revoke truncate on table "public"."interviews" from "authenticated";

revoke update on table "public"."interviews" from "authenticated";

revoke delete on table "public"."interviews" from "service_role";

revoke insert on table "public"."interviews" from "service_role";

revoke references on table "public"."interviews" from "service_role";

revoke select on table "public"."interviews" from "service_role";

revoke trigger on table "public"."interviews" from "service_role";

revoke truncate on table "public"."interviews" from "service_role";

revoke update on table "public"."interviews" from "service_role";

revoke delete on table "public"."users" from "anon";

revoke insert on table "public"."users" from "anon";

revoke references on table "public"."users" from "anon";

revoke select on table "public"."users" from "anon";

revoke trigger on table "public"."users" from "anon";

revoke truncate on table "public"."users" from "anon";

revoke update on table "public"."users" from "anon";

revoke delete on table "public"."users" from "authenticated";

revoke insert on table "public"."users" from "authenticated";

revoke references on table "public"."users" from "authenticated";

revoke select on table "public"."users" from "authenticated";

revoke trigger on table "public"."users" from "authenticated";

revoke truncate on table "public"."users" from "authenticated";

revoke update on table "public"."users" from "authenticated";

revoke delete on table "public"."users" from "service_role";

revoke insert on table "public"."users" from "service_role";

revoke references on table "public"."users" from "service_role";

revoke select on table "public"."users" from "service_role";

revoke trigger on table "public"."users" from "service_role";

revoke truncate on table "public"."users" from "service_role";

revoke update on table "public"."users" from "service_role";

alter table "public"."interview_answers" drop constraint "interview_answers_interview_id_interviews_id_fk";

alter table "public"."interview_answers" drop constraint "interview_answers_interview_question_id_interview_questions_id_";

alter table "public"."interview_questions" drop constraint "interview_questions_interview_id_interviews_id_fk";

alter table "public"."interviews" drop constraint "interviews_user_id_users_id_fk";

alter table "public"."users" drop constraint "users_clerk_id_unique";

alter table "public"."users" drop constraint "users_username_unique";

alter table "public"."behavioral_questions" drop constraint "behavioral_questions_pkey";

alter table "public"."interview_answers" drop constraint "interview_answers_pkey";

alter table "public"."interview_questions" drop constraint "interview_questions_pkey";

alter table "public"."interviews" drop constraint "interviews_pkey";

alter table "public"."users" drop constraint "users_pkey";

drop index if exists "public"."behavioral_questions_pkey";

drop index if exists "public"."interview_answers_pkey";

drop index if exists "public"."interview_questions_pkey";

drop index if exists "public"."interviews_pkey";

drop index if exists "public"."users_clerk_id_unique";

drop index if exists "public"."users_pkey";

drop index if exists "public"."users_username_unique";

drop table "public"."behavioral_questions";

drop table "public"."interview_answers";

drop table "public"."interview_questions";

drop table "public"."interviews";

drop table "public"."users";


