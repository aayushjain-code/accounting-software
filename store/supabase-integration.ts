// Supabase integration utilities for the store
import { InvoiceService } from "@/lib/api/invoices";
import { TimesheetService } from "@/lib/api/timesheets";

// Safe date conversion that never returns undefined
export const safeDateToString = (date: Date | undefined): string => {
  if (!date) {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    return dateStr || today.toISOString().substring(0, 10);
  }
  try {
    const dateStr = date.toISOString().split("T")[0];
    return dateStr || date.toISOString().substring(0, 10);
  } catch {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    return dateStr || today.toISOString().substring(0, 10);
  }
};

// Get default due date (30 days from now)
export const getDefaultDueDate = (): string => {
  try {
    const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    return dateStr || date.toISOString().substring(0, 10);
  } catch {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    return dateStr || today.toISOString().substring(0, 10);
  }
};

// Create timesheet in Supabase
export const createTimesheetInSupabase = async (timesheet: any) => {
  try {
    const supabaseTimesheet = {
      user_id: "default-user-id", // TODO: Get from auth context
      project_id: timesheet.projectId || "",
      week_start_date: timesheet.month || "",
      week_end_date: timesheet.month || "",
      status: timesheet.status || "draft",
      notes: "",
      total_hours: timesheet.totalHours || 0,
      total_amount: timesheet.totalAmount || 0,
    };

    return await TimesheetService.createTimesheet(supabaseTimesheet);
  } catch (error) {
    console.error("Failed to create timesheet in Supabase:", error);
    return null;
  }
};

// Update timesheet in Supabase
export const updateTimesheetInSupabase = async (id: string, timesheet: any) => {
  try {
    const supabaseTimesheet = {
      user_id: "default-user-id", // TODO: Get from auth context
      project_id: timesheet.projectId || "",
      week_start_date: timesheet.month || "",
      week_end_date: timesheet.month || "",
      status: timesheet.status || "draft",
      notes: "",
      total_hours: timesheet.totalHours || 0,
      total_amount: timesheet.totalAmount || 0,
    };

    return await TimesheetService.updateTimesheet(id, supabaseTimesheet);
  } catch (error) {
    console.error("Failed to update timesheet in Supabase:", error);
    return null;
  }
};

// Create invoice in Supabase
export const createInvoiceInSupabase = async (invoice: any, invoiceNumber: string) => {
  try {
    const supabaseInvoice = {
      client_id: invoice.clientId || "",
      project_id: invoice.projectId || "",
      invoice_number: invoiceNumber,
      issue_date: safeDateToString(invoice.issueDate),
      due_date: safeDateToString(invoice.dueDate) || getDefaultDueDate(),
      status: invoice.status || "draft",
      subtotal: invoice.subtotal || 0,
      tax_rate: invoice.taxRate || 0,
      tax_amount: invoice.taxAmount || 0,
      total_amount: invoice.total || 0,
      notes: invoice.notes || "",
      terms: invoice.paymentTerms || "",
      payment_instructions: "",
    };

    return await InvoiceService.createInvoice(supabaseInvoice);
  } catch (error) {
    console.error("Failed to create invoice in Supabase:", error);
    return null;
  }
};

// Update invoice in Supabase
export const updateInvoiceInSupabase = async (id: string, invoice: any) => {
  try {
    const supabaseInvoice = {
      client_id: invoice.clientId || "",
      project_id: invoice.projectId || "",
      invoice_number: invoice.invoiceNumber || "",
      issue_date: safeDateToString(invoice.issueDate),
      due_date: safeDateToString(invoice.dueDate) || getDefaultDueDate(),
      status: invoice.status || "draft",
      subtotal: invoice.subtotal || 0,
      tax_rate: invoice.taxRate || 0,
      tax_amount: invoice.taxAmount || 0,
      total_amount: invoice.total || 0,
      notes: invoice.notes || "",
      terms: invoice.paymentTerms || "",
      payment_instructions: "",
    };

    return await InvoiceService.updateInvoice(id, supabaseInvoice);
  } catch (error) {
    console.error("Failed to update invoice in Supabase:", error);
    return null;
  }
};
