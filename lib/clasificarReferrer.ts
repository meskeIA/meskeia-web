/**
 * Canal de llegada según el referrer: IA, red social o ninguno.
 *
 * Se decide por el DOMINIO del referrer, anclado al final (el dominio o un
 * subdominio suyo), nunca buscando el patrón en la URL entera.
 *
 * Caso de origen (acta del digest del 17/10/2026, P1): AnalyticsTracker probaba
 * `/t\.co|x\.com|…/` contra `document.referrer` completo, y `t\.co` encajaba
 * dentro de «qwan·t.co·m», «padle·t.co·m», «microsof·t.co·m» o «blogspo·t.co·m»,
 * y `x\.com` dentro de «yande·x.com». En el dump de ese día, 102 de las 318
 * visitas `referral-social` del histórico eran de buscadores, de Padlet, de
 * blogs o propias, y 28 de los dos canales tenían por referrer meskeia.com: el
 * patrón aparecía en la ruta o en la query (p. ej. `?utm_source=chatgpt.com`).
 *
 * Es un corte de instrumentación: ver app/api/analytics/CLAUDE.md.
 * Pruebas: tests/clasificar-referrer-motor.spec.ts (`npm run test:calc`).
 *
 * ── Visitas de IA sin referrer: el `utm_source` (18/10/2026, cabo C0282) ──────
 * El canal IA cayó a la mitad desde la semana del 05/10 y casi toda la caída era de
 * chatgpt.com (47, 72, 40, 10 y menos de 4 visitas por semana), con el resto de IAs y el
 * tráfico humano planos. No se podía saber si ChatGPT citaba menos o había dejado de mandar
 * Referer: marca sus enlaces con `?utm_source=chatgpt.com`, y sin referrer la visita entraba
 * como `web` sin rastro. Desde entonces, **solo cuando falta el referrer**, un `utm_source`
 * que sea un dominio de DOMINIOS_IA cuenta como IA. Con referrer, manda el referrer: un
 * `utm_source` en la URL de una página propia (navegación interna) no es una llegada.
 * Otro corte de instrumentación: si el canal IA sube alrededor del 18/10, es esto.
 */

export type CanalReferrer = 'ia' | 'social';

export interface ReferrerClasificado {
  canal: CanalReferrer | null;
  /** Hostname del referrer (RGPD: solo el dominio), solo si hay canal. */
  dominio: string | null;
}

const DOMINIOS_IA = [
  'chatgpt.com',
  'perplexity.ai',
  'claude.ai',
  'gemini.google.com',
  'copilot.microsoft.com',
  'you.com',
  'phind.com',
  'poe.com',
];

const DOMINIOS_SOCIAL = [
  't.co',
  'x.com',
  'twitter.com',
  'instagram.com',
  'facebook.com',
  'linkedin.com',
];

/** true si `host` es `dominio` o un subdominio suyo (l.instagram.com, m.facebook.com…). */
function esDelDominio(host: string, dominio: string): boolean {
  return host === dominio || host.endsWith(`.${dominio}`);
}

/**
 * `utmSource` es el `utm_source` de la URL de llegada; solo se mira si no hay referrer.
 * Se compara como un dominio (`chatgpt.com`, `www.perplexity.ai`), no como texto suelto.
 */
export function clasificarReferrer(referrer: string, utmSource?: string | null): ReferrerClasificado {
  const ninguno: ReferrerClasificado = { canal: null, dominio: null };
  if (!referrer) {
    const utm = (utmSource ?? '').trim().toLowerCase();
    if (utm && DOMINIOS_IA.some(d => esDelDominio(utm, d))) return { canal: 'ia', dominio: utm };
    return ninguno;
  }

  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return ninguno;
  }
  if (!host) return ninguno;

  if (DOMINIOS_IA.some(d => esDelDominio(host, d))) return { canal: 'ia', dominio: host };
  if (DOMINIOS_SOCIAL.some(d => esDelDominio(host, d))) return { canal: 'social', dominio: host };
  return ninguno;
}
