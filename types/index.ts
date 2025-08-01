export interface Client {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  hourlyRate: number;
  isActive: boolean;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  description: string;
  startDate: Date;
  status: "active" | "completed" | "on-hold" | "archived";
  budget: number;
  billingTerms: number;
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

export interface Timesheet {
  id: string;
  staffId: string;
  projectId: string;
  month: string; // Format: "YYYY-MM"
  year: number;
  status: "draft" | "submitted" | "approved" | "rejected";
  totalHours: number;
  workingDays: number;
  leaveDays: number;
  submittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  clientId: string;
  projectId: string;
  timesheetId?: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  status: "draft" | "sent" | "paid";
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
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

export interface InvoiceFile {
  id: string;
  invoiceId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  uploadDate: Date;
  month: string; // Format: "YYYY-MM"
  year: number;
  uploadedBy: string;
  filePath: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: Date;
  projectId: string;
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

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  outstandingAmount: number;
  activeProjects: number;
  activeClients: number;
  activeStaff: number;
  pendingTimesheets: number;
  approvedTimesheets: number;
}
