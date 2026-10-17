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

export function clasificarReferrer(referrer: string): ReferrerClasificado {
  const ninguno: ReferrerClasificado = { canal: null, dominio: null };
  if (!referrer) return ninguno;

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
