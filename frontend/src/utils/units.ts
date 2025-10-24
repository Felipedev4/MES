/**
 * Utilitários para formatação de unidades conforme ABNT NBR 5891 e NBR ISO 80000-1
 * 
 * REGRAS ABNT:
 * - Símbolos de unidades não levam ponto (kg, não kg.)
 * - Símbolos de unidades não são pluralizados (10 kg, não 10 kgs)
 * - Espaço entre número e unidade (10 kg, não 10kg)
 * - Símbolos em minúscula, exceto derivados de nomes próprios (m, kg, L, Pa, N, W)
 * - Não usar abreviações ou símbolos inventados
 */

/**
 * Formatar tempo em segundos para formato legível ABNT
 * @param seconds Tempo em segundos
 * @param format 'short' para símbolos (s, min, h) ou 'long' para extenso
 * @returns String formatada
 */
export function formatTime(seconds: number, format: 'short' | 'long' = 'short'): string {
  if (seconds === 0) return format === 'short' ? '0 s' : '0 segundo';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (format === 'short') {
    // ABNT: símbolos com espaço
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours} h`);
    if (minutes > 0) parts.push(`${minutes} min`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs} s`);
    return parts.join(' ');
  } else {
    // Extenso (plural correto em português)
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs} segundo${secs > 1 ? 's' : ''}`);
    return parts.join(', ');
  }
}

/**
 * Formatar tempo de ciclo com precisão decimal
 * @param seconds Tempo em segundos (pode ter decimais)
 * @returns String formatada
 */
export function formatCycleTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)} s`;
  } else {
    const minutes = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${minutes} min ${secs} s`;
  }
}

/**
 * Formatar massa conforme ABNT
 * @param value Valor numérico
 * @param unit Unidade (kg, g, mg, t)
 * @returns String formatada
 */
export function formatMass(value: number, unit: 'kg' | 'g' | 'mg' | 't' = 'kg'): string {
  // ABNT: espaço entre número e unidade, sem ponto, sem plural
  return `${value.toLocaleString('pt-BR')} ${unit}`;
}

/**
 * Formatar comprimento conforme ABNT
 * @param value Valor numérico
 * @param unit Unidade (m, cm, mm, km)
 * @returns String formatada
 */
export function formatLength(value: number, unit: 'm' | 'cm' | 'mm' | 'km' = 'm'): string {
  return `${value.toLocaleString('pt-BR')} ${unit}`;
}

/**
 * Formatar volume conforme ABNT
 * @param value Valor numérico
 * @param unit Unidade (L, mL, m³)
 * @returns String formatada
 */
export function formatVolume(value: number, unit: 'L' | 'mL' | 'm³' = 'L'): string {
  // ABNT: L maiúsculo (litro), espaço obrigatório
  return `${value.toLocaleString('pt-BR')} ${unit}`;
}

/**
 * Formatar quantidade com unidade
 * @param value Valor numérico
 * @param unit Unidade (un, pç, kg, etc.)
 * @returns String formatada
 */
export function formatQuantity(value: number, unit: string): string {
  // ABNT: espaço entre número e unidade
  // Unidades não são pluralizadas quando são símbolos
  return `${value.toLocaleString('pt-BR')} ${unit}`;
}

/**
 * Formatar temperatura conforme ABNT
 * @param value Valor numérico
 * @param unit Unidade (°C, K)
 * @returns String formatada
 */
export function formatTemperature(value: number, unit: '°C' | 'K' = '°C'): string {
  // ABNT: espaço entre número e °C
  return `${value.toLocaleString('pt-BR')} ${unit}`;
}

/**
 * Formatar pressão conforme ABNT
 * @param value Valor numérico
 * @param unit Unidade (Pa, kPa, MPa, bar)
 * @returns String formatada
 */
export function formatPressure(value: number, unit: 'Pa' | 'kPa' | 'MPa' | 'bar' = 'bar'): string {
  // ABNT: Pa (pascal) é derivado de nome próprio, maiúsculo
  return `${value.toLocaleString('pt-BR')} ${unit}`;
}

/**
 * Formatar velocidade conforme ABNT
 * @param value Valor numérico
 * @param unit Unidade (m/s, km/h)
 * @returns String formatada
 */
export function formatSpeed(value: number, unit: 'm/s' | 'km/h' = 'km/h'): string {
  // ABNT: barra para divisão, espaço obrigatório
  return `${value.toLocaleString('pt-BR')} ${unit}`;
}

/**
 * Obter label de unidade de medida
 */
export const UNIT_LABELS: Record<string, string> = {
  // Contagem
  'un': 'unidade',
  'pç': 'peça',
  'cx': 'caixa',
  'par': 'par',
  'dz': 'dúzia',
  'jg': 'jogo',
  
  // Massa
  't': 'tonelada',
  'kg': 'quilograma',
  'g': 'grama',
  'mg': 'miligrama',
  
  // Comprimento
  'km': 'quilômetro',
  'm': 'metro',
  'cm': 'centímetro',
  'mm': 'milímetro',
  
  // Área
  'm²': 'metro quadrado',
  'cm²': 'centímetro quadrado',
  
  // Volume
  'm³': 'metro cúbico',
  'L': 'litro',
  'mL': 'mililitro',
  
  // Tempo
  'h': 'hora',
  'min': 'minuto',
  's': 'segundo',
  'ms': 'milissegundo',
};

/**
 * Obter label plural de unidade de medida (para extenso)
 */
export const UNIT_LABELS_PLURAL: Record<string, string> = {
  'un': 'unidades',
  'pç': 'peças',
  'cx': 'caixas',
  'par': 'pares',
  'dz': 'dúzias',
  'jg': 'jogos',
  't': 'toneladas',
  'kg': 'quilogramas',
  'g': 'gramas',
  'mg': 'miligramas',
  'km': 'quilômetros',
  'm': 'metros',
  'cm': 'centímetros',
  'mm': 'milímetros',
  'm²': 'metros quadrados',
  'cm²': 'centímetros quadrados',
  'm³': 'metros cúbicos',
  'L': 'litros',
  'mL': 'mililitros',
  'h': 'horas',
  'min': 'minutos',
  's': 'segundos',
  'ms': 'milissegundos',
};

/**
 * Formatar quantidade por extenso
 * @param value Valor numérico
 * @param unit Unidade
 * @returns String formatada por extenso
 */
export function formatQuantityExtensive(value: number, unit: string): string {
  const label = value === 1 ? UNIT_LABELS[unit] : UNIT_LABELS_PLURAL[unit];
  return `${value.toLocaleString('pt-BR')} ${label || unit}`;
}

