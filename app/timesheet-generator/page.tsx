"use client";

import React, { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
} from "date-fns";
import { useAccountingStore } from "@/store";
import {
  ArrowDownTrayIcon,
  EyeIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

interface DailyEntry {
  date: string;
  taskName: string;
  description: string;
  hours: number;
  isWeekend: boolean;
}

export default function TimesheetGeneratorPage() {
  const { projects, clients } = useAccountingStore();

  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeRole, setEmployeeRole] = useState("");
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Generate daily entries for the selected month
  const generateDailyEntries = useMemo(() => {
    if (!selectedMonth) {return [];}

    const [year, month] = selectedMonth.split("-").map(Number);
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map(day => {
      const isWeekendDay = isWeekend(day);
      return {
        date: format(day, "dd-MMM-yyyy"),
        taskName: isWeekendDay ? "WEEK OFF" : "",
        description: isWeekendDay ? "" : "",
        hours: isWeekendDay ? 0 : 8,
        isWeekend: isWeekendDay,
      };
    });
  }, [selectedMonth]);

  // Initialize daily entries when month changes
  React.useEffect(() => {
    setDailyEntries(generateDailyEntries);
  }, [generateDailyEntries]);

  const handleEntryChange = (
    date: string,
    field: keyof DailyEntry,
    value: string | number
  ) => {
    setDailyEntries(prev =>
      prev.map(entry =>
        entry.date === date ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleGenerateTimesheet = () => {
    if (!selectedProject || !employeeName || !employeeRole) {
      alert("Please fill in all required fields");
      return;
    }
    setIsPreviewMode(true);
  };

  const handleDownloadPDF = () => {
    // Implementation for PDF download
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Timesheet_${employeeName}_${employeeRole}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; border: 2px solid black; }
              th, td { border: 1px solid black; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .hours { text-align: right; }
              .weekend { background-color: #f9f9f9; }
              .header { text-align: center; margin-bottom: 20px; font-size: 18px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">Timesheet_${employeeName}_${employeeRole}</div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Task Name</th>
                  <th>Description</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                ${dailyEntries
                  .map(
                    entry => `
                  <tr class="${entry.isWeekend ? "weekend" : ""}">
                    <td>${entry.date}</td>
                    <td>${entry.taskName}</td>
                    <td>${entry.description}</td>
                    <td class="hours">${entry.hours || ""}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadBlankFormat = () => {
    const csvContent = [
      ["Date", "Task Name", "Description", "Hours"],
      ...dailyEntries.map(entry => [
        entry.date,
        entry.taskName,
        entry.description,
        entry.hours,
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Timesheet_${employeeName}_${employeeRole}_${selectedMonth}_blank.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = e => {
        const text = e.target?.result as string;
        const lines = text.split("\n");
        const newEntries = dailyEntries.map((entry, index) => {
          if (index < lines.length - 1 && lines[index + 1]) {
            const values = lines[index + 1]
              .split(",")
              .map(v => v.replace(/"/g, "").trim());
            if (values.length >= 4) {
              return {
                ...entry,
                taskName: values[1] || entry.taskName,
                description: values[2] || entry.description,
                hours: parseInt(values[3]) || entry.hours,
              };
            }
          }
          return entry;
        });
        setDailyEntries(newEntries);
      };
      reader.readAsText(file);
    }
  };

  const selectedProjectData = projects.find(p => p.id === selectedProject);
  const selectedClientData = selectedProjectData
    ? clients.find(c => c.id === selectedProjectData.clientId)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Timesheet Generator
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Generate professional monthly timesheets for projects and
                employees
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isPreviewMode ? (
          // Configuration Form
          <div className="space-y-8">
            {/* Configuration Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Timesheet Configuration
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      <CalendarIcon className="h-5 w-5 inline mr-2 text-primary-600" />
                      Month *
                    </label>
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(e.target.value)}
                      className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      <BuildingOfficeIcon className="h-5 w-5 inline mr-2 text-primary-600" />
                      Project *
                    </label>
                    <select
                      value={selectedProject}
                      onChange={e => setSelectedProject(e.target.value)}
                      className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select Project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name} -{" "}
                          {clients.find(c => c.id === project.clientId)
                            ?.company || "N/A"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      <UserIcon className="h-5 w-5 inline mr-2 text-primary-600" />
                      Employee Name *
                    </label>
                    <input
                      type="text"
                      value={employeeName}
                      onChange={e => setEmployeeName(e.target.value)}
                      placeholder="e.g., Anshuman"
                      className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      <DocumentTextIcon className="h-5 w-5 inline mr-2 text-primary-600" />
                      Employee Role *
                    </label>
                    <input
                      type="text"
                      value={employeeRole}
                      onChange={e => setEmployeeRole(e.target.value)}
                      placeholder="e.g., IAM Consultant"
                      className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>

              {selectedProjectData && (
                <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 mr-2 text-primary-600" />
                    Project Details
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Project:
                      </span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {selectedProjectData.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Client:
                      </span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {selectedClientData?.company || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Status:
                      </span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {selectedProjectData.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Budget:
                      </span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        ₹{selectedProjectData.budget.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* File Operations */}
              <div className="mt-8">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    File Operations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                        Download Blank Format
                      </label>
                      <button
                        onClick={handleDownloadBlankFormat}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                        Download CSV Template
                      </button>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                        Download blank format, fill it manually, then upload
                        back
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                        Upload Filled Format
                      </label>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="w-full px-3 py-2 border border-green-200 dark:border-green-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-green-900 dark:text-green-100"
                      />
                      {uploadedFile && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          ✓ {uploadedFile.name} uploaded successfully
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleGenerateTimesheet}
                  disabled={!selectedProject || !employeeName || !employeeRole}
                  className="px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center text-lg font-semibold"
                >
                  <EyeIcon className="h-6 w-6 mr-3" />
                  Generate Timesheet
                </button>
              </div>
            </div>

            {/* Instructions Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
                How to Use the Timesheet Generator
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-blue-700 dark:text-blue-300">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      1
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Configure</h4>
                    <p className="text-sm">
                      Select month, project, employee name, and role
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      2
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Customize</h4>
                    <p className="text-sm">
                      Edit daily entries, task names, descriptions, and hours
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      3
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Export</h4>
                    <p className="text-sm">
                      Download PDF or print your professional timesheet
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Preview Mode
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Timesheet Preview
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {format(new Date(`${selectedMonth  }-01`), "MMMM yyyy")} -{" "}
                    {employeeName} ({employeeRole})
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setIsPreviewMode(false)}
                    className="px-6 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Edit Configuration
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Download PDF
                  </button>
                </div>
              </div>

              {/* Timesheet Table */}
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                        Task Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                        Description
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {dailyEntries.map((entry, index) => (
                      <tr
                        key={index}
                        className={
                          entry.isWeekend ? "bg-gray-50 dark:bg-gray-800" : ""
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                          {entry.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                          <input
                            type="text"
                            value={entry.taskName}
                            onChange={e =>
                              handleEntryChange(
                                entry.date,
                                "taskName",
                                e.target.value
                              )
                            }
                            className="w-full border-none bg-transparent focus:outline-none focus:ring-0"
                            disabled={entry.isWeekend}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                          <textarea
                            value={entry.description}
                            onChange={e =>
                              handleEntryChange(
                                entry.date,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Enter task description..."
                            className="w-full border-none bg-transparent resize-none focus:outline-none focus:ring-0"
                            rows={2}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">
                          <input
                            type="number"
                            value={entry.hours || ""}
                            onChange={e =>
                              handleEntryChange(
                                entry.date,
                                "hours",
                                parseInt(e.target.value) || 0
                              )
                            }
                            min="0"
                            max="24"
                            className="w-20 text-right border-none bg-transparent focus:outline-none focus:ring-0"
                            disabled={entry.isWeekend}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="mt-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Working Days
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {dailyEntries.filter(entry => !entry.isWeekend).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Hours
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {dailyEntries.reduce(
                        (sum, entry) => sum + (entry.hours || 0),
                        0
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Weekends
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {dailyEntries.filter(entry => entry.isWeekend).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
