'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './MiIp.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

interface IpInfo {
  ip: string;
  version: 'IPv4' | 'IPv6';
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
  proxy?: boolean;
  hosting?: boolean;
}

interface ConnectionInfo {
  type: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface HistoryEntry {
  ip: string;
  timestamp: string;
  city?: string;
  country?: string;
}

export default function MiIpPage() {
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [ipv6, setIpv6] = useState<string | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Cargar historial de localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('meskeIA_ip_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Guardar IP en historial
  const saveToHistory = useCallback((info: IpInfo) => {
    const entry: HistoryEntry = {
      ip: info.ip,
      timestamp: new Date().toISOString(),
      city: info.city,
      country: info.country
    };

    setHistory(prev => {
      // Evitar duplicados consecutivos
      if (prev.length > 0 && prev[0].ip === info.ip) {
        return prev;
      }
      const newHistory = [entry, ...prev].slice(0, 20);
      localStorage.setItem('meskeIA_ip_history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  // Obtener información de IP
  const fetchIpInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Usamos ipapi.co que soporta HTTPS y devuelve toda la info en una sola llamada
      // Límite: 1000 peticiones/día (suficiente para uso normal)
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();

      if (data.error) {
        throw new Error(data.reason || 'Error al obtener información de IP');
      }

      const info: IpInfo = {
        ip: data.ip,
        version: data.version === 'IPv6' ? 'IPv6' : 'IPv4',
        country: data.country_name,
        countryCode: data.country_code,
        region: data.region,
        city: data.city,
        zip: data.postal,
        lat: data.latitude,
        lon: data.longitude,
        timezone: data.timezone,
        isp: data.org,
        org: data.org,
        as: data.asn ? `AS${data.asn} ${data.org}` : undefined,
        proxy: false, // ipapi.co no detecta proxy en plan gratuito
        hosting: false
      };
      setIpInfo(info);
      saveToHistory(info);

      // Intentar obtener IPv6 también
      try {
        const ipv6Response = await fetch('https://api64.ipify.org?format=json');
        const ipv6Data = await ipv6Response.json();
        if (ipv6Data.ip && ipv6Data.ip.includes(':')) {
          setIpv6(ipv6Data.ip);
        }
      } catch {
        // IPv6 no disponible, no es un error crítico
      }

    } catch (err) {
      setError('No se pudo obtener la información de IP. Verifica tu conexión a internet.');
      console.error('Error fetching IP:', err);
    } finally {
      setIsLoading(false);
    }
  }, [saveToHistory]);

  // Obtener información de conexión
  const getConnectionInfo = useCallback(() => {
    if ('connection' in navigator) {
      const conn = (navigator as Navigator & { connection: NetworkInformation }).connection;
      setConnectionInfo({
        type: conn.type || 'desconocido',
        effectiveType: conn.effectiveType || 'desconocido',
        downlink: conn.downlink || 0,
        rtt: conn.rtt || 0,
        saveData: conn.saveData || false
      });
    }
  }, []);

  useEffect(() => {
    fetchIpInfo();
    getConnectionInfo();
  }, [fetchIpInfo, getConnectionInfo]);

  // Copiar IP al portapapeles
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback para navegadores antiguos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  // Formatear fecha
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Hoy, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Ayer, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    }
  };

  // Obtener bandera de país
  const getCountryFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  // Obtener tipo de conexión legible
  const getConnectionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'wifi': '📶 WiFi',
      'cellular': '📱 Datos móviles',
      'ethernet': '🔌 Ethernet',
      'bluetooth': '🔵 Bluetooth',
      'wimax': '📡 WiMAX',
      'other': '🌐 Otro',
      'none': '❌ Sin conexión',
      'unknown': '❓ Desconocido',
      'desconocido': '❓ Desconocido'
    };
    return types[type.toLowerCase()] || `🌐 ${type}`;
  };

