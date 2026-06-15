'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './MitosisMeiosis.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface FaseMitosis {
  nombre: string;
  descripcion: string;
  cromosomas: string;
  detalle: string;
}

interface FaseMeiosis {
  nombre: string;
  division: string;
  descripcion: string;
  cromosomas: string;
  detalle: string;
}

interface DatoFascinante {
  icono: string;
  titulo: string;
  detalle: string;
}

interface ComparativaItem {
  aspecto: string;
  mitosis: string;
  meiosis: string;
}

// ─────────────────────────────────────────────
// Datos: Mitosis
// ─────────────────────────────────────────────

const FASES_MITOSIS: FaseMitosis[] = [
  {
    nombre: 'Interfase',
    descripcion: 'La célula crece y duplica su ADN.',
    cromosomas: '2n (ADN se replica)',
    detalle: 'Aunque no es técnicamente parte de la mitosis, es la fase preparatoria donde cada cromosoma se duplica formando dos cromátidas hermanas unidas por el centrómero. La célula también duplica sus orgánulos.',
  },
  {
    nombre: 'Profase',
    descripcion: 'Los cromosomas se condensan y se hacen visibles. La membrana nuclear comienza a desaparecer.',
    cromosomas: '2n (cromosomas condensados)',
    detalle: 'La cromatina se condensa en cromosomas visibles. El huso mitótico comienza a formarse a partir de los centrosomas. Los nucléolos desaparecen y la envoltura nuclear se fragmenta.',
  },
  {
    nombre: 'Metafase',
    descripcion: 'Los cromosomas se alinean en el centro de la célula (placa ecuatorial).',
    cromosomas: '2n (alineados en el centro)',
    detalle: 'Los microtúbulos del huso se unen a los cinetocoros de cada cromosoma. Los cromosomas quedan perfectamente alineados en la placa metafásica, equidistantes de ambos polos.',
  },
  {
    nombre: 'Anafase',
    descripcion: 'Las cromátidas hermanas se separan y migran hacia los polos opuestos.',
    cromosomas: '2n → separándose',
    detalle: 'Las cohesinas que unen las cromátidas se degradan. Los microtúbulos se acortan, arrastrando una cromátida hacia cada polo. Es la fase más corta pero más dramática de la mitosis.',
  },
  {
    nombre: 'Telofase',
    descripcion: 'Se forman dos núcleos nuevos. La citocinesis divide el citoplasma → 2 células idénticas.',
    cromosomas: '2n → 2 células con 2n',
    detalle: 'Los cromosomas se descondensan. Se reforma la envoltura nuclear alrededor de cada conjunto. El surco de división (citocinesis) separa el citoplasma, produciendo dos células hijas genéticamente idénticas.',
  },
];

// ─────────────────────────────────────────────
// Datos: Meiosis
// ─────────────────────────────────────────────

