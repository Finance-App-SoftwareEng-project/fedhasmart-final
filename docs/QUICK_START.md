# Quick Start Guide - Firebase Phone Auth Integration

## 🚀 Steps to Get Started

### Step 1: Apply Database Migration

You need to add the `firebase_uid` and `phone_verified` fields to your Supabase database.

**Option A: Using Supabase CLI (Recommended)**
```bash
# Make sure you're connected to your project
supabase link --project-ref thhzqrdnagecprijzqwc

# Apply the migration
supabase db push
```

**Option B: Manual Application**
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `fedhasmart`
3. Go to **SQL Editor**
4. Run this SQL:
```sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS firebase_uid TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_profiles_firebase_uid ON public.profiles(firebase_uid);
```

### Step 2: Regenerate TypeScript Types

After applying the migration, regenerate the TypeScript types:

**Option A: Using Supabase CLI**
```bash
supabase gen types typescript --project-id thhzqrdnagecprijzqwc > src/integrations/supabase/types.ts
```

**Option B: Using Supabase Dashboard**
1. Go to **API Docs** in your Supabase project
2. Find the **TypeScript** section
3. Copy the generated types
4. Replace content in `src/integrations/supabase/types.ts`

### Step 3: Test the Integration

1. **Start your dev server:**
```bash
npm run dev
```

2. **Test Phone Authentication:**
   - Navigate to `/phone-auth`
   - Use a Firebase test phone number (e.g., `+1234567890` with code `123456`)
   - Verify the OTP
   - Check that you're logged in

3. **Test Auth Page Integration:**
   - Navigate to `/auth`
   - Click "Sign in with Phone" button
   - Complete phone authentication
   - Verify redirect to dashboard

4. **Test Profile Management:**
   - Navigate to `/profile`
   - View your account information
   - Edit your display name and phone
   - Save changes

### Step 4: Verify Database Sync

Check that Firebase users are being synced to Supabase:

1. Go to Supabase Dashboard → **Table Editor** → `profiles`
2. Look for the `firebase_uid` column
3. After phone auth, you should see a profile with `firebase_uid` populated
4. `phone_verified` should be `true` for Firebase-authenticated users

## 🔧 Current Known Issues

### TypeScript Error (Will be fixed after type regeneration)
```
Type instantiation is excessively deep and possibly infinite
```
**Fix:** Regenerate types after applying the database migration (Step 2 above)

### Phone SMS Not Received (Free Tier Limitation)
**Workaround:** Use Firebase test phone numbers
1. Firebase Console → Authentication → Sign-in method → Phone
2. Scroll to "Phone numbers for testing"
3. Add: `+1234567890` with code `123456`

### Profile Creation for Firebase-Only Users
Currently, Firebase-only users won't have full Supabase profiles created automatically.
**Workaround:** Users should complete email signup to get full profile access.

## 📱 Testing Credentials

### Firebase Test Numbers
Set these up in Firebase Console:
- `+1234567890` → Code: `123456`
- `+1555123456` → Code: `654321`

### Email Test Account
Use your existing Supabase email auth for testing email login.

## 🎯 Features Checklist

After setup, you should be able to:
- ✅ Sign in with phone number (Firebase)
- ✅ Sign in with email/password (Supabase)
- ✅ View unified user profile
- ✅ See verification status for email and phone
- ✅ Edit profile information
- ✅ Sign out from both systems at once
- ✅ Navigate between auth methods

## 📊 Routes Overview

| URL | Purpose |
|-----|---------|
| `/auth` | Main authentication page (email + phone options) |
| `/phone-auth` | Dedicated phone authentication |
| `/profile` | User profile management |
| `/dashboard` | Main app (requires authentication) |

## 🔐 Production Checklist

Before going to production:
- [ ] Upgrade Firebase to Blaze plan (for real SMS)
- [ ] Regenerate TypeScript types
- [ ] Add production domain to Firebase authorized domains
- [ ] Set up Firebase App Check
- [ ] Test with real phone numbers
- [ ] Monitor Firebase usage and costs
- [ ] Set up proper error logging
- [ ] Add rate limiting for auth endpoints
- [ ] Review and test all RLS policies in Supabase

## 📚 Documentation

- Full setup: `docs/FIREBASE_PHONE_AUTH.md`
- Implementation details: `docs/INTEGRATION_SUMMARY.md`
- Firebase Console: https://console.firebase.google.com/project/fedhasmart
- Supabase Dashboard: https://supabase.com/dashboard/project/thhzqrdnagecprijzqwc

## 🆘 Need Help?

Common issues and solutions:

**Issue: "Operation not allowed" error**
- Solution: Enable Phone Authentication in Firebase Console

**Issue: OTP not received**
- Solution: Use Firebase test phone numbers (free tier limitation)

**Issue: TypeScript errors**
- Solution: Regenerate types after database migration

**Issue: User not syncing to Supabase**
- Solution: Check browser console for errors, verify migration was applied

## 🎉 You're All Set!

Once you've completed Steps 1-3, your Firebase phone authentication is fully integrated with your Supabase app!
