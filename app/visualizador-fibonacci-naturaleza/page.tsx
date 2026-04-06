'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './VisualizadorFibonacciNaturaleza.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'secuencia' | 'espiral' | 'plantas' | 'arte';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'secuencia', titulo: 'La secuencia', icono: '🔢', subtitulo: 'Los números que se suman solos' },
  { id: 'espiral', titulo: 'La espiral', icono: '🌀', subtitulo: 'Cuadrados que forman curvas perfectas' },
  { id: 'plantas', titulo: 'En las plantas', icono: '🌻', subtitulo: 'Pétalos, piñas y girasoles' },
  { id: 'arte', titulo: 'Más allá', icono: '🎨', subtitulo: 'Arte, diseño y cuerpo humano' },
];

// Generar secuencia de Fibonacci
function generarFibonacci(n: number): number[] {
  const fib: number[] = [1, 1];
  for (let i = 2; i < n; i++) {
    fib.push(fib[i - 1] + fib[i - 2]);
  }
  return fib;
}

const FIB_COMPLETA = generarFibonacci(20);

// ─────────────────────────────────────────────
// Sección 1: La secuencia
// ─────────────────────────────────────────────

function SeccionSecuencia() {
  const [visibles, setVisibles] = useState(5);
  const PHI = 1.6180339887;

  const ratios = useMemo(() => {
    const result: { a: number; b: number; ratio: number }[] = [];
    for (let i = 1; i < Math.min(visibles, FIB_COMPLETA.length); i++) {
      result.push({
        a: FIB_COMPLETA[i],
        b: FIB_COMPLETA[i - 1],
        ratio: FIB_COMPLETA[i] / FIB_COMPLETA[i - 1],
      });
    }
    return result;
  }, [visibles]);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          Cada número es la <strong>suma de los dos anteriores</strong>. Sencillo, pero esta regla
          genera patrones que aparecen en toda la naturaleza.
        </p>
      </div>

      {/* Números interactivos */}
      <div className={styles.secuenciaGrid}>
        {FIB_COMPLETA.map((num, i) => (
          <div
            key={i}
            className={`${styles.secuenciaNum} ${i >= visibles ? styles.secuenciaHidden : ''} ${i === visibles - 1 && visibles > 5 ? styles.secuenciaReveal : ''}`}
          >
            {i < visibles ? formatNumber(num, 0) : '?'}
            <span className={styles.secuenciaIdx}>F{i + 1}</span>
          </div>
        ))}
      </div>

      <div className={styles.secuenciaBtns}>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={() => setVisibles(v => Math.min(v + 1, FIB_COMPLETA.length))}
          disabled={visibles >= FIB_COMPLETA.length}
          aria-label="Revelar siguiente número de Fibonacci"
        >
          Siguiente número
        </button>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={() => setVisibles(5)}
          aria-label="Reiniciar secuencia"
        >
          Reiniciar
        </button>
      </div>

      {visibles >= 4 && (
        <div className={styles.insight}>
          <p>
            {visibles >= 8
              ? `Con ${visibles} números visibles, la ratio entre consecutivos ya es ${formatNumber(FIB_COMPLETA[visibles - 1] / FIB_COMPLETA[visibles - 2], 6)} — muy cerca de φ (1,618034...).`
              : `Fíjate: ${FIB_COMPLETA[visibles - 2]} + ${FIB_COMPLETA[visibles - 3]} = ${FIB_COMPLETA[visibles - 1]}. Cada número nace de sus dos predecesores.`}
          </p>
        </div>
      )}

      {/* Tabla de ratios → φ */}
      <div className={styles.ratioTabla}>
        <h3>Convergencia hacia φ (1,618034...)</h3>
        <table>
          <thead>
            <tr>
              <th>F(n)</th>
              <th>F(n-1)</th>
              <th>Ratio</th>
              <th>Diferencia con φ</th>
            </tr>
          </thead>
          <tbody>
            {ratios.slice(1).map((r, i) => (
              <tr key={i}>
                <td>{formatNumber(r.a, 0)}</td>
                <td>{formatNumber(r.b, 0)}</td>
                <td className={styles.ratioPhi}>{formatNumber(r.ratio, 6)}</td>
                <td>{formatNumber(Math.abs(r.ratio - PHI), 6)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.insight}>
        <p>
          A medida que avanzamos, la ratio entre números consecutivos se acerca a <strong>φ = 1,618034...</strong> (phi),
          el <strong>número áureo</strong>. Este número irracional es la clave de por qué Fibonacci aparece en la naturaleza.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: La espiral
// ─────────────────────────────────────────────

function SeccionEspiral() {
  // Cuadrados de Fibonacci para la espiral visual
  // Posiciones calculadas manualmente para encajar en 340x340
  const escala = 20; // 1 unidad Fibonacci = 20px
  const cuadrados = useMemo(() => {
    // Fibonacci: 1, 1, 2, 3, 5, 8
    // Posiciones relativas según el patrón clásico de la espiral
    const data: { size: number; x: number; y: number; label: string }[] = [
      { size: 1, x: 5, y: 5, label: '1' },
      { size: 1, x: 6, y: 5, label: '1' },
      { size: 2, x: 5, y: 3, label: '2' },
      { size: 3, x: 2, y: 3, label: '3' },
      { size: 5, x: 2, y: 6, label: '5' },
      { size: 8, x: 7, y: 3, label: '8' },
    ];
    return data.map(d => ({
      ...d,
      px: d.x * escala,
      py: d.y * escala,
      psize: d.size * escala,
    }));
  }, []);

  // SVG arc path para la espiral dorada (simplificada)
  const spiralPath = useMemo(() => {
    // Arcos cuarto de círculo para cada cuadrado
    const arcs: string[] = [];
    const s = escala;
    // Cuadrado 1x1 en (5,5): arco desde esquina inferior-derecha a esquina superior-derecha
    arcs.push(`M ${6 * s} ${6 * s} A ${1 * s} ${1 * s} 0 0 1 ${6 * s} ${5 * s}`);
    // Cuadrado 1x1 en (6,5): arco
    arcs.push(`A ${1 * s} ${1 * s} 0 0 1 ${7 * s} ${5 * s}`);
    // Cuadrado 2x2 en (5,3):
    arcs.push(`A ${2 * s} ${2 * s} 0 0 1 ${5 * s} ${3 * s}`);
    // Cuadrado 3x3 en (2,3):
    arcs.push(`A ${3 * s} ${3 * s} 0 0 1 ${2 * s} ${6 * s}`);
    // Cuadrado 5x5 en (2,6):
    arcs.push(`A ${5 * s} ${5 * s} 0 0 1 ${7 * s} ${11 * s}`);
    // Cuadrado 8x8 en (7,3):
    arcs.push(`A ${8 * s} ${8 * s} 0 0 1 ${15 * s} ${3 * s}`);

    return arcs.join(' ');
  }, []);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          Si dibujamos cuadrados con lados de Fibonacci (1, 1, 2, 3, 5, 8...) y trazamos un arco
          en cada uno, obtenemos la <strong>espiral dorada</strong>.
        </p>
      </div>

      <div className={styles.espiralContainer}>
        <div className={styles.espiralCanvas} style={{ width: 320, height: 240 }}>
          {cuadrados.map((c, i) => (
            <div
              key={i}
              className={styles.espiralCuadrado}
              style={{
                left: c.px,
                top: c.py,
                width: c.psize,
                height: c.psize,
              }}
            >
              {c.label}
            </div>
          ))}
          <svg className={styles.espiralSvg} viewBox="0 0 320 240" preserveAspectRatio="xMidYMid meet">
            <path d={spiralPath} />
          </svg>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          La espiral dorada es una <strong>espiral logarítmica</strong> que crece por un factor de φ
          con cada cuarto de vuelta. Aparece en la naturaleza porque es la forma más eficiente
          de crecer manteniendo la misma proporción.
        </p>
      </div>

      {/* Ejemplos de la espiral en naturaleza */}
      <div className={styles.ejemplosGrid}>
        <div className={styles.ejemploCard}>
          <span className={styles.ejemploIcono} aria-hidden="true">🐚</span>
          <span className={styles.ejemploNombre}>Nautilus</span>
          <span className={styles.ejemploDesc}>Cada cámara de su concha es ~1,618 veces mayor que la anterior</span>
        </div>
        <div className={styles.ejemploCard}>
          <span className={styles.ejemploIcono} aria-hidden="true">🌀</span>
          <span className={styles.ejemploNombre}>Huracanes</span>
          <span className={styles.ejemploDesc}>Las bandas de nubes siguen un patrón espiral logarítmico</span>
        </div>
        <div className={styles.ejemploCard}>
          <span className={styles.ejemploIcono} aria-hidden="true">🌌</span>
          <span className={styles.ejemploNombre}>Galaxias espirales</span>
          <span className={styles.ejemploDesc}>Los brazos de la Vía Láctea se enrollan siguiendo esta proporción</span>
        </div>
        <div className={styles.ejemploCard}>
          <span className={styles.ejemploIcono} aria-hidden="true">👂</span>
          <span className={styles.ejemploNombre}>Oído humano</span>
          <span className={styles.ejemploDesc}>La cóclea del oído interno forma una espiral logarítmica</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: En las plantas
// ─────────────────────────────────────────────

function SeccionPlantas() {
  const plantas = [
    { icono: '🌻', nombre: 'Girasol', numero: '34 / 55', detalle: '34 espirales en sentido horario, 55 en sentido antihorario. Ambos números de Fibonacci consecutivos.' },
    { icono: '🌲', nombre: 'Piña de pino', numero: '8 / 13', detalle: '8 espirales en un sentido, 13 en el otro. Fibonacci de nuevo.' },
    { icono: '🍍', nombre: 'Piña tropical', numero: '8 / 13', detalle: 'Las escamas de la piña forman 8 y 13 espirales visibles.' },
    { icono: '🌸', nombre: 'Lirio', numero: '3', detalle: '3 pétalos — un número de Fibonacci.' },
    { icono: '🌼', nombre: 'Ranúnculo', numero: '5', detalle: '5 pétalos — el siguiente Fibonacci después de 3.' },
    { icono: '🌷', nombre: 'Delfinio', numero: '8', detalle: '8 pétalos — siguiendo la secuencia.' },
    { icono: '🌾', nombre: 'Caléndula', numero: '13', detalle: '13 pétalos — Fibonacci continúa.' },
    { icono: '🌼', nombre: 'Margarita', numero: '34', detalle: 'Normalmente 34 pétalos (a veces 21 o 55) — siempre Fibonacci.' },
  ];

  // Generar puntos para visualizar el ángulo dorado
  const puntosSemillas = useMemo(() => {
    const puntos: { x: number; y: number }[] = [];
    const centro = 100; // centro del círculo de 200px
    const anguloDorado = 137.508; // grados
    for (let i = 0; i < 80; i++) {
      const angulo = i * anguloDorado * (Math.PI / 180);
      const radio = Math.sqrt(i) * 10;
      puntos.push({
        x: centro + radio * Math.cos(angulo),
        y: centro + radio * Math.sin(angulo),
      });
    }
    return puntos;
  }, []);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          Las plantas no &ldquo;saben&rdquo; matemáticas, pero la evolución ha descubierto que
          los números de Fibonacci optimizan el <strong>empaquetamiento de semillas y pétalos</strong>.
        </p>
      </div>

      {/* Girasol y espirales */}
      <div className={styles.plantasGrid}>
        {plantas.map((p, i) => (
          <div key={i} className={styles.plantaCard}>
            <span className={styles.plantaIcono} aria-hidden="true">{p.icono}</span>
            <div className={styles.plantaInfo}>
              <span className={styles.plantaNombre}>{p.nombre}</span>
              <span className={styles.plantaDetalle}>{p.detalle}</span>
            </div>
            <span className={styles.plantaNum}>{p.numero.length <= 2 ? p.numero : ''}</span>
          </div>
        ))}
      </div>

      {/* Ángulo dorado */}
      <div className={styles.anguloCard}>
        <h3>El ángulo dorado: 137,5°</h3>
        <div className={styles.anguloVisual}>
          {puntosSemillas.map((p, i) => (
            <div
              key={i}
              className={styles.anguloDot}
              style={{ left: p.x, top: p.y }}
            />
          ))}
        </div>
        <p className={styles.anguloLabel}>
          Si cada semilla nueva gira <strong>137,5°</strong> respecto a la anterior (360° / φ²),
          se consigue el <strong>empaquetamiento óptimo</strong>: ninguna semilla tapa a otra, y
          el espacio se aprovecha al máximo. Cualquier otro ángulo deja huecos.
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          No es coincidencia: el ángulo dorado (137,5°) es 360° dividido entre φ².
          Las plantas que &ldquo;descubrieron&rdquo; este ángulo por mutación aleatoria
          producen <strong>más semillas en menos espacio</strong>, así que la selección natural
          las ha favorecido durante millones de años.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Más allá de la naturaleza
// ─────────────────────────────────────────────

function SeccionArte() {
  const ejemplos = [
    { icono: '🏛️', nombre: 'El Partenón', categoria: 'Arquitectura', detalle: 'La fachada encaja en un rectángulo áureo (ancho/alto ≈ 1,618)' },
    { icono: '🖼️', nombre: 'La Mona Lisa', categoria: 'Pintura', detalle: 'Leonardo usó rectángulos áureos para componer el rostro y las manos' },
    { icono: '📐', nombre: 'Le Corbusier', categoria: 'Arquitectura', detalle: 'Su sistema Modulor se basa enteramente en la proporción áurea' },
    { icono: '🍎', nombre: 'Logo de Apple', categoria: 'Diseño', detalle: 'Las curvas del logo siguen proporciones basadas en la sección áurea' },
    { icono: '🐦', nombre: 'Logo de Twitter', categoria: 'Diseño', detalle: 'Construido con círculos cuyas proporciones siguen Fibonacci' },
    { icono: '🎵', nombre: 'Debussy', categoria: 'Música', detalle: 'En Reflets dans l\'eau, el clímax cae exactamente en el punto áureo de la pieza' },
    { icono: '🎼', nombre: 'Bartók', categoria: 'Música', detalle: 'Usaba Fibonacci para estructurar la duración de secciones en sus composiciones' },
    { icono: '📷', nombre: 'Regla de los tercios', categoria: 'Fotografía', detalle: 'Aproximación popular a la proporción áurea para componer imágenes' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          La proporción áurea trasciende la naturaleza: artistas, arquitectos y diseñadores
          la han usado (consciente o inconscientemente) durante <strong>miles de años</strong>.
        </p>
      </div>

      <div className={styles.arteGrid}>
        {ejemplos.map((e, i) => (
          <div key={i} className={styles.arteCard}>
            <span className={styles.arteIcono} aria-hidden="true">{e.icono}</span>
            <span className={styles.arteCategoria}>{e.categoria}</span>
            <span className={styles.arteNombre}>{e.nombre}</span>
            <span className={styles.arteDetalle}>{e.detalle}</span>
          </div>
        ))}
      </div>

      {/* Cuerpo humano */}
      <div className={styles.cuerpoCard}>
        <h3>La proporción áurea en el cuerpo humano</h3>
        <div className={styles.proporcionesGrid}>
          <div className={styles.proporcionItem}>
            <span className={styles.proporcionLabel}>Altura total / ombligo al suelo</span>
            <span className={styles.proporcionValor}>≈ {formatNumber(1.618, 3)}</span>
          </div>
          <div className={styles.proporcionItem}>
            <span className={styles.proporcionLabel}>Antebrazo / mano</span>
            <span className={styles.proporcionValor}>≈ {formatNumber(1.618, 3)}</span>
          </div>
          <div className={styles.proporcionItem}>
            <span className={styles.proporcionLabel}>Cara / ancho de boca</span>
            <span className={styles.proporcionValor}>≈ {formatNumber(1.618, 3)}</span>
          </div>
          <div className={styles.proporcionItem}>
            <span className={styles.proporcionLabel}>Falange / siguiente falange</span>
            <span className={styles.proporcionValor}>≈ {formatNumber(1.618, 3)}</span>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          <strong>Ojo con el sesgo de confirmación:</strong> no todo en la naturaleza sigue
          la proporción áurea. Muchos ejemplos populares (pirámides, tarjetas de crédito)
          son aproximaciones forzadas. Pero donde Fibonacci realmente aparece
          (filotaxis, cristales, espirales) lo hace por razones matemáticas profundas,
          no por misticismo.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorFibonacciNaturalezaPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('secuencia');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'secuencia': return <SeccionSecuencia />;
      case 'espiral': return <SeccionEspiral />;
      case 'plantas': return <SeccionPlantas />;
      case 'arte': return <SeccionArte />;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Fibonacci en la Naturaleza</h1>
          <p className={styles.subtitle}>1, 1, 2, 3, 5, 8, 13... la secuencia que lo conecta todo</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.icono}{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Más sobre Fibonacci y la proporción áurea"
          subtitle="Preguntas frecuentes y curiosidades"
          defaultOpen={false}
        >
          <h3>¿Quién fue Fibonacci?</h3>
          <p>
            Leonardo de Pisa, conocido como <strong>Fibonacci</strong> (c. 1170 - c. 1250),
            fue un matemático italiano que introdujo la secuencia en su libro <em>Liber Abaci</em> (1202).
            Aunque él la usó para modelar la reproducción de conejos, la secuencia ya era conocida
            en la India desde el siglo VI (Virahanka, Hemachandra).
          </p>

          <h3>¿Por qué φ es tan especial?</h3>
          <p>
            φ (phi) es el único número cuyo recíproco es él mismo menos 1: 1/φ = φ - 1.
            Esto significa que un rectángulo áureo, al quitarle un cuadrado, deja otro rectángulo
            áureo más pequeño. Esta propiedad de <strong>autosimilaridad</strong> es la razón
            por la que aparece en fractales y estructuras naturales.
          </p>

          <h3>¿Fibonacci aparece en el ADN?</h3>
          <p>
            La doble hélice del ADN tiene 34 ångströms de largo por vuelta completa y 21 de ancho.
            34 y 21 son números de Fibonacci consecutivos. Aunque algunos consideran esto coincidencia,
            la estructura sigue proporciones optimizadas por la evolución molecular.
          </p>

          <h3>¿Es lo mismo la espiral dorada que la espiral de Fibonacci?</h3>
          <p>
            No exactamente. La espiral de Fibonacci se construye con cuadrados y arcos de círculo,
            por lo que tiene &ldquo;esquinas&rdquo; suaves. La espiral dorada verdadera es una
            espiral logarítmica continua con factor de crecimiento φ. Ambas son visualmente
            casi idénticas a escalas grandes.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador simplifica conceptos matemáticos con fines educativos.
            La relación entre Fibonacci y la naturaleza es real, pero no todo lo que se atribuye a la
            proporción áurea es correcto — muchos &ldquo;descubrimientos&rdquo; populares son sesgos
            de confirmación o aproximaciones forzadas.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-fibonacci-naturaleza')} />
        <ShareCard appName="visualizador-fibonacci-naturaleza" />
        <Footer appName="visualizador-fibonacci-naturaleza" />
      </div>
    </>
  );
}
