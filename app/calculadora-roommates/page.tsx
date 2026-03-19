'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './CalculadoraRoommates.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection, DisclaimerCard } from '@/components';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
interface Compañero {
  id: string;
  nombre: string;
  color: string;
}

interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  pagadoPor: string; // ID del compañero
  participantes: string[]; // IDs de compañeros que participan
  fecha: string;
  categoria: string;
}

interface Deuda {
  de: string;
  a: string;
  monto: number;
}

// Categorías de gastos
const CATEGORIAS = [
  { id: 'alquiler', nombre: 'Alquiler', icono: '🏠' },
  { id: 'luz', nombre: 'Luz', icono: '💡' },
  { id: 'agua', nombre: 'Agua', icono: '💧' },
  { id: 'gas', nombre: 'Gas', icono: '🔥' },
  { id: 'internet', nombre: 'Internet', icono: '📶' },
  { id: 'compra', nombre: 'Compra común', icono: '🛒' },
  { id: 'limpieza', nombre: 'Limpieza', icono: '🧹' },
  { id: 'otros', nombre: 'Otros', icono: '📦' },
];

// Colores para compañeros
const COLORES_DISPONIBLES = [
  '#2E86AB', '#48A9A6', '#E91E63', '#FF9800', '#9C27B0',
  '#4CAF50', '#F44336', '#3F51B5', '#795548', '#607D8B',
];

const STORAGE_KEY = 'meskeia_roommates';

