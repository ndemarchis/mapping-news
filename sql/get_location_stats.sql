create or replace function get_location_stats()
returns table (
    place_id text,
    lat numeric,
    lon numeric,
    formatted_address text,
    types _varchar,
    count numeric,
    raw_count bigint,
    pub_date timestamptz
) 
language plpgsql
security definer
set search_path = public
as $$
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
    GROUP BY 
        l.place_id,
        l.lat,
        l.lon,
        l.formatted_address,
        l.types;
end;
$$;

create or replace function calculate_time_decay(pub_date timestamptz)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
begin
    return CASE 
        WHEN pub_date IS NOT NULL THEN 
            exp(
                -0.0693 * EXTRACT(
                    EPOCH FROM (CURRENT_TIMESTAMP - pub_date)
                )::numeric / (24 * 60 * 60)  -- Convert to days
            )
        ELSE 0
    END;
    
end;
$$;