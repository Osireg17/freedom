revoke delete on table "auth"."audit_log_entries" from "postgres";

revoke insert on table "auth"."audit_log_entries" from "postgres";

revoke references on table "auth"."audit_log_entries" from "postgres";

revoke select on table "auth"."audit_log_entries" from "postgres";

revoke trigger on table "auth"."audit_log_entries" from "postgres";

revoke truncate on table "auth"."audit_log_entries" from "postgres";

revoke update on table "auth"."audit_log_entries" from "postgres";

revoke delete on table "auth"."flow_state" from "postgres";

revoke insert on table "auth"."flow_state" from "postgres";

revoke references on table "auth"."flow_state" from "postgres";

revoke select on table "auth"."flow_state" from "postgres";

revoke trigger on table "auth"."flow_state" from "postgres";

revoke truncate on table "auth"."flow_state" from "postgres";

revoke update on table "auth"."flow_state" from "postgres";

revoke delete on table "auth"."identities" from "postgres";

revoke insert on table "auth"."identities" from "postgres";

revoke references on table "auth"."identities" from "postgres";

revoke select on table "auth"."identities" from "postgres";

revoke trigger on table "auth"."identities" from "postgres";

revoke truncate on table "auth"."identities" from "postgres";

revoke update on table "auth"."identities" from "postgres";

revoke delete on table "auth"."instances" from "postgres";

revoke insert on table "auth"."instances" from "postgres";

revoke references on table "auth"."instances" from "postgres";

revoke select on table "auth"."instances" from "postgres";

revoke trigger on table "auth"."instances" from "postgres";

revoke truncate on table "auth"."instances" from "postgres";

revoke update on table "auth"."instances" from "postgres";

revoke delete on table "auth"."mfa_amr_claims" from "postgres";

revoke insert on table "auth"."mfa_amr_claims" from "postgres";

revoke references on table "auth"."mfa_amr_claims" from "postgres";

revoke select on table "auth"."mfa_amr_claims" from "postgres";

revoke trigger on table "auth"."mfa_amr_claims" from "postgres";

revoke truncate on table "auth"."mfa_amr_claims" from "postgres";

revoke update on table "auth"."mfa_amr_claims" from "postgres";

revoke delete on table "auth"."mfa_challenges" from "postgres";

revoke insert on table "auth"."mfa_challenges" from "postgres";

revoke references on table "auth"."mfa_challenges" from "postgres";

revoke select on table "auth"."mfa_challenges" from "postgres";

revoke trigger on table "auth"."mfa_challenges" from "postgres";

revoke truncate on table "auth"."mfa_challenges" from "postgres";

revoke update on table "auth"."mfa_challenges" from "postgres";

revoke delete on table "auth"."mfa_factors" from "postgres";

revoke insert on table "auth"."mfa_factors" from "postgres";

revoke references on table "auth"."mfa_factors" from "postgres";

revoke select on table "auth"."mfa_factors" from "postgres";

revoke trigger on table "auth"."mfa_factors" from "postgres";

revoke truncate on table "auth"."mfa_factors" from "postgres";

revoke update on table "auth"."mfa_factors" from "postgres";

revoke delete on table "auth"."one_time_tokens" from "postgres";

revoke insert on table "auth"."one_time_tokens" from "postgres";

revoke references on table "auth"."one_time_tokens" from "postgres";

revoke select on table "auth"."one_time_tokens" from "postgres";

revoke trigger on table "auth"."one_time_tokens" from "postgres";

revoke truncate on table "auth"."one_time_tokens" from "postgres";

revoke update on table "auth"."one_time_tokens" from "postgres";

revoke delete on table "auth"."refresh_tokens" from "postgres";

revoke insert on table "auth"."refresh_tokens" from "postgres";

revoke references on table "auth"."refresh_tokens" from "postgres";

revoke select on table "auth"."refresh_tokens" from "postgres";

revoke trigger on table "auth"."refresh_tokens" from "postgres";

revoke truncate on table "auth"."refresh_tokens" from "postgres";

revoke update on table "auth"."refresh_tokens" from "postgres";

revoke delete on table "auth"."saml_providers" from "postgres";

revoke insert on table "auth"."saml_providers" from "postgres";

revoke references on table "auth"."saml_providers" from "postgres";

revoke select on table "auth"."saml_providers" from "postgres";

revoke trigger on table "auth"."saml_providers" from "postgres";

revoke truncate on table "auth"."saml_providers" from "postgres";

revoke update on table "auth"."saml_providers" from "postgres";

revoke delete on table "auth"."saml_relay_states" from "postgres";

revoke insert on table "auth"."saml_relay_states" from "postgres";

revoke references on table "auth"."saml_relay_states" from "postgres";

