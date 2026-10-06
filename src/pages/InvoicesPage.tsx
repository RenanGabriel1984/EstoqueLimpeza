import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Upload, CheckCircle, AlertCircle, Eye, Download, X, FileUp, Search } from 'lucide-react';

interface XMLProduct {
  name: string;
  quantity: number;
  unit: string;
  matchedProductId?: string;
}

interface ParsedInvoice {
  number: string;
  supplier: string;
  cnpj: string;
  date: string;
  products: XMLProduct[];
  totalValue: string;
}

export const InvoicesPage = () => {
  const { stockEntries, addStockEntry, products, suppliers } = useApp();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showConferenceModal, setShowConferenceModal] = useState(false);
  const [parsedInvoice, setParsedInvoice] = useState<ParsedInvoice | null>(null);
  const [conferenceConfirmed, setConferenceConfirmed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate XML parsing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      // Try to parse as XML
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, 'text/xml');
        
        // Try to extract NF-e data
        const infNFe = xmlDoc.querySelector('infNFe');
        const ide = xmlDoc.querySelector('ide');
        const emit = xmlDoc.querySelector('emit');
        const detElements = xmlDoc.querySelectorAll('det');

        if (infNFe) {
          const invoiceNumber = ide?.querySelector('nNF')?.textContent || 'N/A';
          const supplierName = emit?.querySelector('xNome')?.textContent || 'Fornecedor';
          const cnpj = emit?.querySelector('CNPJ')?.textContent || '';
          const date = ide?.querySelector('dhEmi')?.textContent?.split('T')[0] || new Date().toISOString().split('T')[0];

          const xmlProducts: XMLProduct[] = [];
          detElements.forEach((det) => {
            const prod = det.querySelector('prod');
            if (prod) {
              const name = prod.querySelector('xProd')?.textContent || '';
              const qty = parseFloat(prod.querySelector('qCom')?.textContent || '0');
              const unit = prod.querySelector('uCom')?.textContent || 'UN';
              
              // Try to match with existing products
              const matchedProduct = products.find(p => 
                p.name.toLowerCase().includes(name.toLowerCase().substring(0, 10)) ||
                name.toLowerCase().includes(p.name.toLowerCase().substring(0, 10))
              );

              xmlProducts.push({
                name,
                quantity: qty,
                unit,
                matchedProductId: matchedProduct?.id,
              });
            }
          });

          const total = xmlDoc.querySelector('ICMSTot')?.querySelector('vNF')?.textContent || '0,00';

          setParsedInvoice({
            number: invoiceNumber,
            supplier: supplierName,
            cnpj,
            date,
            products: xmlProducts,
            totalValue: total,
          });
          setShowUploadModal(false);
          setShowConferenceModal(true);
        } else {
          // If not a valid NF-e XML, create a simulated one
          simulateParsedInvoice();
        }
      } catch {
        // If XML parsing fails, simulate
        simulateParsedInvoice();
      }
    };
    reader.readAsText(file);
  };

  const simulateParsedInvoice = () => {
    // Simulated invoice for demo purposes
    setParsedInvoice({
      number: 'NF-' + Math.floor(Math.random() * 90000 + 10000),
      supplier: suppliers[0]?.name || 'Fornecedor Demo',
      cnpj: suppliers[0]?.cnpj || '00.000.000/0001-00',
      date: new Date().toISOString().split('T')[0],
      products: [
        { name: 'Detergente Líquido 500ml', quantity: 20, unit: 'UN', matchedProductId: '1' },
        { name: 'Desinfetante 2L', quantity: 15, unit: 'UN', matchedProductId: '2' },
        { name: 'Papel Toalha', quantity: 30, unit: 'RL', matchedProductId: '3' },
      ],
      totalValue: '1.250,00',
    });
    setShowUploadModal(false);
    setShowConferenceModal(true);
  };

  const confirmEntry = () => {
    if (!parsedInvoice || !conferenceConfirmed) return;
    
    parsedInvoice.products.forEach((xmlProduct, index) => {
      if (xmlProduct.matchedProductId) {
        addStockEntry({
          id: Date.now().toString() + index,
          productId: xmlProduct.matchedProductId,
          quantity: xmlProduct.quantity,
          date: parsedInvoice.date,
          supplierId: suppliers[0]?.id || '1',
          invoiceNumber: parsedInvoice.number,
          entryType: 'invoice',
        });
      }
    });

    setShowConferenceModal(false);
    setParsedInvoice(null);
    setConferenceConfirmed(false);
    alert('Entrada registrada com sucesso!');
  };

  const handleDemoUpload = () => {
    simulateParsedInvoice();
  };

  const filteredEntries = stockEntries.filter(entry => {
    const product = products.find(p => p.id === entry.productId);
    return product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           entry.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Notas Fiscais</h2>
          <p className="text-sm text-gray-500">Importe XML e gerencie entradas de estoque</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowUploadModal(true)} className="btn-primary flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Importar XML
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="card bg-blue-50 border-blue-100">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Importação de Nota Fiscal Eletrônica</p>
            <p className="text-xs text-blue-600 mt-1">
              Faça upload do arquivo XML da NF-e para registrar automaticamente a entrada dos produtos no estoque.
              Após a importação, você poderá conferir os itens com a nota impressa antes de confirmar.
            </p>
            <button onClick={handleDemoUpload} className="text-xs text-blue-700 font-medium mt-2 underline hover:no-underline">
              → Usar nota de demonstração
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por produto ou número da NF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* Entries List */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">NF</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Produto</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Qtd</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Data</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Fornecedor</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma entrada registrada</p>
                    <p className="text-xs mt-1">Importe um XML ou use a demonstração</p>
                  </td>
                </tr>
              ) : (
                filteredEntries.map(entry => {
                  const product = products.find(p => p.id === entry.productId);
                  const supplier = suppliers.find(s => s.id === entry.supplierId);
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono font-medium text-gray-800">{entry.invoiceNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-800">{product?.name || 'Produto'}</p>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className="text-sm font-semibold text-green-600">+{entry.quantity}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                        {new Date(entry.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                        {supplier?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="badge badge-success">Registrada</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Importar XML</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div 
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">Clique para selecionar o arquivo XML</p>
                <p className="text-xs text-gray-500 mt-1">Formato: .xml (NF-e)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xml"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700">
                  <strong>Dica:</strong> Você também pode usar a opção "Nota de demonstração" na tela principal para testar o sistema.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conference Modal */}
      {showConferenceModal && parsedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-lg font-semibold text-gray-800">Conferência da Nota Fiscal</h3>
              <button onClick={() => { setShowConferenceModal(false); setParsedInvoice(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Invoice Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Nº da NF</p>
                  <p className="text-sm font-bold text-gray-800">{parsedInvoice.number}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Fornecedor</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{parsedInvoice.supplier}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">CNPJ</p>
                  <p className="text-sm font-bold text-gray-800">{parsedInvoice.cnpj}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Data</p>
                  <p className="text-sm font-bold text-gray-800">{new Date(parsedInvoice.date).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              {/* Products Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Produto</th>
                      <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500">Qtd</th>
                      <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedInvoice.products.map((product, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <p className="text-sm text-gray-800">{product.name}</p>
                          <p className="text-xs text-gray-500">Un: {product.unit}</p>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="text-sm font-semibold">{product.quantity}</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          {product.matchedProductId ? (
                            <span className="badge badge-success flex items-center gap-1 mx-auto w-fit">
                              <CheckCircle className="w-3 h-3" /> Vinculado
                            </span>
                          ) : (
                            <span className="badge badge-warning flex items-center gap-1 mx-auto w-fit">
                              <AlertCircle className="w-3 h-3" /> Sem vínculo
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Conference Checklist */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={conferenceConfirmed}
                    onChange={(e) => setConferenceConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-green-600 rounded border-green-300 focus:ring-green-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-green-800">Conferência realizada</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Confirmo que os itens do XML conferem com a nota fiscal impressa e autorizo a entrada no estoque.
                    </p>
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => { setShowConferenceModal(false); setParsedInvoice(null); }}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmEntry}
                  disabled={!conferenceConfirmed}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    conferenceConfirmed 
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Confirmar Entrada
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
