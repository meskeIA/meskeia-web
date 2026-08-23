'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect } from 'react';
import styles from './TablaPeriodica.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { formatNumber } from '@/lib';
import { elementos, elementosPorSimbolo, FAMILIAS, ESTADOS, Elemento } from './elementos-data';
import { parsearFormulaQuimica } from '@/lib/formula-quimica';
import { getRelatedApps } from '@/data/app-relations';

// Posiciones especiales en el grid de la tabla periódica
const getPosicion = (elemento: Elemento): { fila: number; columna: number } => {
  // Lantánidos (57-71) van en fila 8
  if (elemento.familia === 'lantanidos') {
    return { fila: 8, columna: elemento.numero - 54 }; // La-Lu: columnas 3-17
  }
  // Actínidos (89-103) van en fila 9
  if (elemento.familia === 'actinidos') {
    return { fila: 9, columna: elemento.numero - 86 }; // Ac-Lr: columnas 3-17
  }

  // Posiciones estándar basadas en grupo y período
  return { fila: elemento.periodo, columna: elemento.grupo };
};

export default function TablaPerodicaPage() {
  // Estados
  const [filtroFamilia, setFiltroFamilia] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [elementoSeleccionado, setElementoSeleccionado] = useState<Elemento | null>(null);
  const [formulaMolar, setFormulaMolar] = useState<string>('');
  const [resultadoMasa, setResultadoMasa] = useState<{ masa: number; desglose: { simbolo: string; cantidad: number; masa: number }[] } | null>(null);
  const [errorMasa, setErrorMasa] = useState<string>('');

  // Filtrar elementos
  const elementosFiltrados = useMemo(() => {
    return elementos.filter(el => {
      if (filtroFamilia !== 'todos' && el.familia !== filtroFamilia) return false;
      if (filtroEstado !== 'todos' && el.estado !== filtroEstado) return false;
      if (busqueda) {
        const query = busqueda.toLowerCase();
        return (
          el.nombre.toLowerCase().includes(query) ||
          el.simbolo.toLowerCase().includes(query) ||
          el.numero.toString().includes(query)
        );
      }
      return true;
    });
  }, [filtroFamilia, filtroEstado, busqueda]);

  // Calcular masa molar
  const calcularMasaMolar = () => {
    setErrorMasa('');
    setResultadoMasa(null);

    if (!formulaMolar.trim()) {
      setErrorMasa('Ingresa una fórmula química');
      return;
    }

    try {
      // El parser vive en lib/formula-quimica.ts y usa una PILA, no una expresión regular:
      // los paréntesis anidan y una regex no puede contarlos. El anterior era
      // /([A-Z][a-z]?)(\d*)/g, que se saltaba «(» y «)» y perdía el subíndice del grupo
      // entero — Ca(OH)2 daba 57,0850 g/mol en vez de 74,0920, sin avisar de nada.
      const resultado = parsearFormulaQuimica(formulaMolar, {
        simboloValido: (s) => Boolean(elementosPorSimbolo[s]),
        errorSimbolo: (s) => ({ error: `Elemento "${s}" no reconocido`, pista: null }),
        errorVacia: () => ({ error: 'Ingresa una fórmula química', pista: null }),
      });

      if (!resultado.ok) {
        setErrorMasa(resultado.fallo.error);
        return;
      }

      const { comp, orden } = resultado.parseo;
      if (orden.length === 0) {
        setErrorMasa('No se encontraron elementos válidos');
        return;
      }

      // Calcular masa total
      let masaTotal = 0;
      const desglose = orden.map((simbolo) => {
        const cantidad = comp[simbolo];
        const masa = elementosPorSimbolo[simbolo].masa * cantidad;
        masaTotal += masa;
        return { simbolo, cantidad, masa };
      });

      setResultadoMasa({ masa: masaTotal, desglose });
    } catch {
      setErrorMasa('Error al procesar la fórmula');
    }
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltroFamilia('todos');
    setFiltroEstado('todos');
    setBusqueda('');
  };

  // Cerrar modal
  const cerrarModal = () => {
    setElementoSeleccionado(null);
  };

  /**
   * La ficha se comporta como un diálogo de verdad: al abrirse el foco entra en ella
   * —antes se quedaba en BODY, así que con teclado no había forma de llegar a su contenido—,
   * Escape la cierra, y al cerrarse el foco vuelve a la celda desde la que se abrió, que es
   * lo que evita tener que retabular las 118 casillas.
   */
  const cerrarModalRef = useRef<HTMLButtonElement>(null);
  const origenFocoRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!elementoSeleccionado) return;
    origenFocoRef.current = document.activeElement as HTMLElement | null;
    cerrarModalRef.current?.focus();

    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrarModal();
    };
    document.addEventListener('keydown', alPulsar);
    return () => {
      document.removeEventListener('keydown', alPulsar);
      origenFocoRef.current?.focus();
    };
  }, [elementoSeleccionado]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">⚛️</span> Tabla Periódica Interactiva</h1>
        <p className={styles.subtitle}>
          Explora los 118 elementos químicos con información detallada y calculadora de masa molar
        </p>
      </header>

      <LegalNotice />

      {/* Filtros */}
      <div className={styles.filtrosPanel}>
        <div className={styles.filtrosGrid}>
          <div className={styles.filtroGroup}>
            <label htmlFor="filtroFamilia">Familia:</label>
            <select
              id="filtroFamilia"
              value={filtroFamilia}
              onChange={(e) => setFiltroFamilia(e.target.value)}
              className={styles.select}
            >
              <option value="todos">Todas las familias</option>
              {Object.entries(FAMILIAS).map(([key, { nombre }]) => (
                <option key={key} value={key}>{nombre}</option>
              ))}
            </select>
          </div>

          <div className={styles.filtroGroup}>
            <label htmlFor="filtroEstado">Estado:</label>
            <select
              id="filtroEstado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className={styles.select}
            >
              <option value="todos">Todos los estados</option>
              {Object.entries(ESTADOS).map(([key, nombre]) => (
                <option key={key} value={key}>{nombre}</option>
              ))}
            </select>
          </div>

          <div className={styles.filtroGroup}>
            <label htmlFor="busqueda">Buscar:</label>
            <input
              type="text"
              id="busqueda"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre, símbolo o número..."
              className={styles.input}
            />
          </div>

          <button type="button" onClick={limpiarFiltros} className={styles.btnOutline}>
            <span aria-hidden="true">🗑️</span> Limpiar
          </button>
        </div>

        <p className={styles.contadorElementos}>
          Mostrando {elementosFiltrados.length} de {elementos.length} elementos
        </p>
      </div>

      {/* Tabla Periódica */}
      <div className={styles.tablaContainer}>
        <div className={styles.tablaPeriodica}>
          {elementos.map(elemento => {
            const pos = getPosicion(elemento);
            const estaFiltrado = !elementosFiltrados.includes(elemento);

            return (
              // Es un <button> y no un <div onClick>: la ficha es donde vive todo el detalle
              // que la app promete, y con divs no se llegaba a NINGUNA de las 118 con el
              // teclado (WCAG 2.1.1, nivel A). Un botón nativo trae foco, Enter y Espacio
              // sin escribir un solo manejador.
              <button
                type="button"
                key={elemento.numero}
                className={`${styles.elemento} ${styles[elemento.familia]} ${estaFiltrado ? styles.filtrado : ''}`}
                style={{
                  gridColumn: pos.columna,
                  gridRow: pos.fila,
                }}
                onClick={() => !estaFiltrado && setElementoSeleccionado(elemento)}
                // Los filtrados salen del orden de tabulación en vez de quedar como trampas
                // silenciosas: siguen visibles, atenuados, pero no reciben foco.
                disabled={estaFiltrado}
                aria-label={`${elemento.nombre} (${elemento.simbolo}), número atómico ${elemento.numero}`}
                title={`${elemento.nombre} (${elemento.simbolo})`}
              >
                <span className={styles.numeroAtomico}>{elemento.numero}</span>
                <span className={styles.simbolo}>{elemento.simbolo}</span>
                <span className={styles.nombre}>{elemento.nombre}</span>
                <span className={styles.masa}>{formatNumber(elemento.masa, elemento.masa % 1 === 0 ? 0 : 2)}</span>
              </button>
            );
          })}

          {/* Indicadores de Lantánidos y Actínidos */}
          <div className={styles.indicadorSerie} style={{ gridColumn: 3, gridRow: 6 }}>
            La-Lu
          </div>
          <div className={styles.indicadorSerie} style={{ gridColumn: 3, gridRow: 7 }}>
            Ac-Lr
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className={styles.leyenda}>
        <h3>Leyenda por Familias</h3>
        <div className={styles.leyendaGrid}>
          {Object.entries(FAMILIAS).map(([key, { nombre, color }]) => (
            <div key={key} className={styles.leyendaItem}>
              <span className={styles.colorBox} style={{ backgroundColor: color }}></span>
              <span>{nombre}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calculadora de Masa Molar */}
      <div className={styles.calculadoraPanel}>
        <h2><span aria-hidden="true">🧮</span> Calculadora de Masa Molar</h2>
        <p className={styles.calculadoraDesc}>
          Ingresa una fórmula química para calcular su masa molar (ej: H2O, NaCl, C6H12O6)
        </p>

        <div className={styles.calculadoraForm}>
          <input
            type="text"
            value={formulaMolar}
            onChange={(e) => setFormulaMolar(e.target.value)}
            placeholder="Ej: H2O, NaCl, C6H12O6"
            className={styles.inputFormula}
            onKeyDown={(e) => e.key === 'Enter' && calcularMasaMolar()}
          />
          <button type="button" onClick={calcularMasaMolar} className={styles.btnPrimary}>
            Calcular
          </button>
        </div>

        {errorMasa && (
          <div className={styles.errorMasa}>{errorMasa}</div>
        )}

        {resultadoMasa && (
          <div className={styles.resultadoMasa}>
            <div className={styles.masaTotal}>
              <span>Masa Molar Total:</span>
              <strong>{formatNumber(resultadoMasa.masa, 4)} g/mol</strong>
            </div>
            <div className={styles.desgloseMasa}>
              <h4>Desglose:</h4>
              <table>
                <thead>
                  <tr>
                    <th>Elemento</th>
                    <th>Cantidad</th>
                    <th>Masa (g/mol)</th>
                  </tr>
                </thead>
                <tbody>
                  {resultadoMasa.desglose.map(({ simbolo, cantidad, masa }) => (
                    <tr key={simbolo}>
                      <td>{simbolo} ({elementosPorSimbolo[simbolo].nombre})</td>
                      <td>×{cantidad}</td>
                      <td>{formatNumber(masa, 4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className={styles.ejemplosFormula}>
          <span>Ejemplos:</span>
          <button type="button" onClick={() => { setFormulaMolar('H2O'); setResultadoMasa(null); }}>H₂O</button>
          <button type="button" onClick={() => { setFormulaMolar('NaCl'); setResultadoMasa(null); }}>NaCl</button>
          <button type="button" onClick={() => { setFormulaMolar('C6H12O6'); setResultadoMasa(null); }}>C₆H₁₂O₆</button>
          <button type="button" onClick={() => { setFormulaMolar('H2SO4'); setResultadoMasa(null); }}>H₂SO₄</button>
          <button type="button" onClick={() => { setFormulaMolar('CaCO3'); setResultadoMasa(null); }}>CaCO₃</button>
          {/* Con paréntesis: es la mitad de las fórmulas de secundaria (hidróxidos, nitratos,
              sulfatos, fosfatos) y hasta el 23/08/2026 la calculadora las daba mal en silencio */}
          <button type="button" onClick={() => { setFormulaMolar('Ca(OH)2'); setResultadoMasa(null); }}>Ca(OH)₂</button>
          <button type="button" onClick={() => { setFormulaMolar('Al2(SO4)3'); setResultadoMasa(null); }}>Al₂(SO₄)₃</button>
        </div>
      </div>

      {/* Modal de Elemento */}
      {elementoSeleccionado && (
        <div className={styles.modalOverlay} onClick={cerrarModal}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-ficha-elemento"
          >
            <button
              type="button"
              ref={cerrarModalRef}
              className={styles.cerrarModal}
              onClick={cerrarModal}
              aria-label={`Cerrar la ficha de ${elementoSeleccionado.nombre}`}
            >
              <span aria-hidden="true">✕</span>
            </button>

            <div className={styles.modalHeader}>
              <div className={`${styles.modalSimbolo} ${styles[elementoSeleccionado.familia]}`}>
                {elementoSeleccionado.simbolo}
              </div>
              <div className={styles.modalInfo}>
                <h2 id="titulo-ficha-elemento">{elementoSeleccionado.nombre}</h2>
                <p>Número atómico: {elementoSeleccionado.numero}</p>
                <p>Masa atómica: {formatNumber(elementoSeleccionado.masa, 3)} u</p>
              </div>
            </div>

            <div className={styles.modalDetalles}>
              <div className={styles.propiedadesGrid}>
                <div className={styles.propiedad}>
                  <strong>Grupo:</strong>
                  <span>{elementoSeleccionado.grupo}</span>
                </div>
                <div className={styles.propiedad}>
                  <strong>Período:</strong>
                  <span>{elementoSeleccionado.periodo}</span>
                </div>
                <div className={styles.propiedad}>
                  <strong>Familia:</strong>
                  <span>{FAMILIAS[elementoSeleccionado.familia]?.nombre || elementoSeleccionado.familia}</span>
                </div>
                <div className={styles.propiedad}>
                  <strong>Estado:</strong>
                  <span>{ESTADOS[elementoSeleccionado.estado] || elementoSeleccionado.estado}</span>
                </div>
                <div className={styles.propiedad}>
                  <strong>Radio atómico:</strong>
                  <span>{elementoSeleccionado.radioAtomico ? `${elementoSeleccionado.radioAtomico} pm` : 'N/D'}</span>
                </div>
                <div className={styles.propiedad}>
                  <strong>Electronegatividad:</strong>
                  <span>{elementoSeleccionado.electronegatividad ? formatNumber(elementoSeleccionado.electronegatividad, 2) : 'N/D'}</span>
                </div>
              </div>

              <div className={styles.configuracion}>
                <strong>Configuración electrónica:</strong>
                <code>{elementoSeleccionado.configuracionElectronica}</code>
              </div>

              <div className={styles.usosSection}>
                <h3>Usos principales</h3>
                <ul>
                  {elementoSeleccionado.usos.map((uso, idx) => (
                    <li key={idx}>{uso}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.datoCurioso}>
                <h3><span aria-hidden="true">💡</span> Dato curioso</h3>
                <p>{elementoSeleccionado.datoCurioso}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres aprender más sobre la Tabla Periódica?"
        subtitle="Descubre la historia, organización y patrones de los elementos químicos"
      >
        {/* ========== SECCIÓN 1: TABLA COMPARATIVA ========== */}
        <section className={styles.comparativaSection}>
          <h2><span aria-hidden="true">📊</span> Grupos principales de la tabla periódica</h2>
          <p className={styles.comparativaSubtitle}>
            Comparativa de los siete grupos y categorías más importantes: propiedades, electronegatividad, estado, reactividad, usos y elemento representativo
          </p>

          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Grupo</th>
                  <th>Propiedades</th>
                  <th>Electronegatividad</th>
                  <th>Estado a 25°C</th>
                  <th>Reactividad</th>
                  <th>Usos principales</th>
                  <th>Elemento más importante</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Metales alcalinos (Gp1)</strong></td>
                  <td>Blandos, brillantes, muy ligeros, 1 e⁻ de valencia</td>
                  <td>0,7–1,0 (muy baja)</td>
                  <td>Sólido (Li, Na, K...)</td>
                  <td>Muy alta; reaccionan con agua violentamente</td>
                  <td>Baterías (Li), salazón (NaCl), jabones (Na), fertilizantes (K)</td>
                  <td>Sodio (Na, Z=11)</td>
                </tr>
                <tr>
                  <td><strong>Metales alcalinotérreos (Gp2)</strong></td>
                  <td>Más duros que Gp1, 2 e⁻ de valencia</td>
                  <td>0,9–1,3 (baja)</td>
                  <td>Sólido</td>
                  <td>Alta; menos que Gp1</td>
                  <td>Construcción (Ca en cemento), huesos (Ca), pirotecnia (Mg, Ba)</td>
                  <td>Calcio (Ca, Z=20)</td>
                </tr>
                <tr>
                  <td><strong>Halógenos (Gp17)</strong></td>
                  <td>No metales, 7 e⁻ de valencia, muy oxidantes</td>
                  <td>2,2–3,98 (muy alta)</td>
                  <td>Gas (F₂, Cl₂), líquido (Br₂), sólido (I₂)</td>
                  <td>Muy alta; forman sales con metales</td>
                  <td>Desinfección (Cl), pasta de dientes (F), radiología (I), farmacia</td>
                  <td>Cloro (Cl, Z=17)</td>
                </tr>
                <tr>
                  <td><strong>Gases nobles (Gp18)</strong></td>
                  <td>Capa completa, monoatómicos, inertes</td>
                  <td>No aplicable</td>
                  <td>Gas</td>
                  <td>Prácticamente nula</td>
                  <td>Iluminación (Ne, Ar), globos/dirigibles (He), láseres (Kr, Xe)</td>
                  <td>Argón (Ar, Z=18)</td>
                </tr>
                <tr>
                  <td><strong>Metales de transición (Gp3-12)</strong></td>
                  <td>Orbitales d parcialmente llenos, varios estados de oxidación</td>
                  <td>1,3–2,5 (variable)</td>
                  <td>Sólido (excepto Hg, líquido)</td>
                  <td>Variable; forman complejos de coordinación</td>
                  <td>Acero (Fe), cables (Cu), joyería (Au, Ag), catalizadores (Pt, Ni)</td>
                  <td>Hierro (Fe, Z=26)</td>
                </tr>
                <tr>
                  <td><strong>No metales</strong></td>
                  <td>Aislantes o semiconductores, frágiles, ganan e⁻</td>
                  <td>2,0–3,44 (alta)</td>
                  <td>Gas (O, N, H), sólido (C, S, P)</td>
                  <td>Variable; O y F muy reactivos; N poco</td>
                  <td>Vida (C, H, O, N), fertilizantes (P, N), combustibles (H, C)</td>
                  <td>Carbono (C, Z=6)</td>
                </tr>
                <tr>
                  <td><strong>Metaloides</strong></td>
                  <td>Propiedades intermedias metal/no metal, semiconductores</td>
                  <td>1,9–2,2 (media)</td>
                  <td>Sólido</td>
                  <td>Moderada; depende del compuesto</td>
                  <td>Semiconductores (Si, Ge), fibra óptica (Si), acero inox. (As)</td>
                  <td>Silicio (Si, Z=14)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========== SECCIÓN 2: ESCENARIOS ========== */}
        <section className={styles.escenariosSection}>
          <h2><span aria-hidden="true">🎭</span> Escenarios: La tabla periódica en contextos profesionales</h2>
          <p className={styles.escenariosSubtitle}>
            Casos reales de cómo diferentes profesionales aplican el conocimiento de la tabla periódica
          </p>

          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🧑‍🔬</span>
                <h3>Estudiante de química (preuniversitario)</h3>
              </div>
              <p className={styles.escenarioDesc}>
                La configuración electrónica del Fe (Z=26) determina sus 2 estados de oxidación (+2 y +3). [Ar] 3d⁶ 4s² pierde primero 4s, luego 3d. Pregunta típica en exámenes preuniversitarios, tanto en bachillerato (España) como en preparatoria, secundaria o educación media (Latinoamérica).
              </p>
              <div className={styles.escenarioTip}>
                <strong>Tip:</strong> Los metales de transición tienen configuraciones electrónicas irregulares: Cr([Ar]3d⁵4s¹) y Cu([Ar]3d¹⁰4s¹) por estabilidad de semilleno y lleno.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💊</span>
                <h3>Farmacéutico/bioquímico</h3>
              </div>
              <p className={styles.escenarioDesc}>
                El litio (Li, Z=3) trata el trastorno bipolar inhibiendo señales de inositol. El platino (Pt, Z=78) en cisplatino forma enlaces covalentes con el ADN del tumor. La química de la vida depende de la tabla periódica.
              </p>
              <div className={styles.escenarioTip}>
                <strong>Tip:</strong> Elementos del bloque d (metales de transición) son fundamentales en enzimas (Fe en hemoglobina, Zn en ADN polimerasa, Cu en citocromo oxidasa).
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏗️</span>
                <h3>Ingeniero de materiales</h3>
              </div>
              <p className={styles.escenarioDesc}>
                Titanio (Ti, Z=22): densidad 4,51 g/cm³ (60% del acero), módulo elástico 116 GPa, biocompatible. Ideal para implantes y aeronáutica. Níquel (Ni) en superaleaciones para turbinas de avión: resiste 1.100°C.
              </p>
              <div className={styles.escenarioTip}>
                <strong>Tip:</strong> La tabla periódica predice propiedades: elementos del mismo período tienen tendencias sistemáticas de resistencia, punto de fusión y electronegatividad.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>⚛️</span>
                <h3>Físico nuclear</h3>
              </div>
              <p className={styles.escenarioDesc}>
                Uranio-235 (Z=92): fisión nuclear libera 202 MeV/átomo. 1kg U-235 = energía equivalente a 3.000 toneladas de carbón. Elementos con Z&gt;92 son sintéticos (transuránidos), todos radiactivos.
              </p>
              <div className={styles.escenarioTip}>
                <strong>Tip:</strong> Los isótopos de un mismo elemento tienen propiedades químicas casi idénticas (mismo número de electrones) pero masas y estabilidades nucleares muy distintas.
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 3: FAQ ========== */}
        <section className={styles.faqSection}>
          <h2><span aria-hidden="true">❓</span> Preguntas frecuentes sobre la tabla periódica</h2>

          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Por qué la electronegatividad aumenta hacia la derecha y arriba en la tabla?</h3>
              <p className={styles.faqAnswer}>
                Hacia la derecha: más protones en el núcleo atraen más los electrones sin aumentar el apantallamiento (mismo período). Hacia arriba: electrones más cerca del núcleo, menor apantallamiento. El flúor (F) es el más electronegativo: 3,98 en escala Pauling.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Qué son los elementos del bloque f (lantánidos y actínidos)?</h3>
              <p className={styles.faqAnswer}>
                Los 15 lantánidos (Z=57-71) tienen configuración [Xe]4f<sup>n</sup> 6s². Muy similares entre sí —la capa que se llena es interna, así que apenas cambia el comportamiento químico—, difíciles de separar. Solo La, Ce, Gd y Lu llevan además un electrón 5d¹. Usados en imanes de neodimio, LEDs, catalizadores. Los actínidos (Z=89-103) incluyen uranio y plutonio, casi todos radiactivos.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Por qué el helio no reacciona con nada?</h3>
              <p className={styles.faqAnswer}>
                Configuración electrónica 1s² — capa completa. Energía de ionización 24,6 eV, la más alta de todos los elementos. Para ionizarlo necesitas UV de alta energía. El costo energético de cualquier reacción supera el beneficio: termodinámicamente imposible en condiciones normales.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Cómo se numeran los grupos actualmente?</h3>
              <p className={styles.faqAnswer}>
                IUPAC usa 1-18 en árabe. El sistema antiguo diferenciaba A y B: Grupo IA = Grupo 1, Grupo VIA = Grupo 16, Grupo VIIB = Grupo 7. El sistema de 1-18 evita la confusión entre la numeración europea (IA-VIIIA/IB-VIIIB) y la americana.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Por qué el hidrógeno está en el Grupo 1 si no es un metal alcalino?</h3>
              <p className={styles.faqAnswer}>
                Porque tiene un electrón de valencia en 1s¹, como los alcalinos. Pero no comparte sus propiedades: es gas no metal a condiciones normales, electronegatividad 2,20. A veces se coloca también sobre los halógenos (Gp17) por su tendencia a ganar un electrón (H⁻ hidruro).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Qué es el número de masa y cómo se relaciona con los isótopos?</h3>
              <p className={styles.faqAnswer}>
                Número de masa A = protones + neutrones. Un elemento tiene Z protones fijo, pero puede tener distintos números de neutrones → isótopos. C-12 (6p+6n), C-13 (6p+7n), C-14 (6p+8n, radiactivo). La masa atómica de la tabla es el promedio ponderado de los isótopos naturales.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Qué elementos son esenciales para la vida?</h3>
              <p className={styles.faqAnswer}>
                Los 6 CHNOPS (Carbono, Hidrógeno, Nitrógeno, Oxígeno, Fósforo, Azufre) forman el 98% de la materia viva. Más oligoelementos: Ca, Mg, Na, K, Cl, Fe, Zn, Cu, Mn, I, Se, Mo, Co. El hierro en hemoglobina transporta O₂, el zinc en enzimas cataliza más de 300 reacciones.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Cómo predijo Mendeleev elementos desconocidos?</h3>
              <p className={styles.faqAnswer}>
                Ordenó por masa atómica creciente y encontró que las propiedades se repetían periódicamente. Dejó huecos para elementos que faltaban. Predijo con exactitud el galio (1871), escandio y germanio antes de su descubrimiento. La predicción del eka-silicio (Ge) fue exacta hasta la densidad (5,5 g/cm³ predicho vs 5,35 real).
              </p>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 4: GUÍA PASO A PASO ========== */}
        <section className={styles.guiaSection}>
          <h2><span aria-hidden="true">📋</span> Guía paso a paso: determinar propiedades de un elemento por su posición</h2>
          <p className={styles.guiaSubtitle}>
            7 pasos para deducir electronegatividad, radio atómico, reactividad y configuración electrónica
          </p>

          <div className={styles.stepsContainer}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Localizar el elemento</h3>
                <p>
                  Busca el número atómico Z. El período (fila) indica cuántas capas electrónicas tiene (período 3 → 3 capas). El grupo indica los electrones de valencia.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Determinar el bloque</h3>
                <p>
                  Grupos 1-2: bloque s (1-2 e⁻ de valencia). Grupos 3-12: bloque d (metales de transición). Grupos 13-18: bloque p. Lantánidos/Actínidos: bloque f.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Escribir la configuración electrónica</h3>
                <p>
                  Sigue la regla de Aufbau: 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p... Recuerda excepciones: Cr y Cu (semilleno y lleno son más estables).
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Predecir electronegatividad</h3>
                <p>
                  Aumenta → y ↑ en la tabla. F es el máximo (3,98). Los metales alcalinos son los más bajos (~0,7-1,0).
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h3>Predecir el radio atómico</h3>
                <p>
                  Disminuye → (más protones sin más capas). Aumenta ↓ (más capas electrónicas). El mayor radio de esta tabla es el Fr (348 pm), seguido del Cs (298 pm); el menor, el He (31 pm). Ojo: hay varias escalas de radio atómico y sus cifras no coinciden, así que compara siempre dentro de la misma.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h3>Predecir la reactividad</h3>
                <p>
                  Metales alcalinos (Gp1): más reactivos cuanto más abajo. Halógenos (Gp17): más reactivos cuanto más arriba. Los gases nobles son inertes.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h3>Consultar la tabla para confirmar</h3>
                <p>
                  Las predicciones de la tabla son tendencias, no reglas absolutas. Excepciones existen por efectos relativistas (Au, Hg), configuraciones electrónicas especiales y condiciones experimentales.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 5: MEJORES PRÁCTICAS ========== */}
        <section className={styles.tipsSection}>
          <h2><span aria-hidden="true">💡</span> Mejores prácticas para dominar la tabla periódica</h2>

          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>📊</div>
              <h3>Aprende los grupos, no los elementos</h3>
              <p>
                Conocer las propiedades del Grupo 1 te permite predecir el comportamiento de Li, Na, K, Rb, Cs, Fr. Más eficiente que memorizar 118 elementos.
              </p>
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>🎯</div>
              <h3>Metales de transición: la excepción es la regla</h3>
              <p>
                Cr([Ar]3d⁵4s¹) y Cu([Ar]3d¹⁰4s¹) son las excepciones más importantes. Recuérdalas: salen en exámenes preuniversitarios y oposiciones.
              </p>
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>⚗️</div>
              <h3>Usa la electronegatividad para predecir enlaces</h3>
              <p>
                Diferencia &gt;1,7 → enlace iónico. 0,5-1,7 → polar covalente. &lt;0,5 → covalente puro. NaCl: Cl(3,16)-Na(0,93)=2,23 → iónico.
              </p>
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>🔬</div>
              <h3>Energía de ionización para predecir oxidación</h3>
              <p>
                Saltos bruscos en energía de ionización revelan cuántos electrones puede perder un elemento. Na: I₁=496, I₂=4.562 kJ/mol → salto ×9 → solo pierde 1 electrón (Na⁺).
              </p>
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>📚</div>
              <h3>Mnemotecnias para períodos</h3>
              <p>
                Período 2: Li Be B C N O F Ne → &quot;LiBe BorCaNOFNe&quot;. Período 3: Na Mg Al Si P S Cl Ar → &quot;Na Mg Al SiPSClAr&quot;.
              </p>
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>🌡️</div>
              <h3>Punto de fusión: W es el campeón</h3>
              <p>
                Wolframio/Tungsteno (W, Z=74): punto de fusión 3.422°C, el más alto de todos los elementos. Por eso se usa en filamentos de bombillas y electrodos de soldadura TIG.
              </p>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 6: WARNING BOX ========== */}
        <div className={styles.warningBox}>
          <h2><span aria-hidden="true">⚠️</span> Confusiones frecuentes en la tabla periódica</h2>
          <ul className={styles.warningList}>
            <li>
              <strong>Masa atómica ≠ número atómico</strong>: Z=número de protones (define el elemento). A=protones+neutrones (varía en isótopos). La masa atómica de la tabla es el promedio de isótopos naturales.
            </li>
            <li>
              <strong>Grupos 1-18 vs sistema A/B antiguo</strong>: El Grupo 8 IUPAC incluye Fe, Co, Ni. El Grupo VIII antiguo agrupaba nueve elementos en una sola columna: Fe-Co-Ni, Ru-Rh-Pd y Os-Ir-Pt. Verifica siempre qué sistema usa tu tabla.
            </li>
            <li>
              <strong>Electrones de valencia en bloque d</strong>: Los metales de transición tienen 1-2 electrones en 4s pero también usan los 3d. Fe puede ser Fe²⁺ (pierde 4s²) o Fe³⁺ (pierde 4s² + 1 de 3d).
            </li>
            <li>
              <strong>Hidrógeno no es un metal alcalino</strong>: A pesar de estar en Grupo 1, H es un no metal gaseoso. En metales alcalinos, el tamaño y la energía de ionización bajan con Z; en H son atípicos.
            </li>
            <li>
              <strong>Lantánidos y actínidos NO son &apos;aparte&apos;</strong>: Pertenecen a los períodos 6 y 7 respectivamente. Se sacan fuera por conveniencia de espacio, pero el lantano (La, 57) sigue al bario (Ba, 56) en el período 6.
            </li>
            <li>
              <strong>Confundir isótopos con iones</strong>: Isótopos: mismo Z, distinto N → mismas propiedades químicas. Iones: mismo Z, distinto número de electrones → distintas propiedades y carga eléctrica.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('tabla-periodica')} />

      <ShareCard appName="tabla-periodica" />
      <Footer appName="tabla-periodica" />
    </div>
  );
}
