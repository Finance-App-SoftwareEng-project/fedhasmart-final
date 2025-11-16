# Supabase Local Development Setup Guide

## Prerequisites
- Docker installed and running on your system
- Node.js and npm installed
- Supabase CLI (now installed as dev dependency)

## Step 1: Initialize Supabase Locally

```bash
# Navigate to your project directory
cd /home/devyanjethwaa/fedhasmart-final-2

# Initialize Supabase (this will create local config)
npx supabase init
```

## Step 2: Start Local Supabase Services

```bash
# Start all Supabase services locally
npx supabase start
```

This will start:
- PostgreSQL Database
- Supabase Studio (Dashboard)
- Edge Functions runtime
- Realtime server
- Storage server
- Auth server

## Step 3: Link to Remote Project (Optional)

```bash
# Link to your existing remote project
npx supabase link --project-ref qqspqwkppzrfwuzasscs
```

## Step 4: Pull Remote Schema (if linking)

```bash
# Pull the database schema from remote
npx supabase db pull
```

## Step 5: Apply Migrations

```bash
# Apply your existing migrations
npx supabase db reset
```

## Step 6: Update Local Environment Variables

Create a `.env.local` file in your project root:

```env
# Local Supabase Configuration
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Firebase (if using hybrid auth)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
```

## Useful Commands

### Basic Operations
```bash
# Start services
npx supabase start

# Stop services
npx supabase stop

# Check status
npx supabase status

# View logs
npx supabase logs
```

### Database Operations
```bash
# Reset database
npx supabase db reset

# Create new migration
npx supabase migration new migration_name

# Apply migrations
npx supabase db push

# Pull remote changes
npx supabase db pull
```

### Studio Access
Once started, access Supabase Studio at:
- **URL**: http://localhost:54323
- **Username**: supabase  
- **Password**: this_password_is_insecure_and_should_be_updated

## Seeding Data (Optional)

Create a seed file for test data:

```sql
-- supabase/seed.sql
INSERT INTO profiles (id, phone) VALUES 
('550e8400-e29b-41d4-a716-446655440000', '+1234567890');

INSERT INTO expenses (user_id, amount, category, date, notes) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 25.50, 'Food', '2024-11-15', 'Lunch'),
('550e8400-e29b-41d4-a716-446655440000', 15.00, 'Transport', '2024-11-15', 'Bus fare');
```

Run seed:
```bash
npx supabase db seed
```

## Development Workflow

1. **Start Local Services**:
   ```bash
   npx supabase start
   ```

2. **Start Your App**:
   ```bash
   npm run dev
   ```

3. **Access Services**:
   - App: http://localhost:8080
   - Supabase Studio: http://localhost:54323
   - API: http://localhost:54321

4. **Make Changes**:
   - Database changes via Studio or migrations
   - Code changes in your React app

5. **Test PDF Export**:
   - Your PDF export functionality will work with local data
   - Test with the local database

## Configuration Files

### supabase/config.toml
```toml
project_id = "qqspqwkppzrfwuzasscs"

[api] 
enabled = true
port = 54321

[db]
port = 54322

[studio]
enabled = true
port = 54323

[auth]
enabled = true
```

## Troubleshooting

### Common Issues:

1. **Docker not running**:
   ```bash
   sudo systemctl start docker
   ```

2. **Port conflicts**:
   ```bash
   npx supabase stop
   npx supabase start
   ```

3. **Permission issues**:
   ```bash
   sudo chown -R $USER:$USER ~/.supabase
   ```

4. **Reset everything**:
   ```bash
   npx supabase stop
   npx supabase start --reset
   ```

## Testing Your Features

With local Supabase running, you can:

✅ **Test PDF Export**: Generate PDFs with local data  
✅ **Test Authentication**: Register/login locally  
✅ **Test Database Operations**: CRUD operations on local DB  
✅ **Test Real-time Features**: If using Supabase real-time  
✅ **Debug Easily**: Full access to logs and Studio  

## Production vs Development

- **Development**: Use `http://localhost:54321` 
- **Production**: Use your remote Supabase URL
- **Environment Variables**: Use `.env.local` for local, `.env` for production

This setup gives you a complete local development environment that mirrors your production Supabase setup!
