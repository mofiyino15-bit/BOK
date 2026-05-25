import { useState, useEffect } from "react";
import {
  Eye,
  Plus,
  Search,
  X,
  ChevronDown,
  SlidersHorizontal,
  Edit2,
  Copy,
  Trash2,
  Calendar,
  MoreVertical,
} from "lucide-react";
import {
  Invoice,
  Client,
  formatCurrency,
  formatCurrencyConverted,
} from "../types";

interface InvoicesListProps {
  invoices: Invoice[];
  clients: Client[];
  onNavigate: (route: string, params?: Record<string, any>) => void;
  onUpdateInvoiceStatus: (id: string, status: Invoice["status"]) => void;
  onDeleteInvoice?: (id: string) => void;
  activeCurrency?: string;
}

export default function InvoicesList({
  invoices,
  clients,
  onNavigate,
  onUpdateInvoiceStatus,
  onDeleteInvoice,
  activeCurrency = "original",
}: InvoicesListProps) {
  // Filters local states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [clientFilter, setClientFilter] = useState<string>("All");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<string>("Newest First");

  // Dropdown UI state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  // Close dropdowns on click outside immediately
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      
      // Close filter dropdowns immediately when clicking outside
      if (!target.closest(".dropdown-filter-container")) {
        setOpenDropdown(null);
      }

      // Close action menus immediately when clicking outside
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

  // Helper date parsing (current date 2026-05-23)
  const isWithinDateRange = (dateStr: string, range: string) => {
    const invDate = new Date(dateStr);
    const today = new Date("2026-05-23");

    switch (range) {
      case "Today":
        return dateStr === "2026-05-23";
      case "This Week": {
        const diffTime = Math.abs(today.getTime() - invDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && invDate <= today;
      }
      case "This Month": {
        return (
          invDate.getMonth() === today.getMonth() &&
          invDate.getFullYear() === today.getFullYear()
        );
      }
      case "Last 30 Days": {
        const diffTime = today.getTime() - invDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 30;
      }
      case "Last Quarter": {
        const diffTime = today.getTime() - invDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 90;
      }
      default:
        return true;
    }
  };

  // Combustible filtering logic
  const filteredInvoices = invoices.filter((inv) => {
    const client = clients.find((c) => c.id === inv.clientId);
    const clientName = client ? client.name.toLowerCase() : "";
    const businessName = client ? client.businessName.toLowerCase() : "";
    const idMatches = inv.id.toLowerCase().includes(search.toLowerCase());
    const clientMatches =
      clientName.includes(search.toLowerCase()) ||
      businessName.includes(search.toLowerCase());

    const matchesSearch = idMatches || clientMatches;

    const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
    const matchesClient =
      clientFilter === "All" || inv.clientId === clientFilter;
    const matchesDate =
      dateRangeFilter === "All" ||
      isWithinDateRange(inv.dueDate, dateRangeFilter);

    return matchesSearch && matchesStatus && matchesClient && matchesDate;
  });

  // Sorting logics
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    const clientA = clients.find((c) => c.id === a.clientId)?.name || "";
    const clientB = clients.find((c) => c.id === b.clientId)?.name || "";

    switch (sortOrder) {
      case "Newest First":
        return b.id.localeCompare(a.id);
      case "Oldest First":
        return a.id.localeCompare(b.id);
      case "Amount High→Low":
        return b.amount - a.amount;
      case "Amount Low→High":
        return a.amount - b.amount;
      case "Due Date Soonest":
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case "Due Date Latest":
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      case "Client A–Z":
        return clientA.localeCompare(clientB);
      case "Client Z–A":
        return clientB.localeCompare(clientA);
      default:
        return b.id.localeCompare(a.id);
    }
  });

  const clearAllFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setClientFilter("All");
    setDateRangeFilter("All");
    setSortOrder("Newest First");
    setOpenDropdown(null);
  };

  const isAnyFilterActive =
    search !== "" ||
    statusFilter !== "All" ||
    clientFilter !== "All" ||
    dateRangeFilter !== "All";

  const getStatusBadgeStyle = (status: Invoice["status"]) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-600";
      case "Overdue":
        return "bg-red-100 text-red-650";
      case "Due Today":
        return "bg-amber-100 text-amber-600";
      case "Upcoming":
        return "bg-blue-100 text-blue-600";
      case "Draft":
        return "bg-grey-100 text-grey-600";
      default:
        return "bg-grey-100 text-grey-700";
    }
  };

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className="space-y-6" id="invoices-workspace-wrapper">
      {/* Title bar & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-grey-100">
        <div>
          <h1 className="text-3xl font-bold text-grey-900 tracking-tight">
            Invoices
          </h1>
          <p className="text-sm text-grey-400 font-secondary mt-0.5">
            Manage and track billing workflows, reminders, and draft proposals.
          </p>
        </div>
        <button
          id="btn-add-invoice-cta"
          onClick={() => onNavigate("create-invoice")}
          className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white stroke-[2.5]" />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Real Filter Suite Container */}
      <div
        className="bg-white rounded-xl border border-grey-200/60 p-5 space-y-4 relative z-30"
        id="filters-suite-card"
      >
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Dynamic Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-grey-400" />
            <input
              id="input-invoice-search"
              type="text"
              placeholder="Search by Invoice ID or Client name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-grey-200 rounded-lg pl-10 pr-4 py-2 text-sm text-grey-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-grey-400 hover:text-grey-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Combinable Filter Dropdowns */}
          <div
            className="flex flex-wrap items-center gap-2"
            id="interactive-dropdown-filters"
          >
            {/* Status Selector */}
            <div className="relative dropdown-filter-container">
              <button
                id="filter-trigger-status"
                onClick={() => toggleDropdown("status")}
                className={`flex items-center gap-1.5 px-4 py-2 border border-grey-200 rounded-lg text-sm font-medium transition-colors hover:bg-grey-25 cursor-pointer select-none ${
                  statusFilter !== "All"
                    ? "border-blue-500 text-blue-600 bg-blue-105"
                    : "text-grey-600"
                }`}
              >
                <span>Status: {statusFilter}</span>
                <ChevronDown className="w-4 h-4 text-grey-400" />
              </button>

              {openDropdown === "status" && (
                <div className="absolute right-0 mt-2 bg-white border border-grey-100 rounded-lg py-1 w-44 z-50">
                  {[
                    "All",
                    "Draft",
                    "Upcoming",
                    "Due Today",
                    "Overdue",
                    "Paid",
                  ].map((status) => (
                    <button
                      key={status}
                      id={`opt-status-${status}`}
                      onClick={() => {
                        setStatusFilter(status);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-grey-25 transition-colors ${
                        statusFilter === status
                          ? "bg-grey-25/50 text-blue-600 font-bold"
                          : "text-grey-700"
                      }`}
                    >
                      {status === "All" ? "All Statuses" : status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Client Selector */}
            <div className="relative dropdown-filter-container">
              <button
                id="filter-trigger-client"
                onClick={() => toggleDropdown("client")}
                className={`flex items-center gap-1.5 px-4 py-2 border border-grey-200 rounded-lg text-sm font-medium transition-colors hover:bg-grey-25 cursor-pointer select-none ${
                  clientFilter !== "All"
                    ? "border-blue-500 text-blue-600 bg-blue-105"
                    : "text-grey-600"
                }`}
              >
                <span className="truncate max-w-[120px]">
                  Client:{" "}
                  {clientFilter === "All"
                    ? "All"
                    : clients.find((c) => c.id === clientFilter)?.name}
                </span>
                <ChevronDown className="w-4 h-4 text-grey-400" />
              </button>

              {openDropdown === "client" && (
                <div className="absolute right-0 mt-2 bg-white border border-grey-100 rounded-lg py-1 w-52 max-h-60 overflow-y-auto z-50">
                  <button
                    onClick={() => {
                      setClientFilter("All");
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-grey-25 border-b border-grey-50 ${
                      clientFilter === "All"
                        ? "text-blue-600 font-bold bg-grey-25/50"
                        : "text-grey-700"
                    }`}
                  >
                    All Clients
                  </button>
                  {clients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => {
                        setClientFilter(client.id);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-grey-25 ${
                        clientFilter === client.id
                          ? "text-blue-600 font-bold bg-grey-25/50"
                          : "text-grey-700"
                      }`}
                    >
                      {client.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range Selector */}
            <div className="relative dropdown-filter-container">
              <button
                id="filter-trigger-date"
                onClick={() => toggleDropdown("date")}
                className={`flex items-center gap-1.5 px-4 py-2 border border-grey-200 rounded-lg text-sm font-medium transition-colors hover:bg-grey-25 cursor-pointer select-none ${
                  dateRangeFilter !== "All"
                    ? "border-blue-500 text-blue-600 bg-blue-105"
                    : "text-grey-600"
                }`}
              >
                <span>
                  Due Date:{" "}
                  {dateRangeFilter === "All" ? "All Time" : dateRangeFilter}
                </span>
                <ChevronDown className="w-4 h-4 text-grey-400" />
              </button>

              {openDropdown === "date" && (
                <div className="absolute right-0 mt-2 bg-white border border-grey-100 rounded-lg py-1 w-48 z-50">
                  {[
                    "All",
                    "Today",
                    "This Week",
                    "This Month",
                    "Last 30 Days",
                    "Last Quarter",
                  ].map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setDateRangeFilter(range);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-grey-25 transition-colors ${
                        dateRangeFilter === range
                          ? "text-blue-600 font-bold bg-grey-25/50"
                          : "text-grey-700"
                      }`}
                    >
                      {range === "All" ? "All Time" : range}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Order */}
            <div className="relative dropdown-filter-container">
              <button
                id="filter-trigger-sort"
                onClick={() => toggleDropdown("sort")}
                className="flex items-center gap-1.5 px-4 py-2 border border-grey-200 rounded-lg text-sm font-semibold text-grey-700 hover:bg-grey-25 cursor-pointer select-none"
              >
                <span>Sort: {sortOrder}</span>
                <ChevronDown className="w-4 h-4 text-grey-400" />
              </button>

              {openDropdown === "sort" && (
                <div className="absolute right-0 mt-2 bg-white border border-grey-100 rounded-lg py-1 w-52 z-50">
                  {[
                    "Newest First",
                    "Oldest First",
                    "Amount High→Low",
                    "Amount Low→High",
                    "Due Date Soonest",
                    "Due Date Latest",
                    "Client A–Z",
                    "Client Z–A",
                  ].map((order) => (
                    <button
                      key={order}
                      onClick={() => {
                        setSortOrder(order);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-grey-25 transition-colors ${
                        sortOrder === order
                          ? "text-blue-600 font-bold bg-grey-25/50"
                          : "text-grey-700"
                      }`}
                    >
                      {order}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visual Pill representations of active filters with "Clear All" */}
        {isAnyFilterActive && (
          <div
            className="flex flex-wrap items-center gap-2 pt-3 border-t border-grey-100 text-xs"
            id="active-pills-row"
          >
            <span className="text-grey-400 font-semibold uppercase tracking-wider text-xs">
              Active Filters:
            </span>

            {search && (
              <span className="inline-flex items-center gap-1.5 bg-blue-500 text-white font-medium px-2.5 py-1 rounded-full font-secondary">
                <span>Query: "{search}"</span>
                <button
                  onClick={() => setSearch("")}
                  className="hover:text-red-300"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </span>
            )}

            {statusFilter !== "All" && (
              <span className="inline-flex items-center gap-1.5 bg-blue-500 text-white font-medium px-2.5 py-1 rounded-full font-secondary">
                <span>Status: {statusFilter}</span>
                <button
                  onClick={() => setStatusFilter("All")}
                  className="hover:text-red-300"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </span>
            )}

            {clientFilter !== "All" && (
              <span className="inline-flex items-center gap-1.5 bg-blue-500 text-white font-medium px-2.5 py-1 rounded-full font-secondary">
                <span>
                  Client: {clients.find((c) => c.id === clientFilter)?.name}
                </span>
                <button
                  onClick={() => setClientFilter("All")}
                  className="hover:text-red-300"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </span>
            )}

            {dateRangeFilter !== "All" && (
              <span className="inline-flex items-center gap-1.5 bg-blue-500 text-white font-medium px-2.5 py-1 rounded-full font-secondary">
                <span>Due: {dateRangeFilter}</span>
                <button
                  onClick={() => setDateRangeFilter("All")}
                  className="hover:text-red-300"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="text-red-500 hover:text-red-600 font-bold hover:underline ml-auto cursor-pointer font-secondary"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Main Ledger Table */}
      <div
        className="bg-white rounded-xl border border-grey-200/60 overflow-visible"
        id="invoices-table-card"
      >
        {sortedInvoices.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center"
            id="empty-results-workspace"
          >
            <sliders-horizontal className="w-12 h-12 text-grey-200 stroke-[1.2] mb-3 inline-block" />
            <h3 className="text-lg font-bold text-grey-900">
              No results found
            </h3>
            <p className="text-sm text-grey-400 mt-1 max-w-sm font-secondary">
              There are no invoices matching your current search criteria or
              filter combinations.
            </p>
            <div className="mt-5">
              <button
                onClick={clearAllFilters}
                className="bg-blue-100 text-blue-600 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-100/80 transition-all cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto lg:overflow-visible">
            <table
              className="w-full text-left border-collapse"
              id="invoices-ledger-table"
            >
              <thead>
                <tr className="bg-grey-50 border-b border-grey-100 rounded-t-xl">
                  <th className="hidden sm:table-cell text-xs font-semibold text-grey-600 px-6 py-4 uppercase tracking-wider font-sans">
                    Invoice ID
                  </th>
                  <th className="text-xs font-semibold text-grey-600 px-6 py-4 uppercase tracking-wider font-sans">
                    Client
                  </th>
                  <th className="text-xs font-semibold text-grey-600 px-6 py-4 uppercase tracking-wider font-sans">
                    Amount
                  </th>
                  <th className="hidden sm:table-cell text-xs font-semibold text-grey-600 px-6 py-4 uppercase tracking-wider font-sans">
                    Due Date
                  </th>
                  <th className="text-xs font-semibold text-grey-600 px-6 py-4 uppercase tracking-wider font-sans">
                    Status
                  </th>
                  <th className="hidden sm:table-cell text-xs font-semibold text-grey-600 px-6 py-4 uppercase tracking-wider font-sans">
                    Reminder Workflow
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grey-100">
                {sortedInvoices.map((inv, index) => {
                  const client = clients.find((c) => c.id === inv.clientId);
                  const clientName = client ? client.name : "Unknown Client";
                  const clientCurrency = client ? client.currency : "USD";
                  const badgeStyle = getStatusBadgeStyle(inv.status);

                  return (
                    <tr
                      key={inv.id}
                      onClick={() =>
                        onNavigate("invoice-detail", { invoiceId: inv.id })
                      }
                      className={`group hover:bg-grey-25/50 transition-colors cursor-pointer ${
                        index % 2 === 0 ? "bg-white" : "bg-grey-25/10"
                      }`}
                    >
                      {/* ID (clickable with hover trigger) - normal/medium weight so it doesn't compete with the amount column */}
                      <td className="hidden sm:table-cell px-6 py-4 text-sm font-medium text-grey-500 font-mono group-hover:text-blue-600 transition-colors">
                        {inv.id}
                      </td>

                      {/* Client info */}
                      <td className="px-6 py-4 text-sm font-semibold text-grey-800">
                        {clientName}
                      </td>

                      {/* Currency amount */}
                      <td className="px-6 py-4 text-sm font-semibold text-grey-900 font-sans">
                        {formatCurrencyConverted(
                          inv.amount,
                          clientCurrency,
                          activeCurrency,
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="hidden sm:table-cell px-6 py-4 text-sm text-grey-500 font-secondary">
                        {inv.dueDate}
                      </td>

                      {/* Badge info */}
                      <td className="px-6 py-4 text-sm">
                        <span
                           className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeStyle}`}
                        >
                          {inv.status}
                        </span>
                      </td>

                      {/* Reminder status / workflow indicator */}
                      <td className="hidden sm:table-cell px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded ${
                            inv.reminderStatus === "Sent"
                              ? "bg-green-100/50 text-green-650"
                              : inv.reminderStatus === "Scheduled"
                                ? "bg-blue-100/50 text-blue-600"
                                : "bg-grey-100/70 text-grey-500"
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {inv.reminderStatus === "Sent"
                              ? "Nudge Emailed"
                              : inv.reminderStatus === "Scheduled"
                                ? "Auto-Nudge Scheduled"
                                : "No Active Reminders"}
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Premium Confirm Delete Modal */}
      {invoiceToDelete && (
        <div
          className="fixed inset-0 bg-grey-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200"
          id="delete-invoice-modal"
          onClick={() => setInvoiceToDelete(null)}
        >
          <div
            className="relative bg-white rounded-2xl border border-grey-200 max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Right Close Button */}
            <button
              onClick={() => setInvoiceToDelete(null)}
              className="absolute top-4 right-4 text-grey-450 hover:text-grey-700 hover:bg-grey-50 rounded-full p-1.5 transition-colors cursor-pointer"
              title="Close modal"
              id="close-invoice-modal-btn"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl shrink-0">
                <Trash2 className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-grey-900 pr-6">
                  Delete Invoice Record
                </h3>
                <p className="text-xs text-grey-500 mt-2 leading-relaxed font-secondary">
                  Are you sure you want to delete this invoice statement? This
                  action is permanent and cannot be undone.
                </p>

                {/* Highly structured details card for maximum visibility */}
                {(() => {
                  const inv = invoices.find((i) => i.id === invoiceToDelete);
                  if (!inv) return null;
                  const client = clients.find((c) => c.id === inv.clientId);
                  return (
                    <div className="mt-4 p-3.5 bg-grey-50 rounded-xl border border-grey-100 font-mono text-xs text-grey-700 flex flex-col gap-2">
                      <div className="flex justify-between items-center pb-1.5 border-b border-grey-100">
                        <span className="text-grey-450 font-sans font-medium">
                          Invoice ID:
                        </span>
                        <span className="font-bold text-grey-900 select-all">
                          {inv.id}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-grey-450 font-sans font-medium">
                          Recipient:
                        </span>
                        <span className="font-sans font-semibold text-grey-800">
                          {client ? client.name : "Unknown client"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-grey-450 font-sans font-medium">
                          Due Date:
                        </span>
                        <span className="text-grey-600 font-sans">
                          {inv.dueDate}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1.5 border-t border-grey-100">
                        <span className="text-grey-450 font-sans font-medium">
                          Total Balance:
                        </span>
                        <span className="font-sans font-bold text-blue-600 text-sm">
                          {formatCurrency(
                            inv.amount,
                            client ? client.currency : "USD",
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-5 pt-4 border-t border-grey-50">
              <button
                type="button"
                onClick={() => setInvoiceToDelete(null)}
                className="px-4 py-2 border border-grey-200 bg-white hover:bg-grey-50 text-grey-600 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                id="cancel-invoice-delete-btn"
              >
                Cancel, Keep Record
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteInvoice) {
                    onDeleteInvoice(invoiceToDelete);
                  }
                  setInvoiceToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-sm tracking-wide"
                id="confirm-invoice-delete-btn"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
