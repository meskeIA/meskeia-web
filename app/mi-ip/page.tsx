'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './MiIp.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
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
        title="Guía sobre Direcciones IP"
        subtitle="Entiende qué es tu IP, para qué sirve y cómo afecta a tu privacidad online"
        icon="🌐"
      >
        {/* 1. TABLA COMPARATIVA — IPv4 vs IPv6 */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Característica</th>
                <th>IPv4</th>
                <th>IPv6</th>
                <th>IP Pública</th>
                <th>IP Privada</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Formato</td><td>4 grupos de 0-255 (ej: 192.168.1.1)</td><td>8 grupos hexadecimales (ej: 2001:db8::1)</td><td>Visible en internet</td><td>Solo en red local</td></tr>
              <tr><td>Espacio de direcciones</td><td>~4.300 millones</td><td>~340 sextillones</td><td>Asignada por ISP</td><td>Asignada por router</td></tr>
              <tr><td>Estado</td><td>Casi agotado</td><td>Prácticamente ilimitado</td><td>Única en internet</td><td>Repetida en millones de redes</td></tr>
              <tr><td>Geolocalización</td><td>Aproximada (ciudad/región)</td><td>Aproximada (ciudad/región)</td><td>Geolocalizable</td><td>No geolocalizable</td></tr>
              <tr><td>Mutabilidad</td><td>Dinámica o estática</td><td>Dinámica o estática</td><td>Cambia con reinicio del router</td><td>Cambia con cada conexión</td></tr>
            </tbody>
          </table>
        </div>

        {/* 2. CASOS DE USO */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🔧</span>
              <strong>Administrador de Sistemas</strong>
            </div>
            <p>Verifica la IP pública del servidor o de la red corporativa para configurar reglas de firewall, acceso remoto, VPN y whitelisting en servicios externos o APIs con restricción por IP.</p>
            <div className={styles.escenarioTip}>Tip: Si tu IP pública cambia frecuentemente, considera un servicio de DNS dinámico (DynDNS, No-IP) para mantener un nombre de dominio apuntando siempre a tu IP actual.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🛡️</span>
              <strong>Usuario preocupado por la privacidad</strong>
            </div>
            <p>Comprueba qué información revela tu IP: país, ciudad aproximada, ISP y organización. Evalúa si necesitas una VPN para proteger tu identidad en actividades sensibles online.</p>
            <div className={styles.escenarioTip}>Tip: Tu IP revela ciudad y ISP, no tu dirección exacta. Sin embargo, los servicios online pueden combinarla con otras señales (cookies, fingerprint) para identificarte.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>👨‍💻</span>
              <strong>Desarrollador Web</strong>
            </div>
            <p>Consulta tu IP para probar reglas de geolocalización, restricciones por país o configuraciones de CDN en tus aplicaciones. Verifica que el tráfico se enruta correctamente desde tu región.</p>
            <div className={styles.escenarioTip}>Tip: Las APIs de geolocalización por IP (ipinfo.io, ip-api.com) tienen limitaciones de precisión: funcionan a nivel ciudad/región, nunca a nivel calle o edificio.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🎮</span>
              <strong>Gamer / Streamer</strong>
            </div>
            <p>Verifica tu IP antes de compartir streams o conectarte a servidores de juego para evitar exponer tu ubicación real. Comprueba si tu ISP te asigna IP estática (mejor para hosting de servidores) o dinámica.</p>
            <div className={styles.escenarioTip}>Tip: Nunca compartas tu IP pública en streams o partidas online. Puede usarse para ataques DDoS que saturan tu conexión.</div>
          </div>
        </div>

        {/* 3. FAQ */}
        <details className={styles.faqList}>
          <summary className={styles.faqItem} style={{listStyle:'none', cursor:'pointer', fontWeight:600, fontSize:'1.1rem', padding:'0.75rem 0'}}>❓ Preguntas Frecuentes sobre Direcciones IP</summary>
          <div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Puede alguien saber mi dirección exacta a través de mi IP?</div>
              <div className={styles.faqRespuesta}>No directamente. Tu IP revela el país, ciudad aproximada (con margen de 20-50 km habitualmente) y tu proveedor de internet (ISP). Tu dirección física exacta solo puede obtenerse a través de tu ISP mediante una orden judicial. Las herramientas públicas de geolocalización por IP son inexactas a nivel de calle.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué diferencia hay entre IP pública e IP privada?</div>
              <div className={styles.faqRespuesta}>La IP pública es la que ve el exterior de internet: la asigna tu ISP y es única globalmente. La IP privada es la que asigna tu router dentro de tu red local (192.168.x.x, 10.x.x.x o 172.16-31.x.x). Millones de dispositivos comparten los mismos rangos privados, pero cada uno tiene una IP pública diferente.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Por qué mi IP cambia a veces sola?</div>
              <div className={styles.faqRespuesta}>La mayoría de ISP asignan IPs dinámicas: cambian cuando reinicias el router, tras cierto tiempo de conexión o cuando el ISP reasigna su pool de IPs. Las IPs estáticas (siempre la misma) son un servicio premium que generalmente se paga aparte, más útil para servidores y accesos remotos.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Una VPN oculta completamente mi IP?</div>
              <div className={styles.faqRespuesta}>La VPN sustituye tu IP real por la del servidor VPN. Los sitios web ven la IP del servidor VPN, no la tuya. Sin embargo, tu ISP sigue viendo que te conectas al servidor VPN (aunque no qué haces). Las fugas de IP (WebRTC leaks) pueden revelar tu IP real incluso con VPN activa; compruébalas periódicamente.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué son las IPs reservadas y por qué no se usan en internet?</div>
              <div className={styles.faqRespuesta}>Los rangos privados (RFC 1918): 10.0.0.0/8, 172.16.0.0/12 y 192.168.0.0/16 están reservados para redes locales y los routers nunca los enrutan hacia internet. También existen rangos especiales: 127.0.0.1 (loopback/localhost), 169.254.x.x (APIPA, cuando falla el DHCP) y 0.0.0.0 (red actual).</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Por qué están agotándose las IPs IPv4?</div>
              <div className={styles.faqRespuesta}>IPv4 tiene 32 bits, lo que da 2³² = ~4.300 millones de direcciones. Con 8.000 millones de personas y miles de millones de dispositivos IoT, el espacio se agotó. La solución a corto plazo es NAT (múltiples dispositivos comparten una IP pública). IPv6 con 128 bits resuelve el problema definitivamente con 2¹²⁸ direcciones.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Pueden bloquearme en servicios web por mi IP?</div>
              <div className={styles.faqRespuesta}>Sí. Los servicios web pueden bloquear IPs individuales, rangos de IPs o países enteros. Las causas más comunes: abuso de la plataforma, demasiadas peticiones (rate limiting), uso de VPN/Tor (algunos servicios los bloquean por política) o restricciones geográficas de contenido (geoblocking).</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué es el ISP y qué información tiene de mí?</div>
              <div className={styles.faqRespuesta}>El ISP (Proveedor de Servicios de Internet) es tu operadora de internet (Movistar, Orange, Vodafone, etc.). Sabe tu dirección física, tiene registros de qué IPs usaste y cuándo, y técnicamente puede ver (aunque no siempre lo hace) a qué dominios te conectas. En España, el RGPD limita cómo pueden usar estos datos.</div>
            </div>
          </div>
        </details>

        {/* 4. GUÍA PASO A PASO */}
        <ol className={styles.pasosList}>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>1</span>
            <div><strong>Consulta tu IP pública actual</strong> — Esta herramienta te muestra la IP pública con la que navegas ahora mismo. Es la IP que ven los servidores a los que te conectas.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>2</span>
            <div><strong>Revisa la información de geolocalización</strong> — Comprueba el país, región y ciudad detectados. Verifica si coincide con tu ubicación real o si hay discrepancias (frecuente con IPs de ISP que tienen nodos en otra ciudad).</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>3</span>
            <div><strong>Identifica tu ISP</strong> — El nombre del operador de internet que aparece es tu ISP. Útil para verificar que estás en la red correcta o para identificar si estás usando una VPN (aparecerá el proveedor VPN en lugar de tu ISP real).</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>4</span>
            <div><strong>Nota el tipo de IP (IPv4 o IPv6)</strong> — La mayoría de conexiones muestran IPv4. Si ves una dirección con formato hexadecimal, tu ISP ya te asigna IPv6. Algunos servicios y herramientas de diagnóstico de red necesitan saber el tipo de IP.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>5</span>
            <div><strong>Evalúa si necesitas protección adicional</strong> — Si la geolocalización es precisa o si te preocupa la privacidad para ciertas actividades online, considera usar una VPN de confianza para sustituir tu IP real por la del servidor VPN.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>6</span>
            <div><strong>Comprueba tu IP privada si necesitas configurar la red local</strong> — En Windows: ipconfig. En Mac/Linux: ifconfig o ip addr. La IP privada es la que usan otros dispositivos de tu red local para comunicarse contigo.</div>
          </li>
        </ol>

        {/* 5. TIPS GRID */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🔒</span>
            <strong>No compartas tu IP</strong>
            <p>Evita compartir tu IP pública en foros, chats o juegos online. Con tu IP y herramientas básicas se puede intentar un ataque DDoS o explorar puertos abiertos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🌍</span>
            <strong>VPN ≠ anonimato total</strong>
            <p>Una VPN cambia tu IP pero no te hace completamente anónimo. Las cookies, fingerprinting del navegador y cuentas logueadas también identifican a los usuarios.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>⚡</span>
            <strong>IP estática para servidores</strong>
            <p>Si hospeadas un servidor web, de juegos o un sistema de cámaras en casa, una IP estática (de pago con tu ISP) simplifica mucho la configuración y el acceso remoto.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🔄</span>
            <strong>Cambiar IP dinámica</strong>
            <p>Para cambiar tu IP dinámica: apaga el router 5-10 minutos. Si el ISP asigna IPs por tiempo de arrendamiento (lease time), tras reiniciar puede asignarte una distinta.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🛡️</span>
            <strong>Comprueba fugas WebRTC</strong>
            <p>Con VPN activa, los navegadores pueden filtrar tu IP real a través de WebRTC. Comprueba periódicamente que no tienes fugas desactivando WebRTC en el navegador o con extensiones.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>📍</span>
            <strong>Geolocalización ≠ ubicación exacta</strong>
            <p>La geolocalización por IP tiene una precisión de ciudad o región, con errores frecuentes de decenas de kilómetros. No se usa para encontrar personas, sino para segmentar servicios.</p>
          </div>
        </div>

        {/* 6. WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcono}>⚠️</span>
            <strong>Lo que tu IP revela (y lo que no) sobre ti</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Revela: país, ciudad aproximada e ISP</strong> — Esta información es pública y accesible a cualquier servidor al que te conectes. No hay forma de ocultarla sin VPN o proxy.</li>
            <li><strong>No revela: tu dirección física exacta</strong> — Nadie puede encontrar tu casa solo con tu IP. Solo tu ISP tiene esa asociación y solo la facilita a autoridades con orden judicial.</li>
            <li><strong>Los sitios registran tu IP en sus logs</strong> — Cada petición HTTP queda registrada con tu IP, timestamp y recurso solicitado. Esto es legal y estándar en toda la web.</li>
            <li><strong>Una VPN gratuita puede ser peor que no tener VPN</strong> — Muchos proveedores VPN gratuitos monetizan tus datos de navegación, que es exactamente lo que intentas proteger. Usa VPNs de pago con política de no-logs auditada.</li>
            <li><strong>El anonimato total en internet no existe</strong> — Incluso con VPN, Tor y todas las protecciones, los comportamientos de navegación, fingerprinting del dispositivo y metadatos pueden correlacionarse para identificar usuarios con suficiente motivación y recursos.</li>
            <li><strong>RGPD y tu IP en España</strong> — Según el RGPD, la IP es un dato personal. Los sitios web deben informarte de que la registran (política de privacidad) y conservarla solo el tiempo necesario para su finalidad legítima.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('mi-ip')} />

      <ShareCard appName="mi-ip" />
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
