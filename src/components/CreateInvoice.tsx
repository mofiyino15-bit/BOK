import { useState, useEffect, useRef } from "react";
import { 
  Plus, Trash2, Library, Calendar, CheckSquare, Settings2, Info, ArrowLeft, 
  HelpCircle, Eye, Download, Copy, Link, Paperclip, Pencil, ChevronDown, 
  Check, Sparkles, Sliders, RefreshCw, Printer, Shield, FileText, Upload,
  Type, CheckSquare2
} from "lucide-react";
import { Client, Invoice, LineItem, formatCurrency, formatCurrencyConverted, LibraryProduct } from "../types";
import ProductLibrary from "./ProductLibrary";

interface CreateInvoiceProps {
  clients: Client[];
  invoices: Invoice[];
  onAddInvoice: (invoice: Invoice) => void;
  onNavigate: (route: string, params?: Record<string, any>) => void;
  activeCurrency?: string;
}

export default function CreateInvoice({
  clients,
  invoices,
  onAddInvoice,
  onNavigate,
  activeCurrency = "original"
}: CreateInvoiceProps) {
  // Navigation / Modal States
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || "");
  
  // Custom Invoice General Info
  const [invoiceTitle, setInvoiceTitle] = useState("Invoice");
  const [invoiceDescription, setInvoiceDescription] = useState("Strategic UI Design and Consulting Services");
  const [invoiceIdNumber, setInvoiceIdNumber] = useState("INV-56");
  const [invoiceLanguage, setInvoiceLanguage] = useState("English (US)");
  const [invoiceCurrency, setInvoiceCurrency] = useState("USD");
  const [issueDate, setIssueDate] = useState("2026-05-23");
  const [dueDate, setDueDate] = useState("2026-06-23");
  const [dueTerms, setDueTerms] = useState("Due on Receipt");
  const [poNumber, setPoNumber] = useState("PO-992038");
  
  // Logo Customization State
  const [logoOption, setLogoOption] = useState<"preset" | "text" | "custom">("preset");
  const [selectedPresetLogo, setSelectedPresetLogo] = useState("🌐 APEX SYSTEM");
  const [logoText, setLogoText] = useState("VO BUSINESS");
  const [customLogoUrl, setCustomLogoUrl] = useState("");
  const [showLogoPanel, setShowLogoPanel] = useState(false);
  
  // Logo Presets List
  const logoPresets = [
    { label: "🌐 APEX SYSTEM", bg: "bg-blue-500", text: "text-white" },
    { label: "🎨 CREATIVE AGY", bg: "bg-blue-500", text: "text-white" },
    { label: "⚡️ INDIE TECH", bg: "bg-grey-900", text: "text-white" },
    { label: "💎 LUX CO", bg: "bg-indigo-600", text: "text-white" }
  ];

  // From details (Victory's default address as seen in the screenshot)
  const [fromAddress, setFromAddress] = useState(
    "Victory Owoeye\n4Aigbokhan Drive Magodo II\n100984 Lagos\nNigeria"
  );
  const [isEditingFrom, setIsEditingFrom] = useState(false);

  // Client info overrides / manual entry
  const [clientManualDetails, setClientManualDetails] = useState("");
  const [isEditingTo, setIsEditingTo] = useState(false);

  // Line items state
  const [lineItems, setLineItems] = useState<(LineItem & { unit: string })[]>([
    { 
      id: "li-init-1", 
      description: "Strategic UI Design consulting services & mockup drafting for portal workflows", 
      qty: 1, 
      unitPrice: 1200.00, 
      total: 1200.00,
      unit: "Unit"
    }
  ]);

  // Financial Snapshots
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [hasTax, setHasTax] = useState(false);
  const [taxRate, setTaxRate] = useState(7.5); // Default 7.5% VAT

  // Custom Disclosures & Footers
  const [notes, setNotes] = useState("Please pay statement totals through Direct Bank Transfer. Invoice values as negotiated in MSA-2026.");
  const [emailFooter, setEmailFooter] = useState("Email: fiyiin@yahoo.com");
  const [isEditingFooter, setIsEditingFooter] = useState(false);

  // Tone & Auto scheduling state
  const [reminders, setReminders] = useState({
    before3Days: true,
    onDueDate: true,
    overdue3Days: false,
    overdue7Days: false
  });
  const [escalationRule, setEscalationRule] = useState("Automatic resend with warning");
  const [messageTemplate, setMessageTemplate] = useState<Invoice["messageTemplate"]>("Friendly");

  // Multi-line items dropdowns state
  const [activeCogLineId, setActiveCogLineId] = useState<string | null>(null);
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);

  // Print Settings Panel (For PDF Preview Mode)
  const [pdfThemeColor, setPdfThemeColor] = useState("blue"); // blue, charcoal, emerald, amber
  const [pdfMargins, setPdfMargins] = useState("Normal"); // Normal, Compact, Large
  const [pdfPaperSize, setPdfPaperSize] = useState("A4"); // A4, US Letter
  const [pdfWatermark, setPdfWatermark] = useState(true);
  const [pdfSignature, setPdfSignature] = useState(true);

  // Automated Download step feedback flow
  const [downloadStep, setDownloadStep] = useState<"idle" | "preparing" | "bundling" | "signing" | "assembling" | "success">("idle");
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Setup reactive fields for clients
  const currentClient = clients.find((c) => c.id === selectedClientId);

  useEffect(() => {
    if (currentClient && !clientManualDetails) {
      setClientManualDetails(
        `${currentClient.businessName || currentClient.name}\n${currentClient.address || ""}\n${currentClient.city || ""} ${currentClient.state || ""} ${currentClient.postalCode || ""}\n${currentClient.country || ""}\nTax ID: ${currentClient.taxId || "N/A"}`
      );
    }
  }, [selectedClientId, currentClient]);

  // Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
  const taxAmount = hasTax ? (subtotal * taxRate / 100) : 0;
  const grandTotal = subtotal + taxAmount;
  const balanceDue = grandTotal - paidAmount;

  // Sync client currency
  useEffect(() => {
    if (currentClient) {
      setInvoiceCurrency(currentClient.currency);
    }
  }, [selectedClientId]);

  // Helpers to get currency character symbol
  const getCurrencySymbolSymbol = (curr: string) => {
    switch(curr) {
      case "EUR": return "€";
      case "GBP": return "£";
      case "NGN": return "₦";
      default: return "$";
    }
  };

  const activeSymbol = getCurrencySymbolSymbol(invoiceCurrency);

  // Line Item Handlers
  const handleAddLineItem = () => {
    const newItem = {
      id: "li-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      description: "",
      qty: 1,
      unitPrice: 0.0,
      total: 0.0,
      unit: "Unit"
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleUpdateLineItem = (id: string, field: string, value: any) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "qty" || field === "unitPrice") {
            const qty = field === "qty" ? Number(value) : item.qty;
            const price = field === "unitPrice" ? Number(value) : item.unitPrice;
            updated.total = qty * price;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleDeleteLineItem = (id: string) => {
    if (lineItems.length === 1) {
      alert("At least one line item is required on this invoice statement.");
      return;
    }
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const handleDuplicateLineItem = (item: any) => {
    const newItem = {
      ...item,
      id: "li-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      description: `${item.description} (Copy)`
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleSelectLibraryItem = (product: LibraryProduct) => {
    const newItem = {
      id: "li-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      description: product.name,
      qty: 1,
      unitPrice: product.price,
      total: product.price,
      unit: product.type === "Hourly" ? "Hour" : "Unit"
    };
    setLineItems([...lineItems, newItem]);
    setIsLibraryOpen(false);
  };

  // Submit flow
  const handleSaveInvoiceRecord = (status: Invoice["status"]) => {
    if (!selectedClientId) {
      alert("Please designate a client.");
      return;
    }

    if (lineItems.some((item) => !item.description.trim())) {
      alert("Please ensure all line item entries contain valid descriptions.");
      return;
    }

    const numericIds = invoices
      .map((inv) => parseInt(inv.id.replace("INV-", "")))
      .filter((n) => !isNaN(n));
    const nextNum = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 56;
    const nextId = "INV-00" + nextNum;

    const newInvoice: Invoice = {
      id: nextId,
      clientId: selectedClientId,
      amount: grandTotal,
      dueDate,
      issueDate,
      status,
      reminderStatus: status === "Draft" ? "Not Sent" : "Scheduled",
      lineItems: lineItems.map(({ id, description, qty, unitPrice, total }) => ({ id, description, qty, unitPrice, total })),
      hasTax,
      taxRate: hasTax ? taxRate : 0,
      notes,
      reminders,
      escalationRule,
      messageTemplate,
      activityLog: [
        {
          id: "act-create-" + Date.now(),
          action: status === "Draft" ? "Draft Created" : "Invoice Created & Published",
          date: issueDate,
          details: status === "Draft" ? "Saved as Draft via builder interface" : `Dispatched to ${currentClient?.name || "recipient client"}.`
        }
      ]
    };

    onAddInvoice(newInvoice);
    alert(`Success! Generated record ${nextId} with status ${status}.`);
    onNavigate("invoices");
  };

  // Printable layout quiet frame trigger (Gold Standard browser PDF print mechanism)
  const triggerNativeIframePrint = () => {
    const printElement = document.getElementById("billing-document-a4-sheet");
    if (!printElement) return;

    // Create hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    iframe.style.left = "-9999px";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Capture CSS of page or use standard online CSS stylesheet
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>${invoiceTitle} - ${invoiceIdNumber}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              padding: 2.5rem;
              background-color: white;
              color: #1f2937;
            }
            .font-mono {
              font-family: 'JetBrains Mono', monospace;
            }
          </style>
        </head>
        <body>
          <div class="max-w-4xl mx-auto p-4">
            ${printElement.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    doc.close();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 3000);
  };

  // Animated beautiful PDF download simulation (downloads actual rich document representation!)
  const triggerPdfDownloadWorkflow = () => {
    setDownloadStep("preparing");
    setDownloadProgress(10);
    
    const intervalIds: any[] = [];
    
    const steps = [
      { step: "preparing" as const, progress: 20, delay: 400 },
      { step: "bundling" as const, progress: 45, delay: 1000 },
      { step: "signing" as const, progress: 75, delay: 1600 },
      { step: "assembling" as const, progress: 95, delay: 2200 },
      { step: "success" as const, progress: 100, delay: 2800 },
    ];

    steps.forEach((s) => {
      const id = setTimeout(() => {
        setDownloadStep(s.step);
        setDownloadProgress(s.progress);
        
        if (s.step === "success") {
          // Download actual raw HTML formatted invoice mock as fallback file
          const blobData = `
          =========================================
          ${invoiceTitle.toUpperCase()} STATEMENT
          =========================================
          INVOICE NO: ${invoiceIdNumber}
          DATE: ${issueDate}
          DUE DATE: ${dueDate}
          PO NUMBER: ${poNumber}
          
          FROM:
          ${fromAddress}
          
          TO:
          ${clientManualDetails}
          
          -----------------------------------------
          ITEMS SUMMARY:
          ${lineItems.map(item => `- ${item.description}: ${item.qty} * ${activeSymbol}${item.unitPrice} = ${activeSymbol}${item.total}`).join("\n")}
          
          -----------------------------------------
          SUBTOTAL: ${activeSymbol}${subtotal.toFixed(2)}
          VAT TAX: ${hasTax ? `${taxRate}% (${activeSymbol}${taxAmount.toFixed(2)})` : "N/A"}
          GRAND TOTAL DUE: ${activeSymbol}${grandTotal.toFixed(2)}
          PAID TO DATE: ${activeSymbol}${paidAmount.toFixed(2)}
          BALANCE DUE: ${activeSymbol}${balanceDue.toFixed(2)}
          
          NOTES & DISCLOSURES:
          ${notes}
          =========================================
          Certified vector document signature Victory Owoeye
          `;
          
          const blob = new Blob([blobData], { type: "text/plain;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${invoiceIdNumber.toLowerCase() || "invoice"}_victory_owoeye.txt`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Also invoke browser printer quiet frame
          triggerNativeIframePrint();
          
          // Auto clear progress indicator shortly afterwards
          setTimeout(() => {
            setDownloadStep("idle");
          }, 4000);
        }
      }, s.delay);
      intervalIds.push(id);
    });
  };

  return (
    <div className="space-y-6" id="create-invoice-unified-workspace">
      
      {/* 1. Header Toolbar Component */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-grey-100 select-none relative z-40">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-grey-450 font-semibold font-secondary">
            <button onClick={() => onNavigate("invoices")} className="hover:text-blue-500 hover:underline cursor-pointer flex items-center gap-1">
              <span className="text-sm font-sans">←</span> Invoices
            </button>
            <span>/</span>
            <span className="text-grey-605 font-bold">New Invoice</span>
          </div>
          <h1 className="text-2xl font-bold text-grey-900 tracking-tight mt-1.5 flex items-center gap-2">
            New Invoice
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-grey-100 text-grey-500 uppercase tracking-wider font-extrabold">Template Editor</span>
          </h1>
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate("invoices")}
            className="flex items-center gap-1.5 px-3 py-2 border border-grey-300 text-grey-600 hover:text-black hover:bg-grey-25 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-xs font-bold cursor-pointer transition-all ${
              isPreviewMode 
                ? "bg-slate-900 text-white border-slate-900" 
                : "bg-white border-grey-300 text-grey-700 hover:bg-grey-25 hover:text-black"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isPreviewMode ? "Edit Template" : "Preview Document"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveInvoiceRecord("Draft")}
            className="px-4 py-2 border border-blue-200 text-blue-600 hover:bg-blue-50/50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Save Draft
          </button>

          {/* Action Trigger Split Button with Option Panel */}
          <div className="relative z-50">
            <div className="inline-flex rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => handleSaveInvoiceRecord("Upcoming")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <span>Save & Issue</span>
              </button>
              <button
                onClick={() => setShowSaveDropdown(!showSaveDropdown)}
                className="px-2 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs transition-colors border-l border-blue-650 cursor-pointer"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
 
            {showSaveDropdown && (
              <div className="absolute right-0 mt-2 bg-white border border-grey-200 rounded-xl shadow-xl py-1.5 w-52 z-[100] text-xs text-left">
                <p className="px-3.5 py-1 text-xs font-bold text-grey-400 uppercase tracking-widest border-b border-grey-100 mb-1">
                  Immediate Actions
                </p>
                
                <button
                  onClick={() => {
                    setShowSaveDropdown(false);
                    triggerPdfDownloadWorkflow();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-grey-25 text-grey-700 flex items-center gap-2 font-medium"
                >
                  <Download className="w-3.5 h-3.5 text-grey-400" />
                  <span>Download Draft PDF</span>
                </button>

                <button
                  onClick={() => {
                    setShowSaveDropdown(false);
                    triggerNativeIframePrint();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-grey-25 text-grey-700 flex items-center gap-2 font-medium"
                >
                  <Printer className="w-3.5 h-3.5 text-grey-400" />
                  <span>Print Document</span>
                </button>

                <div className="border-t border-grey-100 my-1"></div>

                <button
                  onClick={() => {
                    setShowSaveDropdown(false);
                    handleSaveInvoiceRecord("Paid");
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-grey-25 text-green-600 flex items-center gap-2 font-semibold"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  <span>Save as Already Paid</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isPreviewMode ? (
        /*==========================================================
          A4 PRINT PREVIEW CONTROLLER INTERFACE
         ===========================================================*/
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="preview-mode-grid">
          
          {/* Options Sidebar panel */}
          <div className="lg:col-span-4 bg-white border border-grey-200/60 rounded-xl p-5 space-y-5" id="preview-settings-rail">
            <h3 className="text-sm font-bold text-grey-900 uppercase tracking-widest border-b border-grey-100 pb-2 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-500" />
              <span>PDF Render Settings</span>
            </h3>

            {/* Accent Theme color picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-grey-500 block uppercase tracking-wider">Document Styling Theme</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "blue", bg: "bg-blue-500", label: "Classic" },
                  { id: "charcoal", bg: "bg-grey-800", label: "Slate" },
                  { id: "emerald", bg: "bg-emerald-600", label: "Mint" },
                  { id: "amber", bg: "bg-amber-600", label: "Warm" }
                ].map((tc) => (
                  <button
                    key={tc.id}
                    onClick={() => setPdfThemeColor(tc.id)}
                    className={`flex flex-col items-center p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      pdfThemeColor === tc.id 
                        ? "border-slate-800 bg-slate-50 scale-[1.03] text-slate-800" 
                        : "border-grey-100 hover:bg-grey-25"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${tc.bg} mb-1 shadow-sm`}></span>
                    <span>{tc.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Document Margins Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-grey-500 block uppercase tracking-wider">Page Margins Layout</label>
              <div className="grid grid-cols-3 gap-2">
                {["Compact", "Normal", "Default Wide"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPdfMargins(m)}
                    className={`py-1.5 border rounded-lg text-xs font-semibold cursor-pointer ${
                      pdfMargins === m 
                        ? "border-slate-800 bg-slate-800 text-white" 
                        : "border-grey-200 hover:bg-grey-25 text-grey-600"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* PDF Toggles list */}
            <div className="space-y-2.5 pt-2 border-t border-grey-50">
              <label className="text-xs font-bold text-grey-500 block uppercase tracking-wider">Visible Artifact Elements</label>
              
              <label className="flex items-center justify-between text-xs text-grey-700 cursor-pointer py-1">
                <span className="font-medium">Attach Cryptographic Watermark</span>
                <input
                  type="checkbox"
                  checked={pdfWatermark}
                  onChange={(e) => setPdfWatermark(e.target.checked)}
                  className="rounded border-grey-300 text-blue-500 focus:ring-blue-400 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-grey-700 cursor-pointer py-1">
                <span className="font-medium">Draw Signature verification badge</span>
                <input
                  type="checkbox"
                  checked={pdfSignature}
                  onChange={(e) => setPdfSignature(e.target.checked)}
                  className="rounded border-grey-300 text-blue-500 focus:ring-blue-400 w-4 h-4"
                />
              </label>
            </div>

            {/* Download CTA in Panel */}
            <div className="space-y-2 pt-4 border-t border-grey-100">
              <button
                onClick={triggerPdfDownloadWorkflow}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm uppercase tracking-wider cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Vector PDF</span>
              </button>

              <button
                onClick={triggerNativeIframePrint}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Open Browser Print Dialer</span>
              </button>
            </div>
          </div>

          {/* Core Page view block which mimics actual PDF */}
          <div className="lg:col-span-8 flex flex-col items-center" id="pdf-view-viewport">
            {/* Top advice note */}
            <span className="text-xs text-grey-450 font-medium mb-3 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Visible representation of file compiled 100% correct, about to be downloaded.</span>
            </span>

            {/* Document sheet styled like precise document */}
            <div 
              id="billing-document-a4-sheet"
              className={`bg-white border-[0.5px] border-grey-200/50 text-left rounded shadow-xl w-full max-w-[210mm] min-h-[297mm] transition-all relative ${
                pdfMargins === "Compact" ? "p-6" : pdfMargins === "Large" ? "p-16" : "p-10 text-sm"
              }`}
            >
              {/* Decorative Theme Line Top Indicator */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                pdfThemeColor === "blue" ? "bg-blue-500" :
                pdfThemeColor === "charcoal" ? "bg-grey-800" :
                pdfThemeColor === "emerald" ? "bg-emerald-600" : "bg-amber-600"
              }`} />

              {/* Watermark sign */}
              {pdfWatermark && (
                <div className="absolute top-24 right-20 select-none pointer-events-none opacity-5 flex items-center justify-center border-4 border-slate-900 rounded-full w-48 h-48 transform rotate-12">
                  <span className="text-xl font-extrabold tracking-widest text-slate-950">AUTHENTIC</span>
                </div>
              )}

              {/* PDF Document Header Block */}
              <div className="flex justify-between items-start border-b border-grey-100 pb-6 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs uppercase font-black px-2 py-0.5 rounded text-white ${
                      pdfThemeColor === "blue" ? "bg-blue-500" :
                      pdfThemeColor === "charcoal" ? "bg-grey-800" :
                      pdfThemeColor === "emerald" ? "bg-emerald-600" : "bg-amber-600"
                    }`}>
                      DRAFT
                    </span>
                    <h1 className="text-3xl font-black text-grey-900 tracking-tight font-sans">
                      {invoiceTitle || "INVOICE"}
                    </h1>
                  </div>
                  <p className="text-xs text-grey-450 uppercase tracking-wide font-medium">{invoiceDescription || "Professional statement breakdown"}</p>
                </div>

                {/* LOGO FRAME */}
                <div className="text-right">
                  {logoOption === "preset" ? (
                    <div className="p-3 bg-slate-50 border border-grey-200 rounded-xl inline-block text-center shadow-sm">
                      <span className="text-xs font-black text-grey-800 font-sans tracking-tight">{selectedPresetLogo}</span>
                    </div>
                  ) : logoOption === "text" ? (
                    <div className="p-3 bg-grey-900 rounded-xl inline-block text-center text-white">
                      <span className="text-xs font-bold tracking-widest uppercase">{logoText}</span>
                    </div>
                  ) : customLogoUrl ? (
                    <img referrerPolicy="no-referrer" src={customLogoUrl} alt="Logo" className="max-h-16 max-w-44 object-contain rounded" />
                  ) : (
                    <div className="w-14 h-14 rounded-full border border-dashed border-grey-300 flex items-center justify-center bg-slate-25">
                      <span className="text-xs text-grey-400 font-bold p-1 text-center">NO LOGO</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Specs Area */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-xs border-b border-grey-50 pb-6">
                <div>
                  <h4 className="text-grey-400 font-bold uppercase text-xs tracking-wider mb-1">Invoice No.</h4>
                  <p className="text-grey-900 font-mono font-bold text-sm">{invoiceIdNumber || "INV-1"}</p>
                </div>
                <div>
                  <h4 className="text-grey-400 font-bold uppercase text-xs tracking-wider mb-1">Issue Date</h4>
                  <p className="text-grey-800 font-medium">{issueDate}</p>
                </div>
                <div>
                  <h4 className="text-grey-400 font-bold uppercase text-xs tracking-wider mb-1">Due Date</h4>
                  <p className="text-grey-800 font-medium">{dueDate}</p>
                </div>
                <div>
                  <h4 className="text-grey-400 font-bold uppercase text-xs tracking-wider mb-1">PO Reference</h4>
                  <p className="text-grey-900 font-mono font-bold">{poNumber || "N/A"}</p>
                </div>
              </div>

              {/* From / To Entities specs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-xs">
                <div>
                  <h4 className="text-grey-400 font-extrabold uppercase text-xs tracking-widest border-b border-grey-100 pb-1 mb-2">From Sender</h4>
                  <p className="whitespace-pre-wrap font-sans text-grey-800 leading-relaxed font-semibold">{fromAddress}</p>
                </div>
                <div>
                  <h4 className="text-grey-400 font-extrabold uppercase text-xs tracking-widest border-b border-grey-100 pb-1 mb-2">Recipient Client Info</h4>
                  <p className="whitespace-pre-wrap font-sans text-grey-800 leading-relaxed font-semibold">{clientManualDetails || "Manual recipient Details"}</p>
                </div>
              </div>

              {/* Product list Table */}
              <table className="w-full text-left border-collapse text-xs mb-8">
                <thead>
                  <tr className="border-b-2 border-grey-200 text-grey-400 font-bold uppercase text-xs tracking-widest">
                    <th className="py-2.5">Line Description statement</th>
                    <th className="py-2.5 text-right w-16">Qty</th>
                    <th className="py-2.5 text-right w-24">Unit Price</th>
                    <th className="py-2.5 text-right w-28">Line Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-100 text-grey-750">
                  {lineItems.map((item, index) => (
                    <tr key={index} className="py-2.5 hover:bg-slate-25/50">
                      <td className="py-3 pr-2">
                        <span className="font-bold text-grey-900 text-[12px]">{item.description || "Service item description"}</span>
                      </td>
                      <td className="py-3 text-right font-semibold">{item.qty} {item.unit || "Unit"}</td>
                      <td className="py-3 text-right font-mono font-medium">{activeSymbol}{item.unitPrice.toFixed(2)}</td>
                      <td className="py-3 text-right font-mono font-bold text-grey-900">{activeSymbol}{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Calculations Block */}
              <div className="flex justify-end mb-8">
                <div className="w-72 bg-slate-50/70 border border-grey-100 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex justify-between text-grey-500 font-medium">
                    <span>Subtotal</span>
                    <span className="font-mono text-grey-900 font-bold">{activeSymbol}{subtotal.toFixed(2)}</span>
                  </div>
                  {hasTax && (
                    <div className="flex justify-between text-grey-500 font-medium">
                      <span>VAT ({taxRate}%)</span>
                      <span className="font-mono text-grey-900 font-bold">{activeSymbol}{taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-grey-150 pt-2.5 flex justify-between text-grey-900 text-sm">
                    <span className="font-black uppercase tracking-wider text-xs">Total Due ({invoiceCurrency})</span>
                    <span className="font-mono font-black text-blue-650">{activeSymbol}{grandTotal.toFixed(2)}</span>
                  </div>
                  {paidAmount > 0 && (
                    <div className="flex justify-between text-green-650 font-semibold text-xs pt-1">
                      <span>Paid already</span>
                      <span className="font-mono">-{activeSymbol}{paidAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-dashed border-grey-200 pt-2.5 flex justify-between text-grey-900 text-[12px] font-extrabold bg-amber-100/35 p-1.5 rounded">
                    <span>Outstanding Balance</span>
                    <span className="font-mono text-amber-800">{activeSymbol}{balanceDue.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Disclosures Footer */}
              <div className="border-t border-grey-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-grey-450">
                <div>
                  <h4 className="font-bold text-grey-500 uppercase tracking-wider text-xs mb-1">Invoice Remarks & Terms</h4>
                  <p className="leading-relaxed whitespace-pre-wrap">{notes}</p>
                </div>
                <div className="text-left md:text-right flex flex-col justify-between items-start md:items-end">
                  <div>
                    <h4 className="font-bold text-grey-500 uppercase tracking-wider text-xs mb-1">Direct inquiries to</h4>
                    <p className="text-grey-700 font-bold">{emailFooter}</p>
                  </div>
                  
                  {pdfSignature && (
                    <div className="pt-4 mt-2 border-t border-grey-100 w-full text-right">
                      <p className="text-xs font-sans italic font-bold text-grey-800">Victory Owoeye</p>
                      <p className="text-xs uppercase tracking-widest text-grey-400 font-extrabold">Authorized Signer</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Printable system notice footer */}
              <div className="mt-12 text-center text-xs text-grey-300 font-mono select-none">
                Verified cryptographically by Bok Intelligence Ledger on May 23, 2026. Ref: {invoiceIdNumber}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /*==========================================================
          EDIT/CREATE INVOICE PANEL WORKSPACE (MATCHES SCREENSHOT)
         ===========================================================*/
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="edit-workspace-grid">
          
          {/* Main Editorial Form Sheet Container */}
          <div className="xl:col-span-8 bg-white rounded-xl shadow border border-grey-200 p-8 space-y-6" id="designer-form-sheet">
            
            {/* Template Top Row: Draft label, title, Logo block */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-grey-100 pb-6" id="form-sheet-head">
              
              {/* Draft emblem & Editable Invoice Name */}
              <div className="space-y-2 flex-grow">
                <div className="flex items-center gap-2">
                  {/* Draft tag similar to gray badging in screenshot */}
                  <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-md bg-grey-100 border border-grey-200 text-grey-500 tracking-wider select-none">
                    Draft
                  </span>
                  
                  {/* Title editor resembling screenshot */}
                  <input
                    type="text"
                    value={invoiceTitle}
                    onChange={(e) => setInvoiceTitle(e.target.value)}
                    className="text-2xl font-bold font-sans text-grey-900 border-b border-transparent hover:border-grey-100 focus:border-blue-500 focus:outline-none py-0.5 max-w-xs transition-colors"
                    placeholder="Invoice"
                  />
                </div>

                <textarea
                  value={invoiceDescription}
                  onChange={(e) => setInvoiceDescription(e.target.value)}
                  placeholder="Add Description ..."
                  rows={1}
                  className="w-full text-xs text-grey-500 resize-none border-b border-transparent hover:border-grey-100 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Logo customization area: matches "YOUR LOGO HERE" matching circle in screenshot */}
              <div className="relative select-none" id="company-logo-trigger-area">
                <button
                  type="button"
                  onClick={() => setShowLogoPanel(!showLogoPanel)}
                  className="w-24 h-24 rounded-full border border-dashed border-grey-300 bg-slate-25 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:scale-[1.02] transition-all overflow-hidden relative shadow-sm"
                  title="Click to customize company logotype"
                >
                  {logoOption === "preset" ? (
                    <div className="p-1 px-2 text-center">
                      <span className="text-[18px] mb-0.5 block font-serif">🏛️</span>
                      <span className="text-xs font-bold text-grey-600 uppercase tracking-tight block truncate w-20">{selectedPresetLogo}</span>
                    </div>
                  ) : logoOption === "text" ? (
                    <div className="bg-slate-900 text-white w-full h-full flex flex-col justify-center items-center p-1.5 font-bold">
                      <span className="text-[14px] leading-tight block uppercase text-center truncate w-20">{logoText}</span>
                    </div>
                  ) : customLogoUrl ? (
                    <img referrerPolicy="no-referrer" src={customLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-1.5 space-y-1">
                      <span className="text-xs font-black text-grey-400 block tracking-wider leading-tight">YOUR LOGO</span>
                      <span className="text-xs font-black text-grey-400 block tracking-wider leading-tight">HERE</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-slate-900/60 text-white text-xs font-black uppercase tracking-widest text-center py-0.5">
                    Modify ▾
                  </div>
                </button>

                {/* Logo dropdown popup editor */}
                {showLogoPanel && (
                  <div className="absolute right-0 mt-2 bg-white border border-grey-200 rounded-xl shadow-xl p-4 w-72 z-50 text-xs text-left animate-fade-in space-y-3">
                    <div className="flex items-center justify-between border-b border-grey-100 pb-1.5 mb-1">
                      <h4 className="font-bold text-grey-800">Customize Business Logo</h4>
                      <button onClick={() => setShowLogoPanel(false)} className="text-grey-400 font-bold hover:text-black">✕</button>
                    </div>

                    <div className="flex gap-1 border-b border-grey-100 pb-2">
                      {([
                        { id: "preset", icon: <Library className="w-3.5 h-3.5" />, label: "Presets" },
                        { id: "text", icon: <Type className="w-3.5 h-3.5" />, label: "Emblem" },
                        { id: "custom", icon: <Upload className="w-3.5 h-3.5" />, label: "Custom URL" }
                      ] as const).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setLogoOption(opt.id)}
                          className={`flex-1 text-center py-1 rounded font-bold border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                            logoOption === opt.id ? "bg-slate-900 text-white border-slate-900" : "border-grey-25 hover:bg-grey-50 text-grey-500"
                          }`}
                        >
                          {opt.icon}
                          <span className="text-xs">{opt.label}</span>
                        </button>
                      ))}
                    </div>

                    {logoOption === "preset" && (
                      <div className="space-y-1.5">
                        <span className="text-xs text-grey-400 font-bold uppercase tracking-wider block">Select Corporate Mockup</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {logoPresets.map((p) => (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => {
                                setSelectedPresetLogo(p.label);
                                setShowLogoPanel(false);
                              }}
                              className={`p-2 text-center border rounded-lg text-xs font-bold ${
                                selectedPresetLogo === p.label ? "border-blue-500 bg-blue-50 " : "border-grey-100 hover:bg-grey-25"
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {logoOption === "text" && (
                      <div className="space-y-1.5">
                        <span className="text-xs text-grey-450 font-bold uppercase tracking-wider block">Custom Emblem Letters</span>
                        <input
                          type="text"
                          max={15}
                          value={logoText}
                          onChange={(e) => setLogoText(e.target.value)}
                          className="w-full border border-grey-205 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => setShowLogoPanel(false)}
                          className="w-full bg-slate-900 text-white text-xs font-bold py-1.5 rounded"
                        >
                          Apply Emblem
                        </button>
                      </div>
                    )}

                    {logoOption === "custom" && (
                      <div className="space-y-1.5">
                        <span className="text-xs text-grey-455 font-bold uppercase tracking-wider block">Paste Digital Logo Image URL</span>
                        <input
                          type="text"
                          value={customLogoUrl}
                          onChange={(e) => setCustomLogoUrl(e.target.value)}
                          placeholder="https://example.com/logo.png"
                          className="w-full border border-grey-205 rounded p-1.5 text-xs text-blue-600 focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => setShowLogoPanel(false)}
                          className="w-full bg-slate-900 text-white text-xs font-bold py-1.5 rounded"
                        >
                          Apply URL
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Parameter Fields Row: Invoice No, Language, Currency (matches template layout of invoicely) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 rounded-xl bg-slate-50 border border-grey-200/50 text-xs">
              
              {/* Invoice No */}
              <div className="space-y-1.5">
                <span className="text-grey-500 font-bold tracking-wider block uppercase text-xs">Invoice No.</span>
                <div className="flex items-center border border-grey-200 bg-white rounded-lg px-2.5 py-2 hover:border-grey-300">
                  <span className="text-grey-400 font-bold font-mono mr-1">#</span>
                  <input
                    type="text"
                    value={invoiceIdNumber}
                    onChange={(e) => setInvoiceIdNumber(e.target.value)}
                    className="w-full font-mono font-bold text-grey-800 focus:outline-none"
                    placeholder="INV-56"
                  />
                </div>
              </div>

              {/* Language Selector */}
              <div className="space-y-1.5">
                <span className="text-grey-500 font-bold tracking-wider block uppercase text-xs">Language</span>
                <select
                  value={invoiceLanguage}
                  onChange={(e) => setInvoiceLanguage(e.target.value)}
                  className="w-full border border-grey-200 bg-white rounded-lg p-2 py-2 text-grey-700 hover:border-grey-300 focus:outline-none"
                >
                  <option value="English (US)">English (US)</option>
                  <option value="French (FR)">French (FR)</option>
                  <option value="Spanish (ES)">Spanish (ES)</option>
                  <option value="German (DE)">German (DE)</option>
                </select>
              </div>

              {/* Currency Selector */}
              <div className="space-y-1.5">
                <span className="text-grey-500 font-bold tracking-wider block uppercase text-xs">Currency</span>
                <select
                  value={invoiceCurrency}
                  onChange={(e) => setInvoiceCurrency(e.target.value)}
                  className="w-full border border-grey-200 bg-white rounded-lg p-2 py-2 text-grey-700 hover:border-grey-300 focus:outline-none font-bold"
                >
                  <option value="USD">United States Dollar - USD ($)</option>
                  <option value="EUR">Euro - EUR (€)</option>
                  <option value="GBP">Great Britain Pound - GBP (£)</option>
                  <option value="NGN">Nigerian Naira - NGN (₦)</option>
                </select>
              </div>
            </div>

            {/* Sender (From) & Recipient (To) columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1 border-b border-grey-50 pb-6 text-xs">
              
              {/* FROM Sender address block */}
              <div className="space-y-2 relative bg-slate-25/40 p-3 rounded-lg border border-grey-50">
                <div className="flex items-center justify-between pb-1 border-b border-grey-100">
                  <span className="text-grey-400 font-bold uppercase text-xs tracking-widest">From</span>
                  <button
                    onClick={() => setIsEditingFrom(!isEditingFrom)}
                    className="text-blue-500 hover:underline font-bold text-xs cursor-pointer"
                  >
                    {isEditingFrom ? "Done Editing" : "Edit Business Profile"}
                  </button>
                </div>

                {isEditingFrom ? (
                  <textarea
                    rows={4}
                    value={fromAddress}
                    onChange={(e) => setFromAddress(e.target.value)}
                    className="w-full text-xs border border-grey-200 rounded p-2 focus:ring-1 focus:ring-blue-500 font-mono text-grey-700"
                  />
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed text-grey-700 font-medium">{fromAddress}</p>
                )}
              </div>

              {/* TO Recipient address block */}
              <div className="space-y-2 bg-slate-25/40 p-3 rounded-lg border border-grey-50">
                <div className="flex items-center justify-between pb-1 border-b border-grey-100">
                  <span className="text-grey-400 font-bold uppercase text-xs tracking-widest">To</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate("add-client")}
                      className="text-blue-500 hover:underline font-bold text-xs"
                    >
                      New Client
                    </button>
                    <span>|</span>
                    <button
                      onClick={() => setIsEditingTo(!isEditingTo)}
                      className="text-blue-500 hover:underline font-bold text-xs"
                    >
                      {isEditingTo ? "Show dropdown" : "Manual Edit"}
                    </button>
                  </div>
                </div>

                {isEditingTo ? (
                  <textarea
                    rows={4}
                    value={clientManualDetails}
                    onChange={(e) => setClientManualDetails(e.target.value)}
                    className="w-full text-xs border border-grey-200 rounded p-2 focus:ring-1 focus:ring-blue-500 font-mono text-grey-700"
                    placeholder="Enter manual client name & address details..."
                  />
                ) : (
                  <div className="space-y-2">
                    <select
                      value={selectedClientId}
                      onChange={(e) => {
                        setSelectedClientId(e.target.value);
                        setClientManualDetails(""); // reset so effect recomputes
                      }}
                      className="w-full border border-grey-200 bg-white rounded p-1.5 focus:ring-0 focus:outline-none"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.businessName || "No Business Name"})
                        </option>
                      ))}
                    </select>
                    <p className="whitespace-pre-wrap leading-relaxed text-grey-600 font-medium text-xs bg-white p-2 rounded border border-grey-100">
                      {clientManualDetails}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Secondary Parameter row: Date, Due duration, PO reference */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
              
              {/* Date */}
              <div className="space-y-1.5">
                <span className="text-grey-500 font-bold uppercase tracking-wider text-xs">Date</span>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full border border-grey-200 rounded-lg p-2.5 bg-white text-grey-700 focus:outline-none"
                />
              </div>

              {/* Invoice Due Selection */}
              <div className="space-y-1.5">
                <span className="text-grey-500 font-bold uppercase tracking-wider text-xs">Invoice Due</span>
                <div className="flex items-center gap-2">
                  <select
                    value={dueTerms}
                    onChange={(e) => {
                      setDueTerms(e.target.value);
                      // Auto offset date
                      const offsetDays = e.target.value === "Net 15" ? 15 : e.target.value === "Net 30" ? 30 : 0;
                      const dateObj = new Date(issueDate);
                      dateObj.setDate(dateObj.getDate() + offsetDays);
                      setDueDate(dateObj.toISOString().split('T')[0]);
                    }}
                    className="w-full border border-grey-200 bg-white rounded-lg p-2.5 text-grey-700"
                  >
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 15">Net 15 (15 days)</option>
                    <option value="Net 30">Net 30 (30 days)</option>
                  </select>
                </div>
              </div>

              {/* Purchase Order Number */}
              <div className="space-y-1.5">
                <span className="text-grey-500 font-bold uppercase tracking-wider text-xs">Purchase Order Number</span>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full border border-grey-200 rounded-lg p-2.5 bg-white text-grey-700 focus:outline-none"
                  placeholder="e.g. PO-892"
                />
              </div>
            </div>

            {/* Line items Section Sheet */}
            <div className="space-y-4 pt-4 border-t border-grey-100" id="editorial-form-line-items">
              <label className="text-xs font-black text-grey-900 block uppercase tracking-wide">Statement Entries</label>

              {/* Table list resembling screenshot */}
              <div className="space-y-3" id="items-draggable-canvas">
                {lineItems.map((item, index) => (
                  <div 
                    key={item.id}
                    className="p-4 bg-slate-25 border border-grey-150 rounded-xl relative hover:border-grey-300 transition-colors space-y-3"
                  >
                    {/* Upper row: Drag grip, description, qty, rate, subtotal, trash */}
                    <div className="flex items-start gap-3">
                      
                      {/* Drag dot Gripper element */}
                      <div className="text-grey-300 cursor-grab active:cursor-grabbing font-mono pt-2 text-sm select-none" title="Drag row anchor">
                        ⠿
                      </div>

                      {/* Description Input */}
                      <div className="flex-1">
                        <textarea
                          placeholder="Item Name & Description"
                          rows={2}
                          value={item.description}
                          onChange={(e) => handleUpdateLineItem(item.id, "description", e.target.value)}
                          className="w-full border-b border-grey-200 hover:border-grey-300 focus:border-blue-500 focus:outline-none text-xs text-grey-800 bg-transparent resize-none leading-relaxed transition-colors font-medium"
                        />
                      </div>

                      {/* Quantity Input */}
                      <div className="w-16">
                        <input
                          type="number"
                          placeholder="0.00"
                          min="1"
                          value={item.qty}
                          onChange={(e) => handleUpdateLineItem(item.id, "qty", Number(e.target.value))}
                          className="w-full text-center border-b border-grey-200 hover:border-grey-300 focus:border-blue-500 focus:outline-none text-xs p-1 pt-1.5 font-sans"
                        />
                      </div>

                      {/* Unit Price Rate Input */}
                      <div className="w-24 flex items-center border-b border-grey-200 hover:border-grey-300 focus-within:border-blue-500 transition-colors">
                        <span className="text-grey-400 font-bold mr-0.5 text-xs select-none">{activeSymbol}</span>
                        <input
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateLineItem(item.id, "unitPrice", Number(e.target.value))}
                          className="w-full text-right focus:outline-none text-xs p-1 pt-1.5 font-mono"
                        />
                      </div>

                      {/* line total calculation */}
                      <div className="w-24 text-right pt-2 font-mono text-xs font-bold text-grey-900 select-none">
                        {activeSymbol}{item.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>

                      {/* Cog and Trash Buttons */}
                      <div className="flex items-center gap-1.5 pt-1.5 relative">
                        <button
                          onClick={() => setActiveCogLineId(activeCogLineId === item.id ? null : item.id)}
                          className="p-1 rounded text-grey-400 hover:text-grey-700 hover:bg-grey-100 cursor-pointer"
                          title="Line settings"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteLineItem(item.id)}
                          className="p-1 rounded text-grey-300 hover:text-red-650 hover:bg-white cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Line configuration dropdown menu overlay */}
                        {activeCogLineId === item.id && (
                          <div className="absolute right-0 mt-6 top-2 bg-white border border-grey-200 rounded-xl shadow-xl p-3 w-56 z-40 text-left space-y-2 text-xs">
                            <p className="font-extrabold text-grey-400 uppercase tracking-wider border-b border-grey-50 pb-1">Line settings</p>
                            
                            {/* Unit selector */}
                            <div className="space-y-1">
                              <span className="font-semibold text-grey-500">Unit Label</span>
                              <select
                                value={item.unit}
                                onChange={(e) => {
                                  handleUpdateLineItem(item.id, "unit", e.target.value);
                                  setActiveCogLineId(null);
                                }}
                                className="w-full bg-slate-50 border border-grey-250 rounded p-1"
                              >
                                <option value="Unit">Unit (Individual item)</option>
                                <option value="Hour">Hour (Time billing)</option>
                                <option value="Day">Day (Consulting block)</option>
                                <option value="Month">Month (Retainer tier)</option>
                                <option value="Job">Job (Complete milestone)</option>
                              </select>
                            </div>

                            <button
                              onClick={() => {
                                handleDuplicateLineItem(item);
                                setActiveCogLineId(null);
                              }}
                              className="w-full py-1 text-center font-bold text-blue-600 bg-blue-50 hover:bg-blue-100/30 rounded"
                            >
                              Duplicate row
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Lower Sub-bar: Duplicate, Calendar, Link, Attachment file picker, Pencil icons directly beneath descriptions */}
                    <div className="flex items-center gap-4 text-grey-400 text-xs pl-7 select-none border-t border-grey-100/50 pt-1">
                      
                      {/* Copy icon */}
                      <button 
                        onClick={() => handleDuplicateLineItem(item)}
                        className="hover:text-grey-700 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Duplicate quickly"
                      >
                        <Copy className="w-3 h-3" />
                        <span className="text-xs font-bold">Copy</span>
                      </button>

                      {/* Date details */}
                      <div className="hover:text-grey-700 flex items-center gap-1 cursor-default" title="Apply billing period">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs font-bold">Billing Date</span>
                      </div>

                      {/* Link */}
                      <div className="hover:text-grey-700 flex items-center gap-1 cursor-default" title="Insert tracking hyperlink">
                        <Link className="w-3 h-3" />
                        <span className="text-xs font-bold">Link</span>
                      </div>

                      {/* Attachment simulator */}
                      <label className="hover:text-grey-700 flex items-center gap-1 cursor-pointer transition-colors" title="Attach design proof document">
                        <Paperclip className="w-3 h-3" />
                        <span className="text-xs font-bold">Attachment</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={() => alert("Simulation: Document proof successfully attached back to line item!")} 
                        />
                      </label>

                      {/* Pencil markup notes */}
                      <button 
                        onClick={() => {
                          const customNote = prompt("Enter manual specification override for billing line:");
                          if (customNote) {
                            handleUpdateLineItem(item.id, "description", `${item.description}\n[SPEC OVERRIDE] ${customNote}`);
                          }
                        }}
                        className="hover:text-grey-700 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Inject specification details"
                      >
                        <Pencil className="w-3 h-3" />
                        <span className="text-xs font-bold">Specification</span>
                      </button>

                      {/* Unit type indicator */}
                      <div className="ml-auto flex items-center gap-1">
                        <span className="text-xs text-grey-400 font-extrabold uppercase">Unit:</span>
                        <span className="text-xs bg-slate-100 text-grey-700 px-2 py-0.5 rounded-md border border-grey-200 font-sans font-bold select-none">{item.unit || "Unit"}</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* "+ New Line ▾" button mimicking invoicely styled split block */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  id="btn-new-line"
                  type="button"
                  onClick={handleAddLineItem}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white hover:bg-black rounded-lg text-xs font-bold cursor-pointer transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Line</span>
                </button>

                <button
                  id="btn-import-from-library"
                  type="button"
                  onClick={() => setIsLibraryOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 border border-grey-200 text-grey-600 hover:text-black hover:bg-grey-50 rounded-lg text-xs font-bold cursor-pointer select-none transition-colors"
                  title="Choose from workspace catalog"
                >
                  <Library className="w-3.5 h-3.5 text-grey-400" />
                  <span>Library Products</span>
                </button>
              </div>

            </div>

            {/* Calculations summaries aligned correctly */}
            <div className="pt-6 border-t border-grey-100 flex flex-col items-end space-y-4" id="form-calculation-breakdown-pane">
              
              <div className="w-80 space-y-3 text-xs">
                
                {/* Sub Total */}
                <div className="flex justify-between items-center text-grey-500">
                  <span className="font-semibold">Sub Total</span>
                  <span className="font-bold text-grey-900 font-mono text-sm">{activeSymbol}{subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>

                {/* VAT Tax interactive input */}
                <div className="pt-2 border-t border-grey-50/50 flex flex-col gap-2 bg-slate-25 p-2.5 rounded-xl border border-grey-105">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={hasTax}
                        onChange={(e) => setHasTax(e.target.checked)}
                        className="rounded border-grey-300 text-blue-500 focus:ring-blue-400 w-4 h-4"
                      />
                      <span className="font-bold text-grey-800 text-xs uppercase tracking-wider">Apply VAT Tax</span>
                    </div>
                    {hasTax && (
                      <div className="flex items-center gap-1 font-mono">
                        <input
                          type="number"
                          value={taxRate}
                          step="0.1"
                          onChange={(e) => setTaxRate(Number(e.target.value))}
                          className="w-10 text-right font-bold border-b border-grey-300 focus:outline-none focus:border-blue-500 p-0 text-xs"
                        />
                        <span className="text-grey-600 font-bold">%</span>
                      </div>
                    )}
                  </label>
                  {hasTax && (
                    <div className="flex justify-between items-center text-xs text-grey-450 font-medium pl-5">
                      <span>Calculated Tax ({taxRate}%):</span>
                      <span className="font-bold font-mono">{activeSymbol}{taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>

                {/* Total (USD/EUR etc) of Invoice layout */}
                <div className="flex justify-between items-center pt-3 border-t border-grey-200">
                  <span className="font-black text-grey-800 uppercase tracking-wider text-xs">Total ({invoiceCurrency})</span>
                  <span className="font-black text-grey-900 font-sans text-base">{activeSymbol}{grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>

                {/* Balance input / Already Paid */}
                <div className="pt-2 flex flex-col gap-2 border-b border-grey-50 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-grey-500 font-medium text-xs">Amount Already Paid</span>
                    <div className="flex items-center border border-grey-200 bg-white rounded px-1.5 py-0.5 max-w-[100px] hover:border-grey-300">
                      <span className="text-grey-400 font-bold mr-0.5 font-mono">{activeSymbol}</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(Number(e.target.value))}
                        className="w-full text-right focus:outline-none font-mono font-bold text-grey-700 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Balance Block matches physical visual balance calculation in screenshot */}
                <div className="p-3.5 bg-blue-50/20 border border-grey-200 rounded-xl flex items-center justify-between text-xs font-bold leading-none">
                  <div className="space-y-1">
                    <span className="text-grey-500 block">Balance Due ({invoiceCurrency})</span>
                    <span className="text-xs text-grey-400 font-bold leading-none block uppercase tracking-wider">OUTSTANDING LIABILITY</span>
                  </div>
                  <span className="font-mono text-base font-extrabold text-blue-600">
                    {activeSymbol}{balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Rows of adjustment icons: discount icon, tax icon, print layout */}
                <div className="flex items-center justify-end gap-3.5 pt-2 text-grey-400 select-none">
                  <button 
                    onClick={() => {
                      const discount = prompt("Add special flat discount amount:");
                      if (discount) setPaidAmount(p => p + Number(discount));
                    }}
                    className="hover:text-blue-500 cursor-pointer flex items-center gap-1"
                    title="Add manual discount"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">Discount</span>
                  </button>

                  <button 
                    onClick={() => setHasTax(!hasTax)}
                    className="hover:text-blue-500 cursor-pointer flex items-center gap-1"
                    title="Toggle tax state variables"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">Taxes</span>
                  </button>

                  <button 
                    onClick={triggerNativeIframePrint}
                    className="hover:text-grey-900 cursor-pointer flex items-center gap-1"
                    title="Print draft worksheet"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">Print</span>
                  </button>

                  <span>|</span>

                  <button 
                    onClick={() => alert("Redirecting back to tax ledger details...")}
                    className="text-blue-500 hover:text-blue-600 hover:underline cursor-pointer font-bold text-xs"
                  >
                    Manage Default Taxes
                  </button>
                </div>

              </div>

            </div>

            {/* Invoicing terms note block */}
            <div className="pt-6 border-t border-grey-100 space-y-2 text-xs" id="invoice-terms-notes-box">
              <label className="text-xs font-bold text-grey-500 block uppercase tracking-wider">Invoice Note (Default Note)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full text-xs font-medium text-grey-700 bg-slate-25 hover:bg-slate-50 border border-grey-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-xl p-3.5 transition-colors leading-relaxed"
                placeholder="Include localized payment terms, bank swift accounts, and corporate compliance notations..."
              />
            </div>

            {/* Bottom contact disclosures */}
            <div className="pt-4 border-t border-grey-50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-grey-450">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs uppercase tracking-wider text-grey-450">{emailFooter}</span>
                <button
                  onClick={() => {
                    const email = prompt("Update payment inquiries contact address:", emailFooter.replace("Email: ", ""));
                    if (email) setEmailFooter(`Email: ${email}`);
                  }}
                  className="text-blue-500 hover:underline font-bold text-xs"
                >
                  Edit Default Footer
                </button>
              </div>

              <button
                type="button"
                onClick={() => alert("Mock actions panel: Configure default templates of email deliveries.")}
                className="text-slate-700 hover:text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-1 self-start"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Invoice Settings, Payment & Delivery</span>
              </button>
            </div>

          </div>

          {/* Right Column Layout: In-Situ Real-time Preview Pane with Auto Updates (Perfect SaaS style) */}
          <div className="xl:col-span-4 space-y-6" id="designer-sidebar-preview">
            
            {/* Quick action checklist info box */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-xl p-5 border border-slate-700 space-y-3.5 shadow-lg select-none">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                <h3 className="font-black tracking-tight text-white font-sans text-sm">Interactive PDF Preview</h3>
              </div>
              
              <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                Changes applied inside the editor synchronize instantly on our vectors below. Click "Preview Mode" at header for complete configuration tools.
              </p>
 
              {/* Progress checklist indicator */}
              <div className="space-y-2 border-t border-slate-700/85 pt-3 text-xs font-sans">
                <div className="flex items-center gap-2.5 text-green-400 font-semibold">
                  <CheckSquare2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Interactive Address Fields aligned</span>
                </div>
                <div className="flex items-center gap-2.5 text-green-400 font-semibold">
                  <CheckSquare2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Dynamic Currency exchange reactive</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300 font-medium">
                  <RefreshCw className="w-3.5 h-3.5 shrink-0 animate-spin text-blue-400" />
                  <span>Draft rendered as digital A4 vector</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(true)}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 justify-center rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transform hover:scale-[1.01] active:translate-y-0.5 transition-all text-center"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Toggle Fullscreen PDF</span>
                </button>
              </div>
            </div>

            {/* Minimap Card Sheet: Displays mini live view of compiling PDF */}
            <div className="bg-white rounded-xl border border-grey-200/60 p-5 shadow-sm space-y-4" id="minimap-document">
              <span className="text-xs font-black tracking-widest uppercase text-grey-450 block border-b border-grey-50 pb-1.5 select-none">
                Mini Livestream Renderer
              </span>

              {/* Document mini facsimile */}
              <div className="bg-slate-50 rounded-lg p-3.5 border border-grey-100 text-xs font-sans text-grey-700 space-y-3 select-none scale-[0.98] origin-top">
                <div className="flex justify-between items-center pb-2 border-b border-grey-100">
                  <span className="font-black text-grey-900">{invoiceTitle || "Invoice"}</span>
                  <span className="font-mono text-grey-500 font-black text-xs">{invoiceIdNumber || "INV-1"}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs leading-relaxed">
                  <div>
                    <span className="text-xs text-grey-400 font-bold block uppercase">Client To:</span>
                    <span className="block truncate font-bold text-grey-800">{clients.find(c => c.id === selectedClientId)?.name || "Select Client"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-grey-400 font-bold block uppercase">Date Due:</span>
                    <span className="block text-grey-800">{dueDate}</span>
                  </div>
                </div>

                <div className="border-t border-grey-100 pt-2 space-y-1">
                  <span className="text-xs text-grey-400 font-bold block uppercase">Items Overview</span>
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs font-medium leading-none py-0.5">
                      <span className="truncate w-32">{item.description || "Empty statement line"}</span>
                      <span className="font-mono">{activeSymbol}{item.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-grey-100 pt-2 flex justify-between font-bold text-grey-900 text-xs">
                  <span>Total Due</span>
                  <span className="font-sans font-black text-blue-600">{activeSymbol}{grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Automation parameters configuration panel */}
            <div className="bg-white rounded-xl border border-grey-200/60 p-5 shadow-sm space-y-4 font-secondary" id="form-sidebar-escalations">
              <span className="text-xs font-black tracking-widest uppercase text-grey-450 block border-b border-grey-50 pb-1.5 select-none">
                Auto-Nudge Delivery Specs
              </span>

              <div className="space-y-3.5 text-xs text-left">
                {/* Tone templates selection */}
                <div className="space-y-1.5">
                  <span className="text-grey-400 font-bold block uppercase text-xs tracking-widest">Nudge Tone Layout</span>
                  <div className="flex items-center gap-1" id="tone-templates-list">
                    {(["Friendly", "Firm", "Final Notice"] as const).map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => setMessageTemplate(tone)}
                        className={`flex-1 text-center py-2 border rounded-lg font-bold transition-all text-xs cursor-pointer ${
                          messageTemplate === tone
                            ? "border-blue-500 bg-blue-50/50 text-blue-600 focus:outline-none"
                            : "border-grey-200 text-grey-500 hover:bg-grey-25"
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2 quick status checklist variables */}
                <div className="space-y-2 pt-2 border-t border-grey-50">
                  <span className="text-grey-400 font-bold block uppercase text-xs tracking-widest">Active auto-sequence dispatches</span>
                  
                  <label className="flex items-center gap-2 cursor-pointer py-0.5">
                    <input
                      type="checkbox"
                      checked={reminders.before3Days}
                      onChange={(e) => setReminders({ ...reminders, before3Days: e.target.checked })}
                      className="rounded border-grey-300 text-blue-500 focus:ring-blue-400 w-3.5 h-3.5"
                    />
                    <span className="text-grey-600 text-xs font-medium">3 days priority due friendly alert</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer py-0.5">
                    <input
                      type="checkbox"
                      checked={reminders.onDueDate}
                      onChange={(e) => setReminders({ ...reminders, onDueDate: e.target.checked })}
                      className="rounded border-grey-300 text-blue-500 focus:ring-blue-400 w-3.5 h-3.5"
                    />
                    <span className="text-grey-600 text-xs font-medium">Auto dispatch invoice on due hour</span>
                  </label>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/*==========================================================
        PORTABLE HIGH-FIDELITY PRODUCT SELECTOR LIBRARY OVERLAY
       ===========================================================*/}
      <ProductLibrary
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectProduct={handleSelectLibraryItem}
      />

      {/*==========================================================
        PROGRESS METEOR DIALOG OVERLAY (DURING PDF COMPILE WORKFLOW)
       ===========================================================*/}
      {downloadStep !== "idle" && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 select-none">
          <div className="bg-white rounded-3xl border border-slate-700/60 p-8 max-w-sm w-full text-center space-y-5 shadow-2xl animate-scale-up">
            
            {/* Spinning/progress logo block */}
            <div className="flex justify-center relative">
              <div className="relative w-16 h-16 rounded-full border-4 border-slate-100 flex items-center justify-center bg-slate-50">
                <FileText className={`w-7 h-7 ${downloadStep === "success" ? "text-green-500" : "text-blue-500 animate-pulse"}`} />
                {downloadStep !== "success" && (
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                )}
              </div>
            </div>

            {/* Stepper detail notices */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                {downloadStep === "preparing" && "Preparing graphics canvas"}
                {downloadStep === "bundling" && "Assembling vector packages"}
                {downloadStep === "signing" && "Encrypting PDF signature"}
                {downloadStep === "assembling" && "Writing file stream parameters"}
                {downloadStep === "success" && "Success! PDF Delivered"}
              </h3>
              
              <p className="text-xs text-slate-400 leading-relaxed font-secondary">
                {downloadStep === "preparing" && "Measuring layout, mapping Margins and Paper dimensions..."}
                {downloadStep === "bundling" && "Checking font family maps, SVG structures, and inline color palettes..."}
                {downloadStep === "signing" && "Applying Victory Owoeye cryptographic metadata check to document..."}
                {downloadStep === "assembling" && "Structuring binary file stream and headers for browser downloads..."}
                {downloadStep === "success" && "Vector document correctly compiled and directed back to your downloads folder!"}
              </p>
            </div>

            {/* Animated progress indicator slider */}
            <div className="space-y-1">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${downloadStep === "success" ? "bg-green-500" : "bg-blue-500"}`} 
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>COMPILING SOURCE</span>
                <span>{downloadProgress}%</span>
              </div>
            </div>

            {/* Quick success sign */}
            {downloadStep === "success" && (
              <div className="bg-green-50/50 text-green-700 font-bold p-2 text-xs rounded-xl border border-green-100 flex items-center justify-center gap-1.5 animate-bounce">
                <Check className="w-4 h-4" />
                <span>Download started! Check browser file list.</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
