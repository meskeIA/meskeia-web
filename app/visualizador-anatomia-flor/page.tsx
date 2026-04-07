'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './AnatomiaFlor.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'anatomia' | 'polinizacion' | 'frutos' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'anatomia', titulo: 'Anatomía', icono: '🌸', subtitulo: 'Partes de la flor' },
  { id: 'polinizacion', titulo: 'Polinización', icono: '🐝', subtitulo: 'Cómo se reproduce' },
  { id: 'frutos', titulo: 'Frutos', icono: '🍎', subtitulo: 'Del ovario al fruto' },
  { id: 'datos', titulo: 'Datos', icono: '🤯', subtitulo: 'Datos fascinantes' },
];

// ─────────────────────────────────────────────
// Partes de la flor
// ─────────────────────────────────────────────

interface ParteFlor {
  id: string;
  nombre: string;
  color: string;
  funcion: string;
  extra: string;
}

const PARTES: ParteFlor[] = [
  { id: 'sepalos', nombre: 'Sépalos (Cáliz)', color: '#4CAF50', funcion: 'Protegen la flor cuando está en capullo. Forman la parte más externa llamada cáliz. Son generalmente verdes y de aspecto similar a hojas.', extra: 'En algunas flores, como los tulipanes, los sépalos tienen el mismo color que los pétalos (se llaman tépalos).' },
  { id: 'petalos', nombre: 'Pétalos (Corola)', color: '#E91E63', funcion: 'Atraen a los polinizadores con colores vivos y a veces con guías de néctar ultravioleta que solo ven los insectos. Forman la corola.', extra: 'Muchos pétalos tienen patrones visibles solo en ultravioleta, como una pista de aterrizaje para las abejas.' },
  { id: 'estambres', nombre: 'Estambres (♂ masculino)', color: '#FF9800', funcion: 'Son los órganos reproductores masculinos. Cada estambre tiene un filamento (tallo fino) y una antera (extremo donde se produce el polen).', extra: 'Una sola antera puede producir miles de granos de polen. Cada grano contiene la mitad de la información genética de la planta.' },
  { id: 'pistilo', nombre: 'Pistilo / Carpelo (♀ femenino)', color: '#9C27B0', funcion: 'Es el órgano reproductor femenino. Tiene tres partes: estigma (superficie pegajosa que recibe el polen), estilo (tubo por el que crece el tubo polínico) y ovario (contiene los óvulos).', extra: 'El estigma segrega sustancias químicas que seleccionan el polen compatible: no cualquier polen vale.' },
  { id: 'receptaculo', nombre: 'Receptáculo', color: '#795548', funcion: 'Es la base ensanchada del pedúnculo donde se insertan todas las piezas florales: sépalos, pétalos, estambres y pistilo.', extra: 'En la fresa, el receptáculo se agranda y se vuelve carnoso. Lo que comemos es el receptáculo, no un fruto verdadero.' },
  { id: 'pedunculo', nombre: 'Pedúnculo', color: '#607D8B', funcion: 'Es el tallo que sostiene la flor y la conecta con el resto de la planta. Transporta agua y nutrientes.', extra: 'Algunas flores carecen de pedúnculo y crecen directamente sobre el tallo (flores sésiles), como las de la espiga del trigo.' },
];

// ─────────────────────────────────────────────
// Polinización
// ─────────────────────────────────────────────

interface TipoPolinizacion {
  id: string;
  nombre: string;
  icono: string;
  desc: string;
  detalle: string;
}

const PASOS_POLINIZACION = [
  'La antera madura y libera miles de granos de polen.',
  'Un vector (insecto, viento, ave o agua) transporta el polen hasta otra flor.',
  'El polen aterriza en el estigma (polinización cruzada) o en la misma flor (autopolinización).',
  'El grano de polen germina y un tubo polínico crece a través del estilo hasta el ovario.',
  'El tubo polínico llega al óvulo y se produce la fecundación: unión del gameto masculino y femenino.',
];

