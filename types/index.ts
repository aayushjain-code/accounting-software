export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  taxId: string;
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
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  status: "active" | "completed" | "on-hold";
  budget: number;
  hourlyRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  clientId: string;
  projectId?: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  status: "draft" | "sent" | "paid" | "overdue";
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string;
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

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: Date;
  receipt?: string;
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialReport {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  outstandingInvoices: number;
  paidInvoices: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  outstandingAmount: number;
  activeProjects: number;
  activeClients: number;
  activeStaff: number;
}
