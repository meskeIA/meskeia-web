'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './RedesComputadoras.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type TabActiva = 'tcpip' | 'dns' | 'routing' | 'cdn';

interface CapaTCPIP {
  id: number;
  nombre: string;
  color: string;
  colorOscuro: string;
  pdu: string;
  protocolos: string[];
  funcion: string;
  osiCapas: string;
}

interface PasoEncapsulamiento {
  label: string;
  descripcion: string;
  color: string;
}

interface PasoDNS {
  actor: string;
  mensaje: string;
  color: string;
}

interface Router {
  id: string;
  x: number;
  y: number;
  as: number;
  nombre: string;
}

interface Enlace {
  desde: string;
  hasta: string;
  coste: number;
}

interface NodoCDN {
  id: string;
  nombre: string;
  x: number;
  y: number;
  latenciaBase: number;
  usuarios: string;
}

// ─────────────────────────────────────────────
// Datos TCP/IP
// ─────────────────────────────────────────────

const CAPAS_TCPIP: CapaTCPIP[] = [
  {
    id: 4,
    nombre: 'Aplicación',
    color: '#2E86AB',
    colorOscuro: '#1a5f80',
    pdu: 'Datos / Mensaje',
    protocolos: ['HTTP/3', 'HTTPS', 'DNS', 'SMTP', 'FTP', 'SSH', 'WebSocket'],
    funcion: 'Interfaz entre aplicaciones y la red. Define los protocolos de alto nivel que usan los programas (navegadores, clientes de correo, etc.).',
    osiCapas: 'Capas OSI 5 (Sesión) + 6 (Presentación) + 7 (Aplicación)',
  },
  {
    id: 3,
    nombre: 'Transporte',
    color: '#48A9A6',
    colorOscuro: '#2d7a78',
    pdu: 'Segmento (TCP) / Datagrama (UDP)',
    protocolos: ['TCP', 'UDP', 'QUIC', 'SCTP'],
    funcion: 'Control de flujo, fiabilidad y multiplexación mediante puertos. TCP garantiza entrega ordenada; UDP prioriza velocidad sin garantías.',
    osiCapas: 'Capa OSI 4 (Transporte)',
  },
  {
    id: 2,
    nombre: 'Internet',
    color: '#7FB3D3',
    colorOscuro: '#4d8ab0',
    pdu: 'Paquete IP',
    protocolos: ['IPv4', 'IPv6', 'ICMP', 'IGMP', 'IPsec', 'ARP'],
    funcion: 'Direccionamiento lógico y enrutamiento. Los routers operan en esta capa para llevar paquetes de origen a destino a través de múltiples redes.',
    osiCapas: 'Capa OSI 3 (Red)',
  },
  {
    id: 1,
    nombre: 'Enlace',
    color: '#A8D5BA',
    colorOscuro: '#5a9e78',
    pdu: 'Trama (Frame)',
    protocolos: ['Ethernet', 'Wi-Fi (802.11)', 'PPP', 'VLAN', 'ARP'],
    funcion: 'Transmisión de tramas entre nodos directamente conectados. Usa direcciones MAC para identificar dispositivos en la misma red local.',
    osiCapas: 'Capas OSI 1 (Física) + 2 (Enlace de Datos)',
  },
];

const PASOS_ENCAPSULAMIENTO: PasoEncapsulamiento[] = [
  { label: 'Datos de aplicación', descripcion: 'El usuario quiere visitar meskeia.com. El navegador genera la solicitud HTTP.', color: '#2E86AB' },
  { label: '+ Cabecera TCP', descripcion: 'La capa Transporte añade cabecera TCP: puerto origen (52341) → puerto destino (443). Número de secuencia y ACK para fiabilidad.', color: '#48A9A6' },
  { label: '+ Cabecera IP', descripcion: 'La capa Internet añade cabecera IP: IP origen (192.168.1.10) → IP destino (185.199.110.153). TTL=64.', color: '#7FB3D3' },
  { label: '+ Cabecera + Cola Ethernet', descripcion: 'La capa Enlace envuelve el paquete en una trama Ethernet con MAC origen y MAC destino (del router). Añade FCS al final.', color: '#A8D5BA' },
  { label: 'Bits en el medio', descripcion: 'La trama se convierte en señales eléctricas, ópticas o radio y viaja por el medio físico hasta el siguiente nodo.', color: '#666666' },
];

// ─────────────────────────────────────────────
// Datos DNS
// ─────────────────────────────────────────────

const PASOS_DNS: PasoDNS[] = [
  { actor: 'Navegador', mensaje: 'El usuario escribe "www.meskeia.com". El navegador consulta su caché local. ¿Hay respuesta? No → siguiente paso.', color: '#2E86AB' },
  { actor: 'Resolver Local (ISP)', mensaje: 'El resolver del ISP recibe la consulta. Consulta su caché. ¿Hay respuesta? No → pregunta al Root Server.', color: '#48A9A6' },
  { actor: '→ Root Server', mensaje: 'El resolver pregunta al Root Server: "¿quién sabe de .com?". El Root responde con la dirección de los servidores TLD de .com.', color: '#7FB3D3' },
  { actor: '→ TLD Server (.com)', mensaje: 'El resolver pregunta al servidor TLD .com: "¿quién tiene autoridad sobre meskeia.com?". Responde con el NS autoritativo.', color: '#A8D5BA' },
  { actor: '→ Authoritative Server', mensaje: 'El resolver pregunta al servidor autoritativo de meskeia.com: "¿cuál es la IP de www.meskeia.com?". Responde con el registro A: 185.199.110.153.', color: '#48A9A6' },
  { actor: 'Resolver → Navegador', mensaje: 'El resolver devuelve la IP al navegador y la guarda en caché con su TTL. El navegador se conecta a 185.199.110.153 por TCP/HTTPS.', color: '#2E86AB' },
];

// ─────────────────────────────────────────────
// Datos Routing
// ─────────────────────────────────────────────

const ROUTERS: Router[] = [
  { id: 'R1', x: 80,  y: 150, as: 1, nombre: 'AS1-R1 (Madrid)' },
  { id: 'R2', x: 220, y: 80,  as: 1, nombre: 'AS1-R2 (Barcelona)' },
  { id: 'R3', x: 360, y: 150, as: 2, nombre: 'AS2-R3 (París)' },
  { id: 'R4', x: 220, y: 240, as: 2, nombre: 'AS2-R4 (Lyon)' },
  { id: 'R5', x: 480, y: 220, as: 3, nombre: 'AS3-R5 (Frankfurt)' },
];

