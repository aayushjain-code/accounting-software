import { supabase } from "@/lib/supabase";

export interface CreateInvoiceData {
  client_id: string;
  project_id?: string | null;
  invoice_number?: string;
  issue_date?: string;
  due_date?: string;
  status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  subtotal?: number;
  tax_rate?: number;
  tax_amount?: number;
  total_amount?: number;
  notes?: string;
  terms?: string;
  payment_instructions?: string;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {}

export interface CreateInvoiceItemData {
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type?: string;
  timesheet_id?: string;
}

export interface UpdateInvoiceItemData extends Partial<CreateInvoiceItemData> {}

// Extend this interface for additional invoice-specific filters
export interface InvoiceFilters extends BaseFilters {
  // Add invoice-specific filters here when needed
}

// Extend this interface for additional invoice item-specific filters
export interface InvoiceItemFilters extends BaseFilters {
  // Add invoice item-specific filters here when needed
}

export class InvoiceService {
  // Get all invoices with optional filtering and pagination
  static async getInvoices(
    filters: InvoiceFilters = {},
    page = 1,
    limit = 20
  ): Promise<{ data: any[]; totalPages: number; page: number; limit: number }> {
    try {
      let query = supabase
        .from("invoices")
        .select(
          `
          *,
          client:clients(name, company_name, email),
          project:projects(name, billing_rate)
        `
        )
        .order("issue_date", { ascending: false });

      // Apply filters
      if (filters.client_id) {
        query = query.eq("client_id", filters.client_id);
      }

      if (filters.project_id) {
        query = query.eq("project_id", filters.project_id);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.issue_date_from) {
        query = query.gte("issue_date", filters.issue_date_from);
      }

      if (filters.issue_date_to) {
        query = query.lte("issue_date", filters.issue_date_to);
      }

      if (filters.due_date_from) {
        query = query.gte("due_date", filters.due_date_from);
      }

      if (filters.due_date_to) {
        query = query.lte("due_date", filters.due_date_to);
      }

      if (filters.amount_min) {
        query = query.gte("total_amount", filters.amount_min);
      }

      if (filters.amount_max) {
        query = query.lte("total_amount", filters.amount_max);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        data: data || [],
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
  static async getInvoiceById(id: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          *,
          client:clients(*),
          project:projects(*),
          items:invoice_items(*)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error fetching invoice:", error);
      throw error;
    }
  }

  // Get invoice by invoice number
  static async getInvoiceByNumber(invoiceNumber: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          *,
          client:clients(*),
          project:projects(*),
          items:invoice_items(*)
        `
        )
        .eq("invoice_number", invoiceNumber)
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error fetching invoice by number:", error);
      throw error;
    }
  }

  // Create new invoice
  static async createInvoice(invoiceData: CreateInvoiceData): Promise<any> {
    try {
      // Generate invoice number if not provided
      if (!invoiceData.invoice_number) {
        invoiceData.invoice_number = await this.generateInvoiceNumber();
      }

      const { data, error } = await supabase
        .from("invoices")
        .insert([invoiceData])
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw error;
    }
  }

  // Update existing invoice
  static async updateInvoice(id: string, invoiceData: UpdateInvoiceData): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .update(invoiceData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error updating invoice:", error);
      throw error;
    }
  }

  // Delete invoice
  static async deleteInvoice(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("invoices").delete().eq("id", id);

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
  }

  // Mark invoice as paid
  static async markInvoiceAsPaid(id: string, paymentDate?: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .update({
          status: "paid",
          paid_date: paymentDate || new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      throw error;
    }
  }

  // Generate invoice from timesheet
  static async generateInvoiceFromTimesheet(
    timesheetId: string,
    clientId: string,
    projectId?: string
  ): Promise<any> {
    try {
      // Get timesheet data
      const { data: timesheet, error: timesheetError } = await supabase
        .from("timesheets")
        .select("*")
        .eq("id", timesheetId)
        .single();

      if (timesheetError) {
        throw timesheetError;
      }

      // Get timesheet entries
      const { data: entries, error: entriesError } = await supabase
        .from("timesheet_entries")
        .select("*")
        .eq("timesheet_id", timesheetId);

      if (entriesError) {
        throw entriesError;
      }

      // Calculate totals
      const subtotal = entries?.reduce((sum, entry) => sum + (entry.total_price || 0), 0) || 0;
      const taxRate = 0.1; // 10% tax rate - you can make this configurable
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount;

      // Create invoice
      const invoiceData: CreateInvoiceData = {
        client_id: clientId,
        project_id: projectId || null,
        issue_date: new Date().toISOString().split("T")[0] || "",
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] || "", // 30 days from now
        status: "draft",
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        notes: `Generated from timesheet ${timesheet.timesheet_code}`,
      };

      const invoice = await this.createInvoice(invoiceData);

      // Create invoice items from timesheet entries
      if (entries) {
        for (const entry of entries) {
          await this.addInvoiceItem({
            invoice_id: invoice.id,
            description: entry.description,
            quantity: entry.hours,
            unit_price: entry.hourly_rate || 0,
            total_price: entry.hours * (entry.hourly_rate || 0),
            item_type: "time",
            timesheet_id: timesheetId,
          });
        }
      }

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

  // Add invoice item
  static async addInvoiceItem(itemData: CreateInvoiceItemData): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("invoice_items")
        .insert([itemData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update invoice totals
      await this.updateInvoiceTotals(itemData.invoice_id);

      return data;
    } catch (error) {
      console.error("Error adding invoice item:", error);
      throw error;
    }
  }

  // Update invoice item
  static async updateInvoiceItem(id: string, itemData: UpdateInvoiceItemData): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("invoice_items")
        .update(itemData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

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

  // Delete invoice item
  static async deleteInvoiceItem(id: string): Promise<boolean> {
    try {
      const item = await supabase
        .from("invoice_items")
        .select("invoice_id")
        .eq("id", id)
        .single();

      const { error } = await supabase.from("invoice_items").delete().eq("id", id);

      if (error) {
        throw error;
      }

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
  static async getInvoiceItems(invoiceId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error("Error fetching invoice items:", error);
      throw error;
    }
  }

  // Update invoice totals
  private static async updateInvoiceTotals(invoiceId: string): Promise<void> {
    try {
      const items = await this.getInvoiceItems(invoiceId);

      const subtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
      const taxRate = 0.1; // 10% tax rate - you can make this configurable
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount;

      await supabase
        .from("invoices")
        .update({
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
        })
        .eq("id", invoiceId);
    } catch (error) {
      console.error("Error updating invoice totals:", error);
    }
  }

  // Get invoices by client
  static async getInvoicesByClient(clientId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          *,
          project:projects(name, billing_rate)
        `
        )
        .eq("client_id", clientId)
        .order("issue_date", { ascending: false });

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error("Error fetching invoices by client:", error);
      throw error;
    }
  }

