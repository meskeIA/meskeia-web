'use client';

import { useState, useCallback } from 'react';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice } from '@/components';
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

  // Reset
  const resetear = () => {
    setDestino('');
    setNumeroDias(7);
    setPersonas(2);
    setDivisa('EUR');
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
          </div>
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

        <EducationalSection title="Consejos para planificar el presupuesto de viaje" subtitle="Organiza tus gastos, divide entre el grupo y viaja sin sorpresas económicas">
          <h3>¿Cómo presupuestar un viaje correctamente?</h3>
          <p>
            La clave es desglosar los gastos en categorías claras y añadir siempre un margen de imprevistos
            (habitualmente entre un 10% y un 20% del total). Los destinos más económicos de Asia o Latinoamérica
            pueden ser hasta 5 veces más baratos que Europa Occidental.
          </p>

          <h3>Categorías principales de gasto en viajes</h3>
          <ul>
            <li><strong>Transporte (30-40%):</strong> vuelos, trenes, autobuses, taxis, alquiler de coche</li>
            <li><strong>Alojamiento (25-35%):</strong> hotel, Airbnb, hostel, camping</li>
            <li><strong>Comida (15-25%):</strong> restaurantes, supermercados, mercados locales</li>
            <li><strong>Actividades (10-15%):</strong> museos, excursiones, tours, deportes</li>
            <li><strong>Imprevistos (10-20%):</strong> siempre reserva un colchón de seguridad</li>
          </ul>

          <h3>Trucos para ahorrar en viajes</h3>
          <ul>
            <li>Reserva con 2-3 meses de antelación para vuelos y hoteles populares</li>
            <li>Viaja en temporada baja: precios hasta un 40% más bajos</li>
            <li>Usa tarjetas sin comisiones en el extranjero</li>
            <li>Come donde comen los locales: calidad alta, precio bajo</li>
            <li>Compara precios en distintas plataformas antes de reservar</li>
          </ul>

          <h3>Dividir gastos en grupo</h3>
          <p>
            Para viajes en grupo, esta calculadora divide el total entre todos los viajeros.
            Si los gastos son desiguales (alguien pagó más), considera usar una app como Splitwise
            para hacer la liquidación final entre el grupo.
          </p>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('presupuesto-viaje')} />
        <Footer appName="presupuesto-viaje" />
      </main>
    </div>
  );
}
