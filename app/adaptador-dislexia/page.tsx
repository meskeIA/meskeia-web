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
  ShareCard,
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
        <h1 className={styles.title}><span aria-hidden="true">📖</span> Adaptador de Lectura para Dislexia</h1>
        <p className={styles.subtitle}>
          Personaliza cualquier texto para que te resulte más fácil de leer.
          Ajusta la fuente, el tamaño, el espaciado y el color de fondo.
          Tus preferencias se guardan automáticamente.
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="medical"
        severity="high"
        title="Herramienta de apoyo a la lectura"
      >
        Esta herramienta adapta visualmente los textos para facilitar la lectura.
        No sustituye la evaluación ni el tratamiento de un especialista.
        Si tienes dudas sobre dificultades de lectura, consulta con un logopeda o psicopedagogo.
      </DisclaimerCard>

      <div className={styles.layout}>
        {/* Panel de controles */}
        <aside className={styles.controlesPanel} aria-label="Ajustes de lectura">
          <h2 className={styles.panelTitle}><span aria-hidden="true">⚙️</span> Ajustes</h2>

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
                  type="button"
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
                  type="button"
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
              type="button"
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
              <h2 className={styles.seccionTitulo}><span aria-hidden="true">👁️</span> Vista previa</h2>
              <button
                type="button"
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
                aria-live="polite"
                aria-atomic="true"
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

        {/* TABLA COMPARATIVA */}
        <section className={styles.guiaSeccion}>
          <h2>Comparativa de fuentes para dislexia</h2>
          <p>No todas las fuentes funcionan igual según el perfil lector. Esta tabla resume las diferencias clave para ayudarte a elegir:</p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>Arial / Sistema</th>
                  <th>Lexend ⭐</th>
                  <th>Monoespaciada</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Legibilidad general</td>
                  <td>Buena</td>
                  <td className={styles.celdaDestacada}>Excelente</td>
                  <td>Media</td>
                </tr>
                <tr>
                  <td>Distinción b/d/p/q</td>
                  <td>Media</td>
                  <td className={styles.celdaDestacada}>Alta</td>
                  <td>Alta</td>
                </tr>
                <tr>
                  <td>Fatiga visual</td>
                  <td>Media</td>
                  <td className={styles.celdaDestacada}>Baja</td>
                  <td>Alta en textos largos</td>
                </tr>
                <tr>
                  <td>Apta para imprimir</td>
                  <td>Sí</td>
                  <td className={styles.celdaDestacada}>Sí (muy buena)</td>
                  <td>Regular</td>
                </tr>
                <tr>
                  <td>Recomendada para</td>
                  <td>Uso general</td>
                  <td className={styles.celdaDestacada}>Dislexia, lectura prolongada</td>
                  <td>Código, listas cortas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CASOS DE USO */}
        <section className={styles.guiaSeccion}>
          <h2>¿Para quién es este adaptador?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">🧒</span>
              <h3>Niño escolar con dislexia</h3>
              <p>Facilita la lectura de apuntes y enunciados de examen. El educador puede pegar el texto y configurarlo juntos, guardando los ajustes para futuras visitas desde el mismo dispositivo.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">🎓</span>
              <h3>Adulto universitario</h3>
              <p>Adapta artículos académicos y apuntes extensos. El fondo crema y la columna estrecha reducen la sobrecarga visual en sesiones de estudio largas.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">💼</span>
              <h3>Profesional con fatiga visual</h3>
              <p>Útil para leer correos largos, informes o normativas. Sin necesidad de instalar fuentes en el ordenador corporativo: funciona directamente en el navegador.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">👩‍🏫</span>
              <h3>Educador o logopeda</h3>
              <p>Prepara materiales de lectura adaptados para cada alumno. Permite demostrar en tiempo real el impacto de los diferentes ajustes tipográficos en una sesión.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guiaSeccion}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Qué diferencia hay entre Lexend y otras fuentes &quot;para dislexia&quot;?</dt>
              <dd>Lexend fue diseñada con base en investigación sobre velocidad lectora. A diferencia de otras fuentes populares (como OpenDyslexic), no añade peso extra a la base de las letras, lo que muchos usuarios encuentran más natural y menos distractivo.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿El adaptador funciona sin conexión a internet?</dt>
              <dd>Casi completamente. La fuente Lexend se carga desde Google Fonts la primera vez; si ya la cargaste antes y tu navegador la tiene en caché, sí funciona sin conexión. Arial y Mono están disponibles siempre.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Los ajustes se guardan para la próxima visita?</dt>
              <dd>Sí. Los parámetros se guardan en el almacenamiento local del navegador. La próxima vez que abras la app en el mismo dispositivo y navegador, encontrarás la configuración tal como la dejaste.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué fondo funciona mejor para cada persona?</dt>
              <dd>No hay una respuesta única. El fondo Crema suele ser el más cómodo para la mayoría, pero algunas personas prefieren el Azul pálido o el Verde. Lo ideal es probarlo con el propio usuario presente y dejar que decida.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Se puede imprimir el texto con los ajustes aplicados?</dt>
              <dd>Sí. Puedes usar la función de imprimir del navegador (Ctrl+P). El texto de la vista previa se imprimirá con la fuente y el tamaño que hayas configurado, aunque el color de fondo depende de la configuración de tu impresora.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Hay diferencia entre dislexia y baja visión?</dt>
              <dd>Sí. La dislexia es una dificultad de procesamiento lingüístico neurológico, no visual. La baja visión implica una agudeza visual reducida. Este adaptador ayuda en ambos casos, pero desde mecanismos diferentes: reduce la confusión de letras en dislexia y aumenta la comodidad visual en baja visión.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Funciona en móvil y tablet?</dt>
              <dd>Sí. La interfaz es responsive y se adapta a cualquier tamaño de pantalla. En tablet puede resultar especialmente útil en orientación horizontal, con el panel de ajustes a la izquierda y el texto adaptado a la derecha.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puede sustituir a una evaluación profesional?</dt>
              <dd>No. Esta herramienta es un apoyo visual para la lectura, no un diagnóstico ni un tratamiento. Si sospechas dislexia en un niño o adulto, consulta con un psicopedagogo o logopeda para una evaluación adecuada.</dd>
            </div>
          </dl>
        </section>

        {/* GUÍA PASO A PASO */}
        <section className={styles.guiaSeccion}>
          <h2>Cómo configurar el adaptador con un alumno</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div>
                <strong>Pega el texto a adaptar</strong>
                <p>Copia el texto que necesita leer el alumno (apuntes, enunciado, artículo) y pégalo en el área de texto superior.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div>
                <strong>Empieza con Lexend y fondo Crema</strong>
                <p>Son los ajustes recomendados por defecto. En la mayoría de casos, ya habrá una mejora visible sin cambiar nada más.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div>
                <strong>Ajusta el tamaño de letra</strong>
                <p>Pregunta al alumno si el texto le parece grande o pequeño. Mueve el slider hasta que responda &quot;está bien&quot;. Un rango habitual: 20–26px.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div>
                <strong>Amplía el espaciado entre letras</strong>
                <p>Sube el slider de &quot;Espacio letras&quot; hasta el 10-15%. Observa si el alumno nota que las letras &quot;respiran mejor&quot;.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div>
                <strong>Abre el interlineado</strong>
                <p>Sube hasta 2.0 o 2.2. Esto separa las líneas y evita que el ojo se &quot;pierda&quot; al saltar de una línea a la siguiente.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div>
                <strong>Reduce el ancho de columna</strong>
                <p>Baja al 55–65%. Las líneas más cortas reducen el desplazamiento ocular y facilitan encontrar el inicio de la siguiente línea.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div>
                <strong>Prueba los fondos de color</strong>
                <p>Deja que el alumno elija el que le resulte más cómodo. Los ajustes se guardan automáticamente para la próxima sesión.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* MEJORES PRÁCTICAS */}
        <section className={styles.guiaSeccion}>
          <h2>Buenas prácticas para educadores y familias</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🎯</span>
              <p><strong>Configura con el usuario presente.</strong> La configuración óptima varía mucho entre personas. Siempre ajusta con el alumno o familiar delante, no de antemano.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🔄</span>
              <p><strong>Cambia un parámetro cada vez.</strong> Si cambias fuente, tamaño y espaciado a la vez, no sabrás qué fue lo que ayudó. Modifica de uno en uno.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🗣️</span>
              <p><strong>Combina con lectura en voz alta.</strong> El adaptador visual y el lector de pantalla del navegador son complementarios. Usa ambos para reforzar la comprensión.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">📸</span>
              <p><strong>Guarda la configuración óptima.</strong> Una vez encontrada, haz una captura de pantalla de los ajustes. Si alguien borra las cookies, tendrás la configuración de referencia.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">📅</span>
              <p><strong>Revisa la configuración periódicamente.</strong> Las necesidades cambian con el tiempo. Una configuración perfecta a los 8 años puede necesitar ajustarse a los 12.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcono} aria-hidden="true">🤝</span>
              <p><strong>Comparte el enlace de la app.</strong> Envía la URL al alumno para que pueda usarla en casa con sus mismos ajustes guardados (si usa el mismo navegador y dispositivo).</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <section className={styles.guiaSeccion}>
          <div className={styles.warningBox}>
            <h3>⚠️ Errores comunes que reducen la efectividad</h3>
            <ul>
              <li><strong>Tamaño muy grande sin reducir el ancho de columna:</strong> con letras de 28px o más y columna al 100%, las líneas quedan demasiado largas y el efecto positivo desaparece.</li>
              <li><strong>Usar fondo blanco puro si hay fotosensibilidad:</strong> el blanco puro (#FFFFFF) genera más contraste del necesario. El fondo crema o azul pálido suelen ser más cómodos.</li>
              <li><strong>Asumir que lo que funciona para uno funciona para todos:</strong> la dislexia se manifiesta de formas muy distintas. No copies la configuración de otro alumno sin comprobarla.</li>
              <li><strong>Confundir dificultad de lectura con falta de interés:</strong> si un alumno rechaza la herramienta, puede ser que los ajustes no sean los adecuados aún. Prueba diferentes combinaciones antes de concluir que no le ayuda.</li>
              <li><strong>Usar el adaptador como único apoyo:</strong> la herramienta es un complemento, no un sustituto de intervención logopédica, ajustes pedagógicos y apoyo emocional.</li>
              <li><strong>No guardar la configuración:</strong> si el usuario borra los datos del navegador (cookies/localStorage), los ajustes se pierden. Tomar nota o captura de la configuración ideal es una buena práctica de seguridad.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('adaptador-dislexia')} />
      <ShareCard appName="adaptador-dislexia" />
      <Footer appName="adaptador-dislexia" />
    </div>
  );
}
