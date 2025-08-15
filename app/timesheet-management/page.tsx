"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { useAccountingStore } from "@/store";
import {
  ClockIcon,
  DocumentTextIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface TimesheetUpload {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  month: string;
  year: string;
  employeeName: string;
  employeeRole: string;
  fileName: string;
  fileSize: number;
  uploadDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  totalHours: number;
  workingDays: number;
}

export default function TimesheetManagementPage() {
  const { projects, clients } = useAccountingStore();
  
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeRole, setEmployeeRole] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [timesheetUploads, setTimesheetUploads] = useState<TimesheetUpload[]>([]);

  // Generate month options for the last 12 months
  const monthOptions = useMemo(() => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      options.push({
        value: format(date, "yyyy-MM"),
        label: format(date, "MMMM yyyy")
      });
    }
    return options;
  }, []);

  // Filter timesheets based on selected filters
  const filteredTimesheets = useMemo(() => {
    let filtered = timesheetUploads;
    
    if (selectedMonth) {
      filtered = filtered.filter(ts => `${ts.year}-${ts.month}` === selectedMonth);
    }
    
    if (selectedProject) {
      filtered = filtered.filter(ts => ts.projectId === selectedProject);
    }
    
    if (employeeName) {
      filtered = filtered.filter(ts => 
        ts.employeeName.toLowerCase().includes(employeeName.toLowerCase())
      );
    }
    
    return filtered;
  }, [timesheetUploads, selectedMonth, selectedProject, employeeName]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmitTimesheet = () => {
    if (!selectedProject || !selectedMonth || !employeeName || !employeeRole || !uploadedFile) {
      alert("Please fill in all required fields and select a file");
      return;
    }

    const [year, month] = selectedMonth.split("-");
    const project = projects.find(p => p.id === selectedProject);
    const client = clients.find(c => c.id === project?.clientId);

    if (!project || !client) {
      alert("Project or client not found");
      return;
    }

    const newTimesheet: TimesheetUpload = {
      id: Date.now().toString(),
      projectId: selectedProject,
      projectName: project.name,
      clientName: client.company,
      month: month,
      year: year,
      employeeName,
      employeeRole,
      fileName: uploadedFile.name,
      fileSize: uploadedFile.size,
      uploadDate: new Date(),
      status: 'pending',
      totalHours: 0, // This would be calculated from the file content
      workingDays: 0, // This would be calculated from the file content
    };

    setTimesheetUploads(prev => [newTimesheet, ...prev]);
    
    // Reset form
    setSelectedProject("");
    setEmployeeName("");
    setEmployeeRole("");
    setUploadedFile(null);
    
    alert("Timesheet uploaded successfully!");
  };

  const handleStatusChange = (timesheetId: string, newStatus: 'approved' | 'rejected') => {
    setTimesheetUploads(prev => 
      prev.map(ts => 
        ts.id === timesheetId ? { ...ts, status: newStatus } : ts
      )
    );
  };

  const handleDeleteTimesheet = (timesheetId: string) => {
    if (confirm("Are you sure you want to delete this timesheet?")) {
      setTimesheetUploads(prev => prev.filter(ts => ts.id !== timesheetId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'rejected':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Timesheet Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Upload and manage timesheets for projects by month
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                <ClockIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Upload Timesheet
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <CalendarIcon className="h-4 w-4 inline mr-2 text-primary-600" />
                    Month *
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {monthOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <BuildingOfficeIcon className="h-4 w-4 inline mr-2 text-primary-600" />
                    Project *
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Select Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} - {clients.find(c => c.id === project.clientId)?.company || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Employee Name *
                  </label>
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Enter employee name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Employee Role *
                  </label>
                  <input
                    type="text"
                    value={employeeRole}
                    onChange={(e) => setEmployeeRole(e.target.value)}
                    placeholder="Enter employee role"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <DocumentTextIcon className="h-4 w-4 inline mr-2 text-primary-600" />
                    Timesheet File *
                  </label>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.pdf"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  {uploadedFile && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      ✓ {uploadedFile.name} selected
                    </p>
                  )}
                </div>

                <button
                  onClick={handleSubmitTimesheet}
                  disabled={!selectedProject || !selectedMonth || !employeeName || !employeeRole || !uploadedFile}
                  className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                  Upload Timesheet
                </button>
              </div>
            </div>
          </div>

          {/* Timesheet List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Timesheet Records
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredTimesheets.length} timesheet(s)
                </div>
              </div>

              {/* Filters */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Search by employee name..."
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">All Months</option>
                  {monthOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">All Projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Timesheet Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        File
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTimesheets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          No timesheets found. Upload your first timesheet to get started.
                        </td>
                      </tr>
                    ) : (
                      filteredTimesheets.map((timesheet) => (
                        <tr key={timesheet.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {timesheet.employeeName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {timesheet.employeeRole}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {timesheet.projectName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {timesheet.clientName}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {format(new Date(parseInt(timesheet.year), parseInt(timesheet.month) - 1), "MMM yyyy")}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900 dark:text-white">
                                {timesheet.fileName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {formatFileSize(timesheet.fileSize)}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(timesheet.status)}`}>
                              {getStatusIcon(timesheet.status)}
                              <span className="ml-1 capitalize">{timesheet.status}</span>
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              {timesheet.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(timesheet.id, 'approved')}
                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                    title="Approve"
                                  >
                                    <CheckCircleIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(timesheet.id, 'rejected')}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    title="Reject"
                                  >
                                    <XCircleIcon className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeleteTimesheet(timesheet.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
