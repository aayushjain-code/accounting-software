import { Client, Project, Invoice, Timesheet } from "./index";

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

export interface RevenueStats {
  monthly: MonthlyRevenue[];
  yearly: YearlyRevenue[];
  byClient: ClientRevenue[];
  byProject: ProjectRevenue[];
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface YearlyRevenue {
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
  growth: number; // Percentage growth from previous year
}

export interface ClientRevenue {
  clientId: string;
  clientName: string;
  totalRevenue: number;
  projectCount: number;
  averageProjectValue: number;
}

export interface ProjectRevenue {
  projectId: string;
  projectName: string;
  clientName: string;
  totalRevenue: number;
  status: Project["status"];
  completionPercentage: number;
}

export interface ExpenseStats {
  total: number;
  byCategory: ExpenseByCategory[];
  monthly: MonthlyExpense[];
  trends: ExpenseTrend[];
}

export interface ExpenseByCategory {
  category: string;
  amount: number;
  percentage: number;
}

export interface MonthlyExpense {
  month: string;
  amount: number;
  category: string;
}

export interface ExpenseTrend {
  period: string;
  amount: number;
  change: number; // Percentage change from previous period
}

export interface ProjectStats {
  total: number;
  byStatus: Record<Project["status"], number>;
  byClient: Record<string, number>;
  completionRate: number;
  averageDuration: number;
}

export interface ClientStats {
  total: number;
  byStatus: Record<Client["status"], number>;
  bySize: Record<string, number>;
  byIndustry: Record<string, number>;
  retentionRate: number;
}

export interface TimesheetStats {
  total: number;
  byStatus: Record<Timesheet["status"], number>;
  byProject: Record<string, number>;
  averageHoursPerDay: number;
  approvalRate: number;
}

export interface InvoiceStats {
  total: number;
  byStatus: Record<Invoice["status"], number>;
  byClient: Record<string, number>;
  collectionRate: number;
  averageDaysToPayment: number;
}

export interface DashboardFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  clientId?: string;
  projectId?: string;
  category?: string;
  status?: string;
}

export interface DashboardWidget {
  id: string;
  type: "chart" | "metric" | "table" | "list";
  title: string;
  data: unknown;
  config?: Record<string, unknown>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
