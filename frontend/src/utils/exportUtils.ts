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
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 15);
  
  // Data de geração
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
    14,
    22
  );
  
  let yPosition = 28;
  
  // Filtros aplicados
  if (filters && filters.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Filtros Aplicados:', 14, yPosition);
    yPosition += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    filters.forEach(filter => {
      doc.text(`${filter.label}: ${filter.value}`, 14, yPosition);
      yPosition += 4;
    });
    yPosition += 3;
  }
  
  // Tabela
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: yPosition,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: yPosition },
  });
  
  // Rodapé
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
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

