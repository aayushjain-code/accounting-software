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
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Modal from "./Modal";

interface DailyEntry {
  date: string;
  taskName: string;
  description: string;
  hours: number;
  isWeekend: boolean;
}

interface TimesheetGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

const TimesheetGenerator: React.FC<TimesheetGeneratorProps> = ({
  isOpen,
  onClose,
}) => {
  const { projects, clients } = useAccountingStore();

  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeRole, setEmployeeRole] = useState("");
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Generate daily entries for the selected month
  const generateDailyEntries = useMemo(() => {
    if (!selectedMonth) {
      return [];
    }

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

  const selectedProjectData = projects.find(p => p.id === selectedProject);
  const selectedClientData = selectedProjectData
    ? clients.find(c => c.id === selectedProjectData.clientId)
    : null;

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Timesheet Generator"
      size="6xl"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Timesheet Generator
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {!isPreviewMode ? (
          // Configuration Form
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Month *
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Project *
                </label>
                <select
                  value={selectedProject}
                  onChange={e => setSelectedProject(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} -{" "}
                      {clients.find(c => c.id === project.clientId)?.company ||
                        "N/A"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Employee Name *
                </label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={e => setEmployeeName(e.target.value)}
                  placeholder="e.g., Anshuman"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Employee Role *
                </label>
                <input
                  type="text"
                  value={employeeRole}
                  onChange={e => setEmployeeRole(e.target.value)}
                  placeholder="e.g., IAM Consultant"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {selectedProjectData && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Project Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
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

            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateTimesheet}
                disabled={!selectedProject || !employeeName || !employeeRole}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <EyeIcon className="h-5 w-5 mr-2" />
                Generate Timesheet
              </button>
            </div>
          </div>
        ) : (
          // Preview Mode
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Timesheet Preview
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {format(new Date(`${selectedMonth}-01`), "MMMM yyyy")} -{" "}
                  {employeeName} ({employeeRole})
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsPreviewMode(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
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
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                      Task Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                        {entry.taskName}
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
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Working Days
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {dailyEntries.filter(entry => !entry.isWeekend).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Hours
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
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
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {dailyEntries.filter(entry => entry.isWeekend).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TimesheetGenerator;
