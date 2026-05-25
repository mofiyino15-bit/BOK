import { MoreVertical, Check, X, CheckCircle2, BellRing, Hourglass } from "lucide-react";
import {
  Invoice,
  Client,
  formatCurrency,
  formatCurrencyConverted,
} from "../types";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface FollowUpIntelligenceProps {
  invoices: Invoice[];
  clients: Client[];
  onUpdateInvoiceStatus: (id: string, status: Invoice["status"]) => void;
  onSendReminder: (id: string) => void;
  activeCurrency?: string;
  onNavigate: (route: string, params?: Record<string, any>) => void;
}

export default function FollowUpIntelligence({
  invoices,
  clients,
  onUpdateInvoiceStatus,
  onSendReminder,
  activeCurrency = "original",
  onNavigate,
}: FollowUpIntelligenceProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // Custom states for interactive controls
  const [sendingIds, setSendingIds] = useState<Record<string, boolean>>({});
  const [sentIds, setSentIds] = useState<Record<string, boolean>>({});
  const [snoozingIds, setSnoozingIds] = useState<Record<string, boolean>>({});
  const [snoozedIds, setSnoozedIds] = useState<Record<string, boolean>>({});

  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "info" | "error" }>({
    show: false,
    message: "",
    type: "success",
  });

  const triggerToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  // Close menus on click outside immediately
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (
        !target.closest('[id^="btn-options-"]') &&
        !target.closest('[id^="menu-actions-"]')
      ) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Track last modified invoice for session undo capability
  const [lastModifiedState, setLastModifiedState] = useState<{
    id: string;
    prevStatus: Invoice["status"];
    clientName: string;
  } | null>(null);

  // Find client details by ID
  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || "Unknown Client";
  };

  const getClientCurrency = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.currency || "USD";
  };

  const handleUpdateStatus = (id: string, newStatus: Invoice["status"]) => {
    const inv = invoices.find((i) => i.id === id);
    if (inv) {
      setLastModifiedState({
        id,
        prevStatus: inv.status,
        clientName: getClientName(inv.clientId),
      });
    }
    onUpdateInvoiceStatus(id, newStatus);
    setActiveMenuId(null);
  };

  // Get key reminders (upcoming, due today, overdue)
  // Limit to important elements, prioritizing INV-0038 (Overdue), INV-0055 (Due Today), and INV-0041 (Upcoming)
  const sortedInvoices = [...invoices]
    .filter((inv) => inv.status !== "Paid" && inv.status !== "Draft")
    .sort((a, b) => {
      // Sort Overdue first, then Due Today, then Upcoming
      const weight = { Overdue: 1, "Due Today": 2, Upcoming: 3 };
      return (weight[a.status] || 4) - (weight[b.status] || 4);
    })
    .slice(0, 3); // top 3 actions

  const getStatusBadgeStyle = (status: Invoice["status"]) => {
    switch (status) {
      case "Overdue":
        return "bg-red-100 text-red-600";
      case "Due Today":
        return "bg-amber-100 text-amber-600";
      case "Upcoming":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-grey-100 text-grey-600";
    }
  };

  const getReadableDueDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      // Split YYYY-MM-DD to avoid timezone shifts
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const date = new Date(year, monthIndex, day);
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return `${months[date.getMonth()]} ${date.getDate()}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className="bg-white rounded-xl border-[0.5px] border-grey-200/60 p-6 flex flex-col h-full overflow-visible"
      id="follow-up-intelligence"
    >
      <div
        className="flex items-center justify-between mb-4 pb-3 border-b border-grey-50"
        id="action-required-header"
      >
        <h2 className="text-xl font-bold text-grey-900 tracking-tight">
          Action Required
        </h2>
      </div>

      {/* Undo Alert Banner */}
      {lastModifiedState && (
        <div
          className="bg-green-55 border border-green-200 text-green-800 p-3 rounded-xl flex items-center justify-between text-xs font-sans mb-4 animate-fade-in animate-duration-300"
          id="undo-banner"
        >
          <span className="leading-tight">
            Marked <strong>{lastModifiedState.clientName}</strong> as Paid.
          </span>
          <button
            onClick={() => {
              onUpdateInvoiceStatus(
                lastModifiedState.id,
                lastModifiedState.prevStatus,
              );
              setLastModifiedState(null);
            }}
            className="text-green-700 hover:text-green-950 font-bold underline cursor-pointer ml-3 shrink-0"
          >
            Undo
          </button>
        </div>
      )}

      {sortedInvoices.length === 0 ? (
        <div
          className="flex-1 flex flex-col items-center justify-center py-10 text-center"
          id="no-actions-container"
        >
          <Check className="w-8 h-8 text-green-500 bg-green-100 rounded-full p-1.5 mb-2" />
          <p className="text-sm font-semibold text-grey-900">All cleared!</p>
          <p className="text-xs text-grey-400 mt-0.5 font-secondary">
            No custom follow-up needed today.
          </p>
        </div>
      ) : (
        <div
          className="space-y-2 flex-1 overflow-visible"
          id="follow-up-cards-list"
        >
          {sortedInvoices.map((inv) => {
            const clientName = getClientName(inv.clientId);
            const currency = getClientCurrency(inv.clientId);
            const badgeStyle = getStatusBadgeStyle(inv.status);
            const formattedDate = getReadableDueDate(inv.dueDate);

            return (
              <div
                key={inv.id}
                id={`follow-up-card-${inv.id}`}
                className={`bg-white border rounded-2xl py-4 px-5 flex flex-col transition-all relative ${activeMenuId === inv.id ? "z-30 border-grey-300 shadow-md" : "z-10 border-grey-100 hover:border-grey-200"}`}
              >
                {/* Header Row (Clickable to view invoice) */}
                <div
                  onClick={() =>
                    onNavigate("invoice-detail", { invoiceId: inv.id })
                  }
                  className="flex flex-col cursor-pointer group"
                  title="Click to view full invoice Details"
                >
                  {/* Row 1: Client Name (prominent at the top) */}
                  <h3
                    className="text-lg font-bold text-grey-900 group-hover:text-blue-600 transition-colors leading-snug font-sans tracking-tight truncate"
                    title={clientName}
                  >
                    {clientName}
                  </h3>

                  {/* Row 2: Combined Status and Due Date pill badge */}
                  <div className="flex items-center mt-2">
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeStyle} whitespace-nowrap`}
                    >
                      {inv.status} · {formattedDate}
                    </span>
                  </div>

                  {/* Row 3: Pricing before the action configurations (Independent prominent line pushed to the right) */}
                  <div className="text-right mt-2 flex flex-col items-end">
                    <span className="text-lg font-semibold text-grey-900 tracking-tight font-sans leading-none">
                      {formatCurrencyConverted(
                        inv.amount,
                        currency,
                        activeCurrency,
                      )}
                    </span>
                    {activeCurrency !== "original" &&
                      currency !== activeCurrency && (
                        <span className="text-xs text-grey-400 mt-1 font-sans">
                          Original: {formatCurrency(inv.amount, currency)}
                        </span>
                      )}
                  </div>
                </div>

                {/* Interactive Action Controls - Matches drawing, slightly taller h-10, no shadows, clean borders */}
                <div
                  className="flex items-center gap-2 w-full mt-4"
                  id={`follow-up-actions-row-${inv.id}`}
                >
                  {inv.status === "Upcoming" && (
                    <button
                      id={`btn-snooze-${inv.id}`}
                      disabled={snoozedIds[inv.id] || snoozingIds[inv.id]}
                      onClick={async () => {
                        setSnoozingIds(prev => ({ ...prev, [inv.id]: true }));
                        await new Promise(resolve => setTimeout(resolve, 600));
                        setSnoozingIds(prev => ({ ...prev, [inv.id]: false }));
                        setSnoozedIds(prev => ({ ...prev, [inv.id]: true }));
                        triggerToast(`Snoozed upcoming alert for ${clientName} for 3 business days!`, "info");
                      }}
                      className="flex-1 h-10 px-3 border border-grey-200 bg-white hover:bg-grey-50 text-grey-700 disabled:opacity-75 disabled:text-grey-400 disabled:cursor-not-allowed rounded-xl text-xs font-semibold flex items-center justify-center cursor-pointer transition-colors"
                    >
                      {snoozingIds[inv.id] ? "Snoozing..." : snoozedIds[inv.id] ? "Snoozed ✓" : "Snooze"}
                    </button>
                  )}

                  {inv.status === "Due Today" && (
                    <button
                      id={`btn-pay-${inv.id}`}
                      onClick={() => {
                        handleUpdateStatus(inv.id, "Paid");
                        triggerToast(`Marked ${clientName}'s invoice as Paid!`, "success");
                      }}
                      className="flex-1 h-10 px-3 border border-grey-200 bg-white hover:bg-grey-50 text-grey-700 rounded-xl text-xs font-semibold flex items-center justify-center cursor-pointer transition-colors"
                    >
                      Mark as Paid
                    </button>
                  )}

                  {inv.status === "Overdue" && (
                    <button
                      id={`btn-remind-${inv.id}`}
                      disabled={sentIds[inv.id] || sendingIds[inv.id]}
                      onClick={async () => {
                        setSendingIds(prev => ({ ...prev, [inv.id]: true }));
                        await new Promise(resolve => setTimeout(resolve, 800));
                        onSendReminder(inv.id);
                        setSendingIds(prev => ({ ...prev, [inv.id]: false }));
                        setSentIds(prev => ({ ...prev, [inv.id]: true }));
                        triggerToast(`Reminder alert sent successfully to ${clientName}!`, "success");
                      }}
                      className="flex-1 h-10 px-3 border border-grey-200 bg-white hover:bg-grey-50 text-grey-700 disabled:opacity-75 disabled:text-grey-400 disabled:cursor-not-allowed rounded-xl text-xs font-semibold flex items-center justify-center cursor-pointer transition-colors"
                    >
                      {sendingIds[inv.id] ? "Sending..." : sentIds[inv.id] ? "Sent ✓" : "Send Reminder"}
                    </button>
                  )}

                  {/* Vertical Options Menu Trigger - Matches button height/style exactly (w-10 h-10) */}
                  <div className="relative">
                    <button
                      id={`btn-options-${inv.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(
                          activeMenuId === inv.id ? null : inv.id,
                        );
                      }}
                      className="w-10 h-10 border border-grey-200 bg-white hover:bg-grey-50 text-grey-500 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 shrink-0" />
                    </button>

                    {activeMenuId === inv.id && (
                      <div
                        id={`menu-actions-${inv.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 mt-1 bg-white border border-grey-200 rounded-xl shadow-xl py-1.5 w-48 z-55 text-xs text-left"
                      >
                        <p className="px-3.5 py-1 text-xs font-bold text-grey-400 uppercase tracking-widest border-b border-grey-100 mb-1">
                          Change Status
                        </p>
                        {inv.status !== "Overdue" && (
                          <button
                            onClick={() => handleUpdateStatus(inv.id, "Overdue")}
                            className="w-full text-left px-3.5 py-2 hover:bg-grey-50 text-red-600 font-semibold cursor-pointer transition-colors"
                          >
                            Mark as Overdue
                          </button>
                        )}
                        {inv.status !== "Due Today" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(inv.id, "Due Today")
                            }
                            className="w-full text-left px-3.5 py-2 hover:bg-grey-50 text-amber-600 font-semibold cursor-pointer transition-colors"
                          >
                            Mark as Due Today
                          </button>
                        )}
                        {inv.status !== "Upcoming" && (
                          <button
                            onClick={() => handleUpdateStatus(inv.id, "Upcoming")}
                            className="w-full text-left px-3.5 py-2 hover:bg-grey-50 text-blue-600 font-semibold cursor-pointer transition-colors"
                          >
                            Mark as Upcoming
                          </button>
                        )}
                        {inv.status !== "Paid" && (
                          <button
                            onClick={() => handleUpdateStatus(inv.id, "Paid")}
                            className="w-full text-left px-3.5 py-2 hover:bg-grey-50 text-green-600 font-semibold cursor-pointer transition-colors"
                          >
                            Mark as Paid
                          </button>
                        )}
                        {inv.status !== "Draft" && (
                          <button
                            onClick={() => handleUpdateStatus(inv.id, "Draft")}
                            className="w-full text-left px-3.5 py-2 hover:bg-grey-50 text-grey-500 font-medium cursor-pointer transition-colors"
                          >
                            Revert to Draft
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Alert Toast Alert Notification */}
      {toast.show && createPortal(
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 z-[11000] w-[calc(100%-2rem)] max-w-sm bg-slate-900 text-white rounded-xl border border-slate-800 shadow-2xl p-4 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`p-2 rounded-lg ${toast.type === "success" ? "bg-green-500 text-slate-900" : "bg-blue-500 text-white"}`}>
            {toast.type === "success" ? <CheckCircle2 className="w-5 h-5 text-white" /> : <BellRing className="w-5 h-5 text-white" />}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-bold text-white">{toast.type === "success" ? "Success!" : "Notification"}</p>
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
