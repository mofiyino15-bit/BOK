import { useState, useEffect } from "react";
import { Search, Eye, Plus, ArrowUpRight, TrendingUp, AlertTriangle, User, MoreVertical, SlidersHorizontal, Trash2, ShieldAlert, X } from "lucide-react";
import { Client, Invoice, formatCurrency, formatCurrencyConverted } from "../types";

interface ClientsListProps {
  clients: Client[];
  invoices: Invoice[];
  onNavigate: (route: string, params?: Record<string, any>) => void;
  onDeleteClient?: (id: string) => void;
  onUpdateClientRiskLevel?: (id: string, riskLevel: Client["riskLevel"]) => void;
  onUpdateClientStatus?: (id: string, status: Client["status"]) => void;
  activeCurrency?: string;
}

export default function ClientsList({
  clients,
  invoices,
  onNavigate,
  onDeleteClient,
  onUpdateClientRiskLevel,
  onUpdateClientStatus,
  activeCurrency = "original"
 }: ClientsListProps) {
  const [search, setSearch] = useState("");
  const [selectedStatFilter, setSelectedStatFilter] = useState<"all" | "outstanding" | "at-risk">("all");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      // If clicking inside option trigger button or option dropdown panel, don't auto-dismiss
      if (target.closest('[id^="btn-options-"]') || target.closest('[id^="menu-actions-"]')) {
        return;
      }
      setActiveMenuId(null);
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Dynamically compute client financial values based on current invoice states
  const computeClientStats = (clientId: string, preferredCurrency: string) => {
    const clientInvoices = invoices.filter((inv) => inv.clientId === clientId);
    
    const totalInvoiced = clientInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const outstandingBalance = clientInvoices
      .filter((inv) => inv.status !== "Paid" && inv.status !== "Draft")
      .reduce((sum, inv) => sum + inv.amount, 0);

    return { totalInvoiced, outstandingBalance };
  };

  const filteredClients = clients.filter((c) => {
    const searchMatch = (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.businessName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );
    if (!searchMatch) return false;

    if (selectedStatFilter === "outstanding") {
      const { outstandingBalance } = computeClientStats(c.id, c.currency);
      return outstandingBalance > 0;
    }
    if (selectedStatFilter === "at-risk") {
      return c.riskLevel === "At Risk";
    }
    return true;
  });

  // Calculate high-level summary metadata
  const totalClientsCount = clients.length;
  const outstandingClientsCount = clients.filter((c) => {
    const { outstandingBalance } = computeClientStats(c.id, c.currency);
    return outstandingBalance > 0;
  }).length;
  
  const highRiskClientsCount = clients.filter((c) => c.riskLevel === "At Risk").length;

  const getRiskBadgeStyle = (risk: Client["riskLevel"]) => {
    switch (risk) {
      case "Reliable":
        return "bg-green-100 text-green-600 border border-green-200";
      case "Slow Payer":
        return "bg-amber-100 text-amber-650 border border-amber-200";
      case "At Risk":
        return "bg-red-100 text-red-650 border border-red-200";
      default:
        return "bg-grey-100 text-grey-500";
    }
  };

  return (
    <div className="space-y-6" id="clients-workspace-wrapper">
      
      {/* Top Header Row & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-grey-100">
        <div>
          <h1 className="text-3xl font-bold text-grey-900 tracking-tight">Clients</h1>
          <p className="text-sm text-grey-400 font-secondary mt-0.5 font-secondary">Monitor client risk, payment delay statistics, and outstanding balances.</p>
        </div>
        
        <button
          id="btn-add-client-cta"
          onClick={() => onNavigate("add-client")}
          className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer self-start sm:self-auto select-none"
        >
          <Plus className="w-4 h-4 text-white stroke-[2.5]" />
          <span>Add Client</span>
        </button>
      </div>

      {/* High-level Summary Insights row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="clients-insight-cards">
        {/* Card 1: Total */}
        <div 
          onClick={() => setSelectedStatFilter("all")}
          className={`p-5 rounded-xl border flex items-center gap-4 transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
            selectedStatFilter === "all"
              ? "bg-blue-25/50 border-blue-500 shadow-md ring-1 ring-blue-500/20"
              : "bg-white border-grey-200/60 hover:bg-grey-25/40 hover:border-grey-300"
          }`}
        >
          <div className={`p-3.5 rounded-full shrink-0 transition-colors ${
            selectedStatFilter === "all" ? "bg-blue-100 text-blue-600" : "bg-grey-50 text-grey-500"
          }`}>
            <User className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-grey-400 font-sans block">Total Customers</span>
            <span className="text-2xl font-bold text-grey-900 block leading-tight">{totalClientsCount}</span>
            <span className="text-xs text-grey-450 font-secondary block mt-0.5">Showing all clients</span>
          </div>
        </div>

        {/* Card 2: Outstandings */}
        <div 
          onClick={() => setSelectedStatFilter(selectedStatFilter === "outstanding" ? "all" : "outstanding")}
          className={`p-5 rounded-xl border flex items-center gap-4 transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
            selectedStatFilter === "outstanding"
              ? "bg-amber-25/50 border-amber-505 shadow-md ring-1 ring-amber-500/20"
              : "bg-white border-grey-200/60 hover:bg-grey-25/40 hover:border-grey-300"
          }`}
        >
          <div className={`p-3.5 rounded-full shrink-0 transition-colors ${
            selectedStatFilter === "outstanding" ? "bg-amber-100/90 text-amber-600" : "bg-amber-100/60 text-amber-550"
          }`}>
            <TrendingUp className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-grey-400 font-sans block">Outstanding Balances</span>
            <span className="text-2xl font-bold text-grey-900 block leading-tight">{outstandingClientsCount}</span>
            <span className="text-xs text-amber-600 font-secondary font-semibold block mt-0.5">Filter outstanding bills</span>
          </div>
        </div>

        {/* Card 3: Risks */}
        <div 
          onClick={() => setSelectedStatFilter(selectedStatFilter === "at-risk" ? "all" : "at-risk")}
          className={`p-5 rounded-xl border flex items-center gap-4 transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
            selectedStatFilter === "at-risk"
              ? "bg-red-25/55 border-red-500 shadow-md ring-1 ring-red-500/20"
              : "bg-white border-grey-200/60 hover:bg-grey-25/40 hover:border-grey-300"
          }`}
        >
          <div className={`p-3.5 rounded-full shrink-0 transition-colors ${
            selectedStatFilter === "at-risk" ? "bg-red-100/90 text-red-650" : "bg-red-100/60 text-red-500"
          }`}>
            <AlertTriangle className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-grey-400 font-sans block">At Risk Profiles</span>
            <span className="text-2xl font-bold text-grey-900 block leading-tight">{highRiskClientsCount}</span>
            <span className="text-xs text-red-500 font-secondary font-semibold block mt-0.5">Filter high-risk profiles</span>
          </div>
        </div>
      </div>

      {/* Filters Catalog & Table Sheet */}
      <div className="bg-white rounded-xl border border-grey-200/60 overflow-visible space-y-4" id="clients-table-sheet">
        {/* Search bar */}
        <div className="p-5 pb-1 border-b border-grey-50 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-grey-400" />
            <input
              type="text"
              placeholder="Search clients by name, business or email contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-grey-200 rounded-lg pl-10 pr-4 py-2 text-sm text-grey-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {selectedStatFilter !== "all" && (
              <span className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 select-none ${
                selectedStatFilter === "outstanding"
                  ? "bg-amber-50 border border-amber-200 text-amber-700"
                  : "bg-red-50 border border-red-200 text-red-750"
              }`}>
                <span>
                  {selectedStatFilter === "outstanding" ? "Outstanding" : "At Risk"}
                </span>
                <button 
                  onClick={() => setSelectedStatFilter("all")}
                  className="hover:bg-black/5 rounded-full p-0.5 cursor-pointer flex items-center justify-center transition-colors"
                  title="Clear active filter"
                >
                  <X className="w-3.5 h-3.5 text-current" />
                </button>
              </span>
            )}
            
            <button 
              onClick={() => {
                if (selectedStatFilter === "all") {
                  setSelectedStatFilter("outstanding");
                } else if (selectedStatFilter === "outstanding") {
                  setSelectedStatFilter("at-risk");
                } else {
                  setSelectedStatFilter("all");
                }
              }}
              className={`px-4 py-2 border rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer font-secondary transition-colors ${
                selectedStatFilter !== "all"
                  ? "bg-grey-50 border-grey-300 text-grey-800 hover:bg-grey-100"
                  : "bg-white border-grey-200 hover:bg-grey-25 text-grey-600"
              }`}
              title="Click to toggle between stat filters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>
                {selectedStatFilter === "all" ? "Filter Stats" : "Cycle Filter"}
              </span>
            </button>
          </div>
        </div>

        {/* Clients Ledger Table */}
        <div className="overflow-x-auto lg:overflow-visible">
          <table className="w-full text-left border-collapse" id="clients-list-table">
            <thead>
              <tr className="bg-grey-50 border-b border-grey-100">
                <th className="text-xs font-semibold text-grey-600 px-3 py-3.5 sm:px-6 sm:py-4 uppercase tracking-wider font-sans">
                  <span className="hidden sm:inline">Client Profile Name</span>
                  <span className="sm:hidden">Client</span>
                </th>
                <th className="hidden sm:table-cell text-xs font-semibold text-grey-600 px-6 py-4 uppercase tracking-wider font-sans">
                  Corporate Entity Name
                </th>
                <th className="hidden sm:table-cell text-xs font-semibold text-grey-600 px-6 py-4 uppercase tracking-wider font-sans">
                  Total Billed
                </th>
                <th className="hidden sm:table-cell text-xs font-semibold text-grey-600 px-6 py-4 uppercase tracking-wider font-sans">
                  Outstanding Balance
                </th>
                <th className="text-xs font-semibold text-grey-600 px-3 py-3.5 sm:px-6 sm:py-4 uppercase tracking-wider font-sans text-right sm:text-left">
                  <span className="hidden sm:inline">Reliability status</span>
                  <span className="sm:hidden">Reliability</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-100 text-sm">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="hidden sm:table-cell text-center py-16 text-grey-400">
                    <p className="text-sm font-semibold text-grey-900">No matching clients found</p>
                    <p className="text-xs mt-0.5 font-secondary">Simplify search description or create a new profile shortcut on top.</p>
                  </td>
                  <td colSpan={2} className="table-cell sm:hidden text-center py-16 text-grey-400">
                    <p className="text-sm font-semibold text-grey-900">No matching clients found</p>
                    <p className="text-xs mt-0.5 font-secondary">Simplify search or add new profile.</p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client, index) => {
                  const { totalInvoiced, outstandingBalance } = computeClientStats(client.id, client.currency);
                  const riskStyle = getRiskBadgeStyle(client.riskLevel);

                  return (
                    <tr
                      key={client.id}
                      onClick={() => onNavigate("client-detail", { clientId: client.id })}
                      className={`group hover:bg-grey-25/50 transition-colors cursor-pointer ${
                        index % 2 === 0 ? "bg-white" : "bg-grey-25/10"
                      }`}
                    >
                      {/* Name */}
                      <td className="px-3 py-4 sm:px-6 font-bold text-grey-900 group-hover:text-blue-600 transition-colors">
                        {client.name}
                        {client.businessName && (
                          <span className="block sm:hidden text-xs text-grey-400 font-normal mt-0.5 font-secondary">
                            {client.businessName}
                          </span>
                        )}
                      </td>

                      {/* Corporate business */}
                      <td className="hidden sm:table-cell px-6 py-4 text-grey-600">
                        {client.businessName}
                      </td>

                      {/* Cumulative invoiced */}
                      <td className="hidden sm:table-cell px-6 py-4 font-bold font-sans text-grey-700">
                        {formatCurrencyConverted(totalInvoiced, client.currency, activeCurrency)}
                      </td>

                      {/* Outstanding */}
                      <td className={`hidden sm:table-cell px-6 py-4 font-extrabold font-sans ${outstandingBalance > 0 ? "text-amber-600" : "text-grey-400"}`}>
                        {formatCurrencyConverted(outstandingBalance, client.currency, activeCurrency)}
                      </td>

                      {/* Risk Badge status */}
                      <td className="px-3 py-4 sm:px-6 text-right sm:text-left">
                        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${riskStyle}`}>
                          {client.riskLevel}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Context-aware Client Delete Modals */}
      {clientToDelete && (() => {
        const targetClient = clients.find((c) => c.id === clientToDelete);
        const clientName = targetClient ? targetClient.name : "Target customer";
        const tiedInvoices = invoices.filter((inv) => inv.clientId === clientToDelete);
        const hasTiedInvoices = tiedInvoices.length > 0;

        return (
          <div className="fixed inset-0 bg-grey-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200" id="delete-client-modal" onClick={() => setClientToDelete(null)}>
            <div className="relative bg-white rounded-2xl border border-grey-200 max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150" onClick={(e) => e.stopPropagation()}>
              
              {/* Top Right Close Button */}
              <button
                onClick={() => setClientToDelete(null)}
                className="absolute top-4 right-4 text-grey-450 hover:text-grey-700 hover:bg-grey-50 rounded-full p-1.5 transition-colors cursor-pointer"
                title="Close modal"
                id="close-client-modal-btn"
              >
                <X className="w-4 h-4" />
              </button>

              {hasTiedInvoices ? (
                // Safe Restriction view
                <div className="space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                      <ShieldAlert className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-grey-900 pr-6">Delete Restricted</h3>
                      <p className="text-xs text-grey-500 mt-2 leading-relaxed font-secondary">
                        Cannot delete account <strong className="text-grey-900 font-semibold font-bold">"{clientName}"</strong> because they have <span className="font-bold text-grey-900">{tiedInvoices.length} active statement(s)</span> linked to their ledger.
                      </p>
                    </div>
                  </div>

                  {/* Highlighted linked invoices for transparency and details visibility */}
                  <div className="p-3 bg-amber-25/40 rounded-xl border border-amber-100/70 text-xs font-mono text-amber-805 flex flex-col gap-1.5">
                    <p className="font-sans font-semibold text-amber-900 mb-1 text-xs">Linked Invoice History:</p>
                    {tiedInvoices.slice(0, 3).map((inv) => (
                      <div key={inv.id} className="flex justify-between text-xs items-center">
                        <span className="font-bold">{inv.id}</span>
                        <span className="font-sans text-amber-700 font-semibold">
                          {formatCurrency(inv.amount, targetClient?.currency || "USD")} ({inv.status})
                        </span>
                      </div>
                    ))}
                    {tiedInvoices.length > 3 && (
                      <p className="text-xs text-amber-655 font-sans italic text-right pt-0.5 border-t border-amber-100/50">
                        + {tiedInvoices.length - 3} more references
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-grey-50">
                    <button
                      type="button"
                      onClick={() => setClientToDelete(null)}
                      className="px-4 py-2 border border-grey-200 bg-white hover:bg-grey-50 text-grey-600 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setClientToDelete(null)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-sm"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              ) : (
                // Confirm action view
                <div className="space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-red-50 text-red-600 rounded-xl shrink-0">
                      <Trash2 className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-grey-900 pr-6">Delete Client Profile</h3>
                      <p className="text-xs text-grey-500 mt-2 leading-relaxed font-secondary">
                        Are you sure you want to permanently delete this client profile from your active register?
                      </p>
                    </div>
                  </div>

                  {/* Highlighted client details card for maximum visibility */}
                  {targetClient && (
                    <div className="p-3.5 bg-grey-50 rounded-xl border border-grey-100 font-mono text-xs text-grey-700 flex flex-col gap-2">
                      <div className="flex justify-between items-center pb-1.5 border-b border-grey-100">
                        <span className="text-grey-450 font-sans font-medium">Customer:</span>
                        <span className="font-sans font-bold text-grey-905">{targetClient.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-grey-450 font-sans font-medium">Business:</span>
                        <span className="font-sans font-semibold text-grey-800">{targetClient.businessName || "—"}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1.5 border-t border-grey-100">
                        <span className="text-grey-450 font-sans font-medium">Email:</span>
                        <span className="text-grey-600 font-sans select-all select-none text-xs font-semibold">{targetClient.email}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-grey-50">
                    <button
                      type="button"
                      onClick={() => setClientToDelete(null)}
                      className="px-4 py-2 border border-grey-200 bg-white hover:bg-grey-50 text-grey-600 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                      id="cancel-client-delete-btn"
                    >
                      Cancel, Keep Record
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onDeleteClient) {
                          onDeleteClient(clientToDelete);
                        }
                        setClientToDelete(null);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-sm tracking-wide"
                      id="confirm-client-delete-btn"
                    >
                      Yes, Delete Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
