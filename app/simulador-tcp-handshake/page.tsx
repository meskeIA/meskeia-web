'use client';
// @disclaimer: exempt

import { useRef, useEffect, useState, useCallback } from 'react';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, ShareCard, EducationalSection } from '@/components';
import { trazarRectRedondeado, formatNumber } from '@/lib';
import styles from './SimuladorTcpHandshake.module.css';
import { PREGUNTA_TRES_PASOS } from './metadata';

/** Rango del ISN que admite el campo (y con el que ack = ISN + 2 cabe en los 32 bits de TCP) */
const ISN_MIN = 1;
const ISN_MAX = 999999;

// ============================================
// TIPOS
// ============================================
type TipoPaquete = 'SYN' | 'SYN-ACK' | 'ACK' | 'FIN' | 'FIN-ACK';
type OrigenPaquete = 'cliente' | 'servidor';
type EstadoConexion = 'idle' | 'syn-enviado' | 'syn-ack-recibido' | 'establecida' | 'cerrando' | 'cerrada';
type ModoSimulador = 'apertura' | 'completo';
type VelocidadAnim = 'lenta' | 'normal' | 'rapida';

interface Paso {
  id: number;
  origen: OrigenPaquete;
  tipo: TipoPaquete;
  flags: string;
  seq: number;
  ack: number;
  window: number;
  descripcion: string;
  esEstado?: boolean;
  estadoLabel?: string;
  estadoColor?: string;
}

// ============================================
// COLORES DEL CANVAS
// ============================================
const COLOR_SYN = '#2E86AB';
const COLOR_SYN_ACK = '#48A9A6';
const COLOR_ACK = '#28A745';
const COLOR_FIN = '#FD7E14';
const COLOR_ESTABLECIDA = '#28A745';
const COLOR_CERRADA = '#6C757D';

/**
 * Tono de TEXTO de cada color del lienzo, por tema (cabo C0297, 06/11/2026). La flecha y la
 * banda siguen con su color; la etiqueta, con uno que llega a 4,5:1 sobre el fondo y sobre el
 * tinte de la banda. Con el color de la línea, el FIN naranja daba 2,4:1 en claro, el ACK
 * verde 3,1 y la banda gris de cierre 3,9.
 */
const TEXTO_CLARO: Record<string, string> = {
  [COLOR_SYN]: '#26718F',
  [COLOR_SYN_ACK]: '#327874',
  [COLOR_ACK]: '#1E7B34',
  [COLOR_FIN]: '#B4530A',
  [COLOR_CERRADA]: '#4F565C',
};
const TEXTO_OSCURO: Record<string, string> = {
  [COLOR_SYN]: '#3FA5D1',
  [COLOR_SYN_ACK]: '#5ABDB9',
  [COLOR_ACK]: '#3DC25E',
  [COLOR_FIN]: '#FD7E14',
  [COLOR_CERRADA]: '#A0A8B0',
};

/** Relleno de las cabeceras, con texto blanco: el de los botones (--primary-boton, --secondary-boton) */
const CABECERA_CLIENTE = '#26718F';
const CABECERA_SERVIDOR = '#327874';

function getColorFlecha(tipo: TipoPaquete): string {
  if (tipo === 'SYN') return COLOR_SYN;
  if (tipo === 'SYN-ACK') return COLOR_SYN_ACK;
  if (tipo === 'ACK') return COLOR_ACK;
  if (tipo === 'FIN' || tipo === 'FIN-ACK') return COLOR_FIN;
  return COLOR_SYN;
}

