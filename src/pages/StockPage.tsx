import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Package, MapPin, Search, Filter, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';

export const StockPage = () => {
  const { products, locations, getLocationName } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set(locations.map(l => l.id)));

  const toggleLocation = (locationId: string) => {
    const newExpanded = new Set(expandedLocations);
    if (newExpanded.has(locationId)) {
      newExpanded.delete(locationId);
    } else {
      newExpanded.add(locationId);
    }
    setExpandedLocations(newExpanded);
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLocation = selectedLocation === 'all' || p.locationId === selectedLocation;
    return matchSearch && matchLocation;
  });

  // Group by location
  const productsByLocation = locations.map(location => ({
    ...location,
    products: filteredProducts.filter(p => p.locationId === location.id),
  })).filter(loc => loc.products.length > 0);

  // Products without location
  const unlocatedProducts = filteredProducts.filter(p => !locations.find(l => l.id === p.locationId));

  const getStockStatus = (product: typeof products[0]) => {
    if (product.quantity <= 0) return { label: 'Sem Estoque', class: 'bg-red-100 text-red-800', color: 'text-red-600' };
    if (product.quantity <= product.minQuantity) return { label: 'Baixo', class: 'bg-amber-100 text-amber-800', color: 'text-amber-600' };
    return { label: 'Normal', class: 'bg-green-100 text-green-800', color: 'text-green-600' };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'limpeza': return '🧹';
      case 'copa': return '☕';
      case 'agua': return '💧';
      default: return '📦';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Visão do Estoque</h2>
        <p className="text-sm text-gray-500">Visualize todos os produtos organizados por local de armazenamento</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card py-3 px-4">
          <p className="text-xs text-gray-500">Total de Produtos</p>
          <p className="text-xl font-bold text-gray-800">{products.length}</p>
        </div>
        <div className="card py-3 px-4">
          <p className="text-xs text-gray-500">Total de Itens</p>
          <p className="text-xl font-bold text-gray-800">{products.reduce((s, p) => s + p.quantity, 0)}</p>
        </div>
        <div className="card py-3 px-4">
          <p className="text-xs text-gray-500">Locais de Armazenamento</p>
          <p className="text-xl font-bold text-gray-800">{locations.length}</p>
        </div>
        <div className="card py-3 px-4">
          <p className="text-xs text-gray-500">Itens em Alerta</p>
          <p className="text-xl font-bold text-amber-600">{products.filter(p => p.quantity <= p.minQuantity).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="input-field pl-9 pr-8 appearance-none"
            >
              <option value="all">Todos os Locais</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products by Location */}
      <div className="space-y-3">
        {productsByLocation.map(locationGroup => (
          <div key={locationGroup.id} className="card overflow-hidden p-0">
            {/* Location Header */}
            <button
              onClick={() => toggleLocation(locationGroup.id)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">{locationGroup.name}</p>
                  <p className="text-xs text-gray-500">{locationGroup.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="badge badge-info">{locationGroup.products.length} produtos</span>
                {expandedLocations.has(locationGroup.id) ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Products List */}
            {expandedLocations.has(locationGroup.id) && (
              <div className="divide-y divide-gray-50">
                {locationGroup.products.map(product => {
                  const status = getStockStatus(product);
                  return (
                    <div key={product.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getCategoryIcon(product.category)}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{product.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`badge ${product.category === 'limpeza' ? 'badge-info' : product.category === 'copa' ? 'badge-warning' : 'badge-success'}`}>
                              {product.category === 'limpeza' ? 'Limpeza' : product.category === 'copa' ? 'Copa' : 'Água'}
                            </span>
                            {product.quantity <= product.minQuantity && (
                              <span className="flex items-center gap-1 text-xs text-amber-600">
                                <AlertTriangle className="w-3 h-3" />
                                Estoque baixo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${status.color}`}>{product.quantity}</p>
                        <p className="text-xs text-gray-500">{product.unit}(s)</p>
                        <p className="text-xs text-gray-400">Mín: {product.minQuantity}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Unlocated Products */}
        {unlocatedProducts.length > 0 && (
          <div className="card overflow-hidden p-0">
            <div className="flex items-center justify-between p-4 bg-amber-50 border-b border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800">Sem Local Definido</p>
                  <p className="text-xs text-amber-600">Produtos sem local de armazenamento atribuído</p>
                </div>
              </div>
              <span className="badge badge-warning">{unlocatedProducts.length} produtos</span>
            </div>
            <div className="divide-y divide-gray-50">
              {unlocatedProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getCategoryIcon(product.category)}</span>
                    <p className="text-sm font-medium text-gray-800">{product.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">{product.quantity}</p>
                    <p className="text-xs text-gray-500">{product.unit}(s)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {productsByLocation.length === 0 && unlocatedProducts.length === 0 && (
          <div className="card text-center py-12 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};
