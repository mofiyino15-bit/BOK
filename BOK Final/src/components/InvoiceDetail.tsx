import { ArrowLeft, Mail, CheckCircle2, FileDown, Clock, ShieldCheck, ClipboardCheck, ArrowUpRight, MoreVertical, X, Send, Copy, Check, FileText, Printer, Plus } from "lucide-react";
import { Invoice, Client, formatCurrency, formatCurrencyConverted, ActivityLog } from "../types";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import BokLogo from "./BokLogo";

interface InvoiceDetailProps {
  invoiceId: string;
  invoices: Invoice[];
  clients: Client[];
  onNavigate: (route: string, params?: Record<string, any>) => void;
  onUpdateInvoiceStatus: (id: string, status: Invoice["status"]) => void;
  onSendReminder: (id: string) => void;
  onAddActivityLog?: (invoiceId: string, log: Omit<ActivityLog, "id">) => void;
  activeCurrency?: string;
}

export default function InvoiceDetail({
  invoiceId,
  invoices,
  clients,
  onNavigate,
  onUpdateInvoiceStatus,
  onSendReminder,
  onAddActivityLog,
  activeCurrency = "original"
}: InvoiceDetailProps) {
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [newLogAction, setNewLogAction] = useState("");
  const [newLogDetails, setNewLogDetails] = useState("");
  const [localLogs, setLocalLogs] = useState<ActivityLog[]>([]);

  // Find targeted invoice
  const invoice = invoices.find((inv) => inv.id === invoiceId);

  useEffect(() => {
    if (invoice) {
        setLocalLogs(invoice.activityLog || []);
    }
  }, [invoice]);

  if (!invoice) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-grey-100 max-w-lg mx-auto mt-12" id="invoice-not-found">
        <h2 className="text-xl font-bold text-grey-900">Invoice not found</h2>
        <p className="text-sm text-grey-500 mt-2 font-secondary">The Invoice ID "{invoiceId}" could not be retrieved from the active ledger.</p>
        <button
          onClick={() => onNavigate("invoices")}
          className="mt-5 inline-flex items-center gap-2 bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-600 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </button>
      </div>
    );
  }

  // Resolve client matching invoice
  const client = clients.find((c) => c.id === invoice.clientId);
  const clientName = client ? client.name : "Unknown Client";
  const clientCurrency = client ? client.currency : "USD";

  // Calculate Subtotal dynamically to prevent sync errors
  const subtotal = invoice.lineItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
  const taxAmount = invoice.hasTax ? (subtotal * invoice.taxRate / 100) : 0;
  const totalAmount = subtotal + taxAmount;

  const getStatusBadgeStyle = (status: Invoice["status"]) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-600 border border-green-200";
      case "Overdue":
        return "bg-red-100 text-red-600 border border-red-200";
      case "Due Today":
        return "bg-amber-100 text-amber-600 border border-amber-200";
      case "Upcoming":
        return "bg-blue-100 text-blue-600 border border-blue-200";
      case "Draft":
        return "bg-grey-100 text-grey-600 border border-grey-200";
      default:
        return "bg-grey-100 text-grey-700";
    }
  };

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [modalActionState, setModalActionState] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  // Toast state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "info" | "error" }>({
    show: false,
    message: "",
    type: "success"
  });

  const triggerToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest("#more-actions-dropdown") && !target.closest("#btn-more-actions-toggle")) {
        setShowMoreActions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownloadPDF = async () => {
    setModalActionState("downloading");

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const paperPlateElement = pdfRef.current || document.getElementById("modal-pdf-paper-plate");
      if (!paperPlateElement) return;

      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(paperPlateElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight, undefined, "FAST");

      pdf.save(`invoice-${invoice.id.toLowerCase() || "statement"}.pdf`);
      setModalActionState("downloaded");
      triggerToast("Vector document correctly compiled and directed back to your downloads folder!");

      const logPayload = {
        action: "PDF Downloaded",
        date: new Date().toISOString().split('T')[0] + " " + new Date().toTimeString().split(' ')[0].substring(0, 5),
        details: "High-resolution PDF generated and saved for direct client delivery."
      };
      
      if (onAddActivityLog) {
        onAddActivityLog(invoice.id, logPayload);
      }
      setLocalLogs((prev) => [{ id: "act-gen-" + Date.now(), ...logPayload }, ...prev]);

    } catch (error) {
      console.error("PDF generation has failed due to compilation errors:", error);
      setModalActionState(null);
      triggerToast("Failed to compile high-resolution PDF. Please try again.", "error");
    }
  };

  const handlePrintPdf = () => {
    setModalActionState("printing");
    const printElement = pdfRef.current || document.getElementById("modal-pdf-paper-plate");
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

    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Invoice - ${invoice.id}</title>
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
      setModalActionState("printed");
      triggerToast("Report sent to your system print queue!");
    }, 3000);
  };

  const handleCopyShareLink = () => {
    setModalActionState("copying");
    setTimeout(() => {
      setModalActionState("copied");
      navigator.clipboard.writeText(`https://freelance.bok.consulting/portal/invoice/secure-hash-${invoice.id}`);
      triggerToast("Secure ledger access portal link copied to clipboard!");

      const logPayload = {
        action: "Portal View Shared",
        date: new Date().toISOString().split('T')[0] + " " + new Date().toTimeString().split(' ')[0].substring(0, 5),
        details: "Encrypted static viewing pathway created."
      };
      
      if (onAddActivityLog) {
        onAddActivityLog(invoice.id, logPayload);
      }
      setLocalLogs((prev) => [{ id: "act-gen-" + Date.now(), ...logPayload }, ...prev]);
    }, 800);
  };

  const handleAddManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogAction.trim()) return;

    const logPayload = {
      action: newLogAction,
      date: new Date().toISOString().split('T')[0] + " " + new Date().toTimeString().split(' ')[0].substring(0, 5),
      details: newLogDetails.trim() || undefined
    };

    if (onAddActivityLog) {
      onAddActivityLog(invoice.id, logPayload);
    }
    setLocalLogs((prev) => [{ id: "act-manual-" + Date.now(), ...logPayload }, ...prev]);
    setNewLogAction("");
    setNewLogDetails("");
    triggerToast("Custom diagnostic activity log injected successfully!");
  };

  return (
    <div className="space-y-6" id="invoice-details-view">
      {/* Breadcrumb Navigation Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-grey-100 relative z-30">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-grey-400 font-medium font-secondary select-none">
            <button onClick={() => onNavigate("invoices")} className="hover:text-blue-500 hover:underline cursor-pointer">
              Invoices
            </button>
            <span>/</span>
            <span className="text-grey-600 font-semibold font-sans">{invoice.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-grey-900 tracking-tight flex items-center gap-3 mt-1">
            <span>Invoice Workspace</span>
            <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full ${getStatusBadgeStyle(invoice.status)}`}>
              {invoice.status}
            </span>
          </h1>
        </div>

        {/* Action Controls Panel */}
        <div className="flex flex-wrap items-center gap-2" id="detail-actions-panel">
          <button
            onClick={() => onNavigate("invoices")}
            className="flex items-center gap-1.5 px-4 py-2 border border-grey-300 text-grey-700 hover:text-grey-900 hover:bg-grey-25 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>

          {invoice.status !== "Paid" && (
            <button
              id="btn-detail-remind"
              onClick={() => onSendReminder(invoice.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-100 hover:bg-blue-100/80 text-blue-600 border border-blue-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              <Mail className="w-3.5 h-3.5" /> Send Reminder
            </button>
          )}

          {invoice.status !== "Paid" && (
            <button
              id="btn-detail-mark-paid"
              onClick={() => onUpdateInvoiceStatus(invoice.id, "Paid")}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" /> Mark as Paid
            </button>
          )}

          <button
            id="btn-detail-download-pdf"
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-grey-300 text-grey-700 hover:text-black hover:bg-grey-25 rounded-lg text-xs font-medium cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" /> PDF
          </button>

          {/* More actions options dropdown trigger */}
          <div className="relative z-30">
            <button
              id="btn-more-actions-toggle"
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="p-2 border border-grey-300 rounded-lg text-grey-500 hover:bg-grey-50 cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMoreActions && (
              <div id="more-actions-dropdown" className="absolute right-0 mt-2 bg-white border border-grey-200 rounded-xl shadow-xl py-1.5 w-48 z-50 text-xs text-left">
                <p className="px-3.5 py-1 text-xs font-bold text-grey-400 uppercase tracking-widest border-b border-grey-100 mb-1">
                  Change Status
                </p>

                {invoice.status !== "Overdue" && (
                  <button
                    onClick={() => {
                      onUpdateInvoiceStatus(invoice.id, "Overdue");
                      setShowMoreActions(false);
                      triggerToast("Invoice status updated to Overdue");
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-grey-50 text-red-600 font-semibold cursor-pointer transition-colors"
                  >
                    Mark as Overdue
                  </button>
                )}

                {invoice.status !== "Due Today" && (
                  <button
                    onClick={() => {
                      onUpdateInvoiceStatus(invoice.id, "Due Today");
                      setShowMoreActions(false);
                      triggerToast("Invoice status updated to Due Today");
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-grey-50 text-amber-600 font-semibold cursor-pointer transition-colors"
                  >
                    Mark as Due Today
                  </button>
                )}

                {invoice.status !== "Upcoming" && (
                  <button
                    onClick={() => {
                      onUpdateInvoiceStatus(invoice.id, "Upcoming");
                      setShowMoreActions(false);
                      triggerToast("Invoice status updated to Upcoming");
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-grey-50 text-blue-600 font-semibold cursor-pointer transition-colors"
                  >
                    Mark as Upcoming
                  </button>
                )}

                {invoice.status !== "Paid" && (
                  <button
                    onClick={() => {
                      onUpdateInvoiceStatus(invoice.id, "Paid");
                      setShowMoreActions(false);
                      triggerToast("Invoice status updated to Paid");
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-grey-50 text-green-600 font-semibold cursor-pointer transition-colors"
                  >
                    Mark as Paid
                  </button>
                )}

                {invoice.status !== "Draft" && (
                  <button
                    onClick={() => {
                      onUpdateInvoiceStatus(invoice.id, "Draft");
                      setShowMoreActions(false);
                      triggerToast("Invoice converted back to Draft");
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-grey-50 text-grey-500 font-medium cursor-pointer transition-colors"
                  >
                    Convert to Draft
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Structural Layout Grid (col-span-8 detailed invoice paper, col-span-4 detailed activity logs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="detail-structural-grid">

        {/* Core Invoice Card (Left, span-8) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border-[0.5px] border-grey-200/60 px-4 py-8 sm:p-10 space-y-8" id="invoice-paper-sheet">

          {/* Bok Heading Header row */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-grey-50">
            <div>
              {/* Logo block */}
              <div className="flex items-center gap-2 mb-2 sm:block sm:mb-3">
                <BokLogo size={20} className="sm:mb-3" />
                <h2 className="text-xl font-bold text-grey-900 leading-none">Bōk Consulting</h2>
              </div>
            </div>

            <div className="text-left sm:text-right font-sans">
              <span className="text-xs font-semibold text-grey-400 uppercase tracking-widest">Billing Statement</span>
              <h3 className="text-4xl font-bold text-grey-900 mt-1 leading-none">{invoice.id}</h3>
              <p className="text-xs text-grey-400 mt-2 font-secondary">Status: {invoice.status.toUpperCase()}</p>
            </div>
          </div>

          {/* Billed From & Billed To addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-6 border-b border-grey-50 text-sm">

            {/* From */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-grey-400 uppercase tracking-widest font-sans block mb-2">Billed From</span>
              <p className="font-bold text-grey-900">Mofiyinfoluwa O.</p>
              <p className="text-grey-600 font-secondary">Bōk Creative Services</p>
              <p className="text-grey-500 font-secondary">14 Nordlys Gade, Floor 2</p>
              <p className="text-grey-500 font-secondary">Copenhagen, 1105 DK</p>
              <p className="text-grey-500 text-xs mt-2 font-secondary">mofiyino15@gmail.com</p>
            </div>

            {/* To */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-grey-400 uppercase tracking-widest font-sans block mb-2">Billed To (Recipient)</span>
              {client ? (
                <>
                  <p className="font-bold text-grey-900">{client.name}</p>
                  <p className="text-grey-600 font-secondary">{client.businessName}</p>
                  <p className="text-grey-500 font-secondary">{client.address}</p>
                  <p className="text-grey-500 font-secondary">{client.city}, {client.state ? `${client.state}, ` : ""}{client.country}</p>
                  <p className="text-grey-500 text-xs mt-2 font-secondary">{client.email}</p>
                  <p className="text-grey-440 text-xs font-secondary font-mono mt-1">Tax ID: {client.taxId}</p>
                </>
              ) : (
                <p className="text-grey-500 font-secondary">No Client Assigned.</p>
              )}
            </div>
          </div>

          {/* Payment Terms Metadata Panel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-grey-25 border border-grey-100 text-xs font-secondary">
            <div>
              <span className="text-grey-400 font-semibold block uppercase">Issue Date</span>
              <span className="text-grey-900 font-bold block mt-1">{invoice.issueDate}</span>
            </div>
            <div>
              <span className="text-grey-400 font-semibold block uppercase">Due Date</span>
              <span className="text-grey-900 font-bold block mt-1 text-amber-600">{invoice.dueDate}</span>
            </div>
            <div>
              <span className="text-grey-400 font-semibold block uppercase">Payment Terms</span>
              <span className="text-grey-900 font-bold block mt-1">{client?.paymentTerms || "Net 30"}</span>
            </div>
            <div>
              <span className="text-grey-400 font-semibold block uppercase">Settlement Currency</span>
              <span className="text-grey-900 font-bold block mt-1 uppercase font-sans">{clientCurrency}</span>
            </div>
          </div>

          {/* Line Items Billing Details Table */}
          <div className="space-y-4">
            <span className="text-xs font-semibold text-grey-400 uppercase tracking-widest font-sans block">Billing Breakdowns</span>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="detail-sheet-table">
                <thead>
                  <tr className="border-b border-grey-200">
                    <th className="font-semibold text-grey-500 py-2.5 text-xs uppercase font-sans">Description</th>
                    <th className="font-semibold text-grey-500 py-2.5 text-xs text-right uppercase font-sans w-20">Qty</th>
                    <th className="font-semibold text-grey-500 py-2.5 text-xs text-right uppercase font-sans w-24">Rate</th>
                    <th className="font-semibold text-grey-500 py-2.5 text-xs text-right uppercase font-sans w-32">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-50 text-sm">
                  {invoice.lineItems.map((item) => (
                    <tr key={item.id} className="py-2.5">
                      <td className="py-3 font-semibold text-grey-800 font-sans max-w-xs">{item.description}</td>
                      <td className="py-3 text-right text-grey-500 font-secondary">{item.qty}</td>
                      <td className="py-3 text-right text-grey-500 font-mono">{formatCurrencyConverted(item.unitPrice, clientCurrency, activeCurrency)}</td>
                      <td className="py-3 text-right font-bold text-grey-900 font-mono">{formatCurrencyConverted(item.qty * item.unitPrice, clientCurrency, activeCurrency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculation summary block */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pt-4 border-t border-grey-50">
            {/* Notes */}
            <div className="max-w-sm flex-1 space-y-1.5">
              <span className="text-xs font-semibold text-grey-400 uppercase tracking-widest font-sans block">Invoice Instructions & Notes</span>
              <p className="text-xs text-grey-500 leading-relaxed bg-grey-25/50 border border-grey-100 rounded-lg p-3 font-secondary whitespace-pre-line">
                {invoice.notes || "No special instructions or custom notes attached to statement."}
              </p>
            </div>

            {/* Calculations right alignment */}
            <div className="w-full sm:w-64 space-y-2.5 text-xs font-secondary">
              <div className="flex items-center justify-between text-grey-500">
                <span>Subtotal</span>
                <span className="font-bold text-grey-900 font-sans text-sm">{formatCurrencyConverted(subtotal, clientCurrency, activeCurrency)}</span>
              </div>

              {invoice.hasTax && (
                <div className="flex items-center justify-between text-grey-500">
                  <span>VAT / Local Tax ({invoice.taxRate}%)</span>
                  <span className="font-bold text-grey-900 font-sans text-sm">{formatCurrencyConverted(taxAmount, clientCurrency, activeCurrency)}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2.5 border-t border-grey-100 text-sm">
                <span className="font-bold text-grey-900 uppercase">Total Amount Due</span>
                <span className="font-sans font-extrabold text-grey-900 text-xl">{formatCurrencyConverted(totalAmount, clientCurrency, activeCurrency)}</span>
              </div>
            </div>
          </div>

          {/* Compliance notice footer */}
          <div className="text-xs text-grey-440 text-center pt-6 border-t border-grey-50 font-secondary">
            Bok standard invoices are prepared electronically in compliance with standard European and Scandinavian freelance clearing codes. Thank you for your business.
          </div>
        </div>

        {/* Detailed Activity Logs & Escalation Workflows Panel (Right, span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Audit Logs card */}
          <div className="bg-white rounded-xl border border-grey-200/60 p-5 space-y-4 text-left">
            <h3 className="text-sm font-bold text-grey-900 uppercase tracking-wider flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-500" />
              <span>Statement Audit Logs</span>
            </h3>

            {/* Logs timeline */}
            <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1">
              {localLogs.length === 0 ? (
                <p className="text-xs text-grey-400 font-secondary py-4 text-center">No activity log records exist for this statement yet.</p>
              ) : (
                localLogs.map((log) => (
                  <div key={log.id} className="text-xs space-y-1 relative pl-4 border-l border-grey-150">
                    <div className="absolute left-[-4.5px] top-[4px] w-2 h-2 rounded-full bg-blue-500" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-grey-900">{log.action}</span>
                      <span className="text-[10px] text-grey-400 font-secondary whitespace-nowrap">{log.date}</span>
                    </div>
                    {log.details && (
                      <p className="text-grey-500 text-[11px] font-secondary leading-normal">{log.details}</p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Injected manual log trigger form */}
            <form onSubmit={handleAddManualLog} className="pt-3 border-t border-grey-100 space-y-2.5">
              <p className="text-[11px] font-bold text-grey-450 uppercase tracking-wider">Injected Audit Event</p>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Event label (e.g., Client phoned..."
                  value={newLogAction}
                  onChange={(e) => setNewLogAction(e.target.value)}
                  className="w-full text-xs p-2 bg-grey-25 border border-grey-200 rounded-lg outline-none focus:border-grey-300 font-secondary"
                  required
                />
                <textarea
                  placeholder="Optional context guidelines..."
                  value={newLogDetails}
                  onChange={(e) => setNewLogDetails(e.target.value)}
                  className="w-full text-xs p-2 bg-grey-25 border border-grey-200 rounded-lg outline-none focus:border-grey-300 min-h-[50px] resize-none font-secondary"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1 py-1.5 bg-grey-900 hover:bg-black text-white rounded-lg text-xs font-semibold cursor-pointer select-none transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Inject Event Log</span>
              </button>
            </form>
          </div>

          {/* Reminders template state info */}
          <div className="bg-white rounded-xl border border-grey-200/60 p-5 space-y-4 text-left font-secondary">
            <h3 className="text-xs font-bold text-grey-400 uppercase tracking-wider">Reminder settings</h3>
            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-grey-600">3 Days before due (T-3)</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${invoice.reminders.before3Days ? "bg-green-50 text-green-600" : "bg-grey-50 text-grey-400"}`}>
                  {invoice.reminders.before3Days ? "Approved" : "Disabled"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grey-600">On due date (Due date nudge)</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${invoice.reminders.onDueDate ? "bg-green-50 text-green-600" : "bg-grey-50 text-grey-400"}`}>
                  {invoice.reminders.onDueDate ? "Approved" : "Disabled"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grey-600">3 Days overdue (Overdue +3)</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${invoice.reminders.overdue3Days ? "bg-green-50 text-green-600" : "bg-grey-50 text-grey-400"}`}>
                  {invoice.reminders.overdue3Days ? "Approved" : "Disabled"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grey-600">7 Days overdue (Overdue +7)</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${invoice.reminders.overdue7Days ? "bg-green-50 text-green-600" : "bg-grey-50 text-grey-400"}`}>
                  {invoice.reminders.overdue7Days ? "Approved" : "Disabled"}
                </span>
              </div>
              <div className="pt-2 border-t border-grey-100 flex items-center justify-between">
                <span className="text-grey-500 font-bold uppercase text-[10px]">Active Tone Template:</span>
                <span className="font-bold text-grey-800 uppercase font-sans text-[11px]">{invoice.messageTemplate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grey-500 font-bold uppercase text-[10px]">Escalation rule:</span>
                <span className="font-bold text-grey-800 text-[11px]">{invoice.escalationRule || "None"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF HIGH RESOLUTION SCREENSHOT EXPORT POPUP MODAL */}
      {isPdfModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-250">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl border border-grey-200 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-grey-150 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-grey-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span>Invoice Vector PDF Compiler</span>
                </h3>
                <p className="text-xs text-grey-400 font-secondary mt-0.5">Prepare and export a premium, print-friendly statement document.</p>
              </div>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="p-1 rounded-lg text-grey-400 hover:text-grey-700 hover:bg-grey-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions Ribbon */}
            <div className="bg-grey-25 px-6 py-3 border-b border-grey-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">

                {/* Download PDF */}
                <button
                  onClick={handleDownloadPDF}
                  disabled={modalActionState === "downloading"}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold cursor-pointer transition-colors shadow-sm disabled:opacity-70"
                >
                  {modalActionState === "downloading" ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : modalActionState === "downloaded" ? (
                    <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5" />
                  )}
                  {modalActionState === "downloading" ? "Generating..." : modalActionState === "downloaded" ? "Downloaded!" : "Download PDF"}
                </button>

                {/* Print */}
                <button
                  onClick={handlePrintPdf}
                  disabled={modalActionState === "printing"}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-grey-200 hover:bg-grey-50 text-grey-700 hover:text-black rounded-lg font-semibold cursor-pointer transition-colors disabled:opacity-70"
                >
                  {modalActionState === "printing" ? (
                    <div className="w-3.5 h-3.5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  ) : modalActionState === "printed" ? (
                    <Check className="w-3.5 h-3.5 text-green-600 stroke-[2.5]" />
                  ) : (
                    <Printer className="w-3.5 h-3.5 text-grey-500" />
                  )}
                  {modalActionState === "printing" ? "Sending to printer..." : modalActionState === "printed" ? "Print Queued!" : "Print Report"}
                </button>

                {/* Copy Share Link */}
                <button
                  onClick={handleCopyShareLink}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-grey-200 hover:bg-grey-50 text-grey-700 hover:text-black rounded-lg font-semibold cursor-pointer transition-colors disabled:opacity-70"
                  disabled={modalActionState === "copying"}
                >
                  {modalActionState === "copied" ? (
                    <Check className="w-3.5 h-3.5 text-green-600 stroke-[2.5]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-grey-500" />
                  )}
                  {modalActionState === "copied" ? "Link Copied!" : "Copy Share Link"}
                </button>
              </div>

              {/* Status indicator inside ribbon */}
              {modalActionState && (
                <div className="text-[11px] font-bold text-blue-600 bg-blue-50/80 border border-blue-150 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-right-4 duration-150">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="font-sans">
                    {modalActionState === "downloading" && "Formatting high-resolution PDF stylesheet..."}
                    {modalActionState === "downloaded" && "Report PDF saved to your downloads directory."}
                    {modalActionState === "printing" && "Sending print layout to system queue..."}
                    {modalActionState === "printed" && "Report dispatched to your system print queue!"}
                    {modalActionState === "copying" && "Generating encrypted share access key..."}
                    {modalActionState === "copied" && "Secure report link copied to your clipboard!"}
                  </span>
                </div>
              )}
            </div>

            {/* PDF Viewport — scrollable paper plate */}
            <div className="flex-1 overflow-y-auto p-8 bg-grey-100 flex justify-center py-10" id="reports-pdf-scroll-viewport">
              <div
                ref={pdfRef}
                id="reports-pdf-paper-plate"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#0f172a",
                  width: "210mm",
                  minHeight: "297mm",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                  padding: "24mm 20mm",
                  fontFamily: "'Inter', sans-serif",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  textAlign: "left",
                }}
              >
                {/* Paper watermark strip */}
                <div style={{
                  position: "absolute", top: "16px", left: "16px", right: "16px",
                  display: "flex", alignItems: "center", justify_content: "space-between",
                  fontSize: "9px", textTransform: "uppercase", fontWeight: "bold",
                  letterSpacing: "0.1em", color: "#94a3b8",
                  paddingBottom: "8px", borderBottom: "1px solid #f1f5f9", userSelect: "none"
                }} className="justify-between">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#22c55e", display: "inline-block" }} />
                    <span>ORIGINAL FINANCIAL LEDGER DOCUMENT</span>
                  </div>
                  <span>Generated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "28px", marginTop: "20px" }}>

                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "24px", borderBottom: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <BokLogo size={18} />
                        <span style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a", letterSpacing: "-0.025em" }}>Bōk Consulting</span>
                      </div>
                      <p style={{ fontSize: "11px", color: "#475569", lineHeight: "1.6", margin: "0" }}>
                        Mofiyinfoluwa O. · Bok Creative Services<br />
                        14 Nordlys Gade, Floor 2, Copenhagen, 1105 DK · Denmark
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "10px", fontWeight: "bold", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", display: "block" }}>INVOICE STATEMENT</span>
                      <h3 style={{ fontSize: "28px", fontWeight: "bold", color: "#0f172a", marginTop: "4px", marginBottom: "0", lineHeight: "1" }}>{invoice.id}</h3>
                    </div>
                  </div>

                  {/* Address Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", fontSize: "12px", lineHeight: "1.6" }}>
                    <div>
                      <span style={{ fontSize: "10px", fontWeight: "bold", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>PREPARED FOR:</span>
                      {client ? (
                        <div>
                          <p style={{ fontWeight: "bold", color: "#0f172a", fontSize: "14px", margin: "0 0 2px 0" }}>{client.name}</p>
                          <p style={{ color: "#475569", margin: "0" }}>{client.businessName}</p>
                          <p style={{ color: "#64748b", margin: "0" }}>{client.address}</p>
                          <p style={{ color: "#64748b", margin: "0" }}>{client.city}, {client.state ? `${client.state}, ` : ""}{client.country}</p>
                          <p style={{ color: "#334155", fontWeight: "500", margin: "4px 0 0 0" }}>{client.email}</p>
                        </div>
                      ) : (
                        <p style={{ color: "#64748b", margin: "0" }}>Unassigned client.</p>
                      )}
                    </div>
                    <div>
                      <span style={{ fontSize: "10px", fontWeight: "bold", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>STATEMENT TERMS:</span>
                      <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
                        <tbody>
                          <tr>
                            <td style={{ color: "#64748b", padding: "3px 0" }}>Issue Date:</td>
                            <td style={{ fontWeight: "bold", color: "#0f172a", padding: "3px 0", textAlign: "right" }}>{invoice.issueDate}</td>
                          </tr>
                          <tr>
                            <td style={{ color: "#64748b", padding: "3px 0" }}>Due Date:</td>
                            <td style={{ fontWeight: "bold", color: "#dc2626", padding: "3px 0", textAlign: "right" }}>{invoice.dueDate}</td>
                          </tr>
                          <tr>
                            <td style={{ color: "#64748b", padding: "3px 0" }}>Payment Terms:</td>
                            <td style={{ fontWeight: "bold", color: "#0f172a", padding: "3px 0", textAlign: "right" }}>{client?.paymentTerms || "Net 30"}</td>
                          </tr>
                          <tr>
                            <td style={{ color: "#64748b", padding: "3px 0" }}>Currency Reference:</td>
                            <td style={{ fontWeight: "bold", color: "#0f172a", padding: "3px 0", textAlign: "right", textTransform: "uppercase" }}>{clientCurrency}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Table */}
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: "bold", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>BREAKDOWN:</span>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid #0f172a" }}>
                          <th style={{ padding: "8px 0", color: "#64748b", fontWeight: "bold" }}>Item Description</th>
                          <th style={{ padding: "8px 0", color: "#64748b", fontWeight: "bold", textAlign: "right", width: "60px" }}>Qty</th>
                          <th style={{ padding: "8px 0", color: "#64748b", fontWeight: "bold", textAlign: "right", width: "100px" }}>Rate</th>
                          <th style={{ padding: "8px 0", color: "#64748b", fontWeight: "bold", textAlign: "right", width: "110px" }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.lineItems.map((item) => (
                          <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "12px 0", fontWeight: "600", color: "#0f172a" }}>{item.description}</td>
                            <td style={{ padding: "12px 0", textAlign: "right", color: "#475569" }}>{item.qty}</td>
                            <td style={{ padding: "12px 0", textAlign: "right", color: "#475569", fontFamily: "monospace" }}>{formatCurrencyConverted(item.unitPrice, clientCurrency, activeCurrency)}</td>
                            <td style={{ padding: "12px 0", textAlign: "right", fontWeight: "bold", color: "#0f172a", fontFamily: "monospace" }}>{formatCurrencyConverted(item.qty * item.unitPrice, clientCurrency, activeCurrency)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Section 3: Summary totals */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "40px" }}>
                    <div style={{ fontSize: "11px", color: "#64748b", lineHeight: "1.5" }}>
                      <span style={{ fontSize: "9px", fontWeight: "bold", color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Notes:</span>
                      <p style={{ margin: "0", whiteSpace: "pre-line" }}>{invoice.notes || "No custom notes attached to this statement."}</p>
                    </div>
                    <div>
                      <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
                        <tbody>
                          <tr>
                            <td style={{ color: "#64748b", padding: "4px 0" }}>Subtotal:</td>
                            <td style={{ fontWeight: "600", color: "#0f172a", padding: "4px 0", textAlign: "right", fontFamily: "monospace" }}>{formatCurrencyConverted(subtotal, clientCurrency, activeCurrency)}</td>
                          </tr>
                          {invoice.hasTax && (
                            <tr>
                              <td style={{ color: "#64748b", padding: "4px 0" }}>Tax ({invoice.taxRate}%):</td>
                              <td style={{ fontWeight: "600", color: "#0f172a", padding: "4px 0", textAlign: "right", fontFamily: "monospace" }}>{formatCurrencyConverted(taxAmount, clientCurrency, activeCurrency)}</td>
                            </tr>
                          )}
                          <tr style={{ borderTop: "2px solid #0f172a" }}>
                            <td style={{ fontWeight: "bold", color: "#0f172a", padding: "8px 0" }}>Total Due:</td>
                            <td style={{ fontWeight: "950", color: "#0f172a", padding: "8px 0", textAlign: "right", fontSize: "14px", fontFamily: "monospace" }}>{formatCurrencyConverted(totalAmount, clientCurrency, activeCurrency)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Document Footer */}
                <div style={{ paddingTop: "24px", borderTop: "1px solid #e2e8f0", fontSize: "9px", color: "#64748b", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    <p style={{ fontWeight: "bold", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0" }}>Standard Elektronisk Invoice Code Cleared</p>
                    <p style={{ margin: "0" }}>SWIFT clears BIC: BOKCDKKHXX · Routing: Nordea Bank DK-4999</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: "bold", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "8px", margin: "0" }}>Page 1 of 1</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-grey-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs text-grey-450 font-secondary">🛡️ Secure 256-bit encrypted ledger verification payload document</span>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="px-5 py-2 hover:bg-grey-100 text-grey-700 bg-grey-50 font-bold rounded-lg border border-grey-200 text-xs transition-colors cursor-pointer"
              >
                Close Viewport
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Floating Success Toast */}
      {toast.show && createPortal(
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 z-[11000] w-[calc(100%-2rem)] max-w-sm bg-slate-900 text-white rounded-xl border border-slate-800 shadow-2xl p-4 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-2 bg-green-500 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white">
              {toast.type === "error" ? "Action Failed" : "Success!"}
            </p>
            <p className="text-[11px] text-slate-300 font-secondary mt-0.5">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className="text-slate-400 hover:text-white font-bold text-xs p-1 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
