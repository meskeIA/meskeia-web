'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './CalculadoraRoommates.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { formatCurrency } from '@/lib';

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

      <Footer appName="calculadora-roommates" />
    </div>
  );
}
