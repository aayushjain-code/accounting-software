import { supabase } from "@/lib/supabase";
import { Invoice, InvoiceItem } from "@/types";

export interface CreateInvoiceData {
  client_id: string;
  project_id: string;
  timesheet_id?: string;
  issue_date: string;
  due_date: string;
  status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  total: number;
  payment_terms?: string;
  notes?: string;
  terms_conditions?: string;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {}

export interface CreateInvoiceItemData {
  invoice_id: string;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total: number;
  hsn_code?: string;
  unit?: string;
}

export interface UpdateInvoiceItemData extends Partial<CreateInvoiceItemData> {}

export interface InvoiceFilters {
  search?: string;
  status?: string;
  client_id?: string;
  project_id?: string;
  date_from?: string;
  date_to?: string;
  due_date_from?: string;
  due_date_to?: string;
}

export class InvoiceService {
  // Get all invoices with optional filtering
  static async getInvoices(filters: InvoiceFilters = {}, page = 1, limit = 20) {
    try {
      let query = supabase
        .from("invoices")
        .select(
          `
          *,
          client:clients(name, company_name, email),
          project:projects(name),
          timesheet:timesheets(timesheet_code, month, year)
        `
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.search) {
        query = query.or(
          `invoice_number.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
        );
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.client_id) {
        query = query.eq("client_id", filters.client_id);
      }

      if (filters.project_id) {
        query = query.eq("project_id", filters.project_id);
      }

      if (filters.date_from) {
        query = query.gte("issue_date", filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte("issue_date", filters.date_to);
      }

      if (filters.due_date_from) {
        query = query.gte("due_date", filters.due_date_from);
      }

      if (filters.due_date_to) {
        query = query.lte("due_date", filters.due_date_to);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        invoices: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error("Error fetching invoices:", error);
      throw error;
    }
  }

  // Get invoice by ID
  static async getInvoiceById(id: string) {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          *,
          client:clients(*),
          project:projects(*),
          timesheet:timesheets(*),
          items:invoice_items(*)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching invoice:", error);
      throw error;
    }
  }

  // Get invoice by number
  static async getInvoiceByNumber(invoiceNumber: string) {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          *,
          client:clients(name, company_name, email),
          project:projects(name),
          timesheet:timesheets(timesheet_code, month, year)
        `
        )
        .eq("invoice_number", invoiceNumber)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching invoice by number:", error);
      throw error;
    }
  }

  // Create new invoice
  static async createInvoice(invoiceData: CreateInvoiceData) {
    try {
      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();

      const { data, error } = await supabase
        .from("invoices")
        .insert([{ ...invoiceData, invoice_number: invoiceNumber }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw error;
    }
  }

  // Update invoice
  static async updateInvoice(id: string, invoiceData: UpdateInvoiceData) {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .update(invoiceData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating invoice:", error);
      throw error;
    }
  }

  // Delete invoice
  static async deleteInvoice(id: string) {
    try {
      const { error } = await supabase.from("invoices").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
  }

  // Update invoice status
  static async updateInvoiceStatus(
    id: string,
    status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  ) {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating invoice status:", error);
      throw error;
    }
  }

  // Mark invoice as sent
  static async markInvoiceAsSent(id: string) {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .update({ status: "sent" })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error marking invoice as sent:", error);
      throw error;
    }
  }

  // Mark invoice as paid
  static async markInvoiceAsPaid(id: string) {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .update({ status: "paid" })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      throw error;
    }
  }

  // Get invoices by client
  static async getInvoicesByClient(clientId: string) {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          *,
          project:projects(name),
          timesheet:timesheets(timesheet_code, month, year)
        `
        )
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching invoices by client:", error);
      throw error;
    }
  }

  // Get invoices by project
  static async getInvoicesByProject(projectId: string) {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          *,
          client:clients(name, company_name, email),
          timesheet:timesheets(timesheet_code, month, year)
        `
        )
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching invoices by project:", error);
      throw error;
    }
  }

