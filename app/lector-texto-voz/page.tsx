'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styles from './LectorTextoVoz.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
  DisclaimerCard,
} from '@/components';
import { formatNumber } from '@/lib';

type EstadoLector = 'parado' | 'reproduciendo' | 'pausado';

interface VozItem {
  nombre: string;
  lang: string;
  /** SpeechSynthesisVoice.localService: false = la síntesis la hace un servicio remoto */
  local: boolean;
  voz: SpeechSynthesisVoice;
}

/** «1,0»: velocidad y tono con coma decimal */
const formatoFactor = (n: number) => formatNumber(n, 1);

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
  const botonLeerRef = useRef<HTMLButtonElement | null>(null);
  const enfocarLeerRef = useRef(false);

  // Tokenizar texto en palabras y espacios. split(/(\s+)/) deja un trozo vacío delante si el
  // texto empieza por un blanco y otro detrás si acaba en blanco: no son palabras (hallazgo 3960)
  const tokens = useMemo(() => texto.split(/(\s+)/).filter(t => t !== ''), [texto]);

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
      const aItem = (v: SpeechSynthesisVoice): VozItem => ({
        nombre: v.name,
        lang: v.lang,
        local: v.localService !== false,
        voz: v,
      });
      const espanol = todas.filter(v => v.lang.startsWith('es')).map(aItem);

      const lista = espanol.length > 0 ? espanol : todas.map(aItem);

      setVoces(lista);
      // Por defecto, una voz que sintetiza en el dispositivo: las «en línea» envían el texto a
      // un servicio remoto, y eso se elige a sabiendas (hallazgo 3959)
      const porDefecto = lista.find(v => v.local) ?? lista[0];
      if (porDefecto) setVozSeleccionada(porDefecto.nombre);
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

  // Detener desmonta su propio botón: el foco pasa a Leer en vez de caer a <body> (hallazgo 3962)
  const detenerDesdeBoton = useCallback(() => {
    enfocarLeerRef.current = true;
    detener();
  }, [detener]);

  useEffect(() => {
    if (estado === 'parado' && enfocarLeerRef.current) {
      enfocarLeerRef.current = false;
      botonLeerRef.current?.focus();
    }
  }, [estado]);

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
    const vozObj = voces.find(v => v.nombre === vozSeleccionada);
    utt.lang = vozObj?.lang ?? 'es-ES';
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
  const progresoTexto = `${progreso} %`;
  const textoContador =
    `${formatNumber(totalPalabras, 0)} ${totalPalabras === 1 ? 'palabra' : 'palabras'} · ` +
    `${formatNumber(texto.length, 0)} ${texto.length === 1 ? 'carácter' : 'caracteres'}`;
  const vozActual = voces.find(v => v.nombre === vozSeleccionada);
  const vozEnLinea = vozActual !== undefined && !vozActual.local;
  const vocesLocales = voces.filter(v => v.local);
  const vocesEnLinea = voces.filter(v => !v.local);
  // Velocidad, tono y voz solo se aplican al pulsar Leer: también en pausa quedan fijos (hallazgo 3964)
  const ajustesBloqueados = estado !== 'parado';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🔊</span> Lector de Texto en Voz Alta</h1>
        <p className={styles.subtitle}>
          Pega cualquier texto y escúchalo en español.
          Las palabras se resaltan conforme se leen.
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="general" severity="high" context="lector-texto-voz">
        Esta herramienta de lectura en voz alta es un <strong>apoyo digital de accesibilidad</strong>. No sustituye a logopedas, terapeutas del lenguaje ni especialistas en comunicación aumentativa. Si usas este lector como soporte para una discapacidad o condición diagnosticada, consulta con tu equipo terapéutico.
      </DisclaimerCard>

      {!soportado && (
        <div className={styles.avisoNavegador} role="alert">
          <strong><span aria-hidden="true">⚠️</span> Tu navegador no soporta síntesis de voz.</strong><br />
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
              disabled={ajustesBloqueados}
              aria-label="Seleccionar voz"
              aria-describedby="aviso-voz"
            >
              {vocesLocales.length > 0 && (
                <optgroup label="En tu dispositivo">
                  {vocesLocales.map(v => (
                    <option key={v.nombre} value={v.nombre}>
                      {`${v.nombre} (${v.lang})`}
                    </option>
                  ))}
                </optgroup>
              )}
              {vocesEnLinea.length > 0 && (
                <optgroup label="En línea: el texto se envía al servicio de voz">
                  {vocesEnLinea.map(v => (
                    <option key={v.nombre} value={v.nombre}>
                      {`${v.nombre} (${v.lang}) · en línea`}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            {/* Siempre montado: solo cambia su texto (hallazgo 3959) */}
            <p id="aviso-voz" className={vozEnLinea ? styles.avisoVoz : styles.notaVoz} aria-live="polite">
              {vozEnLinea
                ? 'Voz en línea: el navegador envía el texto a su servicio de voz para leerlo. Si prefieres que no salga de tu dispositivo, elige una voz del grupo «En tu dispositivo».'
                : 'Voz de tu dispositivo: el texto se lee sin salir de tu ordenador o móvil.'}
            </p>
          </div>
        )}

        {/* Velocidad */}
        <div className={styles.configGrupo}>
          <label className={styles.configLabel} htmlFor="slider-velocidad">
            Velocidad: <strong>{`${formatoFactor(velocidad)}×`}</strong>
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
            disabled={ajustesBloqueados}
            aria-valuetext={`${formatoFactor(velocidad)} veces la velocidad normal`}
          />
          <div className={styles.sliderLabels}>
            <span>Lento</span>
            <span>Rápido</span>
          </div>
        </div>

        {/* Tono */}
        <div className={styles.configGrupo}>
          <label className={styles.configLabel} htmlFor="slider-tono">
            Tono: <strong>{formatoFactor(tono)}</strong>
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
            disabled={ajustesBloqueados}
            aria-valuetext={formatoFactor(tono)}
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
          type="button"
          className={`${styles.pestana} ${vistaActiva === 'editar' ? styles.pestanaActiva : ''}`}
          onClick={() => setVistaActiva('editar')}
          role="tab"
          aria-selected={vistaActiva === 'editar'}
          aria-controls="panel-editar"
        >
          <span aria-hidden="true">✏️</span> Editar texto
        </button>
        <button
          type="button"
          className={`${styles.pestana} ${vistaActiva === 'escuchar' ? styles.pestanaActiva : ''}`}
          onClick={() => setVistaActiva('escuchar')}
          role="tab"
          aria-selected={vistaActiva === 'escuchar'}
          aria-controls="panel-escuchar"
        >
          <span aria-hidden="true">👁️</span> Seguir lectura
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
          <p className={styles.contadorTexto}>{textoContador}</p>
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
            role="status"
            aria-live="polite"
            aria-atomic="false"
          >
            {texto
              ? tokenConIndice.map(({ token, idxPalabra }, i) => {
                  if (idxPalabra < 0) {
                    return <span key={i}>{token}</span>;
                  }
                  const esActual = idxPalabra === palabraActual;
                  // Solo la palabra que se lee es un <mark> (rol «resaltado»); las demás, <span>:
                  // con todas en <mark> el lector de pantalla las daba todas por resaltadas (hallazgo 3966)
                  if (esActual) {
                    return (
                      <mark
                        key={i}
                        ref={el => { palabraResaltadaRef.current = el; }}
                        className={`${styles.palabra} ${styles.palabraActual}`}
                        aria-current="true"
                      >
                        {token}
                      </mark>
                    );
                  }
                  return (
                    <span
                      key={i}
                      className={`${styles.palabra} ${idxPalabra < palabraActual ? styles.palabraLeida : ''}`}
                    >
                      {token}
                    </span>
                  );
                })
              : <em className={styles.placeholder}>El texto aparecerá aquí...</em>
            }
          </div>
        </section>
      )}

      {/* Barra de progreso */}
      {estado !== 'parado' && (
        <div className={styles.progreso}>
          {/* El nombre va en el propio progressbar: en el <div> genérico no se exponía (hallazgo 3965) */}
          <div
            className={styles.progresoBar}
            style={{ width: `${progreso}%` }}
            role="progressbar"
            aria-label="Progreso de la lectura"
            aria-valuenow={progreso}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={progresoTexto}
          />
          <span className={styles.progresoTexto}>{progresoTexto}</span>
        </div>
      )}

      {/* Controles principales */}
      <div className={styles.controles} role="group" aria-label="Controles de reproducción">
        {estado === 'parado' ? (
          <button
            type="button"
            ref={botonLeerRef}
            className={`${styles.btnControl} ${styles.btnPlay}`}
            onClick={iniciar}
            disabled={!soportado || !texto.trim()}
            aria-label="Iniciar lectura"
          >
            <span aria-hidden="true">▶</span> Leer en voz alta
          </button>
        ) : (
          <>
            <button
              type="button"
              className={`${styles.btnControl} ${styles.btnPausa}`}
              onClick={pausarReanudar}
              aria-label={estado === 'pausado' ? 'Reanudar lectura' : 'Pausar lectura'}
            >
              {estado === 'pausado' ? <><span aria-hidden="true">▶</span> Reanudar</> : <><span aria-hidden="true">⏸</span> Pausar</>}
            </button>
            <button
              type="button"
              className={`${styles.btnControl} ${styles.btnStop}`}
              onClick={detenerDesdeBoton}
              aria-label="Detener lectura"
            >
              <span aria-hidden="true">⏹</span> Detener
            </button>
          </>
        )}
      </div>

      <EducationalSection
        title="¿Para quién es útil la lectura en voz alta?"
        subtitle="Información sobre síntesis de voz y accesibilidad"
      >
        <section className={styles.guiaSeccion}>
          <h2>¿Qué es la síntesis de voz?</h2>
          <p>
            La síntesis de voz (Text-to-Speech o TTS) convierte texto escrito en audio hablado
            usando las voces de tu navegador. Es gratuita y no necesita instalar nada. Dónde se
            procesa el texto depende de la voz que elijas: con una voz del grupo «En tu
            dispositivo» se sintetiza en tu ordenador o móvil, sin salir de él, y también sirve
            sin conexión; las voces «en línea» (las neuronales que Google y Microsoft añaden en
            Chrome y Edge) envían el texto a su servicio de voz. El selector las separa y avisa
            cuando eliges una en línea.
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
              <strong>Aprendizaje del español</strong>: Escuchar la pronunciación
              mientras se lee el texto.
            </li>
          </ul>

          <h2>Consejos de uso</h2>
          <ul>
            <li>Empieza con velocidad <strong>0,8×</strong> si el texto es difícil</li>
            <li>Usa la pestaña &quot;Seguir lectura&quot; para ver las palabras resaltadas</li>
            <li>En Chrome y Edge hay voces en español de mayor calidad, que funcionan en línea</li>
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

        {/* TABLA COMPARATIVA */}
        <section className={styles.guiaSeccion}>
          <h2>Comparativa: lector de voz vs. otras opciones de accesibilidad</h2>
          <p>¿Cuándo elegir el lector de voz frente a otras herramientas de accesibilidad? Esta tabla ayuda a decidir:</p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Herramienta</th>
                  <th>Sin instalación</th>
                  <th>Texto personalizado</th>
                  <th>Resaltado visual</th>
                  <th>Mejor para</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span aria-hidden="true">🔊</span> Este lector (meskeIA)</td>
                  <td className={styles.celdaDestacada}>Sí</td>
                  <td className={styles.celdaDestacada}>Sí</td>
                  <td className={styles.celdaDestacada}>Sí</td>
                  <td>Uso inmediato, cualquier texto</td>
                </tr>
                <tr>
                  <td>Lector de pantalla del SO</td>
                  <td>No (preinstalado)</td>
                  <td>Sí</td>
                  <td>Limitado</td>
                  <td>Usuarios con ceguera total</td>
                </tr>
                <tr>
                  <td>Extensión de Chrome (TTS)</td>
                  <td>No (instalar)</td>
                  <td>Solo páginas web</td>
                  <td>Algunos</td>
                  <td>Navegación web diaria</td>
                </tr>
                <tr>
                  <td>App TTS de móvil</td>
                  <td>No (instalar)</td>
                  <td>Sí</td>
                  <td>Varía</td>
                  <td>Uso móvil frecuente</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CASOS DE USO */}
        <section className={styles.guiaSeccion}>
          <h2>Situaciones donde marca la diferencia</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span aria-hidden="true" className={styles.escenarioIcono}>📚</span>
              <h3>Alumno con dislexia</h3>
              <p>Pegar los apuntes del cole o textos de un examen y escucharlos mientras se sigue el resaltado reduce el esfuerzo cognitivo y mejora la comprensión en sesiones de estudio.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span aria-hidden="true" className={styles.escenarioIcono}>👴</span>
              <h3>Persona mayor con fatiga visual</h3>
              <p>Pegar el texto de un artículo o un correo electrónico y escucharlo con los ojos cerrados, sin necesidad de instalar nada ni pedir ayuda a nadie.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span aria-hidden="true" className={styles.escenarioIcono}>🧩</span>
              <h3>Persona con TDAH</h3>
              <p>El resaltado palabra por palabra actúa como ancla visual que impide que la atención se disperse. Especialmente útil para textos largos que habría que releer varias veces.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span aria-hidden="true" className={styles.escenarioIcono}>🏥</span>
              <h3>Paciente con afasia de lectura</h3>
              <p>Escuchar el texto ayuda a compensar la dificultad para decodificar las palabras escritas. El apoyo del logopeda puede indicar qué velocidad y voz funcionan mejor para cada caso.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guiaSeccion}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Por qué en Firefox no hay voces en español?</dt>
              <dd>Firefox usa el motor de síntesis de voz del sistema operativo, que en Windows a veces no incluye voces de alta calidad en español. En Chrome y Edge, Google y Microsoft añaden voces neuronales de mayor calidad, que funcionan en línea: el texto se envía a su servicio de voz. Si necesitas buena calidad de voz española y no te importa que el texto salga del dispositivo, son la opción recomendada.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿El texto que pego se envía a algún servidor?</dt>
              <dd>Depende de la voz. meskeIA no recibe ni guarda el texto: la lectura la hace tu navegador. Con una voz del grupo «En tu dispositivo», el texto no sale de tu ordenador o móvil. Las voces «en línea» —las neuronales de Google y Microsoft en Chrome y Edge— envían el texto a su servicio de voz para sintetizarlo; el selector las agrupa aparte y avisa al elegirlas.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puedo usar esta herramienta para textos en otros idiomas?</dt>
              <dd>La app está pensada para textos en español: el selector ofrece las voces en español de tu navegador (solo si no tiene ninguna muestra las demás). Un texto en inglés o francés se leerá con una de esas voces y su pronunciación española.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Por qué el resaltado de palabras no es exacto en algunas frases?</dt>
              <dd>El resaltado usa el evento onboundary de la Web Speech API, que en algunos navegadores (especialmente Safari) tiene precisión limitada. Es un comportamiento del navegador, no un error de la app. En Chrome el resaltado es generalmente muy preciso.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puedo ajustar la velocidad y el tono después de empezar?</dt>
              <dd>No mientras hay una lectura en curso: velocidad, tono y voz están desactivados durante la reproducción y la pausa, porque el navegador fija esos valores al empezar. Detén la lectura, ajusta los parámetros y vuelve a pulsar Leer para aplicar los cambios.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué longitud máxima de texto puede procesar?</dt>
              <dd>No hay un límite técnico fijo, pero los textos muy largos (más de 5.000 palabras) pueden causar que la API se detenga en algunos navegadores. Para textos largos, divide el contenido en secciones y procésalas una a una.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Se puede usar con un lector de pantalla?</dt>
              <dd>Sí. La app está construida con etiquetas ARIA y roles semánticos para ser compatible con NVDA, JAWS y VoiceOver. El usuario puede navegar con teclado y los controles están correctamente etiquetados.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Es adecuado para niños pequeños?</dt>
              <dd>Sí, especialmente para niños de 6 años en adelante que ya reconocen letras. El resaltado de palabras puede ser muy motivador durante la lectura guiada. Para niños con dislexia, combínalo con el Adaptador de Lectura para texto más cómodo.</dd>
            </div>
          </dl>
        </section>

        {/* GUÍA PASO A PASO */}
        <section className={styles.guiaSeccion}>
          <h2>Cómo usar el lector por primera vez</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div>
                <strong>Selecciona una voz en español</strong>
                <p>En el selector de voz, elige la que empiece por &quot;es-ES&quot; o &quot;es&quot;. Las del grupo «En tu dispositivo» (por ejemplo, &quot;Microsoft Helena&quot; en Windows) no envían el texto fuera; las de «En línea» (como &quot;Google español&quot; en Chrome) suenan más naturales, pero envían el texto al servicio de voz del navegador.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div>
                <strong>Ajusta la velocidad</strong>
                <p>Para personas con dislexia o mayores, empieza en 0,8× o 0,9×. Para revisión rápida de textos conocidos, 1,3×-1,5× puede ser más cómodo.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div>
                <strong>Pega el texto en la pestaña &quot;Editar texto&quot;</strong>
                <p>Copia el contenido de cualquier fuente (Word, PDF, web, correo) y pégalo en el área de texto. No hay límite de formato.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div>
                <strong>Pulsa &quot;Leer en voz alta&quot;</strong>
                <p>La app cambiará automáticamente a la pestaña &quot;Seguir lectura&quot; donde verás las palabras resaltarse conforme se leen.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div>
                <strong>Pausa cuando necesites</strong>
                <p>El botón Pausar congela la lectura en la palabra exacta. Al reanudar, continúa desde el mismo punto.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div>
                <strong>Combina con el Adaptador de Dislexia si es necesario</strong>
                <p>Pega el texto primero en el Adaptador, ajusta la tipografía, y luego pásalo aquí para escucharlo. El efecto combinado mejora significativamente la comprensión.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div>
                <strong>Experimenta con el tono</strong>
                <p>Un tono más bajo (0,7-0,8) puede ser más cómodo para sesiones largas. Un tono alto (1,3 o más) puede ayudar a distinguir mejor las palabras en texto difícil.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* MEJORES PRÁCTICAS */}
        <section className={styles.guiaSeccion}>
          <h2>Buenas prácticas para sacar el máximo partido</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span aria-hidden="true" className={styles.tipIcono}>🎧</span>
              <p><strong>Usa auriculares si hay ruido ambiente.</strong> La comprensión mejora notablemente al reducir distracciones auditivas externas, especialmente para personas con TDAH o procesamiento auditivo difícil.</p>
            </div>
            <div className={styles.tipCard}>
              <span aria-hidden="true" className={styles.tipIcono}>📋</span>
              <p><strong>Divide textos muy largos en secciones.</strong> Si tienes un documento extenso, copia y pega párrafo a párrafo o por secciones temáticas. Facilita la concentración y evita problemas técnicos con textos muy largos.</p>
            </div>
            <div className={styles.tipCard}>
              <span aria-hidden="true" className={styles.tipIcono}>🔁</span>
              <p><strong>Escucha dos veces los párrafos difíciles.</strong> La primera escucha activa la comprensión general; la segunda permite captar los detalles. Detén y repite la sección que te cueste más.</p>
            </div>
            <div className={styles.tipCard}>
              <span aria-hidden="true" className={styles.tipIcono}>📱</span>
              <p><strong>En móvil, mantén la pantalla encendida.</strong> Algunos navegadores móviles suspenden la síntesis de voz si la pantalla se apaga. Ajusta el tiempo de espera de pantalla o mantén el móvil activo durante la lectura.</p>
            </div>
            <div className={styles.tipCard}>
              <span aria-hidden="true" className={styles.tipIcono}>👁️</span>
              <p><strong>Alterna lectura visual y auditiva.</strong> Seguir el resaltado con la vista mientras se escucha activa simultáneamente los canales visual y auditivo, lo que mejora la retención del contenido.</p>
            </div>
            <div className={styles.tipCard}>
              <span aria-hidden="true" className={styles.tipIcono}>🏫</span>
              <p><strong>En el aula, usa altavoz en lugar de auriculares.</strong> Para lectura grupal o en clase, el lector puede usarse en voz alta para toda la clase, con el texto proyectado y el resaltado visible en la pantalla.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <section className={styles.guiaSeccion}>
          <div className={styles.warningBox}>
            <h3><span aria-hidden="true">⚠️</span> Limitaciones importantes a tener en cuenta</h3>
            <ul>
              <li><strong>Calidad de voz variable por navegador:</strong> Firefox tiene voces de calidad mucho más baja que Chrome o Edge en español. Si la voz suena robótica o difícil de entender, prueba en otro navegador antes de concluir que la herramienta no funciona.</li>
              <li><strong>El resaltado puede no ser exacto en todos los navegadores:</strong> Safari y Firefox tienen implementaciones menos precisas del evento onboundary. El resaltado puede ir ligeramente desfasado. Esto es una limitación del navegador, no de la herramienta.</li>
              <li><strong>No es un lector de pantalla completo:</strong> Esta herramienta lee texto que tú pegas, no navega automáticamente por el contenido de la página. Para usuarios con ceguera total que necesitan navegación completa, se recomienda NVDA, JAWS o VoiceOver.</li>
              <li><strong>Los textos con mucho formato o tablas pueden sonar extraños:</strong> El lector procesa el texto sin formato. Tablas, listas muy anidadas o textos con símbolos especiales pueden resultar en lecturas poco naturales. Limpia el texto antes de pegarlo si es necesario.</li>
              <li><strong>No funciona sin JavaScript:</strong> La Web Speech API requiere JavaScript activo. Si el navegador tiene JS desactivado, la herramienta no funcionará.</li>
              <li><strong>No sustituye a un logopeda:</strong> Para personas con afasia, dislexia severa u otras dificultades del lenguaje, este lector es un apoyo complementario. El diseño del plan de intervención debe hacerlo siempre un especialista.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="lector-texto-voz" />
      <Footer appName="lector-texto-voz" />
    </div>
  );
}
