import {
  FISCAL_IRPF_META, FISCAL_IVA_META, FISCAL_SMI_META,
  FISCAL_AUTONOMOS_META, FISCAL_INMUEBLES_META, FISCAL_INTERESES_META,
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
