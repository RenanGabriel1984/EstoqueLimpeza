import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Configurar worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ParsedInvoiceData {
  invoiceNumber: string;
  date: string;
  supplier: string;
  cnpj: string;
  totalValue: string;
  items: InvoiceItem[];
  rawText: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  matchedProductId?: string;
}

/**
 * Extrai texto de um arquivo PDF
 * Se for PDF nativo (texto), extrai diretamente
 * Se for PDF escaneado (imagem), usa OCR
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  let hasText = false;
  
  // Tentar extrair texto nativo primeiro
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    
    if (pageText.trim().length > 0) {
      hasText = true;
      fullText += pageText + '\n';
    }
  }
  
  // Se não encontrou texto, usar OCR
  if (!hasText) {
    console.log('PDF escaneado detectado, aplicando OCR...');
    fullText = await performOCR(file);
  }
  
  return fullText;
}

/**
 * Realiza OCR em um arquivo PDF escaneado
 */
async function performOCR(file: File): Promise<string> {
  // Converter PDF para imagem (primeira página)
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  
  // Renderizar página em canvas
  const viewport = page.getViewport({ scale: 2.0 }); // Escala 2x para melhor qualidade
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  await page.render({
    canvasContext: context!,
    viewport: viewport
  } as any).promise;
  
  // Converter canvas para blob
  const imageBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
  
  // Realizar OCR com Tesseract
  const result = await Tesseract.recognize(imageBlob, 'por', {
    logger: (m) => console.log(m),
  });
  
  return result.data.text;
}

/**
 * Faz parsing do texto extraído para identificar dados da NF-e
 */
export function parseInvoiceText(text: string): ParsedInvoiceData {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Extrair número da NF
  const invoiceNumber = extractInvoiceNumber(text);
  
  // Extrair data
  const date = extractDate(text);
  
  // Extrair fornecedor
  const supplier = extractSupplier(text);
  
  // Extrair CNPJ
  const cnpj = extractCNPJ(text);
  
  // Extrair valor total
  const totalValue = extractTotalValue(text);
  
  // Extrair itens
  const items = extractItems(text);
  
  return {
    invoiceNumber,
    date,
    supplier,
    cnpj,
    totalValue,
    items,
    rawText: text,
  };
}

/**
 * Extrai número da nota fiscal
 */
function extractInvoiceNumber(text: string): string {
  // Padrões comuns: "NF-e nº 123456", "Nota Fiscal 123456", "NÚMERO 123456"
  const patterns = [
    /NF[-\s]?e?\s*n[ºo°]?\s*(\d+)/i,
    /nota\s*fiscal\s*(\d+)/i,
    /n[úu]mero\s*(\d+)/i,
    /n[ºo°]\s*(\d+)/i,
    /(\d{6,9})/, // Número com 6-9 dígitos
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return 'N/A';
}

/**
 * Extrai data da nota fiscal
 */
function extractDate(text: string): string {
  // Padrões: "Data: 01/01/2024", "Emissão: 01/01/2024", "01/01/2024"
  const patterns = [
    /data[:\s]+(\d{2}\/\d{2}\/\d{4})/i,
    /emiss[ãa]o[:\s]+(\d{2}\/\d{2}\/\d{4})/i,
    /(\d{2}\/\d{2}\/\d{4})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Converter para formato ISO
      const [day, month, year] = match[1].split('/');
      return `${year}-${month}-${day}`;
    }
  }
  
  return new Date().toISOString().split('T')[0];
}

/**
 * Extrai nome do fornecedor
 */
function extractSupplier(text: string): string {
  // Padrões: "Fornecedor: EMPRESA X", "Razão Social: EMPRESA X"
  const patterns = [
    /fornecedor[:\s]+([^\n]+)/i,
    /raz[ãa]o\s*social[:\s]+([^\n]+)/i,
    /nome[:\s]+([^\n]+)/i,
    /emitente[:\s]+([^\n]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim().substring(0, 100);
    }
  }
  
  return 'Fornecedor não identificado';
}

/**
 * Extrai CNPJ
 */
function extractCNPJ(text: string): string {
  // Padrão: "00.000.000/0000-00" ou "00000000000000"
  const patterns = [
    /(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/,
    /CNPJ[:\s]+(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/i,
    /(\d{14})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return 'CNPJ não identificado';
}

/**
 * Extrai valor total
 */
function extractTotalValue(text: string): string {
  // Padrões: "Valor Total: R$ 1.234,56", "Total: R$ 1234,56"
  const patterns = [
    /valor\s*total[:\s]+R\$\s*([\d.,]+)/i,
    /total[:\s]+R\$\s*([\d.,]+)/i,
    /R\$\s*([\d.,]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return '0,00';
}

/**
 * Extrai itens da nota fiscal
 */
function extractItems(text: string): InvoiceItem[] {
  const items: InvoiceItem[] = [];
  const lines = text.split('\n');
  
  // Padrões comuns de itens em NF-e
  // Ex: "1 DETERGENTE 500ML 10 UN 5,00 50,00"
  const itemPattern = /(\d+)\s+([A-ZÀ-Ú\s]+?)\s+(\d+(?:[.,]\d+)?)\s+(UN|UNID|UNIDADE|CX|CX\.|CAIXA|PC|PCT|PCT\.|PACOTE|LT|L|KG|G|ML|LTS?|GAL|GALÃO)\s+R\$\s*([\d.,]+)\s+R\$\s*([\d.,]+)/i;
  
  for (const line of lines) {
    const match = line.match(itemPattern);
    if (match) {
      const quantity = parseFloat(match[3].replace(',', '.'));
      const unitPrice = parseFloat(match[5].replace('.', '').replace(',', '.'));
      const totalPrice = parseFloat(match[6].replace('.', '').replace(',', '.'));
      
      items.push({
        description: match[2].trim(),
        quantity,
        unit: match[4].toUpperCase(),
        unitPrice,
        totalPrice,
      });
    }
  }
  
  // Se não encontrou com padrão estruturado, tentar extrair de forma mais flexível
  if (items.length === 0) {
    // Procurar linhas com números e descrições
    const simplePattern = /(\d+(?:[.,]\d+)?)\s+([A-ZÀ-Ú][A-ZÀ-Ú\s]{3,})/i;
    
    for (const line of lines) {
      const match = line.match(simplePattern);
      if (match && match[1] && match[2]) {
        const quantity = parseFloat(match[1].replace(',', '.'));
        if (quantity > 0 && quantity < 10000) { // Validação básica
          items.push({
            description: match[2].trim(),
            quantity,
            unit: 'UN',
            unitPrice: 0,
            totalPrice: 0,
          });
        }
      }
    }
  }
  
  return items;
}

/**
 * Tenta vincular itens da NF com produtos do sistema
 */
export function matchItemsWithProducts(
  items: InvoiceItem[],
  products: Array<{ id: string; name: string }>
): InvoiceItem[] {
  return items.map(item => {
    // Tentar encontrar produto similar
    const matchedProduct = products.find(p => {
      const productName = p.name.toLowerCase();
      const itemDesc = item.description.toLowerCase();
      
      // Verificar se há similaridade
      return productName.includes(itemDesc.substring(0, 10)) ||
             itemDesc.includes(productName.substring(0, 10)) ||
             calculateSimilarity(productName, itemDesc) > 0.6;
    });
    
    return {
      ...item,
      matchedProductId: matchedProduct?.id,
    };
  });
}

/**
 * Calcula similaridade entre duas strings (Jaccard similarity)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}
