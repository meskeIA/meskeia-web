'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './AdaptadorDislexia.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  DisclaimerCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Tipos de fuente disponibles
type TipoFuente = 'sistema' | 'lexend' | 'mono';

// Preferencias de lectura guardadas en localStorage
interface Preferencias {
  fuente: TipoFuente;
  tamano: number;           // px (14–36)
  espaciadoLetras: number;  // em (0–0.3)
  espaciadoPalabras: number; // em (0–0.5)
  interlineado: number;     // unitless (1.2–3.0)
  anchoColumna: number;     // % (40–100)
  colorFondo: string;       // hex
}

const PREFERENCIAS_DEFAULT: Preferencias = {
  fuente: 'lexend',
  tamano: 20,
  espaciadoLetras: 0.05,
  espaciadoPalabras: 0.15,
  interlineado: 1.9,
  anchoColumna: 68,
  colorFondo: '#FEFDF6',
};

const COLORES_FONDO = [
  { id: 'blanco', color: '#FFFFFF', nombre: 'Blanco' },
  { id: 'crema', color: '#FEFDF6', nombre: 'Crema' },
  { id: 'azul', color: '#EEF4FF', nombre: 'Azul pálido' },
  { id: 'verde', color: '#F0F7F0', nombre: 'Verde pálido' },
  { id: 'gris', color: '#F5F5F5', nombre: 'Gris suave' },
];

const TEXTO_EJEMPLO = `La dislexia es una dificultad específica del aprendizaje que afecta a la lectura y la escritura. Las personas con dislexia pueden tener dificultades para reconocer palabras, deletrear correctamente y leer con fluidez.

Ajusta las opciones de la izquierda para encontrar la configuración que te resulte más cómoda. Cada persona es diferente, así que experimenta hasta dar con tu combinación perfecta.

Puedes sustituir este texto de ejemplo pegando aquí el contenido que necesitas leer: un artículo, apuntes del colegio, un correo de trabajo... lo que necesites.`;

