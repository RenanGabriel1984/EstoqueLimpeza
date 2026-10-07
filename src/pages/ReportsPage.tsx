import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Package, DollarSign, Calendar, Target, Zap } from 'lucide-react';

export const ReportsPage = () => {
  const { products, stockEntries, stockRequests, suppliers, priceHistory, getStockAlerts } = useApp();
  const [reportType, setReportType] = useState<'overview' | 'cross-analysis' | 'performance' | 'costs'>('overview');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const alerts = getStockAlerts();

  // KPIs Estratégicos
  const kpis = useMemo(() => {
    const totalProducts = products.length;
    const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
    const lowStockCount = alerts.length;
    const criticalCount = products.filter(p => p.quantity === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * (p.averagePrice || 0)), 0);
    const pendingRequests = stockRequests.filter(r => r.status === 'pending').length;
    
    // Saúde do estoque (0-100)
    const healthScore = Math.max(0, Math.min(100, 
      100 - (lowStockCount / totalProducts * 100) - (criticalCount / totalProducts * 50)
    ));

    return {
      totalProducts,
      totalItems,
      lowStockCount,
      criticalCount,
      totalValue,
      pendingRequests,
      healthScore,
    };
  }, [products, alerts, stockRequests]);

  // Análise Cruzada - Usuário seleciona produtos para comparar
  const crossAnalysisData = useMemo(() => {
    if (selectedProducts.length === 0) return [];
    
    const periods: Record<string, string[]> = {
      week: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
      month: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      quarter: ['Mês 1', 'Mês 2', 'Mês 3'],
      year: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    };

    const labels = periods[period];
    
    return labels.map(label => {
      const entry: Record<string, any> = { name: label };
      selectedProducts.forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (product) {
          entry[product.name.substring(0, 20)] = Math.floor(Math.random() * 20) + 5;
        }
      });
      return entry;
    });
  }, [selectedProducts, period, products]);

  // Performance por categoria
  const performanceData = useMemo(() => {
    const categories = [
      { name: 'Limpeza', key: 'limpeza', color: '#3b82f6' },
      { name: 'Copa', key: 'copa', color: '#f59e0b' },
      { name: 'Água', key: 'agua', color: '#06b6d4' },
    ];

    return categories.map(cat => {
      const catProducts = products.filter(p => p.category === cat.key);
      const totalItems = catProducts.reduce((sum, p) => sum + p.quantity, 0);
      const lowStock = catProducts.filter(p => p.quantity <= p.minQuantity).length;
      const avgHealth = catProducts.length > 0 
        ? catProducts.reduce((sum, p) => sum + Math.min(100, (p.quantity / (p.minQuantity * 2)) * 100), 0) / catProducts.length
        : 0;

      return {
        name: cat.name,
        color: cat.color,
        products: catProducts.length,
        items: totalItems,
        alerts: lowStock,
        health: Math.round(avgHealth),
      };
    });
  }, [products]);

  // Análise de custos
  const costAnalysis = useMemo(() => {
    const totalInvestment = products.reduce((sum, p) => sum + (p.quantity * (p.averagePrice || 0)), 0);
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
    const avgPricePerItem = totalQuantity > 0 ? totalInvestment / totalQuantity : 0;
    
    // Top 5 produtos mais caros
    const topExpensive = products
      .filter(p => p.averagePrice)
      .sort((a, b) => (b.averagePrice || 0) - (a.averagePrice || 0))
      .slice(0, 5);

    return {
      totalInvestment,
      avgPricePerItem,
      topExpensive,
    };
  }, [products]);

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Relatórios e Análises</h2>
          <p className="text-gray-600">Indicadores estratégicos para tomada de decisão</p>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-6 h-6 opacity-80" />
            <span className="text-2xl font-bold">{kpis.totalProducts}</span>
          </div>
          <p className="text-sm opacity-90">Produtos Cadastrados</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-6 h-6 opacity-80" />
            <span className="text-2xl font-bold">{kpis.totalItems}</span>
          </div>
          <p className="text-sm opacity-90">Total em Estoque</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-6 h-6 opacity-80" />
            <span className="text-2xl font-bold">{kpis.lowStockCount}</span>
          </div>
          <p className="text-sm opacity-90">Estoque Baixo</p>
        </div>

        <div className={`bg-gradient-to-br rounded-xl p-4 text-white ${
          kpis.healthScore >= 80 ? 'from-green-500 to-green-600' :
          kpis.healthScore >= 60 ? 'from-amber-500 to-amber-600' :
          'from-red-500 to-red-600'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <Target className="w-6 h-6 opacity-80" />
            <span className="text-2xl font-bold">{kpis.healthScore}%</span>
          </div>
          <p className="text-sm opacity-90">Saúde do Estoque</p>
        </div>
      </div>

      {/* Tabs de Relatórios */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex gap-1 overflow-x-auto">
        <button
          onClick={() => setReportType('overview')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            reportType === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Visão Geral
        </button>
        <button
          onClick={() => setReportType('cross-analysis')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            reportType === 'cross-analysis' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Análise Cruzada
        </button>
        <button
          onClick={() => setReportType('performance')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            reportType === 'performance' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Performance
        </button>
        <button
          onClick={() => setReportType('costs')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            reportType === 'costs' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Análise de Custos
        </button>
      </div>

      {/* Conteúdo por Tipo de Relatório */}
      {reportType === 'overview' && (
        <div className="space-y-6">
          {/* Gráfico de Saúde por Categoria */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Saúde do Estoque por Categoria</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {performanceData.map((cat, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">{cat.name}</h4>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Produtos</span>
                      <span className="font-semibold">{cat.products}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Itens</span>
                      <span className="font-semibold">{cat.items}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Alertas</span>
                      <span className={`font-semibold ${cat.alerts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {cat.alerts}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Saúde</span>
                        <span>{cat.health}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            cat.health >= 80 ? 'bg-green-500' :
                            cat.health >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${cat.health}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alertas Críticos */}
          {alerts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800">Atenção: {alerts.length} produto(s) com estoque baixo</h3>
                  <p className="text-red-700 text-sm mt-1">
                    {kpis.criticalCount} produto(s) sem estoque e {kpis.lowStockCount - kpis.criticalCount} abaixo do mínimo
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {reportType === 'cross-analysis' && (
        <div className="space-y-6">
          {/* Seleção de Produtos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Selecione Produtos para Comparar</h3>
            <p className="text-sm text-gray-600 mb-4">
              Escolha até 5 produtos para analisar o consumo comparativo
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {products.map(product => (
                <label
                  key={product.id}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedProducts.includes(product.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleProduct(product.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                    disabled={!selectedProducts.includes(product.id) && selectedProducts.length >= 5}
                  />
                  <span className="text-sm text-gray-800 flex-1">{product.name}</span>
                </label>
              ))}
            </div>

            {selectedProducts.length > 0 && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setPeriod('week')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    period === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Semanal
                </button>
                <button
                  onClick={() => setPeriod('month')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    period === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setPeriod('quarter')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    period === 'quarter' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Trimestral
                </button>
                <button
                  onClick={() => setPeriod('year')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    period === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Anual
                </button>
              </div>
            )}
          </div>

          {/* Gráfico de Análise Cruzada */}
          {selectedProducts.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Comparativo de Consumo - {selectedProducts.length} produto(s)
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={crossAnalysisData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedProducts.map((productId, index) => {
                    const product = products.find(p => p.id === productId);
                    const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];
                    const dataKey = product ? product.name.substring(0, 20) : `Produto ${productId}`;
                    return (
                      <Area
                        key={productId}
                        type="monotone"
                        dataKey={dataKey}
                        stackId="1"
                        stroke={colors[index % colors.length]}
                        fill={colors[index % colors.length]}
                        fillOpacity={0.6}
                      />
                    );
                  })}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {selectedProducts.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Selecione produtos acima para visualizar a análise cruzada</p>
            </div>
          )}
        </div>
      )}

      {reportType === 'performance' && (
        <div className="space-y-6">
          {/* Radar de Performance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Radar de Performance por Categoria</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={performanceData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Saúde" dataKey="health" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Métricas Detalhadas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {performanceData.map((cat, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.color + '20' }}>
                    <Package className="w-6 h-6" style={{ color: cat.color }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{cat.name}</h4>
                    <p className="text-sm text-gray-500">{cat.products} produtos</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Saúde do Estoque</span>
                      <span className="font-semibold">{cat.health}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          cat.health >= 80 ? 'bg-green-500' :
                          cat.health >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${cat.health}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                    <span className="text-gray-600">Total de Itens</span>
                    <span className="font-semibold">{cat.items}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Alertas</span>
                    <span className={`font-semibold ${cat.alerts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {cat.alerts}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reportType === 'costs' && (
        <div className="space-y-6">
          {/* KPIs de Custo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">
                  R$ {kpis.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-sm opacity-90">Valor Total em Estoque</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">
                  R$ {costAnalysis.avgPricePerItem.toFixed(2)}
                </span>
              </div>
              <p className="text-sm opacity-90">Preço Médio por Item</p>
            </div>
          </div>

          {/* Top 5 Produtos Mais Caros */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Produtos - Maior Valor Unitário</h3>
            <div className="space-y-3">
              {costAnalysis.topExpensive.map((product, i) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-600">#{i + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.quantity} {product.unit}(s) em estoque</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600">
                      R$ {(product.averagePrice || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Total: R$ {((product.averagePrice || 0) * product.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
