'use client';

import { useState, useCallback, useEffect } from 'react';
import styles from './GeneradorUTM.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

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
      date: new Date().toLocaleDateString('es-ES'),
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
            <button onClick={generateUrl} className={styles.btnPrimary}>
              Generar Enlace UTM
            </button>
            <button onClick={handleClear} className={styles.btnSecondary}>
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
                <button onClick={handleCopy} className={styles.btnPrimary}>
                  {copied ? '✓ Copiado' : 'Copiar enlace'}
                </button>
                <button onClick={saveLink} className={styles.btnSecondary}>
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
              <span className={styles.placeholderIcon}>🔗</span>
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
                    onClick={() => navigator.clipboard.writeText(link.fullUrl)}
                    className={styles.historyBtn}
                  >
                    Copiar
                  </button>
                  <button
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

      {/* Info */}
      <div className={styles.infoSection}>
        <h3>¿Qué son los parámetros UTM?</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>📊</span>
            <h4>Tracking</h4>
            <p>Los UTM permiten rastrear de dónde viene el tráfico en Google Analytics</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>📈</span>
            <h4>ROI</h4>
            <p>Mide qué campañas, canales o anuncios generan más conversiones</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🎯</span>
            <h4>Optimización</h4>
            <p>Identifica qué funciona y optimiza tu inversión en marketing</p>
          </div>
        </div>
      </div>

      <Footer appName="generador-utm" />
    </div>
  );
}