const TIPOS_POLINIZACION: TipoPolinizacion[] = [
  { id: 'entomofila', nombre: 'Entomófila (insectos)', icono: '🐝', desc: 'Flores coloridas con néctar y aroma. Las más comunes.', detalle: 'Las abejas ven en ultravioleta. Muchas flores tienen \"guías de néctar\" invisibles para nosotros que actúan como pistas de aterrizaje para los insectos.' },
  { id: 'anemofila', nombre: 'Anemófila (viento)', icono: '🌬️', desc: 'Flores discretas, sin color vistoso. Producen enormes cantidades de polen ligero.', detalle: 'Los cereales (trigo, maíz, arroz) son anemófilos. Un solo pie de maíz puede liberar millones de granos de polen. Es la causa principal de alergias primaverales.' },
  { id: 'ornitofila', nombre: 'Ornitófila (aves)', icono: '🐦', desc: 'Flores tubulares, rojas o naranjas, con mucho néctar y sin olor (las aves no huelen bien).', detalle: 'Los colibríes son los principales polinizadores aviares en América. Pueden visitar hasta 1.000 flores al día y su pico largo encaja perfectamente en flores tubulares.' },
  { id: 'hidrofila', nombre: 'Hidrófila (agua)', icono: '💧', desc: 'Exclusiva de plantas acuáticas. El polen flota o viaja sumergido hasta el estigma.', detalle: 'La Posidonia oceánica (planta marina mediterránea) libera polen en hilos que flotan hasta otras plantas. Es muy rara: menos del 2% de las plantas usan este método.' },
];

// ─────────────────────────────────────────────
// Frutos
// ─────────────────────────────────────────────

interface TipoFruto {
  id: string;
  nombre: string;
  icono: string;
  desc: string;
  detalle: string;
}

const PASOS_FRUTO = [
  'Tras la fecundación, los pétalos y estambres se marchitan y caen.',
  'El ovario fecundado comienza a crecer y se transforma en el fruto.',
  'Los óvulos fecundados dentro del ovario se convierten en semillas.',
  'El fruto madura y protege las semillas hasta que están listas para dispersarse.',
];

const TIPOS_FRUTO: TipoFruto[] = [
  { id: 'drupa', nombre: 'Drupa (carnoso)', icono: '🍑', desc: 'Un hueso duro rodea la semilla. Melocotón, cereza, ciruela, aceituna.', detalle: 'La drupa tiene tres capas: piel exterior (exocarpo), pulpa jugosa (mesocarpo) y hueso duro (endocarpo) que protege la semilla.' },
  { id: 'baya', nombre: 'Baya (carnoso)', icono: '🍇', desc: 'Semillas dispersas en la pulpa. Tomate, uva, plátano, kiwi.', detalle: 'Botánicamente, un plátano es una baya pero una fresa no lo es. La fresa es un \"falso fruto\": lo que comemos es el receptáculo engrosado y los frutitos reales son los puntitos de la superficie.' },
  { id: 'pomo', nombre: 'Pomo (carnoso)', icono: '🍎', desc: 'Semillas en el centro, rodeadas de pulpa del receptáculo. Manzana, pera.', detalle: 'En un pomo, la parte carnosa proviene del receptáculo floral, no del ovario. Las semillas están protegidas dentro de un corazón cartilaginoso (el verdadero fruto).' },
  { id: 'legumbre', nombre: 'Legumbre (seco)', icono: '🫛', desc: 'Vaina que se abre por dos costuras. Guisante, judía, lenteja.', detalle: 'Las leguminosas fijan nitrógeno del aire gracias a bacterias simbióticas en sus raíces. Por eso enriquecen el suelo y se usan en rotación de cultivos.' },
  { id: 'cariopsis', nombre: 'Cariopsis (seco)', icono: '🌾', desc: 'Fruto y semilla fusionados. Trigo, maíz, arroz, cebada.', detalle: 'Un grano de trigo es un fruto completo. Lo que llamamos \"salvado\" es la pared del fruto, el \"germen\" es el embrión y el \"endospermo\" es la reserva de almidón.' },
  { id: 'nuez', nombre: 'Nuez / Aquenio (seco)', icono: '🌰', desc: 'Cáscara dura protege una sola semilla. Nuez, bellota, avellana, girasol (aquenio).', detalle: 'Cada \"pipa\" de girasol es un fruto completo (aquenio). Un girasol no es una flor, sino una inflorescencia de ~2.000 flores diminutas, cada una produciendo un aquenio.' },
];

