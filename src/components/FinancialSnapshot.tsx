import { FileText, ArrowUpRight, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Invoice, convertCurrency, formatCurrency } from "../types";

interface FinancialSnapshotProps {
  invoices: Invoice[];
  activeCurrency?: string;
}

// Global exchange calculations for consolidated metrics
const FINANCIAL_EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.25,
  SEK: 0.095,
  NGN: 0.00067
};

export default function FinancialSnapshot({ invoices, activeCurrency = "original" }: FinancialSnapshotProps) {
  // Helpers
  const convertToUsd = (amount: number, currency: string) => {
    const rate = FINANCIAL_EXCHANGE_RATES[currency] || 1.0;
    return amount * rate;
  };

  // Let's resolve currency by inspect clientId
  const getInvoiceCurrency = (inv: Invoice): string => {
    if (inv.clientId === "cnt-bright") return "EUR";
    if (inv.clientId === "cnt-lagos" || inv.clientId === "cnt-kemi") return "NGN";
    if (inv.clientId === "cnt-olaolu") return "GBP";
    return "USD"; // Default
  };

  const stats = invoices.reduce(
    (acc, inv) => {
      const currency = getInvoiceCurrency(inv);
      const usdValue = convertToUsd(inv.amount, currency);
      
      acc.totalInvoiced += usdValue;
      
      if (inv.status === "Paid") {
        acc.paid += usdValue;
      } else if (inv.status !== "Draft") {
        acc.outstanding += usdValue;
        if (inv.status === "Overdue") {
          acc.overdue += usdValue;
        }
      }
      return acc;
    },
    { totalInvoiced: 0, outstanding: 0, paid: 0, overdue: 0 }
  );

  // Convert stats to global presentation currency
  const presentationCurrency = activeCurrency === "original" ? "USD" : activeCurrency;
  
  const displayOutstanding = convertCurrency(stats.outstanding, "USD", presentationCurrency);
  const displayInvoiced = convertCurrency(stats.totalInvoiced, "USD", presentationCurrency);
  const displayPaid = convertCurrency(stats.paid, "USD", presentationCurrency);
  const displayOverdue = convertCurrency(stats.overdue, "USD", presentationCurrency);

  const formatSnapshotCurrency = (amount: number) => {
    // We format with dynamic presentation currency symbol
    return formatCurrency(amount, presentationCurrency);
  };

  const cards = [
    {
      id: "outstanding",
      label: "Total Outstanding",
      value: formatSnapshotCurrency(displayOutstanding),
      icon: Clock,
      iconColor: "text-blue-500",
      trend: "↑ 4.2% this month",
      trendUp: true,
      subtext: "Awaiting client payments"
    },
    {
      id: "invoiced",
      label: "Total Invoiced",
      value: formatSnapshotCurrency(displayInvoiced),
      icon: FileText,
      iconColor: "text-grey-500",
      trend: "↑ 12.8% vs last month",
      trendUp: true,
      subtext: "Gross billed freelance hours"
    },
    {
      id: "received",
      label: "Payments Received",
      value: formatSnapshotCurrency(displayPaid),
      icon: CheckCircle2,
      iconColor: "text-green-600",
      trend: "↑ 18.2% cleared success",
      trendUp: true,
      subtext: "Cleared and settled funds"
    },
    {
      id: "overdue",
      label: "Overdue Amount",
      value: formatSnapshotCurrency(displayOverdue),
      icon: AlertCircle,
      iconColor: "text-red-500",
      trend: "↓ 2.1% reminder recovery",
      trendUp: false,
      subtext: "Past payment deadline"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="financial-snapshot-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={`kpi-${card.id}`}
            className="bg-white rounded-xl border-[0.5px] border-grey-200/60 p-5 flex flex-col justify-between transition-all hover:border-grey-300"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-grey-500 uppercase tracking-wider">{card.label}</span>
              <div className={card.iconColor}>
                <Icon className="w-5 h-5 stroke-[1.8]" />
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-3xl font-bold tracking-tight text-grey-900 leading-none">
                {card.value}
              </h3>
              <p className="text-xs text-grey-450 mt-1 font-secondary">{card.subtext}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-grey-50 flex items-center gap-1.5 text-xs">
              <span className={`font-semibold ${
                card.id === "overdue"
                  ? "text-red-500"
                  : "text-green-600"
              }`}>
                {card.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
