/**
 * TOTP (Time-based One-Time Password) Utilities
 * 
 * This module provides functions for generating and verifying TOTP codes
 * used in two-factor authentication.
 */

import { createHmac } from 'crypto';

/**
 * Generate a TOTP code from a secret key
 * @param secret - Base32 encoded secret key
 * @param window - Time window (default: current 30-second window)
 * @returns 6-digit TOTP code
 */
export const generateTOTP = (secret: string, window?: number): string => {
  // If no window provided, use current time
  const timeWindow = window || Math.floor(Date.now() / 30000);
  
  // Convert base32 secret to buffer
  const secretBuffer = base32Decode(secret);
  
  // Create 8-byte counter from time window
  const counter = Buffer.alloc(8);
  counter.writeUInt32BE(timeWindow, 4);
  
  // Generate HMAC-SHA1
  const hmac = createHmac('sha1', secretBuffer);
  hmac.update(counter);
  const digest = hmac.digest();
  
  // Dynamic truncation
  const offset = digest[digest.length - 1] & 0x0f;
  const truncated = digest.readUInt32BE(offset) & 0x7fffffff;
  
  // Generate 6-digit code
  const code = (truncated % 1000000).toString().padStart(6, '0');
  
  return code;
};

/**
 * Verify a TOTP code against a secret
 * @param code - 6-digit code to verify
 * @param secret - Base32 encoded secret key
 * @param window - Number of time windows to check (default: 1 = ±30 seconds)
 * @returns boolean indicating if code is valid
 */
export const verifyTOTP = (code: string, secret: string, window = 1): boolean => {
  const currentWindow = Math.floor(Date.now() / 30000);
  
  // Check current window and adjacent windows for clock drift tolerance
  for (let i = -window; i <= window; i++) {
    const testCode = generateTOTP(secret, currentWindow + i);
    if (testCode === code) {
      return true;
    }
  }
  
  return false;
};

/**
 * Generate a random base32 secret key
 * @param length - Length of secret (default: 32 characters)
 * @returns Base32 encoded secret key
 */
export const generateSecret = (length = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Generate backup codes
 * @param count - Number of backup codes to generate (default: 8)
 * @returns Array of backup codes
 */
export const generateBackupCodes = (count = 8): string[] => {
  const codes = [];
  
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  
  return codes;
};

/**
 * Create authenticator URI for QR code generation
 * @param secret - Base32 encoded secret
 * @param accountName - User's account identifier (email)
 * @param issuer - Service name (default: FedhaSmart)
 * @returns otpauth:// URI
 */
export const createAuthenticatorURI = (
  secret: string, 
  accountName: string, 
  issuer = 'FedhaSmart'
): string => {
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30'
  });
  
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?${params}`;
};

/**
 * Generate QR code URL for authenticator setup
 * @param uri - Authenticator URI
 * @param size - QR code size (default: 200x200)
 * @returns QR code image URL
 */
export const generateQRCodeURL = (uri: string, size = 200): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(uri)}`;
};

/**
 * Hash a backup code for secure storage
 * @param code - Backup code to hash
 * @returns Hashed code
 */
export const hashBackupCode = (code: string): string => {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');
};

/**
 * Verify a backup code against its hash
 * @param code - Backup code to verify
 * @param hash - Stored hash to compare against
 * @returns boolean indicating if code matches hash
 */
export const verifyBackupCode = (code: string, hash: string): boolean => {
  const codeHash = hashBackupCode(code);
  return codeHash === hash;
};

/**
 * Base32 decode function
 * @param encoded - Base32 encoded string
 * @returns Buffer containing decoded data
 */
function base32Decode(encoded: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleanInput = encoded.toUpperCase().replace(/[^A-Z2-7]/g, '');
  
  let bits = '';
  for (const char of cleanInput) {
    const index = alphabet.indexOf(char);
    if (index === -1) continue;
    bits += index.toString(2).padStart(5, '0');
  }
  
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    const byte = bits.substr(i, 8);
    if (byte.length === 8) {
      bytes.push(parseInt(byte, 2));
    }
  }
  
  return Buffer.from(bytes);
}

/**
 * Format secret key with spaces for better readability
 * @param secret - Base32 secret key
 * @returns Formatted secret with spaces every 4 characters
 */
export const formatSecret = (secret: string): string => {
  return secret.match(/.{1,4}/g)?.join(' ') || secret;
};

/**
 * Validate TOTP code format
 * @param code - Code to validate
 * @returns boolean indicating if code format is valid
 */
export const isValidTOTPFormat = (code: string): boolean => {
  return /^\d{6}$/.test(code);
};

/**
 * Validate backup code format
 * @param code - Code to validate
 * @returns boolean indicating if backup code format is valid
 */
export const isValidBackupCodeFormat = (code: string): boolean => {
  return /^[A-Z0-9]{8}$/.test(code.toUpperCase());
};