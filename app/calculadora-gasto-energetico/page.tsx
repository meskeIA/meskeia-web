'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './CalculadoraGastoEnergetico.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps} from '@/components';
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
                className={`${styles.categoriaBtn} ${categoriaFiltro === cat ? styles.active : ''}`}
                onClick={() => setCategoriaFiltro(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.presetsGrid}>
            {presetsFiltrados.map((preset, index) => (
              <button
                key={index}
                className={styles.presetCard}
                onClick={() => añadirDesdePreset(preset)}
                title={`${preset.potencia}W - ${preset.horasTypicas}h/día típico`}
              >
                <span className={styles.presetIcon}>{preset.icono}</span>
                <span className={styles.presetNombre}>{preset.nombre}</span>
                <span className={styles.presetPotencia}>{preset.potencia}W</span>
              </button>
            ))}
            <button
              className={`${styles.presetCard} ${styles.presetCustom}`}
              onClick={añadirPersonalizado}
            >
              <span className={styles.presetIcon}>➕</span>
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
            <button onClick={limpiarTodo} className={styles.limpiarBtn}>
              🗑️ Limpiar todo
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
                      <button onClick={() => duplicarElectrodomestico(e.id)} title="Duplicar">📋</button>
                      <button onClick={() => eliminarElectrodomestico(e.id)} title="Eliminar">❌</button>
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
            <span className={styles.resultadoIcon}>⚡</span>
            <span className={styles.resultadoLabel}>Consumo total</span>
            <span className={styles.resultadoValor}>{formatNumber(calculos.consumoTotal, 2)} kWh</span>
          </div>

          <div className={styles.resultadoCard}>
            <span className={styles.resultadoIcon}>💡</span>
            <span className={styles.resultadoLabel}>Coste energía</span>
            <span className={styles.resultadoValor}>{formatCurrency(calculos.costeEnergia)}</span>
          </div>

          <div className={styles.resultadoCard}>
            <span className={styles.resultadoIcon}>🔌</span>
            <span className={styles.resultadoLabel}>Término potencia</span>
            <span className={styles.resultadoValor}>{formatCurrency(calculos.terminoPotencia)}</span>
          </div>

          <div className={`${styles.resultadoCard} ${styles.destacado}`}>
            <span className={styles.resultadoIcon}>📄</span>
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
              <span className={styles.tipIcon}>❄️</span>
              <div>
                <h4>Climatización eficiente</h4>
                <p>Cada grado menos en calefacción o más en aire acondicionado ahorra un 7% de energía.
                   Usa 20°C en invierno y 25°C en verano.</p>
              </div>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon}>💡</span>
              <div>
                <h4>Cambia a LED</h4>
                <p>Una bombilla LED consume 10 veces menos que una incandescente y dura 25 veces más.
                   El ahorro es inmediato.</p>
              </div>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon}>🔌</span>
              <div>
                <h4>Elimina el standby</h4>
                <p>Los aparatos en standby consumen hasta un 10% de tu factura. Usa regletas con
                   interruptor para apagarlos completamente.</p>
              </div>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon}>🧺</span>
              <div>
                <h4>Lavadora en frío</h4>
                <p>El 90% de la energía de la lavadora se usa para calentar el agua.
                   Lavar en frío (30°C o menos) ahorra significativamente.</p>
              </div>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon}>🌙</span>
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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-gasto-energetico')} />

      <Footer appName="calculadora-gasto-energetico" />
    </div>
  );
}