  // Obtener velocidad efectiva legible
  const getEffectiveTypeLabel = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      'slow-2g': { label: '2G Lento', color: '#dc3545' },
      '2g': { label: '2G', color: '#fd7e14' },
      '3g': { label: '3G', color: '#ffc107' },
      '4g': { label: '4G/LTE', color: '#28a745' }
    };
    return types[type] || { label: type, color: '#6c757d' };
  };

  // Limpiar historial
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('meskeIA_ip_history');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>🌐</span>
        <h1 className={styles.title}>Mi IP y Conexión</h1>
        <p className={styles.subtitle}>
          Descubre tu dirección IP pública, ubicación aproximada y datos de tu conexión a internet
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        {/* IP Principal */}
        <section className={styles.ipSection}>
          {isLoading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Obteniendo tu IP...</p>
            </div>
          ) : error ? (
            <div className={styles.error}>
              <span className={styles.errorIcon}>⚠️</span>
              <p>{error}</p>
              <button onClick={fetchIpInfo} className={styles.retryBtn}>
                🔄 Reintentar
              </button>
            </div>
          ) : ipInfo && (
            <>
              <div className={styles.ipCard}>
                <span className={styles.ipLabel}>Tu IP Pública ({ipInfo.version})</span>
                <div className={styles.ipDisplay}>
                  <span className={styles.ipAddress}>{ipInfo.ip}</span>
                  <button
                    onClick={() => copyToClipboard(ipInfo.ip)}
                    className={styles.copyBtn}
                    title="Copiar IP"
                  >
                    {copied ? '✅' : '📋'}
                  </button>
                </div>
                {copied && <span className={styles.copiedMsg}>¡Copiado!</span>}
              </div>

              {ipv6 && ipv6 !== ipInfo.ip && (
                <div className={styles.ipv6Card}>
                  <span className={styles.ipLabel}>IPv6</span>
                  <div className={styles.ipDisplay}>
                    <span className={styles.ipv6Address}>{ipv6}</span>
                    <button
                      onClick={() => copyToClipboard(ipv6)}
                      className={styles.copyBtnSmall}
                      title="Copiar IPv6"
                    >
                      📋
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* Información de ubicación */}
        {ipInfo && ipInfo.city && (
          <section className={styles.locationSection}>
            <h2 className={styles.sectionTitle}>📍 Ubicación aproximada</h2>
            <div className={styles.locationGrid}>
              <div className={styles.locationMain}>
                <span className={styles.countryFlag}>
                  {ipInfo.countryCode && getCountryFlag(ipInfo.countryCode)}
                </span>
                <div className={styles.locationText}>
                  <span className={styles.city}>{ipInfo.city}</span>
                  <span className={styles.region}>{ipInfo.region}, {ipInfo.country}</span>
                </div>
              </div>

              <div className={styles.locationDetails}>
                {ipInfo.zip && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>📮</span>
                    <span className={styles.detailLabel}>Código Postal</span>
                    <span className={styles.detailValue}>{ipInfo.zip}</span>
                  </div>
                )}
                {ipInfo.timezone && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>🕐</span>
                    <span className={styles.detailLabel}>Zona Horaria</span>
                    <span className={styles.detailValue}>{ipInfo.timezone}</span>
                  </div>
                )}
                {ipInfo.lat && ipInfo.lon && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>🗺️</span>
                    <span className={styles.detailLabel}>Coordenadas</span>
                    <span className={styles.detailValue}>
                      {ipInfo.lat.toFixed(2)}°, {ipInfo.lon.toFixed(2)}°
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ISP y Proveedor */}
        {ipInfo && ipInfo.isp && (
          <section className={styles.ispSection}>
            <h2 className={styles.sectionTitle}>🏢 Proveedor de Internet</h2>
            <div className={styles.ispGrid}>
              <div className={styles.ispItem}>
                <span className={styles.ispIcon}>📡</span>
                <div className={styles.ispInfo}>
                  <span className={styles.ispLabel}>ISP</span>
                  <span className={styles.ispValue}>{ipInfo.isp}</span>
                </div>
              </div>
              {ipInfo.org && ipInfo.org !== ipInfo.isp && (
                <div className={styles.ispItem}>
                  <span className={styles.ispIcon}>🏛️</span>
                  <div className={styles.ispInfo}>
                    <span className={styles.ispLabel}>Organización</span>
                    <span className={styles.ispValue}>{ipInfo.org}</span>
                  </div>
                </div>
              )}
              {ipInfo.as && (
                <div className={styles.ispItem}>
                  <span className={styles.ispIcon}>🔢</span>
                  <div className={styles.ispInfo}>
                    <span className={styles.ispLabel}>Sistema Autónomo</span>
                    <span className={styles.ispValue}>{ipInfo.as}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Indicadores de VPN/Proxy */}
            <div className={styles.securityIndicators}>
              <div className={`${styles.indicator} ${ipInfo.proxy ? styles.warning : styles.safe}`}>
                {ipInfo.proxy ? '🔒 Proxy/VPN detectado' : '✅ Sin proxy detectado'}
              </div>
              <div className={`${styles.indicator} ${ipInfo.hosting ? styles.warning : styles.safe}`}>
                {ipInfo.hosting ? '☁️ IP de hosting/datacenter' : '🏠 IP residencial'}
              </div>
            </div>
          </section>
        )}

        {/* Información de conexión */}
        {connectionInfo && (
          <section className={styles.connectionSection}>
            <h2 className={styles.sectionTitle}>📶 Tu Conexión</h2>
            <div className={styles.connectionGrid}>
              <div className={styles.connectionCard}>
                <span className={styles.connectionIcon}>
                  {getConnectionTypeLabel(connectionInfo.type).split(' ')[0]}
                </span>
                <span className={styles.connectionLabel}>Tipo</span>
                <span className={styles.connectionValue}>
                  {getConnectionTypeLabel(connectionInfo.type).split(' ').slice(1).join(' ') || connectionInfo.type}
                </span>
              </div>

              <div className={styles.connectionCard}>
                <span className={styles.connectionIcon}>⚡</span>
                <span className={styles.connectionLabel}>Velocidad Est.</span>
                <span className={styles.connectionValue}>
                  {connectionInfo.downlink > 0 ? `${connectionInfo.downlink} Mbps` : 'N/D'}
                </span>
              </div>

              <div className={styles.connectionCard}>
                <span className={styles.connectionIcon}>⏱️</span>
                <span className={styles.connectionLabel}>Latencia</span>
                <span className={styles.connectionValue}>
                  {connectionInfo.rtt > 0 ? `${connectionInfo.rtt} ms` : 'N/D'}
                </span>
              </div>

              <div className={styles.connectionCard}>
                <span
                  className={styles.connectionIcon}
                  style={{ color: getEffectiveTypeLabel(connectionInfo.effectiveType).color }}
                >
                  📊
                </span>
                <span className={styles.connectionLabel}>Calidad</span>
                <span
                  className={styles.connectionValue}
                  style={{ color: getEffectiveTypeLabel(connectionInfo.effectiveType).color }}
                >
                  {getEffectiveTypeLabel(connectionInfo.effectiveType).label}
                </span>
              </div>
            </div>

            {connectionInfo.saveData && (
              <div className={styles.saveDataWarning}>
                💾 Modo ahorro de datos activado
              </div>
            )}
          </section>
        )}

        {/* Historial de IPs */}
        <section className={styles.historySection}>
          <div className={styles.historyHeader}>
            <h2 className={styles.sectionTitle}>📜 Historial de IPs</h2>
            <div className={styles.historyActions}>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={styles.toggleBtn}
              >
                {showHistory ? '▲ Ocultar' : '▼ Mostrar'} ({history.length})
              </button>
              {history.length > 0 && (
                <button onClick={clearHistory} className={styles.clearBtn}>
                  🗑️ Limpiar
                </button>
              )}
            </div>
          </div>

          {showHistory && (
            <div className={styles.historyList}>
              {history.length === 0 ? (
                <p className={styles.emptyHistory}>
                  Aún no hay historial. Las IPs se guardan localmente cuando visitas esta página.
                </p>
              ) : (
                history.map((entry, index) => (
                  <div key={index} className={styles.historyItem}>
                    <span className={styles.historyIp}>{entry.ip}</span>
                    <span className={styles.historyLocation}>
                      {entry.city && entry.country ? `${entry.city}, ${entry.country}` : ''}
                    </span>
                    <span className={styles.historyTime}>{formatDate(entry.timestamp)}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {/* Botón refrescar */}
        <div className={styles.refreshSection}>
          <button onClick={fetchIpInfo} className={styles.refreshBtn} disabled={isLoading}>
            🔄 Actualizar información
          </button>
        </div>
      </main>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>ℹ️ Sobre esta herramienta</h3>
        <p>
          La ubicación mostrada es <strong>aproximada</strong> y se basa en la geolocalización de tu IP,
          no en tu ubicación real (GPS). La precisión puede variar según tu proveedor de internet.
          Tu historial se guarda <strong>solo en tu navegador</strong> (localStorage) y no se envía a ningún servidor.
        </p>
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre direcciones IP?"
        subtitle="Descubre qué revela tu IP, diferencias entre IPv4 e IPv6, y cómo proteger tu privacidad"
      >
        <div className={styles.educationalContent}>
          <section className={styles.eduSection}>
            <h2>🔢 ¿Qué es una dirección IP?</h2>
            <p>
              Una <strong>dirección IP</strong> (Internet Protocol) es un identificador único que se asigna
              a cada dispositivo conectado a internet. Funciona como tu &quot;dirección postal&quot; en la red,
              permitiendo que otros dispositivos sepan dónde enviar la información que solicitas.
            </p>
            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <h4>🏠 IP Privada</h4>
                <p>
                  Es la que usa tu dispositivo dentro de tu red local (ej: 192.168.1.X).
                  Solo es visible dentro de tu casa u oficina.
                </p>
              </div>
              <div className={styles.infoCard}>
                <h4>🌍 IP Pública</h4>
                <p>
                  Es la que ve el resto de internet. La asigna tu proveedor (ISP) y es la que
                  mostramos en esta página.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.eduSection}>
            <h2>4️⃣ vs 6️⃣ IPv4 vs IPv6</h2>
            <div className={styles.comparisonTable}>
              <div className={styles.compRow}>
                <span className={styles.compLabel}>Formato</span>
                <span className={styles.compIpv4}>192.168.1.1</span>
                <span className={styles.compIpv6}>2001:0db8:85a3::8a2e:0370:7334</span>
              </div>
              <div className={styles.compRow}>
                <span className={styles.compLabel}>Direcciones</span>
                <span className={styles.compIpv4}>~4.300 millones</span>
                <span className={styles.compIpv6}>~340 sextillones</span>
              </div>
              <div className={styles.compRow}>
                <span className={styles.compLabel}>Estado</span>
                <span className={styles.compIpv4}>Agotándose</span>
                <span className={styles.compIpv6}>Abundante</span>
              </div>
            </div>
            <p className={styles.compNote}>
              IPv6 se creó porque las direcciones IPv4 se están agotando. Muchos dispositivos
              ya soportan ambos protocolos.
            </p>
          </section>

          <section className={styles.eduSection}>
            <h2>🔍 ¿Qué revela tu IP?</h2>
            <div className={styles.revealGrid}>
              <div className={styles.revealItem}>
                <span className={styles.revealIcon}>✅</span>
                <span className={styles.revealText}>País y ciudad aproximada</span>
              </div>
              <div className={styles.revealItem}>
                <span className={styles.revealIcon}>✅</span>
                <span className={styles.revealText}>Tu proveedor de internet</span>
              </div>
              <div className={styles.revealItem}>
                <span className={styles.revealIcon}>✅</span>
                <span className={styles.revealText}>Zona horaria</span>
              </div>
              <div className={styles.revealItem}>
                <span className={styles.revealIcon}>❌</span>
                <span className={styles.revealText}>Tu dirección exacta</span>
              </div>
              <div className={styles.revealItem}>
                <span className={styles.revealIcon}>❌</span>
                <span className={styles.revealText}>Tu nombre o identidad</span>
              </div>
              <div className={styles.revealItem}>
                <span className={styles.revealIcon}>❌</span>
                <span className={styles.revealText}>Tu historial de navegación</span>
              </div>
            </div>
          </section>

          <section className={styles.eduSection}>
            <h2>🔄 ¿Por qué cambia mi IP?</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <h4>📡 IP Dinámica</h4>
                <p>
                  La mayoría de conexiones domésticas usan IP dinámica: tu proveedor te asigna
                  una IP diferente cada cierto tiempo o cuando reinicias el router.
                </p>
              </div>
              <div className={styles.infoCard}>
                <h4>🏢 IP Estática</h4>
                <p>
                  Las empresas suelen contratar IP fija para servidores y servicios que necesitan
                  ser siempre accesibles desde la misma dirección.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.eduSection}>
            <h2>🛡️ Protege tu privacidad</h2>
            <div className={styles.tipsList}>
              <div className={styles.tipItem}>
                <span className={styles.tipIcon}>🔒</span>
                <div>
                  <strong>VPN (Red Privada Virtual)</strong>
                  <p>Oculta tu IP real y la reemplaza por la del servidor VPN, cifrando tu tráfico.</p>
                </div>
              </div>
              <div className={styles.tipItem}>
                <span className={styles.tipIcon}>🧅</span>
                <div>
                  <strong>Tor Browser</strong>
                  <p>Enruta tu tráfico por múltiples nodos, haciendo casi imposible rastrear tu IP real.</p>
                </div>
              </div>
              <div className={styles.tipItem}>
                <span className={styles.tipIcon}>📶</span>
                <div>
                  <strong>Proxy</strong>
                  <p>Servidor intermedio que oculta tu IP, aunque con menos seguridad que una VPN.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('mi-ip')} />

      <Footer appName="mi-ip" />
    </div>
  );
}

// Tipos para Network Information API
interface NetworkInformation {
  type: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}
