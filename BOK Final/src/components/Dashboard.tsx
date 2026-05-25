import FinancialSnapshot from "./FinancialSnapshot";
import FollowUpIntelligence from "./FollowUpIntelligence";
import RecentInvoices from "./RecentInvoices";
import QuickActions from "./QuickActions";
import { Invoice, Client } from "../types";

interface DashboardProps {
  invoices: Invoice[];
  clients: Client[];
  onNavigate: (route: string, params?: Record<string, any>) => void;
  onUpdateInvoiceStatus: (id: string, status: Invoice["status"]) => void;
  onSendReminder: (id: string) => void;
  activeCurrency: string;
  setActiveCurrency: (currency: string) => void;
}

export default function Dashboard({
  invoices,
  clients,
  onNavigate,
  onUpdateInvoiceStatus,
  onSendReminder,
  activeCurrency,
  setActiveCurrency
}: DashboardProps) {
  return (
    <div className="space-y-6" id="dashboard-viewport">
      {/* Top Welcome and Quick Actions Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-grey-100" id="dashboard-header-block">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-grey-900" id="main-dashboard-title">
            Dashboard
          </h1>
          <p className="text-sm text-grey-400 font-secondary mt-0.5">
            Welcome back, Mofiyinfoluwa
          </p>
        </div>
        <QuickActions
          onNavigate={onNavigate}
        />
      </div>

      {/* Grid structure: 9 col left, 3 col right */}
      <div className="grid grid-cols-12 gap-6" id="dashboard-layout-grid">
        {/* Left Side (col-span-9 Desktop, col-span-12 Tablet/Mobile) */}
        <div className="col-span-12 lg:col-span-9 space-y-6" id="dashboard-left-zone">
          <FinancialSnapshot invoices={invoices} activeCurrency={activeCurrency} />
          <RecentInvoices
            invoices={invoices}
            clients={clients}
            onNavigate={onNavigate}
            onUpdateInvoiceStatus={onUpdateInvoiceStatus}
            activeCurrency={activeCurrency}
          />
        </div>

        {/* Right Side (col-span-3 Desktop, col-span-12 Tablet/Mobile) */}
        <div className="col-span-12 lg:col-span-3 h-full" id="dashboard-right-zone">
          <FollowUpIntelligence
            invoices={invoices}
            clients={clients}
            onUpdateInvoiceStatus={onUpdateInvoiceStatus}
            onSendReminder={onSendReminder}
            activeCurrency={activeCurrency}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
}
