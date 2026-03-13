'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styles from './LectorTextoVoz.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type EstadoLector = 'parado' | 'reproduciendo' | 'pausado';

interface VozItem {
  nombre: string;
  lang: string;
  voz: SpeechSynthesisVoice;
}

const TEXTO_EJEMPLO = `La lectura en voz alta es una herramienta poderosa para personas con discapacidad visual, dislexia, fatiga visual o simplemente para quienes aprenden mejor escuchando.

Pega aquí el texto que quieras escuchar: un artículo, unos apuntes, un correo electrónico o cualquier contenido que necesites procesar.

Las palabras se irán resaltando conforme se leen, para que puedas seguir el texto con facilidad.`;

export default function LectorTextoVozPage() {
  const [texto, setTexto] = useState(TEXTO_EJEMPLO);
  const [estado, setEstado] = useState<EstadoLector>('parado');
  const [velocidad, setVelocidad] = useState(1.0);
  const [tono, setTono] = useState(1.0);
  const [voces, setVoces] = useState<VozItem[]>([]);
  const [vozSeleccionada, setVozSeleccionada] = useState('');
  const [palabraActual, setPalabraActual] = useState(-1);
  const [soportado, setSoportado] = useState(true);
  const [vistaActiva, setVistaActiva] = useState<'editar' | 'escuchar'>('editar');

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const palabraResaltadaRef = useRef<HTMLElement | null>(null);

  // Tokenizar texto en palabras y espacios
  const tokens = useMemo(() => texto.split(/(\s+)/), [texto]);

  // Pre-calcular índice de palabra para cada token
  const tokenConIndice = useMemo(() => {
    let contadorPalabras = 0;
    return tokens.map(token => {
      if (/^\s+$/.test(token)) return { token, idxPalabra: -1 };
      return { token, idxPalabra: contadorPalabras++ };
    });
  }, [tokens]);

  // Mapa de posición de carácter → índice de palabra
  const mapaCharPalabra = useMemo(() => {
    const mapa = new Map<number, number>();
    let pos = 0;
    for (const { token, idxPalabra } of tokenConIndice) {
      if (idxPalabra >= 0) {
        for (let i = 0; i < token.length; i++) {
          mapa.set(pos + i, idxPalabra);
        }
      }
      pos += token.length;
    }
    return mapa;
  }, [tokenConIndice]);

  // Cargar voces del navegador
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSoportado(false);
      return;
    }

    const cargarVoces = () => {
      const todas = window.speechSynthesis.getVoices();
      const espanol = todas
        .filter(v => v.lang.startsWith('es'))
        .map(v => ({ nombre: v.name, lang: v.lang, voz: v }));

      const lista = espanol.length > 0
        ? espanol
        : todas.map(v => ({ nombre: v.name, lang: v.lang, voz: v }));

      setVoces(lista);
      if (lista.length > 0) setVozSeleccionada(lista[0].nombre);
    };

    cargarVoces();
    window.speechSynthesis.onvoiceschanged = cargarVoces;

    return () => { window.speechSynthesis.cancel(); };
  }, []);

  // Auto-scroll a la palabra resaltada
  useEffect(() => {
    if (palabraResaltadaRef.current) {
      palabraResaltadaRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [palabraActual]);

  const detener = useCallback(() => {
    window.speechSynthesis?.cancel();
    setEstado('parado');
    setPalabraActual(-1);
  }, []);

  // Resetear al cambiar el texto
  useEffect(() => {
    if (estado !== 'parado') detener();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto]);

  const iniciar = useCallback(() => {
    if (!soportado) return;
    window.speechSynthesis.cancel();

    const utt = new SpeechSynthesisUtterance(texto);
    utt.rate = velocidad;
    utt.pitch = tono;
    utt.lang = 'es-ES';

    const vozObj = voces.find(v => v.nombre === vozSeleccionada);
    if (vozObj) utt.voice = vozObj.voz;

    utt.onboundary = (event: SpeechSynthesisEvent) => {
      if (event.name === 'word') {
        const idx = mapaCharPalabra.get(event.charIndex);
        if (idx !== undefined) setPalabraActual(idx);
      }
    };

    utt.onend = () => {
      setEstado('parado');
      setPalabraActual(-1);
    };

    utt.onerror = () => setEstado('parado');

    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
    setEstado('reproduciendo');
    setVistaActiva('escuchar');
  }, [soportado, texto, velocidad, tono, voces, vozSeleccionada, mapaCharPalabra]);

  const pausarReanudar = useCallback(() => {
    if (estado === 'reproduciendo') {
      window.speechSynthesis.pause();
      setEstado('pausado');
    } else if (estado === 'pausado') {
      window.speechSynthesis.resume();
      setEstado('reproduciendo');
    }
  }, [estado]);

  const totalPalabras = tokenConIndice.filter(t => t.idxPalabra >= 0).length;
  const progreso = totalPalabras > 0 && palabraActual >= 0
    ? Math.round((palabraActual / totalPalabras) * 100)
    : 0;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🔊 Lector de Texto en Voz Alta</h1>
        <p className={styles.subtitle}>
          Pega cualquier texto y escúchalo en español.
          Las palabras se resaltan conforme se leen.
        </p>
      </header>

      <LegalNotice />

      {!soportado && (
        <div className={styles.avisoNavegador} role="alert">
          <strong>⚠️ Tu navegador no soporta síntesis de voz.</strong><br />
          Por favor usa Chrome, Edge o Safari para usar este lector.
        </div>
      )}

      {/* Controles de configuración */}
      <section className={styles.configPanel} aria-label="Configuración de voz">
        {/* Selector de voz */}
        {voces.length > 0 && (
          <div className={styles.configGrupo}>
            <label className={styles.configLabel} htmlFor="selector-voz">
              Voz
            </label>
            <select
              id="selector-voz"
              className={styles.selector}
              value={vozSeleccionada}
              onChange={e => setVozSeleccionada(e.target.value)}
              disabled={estado === 'reproduciendo'}
              aria-label="Seleccionar voz"
            >
              {voces.map(v => (
                <option key={v.nombre} value={v.nombre}>
                  {v.nombre} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Velocidad */}
        <div className={styles.configGrupo}>
          <label className={styles.configLabel} htmlFor="slider-velocidad">
            Velocidad: <strong>{velocidad.toFixed(1)}×</strong>
          </label>
          <input
            id="slider-velocidad"
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={velocidad}
            onChange={e => setVelocidad(Number(e.target.value))}
            className={styles.slider}
            disabled={estado === 'reproduciendo'}
            aria-valuetext={`${velocidad.toFixed(1)} veces la velocidad normal`}
          />
          <div className={styles.sliderLabels}>
            <span>Lento</span>
            <span>Rápido</span>
          </div>
        </div>

        {/* Tono */}
        <div className={styles.configGrupo}>
          <label className={styles.configLabel} htmlFor="slider-tono">
            Tono: <strong>{tono.toFixed(1)}</strong>
          </label>
          <input
            id="slider-tono"
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={tono}
            onChange={e => setTono(Number(e.target.value))}
            className={styles.slider}
            disabled={estado === 'reproduciendo'}
          />
          <div className={styles.sliderLabels}>
            <span>Grave</span>
            <span>Agudo</span>
          </div>
        </div>
      </section>

      {/* Pestañas de vista */}
      <div className={styles.pestanas} role="tablist" aria-label="Vista del texto">
        <button
          className={`${styles.pestana} ${vistaActiva === 'editar' ? styles.pestanaActiva : ''}`}
          onClick={() => setVistaActiva('editar')}
          role="tab"
          aria-selected={vistaActiva === 'editar'}
          aria-controls="panel-editar"
        >
          ✏️ Editar texto
        </button>
        <button
          className={`${styles.pestana} ${vistaActiva === 'escuchar' ? styles.pestanaActiva : ''}`}
          onClick={() => setVistaActiva('escuchar')}
          role="tab"
          aria-selected={vistaActiva === 'escuchar'}
          aria-controls="panel-escuchar"
        >
          👁️ Seguir lectura
        </button>
      </div>

      {/* Panel editar */}
      {vistaActiva === 'editar' && (
        <section
          id="panel-editar"
          className={styles.panelEditar}
          role="tabpanel"
          aria-label="Editor de texto"
        >
          <textarea
            className={styles.textarea}
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Pega aquí el texto que quieres escuchar..."
            rows={10}
            aria-label="Texto a leer en voz alta"
          />
          <p className={styles.contadorTexto}>
            {totalPalabras} palabras · {texto.length} caracteres
          </p>
        </section>
      )}

      {/* Panel escuchar con resaltado */}
      {vistaActiva === 'escuchar' && (
        <section
          id="panel-escuchar"
          className={styles.panelEscuchar}
          role="tabpanel"
          aria-label="Texto con resaltado de lectura"
        >
          <div
            className={styles.textoResaltado}
            aria-live="polite"
            aria-atomic="false"
          >
            {texto
              ? tokenConIndice.map(({ token, idxPalabra }, i) => {
                  if (idxPalabra < 0) {
                    return <span key={i}>{token}</span>;
                  }
                  const esActual = idxPalabra === palabraActual;
                  return (
                    <mark
                      key={i}
                      ref={esActual ? (el => { palabraResaltadaRef.current = el; }) : null}
                      className={`${styles.palabra} ${esActual ? styles.palabraActual : ''} ${idxPalabra < palabraActual ? styles.palabraLeida : ''}`}
                      aria-current={esActual ? 'true' : undefined}
                    >
                      {token}
                    </mark>
                  );
                })
              : <em className={styles.placeholder}>El texto aparecerá aquí...</em>
            }
          </div>
        </section>
      )}

      {/* Barra de progreso */}
      {estado !== 'parado' && (
        <div className={styles.progreso} aria-label={`Progreso: ${progreso}%`}>
          <div
            className={styles.progresoBar}
            style={{ width: `${progreso}%` }}
            role="progressbar"
            aria-valuenow={progreso}
            aria-valuemin={0}
            aria-valuemax={100}
          />
          <span className={styles.progresoTexto}>{progreso}%</span>
        </div>
      )}

      {/* Controles principales */}
      <div className={styles.controles} aria-label="Controles de reproducción">
        {estado === 'parado' ? (
          <button
            className={`${styles.btnControl} ${styles.btnPlay}`}
            onClick={iniciar}
            disabled={!soportado || !texto.trim()}
            aria-label="Iniciar lectura"
          >
            ▶ Leer en voz alta
          </button>
        ) : (
          <>
            <button
              className={`${styles.btnControl} ${styles.btnPausa}`}
              onClick={pausarReanudar}
              aria-label={estado === 'pausado' ? 'Reanudar lectura' : 'Pausar lectura'}
            >
              {estado === 'pausado' ? '▶ Reanudar' : '⏸ Pausar'}
            </button>
            <button
              className={`${styles.btnControl} ${styles.btnStop}`}
              onClick={detener}
              aria-label="Detener lectura"
            >
              ⏹ Detener
            </button>
          </>
        )}
      </div>

      <EducationalSection
        title="📚 ¿Para quién es útil la lectura en voz alta?"
        subtitle="Información sobre síntesis de voz y accesibilidad"
      >
        <section className={styles.guiaSeccion}>
          <h2>¿Qué es la síntesis de voz?</h2>
          <p>
            La síntesis de voz (Text-to-Speech o TTS) convierte texto escrito en audio hablado
            usando el motor de voz integrado en el navegador. Es completamente gratuita,
            funciona sin conexión a internet y respeta tu privacidad al 100%: el texto
            nunca sale de tu dispositivo.
          </p>

          <h2>¿A quién ayuda?</h2>
          <ul>
            <li>
              <strong>Personas con discapacidad visual</strong>: Permite acceder a
              contenido escrito sin necesidad de verlo.
            </li>
            <li>
              <strong>Personas con dislexia</strong>: Escuchar mientras se sigue el texto
              visualmente mejora la comprensión lectora.
            </li>
            <li>
              <strong>Mayores con fatiga visual</strong>: Descansar los ojos mientras se
              sigue el contenido auditivamente.
            </li>
            <li>
              <strong>Personas con TDAH</strong>: El resaltado de palabras ayuda a mantener
              el foco en el punto exacto de lectura.
            </li>
            <li>
              <strong>Personas con afasia o dificultades de lectura</strong>: Escuchar
              el texto facilita la comprensión.
            </li>
            <li>
              <strong>Aprendizaje de idiomas</strong>: Escuchar la pronunciación correcta
              mientras se lee el texto.
            </li>
          </ul>

          <h2>Consejos de uso</h2>
          <ul>
            <li>Empieza con velocidad <strong>0.8×</strong> si el texto es difícil</li>
            <li>Usa la pestaña &quot;Seguir lectura&quot; para ver las palabras resaltadas</li>
            <li>En Chrome y Edge las voces en español son de mayor calidad</li>
            <li>Puedes pausar en cualquier momento y reanudar donde lo dejaste</li>
            <li>Combínalo con el Adaptador de Dislexia para un texto más legible</li>
          </ul>

          <h2>Compatibilidad</h2>
          <p>
            Esta herramienta usa la API nativa del navegador (Web Speech API).
            Funciona mejor en <strong>Chrome</strong> y <strong>Edge</strong>.
            Safari también es compatible. Firefox tiene soporte limitado de voces.
          </p>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('lector-texto-voz')} />
      <Footer appName="lector-texto-voz" />
    </div>
  );
}
