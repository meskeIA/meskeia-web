'use client';
// @disclaimer: exempt
import { useState, useCallback } from 'react';
import styles from './SimuladorBajaVision.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import { matrizParaFeColorMatrix } from '@/lib/calculadoras/daltonismo';

type CondicionId =
  | 'normal'
  | 'cataratas'
  | 'miopia-severa'
  | 'glaucoma'
  | 'degeneracion-macular'
  | 'baja-vision'
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia';

interface Condicion {
  id: CondicionId;
  nombre: string;
  icono: string;
  descripcion: string;
  prevalencia: string;
  impactoUX: string[];
  tieneIntensidad: boolean;
  filtroCSS: (intensidad: number) => string;
  usaSVG?: boolean;
}

const CONDICIONES: Condicion[] = [
  {
    id: 'normal',
    nombre: 'Visión normal',
    icono: '👁️',
    descripcion: 'Referencia de visión sin alteraciones. Contraste pleno, colores correctos y nitidez óptima.',
    prevalencia: 'Base de referencia',
    impactoUX: ['Sin restricciones de contraste', 'Todos los colores accesibles', 'Texto fino legible'],
    tieneIntensidad: false,
    filtroCSS: () => 'none',
  },
  {
    id: 'cataratas',
    nombre: 'Cataratas',
    icono: '🌫️',
    descripcion: 'Opacidad del cristalino que produce visión turbia, amarillenta y con deslumbramiento.',
    // Cifras con fuente, año y POBLACIÓN (hallazgo 2764). La de cataratas es de EE. UU. porque
    // es la que da su fuente; las de glaucoma y DMAE son las mundiales. Cotejadas con el
    // resumen en PubMed el 03/10/2026: Congdon 2004 «20.5 million (17.2%) Americans older
    // than 40 years have cataract»; Tham 2014 «3.54% … aged 40-80 years»; Wong 2014 «any
    // age-related macular degeneration … 8.69% (mapped to an age range of 45-85 years)».
    prevalencia: '~17 % de los mayores de 40 años en EE. UU. (Congdon et al., Arch Ophthalmol 2004)',
    impactoUX: [
      'Texto pequeño difícil de leer',
      'Colores con tinte amarillo/marrón',
      'Deslumbramiento en fondos blancos',
    ],
    tieneIntensidad: true,
    filtroCSS: (i) => {
      const blur = (i / 100) * 3;
      const sepia = (i / 100) * 0.6;
      const brightness = 1 - (i / 100) * 0.25;
      const contrast = 1 - (i / 100) * 0.3;
      return `blur(${blur.toFixed(2)}px) sepia(${sepia.toFixed(2)}) brightness(${brightness.toFixed(2)}) contrast(${contrast.toFixed(2)})`;
    },
  },
  {
    id: 'miopia-severa',
    nombre: 'Miopía severa',
    icono: '🔍',
    descripcion: 'Dificultad para ver de lejos con claridad. A corta distancia puede ser aceptable.',
    prevalencia: '~4 % de la población (miopía alta; Holden et al., Ophthalmology 2016)',
    impactoUX: [
      'Elementos lejanos/pequeños borrosos',
      'Necesita acercarse a la pantalla',
      'Texto grande más accesible',
    ],
    tieneIntensidad: true,
    filtroCSS: (i) => {
      const blur = (i / 100) * 5;
      return `blur(${blur.toFixed(2)}px)`;
    },
  },
  {
    id: 'glaucoma',
    nombre: 'Glaucoma',
    icono: '🔦',
    descripcion: 'Daño al nervio óptico que reduce el campo visual periférico progresivamente.',
    prevalencia: '~3,5 % entre los 40 y los 80 años, en todo el mundo (Tham et al., Ophthalmology 2014)',
    impactoUX: [
      'Solo ve el centro de la pantalla',
      'Menús laterales frecuentemente perdidos',
      'Notificaciones en esquinas invisibles',
    ],
    tieneIntensidad: true,
    filtroCSS: () => 'none',
    usaSVG: false,
  },
  {
    id: 'degeneracion-macular',
    nombre: 'Degeneración macular',
    icono: '⚫',
    descripcion: 'Pérdida de la visión central. El punto de fijación queda oscurecido.',
    prevalencia: '~8,7 % entre los 45 y los 85 años, en todo el mundo (Wong et al., Lancet Glob Health 2014)',
    impactoUX: [
      'Centro de la pantalla oscurecido',
      'Texto central ilegible',
      'Solo usa visión periférica',
    ],
    tieneIntensidad: true,
    filtroCSS: () => 'none',
    usaSVG: false,
  },
  {
    id: 'baja-vision',
    nombre: 'Baja visión general',
    icono: '😶‍🌫️',
    descripcion: 'Reducción significativa de agudeza visual no corregible con gafas ni cirugía.',
    // Bourne et al. 2017, datos de 2015: 216,6 millones con discapacidad visual moderada o
    // grave, «2·95%» de prevalencia bruta. El 2,8 % anterior dividía esos millones de 2015
    // entre la población de 2019 (hallazgo 2770).
    prevalencia: '2,95 % de la población mundial con discapacidad visual moderada o grave en 2015 (Bourne et al., Lancet Glob Health 2017)',
    impactoUX: [
      'Necesita texto muy grande (16 px mínimo)',
      'Alto contraste imprescindible',
      'Zoom constante hasta el 200-400 %',
    ],
    tieneIntensidad: true,
    filtroCSS: (i) => {
      const blur = (i / 100) * 2;
      const contrast = 1 - (i / 100) * 0.5;
      const brightness = 1 - (i / 100) * 0.2;
      return `blur(${blur.toFixed(2)}px) contrast(${contrast.toFixed(2)}) brightness(${brightness.toFixed(2)})`;
    },
  },
  {
    id: 'protanopia',
    nombre: 'Protanopia (rojo)',
    icono: '🔴',
    descripcion: 'Ausencia de conos sensibles al rojo. El rojo aparece oscuro/negro.',
    prevalencia: '~1 % hombres',
    impactoUX: [
      'Rojo y verde indistinguibles',
      'Alertas rojas pueden perderse',
      'Necesita iconos además de color',
    ],
    tieneIntensidad: false,
    filtroCSS: () => 'url(#protanopia)',
    usaSVG: true,
  },
  {
    id: 'deuteranopia',
    nombre: 'Deuteranopia (verde)',
    icono: '🟢',
    descripcion: 'Ausencia de conos sensibles al verde. Verde y rojo se confunden.',
    prevalencia: '~1 % hombres',
    impactoUX: [
      'Verde y rojo parecen similares',
      'Gráficos de éxito/error confusos',
      'Semáforos de estado inaccesibles',
    ],
    tieneIntensidad: false,
    filtroCSS: () => 'url(#deuteranopia)',
    usaSVG: true,
  },
  {
    id: 'tritanopia',
    nombre: 'Tritanopia (azul)',
    icono: '🔵',
    // NEI (NIH), «Types of Color Vision Deficiency»: la tritanopia impide distinguir «blue and
    // green, purple and red, and yellow and pink». Es lo que pinta el filtro de abajo: la
    // píldora azul y la verde de la maqueta quedan a ~30 de distancia RGB, y la amarilla vira
    // a un rosa salmón. Decía «azul y amarillo se confunden» (hallazgo 2765).
    descripcion: 'Ausencia de conos sensibles al azul. Se confunden el azul con el verde, el amarillo con el rosa y el púrpura con el rojo.',
    prevalencia: '~0,01 % de la población',
    impactoUX: [
      'Azul y verde casi indistinguibles',
      'Avisos amarillos que viran a rosa',
      'Enlaces azules confundibles con elementos verdes',
    ],
    tieneIntensidad: false,
    filtroCSS: () => 'url(#tritanopia)',
    usaSVG: true,
  },
];

