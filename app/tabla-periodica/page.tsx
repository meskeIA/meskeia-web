'use client';

import { useState, useMemo } from 'react';
import styles from './TablaPeriodica.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps} from '@/components';
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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('tabla-periodica')} />

      <Footer appName="tabla-periodica" />
    </div>
  );
}
