export interface Client {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  type: 'Individual' | 'Business' | 'Agency' | 'Vendor';
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxId: string;
  currency: string;
  paymentTerms: string;
  paymentMethods: string[];
  notes: string;
  tags: string[];
  status: 'Active' | 'Pending' | 'Blocked';
  riskLevel: 'Reliable' | 'Slow Payer' | 'At Risk';
  totalInvoiced: number;
  outstandingBalance: number;
}

export interface LineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  date: string;
  details?: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  dueDate: string;
  issueDate: string;
  status: 'Draft' | 'Upcoming' | 'Due Today' | 'Overdue' | 'Paid';
  reminderStatus: 'Sent' | 'Not Sent' | 'Scheduled';
  lineItems: LineItem[];
  hasTax: boolean;
  taxRate: number; // e.g., 7.5 for 7.5% VAT
  notes: string;
  reminders: {
    before3Days: boolean;
    onDueDate: boolean;
    overdue3Days: boolean;
    overdue7Days: boolean;
  };
  escalationRule: string; // e.g. "None", "Automatic warning text", "Escalate to manager"
  messageTemplate: 'Friendly' | 'Firm' | 'Final Notice';
  activityLog: ActivityLog[];
}

// Highly polished initial mock client data
export const INITIAL_CLIENTS: Client[] = [
  {
    id: "cnt-acme",
    name: "Acme Ltd",
    businessName: "Acme Corporate Systems Inc.",
    email: "billing@acme.com",
    phone: "+1 (555) 349-8800",
    type: "Business",
    address: "88 Pine Street, Floor 14",
    city: "New York",
    state: "NY",
    country: "United States",
    postalCode: "10005",
    taxId: "US-99482093",
    currency: "USD",
    paymentTerms: "Net 30",
    paymentMethods: ["Bank Transfer", "Stripe"],
    notes: "Enterprise-grade client. Highly reliable, holds accounts offset structures. Requires PDF copy attached to all requests.",
    tags: ["Enterprise", "Tech", "US"],
    status: "Active",
    riskLevel: "Reliable",
    totalInvoiced: 12450.00,
    outstandingBalance: 0.00
  },
  {
    id: "cnt-bright",
    name: "Bright Media Agency",
    businessName: "Bright Media Stockholm AB",
    email: "billing@brightmedia.se",
    phone: "+46 8 123 45 67",
    type: "Agency",
    address: "Kungsgatan 12, Floor 2",
    city: "Stockholm",
    state: "",
    country: "Sweden",
    postalCode: "111 35",
    taxId: "SE-556123456701",
    currency: "EUR",
    paymentTerms: "Net 15",
    paymentMethods: ["Bank Transfer"],
    notes: "Boutique creative agency from Stockholm. Prefers invoicing in Euros. Excellent communication history.",
    tags: ["Creative", "Agency", "EU"],
    status: "Active",
    riskLevel: "Reliable",
    totalInvoiced: 7800.00,
    outstandingBalance: 3200.00
  },
  {
    id: "cnt-lagos",
    name: "Lagos Prints Co",
    businessName: "Lagos Prints Corporation Limited",
    email: "invoice@lagosprints.com",
    phone: "+234 803 111 2222",
    type: "Business",
    address: "24 Broad Street, Marina",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
    postalCode: "100223",
    taxId: "NG-883902910-1",
    currency: "NGN",
    paymentTerms: "Net 30",
    paymentMethods: ["Bank Transfer", "PayPal"],
    notes: "High volume print & distribution firm. Requires constant gentle nudges. Typically pays on first reminder.",
    tags: ["Print", "Local", "Corporate"],
    status: "Active",
    riskLevel: "Slow Payer",
    totalInvoiced: 4500000.00,
    outstandingBalance: 1200000.00
  },
  {
    id: "cnt-kemi",
    name: "Kemi Stores",
    businessName: "Kemi Lifestyle & Stores",
    email: "retail@kemistores.co",
    phone: "+234 812 345 6789",
    type: "Individual",
    address: "Plot 12, Admiralty Way, Lekki Phase 1",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
    postalCode: "105102",
    taxId: "NG-9908311-B",
    currency: "NGN",
    paymentTerms: "Net 15",
    paymentMethods: ["PayPal", "Bank Transfer"],
    notes: "Luxury lifestyle retailer. Passionate founder, pays invoices quickly upon review.",
    tags: ["Retail", "Fashion"],
    status: "Active",
    riskLevel: "Reliable",
    totalInvoiced: 850000.00,
    outstandingBalance: 0.00
  },
  {
    id: "cnt-techbuild",
    name: "TechBuild NG",
    businessName: "TechBuild Nigeria Limited",
    email: "operations@techbuild.co",
    phone: "+234 901 888 7777",
    type: "Business",
    address: "5 Herbert Macaulay Way, Yaba",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
    postalCode: "101212",
    taxId: "NG-443901923",
    currency: "USD",
    paymentTerms: "Net 30",
    paymentMethods: ["Bank Transfer"],
    notes: "Fast-growing development startup. Experiencing temporary cash flow constraints, keep dynamic eye on overdue invoices.",
    tags: ["Tech", "Startup"],
    status: "Active",
    riskLevel: "At Risk",
    totalInvoiced: 15000.00,
    outstandingBalance: 8500.00
  },
  {
    id: "cnt-olaolu",
    name: "Olaolu Ventures",
    businessName: "Olaolu Creative Services Group",
    email: "info@olaolu.ventures",
    phone: "+44 20 7946 0192",
    type: "Individual",
    address: "Workspace 4, 12 Old Street",
    city: "London",
    state: "",
    country: "United Kingdom",
    postalCode: "EC1V 9BP",
    taxId: "GB-12993882",
    currency: "GBP",
    paymentTerms: "Net 15",
    paymentMethods: ["Stripe", "PayPal"],
    notes: "Freelance creative partner directing brand projects. Usually coordinates payments on the weekend.",
    tags: ["Creative", "Consulting"],
    status: "Active",
    riskLevel: "Slow Payer",
    totalInvoiced: 4200.00,
    outstandingBalance: 1600.00
  }
];