// ============================================
// GENERADOR DE PASOS
// ============================================
function generarPasos(isnC: number, isnS: number, modo: ModoSimulador): Paso[] {
  const pasos: Paso[] = [
    {
      id: 1,
      origen: 'cliente',
      tipo: 'SYN',
      flags: 'SYN=1, ACK=0',
      seq: isnC,
      ack: 0,
      window: 65535,
      descripcion: `El cliente inicia la conexión enviando su Número de Secuencia Inicial (ISN). Anuncia que quiere establecer comunicación.`,
    },
    {
      id: 2,
      origen: 'servidor',
      tipo: 'SYN-ACK',
      flags: 'SYN=1, ACK=1',
      seq: isnS,
      ack: isnC + 1,
      window: 65535,
      descripcion: `El servidor confirma el SYN del cliente (ack = ISN_C + 1) y envía su propio ISN. Dos flags activados en un solo paquete: eficiencia de red.`,
    },
    {
      id: 3,
      origen: 'cliente',
      tipo: 'ACK',
      flags: 'SYN=0, ACK=1',
      seq: isnC + 1,
      ack: isnS + 1,
      window: 65535,
      descripcion: `El cliente confirma el ISN del servidor (ack = ISN_S + 1). Tras este tercer paso, ambos extremos conocen los números de secuencia del otro. Conexión establecida.`,
    },
  ];

  if (modo === 'completo') {
    pasos.push(
      {
        id: 4,
        origen: 'cliente',
        tipo: 'FIN',
        flags: 'FIN=1, ACK=1',
        seq: isnC + 1,
        ack: isnS + 1,
        window: 65535,
        descripcion: `El cliente decide cerrar su lado de la conexión enviando FIN. El flag FIN "consume" un número de secuencia, igual que SYN.`,
      },
      {
        id: 5,
        origen: 'servidor',
        tipo: 'ACK',
        flags: 'SYN=0, ACK=1',
        seq: isnS + 1,
        ack: isnC + 2,
        window: 65535,
        descripcion: `El servidor confirma el FIN del cliente (ack = seq_FIN + 1). TCP es full-duplex: el servidor puede seguir enviando datos antes de cerrar su lado.`,
      },
      {
        id: 6,
        origen: 'servidor',
        tipo: 'FIN',
        flags: 'FIN=1, ACK=1',
        seq: isnS + 1,
        ack: isnC + 2,
        window: 65535,
        descripcion: `El servidor cierra su lado de la conexión con su propio FIN. Cada dirección se cierra de forma independiente: por eso el cierre necesita 4 pasos.`,
      },
      {
        id: 7,
        origen: 'cliente',
        tipo: 'ACK',
        flags: 'SYN=0, ACK=1',
        seq: isnC + 2,
        ack: isnS + 2,
        // Hallazgo 4570: anunciaba Window 0 (la señal de «no envíes más» del control de flujo)
        // sin que nada en la simulación llenara el búfer. Es la misma ventana que los seis anteriores.
        window: 65535,
        // Hallazgo 4571: daba «~120s» como dato del estándar sin fuente. El MSL lo fija cada
        // sistema, así que la duración se matiza en vez de citarse.
        descripcion: `El cliente confirma el FIN del servidor. Entra en estado TIME_WAIT durante 2×MSL (el doble del tiempo máximo de vida de un segmento, que fija cada sistema operativo) para asegurar que no hay paquetes rezagados antes de liberar el puerto.`,
      }
    );
  }

  return pasos;
}

// ============================================
// DIMENSIONES DEL CANVAS
// ============================================
const MARGEN_X = 60;
const ANCHO_COL = 100;
const ALTO_CABECERA = 60;
const ALTO_PASO = 80;
const PADDING_LATERAL = 30;

function calcularDimensionesCanvas(numPasos: number): { w: number; h: number } {
  return {
    w: MARGEN_X * 2 + ANCHO_COL * 2 + 160,
    h: ALTO_CABECERA + numPasos * ALTO_PASO + 80,
  };
}

function getPosXCliente(w: number): number {
  return PADDING_LATERAL + ANCHO_COL / 2;
}

function getPosXServidor(w: number): number {
  return w - PADDING_LATERAL - ANCHO_COL / 2;
}

// ============================================
// DIBUJO EN CANVAS
// ============================================
interface OpcionesRender {
  pasos: Paso[];
  pasoActivo: number; // índice del paso que se está animando (-1 = ninguno)
  progreso: number;   // 0..1 progreso de la flecha activa
  isDark: boolean;
  estadoConexion: EstadoConexion;
}

