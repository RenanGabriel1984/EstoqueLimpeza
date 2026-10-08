import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Package, Plus, Search, MapPin, Check, AlertCircle } from 'lucide-react';

export const EntryPage = () => {
  const { products, locations, suppliers, addProduct, addStockEntry, getLocationName, findProductByName } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'limpeza' as 'limpeza' | 'copa' | 'agua',
    unit: 'unidade',
    minQuantity: 5,
    locationId: locations[0]?.id || '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Filter products by search
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-detect existing product
  const existingProduct = searchTerm ? findProductByName(searchTerm) : null;

  const handleSelectProduct = (productId: string) => {
    setSelectedProduct(productId);
    setSearchTerm(products.find(p => p.id === productId)?.name || '');
  };

  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProduct && quantity > 0) {
      // Entry for existing product
      addStockEntry({
        id: Date.now().toString(),
        productId: selectedProduct,
        quantity,
        date: new Date().toISOString(),
        supplierId: '1',
        invoiceNumber: 'MANUAL-' + Date.now().toString().slice(-6),
        entryType: 'manual',
        notes: 'Entrada manual sem nota fiscal',
      });
      
      const product = products.find(p => p.id === selectedProduct);
      setSuccessMessage(`✓ Entrada de ${quantity} ${product?.unit}(s) de "${product?.name}" registrada com sucesso!`);
      setSelectedProduct(null);
      setSearchTerm('');
      setQuantity(1);
      
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  const handleCreateAndEntry = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProductForm.name) return;

    // Create new product
    const newProductId = Date.now().toString();
    addProduct({
      id: newProductId,
      name: newProductForm.name,
      category: newProductForm.category,
      unit: newProductForm.unit,
      quantity: 0,
      minQuantity: newProductForm.minQuantity,
      locationId: newProductForm.locationId,
    });

    // Add stock entry
    addStockEntry({
      id: Date.now().toString() + '1',
      productId: newProductId,
      quantity,
      date: new Date().toISOString(),
      supplierId: '1',
      invoiceNumber: 'MANUAL-' + Date.now().toString().slice(-6),
      entryType: 'manual',
      notes: 'Entrada manual - produto novo cadastrado',
    });

    setSuccessMessage(`✓ Produto "${newProductForm.name}" cadastrado e entrada de ${quantity} ${newProductForm.unit}(s) registrada!`);
    setShowNewProduct(false);
    setNewProductForm({
      name: '',
      category: 'limpeza',
      unit: 'unidade',
      minQuantity: 5,
      locationId: locations[0]?.id || '',
    });
    setQuantity(1);
    setSearchTerm('');
    
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Entrada de Produtos</h2>
        <p className="text-sm text-gray-500">Registre entradas manuais de produtos no estoque</p>
      </div>

      {/* Info Card */}
      <div className="card bg-blue-50 border-blue-100">
        <div className="flex items-start gap-3">
          <Package className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Entrada Manual de Produtos</p>
            <p className="text-xs text-blue-600 mt-1">
              Use esta opção quando receber produtos sem nota fiscal ou quando a NF não foi fornecida em tempo hábil.
              Busque o produto existente ou cadastre um novo produto com sua classificação e local de armazenamento.
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="card bg-green-50 border-green-200 animate-fade-in">
          <p className="text-sm text-green-700 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Search and Entry */}
      <div className="card">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Registrar Entrada</h3>
        
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar Produto</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Digite o nome do produto..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedProduct(null);
                }}
                className="input-field pl-9"
              />
            </div>
            
            {/* Auto-suggestion */}
            {existingProduct && !selectedProduct && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Produto encontrado: <strong>{existingProduct.name}</strong>
                </p>
                <button
                  onClick={() => handleSelectProduct(existingProduct.id)}
                  className="text-xs text-green-700 font-medium mt-1 underline"
                >
                  Selecionar este produto
                </button>
              </div>
            )}

            {/* Product List */}
            {searchTerm && !selectedProduct && filteredProducts.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product.id)}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-800">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        Estoque: {product.quantity} {product.unit}(s)
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {getLocationName(product.locationId)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Product Info */}
          {selectedProduct && (() => {
            const product = products.find(p => p.id === selectedProduct);
            if (!product) return null;
            return (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="badge badge-info">
                        {product.category === 'limpeza' ? 'Limpeza' : product.category === 'copa' ? 'Copa' : 'Água'}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {getLocationName(product.locationId)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Estoque atual: {product.quantity} {product.unit}(s)
                    </p>
                  </div>
                  <button
                    onClick={() => { setSelectedProduct(null); setSearchTerm(''); }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Alterar
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Quantity */}
          {selectedProduct && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="input-field"
                min="1"
                required
              />
            </div>
          )}

          {/* Submit */}
          {selectedProduct && (
            <button onClick={handleSubmitEntry} className="btn-primary w-full">
              Registrar Entrada
            </button>
          )}

          {/* New Product Option */}
          {!selectedProduct && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-3">Produto não encontrado?</p>
              <button
                onClick={() => setShowNewProduct(!showNewProduct)}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Novo Produto e Dar Entrada
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Product Form */}
      {showNewProduct && (
        <div className="card animate-slide-up">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Cadastrar Novo Produto</h3>
          <form onSubmit={handleCreateAndEntry} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
              <input
                type="text"
                value={newProductForm.name}
                onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                className="input-field"
                required
                placeholder="Ex: Detergente Líquido 500ml"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={newProductForm.category}
                  onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value as any })}
                  className="input-field"
                >
                  <option value="limpeza">Produto de Limpeza</option>
                  <option value="copa">Material de Copa</option>
                  <option value="agua">Água</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                <select
                  value={newProductForm.unit}
                  onChange={(e) => setNewProductForm({ ...newProductForm, unit: e.target.value })}
                  className="input-field"
                >
                  <option value="unidade">Unidade</option>
                  <option value="pacote">Pacote</option>
                  <option value="caixa">Caixa</option>
                  <option value="rolo">Rolo</option>
                  <option value="galão">Galão</option>
                  <option value="litro">Litro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade de Entrada</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="input-field"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Mínima</label>
                <input
                  type="number"
                  value={newProductForm.minQuantity}
                  onChange={(e) => setNewProductForm({ ...newProductForm, minQuantity: parseInt(e.target.value) || 5 })}
                  className="input-field"
                  min="1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Alerta quando atingir este valor</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Local de Armazenamento</label>
              <select
                value={newProductForm.locationId}
                onChange={(e) => setNewProductForm({ ...newProductForm, locationId: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Selecione o local</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Onde este produto será armazenado</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowNewProduct(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button type="submit" className="btn-primary flex-1">
                Cadastrar e Dar Entrada
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
