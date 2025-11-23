# Edge Functions Deployment Guide

This document contains all Edge Functions code from the AsukTech project and instructions for deploying them to a new Supabase project.

## Edge Functions Overview

The AsukTech project has **2 Edge Functions**:

1. **`create-virtual-account`** - Creates Flutterwave virtual accounts for users
2. **`flutterwave-webhook`** - Handles Flutterwave payment webhooks

Both functions use a shared configuration file: `_shared/flutterwave-config.ts`

---

## Prerequisites

Before deploying Edge Functions:

1. **Supabase CLI installed**:
   ```bash
   npm install -g supabase
   ```

2. **Logged into Supabase**:
   ```bash
   supabase login
   ```

3. **Linked to your project**:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Flutterwave API Keys** configured in `admin_settings` table:
   - `flutterwave_secret_key`
   - `flutterwave_public_key` (optional)
   - `flutterwave_webhook_secret` (optional)
   - `flutterwave_environment` (default: 'test')

---

## File Structure

```
supabase/
├── functions/
│   ├── _shared/
│   │   └── flutterwave-config.ts
│   ├── create-virtual-account/
│   │   └── index.ts
│   └── flutterwave-webhook/
│       ├── index.ts
│       └── function.json (optional)
```

---

## 1. Shared Configuration File

**File:** `supabase/functions/_shared/flutterwave-config.ts`

```typescript
import { createClient } from 'npm:@supabase/supabase-js@2';

export interface FlutterwaveConfig {
  secretKey: string;
  publicKey?: string;
  webhookSecret?: string;
  environment: 'test' | 'live';
}

export async function getFlutterwaveConfig(): Promise<FlutterwaveConfig> {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data: settings, error } = await supabaseClient
    .from('admin_settings')
    .select('key, value')
    .in('key', [
      'flutterwave_secret_key',
      'flutterwave_public_key', 
      'flutterwave_webhook_secret',
      'flutterwave_environment'
    ]);

  if (error) {
    throw new Error(`Failed to load Flutterwave configuration: ${error.message}`);
  }

  const settingsMap = settings?.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {}) || {};

  const secretKey = settingsMap.flutterwave_secret_key;
  if (!secretKey) {
    throw new Error('Flutterwave secret key not configured in admin settings');
  }

  return {
    secretKey,
    publicKey: settingsMap.flutterwave_public_key || '',
    webhookSecret: settingsMap.flutterwave_webhook_secret || '',
    environment: settingsMap.flutterwave_environment || 'test'
  };
}

export function getFlutterwaveApiUrl(environment: 'test' | 'live' = 'test'): string {
  // Both test and live use the same URL - the environment is determined by the API keys
  return 'https://api.flutterwave.com/v3';
}
```

---

## 2. Create Virtual Account Function

