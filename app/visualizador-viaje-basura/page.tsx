'use client';

import { useState } from 'react';
import styles from './VisualizadorViajeBasura.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Secciones del explicador
// ─────────────────────────────────────────────

type Seccion = 'cubos' | 'despues' | 'degradacion' | 'espana';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'cubos', titulo: 'Los cubos', icono: '🗑️', subtitulo: 'Qué va en cada contenedor y errores comunes' },
  { id: 'despues', titulo: '¿Qué pasa después?', icono: '🏭', subtitulo: 'El viaje de tu basura desde el cubo hasta su nueva vida' },
  { id: 'degradacion', titulo: 'Cuánto tarda', icono: '⏳', subtitulo: 'Lo que tarda cada material en desaparecer' },
  { id: 'espana', titulo: 'España en números', icono: '📊', subtitulo: 'Cuánto reciclamos y cómo lo hacemos' },
];

// ─────────────────────────────────────────────
// Sección 1: Los cubos
// ─────────────────────────────────────────────

interface Contenedor {
  id: string;
  nombre: string;
  color: string;
  colorHex: string;
  icono: string;
  items: string[];
  erroresComunes: { item: string; mal: string; bien: string }[];
}

const CONTENEDORES: Contenedor[] = [
  {
    id: 'organico',
    nombre: 'Orgánico',
    color: 'Marrón',
    colorHex: '#8B4513',
    icono: '🟤',
    items: ['Restos de comida', 'Cáscaras de fruta', 'Posos de café', 'Servilletas sucias', 'Tapones de corcho', 'Flores marchitas'],
    erroresComunes: [
      { item: 'Pañales', mal: 'Orgánico', bien: 'Resto (gris)' },
    ],
  },
  {
    id: 'envases',
    nombre: 'Envases',
    color: 'Amarillo',
    colorHex: '#F59E0B',
    icono: '🟡',
    items: ['Botellas de plástico', 'Latas de conserva', 'Tetra brik', 'Bandejas de porexpán', 'Papel de aluminio', 'Tapas metálicas'],
    erroresComunes: [
      { item: 'Tetra brik', mal: 'Papel (azul)', bien: 'Envases (amarillo) — lleva plástico y aluminio' },
      { item: 'Juguetes de plástico', mal: 'Envases (amarillo)', bien: 'Punto limpio o resto' },
    ],
  },
  {
    id: 'vidrio',
    nombre: 'Vidrio',
    color: 'Verde',
    colorHex: '#16A34A',
    icono: '🟢',
    items: ['Botellas de vino', 'Tarros de conserva', 'Frascos de perfume', 'Botellas de aceite'],
    erroresComunes: [
      { item: 'Vasos y copas', mal: 'Vidrio (verde)', bien: 'Punto limpio — distinta composición' },
      { item: 'Espejos', mal: 'Vidrio (verde)', bien: 'Punto limpio' },
    ],
  },
  {
    id: 'papel',
    nombre: 'Papel y cartón',
    color: 'Azul',
    colorHex: '#2563EB',
    icono: '🔵',
    items: ['Periódicos y revistas', 'Cajas de cartón', 'Folios usados', 'Sobres (sin ventanilla plástica)', 'Hueveras de cartón'],
    erroresComunes: [
      { item: 'Papel de cocina sucio', mal: 'Papel (azul)', bien: 'Orgánico (marrón)' },
      { item: 'Brik de leche', mal: 'Papel (azul)', bien: 'Envases (amarillo)' },
    ],
  },
  {
    id: 'resto',
    nombre: 'Resto',
    color: 'Gris',
    colorHex: '#6B7280',
    icono: '⚫',
    items: ['Pañales', 'Colillas', 'Polvo de barrer', 'Cerámica rota', 'Cepillos de dientes', 'Chicles'],
    erroresComunes: [
      { item: 'Pilas', mal: 'Resto (gris)', bien: 'Contenedor específico de pilas' },
    ],
  },
];