const ENLACES: Enlace[] = [
  { desde: 'R1', hasta: 'R2', coste: 2 },
  { desde: 'R1', hasta: 'R4', coste: 4 },
  { desde: 'R2', hasta: 'R3', coste: 3 },
  { desde: 'R2', hasta: 'R4', coste: 2 },
  { desde: 'R3', hasta: 'R5', coste: 2 },
  { desde: 'R4', hasta: 'R3', coste: 3 },
  { desde: 'R4', hasta: 'R5', coste: 5 },
];

function dijkstra(origen: string, destino: string): string[] {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visitados = new Set<string>();

  ROUTERS.forEach(r => { dist[r.id] = Infinity; prev[r.id] = null; });
  dist[origen] = 0;

  while (true) {
    let u: string | null = null;
    let menorDist = Infinity;
    ROUTERS.forEach(r => {
      if (!visitados.has(r.id) && dist[r.id] < menorDist) {
        menorDist = dist[r.id];
        u = r.id;
      }
    });
    if (u === null || u === destino) break;
    visitados.add(u);

    ENLACES.forEach(e => {
      const vecino = e.desde === u ? e.hasta : (e.hasta === u ? e.desde : null);
      if (vecino && !visitados.has(vecino)) {
        const alt = dist[u!] + e.coste;
        if (alt < dist[vecino]) {
          dist[vecino] = alt;
          prev[vecino] = u;
        }
      }
    });
  }

  const camino: string[] = [];
  let actual: string | null = destino;
  while (actual !== null) {
    camino.unshift(actual);
    actual = prev[actual];
  }
  return camino[0] === origen ? camino : [];
}

// ─────────────────────────────────────────────
// Datos CDN
// ─────────────────────────────────────────────

const ORIGEN_SERVIDOR = { x: 280, y: 180, nombre: 'Origen (España)' };

const NODOS_CDN: NodoCDN[] = [
  { id: 'us', nombre: 'EEUU Este', x: 120, y: 120, latenciaBase: 85, usuarios: '~300M' },
  { id: 'br', nombre: 'Brasil',    x: 175, y: 240, latenciaBase: 130, usuarios: '~215M' },
  { id: 'uk', nombre: 'UK',        x: 235, y: 80,  latenciaBase: 18,  usuarios: '~67M' },
  { id: 'de', nombre: 'Alemania',  x: 295, y: 75,  latenciaBase: 22,  usuarios: '~84M' },
  { id: 'in', nombre: 'India',     x: 430, y: 165, latenciaBase: 90,  usuarios: '~1.400M' },
  { id: 'jp', nombre: 'Japón',     x: 490, y: 115, latenciaBase: 155, usuarios: '~125M' },
];

// ─────────────────────────────────────────────
// Componente Principal
// ─────────────────────────────────────────────

