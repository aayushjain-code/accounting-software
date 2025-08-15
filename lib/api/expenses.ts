import { supabase } from "@/lib/supabase";
import { Expense } from "@/types";

export interface CreateExpenseData {
  description: string;
  amount: number;
  category: string;
  date: string;
  project_id?: string;
  status?: "pending" | "approved" | "rejected";
  receipt?: string;
  notes?: string;
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {}

export interface ExpenseFilters {
  search?: string;
  status?: string;
  category?: string;
  project_id?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
}

export class ExpenseService {
  // Get all expenses with optional filtering
  static async getExpenses(filters: ExpenseFilters = {}, page = 1, limit = 20) {
    try {
      let query = supabase
        .from("expenses")
        .select(
          `
          *,
          project:projects(name, client:clients(name, company_name))
        `
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.search) {
        query = query.or(
          `description.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
        );
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.category) {
        query = query.eq("category", filters.category);
      }

      if (filters.project_id) {
        query = query.eq("project_id", filters.project_id);
      }

      if (filters.date_from) {
        query = query.gte("date", filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte("date", filters.date_to);
      }

      if (filters.amount_min !== undefined) {
        query = query.gte("amount", filters.amount_min);
      }

      if (filters.amount_max !== undefined) {
        query = query.lte("amount", filters.amount_max);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        expenses: data || [],
        total: count || 0,
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
  static async getExpenseById(id: string) {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          project:projects(*, client:clients(name, company_name)),
          approved_by_user:user_profiles!approved_by(first_name, last_name, email)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching expense:", error);
      throw error;
    }
  }

  // Get expense by code
  static async getExpenseByCode(expenseCode: string) {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          project:projects(name, client:clients(name, company_name))
        `
        )
        .eq("expense_code", expenseCode)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching expense by code:", error);
      throw error;
    }
  }

  // Create new expense
  static async createExpense(expenseData: CreateExpenseData) {
    try {
      // Generate expense code
      const expenseCode = await this.generateExpenseCode();

      const { data, error } = await supabase
        .from("expenses")
        .insert([{ ...expenseData, expense_code: expenseCode }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating expense:", error);
      throw error;
    }
  }

  // Update expense
  static async updateExpense(id: string, expenseData: UpdateExpenseData) {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .update(expenseData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  }

  // Delete expense
  static async deleteExpense(id: string) {
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  }

  // Approve expense
  static async approveExpense(id: string, approvedBy: string) {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: approvedBy,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error approving expense:", error);
      throw error;
    }
  }

  // Reject expense
  static async rejectExpense(
    id: string,
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
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error rejecting expense:", error);
      throw error;
    }
  }

  // Get expenses by project
  static async getExpensesByProject(projectId: string) {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching expenses by project:", error);
      throw error;
    }
  }

  // Get expenses by status
  static async getExpensesByStatus(status: string) {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          project:projects(name, client:clients(name, company_name))
        `
        )
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching expenses by status:", error);
      throw error;
    }
  }

  // Get expenses by category
  static async getExpensesByCategory(category: string) {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          project:projects(name, client:clients(name, company_name))
        `
        )
        .eq("category", category)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching expenses by category:", error);
      throw error;
    }
  }

  // Get pending expenses (for approval)
  static async getPendingExpenses() {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          project:projects(name, client:clients(name, company_name))
        `
        )
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching pending expenses:", error);
      throw error;
    }
  }

  // Get expenses by date range
  static async getExpensesByDateRange(startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          project:projects(name, client:clients(name, company_name))
        `
        )
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching expenses by date range:", error);
      throw error;
    }
  }

  // Get expense statistics
  static async getExpenseStats() {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("status, amount, category, date");

      if (error) throw error;

      const total = data?.length || 0;
      const pending = data?.filter(e => e.status === "pending").length || 0;
      const approved = data?.filter(e => e.status === "approved").length || 0;
      const rejected = data?.filter(e => e.status === "rejected").length || 0;
      const totalAmount =
        data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const approvedAmount =
        data
          ?.filter(e => e.status === "approved")
          .reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const pendingAmount =
        data
          ?.filter(e => e.status === "pending")
          .reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      // Get expenses by category
      const categoryStats =
        data?.reduce(
          (acc, expense) => {
            const category = expense.category || "Uncategorized";
            if (!acc[category]) {
              acc[category] = { count: 0, amount: 0 };
            }
            acc[category].count++;
            acc[category].amount += expense.amount || 0;
            return acc;
          },
          {} as Record<string, { count: number; amount: number }>
        ) || {};

      // Get monthly expenses for current year
      const currentYear = new Date().getFullYear();
      const monthlyExpenses = Array(12).fill(0);
      data?.forEach(expense => {
        if (expense.date) {
          const expenseYear = new Date(expense.date).getFullYear();
          if (expenseYear === currentYear) {
            const month = new Date(expense.date).getMonth();
            monthlyExpenses[month] += expense.amount || 0;
          }
        }
      });

      return {
        total,
        pending,
        approved,
        rejected,
        totalAmount,
        approvedAmount,
        pendingAmount,
        categoryStats,
        monthlyExpenses,
      };
    } catch (error) {
      console.error("Error fetching expense stats:", error);
      throw error;
    }
  }

  // Search expenses
  static async searchExpenses(searchTerm: string) {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          project:projects(name, client:clients(name, company_name))
        `
        )
        .or(`description.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error searching expenses:", error);
      throw error;
    }
  }

  // Get expense categories
  static async getExpenseCategories() {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("category");

      if (error) throw error;

      const categories = [
        ...new Set(data?.map(e => e.category).filter(Boolean)),
      ];
      return categories.sort();
    } catch (error) {
      console.error("Error fetching expense categories:", error);
      throw error;
    }
  }

  // Upload receipt
  static async uploadReceipt(file: File, expenseId: string) {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${expenseId}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("receipts")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Update expense with receipt path
      await this.updateExpense(expenseId, { receipt: fileName });

      return data;
    } catch (error) {
      console.error("Error uploading receipt:", error);
      throw error;
    }
  }

  // Delete receipt
  static async deleteReceipt(expenseId: string) {
    try {
      const expense = await this.getExpenseById(expenseId);
      if (!expense?.receipt) return true;

      const { error } = await supabase.storage
        .from("receipts")
        .remove([expense.receipt]);

      if (error) throw error;

      // Update expense to remove receipt
      await this.updateExpense(expenseId, { receipt: null });

      return true;
    } catch (error) {
      console.error("Error deleting receipt:", error);
      throw error;
    }
  }

  // Get receipt URL
  static getReceiptUrl(receiptPath: string | null) {
    if (!receiptPath) return null;

    const { data } = supabase.storage
      .from("receipts")
      .getPublicUrl(receiptPath);

    return data.publicUrl;
  }

  // Generate unique expense code
  private static async generateExpenseCode(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("expense_code")
        .order("expense_code", { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastCode = data[0].expense_code;
        const match = lastCode.match(/EXP-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
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
  ) {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .upsert(updates.map(({ id, data }) => ({ id, ...data })))
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error bulk updating expenses:", error);
      throw error;
    }
  }

  static async bulkDeleteExpenses(ids: string[]) {
    try {
      const { error } = await supabase.from("expenses").delete().in("id", ids);

      if (error) throw error;
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
}
