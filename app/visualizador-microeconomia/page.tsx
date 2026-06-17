'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorMicroeconomia.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos y datos de los 6 conceptos
// ─────────────────────────────────────────────

type ConceptoId =
  | 'escasez'
  | 'oferta-demanda'
  | 'elasticidad'
  | 'costes'
  | 'estructuras'
  | 'fallos';

interface Concepto {
  id: ConceptoId;
  num: number;
  icono: string;
  titulo: string;
  subtitulo: string;
  ideaCentral: string;
  comoFunciona: string;
  ejemploCotidiano: string;
  ejemploActual: string;
  paraLlevar: string;
  enlace?: { texto: string; url: string };
}

const CONCEPTOS: Concepto[] = [
  {
    id: 'escasez',
    num: 1,
    icono: '⚖️',
    titulo: 'Escasez y coste de oportunidad',
    subtitulo: 'El problema económico de fondo',
    ideaCentral:
      'Los recursos (tiempo, dinero, materias primas) son limitados, pero los deseos no. Por eso siempre hay que elegir. Y cada elección tiene un precio oculto: aquello a lo que renuncias. Eso es el coste de oportunidad.',
    comoFunciona:
      'Toda economía se enfrenta a una frontera: con los recursos que tiene, puede producir más de una cosa solo si produce menos de otra. La curva que ves marca el máximo posible. Moverte por ella significa intercambiar un bien por otro; nunca puedes tenerlo todo a la vez.',
    ejemploCotidiano:
      'Tienes una tarde libre. Si la dedicas a estudiar, renuncias a ver a tus amigos. El coste de estudiar no es solo el esfuerzo: es la tarde con amigos que no tendrás. Ese es su coste de oportunidad real.',
    ejemploActual:
      'Un país decide cuánto de su presupuesto va a sanidad y cuánto a defensa. En 2024-2025, varios gobiernos europeos elevaron el gasto militar; cada euro extra en defensa es un euro que no va a otra partida. La frontera obliga a elegir.',
    paraLlevar:
      'No existe el «gratis»: todo lo que eliges tiene como precio lo que dejas de elegir.',
  },
  {
    id: 'oferta-demanda',
    num: 2,
    icono: '📊',
    titulo: 'Oferta y demanda',
    subtitulo: 'Cómo se forma un precio',
    ideaCentral:
      'El precio de casi todo surge del encuentro entre lo que los compradores quieren (demanda) y lo que los vendedores ofrecen (oferta). Donde ambas fuerzas se cruzan está el precio de equilibrio: el que vacía el mercado sin que sobre ni falte producto.',
    comoFunciona:
      'Si hay más compradores que producto, el precio sube hasta que algunos desisten. Si sobra producto, el precio baja hasta que aparecen compradores. El precio actúa como una señal automática que coordina a millones de personas sin que nadie las dirija.',
    ejemploCotidiano:
      'Los billetes de avión: el mismo asiento cuesta el triple en agosto que en noviembre. No cambió el avión; cambió cuánta gente quiere volar en cada fecha. La demanda mueve el precio.',
    ejemploActual:
      'El precio del alquiler en las grandes ciudades: mucha gente buscando piso (demanda alta) y pocos pisos disponibles (oferta limitada) empuja los precios al alza año tras año.',
    paraLlevar:
      'Ningún precio es «justo» o «injusto» por sí mismo: es el punto donde coinciden lo que unos piden y otros ofrecen.',
    enlace: { texto: 'Verlo en detalle: Oferta, Demanda y por qué Suben los Precios', url: '/visualizador-oferta-demanda/' },
  },
  {
    id: 'elasticidad',
    num: 3,
    icono: '🎯',
    titulo: 'Elasticidad',
    subtitulo: 'Cuánto reacciona la demanda al precio',
    ideaCentral:
      'No todos los productos reaccionan igual a una subida de precio. La elasticidad mide esa sensibilidad. Un bien es inelástico si lo seguimos comprando aunque suba mucho (lo necesitamos); es elástico si una pequeña subida hace que dejemos de comprarlo (tenemos alternativas).',
    comoFunciona:
      'Cuanto más necesario es un bien y menos sustitutos tiene, más inelástica es su demanda: el precio puede subir y la cantidad apenas cae. Cuanto más prescindible es y más alternativas tiene, más elástica: una subida pequeña hunde las ventas.',
    ejemploCotidiano:
      'Si sube el precio de la gasolina un 20 %, sigues echando casi lo mismo: necesitas ir a trabajar (inelástico). Pero si tu marca de refresco favorita sube un 20 %, te pasas a otra sin pestañear (elástico).',
    ejemploActual:
      'Las farmacéuticas pueden subir el precio de medicamentos sin perder apenas ventas (inelástico), mientras que una plataforma de streaming que sube su cuota ve cómo parte de los usuarios se dan de baja al instante (elástico).',
    paraLlevar:
      'Quien vende bienes inelásticos (energía, medicinas) tiene mucho poder sobre el precio; quien vende bienes elásticos compite a cada céntimo.',
  },
  {
    id: 'costes',
    num: 4,
    icono: '🏭',
    titulo: 'Costes y la empresa',
    subtitulo: 'Por qué producir más sale más barato',
    ideaCentral:
      'Una empresa tiene costes fijos (alquiler, maquinaria: no dependen de cuánto produzca) y costes variables (materiales, energía: crecen con la producción). Al repartir los costes fijos entre más unidades, el coste de cada unidad baja. Es la economía de escala.',
    comoFunciona:
      'El coste medio por unidad = costes fijos ÷ unidades + coste variable de cada unidad. Cuando produces poco, el coste fijo pesa enormemente sobre cada pieza. A medida que produces más, ese peso se diluye y cada unidad sale más barata… hasta que la empresa se vuelve tan grande que aparecen ineficiencias.',
    ejemploCotidiano:
      'Hornear una sola magdalena en casa sale carísimo por unidad (gastas horno, huevos, harina para una). Hornear dos docenas con casi el mismo esfuerzo abarata muchísimo cada magdalena.',
    ejemploActual:
      'Por eso un gigante del comercio electrónico puede vender más barato que la tienda de barrio: reparte sus enormes costes de almacenes y logística entre millones de pedidos, y el coste por paquete se desploma.',
    paraLlevar:
      'El tamaño abarata: las grandes empresas suelen tener un coste por unidad menor, lo que les da ventaja en precio.',
  },
  {
    id: 'estructuras',
    num: 5,
    icono: '🏪',
    titulo: 'Estructuras de mercado',
    subtitulo: 'De la competencia total al monopolio',
    ideaCentral:
      'Los mercados se ordenan según cuántas empresas compiten y cuánto poder tienen sobre el precio. En un extremo, miles de vendedores sin poder individual (competencia perfecta); en el otro, un único vendedor que fija el precio (monopolio). En medio quedan los casos más reales.',
    comoFunciona:
      'Cuantas más empresas y más parecido sea su producto, menos puede cada una subir el precio sin perder clientes. Cuantas menos empresas (o más diferenciado el producto), más capacidad de fijar precios por encima del coste. El poder de mercado es justo esa capacidad.',
    ejemploCotidiano:
      'Un mercado de frutas con veinte puestos vendiendo lo mismo: ninguno puede cobrar de más porque te vas al de al lado. Un único bar dentro de un cine: te cobra el refresco al triple porque no tienes alternativa allí dentro.',
    ejemploActual:
      'Los sistemas operativos de móvil están repartidos entre muy pocas empresas (oligopolio), lo que ha llevado a investigaciones de competencia en la UE y EE. UU. sobre comisiones en sus tiendas de aplicaciones.',
    paraLlevar:
      'Menos competidores casi siempre significa precios más altos para ti; por eso existen las autoridades de competencia.',
  },
  {
    id: 'fallos',
    num: 6,
    icono: '⚠️',
    titulo: 'Fallos de mercado',
    subtitulo: 'Cuando el mercado no basta',
    ideaCentral:
      'El mercado coordina muy bien muchas decisiones, pero no todas. Hay situaciones en que, dejado a su aire, produce resultados malos para el conjunto: contamina de más, no ofrece ciertos bienes o engaña al comprador. Son los fallos de mercado, y suelen justificar la intervención pública.',
    comoFunciona:
      'Aparecen cuando el precio no refleja todos los costes o beneficios reales. Si una fábrica no paga por el humo que emite, contaminará más de lo deseable. Si nadie puede cobrar por un faro, nadie lo construirá aunque sea útil para todos. El mercado, solo, no lo arregla.',
    ejemploCotidiano:
      'El vecino que pone la música a todo volumen: disfruta él, pero el coste (tu descanso) lo pagas tú. Él no lo tiene en cuenta porque no lo paga. Eso es una externalidad negativa en pequeño.',
    ejemploActual:
      'El cambio climático es el mayor fallo de mercado conocido: quien emite CO₂ no asume el coste global que provoca. De ahí los impuestos al carbono y los mercados de emisiones, que intentan poner precio a ese coste oculto.',
    paraLlevar:
      'Que el mercado sea útil no significa que sea perfecto: hay problemas que solo se resuelven con reglas colectivas.',
  },
];

