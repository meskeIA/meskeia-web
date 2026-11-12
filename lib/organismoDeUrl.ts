/**
 * El organismo que publica una dirección oficial, para rotular su enlace.
 *
 * DE DÓNDE SALE (hallazgo 4544 y cabo C0718, 12/11/2026): el triaje fiscal del 10/11/2026
 * (1d40d66a2) cambió el `urlOficial` de sucesiones y donaciones de la sede de la AEAT (404) al
 * BOE, y el hero de estimador-impuesto-sucesiones y de estimador-impuesto-donaciones seguía
 * rotulando el enlace «Agencia Tributaria», escrito a mano: el texto nombraba un organismo y el
 * enlace abría otro (WCAG 2.4.4). Sacando el rótulo de la propia dirección, el siguiente cambio
 * de `urlOficial` no puede volver a separarlos.
 *
 * Con un dominio que no está en la tabla devuelve el dominio, que al menos es verdad.
 */

const ORGANISMOS: { dominio: string; organismo: string }[] = [
  { dominio: 'boe.es', organismo: 'Boletín Oficial del Estado' },
  { dominio: 'agenciatributaria.gob.es', organismo: 'Agencia Tributaria' },
  { dominio: 'agenciatributaria.es', organismo: 'Agencia Tributaria' },
  { dominio: 'seg-social.es', organismo: 'Seguridad Social' },
  { dominio: 'atc.gencat.cat', organismo: 'Agència Tributària de Catalunya' },
];

export function organismoDeUrl(url: string): string {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return url;
  }
  const encontrado = ORGANISMOS.find(({ dominio }) => host === dominio || host.endsWith(`.${dominio}`));
  return encontrado ? encontrado.organismo : host.replace(/^www\./, '');
}
