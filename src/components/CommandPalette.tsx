import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Package, MapPin, FileText, ClipboardList, Users, Settings, X, ArrowRight } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export const CommandPalette = ({ isOpen, onClose, onNavigate }: CommandPaletteProps) => {
  const { products, locations } = useApp();
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const menuItems = [
    { id: 'dashboard', label: 'Painel', icon: '📊', desc: 'Visão geral do sistema' },
    { id: 'stock', label: 'Estoque', icon: '📦', desc: 'Visualizar todos os produtos' },
    { id: 'entry', label: 'Entrada Manual', icon: '📥', desc: 'Registrar entrada de produtos' },
    { id: 'inventory', label: 'Cadastro de Produtos', icon: '🏷️', desc: 'Gerenciar produtos' },
    { id: 'invoices', label: 'Notas Fiscais', icon: '📄', desc: 'Importar XML de NF-e' },
    { id: 'locations', label: 'Locais de Armazenamento', icon: '📍', desc: 'Gerenciar locais' },
    { id: 'requests', label: 'Requisições', icon: '📋', desc: 'Solicitar materiais' },
    { id: 'reports', label: 'Relatórios', icon: '📈', desc: 'Análises e gráficos' },
    { id: 'alerts', label: 'Alertas', icon: '⚠️', desc: 'Estoque baixo e pendências' },
    { id: 'users', label: 'Usuários', icon: '👥', desc: 'Gerenciar acessos' },
    { id: 'settings', label: 'Configurações', icon: '⚙️', desc: 'Configurar sistema' },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.desc.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5);

  const filteredLocations = locations.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 3);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-up">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar menus, produtos, locais..."
            className="flex-1 text-base outline-none bg-transparent"
          />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {/* Menu Items */}
          {filteredMenuItems.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase px-3 py-2">Menus</p>
              {filteredMenuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                </button>
              ))}
            </div>
          )}

          {/* Products */}
          {filteredProducts.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase px-3 py-2">Produtos</p>
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => { onNavigate('stock'); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <Package className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.quantity} {product.unit}(s) em estoque</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Locations */}
          {filteredLocations.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase px-3 py-2">Locais</p>
              {filteredLocations.map(location => (
                <button
                  key={location.id}
                  onClick={() => { onNavigate('locations'); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <MapPin className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{location.name}</p>
                    <p className="text-xs text-gray-500">{location.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredMenuItems.length === 0 && filteredProducts.length === 0 && filteredLocations.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum resultado encontrado</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px]">ESC</kbd>
            <span>para fechar</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px]">↑↓</kbd>
            <span>navegar</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px]">↵</kbd>
            <span>selecionar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