  // Get invoices by project
  static async getInvoicesByProject(projectId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          *,
          client:clients(name, company_name, email)
        `
        )
        .eq("project_id", projectId)
        .order("issue_date", { ascending: false });

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error("Error fetching invoices by project:", error);
      throw error;
    }
  }

  // Get invoices by status
  static async getInvoicesByStatus(status: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          *,
          client:clients(name, company_name, email),
          project:projects(name, billing_rate)
        `
        )
        .eq("status", status)
        .order("issue_date", { ascending: false });

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error("Error fetching invoices by status:", error);
      throw error;
    }
  }

  // Get overdue invoices
  static async getOverdueInvoices(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          *,
          client:clients(name, company_name, email),
          project:projects(name, billing_rate)
        `
        )
        .lt("due_date", new Date().toISOString().split("T")[0])
        .neq("status", "paid")
        .neq("status", "cancelled")
        .order("due_date", { ascending: true });

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error("Error fetching overdue invoices:", error);
      throw error;
    }
  }

  // Get invoice statistics
  static async getInvoiceStats(): Promise<{
    total: number;
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
    cancelled: number;
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
  }> {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("status, total_amount");

      if (error) {
        throw error;
      }

      const total = data?.length || 0;
      const draft = data?.filter(i => i.status === "draft").length || 0;
      const sent = data?.filter(i => i.status === "sent").length || 0;
      const paid = data?.filter(i => i.status === "paid").length || 0;
      const overdue = data?.filter(i => i.status === "overdue").length || 0;
      const cancelled = data?.filter(i => i.status === "cancelled").length || 0;
      const totalAmount = data?.reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;
      const paidAmount =
        data?.filter(i => i.status === "paid").reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;
      const outstandingAmount = totalAmount - paidAmount;

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
  static async searchInvoices(searchTerm: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          *,
          client:clients(name, company_name, email),
          project:projects(name, billing_rate)
        `
        )
        .or(`invoice_number.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)
        .order("issue_date", { ascending: false });

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error("Error searching invoices:", error);
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

      if (error) {
        throw error;
      }

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastNumber = data[0]?.invoice_number;
        if (lastNumber) {
          const match = lastNumber.match(/INV-(\d+)/);
          if (match) {
            nextNumber = parseInt(match[1]) + 1;
          }
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
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .upsert(updates.map(({ id, data }) => ({ id, ...data })))
        .select();

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error("Error bulk updating invoices:", error);
      throw error;
    }
  }

  static async bulkDeleteInvoices(ids: string[]): Promise<boolean> {
    try {
      const { error } = await supabase.from("invoices").delete().in("id", ids);

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Error bulk deleting invoices:", error);
      throw error;
    }
  }
}
