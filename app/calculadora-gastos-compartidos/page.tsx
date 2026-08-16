'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './CalculadoraGastosCompartidos.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection, DisclaimerCard } from '@/components';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
interface Persona {
  id: string;
  nombre: string;
  color: string;
}

interface Gasto {
  id: string;
  descripcion: string;
  monto: number;          // euros (lo que se teclea)
  pagadoPor: string;      // ID de la persona
  participantes: string[]; // IDs de quienes entran en el reparto
  fecha: string;
  categoria: string;
}

interface Transferencia {
  de: string;
  a: string;
  centimos: number;
}

interface SaldoPersona {
  id: string;
  nombre: string;
  color: string;
  centimos: number; // positivo = le deben; negativo = debe
}

// Contextos de uso. El mismo motor sirve para los cuatro; lo único que cambia son las
// categorías, que es lo que hace que la herramienta se reconozca como propia en cada caso.
const CONTEXTOS = [
  {
    id: 'piso',
    nombre: 'Piso compartido',
    icono: '🏠',
    categorias: [
      { id: 'alquiler', nombre: 'Alquiler', icono: '🏠' },
      { id: 'luz', nombre: 'Luz', icono: '💡' },
      { id: 'agua', nombre: 'Agua', icono: '💧' },
      { id: 'gas', nombre: 'Gas', icono: '🔥' },
      { id: 'internet', nombre: 'Internet', icono: '📶' },
      { id: 'compra', nombre: 'Compra común', icono: '🛒' },
      { id: 'limpieza', nombre: 'Limpieza', icono: '🧹' },
      { id: 'otros', nombre: 'Otros', icono: '📦' },
    ],
  },
  {
    id: 'viaje',
    nombre: 'Viaje en grupo',
    icono: '✈️',
    categorias: [
      { id: 'alojamiento', nombre: 'Alojamiento', icono: '🛏️' },
      { id: 'transporte', nombre: 'Transporte', icono: '🚗' },
      { id: 'comidas', nombre: 'Comidas', icono: '🍽️' },
      { id: 'entradas', nombre: 'Entradas y visitas', icono: '🎟️' },
      { id: 'compras', nombre: 'Compras', icono: '🛍️' },
      { id: 'otros', nombre: 'Otros', icono: '📦' },
    ],
  },
  {
    id: 'evento',
    nombre: 'Cena o evento',
    icono: '🍽️',
    categorias: [
      { id: 'comida', nombre: 'Comida', icono: '🍕' },
      { id: 'bebida', nombre: 'Bebida', icono: '🥤' },
      { id: 'local', nombre: 'Local o reserva', icono: '🏛️' },
      { id: 'transporte', nombre: 'Transporte', icono: '🚕' },
      { id: 'otros', nombre: 'Otros', icono: '📦' },
    ],
  },
  {
    id: 'regalo',
    nombre: 'Regalo conjunto',
    icono: '🎁',
    categorias: [
      { id: 'regalo', nombre: 'Regalo', icono: '🎁' },
      { id: 'envio', nombre: 'Envío', icono: '📦' },
      { id: 'extras', nombre: 'Tarjeta y extras', icono: '💌' },
      { id: 'otros', nombre: 'Otros', icono: '📦' },
    ],
  },
];

// Todas las categorías de todos los contextos: un gasto registrado en «viaje» debe seguir
// mostrando su icono aunque después se cambie el grupo a «piso».
const TODAS_CATEGORIAS = CONTEXTOS.flatMap((c) => c.categorias);

const COLORES_DISPONIBLES = [
  '#2E86AB', '#48A9A6', '#E91E63', '#FF9800', '#9C27B0',
  '#4CAF50', '#F44336', '#3F51B5', '#795548', '#607D8B',
];

const STORAGE_KEY = 'meskeia_gastos_compartidos';
const STORAGE_KEY_ANTIGUA = 'meskeia_roommates'; // datos de quien la usara como «Roommates»

// -------------------------------------------------------------------------------------------------
// Motor de reparto y liquidación
//
// Todo el cálculo va en CÉNTIMOS ENTEROS. En coma flotante, repartir 10 € entre tres da tres
// deudas de 3,33 € que suman 9,99 €: falta un céntimo y las cuentas no cuadran nunca del todo.
// -------------------------------------------------------------------------------------------------

/** Reparte un importe en céntimos entre n personas repartiendo también el resto, sin perder nada. */
function repartirCentimos(total: number, n: number, desplazamiento: number): number[] {
  const base = Math.floor(total / n);
  const resto = total - base * n;
  // El céntimo sobrante rota según el gasto, para que no lo asuma siempre la misma persona
  return Array.from({ length: n }, (_, i) => base + ((i + desplazamiento) % n < resto ? 1 : 0));
}

