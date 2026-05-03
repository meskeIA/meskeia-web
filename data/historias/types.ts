/**
 * Tipos compartidos para el template de visualizadores de historia.
 * Todas las apps bajo /visualizador-historia/[slug]/ usan estas interfaces.
 */

export interface HitoHistoria {
  id: string;
  nombre: string;
  anioInicio: number;
  anioFin: number;        // 9999 = presente
  color: string;
  categoria: string;      // clave de categorias{}
  descripcion: string;
  obraIconica: string;    // hito, obra, evento emblemático
  paises: string[];
}

export interface EraHistoria {
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
  hitosDestacados: string[];  // nombres (no IDs) de hitos principales
  eventos: string[];           // eventos contextuales en texto libre
}

export interface FilaTabla {
  hito: string;
  periodo: string;
  categoria: string;
  personaje: string;
  aportacion: string;
}

export interface Escenario {
  icono: string;
  titulo: string;
  perfil: string;
  texto: string;
}

export interface FaqItem {
  pregunta: string;
  respuesta: string;
  tip?: string;
}

export interface PasoItem {
  titulo: string;
  cuerpo: string;
}

export interface TipItem {
  icono: string;
  texto: string;
}

export interface ErrorItem {
  titulo: string;
  cuerpo: string;
}

export interface HistoriaData {
  slug: string;
  titulo: string;
  subtitulo: string;
  descripcionSEO: string;
  keywords: string[];
  anioInicio: number;
  anioFin: number;

  hitos: HitoHistoria[];
  eras: EraHistoria[];            // exactamente 6

  categorias: Record<string, string>;   // id -> etiqueta
  colores: Record<string, string>;      // id -> color hex

  disclaimer: 'exempt' | 'medium' | 'high' | 'critical';

  educativo: {
    intro: string;
    tablaComparativa: FilaTabla[];
    escenarios: Escenario[];
    faq: FaqItem[];
    pasos: PasoItem[];
    tips: TipItem[];
    errores: ErrorItem[];
  };
}
