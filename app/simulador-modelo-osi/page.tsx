'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './SimuladorModeloOsi.module.css';

// ============================================================
//  DATOS DE LAS CAPAS
// ============================================================

interface Capa {
  num: number;
  nombre: string;
  pdu: string;
  protocolos: string;
  funcion: string;
  dispositivos: string;
  color: string;
  tcpip: string;
}

// De arriba (7) a abajo (1) para mostrar el stack
const CAPAS: Capa[] = [
  {
    num: 7,
    nombre: 'Aplicación',
    pdu: 'Datos',
    protocolos: 'HTTP, HTTPS, SMTP, FTP, DNS, SSH',
    funcion: 'Interfaz entre la red y las aplicaciones del usuario.',
    dispositivos: 'Navegador, cliente de correo, servidores',
    color: '#2E86AB',
    tcpip: 'Aplicación',
  },
  {
    num: 6,
    nombre: 'Presentación',
    pdu: 'Datos',
    protocolos: 'TLS/SSL, ASCII, JPEG, MPEG',
    funcion: 'Cifrado, compresión y formato de los datos.',
    dispositivos: 'Software de cifrado y códecs',
    color: '#3E91A8',
    tcpip: 'Aplicación',
  },
  {
    num: 5,
    nombre: 'Sesión',
    pdu: 'Datos',
    protocolos: 'NetBIOS, RPC, sockets, PPTP',
    funcion: 'Abre, mantiene y cierra las sesiones de comunicación.',
    dispositivos: 'APIs de sesión del sistema',
    color: '#48A9A6',
    tcpip: 'Aplicación',
  },
  {
    num: 4,
    nombre: 'Transporte',
    pdu: 'Segmento / Datagrama',
    protocolos: 'TCP, UDP',
    funcion: 'Entrega extremo a extremo, puertos, fiabilidad y control de flujo.',
    dispositivos: 'Cortafuegos (filtrado por puerto)',
    color: '#5BAE7A',
    tcpip: 'Transporte',
  },
  {
    num: 3,
    nombre: 'Red',
    pdu: 'Paquete',
    protocolos: 'IP, ICMP, IPsec, OSPF',
    funcion: 'Direccionamiento lógico (IP) y enrutamiento entre redes.',
    dispositivos: 'Router',
    color: '#C0653A',
    tcpip: 'Internet',
  },
  {
    num: 2,
    nombre: 'Enlace de datos',
    pdu: 'Trama',
    protocolos: 'Ethernet, Wi-Fi (802.11), PPP, ARP',
    funcion: 'Direccionamiento físico (MAC) y entrega dentro de la misma red.',
    dispositivos: 'Switch, tarjeta de red',
    color: '#A6533F',
    tcpip: 'Acceso a la red',
  },
  {
    num: 1,
    nombre: 'Física',
    pdu: 'Bits',
    protocolos: 'Cables, fibra, señales, RJ-45, USB',
    funcion: 'Transmite los bits como señales por el medio físico.',
    dispositivos: 'Hub, cables, repetidor',
    color: '#7B5EA7',
    tcpip: 'Acceso a la red',
  },
];

interface Escenario {
  id: string;
  nombre: string;
  icono: string;
  appProto: string;
  payload: string;
  transporte: 'TCP' | 'UDP';
  puerto: string;
  seguridad: boolean;
}

const ESCENARIOS: Escenario[] = [
  {
    id: 'web',
    nombre: 'Navegar una web',
    icono: '🌐',
    appProto: 'HTTPS',
    payload: 'GET /index.html',
    transporte: 'TCP',
    puerto: '443',
    seguridad: true,
  },
  {
    id: 'correo',
    nombre: 'Enviar un correo',
    icono: '✉️',
    appProto: 'SMTP',
    payload: 'MAIL FROM:…',
    transporte: 'TCP',
    puerto: '587',
    seguridad: true,
  },
  {
    id: 'streaming',
    nombre: 'Streaming de vídeo',
    icono: '📺',
    appProto: 'RTP/DNS',
    payload: 'Paquete de vídeo',
    transporte: 'UDP',
    puerto: '443',
    seguridad: false,
  },
];

