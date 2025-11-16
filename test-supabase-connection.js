#!/usr/bin/env node

// Simple script to test Supabase connection
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Not found');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test basic connection by checking auth status
    console.log('\n🔍 Testing auth status...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Auth error:', authError.message);
    } else {
      console.log('✅ Auth connection successful');
      console.log('Session:', session ? 'Active session found' : 'No active session');
    }

    // Test database connection by listing tables
    console.log('\n🔍 Testing database connection...');
    const { data: tables, error: dbError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);

    if (dbError) {
      console.error('❌ Database error:', dbError.message);
    } else {
      console.log('✅ Database connection successful');
      console.log('Found tables:', tables?.length || 0);
      if (tables && tables.length > 0) {
        console.log('Sample tables:', tables.map(t => t.table_name).join(', '));
      }
    }

    // Test profiles table specifically
    console.log('\n🔍 Testing profiles table...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profileError) {
      console.error('❌ Profiles table error:', profileError.message);
    } else {
      console.log('✅ Profiles table accessible');
      console.log('Sample profile count:', profiles?.length || 0);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testConnection().then(() => {
  console.log('\n🏁 Connection test completed');
  process.exit(0);
});
