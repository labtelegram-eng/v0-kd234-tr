Supabase migration usage

1. Add environment variables (server and browser):
   SUPABASE_URL=https://pobexqnkjblqfsuoqobk.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYmV4cW5ramJscWZzdW9xb2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4ODY4MzIsImV4cCI6MjA3MDQ2MjgzMn0.j73Giyin1XmHhL-u2zbIyzx0s5JhlbD9o55YMutunPI
   NEXT_PUBLIC_SUPABASE_URL=https://pobexqnkjblqfsuoqobk.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvYmV4cW5ramJscWZzdW9xb2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4ODY4MzIsImV4cCI6MjA3MDQ2MjgzMn0.j73Giyin1XmHhL-u2zbIyzx0s5JhlbD9o55YMutunPI

2. Create the schema:
   - Open Supabase Dashboard → SQL Editor
   - Paste and run scripts/sql/001_init.sql

3. Seed development data (admin user and content):
   - POST /api/dev/seed (you can use curl):
     curl -X POST https://your-site.vercel.app/api/dev/seed
   - Admin credentials: login admin, password admin123

4. Login as admin in the UI:
   - Click "Войти", use admin/admin123
   - Visit /admin; access granted if role is "admin"

5. Example server query (see code):
   - app/api/destinations/route.ts shows select/insert
   - app/api/blog/posts/route.ts shows filter by active
   - app/api/auth/me/route.ts shows session lookup

Security notes:
- Passwords are stored in plaintext for demo parity; use bcrypt in production.
- Remove /api/dev/seed in production.