// ============================================================
//  CONSTRUCCIÓN DE LOS FOTOGRAMAS DE LA ANIMACIÓN
// ============================================================

type TipoBloque = 'datos' | 'cab' | 'cola' | 'bits';
interface Bloque {
  txt: string;
  tipo: TipoBloque;
}
type Lado = 'emisor' | 'medio' | 'receptor';
interface Fotograma {
  lado: Lado;
  capaNum: number | null;
  titulo: string;
  descripcion: string;
  bloques: Bloque[];
  pdu: string;
}

function bloquesYpdu(capaNum: number, esc: Escenario): { bloques: Bloque[]; pdu: string } {
  const datos: Bloque = { txt: esc.payload, tipo: 'datos' };
  if (capaNum >= 5) {
    return { bloques: [datos], pdu: 'Datos' };
  }
  if (capaNum === 4) {
    return {
      bloques: [{ txt: `${esc.transporte}:${esc.puerto}`, tipo: 'cab' }, datos],
      pdu: esc.transporte === 'TCP' ? 'Segmento' : 'Datagrama',
    };
  }
  if (capaNum === 3) {
    return {
      bloques: [{ txt: 'IP', tipo: 'cab' }, { txt: esc.transporte, tipo: 'cab' }, datos],
      pdu: 'Paquete',
    };
  }
  if (capaNum === 2) {
    return {
      bloques: [
        { txt: 'MAC', tipo: 'cab' },
        { txt: 'IP', tipo: 'cab' },
        { txt: esc.transporte, tipo: 'cab' },
        datos,
        { txt: 'FCS', tipo: 'cola' },
      ],
      pdu: 'Trama',
    };
  }
  return { bloques: [{ txt: '0101 1001 0110 1100', tipo: 'bits' }], pdu: 'Bits' };
}

function construirFotogramas(esc: Escenario): Fotograma[] {
  const frames: Fotograma[] = [];
  const capaPorNum = (n: number) => CAPAS.find((c) => c.num === n) as Capa;

  // Emisor: encapsulación 7 → 1
  for (let n = 7; n >= 1; n -= 1) {
    const c = capaPorNum(n);
    const { bloques, pdu } = bloquesYpdu(n, esc);
    let desc = '';
    if (n >= 5) desc = `${c.funcion} La PDU sigue siendo "Datos".`;
    else if (n === 1) desc = 'La trama se convierte en señales (bits) listas para el medio físico.';
    else desc = `Añade la cabecera de capa ${n}. ${c.funcion}`;
    frames.push({
      lado: 'emisor',
      capaNum: n,
      titulo: `Emisor · Capa ${n}: ${c.nombre}`,
      descripcion: desc,
      bloques,
      pdu,
    });
  }

  // Medio físico
  frames.push({
    lado: 'medio',
    capaNum: 1,
    titulo: 'Transmisión por el medio',
    descripcion: 'Los bits viajan como señales por el cable, la fibra o el aire hasta el receptor.',
    bloques: [{ txt: '0101 1001 0110 1100', tipo: 'bits' }],
    pdu: 'Bits',
  });

  // Receptor: desencapsulación 1 → 7
  for (let n = 1; n <= 7; n += 1) {
    const c = capaPorNum(n);
    const { bloques, pdu } = bloquesYpdu(n, esc);
    let desc = '';
    if (n === 1) desc = 'Recibe las señales y reconstruye los bits en una trama.';
    else if (n >= 5) desc = `${c.funcion} Entrega los datos a la capa superior.`;
    else desc = `Lee y quita la cabecera de capa ${n}, y entrega el contenido hacia arriba.`;
    frames.push({
      lado: 'receptor',
      capaNum: n,
      titulo: `Receptor · Capa ${n}: ${c.nombre}`,
      descripcion: desc,
      bloques,
      pdu,
    });
  }

  return frames;
}

// ============================================================
//  COMPONENTE
// ============================================================