interface DispersionInfo {
  icono: string;
  nombre: string;
  ejemplo: string;
}

const DISPERSIONES: DispersionInfo[] = [
  { icono: '🌬️', nombre: 'Viento (anemocoria)', ejemplo: 'Diente de león, arce, álamo' },
  { icono: '🐿️', nombre: 'Animales (zoocoria)', ejemplo: 'Cereza, bellota, zarza' },
  { icono: '🌊', nombre: 'Agua (hidrocoria)', ejemplo: 'Coco, nenúfar, mangle' },
  { icono: '💥', nombre: 'Explosión (autocoria)', ejemplo: 'Pepinillo del diablo, retama' },
];

// ─────────────────────────────────────────────
// Datos fascinantes
// ─────────────────────────────────────────────

interface DatoFascinante {
  id: string;
  icono: string;
  titulo: string;
  desc: string;
  extra: string;
}

const DATOS: DatoFascinante[] = [
  { id: 'especies', icono: '🌸', titulo: '~400.000 especies con flor', desc: 'Las angiospermas (plantas con flor) representan el 90% de todas las plantas terrestres.', extra: 'Aparecieron hace ~140 millones de años y en solo 30 millones de años dominaron todos los ecosistemas, algo que Darwin llamó \"un misterio abominable\".' },
  { id: 'abeja', icono: '🐝', titulo: 'Una abeja visita 50-1.000 flores/día', desc: 'Una colmena necesita visitar unos 2 millones de flores para producir 0,5 kg de miel.', extra: 'Las abejas comunican la ubicación de las flores mediante la \"danza del ocho\": dirección, distancia y calidad del néctar, todo codificado en movimiento.' },
  { id: 'girasol', icono: '🌻', titulo: 'El girasol son ~2.000 flores juntas', desc: 'Lo que parece una sola flor es en realidad una inflorescencia: miles de flores diminutas dispuestas en espiral.', extra: 'Las espirales del girasol siguen la secuencia de Fibonacci (1, 1, 2, 3, 5, 8, 13, 21...). Esto maximiza el empaquetamiento de semillas en el disco.' },
  { id: 'rafflesia', icono: '🌺', titulo: 'Rafflesia: 1 m de diámetro', desc: 'La Rafflesia arnoldii es la flor más grande del mundo, encontrada en las selvas de Borneo y Sumatra.', extra: 'Es parásita (sin hojas, tallo ni raíces propias), huele a carne podrida para atraer moscas polinizadoras y tarda 9 meses en desarrollarse para florecer solo 5-7 días.' },
  { id: 'titan', icono: '💀', titulo: 'La flor cadáver huele a podrido', desc: 'La Amorphophallus titanum puede alcanzar 3 metros de altura y despide un olor fétido intenso para atraer escarabajos y moscas.', extra: 'Florece solo cada 7-10 años durante unas 48 horas. Los jardines botánicos del mundo la tratan como un evento y miles de personas hacen cola para verla (y olerla).' },
  { id: 'orquidea', icono: '⏱️', titulo: 'Orquídeas: hasta 15 años para florecer', desc: 'Algunas orquídeas epífitas necesitan más de una década para producir su primera flor.', extra: 'Las orquídeas son maestras del engaño: algunas imitan la forma y el olor de insectos hembra para que los machos intenten aparearse y así transporten el polen (polinización por engaño sexual).' },
  { id: 'chocolate', icono: '🍫', titulo: 'Sin polinizadores, no hay chocolate', desc: 'El árbol del cacao (Theobroma cacao) depende exclusivamente de mosquitos diminutos del género Forcipomyia para su polinización.', extra: 'Solo el 5% de las flores del cacao son polinizadas con éxito. Cada fruto (mazorca) necesita unas 20.000 visitas de estos mosquitos y contiene ~40 semillas de cacao.' },
];

