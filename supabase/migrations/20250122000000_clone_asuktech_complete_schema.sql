/*
  # Complete AsukTech Schema Migration
  
  This migration contains the complete schema from the AsukTech project including:
  - Custom types/enums
  - All tables with columns
  - Primary keys, unique constraints, foreign keys, check constraints
  - Indexes
  - Functions
  - Triggers
  - Row Level Security (RLS) policies
  
  Use this migration to clone the AsukTech project to a new Supabase project.
*/

-- ============================================================================
-- 1. CUSTOM TYPES / ENUMS
-- ============================================================================

-- Create app_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE app_role AS ENUM ('admin', 'user');
    END IF;
END $$;

-- ============================================================================
-- 2. TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  phone text,
  wallet_balance numeric(10,2) DEFAULT 0,
  referral_code text,
  referred_by uuid,
  role app_role DEFAULT 'user'::app_role,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  virtual_account_bank_name text,
  virtual_account_number text,
  virtual_account_reference text,
  bvn text,
  first_name text,
  last_name text
);

CREATE TABLE IF NOT EXISTS public.plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  duration_hours integer NOT NULL,
  price numeric(10,2) NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  duration text,
  data_amount text,
  type text DEFAULT '3-hour'::text,
  popular boolean DEFAULT false,
  is_unlimited boolean DEFAULT false,
  "order" integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  wifi_name text NOT NULL,
  is_active boolean DEFAULT true,
  username text,
  password text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.credential_pools (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  username text NOT NULL,
  password text NOT NULL,
  status text DEFAULT 'available'::text,
  assigned_to uuid,
  assigned_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid,
  location_id uuid,
  credential_id uuid,
  amount numeric(10,2) NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'completed'::text,
  mikrotik_username text,
  mikrotik_password text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  purchase_date timestamp with time zone DEFAULT now(),
  activation_date timestamp with time zone,
  flutterwave_reference text,
  flutterwave_tx_ref text,
  payment_method text,
  metadata jsonb,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  reference text,
  transfer_to_user_id uuid,
  transfer_from_user_id uuid,
  transfer_charge numeric(10,2) DEFAULT 0,
  transfer_reference text
);

CREATE TABLE IF NOT EXISTS public.referral_earnings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_user_id uuid NOT NULL,
  transaction_id uuid NOT NULL,
  amount numeric(10,2) NOT NULL,
  rate numeric(10,2) DEFAULT 10.00,
  status text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.referral_payouts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric(10,2) NOT NULL,
  status text NOT NULL,
  details jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL,
  value text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  description text,
  video_url text,
  youtube_url text,
  target_audience text DEFAULT 'all'::text,
  is_active boolean DEFAULT true,
  show_as_popup boolean DEFAULT false,
  priority text DEFAULT 'normal'::text,
  expires_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_notification_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  notification_id uuid NOT NULL,
  viewed_at timestamp with time zone DEFAULT now(),
  dismissed_at timestamp with time zone
);

-- ============================================================================
-- 3. PRIMARY KEYS
-- ============================================================================

ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
ALTER TABLE public.plans ADD CONSTRAINT plans_pkey PRIMARY KEY (id);
ALTER TABLE public.locations ADD CONSTRAINT locations_pkey PRIMARY KEY (id);
ALTER TABLE public.credential_pools ADD CONSTRAINT credential_pools_pkey PRIMARY KEY (id);
ALTER TABLE public.transactions ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);
ALTER TABLE public.referral_earnings ADD CONSTRAINT referral_earnings_pkey PRIMARY KEY (id);
ALTER TABLE public.referral_payouts ADD CONSTRAINT referral_payouts_pkey PRIMARY KEY (id);
ALTER TABLE public.admin_settings ADD CONSTRAINT admin_settings_pkey PRIMARY KEY (id);
ALTER TABLE public.admin_notifications ADD CONSTRAINT admin_notifications_pkey PRIMARY KEY (id);
ALTER TABLE public.user_notification_views ADD CONSTRAINT user_notification_views_pkey PRIMARY KEY (id);

