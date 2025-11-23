# AsukTech Schema Clone Migration

This document describes the complete migration file that clones the entire AsukTech Supabase project schema to a new Supabase project.

## Migration File

**Location:** `supabase/migrations/20250122000000_clone_asuktech_complete_schema.sql`

## What's Included

This migration includes everything needed to recreate the AsukTech database schema:

### 1. Custom Types/Enums
- `app_role` - Enum for user roles ('admin', 'user')

### 2. Tables (10 tables)
- `profiles` - User profiles with wallet, referral codes, virtual accounts
- `plans` - Data plans with pricing and duration
- `locations` - WiFi locations
- `credential_pools` - Pool of credentials for plans
- `transactions` - All financial transactions
- `referral_earnings` - Referral commission tracking
- `referral_payouts` - Referral payout requests
- `admin_settings` - Application settings
- `admin_notifications` - Admin notifications system
- `user_notification_views` - User notification view tracking

### 3. Constraints
- **Primary Keys:** All tables have primary keys
- **Unique Constraints:** 
  - `admin_settings.key`
  - `credential_pools(location_id, plan_id, username)`
  - `profiles.referral_code`
- **Foreign Keys:** All relationships between tables
- **Check Constraints:** Data validation for enums and ranges

### 4. Indexes (10 indexes)
- Indexes on frequently queried columns for performance
- GIN index on `transactions.details` for JSONB queries

### 5. Functions (15 functions)
- `check_referral_code_exists` - Validate referral codes
- `count_all_records` - Count records in key tables
- `get_duration_display` - Format duration display
- `get_transfer_settings` - Get transfer configuration
- `get_user_role` - Get user role helper
- `handle_new_user` - Auto-create profile on user signup
- `is_admin` - Check if current user is admin
- `make_user_admin` - Promote user to admin
- `purchase_plan_transaction` - Handle plan purchases
- `set_updated_at` - Update timestamp trigger
- `transfer_funds` - Handle wallet transfers
- `uid` - Get current user ID helper
- `update_updated_at_column` - Update timestamp trigger
- `validate_plan_duration` - Validate plan duration
- `validate_referral_code` - Validate and get referrer ID

### 6. Triggers (9 triggers)
- `on_auth_user_created` - Auto-create profile on user signup
- Update timestamp triggers for multiple tables
- Plan duration validation trigger

### 7. Row Level Security (RLS)
- RLS enabled on all tables
- **Policies:**
  - Most tables have `allow_all` policy (open access)
  - Referral tables have admin/self-select policies
  - Admin settings have admin-only and public read policies
  - User notification views have admin and self policies

## How to Use

### Option 1: Apply via Supabase Dashboard
1. Go to your new Supabase project
2. Navigate to **SQL Editor**
3. Copy the contents of `20250122000000_clone_asuktech_complete_schema.sql`
4. Paste and run the SQL

### Option 2: Apply via Supabase CLI
```bash
# Link your new project
supabase link --project-ref your-project-ref

# Apply the migration
supabase db push
```

### Option 3: Apply via MCP (Model Context Protocol)
If you have MCP access, you can use:
```sql
-- Read the migration file and apply it
```

## Important Notes

1. **Auth Users:** The migration includes a trigger that automatically creates a profile when a new user signs up via Supabase Auth.

2. **Foreign Key to auth.users:** The `profiles.id` references `auth.users(id)`, so make sure Supabase Auth is enabled in your project.

3. **No Data Migration:** This migration only creates the schema structure. It does NOT migrate data. If you need to migrate data, you'll need to export/import separately.

4. **Test First:** Always test this migration on a development/staging project before applying to production.

5. **Backup:** Make sure to backup your target database before applying this migration.

## Verification

After applying the migration, verify:

1. All tables are created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

2. All RLS policies are in place:
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

3. All functions are created:
```sql
SELECT proname 
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace 
ORDER BY proname;
```

4. RLS is enabled on all tables:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public';
```

## Tables Summary

| Table | Rows (Source) | RLS Enabled | Description |
|-------|--------------|-------------|-------------|
| profiles | 1 | Yes | User profiles and wallets |
| plans | 0 | Yes | Data plans |
| locations | 0 | Yes | WiFi locations |
| credential_pools | 0 | Yes | Credential pool |
| transactions | 4 | Yes | Financial transactions |
| referral_earnings | 0 | Yes | Referral earnings |
| referral_payouts | 0 | Yes | Referral payouts |
| admin_settings | 4 | Yes | Admin settings |
| admin_notifications | 0 | Yes | Admin notifications |
| user_notification_views | 0 | Yes | Notification views |

## Support

If you encounter any issues:
1. Check the Supabase logs for errors
2. Verify all dependencies are met (auth.users table exists)
3. Ensure you have proper permissions to create tables, functions, and triggers

