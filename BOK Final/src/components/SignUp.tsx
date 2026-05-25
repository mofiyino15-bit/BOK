import React, { useState } from "react";
import BokLogo from "./BokLogo";

interface SignUpProps {
  onNavigate: (route: string, params?: Record<string, any>) => void;
}

export default function SignUp({ onNavigate }: SignUpProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmitWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please specify a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white select-none" id="signup-container-root">
      {/* LEFT PANEL: Shared clouds background */}
      <div className="relative hidden md:flex md:w-1/2 h-full overflow-hidden" id="signup-left-panel">
        <img
          src="/src/assets/images/ribbon_backdrop_1779651790316.png"
          alt="Serene skies with ribbon"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        {/* Centered large WELCOME display overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-8 bg-black/5">
          <h2 className="text-white text-5xl lg:text-6xl font-sans tracking-[0.25em] font-semibold uppercase text-center select-none">
            WELCOME
          </h2>
        </div>
      </div>

      {/* RIGHT PANEL: Pure white aesthetic form area */}
      <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center bg-white px-6 sm:px-16 py-12 relative overflow-y-auto" id="signup-right-panel">
        
        {/* Back navigation button */}
        <div className="absolute top-6 left-6" id="signup-top-back-nav">
          <button
            onClick={() => onNavigate("login")}
            className="flex items-center gap-1.5 text-xs font-semibold text-grey-500 hover:text-grey-900 transition-colors uppercase cursor-pointer"
          >
            &larr; Back to login
          </button>
        </div>

        <div className="w-full max-w-[390px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5" id="signup-brandmark-header">
            <BokLogo size={16} />
            <span className="text-xl font-semibold tracking-tight text-grey-900 uppercase font-sans">Bōk</span>
          </div>

          {!submitted ? (
            <div className="space-y-6">
              {/* Title & Status Indicator */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wider font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Alpha Phase Release
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-grey-900 tracking-tight font-sans uppercase">
                  Private Access
                </h1>
                <p className="text-sm text-grey-500 leading-relaxed font-secondary">
                  This version of the product is designed solely for <strong className="font-semibold text-grey-900">returning users</strong> and pre-selected partners. Public self-serve registration is currently restricted as we scale our core engines.
                </p>
              </div>

              {/* Informative Help Card */}
              <div className="p-4 bg-grey-50 rounded-xl border border-grey-100 space-y-2 text-xs text-grey-600 font-secondary">
                <p className="font-semibold text-grey-900 font-sans uppercase">Are you a returning consultant?</p>
                <p>We've pre-provisioned security coordinates for your organization. Go back to login and enter your designated credentials to proceed immediately.</p>
              </div>

              {/* Action Form to join waiting list */}
              <form onSubmit={handleSubmitWaitlist} className="space-y-4" id="waitlist-form">
                <p className="text-xs font-semibold text-grey-500 uppercase">Request Alpha invitation</p>
                
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="Your Name (Optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent border-b py-2 text-sm text-grey-900 placeholder-grey-400 focus:outline-none focus:border-grey-900 transition-colors font-sans border-grey-100"
                  />
                </div>

                <div className="space-y-1 bg-transparent">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    className={`w-full bg-transparent border-b py-2 text-sm text-grey-900 placeholder-grey-550 focus:outline-none focus:border-grey-900 transition-colors font-sans ${
                      error ? "border-red-500" : "border-grey-100"
                    }`}
                  />
                  {error && <p className="text-[11px] text-red-600 font-semibold mt-1">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-5 py-2.5 bg-blue-brand-500 hover:bg-blue-brand-600 disabled:bg-grey-300 text-white font-semibold rounded-lg text-sm tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Submitting Request...</span>
                    </div>
                  ) : (
                    <span>Request Early Access</span>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-semibold uppercase tracking-wider font-sans">
                  Request Saved
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-grey-900 tracking-tight font-sans uppercase">
                  Thank You
                </h1>
                <p className="text-sm text-grey-500 leading-relaxed font-secondary">
                  We've successfully registered your access request under the email <strong className="font-semibold text-grey-900">{email}</strong>.
                </p>
                <p className="text-xs text-grey-400 leading-relaxed font-secondary">
                  Our system evaluates access proposals periodically against active node capacities. We will dispatch registration details and sandbox coordinates once space becomes available.
                </p>
              </div>

              <button
                onClick={() => onNavigate("login")}
                className="w-full px-5 py-2.5 bg-grey-900 text-white hover:bg-black font-semibold rounded-lg text-sm tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                Return to Login
              </button>
            </div>
          )}

          {/* Switcher back to login */}
          {!submitted && (
            <div className="text-center pt-2" id="signup-footer-switcher">
              <p className="text-sm text-grey-500 font-secondary">
                Are you a returning partner?{" "}
                <button
                  type="button"
                  onClick={() => onNavigate("login")}
                  className="text-grey-900 font-semibold ml-1 hover:text-black hover:underline cursor-pointer transition-all"
                >
                  Log in
                </button>
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
