/**
 * Delegum · Soluciones — modelo de acceso por situación ("triaje de asesoría").
 *
 * Sustituye a la antigua lista plana de "Calculadoras". Define 6 PUERTAS por
 * situación del usuario; cada puerta agrupa las herramientas de meskeIA que
 * resuelven ese tipo de problema fiscal / laboral / financiero.
 *
 * Las apps se referencian por su `url` canónica (relativa, igual que en
 * data/applications.ts). La página resuelve nombre/icono/descripción contra
 * `applicationsDatabase` para no duplicar metadatos; `desc` aquí es un OVERRIDE
 * opcional con la voz Delegum (más corta) cuando interesa.
 *
 * Catálogo curado: marca pertenencia al universo Delegum. NO es exhaustivo por
 * diseño (lo no cubierto se alcanza por buscador / asistente / cross-links).
 * Decisiones y dudas abiertas: ver DELEGUM-SOLUCIONES.md.
 */

export type GrupoPuerta = 'particular' | 'profesional';

export interface AppPuerta {
  /** URL canónica relativa, idéntica a la de data/applications.ts (con barras). */
  url: string;
  /** Override opcional de descripción con voz Delegum (si se omite, usa la de la app). */
  desc?: string;
}

export interface Puerta {
  id: string;
  /** Título de la situación. */
  titulo: string;
  /** Frase en primera persona que da contexto a la situación. */
  voz: string;
  /** Emoji de la puerta (decorativo). */
  icon: string;
  grupo: GrupoPuerta;
  apps: AppPuerta[];
}

