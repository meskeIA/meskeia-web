'use client';

import { useState, useId } from 'react';
import styles from './SimuladorContabilidadBasica.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface LineaAsiento {
  id: string;
  cuenta: string;
  descripcion: string;
  debe: string;
  haber: string;
}

interface Asiento {
  id: string;
  fecha: string;
  concepto: string;
  lineas: LineaAsiento[];
}

interface MovimientoCuenta {
  fecha: string;
  concepto: string;
  debe: number;
  haber: number;
}

interface CuentaMayor {
  nombre: string;
  movimientos: MovimientoCuenta[];
  totalDebe: number;
  totalHaber: number;
  saldo: number;
  naturaleza: 'deudora' | 'acreedora';
}

// ─── Ejemplos precargados ────────────────────────────────────────────────────

const ASIENTOS_EJEMPLO: Omit<Asiento, 'id'>[] = [
  {
    fecha: '2025-01-10',
    concepto: 'Aportación inicial de capital en efectivo',
    lineas: [
      { id: 'e1-1', cuenta: 'Caja', descripcion: 'Dinero en efectivo', debe: '10000', haber: '' },
      { id: 'e1-2', cuenta: 'Capital', descripcion: 'Aportación del propietario', debe: '', haber: '10000' },
    ],
  },
  {
    fecha: '2025-01-15',
    concepto: 'Compra de material de oficina al contado',
    lineas: [
      { id: 'e2-1', cuenta: 'Material de Oficina', descripcion: 'Compra de material', debe: '500', haber: '' },
      { id: 'e2-2', cuenta: 'Caja', descripcion: 'Pago en efectivo', debe: '', haber: '500' },
    ],
  },
  {
    fecha: '2025-01-20',
    concepto: 'Prestación de servicios a un cliente (cobro a crédito)',
    lineas: [
      { id: 'e3-1', cuenta: 'Clientes', descripcion: 'Importe pendiente de cobro', debe: '2000', haber: '' },
      { id: 'e3-2', cuenta: 'Ingresos por Servicios', descripcion: 'Servicio prestado', debe: '', haber: '2000' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function crearLineaVacia(prefijo: string): LineaAsiento {
  return { id: `${prefijo}-${Date.now()}-${Math.random()}`, cuenta: '', descripcion: '', debe: '', haber: '' };
}

function crearAsientoVacio(): Omit<Asiento, 'id'> {
  const p = `nuevo-${Date.now()}`;
  return {
    fecha: new Date().toISOString().split('T')[0],
    concepto: '',
    lineas: [crearLineaVacia(`${p}-l1`), crearLineaVacia(`${p}-l2`)],
  };
}

function totalLineas(lineas: LineaAsiento[], campo: 'debe' | 'haber'): number {
  return lineas.reduce((acc, l) => acc + (parseSpanishNumber(l[campo]) || 0), 0);
}

function calcularMayor(asientos: Asiento[]): Map<string, CuentaMayor> {
  const mapa = new Map<string, CuentaMayor>();

  for (const asiento of asientos) {
    for (const linea of asiento.lineas) {
      const nombre = linea.cuenta.trim();
      if (!nombre) continue;

      const debe = parseSpanishNumber(linea.debe) || 0;
      const haber = parseSpanishNumber(linea.haber) || 0;
      if (debe === 0 && haber === 0) continue;

      if (!mapa.has(nombre)) {
        mapa.set(nombre, { nombre, movimientos: [], totalDebe: 0, totalHaber: 0, saldo: 0, naturaleza: 'deudora' });
      }

      const cuenta = mapa.get(nombre)!;
      cuenta.movimientos.push({ fecha: asiento.fecha, concepto: asiento.concepto, debe, haber });
      cuenta.totalDebe += debe;
      cuenta.totalHaber += haber;
    }
  }

  for (const cuenta of mapa.values()) {
    const saldoNeto = cuenta.totalDebe - cuenta.totalHaber;
    cuenta.saldo = Math.abs(saldoNeto);
    cuenta.naturaleza = saldoNeto >= 0 ? 'deudora' : 'acreedora';
  }

  return mapa;
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function SimuladorContabilidadBasicaPage() {
  const uid = useId();

  const [asientos, setAsientos] = useState<Asiento[]>(() =>
    ASIENTOS_EJEMPLO.map((a, i) => ({ ...a, id: `ejemplo-${i}` }))
  );
  const [tab, setTab] = useState<'diario' | 'mayor'>('diario');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoAsiento, setNuevoAsiento] = useState<Omit<Asiento, 'id'>>(crearAsientoVacio);
  const [errorValidacion, setErrorValidacion] = useState('');

  const mayor = calcularMayor(asientos);

  // ── Gestión del formulario ──────────────────────────────────────────────

  function actualizarCampoAsiento(campo: 'fecha' | 'concepto', valor: string) {
    setNuevoAsiento(prev => ({ ...prev, [campo]: valor }));
  }

  function actualizarLinea(idx: number, campo: keyof LineaAsiento, valor: string) {
    setNuevoAsiento(prev => {
      const lineas = [...prev.lineas];
      lineas[idx] = { ...lineas[idx], [campo]: valor };
      return { ...prev, lineas };
    });
  }

  function añadirLinea() {
    setNuevoAsiento(prev => ({
      ...prev,
      lineas: [...prev.lineas, crearLineaVacia(`linea-${Date.now()}`)],
    }));
  }

  function eliminarLinea(idx: number) {
    setNuevoAsiento(prev => {
      if (prev.lineas.length <= 2) return prev;
      const lineas = prev.lineas.filter((_, i) => i !== idx);
      return { ...prev, lineas };
    });
  }

  function validarYGuardar() {
    setErrorValidacion('');

    if (!nuevoAsiento.fecha) {
      setErrorValidacion('La fecha es obligatoria.');
      return;
    }
    if (!nuevoAsiento.concepto.trim()) {
      setErrorValidacion('El concepto del asiento es obligatorio.');
      return;
    }

    const lineasConDatos = nuevoAsiento.lineas.filter(l => l.cuenta.trim());
    if (lineasConDatos.length < 2) {
      setErrorValidacion('Necesitas al menos dos líneas con cuenta para formar un asiento.');
      return;
    }

    const totalDebe = totalLineas(nuevoAsiento.lineas, 'debe');
    const totalHaber = totalLineas(nuevoAsiento.lineas, 'haber');

    if (Math.abs(totalDebe - totalHaber) > 0.001) {
      setErrorValidacion(
        `El asiento no cuadra: Debe ${formatNumber(totalDebe, 2)} ≠ Haber ${formatNumber(totalHaber, 2)}. La diferencia es ${formatNumber(Math.abs(totalDebe - totalHaber), 2)} €.`
      );
      return;
    }

    setAsientos(prev => [
      ...prev,
      { ...nuevoAsiento, id: `asiento-${Date.now()}` },
    ]);
    setNuevoAsiento(crearAsientoVacio());
    setMostrarFormulario(false);
  }

  function eliminarAsiento(id: string) {
    setAsientos(prev => prev.filter(a => a.id !== id));
  }

  function limpiarTodo() {
    setAsientos([]);
    setMostrarFormulario(false);
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">📒</span> Simulador de Contabilidad Básica</h1>
        <p className={styles.subtitle}>
          Aprende partida doble, registra asientos en el libro diario y visualiza el libro mayor con cuentas T
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="simulador-contabilidad-basica"
        collapsible={false}
      />

      {/* Tabs de navegación */}
      <div className={styles.tabsBar} role="tablist" aria-label="Secciones del simulador">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'diario'}
          className={`${styles.tabBtn} ${tab === 'diario' ? styles.tabActivo : ''}`}
          onClick={() => setTab('diario')}
        >
          <span aria-hidden="true">📋</span> Libro Diario
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'mayor'}
          className={`${styles.tabBtn} ${tab === 'mayor' ? styles.tabActivo : ''}`}
          onClick={() => setTab('mayor')}
        >
          <span aria-hidden="true">📊</span> Libro Mayor
        </button>
      </div>

      {/* ── TAB: LIBRO DIARIO ── */}
      {tab === 'diario' && (
        <section className={styles.panel} aria-label="Libro Diario">

          {/* Asientos registrados */}
          {asientos.length === 0 ? (
            <p className={styles.emptyMsg}>No hay asientos registrados. Añade el primero o carga los ejemplos.</p>
          ) : (
            asientos.map((asiento) => {
              const totDebe = totalLineas(asiento.lineas, 'debe');
              const totHaber = totalLineas(asiento.lineas, 'haber');
              const equilibrado = Math.abs(totDebe - totHaber) < 0.001;
              return (
                <article key={asiento.id} className={styles.asientoCard}>
                  <div className={styles.asientoHeader}>
                    <div>
                      <span className={styles.asientoFecha}>{asiento.fecha}</span>
                      <span className={styles.asientoConcepto}>{asiento.concepto}</span>
                    </div>
                    <button
                      type="button"
                      className={styles.btnEliminar}
                      onClick={() => eliminarAsiento(asiento.id)}
                      aria-label={`Eliminar asiento: ${asiento.concepto}`}
                    >
                      <span aria-hidden="true">✕</span>
                    </button>
                  </div>

                  <table className={styles.asientoTabla} aria-label={`Asiento: ${asiento.concepto}`}>
                    <thead>
                      <tr>
                        <th>Cuenta</th>
                        <th>Descripción</th>
                        <th className={styles.colImporte}>Debe (€)</th>
                        <th className={styles.colImporte}>Haber (€)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asiento.lineas.map((linea) => (
                        <tr key={linea.id}>
                          <td className={linea.haber && !linea.debe ? styles.celdaHaber : ''}>{linea.cuenta}</td>
                          <td>{linea.descripcion}</td>
                          <td className={styles.colImporte}>
                            {linea.debe ? formatNumber(parseSpanishNumber(linea.debe), 2) : ''}
                          </td>
                          <td className={styles.colImporte}>
                            {linea.haber ? formatNumber(parseSpanishNumber(linea.haber), 2) : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className={styles.totalesRow}>
                        <td colSpan={2}>Total</td>
                        <td className={styles.colImporte}>{formatNumber(totDebe, 2)}</td>
                        <td className={styles.colImporte}>{formatNumber(totHaber, 2)}</td>
                      </tr>
                    </tfoot>
                  </table>

                  {!equilibrado && (
                    <p className={styles.alertaDesequilibrio} role="alert">
                      <span aria-hidden="true">⚠️</span> Este asiento no cuadra ({formatNumber(Math.abs(totDebe - totHaber), 2)} € de diferencia)
                    </p>
                  )}
                </article>
              );
            })
          )}

          {/* Formulario nuevo asiento */}
          {mostrarFormulario && (
            <div className={styles.formularioCard}>
              <h2 className={styles.formularioTitulo}>Nuevo asiento contable</h2>

              <div className={styles.formularioFila}>
                <div className={styles.formularioCampo}>
                  <label htmlFor={`${uid}-fecha`} className={styles.label}>Fecha</label>
                  <input
                    id={`${uid}-fecha`}
                    type="date"
                    className={styles.inputTexto}
                    value={nuevoAsiento.fecha}
                    onChange={e => actualizarCampoAsiento('fecha', e.target.value)}
                  />
                </div>
                <div className={`${styles.formularioCampo} ${styles.formularioCampoAncho}`}>
                  <label htmlFor={`${uid}-concepto`} className={styles.label}>Concepto</label>
                  <input
                    id={`${uid}-concepto`}
                    type="text"
                    className={styles.inputTexto}
                    placeholder="Describe la operación..."
                    value={nuevoAsiento.concepto}
                    onChange={e => actualizarCampoAsiento('concepto', e.target.value)}
                  />
                </div>
              </div>

              {/* Líneas del asiento */}
              <div className={styles.lineasHeader}>
                <span className={styles.label}>Líneas del asiento</span>
                <div className={styles.totalesFormulario}>
                  <span>
                    Debe: <strong>{formatNumber(totalLineas(nuevoAsiento.lineas, 'debe'), 2)} €</strong>
                  </span>
                  <span>
                    Haber: <strong>{formatNumber(totalLineas(nuevoAsiento.lineas, 'haber'), 2)} €</strong>
                  </span>
                  {Math.abs(totalLineas(nuevoAsiento.lineas, 'debe') - totalLineas(nuevoAsiento.lineas, 'haber')) < 0.001 &&
                    totalLineas(nuevoAsiento.lineas, 'debe') > 0 && (
                      <span className={styles.equilibradoBadge}><span aria-hidden="true">✓</span> Equilibrado</span>
                    )}
                </div>
              </div>

              <div className={styles.lineasGrid}>
                <div className={styles.lineasGridHeader} aria-hidden="true">
                  <span>Cuenta</span>
                  <span>Descripción</span>
                  <span>Debe (€)</span>
                  <span>Haber (€)</span>
                  <span></span>
                </div>
                {nuevoAsiento.lineas.map((linea, idx) => (
                  <div key={linea.id} className={styles.lineaFila}>
                    <input
                      type="text"
                      className={styles.inputLinea}
                      placeholder="Nombre cuenta"
                      value={linea.cuenta}
                      onChange={e => actualizarLinea(idx, 'cuenta', e.target.value)}
                      aria-label={`Cuenta línea ${idx + 1}`}
                    />
                    <input
                      type="text"
                      className={styles.inputLinea}
                      placeholder="Descripción"
                      value={linea.descripcion}
                      onChange={e => actualizarLinea(idx, 'descripcion', e.target.value)}
                      aria-label={`Descripción línea ${idx + 1}`}
                    />
                    <input
                      type="text"
                      className={`${styles.inputLinea} ${styles.inputImporte}`}
                      placeholder="0,00"
                      inputMode="decimal"
                      value={linea.debe}
                      onChange={e => actualizarLinea(idx, 'debe', e.target.value)}
                      aria-label={`Debe línea ${idx + 1}`}
                    />
                    <input
                      type="text"
                      className={`${styles.inputLinea} ${styles.inputImporte}`}
                      placeholder="0,00"
                      inputMode="decimal"
                      value={linea.haber}
                      onChange={e => actualizarLinea(idx, 'haber', e.target.value)}
                      aria-label={`Haber línea ${idx + 1}`}
                    />
                    <button
                      type="button"
                      className={styles.btnEliminarLinea}
                      onClick={() => eliminarLinea(idx)}
                      disabled={nuevoAsiento.lineas.length <= 2}
                      aria-label={`Eliminar línea ${idx + 1}`}
                    >
                      <span aria-hidden="true">✕</span>
                    </button>
                  </div>
                ))}
              </div>

              <button type="button" className={styles.btnSecundario} onClick={añadirLinea}>
                <span aria-hidden="true">+</span> Añadir línea
              </button>

              {errorValidacion && (
                <div className={styles.errorMsg} role="alert">
                  <span aria-hidden="true">⚠️</span> {errorValidacion}
                </div>
              )}

              <div className={styles.formularioAcciones}>
                <button type="button" className={styles.btnPrimario} onClick={validarYGuardar}>
                  <span aria-hidden="true">✓</span> Guardar asiento
                </button>
                <button
                  type="button"
                  className={styles.btnCancelar}
                  onClick={() => { setMostrarFormulario(false); setErrorValidacion(''); }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className={styles.accionesBar}>
            {!mostrarFormulario && (
              <button type="button" className={styles.btnPrimario} onClick={() => { setMostrarFormulario(true); setErrorValidacion(''); }}>
                <span aria-hidden="true">+</span> Nuevo asiento
              </button>
            )}
            {asientos.length > 0 && (
              <button type="button" className={styles.btnDanger} onClick={limpiarTodo}>
                <span aria-hidden="true">🗑️</span> Limpiar todo
              </button>
            )}
            {asientos.length === 0 && (
              <button
                type="button"
                className={styles.btnSecundario}
                onClick={() =>
                  setAsientos(ASIENTOS_EJEMPLO.map((a, i) => ({ ...a, id: `ejemplo-recargado-${i}` })))
                }
              >
                <span aria-hidden="true">📚</span> Cargar ejemplos
              </button>
            )}
          </div>
        </section>
      )}

      {/* ── TAB: LIBRO MAYOR ── */}
      {tab === 'mayor' && (
        <section className={styles.panel} aria-label="Libro Mayor">
          {mayor.size === 0 ? (
            <p className={styles.emptyMsg}>No hay asientos registrados. Ve al Libro Diario para añadir asientos.</p>
          ) : (
            <div className={styles.mayorGrid}>
              {[...mayor.values()].map((cuenta) => (
                <div key={cuenta.nombre} className={styles.cuentaT}>
                  <div className={styles.cuentaTNombre}>{cuenta.nombre}</div>
                  <div className={styles.cuentaTCuerpo}>
                    {/* Columna Debe */}
                    <div className={styles.cuentaTColumna}>
                      <div className={styles.cuentaTHeaderDebe}>DEBE</div>
                      {cuenta.movimientos
                        .filter(m => m.debe > 0)
                        .map((m, i) => (
                          <div key={i} className={styles.cuentaTLinea}>
                            <span className={styles.cuentaTFecha}>{m.fecha}</span>
                            <span className={styles.cuentaTConcepto} title={m.concepto}>{m.concepto}</span>
                            <span className={styles.cuentaTImporte}>{formatNumber(m.debe, 2)}</span>
                          </div>
                        ))}
                      <div className={styles.cuentaTTotal}>
                        <span>Total</span>
                        <span>{formatNumber(cuenta.totalDebe, 2)}</span>
                      </div>
                    </div>

                    {/* Divisor */}
                    <div className={styles.cuentaTDivisor} aria-hidden="true" />

                    {/* Columna Haber */}
                    <div className={styles.cuentaTColumna}>
                      <div className={styles.cuentaTHeaderHaber}>HABER</div>
                      {cuenta.movimientos
                        .filter(m => m.haber > 0)
                        .map((m, i) => (
                          <div key={i} className={styles.cuentaTLinea}>
                            <span className={styles.cuentaTFecha}>{m.fecha}</span>
                            <span className={styles.cuentaTConcepto} title={m.concepto}>{m.concepto}</span>
                            <span className={styles.cuentaTImporte}>{formatNumber(m.haber, 2)}</span>
                          </div>
                        ))}
                      <div className={styles.cuentaTTotal}>
                        <span>Total</span>
                        <span>{formatNumber(cuenta.totalHaber, 2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Saldo */}
                  <div className={`${styles.cuentaTSaldo} ${cuenta.naturaleza === 'deudora' ? styles.saldoDeudor : styles.saldoAcreedor}`}>
                    Saldo {cuenta.naturaleza}: <strong>{formatNumber(cuenta.saldo, 2)} €</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Sección educativa */}
      <EducationalSection
        title="Fundamentos de contabilidad"
        subtitle="Comprende la partida doble, el libro diario y el libro mayor"
      >
        {/* ── Tabla comparativa ── */}
        <section className={styles.guideSection}>
          <h2>Los tres libros contables básicos</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Libro</th>
                  <th>¿Qué contiene?</th>
                  <th>¿Para qué sirve?</th>
                  <th>Orden</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Diario</strong></td>
                  <td>Todos los asientos contables en orden cronológico</td>
                  <td>Registro histórico de operaciones</td>
                  <td>Cronológico</td>
                </tr>
                <tr>
                  <td><strong>Mayor</strong></td>
                  <td>Movimientos de cada cuenta por separado</td>
                  <td>Ver el estado actual de cada cuenta</td>
                  <td>Por cuenta</td>
                </tr>
                <tr>
                  <td><strong>Balance de sumas y saldos</strong></td>
                  <td>Resumen de todos los totales y saldos</td>
                  <td>Verificar que Debe = Haber en el conjunto</td>
                  <td>Resumen global</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Casos de uso ── */}
        <section className={styles.guideSection}>
          <h2>¿Quién usa esta herramienta?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
              <h3>Estudiante de contabilidad</h3>
              <p>Practica los primeros asientos del ciclo contable: apertura, operaciones corrientes y la lógica de la partida doble antes del examen.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧑‍💼</span>
              <h3>Autónomo o pequeño empresario</h3>
              <p>Comprende los apuntes que hace tu asesoría fiscal: por qué cada gasto genera un cargo y una cuenta de pago en el libro diario.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">📖</span>
              <h3>Curioso sin formación previa</h3>
              <p>Descubre cómo funciona el sistema contable que usan todas las empresas del mundo desde el siglo XV, con ejemplos reales y sencillos.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🏢</span>
              <h3>Responsable administrativo</h3>
              <p>Repasa conceptos antes de revisar informes financieros o preparar documentación para el departamento de contabilidad.</p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Qué significa que una cuenta tiene naturaleza deudora o acreedora?</dt>
              <dd>
                Las cuentas de activo y gasto suelen tener naturaleza <strong>deudora</strong>: aumentan con apuntes al Debe y disminuyen con apuntes al Haber.
                Las cuentas de pasivo, patrimonio neto e ingreso tienen naturaleza <strong>acreedora</strong>: aumentan con apuntes al Haber y disminuyen con apuntes al Debe.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Por qué el Debe siempre tiene que ser igual al Haber?</dt>
              <dd>
                Porque la partida doble refleja que toda operación tiene una causa y un efecto. Si la empresa recibe dinero (activo sube → Debe), es porque alguien lo ha aportado o se ha generado un ingreso (pasivo/patrimonio sube → Haber). El equilibrio es matemáticamente inevitable.
                <span className={styles.faqTip}>Truco: si el asiento no cuadra, alguna línea tiene un importe incorrecto o falta una contrapartida.</span>
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué es una cuenta en T?</dt>
              <dd>
                La representación gráfica en T muestra la cuenta dividida en dos columnas: izquierda (Debe) y derecha (Haber). El saldo es la diferencia entre ambas. Es la forma más visual y clásica de estudiar el libro mayor.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué diferencia hay entre el diario y el mayor?</dt>
              <dd>
                El <strong>diario</strong> registra las operaciones en orden cronológico, una tras otra, con todas las cuentas afectadas en cada asiento. El <strong>mayor</strong> recoge solo los movimientos de cada cuenta por separado, permitiendo ver el acumulado de una cuenta específica (por ejemplo, todo lo que ha entrado y salido de Caja).
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Este simulador sirve para llevar la contabilidad real de una empresa?</dt>
              <dd>
                No: es una herramienta educativa para comprender los principios. La contabilidad oficial de una empresa requiere software homologado, el cumplimiento del Plan General de Contabilidad (PGC) y la supervisión de un profesional (graduado en contabilidad o asesor fiscal).
              </dd>
            </div>
          </dl>
        </section>

        {/* ── Guía paso a paso ── */}
        <section className={styles.guideSection}>
          <h2>Cómo registrar tu primer asiento</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Identifica la operación</strong>
                <p>¿Qué ha ocurrido? Por ejemplo: "He comprado material de oficina por 200 € pagando con tarjeta."</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Determina las cuentas afectadas</strong>
                <p>Toda operación afecta a mínimo dos cuentas. En el ejemplo: "Material de Oficina" (gasto) y "Banco" (disminuye el saldo).</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Decide qué va al Debe y qué va al Haber</strong>
                <p>El gasto aumenta → va al Debe. El banco disminuye → también va al Haber (las cuentas de activo bajan por el Haber).</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Escribe el asiento y verifica el equilibrio</strong>
                <p>Debe: Material de Oficina 200 €. Haber: Banco 200 €. La suma es igual a ambos lados → asiento correcto.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Comprueba el mayor</strong>
                <p>Ve a la pestaña "Libro Mayor" para ver cómo afecta este asiento al saldo de cada cuenta involucrada.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── Tips ── */}
        <section className={styles.guideSection}>
          <h2>Buenas prácticas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗓️</span>
              <p><strong>Registra cronológicamente:</strong> anota los asientos en el orden en que ocurren. El libro diario es un registro histórico y el orden importa.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏷️</span>
              <p><strong>Usa nombres de cuentas consistentes:</strong> "Caja" y "caja" son cuentas distintas en el mayor. Decide una nomenclatura y mantenla.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📝</span>
              <p><strong>Escribe conceptos descriptivos:</strong> no pongas solo "pago" sino "pago factura proveedor nº 123". Facilita la revisión posterior.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <p><strong>Revisa el mayor periódicamente:</strong> los saldos de las cuentas del mayor te dan una instantánea de tu situación financiera en cualquier momento.</p>
            </div>
          </div>
        </section>

        {/* ── Errores frecuentes ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h2>Errores frecuentes al iniciarse en contabilidad</h2>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Confundir Debe con "deuda":</strong> el Debe no significa que debas dinero. Es simplemente la columna izquierda de la cuenta. Su nombre viene del latín "debet" (debe registrarse aquí).</li>
              <li><strong>Olvidar la contrapartida:</strong> si anotas un gasto, siempre debes anotar de dónde salió el dinero (caja, banco, deuda pendiente). Sin contrapartida, el asiento no cuadra.</li>
              <li><strong>Mezclar cuentas de activo y gasto:</strong> "Material de Oficina" puede ser un gasto (si se consume inmediatamente) o un activo (si es inventario). La clasificación depende de la naturaleza de la operación.</li>
              <li><strong>Usar nombres de cuentas distintos para la misma cuenta:</strong> "Banco", "Cuenta Bancaria" y "Banco BBVA" aparecerán como tres cuentas separadas en el mayor. Unifica el nombre.</li>
              <li><strong>Asumir que el mayor está siempre actualizado solo:</strong> el mayor se construye a partir del diario. Si faltan asientos en el diario, el mayor estará incompleto.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-contabilidad-basica')} />
      <ShareCard appName="simulador-contabilidad-basica" />
      <Footer appName="simulador-contabilidad-basica" />
    </div>
  );
}
