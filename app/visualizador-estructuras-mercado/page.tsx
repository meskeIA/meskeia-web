'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './EstructurasMercado.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ==========================================
// TIPOS
// ==========================================

type TabId = 'comparativa' | 'competencia' | 'monopolio' | 'oligopolio';

type EstructuraMercado =
  | 'competencia-perfecta'
  | 'competencia-monopolistica'
  | 'oligopolio'
  | 'monopolio'
  | 'monopsonio';

type EstrategiaEmpresa = 'cooperar' | 'traicionar';

interface FilaComparativa {
  id: EstructuraMercado;
  nombre: string;
  vendedores: string;
  producto: string;
  barreras: string;
  controlPrecio: string;
  ejemplo: string;
}

// ==========================================
// DATOS
// ==========================================

const FILAS_COMPARATIVA: FilaComparativa[] = [
  {
    id: 'competencia-perfecta',
    nombre: 'Competencia perfecta',
    vendedores: 'Muy muchos',
    producto: 'Homogéneo',
    barreras: 'Ninguna',
    controlPrecio: 'Ninguno (precio dado)',
    ejemplo: 'Trigo, divisas',
  },
  {
    id: 'competencia-monopolistica',
    nombre: 'Competencia monopolística',
    vendedores: 'Muchos',
    producto: 'Diferenciado',
    barreras: 'Bajas',
    controlPrecio: 'Pequeño',
    ejemplo: 'Restaurantes, ropa',
  },
  {
    id: 'oligopolio',
    nombre: 'Oligopolio',
    vendedores: 'Pocos',
    producto: 'Homogéneo o diferenciado',
    barreras: 'Altas',
    controlPrecio: 'Considerable (interdependencia)',
    ejemplo: 'Telecomunicaciones, automóviles',
  },
  {
    id: 'monopolio',
    nombre: 'Monopolio',
    vendedores: 'Uno',
    producto: 'Único (sin sustitutos)',
    barreras: 'Muy altas',
    controlPrecio: 'Total (fija precio)',
    ejemplo: 'Servicios públicos, patentes',
  },
  {
    id: 'monopsonio',
    nombre: 'Monopsonio',
    vendedores: 'Muchos',
    producto: 'Varios',
    barreras: 'Altas (lado comprador)',
    controlPrecio: 'Total (fija precio compra)',
    ejemplo: 'Defensa nacional, tabaco',
  },
];

