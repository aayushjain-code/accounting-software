"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useAccountingStore } from "@/store";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  FolderIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
  getDay,
} from "date-fns";
import toast from "react-hot-toast";
import { Timesheet, TimesheetEntry, Project } from "@/types";
import { formatCurrency } from "@/utils/helpers";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import Link from "next/link";

// Timesheet Entry Row Component
const EntryRow = React.memo(
  ({
    entry,
    onEdit,
    onDelete,
    onApprove,
  }: {
    entry: TimesheetEntry;
    onEdit: (entry: TimesheetEntry) => void;
    onDelete: (id: string) => void;
    onApprove: (id: string) => void;
  }) => {
    const formatDate = useCallback((date: Date) => {
      return format(new Date(date), "dd-MM-yyyy");
    }, []);

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-3 text-sm text-gray-900">
          {formatDate(entry.date)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">{entry.day}</td>
        <td className="px-4 py-3 text-sm text-gray-900 max-w-md">
          <div className="truncate" title={entry.task}>
            {entry.task}
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-900 text-center">
          {entry.hours}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900 text-center">
          {entry.isApproved ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
              <CheckIcon className="h-3 w-3 mr-1" />
              Approved
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
              <ClockIcon className="h-3 w-3 mr-1" />
              Pending
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(entry)}
              className="text-primary-600 hover:text-primary-900 transition-colors"
              title="Edit entry"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            {!entry.isApproved && (
              <button
                onClick={() => onApprove(entry.id)}
                className="text-success-600 hover:text-success-900 transition-colors"
                title="Approve entry"
              >
                <CheckIcon className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => onDelete(entry.id)}
              className="text-danger-600 hover:text-danger-900 transition-colors"
              title="Delete entry"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }
);

EntryRow.displayName = "EntryRow";

// Entry Modal Component
const EntryModal = React.memo(
  ({
    isOpen,
    onClose,
    editingEntry,
    onSubmit,
    timesheet,
  }: {
    isOpen: boolean;
    onClose: () => void;
    editingEntry: TimesheetEntry | null;
    onSubmit: (data: any) => void;
    timesheet: Timesheet;
  }) => {
    const [formData, setFormData] = useState({
      date: "",
      task: "",
      hours: "",
      notes: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Get all days in the timesheet month
    const monthDays = useMemo(() => {
      if (!timesheet.month) return [];

      const [year, month] = timesheet.month.split("-");
      const start = startOfMonth(new Date(parseInt(year), parseInt(month) - 1));
      const end = endOfMonth(start);

      return eachDayOfInterval({ start, end });
    }, [timesheet.month]);

    // Reset form when modal opens/closes
    React.useEffect(() => {
      if (isOpen) {
        if (editingEntry) {
          setFormData({
            date: format(new Date(editingEntry.date), "yyyy-MM-dd"),
            task: editingEntry.task,
            hours: editingEntry.hours.toString(),
            notes: editingEntry.notes || "",
          });
        } else {
          setFormData({
            date: format(new Date(), "yyyy-MM-dd"),
            task: "",
            hours: "8",
            notes: "",
          });
        }
        setErrors({});
      }
    }, [isOpen, editingEntry]);

    const validateForm = useCallback(() => {
      const newErrors: Record<string, string> = {};

      if (!formData.date) newErrors.date = "Date is required";
      if (!formData.task.trim())
        newErrors.task = "Task description is required";
      if (!formData.hours || parseFloat(formData.hours) <= 0)
        newErrors.hours = "Valid hours are required";
      if (parseFloat(formData.hours) > 24)
        newErrors.hours = "Hours cannot exceed 24";

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
          const selectedDate = new Date(formData.date);
          const dayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];

          onSubmit({
            ...formData,
            date: selectedDate,
            day: dayNames[selectedDate.getDay()],
            hours: parseFloat(formData.hours),
          });
        }
      },
      [formData, validateForm, onSubmit]
    );

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              {editingEntry ? "Edit Entry" : "Add New Entry"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className={`input ${
                      errors.date ? "border-danger-500" : ""
                    }`}
                  />
                  {errors.date && (
                    <p className="text-danger-500 text-sm mt-1">
                      {errors.date}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hours *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="24"
                    step="0.5"
                    value={formData.hours}
                    onChange={(e) =>
                      setFormData({ ...formData, hours: e.target.value })
                    }
                    className={`input ${
                      errors.hours ? "border-danger-500" : ""
                    }`}
                  />
                  {errors.hours && (
                    <p className="text-danger-500 text-sm mt-1">
                      {errors.hours}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Description *
                </label>
                <textarea
                  required
                  value={formData.task}
                  onChange={(e) =>
                    setFormData({ ...formData, task: e.target.value })
                  }
                  className={`input ${errors.task ? "border-danger-500" : ""}`}
                  rows={3}
                  placeholder="Describe the work done today..."
                />
                {errors.task && (
                  <p className="text-danger-500 text-sm mt-1">{errors.task}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="input"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingEntry ? "Update" : "Add"} Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
);

EntryModal.displayName = "EntryModal";

export default function TimesheetDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const {
    timesheets,
    timesheetEntries,
    projects,
    addTimesheetEntry,
    updateTimesheetEntry,
    deleteTimesheetEntry,
    updateTimesheet,
  } = useAccountingStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimesheetEntry | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  // Get timesheet data
  const timesheet = useMemo(() => {
    return timesheets.find((t) => t.id === params.id);
  }, [timesheets, params.id]);

  const entries = useMemo(() => {
    return timesheetEntries.filter((e) => e.timesheetId === params.id);
  }, [timesheetEntries, params.id]);

  // Staff member lookup removed since timesheets are no longer associated with specific staff

  const project = useMemo(() => {
    return projects.find((p) => p.id === timesheet?.projectId);
  }, [projects, timesheet]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
    const workingDays = entries.filter((e) => e.hours > 0).length;
    const leaveDays = entries.filter((e) => e.hours === 0).length;
    const approvedEntries = entries.filter((e) => e.isApproved).length;
    const pendingEntries = entries.filter((e) => !e.isApproved).length;

    return {
      totalHours,
      workingDays,
      leaveDays,
      approvedEntries,
      pendingEntries,
    };
  }, [entries]);

  const handleSubmit = useCallback(
    (formData: any) => {
      if (editingEntry) {
        updateTimesheetEntry(editingEntry.id, formData);
        toast.success("Entry updated successfully");
      } else {
        addTimesheetEntry({
          ...formData,
          timesheetId: params.id,
          isApproved: false,
        });
        toast.success("Entry added successfully");
      }

      setIsModalOpen(false);
      setEditingEntry(null);
    },
    [editingEntry, addTimesheetEntry, updateTimesheetEntry, params.id]
  );

  const handleEdit = useCallback((entry: TimesheetEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setEntryToDelete(id);
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (entryToDelete) {
      deleteTimesheetEntry(entryToDelete);
      toast.success("Entry deleted successfully");
      setEntryToDelete(null);
    }
  }, [entryToDelete, deleteTimesheetEntry]);

  const handleApprove = useCallback(
    (id: string) => {
      updateTimesheetEntry(id, {
        isApproved: true,
        approvedBy: "admin",
        approvedAt: new Date(),
      });
      toast.success("Entry approved successfully");
    },
    [updateTimesheetEntry]
  );

  const handleSubmitTimesheet = useCallback(() => {
    if (timesheet) {
      updateTimesheet(timesheet.id, {
        status: "submitted",
        submittedAt: new Date(),
        totalHours: totals.totalHours,
        workingDays: totals.workingDays,
        leaveDays: totals.leaveDays,
      });
      toast.success("Timesheet submitted successfully");
    }
  }, [timesheet, updateTimesheet, totals]);

  if (!timesheet) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Timesheet not found.</p>
          <Link
            href="/timesheet"
            className="text-primary-600 hover:text-primary-900"
          >
            Back to Timesheets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Link
              href="/timesheet"
              className="text-primary-600 hover:text-primary-900"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Timesheet Details
            </h1>
          </div>
          <p className="text-gray-600">
            {project?.name} -{" "}
            {format(new Date(timesheet.month + "-01"), "MMMM yyyy")}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Entry
          </button>
          {timesheet.status === "draft" && (
            <button
              onClick={handleSubmitTimesheet}
              className="btn-success flex items-center"
            >
              <CheckIcon className="h-5 w-5 mr-2" />
              Submit Timesheet
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-5">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Total Hours
          </h3>
          <p className="text-3xl font-bold text-primary-600">
            {totals.totalHours}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Working Days
          </h3>
          <p className="text-3xl font-bold text-success-600">
            {totals.workingDays}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Leave Days</h3>
          <p className="text-3xl font-bold text-warning-600">
            {totals.leaveDays}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Approved</h3>
          <p className="text-3xl font-bold text-success-600">
            {totals.approvedEntries}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Pending</h3>
          <p className="text-3xl font-bold text-warning-600">
            {totals.pendingEntries}
          </p>
        </div>
      </div>

      {/* Entries Table */}
      <div className="card">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">Daily Entries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Task</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.length > 0 ? (
                entries
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                  )
                  .map((entry) => (
                    <EntryRow
                      key={entry.id}
                      entry={entry}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onApprove={handleApprove}
                    />
                  ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <p className="text-gray-500">
                      No entries found. Add your first entry to get started.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <EntryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
        }}
        editingEntry={editingEntry}
        onSubmit={handleSubmit}
        timesheet={timesheet}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
