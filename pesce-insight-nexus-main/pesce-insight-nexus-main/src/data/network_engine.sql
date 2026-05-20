-- NEXUS NETWORK ECOSYSTEM ENGINE (RPC)
-- Logic: Euclidean distance between skill vectors + Categorical boosts
-- Output: Map of similar companies with a normalized percentage (0-100)

CREATE OR REPLACE FUNCTION match_similar_companies(target_id INT)
RETURNS TABLE (
    id INT,
    name TEXT,
    match_percentage INT
) AS $$
DECLARE
    target_nature TEXT;
BEGIN
    -- Fetch target company metadata for categorical boosting
    SELECT nature_of_company INTO target_nature 
    FROM companies 
    WHERE companies.company_id = target_id;

    RETURN QUERY
    WITH target_skills AS (
        SELECT skill_id, rating
        FROM company_skill_levels
        WHERE company_id = target_id
    ),
    skill_similarity AS (
        -- Calculate normalized similarity across the 12-axis skill matrix
        SELECT 
            csl.company_id,
            1.0 - (SUM(ABS(csl.rating - ts.rating))::FLOAT / (COUNT(*)::FLOAT * 10.0)) as raw_score
        FROM company_skill_levels csl
        JOIN target_skills ts ON csl.skill_id = ts.skill_id
        WHERE csl.company_id != target_id
        GROUP BY csl.company_id
    ),
    category_boosts AS (
        -- Apply boosts for shared nature or identified competitors
        SELECT 
            c.company_id,
            CASE WHEN c.nature_of_company = target_nature THEN 0.15 ELSE 0 END +
            CASE WHEN EXISTS (
                SELECT 1 FROM innovix_competitors ic 
                WHERE ic.company_id = target_id AND ic.name = c.name
            ) THEN 0.25 ELSE 0 END as boost_val
        FROM companies c
        WHERE c.company_id != target_id
    )
    SELECT 
        ss.company_id as id,
        c.name::TEXT,
        ROUND(LEAST(1.0, ss.raw_score + COALESCE(cb.boost_val, 0)) * 100)::INT as match_percentage
    FROM skill_similarity ss
    JOIN companies c ON ss.company_id = c.company_id
    LEFT JOIN category_boosts cb ON ss.company_id = cb.company_id
    ORDER BY match_percentage DESC
    LIMIT 10; -- Increased limit for ecosystem view
END;
$$ LANGUAGE plpgsql;
