import { useState, useEffect } from "react";
import { SlidersHorizontal, ArrowDownRight, TrendingUp, AlertCircle, HelpCircle, FileText, ChevronDown, Check, ShieldCheck, MailWarning, FileDown, X, Printer, Download } from "lucide-react";
import { Invoice, Client, formatCurrency, convertCurrency } from "../types";
import BokLogo from "./BokLogo";

interface ReportsProps {
  invoices: Invoice[];
  clients: Client[];
  activeCurrency?: string;
  onNavigate?: (route: string, params?: Record<string, any>) => void;
}

export default function Reports({ invoices, clients, activeCurrency = "original", onNavigate }: ReportsProps) {
  // Filters State
  const [dateRange, setDateRange] = useState("All Time");
  const [clientFilter, setClientFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Interval state for Revenue Chart
  const [interval, setInterval] = useState<"Monthly" | "Quarterly" | "Yearly">("Monthly");

  // Hover totals state for Bar Chart tooltip
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Export Modal states
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Click outside to close filter dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-filter-container")) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Computations
  const filteredInvoices = invoices.filter((inv) => {
    const matchesClient = clientFilter === "All" || inv.clientId === clientFilter;
    const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
    return matchesClient && matchesStatus;
  });

  // Consolidated currency for accounting metrics
  const reportCurrency = activeCurrency === "original" ? "USD" : activeCurrency;

  const getInvoiceCurrency = (inv: Invoice): string => {
    const client = clients.find((c) => c.id === inv.clientId);
    return client ? client.currency : "USD";
  };

  const totalInvoiced = filteredInvoices.reduce((sum, inv) => {
    const origCurr = getInvoiceCurrency(inv);
    const converted = convertCurrency(inv.amount, origCurr, reportCurrency);
    return sum + converted;
  }, 0);

  const totalCollected = filteredInvoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => {
      const origCurr = getInvoiceCurrency(inv);
      const converted = convertCurrency(inv.amount, origCurr, reportCurrency);
      return sum + converted;
    }, 0);

  const totalOutstanding = totalInvoiced - totalCollected;

  const isAnyFilterActive = dateRange !== "All Time" || clientFilter !== "All" || statusFilter !== "All";

  const clearAllFilters = () => {
    setDateRange("All Time");
    setClientFilter("All");
    setStatusFilter("All");
    setOpenDropdown(null);
  };

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  // Expanded custom-bar chart datasets representing Monthly, Quarterly and Yearly billing loops
  const monthlyData = [
    { label: "Jan", invoiced: 8000, collected: 8000, heightInvoiced: "h-24", heightCollected: "h-24" },
    { label: "Feb", invoiced: 12000, collected: 10000, heightInvoiced: "h-36", heightCollected: "h-32" },
    { label: "Mar", invoiced: 9500, collected: 9500, heightInvoiced: "h-28", heightCollected: "h-28" },
    { label: "Apr", invoiced: 15450, collected: 12000, heightInvoiced: "h-48", heightCollected: "h-36" },
    { label: "May", invoiced: 16200, collected: 12450, heightInvoiced: "h-52", heightCollected: "h-40" },
    { label: "Jun", invoiced: 11000, collected: 9000, heightInvoiced: "h-32", heightCollected: "h-28" },
    { label: "Jul", invoiced: 13200, collected: 11000, heightInvoiced: "h-40", heightCollected: "h-34" },
    { label: "Aug", invoiced: 14500, collected: 13500, heightInvoiced: "h-44", heightCollected: "h-40" },
    { label: "Sep", invoiced: 15800, collected: 14200, heightInvoiced: "h-48", heightCollected: "h-44" },
    { label: "Oct", invoiced: 17200, collected: 15000, heightInvoiced: "h-56", heightCollected: "h-48" },
    { label: "Nov", invoiced: 18900, collected: 16500, heightInvoiced: "h-60", heightCollected: "h-52" },
    { label: "Dec", invoiced: 21500, collected: 18000, heightInvoiced: "h-64", heightCollected: "h-56" }
  ];

  const quarterlyData = [
    { label: "Q1", invoiced: 29500, collected: 27500, heightInvoiced: "h-36", heightCollected: "h-32" },
    { label: "Q2", invoiced: 42650, collected: 33450, heightInvoiced: "h-48", heightCollected: "h-40" },
    { label: "Q3", invoiced: 43500, collected: 38700, heightInvoiced: "h-52", heightCollected: "h-44" },
    { label: "Q4", invoiced: 57600, collected: 49500, heightInvoiced: "h-64", heightCollected: "h-56" }
  ];

  const yearlyData = [
    { label: "2024", invoiced: 120000, collected: 110500, heightInvoiced: "h-44", heightCollected: "h-40" },
    { label: "2025", invoiced: 168000, collected: 146000, heightInvoiced: "h-56", heightCollected: "h-48" },
    { label: "2026", invoiced: 198500, collected: 171500, heightInvoiced: "h-64", heightCollected: "h-56" }
  ];

  const activeChartData = interval === "Yearly" ? yearlyData : interval === "Quarterly" ? quarterlyData : monthlyData;

  const handlePrintPdf = () => {
    window.print();
    setShowPdfPreview(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300" id="reports-workspace">
      
      {/* HEADER: Title bar and Export selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-grey-100">
        <div>
          <h1 className="text-3xl font-bold text-grey-900 tracking-tight">Reports</h1>
          <p className="text-sm text-grey-400 font-secondary mt-0.5">Analyze automation rates, recovery periods, and outstanding cashflow.</p>
        </div>

        {/* Export buttons block */}
        <div className="flex items-center gap-2" id="report-exports">
          <button
            onClick={() => setShowPdfPreview(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer select-none transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 stroke-[2.3]" />
            <span>PDF Print</span>
          </button>
        </div>
      </div>

      {/* FILTER ROW CONSOLE */}
      <div className="bg-white rounded-xl border border-grey-200/60 p-4 flex flex-wrap items-center gap-3 text-xs relative z-30" id="reports-filters-row">
        
        {/* Date Selector */}
        <div className="relative dropdown-filter-container">
          <button
            onClick={() => toggleDropdown("date")}
            className="flex items-center gap-1.5 px-4 py-2 border border-grey-200 rounded-lg text-sm text-grey-600 font-semibold hover:bg-grey-25 cursor-pointer"
          >
            <span>Timeline: {dateRange}</span>
            <ChevronDown className="w-4 h-4 text-grey-400" />
          </button>
          {openDropdown === "date" && (
            <div className="absolute left-0 mt-1 bg-white border border-grey-100 rounded-lg py-1 w-40 z-50 shadow-md">
              {["All Time", "This Month", "Last Quarter", "This Year"].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDateRange(d);
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-grey-25 transition-colors ${
                    dateRange === d ? "text-blue-650 font-bold bg-grey-25" : "text-grey-700"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Client Selector */}
        <div className="relative dropdown-filter-container">
          <button
            onClick={() => toggleDropdown("client")}
            className="flex items-center gap-1.5 px-4 py-2 border border-grey-200 rounded-lg text-sm text-grey-600 font-semibold hover:bg-grey-25 cursor-pointer"
          >
            <span>Client: {clientFilter === "All" ? "All" : clients.find((c) => c.id === clientFilter)?.name}</span>
            <ChevronDown className="w-4 h-4 text-grey-400" />
          </button>
          {openDropdown === "client" && (
            <div className="absolute left-0 mt-1 bg-white border border-grey-100 rounded-lg py-1 w-48 max-h-40 overflow-y-auto z-50 shadow-md">
              <button
                onClick={() => {
                  setClientFilter("All");
                  setOpenDropdown(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-grey-25 text-grey-700"
              >
                All Clients
              </button>
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setClientFilter(c.id);
                    setOpenDropdown(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-grey-25 text-grey-700"
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Selector */}
        <div className="relative dropdown-filter-container">
          <button
            onClick={() => toggleDropdown("status")}
            className="flex items-center gap-1.5 px-4 py-2 border border-grey-200 rounded-lg text-sm text-grey-600 font-semibold hover:bg-grey-25 cursor-pointer"
          >
            <span>Status: {statusFilter}</span>
            <ChevronDown className="w-4 h-4 text-grey-400" />
          </button>
          {openDropdown === "status" && (
            <div className="absolute left-0 mt-1 bg-white border border-grey-100 rounded-lg py-1 w-40 z-50 shadow-md">
              {["All", "Paid", "Draft", "Upcoming", "Overdue"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setOpenDropdown(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-grey-25 text-grey-700"
                >
                  {s === "All" ? "All Statuses" : s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear link */}
        {isAnyFilterActive && (
          <button
            onClick={clearAllFilters}
            className="text-red-650 hover:text-red-700 hover:underline font-bold cursor-pointer font-secondary ml-auto"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* REVENUE OVERVIEW CARD WITH CUSTOM DECREASED-SPACING CHUNKY BARS */}
      <div className="bg-white rounded-xl border border-grey-200/60 p-6 flex flex-col gap-6 relative" id="revenue-overview-chart-card">
        
        {/* Toggle headers and stats summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-grey-50">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-grey-900 tracking-tight">Revenue Overview</h3>
            <p className="text-xs text-grey-440 font-secondary">Gross billed invoiced volume compared against real settled payments ({interval})</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Dynamic Hover Cycle Panel Overlay - Exists outside the scroll wrapper to eliminate frame clipping */}
            {hoveredBar !== null && (
              <div className="bg-grey-900 border border-grey-800 text-white rounded-xl py-1.5 px-3 text-[11px] font-secondary shadow-lg flex items-center gap-3 animate-in fade-in zoom-in-95 duration-100 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-grey-450 font-bold uppercase tracking-wider text-[9px]">Cycle:</span>
                  <span className="font-bold text-white font-sans">{activeChartData[hoveredBar].label}</span>
                </div>
                <div className="h-4 w-[1px] bg-grey-800"></div>
                <div className="flex items-center gap-1.5">
                  <span className="text-grey-400 font-bold uppercase tracking-wider text-[9px]">Billed:</span>
                  <span className="font-bold font-sans text-grey-100">${activeChartData[hoveredBar].invoiced.toLocaleString()}</span>
                </div>
                <div className="h-4 w-[1px] bg-grey-800"></div>
                <div className="flex items-center gap-1.5">
                  <span className="text-green-450 font-bold uppercase tracking-wider text-[9px]">Settled:</span>
                  <span className="font-bold font-sans text-green-300">${activeChartData[hoveredBar].collected.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Interval selection buttons */}
            <div className="flex items-center gap-1.5 bg-grey-25 p-1 rounded-lg border border-grey-150 text-xs font-semibold shrink-0" id="chart-intervals">
              {(["Monthly", "Quarterly", "Yearly"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setInterval(mode)}
                  className={`px-3 py-1.5 rounded-md cursor-pointer select-none transition-colors ${
                    interval === mode ? "bg-white text-grey-900 shadow-sm" : "text-grey-500 hover:text-grey-900"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic calculations figures indicators block */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="revenue-summary-row">
          <div className="p-4 bg-grey-25 border border-grey-100/60 rounded-xl">
            <span className="text-xs text-grey-400 font-semibold uppercase tracking-wider block">Total Billed</span>
            <span className="text-xl font-bold text-grey-900 block mt-1 font-sans">{formatCurrency(totalInvoiced, reportCurrency)}</span>
            <span className="text-xs text-grey-440 font-secondary">Adjusted to active filter scope</span>
          </div>

          <div className="p-4 bg-green-100/10 border border-green-200/40 rounded-xl">
            <span className="text-xs text-green-600 font-semibold uppercase tracking-wider block">Collected Cash</span>
            <span className="text-xl font-bold text-green-600 block mt-1 font-sans">{formatCurrency(totalCollected, reportCurrency)}</span>
            <span className="text-xs text-green-600 font-secondary">Total settled receipt transfers</span>
          </div>

          {/* Neutral box, error state colours (so it aligns with negative status/outstanding balance context) */}
          <div className="p-4 bg-red-100/10 border border-red-200/40 rounded-xl">
            <span className="text-xs text-red-600 font-semibold uppercase tracking-wider block">Remaining Outstanding</span>
            <span className="text-xl font-bold text-red-600 block mt-1 font-sans">{formatCurrency(totalOutstanding, reportCurrency)}</span>
            <span className="text-xs text-red-600 font-secondary">Receivable pipeline balances</span>
          </div>
        </div>

        {/* Chart workspace with side-by-side permanent Y-Axis labels */}
        <div className="flex gap-2 items-stretch" id="chart-and-axis-container">
          
          {/* Permanent left Y-axis labels - Outside scrollable area, locked on the left */}
          <div className="flex flex-col justify-between text-right pr-3 text-xs font-semibold text-grey-400 select-none shrink-0 w-14" style={{ height: "256px", marginTop: "8px", marginBottom: "24px" }}>
            {interval === "Yearly" ? (
              <>
                <span className="text-xs font-bold font-sans">$200k</span>
                <span className="text-xs font-bold font-sans">$150k</span>
                <span className="text-xs font-bold font-sans">$100k</span>
                <span className="text-xs font-bold font-sans">$50k</span>
                <span className="text-xs font-bold font-sans">$0</span>
              </>
            ) : interval === "Quarterly" ? (
              <>
                <span className="text-xs font-bold font-sans">$60k</span>
                <span className="text-xs font-bold font-sans">$45k</span>
                <span className="text-xs font-bold font-sans">$30k</span>
                <span className="text-xs font-bold font-sans">$15k</span>
                <span className="text-xs font-bold font-sans">$0</span>
              </>
            ) : (
              <>
                <span className="text-xs font-bold font-sans">$20k</span>
                <span className="text-xs font-bold font-sans">$15k</span>
                <span className="text-xs font-bold font-sans">$10k</span>
                <span className="text-xs font-bold font-sans">$5k</span>
                <span className="text-xs font-bold font-sans">$0</span>
              </>
            )}
          </div>

          {/* Pure CSS/Tailwind Custom-Bar representation chart workspace - Spaced much closer together & support scrolling */}
          <div className="flex-1 overflow-x-auto pb-2 scrollbar-thin">
            <div className="relative h-72 border-l border-grey-200/60 pt-10 flex items-end justify-start md:gap-8 gap-4 px-4 min-w-[760px] md:min-w-0" id="custom-bar-chart-container">
              
              {/* Background grid lines covering the full scrollable width */}
              <div className="absolute left-0 right-0 pointer-events-none flex flex-col justify-between" style={{ height: "256px", bottom: "24px" }}>
                <div className="border-b border-dashed border-grey-200/50 w-full h-0"></div>
                <div className="border-b border-dashed border-grey-200/50 w-full h-0"></div>
                <div className="border-b border-dashed border-grey-200/50 w-full h-0"></div>
                <div className="border-b border-dashed border-grey-200/50 w-full h-0"></div>
                {/* Solid X-Axis line aligned precisely at the $0 baseline */}
                <div className="border-b border-solid border-grey-300 w-full h-0 z-20"></div>
              </div>
              
              {activeChartData.map((bar, i) => {
                const isHovered = hoveredBar === i;
                const isAnyHovered = hoveredBar !== null;
                const dimOpacityClass = isAnyHovered && !isHovered ? "opacity-30 scale-y-[0.98] saturate-50" : "opacity-100 scale-100";

                return (
                  <div
                    key={bar.label}
                    className="flex flex-col items-start gap-1 group relative w-20 z-10"
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    
                    {/* ADJACENT DESIGN BARS - Positioned to the left, maintaining 1.5 gap */}
                    <div className={`flex items-end gap-1.5 w-full justify-start transition-all duration-200 ${dimOpacityClass}`}>
                      
                      {/* Billed (Grey/Muted, left) */}
                      <div
                        className="w-9 bg-grey-900 hover:bg-grey-800 rounded-t transition-all cursor-pointer"
                        style={{ height: `${(bar.invoiced / (interval === "Yearly" ? 200000 : interval === "Quarterly" ? 60000 : 22000)) * 220}px` }}
                        title={`Billed: $${bar.invoiced}`}
                      ></div>

                      {/* Settled (Green, right) */}
                      <div
                        className="w-9 bg-green-500 hover:bg-green-600 rounded-t transition-all cursor-pointer"
                        style={{ height: `${(bar.collected / (interval === "Yearly" ? 200000 : interval === "Quarterly" ? 60000 : 22000)) * 220}px` }}
                        title={`Settled: $${bar.collected}`}
                      ></div>

                    </div>

                    {/* X-axis labels aligned to the left */}
                    <span className="text-xs text-grey-500 font-bold uppercase tracking-wider mt-1">{bar.label}</span>
                  </div>
                );
              })}

            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center items-center gap-6 text-xs text-grey-500 mt-2 font-secondary" id="chart-legend">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-grey-900 inline-block rounded-sm"></span>
            <span>Gross Invoiced hours volume</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 inline-block rounded-sm"></span>
            <span>Cleared settled receipt transfers</span>
          </div>
        </div>

      </div>

      {/* MULTI PANEL VIEW: LEFT (Core Invoice dynamics), RIGHT (Follow-up effectiveness funnels) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="reports-bottom-split">
        
        {/* PANEL A: Left - Invoice Performance parameters (col-span-6) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-grey-200/60 p-6 space-y-6 text-left" id="panel-invoice-performance">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-grey-900 uppercase tracking-wider">Invoice performance</h3>
            <p className="text-xs text-grey-400 font-secondary">Average collection speeds, clearing structures and overdue hazards</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-secondary pt-2">
            {/* Avg speed card */}
            <div className="p-4 bg-grey-25 border border-grey-100 rounded-lg flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-green-500 shrink-0" />
              <div>
                <span className="text-xs text-grey-400 uppercase tracking-wider block">Average Payment Period</span>
                <span className="text-xl font-bold text-grey-800 font-sans block mt-1">8.3 Days</span>
                <span className="text-xs text-grey-400 block mt-0.5">Clearing well before Net 15 limit</span>
              </div>
            </div>

            {/* Total receivable delay card */}
            <div className="p-4 bg-grey-25 border border-grey-100 rounded-lg flex items-center gap-3">
              <MailWarning className="w-8 h-8 text-blue-500 shrink-0" />
              <div>
                <span className="text-xs text-grey-400 uppercase tracking-wider block font-sans">Receivable Outstanding</span>
                <span className="text-xl font-bold text-grey-800 font-sans block mt-1">$4,800.00</span>
                <span className="text-xs text-grey-400 block mt-0.5">Remaining in follow-ups pipeline</span>
              </div>
            </div>
          </div>

          {/* SVG Pie Representation of clearing ratios - SCALED UP BY A FACTOR OF TWO (w-24 -> w-48) */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-xl border border-grey-100/60 text-xs font-secondary bg-grey-25/40">
            {/* Simple SVG circle overlay segment path - Scaled Up x2 */}
            <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background segment */}
                <path
                  className="text-red-600"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Paid segment (72%) */}
                <path
                  className="text-green-500"
                  strokeDasharray="72, 100"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute block text-center">
                <span className="text-4xl font-extrabold text-grey-800 font-sans">72%</span>
                <span className="text-xs font-bold text-grey-400 block uppercase tracking-wider mt-1 font-sans">settled</span>
              </div>
            </div>

            <div className="space-y-2 flex-1 w-full text-left">
              <h4 className="font-bold text-grey-850 text-base">Accounts cleared ratio</h4>
              <p className="text-grey-500 text-xs leading-relaxed">
                72% of all invoices generated on Bok are cleared before reminder triggers activate. Overdue rates (28%) represent startup cash structures.
              </p>
              <div className="flex items-center gap-4 text-xs font-semibold pt-1">
                <span className="text-green-600">● 72% Settled Receipts</span>
                <span className="text-red-600">● 28% Outstanding Delay</span>
              </div>
            </div>
          </div>

          {/* Longest Overdue Invoice highlight card - Click connects to invoice-detail */}
          <div className="border border-red-200 bg-red-100/10 p-4 rounded-xl flex items-center justify-between text-xs" id="longest-overdue-alert-card">
            <div className="flex items-start gap-3 text-left">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-grey-900 block font-secondary">Longest Outstanding Statement Account</span>
                <p className="text-grey-600 mt-1 font-secondary">
                  Invoice:{" "}
                  <button 
                    onClick={() => onNavigate?.("invoice-detail", { invoiceId: "INV-0038" })}
                    className="text-blue-600 hover:text-blue-700 font-sans font-bold underline cursor-pointer hover:underline transition-all inline-block"
                  >
                    INV-0038
                  </button>{" "}
                  (Lagos Prints Corp). Outstanding: <strong className="text-red-600 font-sans font-bold">₦1,200,000.00</strong>
                </p>
                <span className="text-xs text-grey-400 block mt-1 font-secondary">Reminder 3 Sent Firm. Next: Escalate rule trigger</span>
              </div>
            </div>
          </div>

        </div>

        {/* PANEL B: Right - Follow-Up Effectiveness dropout flow (col-span-6) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-grey-200/60 p-6 space-y-6 text-left" id="panel-followup-effectiveness">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-grey-900 uppercase tracking-wider">Follow-up effectiveness</h3>
            <p className="text-xs text-grey-400 font-secondary">Metrics monitoring responsive client clearing rates following reminders dispatches</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-center text-xs font-secondary">
            {/* Efficiency metric 1 */}
            <div className="p-4 bg-green-100/10 border border-green-200/40 rounded-lg">
              <span className="text-2xl font-bold text-green-600 font-sans block">68%</span>
              <span className="text-xs text-grey-500 block font-semibold mt-1">Paid after 1st nudge</span>
              <span className="text-xs text-grey-400 block mt-1">First reminder velocity</span>
            </div>

            {/* Efficiency metric 2 */}
            <div className="p-4 bg-grey-25 border border-grey-100/70 rounded-lg">
              <span className="text-2xl font-bold text-grey-800 font-sans block">2.3</span>
              <span className="text-xs text-grey-550 block font-semibold mt-1">Nudges / Invoice</span>
              <span className="text-xs text-grey-440 block mt-1">Average reminders count</span>
            </div>

            {/* Efficiency metric 3 - Neutral box, warning number (doesn't look clicked) */}
            <div className="p-4 bg-grey-25 border border-grey-100/70 rounded-lg">
              <span className="text-2xl font-bold text-blue-500 font-sans block">41%</span>
              <span className="text-xs text-grey-550 block font-bold mt-1">Escalation recovery</span>
              <span className="text-xs text-grey-400 block font-medium mt-1">Resolving overdue warnings</span>
            </div>
          </div>

          {/* Best template and Horizontal funnel chart indicators */}
          <div className="space-y-4 pt-2">
            
            {/* Best performer */}
            <div className="flex items-center justify-between text-xs bg-grey-25 border border-grey-100 p-3 rounded-lg font-secondary relative">
              <span className="text-grey-500">Best Performing Wording Template:</span>
              <span className="font-bold text-blue-600 bg-blue-100 px-2.5 py-1 rounded">
                Friendly (78% Clearing)
              </span>
            </div>

            {/* Dropout progression funnel visualization */}
            <div className="space-y-3 pt-2" id="funnel-progress-tracks">
              <span className="text-xs font-semibold text-grey-400 uppercase tracking-wider block">Nudge Sequence Dropout Flow (%)</span>
              
              {/* Reminder 1 bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-grey-600 font-secondary">
                  <span>Reminder 1 friendly nudge dispatch (1st Cycle)</span>
                  <span className="font-sans font-bold text-grey-900">100% (Sent)</span>
                </div>
                {/* Horizontal progress bar */}
                <div className="w-full h-2 bg-grey-100 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full w-full rounded-full"></div>
                </div>
              </div>

              {/* Reminder 2 bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-grey-600 font-secondary">
                  <span>Reminder 2 firm warning notification (2nd Cycle)</span>
                  <span className="font-sans font-bold text-grey-900">68% Success</span>
                </div>
                {/* Horizontal progress bar */}
                <div className="w-full h-2 bg-grey-100 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full w-[68%] rounded-full"></div>
                </div>
              </div>

              {/* Reminder 3 bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-grey-600 font-secondary">
                  <span>Reminder 3 final formal demand (3rd Cycle)</span>
                  <span className="font-sans font-bold text-grey-900">35% Success</span>
                </div>
                {/* Horizontal progress bar */}
                <div className="w-full h-2 bg-grey-100 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[35%] rounded-full"></div>
                </div>
              </div>

              {/* Escalation bar */}
              <div className="space-y-1 font-secondary">
                <div className="flex justify-between text-xs font-semibold text-grey-600">
                  <span>Escalation Rule activated (Blocked/Direct management override)</span>
                  <span className="font-sans font-bold text-grey-900">12% Dropout rate</span>
                </div>
                {/* Horizontal progress bar */}
                <div className="w-full h-2 bg-grey-100 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full w-[12%] rounded-full"></div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* PDF PRINT PREVIEW MODAL */}
      {showPdfPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-250">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl border border-grey-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-grey-150 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-grey-900 flex items-center gap-2">
                  <Printer className="w-5 h-5 text-blue-500" />
                  <span>PDF Print Document Preview</span>
                </h3>
                <p className="text-xs text-grey-400 font-secondary mt-0.5">Print-accurate preview of the generated financial reports page.</p>
              </div>
              <button 
                onClick={() => setShowPdfPreview(false)}
                className="p-1 rounded-lg text-grey-400 hover:text-grey-700 hover:bg-grey-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Document Content */}
            <div className="p-6 overflow-y-auto flex-1 bg-grey-100 max-h-[60vh] border-b border-grey-150">
              <div className="bg-white border rounded-lg p-8 shadow-sm space-y-6 max-w-2xl mx-auto text-left font-sans">
                {/* Top header block */}
                <div className="flex justify-between items-start border-b pb-4">
                  <div className="flex items-center gap-2.5">
                    <BokLogo size={14} />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">Bōk Invoicing</h4>
                      <p className="text-xs text-grey-450 uppercase tracking-widest font-bold mt-0.5">Financial Ledger Reports</p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-grey-400 font-secondary">
                    <p className="font-bold text-grey-700 uppercase">Operational Audit Statement</p>
                    <p className="mt-0.5">Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Executive Operations Ledger</h3>
                  <p className="text-xs text-grey-400">Statement timeline context: <strong className="text-grey-600">{dateRange}</strong> &bull; Client filtering scope: <strong className="text-grey-600">{clientFilter === "All" ? "All Accounts" : clients.find(c => c.id === clientFilter)?.name}</strong></p>
                </div>

                {/* Metric Section 1 */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-50 px-2 py-1 border border-slate-100 rounded">1. Revenue & Payment Settlement Overview</h5>
                  <table className="w-full text-xs text-left border-collapse border border-slate-100">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-2 font-bold text-grey-500 text-xs uppercase">Ledger Metric</th>
                        <th className="p-2 font-bold text-grey-500 text-xs uppercase text-right">Raw Settlement Yield</th>
                        <th className="p-2 font-bold text-grey-500 text-xs uppercase">Classification Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2 text-slate-700 font-medium font-sans">Total Gross Billed Volume</td>
                        <td className="p-2 text-slate-900 font-bold font-sans text-right">{formatCurrency(totalInvoiced, reportCurrency)}</td>
                        <td className="p-2 text-grey-440">Sum bills parsed into filter context</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-700 font-medium font-sans">Collected Settled Volume</td>
                        <td className="p-2 text-green-600 font-bold font-sans text-right">{formatCurrency(totalCollected, reportCurrency)}</td>
                        <td className="p-2 text-grey-440">Cleared funds successfully receipted</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-700 font-medium font-sans">Outstanding Balance Pipeline</td>
                        <td className="p-2 text-blue-600 font-bold font-sans text-right">{formatCurrency(totalOutstanding, reportCurrency)}</td>
                        <td className="p-2 text-grey-440">Outstanding balance processing</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Metric Section 2 */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-50 px-2 py-1 border border-slate-100 rounded">2. Client Payment Speeds & Clear Ratios</h5>
                  <table className="w-full text-xs text-left border-collapse border border-slate-100">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-2 font-bold text-grey-500 text-xs uppercase">Performance Indicator</th>
                        <th className="p-2 font-bold text-grey-500 text-xs uppercase text-right">Observed Value</th>
                        <th className="p-2 font-bold text-grey-500 text-xs uppercase">Operational Assessment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2 text-slate-700 font-medium font-sans">Average Payment Period</td>
                        <td className="p-2 text-slate-900 font-bold text-right">8.3 Days</td>
                        <td className="p-2 text-grey-440">Client processing clearing well inside Net 15 limits</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-700 font-medium font-sans">Receivable Outstanding</td>
                        <td className="p-2 text-slate-900 font-bold text-right">$4,800.00</td>
                        <td className="p-2 text-grey-440">Total outstanding balance in current automation system</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-700 font-medium font-sans">Accounts Cleared Ratio</td>
                        <td className="p-2 text-slate-900 font-bold text-right">72% / 28%</td>
                        <td className="p-2 text-grey-440">72% of bills collected prior to trigger overrides</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Metric Section 3 */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-50 px-2 py-1 border border-slate-100 rounded">3. Automation Workflows & Follow-up Effectiveness</h5>
                  <table className="w-full text-xs text-left border-collapse border border-slate-100">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-2 font-bold text-grey-500 text-xs uppercase">Funnel Execution Stage</th>
                        <th className="p-2 font-bold text-grey-500 text-xs uppercase text-right">Observed Rate</th>
                        <th className="p-2 font-bold text-grey-500 text-xs uppercase">Operational Assessment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2 text-slate-700 font-medium font-sans">Paid after 1st nudge</td>
                        <td className="p-2 text-slate-900 font-bold text-right">68%</td>
                        <td className="p-2 text-grey-440">Prompt collections triggered on first warning dispatcher</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-700 font-medium font-sans">Average Nudges Per Statement</td>
                        <td className="p-2 text-slate-900 font-bold text-right">2.3</td>
                        <td className="p-2 text-grey-440">Average interactions required preceding complete clearing</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-slate-700 font-medium font-sans">Escalation recovery yield</td>
                        <td className="p-2 text-slate-900 font-bold text-right">41%</td>
                        <td className="p-2 text-grey-440">Successful balances collected following final demand releases</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Bottom Footer block */}
                <div className="border-t border-slate-150 pt-3 flex justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                  <span>Generated by Bok Invoicing Portal</span>
                  <span>Page 1 of 1</span>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-4 bg-grey-25 flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowPdfPreview(false)}
                className="px-4 py-2 border border-grey-300 text-grey-700 hover:text-black hover:bg-grey-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handlePrintPdf}
                className="flex items-center gap-2 px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF Diagram</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMBEDDED PRINTER UTILITY DOM COMPONENT (Only renders during parent window.print() triggers) */}
      <div id="print-area" className="hidden font-sans">
        <style>{`
          @media print {
            body {
              background-color: white !important;
              color: black !important;
            }
            #reports-workspace, #reports-filters-row, #revenue-overview-chart-card, #reports-bottom-split, #interactive-dropdown-filters, #report-exports, .fixed, .no-print {
              display: none !important;
              visibility: hidden !important;
            }
            #print-area, #print-area * {
              display: block !important;
              visibility: visible !important;
            }
            #print-area {
              display: block !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              background-color: white !important;
              padding: 24px !important;
            }
          }
        `}</style>
        
        {/* Print Layout */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <div className="flex items-center gap-2">
            <BokLogo size={14} />
            <div>
              <h1 className="text-base font-bold text-black font-sans leading-none">Bōk Invoicing</h1>
              <p className="text-xs text-grey-500 uppercase tracking-widest font-bold mt-1">Financial Report Statements Ledger</p>
            </div>
          </div>
          <div className="text-right text-xs text-grey-500 font-secondary">
            <p className="font-semibold text-black uppercase">Operational Audit Ledger</p>
            <p className="mt-0.5">Report Printed: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="space-y-1 mb-6">
          <h2 className="text-xl font-bold text-black tracking-tight">Executive Performance & Yield Analytics</h2>
          <p className="text-xs text-grey-500">Statement timeline context: <strong>{dateRange}</strong> &bull; Client scope: <strong>{clientFilter === "All" ? "All active accounts" : clients.find(c => c.id === clientFilter)?.name}</strong></p>
        </div>

        {/* SECTION 1 */}
        <div className="mb-6 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black border-b pb-1 mb-2">1. Revenue & Payment Settlement Overview</h3>
          <table className="w-full text-left text-xs border border-collapse border-grey-200">
            <thead>
              <tr className="bg-grey-50">
                <th className="p-2 border font-bold">Ledger Metric</th>
                <th className="p-2 border font-bold text-right">Settlement Yield</th>
                <th className="p-2 border font-bold">Accounting Category Definition</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border font-semibold">Total Gross Billed Volume</td>
                <td className="p-2 border font-bold text-right">{formatCurrency(totalInvoiced, reportCurrency)}</td>
                <td className="p-2 border text-grey-600">Total invoice balances parsed into the filter scope.</td>
              </tr>
              <tr>
                <td className="p-2 border font-semibold">Collected Settled Volume</td>
                <td className="p-2 border font-bold text-right text-green-700">{formatCurrency(totalCollected, reportCurrency)}</td>
                <td className="p-2 border text-grey-600">Cleared collections that completed processing standard payment hooks.</td>
              </tr>
              <tr>
                <td className="p-2 border font-semibold">Remaining Outstanding Balance</td>
                <td className="p-2 border font-bold text-right text-orange-700">{formatCurrency(totalOutstanding, reportCurrency)}</td>
                <td className="p-2 border text-grey-600">Outstanding balances currently processing under auto-reminders.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 2 */}
        <div className="mb-6 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black border-b pb-1 mb-2">2. Client Payment Speeds & Clear Ratios</h3>
          <table className="w-full text-left text-xs border border-collapse border-grey-200">
            <thead>
              <tr className="bg-grey-50">
                <th className="p-2 border font-bold">Performance Indicator</th>
                <th className="p-2 border font-bold text-right">Observed Rate / Standard</th>
                <th className="p-2 border font-bold">Operational Assessment</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border font-semibold">Average Payment Period</td>
                <td className="p-2 border font-bold text-right">8.3 Days</td>
                <td className="p-2 border text-grey-600">Client processing clearing well inside the standard Net 15 limits.</td>
              </tr>
              <tr>
                <td className="p-2 border font-semibold">Receivable Outstanding</td>
                <td className="p-2 border font-bold text-right">$4,800.00</td>
                <td className="p-2 border text-grey-600">Capital actively flagged in reminders queue.</td>
              </tr>
              <tr>
                <td className="p-2 border font-semibold">Accounts Cleared Ratio</td>
                <td className="p-2 border font-bold text-right">72% / 28%</td>
                <td className="p-2 border text-grey-600">72% of generated invoices settled without human overrides.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 3 */}
        <div className="mb-8 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black border-b pb-1 mb-2">3. Automation Workflows & Follow-up Effectiveness</h3>
          <table className="w-full text-left text-xs border border-collapse border-grey-200">
            <thead>
              <tr className="bg-grey-50">
                <th className="p-2 border font-bold">Notification Funnel Step</th>
                <th className="p-2 border font-bold text-right">Observed Rate</th>
                <th className="p-2 border font-bold">Operational Nudge Assessment</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border font-semibold">Paid after 1st nudge</td>
                <td className="p-2 border font-bold text-right">68%</td>
                <td className="p-2 border text-grey-600">First-level friendly dispatch results in balance collection velocity.</td>
              </tr>
              <tr>
                <td className="p-2 border font-semibold">Average Nudges Per Statement</td>
                <td className="p-2 border font-bold text-right">2.3</td>
                <td className="p-2 border text-grey-600">Expected interactions needed prior to balance capture.</td>
              </tr>
              <tr>
                <td className="p-2 border font-semibold">Escalation recovery yield</td>
                <td className="p-2 border font-bold text-right">41%</td>
                <td className="p-2 border text-grey-600">Percentage of accounts recovering pending formal warning dispatches.</td>
              </tr>
              <tr>
                <td className="p-2 border font-semibold">Highest Trigger Template</td>
                <td className="p-2 border font-bold text-right">Friendly (78%)</td>
                <td className="p-2 border text-grey-600">Ideal template copy context for automated reminders scheduling.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t pt-4 mt-12 flex justify-between text-xs text-grey-400 uppercase tracking-widest font-bold">
          <span>Generated by Bok Invoicing Automated Systems</span>
          <span>Page 1 of 1</span>
        </div>
      </div>

    </div>
  );
}