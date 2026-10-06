import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'secretario' | 'diretor' | 'tecnico' | 'copa';
  password: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'limpeza' | 'copa' | 'agua';
  unit: string;
  quantity: number;
  minQuantity: number;
  location: string;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  phone: string;
  email: string;
}

export interface StockEntry {
  id: string;
  productId: string;
  quantity: number;
  date: string;
  supplierId: string;
  invoiceNumber: string;
  danfe?: string;
  notes?: string;
}

export interface StockRequest {
  id: string;
  productId: string;
  quantity: number;
  date: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'delivered' | 'rejected';
  approvedBy?: string;
  notes?: string;
}

export interface ConsumptionRecord {
  id: string;
  productId: string;
  quantity: number;
  date: string;
  department: string;
}

interface AppState {
  users: User[];
  products: Product[];
  suppliers: Supplier[];
  stockEntries: StockEntry[];
  stockRequests: StockRequest[];
  consumptionRecords: ConsumptionRecord[];
  currentUser: User | null;
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addStockEntry: (entry: StockEntry) => void;
  addStockRequest: (request: StockRequest) => void;
  updateStockRequest: (request: StockRequest) => void;
  addConsumptionRecord: (record: ConsumptionRecord) => void;
  addSupplier: (supplier: Supplier) => void;
  addUser: (user: User) => void;
  getStockAlerts: () => Product[];
}

const defaultUsers: User[] = [
  { id: '1', name: 'Secretário Admin', email: 'secretario@sggd.gov.br', role: 'secretario', password: '123456' },
  { id: '2', name: 'Diretor Estoque', email: 'diretor@sggd.gov.br', role: 'diretor', password: '123456' },
  { id: '3', name: 'Técnico João', email: 'tecnico@sggd.gov.br', role: 'tecnico', password: '123456' },
  { id: '4', name: 'Maria - Copa', email: 'copa@sggd.gov.br', role: 'copa', password: '123456' },
];

const defaultProducts: Product[] = [
  { id: '1', name: 'Detergente Líquido 500ml', category: 'limpeza', unit: 'unidade', quantity: 45, minQuantity: 20, location: 'Almoxarifado A' },
  { id: '2', name: 'Desinfetante 2L', category: 'limpeza', unit: 'unidade', quantity: 30, minQuantity: 15, location: 'Almoxarifado A' },
  { id: '3', name: 'Papel Toalha', category: 'limpeza', unit: 'rolo', quantity: 60, minQuantity: 25, location: 'Almoxarifado A' },
  { id: '4', name: 'Saco de Lixo 100L', category: 'limpeza', unit: 'pacote', quantity: 18, minQuantity: 20, location: 'Almoxarifado A' },
  { id: '5', name: 'Água Sanitária 2L', category: 'limpeza', unit: 'unidade', quantity: 25, minQuantity: 10, location: 'Almoxarifado A' },
  { id: '6', name: 'Copo Descartável 200ml', category: 'copa', unit: 'pacote', quantity: 35, minQuantity: 15, location: 'Copa' },
  { id: '7', name: 'Café em Pó 500g', category: 'copa', unit: 'pacote', quantity: 12, minQuantity: 8, location: 'Copa' },
  { id: '8', name: 'Açúcar Cristal 5kg', category: 'copa', unit: 'pacote', quantity: 8, minQuantity: 4, location: 'Copa' },
  { id: '9', name: 'Filtro de Café', category: 'copa', unit: 'caixa', quantity: 10, minQuantity: 5, location: 'Copa' },
  { id: '10', name: 'Galão de Água 20L', category: 'agua', unit: 'galão', quantity: 15, minQuantity: 8, location: 'Copa' },
  { id: '11', name: 'Álcool 70% 1L', category: 'limpeza', unit: 'unidade', quantity: 20, minQuantity: 10, location: 'Almoxarifado A' },
  { id: '12', name: 'Sabonete Líquido 500ml', category: 'limpeza', unit: 'unidade', quantity: 14, minQuantity: 8, location: 'Almoxarifado A' },
];

const defaultSuppliers: Supplier[] = [
  { id: '1', name: 'Limpeza Total LTDA', cnpj: '12.345.678/0001-90', phone: '(11) 3456-7890', email: 'contato@limpezatotal.com.br' },
  { id: '2', name: 'Distribuidora Copa & Cia', cnpj: '98.765.432/0001-10', phone: '(11) 2345-6789', email: 'vendas@copacia.com.br' },
  { id: '3', name: 'Águas Minerais Brasil', cnpj: '45.678.901/0001-23', phone: '(11) 4567-8901', email: 'comercial@aguasbrasil.com.br' },
];

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('sggd-stock-app');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      users: defaultUsers,
      products: defaultProducts,
      suppliers: defaultSuppliers,
      stockEntries: [],
      stockRequests: [],
      consumptionRecords: [],
      currentUser: null,
    };
  });

  useEffect(() => {
    localStorage.setItem('sggd-stock-app', JSON.stringify(state));
  }, [state]);

  const login = (email: string, password: string): boolean => {
    const user = state.users.find(u => u.email === email && u.password === password);
    if (user) {
      setState(prev => ({ ...prev, currentUser: user }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const addProduct = (product: Product) => {
    setState(prev => ({ ...prev, products: [...prev.products, product] }));
  };

  const updateProduct = (product: Product) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === product.id ? product : p),
    }));
  };

  const deleteProduct = (id: string) => {
    setState(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }));
  };

  const addStockEntry = (entry: StockEntry) => {
    setState(prev => {
      const product = prev.products.find(p => p.id === entry.productId);
      const updatedProducts = prev.products.map(p =>
        p.id === entry.productId ? { ...p, quantity: p.quantity + entry.quantity } : p
      );
      return {
        ...prev,
        stockEntries: [...prev.stockEntries, entry],
        products: updatedProducts,
      };
    });
  };

  const addStockRequest = (request: StockRequest) => {
    setState(prev => ({ ...prev, stockRequests: [...prev.stockRequests, request] }));
  };

  const updateStockRequest = (request: StockRequest) => {
    setState(prev => {
      let updatedProducts = prev.products;
      if (request.status === 'delivered') {
        updatedProducts = prev.products.map(p =>
          p.id === request.productId ? { ...p, quantity: p.quantity - request.quantity } : p
        );
      }
      return {
        ...prev,
        stockRequests: prev.stockRequests.map(r => r.id === request.id ? request : r),
        products: updatedProducts,
      };
    });
  };

  const addConsumptionRecord = (record: ConsumptionRecord) => {
    setState(prev => ({ ...prev, consumptionRecords: [...prev.consumptionRecords, record] }));
  };

  const addSupplier = (supplier: Supplier) => {
    setState(prev => ({ ...prev, suppliers: [...prev.suppliers, supplier] }));
  };

  const addUser = (user: User) => {
    setState(prev => ({ ...prev, users: [...prev.users, user] }));
  };

  const getStockAlerts = (): Product[] => {
    return state.products.filter(p => p.quantity <= p.minQuantity);
  };

  return (
    <AppContext.Provider value={{
      ...state,
      login,
      logout,
      addProduct,
      updateProduct,
      deleteProduct,
      addStockEntry,
      addStockRequest,
      updateStockRequest,
      addConsumptionRecord,
      addSupplier,
      addUser,
      getStockAlerts,
    }}>
      {children}
    </AppContext.Provider>
  );
};
