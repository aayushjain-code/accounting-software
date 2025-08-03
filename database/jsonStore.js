const fs = require("fs");
const path = require("path");

class JSONStoreManager {
  constructor(config) {
    this.dbPath = config.dbPath;
    this.initializeDatabase();
  }

  initializeDatabase() {
    // Ensure directory exists
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Initialize with empty data if file doesn't exist
    if (!fs.existsSync(this.dbPath)) {
      const initialData = {
        clients: [],
        projects: [],
        timesheets: [],
        invoices: [],
        expenses: [],
        companyProfile: null,
        createdAt: new Date().toISOString(),
        version: "1.0.0",
      };
      this.saveData(initialData);
    }
  }

  loadData() {
    try {
      const data = fs.readFileSync(this.dbPath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error loading database:", error);
      return {
        clients: [],
        projects: [],
        timesheets: [],
        invoices: [],
        expenses: [],
        companyProfile: null,
        createdAt: new Date().toISOString(),
        version: "1.0.0",
      };
    }
  }

  saveData(data) {
    try {
      data.updatedAt = new Date().toISOString();
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error("Error saving database:", error);
      return false;
    }
  }

  // Client operations
  getClients() {
    const data = this.loadData();
    return data.clients || [];
  }

  getClient(id) {
    const data = this.loadData();
    return data.clients?.find((client) => client.id === id);
  }

  createClient(client) {
    const data = this.loadData();
    const newClient = {
      ...client,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.clients = data.clients || [];
    data.clients.push(newClient);
    this.saveData(data);
    return newClient;
  }

  updateClient(id, client) {
    const data = this.loadData();
    const index = data.clients?.findIndex((c) => c.id === id);
    if (index !== -1 && index !== undefined) {
      data.clients[index] = {
        ...data.clients[index],
        ...client,
        id,
        updatedAt: new Date().toISOString(),
      };
      this.saveData(data);
      return data.clients[index];
    }
    return null;
  }

  deleteClient(id) {
    const data = this.loadData();
    data.clients = data.clients?.filter((c) => c.id !== id) || [];
    this.saveData(data);
    return true;
  }

  // Project operations
  getProjects() {
    const data = this.loadData();
    const projects = data.projects || [];
    const clients = data.clients || [];

    return projects.map((project) => ({
      ...project,
      clientName:
        clients.find((c) => c.id === project.clientId)?.name ||
        "Unknown Client",
    }));
  }

  getProject(id) {
    const data = this.loadData();
    const project = data.projects?.find((p) => p.id === id);
    if (project) {
      const client = data.clients?.find((c) => c.id === project.clientId);
      return {
        ...project,
        clientName: client?.name || "Unknown Client",
      };
    }
    return null;
  }

  createProject(project) {
    const data = this.loadData();
    const newProject = {
      ...project,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.projects = data.projects || [];
    data.projects.push(newProject);
    this.saveData(data);
    return newProject;
  }

  updateProject(id, project) {
    const data = this.loadData();
    const index = data.projects?.findIndex((p) => p.id === id);
    if (index !== -1 && index !== undefined) {
      data.projects[index] = {
        ...data.projects[index],
        ...project,
        id,
        updatedAt: new Date().toISOString(),
      };
      this.saveData(data);
      return data.projects[index];
    }
    return null;
  }

  deleteProject(id) {
    const data = this.loadData();
    data.projects = data.projects?.filter((p) => p.id !== id) || [];
    this.saveData(data);
    return true;
  }

  // Timesheet operations
  getTimesheets() {
    const data = this.loadData();
    const timesheets = data.timesheets || [];
    const projects = data.projects || [];
    const clients = data.clients || [];

    return timesheets.map((timesheet) => ({
      ...timesheet,
      projectName:
        projects.find((p) => p.id === timesheet.projectId)?.name ||
        "Unknown Project",
      projectCode:
        projects.find((p) => p.id === timesheet.projectId)?.projectCode || "",
      clientName:
        clients.find((c) => c.id === timesheet.clientId)?.name ||
        "Unknown Client",
    }));
  }

  getTimesheet(id) {
    const data = this.loadData();
    const timesheet = data.timesheets?.find((t) => t.id === id);
    if (timesheet) {
      const project = data.projects?.find((p) => p.id === timesheet.projectId);
      const client = data.clients?.find((c) => c.id === timesheet.clientId);
      return {
        ...timesheet,
        projectName: project?.name || "Unknown Project",
        projectCode: project?.projectCode || "",
        clientName: client?.name || "Unknown Client",
      };
    }
    return null;
  }

  createTimesheet(timesheet) {
    const data = this.loadData();
    const newTimesheet = {
      ...timesheet,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.timesheets = data.timesheets || [];
    data.timesheets.push(newTimesheet);
    this.saveData(data);
    return newTimesheet;
  }

  updateTimesheet(id, timesheet) {
    const data = this.loadData();
    const index = data.timesheets?.findIndex((t) => t.id === id);
    if (index !== -1 && index !== undefined) {
      data.timesheets[index] = {
        ...data.timesheets[index],
        ...timesheet,
        id,
        updatedAt: new Date().toISOString(),
      };
      this.saveData(data);
      return data.timesheets[index];
    }
    return null;
  }

  deleteTimesheet(id) {
    const data = this.loadData();
    data.timesheets = data.timesheets?.filter((t) => t.id !== id) || [];
    this.saveData(data);
    return true;
  }

  // Invoice operations
  getInvoices() {
    const data = this.loadData();
    const invoices = data.invoices || [];
    const clients = data.clients || [];
    const projects = data.projects || [];

    return invoices.map((invoice) => ({
      ...invoice,
      clientName:
        clients.find((c) => c.id === invoice.clientId)?.name ||
        "Unknown Client",
      projectName:
        projects.find((p) => p.id === invoice.projectId)?.name ||
        "Unknown Project",
    }));
  }

  getInvoice(id) {
    const data = this.loadData();
    const invoice = data.invoices?.find((i) => i.id === id);
    if (invoice) {
      const client = data.clients?.find((c) => c.id === invoice.clientId);
      const project = data.projects?.find((p) => p.id === invoice.projectId);
      return {
        ...invoice,
        clientName: client?.name || "Unknown Client",
        projectName: project?.name || "Unknown Project",
      };
    }
    return null;
  }

  createInvoice(invoice) {
    const data = this.loadData();
    const newInvoice = {
      ...invoice,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.invoices = data.invoices || [];
    data.invoices.push(newInvoice);
    this.saveData(data);
    return newInvoice;
  }

  updateInvoice(id, invoice) {
    const data = this.loadData();
    const index = data.invoices?.findIndex((i) => i.id === id);
    if (index !== -1 && index !== undefined) {
      data.invoices[index] = {
        ...data.invoices[index],
        ...invoice,
        id,
        updatedAt: new Date().toISOString(),
      };
      this.saveData(data);
      return data.invoices[index];
    }
    return null;
  }

  deleteInvoice(id) {
    const data = this.loadData();
    data.invoices = data.invoices?.filter((i) => i.id !== id) || [];
    this.saveData(data);
    return true;
  }

  // Expense operations
  getExpenses() {
    const data = this.loadData();
    return data.expenses || [];
  }

  getExpense(id) {
    const data = this.loadData();
    return data.expenses?.find((e) => e.id === id);
  }

  createExpense(expense) {
    const data = this.loadData();
    const newExpense = {
      ...expense,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.expenses = data.expenses || [];
    data.expenses.push(newExpense);
    this.saveData(data);
    return newExpense;
  }

  updateExpense(id, expense) {
    const data = this.loadData();
    const index = data.expenses?.findIndex((e) => e.id === id);
    if (index !== -1 && index !== undefined) {
      data.expenses[index] = {
        ...data.expenses[index],
        ...expense,
        id,
        updatedAt: new Date().toISOString(),
      };
      this.saveData(data);
      return data.expenses[index];
    }
    return null;
  }

  deleteExpense(id) {
    const data = this.loadData();
    data.expenses = data.expenses?.filter((e) => e.id !== id) || [];
    this.saveData(data);
    return true;
  }

  // Company Profile operations
  getCompanyProfile() {
    const data = this.loadData();
    return data.companyProfile;
  }

  updateCompanyProfile(profile) {
    const data = this.loadData();
    data.companyProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    this.saveData(data);
    return data.companyProfile;
  }

  // Backup and Restore operations
  exportData() {
    const data = this.loadData();
    return {
      ...data,
      exportDate: new Date().toISOString(),
      version: "1.0.0",
    };
  }

  importData(importData) {
    try {
      // Validate the imported data structure
      const requiredKeys = [
        "clients",
        "projects",
        "timesheets",
        "timesheetEntries",
        "invoices",
        "invoiceItems",
        "invoiceFiles",
        "expenses",
        "dailyLogs",
        "companyProfile",
      ];

      // Check required arrays
      const requiredArrays = [
        "clients",
        "projects",
        "timesheets",
        "timesheetEntries",
        "invoices",
        "invoiceItems",
        "invoiceFiles",
        "expenses",
        "dailyLogs",
      ];

      const hasRequiredArrays = requiredArrays.every((key) =>
        Array.isArray(importData[key])
      );

      // Check required objects
      const hasRequiredObjects =
        importData.companyProfile &&
        typeof importData.companyProfile === "object";

      if (!hasRequiredArrays || !hasRequiredObjects) {
        throw new Error("Invalid data format - missing required fields");
      }

      // Create backup of current data
      const currentData = this.loadData();
      const backupPath = this.dbPath.replace(
        ".json",
        `-backup-${Date.now()}.json`
      );
      fs.writeFileSync(backupPath, JSON.stringify(currentData, null, 2));

      // Import new data
      const newData = {
        ...importData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: "1.0.0",
      };

      this.saveData(newData);
      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }

  // Database management
  backupDatabase(backupPath) {
    try {
      const data = this.loadData();
      fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error("Error backing up database:", error);
      return false;
    }
  }

  close() {
    // No special cleanup needed for JSON files
  }

  // Statistics and reporting
  getStatistics() {
    const data = this.loadData();
    const clients = data.clients || [];
    const projects = data.projects || [];
    const timesheets = data.timesheets || [];
    const invoices = data.invoices || [];
    const expenses = data.expenses || [];

    const totalRevenue = invoices
      .filter((invoice) => invoice.status === "paid")
      .reduce((sum, invoice) => sum + (invoice.total || 0), 0);

    const totalExpensesAmount = expenses.reduce(
      (sum, expense) => sum + (expense.amount || 0),
      0
    );

    const outstandingAmount = invoices
      .filter((invoice) => invoice.status === "pending")
      .reduce((sum, invoice) => sum + (invoice.total || 0), 0);

    return {
      totalClients: clients.length,
      totalProjects: projects.length,
      totalTimesheets: timesheets.length,
      totalInvoices: invoices.length,
      totalExpensesCount: expenses.length,
      totalRevenue,
      totalExpensesAmount,
      outstandingAmount,
      netProfit: totalRevenue - totalExpensesAmount,
    };
  }
}

module.exports = { JSONStoreManager };
