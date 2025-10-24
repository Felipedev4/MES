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
 * Exporta dados para PDF com ajuste automático inteligente
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
  
  // Determinar orientação: landscape para qualquer relatório com mais de 6 colunas
  const isWideReport = columnCount > 6;
  const orientation = isWideReport ? 'landscape' : 'portrait';
  
  // Criar documento
  const doc = new jsPDF({
    orientation: orientation as 'landscape' | 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Obter dimensões da página
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Calcular margens baseado no número de colunas
  const marginLeft = columnCount > 20 ? 5 : columnCount > 15 ? 6 : columnCount > 10 ? 7 : 10;
  const marginRight = marginLeft;
  const availableWidth = pageWidth - marginLeft - marginRight;
  
  // Calcular largura média e tamanho de fonte ideal
  const avgColumnWidth = availableWidth / columnCount;
  
  // Determinar tamanho de fonte baseado na largura disponível por coluna
  let fontSize: number;
  let cellPadding: number;
  let minCellHeight: number;
  
  if (avgColumnWidth < 8) {
    // Muitas colunas (>35 em landscape)
    fontSize = 4.5;
    cellPadding = 0.5;
    minCellHeight = 3.5;
  } else if (avgColumnWidth < 10) {
    // ~25-35 colunas
    fontSize = 5;
    cellPadding = 0.7;
    minCellHeight = 4;
  } else if (avgColumnWidth < 12) {
    // ~20-25 colunas
    fontSize = 5.5;
    cellPadding = 0.8;
    minCellHeight = 4.5;
  } else if (avgColumnWidth < 15) {
    // ~15-20 colunas
    fontSize = 6;
    cellPadding = 1;
    minCellHeight = 5;
  } else if (avgColumnWidth < 20) {
    // ~10-15 colunas
    fontSize = 7;
    cellPadding = 1.2;
    minCellHeight = 5.5;
  } else {
    // Poucas colunas (<10)
    fontSize = 8;
    cellPadding = 1.5;
    minCellHeight = 6;
  }
  
  const titleSize = isWideReport ? 11 : 16;
  
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
    theme: 'grid',
    styles: {
      fontSize: fontSize,
      cellPadding: cellPadding,
      overflow: 'linebreak',
      cellWidth: 'auto',
      minCellHeight: minCellHeight,
      halign: 'left',
      valign: 'middle',
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      minCellHeight: minCellHeight + 1,
      fontSize: Math.min(fontSize + 0.5, 9),
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    margin: { left: marginLeft, right: marginRight },
    tableWidth: 'auto',
    columnStyles: {},
    horizontalPageBreak: true,
    horizontalPageBreakRepeat: 0,
  };
  
  // Calcular largura ideal para cada coluna
  const columnWidths: number[] = [];
  headers.forEach((header, index) => {
    // Calcular comprimento máximo de texto nesta coluna
    let maxLength = header.length;
    
    data.forEach(row => {
      const cellValue = String(row[index] || '');
      if (cellValue.length > maxLength) {
        maxLength = cellValue.length;
      }
    });
    
    // Estimar largura baseada no comprimento do texto e fonte
    // Fórmula aproximada: caracteres * fontSize * 0.6
    let estimatedWidth = maxLength * fontSize * 0.6;
    
    // Aplicar limites
    const minWidth = fontSize * 3; // Mínimo 3x o tamanho da fonte
    const maxWidth = availableWidth / 2; // Máximo metade da página
    
    estimatedWidth = Math.max(minWidth, Math.min(estimatedWidth, maxWidth));
    columnWidths.push(estimatedWidth);
  });
  
  // Calcular total de largura estimada
  const totalEstimatedWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  
  // Se exceder a largura disponível, ajustar proporcionalmente
  if (totalEstimatedWidth > availableWidth) {
    const scaleFactor = availableWidth / totalEstimatedWidth;
    columnWidths.forEach((width, index) => {
      tableConfig.columnStyles[index] = {
        cellWidth: width * scaleFactor,
      };
    });
  } else {
    // Se couber, usar as larguras calculadas
    columnWidths.forEach((width, index) => {
      tableConfig.columnStyles[index] = {
        cellWidth: width,
      };
    });
  }
  
  // Gerar tabela
  autoTable(doc, tableConfig);
  
  // Rodapé com número de páginas
  const pageCount = (doc as any).internal.getNumberOfPages();
  
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

