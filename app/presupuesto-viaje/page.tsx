'use client';

import { useState, useCallback } from 'react';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard, DisclaimerCard } from '@/components';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { jsonLd } from './metadata';
import styles from './PresupuestoViaje.module.css';
import { getRelatedApps } from '@/data/app-relations';

interface GastoItem {
  id: string;
  descripcion: string;
  importe: number;
}

interface Categoria {
  id: string;
  icono: string;
  nombre: string;
  gastos: GastoItem[];
}

const CATEGORIAS_INICIALES: Categoria[] = [
  {
    id: 'transporte',
    icono: '✈️',
    nombre: 'Transporte',
    gastos: [
      { id: 'vuelo', descripcion: 'Vuelos', importe: 0 },
      { id: 'tren', descripcion: 'Trenes / buses', importe: 0 },
    ],
  },
  {
    id: 'alojamiento',
    icono: '🏨',
    nombre: 'Alojamiento',
    gastos: [
      { id: 'hotel', descripcion: 'Hotel / Airbnb', importe: 0 },
    ],
  },
  {
    id: 'comida',
    icono: '🍽️',
    nombre: 'Comida y bebida',
    gastos: [
      { id: 'restaurantes', descripcion: 'Restaurantes', importe: 0 },
      { id: 'supermercado', descripcion: 'Supermercado', importe: 0 },
    ],
  },
  {
    id: 'actividades',
    icono: '🎡',
    nombre: 'Actividades y entradas',
    gastos: [
      { id: 'museos', descripcion: 'Museos / monumentos', importe: 0 },
      { id: 'excursiones', descripcion: 'Excursiones', importe: 0 },
    ],
  },
  {
    id: 'otros',
    icono: '🛍️',
    nombre: 'Otros',
    gastos: [
      { id: 'souvenirs', descripcion: 'Compras / souvenirs', importe: 0 },
      { id: 'emergencia', descripcion: 'Imprevistos', importe: 0 },
    ],
  },
];

const DIVISAS_COMUNES = ['EUR', 'USD', 'GBP', 'MXN', 'ARS', 'COP', 'PEN', 'CLP', 'BRL'];

const generarId = () => Math.random().toString(36).slice(2, 9);

