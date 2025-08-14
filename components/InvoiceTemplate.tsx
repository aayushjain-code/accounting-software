import React from "react";
import { Invoice, InvoiceItem, Client, Project } from "@/types";
import { format } from "date-fns";

interface InvoiceTemplateProps {
  invoice: Invoice;
  client: Client;
  project: Project;
  items: InvoiceItem[];
  companyInfo?: {
    name: string;
    address: string;
    state: string;
    gstin: string;
    stateCode: string;
    email: string;
    website: string;
  };
  clientInfo?: {
    company: string;
    address: string;
    state: string;
    gstin: string;
    stateCode: string;
    poNumber: string;
  };
  signatureInfo?: {
    department: string;
    company: string;
  };
  itemDetails?: {
    technology: string;
    poNumber: string;
    workingDays: string;
    leave: string;
    hsnCode: string;
    unit: string;
  };
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
  invoice,
  client,
  project,
  items,
  companyInfo,
  clientInfo,
  signatureInfo,
  itemDetails,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * 18) / 100; // 18% IGST
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
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

  // Use provided company info or fallback to defaults
  const companyName = companyInfo?.name || "Brandsmashers Tech";
  const companyAddress =
    companyInfo?.address ||
    "1st Floor, JAP Tower, Raisen RD, Ward 44, Govindpura, Madhya Pradesh 462023";
  const companyState = companyInfo?.state || "Madhya Pradesh - 462023, India";
  const companyGstin = companyInfo?.gstin || "23COBPJ6565E1Z4";
  const companyStateCode = companyInfo?.stateCode || "Madhya Pradesh, Code: 23";
  const companyEmail = companyInfo?.email || "accounting@brandsmashers.com";
  const companyWebsite =
    companyInfo?.website || "https://www.brandsmashers.com/";

  // Use provided client info or fallback to client object
  const clientCompany = clientInfo?.company || client.company;
  const clientAddress = clientInfo?.address || client.address;
  const clientState = clientInfo?.state || client.companyAddress;
  const clientGstin = clientInfo?.gstin || client.gstId;
  const clientStateCode = clientInfo?.stateCode || "Rajasthan, Code: 08";
  const clientPoNumber = clientInfo?.poNumber || invoice.poNumber || "";

  // Use provided item details or fallback to defaults
  const technology = itemDetails?.technology || ".Net + Angular";
  const poNumber = itemDetails?.poNumber || clientPoNumber;
  const workingDays = itemDetails?.workingDays || "23";
  const leave = itemDetails?.leave || "0";
  const hsnCode = itemDetails?.hsnCode || "998314";
  const unit = itemDetails?.unit || "Nos";

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg">
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Tax Invoice</h1>
      </div>

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Left Column - Seller and Buyer Information */}
        <div className="space-y-6">
          {/* Seller/Supplier Details */}
          <div className="border-2 border-gray-800 p-4">
            <h4 className="text-md font-semibold text-gray-800 mb-2">
              {companyName}
            </h4>
            <div className="text-gray-600 text-sm space-y-1">
              <p>{companyAddress}</p>
              <p>{companyState}</p>
              <p>GSTIN/UIN: {companyGstin}</p>
              <p>State Name and Code: {companyStateCode}</p>
              <p>E-Mail: {companyEmail}</p>
              <p>Website: {companyWebsite}</p>
            </div>
          </div>

          {/* Buyer Information */}
          <div className="border-2 border-gray-800 p-4">
            <h4 className="text-md font-semibold text-gray-800 mb-2">
              Buyer (Bill to)
            </h4>
            <div className="text-gray-600 text-sm space-y-1">
              <p className="font-semibold">{clientCompany}</p>
              <p>{clientAddress}</p>
              <p>{clientState}</p>
              <p>GSTIN/UIN: {clientGstin}</p>
              <p>State Name and Code: {clientStateCode}</p>
              {clientPoNumber && (
                <p>Buyer&apos;s Order No.: {clientPoNumber}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Invoice Details */}
        <div className="border-2 border-gray-800 p-4">
          <h4 className="text-md font-semibold text-gray-800 mb-3">
            Invoice Details
          </h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="text-gray-600 font-medium">Invoice No.:</div>
            <div className="text-gray-800 font-semibold">
              {invoice.invoiceNumber}
            </div>

            <div className="text-gray-600 font-medium">Dated:</div>
            <div className="text-gray-800 font-semibold">
              {format(new Date(invoice.issueDate), "dd-MMM-yy")}
            </div>

            <div className="text-gray-600 font-medium">Delivery Note:</div>
            <div className="text-gray-800">{invoice.deliveryNote || ""}</div>

            <div className="text-gray-600 font-medium">
              Mode/Terms of Payment:
            </div>
            <div className="text-gray-800">{invoice.paymentTerms || ""}</div>

            <div className="text-gray-600 font-medium">
              Reference No. & Date:
            </div>
            <div className="text-gray-800">{invoice.referenceNo || ""}</div>

            <div className="text-gray-600 font-medium">Other References:</div>
            <div className="text-gray-800">{invoice.buyerOrderNo || ""}</div>

            <div className="text-gray-600 font-medium">
              Buyer&apos;s Order No.:
            </div>
            <div className="text-gray-800">{clientPoNumber}</div>

            <div className="text-gray-600 font-medium">Dated:</div>
            <div className="text-gray-800">{invoice.buyerOrderDate || ""}</div>

            <div className="text-gray-600 font-medium">Dispatch Doc No.:</div>
            <div className="text-gray-800">{invoice.dispatchDocNo || ""}</div>

            <div className="text-gray-600 font-medium">Delivery Note Date:</div>
            <div className="text-gray-800">
              {invoice.deliveryNoteDate || ""}
            </div>

            <div className="text-gray-600 font-medium">Dispatched through:</div>
            <div className="text-gray-800">
              {invoice.dispatchedThrough || ""}
            </div>

            <div className="text-gray-600 font-medium">Destination:</div>
            <div className="text-gray-800">{invoice.destination || ""}</div>

            <div className="text-gray-600 font-medium">Terms of Delivery:</div>
            <div className="text-gray-800">{invoice.termsOfDelivery || ""}</div>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse border-2 border-gray-800">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-800 px-4 py-3 text-center text-sm font-bold text-gray-800">
                Sl No.
              </th>
              <th className="border border-gray-800 px-4 py-3 text-center text-sm font-bold text-gray-800">
                Description of Services
              </th>
              <th className="border border-gray-800 px-4 py-3 text-center text-sm font-bold text-gray-800">
                HSN/SAC
              </th>
              <th className="border border-gray-800 px-4 py-3 text-center text-sm font-bold text-gray-800">
                Quantity
              </th>
              <th className="border border-gray-800 px-4 py-3 text-center text-sm font-bold text-gray-800">
                Rate
              </th>
              <th className="border border-gray-800 px-4 py-3 text-center text-sm font-bold text-gray-800">
                per
              </th>
              <th className="border border-gray-800 px-4 py-3 text-center text-sm font-bold text-gray-800">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Service Items */}
            {items.map((item, index) => (
              <tr key={item.id} className="border-b border-gray-600">
                <td className="border border-gray-800 px-4 py-3 text-center text-gray-800">
                  {index + 1}
                </td>
                <td className="border border-gray-800 px-4 py-3 text-gray-800">
                  <div className="font-semibold">{item.description}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <div>• {client.name}</div>
                    <div>• {technology}</div>
                    <div>
                      • No. of Working Days ={" "}
                      {(() => {
                        const workingDaysNum =
                          parseInt(workingDays.toString()) || 23;
                        const leaveNum = parseInt(leave.toString()) || 0;
                        const calculated = workingDaysNum - leaveNum;
                        return `${calculated}/${workingDaysNum}`;
                      })()}
                    </div>
                    <div>• Leave = {leave}</div>
                  </div>
                </td>
                <td className="border border-gray-800 px-4 py-3 text-center text-gray-800">
                  {hsnCode}
                </td>
                <td className="border border-gray-800 px-4 py-3 text-center text-gray-800">
                  {item.quantity} {unit}
                </td>
                <td className="border border-gray-800 px-4 py-3 text-center text-gray-800">
                  ₹{formatCurrency(item.unitPrice)}
                </td>
                <td className="border border-gray-800 px-4 py-3 text-center text-gray-800">
                  {unit}
                </td>
                <td className="border border-gray-800 px-4 py-3 text-center font-bold text-gray-800">
                  ₹{formatCurrency(item.total)}
                </td>
              </tr>
            ))}

            {/* Tax Row */}
            <tr className="border-b border-gray-600">
              <td className="border border-gray-800 px-4 py-3"></td>
              <td className="border border-gray-800 px-4 py-3">
                <span className="font-semibold italic">IGST</span>
              </td>
              <td className="border border-gray-800 px-4 py-3"></td>
              <td className="border border-gray-800 px-4 py-3"></td>
              <td className="border border-gray-800 px-4 py-3 text-center text-gray-800">
                18 %
              </td>
              <td className="border border-gray-800 px-4 py-3"></td>
              <td className="border border-gray-800 px-4 py-3 text-center font-bold text-gray-800">
                ₹{formatCurrency(calculateTax())}
              </td>
            </tr>

            {/* Total Row */}
            <tr className="bg-gray-50">
              <td className="border border-gray-800 px-4 py-3"></td>
              <td className="border border-gray-800 px-4 py-3 font-bold text-gray-800">
                Total
              </td>
              <td className="border border-gray-800 px-4 py-3"></td>
              <td className="border border-gray-800 px-4 py-3 text-center font-bold text-gray-800">
                {items.reduce((sum, item) => sum + item.quantity, 0)} {unit}
              </td>
              <td className="border border-gray-800 px-4 py-3"></td>
              <td className="border border-gray-800 px-4 py-3"></td>
              <td className="border border-gray-800 px-4 py-3 text-center font-bold text-gray-800">
                ₹ {formatCurrency(calculateTotal())}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="text-right mt-2 text-sm text-gray-600">E. & O.E</div>
      </div>

      {/* Footer Section */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Left Side - Amount in Words */}
        <div>
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">
                Amount Chargeable (in words):
              </span>
            </p>
            <p className="font-semibold text-gray-800">
              INR {getAmountInWords(calculateTotal())} Only
            </p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">Tax Amount (in words):</span>
            </p>
            <p className="font-semibold text-gray-800">
              INR {getAmountInWords(calculateTax())} Only
            </p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Declaration:</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              We declare that this invoice shows the actual price of the goods
              described and that all particulars are true and correct.
            </p>
          </div>

          <div className="border-2 border-gray-300 h-24 flex items-center justify-center">
            <p className="text-gray-500 text-sm">
              Customer&apos;s Seal and Signature
            </p>
          </div>
        </div>

        {/* Right Side - Tax Summary and Signature */}
        <div>
          {/* Tax Summary Table */}
          <div className="mb-6">
            <table className="w-full border-collapse border border-gray-800">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-800 px-2 py-2 text-center text-xs font-bold text-gray-800">
                    HSN/SAC
                  </th>
                  <th className="border border-gray-800 px-2 py-2 text-center text-xs font-bold text-gray-800">
                    Taxable Value
                  </th>
                  <th className="border border-gray-800 px-2 py-2 text-center text-xs font-bold text-gray-800">
                    Rate
                  </th>
                  <th className="border border-gray-800 px-2 py-2 text-center text-xs font-bold text-gray-800">
                    IGST Amount
                  </th>
                  <th className="border border-gray-800 px-2 py-2 text-center text-xs font-bold text-gray-800">
                    Total Tax Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-800 px-2 py-2 text-center text-xs text-gray-800">
                    {hsnCode}
                  </td>
                  <td className="border border-gray-800 px-2 py-2 text-center text-xs text-gray-800">
                    {formatCurrency(calculateSubtotal())}
                  </td>
                  <td className="border border-gray-800 px-2 py-2 text-center text-xs text-gray-800">
                    18%
                  </td>
                  <td className="border border-gray-800 px-2 py-2 text-center text-xs text-gray-800">
                    {formatCurrency(calculateTax())}
                  </td>
                  <td className="border border-gray-800 px-2 py-2 text-center text-xs text-gray-800">
                    {formatCurrency(calculateTax())}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-800 px-2 py-2 text-center text-xs font-bold text-gray-800">
                    Total
                  </td>
                  <td className="border border-gray-800 px-2 py-2 text-center text-xs font-bold text-gray-800">
                    {formatCurrency(calculateSubtotal())}
                  </td>
                  <td className="border border-gray-800 px-2 py-2 text-center text-xs font-bold text-gray-800"></td>
                  <td className="border border-gray-800 px-2 py-2 text-center text-xs font-bold text-gray-800">
                    {formatCurrency(calculateTax())}
                  </td>
                  <td className="border border-gray-800 px-2 py-2 text-center text-xs font-bold text-gray-800">
                    {formatCurrency(calculateTax())}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Authorised Signatory */}
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 border-2 border-gray-800 rounded-full flex items-center justify-center bg-gray-100">
              <div className="text-center text-xs">
                <p className="font-bold">
                  {signatureInfo?.department?.split(" ")[0] || "ACCOUNT"}
                </p>
                <p className="font-bold">
                  {signatureInfo?.department?.split(" ")[1] || "DEPARTMENT"}
                </p>
                <p className="font-bold">
                  {signatureInfo?.company?.split(" ")[0] || "BRANDSMASHERS"}
                </p>
                <p className="font-bold">
                  {signatureInfo?.company?.split(" ")[1] || "TECH"}
                </p>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-800">
              Authorised Signatory
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="text-center text-gray-500 text-sm border-t border-gray-300 pt-4">
        <p>This is a Computer Generated Invoice</p>
      </div>
    </div>
  );
};
