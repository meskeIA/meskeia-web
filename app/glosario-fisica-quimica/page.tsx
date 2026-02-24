'use client';

import { useState, useMemo } from 'react';
import styles from './GlosarioFisicaQuimica.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type Categoria = 'fisica' | 'quimica' | 'todos';
type Nivel = 'basico' | 'intermedio' | 'avanzado' | 'todos';

interface Termino {
  id: number;
  termino: string;
  definicion: string;
  categoria: 'fisica' | 'quimica';
  nivel: 'basico' | 'intermedio' | 'avanzado';
  ejemplo?: string;
  formula?: string;
}

// Base de datos de términos
const GLOSARIO: Termino[] = [
  // FÍSICA - BÁSICO
  { id: 1, termino: 'Fuerza', definicion: 'Interacción que causa aceleración en un objeto o deformación. Se mide en Newtons (N).', categoria: 'fisica', nivel: 'basico', formula: 'F = m × a', ejemplo: 'Empujar un carro de supermercado.' },
  { id: 2, termino: 'Velocidad', definicion: 'Magnitud vectorial que indica el cambio de posición por unidad de tiempo.', categoria: 'fisica', nivel: 'basico', formula: 'v = d / t', ejemplo: 'Un coche viaja a 100 km/h.' },
  { id: 3, termino: 'Aceleración', definicion: 'Cambio de velocidad por unidad de tiempo. Se mide en m/s².', categoria: 'fisica', nivel: 'basico', formula: 'a = Δv / Δt', ejemplo: 'Un coche acelera de 0 a 100 km/h en 10s.' },
  { id: 4, termino: 'Masa', definicion: 'Cantidad de materia que contiene un cuerpo. Se mide en kilogramos (kg).', categoria: 'fisica', nivel: 'basico', ejemplo: 'Una persona tiene una masa de 70 kg.' },
  { id: 5, termino: 'Peso', definicion: 'Fuerza con que la gravedad atrae a un cuerpo. Depende de la masa y la gravedad local.', categoria: 'fisica', nivel: 'basico', formula: 'P = m × g', ejemplo: 'En la Luna pesamos menos que en la Tierra.' },
  { id: 6, termino: 'Energía', definicion: 'Capacidad para realizar trabajo. Se mide en Julios (J).', categoria: 'fisica', nivel: 'basico', ejemplo: 'Una bombilla consume energía eléctrica.' },
  { id: 7, termino: 'Potencia', definicion: 'Trabajo realizado por unidad de tiempo. Se mide en Vatios (W).', categoria: 'fisica', nivel: 'basico', formula: 'P = W / t', ejemplo: 'Una bombilla de 60W consume 60 julios por segundo.' },
  { id: 8, termino: 'Temperatura', definicion: 'Medida del grado de agitación térmica de las partículas.', categoria: 'fisica', nivel: 'basico', ejemplo: 'El agua hierve a 100°C.' },
  { id: 9, termino: 'Presión', definicion: 'Fuerza ejercida por unidad de superficie. Se mide en Pascales (Pa).', categoria: 'fisica', nivel: 'basico', formula: 'P = F / A', ejemplo: 'La presión atmosférica al nivel del mar es 101325 Pa.' },
  { id: 10, termino: 'Densidad', definicion: 'Masa por unidad de volumen de un material.', categoria: 'fisica', nivel: 'basico', formula: 'ρ = m / V', ejemplo: 'El agua tiene densidad de 1 g/cm³.' },

  // FÍSICA - INTERMEDIO
  { id: 11, termino: 'Momento lineal', definicion: 'Producto de la masa por la velocidad de un cuerpo. Se conserva en sistemas aislados.', categoria: 'fisica', nivel: 'intermedio', formula: 'p = m × v' },
  { id: 12, termino: 'Trabajo', definicion: 'Transferencia de energía cuando una fuerza mueve un objeto una distancia.', categoria: 'fisica', nivel: 'intermedio', formula: 'W = F × d × cos(θ)' },
  { id: 13, termino: 'Energía cinética', definicion: 'Energía que posee un cuerpo debido a su movimiento.', categoria: 'fisica', nivel: 'intermedio', formula: 'Ec = ½mv²' },
  { id: 14, termino: 'Energía potencial', definicion: 'Energía almacenada debido a la posición o configuración de un sistema.', categoria: 'fisica', nivel: 'intermedio', formula: 'Ep = mgh (gravitatoria)' },
  { id: 15, termino: 'Ley de Ohm', definicion: 'La corriente es proporcional al voltaje e inversamente proporcional a la resistencia.', categoria: 'fisica', nivel: 'intermedio', formula: 'V = I × R' },
  { id: 16, termino: 'Campo eléctrico', definicion: 'Región del espacio donde una carga eléctrica experimenta una fuerza.', categoria: 'fisica', nivel: 'intermedio', formula: 'E = F / q' },
  { id: 17, termino: 'Onda', definicion: 'Perturbación que transporta energía sin transportar materia.', categoria: 'fisica', nivel: 'intermedio', ejemplo: 'Ondas sonoras, ondas electromagnéticas.' },
  { id: 18, termino: 'Frecuencia', definicion: 'Número de ciclos u oscilaciones por unidad de tiempo. Se mide en Hertz (Hz).', categoria: 'fisica', nivel: 'intermedio', formula: 'f = 1 / T' },
  { id: 19, termino: 'Longitud de onda', definicion: 'Distancia entre dos puntos consecutivos en fase de una onda.', categoria: 'fisica', nivel: 'intermedio', formula: 'λ = v / f' },
  { id: 20, termino: 'Torque', definicion: 'Momento de fuerza que produce rotación. Se mide en N·m.', categoria: 'fisica', nivel: 'intermedio', formula: 'τ = r × F × sin(θ)' },

  // FÍSICA - AVANZADO
  { id: 21, termino: 'Entropía', definicion: 'Medida del desorden o aleatoriedad de un sistema termodinámico.', categoria: 'fisica', nivel: 'avanzado', formula: 'ΔS = Q / T' },
  { id: 22, termino: 'Efecto fotoeléctrico', definicion: 'Emisión de electrones por un material al absorber radiación electromagnética.', categoria: 'fisica', nivel: 'avanzado', formula: 'E = hf' },
  { id: 23, termino: 'Dualidad onda-partícula', definicion: 'La materia y la luz exhiben propiedades tanto de ondas como de partículas.', categoria: 'fisica', nivel: 'avanzado' },
  { id: 24, termino: 'Relatividad especial', definicion: 'Teoría que describe el comportamiento del espacio y tiempo a velocidades cercanas a la luz.', categoria: 'fisica', nivel: 'avanzado', formula: 'E = mc²' },
  { id: 25, termino: 'Principio de incertidumbre', definicion: 'Es imposible conocer simultáneamente con precisión la posición y el momento de una partícula.', categoria: 'fisica', nivel: 'avanzado', formula: 'Δx × Δp ≥ ℏ/2' },

  // QUÍMICA - BÁSICO
  { id: 26, termino: 'Átomo', definicion: 'Unidad básica de la materia, compuesta por protones, neutrones y electrones.', categoria: 'quimica', nivel: 'basico', ejemplo: 'El hidrógeno es el átomo más simple.' },
  { id: 27, termino: 'Molécula', definicion: 'Grupo de átomos unidos químicamente que forman la unidad más pequeña de un compuesto.', categoria: 'quimica', nivel: 'basico', ejemplo: 'H₂O es una molécula de agua.' },
  { id: 28, termino: 'Elemento', definicion: 'Sustancia pura formada por átomos del mismo número atómico.', categoria: 'quimica', nivel: 'basico', ejemplo: 'El oro (Au) es un elemento.' },
  { id: 29, termino: 'Compuesto', definicion: 'Sustancia formada por dos o más elementos combinados químicamente.', categoria: 'quimica', nivel: 'basico', ejemplo: 'NaCl (sal de mesa) es un compuesto.' },
  { id: 30, termino: 'Enlace químico', definicion: 'Fuerza que mantiene unidos a los átomos en una molécula o compuesto.', categoria: 'quimica', nivel: 'basico', ejemplo: 'Enlace covalente en H₂.' },
  { id: 31, termino: 'Reacción química', definicion: 'Proceso donde los reactivos se transforman en productos diferentes.', categoria: 'quimica', nivel: 'basico', ejemplo: '2H₂ + O₂ → 2H₂O' },
  { id: 32, termino: 'pH', definicion: 'Escala que mide la acidez o basicidad de una solución (0-14).', categoria: 'quimica', nivel: 'basico', ejemplo: 'pH 7 es neutro, <7 ácido, >7 básico.' },
  { id: 33, termino: 'Ácido', definicion: 'Sustancia que libera iones H⁺ en solución acuosa.', categoria: 'quimica', nivel: 'basico', ejemplo: 'HCl (ácido clorhídrico).' },
  { id: 34, termino: 'Base', definicion: 'Sustancia que acepta protones o libera iones OH⁻.', categoria: 'quimica', nivel: 'basico', ejemplo: 'NaOH (hidróxido de sodio).' },
  { id: 35, termino: 'Solución', definicion: 'Mezcla homogénea de dos o más sustancias.', categoria: 'quimica', nivel: 'basico', ejemplo: 'Agua salada es una solución.' },

  // QUÍMICA - INTERMEDIO
  { id: 36, termino: 'Mol', definicion: 'Cantidad de sustancia que contiene 6,022×10²³ partículas (número de Avogadro).', categoria: 'quimica', nivel: 'intermedio', formula: 'n = m / M' },
  { id: 37, termino: 'Valencia', definicion: 'Capacidad de combinación de un átomo determinada por sus electrones.', categoria: 'quimica', nivel: 'intermedio' },
  { id: 38, termino: 'Electronegatividad', definicion: 'Tendencia de un átomo a atraer electrones en un enlace químico.', categoria: 'quimica', nivel: 'intermedio', ejemplo: 'El flúor es el más electronegativo.' },
  { id: 39, termino: 'Oxidación', definicion: 'Pérdida de electrones por parte de un átomo o ion.', categoria: 'quimica', nivel: 'intermedio', ejemplo: 'Fe → Fe²⁺ + 2e⁻' },
  { id: 40, termino: 'Reducción', definicion: 'Ganancia de electrones por parte de un átomo o ion.', categoria: 'quimica', nivel: 'intermedio', ejemplo: 'Cu²⁺ + 2e⁻ → Cu' },
  { id: 41, termino: 'Enlace iónico', definicion: 'Enlace formado por transferencia de electrones entre átomos.', categoria: 'quimica', nivel: 'intermedio', ejemplo: 'NaCl tiene enlace iónico.' },
  { id: 42, termino: 'Enlace covalente', definicion: 'Enlace formado por compartición de electrones entre átomos.', categoria: 'quimica', nivel: 'intermedio', ejemplo: 'H₂ tiene enlace covalente.' },
  { id: 43, termino: 'Catalizador', definicion: 'Sustancia que acelera una reacción sin consumirse.', categoria: 'quimica', nivel: 'intermedio', ejemplo: 'Enzimas son catalizadores biológicos.' },
  { id: 44, termino: 'Equilibrio químico', definicion: 'Estado donde las velocidades de reacción directa e inversa son iguales.', categoria: 'quimica', nivel: 'intermedio', formula: 'K = [productos] / [reactivos]' },
  { id: 45, termino: 'Estequiometría', definicion: 'Cálculo de las cantidades de reactivos y productos en reacciones químicas.', categoria: 'quimica', nivel: 'intermedio' },

  // QUÍMICA - AVANZADO
  { id: 46, termino: 'Hibridación', definicion: 'Mezcla de orbitales atómicos para formar orbitales híbridos equivalentes.', categoria: 'quimica', nivel: 'avanzado', ejemplo: 'sp³ en el metano.' },
  { id: 47, termino: 'Orbital', definicion: 'Región del espacio donde hay alta probabilidad de encontrar un electrón.', categoria: 'quimica', nivel: 'avanzado', ejemplo: 's, p, d, f son tipos de orbitales.' },
  { id: 48, termino: 'Entalpía', definicion: 'Contenido energético total de un sistema a presión constante.', categoria: 'quimica', nivel: 'avanzado', formula: 'ΔH = Q (a P constante)' },
  { id: 49, termino: 'Energía de activación', definicion: 'Energía mínima necesaria para que ocurra una reacción química.', categoria: 'quimica', nivel: 'avanzado', formula: 'k = Ae^(-Ea/RT)' },
  { id: 50, termino: 'Isómero', definicion: 'Compuestos con misma fórmula molecular pero diferente estructura.', categoria: 'quimica', nivel: 'avanzado', ejemplo: 'Butano e isobutano son isómeros.' },
];

