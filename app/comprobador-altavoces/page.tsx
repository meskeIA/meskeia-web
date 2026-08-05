'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './ComprobadorAltavoces.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import {
  RelatedApps,
  LegalNotice,
  ShareCard,
  EducationalSection,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

type Senal = 'tono' | 'ruidoRosa';
type Lado = 'izquierda' | 'derecha' | 'ambos';
type Percepcion = 'izquierda' | 'derecha' | 'centro' | 'nada';

/** Cadena de audio en marcha: se guarda entera para poder pararla con limpieza. */
interface CadenaActiva {
  fuentes: AudioScheduledSourceNode[];
  salida: GainNode;
  temporizadores: number[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Constantes de las pruebas
// ─────────────────────────────────────────────────────────────────────────────

/** Ganancia máxima aplicada al 100% del control: deja margen antes del recorte. */
const GANANCIA_MAXIMA = 0.5;

/** Tercios de octava del rango grave: lo que un subwoofer debe reproducir. */
const FRECUENCIAS_GRAVES = [20, 25, 31.5, 40, 50, 63, 80, 100];

/** Bandas de octava del espectro audible completo. */
const FRECUENCIAS_BANDAS = [63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

/** Referencia de lo que suele reproducir cada tipo de altavoz (para el texto de ayuda). */
const REFERENCIA_GRAVES: Record<number, string> = {
  20: 'Solo subwoofers grandes. En la mayoría de equipos no se oye nada o se nota como vibración.',
  25: 'Subwoofer doméstico de gama alta. Inaudible en altavoces pequeños.',
  31.5: 'Subwoofer doméstico. Un altavoz de escritorio no llega aquí.',
  40: 'Subwoofer o torre de suelo. Los monitores pequeños empiezan a insinuarlo.',
  50: 'Límite bajo de unos monitores de 5 pulgadas.',
  63: 'Alcanzable por buenos altavoces de escritorio y por casi todos los auriculares.',
  80: 'Frecuencia típica de corte entre subwoofer y satélites.',
  100: 'La reproduce casi cualquier altavoz salvo los de portátil y móvil.',
};

const ETIQUETAS_PERCEPCION: Record<Percepcion, string> = {
  izquierda: 'Por la izquierda',
  derecha: 'Por la derecha',
  centro: 'Centrado, por los dos',
  nada: 'No oí nada',
};

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades de audio
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Genera un búcle de ruido rosa (densidad espectral -3 dB/octava) con el filtro
 * de Paul Kellett. El ruido rosa reparte la energía por igual en cada octava, que
 * es como el oído juzga el timbre: por eso es la señal estándar para comparar
 * altavoces, mejor que un tono puro o que el ruido blanco (demasiado agudo).
 */
function crearBufferRuidoRosa(ctx: AudioContext): AudioBuffer {
  const duracion = 3;
  const muestras = ctx.sampleRate * duracion;
  const buffer = ctx.createBuffer(1, muestras, ctx.sampleRate);
  const datos = buffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < muestras; i++) {
    const blanco = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + blanco * 0.0555179;
    b1 = 0.99332 * b1 + blanco * 0.0750759;
    b2 = 0.969 * b2 + blanco * 0.153852;
    b3 = 0.8665 * b3 + blanco * 0.3104856;
    b4 = 0.55 * b4 + blanco * 0.5329522;
    b5 = -0.7616 * b5 - blanco * 0.016898;
    datos[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + blanco * 0.5362) * 0.11;
    b6 = blanco * 0.115926;
  }
  return buffer;
}

/** Formatea una frecuencia en Hz o kHz con separadores españoles. */
function formatearHz(hz: number): string {
  if (hz >= 1000) return `${formatNumber(hz / 1000, hz % 1000 === 0 ? 0 : 1)} kHz`;
  return `${formatNumber(hz, Number.isInteger(hz) ? 0 : 1)} Hz`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────

export default function ComprobadorAltavocesPage() {
  const [volumen, setVolumen] = useState(20);
  const [senal, setSenal] = useState<Senal>('ruidoRosa');
  const [activo, setActivo] = useState<string | null>(null);
  const [frecuenciaBarrido, setFrecuenciaBarrido] = useState(20);
  const [duracionBarrido, setDuracionBarrido] = useState(20);
  const [percepcionIzquierda, setPercepcionIzquierda] = useState<Percepcion | null>(null);
  const [percepcionDerecha, setPercepcionDerecha] = useState<Percepcion | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const bufferRosaRef = useRef<AudioBuffer | null>(null);
  const cadenaRef = useRef<CadenaActiva | null>(null);
  const rafRef = useRef<number | null>(null);
  const volumenRef = useRef(volumen);

  volumenRef.current = volumen;

  const ganancia = useCallback(() => (volumenRef.current / 100) * GANANCIA_MAXIMA, []);

  const obtenerContexto = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      const VentanaAudio =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new VentanaAudio();
    }
    return ctxRef.current;
  }, []);

  /** Corta lo que esté sonando con una rampa corta: un stop seco produce un chasquido. */
  const pararTodo = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const cadena = cadenaRef.current;
    if (cadena) {
      const ctx = ctxRef.current;
      cadena.temporizadores.forEach((id) => window.clearTimeout(id));
      if (ctx) {
        const ahora = ctx.currentTime;
        try {
          cadena.salida.gain.cancelScheduledValues(ahora);
          cadena.salida.gain.setValueAtTime(cadena.salida.gain.value, ahora);
          cadena.salida.gain.linearRampToValueAtTime(0, ahora + 0.04);
        } catch {
          // Un parámetro ya desconectado no impide seguir parando el resto
        }
        cadena.fuentes.forEach((fuente) => {
          try {
            fuente.stop(ahora + 0.06);
          } catch {
            // La fuente ya estaba parada
          }
        });
      }
      cadenaRef.current = null;
    }
    setActivo(null);
  }, []);

  /** Crea la fuente sonora según la señal elegida (el tono usa la frecuencia dada). */
  const crearFuente = useCallback(
    (ctx: AudioContext, frecuencia: number, forzarTono = false): AudioScheduledSourceNode => {
      if (senal === 'tono' || forzarTono) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frecuencia, ctx.currentTime);
        return osc;
      }
      if (!bufferRosaRef.current) bufferRosaRef.current = crearBufferRuidoRosa(ctx);
      const fuente = ctx.createBufferSource();
      fuente.buffer = bufferRosaRef.current;
      fuente.loop = true;
      return fuente;
    },
    [senal],
  );

  /** Prepara contexto + nodo de salida con entrada suave y registra la cadena. */
  const abrirCadena = useCallback(
    (ctx: AudioContext): GainNode => {
      const salida = ctx.createGain();
      const ahora = ctx.currentTime;
      salida.gain.setValueAtTime(0, ahora);
      salida.gain.linearRampToValueAtTime(ganancia(), ahora + 0.03);
      salida.connect(ctx.destination);
      cadenaRef.current = { fuentes: [], salida, temporizadores: [] };
      return salida;
    },
    [ganancia],
  );

  // ── Prueba 1: canales izquierdo y derecho ─────────────────────────────────
  const probarCanal = useCallback(
    (lado: Lado) => {
      const id = `canal-${lado}`;
      if (activo === id) {
        pararTodo();
        return;
      }
      pararTodo();
      const ctx = obtenerContexto();
      void ctx.resume();
      const salida = abrirCadena(ctx);
      const panorama = ctx.createStereoPanner();
      panorama.pan.setValueAtTime(lado === 'izquierda' ? -1 : lado === 'derecha' ? 1 : 0, ctx.currentTime);
      const fuente = crearFuente(ctx, 440);
      fuente.connect(panorama);
      panorama.connect(salida);
      fuente.start();
      cadenaRef.current?.fuentes.push(fuente);
      setActivo(id);
    },
    [abrirCadena, activo, crearFuente, obtenerContexto, pararTodo],
  );

  // ── Prueba 2: fase ────────────────────────────────────────────────────────
  const probarFase = useCallback(
    (enFase: boolean) => {
      const id = enFase ? 'fase-normal' : 'fase-invertida';
      if (activo === id) {
        pararTodo();
        return;
      }
      pararTodo();
      const ctx = obtenerContexto();
      void ctx.resume();
      const salida = abrirCadena(ctx);

      // Una sola fuente mono se reparte a los dos canales; en contrafase, el canal
      // derecho se multiplica por -1, que es exactamente lo que provoca un altavoz
      // con los cables de polaridad invertidos.
      const fuente = crearFuente(ctx, 200);
      const canalIzquierdo = ctx.createGain();
      const canalDerecho = ctx.createGain();
      canalIzquierdo.gain.setValueAtTime(1, ctx.currentTime);
      canalDerecho.gain.setValueAtTime(enFase ? 1 : -1, ctx.currentTime);

      const mezclador = ctx.createChannelMerger(2);
      fuente.connect(canalIzquierdo);
      fuente.connect(canalDerecho);
      canalIzquierdo.connect(mezclador, 0, 0);
      canalDerecho.connect(mezclador, 0, 1);
      mezclador.connect(salida);
      fuente.start();
      cadenaRef.current?.fuentes.push(fuente);
      setActivo(id);
    },
    [abrirCadena, activo, crearFuente, obtenerContexto, pararTodo],
  );

  // ── Prueba 3: barrido de frecuencia ───────────────────────────────────────
  const iniciarBarrido = useCallback(() => {
    if (activo === 'barrido') {
      pararTodo();
      return;
    }
    pararTodo();
    const ctx = obtenerContexto();
    void ctx.resume();
    const salida = abrirCadena(ctx);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const inicio = ctx.currentTime;
    const fin = inicio + duracionBarrido;
    // Rampa exponencial: el oído percibe la frecuencia en escala logarítmica, así
    // que una rampa lineal pasaría todos los graves en el primer instante.
    osc.frequency.setValueAtTime(20, inicio);
    osc.frequency.exponentialRampToValueAtTime(20000, fin);
    osc.connect(salida);
    osc.start(inicio);
    osc.stop(fin + 0.1);
    salida.gain.setValueAtTime(ganancia(), fin - 0.15);
    salida.gain.linearRampToValueAtTime(0, fin);
    cadenaRef.current?.fuentes.push(osc);
    setActivo('barrido');
    setFrecuenciaBarrido(20);

    const seguir = () => {
      const actual = osc.frequency.value;
      setFrecuenciaBarrido(actual);
      if (ctx.currentTime < fin) {
        rafRef.current = requestAnimationFrame(seguir);
      } else {
        rafRef.current = null;
        setActivo(null);
        cadenaRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(seguir);
  }, [abrirCadena, activo, duracionBarrido, ganancia, obtenerContexto, pararTodo]);

  // ── Pruebas 4 y 5: frecuencia fija (graves y bandas) ──────────────────────
  const probarFrecuencia = useCallback(
    (frecuencia: number, prefijo: string) => {
      const id = `${prefijo}-${frecuencia}`;
      if (activo === id) {
        pararTodo();
        return;
      }
      pararTodo();
      const ctx = obtenerContexto();
      void ctx.resume();
      const salida = abrirCadena(ctx);
      // Las pruebas de frecuencia usan siempre tono puro: con ruido rosa la banda
      // concreta que se quiere comprobar quedaría enmascarada por todas las demás.
      const osc = crearFuente(ctx, frecuencia, true);
      osc.connect(salida);
      osc.start();
      cadenaRef.current?.fuentes.push(osc);
      setActivo(id);
    },
    [abrirCadena, activo, crearFuente, obtenerContexto, pararTodo],
  );

  // ── Prueba 6: barrido estéreo ─────────────────────────────────────────────
  const probarPaneo = useCallback(() => {
    if (activo === 'paneo') {
      pararTodo();
      return;
    }
    pararTodo();
    const ctx = obtenerContexto();
    void ctx.resume();
    const salida = abrirCadena(ctx);
    const panorama = ctx.createStereoPanner();
    const inicio = ctx.currentTime;
    const tramo = 4;
    panorama.pan.setValueAtTime(-1, inicio);
    for (let ciclo = 0; ciclo < 3; ciclo++) {
      panorama.pan.linearRampToValueAtTime(1, inicio + tramo * (ciclo * 2 + 1));
      panorama.pan.linearRampToValueAtTime(-1, inicio + tramo * (ciclo * 2 + 2));
    }
    const fin = inicio + tramo * 6;
    const fuente = crearFuente(ctx, 440);
    fuente.connect(panorama);
    panorama.connect(salida);
    fuente.start(inicio);
    salida.gain.setValueAtTime(ganancia(), fin - 0.15);
    salida.gain.linearRampToValueAtTime(0, fin);
    fuente.stop(fin + 0.1);
    cadenaRef.current?.fuentes.push(fuente);
    const temporizador = window.setTimeout(() => {
      setActivo(null);
      cadenaRef.current = null;
    }, tramo * 6 * 1000);
    cadenaRef.current?.temporizadores.push(temporizador);
    setActivo('paneo');
  }, [abrirCadena, activo, crearFuente, ganancia, obtenerContexto, pararTodo]);

  // El control de volumen actúa sobre lo que ya está sonando, sin cortarlo
  useEffect(() => {
    const cadena = cadenaRef.current;
    const ctx = ctxRef.current;
    if (!cadena || !ctx) return;
    const ahora = ctx.currentTime;
    cadena.salida.gain.cancelScheduledValues(ahora);
    cadena.salida.gain.setValueAtTime(cadena.salida.gain.value, ahora);
    cadena.salida.gain.linearRampToValueAtTime((volumen / 100) * GANANCIA_MAXIMA, ahora + 0.05);
  }, [volumen]);

  // Al salir de la página no puede quedar audio sonando ni un contexto abierto
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      cadenaRef.current?.temporizadores.forEach((id) => window.clearTimeout(id));
      const ctx = ctxRef.current;
      if (ctx) {
        ctx.close().catch(() => {
          // El contexto ya estaba cerrado
        });
      }
    };
  }, []);

  // ── Diagnóstico de los canales ────────────────────────────────────────────
  const diagnostico = ((): { tipo: 'ok' | 'aviso' | 'error'; titulo: string; texto: string } | null => {
    if (!percepcionIzquierda || !percepcionDerecha) return null;

    if (percepcionIzquierda === 'nada' && percepcionDerecha === 'nada') {
      return {
        tipo: 'error',
        titulo: 'No llega señal a ningún canal',
        texto:
          'Si no se oye nada en ninguna de las dos pruebas, el problema está antes de los altavoces: volumen del sistema o de la app al mínimo, salida de audio equivocada en el selector del sistema operativo, o pestaña silenciada en el navegador. Comprueba esos tres puntos antes de sospechar del equipo.',
      };
    }
    if (percepcionIzquierda === 'nada' || percepcionDerecha === 'nada') {
      const mudo = percepcionIzquierda === 'nada' ? 'izquierdo' : 'derecho';
      return {
        tipo: 'error',
        titulo: `El canal ${mudo} no suena`,
        texto:
          'Un canal mudo apunta casi siempre a tres causas, por orden de probabilidad: cable o conector en mal estado (prueba a mover el jack mientras suena, si entra y sale es eso), balance del sistema desplazado hacia un lado, o altavoz averiado. Repite la prueba con otros auriculares para saber si el fallo viaja con el equipo o se queda en el ordenador.',
      };
    }
    if (percepcionIzquierda === 'derecha' && percepcionDerecha === 'izquierda') {
      return {
        tipo: 'error',
        titulo: 'Los canales están intercambiados',
        texto:
          'Lo que se envía por la izquierda sale por la derecha y viceversa. En auriculares suele ser simplemente que están puestos al revés (busca las marcas L y R). En altavoces con cable, revisa qué salida va a cada caja. En un equipo de sobremesa también puede venir de un adaptador o de una configuración de canales invertida en el sistema.',
      };
    }
    if (percepcionIzquierda === 'izquierda' && percepcionDerecha === 'derecha') {
      return {
        tipo: 'ok',
        titulo: 'Los dos canales funcionan y están bien orientados',
        texto:
          'La separación estéreo es correcta: cada canal suena por su lado. Con esto descartado, si sigues notando algo raro en el sonido, continúa con la prueba de fase (detecta un altavoz con la polaridad invertida, que no afecta a los canales pero sí a los graves) y con el barrido de frecuencia.',
      };
    }
    return {
      tipo: 'aviso',
      titulo: 'La separación entre canales no es limpia',
      texto:
        'Has percibido al menos una de las señales como centrada o por el lado contrario al esperado. Suele deberse a un altavoz mono, a un modo de sonido envolvente o de "mejora de audio" activo en el sistema, o a que los dos altavoces están tan juntos que el oído no los separa. Con auriculares el resultado debería ser inequívoco: si con ellos sale limpio, el problema es de colocación o de procesado, no de canales.',
    };
  })();

  const relatedApps = getRelatedApps('comprobador-altavoces');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">🔊</span> Comprobador de Altavoces y Auriculares
        </h1>
        <p className={styles.subtitle}>
          Prueba tus altavoces, bocinas, parlantes, auriculares o audífonos: canal izquierdo y
          derecho, fase, barrido de 20 Hz a 20 kHz y tonos de graves. Diagnostica el equipo, no tu
          oído.
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="technical"
        severity="medium"
        collapsible={true}
        context="comprobador-altavoces-disclaimer"
      />

      <div className={styles.mainContent}>
        {/* ── Panel de control global ── */}
        <section className={styles.panel} aria-label="Control de la señal de prueba">
          <div className={styles.avisoVolumen} role="note">
            <span className={styles.avisoIcono} aria-hidden="true">
              🔉
            </span>
            <p>
              <strong>Baja el volumen del sistema antes de empezar</strong> y súbelo poco a poco. Los
              tonos sostenidos y los barridos exigen mucho más a un altavoz que la música: a volumen
              alto pueden dañar el equipo y el oído.
            </p>
          </div>

          <div className={styles.controles}>
            <div className={styles.campo}>
              <label className={styles.etiqueta} htmlFor="volumen">
                Volumen de la prueba: <strong>{formatNumber(volumen, 0)} %</strong>
              </label>
              <input
                id="volumen"
                type="range"
                className={styles.slider}
                min={0}
                max={100}
                step={5}
                value={volumen}
                onChange={(e) => setVolumen(Number(e.target.value))}
              />
              <span className={styles.ayuda}>
                Este control es independiente del volumen del sistema y nunca llega a fondo de
                escala: deja margen para evitar el recorte de la señal.
              </span>
            </div>

            <div className={styles.campo}>
              <span className={styles.etiqueta} id="etiqueta-senal">
                Señal para las pruebas de canal, fase y barrido estéreo
              </span>
              <div className={styles.grupoBotones} role="group" aria-labelledby="etiqueta-senal">
                <button
                  type="button"
                  className={`${styles.btnSenal} ${senal === 'ruidoRosa' ? styles.btnSenalActivo : ''}`}
                  aria-pressed={senal === 'ruidoRosa'}
                  onClick={() => {
                    pararTodo();
                    setSenal('ruidoRosa');
                  }}
                >
                  Ruido rosa
                </button>
                <button
                  type="button"
                  className={`${styles.btnSenal} ${senal === 'tono' ? styles.btnSenalActivo : ''}`}
                  aria-pressed={senal === 'tono'}
                  onClick={() => {
                    pararTodo();
                    setSenal('tono');
                  }}
                >
                  Tono puro
                </button>
              </div>
              <span className={styles.ayuda}>
                El ruido rosa contiene todas las frecuencias y es la señal estándar para juzgar
                altavoces. El tono puro es más incómodo pero deja oír mejor un zumbido o una
                resonancia. Las pruebas de graves y de bandas usan siempre tono puro.
              </span>
            </div>
          </div>

          <button type="button" className={styles.btnParar} onClick={pararTodo} disabled={!activo}>
            <span aria-hidden="true">⏹</span> Parar el sonido
          </button>
        </section>

        {/* ── Prueba 1: canales ── */}
        <section className={styles.prueba} aria-labelledby="prueba-canales">
          <header className={styles.pruebaHeader}>
            <span className={styles.pruebaNumero}>1</span>
            <div>
              <h2 id="prueba-canales" className={styles.pruebaTitulo}>
                Canal izquierdo y canal derecho
              </h2>
              <p className={styles.pruebaTexto}>
                Envía la señal a un solo lado. Sirve para detectar un canal mudo y, sobre todo,
                unos canales intercambiados: un fallo silencioso que estropea el estéreo sin que se
                note en el día a día.
              </p>
            </div>
          </header>

          <div className={styles.filaBotones}>
            <button
              type="button"
              className={`${styles.btnPrueba} ${activo === 'canal-izquierda' ? styles.btnPruebaActivo : ''}`}
              aria-pressed={activo === 'canal-izquierda'}
              onClick={() => probarCanal('izquierda')}
            >
              <span aria-hidden="true">◀</span> Solo izquierda
            </button>
            <button
              type="button"
              className={`${styles.btnPrueba} ${activo === 'canal-ambos' ? styles.btnPruebaActivo : ''}`}
              aria-pressed={activo === 'canal-ambos'}
              onClick={() => probarCanal('ambos')}
            >
              Los dos
            </button>
            <button
              type="button"
              className={`${styles.btnPrueba} ${activo === 'canal-derecha' ? styles.btnPruebaActivo : ''}`}
              aria-pressed={activo === 'canal-derecha'}
              onClick={() => probarCanal('derecha')}
            >
              Solo derecha <span aria-hidden="true">▶</span>
            </button>
          </div>

          <div className={styles.diagnostico}>
            <div className={styles.diagnosticoBloque}>
              <p className={styles.diagnosticoPregunta} id="preg-izq">
                Con <strong>&laquo;Solo izquierda&raquo;</strong>, ¿por dónde lo oíste?
              </p>
              <div className={styles.grupoBotones} role="group" aria-labelledby="preg-izq">
                {(Object.keys(ETIQUETAS_PERCEPCION) as Percepcion[]).map((opcion) => (
                  <button
                    key={opcion}
                    type="button"
                    className={`${styles.btnRespuesta} ${percepcionIzquierda === opcion ? styles.btnRespuestaActiva : ''}`}
                    aria-pressed={percepcionIzquierda === opcion}
                    onClick={() => setPercepcionIzquierda(opcion)}
                  >
                    {ETIQUETAS_PERCEPCION[opcion]}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.diagnosticoBloque}>
              <p className={styles.diagnosticoPregunta} id="preg-der">
                Con <strong>&laquo;Solo derecha&raquo;</strong>, ¿por dónde lo oíste?
              </p>
              <div className={styles.grupoBotones} role="group" aria-labelledby="preg-der">
                {(Object.keys(ETIQUETAS_PERCEPCION) as Percepcion[]).map((opcion) => (
                  <button
                    key={opcion}
                    type="button"
                    className={`${styles.btnRespuesta} ${percepcionDerecha === opcion ? styles.btnRespuestaActiva : ''}`}
                    aria-pressed={percepcionDerecha === opcion}
                    onClick={() => setPercepcionDerecha(opcion)}
                  >
                    {ETIQUETAS_PERCEPCION[opcion]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {diagnostico && (
            <div
              className={`${styles.resultado} ${
                diagnostico.tipo === 'ok'
                  ? styles.resultadoOk
                  : diagnostico.tipo === 'aviso'
                    ? styles.resultadoAviso
                    : styles.resultadoError
              }`}
              role="status"
              aria-live="polite"
            >
              <h3>{diagnostico.titulo}</h3>
              <p>{diagnostico.texto}</p>
              <button
                type="button"
                className={styles.btnReiniciar}
                onClick={() => {
                  setPercepcionIzquierda(null);
                  setPercepcionDerecha(null);
                }}
              >
                Repetir la prueba
              </button>
            </div>
          )}
        </section>

        {/* ── Prueba 2: fase ── */}
        <section className={styles.prueba} aria-labelledby="prueba-fase">
          <header className={styles.pruebaHeader}>
            <span className={styles.pruebaNumero}>2</span>
            <div>
              <h2 id="prueba-fase" className={styles.pruebaTitulo}>
                Prueba de fase (polaridad)
              </h2>
              <p className={styles.pruebaTexto}>
                La misma señal por los dos canales, primero igual y después con uno invertido.
                Detecta un altavoz con los cables de polaridad cambiados, que no deja mudo nada
                pero vacía los graves y desdibuja el centro de la escena sonora.
              </p>
            </div>
          </header>

          <div className={styles.filaBotones}>
            <button
              type="button"
              className={`${styles.btnPrueba} ${activo === 'fase-normal' ? styles.btnPruebaActivo : ''}`}
              aria-pressed={activo === 'fase-normal'}
              onClick={() => probarFase(true)}
            >
              En fase (correcto)
            </button>
            <button
              type="button"
              className={`${styles.btnPrueba} ${activo === 'fase-invertida' ? styles.btnPruebaActivo : ''}`}
              aria-pressed={activo === 'fase-invertida'}
              onClick={() => probarFase(false)}
            >
              En contrafase (invertido)
            </button>
          </div>

          <div className={styles.claves}>
            <p>
              <strong>Qué deberías notar:</strong> en fase, el sonido se percibe compacto y
              centrado, como si naciera de un punto entre los dos altavoces. En contrafase se
              vuelve difuso, se escapa hacia los lados y pierde cuerpo en los graves. Con
              auriculares, la contrafase produce una sensación característica de presión dentro de
              la cabeza.
            </p>
            <p>
              <strong>Si no notas diferencia:</strong> lo más probable es que uno de los altavoces
              ya esté conectado con la polaridad invertida (y entonces la versión &laquo;en
              contrafase&raquo; es la que suena bien), o que la señal no sea estéreo real.
            </p>
          </div>
        </section>

        {/* ── Prueba 3: barrido ── */}
        <section className={styles.prueba} aria-labelledby="prueba-barrido">
          <header className={styles.pruebaHeader}>
            <span className={styles.pruebaNumero}>3</span>
            <div>
              <h2 id="prueba-barrido" className={styles.pruebaTitulo}>
                Barrido de 20 Hz a 20 kHz
              </h2>
              <p className={styles.pruebaTexto}>
                Recorre todo el espectro audible de forma continua. Es la prueba que revela
                zumbidos por resonancia del mueble, huecos donde el sonido desaparece y distorsión
                en los extremos.
              </p>
            </div>
          </header>

          <div className={styles.filaBotones}>
            <button
              type="button"
              className={`${styles.btnPrueba} ${styles.btnPruebaAncho} ${activo === 'barrido' ? styles.btnPruebaActivo : ''}`}
              aria-pressed={activo === 'barrido'}
              onClick={iniciarBarrido}
            >
              {activo === 'barrido' ? 'Parar el barrido' : 'Iniciar barrido'}
            </button>
            <div className={styles.grupoBotones} role="group" aria-label="Duración del barrido">
              {[10, 20, 30].map((segundos) => (
                <button
                  key={segundos}
                  type="button"
                  className={`${styles.btnDuracion} ${duracionBarrido === segundos ? styles.btnDuracionActiva : ''}`}
                  aria-pressed={duracionBarrido === segundos}
                  onClick={() => setDuracionBarrido(segundos)}
                  disabled={activo === 'barrido'}
                >
                  {segundos} s
                </button>
              ))}
            </div>
          </div>

          <div className={styles.marcador} role="status" aria-live="off">
            <span className={styles.marcadorValor}>{formatearHz(Math.round(frecuenciaBarrido))}</span>
            <div className={styles.barra}>
              <div
                className={styles.barraRelleno}
                style={{
                  width: `${Math.min(100, (Math.log10(Math.max(frecuenciaBarrido, 20) / 20) / Math.log10(1000)) * 100)}%`,
                }}
              />
            </div>
            <div className={styles.barraEscala} aria-hidden="true">
              <span>20 Hz</span>
              <span>200 Hz</span>
              <span>2 kHz</span>
              <span>20 kHz</span>
            </div>
          </div>
        </section>

        {/* ── Prueba 4: graves ── */}
        <section className={styles.prueba} aria-labelledby="prueba-graves">
          <header className={styles.pruebaHeader}>
            <span className={styles.pruebaNumero}>4</span>
            <div>
              <h2 id="prueba-graves" className={styles.pruebaTitulo}>
                Graves y subwoofer, por tercios de octava
              </h2>
              <p className={styles.pruebaTexto}>
                Tonos puros del rango grave, uno a uno. La frecuencia más baja que aún se oye
                limpia (sin chasquido ni vibración áspera) es el límite real de tu equipo.
              </p>
            </div>
          </header>

          <div className={styles.rejillaFrecuencias}>
            {FRECUENCIAS_GRAVES.map((hz) => (
              <button
                key={hz}
                type="button"
                className={`${styles.btnFrecuencia} ${activo === `grave-${hz}` ? styles.btnFrecuenciaActiva : ''}`}
                aria-pressed={activo === `grave-${hz}`}
                onClick={() => probarFrecuencia(hz, 'grave')}
                title={REFERENCIA_GRAVES[hz]}
              >
                {formatearHz(hz)}
              </button>
            ))}
          </div>

          <p className={styles.ayuda}>
            Referencia: un altavoz de portátil o de móvil rara vez produce algo audible por debajo
            de 150 Hz; unos monitores de escritorio de 5 pulgadas bajan a 60-80 Hz; un subwoofer
            doméstico llega a 30-40 Hz. Si a 40 Hz solo oyes un golpeteo, no es que falte grave: es
            distorsión, y conviene bajar el volumen.
          </p>
        </section>

        {/* ── Prueba 5: bandas ── */}
        <section className={styles.prueba} aria-labelledby="prueba-bandas">
          <header className={styles.pruebaHeader}>
            <span className={styles.pruebaNumero}>5</span>
            <div>
              <h2 id="prueba-bandas" className={styles.pruebaTitulo}>
                Bandas de octava del espectro completo
              </h2>
              <p className={styles.pruebaTexto}>
                De 63 Hz a 16 kHz, octava a octava. Todas deberían oírse con un volumen parecido:
                una banda notablemente más floja que sus vecinas señala un hueco en la respuesta
                del altavoz o del propio equipo.
              </p>
            </div>
          </header>

          <div className={styles.rejillaFrecuencias}>
            {FRECUENCIAS_BANDAS.map((hz) => (
              <button
                key={hz}
                type="button"
                className={`${styles.btnFrecuencia} ${activo === `banda-${hz}` ? styles.btnFrecuenciaActiva : ''}`}
                aria-pressed={activo === `banda-${hz}`}
                onClick={() => probarFrecuencia(hz, 'banda')}
              >
                {formatearHz(hz)}
              </button>
            ))}
          </div>

          <p className={styles.ayuda}>
            Que no oigas los 16 kHz no significa que el altavoz falle: la audición adulta pierde
            agudos con la edad y rara vez pasa de 15-17 kHz a partir de los 40 años. Esta prueba
            mide el equipo, y para eso hay que compararla con otro equipo, no con lo que uno espera
            oír.
          </p>
        </section>

        {/* ── Prueba 6: paneo ── */}
        <section className={styles.prueba} aria-labelledby="prueba-paneo">
          <header className={styles.pruebaHeader}>
            <span className={styles.pruebaNumero}>6</span>
            <div>
              <h2 id="prueba-paneo" className={styles.pruebaTitulo}>
                Barrido estéreo continuo
              </h2>
              <p className={styles.pruebaTexto}>
                La señal viaja de un lado a otro durante 24 segundos. El desplazamiento debe ser
                suave y pasar por el centro sin saltos ni bajones de volumen.
              </p>
            </div>
          </header>

          <div className={styles.filaBotones}>
            <button
              type="button"
              className={`${styles.btnPrueba} ${styles.btnPruebaAncho} ${activo === 'paneo' ? styles.btnPruebaActivo : ''}`}
              aria-pressed={activo === 'paneo'}
              onClick={probarPaneo}
            >
              {activo === 'paneo' ? 'Parar el barrido estéreo' : 'Iniciar barrido estéreo'}
            </button>
          </div>

          <p className={styles.ayuda}>
            Un bajón de volumen justo al pasar por el centro es la firma de un altavoz en
            contrafase: en el punto medio las dos ondas se cancelan. Si lo detectas aquí,
            confírmalo con la prueba 2.
          </p>
        </section>
      </div>

      <EducationalSection
        title="Cómo interpretar lo que oyes"
        subtitle="Qué prueba cada señal, qué es normal en cada tipo de equipo y qué fallos delata cada síntoma"
        defaultOpen={false}
      >
        <section>
          {/* SECCIÓN 1: Tabla comparativa */}
          <div className={styles.eduComparativaSection}>
            <h3>
              <span aria-hidden="true">📊</span> Qué detecta cada prueba
            </h3>
            <div className={styles.eduTablaWrapper}>
              <table className={styles.eduTablaComparativa}>
                <thead>
                  <tr>
                    <th>Prueba</th>
                    <th>Señal</th>
                    <th>Qué detecta</th>
                    <th>Síntoma del fallo</th>
                    <th>Dónde suele estar la causa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Canales L/R</strong>
                    </td>
                    <td>Ruido rosa o tono, un solo lado</td>
                    <td>Canal mudo, canales cruzados, balance desviado</td>
                    <td>No se oye nada, o se oye por el lado contrario</td>
                    <td>Cable, conector, balance del sistema, auriculares al revés</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Fase</strong>
                    </td>
                    <td>Misma señal, un canal invertido</td>
                    <td>Polaridad invertida en un altavoz</td>
                    <td>No hay diferencia audible entre fase y contrafase</td>
                    <td>Cables + y − intercambiados en una caja</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Barrido</strong>
                    </td>
                    <td>Tono continuo 20 Hz → 20 kHz</td>
                    <td>Huecos, resonancias y distorsión</td>
                    <td>Zumbido en una zona, silencios, aspereza</td>
                    <td>Mueble que vibra, altavoz forzado, ecualizador activo</td>
                  </tr>
                  <tr>
                    <td>Graves por tercios</td>
                    <td>Tono puro de 20 a 100 Hz</td>
                    <td>Límite inferior real del equipo</td>
                    <td>Chasquido o vibración en vez de nota</td>
                    <td>Altavoz pequeño llevado fuera de su rango</td>
                  </tr>
                  <tr>
                    <td>Bandas de octava</td>
                    <td>Tono puro de 63 Hz a 16 kHz</td>
                    <td>Equilibrio tonal entre zonas del espectro</td>
                    <td>Una banda mucho más floja que sus vecinas</td>
                    <td>Altavoz dañado, ecualización, colocación</td>
                  </tr>
                  <tr>
                    <td>Barrido estéreo</td>
                    <td>Señal que se desplaza de lado a lado</td>
                    <td>Continuidad de la imagen estéreo</td>
                    <td>Salto o bajón de volumen al pasar por el centro</td>
                    <td>Contrafase, procesado envolvente activo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECCIÓN 2: Casos de uso */}
          <div className={styles.eduEscenariosSection}>
            <h3>
              <span aria-hidden="true">🎯</span> Cuándo merece la pena hacer estas pruebas
            </h3>
            <div className={styles.eduEscenariosGrid}>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon} aria-hidden="true">
                  📦
                </div>
                <h4>Auriculares recién comprados</h4>
                <p>
                  Antes de que venza el plazo de devolución conviene comprobar los dos canales y el
                  equilibrio entre ellos. Un canal ligeramente más flojo que el otro es un defecto
                  de fabricación difícil de percibir con música, pero evidente con ruido rosa
                  alternando lados. Es el momento en que reclamar sale gratis.
                </p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon} aria-hidden="true">
                  🔌
                </div>
                <h4>Después de recablear un equipo</h4>
                <p>
                  Al mover altavoces de sitio o cambiar cables es fácil invertir la polaridad de una
                  caja: los dos altavoces suenan, así que nada delata el error salvo que el sonido
                  queda &laquo;hueco&raquo;. La prueba de fase lo resuelve en diez segundos y evita
                  meses escuchando un estéreo estropeado.
                </p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon} aria-hidden="true">
                  🎬
                </div>
                <h4>Antes de una reunión o una clase</h4>
                <p>
                  Un canal mudo en el portátil se descubre normalmente en el peor momento. Treinta
                  segundos con las pruebas 1 y 5 confirman que hay sonido por los dos lados y que no
                  hay una salida de audio equivocada seleccionada en el sistema.
                </p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioIcon} aria-hidden="true">
                  🛠️
                </div>
                <h4>Segunda mano y reparación</h4>
                <p>
                  Al comprar altavoces usados, el barrido revela en un minuto lo que la música puede
                  esconder: bobinas rozando, conos dañados o rejillas sueltas se manifiestan como
                  aspereza o zumbido en una zona concreta del espectro, no en todo el rango.
                </p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: FAQ */}
          <div className={styles.eduFaqSection}>
            <h3>
              <span aria-hidden="true">❓</span> Preguntas frecuentes
            </h3>
            <div className={styles.eduFaqList}>
              <div className={styles.eduFaqItem}>
                <h4>¿Cómo sé si mis auriculares tienen los canales cambiados?</h4>
                <p>
                  Reproduce la señal solo por el canal izquierdo y comprueba por qué lado la oyes.
                  Si suena por el oído derecho, los canales están intercambiados. Repite con el
                  canal derecho: si las dos pruebas salen cruzadas, el equipo está invertido; si
                  solo falla una, lo más probable es un canal averiado. En auriculares, la causa
                  número uno es tenerlos puestos al revés, porque las marcas L y R suelen estar en
                  relieve y sin contraste.
                </p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Qué es exactamente la fase y por qué importa?</h4>
                <p>
                  Un altavoz mueve el aire hacia fuera o hacia dentro según el signo de la señal
                  eléctrica. Si los cables de una caja están conectados al revés, ese altavoz empuja
                  cuando el otro tira. En las frecuencias graves, donde la longitud de onda es
                  mucho mayor que la distancia entre los altavoces, las dos ondas se cancelan
                  parcialmente y el resultado es un sonido sin cuerpo y sin centro. No rompe nada,
                  pero degrada todo lo que se escuche en ese equipo.
                </p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Por qué no oigo los tonos de 20 o 30 Hz?</h4>
                <p>
                  Porque casi ningún altavoz doméstico los reproduce. Un altavoz solo genera
                  presión sonora útil por encima de su frecuencia de sintonía, que depende sobre
                  todo del diámetro del cono y del volumen de la caja. Por debajo de ese punto, la
                  energía se convierte en recorrido mecánico sin sonido: de ahí el chasquido o la
                  vibración. No es un fallo del equipo, es física; el fallo sería forzarlo a
                  volumen alto.
                </p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Puedo usar esto para medir la calidad de unos altavoces?</h4>
                <p>
                  Para comparar dos equipos entre sí, sí, siempre que la señal y el volumen sean
                  los mismos. Para obtener una medida objetiva, no: haría falta un micrófono de
                  medición calibrado y una sala tratada, porque lo que llega al oído incluye las
                  reflexiones de la habitación, que a menudo pesan más que el propio altavoz. Lo
                  que aquí se obtiene es un diagnóstico de fallos, no una curva de respuesta.
                </p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Sirve para saber si oigo bien?</h4>
                <p>
                  No. Se mide el equipo, no la audición. Un navegador, una tarjeta de sonido
                  doméstica y unos auriculares sin calibrar no permiten saber a qué nivel real
                  llega cada frecuencia al oído, así que no puede deducirse nada sobre la capacidad
                  auditiva de nadie. Para eso está la audiometría, con equipos calibrados y en
                  cabina. Si notas que oyes peor por un oído, la prueba que corresponde es la de un
                  profesional sanitario.
                </p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Por qué el ruido rosa y no el ruido blanco?</h4>
                <p>
                  El ruido blanco tiene la misma energía por hercio, y como cada octava alta
                  contiene el doble de hercios que la anterior, el oído lo percibe como un siseo
                  agudo y desequilibrado. El ruido rosa reparte la misma energía por octava, que es
                  la escala en que trabaja la audición, y por eso suena neutro y sirve para juzgar
                  el timbre de un altavoz. Es el estándar en instalación de sonido.
                </p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Suena distinto con Bluetooth?</h4>
                <p>
                  Puede, y conviene saberlo antes de culpar al altavoz. Los códecs Bluetooth
                  comprimen con pérdida y algunos recortan por encima de 14-16 kHz, así que las
                  bandas más agudas pueden salir más flojas por el enlace, no por el altavoz.
                  Además, muchos dispositivos aplican procesado propio de graves. Para diagnosticar
                  un equipo, la conexión por cable siempre es más fiable.
                </p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>¿Se guardan mis respuestas del diagnóstico?</h4>
                <p>
                  No. Todo ocurre en el navegador: las señales se generan localmente con Web Audio
                  API y las respuestas del diagnóstico viven solo en la memoria de la página. Al
                  cerrarla desaparecen. No hay micrófono implicado en ninguna prueba, así que la
                  página no pide ningún permiso.
                </p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: Guía paso a paso */}
          <div className={styles.eduStepSection}>
            <h3>
              <span aria-hidden="true">📚</span> Orden recomendado para diagnosticar un equipo
            </h3>
            <div className={styles.eduStepList}>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>1</div>
                <div className={styles.eduStepContent}>
                  <h4>Descarta primero lo que no es el altavoz</h4>
                  <p>
                    Antes de probar nada, comprueba el volumen del sistema, que la pestaña del
                    navegador no esté silenciada y que la salida de audio seleccionada sea la que
                    crees. La mayoría de los &laquo;altavoces averiados&raquo; son en realidad una
                    salida equivocada: el sistema sigue enviando el sonido a unos auriculares
                    apagados o a un monitor sin altavoces.
                  </p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>2</div>
                <div className={styles.eduStepContent}>
                  <h4>Empieza por los canales, a volumen bajo</h4>
                  <p>
                    La prueba 1 es la más informativa y la menos exigente para el equipo. Responde
                    a las dos preguntas del diagnóstico con honestidad: si dudas de por dónde suena,
                    esa duda ya es un dato, porque con auriculares la separación debería ser
                    inequívoca.
                  </p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>3</div>
                <div className={styles.eduStepContent}>
                  <h4>Comprueba la fase si usas dos altavoces separados</h4>
                  <p>
                    Con auriculares la contrafase se nota como una presión rara; con altavoces, como
                    una pérdida de graves. Este paso no aplica a un altavoz único ni a una barra de
                    sonido, donde la relación entre canales la fija el fabricante.
                  </p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>4</div>
                <div className={styles.eduStepContent}>
                  <h4>Haz el barrido con atención a los ruidos añadidos</h4>
                  <p>
                    Lo que se busca no es oír todo el rango, sino detectar lo que no debería estar:
                    un zumbido que aparece y desaparece en una zona concreta suele ser una pieza
                    del mueble o de la carcasa que resuena, no el altavoz. Localízalo tocando el
                    mueble con la mano mientras suena esa frecuencia.
                  </p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>5</div>
                <div className={styles.eduStepContent}>
                  <h4>Busca el límite grave real, sin forzar</h4>
                  <p>
                    Baja por los tercios de octava hasta que la nota deje de percibirse como nota.
                    Ese punto es el límite útil de tu equipo y explica por qué cierta música suena
                    delgada. En cuanto aparezca aspereza o golpeteo, para: seguir subiendo el
                    volumen para &laquo;oírlo mejor&raquo; es la forma más habitual de quemar una
                    bobina.
                  </p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>6</div>
                <div className={styles.eduStepContent}>
                  <h4>Repite con otro equipo antes de concluir</h4>
                  <p>
                    Un síntoma solo tiene sentido comparado. Si el mismo fallo aparece con otros
                    auriculares en el mismo ordenador, el problema está en el ordenador o en su
                    configuración; si viaja con los auriculares a otro dispositivo, el problema es
                    del equipo. Este paso ahorra la mayoría de los diagnósticos equivocados.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 5: Tips */}
          <div className={styles.eduTipsSection}>
            <h3>
              <span aria-hidden="true">✅</span> Buenas prácticas al hacer pruebas de audio
            </h3>
            <div className={styles.eduTipsGrid}>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">
                  🔉
                </span>
                <h4>El volumen sube, nunca baja</h4>
                <p>
                  Empieza siempre por debajo de lo cómodo y sube en pasos pequeños. Un tono puro a
                  un nivel que en música resultaría normal puede ser molesto y dañino, porque toda
                  la energía se concentra en una sola frecuencia.
                </p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">
                  🎛️
                </span>
                <h4>Desactiva las mejoras de sonido</h4>
                <p>
                  Ecualizadores, refuerzo de graves, sonido envolvente virtual y modos de
                  &laquo;audio inmersivo&raquo; alteran justo lo que se quiere medir. Si el sistema
                  los aplica, el diagnóstico será sobre el procesado, no sobre el altavoz.
                </p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">
                  📍
                </span>
                <h4>La sala cuenta tanto como el altavoz</h4>
                <p>
                  Los graves cambian mucho con la posición: pegado a una pared, un altavoz refuerza
                  las frecuencias bajas; en una esquina, más todavía. Antes de dar por defectuoso
                  un equipo, prueba a moverlo medio metro.
                </p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">
                  🎧
                </span>
                <h4>Los auriculares aíslan variables</h4>
                <p>
                  Cuando el resultado con altavoces sea confuso, repite con auriculares por cable:
                  eliminan la sala, la colocación y el Bluetooth de la ecuación. Si con ellos todo
                  sale limpio, el fallo está en los altavoces o en su entorno.
                </p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">
                  ⏱️
                </span>
                <h4>Sesiones cortas</h4>
                <p>
                  El oído se adapta rápido a un tono sostenido y deja de ser un buen juez en menos
                  de un minuto. Pruebas breves, con pausas, dan resultados más fiables que una
                  escucha larga.
                </p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">
                  📝
                </span>
                <h4>Anota antes de interpretar</h4>
                <p>
                  Escribe qué oíste en cada prueba antes de sacar conclusiones. Es fácil convencerse
                  de oír lo que se espera, sobre todo al repetir una prueba después de haber
                  formado una hipótesis.
                </p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 6: Errores frecuentes */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              <h3>Errores frecuentes al interpretar estas pruebas</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confundir el equipo con el oído:</strong> no oír 16 kHz es lo normal a
                partir de cierta edad y no dice nada del altavoz. Esta herramienta diagnostica
                material, no personas; cualquier duda sobre la propia audición corresponde a una
                audiometría hecha por un profesional.
              </li>
              <li>
                <strong>Subir el volumen para oír los graves más bajos:</strong> es la forma más
                habitual de dañar un altavoz pequeño. Si a 30 Hz no hay nota, no la habrá tampoco
                más fuerte: solo habrá más recorrido mecánico y más calor en la bobina.
              </li>
              <li>
                <strong>Probar con las mejoras de audio activadas:</strong> un refuerzo de graves o
                un modo envolvente puede inventar sensación de canal cruzado o tapar un canal
                flojo. El diagnóstico solo es válido con el procesado desactivado.
              </li>
              <li>
                <strong>Dar por bueno un solo intento:</strong> la percepción de por dónde suena
                algo depende de la postura, de la posición de la cabeza y de la expectativa. Repite
                cada prueba dos veces, y si puede ser, sin mirar qué botón has pulsado.
              </li>
              <li>
                <strong>Sacar conclusiones con Bluetooth de por medio:</strong> el códec puede
                recortar agudos y aplicar su propio procesado. Un resultado raro por Bluetooth debe
                confirmarse por cable antes de culpar al altavoz.
              </li>
              <li>
                <strong>Buscar defectos con música en vez de con señales:</strong> la música tapa
                los fallos porque cambia constantemente. Un canal un 20 % más flojo pasa
                desapercibido con una canción y es evidente con ruido rosa alternando lados.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={relatedApps} />

      <ShareCard appName="comprobador-altavoces" />
      <Footer appName="comprobador-altavoces" />
    </div>
  );
}