export default function AdaptadorDislexiaPage() {
  const [texto, setTexto] = useState(TEXTO_EJEMPLO);
  const [prefs, setPrefs] = useState<Preferencias>(PREFERENCIAS_DEFAULT);
  const [copiado, setCopiado] = useState(false);
  const [fonteCargada, setFonteCargada] = useState(false);

  // Cargar preferencias guardadas
  useEffect(() => {
    try {
      const guardadas = localStorage.getItem('adaptador-dislexia-prefs');
      if (guardadas) {
        setPrefs(JSON.parse(guardadas) as Preferencias);
      }
    } catch { /* ignorar errores de localStorage */ }
  }, []);

  // Guardar preferencias automáticamente
  useEffect(() => {
    try {
      localStorage.setItem('adaptador-dislexia-prefs', JSON.stringify(prefs));
    } catch { /* ignorar errores de localStorage */ }
  }, [prefs]);

  // Cargar Lexend desde Google Fonts
  useEffect(() => {
    if (!document.querySelector('link[data-font="lexend"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@400;500;600&display=swap';
      link.setAttribute('data-font', 'lexend');
      document.head.appendChild(link);
      link.onload = () => setFonteCargada(true);
    } else {
      setFonteCargada(true);
    }
  }, []);

  const actualizarPref = useCallback(
    <K extends keyof Preferencias>(clave: K, valor: Preferencias[K]) => {
      setPrefs(prev => ({ ...prev, [clave]: valor }));
    },
    []
  );

  const copiarTexto = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch { /* ignorar si el navegador no soporta clipboard */ }
  };

  const resetear = () => setPrefs(PREFERENCIAS_DEFAULT);

  // Familia tipográfica según selección
  const getFuenteFamily = (): string => {
    switch (prefs.fuente) {
      case 'lexend':
        return fonteCargada ? "'Lexend Deca', Arial, sans-serif" : 'Arial, sans-serif';
      case 'mono':
        return "'Courier New', Courier, monospace";
      default:
        return 'Arial, Helvetica, sans-serif';
    }
  };

  const estilosVista: React.CSSProperties = {
    fontFamily: getFuenteFamily(),
    fontSize: `${prefs.tamano}px`,
    letterSpacing: `${prefs.espaciadoLetras}em`,
    wordSpacing: `${prefs.espaciadoPalabras}em`,
    lineHeight: prefs.interlineado,
    maxWidth: `${prefs.anchoColumna}%`,
    backgroundColor: prefs.colorFondo,
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📖 Adaptador de Lectura para Dislexia</h1>
        <p className={styles.subtitle}>
          Personaliza cualquier texto para que te resulte más fácil de leer.
          Ajusta la fuente, el tamaño, el espaciado y el color de fondo.
          Tus preferencias se guardan automáticamente.
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="medical"
        severity="medium"
        title="Herramienta de apoyo a la lectura"
      >
        Esta herramienta adapta visualmente los textos para facilitar la lectura.
        No sustituye la evaluación ni el tratamiento de un especialista.
        Si tienes dudas sobre dificultades de lectura, consulta con un logopeda o psicopedagogo.
      </DisclaimerCard>

      <div className={styles.layout}>
        {/* Panel de controles */}
        <aside className={styles.controlesPanel} aria-label="Ajustes de lectura">
          <h2 className={styles.panelTitle}>⚙️ Ajustes</h2>

          {/* Selector de fuente */}
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>Tipo de letra</span>
            <div className={styles.fuenteBtns} role="group" aria-label="Selección de fuente">
              {([
                { id: 'sistema' as TipoFuente, nombre: 'Arial', familia: 'Arial, sans-serif' },
                { id: 'lexend' as TipoFuente, nombre: 'Lexend', familia: "'Lexend Deca', sans-serif" },
                { id: 'mono' as TipoFuente, nombre: 'Mono', familia: "'Courier New', monospace" },
              ] as const).map(f => (
                <button
                  key={f.id}
                  className={`${styles.fuenteBtn} ${prefs.fuente === f.id ? styles.activo : ''}`}
                  onClick={() => actualizarPref('fuente', f.id)}
                  aria-pressed={prefs.fuente === f.id}
                  style={{ fontFamily: f.familia }}
                >
                  <span className={styles.fuenteEjemplo}>Aa</span>
                  <span className={styles.fuenteNombre}>{f.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tamaño de letra */}
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel} htmlFor="slider-tamano">
              Tamaño: <strong>{prefs.tamano}px</strong>
            </label>
            <input
              id="slider-tamano"
              type="range"
              min={14}
              max={36}
              step={1}
              value={prefs.tamano}
              onChange={e => actualizarPref('tamano', Number(e.target.value))}
              className={styles.slider}
              aria-valuetext={`${prefs.tamano} píxeles`}
            />
            <div className={styles.sliderLabels}>
              <span>Pequeño</span>
              <span>Grande</span>
            </div>
          </div>

          {/* Espaciado entre letras */}
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel} htmlFor="slider-letras">
              Espacio letras: <strong>{Math.round(prefs.espaciadoLetras * 100)}%</strong>
            </label>
            <input
              id="slider-letras"
              type="range"
              min={0}
              max={0.3}
              step={0.01}
              value={prefs.espaciadoLetras}
              onChange={e => actualizarPref('espaciadoLetras', Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderLabels}>
              <span>Normal</span>
              <span>Amplio</span>
            </div>
          </div>

          {/* Espaciado entre palabras */}
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel} htmlFor="slider-palabras">
              Espacio palabras: <strong>{Math.round(prefs.espaciadoPalabras * 100)}%</strong>
            </label>
            <input
              id="slider-palabras"
              type="range"
              min={0}
              max={0.5}
              step={0.01}
              value={prefs.espaciadoPalabras}
              onChange={e => actualizarPref('espaciadoPalabras', Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderLabels}>
              <span>Normal</span>
              <span>Amplio</span>
            </div>
          </div>

          {/* Interlineado */}
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel} htmlFor="slider-lineas">
              Interlineado: <strong>{prefs.interlineado.toFixed(1)}</strong>
            </label>
            <input
              id="slider-lineas"
              type="range"
              min={1.2}
              max={3.0}
              step={0.1}
              value={prefs.interlineado}
              onChange={e => actualizarPref('interlineado', Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderLabels}>
              <span>Normal</span>
              <span>Muy abierto</span>
            </div>
          </div>

          {/* Ancho de columna */}
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel} htmlFor="slider-ancho">
              Ancho columna: <strong>{prefs.anchoColumna}%</strong>
            </label>
            <input
              id="slider-ancho"
              type="range"
              min={40}
              max={100}
              step={5}
              value={prefs.anchoColumna}
              onChange={e => actualizarPref('anchoColumna', Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderLabels}>
              <span>Estrecho</span>
              <span>Completo</span>
            </div>
          </div>

          {/* Color de fondo */}
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>Color de fondo</span>
            <div className={styles.colorBtns} role="group" aria-label="Color de fondo del texto">
              {COLORES_FONDO.map(c => (
                <button
                  key={c.id}
                  className={`${styles.colorBtn} ${prefs.colorFondo === c.color ? styles.activo : ''}`}
                  onClick={() => actualizarPref('colorFondo', c.color)}
                  aria-label={c.nombre}
                  aria-pressed={prefs.colorFondo === c.color}
                  title={c.nombre}
                  style={{ backgroundColor: c.color }}
                >
                  {c.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Botones de acción */}
          <div className={styles.acciones}>
            <button
              className={styles.btnSecundario}
              onClick={resetear}
              aria-label="Restablecer ajustes por defecto"
            >
              🔄 Restablecer
            </button>
          </div>

          <p className={styles.guardadoMsg} aria-live="polite">
            ✅ Ajustes guardados automáticamente
          </p>
        </aside>

        {/* Panel principal */}
        <main className={styles.mainPanel}>
          {/* Entrada de texto */}
          <section className={styles.seccionTexto}>
            <h2 className={styles.seccionTitulo}>Tu texto</h2>
            <p className={styles.hint}>
              Pega o escribe el texto que quieres adaptar
            </p>
            <textarea
              className={styles.textarea}
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder="Pega aquí el texto que quieres adaptar..."
              rows={6}
              aria-label="Texto a adaptar para lectura"
            />
          </section>

          {/* Vista previa */}
          <section className={styles.seccionVista} aria-label="Vista previa del texto adaptado">
            <div className={styles.vistaHeader}>
              <h2 className={styles.seccionTitulo}>👁️ Vista previa</h2>
              <button
                className={styles.btnPrimario}
                onClick={copiarTexto}
                aria-label={copiado ? 'Texto copiado al portapapeles' : 'Copiar texto al portapapeles'}
              >
                {copiado ? '✅ Copiado' : '📋 Copiar texto'}
              </button>
            </div>
            <div className={styles.vistaContenedor}>
              <div
                className={styles.textoAdaptado}
                style={estilosVista}
                role="region"
                aria-label="Texto con formato aplicado"
              >
                {texto
                  ? texto.split('\n').map((linea, i) =>
                      linea === '' ? <br key={i} /> : <p key={i}>{linea}</p>
                    )
                  : <em className={styles.placeholder}>El texto aparecerá aquí con tus ajustes aplicados...</em>
                }
              </div>
            </div>
          </section>
        </main>
      </div>

      <EducationalSection
        title="📚 ¿Qué es la dislexia y cómo ayuda este adaptador?"
        subtitle="Información sobre dislexia y accesibilidad lectora"
      >
        <section className={styles.guiaSeccion}>
          <h2>¿Qué es la dislexia?</h2>
          <p>
            La dislexia es una dificultad específica del aprendizaje de base neurobiológica que afecta
            a entre el 5% y el 15% de la población. Las personas con dislexia tienen dificultades con
            la decodificación de palabras escritas, la fluidez lectora y la ortografía, a pesar de tener
            una inteligencia normal.
          </p>

          <h2>¿Por qué ayudan los ajustes visuales?</h2>
          <ul>
            <li>
              <strong>Fuente Lexend</strong>: Diseñada específicamente para mejorar la legibilidad.
              Cada letra tiene características únicas que reducen las confusiones entre letras similares (b/d, p/q).
            </li>
            <li>
              <strong>Tamaño grande</strong>: Los textos más grandes son más fáciles de rastrear
              y reducen las confusiones entre letras similares.
            </li>
            <li>
              <strong>Espaciado amplio</strong>: Más espacio entre letras y palabras reduce
              el efecto de &quot;emborronamiento&quot; o agrupación visual.
            </li>
            <li>
              <strong>Interlineado abierto</strong>: Separa las líneas para que los ojos
              puedan seguir el texto sin perderse de fila.
            </li>
            <li>
              <strong>Columna estrecha</strong>: Líneas más cortas facilitan el salto
              de una línea a la siguiente sin perder el punto de lectura.
            </li>
            <li>
              <strong>Fondo crema</strong>: El contraste suave (en lugar del blanco puro)
              reduce la fatiga visual y el deslumbramiento en pantalla.
            </li>
          </ul>

          <h2>Consejos de uso</h2>
          <ul>
            <li>Empieza por el fondo <strong>Crema</strong> y la fuente <strong>Lexend</strong>: suelen funcionar bien para la mayoría</li>
            <li>Aumenta el interlineado hasta 2.0–2.5 si el texto parece comprimido</li>
            <li>Reduce el ancho de columna al 50–60% para párrafos largos</li>
            <li>Tus ajustes se guardan automáticamente para la próxima visita</li>
            <li>Complementa con la función de lectura en voz alta de tu dispositivo o navegador</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('adaptador-dislexia')} />
      <Footer appName="adaptador-dislexia" />
    </div>
  );
}
