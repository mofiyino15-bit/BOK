import { useState } from "react";
import { ArrowLeft, Mail, FileText, Send, Clock, UserCheck, ShieldAlert, CheckCircle2, SlidersHorizontal, AlertCircle, PlusCircle, Bookmark } from "lucide-react";
import { Client, Invoice, formatCurrency, formatCurrencyConverted } from "../types";

interface ClientDetailProps {
  clientId: string;
  clients: Client[];
  invoices: Invoice[];
  onNavigate: (route: string, params?: Record<string, any>) => void;
  onSendReminder: (id: string) => void;
  activeCurrency?: string;
}

export default function ClientDetail({
  clientId,
  clients,
  invoices,
  onNavigate,
  onSendReminder,
  activeCurrency = "original"
}: ClientDetailProps) {
  const [activeTab, setActiveTab] = useState<"info" | "invoices" | "payments" | "reminders" | "notes">("info");
  const [newNoteText, setNewNoteText] = useState("");
  const [localNotes, setLocalNotes] = useState<string[]>([]);

  const client = clients.find((c) => c.id === clientId);

  if (!client) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-grey-100 max-w-lg mx-auto mt-12" id="client-not-found">
        <h2 className="text-xl font-bold text-grey-900">Client profile not found</h2>
        <p className="text-sm text-grey-500 mt-2 font-secondary">The specified Client record identifier could not be retrieved.</p>
        <button
          onClick={() => onNavigate("clients")}
          className="mt-5 inline-flex items-center gap-2 bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-600 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clients List
        </button>
      </div>
    );
  }

  // Calculate dynamic outstanding and totals
  const clientInvoices = invoices.filter((inv) => inv.clientId === client.id);
  const totalInvoiced = clientInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const outstandingInvoices = clientInvoices.filter((inv) => inv.status !== "Paid" && inv.status !== "Draft");
  const outstandingBalance = outstandingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidInvoices = clientInvoices.filter((inv) => inv.status === "Paid");

  // Collect activity reminders from log histories across all their invoices
  const reminderActivities = clientInvoices.flatMap((inv) => 
    inv.activityLog
      .filter((act) => act.action.includes("Reminder") || act.action.includes("Escalation"))
      .map((act) => ({ ...act, invoiceId: inv.id }))
  );

  const getRiskBadgeStyle = (risk: Client["riskLevel"]) => {
    switch (risk) {
      case "Reliable":
        return "bg-green-100 text-green-600 border border-green-200/50";
      case "Slow Payer":
        return "bg-amber-100 text-amber-800 border border-amber-200/50";
      case "At Risk":
        return "bg-red-100 text-red-650 border border-red-205/50";
      default:
        return "bg-grey-100 text-grey-500";
    }
  };

  const getBehavioralInsights = (risk: Client["riskLevel"]) => {
    switch (risk) {
      case "Reliable":
        return {
          delay: "Average payment delay: On time",
          delayColor: "text-green-600 bg-green-100",
          rate: "On-time payment rate: 95%",
          rateIconColor: "text-green-600 bg-green-100",
          remindersMsg: "Usually pays on initial statement",
          remindersColor: "text-blue-500 bg-blue-100/50",
          riskText: "Risk level: Low Clearance Threat",
          riskColor: "text-green-600 bg-green-100"
        };
      case "Slow Payer":
        return {
          delay: "Average payment delay: 5 days past due",
          delayColor: "text-amber-800 bg-amber-100/80",
          rate: "On-time payment rate: 43%",
          rateIconColor: "text-amber-800 bg-amber-100/80",
          remindersMsg: "Usually pays after 2 reminders",
          remindersColor: "text-blue-500 bg-blue-100/50",
          riskText: "Risk level: Medium Notice Risk",
          riskColor: "text-amber-800 bg-amber-100/80"
        };
      case "At Risk":
        return {
          delay: "Average payment delay: 24 days past due",
          delayColor: "text-red-650 bg-red-100",
          rate: "On-time payment rate: 12%",
          rateIconColor: "text-red-650 bg-red-100",
          remindersMsg: "Requires Escalation sequence rules",
          remindersColor: "text-red-650 bg-red-100",
          riskText: "Risk level: High Payment Risk",
          riskColor: "text-red-650 bg-red-100"
        };
      default:
        return {
          delay: "Average payment delay: 4 days",
          delayColor: "text-grey-500 bg-grey-50",
          rate: "On-time payment rate: 75%",
          rateIconColor: "text-grey-500 bg-grey-50",
          remindersMsg: "Usually pays of first nudge",
          remindersColor: "text-grey-500 bg-grey-50",
          riskText: "Risk level: Standard Payer",
          riskColor: "text-grey-500 bg-grey-50"
        };
    }
  };

  const insights = getBehavioralInsights(client.riskLevel);

  const handleAddNote = () => {
    if (newNoteText.trim() === "") return;
    setLocalNotes([...localNotes, newNoteText]);
    setNewNoteText("");
  };

  return (
    <div className="space-y-6" id="client-detail-viewport">
      
      {/* Breadcrumb back navigational row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-grey-100">
        <div>
          <div className="flex items-center gap-1 text-xs text-grey-400 font-medium font-secondary select-none">
            <button onClick={() => onNavigate("clients")} className="hover:text-blue-500 hover:underline cursor-pointer">
              Clients
            </button>
            <span>/</span>
            <span className="text-grey-600 font-semibold font-sans">{client.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-grey-900 tracking-tight mt-1 flex items-center gap-3">
            <span>Client Worksheet</span>
            <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${getRiskBadgeStyle(client.riskLevel)}`}>
              {client.riskLevel}
            </span>
          </h1>
        </div>

        {/* Global CTA Actions panel */}
        <div className="flex items-center gap-2" id="client-ctas">
          <button
            onClick={() => onNavigate("clients")}
            className="flex items-center gap-1.5 px-4 py-2 border border-grey-300 text-grey-700 hover:text-black hover:bg-grey-25 rounded-lg text-xs font-semibold cursor-pointer select-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          
          <button
            id="btn-client-invoice"
            onClick={() => onNavigate("create-invoice")}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" /> Send Invoice
          </button>
          
          <button
            id="btn-client-note"
            onClick={() => {
              setActiveTab("notes");
              document.getElementById("note-typing-box")?.focus();
            }}
            className="flex items-center gap-1.5 px-4 py-2 border border-grey-300 text-grey-700 hover:bg-grey-25 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-grey-400" /> Add Note
          </button>
        </div>
      </div>

      {/* Top detailed metadata card banner space */}
      <div className="bg-white rounded-xl border border-grey-200/60 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6" id="client-banner">
        <div>
          <h2 className="text-xl font-bold text-grey-900 leading-tight">{client.name}</h2>
          <p className="text-sm text-grey-500 font-secondary mt-1">{client.businessName} • {client.type} Category</p>
          <div className="flex flex-wrap items-center gap-4 text-xs mt-3 text-grey-500 font-secondary">
            <span>Email: <strong className="text-grey-800">{client.email}</strong></span>
            <span>Phone: <strong className="text-grey-800">{client.phone}</strong></span>
          </div>
        </div>

        <div className="text-left sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-grey-50 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
          <span className="text-xs uppercase font-semibold text-grey-400 tracking-wider font-sans block">
            <span className="hidden sm:inline">Outstanding Balance</span>
            <span className="sm:hidden block">
              Outstanding
              <p className="text-xs uppercase font-semibold text-grey-400 tracking-wider font-sans">Balance</p>
            </span>
          </span>
          <div className="flex flex-col items-end text-right">
            <h3 className={`text-3xl font-extrabold tracking-tight mt-1 leading-none ${outstandingBalance > 0 ? "text-amber-800" : "text-grey-400"}`}>
              {formatCurrencyConverted(outstandingBalance, client.currency, activeCurrency)}
            </h3>
            <p className="text-xs text-grey-400 mt-1 font-secondary">Cumulative billing: {formatCurrencyConverted(totalInvoiced, client.currency, activeCurrency)}</p>
          </div>
        </div>
      </div>

      {/* Grid workspace core layout: Left (7-col text details tabs), Right (5-col client insights) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="client-tabs-grid">
        
        {/* Left Side: Tabs content (col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-grey-200/60 flex flex-col p-6 min-h-[400px]" id="client-left-card">
          
          {/* Tabs navigations row */}
          <div className="flex border-b border-grey-100 text-left scrollbar-none overflow-x-auto" id="client-info-tabs">
            {(["info", "invoices", "payments", "reminders", "notes"] as const).map((tab) => (
              <button
                key={tab}
                id={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-4 text-sm font-semibold border-b-2 font-sans capitalize transition-colors cursor-pointer shrink-0 select-none ${
                    activeTab === tab
                    ? "border-blue-500 text-blue-650"
                    : "border-transparent text-grey-500 hover:text-grey-900"
                }`}
              >
                {tab === "info" ? "Company Info" : tab === "invoices" ? "Invoice History" : tab === "payments" ? "Receipt History" : tab === "reminders" ? "Reminders timeline" : "Internal Notes"}
              </button>
            ))}
          </div>

          {/* TAB 1: Company Info panels */}
          {activeTab === "info" && (
            <div className="space-y-6 pt-5" id="panel-info">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-left">
                
                {/* Billing Address block */}
                <div className="space-y-3 bg-grey-25 border border-grey-100 rounded-lg p-4 font-secondary">
                  <h4 className="font-bold text-grey-900 uppercase">Registered address</h4>
                  <div className="space-y-1 text-grey-600">
                    <p className="font-semibold text-grey-800">{client.address}</p>
                    <p>{client.city}, {client.state}</p>
                    <p>{client.country} — {client.postalCode}</p>
                  </div>
                </div>

                {/* Preference Billing setups */}
                <div className="space-y-3 bg-grey-25 border border-grey-100 rounded-lg p-4 font-secondary">
                  <h4 className="font-bold text-grey-900 uppercase">Settlement parameters</h4>
                  <div className="space-y-1.5">
                    <p className="text-grey-500">Contract Rate Currency: <strong className="text-grey-800">{client.currency}</strong></p>
                    <p className="text-grey-500">Maturity Terms: <strong className="text-grey-800">{client.paymentTerms}</strong></p>
                    <p className="text-grey-500 font-sans">Corporate Tax Registration: <strong className="text-grey-700">{client.taxId}</strong></p>
                  </div>
                </div>

              </div>
              
              <div className="space-y-2 text-left text-xs bg-grey-25/50 border border-grey-100 rounded-lg p-4 font-secondary">
                <h4 className="font-bold text-grey-900 uppercase">Consultant assessment description</h4>
                <p className="text-grey-500 leading-relaxed whitespace-pre-line">
                  {client.notes || "No special descriptive particulars logged."}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Full invoices matching profiles */}
          {activeTab === "invoices" && (
            <div className="space-y-4 pt-5" id="panel-invoices">
              {clientInvoices.length === 0 ? (
                <p className="text-sm text-grey-400 py-10 text-center font-secondary">No current statements or proposals drafted.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-grey-50">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-grey-50 text-grey-500 uppercase font-sans border-b border-grey-100">
                        <th className="px-4 py-3">Code Reference</th>
                        <th className="px-4 py-3">Billed Sum</th>
                        <th className="px-4 py-3">Maturity Deadline</th>
                        <th className="px-4 py-3">Status Block</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-grey-100 text-grey-800">
                      {clientInvoices.map((inv) => (
                        <tr
                          key={inv.id}
                          className="hover:bg-grey-25/40 cursor-pointer"
                          onClick={() => onNavigate("invoice-detail", { invoiceId: inv.id })}
                        >
                          <td className="px-4 py-3 font-bold text-blue-600 font-sans">{inv.id}</td>
                          <td className="px-4 py-3 font-bold">{formatCurrencyConverted(inv.amount, client.currency, activeCurrency)}</td>
                          <td className="px-4 py-3 font-secondary">{inv.dueDate}</td>
                          <td className="px-4 py-3 font-sans">
                            <span className={`inline-block py-0.5 px-2 rounded-full font-semibold ${
                              inv.status === "Paid" 
                                ? "bg-green-100 text-green-600"
                                : inv.status === "Overdue"
                                ? "bg-red-100 text-red-650"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Settled Receipt histories */}
          {activeTab === "payments" && (
            <div className="space-y-4 pt-5" id="panel-payments">
              {paidInvoices.length === 0 ? (
                <p className="text-sm text-grey-400 py-10 text-center font-secondary">No cleared transaction receipts logged in active statement histories.</p>
              ) : (
                <div className="space-y-2.5 text-xs text-left">
                  {paidInvoices.map((inv) => (
                    <div key={inv.id} className="p-3 bg-green-100/10 border border-green-200/40 rounded-lg flex items-center justify-between font-secondary">
                      <div className="flex items-center gap-2.5">
                        <UserCheck className="w-5 h-5 text-green-500" />
                        <div>
                          <span className="font-bold text-grey-900 block font-sans">Settle Reference: {inv.id}</span>
                          <span className="text-xs text-grey-450">Funds Settled on scheduled settlement</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-green-600 font-sans">
                        +{formatCurrencyConverted(inv.amount, client.currency, activeCurrency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Reminder Activities */}
          {activeTab === "reminders" && (
            <div className="space-y-4 pt-5" id="panel-reminders">
              {reminderActivities.length === 0 ? (
                <div className="py-10 text-center" id="no-reminders-panel">
                  <CheckCircle2 className="w-8 h-8 text-green-500 bg-green-100 rounded-full p-2 mx-auto" />
                  <p className="text-sm text-grey-800 font-bold mt-2">Zero reminders sent!</p>
                  <p className="text-xs text-grey-400 font-secondary">Accounts clear. Client is extremely reliable.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-grey-100 ml-2.5 pl-5 space-y-4 text-xs text-left" id="timeline-flow">
                  {reminderActivities.map((act) => (
                    <div key={act.id} className="relative">
                      <span className="absolute -left-[27px] top-0.5 p-0.5 rounded-full bg-amber-500 text-white">
                        <Clock className="w-3 h-3 text-white" />
                      </span>
                      <div className="font-secondary">
                        <span className="font-bold text-grey-900 block">{act.action}</span>
                        <p className="text-xs text-grey-450">Statement: <strong className="text-blue-500 underline font-sans">{act.invoiceId}</strong> • Date: {act.date}</p>
                        {act.details && <p className="text-grey-500 mt-1">{act.details}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Interactive Internal Notes */}
          {activeTab === "notes" && (
            <div className="space-y-5 pt-5 flex-1 flex flex-col justify-between" id="panel-notes">
              <div className="space-y-3 flex-1 overflow-y-auto max-h-60" id="notes-ledger-box">
                {localNotes.length === 0 ? (
                  <p className="text-xs text-grey-440 py-6 text-center font-secondary">No persistent logs or internal notes. Add one below.</p>
                ) : (
                  <div className="space-y-2.5 text-xs text-left">
                    {localNotes.map((note, index) => (
                      <div key={index} className="p-3 rounded-lg bg-grey-25 border border-grey-100 font-secondary relative flex items-start gap-2">
                        <Bookmark className="w-3.5 h-3.5 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-grey-700 font-medium whitespace-pre-wrap">{note}</p>
                          <span className="text-xs text-grey-450 block mt-1.5 font-sans font-medium">Logged: 2026-05-23 (Assistant Note)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Box edit append */}
              <div className="space-y-2 border-t border-grey-100 pt-4" id="append-note-box">
                <textarea
                  id="note-typing-box"
                  rows={2}
                  placeholder="Type an internal note or assessment detail about payment behavior..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full border border-grey-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none text-grey-800"
                />
                
                <div className="flex justify-end">
                  <button
                    onClick={handleAddNote}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1.5 text-xs font-semibold cursor-pointer"
                  >
                    <span>Append Note</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Side: Behavioral Insights (col-span-4) */}
        <div className="lg:col-span-4 space-y-4" id="client-right-card">
          
          <div className="bg-white rounded-xl border border-grey-200/60 p-5 space-y-4 h-full flex flex-col justify-between" id="behavior-insight-widget">
            
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-grey-900 uppercase tracking-wider">Payments behavior (AI)</h3>
              <p className="text-xs text-grey-450 font-secondary mt-0.5">Automated analytical insights from invoice clearing history logs.</p>
            </div>

            {/* List of Insights cards */}
            <div className="space-y-3 pt-3 flex-1 text-xs text-left font-secondary">
              
              {/* Insight Item 1: Nudges needed */}
              <div className="p-3 bg-grey-25/50 border border-grey-100 rounded-lg flex items-center gap-3">
                <div className={`p-2 rounded-full shrink-0 ${insights.remindersColor}`}>
                  <SlidersHorizontal className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <span className="font-bold text-grey-900 block">{insights.remindersMsg}</span>
                  <span className="text-xs text-grey-400 block mt-0.5">Average notifications required to settle</span>
                </div>
              </div>

              {/* Insight Item 2: delay past due */}
              <div className="p-3 bg-grey-25/50 border border-grey-105 rounded-lg flex items-center gap-3">
                <div className={`p-2 rounded-full shrink-0 ${insights.delayColor}`}>
                  <Clock className="w-4 h-4 text-white shrink-0" />
                </div>
                <div>
                  <span className="font-bold text-grey-800 block">{insights.delay}</span>
                  <span className="text-xs text-grey-400 block mt-0.5">Standard grace timeline overshoot</span>
                </div>
              </div>

              {/* Insight Item 3: risk level */}
              <div className="p-3 bg-grey-25/50 border border-grey-105 rounded-lg flex items-center gap-3">
                <div className={`p-2 rounded-full shrink-0 ${insights.riskColor}`}>
                  <ShieldAlert className="w-4 h-4 outline-none text-white shrink-0" />
                </div>
                <div>
                  <span className="font-bold text-grey-800 block">{insights.riskText}</span>
                  <span className="text-xs text-grey-400 block mt-0.5">Escalation criteria parameters threat index</span>
                </div>
              </div>

              {/* Insight Item 4: rate ontime */}
              <div className="p-3 bg-grey-25/50 border border-grey-105 rounded-lg flex items-center gap-3">
                <div className={`p-2 rounded-full shrink-0 ${insights.rateIconColor}`}>
                  <UserCheck className="w-4 h-4 text-white shrink-0" />
                </div>
                <div>
                  <span className="font-bold text-grey-800 block">{insights.rate}</span>
                  <span className="text-xs text-grey-400 block mt-0.5">Invoice settling rate before final reminder</span>
                </div>
              </div>

            </div>

            {/* Sub-note */}
            <div className="text-xs text-grey-450 font-secondary mt-3 pt-3 border-t border-grey-55 leading-relaxed">
              * Behavior risk levels dictate whether Bok automatically adjusts escalation sequences to "Immediate Force Alert" protocols.
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
