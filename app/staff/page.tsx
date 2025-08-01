"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useAccountingStore } from "@/store";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Staff } from "@/types";
import { useSearch } from "@/hooks/useSearch";
import { formatCurrency, getStatusColor } from "@/utils/helpers";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

// Reusable components
const SearchBar = React.memo(
  ({
    searchTerm,
    onSearchChange,
    isSearching = false,
  }: {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    isSearching?: boolean;
  }) => (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search staff members..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      {isSearching && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-primary-600"></div>
        </div>
      )}
    </div>
  )
);

SearchBar.displayName = "SearchBar";

const StaffRow = React.memo(
  ({
    staffMember,
    onEdit,
    onDelete,
  }: {
    staffMember: Staff;
    onEdit: (staff: Staff) => void;
    onDelete: (id: string) => void;
  }) => {
    return (
      <tr key={staffMember.id} className="hover:bg-gray-50">
        <td>
          <div>
            <div className="font-medium text-gray-900">{staffMember.name}</div>
            <div className="text-sm text-gray-500">
              {staffMember.isActive ? "Active" : "Inactive"}
            </div>
          </div>
        </td>
        <td>{staffMember.role}</td>
        <td>{staffMember.email}</td>
        <td>{staffMember.phone}</td>
        <td>{formatCurrency(staffMember.hourlyRate)}</td>
        <td>{format(new Date(staffMember.startDate), "MMM dd, yyyy")}</td>
        <td>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(staffMember)}
              className="text-primary-600 hover:text-primary-900 transition-colors"
              title="Edit staff member"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(staffMember.id)}
              className="text-danger-600 hover:text-danger-900 transition-colors"
              title="Delete staff member"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }
);

StaffRow.displayName = "StaffRow";

const StaffModal = React.memo(
  ({
    isOpen,
    onClose,
    editingStaff,
    onSubmit,
  }: {
    isOpen: boolean;
    onClose: () => void;
    editingStaff: Staff | null;
    onSubmit: (data: any) => void;
  }) => {
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      phone: "",
      role: "",
      hourlyRate: "",
      startDate: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form when modal opens/closes
    React.useEffect(() => {
      if (isOpen) {
        if (editingStaff) {
          setFormData({
            name: editingStaff.name,
            email: editingStaff.email,
            phone: editingStaff.phone,
            role: editingStaff.role,
            hourlyRate: editingStaff.hourlyRate?.toString() || "0",
            startDate: format(new Date(editingStaff.startDate), "yyyy-MM-dd"),
          });
        } else {
          setFormData({
            name: "",
            email: "",
            phone: "",
            role: "",
            hourlyRate: "",
            startDate: "",
          });
        }
        setErrors({});
      }
    }, [isOpen, editingStaff]);

    const validateForm = useCallback(() => {
      const newErrors: Record<string, string> = {};

      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = "Invalid email format";
      if (!formData.role.trim()) newErrors.role = "Role is required";
      if (!formData.hourlyRate || parseFloat(formData.hourlyRate) <= 0)
        newErrors.hourlyRate = "Valid hourly rate is required";
      if (!formData.startDate) newErrors.startDate = "Start date is required";

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
          onSubmit(formData);
        }
      },
      [formData, validateForm, onSubmit]
    );

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`input ${
                      errors.name ? "border-danger-500" : ""
                    }`}
                  />
                  {errors.name && (
                    <p className="text-danger-500 text-sm mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className={`input ${
                      errors.role ? "border-danger-500" : ""
                    }`}
                  />
                  {errors.role && (
                    <p className="text-danger-500 text-sm mt-1">
                      {errors.role}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`input ${
                      errors.email ? "border-danger-500" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-danger-500 text-sm mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hourly Rate (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.hourlyRate}
                    onChange={(e) =>
                      setFormData({ ...formData, hourlyRate: e.target.value })
                    }
                    className={`input ${
                      errors.hourlyRate ? "border-danger-500" : ""
                    }`}
                  />
                  {errors.hourlyRate && (
                    <p className="text-danger-500 text-sm mt-1">
                      {errors.hourlyRate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className={`input ${
                      errors.startDate ? "border-danger-500" : ""
                    }`}
                  />
                  {errors.startDate && (
                    <p className="text-danger-500 text-sm mt-1">
                      {errors.startDate}
                    </p>
                  )}
                </div>
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
                  {editingStaff ? "Update" : "Add"} Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
);

StaffModal.displayName = "StaffModal";

export default function StaffPage() {
  const { staff, addStaff, updateStaff, deleteStaff } = useAccountingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);

  // Use the search hook
  const {
    searchTerm,
    filteredItems: filteredStaff,
    handleSearchChange,
    isSearching,
  } = useSearch(staff, ["name", "email", "role", "phone"]);

  // Memoized stats
  const stats = useMemo(() => {
    const totalStaff = staff.length;
    const activeStaff = staff.filter((s) => s.isActive).length;
    const totalHourlyRate = staff.reduce((sum, s) => sum + s.hourlyRate, 0);
    const avgHourlyRate = totalStaff > 0 ? totalHourlyRate / totalStaff : 0;

    return { totalStaff, activeStaff, avgHourlyRate };
  }, [staff]);

  const handleSubmit = useCallback(
    (formData: any) => {
      if (editingStaff) {
        updateStaff(editingStaff.id, formData);
        toast.success("Staff updated successfully");
      } else {
        addStaff(formData);
        toast.success("Staff added successfully");
      }

      setIsModalOpen(false);
      setEditingStaff(null);
    },
    [editingStaff, addStaff, updateStaff]
  );

  const handleEdit = useCallback((staffMember: Staff) => {
    setEditingStaff(staffMember);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setStaffToDelete(id);
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (staffToDelete) {
      deleteStaff(staffToDelete);
      toast.success("Staff deleted successfully");
      setStaffToDelete(null);
    }
  }, [staffToDelete, deleteStaff]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="text-gray-600">Manage your team members</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Staff
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Total Staff
          </h3>
          <p className="text-3xl font-bold text-primary-600">
            {stats.totalStaff}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Active Staff
          </h3>
          <p className="text-3xl font-bold text-success-600">
            {stats.activeStaff}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Avg Hourly Rate
          </h3>
          <p className="text-3xl font-bold text-warning-600">
            {formatCurrency(stats.avgHourlyRate)}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="mb-4">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            isSearching={isSearching}
          />
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Hourly Rate</th>
                <th>Start Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStaff.map((staffMember) => (
                <StaffRow
                  key={staffMember.id}
                  staffMember={staffMember}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
          {filteredStaff.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm
                  ? "No staff members found matching your search."
                  : "No staff members found. Add your first staff member to get started."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <StaffModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStaff(null);
        }}
        editingStaff={editingStaff}
        onSubmit={handleSubmit}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Staff Member"
        message="Are you sure you want to delete this staff member? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