revoke select on table "auth"."saml_relay_states" from "postgres";

revoke trigger on table "auth"."saml_relay_states" from "postgres";

revoke truncate on table "auth"."saml_relay_states" from "postgres";

revoke update on table "auth"."saml_relay_states" from "postgres";

revoke select on table "auth"."schema_migrations" from "postgres";

revoke delete on table "auth"."sessions" from "postgres";

revoke insert on table "auth"."sessions" from "postgres";

revoke references on table "auth"."sessions" from "postgres";

revoke select on table "auth"."sessions" from "postgres";

revoke trigger on table "auth"."sessions" from "postgres";

revoke truncate on table "auth"."sessions" from "postgres";

revoke update on table "auth"."sessions" from "postgres";

revoke delete on table "auth"."sso_domains" from "postgres";

revoke insert on table "auth"."sso_domains" from "postgres";

revoke references on table "auth"."sso_domains" from "postgres";

revoke select on table "auth"."sso_domains" from "postgres";

revoke trigger on table "auth"."sso_domains" from "postgres";

revoke truncate on table "auth"."sso_domains" from "postgres";

revoke update on table "auth"."sso_domains" from "postgres";

revoke delete on table "auth"."sso_providers" from "postgres";

revoke insert on table "auth"."sso_providers" from "postgres";

revoke references on table "auth"."sso_providers" from "postgres";

revoke select on table "auth"."sso_providers" from "postgres";

revoke trigger on table "auth"."sso_providers" from "postgres";

revoke truncate on table "auth"."sso_providers" from "postgres";

revoke update on table "auth"."sso_providers" from "postgres";

revoke delete on table "auth"."users" from "postgres";

revoke insert on table "auth"."users" from "postgres";

revoke references on table "auth"."users" from "postgres";

revoke select on table "auth"."users" from "postgres";

revoke trigger on table "auth"."users" from "postgres";

revoke truncate on table "auth"."users" from "postgres";

revoke update on table "auth"."users" from "postgres";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

drop trigger if exists "enforce_bucket_name_length_trigger" on "storage"."buckets";

drop trigger if exists "objects_delete_delete_prefix" on "storage"."objects";

drop trigger if exists "objects_insert_create_prefix" on "storage"."objects";

drop trigger if exists "objects_update_create_prefix" on "storage"."objects";

drop trigger if exists "prefixes_create_hierarchy" on "storage"."prefixes";

drop trigger if exists "prefixes_delete_hierarchy" on "storage"."prefixes";

revoke delete on table "storage"."buckets" from "anon";

revoke insert on table "storage"."buckets" from "anon";

revoke references on table "storage"."buckets" from "anon";

revoke select on table "storage"."buckets" from "anon";

revoke trigger on table "storage"."buckets" from "anon";

revoke truncate on table "storage"."buckets" from "anon";

revoke update on table "storage"."buckets" from "anon";

revoke delete on table "storage"."buckets" from "authenticated";

revoke insert on table "storage"."buckets" from "authenticated";

revoke references on table "storage"."buckets" from "authenticated";

revoke select on table "storage"."buckets" from "authenticated";

revoke trigger on table "storage"."buckets" from "authenticated";

revoke truncate on table "storage"."buckets" from "authenticated";

revoke update on table "storage"."buckets" from "authenticated";

revoke delete on table "storage"."buckets" from "postgres";

revoke insert on table "storage"."buckets" from "postgres";

revoke references on table "storage"."buckets" from "postgres";

revoke select on table "storage"."buckets" from "postgres";

revoke trigger on table "storage"."buckets" from "postgres";

revoke truncate on table "storage"."buckets" from "postgres";

revoke update on table "storage"."buckets" from "postgres";

revoke delete on table "storage"."buckets" from "service_role";

revoke insert on table "storage"."buckets" from "service_role";

revoke references on table "storage"."buckets" from "service_role";

revoke select on table "storage"."buckets" from "service_role";

revoke trigger on table "storage"."buckets" from "service_role";

revoke truncate on table "storage"."buckets" from "service_role";

revoke update on table "storage"."buckets" from "service_role";

revoke delete on table "storage"."buckets_analytics" from "anon";

revoke insert on table "storage"."buckets_analytics" from "anon";

revoke references on table "storage"."buckets_analytics" from "anon";

revoke select on table "storage"."buckets_analytics" from "anon";

revoke trigger on table "storage"."buckets_analytics" from "anon";

revoke truncate on table "storage"."buckets_analytics" from "anon";

revoke update on table "storage"."buckets_analytics" from "anon";

revoke delete on table "storage"."buckets_analytics" from "authenticated";

revoke insert on table "storage"."buckets_analytics" from "authenticated";