export default function PresupuestoViaje() {
  const [destino, setDestino] = useState<string>('');
  const [numeroDias, setNumeroDias] = useState<number>(7);
  const [personas, setPersonas] = useState<number>(2);
  const [divisa, setDivisa] = useState<string>('EUR');
  const [categorias, setCategorias] = useState<Categoria[]>(CATEGORIAS_INICIALES);
  const [presupuestoMaximo, setPresupuestoMaximo] = useState<number>(0);

  // Calcular subtotal de una categoría
  const subtotalCategoria = useCallback((cat: Categoria): number => {
    return cat.gastos.reduce((acc, g) => acc + (g.importe || 0), 0);
  }, []);

  // Calcular total general
  const totalGeneral = categorias.reduce((acc, cat) => acc + subtotalCategoria(cat), 0);

  // Por persona
  const porPersona = personas > 0 ? totalGeneral / personas : 0;

  // Por día y persona
  const porDiaPersona = numeroDias > 0 && personas > 0 ? totalGeneral / numeroDias / personas : 0;

  // Actualizar importe de un gasto
  const actualizarImporte = (catId: string, gastoId: string, valor: string) => {
    const num = parseFloat(valor.replace(',', '.')) || 0;
    setCategorias(prev => prev.map(cat =>
      cat.id === catId
        ? { ...cat, gastos: cat.gastos.map(g => g.id === gastoId ? { ...g, importe: num } : g) }
        : cat
    ));
  };

  // Actualizar descripción de un gasto
  const actualizarDescripcion = (catId: string, gastoId: string, desc: string) => {
    setCategorias(prev => prev.map(cat =>
      cat.id === catId
        ? { ...cat, gastos: cat.gastos.map(g => g.id === gastoId ? { ...g, descripcion: desc } : g) }
        : cat
    ));
  };

  // Añadir gasto a una categoría
  const aniadirGasto = (catId: string) => {
    setCategorias(prev => prev.map(cat =>
      cat.id === catId
        ? { ...cat, gastos: [...cat.gastos, { id: generarId(), descripcion: 'Nuevo gasto', importe: 0 }] }
        : cat
    ));
  };

  // Eliminar gasto
  const eliminarGasto = (catId: string, gastoId: string) => {
    setCategorias(prev => prev.map(cat =>
      cat.id === catId
        ? { ...cat, gastos: cat.gastos.filter(g => g.id !== gastoId) }
        : cat
    ));
  };

  // Actualizar nombre de categoría
  const actualizarNombreCategoria = (catId: string, nombre: string) => {
    setCategorias(prev => prev.map(cat =>
      cat.id === catId ? { ...cat, nombre } : cat
    ));
  };

  // Eliminar categoría
  const eliminarCategoria = (catId: string) => {
    setCategorias(prev => prev.filter(cat => cat.id !== catId));
  };

  // Añadir nueva categoría
  const aniadirCategoria = () => {
    const nuevaCat: Categoria = {
      id: generarId(),
      icono: '📌',
      nombre: 'Nueva categoría',
      gastos: [{ id: generarId(), descripcion: 'Gasto', importe: 0 }],
    };
    setCategorias(prev => [...prev, nuevaCat]);
  };

  // Distribuir presupuesto máximo automáticamente
  const distribuirPresupuesto = useCallback(() => {
    if (!presupuestoMaximo || presupuestoMaximo <= 0) return;
    const distribucion: Record<string, number> = {
      transporte: 0.30,
      alojamiento: 0.35,
      comida: 0.20,
      actividades: 0.10,
      otros: 0.05,
    };
    setCategorias(prev => prev.map(cat => {
      const porcentaje = distribucion[cat.id] ?? 0;
      const importeCategoria = presupuestoMaximo * porcentaje;
      if (porcentaje === 0 || cat.gastos.length === 0) return cat;
      const importePorGasto = importeCategoria / cat.gastos.length;
      return {
        ...cat,
        gastos: cat.gastos.map(g => ({
          ...g,
          importe: Math.round(importePorGasto * 100) / 100,
        })),
      };
    }));
  }, [presupuestoMaximo]);

  // Reset
  const resetear = () => {
    setDestino('');
    setNumeroDias(7);
    setPersonas(2);
    setDivisa('EUR');
    setPresupuestoMaximo(0);
    setCategorias(CATEGORIAS_INICIALES.map(cat => ({
      ...cat,
      gastos: cat.gastos.map(g => ({ ...g, importe: 0 })),
    })));
  };

  const simboloDivisa = divisa === 'EUR' ? '€' : divisa;

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnalyticsTracker appName="presupuesto-viaje" />
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>🗺️ Presupuesto de Viaje</h1>
        <p>Planifica gastos por categorías y divide entre el grupo</p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="presupuesto-viaje-disclaimer"
      />

      <main className={styles.main}>
        {/* Configuración general del viaje */}
        <section className={styles.configuracion}>
          <h2>Datos del viaje</h2>
          <div className={styles.filaConfiguracion}>
            <div className={styles.grupoCampo}>
              <label htmlFor="destino">Destino</label>
              <input
                id="destino"
                type="text"
                className={styles.inputTexto}
                value={destino}
                onChange={e => setDestino(e.target.value)}
                placeholder="Ej: París, Tokio…"
              />
            </div>
            <div className={styles.grupoCampo}>
              <label htmlFor="dias">Días de viaje</label>
              <input
                id="dias"
                type="number"
                className={styles.inputNumero}
                value={numeroDias}
                onChange={e => setNumeroDias(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                inputMode="numeric"
              />
            </div>
            <div className={styles.grupoCampo}>
              <label htmlFor="personas">Personas</label>
              <input
                id="personas"
                type="number"
                className={styles.inputNumero}
                value={personas}
                onChange={e => setPersonas(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                inputMode="numeric"
              />
            </div>
            <div className={styles.grupoCampo}>
              <label htmlFor="divisa">Divisa</label>
              <select
                id="divisa"
                className={styles.inputSelect}
                value={divisa}
                onChange={e => setDivisa(e.target.value)}
              >
                {DIVISAS_COMUNES.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className={styles.grupoCampo}>
              <label htmlFor="presupuestoMax">Presupuesto máximo (opcional)</label>
              <input
                id="presupuestoMax"
                type="number"
                className={styles.inputNumero}
                value={presupuestoMaximo || ''}
                onChange={e => setPresupuestoMaximo(parseFloat(e.target.value.replace(',', '.')) || 0)}
                placeholder="Ej: 2000"
                min="0"
                step="any"
                inputMode="decimal"
                aria-describedby="presupuestoMax-hint"
              />
              <span id="presupuestoMax-hint" className={styles.campoHint}>
                Presupuesto total del viaje para el grupo
              </span>
            </div>
          </div>

          {presupuestoMaximo > 0 && (
            <button
              type="button"
              className={styles.btnDistribuir}
              onClick={distribuirPresupuesto}
              aria-label="Distribuir presupuesto máximo automáticamente entre categorías"
            >
              ✨ Distribuir automáticamente ({formatCurrency(presupuestoMaximo)})
            </button>
          )}
        </section>

        {/* Panel de resultados */}
        <section className={styles.panelResultados} aria-live="polite">
          <h2>
            Resumen{destino ? ` — ${destino}` : ''}
          </h2>

          <div className={styles.totalGeneral}>
            <span className={styles.totalGeneralLabel}>Total del viaje</span>
            <span className={styles.totalGeneralValor}>
              {formatNumber(totalGeneral, 2)}
              <span className={styles.moneda}>{simboloDivisa}</span>
            </span>
          </div>

          <div className={styles.divisionPersonas}>
            <div className={styles.divisionPersonasLabel}>
              Por persona ({personas} {personas === 1 ? 'viajero' : 'viajeros'})
            </div>
            <div className={styles.divisionPersonasValor}>
              {formatNumber(porPersona, 2)} {simboloDivisa}
              {numeroDias > 1 && (
                <span className={styles.porDia}>
                  · {formatNumber(porDiaPersona, 2)} {simboloDivisa}/día
                </span>
              )}
            </div>
          </div>

          {/* Barra presupuesto máximo */}
          {presupuestoMaximo > 0 && (
            <div className={styles.presupuestoMaxSection} aria-live="polite" aria-label="Estado del presupuesto máximo">
              {(() => {
                const porcentajeUsado = Math.round((totalGeneral / presupuestoMaximo) * 100);
                const sobrante = presupuestoMaximo - totalGeneral;
                const sobrePresupuesto = totalGeneral > presupuestoMaximo;
                return (
                  <>
                    <div className={styles.presupuestoMaxHeader}>
                      <span className={styles.presupuestoMaxLabel}>
                        {sobrePresupuesto ? '⚠️ Sobre presupuesto' : '✅ Dentro del presupuesto'}
                      </span>
                      <span className={`${styles.presupuestoMaxValor} ${sobrePresupuesto ? styles.sobrePresupuesto : ''}`}>
                        {formatNumber(totalGeneral, 2)} / {formatNumber(presupuestoMaximo, 2)} {simboloDivisa}
                      </span>
                    </div>
                    <div className={styles.barraPresupuesto} role="progressbar" aria-valuenow={Math.min(porcentajeUsado, 100)} aria-valuemin={0} aria-valuemax={100}>
                      <div
                        className={`${styles.barraPresupuestoRelleno} ${sobrePresupuesto ? styles.barraRoja : porcentajeUsado > 80 ? styles.barraAmbar : styles.barraVerde}`}
                        style={{ width: `${Math.min(porcentajeUsado, 100)}%` }}
                      />
                    </div>
                    <div className={styles.presupuestoMaxInfo}>
                      <span>{porcentajeUsado}% del presupuesto</span>
                      {sobrePresupuesto
                        ? <span className={styles.textoRojo}>Te excedes en {formatNumber(Math.abs(sobrante), 2)} {simboloDivisa}</span>
                        : <span className={styles.textoVerde}>Te sobran {formatNumber(sobrante, 2)} {simboloDivisa}</span>
                      }
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Desglose por categorías */}
          {totalGeneral > 0 && (
            <div className={styles.desglose}>
              {categorias
                .filter(cat => subtotalCategoria(cat) > 0)
                .map(cat => {
                  const subtotal = subtotalCategoria(cat);
                  const porcentaje = totalGeneral > 0 ? (subtotal / totalGeneral) * 100 : 0;
                  return (
                    <div key={cat.id}>
                      <div className={styles.desgloseItem}>
                        <span className={styles.desgloseNombre}>
                          <span aria-hidden="true">{cat.icono}</span>
                          {cat.nombre}
                        </span>
                        <span className={styles.desgloseImporte}>
                          {formatNumber(subtotal, 2)} {simboloDivisa}
                          <span className={styles.desglosePorc}>
                            ({formatNumber(porcentaje, 0)}%)
                          </span>
                        </span>
                      </div>
                      <div className={styles.barraProgreso}>
                        <div
                          className={styles.barraProgresoRelleno}
                          role="presentation"
                          data-porcentaje={porcentaje}
                          ref={el => { if (el) el.style.width = `${porcentaje}%`; }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </section>

        {/* Categorías de gastos */}
        <section className={styles.categorias}>
          <div className={styles.categoriasHeader}>
            <h2>Gastos por categoría</h2>
            <button
              type="button"
              className={styles.btnAniadirCategoria}
              onClick={aniadirCategoria}
              aria-label="Añadir nueva categoría de gastos"
            >
              <span aria-hidden="true">+</span> Categoría
            </button>
          </div>

          {categorias.map(cat => (
            <div key={cat.id} className={styles.tarjetaCategoria}>
              <div className={styles.cabeceraTarjeta}>
                <span className={styles.iconoCategoria} aria-hidden="true">{cat.icono}</span>
                <input
                  type="text"
                  className={styles.nombreCategoria}
                  value={cat.nombre}
                  onChange={e => actualizarNombreCategoria(cat.id, e.target.value)}
                  aria-label={`Nombre de categoría: ${cat.nombre}`}
                />
                <button
                  type="button"
                  className={styles.btnEliminar}
                  onClick={() => eliminarCategoria(cat.id)}
                  aria-label={`Eliminar categoría ${cat.nombre}`}
                  title="Eliminar categoría"
                >
                  ✕
                </button>
              </div>

              <div className={styles.filasGastos}>
                {cat.gastos.map(gasto => (
                  <div key={gasto.id} className={styles.filaGasto}>
                    <input
                      type="text"
                      className={styles.inputGastoDesc}
                      value={gasto.descripcion}
                      onChange={e => actualizarDescripcion(cat.id, gasto.id, e.target.value)}
                      placeholder="Descripción"
                      aria-label="Descripción del gasto"
                    />
                    <input
                      type="number"
                      className={styles.inputGastoImporte}
                      value={gasto.importe || ''}
                      onChange={e => actualizarImporte(cat.id, gasto.id, e.target.value)}
                      placeholder="0"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      aria-label={`Importe de ${gasto.descripcion} en ${divisa}`}
                    />
                    <button
                      type="button"
                      className={styles.btnEliminarGasto}
                      onClick={() => eliminarGasto(cat.id, gasto.id)}
                      aria-label={`Eliminar ${gasto.descripcion}`}
                      title="Eliminar gasto"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className={styles.btnAniadirGasto}
                onClick={() => aniadirGasto(cat.id)}
              >
                + Añadir gasto
              </button>

              {subtotalCategoria(cat) > 0 && (
                <div className={styles.subtotalCategoria}>
                  Subtotal: {formatNumber(subtotalCategoria(cat), 2)} {simboloDivisa}
                </div>
              )}
            </div>
          ))}
        </section>

        <button type="button" className={styles.btnReset} onClick={resetear}>
          Empezar de nuevo
        </button>

        <EducationalSection title="Guía completa para presupuestar tu viaje" subtitle="Organiza tus gastos, divide entre el grupo y viaja sin sorpresas económicas">

          {/* SECCIÓN 1: Tabla Comparativa */}
          <h3>Comparativa de tipos de viaje por coste</h3>
          <p>Elige el estilo que se adapta a tu presupuesto. Costes estimados por persona y día en Europa:</p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>Mochilero</th>
                  <th>Turismo estándar</th>
                  <th>Viaje de lujo</th>
                  <th>Familiar (2 adultos + 2 niños)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Coste diario/persona (Europa)</strong></td>
                  <td>50–70 €</td>
                  <td>100–150 €</td>
                  <td>250–500 €</td>
                  <td>80–120 € /persona</td>
                </tr>
                <tr>
                  <td><strong>Alojamiento típico</strong></td>
                  <td>Hostel cama en dorm (15–30 €)</td>
                  <td>Hotel 3★ o Airbnb (60–120 €/noche)</td>
                  <td>Hotel 4–5★ (200–500 €/noche)</td>
                  <td>Apartamento turístico (80–160 €/noche)</td>
                </tr>
                <tr>
                  <td><strong>Transporte</strong></td>
                  <td>Vuelos low-cost, Interrail, autobús</td>
                  <td>Vuelos directos, trenes AVE/Eurostar</td>
                  <td>Business class, traslados privados</td>
                  <td>Coche de alquiler o AVE familiar</td>
                </tr>
                <tr>
                  <td><strong>Comida</strong></td>
                  <td>Supermercado + 1 restaurante/día (10–20 €)</td>
                  <td>Restaurantes medios (25–50 €)</td>
                  <td>Restaurantes premium (80–200 €)</td>
                  <td>Mix supermercado + menús económicos</td>
                </tr>
                <tr>
                  <td><strong>Planificación previa</strong></td>
                  <td>Alta (busca chollos)</td>
                  <td>Media (reservas con semanas de antelación)</td>
                  <td>Baja (flexibilidad total)</td>
                  <td>Muy alta (coordinación compleja)</td>
                </tr>
                <tr>
                  <td><strong>Ahorro posible vs. improv.</strong></td>
                  <td>40–60% respecto a estándar</td>
                  <td>Referencia base</td>
                  <td>Sin prioridad de ahorro</td>
                  <td>20–35% con apartamento vs. hotel</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECCIÓN 2: Casos de Uso */}
          <h3>Perfiles de viajero: casos reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎒</span>
                <strong>Pareja en Interrail Europa (presupuesto ajustado)</strong>
              </div>
              <p className={styles.escenarioExample}>
                21 días por Alemania, República Checa, Austria y Hungría. Pase Interrail global de 21 días
                (~360 € por persona), hostels y Airbnb económicos, cocinando en los alojamientos.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Presupuesto estimado:</strong> 1.800–2.200 € por persona (85–105 €/día incluyendo transporte).
                Usa la tarjeta Revolut para pagos en Forint y Corona checa sin comisiones.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👨‍👩‍👧‍👦</span>
                <strong>Familia de 4 en vacaciones de verano en España</strong>
              </div>
              <p className={styles.escenarioExample}>
                10 días en Mallorca. Apartamento turístico (110 €/noche), vuelos nacionales,
                coche de alquiler (40 €/día), comidas mix entre supermercado y restaurantes.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Presupuesto estimado:</strong> 3.500–4.500 € en total (87–112 €/persona/día).
                Reserva apartamento en octubre para julio y ahorra hasta un 30% frente a reserva tardía.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🌏</span>
                <strong>Grupo de amigos a Tailandia</strong>
              </div>
              <p className={styles.escenarioExample}>
                14 días entre Bangkok, Chiang Mai y Koh Samui. Vuelo Madrid-Bangkok (~700–900 €),
                alojamientos económicos (20–40 €/noche), comida local (8–15 €/día).
              </p>
              <p className={styles.escenarioTip}>
                <strong>Presupuesto estimado:</strong> 1.500–2.000 € por persona (todo incluido).
                Usa Splitwise para repartir gastos compartidos en el grupo y liquidar al final.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
                <strong>Viajero de negocios gestionando gastos para reembolso</strong>
              </div>
              <p className={styles.escenarioExample}>
                Viaje de 3 días a Londres. Hotel de negocios (150–200 €/noche), vuelo business o flex,
                taxis o Uber, comidas en restaurantes con ticket de empresa.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Presupuesto estimado:</strong> 900–1.400 € totales. Guarda todos los justificantes
                digitalizados; los gastos de alojamiento y manutención son deducibles con límites legales.
              </p>
            </div>
          </div>

          {/* SECCIÓN 3: FAQ */}
          <h3>Preguntas frecuentes sobre presupuesto de viaje</h3>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <strong>¿Cuánto dinero llevar en efectivo a un país extranjero?</strong>
              <p>Como regla general, lleva efectivo suficiente para 2–3 días de gastos básicos. En Europa Occidental
              basta con 100–200 € en efectivo; en destinos como Tailandia o Marruecos conviene tener más efectivo
              local. Para el resto usa tarjeta sin comisiones.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo dividir gastos cuando uno del grupo paga más que otro?</strong>
              <p>Anota quién paga cada gasto durante el viaje (foto del ticket en el móvil). Al final usa apps como
              <strong> Splitwise</strong> o <strong>Tricount</strong>: introducen todos los pagos y calculan
              automáticamente quién debe cuánto a quién con el mínimo número de transferencias.</p>
              <span className={styles.faqTip}>Consejo: acordad antes del viaje si los gastos se dividen igual o proporcional.</span>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué tarjetas no cobran comisiones en el extranjero?</strong>
              <p>Las mejores opciones para viajeros españoles son <strong>Revolut</strong> (hasta 1.000 €/mes sin
              comisiones en plan gratuito), <strong>Wise</strong> (tipo de cambio interbancario real) y
              <strong> N26</strong> (tarjeta débito gratuita sin comisiones en zona euro). Evita sacar más de lo
              necesario en cajeros con Revolut en plan gratuito (cobran por exceso).</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cambio de moneda en el destino o antes de viajar?</strong>
              <p>Nunca cambies en el aeropuerto: las casas de cambio aeroportuarias aplican comisiones del
              <strong> 5–8%</strong>. Las mejores opciones: usa tu tarjeta Revolut/Wise directamente en cajeros o
              comercios del destino (tipo de cambio real), o cambia en oficinas de cambio del centro de la ciudad
              del destino (mejores tarifas que en origen).</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Es obligatorio contratar seguro de viaje?</strong>
              <p>Para viajar dentro de la UE basta con la Tarjeta Sanitaria Europea (gratuita, solicítala en la
              Seguridad Social). Para viajes fuera de la UE —especialmente EEUU, Canadá o Asia— el seguro es
              imprescindible: una hospitalización en EEUU puede costar 50.000–100.000 €. Precio orientativo:
              20–60 € por persona/viaje según cobertura y destino.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo gestionar imprevistos económicos durante el viaje?</strong>
              <p>Reserva un fondo de emergencia del <strong>10–15% del presupuesto total</strong> en una cuenta
              separada (no lo gastes). Si surge un imprevisto grave (accidente, robo), contacta primero con tu
              seguro de viaje y con el banco para bloquear tarjetas si es necesario. Lleva siempre una segunda
              tarjeta de banco diferente como respaldo.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cuál es el mejor momento para reservar vuelos y hotel?</strong>
              <p>Para vuelos europeos, el rango óptimo es <strong>6–8 semanas antes</strong> del viaje; para
              intercontinentales, <strong>2–4 meses antes</strong>. Los martes y miércoles suelen tener precios
              ligeramente inferiores. Para hoteles en destinos populares, reserva con mayor antelación en temporada
              alta (julio-agosto, Navidad, Semana Santa).</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿El presupuesto de viaje es deducible de impuestos para autónomos?</strong>
              <p>Sí, si el viaje tiene finalidad profesional demostrable: asistencia a ferias, visitas a clientes,
              formación. Son deducibles: transporte, alojamiento y manutención (con límites: 26,67 €/día en España
              y 48,08 €/día en el extranjero para manutención). Guarda siempre factura o ticket, y justifica la
              relación con tu actividad económica.</p>
            </li>
          </ul>

          {/* SECCIÓN 4: Guía Paso a Paso */}
          <h3>Guía paso a paso: planifica el presupuesto de tu viaje</h3>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Define el presupuesto total disponible</strong>
                <p>Antes de empezar a planificar, establece cuánto dinero tienes disponible para el viaje
                completo (ahorro dedicado + lo que puedes gastar sin comprometer otros objetivos financieros).
                Este número es tu techo inamovible.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Investiga los costes del destino</strong>
                <p>Busca el coste de vida medio del destino (Numbeo.com es una buena referencia). Calcula si
                el presupuesto es realista para los días planificados y el número de personas. Para Europa
                Occidental, cuenta al menos 80–120 € por persona y día en modo estándar.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Reserva transporte principal primero</strong>
                <p>Los vuelos y el transporte de larga distancia son el gasto más volátil en precio. Reserva
                primero y descuenta ese importe del presupuesto total. Activa alertas de precio en Google Flights
                o Kayak para encontrar el momento óptimo de compra (6–8 semanas para vuelos europeos).</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Reserva alojamiento y estima el resto de categorías</strong>
                <p>Con el transporte fijo, reserva alojamiento (segunda partida más grande). Luego estima
                comida, actividades y transporte local usando esta calculadora. Rellena cada categoría con
                importes realistas, no optimistas.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Añade el fondo de imprevistos (10–15%)</strong>
                <p>Suma un 10–15% del total estimado como colchón de seguridad en la categoría "Imprevistos".
                Este dinero cubre: tasas inesperadas, retrasos con gastos extra, compras no planificadas o
                cualquier emergencia. Si no lo usas, ¡vuelve a casa con ese dinero!</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Prepara los medios de pago para el viaje</strong>
                <p>Activa o consigue una tarjeta sin comisiones en el extranjero (Revolut, Wise, N26). Lleva
                una segunda tarjeta de otro banco como respaldo. Determina cuánto efectivo local necesitarás
                para los primeros días. Cambia en la ciudad de destino o usa cajero con tu tarjeta Revolut.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Liquida cuentas al volver</strong>
                <p>Reúne todos los tickets y extractos. Si viajaste en grupo, introduce todos los gastos en
                Splitwise y realiza las transferencias pendientes. Si el viaje fue por trabajo, prepara los
                justificantes para la declaración de gastos. Anota las desviaciones para mejorar en el
                próximo viaje.</p>
              </div>
            </li>
          </ol>

          {/* SECCIÓN 5: Mejores Prácticas */}
          <h3>6 consejos clave para ahorrar en tu próximo viaje</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✈️</span>
              <strong>Reserva vuelos 6–8 semanas antes</strong>
              <p>Para destinos europeos, este es el rango de precio óptimo. Para vuelos intercontinentales,
              reserva con 2–4 meses de antelación. Los martes y miércoles suelen tener tarifas ligeramente
              más bajas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🛡️</span>
              <strong>Fondo de emergencia del 10–15%</strong>
              <p>Siempre añade un margen de imprevistos sobre el presupuesto estimado. Este colchón cubre
              tasas aeroportuarias no previstas, retrasos, urgencias médicas o cualquier gasto inesperado
              que arruinaría el viaje sin él.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💳</span>
              <strong>Tarjeta sin comisiones para pagos en el extranjero</strong>
              <p>Revolut, Wise y N26 no cobran comisión por cambio de divisa (tipo de cambio real). Ahorro
              potencial de 50–150 € en un viaje de 2 semanas frente a usar la tarjeta bancaria española
              convencional (comisión media: 2–3% + 1–2 € por operación).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏠</span>
              <strong>Airbnb vs. hotel para estancias largas</strong>
              <p>Para estancias de más de 5 días, un apartamento en Airbnb suele ser más económico que un
              hotel equivalente (25–40% de ahorro) y permite cocinar, reduciendo el gasto en comidas.
              Para 1–2 noches, el hotel puede ser más cómodo y a veces más barato.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📱</span>
              <strong>Apps de división de gastos en grupo</strong>
              <p>Splitwise y Tricount son gratuitas y evitan los malentendidos económicos en el grupo.
              Uno paga, todos lo ven en la app. Al final del viaje, la app calcula quién debe dinero a quién
              con el mínimo de transferencias posible.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <strong>Viaja en temporada baja</strong>
              <p>Septiembre-octubre y abril-mayo son temporada media-baja en la mayoría de destinos europeos:
              vuelos y hoteles hasta un 40% más baratos que en agosto, menos aglomeraciones y mismo clima
              agradable. Para el Caribe y Asia, investiga la temporada según el destino concreto.</p>
            </div>
          </div>

          {/* SECCIÓN 6: Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>6 errores comunes que disparan el coste del viaje</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>No incluir las tasas aeroportuarias en el precio del vuelo.</strong> Los vuelos
                low-cost (Ryanair, Vueling) muestran precios base sin tasas. El precio real puede ser un
                30–50% superior al anunciado. Revisa siempre el precio final antes de comparar.
              </li>
              <li>
                <strong>Cambiar moneda en el aeropuerto.</strong> Las casas de cambio aeroportuarias aplican
                comisiones del 5–8% sobre el tipo de cambio oficial. En un cambio de 500 €, pierdes entre
                25 y 40 €. Usa cajero con tarjeta Revolut o cambia en el centro de la ciudad de destino.
              </li>
              <li>
                <strong>Viajar sin seguro de viaje fuera de la UE.</strong> Una hospitalización en Estados
                Unidos puede superar los 50.000 €. Un seguro de viaje con asistencia sanitaria internacional
                cuesta entre 20 y 60 € por persona para un viaje de dos semanas. La diferencia es abismal.
              </li>
              <li>
                <strong>Subestimar el coste del transporte local.</strong> Los taxis, Uber, metro y autobús
                en el destino pueden suponer 15–30 € diarios adicionales en ciudades grandes. Incluye esta
                partida en tu presupuesto desde el principio, especialmente si el alojamiento está lejos
                del centro.
              </li>
              <li>
                <strong>Olvidar las propinas en países donde son obligatorias.</strong> En EEUU y Canadá,
                la propina del 15–20% es prácticamente obligatoria y no está incluida en el precio del menú.
                En México, Brasil y muchos países latinoamericanos se espera un 10–15%. Calcula este extra
                en tu presupuesto de comidas.
              </li>
              <li>
                <strong>No tener fondo de emergencia para imprevistos.</strong> El error más común: presupuestar
                justo sin margen. Una pérdida de equipaje, un vuelo cancelado con gastos extra o una visita al
                médico pueden arruinar el viaje económicamente. El fondo del 10–15% no es opcional, es seguridad.
              </li>
            </ul>
          </div>

        </EducationalSection>

        <RelatedApps apps={getRelatedApps('presupuesto-viaje')} />
        <ShareCard appName="presupuesto-viaje" />
      <Footer appName="presupuesto-viaje" />
      </main>
    </div>
  );
}
