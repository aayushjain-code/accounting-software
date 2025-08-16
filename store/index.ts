import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addDays } from "date-fns";
import {
  Client,
  Project,
  Timesheet,
  Invoice,
  Expense,
  DailyLog,
  CompanyProfile,
  InvoiceItem,
  InvoiceFile,
  TimesheetEntry,
  TimesheetFile,
  ExpenseFile,
} from "@/types";
import { DashboardStats } from "@/types/dashboard";
import { CodeGenerator } from "@/utils/codeGenerator";
import { InvoiceService } from "@/lib/api/invoices";
import { TimesheetService } from "@/lib/api/timesheets";
import {
  createTimesheetInSupabase,
  updateTimesheetInSupabase,
  createInvoiceInSupabase,
  updateInvoiceInSupabase,
} from "./supabase-integration";

interface AccountingStore {
  // Data
  companyProfile: CompanyProfile;
  clients: Client[];
  projects: Project[];
  invoices: Invoice[];
  invoiceItems: InvoiceItem[];
  invoiceFiles: InvoiceFile[];
  expenses: Expense[];
  timesheets: Timesheet[];
  timesheetEntries: TimesheetEntry[];
  dailyLogs: DailyLog[];

  // Actions
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => Promise<void>;
  addClient: (
    client: Omit<Client, "id" | "clientCode" | "createdAt" | "updatedAt">
  ) => void;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  addProject: (
    project: Omit<Project, "id" | "projectCode" | "createdAt" | "updatedAt">
  ) => void;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  addTimesheet: (
    timesheet: Omit<
      Timesheet,
      "id" | "timesheetCode" | "createdAt" | "updatedAt"
    >
  ) => void;
  updateTimesheet: (id: string, timesheet: Partial<Timesheet>) => Promise<void>;
  deleteTimesheet: (id: string) => void;
  reloadTimesheet: (id: string) => Promise<void>;

