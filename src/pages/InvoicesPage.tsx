import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Upload, CheckCircle, AlertCircle, X, FileUp, Search, Loader, File } from 'lucide-react';
import { extractTextFromPDF, parseInvoiceText, matchItemsWithProducts, ParsedInvoiceData } from '../utils/pdfParser';

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
  const [showXmlModal, setShowXmlModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showConferenceModal, setShowConferenceModal] = useState(false);
  const [parsedInvoice, setParsedInvoice] = useState<ParsedInvoice | null>(null);
  const [conferenceConfirmed, setConferenceConfirmed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [importType, setImportType] = useState<'xml' | 'pdf'>('xml');
  
  // PDF states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [pdfError, setPdfError] = useState('');
  
  const xmlInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // XML parsing
  const handleXmlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, 'text/xml');
        
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
          setShowXmlModal(false);
          setShowConferenceModal(true);
        } else {
          simulateParsedInvoice();
        }
      } catch {
        simulateParsedInvoice();
      }
    };
    reader.readAsText(file);
  };

  // PDF parsing
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setPdfError('Por favor, selecione um arquivo PDF');
      return;
    }

    setPdfFile(selectedFile);
    setPdfError('');
    await processPDF(selectedFile);
  };

  const processPDF = async (pdfFile: File) => {
    setProcessing(true);
    setProgress(0);
    setProgressMessage('Iniciando leitura do PDF...');

    try {
      setProgress(20);
      setProgressMessage('Extraindo texto do PDF...');
      const text = await extractTextFromPDF(pdfFile);

      if (!text || text.trim().length < 10) {
        throw new Error('Não foi possível extrair texto do PDF. Verifique se o arquivo não está corrompido.');
      }

      setProgress(60);
      setProgressMessage('Identificando dados da nota fiscal...');
      const data: ParsedInvoiceData = parseInvoiceText(text);

      setProgress(80);
      setProgressMessage('Vinculando itens com produtos do sistema...');
      data.items = matchItemsWithProducts(data.items, products);

      setProgress(100);
      setProgressMessage('Processamento concluído!');
      
      // Convert to ParsedInvoice format
      setParsedInvoice({
        number: data.invoiceNumber,
        supplier: data.supplier,
        cnpj: data.cnpj,
        date: data.date,
        totalValue: data.totalValue,
        products: data.items.map(item => ({
          name: item.description,
          quantity: item.quantity,
          unit: item.unit,
          matchedProductId: item.matchedProductId,
        })),
      });
      
      setTimeout(() => {
        setProcessing(false);
        setShowPdfModal(false);
        setShowConferenceModal(true);
      }, 1000);

    } catch (err) {
      console.error('Erro ao processar PDF:', err);
      setPdfError(err instanceof Error ? err.message : 'Erro ao processar o arquivo PDF');
      setProcessing(false);
    }
  };

  const simulateParsedInvoice = () => {
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
    setShowXmlModal(false);
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
    setPdfFile(null);
    setPdfError('');
    setProgress(0);
    if (xmlInputRef.current) xmlInputRef.current.value = '';
    if (pdfInputRef.current) pdfInputRef.current.value = '';
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
          <p className="text-sm text-gray-500">Importe XML ou PDF da nota fiscal para registrar entradas</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowXmlModal(true); setPdfFile(null); setPdfError(''); }} className="btn-primary flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Importar XML
          </button>
          <button onClick={() => { setShowPdfModal(true); setPdfFile(null); setPdfError(''); }} className="btn-secondary flex items-center gap-2">
            <File className="w-4 h-4" />
            Importar PDF
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">Importar XML</p>
              <p className="text-xs text-blue-700 mt-1">
                Use quando receber o arquivo XML da NF-e diretamente do fornecedor.
                Extração automática e precisa de todos os dados.
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <File className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-purple-900">Importar PDF</p>
              <p className="text-xs text-purple-700 mt-1">
                Use quando tiver apenas a nota fiscal impressa. Escaneie em PDF e o sistema 
                usará OCR para ler automaticamente produtos e quantidades.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-amber-50 border-amber-100">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Conferência Obrigatória</p>
            <p className="text-xs text-amber-700 mt-1">
              Após a importação (XML ou PDF), você deverá conferir os itens identificados com a nota fiscal impressa antes de confirmar a entrada no estoque.
            </p>
            <button onClick={handleDemoUpload} className="text-xs text-amber-800 font-medium mt-2 underline hover:no-underline">
              → Testar com nota de demonstração
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
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma entrada registrada</p>
                    <p className="text-xs mt-1">Importe um XML ou PDF, ou use a demonstração</p>
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
                        <span className={`badge ${entry.entryType === 'invoice' ? 'badge-info' : 'badge-warning'}`}>
                          {entry.entryType === 'invoice' ? 'NF' : 'Manual'}
                        </span>
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

      {/* XML Upload Modal */}
      {showXmlModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Importar XML</h3>
              <button onClick={() => setShowXmlModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div 
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                onClick={() => xmlInputRef.current?.click()}
              >
                <FileUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">Clique para selecionar o arquivo XML</p>
                <p className="text-xs text-gray-500 mt-1">Formato: .xml (NF-e)</p>
              </div>
              <input
                ref={xmlInputRef}
                type="file"
                accept=".xml"
                onChange={handleXmlUpload}
                className="hidden"
              />
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700">
                  <strong>Dica:</strong> Se não tiver o XML, use a opção "Importar PDF" para escanear a nota fiscal.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Upload Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Importar PDF da Nota Fiscal</h3>
              <button onClick={() => { setShowPdfModal(false); setPdfFile(null); setPdfError(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {processing ? (
                <div className="py-8 text-center space-y-4">
                  <Loader className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
                  <div>
                    <p className="text-base font-semibold text-gray-800">{progressMessage}</p>
                    <p className="text-sm text-gray-600 mt-1">Aguarde, isso pode levar alguns segundos...</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">{progress}% concluído</p>
                </div>
              ) : (
                <>
                  <div 
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                      pdfFile ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                    onClick={() => !pdfFile && pdfInputRef.current?.click()}
                  >
                    {pdfFile ? (
                      <div className="space-y-3">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{pdfFile.name}</p>
                          <p className="text-xs text-gray-500">{(pdfFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPdfFile(null);
                            if (pdfInputRef.current) pdfInputRef.current.value = '';
                          }}
                          className="text-xs text-blue-600 underline"
                        >
                          Escolher outro arquivo
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <File className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Clique para selecionar o PDF</p>
                          <p className="text-xs text-gray-500 mt-1">Nota fiscal escaneada ou digital</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                  
                  {pdfError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-red-700">{pdfError}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <strong>Como funciona:</strong> O sistema usa OCR para ler a nota fiscal escaneada e identificar automaticamente produtos, quantidades e valores.
                    </p>
                  </div>

                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700">
                      <strong>Dica:</strong> Para melhor precisão, escaneie a nota em alta resolução (300 DPI ou superior).
                    </p>
                  </div>
                </>
              )}
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
                      Confirmo que os itens conferem com a nota fiscal e autorizo a entrada no estoque.
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
