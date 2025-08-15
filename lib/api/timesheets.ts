import { supabase } from "@/lib/supabase";
import { Timesheet, TimesheetEntry } from "@/types";

export interface CreateTimesheetData {
  user_id: string;
  project_id: string;
  month: number;
  year: number;
  status?: "draft" | "submitted" | "approved" | "rejected" | "invoiced";
  billing_rate?: number;
  notes?: string;
}

export interface UpdateTimesheetData extends Partial<CreateTimesheetData> {}

export interface CreateTimesheetEntryData {
  timesheet_id: string;
  date: string;
  hours: number;
  description: string;
  task_type?: string;
  billable?: boolean;
  rate?: number;
}

export interface UpdateTimesheetEntryData
  extends Partial<CreateTimesheetEntryData> {}

export interface TimesheetFilters {
  user_id?: string;
  project_id?: string;
  status?: string;
  month?: number;
  year?: number;
  date_from?: string;
  date_to?: string;
}

export class TimesheetService {
  // Get all timesheets with optional filtering
  static async getTimesheets(
    filters: TimesheetFilters = {},
    page = 1,
    limit = 20
  ) {
    try {
      let query = supabase
        .from("timesheets")
        .select(
          `
          *,
          user:user_profiles(first_name, last_name, email),
          project:projects(name, client:clients(name, company_name))
        `
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.user_id) {
        query = query.eq("user_id", filters.user_id);
      }

      if (filters.project_id) {
        query = query.eq("project_id", filters.project_id);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.month) {
        query = query.eq("month", filters.month);
      }

      if (filters.year) {
        query = query.eq("year", filters.year);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        timesheets: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error("Error fetching timesheets:", error);
      throw error;
    }
  }

  // Get timesheet by ID
  static async getTimesheetById(id: string) {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .select(
          `
          *,
          user:user_profiles(*),
          project:projects(*),
          entries:timesheet_entries(*)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching timesheet:", error);
      throw error;
    }
  }

  // Get timesheet by code
  static async getTimesheetByCode(timesheetCode: string) {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .select(
          `
          *,
          user:user_profiles(first_name, last_name, email),
          project:projects(name, client:clients(name, company_name))
        `
        )
        .eq("timesheet_code", timesheetCode)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching timesheet by code:", error);
      throw error;
    }
  }

  // Create new timesheet
  static async createTimesheet(timesheetData: CreateTimesheetData) {
    try {
      // Generate timesheet code
      const timesheetCode = await this.generateTimesheetCode(
        timesheetData.month,
        timesheetData.year
      );

      const { data, error } = await supabase
        .from("timesheets")
        .insert([{ ...timesheetData, timesheet_code: timesheetCode }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating timesheet:", error);
      throw error;
    }
  }

  // Update timesheet
  static async updateTimesheet(id: string, timesheetData: UpdateTimesheetData) {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .update(timesheetData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating timesheet:", error);
      throw error;
    }
  }

  // Delete timesheet
  static async deleteTimesheet(id: string) {
    try {
      const { error } = await supabase.from("timesheets").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting timesheet:", error);
      throw error;
    }
  }

  // Submit timesheet for approval
  static async submitTimesheet(id: string) {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .update({
          status: "submitted",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error submitting timesheet:", error);
      throw error;
    }
  }

  // Approve timesheet
  static async approveTimesheet(
    id: string,
    approvedBy: string,
    rejectionReason?: string
  ) {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: approvedBy,
          rejection_reason: null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error approving timesheet:", error);
      throw error;
    }
  }

  // Reject timesheet
  static async rejectTimesheet(
    id: string,
    approvedBy: string,
    rejectionReason: string
  ) {
    try {
      const { data, error } = await supabase
        .from("timesheets")
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
      console.error("Error rejecting timesheet:", error);
      throw error;
    }
  }

  // Mark timesheet as invoiced
  static async markTimesheetAsInvoiced(id: string) {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .update({ status: "invoiced" })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error marking timesheet as invoiced:", error);
      throw error;
    }
  }

  // Get timesheets by user
  static async getTimesheetsByUser(userId: string) {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .select(
          `
          *,
          project:projects(name, client:clients(name, company_name))
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching timesheets by user:", error);
      throw error;
    }
  }

  // Get timesheets by project
  static async getTimesheetsByProject(projectId: string) {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .select(
          `
          *,
          user:user_profiles(first_name, last_name, email)
        `
        )
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching timesheets by project:", error);
      throw error;
    }
  }

