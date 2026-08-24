'use client';

import { useState, useCallback, useEffect } from 'react';
import styles from './GeneradorUTM.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatDate } from '@/lib';

interface UTMParams {
  url: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

interface SavedLink {
  id: string;
  url: string;
  fullUrl: string;
  campaign: string;
  date: string;
}

const SOURCES = [
  { value: 'google', label: 'Google' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'email', label: 'Email' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

const MEDIUMS = [
  { value: 'cpc', label: 'CPC (Pago por clic)' },
  { value: 'cpm', label: 'CPM (Pago por impresión)' },
  { value: 'social', label: 'Social (Orgánico)' },
  { value: 'email', label: 'Email' },
  { value: 'affiliate', label: 'Afiliados' },
  { value: 'referral', label: 'Referencia' },
  { value: 'display', label: 'Display' },
  { value: 'banner', label: 'Banner' },
  { value: 'video', label: 'Video' },
  { value: 'organic', label: 'Orgánico' },
];

const STORAGE_KEY = 'meskeia_utm_links';

export default function GeneradorUTMPage() {
  const [params, setParams] = useState<UTMParams>({
    url: '',
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: '',
  });
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedLinks, setSavedLinks] = useState<SavedLink[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSavedLinks(JSON.parse(stored));
    }
  }, []);

