import {
  FISCAL_IRPF_META, FISCAL_IVA_META, FISCAL_SMI_META,
  FISCAL_AUTONOMOS_META, FISCAL_INMUEBLES_META, FISCAL_INTERESES_META,
  FISCAL_SUCESIONES_META, FISCAL_DONACIONES_META, FISCAL_PATRIMONIO_META, FISCAL_AMORTIZACION_META,
  FISCAL_SOCIEDADES_META, FISCAL_IPREM_META, FISCAL_PENSIONES_META,
} from '@/data/fiscal';

/**
 * Índice JSON de los datasets fiscales de Delegum (grounding para IA).
 * URL: https://delegum.com/api/datos
 */
const BASE = 'https://delegum.com';

const DATASETS = [
  { slug: 'irpf-tramos-minimos', nombre: 'Tramos y mínimos del IRPF', meta: FISCAL_IRPF_META },
  { slug: 'iva-tipos', nombre: 'Tipos de IVA en España', meta: FISCAL_IVA_META },
  { slug: 'smi-salario-minimo', nombre: 'Salario Mínimo Interprofesional (SMI)', meta: FISCAL_SMI_META },
  { slug: 'cuota-autonomos-reta', nombre: 'Cuota de autónomos (RETA)', meta: FISCAL_AUTONOMOS_META },
  { slug: 'itp-ccaa', nombre: 'Tipos de ITP por comunidad autónoma', meta: FISCAL_INMUEBLES_META },
  { slug: 'interes-legal-demora', nombre: 'Interés legal del dinero y de demora', meta: FISCAL_INTERESES_META },
  { slug: 'sucesiones-isd', nombre: 'Impuesto de Sucesiones por comunidad autónoma', meta: FISCAL_SUCESIONES_META },
  { slug: 'donaciones-isd', nombre: 'Impuesto de Donaciones por comunidad autónoma', meta: FISCAL_DONACIONES_META },
  { slug: 'impuesto-patrimonio', nombre: 'Impuesto sobre el Patrimonio por comunidad autónoma', meta: FISCAL_PATRIMONIO_META },
  { slug: 'amortizacion-inmovilizado', nombre: 'Coeficientes de amortización del inmovilizado', meta: FISCAL_AMORTIZACION_META },
  { slug: 'impuesto-sociedades', nombre: 'Tipos del Impuesto de Sociedades', meta: FISCAL_SOCIEDADES_META },
  { slug: 'iprem', nombre: 'IPREM 2026', meta: FISCAL_IPREM_META },
  { slug: 'pensiones-jubilacion', nombre: 'Pensión de jubilación: edad, cotización y cuantías', meta: FISCAL_PENSIONES_META },
];

export function GET() {
  const datasets = DATASETS.map((d) => ({
    nombre: d.nombre,
    json: `${BASE}/api/datos/${d.slug}/`,
    paginaHumana: `${BASE}/datos-fiscales/${d.slug}/`,
    vigencia: d.meta.vigencia,
    verificado: d.meta.verificado,
  }));

  return Response.json(
    {
      nombre: 'Datos fiscales de Delegum',
      descripcion: 'Datos normativos fiscales, laborales y financieros de España, verificados y citables. Parte de meskeIA.',
      aviso: 'Datos orientativos. No constituyen asesoramiento profesional.',
      total: datasets.length,
      datasets,
    },
    { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400', 'Access-Control-Allow-Origin': '*' } },
  );
}
