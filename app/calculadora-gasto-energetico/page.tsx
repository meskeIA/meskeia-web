'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './CalculadoraGastoEnergetico.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard, DisclaimerCard } from '@/components';
import { formatNumber, formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

interface Electrodomestico {
  id: string;
  nombre: string;
  potencia: number; // Watts
  horasDia: number;
  diasMes: number;
  cantidad: number;
}

interface ElectrodomesticoPreset {
  nombre: string;
  potencia: number;
  horasTypicas: number;
  icono: string;
  categoria: string;
}

const PRESETS_ELECTRODOMESTICOS: ElectrodomesticoPreset[] = [
  // Climatización
  { nombre: 'Aire acondicionado', potencia: 1500, horasTypicas: 6, icono: '❄️', categoria: 'Climatización' },
  { nombre: 'Calefactor eléctrico', potencia: 2000, horasTypicas: 4, icono: '🔥', categoria: 'Climatización' },
  { nombre: 'Radiador de aceite', potencia: 1500, horasTypicas: 6, icono: '🌡️', categoria: 'Climatización' },
  { nombre: 'Ventilador', potencia: 50, horasTypicas: 8, icono: '🌀', categoria: 'Climatización' },
  { nombre: 'Deshumidificador', potencia: 300, horasTypicas: 8, icono: '💧', categoria: 'Climatización' },

  // Cocina
  { nombre: 'Nevera/Frigorífico', potencia: 150, horasTypicas: 24, icono: '🧊', categoria: 'Cocina' },
  { nombre: 'Horno eléctrico', potencia: 2000, horasTypicas: 0.5, icono: '🍳', categoria: 'Cocina' },
  { nombre: 'Vitrocerámica/Inducción', potencia: 2000, horasTypicas: 1, icono: '🍲', categoria: 'Cocina' },
  { nombre: 'Microondas', potencia: 1000, horasTypicas: 0.25, icono: '📻', categoria: 'Cocina' },
  { nombre: 'Lavavajillas', potencia: 1800, horasTypicas: 1.5, icono: '🍽️', categoria: 'Cocina' },
  { nombre: 'Cafetera', potencia: 900, horasTypicas: 0.25, icono: '☕', categoria: 'Cocina' },
  { nombre: 'Tostadora', potencia: 800, horasTypicas: 0.1, icono: '🍞', categoria: 'Cocina' },

  // Lavado
  { nombre: 'Lavadora', potencia: 500, horasTypicas: 1.5, icono: '🧺', categoria: 'Lavado' },
  { nombre: 'Secadora', potencia: 2500, horasTypicas: 1, icono: '👕', categoria: 'Lavado' },
  { nombre: 'Plancha', potencia: 1200, horasTypicas: 0.5, icono: '👔', categoria: 'Lavado' },

  // Iluminación
  { nombre: 'Bombilla LED', potencia: 10, horasTypicas: 5, icono: '💡', categoria: 'Iluminación' },
  { nombre: 'Bombilla incandescente', potencia: 60, horasTypicas: 5, icono: '💡', categoria: 'Iluminación' },
  { nombre: 'Bombilla halógena', potencia: 50, horasTypicas: 5, icono: '💡', categoria: 'Iluminación' },

  // Electrónica
  { nombre: 'Televisor LED', potencia: 100, horasTypicas: 4, icono: '📺', categoria: 'Electrónica' },
  { nombre: 'Ordenador sobremesa', potencia: 300, horasTypicas: 6, icono: '🖥️', categoria: 'Electrónica' },
  { nombre: 'Portátil', potencia: 50, horasTypicas: 6, icono: '💻', categoria: 'Electrónica' },
  { nombre: 'Router WiFi', potencia: 10, horasTypicas: 24, icono: '📶', categoria: 'Electrónica' },
  { nombre: 'Consola videojuegos', potencia: 150, horasTypicas: 2, icono: '🎮', categoria: 'Electrónica' },
  { nombre: 'Cargador móvil', potencia: 5, horasTypicas: 2, icono: '📱', categoria: 'Electrónica' },

  // Agua caliente
  { nombre: 'Termo eléctrico', potencia: 1500, horasTypicas: 3, icono: '🚿', categoria: 'Agua caliente' },
  { nombre: 'Calentador instantáneo', potencia: 5000, horasTypicas: 0.5, icono: '🛁', categoria: 'Agua caliente' },

  // Otros
  { nombre: 'Aspiradora', potencia: 1400, horasTypicas: 0.5, icono: '🧹', categoria: 'Otros' },
  { nombre: 'Secador de pelo', potencia: 1800, horasTypicas: 0.15, icono: '💇', categoria: 'Otros' },
];

// Precios medios de electricidad en España (€/kWh) - Actualizados Nov 2025
const TARIFAS = {
  pvpc: {
    nombre: 'PVPC (Regulada)',
    punta: 0.18,    // 10-14h y 18-22h
    llano: 0.14,    // 8-10h, 14-18h, 22-24h
    valle: 0.08,    // 0-8h
    media: 0.13,
  },
  mercadoLibre: {
    nombre: 'Mercado Libre (Media)',
    fija: 0.15,
  },
};

const POTENCIAS_CONTRATADAS = [
  { kw: 3.45, termino: 30.67 },
  { kw: 4.6, termino: 40.89 },
  { kw: 5.75, termino: 51.12 },
  { kw: 6.9, termino: 61.34 },
  { kw: 8.05, termino: 71.56 },
  { kw: 9.2, termino: 81.79 },
  { kw: 10.35, termino: 92.01 },
];

export default function CalculadoraGastoEnergeticoPage() {
  const [electrodomesticos, setElectrodomesticos] = useState<Electrodomestico[]>([]);
  const [tarifaSeleccionada, setTarifaSeleccionada] = useState<'pvpc' | 'mercadoLibre'>('pvpc');
  const [potenciaContratada, setPotenciaContratada] = useState(4.6);
  const [precioPersonalizado, setPrecioPersonalizado] = useState('');
  const [usarPrecioPersonalizado, setUsarPrecioPersonalizado] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas');

  // Cargar datos del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('calculadoraGastoEnergetico');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.electrodomesticos) setElectrodomesticos(data.electrodomesticos);
      if (data.tarifaSeleccionada) setTarifaSeleccionada(data.tarifaSeleccionada);
      if (data.potenciaContratada) setPotenciaContratada(data.potenciaContratada);
      if (data.precioPersonalizado) setPrecioPersonalizado(data.precioPersonalizado);
      if (data.usarPrecioPersonalizado) setUsarPrecioPersonalizado(data.usarPrecioPersonalizado);
    }
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem('calculadoraGastoEnergetico', JSON.stringify({
      electrodomesticos,
      tarifaSeleccionada,
      potenciaContratada,
      precioPersonalizado,
      usarPrecioPersonalizado,
    }));
  }, [electrodomesticos, tarifaSeleccionada, potenciaContratada, precioPersonalizado, usarPrecioPersonalizado]);

  // Añadir electrodoméstico desde preset
  const añadirDesdePreset = (preset: ElectrodomesticoPreset) => {
    const nuevo: Electrodomestico = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nombre: preset.nombre,
      potencia: preset.potencia,
      horasDia: preset.horasTypicas,
      diasMes: 30,
      cantidad: 1,
    };
    setElectrodomesticos(prev => [...prev, nuevo]);
  };

  // Añadir electrodoméstico personalizado
  const añadirPersonalizado = () => {
    const nuevo: Electrodomestico = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nombre: 'Nuevo electrodoméstico',
      potencia: 100,
      horasDia: 1,
      diasMes: 30,
      cantidad: 1,
    };
    setElectrodomesticos(prev => [...prev, nuevo]);
  };

  // Actualizar electrodoméstico
  const actualizarElectrodomestico = (id: string, campo: keyof Electrodomestico, valor: string | number) => {
    setElectrodomesticos(prev => prev.map(e =>
      e.id === id ? { ...e, [campo]: valor } : e
    ));
  };

  // Eliminar electrodoméstico
  const eliminarElectrodomestico = (id: string) => {
    setElectrodomesticos(prev => prev.filter(e => e.id !== id));
  };

  // Duplicar electrodoméstico
  const duplicarElectrodomestico = (id: string) => {
    const original = electrodomesticos.find(e => e.id === id);
    if (original) {
      const copia: Electrodomestico = {
        ...original,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nombre: `${original.nombre} (copia)`,
      };
      setElectrodomesticos(prev => [...prev, copia]);
    }
  };

  // Calcular consumo de un electrodoméstico
  const calcularConsumoElectrodomestico = (e: Electrodomestico) => {
    const kwhMes = (e.potencia / 1000) * e.horasDia * e.diasMes * e.cantidad;
    return kwhMes;
  };

  // Obtener precio por kWh
  const getPreciokWh = (): number => {
    if (usarPrecioPersonalizado && precioPersonalizado) {
      return parseFloat(precioPersonalizado.replace(',', '.')) || 0;
    }
    if (tarifaSeleccionada === 'pvpc') {
      return TARIFAS.pvpc.media;
    }
    return TARIFAS.mercadoLibre.fija;
  };

  // Cálculos totales
  const calculos = useMemo(() => {
    const consumoTotal = electrodomesticos.reduce((acc, e) => acc + calcularConsumoElectrodomestico(e), 0);
    const preciokWh = getPreciokWh();
    const costeEnergia = consumoTotal * preciokWh;

    const potenciaData = POTENCIAS_CONTRATADAS.find(p => p.kw === potenciaContratada);
    const terminoPotencia = potenciaData ? potenciaData.termino : 40.89;

    const subtotal = costeEnergia + terminoPotencia;
    const impuestoElectricidad = subtotal * 0.05113; // 5.113%
    const baseIVA = subtotal + impuestoElectricidad;
    const iva = baseIVA * 0.21; // 21% IVA
    const total = baseIVA + iva;

    // Consumo por categoría
    const consumoPorCategoria: Record<string, number> = {};
    electrodomesticos.forEach(e => {
      const preset = PRESETS_ELECTRODOMESTICOS.find(p => p.nombre === e.nombre);
      const categoria = preset?.categoria || 'Otros';
      consumoPorCategoria[categoria] = (consumoPorCategoria[categoria] || 0) + calcularConsumoElectrodomestico(e);
    });

    return {
      consumoTotal,
      costeEnergia,
      terminoPotencia,
      impuestoElectricidad,
      iva,
      total,
      preciokWh,
      consumoPorCategoria,
    };
  }, [electrodomesticos, tarifaSeleccionada, potenciaContratada, precioPersonalizado, usarPrecioPersonalizado]);

  // Obtener categorías únicas
  const categorias = useMemo(() => {
    const cats = new Set(PRESETS_ELECTRODOMESTICOS.map(p => p.categoria));
    return ['Todas', ...Array.from(cats)];
  }, []);

  // Filtrar presets por categoría
  const presetsFiltrados = useMemo(() => {
    if (categoriaFiltro === 'Todas') return PRESETS_ELECTRODOMESTICOS;
    return PRESETS_ELECTRODOMESTICOS.filter(p => p.categoria === categoriaFiltro);
  }, [categoriaFiltro]);

  // Limpiar todo
  const limpiarTodo = () => {
    if (confirm('¿Eliminar todos los electrodomésticos de la lista?')) {
      setElectrodomesticos([]);
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Gasto Energético</h1>
        <p className={styles.subtitle}>
          Calcula el consumo eléctrico de tu hogar y descubre cuánto pagas en la factura de luz
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="calculadora-gasto-energetico"
      />

      <div className={styles.mainContent}>
        {/* Panel de configuración */}
        <div className={styles.configPanel}>
          <h2>Configuración de Tarifa</h2>

          <div className={styles.tarifaSelector}>
            <label className={styles.tarifaOption}>
              <input
                type="radio"
                name="tarifa"
                checked={tarifaSeleccionada === 'pvpc' && !usarPrecioPersonalizado}
                onChange={() => { setTarifaSeleccionada('pvpc'); setUsarPrecioPersonalizado(false); }}
              />
              <div className={styles.tarifaInfo}>
                <span className={styles.tarifaNombre}>PVPC (Regulada)</span>
                <span className={styles.tarifaPrecio}>~{formatNumber(TARIFAS.pvpc.media, 3)} €/kWh</span>
              </div>
            </label>

            <label className={styles.tarifaOption}>
              <input
                type="radio"
                name="tarifa"
                checked={tarifaSeleccionada === 'mercadoLibre' && !usarPrecioPersonalizado}
                onChange={() => { setTarifaSeleccionada('mercadoLibre'); setUsarPrecioPersonalizado(false); }}
              />
              <div className={styles.tarifaInfo}>
                <span className={styles.tarifaNombre}>Mercado Libre</span>
                <span className={styles.tarifaPrecio}>~{formatNumber(TARIFAS.mercadoLibre.fija, 3)} €/kWh</span>
              </div>
            </label>

            <label className={styles.tarifaOption}>
              <input
                type="radio"
                name="tarifa"
                checked={usarPrecioPersonalizado}
                onChange={() => setUsarPrecioPersonalizado(true)}
              />
              <div className={styles.tarifaInfo}>
                <span className={styles.tarifaNombre}>Precio personalizado</span>
                <div className={styles.precioPersonalizado}>
                  <input
                    type="text"
                    value={precioPersonalizado}
                    onChange={(e) => setPrecioPersonalizado(e.target.value)}
                    placeholder="0,15"
                    disabled={!usarPrecioPersonalizado}
                  />
                  <span>€/kWh</span>
                </div>
              </div>
            </label>
          </div>

          <div className={styles.potenciaSelector}>
            <label>Potencia contratada:</label>
            <select
              value={potenciaContratada}
              onChange={(e) => setPotenciaContratada(parseFloat(e.target.value))}
            >
              {POTENCIAS_CONTRATADAS.map(p => (
                <option key={p.kw} value={p.kw}>
                  {formatNumber(p.kw, 2)} kW ({formatCurrency(p.termino)}/mes)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Catálogo de electrodomésticos */}
        <div className={styles.catalogoPanel}>
          <h2>Añadir Electrodomésticos</h2>

          <div className={styles.categoriaFilter}>
            {categorias.map(cat => (
              <button
                key={cat}
                type="button"
                className={`${styles.categoriaBtn} ${categoriaFiltro === cat ? styles.active : ''}`}
                onClick={() => setCategoriaFiltro(cat)}
                aria-pressed={categoriaFiltro === cat}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.presetsGrid}>
            {presetsFiltrados.map((preset, index) => (
              <button
                key={index}
                type="button"
                className={styles.presetCard}
                onClick={() => añadirDesdePreset(preset)}
                title={`${preset.potencia}W - ${preset.horasTypicas}h/día típico`}
              >
                <span className={styles.presetIcon} aria-hidden="true">{preset.icono}</span>
                <span className={styles.presetNombre}>{preset.nombre}</span>
                <span className={styles.presetPotencia}>{preset.potencia}W</span>
              </button>
            ))}
            <button
              type="button"
              className={`${styles.presetCard} ${styles.presetCustom}`}
              onClick={añadirPersonalizado}
            >
              <span className={styles.presetIcon} aria-hidden="true">➕</span>
              <span className={styles.presetNombre}>Personalizado</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de electrodomésticos añadidos */}
      {electrodomesticos.length > 0 && (
        <div className={styles.listaPanel}>
          <div className={styles.listaHeader}>
            <h2>Tu consumo ({electrodomesticos.length} aparatos)</h2>
            <button type="button" onClick={limpiarTodo} className={styles.limpiarBtn}>
              <span aria-hidden="true">🗑️</span> Limpiar todo
            </button>
          </div>

          <div className={styles.listaElectrodomesticos}>
            {electrodomesticos.map((e) => {
              const consumo = calcularConsumoElectrodomestico(e);
              const coste = consumo * calculos.preciokWh;
              const preset = PRESETS_ELECTRODOMESTICOS.find(p => p.nombre === e.nombre);

              return (
                <div key={e.id} className={styles.electrodomesticoCard}>
                  <div className={styles.electrodomesticoHeader}>
                    <span className={styles.electrodomesticoIcon}>
                      {preset?.icono || '🔌'}
                    </span>
                    <input
                      type="text"
                      value={e.nombre}
                      onChange={(ev) => actualizarElectrodomestico(e.id, 'nombre', ev.target.value)}
                      className={styles.nombreInput}
                    />
                    <div className={styles.electrodomesticoActions}>
                      <button type="button" onClick={() => duplicarElectrodomestico(e.id)} title="Duplicar">📋</button>
                      <button type="button" onClick={() => eliminarElectrodomestico(e.id)} title="Eliminar">❌</button>
                    </div>
                  </div>

                  <div className={styles.electrodomesticoInputs}>
                    <div className={styles.inputGroup}>
                      <label>Potencia (W)</label>
                      <input
                        type="number"
                        value={e.potencia}
                        onChange={(ev) => actualizarElectrodomestico(e.id, 'potencia', parseInt(ev.target.value) || 0)}
                        min="1"
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Horas/día</label>
                      <input
                        type="number"
                        value={e.horasDia}
                        onChange={(ev) => actualizarElectrodomestico(e.id, 'horasDia', parseFloat(ev.target.value) || 0)}
                        min="0"
                        max="24"
                        step="0.5"
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Días/mes</label>
                      <input
                        type="number"
                        value={e.diasMes}
                        onChange={(ev) => actualizarElectrodomestico(e.id, 'diasMes', parseInt(ev.target.value) || 0)}
                        min="1"
                        max="31"
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Cantidad</label>
                      <input
                        type="number"
                        value={e.cantidad}
                        onChange={(ev) => actualizarElectrodomestico(e.id, 'cantidad', parseInt(ev.target.value) || 1)}
                        min="1"
                      />
                    </div>
                  </div>

                  <div className={styles.electrodomesticoResumen}>
                    <span className={styles.consumoMes}>
                      {formatNumber(consumo, 2)} kWh/mes
                    </span>
                    <span className={styles.costeMes}>
                      {formatCurrency(coste)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resultados */}
      <div className={styles.resultadosPanel}>
        <h2>Resumen de tu Factura Estimada</h2>

        <div className={styles.resultadosGrid}>
          <div className={styles.resultadoCard}>
            <span className={styles.resultadoIcon} aria-hidden="true">⚡</span>
            <span className={styles.resultadoLabel}>Consumo total</span>
            <span className={styles.resultadoValor}>{formatNumber(calculos.consumoTotal, 2)} kWh</span>
          </div>

          <div className={styles.resultadoCard}>
            <span className={styles.resultadoIcon} aria-hidden="true">💡</span>
            <span className={styles.resultadoLabel}>Coste energía</span>
            <span className={styles.resultadoValor}>{formatCurrency(calculos.costeEnergia)}</span>
          </div>

          <div className={styles.resultadoCard}>
            <span className={styles.resultadoIcon} aria-hidden="true">🔌</span>
            <span className={styles.resultadoLabel}>Término potencia</span>
            <span className={styles.resultadoValor}>{formatCurrency(calculos.terminoPotencia)}</span>
          </div>

          <div className={`${styles.resultadoCard} ${styles.destacado}`}>
            <span className={styles.resultadoIcon} aria-hidden="true">📄</span>
            <span className={styles.resultadoLabel}>Total factura (IVA incl.)</span>
            <span className={styles.resultadoValor}>{formatCurrency(calculos.total)}</span>
          </div>
        </div>

        {/* Desglose */}
        <div className={styles.desglose}>
          <h3>Desglose de la factura</h3>
          <div className={styles.desgloseLineas}>
            <div className={styles.desgloseLine}>
              <span>Consumo eléctrico ({formatNumber(calculos.consumoTotal, 2)} kWh × {formatNumber(calculos.preciokWh, 4)} €)</span>
              <span>{formatCurrency(calculos.costeEnergia)}</span>
            </div>
            <div className={styles.desgloseLine}>
              <span>Término de potencia ({formatNumber(potenciaContratada, 2)} kW)</span>
              <span>{formatCurrency(calculos.terminoPotencia)}</span>
            </div>
            <div className={styles.desgloseLine}>
              <span>Impuesto eléctrico (5,113%)</span>
              <span>{formatCurrency(calculos.impuestoElectricidad)}</span>
            </div>
            <div className={styles.desgloseLine}>
              <span>IVA (21%)</span>
              <span>{formatCurrency(calculos.iva)}</span>
            </div>
            <div className={`${styles.desgloseLine} ${styles.total}`}>
              <span>TOTAL</span>
              <span>{formatCurrency(calculos.total)}</span>
            </div>
          </div>
        </div>

        {/* Consumo por categoría */}
        {Object.keys(calculos.consumoPorCategoria).length > 0 && (
          <div className={styles.porCategoria}>
            <h3>Consumo por categoría</h3>
            <div className={styles.categoriasChart}>
              {Object.entries(calculos.consumoPorCategoria)
                .sort((a, b) => b[1] - a[1])
                .map(([categoria, consumo]) => {
                  const porcentaje = calculos.consumoTotal > 0
                    ? (consumo / calculos.consumoTotal) * 100
                    : 0;
                  return (
                    <div key={categoria} className={styles.categoriaBar}>
                      <div className={styles.categoriaInfo}>
                        <span className={styles.categoriaNombre}>{categoria}</span>
                        <span className={styles.categoriaConsumo}>
                          {formatNumber(consumo, 1)} kWh ({formatNumber(porcentaje, 1)}%)
                        </span>
                      </div>
                      <div className={styles.barContainer}>
                        <div
                          className={styles.bar}
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Esta calculadora proporciona una <strong>estimación orientativa</strong> basada en consumos típicos
          y precios medios. Los precios de la electricidad varían diariamente (especialmente en PVPC)
          y la factura real incluye otros conceptos como alquiler de contador. Consulta tu factura real
          para datos exactos.
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres reducir tu factura de luz?"
        subtitle="Descubre consejos prácticos para ahorrar energía y entender mejor tu consumo eléctrico"
        icon="💡"
      >
        <section className={styles.guideSection}>
          <h2>Entendiendo tu factura de luz</h2>
          <p className={styles.introParagraph}>
            La factura eléctrica en España tiene dos componentes principales: el término de energía
            (lo que consumes) y el término de potencia (lo que tienes contratado aunque no lo uses).
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Término de energía</h4>
              <p>Es el coste por cada kWh consumido. En PVPC varía cada hora del día.
                 Las horas valle (nocturnas) son más baratas.</p>
            </div>
            <div className={styles.contentCard}>
              <h4>Término de potencia</h4>
              <p>Es un coste fijo mensual por tener disponible esa potencia.
                 Si nunca saltan los plomos, quizás puedas reducirla y ahorrar.</p>
            </div>
            <div className={styles.contentCard}>
              <h4>Discriminación horaria</h4>
              <p>Con PVPC puedes ahorrar hasta un 30% usando electrodomésticos potentes
                 (lavadora, lavavajillas) en horas valle: de 0h a 8h.</p>
            </div>
            <div className={styles.contentCard}>
              <h4>Impuestos</h4>
              <p>El Impuesto Eléctrico (5,113%) y el IVA (21%) se aplican sobre el total.
                 Son costes fijos que no puedes evitar.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Consejos para ahorrar energía</h2>
          <div className={styles.tipsList}>
            <div className={styles.tip}>
              <span className={styles.tipIcon} aria-hidden="true">❄️</span>
              <div>
                <h4>Climatización eficiente</h4>
                <p>Cada grado menos en calefacción o más en aire acondicionado ahorra un 7% de energía.
                   Usa 20°C en invierno y 25°C en verano.</p>
              </div>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon} aria-hidden="true">💡</span>
              <div>
                <h4>Cambia a LED</h4>
                <p>Una bombilla LED consume 10 veces menos que una incandescente y dura 25 veces más.
                   El ahorro es inmediato.</p>
              </div>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon} aria-hidden="true">🔌</span>
              <div>
                <h4>Elimina el standby</h4>
                <p>Los aparatos en standby consumen hasta un 10% de tu factura. Usa regletas con
                   interruptor para apagarlos completamente.</p>
              </div>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon} aria-hidden="true">🧺</span>
              <div>
                <h4>Lavadora en frío</h4>
                <p>El 90% de la energía de la lavadora se usa para calentar el agua.
                   Lavar en frío (30°C o menos) ahorra significativamente.</p>
              </div>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon} aria-hidden="true">🌙</span>
              <div>
                <h4>Aprovecha las horas valle</h4>
                <p>Con tarifa PVPC, programa lavadora, lavavajillas y carga de vehículo eléctrico
                   entre las 0h y las 8h.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Electrodomésticos que más consumen</h2>
          <div className={styles.rankingConsumo}>
            <div className={styles.rankingItem}>
              <span className={styles.rankingPos}>1</span>
              <span className={styles.rankingNombre}>Aire acondicionado / Calefacción</span>
              <span className={styles.rankingConsumo}>~40% del total</span>
            </div>
            <div className={styles.rankingItem}>
              <span className={styles.rankingPos}>2</span>
              <span className={styles.rankingNombre}>Termo eléctrico (ACS)</span>
              <span className={styles.rankingConsumo}>~20% del total</span>
            </div>
            <div className={styles.rankingItem}>
              <span className={styles.rankingPos}>3</span>
              <span className={styles.rankingNombre}>Frigorífico</span>
              <span className={styles.rankingConsumo}>~15% del total</span>
            </div>
            <div className={styles.rankingItem}>
              <span className={styles.rankingPos}>4</span>
              <span className={styles.rankingNombre}>Lavadora + Secadora</span>
              <span className={styles.rankingConsumo}>~10% del total</span>
            </div>
            <div className={styles.rankingItem}>
              <span className={styles.rankingPos}>5</span>
              <span className={styles.rankingNombre}>Iluminación</span>
              <span className={styles.rankingConsumo}>~5% del total</span>
            </div>
          </div>
        </section>

        {/* Sección 4: Tabla Comparativa de Tarifas */}
        <section className={styles.guideSection}>
          <h2>⚖️ Comparativa de Tarifas Eléctricas</h2>
          <p className={styles.introParagraph}>
            Elegir la tarifa correcta puede suponerte un ahorro de 100-300 € al año. Aquí tienes
            los factores clave para decidir cuál se adapta mejor a tu perfil de consumo.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>PVPC (Regulada)</th>
                  <th>Mercado Libre</th>
                  <th>Solar / Autoconsumo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Variabilidad del precio</td>
                  <td>Alta (varía cada hora)</td>
                  <td>Baja (precio fijo acordado)</td>
                  <td>Muy baja (producción propia)</td>
                </tr>
                <tr>
                  <td>Precio medio estimado</td>
                  <td>~0,13 €/kWh</td>
                  <td>~0,14–0,18 €/kWh</td>
                  <td>~0,04–0,06 €/kWh (excedente)</td>
                </tr>
                <tr>
                  <td>Penalización horas punta</td>
                  <td>Sí (hasta 0,18 €/kWh)</td>
                  <td>No (precio único)</td>
                  <td>Irrelevante si hay batería</td>
                </tr>
                <tr>
                  <td>Ideal para</td>
                  <td>Consumidores flexibles con horario nocturno</td>
                  <td>Hogares con consumo constante de día</td>
                  <td>+400 kWh/mes con tejado disponible</td>
                </tr>
                <tr>
                  <td>Riesgo de precio</td>
                  <td>Medio (sube en crisis energéticas)</td>
                  <td>Bajo (precio pactado)</td>
                  <td>Muy bajo a largo plazo</td>
                </tr>
                <tr>
                  <td>Requiere instalación adicional</td>
                  <td>No</td>
                  <td>No</td>
                  <td>Sí (paneles + inversor, ~5.000–8.000 €)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Sección 5: Casos de Uso Prácticos */}
        <section className={styles.guideSection}>
          <h2>💼 Casos de Uso Prácticos</h2>
          <p className={styles.introParagraph}>
            Descubre cuánto consume y paga cada tipo de hogar en España y qué puedes hacer para
            reducir tu factura según tu situación concreta.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏠</span>
                <h4>Piso pequeño (2 personas)</h4>
              </div>
              <p className={styles.escenarioExample}>
                Consumo típico: ~250 kWh/mes · Factura media: ~65 €/mes
              </p>
              <p className={styles.escenarioTip}>
                La nevera y la iluminación son los principales consumidores. Cambiar a LED y ajustar
                la temperatura del frigorífico a 4°C puede ahorrar hasta 15 €/mes.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👨‍👩‍👧‍👦</span>
                <h4>Casa familiar (4 personas)</h4>
              </div>
              <p className={styles.escenarioExample}>
                Consumo típico: ~450 kWh/mes · Factura media: ~110 €/mes
              </p>
              <p className={styles.escenarioTip}>
                Lavadora y lavavajillas en horas valle (0h–8h) y revisar la potencia contratada
                pueden suponer un ahorro de 20–30 €/mes sin cambiar hábitos de consumo.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">❄️</span>
                <h4>Hogar con climatización</h4>
              </div>
              <p className={styles.escenarioExample}>
                El A/C puede representar el 40% de la factura en verano
              </p>
              <p className={styles.escenarioTip}>
                Cada grado más en verano (de 22°C a 25°C) ahorra un 21% en climatización.
                Un A/C de 1.500 W usado 6 h/día durante 90 días añade ~85 € a tu factura.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🌙</span>
                <h4>Aprovechamiento hora valle</h4>
              </div>
              <p className={styles.escenarioExample}>
                Ahorro potencial: 15–25 €/mes moviendo electrodomésticos a las 0h–8h
              </p>
              <p className={styles.escenarioTip}>
                En PVPC, el precio valle (~0,08 €/kWh) es la mitad que el precio punta (~0,18 €/kWh).
                Programar lavadora y lavavajillas de noche ahorra el 55% del coste de esos ciclos.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 6: FAQ Ampliado */}
        <section className={styles.guideSection}>
          <h2>❓ Preguntas Frecuentes sobre la Factura Eléctrica</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Qué es el PVPC y cuándo conviene?</h4>
              <p>
                El PVPC (Precio Voluntario al Pequeño Consumidor) es la tarifa regulada por el Gobierno.
                El precio varía cada hora según el mercado mayorista. Conviene si puedes mover tus
                consumos a horas valle (0h–8h) o si tu consumo es principalmente nocturno o de fin de semana.
              </p>
              <span className={styles.faqTip}>Ideal para: consumidores flexibles, teletrabajadores nocturnos, propietarios de VE.</span>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo puedo reducir el término de potencia?</h4>
              <p>
                El término de potencia es un cargo fijo mensual. Puedes solicitar a tu comercializadora
                una reducción de potencia si nunca saltan tus fusibles. De 4,6 kW a 3,45 kW ahorras
                ~10 €/mes (~120 €/año). El trámite es gratuito y tarda 1–2 semanas.
              </p>
              <span className={styles.faqTip}>Comprueba en tu cuadro eléctrico cuántos kW tienes activos simultáneamente.</span>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué electrodoméstico consume más en mi hogar?</h4>
              <p>
                En la mayoría de hogares españoles el orden es: climatización (40%), agua caliente
                sanitaria (20%), frigorífico (15%), lavadora+secadora (10%) e iluminación (5%).
                Usa esta calculadora para identificar el tuyo con datos reales.
              </p>
              <span className={styles.faqTip}>Añade tus aparatos con horas reales de uso para ver el ranking personalizado.</span>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuánto ahorro cambiando todas las bombillas a LED?</h4>
              <p>
                Una bombilla incandescente de 60 W equivale a una LED de 8 W con la misma luminosidad.
                Con 20 bombillas encendidas 5 h/día y precio de 0,15 €/kWh: incandescentes cuestan
                ~32 €/mes, LED ~4 €/mes. Ahorro: ~28 €/mes, ROI en menos de 6 meses.
              </p>
              <span className={styles.faqTip}>El ahorro en iluminación suele amortizarse en 4–8 meses.</span>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es el impuesto eléctrico del 5,113%?</h4>
              <p>
                Es un impuesto especial sobre la electricidad que se aplica sobre la suma del término
                de energía y el término de potencia (antes del IVA). Su tipo nominal es del 5,11269632%,
                redondeado habitualmente a 5,113%. No existe manera legal de evitarlo.
              </p>
              <span className={styles.faqTip}>Representa entre 2 y 6 € en una factura media de hogar.</span>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Merece la pena instalar paneles solares?</h4>
              <p>
                Si consumes más de 400 kWh/mes y tienes tejado disponible con orientación sur,
                la instalación suele amortizarse en 6–10 años. En 2025, una instalación de 3 kWp
                cuesta ~5.000–7.000 € y puede cubrir el 60–80% del consumo anual de un hogar medio.
              </p>
              <span className={styles.faqTip}>Solicita al menos 3 presupuestos y comprueba las ayudas del IDAE.</span>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo funciona la discriminación horaria?</h4>
              <p>
                En PVPC existen tres periodos: punta (10h–14h y 18h–22h), llano (8h–10h, 14h–18h
                y 22h–24h) y valle (0h–8h y festivos todo el día). El precio en valle puede ser
                hasta un 55% más barato que en punta.
              </p>
              <span className={styles.faqTip}>Los sábados y domingos completos son considerados hora valle en PVPC.</span>
            </div>
            <div className={styles.faqItem}>
              <h4>¿En qué horas es más barata la luz en España?</h4>
              <p>
                Con PVPC: de 0h a 8h todos los días + sábados, domingos y festivos nacionales
                completos. En Mercado Libre el precio es fijo durante todo el día. La diferencia
                punta/valle en PVPC puede ser de 0,10 €/kWh o más en días de alta demanda.
              </p>
              <span className={styles.faqTip}>Activa las alarmas del móvil a las 23:50h para programar tus electrodomésticos.</span>
            </div>
          </div>
        </section>

        {/* Sección 7: Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>📋 Guía Paso a Paso: Optimiza tu Factura de Luz</h2>
          <p className={styles.introParagraph}>
            Sigue estos 7 pasos en orden para reducir tu factura de manera sistemática y
            sin inversiones innecesarias.
          </p>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h4>Identifica tus mayores consumidores</h4>
                <p>
                  Usa esta calculadora añadiendo todos tus electrodomésticos con sus horas reales de uso.
                  El 80% del ahorro suele venir del 20% de los aparatos. Identifica cuál es ese 20%.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h4>Revisa tu potencia contratada</h4>
                <p>
                  Consulta tu última factura. Si nunca se van los plomos y tienes más de 4,6 kW,
                  prueba a reducirla. El ahorro puede ser de 10–20 €/mes sin ningún cambio de hábitos.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h4>Elige la tarifa adecuada</h4>
                <p>
                  Compara PVPC vs Mercado Libre con tu consumo real. Si puedes usar electrodomésticos
                  de noche (0h–8h), el PVPC con discriminación horaria suele ser más barato.
                  Usa comparadores como CNMC o OCU.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h4>Cambia toda la iluminación a LED</h4>
                <p>
                  El ROI es de 6–12 meses y el ahorro es permanente. Una bombilla LED de 8 W
                  equivale a una incandescente de 60 W. Si tienes 15 bombillas, ahorras ~25 €/mes
                  desde el primer día.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <h4>Programa electrodomésticos en hora valle</h4>
                <p>
                  Configura el temporizador de la lavadora y el lavavajillas para que terminen
                  sus ciclos antes de las 8h. Con PVPC ahorras hasta el 55% del coste de cada ciclo.
                  En un hogar de 4 personas, esto supone ~15 €/mes.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <h4>Elimina el consumo en standby</h4>
                <p>
                  TV, ordenadores, cargadores y aparatos con piloto rojo consumen aunque estén
                  apagados. Instala regletas con interruptor en los centros de entretenimiento y
                  despacho. Ahorro típico: 8–12 €/mes.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <h4>Evalúa el autoconsumo solar</h4>
                <p>
                  Si tu consumo supera los 400 kWh/mes y tienes tejado disponible con orientación
                  sur, calcula el retorno de la inversión. Con las ayudas actuales y el precio de
                  la luz, la amortización puede ser de 6–8 años con vida útil de 25+ años.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 8: Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>✅ Mejores Prácticas de Ahorro Energético</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">❄️</span>
              <h4>Climatización inteligente</h4>
              <p>
                Cada grado menos de A/C en verano (o más de calefacción en invierno) ahorra un 7%
                en esa partida. De 22°C a 25°C en verano supone un 21% menos de consumo en climatización.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧊</span>
              <h4>Frigorífico optimizado</h4>
              <p>
                La nevera representa el 15% de la factura y funciona las 24 horas. Mantén la
                temperatura a 4°C en la nevera y -18°C en el congelador. Nunca introduzcas
                alimentos calientes ni cubras los orificios de ventilación.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧺</span>
              <h4>Lavadora en 30°C</h4>
              <p>
                El 90% de la energía de la lavadora se usa para calentar el agua. Lavar a 30°C
                en lugar de 60°C ahorra un 40% de energía por ciclo. La ropa queda igual de limpia
                con detergentes modernos.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔴</span>
              <h4>Standby: el ladrón silencioso</h4>
              <p>
                Los aparatos en modo standby (piloto rojo encendido) pueden suponer el 10% de tu
                factura anual, entre 80–130 € según el hogar. Usa regletas con interruptor para
                eliminarlos completamente.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <h4>Compara ofertas cada 12 meses</h4>
              <p>
                El mercado libre cambia constantemente. Comparar ofertas anualmente usando
                el comparador de la CNMC puede suponer un ahorro de 50–150 € al año sin
                cambiar ningún hábito de consumo.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🤝</span>
              <h4>Bono Social Eléctrico</h4>
              <p>
                Si cumples los requisitos (pensionista, familia numerosa, desempleado, discapacidad
                o víctima de violencia de género), puedes acceder al Bono Social con descuentos
                del 25% al 65% en tu factura. Solicítalo a tu comercializadora de referencia.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 9: Warning Box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>6 Errores que Disparan tu Factura de Luz</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>No revisar la potencia contratada:</strong> Pagar el término fijo de 9,2 kW
                cuando con 4,6 kW es suficiente supone 40 €/mes de más, o 480 €/año tirados.
              </li>
              <li>
                <strong>Comparar solo el precio del kWh en ofertas:</strong> El término de potencia
                puede ser más caro en el Mercado Libre que en PVPC. Compara la factura total estimada,
                no solo el precio por kWh.
              </li>
              <li>
                <strong>Usar el horno para cantidades pequeñas:</strong> Calentar un plato en horno
                eléctrico (2.000 W durante 20 min) consume 0,67 kWh. El microondas hace lo mismo
                en 3 min con 0,05 kWh. Un 70% menos de energía por cada uso.
              </li>
              <li>
                <strong>Dejar el A/C encendido con ventanas abiertas:</strong> Una ventana abierta
                con A/C funcionando puede multiplicar por 3 el consumo del aparato. Ventila siempre
                antes de encender el aire acondicionado.
              </li>
              <li>
                <strong>Frigorífico mal configurado o mal ubicado:</strong> Un frigorífico a 1°C
                menos de lo necesario incrementa su consumo un 5%. Si está cerca del horno o recibe
                sol directo, trabaja un 30% más para mantener la temperatura.
              </li>
              <li>
                <strong>No aprovechar la tarifa nocturna con vehículo eléctrico o piscina:</strong>
                Cargar un VE (60 kWh de batería) en hora punta cuesta ~11 €. En hora valle cuesta ~5 €.
                El ahorro es de 6 € por cada carga completa, o más de 200 €/año con carga semanal.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-gasto-energetico')} />

      <ShareCard appName="calculadora-gasto-energetico" />
      <Footer appName="calculadora-gasto-energetico" />
    </div>
  );
}