// Seed dates relative to user's 2026 current local time of 2026-05-23
export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "INV-0055",
    clientId: "cnt-techbuild",
    amount: 5000.00,
    dueDate: "2026-05-23", // Due Today!
    issueDate: "2026-04-23",
    status: "Due Today",
    reminderStatus: "Scheduled",
    lineItems: [
      { id: "li-1", description: "Design System Implementation - UI components development", qty: 1, unitPrice: 3500.00, total: 3500.00 },
      { id: "li-2", description: "Design Consulting hours - 15 hours at $100/hr", qty: 15, unitPrice: 100.00, total: 1500.00 }
    ],
    hasTax: true,
    taxRate: 7.5,
    notes: "Please send confirmation of wire transfer. Terms as negotiated in master service agreement section 4b.",
    reminders: {
      before3Days: true,
      onDueDate: true,
      overdue3Days: true,
      overdue7Days: true
    },
    escalationRule: "Automatic resend with warning",
    messageTemplate: "Friendly",
    activityLog: [
      { id: "act-1", action: "Invoice Created", date: "2026-04-23", details: "Saved draft by user" },
      { id: "act-2", action: "Invoice Sent", date: "2026-04-24", details: "Emailed to operations@techbuild.co" },
      { id: "act-3", action: "Reminder Sent", date: "2026-05-20", details: "System auto-sent: 3-day pre-due-date nudge" }
    ]
  },
  {
    id: "INV-0041",
    clientId: "cnt-bright",
    amount: 3200.00,
    dueDate: "2026-06-03", // Upcoming
    issueDate: "2026-05-19",
    status: "Upcoming",
    reminderStatus: "Not Sent",
    lineItems: [
      { id: "li-3", description: "Brand Strategy Workshop & Asset Package", qty: 1, unitPrice: 3200.00, total: 3200.00 }
    ],
    hasTax: false,
    taxRate: 0.0,
    notes: "Sweden cross-border business. Tax calculated at destination.",
    reminders: {
      before3Days: true,
      onDueDate: true,
      overdue3Days: false,
      overdue7Days: false
    },
    escalationRule: "None",
    messageTemplate: "Friendly",
    activityLog: [
      { id: "act-4", action: "Invoice Created", date: "2026-05-18", details: "Imported hours from tracking" },
      { id: "act-5", action: "Invoice Sent", date: "2026-05-19", details: "Emailed out using template 'Friendly'" }
    ]
  },
  {
    id: "INV-0038",
    clientId: "cnt-lagos",
    amount: 1200000.00, // NGN Currency
    dueDate: "2026-05-10", // Overdue! (13 days overdue)
    issueDate: "2026-04-10",
    status: "Overdue",
    reminderStatus: "Sent",
    lineItems: [
      { id: "li-4", description: "Custom Print Packaging Design Layout", qty: 2, unitPrice: 500000.00, total: 1000000.00 },
      { id: "li-5", description: "Press Setup Consulting & Asset Prep", qty: 20, unitPrice: 10000.00, total: 200000.00 }
    ],
    hasTax: false,
    taxRate: 7.5,
    notes: "Payment instructions for Zenith Bank are at footer.",
    reminders: {
      before3Days: false,
      onDueDate: true,
      overdue3Days: true,
      overdue7Days: true
    },
    escalationRule: "Draft notice to manager",
    messageTemplate: "Firm",
    activityLog: [
      { id: "act-6", action: "Invoice Created", date: "2026-04-10" },
      { id: "act-7", action: "Invoice Sent", date: "2026-04-10" },
      { id: "act-8", action: "Reminder Sent", date: "2026-05-10", details: "Due-date notification sent to client" },
      { id: "act-9", action: "Reminder Sent", date: "2026-05-13", details: "Escalated reminder sent: Firm template" },
      { id: "act-10", action: "Escalation Activated", date: "2026-05-17", details: "Draft notice sent to billing manager email" }
    ]
  },
  {
    id: "INV-0030",
    clientId: "cnt-acme",
    amount: 12450.00,
    dueDate: "2026-05-15",
    issueDate: "2026-04-15",
    status: "Paid",
    reminderStatus: "Not Sent",
    lineItems: [
      { id: "li-6", description: "Full stack engineering consulting - Q1 Milestones", qty: 1, unitPrice: 12450.00, total: 12450.00 }
    ],
    hasTax: false,
    taxRate: 0,
    notes: "Paid in full via invoice portal auto-clearing.",
    reminders: {
      before3Days: false,
      onDueDate: false,
      overdue3Days: false,
      overdue7Days: false
    },
    escalationRule: "None",
    messageTemplate: "Friendly",
    activityLog: [
      { id: "act-11", action: "Invoice Created", date: "2026-04-15" },
      { id: "act-12", action: "Invoice Sent", date: "2026-04-15" },
      { id: "act-13", action: "Payment Received", date: "2026-05-12", details: "Stripe transaction id: txn_8839019283" }
    ]
  },
  {
    id: "INV-0021",
    clientId: "cnt-olaolu",
    amount: 1600.00,
    dueDate: "2026-06-15",
    issueDate: "2026-05-15",
    status: "Draft",
    reminderStatus: "Not Sent",
    lineItems: [
      { id: "li-7", description: "Website Wireframing & Responsive Prototypes", qty: 10, unitPrice: 160.00, total: 1600.00 }
    ],
    hasTax: false,
    taxRate: 0,
    notes: "Under negotiation of terms. Draft state.",
    reminders: {
      before3Days: true,
      onDueDate: true,
      overdue3Days: false,
      overdue7Days: false
    },
    escalationRule: "None",
    messageTemplate: "Friendly",
    activityLog: [
      { id: "act-14", action: "Draft Created", date: "2026-05-15", details: "Saved as Draft" }
    ]
  },
  {
    id: "INV-0018",
    clientId: "cnt-kemi",
    amount: 850000.00,
    dueDate: "2026-06-05", // Upcoming
    issueDate: "2026-05-20",
    status: "Upcoming",
    reminderStatus: "Not Sent",
    lineItems: [
      { id: "li-8", description: "E-commerce Product Photography & Styling Sessions", qty: 17, unitPrice: 50000.00, total: 850000.00 }
    ],
    hasTax: false,
    taxRate: 0,
    notes: "Payment through bank transfer receipt expected on issue.",
    reminders: {
      before3Days: true,
      onDueDate: true,
      overdue3Days: false,
      overdue7Days: false
    },
    escalationRule: "None",
    messageTemplate: "Friendly",
    activityLog: [
      { id: "act-15", action: "Invoice Created", date: "2026-05-20" },
      { id: "act-16", action: "Invoice Sent", date: "2026-05-20", details: "Delivered via Portal" }
    ]
  }
];