-- ============================================================================
-- 4. UNIQUE CONSTRAINTS
-- ============================================================================

ALTER TABLE public.admin_settings ADD CONSTRAINT admin_settings_key_key UNIQUE (key);
ALTER TABLE public.credential_pools ADD CONSTRAINT credential_pools_location_id_plan_id_username_key UNIQUE (location_id, plan_id, username);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_referral_code_key UNIQUE (referral_code);

-- ============================================================================
-- 5. FOREIGN KEYS
-- ============================================================================

-- Profiles references auth.users
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Self-referencing foreign keys
ALTER TABLE public.profiles ADD CONSTRAINT profiles_referred_by_fkey FOREIGN KEY (referred_by) REFERENCES public.profiles (id);

-- Credential pools foreign keys
ALTER TABLE public.credential_pools ADD CONSTRAINT credential_pools_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations (id) ON DELETE CASCADE;
ALTER TABLE public.credential_pools ADD CONSTRAINT credential_pools_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans (id) ON DELETE CASCADE;
ALTER TABLE public.credential_pools ADD CONSTRAINT credential_pools_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.profiles (id);

-- Transactions foreign keys
ALTER TABLE public.transactions ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles (id) ON DELETE CASCADE;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans (id);
ALTER TABLE public.transactions ADD CONSTRAINT transactions_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations (id);
ALTER TABLE public.transactions ADD CONSTRAINT transactions_credential_id_fkey FOREIGN KEY (credential_id) REFERENCES public.credential_pools (id);
ALTER TABLE public.transactions ADD CONSTRAINT transactions_transfer_to_user_id_fkey FOREIGN KEY (transfer_to_user_id) REFERENCES public.profiles (id);
ALTER TABLE public.transactions ADD CONSTRAINT transactions_transfer_from_user_id_fkey FOREIGN KEY (transfer_from_user_id) REFERENCES public.profiles (id);

-- Referral earnings foreign keys
ALTER TABLE public.referral_earnings ADD CONSTRAINT referral_earnings_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.profiles (id);
ALTER TABLE public.referral_earnings ADD CONSTRAINT referral_earnings_referred_user_id_fkey FOREIGN KEY (referred_user_id) REFERENCES public.profiles (id);
ALTER TABLE public.referral_earnings ADD CONSTRAINT referral_earnings_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions (id);

-- Referral payouts foreign keys
ALTER TABLE public.referral_payouts ADD CONSTRAINT referral_payouts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles (id);

-- Admin notifications foreign keys
ALTER TABLE public.admin_notifications ADD CONSTRAINT admin_notifications_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles (id);

-- User notification views foreign keys
ALTER TABLE public.user_notification_views ADD CONSTRAINT user_notification_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles (id);
ALTER TABLE public.user_notification_views ADD CONSTRAINT user_notification_views_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.admin_notifications (id);

-- ============================================================================
-- 6. CHECK CONSTRAINTS
-- ============================================================================

-- Plans constraints
ALTER TABLE public.plans ADD CONSTRAINT plans_type_check CHECK ((type = ANY (ARRAY['1-hour'::text, '2-hour'::text, '3-hour'::text, 'daily'::text, 'weekly'::text, 'monthly'::text])));

-- Credential pools constraints
ALTER TABLE public.credential_pools ADD CONSTRAINT credential_pools_status_check CHECK ((status = ANY (ARRAY['available'::text, 'used'::text, 'disabled'::text])));

-- Transactions constraints
ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check CHECK ((type = ANY (ARRAY['wallet_topup'::text, 'plan_purchase'::text, 'wallet_funding'::text, 'transfer_sent'::text, 'transfer_received'::text])));
ALTER TABLE public.transactions ADD CONSTRAINT transactions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'success'::text])));

