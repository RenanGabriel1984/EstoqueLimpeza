import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Package, AlertTriangle, TrendingDown, ShoppingBag, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export const DashboardPage = () => {
  const { products, stockEntries, stockRequests, getStockAlerts, getLocationName } = useApp();
  const alerts = getStockAlerts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const totalProducts = products.length;
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
  const lowStockCount = alerts.length;
  const pendingRequests = stockRequests.filter(r => r.status === 'pending').length;

  // Category distribution
  const categories = [
    { name: 'Limpeza', value: products.filter(p => p.category === 'limpeza').length, color: '#3b82f6', key: 'limpeza' },
    { name: 'Copa', value: products.filter(p => p.category === 'copa').length, color: '#f59e0b', key: 'copa' },
    { name: 'Água', value: products.filter(p => p.category === 'agua').length, color: '#06b6d4', key: 'agua' },
  ];

  // Detailed consumption data - shows which products were consumed
  const consumptionData = [
    { name: 'Seg', 'Café em Pó': 3, 'Copos Desc.': 8, 'Detergente': 2, 'Papel Toalha': 4, 'Água 20L': 2 },
    { name: 'Ter', 'Café em Pó': 2, 'Copos Desc.': 6, 'Detergente': 1, 'Papel Toalha': 3, 'Água 20L': 1 },
    { name: 'Qua', 'Café em Pó': 4, 'Copos Desc.': 10, 'Detergente': 3, 'Papel Toalha': 5, 'Água 20L': 3 },
    { name: 'Qui', 'Café em Pó': 2, 'Copos Desc.': 7, 'Detergente': 1, 'Papel Toalha': 2, 'Água 20L': 2 },
    { name: 'Sex', 'Café em Pó': 3, 'Copos Desc.': 9, 'Detergente': 2, 'Papel Toalha': 4, 'Água 20L': 1 },
  ];

  const COLORS = ['#3b82f6', '#f59e0b', '#06b6d4', '#10b981', '#8b5cf6'];

  const stats = [
    { label: 'Total de Produtos', value: totalProducts, icon: Package, color: 'bg-blue-500', change: '+2', up: true },
    { label: 'Itens em Estoque', value: totalItems, icon: ShoppingBag, color: 'bg-green-500', change: '+15', up: true },
    { label: 'Estoque Baixo', value: lowStockCount, icon: AlertTriangle, color: 'bg-amber-500', change: '-1', up: false },
    { label: 'Requisições Pendentes', value: pendingRequests, icon: TrendingDown, color: 'bg-purple-500', change: '+3', up: true },
  ];

  // Products by selected category (for pie chart click)
  const categoryProducts = selectedCategory 
    ? products.filter(p => p.category === selectedCategory)
    : [];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.up ? (
                      <ArrowUpRight className="w-3 h-3 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} este mês
                    </span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detailed Consumption Chart */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-800 mb-1">Consumo Semanal por Produto</h3>
          <p className="text-xs text-gray-500 mb-4">Quantidade consumida de cada produto por dia</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Café em Pó" stackId="a" fill="#92400e" name="Café em Pó (pacotes)" />
                <Bar dataKey="Copos Desc." stackId="a" fill="#3b82f6" name="Copos Descart. (pacotes)" />
                <Bar dataKey="Detergente" stackId="a" fill="#10b981" name="Detergente (unidades)" />
                <Bar dataKey="Papel Toalha" stackId="a" fill="#f59e0b" name="Papel Toalha (rolos)" />
                <Bar dataKey="Água 20L" stackId="a" fill="#06b6d4" name="Galão Água 20L" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution - Interactive */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-800 mb-1">Distribuição por Categoria</h3>
          <p className="text-xs text-gray-500 mb-4">Clique em uma categoria para ver os produtos</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={(data) => setSelectedCategory(data.key)}
                  cursor="pointer"
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {categories.map((cat, i) => (
              <button 
                key={i} 
                className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                onClick={() => setSelectedCategory(selectedCategory === cat.key ? null : cat.key)}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-gray-600">{cat.name} ({cat.value})</span>
              </button>
            ))}
          </div>
          
          {/* Category Products List */}
          {selectedCategory && (
            <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">
                  Produtos - {categories.find(c => c.key === selectedCategory)?.name}
                </h4>
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Fechar
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {categoryProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs font-medium text-gray-800">{product.name}</p>
                      <p className="text-[10px] text-gray-500">{getLocationName(product.locationId)}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{product.quantity} {product.unit}(s)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alerts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800">Alertas de Estoque Baixo</h3>
            <span className="badge badge-danger">{alerts.length} itens</span>
          </div>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Todos os itens estão com estoque adequado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 5).map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-500">{getLocationName(product.locationId)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{product.quantity} {product.unit}(s)</p>
                    <p className="text-xs text-gray-500">Mín: {product.minQuantity}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Entries */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Últimas Entradas</h3>
          {stockEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma entrada registrada ainda</p>
              <p className="text-xs mt-1">Use o menu "Entrada" ou "Notas Fiscais"</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stockEntries.slice(-5).reverse().map(entry => {
                const product = products.find(p => p.id === entry.productId);
                return (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{product?.name || 'Produto'}</p>
                      <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">+{entry.quantity}</p>
                      <p className="text-xs text-gray-500">
                        {entry.entryType === 'invoice' ? `NF: ${entry.invoiceNumber}` : 'Entrada Manual'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
