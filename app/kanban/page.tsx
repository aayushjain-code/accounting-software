"use client";

import { useState, useMemo } from "react";
import { useAccountingStore } from "@/store";
import { Timesheet, Invoice } from "@/types";
import { 
  PlusIcon, 
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  DocumentTextIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  UserIcon,
  CalendarIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { Tooltip, ActionTooltip } from "@/components/Tooltip";

interface KanbanItem {
  id: string;
  type: "timesheet" | "invoice";
  title: string;
  description: string;
  status: string;
  amount?: number;
  date: Date;
  assignee?: string;
  project?: string;
  priority: "low" | "medium" | "high" | "critical";
}

const KanbanColumn = ({ 
  title, 
  items, 
  status, 
  onDrop, 
  onDragOver 
}: {
  title: string;
  items: KanbanItem[];
  status: string;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "timesheet-created":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "timesheet-approved":
        return "bg-green-50 border-green-200 text-green-800";
      case "invoice-raised":
        return "bg-purple-50 border-purple-200 text-purple-800";
      case "payment-cleared":
        return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "blocked":
        return "bg-red-50 border-red-200 text-red-800";
      case "critical":
        return "bg-orange-50 border-orange-200 text-orange-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />;
      case "high":
        return <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />;
      case "medium":
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
            {items.length} items
          </span>
        </div>
        
        <div 
          className="space-y-4 min-h-[600px]"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          {items.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", item.id);
              }}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-move group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {item.type === "timesheet" ? (
                    <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                  ) : (
                    <CurrencyRupeeIcon className="h-5 w-5 text-purple-600" />
                  )}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                    {getPriorityIcon(item.priority)}
                    <span className="ml-1 capitalize">{item.priority}</span>
                  </span>
                </div>
                <ActionTooltip content="View details" action="Click to see full information">
                  <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </ActionTooltip>
              </div>
              
              <h4 className="font-medium text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                {item.title}
              </h4>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {item.description}
              </p>
              
              <div className="space-y-2">
                {item.project && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                    <span>{item.project}</span>
                  </div>
                )}
                
                {item.assignee && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span>{item.assignee}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <span>{format(item.date, "MMM dd, yyyy")}</span>
                </div>
                
                {item.amount && (
                  <div className="flex items-center space-x-2 text-sm font-medium text-gray-900">
                    <CurrencyRupeeIcon className="h-4 w-4 text-green-600" />
                    <span>₹{item.amount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="flex items-center justify-center h-32 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <DocumentTextIcon className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No items</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function KanbanPage() {
  const { timesheets, invoices, projects, clients } = useAccountingStore();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const kanbanItems = useMemo(() => {
    const items: KanbanItem[] = [];

    // Convert timesheets to kanban items
    timesheets.forEach((timesheet) => {
      const project = projects.find(p => p.id === timesheet.projectId);
      const client = clients.find(c => c.id === project?.clientId);
      
      let status = "timesheet-created";
      let priority: "low" | "medium" | "high" | "critical" = "medium";
      
      if (timesheet.status === "approved") {
        status = "timesheet-approved";
        priority = "high";
      } else if (timesheet.status === "invoiced") {
        status = "invoice-raised";
        priority = "critical";
      } else if (timesheet.status === "draft") {
        status = "timesheet-created";
        priority = "low";
      } else if (timesheet.status === "submitted") {
        status = "timesheet-created";
        priority = "medium";
      }

      // Check if payment is cleared
      if (timesheet.invoiceId) {
        const invoice = invoices.find(i => i.id === timesheet.invoiceId);
        if (invoice?.status === "paid") {
          status = "payment-cleared";
          priority = "low";
        }
      }

      items.push({
        id: timesheet.id,
        type: "timesheet",
        title: `Timesheet - ${project?.name || "Unknown Project"}`,
        description: `${timesheet.daysWorked || 0} days worked in ${timesheet.month} ${timesheet.year}`,
        status,
        amount: timesheet.totalAmount,
        date: new Date(timesheet.createdAt),
        assignee: "Team Member",
        project: project?.name,
        priority,
      });
    });

    // Convert invoices to kanban items
    invoices.forEach((invoice) => {
      const client = clients.find(c => c.id === invoice.clientId);
      let status = "invoice-raised";
      let priority: "low" | "medium" | "high" | "critical" = "medium";

      if (invoice.status === "paid") {
        status = "payment-cleared";
        priority = "low";
      } else if (invoice.status === "sent") {
        status = "invoice-raised";
        priority = "high";
      } else if (invoice.status === "draft") {
        status = "invoice-raised";
        priority = "medium";
      }

      items.push({
        id: invoice.id,
        type: "invoice",
        title: `Invoice #${invoice.invoiceNumber}`,
        description: `Invoice for ${client?.name || "Unknown Client"}`,
        status,
        amount: invoice.total,
        date: new Date(invoice.createdAt),
        assignee: "Finance Team",
        project: "Billing",
        priority,
      });
    });

    return items;
  }, [timesheets, invoices, projects, clients]);

  const columns = [
    {
      id: "timesheet-created",
      title: "Timesheet Created",
      status: "timesheet-created",
      items: kanbanItems.filter(item => item.status === "timesheet-created"),
    },
    {
      id: "timesheet-approved",
      title: "Approved Timesheet",
      status: "timesheet-approved",
      items: kanbanItems.filter(item => item.status === "timesheet-approved"),
    },
    {
      id: "invoice-raised",
      title: "Invoice Raised",
      status: "invoice-raised",
      items: kanbanItems.filter(item => item.status === "invoice-raised"),
    },
    {
      id: "payment-cleared",
      title: "Payment Cleared",
      status: "payment-cleared",
      items: kanbanItems.filter(item => item.status === "payment-cleared"),
    },
    {
      id: "blocked",
      title: "Blocked/Critical",
      status: "blocked",
      items: kanbanItems.filter(item => item.status === "blocked" || item.priority === "critical"),
    },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain");
    
    // In a real application, you would update the item status here
    console.log(`Moving item ${itemId} to status ${targetStatus}`);
    
    // For now, we'll just show a toast notification
    // You can implement actual status updates by calling store actions
  };

  const totalItems = kanbanItems.length;
  const criticalItems = kanbanItems.filter(item => item.priority === "critical").length;
  const overdueItems = kanbanItems.filter(item => item.status === "blocked").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoicing Kanban</h1>
            <p className="text-gray-600 mt-2">
              Track the flow from timesheet creation to payment clearance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{totalItems}</p>
              <p className="text-sm text-gray-600">Total Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{criticalItems}</p>
              <p className="text-sm text-gray-600">Critical</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{overdueItems}</p>
              <p className="text-sm text-gray-600">Overdue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Diagram */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Overview</h3>
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Timesheet Created</span>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-gray-400" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckIcon className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Approved</span>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-gray-400" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <CurrencyRupeeIcon className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Invoice Raised</span>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-gray-400" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Payment Cleared</span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            title={column.title}
            items={column.items}
            status={column.status}
            onDrop={(e) => handleDrop(e, column.status)}
            onDragOver={handleDragOver}
          />
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <DocumentTextIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Drag and drop items between columns to update their status</li>
              <li>• Items are automatically categorized based on their current state</li>
              <li>• Critical items appear in the Blocked/Critical column</li>
              <li>• Click the arrow icon to view detailed information</li>
              <li>• Color-coded priorities help identify urgent items</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 