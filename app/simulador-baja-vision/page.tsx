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
    prevalencia: '~17% mayores de 40 años',
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
    prevalencia: '~30% de la población (algún grado)',
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
    prevalencia: '~2% mayores de 40 años',
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
    prevalencia: '~8% mayores de 60 años',
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
    prevalencia: '~2,2% de la población mundial',
    impactoUX: [
      'Necesita texto muy grande (16px mínimo)',
      'Alto contraste imprescindible',
      'Zoom constante hasta 200-400%',
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
    prevalencia: '~1% hombres',
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
    prevalencia: '~1% hombres',
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
    descripcion: 'Ausencia de conos sensibles al azul. Azul y amarillo se confunden.',
    prevalencia: '~0,01% de la población',
    impactoUX: [
      'Azul y amarillo indistinguibles',
      'Links azules pueden perderse',
      'Fondos con gradientes engañosos',
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
      {/* SVG filters for color blindness */}
      <svg className={styles.svgFiltros} aria-hidden="true" focusable="false">
        <defs>
          <filter id="protanopia">
            <feColorMatrix
              type="matrix"
              values="0.567 0.433 0     0 0
                      0.558 0.442 0     0 0
                      0     0.242 0.758 0 0
                      0     0     0     1 0"
            />
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix
              type="matrix"
              values="0.625 0.375 0   0 0
                      0.7   0.3   0   0 0
                      0     0.3   0.7 0 0
                      0     0     0   1 0"
            />
          </filter>
          <filter id="tritanopia">
            <feColorMatrix
              type="matrix"
              values="0.95 0.05  0       0 0
                      0    0.433 0.567   0 0
                      0    0.475 0.525   0 0
                      0    0     0       1 0"
            />
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
            <label className={styles.intensidadLabel} htmlFor="slider-intensidad">
              Intensidad de la simulación: <strong>{intensidad}%</strong>
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
              aria-label={`Intensidad de simulación: ${intensidad}%`}
            />
            <div className={styles.intensidadEtiquetas}>
              <span>Leve</span>
              <span>Moderada</span>
              <span>Severa</span>
            </div>
          </section>
        )}

        {/* Info de la condición */}
        <section className={styles.infoCondicion}>
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
          <p className={styles.demoSubtitulo}>
            Así verías esta interfaz de ejemplo con <strong>{condicion.nombre.toLowerCase()}</strong>
            {condicion.tieneIntensidad ? ` (intensidad ${intensidad}%)` : ''}:
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

            <div className={styles.demoContenido} style={obtenerEstilo()}>
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
                <button className={styles.demoCta} onClick={(e) => e.preventDefault()}>
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
                <span className={styles.badgeVerde}>✓ Guardado</span>
                <span className={styles.badgeRojo}>✗ Error en campo</span>
                <span className={styles.badgeAmarillo}>⚠ Revisar</span>
                <span className={styles.badgeAzul}>ℹ Info</span>
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

        {/* Comparativa rápida */}
        <section className={styles.warningBox}>
          <h3>💡 Claves para diseñar con accesibilidad visual</h3>
          <ul>
            <li><strong>Contraste mínimo WCAG AA:</strong> 4,5:1 para texto normal, 3:1 para texto grande</li>
            <li><strong>No uses solo el color</strong> para transmitir información (añade iconos o texto)</li>
            <li><strong>Tamaño mínimo recomendado:</strong> 16px para cuerpo de texto</li>
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
                    <td>17% +40 años</td>
                    <td>Visión turbia y amarilla</td>
                    <td>Alto contraste, evitar blanco puro</td>
                  </tr>
                  <tr>
                    <td>Miopía severa</td>
                    <td>30% algún grado</td>
                    <td>Borrosidad a distancia</td>
                    <td>Texto grande, interlineado amplio</td>
                  </tr>
                  <tr>
                    <td>Glaucoma</td>
                    <td>2% +40 años</td>
                    <td>Pérdida visión periférica</td>
                    <td>UI centrada, notificaciones centrales</td>
                  </tr>
                  <tr>
                    <td>D. macular</td>
                    <td>8% +60 años</td>
                    <td>Punto ciego central</td>
                    <td>Información redundante en periférico</td>
                  </tr>
                  <tr>
                    <td>Daltonismo</td>
                    <td>8% hombres</td>
                    <td>Confusión rojo/verde</td>
                    <td>No depender solo del color</td>
                  </tr>
                </tbody>
              </table>
            </div>

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
                <p>WCAG 2.1 nivel AA es el mínimo legal en España (Real Decreto 1112/2018). Apuntar a AAA en apps de uso público beneficia a más usuarios.</p>
              </details>
              <details>
                <summary>¿Cómo comprobar el contraste de mis colores?</summary>
                <p>Usa la calculadora de contraste de meskeIA o herramientas como el color picker de DevTools de Chrome, que muestra el ratio WCAG en tiempo real.</p>
              </details>
              <details>
                <summary>¿El daltonismo afecta igual a hombres y mujeres?</summary>
                <p>No. El daltonismo rojo-verde (protanopia/deuteranopia) afecta al ~8% de hombres y solo al ~0,5% de mujeres, al estar ligado al cromosoma X.</p>
              </details>
            </div>

            <h3>Pasos para una auditoría de accesibilidad visual</h3>
            <ol>
              <li>Comprueba el ratio de contraste de todos los textos (objetivo: ≥4,5:1)</li>
              <li>Simula tu interfaz con protanopia y deuteranopia</li>
              <li>Verifica que los estados (éxito/error) no dependen solo del color</li>
              <li>Prueba con zoom al 200% (texto no debe desbordarse)</li>
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
