# Firebase Phone Authentication Setup

## Overview
This module implements Firebase Authentication with phone number support for the FedHaSmart application.

## Files Created
1. `src/config/firebase.ts` - Firebase configuration and initialization
2. `src/contexts/FirebaseAuthContext.tsx` - Firebase auth context provider with phone auth methods
3. `src/components/PhoneAuth.tsx` - Phone authentication UI component
4. `src/pages/PhoneAuth.tsx` - Phone authentication page
5. `.env.example` - Environment variables template

## Setup Instructions

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication > Sign-in method > Phone

### 2. Get Firebase Configuration
1. In Firebase Console, go to Project Settings
2. Scroll down to "Your apps" section
3. Click on the web app icon (</>)
4. Copy the configuration values

### 3. Configure Environment Variables
1. Create a `.env` file in the root directory (copy from `.env.example`)
2. Add your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Configure Firebase for Phone Authentication
1. In Firebase Console, enable Phone Authentication
2. Add your domain to authorized domains (for development, localhost should work)
3. For production, add your production domain

### 5. Test Phone Authentication
1. Start your development server: `npm run dev`
2. Navigate to `/phone-auth` route
3. Enter a phone number with country code (e.g., +1234567890)
4. You'll receive an OTP via SMS
5. Enter the OTP to verify and sign in

## Features

### FirebaseAuthContext
- `user` - Current authenticated user
- `loading` - Loading state
- `setupRecaptcha` - Initialize reCAPTCHA verifier
- `signInWithPhone` - Send OTP to phone number
- `verifyOTP` - Verify OTP and sign in
- `signOut` - Sign out current user

### PhoneAuth Component
- Phone number input with country code
- OTP verification
- Error handling
- Success messages
- Loading states
- Back button to resend OTP

## Usage Example

```tsx
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

function MyComponent() {
  const { user, signOut } = useFirebaseAuth();

  if (user) {
    return (
      <div>
        <p>Logged in as: {user.phoneNumber}</p>
        <button onClick={signOut}>Sign Out</button>
      </div>
    );
  }

  return <p>Not logged in</p>;
}
```

## Important Notes

### Phone Number Format
- Must include country code
- Format: `+[country_code][phone_number]`
- Examples: `+12345678900` (US), `+919876543210` (India)

### Testing
- Firebase provides test phone numbers for development
- Go to Firebase Console > Authentication > Sign-in method > Phone
- Scroll to "Phone numbers for testing" and add test numbers with OTPs

### reCAPTCHA
- Uses invisible reCAPTCHA for bot protection
- Automatically initialized and cleared
- No user interaction required unless suspicious activity detected

### Security
- Never commit `.env` file to version control
- Keep Firebase API keys secure
- Use Firebase Security Rules to protect user data
- Enable App Check for additional security in production

## Integration with Existing Auth

This Firebase phone authentication can work alongside your existing Supabase authentication:
- Use Firebase for phone-based login
- Use Supabase for email/password and data storage
- Sync user data between both systems if needed

## Troubleshooting

### OTP Not Received
- Check phone number format
- Verify Firebase Phone Authentication is enabled
- Check Firebase quota limits
- Ensure phone provider supports SMS

### reCAPTCHA Errors
- Clear browser cache
- Check domain is authorized in Firebase Console
- Ensure `recaptcha-container` div exists

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run type-check`
- Verify environment variables are set

## Next Steps

1. Add phone number verification to user profile
2. Implement phone number updates
3. Add multi-factor authentication (MFA)
4. Sync Firebase users with Supabase database
5. Add analytics for authentication events
