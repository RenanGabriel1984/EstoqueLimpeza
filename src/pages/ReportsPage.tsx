import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';
import { Calendar, TrendingUp, Package, Download, Filter } from 'lucide-react';

export const ReportsPage = () => {
  const { products, stockEntries, stockRequests, consumptionRecords, suppliers } = useApp();
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'semester' | 'year'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [reportType, setReportType] = useState<'consumption' | 'entries' | 'projection' | 'suppliers'>('consumption');

  // Generate mock consumption data based on period
  const generateConsumptionData = () => {
    const periods: Record<string, { labels: string[]; count: number }> = {
      week: { labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'], count: 5 },
      month: { labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'], count: 4 },
      quarter: { labels: ['Mês 1', 'Mês 2', 'Mês 3'], count: 3 },
      semester: { labels: ['Mês 1', 'Mês 2', 'Mês 3', 'Mês 4', 'Mês 5', 'Mês 6'], count: 6 },
      year: { labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'], count: 12 },
    };

    const config = periods[period];
    const filteredProducts = selectedCategory === 'all' 
      ? products 
      : products.filter(p => p.category === selectedCategory);

    return config.labels.map((label, i) => {
      const entry: Record<string, any> = { name: label };
      filteredProducts.slice(0, 5).forEach(product => {
        entry[product.name.substring(0, 15)] = Math.floor(Math.random() * 20) + 5;
      });
      return entry;
    });
  };

  // Generate projection data
  const generateProjectionData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, i) => ({
      name: month,
      real: i <= currentMonth ? Math.floor(Math.random() * 30) + 20 : null,
      projecao: i >= currentMonth ? Math.floor(Math.random() * 30) + 20 : null,
    }));
  };

  // Category analysis
  const categoryAnalysis = useMemo(() => {
    const categories = [
      { name: 'Limpeza', color: '#3b82f6', products: products.filter(p => p.category === 'limpeza') },
      { name: 'Copa', color: '#f59e0b', products: products.filter(p => p.category === 'copa') },
      { name: 'Água', color: '#06b6d4', products: products.filter(p => p.category === 'agua') },
    ];

    return categories.map(cat => ({
      name: cat.name,
      color: cat.color,
      totalItems: cat.products.reduce((sum, p) => sum + p.quantity, 0),
      productCount: cat.products.length,
      avgConsumption: Math.floor(Math.random() * 15) + 5,
      lowStock: cat.products.filter(p => p.quantity <= p.minQuantity).length,
    }));
  }, [products]);

  // Supplier analysis
  const supplierAnalysis = useMemo(() => {
    return suppliers.map(supplier => {
      const entries = stockEntries.filter(e => e.supplierId === supplier.id);
      return {
        name: supplier.name,
        totalEntries: entries.length,
        totalItems: entries.reduce((sum, e) => sum + e.quantity, 0),
        lastEntry: entries.length > 0 ? new Date(entries[entries.length - 1].date).toLocaleDateString('pt-BR') : 'Nunca',
      };
    });
  }, [suppliers, stockEntries]);

  const consumptionData = generateConsumptionData();
  const projectionData = generateProjectionData();

  const COLORS = ['#3b82f6', '#f59e0b', '#06b6d4', '#10b981', '#8b5cf6'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Relatórios e Análises</h2>
          <p className="text-sm text-gray-500">Análise detalhada do consumo e estoque</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Relatório</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'consumption', label: 'Consumo' },
                { value: 'entries', label: 'Entradas' },
                { value: 'projection', label: 'Projeção' },
                { value: 'suppliers', label: 'Fornecedores' },
              ].map(type => (
                <button
                  key={type.value}
                  onClick={() => setReportType(type.value as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    reportType === type.value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Período</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="input-field"
            >
              <option value="week">Semanal</option>
              <option value="month">Mensal</option>
              <option value="quarter">Trimestral</option>
              <option value="semester">Semestral</option>
              <option value="year">Anual</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Categoria</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="all">Todas</option>
              <option value="limpeza">Limpeza</option>
              <option value="copa">Copa</option>
              <option value="agua">Água</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {reportType === 'consumption' && (
        <div className="space-y-4">
          {/* Consumption Chart */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-800 mb-4">
              Consumo por Produto - {period === 'week' ? 'Semanal' : period === 'month' ? 'Mensal' : period === 'quarter' ? 'Trimestral' : period === 'semester' ? 'Semestral' : 'Anual'}
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consumptionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  {Object.keys(consumptionData[0] || {}).filter(k => k !== 'name').map((key, i) => (
                    <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[2, 2, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categoryAnalysis.map((cat, i) => (
              <div key={i} className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.color + '20' }}>
                    <Package className="w-5 h-5" style={{ color: cat.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{cat.name}</p>
                    <p className="text-xs text-gray-500">{cat.productCount} produtos</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total em estoque</span>
                    <span className="font-semibold">{cat.totalItems}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Consumo médio/periodo</span>
                    <span className="font-semibold">{cat.avgConsumption}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Itens em alerta</span>
                    <span className={`font-semibold ${cat.lowStock > 0 ? 'text-red-600' : 'text-green-600'}`}>{cat.lowStock}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cross-analysis */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Análise Cruzada - Copa (Café + Açúcar + Copos)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={consumptionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="Café em Pó 500g" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="Açúcar Cristal" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="Copo Descartável" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {reportType === 'projection' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Projeção de Consumo Anual</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="real" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Consumo Real" />
                  <Line type="monotone" dataKey="projecao" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} name="Projeção" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Projection Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.slice(0, 4).map(product => {
              const avgConsumption = Math.floor(Math.random() * 10) + 5;
              const daysRemaining = Math.floor((product.quantity / avgConsumption) * 7);
              return (
                <div key={product.id} className="card">
                  <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Estoque atual</span>
                      <span className="font-semibold">{product.quantity}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Consumo médio/sem</span>
                      <span className="font-semibold">{avgConsumption}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Dias restantes</span>
                      <span className={`font-semibold ${daysRemaining < 14 ? 'text-red-600' : daysRemaining < 30 ? 'text-amber-600' : 'text-green-600'}`}>
                        ~{daysRemaining} dias
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${daysRemaining < 14 ? 'bg-red-500' : daysRemaining < 30 ? 'bg-amber-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(100, (product.quantity / (product.minQuantity * 3)) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {reportType === 'entries' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Entradas por Período</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consumptionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Bar dataKey="Café em Pó 500g" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Detergente Líq" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Table */}
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Produto</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total Entradas</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Estoque Atual</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Consumo Est.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{product.name}</td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-green-600">
                        {stockEntries.filter(e => e.productId === product.id).reduce((sum, e) => sum + e.quantity, 0) || '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold">{product.quantity}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">{Math.floor(Math.random() * 15) + 3}/mês</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'suppliers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {supplierAnalysis.map((supplier, i) => (
              <div key={i} className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 truncate">{supplier.name}</p>
                    <p className="text-xs text-gray-500">Última: {supplier.lastEntry}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total de entradas</span>
                    <span className="font-semibold">{supplier.totalEntries}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total de itens</span>
                    <span className="font-semibold">{supplier.totalItems}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Supplier Chart */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Distribuição de Fornecimento</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={supplierAnalysis.map(s => ({ name: s.name, value: s.totalItems || 1 }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name.substring(0, 15)}... (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {supplierAnalysis.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
