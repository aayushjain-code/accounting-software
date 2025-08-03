export interface Client {
  id: string;
  clientCode: string; // CLT-YYYY-XXXX format
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  gstId: string;
  companyAddress: string;
  companyWebsite: string;
  companyLinkedin: string;
  companyOwner: string;
  pocName: string;
  pocEmail: string;
  pocContact: string;
  companyLogo: string;
  // Additional fields for comprehensive client database
  industry: string;
  companySize: "startup" | "small" | "medium" | "large" | "enterprise";
  status: "active" | "inactive" | "prospect" | "lead";
  source: string; // How the client was acquired
  notes: string;
  tags: string[];
  annualRevenue?: number;
  employeeCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  projectCode: string; // BST-01, BST-02, etc.
  name: string;
  clientId: string; // Required - Project derives from Client
  description: string;
  startDate: Date;
  status: "active" | "inactive" | "completed" | "on-hold" | "archived";
  budget: number;
  billingTerms: number; // Days
  billingRate: number; // Per hour rate
  estimatedHours?: number; // Made optional
  gstRate: number;
  gstInclusive: boolean;
  totalCost: number;
  costBreakdown: {
    subtotal: number;
    gstAmount: number;
    total: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TimesheetEntry {
  id: string;
  timesheetId: string;
  date: Date;
  day: string;
  task: string;
  hours: number;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimesheetFile {
  id: string;
  timesheetId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  uploadDate: Date;
  uploadedBy: string;
  filePath: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceFile {
  id: string;
  invoiceId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  uploadDate: Date;
  uploadedBy: string;
  filePath: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Timesheet {
  id: string;
  timesheetCode: string; // TMS-YYYY-MM-XXXX format
  projectId: string;
  month: string; // Format: "YYYY-MM"
  year: number;
  status: "draft" | "submitted" | "approved" | "rejected" | "invoiced";

  // Work calculations
  totalWorkingDays: number; // Total days in the month (excluding weekends)
  daysWorked: number; // Actual days worked
  daysLeave: number; // Leave days taken
  hoursPerDay?: number; // Default 8 hours per day (optional)

  // Costing calculations (derived from project)
  billingRate?: number; // Per hour rate from project (optional)
  totalHours?: number; // daysWorked * hoursPerDay (optional)
  totalAmount?: number; // totalHours * billingRate (optional)

  // Approval workflow
  submittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;

  // Invoice tracking
  invoiceId?: string; // Reference to generated invoice
  invoicedAt?: Date;

  // File attachments
  files?: TimesheetFile[];

  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  timesheetId: string; // Required - Invoice derives from Timesheet
  clientId: string; // Derived from Timesheet -> Project -> Client
  projectId: string; // Derived from Timesheet -> Project
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  status: "draft" | "sent" | "paid";
  subtotal: number; // Derived from Timesheet.totalAmount
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;

  // File attachments
  files?: InvoiceFile[];

  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ExpenseFile {
  id: string;
  expenseId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  uploadDate: Date;
  uploadedBy: string;
  filePath: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  expenseCode: string; // EXP-YYYY-MM-XXXX format
  category: string;
  description: string;
  amount: number;
  date: Date;
  projectId?: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;

  // File attachments
  files?: ExpenseFile[];

  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialReport {
  id: string;
  title: string;
  type: "monthly" | "quarterly" | "annual";
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyProfile {
  id: string;
  name: string;
  legalName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  gstNumber: string;
  panNumber: string;
  cinNumber: string;
  logo: string;
  description: string;
  foundedYear: number;
  industry: string;
  companySize: "startup" | "small" | "medium" | "large" | "enterprise";
  annualRevenue?: number;
  employeeCount?: number;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branch: string;
  };
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    designation: string;
  };
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyLog {
  id: string;
  date: Date;
  title: string;
  description: string;
  category: "accounting" | "important" | "reminder" | "milestone";
  priority: "low" | "medium" | "high" | "critical";
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  outstandingAmount: number;
  activeProjects: number;
  activeClients: number;
  pendingTimesheets: number;
  approvedTimesheets: number;
  invoicedTimesheets: number;
}

export interface AccountingData {
  clients: Client[];
  projects: Project[];
  timesheets: Timesheet[];
  invoices: Invoice[];
  expenses: Expense[];
  dailyLogs: DailyLog[];
  companyProfile: CompanyProfile;
}

// Global window interface for Electron API
declare global {
  interface Window {
    electronAPI?: {
      // Database operations
      getClients: () => Promise<Client[]>;
      getClient: (id: string) => Promise<Client>;
      createClient: (
        client: Omit<Client, "id" | "clientCode" | "createdAt" | "updatedAt">
      ) => Promise<Client>;
      updateClient: (id: string, client: Partial<Client>) => Promise<Client>;
      deleteClient: (id: string) => Promise<void>;

      getProjects: () => Promise<Project[]>;
      getProject: (id: string) => Promise<Project>;
      createProject: (
        project: Omit<Project, "id" | "projectCode" | "createdAt" | "updatedAt">
      ) => Promise<Project>;
      updateProject: (
        id: string,
        project: Partial<Project>
      ) => Promise<Project>;
      deleteProject: (id: string) => Promise<void>;

      getTimesheets: () => Promise<Timesheet[]>;
      getTimesheet: (id: string) => Promise<Timesheet>;
      createTimesheet: (
        timesheet: Omit<
          Timesheet,
          "id" | "timesheetCode" | "createdAt" | "updatedAt"
        >
      ) => Promise<Timesheet>;
      updateTimesheet: (
        id: string,
        timesheet: Partial<Timesheet>
      ) => Promise<Timesheet>;
      deleteTimesheet: (id: string) => Promise<void>;

      getInvoices: () => Promise<Invoice[]>;
      getInvoice: (id: string) => Promise<Invoice>;
      createInvoice: (
        invoice: Omit<
          Invoice,
          "id" | "invoiceNumber" | "createdAt" | "updatedAt"
        >
      ) => Promise<Invoice>;
      updateInvoice: (
        id: string,
        invoice: Partial<Invoice>
      ) => Promise<Invoice>;
      deleteInvoice: (id: string) => Promise<void>;

      getExpenses: () => Promise<Expense[]>;
      getExpense: (id: string) => Promise<Expense>;
      createExpense: (
        expense: Omit<Expense, "id" | "expenseCode" | "createdAt" | "updatedAt">
      ) => Promise<Expense>;
      updateExpense: (
        id: string,
        expense: Partial<Expense>
      ) => Promise<Expense>;
      deleteExpense: (id: string) => Promise<void>;

      getDailyLogs: () => Promise<DailyLog[]>;
      getDailyLog: (id: string) => Promise<DailyLog>;
      createDailyLog: (
        log: Omit<DailyLog, "id" | "createdAt" | "updatedAt">
      ) => Promise<DailyLog>;
      updateDailyLog: (
        id: string,
        log: Partial<DailyLog>
      ) => Promise<DailyLog>;
      deleteDailyLog: (id: string) => Promise<void>;

      getCompanyProfile: () => Promise<CompanyProfile>;
      updateCompanyProfile: (
        profile: Partial<CompanyProfile>
      ) => Promise<CompanyProfile>;

      getStatistics: () => Promise<DashboardStats>;
      getAllData: () => Promise<AccountingData>;
      exportData: () => Promise<void>;
      importData: () => Promise<void>;
      backupDatabase: () => Promise<void>;

      // Database location management
      getDatabaseLocation: () => Promise<string>;
      changeDatabaseLocation: () => Promise<void>;

      // Data management
      clearAllData: () => Promise<void>;

      // App information
      getAppVersion: () => string;
      getPlatform: () => string;
      isElectron: boolean;
    };
  }
}