/**
 * Cascada deudor↔acreedor dentro de un grupo. En un grupo mínimo da exactamente |grupo|-1 pagos.
 * Se emparejan de mayor a menor importe: cuando un deudor y un acreedor coinciden en cantidad,
 * se cancelan de una vez en lugar de arrastrar restos que generarían pagos extra.
 */
function saldarGrupo(grupo: SaldoPersona[]): Transferencia[] {
  const deudores = grupo.filter((p) => p.centimos < 0)
    .map((p) => ({ id: p.id, resto: -p.centimos }))
    .sort((a, b) => b.resto - a.resto);
  const acreedores = grupo.filter((p) => p.centimos > 0)
    .map((p) => ({ id: p.id, resto: p.centimos }))
    .sort((a, b) => b.resto - a.resto);
  const transferencias: Transferencia[] = [];

  let i = 0;
  let j = 0;
  while (i < deudores.length && j < acreedores.length) {
    const importe = Math.min(deudores[i].resto, acreedores[j].resto);
    if (importe > 0) {
      transferencias.push({ de: deudores[i].id, a: acreedores[j].id, centimos: importe });
    }
    deudores[i].resto -= importe;
    acreedores[j].resto -= importe;
    if (deudores[i].resto === 0) i++;
    if (acreedores[j].resto === 0) j++;
  }
  return transferencias;
}

const LIMITE_EXACTO = 12; // 3^12 ≈ 531.000 pasos: instantáneo

/**
 * Calcula quién paga a quién con el MENOR número de transferencias posible.
 *
 * El método voraz (emparejar al mayor deudor con el mayor acreedor) es rápido pero no siempre
 * mínimo: cuando un subgrupo se salda por su cuenta, tratarlo aparte ahorra pagos. Aquí, hasta
 * 12 personas con saldo, se busca la partición en el MÁXIMO número de subgrupos que suman cero
 * (programación dinámica sobre subconjuntos); el mínimo de transferencias es entonces
 * «personas con saldo − número de subgrupos». Por encima de ese tamaño se recurre al voraz.
 */
function calcularLiquidacion(saldos: SaldoPersona[]): { transferencias: Transferencia[]; exacta: boolean } {
  const activos = saldos.filter((s) => s.centimos !== 0);
  if (activos.length === 0) return { transferencias: [], exacta: true };
  if (activos.length > LIMITE_EXACTO) return { transferencias: saldarGrupo(activos), exacta: false };

  const n = activos.length;
  const totalMascaras = 1 << n;

  // Suma de saldos de cada subconjunto
  const suma = new Int32Array(totalMascaras);
  for (let mascara = 1; mascara < totalMascaras; mascara++) {
    const bitBajo = mascara & -mascara;
    const indice = Math.log2(bitBajo) | 0;
    suma[mascara] = suma[mascara ^ bitBajo] + activos[indice].centimos;
  }

  // mejor[m] = máximo nº de subgrupos con suma cero en que se puede partir m
  const mejor = new Int32Array(totalMascaras);
  const particion = new Int32Array(totalMascaras);
  for (let mascara = 1; mascara < totalMascaras; mascara++) {
    if (suma[mascara] !== 0) { mejor[mascara] = -1; continue; }
    const bitBajo = mascara & -mascara;
    mejor[mascara] = 1;              // en el peor caso, el subconjunto entero es un solo grupo
    particion[mascara] = mascara;
    // Submáscaras que contienen el bit más bajo: así cada partición se explora una sola vez
    for (let sub = (mascara - 1) & mascara; sub > 0; sub = (sub - 1) & mascara) {
      if (!(sub & bitBajo) || suma[sub] !== 0) continue;
      const resto = mascara ^ sub;
      if (mejor[resto] < 0) continue;
      const candidato = 1 + mejor[resto];
      if (candidato > mejor[mascara]) { mejor[mascara] = candidato; particion[mascara] = sub; }
    }
  }

  // Reconstruir los subgrupos y saldar cada uno por separado
  const transferencias: Transferencia[] = [];
  let pendiente = totalMascaras - 1;
  while (pendiente > 0) {
    const grupo = particion[pendiente];
    const miembros: SaldoPersona[] = [];
    for (let i = 0; i < n; i++) if (grupo & (1 << i)) miembros.push(activos[i]);
    transferencias.push(...saldarGrupo(miembros));
    pendiente ^= grupo;
  }

  return { transferencias, exacta: true };
}

