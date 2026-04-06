'use client';

import { useState } from 'react';
import styles from './VisualizadorCadenaAlimentaria.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber, formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'camino' | 'reparto' | 'numeros' | 'alternativas';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'camino', titulo: 'El camino', icono: '🚜', subtitulo: 'De la granja a tu mesa en 5 etapas' },
  { id: 'reparto', titulo: '¿Quién se lleva qué?', icono: '💶', subtitulo: 'El reparto del precio final' },
  { id: 'numeros', titulo: 'Los números', icono: '📊', subtitulo: 'Cifras que deberías conocer' },
  { id: 'alternativas', titulo: 'Alternativas', icono: '🌱', subtitulo: 'Otro modelo es posible' },
];

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

interface Etapa {
  icono: string;
  titulo: string;
  lugar: string;
  descripcion: string;
  ejemplo: string;
  detalle: string;
}

const ETAPAS_CAMINO: Etapa[] = [
  {
    icono: '🌱',
    titulo: '1. Producción',
    lugar: 'Granja / Campo',
    descripcion: 'El agricultor o ganadero cultiva o cría el alimento. Siembra, riega, cosecha. Depende del clima, plagas y precios de mercado.',
    ejemplo: 'Un tomate tarda 60-80 días desde la siembra hasta la cosecha. El agricultor recibe entre 0,20 € y 0,40 € por kilo.',
    detalle: 'España es el mayor exportador de frutas y hortalizas de la UE. El campo emplea a ~800.000 personas.',
  },
  {
    icono: '🏭',
    titulo: '2. Procesado',
    lugar: 'Fábrica / Industria',
    descripcion: 'El alimento se limpia, clasifica, envasa, transforma o conserva. Un tomate puede convertirse en salsa, tomate frito o kétchup.',
    ejemplo: 'El procesado añade entre un 20% y un 50% al coste. El envase puede suponer más que el propio alimento.',
    detalle: 'La industria alimentaria es el primer sector industrial de España, con más de 30.000 empresas.',
  },
  {
    icono: '🚛',
    titulo: '3. Distribución',
    lugar: 'Almacén / Logística',
    descripcion: 'Camiones refrigerados llevan el producto desde fábricas a centros logísticos y de ahí a tiendas. Cadena de frío, trazabilidad, plazos.',
    ejemplo: 'Un tomate puede recorrer 3.000 km desde Almería hasta un supermercado en Alemania. La logística supone un 15-25% del precio.',
    detalle: 'España tiene más de 200 plataformas logísticas alimentarias. El transporte refrigerado consume un 40% más de combustible.',
  },
  {
    icono: '🛒',
    titulo: '4. Venta',
    lugar: 'Supermercado / Tienda',
    descripcion: 'El supermercado fija el precio de venta al público. Margen comercial, promociones, pérdidas por caducidad. Las 5 grandes cadenas controlan el 55% del mercado en España.',
    ejemplo: 'El tomate que el agricultor vendió a 0,30 €/kg llega al lineal a 2,50 €/kg. El súper se queda con un 25-35%.',
    detalle: 'España tiene unos 24.000 supermercados. El margen medio del sector es del 2-4% (sobre ventas totales).',
  },
  {
    icono: '🏠',
    titulo: '5. Consumo',
    lugar: 'Tu casa',
    descripcion: 'Compras, almacenas, cocinas y comes. Aquí también se decide: ¿local o importado? ¿fresco o procesado? ¿sobra o se aprovecha?',
    ejemplo: 'El 42% del desperdicio alimentario en España ocurre en los hogares. Cada español tira ~31 kg de comida al año.',
    detalle: 'Una familia media española gasta 5.800 € al año en alimentación (INE 2023). El 30% se destina a productos frescos.',
  },
];

interface Producto {
  nombre: string;
  icono: string;
  precioFinal: number;
  agricultor: number;
  industria: number;
  distribucion: number;
  impuestos: number;
  agricultorHace20: number;
}