revoke references on table "storage"."buckets_analytics" from "authenticated";

revoke select on table "storage"."buckets_analytics" from "authenticated";

revoke trigger on table "storage"."buckets_analytics" from "authenticated";

revoke truncate on table "storage"."buckets_analytics" from "authenticated";

revoke update on table "storage"."buckets_analytics" from "authenticated";

revoke delete on table "storage"."buckets_analytics" from "service_role";

revoke insert on table "storage"."buckets_analytics" from "service_role";

revoke references on table "storage"."buckets_analytics" from "service_role";

revoke select on table "storage"."buckets_analytics" from "service_role";

revoke trigger on table "storage"."buckets_analytics" from "service_role";

revoke truncate on table "storage"."buckets_analytics" from "service_role";

revoke update on table "storage"."buckets_analytics" from "service_role";

revoke select on table "storage"."iceberg_namespaces" from "anon";

revoke select on table "storage"."iceberg_namespaces" from "authenticated";

revoke delete on table "storage"."iceberg_namespaces" from "service_role";

revoke insert on table "storage"."iceberg_namespaces" from "service_role";

revoke references on table "storage"."iceberg_namespaces" from "service_role";

revoke select on table "storage"."iceberg_namespaces" from "service_role";

revoke trigger on table "storage"."iceberg_namespaces" from "service_role";

revoke truncate on table "storage"."iceberg_namespaces" from "service_role";

revoke update on table "storage"."iceberg_namespaces" from "service_role";

revoke select on table "storage"."iceberg_tables" from "anon";

revoke select on table "storage"."iceberg_tables" from "authenticated";

revoke delete on table "storage"."iceberg_tables" from "service_role";

revoke insert on table "storage"."iceberg_tables" from "service_role";

revoke references on table "storage"."iceberg_tables" from "service_role";

revoke select on table "storage"."iceberg_tables" from "service_role";

revoke trigger on table "storage"."iceberg_tables" from "service_role";

revoke truncate on table "storage"."iceberg_tables" from "service_role";

revoke update on table "storage"."iceberg_tables" from "service_role";

revoke delete on table "storage"."objects" from "anon";

revoke insert on table "storage"."objects" from "anon";

revoke references on table "storage"."objects" from "anon";

revoke select on table "storage"."objects" from "anon";

revoke trigger on table "storage"."objects" from "anon";

revoke truncate on table "storage"."objects" from "anon";

revoke update on table "storage"."objects" from "anon";

revoke delete on table "storage"."objects" from "authenticated";

revoke insert on table "storage"."objects" from "authenticated";

revoke references on table "storage"."objects" from "authenticated";

revoke select on table "storage"."objects" from "authenticated";

revoke trigger on table "storage"."objects" from "authenticated";

revoke truncate on table "storage"."objects" from "authenticated";

revoke update on table "storage"."objects" from "authenticated";

revoke delete on table "storage"."objects" from "postgres";

revoke insert on table "storage"."objects" from "postgres";

revoke references on table "storage"."objects" from "postgres";

revoke select on table "storage"."objects" from "postgres";

revoke trigger on table "storage"."objects" from "postgres";

revoke truncate on table "storage"."objects" from "postgres";

revoke update on table "storage"."objects" from "postgres";

revoke delete on table "storage"."objects" from "service_role";

revoke insert on table "storage"."objects" from "service_role";

revoke references on table "storage"."objects" from "service_role";

revoke select on table "storage"."objects" from "service_role";

revoke trigger on table "storage"."objects" from "service_role";

revoke truncate on table "storage"."objects" from "service_role";

revoke update on table "storage"."objects" from "service_role";

revoke delete on table "storage"."prefixes" from "anon";

revoke insert on table "storage"."prefixes" from "anon";

revoke references on table "storage"."prefixes" from "anon";

revoke select on table "storage"."prefixes" from "anon";

revoke trigger on table "storage"."prefixes" from "anon";

revoke truncate on table "storage"."prefixes" from "anon";

revoke update on table "storage"."prefixes" from "anon";

revoke delete on table "storage"."prefixes" from "authenticated";

revoke insert on table "storage"."prefixes" from "authenticated";

revoke references on table "storage"."prefixes" from "authenticated";

revoke select on table "storage"."prefixes" from "authenticated";

revoke trigger on table "storage"."prefixes" from "authenticated";

revoke truncate on table "storage"."prefixes" from "authenticated";

revoke update on table "storage"."prefixes" from "authenticated";

revoke delete on table "storage"."prefixes" from "service_role";

revoke insert on table "storage"."prefixes" from "service_role";

revoke references on table "storage"."prefixes" from "service_role";

revoke select on table "storage"."prefixes" from "service_role";

