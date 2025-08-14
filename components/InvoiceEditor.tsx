"use client";

import React, { useState, useEffect, useRef } from "react";
import { Invoice, InvoiceItem, Client, Project } from "@/types";
import { InvoiceTemplate } from "./InvoiceTemplate";

// Import jsPDF and html2canvas for PDF generation
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
    paymentTerms: "Net 30",
    referenceNo: "",
    buyerOrderNo: "",
    buyerOrderDate: "",
    dispatchDocNo: "",
    deliveryNoteDate: "",
    dispatchedThrough: "Email",
    destination: "Client Location",
    termsOfDelivery: "FOB Destination",
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
    workingDays: "23",
    leave: "0",
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
    poNumber: client?.poNumber || "PO/GSPL/202526/000496",
  });

  const [signatureInfo, setSignatureInfo] = useState({
    department: "ACCOUNT DEPARTMENT",
    company: "BRANDSMASHERS TECH",
  });

  // Mock clients data since API doesn't exist
  const [clients] = useState<Client[]>([
    {
      id: "clt-001",
      clientCode: "CLT-2025-0001",
      name: "John Smith",
      email: "john.smith@techcorp.com",
      phone: "+91-98765-43210",
      company: "TechCorp Solutions",
      address: "123 Tech Street, Bangalore, Karnataka",
      gstId: "29AABCT1234Z1Z5",
      companyAddress:
        "456 Innovation Drive, Electronic City, Bangalore, Karnataka 560100",
      companyWebsite: "https://techcorp-solutions.com",
      companyLinkedin: "https://linkedin.com/company/techcorp-solutions",
      companyOwner: "Sarah Johnson",
      pocName: "John Smith",
      pocEmail: "john.smith@techcorp.com",
      pocContact: "+91-98765-43210",
      companyLogo:
        "https://via.placeholder.com/150x50/3B82F6/FFFFFF?text=TechCorp",
      poNumber: "PO/TCS/2025/001",
      industry: "Technology",
      companySize: "medium",
      status: "active",
      source: "Referral",
      notes: "High-value client with ongoing projects",
      createdAt: new Date("2025-01-15"),
      updatedAt: new Date("2025-01-15"),
    },
    {
      id: "clt-002",
      clientCode: "CLT-2025-0002",
      name: "Priya Patel",
      email: "priya.patel@innovateindia.com",
      phone: "+91-87654-32109",
      company: "Innovate India Ltd",
      address: "789 Startup Lane, Mumbai, Maharashtra",
      gstId: "27AABCI5678Z2Z6",
      companyAddress:
        "321 Business Park, Andheri West, Mumbai, Maharashtra 400058",
      companyWebsite: "https://innovate-india.com",
      companyLinkedin: "https://linkedin.com/company/innovate-india",
      companyOwner: "Rajesh Kumar",
      pocName: "Priya Patel",
      pocEmail: "priya.patel@innovateindia.com",
      pocContact: "+91-87654-32109",
      companyLogo:
        "https://via.placeholder.com/150x50/10B981/FFFFFF?text=Innovate",
      poNumber: "PO/IIL/2025/002",
      industry: "E-commerce",
      companySize: "startup",
      status: "active",
      source: "Website",
      notes: "New client, potential for long-term partnership",
      createdAt: new Date("2025-01-20"),
      updatedAt: new Date("2025-01-20"),
    },
    {
      id: "clt-003",
      clientCode: "CLT-2025-0003",
      name: "Amit Kumar",
      email: "amit.kumar@girnarsoftware.com",
      phone: "+91-76543-21098",
      company: "Girnar Software Prvt. Ltd.",
      address: "21, Girnar, Govind Marg, Moti Dongri Road, Jaipur Rajsthan",
      gstId: "08AACCG7277J1Z6",
      companyAddress: "Rajasthan - 300004, India",
      companyWebsite: "https://girnarsoftware.com",
      companyLinkedin: "https://linkedin.com/company/girnar-software",
      companyOwner: "Amit Kumar",
      pocName: "Amit Kumar",
      pocEmail: "amit.kumar@girnarsoftware.com",
      pocContact: "+91-76543-21098",
      companyLogo:
        "https://via.placeholder.com/150x50/EF4444/FFFFFF?text=Girnar",
      poNumber: "PO/GSPL/202526/000496",
      industry: "Software Development",
      companySize: "medium",
      status: "active",
      source: "Direct",
      notes: "Long-term client with multiple projects",
      createdAt: new Date("2025-01-25"),
      updatedAt: new Date("2025-01-25"),
    },
  ]);

  const [selectedClientId, setSelectedClientId] = useState<string | "">("");
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  // Ref for printing
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Custom print handler that only prints the invoice
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Get the invoice content
    const invoiceContent = invoiceRef.current?.innerHTML;
    if (!invoiceContent) return;

    // Create the print document with better styling
    const printDocument = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${formData.invoiceNumber}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
            }
            body { font-family: Arial, sans-serif; }
            .invoice-content { margin: 0; padding: 20px; }
            @page { margin: 0.5in; }
            table { border-collapse: collapse; }
            th, td { border: 2px solid #1f2937; padding: 8px; }
            .bg-gray-100 { background-color: #f3f4f6 !important; }
            .bg-gray-50 { background-color: #f9fafb !important; }
            .text-gray-800 { color: #1f2937 !important; }
            .text-gray-600 { color: #4b5563 !important; }
            .font-bold { font-weight: bold !important; }
            .font-semibold { font-weight: 600 !important; }
          </style>
        </head>
        <body>
          ${invoiceContent}
        </body>
      </html>
    `;

    // Write content to the new window
    printWindow.document.write(printDocument);
    printWindow.document.close();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // PDF download handler
  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    setIsGeneratingPDF(true);

    try {
      // Convert HTML to canvas
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      // Get canvas dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      let position = 0;

      // Add first page
      pdf.addImage(canvas, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save PDF
      pdf.save(`Invoice-${formData.invoiceNumber}.pdf`);
      setSaveMessage("PDF downloaded successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setSaveMessage("Error generating PDF. Please try again.");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  useEffect(() => {
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

  const calculateWorkingDays = (workingDays: string, leave: string) => {
    const workingDaysNum = parseInt(workingDays) || 0;
    const leaveNum = parseInt(leave) || 0;
    if (workingDaysNum === 0) return "Enter Working Days";
    const calculated = workingDaysNum - leaveNum;
    return `${calculated} / ${workingDaysNum}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const generateInvoiceNumber = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const monthStr = currentMonth.toString().padStart(2, "0");
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `BST/${currentYear}-${monthStr}/A${randomNum}`;
  };

  const getAmountInWords = (amount: number): string => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    if (amount === 0) return "Zero";
    if (amount < 10) return ones[amount];
    if (amount < 20) return teens[amount - 10];
    if (amount < 100) {
      if (amount % 10 === 0) return tens[Math.floor(amount / 10)];
      return tens[Math.floor(amount / 10)] + " " + ones[amount % 10];
    }
    if (amount < 1000) {
      if (amount % 100 === 0)
        return ones[Math.floor(amount / 100)] + " Hundred";
      return (
        ones[Math.floor(amount / 100)] +
        " Hundred " +
        getAmountInWords(amount % 100)
      );
    }
    if (amount < 100000) {
      if (amount % 1000 === 0)
        return getAmountInWords(Math.floor(amount / 1000)) + " Thousand";
      return (
        getAmountInWords(Math.floor(amount / 1000)) +
        " Thousand " +
        getAmountInWords(amount % 1000)
      );
    }
    if (amount < 10000000) {
      if (amount % 100000 === 0)
        return getAmountInWords(Math.floor(amount / 100000)) + " Lakh";
      return (
        getAmountInWords(Math.floor(amount / 100000)) +
        " Lakh " +
        getAmountInWords(amount % 100000)
      );
    }
    return "Amount too large";
  };

  // Validate working days and leave
  useEffect(() => {
    const workingDaysNum = parseInt(itemDetails.workingDays) || 0;
    const leaveNum = parseInt(itemDetails.leave) || 0;

    if (workingDaysNum > 0 && leaveNum > workingDaysNum) {
      setValidationMessage("Leave days cannot exceed working days!");
    } else if (workingDaysNum === 0) {
      setValidationMessage("Please enter working days");
    } else {
      setValidationMessage("");
    }
  }, [itemDetails.workingDays, itemDetails.leave]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      if (onSave) {
        const updatedInvoice: Invoice = {
          ...invoice!,
          invoiceNumber: formData.invoiceNumber,
          issueDate: new Date(formData.issueDate),
          dueDate: new Date(formData.dueDate),
          subtotal: calculateSubtotal(),
          taxAmount: calculateTax(),
          total: calculateTotal(),
          poNumber: clientInfo.poNumber,
          deliveryNote: formData.deliveryNote,
          paymentTerms: formData.paymentTerms,
          referenceNo: formData.referenceNo,
          buyerOrderNo: formData.buyerOrderNo,
          buyerOrderDate: formData.buyerOrderDate,
          dispatchDocNo: formData.dispatchDocNo,
          deliveryNoteDate: formData.deliveryNoteDate,
          dispatchedThrough: formData.dispatchedThrough,
          destination: formData.destination,
          termsOfDelivery: formData.termsOfDelivery,
          updatedAt: new Date(),
        };
        await onSave(updatedInvoice, items);
      }

      // Show success message
      setSaveMessage("Invoice saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setSaveMessage("Error saving invoice. Please try again.");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setIsSaving(false);
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
    deliveryNote: formData.deliveryNote,
    paymentTerms: formData.paymentTerms,
    referenceNo: formData.referenceNo,
    buyerOrderNo: formData.buyerOrderNo,
    buyerOrderDate: formData.buyerOrderDate,
    dispatchDocNo: formData.dispatchDocNo,
    deliveryNoteDate: formData.deliveryNoteDate,
    dispatchedThrough: formData.dispatchedThrough,
    destination: formData.destination,
    termsOfDelivery: formData.termsOfDelivery,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Create a mock client for preview if none exists
  const previewClient: Client = client || {
    id: "preview",
    clientCode: "CLT-2025-0000",
    name: "Preview Client",
    email: "preview@example.com",
    phone: "+91-00000-00000",
    company: clientInfo.company,
    address: clientInfo.address,
    gstId: clientInfo.gstin,
    companyAddress: clientInfo.state,
    companyWebsite: "https://example.com",
    companyLinkedin: "https://linkedin.com/company/example",
    companyOwner: "Owner Name",
    pocName: "POC Name",
    pocEmail: "poc@example.com",
    pocContact: "+91-00000-00000",
    companyLogo: "",
    poNumber: clientInfo.poNumber,
    industry: "Technology",
    companySize: "medium",
    status: "active",
    source: "Direct",
    notes: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Create a mock project for preview if none exists
  const previewProject: Project = project || {
    id: "preview",
    projectCode: "BST-01",
    name: items[0]?.description || "IT Design and Development",
    clientId: "preview",
    description: "Project description",
    startDate: new Date(),
    status: "active",
    budget: 1000000,
    billingTerms: 30,
    billingRate: 1000,
    gstRate: 18,
    gstInclusive: false,
    totalCost: 1000000,
    costBreakdown: {
      subtotal: 847457,
      gstAmount: 152543,
      total: 1000000,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
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

          /* Better print formatting */
          .invoice-content {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .invoice-content * {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* Ensure tables print properly */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th,
          td {
            border: 2px solid #1f2937 !important;
            padding: 8px !important;
          }
          .bg-gray-100 {
            background-color: #f3f4f6 !important;
          }
          .bg-gray-50 {
            background-color: #f9fafb !important;
          }
        }
      `}</style>
      <div className="bg-white p-8 max-w-7xl mx-auto">
        {/* Editor Interface - Hidden when printing */}
        <div className="editor-interface">
          {/* Success Message */}
          {saveMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
              {saveMessage}
            </div>
          )}

          {/* Invoice Summary Card */}
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Subtotal</p>
                <p className="text-lg font-bold text-blue-800">
                  ₹{formatCurrency(calculateSubtotal())}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">IGST (18%)</p>
                <p className="text-lg font-bold text-blue-800">
                  ₹{formatCurrency(calculateTax())}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-lg font-bold text-blue-800">
                  ₹{formatCurrency(calculateTotal())}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Items</p>
                <p className="text-lg font-bold text-blue-800">
                  {items.length}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {isEditing ? "Edit Invoice" : "Invoice Preview"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Invoice: {formData.invoiceNumber}
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={toggleEditMode}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                {isEditing ? "View Preview" : "Edit Invoice"}
              </button>

              {isEditing && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save Invoice"}
                </button>
              )}

              <button
                onClick={handlePrint}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Print
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Quick Print
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPDF ? "Generating..." : "Download PDF"}
              </button>
            </div>
          </div>

          {/* Edit Mode */}
          {isEditing && (
            <div className="space-y-6">
              {/* Invoice Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-base font-semibold text-gray-800 mb-3">
                  Invoice Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Number
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.invoiceNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            invoiceNumber: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            invoiceNumber: generateInvoiceNumber(),
                          })
                        }
                        className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                      >
                        Generate
                      </button>
                    </div>
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
                      Invoice Status
                    </label>
                    <select
                      value={invoice?.status || "draft"}
                      onChange={(e) => {
                        if (invoice) {
                          // Update the invoice status
                          const updatedInvoice = {
                            ...invoice,
                            status: e.target.value as "draft" | "sent" | "paid",
                          };
                          // This would typically call an API to update the status
                          console.log("Status updated to:", e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                    </select>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Note
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryNote}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliveryNote: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., DN-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dispatched Through
                    </label>
                    <input
                      type="text"
                      value={formData.dispatchedThrough}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dispatchedThrough: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination
                    </label>
                    <input
                      type="text"
                      value={formData.destination}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          destination: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Client Location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Terms of Delivery
                    </label>
                    <input
                      type="text"
                      value={formData.termsOfDelivery}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          termsOfDelivery: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., FOB Destination"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buyer Order Date
                    </label>
                    <input
                      type="date"
                      value={formData.buyerOrderDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buyerOrderDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      const selectedClient = clients.find(
                        (c) => c.id === e.target.value
                      );
                      if (selectedClient) {
                        setSelectedClientId(selectedClient.id);
                        setClientInfo({
                          company: selectedClient.company,
                          address: selectedClient.address,
                          state: selectedClient.companyAddress,
                          gstin: selectedClient.gstId,
                          stateCode: "Rajasthan, Code: 08",
                          poNumber:
                            selectedClient.poNumber || "PO/GSPL/202526/000496", // Use client's PO Number or default
                        });

                        // Also update the item details PO number
                        setItemDetails((prev) => ({
                          ...prev,
                          poNumber:
                            selectedClient.poNumber || "PO/GSPL/202526/000496",
                        }));
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
                            ₹{formatCurrency(item.total)}
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

                {/* Validation Message */}
                {validationMessage && (
                  <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md">
                    {validationMessage}
                  </div>
                )}
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
                      type="number"
                      min="0"
                      max="31"
                      value={itemDetails.workingDays}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (
                          value === "" ||
                          (parseInt(value) >= 0 && parseInt(value) <= 31)
                        ) {
                          setItemDetails({
                            ...itemDetails,
                            workingDays: value,
                          });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="23"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Leave
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="31"
                      value={itemDetails.leave}
                      onChange={(e) => {
                        const value = e.target.value;
                        const workingDaysNum =
                          parseInt(itemDetails.workingDays) || 0;
                        if (
                          value === "" ||
                          (parseInt(value) >= 0 &&
                            parseInt(value) <= workingDaysNum)
                        ) {
                          setItemDetails({
                            ...itemDetails,
                            leave: value,
                          });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calculated Working Days
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700">
                      {calculateWorkingDays(
                        itemDetails.workingDays,
                        itemDetails.leave
                      )}
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
                      ₹{formatCurrency(calculateSubtotal())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IGST (18%):</span>
                    <span className="font-medium">
                      ₹{formatCurrency(calculateTax())}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-2">
                    <span className="text-blue-800 font-semibold">Total:</span>
                    <span className="text-blue-800 font-bold text-lg">
                      ₹{formatCurrency(calculateTotal())}
                    </span>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700">
                      <span className="font-semibold">Amount in words:</span>{" "}
                      INR {getAmountInWords(calculateTotal())} Only
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Invoice Template - Always visible, will be printed */}
        <div ref={invoiceRef} className="mt-8 invoice-content">
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