const FASES_MEIOSIS: FaseMeiosis[] = [
  {
    nombre: 'Profase I',
    division: 'Meiosis I',
    descripcion: 'Los cromosomas homólogos se emparejan y ocurre el crossing-over (intercambio de segmentos).',
    cromosomas: '2n (emparejamiento)',
    detalle: 'Los cromosomas homólogos se aparean (sinapsis) formando bivalentes. En los quiasmas, las cromátidas no hermanas intercambian segmentos de ADN (crossing-over). Este proceso genera combinaciones genéticas nuevas.',
  },
  {
    nombre: 'Metafase I',
    division: 'Meiosis I',
    descripcion: 'Los bivalentes (pares homólogos) se alinean en la placa ecuatorial.',
    cromosomas: '2n (bivalentes alineados)',
    detalle: 'Los pares de homólogos se disponen al azar en la placa metafásica. La orientación aleatoria de cada par es independiente, lo que contribuye a la variabilidad genética (segregación independiente).',
  },
  {
    nombre: 'Anafase I',
    division: 'Meiosis I',
    descripcion: 'Los cromosomas homólogos se separan hacia polos opuestos (NO las cromátidas).',
    cromosomas: '2n → n + n',
    detalle: 'A diferencia de la mitosis, aquí se separan cromosomas homólogos enteros, no cromátidas. Cada polo recibe un juego haploide de cromosomas, cada uno con dos cromátidas.',
  },
  {
    nombre: 'Telofase I',
    division: 'Meiosis I',
    descripcion: 'Se forman 2 células haploides. Cada una tiene la mitad de cromosomas.',
    cromosomas: '2 células con n',
    detalle: 'Se reforma brevemente la envoltura nuclear. La citocinesis produce dos células haploides. Importante: cada cromosoma aún tiene dos cromátidas (no se duplicó el ADN entre divisiones).',
  },
  {
    nombre: 'Profase II',
    division: 'Meiosis II',
    descripcion: 'Comienza la segunda división, sin duplicación previa del ADN.',
    cromosomas: 'n (preparándose)',
    detalle: 'Similar a una profase mitótica. Los cromosomas (ya recombinados por el crossing-over) se condensan de nuevo. Se forma un nuevo huso mitótico.',
  },
  {
    nombre: 'Metafase II',
    division: 'Meiosis II',
    descripcion: 'Los cromosomas se alinean en el centro de cada célula.',
    cromosomas: 'n (alineados)',
    detalle: 'Los cromosomas individuales (no pares) se alinean en la placa ecuatorial. Los microtúbulos se unen a los cinetocoros de cada cromátida.',
  },
  {
    nombre: 'Anafase II',
    division: 'Meiosis II',
    descripcion: 'Las cromátidas hermanas se separan (como en la mitosis).',
    cromosomas: 'n → separándose',
    detalle: 'Ahora sí se separan las cromátidas hermanas, como en la anafase mitótica. Cada polo recibe una cromátida de cada cromosoma.',
  },
  {
    nombre: 'Telofase II',
    division: 'Meiosis II',
    descripcion: 'Se forman 4 células haploides, genéticamente distintas (gametos).',
    cromosomas: '4 gametos con n',
    detalle: 'Se reforman las envolturas nucleares y se completa la citocinesis. El resultado final: 4 células haploides, cada una genéticamente única gracias al crossing-over y la segregación independiente.',
  },
];

// ─────────────────────────────────────────────
// Datos: Comparativa
// ─────────────────────────────────────────────

const COMPARATIVA: ComparativaItem[] = [
  { aspecto: 'Nº de divisiones', mitosis: '1', meiosis: '2' },
  { aspecto: 'Resultado', mitosis: '2 células idénticas', meiosis: '4 células diferentes' },
  { aspecto: 'Cromosomas', mitosis: '2n → 2n', meiosis: '2n → n' },
  { aspecto: 'Crossing-over', mitosis: 'No', meiosis: 'Sí (profase I)' },
  { aspecto: 'Función', mitosis: 'Crecimiento y reparación', meiosis: 'Reproducción sexual' },
  { aspecto: 'Dónde ocurre', mitosis: 'Todo el cuerpo (somáticas)', meiosis: 'Solo en gónadas' },
  { aspecto: 'Diversidad genética', mitosis: 'No genera', meiosis: 'Máxima' },
  { aspecto: 'Duración típica', mitosis: '1-2 horas', meiosis: '~2 semanas' },
];

// ─────────────────────────────────────────────
// Datos: Datos fascinantes
// ─────────────────────────────────────────────

