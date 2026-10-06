import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'secretario' | 'diretor' | 'tecnico' | 'copa';
  password: string;
}

export interface StorageLocation {
  id: string;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'limpeza' | 'copa' | 'agua';
  unit: string;
  quantity: number;
  minQuantity: number;
  locationId: string;
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
  entryType: 'invoice' | 'manual';
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

export interface AuditLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'entry' | 'request' | 'approve' | 'reject' | 'inventory';
  entityType: 'product' | 'user' | 'location' | 'request' | 'entry' | 'inventory';
  entityId: string;
  userId: string;
  userName: string;
  timestamp: string;
  details: string;
  oldValue?: any;
  newValue?: any;
}

export interface PhysicalInventory {
  id: string;
  date: string;
  performedBy: string;
  status: 'in_progress' | 'completed' | 'reconciled';
  items: {
    productId: string;
    expectedQuantity: number;
    countedQuantity: number;
    difference: number;
    notes?: string;
  }[];
}

interface AppState {
  users: User[];
  products: Product[];
  suppliers: Supplier[];
  locations: StorageLocation[];
  stockEntries: StockEntry[];
  stockRequests: StockRequest[];
  consumptionRecords: ConsumptionRecord[];
  auditLogs: AuditLog[];
  physicalInventories: PhysicalInventory[];
  currentUser: User | null;
  darkMode: boolean;
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
  addLocation: (location: StorageLocation) => void;
  updateLocation: (location: StorageLocation) => void;
  deleteLocation: (id: string) => void;
  getStockAlerts: () => Product[];
  getLocationName: (locationId: string) => string;
  findProductByName: (name: string) => Product | undefined;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  addPhysicalInventory: (inventory: PhysicalInventory) => void;
  updatePhysicalInventory: (inventory: PhysicalInventory) => void;
  toggleDarkMode: () => void;
  exportData: () => string;
  importData: (data: string) => boolean;
}

const defaultLocations: StorageLocation[] = [
  { id: 'loc1', name: 'Armário de Limpeza', description: 'Armário interno do almoxarifado - produtos de limpeza' },
  { id: 'loc2', name: 'Armário da Copa', description: 'Armário interno da copa - café, açúcar, copos' },
  { id: 'loc3', name: 'Armário Externo', description: 'Armário do corredor - lustra móveis, desinfetantes' },
  { id: 'loc4', name: 'Depósito de Água', description: 'Área ao lado da copa - galões de água' },
  { id: 'loc5', name: 'Prateleira de Papelaria', description: 'Prateleira do almoxarifado - papéis e descartáveis' },
];

const defaultUsers: User[] = [
  { id: '1', name: 'Secretário Admin', email: 'secretario@sggd.gov.br', role: 'secretario', password: '123456' },
  { id: '2', name: 'Diretor Estoque', email: 'diretor@sggd.gov.br', role: 'diretor', password: '123456' },
  { id: '3', name: 'Técnico João', email: 'tecnico@sggd.gov.br', role: 'tecnico', password: '123456' },
  { id: '4', name: 'Maria - Copa', email: 'copa@sggd.gov.br', role: 'copa', password: '123456' },
];