function dibujarCanvas(canvas: HTMLCanvasElement, opts: OpcionesRender) {
  const { pasos, pasoActivo, progreso, isDark } = opts;
  const numPasos = pasos.length;
  const dim = calcularDimensionesCanvas(numPasos);

  const dpr = window.devicePixelRatio || 1;
  canvas.width = dim.w * dpr;
  canvas.height = dim.h * dpr;
  canvas.style.width = `${dim.w}px`;
  // Alto automático: en móvil `max-width: 100%` estrecha el lienzo, y con el alto fijo en
  // píxeles el diagrama salía deformado (relación 0,73 frente a 1,26, hallazgo 4574). Con
  // `auto` el navegador conserva la proporción del propio lienzo.
  canvas.style.height = 'auto';

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  const w = dim.w;

  const xC = getPosXCliente(w);
  const xS = getPosXServidor(w);
  const bgColor = isDark ? '#1e1e1e' : '#ffffff';
  const textColor = isDark ? '#e5e5e5' : '#1a1a1a';
  const lineColor = isDark ? '#444' : '#ccc';

  // Fondo
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, dim.w, dim.h);

  // Cabeceras de columnas
  const dibujarColumna = (x: number, label: string, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    trazarRectRedondeado(ctx, x - ANCHO_COL / 2, 10, ANCHO_COL, 36, 6);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, 28);
  };

  // Blanco sobre la marca daba 4,11 y 2,80:1
  dibujarColumna(xC, 'CLIENTE', CABECERA_CLIENTE);
  dibujarColumna(xS, 'SERVIDOR', CABECERA_SERVIDOR);
  const textoDe = (color: string): string => (isDark ? TEXTO_OSCURO : TEXTO_CLARO)[color] ?? textColor;

  // Líneas de tiempo verticales (punteadas)
  const yLineaInicio = ALTO_CABECERA;
  const yLineaFin = ALTO_CABECERA + numPasos * ALTO_PASO + 20;

  const dibujarLineaTiempo = (x: number) => {
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(x, yLineaInicio);
    ctx.lineTo(x, yLineaFin);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  dibujarLineaTiempo(xC);
  dibujarLineaTiempo(xS);

  // Dibujar pasos completados y el activo
  pasos.forEach((paso, idx) => {
    const yFlecha = ALTO_CABECERA + idx * ALTO_PASO + ALTO_PASO / 2;
    const completado = idx < pasoActivo;
    const esActivo = idx === pasoActivo;

    if (!completado && !esActivo) return;

    const xOrigen = paso.origen === 'cliente' ? xC : xS;
    const xDestino = paso.origen === 'cliente' ? xS : xC;
    const color = getColorFlecha(paso.tipo);
    const p = completado ? 1 : progreso;

    const xActual = xOrigen + (xDestino - xOrigen) * p;

    // Línea de flecha
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(xOrigen, yFlecha);
    ctx.lineTo(xActual, yFlecha);
    ctx.stroke();

    // Punta de flecha (solo al final)
    if (p >= 0.98) {
      const dir = paso.origen === 'cliente' ? 1 : -1;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(xDestino, yFlecha);
      ctx.lineTo(xDestino - dir * 12, yFlecha - 6);
      ctx.lineTo(xDestino - dir * 12, yFlecha + 6);
      ctx.closePath();
      ctx.fill();
    }

    // Etiqueta sobre la flecha
    if (p >= 0.5) {
      const xMedio = (xOrigen + xDestino) / 2;
      const flagsLabel = paso.tipo;
      const seqLabel = `seq=${paso.seq}`;
      const ackLabel = paso.ack > 0 ? `, ack=${paso.ack}` : '';
      const etiqueta = `${flagsLabel} (${seqLabel}${ackLabel})`;

      ctx.fillStyle = textoDe(color);
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(etiqueta, xMedio, yFlecha - 4);
    }
  });

  // Indicador de estado entre columnas
  const dibujarBandaEstado = (y: number, label: string, color: string) => {
    const xIni = xC + 10;
    const ancho = xS - xC - 20;
    ctx.fillStyle = color + '22';
    ctx.fillRect(xIni, y - 10, ancho, 20);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(xIni, y - 10, ancho, 20);
    ctx.fillStyle = textoDe(color);
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, xC + (xS - xC) / 2, y);
  };

  // Estado "CONEXIÓN ESTABLECIDA" tras el paso 3
  if (pasoActivo >= 3 || (pasoActivo === 2 && progreso >= 1)) {
    const y = ALTO_CABECERA + 3 * ALTO_PASO - 10;
    dibujarBandaEstado(y, 'CONEXIÓN ESTABLECIDA', COLOR_ESTABLECIDA);
  }

  // Estado "CONEXIÓN CERRADA" tras todos los pasos de cierre. Pedía pasoActivo >= pasos.length,
  // y el paso activo llega como mucho a pasos.length − 1: no se pintaba nunca (hallazgo 4569).
  // Ahora, como la de «establecida»: cuando el último paquete ha aterrizado.
  const ultimo = pasos.length - 1;
  if (pasos.length > 3 && (pasoActivo > ultimo || (pasoActivo === ultimo && progreso >= 1))) {
    const y = ALTO_CABECERA + pasos.length * ALTO_PASO - 10;
    dibujarBandaEstado(y, 'CONEXIÓN CERRADA (TIME_WAIT)', COLOR_CERRADA);
  }

  // Etiquetas de número de paso a la izquierda
  pasos.forEach((paso, idx) => {
    const yFlecha = ALTO_CABECERA + idx * ALTO_PASO + ALTO_PASO / 2;
    ctx.fillStyle = textColor;
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${idx + 1}`, 6, yFlecha);
  });
}

// ============================================
// VELOCIDADES EN MS POR PASO
// ============================================
const VELOCIDAD_MS: Record<VelocidadAnim, number> = {
  lenta: 2000,
  normal: 1000,
  rapida: 400,
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function SimuladorTcpHandshakePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const animInicioRef = useRef<number | null>(null);

  const [isnCliente, setIsnCliente] = useState<number>(1000);
  const [isnServidor, setIsnServidor] = useState<number>(5000);
  const [isnClienteInput, setIsnClienteInput] = useState<string>('1000');
  const [isnServidorInput, setIsnServidorInput] = useState<string>('5000');
  const [velocidad, setVelocidad] = useState<VelocidadAnim>('normal');
  const [modo, setModo] = useState<ModoSimulador>('apertura');
  const [pasoActivo, setPasoActivo] = useState<number>(-1);
  const [animando, setAnimando] = useState<boolean>(false);
  const [autoplay, setAutoplay] = useState<boolean>(false);
  const [estadoConexion, setEstadoConexion] = useState<EstadoConexion>('idle');
  const [progresoActual, setProgresoActual] = useState<number>(0);

  const pasos = generarPasos(isnCliente, isnServidor, modo);
  const isDarkRef = useRef<boolean>(false);
  // El ref solo lo leía el siguiente dibujo: al cambiar de tema el lienzo se quedaba con el
  // fondo y los colores del tema anterior hasta pulsar algo (cabo C0297, 06/11/2026). El
  // estado provoca el redibujado.
  const [temaOscuro, setTemaOscuro] = useState<boolean>(false);

  // Detectar dark mode
  useEffect(() => {
    const checkDark = () => {
      isDarkRef.current = document.documentElement.getAttribute('data-theme') === 'dark';
      setTemaOscuro(isDarkRef.current);
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Dibujar canvas cuando cambia estado
  const redibujar = useCallback((pasoIdx: number, prog: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    dibujarCanvas(canvas, {
      pasos,
      pasoActivo: pasoIdx,
      progreso: prog,
      isDark: isDarkRef.current,
      estadoConexion,
    });
  }, [pasos, estadoConexion]);

  // Efecto: redibujar cuando cambian parámetros o estado
  useEffect(() => {
    redibujar(pasoActivo, progresoActual);
  }, [redibujar, pasoActivo, progresoActual, isnCliente, isnServidor, modo, temaOscuro]);

  // Actualizar estado de conexión según paso
  const actualizarEstado = useCallback((idx: number) => {
    if (idx < 0) { setEstadoConexion('idle'); return; }
    if (idx === 0) { setEstadoConexion('syn-enviado'); return; }
    if (idx === 1) { setEstadoConexion('syn-ack-recibido'); return; }
    if (idx >= 2 && idx < 3) { setEstadoConexion('establecida'); return; }
    if (idx >= 3 && idx < pasos.length - 1) { setEstadoConexion('cerrando'); return; }
    if (idx >= pasos.length - 1) { setEstadoConexion('cerrada'); return; }
  }, [pasos.length]);

  // Animar un paso individual
  const animarPaso = useCallback((idx: number, duracion: number, onComplete: () => void) => {
    animInicioRef.current = null;
    setAnimando(true);

    const tick = (ts: number) => {
      if (!animInicioRef.current) animInicioRef.current = ts;
      const elapsed = ts - animInicioRef.current;
      const prog = Math.min(elapsed / duracion, 1);
      setProgresoActual(prog);
      redibujar(idx, prog);

      if (prog < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setAnimando(false);
        onComplete();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [redibujar]);

  // Avanzar un paso
  const avanzarPaso = useCallback(() => {
    if (animando) return;
    const siguiente = pasoActivo + 1;
    if (siguiente >= pasos.length) return;

    actualizarEstado(siguiente);
    animarPaso(siguiente, VELOCIDAD_MS[velocidad], () => {
      setPasoActivo(siguiente);
      setProgresoActual(1);
    });
  }, [animando, pasoActivo, pasos.length, actualizarEstado, animarPaso, velocidad]);

  // Retroceder un paso
  const retrocederPaso = useCallback(() => {
    if (animando) return;
    const anterior = pasoActivo - 1;
    setPasoActivo(anterior);
    setProgresoActual(anterior >= 0 ? 1 : 0);
    actualizarEstado(anterior);
  }, [animando, pasoActivo, actualizarEstado]);

  // Autoplay
  useEffect(() => {
    if (!autoplay || animando) return;
    if (pasoActivo >= pasos.length - 1) {
      setAutoplay(false);
      return;
    }

    const timer = setTimeout(() => {
      avanzarPaso();
    }, 300);

    return () => clearTimeout(timer);
  }, [autoplay, animando, pasoActivo, pasos.length, avanzarPaso]);

  // Reiniciar
  const reiniciar = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setAutoplay(false);
    setAnimando(false);
    setPasoActivo(-1);
    setProgresoActual(0);
    setEstadoConexion('idle');
    redibujar(-1, 0);
  }, [redibujar]);

  // Número aleatorio ISN
  const randomISN = () => Math.floor(Math.random() * 9000) + 1000;

  const generarISNAleatorio = () => {
    const c = randomISN();
    const s = randomISN();
    setAvisoIsn('');
    setIsnCliente(c);
    setIsnServidor(s);
    setIsnClienteInput(String(c));
    setIsnServidorInput(String(s));
    reiniciar();
  };

  /*
   * Hallazgos 4567 y 4568 (12/11/2026, REPARADOS): solo se comprobaba parseInt(x) >= 1, así que
   * se aplicaba lo que el propio campo marca inválido (4294967295 enseñaba un ack que no cabe en
   * los 32 bits de TCP; 12.7 se truncaba a 12) y lo rechazado (−5, 0) se descartaba sin decir
   * nada. Ahora se exige un entero dentro del rango que declara el campo (1-999.999, con el que
   * ack = ISN + 2 cabe siempre en 32 bits) y, si no, se avisa y se mantiene el ISN en vigor.
   */
  const [avisoIsn, setAvisoIsn] = useState<string>('');

  const leerIsn = (texto: string): number | null => {
    const n = Number(texto);
    return texto.trim() !== '' && Number.isInteger(n) && n >= ISN_MIN && n <= ISN_MAX ? n : null;
  };

  const aplicarISN = () => {
    const c = leerIsn(isnClienteInput);
    const s = leerIsn(isnServidorInput);
    if (c === null || s === null) {
      const cuales = [c === null ? 'cliente' : '', s === null ? 'servidor' : ''].filter(Boolean).join(' y ');
      setAvisoIsn(
        `El ISN de ${cuales} tiene que ser un número entero entre ${formatNumber(ISN_MIN, 0)} y ${formatNumber(ISN_MAX, 0)}. Se mantienen los ISN en vigor: cliente ${isnCliente}, servidor ${isnServidor}.`,
      );
      return;
    }
    setAvisoIsn('');
    setIsnCliente(c);
    setIsnServidor(s);
    reiniciar();
  };

  // Paquete activo para el panel lateral
  const pasoPanel: Paso | null = pasoActivo >= 0 && pasoActivo < pasos.length ? pasos[pasoActivo] : null;

  /** Lo que se anuncia al aterrizar cada paquete, y lo que el lienzo dice que contiene. */
  const etiquetaPaquete = (p: Paso): string =>
    `${p.tipo} de ${p.origen === 'cliente' ? 'cliente a servidor' : 'servidor a cliente'}, seq ${p.seq}${p.ack > 0 ? `, ack ${p.ack}` : ''}`;
  const anuncioPaquete = pasoPanel ? `Paso ${pasoPanel.id} de ${pasos.length}: ${etiquetaPaquete(pasoPanel)}.` : '';
  const descripcionLienzo = pasoActivo < 0
    ? 'Diagrama de secuencia del TCP handshake, sin paquetes enviados todavía'
    : `Diagrama de secuencia del TCP handshake: ${pasos.slice(0, pasoActivo + 1).map(etiquetaPaquete).join('; ')}`;

  const etiquetaEstado: Record<EstadoConexion, string> = {
    idle: 'Inactivo',
    'syn-enviado': 'SYN enviado',
    'syn-ack-recibido': 'SYN-ACK recibido',
    establecida: 'Conexión establecida',
    cerrando: 'Cerrando conexión',
    cerrada: 'Conexión cerrada',
  };

  const colorEstado: Record<EstadoConexion, string> = {
    idle: '#6C757D',
    'syn-enviado': COLOR_SYN,
    'syn-ack-recibido': COLOR_SYN_ACK,
    establecida: COLOR_ESTABLECIDA,
    cerrando: COLOR_FIN,
    cerrada: COLOR_CERRADA,
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitulo}>Handshake TCP</h1>
        <p className={styles.heroSubtitulo}>
          Visualiza el three-way handshake que establece cada conexión TCP en internet
        </p>
      </header>

      <LegalNotice />

      {/* ============================================ */}
      {/* CONFIGURACIÓN */}
      {/* ============================================ */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Configuración</h2>
        <div className={styles.configGrid}>
          <div className={styles.configGrupo}>
            <label className={styles.configLabel} htmlFor="isnCliente">ISN Cliente</label>
            <input
              id="isnCliente"
              type="number"
              min="1"
              max="999999"
              value={isnClienteInput}
              onChange={(e) => setIsnClienteInput(e.target.value)}
              className={styles.configInput}
            />
          </div>
          <div className={styles.configGrupo}>
            <label className={styles.configLabel} htmlFor="isnServidor">ISN Servidor</label>
            <input
              id="isnServidor"
              type="number"
              min="1"
              max="999999"
              value={isnServidorInput}
              onChange={(e) => setIsnServidorInput(e.target.value)}
              className={styles.configInput}
            />
          </div>
          <div className={styles.configGrupo}>
            {/* Nombre de grupo, no <label>: no hay un control que asociarle (hallazgo 4575) */}
            <span id="velocidad-label" className={styles.configLabel}>Velocidad</span>
            <div role="group" aria-labelledby="velocidad-label" className={styles.velSelector}>
              {(['lenta', 'normal', 'rapida'] as VelocidadAnim[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`${styles.velBtn} ${velocidad === v ? styles.velBtnActivo : ''}`}
                  onClick={() => setVelocidad(v)}
                  aria-pressed={velocidad === v}
                >
                  {v === 'lenta' ? 'Lenta' : v === 'normal' ? 'Normal' : 'Rápida'}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.configGrupo}>
            <span id="modo-label" className={styles.configLabel}>Modo</span>
            <div role="group" aria-labelledby="modo-label" className={styles.velSelector}>
              <button
                type="button"
                className={`${styles.velBtn} ${modo === 'apertura' ? styles.velBtnActivo : ''}`}
                onClick={() => { setModo('apertura'); reiniciar(); }}
                aria-pressed={modo === 'apertura'}
              >
                Solo apertura
              </button>
              <button
                type="button"
                className={`${styles.velBtn} ${modo === 'completo' ? styles.velBtnActivo : ''}`}
                onClick={() => { setModo('completo'); reiniciar(); }}
                aria-pressed={modo === 'completo'}
              >
                Apertura + Cierre
              </button>
            </div>
          </div>
        </div>
        <div className={styles.configAcciones}>
          <button type="button" className={styles.btnSecundario} onClick={aplicarISN}>
            Aplicar ISN
          </button>
          <button type="button" className={styles.btnSecundario} onClick={generarISNAleatorio}>
            ISN Aleatorio
          </button>
        </div>
        {avisoIsn && (
          <p className={styles.avisoIsn} role="alert">
            {avisoIsn}
          </p>
        )}
      </section>

      {/* ============================================ */}
      {/* ÁREA PRINCIPAL: CANVAS + PANEL */}
      {/* ============================================ */}
      <div className={styles.simuladorLayout}>

        {/* Canvas */}
        <div className={styles.canvasWrapper}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            aria-label={descripcionLienzo}
            role="img"
          />
        </div>

        {/* Hallazgo 4575: el panel cambiaba sin región viva y el foco se queda en «Siguiente»,
            así que un lector de pantalla no oía el paquete nuevo. Una cadena, hija única. */}
        <p className="sr-only" role="status" aria-live="polite">
          {anuncioPaquete}
        </p>

        {/* Panel lateral de detalles */}
        <aside className={styles.panelDetalles}>
          <div className={styles.estadoBadge} style={{ borderColor: colorEstado[estadoConexion] }}>
            <span
              className={styles.estadoPunto}
              style={{ background: colorEstado[estadoConexion] }}
            />
            <span className={styles.estadoTexto}>{etiquetaEstado[estadoConexion]}</span>
          </div>

          {pasoPanel ? (
            <div
              className={styles.paqueteCard}
              style={{ borderLeftColor: getColorFlecha(pasoPanel.tipo) }}
            >
              <div className={styles.paqueteTitulo}>
                <span
                  className={styles.paqueteTipo}
                  style={{ background: getColorFlecha(pasoPanel.tipo) }}
                >
                  {pasoPanel.tipo}
                </span>
                <span className={styles.paqueteOrigen}>
                  {pasoPanel.origen === 'cliente' ? 'Cliente → Servidor' : 'Servidor → Cliente'}
                </span>
              </div>
              <dl className={styles.paqueteDatos}>
                <div className={styles.datoFila}>
                  <dt>Flags</dt>
                  <dd><code>{pasoPanel.flags}</code></dd>
                </div>
                <div className={styles.datoFila}>
                  <dt>Seq</dt>
                  <dd><code>{pasoPanel.seq}</code></dd>
                </div>
                <div className={styles.datoFila}>
                  <dt>Ack</dt>
                  <dd><code>{pasoPanel.ack > 0 ? pasoPanel.ack : '–'}</code></dd>
                </div>
                <div className={styles.datoFila}>
                  <dt>Window</dt>
                  <dd><code>{pasoPanel.window.toLocaleString('es-ES')}</code></dd>
                </div>
              </dl>
              <p className={styles.paqueteDesc}>{pasoPanel.descripcion}</p>
            </div>
          ) : (
            <div className={styles.panelVacio}>
              <p>Pulsa <strong>Siguiente</strong> para iniciar el handshake y ver los detalles de cada paquete.</p>
            </div>
          )}

          {/* Progreso de pasos */}
          <div className={styles.progresoPasos}>
            {pasos.map((p, idx) => (
              <div
                key={p.id}
                className={`${styles.progresoPaso} ${
                  idx < pasoActivo || (idx === pasoActivo && progresoActual >= 1)
                    ? styles.progresoPasoCompleto
                    : idx === pasoActivo
                    ? styles.progresoPasoActivo
                    : ''
                }`}
                style={{ borderColor: getColorFlecha(p.tipo) }}
                title={`Paso ${p.id}: ${p.tipo}`}
              >
                {p.tipo}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ============================================ */}
      {/* CONTROLES */}
      {/* ============================================ */}
      <div className={styles.controles}>
        <button
          type="button"
          className={styles.btnControl}
          onClick={retrocederPaso}
          disabled={pasoActivo < 0 || animando}
          aria-label="Paso anterior"
        >
          <span aria-hidden="true">←</span> Anterior
        </button>
        <button
          type="button"
          className={styles.btnControlPrimario}
          onClick={avanzarPaso}
          disabled={animando || pasoActivo >= pasos.length - 1}
          aria-label="Siguiente paso"
        >
          Siguiente <span aria-hidden="true">→</span>
        </button>
        <button
          type="button"
          className={`${styles.btnControl} ${autoplay ? styles.btnControlActivo : ''}`}
          onClick={() => {
            if (autoplay) {
              setAutoplay(false);
            } else {
              if (pasoActivo >= pasos.length - 1) reiniciar();
              setAutoplay(true);
            }
          }}
          disabled={animando && !autoplay}
          aria-label={autoplay ? 'Pausar autoplay' : 'Iniciar autoplay'}
          aria-pressed={autoplay}
        >
          {autoplay ? <><span aria-hidden="true">⏸</span> Pausar</> : <><span aria-hidden="true">▶</span> Autoplay</>}
        </button>
        <button
          type="button"
          className={styles.btnControl}
          onClick={reiniciar}
          aria-label="Reiniciar simulador"
        >
          <span aria-hidden="true">↺</span> Reiniciar
        </button>
      </div>

      {/* ============================================ */}
      {/* SECCIÓN EDUCATIVA */}
      {/* ============================================ */}
      <EducationalSection
        title="Protocolo TCP y el Handshake"
        subtitle="Todo sobre el establecimiento de conexiones TCP, números de secuencia y comparativa de protocolos"
        icon="🌐"
      >
        {/* Introducción */}
        <section>
          <p>
            TCP (Transmission Control Protocol) garantiza entrega ordenada y sin errores usando un proceso de
            establecimiento en 3 pasos: el cliente envía SYN con su Número de Secuencia Inicial (ISN), el servidor
            responde con SYN-ACK (su ISN + confirmación), y el cliente confirma con ACK. Los ISN son aleatorios
            para evitar ataques de predicción de secuencia. El cierre requiere 4 pasos porque cada dirección
            se cierra independientemente.
          </p>
        </section>

        {/* Tabla comparativa */}
        <section>
          <h3>Comparativa de Protocolos de Transporte</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Protocolo</th>
                  <th>Conexión</th>
                  <th>Fiabilidad</th>
                  <th>Orden</th>
                  <th>Velocidad</th>
                  <th>Uso típico</th>
                </tr>
              </thead>
              <tbody>
                <tr className={styles.filaDestacada}>
                  <td><strong>TCP</strong></td>
                  <td>3-way handshake</td>
                  <td>Garantizada</td>
                  <td>Garantizado</td>
                  <td>Moderada</td>
                  <td>HTTP/S, SSH, FTP, correo</td>
                </tr>
                <tr>
                  <td><strong>UDP</strong></td>
                  <td>Sin conexión</td>
                  <td>No garantizada</td>
                  <td>No garantizado</td>
                  <td>Alta</td>
                  <td>DNS, streaming, juegos online</td>
                </tr>
                <tr>
                  <td><strong>QUIC</strong></td>
                  <td>1-RTT (TLS integrado)</td>
                  <td>Garantizada</td>
                  <td>Garantizado</td>
                  <td>Alta</td>
                  <td>HTTP/3, YouTube, Google</td>
                </tr>
                <tr>
                  <td><strong>SCTP</strong></td>
                  <td>4-way handshake</td>
                  <td>Garantizada</td>
                  <td>Configurable</td>
                  <td>Moderada</td>
                  <td>VoIP, telecomunicaciones</td>
                </tr>
                <tr>
                  <td><strong>WebSockets</strong></td>
                  <td>Sobre TCP+HTTP upgrade</td>
                  <td>Garantizada</td>
                  <td>Garantizado</td>
                  <td>Moderada</td>
                  <td>Chat en tiempo real</td>
                </tr>
                <tr>
                  <td><strong>ICMP</strong></td>
                  <td>Sin conexión</td>
                  <td>No garantizada</td>
                  <td>No aplicable</td>
                  <td>Muy alta</td>
                  <td>ping, traceroute, errores de red</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Escenarios */}
        <section>
          <h3>Escenarios de Uso</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🤝</span>
                <strong>Handshake normal</strong>
              </div>
              <p>ISN cliente 1000, ISN servidor 5000 → 3 pasos perfectos + conexión establecida. La secuencia ideal para entender el protocolo básico.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔄</span>
                <strong>Ciclo de vida completo</strong>
              </div>
              <p>Los 7 pasos (apertura 3-way + cierre 4-way FIN) del ciclo de vida completo de una conexión TCP. Activa el modo &quot;Apertura + Cierre&quot;.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎲</span>
                <strong>Números de secuencia aleatorios</strong>
              </div>
              <p>Los ISN son aleatorios para prevenir ataques de predicción de secuencia (IP spoofing). Pulsa &quot;ISN Aleatorio&quot; y observa cómo cambian los números.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">⚠️</span>
                <strong>SYN flood (DDoS)</strong>
              </div>
              <p>Un atacante envía miles de SYN sin completar el handshake: el servidor mantiene conexiones &quot;half-open&quot; hasta agotar recursos. La defensa usa SYN cookies.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqLista}>
            <div className={styles.faqItem}>
              <h4>{PREGUNTA_TRES_PASOS.question}</h4>
              <p>{PREGUNTA_TRES_PASOS.answer}</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué son los ISN y por qué son aleatorios?</h4>
              <p>Initial Sequence Numbers: identifican el byte inicial de cada flujo. Si fueran predecibles (como 0 o 1), un atacante podría inyectar paquetes falsos haciéndose pasar por la fuente legítima (IP spoofing). La aleatoriedad hace que sea estadísticamente imposible adivinar el ISN correcto.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué el cierre necesita 4 pasos?</h4>
              <p>Porque TCP es full-duplex: cada dirección cierra su flujo independientemente con su propio FIN. El servidor puede seguir enviando datos tras recibir el FIN del cliente antes de cerrar su propio lado. Por eso FIN-ACK y FIN-servidor son pasos separados.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre SYN-ACK y dos paquetes separados?</h4>
              <p>SYN-ACK es un solo paquete con ambos flags activos simultáneamente: optimización de red que reduce la latencia del handshake. El servidor confirma el SYN del cliente y envía su propio SYN en un único viaje de red en lugar de dos.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es TIME_WAIT y por qué dura 2×MSL?</h4>
              {/* Hallazgo 4571: daba «MSL ≈ 60 segundos» y «≈ 120s» como dato del estándar, sin
                  fuente. La especificación (RFC 9293) define el MSL y cada sistema fija su valor. */}
              <p>Estado tras el último ACK del cierre que espera posibles paquetes duplicados rezagados. El MSL (Maximum Segment Lifetime) es el tiempo máximo que un segmento puede seguir vivo en la red: la especificación de TCP (RFC 9293) lo define y cada sistema operativo fija su valor, así que lo que dura TIME_WAIT (2×MSL) cambia de una implementación a otra. Esa espera garantiza que ningún paquete de la conexión anterior pueda confundirse con una conexión nueva al mismo puerto.</p>
            </div>
          </div>
        </section>

        {/* Pasos */}
        <section>
          <h3>Cómo usar el simulador</h3>
          <div className={styles.guiaPasos}>
            <div className={styles.guiaPaso}>
              <div className={styles.guiaPasoNum}>1</div>
              <div><strong>Configura los ISN</strong> de cliente y servidor: vienen con los valores de ejemplo 1000 y 5000, o pulsa «ISN Aleatorio».</div>
            </div>
            <div className={styles.guiaPaso}>
              <div className={styles.guiaPasoNum}>2</div>
              <div><strong>Pulsa &quot;Siguiente&quot;</strong> para enviar el primer SYN — observa el número de secuencia y los flags en el panel.</div>
            </div>
            <div className={styles.guiaPaso}>
              <div className={styles.guiaPasoNum}>3</div>
              <div><strong>Avanza con SYN-ACK</strong> — nota que el servidor confirma ack=ISN_C+1 y envía su propio ISN.</div>
            </div>
            <div className={styles.guiaPaso}>
              <div className={styles.guiaPasoNum}>4</div>
              <div><strong>Completa con ACK</strong> — la conexión queda establecida: ambos extremos conocen los ISN del otro.</div>
            </div>
            <div className={styles.guiaPaso}>
              <div className={styles.guiaPasoNum}>5</div>
              <div><strong>Activa &quot;Apertura + Cierre&quot;</strong> y observa los 4 pasos del FIN handshake.</div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section>
          <h3>Conceptos clave</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🔢</span>
              <strong>seq+1 en el ACK</strong>
              <p>El SYN &quot;consume&quot; un número de secuencia (como si fuera 1 byte de datos), por eso ack = seq + 1 y no seq.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">↔️</span>
              <strong>Full-duplex</strong>
              <p>TCP permite flujo de datos en ambas direcciones simultáneamente tras el handshake: uploads y downloads ocurren en paralelo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🔒</span>
              <strong>TLS sobre TCP</strong>
              <p>HTTPS = TCP handshake (3 pasos) + TLS handshake + HTTP. QUIC (HTTP/3) combina ambos en 1 RTT para reducir latencia.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">⚡</span>
              <strong>QUIC reemplaza TCP</strong>
              <p>HTTP/3 usa QUIC (sobre UDP) que combina el handshake TCP+TLS en 1 RTT. YouTube y Google ya usan QUIC para millones de conexiones.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcono} aria-hidden="true">⚠️</span>
            <strong>5 errores frecuentes al estudiar TCP</strong>
          </div>
          <ul className={styles.warningLista}>
            <li><strong>Confundir seq y ack</strong> — seq es el número del byte que se envía; ack es el siguiente byte que se espera recibir del otro extremo.</li>
            <li><strong>Olvidar que SYN y FIN consumen 1 en la secuencia</strong> — ack = seq + 1, no seq. Es como si SYN/FIN enviaran 1 byte ficticio.</li>
            <li><strong>Pensar que UDP es &quot;peor&quot; que TCP</strong> — UDP es más rápido para streaming y juegos donde la latencia importa más que la fiabilidad de entrega.</li>
            <li><strong>Confundir el cierre TCP (4 pasos) con el handshake de apertura (3 pasos)</strong> — el FIN no cierra ambas direcciones a la vez: cada lado manda su propio FIN.</li>
            <li><strong>Ignorar TIME_WAIT</strong> — puede causar &quot;Address already in use&quot; en servidores que abren/cierran miles de conexiones por segundo. La solución es SO_REUSEADDR.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="simulador-tcp-handshake" />
      <Footer appName="simulador-tcp-handshake" />
    </div>
  );
}
