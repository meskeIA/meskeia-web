'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './ArquitecturaEstilos.module.css';
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
// Tipos
// ─────────────────────────────────────────────

type Categoria = 'antigua' | 'medieval' | 'renacimiento' | 'barroco' | 'neoclasico' | 'moderno' | 'contemporaneo';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface EstiloArquitectonico {
  id: string;
  nombre: string;
  anioInicio: number;
  anioFin: number; // 9999 = presente
  categoria: Categoria;
  arquitectos: string[];
  caracteristicas: string[];
  edificioIconico: string;
  materiales: string[];
  contexto: string;
  color: string;
}

interface EventoHistorico {
  anio: number;
  evento: string;
}

// ─────────────────────────────────────────────
// Helper: formatear años con a.C.
// ─────────────────────────────────────────────

function formatAnio(anio: number): string {
  return anio < 0 ? `${Math.abs(anio)} a.C.` : String(anio);
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const ESTILOS: EstiloArquitectonico[] = [
  {
    id: 'griego', nombre: 'Arquitectura Griega Clásica', anioInicio: -700, anioFin: -100,
    categoria: 'antigua',
    arquitectos: ['Ictinos', 'Calícrates', 'Fidias', 'Mnésicles'],
    caracteristicas: ['Órdenes dórico, jónico y corintio', 'Columnas como elemento estructural y estético', 'Frontón triangular con esculturas', 'Proporción matemática y armonía', 'Planta rectangular en templos'],
    edificioIconico: 'El Partenón, Atenas (447–432 a.C.)',
    materiales: ['Mármol del Pentélico', 'Piedra caliza', 'Bronce (elementos decorativos)'],
    contexto: 'La arquitectura griega clásica desarrolló los tres órdenes que definirían el lenguaje arquitectónico occidental durante 2500 años. El Partenón, dedicado a Atenea, alcanzó una perfección geométrica que incluye correcciones ópticas para parecer recto a la vista humana.',
    color: '#DAA520',
  },
  {
    id: 'romano', nombre: 'Arquitectura Romana', anioInicio: -500, anioFin: 400,
    categoria: 'antigua',
    arquitectos: ['Vitruvio', 'Apolodoro de Damasco', 'Rabirio'],
    caracteristicas: ['Arco de medio punto y bóveda de cañón', 'Hormigón romano (opus caementicium)', 'Cúpula semiesférica', 'Ingeniería hidráulica: acueductos', 'Planta centralizada y basílica'],
    edificioIconico: 'El Panteón de Roma (126 d.C.)',
    materiales: ['Hormigón volcánico (pozzolana)', 'Ladrillo cocido', 'Mármol en revestimientos', 'Bronce'],
    contexto: 'Roma tomó los órdenes griegos y los combinó con una ingeniería sin precedentes. El arco y el hormigón permitieron crear estructuras imposibles en piedra: el Panteón mantuvo la cúpula más grande del mundo durante 1300 años.',
    color: '#8B4513',
  },
  {
    id: 'bizantino', nombre: 'Paleocristiana y Bizantina', anioInicio: 300, anioFin: 1000,
    categoria: 'medieval',
    arquitectos: ['Isidoro de Mileto', 'Antemio de Tralles', 'anónimos (basílicas paleocristianas)'],
    caracteristicas: ['Basílica como espacio longitudinal de asamblea', 'Cúpula sobre pechinas (transición cuadrado-círculo)', 'Mosaicos dorados en interiores', 'Planta centralizada griega', 'Luz como elemento espiritual'],
    edificioIconico: 'Santa Sofía, Estambul (532–537 d.C.)',
    materiales: ['Ladrillo delgado', 'Mosaico de teselas de oro y vidrio', 'Mármol importado', 'Mortero ligero'],
    contexto: 'El Imperio Romano de Oriente creó una arquitectura que fusionó la ingeniería romana con la espiritualidad cristiana oriental. Santa Sofía desafió durante mil años las leyes de la física: su cúpula parece flotar sobre luz.',
    color: '#9370DB',
  },
  {
    id: 'romanico', nombre: 'Románico', anioInicio: 1000, anioFin: 1150,
    categoria: 'medieval',
    arquitectos: ['anónimos (maestros canteros)', 'Bernward de Hildesheim', 'Lanfranco de Módena'],
    caracteristicas: ['Arco de medio punto', 'Muros masivos con pocas ventanas', 'Torres macizas', 'Escultura integrada en portadas', 'Planta de cruz latina'],
    edificioIconico: 'Catedral de Santiago de Compostela (1075–1128)',
    materiales: ['Sillería de piedra', 'Madera (techumbres)', 'Pinturas murales al fresco'],
    contexto: 'El románico fue el primer estilo arquitectónico europeo unificado, propagado por las rutas de peregrinación. La Ruta Jacobea conectó Cluny, Toulouse, Pamplona y Compostela con una cadena de iglesias de similar vocabulario.',
    color: '#6B4226',
  },
  {
    id: 'gotico', nombre: 'Gótico', anioInicio: 1140, anioFin: 1500,
    categoria: 'medieval',
    arquitectos: ['Suger de Saint-Denis', 'Pierre de Montreuil', 'Villard de Honnecourt', 'Enrique de Borgoña'],
    caracteristicas: ['Arco apuntado u ojival', 'Arbotante (contrarresto externo)', 'Rosetón de vidrieras de colores', 'Verticalidad extrema hacia Dios', 'Esqueleto estructural visible'],
    edificioIconico: 'Catedral de Notre-Dame de París (1163–1345)',
    materiales: ['Piedra caliza de Lutetia', 'Vidrio emplomado de colores', 'Hierro en varillas de tensión', 'Plomo'],
    contexto: 'El abad Suger de Saint-Denis quería que la iglesia fuera luz materializada. El gótico resolvió el problema estructural del románico: trasladando los empujes al exterior con arbotantes, pudo abrir inmensos ventanales. La oscuridad medieval se llenó de color.',
    color: '#556B2F',
  },
  {
    id: 'renacimiento', nombre: 'Renacimiento', anioInicio: 1420, anioFin: 1600,
    categoria: 'renacimiento',
    arquitectos: ['Filippo Brunelleschi', 'Leon Battista Alberti', 'Donato Bramante', 'Rafael Sanzio', 'Michelangelo Buonarroti'],
    caracteristicas: ['Perspectiva lineal como herramienta de proyecto', 'Proporción y número áureo', 'Recuperación de órdenes clásicos', 'Cúpula como elemento de cúspide', 'Villa y palazzo como tipos nuevos'],
    edificioIconico: 'Cúpula de Santa María del Fiore, Florencia (1436)',
    materiales: ['Ladrillo (espina pesce en la cúpula de Brunelleschi)', 'Mármol blanco', 'Pietra serena (piedra gris florentina)'],
    contexto: 'Brunelleschi levantó sin cimbra la mayor cúpula de ladrillo jamás construida. El Renacimiento arquitectónico recuperó la Antigüedad no para imitarla sino para superarla: nuevos tipos como el palazzo y la villa no tenían equivalente romano.',
    color: '#D4A017',
  },
  {
    id: 'barroco', nombre: 'Barroco', anioInicio: 1600, anioFin: 1750,
    categoria: 'barroco',
    arquitectos: ['Gian Lorenzo Bernini', 'Francesco Borromini', 'Guarino Guarini', 'Jules Hardouin-Mansart', 'Churriguera (España)'],
    caracteristicas: ['Movimiento y dinamismo de formas', 'Ornamentación exuberante', 'Luz dramática (tenebrismo arquitectónico)', 'Escenografía urbana: plazas y perspectivas', 'Fusión de arquitectura, escultura y pintura'],
    edificioIconico: 'Plaza de San Pedro y Columnata, Roma (1656–1667)',
    materiales: ['Travertino romano', 'Estuco y dorado', 'Bronce', 'Mármoles polícromos'],
    contexto: 'La Contrarreforma necesitaba un arte que impresionara y convenciera. Bernini creó la mayor escenografía urbana del mundo en la Plaza de San Pedro. Borromini llevó la geometría al límite de lo posible con superficies cóncavas y convexas que desafiaban la razón.',
    color: '#CD853F',
  },
  {
    id: 'neoclasico', nombre: 'Neoclásico', anioInicio: 1750, anioFin: 1850,
    categoria: 'neoclasico',
    arquitectos: ['Jacques-Germain Soufflot', 'Karl Friedrich Schinkel', 'John Nash', 'Thomas Jefferson', 'Claude Nicolas Ledoux'],
    caracteristicas: ['Sobriedad y racionalidad frente al barroco', 'Columnas porticadas como fachada cívica', 'Planta centralizada o basilical depurada', 'Arqueología como fuente (Herculano, Pompeya)', 'Arquitectura como discurso político'],
    edificioIconico: 'Panteón de París / Santa Genoveva (1790)',
    materiales: ['Piedra caliza', 'Mármol', 'Hierro fundido (primeras vigas)'],
    contexto: 'El descubrimiento de Pompeya y Herculano (1748) desencadenó la fiebre por la Antigüedad. La Revolución Francesa convirtió el neoclásico en estilo oficial: la república necesitaba la gravedad moral de Roma. Jefferson exportó el modelo al Nuevo Mundo.',
    color: '#4682B4',
  },
  {
    id: 'historicismo', nombre: 'Historicismo y Eclecticismo', anioInicio: 1820, anioFin: 1900,
    categoria: 'neoclasico',
    arquitectos: ['Eugène Viollet-le-Duc', 'Theophil Hansen', 'Charles Garnier', 'George Gilbert Scott'],
    caracteristicas: ['Revivalismo de estilos históricos', 'Neogótico, neobarroco, neorrománico', 'Hierro visto en grandes naves', 'Mezcla libre de estilos (eclecticismo)', 'Ornamentación industrial'],
    edificioIconico: 'Ópera Garnier, París (1875)',
    materiales: ['Piedra, ladrillo, hierro fundido', 'Vidrio en estructuras industriales', 'Cerámica decorativa esmaltada'],
    contexto: 'La industrialización creó nuevos tipos sin precedente histórico (estación de tren, mercado cubierto) y los arquitectos los vistieron con ropajes del pasado. El Palacio de Westminster neogótico convirtió el Parlamento británico en el templo de la democracia medieval.',
    color: '#708090',
  },
  {
    id: 'art-nouveau', nombre: 'Art Nouveau / Modernismo', anioInicio: 1890, anioFin: 1914,
    categoria: 'moderno',
    arquitectos: ['Antoni Gaudí', 'Victor Horta', 'Hector Guimard', 'Otto Wagner', 'Charles Rennie Mackintosh'],
    caracteristicas: ['Líneas orgánicas inspiradas en la naturaleza', 'Hierro forjado visible y decorativo', 'Integración de todas las artes decorativas', 'Rechazo de la imitación histórica', 'Artesanía industrial'],
    edificioIconico: 'La Sagrada Família, Barcelona (1882–presente)',
    materiales: ['Hierro forjado', 'Vidrio de colores', 'Cerámica trencadís', 'Piedra natural', 'Madera tallada'],
    contexto: 'El Art Nouveau fue la primera propuesta de ruptura total con el historicismo. Gaudí encontró en la naturaleza la geometría que otros buscaban en Roma. Sus hiperbólicos paraboloides y catenarias no eran capricho: eran matemática pura aplicada a la piedra.',
    color: '#3CB371',
  },
  {
    id: 'racionalismo', nombre: 'Racionalismo y Bauhaus', anioInicio: 1919, anioFin: 1940,
    categoria: 'moderno',
    arquitectos: ['Walter Gropius', 'Ludwig Mies van der Rohe', 'Le Corbusier', 'Marcel Breuer', 'Hannes Meyer'],
    caracteristicas: ['Forma sigue a la función', 'Planta libre y fachada libre', 'Pilotis (pilares que liberan la planta baja)', 'Ventana corrida horizontal', 'Cubierta plana como terraza'],
    edificioIconico: 'Pabellón Alemán, Barcelona (Mies van der Rohe, 1929)',
    materiales: ['Hormigón armado', 'Acero laminado', 'Vidrio en grandes superficies', 'Mármol travertino (Mies)'],
    contexto: 'La Bauhaus fundada por Gropius en 1919 fue la más influyente escuela de diseño del siglo XX. Le Corbusier formuló los Cinco Puntos de la Nueva Arquitectura. El nazismo clausuró la Bauhaus y dispersó a sus maestros por todo el mundo, globalizando el estilo.',
    color: '#2E86AB',
  },
  {
    id: 'movimiento-moderno', nombre: 'Movimiento Moderno / Funcionalismo', anioInicio: 1930, anioFin: 1970,
    categoria: 'moderno',
    arquitectos: ['Le Corbusier', 'Frank Lloyd Wright', 'Alvar Aalto', 'Oscar Niemeyer', 'Eero Saarinen'],
    caracteristicas: ['Universalismo: un estilo para el mundo entero', 'Espacio fluido y continuo', 'Honestidad material', 'Prefabricación y serialización', 'Utopía social: vivienda para todos'],
    edificioIconico: "Unité d'Habitation, Marsella (Le Corbusier, 1952)",
    materiales: ['Hormigón visto (béton brut)', 'Acero', 'Vidrio', 'Madera laminada (Aalto)'],
    contexto: 'El Movimiento Moderno creyó que la arquitectura podía transformar la sociedad. Niemeyer y Costa construyeron Brasilia de la nada. Frank Lloyd Wright inventó la arquitectura orgánica en las praderas americanas. La reconstrucción de Europa posguerra adoptó el funcionalismo como lenguaje universal.',
    color: '#1E3A5F',
  },
  {
    id: 'brutalismo', nombre: 'Brutalismo', anioInicio: 1950, anioFin: 1980,
    categoria: 'moderno',
    arquitectos: ['Paul Rudolph', 'Denys Lasdun', 'Marcel Breuer', 'Alison y Peter Smithson', 'Tadao Ando'],
    caracteristicas: ['Hormigón visto sin revestir (béton brut)', 'Formas masivas y escultóricas', 'Monumentalidad pública', 'Utopía social visible en la materia', 'Estructura como ornamento'],
    edificioIconico: 'Barbican Centre, Londres (1969–1982)',
    materiales: ['Hormigón armado visto', 'Ladrillo sin revestir', 'Acero expuesto'],
    contexto: 'El término viene del francés béton brut (hormigón en bruto), no de "brutalidad". El brutalismo fue la arquitectura de los estados del bienestar: universidades, hospitales, vivienda pública. Hoy genera división: ¿honestidad material o egos monumentales?',
    color: '#696969',
  },
  {
    id: 'posmodernismo', nombre: 'Posmodernismo', anioInicio: 1966, anioFin: 1990,
    categoria: 'contemporaneo',
    arquitectos: ['Robert Venturi', 'Philip Johnson', 'Charles Moore', 'Michael Graves', 'Ricardo Bofill'],
    caracteristicas: ['Eclecticismo irónico y humor', 'Decoración y referencia histórica', 'Comunicación con el público no especialista', 'Pastiche y collage de estilos', 'Rechazo del dogmatismo moderno'],
    edificioIconico: 'AT&T Building (hoy 550 Madison Avenue), Nueva York (1984)',
    materiales: ['Granito rosa', 'Acero', 'Vidrio', 'Ornamentos en fibra de vidrio'],
    contexto: 'Robert Venturi declaró: "menos es aburrido" (parodiando el "menos es más" de Mies). El posmodernismo devolvió el ornamento, el color y el humor a una arquitectura que se había vuelto solemne y hermética. El Chipperdale roto del AT&T Building escandalizó a los críticos.',
    color: '#FF6347',
  },
  {
    id: 'high-tech', nombre: 'High-Tech y Deconstructivismo', anioInicio: 1971, anioFin: 2000,
    categoria: 'contemporaneo',
    arquitectos: ['Richard Rogers', 'Renzo Piano', 'Norman Foster', 'Frank Gehry', 'Zaha Hadid', 'Daniel Libeskind'],
    caracteristicas: ['Estructura e instalaciones visibles al exterior', 'Nuevos materiales: titanio, ETFE, acero inoxidable', 'Formas deconstructidas y no euclidianas', 'Espectáculo visual como programa', 'Computación en el diseño'],
    edificioIconico: 'Museo Guggenheim, Bilbao (Frank Gehry, 1997)',
    materiales: ['Titanio', 'Vidrio curvo', 'Acero inoxidable', 'Aluminio de alta resistencia'],
    contexto: 'El Centro Pompidou (Rogers y Piano, 1977) expuso todas sus vísceras al exterior convirtiéndose en icono. Gehry y el titanio del Guggenheim de Bilbao demostraron que la arquitectura espectacular podía regenerar una ciudad entera: el "efecto Bilbao".',
    color: '#17A2B8',
  },
  {
    id: 'sostenible', nombre: 'Arquitectura Sostenible y Paramétrica', anioInicio: 1990, anioFin: 9999,
    categoria: 'contemporaneo',
    arquitectos: ['Ken Yeang', 'Norman Foster', 'Bjarke Ingels (BIG)', 'Kengo Kuma', 'Vo Trong Nghia'],
    caracteristicas: ['Eficiencia energética como requisito', 'Diseño bioclimático y pasivo', 'Algoritmos paramétricos de forma', 'Certificaciones LEED y BREEAM', 'Integración de naturaleza en el edificio'],
    edificioIconico: 'The Edge, Ámsterdam (PLP Architecture, 2015)',
    materiales: ['Vidrio solar selectivo', 'Madera de ingeniería (CLT)', 'Paneles fotovoltaicos integrados', 'Materiales reciclados y reciclables'],
    contexto: 'El cambio climático convirtió la sostenibilidad en imperativo. La parametrización computacional (software como Grasshopper y Rhino) permite generar formas que optimizan la captura solar, la ventilación y el uso de material. La arquitectura del siglo XXI negocia entre el planeta y la ciudad.',
    color: '#27AE60',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: -447, evento: 'Construcción del Partenón: la arquitectura griega alcanza su cénit' },
  { anio: 537, evento: 'Inauguración de Santa Sofía: mayor cúpula del mundo durante casi un milenio' },
  { anio: 1163, evento: 'Inicio de Notre-Dame de París: nace el gótico pleno' },
  { anio: 1436, evento: 'Brunelleschi completa la cúpula de Florencia sin cimbra: revolución técnica' },
  { anio: 1748, evento: 'Descubrimiento de Pompeya: el mundo clásico surge de las cenizas' },
  { anio: 1851, evento: 'Crystal Palace, Londres: el hierro y el vidrio inauguran la arquitectura industrial' },
  { anio: 1919, evento: 'Fundación de la Bauhaus: diseño y arquitectura se unen por primera vez' },
  { anio: 1945, evento: 'Posguerra: reconstrucción masiva de Europa adopta el Movimiento Moderno' },
  { anio: 1997, evento: 'Museo Guggenheim de Bilbao: el "efecto Bilbao" demuestra el poder urbano de la arquitectura' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  antigua: 'Antigua',
  medieval: 'Medieval',
  renacimiento: 'Renacimiento',
  barroco: 'Barroco',
  neoclasico: 'Neoclásico',
  moderno: 'Moderno',
  contemporaneo: 'Contemporáneo',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  antigua: '#DAA520',
  medieval: '#556B2F',
  renacimiento: '#D4A017',
  barroco: '#CD853F',
  neoclasico: '#4682B4',
  moderno: '#2E86AB',
  contemporaneo: '#27AE60',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

// Panel de detalle reutilizable
function PanelDetalle({ estilo }: { estilo: EstiloArquitectonico }) {
  const anioFinTexto = estilo.anioFin === 9999 ? 'actualidad' : formatAnio(estilo.anioFin);
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: estilo.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: estilo.color }}>{estilo.nombre}</h3>
      <p className={styles.detallePeriodo}>{formatAnio(estilo.anioInicio)} – {anioFinTexto}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[estilo.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Características</h4>
          <ul className={styles.caracteristicasList}>
            {estilo.caracteristicas.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Arquitectos clave</h4>
          <ul className={styles.artistasList}>
            {estilo.arquitectos.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.materialesBadges}>
        <span className={styles.obraIconicaLabel}>Materiales</span>
        <div className={styles.badgesRow}>
          {estilo.materiales.map((m) => (
            <span key={m} className={styles.materialBadge}>{m}</span>
          ))}
        </div>
      </div>

      <div className={styles.obraIconica}>
        <span className={styles.obraIconicaLabel}>Edificio icónico</span>
        <p>{estilo.edificioIconico}</p>
      </div>

      <div className={styles.contextoBox}>
        <span className={styles.contextoLabel}>Contexto histórico</span>
        <p>{estilo.contexto}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

const AÑO_MIN = -700;
const AÑO_MAX = 2024;
const SVG_ANCHO = 1400;
const MARGEN_IZQ = 60;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<EstiloArquitectonico | null>(null);

  // Distribuir estilos en filas para evitar solapamiento
  const filas: EstiloArquitectonico[][] = [[], [], [], []];
  const ordenados = [...ESTILOS].sort((a, b) => a.anioInicio - b.anioInicio);

  for (const est of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      if (!ultimoEnFila || anioAX(ultimoEnFila.anioFin === 9999 ? AÑO_MAX : ultimoEnFila.anioFin) + 4 <= anioAX(est.anioInicio)) {
        filas[f].push(est);
        filaAsignada = true;
        break;
      }
    }
    if (!filaAsignada) filas[0].push(est);
  }

  const FILA_ALTO = 36;
  const FILA_OFFSET_Y = 24;
  const svgAlto = FILA_OFFSET_Y + filas.length * (FILA_ALTO + 8) + 30;

  // Marcadores de siglos y períodos a.C./d.C.
  const marcadores: number[] = [];
  for (let s = -600; s <= 2000; s += 200) marcadores.push(s);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un estilo para ver sus detalles. El rango va del siglo VII a.C. hasta la actualidad.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de estilos arquitectónicos"
        >
          {/* Eje horizontal */}
          <line x1={MARGEN_IZQ} y1={svgAlto - 16} x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={1} />

          {/* Marcador de año 0 */}
          <line x1={anioAX(0)} y1={FILA_OFFSET_Y} x2={anioAX(0)} y2={svgAlto - 16} stroke="#E74C3C" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.6} />
          <text x={anioAX(0)} y={svgAlto - 4} fontSize={9} fill="#E74C3C" textAnchor="middle" opacity={0.8}>año 0</text>

          {/* Marcadores de siglos */}
          {marcadores.map((s) => (
            <g key={s}>
              <line x1={anioAX(s)} y1={FILA_OFFSET_Y} x2={anioAX(s)} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,4" />
              <text x={anioAX(s)} y={svgAlto - 4} fontSize={9} fill="var(--text-muted)" textAnchor="middle">{formatAnio(s)}</text>
            </g>
          ))}

          {/* Rectángulos de estilos */}
          {filas.map((fila, fi) =>
            fila.map((est) => {
              const anioFin = est.anioFin === 9999 ? AÑO_MAX : est.anioFin;
              const x = anioAX(est.anioInicio);
              const w = Math.max(anioAX(anioFin) - x, 10);
              const y = FILA_OFFSET_Y + fi * (FILA_ALTO + 8);
              const esSeleccionado = seleccionado?.id === est.id;

              return (
                <g key={est.id} onClick={() => setSeleccionado(esSeleccionado ? null : est)} style={{ cursor: 'pointer' }}>
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={FILA_ALTO}
                    rx={4}
                    fill={est.color}
                    opacity={esSeleccionado ? 1 : 0.8}
                    stroke={esSeleccionado ? '#fff' : 'none'}
                    strokeWidth={2}
                  />
                  {w > 60 && (
                    <text
                      x={x + w / 2}
                      y={y + FILA_ALTO / 2 + 4}
                      fontSize={9}
                      fill="#fff"
                      textAnchor="middle"
                      fontWeight={600}
                      style={{ pointerEvents: 'none' }}
                    >
                      {est.nombre}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>

      {/* Leyenda */}
      <div className={styles.leyendaCategorias}>
        {(Object.keys(ETIQUETAS_CATEGORIA) as Categoria[]).map((cat) => (
          <span key={cat} className={styles.leyendaItem}>
            <span className={styles.leyendaColor} style={{ background: COLORES_CATEGORIA[cat] }} aria-hidden="true" />
            {ETIQUETAS_CATEGORIA[cat]}
          </span>
        ))}
      </div>

      {/* Panel de detalle al hacer clic */}
      {seleccionado && (
        <PanelDetalle estilo={seleccionado} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Estilo en Detalle
// ─────────────────────────────────────────────

function TabDetalle() {
  const [indice, setIndice] = useState(0);
  const estilo = ESTILOS[indice];
  const anioFinTexto = estilo.anioFin === 9999 ? 'actualidad' : formatAnio(estilo.anioFin);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Estilo en Detalle</h2>

      <div className={styles.movimientoSelector}>
        {ESTILOS.map((est, i) => (
          <button
            key={est.id}
            className={`${styles.movimientoBtn} ${i === indice ? styles.movimientoBtnActivo : ''}`}
            onClick={() => setIndice(i)}
            style={i === indice ? { background: est.color, borderColor: est.color } : {}}
          >
            {est.nombre}
          </button>
        ))}
      </div>

      <div className={styles.detalleTarjeta} style={{ borderTopColor: estilo.color }}>
        <div className={styles.detalleTarjetaHeader} style={{ background: estilo.color }}>
          <h3>{estilo.nombre}</h3>
          <p>{formatAnio(estilo.anioInicio)} – {anioFinTexto}</p>
          <span>{ETIQUETAS_CATEGORIA[estilo.categoria]}</span>
        </div>

        <div className={styles.detalleTarjetaBody}>
          <div className={styles.detalleGrid}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Características principales</h4>
              <ul className={styles.caracteristicasList}>
                {estilo.caracteristicas.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
            <div>
              <h4 className={styles.detalleSubtitulo}>Arquitectos clave</h4>
              <ul className={styles.artistasList}>
                {estilo.arquitectos.map((a) => <li key={a}>{a}</li>)}
              </ul>
            </div>
          </div>

          <div className={styles.materialesBadges}>
            <span className={styles.obraIconicaLabel}>Materiales</span>
            <div className={styles.badgesRow}>
              {estilo.materiales.map((m) => (
                <span key={m} className={styles.materialBadge}>{m}</span>
              ))}
            </div>
          </div>

          <div className={styles.obraIconica}>
            <span className={styles.obraIconicaLabel}>Edificio icónico</span>
            <p>{estilo.edificioIconico}</p>
          </div>

          <div className={styles.contextoBox}>
            <span className={styles.contextoLabel}>Contexto histórico</span>
            <p>{estilo.contexto}</p>
          </div>
        </div>
      </div>

      <div className={styles.navBtns}>
        <button
          className={styles.btnAnterior}
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
          disabled={indice === 0}
          aria-label="Estilo anterior"
        >
          ← Anterior
        </button>
        <span className={styles.navCounter}>{indice + 1} / {ESTILOS.length}</span>
        <button
          className={styles.btnSiguiente}
          onClick={() => setIndice((i) => Math.min(ESTILOS.length - 1, i + 1))}
          disabled={indice === ESTILOS.length - 1}
          aria-label="Estilo siguiente"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 3: Comparativa
// ─────────────────────────────────────────────

function TabComparativa() {
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');

  const estilosFiltrados = useMemo(() => {
    return ESTILOS.filter((est) => {
      const coincideCategoria = categoriaFiltro === 'todos' || est.categoria === categoriaFiltro;
      const termino = busqueda.toLowerCase();
      const coincideBusqueda = !termino ||
        est.nombre.toLowerCase().includes(termino) ||
        est.arquitectos.some((a) => a.toLowerCase().includes(termino));
      return coincideCategoria && coincideBusqueda;
    });
  }, [categoriaFiltro, busqueda]);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Comparativa</h2>

      <div className={styles.filtroCategoria}>
        <button
          className={`${styles.filtroCatBtn} ${categoriaFiltro === 'todos' ? styles.filtroCatBtnActivo : ''}`}
          onClick={() => setCategoriaFiltro('todos')}
        >
          Todos
        </button>
        {(Object.keys(ETIQUETAS_CATEGORIA) as Categoria[]).map((cat) => (
          <button
            key={cat}
            className={`${styles.filtroCatBtn} ${categoriaFiltro === cat ? styles.filtroCatBtnActivo : ''}`}
            onClick={() => setCategoriaFiltro(cat)}
            style={categoriaFiltro === cat ? { background: COLORES_CATEGORIA[cat], borderColor: COLORES_CATEGORIA[cat] } : {}}
          >
            {ETIQUETAS_CATEGORIA[cat]}
          </button>
        ))}
      </div>

      <input
        type="search"
        className={styles.buscadorInput}
        placeholder="Buscar por estilo o arquitecto..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar estilo arquitectónico"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Estilo</th>
              <th>Período</th>
              <th>Categoría</th>
              <th>Arquitecto clave</th>
              <th>Edificio icónico</th>
            </tr>
          </thead>
          <tbody>
            {estilosFiltrados.map((est, i) => {
              const anioFinTexto = est.anioFin === 9999 ? 'actualidad' : formatAnio(est.anioFin);
              return (
                <tr
                  key={est.id}
                  style={i % 2 === 0 ? { background: `${est.color}18` } : {}}
                >
                  <td><strong style={{ color: est.color }}>{est.nombre}</strong></td>
                  <td>{formatAnio(est.anioInicio)}–{anioFinTexto}</td>
                  <td>
                    <span className={styles.badgeCategoria} style={{ background: `${COLORES_CATEGORIA[est.categoria]}22`, color: COLORES_CATEGORIA[est.categoria] }}>
                      {ETIQUETAS_CATEGORIA[est.categoria]}
                    </span>
                  </td>
                  <td>{est.arquitectos[0]}</td>
                  <td>{est.edificioIconico}</td>
                </tr>
              );
            })}
            {estilosFiltrados.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.sinResultados}>Sin resultados para la búsqueda actual.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 4: Contexto Histórico — vista por eras
// ─────────────────────────────────────────────

interface Era {
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
}

const ERAS: Era[] = [
  { nombre: 'Arquitectura Antigua', desde: -700, hasta: 300, icono: '🏛️' },
  { nombre: 'Edad Media', desde: 300, hasta: 1420, icono: '⛪' },
  { nombre: 'Renacimiento y Barroco', desde: 1420, hasta: 1750, icono: '🏰' },
  { nombre: 'Clasicismo e Industrialización', desde: 1750, hasta: 1890, icono: '🏭' },
  { nombre: 'Modernidad — siglo XX', desde: 1890, hasta: 1970, icono: '🔧' },
  { nombre: 'Arquitectura Contemporánea', desde: 1970, hasta: 9999, icono: '🌿' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Estilos arquitectónicos y eventos históricos organizados por eras.
      </p>

      <div className={styles.erasGrid}>
        {ERAS.map((era) => {
          const estilosEra = ESTILOS.filter(
            (e) => e.anioInicio < era.hasta && (e.anioFin === 9999 || e.anioFin > era.desde)
          );
          const eventosEra = EVENTOS_HISTORICOS.filter(
            (ev) => ev.anio >= era.desde && (era.hasta === 9999 ? true : ev.anio < era.hasta)
          );

          return (
            <div key={era.nombre} className={styles.eraCard}>
              <div className={styles.eraHeader}>
                <span className={styles.eraIcono} aria-hidden="true">{era.icono}</span>
                <div>
                  <h3 className={styles.eraNombre}>{era.nombre}</h3>
                  <span className={styles.eraRango}>
                    {formatAnio(era.desde)} – {era.hasta === 9999 ? 'hoy' : formatAnio(era.hasta)}
                  </span>
                </div>
              </div>

              {estilosEra.length > 0 && (
                <div className={styles.eraEstilos}>
                  {estilosEra.map((e) => (
                    <span
                      key={e.id}
                      className={styles.eraEstiloBadge}
                      style={{ background: `${e.color}1A`, color: e.color, borderColor: `${e.color}55` }}
                    >
                      {e.nombre}
                    </span>
                  ))}
                </div>
              )}

              {eventosEra.length > 0 && (
                <ul className={styles.eraEventos}>
                  {eventosEra.map((ev) => (
                    <li key={ev.anio} className={styles.eraEvento}>
                      <span className={styles.eraEventoAnio}>{formatAnio(ev.anio)}</span>
                      <span className={styles.eraEventoTexto}>{ev.evento}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorArquitecturaEstilos() {
  const [tabActiva, setTabActiva] = useState<TabActiva>('timeline');

  const tabs: { id: TabActiva; label: string }[] = [
    { id: 'timeline', label: 'Línea del Tiempo' },
    { id: 'detalle', label: 'Estilo en Detalle' },
    { id: 'comparativa', label: 'Comparativa' },
    { id: 'contexto', label: 'Contexto Histórico' },
  ];

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Estilos Arquitectónicos</h1>
        <p className={styles.heroSubtitle}>
          Del Partenón a la arquitectura sostenible — cronología, edificios icónicos y contexto histórico de 16 estilos que construyeron el mundo occidental
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <nav className={styles.tabNav} role="tablist" aria-label="Secciones del visualizador">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={tabActiva === tab.id}
              className={`${styles.tabBtn} ${tabActiva === tab.id ? styles.tabBtnActivo : ''}`}
              onClick={() => setTabActiva(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.tabContent} role="tabpanel">
          {tabActiva === 'timeline' && <TabTimeline />}
          {tabActiva === 'detalle' && <TabDetalle />}
          {tabActiva === 'comparativa' && <TabComparativa />}
          {tabActiva === 'contexto' && <TabContexto />}
        </div>
      </main>

      <EducationalSection
        title="Estilos arquitectónicos: historia y contexto"
        subtitle="Cómo los edificios reflejan su época y transforman las ciudades"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 estilos clave</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Estilo</th>
                <th>Período</th>
                <th>Elemento clave</th>
                <th>Arquitecto referente</th>
                <th>Edificio icónico</th>
                <th>Contexto</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Griego Clásico</strong></td>
                <td>700–100 a.C.</td>
                <td>Órdenes columnares</td>
                <td>Ictinos</td>
                <td>El Partenón</td>
                <td>Democracia ateniense</td>
              </tr>
              <tr>
                <td><strong>Gótico</strong></td>
                <td>1140–1500</td>
                <td>Arco ojival + arbotante</td>
                <td>Suger de Saint-Denis</td>
                <td>Notre-Dame de París</td>
                <td>Fe cristiana medieval</td>
              </tr>
              <tr>
                <td><strong>Renacimiento</strong></td>
                <td>1420–1600</td>
                <td>Cúpula + perspectiva</td>
                <td>Brunelleschi</td>
                <td>Cúpula de Florencia</td>
                <td>Humanismo y mecenazgo</td>
              </tr>
              <tr>
                <td><strong>Bauhaus</strong></td>
                <td>1919–1940</td>
                <td>Planta libre + función</td>
                <td>Walter Gropius</td>
                <td>Edificio Bauhaus, Dessau</td>
                <td>República de Weimar</td>
              </tr>
              <tr>
                <td><strong>Brutalismo</strong></td>
                <td>1950–1980</td>
                <td>Hormigón visto masivo</td>
                <td>Le Corbusier</td>
                <td>Barbican Centre</td>
                <td>Estado del bienestar</td>
              </tr>
              <tr>
                <td><strong>Sostenible</strong></td>
                <td>1990–hoy</td>
                <td>Eficiencia + naturaleza</td>
                <td>Bjarke Ingels</td>
                <td>The Edge, Ámsterdam</td>
                <td>Crisis climática</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Casos de Uso */}
        <h3>¿Para quién es útil este visualizador?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
            <div>
              <strong>Estudiante de Historia del Arte o Arquitectura</strong>
              <p>Prepara el examen identificando los rasgos formales de cada estilo, sus materiales y el contexto histórico que los generó.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏛️</span>
            <div>
              <strong>Turista que va a Bilbao, Roma o Barcelona</strong>
              <p>Consulta el estilo de los edificios que vas a visitar antes del viaje para entender qué estás mirando y por qué importa.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📐</span>
            <div>
              <strong>Arquitecto junior que busca contexto</strong>
              <p>Repasa la genealogía de los estilos modernos para entender por qué Le Corbusier reaccionó contra el Art Nouveau y el Movimiento Moderno contra el Historicismo.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎮</span>
            <div>
              <strong>Aficionado al Minecraft o a los videojuegos de construcción</strong>
              <p>Encuentra referencias históricas precisas para recrear un castillo románico, una villa renacentista o un edificio Art Nouveau con rigor estético.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Por qué el Partenón parece perfectamente recto si tiene curvas en todas sus líneas?</strong>
            <p>Las curvas son intencionales: correcciones ópticas. Las columnas se inclinan ligeramente hacia el centro, las líneas del estilobato son convexas y el espaciado de las columnas varía. Sin estos ajustes, el ojo humano percibiría las líneas rectas como curvas o caídas. Los griegos diseñaron el edificio para ser percibido, no solo medido.</p>
            <span className={styles.faqTip}>Las correcciones ópticas del Partenón fueron redescubiertas en el siglo XIX por el arqueólogo Francis Penrose.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué diferencia la arquitectura gótica de la románica si ambas son religiosas medievales?</strong>
            <p>La diferencia es estructural y lumínica. El románico tiene muros gruesos que soportan el peso directamente: poca luz, sensación de fortaleza. El gótico transfiere los empujes al exterior con arbotantes, libera el muro y lo puede llenar de vidrieras. El resultado es opuesto: luz, verticalidad, diafanidad. La misma fe, dos ingeniería y dos experiencias espirituales.</p>
            <span className={styles.faqTip}>Visita Santiago de Compostela (románico) y Burgos (gótico) para sentir la diferencia en directo.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿El Movimiento Moderno fracasó con las ciudades dormitorio?</strong>
            <p>Parcialmente. El ideario era utópico: sol, verde, espacio para todos. El problema fue la escala, la falta de mezcla de usos y la ausencia de gestión post-construcción. Los proyectos bien mantenidos (Unité d'Habitation, Barbican) siguen funcionando. Los bloques de vivienda masiva mal gestionados se convirtieron en guetos. El fracaso fue político y económico más que arquitectónico.</p>
            <span className={styles.faqTip}>El Barbican Centre de Londres (brutalismo) tiene lista de espera para sus apartamentos: el contexto económico importa tanto como el diseño.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué la Sagrada Família lleva más de 140 años en construcción?</strong>
            <p>Gaudí murió en 1926 con solo la cripta y la fachada del Nacimiento terminadas. Sus planos originales se destruyeron en parte durante la Guerra Civil (1936). La obra continúa desde la interpretación de sus maquetas y los estudios de sus colaboradores. La geometría de Gaudí (paraboloides hiperbólicos, catenarias) requiere tecnología de cálculo que no existía en su época.</p>
            <span className={styles.faqTip}>Se prevé que la Sagrada Família esté terminada antes de 2030, según el equipo de arquitectos que la gestiona.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuál es la diferencia entre High-Tech y Deconstructivismo?</strong>
            <p>El High-Tech (Rogers, Piano, Foster) celebra la tecnología y la estructura: todo visible, preciso, ingenieril. El Deconstructivismo (Gehry, Hadid, Libeskind) fragmenta y distorsiona la forma hasta hacerla irreconocible: geometría no euclidiana, ángulos imposibles, superficies escultóricas. Comparten la época y el rechazo al posmodernismo historicista, pero sus estéticas son opuestas.</p>
            <span className={styles.faqTip}>El Centro Pompidou es High-Tech; el Guggenheim de Bilbao es Deconstructivismo. Ambos son icónicos por razones distintas.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo identificar el estilo de un edificio desconocido</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Observa los arcos y la estructura</strong>
              <p>¿Arco de medio punto (romano, románico, neoclásico), ojival (gótico), o sin arcos visibles (moderno)? La forma del arco es el primer filtro para datar un edificio religioso o público.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Analiza los materiales visibles</strong>
              <p>¿Mármol y piedra (antiguo, neoclásico), ladrillo sin revestir (románico, brutalismo), hormigón visto (moderno, brutalismo), hierro y vidrio (Art Nouveau, high-tech)? Los materiales a menudo revelan la época mejor que la forma.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Mide la ornamentación</strong>
              <p>¿Mucho ornamento (barroco, Art Nouveau, historicismo) o mínima decoración (moderno, racionalismo)? El nivel de ornamentación es un indicador poderoso: cada estilo tiene una postura explícita al respecto.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Busca la relación con el entorno urbano</strong>
              <p>¿El edificio crea plazas y perspectivas (barroco), se aísla en bloques (moderno), o dialoga con la escala humana (renacimiento, neoclásico)? La relación con la ciudad revela la filosofía del arquitecto.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Contextualiza con la fecha de construcción</strong>
              <p>Si sabes cuándo se construyó, el abanico de estilos posibles se reduce drásticamente. Un edificio de 1880 no puede ser brutalismo ni sostenible. Combina la fecha con los elementos formales para la identificación definitiva.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Mejores Prácticas */}
        <h3>Consejos para aprender historia de la arquitectura</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
            <p>Empieza por los cinco estilos fundamentales (griego, romano, gótico, renacimiento, moderno) antes de abordar los matices: son la gramática del resto.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <p>Los estilos se solapan y coexisten: el Gótico y el Románico convivieron durante siglos en distintas regiones. Las fechas son orientativas, no absolutas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🏙️</span>
            <p>Pasear por el centro histórico de cualquier ciudad europea es la mejor lección: puedes ver siglos de estilos en una sola calle si sabes qué mirar.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <p>Cada estilo es una respuesta a los problemas de su época (estructurales, espirituales, políticos, climáticos). Entender el problema hace inteligible la solución arquitectónica.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>Errores frecuentes al identificar estilos arquitectónicos</strong>
          <ul>
            <li>Confundir <strong>Romanticismo</strong> (estilo pictórico del siglo XIX) con <strong>Románico</strong> (estilo arquitectónico del siglo XI–XII): no tienen ninguna relación entre sí.</li>
            <li>Llamar <strong>Gótico</strong> a todo lo que tiene forma puntiaguda: el neogótico victoriano (siglo XIX) imita el gótico medieval pero no es el mismo estilo ni la misma época.</li>
            <li>Identificar como <strong>Bauhaus</strong> cualquier edificio moderno con ventanas grandes: Bauhaus fue una escuela específica (1919–1933), no un término genérico para la arquitectura moderna.</li>
            <li>Asumir que <strong>Brutalismo</strong> significa brutalidad o fealdad: el término viene del francés béton brut (hormigón en bruto). Muchos edificios brutalistas son considerados obras maestras.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-arquitectura-estilos')} />
      <ShareCard appName="visualizador-arquitectura-estilos" />
      <Footer appName="visualizador-arquitectura-estilos" />
    </div>
  );
}
