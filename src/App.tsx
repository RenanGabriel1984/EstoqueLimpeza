import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/ToastProvider';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { RequestsPage } from './pages/RequestsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AlertsPage } from './pages/AlertsPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { EntryPage } from './pages/EntryPage';
import { StockPage } from './pages/StockPage';
import { LocationsPage } from './pages/LocationsPage';
import { PhysicalInventoryPage } from './pages/PhysicalInventoryPage';
import { AuditPage } from './pages/AuditPage';
import { ExpirationPage } from './pages/ExpirationPage';
import { PriceHistoryPage } from './pages/PriceHistoryPage';
import { PurchaseSchedulePage } from './pages/PurchaseSchedulePage';
import { BarcodePage } from './pages/BarcodePage';
import { PDFImportPage } from './pages/PDFImportPage';
import { Layout } from './components/Layout';
import { CommandPalette } from './components/CommandPalette';

const AppContent = () => {
  const { currentUser, darkMode } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  // Dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!currentUser) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'stock': return <StockPage />;
      case 'entry': return <EntryPage />;
      case 'inventory': return <InventoryPage />;
      case 'invoices': return <InvoicesPage />;
      case 'locations': return <LocationsPage />;
      case 'physical-inventory': return <PhysicalInventoryPage />;
      case 'audit': return <AuditPage />;
      case 'expiration': return <ExpirationPage />;
      case 'price-history': return <PriceHistoryPage />;
      case 'purchase-schedule': return <PurchaseSchedulePage />;
      case 'barcode': return <BarcodePage />;
      case 'pdf-import': return <PDFImportPage />;
      case 'requests': return <RequestsPage />;
      case 'reports': return <ReportsPage />;
      case 'alerts': return <AlertsPage />;
      case 'users': return <UsersPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={(page) => { setCurrentPage(page); setCommandPaletteOpen(false); }}
      />
    </Layout>
  );
};

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