export default function CalculadoraRoommatesPage() {
  // Estado principal
  const [compañeros, setCompañeros] = useState<Compañero[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);

  // Estado del modal
  const [modalCompañero, setModalCompañero] = useState(false);
  const [modalGasto, setModalGasto] = useState(false);
  const [editandoGasto, setEditandoGasto] = useState<Gasto | null>(null);

  // Estado del formulario de compañero
  const [nuevoNombre, setNuevoNombre] = useState('');

  // Estado del formulario de gasto
  const [gastoDescripcion, setGastoDescripcion] = useState('');
  const [gastoMonto, setGastoMonto] = useState('');
  const [gastoPagadoPor, setGastoPagadoPor] = useState('');
  const [gastoParticipantes, setGastoParticipantes] = useState<string[]>([]);
  const [gastoCategoria, setGastoCategoria] = useState('compra');

  // Cargar datos de localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.compañeros) setCompañeros(data.compañeros);
        if (data.gastos) setGastos(data.gastos);
      } catch {
        console.error('Error al cargar datos guardados');
      }
    }
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    if (compañeros.length > 0 || gastos.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ compañeros, gastos }));
    }
  }, [compañeros, gastos]);

  // Calcular balances y deudas
  const { balances, deudas, totalGastos } = useMemo(() => {
    const balanceMap: Record<string, number> = {};
    let total = 0;

    // Inicializar balances
    compañeros.forEach(c => {
      balanceMap[c.id] = 0;
    });

    // Calcular balances
    gastos.forEach(gasto => {
      total += gasto.monto;
      const participantesActivos = gasto.participantes.filter(p =>
        compañeros.some(c => c.id === p)
      );

      if (participantesActivos.length === 0) return;

      const montoPorPersona = gasto.monto / participantesActivos.length;

      // El que pagó suma
      if (balanceMap[gasto.pagadoPor] !== undefined) {
        balanceMap[gasto.pagadoPor] += gasto.monto;
      }

      // Los participantes restan
      participantesActivos.forEach(p => {
        if (balanceMap[p] !== undefined) {
          balanceMap[p] -= montoPorPersona;
        }
      });
    });

    // Convertir a array de balances
    const balancesArray = compañeros.map(c => ({
      id: c.id,
      nombre: c.nombre,
      color: c.color,
      balance: balanceMap[c.id] || 0,
    }));

    // Calcular deudas simplificadas
    const deudasArray: Deuda[] = [];
    const deudores = balancesArray.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);
    const acreedores = balancesArray.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);

    let i = 0;
    let j = 0;

    while (i < deudores.length && j < acreedores.length) {
      const deudor = deudores[i];
      const acreedor = acreedores[j];
      const montoDeuda = Math.min(Math.abs(deudor.balance), acreedor.balance);

      if (montoDeuda > 0.01) {
        deudasArray.push({
          de: deudor.id,
          a: acreedor.id,
          monto: montoDeuda,
        });
      }

      deudor.balance += montoDeuda;
      acreedor.balance -= montoDeuda;

      if (Math.abs(deudor.balance) < 0.01) i++;
      if (acreedor.balance < 0.01) j++;
    }

    return { balances: balancesArray, deudas: deudasArray, totalGastos: total };
  }, [compañeros, gastos]);

  // Funciones de compañeros
  const agregarCompañero = () => {
    if (!nuevoNombre.trim()) return;

    const colorUsados = compañeros.map(c => c.color);
    const colorDisponible = COLORES_DISPONIBLES.find(c => !colorUsados.includes(c)) || COLORES_DISPONIBLES[0];

    const nuevo: Compañero = {
      id: Date.now().toString(),
      nombre: nuevoNombre.trim(),
      color: colorDisponible,
    };

    setCompañeros([...compañeros, nuevo]);
    setNuevoNombre('');
    setModalCompañero(false);
  };

  const eliminarCompañero = (id: string) => {
    if (confirm('¿Eliminar este compañero? Se eliminarán también sus gastos.')) {
      setCompañeros(compañeros.filter(c => c.id !== id));
      setGastos(gastos.filter(g => g.pagadoPor !== id));
    }
  };

  // Funciones de gastos
  const abrirModalGasto = (gasto?: Gasto) => {
    if (gasto) {
      setEditandoGasto(gasto);
      setGastoDescripcion(gasto.descripcion);
      setGastoMonto(gasto.monto.toString());
      setGastoPagadoPor(gasto.pagadoPor);
      setGastoParticipantes(gasto.participantes);
      setGastoCategoria(gasto.categoria);
    } else {
      setEditandoGasto(null);
      setGastoDescripcion('');
      setGastoMonto('');
      setGastoPagadoPor(compañeros[0]?.id || '');
      setGastoParticipantes(compañeros.map(c => c.id));
      setGastoCategoria('compra');
    }
    setModalGasto(true);
  };

  const guardarGasto = () => {
    const monto = parseFloat(gastoMonto.replace(',', '.'));
    if (!gastoDescripcion.trim() || isNaN(monto) || monto <= 0 || !gastoPagadoPor || gastoParticipantes.length === 0) {
      return;
    }

    if (editandoGasto) {
      setGastos(gastos.map(g =>
        g.id === editandoGasto.id
          ? { ...g, descripcion: gastoDescripcion, monto, pagadoPor: gastoPagadoPor, participantes: gastoParticipantes, categoria: gastoCategoria }
          : g
      ));
    } else {
      const nuevo: Gasto = {
        id: Date.now().toString(),
        descripcion: gastoDescripcion.trim(),
        monto,
        pagadoPor: gastoPagadoPor,
        participantes: gastoParticipantes,
        fecha: new Date().toISOString().split('T')[0],
        categoria: gastoCategoria,
      };
      setGastos([nuevo, ...gastos]);
    }

    setModalGasto(false);
  };

  const eliminarGasto = (id: string) => {
    if (confirm('¿Eliminar este gasto?')) {
      setGastos(gastos.filter(g => g.id !== id));
    }
  };

  const toggleParticipante = (id: string) => {
    if (gastoParticipantes.includes(id)) {
      setGastoParticipantes(gastoParticipantes.filter(p => p !== id));
    } else {
      setGastoParticipantes([...gastoParticipantes, id]);
    }
  };

  // Obtener nombre de compañero
  const getNombre = (id: string) => compañeros.find(c => c.id === id)?.nombre || 'Desconocido';
  const getColor = (id: string) => compañeros.find(c => c.id === id)?.color || '#999';
  const getCategoria = (id: string) => CATEGORIAS.find(c => c.id === id);

  // Limpiar todo
  const limpiarTodo = () => {
    if (confirm('¿Eliminar todos los datos? Esta acción no se puede deshacer.')) {
      setCompañeros([]);
      setGastos([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🏠 Calculadora Roommates</h1>
        <p className={styles.subtitle}>Divide los gastos del piso de forma justa</p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="calculadora-roommates"
        collapsible={false}
      />

      <div className={styles.mainContent}>
        {/* Panel de compañeros */}
        <div className={styles.compañerosPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.sectionTitle}>👥 Compañeros de piso</h2>
            <button type="button" onClick={() => setModalCompañero(true)} className={styles.btnAgregar}>
              + Añadir
            </button>
          </div>

          {compañeros.length === 0 ? (
            <p className={styles.sinDatos}>Añade a los compañeros de piso para empezar</p>
          ) : (
            <div className={styles.compañerosList}>
              {compañeros.map(c => {
                const balance = balances.find(b => b.id === c.id)?.balance || 0;
                return (
                  <div key={c.id} className={styles.compañeroItem}>
                    <div className={styles.compañeroAvatar} style={{ backgroundColor: c.color }}>
                      {c.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.compañeroInfo}>
                      <span className={styles.compañeroNombre}>{c.nombre}</span>
                      <span className={`${styles.compañeroBalance} ${balance >= 0 ? styles.positivo : styles.negativo}`}>
                        {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminarCompañero(c.id)}
                      className={styles.btnEliminar}
                      title="Eliminar compañero"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel de resumen */}
        {compañeros.length > 0 && (
          <div className={styles.resumenPanel}>
            <h2 className={styles.sectionTitle}>📊 Resumen</h2>
            <div className={styles.resumenGrid}>
              <div className={styles.resumenCard}>
                <span className={styles.resumenLabel}>Total gastos</span>
                <span className={styles.resumenValor}>{formatCurrency(totalGastos)}</span>
              </div>
              <div className={styles.resumenCard}>
                <span className={styles.resumenLabel}>Por persona (media)</span>
                <span className={styles.resumenValor}>
                  {formatCurrency(compañeros.length > 0 ? totalGastos / compañeros.length : 0)}
                </span>
              </div>
              <div className={styles.resumenCard}>
                <span className={styles.resumenLabel}>Nº gastos</span>
                <span className={styles.resumenValor}>{gastos.length}</span>
              </div>
              <div className={styles.resumenCard}>
                <span className={styles.resumenLabel}>Compañeros</span>
                <span className={styles.resumenValor}>{compañeros.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Panel de deudas */}
        {deudas.length > 0 && (
          <div className={styles.deudasPanel}>
            <h2 className={styles.sectionTitle}>💸 Quién debe a quién</h2>
            <div className={styles.deudasList}>
              {deudas.map((deuda, idx) => (
                <div key={idx} className={styles.deudaItem}>
                  <div className={styles.deudaPersona}>
                    <div className={styles.deudaAvatar} style={{ backgroundColor: getColor(deuda.de) }}>
                      {getNombre(deuda.de).charAt(0)}
                    </div>
                    <span>{getNombre(deuda.de)}</span>
                  </div>
                  <div className={styles.deudaFlecha}>
                    <span className={styles.deudaMonto}>{formatCurrency(deuda.monto)}</span>
                    <span>→</span>
                  </div>
                  <div className={styles.deudaPersona}>
                    <div className={styles.deudaAvatar} style={{ backgroundColor: getColor(deuda.a) }}>
                      {getNombre(deuda.a).charAt(0)}
                    </div>
                    <span>{getNombre(deuda.a)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panel de gastos */}
        <div className={styles.gastosPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.sectionTitle}>📝 Gastos</h2>
            {compañeros.length > 0 && (
              <button type="button" onClick={() => abrirModalGasto()} className={styles.btnAgregar}>
                + Nuevo gasto
              </button>
            )}
          </div>

          {gastos.length === 0 ? (
            <p className={styles.sinDatos}>
              {compañeros.length === 0
                ? 'Primero añade a los compañeros de piso'
                : 'Añade el primer gasto compartido'}
            </p>
          ) : (
            <div className={styles.gastosList}>
              {gastos.map(gasto => {
                const categoria = getCategoria(gasto.categoria);
                return (
                  <div key={gasto.id} className={styles.gastoItem}>
                    <div className={styles.gastoIcono}>{categoria?.icono || '📦'}</div>
                    <div className={styles.gastoInfo}>
                      <span className={styles.gastoDescripcion}>{gasto.descripcion}</span>
                      <span className={styles.gastoMeta}>
                        Pagó: {getNombre(gasto.pagadoPor)} · {gasto.participantes.length} participantes
                      </span>
                    </div>
                    <div className={styles.gastoMonto}>{formatCurrency(gasto.monto)}</div>
                    <div className={styles.gastoAcciones}>
                      <button type="button" onClick={() => abrirModalGasto(gasto)} className={styles.btnEditar} title="Editar">
                        ✏️
                      </button>
                      <button type="button" onClick={() => eliminarGasto(gasto.id)} className={styles.btnEliminar} title="Eliminar">
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Botón limpiar */}
        {(compañeros.length > 0 || gastos.length > 0) && (
          <div className={styles.accionesGlobales}>
            <button type="button" onClick={limpiarTodo} className={styles.btnLimpiar}>
              🗑️ Limpiar todo
            </button>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className={styles.infoPanel}>
        <h3>💡 ¿Cómo funciona?</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>1️⃣</span>
            <div>
              <strong>Añade compañeros</strong>
              <p>Registra a todos los que comparten piso</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>2️⃣</span>
            <div>
              <strong>Registra gastos</strong>
              <p>Indica quién pagó y quién participa</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>3️⃣</span>
            <div>
              <strong>Ve las deudas</strong>
              <p>Calculamos quién debe a quién automáticamente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal añadir compañero */}
      {modalCompañero && (
        <div className={styles.modalOverlay} onClick={() => setModalCompañero(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitulo}>Añadir compañero</h3>
            <div className={styles.formGroup}>
              <label htmlFor="nombreCompañero">Nombre</label>
              <input
                id="nombreCompañero"
                type="text"
                value={nuevoNombre}
                onChange={e => setNuevoNombre(e.target.value)}
                placeholder="Ej: María"
                className={styles.input}
                autoFocus
              />
            </div>
            <div className={styles.modalAcciones}>
              <button type="button" onClick={() => setModalCompañero(false)} className={styles.btnCancelar}>
                Cancelar
              </button>
              <button
                type="button"
                onClick={agregarCompañero}
                className={styles.btnGuardar}
                disabled={!nuevoNombre.trim()}
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal añadir/editar gasto */}
      {modalGasto && (
        <div className={styles.modalOverlay} onClick={() => setModalGasto(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitulo}>
              {editandoGasto ? 'Editar gasto' : 'Nuevo gasto'}
            </h3>

            <div className={styles.formGroup}>
              <label htmlFor="gastoDescripcion">Descripción</label>
              <input
                id="gastoDescripcion"
                type="text"
                value={gastoDescripcion}
                onChange={e => setGastoDescripcion(e.target.value)}
                placeholder="Ej: Factura de la luz"
                className={styles.input}
                autoFocus
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="gastoMonto">Importe (€)</label>
                <input
                  id="gastoMonto"
                  type="text"
                  inputMode="decimal"
                  value={gastoMonto}
                  onChange={e => setGastoMonto(e.target.value)}
                  placeholder="0,00"
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="gastoCategoria">Categoría</label>
                <select
                  id="gastoCategoria"
                  value={gastoCategoria}
                  onChange={e => setGastoCategoria(e.target.value)}
                  className={styles.select}
                >
                  {CATEGORIAS.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icono} {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="gastoPagadoPor">¿Quién pagó?</label>
              <select
                id="gastoPagadoPor"
                value={gastoPagadoPor}
                onChange={e => setGastoPagadoPor(e.target.value)}
                className={styles.select}
              >
                {compañeros.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>¿Quién participa?</label>
              <div className={styles.participantesGrid}>
                {compañeros.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleParticipante(c.id)}
                    className={`${styles.participanteBtn} ${gastoParticipantes.includes(c.id) ? styles.activo : ''}`}
                    style={{
                      borderColor: gastoParticipantes.includes(c.id) ? c.color : undefined,
                      backgroundColor: gastoParticipantes.includes(c.id) ? `${c.color}20` : undefined,
                    }}
                  >
                    <span className={styles.participanteAvatar} style={{ backgroundColor: c.color }}>
                      {c.nombre.charAt(0)}
                    </span>
                    {c.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.modalAcciones}>
              <button type="button" onClick={() => setModalGasto(false)} className={styles.btnCancelar}>
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarGasto}
                className={styles.btnGuardar}
                disabled={!gastoDescripcion.trim() || !gastoMonto || gastoParticipantes.length === 0}
              >
                {editandoGasto ? 'Guardar' : 'Añadir'}
              </button>
            </div>
          </div>
        </div>
      )}

      <EducationalSection title="Guía para gestionar gastos compartidos" subtitle="Métodos para dividir gastos de forma justa, cómo evitar conflictos y organizar las finanzas del piso desde cero">

        {/* Tabla comparativa métodos */}
        <h3 className={styles.eduTitle}>⚖️ Métodos para dividir gastos entre roommates</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Método</th>
                <th>Cómo funciona</th>
                <th>Ventaja</th>
                <th>Inconveniente</th>
                <th>Ideal para</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Partes iguales</strong></td>
                <td>Total ÷ nº personas</td>
                <td>Simple y transparente</td>
                <td>Ignora diferencias de uso</td>
                <td>Gastos fijos (alquiler, internet)</td>
              </tr>
              <tr>
                <td><strong>Proporcional al uso</strong></td>
                <td>Cada uno paga según consume</td>
                <td>Justo si el uso varía mucho</td>
                <td>Difícil de medir (agua, luz)</td>
                <td>Gastos variables, viajes grupales</td>
              </tr>
              <tr>
                <td><strong>Proporcional al ingreso</strong></td>
                <td>Paga más quien más gana</td>
                <td>Equitativo en términos de esfuerzo</td>
                <td>Requiere compartir datos personales</td>
                <td>Convivencia larga con ingresos muy distintos</td>
              </tr>
              <tr>
                <td><strong>Híbrido (esta app)</strong></td>
                <td>Cada gasto tiene participantes</td>
                <td>Flexible y detallado</td>
                <td>Requiere registrar cada gasto</td>
                <td>Pisos compartidos con gastos irregulares</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Casos de uso */}
        <h3 className={styles.eduTitle}>💼 Situaciones típicas de gastos compartidos</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🎓</span>
              <h4>Piso de estudiantes</h4>
            </div>
            <p className={styles.escenarioDesc}>4 estudiantes comparten piso a 800 €/mes. El alquiler (partes iguales) son <strong>200 €/persona</strong>. La luz varía: quien tiene PC encendido más horas paga más. Registra la compra de la semana pagada por quien fue al super — la app lo distribuye automáticamente.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>✈️</span>
              <h4>Viaje grupal</h4>
            </div>
            <p className={styles.escenarioDesc}>5 amigos en una escapada: Ana paga el apartamento (600 €), Carlos paga las entradas (75 €), María paga la cena (180 €). La app calcula quién debe a quién para saldar todas las cuentas con el <strong>mínimo número de transferencias</strong>, en lugar de hacer múltiples pagos cruzados.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🏢</span>
              <h4>Compañeros de oficina</h4>
            </div>
            <p className={styles.escenarioDesc}>3 freelancers comparten oficina: alquiler (800 €), internet fibra (60 €) y café/consumibles (120 €). Total: 980 €. A partes iguales: <strong>326,67 €/mes</strong>. Si uno usa la oficina solo 3 días/semana, puede acordarse un porcentaje proporcional (p.ej. 60%) y registrarlo como participante parcial.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>👫</span>
              <h4>Pareja que comparte gastos</h4>
            </div>
            <p className={styles.escenarioDesc}>Cuando los ingresos son distintos (uno gana 2.000 €, otro 1.200 €), puede acordarse pagar en proporción (62,5% / 37,5%). En gastos de 1.500 €/mes: uno paga <strong>937,50 €</strong> y el otro <strong>562,50 €</strong>. Registra cada factura y la app sabe quién tiene saldo positivo o negativo al final del mes.</p>
          </div>
        </div>

        {/* FAQ */}
        <h3 className={styles.eduTitle}>❓ Preguntas frecuentes sobre gastos compartidos</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Qué hago si alguien debe dinero y no paga?</h4>
            <p>Lo primero es tener los datos bien registrados (en esta app) para mostrar el cálculo exacto sin discusiones. Si el importe es significativo, formalízalo por escrito (WhatsApp con confirmación explícita tiene valor probatorio). Para importes mayores, se puede hacer una transferencia parcial o establecer un plan de amortización. Si la persona abandona el piso, salda deudas antes de devolver la fianza.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo gestionar gastos cuando alguien se va del piso a mitad de mes?</h4>
            <p>Prorratea los gastos fijos por días: si el alquiler es 200 €/mes y la persona se va el día 15, debe pagar 100 € (15/30 días). Para las facturas de suministros, usa el total del mes dividido entre los días de cada período. Es más justo que dividir a partes iguales sin tener en cuenta el tiempo real de uso.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Debo incluir el alquiler en la app o solo los gastos variables?</h4>
            <p>Depende de cómo gestionéis el alquiler. Si uno cobra y reparte, incluirlo ayuda a tener el balance total en un sitio. Si cada uno paga directamente al casero, solo necesitas registrar los gastos variables (facturas, compra, etc.). La app funciona bien en ambos casos.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué hacer con los gastos de solo algunos roommates?</h4>
            <p>Para eso sirven los «participantes» de cada gasto. Si 3 de 4 roommates van al cine juntos, añade el gasto y selecciona solo esos 3 como participantes. El cuarto no participa en ese gasto. La app distribuye el coste solo entre los participantes marcados, sin afectar al balance del que no fue.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Con qué frecuencia deberíamos hacer la liquidación?</h4>
            <p>Lo más práctico es una liquidación mensual, el mismo día que se paga el alquiler. Así los balances no se acumulan y las deudas son manejables. Para viajes o eventos específicos, liquida al terminar. Evita acumular meses — cuando alguien se va del piso con deudas antiguas, la gestión se complica mucho.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿La app guarda los datos si cierro el navegador?</h4>
            <p>Sí, los datos se guardan en el navegador (localStorage) de forma automática. Mientras uses el mismo navegador y no borres los datos del sitio, permanecerán. Para compartir con tus roommates, cada uno debe introducir los mismos datos en su dispositivo, o designar una persona que lleve el registro. No hay sincronización en la nube — todos los datos son 100% locales y privados.</p>
          </div>
        </div>

        {/* Guía paso a paso */}
        <h3 className={styles.eduTitle}>📋 Cómo organizar las finanzas del piso desde cero</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>Acuerda las reglas básicas entre todos</h4>
              <p>Antes de registrar nada, consensúa: ¿cómo se dividen los gastos fijos? ¿Partes iguales o proporcional al ingreso? ¿Hay gastos personales excluidos (el streaming individual de cada uno)? Una conversación de 20 minutos al principio evita conflictos meses después.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>Añade a todos los compañeros en la app</h4>
              <p>Crea un perfil por cada persona que comparte gastos. Usa nombres cortos que identifiquéis fácilmente. La app les asigna colores automáticamente para diferenciarlos visualmente en la lista de gastos.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>Registra cada gasto en el momento</h4>
              <p>El secreto del éxito es registrar al pagar, no una semana después. Tienes el ticket en la mano: intro descripción, importe, quién pagó y quiénes participan. Tarda 30 segundos. Hacerlo de memoria después generará errores y discusiones.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h4>Revisa los balances semanalmente</h4>
              <p>Una vez a la semana, abre la sección «Quién debe a quién». Si alguien acumula más de 50–100 € de deuda, haz una transferencia parcial para mantener balances manejables. No esperes a que sean cientos de euros.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h4>Liquida y limpia el registro cada mes</h4>
              <p>Cuando todos hayan pagado sus deudas del mes, usa el botón «Limpiar todo» para empezar el mes siguiente desde cero. Antes de limpiar, revisa que todos los balances estén en 0 o cerca. Guarda una captura de pantalla si quieres historial.</p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <h3 className={styles.eduTitle}>✅ 6 consejos para convivir sin conflictos económicos</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📲</span>
            <h4>Registra en el momento</h4>
            <p>No esperes al final del día. El ticket en mano y la app abierta: 30 segundos. Registrar de memoria genera errores y discusiones sobre si fue 12 € o 14 €.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🗓️</span>
            <h4>Fija un día de liquidación</h4>
            <p>El mismo día cada mes (ej: el 1). Todos transfieren lo que deben. Así no hay deudas acumuladas y el ambiente del piso es más relajado.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>💬</span>
            <h4>Habla de dinero desde el principio</h4>
            <p>Acuerda en el primer mes: ¿se comparten todos los suministros? ¿El café individual o común? ¿Qué pasa si alguien no está un mes? Las reglas claras desde el inicio evitan el 90% de los conflictos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📊</span>
            <h4>Crea una cuenta compartida para gastos fijos</h4>
            <p>Para pisos estables, considera una cuenta bancaria compartida (Bizum grupal o cuenta conjunta en Revolut/N26). Cada uno aporta su parte el 1 de mes; los recibos se cargan automáticamente. Elimina el problema de «quién adelanta».</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🧾</span>
            <h4>Guarda los tickets más grandes</h4>
            <p>Para facturas de suministros, alquiler o compras de más de 50 €, guarda el ticket o la factura digital. Si hay discrepancia posterior, tienes prueba del gasto real.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🤝</span>
            <h4>Sé flexible con pequeños importes</h4>
            <p>Si la diferencia es menos de 2–3 €, redondea. El tiempo y el mal ambiente que genera cobrar 1,37 € de más no compensa. Guarda la energía de negociación para los gastos que realmente importan.</p>
          </div>
        </div>

        {/* Warning */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <h3>Errores que generan conflictos en el piso</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong>❌ No hablar de dinero hasta que ya hay deuda:</strong> El silencio sobre quién adelantó qué genera resentimiento silencioso. Registra y habla en el momento, no meses después.</li>
            <li><strong>❌ Mezclar gastos personales con gastos del piso:</strong> La botella de vino que te bebiste tú solo no es gasto compartido. Define claramente qué es de todos y qué es individual antes de registrar.</li>
            <li><strong>❌ Dejar que las deudas se acumulen más de un mes:</strong> Una deuda de 30 € es fácil de saldar; una de 300 € acumulada en 6 meses crea tensión. Liquidaciones mensuales, sin excepción.</li>
            <li><strong>❌ Olvidar registrar gastos «pequeños» que suman:</strong> El detergente (8 €), el papel higiénico (6 €), la bombilla (4 €)... si siempre los paga la misma persona, en un año son más de 200 €. Regístralos todos.</li>
            <li><strong>❌ Asumir que «ya lo ajustaremos después»:</strong> «Después» rara vez llega. O se registra en el momento o se pierde. La app está pensada para ser rápida de usar; úsala inmediatamente.</li>
            <li><strong>❌ No actualizar la app cuando alguien se va o llega:</strong> Si entra un nuevo roommate, añádelo desde el principio. Si alguien se va, salda sus deudas y elimínalo. Un perfil de alguien que ya no vive en el piso contamina todos los cálculos futuros.</li>
          </ul>
        </div>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-roommates')} />

      <ShareCard appName="calculadora-roommates" />
      <Footer appName="calculadora-roommates" />
    </div>
  );
}
