import React, { useState } from "react";
import { ArrowRight, CheckCircle, Smartphone, Globe, Shield, RefreshCw, Mail, Clock, ShieldCheck, AlertCircle, Sparkles, Check, ArrowUpRight, Menu, X } from "lucide-react";
import BokLogo from "./BokLogo";

interface LandingProps {
  onNavigate: (route: string, params?: Record<string, any>) => void;
}

export default function Landing({ onNavigate }: LandingProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [nudgeStates, setNudgeStates] = useState<Record<string, { status: string; count: number; loading: boolean }>>({
    "inv-bright": { status: "Friendly Nudge Sent", count: 1, loading: false },
    "inv-acme": { status: "Ready to Nudge", count: 0, loading: false },
    "inv-nord": { status: "Firm Escalation Scheduled", count: 2, loading: false }
  });

  const handleSimulateNudge = (id: string, stageName: string) => {
    // Set loading
    setNudgeStates(prev => ({
      ...prev,
      [id]: { ...prev[id], loading: true }
    }));

    setTimeout(() => {
      setNudgeStates(prev => ({
        ...prev,
        [id]: {
          status: `${stageName} Sent via Bōk!`,
          count: prev[id].count + 1,
          loading: false
        }
      }));
    }, 1200);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <div className="min-h-screen bg-white text-grey-900 font-sans select-none scroll-smooth overflow-x-hidden" id="landing-root">
      
      {/* 1. PERSISTENT NAVIGATION OVERLAY */}
      <header className="fixed top-0 left-0 right-0 w-full bg-white/25 backdrop-blur-md border-b border-grey-100/50 z-50 transition-all duration-300" id="landing-navigation">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-4 flex items-center justify-between">
          
          {/* Left Links - Editorial lowercase and dash spacers */}
          <nav className="hidden md:flex items-center gap-3 text-sm font-semibold tracking-wide text-grey-500" id="nav-center-links">
            <button 
              onClick={() => scrollToSection("features")} 
              className="hover:text-grey-900 transition-colors cursor-pointer"
            >
              Features
            </button>
            <span className="text-grey-200 select-none">&middot;</span>
            <button 
              onClick={() => scrollToSection("how-it-works")} 
              className="hover:text-grey-900 transition-colors cursor-pointer"
            >
              How it Works
            </button>
          </nav>

          {/* Logo Brandmark */}
          <button 
            onClick={() => scrollToSection("hero")}
            className="flex items-center group cursor-pointer focus:outline-none relative h-10 w-24 transition-all duration-300"
            id="nav-logo"
          >
            <div className="absolute inset-y-0 left-0 flex items-center transition-all duration-300 ease-in-out group-hover:left-1/2 group-hover:-translate-x-1/2 group-hover:delay-150 delay-0 z-10">
              <div className="bg-transparent rounded p-1">
                <BokLogo size={16} className="transition-transform group-hover:scale-110" />
              </div>
            </div>
            <span className="absolute left-9 text-xl font-bold tracking-tight text-grey-900 uppercase transition-all duration-200 ease-in-out opacity-100 group-hover:-translate-x-12 group-hover:opacity-0 whitespace-nowrap delay-150 group-hover:delay-0">
              Bōk
            </span>
          </button>

          {/* Right Action buttons - Replicating exact web app button padding & styling */}
          <div className="hidden md:flex items-center gap-4" id="nav-right-actions">
            <button
              onClick={() => onNavigate("login")}
              className="px-4 py-2.5 text-sm font-semibold text-grey-600 hover:text-grey-900 hover:bg-grey-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              Log In
            </button>
            <button
              onClick={() => onNavigate("login")}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-all duration-300 cursor-pointer flex items-center gap-1.5 shadow-sm transform active:scale-95"
            >
              Get Started Free <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hamburger Toggle for Mobile/Tablet Products Menu */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-grey-600 hover:text-grey-900 transition-colors cursor-pointer rounded-lg relative"
            title="Open Products Menu"
            id="landing-hamburger-toggle"
          >
            <Menu className="w-5.5 h-5.5 stroke-[2.2]" />
          </button>

        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative w-full pt-32 pb-20 min-h-[90vh] flex items-center justify-start overflow-hidden" id="hero">
        
        {/* Full-width atmospheric background layer */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/ribbon_backdrop_1779651790316.png"
            alt="Atmospheric clouds scenery"
            className="w-full h-full object-cover select-none pointer-events-none opacity-80"
            referrerPolicy="no-referrer"
          />
          {/* Subtle bottom fade white overlay for seamless visual integration */}
          <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-white/20 pointer-events-none" />
        </div>

        {/* Centered high-impact content hero layout */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 text-left w-full flex flex-col items-start justify-start">
          
          <div className="space-y-8 max-w-3xl">
            
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest text-grey-500 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              Smart invoicing for freelancers
            </div>

            {/* Direct, high-impact headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-7xl font-extrabold text-grey-900 tracking-tight leading-[1.02] uppercase">
                Get Paid Faster.<br />
                <span className="text-blue-500">With Less Chasing.</span>
              </h1>
              
              {/* Elegant subtext */}
              <p className="text-base sm:text-lg text-grey-550 max-w-xl leading-relaxed font-normal">
                Bok handles your invoices and follow-ups automatically &mdash; so you spend less time reminding clients and more time doing the work you love.
              </p>
            </div>

            {/* Action CTAs - Matching the exact padding/rounding ratio of web app buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-start gap-4 pt-4">
              <button
                onClick={() => onNavigate("login")}
                className="px-6 py-3 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform active:scale-95 flex items-center gap-2 focus:outline-none w-full sm:w-auto justify-center"
              >
                Start for Free <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => scrollToSection("features")}
                className="text-xs font-bold text-grey-450 hover:text-grey-700 uppercase tracking-widest transition-colors flex items-center gap-1 cursor-pointer py-2 focus:outline-none"
              >
                See how it works <span className="animate-bounce">↓</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 3. SOCIAL PROOF BAR */}
      <section className="bg-white border-y border-grey-100 py-12" id="social-proof">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <p className="text-xs uppercase tracking-[0.15em] font-black text-grey-400">
            Trusted by 2,400+ freelancers worldwide
          </p>
          
          {/* Typographic geometric placeholders for premium minimal logos */}
          <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-16 opacity-40 hover:opacity-60 transition-opacity duration-350">
            <span className="text-sm font-extrabold tracking-[0.3em] text-grey-900 uppercase">KONTRAST</span>
            <span className="text-sm font-semibold tracking-[0.25em] text-grey-900 uppercase italic">N O R D I C</span>
            <span className="text-sm font-light tracking-[0.4em] text-grey-900 uppercase">STUDIO FÄRGBERG</span>
            <span className="text-sm font-bold tracking-[0.15em] text-grey-900 uppercase">FORMA</span>
            <span className="text-sm font-extrabold tracking-[0.35em] text-grey-900 uppercase">KÄLLA</span>
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section className="bg-white py-28 px-6 sm:px-12" id="features">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="max-w-2xl text-left space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Everything you need</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-grey-900 tracking-tight uppercase leading-[1.05]">
              Invoicing that works as hard as you do
            </h2>
          </div>

          {/* 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-4">
            
            {/* Feature 1 */}
            <div className="space-y-4 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-grey-50 flex items-center justify-center border border-grey-100 mb-2">
                <RefreshCw className="w-6 h-6 text-grey-900" />
              </div>
              <h3 className="text-xl font-bold text-grey-900 uppercase tracking-tight">
                Smart Follow-Ups
              </h3>
              <p className="text-sm text-grey-550 leading-relaxed font-secondary">
                Bok sends automatic reminders before and after due dates &mdash; so payments come in without the awkward chase.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-4 hover:-translate-y-1 transition-transform duration-355 bg-white">
              <div className="w-12 h-12 rounded-2xl bg-grey-50 flex items-center justify-center border border-grey-100 mb-2">
                <Shield className="w-6 h-6 text-grey-900" />
              </div>
              <h3 className="text-xl font-bold text-grey-900 uppercase tracking-tight">
                Client Behaviour Insights
              </h3>
              <p className="text-sm text-grey-555 leading-relaxed font-secondary">
                Know which clients pay late, how many reminders they need, and their risk level &mdash; all in one place.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-4 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-grey-50 flex items-center justify-center border border-grey-100 mb-2">
                <Globe className="w-6 h-6 text-grey-900" />
              </div>
              <h3 className="text-xl font-bold text-grey-900 uppercase tracking-tight">
                Multi-Currency Ready
              </h3>
              <p className="text-sm text-grey-550 leading-relaxed font-secondary">
                Invoice clients anywhere in the world. Bok supports multiple currencies out of the box.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="bg-grey-25 py-28 px-6 sm:px-12 border-y border-grey-100" id="how-it-works">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-grey-450">&bull; No complex onboarding &bull;</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-grey-900 tracking-tight uppercase">
              Up and running in minutes
            </h2>
          </div>

          {/* 3 Step horizontal process */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 relative">
            
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-3xl border border-grey-100 space-y-4 relative">
              <div className="absolute top-6 right-8 text-5xl font-black text-grey-100 select-none">01</div>
              <span className="inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-grey-50 border border-grey-100 rounded text-grey-500">
                Setup
              </span>
              <h3 className="text-lg font-bold text-grey-900 uppercase">
                Create your invoice
              </h3>
              <p className="text-xs text-grey-450 leading-relaxed font-secondary">
                Populate your services, hours, or materials into our elegant clean templates. Configure customized tax levels in seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-3xl border border-grey-100 space-y-4 relative">
              <div className="absolute top-6 right-8 text-5xl font-black text-grey-100 select-none">02</div>
              <span className="inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-grey-50 border border-grey-100 rounded text-grey-500">
                Automation
              </span>
              <h3 className="text-lg font-bold text-grey-900 uppercase">
                Set your reminders
              </h3>
              <p className="text-xs text-grey-450 leading-relaxed font-secondary">
                Decide on gentle automated follow-up intervals. Let Bok securely handle recurring ledger nudges so you remain stress-free.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-3xl border border-grey-100 space-y-4 relative">
              <div className="absolute top-6 right-8 text-5xl font-black text-grey-100 select-none">03</div>
              <span className="inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-blue-100/50 border border-blue-200/60 rounded text-blue-600">
                Payout
              </span>
              <h3 className="text-lg font-bold text-grey-900 uppercase">
                Get paid
              </h3>
              <p className="text-xs text-grey-450 leading-relaxed font-secondary">
                Enjoy transparent balance graphs as your settlement transactions clear on time direct to your connected primary accounts.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. CTA SECTION */}
      <section className="bg-grey-900 text-white py-28 px-6 sm:px-12 text-center relative overflow-hidden" id="cta">
        
        {/* Sky trace underlay in black panel */}
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-screen">
          <img
            src="/src/assets/images/ribbon_backdrop_1779651790316.png"
            alt="Sky background mesh"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          
          <div className="space-y-3">
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight uppercase leading-none">
              Stop chasing.<br />
              <span className="text-blue-100">Start earning.</span>
            </h2>
            <p className="text-sm sm:text-base text-grey-400 max-w-md mx-auto leading-relaxed font-secondary">
              Join thousands of freelancers who get paid on time with Bok without ever having to manually alert a pending client invoice loop.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate("login")}
              className="h-14 px-8 bg-white hover:bg-blue-600 hover:text-white text-grey-900 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-md transform hover:scale-102 active:scale-95 flex items-center gap-2 mx-auto"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* 7. MINIMAL FOOTER */}
      <footer className="bg-white border-t border-grey-100 py-12" id="landing-footer">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between text-xs text-transparent bg-clip-text bg-gradient-to-r from-grey-550 to-grey-450 gap-6">
          
          {/* Left wordmark */}
          <div className="flex items-center gap-2.5" id="footer-logo">
            <BokLogo size={12} />
            <span className="font-extrabold text-grey-900 text-sm tracking-tight uppercase">BŌK</span>
            <span className="text-grey-300 select-none">&bull;</span>
            <span className="text-grey-550 font-secondary">&copy; 2026 Bok. Meticulously engineered in Scandinavia.</span>
          </div>

          {/* Right Links */}
          <div className="flex items-center gap-6 font-semibold" id="footer-links">
            <a href="#" className="text-grey-500 hover:text-grey-900 transition-colors uppercase tracking-wider">Privacy Policy</a>
            <a href="#" className="text-grey-500 hover:text-grey-900 transition-colors uppercase tracking-wider">Terms of Use</a>
            <a href="#" className="text-grey-500 hover:text-grey-900 transition-colors uppercase tracking-wider">Contact</a>
          </div>

        </div>
      </footer>

      {/* 8. LANDING MOBILE MENU DRAWER (SLIDE-IN FROM RIGHT) */}
      <div id="landing-mobile-menu-portal" className={`fixed inset-0 z-[100] pointer-events-none`}>
        {/* Backdrop overlay */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className={`fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          id="landing-mobile-backdrop"
        />

        {/* Drawer container */}
        <div
          className={`fixed inset-y-0 right-0 w-[280px] bg-white border-l border-grey-100 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl pointer-events-auto ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          id="landing-mobile-drawer"
        >
          <div className="space-y-8">
            {/* Header / Brand */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BokLogo size={24} />
                <span className="font-extrabold text-grey-900 tracking-tight text-base uppercase">Bōk</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-grey-450 hover:text-grey-900 hover:bg-grey-50 rounded-lg cursor-pointer transition-colors"
                title="Close Products Menu"
                id="landing-mobile-drawer-close"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            {/* Navigation options list */}
            <div className="space-y-6 text-left">
              <nav className="flex flex-col gap-5">
                <button
                  onClick={() => {
                    scrollToSection("features");
                    setMobileMenuOpen(false);
                  }}
                  className="text-base font-semibold text-grey-600 hover:text-grey-900 text-left cursor-pointer transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => {
                    scrollToSection("how-it-works");
                    setMobileMenuOpen(false);
                  }}
                  className="text-base font-semibold text-grey-600 hover:text-grey-900 text-left cursor-pointer transition-colors"
                >
                  How It Works
                </button>
              </nav>

              <hr className="border-grey-100" />

              {/* Actions Frame housing primary and secondary buttons */}
              <div className="flex flex-col gap-4" id="landing-mobile-actions-frame">
                <button
                  onClick={() => {
                    onNavigate("login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center px-4 py-3 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow-sm transition-colors cursor-pointer transform active:scale-95"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => {
                    onNavigate("login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center px-4 py-3 text-sm font-semibold text-grey-700 hover:text-grey-900 hover:bg-grey-50 border border-grey-200 rounded-lg transition-colors cursor-pointer transform active:scale-95"
                >
                  Log In
                </button>
              </div>
            </div>
          </div>

          {/* Footer inside drawer */}
          <div className="text-[10px] text-grey-400 font-secondary text-left">
            &copy; 2026 Bok. All rights reserved. Registered in Copenhagen, Denmark.
          </div>
        </div>
      </div>

    </div>
  );
}
