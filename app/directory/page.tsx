"use client";

import React, { useState } from "react";
import { Directory } from "@/components/Directory";
import Modal from "@/components/Modal";
import { Button } from "@/components/Button";
import { toast } from "react-hot-toast";

interface DirectoryContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  state: string;
  country: string;
  website: string;
  linkedin: string;
  notes: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function DirectoryPage() {
  const [contacts, setContacts] = useState<DirectoryContact[]>([
    {
      id: "1",
      name: "John Smith",
      role: "CEO",
      email: "john.smith@techcorp.com",
      phone: "+1-555-0123",
      company: "TechCorp Solutions",
      address: "123 Tech Street",
      city: "San Francisco",
      state: "CA",
      country: "United States",
      website: "https://techcorp.com",
      linkedin: "linkedin.com/in/johnsmith",
      notes: "Primary decision maker for all technology projects",
      isPrimary: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "Sarah Johnson",
      role: "Project Manager",
      email: "sarah.johnson@healthcareplus.com",
      phone: "+1-555-0124",
      company: "Healthcare Plus",
      address: "456 Health Avenue",
      city: "Boston",
      state: "MA",
      country: "United States",
      website: "https://healthcareplus.com",
      linkedin: "linkedin.com/in/sarahjohnson",
      notes: "Coordinates all project implementations",
      isPrimary: false,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-10"),
    },
    {
      id: "3",
      name: "Michael Chen",
      role: "Finance Director",
      email: "michael.chen@financetrust.com",
      phone: "+1-555-0125",
      company: "Finance Trust Bank",
      address: "789 Finance Boulevard",
      city: "New York",
      state: "NY",
      country: "United States",
      website: "https://financetrust.com",
      linkedin: "linkedin.com/in/michaelchen",
      notes: "Handles all financial approvals and budgeting",
      isPrimary: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-12"),
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentContact, setCurrentContact] = useState<DirectoryContact | null>(
    null
  );
  const [editingContact, setEditingContact] = useState<DirectoryContact | null>(
    null
  );

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleEdit = (contact: DirectoryContact) => {
    setEditingContact({ ...contact });
    setShowEditModal(true);
  };

  const handleDelete = (contactId: string) => {
    setContacts(contacts.filter((c) => c.id !== contactId));
    toast.success("Contact deleted successfully!");
  };

  const handleView = (contact: DirectoryContact) => {
    setCurrentContact(contact);
    setShowViewModal(true);
  };

  const handleSaveContact = (contact: DirectoryContact) => {
    if (contact.id) {
      // Update existing contact
      setContacts(
        contacts.map((c) =>
          c.id === contact.id ? { ...contact, updatedAt: new Date() } : c
        )
      );
      toast.success("Contact updated successfully!");
    } else {
      // Add new contact
      const newContact = {
        ...contact,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setContacts([...contacts, newContact]);
      toast.success("Contact added successfully!");
    }
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingContact(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
            <svg
              className="w-6 h-6 text-primary-600 dark:text-primary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Business Directory
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage all your business contacts, client POCs, and company
              information
            </p>
          </div>
        </div>
      </div>

      {/* Directory Component */}
      <Directory
        contacts={contacts}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onAdd={handleAdd}
      />

      {/* Add Contact Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Contact"
      >
        <ContactForm
          contact={null}
          onSave={handleSaveContact}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Contact Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Contact"
      >
        <ContactForm
          contact={editingContact}
          onSave={handleSaveContact}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      {/* View Contact Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Contact Details"
      >
        {currentContact && (
          <ContactView
            contact={currentContact}
            onClose={() => setShowViewModal(false)}
            onEdit={() => {
              setShowViewModal(false);
              handleEdit(currentContact);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

// Contact Form Component
interface ContactFormProps {
  contact: DirectoryContact | null;
  onSave: (contact: DirectoryContact) => void;
  onCancel: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({
  contact,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<DirectoryContact>>(
    contact || {
      name: "",
      role: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      city: "",
      state: "",
      country: "United States",
      website: "",
      linkedin: "",
      notes: "",
      isPrimary: false,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as DirectoryContact);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contact Name *
          </label>
          <input
            type="text"
            required
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Role *
          </label>
          <input
            type="text"
            required
            value={formData.role || ""}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email || ""}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone || ""}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company *
          </label>
          <input
            type="text"
            required
            value={formData.company || ""}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            City
          </label>
          <input
            type="text"
            value={formData.city || ""}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            State/Province
          </label>
          <input
            type="text"
            value={formData.state || ""}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Country
          </label>
          <input
            type="text"
            value={formData.country || ""}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Website
          </label>
          <input
            type="url"
            value={formData.website || ""}
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes
        </label>
        <textarea
          rows={3}
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPrimary"
          checked={formData.isPrimary || false}
          onChange={(e) =>
            setFormData({ ...formData, isPrimary: e.target.checked })
          }
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label
          htmlFor="isPrimary"
          className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
        >
          Primary contact for this company
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {contact ? "Update Contact" : "Add Contact"}
        </Button>
      </div>
    </form>
  );
};

// Contact View Component
interface ContactViewProps {
  contact: DirectoryContact;
  onClose: () => void;
  onEdit: () => void;
}

const ContactView: React.FC<ContactViewProps> = ({
  contact,
  onClose,
  onEdit,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Contact Information
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Name
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {contact.name}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Role
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {contact.role}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Email
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {contact.email}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Phone
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {contact.phone || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Company Information
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Company
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {contact.company}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Location
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {contact.city}, {contact.state}, {contact.country}
              </p>
            </div>
          </div>
        </div>
      </div>

      {contact.notes && (
        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Notes
          </label>
          <p className="text-sm text-gray-900 dark:text-white mt-1">
            {contact.notes}
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button onClick={onEdit}>Edit Contact</Button>
      </div>
    </div>
  );
};
