'use client';
// @disclaimer: exempt
import { useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import styles from './VisualizadorGeopoliticaRecursos.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Tipos ---
type RecursoId = 'petroleo' | 'gas' | 'litio' | 'tierras-raras' | 'cobre';
type Criticidad = 'Crítico' | 'Alto' | 'Medio';

interface Productor {
  pais: string;
  porcentaje: number;
}

interface Recurso {
  id: RecursoId;
  icono: string;
  nombre: string;
  productores: Productor[];
  reservas: string[];
  usos: string[];
  criticidad: Criticidad;
}

interface FilaDependencia {
  recurso: string;
  icono: string;
  importacion: string;
  proveedor: string;
  riesgo: 'rojo' | 'naranja' | 'verde';
  riesgoLabel: string;
}

interface Conflicto {
  id: number;
  icono: string;
  titulo: string;
  fecha: string;
  descripcion: string;
}

// --- Datos ---
const RECURSOS: Recurso[] = [
  {
    id: 'petroleo',
    icono: '🛢️',
    nombre: 'Petróleo',
    productores: [
      { pais: 'EEUU', porcentaje: 14 },
      { pais: 'Arabia Saudí', porcentaje: 13 },
      { pais: 'Rusia', porcentaje: 11 },
      { pais: 'Canadá', porcentaje: 6 },
      { pais: 'Irak', porcentaje: 5 },
    ],
    reservas: ['Venezuela (17,5% mundial)', 'Arabia Saudí (17,2%)', 'Canadá (9,7%)'],
    usos: ['Transporte y aviación', 'Industria petroquímica', 'Plásticos y fertilizantes'],
    criticidad: 'Alto',
  },
  {
    id: 'gas',
    icono: '⚡',
    nombre: 'Gas Natural',
    productores: [
      { pais: 'EEUU', porcentaje: 24 },
      { pais: 'Rusia', porcentaje: 17 },
      { pais: 'Irán', porcentaje: 6 },
      { pais: 'China', porcentaje: 5 },
      { pais: 'Qatar', porcentaje: 5 },
    ],
    reservas: ['Rusia (19,9% mundial)', 'Irán (17,1%)', 'Qatar (13,1%)'],
    usos: ['Calefacción doméstica', 'Generación eléctrica', 'Industria química'],
    criticidad: 'Crítico',
  },
  {
    id: 'litio',
    icono: '🔋',
    nombre: 'Litio',
    productores: [
      { pais: 'Australia', porcentaje: 47 },
      { pais: 'Chile', porcentaje: 26 },
      { pais: 'China', porcentaje: 15 },
      { pais: 'Argentina', porcentaje: 6 },
      { pais: 'Brasil', porcentaje: 3 },
    ],
    reservas: ['Bolivia (21% mundial)', 'Argentina (20%)', 'Chile (11%)'],
    usos: ['Baterías para vehículos eléctricos', 'Electrónica de consumo', 'Almacenamiento de energía renovable'],
    criticidad: 'Crítico',
  },
  {
    id: 'tierras-raras',
    icono: '🧲',
    nombre: 'Tierras Raras',
    productores: [
      { pais: 'China', porcentaje: 60 },
      { pais: 'EEUU', porcentaje: 14 },
      { pais: 'Australia', porcentaje: 9 },
      { pais: 'Myanmar', porcentaje: 9 },
      { pais: 'Rusia', porcentaje: 5 },
    ],
    reservas: ['China (37% mundial)', 'Vietnam (18%)', 'Brasil (16%)'],
    usos: ['Imanes permanentes (motores EV, turbinas eólicas)', 'Pantallas y catalizadores', 'Tecnología militar y electrónica'],
    criticidad: 'Crítico',
  },
  {
    id: 'cobre',
    icono: '🔌',
    nombre: 'Cobre',
    productores: [
      { pais: 'Chile', porcentaje: 27 },
      { pais: 'Perú', porcentaje: 11 },
      { pais: 'DRC', porcentaje: 10 },
      { pais: 'China', porcentaje: 8 },
      { pais: 'EEUU', porcentaje: 6 },
    ],
    reservas: ['Chile (22% mundial)', 'Australia (10%)', 'Perú (9%)'],
    usos: ['Cableado eléctrico y construcción', 'Vehículos eléctricos (4× más cobre)', 'Electrónica y telecomunicaciones'],
    criticidad: 'Alto',
  },
];

const DEPENDENCIA_UE: FilaDependencia[] = [
  { recurso: 'Gas Natural', icono: '⚡', importacion: '90%', proveedor: 'Noruega / EEUU / Argelia', riesgo: 'rojo', riesgoLabel: 'Alto' },
  { recurso: 'Tierras Raras', icono: '🧲', importacion: '98%', proveedor: 'China', riesgo: 'rojo', riesgoLabel: 'Crítico' },
  { recurso: 'Litio', icono: '🔋', importacion: '97%', proveedor: 'Chile / Argentina / Australia', riesgo: 'naranja', riesgoLabel: 'Medio' },
  { recurso: 'Cobre', icono: '🔌', importacion: '60%', proveedor: 'Chile / Perú', riesgo: 'verde', riesgoLabel: 'Bajo' },
  { recurso: 'Petróleo', icono: '🛢️', importacion: '97%', proveedor: 'Noruega / Kazajistán / EEUU', riesgo: 'naranja', riesgoLabel: 'Medio' },
];

const CONFLICTOS: Conflicto[] = [
  {
    id: 1,
    icono: '🛢️',
    titulo: 'Guerra del Golfo',
    fecha: '1990',
    descripcion: 'La invasión de Kuwait por Irak desencadenó una coalición internacional. El control sobre los yacimientos de petróleo kuwaitíes fue el detonante directo. El Golfo Pérsico alberga más del 60% de las reservas mundiales probadas de crudo.',
  },
  {
    id: 2,
    icono: '🔋',
    titulo: 'Congo-DRC: el coltán de las baterías',
    fecha: '2000s–presente',
    descripcion: 'La República Democrática del Congo produce el 70% del cobalto mundial, mineral esencial para baterías de litio. Grupos armados financian sus operaciones controlando minas artesanales. Los smartphones y los vehículos eléctricos globales dependen de esta cadena.',
  },
  {
    id: 3,
    icono: '⚡',
    titulo: 'Crisis del Gas Europeo',
    fecha: '2022',
    descripcion: 'Tras la invasión rusa de Ucrania, Europa cortó (o perdió) el suministro de gas que representaba el 40% de sus importaciones. Los precios se dispararon ×10 en picos. La crisis aceleró la diversificación hacia GNL de EEUU, Qatar y Noruega, y la inversión en renovables.',
  },
  {
    id: 4,
    icono: '🧲',
    titulo: 'Rivalidad EEUU-China por Tierras Raras',
    fecha: '2010–presente',
    descripcion: 'China controla el 60% de la producción y el 85% del procesamiento de tierras raras. En 2010 restringió exportaciones a Japón durante un conflicto diplomático. La guerra tecnológica EEUU-China incluye controles de exportación de semiconductores y minerales críticos como el germanio y el galio.',
  },
  {
    id: 5,
    icono: '🔌',
    titulo: 'Diplomacia del Litio: el Triángulo',
    fecha: '2020–presente',
    descripcion: 'Argentina, Bolivia y Chile concentran el 60% de las reservas mundiales de litio. Bolivia intentó nacionalizar su sector (con CATL). Argentina negocia con múltiples empresas de EEUU, UE y China. Chile debate la nacionalización parcial. La UE lanzó acuerdos de materias primas críticas para asegurar suministro.',
  },
];

// Datos Chart.js: demanda minerales 2023 vs 2040
const chartData = {
  labels: ['Litio', 'Cobalto', 'Grafito', 'Níquel', 'Cobre', 'Tierras Raras'],
  datasets: [
    {
      label: '2023 (base = 1)',
      data: [1, 1, 1, 1, 1, 1],
      backgroundColor: 'rgba(46, 134, 171, 0.7)',
      borderColor: '#2E86AB',
      borderWidth: 1,
    },
    {
      label: '2040 (proyección AIE)',
      data: [10, 4, 8, 5, 2.5, 6],
      backgroundColor: 'rgba(72, 169, 166, 0.7)',
      borderColor: '#48A9A6',
      borderWidth: 1,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
    title: {
      display: true,
      text: 'Demanda de Minerales Críticos: Multiplicador vs 2023',
    },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'bar'>) =>
          `${ctx.dataset.label}: ×${ctx.parsed.y ?? 0}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: { display: true, text: 'Multiplicador de demanda' },
    },
  },
};

export default function VisualizadorGeopoliticaRecursos() {
  const [recursoActivo, setRecursoActivo] = useState<RecursoId>('petroleo');
  const [conflictoAbierto, setConflictoAbierto] = useState<number | null>(null);

  const recurso = RECURSOS.find((r) => r.id === recursoActivo) as Recurso;

  const toggleConflicto = (id: number) => {
    setConflictoAbierto((prev) => (prev === id ? null : id));
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Geopolítica de los Recursos</h1>
        <p>
          Petróleo, litio, tierras raras y más: quién los produce, dónde están las reservas
          y por qué definen el poder del siglo XXI.
        </p>
      </header>

      <LegalNotice />

      {/* Bloque 1: Selector de recursos */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recursos Estratégicos del Siglo XXI</h2>
        <p className={styles.sectionSubtitle}>
          Selecciona un recurso para ver productores, reservas, usos y criticidad para la UE.
        </p>

        <div className={styles.recursosTabs} role="tablist" aria-label="Selección de recurso estratégico">
          {RECURSOS.map((r) => (
            <button
              key={r.id}
              role="tab"
              aria-selected={recursoActivo === r.id}
              aria-controls={`panel-${r.id}`}
              className={`${styles.recursoTab} ${recursoActivo === r.id ? styles.activo : ''}`}
              onClick={() => setRecursoActivo(r.id)}
            >
              <span className={styles.recursoTabIcono} aria-hidden="true">{r.icono}</span>
              {r.nombre}
            </button>
          ))}
        </div>

        <div
          id={`panel-${recurso.id}`}
          role="tabpanel"
          className={styles.recursoDetalle}
        >
          <div className={styles.recursoDetalleHeader}>
            <span className={styles.recursoDetalleIcono} aria-hidden="true">{recurso.icono}</span>
            <h3 className={styles.recursoDetalleTitulo}>{recurso.nombre}</h3>
            <span
              className={`${styles.criticidadBadge} ${
                recurso.criticidad === 'Crítico'
                  ? styles.criticidadCritico
                  : recurso.criticidad === 'Alto'
                  ? styles.criticidadAlto
                  : styles.criticidadMedio
              }`}
            >
              Criticidad UE: {recurso.criticidad}
            </span>
          </div>

          <div className={styles.productoresGrid}>
            <div>
              <p className={styles.subTitulo}>Top 5 Productores</p>
              {recurso.productores.map((prod) => (
                <div key={prod.pais} className={styles.barraItem}>
                  <div className={styles.barraLabel}>
                    <span>{prod.pais}</span>
                    <span>{prod.porcentaje}%</span>
                  </div>
                  <div className={styles.barraHorizontal} role="progressbar" aria-valuenow={prod.porcentaje} aria-valuemin={0} aria-valuemax={100}>
                    <div
                      className={styles.barraRelleno}
                      style={{ width: `${prod.porcentaje * 2}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <p className={styles.subTitulo}>Mayores Reservas</p>
              <ul className={styles.reservasList}>
                {recurso.reservas.map((reserva) => (
                  <li key={reserva}>{reserva}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className={styles.subTitulo}>Usos Principales</p>
          <ul className={styles.usosList}>
            {recurso.usos.map((uso) => (
              <li key={uso}>{uso}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bloque 2: Dependencia UE */}
      <section className={styles.section} style={{ paddingTop: 0 }}>
        <h2 className={styles.sectionTitle}>Dependencia de Europa</h2>
        <p className={styles.sectionSubtitle}>
          Porcentaje importado, principal proveedor y nivel de riesgo de suministro para la UE.
        </p>

        <div className={styles.gridDependencia}>
          <div className={styles.gridDependenciaHeader}>
            <span>Recurso</span>
            <span className={styles.gridColPorcentajeHeader}>Importación UE</span>
            <span className={styles.gridColProveedorHeader}>Principal proveedor</span>
            <span>Riesgo</span>
          </div>
          {DEPENDENCIA_UE.map((fila) => (
            <div key={fila.recurso} className={styles.gridDependenciaFila}>
              <div className={styles.recursoNombre}>
                <span aria-hidden="true">{fila.icono}</span>
                {fila.recurso}
              </div>
              <div className={`${styles.porcentaje} ${styles.gridColPorcentaje}`}>{fila.importacion}</div>
              <div className={styles.gridColProveedor}>{fila.proveedor}</div>
              <div>
                {fila.riesgo === 'rojo' && (
                  <span className={styles.semaforoRojo}>🔴 {fila.riesgoLabel}</span>
                )}
                {fila.riesgo === 'naranja' && (
                  <span className={styles.semaforoNaranja}>🟠 {fila.riesgoLabel}</span>
                )}
                {fila.riesgo === 'verde' && (
                  <span className={styles.semaforoVerde}>🟢 {fila.riesgoLabel}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bloque 3: Conflictos por recursos */}
      <section className={styles.section} style={{ paddingTop: 0 }}>
        <h2 className={styles.sectionTitle}>Conflictos por Recursos</h2>
        <p className={styles.sectionSubtitle}>
          5 casos clave donde los recursos estratégicos han moldeado la geopolítica mundial.
        </p>

        <div className={styles.timelineConflictos}>
          {CONFLICTOS.map((conflicto) => (
            <div key={conflicto.id} className={styles.conflictoCard}>
              <button
                className={styles.conflictoHeader}
                onClick={() => toggleConflicto(conflicto.id)}
                aria-expanded={conflictoAbierto === conflicto.id}
                aria-controls={`conflicto-body-${conflicto.id}`}
              >
                <span className={styles.conflictoIcono} aria-hidden="true">{conflicto.icono}</span>
                <span className={styles.conflictoTitulo}>{conflicto.titulo}</span>
                <span className={styles.conflictoFecha}>{conflicto.fecha}</span>
                <span
                  className={`${styles.conflictoChevron} ${conflictoAbierto === conflicto.id ? styles.abierto : ''}`}
                  aria-hidden="true"
                >
                  ▼
                </span>
              </button>
              {conflictoAbierto === conflicto.id && (
                <div
                  id={`conflicto-body-${conflicto.id}`}
                  className={styles.conflictoBody}
                >
                  {conflicto.descripcion}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bloque 4: Transición energética */}
      <section className={styles.section} style={{ paddingTop: 0 }}>
        <h2 className={styles.sectionTitle}>Transición Energética y Nuevas Dependencias</h2>
        <p className={styles.sectionSubtitle}>
          La energía verde requiere minerales. Proyección de demanda 2023 → 2040 (fuente: AIE).
        </p>

        <div className={styles.chartContainer}>
          <Bar data={chartData} options={chartOptions} />
        </div>

        <p className={styles.mensajeClave}>
          &ldquo;La transición verde crea nuevas dependencias de minerales críticos concentrados
          en pocos países. Descarbonizar no elimina la geopolítica de los recursos: la transforma.&rdquo;
        </p>
      </section>

      {/* EducationalSection */}
      <section className={styles.section} style={{ paddingTop: 0 }}>
        <EducationalSection
          title="¿Qué son los recursos estratégicos y por qué importan?"
          subtitle="Petróleo, litio, tierras raras y la nueva geopolítica de la energía"
        >
          <p>
            Los <strong>recursos estratégicos</strong> son materias primas cuyo acceso resulta
            crítico para la economía, la seguridad nacional o la soberanía tecnológica de un país
            o bloque. No son solo energéticos (petróleo, gas): incluyen minerales industriales
            como el litio, el cobalto o las tierras raras.
          </p>

          <h4>El &ldquo;Triángulo del Litio&rdquo; y por qué importa</h4>
          <p>
            Argentina, Bolivia y Chile concentran más del 60% de las reservas mundiales de litio,
            el mineral esencial para las baterías de los vehículos eléctricos. Esta región —el
            Triángulo del Litio— se ha convertido en el nuevo Oriente Medio para la era eléctrica.
            China, EEUU y la UE compiten activamente por asegurar contratos de suministro a largo plazo.
          </p>

          <h4>La Ley de Materias Primas Críticas de la UE (CRM Act, 2023)</h4>
          <p>
            Aprobada en 2024, la <strong>Critical Raw Materials Act</strong> fija objetivos
            legalmente vinculantes: para 2030, el 10% de la extracción, el 40% del procesamiento
            y el 15% del reciclado de materiales críticos deben producirse dentro de la UE. La ley
            define 34 materias primas estratégicas, priorizando litio, tierras raras, cobalto,
            grafito y manganeso.
          </p>

          <h4>Cómo diversifica Europa sus proveedores</h4>
          <p>
            Tras la crisis del gas ruso (2022), Europa aceleró tres estrategias: diversificación
            geográfica (más GNL de EEUU, Qatar, Noruega), acuerdos bilaterales de materias primas
            (con Chile, Australia, Namibia, Kazajistán) y aceleración de renovables para reducir
            la demanda total de combustibles fósiles.
          </p>

          <div className={styles.warningBox}>
            Los recursos estratégicos son geopolítica. La dependencia de un solo proveedor para
            un mineral crítico es una vulnerabilidad estructural: puede ser usada como palanca
            de presión política, como demostró China en 2010 con las tierras raras o Rusia con
            el gas en 2022.
          </div>
        </EducationalSection>
      </section>

      <RelatedApps apps={getRelatedApps('visualizador-geopolitica-recursos')} />
      <ShareCard appName="visualizador-geopolitica-recursos" />
      <Footer appName="visualizador-geopolitica-recursos" />
    </div>
  );
}