// Product library structures
export interface LibraryProduct {
  id: string;
  name: string;
  type: 'Flat' | 'Hourly' | 'Recurring';
  price: number;
  currency: string;
}

export const PRODUCT_LIBRARY: LibraryProduct[] = [
  { id: "p1", name: "UI Design Consulting (Hourly)", type: "Hourly", price: 120.00, currency: "USD" },
  { id: "p2", name: "Full Stack Development (Hourly)", type: "Hourly", price: 150.00, currency: "USD" },
  { id: "p3", name: "Website Package (Flat Rate)", type: "Flat", price: 4500.00, currency: "USD" },
  { id: "p4", name: "Monthly SEO Maintenance (Recurring)", type: "Recurring", price: 800.00, currency: "USD" },
  { id: "p5", name: "Brand Strategy Audit (Flat Rate)", type: "Flat", price: 2500.00, currency: "USD" },
  { id: "p6", name: "Technical Writing & Docs (Hourly)", type: "Hourly", price: 95.00, currency: "USD" }
];

// Helper functions for currencies and numbers
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 1.08,    // 1 EUR = 1.08 USD
  GBP: 1.25,    // 1 GBP = 1.25 USD
  SEK: 0.095,   // 1 SEK = 0.095 USD
  NGN: 0.00067, // 1 NGN = 0.00067 USD
};