function SeccionCubos() {
  const [contenedorActivo, setContenedorActivo] = useState<string>('organico');
  const contenedor = CONTENEDORES.find(c => c.id === contenedorActivo);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>España tiene <strong>5 contenedores</strong> principales. Parece sencillo, pero más del 25% de lo que tiramos acaba en el cubo equivocado. Pulsa cada contenedor para ver qué va dentro — y los errores más comunes.</p>
      </div>

      {/* Selector de contenedores */}
      <div className={styles.contenedoresGrid}>
        {CONTENEDORES.map(c => (
          <button
            key={c.id}
            type="button"
            className={`${styles.contenedorBtn} ${contenedorActivo === c.id ? styles.contenedorActivo : ''}`}
            onClick={() => setContenedorActivo(c.id)}
            aria-pressed={contenedorActivo === c.id}
            style={{ '--contenedor-color': c.colorHex } as React.CSSProperties}
          >
            <span className={styles.contenedorIcono} aria-hidden="true">{c.icono}</span>
            <span className={styles.contenedorLabel}>{c.nombre}</span>
            <span className={styles.contenedorColor}>{c.color}</span>
          </button>
        ))}
      </div>

      {/* Detalle del contenedor activo */}
      {contenedor && (
        <div className={styles.contenedorDetalle} style={{ '--contenedor-color': contenedor.colorHex } as React.CSSProperties}>
          <div className={styles.detalleHeader}>
            <span className={styles.detalleIcono} aria-hidden="true">{contenedor.icono}</span>
            <h3 className={styles.detalleNombre}>Contenedor {contenedor.color}: {contenedor.nombre}</h3>
          </div>

          <div className={styles.detalleColumnas}>
            <div className={styles.detalleItems}>
              <h4 className={styles.detalleSubtitulo}>Esto SÍ va aquí</h4>
              <ul className={styles.itemsList}>
                {contenedor.items.map(item => (
                  <li key={item} className={styles.itemSi}>
                    <span aria-hidden="true">✅</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {contenedor.erroresComunes.length > 0 && (
              <div className={styles.detalleErrores}>
                <h4 className={styles.detalleSubtitulo}>Errores comunes</h4>
                {contenedor.erroresComunes.map(e => (
                  <div key={e.item} className={styles.errorCard}>
                    <strong className={styles.errorItem}>{e.item}</strong>
                    <div className={styles.errorLinea}>
                      <span className={styles.errorMal}>
                        <span aria-hidden="true">❌</span> {e.mal}
                      </span>
                    </div>
                    <div className={styles.errorLinea}>
                      <span className={styles.errorBien}>
                        <span aria-hidden="true">✅</span> {e.bien}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.insight}>
        <p>
          El error más repetido en España: tirar el <strong>tetra brik al contenedor azul</strong> (papel).
          Aunque parece cartón, lleva capas de plástico y aluminio. Va al <strong>amarillo</strong>.
          Otro clásico: los vasos de cristal no van al verde — tienen distinta composición que las botellas.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: ¿Qué pasa después?
// ─────────────────────────────────────────────

interface ViajeResiduo {
  tipo: string;
  icono: string;
  color: string;
  pasos: { fase: string; icono: string; descripcion: string }[];
  resultado: string;
}

const VIAJES: ViajeResiduo[] = [
  {
    tipo: 'Orgánico',
    icono: '🟤',
    color: '#8B4513',
    pasos: [
      { fase: 'Recogida', icono: '🚛', descripcion: 'Camión específico recoge el contenedor marrón' },
      { fase: 'Planta de compostaje', icono: '🏭', descripcion: 'Se separan impropios y se tritura la materia orgánica' },
      { fase: 'Compostaje', icono: '🌡️', descripcion: 'Fermentación aeróbica durante 3-4 meses a 60-70 °C' },
      { fase: 'Producto final', icono: '🌱', descripcion: 'Compost para agricultura y jardinería' },
    ],
    resultado: '1 tonelada de orgánico = 300-400 kg de compost',
  },
  {
    tipo: 'Envases',
    icono: '🟡',
    color: '#F59E0B',
    pasos: [
      { fase: 'Recogida', icono: '🚛', descripcion: 'Camión recoge el contenedor amarillo' },
      { fase: 'Planta de selección', icono: '🏭', descripcion: 'Separación automática: plásticos, metales, brik' },
      { fase: 'Procesado', icono: '♻️', descripcion: 'Cada material se compacta en balas y va a su reciclador' },
      { fase: 'Producto final', icono: '🧴', descripcion: 'Nuevos envases, textil, mobiliario urbano' },
    ],
    resultado: 'El aluminio se recicla infinitas veces sin perder calidad',
  },
  {
    tipo: 'Vidrio',
    icono: '🟢',
    color: '#16A34A',
    pasos: [
      { fase: 'Recogida', icono: '🚛', descripcion: 'Camión con grúa vacía el iglú verde' },
      { fase: 'Planta de tratamiento', icono: '🏭', descripcion: 'Se retiran tapones, etiquetas y cerámica' },
      { fase: 'Fundición', icono: '🔥', descripcion: 'Se funde a 1.500 °C en hornos industriales' },
      { fase: 'Producto final', icono: '🍾', descripcion: 'Nuevas botellas y tarros, idénticos a los originales' },
    ],
    resultado: 'El vidrio se recicla al 100% infinitas veces',
  },
  {
    tipo: 'Papel y cartón',
    icono: '🔵',
    color: '#2563EB',
    pasos: [
      { fase: 'Recogida', icono: '🚛', descripcion: 'Camión recoge el contenedor azul' },
      { fase: 'Planta de reciclaje', icono: '🏭', descripcion: 'Se tritura y se mezcla con agua para hacer pasta' },
      { fase: 'Limpieza', icono: '💧', descripcion: 'Se eliminan tintas, grapas y adhesivos' },
      { fase: 'Producto final', icono: '📦', descripcion: 'Nuevo papel, cartón, papel higiénico' },
    ],
    resultado: 'El papel puede reciclarse hasta 7 veces',
  },
  {
    tipo: 'Resto',
    icono: '⚫',
    color: '#6B7280',
    pasos: [
      { fase: 'Recogida', icono: '🚛', descripcion: 'Camión de residuos mezclados' },
      { fase: 'Planta TMB', icono: '🏭', descripcion: 'Tratamiento Mecánico-Biológico: se intenta recuperar algo' },
      { fase: 'Vertedero o incineradora', icono: '🔥', descripcion: 'Lo no recuperable se entierra o se quema con recuperación energética' },
      { fase: 'Resultado', icono: '🏔️', descripcion: 'Cenizas en vertedero o electricidad (si se incinera)' },
    ],
    resultado: 'Solo el 10-15% de lo que llega al gris se logra recuperar',
  },
];

function SeccionDespues() {
  const [viajeActivo, setViajeActivo] = useState<number>(0);
  const viaje = VIAJES[viajeActivo];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Cuando el camión se lleva tu basura, empieza un viaje largo y costoso. Cada tipo de residuo tiene un <strong>destino completamente distinto</strong>. Selecciona un tipo para ver su recorrido.</p>
      </div>

      {/* Selector */}
      <div className={styles.viajeSelectorGrid}>
        {VIAJES.map((v, i) => (
          <button
            key={v.tipo}
            type="button"
            className={`${styles.viajeBtn} ${viajeActivo === i ? styles.viajeBtnActivo : ''}`}
            onClick={() => setViajeActivo(i)}
            aria-pressed={viajeActivo === i}
            style={{ '--viaje-color': v.color } as React.CSSProperties}
          >
            <span aria-hidden="true">{v.icono}</span>
            <span>{v.tipo}</span>
          </button>
        ))}
      </div>

      {/* Flujo */}
      <div className={styles.flujoContainer} style={{ '--viaje-color': viaje.color } as React.CSSProperties}>
        {viaje.pasos.map((paso, i) => (
          <div key={paso.fase} className={styles.flujoStep}>
            <div className={styles.flujoIcono}>
              <span aria-hidden="true">{paso.icono}</span>
              <span className={styles.flujoNumero}>{i + 1}</span>
            </div>
            <div className={styles.flujoInfo}>
              <strong className={styles.flujoFase}>{paso.fase}</strong>
              <p className={styles.flujoDesc}>{paso.descripcion}</p>
            </div>
            {i < viaje.pasos.length - 1 && (
              <div className={styles.flujoFlecha} aria-hidden="true">↓</div>
            )}
          </div>
        ))}
        <div className={styles.flujoResultado}>
          <span aria-hidden="true">📌</span> {viaje.resultado}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El <strong>vidrio y el aluminio</strong> se pueden reciclar infinitas veces sin perder calidad.
          El papel aguanta hasta 7 ciclos. El plástico es el más problemático: solo se recicla bien
          el PET (botellas) y el HDPE (garrafas). El resto suele acabar como combustible o en vertedero.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Cuánto tarda en desaparecer
// ─────────────────────────────────────────────

interface MaterialDegradacion {
  nombre: string;
  icono: string;
  tiempoDias: number; // días para escala logarítmica
  tiempoTexto: string;
  color: string;
}

const DEGRADACION: MaterialDegradacion[] = [
  { nombre: 'Cáscara de plátano', icono: '🍌', tiempoDias: 6, tiempoTexto: '2-10 días', color: '#F59E0B' },
  { nombre: 'Periódico', icono: '📰', tiempoDias: 105, tiempoTexto: '2-5 meses', color: '#6B7280' },
  { nombre: 'Colilla de cigarrillo', icono: '🚬', tiempoDias: 1095, tiempoTexto: '1-5 años', color: '#92400E' },
  { nombre: 'Chicle', icono: '🫧', tiempoDias: 1825, tiempoTexto: '5 años', color: '#EC4899' },
  { nombre: 'Lata de aluminio', icono: '🥫', tiempoDias: 73000, tiempoTexto: '200 años', color: '#8B5CF6' },
  { nombre: 'Botella de plástico', icono: '🧴', tiempoDias: 182500, tiempoTexto: '500 años', color: '#EF4444' },
  { nombre: 'Botella de vidrio', icono: '🍾', tiempoDias: 1460000, tiempoTexto: '4.000 años', color: '#16A34A' },
];

const maxLog = Math.log10(DEGRADACION[DEGRADACION.length - 1].tiempoDias);

function SeccionDegradacion() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Lo que tiras hoy puede seguir ahí dentro de <strong>miles de años</strong>. Esta escala logarítmica muestra cuánto tarda cada material en descomponerse en la naturaleza.</p>
      </div>

      <div className={styles.degradacionGrid}>
        {DEGRADACION.map(m => {
          const pct = maxLog > 0 ? (Math.log10(m.tiempoDias) / maxLog) * 100 : 0;
          return (
            <div key={m.nombre} className={styles.degradacionRow}>
              <div className={styles.degradacionLabel}>
                <span className={styles.degradacionIcono} aria-hidden="true">{m.icono}</span>
                <span className={styles.degradacionNombre}>{m.nombre}</span>
              </div>
              <div className={styles.degradacionBarraContainer}>
                <div
                  className={styles.degradacionBarra}
                  style={{ width: `${pct}%`, backgroundColor: m.color }}
                />
              </div>
              <span className={styles.degradacionTiempo}>{m.tiempoTexto}</span>
            </div>
          );
        })}
      </div>

      <div className={styles.escalaInfo}>
        <span>Días</span>
        <span>Meses</span>
        <span>Años</span>
        <span>Siglos</span>
        <span>Milenios</span>
      </div>

      <div className={styles.insight}>
        <p>
          Una <strong>botella de plástico</strong> que tiras hoy seguirá existiendo en el año {formatNumber(2526, 0)}.
          Paradójicamente, el <strong>vidrio</strong> tarda más en degradarse (4.000 años) pero es el material
          que mejor se recicla: se funde y renace infinitas veces. El problema no es el material,
          sino <strong>si llega o no al contenedor correcto</strong>.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: España en números
// ─────────────────────────────────────────────

interface DatoReciclaje {
  material: string;
  icono: string;
  tasaEspana: number;
  tasaUE: number;
  color: string;
}

const DATOS_RECICLAJE: DatoReciclaje[] = [
  { material: 'Vidrio', icono: '🟢', tasaEspana: 79, tasaUE: 78, color: '#16A34A' },
  { material: 'Papel y cartón', icono: '🔵', tasaEspana: 71, tasaUE: 73, color: '#2563EB' },
  { material: 'Envases plástico', icono: '🟡', tasaEspana: 50, tasaUE: 46, color: '#F59E0B' },
  { material: 'Envases metálicos', icono: '⚙️', tasaEspana: 86, tasaUE: 80, color: '#6B7280' },
];

interface DatoGeneral {
  label: string;
  valor: string;
  icono: string;
  detalle: string;
}

const DATOS_GENERALES: DatoGeneral[] = [
  { label: 'Basura por persona al día', valor: '1,3 kg', icono: '🗑️', detalle: '≈ 475 kg al año por habitante' },
  { label: 'Tasa de reciclaje global', valor: '39%', icono: '♻️', detalle: 'Objetivo UE 2025: 55% — España aún lejos' },
  { label: 'Vertedero', valor: '46%', icono: '🏔️', detalle: 'Casi la mitad de los residuos acaba enterrada' },
  { label: 'Contenedores en España', valor: '650.000+', icono: '📦', detalle: '1 contenedor por cada 72 habitantes aprox.' },
];

function SeccionEspana() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Cada español genera <strong>1,3 kg de basura al día</strong>. Reciclamos más que antes, pero menos de lo que parece. Estos son los datos reales.</p>
      </div>

      {/* Tasas de reciclaje por material */}
      <h3 className={styles.subSeccionTitulo}>Tasa de reciclaje por material</h3>
      <div className={styles.reciclajeGrid}>
        {DATOS_RECICLAJE.map(d => (
          <div key={d.material} className={styles.reciclajeCard}>
            <div className={styles.reciclajeHeader}>
              <span aria-hidden="true">{d.icono}</span>
              <strong>{d.material}</strong>
            </div>
            <div className={styles.reciclajeBarras}>
              <div className={styles.reciclajeLinea}>
                <span className={styles.reciclajePais}>España</span>
                <div className={styles.reciclajeBarraContainer}>
                  <div
                    className={styles.reciclajeBarra}
                    style={{ width: `${d.tasaEspana}%`, backgroundColor: d.color }}
                  />
                </div>
                <span className={styles.reciclajePct}>{d.tasaEspana}%</span>
              </div>
              <div className={styles.reciclajeLinea}>
                <span className={styles.reciclajePais}>UE</span>
                <div className={styles.reciclajeBarraContainer}>
                  <div
                    className={styles.reciclajeBarra}
                    style={{ width: `${d.tasaUE}%`, backgroundColor: d.color, opacity: 0.5 }}
                  />
                </div>
                <span className={styles.reciclajePct}>{d.tasaUE}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Datos generales */}
      <h3 className={styles.subSeccionTitulo}>Radiografía de los residuos en España</h3>
      <div className={styles.datosGrid}>
        {DATOS_GENERALES.map(d => (
          <div key={d.label} className={styles.datoCard}>
            <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
            <div>
              <span className={styles.datoValor}>{d.valor}</span>
              <span className={styles.datoLabel}>{d.label}</span>
              <span className={styles.datoDetalle}>{d.detalle}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Economía circular */}
      <div className={styles.circularCard}>
        <h3 className={styles.circularTitulo}>
          <span aria-hidden="true">🔄</span> Economía circular
        </h3>
        <p className={styles.circularDesc}>
          El modelo lineal (<strong>extraer → fabricar → usar → tirar</strong>) está agotado. La economía
          circular propone cerrar el ciclo: que los residuos de hoy sean la materia prima de mañana.
          España recicla el 39% de sus residuos urbanos — el objetivo europeo para 2035 es el <strong>65%</strong>.
        </p>
        <div className={styles.circularFlujo}>
          <span className={styles.circularPaso}>🏭 Fabricar</span>
          <span className={styles.circularFlecha} aria-hidden="true">→</span>
          <span className={styles.circularPaso}>🛒 Usar</span>
          <span className={styles.circularFlecha} aria-hidden="true">→</span>
          <span className={styles.circularPaso}>♻️ Reciclar</span>
          <span className={styles.circularFlecha} aria-hidden="true">→</span>
          <span className={styles.circularPaso}>🔄 Nueva materia prima</span>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          España es <strong>líder europeo en reciclaje de envases metálicos</strong> (86%) y está por encima de
          la media UE en vidrio y plástico. Pero el dato más preocupante es el <strong>46% que va a vertedero</strong>:
          casi la mitad de lo que tiramos se entierra sin más. Reducir residuos es tan importante como reciclarlos.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorViajeBasuraPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('cubos');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'cubos': return <SeccionCubos />;
      case 'despues': return <SeccionDespues />;
      case 'degradacion': return <SeccionDegradacion />;
      case 'espana': return <SeccionEspana />;
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
          <h1 className={styles.title}>El Viaje de tu Basura</h1>
          <p className={styles.subtitle}>Qué pasa con lo que tiras — desde el cubo hasta su nueva vida</p>
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
          title="Todo sobre residuos y reciclaje"
          subtitle="Datos y conceptos que conviene saber"
          defaultOpen={false}
        >
          <h3>¿Por qué separar la basura importa tanto?</h3>
          <p>
            Si los residuos llegan mezclados a la planta de tratamiento, es mucho más caro y difícil
            recuperar materiales. Un solo yogur con restos de comida puede contaminar un lote entero
            de papel reciclable. Separar en casa <strong>multiplica la eficacia del reciclaje</strong> y
            reduce el coste para todos (la tasa de basura sale de tus impuestos).
          </p>

          <h3>¿Qué es un punto limpio?</h3>
          <p>
            Un punto limpio es una instalación municipal donde puedes llevar residuos que no van en
            ningún contenedor de la calle: electrodomésticos, muebles, aceite de cocina, pintura,
            pilas, radiografías, ropa, escombros pequeños. En España hay más de <strong>1.900 puntos limpios</strong>.
            Busca el más cercano en la web de tu ayuntamiento.
          </p>

          <h3>¿Se recicla de verdad todo lo que separamos?</h3>
          <p>
            No todo. Lo que llega al contenedor correcto se recicla en su mayoría, pero hay pérdidas
            en cada fase: impropios (cosas mal clasificadas), materiales no reciclables mezclados,
            y limitaciones técnicas. Por ejemplo, solo ciertos tipos de plástico (PET y HDPE) se
            reciclan de forma rentable. El resto se valoriza energéticamente (se quema generando
            electricidad) o va a vertedero.
          </p>

          <h3>Las 3R: Reducir, Reutilizar, Reciclar</h3>
          <p>
            Reciclar es el último recurso, no el primero. Lo más eficaz es <strong>reducir</strong> (comprar
            menos envases, llevar bolsa propia), luego <strong>reutilizar</strong> (dar segunda vida a objetos),
            y solo después <strong>reciclar</strong>. Una botella de vidrio retornable se usa hasta 50 veces
            antes de reciclarse — 50 veces más eficiente que reciclar cada vez.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los datos de este explicador son orientativos basados en fuentes públicas
            (Ecoembes, Ecovidrio, Eurostat, MITERD). Las cifras de reciclaje varían según la fuente
            y el año de referencia. Los tiempos de degradación son estimaciones en condiciones naturales
            y pueden variar enormemente según el entorno.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-viaje-basura')} />
        <ShareCard appName="visualizador-viaje-basura" />
        <Footer appName="visualizador-viaje-basura" />
      </div>
    </>
  );
}
