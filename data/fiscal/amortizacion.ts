/**
 * Datos fiscales: Amortización del inmovilizado
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento fiscal ni contable.
 * Datos verificados a la fecha indicada. Pueden haber cambiado.
 * Verifica siempre en la fuente oficial antes de tomar decisiones.
 *
 * Fuente: Ley 27/2014, de 27 de noviembre, del Impuesto sobre Sociedades,
 * artículo 12.1 (tabla de coeficientes de amortización lineal y métodos
 * de amortización degresiva admitidos: porcentaje constante y números dígitos).
 * Verificado: 2026-06-18
 * URL oficial: https://sede.agenciatributaria.gob.es/Sede/impuesto-sociedades.html
 */

export const FISCAL_AMORTIZACION_META = {
  fuente: 'Ley 27/2014, de 27 de noviembre, del Impuesto sobre Sociedades (art. 12.1)',
  verificado: '2026-06-18',
  vigencia: '2026',
  urlOficial: 'https://sede.agenciatributaria.gob.es/Sede/impuesto-sociedades.html',
  nota: 'Coeficientes de la tabla oficial de amortización del art. 12.1.a LIS (selección de los elementos más habituales). El coeficiente lineal máximo marca la amortización más rápida admitida; el período máximo, la más lenta. La amortización degresiva por porcentaje constante (art. 12.1.b) no es aplicable a edificios, mobiliario y enseres.',
};

// ─── Tabla de coeficientes de amortización lineal (art. 12.1.a LIS) ──────────────
// coefLinealMax: % anual máximo admitido fiscalmente.
// periodoMax: años máximos de vida útil admitidos fiscalmente.
// La vida útil elegible está entre 100/coefLinealMax y periodoMax.

export interface TipoActivoAmortizable {
  id: string;
  nombre: string;
  coefLinealMax: number; // %
  periodoMax: number;    // años
  degresivoExcluido?: boolean; // edificios, mobiliario y enseres no admiten % constante
}

export const TABLA_AMORTIZACION_2026: TipoActivoAmortizable[] = [
  { id: 'edificios-comerciales', nombre: 'Edificios y construcciones (uso comercial/administrativo)', coefLinealMax: 2, periodoMax: 100, degresivoExcluido: true },
  { id: 'edificios-industriales', nombre: 'Edificios y construcciones (uso industrial)', coefLinealMax: 3, periodoMax: 68, degresivoExcluido: true },
  { id: 'instalaciones', nombre: 'Instalaciones técnicas', coefLinealMax: 10, periodoMax: 20 },
  { id: 'maquinaria', nombre: 'Maquinaria', coefLinealMax: 12, periodoMax: 18 },
  { id: 'utiles-herramientas', nombre: 'Útiles y herramientas', coefLinealMax: 25, periodoMax: 8 },
  { id: 'mobiliario', nombre: 'Mobiliario y enseres', coefLinealMax: 10, periodoMax: 20, degresivoExcluido: true },
  { id: 'equipos-informaticos', nombre: 'Equipos para procesos de información', coefLinealMax: 25, periodoMax: 8 },
  { id: 'software', nombre: 'Sistemas y programas informáticos', coefLinealMax: 33, periodoMax: 6 },
  { id: 'vehiculos', nombre: 'Elementos de transporte (vehículos)', coefLinealMax: 16, periodoMax: 14 },
];

// ─── Multiplicadores de la amortización degresiva por porcentaje constante ──────
// (art. 12.1.b LIS) — se aplican al coeficiente lineal según el período de
// amortización elegido. El porcentaje constante resultante no puede ser < 11 %.

export const MULTIPLICADORES_DEGRESIVO_2026 = {
  menor5: 1.5,   // período de amortización < 5 años
  entre5y8: 2.0, // período de 5 a 8 años
  mayor8: 2.5,   // período > 8 años
  minimoPorcentaje: 11, // % constante mínimo aplicable
};

/**
 * Devuelve el multiplicador degresivo (porcentaje constante) según la vida útil
 * en años, conforme al art. 12.1.b LIS.
 */
export function multiplicadorDegresivo(vidaUtilAnios: number): number {
  if (vidaUtilAnios < 5) return MULTIPLICADORES_DEGRESIVO_2026.menor5;
  if (vidaUtilAnios <= 8) return MULTIPLICADORES_DEGRESIVO_2026.entre5y8;
  return MULTIPLICADORES_DEGRESIVO_2026.mayor8;
}
