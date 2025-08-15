// Common types used across the application

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileAttachment extends BaseEntity {
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  uploadDate: Date;
  uploadedBy: string;
  filePath: string;
}

export interface StatusOptions {
  active: "active";
  inactive: "inactive";
  completed: "completed";
  onHold: "on-hold";
  archived: "archived";
  draft: "draft";
  sent: "sent";
  paid: "paid";
  submitted: "submitted";
  approved: "approved";
  rejected: "rejected";
  invoiced: "invoiced";
}

export interface CompanySize {
  startup: "startup";
  small: "small";
  medium: "medium";
  large: "large";
  enterprise: "enterprise";
}

export interface ClientStatus {
  active: "active";
  inactive: "inactive";
  prospect: "prospect";
  lead: "lead";
}

export interface TaxType {
  igst: "igst";
  sgstCgst: "sgst-cgst";
  noGst: "no-gst";
}

export interface Currency {
  symbol: "₹";
  code: "INR";
  name: "Indian Rupee";
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

export interface SearchParams {
  query: string;
  filters?: Record<string, unknown>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string;
}

// Legacy types that need to be migrated
export interface ExpenseFile extends FileAttachment {
  expenseId: string;
}

export interface DailyLogFile extends FileAttachment {
  dailyLogId: string;
}

export interface FinancialReport extends BaseEntity {
  title: string;
  type: "monthly" | "quarterly" | "annual";
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

export interface AccountingData {
  clients: any[];
  projects: any[];
  timesheets: any[];
  invoices: any[];
  expenses: any[];
  dailyLogs: any[];
  companyProfile: any;
}