export default function SimuladorModeloOsi() {
  const [escenarioId, setEscenarioId] = useState<string>('web');
  const [frameIdx, setFrameIdx] = useState<number>(0);
  const [auto, setAuto] = useState<boolean>(false);
  const [velocidad, setVelocidad] = useState<number>(1100);
  const [capaDetalle, setCapaDetalle] = useState<number | null>(null);

  const escenario = useMemo(
    () => ESCENARIOS.find((e) => e.id === escenarioId) as Escenario,
    [escenarioId]
  );
  const fotogramas = useMemo(() => construirFotogramas(escenario), [escenario]);
  const frame = fotogramas[Math.min(frameIdx, fotogramas.length - 1)];
  const totalFrames = fotogramas.length;

  const handleEscenario = useCallback((id: string) => {
    setAuto(false);
    setEscenarioId(id);
    setFrameIdx(0);
  }, []);

  const handleSiguiente = useCallback(() => {
    setFrameIdx((i) => Math.min(i + 1, totalFrames - 1));
  }, [totalFrames]);

  const handleAnterior = useCallback(() => {
    setAuto(false);
    setFrameIdx((i) => Math.max(i - 1, 0));
  }, []);

  const handleReiniciar = useCallback(() => {
    setAuto(false);
    setFrameIdx(0);
  }, []);

  useEffect(() => {
    if (!auto) return undefined;
    if (frameIdx >= totalFrames - 1) {
      setAuto(false);
      return undefined;
    }
    const t = setTimeout(() => setFrameIdx((i) => Math.min(i + 1, totalFrames - 1)), velocidad);
    return () => clearTimeout(t);
  }, [auto, frameIdx, totalFrames, velocidad]);

  const detalle = capaDetalle !== null ? CAPAS.find((c) => c.num === capaDetalle) : null;

  const renderStack = (lado: 'emisor' | 'receptor') => (
    <div className={styles.stack}>
      <div className={styles.stackTitulo}>{lado === 'emisor' ? 'Emisor' : 'Receptor'}</div>
      {CAPAS.map((c) => {
        const activa =
          (frame.lado === lado && frame.capaNum === c.num) ||
          (frame.lado === 'medio' && lado === 'receptor' && c.num === 1 && false);
        return (
          <button
            key={`${lado}-${c.num}`}
            type="button"
            className={`${styles.capaFila} ${activa ? styles.capaActiva : ''} ${capaDetalle === c.num ? styles.capaSeleccionada : ''}`}
            style={{ borderLeftColor: c.color }}
            onClick={() => setCapaDetalle((prev) => (prev === c.num ? null : c.num))}
            aria-pressed={capaDetalle === c.num}
          >
            <span className={styles.capaNum} style={{ background: c.color }}>{c.num}</span>
            <span className={styles.capaInfo}>
              <span className={styles.capaNombre}>{c.nombre}</span>
              <span className={styles.capaTcpip}>TCP/IP: {c.tcpip}</span>
            </span>
            <span className={styles.capaPdu}>{c.pdu}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador del Modelo OSI</h1>
        <p className={styles.subtitle}>
          Recorre las 7 capas paso a paso y observa cómo un mensaje se encapsula en el emisor y se
          desencapsula en el receptor. Pulsa cualquier capa para ver sus protocolos y dispositivos.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Escenario */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Escenario</h2>
          <div className={styles.escenarioSelector}>
            {ESCENARIOS.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => handleEscenario(e.id)}
                className={`${styles.escenarioBtn} ${escenarioId === e.id ? styles.escenarioActive : ''}`}
                aria-pressed={escenarioId === e.id}
              >
                <span className={styles.escenarioIco} aria-hidden="true">{e.icono}</span>
                <span className={styles.escenarioNombre}>{e.nombre}</span>
                <span className={styles.escenarioDesc}>
                  {e.appProto} · {e.transporte} puerto {e.puerto}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Stacks */}
        <section className={styles.panel}>
          <div className={styles.stacksFila}>
            {renderStack('emisor')}
            <div className={styles.medioCol}>
              <div className={styles.medioFlecha} aria-hidden="true">
                {frame.lado === 'emisor' ? '▼' : frame.lado === 'medio' ? '⇄' : '▲'}
              </div>
              <div className={styles.medioTexto}>
                {frame.lado === 'emisor' && 'Encapsulando'}
                {frame.lado === 'medio' && 'Medio físico'}
                {frame.lado === 'receptor' && 'Desencapsulando'}
              </div>
            </div>
            {renderStack('receptor')}
          </div>
        </section>

        {/* PDU actual */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            Unidad de datos (PDU): <span style={{ color: 'var(--primary)' }}>{frame.pdu}</span>
          </h2>
          <div className={styles.pduFila}>
            {frame.bloques.map((b, i) => {
              let clase = styles.bloqueDatos;
              if (b.tipo === 'cab') clase = styles.bloqueCab;
              else if (b.tipo === 'cola') clase = styles.bloqueCola;
              else if (b.tipo === 'bits') clase = styles.bloqueBits;
              return (
                <div key={`bloque-${i}-${b.txt}`} className={`${styles.bloque} ${clase}`}>
                  {b.txt}
                </div>
              );
            })}
          </div>
          <div className={styles.frameInfo} role="status" aria-live="polite">
            <strong>{frame.titulo}.</strong> {frame.descripcion}
          </div>
        </section>

        {/* Controles */}
        <section className={styles.panel}>
          <div className={styles.controles}>
            <button type="button" className={styles.ctrlBtn} onClick={handleAnterior} disabled={frameIdx === 0}>
              <span aria-hidden="true">◀</span> Anterior
            </button>
            <button
              type="button"
              className={styles.ctrlBtn}
              onClick={handleSiguiente}
              disabled={frameIdx >= totalFrames - 1}
            >
              Siguiente <span aria-hidden="true">▶</span>
            </button>
            <button
              type="button"
              className={`${styles.ctrlBtn} ${auto ? styles.ctrlBtnDanger : styles.ctrlBtnSecondary}`}
              onClick={() => setAuto((a) => !a)}
              aria-pressed={auto}
              disabled={frameIdx >= totalFrames - 1}
            >
              {auto ? 'Pausar' : 'Auto ▶▶'}
            </button>
            <button type="button" className={`${styles.ctrlBtn} ${styles.ctrlBtnDanger}`} onClick={handleReiniciar}>
              Reiniciar
            </button>
          </div>
          <div className={styles.progreso}>
            Paso {frameIdx + 1} de {totalFrames}
            <div className={styles.progresoBarra}>
              <div
                className={styles.progresoRelleno}
                style={{ width: `${((frameIdx + 1) / totalFrames) * 100}%` }}
              />
            </div>
          </div>
          <div className={styles.speedControl}>
            <label htmlFor="vel-input">Velocidad automática:</label>
            <input
              id="vel-input"
              type="range"
              min="400"
              max="2000"
              step="100"
              value={velocidad}
              onChange={(e) => setVelocidad(Number(e.target.value))}
            />
            <span className={styles.speedValue}>{velocidad} ms</span>
          </div>
        </section>

        {/* Detalle de capa */}
        {detalle && (
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>
              Capa {detalle.num}: {detalle.nombre}
            </h2>
            <div className={styles.detalleGrid}>
              <div className={styles.detalleItem}>
                <span className={styles.detalleLabel}>Función</span>
                <span className={styles.detalleValor}>{detalle.funcion}</span>
              </div>
              <div className={styles.detalleItem}>
                <span className={styles.detalleLabel}>PDU</span>
                <span className={styles.detalleValor}>{detalle.pdu}</span>
              </div>
              <div className={styles.detalleItem}>
                <span className={styles.detalleLabel}>Protocolos</span>
                <span className={styles.detalleValor}>{detalle.protocolos}</span>
              </div>
              <div className={styles.detalleItem}>
                <span className={styles.detalleLabel}>Dispositivos</span>
                <span className={styles.detalleValor}>{detalle.dispositivos}</span>
              </div>
              <div className={styles.detalleItem}>
                <span className={styles.detalleLabel}>Modelo TCP/IP</span>
                <span className={styles.detalleValor}>{detalle.tcpip}</span>
              </div>
            </div>
          </section>
        )}
      </main>

      <EducationalSection
        title="Guía del Modelo OSI y TCP/IP"
        subtitle="Las 7 capas, la encapsulación y la comparación con el modelo de Internet"
      >
        <h3>OSI vs TCP/IP — Comparativa de capas</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Capa OSI</th>
                <th>PDU</th>
                <th>Ejemplos de protocolo</th>
                <th>Modelo TCP/IP</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>7 · Aplicación</td><td>Datos</td><td>HTTP, DNS, SMTP</td><td rowSpan={3}>Aplicación</td></tr>
              <tr><td>6 · Presentación</td><td>Datos</td><td>TLS, JPEG</td></tr>
              <tr><td>5 · Sesión</td><td>Datos</td><td>Sockets, RPC</td></tr>
              <tr><td>4 · Transporte</td><td>Segmento</td><td>TCP, UDP</td><td>Transporte</td></tr>
              <tr><td>3 · Red</td><td>Paquete</td><td>IP, ICMP</td><td>Internet</td></tr>
              <tr><td>2 · Enlace</td><td>Trama</td><td>Ethernet, Wi-Fi</td><td rowSpan={2}>Acceso a la red</td></tr>
              <tr><td>1 · Física</td><td>Bits</td><td>Cables, señales</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de Uso Reales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🛠️</span>
              <strong>Diagnóstico de red</strong>
            </div>
            <div className={styles.escenarioExample}>
              Cuando algo falla, los técnicos "suben por las capas": ¿hay cable y enlace (1-2)?,
              ¿llega la IP (3)?, ¿responde el puerto (4)?, ¿funciona el servicio (7)? Aísla el problema por capas.
            </div>
            <div className={styles.escenarioTip}>Tip: ping prueba la capa 3; telnet a un puerto prueba la 4.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🔒</span>
              <strong>Seguridad por capas</strong>
            </div>
            <div className={styles.escenarioExample}>
              Un cortafuegos filtra por capa 4 (puertos), una VPN cifra en capa 3, TLS protege en capa
              6 y un WAF inspecciona en capa 7. La defensa en profundidad combina varias capas.
            </div>
            <div className={styles.escenarioTip}>Tip: HTTPS = HTTP (capa 7) sobre TLS (capa 6).</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">📡</span>
              <strong>Diseño de redes</strong>
            </div>
            <div className={styles.escenarioExample}>
              Elegir un switch (capa 2) o un router (capa 3) depende de si conectas equipos de la misma
              red o de redes distintas. El modelo OSI da el vocabulario común para decidirlo.
            </div>
            <div className={styles.escenarioTip}>Tip: dentro de una LAN, MAC (capa 2); entre redes, IP (capa 3).</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
              <strong>Entrevistas y certificaciones</strong>
            </div>
            <div className={styles.escenarioExample}>
              "¿En qué capa trabaja un router?" o "explica la encapsulación" son preguntas habituales en
              entrevistas de redes y en certificaciones como CCNA o CompTIA Network+.
            </div>
            <div className={styles.escenarioTip}>Tip: memoriza qué PDU corresponde a cada capa.</div>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Cómo memorizo el orden de las 7 capas?</h4>
            <p>
              De la 1 a la 7: Física, Enlace, Red, Transporte, Sesión, Presentación, Aplicación. Una
              regla en español es "Felipe Enseña Régimen Tributario Sin Presentar Apuntes". De arriba
              abajo (7 a 1) muchos usan "All People Seem To Need Data Processing" en inglés.
            </p>
            <p className={styles.faqTip}>En el simulador, las capas están numeradas para que las asocies rápido.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué cada capa añade una cabecera?</h4>
            <p>
              Porque cada capa necesita su propia información de control para hacer su trabajo: la capa
              4 guarda los puertos, la 3 las direcciones IP y la 2 las direcciones MAC. Esa información
              viaja en la cabecera y la lee la capa equivalente del receptor.
            </p>
            <p className={styles.faqTip}>La capa par del receptor "habla" con la capa par del emisor a través de su cabecera.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿OSI se usa de verdad o solo se estudia?</h4>
            <p>
              Como pila de protocolos real se usa TCP/IP, no OSI. Pero el modelo OSI sigue siendo el
              lenguaje común para describir, enseñar y diagnosticar redes: hablar de "un problema de
              capa 2" o "un ataque de capa 7" es universal entre profesionales.
            </p>
            <p className={styles.faqTip}>OSI = mapa conceptual; TCP/IP = lo que corre en Internet.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué diferencia hay entre TCP y UDP en la capa 4?</h4>
            <p>
              TCP es fiable y orientado a conexión: garantiza orden y reenvía lo perdido (web, correo).
              UDP es ligero y sin conexión: más rápido pero sin garantías, ideal para vídeo o juegos en
              tiempo real, donde llegar tarde es peor que perder un paquete.
            </p>
            <p className={styles.faqTip}>Cambia al escenario de streaming para ver la PDU como "Datagrama" (UDP).</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿La cabecera viaja con los datos por la red?</h4>
            <p>
              Sí. En el emisor las cabeceras se añaden a los datos y todo el conjunto se transmite como
              bits. En el receptor, cada capa lee su cabecera, la retira y pasa el resto hacia arriba.
              Por eso una trama Ethernet es más grande que los datos originales: lleva todas las cabeceras.
            </p>
            <p className={styles.faqTip}>Esa "sobrecarga" de cabeceras es el overhead de protocolo.</p>
          </div>
        </div>

        <h3>Cómo Viaja un Mensaje — Paso a Paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>La aplicación genera los datos (capa 7)</strong>
              <p>Tu navegador crea una petición (por ejemplo, GET /index.html). Aún son solo "datos".</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Transporte añade puertos (capa 4)</strong>
              <p>Se añade la cabecera TCP o UDP con el puerto origen y destino: la PDU pasa a ser un segmento.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Red añade las IP (capa 3)</strong>
              <p>Se añade la cabecera IP con las direcciones de origen y destino: ahora es un paquete.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Enlace añade las MAC (capa 2)</strong>
              <p>Se añaden cabecera (MAC) y cola (FCS para detección de errores): la PDU es una trama.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Física transmite y el receptor desencapsula (capa 1 → 7)</strong>
              <p>La trama se envía como bits. En el receptor, cada capa retira su cabecera hasta que la aplicación recibe los datos originales.</p>
            </div>
          </div>
        </div>

        <h3>Claves para no Confundirte</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔢</span>
            <strong>Asocia capa y PDU</strong>
            <p>4 = segmento, 3 = paquete, 2 = trama, 1 = bits. Las capas 5-7 manejan "datos".</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📍</span>
            <strong>Dos tipos de dirección</strong>
            <p>La IP (capa 3) es lógica y enruta entre redes; la MAC (capa 2) es física y local.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔌</span>
            <strong>Dispositivo por capa</strong>
            <p>Hub (1), switch (2), router (3). Subir de capa suele significar más "inteligencia".</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧭</span>
            <strong>Encapsular vs desencapsular</strong>
            <p>Bajar añade cabeceras (emisor); subir las retira (receptor). Es simétrico.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔐</span>
            <strong>HTTPS = HTTP + TLS</strong>
            <p>El cifrado TLS vive en la capa 6; HTTP, en la 7. Por eso HTTPS es "HTTP seguro".</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
            <strong>OSI mapea a TCP/IP</strong>
            <p>Las capas 7-5 de OSI son la "Aplicación" de TCP/IP; las 2-1, su "Acceso a la red".</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes con el modelo OSI</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Confundir el orden de las capas o numerarlas al revés.</li>
            <li>Pensar que la cabecera se "quita y se tira" en el emisor: se añade y viaja con los datos.</li>
            <li>Mezclar dirección IP (capa 3) con dirección MAC (capa 2).</li>
            <li>Creer que TCP/IP y OSI son lo mismo: TCP/IP tiene 4 capas, OSI tiene 7.</li>
            <li>Situar TLS en la capa 7 cuando su sitio clásico es la 6 (presentación).</li>
            <li>Olvidar que la capa 2 añade también una cola (FCS), no solo cabecera.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-modelo-osi')} />
      <ShareCard appName="simulador-modelo-osi" />
      <Footer appName="simulador-modelo-osi" />
    </div>
  );
}