export function convertCurrency(amount: number, from: string, to: string): number {
  const normFrom = (from || "USD").toUpperCase();
  const normTo = (to || "USD").toUpperCase();
  if (normFrom === normTo) return amount;
  
  const rateFrom = EXCHANGE_RATES[normFrom] || 1.0;
  const rateTo = EXCHANGE_RATES[normTo] || 1.0;
  
  const amountInUsd = amount * rateFrom;
  return amountInUsd / rateTo;
}

export function formatCurrencyConverted(
  amount: number,
  originalCurrency: string,
  targetCurrency: string
): string {
  if (!targetCurrency || targetCurrency === "original") {
    return formatCurrency(amount, originalCurrency);
  }
  const converted = convertCurrency(amount, originalCurrency, targetCurrency);
  return formatCurrency(converted, targetCurrency);
}

export function formatCurrency(amount: number, currency: string): string {
  const norm = currency || "USD";
  if (norm === "NGN") {
    return "₦" + amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (norm === "EUR") {
    return "€" + amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (norm === "GBP") {
    return "£" + amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (norm === "SEK") {
    return amount.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " kr";
  }
  if (norm === "DKK") {
    return amount.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " kr";
  }
  if (norm === "NOK") {
    return amount.toLocaleString('no-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " kr";
  }
  // USD default
  return "$" + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
