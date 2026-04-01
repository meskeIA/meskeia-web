/**
 * Datos del Salario Mínimo Interprofesional (SMI) 2025-2026
 * + Salarios medios por provincia (AEAT 2023)
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento laboral ni fiscal.
 *
 * Fuentes:
 * - SMI 2026: Real Decreto 126/2026, de 18 de febrero (BOE-A-2026-3815)
 * - SMI 2025: Real Decreto 87/2025, de 11 de febrero (BOE-A-2025-2576)
 * - Salarios: AEAT Mercado de Trabajo y Pensiones 2023 (48 provincias régimen común)
 *             INE EAES 2023 (País Vasco y Navarra — nivel autonómico)
 *
 * Verificado: 2026-04-01
 */

export const FISCAL_SMI_META = {
  fuente: 'Real Decreto 126/2026 (SMI 2026) + AEAT Mercado de Trabajo 2023 (salarios)',
  verificado: '2026-04-01',
  vigencia: '2026',
  urlOficial: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-3815',
  nota: 'Salarios provinciales: media AEAT 2023 (incluye parciales). País Vasco y Navarra: dato autonómico INE EAES 2023.',
};

// ─── SMI 2026 ────────────────────────────────────────────────────────────────

export const SMI_2026 = {
  diario:          40.70,
  mensual14:     1221,       // 14 pagas
  mensual12:     1424.50,    // 12 pagas (17.094 / 12)
  anual:        17094,
  hogarHora:        9.55,
  eventualesDia:   57.82,
  incrementoPct:    3.1,     // % respecto a 2025
  vigenciaDesde: '2026-01-01',
  boe: 'Real Decreto 126/2026, de 18 de febrero',
};

export const SMI_2025 = {
  diario:          39.47,
  mensual14:     1184,
  mensual12:     1381.33,    // 16.576 / 12
  anual:        16576,
  hogarHora:        9.26,
  eventualesDia:   56.08,
  boe: 'Real Decreto 87/2025, de 11 de febrero',
};

// ─── Salarios medios por provincia (AEAT 2023 + INE EAES 2023) ──────────────

export interface DatosProvincia {
  provincia: string;
  ccaa: string;
  salarioMedio: number;  // € anuales brutos
  fuente: 'aeat' | 'ine';
}

/**
 * Salario medio anual bruto por provincia.
 * Ordenado alfabéticamente por provincia.
 *
 * AEAT: Mercado de Trabajo y Pensiones en las Fuentes Tributarias 2023
 *       (incluye todos los asalariados con Model 190, parciales y tiempo completo)
 * INE: EAES 2023 — Para Álava, Gipuzkoa, Bizkaia se usa la media autonómica del País Vasco.
 *       Para Navarra se usa la media autonómica.
 */
