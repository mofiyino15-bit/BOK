import React, { useState } from "react";
import { User, Settings, Save, ArrowLeft, Building2, Mail, Globe, Sparkles } from "lucide-react";

interface ProfileSettingsProps {
  onNavigate: (route: string) => void;
  initialTab?: "profile" | "settings";
  activeCurrency: string;
  setActiveCurrency: (currency: string) => void;
}

export default function ProfileSettings({
  onNavigate,
  initialTab = "profile",
  activeCurrency,
  setActiveCurrency,
}: ProfileSettingsProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "settings">(initialTab);
  
  // Form states
  const [businessName, setBusinessName] = useState("Mofiyinfoluwa & Co.");
  const [repName, setRepName] = useState("Mofiyinfoluwa");
  const [email, setEmail] = useState("the.witness.rc@gmail.com");
  const [phone, setPhone] = useState("+234 812 3456 789");
  const [taxId, setTaxId] = useState("RC-9023412");
  
  // Settings states
  const [autoNudges, setAutoNudges] = useState(true);
  const [integrityReports, setIntegrityReports] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 4000);
  };

  return (
    <div id="settings-workspace" className="space-y-6">
      {/* Title Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-grey-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("dashboard")}
            className="p-1.5 hover:bg-grey-50 rounded-lg text-grey-500 hover:text-grey-900 transition-colors cursor-pointer"
            title="Back to Dashboard"
            id="back-to-dashboard-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-sans font-bold text-grey-900 tracking-tight leading-none">
              Account Headquarters
            </h1>
            <p className="text-xs text-grey-450 mt-1 font-secondary">
              Review and manage representative profiles, business attributes, and billing settings.
            </p>
          </div>
        </div>

        {/* Saved Toast Status Alert inside Header */}
        {saveSuccess && (
          <div
            id="settings-save-alert"
            className="flex items-center gap-2 bg-green-100/90 text-green-700 border border-green-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold animate-in fade-in slide-in-from-right duration-200"
          >
            <Sparkles className="w-4 h-4 text-green-500 shrink-0" />
            <span>Success: Preferences secured and saved!</span>
          </div>
        )}
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-grey-150 gap-6" id="settings-tab-bar">
        <button
          onClick={() => setActiveTab("profile")}
          id="settings-tab-profile"
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "profile"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-grey-500 hover:text-grey-900"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Representative Profile</span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          id="settings-tab-system"
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "settings"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-grey-500 hover:text-grey-900"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>System Settings & Rules</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left main form block */}
        <div className="col-span-12 lg:col-span-8">
          <form onSubmit={handleSave} className="bg-white rounded-xl border-[0.5px] border-grey-200/80 p-6 space-y-6">
            {activeTab === "profile" ? (
              <div className="space-y-4" id="profile-form-pane">
                <h2 className="text-base font-bold text-grey-900 font-sans border-b border-grey-50 pb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-grey-450" />
                  <span>Business Representative Details</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-grey-600 uppercase tracking-wider block">
                      Legal Entity Name
                    </label>
                    <input
                      type="text"
                      className="w-full border border-grey-200 rounded-lg text-sm px-3.5 py-2.5 bg-grey-25/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-grey-800"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                      id="input-business-name"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-grey-600 uppercase tracking-wider block">
                      Representative Name
                    </label>
                    <input
                      type="text"
                      className="w-full border border-grey-200 rounded-lg text-sm px-3.5 py-2.5 bg-grey-25/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-grey-800"
                      value={repName}
                      onChange={(e) => setRepName(e.target.value)}
                      required
                      id="input-rep-name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-grey-600 uppercase tracking-wider block">
                      Business Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full border border-grey-200 rounded-lg text-sm px-3.5 py-2.5 bg-grey-25/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-grey-800"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      id="input-email"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-grey-600 uppercase tracking-wider block">
                      Contact Mobile Number
                    </label>
                    <input
                      type="text"
                      className="w-full border border-grey-200 rounded-lg text-sm px-3.5 py-2.5 bg-grey-25/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-grey-800"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      id="input-phone"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 max-w-sm">
                  <label className="text-xs font-bold text-grey-600 uppercase tracking-wider block">
                    Tax / VAT Identification Number (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-grey-200 rounded-lg text-sm px-3.5 py-2.5 bg-grey-25/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-grey-800 placeholder-grey-400"
                    placeholder="e.g. VAT-XX-YYYY"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    id="input-tax-id"
                  />
                  <span className="text-[11px] text-grey-450 block font-secondary">
                    Printed in details metadata footer block of issued PDF invoices.
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-5" id="settings-form-pane">
                <h2 className="text-base font-bold text-grey-900 font-sans border-b border-grey-50 pb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-grey-450" />
                  <span>Operations & Regional Preferences</span>
                </h2>

                {/* Currency preference selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-grey-600 uppercase tracking-wider block">
                    Primary Headquarters Currency
                  </label>
                  <div className="flex flex-wrap gap-2.5" id="currency-presets-container">
                    {[
                      { code: "USD", flag: "🇺🇸", label: "US Dollar ($)" },
                      { code: "EUR", flag: "🇪🇺", label: "Euro (€)" },
                      { code: "GBP", flag: "🇬🇧", label: "British Pound (£)" },
                      { code: "NGN", flag: "🇳🇬", label: "Nigerian Naira (₦)" },
                    ].map((curr) => {
                      const isSelected = activeCurrency === curr.code || (activeCurrency === "original" && curr.code === "USD");
                      return (
                        <button
                          type="button"
                          key={curr.code}
                          onClick={() => setActiveCurrency(curr.code)}
                          className={`flex items-center gap-2 px-3.5 py-2 border rounded-xl text-left text-xs font-semibold select-none cursor-pointer transition-all ${
                            isSelected
                              ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                              : "border-grey-200 bg-white text-grey-700 hover:bg-grey-25"
                          }`}
                        >
                          <span>{curr.flag}</span>
                          <span>{curr.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[11px] text-grey-450 block font-secondary mt-1">
                    Selects your principal exchange denomination for general metrics computations.
                  </span>
                </div>

                <hr className="border-grey-100" />

                <h2 className="text-sm font-bold text-grey-950 font-sans pt-1">Escalations Automation</h2>

                {/* Automation triggers */}
                <div className="space-y-4">
                  <div 
                    onClick={() => setAutoNudges(!autoNudges)}
                    className="flex items-start gap-3 p-3.5 border border-grey-150 rounded-xl hover:bg-grey-25 transition-colors cursor-pointer"
                    id="toggle-setting-nudges"
                  >
                    <input
                      type="checkbox"
                      checked={autoNudges}
                      onChange={() => {}} // Handle on parent div click cleanly
                      className="mt-1 h-4 w-4 rounded-sm text-blue-500 border-grey-300 focus:ring-blue-400"
                    />
                    <div>
                      <span className="text-xs font-bold text-grey-900 block leading-tight">
                        Enable Automated Escalate Nudges
                      </span>
                      <span className="text-[11px] text-grey-450 block mt-1 font-secondary leading-relaxed">
                        Whenever an invoice has exceeded its timeline and hits the warning milestone, Bōk automatically sends a friendly reminder templates dispatch directly.
                      </span>
                    </div>
                  </div>

                  <div 
                    onClick={() => setIntegrityReports(!integrityReports)}
                    className="flex items-start gap-3 p-3.5 border border-grey-150 rounded-xl hover:bg-grey-25 transition-colors cursor-pointer"
                    id="toggle-setting-reports"
                  >
                    <input
                      type="checkbox"
                      checked={integrityReports}
                      onChange={() => {}}
                      className="mt-1 h-4 w-4 rounded-sm text-blue-500 border-grey-300 focus:ring-blue-400"
                    />
                    <div>
                      <span className="text-xs font-bold text-grey-900 block leading-tight">
                        Weekly Pipeline Integrity Reports
                      </span>
                      <span className="text-[11px] text-grey-450 block mt-1 font-secondary leading-relaxed">
                        Send automated summary performance audits to your registered primary email address every Friday at 17:00.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Action Row */}
            <div className="pt-4 border-t border-grey-100 flex items-center justify-between gap-4">
              <span className="text-xs text-grey-450 font-secondary">
                Last modified: 2026-05-24 UTC
              </span>
              <button
                type="submit"
                id="submit-save-preferences-btn"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save General Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Info Sidebar Element */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-grey-25 border border-grey-200/60 rounded-xl p-5">
            <h3 className="text-xs font-bold text-grey-800 uppercase tracking-widest block border-b border-grey-150 pb-2">
              Bōk HQ Hierarchy Info
            </h3>
            <ul className="mt-4 space-y-3.5 text-xs text-grey-600 font-secondary leading-relaxed">
              <li>
                <strong className="text-grey-900 block font-sans font-bold">Billing Currency Integration</strong>
                When activeCurrency from the header selector changes, it automatically recalibrates values in reports, invoices, and clients.
              </li>
              <li>
                <strong className="text-grey-900 block font-sans font-bold">Automatic Backups</strong>
                Your entity profile information, list datasets, and template configurations are securely saved onto local localforage sandboxes.
              </li>
            </ul>
          </div>

          <div className="border border-blue-100 bg-blue-50/40 p-5 rounded-xl">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider font-sans">
              Need Help With Profiles?
            </h4>
            <p className="text-xs text-grey-500 leading-relaxed mt-2 font-secondary">
              If your business requires a multi-entity workspace, separate VAT tax brackets, or Custom domain white-labeling, reach out to our concierge support desks.
            </p>
            <button
              type="button"
              onClick={() => alert("Concierge tickets are currently unavailable in this static mockup.")}
              className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Contact Concierge Desk &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
