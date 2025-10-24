/**
 * Utilitários para exportação de relatórios em Excel e PDF
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Exporta dados para Excel
 */
export const exportToExcel = (
  data: any[],
  fileName: string,
  sheetName: string = 'Relatório'
) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Auto-ajustar largura das colunas
  const maxWidth = 50;
  const wscols = Object.keys(data[0] || {}).map(key => ({
    wch: Math.min(
      Math.max(
        key.length,
        ...data.map(row => String(row[key] || '').length)
      ),
      maxWidth
    )
  }));
  worksheet['!cols'] = wscols;
  
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Exporta dados para PDF
 */
export const exportToPDF = (
  title: string,
  headers: string[],
  data: any[][],
  fileName: string,
  filters?: { label: string; value: string }[]
) => {
  // Detectar número de colunas para configurar orientação e tamanho
  const columnCount = headers.length;
  const isWideReport = columnCount > 10;
  
  // Configurar orientação baseado no número de colunas
  const orientation = isWideReport ? 'landscape' : 'portrait';
  const doc = new jsPDF({
    orientation: orientation as 'landscape' | 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Ajustar tamanhos baseado no número de colunas
  const titleSize = isWideReport ? 14 : 16;
  const baseFontSize = columnCount > 20 ? 6 : columnCount > 15 ? 7 : 8;
  const cellPadding = columnCount > 20 ? 1 : columnCount > 15 ? 1.5 : 2;
  
  // Título
  doc.setFontSize(titleSize);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 15);
  
  // Data de geração
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
    14,
    22
  );
  
  let yPosition = 28;
  
  // Filtros aplicados
  if (filters && filters.length > 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Filtros Aplicados:', 14, yPosition);
    yPosition += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    filters.forEach(filter => {
      doc.text(`${filter.label}: ${filter.value}`, 14, yPosition);
      yPosition += 4;
    });
    yPosition += 3;
  }
  
  // Configurar estilos da tabela
  const tableConfig: any = {
    head: [headers],
    body: data,
    startY: yPosition,
    styles: {
      fontSize: baseFontSize,
      cellPadding: cellPadding,
      overflow: 'linebreak',
      cellWidth: 'wrap',
      minCellHeight: 5,
      halign: 'left',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      minCellHeight: 8,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 10, right: 10 },
    tableWidth: 'auto',
    columnStyles: {},
  };
  
  // Para relatórios muito largos, ajustar largura das colunas
  if (isWideReport) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margins = 20; // 10mm de cada lado
    const availableWidth = pageWidth - margins;
    const avgColumnWidth = availableWidth / columnCount;
    
    // Aplicar largura mínima para cada coluna
    headers.forEach((_, index) => {
      tableConfig.columnStyles[index] = {
        cellWidth: Math.max(avgColumnWidth, 15), // Mínimo de 15mm
      };
    });
  }
  
  // Gerar tabela
  autoTable(doc, tableConfig);
  
  // Rodapé com número de páginas
  const pageCount = (doc as any).internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    
    // Número da página centralizado
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
    
    // Nome do sistema no canto direito
    doc.text(
      'Sistema MES',
      pageWidth - 14,
      pageHeight - 8,
      { align: 'right' }
    );
  }
  
  doc.save(`${fileName}.pdf`);
};

/**
 * Formata número para exibição
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

/**
 * Formata porcentagem para exibição
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

/**
 * Formata data para exibição
 */
export const formatDate = (date: Date | string): string => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
};

/**
 * Formata data e hora para exibição
 */
export const formatDateTime = (date: Date | string): string => {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

