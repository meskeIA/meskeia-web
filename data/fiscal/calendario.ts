/**
 * Datos fiscales: Calendario fiscal de España (plazos recurrentes de modelos)
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento fiscal.
 * Plazos recurrentes (patrón anual estable). Las fechas exactas de cada ejercicio
 * se trasladan al siguiente día hábil si caen en fin de semana o festivo; la
 * domiciliación bancaria cierra unos días antes. Verifica el ejercicio en curso
 * en el calendario del contribuyente de la AEAT.
 *
 * Fuente: Calendario del contribuyente (AEAT) + plazos de autoliquidación de la
 * normativa de cada impuesto (IVA, IRPF, IS, retenciones).
 * Verificado: 2026-06-20
 */

export const FISCAL_CALENDARIO_META = {
  fuente: 'Calendario del contribuyente (AEAT) + normativa de cada impuesto',
  verificado: '2026-06-20',
  vigencia: '2026',
  urlOficial:
    'https://sede.agenciatributaria.gob.es/Sede/ayuda/calendarios/calendario-contribuyente.html',
  nota: 'Plazos recurrentes. Si el último día es inhábil (fin de semana o festivo) se traslada al siguiente día hábil, y la domiciliación bancaria se cierra unos días antes. Confirma las fechas exactas del ejercicio en el calendario del contribuyente de la AEAT.',
};

export type CategoriaCalendario = 'trimestral' | 'anual' | 'renta-sociedades';

export interface ModeloFiscal {
  modelo: string;
  nombre: string;
  categoria: CategoriaCalendario;
  periodicidad: string;
  /** Plazo recurrente, en texto (patrón anual estable). */
  plazo: string;
  /** Perfil al que aplica. */
  quien: string;
}

export const CALENDARIO_FISCAL: ModeloFiscal[] = [
  // ─── Trimestrales ───────────────────────────────────────────────────────────
  {
    modelo: '303',
    nombre: 'IVA — autoliquidación',
    categoria: 'trimestral',
    periodicidad: 'Trimestral',
    plazo: 'Hasta el 20 de abril, julio y octubre; el 4.º trimestre, hasta el 30 de enero.',
    quien: 'Autónomos y empresas con actividad sujeta a IVA',
  },
  {
    modelo: '130',
    nombre: 'Pago fraccionado del IRPF (estimación directa)',
    categoria: 'trimestral',
    periodicidad: 'Trimestral',
    plazo: 'Hasta el 20 de abril, julio y octubre; el 4.º trimestre, hasta el 30 de enero.',
    quien: 'Autónomos en estimación directa',
  },
  {
    modelo: '131',
    nombre: 'Pago fraccionado del IRPF (módulos)',
    categoria: 'trimestral',
    periodicidad: 'Trimestral',
    plazo: 'Hasta el 20 de abril, julio y octubre; el 4.º trimestre, hasta el 30 de enero.',
    quien: 'Autónomos en estimación objetiva (módulos)',
  },
  {
    modelo: '111',
    nombre: 'Retenciones del trabajo y de actividades',
    categoria: 'trimestral',
    periodicidad: 'Trimestral',
    plazo: 'Hasta el 20 de abril, julio, octubre y enero.',
    quien: 'Quien practica retenciones a trabajadores o profesionales',
  },
  {
    modelo: '115',
    nombre: 'Retenciones por alquiler de inmuebles',
    categoria: 'trimestral',
    periodicidad: 'Trimestral',
    plazo: 'Hasta el 20 de abril, julio, octubre y enero.',
    quien: 'Quien paga alquileres de locales con retención',
  },
  {
    modelo: '123',
    nombre: 'Retenciones del capital mobiliario',
    categoria: 'trimestral',
    periodicidad: 'Trimestral',
    plazo: 'Hasta el 20 de abril, julio, octubre y enero.',
    quien: 'Quien abona dividendos o intereses con retención',
  },
  {
    modelo: '349',
    nombre: 'Operaciones intracomunitarias',
    categoria: 'trimestral',
    periodicidad: 'Mensual o trimestral',
    plazo: 'Hasta el día 20 del mes o trimestre siguiente, según el volumen de operaciones.',
    quien: 'Empresas con operaciones intracomunitarias',
  },
  {
    modelo: '202',
    nombre: 'Pago fraccionado del Impuesto de Sociedades',
    categoria: 'trimestral',
    periodicidad: 'Tres pagos al año',
    plazo: 'Del 1 al 20 de abril, octubre y diciembre.',
    quien: 'Sociedades con cuota positiva el ejercicio anterior',
  },
  // ─── Resúmenes y declaraciones anuales ───────────────────────────────────────
  {
    modelo: '390',
    nombre: 'Resumen anual del IVA',
    categoria: 'anual',
    periodicidad: 'Anual',
    plazo: 'Hasta el 30 de enero del año siguiente.',
    quien: 'Autónomos y empresas con IVA',
  },
  {
    modelo: '190',
    nombre: 'Resumen anual de retenciones (trabajo y actividades)',
    categoria: 'anual',
    periodicidad: 'Anual',
    plazo: 'Hasta el 31 de enero del año siguiente.',
    quien: 'Quien presenta el modelo 111',
  },
  {
    modelo: '180',
    nombre: 'Resumen anual de retenciones (alquileres)',
    categoria: 'anual',
    periodicidad: 'Anual',
    plazo: 'Hasta el 31 de enero del año siguiente.',
    quien: 'Quien presenta el modelo 115',
  },
  {
    modelo: '347',
    nombre: 'Operaciones con terceros (más de 3.005,06 €)',
    categoria: 'anual',
    periodicidad: 'Anual',
    plazo: 'Durante el mes de febrero.',
    quien: 'Autónomos y empresas con operaciones superiores a 3.005,06 € con un mismo tercero',
  },
  // ─── Renta y Sociedades ──────────────────────────────────────────────────────
  {
    modelo: '100',
    nombre: 'Declaración de la Renta (IRPF)',
    categoria: 'renta-sociedades',
    periodicidad: 'Anual (campaña)',
    plazo: 'Campaña de abril a finales de junio; las fechas exactas se publican cada ejercicio.',
    quien: 'Personas físicas contribuyentes del IRPF',
  },
  {
    modelo: '714',
    nombre: 'Impuesto sobre el Patrimonio',
    categoria: 'renta-sociedades',
    periodicidad: 'Anual (campaña)',
    plazo: 'Misma campaña que la Renta: de abril a finales de junio. Se presenta junto a la declaración del IRPF.',
    quien: 'Personas físicas obligadas a declarar Patrimonio (cuota a ingresar o bienes y derechos superiores a 2 M€)',
  },
  {
    modelo: '200',
    nombre: 'Impuesto sobre Sociedades (declaración anual)',
    categoria: 'renta-sociedades',
    periodicidad: 'Anual',
    plazo: '25 días naturales tras los 6 meses desde el cierre del ejercicio; si coincide con el año natural, hasta el 25 de julio.',
    quien: 'Sociedades',
  },
];

/** Devuelve los modelos de una categoría, en el orden definido. */
export function getModelosCalendario(categoria: CategoriaCalendario): ModeloFiscal[] {
  return CALENDARIO_FISCAL.filter((m) => m.categoria === categoria);
}