  const updateParam = useCallback((key: keyof UTMParams, value: string) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setError('');
  }, []);

  const generateUrl = useCallback(() => {
    setError('');

    // Validar URL
    let baseUrl = params.url.trim();
    if (!baseUrl) {
      setError('Introduce una URL de destino');
      return;
    }

    // Añadir https:// si no tiene protocolo
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = 'https://' + baseUrl;
    }

    try {
      const url = new URL(baseUrl);

      // Validar campos requeridos
      if (!params.source.trim()) {
        setError('El campo Source es obligatorio');
        return;
      }
      if (!params.medium.trim()) {
        setError('El campo Medium es obligatorio');
        return;
      }
      if (!params.campaign.trim()) {
        setError('El campo Campaign es obligatorio');
        return;
      }

      // Añadir parámetros UTM
      url.searchParams.set('utm_source', params.source.trim().toLowerCase().replace(/\s+/g, '_'));
      url.searchParams.set('utm_medium', params.medium.trim().toLowerCase().replace(/\s+/g, '_'));
      url.searchParams.set('utm_campaign', params.campaign.trim().toLowerCase().replace(/\s+/g, '_'));

      if (params.term.trim()) {
        url.searchParams.set('utm_term', params.term.trim().toLowerCase().replace(/\s+/g, '_'));
      }
      if (params.content.trim()) {
        url.searchParams.set('utm_content', params.content.trim().toLowerCase().replace(/\s+/g, '_'));
      }

      setGeneratedUrl(url.toString());
    } catch {
      setError('URL inválida. Verifica el formato.');
    }
  }, [params]);

  const handleCopy = useCallback(async () => {
    if (generatedUrl) {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [generatedUrl]);

  const saveLink = useCallback(() => {
    if (!generatedUrl) return;

    const newLink: SavedLink = {
      id: Date.now().toString(),
      url: params.url,
      fullUrl: generatedUrl,
      campaign: params.campaign,
      date: formatDate(new Date()),
    };

    const updated = [newLink, ...savedLinks].slice(0, 20); // Máximo 20 enlaces
    setSavedLinks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [generatedUrl, params, savedLinks]);

  const deleteLink = useCallback((id: string) => {
    const updated = savedLinks.filter(link => link.id !== id);
    setSavedLinks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [savedLinks]);

  const handleClear = useCallback(() => {
    setParams({
      url: '',
      source: '',
      medium: '',
      campaign: '',
      term: '',
      content: '',
    });
    setGeneratedUrl('');
    setError('');
  }, []);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Generador de Enlaces UTM</h1>
        <p className={styles.subtitle}>Crea URLs con parámetros de seguimiento para Google Analytics</p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="technical"
        severity="medium"
        collapsible={true}
        context="generador-utm-disclaimer"
      />

      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️</span> {error}
        </div>
      )}

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Configuración UTM</h2>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              URL de destino <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={params.url}
              onChange={(e) => updateParam('url', e.target.value)}
              placeholder="https://ejemplo.com/pagina"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                utm_source <span className={styles.required}>*</span>
              </label>
              <select
                className={styles.select}
                value={params.source}
                onChange={(e) => updateParam('source', e.target.value)}
              >
                <option value="">Seleccionar o escribir...</option>
                {SOURCES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <input
                type="text"
                className={styles.inputSmall}
                value={params.source}
                onChange={(e) => updateParam('source', e.target.value)}
                placeholder="O escribe personalizado"
              />
              <span className={styles.hint}>Origen del tráfico (google, facebook...)</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                utm_medium <span className={styles.required}>*</span>
              </label>
              <select
                className={styles.select}
                value={params.medium}
                onChange={(e) => updateParam('medium', e.target.value)}
              >
                <option value="">Seleccionar o escribir...</option>
                {MEDIUMS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <input
                type="text"
                className={styles.inputSmall}
                value={params.medium}
                onChange={(e) => updateParam('medium', e.target.value)}
                placeholder="O escribe personalizado"
              />
              <span className={styles.hint}>Tipo de canal (cpc, email, social...)</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              utm_campaign <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={params.campaign}
              onChange={(e) => updateParam('campaign', e.target.value)}
              placeholder="black_friday_2024"
            />
            <span className={styles.hint}>Nombre de la campaña para identificarla</span>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>utm_term (opcional)</label>
              <input
                type="text"
                className={styles.input}
                value={params.term}
                onChange={(e) => updateParam('term', e.target.value)}
                placeholder="palabras_clave"
              />
              <span className={styles.hint}>Keywords de pago (para SEM)</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>utm_content (opcional)</label>
              <input
                type="text"
                className={styles.input}
                value={params.content}
                onChange={(e) => updateParam('content', e.target.value)}
                placeholder="banner_azul"
              />
              <span className={styles.hint}>Diferenciar anuncios (A/B testing)</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={generateUrl} className={styles.btnPrimary}>
              Generar Enlace UTM
            </button>
            <button type="button" onClick={handleClear} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Panel de resultado */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Enlace Generado</h2>

          {generatedUrl ? (
            <>
              <div className={styles.resultBox}>
                <code className={styles.resultUrl}>{generatedUrl}</code>
              </div>

              <div className={styles.resultActions}>
                <button type="button" onClick={handleCopy} className={styles.btnPrimary}>
                  {copied ? '✓ Copiado' : 'Copiar enlace'}
                </button>
                <button type="button" onClick={saveLink} className={styles.btnSecondary}>
                  Guardar en historial
                </button>
              </div>

              <div className={styles.breakdown}>
                <h4>Desglose de parámetros:</h4>
                <div className={styles.paramList}>
                  <div className={styles.paramItem}>
                    <span className={styles.paramKey}>utm_source</span>
                    <span className={styles.paramValue}>{params.source}</span>
                  </div>
                  <div className={styles.paramItem}>
                    <span className={styles.paramKey}>utm_medium</span>
                    <span className={styles.paramValue}>{params.medium}</span>
                  </div>
                  <div className={styles.paramItem}>
                    <span className={styles.paramKey}>utm_campaign</span>
                    <span className={styles.paramValue}>{params.campaign}</span>
                  </div>
                  {params.term && (
                    <div className={styles.paramItem}>
                      <span className={styles.paramKey}>utm_term</span>
                      <span className={styles.paramValue}>{params.term}</span>
                    </div>
                  )}
                  {params.content && (
                    <div className={styles.paramItem}>
                      <span className={styles.paramKey}>utm_content</span>
                      <span className={styles.paramValue}>{params.content}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">🔗</span>
              <p>Completa los campos y genera tu enlace UTM</p>
            </div>
          )}
        </div>
      </div>

      {/* Historial de enlaces */}
      {savedLinks.length > 0 && (
        <div className={styles.historySection}>
          <h3>Historial de enlaces guardados</h3>
          <div className={styles.historyList}>
            {savedLinks.map(link => (
              <div key={link.id} className={styles.historyItem}>
                <div className={styles.historyInfo}>
                  <span className={styles.historyCampaign}>{link.campaign}</span>
                  <span className={styles.historyDate}>{link.date}</span>
                </div>
                <code className={styles.historyUrl}>{link.fullUrl}</code>
                <div className={styles.historyActions}>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(link.fullUrl)}
                    className={styles.historyBtn}
                  >
                    Copiar
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteLink(link.id)}
                    className={styles.historyBtnDelete}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <EducationalSection
        title="Guía completa de parámetros UTM"
        subtitle="Qué son, cómo usarlos correctamente y cómo leer los resultados en GA4"
      >
        {/* ====== SECCIÓN 1: TABLA COMPARATIVA ====== */}
        <section className={styles.comparativaSection}>
          <h2>📊 Los 5 parámetros UTM: referencia completa</h2>
          <p className={styles.comparativaSubtitle}>
            Cada parámetro cumple una función específica. Los tres primeros son obligatorios; los dos últimos amplían la granularidad del tracking.
          </p>
          <div className={styles.comparativaTableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Parámetro</th>
                  <th>¿Obligatorio?</th>
                  <th>Para qué sirve</th>
                  <th>Ejemplo</th>
                  <th>¿Cuándo usarlo?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>utm_source</code></td>
                  <td><span className={styles.badgeYes}>✅ Sí</span></td>
                  <td>Origen del tráfico</td>
                  <td>google, facebook, newsletter</td>
                  <td>Siempre</td>
                </tr>
                <tr>
                  <td><code>utm_medium</code></td>
                  <td><span className={styles.badgeYes}>✅ Sí</span></td>
                  <td>Canal o tipo de tráfico</td>
                  <td>cpc, email, social</td>
                  <td>Siempre</td>
                </tr>
                <tr>
                  <td><code>utm_campaign</code></td>
                  <td><span className={styles.badgeYes}>✅ Sí</span></td>
                  <td>Nombre de la campaña</td>
                  <td>black_friday, verano_2025</td>
                  <td>Siempre</td>
                </tr>
                <tr>
                  <td><code>utm_term</code></td>
                  <td><span className={styles.badgeNo}>❌ No</span></td>
                  <td>Palabra clave de pago</td>
                  <td>zapatillas_running</td>
                  <td>Solo en Google Ads / Bing Ads</td>
                </tr>
                <tr>
                  <td><code>utm_content</code></td>
                  <td><span className={styles.badgeNo}>❌ No</span></td>
                  <td>Diferencia versiones del anuncio</td>
                  <td>banner_azul, cta_comprar</td>
                  <td>A/B testing de creatividades</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ====== SECCIÓN 2: CASOS DE USO ====== */}
        <section className={styles.casosSection}>
          <h2>💼 Casos de uso reales</h2>
          <div className={styles.casoGrid}>

            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji} aria-hidden="true">📢</span>
                <div>
                  <h3>Ana — Campaña de Google Ads</h3>
                  <span className={styles.casoTag}>Marketing de pago</span>
                </div>
              </div>
              <p>Ana gestiona una tienda de ropa deportiva y lanza anuncios de búsqueda en Google. Usa <code>utm_term</code> para saber qué palabras clave convierten mejor y <code>utm_content</code> para comparar dos versiones del anuncio.</p>
              <div className={styles.casoExample}>
                <code>utm_source=google &amp; utm_medium=cpc &amp; utm_campaign=verano_2025 &amp; utm_term=zapatillas_running &amp; utm_content=banner_deportes</code>
              </div>
              <p className={styles.casoResultado}><strong>Resultado:</strong> En GA4 ve que &quot;zapatillas_running&quot; convierte 3× más que &quot;ropa_deportiva&quot; y redirige el presupuesto.</p>
            </div>

            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji} aria-hidden="true">📧</span>
                <div>
                  <h3>Carlos — A/B en email marketing</h3>
                  <span className={styles.casoTag}>Email / Newsletter</span>
                </div>
              </div>
              <p>Carlos envía una newsletter con dos variantes del mismo enlace: uno en la cabecera y otro al final. Con <code>utm_content</code> distingue cuál genera más clics sin crear dos campañas diferentes.</p>
              <div className={styles.casoExample}>
                <code>utm_source=newsletter &amp; utm_medium=email &amp; utm_campaign=mayo_2025 &amp; utm_content=boton_superior</code><br/>
                <code>utm_source=newsletter &amp; utm_medium=email &amp; utm_campaign=mayo_2025 &amp; utm_content=boton_inferior</code>
              </div>
              <p className={styles.casoResultado}><strong>Resultado:</strong> El botón inferior tiene un 40% más de CTR. Carlos lo sube a la cabecera en el siguiente envío.</p>
            </div>

            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji} aria-hidden="true">📱</span>
                <div>
                  <h3>Laura — Instagram multiformat</h3>
                  <span className={styles.casoTag}>Redes sociales</span>
                </div>
              </div>
              <p>Laura promociona el mismo producto en Instagram Stories y en Reels orgánicos. Con <code>utm_content</code> diferencia cada formato y detecta cuál trae más tráfico cualificado.</p>
              <div className={styles.casoExample}>
                <code>utm_source=instagram &amp; utm_medium=social &amp; utm_campaign=rebajas_verano &amp; utm_content=reels</code><br/>
                <code>utm_source=instagram &amp; utm_medium=social &amp; utm_campaign=rebajas_verano &amp; utm_content=stories</code>
              </div>
              <p className={styles.casoResultado}><strong>Resultado:</strong> Los Reels traen más tráfico pero menor conversión. Laura usa Stories para campañas con CTA directa.</p>
            </div>

            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji} aria-hidden="true">🛒</span>
                <div>
                  <h3>Pedro — Black Friday multicanal</h3>
                  <span className={styles.casoTag}>E-commerce</span>
                </div>
              </div>
              <p>Pedro lanza su Black Friday en Google Ads, Facebook y email el mismo día. Mantiene <code>utm_campaign=black_friday_2025</code> idéntico en todos los canales y solo cambia source y medium, para ver el total de campaña en un solo informe.</p>
              <div className={styles.casoExample}>
                <code>utm_source=google &amp; utm_medium=cpc &amp; utm_campaign=black_friday_2025</code><br/>
                <code>utm_source=facebook &amp; utm_medium=social &amp; utm_campaign=black_friday_2025</code><br/>
                <code>utm_source=newsletter &amp; utm_medium=email &amp; utm_campaign=black_friday_2025</code>
              </div>
              <p className={styles.casoResultado}><strong>Resultado:</strong> En GA4 filtra por campaña y ve que el email genera el mayor ROAS, aunque Google trae más volumen.</p>
            </div>

          </div>
        </section>

        {/* ====== SECCIÓN 3: FAQ ====== */}
        <section className={styles.faqSection}>
          <h2>❓ Preguntas frecuentes sobre UTM</h2>
          <div className={styles.faqGrid}>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Los UTM afectan al posicionamiento SEO?</h3>
              <p className={styles.faqAnswer}>No. Los parámetros UTM son ignorados por los motores de búsqueda en el ranking. Google los filtra correctamente y no genera contenido duplicado.</p>
              <p className={styles.faqAnswer}>El único riesgo es si pones UTMs en tu URL canónica (la que enlazas como principal). En ese caso, usa la etiqueta <code>canonical</code> apuntando a la URL limpia (sin UTMs) para evitar confusión.</p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Mayúsculas o minúsculas en los valores?</h3>
              <p className={styles.faqAnswer}>Siempre <strong>minúsculas</strong> y sin espacios (usa guiones bajos). Los UTM son case-sensitive: &quot;Google&quot; y &quot;google&quot; son dos fuentes distintas en GA4.</p>
              <ul className={styles.faqList}>
                <li>✅ <code>utm_source=google</code></li>
                <li>✅ <code>utm_campaign=black_friday_2025</code></li>
                <li>❌ <code>utm_source=Google</code> (crea duplicado)</li>
                <li>❌ <code>utm_campaign=Black Friday</code> (espacio = error)</li>
              </ul>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Los UTM funcionan igual en GA4 que en Universal Analytics?</h3>
              <p className={styles.faqAnswer}>Sí, GA4 reconoce los mismos 5 parámetros. La diferencia es dónde los encuentras:</p>
              <ul className={styles.faqList}>
                <li>📍 <strong>Adquisición &gt; Tráfico &gt; Origen del tráfico</strong></li>
                <li><code>utm_source</code> → columna &quot;Origen&quot;</li>
                <li><code>utm_medium</code> → columna &quot;Medio&quot;</li>
                <li><code>utm_campaign</code> → columna &quot;Campaña&quot;</li>
                <li><code>utm_content</code> → &quot;Contenido del anuncio&quot;</li>
              </ul>
              <p className={styles.faqAnswer}>Los datos pueden tardar 24-48h en aparecer en los informes.</p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Puedo usar UTM en links internos de mi web?</h3>
              <p className={styles.faqAnswer}><strong>No es recomendable.</strong> Los links internos con UTMs sobreescriben la sesión del usuario y falsean el dato de origen real.</p>
              <p className={styles.faqAnswer}>Ejemplo: si un usuario llega desde Google Ads y luego hace clic en un enlace interno con <code>utm_source=email</code>, GA4 registrará el origen como email, perdiendo el dato del anuncio.</p>
              <p className={styles.faqAnswer}>Los UTMs son <strong>solo para links externos</strong>: campañas, emails, redes sociales, afiliados.</p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Qué pasa si alguien comparte mi URL con UTMs?</h3>
              <p className={styles.faqAnswer}>Los UTMs se propagan si alguien copia y comparte la URL exacta. Esto puede &quot;contaminar&quot; el origen de visitas posteriores con los parámetros de tu campaña original.</p>
              <p className={styles.faqAnswer}>Soluciones habituales:</p>
              <ul className={styles.faqList}>
                <li>Usar un <strong>URL shortener</strong> (bit.ly, short.io) que oculta los parámetros</li>
                <li>Configurar <strong>redirects</strong> en el servidor que eliminan UTMs tras la primera carga</li>
                <li>En landing pages, limpiar los UTMs de la barra de dirección con <code>history.replaceState</code></li>
              </ul>
            </div>

          </div>
        </section>

        {/* ====== SECCIÓN 4: GUÍA PASO A PASO ====== */}
        <section className={styles.guiaSection}>
          <h2>📋 Cómo crear una estrategia UTM consistente</h2>
          <div className={styles.guiaSteps}>
            <div className={styles.guiaStep}>
              <span className={styles.guiaNum}>1</span>
              <div>
                <h4>Define la convención de nombres antes de empezar</h4>
                <p>Acuerda con tu equipo el formato: minúsculas, guiones bajos, sin acentos. Documenta los valores permitidos para source y medium en una hoja compartida.</p>
              </div>
            </div>
            <div className={styles.guiaStep}>
              <span className={styles.guiaNum}>2</span>
              <div>
                <h4>Identifica el canal de distribución</h4>
                <p>¿Dónde se va a publicar el enlace? Esto determina <code>utm_source</code> (quién envía) y <code>utm_medium</code> (cómo llega).</p>
              </div>
            </div>
            <div className={styles.guiaStep}>
              <span className={styles.guiaNum}>3</span>
              <div>
                <h4>Nombra la campaña de forma consistente</h4>
                <p>Para comparar el rendimiento multicanal, usa <strong>exactamente el mismo</strong> valor de <code>utm_campaign</code> en todos los canales de una misma acción.</p>
              </div>
            </div>
            <div className={styles.guiaStep}>
              <span className={styles.guiaNum}>4</span>
              <div>
                <h4>Añade term y content solo cuando aportan valor</h4>
                <p><code>utm_term</code> solo en campañas SEM con palabras clave. <code>utm_content</code> solo cuando tengas variantes de un mismo anuncio que quieras comparar.</p>
              </div>
            </div>
            <div className={styles.guiaStep}>
              <span className={styles.guiaNum}>5</span>
              <div>
                <h4>Prueba el enlace antes de publicarlo</h4>
                <p>Abre la URL generada en un navegador. ¿Carga la página correcta? ¿Los parámetros son legibles en la barra de dirección?</p>
              </div>
            </div>
            <div className={styles.guiaStep}>
              <span className={styles.guiaNum}>6</span>
              <div>
                <h4>Verifica en GA4 tras 24-48 horas</h4>
                <p>Accede a <strong>Adquisición → Tráfico → Origen del tráfico</strong> y filtra por campaña. Comprueba que los valores coinciden con los que configuraste.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ====== SECCIÓN 5: TIPS Y ERRORES ====== */}
        <section className={styles.tipsSection}>
          <h2>💡 Tips y errores que debes evitar</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <h4>✅ Documenta en una hoja de cálculo</h4>
              <p>Mantén un registro de todos los UTMs creados con URL, canal, fecha y campaña. Imprescindible en equipos donde varias personas crean enlaces.</p>
            </div>
            <div className={styles.tipCard}>
              <h4>✅ Usa siempre minúsculas y guiones bajos</h4>
              <p>Es la convención estándar de la industria. <code>black_friday</code>, no <code>Black-Friday</code> ni <code>BlackFriday</code>. Facilita el filtrado en GA4.</p>
            </div>
            <div className={styles.tipCard}>
              <h4>✅ Agrupa por campaña para ver el total multicanal</h4>
              <p>Mismo <code>utm_campaign</code> en todos los canales → puedes ver en un solo informe cuánto generó tu campaña de Black Friday en total.</p>
            </div>
            <div className={styles.tipCard}>
              <h4>❌ UTMs en links internos</h4>
              <p>Sobreescriben el origen real del usuario. Un visitante de Google Ads puede quedar registrado como &quot;email&quot; si hace clic en un link interno mal etiquetado.</p>
            </div>
            <div className={styles.tipCard}>
              <h4>❌ Mezclar mayúsculas y minúsculas</h4>
              <p>&quot;Google&quot; y &quot;google&quot; son dos fuentes distintas en GA4. Una convención inconsistente fragmenta los datos y dificulta el análisis.</p>
            </div>
            <div className={styles.tipCard}>
              <h4>❌ UTMs en URLs de emails transaccionales</h4>
              <p>Los emails de confirmación, facturación o reseteo de contraseña no deben llevar UTMs. Son transaccionales, no campañas de marketing.</p>
            </div>
          </div>
        </section>

        {/* ====== SECCIÓN V2.0 — TABLA COMPARATIVA EXTENDIDA ====== */}
        <section className={styles.tableWrapper}>
          <h2>📋 Referencia rápida: los 5 parámetros UTM</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Parámetro</th>
                  <th>Descripción</th>
                  <th>Valores habituales</th>
                  <th>Obligatorio</th>
                  <th>Ejemplo real</th>
                  <th>Qué analiza en GA4</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>utm_source</code></td>
                  <td>Quién envía el tráfico</td>
                  <td>google, newsletter, instagram</td>
                  <td><span className={styles.badgeYes}>✅ Sí</span></td>
                  <td><code>utm_source=google</code></td>
                  <td>Columna &quot;Origen&quot; en Adquisición</td>
                </tr>
                <tr>
                  <td><code>utm_medium</code></td>
                  <td>Canal o tipo de marketing</td>
                  <td>cpc, email, social, organic</td>
                  <td><span className={styles.badgeYes}>✅ Sí</span></td>
                  <td><code>utm_medium=cpc</code></td>
                  <td>Columna &quot;Medio&quot; en Adquisición</td>
                </tr>
                <tr>
                  <td><code>utm_campaign</code></td>
                  <td>Nombre identificador de la campaña</td>
                  <td>black-friday, verano2025, rebajas</td>
                  <td><span className={styles.badgeYes}>✅ Sí</span></td>
                  <td><code>utm_campaign=verano2025</code></td>
                  <td>Columna &quot;Campaña&quot; en Adquisición</td>
                </tr>
                <tr>
                  <td><code>utm_term</code></td>
                  <td>Palabra clave de pago (SEM)</td>
                  <td>zapatillas running, seguro coche</td>
                  <td><span className={styles.badgeNo}>❌ No</span></td>
                  <td><code>utm_term=zapatillas-running</code></td>
                  <td>&quot;Término de búsqueda&quot; en informes de campaña</td>
                </tr>
                <tr>
                  <td><code>utm_content</code></td>
                  <td>Diferencia variantes del mismo anuncio</td>
                  <td>banner-azul, cta-comprar, imagen-v2</td>
                  <td><span className={styles.badgeNo}>❌ No</span></td>
                  <td><code>utm_content=banner-azul</code></td>
                  <td>&quot;Contenido del anuncio&quot; en informes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ====== SECCIÓN V2.0 — CASOS DE USO / ESCENARIOS ====== */}
        <section>
          <h2>🎯 Quién usa los UTM y para qué</h2>
          <div className={styles.escenariosGrid}>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📊</span>
                <h3>Responsable de marketing — ROI de email</h3>
              </div>
              <p>Mide el retorno de cada campaña de email marketing comparando aperturas, clics y conversiones por campaña desde GA4.</p>
              <div className={styles.escenarioExample}>
                <code>utm_source=mailchimp &amp; utm_medium=email &amp; utm_campaign=promo-marzo</code>
              </div>
              <p className={styles.escenarioTip}>Resultado: identifica qué asuntos de email generan más ventas.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📱</span>
                <h3>Community manager — Rendimiento por red social</h3>
              </div>
              <p>Compara el tráfico orgánico de Instagram, TikTok y LinkedIn con el mismo utm_campaign para ver qué red convierte mejor.</p>
              <div className={styles.escenarioExample}>
                <code>utm_source=tiktok &amp; utm_medium=social &amp; utm_campaign=lanzamiento-producto</code>
              </div>
              <p className={styles.escenarioTip}>Resultado: descubre que LinkedIn convierte 4× más aunque TikTok trae más volumen.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔗</span>
                <h3>Afiliado — Rastreo de conversiones por fuente</h3>
              </div>
              <p>Un afiliado que promociona el mismo producto en varias webs y foros usa utm_source distinto en cada enlace para saber qué fuente genera más comisiones.</p>
              <div className={styles.escenarioExample}>
                <code>utm_source=foro-cocina &amp; utm_medium=affiliate &amp; utm_campaign=verano2025</code>
              </div>
              <p className={styles.escenarioTip}>Resultado: el foro especializado convierte 8× más que el blog generalista.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏢</span>
                <h3>Agencia digital — Reporting a cliente</h3>
              </div>
              <p>La agencia usa utm_campaign con el nombre del cliente y utm_content para diferenciar creatividades. El cliente ve en GA4 exactamente qué campaña generó cada resultado.</p>
              <div className={styles.escenarioExample}>
                <code>utm_source=google &amp; utm_medium=cpc &amp; utm_campaign=cliente-xyz-q1 &amp; utm_content=anuncio-v2</code>
              </div>
              <p className={styles.escenarioTip}>Resultado: reporting transparente sin necesidad de exportar datos manualmente.</p>
            </div>

          </div>
        </section>

        {/* ====== SECCIÓN V2.0 — FAQ ====== */}
        <section>
          <h2>❓ Preguntas frecuentes (ampliadas)</h2>
          <div className={styles.faqList}>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Los parámetros UTM afectan al SEO?</h3>
              <p className={styles.faqAnswer}>No directamente. Google ignora los parámetros UTM al indexar, siempre que la URL canónica apunte a la versión limpia (sin UTMs). Configura la etiqueta <code>canonical</code> para evitar confusión y nunca uses UTMs como URL principal en tu sitemap.</p>
              <p className={styles.faqTip}>Consejo: en Google Search Console añade un parámetro de URL para que Googlebot los ignore explícitamente.</p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Debo usar UTM en links internos de mi web?</h3>
              <p className={styles.faqAnswer}>No. Usar UTMs en la navegación interna sobreescribe el origen de sesión del usuario. Si alguien llega desde Google Ads y hace clic en un menú con UTM de email, GA4 registrará el origen como email, perdiendo el dato de la campaña de pago.</p>
              <p className={styles.faqTip}>Regla: UTMs solo en enlaces externos (emails, anuncios, redes sociales, afiliados).</p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Distingue GA4 entre mayúsculas y minúsculas en UTM?</h3>
              <p className={styles.faqAnswer}>Sí. GA4 es case-sensitive: <code>utm_source=Google</code> y <code>utm_source=google</code> son dos fuentes distintas en los informes. Esto fragmenta los datos y complica el análisis.</p>
              <p className={styles.faqTip}>Solución: usar siempre minúsculas. Este generador los convierte automáticamente.</p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Qué pasa si el usuario comparte mi URL con UTM en redes sociales?</h3>
              <p className={styles.faqAnswer}>Los UTMs se propagan. Otros usuarios que accedan a esa URL compartida serán atribuidos a tu campaña original en lugar de a &quot;social&quot; orgánico. Esto puede inflar artificialmente los resultados de una campaña.</p>
              <p className={styles.faqTip}>Solución: usa un acortador de URLs (bit.ly, short.io) que oculta los parámetros en el enlace compartido.</p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Puedo usar UTM en anuncios de Google Ads?</h3>
              <p className={styles.faqAnswer}>Sí, pero Google Ads tiene su propio sistema de auto-etiquetado (gclid) que es más preciso. Si combinas ambos, los UTMs pueden sobrescribir el gclid. La recomendación es usar el auto-etiquetado de Google Ads y reservar los UTMs para otros canales.</p>
              <p className={styles.faqTip}>Excepción: si necesitas datos en herramientas externas a GA4, los UTMs en Google Ads son válidos.</p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Cuánto tiempo guarda GA4 los datos de UTM?</h3>
              <p className={styles.faqAnswer}>GA4 retiene los datos de sesión (incluyendo UTMs) durante el tiempo que tengas configurado en la propiedad: por defecto 14 meses, ampliable a 26 meses en cuentas de pago. Los datos agregados en informes estándar están disponibles hasta 2 años.</p>
              <p className={styles.faqTip}>Para análisis históricos más largos, exporta a BigQuery con la integración gratuita de GA4.</p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Qué es utm_id y para qué sirve?</h3>
              <p className={styles.faqAnswer}><code>utm_id</code> es un parámetro adicional (no estándar en Universal Analytics pero sí en GA4) que permite asociar el tráfico con un ID de campaña externo, como el ID de tu CRM o plataforma de publicidad. Útil para cruzar datos entre GA4 y herramientas como HubSpot o Salesforce.</p>
              <p className={styles.faqTip}>No es obligatorio ni habitual en campañas básicas, pero sí útil en integraciones avanzadas.</p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Los UTM funcionan con Universal Analytics y GA4?</h3>
              <p className={styles.faqAnswer}>Los 5 parámetros estándar (source, medium, campaign, term, content) funcionan en ambas plataformas. Universal Analytics fue retirado en julio de 2023, por lo que si tienes una propiedad activa es GA4. La diferencia está en dónde encontrar los datos: en GA4 ve a Adquisición &gt; Tráfico &gt; Origen del tráfico.</p>
              <p className={styles.faqTip}>GA4 también soporta utm_id, utm_source_platform y utm_creative_format como parámetros adicionales.</p>
            </div>

          </div>
        </section>

        {/* ====== SECCIÓN V2.0 — GUÍA PASO A PASO ====== */}
        <section>
          <h2>🗺️ Cómo crear un sistema UTM profesional (paso a paso)</h2>
          <div className={styles.stepGuide}>

            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h4>Define una nomenclatura interna clara</h4>
                <p>Antes de crear el primer enlace, decide las reglas: siempre minúsculas, guiones en lugar de espacios, sin acentos ni caracteres especiales. Documenta los valores permitidos para source y medium en una wiki o hoja compartida.</p>
              </div>
            </div>

            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h4>Identifica la fuente (utm_source)</h4>
                <p>¿Quién va a distribuir el enlace? Si es Google, usa <code>google</code>. Si es tu newsletter, usa <code>newsletter</code> o el nombre de tu ESP (mailchimp, mailerlite). Si es Instagram, usa <code>instagram</code>.</p>
              </div>
            </div>

            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h4>Define el medio (utm_medium)</h4>
                <p>¿Cómo llega el usuario? Anuncio de pago: <code>cpc</code>. Correo electrónico: <code>email</code>. Publicación en redes sin pago: <code>social</code>. Tráfico de búsqueda orgánica: <code>organic</code>.</p>
              </div>
            </div>

            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h4>Nombra la campaña (utm_campaign)</h4>
                <p>Usa un nombre descriptivo y consistente: <code>verano2025</code>, <code>black-friday</code>, <code>lanzamiento-app</code>. Si lanzas en varios canales el mismo día, usa exactamente el mismo nombre en todos para poder ver el total en un solo informe.</p>
              </div>
            </div>

            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <h4>Añade utm_term si es una campaña SEM</h4>
                <p>Solo para campañas de búsqueda de pago con palabras clave explícitas. Usa el término de búsqueda exacto o el grupo de anuncios: <code>zapatillas-running</code>, <code>seguro-hogar-madrid</code>. En el resto de canales omite este parámetro.</p>
              </div>
            </div>

            <div className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <h4>Añade utm_content si hay variantes A/B</h4>
                <p>Cuando tienes dos versiones del mismo anuncio o enlace diferenciado por posición, usa utm_content para distinguirlos: <code>banner-superior</code>, <code>banner-inferior</code>, <code>imagen-v1</code>, <code>imagen-v2</code>.</p>
              </div>
            </div>

            <div className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <h4>Genera la URL y acórtala si es necesaria</h4>
                <p>Usa este generador para crear la URL final. Si la URL resultante es muy larga (habitual en campañas con muchos parámetros), acórtala con bit.ly o short.io antes de publicarla en redes sociales o mensajes de texto donde el espacio importa.</p>
              </div>
            </div>

          </div>
        </section>

        {/* ====== SECCIÓN V2.0 — MEJORES PRÁCTICAS ====== */}
        <section>
          <h2>✅ Mejores prácticas para un tracking limpio</h2>
          <div className={styles.tipsGrid}>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔡</span>
              <h4>Siempre en minúsculas y sin espacios</h4>
              <p>Usa guiones (<code>-</code>) o guiones bajos (<code>_</code>) para separar palabras. Los espacios se codifican como <code>%20</code> y ensucian las URLs y los informes.</p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📖</span>
              <h4>Crea una guía de nomenclatura para el equipo</h4>
              <p>Un documento con los valores permitidos de source y medium evita que cada persona use convenciones distintas, lo que fragmente los datos de GA4.</p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🚫</span>
              <h4>Nunca uses UTM en links internos</h4>
              <p>Los UTMs en la navegación interna de tu web contaminan los datos de sesión y sobreescriben el origen real del usuario, falsificando tus informes de adquisición.</p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✂️</span>
              <h4>Acorta las URLs largas para redes sociales</h4>
              <p>Una URL con 5 parámetros UTM puede superar los 200 caracteres. Usa bit.ly o short.io para compartir un enlace limpio que preserve el tracking interno.</p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧪</span>
              <h4>Usa utm_content para tests A/B de creatividades</h4>
              <p>Cuando pruebas dos versiones del mismo anuncio o posición del CTA, utm_content te permite comparar cuál convierte mejor sin crear campañas separadas.</p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <h4>Documenta todas las campañas en una hoja compartida</h4>
              <p>Mantén un registro con URL, canal, fecha de lanzamiento y resultado esperado. Imprescindible cuando varias personas del equipo crean enlaces UTM.</p>
            </div>

          </div>
        </section>

        {/* ====== SECCIÓN V2.0 — WARNING BOX ====== */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores frecuentes que arruinan tus datos en GA4</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Mezclar mayúsculas y minúsculas:</strong> <code>google</code> y <code>Google</code> son dos fuentes distintas en GA4. Tus informes quedarán fragmentados y perderás visión global.</li>
            <li><strong>Usar UTM en la navegación interna:</strong> cada clic interno con UTM infla el tráfico directo artificialmente y sobreescribe el origen real de la sesión del usuario.</li>
            <li><strong>No tener nomenclatura consensuada en el equipo:</strong> si cada persona usa sus propias convenciones, los datos de GA4 serán inconsistentes e imposibles de agregar correctamente.</li>
            <li><strong>Poner espacios en los valores:</strong> los espacios se codifican como <code>%20</code> y ensucian los informes. Usa siempre guiones o guiones bajos como separadores.</li>
            <li><strong>Olvidar añadir UTM a campañas de pago:</strong> sin UTMs en tus anuncios de Meta o LinkedIn, el tráfico de pago aparece como &quot;directo&quot; en GA4 y pierdes toda la trazabilidad del ROI.</li>
            <li><strong>Usar el mismo utm_campaign para campañas distintas:</strong> si reutilizas el nombre de una campaña anterior, los datos históricos y los nuevos se mezclan, imposibilitando cualquier comparación entre períodos.</li>
          </ul>
        </div>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-utm')} />

      <ShareCard appName="generador-utm" />
      <Footer appName="generador-utm" />
    </div>
  );
}