  // Get timesheets by status
  static async getTimesheetsByStatus(status: string) {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .select(
          `
          *,
          user:user_profiles(first_name, last_name, email),
          project:projects(name, client:clients(name, company_name))
        `
        )
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching timesheets by status:", error);
      throw error;
    }
  }

  // Get timesheets by month and year
  static async getTimesheetsByMonth(month: number, year: number) {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .select(
          `
          *,
          user:user_profiles(first_name, last_name, email),
          project:projects(name, client:clients(name, company_name))
        `
        )
        .eq("month", month)
        .eq("year", year)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching timesheets by month:", error);
      throw error;
    }
  }

  // Get pending timesheets (for approval)
  static async getPendingTimesheets() {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .select(
          `
          *,
          user:user_profiles(first_name, last_name, email),
          project:projects(name, client:clients(name, company_name))
        `
        )
        .eq("status", "submitted")
        .order("submitted_at", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching pending timesheets:", error);
      throw error;
    }
  }

  // Calculate timesheet totals
  static async calculateTimesheetTotals(timesheetId: string) {
    try {
      const { data, error } = await supabase
        .from("timesheet_entries")
        .select("hours, rate, billable")
        .eq("timesheet_id", timesheetId);

      if (error) throw error;

      const totalHours =
        data?.reduce((sum, entry) => sum + (entry.hours || 0), 0) || 0;
      const billableHours =
        data?.reduce(
          (sum, entry) => sum + (entry.billable ? entry.hours || 0 : 0),
          0
        ) || 0;
      const totalAmount =
        data?.reduce(
          (sum, entry) => sum + (entry.hours || 0) * (entry.rate || 0),
          0
        ) || 0;

      return { totalHours, billableHours, totalAmount };
    } catch (error) {
      console.error("Error calculating timesheet totals:", error);
      throw error;
    }
  }

  // Update timesheet totals
  static async updateTimesheetTotals(timesheetId: string) {
    try {
      const totals = await this.calculateTimesheetTotals(timesheetId);

      const { data, error } = await supabase
        .from("timesheets")
        .update({
          total_hours: totals.totalHours,
          total_amount: totals.totalAmount,
          days_worked: Math.ceil(totals.totalHours / 8), // Assuming 8 hours per day
        })
        .eq("id", timesheetId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating timesheet totals:", error);
      throw error;
    }
  }

  // Timesheet Entries Management
  static async addTimesheetEntry(entryData: CreateTimesheetEntryData) {
    try {
      const { data, error } = await supabase
        .from("timesheet_entries")
        .insert([entryData])
        .select()
        .single();

      if (error) throw error;

      // Update timesheet totals
      await this.updateTimesheetTotals(entryData.timesheet_id);

      return data;
    } catch (error) {
      console.error("Error adding timesheet entry:", error);
      throw error;
    }
  }

  static async updateTimesheetEntry(
    id: string,
    entryData: UpdateTimesheetEntryData
  ) {
    try {
      const { data, error } = await supabase
        .from("timesheet_entries")
        .update(entryData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update timesheet totals
      if (data.timesheet_id) {
        await this.updateTimesheetTotals(data.timesheet_id);
      }

      return data;
    } catch (error) {
      console.error("Error updating timesheet entry:", error);
      throw error;
    }
  }

  static async deleteTimesheetEntry(id: string) {
    try {
      const entry = await supabase
        .from("timesheet_entries")
        .select("timesheet_id")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("timesheet_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Update timesheet totals
      if (entry.data?.timesheet_id) {
        await this.updateTimesheetTotals(entry.data.timesheet_id);
      }

      return true;
    } catch (error) {
      console.error("Error deleting timesheet entry:", error);
      throw error;
    }
  }

  // Get timesheet entries
  static async getTimesheetEntries(timesheetId: string) {
    try {
      const { data, error } = await supabase
        .from("timesheet_entries")
        .select("*")
        .eq("timesheet_id", timesheetId)
        .order("date", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching timesheet entries:", error);
      throw error;
    }
  }

  // Get timesheet statistics
  static async getTimesheetStats() {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .select("status, total_hours, total_amount");

      if (error) throw error;

      const total = data?.length || 0;
      const draft = data?.filter(t => t.status === "draft").length || 0;
      const submitted = data?.filter(t => t.status === "submitted").length || 0;
      const approved = data?.filter(t => t.status === "approved").length || 0;
      const rejected = data?.filter(t => t.status === "rejected").length || 0;
      const invoiced = data?.filter(t => t.status === "invoiced").length || 0;
      const totalHours =
        data?.reduce((sum, t) => sum + (t.total_hours || 0), 0) || 0;
      const totalAmount =
        data?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;

      return {
        total,
        draft,
        submitted,
        approved,
        rejected,
        invoiced,
        totalHours,
        totalAmount,
      };
    } catch (error) {
      console.error("Error fetching timesheet stats:", error);
      throw error;
    }
  }

  // Generate unique timesheet code
  private static async generateTimesheetCode(
    month: number,
    year: number
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .select("timesheet_code")
        .eq("month", month)
        .eq("year", year)
        .order("timesheet_code", { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastCode = data[0].timesheet_code;
        const match = lastCode.match(/TS-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      const monthStr = String(month).padStart(2, "0");
      return `TS-${year}${monthStr}-${String(nextNumber).padStart(4, "0")}`;
    } catch (error) {
      console.error("Error generating timesheet code:", error);
      // Fallback to timestamp-based code
      return `TS-${Date.now()}`;
    }
  }

  // Bulk operations
  static async bulkUpdateTimesheets(
    updates: Array<{ id: string; data: UpdateTimesheetData }>
  ) {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .upsert(updates.map(({ id, data }) => ({ id, ...data })))
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error bulk updating timesheets:", error);
      throw error;
    }
  }

  static async bulkDeleteTimesheets(ids: string[]) {
    try {
      const { error } = await supabase
        .from("timesheets")
        .delete()
        .in("id", ids);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error bulk deleting timesheets:", error);
      throw error;
    }
  }
}