// ─────────────────────────────────────────────
// Componente SVG: diagrama de flor
// ─────────────────────────────────────────────

interface FlorDiagramaProps {
  parteSeleccionada: string | null;
  onSelectParte: (id: string) => void;
}

function FlorDiagrama({ parteSeleccionada, onSelectParte }: FlorDiagramaProps) {
  return (
    <svg viewBox="0 0 400 400" className={styles.florSvg} role="img" aria-label="Diagrama de sección transversal de una flor con partes clickables">
      {/* Pedúnculo */}
      <g
        className={`${styles.parteBtn} ${parteSeleccionada === 'pedunculo' ? styles.parteBtnSelected : ''}`}
        onClick={() => onSelectParte('pedunculo')}
        role="button"
        tabIndex={0}
        aria-label="Pedúnculo"
        onKeyDown={(e) => e.key === 'Enter' && onSelectParte('pedunculo')}
      >
        <rect x="188" y="320" width="24" height="80" rx="6" fill="#607D8B" />
        <text x="200" y="390" textAnchor="middle" fontSize="10" fill="#607D8B" fontWeight="600">Pedúnculo</text>
      </g>

      {/* Receptáculo */}
      <g
        className={`${styles.parteBtn} ${parteSeleccionada === 'receptaculo' ? styles.parteBtnSelected : ''}`}
        onClick={() => onSelectParte('receptaculo')}
        role="button"
        tabIndex={0}
        aria-label="Receptáculo"
        onKeyDown={(e) => e.key === 'Enter' && onSelectParte('receptaculo')}
      >
        <ellipse cx="200" cy="310" rx="60" ry="18" fill="#795548" />
        <text x="200" y="340" textAnchor="middle" fontSize="10" fill="#795548" fontWeight="600">Receptáculo</text>
      </g>

      {/* Sépalos */}
      <g
        className={`${styles.parteBtn} ${parteSeleccionada === 'sepalos' ? styles.parteBtnSelected : ''}`}
        onClick={() => onSelectParte('sepalos')}
        role="button"
        tabIndex={0}
        aria-label="Sépalos"
        onKeyDown={(e) => e.key === 'Enter' && onSelectParte('sepalos')}
      >
        <ellipse cx="120" cy="280" rx="30" ry="12" fill="#4CAF50" transform="rotate(-30 120 280)" />
        <ellipse cx="280" cy="280" rx="30" ry="12" fill="#4CAF50" transform="rotate(30 280 280)" />
        <text x="80" y="290" fontSize="10" fill="#4CAF50" fontWeight="600">Sépalos</text>
      </g>

      {/* Pétalos */}
      <g
        className={`${styles.parteBtn} ${parteSeleccionada === 'petalos' ? styles.parteBtnSelected : ''}`}
        onClick={() => onSelectParte('petalos')}
        role="button"
        tabIndex={0}
        aria-label="Pétalos"
        onKeyDown={(e) => e.key === 'Enter' && onSelectParte('petalos')}
      >
        <ellipse cx="200" cy="140" rx="28" ry="55" fill="#E91E63" opacity="0.85" />
        <ellipse cx="130" cy="200" rx="28" ry="55" fill="#E91E63" opacity="0.85" transform="rotate(-60 130 200)" />
        <ellipse cx="270" cy="200" rx="28" ry="55" fill="#E91E63" opacity="0.85" transform="rotate(60 270 200)" />
        <ellipse cx="145" cy="270" rx="28" ry="55" fill="#E91E63" opacity="0.75" transform="rotate(-120 145 270)" />
        <ellipse cx="255" cy="270" rx="28" ry="55" fill="#E91E63" opacity="0.75" transform="rotate(120 255 270)" />
        <text x="200" y="90" textAnchor="middle" fontSize="10" fill="#E91E63" fontWeight="600">Pétalos</text>
      </g>

      {/* Estambres */}
      <g
        className={`${styles.parteBtn} ${parteSeleccionada === 'estambres' ? styles.parteBtnSelected : ''}`}
        onClick={() => onSelectParte('estambres')}
        role="button"
        tabIndex={0}
        aria-label="Estambres"
        onKeyDown={(e) => e.key === 'Enter' && onSelectParte('estambres')}
      >
        <line x1="170" y1="290" x2="155" y2="180" stroke="#FF9800" strokeWidth="3" />
        <circle cx="155" cy="175" r="8" fill="#FF9800" />
        <line x1="185" y1="290" x2="175" y2="165" stroke="#FF9800" strokeWidth="3" />
        <circle cx="175" cy="160" r="8" fill="#FF9800" />
        <line x1="215" y1="290" x2="225" y2="165" stroke="#FF9800" strokeWidth="3" />
        <circle cx="225" cy="160" r="8" fill="#FF9800" />
        <line x1="230" y1="290" x2="245" y2="180" stroke="#FF9800" strokeWidth="3" />
        <circle cx="245" cy="175" r="8" fill="#FF9800" />
        <text x="270" y="150" fontSize="10" fill="#FF9800" fontWeight="600">Estambres</text>
        <text x="270" y="162" fontSize="8" fill="#FF9800">(antera + filamento)</text>
      </g>

      {/* Pistilo / Carpelo */}
      <g
        className={`${styles.parteBtn} ${parteSeleccionada === 'pistilo' ? styles.parteBtnSelected : ''}`}
        onClick={() => onSelectParte('pistilo')}
        role="button"
        tabIndex={0}
        aria-label="Pistilo"
        onKeyDown={(e) => e.key === 'Enter' && onSelectParte('pistilo')}
      >
        {/* Ovario */}
        <ellipse cx="200" cy="285" rx="22" ry="18" fill="#9C27B0" opacity="0.8" />
        <circle cx="194" cy="283" r="4" fill="#CE93D8" />
        <circle cx="206" cy="283" r="4" fill="#CE93D8" />
        <circle cx="200" cy="290" r="4" fill="#CE93D8" />
        {/* Estilo */}
        <line x1="200" y1="267" x2="200" y2="210" stroke="#9C27B0" strokeWidth="4" />
        {/* Estigma */}
        <ellipse cx="200" cy="205" rx="12" ry="6" fill="#9C27B0" />
        <text x="125" y="210" fontSize="10" fill="#9C27B0" fontWeight="600">Pistilo</text>
        <text x="110" y="222" fontSize="8" fill="#9C27B0">estigma + estilo + ovario</text>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function AnatomiaFlorPage() {
  const [seccion, setSeccion] = useState<Seccion>('anatomia');
  const [parteSeleccionada, setParteSeleccionada] = useState<string | null>(null);
  const [tipoPolinizacion, setTipoPolinizacion] = useState<string | null>(null);
  const [tipoFruto, setTipoFruto] = useState<string | null>(null);
  const [datoActivo, setDatoActivo] = useState<string | null>(null);

  const seccionActual = SECCIONES.find((s) => s.id === seccion);
  const parteActiva = PARTES.find((p) => p.id === parteSeleccionada);
  const polinizacionActiva = TIPOS_POLINIZACION.find((t) => t.id === tipoPolinizacion);
  const frutoActivo = TIPOS_FRUTO.find((f) => f.id === tipoFruto);
  const datoActivoInfo = DATOS.find((d) => d.id === datoActivo);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🌸 Anatomía de una Flor</h1>
          <p className={styles.subtitle}>De la polinización a la formación de frutos y semillas</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
          {SECCIONES.map((s) => (
            <button
              key={s.id}
              className={`${styles.navBtn} ${seccion === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccion(s.id)}
              aria-pressed={seccion === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera de sección */}
        {seccionActual && (
          <div className={styles.seccionHeader}>
            <h2 className={styles.seccionTitulo}>{seccionActual.icono} {seccionActual.titulo}</h2>
            <p className={styles.seccionSubtitulo}>{seccionActual.subtitulo}</p>
          </div>
        )}

        {/* ═══════ SECCIÓN 1: ANATOMÍA ═══════ */}
        {seccion === 'anatomia' && (
          <div className={styles.seccionContent}>
            {/* Diagrama SVG interactivo */}
            <div className={styles.florContainer}>
              <FlorDiagrama
                parteSeleccionada={parteSeleccionada}
                onSelectParte={(id) => setParteSeleccionada(parteSeleccionada === id ? null : id)}
              />
            </div>

            {/* Panel de info de la parte seleccionada */}
            {parteActiva && (
              <div className={styles.parteInfo}>
                <div className={styles.parteInfoHeader}>
                  <span className={styles.parteColorDot} style={{ backgroundColor: parteActiva.color }} />
                  <span className={styles.parteNombre}>{parteActiva.nombre}</span>
                </div>
                <p className={styles.parteFuncion}>{parteActiva.funcion}</p>
                <p className={styles.parteExtra}>{parteActiva.extra}</p>
              </div>
            )}

            {!parteSeleccionada && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Pulsa sobre cualquier parte del diagrama para ver su función
              </p>
            )}

            {/* Grid de partes como botones alternativos */}
            <div className={styles.seccionLabel}>Todas las partes</div>
            <div className={styles.partesGrid}>
              {PARTES.map((parte) => (
                <button
                  key={parte.id}
                  className={`${styles.parteCard} ${parteSeleccionada === parte.id ? styles.parteCardActiva : ''}`}
                  onClick={() => setParteSeleccionada(parteSeleccionada === parte.id ? null : parte.id)}
                  aria-pressed={parteSeleccionada === parte.id}
                >
                  <div className={styles.parteCardHeader}>
                    <span className={styles.parteColorDot} style={{ backgroundColor: parte.color }} />
                    <span className={styles.parteCardNombre}>{parte.nombre}</span>
                  </div>
                  <p className={styles.parteCardDesc}>{parte.funcion.split('.')[0]}.</p>
                </button>
              ))}
            </div>

            <div className={styles.insight}>
              <p><strong>💡 Flor completa vs. incompleta:</strong> Una flor completa tiene las 4 partes (sépalos, pétalos, estambres y pistilo). Si falta alguna es incompleta. Las gramíneas (trigo, arroz) tienen flores incompletas: sin pétalos ni sépalos vistosos, porque dependen del viento, no de polinizadores.</p>
            </div>

            <div className={styles.insight}>
              <p>Una flor es un sistema reproductivo completo — masculino y femenino en uno. Es la estructura más sofisticada que las plantas han desarrollado en 400 millones de años de evolución.</p>
            </div>
          </div>
        )}

        {/* ═══════ SECCIÓN 2: POLINIZACIÓN ═══════ */}
        {seccion === 'polinizacion' && (
          <div className={styles.seccionContent}>
            <div className={styles.seccionLabel}>El proceso paso a paso</div>
            <div className={styles.polinizacionPasos}>
              {PASOS_POLINIZACION.map((paso, i) => (
                <div key={i} className={styles.paso}>
                  <span className={styles.pasoNumero}>{i + 1}</span>
                  <span className={styles.pasoTexto}>{paso}</span>
                </div>
              ))}
            </div>

            <div className={styles.insight}>
              <p><strong>🔄 Autopolinización vs. polinización cruzada:</strong> La autopolinización (misma flor o misma planta) es más fiable pero reduce la diversidad genética. La polinización cruzada (entre plantas distintas) genera descendientes más resistentes. La mayoría de las plantas tiene mecanismos para favorecer la cruzada.</p>
            </div>

            <div className={styles.seccionLabel}>Tipos de polinización</div>
            <div className={styles.tiposGrid}>
              {TIPOS_POLINIZACION.map((tipo) => (
                <button
                  key={tipo.id}
                  className={`${styles.tipoCard} ${tipoPolinizacion === tipo.id ? styles.tipoCardActivo : ''}`}
                  onClick={() => setTipoPolinizacion(tipoPolinizacion === tipo.id ? null : tipo.id)}
                  aria-pressed={tipoPolinizacion === tipo.id}
                >
                  <div className={styles.tipoCardHeader}>
                    <span className={styles.tipoIcono} aria-hidden="true">{tipo.icono}</span>
                    <span className={styles.tipoNombre}>{tipo.nombre}</span>
                  </div>
                  <p className={styles.tipoDesc}>{tipo.desc}</p>
                  {tipoPolinizacion === tipo.id && (
                    <p className={styles.tipoDetalle}>{tipo.detalle}</p>
                  )}
                </button>
              ))}
            </div>

            <div className={styles.insight}>
              <p>El 75% de los cultivos alimentarios del mundo dependen de polinizadores animales. Sin abejas, mariposas y otros insectos, perderíamos la mayoría de frutas, verduras y frutos secos de nuestra dieta.</p>
            </div>
          </div>
        )}

        {/* ═══════ SECCIÓN 3: FRUTOS ═══════ */}
        {seccion === 'frutos' && (
          <div className={styles.seccionContent}>
            <div className={styles.seccionLabel}>Transformación: del ovario al fruto</div>
            <div className={styles.transformacionPasos}>
              {PASOS_FRUTO.map((paso, i) => (
                <div key={i} className={styles.paso}>
                  <span className={styles.pasoNumero}>{i + 1}</span>
                  <span className={styles.pasoTexto}>{paso}</span>
                </div>
              ))}
            </div>

            <div className={styles.seccionLabel}>Tipos de frutos</div>
            <div className={styles.frutosGrid}>
              {TIPOS_FRUTO.map((fruto) => (
                <button
                  key={fruto.id}
                  className={`${styles.frutoCard} ${tipoFruto === fruto.id ? styles.frutoCardActivo : ''}`}
                  onClick={() => setTipoFruto(tipoFruto === fruto.id ? null : fruto.id)}
                  aria-pressed={tipoFruto === fruto.id}
                >
                  <div className={styles.frutoCardHeader}>
                    <span className={styles.frutoIcono} aria-hidden="true">{fruto.icono}</span>
                    <span className={styles.frutoNombre}>{fruto.nombre}</span>
                  </div>
                  <p className={styles.frutoDesc}>{fruto.desc}</p>
                  {tipoFruto === fruto.id && (
                    <p className={styles.frutoDetalle}>{fruto.detalle}</p>
                  )}
                </button>
              ))}
            </div>

            <div className={styles.seccionLabel}>Dispersión de semillas</div>
            <div className={styles.dispersionGrid}>
              {DISPERSIONES.map((d, i) => (
                <div key={i} className={styles.dispersionCard}>
                  <div className={styles.dispersionIcono} aria-hidden="true">{d.icono}</div>
                  <div className={styles.dispersionNombre}>{d.nombre}</div>
                  <div className={styles.dispersionEjemplo}>{d.ejemplo}</div>
                </div>
              ))}
            </div>

            <div className={styles.insight}>
              <p>Un tomate es un fruto (baya, botánicamente). Una fresa técnicamente no lo es: los frutitos reales son los puntitos de la superficie (aquenios), y lo rojo y carnoso es el receptáculo floral engrosado.</p>
            </div>
          </div>
        )}

        {/* ═══════ SECCIÓN 4: DATOS FASCINANTES ═══════ */}
        {seccion === 'datos' && (
          <div className={styles.seccionContent}>
            <div className={styles.datosGrid}>
              {DATOS.map((dato) => (
                <button
                  key={dato.id}
                  className={`${styles.datoCard} ${datoActivo === dato.id ? styles.datoCardActivo : ''}`}
                  onClick={() => setDatoActivo(datoActivo === dato.id ? null : dato.id)}
                  aria-pressed={datoActivo === dato.id}
                >
                  <div className={styles.datoCardHeader}>
                    <span className={styles.datoIcono} aria-hidden="true">{dato.icono}</span>
                    <span className={styles.datoTitulo}>{dato.titulo}</span>
                  </div>
                  <p className={styles.datoDesc}>{dato.desc}</p>
                  {datoActivo === dato.id && (
                    <p className={styles.datoExtra}>{dato.extra}</p>
                  )}
                </button>
              ))}
            </div>

            {/* Timeline evolutivo */}
            <div className={styles.timeline}>
              <div className={styles.timelineTitle}>Evolución de las plantas con flor</div>
              <div className={styles.timelineBar}>
                <div className={styles.timelineDot} style={{ left: '0%' }}>
                  <span className={styles.timelineLabel}>~140 Ma<br/>Primeras flores</span>
                </div>
                <div className={styles.timelineDot} style={{ left: '25%' }}>
                  <span className={`${styles.timelineLabel} ${styles.timelineLabelWide}`} style={{ top: '-40px' }}>~110 Ma<br/>Diversificación con insectos</span>
                </div>
                <div className={styles.timelineDot} style={{ left: '55%' }}>
                  <span className={styles.timelineLabel}>~65 Ma<br/>Dominancia global</span>
                </div>
                <div className={styles.timelineDot} style={{ left: '85%' }}>
                  <span className={`${styles.timelineLabel} ${styles.timelineLabelWide}`} style={{ top: '-40px' }}>~10 Ma<br/>Praderas modernas</span>
                </div>
                <div className={styles.timelineDot} style={{ left: '100%' }}>
                  <span className={styles.timelineLabel}>Hoy<br/>400.000 sp.</span>
                </div>
              </div>
            </div>

            <div className={styles.insight}>
              <p>Las plantas con flor conquistaron el planeta gracias a una alianza con los animales: a cambio de néctar y frutos, los animales transportan polen y semillas. Es una de las asociaciones mutualistas más exitosas de la historia de la vida.</p>
            </div>
          </div>
        )}

        {/* ═══════ CONTENIDO EDUCATIVO ═══════ */}
        <EducationalSection
          title="📚 ¿Quieres aprender más?"
          subtitle="Conceptos clave de botánica reproductiva"
        >
          <section className={styles.guideSection}>
            <h2>¿Por qué las flores tienen colores?</h2>
            <p>
              Los colores de las flores no son casuales: son señales publicitarias dirigidas a los polinizadores.
              Las abejas ven mejor el azul y el ultravioleta, los colibríes prefieren el rojo, y las polillas nocturnas
              buscan flores blancas que brillan en la oscuridad. Cada color ha evolucionado para atraer a un polinizador específico.
            </p>

            <h2>¿Qué es la coevolución?</h2>
            <p>
              Las flores y sus polinizadores han evolucionado juntos durante millones de años, adaptándose mutuamente.
              La orquídea de Madagascar (<em>Angraecum sesquipedale</em>) tiene un néctar al fondo de un tubo de 30 cm.
              Darwin predijo en 1862 que debía existir una polilla con una lengua de 30 cm para alcanzarlo.
              La polilla fue descubierta 41 años después.
            </p>

            <h2>¿Por qué importa la polinización para la humanidad?</h2>
            <p>
              Alrededor del 75% de los cultivos alimentarios y el 35% de la producción agrícola global dependen
              de polinizadores. Sin ellos perderíamos la mayoría de frutas, verduras, frutos secos, café y cacao.
              El declive de las abejas por pesticidas y pérdida de hábitat es una amenaza directa a la seguridad alimentaria.
            </p>

            <h2>Fruto verdadero vs. falso fruto</h2>
            <p>
              En botánica, un fruto verdadero se forma exclusivamente a partir del ovario maduro. Pero muchos
              &quot;frutos&quot; cotidianos incluyen otras partes: en la manzana, la parte carnosa es el receptáculo;
              en la fresa, los frutitos reales son los puntitos y lo rojo es receptáculo engrosado; en la piña,
              es una fusión de muchos frutos individuales (infrutescencia).
            </p>

            <div className={styles.warningBox}>
              <strong>Nota educativa:</strong> Este visualizador presenta conceptos generales de botánica reproductiva.
              La anatomía floral varía enormemente entre las ~400.000 especies de angiospermas. Los diagramas son
              representaciones simplificadas con fines didácticos.
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-anatomia-flor')} />
        <ShareCard appName="visualizador-anatomia-flor" />
        <Footer appName="visualizador-anatomia-flor" />
      </div>
    </>
  );
}
