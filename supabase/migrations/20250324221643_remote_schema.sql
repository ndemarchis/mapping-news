

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."Article Status" AS ENUM (
    'ARCHIVED',
    'UNDEFINED'
);


ALTER TYPE "public"."Article Status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_time_decay"("pub_date" timestamp with time zone) RETURNS numeric
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
    return CASE 
        WHEN pub_date IS NOT NULL THEN 
            exp(
                -0.5 * EXTRACT(
                    EPOCH FROM (CURRENT_TIMESTAMP - pub_date)
                )::numeric / (24 * 60 * 60)  -- Convert to days
            )
        ELSE 0
    END;
    
end;
$$;


ALTER FUNCTION "public"."calculate_time_decay"("pub_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_location_stats"() RETURNS TABLE("place_id" "text", "lat" numeric, "lon" numeric, "formatted_address" "text", "types" character varying[], "count" numeric, "raw_count" bigint, "pub_date" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
    return query
    SELECT 
        l.place_id,
        l.lat,
        l.lon,
        l.formatted_address,
        l.types,
        SUM(calculate_time_decay(a.pub_date))::numeric as count,
        COUNT(lar.article_uuid)::bigint as raw_count,
        MAX(a.pub_date) as pub_date
    FROM 
        locations l
        LEFT JOIN location_article_relations lar ON l.place_id = lar.place_id
        LEFT JOIN articles a ON lar.article_uuid = a.uuid3
    WHERE 
        a.pub_date >= NOW() - INTERVAL '1 month'
    GROUP BY 
        l.place_id,
        l.lat,
        l.lon,
        l.formatted_address,
        l.types
    ORDER BY 
        pub_date ASC;        
end;
$$;


ALTER FUNCTION "public"."get_location_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_location_stats_recent"() RETURNS TABLE("place_id" "text", "lat" numeric, "lon" numeric, "formatted_address" "text", "types" character varying[], "count" numeric, "raw_count" bigint, "pub_date" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
    return query
    SELECT 
        l.place_id,
        l.lat,
        l.lon,
        l.formatted_address,
        l.types,
        SUM(calculate_time_decay(a.pub_date))::numeric as count,
        COUNT(lar.article_uuid)::bigint as raw_count,
        MAX(a.pub_date) as pub_date
    FROM 
        locations l
        LEFT JOIN location_article_relations lar ON l.place_id = lar.place_id
        LEFT JOIN articles a ON lar.article_uuid = a.uuid3
    WHERE 
        a.pub_date >= NOW() - INTERVAL '1 month'
    GROUP BY 
        l.place_id,
        l.lat,
        l.lon,
        l.formatted_address,
        l.types
    ORDER BY 
        count DESC;        
end;
$$;


ALTER FUNCTION "public"."get_location_stats_recent"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_sorted_location_article_relations"("p_place_id" "text") RETURNS TABLE("article_uuid" "text", "location_name" "text", "articles" "json")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        lar.article_uuid,
        lar.location_name,
        row_to_json(a) AS articles
    FROM
        location_article_relations lar
    JOIN
        articles a ON lar.article_uuid = a.uuid3
    WHERE
        lar.place_id = p_place_id
    ORDER BY
        a.pub_date DESC NULLS LAST;
END;
$$;


ALTER FUNCTION "public"."get_sorted_location_article_relations"("p_place_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_sorted_location_article_relations"("p_place_id" "text", "p_limit" integer, "p_offset" integer) RETURNS TABLE("article_uuid" "text", "location_name" "text", "articles" "json")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        lar.article_uuid,
        lar.location_name,
        row_to_json(a) AS articles
    FROM
        location_article_relations lar
    JOIN
        articles a ON lar.article_uuid = a.uuid3
    WHERE
        lar.place_id = p_place_id
    ORDER BY
        a.pub_date DESC NULLS LAST
    LIMIT p_limit OFFSET p_offset;
END;
$$;


ALTER FUNCTION "public"."get_sorted_location_article_relations"("p_place_id" "text", "p_limit" integer, "p_offset" integer) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."articles" (
    "uuid3" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "headline" "text",
    "link" "text",
    "author" "text",
    "feed_name" "text",
    "pub_date" timestamp with time zone,
    "archived" boolean
);


ALTER TABLE "public"."articles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."articles_and_data" (
    "title" "text",
    "link" "text",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pub_date" timestamp with time zone,
    "author" "text",
    "feed_name" "text",
    "locations" "json"
);


ALTER TABLE "public"."articles_and_data" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."location_article_relations" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "place_id" "text",
    "article_uuid" "text",
    "location_name" "text",
    "id" "text" NOT NULL
);


ALTER TABLE "public"."location_article_relations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."locations" (
    "place_id" "text" NOT NULL,
    "lat" numeric,
    "lon" numeric,
    "formatted_address" "text",
    "types" character varying[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "manual_name" "text"
);


ALTER TABLE "public"."locations" OWNER TO "postgres";


ALTER TABLE ONLY "public"."articles_and_data"
    ADD CONSTRAINT "articles_and_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_pkey" PRIMARY KEY ("uuid3");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("place_id");



ALTER TABLE ONLY "public"."location_article_relations"
    ADD CONSTRAINT "location_article_relations_article_uuid_fkey" FOREIGN KEY ("article_uuid") REFERENCES "public"."articles"("uuid3") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."location_article_relations"
    ADD CONSTRAINT "location_article_relations_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "public"."locations"("place_id") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "Enable read access for all users" ON "public"."articles" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."location_article_relations" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."locations" FOR SELECT USING (true);



ALTER TABLE "public"."articles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."location_article_relations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."locations" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."calculate_time_decay"("pub_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_time_decay"("pub_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_time_decay"("pub_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_location_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_location_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_location_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_location_stats_recent"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_location_stats_recent"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_location_stats_recent"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_sorted_location_article_relations"("p_place_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_sorted_location_article_relations"("p_place_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_sorted_location_article_relations"("p_place_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_sorted_location_article_relations"("p_place_id" "text", "p_limit" integer, "p_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_sorted_location_article_relations"("p_place_id" "text", "p_limit" integer, "p_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_sorted_location_article_relations"("p_place_id" "text", "p_limit" integer, "p_offset" integer) TO "service_role";


















GRANT ALL ON TABLE "public"."articles" TO "anon";
GRANT ALL ON TABLE "public"."articles" TO "authenticated";
GRANT ALL ON TABLE "public"."articles" TO "service_role";



GRANT ALL ON TABLE "public"."articles_and_data" TO "anon";
GRANT ALL ON TABLE "public"."articles_and_data" TO "authenticated";
GRANT ALL ON TABLE "public"."articles_and_data" TO "service_role";



GRANT ALL ON TABLE "public"."location_article_relations" TO "anon";
GRANT ALL ON TABLE "public"."location_article_relations" TO "authenticated";
GRANT ALL ON TABLE "public"."location_article_relations" TO "service_role";



GRANT ALL ON TABLE "public"."locations" TO "anon";
GRANT ALL ON TABLE "public"."locations" TO "authenticated";
GRANT ALL ON TABLE "public"."locations" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