export default function GlosarioFisicaQuimicaPage() {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria>('todos');
  const [nivelFiltro, setNivelFiltro] = useState<Nivel>('todos');
  const [terminoExpandido, setTerminoExpandido] = useState<number | null>(null);

  // Filtrar términos
  const terminosFiltrados = useMemo(() => {
    return GLOSARIO.filter(t => {
      const matchBusqueda = busqueda === '' ||
        t.termino.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.definicion.toLowerCase().includes(busqueda.toLowerCase());

      const matchCategoria = categoriaFiltro === 'todos' || t.categoria === categoriaFiltro;
      const matchNivel = nivelFiltro === 'todos' || t.nivel === nivelFiltro;

      return matchBusqueda && matchCategoria && matchNivel;
    });
  }, [busqueda, categoriaFiltro, nivelFiltro]);

  // Estadísticas
  const stats = useMemo(() => ({
    total: GLOSARIO.length,
    fisica: GLOSARIO.filter(t => t.categoria === 'fisica').length,
    quimica: GLOSARIO.filter(t => t.categoria === 'quimica').length,
    filtrados: terminosFiltrados.length
  }), [terminosFiltrados]);

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'basico': return styles.nivelBasico;
      case 'intermedio': return styles.nivelIntermedio;
      case 'avanzado': return styles.nivelAvanzado;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📖 Glosario de Física y Química</h1>
        <p className={styles.subtitle}>
          Más de {stats.total} términos y definiciones para estudiantes
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel de filtros */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>Filtros</h2>

          {/* Búsqueda */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Buscar término</label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={styles.input}
              placeholder="Escribe para buscar..."
            />
          </div>

          {/* Filtro categoría */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Categoría</label>
            <div className={styles.selectorGrid}>
              <button
                className={`${styles.selectorBtn} ${categoriaFiltro === 'todos' ? styles.selectorActivo : ''}`}
                onClick={() => setCategoriaFiltro('todos')}
              >
                Todos
              </button>
              <button
                className={`${styles.selectorBtn} ${categoriaFiltro === 'fisica' ? styles.selectorActivo : ''}`}
                onClick={() => setCategoriaFiltro('fisica')}
              >
                🔬 Física
              </button>
              <button
                className={`${styles.selectorBtn} ${categoriaFiltro === 'quimica' ? styles.selectorActivo : ''}`}
                onClick={() => setCategoriaFiltro('quimica')}
              >
                ⚗️ Química
              </button>
            </div>
          </div>

          {/* Filtro nivel */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Nivel</label>
            <div className={styles.selectorGrid}>
              <button
                className={`${styles.selectorBtn} ${nivelFiltro === 'todos' ? styles.selectorActivo : ''}`}
                onClick={() => setNivelFiltro('todos')}
              >
                Todos
              </button>
              <button
                className={`${styles.selectorBtn} ${nivelFiltro === 'basico' ? styles.selectorActivo : ''}`}
                onClick={() => setNivelFiltro('basico')}
              >
                Básico
              </button>
              <button
                className={`${styles.selectorBtn} ${nivelFiltro === 'intermedio' ? styles.selectorActivo : ''}`}
                onClick={() => setNivelFiltro('intermedio')}
              >
                Intermedio
              </button>
              <button
                className={`${styles.selectorBtn} ${nivelFiltro === 'avanzado' ? styles.selectorActivo : ''}`}
                onClick={() => setNivelFiltro('avanzado')}
              >
                Avanzado
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className={styles.statsBox}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total</span>
              <span className={styles.statValue}>{stats.total}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Física</span>
              <span className={styles.statValue}>{stats.fisica}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Química</span>
              <span className={styles.statValue}>{stats.quimica}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Mostrando</span>
              <span className={styles.statValue}>{stats.filtrados}</span>
            </div>
          </div>
        </div>

        {/* Lista de términos */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}>
            Términos ({terminosFiltrados.length})
          </h2>

          {terminosFiltrados.length > 0 ? (
            <div className={styles.terminosList}>
              {terminosFiltrados.map((t) => (
                <div
                  key={t.id}
                  className={`${styles.terminoCard} ${terminoExpandido === t.id ? styles.expandido : ''}`}
                  onClick={() => setTerminoExpandido(terminoExpandido === t.id ? null : t.id)}
                >
                  <div className={styles.terminoHeader}>
                    <div className={styles.terminoInfo}>
                      <span className={styles.terminoCategoriaIcon}>
                        {t.categoria === 'fisica' ? '🔬' : '⚗️'}
                      </span>
                      <h3 className={styles.terminoNombre}>{t.termino}</h3>
                      <span className={`${styles.nivelBadge} ${getNivelColor(t.nivel)}`}>
                        {t.nivel}
                      </span>
                    </div>
                    <span className={styles.expandIcon}>
                      {terminoExpandido === t.id ? '▲' : '▼'}
                    </span>
                  </div>

                  <p className={styles.terminoDefinicion}>{t.definicion}</p>

                  {terminoExpandido === t.id && (
                    <div className={styles.terminoDetalles}>
                      {t.formula && (
                        <div className={styles.formulaBox}>
                          <strong>Fórmula:</strong>
                          <span className={styles.formula}>{t.formula}</span>
                        </div>
                      )}
                      {t.ejemplo && (
                        <div className={styles.ejemploBox}>
                          <strong>Ejemplo:</strong>
                          <span>{t.ejemplo}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🔍</span>
              <p>No se encontraron términos con los filtros seleccionados</p>
            </div>
          )}
        </div>
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="📚 ¿Cómo usar este glosario?"
        subtitle="Consejos para aprovechar al máximo este recurso de estudio"
      >
        <section className={styles.guideSection}>
          <h2>Guía de Uso del Glosario</h2>
          <p className={styles.introParagraph}>
            Este glosario está diseñado para ayudarte a estudiar física y química de manera eficiente.
            Los términos están organizados por categoría y nivel de dificultad para facilitar tu aprendizaje progresivo.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Niveles de Dificultad</h4>
              <p>
                <strong>Básico:</strong> Conceptos fundamentales, ESO.<br/>
                <strong>Intermedio:</strong> Bachillerato y preparación universitaria.<br/>
                <strong>Avanzado:</strong> Universidad y estudios superiores.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Consejos de Estudio</h4>
              <p>
                Comienza por los términos básicos antes de avanzar.
                Lee los ejemplos para entender la aplicación práctica.
                Memoriza las fórmulas asociadas a cada concepto.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Física</h4>
              <p>
                Cubre mecánica, termodinámica, electromagnetismo,
                ondas y física moderna. Incluye fórmulas clave
                y ejemplos cotidianos.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Química</h4>
              <p>
                Desde estructura atómica hasta química orgánica.
                Incluye nomenclatura, reacciones y equilibrio
                químico.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('glosario-fisica-quimica')} />

      <ShareCard appName="glosario-fisica-quimica" />
      <Footer appName="glosario-fisica-quimica" />
    </div>
  );
}