export const PUERTAS: Puerta[] = [
  // ── PARTICULAR ──────────────────────────────────────────────────────────
  {
    id: 'trabajo',
    titulo: 'Trabajo por cuenta ajena',
    voz: 'Entender mi sueldo y mis impuestos',
    icon: '💼',
    grupo: 'particular',
    apps: [
      { url: '/estimador-sueldo-neto/', desc: 'Del bruto al neto con IRPF y Seguridad Social.' },
      { url: '/simulador-desglose-nomina/', desc: 'Cada línea de tu nómina, explicada.' },
      { url: '/orientador-tipos-renta-irpf/', desc: 'Cómo tributa cada ingreso: base general o del ahorro.' },
      { url: '/estimador-irpf/', desc: 'Tu IRPF estimado por tramos.' },
      { url: '/test-obligado-declarar-renta/', desc: '¿Estás obligado a hacer la declaración?' },
      { url: '/selector-contrato-trabajo/', desc: 'Qué tipo de contrato te corresponde.' },
      { url: '/estimador-smi/' },
    ],
  },
  {
    id: 'vivienda',
    titulo: 'Vivienda',
    voz: 'Comprar, vender o alquilar',
    icon: '🏠',
    grupo: 'particular',
    apps: [
      { url: '/estimador-hipoteca/', desc: 'Cuota y cuadro de amortización completo.' },
      { url: '/amortizacion-hipoteca/', desc: 'Cuánto ahorras amortizando anticipadamente.' },
      { url: '/estimador-compraventa-inmueble/', desc: 'ITP/IVA, notaría, registro y plusvalía.' },
      { url: '/estimador-plusvalia-municipal/', desc: 'IIVTNU al vender o heredar: objetivo vs real.' },
      { url: '/selector-tipo-hipoteca/', desc: 'Fija, variable o mixta según tu perfil.' },
      { url: '/selector-tipo-prestamo/' },
      { url: '/estimador-prestamos/' },
      { url: '/orientador-aval-ico/' },
      { url: '/calculadora-rentabilidad-alquiler/', desc: 'Rentabilidad de comprar para alquilar.' },
      { url: '/estimador-actualizacion-alquiler/' },
      { url: '/orientador-alquiler-vs-compra/' },
      { url: '/simulador-bono-joven-alquiler/' },
      { url: '/estimador-gastos-comunidad/' },
      { url: '/orientador-alquiler-habitaciones/' },
    ],
  },
  {
    id: 'ahorro-inversion',
    titulo: 'Ahorro e inversión',
    voz: 'Mi dinero a futuro',
    icon: '📈',
    grupo: 'particular',
    apps: [
      { url: '/test-perfil-inversor/', desc: 'Descubre tu perfil de riesgo como inversor.' },
      { url: '/estimador-interes-compuesto/', desc: 'El efecto bola de nieve de tu ahorro.' },
      { url: '/estimador-inflacion/', desc: 'Cuánto pierde valor tu dinero con el tiempo.' },
      { url: '/estimador-fire/', desc: 'Cuánto necesitas para tu independencia financiera.' },
      { url: '/estimador-fondo-emergencia/' },
      { url: '/estimador-cartera-inversion/' },
      { url: '/selector-inversiones/' },
      { url: '/orientador-regla-50-30-20/' },
      { url: '/control-gastos/' },
      { url: '/estimador-deuda/' },
      { url: '/estimador-coste-plazos/' },
      { url: '/estimador-tiempo-ahorro/' },
      { url: '/selector-tipo-ahorro/' },
      { url: '/selector-cuenta-bancaria/' },
      { url: '/conversor-divisas/' },
    ],
  },
  {
    id: 'jubilacion-herencias',
    titulo: 'Jubilación y herencias',
    voz: 'Lo que viene y lo que dejo',
    icon: '🧓',
    grupo: 'particular',
    apps: [
      { url: '/simulador-jubilacion-publica/', desc: 'Edad y pensión estimada con el sistema dual.' },
      { url: '/planificador-ahorro-jubilacion/' },
      { url: '/selector-plan-pensiones/' },
      { url: '/simulador-renta-plan-pensiones/' },
      { url: '/estimador-complemento-minimos/' },
      { url: '/estimador-irpf-pensionista/' },
      { url: '/optimizador-rentas-60/' },
      { url: '/orientador-tramites-jubilacion/' },
      { url: '/estimador-pension-viudedad/', desc: 'Porcentaje, base reguladora y mínimos.' },
      { url: '/verificador-complemento-brecha-genero/' },
      { url: '/estimador-impuesto-sucesiones/', desc: 'Cuota del ISD por herencia según CCAA y parentesco.' },
      { url: '/estimador-impuesto-donaciones/', desc: 'Cuota del ISD por donación según CCAA y parentesco.' },
      { url: '/estimador-legitimas/', desc: 'Herencia forzosa según el régimen civil de tu CCAA.' },
      { url: '/simulador-heredar-vivienda/' },
      { url: '/declaracion-renta-fallecidos/' },
      { url: '/orientacion-tramitacion-herencias/' },
    ],
  },
  {
    id: 'familia',
    titulo: 'Familia',
    voz: 'Situaciones personales con impacto económico',
    icon: '👨‍👩‍👧',
    grupo: 'particular',
    apps: [
      { url: '/estimacion-prestacion-nacimiento/', desc: 'Cuantía y duración de la baja por nacimiento.' },
      { url: '/estimacion-deduccion-maternidad/' },
      { url: '/estimacion-prestaciones-dependencia/', desc: 'Cuantías del SAAD y copago según tu grado.' },
      { url: '/orientador-grado-dependencia/' },
      { url: '/orientador-discapacidad/' },
      { url: '/estimacion-deduccion-discapacidad/' },
      { url: '/residencia-vs-cuidado-en-casa/' },
      { url: '/checklist-tramites-dependencia/' },
      { url: '/impuestos-divorcio/' },
      { url: '/orientador-ayudas-personas-familias/' },
    ],
  },
  // ── PROFESIONAL / EMPRESA ───────────────────────────────────────────────
  {
    id: 'negocio',
    titulo: 'Mi actividad o negocio',
    voz: 'Autónomo o empresa, al día',
    icon: '🏢',
    grupo: 'profesional',
    apps: [
      { url: '/estimador-cuota-autonomo/', desc: 'Cuota RETA mensual por ingresos reales.' },
      { url: '/orientador-iva-espana/', desc: 'Qué IVA aplicar en cada operación, con simulador.' },
      { url: '/orientador-gastos-deducibles/' },
      { url: '/orientador-facturacion-retencion/' },
      { url: '/selector-regimen-fiscal-autonomo/' },
      { url: '/simulador-modulos-vs-directa/' },
      { url: '/generador-facturas/' },
      { url: '/orientador-tarifa-freelance/' },
      { url: '/planificador-trimestres-freelance/' },
      { url: '/asistente-alta-autonomo/' },
      { url: '/checklist-preparar-verifactu/' },
      { url: '/comparador-autonomo-vs-sl/', desc: 'Tributar por IRPF como autónomo o por Sociedades.' },
      { url: '/comparador-formas-juridicas/' },
      { url: '/asistente-constitucion-sociedad/' },
      { url: '/analizador-ratios-financieros/' },
      { url: '/calculadora-valoracion-empresa/' },
      { url: '/simulador-contabilidad-basica/' },
      { url: '/simulador-financiacion-empresarial/' },
      { url: '/orientador-ayudas-autonomos-pymes/' },
      { url: '/calculadora-amortizacion-inmovilizado/' },
      { url: '/estimador-tir-van/' },
      { url: '/calculadora-z-score-altman/' },
    ],
  },
];

// Mapa inverso url-de-app → puerta. Si una app apareciera en varias puertas,
// gana la primera aparición (su puerta primaria).
const PUERTA_POR_APP = new Map<string, Puerta>();
for (const p of PUERTAS) {
  for (const a of p.apps) {
    if (!PUERTA_POR_APP.has(a.url)) PUERTA_POR_APP.set(a.url, p);
  }
}

/**
 * Devuelve la puerta de Soluciones a la que pertenece una app (por su slug, sin
 * barras), o null si la app no está en el universo Delegum. Lo consume el
 * cross-link meskeIA → Delegum (componente DescubreVertical).
 */
export function getPuertaDeApp(slug: string): Puerta | null {
  return PUERTA_POR_APP.get(`/${slug}/`) ?? null;
}