**File:** `supabase/functions/create-virtual-account/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { getFlutterwaveConfig, getFlutterwaveApiUrl } from '../_shared/flutterwave-config.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header from the request
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user is authenticated
    const token = authorization.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData = await req.json();

    // Always use authenticated user ID
    const authenticatedUserId = user.id;

    // Check if user already has a virtual account
    const { data: existingAccount } = await supabaseClient
      .from('profiles')
      .select('virtual_account_number, virtual_account_bank_name, virtual_account_reference')
      .eq('id', authenticatedUserId)
      .single();

    if (existingAccount?.virtual_account_number) {
      return new Response(
        JSON.stringify({
          status: 'success',
          message: 'Virtual account already exists',
          data: {
            id: existingAccount.virtual_account_reference || '',
            account_number: existingAccount.virtual_account_number,
            account_bank_name: existingAccount.virtual_account_bank_name || 'WEMA BANK',
            reference: existingAccount.virtual_account_reference || '',
            currency: 'NGN',
            account_type: 'static',
            status: 'active',
            amount: requestData.amount || 0,
            customer_id: authenticatedUserId,
            created_datetime: new Date().toISOString(),
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch profile details to fill missing fields
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('first_name, last_name, phone, bvn, email')
      .eq('id', authenticatedUserId)
      .single();

    const effectiveEmail = requestData.email || profile?.email || user.email || '';
    const effectiveFirstName = requestData.firstName || profile?.first_name || '';
    const effectiveLastName = requestData.lastName || profile?.last_name || '';
    const effectivePhone = requestData.phoneNumber || profile?.phone || undefined;
    const effectiveBvn = requestData.bvn || profile?.bvn || undefined;

    // Require minimal fields
    if (!effectiveEmail || !effectiveFirstName || !effectiveLastName) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'Missing user profile details (email, first name, last name)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate permanent account requirements
    const wantsPermanent = (requestData.account_type || '').toLowerCase() === 'static';
    if (wantsPermanent && !requestData.bvn) {
      return new Response(
        JSON.stringify({ status: 'error', message: 'BVN is required for permanent virtual accounts' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare Flutterwave request aligned to v3 virtual account numbers API
    const flutterwaveData = {
      tx_ref: requestData.reference || `${authenticatedUserId}-${Date.now()}`,
      email: effectiveEmail,
      is_permanent: wantsPermanent,
      bvn: effectiveBvn || undefined,
      firstname: effectiveFirstName,
      lastname: effectiveLastName,
      phonenumber: effectivePhone || undefined,
      narration: `${effectiveFirstName} ${effectiveLastName} - AsukTek`,
      currency: 'NGN',
      ...(wantsPermanent ? {} : { amount: Number(requestData.amount) })
    };

    // Get Flutterwave configuration from admin settings
    let flutterwaveConfig;
    try {
      flutterwaveConfig = await getFlutterwaveConfig();
    } catch (error) {
      console.error('Error loading Flutterwave config:', error);
      return new Response(
        JSON.stringify({ status: 'error', message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Flutterwave Key (first 10 chars):', flutterwaveConfig.secretKey.substring(0, 10) + '...');
    console.log('Flutterwave Environment:', flutterwaveConfig.environment);
    console.log('Flutterwave Request Data:', JSON.stringify(flutterwaveData, null, 2));

    // Use Flutterwave v3 endpoint
    const flutterwaveUrl = `${getFlutterwaveApiUrl(flutterwaveConfig.environment)}/virtual-account-numbers`;
    
    console.log('Using Flutterwave URL:', flutterwaveUrl);
    
    const flutterwaveResponse = await fetch(flutterwaveUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${flutterwaveConfig.secretKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(flutterwaveData)
    });

    console.log('Flutterwave Response Status:', flutterwaveResponse.status);
    console.log('Flutterwave Response Headers:', Object.fromEntries(flutterwaveResponse.headers.entries()));

    // Always read body as text first to avoid crashes from mislabeled content-type
    const responseText = await flutterwaveResponse.text();
    let flutterwaveResult;
    try {
      flutterwaveResult = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Flutterwave response as JSON:', responseText);
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Invalid response from Flutterwave API',
          details: responseText.substring(0, 300)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Flutterwave Response Body:', JSON.stringify(flutterwaveResult, null, 2));

    if (flutterwaveResult.status === 'success' && flutterwaveResult.data) {
      const bankName = flutterwaveResult.data.account_bank_name
        || flutterwaveResult.data.bank_name
        || flutterwaveResult.data.account_bank
        || (flutterwaveResult.data.bank && flutterwaveResult.data.bank.name)
        || 'WEMA BANK';
      const referenceValue = flutterwaveResult.data.reference
        || flutterwaveResult.data.tx_ref
        || flutterwaveResult.data.order_ref
        || requestData.reference;

      // Save virtual account details to user profile
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({
          virtual_account_number: flutterwaveResult.data.account_number,
          virtual_account_bank_name: bankName,
          virtual_account_reference: referenceValue,
          first_name: effectiveFirstName,
          last_name: effectiveLastName,
        })
        .eq('id', authenticatedUserId);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        // Continue anyway, as the account was created successfully
      }

      return new Response(
        JSON.stringify(flutterwaveResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Pass through Flutterwave error details if present, but use 200 so clients can read the message
      const flwMessage = flutterwaveResult && flutterwaveResult.message || 'Failed to create virtual account';
      const normalizedMessage = /invalid\s*bvn/i.test(flwMessage) ? 'Invalid BVN' : flwMessage;
      return new Response(
        JSON.stringify({
          status: 'error',
          message: normalizedMessage,
          details: flutterwaveResult.errors || flutterwaveResult.data || null,
          flutterwave_status: flutterwaveResponse.status,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in create-virtual-account function:', error);
    return new Response(
      JSON.stringify({
        status: 'error',
        message: 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 3. Flutterwave Webhook Function

**File:** `supabase/functions/flutterwave-webhook/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getFlutterwaveConfig } from '../_shared/flutterwave-config.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, verif-hash",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    console.log("Webhook started - processing request");
    
    // Get Flutterwave configuration from admin settings
    let flutterwaveConfig;
    try {
      flutterwaveConfig = await getFlutterwaveConfig();
      console.log("Flutterwave config loaded successfully");
      console.log("Environment:", flutterwaveConfig.environment);
      console.log("Secret key exists:", !!flutterwaveConfig.secretKey);
    } catch (error) {
      console.error('Error loading Flutterwave config:', error);
      throw new Error(`Failed to load Flutterwave configuration: ${error.message}`);
    }

    // Initialize Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    console.log("Supabase URL exists:", !!supabaseUrl);
    console.log("Supabase service key exists:", !!supabaseServiceKey);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("Supabase client created successfully");

    // Get the signature from the request headers
    const signature = req.headers.get("verif-hash");
    console.log("Signature header:", signature);
    
    // Parse webhook payload
    let payload;
    try {
      const rawBody = await req.text();
      console.log("Raw body received, length:", rawBody.length);
      payload = JSON.parse(rawBody);
      console.log("Payload parsed successfully");
    } catch (error) {
      console.error("JSON parse error:", error);
      throw new Error("Invalid JSON payload");
    }

    // Quick validation - exit early if not a bank transfer
    if (payload.event !== "charge.completed" || 
        payload.data?.payment_type !== "bank_transfer" || 
        payload.data?.status !== "successful") {
      
      console.log("Event ignored - not a successful bank transfer");
      return new Response(JSON.stringify({
        success: true,
        message: "Event ignored - not a successful bank transfer"
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    console.log("Processing bank transfer event");

    // Extract data
    const { tx_ref, flw_ref, amount, currency, customer } = payload.data;
    const email = customer?.email;

    console.log("Extracted data:", { tx_ref, flw_ref, amount, currency, email });

    if (!tx_ref || !flw_ref || !amount || !email) {
      throw new Error("Missing required fields in webhook payload");
    }

    // FAST: Check if transaction already processed (idempotency)
    console.log("Checking for existing transaction...");
    const { data: existingTransaction } = await supabase
      .from("transactions")
      .select("id")
      .eq("flutterwave_tx_ref", flw_ref)
      .eq("status", "success")
      .maybeSingle();

    if (existingTransaction) {
      console.log("Transaction already processed");
      return new Response(JSON.stringify({
        success: true,
        message: "Transaction already processed"
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // FAST: Find user by virtual account reference or email
    console.log("Finding user profile...");
    let userProfile;
    const { data: profileData, error: userError } = await supabase
      .from("profiles")
      .select("id, wallet_balance, email")
      .eq("virtual_account_reference", tx_ref)
      .single();

    if (userError || !profileData) {
      console.log("User not found by virtual_account_reference, trying email...");
      // Fallback to email lookup
      const { data: userByEmail, error: emailError } = await supabase
        .from("profiles")
        .select("id, wallet_balance, email")
        .eq("email", email)
        .single();

      if (emailError || !userByEmail) {
        console.error("User not found by email either");
        throw new Error(`User profile not found for tx_ref: ${tx_ref} or email: ${email}`);
      }
      
      userProfile = userByEmail;
      console.log("User found by email");
    } else {
      userProfile = profileData;
      console.log("User found by virtual_account_reference");
    }

    // Verify email match
    if (userProfile.email !== email) {
      throw new Error("Email mismatch in transaction");
    }

    // FAST: Calculate new balance (no charges)
    const originalAmount = parseFloat(amount);
    const currentBalance = parseFloat(userProfile.wallet_balance || '0');
    const newBalance = currentBalance + originalAmount;

    console.log("Balance calculation:", { currentBalance, originalAmount, newBalance });

    // FAST: Update wallet balance
    console.log("Updating wallet balance...");
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ wallet_balance: newBalance })
      .eq("id", userProfile.id);

    if (updateError) {
      console.error("Wallet update error:", updateError);
      throw new Error("Failed to update wallet balance");
    }

    console.log("Wallet balance updated successfully");

    // FAST: Create transaction record
    console.log("Creating transaction record...");
    const transactionData = {
      user_id: userProfile.id,
      type: "wallet_funding",
      amount: originalAmount,
      status: "success",
      reference: `FLW-${flw_ref}`,
      flutterwave_tx_ref: flw_ref,
      details: {
        payment_method: "bank_transfer",
        currency,
        tx_ref,
        note: "Full amount credited - no service charges"
      }
    };

    const { error: transactionError } = await supabase
      .from("transactions")
      .insert([transactionData]);

    if (transactionError) {
      console.error("Transaction creation error:", transactionError);
      throw new Error("Failed to create transaction record");
    }

    console.log("Transaction record created successfully");

    // FAST: Create admin log (non-blocking)
    console.log("Creating admin log...");
    try {
      await supabase.from("admin_logs").insert([
        {
          admin_id: null,
          action: "wallet_funding_webhook",
          details: {
            user_id: userProfile.id,
            amount: originalAmount,
            tx_ref,
            flw_ref,
            previous_balance: currentBalance,
            new_balance: newBalance,
            note: "Full amount credited - no service charges"
          }
        }
      ]);
      console.log("Admin log created successfully");
    } catch (logError) {
      // Log error but don't fail the webhook
      console.error("Admin log creation failed:", logError);
    }

    console.log("Webhook completed successfully");

    // Return success response immediately
    return new Response(JSON.stringify({
      success: true,
      message: "Wallet funded successfully - full amount credited",
      data: {
        user_id: userProfile.id,
        amount_credited: originalAmount,
        new_balance: newBalance,
        transaction_ref: `FLW-${flw_ref}`,
        note: "No service charges applied"
      }
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to process webhook"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
```

---

## Deployment Instructions

### Step 1: Create the File Structure

Create the following directory structure in your project:

```bash
mkdir -p supabase/functions/_shared
mkdir -p supabase/functions/create-virtual-account
mkdir -p supabase/functions/flutterwave-webhook
```

### Step 2: Copy the Files

Copy each file to its respective location:
- `supabase/functions/_shared/flutterwave-config.ts`
- `supabase/functions/create-virtual-account/index.ts`
- `supabase/functions/flutterwave-webhook/index.ts`

### Step 3: Deploy Functions

Deploy all functions at once:

```bash
supabase functions deploy
```

Or deploy individually:

```bash
# Deploy create-virtual-account
supabase functions deploy create-virtual-account

# Deploy flutterwave-webhook
supabase functions deploy flutterwave-webhook
```

### Step 4: Configure Flutterwave Settings

After deploying, add Flutterwave configuration to your `admin_settings` table:

```sql
INSERT INTO admin_settings (key, value, description) VALUES
  ('flutterwave_secret_key', 'your-secret-key', 'Flutterwave secret API key'),
  ('flutterwave_public_key', 'your-public-key', 'Flutterwave public API key'),
  ('flutterwave_webhook_secret', 'your-webhook-secret', 'Flutterwave webhook secret'),
  ('flutterwave_environment', 'test', 'Flutterwave environment: test or live')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

### Step 5: Configure Webhook URL in Flutterwave Dashboard

1. Go to Flutterwave Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-project-ref.supabase.co/functions/v1/flutterwave-webhook`
3. Select events: `charge.completed`
4. Save the webhook secret and update it in `admin_settings`

---

## Function URLs

After deployment, your functions will be available at:

- **create-virtual-account**: `https://your-project-ref.supabase.co/functions/v1/create-virtual-account`
- **flutterwave-webhook**: `https://your-project-ref.supabase.co/functions/v1/flutterwave-webhook`

---

## Testing

### Test create-virtual-account

```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/create-virtual-account \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+2341234567890",
    "account_type": "static",
    "bvn": "12345678901"
  }'
```

### Test flutterwave-webhook

The webhook will be called automatically by Flutterwave when payments are completed. You can also test it manually using Flutterwave's webhook testing tool.

---

## Important Notes

1. **Environment Variables**: The functions automatically use `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from Supabase (no need to set manually).

2. **Authentication**: The `create-virtual-account` function requires user authentication via Bearer token.

3. **Webhook Security**: The `flutterwave-webhook` function should verify the `verif-hash` header (currently logged but not enforced - consider adding verification).

4. **Admin Logs**: The webhook tries to insert into `admin_logs` table. If this table doesn't exist, the webhook will still work (the log creation is non-blocking).

5. **Error Handling**: Both functions have comprehensive error handling and logging.

---

## Troubleshooting

### Function not found
- Ensure you've deployed the function: `supabase functions deploy function-name`
- Check the function name matches exactly

### Flutterwave config error
- Verify `admin_settings` table has the required keys
- Check that `flutterwave_secret_key` is set

### Authentication errors
- Ensure you're passing the correct Bearer token
- Verify the user exists in `auth.users` and has a profile

### Webhook not receiving events
- Verify webhook URL in Flutterwave dashboard
- Check function logs: `supabase functions logs flutterwave-webhook`
- Ensure webhook is configured for `charge.completed` events

---

## Support

For issues or questions:
1. Check function logs: `supabase functions logs function-name`
2. Verify database schema matches migration
3. Ensure Flutterwave API keys are correct
4. Check Supabase dashboard for function status

