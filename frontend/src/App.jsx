import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LogoMark from "./LogoMark.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import { ThemeProvider } from "./ThemeContext.jsx";
import ScannerView from "./ScannerView.jsx";
import CommunityTrustView from "./CommunityTrustView.jsx";
import WageTheftView from "./WageTheftView.jsx";
import ResumeTipsView from "./ResumeTipsView.jsx";

const ICONS = {
  scanner: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  community: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.4" stroke="currentColor" strokeWidth="2" />
      <path d="M15.5 14.2c2.6.4 4.5 2.5 4.5 5.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  wagetheft: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  resume: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M6 2.5h9l4.5 4.5V21a1 1 0 01-1 1H6a1 1 0 01-1-1V3.5a1 1 0 011-1z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8.5 12h7M8.5 15.5h7M8.5 8.5h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

const TABS = [
  { id: "scanner", label: "Posting Scanner", Component: ScannerView },
  { id: "community", label: "Community Trust", Component: CommunityTrustView },
  { id: "wagetheft", label: "Wage-Theft Log", Component: WageTheftView },
  { id: "resume", label: "Resume Tips", Component: ResumeTipsView },
];

function AppShell() {
  const [activeTab, setActiveTab] = useState("scanner");
  const ActiveComponent = TABS.find((t) => t.id === activeTab).Component;

  return (
    <div className="app-shell">
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />

      <header className="masthead">
        <span className="wordmark">
          <span className="logo-icon">
            <LogoMark size={26} />
          </span>
          SafeCareer<span className="brand-dot">PK</span>
        </span>
        <div className="masthead-right">
          <span className="masthead-tag">Pakistan Job Safety Toolkit</span>
          <ThemeToggle />
        </div>
      </header>

      <div className="content-area">
        <nav className="tab-row">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "tab-button-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{ICONS[tab.id]}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}