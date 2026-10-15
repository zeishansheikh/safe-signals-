import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  ShieldAlert, 
  Clock, 
  Moon, 
  Sun, 
  Flame, 
  User, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';

export default function Header({ 
  theme, 
  onToggleTheme, 
  onToggleMobileMenu, 
  onSelectPage,
  user,
  isAuthenticated,
  backendConnected,
  onOpenAuth,
  onOpenReadiness,
  onOpenFaq
}) {
  const [timeStr, setTimeStr] = useState('11:40:00 PKT');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }) + ' PKT');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Skip-to-content accessibility link */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-accent focus:text-white focus:rounded-md focus:font-bold focus:shadow-lg"
      >
        Skip to main content
      </a>

      <header className="bg-surface border-b border-border px-4 py-2 flex items-center justify-between shadow-sm z-40 relative sticky top-0">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 rounded-md border border-border bg-surface-elevated text-text-primary hover:bg-surface-hover hover:border-accent transition-colors"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Aligned Custom Logo */}
          <button
            onClick={() => onSelectPage('monitor')}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-md bg-accent text-white flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-extrabold tracking-tight text-text-primary flex items-center gap-1">
                SafeCity <span className="text-accent">AI</span>
              </div>
              <div className="text-[9px] font-bold text-text-muted tracking-wider uppercase">
                Ambulance Green Corridor
              </div>
            </div>
          </button>

          <div className="hidden sm:block text-xs font-semibold text-text-secondary border-l border-border pl-3">
            Abbottabad Corridor
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success-surface border border-success-border text-success text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
            <span>Green Corridor Active</span>
          </div>

          {/* Real Backend API Status Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
            backendConnected 
              ? 'bg-success-surface border-success-border text-success' 
              : 'bg-surface-elevated border-border text-text-muted'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${backendConnected ? 'bg-success animate-pulse' : 'bg-slate-400'}`} />
            <span>{backendConnected ? 'Python API: Live (8000)' : 'API: Standby'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-elevated border border-border text-xs font-bold text-text-secondary">
            <Clock className="w-3.5 h-3.5" />
            <span className="tabular-nums">{timeStr}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Production Checklist #100 Button */}
          <button
            onClick={onOpenReadiness}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-success/40 bg-success-surface text-success text-xs font-bold hover:bg-success hover:text-white transition-all shadow-sm"
            title="View 100-Point Production Readiness Checklist"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Audit #100</span>
          </button>

          {/* Operator Profile / Login Button */}
          <button
            onClick={onOpenAuth}
            className="px-2.5 py-1.5 rounded-md border border-border bg-surface-elevated text-text-primary text-xs font-semibold hover:border-accent hover:bg-surface-hover transition-all flex items-center gap-1.5"
            aria-label="Operator account portal"
          >
            <User className="w-3.5 h-3.5 text-accent" />
            <span className="hidden sm:inline">
              {isAuthenticated ? user.name.split(' ')[0] : 'Log In'}
            </span>
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="px-2.5 py-1.5 rounded-md border border-border bg-surface-elevated text-text-primary text-xs font-semibold hover:border-accent hover:bg-surface-hover transition-all flex items-center gap-1.5 active:translate-y-px"
            aria-label="Toggle dark/light theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-warning" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-accent" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>
        </div>
      </header>
    </>
  );
}
