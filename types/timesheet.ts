import { BaseEntity, StatusOptions, FileAttachment } from "./common";

export interface Timesheet extends BaseEntity {
  timesheetCode: string; // TMS-YYYY-MM-XXXX format
  projectId: string;
  month: string; // Format: "YYYY-MM"
  year: number;
  status: StatusOptions["draft"] | StatusOptions["submitted"] | StatusOptions["approved"] | StatusOptions["rejected"] | StatusOptions["invoiced"];
  
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
  
  // Entries for detailed time tracking
  entries?: TimesheetEntry[];
}

export interface TimesheetEntry extends BaseEntity {
  timesheetId: string;
  date: Date;
  day: string;
  task: string;
  hours: number;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
}

export interface TimesheetFile extends FileAttachment {
  timesheetId: string;
}

export interface TimesheetFormData {
  projectId: string;
  month: string;
  year: number;
  daysWorked: string;
  hoursPerDay: string;
  totalWorkingDays: string;
  status: Timesheet["status"];
  entries?: Omit<TimesheetEntry, "id" | "timesheetId" | "createdAt" | "updatedAt">[];
}

export interface TimesheetFilters {
  status?: Timesheet["status"];
  projectId?: string;
  month?: string;
  year?: number;
  approvedBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}

export interface TimesheetStats {
  totalTimesheets: number;
  submittedTimesheets: number;
  approvedTimesheets: number;
  rejectedTimesheets: number;
  totalHours: number;
  totalAmount: number;
  averageHoursPerDay: number;
}

export interface WorkDay {
  date: Date;
  dayOfWeek: string;
  isWeekend: boolean;
  isHoliday: boolean;
  hoursWorked: number;
  tasks: string[];
}