export default function CalculadoraGastosCompartidosPage() {
  // Estado principal
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [contexto, setContexto] = useState('piso');

  // Estado del modal
  const [modalPersona, setModalPersona] = useState(false);
  const [modalGasto, setModalGasto] = useState(false);
  const [editandoGasto, setEditandoGasto] = useState<Gasto | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Estado del formulario de persona
  const [nuevoNombre, setNuevoNombre] = useState('');

  // Estado del formulario de gasto
  const [gastoDescripcion, setGastoDescripcion] = useState('');
  const [gastoMonto, setGastoMonto] = useState('');
  const [gastoPagadoPor, setGastoPagadoPor] = useState('');
  const [gastoParticipantes, setGastoParticipantes] = useState<string[]>([]);
  const [gastoCategoria, setGastoCategoria] = useState('compra');

  // Cargar datos de localStorage (con rescate de los guardados bajo el nombre anterior)
  useEffect(() => {
    const guardado = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY_ANTIGUA);
    if (!guardado) return;
    try {
      const datos = JSON.parse(guardado);
      // `compañeros` es la clave que usaban los datos antiguos
      const listaPersonas = datos.personas ?? datos.compañeros;
      if (listaPersonas) setPersonas(listaPersonas);
      if (datos.gastos) setGastos(datos.gastos);
      if (datos.contexto) setContexto(datos.contexto);
    } catch {
      console.error('Error al cargar datos guardados');
    }
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    if (personas.length > 0 || gastos.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ personas, gastos, contexto }));
    }
  }, [personas, gastos, contexto]);

  const contextoActivo = useMemo(
    () => CONTEXTOS.find((c) => c.id === contexto) ?? CONTEXTOS[0],
    [contexto]
  );

  // Saldos, liquidación y totales — todo en céntimos enteros
  const { saldos, transferencias, liquidacionExacta, totalCentimos, pagosSueltos } = useMemo(() => {
    const saldoMapa: Record<string, number> = {};
    personas.forEach((p) => { saldoMapa[p.id] = 0; });

    let total = 0;
    let sueltos = 0;

    gastos.forEach((gasto, indice) => {
      const centimos = Math.round(gasto.monto * 100);
      total += centimos;

      const participan = gasto.participantes.filter((id) => personas.some((p) => p.id === id));
      if (participan.length === 0) return;

      if (saldoMapa[gasto.pagadoPor] !== undefined) saldoMapa[gasto.pagadoPor] += centimos;

      const partes = repartirCentimos(centimos, participan.length, indice);
      participan.forEach((id, i) => {
        if (saldoMapa[id] !== undefined) saldoMapa[id] -= partes[i];
      });

      // Cuántos pagos harían falta si cada participante devolviera su parte al que pagó
      sueltos += participan.filter((id) => id !== gasto.pagadoPor).length;
    });

    const listaSaldos: SaldoPersona[] = personas.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      color: p.color,
      centimos: saldoMapa[p.id] || 0,
    }));

    const { transferencias: movimientos, exacta } = calcularLiquidacion(listaSaldos);

    return {
      saldos: listaSaldos,
      transferencias: movimientos,
      liquidacionExacta: exacta,
      totalCentimos: total,
      pagosSueltos: sueltos,
    };
  }, [personas, gastos]);

  // Funciones de personas
  const agregarPersona = () => {
    if (!nuevoNombre.trim()) return;

    const coloresUsados = personas.map((p) => p.color);
    const colorDisponible = COLORES_DISPONIBLES.find((c) => !coloresUsados.includes(c)) || COLORES_DISPONIBLES[0];

    const nueva: Persona = {
      id: Date.now().toString(),
      nombre: nuevoNombre.trim(),
      color: colorDisponible,
    };

    setPersonas([...personas, nueva]);
    setNuevoNombre('');
    setModalPersona(false);
  };

  const eliminarPersona = (id: string) => {
    if (confirm('¿Eliminar a esta persona? Se eliminarán también los gastos que pagó.')) {
      setPersonas(personas.filter((p) => p.id !== id));
      setGastos(gastos.filter((g) => g.pagadoPor !== id));
    }
  };

  // Funciones de gastos
  const abrirModalGasto = (gasto?: Gasto) => {
    if (gasto) {
      setEditandoGasto(gasto);
      setGastoDescripcion(gasto.descripcion);
      setGastoMonto(gasto.monto.toString().replace('.', ','));
      setGastoPagadoPor(gasto.pagadoPor);
      setGastoParticipantes(gasto.participantes);
      setGastoCategoria(gasto.categoria);
    } else {
      setEditandoGasto(null);
      setGastoDescripcion('');
      setGastoMonto('');
      setGastoPagadoPor(personas[0]?.id || '');
      setGastoParticipantes(personas.map((p) => p.id));
      setGastoCategoria(contextoActivo.categorias[0].id);
    }
    setModalGasto(true);
  };

  const guardarGasto = () => {
    const monto = parseFloat(gastoMonto.replace(/\./g, '').replace(',', '.'));
    if (!gastoDescripcion.trim() || isNaN(monto) || monto <= 0 || !gastoPagadoPor || gastoParticipantes.length === 0) {
      return;
    }

    if (editandoGasto) {
      setGastos(gastos.map((g) =>
        g.id === editandoGasto.id
          ? { ...g, descripcion: gastoDescripcion.trim(), monto, pagadoPor: gastoPagadoPor, participantes: gastoParticipantes, categoria: gastoCategoria }
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
      setGastos(gastos.filter((g) => g.id !== id));
    }
  };

  const toggleParticipante = (id: string) => {
    if (gastoParticipantes.includes(id)) {
      setGastoParticipantes(gastoParticipantes.filter((p) => p !== id));
    } else {
      setGastoParticipantes([...gastoParticipantes, id]);
    }
  };

  const getNombre = (id: string) => personas.find((p) => p.id === id)?.nombre || 'Desconocido';
  const getColor = (id: string) => personas.find((p) => p.id === id)?.color || '#999';
  const getCategoria = (id: string) => TODAS_CATEGORIAS.find((c) => c.id === id);

  // Resumen en texto plano: lo que de verdad se manda al grupo para saldar
  const copiarLiquidacion = async () => {
    const lineas = [
      `Reparto de gastos — ${contextoActivo.nombre}`,
      `Total: ${formatCurrency(totalCentimos / 100)} entre ${personas.length} personas`,
      '',
      'Pagos para saldar las cuentas:',
      ...transferencias.map((t) => `· ${getNombre(t.de)} → ${getNombre(t.a)}: ${formatCurrency(t.centimos / 100)}`),
    ];
    try {
      await navigator.clipboard.writeText(lineas.join('\n'));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  };

  // Limpiar todo
  const limpiarTodo = () => {
    if (confirm('¿Eliminar todos los datos? Esta acción no se puede deshacer.')) {
      setPersonas([]);
      setGastos([]);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY_ANTIGUA);
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🧾</span> Calculadora de Gastos Compartidos</h1>
        <p className={styles.subtitle}>
          Quién debe a quién tras un viaje, una cena, un regalo conjunto o el mes en el piso
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="financial"
        severity="medium"
        context="calculadora-gastos-compartidos"
        collapsible={true}
      />

      <div className={styles.mainContent}>
        {/* Contexto del grupo */}
        <div className={styles.contextoPanel}>
          <h2 className={styles.sectionTitle}><span aria-hidden="true">🎯</span> ¿Qué estáis compartiendo?</h2>
          <div className={styles.contextoTabs}>
            {CONTEXTOS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setContexto(c.id)}
                aria-pressed={contexto === c.id}
                className={`${styles.contextoTab} ${contexto === c.id ? styles.contextoTabActivo : ''}`}
              >
                <span aria-hidden="true">{c.icono}</span> {c.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Panel de personas */}
        <div className={styles.personasPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.sectionTitle}><span aria-hidden="true">👥</span> Personas</h2>
            <button type="button" onClick={() => setModalPersona(true)} className={styles.btnAgregar}>
              + Añadir
            </button>
          </div>

          {personas.length === 0 ? (
            <p className={styles.sinDatos}>Añade a las personas del grupo para empezar</p>
          ) : (
            <div className={styles.personasList}>
              {saldos.map((s) => (
                <div key={s.id} className={styles.personaItem}>
                  <div className={styles.personaAvatar} style={{ backgroundColor: s.color }}>
                    {s.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.personaInfo}>
                    <span className={styles.personaNombre}>{s.nombre}</span>
                    <span className={`${styles.personaBalance} ${s.centimos >= 0 ? styles.positivo : styles.negativo}`}>
                      {s.centimos > 0 ? '+' : ''}{formatCurrency(s.centimos / 100)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => eliminarPersona(s.id)}
                    className={styles.btnEliminar}
                    aria-label={`Eliminar a ${s.nombre}`}
                  >
                    <span aria-hidden="true">🗑️</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel de resumen */}
        {personas.length > 0 && (
          <div className={styles.resumenPanel}>
            <h2 className={styles.sectionTitle}><span aria-hidden="true">📊</span> Resumen</h2>
            <div className={styles.resumenGrid}>
              <div className={styles.resumenCard}>
                <span className={styles.resumenLabel}>Total gastos</span>
                <span className={styles.resumenValor}>{formatCurrency(totalCentimos / 100)}</span>
              </div>
              <div className={styles.resumenCard}>
                <span className={styles.resumenLabel}>Por persona (media)</span>
                <span className={styles.resumenValor}>
                  {formatCurrency(personas.length > 0 ? totalCentimos / 100 / personas.length : 0)}
                </span>
              </div>
              <div className={styles.resumenCard}>
                <span className={styles.resumenLabel}>Nº gastos</span>
                <span className={styles.resumenValor}>{gastos.length}</span>
              </div>
              <div className={styles.resumenCard}>
                <span className={styles.resumenLabel}>Personas</span>
                <span className={styles.resumenValor}>{personas.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Panel de liquidación */}
        {transferencias.length > 0 && (
          <div className={styles.deudasPanel}>
            <h2 className={styles.sectionTitle}><span aria-hidden="true">💸</span> Quién paga a quién</h2>

            <p className={styles.liquidacionResumen} role="status" aria-live="polite">
              {pagosSueltos > transferencias.length ? (
                <>
                  <strong>{transferencias.length} {transferencias.length === 1 ? 'transferencia' : 'transferencias'}</strong>{' '}
                  en lugar de los {pagosSueltos} pagos sueltos que haría falta si cada uno devolviese
                  su parte de cada gasto a quien lo adelantó.
                </>
              ) : (
                <>
                  <strong>{transferencias.length} {transferencias.length === 1 ? 'transferencia' : 'transferencias'}</strong>{' '}
                  bastan para dejar todas las cuentas a cero.
                </>
              )}
              {!liquidacionExacta && ' Con más de 12 personas con saldo pendiente se usa un reparto aproximado, que puede no ser el mínimo absoluto.'}
            </p>

            <div className={styles.deudasList}>
              {transferencias.map((t, idx) => (
                <div key={`${t.de}-${t.a}-${idx}`} className={styles.deudaItem}>
                  <div className={styles.deudaPersona}>
                    <div className={styles.deudaAvatar} style={{ backgroundColor: getColor(t.de) }}>
                      {getNombre(t.de).charAt(0)}
                    </div>
                    <span>{getNombre(t.de)}</span>
                  </div>
                  <div className={styles.deudaFlecha}>
                    <span className={styles.deudaMonto}>{formatCurrency(t.centimos / 100)}</span>
                    <span aria-hidden="true">→</span>
                  </div>
                  <div className={styles.deudaPersona}>
                    <div className={styles.deudaAvatar} style={{ backgroundColor: getColor(t.a) }}>
                      {getNombre(t.a).charAt(0)}
                    </div>
                    <span>{getNombre(t.a)}</span>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={copiarLiquidacion} className={styles.btnCopiar}>
              <span aria-hidden="true">📋</span> {copiado ? '¡Copiado!' : 'Copiar para el grupo'}
            </button>
          </div>
        )}

        {/* Panel de gastos */}
        <div className={styles.gastosPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.sectionTitle}><span aria-hidden="true">📝</span> Gastos</h2>
            {personas.length > 0 && (
              <button type="button" onClick={() => abrirModalGasto()} className={styles.btnAgregar}>
                + Nuevo gasto
              </button>
            )}
          </div>

          {gastos.length === 0 ? (
            <p className={styles.sinDatos}>
              {personas.length === 0
                ? 'Primero añade a las personas del grupo'
                : 'Añade el primer gasto: quién lo pagó y entre quiénes se reparte'}
            </p>
          ) : (
            <div className={styles.gastosList}>
              {gastos.map((gasto) => {
                const categoria = getCategoria(gasto.categoria);
                return (
                  <div key={gasto.id} className={styles.gastoItem}>
                    <div className={styles.gastoIcono} aria-hidden="true">{categoria?.icono || '📦'}</div>
                    <div className={styles.gastoInfo}>
                      <span className={styles.gastoDescripcion}>{gasto.descripcion}</span>
                      <span className={styles.gastoMeta}>
                        Pagó: {getNombre(gasto.pagadoPor)} · se reparte entre {gasto.participantes.length}
                      </span>
                    </div>
                    <div className={styles.gastoMonto}>{formatCurrency(gasto.monto)}</div>
                    <div className={styles.gastoAcciones}>
                      <button
                        type="button"
                        onClick={() => abrirModalGasto(gasto)}
                        className={styles.btnEditar}
                        aria-label={`Editar ${gasto.descripcion}`}
                      >
                        <span aria-hidden="true">✏️</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarGasto(gasto.id)}
                        className={styles.btnEliminar}
                        aria-label={`Eliminar ${gasto.descripcion}`}
                      >
                        <span aria-hidden="true">🗑️</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Botón limpiar */}
        {(personas.length > 0 || gastos.length > 0) && (
          <div className={styles.accionesGlobales}>
            <button type="button" onClick={limpiarTodo} className={styles.btnLimpiar}>
              <span aria-hidden="true">🗑️</span> Limpiar todo
            </button>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className={styles.infoPanel}>
        <h3><span aria-hidden="true">💡</span> ¿Cómo funciona?</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon} aria-hidden="true">1️⃣</span>
            <div>
              <strong>Añade a las personas</strong>
              <p>Todas las que participan en algún gasto del grupo</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon} aria-hidden="true">2️⃣</span>
            <div>
              <strong>Registra cada gasto</strong>
              <p>Quién lo adelantó y entre quiénes se reparte</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon} aria-hidden="true">3️⃣</span>
            <div>
              <strong>Salda con los mínimos pagos</strong>
              <p>Se calcula la liquidación más corta y se copia para el grupo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal añadir persona */}
      {modalPersona && (
        <div className={styles.modalOverlay} onClick={() => setModalPersona(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitulo}>Añadir persona</h3>
            <div className={styles.formGroup}>
              <label htmlFor="nombrePersona">Nombre</label>
              <input
                id="nombrePersona"
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Ej: María"
                className={styles.input}
                autoComplete="off"
                autoFocus
              />
            </div>
            <div className={styles.modalAcciones}>
              <button type="button" onClick={() => setModalPersona(false)} className={styles.btnCancelar}>
                Cancelar
              </button>
              <button
                type="button"
                onClick={agregarPersona}
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
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitulo}>
              {editandoGasto ? 'Editar gasto' : 'Nuevo gasto'}
            </h3>

            <div className={styles.formGroup}>
              <label htmlFor="gastoDescripcion">Descripción</label>
              <input
                id="gastoDescripcion"
                type="text"
                value={gastoDescripcion}
                onChange={(e) => setGastoDescripcion(e.target.value)}
                placeholder="Ej: Cena del sábado"
                className={styles.input}
                autoComplete="off"
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
                  onChange={(e) => setGastoMonto(e.target.value)}
                  placeholder="0,00"
                  className={styles.input}
                  autoComplete="off"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="gastoCategoria">Categoría</label>
                <select
                  id="gastoCategoria"
                  value={gastoCategoria}
                  onChange={(e) => setGastoCategoria(e.target.value)}
                  className={styles.select}
                >
                  {contextoActivo.categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icono} {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="gastoPagadoPor">¿Quién lo pagó?</label>
              <select
                id="gastoPagadoPor"
                value={gastoPagadoPor}
                onChange={(e) => setGastoPagadoPor(e.target.value)}
                className={styles.select}
              >
                {personas.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <span className={styles.formLabel}>¿Entre quiénes se reparte?</span>
              <div className={styles.participantesGrid}>
                {personas.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleParticipante(p.id)}
                    aria-pressed={gastoParticipantes.includes(p.id)}
                    className={`${styles.participanteBtn} ${gastoParticipantes.includes(p.id) ? styles.activo : ''}`}
                    style={{
                      borderColor: gastoParticipantes.includes(p.id) ? p.color : undefined,
                      backgroundColor: gastoParticipantes.includes(p.id) ? `${p.color}20` : undefined,
                    }}
                  >
                    <span className={styles.participanteAvatar} style={{ backgroundColor: p.color }}>
                      {p.nombre.charAt(0)}
                    </span>
                    {p.nombre}
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

      <EducationalSection
        title="Guía para repartir gastos en grupo"
        subtitle="Métodos de reparto, por qué el número de transferencias importa y cómo evitar las discusiones típicas"
      >

        {/* Tabla comparativa métodos */}
        <h3 className={styles.eduTitle}><span aria-hidden="true">⚖️</span> Métodos para repartir un gasto entre varias personas</h3>
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
                <td>Gastos fijos (alojamiento, internet)</td>
              </tr>
              <tr>
                <td><strong>Solo entre quienes participan</strong></td>
                <td>Cada gasto se reparte entre los suyos</td>
                <td>Justo sin necesidad de medir nada</td>
                <td>Exige registrar quién entra en cada gasto</td>
                <td>Viajes y cenas donde no todos hacen lo mismo</td>
              </tr>
              <tr>
                <td><strong>Proporcional al uso</strong></td>
                <td>Cada uno paga según consume</td>
                <td>Justo si el uso varía mucho</td>
                <td>Difícil de medir (agua, luz)</td>
                <td>Suministros en convivencias largas</td>
              </tr>
              <tr>
                <td><strong>Proporcional al ingreso</strong></td>
                <td>Aporta más quien más gana</td>
                <td>Reparte el esfuerzo, no el importe</td>
                <td>Obliga a compartir datos personales</td>
                <td>Convivencias con ingresos muy distintos</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Casos de uso */}
        <h3 className={styles.eduTitle}><span aria-hidden="true">💼</span> Cuatro situaciones donde las cuentas se enredan</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">✈️</span>
              <h4>Viaje en grupo</h4>
            </div>
            <p className={styles.escenarioDesc}>Cinco amigos en una escapada: una paga el apartamento (600 €), otro las entradas (75 €), otra la cena (180 €). Cada gasto lo adelanta quien lo tiene más a mano y al volver nadie sabe cómo queda la cuenta. Registrando los tres gastos, el reparto sale <strong>en dos o tres transferencias</strong> en vez de una docena de pagos cruzados.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🍽️</span>
              <h4>Cena en la que no todos comen igual</h4>
            </div>
            <p className={styles.escenarioDesc}>Ocho personas, una cuenta única y dos que no bebieron. Dividir el total entre ocho es rápido pero injusto; discutirlo en la mesa es incómodo. La solución es registrar la bebida como un gasto aparte y marcar solo a quienes participaron: el cálculo lo hace la herramienta y <strong>nadie tiene que negociar nada</strong>.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎁</span>
              <h4>Regalo conjunto</h4>
            </div>
            <p className={styles.escenarioDesc}>Doce compañeros compran un regalo de 340 € y dos personas adelantan el dinero (una el regalo, otra el envío). A 28,33 € por cabeza, los céntimos no cuadran nunca: 340 ÷ 12 = 28,333… Aquí el reparto se hace <strong>en céntimos enteros</strong>, así que la suma de las partes da exactamente 340 € y no falta ni sobra nada.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🏠</span>
              <h4>Piso compartido</h4>
            </div>
            <p className={styles.escenarioDesc}>Cuatro personas comparten piso: alquiler e internet van a partes iguales, pero la compra la hace quien puede y el cine lo pagaron solo tres. Al final de mes, en vez de repasar el historial del grupo de WhatsApp, la liquidación sale de los gastos ya registrados y <strong>se copia lista para pegar</strong>.</p>
          </div>
        </div>

        {/* FAQ */}
        <h3 className={styles.eduTitle}><span aria-hidden="true">❓</span> Preguntas frecuentes sobre gastos compartidos</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Por qué importa el número de transferencias?</h4>
            <p>Porque cada pago es una gestión que alguien tiene que hacer y recordar. En un grupo de seis personas con diez gastos, devolver a cada uno su parte de cada gasto puede suponer treinta o cuarenta pagos; la liquidación agrupada suele resolverse en cuatro o cinco. Con saldos ya calculados, el mínimo teórico nunca supera «personas con saldo − 1», y a menudo es bastante menor porque algunos subgrupos se saldan entre ellos sin tocar al resto.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo se reparten los céntimos cuando la división no es exacta?</h4>
            <p>Repartir 10 € entre tres da 3,333… €. Si se redondea cada parte a 3,33 €, la suma son 9,99 € y falta un céntimo: es el error clásico de hacerlo a mano o en una hoja de cálculo. Aquí el cálculo se hace en céntimos enteros y el sobrante se asigna a una de las partes, rotando de un gasto a otro para que no recaiga siempre en la misma persona. La suma de las partes coincide siempre con el total exacto.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué hago con un gasto en el que no participaron todos?</h4>
            <p>Para eso sirve la selección de participantes de cada gasto. Si tres de las seis personas fueron al museo, se añade el gasto y se marcan solo esas tres: el resto no ve alterado su saldo. Es el mecanismo que hace innecesario discutir nada, porque cada gasto lleva su propio reparto en lugar de aplicar una regla única a todo el viaje.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Los datos se guardan en algún servidor?</h4>
            <p>No. Todo se guarda en el navegador del propio dispositivo (localStorage) y no se envía a ningún sitio: no hay cuentas, ni registro, ni sincronización en la nube. La contrapartida es que los datos no se comparten solos entre el grupo. Lo práctico es que una persona lleve el registro y use el botón de copiar para mandar la liquidación al chat cuando toque saldar.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cada cuánto conviene liquidar?</h4>
            <p>En viajes, cenas y regalos, al terminar: es cuando todo el mundo tiene fresco quién pagó qué. En convivencias, lo más manejable es una liquidación al mes, coincidiendo con el pago del alquiler, para que los saldos no se acumulen. Las deudas antiguas son mucho más incómodas de reclamar que las recientes, y es cuando surgen los desacuerdos sobre importes que ya nadie recuerda con precisión.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué pasa si alguien se va del grupo con saldo pendiente?</h4>
            <p>Conviene saldar antes de que se marche, mientras el reparto sigue siendo evidente para todos. Si ya se ha ido, mantener a esa persona registrada permite ver su saldo exacto y reclamarlo con el detalle de los gastos concretos. Eliminarla del grupo borra también los gastos que adelantó, así que hazlo solo cuando las cuentas estén cerradas.</p>
          </div>
        </div>

        {/* Guía paso a paso */}
        <h3 className={styles.eduTitle}><span aria-hidden="true">📋</span> Cómo llevar las cuentas de un grupo sin discusiones</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>Acordad qué entra en el bote y qué no</h4>
              <p>Antes de registrar nada: ¿el taxi de quien llegó tarde es común? ¿Y el capricho del súper? Una conversación de cinco minutos al empezar evita la mayoría de los desacuerdos posteriores, porque después las discusiones no son sobre las cuentas sino sobre lo que cada uno daba por supuesto.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>Elige el tipo de grupo y añade a las personas</h4>
              <p>El tipo de grupo (viaje, cena, regalo o piso) solo cambia las categorías disponibles, para que registrar sea rápido. Añade a todas las personas que vayan a participar en algún gasto, aunque alguna no adelante dinero nunca: si no está, su parte no se reparte.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>Registra cada gasto en el momento de pagarlo</h4>
              <p>Con el ticket en la mano se tarda medio minuto: descripción, importe, quién pagó y entre quiénes se reparte. Reconstruirlo tres días después de memoria es la fuente número uno de errores y de discusiones sobre si fueron 12 o 14 euros.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h4>Marca bien quién participa en cada gasto</h4>
              <p>Por defecto se reparte entre todos, que es lo correcto para el alojamiento o el alquiler. Desmarca a quien no participe en los gastos concretos: la entrada del museo al que no fue, la cena que se saltó, la bebida que no tomó. Es el ajuste que hace que el resultado se perciba como justo.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h4>Copia la liquidación y mándala al grupo</h4>
              <p>El botón de copiar genera el resumen en texto: total, personas y la lista de pagos concretos. Pegarlo en el chat común hace visible el cálculo para todos, que es lo que evita la sensación de que alguien ha decidido por su cuenta cuánto debe cada uno.</p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <h3 className={styles.eduTitle}><span aria-hidden="true">✅</span> Seis costumbres que evitan los conflictos de dinero en grupo</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📲</span>
            <h4>Registra en el momento</h4>
            <p>No esperes al final del día. Ticket en mano y medio minuto: apuntar de memoria genera errores y discusiones sobre importes que ya nadie recuerda bien.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗓️</span>
            <h4>Fija cuándo se salda</h4>
            <p>Al terminar el viaje o un día concreto del mes. Cuando el momento está acordado de antemano, nadie tiene que asumir el papel incómodo de reclamar.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💬</span>
            <h4>Habla de dinero al principio</h4>
            <p>Qué es común y qué es de cada uno, y qué pasa si alguien no participa en algo. Las reglas explícitas al inicio evitan casi todos los malentendidos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧾</span>
            <h4>Anota el gasto pequeño también</h4>
            <p>El detergente, el peaje, el café de todos. Sueltos parecen irrelevantes, pero si siempre los adelanta la misma persona acaban siendo una cantidad seria.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">👀</span>
            <h4>Enseña el cálculo, no el resultado</h4>
            <p>Copiar la liquidación al chat común hace que todos vean de dónde sale cada cifra. Un número sin explicación siempre despierta la sospecha de que hay un error.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🤝</span>
            <h4>Sé flexible con los importes mínimos</h4>
            <p>Por debajo de dos o tres euros, redondear sale más a cuenta que ajustar. El tiempo y la incomodidad de reclamar 1,37 € no compensan casi nunca.</p>
          </div>
        </div>

        {/* Warning */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores que enredan las cuentas de un grupo</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Repartir todo entre todos por comodidad:</strong> es rápido, pero quien no participó en la mitad de los gastos lo nota y lo recuerda. Marcar participantes cuesta un segundo por gasto.</li>
            <li><strong>Dejar las cuentas para «cuando volvamos»:</strong> al volver, la mitad de los importes ya no se recuerdan con exactitud y aparecen las versiones distintas del mismo gasto.</li>
            <li><strong>Confiar en la división mental del total:</strong> dividir de cabeza funciona con dos personas y un gasto. Con cinco personas y quince gastos, el resultado casi nunca cuadra.</li>
            <li><strong>Redondear cada parte por separado:</strong> si cada uno redondea su cifra, la suma no da el total y aparece un descuadre que nadie sabe explicar ni a quién reclamar.</li>
            <li><strong>Mezclar gastos personales con los del grupo:</strong> lo que se compró para uno mismo no es gasto compartido. Definirlo antes de registrar evita tener que deshacer entradas después.</li>
            <li><strong>Eliminar a alguien antes de cerrar sus cuentas:</strong> al quitar a una persona se borran también los gastos que adelantó, y con ellos la prueba de lo que se le debe.</li>
          </ul>
        </div>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-gastos-compartidos')} />

      <ShareCard appName="calculadora-gastos-compartidos" />
      <Footer appName="calculadora-gastos-compartidos" />
    </div>
  );
}
