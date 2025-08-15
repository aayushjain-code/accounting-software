import React from "react";
import { Invoice, InvoiceItem, Client } from "@/types";
import { format } from "date-fns";

interface InvoiceTemplateProps {
  invoice: Invoice;
  client: Client;
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
  
          hsnCode: string;
      unit: string;
  };
  formData?: {
    buyerOrderNo: string;
    buyerOrderDate: string;
    purchaseOrderNo: string;
    purchaseOrderDate: string;
  };
  taxType?: "igst" | "sgst-cgst" | "no-gst";
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = (props) => {
  const {
    invoice,
    client,
    items,
    companyInfo,
    clientInfo,
    itemDetails,
    formData,
    taxType = "igst",
  } = props;

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
    if (taxType === "no-gst") {
      return 0; // No tax for non-GST invoices
    } else if (taxType === "sgst-cgst") {
      // SGST (9%) + CGST (9%) = 18%
      return (subtotal * 18) / 100;
    } else {
      // IGST (18%)
      return (subtotal * 18) / 100;
    }
  };

  const calculateSGST = () => {
    const subtotal = calculateSubtotal();
    if (taxType === "sgst-cgst") {
      return (subtotal * 9) / 100; // 9% SGST
    }
    return 0; // No SGST for IGST or no-GST
  };

  const calculateCGST = () => {
    const subtotal = calculateSubtotal();
    if (taxType === "sgst-cgst") {
      return (subtotal * 9) / 100; // 9% CGST
    }
    return 0; // No CGST for IGST or no-GST
  };

  const calculateIGST = () => {
    const subtotal = calculateSubtotal();
    if (taxType === "igst") {
      return (subtotal * 18) / 100; // 18% IGST
    }
    return 0; // No IGST for SGST+CGST or no-GST
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const getTaxType = () => {
    if (taxType === "no-gst") {
      return "No GST";
    } else if (taxType === "sgst-cgst") {
      return "SGST + CGST";
    }
    return "IGST";
  };

  const getTaxRate = () => {
    if (taxType === "no-gst") {
      return "0%";
    } else if (taxType === "sgst-cgst") {
      return "9% + 9%";
    }
    return "18%";
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

    const convertLessThanOneThousand = (num: number): string => {
      if (num === 0) return "";

      if (num < 10) return ones[num];
      if (num < 20) return teens[num - 10];
      if (num < 100) {
        return (
          tens[Math.floor(num / 10)] +
          (num % 10 !== 0 ? " " + ones[num % 10] : "")
        );
      }
      if (num < 1000) {
        return (
          ones[Math.floor(num / 100)] +
          " Hundred" +
          (num % 100 !== 0
            ? " and " + convertLessThanOneThousand(num % 100)
            : "")
        );
      }
      return "";
    };

    const convert = (num: number): string => {
      if (num === 0) return "Zero";
      if (num < 1000) return convertLessThanOneThousand(num);
      if (num < 100000) {
        return (
          convertLessThanOneThousand(Math.floor(num / 1000)) +
          " Thousand" +
          (num % 1000 !== 0 ? " " + convertLessThanOneThousand(num % 1000) : "")
        );
      }
      if (num < 10000000) {
        return (
          convertLessThanOneThousand(Math.floor(num / 100000)) +
          " Lakh" +
          (num % 100000 !== 0
            ? " " + convertLessThanOneThousand(num % 100000)
            : "")
        );
      }
      if (num < 1000000000) {
        return (
          convertLessThanOneThousand(Math.floor(num / 10000000)) +
          " Crore" +
          (num % 10000000 !== 0
            ? " " + convertLessThanOneThousand(num % 10000000)
            : "")
        );
      }
      return "Number too large";
    };

    return "INR " + convert(Math.floor(amount)) + " Only";
  };

  const getTaxAmountInWords = (amount: number): string => {
    return "INR " + getAmountInWords(amount).replace("INR ", "");
  };

  // Default values
  const companyName = companyInfo?.name || "Brandsmashers Tech";
  const companyAddress =
    companyInfo?.address ||
    "1st Floor, JAP Tower, Raisen RD, Ward 44, Govindpura";
  const companyState = companyInfo?.state || "Madhya Pradesh - 462023, India";
  const companyGstin = companyInfo?.gstin || "23COBPJ6565E1Z4";
  const companyStateCode =
    companyInfo?.stateCode || "Madhya Pradesh, Code : 23";
  const companyEmail = companyInfo?.email || "accounting@brandsmashers.com";
  const companyWebsite =
    companyInfo?.website || "https://www.brandsmashers.com/";

  const clientCompany =
    clientInfo?.company || client.company || "Client Company";
  const clientAddress =
    clientInfo?.address || client.address || "Client Address";
  const clientState =
    clientInfo?.state || client.companyAddress || "Client State";
  const clientGstin = clientInfo?.gstin || client.gstId || "Client GSTIN";
  const clientStateCode = clientInfo?.stateCode || "Client State Code";

  const hsnCode = itemDetails?.hsnCode || "998314";
  const unit = itemDetails?.unit || "Nos";

  const buyerOrderNo = formData?.buyerOrderNo || "";
  const buyerOrderDate = formData?.buyerOrderDate || "";
  const purchaseOrderNo = formData?.purchaseOrderNo || "";
  const purchaseOrderDate = formData?.purchaseOrderDate || "";

  const subtotal = calculateSubtotal();
  const taxAmount = calculateTax();
  const total = calculateTotal();

  return React.createElement(
    "div",
    {
      className: "invoice-template",
      style: {
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        color: "#000",
        width: "190mm",
        margin: "0 auto",
      },
    },
    [
      React.createElement(
        "div",
        {
          className: "container",
          style: { maxWidth: "190mm", margin: "auto" },
        },
        [
          React.createElement(
            "h2",
            {
              style: {
                textAlign: "center",
                fontSize: "14px",
                margin: "0 0 6px 0",
              },
            },
            "TAX INVOICE"
          ),

          // Header: Left (Company & Buyer) | Right (Invoice Meta)
          React.createElement(
            "div",
            {
              style: { display: "flex", gap: "8px", marginBottom: "8px" },
            },
            [
              // LEFT COLUMN - Company & Buyer
              React.createElement(
                "div",
                {
                  style: { flex: 1, border: "1px solid #000", padding: "4px" },
                },
                [
                  React.createElement("strong", {}, companyName),
                  React.createElement("br"),
                  companyAddress,
                  React.createElement("br"),
                  companyState,
                  React.createElement("br"),
                  "GSTIN/UIN: " + companyGstin,
                  React.createElement("br"),
                  "State Name & Code: " + companyStateCode,
                  React.createElement("br"),
                  "E-Mail: " + companyEmail,
                  React.createElement("br"),
                  companyWebsite,
                  React.createElement("hr", {
                    style: {
                      border: "0",
                      borderTop: "1px solid #000",
                      margin: "6px 0",
                    },
                  }),
                  React.createElement("strong", {}, "Buyer (Bill to)"),
                  React.createElement("br"),
                  clientCompany,
                  React.createElement("br"),
                  clientAddress,
                  React.createElement("br"),
                  clientState,
                  React.createElement("br"),
                  "GSTIN/UIN: " + clientGstin,
                  React.createElement("br"),
                  "State Name & Code: " + clientStateCode,
                ]
              ),

              // RIGHT COLUMN - Invoice Details
              React.createElement(
                "div",
                {
                  style: { flex: 1, border: "1px solid #000", padding: "0" },
                },
                [
                  React.createElement(
                    "table",
                    {
                      style: { width: "100%", borderCollapse: "collapse" },
                    },
                    [
                      React.createElement("tr", {}, [
                        React.createElement(
                          "td",
                          {
                            style: {
                              border: "1px solid #000",
                              padding: "4px",
                              width: "50%",
                            },
                          },
                          [
                            React.createElement("strong", {}, "Invoice No."),
                            React.createElement("br"),
                            invoice.invoiceNumber,
                          ]
                        ),
                        React.createElement(
                          "td",
                          {
                            style: {
                              border: "1px solid #000",
                              padding: "4px",
                              width: "50%",
                            },
                          },
                          [
                            React.createElement("strong", {}, "Dated"),
                            React.createElement("br"),
                            format(new Date(invoice.issueDate), "dd-MMM-yy"),
                          ]
                        ),
                      ]),
                      React.createElement("tr", {}, [
                        React.createElement(
                          "td",
                          {
                            style: {
                              border: "1px solid #000",
                              padding: "4px",
                            },
                          },
                          [
                            React.createElement("strong", {}, "Delivery Note"),
                            React.createElement("br"),
                            invoice.deliveryNote || "",
                          ]
                        ),
                        React.createElement(
                          "td",
                          {
                            style: {
                              border: "1px solid #000",
                              padding: "4px",
                            },
                          },
                          [
                            React.createElement(
                              "strong",
                              {},
                              "Mode/Terms of Payment"
                            ),
                            React.createElement("br"),
                            invoice.paymentTerms || "",
                          ]
                        ),
                      ]),
                      React.createElement("tr", {}, [
                        React.createElement(
                          "td",
                          {
                            style: {
                              border: "1px solid #000",
                              padding: "4px",
                            },
                          },
                          [
                            React.createElement(
                              "strong",
                              {},
                              "Reference No. & Date"
                            ),
                            React.createElement("br"),
                            invoice.referenceNo || "",
                          ]
                        ),
                        React.createElement(
                          "td",
                          {
                            style: {
                              border: "1px solid #000",
                              padding: "4px",
                            },
                          },
                          [
                            React.createElement(
                              "strong",
                              {},
                              "Other References"
                            ),
                            React.createElement("br"),
                            buyerOrderNo,
                          ]
                        ),
                      ]),
                      React.createElement("tr", {}, [
                        React.createElement(
                          "td",
                          {
                            style: {
                              border: "1px solid #000",
                              padding: "4px",
                            },
                          },
                          [
                            React.createElement(
                              "strong",
                              {},
                              "Buyer's Order No."
                            ),
                            React.createElement("br"),
                            buyerOrderNo,
                          ]
                        ),
                        React.createElement(
                          "td",
                          {
                            style: {
                              border: "1px solid #000",
                              padding: "4px",
                            },
                          },
                          [
                            React.createElement("strong", {}, "Dated"),
                            React.createElement("br"),
                            buyerOrderDate,
                          ]
                        ),
                      ]),
                      React.createElement("tr", {}, [
                        React.createElement(
                          "td",
                          {
                            style: {
                              border: "1px solid #000",
                              padding: "4px",
                            },
                          },
                          [
                            React.createElement(
                              "strong",
                              {},
                              "Purchase Order No."
                            ),
                            React.createElement("br"),
                            purchaseOrderNo,
                          ]
                        ),
                        React.createElement(
                          "td",
                          {
                            style: {
                              border: "1px solid #000",
                              padding: "4px",
                            },
                          },
                          [
                            React.createElement("strong", {}, "Dated"),
                            React.createElement("br"),
                            purchaseOrderDate,
                          ]
                        ),
                      ]),
                      React.createElement("tr", {}, [
                        React.createElement(
                          "td",
                          {
                            style: {
                              border: "1px solid #000",
                              padding: "4px",
                            },
                          },
                          [
                            React.createElement(
                              "strong",
                              {},
                              "Dispatch Doc No."
                            ),
                            React.createElement("br"),
                            invoice.dispatchDocNo || "",
                          ]
                        ),
                        React.createElement(
                          "td",
                          {
                            style: {
                              border: "1px solid #000",
                              padding: "4px",
                            },
                          },
                          [
                            React.createElement(
                              "strong",
                              {},
                              "Delivery Note Date"
                            ),
                            React.createElement("br"),
                            invoice.deliveryNoteDate || "",
                          ]
                        ),
                      ]),
                      React.createElement("tr", {}, [
                        React.createElement(
                          "td",
                          {
                            style: {
                              border: "1px solid #000",
                              padding: "4px",
                            },
                          },
                          [
                            React.createElement(
                              "strong",
                              {},
                              "Dispatched through"
                            ),
                            React.createElement("br"),
                            invoice.dispatchedThrough || "",
                          ]
                        ),
                        React.createElement(
                          "td",
                          {
                            style: {
                              border: "1px solid #000",
                              padding: "4px",
                            },
                          },
                          [
                            React.createElement("strong", {}, "Destination"),
                            React.createElement("br"),
                            invoice.destination || "",
                          ]
                        ),
                      ]),
                      React.createElement("tr", {}, [
                        React.createElement(
                          "td",
                          {
                            colSpan: 2,
                            style: {
                              border: "1px solid #000",
                              padding: "4px",
                            },
                          },
                          [
                            React.createElement(
                              "strong",
                              {},
                              "Terms of Delivery"
                            ),
                            React.createElement("br"),
                            invoice.termsOfDelivery || "",
                          ]
                        ),
                      ]),
                    ]
                  ),
                ]
              ),
            ]
          ),

          // Services Table
          React.createElement(
            "table",
            {
              style: {
                marginTop: "8px",
                width: "100%",
                borderCollapse: "collapse",
              },
            },
            [
              React.createElement("thead", {}, [
                React.createElement("tr", {}, [
                  React.createElement(
                    "th",
                    {
                      style: {
                        border: "1px solid #000",
                        padding: "4px 6px",
                        textAlign: "center",
                      },
                    },
                    "Sl No."
                  ),
                  React.createElement(
                    "th",
                    {
                      style: {
                        border: "1px solid #000",
                        padding: "4px 6px",
                        textAlign: "center",
                      },
                    },
                    "Description of Services"
                  ),
                  React.createElement(
                    "th",
                    {
                      style: {
                        border: "1px solid #000",
                        padding: "4px 6px",
                        textAlign: "center",
                      },
                    },
                    "HSN/SAC"
                  ),
                  React.createElement(
                    "th",
                    {
                      style: {
                        border: "1px solid #000",
                        padding: "4px 6px",
                        textAlign: "center",
                      },
                    },
                    "Quantity"
                  ),
                  React.createElement(
                    "th",
                    {
                      style: {
                        border: "1px solid #000",
                        padding: "4px 6px",
                        textAlign: "center",
                      },
                    },
                    "Rate"
                  ),
                  React.createElement(
                    "th",
                    {
                      style: {
                        border: "1px solid #000",
                        padding: "4px 6px",
                        textAlign: "center",
                      },
                    },
                    "per"
                  ),
                  React.createElement(
                    "th",
                    {
                      style: {
                        border: "1px solid #000",
                        padding: "4px 6px",
                        textAlign: "center",
                      },
                    },
                    "Amount"
                  ),
                ]),
              ]),
              React.createElement("tbody", {}, 
                items.map((item, index) => 
                  React.createElement("tr", { key: item.id }, [
                    React.createElement(
                      "td",
                      {
                        style: {
                          border: "1px solid #000",
                          padding: "4px 6px",
                          textAlign: "center",
                        },
                      },
                      (index + 1).toString()
                    ),
                    React.createElement(
                      "td",
                      { style: { border: "1px solid #000", padding: "4px 6px" } },
                      [
                        React.createElement(
                          "strong",
                          {},
                          item.title || "Item Title"
                        ),
                        React.createElement("br"),
                        item.description || "IT Design and Development"
                      ]
                    ),
                    React.createElement(
                      "td",
                      {
                        style: {
                          border: "1px solid #000",
                          padding: "4px 6px",
                          textAlign: "center",
                        },
                      },
                      hsnCode
                    ),
                    React.createElement(
                      "td",
                      {
                        style: {
                          border: "1px solid #000",
                          padding: "4px 6px",
                          textAlign: "center",
                        },
                      },
                      item.quantity + " " + unit
                    ),
                    React.createElement(
                      "td",
                      {
                        style: {
                          border: "1px solid #000",
                          padding: "4px 6px",
                          textAlign: "right",
                        },
                      },
                      formatCurrency(item.unitPrice)
                    ),
                    React.createElement(
                      "td",
                      {
                        style: {
                          border: "1px solid #000",
                          padding: "4px 6px",
                          textAlign: "center",
                        },
                      },
                      unit
                    ),
                    React.createElement(
                      "td",
                      {
                        style: {
                          border: "1px solid #000",
                          padding: "4px 6px",
                          textAlign: "right",
                        },
                      },
                      formatCurrency(item.total)
                    ),
                  ])
                )
              ),
            ]
          ),

          // Tax Row (only show if GST is applicable)
          ...(taxType !== "no-gst" ? [
            React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  border: "1px solid #000",
                  borderTop: "none",
                  marginTop: "-1px",
                },
              },
              [
                React.createElement(
                  "div",
                  {
                    style: {
                      flex: 5,
                      borderRight: "1px solid #000",
                      padding: "4px 6px",
                      textAlign: "right",
                      fontWeight: "bold",
                    },
                  },
                  getTaxType()
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      flex: 1,
                      borderRight: "1px solid #000",
                      padding: "4px 6px",
                      textAlign: "center",
                    },
                  },
                  getTaxRate()
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      flex: 1,
                      padding: "4px 6px",
                      textAlign: "right",
                    },
                  },
                  formatCurrency(taxAmount)
                ),
              ]
            )
          ] : []),

          // Total Row
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                border: "1px solid #000",
                borderTop: "none",
                marginTop: "-1px",
              },
            },
            [
              React.createElement(
                "div",
                {
                  style: {
                    flex: 5,
                    borderRight: "1px solid #000",
                    padding: "4px 6px",
                    textAlign: "right",
                    fontWeight: "bold",
                  },
                },
                "Total"
              ),
              React.createElement(
                "div",
                {
                  style: {
                    flex: 1,
                    borderRight: "1px solid #000",
                    padding: "4px 6px",
                    textAlign: "center",
                  },
                },
                items.reduce((sum, item) => sum + item.quantity, 0) + " " + unit
              ),
              React.createElement(
                "div",
                {
                  style: {
                    flex: 1,
                    padding: "4px 6px",
                    textAlign: "right",
                    fontWeight: "bold",
                  },
                },
                "₹ " + formatCurrency(total)
              ),
            ]
          ),

          // Amount in Words
          React.createElement(
            "div",
            {
              style: {
                border: "1px solid #000",
                borderTop: "none",
                marginTop: "-1px",
                padding: "4px 6px",
                fontWeight: "bold",
              },
            },
            "Amount Chargeable (in words): " + getAmountInWords(total)
          ),

          // Tax Breakdown Table
          React.createElement(
            "table",
            {
              style: {
                marginTop: "8px",
                width: "100%",
                borderCollapse: "collapse",
              },
            },
            [
              React.createElement("thead", {}, [
                React.createElement("tr", {}, [
                  React.createElement(
                    "th",
                    {
                      style: {
                        border: "1px solid #000",
                        padding: "4px 6px",
                        textAlign: "center",
                      },
                    },
                    "HSN/SAC"
                  ),
                  React.createElement(
                    "th",
                    {
                      style: {
                        border: "1px solid #000",
                        padding: "4px 6px",
                        textAlign: "center",
                      },
                    },
                    "Taxable Value"
                  ),
                  React.createElement(
                    "th",
                    {
                      style: {
                        border: "1px solid #000",
                        padding: "4px 6px",
                        textAlign: "center",
                      },
                    },
                    taxType === "no-gst" ? "Tax" : getTaxType()
                  ),
                  React.createElement(
                    "th",
                    {
                      style: {
                        border: "1px solid #000",
                        padding: "4px 6px",
                        textAlign: "center",
                      },
                    },
                    "Total Tax Amount"
                  ),
                ]),
              ]),
              React.createElement("tbody", {}, [
                React.createElement("tr", {}, [
                  React.createElement(
                    "td",
                    {
                      style: {
                        border: "1px solid #000",
                        padding: "4px 6px",
                        textAlign: "center",
                      },
                    },
                    hsnCode
                  ),
                  React.createElement(
                    "td",
                    {
                      style: {
                        border: "1px solid #000",
                        padding: "4px 6px",
                        textAlign: "right",
                      },
                    },
                    formatCurrency(subtotal)
                  ),
                  React.createElement(
                    "td",
                    {
                      style: {
                        border: "1px solid #000",
                        padding: "4px 6px",
                        textAlign: "center",
                      },
                    },
                    taxType === "no-gst" ? "N/A" : [
                      getTaxType() + " " + getTaxRate(),
                      React.createElement("br"),
                      "Amount: " + formatCurrency(taxAmount),
                    ]
                  ),
                  React.createElement(
                    "td",
                    {
                      style: {
                        border: "1px solid #000",
                        padding: "4px 6px",
                        textAlign: "right",
                      },
                    },
                    taxType === "no-gst" ? "N/A" : formatCurrency(taxAmount)
                  ),
                ]),
                React.createElement("tr", {}, [
                  React.createElement(
                    "td",
                    {
                      colSpan: 2,
                      style: {
                        border: "1px solid #000",
                        padding: "4px 6px",
                        textAlign: "right",
                        fontWeight: "bold",
                      },
                    },
                    "Total"
                  ),
                  React.createElement(
                    "td",
                    {
                      style: {
                        border: "1px solid #000",
                        padding: "4px 6px",
                        textAlign: "center",
                        fontWeight: "bold",
                      },
                    },
                    formatCurrency(subtotal)
                  ),
                  React.createElement(
                    "td",
                    {
                      style: {
                        border: "1px solid #000",
                        padding: "4px 6px",
                        textAlign: "right",
                        fontWeight: "bold",
                      },
                    },
                    taxType === "no-gst" ? "N/A" : formatCurrency(taxAmount)
                  ),
                ]),
              ]),
            ]
          ),

          // Tax Amount in Words (only show if GST is applicable)
          ...(taxType !== "no-gst" ? [
            React.createElement(
              "div",
              {
                style: {
                  marginTop: "6px",
                  fontSize: "11px",
                },
              },
              [
                React.createElement(
                  "strong",
                  {},
                  getTaxType() + " Amount (in words): "
                ),
                getTaxAmountInWords(taxAmount),
              ]
            )
          ] : []),

          // Declaration
          React.createElement(
            "div",
            {
              style: {
                marginTop: "6px",
                fontSize: "11px",
              },
            },
            [
              React.createElement("strong", {}, "Declaration"),
              React.createElement("br"),
              "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
            ]
          ),

          // Signature & Stamp
          React.createElement(
            "div",
            {
              style: {
                marginTop: "20px",
                display: "flex",
                justifyContent: "space-between",
              },
            },
            [
              React.createElement(
                "div",
                {
                  style: {
                    width: "50%",
                    height: "80px",
                    border: "1px solid #000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                  },
                },
                "Customer's Seal and Signature"
              ),
              React.createElement(
                "div",
                {
                  style: {
                    width: "50%",
                    height: "80px",
                    border: "1px solid #000",
                    borderLeft: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    position: "relative",
                  },
                },
                [
                  React.createElement(
                    "div",
                    {
                      style: {
                        position: "absolute",
                        top: "10px",
                        right: "20px",
                        width: "60px",
                        height: "60px",
                        border: "2px solid #0066cc",
                        borderRadius: "50%",
                        backgroundColor: "#0066cc",
                        color: "white",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "8px",
                        fontWeight: "bold",
                        textAlign: "center",
                      },
                    },
                    [
                      "ACCOUNT",
                      React.createElement("br"),
                      "DEPARTMENT",
                      React.createElement("br"),
                      "BRANDSMASHERS",
                      React.createElement("br"),
                      "TECH",
                    ]
                  ),
                  React.createElement(
                    "div",
                    {
                      style: {
                        marginTop: "20px",
                        textAlign: "center",
                      },
                    },
                    [
                      "For " + companyName,
                      React.createElement("br"),
                      "Authorised Signatory",
                    ]
                  ),
                ]
              ),
            ]
          ),

          // Footer
          React.createElement(
            "div",
            {
              style: {
                textAlign: "center",
                fontSize: "10px",
                marginTop: "15px",
                fontStyle: "italic",
              },
            },
            "This is a Computer Generated Invoice"
          ),
        ]
      ),
    ]
  );
};