const PRODUCTOS: Producto[] = [
  { nombre: 'Leche (1 L)', icono: '🥛', precioFinal: 1.0, agricultor: 35, industria: 25, distribucion: 25, impuestos: 15, agricultorHace20: 48 },
  { nombre: 'Pan (barra)', icono: '🍞', precioFinal: 0.80, agricultor: 12, industria: 38, distribucion: 35, impuestos: 15, agricultorHace20: 22 },
  { nombre: 'Pollo (1 kg)', icono: '🍗', precioFinal: 4.50, agricultor: 40, industria: 18, distribucion: 27, impuestos: 15, agricultorHace20: 55 },
  { nombre: 'Tomate (1 kg)', icono: '🍅', precioFinal: 2.50, agricultor: 15, industria: 22, distribucion: 48, impuestos: 15, agricultorHace20: 30 },
  { nombre: 'Aceite oliva (1 L)', icono: '🫒', precioFinal: 9.50, agricultor: 42, industria: 20, distribucion: 23, impuestos: 15, agricultorHace20: 55 },
];

interface EstadisticaInfo {
  icono: string;
  cifra: string;
  etiqueta: string;
  detalle: string;
}

const ESTADISTICAS: EstadisticaInfo[] = [
  { icono: '🗑️', cifra: '7,7 M', etiqueta: 'Toneladas de comida desperdiciadas al año en España', detalle: 'Equivale al 30% de los alimentos producidos. El desperdicio doméstico supone el 42% del total.' },
  { icono: '💰', cifra: '5.800 €', etiqueta: 'Gasto medio anual en alimentación por hogar', detalle: 'Datos INE 2023. Supone aproximadamente el 14% del presupuesto familiar medio.' },
  { icono: '🏢', cifra: '10', etiqueta: 'Empresas controlan el 80% de productos en el súper', detalle: 'Nestlé, Unilever, PepsiCo, Coca-Cola, Mars, Danone, Mondelez, ABInBev, P&G y JBS dominan los lineales.' },
  { icono: '🛣️', cifra: '45.000 km', etiqueta: 'Distancia media que recorre un alimento', detalle: 'Un plato típico con ingredientes de varios orígenes puede acumular decenas de miles de kilómetros.' },
  { icono: '🧑‍🌾', cifra: '×3,5', etiqueta: 'El precio se multiplica de la granja al súper', detalle: 'De media, el consumidor paga 3,5 veces más de lo que recibe el agricultor. En frutas puede ser ×8.' },
  { icono: '📉', cifra: '-35%', etiqueta: 'Caída de la parte del agricultor en 20 años', detalle: 'En los años 2000 el agricultor recibía ~45% del precio final. Hoy es ~30% de media.' },
];

interface AlternativaInfo {
  icono: string;
  titulo: string;
  descripcion: string;
  pros: string[];
  contras: string[];
}

const ALTERNATIVAS: AlternativaInfo[] = [
  {
    icono: '📍',
    titulo: 'Producto local / Km 0',
    descripcion: 'Alimentos producidos y vendidos en un radio de menos de 100 km. Mercados de productores, tiendas de barrio.',
    pros: ['Menos transporte y huella de carbono', 'Producto más fresco', 'Apoyas la economía local'],
    contras: ['Variedad más limitada', 'Puede ser algo más caro', 'No siempre accesible'],
  },
  {
    icono: '🌿',
    titulo: 'Ecológico / Orgánico',
    descripcion: 'Sin pesticidas sintéticos, sin fertilizantes químicos, bienestar animal. Certificación oficial de la UE.',
    pros: ['Menos químicos en tu comida', 'Mejor para el suelo y biodiversidad', 'Bienestar animal'],
    contras: ['Precio 20-50% superior', 'Rendimiento menor por hectárea', 'El sello no garantiza km0'],
  },
  {
    icono: '🤝',
    titulo: 'Cooperativas de consumo',
    descripcion: 'Grupos de familias que compran directamente a productores, eliminando intermediarios. Cestas semanales.',
    pros: ['Precio justo para el agricultor', 'Producto de temporada', 'Creas comunidad'],
    contras: ['Requiere compromiso semanal', 'No eliges cada producto', 'Disponibilidad limitada'],
  },
  {
    icono: '🧑‍🌾',
    titulo: 'Venta directa del productor',
    descripcion: 'Comprar en la propia granja, por internet al productor o en mercados de agricultores.',
    pros: ['El agricultor recibe el 100%', 'Sabes de dónde viene exactamente', 'Producto ultra fresco'],
    contras: ['Logística compleja para el productor', 'Poca variedad por vendedor', 'No hay en todas las zonas'],
  },
  {
    icono: '🌻',
    titulo: 'Huertos urbanos / comunitarios',
    descripcion: 'Parcelas gestionadas por vecinos en la ciudad. Autoconsumo de hortalizas y frutas de temporada.',
    pros: ['Coste casi cero', 'Educativo y terapéutico', 'Km 0 literal'],
    contras: ['Producción muy pequeña', 'Requiere tiempo y constancia', 'Lista de espera en ciudades'],
  },
];

