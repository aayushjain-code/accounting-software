# Supabase Setup Guide for Accounting AI Application

This guide will walk you through setting up Supabase as the backend for your accounting application.

## 🎯 Prerequisites

- A Supabase account (free tier available)
- Basic knowledge of SQL and database concepts
- Your accounting application codebase

## 📋 Step-by-Step Setup

### Step 1: Create Supabase Project

1. **Sign Up/Login**
   - Go to [supabase.com](https://supabase.com)
   - Sign up with GitHub, Google, or email
   - Verify your email if required

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Enter project details:
     - **Name**: `accounting-ai` (or your preferred name)
     - **Database Password**: Generate a strong password
     - **Region**: Choose closest to your users
   - Click "Create new project"

3. **Wait for Setup**
   - Project creation takes 1-2 minutes
   - You'll see a success message when ready

### Step 2: Get Project Credentials

1. **Navigate to Settings**
   - In your project dashboard, go to Settings → API

2. **Copy Credentials**
   - **Project URL**: Copy the "Project URL"
   - **Anon Key**: Copy the "anon public" key
   - **Service Role Key**: Copy the "service_role" key (keep this secret!)

### Step 3: Set Up Environment Variables

1. **Create Environment File**

   ```bash
   # In your project root
   cp env.example .env.local
   ```

2. **Fill in Credentials**

   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. **Restart Development Server**
   ```bash
   npm run dev
   ```

### Step 4: Set Up Database Schema

1. **Open SQL Editor**
   - In Supabase dashboard, go to SQL Editor

2. **Run Schema Script**
   - Copy the entire content of `supabase/schema.sql`
   - Paste it in the SQL Editor
   - Click "Run" to execute

3. **Verify Tables**
   - Go to Table Editor
   - You should see all tables created:
     - `user_profiles`
     - `company_profiles`
     - `clients`
     - `projects`
     - `timesheets`
     - `timesheet_entries`
     - `invoices`
     - `invoice_items`
     - `expenses`
     - `daily_logs`
     - `directory_contacts`
     - `changelog`

### Step 5: Configure Storage Buckets

1. **Go to Storage**
   - In Supabase dashboard, navigate to Storage

2. **Create Buckets**
   - Click "New Bucket"
   - Create these buckets:
     - **Name**: `avatars`
     - **Name**: `receipts`
     - **Name**: `documents`

3. **Set Bucket Policies**
   - For each bucket, go to Policies
   - Add these policies:

   **avatars bucket:**

   ```sql
   -- Allow authenticated users to upload avatars
   CREATE POLICY "Users can upload avatars" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

   -- Allow users to view avatars
   CREATE POLICY "Users can view avatars" ON storage.objects
   FOR SELECT USING (bucket_id = 'avatars');
   ```

   **receipts bucket:**

   ```sql
   -- Allow authenticated users to upload receipts
   CREATE POLICY "Users can upload receipts" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');

   -- Allow users to view receipts
   CREATE POLICY "Users can view receipts" ON storage.objects
   FOR SELECT USING (bucket_id = 'receipts');
   ```

   **documents bucket:**

   ```sql
   -- Allow authenticated users to upload documents
   CREATE POLICY "Users can upload documents" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

   -- Allow users to view documents
   CREATE POLICY "Users can view documents" ON storage.objects
   FOR SELECT USING (bucket_id = 'documents');
   ```

### Step 6: Configure Authentication

1. **Go to Authentication**
   - In Supabase dashboard, navigate to Authentication → Settings

2. **Configure Site URL**
   - Set Site URL to your development URL (e.g., `http://localhost:3000`)
   - Add additional redirect URLs if needed

3. **Email Templates (Optional)**
   - Customize email templates for:
     - Confirm signup
     - Magic link
     - Change email address
     - Reset password

4. **Enable Email Auth**
   - Ensure "Enable email confirmations" is checked
   - Set confirmation redirect URL

### Step 7: Test the Setup

1. **Test Connection**

   ```typescript
   // In your browser console or component
   import { supabase } from "@/lib/supabase";

   // Test connection
   const { data, error } = await supabase.from("clients").select("*");
   console.log("Connection test:", { data, error });
   ```

2. **Test Authentication**

   ```typescript
   // Test sign up
   const { data, error } = await supabase.auth.signUp({
     email: "test@example.com",
     password: "password123",
   });
   ```

3. **Test Storage**
   ```typescript
   // Test file upload
   const file = new File(["test"], "test.txt", { type: "text/plain" });
   const { data, error } = await supabase.storage
     .from("documents")
     .upload("test.txt", file);
   ```

## 🔧 Advanced Configuration

### Row Level Security (RLS)

RLS is already configured in the schema, but you can customize policies:

1. **Go to Authentication → Policies**
2. **Review existing policies**
3. **Modify as needed for your use case**

### Database Functions

The schema includes several database functions:

- `update_updated_at_column()` - Automatically updates timestamps
- Custom code generators for entities

### Triggers

Automatic triggers are set up for:

- Updating `updated_at` timestamps
- Maintaining data integrity

## 🚨 Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify environment variables
   - Check project status in Supabase dashboard
   - Ensure CORS is properly configured

2. **RLS Policy Errors**
   - Check if user is authenticated
   - Verify user role permissions
   - Review policy definitions

3. **Storage Upload Errors**
   - Verify bucket policies
   - Check file size limits
   - Ensure bucket exists

4. **Schema Errors**
   - Check SQL syntax
   - Verify table names don't conflict
   - Ensure extensions are enabled

### Debug Mode

Enable debug logging:

```typescript
const supabase = createClient(url, key, {
  auth: {
    debug: true,
  },
});
```

### Check Logs

1. **Go to Logs in Supabase dashboard**
2. **Filter by your user ID**
3. **Look for error messages**

## 📊 Monitoring

### Database Performance

1. **Go to Database → Logs**
2. **Monitor slow queries**
3. **Check connection usage**

### Storage Usage

1. **Go to Storage → Overview**
2. **Monitor bucket sizes**
3. **Check file counts**

### Authentication

1. **Go to Authentication → Users**
2. **Monitor user signups**
3. **Check failed attempts**

## 🔒 Security Best Practices

1. **Never expose service role key**
2. **Use RLS policies for data access control**
3. **Regularly review and update policies**
4. **Monitor for suspicious activity**
5. **Use strong passwords for database**

## 📈 Scaling Considerations

### Free Tier Limits

- **Database**: 500MB
- **Storage**: 1GB
- **Bandwidth**: 2GB/month
- **API calls**: 50,000/month

### Pro Tier Benefits

- **Database**: 8GB
- **Storage**: 100GB
- **Bandwidth**: 250GB/month
- **API calls**: 500,000/month
- **Priority support**

## 🎉 Next Steps

After setup:

1. **Test all API endpoints**
2. **Verify data migration works**
3. **Set up monitoring and alerts**
4. **Configure backup strategies**
5. **Plan for production deployment**

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage API Reference](https://supabase.com/docs/reference/javascript/storage-createbucket)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

## 🆘 Support

If you encounter issues:

1. **Check Supabase status page**
2. **Review error logs**
3. **Search Supabase documentation**
4. **Ask in Supabase Discord community**
5. **Create GitHub issue in your repo**

---

Your Supabase backend is now ready! 🚀
