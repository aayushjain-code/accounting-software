// Export all API services
export { AuthService } from "./auth";
export { ClientService } from "./clients";
export { ProjectService } from "./projects";
export { TimesheetService } from "./timesheets";
export { InvoiceService } from "./invoices";
export { ExpenseService } from "./expenses";

// Export types
export type {
  SignUpData,
  SignInData,
  UpdateProfileData,
  PasswordResetData,
  PasswordUpdateData,
} from "./auth";

export type {
  CreateClientData,
  UpdateClientData,
  ClientFilters,
} from "./clients";

export type {
  CreateProjectData,
  UpdateProjectData,
  ProjectFilters,
} from "./projects";

export type {
  CreateTimesheetData,
  UpdateTimesheetData,
  CreateTimesheetEntryData,
  UpdateTimesheetEntryData,
  TimesheetFilters,
} from "./timesheets";

export type {
  CreateInvoiceData,
  UpdateInvoiceData,
  CreateInvoiceItemData,
  UpdateInvoiceItemData,
  InvoiceFilters,
} from "./invoices";

export type {
  CreateExpenseData,
  UpdateExpenseData,
  ExpenseFilters,
} from "./expenses";

// Export migration service
export { DataMigrationService } from "../migration";
export type { MigrationProgress, MigrationResult } from "../migration";
