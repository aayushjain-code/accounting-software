"use client";

import React from "react";
import { InvoiceTemplate } from "@/components/InvoiceTemplate";
import { Invoice, InvoiceItem, Client, Project } from "@/types";

export default function InvoiceDemoPage() {
  // Sample data to demonstrate the invoice template
  const sampleClient: Client = {
    id: "client1",
    clientCode: "CLT-2024-0001",
    name: "Shaifali Jain",
    email: "shaifali.jain@techcorp.com",
    phone: "+91-98765-43210",
    company: "TechCorp Solutions Pvt Ltd",
    address: "123 Tech Park, Bangalore, Karnataka 560001",
    gstId: "GST123456789",
    companyAddress: "123 Tech Park, Whitefield, Bangalore, Karnataka 560066",
    companyWebsite: "https://techcorp.com",
    companyLinkedin: "https://linkedin.com/company/techcorp-solutions",
    companyOwner: "Rajesh Kumar",
    pocName: "Priya Sharma",
    pocEmail: "priya.sharma@techcorp.com",
    pocContact: "+91-98765-43211",
    companyLogo: "https://techcorp.com/logo.png",
    industry: "Technology",
    companySize: "medium",
    status: "active",
    source: "Referral",
    notes: "High-value client with multiple ongoing projects",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sampleProject: Project = {
    id: "project1",
    projectCode: "BST-01",
    name: "IT Design and Development",
    clientId: "client1",
    description: ".Net + Angular Development Project",
    startDate: new Date("2024-01-01"),
    status: "active",
    budget: 100000,
    billingTerms: 30,
    billingRate: 100000,
    estimatedHours: 184,
    gstRate: 18,
    gstInclusive: false,
    totalCost: 118000,
    costBreakdown: {
      subtotal: 100000,
      gstAmount: 18000,
      total: 118000,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sampleInvoice: Invoice = {
    id: "invoice1",
    timesheetId: "timesheet1",
    clientId: "client1",
    projectId: "project1",
    invoiceNumber: "INV-2024-001",
    issueDate: new Date("2024-01-15"),
    dueDate: new Date("2024-02-14"),
    status: "draft",
    subtotal: 100000,
    taxRate: 18,
    taxAmount: 18000,
    total: 118000,
    notes: "IT Design and Development Services",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sampleItems: InvoiceItem[] = [
    {
      id: "item1",
      invoiceId: "invoice1",
      description: "IT Design and Development",
      quantity: 1,
      unitPrice: 100000,
      total: 100000,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Invoice Template Demo
          </h1>
          <p className="text-gray-600">
            This demonstrates the exact invoice format you requested
          </p>
        </div>

        {/* Invoice Template */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <InvoiceTemplate
            invoice={sampleInvoice}
            client={sampleClient}

            items={sampleItems}
          />
        </div>

        {/* Print Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.print()}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
