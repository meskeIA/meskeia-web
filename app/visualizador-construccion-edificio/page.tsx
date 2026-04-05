'use client';

import { useState } from 'react';
import styles from './VisualizadorConstruccionEdificio.module.css';
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
// Secciones del explicador
// ─────────────────────────────────────────────

type Seccion = 'fases' | 'oficios' | 'materiales' | 'tiempos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'fases', titulo: 'Las fases', icono: '🏗️', subtitulo: 'Las 7 etapas para levantar un edificio desde cero' },
  { id: 'oficios', titulo: 'Los oficios', icono: '👷', subtitulo: 'Más de 15 profesiones trabajan en cada edificio' },
  { id: 'materiales', titulo: 'Materiales', icono: '🧱', subtitulo: 'Los números de un edificio de 30 viviendas' },
  { id: 'tiempos', titulo: 'Tiempos', icono: '📅', subtitulo: 'De la idea a las llaves: 24-36 meses' },
];

// ─────────────────────────────────────────────
// Sección 1: Las fases
// ─────────────────────────────────────────────

interface FaseConstruccion {
  id: string;
  numero: number;
  nombre: string;
  icono: string;
  duracion: string;
  meses: number;
  color: string;
  descripcion: string;
  dato: string;
}

const FASES: FaseConstruccion[] = [
  { id: 'estudio', numero: 1, nombre: 'Estudio del terreno', icono: '🔍', duracion: '1-2 meses', meses: 1.5, color: '#8B7355', descripcion: 'Estudio geotécnico del suelo, topografía, análisis de la normativa urbanística y viabilidad del proyecto.', dato: 'Un sondeo geotécnico puede llegar a 30 m de profundidad' },
  { id: 'proyecto', numero: 2, nombre: 'Proyecto y diseño', icono: '📐', duracion: '3-6 meses', meses: 4.5, color: '#2E86AB', descripcion: 'El arquitecto diseña el edificio: distribución, estructura, instalaciones, cumplimiento del CTE y normativa local.', dato: 'Un proyecto de ejecución puede tener más de 500 páginas' },
  { id: 'cimentacion', numero: 3, nombre: 'Cimentación', icono: '⛏️', duracion: '1-3 meses', meses: 2, color: '#6B5B3F', descripcion: 'Excavación y construcción de los cimientos: zapatas, losas o pilotes según el terreno. Es la base de todo.', dato: 'La cimentación puede suponer el 10-15% del coste total' },
  { id: 'estructura', numero: 4, nombre: 'Estructura', icono: '🏛️', duracion: '4-6 meses', meses: 5, color: '#EF4444', descripcion: 'Pilares, vigas y forjados planta a planta. El esqueleto del edificio crece hacia arriba.', dato: 'Se levanta una planta cada 1-2 semanas con buen ritmo' },
  { id: 'cerramiento', numero: 5, nombre: 'Cerramientos', icono: '🧱', duracion: '2-3 meses', meses: 2.5, color: '#F59E0B', descripcion: 'Fachada, cubierta (tejado) y tabiquería interior. El edificio deja de estar al aire libre.', dato: 'La fachada puede tener 5-6 capas: ladrillo, aislante, cámara...' },
  { id: 'instalaciones', numero: 6, nombre: 'Instalaciones', icono: '⚡', duracion: '3-4 meses', meses: 3.5, color: '#48A9A6', descripcion: 'Fontanería, electricidad, gas, climatización (HVAC), telecomunicaciones, ascensores. Las venas del edificio.', dato: '3 km de cable eléctrico y 2 km de tuberías por edificio' },
  { id: 'acabados', numero: 7, nombre: 'Acabados', icono: '🎨', duracion: '3-5 meses', meses: 4, color: '#8B5CF6', descripcion: 'Suelos, alicatados, pintura, carpintería, sanitarios, cocinas. Lo que el comprador ve y toca.', dato: 'Los acabados representan el 20-30% del coste de la obra' },
];

const maxMeses = Math.max(...FASES.map(f => f.meses));

