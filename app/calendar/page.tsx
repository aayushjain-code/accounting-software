"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAccountingStore } from "@/store";
import { Card } from "@/components/Card";

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        {children}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { invoices, expenses, projects } = useAccountingStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [modalEvents, setModalEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getEventsForDate = (date: Date) => {
    const events: Array<{
      type: string;
      title: string;
      amount?: number;
      status?: string;
      category?: string;
      milestone?: string;
      color: string;
      details: any;
    }> = [];

    // Invoices due on this date
    const invoicesDue = invoices.filter((invoice) =>
      isSameDay(new Date(invoice.dueDate), date)
    );
    invoicesDue.forEach((invoice) => {
      events.push({
        type: "invoice",
        title: `Invoice ${invoice.invoiceNumber}`,
        amount: invoice.total,
        status: invoice.status,
        color: "bg-blue-100 text-blue-800 border-blue-200",
        details: invoice,
      });
    });

    // Expenses on this date
    const expensesOnDate = expenses.filter((expense) =>
      isSameDay(new Date(expense.date), date)
    );
    expensesOnDate.forEach((expense) => {
      events.push({
        type: "expense",
        title: expense.description,
        amount: expense.amount,
        category: expense.category,
        color: "bg-red-100 text-red-800 border-red-200",
        details: expense,
      });
    });

    // Project milestones
    const projectMilestones = projects.filter((project) =>
      isSameDay(new Date(project.startDate), date)
    );
    projectMilestones.forEach((project) => {
      events.push({
        type: "project",
        title: project.name,
        milestone: "Start",
        color: "bg-green-100 text-green-800 border-green-200",
        details: project,
      });
    });

    return events;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-success-600 bg-success-100";
      case "sent":
        return "text-warning-600 bg-warning-100";
      case "draft":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(
      direction === "prev"
        ? subMonths(currentDate, 1)
        : addMonths(currentDate, 1)
    );
  };

  // Modal open handler
  const openModal = (date: Date, events: any[]) => {
    setModalDate(date);
    setModalEvents(events);
    setModalOpen(true);
    setSelectedEvent(null);
  };

  // Modal close handler
  const closeModal = () => {
    setModalOpen(false);
    setModalDate(null);
    setModalEvents([]);
    setSelectedEvent(null);
  };

  // Event click handler
  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
  };

  // Empty state for month
  const hasAnyEvents = daysInMonth.some(
    (day) => getEventsForDate(day).length > 0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600">
          Track invoices, expenses, and project milestones
        </p>
      </div>

      {/* Calendar Header */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="h-8 w-8 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {format(currentDate, "MMMM yyyy")}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth("next")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {daysInMonth.map((day, index) => {
            const events = getEventsForDate(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border border-gray-200 ${
                  isCurrentMonth ? "bg-white" : "bg-gray-50"
                } ${isToday ? "ring-2 ring-primary-500" : ""}`}
                onClick={() => events.length > 0 && openModal(day, events)}
                style={{ cursor: events.length > 0 ? "pointer" : "default" }}
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`text-sm font-medium ${
                      isToday
                        ? "bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        : isCurrentMonth
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {events.length > 0 && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-1 rounded">
                      {events.length}
                    </span>
                  )}
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {events.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`text-xs p-1 rounded border ${event.color} truncate hover:underline cursor-pointer`}
                      title={event.title}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                        openModal(day, events);
                      }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {event.amount && (
                        <div className="text-xs opacity-75">
                          {formatCurrency(event.amount)}
                        </div>
                      )}
                      {event.status && (
                        <span
                          className={`inline-block px-1 py-0.5 rounded text-xs ${getStatusColor(
                            event.status
                          )}`}
                        >
                          {event.status}
                        </span>
                      )}
                      {event.milestone && (
                        <span className="inline-block px-1 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                          {event.milestone}
                        </span>
                      )}
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div
                      className="text-xs text-gray-500 text-center cursor-pointer hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(day, events);
                      }}
                    >
                      +{events.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Empty state for month */}
        {!hasAnyEvents && (
          <div className="text-center py-8 text-gray-400 text-lg">
            No events for this month.
          </div>
        )}
      </Card>

      {/* Modal for day events */}
      <Modal open={modalOpen} onClose={closeModal}>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Events for {modalDate ? format(modalDate, "MMM dd, yyyy") : ""}
          </h3>
          <div className="space-y-2">
            {modalEvents.map((event, idx) => (
              <div
                key={idx}
                className={`p-2 rounded border ${event.color} cursor-pointer hover:bg-gray-100`}
                onClick={() => handleEventClick(event)}
              >
                <div className="font-medium">{event.title}</div>
                {event.amount && (
                  <div className="text-xs opacity-75">
                    {formatCurrency(event.amount)}
                  </div>
                )}
                {event.status && (
                  <span
                    className={`inline-block px-1 py-0.5 rounded text-xs ${getStatusColor(
                      event.status
                    )}`}
                  >
                    {event.status}
                  </span>
                )}
                {event.milestone && (
                  <span className="inline-block px-1 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                    {event.milestone}
                  </span>
                )}
              </div>
            ))}
          </div>
          {/* Event details */}
          {selectedEvent && (
            <div className="mt-6 p-4 bg-gray-50 rounded border">
              <h4 className="font-semibold mb-2">Event Details</h4>
              {selectedEvent.type === "invoice" && (
                <div>
                  <div>
                    Invoice Number:{" "}
                    <span className="font-mono">
                      {selectedEvent.details.invoiceNumber}
                    </span>
                  </div>
                  <div>
                    Client:{" "}
                    <span className="font-mono">
                      {selectedEvent.details.clientId}
                    </span>
                  </div>
                  <div>
                    Project:{" "}
                    <span className="font-mono">
                      {selectedEvent.details.projectId}
                    </span>
                  </div>
                  <div>
                    Status:{" "}
                    <span className="font-mono">
                      {selectedEvent.details.status}
                    </span>
                  </div>
                  <div>
                    Amount:{" "}
                    <span className="font-mono">
                      {formatCurrency(selectedEvent.details.total)}
                    </span>
                  </div>
                  <div>
                    Due Date:{" "}
                    <span className="font-mono">
                      {format(
                        new Date(selectedEvent.details.dueDate),
                        "MMM dd, yyyy"
                      )}
                    </span>
                  </div>
                </div>
              )}
              {selectedEvent.type === "expense" && (
                <div>
                  <div>
                    Description:{" "}
                    <span className="font-mono">
                      {selectedEvent.details.description}
                    </span>
                  </div>
                  <div>
                    Category:{" "}
                    <span className="font-mono">
                      {selectedEvent.details.category}
                    </span>
                  </div>
                  <div>
                    Amount:{" "}
                    <span className="font-mono">
                      {formatCurrency(selectedEvent.details.amount)}
                    </span>
                  </div>
                  <div>
                    Date:{" "}
                    <span className="font-mono">
                      {format(
                        new Date(selectedEvent.details.date),
                        "MMM dd, yyyy"
                      )}
                    </span>
                  </div>
                </div>
              )}
              {selectedEvent.type === "project" && (
                <div>
                  <div>
                    Project Name:{" "}
                    <span className="font-mono">
                      {selectedEvent.details.name}
                    </span>
                  </div>
                  <div>
                    Client:{" "}
                    <span className="font-mono">
                      {selectedEvent.details.clientId}
                    </span>
                  </div>
                  <div>
                    Status:{" "}
                    <span className="font-mono">
                      {selectedEvent.details.status}
                    </span>
                  </div>
                  <div>
                    Budget:{" "}
                    <span className="font-mono">
                      {formatCurrency(selectedEvent.details.budget)}
                    </span>
                  </div>
                  <div>
                    Start:{" "}
                    <span className="font-mono">
                      {format(
                        new Date(selectedEvent.details.startDate),
                        "MMM dd, yyyy"
                      )}
                    </span>
                  </div>
                  {selectedEvent.details.endDate && (
                    <div>
                      End:{" "}
                      <span className="font-mono">
                        {format(
                          new Date(selectedEvent.details.endDate),
                          "MMM dd, yyyy"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Legend */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
            <span className="text-sm text-gray-600">Invoices</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
            <span className="text-sm text-gray-600">Expenses</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
            <span className="text-sm text-gray-600">Projects</span>
          </div>
        </div>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Upcoming Events
        </h3>
        <div className="space-y-3">
          {invoices
            .filter((invoice) => new Date(invoice.dueDate) >= new Date())
            .sort(
              (a, b) =>
                new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            )
            .slice(0, 5)
            .map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </div>
                  <div className="text-sm text-gray-600">
                    Due: {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {formatCurrency(invoice.total)}
                  </div>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(
                      invoice.status
                    )}`}
                  >
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
