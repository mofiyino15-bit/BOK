import React, { useState } from "react";
import BokLogo from "./BokLogo";

interface LoginProps {
  onNavigate: (route: string, params?: Record<string, any>) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please specify a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Set mock authenticating latency
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNavigate("dashboard");
    }, 1200);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white select-none" id="login-container-root">
      {/* LEFT PANEL: Responsive split full-height cover photography */}
      <div className="relative hidden md:flex md:w-1/2 h-full overflow-hidden" id="login-left-panel">
        <img
          src="/src/assets/images/ribbon_backdrop_1779651790316.png"
          alt="Serene Scandinavian skies with ribbon"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        {/* Centered large WELCOME display typography overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-8 bg-black/5">
          <h2 className="text-white text-5xl lg:text-7xl font-sans tracking-[0.25em] font-extrabold uppercase animate-in fade-in zoom-in-95 duration-700 text-center drop-shadow-sm select-none">
            WELCOME
          </h2>
        </div>
      </div>

      {/* RIGHT PANEL: Typographic custom login form wrapper */}
      <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center bg-white px-6 sm:px-16 py-12 relative overflow-y-auto" id="login-right-panel">
        
        {/* Top-aligned home button for neat UX */}
        <div className="absolute top-6 left-6" id="login-top-home-nav">
          <button
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-1.5 text-xs font-bold text-grey-500 hover:text-grey-900 transition-colors uppercase tracking-widest cursor-pointer"
          >
            &larr; Home
          </button>
        </div>

        <div className="w-full max-w-[380px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Logo Brandmark */}
          <div className="flex items-center gap-2.5" id="login-brandmark-header">
            <BokLogo size={16} />
            <span className="text-xl font-bold tracking-tight text-grey-900 uppercase font-sans">Bōk</span>
          </div>

          {/* Form Header */}
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold text-grey-900 tracking-tight font-sans">Login</h1>
            <p className="text-xs text-grey-450 font-secondary">Scandinavian-minimal billing ecosystem</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6" id="login-form-element">
            {/* Email Field with Underline Minimal Alignment */}
            <div className="space-y-1">
              <input
                type="text"
                id="login-input-email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    const next = { ...errors };
                    delete next.email;
                    setErrors(next);
                  }
                }}
                className={`w-full bg-transparent border-b py-3.5 text-sm text-grey-900 placeholder-grey-450 focus:outline-none focus:border-grey-900 transition-colors font-sans ${
                  errors.email ? "border-red-500" : "border-grey-100"
                }`}
              />
              {errors.email && (
                <p className="text-[11px] text-red-600 font-bold mt-1" id="login-err-email">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field with helper link and Underline style */}
            <div className="space-y-1 relative">
              <div className="flex justify-between items-center text-xs">
                <span className="text-grey-400 font-secondary">Credential</span>
                <button
                  type="button"
                  onClick={() => alert("Mock password restoration workflow triggered. An instruction code has been simulated.")}
                  className="font-bold text-grey-500 hover:text-grey-900 underline transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                id="login-input-password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    const next = { ...errors };
                    delete next.password;
                    setErrors(next);
                  }
                }}
                className={`w-full bg-transparent border-b py-3.5 text-sm text-grey-900 placeholder-grey-450 focus:outline-none focus:border-grey-900 transition-colors font-sans h-10 ${
                  errors.password ? "border-red-500" : "border-grey-100"
                }`}
              />
              {errors.password && (
                <p className="text-[11px] text-red-600 font-bold mt-1" id="login-err-password">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Login button - matching web app buttons: px-5 py-2.5, rounded-lg, font-semibold */}
            <button
              type="submit"
              disabled={loading}
              id="login-submit-button"
              className="w-full px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-grey-300 text-white font-semibold rounded-lg text-sm tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-sm"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          {/* Form Bottom Link Switcher */}
          <div className="pt-2 text-center" id="login-footer-auth">
            <p className="text-sm text-grey-500 font-secondary">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => onNavigate("signup")}
                className="text-grey-900 font-bold ml-1 active:scale-95 underline transition-all hover:text-black cursor-pointer"
              >
                Sign up
              </button>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