const DATOS_FASCINANTES: DatoFascinante[] = [
  {
    icono: '🔬',
    titulo: '3,8 millones de mitosis por segundo',
    detalle: 'Tu cuerpo realiza aproximadamente 3,8 millones de divisiones celulares cada segundo para mantener los tejidos, regenerar células dañadas y crecer.',
  },
  {
    icono: '🧬',
    titulo: '1-5 puntos de crossing-over por cromosoma',
    detalle: 'Durante la meiosis, cada par de cromosomas homólogos experimenta entre 1 y 5 quiasmas (puntos de intercambio), generando combinaciones genéticas únicas.',
  },
  {
    icono: '🧮',
    titulo: '8.388.608 combinaciones por progenitor',
    detalle: 'Solo por la segregación independiente (sin contar el crossing-over), la meiosis humana puede generar 2²³ = 8.388.608 combinaciones diferentes de cromosomas por cada progenitor.',
  },
  {
    icono: '👶',
    titulo: 'Combinaciones prácticamente infinitas',
    detalle: 'Si sumamos el crossing-over a la segregación independiente, las posibles combinaciones genéticas de un hijo humano son astronómicamente grandes — cada persona es literalmente única.',
  },
  {
    icono: '🦎',
    titulo: 'Partenogénesis: reproducción sin meiosis completa',
    detalle: 'Algunos animales (como ciertos lagartos, tiburones y abejas) pueden reproducirse solo por mitosis o meiosis modificada, sin necesidad de fecundación.',
  },
  {
    icono: '⏱️',
    titulo: 'Mitosis: 1-2h vs Meiosis: ~2 semanas',
    detalle: 'Una mitosis típica dura entre 1 y 2 horas. La meiosis, con sus dos divisiones y el complejo proceso de recombinación, puede tardar unas 2 semanas (espermatogénesis) o incluso décadas (ovogénesis).',
  },
  {
    icono: '🎗️',
    titulo: 'El cáncer es mitosis descontrolada',
    detalle: 'Cuando los mecanismos que regulan la mitosis fallan (mutaciones en genes supresores de tumores o proto-oncogenes), las células se dividen sin control, formando tumores.',
  },
  {
    icono: '📜',
    titulo: 'Flemming descubrió la mitosis en 1882',
    detalle: 'Walther Flemming observó por primera vez los cromosomas dividiéndose en células de salamandra. En 1883, Edouard Van Beneden describió la meiosis. Watson y Crick descubrieron la estructura del ADN en 1953.',
  },
];

const SECCIONES = ['Mitosis', 'Meiosis', 'Comparativa', 'Datos Fascinantes'];

// ─────────────────────────────────────────────
// Componente de visualización de célula (Mitosis)
// ─────────────────────────────────────────────

