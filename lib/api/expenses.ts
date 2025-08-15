import { supabase } from "@/lib/supabase";

export interface CreateExpenseData {
  user_id: string;
  project_id?: string;
  client_id?: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  receipt_path?: string;
  status?: "pending" | "approved" | "rejected";
  notes?: string;
  tags?: string[];
  billable?: boolean;
  reimbursable?: boolean;
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {}

export interface ExpenseFilters {
  user_id?: string;
  project_id?: string;
  client_id?: string;
  category?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  billable?: boolean;
  reimbursable?: boolean;
}

export class ExpenseService {
  // Get all expenses with optional filtering and pagination
  static async getExpenses(
    filters: ExpenseFilters = {},
    page = 1,
    limit = 20
  ): Promise<{ data: any[]; totalPages: number; page: number; limit: number }> {
    try {
      let query = supabase
        .from("expenses")
        .select(
          `
          *,
          user:user_profiles(first_name, last_name, email),
          project:projects(name, billing_rate),
          client:clients(name, company_name)
        `
        )
        .order("date", { ascending: false });

      // Apply filters
      if (filters.user_id) {
        query = query.eq("user_id", filters.user_id);
      }

      if (filters.project_id) {
        query = query.eq("project_id", filters.project_id);
      }

      if (filters.client_id) {
        query = query.eq("client_id", filters.client_id);
      }

      if (filters.category) {
        query = query.eq("category", filters.category);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.date_from) {
        query = query.gte("date", filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte("date", filters.date_to);
      }

      if (filters.amount_min) {
        query = query.gte("amount", filters.amount_min);
      }

      if (filters.amount_max) {
        query = query.lte("amount", filters.amount_max);
      }

      if (filters.billable !== undefined) {
        query = query.eq("billable", filters.billable);
      }

      if (filters.reimbursable !== undefined) {
        query = query.eq("reimbursable", filters.reimbursable);
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
      console.error("Error fetching expenses:", error);
      throw error;
    }
  }

  // Get expense by ID
  static async getExpenseById(id: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          user:user_profiles(*),
          project:projects(*),
          client:clients(*)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error fetching expense:", error);
      throw error;
    }
  }

  // Get expense by expense code
  static async getExpenseByCode(expenseCode: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          user:user_profiles(*),
          project:projects(*),
          client:clients(*)
        `
        )
        .eq("expense_code", expenseCode)
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error fetching expense by code:", error);
      throw error;
    }
  }

  // Create new expense
  static async createExpense(expenseData: CreateExpenseData): Promise<any> {
    try {
      // Generate expense code
      const expenseCode = await this.generateExpenseCode();

      const { data, error } = await supabase
        .from("expenses")
        .insert([{ ...expenseData, expense_code: expenseCode }])
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error creating expense:", error);
      throw error;
    }
  }

  // Update existing expense
  static async updateExpense(id: string, expenseData: UpdateExpenseData): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .update(expenseData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  }

  // Delete expense
  static async deleteExpense(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id);

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  }

  // Approve expense
  static async approveExpense(id: string, approverId: string, approvalNotes?: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: approverId,
          approval_notes: approvalNotes,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error approving expense:", error);
      throw error;
    }
  }

  // Reject expense
  static async rejectExpense(id: string, approverId: string, rejectionReason: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .update({
          status: "rejected",
          rejected_at: new Date().toISOString(),
          approved_by: approverId,
          rejection_reason: rejectionReason,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error rejecting expense:", error);
      throw error;
    }
  }

  // Upload receipt
  static async uploadReceipt(expenseId: string, file: File): Promise<any> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${expenseId}-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("receipts")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Update expense with receipt path
      const { data: expenseData, error: updateError } = await supabase
        .from("expenses")
        .update({ receipt_path: fileName })
        .eq("id", expenseId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return expenseData;
    } catch (error) {
      console.error("Error uploading receipt:", error);
      throw error;
    }
  }

  // Delete receipt
  static async deleteReceipt(expenseId: string): Promise<boolean> {
    try {
      const expense = await this.getExpenseById(expenseId);
      if (!expense.receipt_path) {
        return true;
      }

      const { error } = await supabase.storage
        .from("receipts")
        .remove([expense.receipt_path]);

      if (error) {
        throw error;
      }

      // Update expense to remove receipt path
      await supabase
        .from("expenses")
        .update({ receipt_path: null })
        .eq("id", expenseId);

      return true;
    } catch (error) {
      console.error("Error deleting receipt:", error);
      throw error;
    }
  }

  // Get expenses by user
  static async getExpensesByUser(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          project:projects(name, billing_rate),
          client:clients(name, company_name)
        `
        )
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error("Error fetching expenses by user:", error);
      throw error;
    }
  }

