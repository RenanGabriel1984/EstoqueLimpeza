import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QrCode, Package, MapPin, Download, Printer, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '../components/ToastProvider';

export const BarcodePage = () => {
  const { products, locations, generateBarcode } = useApp();
  const { showToast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');

  const handleGenerateProductBarcode = () => {
    if (!selectedProduct) return;
    const code = generateBarcode(selectedProduct);
    setGeneratedCode(code);
    showToast('success', 'Código gerado com sucesso!');
  };

  const handleGenerateLocationBarcode = () => {
    if (!selectedLocation) return;
    const code = generateBarcode(selectedLocation);
    setGeneratedCode(code);
    showToast('success', 'Código gerado com sucesso!');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    showToast('success', 'Código copiado para a área de transferência!');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const product = products.find(p => p.id === selectedProduct);
    const location = locations.find(l => l.id === selectedLocation);
    const name = product?.name || location?.name || 'Item';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Etiqueta - ${name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .label { border: 2px solid #000; padding: 20px; margin: 10px; width: 300px; }
          .name { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .barcode { font-family: monospace; font-size: 14px; letter-spacing: 2px; margin: 10px 0; }
          .info { font-size: 12px; color: #666; }
          @media print { body { padding: 0; } .label { page-break-inside: avoid; } }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="name">${name}</div>
          <div class="barcode">${generatedCode}</div>
          <div class="info">
            ${product ? `Categoria: ${product.category} | Qtd: ${product.quantity}` : ''}
            ${location ? `Local: ${location.name}` : ''}
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Código de Barras / QR Code</h2>
        <p className="text-gray-600">Gere códigos para identificação rápida de produtos e locais</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex gap-1">
        <button
          onClick={() => { setSelectedLocation(''); setGeneratedCode(''); }}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedProduct || (!selectedProduct && !selectedLocation) ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Produto
        </button>
        <button
          onClick={() => { setSelectedProduct(''); setGeneratedCode(''); }}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedLocation ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <MapPin className="w-4 h-4 inline mr-2" />
          Local
        </button>
      </div>

      {/* Seleção */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {selectedProduct || (!selectedProduct && !selectedLocation) ? (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione um Produto
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => { setSelectedProduct(e.target.value); setGeneratedCode(''); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            >
              <option value="">Escolha um produto...</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerateProductBarcode}
              disabled={!selectedProduct}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <QrCode className="w-4 h-4 inline mr-2" />
              Gerar Código
            </button>
          </>
        ) : (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione um Local
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => { setSelectedLocation(e.target.value); setGeneratedCode(''); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            >
              <option value="">Escolha um local...</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerateLocationBarcode}
              disabled={!selectedLocation}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <QrCode className="w-4 h-4 inline mr-2" />
              Gerar Código
            </button>
          </>
        )}
      </div>

      {/* Código Gerado */}
      {generatedCode && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Código Gerado</h3>
          
          {/* Visualização do Código */}
          <div className="bg-gray-50 rounded-lg p-8 mb-4 text-center">
            <div className="inline-block border-4 border-black p-4 bg-white">
              <div className="font-mono text-2xl tracking-widest mb-2">
                {generatedCode.split('').map((char, i) => (
                  <span key={i} className="inline-block w-3">
                    {parseInt(char) % 2 === 0 ? '█' : '▌'}
                  </span>
                ))}
              </div>
              <div className="text-sm font-mono mt-2">{generatedCode}</div>
            </div>
          </div>

          {/* Informações */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Produto:</strong> {products.find(p => p.id === selectedProduct)?.name || 'N/A'}
            </p>
            {selectedLocation && (
              <p className="text-sm text-blue-800 mt-1">
                <strong>Local:</strong> {locations.find(l => l.id === selectedLocation)?.name}
              </p>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <button onClick={handleCopyCode} className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <Copy className="w-4 h-4" />
              Copiar
            </button>
            <button onClick={handlePrint} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Printer className="w-4 h-4" />
              Imprimir Etiqueta
            </button>
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-800 mb-3">Como Usar</h3>
        <ul className="space-y-2 text-sm text-purple-700">
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Gere códigos para produtos e locais de armazenamento</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Imprima as etiquetas e cole nos produtos/armários</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Use um leitor de código de barras ou câmera do celular para scan</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Acelere o processo de entrada e inventário físico</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
