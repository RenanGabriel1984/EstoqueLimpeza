import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Upload, CheckCircle, AlertCircle, X, Loader, Eye, Edit2 } from 'lucide-react';
import { extractTextFromPDF, parseInvoiceText, matchItemsWithProducts, ParsedInvoiceData } from '../utils/pdfParser';

export const PDFImportPage = () => {
  const { products, suppliers, addStockEntry, addProduct } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [parsedData, setParsedData] = useState<ParsedInvoiceData | null>(null);
  const [showConference, setShowConference] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Por favor, selecione um arquivo PDF');
      return;
    }

    setFile(selectedFile);
    setError('');
    setParsedData(null);
    await processPDF(selectedFile);
  };

  const processPDF = async (pdfFile: File) => {
    setProcessing(true);
    setProgress(0);
    setProgressMessage('Iniciando leitura do PDF...');

    try {
      // Etapa 1: Extrair texto
      setProgress(20);
      setProgressMessage('Extraindo texto do PDF...');
      const text = await extractTextFromPDF(pdfFile);

      if (!text || text.trim().length < 10) {
        throw new Error('Não foi possível extrair texto do PDF. Verifique se o arquivo não está corrompido.');
      }

      // Etapa 2: Parse dos dados
      setProgress(60);
      setProgressMessage('Identificando dados da nota fiscal...');
      const data = parseInvoiceText(text);

      // Etapa 3: Vincular com produtos
      setProgress(80);
      setProgressMessage('Vinculando itens com produtos do sistema...');
      data.items = matchItemsWithProducts(data.items, products);

      setProgress(100);
      setProgressMessage('Processamento concluído!');
      
      setParsedData(data);
      
      setTimeout(() => {
        setProcessing(false);
        setShowConference(true);
      }, 1000);

    } catch (err) {
      console.error('Erro ao processar PDF:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar o arquivo PDF');
      setProcessing(false);
    }
  };

  const handleConfirmEntry = () => {
    if (!parsedData) return;

    let entriesCreated = 0;

    parsedData.items.forEach((item, index) => {
      if (item.matchedProductId && item.quantity > 0) {
        addStockEntry({
          id: Date.now().toString() + index,
          productId: item.matchedProductId,
          quantity: item.quantity,
          date: parsedData.date,
          supplierId: suppliers[0]?.id || '1',
          invoiceNumber: parsedData.invoiceNumber,
          entryType: 'invoice',
          notes: `Entrada via PDF - ${item.description}`,
        });
        entriesCreated++;
      }
    });

    alert(`✓ ${entriesCreated} entrada(s) registrada(s) com sucesso!`);
    setShowConference(false);
    setParsedData(null);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEditItem = (index: number, field: string, value: any) => {
    if (!parsedData) return;

    const updatedItems = [...parsedData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    setParsedData({ ...parsedData, items: updatedItems });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Importar Nota Fiscal (PDF)</h2>
        <p className="text-gray-600">Leia notas fiscais escaneadas automaticamente com OCR</p>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">Como Funciona</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Faça upload do arquivo PDF da nota fiscal (escaneada ou digital)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>O sistema extrai automaticamente: número da NF, data, fornecedor, produtos e quantidades</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Os itens são vinculados automaticamente aos produtos cadastrados no sistema</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Você confere os dados antes de confirmar a entrada no estoque</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
          }`}
          onClick={() => !processing && fileInputRef.current?.click()}
        >
          {processing ? (
            <div className="space-y-4">
              <Loader className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
              <div>
                <p className="text-lg font-semibold text-gray-800">{progressMessage}</p>
                <p className="text-sm text-gray-600 mt-1">Aguarde, isso pode levar alguns segundos...</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">{progress}% concluído</p>
            </div>
          ) : file ? (
            <div className="space-y-3">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
              <div>
                <p className="text-lg font-semibold text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-600">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setParsedData(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="btn-secondary text-sm"
              >
                Escolher outro arquivo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-semibold text-gray-800">Clique para selecionar o PDF</p>
                <p className="text-sm text-gray-600 mt-1">ou arraste e solte o arquivo aqui</p>
              </div>
              <p className="text-xs text-gray-500">Formatos aceitos: PDF (máximo 10MB)</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800">Erro ao processar PDF</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Conference Modal */}
      {showConference && parsedData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Conferência da Nota Fiscal</h3>
                <p className="text-sm text-gray-600">Verifique os dados antes de confirmar a entrada</p>
              </div>
              <button onClick={() => setShowConference(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Invoice Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Número da NF</p>
                  <p className="text-sm font-semibold text-gray-800">{parsedData.invoiceNumber}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Data</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {new Date(parsedData.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Fornecedor</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{parsedData.supplier}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">CNPJ</p>
                  <p className="text-sm font-semibold text-gray-800">{parsedData.cnpj}</p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Itens Identificados ({parsedData.items.length})</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Descrição</th>
                        <th className="text-center px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Qtd</th>
                        <th className="text-center px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Un</th>
                        <th className="text-center px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {parsedData.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleEditItem(index, 'description', e.target.value)}
                              className="text-sm text-gray-800 bg-transparent border-none focus:ring-0 p-0 w-full"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleEditItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              className="text-sm text-gray-800 bg-transparent border-none focus:ring-0 p-0 w-16 text-center"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm text-gray-600">{item.unit}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {item.matchedProductId ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3" />
                                Vinculado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                <AlertCircle className="w-3 h-3" />
                                Sem vínculo
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Resumo</p>
                    <ul className="space-y-1">
                      <li>• {parsedData.items.filter(i => i.matchedProductId).length} de {parsedData.items.length} itens vinculados</li>
                      <li>• {parsedData.items.filter(i => !i.matchedProductId).length} itens sem vínculo (não serão registrados)</li>
                      <li>• Você pode editar as descrições e quantidades antes de confirmar</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowConference(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmEntry}
                className="btn-primary flex-1"
              >
                Confirmar Entrada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