function SeccionFases() {
  const [faseActiva, setFaseActiva] = useState<string | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Construir un edificio residencial de 30 viviendas pasa por <strong>7 fases principales</strong>. Pulsa en cada una para ver qué ocurre en cada etapa.</p>
      </div>

      {/* Timeline vertical */}
      <div className={styles.timeline}>
        {FASES.map(f => (
          <button
            key={f.id}
            type="button"
            className={`${styles.timelineItem} ${faseActiva === f.id ? styles.timelineActivo : ''}`}
            onClick={() => setFaseActiva(faseActiva === f.id ? null : f.id)}
            aria-expanded={faseActiva === f.id}
            style={{ '--fase-color': f.color } as React.CSSProperties}
          >
            <div className={styles.timelineLinea}>
              <div className={styles.timelineNodo}>
                <span className={styles.timelineNumero}>{f.numero}</span>
              </div>
            </div>
            <div className={styles.timelineContenido}>
              <div className={styles.timelineHeader}>
                <span className={styles.timelineIcono} aria-hidden="true">{f.icono}</span>
                <strong className={styles.timelineNombre}>{f.nombre}</strong>
                <span className={styles.timelineDuracion}>{f.duracion}</span>
              </div>

              {/* Barra duración */}
              <div className={styles.duracionBarra}>
                <div
                  className={styles.duracionRelleno}
                  style={{
                    width: `${(f.meses / maxMeses) * 100}%`,
                    backgroundColor: f.color,
                  }}
                />
              </div>

              {faseActiva === f.id && (
                <div className={styles.timelineDetalle}>
                  <p className={styles.timelineDesc}>{f.descripcion}</p>
                  <span className={styles.timelineDato}>
                    <span aria-hidden="true">💡</span> {f.dato}
                  </span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          De la primera excavadora al último interruptor pueden pasar <strong>12-18 meses de obra</strong>.
          Pero la fase más larga no es construir — es el diseño y los permisos, que pueden tardar más
          que la propia obra.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Los oficios
// ─────────────────────────────────────────────

interface Oficio {
  icono: string;
  nombre: string;
  entraEnFase: string;
  descripcion: string;
  numTrabajadores: string;
  color: string;
}

const OFICIOS: Oficio[] = [
  { icono: '📐', nombre: 'Arquitecto/a', entraEnFase: 'Proyecto', descripcion: 'Diseña el edificio, dirige la obra y firma el proyecto de ejecución.', numTrabajadores: '1-2', color: '#2E86AB' },
  { icono: '🏗️', nombre: 'Aparejador/a', entraEnFase: 'Proyecto', descripcion: 'Director/a de ejecución: controla que la obra siga el proyecto.', numTrabajadores: '1-2', color: '#2E86AB' },
  { icono: '🔬', nombre: 'Ing. de Estructuras', entraEnFase: 'Proyecto', descripcion: 'Calcula pilares, vigas y cimentación para que el edificio no se caiga.', numTrabajadores: '1', color: '#2E86AB' },
  { icono: '⛏️', nombre: 'Operario de excavadora', entraEnFase: 'Cimentación', descripcion: 'Excava el terreno y mueve tierras para la cimentación y sótano.', numTrabajadores: '2-3', color: '#6B5B3F' },
  { icono: '🏛️', nombre: 'Ferrallista', entraEnFase: 'Cimentación', descripcion: 'Prepara y coloca las armaduras de acero dentro del hormigón.', numTrabajadores: '6-8', color: '#EF4444' },
  { icono: '🧱', nombre: 'Albañil', entraEnFase: 'Estructura', descripcion: 'Levanta muros, tabiques, cerramientos. El oficio más versátil de la obra.', numTrabajadores: '8-12', color: '#F59E0B' },
  { icono: '🏗️', nombre: 'Gruista', entraEnFase: 'Estructura', descripcion: 'Maneja la grúa torre que sube materiales a las plantas altas.', numTrabajadores: '1-2', color: '#EF4444' },
  { icono: '🔩', nombre: 'Encofrador/a', entraEnFase: 'Estructura', descripcion: 'Monta los moldes (encofrados) donde se vierte el hormigón.', numTrabajadores: '4-6', color: '#EF4444' },
  { icono: '⚡', nombre: 'Electricista', entraEnFase: 'Instalaciones', descripcion: 'Toda la instalación eléctrica: cuadros, cableado, enchufes, iluminación.', numTrabajadores: '4-6', color: '#48A9A6' },
  { icono: '🔧', nombre: 'Fontanero/a', entraEnFase: 'Instalaciones', descripcion: 'Redes de agua fría, caliente, saneamiento y desagües.', numTrabajadores: '3-4', color: '#48A9A6' },
  { icono: '🔥', nombre: 'Instalador/a de gas', entraEnFase: 'Instalaciones', descripcion: 'Acometida de gas, calderas y calentadores centralizados o individuales.', numTrabajadores: '2-3', color: '#48A9A6' },
  { icono: '❄️', nombre: 'Climatización (HVAC)', entraEnFase: 'Instalaciones', descripcion: 'Conductos de aire acondicionado, calefacción y ventilación.', numTrabajadores: '3-4', color: '#48A9A6' },
  { icono: '🪜', nombre: 'Ascensorista', entraEnFase: 'Instalaciones', descripcion: 'Instala el hueco, guías, cabina y motor del ascensor.', numTrabajadores: '2-3', color: '#48A9A6' },
  { icono: '🎨', nombre: 'Pintor/a', entraEnFase: 'Acabados', descripcion: 'Prepara superficies, aplica imprimación y pintura en todas las estancias.', numTrabajadores: '4-6', color: '#8B5CF6' },
  { icono: '🪵', nombre: 'Carpintero/a', entraEnFase: 'Acabados', descripcion: 'Puertas, armarios empotrados, molduras y remates de madera.', numTrabajadores: '3-4', color: '#8B5CF6' },
  { icono: '🔲', nombre: 'Solador/alicatador', entraEnFase: 'Acabados', descripcion: 'Coloca suelos (parqué, gres, mármol) y azulejos en baños y cocinas.', numTrabajadores: '4-6', color: '#8B5CF6' },
];

const FASES_ORDEN: Record<string, number> = {
  'Proyecto': 1,
  'Cimentación': 2,
  'Estructura': 3,
  'Instalaciones': 4,
  'Acabados': 5,
};

const FASES_COLORES: Record<string, string> = {
  'Proyecto': '#2E86AB',
  'Cimentación': '#6B5B3F',
  'Estructura': '#EF4444',
  'Instalaciones': '#48A9A6',
  'Acabados': '#8B5CF6',
};

function SeccionOficios() {
  const [filtroFase, setFiltroFase] = useState<string | null>(null);

  const fases = Object.keys(FASES_ORDEN);
  const oficiosFiltrados = filtroFase
    ? OFICIOS.filter(o => o.entraEnFase === filtroFase)
    : OFICIOS;

  const totalTrabajadores = OFICIOS.reduce((acc, o) => {
    const partes = o.numTrabajadores.split('-');
    return acc + (partes.length === 2 ? (parseInt(partes[0]) + parseInt(partes[1])) / 2 : parseInt(partes[0]));
  }, 0);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>En un edificio de 30 viviendas trabajan más de <strong>{formatNumber(Math.round(totalTrabajadores), 0)} profesionales</strong> de <strong>{OFICIOS.length} oficios diferentes</strong>. Filtra por fase para ver cuándo entra cada uno.</p>
      </div>

      {/* Filtros por fase */}
      <div className={styles.filtroGrid}>
        <button
          type="button"
          className={`${styles.filtroBtn} ${filtroFase === null ? styles.filtroActivo : ''}`}
          onClick={() => setFiltroFase(null)}
          aria-pressed={filtroFase === null}
        >
          Todos
        </button>
        {fases.map(fase => (
          <button
            key={fase}
            type="button"
            className={`${styles.filtroBtn} ${filtroFase === fase ? styles.filtroActivo : ''}`}
            onClick={() => setFiltroFase(filtroFase === fase ? null : fase)}
            aria-pressed={filtroFase === fase}
            style={{ '--filtro-color': FASES_COLORES[fase] } as React.CSSProperties}
          >
            {fase}
          </button>
        ))}
      </div>

      {/* Grid de oficios */}
      <div className={styles.oficiosGrid}>
        {oficiosFiltrados.map(o => (
          <div
            key={o.nombre}
            className={styles.oficioCard}
            style={{ '--oficio-color': o.color } as React.CSSProperties}
          >
            <div className={styles.oficioHeader}>
              <span className={styles.oficioIcono} aria-hidden="true">{o.icono}</span>
              <div>
                <strong className={styles.oficioNombre}>{o.nombre}</strong>
                <span className={styles.oficioFase}>{o.entraEnFase}</span>
              </div>
              <span className={styles.oficioNum}>{o.numTrabajadores}</span>
            </div>
            <p className={styles.oficioDesc}>{o.descripcion}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          El pico de actividad ocurre en la fase de <strong>estructura e instalaciones</strong>,
          cuando pueden coincidir en la obra <strong>30-40 personas al mismo tiempo</strong>. Coordinar
          tantos oficios es uno de los mayores retos del jefe de obra.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Materiales y números
// ─────────────────────────────────────────────

interface MaterialEdificio {
  icono: string;
  nombre: string;
  cantidad: string;
  unidad: string;
  valor: number;
  maxRef: number;
  color: string;
  detalle: string;
}

const MATERIALES: MaterialEdificio[] = [
  { icono: '🪨', nombre: 'Hormigón', cantidad: '2.500', unidad: 'toneladas', valor: 2500, maxRef: 2500, color: '#6B7280', detalle: 'Mezcla de cemento, agua, arena y grava. Es el material principal de cimentación y estructura.' },
  { icono: '🔩', nombre: 'Acero', cantidad: '300', unidad: 'toneladas', valor: 300, maxRef: 2500, color: '#374151', detalle: 'Armaduras de refuerzo dentro del hormigón (ferralla) y estructura metálica auxiliar.' },
  { icono: '🧱', nombre: 'Ladrillos', cantidad: '15.000', unidad: 'unidades', valor: 15000, maxRef: 15000, color: '#DC2626', detalle: 'Para cerramientos exteriores y tabiquería interior. Cada vivienda necesita unos 500 ladrillos.' },
  { icono: '⚡', nombre: 'Cable eléctrico', cantidad: '3', unidad: 'km', valor: 3, maxRef: 3, color: '#F59E0B', detalle: 'Desde el cuadro general hasta cada enchufe, interruptor y punto de luz del edificio.' },
  { icono: '🔧', nombre: 'Tuberías', cantidad: '2', unidad: 'km', valor: 2, maxRef: 3, color: '#2E86AB', detalle: 'Agua fría, agua caliente, saneamiento, gas y calefacción. Cada vivienda tiene unos 60 m.' },
  { icono: '🪟', nombre: 'Ventanas', cantidad: '180', unidad: 'unidades', valor: 180, maxRef: 180, color: '#48A9A6', detalle: 'Ventanas de aluminio o PVC con doble acristalamiento. Media de 6 ventanas por vivienda.' },
  { icono: '🚪', nombre: 'Puertas', cantidad: '210', unidad: 'unidades', valor: 210, maxRef: 210, color: '#8B5CF6', detalle: 'Puertas interiores (madera), blindadas (entrada) y cortafuegos (zonas comunes). ~7 por vivienda.' },
  { icono: '🪣', nombre: 'Pintura', cantidad: '4.500', unidad: 'litros', valor: 4500, maxRef: 4500, color: '#EC4899', detalle: 'Imprimación + dos manos en todas las viviendas y zonas comunes. ~150 litros por vivienda.' },
];

interface CosteM2 {
  concepto: string;
  icono: string;
  minEuro: number;
  maxEuro: number;
  color: string;
}

const COSTES: CosteM2[] = [
  { concepto: 'Estructura', icono: '🏛️', minEuro: 250, maxEuro: 350, color: '#EF4444' },
  { concepto: 'Cerramientos', icono: '🧱', minEuro: 150, maxEuro: 250, color: '#F59E0B' },
  { concepto: 'Instalaciones', icono: '⚡', minEuro: 200, maxEuro: 300, color: '#48A9A6' },
  { concepto: 'Acabados', icono: '🎨', minEuro: 300, maxEuro: 500, color: '#8B5CF6' },
  { concepto: 'Cimentación', icono: '⛏️', minEuro: 100, maxEuro: 200, color: '#6B5B3F' },
  { concepto: 'Otros (seguros, honorarios...)', icono: '📋', minEuro: 200, maxEuro: 300, color: '#6B7280' },
];

const COSTE_TOTAL_MIN = COSTES.reduce((s, c) => s + c.minEuro, 0);
const COSTE_TOTAL_MAX = COSTES.reduce((s, c) => s + c.maxEuro, 0);

function SeccionMateriales() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Un edificio residencial típico de <strong>30 viviendas</strong> (~3.000 m² construidos) necesita cantidades enormes de materiales. Estos son los números reales.</p>
      </div>

      {/* Bloques proporcionales de materiales */}
      <div className={styles.materialesGrid}>
        {MATERIALES.map(m => (
          <div key={m.nombre} className={styles.materialCard}>
            <div className={styles.materialHeader}>
              <span className={styles.materialIcono} aria-hidden="true">{m.icono}</span>
              <div>
                <strong className={styles.materialNombre}>{m.nombre}</strong>
                <span className={styles.materialCantidad}>{m.cantidad} {m.unidad}</span>
              </div>
            </div>
            <div className={styles.materialBarra}>
              <div
                className={styles.materialRelleno}
                style={{
                  width: `${(m.valor / m.maxRef) * 100}%`,
                  backgroundColor: m.color,
                }}
              />
            </div>
            <p className={styles.materialDetalle}>{m.detalle}</p>
          </div>
        ))}
      </div>

      {/* Coste por m² */}
      <h3 className={styles.subSeccionTitulo}>
        <span aria-hidden="true">💶</span> Coste por m² en España
      </h3>

      <div className={styles.costesGrid}>
        {COSTES.map(c => (
          <div key={c.concepto} className={styles.costeCard} style={{ '--coste-color': c.color } as React.CSSProperties}>
            <div className={styles.costeHeader}>
              <span aria-hidden="true">{c.icono}</span>
              <strong className={styles.costeNombre}>{c.concepto}</strong>
            </div>
            <div className={styles.costeRango}>
              <span>{formatCurrency(c.minEuro)}</span>
              <span className={styles.costeSeparador}>—</span>
              <span>{formatCurrency(c.maxEuro)}</span>
              <span className={styles.costeUnidad}>/m²</span>
            </div>
            <div className={styles.costeBarra}>
              <div
                className={styles.costeRelleno}
                style={{
                  width: `${(c.maxEuro / 500) * 100}%`,
                  backgroundColor: c.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.totalCard}>
        <div className={styles.totalHeader}>
          <span className={styles.totalIcono} aria-hidden="true">🏢</span>
          <span className={styles.totalLabel}>Coste total por m² construido</span>
        </div>
        <span className={styles.totalValor}>
          {formatCurrency(COSTE_TOTAL_MIN)} – {formatCurrency(COSTE_TOTAL_MAX)}/m²
        </span>
        <span className={styles.totalDetalle}>
          Edificio de 3.000 m²: entre {formatCurrency(COSTE_TOTAL_MIN * 3000)} y {formatCurrency(COSTE_TOTAL_MAX * 3000)}
        </span>
      </div>

      <div className={styles.insight}>
        <p>
          Solo en hormigón, un edificio de 30 viviendas necesita <strong>{formatNumber(2500, 0)} toneladas</strong> —
          el peso de unos 1.700 coches. Y los acabados (lo que el comprador ve) representan
          solo el <strong>25-30%</strong> del coste total. La mayor inversión está en lo que no se ve:
          estructura, cimentación e instalaciones.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Tiempos y licencias
// ─────────────────────────────────────────────

interface EtapaTiempo {
  id: string;
  nombre: string;
  icono: string;
  tipo: 'burocracia' | 'obra';
  mesesMin: number;
  mesesMax: number;
  color: string;
  detalle: string;
}

const ETAPAS_TIEMPO: EtapaTiempo[] = [
  { id: 'terreno', nombre: 'Compra de terreno y estudio', icono: '📋', tipo: 'burocracia', mesesMin: 1, mesesMax: 3, color: '#6B7280', detalle: 'Negociación, due diligence, estudio geotécnico y escritura de compraventa.' },
  { id: 'proyecto', nombre: 'Redacción del proyecto', icono: '📐', tipo: 'burocracia', mesesMin: 3, mesesMax: 6, color: '#2E86AB', detalle: 'Proyecto básico + proyecto de ejecución. El arquitecto diseña todo el edificio.' },
  { id: 'licencia', nombre: 'Licencia urbanística', icono: '🏛️', tipo: 'burocracia', mesesMin: 3, mesesMax: 6, color: '#EF4444', detalle: 'El Ayuntamiento revisa el proyecto. Puede pedir correcciones. El trámite más impredecible.' },
  { id: 'permiso', nombre: 'Licencia de obras', icono: '📄', tipo: 'burocracia', mesesMin: 2, mesesMax: 4, color: '#F59E0B', detalle: 'Permiso final para empezar a construir. Requiere visados y seguros obligatorios.' },
  { id: 'construccion', nombre: 'Construcción', icono: '🏗️', tipo: 'obra', mesesMin: 12, mesesMax: 18, color: '#48A9A6', detalle: 'Desde la excavación hasta el último acabado. La fase más visible del proceso.' },
  { id: 'inspeccion', nombre: 'Inspección final y licencia primera ocupación', icono: '✅', tipo: 'burocracia', mesesMin: 1, mesesMax: 2, color: '#10B981', detalle: 'Certificado final de obra, cédula de habitabilidad y licencia de primera ocupación.' },
  { id: 'escrituras', nombre: 'Escrituras y entrega', icono: '🔑', tipo: 'burocracia', mesesMin: 1, mesesMax: 2, color: '#8B5CF6', detalle: 'Escrituras ante notario, inscripción en el Registro y entrega de llaves al comprador.' },
];

const totalMinMeses = ETAPAS_TIEMPO.reduce((s, e) => s + e.mesesMin, 0);
const totalMaxMeses = ETAPAS_TIEMPO.reduce((s, e) => s + e.mesesMax, 0);
const mesesBurocraciaMin = ETAPAS_TIEMPO.filter(e => e.tipo === 'burocracia').reduce((s, e) => s + e.mesesMin, 0);
const mesesBurocraciaMax = ETAPAS_TIEMPO.filter(e => e.tipo === 'burocracia').reduce((s, e) => s + e.mesesMax, 0);

function SeccionTiempos() {
  const [etapaActiva, setEtapaActiva] = useState<string | null>(null);
  const maxBarMeses = Math.max(...ETAPAS_TIEMPO.map(e => e.mesesMax));

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>De la idea a las llaves: <strong>{totalMinMeses}-{totalMaxMeses} meses</strong>. La sorpresa es cuánto tiempo se va en papeles: <strong>{mesesBurocraciaMin}-{mesesBurocraciaMax} meses</strong> de burocracia frente a 12-18 de obra real.</p>
      </div>

      {/* Barra horizontal total */}
      <div className={styles.tiempoBarraTotal} role="img" aria-label="Desglose temporal del proceso de construcción">
        {ETAPAS_TIEMPO.map(e => {
          const pctMedia = ((e.mesesMin + e.mesesMax) / 2 / ((totalMinMeses + totalMaxMeses) / 2)) * 100;
          return (
            <div
              key={e.id}
              className={`${styles.tiempoSegmento} ${etapaActiva === e.id ? styles.tiempoSegmentoActivo : ''}`}
              style={{ width: `${pctMedia}%`, backgroundColor: e.color }}
              onMouseEnter={() => setEtapaActiva(e.id)}
              onMouseLeave={() => setEtapaActiva(null)}
              role="button"
              tabIndex={0}
              aria-label={`${e.nombre}: ${e.mesesMin}-${e.mesesMax} meses`}
              onFocus={() => setEtapaActiva(e.id)}
              onBlur={() => setEtapaActiva(null)}
            />
          );
        })}
      </div>

      <div className={styles.leyendaTiempo}>
        <span className={styles.leyendaItem}>
          <span className={styles.leyendaDot} style={{ backgroundColor: '#6B7280' }} /> Burocracia
        </span>
        <span className={styles.leyendaItem}>
          <span className={styles.leyendaDot} style={{ backgroundColor: '#48A9A6' }} /> Obra
        </span>
      </div>

      {/* Detalle de etapas */}
      <div className={styles.etapasLista}>
        {ETAPAS_TIEMPO.map(e => (
          <div
            key={e.id}
            className={`${styles.etapaCard} ${etapaActiva === e.id ? styles.etapaDestacada : ''}`}
            style={{ '--etapa-color': e.color } as React.CSSProperties}
            onMouseEnter={() => setEtapaActiva(e.id)}
            onMouseLeave={() => setEtapaActiva(null)}
          >
            <div className={styles.etapaHeader}>
              <span className={styles.etapaIndicador} />
              <span className={styles.etapaIcono} aria-hidden="true">{e.icono}</span>
              <strong className={styles.etapaNombre}>{e.nombre}</strong>
              <span className={styles.etapaTipo} data-tipo={e.tipo}>
                {e.tipo === 'burocracia' ? '📋 Papeles' : '🏗️ Obra'}
              </span>
            </div>
            <div className={styles.etapaMeses}>
              <span className={styles.etapaMesesValor}>{e.mesesMin}-{e.mesesMax} meses</span>
              <div className={styles.etapaBarra}>
                <div
                  className={styles.etapaRelleno}
                  style={{
                    width: `${(e.mesesMax / maxBarMeses) * 100}%`,
                    backgroundColor: e.color,
                  }}
                />
              </div>
            </div>
            {etapaActiva === e.id && (
              <p className={styles.etapaDetalle}>{e.detalle}</p>
            )}
          </div>
        ))}
      </div>

      {/* Resumen */}
      <div className={styles.totalCard}>
        <div className={styles.totalHeader}>
          <span className={styles.totalIcono} aria-hidden="true">🔑</span>
          <span className={styles.totalLabel}>De la idea a las llaves</span>
        </div>
        <span className={styles.totalValor}>{totalMinMeses}-{totalMaxMeses} meses</span>
        <span className={styles.totalDetalle}>
          Burocracia: {mesesBurocraciaMin}-{mesesBurocraciaMax} meses ({Math.round(mesesBurocraciaMax / totalMaxMeses * 100)}% del tiempo) · Obra: 12-18 meses
        </span>
      </div>

      <div className={styles.insight}>
        <p>
          La burocracia ocupa <strong>más de la mitad del calendario total</strong>. Solo la licencia
          urbanística puede tardar 6 meses en algunos ayuntamientos. Es el &quot;tiempo invisible&quot;
          que no ves desde la calle — pero que encarece cada vivienda en intereses de financiación.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorConstruccionEdificioPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('fases');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'fases': return <SeccionFases />;
      case 'oficios': return <SeccionOficios />;
      case 'materiales': return <SeccionMateriales />;
      case 'tiempos': return <SeccionTiempos />;
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
          <h1 className={styles.title}>Cómo se Construye un Edificio</h1>
          <p className={styles.subtitle}>7 fases, 15+ oficios y miles de toneladas de material — de la idea a las llaves</p>
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
          title="Lo que no ves de una obra"
          subtitle="Conceptos clave sobre construcción de edificios"
          defaultOpen={false}
        >
          <h3>¿Por qué tardan tanto las licencias?</h3>
          <p>
            Los ayuntamientos deben verificar que el proyecto cumple el Plan General de Ordenación
            Urbana, el Código Técnico de la Edificación (CTE), normativa de accesibilidad, protección
            contra incendios y decenas de requisitos más. Cualquier error obliga a corregir y volver
            a presentar. En ciudades grandes, la cola de expedientes puede superar los 6 meses.
          </p>

          <h3>¿Quién garantiza que no se caiga?</h3>
          <p>
            El ingeniero de estructuras calcula cada pilar, viga y cimentación para soportar el peso
            del edificio, viento, seísmos y cargas de uso. El aparejador supervisa en obra que se
            ejecute exactamente según los planos. Y un seguro decenal (10 años) cubre defectos
            estructurales graves — es obligatorio por ley desde la LOE de 1999.
          </p>

          <h3>¿Por qué es tan caro construir?</h3>
          <p>
            Los materiales representan el 40-50% del coste, pero la mano de obra cualificada supone
            otro 35-40%. España tiene escasez de oficios como ferrallistas, encofradores y
            electricistas — lo que presiona los salarios al alza. El resto son honorarios
            profesionales, licencias, seguros e impuestos.
          </p>

          <h3>¿Qué es el CTE?</h3>
          <p>
            El Código Técnico de la Edificación es la normativa española que establece los requisitos
            mínimos de seguridad estructural, protección contra incendios, salubridad, protección
            contra el ruido y ahorro energético. Todo edificio nuevo debe cumplirlo íntegramente.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los datos de este explicador son orientativos y representan un
            edificio residencial típico de ~30 viviendas en España. Las cifras reales varían según
            la ubicación, calidad de acabados, tipo de terreno y año de construcción.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-construccion-edificio')} />
        <ShareCard appName="visualizador-construccion-edificio" />
        <Footer appName="visualizador-construccion-edificio" />
      </div>
    </>
  );
}
