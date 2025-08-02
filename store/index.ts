import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Client,
  Project,
  Invoice,
  InvoiceItem,
  InvoiceFile,
  Expense,
  Timesheet,
  TimesheetEntry,
  CompanyProfile,
  DashboardStats,
  DailyLog,
} from "@/types";

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
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => void;
  addClient: (client: Omit<Client, "id" | "createdAt" | "updatedAt">) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addProject: (
    project: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addTimesheet: (
    timesheet: Omit<Timesheet, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateTimesheet: (id: string, timesheet: Partial<Timesheet>) => void;
  deleteTimesheet: (id: string) => void;

  addTimesheetEntry: (
    entry: Omit<TimesheetEntry, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateTimesheetEntry: (id: string, entry: Partial<TimesheetEntry>) => void;
  deleteTimesheetEntry: (id: string) => void;

  addInvoice: (
    invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  addInvoiceItem: (item: Omit<InvoiceItem, "id">) => void;
  updateInvoiceItem: (id: string, item: Partial<InvoiceItem>) => void;
  deleteInvoiceItem: (id: string) => void;

  addInvoiceFile: (
    file: Omit<InvoiceFile, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateInvoiceFile: (id: string, file: Partial<InvoiceFile>) => void;
  deleteInvoiceFile: (id: string) => void;

  addExpense: (
    expense: Omit<Expense, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  addDailyLog: (log: Omit<DailyLog, "id" | "createdAt" | "updatedAt">) => void;
  updateDailyLog: (id: string, log: Partial<DailyLog>) => void;
  deleteDailyLog: (id: string) => void;

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
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useAccountingStore = create<AccountingStore>()(
  persist(
    (set, get) => ({
      companyProfile: {
        id: "1",
        name: "BST",
        legalName: "BST Private Limited",
        email: "info@bst.com",
        phone: "+91-98765-43210",
        website: "https://bst.com",
        address: "123 Business Park, Whitefield",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560066",
        country: "India",
        gstNumber: "GST123456789",
        panNumber: "ABCDE1234F",
        cinNumber: "U12345KA2023PTC123456",
        logo: "https://businesssolutionstech.com/logo.png",
        description:
          "Leading technology solutions provider specializing in custom software development, web applications, and digital transformation services.",
        foundedYear: 2023,
        industry: "Technology",
        companySize: "medium",
        annualRevenue: 25000000,
        employeeCount: 25,
        bankDetails: {
          accountNumber: "1234567890",
          ifscCode: "SBIN0001234",
          bankName: "State Bank of India",
          branch: "Whitefield Branch",
        },
        contactPerson: {
          name: "Rajesh Kumar",
          email: "rajesh@businesssolutionstech.com",
          phone: "+91-98765-43211",
          designation: "Founder & CEO",
        },
        socialMedia: {
          linkedin: "https://linkedin.com/company/business-solutions-tech",
          twitter: "https://twitter.com/bst_tech",
          facebook: "https://facebook.com/businesssolutionstech",
        },
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2023-01-01"),
      },
      clients: [
        {
          id: "client1",
          name: "TechCorp Solutions",
          email: "accounts@techcorp.com",
          phone: "+91-98765-43210",
          company: "TechCorp Solutions Pvt Ltd",
          address: "123 Tech Park, Bangalore, Karnataka 560001",
          gstId: "GST123456789",
          companyAddress:
            "123 Tech Park, Whitefield, Bangalore, Karnataka 560066",
          companyWebsite: "https://techcorp.com",
          companyLinkedin: "https://linkedin.com/company/techcorp-solutions",
          companyOwner: "Rajesh Kumar",
          pocName: "Priya Sharma",
          pocEmail: "priya.sharma@techcorp.com",
          pocContact: "+91-98765-43211",
          companyLogo: "https://techcorp.com/logo.png",
          industry: "Technology",
          companySize: "medium",
          status: "active",
          source: "Referral",
          notes: "High-value client with multiple ongoing projects",
          tags: ["technology", "e-commerce", "premium"],
          annualRevenue: 50000000,
          employeeCount: 150,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        {
          id: "client2",
          name: "Digital Innovations",
          email: "finance@digitalinnovations.com",
          phone: "+91-87654-32109",
          company: "Digital Innovations Ltd",
          address: "456 Innovation Hub, Mumbai, Maharashtra 400001",
          gstId: "GST987654321",
          companyAddress:
            "456 Innovation Hub, Andheri West, Mumbai, Maharashtra 400058",
          companyWebsite: "https://digitalinnovations.com",
          companyLinkedin: "https://linkedin.com/company/digital-innovations",
          companyOwner: "Amit Patel",
          pocName: "Neha Singh",
          pocEmail: "neha.singh@digitalinnovations.com",
          pocContact: "+91-87654-32110",
          companyLogo: "https://digitalinnovations.com/logo.png",
          industry: "Digital Marketing",
          companySize: "small",
          status: "active",
          source: "Website",
          notes: "Startup client with potential for growth",
          tags: ["startup", "mobile", "marketing"],
          annualRevenue: 15000000,
          employeeCount: 25,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        {
          id: "client3",
          name: "Global Systems",
          email: "accounts@globalsystems.com",
          phone: "+91-76543-21098",
          company: "Global Systems Pvt Ltd",
          address: "789 Business Park, Delhi, Delhi 110001",
          gstId: "GST456789123",
          companyAddress:
            "789 Business Park, Connaught Place, Delhi, Delhi 110001",
          companyWebsite: "https://globalsystems.com",
          companyLinkedin: "https://linkedin.com/company/global-systems",
          companyOwner: "Vikram Malhotra",
          pocName: "Rahul Verma",
          pocEmail: "rahul.verma@globalsystems.com",
          pocContact: "+91-76543-21099",
          companyLogo: "https://globalsystems.com/logo.png",
          industry: "Enterprise Software",
          companySize: "large",
          status: "active",
          source: "Cold Outreach",
          notes: "Enterprise client with complex requirements",
          tags: ["enterprise", "cloud", "legacy"],
          annualRevenue: 200000000,
          employeeCount: 500,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
      ],

      projects: [
        {
          id: "project1",
          projectCode: "BST-01",
          name: "E-commerce Platform Development",
          clientId: "client1", // Derived from client1
          description:
            "Full-stack e-commerce platform with payment integration",
          startDate: new Date("2024-01-15"),
          status: "active",
          budget: 2500000,
          billingTerms: 30,
          billingRate: 1200, // Standard rate for TechCorp Solutions
          estimatedHours: 400,
          gstRate: 18,
          gstInclusive: false,
          totalCost: 2950000,
          costBreakdown: {
            subtotal: 2500000,
            gstAmount: 450000,
            total: 2950000,
          },
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        {
          id: "project2",
          projectCode: "BST-02",
          name: "Mobile App Development",
          clientId: "client2", // Derived from client2
          description: "Cross-platform mobile application for iOS and Android",
          startDate: new Date("2024-02-01"),
          status: "active",
          budget: 1800000,
          billingTerms: 45,
          billingRate: 1000, // Standard rate for Digital Innovations
          estimatedHours: 300,
          gstRate: 18,
          gstInclusive: false,
          totalCost: 2124000,
          costBreakdown: {
            subtotal: 1800000,
            gstAmount: 324000,
            total: 2124000,
          },
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        {
          id: "project3",
          projectCode: "BST-03",
          name: "Cloud Migration Project",
          clientId: "client3", // Derived from client3
          description: "Legacy system migration to cloud infrastructure",
          startDate: new Date("2024-03-01"),
          status: "active",
          budget: 3200000,
          billingTerms: 60,
          billingRate: 1500, // Premium rate for Global Systems (enterprise client)
          estimatedHours: 500,
          gstRate: 18,
          gstInclusive: false,
          totalCost: 3776000,
          costBreakdown: {
            subtotal: 3200000,
            gstAmount: 576000,
            total: 3776000,
          },
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
      ],
      invoices: [
        {
          id: "invoice1",
          timesheetId: "timesheet1", // Derived from timesheet1
          clientId: "client1", // Derived from timesheet1 -> project1 -> client1
          projectId: "project1", // Derived from timesheet1 -> project1
          invoiceNumber: "INV-2024-001",
          issueDate: new Date("2024-01-31"),
          dueDate: new Date("2024-02-15"),
          status: "paid",
          subtotal: 160000, // Derived from timesheet1.totalAmount
          taxRate: 18,
          taxAmount: 28800,
          total: 188800,
          notes: "January 2024 development services",
          createdAt: new Date("2024-01-31"),
          updatedAt: new Date("2024-01-31"),
        },
        {
          id: "invoice2",
          timesheetId: "timesheet2", // Derived from timesheet2
          clientId: "client2", // Derived from timesheet2 -> project2 -> client2
          projectId: "project2", // Derived from timesheet2 -> project2
          invoiceNumber: "INV-2024-002",
          issueDate: new Date("2024-02-29"),
          dueDate: new Date("2024-03-15"),
          status: "sent",
          subtotal: 172800, // Derived from timesheet2.totalAmount
          taxRate: 18,
          taxAmount: 31104,
          total: 203904,
          notes: "February 2024 development services",
          createdAt: new Date("2024-02-29"),
          updatedAt: new Date("2024-02-29"),
        },
      ],
      invoiceItems: [],
      invoiceFiles: [],
      expenses: [
        {
          id: "expense1",
          category: "Office Rent",
          description: "Monthly office rent - Bangalore",
          amount: 75000,
          date: new Date("2024-01-01"),
          projectId: "project1",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        {
          id: "expense2",
          category: "Software Licenses",
          description: "Annual software licenses renewal",
          amount: 45000,
          date: new Date("2024-01-15"),
          projectId: "project2",
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-15"),
        },
        {
          id: "expense3",
          category: "Internet & Utilities",
          description: "Monthly internet and utility bills",
          amount: 15000,
          date: new Date("2024-01-31"),
          projectId: "project3",
          createdAt: new Date("2024-01-31"),
          updatedAt: new Date("2024-01-31"),
        },
        {
          id: "expense4",
          category: "Marketing",
          description: "Digital marketing campaign",
          amount: 25000,
          date: new Date("2024-02-15"),
          projectId: "project1",
          createdAt: new Date("2024-02-15"),
          updatedAt: new Date("2024-02-15"),
        },
        {
          id: "expense5",
          category: "Travel",
          description: "Client meeting travel expenses",
          amount: 12000,
          date: new Date("2024-02-28"),
          projectId: "project2",
          createdAt: new Date("2024-02-28"),
          updatedAt: new Date("2024-02-28"),
        },
        {
          id: "expense6",
          category: "Equipment",
          description: "New development laptops",
          amount: 180000,
          date: new Date("2024-03-10"),
          projectId: "project3",
          createdAt: new Date("2024-03-10"),
          updatedAt: new Date("2024-03-10"),
        },
      ],
      timesheets: [
        {
          id: "timesheet1",
          projectId: "project1", // Derived from project1
          month: "2024-01",
          year: 2024,
          status: "invoiced", // Updated to invoiced since invoice exists
          totalWorkingDays: 22,
          daysWorked: 20,
          daysLeave: 2,
          hoursPerDay: 8,
          billingRate: 1000, // Derived from project1.billingRate
          totalHours: 160,
          totalAmount: 160000,
          submittedAt: new Date("2024-01-31"),
          approvedAt: new Date("2024-02-01"),
          approvedBy: "admin",
          invoiceId: "invoice1", // Links to generated invoice
          invoicedAt: new Date("2024-02-01"),
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-02-01"),
        },
        {
          id: "timesheet2",
          projectId: "project2", // Derived from project2
          month: "2024-02",
          year: 2024,
          status: "invoiced", // Updated to invoiced since invoice exists
          totalWorkingDays: 20,
          daysWorked: 18,
          daysLeave: 2,
          hoursPerDay: 8,
          billingRate: 1200, // Derived from project2.billingRate
          totalHours: 144,
          totalAmount: 172800,
          submittedAt: new Date("2024-02-29"),
          approvedAt: new Date("2024-03-01"),
          approvedBy: "admin",
          invoiceId: "invoice2", // Links to generated invoice
          invoicedAt: new Date("2024-03-01"),
          createdAt: new Date("2024-02-01"),
          updatedAt: new Date("2024-03-01"),
        },
        {
          id: "timesheet3",
          projectId: "project3", // Derived from project3
          month: "2024-03",
          year: 2024,
          status: "draft", // Still draft - no invoice generated yet
          totalWorkingDays: 21,
          daysWorked: 15,
          daysLeave: 6,
          hoursPerDay: 8,
          billingRate: 1500, // Derived from project3.billingRate
          totalHours: 120,
          totalAmount: 180000, // Updated based on project3.billingRate
          createdAt: new Date("2024-03-01"),
          updatedAt: new Date("2024-03-15"),
        },
      ],
      timesheetEntries: [
        {
          id: "entry1",
          timesheetId: "timesheet1",
          date: new Date("2024-01-01"),
          day: "Monday",
          task: "Development work on e-commerce platform - API integration",
          hours: 8,
          isApproved: true,
          approvedBy: "admin",
          approvedAt: new Date("2024-01-02"),
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
        },
        {
          id: "entry2",
          timesheetId: "timesheet1",
          date: new Date("2024-01-02"),
          day: "Tuesday",
          task: "Testing and bug fixing - Payment module",
          hours: 8,
          isApproved: true,
          approvedBy: "admin",
          approvedAt: new Date("2024-01-03"),
          createdAt: new Date("2024-01-02"),
          updatedAt: new Date("2024-01-03"),
        },
        {
          id: "entry3",
          timesheetId: "timesheet1",
          date: new Date("2024-01-03"),
          day: "Wednesday",
          task: "Database optimization and performance tuning",
          hours: 8,
          isApproved: true,
          approvedBy: "admin",
          approvedAt: new Date("2024-01-04"),
          createdAt: new Date("2024-01-03"),
          updatedAt: new Date("2024-01-04"),
        },
        {
          id: "entry4",
          timesheetId: "timesheet2",
          date: new Date("2024-02-01"),
          day: "Thursday",
          task: "UI/UX design work for mobile app - Wireframing",
          hours: 8,
          isApproved: false,
          createdAt: new Date("2024-02-01"),
          updatedAt: new Date("2024-02-01"),
        },
        {
          id: "entry5",
          timesheetId: "timesheet2",
          date: new Date("2024-02-02"),
          day: "Friday",
          task: "Research and competitor analysis",
          hours: 8,
          isApproved: false,
          createdAt: new Date("2024-02-02"),
          updatedAt: new Date("2024-02-02"),
        },
        {
          id: "entry6",
          timesheetId: "timesheet3",
          date: new Date("2024-03-01"),
          day: "Monday",
          task: "Cloud infrastructure setup and configuration",
          hours: 8,
          isApproved: false,
          createdAt: new Date("2024-03-01"),
          updatedAt: new Date("2024-03-01"),
        },
      ],
      dailyLogs: [
        {
          id: "log1",
          date: new Date("2024-03-15"),
          title: "Monthly GST Filing Completed",
          description:
            "Successfully filed GST returns for February 2024. All invoices processed and tax calculations verified. Payment of ₹45,000 submitted to government portal.",
          category: "accounting",
          priority: "high",
          tags: ["GST", "tax-filing", "compliance"],
          createdAt: new Date("2024-03-15"),
          updatedAt: new Date("2024-03-15"),
        },
        {
          id: "log2",
          date: new Date("2024-03-14"),
          title: "New Client Onboarding - TechCorp Solutions",
          description:
            "Signed new client contract worth ₹2.5L for 6-month project. Initial payment of ₹50,000 received. Project kickoff scheduled for next week.",
          category: "important",
          priority: "high",
          tags: ["new-client", "contract", "payment"],
          createdAt: new Date("2024-03-14"),
          updatedAt: new Date("2024-03-14"),
        },
        {
          id: "log3",
          date: new Date("2024-03-13"),
          title: "Office Rent Payment Due",
          description:
            "Monthly office rent payment of ₹25,000 due on 20th March. Need to process payment and update expense records.",
          category: "reminder",
          priority: "medium",
          tags: ["rent", "expense", "payment"],
          createdAt: new Date("2024-03-13"),
          updatedAt: new Date("2024-03-13"),
        },
        {
          id: "log4",
          date: new Date("2024-03-12"),
          title: "Project Milestone - E-commerce Platform",
          description:
            "Completed Phase 1 of e-commerce platform development. Client approved deliverables. Invoice for ₹1.2L to be generated this week.",
          category: "milestone",
          priority: "high",
          tags: ["milestone", "project-completion", "invoice"],
          createdAt: new Date("2024-03-12"),
          updatedAt: new Date("2024-03-12"),
        },
        {
          id: "log5",
          date: new Date("2024-03-11"),
          title: "Bank Reconciliation Completed",
          description:
            "March bank statement reconciled. All transactions matched. Outstanding checks cleared. No discrepancies found.",
          category: "accounting",
          priority: "medium",
          tags: ["bank-reconciliation", "reconciliation"],
          createdAt: new Date("2024-03-11"),
          updatedAt: new Date("2024-03-11"),
        },
      ],

      addClient: (client) => {
        const newClient: Client = {
          ...client,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ clients: [...state.clients, newClient] }));
      },

      updateClient: (id, client) => {
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...client, updatedAt: new Date() } : c
          ),
        }));
      },

      deleteClient: (id) => {
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
        }));
      },

      updateCompanyProfile: (profile) => {
        set((state) => ({
          companyProfile: {
            ...state.companyProfile,
            ...profile,
            updatedAt: new Date(),
          },
        }));
      },

      addProject: (project) => {
        const newProject: Project = {
          ...project,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
      },

      updateProject: (id, project) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...project, updatedAt: new Date() } : p
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }));
      },

      addTimesheet: (timesheet) => {
        const newTimesheet: Timesheet = {
          ...timesheet,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ timesheets: [...state.timesheets, newTimesheet] }));
      },

      updateTimesheet: (id, timesheet) => {
        set((state) => ({
          timesheets: state.timesheets.map((t) =>
            t.id === id ? { ...t, ...timesheet, updatedAt: new Date() } : t
          ),
        }));
      },

      deleteTimesheet: (id) => {
        set((state) => ({
          timesheets: state.timesheets.filter((t) => t.id !== id),
        }));
      },

      addTimesheetEntry: (entry) => {
        const newEntry: TimesheetEntry = {
          ...entry,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          timesheetEntries: [...state.timesheetEntries, newEntry],
        }));
      },

      updateTimesheetEntry: (id, entry) => {
        set((state) => ({
          timesheetEntries: state.timesheetEntries.map((e) =>
            e.id === id ? { ...e, ...entry } : e
          ),
        }));
      },

      deleteTimesheetEntry: (id) => {
        set((state) => ({
          timesheetEntries: state.timesheetEntries.filter((e) => e.id !== id),
        }));
      },

      addInvoice: (invoice) => {
        const newInvoice: Invoice = {
          ...invoice,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ invoices: [...state.invoices, newInvoice] }));
      },

      updateInvoice: (id, invoice) => {
        set((state) => ({
          invoices: state.invoices.map((i) =>
            i.id === id ? { ...i, ...invoice, updatedAt: new Date() } : i
          ),
        }));
      },

      deleteInvoice: (id) => {
        set((state) => ({
          invoices: state.invoices.filter((i) => i.id !== id),
        }));
      },

      addInvoiceItem: (item) => {
        const newItem: InvoiceItem = {
          ...item,
          id: generateId(),
        };
        set((state) => ({ invoiceItems: [...state.invoiceItems, newItem] }));
      },

      updateInvoiceItem: (id, item) => {
        set((state) => ({
          invoiceItems: state.invoiceItems.map((i) =>
            i.id === id ? { ...i, ...item } : i
          ),
        }));
      },

      deleteInvoiceItem: (id) => {
        set((state) => ({
          invoiceItems: state.invoiceItems.filter((i) => i.id !== id),
        }));
      },

      addInvoiceFile: (file) => {
        const newFile: InvoiceFile = {
          ...file,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ invoiceFiles: [...state.invoiceFiles, newFile] }));
      },

      updateInvoiceFile: (id, file) => {
        set((state) => ({
          invoiceFiles: state.invoiceFiles.map((f) =>
            f.id === id ? { ...f, ...file, updatedAt: new Date() } : f
          ),
        }));
      },

      deleteInvoiceFile: (id) => {
        set((state) => ({
          invoiceFiles: state.invoiceFiles.filter((f) => f.id !== id),
        }));
      },

      addExpense: (expense) => {
        const newExpense: Expense = {
          ...expense,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ expenses: [...state.expenses, newExpense] }));
      },

      updateExpense: (id, expense) => {
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...expense, updatedAt: new Date() } : e
          ),
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }));
      },

      addDailyLog: (log) => {
        const newLog: DailyLog = {
          ...log,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ dailyLogs: [...state.dailyLogs, newLog] }));
      },

      updateDailyLog: (id, log) => {
        set((state) => ({
          dailyLogs: state.dailyLogs.map((l) =>
            l.id === id ? { ...l, ...log, updatedAt: new Date() } : l
          ),
        }));
      },

      deleteDailyLog: (id) => {
        set((state) => ({
          dailyLogs: state.dailyLogs.filter((l) => l.id !== id),
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
          (project) => project.status === "active"
        ).length;

        const activeClients = get().clients.length;

        const pendingTimesheets = get().timesheets.filter(
          (t) => t.status === "submitted"
        ).length;

        const approvedTimesheets = get().timesheets.filter(
          (t) => t.status === "approved"
        ).length;

        const invoicedTimesheets = get().timesheets.filter(
          (t) => t.status === "invoiced"
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

      getClientById: (id) => {
        return get().clients.find((c) => c.id === id);
      },

      getProjectById: (id) => {
        return get().projects.find((p) => p.id === id);
      },

      getTimesheetById: (id) => {
        return get().timesheets.find((t) => t.id === id);
      },

      getTimesheetEntries: (timesheetId) => {
        return get().timesheetEntries.filter(
          (e) => e.timesheetId === timesheetId
        );
      },

      getInvoicesByClient: (clientId) => {
        return get().invoices.filter((i) => i.clientId === clientId);
      },

      getInvoiceFilesByInvoice: (invoiceId) => {
        return get().invoiceFiles.filter((f) => f.invoiceId === invoiceId);
      },

      getInvoiceFilesByMonth: (month) => {
        return get().invoiceFiles.filter((f) => f.month === month);
      },

      getExpensesByProject: (projectId) => {
        return get().expenses.filter((e) => e.projectId === projectId);
      },

      generateInvoiceFromTimesheet: (timesheetId) => {
        const timesheet = get().timesheets.find((t) => t.id === timesheetId);
        if (!timesheet) {
          throw new Error(`Timesheet with ID ${timesheetId} not found.`);
        }

        const project = get().projects.find(
          (p) => p.id === timesheet.projectId
        );

        if (!project) {
          throw new Error("Project not found for timesheet.");
        }

        // Use timesheet's calculated amount and billing rate
        const subtotal = timesheet.totalAmount || 0;
        const taxRate = 18; // 18% GST
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;

        const newInvoice: Invoice = {
          id: generateId(),
          clientId: project.clientId,
          projectId: timesheet.projectId,
          timesheetId: timesheetId,
          invoiceNumber: `INV-${new Date().getFullYear()}-${String(
            get().invoices.length + 1
          ).padStart(3, "0")}`,
          issueDate: new Date(),
          dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 days from issue date
          status: "draft",
          subtotal,
          taxRate,
          taxAmount,
          total,
          notes: `Work timesheet for ${project.name} (${timesheet.month}) - ${
            timesheet.daysWorked
          } days${timesheet.hoursPerDay ? ` × ${timesheet.hoursPerDay}h` : ""}${
            timesheet.billingRate ? ` × ₹${timesheet.billingRate}/hr` : ""
          }`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          invoices: [...state.invoices, newInvoice],
          // Update timesheet to link to the invoice
          timesheets: state.timesheets.map((t) =>
            t.id === timesheetId ? { ...t, invoiceId: newInvoice.id } : t
          ),
        }));

        return newInvoice;
      },

      getDailyLogsByDate: (date) => {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(targetDate);
        nextDate.setDate(nextDate.getDate() + 1);

        return get().dailyLogs.filter((log) => {
          const logDate = new Date(log.date);
          logDate.setHours(0, 0, 0, 0);
          return logDate >= targetDate && logDate < nextDate;
        });
      },

      getDailyLogsByCategory: (category) => {
        return get().dailyLogs.filter((log) => log.category === category);
      },

      // Helper functions to demonstrate data relationships
      getProjectsByClient: (clientId) => {
        return get().projects.filter((p) => p.clientId === clientId);
      },

      getTimesheetsByProject: (projectId) => {
        return get().timesheets.filter((t) => t.projectId === projectId);
      },

      getInvoicesByTimesheet: (timesheetId) => {
        return get().invoices.filter((i) => i.timesheetId === timesheetId);
      },

      getClientByProject: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return undefined;
        return get().clients.find((c) => c.id === project.clientId);
      },

      getProjectByTimesheet: (timesheetId) => {
        const timesheet = get().timesheets.find((t) => t.id === timesheetId);
        if (!timesheet) return undefined;
        return get().projects.find((p) => p.id === timesheet.projectId);
      },

      getTimesheetByInvoice: (invoiceId) => {
        const invoice = get().invoices.find((i) => i.id === invoiceId);
        if (!invoice) return undefined;
        return get().timesheets.find((t) => t.id === invoice.timesheetId);
      },
    }),
    {
      name: "accounting-store",
    }
  )
);
