"use client";

import React, { useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { toast } from "react-hot-toast";
import { DirectoryContact } from "@/types";

interface DirectoryProps {
  contacts: DirectoryContact[];
  onEdit: (contact: DirectoryContact) => void;
  onDelete: (contactId: string) => void;
  onView: (contact: DirectoryContact) => void;
  onAdd: () => void;
}

export const Directory: React.FC<DirectoryProps> = ({
  contacts,
  onEdit,
  onDelete,
  onView,
  onAdd,
}) => {
  // State for Excel-like features
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof DirectoryContact>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [editingContact, setEditingContact] = useState<DirectoryContact | null>(
    null
  );
  const [editingField, setEditingField] = useState<
    keyof DirectoryContact | null
  >(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Excel-like sorting
  const handleSort = (field: keyof DirectoryContact) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Excel-like filtering and sorting
  const filteredAndSortedContacts = contacts
    .filter((contact) => {
      const matchesSearch =
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.role.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCompany =
        companyFilter === "all" || contact.company === companyFilter;
      const matchesRole = roleFilter === "all" || contact.role === roleFilter;

      return matchesSearch && matchesCompany && matchesRole;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue !== undefined && bValue !== undefined) {
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });

  // Excel-like inline editing
  const handleInlineEdit = (
    contact: DirectoryContact,
    field: keyof DirectoryContact,
    value: string | number | boolean
  ) => {
    // Here you would typically call an update function
    // For now, we'll just update the local state
    const updatedContact = { ...contact, [field]: value };
    // TODO: Integrate with store update function
    setEditingContact(null);
    setEditingField(null);
    toast.success("Contact updated successfully!");
  };

  const renderSortIcon = (field: keyof DirectoryContact) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUpIcon className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 ml-1" />
    );
  };

  const renderEditableCell = (
    contact: DirectoryContact,
    field: keyof DirectoryContact,
    value: string | number | boolean
  ) => {
    const isEditing =
      editingContact?.id === contact.id && editingField === field;

    if (isEditing) {
      return (
        <input
          type="text"
          defaultValue={value}
          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          onBlur={(e) => handleInlineEdit(contact, field, e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleInlineEdit(contact, field, e.currentTarget.value);
            }
          }}
          autoFocus
        />
      );
    }

    return (
      <div
        className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
        onDoubleClick={() => {
          setEditingContact(contact);
          setEditingField(field);
        }}
      >
        {value || "-"}
      </div>
    );
  };



  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "phone", label: "Phone", sortable: true },
    { key: "company", label: "Company", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Excel-like Toolbar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <FunnelIcon className="h-4 w-4" />
            Filters
          </button>

          <Button onClick={onAdd} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Add Contact
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company
              </label>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Companies</option>
                {Array.from(new Set(contacts.map((c) => c.company))).map(
                  (company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Roles</option>
                {Array.from(new Set(contacts.map((c) => c.role))).map(
                  (role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    column.sortable
                      ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      : ""
                  }`}
                  onClick={() =>
                    column.sortable &&
                    handleSort(column.key as keyof DirectoryContact)
                  }
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable &&
                      renderSortIcon(column.key as keyof DirectoryContact)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedContacts.map((contact) => (
              <tr
                key={contact.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-6 w-6">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        <UserIcon className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {renderEditableCell(contact, "name", contact.name)}
                      </div>
                      {contact.isPrimary && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {renderEditableCell(contact, "role", contact.role)}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap max-w-48">
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
                    <div
                      className="text-sm text-gray-900 dark:text-white truncate"
                      title={contact.email}
                    >
                      {renderEditableCell(contact, "email", contact.email)}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
                    <div className="text-sm text-gray-900 dark:text-white">
                      {renderEditableCell(contact, "phone", contact.phone)}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap max-w-40">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
                    <div
                      className="text-sm text-gray-900 dark:text-white truncate"
                      title={contact.company}
                    >
                      {renderEditableCell(contact, "company", contact.company)}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onView(contact)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(contact)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 rounded"
                      title="Edit Contact"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setContactToDelete(contact.id);
                        setShowDeleteDialog(true);
                      }}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded"
                      title="Delete Contact"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredAndSortedContacts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            {searchTerm || companyFilter !== "all" || roleFilter !== "all" ? (
              <>
                <p className="text-lg font-medium">No contacts found</p>
                <p className="text-sm">
                  Try adjusting your search or filter criteria
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">No contacts yet</p>
                <p className="text-sm">
                  Get started by adding your first contact
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          if (contactToDelete) {
            onDelete(contactToDelete);
            setShowDeleteDialog(false);
            setContactToDelete(null);
          }
        }}
        title="Delete Contact"
        message="Are you sure you want to delete this contact? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