  // Get invoices by status
  static async getInvoicesByStatus(status: string) {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          *,
          client:clients(name, company_name, email),
          project:projects(name)
        `
        )
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching invoices by status:", error);
      throw error;
    }
  }

  // Get overdue invoices
  static async getOverdueInvoices() {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          *,
          client:clients(name, company_name, email),
          project:projects(name)
        `
        )
        .lt("due_date", today)
        .neq("status", "paid")
        .neq("status", "cancelled")
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching overdue invoices:", error);
      throw error;
    }
  }

  // Get invoice statistics
  static async getInvoiceStats() {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("status, subtotal, tax_amount, total");

      if (error) throw error;

      const total = data?.length || 0;
      const draft = data?.filter(i => i.status === "draft").length || 0;
      const sent = data?.filter(i => i.status === "sent").length || 0;
      const paid = data?.filter(i => i.status === "paid").length || 0;
      const overdue = data?.filter(i => i.status === "overdue").length || 0;
      const cancelled = data?.filter(i => i.status === "cancelled").length || 0;

      const totalAmount =
        data?.reduce((sum, i) => sum + (i.total || 0), 0) || 0;
      const paidAmount =
        data
          ?.filter(i => i.status === "paid")
          .reduce((sum, i) => sum + (i.total || 0), 0) || 0;
      const outstandingAmount =
        data
          ?.filter(i => i.status === "sent")
          .reduce((sum, i) => sum + (i.total || 0), 0) || 0;

      return {
        total,
        draft,
        sent,
        paid,
        overdue,
        cancelled,
        totalAmount,
        paidAmount,
        outstandingAmount,
      };
    } catch (error) {
      console.error("Error fetching invoice stats:", error);
      throw error;
    }
  }

  // Search invoices
  static async searchInvoices(searchTerm: string) {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          *,
          client:clients(name, company_name, email),
          project:projects(name)
        `
        )
        .or(`invoice_number.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error searching invoices:", error);
      throw error;
    }
  }

  // Generate invoice from timesheet
  static async generateInvoiceFromTimesheet(timesheetId: string) {
    try {
      // Get timesheet with project and client info
      const { data: timesheet, error: timesheetError } = await supabase
        .from("timesheets")
        .select(
          `
          *,
          project:projects(*, client:clients(*))
        `
        )
        .eq("id", timesheetId)
        .single();

      if (timesheetError) throw timesheetError;

      if (!timesheet.project) {
        throw new Error("Project not found for timesheet");
      }

      if (!timesheet.project.client) {
        throw new Error("Client not found for project");
      }

      // Calculate invoice amounts
      const subtotal = timesheet.total_amount || 0;
      const taxRate = 18; // Default 18% GST
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      // Create invoice
      const invoiceData: CreateInvoiceData = {
        client_id: timesheet.project.client.id,
        project_id: timesheet.project.id,
        timesheet_id: timesheet.id,
        issue_date: new Date().toISOString().split("T")[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // 30 days from now
        status: "draft",
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        payment_terms: "Net 30",
        notes: `Invoice generated from timesheet ${timesheet.timesheet_code}`,
        terms_conditions: "Payment is due within 30 days of invoice date.",
      };

      const invoice = await this.createInvoice(invoiceData);

      // Create invoice item from timesheet
      const itemData: CreateInvoiceItemData = {
        invoice_id: invoice.id,
        title: `Professional services for ${timesheet.month}/${timesheet.year}`,
        description: `Timesheet ${timesheet.timesheet_code} - ${timesheet.total_hours || 0} hours`,
        quantity: timesheet.total_hours || 0,
        unit_price: timesheet.billing_rate || 0,
        total: timesheet.total_amount || 0,
        hsn_code: "998314", // Professional services
        unit: "Hours",
      };

      await this.addInvoiceItem(itemData);

      // Mark timesheet as invoiced
      await supabase
        .from("timesheets")
        .update({ status: "invoiced" })
        .eq("id", timesheetId);

      return invoice;
    } catch (error) {
      console.error("Error generating invoice from timesheet:", error);
      throw error;
    }
  }

  // Invoice Items Management
  static async addInvoiceItem(itemData: CreateInvoiceItemData) {
    try {
      const { data, error } = await supabase
        .from("invoice_items")
        .insert([itemData])
        .select()
        .single();

      if (error) throw error;

      // Update invoice totals
      await this.updateInvoiceTotals(itemData.invoice_id);

      return data;
    } catch (error) {
      console.error("Error adding invoice item:", error);
      throw error;
    }
  }

  static async updateInvoiceItem(id: string, itemData: UpdateInvoiceItemData) {
    try {
      const { data, error } = await supabase
        .from("invoice_items")
        .update(itemData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update invoice totals
      if (data.invoice_id) {
        await this.updateInvoiceTotals(data.invoice_id);
      }

      return data;
    } catch (error) {
      console.error("Error updating invoice item:", error);
      throw error;
    }
  }

  static async deleteInvoiceItem(id: string) {
    try {
      const item = await supabase
        .from("invoice_items")
        .select("invoice_id")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("invoice_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Update invoice totals
      if (item.data?.invoice_id) {
        await this.updateInvoiceTotals(item.data.invoice_id);
      }

      return true;
    } catch (error) {
      console.error("Error deleting invoice item:", error);
      throw error;
    }
  }

  // Get invoice items
  static async getInvoiceItems(invoiceId: string) {
    try {
      const { data, error } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching invoice items:", error);
      throw error;
    }
  }

  // Update invoice totals
  static async updateInvoiceTotals(invoiceId: string) {
    try {
      const items = await this.getInvoiceItems(invoiceId);

      const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
      const taxRate = 18; // Default 18% GST
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      const { data, error } = await supabase
        .from("invoices")
        .update({
          subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total,
        })
        .eq("id", invoiceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating invoice totals:", error);
      throw error;
    }
  }

  // Generate unique invoice number
  private static async generateInvoiceNumber(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("invoice_number")
        .order("invoice_number", { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastNumber = data[0].invoice_number;
        const match = lastNumber.match(/INV-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, "0");
      return `INV-${year}${month}-${String(nextNumber).padStart(4, "0")}`;
    } catch (error) {
      console.error("Error generating invoice number:", error);
      // Fallback to timestamp-based number
      return `INV-${Date.now()}`;
    }
  }

  // Bulk operations
  static async bulkUpdateInvoices(
    updates: Array<{ id: string; data: UpdateInvoiceData }>
  ) {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .upsert(updates.map(({ id, data }) => ({ id, ...data })))
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error bulk updating invoices:", error);
      throw error;
    }
  }

  static async bulkDeleteInvoices(ids: string[]) {
    try {
      const { error } = await supabase.from("invoices").delete().in("id", ids);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error bulk deleting invoices:", error);
      throw error;
    }
  }
}
