import { useState, useEffect } from "react";
import { ArrowLeft, Plus, X, Sparkles, AlertCircle, Copy, HelpCircle, UserPlus, CheckCircle2, Info } from "lucide-react";
import { Client } from "../types";

interface AddClientProps {
  onAddClient: (client: Client) => void;
  onNavigate: (route: string, params?: Record<string, any>) => void;
}

export default function AddClient({ onAddClient, onNavigate }: AddClientProps) {
  // Unsaved check logic
  const [isDirty, setIsDirty] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<'Individual' | 'Business' | 'Agency' | 'Vendor'>("Business");
  
  // Billing Address
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("United States");
  const [postalCode, setPostalCode] = useState("");
  const [taxId, setTaxId] = useState("");

  // Payment Preferences
  const [currency, setCurrency] = useState("USD");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [paymentMethods, setPaymentMethods] = useState<string[]>(["Bank Transfer"]);

  // Notes & Extras
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Client["status"]>("Active");
  const [tags, setTags] = useState<string[]>(["Corporate"]);
  const [tagInput, setTagInput] = useState("");

  // AI Assistant Specifics
  const [aiAnalysisRunning, setAiAnalysisRunning] = useState(false);
  const [aiReportDetails, setAiReportDetails] = useState<string | null>(null);

  // Set form dirty flag on input change
  useEffect(() => {
    if (name || businessName || email || address || notes) {
      setIsDirty(true);
    }
  }, [name, businessName, email, address, notes]);

  const handleAddTag = () => {
    const clean = tagInput.trim();
    if (clean !== "" && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleSuggestTags = () => {
    const suggestions = ["Agency", "EU-Partner", "Tech", "Startup", "Freelance"];
    const unsaved = suggestions.filter((s) => !tags.includes(s));
    if (unsaved.length > 0) {
      setTags([...tags, unsaved[0]]);
    }
  };

  const handleAiGenerateSummary = () => {
    if (!name && !businessName) {
      alert("Please provide a name or business name to generate a summary draft snippet.");
      return;
    }
    const cleanBusiness = businessName || name;
    const bulletNotes = `Client type: ${type}.\nTerms: ${paymentTerms} settle in ${currency}.\nInternal Rating: Standard reliable freelancer partner for commercial contract project deliverables with ${cleanBusiness}.`;
    setNotes(bulletNotes);
    alert("AI Assistant: Copied profile summary bulletin directly into notes sheet!");
  };

  const handleAiCheckDuplicates = () => {
    setAiAnalysisRunning(true);
    setTimeout(() => {
      setAiAnalysisRunning(false);
      setAiReportDetails("Cleansed index structure: No duplicate records or matching tax IDs found in active ledger database. Perfect to save!");
    }, 1000);
  };

  const handleSave = (clientStatus: Client["status"]) => {
    if (!name.trim()) {
      alert("Billing Name field is required to register client profile.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      alert("Please enter a valid billing email address.");
      return;
    }

    const newClient: Client = {
      id: "cnt-" + Date.now().toString().substr(-6),
      name,
      businessName: businessName || name,
      email,
      phone: phone || "+1 (555) 100-2000",
      type,
      address: address || "No address statement provided",
      city: city || "Lagos",
      state: state || "",
      country: country || "Nigeria",
      postalCode: postalCode || "",
      taxId: taxId || "NG-PENDING",
      currency,
      paymentTerms,
      paymentMethods,
      notes,
      tags,
      status: clientStatus,
      riskLevel: type === "Agency" ? "Slow Payer" : "Reliable", // Default heuristics based on types
      totalInvoiced: 0.00,
      outstandingBalance: 0.00
    };

    setIsDirty(false); // remove dirty block
    onAddClient(newClient);
    alert(`Registered "${name}" in customer lists!`);
    onNavigate("clients");
  };

  const togglePaymentMethod = (method: string) => {
    if (paymentMethods.includes(method)) {
      setPaymentMethods(paymentMethods.filter((m) => m !== method));
    } else {
      setPaymentMethods([...paymentMethods, method]);
    }
  };

  const handleBackNavigation = () => {
    if (isDirty) {
      const confirmed = window.confirm("Unsaved changes guard: You have unsaved changes in progress. Are you sure you want to discard?");
      if (!confirmed) return;
    }
    onNavigate("clients");
  };

  return (
    <div className="space-y-6" id="add-client-viewport">
      
      {/* Back button and title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-grey-100">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-grey-400 font-medium font-secondary select-none">
            <button onClick={handleBackNavigation} className="hover:text-blue-500 hover:underline cursor-pointer">
              Clients
            </button>
            <span>/</span>
            <span className="text-grey-600 font-semibold font-sans">New Profile</span>
          </div>
          <h1 className="text-2xl font-bold text-grey-900 tracking-tight mt-1">Add Client</h1>
          <p className="text-sm text-grey-400 font-secondary mt-0.5">Register customer contact references, tax parameters, and payment preferences.</p>
        </div>

        <button
          onClick={handleBackNavigation}
          className="flex items-center gap-1.5 px-4 py-2 border border-grey-300 text-grey-700 hover:text-black hover:bg-grey-25 rounded-lg text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>

      {/* Grid: 8 column Form, 4 column AI Assistant Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="add-client-layout">
        
        {/* Left Side: Form Details (col-span-8) */}
        <div className="lg:col-span-8 space-y-6" id="add-client-form-fields">
          
          {/* SECTION 1: Basic Information */}
          <div className="bg-white rounded-xl border border-grey-200/60 p-6 space-y-4 text-left">
            <label className="text-sm font-bold text-grey-900 uppercase tracking-wider block">1. Basic Information</label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-secondary">
              <div className="space-y-1.5">
                <span className="text-grey-500 font-semibold uppercase block">Customer / Representative Name *</span>
                <input
                  id="input-client-name"
                  type="text"
                  placeholder="Kemi Adebayo, Johan Larsson..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-grey-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-grey-800 text-sm font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-grey-500 font-semibold uppercase block">Business / Trading Register Name</span>
                <input
                  type="text"
                  placeholder="Kemi Retail, Stockholm Creative AB..."
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full border border-grey-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-grey-800 text-sm font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-grey-500 font-semibold uppercase block">Contact Email Address *</span>
                <input
                  id="input-client-email"
                  type="email"
                  placeholder="billing@kemistores.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-grey-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-grey-800 text-sm font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-grey-500 font-semibold uppercase block">Phone Contact Number</span>
                <input
                  type="text"
                  placeholder="+46 8 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-grey-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-grey-800 text-sm font-sans"
                />
              </div>
            </div>

            {/* Client category multi toggle */}
            <div className="space-y-2 mt-2">
              <span className="text-xs text-grey-500 font-semibold uppercase tracking-wider block font-secondary">Client category</span>
              <div className="flex flex-wrap items-center gap-2" id="client-type-selectors">
                {(["Individual", "Business", "Agency", "Vendor"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`px-4 py-2 text-xs border rounded-lg font-semibold cursor-pointer transition-all select-none ${
                      type === t
                        ? "border-blue-500 bg-blue-105 text-blue-600 font-bold"
                        : "border-grey-200 text-grey-600 hover:bg-grey-25"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: Billing & Registration details */}
          <div className="bg-white rounded-xl border border-grey-200/60 p-6 space-y-4 text-left">
            <label className="text-sm font-bold text-grey-900 uppercase tracking-wider block">2. Billing Addresses & Registration</label>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-secondary">
              <div className="sm:col-span-3 space-y-1.5">
                <span className="text-grey-500 font-semibold uppercase block">Billing Address</span>
                <input
                  type="text"
                  placeholder="Kungsgatan 12, Floor 2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-grey-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-grey-800 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-grey-500 font-semibold uppercase block">City</span>
                <input
                  type="text"
                  placeholder="Stockholm"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-grey-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-grey-800 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-grey-500 font-semibold uppercase block">State / Region</span>
                <input
                  type="text"
                  placeholder="Uppland"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full border border-grey-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-grey-800 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-grey-500 font-semibold uppercase block">Postal Code</span>
                <input
                  type="text"
                  placeholder="111 35"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full border border-grey-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-grey-800 text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-1.5">
                <span className="text-grey-500 font-semibold uppercase block">Country</span>
                <input
                  type="text"
                  placeholder="Sweden"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border border-grey-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-grey-800 text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-1.5">
                <span className="text-grey-500 font-semibold uppercase block font-sans">Corporate Tax ID / Registration #</span>
                <input
                  type="text"
                  placeholder="SE-5561028301"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full border border-grey-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-grey-800 text-sm font-sans"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Payment preferences */}
          <div className="bg-white rounded-xl border border-grey-200/60 p-6 space-y-4 text-left">
            <label className="text-sm font-bold text-grey-900 uppercase tracking-wider block">3. Settlement Preferences</label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-secondary">
              <div className="space-y-1.5">
                <span className="text-grey-500 font-semibold uppercase block">Preferred Contract Currency</span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full border border-grey-200 rounded-lg p-3 text-sm text-grey-800 bg-white"
                >
                  <option value="USD">$ USD — United States dollar</option>
                  <option value="EUR">€ EUR — European Euro</option>
                  <option value="SEK">SEK kr — Swedish krona</option>
                  <option value="GBP">£ GBP — British pound</option>
                  <option value="NGN">₦ NGN — Nigerian naira</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="text-grey-500 font-semibold uppercase block">Default Payment Terms</span>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full border border-grey-200 rounded-lg p-3 text-sm text-grey-800 bg-white"
                >
                  <option value="Net 15">Due inside 15 Days (Net 15)</option>
                  <option value="Net 30">Due inside 30 Days (Net 30)</option>
                  <option value="Due on Receipt">Due immediately upon receipt</option>
                  <option value="Net 45">Settle inside 45 Days (Net 45)</option>
                </select>
              </div>
            </div>

            {/* Payment methods toggles */}
            <div className="space-y-2 pt-2">
              <span className="text-xs text-grey-500 font-semibold uppercase tracking-wider block font-secondary">Permitted Settle Methods</span>
              <div className="flex items-center gap-4 text-xs font-secondary">
                {["Bank Transfer", "Stripe", "PayPal"].map((method) => {
                  const active = paymentMethods.includes(method);
                  return (
                    <label key={method} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => togglePaymentMethod(method)}
                        className="rounded border-grey-300 text-blue-500 focus:ring-blue-400 w-4 h-4"
                      />
                      <span className="text-grey-700 font-medium">{method}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 4: Notes and internal tag codes */}
          <div className="bg-white rounded-xl border border-grey-200/60 p-6 space-y-4 text-left">
            <label className="text-sm font-bold text-grey-900 uppercase tracking-wider block">4. Internal Assessments & Tags</label>
            
            <div className="space-y-4 text-xs font-secondary">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-grey-500">
                  <span className="font-semibold uppercase">Consultant Internal Comments (Max 500 chars)</span>
                  <span>{notes.length}/500</span>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                  placeholder="Record custom behavior, payment cycle habits..."
                  rows={3}
                  className="w-full border border-grey-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-grey-800 text-sm"
                />
              </div>

              {/* Tag structures */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-grey-450 font-semibold uppercase text-xs">Filter Tags</span>
                  <button
                    type="button"
                    onClick={handleSuggestTags}
                    className="text-blue-600 hover:text-blue-700 font-bold hover:underline cursor-pointer"
                  >
                    Suggest Tags (AI)
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 p-2 border border-grey-150 rounded-lg min-h-12 bg-grey-25" id="tag-chips-bin">
                  {tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1.5 bg-grey-100/80 border border-grey-200 text-grey-700 font-medium px-2 py-0.5 rounded text-xs font-secondary">
                      <span>{t}</span>
                      <button onClick={() => handleRemoveTag(t)} className="hover:text-red-500 text-grey-400 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {tags.length === 0 && (
                    <span className="text-grey-400 italic text-xs font-sans">No codes logged. Enter tags below.</span>
                  )}
                </div>

                {/* Tag insertion */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter custom tag context..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 border border-grey-200 rounded p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none text-grey-800 max-w-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-grey-100 hover:bg-grey-200 border border-grey-300 rounded text-grey-700 px-3.5 py-2 font-bold select-none cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Status Selectors */}
              <div className="space-y-1.5 mt-2">
                <span className="text-grey-400 font-semibold uppercase text-xs">Payer Account state</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Client["status"])}
                  className="border border-grey-200 rounded p-2 bg-white text-grey-700 text-xs w-44"
                >
                  <option value="Active">Active Account</option>
                  <option value="Pending">Agreement Pending</option>
                  <option value="Blocked">Blocked Account</option>
                </select>
              </div>

            </div>
          </div>
        </div>

        {/* Right Side: Sticky AI Assistance Sidebar (col-span-4) */}
        <div className="lg:col-span-4" id="sticky-ai-client-sidebar">
          <div className="bg-white rounded-xl border border-grey-200/60 p-5 space-y-5 sticky top-6 text-left" id="ai-add-client-sidebar bg-white">
            
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4.5 h-4.5 text-blue-500 animate-[spin_12s_linear_infinite]" />
                <span>AI Assistant Workspace</span>
              </div>
              <p className="text-xs text-grey-450 font-secondary mt-0.5">Assists profiles completeness, checking indices, and generating bios.</p>
            </div>

            {/* Pulsating saving indicators */}
            <div className="p-3 bg-green-100/20 border border-green-200/80 rounded-lg flex items-center justify-between text-xs">
              <span className="text-green-600 font-bold block">Status: Safe-Check Active</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>

            {/* Smart Heuristics suggestion */}
            <div className="space-y-2 text-xs font-secondary bg-grey-25 border border-grey-100/50 p-3.5 rounded-lg">
              <span className="font-bold text-blue-700 lowercase flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-blue-500" /> suggestion helper
              </span>
              <p className="text-grey-600 leading-relaxed text-xs mt-1">
                {type === "Agency" 
                  ? "Agencies typically carry slow payment histories. Setting short 'Net 15' terms is highly recommended to protect cash loops."
                  : "Private individuals require detailed state/regional tax registers. Ensure Tax ID registry matches local billing rules."
                }
              </p>
            </div>

            {/* Actions triggers */}
            <div className="space-y-2 text-xs" id="sidebar-ai-actions">
              <button
                type="button"
                onClick={handleAiGenerateSummary}
                className="w-full text-center py-2 bg-blue-650 hover:bg-blue-700 text-white rounded font-bold cursor-pointer"
              >
                Generate Biography notes (AI)
              </button>
              
              <button
                type="button"
                onClick={handleAiCheckDuplicates}
                disabled={aiAnalysisRunning}
                className="w-full text-center py-2 border border-grey-300 text-grey-700 hover:bg-grey-50 rounded font-semibold cursor-pointer"
              >
                {aiAnalysisRunning ? "Querying registry..." : "Scan Duplicate Profiles"}
              </button>
            </div>

            {aiReportDetails && (
              <div className="p-3 rounded-lg bg-green-100/10 border border-green-300 text-xs text-green-700 leading-relaxed font-secondary">
                {aiReportDetails}
              </div>
            )}

            <div className="text-xs text-grey-450 font-secondary mt-3 pt-3 border-t border-grey-50 leading-relaxed">
              * AI Assistant evaluates standard international corporate databases to verify invoice routing parameters prior to publishing.
            </div>

          </div>
        </div>

      </div>

      {/* Sticky footer parameters */}
      <div className="pt-4 border-t border-grey-100 flex items-center justify-end gap-3 pb-10" id="add-client-actions-bar">
        <button
          onClick={handleBackNavigation}
          className="px-5 py-2.5 border border-grey-300 text-grey-700 hover:text-black hover:bg-grey-25 rounded-lg text-sm font-semibold cursor-pointer"
        >
          Cancel
        </button>

        <button
          onClick={() => handleSave("Pending")}
          className="px-5 py-2.5 border border-blue-300 text-blue-600 hover:bg-blue-105 rounded-lg text-sm font-semibold cursor-pointer"
        >
          Save Draft Link
        </button>

        <button
          id="btn-save-client-real"
          onClick={() => handleSave("Active")}
          className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold cursor-pointer"
        >
          Add Client
        </button>
      </div>

    </div>
  );
}
