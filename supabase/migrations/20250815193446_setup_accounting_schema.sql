-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'user', 'manager');
CREATE TYPE project_status AS ENUM ('active', 'completed', 'on-hold', 'cancelled');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE timesheet_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'invoiced');
CREATE TYPE expense_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE daily_log_category AS ENUM ('accounting', 'important', 'reminder', 'milestone');
CREATE TYPE daily_log_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE daily_log_status AS ENUM ('pending', 'in-progress', 'completed');
CREATE TYPE company_size AS ENUM ('startup', 'small', 'medium', 'large', 'enterprise');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    avatar TEXT,
    role user_role DEFAULT 'user',
    department TEXT,
    position TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{"theme": "light", "notifications": {"email": true, "push": true, "sms": false}, "language": "en"}',
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company profile table
CREATE TABLE public.company_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    legal_name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL,
    pincode TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    website TEXT,
    gstin TEXT,
    pan TEXT,
    cin_number TEXT,
    logo TEXT,
    description TEXT,
    founded_year INTEGER,
    industry TEXT,
    company_size company_size,
    annual_revenue DECIMAL(15,2),
    employee_count INTEGER,
    bank_details JSONB,
    contact_person JSONB,
    social_media JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    company_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    pincode TEXT,
    website TEXT,
    gstin TEXT,
    pan TEXT,
    contact_person TEXT,
    billing_address TEXT,
    billing_city TEXT,
    billing_state TEXT,
    billing_country TEXT,
    billing_pincode TEXT,
    payment_terms TEXT DEFAULT 'Net 30',
    credit_limit DECIMAL(15,2),
    status TEXT DEFAULT 'active',
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    status project_status DEFAULT 'active',
    budget DECIMAL(15,2),
    billing_rate DECIMAL(10,2),
    project_manager_id UUID REFERENCES public.user_profiles(id),
    team_members UUID[],
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timesheets table
CREATE TABLE public.timesheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timesheet_code TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    status timesheet_status DEFAULT 'draft',
    total_hours DECIMAL(8,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    billing_rate DECIMAL(10,2),
    days_worked INTEGER DEFAULT 0,
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.user_profiles(id),
    rejection_reason TEXT,
    notes TEXT,
    files JSONB[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timesheet entries table
CREATE TABLE public.timesheet_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timesheet_id UUID REFERENCES public.timesheets(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hours DECIMAL(4,2) NOT NULL,
    description TEXT,
    task_type TEXT,
    billable BOOLEAN DEFAULT true,
    rate DECIMAL(10,2),
    amount DECIMAL(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT NOT NULL UNIQUE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    timesheet_id UUID REFERENCES public.timesheets(id),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status invoice_status DEFAULT 'draft',
    subtotal DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL,
    payment_terms TEXT DEFAULT 'Net 30',
    notes TEXT,
    terms_conditions TEXT,
    files JSONB[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice items table
CREATE TABLE public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total DECIMAL(15,2) NOT NULL,
    hsn_code TEXT,
    unit TEXT DEFAULT 'Hours',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses table
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_code TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    project_id UUID REFERENCES public.projects(id),
    status expense_status DEFAULT 'pending',
    approved_by UUID REFERENCES public.user_profiles(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    receipt TEXT,
    notes TEXT,
    files JSONB[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily logs table
CREATE TABLE public.daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category daily_log_category NOT NULL,
    priority daily_log_priority DEFAULT 'medium',
    project_id UUID REFERENCES public.projects(id),
    tags TEXT[],
    status daily_log_status DEFAULT 'pending',
    assigned_to UUID REFERENCES public.user_profiles(id),
    due_date DATE,
    completed_at TIMESTAMPTZ,
    files JSONB[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Directory contacts table
CREATE TABLE public.directory_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    website TEXT,
    linkedin TEXT,
    notes TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Changelog table
CREATE TABLE public.changelog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    changes TEXT[],
    release_date DATE NOT NULL,
    type TEXT NOT NULL,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_clients_client_code ON public.clients(client_code);
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_clients_status ON public.clients(status);

CREATE INDEX idx_projects_project_code ON public.projects(project_code);
CREATE INDEX idx_projects_client_id ON public.projects(client_id);
CREATE INDEX idx_projects_status ON public.projects(status);

CREATE INDEX idx_timesheets_timesheet_code ON public.timesheets(timesheet_code);
CREATE INDEX idx_timesheets_user_id ON public.timesheets(user_id);
CREATE INDEX idx_timesheets_project_id ON public.timesheets(project_id);
CREATE INDEX idx_timesheets_status ON public.timesheets(status);
CREATE INDEX idx_timesheets_month_year ON public.timesheets(month, year);

CREATE INDEX idx_timesheet_entries_timesheet_id ON public.timesheet_entries(timesheet_id);
CREATE INDEX idx_timesheet_entries_date ON public.timesheet_entries(date);

CREATE INDEX idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX idx_invoices_project_id ON public.invoices(project_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);

CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);

CREATE INDEX idx_expenses_expense_code ON public.expenses(expense_code);
CREATE INDEX idx_expenses_project_id ON public.expenses(project_id);
CREATE INDEX idx_expenses_status ON public.expenses(status);
CREATE INDEX idx_expenses_date ON public.expenses(date);

CREATE INDEX idx_daily_logs_date ON public.daily_logs(date);
CREATE INDEX idx_daily_logs_project_id ON public.daily_logs(project_id);
CREATE INDEX idx_daily_logs_category ON public.daily_logs(category);
CREATE INDEX idx_daily_logs_status ON public.daily_logs(status);

CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timesheets_updated_at BEFORE UPDATE ON public.timesheets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timesheet_entries_updated_at BEFORE UPDATE ON public.timesheet_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoice_items_updated_at BEFORE UPDATE ON public.invoice_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON public.daily_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_profiles_updated_at BEFORE UPDATE ON public.company_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_directory_contacts_updated_at BEFORE UPDATE ON public.directory_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_changelog_updated_at BEFORE UPDATE ON public.changelog FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.directory_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.changelog ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Company profile is viewable by all authenticated users
CREATE POLICY "Authenticated users can view company profile" ON public.company_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update company profile" ON public.company_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Clients are viewable by all authenticated users
CREATE POLICY "Authenticated users can view clients" ON public.clients
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage clients" ON public.clients
    FOR ALL USING (auth.role() = 'authenticated');

-- Projects are viewable by all authenticated users
CREATE POLICY "Authenticated users can view projects" ON public.projects
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage projects" ON public.projects
    FOR ALL USING (auth.role() = 'authenticated');

-- Timesheets are viewable by the user who created them or admins
CREATE POLICY "Users can view own timesheets" ON public.timesheets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own timesheets" ON public.timesheets
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all timesheets" ON public.timesheets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Similar policies for other tables...
-- (I'll continue with the remaining policies in the next section)

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
