"use client";

import { useState } from "react";
import { useAccountingStore } from "@/store";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient } =
    useAccountingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingClient) {
      updateClient(editingClient.id, formData);
      toast.success("Client updated successfully");
    } else {
      addClient(formData);
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
    });
  };

  const handleEdit = (client: any) => {
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
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      deleteClient(id);
      toast.success("Client deleted successfully");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Manage your client relationships</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Client
        </button>
      </div>

      {/* Clients Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Phone</th>
                <th>GST ID</th>
                <th>POC</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <div>
                      <div className="font-medium text-gray-900">
                        {client.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {client.companyOwner}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="font-medium text-gray-900">
                        {client.company}
                      </div>
                      <div className="text-sm text-gray-500">
                        {client.companyAddress}
                      </div>
                    </div>
                  </td>
                  <td>{client.email}</td>
                  <td>{client.phone}</td>
                  <td>{client.gstId}</td>
                  <td>
                    <div>
                      <div className="font-medium text-gray-900">
                        {client.pocName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {client.pocEmail}
                      </div>
                    </div>
                  </td>
                  <td>{format(new Date(client.createdAt), "MMM dd, yyyy")}</td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(client)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-danger-600 hover:text-danger-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clients.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No clients found. Add your first client to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                {editingClient ? "Edit Client" : "Add New Client"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="input"
                    />
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
                      GST ID
                    </label>
                    <input
                      type="text"
                      value={formData.gstId}
                      onChange={(e) =>
                        setFormData({ ...formData, gstId: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Address
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
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Website
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
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company LinkedIn
                    </label>
                    <input
                      type="url"
                      value={formData.companyLinkedin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyLinkedin: e.target.value,
                        })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Owner
                    </label>
                    <input
                      type="text"
                      value={formData.companyOwner}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyOwner: e.target.value,
                        })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      POC Name
                    </label>
                    <input
                      type="text"
                      value={formData.pocName}
                      onChange={(e) =>
                        setFormData({ ...formData, pocName: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      POC Email
                    </label>
                    <input
                      type="email"
                      value={formData.pocEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, pocEmail: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      POC Contact
                    </label>
                    <input
                      type="tel"
                      value={formData.pocContact}
                      onChange={(e) =>
                        setFormData({ ...formData, pocContact: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Logo
                    </label>
                    <input
                      type="url"
                      value={formData.companyLogo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyLogo: e.target.value,
                        })
                      }
                      className="input"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
                      });
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingClient ? "Update" : "Add"} Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
