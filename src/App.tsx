import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Wrench, FolderOpen, Settings } from 'lucide-react';
import { useGarageStore } from './store/useGarageStore';
import { t } from './i18n/translations';
import HomeScreen from './screens/HomeScreen';
import DiagnosisScreen from './screens/DiagnosisScreen';
import DiagnosticResultScreen from './screens/DiagnosticResultScreen';
import PartsScreen from './screens/PartsScreen';
import JobHistoryScreen from './screens/JobHistoryScreen';
import JobDetailScreen from './screens/JobDetailScreen';
import InvoiceScreen from './screens/InvoiceScreen';
import DashboardScreen from './screens/DashboardScreen';
import SettingsScreen from './screens/SettingsScreen';
import TrialGuard from './components/TrialGuard';
import './index.css';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useGarageStore();
  const lang = settings.language;

  const items = [
    { path: '/', icon: Wrench, label: t('nav_home', lang) },
    { path: '/jobs', icon: FolderOpen, label: t('nav_jobs', lang) },
    // Hidden for MVP
    // { path: '/invoice', icon: Receipt, label: t('nav_invoice', lang) },
    // { path: '/dashboard', icon: BarChart2, label: t('nav_dashboard', lang) },
    { path: '/settings', icon: Settings, label: t('nav_settings', lang) },
  ];

  // Hide nav on sub-screens
  const hideNav = ['/diagnosis', '/result', '/parts', '/job-detail'].some(p =>
    location.pathname.startsWith(p)
  );
  if (hideNav) return null;

  return (
    <nav className="bottom-nav">
      {items.map(item => {
        const Icon = item.icon;
        const active = item.path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(item.path);
        return (
          <button
            key={item.path}
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
          >
            <span className="nav-icon-wrapper">
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

import { useAnalytics } from './hooks/useAnalytics';

function AppInner() {
  const { settings, updateSettings } = useGarageStore();
  useAnalytics(); // Initialize page view tracking
  const lang = settings.language;
  const navigate = useNavigate();
  const location = useLocation();

  const showHeader = location.pathname !== '/';

  return (
    <div className="app-shell">
      {/* Persistent top bar on sub-screens */}
      {showHeader ? (
        <header className="app-header">
          <button className="header-back" onClick={() => navigate(-1)}>
            {t('common_back', lang)}
          </button>
          <select
            className="header-lang-btn"
            value={lang}
            onChange={(e) => updateSettings({ language: e.target.value as 'ro' | 'en' | 'de' })}
            style={{
                background: 'white', border: '1.5px solid var(--color-border)',
                borderRadius: 10, padding: '5px 28px 5px 10px',
                fontWeight: 900, fontSize: '0.72rem',
                color: 'var(--color-text-2)', cursor: 'pointer',
                outline: 'none', appearance: 'none',
                minWidth: 85,
                marginRight: 10,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center'
            }}
          >
            <option value="ro">🇷🇴 RO</option>
            <option value="en">🇬🇧 ENG</option>
            <option value="de">🇩🇪 DE</option>
          </select>
        </header>
      ) : null}

      <main className="screen page-enter">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/diagnosis" element={<DiagnosisScreen />} />
          <Route path="/result" element={<DiagnosticResultScreen />} />
          <Route path="/parts" element={<PartsScreen />} />
          <Route path="/jobs" element={<JobHistoryScreen />} />
          <Route path="/job-detail/:id" element={<JobDetailScreen />} />
          <Route path="/invoice" element={<InvoiceScreen />} />
          <Route path="/invoice-detail/:id" element={<InvoiceScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <TrialGuard>
        <AppInner />
      </TrialGuard>
    </BrowserRouter>
  );
}