export default function VisualizadorRedesComputadoras() {
  const [tabActiva, setTabActiva] = useState<TabActiva>('tcpip');
  const [capaSeleccionada, setCapaSeleccionada] = useState<number | null>(null);
  const [pasoEncapsulamiento, setPasoEncapsulamiento] = useState(0);
  const [pasoDns, setPasoDns] = useState(0);
  const [origenRouting, setOrigenRouting] = useState<string>('R1');
  const [destinoRouting, setDestinoRouting] = useState<string>('R5');
  const [usuariosCDN, setUsuariosCDN] = useState(1000000);
  const [modoCDN, setModoCDN] = useState<'sin' | 'con'>('sin');

  const camino = dijkstra(origenRouting, destinoRouting);

  const enCamino = useCallback(
    (desde: string, hasta: string) =>
      camino.some(
        (n, i) => i < camino.length - 1 &&
          ((camino[i] === desde && camino[i + 1] === hasta) ||
           (camino[i] === hasta && camino[i + 1] === desde))
      ),
    [camino]
  );

  const latenciaCDN = (nodo: NodoCDN) => {
    if (modoCDN === 'con') return nodo.latenciaBase;
    // Sin CDN: todos los usuarios van al servidor origen en España
    return nodo.latenciaBase + Math.round(nodo.latenciaBase * 0.6);
  };

  const factorCarga = Math.min(1 + Math.log10(usuariosCDN / 1000) * 0.15, 2);

  return (
    <div className={styles.container}>

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Redes de Computadoras</h1>
        <p>Visualiza cómo funciona internet: TCP/IP, DNS, Routing BGP y CDN — con animaciones interactivas</p>
      </header>

      <LegalNotice />

      {/* ── Tabs ── */}
      <nav className={styles.tabs} aria-label="Secciones del visualizador">
        {(
          [
            { id: 'tcpip',   label: '🧱 Modelo TCP/IP' },
            { id: 'dns',     label: '🔍 DNS' },
            { id: 'routing', label: '🗺️ Routing BGP' },
            { id: 'cdn',     label: '🌐 CDN y Latencia' },
          ] as { id: TabActiva; label: string }[]
        ).map(tab => (
          <button
            key={tab.id}
            onClick={() => setTabActiva(tab.id)}
            className={`${styles.tab} ${tabActiva === tab.id ? styles.tabActiva : ''}`}
            aria-pressed={tabActiva === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ═══════════════════════════════════════ */}
      {/* TAB 1: TCP/IP                          */}
      {/* ═══════════════════════════════════════ */}
      {tabActiva === 'tcpip' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Modelo TCP/IP — Las 4 Capas</h2>
          <p className={styles.intro}>
            Haz clic en cada capa para ver sus protocolos, PDU y función. Luego usa el simulador de encapsulamiento.
          </p>

          {/* Diagrama de capas SVG */}
          <div className={styles.capasSVGWrapper}>
            {CAPAS_TCPIP.map(capa => (
              <button
                key={capa.id}
                className={`${styles.capaBtn} ${capaSeleccionada === capa.id ? styles.capaActiva : ''}`}
                style={{ '--color-capa': capa.color } as React.CSSProperties}
                onClick={() => setCapaSeleccionada(capaSeleccionada === capa.id ? null : capa.id)}
                aria-pressed={capaSeleccionada === capa.id}
              >
                <span className={styles.capaNumero}>{capa.id}</span>
                <span className={styles.capaNombre}>{capa.nombre}</span>
                <span className={styles.capaPdu}>{capa.pdu}</span>
                <span className={styles.capaFlecha}>▼</span>
              </button>
            ))}
          </div>

          {/* Panel detalle capa */}
          {capaSeleccionada !== null && (() => {
            const capa = CAPAS_TCPIP.find(c => c.id === capaSeleccionada);
            if (!capa) return null;
            return (
              <div className={styles.capaDetalle} style={{ borderLeftColor: capa.color }}>
                <h3 style={{ color: capa.color }}>Capa {capa.id}: {capa.nombre}</h3>
                <p><strong>PDU:</strong> {capa.pdu}</p>
                <p><strong>Función:</strong> {capa.funcion}</p>
                <div className={styles.protocolosLista}>
                  <strong>Protocolos:</strong>
                  {capa.protocolos.map(p => (
                    <span key={p} className={styles.protocoloBadge} style={{ backgroundColor: capa.color }}>{p}</span>
                  ))}
                </div>
                <p className={styles.osiRelacion}><strong>Equivalencia OSI:</strong> {capa.osiCapas}</p>
              </div>
            );
          })()}

          {/* Encapsulamiento */}
          <div className={styles.encapsulamientoBox}>
            <h3>Simulación de Encapsulamiento</h3>
            <p className={styles.introSmall}>
              Así viajan los datos cuando tu navegador pide una página web:
            </p>

            <div className={styles.pasosDiagrama}>
              {PASOS_ENCAPSULAMIENTO.map((paso, idx) => (
                <div
                  key={idx}
                  className={`${styles.pasoEnvoltorio} ${pasoEncapsulamiento >= idx ? styles.pasoActivo : ''}`}
                  style={{ '--color-paso': paso.color } as React.CSSProperties}
                >
                  <div className={styles.pasoEtiqueta}>{paso.label}</div>
                  {pasoEncapsulamiento === idx && (
                    <div className={styles.pasoDescripcion}>{paso.descripcion}</div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.encapsulamientoBtns}>
              <button
                className={styles.btnSecundario}
                onClick={() => setPasoEncapsulamiento(p => Math.max(0, p - 1))}
                disabled={pasoEncapsulamiento === 0}
                aria-label="Paso anterior del encapsulamiento"
              >
                ← Anterior
              </button>
              <span className={styles.pasoContador}>
                Paso {pasoEncapsulamiento + 1} / {PASOS_ENCAPSULAMIENTO.length}
              </span>
              <button
                className={styles.btnPrimario}
                onClick={() => setPasoEncapsulamiento(p => Math.min(PASOS_ENCAPSULAMIENTO.length - 1, p + 1))}
                disabled={pasoEncapsulamiento === PASOS_ENCAPSULAMIENTO.length - 1}
                aria-label="Siguiente paso del encapsulamiento"
              >
                Siguiente →
              </button>
            </div>
          </div>

          {/* Comparativa OSI */}
          <h3 className={styles.subtitulo}>Comparativa: TCP/IP vs Modelo OSI</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Capa OSI</th>
                  <th>Nombre OSI</th>
                  <th>Capa TCP/IP</th>
                  <th>PDU</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>7</td><td>Aplicación</td><td rowSpan={3} className={styles.tcpipCeldaSpan} style={{ backgroundColor: '#2E86AB22' }}>Aplicación</td><td rowSpan={3}>Datos/Mensaje</td></tr>
                <tr><td>6</td><td>Presentación</td></tr>
                <tr><td>5</td><td>Sesión</td></tr>
                <tr><td>4</td><td>Transporte</td><td style={{ backgroundColor: '#48A9A622' }}>Transporte</td><td>Segmento/Datagrama</td></tr>
                <tr><td>3</td><td>Red</td><td style={{ backgroundColor: '#7FB3D322' }}>Internet</td><td>Paquete IP</td></tr>
                <tr><td>2</td><td>Enlace de Datos</td><td rowSpan={2} className={styles.tcpipCeldaSpan} style={{ backgroundColor: '#A8D5BA22' }}>Enlace</td><td rowSpan={2}>Trama / Bits</td></tr>
                <tr><td>1</td><td>Física</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* TAB 2: DNS                             */}
      {/* ═══════════════════════════════════════ */}
      {tabActiva === 'dns' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>DNS — La Resolución de Nombres</h2>
          <p className={styles.intro}>
            El DNS es el "directorio telefónico" de internet: convierte nombres (www.meskeia.com) en direcciones IP (185.199.110.153).
          </p>

          {/* Diagrama animado paso a paso */}
          <div className={styles.dnsBox}>
            <h3>Resolución Iterativa — Paso a Paso</h3>

            <div className={styles.dnsDiagrama}>
              {PASOS_DNS.map((paso, idx) => (
                <div
                  key={idx}
                  className={`${styles.dnsPaso} ${idx <= pasoDns ? styles.dnsPasoActivo : ''} ${idx === pasoDns ? styles.dnsPasoActual : ''}`}
                  style={{ '--color-dns': paso.color } as React.CSSProperties}
                >
                  <div className={styles.dnsActor}>
                    <span className={styles.dnsNum}>{idx + 1}</span>
                    {paso.actor}
                  </div>
                  {idx <= pasoDns && (
                    <div className={styles.dnsMensaje}>{paso.mensaje}</div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.encapsulamientoBtns}>
              <button
                className={styles.btnSecundario}
                onClick={() => setPasoDns(p => Math.max(0, p - 1))}
                disabled={pasoDns === 0}
                aria-label="Paso anterior de DNS"
              >
                ← Anterior
              </button>
              <span className={styles.pasoContador}>Paso {pasoDns + 1} / {PASOS_DNS.length}</span>
              <button
                className={styles.btnPrimario}
                onClick={() => setPasoDns(p => Math.min(PASOS_DNS.length - 1, p + 1))}
                disabled={pasoDns === PASOS_DNS.length - 1}
                aria-label="Siguiente paso de DNS"
              >
                Siguiente →
              </button>
            </div>
          </div>

          {/* Tipos de registros DNS */}
          <h3 className={styles.subtitulo}>Tipos de Registros DNS</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Nombre</th>
                  <th>Función</th>
                  <th>Ejemplo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className={styles.badge} style={{ backgroundColor: '#2E86AB' }}>A</span></td>
                  <td>Address</td>
                  <td>Nombre → IPv4</td>
                  <td>meskeia.com → 185.199.110.153</td>
                </tr>
                <tr>
                  <td><span className={styles.badge} style={{ backgroundColor: '#48A9A6' }}>AAAA</span></td>
                  <td>IPv6 Address</td>
                  <td>Nombre → IPv6</td>
                  <td>meskeia.com → 2606:50c0::153</td>
                </tr>
                <tr>
                  <td><span className={styles.badge} style={{ backgroundColor: '#7FB3D3' }}>CNAME</span></td>
                  <td>Canonical Name</td>
                  <td>Alias → nombre canónico</td>
                  <td>www.meskeia.com → meskeia.com</td>
                </tr>
                <tr>
                  <td><span className={styles.badge} style={{ backgroundColor: '#A8D5BA' }}>MX</span></td>
                  <td>Mail Exchange</td>
                  <td>Servidor de correo</td>
                  <td>meskeia.com → mail.proton.me (prioridad 10)</td>
                </tr>
                <tr>
                  <td><span className={styles.badge} style={{ backgroundColor: '#666' }}>TXT</span></td>
                  <td>Text</td>
                  <td>Texto libre (SPF, DKIM, verificación)</td>
                  <td>v=spf1 include:_spf.google.com ~all</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Recursiva vs Iterativa */}
          <div className={styles.comparativaBox}>
            <div className={styles.comparativaItem}>
              <h4>Resolución Iterativa</h4>
              <p>El resolver pregunta a cada servidor. Cada servidor responde con "pregunta a este otro". El resolver hace todo el trabajo de consultar Root → TLD → Autoritativo.</p>
              <p className={styles.comparativaVentaja}>Usado por la mayoría de resolvers públicos (8.8.8.8, 1.1.1.1).</p>
            </div>
            <div className={styles.comparativaItem}>
              <h4>Resolución Recursiva</h4>
              <p>El cliente pregunta al resolver local y se desentiende. El resolver hace todas las consultas y devuelve la respuesta final. El cliente no sabe qué pasos intermedios ocurrieron.</p>
              <p className={styles.comparativaVentaja}>Modelo usado por el navegador hacia el resolver del ISP.</p>
            </div>
          </div>

          <div className={styles.infoBox}>
            <strong>TTL (Time To Live):</strong> Cada registro DNS tiene un TTL en segundos. Indica cuánto tiempo puede cachear el resolver la respuesta antes de volver a preguntar. Un TTL de 3600 = el resultado se puede usar durante 1 hora sin nuevas consultas.
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* TAB 3: ROUTING                         */}
      {/* ═══════════════════════════════════════ */}
      {tabActiva === 'routing' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Routing y BGP — Cómo Viajan los Paquetes</h2>
          <p className={styles.intro}>
            Selecciona origen y destino para ver el camino óptimo (algoritmo de Dijkstra simplificado) entre 3 Sistemas Autónomos (AS).
          </p>

          {/* Controles */}
          <div className={styles.routingControles}>
            <label className={styles.routingLabel}>
              Origen:
              <select
                value={origenRouting}
                onChange={e => setOrigenRouting(e.target.value)}
                className={styles.select}
                aria-label="Router origen"
              >
                {ROUTERS.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
            </label>
            <span className={styles.routingFlecha}>→</span>
            <label className={styles.routingLabel}>
              Destino:
              <select
                value={destinoRouting}
                onChange={e => setDestinoRouting(e.target.value)}
                className={styles.select}
                aria-label="Router destino"
              >
                {ROUTERS.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Diagrama SVG */}
          <div className={styles.svgWrapper}>
            <svg viewBox="0 0 580 320" className={styles.routingSVG} aria-label="Diagrama de red con routers y enlaces">
              {/* AS backgrounds */}
              <rect x="20"  y="20"  width="260" height="260" rx="16" fill="#2E86AB11" stroke="#2E86AB" strokeWidth="1.5" strokeDasharray="6 4" />
              <rect x="300" y="20"  width="180" height="260" rx="16" fill="#48A9A611" stroke="#48A9A6" strokeWidth="1.5" strokeDasharray="6 4" />
              <rect x="450" y="60"  width="110" height="180" rx="16" fill="#7FB3D311" stroke="#7FB3D3" strokeWidth="1.5" strokeDasharray="6 4" />
              <text x="30"  y="42"  fontSize="11" fill="#2E86AB" fontWeight="bold">AS 1</text>
              <text x="310" y="42"  fontSize="11" fill="#48A9A6" fontWeight="bold">AS 2</text>
              <text x="460" y="82"  fontSize="11" fill="#7FB3D3" fontWeight="bold">AS 3</text>

              {/* Enlaces */}
              {ENLACES.map(e => {
                const desde = ROUTERS.find(r => r.id === e.desde)!;
                const hasta  = ROUTERS.find(r => r.id === e.hasta)!;
                const activo = enCamino(e.desde, e.hasta);
                return (
                  <g key={`${e.desde}-${e.hasta}`}>
                    <line
                      x1={desde.x} y1={desde.y}
                      x2={hasta.x}  y2={hasta.y}
                      stroke={activo ? '#F4A261' : '#cccccc'}
                      strokeWidth={activo ? 4 : 2}
                    />
                    <text
                      x={(desde.x + hasta.x) / 2}
                      y={(desde.y + hasta.y) / 2 - 6}
                      fontSize="10"
                      fill={activo ? '#F4A261' : '#999'}
                      textAnchor="middle"
                      fontWeight={activo ? 'bold' : 'normal'}
                    >
                      {e.coste}ms
                    </text>
                  </g>
                );
              })}

              {/* Nodos */}
              {ROUTERS.map(r => {
                const enRuta = camino.includes(r.id);
                const esOrigen = r.id === origenRouting;
                const esDestino = r.id === destinoRouting;
                const color = r.as === 1 ? '#2E86AB' : r.as === 2 ? '#48A9A6' : '#7FB3D3';
                return (
                  <g key={r.id}>
                    <circle
                      cx={r.x} cy={r.y} r={24}
                      fill={enRuta ? '#F4A261' : color}
                      stroke={esOrigen || esDestino ? '#fff' : color}
                      strokeWidth={esOrigen || esDestino ? 3 : 1}
                    />
                    <text x={r.x} y={r.y + 5} fontSize="12" textAnchor="middle" fill="#fff" fontWeight="bold">
                      {r.id}
                    </text>
                    <text x={r.x} y={r.y + 38} fontSize="10" textAnchor="middle" fill="#555">
                      {esOrigen ? '🟢 Origen' : esDestino ? '🔴 Destino' : ''}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Resultado ruta */}
          {camino.length > 0 ? (
            <div className={styles.rutaResultado}>
              <strong>Ruta óptima:</strong>{' '}
              {camino.join(' → ')}{' '}
              <span className={styles.rutaCoste}>
                ({camino.slice(0, -1).reduce((acc, id, i) => {
                  const enlace = ENLACES.find(e =>
                    (e.desde === id && e.hasta === camino[i + 1]) ||
                    (e.hasta === id && e.desde === camino[i + 1])
                  );
                  return acc + (enlace?.coste ?? 0);
                }, 0)} ms total)
              </span>
            </div>
          ) : (
            <div className={styles.rutaResultado}>No hay ruta entre los nodos seleccionados.</div>
          )}

          {/* Tabla de enrutamiento */}
          <h3 className={styles.subtitulo}>Tabla de Enrutamiento — Router seleccionado: {origenRouting}</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr><th>Destino</th><th>Máscara</th><th>Gateway</th><th>Interfaz</th><th>Métrica</th></tr>
              </thead>
              <tbody>
                {ROUTERS.filter(r => r.id !== origenRouting).map(r => {
                  const ruta = dijkstra(origenRouting, r.id);
                  const gateway = ruta.length > 1 ? ruta[1] : '—';
                  const metrica = ruta.slice(0, -1).reduce((acc, id, i) => {
                    const enlace = ENLACES.find(e =>
                      (e.desde === id && e.hasta === ruta[i + 1]) ||
                      (e.hasta === id && e.desde === ruta[i + 1])
                    );
                    return acc + (enlace?.coste ?? 0);
                  }, 0);
                  return (
                    <tr key={r.id}>
                      <td>{r.nombre}</td>
                      <td>255.255.255.0</td>
                      <td>{gateway}</td>
                      <td>eth{ROUTERS.find(ro => ro.id === gateway)?.as ?? 0}</td>
                      <td>{metrica} ms</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Conceptos BGP y NAT */}
          <div className={styles.comparativaBox}>
            <div className={styles.comparativaItem}>
              <h4>BGP — Border Gateway Protocol</h4>
              <p>El protocolo de enrutamiento entre Sistemas Autónomos (AS). Cada AS es una red independiente (Telefónica, Google, AWS...). BGP decide qué rutas se anuncian entre AS vecinos, basándose en políticas, no solo en coste.</p>
              <p className={styles.comparativaVentaja}>BGP es el protocolo que hace posible la interconexión global de internet.</p>
            </div>
            <div className={styles.comparativaItem}>
              <h4>NAT — Network Address Translation</h4>
              <p>Solo hay ~4.200 millones de IPs públicas IPv4 (insuficientes para todos los dispositivos). NAT permite que miles de dispositivos con IPs privadas (192.168.x.x, 10.x.x.x, 172.16.x.x) compartan una sola IP pública.</p>
              <p className={styles.comparativaVentaja}>IPv6 resuelve esto: 340 sextillones de direcciones disponibles.</p>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* TAB 4: CDN                             */}
      {/* ═══════════════════════════════════════ */}
      {tabActiva === 'cdn' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>CDN y Latencia — El Mundo Más Cerca</h2>
          <p className={styles.intro}>
            Una CDN (Content Delivery Network) distribuye el contenido en servidores por todo el mundo para reducir la latencia. Compara los tiempos con y sin CDN.
          </p>

          {/* Controles */}
          <div className={styles.cdnControles}>
            <div className={styles.cdnModo}>
              <button
                className={`${styles.modoBtn} ${modoCDN === 'sin' ? styles.modoBtnActivo : ''}`}
                onClick={() => setModoCDN('sin')}
                aria-pressed={modoCDN === 'sin'}
              >
                Sin CDN
              </button>
              <button
                className={`${styles.modoBtn} ${modoCDN === 'con' ? styles.modoBtnActivo : ''}`}
                onClick={() => setModoCDN('con')}
                aria-pressed={modoCDN === 'con'}
              >
                Con CDN
              </button>
            </div>

            <label className={styles.sliderLabel}>
              Usuarios simultáneos: <strong>{usuariosCDN >= 1000000
                ? `${(usuariosCDN / 1000000).toFixed(1)}M`
                : `${(usuariosCDN / 1000).toFixed(0)}K`}</strong>
              <input
                type="range"
                min={100000}
                max={10000000}
                step={100000}
                value={usuariosCDN}
                onChange={e => setUsuariosCDN(Number(e.target.value))}
                className={styles.slider}
                aria-label="Número de usuarios simultáneos"
              />
            </label>
          </div>

          {/* Mapa SVG */}
          <div className={styles.svgWrapper}>
            <svg viewBox="0 0 580 300" className={styles.cdnSVG} aria-label="Mapa CDN con latencias por región">
              {/* Fondo oceano */}
              <rect width="580" height="300" rx="12" fill="#e8f4fd" />

              {/* Continentes simplificados */}
              {/* Europa */}
              <ellipse cx="295" cy="110" rx="60" ry="45" fill="#c8dfc8" opacity="0.7" />
              {/* América del Norte */}
              <ellipse cx="130" cy="110" rx="70" ry="50" fill="#c8dfc8" opacity="0.7" />
              {/* América del Sur */}
              <ellipse cx="165" cy="220" rx="45" ry="55" fill="#c8dfc8" opacity="0.7" />
              {/* Asia */}
              <ellipse cx="435" cy="130" rx="90" ry="55" fill="#c8dfc8" opacity="0.7" />
              {/* África */}
              <ellipse cx="300" cy="205" rx="45" ry="60" fill="#c8dfc8" opacity="0.7" />

              {/* Líneas desde origen a CDN nodos */}
              {NODOS_CDN.map(nodo => {
                const latencia = Math.round(latenciaCDN(nodo) * (modoCDN === 'sin' ? factorCarga : 1));
                return (
                  <line
                    key={nodo.id}
                    x1={ORIGEN_SERVIDOR.x} y1={ORIGEN_SERVIDOR.y}
                    x2={nodo.x} y2={nodo.y}
                    stroke={modoCDN === 'con' ? '#2E86AB' : '#F4A261'}
                    strokeWidth={2}
                    strokeDasharray={modoCDN === 'sin' ? '4 3' : '0'}
                    opacity="0.7"
                  />
                );
              })}

              {/* Nodos CDN */}
              {NODOS_CDN.map(nodo => {
                const latencia = Math.round(latenciaCDN(nodo) * (modoCDN === 'sin' ? factorCarga : 1));
                const colorLatencia = latencia < 50 ? '#2E86AB' : latencia < 100 ? '#F4A261' : '#E74C3C';
                return (
                  <g key={nodo.id}>
                    <circle cx={nodo.x} cy={nodo.y} r={18} fill={colorLatencia} stroke="#fff" strokeWidth={2} />
                    <text x={nodo.x} y={nodo.y + 5} fontSize="10" textAnchor="middle" fill="#fff" fontWeight="bold">
                      {latencia}ms
                    </text>
                    <text x={nodo.x} y={nodo.y + 28} fontSize="9" textAnchor="middle" fill="#555">
                      {nodo.nombre}
                    </text>
                  </g>
                );
              })}

              {/* Servidor origen */}
              <g>
                <rect
                  x={ORIGEN_SERVIDOR.x - 30} y={ORIGEN_SERVIDOR.y - 18}
                  width={60} height={36}
                  rx={8} fill="#2E86AB" stroke="#fff" strokeWidth={2}
                />
                <text x={ORIGEN_SERVIDOR.x} y={ORIGEN_SERVIDOR.y - 2} fontSize="9" textAnchor="middle" fill="#fff" fontWeight="bold">
                  🖥️ Origen
                </text>
                <text x={ORIGEN_SERVIDOR.x} y={ORIGEN_SERVIDOR.y + 11} fontSize="8" textAnchor="middle" fill="#ddd">
                  España
                </text>
              </g>

              {/* Leyenda */}
              <g>
                <circle cx={20} cy={270} r={6} fill="#2E86AB" />
                <text x={32} y={274} fontSize="10" fill="#555">Baja (&lt;50ms)</text>
                <circle cx={110} cy={270} r={6} fill="#F4A261" />
                <text x={122} y={274} fontSize="10" fill="#555">Media (50-100ms)</text>
                <circle cx={230} cy={270} r={6} fill="#E74C3C" />
                <text x={242} y={274} fontSize="10" fill="#555">Alta (&gt;100ms)</text>
              </g>
            </svg>
          </div>

          {/* Tabla de latencias */}
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Región</th>
                  <th>Usuarios potenciales</th>
                  <th>Sin CDN</th>
                  <th>Con CDN</th>
                  <th>Mejora</th>
                </tr>
              </thead>
              <tbody>
                {NODOS_CDN.map(nodo => {
                  const sinCDN = Math.round(nodo.latenciaBase * 1.6 * factorCarga);
                  const conCDN = nodo.latenciaBase;
                  const mejora = Math.round(((sinCDN - conCDN) / sinCDN) * 100);
                  return (
                    <tr key={nodo.id}>
                      <td>{nodo.nombre}</td>
                      <td>{nodo.usuarios}</td>
                      <td className={styles.latenciaAlta}>{sinCDN} ms</td>
                      <td className={styles.latenciaBaja}>{conCDN} ms</td>
                      <td><strong>-{mejora}%</strong></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* HTTP/2 vs HTTP/3 */}
          <h3 className={styles.subtitulo}>HTTP/2 vs HTTP/3 (QUIC)</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>HTTP/1.1</th>
                  <th>HTTP/2</th>
                  <th>HTTP/3 (QUIC)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Multiplexación</td>
                  <td>No (una req. por conexión)</td>
                  <td>Sí (varias req. por TCP)</td>
                  <td>Sí (sobre UDP/QUIC)</td>
                </tr>
                <tr>
                  <td>Head-of-line blocking</td>
                  <td>Sí</td>
                  <td>Parcialmente (TCP level)</td>
                  <td>No (streams independientes)</td>
                </tr>
                <tr>
                  <td>Handshake</td>
                  <td>TCP + TLS (2-3 RTT)</td>
                  <td>TCP + TLS (1-2 RTT)</td>
                  <td>QUIC 0-RTT/1-RTT</td>
                </tr>
                <tr>
                  <td>Protocolo base</td>
                  <td>TCP</td>
                  <td>TCP</td>
                  <td>UDP (QUIC)</td>
                </tr>
                <tr>
                  <td>Server Push</td>
                  <td>No</td>
                  <td>Sí</td>
                  <td>Sí (limitado)</td>
                </tr>
                <tr>
                  <td>Adopción (2025)</td>
                  <td>~15%</td>
                  <td>~55%</td>
                  <td>~30% (creciendo)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────
          SECCIÓN EDUCATIVA
      ───────────────────────────────────────────── */}
      <EducationalSection title="Conceptos Clave de Redes de Computadoras" subtitle="TCP/IP, DNS, Routing BGP, CDN y protocolos de internet explicados con ejemplos prácticos">

        {/* ── 1. Tabla Comparativa HTTP ── */}
        <h4>Comparativa de versiones HTTP</h4>
        <p>
          El protocolo HTTP ha evolucionado enormemente desde 1991. Cada versión resuelve problemas de
          rendimiento que la anterior no podía abordar. Comprender las diferencias ayuda a entender por qué
          las webs modernas cargan tan rápido.
        </p>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Versión</th>
                <th>Año</th>
                <th>Multiplexación</th>
                <th>Compresión headers</th>
                <th>Protocolo base</th>
                <th>Ventaja principal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>HTTP/1.1</strong></td>
                <td>1997</td>
                <td>No (una req. por conexión)</td>
                <td>No</td>
                <td>TCP</td>
                <td>Conexiones persistentes (Keep-Alive)</td>
              </tr>
              <tr>
                <td><strong>HTTP/2</strong></td>
                <td>2015</td>
                <td>Sí (múltiples streams sobre un TCP)</td>
                <td>Sí (HPACK)</td>
                <td>TCP</td>
                <td>Elimina head-of-line a nivel de aplicación; reduce latencia hasta un 50 %</td>
              </tr>
              <tr>
                <td><strong>HTTP/3 (QUIC)</strong></td>
                <td>2022</td>
                <td>Sí (streams QUIC independientes)</td>
                <td>Sí (QPACK)</td>
                <td>UDP / QUIC</td>
                <td>Elimina el head-of-line TCP; handshake 0-RTT; ideal en redes móviles</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── 2. Casos de Uso ── */}
        <h4>¿Quién usa este visualizador y para qué?</h4>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
            <h5>Estudiante de informática o telecomunicaciones</h5>
            <p>
              Estudia el modelo TCP/IP para un examen de redes. El visualizador de capas con encapsulamiento
              animado le permite entender de forma visual cómo se añaden y eliminan las cabeceras en cada capa,
              algo que los libros de texto describen pero pocas veces muestran en movimiento.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
            <h5>Desarrollador web que quiere entender por qué su app va lenta</h5>
            <p>
              Su aplicación tarda 3 segundos en cargar en móvil aunque en el PC va bien. Con la pestaña CDN
              descubre la diferencia de latencia entre regiones y entiende por qué necesita distribuir los
              assets estáticos. Con la comparativa HTTP/2 vs HTTP/3 decide activar HTTP/3 en su servidor.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🖥️</span>
            <h5>Administrador de sistemas configurando DNS y firewall</h5>
            <p>
              Necesita entender el flujo completo de resolución DNS para depurar por qué un cambio de registro
              no se propaga. El diagrama paso a paso del resolver iterativo le muestra exactamente dónde puede
              estar el problema: caché del ISP, TTL demasiado alto, o configuración del servidor autoritativo.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🔍</span>
            <h5>Ciudadano curioso que quiere entender internet</h5>
            <p>
              Escucha hablar de "DNS", "TCP/IP" y "CDN" y quiere saber qué significan en la práctica. El
              visualizador le permite seguir el viaje de una petición desde que escribe "google.com" en el
              navegador hasta que aparece la página, sin necesidad de conocimientos técnicos previos.
            </p>
          </div>
        </div>

        {/* ── 3. FAQ ── */}
        <h4>Preguntas frecuentes sobre redes</h4>
        <dl className={styles.faqList}>
          <div className={styles.faqItem}>
            <dt>¿Qué diferencia hay entre IP, TCP y HTTP?</dt>
            <dd>
              Son protocolos de distintas capas que trabajan juntos. <strong>IP</strong> (Internet Protocol)
              se encarga del direccionamiento y enrutamiento: decide cómo llegar de un punto A a un punto B
              usando paquetes numerados. <strong>TCP</strong> (Transmission Control Protocol) garantiza que
              esos paquetes llegan en orden y sin pérdidas, usando confirmaciones (ACK) y retransmisiones.
              <strong> HTTP</strong> es la "lengua" que hablan el navegador y el servidor web por encima de
              TCP: define cómo pedir un recurso (GET /index.html) y cómo responderlo (200 OK + contenido).
              <span className={styles.faqTip}>Analogía: IP es el sistema postal, TCP es el certificado de entrega, HTTP es el idioma de la carta.</span>
            </dd>
          </div>
          <div className={styles.faqItem}>
            <dt>¿Por qué existen las IPs privadas y el NAT?</dt>
            <dd>
              IPv4 solo tiene ~4.300 millones de direcciones, muy insuficientes para los miles de millones de
              dispositivos actuales. La solución temporal fue reservar rangos privados (192.168.x.x, 10.x.x.x,
              172.16-31.x.x) que pueden repetirse en miles de redes sin conflicto. El <strong>NAT</strong>
              (Network Address Translation) en el router traduce las IPs privadas a una sola IP pública cuando
              salen a internet, y viceversa al recibir respuestas. IPv6 resuelve el problema de raíz con
              340 sextillones de direcciones, pero la transición es lenta por la enorme infraestructura existente.
              <span className={styles.faqTip}>Tu red de casa probablemente usa 192.168.1.x/24 con hasta 254 dispositivos compartiendo una IP pública.</span>
            </dd>
          </div>
          <div className={styles.faqItem}>
            <dt>¿Qué es un CDN y por qué hace que las webs carguen más rápido?</dt>
            <dd>
              Una <strong>CDN</strong> (Content Delivery Network) es una red de servidores distribuidos
              geográficamente que almacenan copias del contenido (imágenes, CSS, JS, vídeos) cerca del usuario.
              En lugar de que todos los usuarios del mundo hagan peticiones a un servidor en España, un usuario
              en Japón descarga los assets desde un servidor en Tokio, reduciendo la latencia de 155 ms a
              ~20 ms. Las CDN también absorben picos de tráfico masivos y protegen contra ataques DDoS.
              Cloudflare, Fastly y Akamai son ejemplos de grandes CDN.
              <span className={styles.faqTip}>La mayoría de webs populares usan CDN. Cuando ves "cdn.ejemplo.com" en las URLs de assets, eso es una CDN.</span>
            </dd>
          </div>
          <div className={styles.faqItem}>
            <dt>¿Por qué el DNS es un punto crítico de seguridad en internet?</dt>
            <dd>
              El DNS es el "directorio" de internet: si un atacante puede modificar las respuestas DNS, puede
              redirigir a los usuarios a servidores falsos sin que lo noten (ataque de envenenamiento de caché
              o DNS spoofing). <strong>DNSSEC</strong> añade firmas criptográficas a los registros para verificar
              su autenticidad. Además, el DNS puede usarse para filtrar contenido (DNS sinkholes), para tunneling
              de datos maliciosos (DNS exfiltration) o para amplificación de ataques DDoS. Por eso muchas
              organizaciones despliegan soluciones como DNS-over-HTTPS (DoH) o DNS-over-TLS (DoT) para cifrar
              las consultas DNS.
              <span className={styles.faqTip}>Usar 1.1.1.1 (Cloudflare) o 8.8.8.8 (Google) como resolver público suele ser más seguro que el resolver del ISP.</span>
            </dd>
          </div>
          <div className={styles.faqItem}>
            <dt>¿Qué es la latencia y cómo afecta a las videollamadas?</dt>
            <dd>
              La <strong>latencia</strong> es el tiempo que tarda un paquete en viajar desde el origen hasta el
              destino (RTT = Round-Trip Time si incluye la vuelta). Se mide en milisegundos. Para videollamadas,
              una latencia inferior a 150 ms es imperceptible; entre 150-400 ms introduce retrasos molestos;
              por encima de 400 ms la conversación se vuelve torpe. La latencia depende de la distancia física
              (la luz viaja a ~200.000 km/s en fibra), el número de saltos (hops) entre routers, y la congestión
              de red. Por eso las videollamadas con alguien en Japón (155 ms solo de ida) son siempre algo
              menos fluidas que con alguien en tu ciudad.
              <span className={styles.faqTip}>Puedes medir la latencia con `ping google.com` en la terminal. El valor típico en una red doméstica española es 10-30 ms hacia servidores europeos.</span>
            </dd>
          </div>
        </dl>

        {/* ── 4. Guía Paso a Paso ── */}
        <h4>¿Qué ocurre exactamente cuando escribes "google.com" y pulsas Enter?</h4>
        <p>En menos de 200 milisegundos ocurren docenas de pasos. Aquí están los más importantes:</p>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">1</span>
            <div className={styles.stepContent}>
              <strong>Resolución DNS</strong>
              <p>
                El navegador comprueba su caché interna. Si no hay entrada válida, pregunta al resolver del
                sistema operativo, que a su vez consulta al resolver del ISP. Este sigue la cadena
                Root Server → TLD .com → servidor autoritativo de Google, y obtiene la IP
                (142.250.184.46). Todo esto ocurre en 20-100 ms gracias a las cachés en cada nivel.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">2</span>
            <div className={styles.stepContent}>
              <strong>Handshake TCP (3-way)</strong>
              <p>
                El navegador abre una conexión TCP con el servidor: envía SYN → recibe SYN-ACK → envía ACK.
                Este proceso de 3 mensajes establece los números de secuencia que garantizan el orden y la
                detección de pérdidas. Con HTTP/3 sobre QUIC, este paso se integra con TLS y se reduce a
                0 o 1 RTT en conexiones repetidas.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">3</span>
            <div className={styles.stepContent}>
              <strong>Handshake TLS (cifrado)</strong>
              <p>
                Sobre la conexión TCP se negocia TLS 1.3: el cliente y servidor acuerdan cifrado (ECDHE),
                intercambian certificados y generan las claves de sesión. Con TLS 1.3 solo hace falta 1 RTT
                adicional. A partir de aquí toda la comunicación va cifrada —nadie entre medias puede leer
                el contenido de la petición.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">4</span>
            <div className={styles.stepContent}>
              <strong>Petición HTTP y respuesta</strong>
              <p>
                El navegador envía <code>GET / HTTP/2</code> con cabeceras comprimidas (HPACK). El servidor
                de Google responde con el HTML (código 200 OK). Si el servidor tiene HTTP/2 Server Push
                activado, puede enviar CSS y JS sin que el navegador los pida. El navegador comienza a
                parsear el HTML y hace nuevas peticiones DNS + TCP para los recursos externos.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">5</span>
            <div className={styles.stepContent}>
              <strong>Renderizado y cierre</strong>
              <p>
                El navegador construye el DOM, aplica CSS, ejecuta JS y pinta la página. La conexión TCP
                puede mantenerse abierta (Keep-Alive) para reutilizarla en futuras peticiones. Los recursos
                estáticos (imágenes, fuentes, scripts) se sirven desde la CDN más cercana, no desde los
                servidores de Google en EEUU.
              </p>
            </div>
          </li>
        </ol>

        {/* ── 5. Mejores Prácticas ── */}
        <h4>Tips para entender y diagnosticar problemas de red</h4>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔍</span>
            <h5>Usa las DevTools de red</h5>
            <p>
              En Chrome/Firefox, abre DevTools (F12) → pestaña Red. Verás cada petición con su tiempo de DNS,
              handshake TCP, TLS y transferencia. El diagrama de cascada revela cuellos de botella al instante.
              Filtra por tipo (XHR, Fetch, JS, CSS) para encontrar recursos lentos.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📡</span>
            <h5>Aprende a usar ping y traceroute</h5>
            <p>
              <code>ping google.com</code> mide la latencia RTT y detecta pérdida de paquetes.
              <code>traceroute google.com</code> (o <code>tracert</code> en Windows) muestra cada router
              intermedio y su latencia. Son las primeras herramientas para diagnosticar si el problema
              está en tu red local, en el ISP, o en el servidor destino.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌐</span>
            <h5>Verifica tus registros DNS con dig o nslookup</h5>
            <p>
              <code>dig meskeia.com A</code> muestra el registro A (IPv4) y el TTL actual.
              <code>dig meskeia.com MX</code> muestra los servidores de correo.
              <code>nslookup meskeia.com 8.8.8.8</code> consulta directamente al resolver de Google,
              útil para comparar si tu ISP tiene la caché desactualizada tras un cambio DNS.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔒</span>
            <h5>Comprueba el certificado TLS</h5>
            <p>
              Haz clic en el candado del navegador para ver el certificado: quién lo emite, cuándo caduca
              y qué dominios cubre. Un certificado caducado provoca error de conexión a todos los usuarios.
              Herramientas como ssllabs.com analizan la configuración TLS de tu servidor y detectan
              vulnerabilidades como TLS 1.0/1.1 o suites de cifrado débiles.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚡</span>
            <h5>Mide la latencia a distintos servidores</h5>
            <p>
              Herramientas como speedtest.net o fast.com miden el ancho de banda, pero también puedes usar
              <code>ping 1.1.1.1</code> (Cloudflare), <code>ping 8.8.8.8</code> (Google) o
              <code>ping 9.9.9.9</code> (Quad9) para comparar latencias a distintos resolvers DNS públicos
              y elegir el más cercano para tu ubicación.
            </p>
          </div>
        </div>

        {/* ── 6. Warning Box ── */}
        <div className={styles.warningBoxEdu} role="note">
          <strong>Confusiones frecuentes sobre redes:</strong>
          <ul>
            <li>
              <strong>«El WiFi es más lento que el cable porque usa radio»</strong> — En parte verdad, pero la
              limitación real suele ser la congestión del canal WiFi (vecinos usando el mismo canal 2,4 GHz) o
              la saturación del router, no la velocidad de la radio en sí. WiFi 6 en 5 GHz puede superar 1 Gbps.
            </li>
            <li>
              <strong>«Si cambio el DNS seré más anónimo»</strong> — El DNS solo resuelve nombres. Tu ISP puede
              seguir viendo a qué IPs te conectas. Para anonimato real hace falta VPN o Tor; el DNS-over-HTTPS
              (DoH) solo cifra las consultas DNS, no el tráfico completo.
            </li>
            <li>
              <strong>«Una IP mayor significa más conexiones activas»</strong> — La IP (IPv4 o IPv6) es solo un
              identificador de red, no indica nada sobre el número de conexiones o la velocidad. Una IP pública
              puede tener miles de conexiones simultáneas gracias al NAT y los puertos.
            </li>
            <li>
              <strong>«El ping alto siempre es culpa del ISP»</strong> — La latencia puede venir de tu red local
              (WiFi congestionado, cable defectuoso), del servidor destino (servidor lento en responder), de
              la ruta BGP (no siempre la más corta geográficamente), o del ISP. <code>traceroute</code> te
              muestra exactamente en qué salto aparece la latencia.
            </li>
            <li>
              <strong>«HTTPS cifra todo el tráfico, nadie sabe a dónde me conecto»</strong> — HTTPS cifra el
              contenido (URL exacta, cabeceras, cuerpo), pero el nombre del servidor (SNI) viaja en claro durante
              el handshake TLS en la mayoría de implementaciones. Tu ISP sabe que te conectas a google.com,
              aunque no sepa exactamente qué buscas. ECH (Encrypted Client Hello) pretende resolver esto.
            </li>
          </ul>
        </div>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-redes-computadoras')} />
      <ShareCard appName="visualizador-redes-computadoras" />
      <Footer appName="visualizador-redes-computadoras" />
    </div>
  );
}