revoke trigger on table "storage"."prefixes" from "service_role";

revoke truncate on table "storage"."prefixes" from "service_role";

revoke update on table "storage"."prefixes" from "service_role";

revoke select on table "storage"."s3_multipart_uploads" from "anon";

revoke select on table "storage"."s3_multipart_uploads" from "authenticated";

revoke delete on table "storage"."s3_multipart_uploads" from "service_role";

revoke insert on table "storage"."s3_multipart_uploads" from "service_role";

revoke references on table "storage"."s3_multipart_uploads" from "service_role";

revoke select on table "storage"."s3_multipart_uploads" from "service_role";

revoke trigger on table "storage"."s3_multipart_uploads" from "service_role";

revoke truncate on table "storage"."s3_multipart_uploads" from "service_role";

revoke update on table "storage"."s3_multipart_uploads" from "service_role";

revoke select on table "storage"."s3_multipart_uploads_parts" from "anon";

revoke select on table "storage"."s3_multipart_uploads_parts" from "authenticated";

revoke delete on table "storage"."s3_multipart_uploads_parts" from "service_role";

revoke insert on table "storage"."s3_multipart_uploads_parts" from "service_role";

revoke references on table "storage"."s3_multipart_uploads_parts" from "service_role";

revoke select on table "storage"."s3_multipart_uploads_parts" from "service_role";

revoke trigger on table "storage"."s3_multipart_uploads_parts" from "service_role";

revoke truncate on table "storage"."s3_multipart_uploads_parts" from "service_role";

revoke update on table "storage"."s3_multipart_uploads_parts" from "service_role";

alter table "storage"."iceberg_namespaces" drop constraint "iceberg_namespaces_bucket_id_fkey";

alter table "storage"."iceberg_tables" drop constraint "iceberg_tables_bucket_id_fkey";

alter table "storage"."iceberg_tables" drop constraint "iceberg_tables_namespace_id_fkey";

alter table "storage"."prefixes" drop constraint "prefixes_bucketId_fkey";

drop function if exists "storage"."add_prefixes"(_bucket_id text, _name text);

drop function if exists "storage"."delete_prefix"(_bucket_id text, _name text);

drop function if exists "storage"."delete_prefix_hierarchy_trigger"();

drop function if exists "storage"."enforce_bucket_name_length"();

drop function if exists "storage"."get_level"(name text);

drop function if exists "storage"."get_prefix"(name text);

drop function if exists "storage"."get_prefixes"(name text);

drop function if exists "storage"."objects_insert_prefix_trigger"();

drop function if exists "storage"."objects_update_prefix_trigger"();

drop function if exists "storage"."prefixes_insert_trigger"();

drop function if exists "storage"."search_legacy_v1"(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);

drop function if exists "storage"."search_v1_optimised"(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);

drop function if exists "storage"."search_v2"(prefix text, bucket_name text, limits integer, levels integer, start_after text);

alter table "storage"."buckets_analytics" drop constraint "buckets_analytics_pkey";

alter table "storage"."iceberg_namespaces" drop constraint "iceberg_namespaces_pkey";

alter table "storage"."iceberg_tables" drop constraint "iceberg_tables_pkey";

alter table "storage"."prefixes" drop constraint "prefixes_pkey";

drop index if exists "storage"."buckets_analytics_pkey";

drop index if exists "storage"."iceberg_namespaces_pkey";

drop index if exists "storage"."iceberg_tables_pkey";

drop index if exists "storage"."idx_iceberg_namespaces_bucket_id";

drop index if exists "storage"."idx_iceberg_tables_namespace_id";

drop index if exists "storage"."idx_name_bucket_level_unique";

drop index if exists "storage"."idx_objects_lower_name";

drop index if exists "storage"."idx_prefixes_lower_name";

drop index if exists "storage"."objects_bucket_id_level_idx";

drop index if exists "storage"."prefixes_pkey";

drop table "storage"."buckets_analytics";

drop table "storage"."iceberg_namespaces";

drop table "storage"."iceberg_tables";

drop table "storage"."prefixes";

alter table "storage"."buckets" drop column "type";

alter table "storage"."objects" drop column "level";

drop type "storage"."buckettype";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION storage.extension(name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$function$
;

CREATE OR REPLACE FUNCTION storage.foldername(name text)
 RETURNS text[]
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$function$
;

CREATE OR REPLACE FUNCTION storage.get_size_by_bucket()
 RETURNS TABLE(size bigint, bucket_id text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$function$
;

CREATE OR REPLACE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text)
 RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
 LANGUAGE plpgsql
 STABLE
AS $function$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$function$
;


  create policy "Users can read their own interview responses"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'interview-responses'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can upload their own interview responses"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'interview-responses'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



