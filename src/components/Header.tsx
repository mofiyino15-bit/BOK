import { useState, useEffect, useRef } from "react";
import { Bell, ChevronDown, User, Settings, LogOut, Menu } from "lucide-react";

interface HeaderProps {
  activeCurrency: string;
  setActiveCurrency: (currency: string) => void;
  onNavigate?: (route: string, params?: Record<string, any>) => void;
  onOpenSidebar?: () => void;
}

const currencies = [
  { code: "USD", flag: "🇺🇸", label: "USD" },
  { code: "EUR", flag: "🇪🇺", label: "EUR" },
  { code: "GBP", flag: "🇬🇧", label: "GBP" },
  { code: "NGN", flag: "🇳🇬", label: "NGN" },
];

const systemNotifications = [
  {
    id: "notif-1",
    title: "Invoice Settled Successfully",
    description: "Lagos Prints Corp cleared INV-0038 via standard bank transfer route.",
    status: "Processed",
    route: "reports",
  },
  {
    id: "notif-2",
    title: "Automated Escalation Sent",
    description: "Reminder auto-nudge dispatched to Copenhagen Labs for Net 15 limit interval.",
    status: "Sent",
    route: "invoices",
  },
  {
    id: "notif-3",
    title: "Weekly Log Audit Ready",
    description: "Weekly pipeline performance integrity report processed and ready for your review.",
    status: "Ready",
    route: "reports",
  }
];

