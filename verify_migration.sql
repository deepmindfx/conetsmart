-- Verification script to check if migration matches current AsukTech schema
-- Run this on the AsukTech project to verify everything matches

-- 1. Check table count
SELECT 
    'Tables count' as check_type,
    COUNT(*) as current_count,
    10 as expected_count,
    CASE WHEN COUNT(*) = 10 THEN '✓' ELSE '✗' END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';

-- 2. Check RLS policies count
SELECT 
    'RLS Policies count' as check_type,
    COUNT(*) as current_count,
    18 as expected_count,
    CASE WHEN COUNT(*) = 18 THEN '✓' ELSE '✗' END as status
FROM pg_policies
WHERE schemaname = 'public';

-- 3. Check functions count
SELECT 
    'Functions count' as check_type,
    COUNT(*) as current_count,
    15 as expected_count,
    CASE WHEN COUNT(*) = 15 THEN '✓' ELSE '✗' END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname NOT LIKE 'pg_%';

-- 4. Check triggers count (excluding system triggers)
SELECT 
    'Triggers count' as check_type,
    COUNT(*) as current_count,
    9 as expected_count,
    CASE WHEN COUNT(*) = 9 THEN '✓' ELSE '✗' END as status
FROM information_schema.triggers
WHERE trigger_schema IN ('public', 'auth')
AND trigger_name NOT LIKE 'pg_%';

-- 5. Check foreign keys count
SELECT 
    'Foreign Keys count' as check_type,
    COUNT(*) as current_count,
    17 as expected_count,
    CASE WHEN COUNT(*) = 17 THEN '✓' ELSE '✗' END as status
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
AND table_schema = 'public';

-- 6. List all tables
SELECT 
    'Table: ' || table_name as item
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 7. List all RLS policies
SELECT 
    'Policy: ' || tablename || '.' || policyname as item
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

