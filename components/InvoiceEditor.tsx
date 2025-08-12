"use client";

import React, { useState, useEffect } from "react";
import { Invoice, InvoiceItem, Client, Project } from "@/types";
import { InvoiceTemplate } from "./InvoiceTemplate";

interface InvoiceEditorProps {
  invoice?: Invoice;
  client?: Client;
  project?: Project;
  onSave?: (invoice: Invoice, items: InvoiceItem[]) => void;
  onCancel?: () => void;
}

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({
  invoice,
  client,
  project,
  onSave,
  onCancel,
}) => {
  const [isEditing, setIsEditing] = useState(true);
  const [formData, setFormData] = useState({
    invoiceNumber: invoice?.invoiceNumber || "BST/25-26/A0053",
    issueDate: invoice?.issueDate
      ? new Date(invoice.issueDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    dueDate: invoice?.dueDate
      ? new Date(invoice.dueDate).toISOString().split("T")[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
    deliveryNote: "",
    paymentTerms: "",
    referenceNo: "",
    buyerOrderNo: "",
    dispatchDocNo: "",
    deliveryNoteDate: "",
    dispatchedThrough: "",
    destination: "",
    termsOfDelivery: "",
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      invoiceId: invoice?.id || "temp",
      description: "IT Design and Development",
      quantity: 1,
      unitPrice: 100000,
      total: 100000,
    },
  ]);

  const [itemDetails, setItemDetails] = useState({
    technology: ".Net + Angular",
    poNumber: "PO/GSPL/202526/000496",
    workingDays: "23/23",
    leave: "00",
    hsnCode: "998314",
    unit: "Nos",
  });

  const [companyInfo, setCompanyInfo] = useState({
    name: "Brandsmashers Tech",
    address: "1st Floor, JAP Tower, Raisen RD, Ward 44, Govindpura",
    state: "Madhya Pradesh - 462023, India",
    gstin: "23COBPJ6565E1Z4",
    stateCode: "Madhya Pradesh, Code: 23",
    email: "accounting@brandsmashers.com",
    website: "https://www.brandsmashers.com/",
  });

  const [clientInfo, setClientInfo] = useState({
    company: client?.company || "Girnar Software Prvt. Ltd.",
    address:
      client?.address ||
      "21, Girnar, Govind Marg, Moti Dongri Road, Jaipur Rajsthan",
    state: client?.companyAddress || "Rajasthan - 300004, India",
    gstin: client?.gstId || "08AACCG7277J1Z6",
    stateCode: "Rajasthan, Code: 08",
    poNumber: "PO/GSPL/202526/000496",
  });

  const [signatureInfo, setSignatureInfo] = useState({
    department: "ACCOUNT DEPARTMENT",
    company: "BRANDSMASHERS TECH",
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | "">("");

  useEffect(() => {
    // Fetch clients from the backend
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Client[] = await response.json();
        setClients(data);
        
        // If there's a client prop, set it as selected and populate clientInfo
        if (client) {
          setSelectedClientId(client.id);
          setClientInfo({
            company: client.company,
            address: client.address,
            state: client.companyAddress,
            gstin: client.gstId,
            stateCode: "Rajasthan, Code: 08", // Default value
            poNumber: client.poNumber || "PO/GSPL/202526/000496", // Default PO Number
          });
        }
      } catch (error) {
        console.error("Failed to fetch clients:", error);
        // Fallback: use the client prop if available
        if (client) {
          setSelectedClientId(client.id);
          setClientInfo({
            company: client.company,
            address: client.address,
            state: client.companyAddress,
            gstin: client.gstId,
            stateCode: "Rajasthan, Code: 08",
            poNumber: "PO/GSPL/202526/000496",
          });
        }
      }
    };

    fetchClients();
  }, [client]);

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: any
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate total
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].total =
        newItems[index].quantity * newItems[index].unitPrice;
    }

    setItems(newItems);
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      invoiceId: invoice?.id || "temp",
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * 18) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSave = () => {
    if (onSave) {
      const updatedInvoice: Invoice = {
        ...invoice!,
        invoiceNumber: formData.invoiceNumber,
        issueDate: new Date(formData.issueDate),
        dueDate: new Date(formData.dueDate),
        subtotal: calculateSubtotal(),
        taxAmount: calculateTax(),
        total: calculateTotal(),
        updatedAt: new Date(),
      };
      onSave(updatedInvoice, items);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // Create a mock invoice for preview
  const previewInvoice: Invoice = {
    id: invoice?.id || "preview",
    timesheetId: invoice?.timesheetId || "preview",
    clientId: invoice?.clientId || "preview",
    projectId: invoice?.projectId || "preview",
    invoiceNumber: formData.invoiceNumber,
    issueDate: new Date(formData.issueDate),
    dueDate: new Date(formData.dueDate),
    status: "draft",
    subtotal: calculateSubtotal(),
    taxRate: 18,
    taxAmount: calculateTax(),
    total: calculateTotal(),
    poNumber: clientInfo.poNumber,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const previewClient: Client = {
    ...client!,
    company: clientInfo.company,
    companyAddress: clientInfo.address,
    gstId: clientInfo.gstin,
  };

  const previewProject: Project = {
    ...project!,
    name: items[0]?.description || "IT Design and Development",
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          .editor-interface {
            display: none !important;
          }
          .invoice-content {
            margin: 0 !important;
            padding: 20px !important;
            width: 100% !important;
            max-width: none !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
      <div className="bg-white p-8 max-w-7xl mx-auto">
        {/* Editor Interface - Hidden when printing */}
        <div className="editor-interface">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Invoice Preview
            </h2>
            <div className="space-x-3">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Edit Invoice
              </button>
              <button
                onClick={() => {
                  // Hide all editor elements for printing
                  const editorElements =
                    document.querySelectorAll(".editor-interface");
                  editorElements.forEach((element) => {
                    (element as HTMLElement).style.display = "none";
                  });

                  // Print the page
                  window.print();

                  // Restore editor elements after printing
                  setTimeout(() => {
                    editorElements.forEach((element) => {
                      (element as HTMLElement).style.display = "";
                    });
                  }, 100);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Print
              </button>
            </div>
          </div>

          {/* Edit Mode */}
          {isEditing && (
            <div className="space-y-6">
              {/* Invoice Details */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Invoice Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      value={formData.invoiceNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          invoiceNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          issueDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Terms
                    </label>
                    <input
                      type="text"
                      value={formData.paymentTerms}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentTerms: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Net 30"
                    />
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Company Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyInfo.name}
                      onChange={(e) =>
                        setCompanyInfo({
                          ...companyInfo,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={companyInfo.address}
                      onChange={(e) =>
                        setCompanyInfo({
                          ...companyInfo,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GSTIN
                      </label>
                      <input
                        type="text"
                        value={companyInfo.gstin}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            gstin: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={companyInfo.email}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      value={companyInfo.website}
                      onChange={(e) =>
                        setCompanyInfo({
                          ...companyInfo,
                          website: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Client Information
                </h3>
                
                {/* Client Selection Dropdown */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Client
                  </label>
                  <select
                    value={selectedClientId || ""}
                    onChange={(e) => {
                      const selectedClient = clients.find(c => c.id === e.target.value);
                      if (selectedClient) {
                        setSelectedClientId(selectedClient.id);
                        setClientInfo({
                          company: selectedClient.company,
                          address: selectedClient.address,
                          state: selectedClient.companyAddress,
                          gstin: selectedClient.gstId,
                          stateCode: "Rajasthan, Code: 08",
                          poNumber: selectedClient.poNumber || "PO/GSPL/202526/000496", // Use client's PO Number or default
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a client...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.company} - {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Company Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={clientInfo.company || ""}
                    onChange={(e) =>
                      setClientInfo({
                        ...clientInfo,
                        company: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter company name"
                  />
                </div>

                {/* Address */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={clientInfo.address || ""}
                    onChange={(e) =>
                      setClientInfo({
                        ...clientInfo,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter address"
                  />
                </div>

                {/* State */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={clientInfo.state || ""}
                    onChange={(e) =>
                      setClientInfo({
                        ...clientInfo,
                        state: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter state"
                  />
                </div>

                {/* GSTIN */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={clientInfo.gstin || ""}
                    onChange={(e) =>
                      setClientInfo({
                        ...clientInfo,
                        gstin: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter GSTIN"
                  />
                </div>

                {/* PO Number */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PO Number
                  </label>
                  <input
                    type="text"
                    value={clientInfo.poNumber || ""}
                    onChange={(e) =>
                      setClientInfo({
                        ...clientInfo,
                        poNumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter PO Number"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Line Items
                  </h3>
                  <button
                    onClick={addItem}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 p-4 rounded-lg bg-white"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-800">
                          Item {index + 1}
                        </h4>
                        {items.length > 1 && (
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            HSN/SAC Code
                          </label>
                          <input
                            type="text"
                            value={itemDetails.hsnCode}
                            onChange={(e) =>
                              setItemDetails({
                                ...itemDetails,
                                hsnCode: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rate
                          </label>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "unitPrice",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total
                          </label>
                          <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-800 font-medium">
                            ₹{item.total.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Item Details */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Item Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technology
                    </label>
                    <input
                      type="text"
                      value={itemDetails.technology}
                      onChange={(e) =>
                        setItemDetails({
                          ...itemDetails,
                          technology: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Working Days
                    </label>
                    <input
                      type="text"
                      value={itemDetails.workingDays}
                      onChange={(e) =>
                        setItemDetails({
                          ...itemDetails,
                          workingDays: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Leave
                    </label>
                    <input
                      type="text"
                      value={itemDetails.leave}
                      onChange={(e) =>
                        setItemDetails({
                          ...itemDetails,
                          leave: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calculated Working Days
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700">
                      {(() => {
                        const workingDays =
                          parseFloat(itemDetails.workingDays) || 0;
                        const leave = parseFloat(itemDetails.leave) || 0;
                        if (workingDays === 0) return "Enter Working Days";
                        const calculated = workingDays - leave;
                        return `${calculated} / ${workingDays}`;
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Signature Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={signatureInfo.department}
                      onChange={(e) =>
                        setSignatureInfo({
                          ...signatureInfo,
                          department: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={signatureInfo.company}
                      onChange={(e) =>
                        setSignatureInfo({
                          ...signatureInfo,
                          company: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  Invoice Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      ₹{calculateSubtotal().toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IGST (18%):</span>
                    <span className="font-medium">
                      ₹{calculateTax().toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-2">
                    <span className="text-blue-800 font-semibold">Total:</span>
                    <span className="text-blue-800 font-bold text-lg">
                      ₹{calculateTotal().toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview Mode */}
          {!isEditing && (
            <div className="text-center">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Preview
              </button>
            </div>
          )}
        </div>

        {/* Invoice Template - Always visible, will be printed */}
        <div className="mt-8 invoice-content">
          <InvoiceTemplate
            invoice={previewInvoice}
            client={previewClient}
            project={previewProject}
            items={items}
            companyInfo={companyInfo}
            clientInfo={clientInfo}
            signatureInfo={signatureInfo}
            itemDetails={itemDetails}
          />
        </div>
      </div>
    </>
  );
};