  // Get expenses by project
  static async getExpensesByProject(projectId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          user:user_profiles(first_name, last_name, email),
          client:clients(name, company_name)
        `
        )
        .eq("project_id", projectId)
        .order("date", { ascending: false });

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error("Error fetching expenses by project:", error);
      throw error;
    }
  }

  // Get expenses by client
  static async getExpensesByClient(clientId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          user:user_profiles(first_name, last_name, email),
          project:projects(name, billing_rate)
        `
        )
        .eq("client_id", clientId)
        .order("date", { ascending: false });

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error("Error fetching expenses by client:", error);
      throw error;
    }
  }

  // Get expenses by status
  static async getExpensesByStatus(status: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          user:user_profiles(first_name, last_name, email),
          project:projects(name, billing_rate),
          client:clients(name, company_name)
        `
        )
        .eq("status", status)
        .order("date", { ascending: false });

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error("Error fetching expenses by status:", error);
      throw error;
    }
  }

  // Get expenses by category
  static async getExpensesByCategory(category: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          user:user_profiles(first_name, last_name, email),
          project:projects(name, billing_rate),
          client:clients(name, company_name)
        `
        )
        .eq("category", category)
        .order("date", { ascending: false });

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error("Error fetching expenses by category:", error);
      throw error;
    }
  }

  // Get expense statistics
  static async getExpenseStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalAmount: number;
    approvedAmount: number;
    pendingAmount: number;
    billableAmount: number;
    reimbursableAmount: number;
    categoryBreakdown: Record<string, number>;
    monthlyBreakdown: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("status, amount, category, date, billable, reimbursable");

      if (error) {
        throw error;
      }

      const total = data?.length || 0;
      const pending = data?.filter(e => e.status === "pending").length || 0;
      const approved = data?.filter(e => e.status === "approved").length || 0;
      const rejected = data?.filter(e => e.status === "rejected").length || 0;
      const totalAmount = data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const approvedAmount =
        data?.filter(e => e.status === "approved").reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const pendingAmount =
        data?.filter(e => e.status === "pending").reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const billableAmount =
        data?.filter(e => e.billable).reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const reimbursableAmount =
        data?.filter(e => e.reimbursable).reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      // Category breakdown
      const categoryBreakdown: Record<string, number> = {};
      data?.forEach(expense => {
        const category = expense.category || "Uncategorized";
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + (expense.amount || 0);
      });

      // Monthly breakdown
      const monthlyBreakdown: Record<string, number> = {};
      data?.forEach(expense => {
        const month = expense.date?.substring(0, 7) || "Unknown";
        monthlyBreakdown[month] = (monthlyBreakdown[month] || 0) + (expense.amount || 0);
      });

      return {
        total,
        pending,
        approved,
        rejected,
        totalAmount,
        approvedAmount,
        pendingAmount,
        billableAmount,
        reimbursableAmount,
        categoryBreakdown,
        monthlyBreakdown,
      };
    } catch (error) {
      console.error("Error fetching expense stats:", error);
      throw error;
    }
  }

  // Search expenses
  static async searchExpenses(searchTerm: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          user:user_profiles(first_name, last_name, email),
          project:projects(name, billing_rate),
          client:clients(name, company_name)
        `
        )
        .or(`description.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)
        .order("date", { ascending: false });

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error("Error searching expenses:", error);
      throw error;
    }
  }

  // Generate unique expense code
  private static async generateExpenseCode(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("expense_code")
        .order("expense_code", { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastCode = data[0]?.expense_code;
        if (lastCode) {
          const match = lastCode.match(/EXP-(\d+)/);
          if (match) {
            nextNumber = parseInt(match[1]) + 1;
          }
        }
      }

      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, "0");
      return `EXP-${year}${month}-${String(nextNumber).padStart(4, "0")}`;
    } catch (error) {
      console.error("Error generating expense code:", error);
      // Fallback to timestamp-based code
      return `EXP-${Date.now()}`;
    }
  }

  // Bulk operations
  static async bulkUpdateExpenses(
    updates: Array<{ id: string; data: UpdateExpenseData }>
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .upsert(updates.map(({ id, data }) => ({ id, ...data })))
        .select();

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error("Error bulk updating expenses:", error);
      throw error;
    }
  }

  static async bulkDeleteExpenses(ids: string[]): Promise<boolean> {
    try {
      const { error } = await supabase.from("expenses").delete().in("id", ids);

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Error bulk deleting expenses:", error);
      throw error;
    }
  }

  // Bulk approve expenses
  static async bulkApproveExpenses(ids: string[], approvedBy: string) {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: approvedBy,
        })
        .in("id", ids)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error bulk approving expenses:", error);
      throw error;
    }
  }

  // Bulk reject expenses
  static async bulkRejectExpenses(
    ids: string[],
    approvedBy: string,
    rejectionReason: string
  ) {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .update({
          status: "rejected",
          approved_at: new Date().toISOString(),
          approved_by: approvedBy,
          rejection_reason: rejectionReason,
        })
        .in("id", ids)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error bulk rejecting expenses:", error);
      throw error;
    }
  }

  // Get receipt URL
  static getReceiptUrl(receiptPath: string | null): string | null {
    if (!receiptPath) {
      return null;
    }

    const { data } = supabase.storage.from("receipts").getPublicUrl(receiptPath);
    return data.publicUrl;
  }

  // Export expenses to CSV
  static async exportExpensesToCSV(filters: ExpenseFilters = {}): Promise<string> {
    try {
      const { data } = await this.getExpenses(filters, 1, 10000); // Get all expenses

      if (!data || data.length === 0) {
        return "No expenses found";
      }

      const headers = [
        "Expense Code",
        "Date",
        "Category",
        "Description",
        "Amount",
        "Status",
        "User",
        "Project",
        "Client",
        "Billable",
        "Reimbursable",
        "Notes",
      ];

      const csvRows = [headers.join(",")];

      for (const expense of data) {
        const row = [
          expense.expense_code || "",
          expense.date || "",
          expense.category || "",
          `"${(expense.description || "").replace(/"/g, '""')}"`,
          expense.amount || 0,
          expense.status || "",
          expense.user ? `${expense.user.first_name} ${expense.user.last_name}` : "",
          expense.project?.name || "",
          expense.client?.name || "",
          expense.billable ? "Yes" : "No",
          expense.reimbursable ? "Yes" : "No",
          `"${(expense.notes || "").replace(/"/g, '""')}"`,
        ];
        csvRows.push(row.join(","));
      }

      return csvRows.join("\n");
    } catch (error) {
      console.error("Error exporting expenses to CSV:", error);
      throw error;
    }
  }
}