-- Referral earnings constraints
ALTER TABLE public.referral_earnings ADD CONSTRAINT referral_earnings_amount_check CHECK ((amount >= (0)::numeric));
ALTER TABLE public.referral_earnings ADD CONSTRAINT referral_earnings_status_check CHECK ((status = ANY (ARRAY['earned'::text, 'reversed'::text])));

-- Referral payouts constraints
ALTER TABLE public.referral_payouts ADD CONSTRAINT referral_payouts_amount_check CHECK ((amount >= (0)::numeric));
ALTER TABLE public.referral_payouts ADD CONSTRAINT referral_payouts_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])));

-- Admin notifications constraints
ALTER TABLE public.admin_notifications ADD CONSTRAINT admin_notifications_target_audience_check CHECK ((target_audience = ANY (ARRAY['all'::text, 'new_users'::text, 'specific_users'::text])));
ALTER TABLE public.admin_notifications ADD CONSTRAINT admin_notifications_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text])));

-- ============================================================================
-- 7. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_credential_pools_location_plan ON public.credential_pools USING btree (location_id, plan_id);
CREATE INDEX IF NOT EXISTS idx_credential_pools_status ON public.credential_pools USING btree (status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_details ON public.transactions USING gin (details);
CREATE INDEX IF NOT EXISTS idx_transactions_flw_tx_ref ON public.transactions USING btree (flutterwave_tx_ref);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON public.transactions USING btree (reference);
CREATE INDEX IF NOT EXISTS idx_transactions_transfer_from_user ON public.transactions USING btree (transfer_from_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transfer_reference ON public.transactions USING btree (transfer_reference);
CREATE INDEX IF NOT EXISTS idx_transactions_transfer_to_user ON public.transactions USING btree (transfer_to_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions USING btree (user_id);

-- ============================================================================
-- 7.5. VIEWS
-- ============================================================================

-- Plan usage statistics view
CREATE OR REPLACE VIEW public.plan_usage_stats AS
SELECT 
    p.id AS plan_id,
    p.name AS plan_name,
    p.type AS plan_type,
    p.duration_hours,
    p.price,
    count(DISTINCT t.id) AS total_purchases,
    count(DISTINCT t.user_id) AS unique_users,
    count(
        CASE
            WHEN (t.status = 'active'::text) THEN 1
            ELSE NULL::integer
        END) AS active_purchases,
    count(
        CASE
            WHEN (t.status = 'expired'::text) THEN 1
            ELSE NULL::integer
        END) AS expired_purchases,
    sum(t.amount) AS total_revenue,
    max(t.purchase_date) AS last_purchase_date
FROM (plans p
    LEFT JOIN transactions t ON (((p.id = t.plan_id) AND (t.type = 'plan_purchase'::text))))
GROUP BY p.id, p.name, p.type, p.duration_hours, p.price;

-- ============================================================================
-- 8. FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_referral_code_exists(code text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE referral_code = UPPER(code)
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.count_all_records()
 RETURNS TABLE(table_name text, total_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 'credential_pools'::text, COUNT(*) FROM credential_pools
    UNION ALL
    SELECT 'transactions'::text, COUNT(*) FROM transactions
    UNION ALL
    SELECT 'admin_notifications'::text, COUNT(*) FROM admin_notifications;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_duration_display(hours integer)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    RETURN CASE
        WHEN hours = 2 THEN '2 Hours'
        WHEN hours = 3 THEN '3 Hours'
        WHEN hours = 24 THEN '1 Day'
        WHEN hours = 48 THEN '2 Days'
        WHEN hours = 72 THEN '3 Days'
        WHEN hours = 168 THEN '1 Week'
        WHEN hours = 336 THEN '2 Weeks'
        WHEN hours = 720 THEN '1 Month'
        WHEN hours < 24 THEN hours || ' ' || CASE WHEN hours = 1 THEN 'Hour' ELSE 'Hours' END
        WHEN hours % 168 = 0 THEN (hours / 168) || ' ' || CASE WHEN hours / 168 = 1 THEN 'Week' ELSE 'Weeks' END
        WHEN hours % 24 = 0 THEN (hours / 24) || ' ' || CASE WHEN hours / 24 = 1 THEN 'Day' ELSE 'Days' END
        ELSE hours || ' Hours'
    END;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_transfer_settings()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_settings JSONB;
BEGIN
  SELECT jsonb_object_agg(key, value) INTO v_settings
  FROM admin_settings
  WHERE key IN (
    'transfer_enabled',
    'transfer_min_amount',
    'transfer_max_amount',
    'transfer_charge_enabled',
    'transfer_charge_type',
    'transfer_charge_value'
  );
  
  RETURN COALESCE(v_settings, '{}'::jsonb);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT role FROM public.profiles WHERE id = user_id;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    phone,
    wallet_balance,
    referral_code,
    referred_by,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    0,
    COALESCE(NEW.raw_user_meta_data->>'referral_code', UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6))),
    COALESCE((NEW.raw_user_meta_data->>'referred_by')::UUID, NULL),
    'user'
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.profiles 
  SET role = 'admin'
  WHERE email = user_email;
  
  IF FOUND THEN
    RETURN 'User ' || user_email || ' is now an admin';
  ELSE
    RETURN 'User ' || user_email || ' not found';
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.purchase_plan_transaction(p_user_id uuid, p_plan_id uuid, p_location_id uuid, p_credential_id uuid, p_amount numeric, p_duration_hours integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_user_balance DECIMAL(10,2);
  v_credential_status TEXT;
  v_transaction_id UUID;
  v_result JSONB;
BEGIN
  -- Start transaction
  BEGIN
    -- Lock the user profile row to prevent concurrent balance updates
    SELECT wallet_balance INTO v_user_balance
    FROM profiles
    WHERE id = p_user_id
    FOR UPDATE;
    
    -- Check if user exists and has sufficient balance
    IF v_user_balance IS NULL THEN
      RAISE EXCEPTION 'User not found';
    END IF;
    
    IF v_user_balance < p_amount THEN
      RAISE EXCEPTION 'Insufficient balance. Required: %, Available: %', p_amount, v_user_balance;
    END IF;
    
    -- Lock the credential row to prevent concurrent assignment
    SELECT status INTO v_credential_status
    FROM credential_pools
    WHERE id = p_credential_id
    FOR UPDATE;
    
    -- Check if credential is available
    IF v_credential_status != 'available' THEN
      RAISE EXCEPTION 'Credential not available. Status: %', v_credential_status;
    END IF;
    
    -- Deduct amount from user wallet
    UPDATE profiles
    SET wallet_balance = wallet_balance - p_amount
    WHERE id = p_user_id;
    
    -- Mark credential as used
    UPDATE credential_pools
    SET 
      status = 'used',
      assigned_to = p_user_id,
      assigned_at = NOW(),
      updated_at = NOW()
    WHERE id = p_credential_id;
    
    -- Create transaction record
    INSERT INTO transactions (
      user_id,
      plan_id,
      location_id,
      credential_id,
      amount,
      type,
      status,
      mikrotik_username,
      mikrotik_password,
      purchase_date,
      expires_at
    ) VALUES (
      p_user_id,
      p_plan_id,
      p_location_id,
      p_credential_id,
      p_amount,
      'plan_purchase',
      'completed',
      (SELECT username FROM credential_pools WHERE id = p_credential_id),
      (SELECT password FROM credential_pools WHERE id = p_credential_id),
      NOW(),
      NOW() + INTERVAL '1 hour' * p_duration_hours
    ) RETURNING id INTO v_transaction_id;
    
    -- Return success result
    v_result := jsonb_build_object(
      'success', true,
      'transaction_id', v_transaction_id,
      'user_id', p_user_id,
      'plan_id', p_plan_id,
      'location_id', p_location_id,
      'credential_id', p_credential_id,
      'amount', p_amount,
      'expires_at', NOW() + INTERVAL '1 hour' * p_duration_hours
    );
    
    RETURN v_result;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback will happen automatically
      RAISE EXCEPTION 'Purchase failed: %', SQLERRM;
  END;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end $function$;

CREATE OR REPLACE FUNCTION public.transfer_funds(p_from_user_id uuid, p_to_user_id uuid, p_amount numeric, p_charge numeric DEFAULT 0, p_reference text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_from_balance DECIMAL(10,2);
  v_to_balance DECIMAL(10,2);
  v_total_deduction DECIMAL(10,2);
  v_transfer_id UUID;
  v_result JSONB;
BEGIN
  -- Start transaction
  BEGIN
    -- Lock both user profile rows to prevent concurrent balance updates
    SELECT wallet_balance INTO v_from_balance
    FROM profiles
    WHERE id = p_from_user_id
    FOR UPDATE;
    
    SELECT wallet_balance INTO v_to_balance
    FROM profiles
    WHERE id = p_to_user_id
    FOR UPDATE;
    
    -- Check if both users exist
    IF v_from_balance IS NULL THEN
      RAISE EXCEPTION 'Sender user not found';
    END IF;
    
    IF v_to_balance IS NULL THEN
      RAISE EXCEPTION 'Recipient user not found';
    END IF;
    
    -- Check if sender has sufficient balance
    v_total_deduction := p_amount + p_charge;
    IF v_from_balance < v_total_deduction THEN
      RAISE EXCEPTION 'Insufficient balance. Required: %, Available: %', v_total_deduction, v_from_balance;
    END IF;
    
    -- Prevent self-transfer
    IF p_from_user_id = p_to_user_id THEN
      RAISE EXCEPTION 'Cannot transfer to yourself';
    END IF;
    
    -- Deduct amount + charge from sender
    UPDATE profiles
    SET wallet_balance = wallet_balance - v_total_deduction
    WHERE id = p_from_user_id;
    
    -- Add amount to recipient
    UPDATE profiles
    SET wallet_balance = wallet_balance + p_amount
    WHERE id = p_to_user_id;
    
    -- Generate transfer reference if not provided
    IF p_reference IS NULL THEN
      p_reference := 'TRF-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || SUBSTRING(p_from_user_id::TEXT, 1, 8);
    END IF;
    
    -- Create transaction record for sender (debit)
    INSERT INTO transactions (
      user_id,
      type,
      amount,
      status,
      reference,
      transfer_to_user_id,
      transfer_charge,
      transfer_reference,
      details,
      created_at,
      updated_at
    ) VALUES (
      p_from_user_id,
      'transfer_sent',
      v_total_deduction,
      'success',
      p_reference,
      p_to_user_id,
      p_charge,
      p_reference,
      jsonb_build_object(
        'transfer_amount', p_amount,
        'transfer_charge', p_charge,
        'recipient_id', p_to_user_id,
        'transfer_type', 'user_to_user'
      ),
      NOW(),
      NOW()
    ) RETURNING id INTO v_transfer_id;
    
    -- Create transaction record for recipient (credit)
    INSERT INTO transactions (
      user_id,
      type,
      amount,
      status,
      reference,
      transfer_from_user_id,
      transfer_reference,
      details,
      created_at,
      updated_at
    ) VALUES (
      p_to_user_id,
      'transfer_received',
      p_amount,
      'success',
      p_reference,
      p_from_user_id,
      p_reference,
      jsonb_build_object(
        'transfer_amount', p_amount,
        'sender_id', p_from_user_id,
        'transfer_type', 'user_to_user'
      ),
      NOW(),
      NOW()
    );
    
    -- Return success result
    v_result := jsonb_build_object(
      'success', true,
      'transfer_id', v_transfer_id,
      'reference', p_reference,
      'amount_transferred', p_amount,
      'charge_deducted', p_charge,
      'total_deducted', v_total_deduction,
      'sender_new_balance', v_from_balance - v_total_deduction,
      'recipient_new_balance', v_to_balance + p_amount
    );
    
    RETURN v_result;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Return error result
      RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
      );
  END;
END;
$function$;

CREATE OR REPLACE FUNCTION public.uid()
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  SELECT auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_plan_duration()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- For standard plans, enforce correct duration hours
    IF NEW.type = '3-hour' AND NEW.duration_hours != 3 THEN
        RAISE EXCEPTION '3-hour plan must have duration_hours = 3';
    ELSIF NEW.type = 'daily' AND NEW.duration_hours != 24 THEN
        RAISE EXCEPTION 'Daily plan must have duration_hours = 24';
    ELSIF NEW.type = 'weekly' AND NEW.duration_hours != 168 THEN
        RAISE EXCEPTION 'Weekly plan must have duration_hours = 168';
    ELSIF NEW.type = 'monthly' AND NEW.duration_hours != 720 THEN
        RAISE EXCEPTION 'Monthly plan must have duration_hours = 720';
    END IF;
    
    -- For all plans, ensure duration_hours is positive
    IF NEW.duration_hours <= 0 THEN
        RAISE EXCEPTION 'Duration hours must be greater than 0';
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_referral_code(code text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  referrer_id uuid;
BEGIN
  -- Check if the referral code exists and get the user ID
  SELECT id INTO referrer_id
  FROM profiles
  WHERE referral_code = UPPER(code)
  LIMIT 1;
  
  -- Return the referrer ID if found, NULL otherwise
  RETURN referrer_id;
END;
$function$;

-- ============================================================================
-- 9. TRIGGERS
-- ============================================================================

-- Drop triggers if they exist (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_credential_pools_updated_at ON public.credential_pools;
DROP TRIGGER IF EXISTS update_locations_updated_at ON public.locations;
DROP TRIGGER IF EXISTS update_plans_updated_at ON public.plans;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
DROP TRIGGER IF EXISTS tg_referral_payouts_updated_at ON public.referral_payouts;
DROP TRIGGER IF EXISTS enforce_plan_duration ON public.plans;

-- Auth trigger for creating profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update triggers
CREATE TRIGGER update_credential_pools_updated_at
  BEFORE UPDATE ON public.credential_pools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER tg_referral_payouts_updated_at
  BEFORE UPDATE ON public.referral_payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Validation triggers
CREATE TRIGGER enforce_plan_duration
  BEFORE INSERT OR UPDATE ON public.plans
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_plan_duration();

-- ============================================================================
-- 10. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_views ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 11. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Drop policies if they exist (for idempotency)
DROP POLICY IF EXISTS "allow_all" ON public.profiles;
DROP POLICY IF EXISTS "allow_all" ON public.plans;
DROP POLICY IF EXISTS "allow_all" ON public.locations;
DROP POLICY IF EXISTS "allow_all" ON public.credential_pools;
DROP POLICY IF EXISTS "allow_all" ON public.transactions;
DROP POLICY IF EXISTS "referral_earnings_admin_select" ON public.referral_earnings;
DROP POLICY IF EXISTS "referral_earnings_select_self" ON public.referral_earnings;
DROP POLICY IF EXISTS "referral_payouts_admin_select" ON public.referral_payouts;
DROP POLICY IF EXISTS "referral_payouts_admin_update" ON public.referral_payouts;
DROP POLICY IF EXISTS "referral_payouts_insert_self" ON public.referral_payouts;
DROP POLICY IF EXISTS "referral_payouts_select_self" ON public.referral_payouts;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.admin_settings;
DROP POLICY IF EXISTS "read how_it_works settings (anon)" ON public.admin_settings;
DROP POLICY IF EXISTS "read how_it_works settings (auth)" ON public.admin_settings;
DROP POLICY IF EXISTS "read_public_referral_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "allow_all" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admins can view all notification views" ON public.user_notification_views;
DROP POLICY IF EXISTS "Users can manage their own notification views" ON public.user_notification_views;

-- Profiles policies
CREATE POLICY "allow_all" ON public.profiles
  AS PERMISSIVE FOR ALL
  USING (true)
  WITH CHECK (true);

-- Plans policies
CREATE POLICY "allow_all" ON public.plans
  AS PERMISSIVE FOR ALL
  USING (true)
  WITH CHECK (true);

-- Locations policies
CREATE POLICY "allow_all" ON public.locations
  AS PERMISSIVE FOR ALL
  USING (true)
  WITH CHECK (true);

-- Credential pools policies
CREATE POLICY "allow_all" ON public.credential_pools
  AS PERMISSIVE FOR ALL
  USING (true)
  WITH CHECK (true);

-- Transactions policies
CREATE POLICY "allow_all" ON public.transactions
  AS PERMISSIVE FOR ALL
  USING (true)
  WITH CHECK (true);

-- Referral earnings policies
CREATE POLICY "referral_earnings_admin_select" ON public.referral_earnings
  AS PERMISSIVE FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::app_role)))));

CREATE POLICY "referral_earnings_select_self" ON public.referral_earnings
  AS PERMISSIVE FOR SELECT
  USING ((auth.uid() = referrer_id));

-- Referral payouts policies
CREATE POLICY "referral_payouts_admin_select" ON public.referral_payouts
  AS PERMISSIVE FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::app_role)))));