export default function SimuladorBajaVision() {
  const [condicionActiva, setCondicionActiva] = useState<CondicionId>('normal');
  const [intensidad, setIntensidad] = useState(60);

  const condicion = CONDICIONES.find((c) => c.id === condicionActiva)!;

  const obtenerEstilo = useCallback((): React.CSSProperties => {
    const filtro = condicion.filtroCSS(intensidad);
    if (filtro === 'none' || filtro.startsWith('url(')) {
      return { filter: filtro };
    }
    return { filter: filtro };
  }, [condicion, intensidad]);

  const necesitaOverlay = condicionActiva === 'glaucoma' || condicionActiva === 'degeneracion-macular';
  const overlayIntensidad = intensidad / 100;

  return (
    <div className={styles.container}>
      {/* Filtros SVG de daltonismo — las matrices salen de `@/lib/calculadoras/daltonismo`,
          el mismo módulo que usa `simulador-daltonismo`.

          ⚠️ Estos tres filtros NO declaran `colorInterpolationFilters`, y es deliberado: la
          especificación SVG usa linearRGB por defecto, que es exactamente donde opera el
          modelo de Machado et al. (2009). Declarar "sRGB" aquí haría que la matriz se
          multiplicase contra la señal con gamma y el resultado dejaría de ser el del modelo.

          Hasta el 20/09/2026 había aquí otras matrices —el juego HCIRN/Wickline de los
          filtros de accesibilidad web—, duplicadas literalmente en la app hermana y
          aplicadas allí en otro espacio, así que las dos pintaban colores distintos para la
          misma condición. Aquel juego es además INVERTIBLE: no puede fundir dos colores en
          uno, de modo que una confusión cromática real no llegaba a verse nunca. */}
      <svg className={styles.svgFiltros} aria-hidden="true" focusable="false">
        <defs>
          <filter id="protanopia">
            <feColorMatrix type="matrix" values={matrizParaFeColorMatrix('protanopia')} />
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values={matrizParaFeColorMatrix('deuteranopia')} />
          </filter>
          <filter id="tritanopia">
            <feColorMatrix type="matrix" values={matrizParaFeColorMatrix('tritanopia')} />
          </filter>
        </defs>
      </svg>

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Simulador de Baja Visión</h1>
        <p>Experimenta cómo ven las personas con distintas condiciones visuales</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Selector de condición */}
        <section className={styles.selectorSeccion}>
          <h2 className={styles.sectionTitle}>Condición visual</h2>
          <div className={styles.condicionesGrid}>
            {CONDICIONES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`${styles.condicionBtn} ${condicionActiva === c.id ? styles.condicionActiva : ''}`}
                onClick={() => setCondicionActiva(c.id)}
                aria-pressed={condicionActiva === c.id}
              >
                <span className={styles.condicionIcono} aria-hidden="true">{c.icono}</span>
                <span className={styles.condicionNombre}>{c.nombre}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Control de intensidad */}
        {condicion.tieneIntensidad && (
          <section className={styles.intensidadSeccion}>
            {/* El nombre accesible es la etiqueta visible, palabra por palabra (WCAG 2.5.3), y
                el valor va en aria-valuetext con su «%»: el aria-label anterior decía
                «Intensidad de simulación: 60%», sin el «la», y repetía el valor (hallazgo 2767). */}
            <label className={styles.intensidadLabel} htmlFor="slider-intensidad">
              <span id="nombre-intensidad">Intensidad de la simulación</span>:{' '}
              <strong>{`${intensidad} %`}</strong>
            </label>
            <input
              id="slider-intensidad"
              type="range"
              min={10}
              max={100}
              step={5}
              value={intensidad}
              onChange={(e) => setIntensidad(Number(e.target.value))}
              className={styles.slider}
              aria-labelledby="nombre-intensidad"
              aria-valuetext={`${intensidad} %`}
            />
            <div className={styles.intensidadEtiquetas}>
              <span>Leve</span>
              <span>Moderada</span>
              <span>Severa</span>
            </div>
          </section>
        )}

        {/* Info de la condición */}
        <section className={styles.infoCondicion} role="status" aria-live="polite" aria-atomic="true">
          <div className={styles.infoHeader}>
            <span className={styles.infoIcono} aria-hidden="true">{condicion.icono}</span>
            <div>
              <h3>{condicion.nombre}</h3>
              <p className={styles.infoPrevalencia}>{condicion.prevalencia}</p>
            </div>
          </div>
          <p className={styles.infoDesc}>{condicion.descripcion}</p>
          <div className={styles.impactoGrid}>
            <p className={styles.impactoTitulo}>Impacto en interfaces:</p>
            <ul className={styles.impactoLista}>
              {condicion.impactoUX.map((punto, i) => (
                <li key={i}>{punto}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Vista de demostración */}
        <section className={styles.demoSeccion}>
          <h2 className={styles.sectionTitle}>Vista simulada</h2>
          {/* Sin aria-live: interpola el valor del deslizador, así que arrastrarlo disparaba
              un anuncio por paso, encima del que ya emite el propio control de rango y del
              aria-label del input. Lo que necesita anunciarse es el cambio de CONDICIÓN, y
              de eso se ocupa la ficha de arriba, que sí es role="status" (hallazgo 959). */}
          <p className={styles.demoSubtitulo}>
            Así verías esta interfaz de ejemplo con <strong>{condicion.nombre.toLowerCase()}</strong>
            {condicion.tieneIntensidad ? ` (intensidad ${intensidad} %)` : ''}:
          </p>

          <div className={styles.demoWrapper}>
            {/* Overlay para glaucoma/macular */}
            {necesitaOverlay && (
              <div
                className={`${styles.overlay} ${condicionActiva === 'glaucoma' ? styles.overlayGlaucoma : styles.overlayMacular}`}
                style={{ opacity: overlayIntensidad }}
                aria-hidden="true"
              />
            )}

            {/* La maqueta es decorativa: sus enlaces no llevan a ninguna parte, su botón es
                inerte y sus cifras («Retención 4.750 €») son inventadas. Sin `inert` sus 7
                elementos capturaban el foco del teclado y un lector leía ese contenido
                falso como si fuera de la página (hallazgo 958). */}
            <div
              className={styles.demoContenido}
              style={obtenerEstilo()}
              aria-hidden="true"
              inert
            >
              {/* Simulación de interfaz */}
              <nav className={styles.demoNav}>
                <span className={styles.demoLogo}>meskeIA</span>
                <div className={styles.demoNavLinks}>
                  <a href="#" className={styles.demoLink} onClick={(e) => e.preventDefault()}>Inicio</a>
                  <a href="#" className={styles.demoLink} onClick={(e) => e.preventDefault()}>Apps</a>
                  <a href="#" className={styles.demoLink} onClick={(e) => e.preventDefault()}>Guías</a>
                </div>
              </nav>

              <div className={styles.demoHero}>
                <h3>Calculadora de IRPF 2025</h3>
                <p>Calcula tu retención fiscal en segundos. Datos oficiales AEAT.</p>
                <button type="button" className={styles.demoCta} onClick={(e) => e.preventDefault()}>
                  Calcular ahora
                </button>
              </div>

              <div className={styles.demoCardsGrid}>
                <div className={styles.demoCard}>
                  <span className={styles.demoCardIcono} aria-hidden="true">📊</span>
                  <strong>Ingresos brutos</strong>
                  <input
                    type="text"
                    defaultValue="35.000 €"
                    className={styles.demoInput}
                    readOnly
                    aria-label="Campo de demostración"
                  />
                </div>
                <div className={styles.demoCard}>
                  <span className={styles.demoCardIcono} aria-hidden="true">🧾</span>
                  <strong>Deducciones</strong>
                  <input
                    type="text"
                    defaultValue="2.000 €"
                    className={styles.demoInput}
                    readOnly
                    aria-label="Campo de demostración"
                  />
                </div>
                <div className={styles.demoCard}>
                  <span className={styles.demoCardIcono} aria-hidden="true">✅</span>
                  <strong>Retención</strong>
                  <p className={styles.demoResultado}>4.750 €</p>
                </div>
              </div>

              <div className={styles.demoBadges}>
                <span className={styles.badgeVerde}><span aria-hidden="true">✓ </span>Guardado</span>
                <span className={styles.badgeRojo}><span aria-hidden="true">✗ </span>Error en campo</span>
                <span className={styles.badgeAmarillo}><span aria-hidden="true">⚠ </span>Revisar</span>
                <span className={styles.badgeAzul}><span aria-hidden="true">ℹ </span>Info</span>
              </div>

              <p className={styles.demoTextoSmall}>
                Los datos mostrados son orientativos. Consulte con un asesor fiscal.{' '}
                <a href="#" className={styles.demoLink} onClick={(e) => e.preventDefault()}>
                  Más información
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* El alcance de la herramienta se dice a la vista, no dentro de la guía colapsada.
            Era lo ÚNICO que situaba a una app que nombra cinco enfermedades oculares con su
            prevalencia, y vivía tras dos pliegues: la <EducationalSection> cerrada y, dentro,
            un <details> también cerrado. El CLAUDE.md lo prohíbe expresamente (hallazgo 956). */}
        <p className={styles.alcance}>
          <span aria-hidden="true">ℹ️</span> Esto es una <strong>aproximación visual para
          diseñadores</strong>: las condiciones reales son más complejas y varían mucho de una
          persona a otra. No uses este simulador para fines diagnósticos ni para estimar la
          visión de nadie en concreto.
        </p>

        {/* Comparativa rápida */}
        <section className={styles.warningBox}>
          <h3><span aria-hidden="true">💡</span> Claves para diseñar con accesibilidad visual</h3>
          <ul>
            <li><strong>Contraste mínimo WCAG AA:</strong> 4,5:1 para texto normal, 3:1 para texto grande</li>
            <li><strong>No uses solo el color</strong> para transmitir información (añade iconos o texto)</li>
            <li><strong>Tamaño mínimo recomendado:</strong> 16{' '}px para cuerpo de texto</li>
            <li><strong>Evita fondos blancos puros (#FFF)</strong> para usuarios con cataratas</li>
            <li><strong>Coloca notificaciones importantes</strong> en el centro, no solo en esquinas</li>
          </ul>
        </section>

        <EducationalSection
          title="Guía de condiciones visuales y accesibilidad"
          subtitle="Todo lo que necesitas saber para diseñar interfaces accesibles"
        >
          <div className={styles.educativo}>
            <h3>Comparativa de condiciones</h3>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Condición</th>
                    <th>Prevalencia</th>
                    <th>Principal dificultad</th>
                    <th>Solución en diseño</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Cataratas</td>
                    <td>17{' '}% de los mayores de 40 (EE.{' '}UU.)</td>
                    <td>Visión turbia y amarilla</td>
                    <td>Alto contraste, evitar blanco puro</td>
                  </tr>
                  <tr>
                    <td>Miopía severa</td>
                    <td>4{' '}% (miopía alta)</td>
                    <td>Borrosidad a distancia</td>
                    <td>Texto grande, interlineado amplio</td>
                  </tr>
                  <tr>
                    <td>Glaucoma</td>
                    <td>3,5{' '}% de 40 a 80 años (mundo)</td>
                    <td>Pérdida visión periférica</td>
                    <td>UI centrada, notificaciones centrales</td>
                  </tr>
                  <tr>
                    <td>D. macular</td>
                    <td>8,7{' '}% de 45 a 85 años (mundo)</td>
                    <td>Punto ciego central</td>
                    <td>Información redundante en periférico</td>
                  </tr>
                  <tr>
                    <td>Daltonismo rojo-verde</td>
                    <td>8{' '}% de los hombres de ascendencia europea</td>
                    <td>Confusión rojo/verde</td>
                    <td>No depender solo del color</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.fuenteDato}>
              Fuentes de las prevalencias: cataratas, Congdon et al. (2004), <em>Arch Ophthalmol</em>{' '}
              122(4), 487-494, cifra de Estados Unidos; glaucoma, Tham et al. (2014),{' '}
              <em>Ophthalmology</em> 121(11), 2081-2090; degeneración macular (cualquier estadio), Wong
              et al. (2014), <em>Lancet Global Health</em> 2(2), e106-e116; miopía alta, Holden et al.
              (2016), <em>Ophthalmology</em> 123(5), 1036-1042; daltonismo, Birch (2012),{' '}
              <em>Journal of the Optical Society of America A</em> 29(3), 313-320; baja visión, Bourne
              et al. (2017), <em>Lancet Global Health</em> 5(9), e888-e897.
            </p>

            <h3>Casos de uso de este simulador</h3>
            <ul>
              <li><strong>Diseñadores UX/UI:</strong> Validar paletas de color antes de entregar</li>
              <li><strong>Desarrolladores front-end:</strong> Comprobar contraste de componentes</li>
              <li><strong>Product managers:</strong> Defender la accesibilidad ante el equipo</li>
              <li><strong>Formadores:</strong> Mostrar a estudiantes el impacto real de las decisiones de diseño</li>
            </ul>

            <h3>Preguntas frecuentes</h3>
            <div className={styles.faq}>
              <details>
                <summary>¿Es una simulación médicamente precisa?</summary>
                <p>No. Es una aproximación visual para diseñadores. Las condiciones reales son más complejas y variables entre personas. No uses este simulador para fines diagnósticos.</p>
              </details>
              <details>
                <summary>¿Qué estándar de accesibilidad debo seguir?</summary>
                {/* El RD 1112/2018 solo obliga al sector público (título y art. 2, BOE-A-2018-12699).
                    El sector privado lo cubre, para determinados servicios, el título I de la Ley
                    11/2023 (BOE-A-2023-11022): art. 2.2 y disposición final sobre entrada en vigor,
                    leídos en el BOE el 03/10/2026 (hallazgo 2771). */}
                <p>
                  La referencia habitual es WCAG 2.1 nivel AA. En España, el Real Decreto 1112/2018
                  obliga solo a los sitios web y las apps del <strong>sector público</strong>, y los
                  presume conformes si cumplen la norma europea EN 301 549, cuyos requisitos para la
                  web siguen las WCAG. Para el sector privado, desde el 28 de junio
                  de 2025 el título I de la Ley 11/2023, de 8 de mayo (que transpone la Directiva (UE)
                  2019/882), exige accesibilidad a determinados servicios para consumidores, como el
                  comercio electrónico, la banca, el transporte de viajeros o las comunicaciones
                  electrónicas, con una exención para las microempresas que prestan servicios. En
                  otros países rigen sus propias normas. Apuntar a AAA en apps de uso público
                  beneficia a más usuarios.
                </p>
              </details>
              <details>
                <summary>¿Cómo comprobar el contraste de mis colores?</summary>
                <p>Usa la calculadora de contraste de meskeIA o herramientas como el color picker de DevTools de Chrome, que muestra el ratio WCAG en tiempo real.</p>
              </details>
              <details>
                <summary>¿El daltonismo afecta igual a hombres y mujeres?</summary>
                {/* Misma fuente y redacción que la app hermana simulador-daltonismo (de1a7007).
                    Birch 2012, resumen en PubMed: «about 8% in men and about 0.4% in women»
                    en europeos, «between 4% and 6.5% in men of Chinese and Japanese ethnicity»
                    (hallazgo 2769). */}
                <p>
                  No. El daltonismo rojo-verde (protanopia, deuteranopia y sus formas leves) está
                  ligado al cromosoma X, y por eso es mucho más frecuente en hombres: afecta a cerca
                  del 8{' '}% de los hombres y al 0,4{' '}% de las mujeres de ascendencia
                  europea, según la revisión de encuestas poblacionales de Birch (2012). La prevalencia
                  no es la misma en todo el mundo: en hombres de ascendencia china y japonesa esa misma
                  revisión la sitúa entre el 4{' '}% y el 6,5{' '}%.
                </p>
              </details>
            </div>

            <h3>Pasos para una auditoría de accesibilidad visual</h3>
            <ol>
              <li>Comprueba el ratio de contraste de todos los textos (objetivo: ≥4,5:1)</li>
              <li>Simula tu interfaz con protanopia y deuteranopia</li>
              <li>Verifica que los estados (éxito/error) no dependen solo del color</li>
              <li>Prueba con zoom al 200{' '}% (texto no debe desbordarse)</li>
              <li>Revisa que las notificaciones importantes no están solo en esquinas</li>
            </ol>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-baja-vision')} />
        <ShareCard appName="simulador-baja-vision" />
      </main>

      <Footer appName="simulador-baja-vision" />
    </div>
  );
}
