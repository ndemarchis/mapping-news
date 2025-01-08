CREATE OR REPLACE FUNCTION get_sorted_location_article_relations(p_place_id text)
RETURNS TABLE(
    article_uuid text,
    location_name text,
    articles json
) AS $$
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
$$ LANGUAGE plpgsql;