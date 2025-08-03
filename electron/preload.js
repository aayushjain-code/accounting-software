const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Database operations
  getClients: () => ipcRenderer.invoke("get-clients"),
  getClient: (id) => ipcRenderer.invoke("get-client", id),
  createClient: (client) => ipcRenderer.invoke("create-client", client),
  updateClient: (id, client) => ipcRenderer.invoke("update-client", id, client),
  deleteClient: (id) => ipcRenderer.invoke("delete-client", id),

  getProjects: () => ipcRenderer.invoke("get-projects"),
  getProject: (id) => ipcRenderer.invoke("get-project", id),
  createProject: (project) => ipcRenderer.invoke("create-project", project),
  updateProject: (id, project) =>
    ipcRenderer.invoke("update-project", id, project),
  deleteProject: (id) => ipcRenderer.invoke("delete-project", id),

  getTimesheets: () => ipcRenderer.invoke("get-timesheets"),
  getTimesheet: (id) => ipcRenderer.invoke("get-timesheet", id),
  createTimesheet: (timesheet) =>
    ipcRenderer.invoke("create-timesheet", timesheet),
  updateTimesheet: (id, timesheet) =>
    ipcRenderer.invoke("update-timesheet", id, timesheet),
  deleteTimesheet: (id) => ipcRenderer.invoke("delete-timesheet", id),

  getInvoices: () => ipcRenderer.invoke("get-invoices"),
  getInvoice: (id) => ipcRenderer.invoke("get-invoice", id),
  createInvoice: (invoice) => ipcRenderer.invoke("create-invoice", invoice),
  updateInvoice: (id, invoice) =>
    ipcRenderer.invoke("update-invoice", id, invoice),
  deleteInvoice: (id) => ipcRenderer.invoke("delete-invoice", id),

  getExpenses: () => ipcRenderer.invoke("get-expenses"),
  getExpense: (id) => ipcRenderer.invoke("get-expense", id),
  createExpense: (expense) => ipcRenderer.invoke("create-expense", expense),
  updateExpense: (id, expense) =>
    ipcRenderer.invoke("update-expense", id, expense),
  deleteExpense: (id) => ipcRenderer.invoke("delete-expense", id),

  getDailyLogs: () => ipcRenderer.invoke("get-daily-logs"),
  getDailyLog: (id) => ipcRenderer.invoke("get-daily-log", id),
  createDailyLog: (log) => ipcRenderer.invoke("create-daily-log", log),
  updateDailyLog: (id, log) =>
    ipcRenderer.invoke("update-daily-log", id, log),
  deleteDailyLog: (id) => ipcRenderer.invoke("delete-daily-log", id),

  getCompanyProfile: () => ipcRenderer.invoke("get-company-profile"),
  updateCompanyProfile: (profile) =>
    ipcRenderer.invoke("update-company-profile", profile),

  getStatistics: () => ipcRenderer.invoke("get-statistics"),
  getAllData: () => ipcRenderer.invoke("get-all-data"),
  exportData: () => ipcRenderer.invoke("export-data"),
  importData: () => ipcRenderer.invoke("import-data"),
  backupDatabase: () => ipcRenderer.invoke("backup-database"),

  // Database location management
  getDatabaseLocation: () => ipcRenderer.invoke("get-database-location"),
  changeDatabaseLocation: () => ipcRenderer.invoke("change-database-location"),

  // Data management
  clearAllData: () => ipcRenderer.invoke("clear-all-data"),

  // App information
  getAppVersion: () => process.versions.app,
  getPlatform: () => process.platform,

  // Security: Only expose necessary APIs
  isElectron: true,
});

// Security: Remove Node.js integration
delete window.require;
delete window.exports;
delete window.module;
delete window.global;
delete window.process;
