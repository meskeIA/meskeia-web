'use client';

import { useState, useMemo } from 'react';
import styles from './TablaPeriodica.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { formatNumber } from '@/lib';
import { elementos, elementosPorSimbolo, FAMILIAS, ESTADOS, Elemento } from './elementos-data';
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
      // Parsear fórmula química: H2O, NaCl, C6H12O6, Ca(OH)2, etc.
      const formula = formulaMolar.trim();
      const elementosEncontrados: { simbolo: string; cantidad: number }[] = [];

      // Regex para capturar elementos y sus cantidades
      // Soporta: H, He, H2, Ca, Ca2, etc.
      const regex = /([A-Z][a-z]?)(\d*)/g;
      let match;

      while ((match = regex.exec(formula)) !== null) {
        const simbolo = match[1];
        const cantidad = match[2] ? parseInt(match[2]) : 1;

        if (!elementosPorSimbolo[simbolo]) {
          setErrorMasa(`Elemento "${simbolo}" no reconocido`);
          return;
        }

        // Buscar si ya existe el elemento
        const existente = elementosEncontrados.find(e => e.simbolo === simbolo);
        if (existente) {
          existente.cantidad += cantidad;
        } else {
          elementosEncontrados.push({ simbolo, cantidad });
        }
      }

      if (elementosEncontrados.length === 0) {
        setErrorMasa('No se encontraron elementos válidos');
        return;
      }

      // Calcular masa total
      let masaTotal = 0;
      const desglose = elementosEncontrados.map(({ simbolo, cantidad }) => {
        const elemento = elementosPorSimbolo[simbolo];
        const masa = elemento.masa * cantidad;
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

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>⚛️ Tabla Periódica Interactiva</h1>
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

          <button onClick={limpiarFiltros} className={styles.btnOutline}>
            🗑️ Limpiar
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
              <div
                key={elemento.numero}
                className={`${styles.elemento} ${styles[elemento.familia]} ${estaFiltrado ? styles.filtrado : ''}`}
                style={{
                  gridColumn: pos.columna,
                  gridRow: pos.fila,
                }}
                onClick={() => !estaFiltrado && setElementoSeleccionado(elemento)}
                title={`${elemento.nombre} (${elemento.simbolo})`}
              >
                <span className={styles.numeroAtomico}>{elemento.numero}</span>
                <span className={styles.simbolo}>{elemento.simbolo}</span>
                <span className={styles.nombre}>{elemento.nombre}</span>
                <span className={styles.masa}>{elemento.masa.toFixed(elemento.masa % 1 === 0 ? 0 : 2)}</span>
              </div>
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
        <h2>🧮 Calculadora de Masa Molar</h2>
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
          <button onClick={calcularMasaMolar} className={styles.btnPrimary}>
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
          <button onClick={() => { setFormulaMolar('H2O'); setResultadoMasa(null); }}>H₂O</button>
          <button onClick={() => { setFormulaMolar('NaCl'); setResultadoMasa(null); }}>NaCl</button>
          <button onClick={() => { setFormulaMolar('C6H12O6'); setResultadoMasa(null); }}>C₆H₁₂O₆</button>
          <button onClick={() => { setFormulaMolar('H2SO4'); setResultadoMasa(null); }}>H₂SO₄</button>
          <button onClick={() => { setFormulaMolar('CaCO3'); setResultadoMasa(null); }}>CaCO₃</button>
        </div>
      </div>

      {/* Modal de Elemento */}
      {elementoSeleccionado && (
        <div className={styles.modalOverlay} onClick={cerrarModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.cerrarModal} onClick={cerrarModal}>✕</button>

            <div className={styles.modalHeader}>
              <div className={`${styles.modalSimbolo} ${styles[elementoSeleccionado.familia]}`}>
                {elementoSeleccionado.simbolo}
              </div>
              <div className={styles.modalInfo}>
                <h2>{elementoSeleccionado.nombre}</h2>
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
                <h3>💡 Dato curioso</h3>
                <p>{elementoSeleccionado.datoCurioso}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido educativo */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre la Tabla Periódica?"
        subtitle="Descubre la historia, organización y patrones de los elementos químicos"
      >
        <section className={styles.guideSection}>
          <h2>Historia de la Tabla Periódica</h2>
          <p className={styles.introParagraph}>
            La tabla periódica fue desarrollada por <strong>Dmitri Mendeléiev</strong> en 1869.
            Organizó los 63 elementos conocidos en ese momento por masa atómica y propiedades químicas,
            incluso prediciendo la existencia de elementos aún no descubiertos.
          </p>

          <div className={styles.conceptGrid}>
            <div className={styles.conceptCard}>
              <h4>📊 Organización</h4>
              <ul>
                <li><strong>Períodos</strong>: Filas horizontales (1-7)</li>
                <li><strong>Grupos</strong>: Columnas verticales (1-18)</li>
                <li><strong>Bloques</strong>: s, p, d, f según orbitales</li>
              </ul>
            </div>

            <div className={styles.conceptCard}>
              <h4>🔬 Familias Principales</h4>
              <ul>
                <li><strong>Alcalinos</strong>: Muy reactivos (Li, Na, K...)</li>
                <li><strong>Halógenos</strong>: Forman sales (F, Cl, Br...)</li>
                <li><strong>Gases nobles</strong>: Inertes (He, Ne, Ar...)</li>
                <li><strong>Transición</strong>: Metales versátiles (Fe, Cu, Zn...)</li>
              </ul>
            </div>

            <div className={styles.conceptCard}>
              <h4>⚡ Tendencias Periódicas</h4>
              <ul>
                <li><strong>Electronegatividad</strong>: Aumenta hacia arriba y derecha</li>
                <li><strong>Radio atómico</strong>: Aumenta hacia abajo e izquierda</li>
                <li><strong>Energía ionización</strong>: Aumenta hacia arriba y derecha</li>
              </ul>
            </div>

            <div className={styles.conceptCard}>
              <h4>🧮 Masa Molar</h4>
              <p>
                La masa molar es la masa de un mol de sustancia, expresada en g/mol.
                Para calcularla, suma las masas atómicas de todos los átomos en la fórmula.
              </p>
              <p><strong>Ejemplo:</strong> H₂O = 2(1,008) + 15,999 = 18,015 g/mol</p>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 1: TABLA COMPARATIVA ========== */}
        <section className={styles.comparativaSection}>
          <h2>📊 Comparativa: Metales vs No Metales vs Metaloides</h2>
          <p className={styles.comparativaSubtitle}>
            Entiende las diferencias clave entre los tres tipos principales de elementos químicos
          </p>

          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>Metales</th>
                  <th>No Metales</th>
                  <th>Metaloides</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Ubicación</strong></td>
                  <td>Izquierda y centro de la tabla</td>
                  <td>Derecha de la tabla</td>
                  <td>Línea diagonal entre metales y no metales</td>
                </tr>
                <tr>
                  <td><strong>Brillo</strong></td>
                  <td>Metálico (brillantes al pulirse)</td>
                  <td>Mate (sin brillo)</td>
                  <td>Variable (algunos brillan, otros no)</td>
                </tr>
                <tr>
                  <td><strong>Conductividad eléctrica</strong></td>
                  <td>Excelente (buenos conductores)</td>
                  <td>Muy baja (aislantes)</td>
                  <td>Intermedia (semiconductores)</td>
                </tr>
                <tr>
                  <td><strong>Conductividad térmica</strong></td>
                  <td>Alta (conducen bien el calor)</td>
                  <td>Baja (aislantes térmicos)</td>
                  <td>Intermedia</td>
                </tr>
                <tr>
                  <td><strong>Maleabilidad</strong></td>
                  <td>Alta (se pueden laminar)</td>
                  <td>Quebradizos (se rompen fácilmente)</td>
                  <td>Variable (algunos son frágiles)</td>
                </tr>
                <tr>
                  <td><strong>Ductilidad</strong></td>
                  <td>Alta (se pueden estirar en hilos)</td>
                  <td>No son dúctiles</td>
                  <td>Baja o nula</td>
                </tr>
                <tr>
                  <td><strong>Estado a 25°C</strong></td>
                  <td>Sólidos (excepto Hg que es líquido)</td>
                  <td>Gases o sólidos (solo Br es líquido)</td>
                  <td>Sólidos</td>
                </tr>
                <tr>
                  <td><strong>Tendencia iónica</strong></td>
                  <td>Pierden electrones (cationes +)</td>
                  <td>Ganan electrones (aniones -)</td>
                  <td>Variable según compuesto</td>
                </tr>
                <tr>
                  <td><strong>Ejemplos principales</strong></td>
                  <td>Fe, Cu, Au, Ag, Al, Na, K, Ca</td>
                  <td>O, N, C, S, P, Cl, He, Ne</td>
                  <td>Si, Ge, As, Sb, Te, B</td>
                </tr>
                <tr>
                  <td><strong>Aplicaciones típicas</strong></td>
                  <td>Construcción, cables, joyería, monedas</td>
                  <td>Combustibles, fertilizantes, plásticos, gases industriales</td>
                  <td>Semiconductores, paneles solares, electrónica</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========== SECCIÓN 2: CASOS DE USO ========== */}
        <section className={styles.casosSection}>
          <h2>💼 Casos de Uso: Estudiantes Reales Usando la Tabla</h2>
          <p className={styles.casosSubtitle}>
            Descubre cómo diferentes perfiles estudiantiles utilizan la tabla periódica en su día a día
          </p>

          <div className={styles.casosGrid}>
            {/* Caso 1 */}
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>🎓</span>
                <h3>Carla - Bachillerato (Selectividad)</h3>
              </div>
              <div className={styles.casoBody}>
                <p className={styles.casoSituacion}>
                  <strong>Situación:</strong> Preparando examen de química para selectividad, necesita dominar estequiometría y reacciones redox.
                </p>
                <div className={styles.casoUsos}>
                  <p><strong>Cómo usa la tabla:</strong></p>
                  <ul>
                    <li><strong>Calcular masas molares rápido</strong> para problemas de estequiometría (ej: CaCO₃ = 100 g/mol)</li>
                    <li><strong>Identificar estados de oxidación</strong> por grupo (Grupo 1 = +1, Grupo 2 = +2)</li>
                    <li><strong>Predecir reactividad</strong> en reacciones (Cl₂ más reactivo que Br₂)</li>
                    <li><strong>Memorizar configuraciones electrónicas</strong> por bloques (s, p, d, f)</li>
                  </ul>
                </div>
                <p className={styles.casoConclusion}>
                  Carla usa mnemotecnias visuales: "La tabla es mi mapa mental, cada familia tiene un patrón que reconozco al instante".
                </p>
              </div>
            </div>

            {/* Caso 2 */}
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>🧪</span>
                <h3>Miguel - Universidad (Farmacia 2º)</h3>
              </div>
              <div className={styles.casoBody}>
                <p className={styles.casoSituacion}>
                  <strong>Situación:</strong> Estudiando química orgánica y bioquímica, trabaja con fórmulas complejas de medicamentos.
                </p>
                <div className={styles.casoUsos}>
                  <p><strong>Cómo usa la tabla:</strong></p>
                  <ul>
                    <li><strong>Calcular masas moleculares de fármacos</strong> (ej: Ácido acetilsalicílico C₉H₈O₄ = 180 g/mol)</li>
                    <li><strong>Identificar elementos tóxicos vs seguros</strong> (Pb, Hg tóxicos; Na, K esenciales)</li>
                    <li><strong>Entender quelación y coordinación</strong> (metales de transición en hemoglobina)</li>
                    <li><strong>Analizar electronegatividad</strong> para predecir polaridad de enlaces</li>
                  </ul>
                </div>
                <p className={styles.casoConclusion}>
                  Miguel: "La tabla es mi referencia diaria. Cada elemento tiene una 'personalidad' química que afecta cómo interactúa con otros."
                </p>
              </div>
            </div>

            {/* Caso 3 */}
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>📖</span>
                <h3>Lucía - ESO (4º Secundaria)</h3>
              </div>
              <div className={styles.casoBody}>
                <p className={styles.casoSituacion}>
                  <strong>Situación:</strong> Primer contacto serio con química, necesita entender conceptos básicos para aprobar.
                </p>
                <div className={styles.casoUsos}>
                  <p><strong>Cómo usa la tabla:</strong></p>
                  <ul>
                    <li><strong>Identificar símbolos y nombres</strong> (Na = sodio, Fe = hierro)</li>
                    <li><strong>Entender número atómico vs masa atómica</strong> (Z vs A)</li>
                    <li><strong>Reconocer familias por columnas</strong> (Grupo 18 = gases nobles inertes)</li>
                    <li><strong>Calcular masas molares simples</strong> (NaCl = 58,5 g/mol para ejercicios)</li>
                  </ul>
                </div>
                <p className={styles.casoConclusion}>
                  Lucía: "Al principio me pareció un caos, pero ahora veo que está perfectamente organizada. Es como un 'mapa del tesoro' de los elementos."
                </p>
              </div>
            </div>

            {/* Caso 4 */}
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>👨‍🏫</span>
                <h3>Profesor Andrés - Docente Química</h3>
              </div>
              <div className={styles.casoBody}>
                <p className={styles.casoSituacion}>
                  <strong>Situación:</strong> Preparando clases y ejercicios para 30 alumnos de bachillerato con niveles diferentes.
                </p>
                <div className={styles.casoUsos}>
                  <p><strong>Cómo usa la tabla:</strong></p>
                  <ul>
                    <li><strong>Diseñar ejercicios progresivos</strong> (de elementos simples a compuestos complejos)</li>
                    <li><strong>Explicar tendencias periódicas visualmente</strong> (aumenta/disminuye con flechas)</li>
                    <li><strong>Generar problemas de estequiometría</strong> con elementos conocidos (Cu, Fe, O, C)</li>
                    <li><strong>Enseñar historia de la ciencia</strong> (predicciones de Mendeléiev que se cumplieron)</li>
                  </ul>
                </div>
                <p className={styles.casoConclusion}>
                  Andrés: "La tabla periódica es la herramienta didáctica más completa de la química. Todo empieza y termina aquí."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 3: FAQ AMPLIADO ========== */}
        <section className={styles.faqSection}>
          <h2>❓ Preguntas Frecuentes sobre la Tabla Periódica</h2>

          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Cómo memorizar la tabla periódica fácilmente?</h3>
              <p className={styles.faqAnswer}>
                No necesitas memorizar los 118 elementos. Enfócate en lo esencial:
              </p>
              <ul className={styles.faqList}>
                <li><strong>Primeros 20 elementos (H-Ca):</strong> Son los más frecuentes en exámenes y vida real</li>
                <li><strong>Mnemotecnias por filas:</strong> "HeLio BErilio Boro Carbono Nitrógeno Oxígeno Flúor Neón" → "He Be B C N O F Ne"</li>
                <li><strong>Familias clave:</strong> Alcalinos (Grupo 1), Halógenos (Grupo 17), Gases nobles (Grupo 18)</li>
                <li><strong>Elementos de transición comunes:</strong> Fe, Cu, Zn, Ag, Au (joyería/industria)</li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>Truco pro:</strong> Crea historias visuales. "El Sodio (Na) nada en el agua y explota" ayuda a recordar su reactividad.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Por qué algunos elementos tienen masa atómica decimal?</h3>
              <p className={styles.faqAnswer}>
                Las masas atómicas son <strong>promedios ponderados</strong> de los isótopos naturales del elemento.
              </p>
              <p className={styles.faqAnswer}>
                <strong>Ejemplo del Cloro (Cl = 35,45 u):</strong>
              </p>
              <ul className={styles.faqList}>
                <li><strong>Cl-35:</strong> 75% en la naturaleza (masa 35 u)</li>
                <li><strong>Cl-37:</strong> 25% en la naturaleza (masa 37 u)</li>
                <li><strong>Promedio:</strong> (35 × 0,75) + (37 × 0,25) = 35,5 u (redondeado a 35,45)</li>
              </ul>
              <p className={styles.faqAnswer}>
                Por eso no son números enteros. El Carbono (12,01 u) incluye trazas de C-13 además del mayoritario C-12.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Qué significa realmente el número atómico (Z)?</h3>
              <p className={styles.faqAnswer}>
                El número atómico (Z) es el <strong>número de protones</strong> en el núcleo. Es la "identidad" del elemento.
              </p>
              <p className={styles.faqAnswer}>
                <strong>Por qué es fundamental:</strong>
              </p>
              <ul className={styles.faqList}>
                <li><strong>Define el elemento:</strong> Si tiene 6 protones, ES carbono (no puede ser otra cosa)</li>
                <li><strong>Determina electrones:</strong> Átomo neutro tiene igual número de electrones que protones</li>
                <li><strong>Ordena la tabla:</strong> Los elementos están ordenados por Z creciente (1 a 118)</li>
                <li><strong>Predice propiedades:</strong> Mayor Z = más pesado, más electrones, más capas</li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>No confundir:</strong> Número atómico (Z) ≠ Número másico (A). El másico incluye neutrones (A = Z + N).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Cómo predecir si dos elementos reaccionarán?</h3>
              <p className={styles.faqAnswer}>
                Usa estas reglas rápidas basadas en la tabla:
              </p>
              <p className={styles.faqAnswer}>
                <strong>1. Diferencia de electronegatividad:</strong>
              </p>
              <ul className={styles.faqList}>
                <li><strong>Grande (ΔEN {'>'} 1,7):</strong> Enlace iónico (metal + no metal → reacción fuerte). Ej: Na + Cl → NaCl</li>
                <li><strong>Moderada (0,4 {'<'} ΔEN {'<'} 1,7):</strong> Enlace covalente polar. Ej: H + O → H₂O</li>
                <li><strong>Pequeña (ΔEN {'<'} 0,4):</strong> Enlace covalente no polar. Ej: C + C → C-C</li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>2. Regla de los octetos:</strong>
              </p>
              <ul className={styles.faqList}>
                <li>Elementos buscan tener 8 electrones en capa externa (configuración de gas noble)</li>
                <li>Na (1e⁻ externo) + Cl (7e⁻ externos) → ¡Reacción perfecta! Na⁺Cl⁻</li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>Excepción:</strong> Gases nobles (Grupo 18) NO reaccionan (ya tienen 8e⁻).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Qué son los lantánidos y actínidos y por qué están separados?</h3>
              <p className={styles.faqAnswer}>
                Son dos familias de elementos de transición interna (bloques f) que se colocan aparte por <strong>razones prácticas</strong>, no químicas.
              </p>
              <p className={styles.faqAnswer}>
                <strong>Lantánidos (La-Lu, 57-71):</strong>
              </p>
              <ul className={styles.faqList}>
                <li>También llamados "tierras raras" (aunque no son tan raros)</li>
                <li>Usos: imanes potentes (Nd), pantallas LED (Eu, Tb), catalizadores</li>
                <li>Propiedades similares entre sí (difíciles de separar)</li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>Actínidos (Ac-Lr, 89-103):</strong>
              </p>
              <ul className={styles.faqList}>
                <li>Todos son radiactivos (algunos muy inestables)</li>
                <li>Usos: energía nuclear (U, Pu), detectores de humo (Am)</li>
                <li>Elementos transurán{'í'}cos (Z {'>'}92) son sintéticos</li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>Por qué están abajo:</strong> Si los pusiéramos en su posición real, la tabla tendría 32 columnas (muy ancha para imprimir).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Cómo calcular la masa molar de compuestos complejos como Ca(OH)₂?</h3>
              <p className={styles.faqAnswer}>
                Descompón el compuesto y cuenta todos los átomos, incluyendo los del paréntesis multiplicado:
              </p>
              <p className={styles.faqAnswer}>
                <strong>Paso a paso con Ca(OH)₂:</strong>
              </p>
              <ul className={styles.faqList}>
                <li><strong>Paso 1:</strong> Identifica átomos → Ca, O, H</li>
                <li><strong>Paso 2:</strong> Cuenta cantidades → Ca×1, (OH)₂ = O×2, H×2</li>
                <li><strong>Paso 3:</strong> Busca masas en tabla → Ca=40, O=16, H=1</li>
                <li><strong>Paso 4:</strong> Multiplica y suma → (40×1) + (16×2) + (1×2) = 40 + 32 + 2 = <strong>74 g/mol</strong></li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>Truco con paréntesis:</strong> El subíndice fuera multiplica TODO lo de dentro. (OH)₂ = 1O + 1H, todo ×2 = 2O + 2H.
              </p>
              <p className={styles.faqAnswer}>
                <strong>Ejemplo complejo Ca₃(PO₄)₂:</strong> Ca×3, (PO₄)₂ = P×2, O×8 → (40×3) + (31×2) + (16×8) = 310 g/mol
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Por qué el hidrógeno está solo en la tabla?</h3>
              <p className={styles.faqAnswer}>
                El hidrógeno (H) es un elemento único que no encaja perfectamente en ninguna familia:
              </p>
              <p className={styles.faqAnswer}>
                <strong>Razones para ponerlo en Grupo 1 (alcalinos):</strong>
              </p>
              <ul className={styles.faqList}>
                <li>Tiene 1 electrón en su capa externa (como Li, Na, K)</li>
                <li>Forma compuestos H⁺ (como cationes de alcalinos)</li>
                <li>En algunos compuestos actúa como metal (hidruros metálicos)</li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>Razones para ponerlo en Grupo 17 (halógenos):</strong>
              </p>
              <ul className={styles.faqList}>
                <li>Le falta 1 electrón para completar capa (como F, Cl)</li>
                <li>Forma H₂ como molécula diatómica (igual que F₂, Cl₂)</li>
                <li>Puede formar H⁻ (anión hidruro)</li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>Conclusión:</strong> Es tan especial que merece su propia posición. Es el elemento más abundante del universo (75%) y fundamental para la vida (está en agua y todo compuesto orgánico).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>¿Cuántos elementos más se pueden descubrir?</h3>
              <p className={styles.faqAnswer}>
                Teóricamente infinitos, pero prácticamente hay un límite:
              </p>
              <p className={styles.faqAnswer}>
                <strong>Estado actual (2026):</strong>
              </p>
              <ul className={styles.faqList}>
                <li><strong>118 elementos confirmados</strong> (H hasta Og)</li>
                <li><strong>Elementos 119 y 120:</strong> En investigación activa (intentos en Japón, Rusia, EE.UU.)</li>
                <li><strong>"Isla de estabilidad":</strong> Teoría predice que elementos ~120-126 podrían ser más estables</li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>Limitaciones prácticas:</strong>
              </p>
              <ul className={styles.faqList}>
                <li>Elementos superpesados son muy inestables (existen milisegundos)</li>
                <li>Crear átomos requiere colisionadores de partículas gigantes (muy caro)</li>
                <li>A partir de Z≈130-140, fuerzas nucleares ya no pueden mantener el átomo unido</li>
              </ul>
              <p className={styles.faqAnswer}>
                <strong>Predicción:</strong> Probablemente lleguemos hasta elemento 120-130 en próximos 20-30 años, pero más allá es físicamente imposible.
              </p>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 4: GUÍA PASO A PASO ========== */}
        <section className={styles.guiaSection}>
          <h2>📋 Guía: Cómo Usar la Tabla para Problemas de Estequiometría</h2>
          <p className={styles.guiaSubtitle}>
            Domina los 7 pasos para resolver cualquier problema de estequiometría usando la tabla periódica
          </p>

          <div className={styles.stepsContainer}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Escribe la Ecuación Química Balanceada</h3>
                <p>
                  Antes de calcular nada, asegúrate de que la ecuación esté <strong>balanceada</strong>. El número de átomos de cada elemento debe ser igual en reactivos y productos (Ley de conservación de la masa).
                </p>
                <p className={styles.stepExample}>
                  <strong>Ejemplo:</strong> Reacción de combustión del metano<br />
                  ❌ <code>CH₄ + O₂ → CO₂ + H₂O</code> (desbalanceada)<br />
                  ✅ <code>CH₄ + 2O₂ → CO₂ + 2H₂O</code> (balanceada: 1C, 4H, 4O a cada lado)
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Calcula las Masas Molares de Cada Compuesto</h3>
                <p>
                  Usa la tabla periódica para sumar las masas atómicas de todos los átomos en cada molécula. Las masas atómicas están en la tabla (generalmente bajo el símbolo).
                </p>
                <p className={styles.stepExample}>
                  <strong>Ejemplo (CH₄ + 2O₂ → CO₂ + 2H₂O):</strong><br />
                  • CH₄ = 12 + 4(1) = 16 g/mol<br />
                  • O₂ = 2(16) = 32 g/mol<br />
                  • CO₂ = 12 + 2(16) = 44 g/mol<br />
                  • H₂O = 2(1) + 16 = 18 g/mol
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Identifica los Datos Conocidos y lo que Pides</h3>
                <p>
                  Lee el problema y extrae: (1) qué cantidad te dan (masa, moles, moléculas), (2) de qué sustancia, (3) qué te piden calcular. Anota todo claramente.
                </p>
                <p className={styles.stepExample}>
                  <strong>Ejemplo de enunciado:</strong> "Si reaccionan 32 g de metano (CH₄), ¿cuántos gramos de CO₂ se producen?"<br />
                  • <strong>Dato:</strong> 32 g de CH₄<br />
                  • <strong>Incógnita:</strong> ? g de CO₂
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Convierte la Cantidad Dada a Moles</h3>
                <p>
                  Los cálculos estequiométricos trabajan en <strong>moles</strong> (no gramos). Usa la fórmula: <code>moles = masa (g) / masa molar (g/mol)</code>.
                </p>
                <p className={styles.stepExample}>
                  <strong>Ejemplo:</strong><br />
                  moles de CH₄ = 32 g / 16 g/mol = <strong>2 moles de CH₄</strong>
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h3>Usa la Relación Estequiométrica (Coeficientes)</h3>
                <p>
                  Los coeficientes de la ecuación balanceada te dicen la <strong>proporción de moles</strong> entre sustancias. Establece una regla de tres.
                </p>
                <p className={styles.stepExample}>
                  <strong>Ejemplo:</strong><br />
                  Ecuación: <code>1 CH₄ + 2O₂ → 1 CO₂ + 2H₂O</code><br />
                  Relación: <strong>1 mol CH₄ produce 1 mol CO₂</strong><br />
                  Si tenemos 2 moles CH₄ → producirá 2 moles CO₂ (proporción 1:1)
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h3>Convierte Moles de Producto a la Unidad Pedida</h3>
                <p>
                  Ya sabes cuántos moles de producto se forman. Ahora convierte a la unidad que te piden (gramos, litros, moléculas, etc.).
                </p>
                <p className={styles.stepExample}>
                  <strong>Ejemplo:</strong><br />
                  Tenemos 2 moles de CO₂. Queremos gramos:<br />
                  masa CO₂ = 2 moles × 44 g/mol = <strong>88 g de CO₂</strong>
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h3>Verifica el Resultado con Sentido Común</h3>
                <p>
                  Revisa que tu respuesta tenga sentido: (1) ¿Las unidades son correctas? (2) ¿El orden de magnitud es lógico? (3) ¿Se conserva la masa total aproximadamente?
                </p>
                <p className={styles.stepExample}>
                  <strong>Ejemplo de verificación:</strong><br />
                  Entraron 32 g CH₄ + (2×32) g O₂ = 96 g total reactivos<br />
                  Salieron 88 g CO₂ + (2×18) g H₂O = 124 g... ¡Espera! Esto está mal.<br />
                  <strong>Corrección:</strong> No calculamos todo. Si entraron 32g CH₄, necesitamos 2 moles O₂ = 64g O₂.<br />
                  Total reactivos: 32 + 64 = 96g. Productos: 88 + 36 = 124g... seguimos mal.<br />
                  <strong>Error encontrado:</strong> Recalcular O₂ inicial. 2 moles CH₄ × 2 = 4 moles O₂ = 128g O₂ (no 64g).<br />
                  Ahora: 32 + 128 = 160g entrada ≈ 88 + 72 = 160g salida ✓
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 5: TIPS DE ESTUDIO ========== */}
        <section className={styles.tipsSection}>
          <h2>💡 Tips de Estudio para Dominar la Tabla Periódica</h2>

          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>🎯</div>
              <h3>Usa Mnemotecnias Visuales y Auditivas</h3>
              <p>
                Crea frases memorables para recordar secuencias de elementos. <strong>Ejemplo Grupo 1 (Alcalinos):</strong> "Había Llegado Napoleón a Katar Rulando Cesando Francamente" → H, Li, Na, K, Rb, Cs, Fr. Funciona mejor si inventas las tuyas propias (tu cerebro retiene mejor lo que crea). Otra técnica: asocia elementos con objetos visuales (Sodio = agua explosiva, Oro = joyería, Helio = globos).
              </p>
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>🔄</div>
              <h3>Practica con Flashcards Espaciadas</h3>
              <p>
                No intentes memorizarlo todo de golpe. Usa el método de <strong>repetición espaciada</strong>: estudia 10 elementos hoy, repásalos mañana, en 3 días, en 1 semana. Apps como Anki o Quizlet son perfectas. Prioriza los primeros 36 elementos (H-Kr) que cubren el 95% de los ejercicios escolares. Crea flashcards de doble cara: (Anverso) "Símbolo Na" → (Reverso) "Sodio, Grupo 1, Z=11, masa=23, metal alcalino muy reactivo".
              </p>
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>🎨</div>
              <h3>Colorea la Tabla por Familias/Bloques</h3>
              <p>
                Imprime una tabla en blanco y coloréala tú mismo: <strong>Metales alcalinos</strong> (rojo), <strong>Alcalinotérreos</strong> (naranja), <strong>Metales de transición</strong> (amarillo), <strong>No metales</strong> (verde), <strong>Halógenos</strong> (azul), <strong>Gases nobles</strong> (morado). El proceso de colorear activa la memoria motora. Bonus: añade flechas mostrando tendencias (electronegatividad ↑→, radio atómico ↓←). Colgar tu tabla coloreada en tu habitación ayuda a repasarla inconscientemente.
              </p>
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>🧪</div>
              <h3>Relaciona Elementos con Experiencias Reales</h3>
              <p>
                La química abstracta es difícil de recordar. Asocia cada elemento con algo tangible: <strong>Hierro (Fe)</strong> → cuchillos, puentes, Titanic oxidado. <strong>Calcio (Ca)</strong> → huesos, leche, suplementos. <strong>Cloro (Cl)</strong> → lejía, piscinas, olor fuerte. <strong>Helio (He)</strong> → globos de fiestas, voz aguda graciosa. Cuando estudies un elemento, busca en YouTube "usos del [elemento]" o "reacción del [elemento]". Los videos de experimentos químicos hacen que recuerdes mejor.
              </p>
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>📊</div>
              <h3>Aprende Patrones, No Elementos Individuales</h3>
              <p>
                La tabla es un <strong>sistema</strong>, no una lista desordenada. Enfócate en patrones: <strong>Todos los Grupo 1</strong> pierden 1e⁻ fácilmente (cationes +1). <strong>Todos los Grupo 17</strong> ganan 1e⁻ fácilmente (aniones -1). <strong>Todos los Grupo 18</strong> son inertes (configuración completa). <strong>Períodos:</strong> Cada nueva fila añade una capa electrónica. Una vez entiendes estos patrones, "conocer" un elemento es aplicar la regla de su grupo/período. ¡No memorices 118 casos individuales!
              </p>
            </div>

            <div className={styles.tipCard}>
              <div className={styles.tipIcon}>✍️</div>
              <h3>Resuelve Problemas Reales, No Solo Memorices</h3>
              <p>
                La memoria pasiva (leer la tabla) es 10 veces menos efectiva que la memoria activa (usarla). <strong>Practica estequiometría constantemente:</strong> "Si tengo 50g de NaCl, ¿cuántos moles son?" "¿Cuántos gramos de O₂ necesito para quemar 10g de glucosa?" Busca exámenes de selectividad/universidad resueltos. Cada problema que resuelves refuerza tu conocimiento de masas molares, símbolos y reactividad. Objetivo: resolver 3-5 problemas diarios durante 2 semanas = dominio automático.
              </p>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 6: WARNING BOX ========== */}
        <div className={styles.warningBox}>
          <h2>⚠️ Errores Comunes al Usar la Tabla Periódica (Evítalos)</h2>
          <p className={styles.warningIntro}>
            Estos errores han costado puntos en exámenes a miles de estudiantes. Aprende de ellos:
          </p>
          <ul className={styles.warningList}>
            <li>
              <strong>Confundir masa atómica (u) con número atómico (Z)</strong>: El número atómico (arriba, más pequeño) son los protones. La masa atómica (abajo, número más grande) es protones + neutrones aproximadamente. Ejemplo: Carbono tiene Z=6 (6 protones) y masa≈12 u (6 protones + 6 neutrones). Si confundes esto, todos tus cálculos estequiométricos fallarán.
            </li>
            <li>
              <strong>Olvidar multiplicar subíndices en fórmulas con paréntesis</strong>: En Ca(OH)₂, el "2" multiplica TODO lo del paréntesis. NO es Ca + O + H₂. Es Ca + (OH)×2 = Ca + O₂H₂. Error típico en exámenes: calcular masa como 40+16+2=58 (mal) en vez de 40+(16+1)×2=74 (bien). Revisa SIEMPRE paréntesis antes de calcular.
            </li>
            <li>
              <strong>No balancear la ecuación química antes de calcular</strong>: Resolver estequiometría con ecuaciones desbalanceadas da resultados completamente erróneos. SIEMPRE verifica que cada elemento tenga igual número de átomos en ambos lados. Ejemplo: H₂ + O₂ → H₂O está desbalanceada (2O a la izquierda, 1O a la derecha). Correcta: 2H₂ + O₂ → 2H₂O. Si saltas este paso, perderás todo el ejercicio.
            </li>
            <li>
              <strong>Asumir que todos los gases son inertes o que todos los metales son sólidos</strong>: <strong>Excepción gases:</strong> Solo Grupo 18 (He, Ne, Ar...) son inertes. H₂, O₂, N₂, Cl₂ son gases MUY reactivos. <strong>Excepción metales:</strong> El mercurio (Hg) es líquido a temperatura ambiente (único metal líquido). Galio (Ga) se derrite en tu mano (29°C). Asumir "todos los [X] son [Y]" es peligroso en química.
            </li>
            <li>
              <strong>Confundir grupo (columna) con período (fila)</strong>: <strong>Grupos:</strong> Columnas verticales (1-18), determinan propiedades químicas similares. <strong>Períodos:</strong> Filas horizontales (1-7), determinan número de capas electrónicas. Sodio (Na) está en Grupo 1 (alcalinos) y Período 3 (3 capas). Si confundes esto, no podrás predecir reactividad ni configuraciones electrónicas.
            </li>
            <li>
              <strong>Usar masas atómicas redondeadas incorrectamente</strong>: Redondeados comunes: H≈1, C=12, N=14, O=16, Na=23, Cl=35,5, Ca=40. Pero NO redondees demasiado pronto. Si calculas CaCO₃ con Ca=40, C=12, O=16: 40+12+(3×16)=100 g/mol (correcto). Si redondeas mal O a 15: 40+12+45=97 (error del 3%). En exámenes rigurosos, esto resta puntos. Redondea solo al final, no en pasos intermedios.
            </li>
            <li>
              <strong>Ignorar que algunos elementos tienen símbolos "raros" derivados del latín</strong>: <strong>Confusiones típicas:</strong> Sodio = Na (Natrium), Potasio = K (Kalium), Hierro = Fe (Ferrum), Cobre = Cu (Cuprum), Plata = Ag (Argentum), Oro = Au (Aurum), Plomo = Pb (Plumbum), Mercurio = Hg (Hydrargyrum). Si escribes "S" pensando que es Sodio (es Azufre/Sulfur), o "Fe" como Fósforo (es Hierro), el error es crítico. Memoriza estos símbolos "contraintuitivos".
            </li>
            <li>
              <strong>No diferenciar entre número másico (A) y masa atómica promedio</strong>: <strong>Número másico (A):</strong> Entero, protones + neutrones de UN isótopo específico (ej: C-12 tiene A=12). <strong>Masa atómica:</strong> Decimal, promedio ponderado de todos los isótopos naturales (ej: Cloro = 35,45 u porque mezcla Cl-35 y Cl-37). Para cálculos estequiométricos, SIEMPRE usa la masa atómica de la tabla (el decimal), NO el número másico de un isótopo específico.
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
