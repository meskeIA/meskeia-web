'use client';
// @disclaimer: handled — DisclaimerCard severity="medium" collapsible={true}

import { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';
import styles from './VisualizadorMercadosFinancieros.module.css';

// --- Tipos ---
type SeccionActiva = 'activos' | 'orderbook' | 'indices' | 'participantes';

interface TipoActivo {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  riesgo: 'bajo' | 'medio' | 'alto';
  liquidez: 'baja' | 'media' | 'alta';
  ejemplo: string;
  detalle: string;
}

interface OrdenBook {
  precio: number;
  cantidad: number;
  total: number;
}

interface Indice {
  id: string;
  nombre: string;
  pais: string;
  bandera: string;
  empresas: number;
  criterio: string;
  curioso: string;
  ejemploEmpresas: string[];
}

interface Participante {
  tipo: string;
  icono: string;
  volumen: number;
  descripcion: string;
  ejemplos: string;
  color: string;
}

// --- Datos ---
const TIPOS_ACTIVOS: TipoActivo[] = [
  {
    id: 'acciones',
    nombre: 'Renta Variable (Acciones)',
    icono: '📈',
    descripcion: 'Participación en el capital de una empresa. El inversor se convierte en propietario parcial.',
    riesgo: 'alto',
    liquidez: 'alta',
    ejemplo: 'Telefónica, Inditex, Apple, Tesla',
    detalle: 'Derecho a dividendos y voto en juntas de accionistas. El precio fluctúa según beneficios esperados, condiciones macroeconómicas y sentimiento de mercado. Sin vencimiento predefinido.',
  },
  {
    id: 'bonos',
    nombre: 'Renta Fija (Bonos)',
    icono: '🏛️',
    descripcion: 'Préstamo al emisor (gobierno o empresa) que devuelve el principal más un cupón periódico.',
    riesgo: 'bajo',
    liquidez: 'media',
    ejemplo: 'Bono del Tesoro español, Letras del Tesoro, Obligaciones del Estado',
    detalle: 'Flujos de caja predecibles (cupón + principal al vencimiento). Riesgo de crédito (impago) y riesgo de tipo de interés. Los bonos gubernamentales de países solventes son considerados "libre de riesgo".',
  },
  {
    id: 'etf',
    nombre: 'ETF (Fondo Cotizado)',
    icono: '🗂️',
    descripcion: 'Fondo de inversión que cotiza en bolsa y replica un índice o sector.',
    riesgo: 'medio',
    liquidez: 'alta',
    ejemplo: 'iShares MSCI World, Vanguard S&P 500, SPDR Gold',
    detalle: 'Combinan diversificación de un fondo con la liquidez de una acción. Comisiones bajas (0,03%–0,20% anual). Permiten invertir en cientos de empresas con una sola compra. Muy populares para inversión pasiva.',
  },
  {
    id: 'derivados',
    nombre: 'Derivados',
    icono: '⚙️',
    descripcion: 'Contratos cuyo valor deriva de un activo subyacente (acción, índice, divisa, materia prima).',
    riesgo: 'alto',
    liquidez: 'alta',
    ejemplo: 'Futuros del IBEX 35, Opciones sobre Apple, CFDs sobre oro',
    detalle: 'Futuros: obligación de comprar/vender a precio y fecha fijados. Opciones: derecho (no obligación) de comprar/vender. El apalancamiento amplifica ganancias Y pérdidas. Uso profesional y especulativo.',
  },
  {
    id: 'materias',
    nombre: 'Materias Primas (Commodities)',
    icono: '🛢️',
    descripcion: 'Recursos físicos estandarizados: metales, energía, productos agrícolas.',
    riesgo: 'alto',
    liquidez: 'media',
    ejemplo: 'Oro (XAU), Petróleo (WTI/Brent), Trigo, Cobre',
    detalle: 'Se negocian principalmente vía futuros en bolsas especializadas (CME en USA, LME para metales). El oro actúa históricamente como valor refugio. El petróleo está fuertemente influenciado por decisiones de la OPEP.',
  },
  {
    id: 'divisas',
    nombre: 'Divisas (Forex)',
    icono: '💱',
    descripcion: 'Intercambio de monedas entre países. El mercado más líquido del mundo.',
    riesgo: 'alto',
    liquidez: 'alta',
    ejemplo: 'EUR/USD, GBP/USD, USD/JPY, USD/CHF',
    detalle: 'Opera 24h/5 días (Sídney → Tokio → Londres → Nueva York). Volumen diario: ~6,6 billones de dólares. Participantes: bancos centrales, bancos comerciales, multinacionales, especuladores. El spread suele ser mínimo en pares principales.',
  },
];

const ORDENES_BID_INICIALES: OrdenBook[] = [
  { precio: 99.80, cantidad: 500, total: 2000 },
  { precio: 99.70, cantidad: 1200, total: 3200 },
  { precio: 99.60, cantidad: 800, total: 2400 },
  { precio: 99.50, cantidad: 2000, total: 5000 },
  { precio: 99.40, cantidad: 600, total: 1800 },
];

const ORDENES_ASK_INICIALES: OrdenBook[] = [
  { precio: 100.10, cantidad: 400, total: 1600 },
  { precio: 100.20, cantidad: 900, total: 2700 },
  { precio: 100.30, cantidad: 1500, total: 4500 },
  { precio: 100.40, cantidad: 700, total: 2100 },
  { precio: 100.50, cantidad: 1100, total: 3300 },
];

const INDICES: Indice[] = [
  {
    id: 'ibex',
    nombre: 'IBEX 35',
    pais: 'España',
    bandera: '🇪🇸',
    empresas: 35,
    criterio: 'Las 35 empresas de mayor capitalización y liquidez de la Bolsa española. Revisión semestral.',
    curioso: 'Creado en 1992. Inditex (Zara) es habitualmente la empresa de mayor peso. El índice no incluye dividendos (índice de precio).',
    ejemploEmpresas: ['Inditex', 'Banco Santander', 'BBVA', 'Iberdrola', 'Telefónica'],
  },
  {
    id: 'sp500',
    nombre: 'S&P 500',
    pais: 'Estados Unidos',
    bandera: '🇺🇸',
    empresas: 500,
    criterio: 'Las 500 mayores empresas cotizadas en NYSE y NASDAQ por capitalización de mercado ajustada al float.',
    curioso: 'Creado en 1957 por Standard & Poors. Es la referencia mundial de bolsa. El 1% superior de empresas representa ~30% del índice (Apple, Microsoft, Amazon, Nvidia, Alphabet).',
    ejemploEmpresas: ['Apple', 'Microsoft', 'Amazon', 'Nvidia', 'Alphabet (Google)'],
  },
  {
    id: 'dax',
    nombre: 'DAX 40',
    pais: 'Alemania',
    bandera: '🇩🇪',
    empresas: 40,
    criterio: 'Las 40 mayores empresas alemanas en la Bolsa de Fráncfort (Deutsche Börse). Ampliado de 30 a 40 en 2021.',
    curioso: 'A diferencia del IBEX, el DAX es un índice de rentabilidad total: incluye dividendos reinvertidos, lo que infla su comparación directa con otros índices.',
    ejemploEmpresas: ['SAP', 'Siemens', 'Volkswagen', 'BASF', 'Allianz'],
  },
  {
    id: 'nasdaq',
    nombre: 'Nasdaq 100',
    pais: 'Estados Unidos',
    bandera: '🇺🇸',
    empresas: 100,
    criterio: 'Las 100 mayores empresas no financieras del Nasdaq. Dominado por tecnología.',
    curioso: 'Conocido como el "índice de las tecnológicas". Durante la burbuja dot-com (2000) cayó un 78%. Su recuperación tardó 15 años. Ahora incluye empresas como Meta, Netflix y Tesla.',
    ejemploEmpresas: ['Apple', 'Microsoft', 'Meta', 'Netflix', 'Tesla'],
  },
  {
    id: 'nikkei',
    nombre: 'Nikkei 225',
    pais: 'Japón',
    bandera: '🇯🇵',
    empresas: 225,
    criterio: 'Las 225 principales empresas de la Bolsa de Tokio (TSE). Es un índice de precio (no ponderado por capitalización), similar al Dow Jones.',
    curioso: 'Alcanzó su máximo histórico en 1989 (38.915 puntos) durante la burbuja japonesa. No recuperó ese nivel hasta... 2024, 35 años después.',
    ejemploEmpresas: ['Toyota', 'Sony', 'SoftBank', 'Nintendo', 'Mitsubishi'],
  },
];

const PARTICIPANTES: Participante[] = [
  {
    tipo: 'Inversores Minoristas',
    icono: '👤',
    volumen: 18,
    descripcion: 'Personas individuales que invierten sus ahorros. Acceden al mercado a través de brokers online.',
    ejemplos: 'Cualquier persona con cuenta en DEGIRO, eToro, Interactive Brokers, el broker del banco...',
    color: '#7FB3D3',
  },
  {
    tipo: 'Inversores Institucionales',
    icono: '🏢',
    volumen: 45,
    descripcion: 'Fondos de pensiones, aseguradoras, fondos de inversión. Gestionan el ahorro colectivo.',
    ejemplos: 'Vanguard, BlackRock, Fidelity, Amundi, fondos de pensiones de Noruega...',
    color: '#2E86AB',
  },
  {
    tipo: 'Market Makers',
    icono: '⚖️',
    volumen: 20,
    descripcion: 'Proveedores de liquidez que siempre ofrecen precios de compra y venta. Ganan el spread.',
    ejemplos: 'Citadel Securities, Virtu Financial, Flow Traders, bancos de inversión...',
    color: '#48A9A6',
  },
  {
    tipo: 'HFT (High Frequency Trading)',
    icono: '⚡',
    volumen: 12,
    descripcion: 'Firmas que ejecutan miles de órdenes por segundo mediante algoritmos. Aprovechan ineficiencias microestructurales.',
    ejemplos: 'Jane Street, Two Sigma, Renaissance Technologies, DRW...',
    color: '#F0A500',
  },
  {
    tipo: 'Bancos Centrales',
    icono: '🏦',
    volumen: 5,
    descripcion: 'Intervienen en forex para estabilizar divisas y en renta fija mediante QE (compras masivas de bonos).',
    ejemplos: 'BCE, Fed, Banco de Japón, Banco de Inglaterra, Banco Nacional Suizo...',
    color: '#E05C5C',
  },
];

// --- Componente principal ---
export default function VisualizadorMercadosFinancieros() {
  const [seccionActiva, setSeccionActiva] = useState<SeccionActiva>('activos');
  const [activoExpandido, setActivoExpandido] = useState<string | null>(null);
  const [indiceSeleccionado, setIndiceSeleccionado] = useState<string>('ibex');
  const [ordenesBid, setOrdenesBid] = useState<OrdenBook[]>(ORDENES_BID_INICIALES);
  const [ordenesAsk, setOrdenesAsk] = useState<OrdenBook[]>(ORDENES_ASK_INICIALES);
  const [mensajeMatching, setMensajeMatching] = useState<string>('');

  const mejorBid = ordenesBid[0]?.precio ?? 0;
  const mejorAsk = ordenesAsk[0]?.precio ?? 0;
  const spread = (mejorAsk - mejorBid).toFixed(2);
  const maxTotal = Math.max(...ordenesBid.map(o => o.total), ...ordenesAsk.map(o => o.total));

  function handleAnadirCompra() {
    const nuevoPrecio = +(mejorBid + 0.10).toFixed(2);
    const nuevaCantidad = Math.floor(Math.random() * 400) + 100;
    const nuevaOrden: OrdenBook = { precio: nuevoPrecio, cantidad: nuevaCantidad, total: nuevaCantidad * 3 };

    // Comprobar si cruza con el ask (matching)
    if (nuevoPrecio >= mejorAsk) {
      setMensajeMatching(`✅ ¡Orden ejecutada! Compra de ${nuevaCantidad} títulos a ${mejorAsk.toFixed(2)} € (precio ask). El matching engine emparejó tu orden de compra con la mejor orden de venta.`);
      setOrdenesAsk(prev => prev.slice(1));
    } else {
      setOrdenesBid(prev => [nuevaOrden, ...prev].sort((a, b) => b.precio - a.precio).slice(0, 5));
      setMensajeMatching(`📋 Orden límite de compra añadida a ${nuevoPrecio.toFixed(2)} €. Esperando vendedor al precio deseado.`);
    }
  }

  function handleAnadirVenta() {
    const nuevoPrecio = +(mejorAsk - 0.10).toFixed(2);
    const nuevaCantidad = Math.floor(Math.random() * 400) + 100;
    const nuevaOrden: OrdenBook = { precio: nuevoPrecio, cantidad: nuevaCantidad, total: nuevaCantidad * 3 };

    if (nuevoPrecio <= mejorBid) {
      setMensajeMatching(`✅ ¡Orden ejecutada! Venta de ${nuevaCantidad} títulos a ${mejorBid.toFixed(2)} € (precio bid). El matching engine emparejó tu orden de venta con la mejor orden de compra.`);
      setOrdenesBid(prev => prev.slice(1));
    } else {
      setOrdenesAsk(prev => [nuevaOrden, ...prev].sort((a, b) => a.precio - b.precio).slice(0, 5));
      setMensajeMatching(`📋 Orden límite de venta añadida a ${nuevoPrecio.toFixed(2)} €. Esperando comprador al precio deseado.`);
    }
  }

  function resetOrderBook() {
    setOrdenesBid(ORDENES_BID_INICIALES);
    setOrdenesAsk(ORDENES_ASK_INICIALES);
    setMensajeMatching('');
  }

  const indiceActual = INDICES.find(i => i.id === indiceSeleccionado) ?? INDICES[0];

  const riesgoColor = (r: TipoActivo['riesgo']) => {
    if (r === 'bajo') return styles.riesgoBajo;
    if (r === 'medio') return styles.riesgoMedio;
    return styles.riesgoAlto;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">📈</div>
        <h1>Mercados Financieros</h1>
        <p>Cómo funciona la bolsa: libro de órdenes, formación de precios y tipos de activos</p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="visualizador-mercados-financieros"
      >
        Esta herramienta explica el funcionamiento de los mercados financieros con fines exclusivamente educativos. No constituye asesoramiento de inversión ni recomendación de compra o venta de activos. Invertir conlleva riesgo de pérdida del capital. Consulta a un asesor financiero antes de tomar decisiones de inversión.
      </DisclaimerCard>

      {/* Navegación de secciones */}
      <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
        {(
          [
            { id: 'activos', label: 'Tipos de Activos', icono: '🗃️' },
            { id: 'orderbook', label: 'Libro de Órdenes', icono: '📒' },
            { id: 'indices', label: 'Índices Bursátiles', icono: '📊' },
            { id: 'participantes', label: 'Participantes', icono: '👥' },
          ] as { id: SeccionActiva; label: string; icono: string }[]
        ).map(({ id, label, icono }) => (
          <button
            key={id}
            type="button"
            className={`${styles.tabBtn} ${seccionActiva === id ? styles.tabBtnActivo : ''}`}
            onClick={() => setSeccionActiva(id)}
            aria-pressed={seccionActiva === id}
          >
            <span aria-hidden="true">{icono}</span> {label}
          </button>
        ))}
      </nav>

      {/* SECCIÓN: Tipos de Activos */}
      {seccionActiva === 'activos' && (
        <section className={styles.seccion} aria-label="Tipos de activos financieros">
          <h2 className={styles.seccionTitulo}>Tipos de Activos Financieros</h2>
          <p className={styles.seccionDesc}>
            Un activo financiero es un instrumento que representa un derecho económico. Cada tipo tiene un perfil de riesgo, liquidez y rentabilidad diferente. Haz clic en cualquier activo para ver más detalles.
          </p>
          <div className={styles.gridActivos}>
            {TIPOS_ACTIVOS.map((activo) => (
              <div
                key={activo.id}
                className={`${styles.cardActivo} ${activoExpandido === activo.id ? styles.cardActivoExpandida : ''}`}
                onClick={() => setActivoExpandido(activoExpandido === activo.id ? null : activo.id)}
                role="button"
                tabIndex={0}
                aria-expanded={activoExpandido === activo.id}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActivoExpandido(activoExpandido === activo.id ? null : activo.id);
                  }
                }}
              >
                <div className={styles.cardActivoHeader}>
                  <span className={styles.cardActivoIcono} aria-hidden="true">{activo.icono}</span>
                  <div>
                    <h3 className={styles.cardActivoNombre}>{activo.nombre}</h3>
                    <p className={styles.cardActivoDesc}>{activo.descripcion}</p>
                  </div>
                </div>
                <div className={styles.cardActivoBadges}>
                  <span className={`${styles.badge} ${riesgoColor(activo.riesgo)}`}>
                    Riesgo: {activo.riesgo}
                  </span>
                  <span className={`${styles.badge} ${styles.badgeLiquidez}`}>
                    Liquidez: {activo.liquidez}
                  </span>
                </div>
                {activoExpandido === activo.id && (
                  <div className={styles.cardActivoDetalle} role="region">
                    <p><strong>Ejemplo real:</strong> {activo.ejemplo}</p>
                    <p className={styles.detalleTexto}>{activo.detalle}</p>
                  </div>
                )}
                <span className={styles.expandirIndicador} aria-hidden="true">
                  {activoExpandido === activo.id ? '▲ Menos info' : '▼ Más info'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECCIÓN: Libro de Órdenes */}
      {seccionActiva === 'orderbook' && (
        <section className={styles.seccion} aria-label="Simulación del libro de órdenes">
          <h2 className={styles.seccionTitulo}>Libro de Órdenes (Order Book)</h2>
          <p className={styles.seccionDesc}>
            El libro de órdenes agrupa todas las órdenes de compra y venta pendientes. El <strong>precio bid</strong> es el máximo que alguien paga, el <strong>precio ask</strong> es el mínimo al que alguien vende. La diferencia es el <strong>spread</strong>.
          </p>

          <div className={styles.spreadIndicador} role="status" aria-live="polite">
            <div className={styles.spreadItem}>
              <span className={styles.spreadLabel}>Mejor Bid</span>
              <span className={styles.spreadBid}>{mejorBid.toFixed(2)} €</span>
            </div>
            <div className={styles.spreadCentro}>
              <span className={styles.spreadLabel}>Spread</span>
              <span className={styles.spreadValor}>{spread} €</span>
            </div>
            <div className={styles.spreadItem}>
              <span className={styles.spreadLabel}>Mejor Ask</span>
              <span className={styles.spreadAsk}>{mejorAsk.toFixed(2)} €</span>
            </div>
          </div>

          <div className={styles.orderBookGrid}>
            {/* Columna Bid */}
            <div className={styles.orderBookCol}>
              <h3 className={styles.orderBookTitulo} style={{ color: 'var(--color-bid)' }}>
                <span aria-hidden="true">📗</span> Órdenes de Compra (Bid)
              </h3>
              <div className={styles.orderBookHeader}>
                <span>Precio (€)</span>
                <span>Cantidad</span>
                <span>Total</span>
              </div>
              {ordenesBid.map((orden, i) => (
                <div key={i} className={styles.orderBookFila}>
                  <div
                    className={styles.orderBookBarra}
                    style={{ width: `${(orden.total / maxTotal) * 100}%`, background: 'rgba(72, 169, 166, 0.15)' }}
                    aria-hidden="true"
                  />
                  <span className={styles.ordenPrecioBid}>{orden.precio.toFixed(2)}</span>
                  <span>{orden.cantidad.toLocaleString('es-ES')}</span>
                  <span>{orden.total.toLocaleString('es-ES')}</span>
                </div>
              ))}
            </div>

            {/* Columna Ask */}
            <div className={styles.orderBookCol}>
              <h3 className={styles.orderBookTitulo} style={{ color: 'var(--color-ask)' }}>
                <span aria-hidden="true">📕</span> Órdenes de Venta (Ask)
              </h3>
              <div className={styles.orderBookHeader}>
                <span>Precio (€)</span>
                <span>Cantidad</span>
                <span>Total</span>
              </div>
              {ordenesAsk.map((orden, i) => (
                <div key={i} className={styles.orderBookFila}>
                  <div
                    className={styles.orderBookBarra}
                    style={{ width: `${(orden.total / maxTotal) * 100}%`, background: 'rgba(224, 92, 92, 0.15)' }}
                    aria-hidden="true"
                  />
                  <span className={styles.ordenPrecioAsk}>{orden.precio.toFixed(2)}</span>
                  <span>{orden.cantidad.toLocaleString('es-ES')}</span>
                  <span>{orden.total.toLocaleString('es-ES')}</span>
                </div>
              ))}
            </div>
          </div>

          {mensajeMatching && (
            <div className={styles.mensajeMatching} role="alert" aria-live="polite">
              {mensajeMatching}
            </div>
          )}

          <div className={styles.botonesOrderBook}>
            <button type="button" className={styles.btnCompra} onClick={handleAnadirCompra}>
              + Añadir orden de compra
            </button>
            <button type="button" className={styles.btnVenta} onClick={handleAnadirVenta}>
              + Añadir orden de venta
            </button>
            <button type="button" className={styles.btnReset} onClick={resetOrderBook}>
              ↺ Reiniciar
            </button>
          </div>

          <div className={styles.warningBox}>
            <strong><span aria-hidden="true">⚠️</span> Simulación educativa</strong> — Los precios y cantidades son ficticios. En los mercados reales el libro de órdenes se actualiza miles de veces por segundo.
          </div>
        </section>
      )}

      {/* SECCIÓN: Índices Bursátiles */}
      {seccionActiva === 'indices' && (
        <section className={styles.seccion} aria-label="Índices bursátiles del mundo">
          <h2 className={styles.seccionTitulo}>Índices Bursátiles</h2>
          <p className={styles.seccionDesc}>
            Un índice bursátil mide la evolución del mercado de valores de un país o sector. Se calcula como la media ponderada (por capitalización) de las empresas que lo componen.
          </p>

          <div className={styles.indicesTabs} role="tablist">
            {INDICES.map((indice) => (
              <button
                key={indice.id}
                type="button"
                className={`${styles.indiceTab} ${indiceSeleccionado === indice.id ? styles.indiceTabActivo : ''}`}
                onClick={() => setIndiceSeleccionado(indice.id)}
                role="tab"
                aria-selected={indiceSeleccionado === indice.id}
              >
                <span aria-hidden="true">{indice.bandera}</span> {indice.nombre}
              </button>
            ))}
          </div>

          {indiceActual && (
            <div className={styles.indiceDetalle} role="tabpanel">
              <div className={styles.indiceHeader}>
                <span className={styles.indiceBandera} aria-hidden="true">{indiceActual.bandera}</span>
                <div>
                  <h3 className={styles.indiceNombre}>{indiceActual.nombre}</h3>
                  <p className={styles.indicePais}>{indiceActual.pais} · {indiceActual.empresas} empresas</p>
                </div>
              </div>
              <div className={styles.indiceGrid}>
                <div className={styles.indiceBloque}>
                  <h4><span aria-hidden="true">📋</span> Criterio de inclusión</h4>
                  <p>{indiceActual.criterio}</p>
                </div>
                <div className={styles.indiceBloque}>
                  <h4><span aria-hidden="true">🏢</span> Ejemplos de empresas</h4>
                  <ul className={styles.listaEmpresas}>
                    {indiceActual.ejemploEmpresas.map((emp) => (
                      <li key={emp}>{emp}</li>
                    ))}
                  </ul>
                </div>
                <div className={`${styles.indiceBloque} ${styles.indiceCurioso}`}>
                  <h4><span aria-hidden="true">💡</span> Dato curioso</h4>
                  <p>{indiceActual.curioso}</p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* SECCIÓN: Participantes */}
      {seccionActiva === 'participantes' && (
        <section className={styles.seccion} aria-label="Participantes del mercado financiero">
          <h2 className={styles.seccionTitulo}>Participantes del Mercado</h2>
          <p className={styles.seccionDesc}>
            Los mercados financieros no son solo pequeños inversores: el 80% del volumen lo mueven instituciones, algoritmos y bancos. Cada tipo de participante cumple una función específica.
          </p>

          <div className={styles.participantesGrid}>
            {PARTICIPANTES.map((p) => (
              <div key={p.tipo} className={styles.cardParticipante}>
                <div className={styles.participanteHeader}>
                  <span className={styles.participanteIcono} aria-hidden="true">{p.icono}</span>
                  <div>
                    <h3 className={styles.participanteTipo}>{p.tipo}</h3>
                    <div className={styles.participanteVolumenBar} role="img" aria-label={`Volumen: ${p.volumen}%`}>
                      <div
                        className={styles.participanteVolumenRelleno}
                        style={{ width: `${p.volumen}%`, background: p.color }}
                      />
                      <span className={styles.participanteVolumenLabel}>{p.volumen}% del volumen</span>
                    </div>
                  </div>
                </div>
                <p className={styles.participanteDesc}>{p.descripcion}</p>
                <p className={styles.participanteEjemplos}><strong>Ejemplos:</strong> {p.ejemplos}</p>
              </div>
            ))}
          </div>

          <div className={styles.participantesNota}>
            <strong><span aria-hidden="true">📌</span> Nota:</strong> Los porcentajes de volumen son aproximados y varían según el mercado, el instrumento y las condiciones del día. En picos de volatilidad, el HFT puede superar el 50% del volumen intradiario.
          </div>
        </section>
      )}

      {/* Sección educativa */}
      <EducationalSection
        title="¿Cómo funcionan los mercados financieros?"
        subtitle="Del libro de órdenes a la formación de precios: la bolsa explicada"
        icon="📈"
      >
        {/* 1. Tabla comparativa de activos */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <caption>Comparativa de los principales tipos de activos financieros</caption>
            <thead>
              <tr>
                <th>Activo</th>
                <th>Riesgo</th>
                <th>Rentabilidad potencial</th>
                <th>Liquidez</th>
                <th>Ejemplo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Renta fija (bonos)</td>
                <td>Bajo-Medio</td>
                <td>Baja-Media (cupón fijo)</td>
                <td>Alta (mercado secundario)</td>
                <td>Bono español 10 años</td>
              </tr>
              <tr>
                <td>Renta variable (acciones)</td>
                <td>Alto</td>
                <td>Alta (ilimitada)</td>
                <td>Alta (bolsa)</td>
                <td>Acciones de Inditex</td>
              </tr>
              <tr>
                <td>ETF</td>
                <td>Medio</td>
                <td>Media-Alta (según índice)</td>
                <td>Alta</td>
                <td>ETF S&P 500</td>
              </tr>
              <tr>
                <td>Fondos de inversión</td>
                <td>Variable</td>
                <td>Variable</td>
                <td>Media (reembolso T+1/2)</td>
                <td>Fondo indexado global</td>
              </tr>
              <tr>
                <td>Derivados (futuros/opciones)</td>
                <td>Muy alto</td>
                <td>Muy alta (apalancamiento)</td>
                <td>Alta</td>
                <td>Futuro del Ibex 35</td>
              </tr>
              <tr>
                <td>Materias primas</td>
                <td>Alto</td>
                <td>Variable</td>
                <td>Media</td>
                <td>Oro, petróleo</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Perfiles de uso */}
        <div className={styles.escenariosGrid}>
          {[
            {
              icono: '🎓',
              titulo: 'Estudiante de económicas o ADE',
              desc: 'Aprende el funcionamiento del mercado secundario para el examen.',
            },
            {
              icono: '💰',
              titulo: 'Ahorrador que quiere entender su banco',
              desc: 'Comprende qué es un ETF antes de contratar uno.',
            },
            {
              icono: '📰',
              titulo: 'Persona que sigue las noticias',
              desc: 'Entiende qué significa cuando "la bolsa cae un 2%" o "la prima de riesgo sube".',
            },
            {
              icono: '🏦',
              titulo: 'Pequeño inversor principiante',
              desc: 'Entiende qué es el spread antes de operar.',
            },
          ].map((perfil) => (
            <div key={perfil.titulo} className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">{perfil.icono}</span>
              <div>
                <strong>{perfil.titulo}</strong>
                <p>{perfil.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 3. FAQ */}
        <div className={styles.faqList}>
          {[
            {
              q: '¿Qué significa que "la bolsa ha caído un 3% hoy"?',
              a: 'El índice de referencia —IBEX 35, S&P 500— ha bajado ese porcentaje en el día. No todas las acciones caen igual: algunas pueden subir mientras el índice baja.',
            },
            {
              q: '¿Cuál es la diferencia entre un ETF y un fondo de inversión?',
              a: 'El ETF cotiza en bolsa en tiempo real como una acción; el fondo se valora al cierre del día. Ambos diversifican el riesgo. Los ETF suelen tener comisiones más bajas.',
            },
            {
              q: '¿Qué es el spread bid-ask y por qué importa?',
              a: 'Es el coste implícito de operar: la diferencia entre el precio al que se puede comprar (ask) y al que se puede vender (bid). En activos muy líquidos como el IBEX es de céntimos; en activos poco líquidos puede ser del 1-2%.',
            },
            {
              q: '¿Por qué sube la bolsa cuando bajan los tipos de interés?',
              a: 'Los bonos se vuelven menos atractivos → el dinero fluye hacia la renta variable → sube la demanda → suben los precios. Además, el dinero futuro vale más cuando los tipos son bajos, lo que aumenta el valor presente de los beneficios esperados.',
            },
            {
              q: '¿Qué es el HFT y afecta a los pequeños inversores?',
              a: 'High Frequency Trading: algoritmos que operan en microsegundos. Pueden estrechar spreads (beneficio para el minorista) pero también generar volatilidad artificial en momentos de estrés. Para un inversor a largo plazo, su impacto es marginal.',
            },
            {
              q: '¿Cuál es la diferencia entre mercado primario y secundario?',
              a: 'Mercado primario: la empresa emite nuevas acciones o bonos y recauda dinero directamente (OPV, ampliaciones de capital). Mercado secundario: los inversores se venden entre sí esas acciones o bonos sin que el dinero llegue a la empresa.',
            },
          ].map((item) => (
            <div key={item.q} className={styles.faqItem}>
              <strong className={styles.faqPregunta}>{item.q}</strong>
              <p className={styles.faqRespuesta}>{item.a}</p>
            </div>
          ))}
          <p className={styles.faqTip}>
            <span aria-hidden="true">💡</span> <strong>Consejo:</strong> La mejor forma de entender los mercados es usar el simulador de libro de órdenes de esta herramienta: añade órdenes y observa cómo se forma el precio en tiempo real.
          </p>
        </div>

        {/* 4. Guía paso a paso */}
        <div className={styles.stepGuide}>
          <h4>Qué ocurre cuando alguien compra una acción del IBEX</h4>
          {[
            {
              n: 1,
              texto: 'El inversor envía una orden de compra límite (ej: 100 acciones de Telefónica a máximo 4,20 €) desde su bróker.',
            },
            {
              n: 2,
              texto: 'El bróker la transmite al sistema de negociación de BME (Bolsa y Mercados Españoles).',
            },
            {
              n: 3,
              texto: 'El matching engine busca si hay una orden de venta a ≤4,20 € en el libro de órdenes.',
            },
            {
              n: 4,
              texto: 'Si coincide: se ejecuta la transacción. El precio de la última operación se convierte en el precio de mercado.',
            },
            {
              n: 5,
              texto: 'El sistema de liquidación (Iberclear) registra el cambio de propietario de las acciones en T+2 (2 días hábiles).',
            },
            {
              n: 6,
              texto: 'El bróker del comprador debita el importe de la cuenta y acredita las acciones en la cartera.',
            },
          ].map((paso) => (
            <div key={paso.n} className={styles.step}>
              <span className={styles.stepNumber}>{paso.n}</span>
              <div className={styles.stepContent}>{paso.texto}</div>
            </div>
          ))}
        </div>

        {/* 5. Tips / datos clave */}
        <div className={styles.tipsGrid}>
          {[
            {
              icono: '📊',
              texto: 'El precio de una acción no representa el valor total de la empresa — la capitalización bursátil (precio × nº de acciones) sí.',
            },
            {
              icono: '🕐',
              texto: 'El horario importa: la primera y última media hora son las más volátiles del día; los precios de apertura y cierre concentran mucho volumen.',
            },
            {
              icono: '💱',
              texto: 'El forex es el mercado más grande del mundo (~6,6 billones $/día), pero también el más opaco para inversores minoristas.',
            },
            {
              icono: '📉',
              texto: 'Mercado bajista (bear market): caída >20% desde máximos. Alcista (bull market): subida >20% desde mínimos.',
            },
            {
              icono: '🔍',
              texto: 'El PER (Price-to-Earnings Ratio) indica cuántos años de beneficios actuales se pagan por el precio de la acción: PER 15 = precio es 15× el beneficio anual.',
            },
          ].map((tip) => (
            <div key={tip.icono} className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">{tip.icono}</span>
              <p>{tip.texto}</p>
            </div>
          ))}
        </div>

        {/* 6. Warning Box — errores comunes */}
        <div className={styles.eduWarningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores comunes en bolsa</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>"La bolsa siempre sube a largo plazo"</strong> — verdad estadística del S&P 500, pero no de todos los índices: el Nikkei tardó 34 años en recuperar los máximos de 1989.
            </li>
            <li>
              <strong>"Los CFDs son como acciones"</strong> — los CFDs son derivados con apalancamiento; el 74-89% de los minoristas pierde dinero operando CFDs según la CNMV.
            </li>
            <li>
              <strong>"Diversificar es tener muchas acciones del mismo sector"</strong> — la diversificación real combina geografías, sectores y clases de activos.
            </li>
            <li>
              <strong>"El volumen de negociación indica que sube"</strong> — el volumen solo indica actividad; puede ser de vendedores o compradores por igual.
            </li>
            <li>
              <strong>"Los mercados son completamente eficientes"</strong> — existen anomalías documentadas (momentum, value premium, efecto enero) que cuestionan la hipótesis de eficiencia fuerte.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-mercados-financieros')} />
      <ShareCard appName="visualizador-mercados-financieros" />
      <Footer appName="visualizador-mercados-financieros" />
    </div>
  );
}