const defaultProducts: Product[] = [
  { id: '1', name: 'Detergente Líquido 500ml', category: 'limpeza', unit: 'unidade', quantity: 45, minQuantity: 20, locationId: 'loc1' },
  { id: '2', name: 'Desinfetante 2L', category: 'limpeza', unit: 'unidade', quantity: 30, minQuantity: 15, locationId: 'loc1' },
  { id: '3', name: 'Papel Toalha', category: 'limpeza', unit: 'rolo', quantity: 60, minQuantity: 25, locationId: 'loc5' },
  { id: '4', name: 'Saco de Lixo 100L', category: 'limpeza', unit: 'pacote', quantity: 18, minQuantity: 20, locationId: 'loc1' },
  { id: '5', name: 'Água Sanitária 2L', category: 'limpeza', unit: 'unidade', quantity: 25, minQuantity: 10, locationId: 'loc3' },
  { id: '6', name: 'Copo Descartável 200ml', category: 'copa', unit: 'pacote', quantity: 35, minQuantity: 15, locationId: 'loc2' },
  { id: '7', name: 'Café em Pó 500g', category: 'copa', unit: 'pacote', quantity: 12, minQuantity: 8, locationId: 'loc2' },
  { id: '8', name: 'Açúcar Cristal 5kg', category: 'copa', unit: 'pacote', quantity: 8, minQuantity: 4, locationId: 'loc2' },
  { id: '9', name: 'Filtro de Café', category: 'copa', unit: 'caixa', quantity: 10, minQuantity: 5, locationId: 'loc2' },
  { id: '10', name: 'Galão de Água 20L', category: 'agua', unit: 'galão', quantity: 15, minQuantity: 8, locationId: 'loc4' },
  { id: '11', name: 'Álcool 70% 1L', category: 'limpeza', unit: 'unidade', quantity: 20, minQuantity: 10, locationId: 'loc1' },
  { id: '12', name: 'Sabonete Líquido 500ml', category: 'limpeza', unit: 'unidade', quantity: 14, minQuantity: 8, locationId: 'loc1' },
  { id: '13', name: 'Lustra Móveis 200ml', category: 'limpeza', unit: 'unidade', quantity: 8, minQuantity: 4, locationId: 'loc3' },
  { id: '14', name: 'Papel Higiênico 30m', category: 'copa', unit: 'rolo', quantity: 40, minQuantity: 20, locationId: 'loc5' },
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
    const saved = localStorage.getItem('sggd-stock-app-v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: add locations if not present
        if (!parsed.locations) {
          parsed.locations = defaultLocations;
        }
        // Migration: convert old location string to locationId
        if (parsed.products) {
          parsed.products = parsed.products.map((p: any) => {
            if (p.location && !p.locationId) {
              // Try to map old location names to new IDs
              const locMap: Record<string, string> = {
                'Almoxarifado A': 'loc1',
                'Copa': 'loc2',
              };
              p.locationId = locMap[p.location] || 'loc1';
              delete p.location;
            }
            if (!p.locationId) p.locationId = 'loc1';
            return p;
          });
        }
        return parsed;
      } catch {
        // Fall through to defaults
      }
    }
    return {
      users: defaultUsers,
      products: defaultProducts,
      suppliers: defaultSuppliers,
      locations: defaultLocations,
      stockEntries: [],
      stockRequests: [],
      consumptionRecords: [],
      auditLogs: [],
      physicalInventories: [],
      currentUser: null,
      darkMode: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('sggd-stock-app-v2', JSON.stringify(state));
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
          p.id === request.productId ? { ...p, quantity: Math.max(0, p.quantity - request.quantity) } : p
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

  const addLocation = (location: StorageLocation) => {
    setState(prev => ({ ...prev, locations: [...prev.locations, location] }));
  };

  const updateLocation = (location: StorageLocation) => {
    setState(prev => ({
      ...prev,
      locations: prev.locations.map(l => l.id === location.id ? location : l),
    }));
  };

  const deleteLocation = (id: string) => {
    setState(prev => ({ ...prev, locations: prev.locations.filter(l => l.id !== id) }));
  };

  const getStockAlerts = (): Product[] => {
    return state.products.filter(p => p.quantity <= p.minQuantity);
  };

  const getLocationName = (locationId: string): string => {
    const loc = state.locations.find(l => l.id === locationId);
    return loc?.name || 'Não definido';
  };

  const findProductByName = (name: string): Product | undefined => {
    return state.products.find(p => 
      p.name.toLowerCase() === name.toLowerCase() ||
      p.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(p.name.toLowerCase())
    );
  };

  const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...log,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, auditLogs: [...prev.auditLogs, newLog] }));
  };

  const addPhysicalInventory = (inventory: PhysicalInventory) => {
    setState(prev => ({ ...prev, physicalInventories: [...prev.physicalInventories, inventory] }));
  };

  const updatePhysicalInventory = (inventory: PhysicalInventory) => {
    setState(prev => ({
      ...prev,
      physicalInventories: prev.physicalInventories.map(i => i.id === inventory.id ? inventory : i),
    }));
  };

  const toggleDarkMode = () => {
    setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const exportData = (): string => {
    return JSON.stringify(state, null, 2);
  };

  const importData = (data: string): boolean => {
    try {
      const parsed = JSON.parse(data);
      setState(parsed);
      return true;
    } catch {
      return false;
    }
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
      addLocation,
      updateLocation,
      deleteLocation,
      getStockAlerts,
      getLocationName,
      findProductByName,
      addAuditLog,
      addPhysicalInventory,
      updatePhysicalInventory,
      toggleDarkMode,
      exportData,
      importData,
    }}>
      {children}
    </AppContext.Provider>
  );
};
