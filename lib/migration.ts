import { supabase } from "@/lib/supabase";
import { AuthService } from "@/lib/api/auth";
import { ClientService } from "@/lib/api/clients";
import { ProjectService } from "@/lib/api/projects";
import { TimesheetService } from "@/lib/api/timesheets";
import { InvoiceService } from "@/lib/api/invoices";
import { ExpenseService } from "@/lib/api/expenses";

export interface MigrationProgress {
  step: string;
  current: number;
  total: number;
  message: string;
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
    errors: string[];
  };
}

export class DataMigrationService {
  private static progressCallback?: (progress: MigrationProgress) => void;

  static setProgressCallback(callback: (progress: MigrationProgress) => void) {
    this.progressCallback = callback;
  }

  private static updateProgress(
    step: string,
    current: number,
    total: number,
    message: string
  ) {
    if (this.progressCallback) {
      this.progressCallback({ step, current, total, message });
    }
  }

  // Migrate all data from localStorage to Supabase
  static async migrateAllData(): Promise<MigrationResult> {
    try {
      const result: MigrationResult = {
        success: true,
        message: "Migration completed successfully",
        details: {
          clients: 0,
          projects: 0,
          timesheets: 0,
          invoices: 0,
          expenses: 0,
          errors: [],
        },
      };

      // Get data from localStorage
      const localData = this.getLocalStorageData();
      if (!localData) {
        throw new Error("No data found in localStorage");
      }

      // Migrate company profile first
      if (localData.companyProfile) {
        await this.migrateCompanyProfile(localData.companyProfile);
      }

      // Migrate clients
      if (localData.clients && localData.clients.length > 0) {
        result.details.clients = await this.migrateClients(localData.clients);
      }

      // Migrate projects
      if (localData.projects && localData.projects.length > 0) {
        result.details.projects = await this.migrateProjects(
          localData.projects
        );
      }

      // Migrate timesheets
      if (localData.timesheets && localData.timesheets.length > 0) {
        result.details.timesheets = await this.migrateTimesheets(
          localData.timesheets
        );
      }

      // Migrate invoices
      if (localData.invoices && localData.invoices.length > 0) {
        result.details.invoices = await this.migrateInvoices(
          localData.invoices
        );
      }

      // Migrate expenses
      if (localData.expenses && localData.expenses.length > 0) {
        result.details.expenses = await this.migrateExpenses(
          localData.expenses
        );
      }

      return result;
    } catch (error) {
      console.error("Migration failed:", error);
      return {
        success: false,
        message: `Migration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: {
          clients: 0,
          projects: 0,
          timesheets: 0,
          invoices: 0,
          expenses: 0,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        },
      };
    }
  }

  // Get data from localStorage
  private static getLocalStorageData() {
    try {
      if (typeof window === "undefined") return null;

      const data = localStorage.getItem("bst-accounting-store");
      if (!data) return null;

      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading localStorage data:", error);
      return null;
    }
  }

  // Migrate company profile
  private static async migrateCompanyProfile(companyProfile: any) {
    try {
      this.updateProgress(
        "Company Profile",
        1,
        1,
        "Migrating company profile..."
      );

      const { data, error } = await supabase
        .from("company_profiles")
        .upsert([
          {
            name: companyProfile.name,
            legal_name: companyProfile.legalName,
            address: companyProfile.address,
            city: companyProfile.city,
            state: companyProfile.state,
            country: companyProfile.country,
            pincode: companyProfile.pincode,
            phone: companyProfile.phone,
            email: companyProfile.email,
            website: companyProfile.website,
            gstin: companyProfile.gstin,
            pan: companyProfile.pan,
            cin_number: companyProfile.cinNumber,
            logo: companyProfile.logo,
            description: companyProfile.description,
            founded_year: companyProfile.foundedYear,
            industry: companyProfile.industry,
            company_size: companyProfile.companySize,
            annual_revenue: companyProfile.annualRevenue,
            employee_count: companyProfile.employeeCount,
            bank_details: companyProfile.bankDetails,
            contact_person: companyProfile.contactPerson,
            social_media: companyProfile.socialMedia,
          },
        ])
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error migrating company profile:", error);
      throw error;
    }
  }

  // Migrate clients
  private static async migrateClients(clients: any[]): Promise<number> {
    try {
      this.updateProgress(
        "Clients",
        0,
        clients.length,
        "Starting client migration..."
      );

      let migratedCount = 0;
      for (let i = 0; i < clients.length; i++) {
        const client = clients[i];
        this.updateProgress(
          "Clients",
          i + 1,
          clients.length,
          `Migrating client: ${client.name}`
        );

        try {
          await ClientService.createClient({
            name: client.name,
            company_name: client.companyName,
            email: client.email,
            phone: client.phone,
            address: client.address,
            city: client.city,
            state: client.state,
            country: client.country,
            pincode: client.pincode,
            website: client.website,
            gstin: client.gstin,
            pan: client.pan,
            contact_person: client.contactPerson,
            billing_address: client.billingAddress,
            billing_city: client.billingCity,
            billing_state: client.billingState,
            billing_country: client.billingCountry,
            billing_pincode: client.billingPincode,
            payment_terms: client.paymentTerms,
            credit_limit: client.creditLimit,
            status: client.status,
            notes: client.notes,
            tags: client.tags,
          });
          migratedCount++;
        } catch (error) {
          console.error(`Error migrating client ${client.name}:`, error);
        }
      }

      return migratedCount;
    } catch (error) {
      console.error("Error migrating clients:", error);
      throw error;
    }
  }

  // Migrate projects
  private static async migrateProjects(projects: any[]): Promise<number> {
    try {
      this.updateProgress(
        "Projects",
        0,
        projects.length,
        "Starting project migration..."
      );

      let migratedCount = 0;
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        this.updateProgress(
          "Projects",
          i + 1,
          projects.length,
          `Migrating project: ${project.name}`
        );

        try {
          await ProjectService.createProject({
            name: project.name,
            description: project.description,
            client_id: project.clientId,
            start_date: project.startDate,
            end_date: project.endDate,
            status: project.status,
            budget: project.budget,
            billing_rate: project.billingRate,
            project_manager_id: project.projectManagerId,
            team_members: project.teamMembers,
            tags: project.tags,
          });
          migratedCount++;
        } catch (error) {
          console.error(`Error migrating project ${project.name}:`, error);
        }
      }

      return migratedCount;
    } catch (error) {
      console.error("Error migrating projects:", error);
      throw error;
    }
  }

  // Migrate timesheets
  private static async migrateTimesheets(timesheets: any[]): Promise<number> {
    try {
      this.updateProgress(
        "Timesheets",
        0,
        timesheets.length,
        "Starting timesheet migration..."
      );

      let migratedCount = 0;
      for (let i = 0; i < timesheets.length; i++) {
        const timesheet = timesheets[i];
        this.updateProgress(
          "Timesheets",
          i + 1,
          timesheets.length,
          `Migrating timesheet: ${timesheet.timesheetCode}`
        );

        try {
          await TimesheetService.createTimesheet({
            user_id: timesheet.userId,
            project_id: timesheet.projectId,
            month: timesheet.month,
            year: timesheet.year,
            status: timesheet.status,
            billing_rate: timesheet.billingRate,
            notes: timesheet.notes,
          });
          migratedCount++;
        } catch (error) {
          console.error(
            `Error migrating timesheet ${timesheet.timesheetCode}:`,
            error
          );
        }
      }

      return migratedCount;
    } catch (error) {
      console.error("Error migrating timesheets:", error);
      throw error;
    }
  }

  // Migrate invoices
  private static async migrateInvoices(invoices: any[]): Promise<number> {
    try {
      this.updateProgress(
        "Invoices",
        0,
        invoices.length,
        "Starting invoice migration..."
      );

      let migratedCount = 0;
      for (let i = 0; i < invoices.length; i++) {
        const invoice = invoices[i];
        this.updateProgress(
          "Invoices",
          i + 1,
          invoices.length,
          `Migrating invoice: ${invoice.invoiceNumber}`
        );

        try {
          await InvoiceService.createInvoice({
            client_id: invoice.clientId,
            project_id: invoice.projectId,
            timesheet_id: invoice.timesheetId,
            issue_date: invoice.issueDate,
            due_date: invoice.dueDate,
            status: invoice.status,
            subtotal: invoice.subtotal,
            tax_rate: invoice.taxRate,
            tax_amount: invoice.taxAmount,
            total: invoice.total,
            payment_terms: invoice.paymentTerms,
            notes: invoice.notes,
            terms_conditions: invoice.termsConditions,
          });
          migratedCount++;
        } catch (error) {
          console.error(
            `Error migrating invoice ${invoice.invoiceNumber}:`,
            error
          );
        }
      }

      return migratedCount;
    } catch (error) {
      console.error("Error migrating invoices:", error);
      throw error;
    }
  }

  // Migrate expenses
  private static async migrateExpenses(expenses: any[]): Promise<number> {
    try {
      this.updateProgress(
        "Expenses",
        0,
        expenses.length,
        "Starting expense migration..."
      );

      let migratedCount = 0;
      for (let i = 0; i < expenses.length; i++) {
        const expense = expenses[i];
        this.updateProgress(
          "Expenses",
          i + 1,
          expenses.length,
          `Migrating expense: ${expense.expenseCode}`
        );

        try {
          await ExpenseService.createExpense({
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            date: expense.date,
            project_id: expense.projectId,
            status: expense.status,
            receipt: expense.receipt,
            notes: expense.notes,
          });
          migratedCount++;
        } catch (error) {
          console.error(
            `Error migrating expense ${expense.expenseCode}:`,
            error
          );
        }
      }

      return migratedCount;
    } catch (error) {
      console.error("Error migrating expenses:", error);
      throw error;
    }
  }

  // Export data from localStorage
  static exportLocalData(): string {
    try {
      if (typeof window === "undefined") return "";

      const data = localStorage.getItem("bst-accounting-store");
      if (!data) return "";

      const parsedData = JSON.parse(data);
      const exportData = {
        exportDate: new Date().toISOString(),
        version: "1.0",
        data: parsedData,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("Error exporting local data:", error);
      return "";
    }
  }

  // Import data to localStorage (for testing)
  static importLocalData(jsonData: string): boolean {
    try {
      if (typeof window === "undefined") return false;

      const parsedData = JSON.parse(jsonData);
      const data = parsedData.data || parsedData;

      localStorage.setItem("bst-accounting-store", JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Error importing local data:", error);
      return false;
    }
  }

  // Clear localStorage data
  static clearLocalData(): boolean {
    try {
      if (typeof window === "undefined") return false;

      localStorage.removeItem("bst-accounting-store");
      return true;
    } catch (error) {
      console.error("Error clearing local data:", error);
      return false;
    }
  }

  // Validate migration data
  static validateMigrationData(): { isValid: boolean; errors: string[] } {
    try {
      const localData = this.getLocalStorageData();
      if (!localData) {
        return { isValid: false, errors: ["No data found in localStorage"] };
      }

      const errors: string[] = [];

      // Validate required fields
      if (localData.clients) {
        localData.clients.forEach((client: any, index: number) => {
          if (!client.name) errors.push(`Client ${index + 1}: Missing name`);
          if (!client.email) errors.push(`Client ${index + 1}: Missing email`);
        });
      }

      if (localData.projects) {
        localData.projects.forEach((project: any, index: number) => {
          if (!project.name) errors.push(`Project ${index + 1}: Missing name`);
          if (!project.clientId)
            errors.push(`Project ${index + 1}: Missing client ID`);
        });
      }

      if (localData.timesheets) {
        localData.timesheets.forEach((timesheet: any, index: number) => {
          if (!timesheet.userId)
            errors.push(`Timesheet ${index + 1}: Missing user ID`);
          if (!timesheet.projectId)
            errors.push(`Timesheet ${index + 1}: Missing project ID`);
          if (!timesheet.month)
            errors.push(`Timesheet ${index + 1}: Missing month`);
          if (!timesheet.year)
            errors.push(`Timesheet ${index + 1}: Missing year`);
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [
          `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
      };
    }
  }

  // Get migration summary
  static getMigrationSummary(): {
    totalRecords: number;
    breakdown: Record<string, number>;
  } {
    try {
      const localData = this.getLocalStorageData();
      if (!localData) {
        return { totalRecords: 0, breakdown: {} };
      }

      const breakdown = {
        clients: localData.clients?.length || 0,
        projects: localData.projects?.length || 0,
        timesheets: localData.timesheets?.length || 0,
        invoices: localData.invoices?.length || 0,
        expenses: localData.expenses?.length || 0,
        dailyLogs: localData.dailyLogs?.length || 0,
      };

      const totalRecords = Object.values(breakdown).reduce(
        (sum, count) => sum + count,
        0
      );

      return { totalRecords, breakdown };
    } catch (error) {
      console.error("Error getting migration summary:", error);
      return { totalRecords: 0, breakdown: {} };
    }
  }
}
