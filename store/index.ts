import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Client,
  Staff,
  Project,
  Invoice,
  InvoiceItem,
  Expense,
  DashboardStats,
} from "@/types";

interface AccountingStore {
  // Data
  clients: Client[];
  staff: Staff[];
  projects: Project[];
  invoices: Invoice[];
  invoiceItems: InvoiceItem[];
  expenses: Expense[];

  // Actions
  addClient: (client: Omit<Client, "id" | "createdAt" | "updatedAt">) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addStaff: (staff: Omit<Staff, "id" | "createdAt" | "updatedAt">) => void;
  updateStaff: (id: string, staff: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;

  addProject: (
    project: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addInvoice: (
    invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  addInvoiceItem: (item: Omit<InvoiceItem, "id">) => void;
  updateInvoiceItem: (id: string, item: Partial<InvoiceItem>) => void;
  deleteInvoiceItem: (id: string) => void;

  addExpense: (
    expense: Omit<Expense, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Computed
  getDashboardStats: () => DashboardStats;
  getClientById: (id: string) => Client | undefined;
  getStaffById: (id: string) => Staff | undefined;
  getProjectById: (id: string) => Project | undefined;
  getInvoicesByClient: (clientId: string) => Invoice[];
  getExpensesByProject: (projectId: string) => Expense[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useAccountingStore = create<AccountingStore>()(
  persist(
    (set, get) => ({
      clients: [
        {
          id: "client1",
          name: "TechCorp Solutions",
          email: "accounts@techcorp.com",
          phone: "+91-98765-43210",
          company: "TechCorp Solutions Pvt Ltd",
          address: "123 Tech Park, Bangalore, Karnataka 560001",
          taxId: "GST123456789",
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
          taxId: "GST987654321",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        {
          id: "client3",
          name: "Global Systems",
          email: "billing@globalsystems.com",
          phone: "+91-76543-21098",
          company: "Global Systems Inc",
          address: "789 Corporate Tower, Delhi, NCR 110001",
          taxId: "GST456789123",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
      ],
      staff: [
        {
          id: "staff1",
          name: "Rahul Sharma",
          email: "rahul.sharma@company.com",
          phone: "+91-98765-12345",
          role: "Senior Developer",
          hourlyRate: 2500,
          isActive: true,
          startDate: new Date("2023-01-15"),
          createdAt: new Date("2023-01-15"),
          updatedAt: new Date("2023-01-15"),
        },
        {
          id: "staff2",
          name: "Priya Patel",
          email: "priya.patel@company.com",
          phone: "+91-87654-23456",
          role: "UI/UX Designer",
          hourlyRate: 2000,
          isActive: true,
          startDate: new Date("2023-03-20"),
          createdAt: new Date("2023-03-20"),
          updatedAt: new Date("2023-03-20"),
        },
        {
          id: "staff3",
          name: "Amit Kumar",
          email: "amit.kumar@company.com",
          phone: "+91-76543-34567",
          role: "DevOps Engineer",
          hourlyRate: 3000,
          isActive: true,
          startDate: new Date("2023-02-10"),
          createdAt: new Date("2023-02-10"),
          updatedAt: new Date("2023-02-10"),
        },
        {
          id: "staff4",
          name: "Neha Singh",
          email: "neha.singh@company.com",
          phone: "+91-65432-45678",
          role: "Project Manager",
          hourlyRate: 3500,
          isActive: true,
          startDate: new Date("2023-01-05"),
          createdAt: new Date("2023-01-05"),
          updatedAt: new Date("2023-01-05"),
        },
      ],
      projects: [
        {
          id: "project1",
          name: "E-commerce Platform Development",
          clientId: "client1",
          description:
            "Full-stack e-commerce platform with payment integration",
          startDate: new Date("2024-01-15"),
          endDate: new Date("2024-06-30"),
          status: "active",
          budget: 2500000,
          hourlyRate: 2500,
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-15"),
        },
        {
          id: "project2",
          name: "Mobile App Development",
          clientId: "client2",
          description: "Cross-platform mobile application for iOS and Android",
          startDate: new Date("2024-02-01"),
          endDate: new Date("2024-08-31"),
          status: "active",
          budget: 1800000,
          hourlyRate: 2200,
          createdAt: new Date("2024-02-01"),
          updatedAt: new Date("2024-02-01"),
        },
        {
          id: "project3",
          name: "Cloud Migration Project",
          clientId: "client3",
          description: "Legacy system migration to AWS cloud infrastructure",
          startDate: new Date("2024-03-01"),
          status: "active",
          budget: 3200000,
          hourlyRate: 3000,
          createdAt: new Date("2024-03-01"),
          updatedAt: new Date("2024-03-01"),
        },
      ],
      invoices: [
        {
          id: "invoice1",
          clientId: "client1",
          projectId: "project1",
          invoiceNumber: "INV-2024-001",
          issueDate: new Date("2024-01-31"),
          dueDate: new Date("2024-02-15"),
          status: "paid",
          subtotal: 450000,
          taxRate: 18,
          taxAmount: 81000,
          total: 531000,
          notes: "January 2024 development services",
          createdAt: new Date("2024-01-31"),
          updatedAt: new Date("2024-01-31"),
        },
        {
          id: "invoice2",
          clientId: "client2",
          projectId: "project2",
          invoiceNumber: "INV-2024-002",
          issueDate: new Date("2024-02-29"),
          dueDate: new Date("2024-03-15"),
          status: "sent",
          subtotal: 380000,
          taxRate: 18,
          taxAmount: 68400,
          total: 448400,
          notes: "February 2024 development services",
          createdAt: new Date("2024-02-29"),
          updatedAt: new Date("2024-02-29"),
        },
        {
          id: "invoice3",
          clientId: "client3",
          projectId: "project3",
          invoiceNumber: "INV-2024-003",
          issueDate: new Date("2024-03-31"),
          dueDate: new Date("2024-04-15"),
          status: "draft",
          subtotal: 520000,
          taxRate: 18,
          taxAmount: 93600,
          total: 613600,
          notes: "March 2024 development services",
          createdAt: new Date("2024-03-31"),
          updatedAt: new Date("2024-03-31"),
        },
      ],
      invoiceItems: [],
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

      addStaff: (staff) => {
        const newStaff: Staff = {
          ...staff,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ staff: [...state.staff, newStaff] }));
      },

      updateStaff: (id, staff) => {
        set((state) => ({
          staff: state.staff.map((s) =>
            s.id === id ? { ...s, ...staff, updatedAt: new Date() } : s
          ),
        }));
      },

      deleteStaff: (id) => {
        set((state) => ({
          staff: state.staff.filter((s) => s.id !== id),
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

      getDashboardStats: () => {
        const state = get();
        const totalRevenue = state.invoices
          .filter((i) => i.status === "paid")
          .reduce((sum, i) => sum + i.total, 0);

        const totalExpenses = state.expenses.reduce(
          (sum, e) => sum + e.amount,
          0
        );
        const netProfit = totalRevenue - totalExpenses;
        const outstandingAmount = state.invoices
          .filter((i) => i.status !== "paid")
          .reduce((sum, i) => sum + i.total, 0);

        return {
          totalRevenue,
          totalExpenses,
          netProfit,
          outstandingAmount,
          activeProjects: state.projects.filter((p) => p.status === "active")
            .length,
          activeClients: state.clients.length,
          activeStaff: state.staff.filter((s) => s.isActive).length,
        };
      },

      getClientById: (id) => {
        return get().clients.find((c) => c.id === id);
      },

      getStaffById: (id) => {
        return get().staff.find((s) => s.id === id);
      },

      getProjectById: (id) => {
        return get().projects.find((p) => p.id === id);
      },

      getInvoicesByClient: (clientId) => {
        return get().invoices.filter((i) => i.clientId === clientId);
      },

      getExpensesByProject: (projectId) => {
        return get().expenses.filter((e) => e.projectId === projectId);
      },
    }),
    {
      name: "accounting-store",
    }
  )
);