// ─────────────────────────────────────────────
// Sección 1: El camino
// ─────────────────────────────────────────────

function SeccionCamino() {
  const [etapaActiva, setEtapaActiva] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Un alimento recorre <strong>5 etapas</strong> desde que nace en el campo hasta que llega a tu plato. Ejemplo: el viaje de un tomate.</p>
      </div>

      {/* Diagrama de flujo horizontal */}
      <div className={styles.flujoContainer}>
        {ETAPAS_CAMINO.map((e, i) => (
          <div key={i} className={styles.flujoWrapper}>
            <button
              type="button"
              className={`${styles.flujoEtapa} ${etapaActiva === i ? styles.flujoActivo : ''}`}
              onClick={() => setEtapaActiva(etapaActiva === i ? null : i)}
              aria-expanded={etapaActiva === i}
              aria-label={`${e.titulo}: ${e.lugar}`}
            >
              <span className={styles.flujoIcono} aria-hidden="true">{e.icono}</span>
              <span className={styles.flujoTitulo}>{e.titulo}</span>
              <span className={styles.flujoLugar}>{e.lugar}</span>
            </button>
            {i < ETAPAS_CAMINO.length - 1 && (
              <div className={styles.flujoFlecha} aria-hidden="true">→</div>
            )}
          </div>
        ))}
      </div>

      {/* Detalle de etapa expandida */}
      {etapaActiva !== null && (
        <div className={styles.etapaDetalle}>
          <div className={styles.etapaDetalleHeader}>
            <span aria-hidden="true" className={styles.etapaDetalleIcono}>{ETAPAS_CAMINO[etapaActiva].icono}</span>
            <h3 className={styles.etapaDetalleTitulo}>{ETAPAS_CAMINO[etapaActiva].titulo} — {ETAPAS_CAMINO[etapaActiva].lugar}</h3>
          </div>
          <p className={styles.etapaDetalleDesc}>{ETAPAS_CAMINO[etapaActiva].descripcion}</p>
          <div className={styles.etapaEjemplo}>
            <strong>Ejemplo:</strong> {ETAPAS_CAMINO[etapaActiva].ejemplo}
          </div>
          <p className={styles.etapaDetalleDato}>{ETAPAS_CAMINO[etapaActiva].detalle}</p>
        </div>
      )}

      {etapaActiva === null && (
        <p className={styles.instruccion}>Pulsa en cualquier etapa para ver los detalles</p>
      )}

      <div className={styles.insight}>
        <p>
          De la granja a tu mesa hay <strong>al menos 4 intermediarios</strong>. Cada uno añade coste, tiempo y distancia.
          El agricultor, que hace el trabajo más duro, es quien menos recibe del precio final.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Reparto de precios
// ─────────────────────────────────────────────

function SeccionReparto() {
  const [productoActivo, setProductoActivo] = useState(0);
  const prod = PRODUCTOS[productoActivo];

  const segmentos = [
    { label: 'Agricultor', pct: prod.agricultor, color: '#27ae60' },
    { label: 'Industria', pct: prod.industria, color: '#3498db' },
    { label: 'Distribución', pct: prod.distribucion, color: '#f39c12' },
    { label: 'Impuestos', pct: prod.impuestos, color: '#95a5a6' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Cuando compras un producto, <strong>¿quién se lleva cada euro?</strong> El agricultor recibe una fracción cada vez menor.</p>
      </div>

      {/* Selector de producto */}
      <div className={styles.productoSelector}>
        {PRODUCTOS.map((p, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.productoBtn} ${productoActivo === i ? styles.productoBtnActivo : ''}`}
            onClick={() => setProductoActivo(i)}
            aria-pressed={productoActivo === i}
          >
            <span aria-hidden="true">{p.icono}</span>
            <span className={styles.productoBtnTexto}>{p.nombre}</span>
          </button>
        ))}
      </div>

      {/* Precio final */}
      <div className={styles.precioFinal}>
        <span className={styles.precioLabel}>Precio en el súper:</span>
        <span className={styles.precioValor}>{formatCurrency(prod.precioFinal)}</span>
      </div>

      {/* Barra apilada */}
      <div className={styles.barraContainer}>
        <div className={styles.barraApilada}>
          {segmentos.map((s, i) => (
            <div
              key={i}
              className={styles.barraSegmento}
              style={{ width: `${s.pct}%`, background: s.color }}
              title={`${s.label}: ${s.pct}%`}
            >
              {s.pct >= 15 && <span className={styles.barraTexto}>{s.pct}%</span>}
            </div>
          ))}
        </div>
        <div className={styles.barraLeyenda}>
          {segmentos.map((s, i) => (
            <div key={i} className={styles.barraLeyendaItem}>
              <span className={styles.barraLeyendaColor} style={{ background: s.color }} />
              <span className={styles.barraLeyendaLabel}>{s.label}: {s.pct}%</span>
              <span className={styles.barraLeyendaEuros}>({formatCurrency(Math.round(prod.precioFinal * s.pct) / 100)})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Evolución del agricultor */}
      <div className={styles.evolucionCard}>
        <h3 className={styles.evolucionTitulo}>La parte del agricultor se encoge</h3>
        <div className={styles.evolucionComparativa}>
          <div className={styles.evolucionBarra}>
            <span className={styles.evolucionLabel}>Hace 20 años</span>
            <div className={styles.evolucionTrack}>
              <div
                className={styles.evolucionRelleno}
                style={{ width: `${prod.agricultorHace20}%`, background: '#27ae60' }}
              >
                <span className={styles.evolucionPct}>{prod.agricultorHace20}%</span>
              </div>
            </div>
          </div>
          <div className={styles.evolucionBarra}>
            <span className={styles.evolucionLabel}>Hoy</span>
            <div className={styles.evolucionTrack}>
              <div
                className={styles.evolucionRelleno}
                style={{ width: `${prod.agricultor}%`, background: prod.agricultor < prod.agricultorHace20 ? '#e74c3c' : '#27ae60' }}
              >
                <span className={styles.evolucionPct}>{prod.agricultor}%</span>
              </div>
            </div>
          </div>
          <p className={styles.evolucionDiff}>
            Diferencia: <strong>{prod.agricultor - prod.agricultorHace20} puntos porcentuales</strong>
          </p>
        </div>
      </div>

      {/* Tabla comparativa todos los productos */}
      <div className={styles.tablaProductos}>
        <h3 className={styles.tablaProductosTitulo}>Comparativa por producto</h3>
        <div className={styles.tablaProductosGrid}>
          <div className={styles.tablaProductosHeader}>
            <span>Producto</span>
            <span>Precio</span>
            <span>Agricultor</span>
          </div>
          {PRODUCTOS.map((p, i) => (
            <div key={i} className={styles.tablaProductosRow}>
              <span><span aria-hidden="true">{p.icono}</span> {p.nombre}</span>
              <span>{formatCurrency(p.precioFinal)}</span>
              <span style={{ color: p.agricultor < 25 ? '#e74c3c' : '#27ae60', fontWeight: 700 }}>{p.agricultor}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El pan es el caso más extremo: el agricultor que cultivó el trigo recibe solo un <strong>12%</strong> del precio de la barra.
          El aceite de oliva, por ser producto menos procesado, deja un reparto algo más justo.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Los números
// ─────────────────────────────────────────────

function SeccionNumeros() {
  const [statActiva, setStatActiva] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Cifras clave sobre alimentación en España. Algunos datos que <strong>quizá no conocías</strong>.</p>
      </div>

      <div className={styles.statsGrid}>
        {ESTADISTICAS.map((s, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.statCard} ${statActiva === i ? styles.statCardActivo : ''}`}
            onClick={() => setStatActiva(statActiva === i ? null : i)}
            aria-expanded={statActiva === i}
          >
            <span className={styles.statIcono} aria-hidden="true">{s.icono}</span>
            <span className={styles.statCifra}>{s.cifra}</span>
            <span className={styles.statEtiqueta}>{s.etiqueta}</span>
            {statActiva === i && (
              <span className={styles.statDetalle}>{s.detalle}</span>
            )}
          </button>
        ))}
      </div>

      {/* Visualización de desperdicio */}
      <div className={styles.desperdicioCard}>
        <h3 className={styles.desperdicioTitulo}>¿Dónde se desperdicia la comida?</h3>
        <div className={styles.desperdicioBarras}>
          {[
            { etapa: 'Hogares', pct: 42, icono: '🏠' },
            { etapa: 'Restauración', pct: 14, icono: '🍽️' },
            { etapa: 'Industria', pct: 21, icono: '🏭' },
            { etapa: 'Distribución', pct: 12, icono: '🚛' },
            { etapa: 'Producción', pct: 11, icono: '🌾' },
          ].map((d, i) => (
            <div key={i} className={styles.desperdicioBarra}>
              <div className={styles.desperdicioInfo}>
                <span aria-hidden="true">{d.icono}</span>
                <span className={styles.desperdicioEtapa}>{d.etapa}</span>
                <span className={styles.desperdicioPct}>{d.pct}%</span>
              </div>
              <div className={styles.desperdicioTrack}>
                <div
                  className={styles.desperdicioRelleno}
                  style={{ width: `${d.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className={styles.desperdicioNota}>
          {formatNumber(7700000, 0)} toneladas de comida se tiran cada año en España — equivale a llenar {formatNumber(308, 0)} piscinas olímpicas.
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          El mayor responsable del desperdicio alimentario somos <strong>los hogares</strong> (42%).
          Planificar la compra, aprovechar sobras y entender las fechas de caducidad puede reducir tu desperdicio a la mitad.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Alternativas
// ─────────────────────────────────────────────

function SeccionAlternativas() {
  const [altActiva, setAltActiva] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El modelo actual no es el único. Hay <strong>alternativas reales</strong> que cambian las reglas del juego.</p>
      </div>

      {/* Comparativa estrella: tomate convencional vs local */}
      <div className={styles.comparativaCard}>
        <h3 className={styles.comparativaTitulo}>Tomate convencional vs local</h3>
        <div className={styles.comparativaGrid}>
          <div className={styles.comparativaCol}>
            <span className={styles.comparativaColTitulo}>🏭 Convencional</span>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Distancia</span>
              <span className={styles.comparativaValor}>{formatNumber(3000, 0)} km</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Al agricultor</span>
              <span className={styles.comparativaValor} style={{ color: '#e74c3c' }}>{formatCurrency(0.5)}/kg</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Intermediarios</span>
              <span className={styles.comparativaValor}>3-4</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Recogido</span>
              <span className={styles.comparativaValor}>Verde (madura en tránsito)</span>
            </div>
          </div>
          <div className={`${styles.comparativaCol} ${styles.comparativaColLocal}`}>
            <span className={styles.comparativaColTitulo}>🌱 Local / Km 0</span>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Distancia</span>
              <span className={styles.comparativaValor}>{formatNumber(50, 0)} km</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Al agricultor</span>
              <span className={styles.comparativaValor} style={{ color: '#27ae60' }}>{formatCurrency(1.5)}/kg</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Intermediarios</span>
              <span className={styles.comparativaValor}>0-1</span>
            </div>
            <div className={styles.comparativaFila}>
              <span className={styles.comparativaLabel}>Recogido</span>
              <span className={styles.comparativaValor}>Maduro (más sabor)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de alternativas */}
      <div className={styles.alternativasGrid}>
        {ALTERNATIVAS.map((alt, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.alternativaCard} ${altActiva === i ? styles.alternativaActiva : ''}`}
            onClick={() => setAltActiva(altActiva === i ? null : i)}
            aria-expanded={altActiva === i}
          >
            <div className={styles.alternativaHeader}>
              <span className={styles.alternativaIcono} aria-hidden="true">{alt.icono}</span>
              <span className={styles.alternativaTitulo}>{alt.titulo}</span>
            </div>
            <p className={styles.alternativaDesc}>{alt.descripcion}</p>
            {altActiva === i && (
              <div className={styles.alternativaDetalle}>
                <div className={styles.prosContras}>
                  <div className={styles.prosCol}>
                    <span className={styles.prosContrasTitulo}>Ventajas</span>
                    {alt.pros.map((p, j) => (
                      <span key={j} className={styles.prosItem}>✓ {p}</span>
                    ))}
                  </div>
                  <div className={styles.contrasCol}>
                    <span className={styles.prosContrasTitulo}>Inconvenientes</span>
                    {alt.contras.map((c, j) => (
                      <span key={j} className={styles.contrasItem}>✗ {c}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          No se trata de elegir un único modelo. <strong>Pequeños cambios suman</strong>: comprar fruta de temporada,
          ir al mercado una vez al mes, probar una cooperativa. Cada euro es un voto por el modelo alimentario que quieres.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCadenaAlimentariaPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('camino');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'camino': return <SeccionCamino />;
      case 'reparto': return <SeccionReparto />;
      case 'numeros': return <SeccionNumeros />;
      case 'alternativas': return <SeccionAlternativas />;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>De la Granja a tu Mesa</h1>
          <p className={styles.subtitle}>El viaje de los alimentos: quién produce, quién gana y qué alternativas existen</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.icono}{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Más sobre la cadena alimentaria"
          subtitle="Conceptos clave sobre alimentación y sostenibilidad"
          defaultOpen={false}
        >
          <h3>¿Qué es la cadena alimentaria?</h3>
          <p>
            La cadena alimentaria (o cadena de suministro de alimentos) es el conjunto de etapas que recorre
            un alimento desde su producción hasta el consumo final. Incluye producción, transformación,
            transporte, distribución y venta. Cada eslabón añade valor — y coste.
          </p>

          <h3>¿Por qué el agricultor recibe tan poco?</h3>
          <p>
            La concentración del poder de negociación en pocas cadenas de distribución, la competencia
            por precios bajos entre supermercados y la falta de organización del sector primario hacen
            que el agricultor sea el eslabón más débil. La <strong>Ley de la Cadena Alimentaria</strong> (2021)
            intenta corregir esto prohibiendo la venta a pérdidas, pero su aplicación es lenta.
          </p>

          <h3>¿Qué es el Km 0?</h3>
          <p>
            Producto Km 0 es aquel cultivado y vendido en un radio inferior a 100 km. No tiene certificación
            oficial única, pero varias comunidades autónomas lo regulan. Reduce huella de carbono, mejora
            la frescura y fortalece la economía rural.
          </p>

          <h3>¿Cómo reducir el desperdicio alimentario en casa?</h3>
          <p>
            Planifica las comidas de la semana antes de comprar, respeta las fechas de consumo preferente
            (no son de caducidad), congela lo que no vayas a usar, aprovecha sobras en nuevas recetas
            y compra cantidades realistas. Con estos hábitos puedes reducir tu desperdicio un 50%.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los datos de este explicador son aproximaciones con fines educativos,
            basados en informes de MAPA, INE, FAO y COAG. Los porcentajes de reparto varían según
            temporada, región, canal de venta y tipo de producto. Última revisión: 2025.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-cadena-alimentaria')} />
        <ShareCard appName="visualizador-cadena-alimentaria" />
        <Footer appName="visualizador-cadena-alimentaria" />
      </div>
    </>
  );
}
