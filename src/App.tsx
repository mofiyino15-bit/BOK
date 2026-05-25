import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import InvoicesList from "./components/InvoicesList";
import CreateInvoice from "./components/CreateInvoice";
import InvoiceDetail from "./components/InvoiceDetail";
import ClientsList from "./components/ClientsList";
import ClientDetail from "./components/ClientDetail";
import AddClient from "./components/AddClient";
import Reports from "./components/Reports";
import ProfileSettings from "./components/ProfileSettings";

import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Landing from "./components/Landing";

import { Invoice, Client, INITIAL_CLIENTS, INITIAL_INVOICES } from "./types";

export default function App() {
  // Global React Context States for the Mock environment
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);

  // Client-side state routing
  const [currentRoute, setCurrentRoute] = useState<string>("landing");
  const [routeParams, setRouteParams] = useState<Record<string, any>>({});
  const [activeCurrency, setActiveCurrency] = useState<string>("original");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const handleNavigate = (route: string, params: Record<string, any> = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    // Smoothly scroll back to top of workspace viewport
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // State modifiers
  const handleAddInvoice = (newInvoice: Invoice) => {
    setInvoices([newInvoice, ...invoices]);
  };

  const handleAddClient = (newClient: Client) => {
    setClients([newClient, ...clients]);
  };

  const handleUpdateInvoiceStatus = (invoiceId: string, status: Invoice["status"]) => {
    setInvoices(
      invoices.map((inv) => {
        if (inv.id === invoiceId) {
          const updatedLog = [
            ...inv.activityLog,
            {
              id: "act-u-" + Date.now(),
              action: `Invoice status changed to ${status}`,
              date: "2026-05-23" // Relative to current local mock time
            }
          ];

          return {
            ...inv,
            status,
            activityLog: updatedLog
          };
        }
        return inv;
      })
    );
  };

  const handleSendReminder = (invoiceId: string) => {
    setInvoices(
      invoices.map((inv) => {
        if (inv.id === invoiceId) {
          const clientObj = clients.find((c) => c.id === inv.clientId);
          const emailRecipient = clientObj ? clientObj.email : "client inbox";
          const updatedLog = [
            ...inv.activityLog,
            {
              id: "act-remind-" + Date.now(),
              action: "Reminder Emailed",
              date: "2026-05-23",
              details: `Auto-dispatched friendly warning template to: ${emailRecipient}`
            }
          ];

          return {
            ...inv,
            reminderStatus: "Sent" as const,
            activityLog: updatedLog
          };
        }
        return inv;
      })
    );
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoices(invoices.filter((inv) => inv.id !== invoiceId));
  };

  const handleDeleteClient = (clientId: string) => {
    setClients(clients.filter((c) => c.id !== clientId));
  };

  const handleUpdateClientRiskLevel = (clientId: string, riskLevel: Client["riskLevel"]) => {
    setClients(
      clients.map((c) => (c.id === clientId ? { ...c, riskLevel } : c))
    );
  };

  const handleUpdateClientStatus = (clientId: string, status: Client["status"]) => {
    setClients(
      clients.map((c) => (c.id === clientId ? { ...c, status } : c))
    );
  };

  // Render Page Zone
  const renderRouteView = () => {
    switch (currentRoute) {
      case "login":
        return <Login onNavigate={handleNavigate} />;
      case "signup":
        return <SignUp onNavigate={handleNavigate} />;
      case "landing":
        return <Landing onNavigate={handleNavigate} />;
      case "dashboard":
        return (
          <Dashboard
            invoices={invoices}
            clients={clients}
            onNavigate={handleNavigate}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            onSendReminder={handleSendReminder}
            activeCurrency={activeCurrency}
            setActiveCurrency={setActiveCurrency}
          />
        );
      case "invoices":
        return (
          <InvoicesList
            invoices={invoices}
            clients={clients}
            onNavigate={handleNavigate}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            onDeleteInvoice={handleDeleteInvoice}
            activeCurrency={activeCurrency}
          />
        );
      case "create-invoice":
        return (
          <CreateInvoice
            clients={clients}
            invoices={invoices}
            onAddInvoice={handleAddInvoice}
            onNavigate={handleNavigate}
            activeCurrency={activeCurrency}
          />
        );
      case "invoice-detail":
        return (
          <InvoiceDetail
            invoiceId={routeParams.invoiceId || ""}
            invoices={invoices}
            clients={clients}
            onNavigate={handleNavigate}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            onSendReminder={handleSendReminder}
            activeCurrency={activeCurrency}
          />
        );
      case "clients":
        return (
          <ClientsList
            clients={clients}
            invoices={invoices}
            onNavigate={handleNavigate}
            onDeleteClient={handleDeleteClient}
            onUpdateClientRiskLevel={handleUpdateClientRiskLevel}
            onUpdateClientStatus={handleUpdateClientStatus}
            activeCurrency={activeCurrency}
          />
        );
      case "add-client":
        return (
          <AddClient
            onAddClient={handleAddClient}
            onNavigate={handleNavigate}
          />
        );
      case "client-detail":
        return (
          <ClientDetail
            clientId={routeParams.clientId || ""}
            clients={clients}
            invoices={invoices}
            onNavigate={handleNavigate}
            onSendReminder={handleSendReminder}
            activeCurrency={activeCurrency}
          />
        );
      case "reports":
        return (
          <Reports
            invoices={invoices}
            clients={clients}
            activeCurrency={activeCurrency}
            onNavigate={handleNavigate}
          />
        );
      case "profile-settings":
        return (
          <ProfileSettings
            onNavigate={handleNavigate}
            initialTab={routeParams.activeTab || "profile"}
            activeCurrency={activeCurrency}
            setActiveCurrency={setActiveCurrency}
          />
        );
      default:
        return (
          <div className="text-center py-20 font-secondary">
            <h2 className="text-xl font-bold">Something went askew</h2>
            <p className="text-grey-400 mt-2">The requested view could not be rendered.</p>
            <button
              onClick={() => handleNavigate("dashboard")}
              className="mt-6 bg-blue-500 text-white rounded px-4 py-2 cursor-pointer font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        );
    }
  };

  // Standalone pages check
  const isStandalone = ["login", "signup", "landing"].includes(currentRoute);

  if (isStandalone) {
    return (
      <div 
        className={`w-screen h-screen ${currentRoute === "landing" ? "overflow-y-auto" : "overflow-hidden"} bg-white`} 
        id="standalone-view-container"
      >
        {renderRouteView()}
      </div>
    );
  }

  return (
    <div 
      className="flex h-screen overflow-hidden relative bg-[#f8f8f8]" 
      id="bok-application-canvas"
    >
      {/* Background image layer at 15% opacity with absolute scale and Gaussian blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ 
          backgroundImage: "url('/src/assets/images/ribbon_backdrop_1779651790316.png')",
          opacity: 0.15,
          filter: "blur(48px)",
          transform: "scale(1.15)", // Premium scale preventing white corner halo bleeding
        }}
      />

      {/* Frosted glass backdrop layer overlaying the background image under content */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[8px] pointer-events-none z-0" />

      {/* 220px Fixed Left Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile Backdrop dimmer for Sidebar Drawer */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 transition-opacity"
          id="sidebar-mobile-backdrop"
        />
      )}

      {/* Primary Container with Global Header and Scrollable Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10" id="viewports-root">
        {/* Global Header (64px tall, sitting flush and clean above the content) */}
        <Header 
          activeCurrency={activeCurrency} 
          setActiveCurrency={setActiveCurrency} 
          onNavigate={handleNavigate}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        {/* Scrollable Contents */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-[40px] lg:px-[80px] pt-6 sm:pt-[40px] pb-6 sm:pb-[40px]" id="viewports-scroll-area">
          <div className="w-full" id="viewports-container">
            {renderRouteView()}
          </div>
        </div>
      </main>
    </div>
  );
}