CREATE POLICY "referral_payouts_admin_update" ON public.referral_payouts
  AS PERMISSIVE FOR UPDATE
  USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::app_role)))));

CREATE POLICY "referral_payouts_insert_self" ON public.referral_payouts
  AS PERMISSIVE FOR INSERT
  WITH CHECK (((auth.uid() = user_id) AND (status = 'pending'::text)));

CREATE POLICY "referral_payouts_select_self" ON public.referral_payouts
  AS PERMISSIVE FOR SELECT
  USING ((auth.uid() = user_id));

-- Admin settings policies
CREATE POLICY "Admins can manage settings" ON public.admin_settings
  AS PERMISSIVE FOR ALL
  USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::app_role)))));

CREATE POLICY "read how_it_works settings (anon)" ON public.admin_settings
  AS PERMISSIVE FOR SELECT
  USING ((key = ANY (ARRAY['referral_howitworks_step1_title'::text, 'referral_howitworks_step1_desc'::text, 'referral_howitworks_step2_title'::text, 'referral_howitworks_step2_desc'::text, 'referral_howitworks_step3_title'::text, 'referral_howitworks_step3_desc'::text, 'referral_base_url'::text])));

CREATE POLICY "read how_it_works settings (auth)" ON public.admin_settings
  AS PERMISSIVE FOR SELECT
  USING ((key = ANY (ARRAY['referral_howitworks_step1_title'::text, 'referral_howitworks_step1_desc'::text, 'referral_howitworks_step2_title'::text, 'referral_howitworks_step2_desc'::text, 'referral_howitworks_step3_title'::text, 'referral_howitworks_step3_desc'::text, 'referral_base_url'::text])));

CREATE POLICY "read_public_referral_settings" ON public.admin_settings
  AS PERMISSIVE FOR SELECT
  USING ((key = ANY (ARRAY['referral_share_base_url'::text, 'referral_howitworks_step1_title'::text, 'referral_howitworks_step1_desc'::text, 'referral_howitworks_step2_title'::text, 'referral_howitworks_step2_desc'::text, 'referral_howitworks_step3_title'::text, 'referral_howitworks_step3_desc'::text])));

-- Admin notifications policies
CREATE POLICY "allow_all" ON public.admin_notifications
  AS PERMISSIVE FOR ALL
  USING (true)
  WITH CHECK (true);

-- User notification views policies
CREATE POLICY "Admins can view all notification views" ON public.user_notification_views
  AS PERMISSIVE FOR SELECT
  USING ((get_user_role(uid()) = 'admin'::app_role));

CREATE POLICY "Users can manage their own notification views" ON public.user_notification_views
  AS PERMISSIVE FOR ALL
  USING ((user_id = uid()));

