import { supabase } from "@/lib/supabase";

export interface CreateTimesheetData {
  user_id: string;
  project_id: string;
  week_start_date: string;
  week_end_date: string;
  status?: "draft" | "submitted" | "approved" | "rejected" | "invoiced";
  notes?: string;
  total_hours?: number;
  total_amount?: number;
}

export interface UpdateTimesheetData extends Partial<CreateTimesheetData> {}

export interface CreateTimesheetEntryData {
  timesheet_id: string;
  date: string;
  hours: number;
  description: string;
  task_type?: string;
  billable?: boolean;
  hourly_rate?: number;
}

export interface UpdateTimesheetEntryData extends Partial<CreateTimesheetEntryData> {}

// Extend this interface for additional timesheet-specific filters
export interface TimesheetFilters extends BaseFilters {
  // Add timesheet-specific filters here when needed
}

// Extend this interface for additional timesheet entry-specific filters
export interface TimesheetEntryFilters extends BaseFilters {
  // Add timesheet entry-specific filters here when needed
}

export class TimesheetService {
  // Get all timesheets with optional filtering and pagination
  static async getTimesheets(
    filters: TimesheetFilters = {},
    page = 1,
    limit = 20
  ): Promise<{ data: any[]; totalPages: number; page: number; limit: number }> {
    try {
      let query = supabase
        .from("timesheets")
        .select(
          `
          *,
          user:user_profiles(first_name, last_name, email),
          project:projects(name, client_id),
          client:clients(name, company_name),
          approved_by_user:user_profiles!approved_by(first_name, last_name, email)
        `
        )
        .order("week_start_date", { ascending: false });

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

      if (filters.week_start_date_from) {
        query = query.gte("week_start_date", filters.week_start_date_from);
      }

      if (filters.week_start_date_to) {
        query = query.lte("week_start_date", filters.week_start_date_to);
      }

      if (filters.approved_by) {
        query = query.eq("approved_by", filters.approved_by);
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
        data: data ?? [],
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit),
      };
    } catch (error) {
      console.error("Error fetching timesheets:", error);
      throw error;
    }
  }

  // Get timesheet by ID
  static async getTimesheetById(id: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .select(
          `
          *,
          user:user_profiles(*),
          project:projects(*),
          client:clients(*),
          approved_by_user:user_profiles!approved_by(*),
          entries:timesheet_entries(*)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error fetching timesheet:", error);
      throw error;
    }
  }

  // Get timesheet by timesheet code
  static async getTimesheetByCode(timesheetCode: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .select(
          `
          *,
          user:user_profiles(*),
          project:projects(*),
          client:clients(*)
        `
        )
        .eq("timesheet_code", timesheetCode)
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error fetching timesheet by code:", error);
      throw error;
    }
  }

  // Create new timesheet
  static async createTimesheet(timesheetData: CreateTimesheetData): Promise<any> {
    try {
      // Generate timesheet code
      const timesheetCode = await this.generateTimesheetCode();

      const { data, error } = await supabase
        .from("timesheets")
        .insert([{ ...timesheetData, timesheet_code: timesheetCode }])
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error creating timesheet:", error);
      throw error;
    }
  }

  // Update existing timesheet
  static async updateTimesheet(id: string, timesheetData: UpdateTimesheetData): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .update(timesheetData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error updating timesheet:", error);
      throw error;
    }
  }

  // Delete timesheet
  static async deleteTimesheet(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("timesheets").delete().eq("id", id);

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Error deleting timesheet:", error);
      throw error;
    }
  }

  // Submit timesheet for approval
  static async submitTimesheet(id: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .update({ status: "submitted", submitted_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error submitting timesheet:", error);
      throw error;
    }
  }

  // Approve timesheet
  static async approveTimesheet(
    id: string,
    approverId: string,
    approvalNotes?: string
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("timesheets")
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
      console.error("Error approving timesheet:", error);
      throw error;
    }
  }

  // Reject timesheet
  static async rejectTimesheet(
    id: string,
    approverId: string,
    rejectionReason: string
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("timesheets")
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
      console.error("Error rejecting timesheet:", error);
      throw error;
    }
  }

  // Mark timesheet as invoiced
  static async markTimesheetAsInvoiced(id: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .update({
          status: "invoiced",
          invoiced_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error marking timesheet as invoiced:", error);
      throw error;
    }
  }

  // Add timesheet entry
  static async addTimesheetEntry(entryData: CreateTimesheetEntryData): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("timesheet_entries")
        .insert([entryData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update timesheet totals
      await this.updateTimesheetTotals(entryData.timesheet_id);

      return data;
    } catch (error) {
      console.error("Error adding timesheet entry:", error);
      throw error;
    }
  }

  // Update timesheet entry
  static async updateTimesheetEntry(id: string, entryData: UpdateTimesheetEntryData): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("timesheet_entries")
        .update(entryData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

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

  // Delete timesheet entry
  static async deleteTimesheetEntry(id: string): Promise<boolean> {
    try {
      const entry = await supabase
        .from("timesheet_entries")
        .select("timesheet_id")
        .eq("id", id)
        .single();

      const { error } = await supabase.from("timesheet_entries").delete().eq("id", id);

      if (error) {
        throw error;
      }

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
  static async getTimesheetEntries(timesheetId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("timesheet_entries")
        .select("*")
        .eq("timesheet_id", timesheetId)
        .order("date", { ascending: true });

      if (error) {
        throw error;
      }
      return data ?? [];
    } catch (error) {
      console.error("Error fetching timesheet entries:", error);
      throw error;
    }
  }

  // Update timesheet totals
  private static async updateTimesheetTotals(timesheetId: string): Promise<void> {
    try {
      const entries = await this.getTimesheetEntries(timesheetId);

      const totalHours = entries.reduce((sum, entry) => sum + (entry.hours ?? 0), 0);
      const totalAmount = entries.reduce(
        (sum, entry) => sum + ((entry.hours ?? 0) * (entry.hourly_rate ?? 0)),
        0
      );

      await supabase
        .from("timesheets")
        .update({
          total_hours: totalHours,
          total_amount: totalAmount,
        })
        .eq("id", timesheetId);
    } catch (error) {
      console.error("Error updating timesheet totals:", error);
    }
  }

  // Get timesheets by user
  static async getTimesheetsByUser(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .select(
          `
          *,
          project:projects(name, client_id),
          client:clients(name, company_name)
        `
        )
        .eq("user_id", userId)
        .order("week_start_date", { ascending: false });

      if (error) {
        throw error;
      }
      return data ?? [];
    } catch (error) {
      console.error("Error fetching timesheets by user:", error);
      throw error;
    }
  }

  // Get timesheets by project
  static async getTimesheetsByProject(projectId: string): Promise<any[]> {
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
        .order("week_start_date", { ascending: false });

      if (error) {
        throw error;
      }
      return data ?? [];
    } catch (error) {
      console.error("Error fetching timesheets by project:", error);
      throw error;
    }
  }

  // Get timesheets by status
  static async getTimesheetsByStatus(status: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .select(
          `
          *,
          user:user_profiles(first_name, last_name, email),
          project:projects(name, client_id),
          client:clients(name, company_name)
        `
        )
        .eq("status", status)
        .order("week_start_date", { ascending: false });

      if (error) {
        throw error;
      }
      return data ?? [];
    } catch (error) {
      console.error("Error fetching timesheets by status:", error);
      throw error;
    }
  }

  // Get timesheet statistics
  static async getTimesheetStats(): Promise<{
    total: number;
    draft: number;
    submitted: number;
    approved: number;
    rejected: number;
    invoiced: number;
    totalHours: number;
    totalAmount: number;
  }> {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .select("status, total_hours, total_amount");

      if (error) {
        throw error;
      }

      const total = data?.length ?? 0;
      const draft = data?.filter(t => t.status === "draft").length ?? 0;
      const submitted = data?.filter(t => t.status === "submitted").length ?? 0;
      const approved = data?.filter(t => t.status === "approved").length ?? 0;
      const rejected = data?.filter(t => t.status === "rejected").length ?? 0;
      const invoiced = data?.filter(t => t.status === "invoiced").length ?? 0;
      const totalHours = data?.reduce((sum, t) => sum + (t.total_hours ?? 0), 0) ?? 0;
      const totalAmount = data?.reduce((sum, t) => sum + (t.total_amount ?? 0), 0) ?? 0;

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

  // Search timesheets
  static async searchTimesheets(searchTerm: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .select(
          `
          *,
          user:user_profiles(first_name, last_name, email),
          project:projects(name, client_id),
          client:clients(name, company_name)
        `
        )
        .or(`notes.ilike.%${searchTerm}%`)
        .order("week_start_date", { ascending: false });

      if (error) {
        throw error;
      }
      return data ?? [];
    } catch (error) {
      console.error("Error searching timesheets:", error);
      throw error;
    }
  }

  // Generate unique timesheet code
  private static async generateTimesheetCode(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .select("timesheet_code")
        .order("timesheet_code", { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastCode = data[0]?.timesheet_code;
        if (lastCode) {
          const match = lastCode.match(/TS-(\d+)/);
          if (match) {
            nextNumber = parseInt(match[1]) + 1;
          }
        }
      }

      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, "0");
      return `TS-${year}${month}-${String(nextNumber).padStart(4, "0")}`;
    } catch (error) {
      console.error("Error generating timesheet code:", error);
      // Fallback to timestamp-based code
      return `TS-${Date.now()}`;
    }
  }

  // Bulk operations
  static async bulkUpdateTimesheets(
    updates: Array<{ id: string; data: UpdateTimesheetData }>
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("timesheets")
        .upsert(updates.map(({ id, data }) => ({ id, ...data })))
        .select();

      if (error) {
        throw error;
      }
      return data ?? [];
    } catch (error) {
      console.error("Error bulk updating timesheets:", error);
      throw error;
    }
  }

  static async bulkDeleteTimesheets(ids: string[]): Promise<boolean> {
    try {
      const { error } = await supabase.from("timesheets").delete().in("id", ids);

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Error bulk deleting timesheets:", error);
      throw error;
    }
  }
}