export default function Header({ activeCurrency, setActiveCurrency, onNavigate, onOpenSidebar }: HeaderProps) {
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const currencyRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setCurrencyOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const currentCode = activeCurrency === "original" ? "USD" : activeCurrency;
  const currentCurrency = currencies.find((c) => c.code === currentCode) || currencies[0];

  const notificationsCount = systemNotifications.length;

  const handleCurrencySelect = (code: string) => {
    setActiveCurrency(code);
    setCurrencyOpen(false);
  };

  const handleUserOptionClick = (option: string) => {
    setUserDropdownOpen(false);
    if (option === "logout") {
      if (onNavigate) {
        onNavigate("login");
      } else {
        alert("This mockup has been configured with local-only state. Log out is simulated.");
      }
    } else if (option === "profile" || option === "settings") {
      if (onNavigate) {
        onNavigate("profile-settings", { activeTab: option });
      }
    }
  };

  return (
    <header 
      className="h-16 shrink-0 flex items-center justify-between px-6 sm:px-10 select-none bg-transparent relative z-55" 
      id="global-header"
    >
      {/* Left side shows hamburger on mobile/tablet */}
      <div id="header-left-pane" className="flex items-center">
        {onOpenSidebar && (
          <button
            id="header-sidebar-toggle"
            onClick={onOpenSidebar}
            className="lg:hidden p-2 -ml-2 text-grey-600 hover:text-grey-900 transition-colors cursor-pointer rounded-lg"
            title="Open Menu"
          >
            <Menu className="w-5.5 h-5.5 stroke-[2.2]" />
          </button>
        )}
      </div>

      {/* Right side controls, space-separated only - no dividers */}
      <div className="flex items-center gap-6" id="header-right-pane">
        
        {/* Currency Switcher */}
        <div className="relative" ref={currencyRef} id="header-currency-switcher-container">
          <button
            id="header-currency-trigger"
            onClick={() => setCurrencyOpen(!currencyOpen)}
            className="flex items-center gap-1.5 text-sm font-semibold text-grey-750 hover:text-grey-950 transition-colors cursor-pointer"
          >
            <span className="text-base leading-none">{currentCurrency.flag}</span>
            <span className="font-sans">{currentCurrency.code}</span>
            <ChevronDown className="w-3.5 h-3.5 text-grey-450 stroke-[2.5]" />
          </button>

          {/* Currency Dropdown Menu */}
          {currencyOpen && (
            <div 
              className="absolute right-0 mt-2 w-32 bg-white border border-grey-100 rounded-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
              id="header-currency-dropdown"
            >
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  id={`header-currency-opt-${curr.code}`}
                  onClick={() => handleCurrencySelect(curr.code)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium transition-colors hover:bg-grey-50 text-left cursor-pointer ${
                    curr.code === currentCode ? "text-blue-600 bg-blue-50" : "text-grey-700 hover:text-grey-950"
                  }`}
                >
                  <span className="text-sm">{curr.flag}</span>
                  <span className="font-sans">{curr.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative flex items-center" ref={notificationRef} id="header-notification-bell-container">
          <button
            id="header-notification-bell"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-1 text-grey-500 hover:text-grey-800 transition-colors cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5 stroke-[2]" />
            {/* Outline icon, small red dot badge only (no number) */}
            <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* Systems Alerts & Process Notifications Dropdown */}
          {notificationsOpen && (
            <div
              className="absolute -right-12 sm:right-0 top-full mt-2 w-[calc(100vw-2.5rem)] xs:w-80 sm:w-96 bg-white border border-grey-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left"
              id="header-notifications-dropdown"
            >
              <div className="flex items-center justify-between border-b border-grey-100 pb-3 mb-3">
                <div>
                  <h3 className="font-sans font-bold text-gray-900 text-sm">System Notifications</h3>
                  <p className="text-xs text-grey-450 mt-0.5">Real-time status updates and ledger alerts</p>
                </div>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200/50">
                  ALL CAUGHT UP
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {systemNotifications.map((task) => (
                  <div
                    key={task.id}
                    id={`onboarding-task-${task.id}`}
                    onClick={() => {
                      setNotificationsOpen(false);
                      if (onNavigate) {
                        onNavigate(task.route);
                      } else {
                        alert(`Mock Navigation: Redirecting to ${task.route}`);
                      }
                    }}
                    className="p-3 rounded-xl border border-grey-100 hover:border-grey-250 hover:bg-grey-25 transition-all cursor-pointer group text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <h4 className="text-xs font-bold text-grey-800 group-hover:text-blue-600 transition-colors">
                          {task.title}
                        </h4>
                      </div>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                        {task.status}
                      </span>
                    </div>
                    <p className="text-xs text-grey-450 mt-1 leading-relaxed pl-4 font-secondary">
                      {task.description}
                    </p>
                    <div className="mt-2 flex items-center justify-end text-xs font-bold text-blue-500 group-hover:translate-x-1 transition-transform pl-4 opacity-0 group-hover:opacity-100">
                      <span>View details &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Dropdown */}
        <div className="relative" ref={userRef} id="header-user-avatar-container">
          <button
            id="header-user-avatar-trigger"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="w-9 h-9 rounded-full bg-emerald-100 hover:bg-emerald-250 text-emerald-800 flex items-center justify-center font-bold text-sm tracking-tight transition-colors cursor-pointer"
          >
            MO
          </button>

          {/* User Options Dropdown */}
          {userDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-white border border-grey-100 rounded-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
              id="header-user-dropdown"
            >
              <div className="px-3.5 py-2 border-b border-grey-50">
                <p className="text-xs font-semibold text-grey-900 truncate">Mofiyinfoluwa</p>
                <p className="text-xs text-grey-400 truncate">Freelancer</p>
              </div>
              <button
                id="header-user-opt-profile"
                onClick={() => handleUserOptionClick("profile")}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-grey-700 hover:text-grey-900 hover:bg-grey-50 text-left transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-grey-450" />
                <span>Profile</span>
              </button>
              <button
                id="header-user-opt-settings"
                onClick={() => handleUserOptionClick("settings")}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-grey-700 hover:text-grey-900 hover:bg-grey-50 text-left transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-grey-450" />
                <span>Settings</span>
              </button>
              <hr className="border-grey-50 my-1" />
              <button
                id="header-user-opt-logout"
                onClick={() => handleUserOptionClick("logout")}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 text-left transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