// ─────────────────────────────────────────────
// Visual 1 — Frontera de posibilidades (escasez)
// ─────────────────────────────────────────────

function VisualEscasez() {
  const [pos, setPos] = useState(50);
  // Frontera cóncava: parametrizada por ángulo. pos 0..100 → t 0..1
  const t = pos / 100;
  const ang = t * (Math.PI / 2);
  // En viewBox 100x100, origen en (12,88)
  const R = 76;
  const px = 12 + Math.sin(ang) * R;
  const py = 88 - Math.cos(ang) * R;
  const bienA = Math.round(Math.cos(ang) * 100); // eje Y (educación)
  const bienB = Math.round(Math.sin(ang) * 100); // eje X (ocio)

  return (
    <div className={styles.visualWrap}>
      <svg viewBox="0 0 100 100" className={styles.visualSvg} role="img" aria-label={`Frontera de posibilidades: ${bienA} de educación y ${bienB} de ocio`}>
        <line x1="12" y1="88" x2="95" y2="88" stroke="#ccc" strokeWidth="1.5" />
        <line x1="12" y1="88" x2="12" y2="6" stroke="#ccc" strokeWidth="1.5" />
        <text x="94" y="96" fontSize="6" fill="#999" textAnchor="end">Ocio</text>
        <text x="4" y="10" fontSize="6" fill="#999">Estudio</text>
        {/* Frontera cóncava */}
        <path d="M 12,12 A 76,76 0 0 1 88,88" stroke="#2E86AB" strokeWidth="2.5" fill="none" />
        {/* Líneas guía */}
        <line x1="12" y1={py} x2={px} y2={py} stroke="#48A9A6" strokeWidth="1" strokeDasharray="3,2" />
        <line x1={px} y1="88" x2={px} y2={py} stroke="#48A9A6" strokeWidth="1" strokeDasharray="3,2" />
        {/* Punto de elección */}
        <circle cx={px} cy={py} r="3.5" fill="#48A9A6" stroke="#fff" strokeWidth="1.2" />
      </svg>
      <div className={styles.sliderRow}>
        <span className={styles.sliderLabel}>Más estudio</span>
        <input
          type="range" min={0} max={100} value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className={styles.slider}
          aria-label="Reparte tu tiempo entre estudio y ocio"
        />
        <span className={styles.sliderLabel}>Más ocio</span>
      </div>
      <div className={styles.datosFila}>
        <div className={styles.datoBloque}>
          <div className={styles.datoEtiqueta}>Estudio</div>
          <div className={styles.datoValor}>{bienA}</div>
          <div className={styles.datoNota}>horas dedicadas</div>
        </div>
        <div className={styles.datoBloque}>
          <div className={styles.datoEtiqueta}>Ocio</div>
          <div className={styles.datoValor}>{bienB}</div>
          <div className={styles.datoNota}>horas dedicadas</div>
        </div>
      </div>
      <p className={styles.visualLeyenda}>
        Para ganar ocio tienes que <strong>renunciar a estudio</strong> (y al revés). No puedes estar en el interior
        sin desperdiciar tiempo, ni más allá de la curva: ese es tu límite de recursos.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Visual 2 — Cruz de oferta y demanda
// ─────────────────────────────────────────────

function VisualOfertaDemanda() {
  return (
    <div className={styles.visualWrap}>
      <svg viewBox="0 0 100 100" className={styles.visualSvg} role="img" aria-label="Curva de oferta ascendente y curva de demanda descendente que se cruzan en el punto de equilibrio">
        <line x1="12" y1="88" x2="95" y2="88" stroke="#ccc" strokeWidth="1.5" />
        <line x1="12" y1="88" x2="12" y2="6" stroke="#ccc" strokeWidth="1.5" />
        <text x="94" y="96" fontSize="6" fill="#999" textAnchor="end">Cantidad</text>
        <text x="4" y="10" fontSize="6" fill="#999">Precio</text>
        {/* Demanda (descendente) */}
        <line x1="18" y1="16" x2="86" y2="80" stroke="#e74c3c" strokeWidth="2.5" strokeLinecap="round" />
        <text x="88" y="82" fontSize="7" fill="#e74c3c" fontWeight="bold">D</text>
        {/* Oferta (ascendente) */}
        <line x1="18" y1="80" x2="86" y2="16" stroke="#2E86AB" strokeWidth="2.5" strokeLinecap="round" />
        <text x="88" y="16" fontSize="7" fill="#2E86AB" fontWeight="bold">O</text>
        {/* Equilibrio */}
        <line x1="12" y1="48" x2="52" y2="48" stroke="#48A9A6" strokeWidth="1" strokeDasharray="3,2" />
        <line x1="52" y1="88" x2="52" y2="48" stroke="#48A9A6" strokeWidth="1" strokeDasharray="3,2" />
        <circle cx="52" cy="48" r="3.5" fill="#48A9A6" stroke="#fff" strokeWidth="1.2" />
        <text x="55" y="44" fontSize="6" fill="#48A9A6" fontWeight="bold">E</text>
      </svg>
      <p className={styles.visualLeyenda}>
        La <strong style={{ color: '#2E86AB' }}>oferta</strong> sube con el precio; la{' '}
        <strong style={{ color: '#e74c3c' }}>demanda</strong> baja con él. Se cruzan en el{' '}
        <strong>punto de equilibrio (E)</strong>: el precio donde lo que se quiere comprar iguala a lo que se quiere vender.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Visual 3 — Elasticidad (toggle)
// ─────────────────────────────────────────────

function VisualElasticidad() {
  const [modo, setModo] = useState<'inelastico' | 'elastico'>('inelastico');
  const inelastico = modo === 'inelastico';
  // Precio sube de p1 a p2 (mismo en ambos). La cantidad cae poco (inelástico) o mucho (elástico).
  const caidaCantidad = inelastico ? 8 : 45; // % de caída
  const q1 = 75;
  const q2 = Math.round(q1 * (1 - caidaCantidad / 100));

  // Curva: inelástica = casi vertical; elástica = más tumbada
  const curva = inelastico ? 'M 40,12 L 58,84' : 'M 20,18 L 90,78';

  return (
    <div className={styles.visualWrap}>
      <div className={styles.toggleRow} role="group" aria-label="Tipo de bien">
        <button type="button" className={`${styles.toggleBtn} ${inelastico ? styles.toggleActivo : ''}`} aria-pressed={inelastico} onClick={() => setModo('inelastico')}>
          ⛽ Inelástico (gasolina)
        </button>
        <button type="button" className={`${styles.toggleBtn} ${!inelastico ? styles.toggleActivo : ''}`} aria-pressed={!inelastico} onClick={() => setModo('elastico')}>
          🥤 Elástico (refresco)
        </button>
      </div>
      <svg viewBox="0 0 100 100" className={styles.visualSvg} role="img" aria-label={`Demanda ${modo}: al subir el precio, la cantidad cae un ${caidaCantidad}%`}>
        <line x1="12" y1="88" x2="95" y2="88" stroke="#ccc" strokeWidth="1.5" />
        <line x1="12" y1="88" x2="12" y2="6" stroke="#ccc" strokeWidth="1.5" />
        <text x="94" y="96" fontSize="6" fill="#999" textAnchor="end">Cantidad</text>
        <text x="4" y="10" fontSize="6" fill="#999">Precio</text>
        {/* Curva de demanda */}
        <path d={curva} stroke="#e74c3c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Precio antes (bajo) y después (alto) */}
        <line x1="12" y1="62" x2="88" y2="62" stroke="#999" strokeWidth="0.8" strokeDasharray="3,2" />
        <line x1="12" y1="30" x2="88" y2="30" stroke="#2E86AB" strokeWidth="1" strokeDasharray="3,2" />
        <text x="13" y="60" fontSize="5" fill="#999">P₁</text>
        <text x="13" y="28" fontSize="5" fill="#2E86AB" fontWeight="bold">P₂ ↑</text>
      </svg>
      <div className={styles.datosFila}>
        <div className={styles.datoBloque}>
          <div className={styles.datoEtiqueta}>Sube el precio</div>
          <div className={styles.datoValor}>+20 %</div>
          <div className={styles.datoNota}>en ambos casos</div>
        </div>
        <div className={styles.datoBloque}>
          <div className={styles.datoEtiqueta}>Cae la cantidad</div>
          <div className={styles.datoValor} style={{ color: inelastico ? '#27ae60' : '#e74c3c' }}>−{caidaCantidad} %</div>
          <div className={styles.datoNota}>{inelastico ? 'apenas reaccionas' : 'te vas a otro'}</div>
        </div>
      </div>
      <p className={styles.visualLeyenda}>
        El mismo aumento de precio (+20 %) provoca una caída de ventas <strong>{inelastico ? 'mínima' : 'enorme'}</strong>.
        Cuanto más vertical es la demanda, más inelástica: el comprador casi no puede renunciar al producto.{' '}
        (q antes ≈ {q1}, q después ≈ {q2}).
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Visual 4 — Economías de escala (slider)
// ─────────────────────────────────────────────

function VisualCostes() {
  const [unidades, setUnidades] = useState(20);
  const costeFijo = 1000;
  const costeVariableUnit = 4;
  const costeMedio = costeFijo / unidades + costeVariableUnit;
  // Altura de barra inversa al coste medio para mostrar que baja
  const maxCoste = costeFijo / 1 + costeVariableUnit; // a 1 unidad
  const alturaFijoPct = Math.round((costeFijo / unidades / costeMedio) * 100);

  return (
    <div className={styles.visualWrap}>
      <svg viewBox="0 0 100 100" className={styles.visualSvg} role="img" aria-label={`Con ${unidades} unidades el coste medio es ${costeMedio.toFixed(1)} euros`}>
        <line x1="12" y1="88" x2="95" y2="88" stroke="#ccc" strokeWidth="1.5" />
        <line x1="12" y1="88" x2="12" y2="6" stroke="#ccc" strokeWidth="1.5" />
        <text x="94" y="96" fontSize="6" fill="#999" textAnchor="end">Unidades</text>
        <text x="4" y="10" fontSize="6" fill="#999">€/ud</text>
        {/* Curva de coste medio decreciente: CM = 1000/q + 4 */}
        <path
          d={(() => {
            const pts: string[] = [];
            for (let q = 1; q <= 100; q += 2) {
              const cm = costeFijo / q + costeVariableUnit;
              const x = 12 + (q / 100) * 80;
              const y = 88 - ((cm - costeVariableUnit) / (maxCoste - costeVariableUnit)) * 76;
              pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
            }
            return 'M ' + pts.join(' L ');
          })()}
          stroke="#2E86AB" strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
        {/* Punto actual */}
        {(() => {
          const x = 12 + (unidades / 100) * 80;
          const y = 88 - ((costeMedio - costeVariableUnit) / (maxCoste - costeVariableUnit)) * 76;
          return <circle cx={x} cy={y} r="3.5" fill="#48A9A6" stroke="#fff" strokeWidth="1.2" />;
        })()}
      </svg>
      <div className={styles.sliderRow}>
        <span className={styles.sliderLabel}>Pocas</span>
        <input
          type="range" min={1} max={100} value={unidades}
          onChange={(e) => setUnidades(Number(e.target.value))}
          className={styles.slider}
          aria-label="Unidades producidas"
        />
        <span className={styles.sliderLabel}>Muchas</span>
      </div>
      <div className={styles.datosFila}>
        <div className={styles.datoBloque}>
          <div className={styles.datoEtiqueta}>Unidades</div>
          <div className={styles.datoValor}>{unidades}</div>
          <div className={styles.datoNota}>producidas</div>
        </div>
        <div className={styles.datoBloque}>
          <div className={styles.datoEtiqueta}>Coste por unidad</div>
          <div className={styles.datoValor}>{costeMedio.toFixed(1)} €</div>
          <div className={styles.datoNota}>{alturaFijoPct}% es coste fijo repartido</div>
        </div>
      </div>
      <p className={styles.visualLeyenda}>
        Con costes fijos de 1.000 € y 4 € de material por unidad: producir <strong>más</strong> reparte el coste fijo
        y abarata cada unidad. De ahí la ventaja de las grandes empresas.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Visual 5 — Estructuras de mercado (espectro)
// ─────────────────────────────────────────────

type EstructuraId = 'perfecta' | 'monopolistica' | 'oligopolio' | 'monopolio';

const ESTRUCTURAS: { id: EstructuraId; icono: string; nombre: string; empresas: string; poder: number; ejemplo: string }[] = [
  { id: 'perfecta', icono: '🌾', nombre: 'Competencia perfecta', empresas: 'Muchísimas', poder: 5, ejemplo: 'Productos agrícolas básicos: nadie fija el precio, lo marca el mercado.' },
  { id: 'monopolistica', icono: '☕', nombre: 'Competencia monopolística', empresas: 'Muchas, producto diferenciado', poder: 30, ejemplo: 'Cafeterías o ropa: compiten, pero cada marca tiene algo propio.' },
  { id: 'oligopolio', icono: '📱', nombre: 'Oligopolio', empresas: 'Unas pocas', poder: 65, ejemplo: 'Operadoras de telefonía o aerolíneas: pocas empresas vigilándose entre sí.' },
  { id: 'monopolio', icono: '🚉', nombre: 'Monopolio', empresas: 'Una sola', poder: 95, ejemplo: 'La red ferroviaria o el agua: un único proveedor con todo el poder.' },
];

function VisualEstructuras() {
  const [activa, setActiva] = useState<EstructuraId>('perfecta');
  const e = ESTRUCTURAS.find((x) => x.id === activa)!;

  return (
    <div className={styles.visualWrap}>
      <div className={styles.espectroGrid} role="group" aria-label="Estructuras de mercado">
        {ESTRUCTURAS.map((x) => (
          <button
            key={x.id}
            type="button"
            className={`${styles.espectroBtn} ${activa === x.id ? styles.espectroActivo : ''}`}
            aria-pressed={activa === x.id}
            onClick={() => setActiva(x.id)}
          >
            <span className={styles.espectroIcono} aria-hidden="true">{x.icono}</span>
            <span className={styles.espectroNombre}>{x.nombre}</span>
          </button>
        ))}
      </div>
      <div className={styles.datosFila}>
        <div className={styles.datoBloque}>
          <div className={styles.datoEtiqueta}>Nº de empresas</div>
          <div className={styles.datoValor} style={{ fontSize: '1rem' }}>{e.empresas}</div>
        </div>
        <div className={styles.meterBox}>
          <div className={styles.meterTitulo}>Poder sobre el precio</div>
          <div className={styles.meterTrack}>
            <div className={styles.meterFill} style={{ width: `${e.poder}%`, background: e.poder > 60 ? '#e74c3c' : e.poder > 25 ? '#e67e22' : '#27ae60' }} />
          </div>
          <div className={styles.meterValor} style={{ color: e.poder > 60 ? '#e74c3c' : e.poder > 25 ? '#e67e22' : '#27ae60' }}>{e.poder}/100</div>
        </div>
      </div>
      <p className={styles.visualLeyenda}>{e.ejemplo}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Visual 6 — Fallos de mercado (tarjetas)
// ─────────────────────────────────────────────

const FALLOS: { icono: string; titulo: string; texto: string }[] = [
  { icono: '🏭', titulo: 'Externalidades', texto: 'Costes o beneficios que recaen en terceros. La contaminación de una fábrica la paga toda la sociedad, no quien la genera.' },
  { icono: '🏞️', titulo: 'Bienes públicos', texto: 'Útiles para todos pero imposibles de cobrar individualmente (un faro, el alumbrado). El mercado no los provee solo.' },
  { icono: '🔍', titulo: 'Información asimétrica', texto: 'Una parte sabe más que la otra. El vendedor de un coche usado conoce sus fallos; el comprador, no.' },
  { icono: '👑', titulo: 'Poder de mercado', texto: 'Cuando una empresa domina, puede subir precios y reducir calidad sin perder clientes. De ahí la regulación.' },
];

function VisualFallos() {
  return (
    <div className={styles.visualWrap}>
      <div className={styles.cardsGrid}>
        {FALLOS.map((f) => (
          <div key={f.titulo} className={styles.miniCard}>
            <div className={styles.miniCardTitulo}>
              <span aria-hidden="true">{f.icono}</span> {f.titulo}
            </div>
            <p className={styles.miniCardTexto}>{f.texto}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Render del visual según concepto
// ─────────────────────────────────────────────

function VisualDelConcepto({ id }: { id: ConceptoId }) {
  switch (id) {
    case 'escasez': return <VisualEscasez />;
    case 'oferta-demanda': return <VisualOfertaDemanda />;
    case 'elasticidad': return <VisualElasticidad />;
    case 'costes': return <VisualCostes />;
    case 'estructuras': return <VisualEstructuras />;
    case 'fallos': return <VisualFallos />;
  }
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorMicroeconomiaPage() {
  const [activo, setActivo] = useState<ConceptoId>('escasez');
  const concepto = CONCEPTOS.find((c) => c.id === activo)!;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Microeconomía Visual</h1>
        <p className={styles.subtitle}>Un recorrido por cómo deciden las personas y las empresas, concepto a concepto</p>
      </header>

      <LegalNotice />

      <div className={styles.intro}>
        <p className={styles.introTexto}>
          La <strong>microeconomía</strong> estudia las decisiones de las piezas pequeñas de la economía: un consumidor,
          una empresa, un mercado concreto. Aquí tienes sus <strong>6 ideas fundamentales</strong>, cada una con un
          ejemplo cotidiano, un caso actual y un visual para tocarlo. Elige por dónde empezar.
        </p>
      </div>

      {/* Selector de conceptos */}
      <div className={styles.conceptosGrid} role="list">
        {CONCEPTOS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="listitem"
            className={`${styles.conceptoBtn} ${activo === c.id ? styles.conceptoActivo : ''}`}
            onClick={() => setActivo(c.id)}
            aria-pressed={activo === c.id}
          >
            <span className={styles.conceptoNum}>{c.num}</span>
            <span className={styles.conceptoIcono} aria-hidden="true">{c.icono}</span>
            <span className={styles.conceptoTitulo}>{c.titulo}</span>
          </button>
        ))}
      </div>

      {/* Panel del concepto activo */}
      <div className={styles.panel} key={concepto.id}>
        <div className={styles.panelHeader}>
          <span className={styles.panelIcono} aria-hidden="true">{concepto.icono}</span>
          <div>
            <h2 className={styles.panelTitulo}>{concepto.titulo}</h2>
            <p className={styles.panelSubtitulo}>{concepto.subtitulo}</p>
          </div>
        </div>

        <p className={styles.panelDescripcion}>{concepto.ideaCentral}</p>

        {/* Visual interactivo */}
        <h3 className={styles.seccionTitulo}>Pruébalo</h3>
        <VisualDelConcepto id={concepto.id} />

        {/* Cómo funciona */}
        <div className={styles.mecanismoCard}>
          <div className={styles.mecanismoTitulo}>Cómo funciona</div>
          <p className={styles.mecanismoTexto}>{concepto.comoFunciona}</p>
        </div>

        {/* Ejemplos */}
        <div className={styles.ejemplosFila}>
          <div className={`${styles.ejemploCard} ${styles.ejemploCotidiano}`}>
            <div className={styles.ejemploTitulo}><span aria-hidden="true">🏠</span> En tu día a día</div>
            <p className={styles.ejemploTexto}>{concepto.ejemploCotidiano}</p>
          </div>
          <div className={`${styles.ejemploCard} ${styles.ejemploActual}`}>
            <div className={styles.ejemploTitulo}><span aria-hidden="true">📰</span> Caso actual</div>
            <p className={styles.ejemploTexto}>{concepto.ejemploActual}</p>
          </div>
        </div>

        {/* Para llevar */}
        <div className={styles.paraLlevar} role="note">
          <span className={styles.paraLlevarIcono} aria-hidden="true">💡</span>
          <p className={styles.paraLlevarTexto}>{concepto.paraLlevar}</p>
        </div>

        {/* Enlace a app relacionada */}
        {concepto.enlace && (
          <a href={concepto.enlace.url} className={styles.enlaceApp}>
            <span aria-hidden="true">→</span> {concepto.enlace.texto}
          </a>
        )}
      </div>

      {/* Mapa de los 6 conceptos */}
      <div className={styles.resumenCard}>
        <h3 className={styles.resumenTitulo}>El mapa de la microeconomía</h3>
        <div className={styles.resumenGrid}>
          {CONCEPTOS.map((c) => (
            <button key={c.id} type="button" className={styles.resumenItem} onClick={() => setActivo(c.id)}>
              <span className={styles.resumenIcono} aria-hidden="true">{c.icono}</span>
              <span>
                <span className={styles.resumenNombre}>{c.num}. {c.titulo}</span>
                {' — '}
                <span className={styles.resumenDesc}>{c.subtitulo}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sección educativa */}
      <EducationalSection title="Microeconomía en profundidad" subtitle="Conceptos, matices y enfoques" defaultOpen={false}>
        <div className={styles.eduBloque}>
          <h3 className={styles.eduTitulo}>¿Qué diferencia a la microeconomía de la macroeconomía?</h3>
          <p className={styles.eduTexto}>
            La <strong>microeconomía</strong> mira de cerca: cómo decide un consumidor en qué gastar, cómo fija precios
            una empresa, cómo se comporta un mercado concreto. La <strong>macroeconomía</strong>, en cambio, mira el
            conjunto: el crecimiento de un país, la inflación, el desempleo. Son dos zooms distintos sobre la misma
            realidad económica, y se complementan.
          </p>
        </div>

        <div className={styles.eduBloque}>
          <h3 className={styles.eduTitulo}>El coste de oportunidad está en todas partes</h3>
          <p className={styles.eduTexto}>
            Es quizá la idea más útil de toda la microeconomía. Cada decisión —de un Estado, una empresa o una persona—
            tiene un coste que no aparece en ninguna factura: lo que dejas de hacer. Pensar en términos de coste de
            oportunidad ayuda a tomar mejores decisiones porque obliga a comparar alternativas reales, no a fijarse
            solo en el desembolso visible.
          </p>
        </div>

        <div className={styles.eduBloque}>
          <h3 className={styles.eduTitulo}>Mercados eficientes, pero no infalibles</h3>
          <p className={styles.eduTexto}>
            La teoría económica muestra que, en condiciones ideales (mucha competencia, buena información, sin efectos
            sobre terceros), los mercados asignan los recursos de forma muy eficiente. Pero esas condiciones rara vez se
            dan del todo. Reconocer dónde fallan los mercados —y dónde funcionan bien— es lo que permite diseñar buenas
            políticas, en lugar de confiar ciegamente o desconfiar por completo del mercado.
          </p>
        </div>

        <div className={styles.eduBloque}>
          <h3 className={styles.eduTitulo}>Distintas escuelas, distintas lecturas</h3>
          <p className={styles.eduTexto}>
            No toda la economía piensa igual sobre cuánto intervenir cuando un mercado falla. Hay enfoques que confían
            más en la capacidad de los mercados para autocorregirse y otros que ven necesaria una regulación más
            activa. Conviene tratar estos marcos como <em>herramientas de análisis con supuestos distintos</em>, no como
            verdades cerradas: la respuesta «correcta» suele depender del caso concreto y de los valores en juego.
          </p>
        </div>

        <div className={styles.warningBox} role="note">
          <strong>Nota educativa:</strong> los valores numéricos de los visuales (precios, cantidades, costes, poder de
          mercado) son ejemplos simplificados para ilustrar la dirección de los cambios, no datos estadísticos reales.
          Su objetivo es hacer visible el mecanismo, no medir un mercado concreto.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-microeconomia')} />
      <ShareCard appName="visualizador-microeconomia" />
      <Footer appName="visualizador-microeconomia" />
    </div>
  );
}
