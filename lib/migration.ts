import { supabase } from "@/lib/supabase";

export interface MigrationProgress {
  total: number;
  completed: number;
  current: string;
  status: "idle" | "running" | "completed" | "failed";
  error?: string | null;
}

export interface MigrationResult {
  success: boolean;
  message: string;
  details: {
    clients: number;
    projects: number;
    timesheets: number;
    invoices: number;
    expenses: number;
    users: number;
  };
}

export class DataMigrationService {
  private static progress: MigrationProgress = {
    total: 0,
    completed: 0,
    current: "",
    status: "idle",
  };

  // Get migration progress
  static getProgress(): MigrationProgress {
    return { ...this.progress };
  }

  // Export data from localStorage
  static exportLocalData(): any {
    try {
      const data: any = {};
      
      // Get all keys from localStorage
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith("accounting-")) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              data[key] = JSON.parse(value);
            }
          } catch (err) {
            console.error(`Error parsing localStorage key ${key}:`, err);
          }
        }
      }
      
      return data;
    } catch (error) {
      console.error("Error exporting local data:", error);
      throw error;
    }
  }

  // Import data to localStorage
  static importLocalData(data: any): boolean {
    try {
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === "object") {
          localStorage.setItem(key, JSON.stringify(value));
        } else {
          localStorage.setItem(key, String(value));
        }
      }
      return true;
    } catch (error) {
      console.error("Error importing local data:", error);
      return false;
    }
  }

  // Clear all localStorage data
  static clearLocalData(): boolean {
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith("accounting-")) {
          localStorage.removeItem(key);
        }
      }
      return true;
    } catch (error) {
      console.error("Error clearing local data:", error);
      return false;
    }
  }

  // Migrate all data from localStorage to Supabase
  static async migrateAllData(): Promise<MigrationResult> {
    try {
      this.progress.status = "running";
      this.progress.completed = 0;
      this.progress.error = null;

      // Get local data
      const localData = this.exportLocalData();
      
      if (!localData || Object.keys(localData).length === 0) {
        throw new Error("No local data found to migrate");
      }

      // Count total items to migrate
      this.progress.total = this.countTotalItems(localData);
      
      const result: MigrationResult = {
        success: true,
        message: "Migration completed successfully",
        details: {
          clients: 0,
          projects: 0,
          timesheets: 0,
          invoices: 0,
          expenses: 0,
          users: 0,
        },
      };

      // Migrate company profile first
      if (localData["accounting-company-profile"]) {
        this.progress.current = "Migrating company profile...";
        await this.migrateCompanyProfile(localData["accounting-company-profile"]);
        this.progress.completed++;
      }

      // Migrate users
      if (localData["accounting-users"]) {
        this.progress.current = "Migrating users...";
        const userCount = await this.migrateUsers(localData["accounting-users"]);
        result.details.users = userCount;
        this.progress.completed++;
      }

      // Migrate clients
      if (localData["accounting-clients"]) {
        this.progress.current = "Migrating clients...";
        const clientCount = await this.migrateClients(localData["accounting-clients"]);
        result.details.clients = clientCount;
        this.progress.completed++;
      }

      // Migrate projects
      if (localData["accounting-projects"]) {
        this.progress.current = "Migrating projects...";
        const projectCount = await this.migrateProjects(localData["accounting-projects"]);
        result.details.projects = projectCount;
        this.progress.completed++;
      }

      // Migrate timesheets
      if (localData["accounting-timesheets"]) {
        this.progress.current = "Migrating timesheets...";
        const timesheetCount = await this.migrateTimesheets(localData["accounting-timesheets"]);
        result.details.timesheets = timesheetCount;
        this.progress.completed++;
      }

      // Migrate invoices
      if (localData["accounting-invoices"]) {
        this.progress.current = "Migrating invoices...";
        const invoiceCount = await this.migrateInvoices(localData["accounting-invoices"]);
        result.details.invoices = invoiceCount;
        this.progress.completed++;
      }

      // Migrate expenses
      if (localData["accounting-expenses"]) {
        this.progress.current = "Migrating expenses...";
        const expenseCount = await this.migrateExpenses(localData["accounting-expenses"]);
        result.details.expenses = expenseCount;
        this.progress.completed++;
      }

      this.progress.status = "completed";
      this.progress.current = "Migration completed successfully";
      
      return result;
    } catch (error) {
      this.progress.status = "failed";
      this.progress.error = error instanceof Error ? error.message : "Unknown error";
      throw error;
    }
  }

  // Count total items to migrate
  private static countTotalItems(localData: any): number {
    let count = 0;
    
    if (localData["accounting-company-profile"]) count++;
    if (localData["accounting-users"]) count++;
    if (localData["accounting-clients"]) count++;
    if (localData["accounting-projects"]) count++;
    if (localData["accounting-timesheets"]) count++;
    if (localData["accounting-invoices"]) count++;
    if (localData["accounting-expenses"]) count++;
    
    return count;
  }

  // Migrate company profile
  private static async migrateCompanyProfile(companyData: any): Promise<void> {
    try {
      if (!companyData) {
        return;
      }

      // Check if company profile already exists
      const { data: existing } = await supabase
        .from("company_profiles")
        .select("id")
        .limit(1);

      if (existing && existing.length > 0) {
        // Update existing profile
        await supabase
          .from("company_profiles")
          .update({
            name: companyData.name || "Default Company",
            address: companyData.address || "",
            city: companyData.city || "",
            state: companyData.state || "",
            country: companyData.country || "",
            pincode: companyData.pincode || "",
            phone: companyData.phone || "",
            email: companyData.email || "",
            website: companyData.website || "",
            gstin: companyData.gstin || "",
            pan: companyData.pan || "",
            logo: companyData.logo || "",
          })
          .eq("id", existing[0]?.id);
      } else {
        // Create new profile
        await supabase.from("company_profiles").insert([
          {
            name: companyData.name || "Default Company",
            address: companyData.address || "",
            city: companyData.city || "",
            state: companyData.state || "",
            country: companyData.country || "",
            pincode: companyData.pincode || "",
            phone: companyData.phone || "",
            email: companyData.email || "",
            website: companyData.website || "",
            gstin: companyData.gstin || "",
            pan: companyData.pan || "",
            logo: companyData.logo || "",
          },
        ]);
      }
    } catch (error) {
      console.error("Error migrating company profile:", error);
      throw error;
    }
  }

  // Migrate users
  private static async migrateUsers(usersData: any[]): Promise<number> {
    try {
      if (!Array.isArray(usersData)) {
        return 0;
      }

      let migratedCount = 0;
      
      for (const user of usersData) {
        try {
          // Check if user already exists
          const { data: existing } = await supabase
            .from("user_profiles")
            .select("id")
            .eq("email", user.email)
            .limit(1);

          if (!existing || existing.length === 0) {
            // Create new user profile
            await supabase.from("user_profiles").insert([
              {
                first_name: user.firstName || user.first_name || "",
                last_name: user.lastName || user.last_name || "",
                email: user.email || "",
                phone: user.phone || "",
                role: user.role || "user",
                department: user.department || "",
                position: user.position || "",
                avatar: user.avatar || "",
                bio: user.bio || "",
              },
            ]);
            migratedCount++;
          }
        } catch (err) {
          console.error(`Error migrating user ${user.email}:`, err);
        }
      }
      
      return migratedCount;
    } catch (error) {
      console.error("Error migrating users:", error);
      throw error;
    }
  }

  // Migrate clients
  private static async migrateClients(clientsData: any[]): Promise<number> {
    try {
      if (!Array.isArray(clientsData)) {
        return 0;
      }

      let migratedCount = 0;
      
      for (const client of clientsData) {
        try {
          // Check if client already exists
          const { data: existing } = await supabase
            .from("clients")
            .select("id")
            .eq("email", client.email)
            .limit(1);

          if (!existing || existing.length === 0) {
            // Create new client
            await supabase.from("clients").insert([
              {
                name: client.name || "",
                company_name: client.companyName || client.company_name || "",
                email: client.email || "",
                phone: client.phone || "",
                address: client.address || "",
                city: client.city || "",
                state: client.state || "",
                country: client.country || "",
                pincode: client.pincode || "",
                website: client.website || "",
                gstin: client.gstin || "",
                pan: client.pan || "",
                contact_person: client.contactPerson || client.contact_person || "",
                status: client.status || "active",
                notes: client.notes || "",
                tags: client.tags || [],
              },
            ]);
            migratedCount++;
          }
        } catch (err) {
          console.error(`Error migrating client ${client.name}:`, err);
        }
      }
      
      return migratedCount;
    } catch (error) {
      console.error("Error migrating clients:", error);
      throw error;
    }
  }

  // Migrate projects
  private static async migrateProjects(projectsData: any[]): Promise<number> {
    try {
      if (!Array.isArray(projectsData)) {
        return 0;
      }

      let migratedCount = 0;
      
      for (const project of projectsData) {
        try {
          // Check if project already exists
          const { data: existing } = await supabase
            .from("projects")
            .select("id")
            .eq("name", project.name)
            .limit(1);

          if (!existing || existing.length === 0) {
            // Create new project
            await supabase.from("projects").insert([
              {
                name: project.name || "",
                description: project.description || "",
                client_id: project.clientId || project.client_id || null,
                start_date: project.startDate || project.start_date || null,
                end_date: project.endDate || project.end_date || null,
                status: project.status || "active",
                budget: project.budget || 0,
                billing_rate: project.billingRate || project.billing_rate || 0,
                project_manager_id: project.projectManagerId || project.project_manager_id || null,
                team_members: project.teamMembers || project.team_members || [],
                tags: project.tags || [],
              },
            ]);
            migratedCount++;
          }
        } catch (err) {
          console.error(`Error migrating project ${project.name}:`, err);
        }
      }
      
      return migratedCount;
    } catch (error) {
      console.error("Error migrating projects:", error);
      throw error;
    }
  }

  // Migrate timesheets
  private static async migrateTimesheets(timesheetsData: any[]): Promise<number> {
    try {
      if (!Array.isArray(timesheetsData)) {
        return 0;
      }

      let migratedCount = 0;
      
      for (const timesheet of timesheetsData) {
        try {
          // Check if timesheet already exists
          const { data: existing } = await supabase
            .from("timesheets")
            .select("id")
            .eq("timesheet_code", timesheet.timesheetCode || timesheet.timesheet_code)
            .limit(1);

          if (!existing || existing.length === 0) {
            // Create new timesheet
            await supabase.from("timesheets").insert([
              {
                user_id: timesheet.userId || timesheet.user_id || null,
                project_id: timesheet.projectId || timesheet.project_id || null,
                week_start_date: timesheet.weekStartDate || timesheet.week_start_date || null,
                week_end_date: timesheet.weekEndDate || timesheet.week_end_date || null,
                status: timesheet.status || "draft",
                total_hours: timesheet.totalHours || timesheet.total_hours || 0,
                total_amount: timesheet.totalAmount || timesheet.total_amount || 0,
                notes: timesheet.notes || "",
              },
            ]);
            migratedCount++;
          }
        } catch (err) {
          console.error(`Error migrating timesheet ${timesheet.id}:`, err);
        }
      }
      
      return migratedCount;
    } catch (error) {
      console.error("Error migrating timesheets:", error);
      throw error;
    }
  }

  // Migrate invoices
  private static async migrateInvoices(invoicesData: any[]): Promise<number> {
    try {
      if (!Array.isArray(invoicesData)) {
        return 0;
      }

      let migratedCount = 0;
      
      for (const invoice of invoicesData) {
        try {
          // Check if invoice already exists
          const { data: existing } = await supabase
            .from("invoices")
            .select("id")
            .eq("invoice_number", invoice.invoiceNumber || invoice.invoice_number)
            .limit(1);

          if (!existing || existing.length === 0) {
            // Create new invoice
            await supabase.from("invoices").insert([
              {
                client_id: invoice.clientId || invoice.client_id || null,
                project_id: invoice.projectId || invoice.project_id || null,
                invoice_number: invoice.invoiceNumber || invoice.invoice_number || "",
                issue_date: invoice.issueDate || invoice.issue_date || null,
                due_date: invoice.dueDate || invoice.due_date || null,
                status: invoice.status || "draft",
                subtotal: invoice.subtotal || 0,
                tax_rate: invoice.taxRate || invoice.tax_rate || 0,
                tax_amount: invoice.taxAmount || invoice.tax_amount || 0,
                total_amount: invoice.totalAmount || invoice.total_amount || 0,
                notes: invoice.notes || "",
                terms: invoice.terms || "",
                payment_instructions: invoice.paymentInstructions || invoice.payment_instructions || "",
              },
            ]);
            migratedCount++;
          }
        } catch (err) {
          console.error(`Error migrating invoice ${invoice.invoiceNumber}:`, err);
        }
      }
      
      return migratedCount;
    } catch (error) {
      console.error("Error migrating invoices:", error);
      throw error;
    }
  }

  // Migrate expenses
  private static async migrateExpenses(expensesData: any[]): Promise<number> {
    try {
      if (!Array.isArray(expensesData)) {
        return 0;
      }

      let migratedCount = 0;
      
      for (const expense of expensesData) {
        try {
          // Check if expense already exists
          const { data: existing } = await supabase
            .from("expenses")
            .select("id")
            .eq("expense_code", expense.expenseCode || expense.expense_code)
            .limit(1);

          if (!existing || existing.length === 0) {
            // Create new expense
            await supabase.from("expenses").insert([
              {
                user_id: expense.userId || expense.user_id || null,
                project_id: expense.projectId || expense.project_id || null,
                client_id: expense.clientId || expense.client_id || null,
                category: expense.category || "",
                description: expense.description || "",
                amount: expense.amount || 0,
                date: expense.date || null,
                receipt_path: expense.receiptPath || expense.receipt_path || null,
                status: expense.status || "pending",
                notes: expense.notes || "",
                tags: expense.tags || [],
                billable: expense.billable || false,
                reimbursable: expense.reimbursable || false,
              },
            ]);
            migratedCount++;
          }
        } catch (err) {
          console.error(`Error migrating expense ${expense.id}:`, err);
        }
      }
      
      return migratedCount;
    } catch (error) {
      console.error("Error migrating expenses:", error);
      throw error;
    }
  }

  // Validate migration data
  static validateMigrationData(localData: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!localData) {
      errors.push("No local data provided");
      return { valid: false, errors };
    }

    // Validate required data structures
    if (localData["accounting-clients"] && !Array.isArray(localData["accounting-clients"])) {
      errors.push("Clients data is not an array");
    }

    if (localData["accounting-projects"] && !Array.isArray(localData["accounting-projects"])) {
      errors.push("Projects data is not an array");
    }

    if (localData["accounting-timesheets"] && !Array.isArray(localData["accounting-timesheets"])) {
      errors.push("Timesheets data is not an array");
    }

    if (localData["accounting-invoices"] && !Array.isArray(localData["accounting-invoices"])) {
      errors.push("Invoices data is not an array");
    }

    if (localData["accounting-expenses"] && !Array.isArray(localData["accounting-expenses"])) {
      errors.push("Expenses data is not an array");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Get migration summary
  static getMigrationSummary(): any {
    const localData = this.exportLocalData();
    
    return {
      hasCompanyProfile: !!localData["accounting-company-profile"],
      hasUsers: !!localData["accounting-users"],
      hasClients: !!localData["accounting-clients"],
      hasProjects: !!localData["accounting-projects"],
      hasTimesheets: !!localData["accounting-timesheets"],
      hasInvoices: !!localData["accounting-invoices"],
      hasExpenses: !!localData["accounting-expenses"],
      totalItems: this.countTotalItems(localData),
      dataSize: JSON.stringify(localData).length,
    };
  }
}