  addTimesheetEntry: (
    entry: Omit<TimesheetEntry, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateTimesheetEntry: (id: string, entry: Partial<TimesheetEntry>) => void;
  deleteTimesheetEntry: (id: string) => void;

  addInvoice: (
    invoice: Omit<Invoice, "id" | "invoiceNumber" | "createdAt" | "updatedAt">
  ) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;

  addInvoiceItem: (item: Omit<InvoiceItem, "id">) => void;
  updateInvoiceItem: (id: string, item: Partial<InvoiceItem>) => void;
  deleteInvoiceItem: (id: string) => void;

  updateInvoiceFile: (id: string, file: Partial<InvoiceFile>) => void;
  deleteInvoiceFile: (id: string) => void;

  addExpense: (
    expense: Omit<Expense, "id" | "expenseCode" | "createdAt" | "updatedAt">
  ) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  addDailyLog: (log: Omit<DailyLog, "id" | "createdAt" | "updatedAt">) => void;
  updateDailyLog: (id: string, log: Partial<DailyLog>) => Promise<void>;
  deleteDailyLog: (id: string) => Promise<void>;

  // File management functions
  addTimesheetFile: (timesheetId: string, file: TimesheetFile) => void;
  removeTimesheetFile: (timesheetId: string, fileId: string) => void;
  addInvoiceFile: (invoiceId: string, file: InvoiceFile) => void;
  removeInvoiceFile: (invoiceId: string, fileId: string) => void;
  addExpenseFile: (expenseId: string, file: ExpenseFile) => void;
  removeExpenseFile: (expenseId: string, fileId: string) => void;

  // Computed
  getDashboardStats: () => DashboardStats;
  getClientById: (id: string) => Client | undefined;

  getProjectById: (id: string) => Project | undefined;
  getTimesheetById: (id: string) => Timesheet | undefined;
  getTimesheetEntries: (timesheetId: string) => TimesheetEntry[];
  getInvoicesByClient: (clientId: string) => Invoice[];
  getInvoiceFilesByInvoice: (invoiceId: string) => InvoiceFile[];
  getInvoiceFilesByMonth: (month: string) => InvoiceFile[];
  getExpensesByProject: (projectId: string) => Expense[];
  generateInvoiceFromTimesheet: (timesheetId: string) => Invoice;
  getDailyLogsByDate: (date: Date) => DailyLog[];
  getDailyLogsByCategory: (category: DailyLog["category"]) => DailyLog[];

  // Helper functions to demonstrate data relationships
  getProjectsByClient: (clientId: string) => Project[];
  getTimesheetsByProject: (projectId: string) => Timesheet[];
  getInvoicesByTimesheet: (timesheetId: string) => Invoice[];
  getClientByProject: (projectId: string) => Client | undefined;
  getProjectByTimesheet: (timesheetId: string) => Project | undefined;
  getTimesheetByInvoice: (invoiceId: string) => Timesheet | undefined;

  // Clear all data (for reset functionality)
  clearAllData: () => void;

  // Replace all data (for import functionality)
  replaceAllData: (data: Partial<AccountingStore>) => void;

  // Load data from Supabase
  loadDataFromSupabase: () => Promise<void>;

  // Sync data between Supabase and local store
  syncWithSupabase: () => Promise<void>;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useAccountingStore = create<AccountingStore>()(
  persist(
    (set, get) => ({
      companyProfile: {
        id: "company1",
        name: "Brandsmashers Tech",
        legalName: "Brandsmashers Tech Private Limited",
        email: "info@brandsmashers.com",
        phone: "+91-22-1234-5678",
        website: "https://www.brandsmashers.com/",
        address: "123 Tech Park, Andheri West, Mumbai - 400058",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400058",
        country: "India",
        gstin: "27AADCB1234Z1Z5",
        pan: "AADCB1234Z",
        cinNumber: "U72200MH2020PTC345678",
        logo: "",
        description: "Leading technology solutions provider",
        foundedYear: 2020,
        industry: "Technology",
        companySize: "medium",
        annualRevenue: 50000000,
        employeeCount: 50,
        bankDetails: {
          bankName: "HDFC Bank",
          accountNumber: "1234567890",
          ifscCode: "HDFC0001234",
          branch: "Andheri West",
        },
        contactPerson: {
          name: "John Doe",
          email: "john@brandsmashers.com",
          phone: "+91-98765-43210",
          designation: "CEO",
        },
        socialMedia: {
          linkedin: "https://linkedin.com/company/brandsmashers",
          twitter: "https://twitter.com/brandsmashers",
          facebook: "https://facebook.com/brandsmashers",
          instagram: "https://instagram.com/brandsmashers",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      clients: [],
      projects: [],
      invoices: [],
      invoiceItems: [],
      invoiceFiles: [],
      expenses: [],
      timesheets: [],
      timesheetEntries: [],
      dailyLogs: [],

      addClient: client => {
        const newClient: Client = {
          ...client,
          id: generateId(),
          clientCode: CodeGenerator.generateClientCode(get().clients),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set(state => ({ clients: [...state.clients, newClient] }));
      },

      updateClient: async (id, client) => {
        // Update frontend state immediately for responsive UI
        set(state => ({
          clients: state.clients.map(c =>
            c.id === id ? { ...c, ...client, updatedAt: new Date() } : c
          ),
        }));

        // Persist to localStorage for web-based app
        try {
          if (typeof window !== "undefined") {
            const currentData = JSON.parse(
              localStorage.getItem("accountingData") || "{}"
            );
            currentData.clients = get().clients;
            localStorage.setItem("accountingData", JSON.stringify(currentData));
          }
        } catch (error) {
          console.error("Failed to save client to localStorage:", error);
        }
      },

      deleteClient: async id => {
        // Update frontend state immediately for responsive UI
        set(state => ({
          clients: state.clients.filter(c => c.id !== id),
        }));

        // Persist to localStorage for web-based app
        try {
          if (typeof window !== "undefined") {
            const currentData = JSON.parse(
              localStorage.getItem("accountingData") || "{}"
            );
            currentData.clients = get().clients;
            localStorage.setItem("accountingData", JSON.stringify(currentData));
          }
        } catch (error) {
          console.error("Failed to save clients to localStorage:", error);
        }
      },

      updateCompanyProfile: async profile => {
        // Update frontend state immediately for responsive UI
        set(state => ({
          companyProfile: {
            ...state.companyProfile,
            ...profile,
            updatedAt: new Date(),
          },
        }));

        // Persist to localStorage for web-based app
        try {
          if (typeof window !== "undefined") {
            const currentData = JSON.parse(
              localStorage.getItem("accountingData") || "{}"
            );
            currentData.companyProfile = get().companyProfile;
            localStorage.setItem("accountingData", JSON.stringify(currentData));
          }
        } catch (error) {
          console.error(
            "Failed to save company profile to localStorage:",
            error
          );
        }
      },

      addProject: project => {
        const newProject: Project = {
          ...project,
          id: generateId(),
          projectCode: CodeGenerator.generateProjectCode(get().projects),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set(state => ({ projects: [...state.projects, newProject] }));
      },

      updateProject: async (id, project) => {
        // Update frontend state immediately for responsive UI
        set(state => ({
          projects: state.projects.map(p =>
            p.id === id ? { ...p, ...project, updatedAt: new Date() } : p
          ),
        }));

        // Persist to localStorage for web-based app
        try {
          if (typeof window !== "undefined") {
            const currentData = JSON.parse(
              localStorage.getItem("accountingData") || "{}"
            );
            currentData.projects = get().projects;
            localStorage.setItem("accountingData", JSON.stringify(currentData));
          }
        } catch (error) {
          console.error("Failed to save projects to localStorage:", error);
        }
      },

      deleteProject: async id => {
        // Update frontend state immediately for responsive UI
        set(state => ({
          projects: state.projects.filter(p => p.id !== id),
        }));

        // Persist to localStorage for web-based app
        try {
          if (typeof window !== "undefined") {
            const currentData = JSON.parse(
              localStorage.getItem("accountingData") || "{}"
            );
            currentData.projects = get().projects;
            localStorage.setItem("accountingData", JSON.stringify(currentData));
          }
        } catch (error) {
          console.error("Failed to save projects to localStorage:", error);
        }
      },

      addTimesheet: async timesheet => {
        try {
          // Create timesheet in Supabase using utility function
          const createdTimesheet = await createTimesheetInSupabase(timesheet);

          if (createdTimesheet) {
            // Convert Supabase response to frontend format and update store
            const newTimesheet: Timesheet = {
              ...timesheet,
              id: createdTimesheet.id,
              timesheetCode: createdTimesheet.timesheet_code,
              createdAt: new Date(createdTimesheet.created_at),
              updatedAt: new Date(createdTimesheet.updated_at),
            };

            set(state => ({ timesheets: [...state.timesheets, newTimesheet] }));
          }
        } catch (error) {
          console.error("Failed to create timesheet in Supabase:", error);
          // Fallback to local storage if Supabase fails
          const newTimesheet: Timesheet = {
            ...timesheet,
            id: generateId(),
            timesheetCode: CodeGenerator.generateTimesheetCode(
              timesheet.month,
              get().timesheets
            ),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set(state => ({ timesheets: [...state.timesheets, newTimesheet] }));
        }
      },

      updateTimesheet: async (id, timesheet) => {
        console.log("🔄 Store updateTimesheet called with:", { id, timesheet });

        try {
          // Update timesheet in Supabase using utility function
          const updatedTimesheet = await updateTimesheetInSupabase(
            id,
            timesheet
          );

          if (updatedTimesheet) {
            // Update frontend state with Supabase response
            set(state => ({
              timesheets: state.timesheets.map(t =>
                t.id === id
                  ? {
                      ...t,
                      ...timesheet,
                      updatedAt: new Date(updatedTimesheet.updated_at),
                    }
                  : t
              ),
            }));
          }
        } catch (error) {
          console.error("Failed to update timesheet in Supabase:", error);
          // Fallback to local storage update
          set(state => ({
            timesheets: state.timesheets.map(t =>
              t.id === id ? { ...t, ...timesheet, updatedAt: new Date() } : t
            ),
          }));
        }

        // Persist to localStorage for web-based app
        try {
          if (typeof window !== "undefined") {
            const currentData = JSON.parse(
              localStorage.getItem("accountingData") || "{}"
            );
            currentData.timesheets = get().timesheets;
            localStorage.setItem("accountingData", JSON.stringify(currentData));
          }
        } catch (error) {
          console.error("Failed to save timesheets to localStorage:", error);
        }
      },

      // For web-based app, this function is not needed as data is loaded from localStorage
      reloadTimesheet: async (id: string) => {
        console.log(
          "🔄 reloadTimesheet called for id:",
          id,
          "- not needed in web version"
        );
      },

      deleteTimesheet: id => {
        set(state => ({
          timesheets: state.timesheets.filter(t => t.id !== id),
        }));
      },

      addTimesheetEntry: entry => {
        const newEntry: TimesheetEntry = {
          ...entry,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set(state => ({
          timesheetEntries: [...state.timesheetEntries, newEntry],
        }));
      },

      updateTimesheetEntry: (id, entry) => {
        set(state => ({
          timesheetEntries: state.timesheetEntries.map(e =>
            e.id === id ? { ...e, ...entry, updatedAt: new Date() } : e
          ),
        }));
      },

      deleteTimesheetEntry: id => {
        set(state => ({
          timesheetEntries: state.timesheetEntries.filter(e => e.id !== id),
        }));
      },

      addInvoice: async invoice => {
        try {
          // Generate invoice number since it's not provided in the input
          const invoiceNumber = CodeGenerator.generateInvoiceCode(
            get().invoices
          );

          // Create invoice in Supabase using utility function
          const createdInvoice = await createInvoiceInSupabase(
            invoice,
            invoiceNumber
          );

          if (createdInvoice) {
            // Convert Supabase response to frontend format and update store
            const newInvoice: Invoice = {
              ...invoice,
              id: createdInvoice.id,
              invoiceNumber: createdInvoice.invoice_number,
              createdAt: new Date(createdInvoice.created_at),
              updatedAt: new Date(createdInvoice.updated_at),
            };

            set(state => ({ invoices: [...state.invoices, newInvoice] }));
          }
        } catch (error) {
          console.error("Failed to create invoice in Supabase:", error);
          // Fallback to local storage if Supabase fails
          const newInvoice: Invoice = {
            ...invoice,
            id: generateId(),
            invoiceNumber: CodeGenerator.generateInvoiceCode(get().invoices),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set(state => ({ invoices: [...state.invoices, newInvoice] }));
        }
      },

      updateInvoice: async (id, invoice) => {
        try {
          // Update invoice in Supabase using utility function
          const updatedInvoice = await updateInvoiceInSupabase(id, invoice);

          if (updatedInvoice) {
            // Update frontend state with Supabase response
            set(state => ({
              invoices: state.invoices.map(i =>
                i.id === id
                  ? {
                      ...i,
                      ...invoice,
                      updatedAt: new Date(updatedInvoice.updated_at),
                    }
                  : i
              ),
            }));
          }
        } catch (error) {
          console.error("Failed to update invoice in Supabase:", error);
          // Fallback to local storage update
          set(state => ({
            invoices: state.invoices.map(i =>
              i.id === id ? { ...i, ...invoice, updatedAt: new Date() } : i
            ),
          }));
        }

        // Persist to localStorage for web-based app
        try {
          if (typeof window !== "undefined") {
            const currentData = JSON.parse(
              localStorage.getItem("accountingData") || "{}"
            );
            currentData.invoices = get().invoices;
            localStorage.setItem("accountingData", JSON.stringify(currentData));
          }
        } catch (error) {
          console.error("Failed to save invoices to localStorage:", error);
        }
      },

      deleteInvoice: async id => {
        // Update frontend state immediately for responsive UI
        set(state => ({
          invoices: state.invoices.filter(i => i.id !== id),
        }));

        // Persist to localStorage for web-based app
        try {
          if (typeof window !== "undefined") {
            const currentData = JSON.parse(
              localStorage.getItem("accountingData") || "{}"
            );
            currentData.invoices = get().invoices;
            localStorage.setItem("accountingData", JSON.stringify(currentData));
          }
        } catch (error) {
          console.error("Failed to save invoices to localStorage:", error);
        }
      },

      addInvoiceItem: item => {
        const newItem: InvoiceItem = {
          ...item,
          id: generateId(),
        };
        set(state => ({
          invoiceItems: [...state.invoiceItems, newItem],
        }));
      },

      updateInvoiceItem: (id, item) => {
        set(state => ({
          invoiceItems: state.invoiceItems.map(i =>
            i.id === id ? { ...i, ...item } : i
          ),
        }));
      },

      deleteInvoiceItem: id => {
        set(state => ({
          invoiceItems: state.invoiceItems.filter(i => i.id !== id),
        }));
      },

      updateInvoiceFile: (id, file) => {
        set(state => ({
          invoiceFiles: state.invoiceFiles.map(f =>
            f.id === id ? { ...f, ...file } : f
          ),
        }));
      },

      deleteInvoiceFile: id => {
        set(state => ({
          invoiceFiles: state.invoiceFiles.filter(f => f.id !== id),
        }));
      },

      addExpense: expense => {
        const newExpense: Expense = {
          ...expense,
          id: generateId(),
          expenseCode: CodeGenerator.generateExpenseCode(get().expenses),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set(state => ({ expenses: [...state.expenses, newExpense] }));
      },

      updateExpense: async (id, expense) => {
        // Update frontend state immediately for responsive UI
        set(state => ({
          expenses: state.expenses.map(e =>
            e.id === id ? { ...e, ...expense, updatedAt: new Date() } : e
          ),
        }));

        // Persist to localStorage for web-based app
        try {
          if (typeof window !== "undefined") {
            const currentData = JSON.parse(
              localStorage.getItem("accountingData") || "{}"
            );
            currentData.expenses = get().expenses;
            localStorage.setItem("accountingData", JSON.stringify(currentData));
          }
        } catch (error) {
          console.error("Failed to save expenses to localStorage:", error);
        }
      },

      deleteExpense: async id => {
        // Update frontend state immediately for responsive UI
        set(state => ({
          expenses: state.expenses.filter(e => e.id !== id),
        }));

        // Persist to localStorage for web-based app
        try {
          if (typeof window !== "undefined") {
            const currentData = JSON.parse(
              localStorage.getItem("accountingData") || "{}"
            );
            currentData.expenses = get().expenses;
            localStorage.setItem("accountingData", JSON.stringify(currentData));
          }
        } catch (error) {
          console.error("Failed to save expenses to localStorage:", error);
        }
      },

      addDailyLog: log => {
        const newLog: DailyLog = {
          ...log,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set(state => ({ dailyLogs: [...state.dailyLogs, newLog] }));
      },

      updateDailyLog: async (id, log) => {
        // Update frontend state immediately for responsive UI
        set(state => ({
          dailyLogs: state.dailyLogs.map(l =>
            l.id === id ? { ...l, ...log, updatedAt: new Date() } : l
          ),
        }));

        // Persist to localStorage for web-based app
        try {
          if (typeof window !== "undefined") {
            const currentData = JSON.parse(
              localStorage.getItem("accountingData") || "{}"
            );
            currentData.dailyLogs = get().dailyLogs;
            localStorage.setItem("accountingData", JSON.stringify(currentData));
          }
        } catch (error) {
          console.error("Failed to save daily logs to localStorage:", error);
        }
      },

      deleteDailyLog: async id => {
        // Update frontend state immediately for responsive UI
        set(state => ({
          dailyLogs: state.dailyLogs.filter(l => l.id !== id),
        }));

        // Persist to localStorage for web-based app
        try {
          if (typeof window !== "undefined") {
            const currentData = JSON.parse(
              localStorage.getItem("accountingData") || "{}"
            );
            currentData.dailyLogs = get().dailyLogs;
            localStorage.setItem("accountingData", JSON.stringify(currentData));
          }
        } catch (error) {
          console.error("Failed to save daily logs to localStorage:", error);
        }
      },

      addTimesheetFile: (timesheetId, file) => {
        set(state => ({
          timesheets: state.timesheets.map(t =>
            t.id === timesheetId
              ? {
                  ...t,
                  files: [...(t.files || []), file],
                }
              : t
          ),
        }));
      },

      removeTimesheetFile: (timesheetId, fileId) => {
        set(state => ({
          timesheets: state.timesheets.map(t =>
            t.id === timesheetId
              ? {
                  ...t,
                  files: (t.files || []).filter(file => file.id !== fileId),
                }
              : t
          ),
        }));
      },

      addInvoiceFile: (invoiceId, file) => {
        set(state => ({
          invoices: state.invoices.map(i =>
            i.id === invoiceId
              ? {
                  ...i,
                  files: [...(i.files || []), file],
                }
              : i
          ),
        }));
      },

      removeInvoiceFile: (invoiceId, fileId) => {
        set(state => ({
          invoices: state.invoices.map(i =>
            i.id === invoiceId
              ? {
                  ...i,
                  files: (i.files || []).filter(file => file.id !== fileId),
                }
              : i
          ),
        }));
      },

      addExpenseFile: (expenseId, file) => {
        set(state => ({
          expenses: state.expenses.map(e =>
            e.id === expenseId
              ? {
                  ...e,
                  files: [...(e.files || []), file],
                }
              : e
          ),
        }));
      },

      removeExpenseFile: (expenseId, fileId) => {
        set(state => ({
          expenses: state.expenses.map(e =>
            e.id === expenseId
              ? {
                  ...e,
                  files: (e.files || []).filter(file => file.id !== fileId),
                }
              : e
          ),
        }));
      },

      getDashboardStats: () => {
        const totalRevenue = get().invoices.reduce((sum, invoice) => {
          return invoice.status === "paid" ? sum + invoice.total : sum;
        }, 0);

        const totalExpenses = get().expenses.reduce((sum, expense) => {
          return sum + expense.amount;
        }, 0);

        const outstandingAmount = get().invoices.reduce((sum, invoice) => {
          return invoice.status === "sent" ? sum + invoice.total : sum;
        }, 0);

        const activeProjects = get().projects.filter(
          project => project.status === "active"
        ).length;

        const activeClients = get().clients.length;

        const pendingTimesheets = get().timesheets.filter(
          t => t.status === "submitted"
        ).length;

        const approvedTimesheets = get().timesheets.filter(
          t => t.status === "approved"
        ).length;

        const invoicedTimesheets = get().timesheets.filter(
          t => t.status === "invoiced"
        ).length;

        return {
          totalRevenue,
          totalExpenses,
          netProfit: totalRevenue - totalExpenses,
          outstandingAmount,
          activeProjects,
          activeClients,
          pendingTimesheets,
          approvedTimesheets,
          invoicedTimesheets,
        };
      },

      getClientById: id => {
        return get().clients.find(c => c.id === id);
      },

      getProjectById: id => {
        return get().projects.find(p => p.id === id);
      },

      getTimesheetById: id => {
        return get().timesheets.find(t => t.id === id);
      },

      getTimesheetEntries: timesheetId => {
        return get().timesheetEntries.filter(
          e => e.timesheetId === timesheetId
        );
      },

      getInvoicesByClient: clientId => {
        return get().invoices.filter(i => i.clientId === clientId);
      },

      getInvoiceFilesByInvoice: invoiceId => {
        return get().invoices.find(i => i.id === invoiceId)?.files || [];
      },

      getInvoiceFilesByMonth: _month => {
        // For now, return all files since we removed the month field
        // In a real implementation, you might want to add month metadata or use a different approach
        return get().invoiceFiles;
      },

      getExpensesByProject: projectId => {
        return get().expenses.filter(e => e.projectId === projectId);
      },

      // Load data from Supabase
      loadDataFromSupabase: async () => {
        try {
          console.log("🔄 Loading data from Supabase...");

          // Load timesheets
          const timesheetsResponse = await TimesheetService.getTimesheets();
          if (timesheetsResponse?.data) {
            const supabaseTimesheets = timesheetsResponse.data.map(ts => ({
              id: ts.id,
              timesheetCode: ts.timesheet_code || `TMS-${new Date(ts.week_start_date).getFullYear()}-${String(new Date(ts.week_start_date).getMonth() + 1).padStart(2, '0')}-${ts.id.slice(-4)}`,
              userId: ts.user_id,
              projectId: ts.project_id,
              month: `${new Date(ts.week_start_date).getFullYear()}-${String(new Date(ts.week_start_date).getMonth() + 1).padStart(2, '0')}`,
              year: new Date(ts.week_start_date).getFullYear(),
              weekStartDate: ts.week_start_date,
              weekEndDate: ts.week_end_date,
              status: ts.status,
              notes: ts.notes || "",
              totalHours: ts.total_hours || 0,
              totalAmount: ts.total_amount || 0,
              totalWorkingDays: 22, // Default value, calculate if needed
              daysWorked: 0, // Calculate from entries if needed
              daysLeave: 0, // Default value
              hoursPerDay: 8, // Default value
              billingRate: 0, // Get from project if needed
              submittedAt: undefined,
              approvedAt: undefined,
              approvedBy: undefined,
              rejectionReason: undefined,
              invoiceId: undefined,
              invoicedAt: undefined,
              files: [],
              entries: [],
              createdAt: new Date(ts.created_at),
              updatedAt: new Date(ts.updated_at),
            }));

            set({ timesheets: supabaseTimesheets as any });
          }

          // Load invoices
          const invoicesResponse = await InvoiceService.getInvoices();
          if (invoicesResponse?.data) {
            const supabaseInvoices = invoicesResponse.data.map(inv => ({
              id: inv.id,
              invoiceNumber: inv.invoice_number || `INV-${inv.id.slice(-6)}`,
              timesheetId: "", // Empty string instead of undefined
              clientId: inv.client_id,
              projectId: inv.project_id,
              issueDate: inv.issue_date ? new Date(inv.issue_date) : new Date(),
              dueDate: inv.due_date ? new Date(inv.due_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              status: inv.status,
              subtotal: inv.subtotal || 0,
              taxRate: inv.tax_rate || 0,
              taxAmount: inv.tax_amount || 0,
              total: inv.total_amount || 0,
              poNumber: undefined,
              deliveryNote: undefined,
              paymentTerms: inv.terms || "Net 30",
              items: [], // Load invoice items separately if needed
              files: [],
              notes: inv.notes || "",
              referenceNo: undefined,
              buyerOrderNo: undefined,
              buyerOrderDate: undefined,
              purchaseOrderNo: undefined,
              purchaseOrderDate: undefined,
              dispatchDocNo: undefined,
              deliveryNoteDate: undefined,
              dispatchedThrough: undefined,
              destination: undefined,
              termsOfDelivery: undefined,
              createdAt: new Date(inv.created_at),
              updatedAt: new Date(inv.updated_at),
            }));

            set({ invoices: supabaseInvoices as any });
          }

          console.log("✅ Data loaded from Supabase successfully");
        } catch (error) {
          console.error("❌ Failed to load data from Supabase:", error);
        }
      },

      // Sync data between Supabase and local store
      syncWithSupabase: async () => {
        try {
          console.log("🔄 Syncing data with Supabase...");
          await get().loadDataFromSupabase();
          console.log("✅ Data synced with Supabase successfully");
        } catch (error) {
          console.error("❌ Failed to sync with Supabase:", error);
        }
      },

      generateInvoiceFromTimesheet: timesheetId => {
        const timesheet = get().timesheets.find(t => t.id === timesheetId);
        if (!timesheet) {
          throw new Error(`Timesheet with ID ${timesheetId} not found.`);
        }

        const project = get().projects.find(p => p.id === timesheet.projectId);

        if (!project) {
          throw new Error("Project not found for timesheet.");
        }

        const client = get().clients.find(c => c.id === project.clientId);

        if (!client) {
          throw new Error("Client not found for project.");
        }

        const invoice: Invoice = {
          id: `invoice_${Date.now()}`,
          timesheetId: timesheet.id,
          clientId: project.clientId,
          projectId: timesheet.projectId,
          invoiceNumber: `INV-${Date.now()}`,
          issueDate: new Date(),
          dueDate: addDays(new Date(), 30),
          status: "draft",
          subtotal: timesheet.totalAmount || 0,
          taxRate: 18,
          taxAmount: (timesheet.totalAmount || 0) * 0.18,
          total: (timesheet.totalAmount || 0) * 1.18,
          paymentTerms: "Net 30",
          items: [
            {
              id: `item_${Date.now()}`,
              invoiceId: `invoice_${Date.now()}`,
              title: `Timesheet for ${timesheet.month}`,
              description: `Professional services for ${timesheet.month} ${timesheet.year}`,
              quantity: timesheet.daysWorked || 0,
              unitPrice: timesheet.billingRate || 0,
              total: timesheet.totalAmount || 0,
              hsnCode: "998314",
              unit: "Hours",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return invoice;
      },

      getDailyLogsByDate: date => {
        return get().dailyLogs.filter(log => {
          const logDate = new Date(log.date);
          return (
            logDate.getDate() === date.getDate() &&
            logDate.getMonth() === date.getMonth() &&
            logDate.getFullYear() === date.getFullYear()
          );
        });
      },

      getDailyLogsByCategory: category => {
        return get().dailyLogs.filter(log => log.category === category);
      },

      // Helper functions to demonstrate data relationships
      getProjectsByClient: clientId => {
        return get().projects.filter(p => p.clientId === clientId);
      },

      getTimesheetsByProject: projectId => {
        return get().timesheets.filter(t => t.projectId === projectId);
      },

      getInvoicesByTimesheet: timesheetId => {
        return get().invoices.filter(i => i.timesheetId === timesheetId);
      },

      getClientByProject: projectId => {
        const project = get().projects.find(p => p.id === projectId);
        if (!project) return undefined;
        return get().clients.find(c => c.id === project.clientId);
      },

      getProjectByTimesheet: timesheetId => {
        const timesheet = get().timesheets.find(t => t.id === timesheetId);
        if (!timesheet) return undefined;
        return get().projects.find(p => p.id === timesheet.projectId);
      },

      getTimesheetByInvoice: invoiceId => {
        const invoice = get().invoices.find(i => i.id === invoiceId);
        if (!invoice) return undefined;
        return get().timesheets.find(t => t.id === invoice.timesheetId);
      },

      // Clear all data (for reset functionality)
      clearAllData: () =>
        set(() => ({
          clients: [],
          projects: [],
          timesheets: [],
          invoices: [],
          expenses: [],
          dailyLogs: [],
          companyProfile: {
            id: "company1",
            name: "Brandsmashers Tech",
            legalName: "Brandsmashers Tech Private Limited",
            email: "info@brandsmashers.com",
            phone: "+91-22-1234-5678",
            website: "https://www.brandsmashers.com/",
            address: "123 Tech Park, Andheri West, Mumbai - 400058",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400058",
            country: "India",
            gstin: "27AADCB1234Z1Z5",
            pan: "AADCB1234Z",
            cinNumber: "U72200MH2020PTC345678",
            logo: "",
            description: "Leading technology solutions provider",
            foundedYear: 2020,
            industry: "Technology",
            companySize: "medium",
            annualRevenue: 50000000,
            employeeCount: 50,
            bankDetails: {
              bankName: "HDFC Bank",
              accountNumber: "1234567890",
              ifscCode: "HDFC0001234",
              branch: "Andheri West",
            },
            contactPerson: {
              name: "John Doe",
              email: "john@brandsmashers.com",
              phone: "+91-98765-43210",
              designation: "CEO",
            },
            socialMedia: {
              linkedin: "https://linkedin.com/company/brandsmashers",
              twitter: "https://twitter.com/brandsmashers",
              facebook: "https://facebook.com/brandsmashers",
              instagram: "https://instagram.com/brandsmashers",
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })),

      // Replace all data (for import functionality)
      replaceAllData: (data: Partial<AccountingStore>) => {
        set(state => ({
          ...state,
          ...data,
        }));
      },
    }),
    {
      name: "bst-accounting-store",
      partialize: state => ({
        clients: state.clients,
        projects: state.projects,
        timesheets: state.timesheets,
        invoices: state.invoices,
        expenses: state.expenses,
        dailyLogs: state.dailyLogs,
        companyProfile: state.companyProfile,
      }),
    }
  )
);
