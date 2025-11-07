-- Add currency field to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';

-- Update existing jobs with realistic salaries and proper currencies based on location
-- North African countries
UPDATE jobs SET 
  currency = 'EGP',
  salary_min = CASE 
    WHEN salary_min IS NOT NULL THEN salary_min * 30
    ELSE NULL
  END,
  salary_max = CASE 
    WHEN salary_max IS NOT NULL THEN salary_max * 30
    ELSE NULL
  END
WHERE location LIKE '%Egypt%' OR location LIKE '%Cairo%';

UPDATE jobs SET 
  currency = 'MAD',
  salary_min = CASE 
    WHEN salary_min IS NOT NULL THEN salary_min * 10
    ELSE NULL
  END,
  salary_max = CASE 
    WHEN salary_max IS NOT NULL THEN salary_max * 10
    ELSE NULL
  END
WHERE location LIKE '%Morocco%' OR location LIKE '%Casablanca%';

UPDATE jobs SET 
  currency = 'TND',
  salary_min = CASE 
    WHEN salary_min IS NOT NULL THEN salary_min * 3
    ELSE NULL
  END,
  salary_max = CASE 
    WHEN salary_max IS NOT NULL THEN salary_max * 3
    ELSE NULL
  END
WHERE location LIKE '%Tunisia%' OR location LIKE '%Tunis%';

-- Middle Eastern countries
UPDATE jobs SET 
  currency = 'AED',
  salary_min = CASE 
    WHEN salary_min IS NOT NULL THEN salary_min * 3.67
    ELSE NULL
  END,
  salary_max = CASE 
    WHEN salary_max IS NOT NULL THEN salary_max * 3.67
    ELSE NULL
  END
WHERE location LIKE '%UAE%' OR location LIKE '%Dubai%' OR location LIKE '%Abu Dhabi%';

UPDATE jobs SET 
  currency = 'SAR',
  salary_min = CASE 
    WHEN salary_min IS NOT NULL THEN salary_min * 3.75
    ELSE NULL
  END,
  salary_max = CASE 
    WHEN salary_max IS NOT NULL THEN salary_max * 3.75
    ELSE NULL
  END
WHERE location LIKE '%Saudi Arabia%' OR location LIKE '%Riyadh%';

UPDATE jobs SET currency = 'QAR',
  salary_min = CASE 
    WHEN salary_min IS NOT NULL THEN salary_min * 3.64
    ELSE NULL
  END,
  salary_max = CASE 
    WHEN salary_max IS NOT NULL THEN salary_max * 3.64
    ELSE NULL
  END
WHERE location LIKE '%Qatar%' OR location LIKE '%Doha%';

-- Sub-Saharan African countries
UPDATE jobs SET 
  currency = 'ZAR',
  salary_min = CASE 
    WHEN salary_min IS NOT NULL THEN salary_min * 18
    ELSE NULL
  END,
  salary_max = CASE 
    WHEN salary_max IS NOT NULL THEN salary_max * 18
    ELSE NULL
  END
WHERE location LIKE '%South Africa%' OR location LIKE '%Cape Town%';

UPDATE jobs SET 
  currency = 'NGN',
  salary_min = CASE 
    WHEN salary_min IS NOT NULL THEN salary_min * 1500
    ELSE NULL
  END,
  salary_max = CASE 
    WHEN salary_max IS NOT NULL THEN salary_max * 1500
    ELSE NULL
  END
WHERE location LIKE '%Nigeria%' OR location LIKE '%Lagos%';

UPDATE jobs SET 
  currency = 'KES',
  salary_min = CASE 
    WHEN salary_min IS NOT NULL THEN salary_min * 130
    ELSE NULL
  END,
  salary_max = CASE 
    WHEN salary_max IS NOT NULL THEN salary_max * 130
    ELSE NULL
  END
WHERE location LIKE '%Kenya%' OR location LIKE '%Nairobi%';