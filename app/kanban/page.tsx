"use client";

import { useState, useMemo, useCallback } from "react";
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
  BuildingOfficeIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { Tooltip, ActionTooltip } from "@/components/Tooltip";
import toast from "react-hot-toast";

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

const KanbanCard = ({ 
  item, 
  onDragStart 
}: {
  item: KanbanItem;
  onDragStart: (e: React.DragEvent) => void;
}) => {
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
        return <ExclamationTriangleIcon className="h-3 w-3 text-red-600" />;
      case "high":
        return <ExclamationTriangleIcon className="h-3 w-3 text-orange-600" />;
      case "medium":
        return <ClockIcon className="h-3 w-3 text-yellow-600" />;
      case "low":
        return <CheckCircleIcon className="h-3 w-3 text-green-600" />;
      default:
        return <ClockIcon className="h-3 w-3 text-gray-600" />;
    }
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-move group hover:border-primary-300 dark:hover:border-primary-500"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-1">
          {item.type === "timesheet" ? (
            <DocumentTextIcon className="h-4 w-4 text-blue-600" />
          ) : (
            <CurrencyRupeeIcon className="h-4 w-4 text-purple-600" />
          )}
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
            {getPriorityIcon(item.priority)}
            <span className="ml-1 capitalize text-xs">{item.priority}</span>
          </span>
        </div>
        <ActionTooltip content="View details" action="Click to see full information">
          <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
            <EyeIcon className="h-3 w-3" />
          </button>
        </ActionTooltip>
      </div>
      
      <h4 className="font-medium text-gray-900 dark:text-white mb-1 text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
        {item.title}
      </h4>
      
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
        {item.description}
      </p>
      
      <div className="space-y-1">
        {item.project && (
          <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
            <BuildingOfficeIcon className="h-3 w-3 text-gray-400 dark:text-gray-500" />
            <span className="truncate">{item.project}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
          <CalendarIcon className="h-3 w-3 text-gray-400 dark:text-gray-500" />
          <span>{format(item.date, "MMM dd")}</span>
        </div>
        
        {item.amount && (
          <div className="flex items-center space-x-1 text-xs font-medium text-gray-900 dark:text-white">
            <CurrencyRupeeIcon className="h-3 w-3 text-green-600" />
            <span>₹{item.amount.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

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

  const handleDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData("text/plain", itemId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  return (
    <div className="flex-1 min-w-0">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
            {items.length}
          </span>
        </div>
        
        <div 
          className="space-y-2 min-h-[400px] max-h-[600px] overflow-y-auto"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          {items.map((item) => (
            <KanbanCard
              key={item.id}
              item={item}
              onDragStart={(e) => handleDragStart(e, item.id)}
            />
          ))}
          
          {items.length === 0 && (
            <div className="flex items-center justify-center h-24 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="text-center">
                <DocumentTextIcon className="h-6 w-6 mx-auto mb-1" />
                <p className="text-xs">No items</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function KanbanPage() {
  const { timesheets, invoices, projects, clients, updateTimesheet, updateInvoice } = useAccountingStore();
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
        priority = "low";
      } else if (timesheet.status === "submitted") {
        status = "timesheet-created";
        priority = "high";
      } else if (timesheet.status === "draft") {
        status = "timesheet-created";
        priority = "medium";
      } else if (timesheet.status === "rejected") {
        status = "blocked";
        priority = "critical";
      } else if (timesheet.status === "invoiced") {
        status = "payment-cleared";
        priority = "low";
      }

      items.push({
        id: timesheet.id,
        type: "timesheet",
        title: `Timesheet - ${project?.name || "Unknown Project"}`,
        description: `${timesheet.daysWorked} days × ${timesheet.hoursPerDay}h × ₹${timesheet.billingRate}/hr`,
        status,
        amount: timesheet.totalAmount,
        date: new Date(timesheet.month),
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
        title: `Invoice - ${client?.name || "Unknown Client"}`,
        description: `Invoice #${invoice.invoiceNumber} - Due: ${format(new Date(invoice.dueDate), "MMM dd")}`,
        status,
        amount: invoice.total,
        date: new Date(invoice.issueDate),
        project: client?.name,
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain");
    
    // Find the item
    const item = kanbanItems.find(i => i.id === itemId);
    if (!item) return;

    // Update the item status based on target column
    if (item.type === "timesheet") {
      const timesheet = timesheets.find(t => t.id === itemId);
      if (timesheet) {
        let newStatus = timesheet.status;
        
        switch (targetStatus) {
          case "timesheet-created":
            newStatus = "draft";
            break;
          case "timesheet-approved":
            newStatus = "approved";
            break;
          case "invoice-raised":
            newStatus = "submitted";
            break;
          case "payment-cleared":
            newStatus = "invoiced";
            break;
          case "blocked":
            newStatus = "rejected";
            break;
        }
        
        updateTimesheet(itemId, { status: newStatus });
        toast.success(`Timesheet moved to ${targetStatus.replace("-", " ")}`);
      }
    } else if (item.type === "invoice") {
      const invoice = invoices.find(i => i.id === itemId);
      if (invoice) {
        let newStatus = invoice.status;
        
        switch (targetStatus) {
          case "invoice-raised":
            newStatus = "draft";
            break;
          case "payment-cleared":
            newStatus = "paid";
            break;
          case "blocked":
            newStatus = "sent";
            break;
        }
        
        updateInvoice(itemId, { status: newStatus });
        toast.success(`Invoice moved to ${targetStatus.replace("-", " ")}`);
      }
    }
  }, [kanbanItems, timesheets, invoices, updateTimesheet, updateInvoice]);

  const totalItems = kanbanItems.length;
  const criticalItems = kanbanItems.filter(item => item.priority === "critical").length;
  const overdueItems = kanbanItems.filter(item => item.status === "blocked").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoicing Kanban</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              Track the flow from timesheet creation to payment clearance
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{totalItems}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Items</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{criticalItems}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Critical</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{overdueItems}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Overdue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Diagram */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Workflow Overview</h3>
        <div className="flex items-center justify-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Created</span>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckIcon className="h-3 w-3 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Approved</span>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <CurrencyRupeeIcon className="h-3 w-3 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Invoice</span>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Paid</span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
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
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-lg">
            <DocumentTextIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">How to Use</h3>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-0.5">
              <li>• Drag and drop items between columns to update their status</li>
              <li>• Items are automatically categorized based on their current state</li>
              <li>• Critical items appear in the Blocked/Critical column</li>
              <li>• Click the eye icon to view detailed information</li>
              <li>• Color-coded priorities help identify urgent items</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 