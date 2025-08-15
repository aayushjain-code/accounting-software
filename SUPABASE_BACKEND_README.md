# Supabase Backend for Accounting AI Application

This document provides a comprehensive guide to setting up and using the Supabase backend for your accounting application.

## 🚀 Quick Start

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Note down your project URL and anon key

### 2. Set Up Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Database URL for direct connections
DATABASE_URL=your_database_connection_string

# Optional: Storage configuration
NEXT_PUBLIC_STORAGE_BUCKET=your_storage_bucket_name
```

### 3. Run Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Execute the script

### 4. Set Up Storage Buckets

Create the following storage buckets in your Supabase project:

- `avatars` - for user profile pictures
- `receipts` - for expense receipts
- `documents` - for general document storage

Set bucket policies to allow authenticated users to upload/download files.

## 🏗️ Architecture Overview

### Database Schema

The application uses the following main tables:

- **user_profiles** - Extended user information beyond Supabase auth
- **company_profiles** - Company/organization details
- **clients** - Client information and billing details
- **projects** - Project management and tracking
- **timesheets** - Time tracking and billing
- **timesheet_entries** - Individual time entries
- **invoices** - Invoice generation and management
- **invoice_items** - Invoice line items
- **expenses** - Expense tracking and approval
- **daily_logs** - Daily activity logs
- **directory_contacts** - Contact directory
- **changelog** - Application changelog

### Key Features

- **Row Level Security (RLS)** - Data access control based on user roles
- **Real-time subscriptions** - Live updates for collaborative features
- **File storage** - Secure file uploads with Supabase Storage
- **Authentication** - Built-in user management with Supabase Auth
- **Database triggers** - Automatic timestamp updates and calculations

## 🔐 Authentication & Authorization

### User Roles

- **admin** - Full access to all features
- **manager** - Access to team management and approvals
- **user** - Basic access to own data

### RLS Policies

The application implements comprehensive Row Level Security:

- Users can only see their own profile and timesheets
- Admins can view and manage all data
- Project managers can access project-related data
- Company profile is viewable by all authenticated users

## 📡 API Services

### Available Services

1. **AuthService** - User authentication and profile management
2. **ClientService** - Client CRUD operations and management
3. **ProjectService** - Project management and team collaboration
4. **TimesheetService** - Time tracking and approval workflow
5. **InvoiceService** - Invoice generation and management
6. **ExpenseService** - Expense tracking and approval

### Service Features

Each service provides:

- CRUD operations
- Advanced filtering and search
- Pagination support
- Bulk operations
- Relationship management
- Statistics and reporting

## 🔄 Real-time Features

### Subscriptions

The backend supports real-time subscriptions for:

- Timesheet updates
- Invoice status changes
- Expense approvals
- Project updates
- Client modifications

### Example Usage

```typescript
import { supabase } from "@/lib/supabase";

// Subscribe to timesheet changes
const subscription = supabase
  .channel("timesheet-changes")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "timesheets" },
    payload => {
      console.log("Timesheet changed:", payload);
    }
  )
  .subscribe();
```

## 📁 File Storage

### Storage Buckets

- **avatars** - User profile pictures
- **receipts** - Expense receipts and documents
- **documents** - General file storage

### File Operations

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from("bucket-name")
  .upload("file-path", file);

// Get public URL
const { data } = supabase.storage.from("bucket-name").getPublicUrl("file-path");
```

## 🚀 Deployment

### Production Setup

1. **Environment Variables**
   - Set production Supabase credentials
   - Configure custom domains if needed
   - Set up proper CORS policies

2. **Database Optimization**
   - Monitor query performance
   - Add appropriate indexes
   - Set up connection pooling

3. **Security**
   - Review and test RLS policies
   - Set up proper API rate limiting
   - Configure audit logging

### Monitoring

- Use Supabase dashboard for database monitoring
- Set up alerts for critical operations
- Monitor storage usage and costs

## 🔧 Development

### Local Development

1. **Install Dependencies**

   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   ```

2. **Set Up Local Environment**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase credentials

3. **Database Migrations**
   - Use Supabase CLI for local development
   - Test schema changes locally before production

### Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run specific test suites
npm run test:functional
```

## 📊 Data Migration

### From Local Storage

If you're migrating from the current localStorage-based system:

1. **Export Data**
   - Export data from localStorage
   - Convert to Supabase format

2. **Import Data**
   - Use Supabase dashboard or API
   - Verify data integrity
   - Update application to use Supabase

### Sample Migration Script

```typescript
import { supabase } from "@/lib/supabase";

async function migrateData() {
  // Get data from localStorage
  const localData = JSON.parse(localStorage.getItem("accountingData") || "{}");

  // Migrate clients
  for (const client of localData.clients || []) {
    await supabase.from("clients").insert(client);
  }

  // Migrate other entities...
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   - Check user authentication status
   - Verify user role permissions
   - Review policy definitions

2. **Connection Issues**
   - Verify environment variables
   - Check Supabase project status
   - Review network policies

3. **Storage Errors**
   - Verify bucket policies
   - Check file size limits
   - Review file type restrictions

### Debug Mode

Enable debug logging:

```typescript
const supabase = createClient(url, key, {
  auth: {
    debug: true,
  },
});
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage API Reference](https://supabase.com/docs/reference/javascript/storage-createbucket)

## 🤝 Contributing

1. Follow the existing code structure
2. Add comprehensive error handling
3. Include TypeScript types for all new features
4. Add tests for new functionality
5. Update this documentation

## 📄 License

This backend implementation is part of the Accounting AI application and follows the same license terms.

---

For additional support or questions, please refer to the main project documentation or create an issue in the project repository.