function CelulaMitosis({ faseIndex }: { faseIndex: number }) {
  // Posiciones de cromosomas según la fase
  const getCromosomaStyle = (tipo: 'materno' | 'paterno', par: number): React.CSSProperties => {
    const esMaterno = tipo === 'materno';
    const baseX = esMaterno ? 35 : 55;
    const baseY = 30 + par * 25;

    switch (faseIndex) {
      case 0: // Interfase - cromosomas dispersos
        return {
          left: `${baseX + (esMaterno ? -5 : 5)}%`,
          top: `${baseY}%`,
          opacity: 0.5,
          width: '18px',
          height: '4px',
          borderRadius: '2px',
        };
      case 1: // Profase - condensados
        return {
          left: `${baseX + (esMaterno ? -3 : 3)}%`,
          top: `${baseY}%`,
          opacity: 1,
          width: '14px',
          height: '10px',
          borderRadius: '3px',
        };
      case 2: // Metafase - alineados en centro
        return {
          left: `${45 + (esMaterno ? -4 : 4)}%`,
          top: `${30 + par * 20}%`,
          opacity: 1,
          width: '14px',
          height: '10px',
          borderRadius: '3px',
        };
      case 3: // Anafase - separándose
        return {
          left: `${esMaterno ? 20 : 70}%`,
          top: `${30 + par * 20}%`,
          opacity: 1,
          width: '12px',
          height: '8px',
          borderRadius: '3px',
        };
      case 4: // Telofase - dos núcleos
        return {
          left: `${esMaterno ? 18 : 72}%`,
          top: `${35 + par * 15}%`,
          opacity: 0.8,
          width: '12px',
          height: '5px',
          borderRadius: '2px',
        };
      default:
        return { left: `${baseX}%`, top: `${baseY}%` };
    }
  };

  return (
    <div className={styles.celulaContainer} aria-hidden="true">
      {/* Membrana nuclear */}
      {faseIndex <= 1 && (
        <div
          className={styles.membranaNuclear}
          style={{ opacity: faseIndex === 1 ? 0.3 : 0.7 }}
        />
      )}
      {/* Surco de división en telofase */}
      {faseIndex >= 3 && (
        <div
          className={styles.surcoDiv}
          style={{ opacity: faseIndex === 4 ? 1 : 0.4 }}
        />
      )}
      {/* Cromosomas: 2 pares (materno + paterno) */}
      {[0, 1].map(par => (
        <div key={par}>
          <div
            className={`${styles.cromosoma} ${styles.cromosomaMaterno}`}
            style={getCromosomaStyle('materno', par)}
          />
          <div
            className={`${styles.cromosoma} ${styles.cromosomaPaterno}`}
            style={getCromosomaStyle('paterno', par)}
          />
        </div>
      ))}
      {/* Huso mitótico en metafase/anafase */}
      {(faseIndex === 2 || faseIndex === 3) && (
        <>
          <div className={`${styles.husoMitotico} ${styles.husoIzq}`} />
          <div className={`${styles.husoMitotico} ${styles.husoDer}`} />
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente de visualización de célula (Meiosis)
// ─────────────────────────────────────────────

function CelulaMeiosis({ faseIndex }: { faseIndex: number }) {
  const getCromosomaStyle = (tipo: 'materno' | 'paterno', par: number): React.CSSProperties => {
    const esMaterno = tipo === 'materno';

    // Meiosis I (fases 0-3)
    if (faseIndex <= 3) {
      switch (faseIndex) {
        case 0: // Profase I - emparejados + crossing-over
          return {
            left: `${42 + (esMaterno ? -3 : 3)}%`,
            top: `${35 + par * 25}%`,
            opacity: 1,
            width: '14px',
            height: '10px',
            borderRadius: '3px',
            // Crossing-over visual: un segmento del materno tiene color paterno
            background: esMaterno
              ? 'linear-gradient(to bottom, #2E86AB 60%, #E74C3C 100%)'
              : 'linear-gradient(to bottom, #E74C3C 60%, #2E86AB 100%)',
          };
        case 1: // Metafase I - bivalentes alineados
          return {
            left: `${44 + (esMaterno ? -4 : 4)}%`,
            top: `${35 + par * 25}%`,
            opacity: 1,
            width: '14px',
            height: '10px',
            borderRadius: '3px',
          };
        case 2: // Anafase I - homólogos se separan
          return {
            left: `${esMaterno ? 20 : 70}%`,
            top: `${35 + par * 20}%`,
            opacity: 1,
            width: '12px',
            height: '10px',
            borderRadius: '3px',
          };
        case 3: // Telofase I - 2 células con n
          return {
            left: `${esMaterno ? 18 : 72}%`,
            top: `${38 + par * 18}%`,
            opacity: 0.9,
            width: '12px',
            height: '8px',
            borderRadius: '3px',
          };
        default:
          return {};
      }
    }

    // Meiosis II (fases 4-7): 4 grupos
    const meiosisIIFase = faseIndex - 4;
    // Cada cromosoma va a un cuadrante
    const cuadranteX = esMaterno ? 22 : 72;
    const cuadranteY = par === 0 ? 25 : 60;

    switch (meiosisIIFase) {
      case 0: // Profase II
        return {
          left: `${cuadranteX}%`,
          top: `${cuadranteY}%`,
          opacity: 1,
          width: '10px',
          height: '8px',
          borderRadius: '3px',
        };
      case 1: // Metafase II
        return {
          left: `${cuadranteX}%`,
          top: `${cuadranteY + 5}%`,
          opacity: 1,
          width: '10px',
          height: '8px',
          borderRadius: '3px',
        };
      case 2: // Anafase II
        return {
          left: `${cuadranteX + (par === 0 ? -6 : 6)}%`,
          top: `${cuadranteY + 5}%`,
          opacity: 1,
          width: '8px',
          height: '6px',
          borderRadius: '2px',
        };
      case 3: // Telofase II - 4 células finales
        return {
          left: `${cuadranteX + (par === 0 ? -8 : 8)}%`,
          top: `${cuadranteY + 5}%`,
          opacity: 0.85,
          width: '8px',
          height: '5px',
          borderRadius: '2px',
        };
      default:
        return {};
    }
  };

  return (
    <div className={styles.celulaContainer} aria-hidden="true">
      {/* Membrana(s) */}
      {faseIndex <= 1 && (
        <div className={styles.membranaNuclear} style={{ opacity: faseIndex === 0 ? 0.7 : 0.3 }} />
      )}
      {faseIndex >= 3 && faseIndex <= 4 && (
        <div className={styles.surcoDiv} />
      )}
      {faseIndex >= 6 && (
        <>
          <div className={styles.surcoDiv} />
          <div className={styles.surcoDivHorizontal} />
        </>
      )}
      {/* Cromosomas */}
      {[0, 1].map(par => (
        <div key={par}>
          <div
            className={`${styles.cromosoma} ${styles.cromosomaMaterno}`}
            style={getCromosomaStyle('materno', par)}
          />
          <div
            className={`${styles.cromosoma} ${styles.cromosomaPaterno}`}
            style={getCromosomaStyle('paterno', par)}
          />
        </div>
      ))}
      {/* Crossing-over label */}
      {faseIndex === 0 && (
        <div className={styles.crossingOverLabel}>
          <span>crossing-over</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorMitosisMeiosisPage() {
  const [seccionActiva, setSeccionActiva] = useState(0);
  const [faseMitosis, setFaseMitosis] = useState(0);
  const [faseMeiosis, setFaseMeiosis] = useState(0);
  const [datoAbierto, setDatoAbierto] = useState<number | null>(null);

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <div className={styles.heroIcono} aria-hidden="true">🧬</div>
          <h1 className={styles.title}>Mitosis y Meiosis</h1>
          <p className={styles.subtitle}>
            La danza de los cromosomas — división celular paso a paso
          </p>
          <p className={styles.heroNota}>
            Navega entre fases y descubre cómo se dividen las células
          </p>
        </header>

        <LegalNotice />

        {/* Navegación entre secciones */}
        <nav className={styles.nav} aria-label="Secciones del visualizador">
          {SECCIONES.map((seccion, i) => (
            <button
              key={seccion}
              type="button"
              className={`${styles.navBtn} ${i === seccionActiva ? styles.navBtnActivo : ''}`}
              onClick={() => setSeccionActiva(i)}
              aria-pressed={i === seccionActiva}
            >
              {seccion}
            </button>
          ))}
        </nav>

        {/* ────── SECCIÓN: MITOSIS ────── */}
        {seccionActiva === 0 && (
          <section className={styles.seccion} aria-label="Mitosis paso a paso">
            <h2 className={styles.seccionTitulo}>
              <span aria-hidden="true">🔄</span> Mitosis — División Ecuacional
            </h2>
            <p className={styles.seccionSubtitulo}>
              Una célula madre produce 2 células hijas idénticas (2n → 2n)
            </p>

            <div className={styles.visorFases}>
              <div className={styles.visorVisual}>
                <CelulaMitosis faseIndex={faseMitosis} />
                <div className={styles.leyendaCromosomas}>
                  <span className={styles.leyendaItem}>
                    <span className={`${styles.leyendaDot} ${styles.cromosomaMaterno}`} /> Materno
                  </span>
                  <span className={styles.leyendaItem}>
                    <span className={`${styles.leyendaDot} ${styles.cromosomaPaterno}`} /> Paterno
                  </span>
                </div>
              </div>

              <div className={styles.visorInfo}>
                <div className={styles.faseTag}>
                  Fase {faseMitosis + 1} de {FASES_MITOSIS.length}
                </div>
                <h3 className={styles.faseNombre}>{FASES_MITOSIS[faseMitosis].nombre}</h3>
                <p className={styles.faseDesc}>{FASES_MITOSIS[faseMitosis].descripcion}</p>
                <div className={styles.faseCromosomas}>
                  <span aria-hidden="true">🧬</span> {FASES_MITOSIS[faseMitosis].cromosomas}
                </div>
                <p className={styles.faseDetalle}>{FASES_MITOSIS[faseMitosis].detalle}</p>
              </div>
            </div>

            <div className={styles.fasesNav}>
              <button
                type="button"
                className={styles.faseNavBtn}
                onClick={() => setFaseMitosis(prev => Math.max(0, prev - 1))}
                disabled={faseMitosis === 0}
                aria-label="Fase anterior"
              >
                ← Anterior
              </button>
              <div className={styles.faseDots}>
                {FASES_MITOSIS.map((f, i) => (
                  <button
                    key={f.nombre}
                    type="button"
                    className={`${styles.faseDot} ${i === faseMitosis ? styles.faseDotActivo : ''}`}
                    onClick={() => setFaseMitosis(i)}
                    aria-label={`Ir a ${f.nombre}`}
                  />
                ))}
              </div>
              <button
                type="button"
                className={styles.faseNavBtn}
                onClick={() => setFaseMitosis(prev => Math.min(FASES_MITOSIS.length - 1, prev + 1))}
                disabled={faseMitosis === FASES_MITOSIS.length - 1}
                aria-label="Siguiente fase"
              >
                Siguiente →
              </button>
            </div>

            <div className={styles.insight}>
              <p>
                <span aria-hidden="true">💡</span>{' '}
                <strong>¿Sabías que?</strong> Tu cuerpo realiza aproximadamente 3,8 millones de
                mitosis por segundo para renovar tejidos, curar heridas y mantener tus órganos
                funcionando.
              </p>
            </div>
          </section>
        )}

        {/* ────── SECCIÓN: MEIOSIS ────── */}
        {seccionActiva === 1 && (
          <section className={styles.seccion} aria-label="Meiosis paso a paso">
            <h2 className={styles.seccionTitulo}>
              <span aria-hidden="true">🧪</span> Meiosis — División Reduccional
            </h2>
            <p className={styles.seccionSubtitulo}>
              Una célula madre produce 4 gametos genéticamente distintos (2n → n)
            </p>

            <div className={styles.visorFases}>
              <div className={styles.visorVisual}>
                <CelulaMeiosis faseIndex={faseMeiosis} />
                <div className={styles.leyendaCromosomas}>
                  <span className={styles.leyendaItem}>
                    <span className={`${styles.leyendaDot} ${styles.cromosomaMaterno}`} /> Materno
                  </span>
                  <span className={styles.leyendaItem}>
                    <span className={`${styles.leyendaDot} ${styles.cromosomaPaterno}`} /> Paterno
                  </span>
                </div>
              </div>

              <div className={styles.visorInfo}>
                <div className={styles.faseTag}>
                  {FASES_MEIOSIS[faseMeiosis].division} — Fase {faseMeiosis + 1} de {FASES_MEIOSIS.length}
                </div>
                <h3 className={styles.faseNombre}>{FASES_MEIOSIS[faseMeiosis].nombre}</h3>
                <p className={styles.faseDesc}>{FASES_MEIOSIS[faseMeiosis].descripcion}</p>
                <div className={styles.faseCromosomas}>
                  <span aria-hidden="true">🧬</span> {FASES_MEIOSIS[faseMeiosis].cromosomas}
                </div>
                <p className={styles.faseDetalle}>{FASES_MEIOSIS[faseMeiosis].detalle}</p>
              </div>
            </div>

            <div className={styles.fasesNav}>
              <button
                type="button"
                className={styles.faseNavBtn}
                onClick={() => setFaseMeiosis(prev => Math.max(0, prev - 1))}
                disabled={faseMeiosis === 0}
                aria-label="Fase anterior"
              >
                ← Anterior
              </button>
              <div className={styles.faseDots}>
                {FASES_MEIOSIS.map((f, i) => (
                  <button
                    key={f.nombre}
                    type="button"
                    className={`${styles.faseDot} ${i === faseMeiosis ? styles.faseDotActivo : ''}`}
                    onClick={() => setFaseMeiosis(i)}
                    aria-label={`Ir a ${f.nombre}`}
                  />
                ))}
              </div>
              <button
                type="button"
                className={styles.faseNavBtn}
                onClick={() => setFaseMeiosis(prev => Math.min(FASES_MEIOSIS.length - 1, prev + 1))}
                disabled={faseMeiosis === FASES_MEIOSIS.length - 1}
                aria-label="Siguiente fase"
              >
                Siguiente →
              </button>
            </div>

            <div className={styles.insight}>
              <p>
                <span aria-hidden="true">💡</span>{' '}
                <strong>Clave:</strong> El crossing-over durante la profase I es la razón por la que
                no eres idéntico a tus hermanos. Cada gameto es genéticamente único.
              </p>
            </div>
          </section>
        )}

        {/* ────── SECCIÓN: COMPARATIVA ────── */}
        {seccionActiva === 2 && (
          <section className={styles.seccion} aria-label="Comparativa mitosis vs meiosis">
            <h2 className={styles.seccionTitulo}>
              <span aria-hidden="true">⚖️</span> Mitosis vs Meiosis
            </h2>
            <p className={styles.seccionSubtitulo}>
              Comparación lado a lado de los dos tipos de división celular
            </p>

            <div className={styles.comparativaTabla} role="table" aria-label="Tabla comparativa">
              <div className={`${styles.comparativaRow} ${styles.comparativaHeader}`} role="row">
                <div className={styles.comparativaAspecto} role="columnheader">Aspecto</div>
                <div className={styles.comparativaMitosis} role="columnheader">Mitosis</div>
                <div className={styles.comparativaMeiosis} role="columnheader">Meiosis</div>
              </div>
              {COMPARATIVA.map(item => (
                <div key={item.aspecto} className={styles.comparativaRow} role="row">
                  <div className={styles.comparativaAspecto} role="rowheader">{item.aspecto}</div>
                  <div className={styles.comparativaMitosis} role="cell">{item.mitosis}</div>
                  <div className={styles.comparativaMeiosis} role="cell">{item.meiosis}</div>
                </div>
              ))}
            </div>

            {/* Diagrama de flujo visual */}
            <div className={styles.flujoContainer}>
              <h3 className={styles.flujoTitulo}>Diagrama de flujo</h3>
              <div className={styles.flujoGrid}>
                <div className={styles.flujoColumna}>
                  <div className={styles.flujoLabel}>Mitosis</div>
                  <div className={styles.flujoCelula}>1 célula (2n)</div>
                  <div className={styles.flujoFlecha} aria-hidden="true">↓</div>
                  <div className={styles.flujoResultado}>
                    <div className={styles.flujoCelulaSmall}>2n</div>
                    <div className={styles.flujoCelulaSmall}>2n</div>
                  </div>
                  <div className={styles.flujoNota}>2 células idénticas</div>
                </div>
                <div className={styles.flujoColumna}>
                  <div className={styles.flujoLabel}>Meiosis</div>
                  <div className={styles.flujoCelula}>1 célula (2n)</div>
                  <div className={styles.flujoFlecha} aria-hidden="true">↓</div>
                  <div className={styles.flujoResultado}>
                    <div className={styles.flujoCelulaSmall}>n</div>
                    <div className={styles.flujoCelulaSmall}>n</div>
                    <div className={styles.flujoCelulaSmall}>n</div>
                    <div className={styles.flujoCelulaSmall}>n</div>
                  </div>
                  <div className={styles.flujoNota}>4 gametos distintos</div>
                </div>
              </div>
            </div>

            <div className={styles.insight}>
              <p>
                <span aria-hidden="true">💡</span>{' '}
                <strong>En resumen:</strong> la mitosis es para crecer y reparar (copias exactas),
                la meiosis es para reproducirse (diversidad genética). Ambas son imprescindibles.
              </p>
            </div>
          </section>
        )}

        {/* ────── SECCIÓN: DATOS FASCINANTES ────── */}
        {seccionActiva === 3 && (
          <section className={styles.seccion} aria-label="Datos fascinantes sobre división celular">
            <h2 className={styles.seccionTitulo}>
              <span aria-hidden="true">🌟</span> Datos Fascinantes
            </h2>
            <p className={styles.seccionSubtitulo}>
              Curiosidades sobre mitosis, meiosis y la vida celular
            </p>

            <div className={styles.datosGrid}>
              {DATOS_FASCINANTES.map((dato, i) => (
                <article key={dato.titulo} className={styles.datoCard}>
                  <button
                    type="button"
                    className={`${styles.datoHeader} ${datoAbierto === i ? styles.datoHeaderActivo : ''}`}
                    onClick={() => setDatoAbierto(prev => (prev === i ? null : i))}
                    aria-expanded={datoAbierto === i}
                    aria-controls={`dato-${i}`}
                  >
                    <span className={styles.datoIcono} aria-hidden="true">{dato.icono}</span>
                    <span className={styles.datoTitulo}>{dato.titulo}</span>
                    <span
                      className={`${styles.datoChevron} ${datoAbierto === i ? styles.datoChevronAbierto : ''}`}
                      aria-hidden="true"
                    >
                      ▼
                    </span>
                  </button>
                  {datoAbierto === i && (
                    <div id={`dato-${i}`} className={styles.datoDetalle}>
                      <p>{dato.detalle}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* Timeline breve */}
            <div className={styles.timeline}>
              <h3 className={styles.timelineTitulo}>Hitos en la historia de la división celular</h3>
              {[
                { anio: '1882', evento: 'Walther Flemming describe la mitosis observando células de salamandra' },
                { anio: '1883', evento: 'Edouard Van Beneden observa la reducción cromosómica (meiosis) en Ascaris' },
                { anio: '1902', evento: 'Sutton y Boveri proponen la teoría cromosómica de la herencia' },
                { anio: '1953', evento: 'Watson y Crick descubren la estructura de doble hélice del ADN' },
                { anio: '2003', evento: 'Se completa el Proyecto Genoma Humano: 20.000-25.000 genes' },
              ].map(hito => (
                <div key={hito.anio} className={styles.timelineItem}>
                  <span className={styles.timelineAnio}>{hito.anio}</span>
                  <span className={styles.timelineEvento}>{hito.evento}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <EducationalSection
          title="Conceptos clave de la división celular"
          subtitle="Lo esencial para entender mitosis y meiosis"
          defaultOpen={false}
        >
          <h3>¿Por qué las células se dividen?</h3>
          <p>
            Las células tienen un tamaño óptimo determinado por la relación superficie/volumen.
            Cuando crecen demasiado, no pueden intercambiar nutrientes y desechos eficientemente.
            La división celular resuelve este problema creando células más pequeñas. Además, es
            el mecanismo de crecimiento, regeneración y reproducción de todos los organismos.
          </p>

          <h3>Cromosomas y ploidía</h3>
          <p>
            Los humanos tenemos 46 cromosomas (23 pares): 22 pares de autosomas + 1 par de
            cromosomas sexuales (XX o XY). &quot;2n&quot; (diploide) significa el juego completo (46),
            mientras que &quot;n&quot; (haploide) es la mitad (23). Los gametos son haploides para que,
            al fusionarse en la fecundación, el zigoto sea diploide.
          </p>

          <h3>El ciclo celular completo</h3>
          <p>
            El ciclo celular tiene 4 fases: G1 (crecimiento), S (síntesis de ADN), G2 (preparación)
            y M (mitosis). Las fases G1, S y G2 juntas forman la interfase, que ocupa el 90% del
            tiempo del ciclo. La mitosis (fase M) es relativamente corta. Existen puntos de control
            (checkpoints) que aseguran que cada paso se complete correctamente antes del siguiente.
          </p>

          <h3>Crossing-over y variabilidad</h3>
          <p>
            El crossing-over (o recombinación homóloga) ocurre en la profase I de la meiosis.
            Las cromátidas no hermanas de cromosomas homólogos intercambian segmentos en los
            puntos llamados quiasmas. Esto genera cromosomas recombinantes con combinaciones
            genéticas nuevas, aumentando enormemente la diversidad genética de la descendencia.
          </p>

          <h3>Errores en la división celular</h3>
          <p>
            La no disyunción (fallo en la separación de cromosomas) durante la meiosis produce
            gametos con cromosomas de más o de menos. Esto causa aneuploidías como el síndrome
            de Down (trisomía 21), el síndrome de Turner (monosomía X) o el síndrome de Klinefelter
            (XXY). Los errores en mitosis pueden contribuir al desarrollo de cáncer.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota pedagógica:</strong> este visualizador representa una versión simplificada
            de la división celular con fines didácticos. Los procesos reales implican cientos de
            proteínas reguladoras, señales moleculares y mecanismos de control. Las representaciones
            están diseñadas para Bachillerato y Selectividad.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-mitosis-meiosis')} />
        <ShareCard appName="visualizador-mitosis-meiosis" />
        <Footer appName="visualizador-mitosis-meiosis" />
    </div>
  );
}