export const SALARIOS_PROVINCIA_2023: DatosProvincia[] = [
  // Andalucía
  { provincia: 'Almería', ccaa: 'Andalucía', salarioMedio: 18037, fuente: 'aeat' },
  { provincia: 'Cádiz', ccaa: 'Andalucía', salarioMedio: 20014, fuente: 'aeat' },
  { provincia: 'Córdoba', ccaa: 'Andalucía', salarioMedio: 18668, fuente: 'aeat' },
  { provincia: 'Granada', ccaa: 'Andalucía', salarioMedio: 19687, fuente: 'aeat' },
  { provincia: 'Huelva', ccaa: 'Andalucía', salarioMedio: 17143, fuente: 'aeat' },
  { provincia: 'Jaén', ccaa: 'Andalucía', salarioMedio: 17014, fuente: 'aeat' },
  { provincia: 'Málaga', ccaa: 'Andalucía', salarioMedio: 20648, fuente: 'aeat' },
  { provincia: 'Sevilla', ccaa: 'Andalucía', salarioMedio: 21050, fuente: 'aeat' },
  // Aragón
  { provincia: 'Huesca', ccaa: 'Aragón', salarioMedio: 22033, fuente: 'aeat' },
  { provincia: 'Teruel', ccaa: 'Aragón', salarioMedio: 21815, fuente: 'aeat' },
  { provincia: 'Zaragoza', ccaa: 'Aragón', salarioMedio: 24533, fuente: 'aeat' },
  // Asturias
  { provincia: 'Asturias', ccaa: 'Asturias', salarioMedio: 24581, fuente: 'aeat' },
  // Baleares
  { provincia: 'Baleares', ccaa: 'Baleares', salarioMedio: 23126, fuente: 'aeat' },
  // Canarias
  { provincia: 'Las Palmas', ccaa: 'Canarias', salarioMedio: 20962, fuente: 'aeat' },
  { provincia: 'S.C. de Tenerife', ccaa: 'Canarias', salarioMedio: 20422, fuente: 'aeat' },
  // Cantabria
  { provincia: 'Cantabria', ccaa: 'Cantabria', salarioMedio: 22989, fuente: 'aeat' },
  // Castilla y León
  { provincia: 'Ávila', ccaa: 'Castilla y León', salarioMedio: 20487, fuente: 'aeat' },
  { provincia: 'Burgos', ccaa: 'Castilla y León', salarioMedio: 24046, fuente: 'aeat' },
  { provincia: 'León', ccaa: 'Castilla y León', salarioMedio: 22396, fuente: 'aeat' },
  { provincia: 'Palencia', ccaa: 'Castilla y León', salarioMedio: 22128, fuente: 'aeat' },
  { provincia: 'Salamanca', ccaa: 'Castilla y León', salarioMedio: 22204, fuente: 'aeat' },
  { provincia: 'Segovia', ccaa: 'Castilla y León', salarioMedio: 21502, fuente: 'aeat' },
  { provincia: 'Soria', ccaa: 'Castilla y León', salarioMedio: 22641, fuente: 'aeat' },
  { provincia: 'Valladolid', ccaa: 'Castilla y León', salarioMedio: 24657, fuente: 'aeat' },
  { provincia: 'Zamora', ccaa: 'Castilla y León', salarioMedio: 20227, fuente: 'aeat' },
  // Castilla-La Mancha
  { provincia: 'Albacete', ccaa: 'Castilla-La Mancha', salarioMedio: 20702, fuente: 'aeat' },
  { provincia: 'Ciudad Real', ccaa: 'Castilla-La Mancha', salarioMedio: 20613, fuente: 'aeat' },
  { provincia: 'Cuenca', ccaa: 'Castilla-La Mancha', salarioMedio: 19700, fuente: 'aeat' },
  { provincia: 'Guadalajara', ccaa: 'Castilla-La Mancha', salarioMedio: 24116, fuente: 'aeat' },
  { provincia: 'Toledo', ccaa: 'Castilla-La Mancha', salarioMedio: 21320, fuente: 'aeat' },
  // Cataluña
  { provincia: 'Barcelona', ccaa: 'Cataluña', salarioMedio: 28108, fuente: 'aeat' },
  { provincia: 'Girona', ccaa: 'Cataluña', salarioMedio: 22947, fuente: 'aeat' },
  { provincia: 'Lleida', ccaa: 'Cataluña', salarioMedio: 22471, fuente: 'aeat' },
  { provincia: 'Tarragona', ccaa: 'Cataluña', salarioMedio: 23653, fuente: 'aeat' },
  // Comunidad Valenciana
  { provincia: 'Alicante', ccaa: 'C. Valenciana', salarioMedio: 20186, fuente: 'aeat' },
  { provincia: 'Castellón', ccaa: 'C. Valenciana', salarioMedio: 22227, fuente: 'aeat' },
  { provincia: 'Valencia', ccaa: 'C. Valenciana', salarioMedio: 23359, fuente: 'aeat' },
  // Extremadura
  { provincia: 'Badajoz', ccaa: 'Extremadura', salarioMedio: 18069, fuente: 'aeat' },
  { provincia: 'Cáceres', ccaa: 'Extremadura', salarioMedio: 18827, fuente: 'aeat' },
  // Galicia
  { provincia: 'A Coruña', ccaa: 'Galicia', salarioMedio: 24840, fuente: 'aeat' },
  { provincia: 'Lugo', ccaa: 'Galicia', salarioMedio: 21939, fuente: 'aeat' },
  { provincia: 'Ourense', ccaa: 'Galicia', salarioMedio: 21473, fuente: 'aeat' },
  { provincia: 'Pontevedra', ccaa: 'Galicia', salarioMedio: 22259, fuente: 'aeat' },
  // Comunidad de Madrid
  { provincia: 'Madrid', ccaa: 'C. de Madrid', salarioMedio: 30769, fuente: 'aeat' },
  // Murcia
  { provincia: 'Murcia', ccaa: 'Murcia', salarioMedio: 20552, fuente: 'aeat' },
  // Navarra (dato autonómico INE EAES 2023)
  { provincia: 'Navarra', ccaa: 'Navarra', salarioMedio: 31200, fuente: 'ine' },
  // País Vasco (dato autonómico INE EAES 2023 — mismo valor para las 3 provincias)
  { provincia: 'Álava', ccaa: 'País Vasco', salarioMedio: 33505, fuente: 'ine' },
  { provincia: 'Gipuzkoa', ccaa: 'País Vasco', salarioMedio: 33505, fuente: 'ine' },
  { provincia: 'Bizkaia', ccaa: 'País Vasco', salarioMedio: 33505, fuente: 'ine' },
  // La Rioja
  { provincia: 'La Rioja', ccaa: 'La Rioja', salarioMedio: 22335, fuente: 'aeat' },
  // Ciudades autónomas
  { provincia: 'Ceuta', ccaa: 'Ceuta', salarioMedio: 24812, fuente: 'aeat' },
  { provincia: 'Melilla', ccaa: 'Melilla', salarioMedio: 23275, fuente: 'aeat' },
];

// Media nacional AEAT 2023
export const SALARIO_MEDIO_NACIONAL_2023 = 23981;
