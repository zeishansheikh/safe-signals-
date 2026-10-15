import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  KeyRound, 
  LogOut, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Clock,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  FileText
} from 'lucide-react';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  user, 
  isAuthenticated, 
  onLogin, 
  onLogout, 
  onDeleteAccount, 
  onOpenOnboarding,
  showToast 
}) {
  const [activeTab, setActiveTab] = useState(isAuthenticated ? 'profile' : 'login');
  
  // Login State
  const [email, setEmail] = useState('tariq.khan@safecity.abbottabad.gov.pk');
  const [password, setPassword] = useState('Corridor#2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('SCATS Traffic Engineer');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Password Recovery State
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    if (!email || !email.includes('@')) {
      setLoginError('Please enter a valid municipal operational email address.');
      return;
    }
    if (!password || password.length < 6) {
      setLoginError('Password must contain at least 6 characters.');
      return;
    }

    setLoginLoading(true);
    setTimeout(() => {
      setLoginLoading(false);
      onLogin({
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email,
        role,
        agency: role.includes('Rescue') ? 'Rescue 1122 Abbottabad' : 'KP Traffic Management',
        mfaEnabled: true,
        sessionExpiry: '8 hours (Active)'
      });
      setActiveTab('profile');
      showToast(`Welcome back, ${role}. Secure terminal session active.`);
    }, 600);
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    setResetLoading(true);

    if (resetStep === 1) {
      setTimeout(() => {
        setResetLoading(false);
        setResetStep(2);
        showToast('Verification code dispatched to official agency inbox.');
      }, 700);
    } else if (resetStep === 2) {
      setTimeout(() => {
        setResetLoading(false);
        setResetStep(3);
        showToast('Code verified successfully. Enter new access credentials.');
      }, 500);
    } else {
      setTimeout(() => {
        setResetLoading(false);
        setResetSuccess(true);
        showToast('Password updated. You may now log in to the terminal.');
        setTimeout(() => {
          setActiveTab('login');
          setResetSuccess(false);
          setResetStep(1);
        }, 1500);
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-tab-fade">
      <div 
        className="w-full max-w-lg bg-surface border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-elevated">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-accent text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">
                Operator Security & Access Portal
              </h2>
              <p className="text-[10px] text-text-muted">
                SafeCity AI Abbottabad • SCATS NTCIP-1202 Clearance
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-border bg-surface text-xs font-semibold px-4 pt-2">
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => setActiveTab('login')}
                className={`py-2 px-3 border-b-2 transition-all ${
                  activeTab === 'login' 
                    ? 'border-accent text-accent font-bold' 
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                Operator Login
              </button>
              <button
                onClick={() => setActiveTab('recovery')}
                className={`py-2 px-3 border-b-2 transition-all ${
                  activeTab === 'recovery' 
                    ? 'border-accent text-accent font-bold' 
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                Password Recovery
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-3 border-b-2 transition-all ${
                  activeTab === 'profile' 
                    ? 'border-accent text-accent font-bold' 
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                Operator Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-2 px-3 border-b-2 transition-all ${
                  activeTab === 'security' 
                    ? 'border-accent text-accent font-bold' 
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                Security & Role Permissions
              </button>
            </>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[80vh] overflow-y-auto">
          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {loginError && (
                <div className="p-2.5 rounded bg-danger-surface border border-danger/30 text-danger text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Official Email / Operator ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@safecity.abbottabad.gov.pk"
                    className="w-full bg-surface-elevated border border-border rounded-md pl-9 pr-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Secure Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-surface-elevated border border-border rounded-md pl-9 pr-10 py-2 text-xs text-text-primary focus:outline-none focus:border-accent font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Assigned Operational Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="SCATS Traffic Engineer">SCATS Traffic Engineer (Full Signal Override)</option>
                  <option value="Rescue 1122 Dispatcher">Rescue 1122 Dispatcher (Corridor Ingress Alert)</option>
                  <option value="Municipal Administrator">Municipal Administrator (System Parameters & Audit)</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-accent focus:ring-accent"
                  />
                  <span className="text-text-secondary">Keep session active (8h)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab('recovery')}
                  className="text-accent hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="btn btn-primary w-full text-xs font-bold py-2.5 mt-2"
              >
                {loginLoading ? 'Authenticating Terminal...' : 'Authenticate & Enter Console'}
              </button>
            </form>
          )}

          {/* TAB 2: PASSWORD RECOVERY */}
          {activeTab === 'recovery' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              {resetSuccess ? (
                <div className="p-4 rounded-md bg-success-surface border border-success-border text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-success mx-auto" />
                  <h4 className="text-xs font-bold text-success">Password Reset Verified</h4>
                  <p className="text-[11px] text-text-secondary">
                    Your credentials have been securely refreshed. Redirecting to login...
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-surface-elevated rounded border border-border text-xs text-text-secondary">
                    <span className="font-bold text-text-primary">Step {resetStep} of 3:</span>{' '}
                    {resetStep === 1 && 'Enter your verified municipal government email.'}
                    {resetStep === 2 && 'Enter the 6-digit verification code sent to your email.'}
                    {resetStep === 3 && 'Establish a new high-entropy password.'}
                  </div>

                  {resetStep === 1 && (
                    <div>
                      <label className="block text-xs font-semibold text-text-primary mb-1">
                        Government Email
                      </label>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="operator@safecity.abbottabad.gov.pk"
                        className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                  )}

                  {resetStep === 2 && (
                    <div>
                      <label className="block text-xs font-semibold text-text-primary mb-1">
                        6-Digit Security PIN
                      </label>
                      <input
                        type="text"
                        maxLength="6"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="849201"
                        className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-center text-sm font-mono tracking-widest text-text-primary focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                  )}

                  {resetStep === 3 && (
                    <div>
                      <label className="block text-xs font-semibold text-text-primary mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="btn btn-secondary text-xs flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="btn btn-primary text-xs font-bold flex-1"
                    >
                      {resetLoading ? 'Processing...' : resetStep === 3 ? 'Save New Password' : 'Next Step'}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* TAB 3: OPERATOR PROFILE */}
          {activeTab === 'profile' && user && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 bg-surface-elevated rounded-lg border border-border">
                <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">
                    {user.name}
                  </h3>
                  <div className="text-xs text-text-muted">{user.email}</div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded bg-accent-surface text-accent text-[10px] font-bold">
                    <span>{user.role}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-surface-elevated rounded border border-border">
                  <div className="text-[10px] text-text-muted font-bold uppercase">Affiliated Agency</div>
                  <div className="font-semibold text-text-primary mt-0.5">{user.agency}</div>
                </div>
                <div className="p-2.5 bg-surface-elevated rounded border border-border">
                  <div className="text-[10px] text-text-muted font-bold uppercase">Active Session</div>
                  <div className="font-semibold text-success mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>8h Token Valid</span>
                  </div>
                </div>
              </div>

              {/* Onboarding Trigger Button */}
              <button
                onClick={() => {
                  onClose();
                  onOpenOnboarding();
                }}
                className="btn btn-secondary w-full text-xs flex items-center justify-center gap-2 border-accent/40 hover:bg-accent-surface/20"
              >
                <HelpCircle className="w-4 h-4 text-accent" />
                <span>Launch Operator System Walkthrough</span>
              </button>

              <div className="pt-2 border-t border-border flex items-center gap-2">
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                    showToast('Terminated operator terminal session.');
                  }}
                  className="btn btn-secondary text-xs flex-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
                <button
                  onClick={() => {
                    onDeleteAccount();
                    onClose();
                  }}
                  className="btn btn-secondary text-xs text-danger hover:border-danger hover:bg-danger-surface"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Profile</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY SETTINGS */}
          {activeTab === 'security' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-surface-elevated rounded-md border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary">Multi-Factor Authentication (MFA)</span>
                  <span className="badge badge-success">Enforced</span>
                </div>
                <p className="text-[11px] text-text-muted">
                  Secured by KP Provincial Gov TOTP authenticator app.
                </p>
              </div>

              <div className="p-3 bg-surface-elevated rounded-md border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary">Audit Log Signatures</span>
                  <span className="badge badge-success">SHA-256 Verified</span>
                </div>
                <p className="text-[11px] text-text-muted">
                  Every preemption action records immutable cryptographic audit entries.
                </p>
              </div>

              <div className="p-3 bg-surface-elevated rounded-md border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary">Data Minimization Compliance</span>
                  <span className="badge badge-success">KP-DPA 2024</span>
                </div>
                <p className="text-[11px] text-text-muted">
                  No civilian PII or license plates stored. 24h rolling edge buffer only.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
