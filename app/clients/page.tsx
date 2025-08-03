"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useAccountingStore } from "@/store";
import { Client } from "@/types";
import { ReceiptRefundIcon } from "@heroicons/react/24/outline";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  UserIcon,
  MapPinIcon,
  TagIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Tooltip, ActionTooltip, IconTooltip } from "@/components/Tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import React from "react";
import Modal from "@/components/Modal";
import { useSearch } from "@/hooks/useSearch";
import { usePagination } from "@/hooks/usePagination";
import { useCache } from "@/hooks/useCache";
import { Pagination, LoadingSkeleton } from "@/components/Pagination";
import { performanceMonitor } from "@/utils/performance";

// Enhanced Client Card Component
const ClientCard = React.memo(
  ({
    client,
    onEdit,
    onDelete,
  }: {
    client: Client;
    onEdit: (client: Client) => void;
    onDelete: (id: string) => void;
  }) => {
    const getStatusColor = (status: string | undefined) => {
      const safeStatus = status || "active";
      switch (safeStatus) {
        case "active":
          return "bg-green-100 text-green-800 border-green-200";
        case "inactive":
          return "bg-gray-100 text-gray-800 border-gray-200";
        case "prospect":
          return "bg-blue-100 text-blue-800 border-blue-200";
        case "lead":
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };

    const getCompanySizeColor = (size: string | undefined) => {
      const safeSize = size || "small";
      switch (safeSize) {
        case "startup":
          return "bg-purple-100 text-purple-800";
        case "small":
          return "bg-blue-100 text-blue-800";
        case "medium":
          return "bg-green-100 text-green-800";
        case "large":
          return "bg-orange-100 text-orange-800";
        case "enterprise":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    const formatStatus = (status: string | undefined) => {
      const safeStatus = status || "active";
      return safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1);
    };

    const formatCompanySize = (size: string | undefined) => {
      const safeSize = size || "small";
      return safeSize.charAt(0).toUpperCase() + safeSize.slice(1);
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200 group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <BuildingOfficeIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-mono font-semibold text-primary-700 bg-primary-50 dark:bg-primary-900 px-2 py-1 rounded-md border border-primary-200 dark:border-primary-800 text-xs">
                  {client.clientCode}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {client.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {client.company}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ActionTooltip
              content="View details"
              action="Click to see full profile"
            >
              <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200">
                <EyeIcon className="h-4 w-4" />
              </button>
            </ActionTooltip>
            <ActionTooltip
              content="Edit client"
              action="Click to modify details"
            >
              <button
                onClick={() => onEdit(client)}
                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </ActionTooltip>
            <ActionTooltip content="Delete client" action="Permanently remove">
              <button
                onClick={() => onDelete(client.id)}
                className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all duration-200"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </ActionTooltip>
          </div>
        </div>

        {/* Status and Company Size */}
        <div className="flex items-center space-x-3 mb-4">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
              client.status
            )}`}
          >
            {formatStatus(client.status)}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCompanySizeColor(
              client.companySize
            )}`}
          >
            {formatCompanySize(client.companySize)}
          </span>
          {client.industry && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {client.industry}
            </span>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <EnvelopeIcon className="h-4 w-4 text-gray-400" />
            <span>{client.email}</span>
          </div>
          {client.phone && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <PhoneIcon className="h-4 w-4 text-gray-400" />
              <span>{client.phone}</span>
            </div>
          )}
          {client.companyWebsite && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <GlobeAltIcon className="h-4 w-4 text-gray-400" />
              <span className="text-primary-600 hover:text-primary-800 transition-colors">
                {client.companyWebsite}
              </span>
            </div>
          )}
          {client.companyAddress && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPinIcon className="h-4 w-4 text-gray-400" />
              <span className="truncate">{client.companyAddress}</span>
            </div>
          )}
        </div>

        {/* POC Information */}
        {client.pocName && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <UserIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Point of Contact
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-600">{client.pocName}</div>
              {client.pocEmail && (
                <div className="text-sm text-gray-600">{client.pocEmail}</div>
              )}
              {client.pocContact && (
                <div className="text-sm text-gray-600">{client.pocContact}</div>
              )}
            </div>
          </div>
        )}

        {/* Financial Information */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {client.annualRevenue && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100">
              <div className="flex items-center space-x-2">
                <CurrencyRupeeIcon className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  Annual Revenue
                </span>
              </div>
              <div className="text-sm font-semibold text-green-800 mt-1">
                ₹
                {client.annualRevenue.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          )}
          {client.employeeCount && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
              <div className="flex items-center space-x-2">
                <UserGroupIcon className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">
                  Employees
                </span>
              </div>
              <div className="text-sm font-semibold text-blue-800 mt-1">
                {client.employeeCount}
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {client.tags && client.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {client.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
              >
                <TagIcon className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Created {format(new Date(client.createdAt), "MMM dd, yyyy")}
          </div>
          {client.source && (
            <div className="text-xs text-gray-500">Source: {client.source}</div>
          )}
        </div>
      </div>
    );
  }
);

ClientCard.displayName = "ClientCard";

export default function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient, invoices } =
    useAccountingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Performance monitoring
  const renderStart = performance.now();
  performanceMonitor.recordMemoryUsage();

  // Enhanced search with caching
  const {
    searchTerm,
    filteredItems: filteredClients,
    handleSearchChange,
    isSearching,
  } = useSearch(clients, ["name", "company", "email", "industry"]);

  // Pagination for large datasets
  const {
    currentItems: paginatedClients,
    paginationState,
    goToPage,
    goToNextPage,
    goToPrevPage,
    changePageSize,
  } = usePagination(filteredClients, {
    initialPageSize: 12,
    enableVirtualScroll: false,
  });

  // Memoized filtered clients by status
  const clientsByStatus = useMemo(() => {
    if (statusFilter === "all") return paginatedClients;
    return paginatedClients.filter((client) => client.status === statusFilter);
  }, [paginatedClients, statusFilter]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    gstId: "",
    companyAddress: "",
    companyWebsite: "",
    companyLinkedin: "",
    companyOwner: "",
    pocName: "",
    pocEmail: "",
    pocContact: "",
    companyLogo: "",
    industry: "",
    companySize: "small" as
      | "startup"
      | "small"
      | "medium"
      | "large"
      | "enterprise",
    status: "active" as "active" | "inactive" | "prospect" | "lead",
    source: "",
    notes: "",
    tags: [] as string[],
    annualRevenue: "",
    employeeCount: "",
  });

  // Performance monitoring - record render time
  useEffect(() => {
    const renderTime = performance.now() - renderStart;
    performanceMonitor.recordRenderTime("ClientsPage", renderTime);
  }, [renderStart]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const clientData = {
      ...formData,
      annualRevenue: formData.annualRevenue
        ? parseInt(formData.annualRevenue)
        : undefined,
      employeeCount: formData.employeeCount
        ? parseInt(formData.employeeCount)
        : undefined,
    };

    if (editingClient) {
      updateClient(editingClient.id, clientData);
      toast.success("Client updated successfully");
    } else {
      addClient(clientData);
      toast.success("Client added successfully");
    }

    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      gstId: "",
      companyAddress: "",
      companyWebsite: "",
      companyLinkedin: "",
      companyOwner: "",
      pocName: "",
      pocEmail: "",
      pocContact: "",
      companyLogo: "",
      industry: "",
      companySize: "small" as const,
      status: "active" as const,
      source: "",
      notes: "",
      tags: [] as string[],
      annualRevenue: "",
      employeeCount: "",
    });
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      address: client.address,
      gstId: client.gstId,
      companyAddress: client.companyAddress,
      companyWebsite: client.companyWebsite,
      companyLinkedin: client.companyLinkedin,
      companyOwner: client.companyOwner,
      pocName: client.pocName,
      pocEmail: client.pocEmail,
      pocContact: client.pocContact,
      companyLogo: client.companyLogo,
      industry: client.industry,
      companySize: client.companySize,
      status: client.status,
      source: client.source,
      notes: client.notes,
      tags: client.tags,
      annualRevenue: client.annualRevenue?.toString() || "",
      employeeCount: client.employeeCount?.toString() || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setClientToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete);
      toast.success("Client deleted successfully");
      setClientToDelete(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Clients
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your client relationships and business partnerships
            </p>
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <ReceiptRefundIcon className="h-4 w-4 text-primary-600" />
                <span>
                  <span className="font-semibold text-primary-600">
                    {invoices.length}
                  </span>{" "}
                  Invoices
                </span>
              </div>
            </div>
          </div>
          <ActionTooltip
            content="Add New Client"
            action="Create a new client profile"
          >
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Client
            </button>
          </ActionTooltip>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search clients by name, company, email, or industry..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-primary-600"></div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="prospect">Prospect</option>
              <option value="lead">Lead</option>
            </select>
            <Tooltip content="Filter clients by status and search across all fields">
              <div className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <FunnelIcon className="h-5 w-5" />
              </div>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Clients Grid with Pagination */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientsByStatus.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Pagination */}
        {paginationState.totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <Pagination
              paginationState={paginationState}
              onPageChange={goToPage}
              onPageSizeChange={changePageSize}
              showPageSizeSelector={true}
              pageSizeOptions={[6, 12, 24, 48]}
            />
          </div>
        )}
      </div>

      {/* Empty State */}
      {clientsByStatus.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
            <BuildingOfficeIcon className="h-16 w-16" />
          </div>
          <p className="text-gray-500 text-lg font-medium mb-4">
            {searchTerm || statusFilter !== "all"
              ? "No clients found matching your criteria."
              : "No clients found. Add your first client to get started."}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200"
            >
              Add Your First Client
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
          setFormData({
            name: "",
            email: "",
            phone: "",
            company: "",
            address: "",
            gstId: "",
            companyAddress: "",
            companyWebsite: "",
            companyLinkedin: "",
            companyOwner: "",
            pocName: "",
            pocEmail: "",
            pocContact: "",
            companyLogo: "",
            industry: "",
            companySize: "small" as const,
            status: "active" as const,
            source: "",
            notes: "",
            tags: [] as string[],
            annualRevenue: "",
            employeeCount: "",
          });
        }}
        title={editingClient ? "Edit Client" : "Add New Client"}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingClient(null);
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  company: "",
                  address: "",
                  gstId: "",
                  companyAddress: "",
                  companyWebsite: "",
                  companyLinkedin: "",
                  companyOwner: "",
                  pocName: "",
                  pocEmail: "",
                  pocContact: "",
                  companyLogo: "",
                  industry: "",
                  companySize: "small" as const,
                  status: "active" as const,
                  source: "",
                  notes: "",
                  tags: [] as string[],
                  annualRevenue: "",
                  employeeCount: "",
                });
              }}
              className="btn-secondary mr-2"
            >
              Cancel
            </button>
            <button type="submit" form="client-form" className="btn-primary">
              {editingClient ? "Update" : "Add"} Client
            </button>
          </>
        }
      >
        <form id="client-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Client Name *
                <IconTooltip
                  content="Enter the primary contact person's name"
                  icon={InformationCircleIcon}
                  position="right"
                >
                  <span></span>
                </IconTooltip>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Company *
                <IconTooltip
                  content="Enter the company or organization name"
                  icon={InformationCircleIcon}
                  position="right"
                >
                  <span></span>
                </IconTooltip>
              </label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Email *
                <IconTooltip
                  content="Primary email address for communication"
                  icon={InformationCircleIcon}
                  position="right"
                >
                  <span></span>
                </IconTooltip>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Phone
                <IconTooltip
                  content="Contact phone number"
                  icon={InformationCircleIcon}
                  position="right"
                >
                  <span></span>
                </IconTooltip>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Industry
                <IconTooltip
                  content="Client's business industry or sector"
                  icon={InformationCircleIcon}
                  position="right"
                >
                  <span></span>
                </IconTooltip>
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Company Size
                <IconTooltip
                  content="Size of the client's organization"
                  icon={InformationCircleIcon}
                  position="right"
                >
                  <span></span>
                </IconTooltip>
              </label>
              <select
                value={formData.companySize}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    companySize: e.target.value as
                      | "startup"
                      | "small"
                      | "medium"
                      | "large"
                      | "enterprise",
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="startup">Startup</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Status
                <IconTooltip
                  content="Current relationship status with the client"
                  icon={InformationCircleIcon}
                  position="right"
                >
                  <span></span>
                </IconTooltip>
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as
                      | "active"
                      | "inactive"
                      | "prospect"
                      | "lead",
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="prospect">Prospect</option>
                <option value="lead">Lead</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Annual Revenue (₹)
                <IconTooltip
                  content="Client's annual revenue in Indian Rupees"
                  icon={InformationCircleIcon}
                  position="right"
                >
                  <span></span>
                </IconTooltip>
              </label>
              <input
                type="number"
                value={formData.annualRevenue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    annualRevenue: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder="Annual revenue in INR"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Employee Count
                <IconTooltip
                  content="Number of employees in the organization"
                  icon={InformationCircleIcon}
                  position="right"
                >
                  <span></span>
                </IconTooltip>
              </label>
              <input
                type="number"
                value={formData.employeeCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    employeeCount: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder="Number of employees"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Company Website
                <IconTooltip
                  content="Client's official website URL"
                  icon={InformationCircleIcon}
                  position="right"
                >
                  <span></span>
                </IconTooltip>
              </label>
              <input
                type="url"
                value={formData.companyWebsite}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    companyWebsite: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Company Address
                <IconTooltip
                  content="Physical address of the company"
                  icon={InformationCircleIcon}
                  position="right"
                >
                  <span></span>
                </IconTooltip>
              </label>
              <input
                type="text"
                value={formData.companyAddress}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    companyAddress: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                POC Name
                <IconTooltip
                  content="Point of contact person's name"
                  icon={InformationCircleIcon}
                  position="right"
                >
                  <span></span>
                </IconTooltip>
              </label>
              <input
                type="text"
                value={formData.pocName}
                onChange={(e) =>
                  setFormData({ ...formData, pocName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                POC Email
                <IconTooltip
                  content="Point of contact's email address"
                  icon={InformationCircleIcon}
                  position="right"
                >
                  <span></span>
                </IconTooltip>
              </label>
              <input
                type="email"
                value={formData.pocEmail}
                onChange={(e) =>
                  setFormData({ ...formData, pocEmail: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Notes
              <IconTooltip
                content="Additional notes about the client"
                icon={InformationCircleIcon}
                position="right"
              >
                <span></span>
              </IconTooltip>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              rows={3}
              placeholder="Additional notes about the client"
            />
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Client"
        message="Are you sure you want to delete this client? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
