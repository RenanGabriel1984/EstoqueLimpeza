import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, Package, FileText, ClipboardList, BarChart3, 
  AlertTriangle, Users, Settings, LogOut, Menu, X, Bell, ChevronDown,
  MapPin, LogIn
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, roles: ['secretario', 'diretor', 'tecnico', 'copa'] },
  { id: 'stock', label: 'Estoque', icon: Package, roles: ['secretario', 'diretor', 'tecnico', 'copa'] },
  { id: 'entry', label: 'Entrada', icon: LogIn, roles: ['secretario', 'diretor', 'tecnico'] },
  { id: 'inventory', label: 'Cadastro Produtos', icon: Package, roles: ['secretario', 'diretor', 'tecnico'] },
  { id: 'invoices', label: 'Notas Fiscais', icon: FileText, roles: ['secretario', 'diretor', 'tecnico'] },
  { id: 'locations', label: 'Locais', icon: MapPin, roles: ['secretario', 'diretor', 'tecnico'] },
  { id: 'requests', label: 'Requisições', icon: ClipboardList, roles: ['secretario', 'diretor', 'tecnico', 'copa'] },
  { id: 'reports', label: 'Relatórios', icon: BarChart3, roles: ['secretario', 'diretor', 'tecnico'] },
  { id: 'alerts', label: 'Alertas', icon: AlertTriangle, roles: ['secretario', 'diretor', 'tecnico', 'copa'] },
  { id: 'users', label: 'Usuários', icon: Users, roles: ['secretario', 'diretor'] },
  { id: 'settings', label: 'Configurações', icon: Settings, roles: ['secretario', 'diretor'] },
];

export const Layout = ({ children, currentPage, onNavigate }: LayoutProps) => {
  const { currentUser, logout, getStockAlerts } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const alerts = getStockAlerts();

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      secretario: 'Secretário',
      diretor: 'Diretor',
      tecnico: 'Técnico',
      copa: 'Copa',
    };
    return labels[role] || role;
  };

  const filteredMenuItems = menuItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800 text-sm">SGGD Estoque</h1>
                <p className="text-xs text-gray-500">Gestão de Materiais</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {filteredMenuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              const hasAlerts = item.id === 'alerts' && alerts.length > 0;
              return (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {hasAlerts && (
                    <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {alerts.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {currentUser?.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">{getRoleLabel(currentUser?.role || '')}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="lg:hidden text-gray-600 hover:text-gray-800"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-semibold text-gray-800">
                {filteredMenuItems.find(i => i.id === currentPage)?.label || 'Painel'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {/* Alerts button */}
              <button 
                onClick={() => onNavigate('alerts')}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {alerts.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {alerts.length}
                  </span>
                )}
              </button>
              {/* User menu */}
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{currentUser?.name.charAt(0)}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800">{currentUser?.name}</p>
                        <p className="text-xs text-gray-500">{currentUser?.email}</p>
                      </div>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair do Sistema
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