// Matriz del dilema del prisionero: [beneficioA, beneficioB]
const MATRIZ_PAGOS: Record<EstrategiaEmpresa, Record<EstrategiaEmpresa, [number, number]>> = {
  cooperar: {
    cooperar: [100, 100],
    traicionar: [0, 150],
  },
  traicionar: {
    cooperar: [150, 0],
    traicionar: [50, 50],
  },
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function VisualizadorEstructurasMercadoPage() {
  const [tabActiva, setTabActiva] = useState<TabId>('comparativa');
  const [estructuraActiva, setEstructuraActiva] = useState<EstructuraMercado>('monopolio');
  const [desplazamientoDemanda, setDesplazamientoDemanda] = useState(0);
  const [estrategiaA, setEstrategiaA] = useState<EstrategiaEmpresa>('cooperar');
  const [estrategiaB, setEstrategiaB] = useState<EstrategiaEmpresa>('cooperar');

  // Equilibrio competencia perfecta (varía con el slider)
  const precioEquilibrio = 50 + desplazamientoDemanda * 0.5;
  const cantidadEquilibrio = 60 + desplazamientoDemanda * 0.3;

  const pagos = MATRIZ_PAGOS[estrategiaA][estrategiaB];

  const tabs: { id: TabId; label: string }[] = [
    { id: 'comparativa', label: 'Comparativa' },
    { id: 'competencia', label: 'Competencia Perfecta' },
    { id: 'monopolio', label: 'Monopolio vs Competencia' },
    { id: 'oligopolio', label: 'Oligopolio y Colusión' },
  ];

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>📊 Estructuras de Mercado</h1>
          <p className={styles.heroSubtitle}>
            Competencia perfecta, monopolio, oligopolio y bienestar social — microeconomía visual
          </p>
        </header>

        <LegalNotice />

        <main className={styles.main}>
          {/* Navegación de tabs */}
          <nav className={styles.tabNav} aria-label="Secciones del visualizador">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tabBtn} ${tabActiva === tab.id ? styles.tabBtnActivo : ''}`}
                onClick={() => setTabActiva(tab.id)}
                aria-current={tabActiva === tab.id ? 'true' : undefined}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* ======================== TAB 1: COMPARATIVA ======================== */}
          {tabActiva === 'comparativa' && (
            <div className={styles.tabContent}>
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>Comparativa de estructuras de mercado</h2>
                <p className={styles.sectionDesc}>
                  Selecciona una estructura para resaltarla. Las diferencias clave están en el número de vendedores, el tipo de producto y el poder sobre el precio.
                </p>

                {/* Selector rápido */}
                <div className={styles.selectorEstructura}>
                  {FILAS_COMPARATIVA.map((fila) => (
                    <button
                      key={fila.id}
                      className={`${styles.btnEstructura} ${estructuraActiva === fila.id ? styles.btnEstructuraActivo : ''}`}
                      onClick={() => setEstructuraActiva(fila.id)}
                    >
                      {fila.nombre}
                    </button>
                  ))}
                </div>

                <div className={styles.tableWrapper}>
                  <table className={styles.comparativaTable}>
                    <thead>
                      <tr>
                        <th>Estructura</th>
                        <th>Nº vendedores</th>
                        <th>Tipo de producto</th>
                        <th>Barreras entrada</th>
                        <th>Control precio</th>
                        <th>Ejemplo real</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FILAS_COMPARATIVA.map((fila) => (
                        <tr
                          key={fila.id}
                          className={estructuraActiva === fila.id ? styles.filaActiva : ''}
                          onClick={() => setEstructuraActiva(fila.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td><strong>{fila.nombre}</strong></td>
                          <td>{fila.vendedores}</td>
                          <td>{fila.producto}</td>
                          <td>{fila.barreras}</td>
                          <td>{fila.controlPrecio}</td>
                          <td>{fila.ejemplo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================== TAB 2: COMPETENCIA PERFECTA ======================== */}
          {tabActiva === 'competencia' && (
            <div className={styles.tabContent}>
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>Competencia perfecta — equilibrio de mercado</h2>
                <p className={styles.sectionDesc}>
                  En competencia perfecta, el precio es determinado por la intersección de oferta y demanda. Ningún agente individual puede influir en el precio.
                </p>

                <div className={styles.sliderGroup}>
                  <label className={styles.sliderLabel} htmlFor="slider-demanda">
                    Desplazamiento de demanda: {desplazamientoDemanda > 0 ? `+${desplazamientoDemanda}` : desplazamientoDemanda}
                  </label>
                  <input
                    id="slider-demanda"
                    type="range"
                    min={-40}
                    max={40}
                    value={desplazamientoDemanda}
                    onChange={(e) => setDesplazamientoDemanda(Number(e.target.value))}
                    className={styles.rangeInput}
                  />
                  <div className={styles.badgeRow}>
                    <span className={styles.badgePrecio}>
                      Precio eq.: {precioEquilibrio.toFixed(0)}
                    </span>
                    <span className={styles.badgeCantidad}>
                      Cantidad eq.: {cantidadEquilibrio.toFixed(0)}
                    </span>
                  </div>
                </div>

                <div className={styles.svgWrapper}>
                  <CompetenciaPerfeztaSVG
                    desplazamiento={desplazamientoDemanda}
                    precio={precioEquilibrio}
                    cantidad={cantidadEquilibrio}
                  />
                </div>

                <div className={styles.leyendaRow}>
                  <span className={styles.leyendaItem}>
                    <span className={styles.leyendaColor} style={{ background: 'rgba(46,134,171,0.25)' }} />
                    Excedente del consumidor
                  </span>
                  <span className={styles.leyendaItem}>
                    <span className={styles.leyendaColor} style={{ background: 'rgba(72,169,166,0.35)' }} />
                    Excedente del productor
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ======================== TAB 3: MONOPOLIO vs COMPETENCIA ======================== */}
          {tabActiva === 'monopolio' && (
            <div className={styles.tabContent}>
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>Monopolio vs Competencia perfecta</h2>
                <p className={styles.sectionDesc}>
                  El monopolista reduce la cantidad y eleva el precio respecto al nivel competitivo, generando una pérdida irrecuperable de bienestar social (triángulo rojo).
                </p>

                <div className={styles.svgWrapper}>
                  <MonopolioSVG />
                </div>

                <div className={styles.badgeRow}>
                  <span className={styles.badgePrecio}>Pm = 80 (monopolio)</span>
                  <span className={styles.badgeInfo}>Pc = 50 (competencia)</span>
                  <span className={styles.badgeCantidad}>Qm = 30 | Qc = 60</span>
                </div>

                <p className={styles.notaTexto}>
                  El ingreso marginal (IM) del monopolista siempre está por debajo de la curva de demanda (D). El monopolista iguala IM = CM para maximizar beneficio, fijando el precio en la curva de demanda (Pm). La pérdida de bienestar es el área entre Pm y Pc desde Qm hasta Qc.
                </p>
              </div>
            </div>
          )}

          {/* ======================== TAB 4: OLIGOPOLIO Y COLUSIÓN ======================== */}
          {tabActiva === 'oligopolio' && (
            <div className={styles.tabContent}>
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>Oligopolio — dilema del prisionero</h2>
                <p className={styles.sectionDesc}>
                  En un oligopolio, las empresas son interdependientes. El dilema del prisionero explica por qué la colusión tiende a romperse: cada empresa tiene incentivo a traicionar aunque el resultado colectivo sea peor.
                </p>

                <div className={styles.estrategiasRow}>
                  <div className={styles.estrategiaGrupo}>
                    <span className={styles.estrategiaLabel}>Empresa A:</span>
                    <div className={styles.estrategiaBtns}>
                      <button
                        className={`${styles.btnEstrategia} ${estrategiaA === 'cooperar' ? styles.btnEstrategiaActivo : ''}`}
                        onClick={() => setEstrategiaA('cooperar')}
                      >
                        Cooperar (fijar precio alto)
                      </button>
                      <button
                        className={`${styles.btnEstrategia} ${estrategiaA === 'traicionar' ? styles.btnEstrategiaActivo : ''}`}
                        onClick={() => setEstrategiaA('traicionar')}
                      >
                        Traicionar (bajar precio)
                      </button>
                    </div>
                  </div>
                  <div className={styles.estrategiaGrupo}>
                    <span className={styles.estrategiaLabel}>Empresa B:</span>
                    <div className={styles.estrategiaBtns}>
                      <button
                        className={`${styles.btnEstrategia} ${estrategiaB === 'cooperar' ? styles.btnEstrategiaActivo : ''}`}
                        onClick={() => setEstrategiaB('cooperar')}
                      >
                        Cooperar (fijar precio alto)
                      </button>
                      <button
                        className={`${styles.btnEstrategia} ${estrategiaB === 'traicionar' ? styles.btnEstrategiaActivo : ''}`}
                        onClick={() => setEstrategiaB('traicionar')}
                      >
                        Traicionar (bajar precio)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Matriz de pagos */}
                <div className={styles.matrizWrapper}>
                  <table className={styles.matrizPagos}>
                    <thead>
                      <tr>
                        <th></th>
                        <th>B: Cooperar</th>
                        <th>B: Traicionar</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th>A: Cooperar</th>
                        <td
                          className={`${styles.celda00} ${estrategiaA === 'cooperar' && estrategiaB === 'cooperar' ? styles.celdaSeleccionada : ''}`}
                        >
                          A: 100 / B: 100
                        </td>
                        <td
                          className={`${styles.celda01} ${estrategiaA === 'cooperar' && estrategiaB === 'traicionar' ? styles.celdaSeleccionada : ''}`}
                        >
                          A: 0 / B: 150
                        </td>
                      </tr>
                      <tr>
                        <th>A: Traicionar</th>
                        <td
                          className={`${styles.celda10} ${estrategiaA === 'traicionar' && estrategiaB === 'cooperar' ? styles.celdaSeleccionada : ''}`}
                        >
                          A: 150 / B: 0
                        </td>
                        <td
                          className={`${styles.celda11} ${estrategiaA === 'traicionar' && estrategiaB === 'traicionar' ? styles.celdaSeleccionada : ''}`}
                        >
                          A: 50 / B: 50
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Resultado */}
                <div className={styles.resultadoNash} role="alert" aria-live="polite">
                  <strong>Resultado actual:</strong> Empresa A obtiene{' '}
                  <span className={styles.valorDestacado}>{pagos[0]}</span> y Empresa B obtiene{' '}
                  <span className={styles.valorDestacado}>{pagos[1]}</span>.
                  {estrategiaA === 'traicionar' && estrategiaB === 'traicionar' && (
                    <span className={styles.nashLabel}> ← Equilibrio de Nash (ambos traicionan)</span>
                  )}
                  {estrategiaA === 'cooperar' && estrategiaB === 'cooperar' && (
                    <span className={styles.optimalLabel}> ← Óptimo colectivo (acuerdo colusivo)</span>
                  )}
                </div>

                <p className={styles.notaTexto}>
                  El equilibrio de Nash ocurre cuando Traicionar/Traicionar: ninguna empresa puede mejorar unilateralmente cambiando su estrategia. Aunque Cooperar/Cooperar genera más beneficio conjunto, cada empresa tiene incentivo a desviarse.
                </p>
              </div>
            </div>
          )}
        </main>

        {/* ======================== SECCIÓN EDUCATIVA ======================== */}
        <EducationalSection
          title="Fundamentos de las estructuras de mercado"
          subtitle="Competencia, monopolio, oligopolio y bienestar social"
        >
          {/* SECCIÓN 1 — Tabla Comparativa */}
          <section>
            <h2>Comparativa completa de estructuras de mercado</h2>
            <p>
              Las cinco grandes estructuras de mercado se diferencian por el número de vendedores, el tipo de producto, las barreras de entrada y el poder sobre el precio. Su impacto en el bienestar social es el criterio clave para la regulación.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Estructura</th>
                    <th>Vendedores</th>
                    <th>Producto</th>
                    <th>Barreras</th>
                    <th>Control precio</th>
                    <th>Ejemplo real</th>
                    <th>Bienestar social</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Competencia perfecta</strong></td>
                    <td>Infinitos</td>
                    <td>Homogéneo</td>
                    <td>Ninguna</td>
                    <td>Ninguno (precio dado)</td>
                    <td>Trigo, divisas</td>
                    <td>Máximo (P = CMg)</td>
                  </tr>
                  <tr>
                    <td><strong>Competencia monopolística</strong></td>
                    <td>Muchos</td>
                    <td>Diferenciado</td>
                    <td>Bajas</td>
                    <td>Pequeño</td>
                    <td>Restaurantes, ropa</td>
                    <td>Casi óptimo</td>
                  </tr>
                  <tr>
                    <td><strong>Oligopolio</strong></td>
                    <td>Pocos</td>
                    <td>Homogéneo o diferenciado</td>
                    <td>Altas</td>
                    <td>Considerable (interdependencia)</td>
                    <td>Telecos, automóviles</td>
                    <td>Reducido (DWL variable)</td>
                  </tr>
                  <tr>
                    <td><strong>Monopolio</strong></td>
                    <td>Uno</td>
                    <td>Único (sin sustitutos)</td>
                    <td>Muy altas</td>
                    <td>Total (fija precio)</td>
                    <td>Servicios públicos, patentes</td>
                    <td>Menor (DWL máximo)</td>
                  </tr>
                  <tr>
                    <td><strong>Monopsonio</strong></td>
                    <td>Muchos</td>
                    <td>Varios</td>
                    <td>Altas (lado comprador)</td>
                    <td>Total (fija precio compra)</td>
                    <td>Defensa nacional, tabaco</td>
                    <td>Menor (DWL por comprador)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SECCIÓN 2 — Casos de Uso */}
          <section>
            <h2>¿Quién usa este visualizador y para qué?</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
                <h3>Estudiante de economía</h3>
                <p>
                  Usa las tablas comparativas y los gráficos interactivos para consolidar los conceptos de microeconomía antes de exámenes. El dilema del prisionero y la curva de ingreso marginal son los temas más evaluados en selectividad y grado.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏢</span>
                <h3>Emprendedor</h3>
                <p>
                  Analiza la estructura del mercado al que quieres entrar antes de lanzar tu producto. Conocer si hay oligopolio o competencia monopolística te permite estimar las barreras reales y tu poder de negociación con proveedores y distribuidores.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <span className={styles.escenarioIcon} aria-hidden="true">📊</span>
                <h3>Analista de competencia</h3>
                <p>
                  Identifica cuándo una empresa abusa de su posición dominante para denunciar ante la CNMC. La pérdida de bienestar (DWL) calculada es un argumento técnico clave en los expedientes sancionadores europeos.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏛️</span>
                <h3>Responsable de política económica</h3>
                <p>
                  Diseña regulación antimonopolio basada en el triángulo de Harberger calculado. Los modelos de oligopolio con dilema del prisionero justifican la necesidad de organismos reguladores independientes como la CNMC o la DG Comp europea.
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 3 — FAQ */}
          <section>
            <h2>Preguntas frecuentes sobre estructuras de mercado</h2>
            <dl className={styles.faqList}>
              <div className={styles.faqItem}>
                <dt>¿Por qué el monopolio es ineficiente si el empresario maximiza beneficios?</dt>
                <dd>
                  El monopolista maximiza su beneficio igualando ingreso marginal con coste marginal (IM = CM), pero esto implica producir menos cantidad que en competencia y fijar un precio más alto. La diferencia entre el precio de competencia y el precio de monopolio genera una pérdida de bienestar —el triángulo de Harberger— que no recibe ni el consumidor ni el productor: simplemente desaparece.
                  <span className={styles.faqTip}>Clave: la eficiencia social requiere P = CMg, que solo ocurre en competencia perfecta.</span>
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Qué diferencia el oligopolio de la competencia monopolística?</dt>
                <dd>
                  El oligopolio tiene pocos vendedores con alta interdependencia (la decisión de uno afecta a los demás) y barreras de entrada muy altas. La competencia monopolística tiene muchos vendedores con productos diferenciados y barreras bajas. En el largo plazo, la competencia monopolística tiende al beneficio cero por la entrada de nuevos competidores; el oligopolio puede mantener beneficios extraordinarios indefinidamente.
                  <span className={styles.faqTip}>Ejemplo: los restaurantes son competencia monopolística; las operadoras de telefonía son oligopolio.</span>
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Es posible la competencia perfecta en la práctica?</dt>
                <dd>
                  En sentido estricto, la competencia perfecta es un modelo teórico que requiere productos homogéneos, información perfecta, libre entrada y muchos vendedores. Los mercados de materias primas (trigo, petróleo en bolsa) y algunos mercados financieros se aproximan, pero nunca cumplen todas las condiciones simultáneamente. Es útil como referencia normativa, no como descripción de la realidad.
                  <span className={styles.faqTip}>El modelo sirve para medir cuánto se aleja un mercado real del óptimo teórico.</span>
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Cómo actúa la CNMC contra los oligopolios en España?</dt>
                <dd>
                  La Comisión Nacional de los Mercados y la Competencia investiga acuerdos de precios (cárteles), abusos de posición dominante y concentraciones empresariales. Sus herramientas incluyen multas de hasta el 10% de la facturación global, órdenes de cese y compromisos de comportamiento. En oligopolios, la CNMC define primero el &laquo;mercado relevante&raquo; (geográfico y de producto) antes de analizar cuotas de mercado.
                  <span className={styles.faqTip}>La DG Comp de la Comisión Europea actúa cuando el abuso afecta al mercado interior de la UE.</span>
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Qué es el &laquo;deadweight loss&raquo; y por qué importa?</dt>
                <dd>
                  El <em>deadweight loss</em> (DWL) o pérdida irrecuperable de bienestar es el área triangular que representa las transacciones que habrían beneficiado a compradores y vendedores pero no se realizan por el poder de mercado. No es una transferencia de consumidor a productor: es bienestar destruido. Cuanto mayor el DWL, mayor la ineficiencia del mercado y la justificación económica para regularlo.
                  <span className={styles.faqTip}>El DWL crece con el cuadrado de la desviación del precio respecto al CMg.</span>
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt>¿Cuándo la regulación de precios ayuda y cuándo distorsiona?</dt>
                <dd>
                  La regulación de precios ayuda en monopolios naturales (redes de electricidad, agua, ferrocarril) donde la competencia no es viable por los costes de infraestructura. Falla cuando se aplica en mercados competitivos: un precio máximo por debajo del equilibrio genera escasez; un precio mínimo por encima genera excedentes. La clave está en identificar correctamente si hay poder de mercado antes de regular.
                  <span className={styles.faqTip}>España regula el precio de la electricidad (PVPC) porque el mercado eléctrico tiene características de monopolio natural en redes.</span>
                </dd>
              </div>
            </dl>
          </section>

          {/* SECCIÓN 4 — Guía Paso a Paso */}
          <section>
            <h2>Cómo analizar la estructura de cualquier mercado</h2>
            <ol className={styles.stepGuide}>
              <li className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <div className={styles.stepContent}>
                  <strong>Identifica el número de vendedores y compradores</strong>
                  <p>Empieza contando cuántos oferentes hay en el mercado. Uno (monopolio), pocos (oligopolio), muchos (competencia monopolística) o infinitos (competencia perfecta). Repite el análisis para el lado comprador: si solo hay un comprador, el mercado es un monopsonio.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <div className={styles.stepContent}>
                  <strong>Determina si el producto es homogéneo o diferenciado</strong>
                  <p>¿Los consumidores perciben diferencias entre los productos de distintos vendedores? Si sí, hay diferenciación (competencia monopolística u oligopolio diferenciado). Si no, los productos son sustitutos perfectos (commodities o competencia perfecta).</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <div className={styles.stepContent}>
                  <strong>Evalúa las barreras de entrada</strong>
                  <p>Analiza tres tipos: legales (patentes, licencias, concesiones), tecnológicas (economías de escala, know-how exclusivo) y de capital (inversión mínima necesaria). Cuanto mayores las barreras, más cerca del monopolio u oligopolio.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>4</span>
                <div className={styles.stepContent}>
                  <strong>Estima el poder de fijación de precios</strong>
                  <p>Calcula el índice de Lerner: (P - CMg) / P. Un índice de 0 indica competencia perfecta; cuanto más se acerca a 1, mayor es el poder de mercado. También puedes calcular el índice HHI sumando los cuadrados de las cuotas de mercado de cada empresa.</p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber}>5</span>
                <div className={styles.stepContent}>
                  <strong>Calcula el impacto en bienestar social</strong>
                  <p>Si hay poder de mercado, estima el DWL como el área del triángulo entre el precio de monopolio (Pm), el precio competitivo (Pc = CMg) y las cantidades Qm y Qc. DWL ≈ ½ × (Pm - Pc) × (Qc - Qm). Este valor cuantifica la pérdida social que justifica o no la intervención regulatoria.</p>
                </div>
              </li>
            </ol>
          </section>

          {/* SECCIÓN 5 — Mejores Prácticas */}
          <section>
            <h2>Claves para no equivocarte</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📐</span>
                <p><strong>No confundas monopolio con monopsonio.</strong> El monopolio tiene un solo vendedor con poder sobre el precio de venta. El monopsonio tiene un solo comprador con poder sobre el precio de compra. Ambos generan DWL, pero en lados distintos del mercado.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔢</span>
                <p><strong>El oligopolio puede actuar como monopolio si hay colusión tácita.</strong> Aunque los oligopolistas no firmen ningún acuerdo formal, pueden aprender a respetar zonas de mercado o seguir al líder en precios. La CNMC llama a esto &laquo;paralelismo consciente&raquo; y puede ser sancionable.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
                <p><strong>La CNMC define el mercado relevante antes de analizar cuotas.</strong> Una empresa con el 80% del mercado de refrescos de cola puede tener solo el 20% del mercado de bebidas. La definición del mercado relevante (geográfico + de producto) determina si hay posición dominante.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">✅</span>
                <p><strong>En competencia perfecta, P = CMg = máximo bienestar social.</strong> Esta es la condición de eficiencia de Pareto en el mercado de bienes. Todo apartamiento de este punto —hacia arriba o hacia abajo— genera una pérdida de eficiencia medible con el triángulo de Harberger.</p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 6 — Warning Box */}
          <section>
            <div className={styles.warningBox}>
              <h3>⚠️ Errores frecuentes al analizar estructuras de mercado</h3>
              <ul>
                <li><strong>Confundir &laquo;mercado competitivo&raquo; con &laquo;mercado eficiente&raquo;.</strong> Un mercado puede ser muy competitivo (muchos vendedores) y aun así ser ineficiente por externalidades, información asimétrica o bienes públicos.</li>
                <li><strong>Asumir que el oligopolio siempre colude.</strong> Los oligopolistas también pueden entrar en guerras de precios (competencia de Bertrand) que llevan los precios hasta el coste marginal, como en la competencia perfecta.</li>
                <li><strong>Ignorar los efectos dinámicos del monopolio.</strong> El análisis estático muestra DWL, pero el monopolista puede invertir más en I+D porque internaliza todos los beneficios de la innovación. Schumpeter argumentó que el monopolio temporal es el motor de la innovación.</li>
                <li><strong>Aplicar el modelo de competencia perfecta a mercados con rendimientos crecientes a escala.</strong> Cuando los costes medios caen con la producción (monopolio natural), la competencia perfecta no es viable: una sola empresa produce más barato que muchas. Forzar la competencia aumentaría los costes totales.</li>
                <li><strong>Olvidar que el monopsonio también genera pérdida de bienestar.</strong> Un solo comprador (Estado en defensa, supermercado en productos frescos) puede imponer precios de compra por debajo del equilibrio competitivo, reduciendo la oferta y el bienestar del lado vendedor.</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-estructuras-mercado')} />

        <ShareCard appName="visualizador-estructuras-mercado" />

        <Footer appName="visualizador-estructuras-mercado" />
    </div>
  );
}

// ==========================================
// SUBCOMPONENTES SVG
// ==========================================

interface CompetenciaProps {
  desplazamiento: number;
  precio: number;
  cantidad: number;
}

function CompetenciaPerfeztaSVG({ desplazamiento, precio, cantidad }: CompetenciaProps) {
  // Coordenadas SVG (viewBox 0 0 400 280)
  // Eje X: cantidad (0-120), Eje Y: precio (0-100) invertido
  const W = 400;
  const H = 280;
  const padL = 50;
  const padB = 40;
  const padR = 20;
  const padT = 20;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const toX = (q: number) => padL + (q / 120) * plotW;
  const toY = (p: number) => padT + ((100 - p) / 100) * plotH;

  // Oferta: p = 0.5*q (ascendente)
  const ofertaP1 = 10;
  const ofertaQ1 = ofertaP1 / 0.5;
  const ofertaP2 = 90;
  const ofertaQ2 = ofertaP2 / 0.5;

  // Demanda: p = 100 - 0.5*q + desplazamiento*0.5 (desplazada)
  const dem = (q: number) => 100 - 0.5 * q + desplazamiento * 0.5;
  const demQ1 = 0;
  const demP1 = dem(demQ1);
  const demQ2 = 120;
  const demP2 = dem(demQ2);

  // Equilibrio: 0.5*q = 100 - 0.5*q + desplazamiento*0.5 => q = 100 + desplazamiento*0.5
  const eqQ = Math.min(Math.max(cantidad, 5), 115);
  const eqP = Math.min(Math.max(precio, 5), 95);

  // Área excedente consumidor (triángulo superior al precio de equilibrio en curva demanda)
  const excCons = [
    `${toX(demQ1)},${toY(demP1)}`,
    `${toX(eqQ)},${toY(eqP)}`,
    `${toX(demQ1)},${toY(eqP)}`,
  ].join(' ');

  // Área excedente productor (triángulo inferior al precio de equilibrio en curva oferta)
  const excProd = [
    `${toX(ofertaQ1)},${toY(ofertaP1)}`,
    `${toX(eqQ)},${toY(eqP)}`,
    `${toX(eqQ)},${toY(0)}`,
    `${toX(ofertaQ1)},${toY(0)}`,
  ].join(' ');

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="auto"
      aria-label="Gráfico de competencia perfecta con curvas de oferta y demanda"
      role="img"
    >
      {/* Ejes */}
      <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="#999" strokeWidth="1.5" />
      <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#999" strokeWidth="1.5" />

      {/* Etiquetas ejes */}
      <text x={padL - 35} y={padT + plotH / 2} fontSize="11" fill="#666" textAnchor="middle" transform={`rotate(-90, ${padL - 35}, ${padT + plotH / 2})`}>Precio (P)</text>
      <text x={padL + plotW / 2} y={H - 5} fontSize="11" fill="#666" textAnchor="middle">Cantidad (Q)</text>

      {/* Área excedente consumidor */}
      <polygon points={excCons} fill="rgba(46,134,171,0.25)" />

      {/* Área excedente productor */}
      <polygon points={excProd} fill="rgba(72,169,166,0.35)" />

      {/* Curva Oferta (S) */}
      <line
        x1={toX(ofertaQ1)} y1={toY(ofertaP1)}
        x2={toX(ofertaQ2)} y2={toY(ofertaP2)}
        stroke="#48A9A6" strokeWidth="2.5"
      />
      <text x={toX(ofertaQ2) - 10} y={toY(ofertaP2) - 6} fontSize="13" fill="#48A9A6" fontWeight="bold">S</text>

      {/* Curva Demanda (D) */}
      <line
        x1={toX(demQ1)} y1={toY(Math.min(demP1, 100))}
        x2={toX(demQ2)} y2={toY(Math.max(demP2, 0))}
        stroke="#2E86AB" strokeWidth="2.5"
      />
      <text x={toX(demQ2) - 10} y={toY(Math.max(demP2, 0)) - 6} fontSize="13" fill="#2E86AB" fontWeight="bold">D</text>

      {/* Líneas punteadas al equilibrio */}
      <line x1={toX(eqQ)} y1={toY(eqP)} x2={toX(eqQ)} y2={H - padB} stroke="#555" strokeWidth="1" strokeDasharray="4,3" />
      <line x1={padL} y1={toY(eqP)} x2={toX(eqQ)} y2={toY(eqP)} stroke="#555" strokeWidth="1" strokeDasharray="4,3" />

      {/* Punto equilibrio */}
      <circle cx={toX(eqQ)} cy={toY(eqP)} r="5" fill="#E83F6F" />
      <text x={toX(eqQ) + 8} y={toY(eqP) - 6} fontSize="11" fill="#E83F6F" fontWeight="bold">E</text>

      {/* Labels en ejes */}
      <text x={toX(eqQ)} y={H - padB + 14} fontSize="10" fill="#555" textAnchor="middle">Q*={eqQ.toFixed(0)}</text>
      <text x={padL - 6} y={toY(eqP) + 4} fontSize="10" fill="#555" textAnchor="end">P*={eqP.toFixed(0)}</text>
    </svg>
  );
}

function MonopolioSVG() {
  const W = 400;
  const H = 280;
  const padL = 50;
  const padB = 40;
  const padR = 20;
  const padT = 20;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const toX = (q: number) => padL + (q / 100) * plotW;
  const toY = (p: number) => padT + ((100 - p) / 100) * plotH;

  // Curva demanda: P = 100 - q
  // Ingreso marginal: IM = 100 - 2q
  // Costo marginal: CM = 20 (horizontal)
  // Equilibrio monopolio: IM = CM => 100 - 2q = 20 => q = 40 (usamos Qm=30 para ejemplo más claro)
  const Qm = 30;
  const Pm = 70;   // P en demanda para Qm=30: 100-30=70... ajustamos a 80 para más contraste
  const Qc = 60;
  const Pc = 40;   // CM
  const CM = 40;

  // Pérdida de bienestar (triángulo entre Qm, Qc con precios Pm y Pc)
  const dwl = [
    `${toX(Qm)},${toY(Pm)}`,
    `${toX(Qc)},${toY(Pc)}`,
    `${toX(Qm)},${toY(Pc)}`,
  ].join(' ');

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="auto"
      aria-label="Gráfico comparativo monopolio vs competencia perfecta"
      role="img"
    >
      {/* Ejes */}
      <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="#999" strokeWidth="1.5" />
      <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#999" strokeWidth="1.5" />

      {/* Área pérdida de bienestar */}
      <polygon points={dwl} fill="rgba(232,63,111,0.35)" />

      {/* Curva Demanda (D): P = 100 - q */}
      <line x1={toX(0)} y1={toY(100)} x2={toX(100)} y2={toY(0)} stroke="#2E86AB" strokeWidth="2.5" />
      <text x={toX(95)} y={toY(5) - 5} fontSize="13" fill="#2E86AB" fontWeight="bold">D</text>

      {/* Ingreso marginal (IM): P = 100 - 2q */}
      <line x1={toX(0)} y1={toY(100)} x2={toX(50)} y2={toY(0)} stroke="#7FB3D3" strokeWidth="2" strokeDasharray="5,3" />
      <text x={toX(46)} y={toY(6) - 5} fontSize="12" fill="#7FB3D3" fontWeight="bold">IM</text>

      {/* Coste marginal (CM) horizontal */}
      <line x1={toX(0)} y1={toY(CM)} x2={toX(100)} y2={toY(CM)} stroke="#48A9A6" strokeWidth="2.5" />
      <text x={toX(92)} y={toY(CM) - 5} fontSize="12" fill="#48A9A6" fontWeight="bold">CM</text>

      {/* Líneas monopolio */}
      <line x1={toX(Qm)} y1={toY(Pm)} x2={toX(Qm)} y2={H - padB} stroke="#E83F6F" strokeWidth="1.5" strokeDasharray="4,3" />
      <line x1={padL} y1={toY(Pm)} x2={toX(Qm)} y2={toY(Pm)} stroke="#E83F6F" strokeWidth="1.5" strokeDasharray="4,3" />

      {/* Líneas competencia */}
      <line x1={toX(Qc)} y1={toY(Pc)} x2={toX(Qc)} y2={H - padB} stroke="#48A9A6" strokeWidth="1.5" strokeDasharray="4,3" />
      <line x1={padL} y1={toY(Pc)} x2={toX(Qc)} y2={toY(Pc)} stroke="#48A9A6" strokeWidth="1.5" strokeDasharray="4,3" />

      {/* Puntos */}
      <circle cx={toX(Qm)} cy={toY(Pm)} r="5" fill="#E83F6F" />
      <circle cx={toX(Qc)} cy={toY(Pc)} r="5" fill="#48A9A6" />

      {/* Labels en ejes */}
      <text x={toX(Qm)} y={H - padB + 14} fontSize="10" fill="#E83F6F" textAnchor="middle">Qm={Qm}</text>
      <text x={toX(Qc)} y={H - padB + 14} fontSize="10" fill="#48A9A6" textAnchor="middle">Qc={Qc}</text>
      <text x={padL - 6} y={toY(Pm) + 4} fontSize="10" fill="#E83F6F" textAnchor="end">Pm={Pm}</text>
      <text x={padL - 6} y={toY(Pc) + 4} fontSize="10" fill="#48A9A6" textAnchor="end">Pc={Pc}</text>

      {/* Etiqueta DWL */}
      <text x={toX((Qm + Qc) / 2)} y={toY((Pm + Pc) / 2)} fontSize="10" fill="#E83F6F" textAnchor="middle" fontWeight="bold">DWL</text>

      <text x={padL - 35} y={padT + plotH / 2} fontSize="11" fill="#666" textAnchor="middle" transform={`rotate(-90, ${padL - 35}, ${padT + plotH / 2})`}>Precio (P)</text>
      <text x={padL + plotW / 2} y={H - 5} fontSize="11" fill="#666" textAnchor="middle">Cantidad (Q)</text>
    </svg>
  );
}
