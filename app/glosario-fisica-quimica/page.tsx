'use client';
// @disclaimer: exempt

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
        title="📚 Guía completa de Física y Química"
        subtitle="Todo lo que necesitas saber para estudiar ciencias exactas en ESO, Bachillerato y universidad"
      >
        {/* Contenido original mantenido */}
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

        {/* SECCIÓN 1: Tabla Comparativa */}
        <section className={styles.guideSection}>
          <h2>Comparativa de Ramas: Física vs Química vs Fisicoquímica</h2>
          <p className={styles.introParagraph}>
            Cada rama tiene su propio enfoque, nivel de abstracción matemática y salidas profesionales.
            Conocerlas te ayuda a elegir qué estudiar en profundidad.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Rama</th>
                  <th>Dificultad matemática</th>
                  <th>Herramientas clave</th>
                  <th>Aplicaciones reales</th>
                  <th>Salidas profesionales</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Mecánica clásica</strong></td>
                  <td>Media — derivadas e integrales básicas</td>
                  <td>Cálculo diferencial, vectores</td>
                  <td>Diseño de puentes, coches, maquinaria</td>
                  <td>Ingeniería civil, mecánica, aeronáutica</td>
                </tr>
                <tr>
                  <td><strong>Termodinámica</strong></td>
                  <td>Media-alta — ciclos, entropía</td>
                  <td>Cálculo, estadística</td>
                  <td>Motores de combustión, frigoríficos, centrales eléctricas</td>
                  <td>Ingeniería industrial, energética</td>
                </tr>
                <tr>
                  <td><strong>Electromagnetismo</strong></td>
                  <td>Alta — ecuaciones de Maxwell</td>
                  <td>Cálculo vectorial, álgebra lineal</td>
                  <td>Circuitos, antenas, resonancia magnética (MRI)</td>
                  <td>Ingeniería eléctrica, telecomunicaciones</td>
                </tr>
                <tr>
                  <td><strong>Óptica</strong></td>
                  <td>Media — trigonometría y ondas</td>
                  <td>Álgebra, trigonometría</td>
                  <td>Gafas, microscopios, fibra óptica, láseres</td>
                  <td>Óptica clínica, fotónica, medicina</td>
                </tr>
                <tr>
                  <td><strong>Química orgánica</strong></td>
                  <td>Baja-media — más memorización estructural</td>
                  <td>Nomenclatura IUPAC, estereoquímica</td>
                  <td>Fármacos, plásticos, combustibles, cosméticos</td>
                  <td>Farmacia, química industrial, biotecnología</td>
                </tr>
                <tr>
                  <td><strong>Química inorgánica</strong></td>
                  <td>Media — tabla periódica, estequiometría</td>
                  <td>Tabla periódica, cálculos molares</td>
                  <td>Metalurgia, fertilizantes, semiconductores</td>
                  <td>Materiales, minería, electrónica</td>
                </tr>
                <tr>
                  <td><strong>Fisicoquímica</strong></td>
                  <td>Alta — termodinámica + cinética + cuántica</td>
                  <td>Cálculo, estadística, mecánica cuántica</td>
                  <td>Pilas de combustible, catálisis, espectroscopía</td>
                  <td>Investigación, química computacional, nanotecnología</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECCIÓN 2: Casos de Uso / Perfiles */}
        <section className={styles.guideSection}>
          <h2>¿Para quién es este glosario?</h2>
          <p className={styles.introParagraph}>
            Según tu nivel y objetivo, el glosario se usa de manera diferente. Identifica tu perfil y sácale el máximo partido.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎒</span>
                <h4>Estudiante ESO / Bachillerato</h4>
              </div>
              <p className={styles.escenarioExample}>
                Tienes el examen de Física y Química en dos semanas. Necesitas afianzar conceptos como fuerza, presión, pH y enlace químico.
              </p>
              <p className={styles.escenarioTip}>
                Filtra por <strong>nivel Básico</strong> y repasa los 20 términos fundamentales. Presta especial atención a las fórmulas y ejemplos cotidianos.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏛️</span>
                <h4>Estudiante universitario de ingeniería</h4>
              </div>
              <p className={styles.escenarioExample}>
                Estás en primero de ingeniería y te enfrentas a electromagnetismo, termodinámica y mecánica cuántica simultáneamente.
              </p>
              <p className={styles.escenarioTip}>
                Usa el filtro <strong>nivel Avanzado</strong> para conceptos como entropía, dualidad onda-partícula o principio de incertidumbre. Las fórmulas expandidas son clave.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📝</span>
                <h4>Opositor / Docente</h4>
              </div>
              <p className={styles.escenarioExample}>
                Preparas oposiciones al cuerpo de docentes de secundaria o necesitas refrescar conceptos para explicarlos en clase.
              </p>
              <p className={styles.escenarioTip}>
                Consulta los tres niveles en orden. El glosario sirve para estructurar la progresión didáctica de tus unidades: de básico a avanzado, con ejemplos reales incluidos.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🔬</span>
                <h4>Profesional de investigación</h4>
              </div>
              <p className={styles.escenarioExample}>
                Trabajas en un laboratorio o centro de I+D y necesitas un diccionario rápido para comunicarte con colegas de otras especialidades.
              </p>
              <p className={styles.escenarioTip}>
                La búsqueda por texto libre te permite localizar términos como &quot;hibridación&quot;, &quot;energía de activación&quot; o &quot;entalpía&quot; en segundos, con su definición precisa y fórmula.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre Física y Química</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Cuál es la diferencia entre física y química?</dt>
              <dd>
                La física estudia las propiedades de la materia y la energía sin que haya cambio en la composición de las sustancias (movimiento, fuerzas, luz). La química estudia cómo se transforma la materia: qué ocurre cuando los átomos se recombinan y forman nuevas sustancias. Por ejemplo, calentar agua es física; electrolizarla para obtener hidrógeno y oxígeno es química.
                <span className={styles.faqTip}>Regla mnemotécnica: si hay nueva sustancia al final del proceso, es química.</span>
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué diferencia la física clásica de la física moderna?</dt>
              <dd>
                La física clásica (Newton, Maxwell) describe el mundo cotidiano: objetos macroscópicos, velocidades mucho menores que la luz (v &lt;&lt; c = 3×10⁸ m/s). La física moderna (relatividad especial, mecánica cuántica) es necesaria cuando los objetos son muy pequeños (átomos, electrones) o van a velocidades relativistas. Para el 99,99% de la ingeniería diaria, la física clásica es suficiente.
                <span className={styles.faqTip}>La relatividad se vuelve relevante por encima del 10% de la velocidad de la luz.</span>
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Diferencia entre química orgánica e inorgánica?</dt>
              <dd>
                La química orgánica estudia compuestos basados en carbono (con cadenas C-C o C-H), como los hidrocarburos, los aminoácidos o los plásticos. La química inorgánica estudia el resto: sales, óxidos, metales, ácidos minerales, semiconductores. Hoy en día existe mucho solapamiento: la organometálica combina ambas.
                <span className={styles.faqTip}>Si el compuesto tiene carbono enlazado a hidrógeno, casi siempre es orgánico.</span>
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Cuánto se necesita saber de matemáticas para física?</dt>
              <dd>
                Para ESO basta con proporciones y ecuaciones de primer grado. Para Bachillerato se necesita trigonometría, sistemas de ecuaciones y notación científica. Para la carrera, cálculo diferencial e integral, álgebra lineal y ecuaciones diferenciales son imprescindibles. La asignatura &quot;Matemáticas para físicos&quot; suele ocupar los dos primeros años de carrera.
                <span className={styles.faqTip}>Dominar derivadas e integrales básicas resuelve el 80% de los problemas de primer año universitario.</span>
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Cómo se usan las derivadas e integrales en física?</dt>
              <dd>
                La derivada de la posición respecto al tiempo es la velocidad: v = dx/dt. La derivada de la velocidad es la aceleración: a = dv/dt. La integral de la aceleración recupera la velocidad: v = ∫a dt. En circuitos eléctricos, la intensidad es la derivada de la carga: i = dq/dt. Entender este lenguaje es fundamental para pasar de fórmulas estáticas a problemas dinámicos reales.
                <span className={styles.faqTip}>Piensa en la derivada como &quot;tasa de cambio&quot; y en la integral como &quot;área acumulada&quot;.</span>
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué son las unidades del Sistema Internacional (SI)?</dt>
              <dd>
                El SI tiene 7 unidades base: metro (m), kilogramo (kg), segundo (s), amperio (A), kelvin (K), mol (mol) y candela (cd). Todas las demás unidades se derivan de estas. Por ejemplo, el Newton es kg·m/s², el Joule es kg·m²/s² y el Pascal es kg/(m·s²). Mantener consistencia en las unidades previene el 70% de los errores de cálculo en problemas numéricos.
                <span className={styles.faqTip}>Convierte siempre al SI antes de sustituir en fórmulas (km/h → m/s dividiendo entre 3,6).</span>
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Qué es la notación científica y cuándo se usa?</dt>
              <dd>
                La notación científica expresa números muy grandes o pequeños como a × 10ⁿ, donde 1 ≤ a &lt; 10. La masa de un electrón es 9,109×10⁻³¹ kg. La distancia Tierra-Sol es 1,496×10¹¹ m. En química, el número de Avogadro es 6,022×10²³ mol⁻¹. Se usa para evitar errores al escribir muchos ceros y para operar con órdenes de magnitud.
                <span className={styles.faqTip}>En la calculadora científica: 6,022 EXP 23 equivale a 6,022×10²³.</span>
              </dd>
            </div>

            <div className={styles.faqItem}>
              <dt>¿Cómo se aplica la física y la química en ingeniería?</dt>
              <dd>
                Prácticamente toda la ingeniería usa ambas: la ingeniería civil aplica mecánica de sólidos y fluidos; la electrónica, electromagnetismo y semiconductores (química del silicio); la química industrial diseña reactores basándose en cinética química y termodinámica; la biomedicina combina óptica (TAC, endoscopias) con bioquímica. Las empresas más demandantes de estos perfiles en España son Repsol, Iberdrola, SEAT e Indra.
                <span className={styles.faqTip}>En la selectividad española (EBAU), física y química son las asignaturas que más nota media elevan para ingeniería (peso × 0,2 cada una).</span>
              </dd>
            </div>
          </dl>
        </section>

        {/* SECCIÓN 4: Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>Cómo estudiar Física y Química de forma sistemática (7 pasos)</h2>
          <p className={styles.introParagraph}>
            Un método probado para pasar de cero al dominio de los conceptos, aplicable tanto a ESO como a primer año de carrera.
          </p>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h4>Domina las unidades y la notación científica</h4>
                <p>Antes de cualquier fórmula, asegúrate de convertir correctamente entre unidades (m, kg, s, mol). Practica con 10 conversiones diarias durante la primera semana. El 60% de los errores en exámenes son de unidades, no de concepto.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h4>Aprende los conceptos ANTES que las fórmulas</h4>
                <p>Entiende qué es la fuerza (interacción que produce aceleración) antes de memorizar F = m × a. La comprensión conceptual te permite deducir la fórmula si la olvidas en el examen y adaptarla a contextos nuevos.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h4>Construye un mapa de relaciones entre conceptos</h4>
                <p>Dibuja en papel cómo se conectan: fuerza → trabajo → energía → potencia. O en química: átomo → molécula → mol → estequiometría. Ver la jerarquía evita estudiar como islas de información desconectada.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h4>Resuelve problemas numéricos desde el día 1</h4>
                <p>No esperes a &quot;entender todo&quot; para hacer ejercicios. Con cada concepto nuevo, resuelve al menos 3 problemas numéricos. Un coche a 72 km/h = 20 m/s. Una solución de pH 3 tiene [H⁺] = 10⁻³ mol/L. Los números anclan la teoría.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <h4>Memoriza los 20 conceptos básicos de cada rama</h4>
                <p>En física: fuerza, energía, trabajo, potencia, velocidad, aceleración, presión, temperatura, campo eléctrico, onda. En química: átomo, mol, pH, enlace, reacción, oxidación, equilibrio, electronegatividad, entalpía, estequiometría. Con estos 20 se resuelve el 80% de los problemas de selectividad.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <h4>Practica con exámenes reales de EBAU de tu comunidad autónoma</h4>
                <p>Descarga los 5 últimos exámenes de selectividad de tu CC.AA. (disponibles en la web de la universidad). Cronométrate: cada problema de física debería resolverse en 15-20 minutos. La repetición de patrones reduce la ansiedad y mejora la velocidad.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <h4>Revisa los errores con un enfoque diagnóstico</h4>
                <p>Cuando fallas un problema, clasifica el error: ¿es conceptual (no entendí el fenómeno)?, ¿algebraico (me equivoqué al despejar)?, ¿de unidades?, ¿de lectura del enunciado? Llevar un registro de errores durante 4 semanas mejora la nota media un 15-20%.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* SECCIÓN 5: Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>6 claves para estudiar ciencias exactas con eficacia</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⏱️</span>
              <h4>Bloques de 45 minutos</h4>
              <p>El cerebro mantiene concentración óptima en física/química durante 45-50 minutos. Estudia en bloques de 45 min + 10 min de pausa activa. Estudiar 3×45 min rinde más que 3 horas continuas con rendimiento decreciente.</p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✍️</span>
              <h4>Escribe las fórmulas a mano</h4>
              <p>Escribir F = m × a o ΔS = Q/T a mano activa áreas motoras del cerebro que refuerzan la memoria. Los estudiantes que copian fórmulas a mano retienen un 30% más que los que solo las leen, según estudios de aprendizaje motor.</p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔗</span>
              <h4>Conecta con la vida real</h4>
              <p>El principio de Arquímedes explica por qué flota un barco de acero de 200.000 toneladas. La ley de Ohm está detrás del fusible de tu casa. La presión osmótica es por qué la lechuga se mustia con sal. Los ejemplos cotidianos multiplican la retención.</p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>👥</span>
              <h4>Explica en voz alta</h4>
              <p>La técnica Feynman: intenta explicar un concepto como si se lo contaras a alguien de 12 años. Si no puedes explicar la entropía sin fórmulas, todavía no la has entendido. Los estudiantes que enseñan a otros retienen el 90% del contenido frente al 10% de solo leer.</p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📐</span>
              <h4>Usa análisis dimensional siempre</h4>
              <p>Antes de calcular, comprueba que las unidades son coherentes. Si quieres obtener velocidad (m/s) y el resultado te da kg·m, hay un error. Este hábito, aplicado en todos los problemas, detecta el 40% de los errores sin resolver la ecuación completa.</p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🗓️</span>
              <h4>Repaso espaciado (curva del olvido)</h4>
              <p>Repasa cada concepto nuevo al día siguiente, a los 3 días, a los 7 días y a los 21 días. Este patrón (basado en la curva de Ebbinghaus) mantiene el 80% de la información en la memoria a largo plazo frente al 20% sin repaso. Usa el glosario para los repasos breves de 5 minutos.</p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 6: Warning Box — Errores comunes */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>6 errores frecuentes que debes evitar</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confundir masa y peso.</strong> La masa es invariable (70 kg en la Tierra y en la Luna). El peso es una fuerza que depende de la gravedad: P = m × g. En la Luna, g = 1,62 m/s², así que un cuerpo de 70 kg pesa solo 113 N (frente a 686 N en la Tierra).
              </li>
              <li>
                <strong>Errores de unidades al sustituir en fórmulas.</strong> Si la velocidad está en km/h y la usas directamente en Ec = ½mv², obtendrás un resultado incorrecto. Convierte siempre a unidades del SI antes de sustituir: 90 km/h = 25 m/s.
              </li>
              <li>
                <strong>Memorizar fórmulas sin entender el concepto.</strong> Saber que pH = -log[H⁺] no sirve si no entiendes que el pH mide la concentración de protones en solución. Sin comprensión conceptual no puedes aplicar la fórmula en contextos nuevos ni interpretar los resultados.
              </li>
              <li>
                <strong>Confundir velocidad media y velocidad instantánea.</strong> La velocidad media es el desplazamiento total dividido por el tiempo total. La instantánea es la derivada de la posición en ese instante. En un viaje de 200 km en 2 h, la velocidad media es 100 km/h, pero en ningún momento concreto tienes garantizado ir a 100 km/h.
              </li>
              <li>
                <strong>No distinguir reacción exotérmica de endotérmica.</strong> En una reacción exotérmica (ΔH &lt; 0) se libera calor: la combustión de metano (ΔH = -890 kJ/mol). En una endotérmica (ΔH &gt; 0) se absorbe calor: la fotosíntesis. Confundirlas invierte el signo del balance energético en los cálculos de ingeniería química.
              </li>
              <li>
                <strong>Olvidar el signo en problemas vectoriales.</strong> La velocidad, la fuerza y el campo eléctrico son vectores: tienen módulo, dirección y sentido. En un plano inclinado, no es lo mismo una fuerza de +30 N (cuesta abajo) que -30 N (cuesta arriba). Definir el sistema de referencia al inicio del problema y respetarlo evita este error.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('glosario-fisica-quimica')} />

      <ShareCard appName="glosario-fisica-quimica" />
      <Footer appName="glosario-fisica-quimica" />
    </div>
  );
}
