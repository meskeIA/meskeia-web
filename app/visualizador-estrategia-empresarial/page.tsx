'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorEstrategiaEmpresarial.module.css';
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
// Tipos y datos de los 6 módulos
// ─────────────────────────────────────────────

type ModuloId =
  | 'entorno'
  | 'interna'
  | 'ventaja'
  | 'modelo'
  | 'crecimiento'
  | 'ejecucion';

interface Modulo {
  id: ModuloId;
  num: number;
  icono: string;
  titulo: string;
  pregunta: string;
  ideaCentral: string;
  clasico: string;
  moderno: string;
  comoFunciona: string;
  ejemploCotidiano: string;
  ejemploActual: string;
  paraLlevar: string;
  enlace?: { texto: string; url: string };
}

const MODULOS: Modulo[] = [
  {
    id: 'entorno',
    num: 1,
    icono: '🧭',
    titulo: 'Análisis del entorno',
    pregunta: '¿Dónde competimos?',
    ideaCentral:
      'Antes de decidir qué hacer, una empresa necesita entender el terreno: qué tan intensa es la competencia, qué fuerzas presionan sus márgenes y qué cambios se acercan. Un sector puede ser muy rentable o casi imposible según cómo estén esas fuerzas.',
    clasico:
      'Las 5 Fuerzas de Porter (rivalidad, nuevos entrantes, poder de proveedores y de clientes, sustitutos) y el análisis PESTEL del macroentorno. Una foto de la estructura del sector.',
    moderno:
      'Hoy el entorno cambia tan rápido que la foto se complementa con ideas de ecosistemas, plataformas y efectos de red: a veces no compites contra rivales, sino contra toda una plataforma que cambia las reglas.',
    comoFunciona:
      'Cuantas más fuerzas estén «altas» (mucha rivalidad, fácil entrar, proveedores o clientes poderosos, muchos sustitutos), más difícil es ganar dinero en ese sector. Mapear las cinco fuerzas ayuda a ver dónde están las amenazas y dónde el margen.',
    ejemploCotidiano:
      'Abrir una cafetería en una calle que ya tiene cinco: la rivalidad es altísima y entrar es fácil para cualquiera, así que es difícil destacar y subir precios. El entorno, de entrada, juega en tu contra.',
    ejemploActual:
      'En sectores como el reparto a domicilio o el streaming, la rivalidad es feroz y los clientes comparan precios en segundos: las fuerzas competitivas aprietan los márgenes de todos los participantes a la vez.',
    paraLlevar:
      'No todos los sectores son igual de rentables: a veces el problema no es tu empresa, es el terreno en el que juegas.',
  },
  {
    id: 'interna',
    num: 2,
    icono: '🔧',
    titulo: 'Mirada interna',
    pregunta: '¿Qué tenemos?',
    ideaCentral:
      'Una vez entendido el terreno, toca mirar hacia dentro: qué recursos y capacidades tiene la empresa y cuáles de ellos son realmente especiales. No todo lo que tienes te da ventaja; solo aquello difícil de copiar y bien aprovechado.',
    clasico:
      'La cadena de valor de Porter (descomponer la empresa en actividades para ver dónde se crea valor) y la prueba VRIO: un recurso da ventaja sostenible si es Valioso, Raro, difícil de Imitar y la empresa está Organizada para explotarlo.',
    moderno:
      'El peso ha pasado de los activos físicos (fábricas, tiendas) a los intangibles: datos, talento, marca, comunidad y software. Lo más difícil de copiar hoy rara vez se puede tocar con las manos.',
    comoFunciona:
      'Pasa cada recurso por las cuatro preguntas del VRIO. Si falla en «valioso», es una debilidad. Si es valioso pero común, solo te da para empatar. Si además es raro y difícil de imitar, y sabes explotarlo, ahí está tu ventaja sostenible.',
    ejemploCotidiano:
      'La receta secreta del bar de tu barrio es valiosa y rara, pero si cualquiera puede imitar el sabor, la ventaja dura poco. Lo que de verdad lo sostiene suele ser la clientela fiel y el saber hacer de años.',
    ejemploActual:
      'Para muchas plataformas digitales, su recurso más valioso son los datos de uso y los algoritmos que los aprovechan: valiosos, raros, difíciles de replicar y exprimidos por toda la organización. Encajan en las cuatro casillas del VRIO.',
    paraLlevar:
      'Tener un buen recurso no basta: la ventaja nace de tener algo valioso, raro, difícil de copiar y saber explotarlo.',
  },
  {
    id: 'ventaja',
    num: 3,
    icono: '🏰',
    titulo: 'Ventaja competitiva',
    pregunta: '¿Por qué nos eligen a nosotros?',
    ideaCentral:
      'La ventaja competitiva es la razón por la que un cliente te elige a ti y no a otro, de forma sostenida. Puede basarse en ser más barato, en ser distinto, o en haber construido un «foso» que protege tu posición de los rivales.',
    clasico:
      'Porter propuso dos grandes vías: liderazgo en costes (ser el más eficiente) o diferenciación (ofrecer algo único por lo que se paga más). La estrategia «Océano Azul» añadió una tercera: crear un mercado nuevo sin competencia directa.',
    moderno:
      'Hoy se habla de «moats» (fosos): efectos de red, costes de cambio, economías de escala y datos. No protegen por ser barato o bonito, sino porque hacen costoso o absurdo irse a la competencia.',
    comoFunciona:
      'Un foso ancho hace que ganar a la empresa cueste mucho a los rivales. Si cada nuevo usuario hace el producto más útil para los demás (efecto de red), o cambiar de proveedor es un engorro (coste de cambio), la ventaja se sostiene aunque otros copien el producto.',
    ejemploCotidiano:
      'No cambias de grupo de mensajería aunque salga otro mejor: están todos tus contactos. Ese «coste de cambio» y ese «efecto de red» son un foso, aunque la app rival sea técnicamente igual de buena.',
    ejemploActual:
      'Las grandes plataformas de redes sociales y marketplaces se protegen con efectos de red: cuanta más gente las usa, más valiosas son y más difícil es que una alternativa arranque desde cero, aunque sea parecida.',
    paraLlevar:
      'Un buen producto se copia; un buen foso, no. La ventaja duradera está en lo que hace caro o incómodo cambiarse.',
  },
  {
    id: 'modelo',
    num: 4,
    icono: '💰',
    titulo: 'Modelo de negocio',
    pregunta: '¿Cómo ganamos dinero?',
    ideaCentral:
      'El modelo de negocio describe cómo una empresa crea valor, lo entrega y captura una parte en forma de ingresos. Dos empresas del mismo sector pueden ganar dinero de formas radicalmente distintas, y eso cambia toda su estrategia.',
    clasico:
      'El Business Model Canvas de Osterwalder ordena las piezas: propuesta de valor, clientes, canales, ingresos, costes, recursos y socios. Una forma visual de ver el negocio entero en una hoja.',
    moderno:
      'Han ganado peso los modelos de plataforma (conectan a dos grupos: oferta y demanda), la suscripción (ingresos recurrentes) y el freemium (gratis para muchos, de pago para pocos). Cambian las palancas del negocio por completo.',
    comoFunciona:
      'En un modelo lineal compras, transformas y vendes. En uno de plataforma no vendes producto, sino que cobras por conectar a otros. En suscripción priorizas que el cliente se quede mes a mes; en freemium, convertir a una pequeña parte de usuarios gratuitos en clientes de pago.',
    ejemploCotidiano:
      'La frutería gana por cada venta (modelo lineal). El gimnasio cobra una cuota mensual aunque no vayas (suscripción). Son negocios distintos con lógicas distintas, aunque ambos estén en tu misma calle.',
    ejemploActual:
      'Muchas apps regalan una versión básica y cobran por funciones avanzadas (freemium), mientras que las plataformas de transporte o alojamiento no poseen coches ni casas: cobran por conectar a quien ofrece con quien necesita.',
    paraLlevar:
      'Cambiar de modelo de negocio puede transformar una empresa más que cambiar de producto.',
    enlace: { texto: 'Diagnostica el tuyo: Diagnóstico de Modelo de Negocio', url: '/diagnostico-modelo-negocio/' },
  },
  {
    id: 'crecimiento',
    num: 5,
    icono: '🚀',
    titulo: 'Crecimiento',
    pregunta: '¿Hacia dónde crecemos?',
    ideaCentral:
      'Crecer no es una sola cosa: puedes vender más de lo mismo a tus clientes, llegar a mercados nuevos, sacar productos nuevos o saltar a sectores distintos. Cada camino tiene un riesgo y una lógica diferentes.',
    clasico:
      'La matriz de Ansoff cruza productos (actuales/nuevos) y mercados (actuales/nuevos) en cuatro estrategias de crecimiento. La matriz BCG, muy usada por los conglomerados de los años 70-80, clasificaba los negocios en «estrella», «vaca», «interrogante» y «perro» para repartir la inversión.',
    moderno:
      'El crecimiento por plataformas y ecosistemas permite escalar muy rápido sin poseer los activos. Pero la historia también enseña prudencia: gestionar una cartera enorme de negocios diversos, al estilo de los grandes conglomerados, demostró tener límites.',
    comoFunciona:
      'Cuanto más te alejas de lo que ya conoces (cliente y producto), más arriba sube el riesgo. Vender más a tus clientes actuales es lo más seguro; diversificar hacia un producto nuevo en un mercado nuevo es la apuesta más arriesgada de las cuatro.',
    ejemploCotidiano:
      'Una panadería puede vender más pan a sus vecinos (penetración), abrir otra tienda en el pueblo de al lado (nuevo mercado), añadir pastelería (nuevo producto) o montar una cafetería (diversificación). Cada paso, más ambicioso y más arriesgado.',
    ejemploActual:
      'General Electric encarnó la estrategia de cartera de los años 70-80: un conglomerado que gestionaba decenas de negocios muy distintos con matrices de inversión. Décadas después tuvo que desinvertir y trocearse, un recordatorio de que ninguna fórmula de crecimiento es eterna.',
    paraLlevar:
      'Crecer siempre implica asumir riesgo: la clave es elegir conscientemente cuánto, no crecer por crecer.',
  },
  {
    id: 'ejecucion',
    num: 6,
    icono: '🎯',
    titulo: 'Ejecución y adaptación',
    pregunta: '¿Cómo lo hacemos realidad?',
    ideaCentral:
      'Una estrategia brillante no sirve de nada si no se ejecuta, y casi ninguna sobrevive intacta al contacto con la realidad. La gran pregunta moderna es cuánto planificar por adelantado y cuánto aprender sobre la marcha.',
    clasico:
      'La planificación estratégica clásica (años 60-80) confiaba en planes detallados a varios años, con grandes departamentos dedicados a diseñarlos. La estrategia se «pensaba» arriba y se «ejecutaba» abajo.',
    moderno:
      'Mintzberg distinguió entre la estrategia planificada y la «emergente», la que surge de la práctica. Hoy se complementa con OKR, experimentación, MVP y métodos ágiles: lanzar rápido, medir y corregir, sobre todo cuando hay mucha incertidumbre.',
    comoFunciona:
      'Cuando el futuro es predecible, planificar con detalle compensa. Cuando es muy incierto, conviene apostar por experimentos pequeños y baratos, aprender de ellos y ajustar el rumbo. La mayoría de empresas necesitan una mezcla de las dos cosas según el contexto.',
    ejemploCotidiano:
      'Planear un viaje minuto a minuto funciona si conoces el destino; si vas a un sitio nuevo e impredecible, es mejor reservar lo esencial e improvisar el resto según lo que encuentres. Con la estrategia pasa igual.',
    ejemploActual:
      'Muchas empresas lanzan un producto mínimo viable (MVP), miden cómo reacciona la gente y deciden a partir de datos reales, en lugar de apostarlo todo a un plan cerrado a cinco años que el mercado puede desmentir en meses.',
    paraLlevar:
      'En un mundo incierto, la capacidad de aprender y adaptarse vale más que el plan perfecto sobre el papel.',
    enlace: { texto: 'Pon a prueba tu idea: Test de Validación de Idea', url: '/test-validacion-idea/' },
  },
];

// ─────────────────────────────────────────────
// Visual 1 — 5 Fuerzas de Porter (presets por sector)
// ─────────────────────────────────────────────

const FUERZAS = ['Rivalidad', 'Nuevos entrantes', 'Poder proveedores', 'Poder clientes', 'Sustitutos'];

type SectorId = 'cafeteria' | 'farmaceutica' | 'aerolineas' | 'plataforma';

const SECTORES: { id: SectorId; icono: string; nombre: string; valores: number[] }[] = [
  { id: 'cafeteria', icono: '☕', nombre: 'Cafetería de barrio', valores: [85, 80, 40, 70, 75] },
  { id: 'farmaceutica', icono: '💊', nombre: 'Farma con patente', valores: [30, 20, 45, 35, 25] },
  { id: 'aerolineas', icono: '✈️', nombre: 'Aerolíneas', valores: [90, 50, 75, 80, 45] },
  { id: 'plataforma', icono: '🌐', nombre: 'Plataforma líder', valores: [40, 25, 35, 45, 40] },
];

function Vis5Fuerzas() {
  const [sector, setSector] = useState<SectorId>('cafeteria');
  const s = SECTORES.find((x) => x.id === sector)!;
  const media = Math.round(s.valores.reduce((a, b) => a + b, 0) / s.valores.length);
  const atractivo = media < 45 ? 'Atractivo' : media < 65 ? 'Exigente' : 'Difícil';
  const colorVeredicto = media < 45 ? '#27ae60' : media < 65 ? '#e67e22' : '#e74c3c';

  return (
    <div className={styles.visualWrap}>
      <div className={styles.espectroGrid} role="group" aria-label="Sector a analizar">
        {SECTORES.map((x) => (
          <button
            key={x.id}
            type="button"
            className={`${styles.espectroBtn} ${sector === x.id ? styles.espectroActivo : ''}`}
            aria-pressed={sector === x.id}
            onClick={() => setSector(x.id)}
          >
            <span className={styles.espectroIcono} aria-hidden="true">{x.icono}</span>
            <span className={styles.espectroNombre}>{x.nombre}</span>
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {FUERZAS.map((f, i) => {
          const v = s.valores[i];
          const color = v > 65 ? '#e74c3c' : v > 45 ? '#e67e22' : '#27ae60';
          return (
            <div key={f} className={styles.meterBox}>
              <div className={styles.meterTitulo}>{f}</div>
              <div className={styles.meterTrack}>
                <div className={styles.meterFill} style={{ width: `${v}%`, background: color }} />
              </div>
              <div className={styles.meterValor} style={{ color }}>{v}/100</div>
            </div>
          );
        })}
      </div>
      <div className={styles.veredictoBox} style={{ background: `${colorVeredicto}1a`, marginTop: '1rem' }}>
        <div className={styles.veredictoTitulo} style={{ color: colorVeredicto }}>Sector {atractivo}</div>
        <p className={styles.veredictoTexto}>
          Fuerzas medias en {media}/100: cuanto más altas, más se aprietan los márgenes de todos los que compiten aquí.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Visual 2 — Test VRIO (4 toggles)
// ─────────────────────────────────────────────

const VRIO_ITEMS = [
  { letra: 'V', nombre: 'Valioso', desc: 'aprovecha una oportunidad' },
  { letra: 'R', nombre: 'Raro', desc: 'pocos lo tienen' },
  { letra: 'I', nombre: 'Inimitable', desc: 'difícil de copiar' },
  { letra: 'O', nombre: 'Organizado', desc: 'sabes explotarlo' },
];

function VisVRIO() {
  const [estado, setEstado] = useState<boolean[]>([true, false, false, false]);
  const [v, r, i, o] = estado;

  const toggle = (idx: number) => setEstado((prev) => prev.map((x, n) => (n === idx ? !x : x)));

  let titulo: string;
  let texto: string;
  let color: string;
  if (!v) {
    titulo = 'Desventaja competitiva';
    texto = 'Si el recurso no es valioso, juega en tu contra: consume esfuerzo sin aportar.';
    color = '#e74c3c';
  } else if (!r) {
    titulo = 'Paridad competitiva';
    texto = 'Valioso pero común: te permite competir, pero no destacar. Todos lo tienen.';
    color = '#e67e22';
  } else if (!i) {
    titulo = 'Ventaja temporal';
    texto = 'Valioso y raro, pero copiable: disfrutas una ventaja… hasta que otros lo imiten.';
    color = '#e67e22';
  } else if (!o) {
    titulo = 'Ventaja sin aprovechar';
    texto = 'Tienes el recurso ideal, pero la organización no está preparada para exprimirlo. Potencial desperdiciado.';
    color = '#e67e22';
  } else {
    titulo = 'Ventaja competitiva sostenible';
    texto = 'Valioso, raro, difícil de imitar y bien explotado: la combinación que sostiene una ventaja en el tiempo.';
    color = '#27ae60';
  }

  return (
    <div className={styles.visualWrap}>
      <div className={styles.vrioGrid} role="group" aria-label="Características del recurso">
        {VRIO_ITEMS.map((item, idx) => (
          <button
            key={item.letra}
            type="button"
            className={`${styles.vrioBtn} ${estado[idx] ? styles.vrioActivo : ''}`}
            aria-pressed={estado[idx]}
            onClick={() => toggle(idx)}
          >
            <span className={styles.vrioLetra} style={{ color: estado[idx] ? '#27ae60' : 'var(--text-muted)' }}>{item.letra}</span>
            <span className={styles.vrioNombre}>{item.nombre}</span>
            <span className={styles.vrioCheck} aria-hidden="true">{estado[idx] ? '✓' : '○'}</span>
          </button>
        ))}
      </div>
      <p className={styles.visualLeyenda} style={{ marginBottom: '1rem' }}>
        Activa las características que cumple tu recurso (marca, datos, ubicación, talento…) y mira el veredicto.
      </p>
      <div className={styles.veredictoBox} style={{ background: `${color}1a` }}>
        <div className={styles.veredictoTitulo} style={{ color }}>{titulo}</div>
        <p className={styles.veredictoTexto}>{texto}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Visual 3 — Tipos de foso (moat)
// ─────────────────────────────────────────────

type MoatId = 'red' | 'cambio' | 'escala' | 'marca' | 'ninguno';

const MOATS: { id: MoatId; icono: string; nombre: string; anchura: number; desc: string }[] = [
  { id: 'red', icono: '🕸️', nombre: 'Efecto de red', anchura: 90, desc: 'Cada usuario nuevo hace el producto más valioso para el resto. El líder se vuelve casi imbatible.' },
  { id: 'cambio', icono: '🔒', nombre: 'Coste de cambio', anchura: 70, desc: 'Irse a la competencia es caro o engorroso (migrar datos, reaprender, perder histórico). El cliente se queda.' },
  { id: 'escala', icono: '📊', nombre: 'Escala y datos', anchura: 75, desc: 'Producir o aprender a lo grande abarata el coste por unidad y mejora el producto. Difícil de igualar desde abajo.' },
  { id: 'marca', icono: '⭐', nombre: 'Marca', anchura: 50, desc: 'La confianza y el prestigio permiten cobrar más, pero protegen menos: una marca se erosiona con el tiempo.' },
  { id: 'ninguno', icono: '🌊', nombre: 'Sin foso', anchura: 10, desc: 'Producto bueno pero fácil de copiar y sin ataduras: la ventaja dura lo que tarda el siguiente en imitarte.' },
];

function VisMoat() {
  const [moat, setMoat] = useState<MoatId>('red');
  const m = MOATS.find((x) => x.id === moat)!;
  const color = m.anchura > 65 ? '#27ae60' : m.anchura > 35 ? '#e67e22' : '#e74c3c';

  return (
    <div className={styles.visualWrap}>
      <div className={styles.espectroGrid} role="group" aria-label="Tipo de foso defensivo" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {MOATS.map((x) => (
          <button
            key={x.id}
            type="button"
            className={`${styles.espectroBtn} ${moat === x.id ? styles.espectroActivo : ''}`}
            aria-pressed={moat === x.id}
            onClick={() => setMoat(x.id)}
          >
            <span className={styles.espectroIcono} aria-hidden="true">{x.icono}</span>
            <span className={styles.espectroNombre}>{x.nombre}</span>
          </button>
        ))}
      </div>
      <div className={styles.meterBox}>
        <div className={styles.meterTitulo}>Anchura del foso (cuánto te protege)</div>
        <div className={styles.meterTrack}>
          <div className={styles.meterFill} style={{ width: `${m.anchura}%`, background: color }} />
        </div>
        <div className={styles.meterValor} style={{ color }}>{m.anchura}/100</div>
      </div>
      <p className={styles.visualLeyenda} style={{ marginTop: '0.8rem' }}>{m.desc}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Visual 4 — Tipos de modelo de negocio
// ─────────────────────────────────────────────

type ModeloId = 'lineal' | 'plataforma' | 'suscripcion' | 'freemium';

const MODELOS: { id: ModeloId; icono: string; nombre: string; comoGana: string; palanca: string }[] = [
  { id: 'lineal', icono: '🏪', nombre: 'Lineal', comoGana: 'Compras o produces, transformas y vendes con margen.', palanca: 'Palanca clave: volumen y margen por venta. Cada transacción cuenta.' },
  { id: 'plataforma', icono: '🔗', nombre: 'Plataforma', comoGana: 'Conectas a dos grupos (oferta y demanda) y cobras por facilitar el encuentro.', palanca: 'Palanca clave: masa crítica y efecto de red. Sin ambos lados, no hay negocio.' },
  { id: 'suscripcion', icono: '🔁', nombre: 'Suscripción', comoGana: 'Cobras una cuota recurrente por acceso continuo a un producto o servicio.', palanca: 'Palanca clave: retención. Importa más que el cliente se quede que la venta inicial.' },
  { id: 'freemium', icono: '🎁', nombre: 'Freemium', comoGana: 'Ofreces una versión gratuita a muchos y cobras a una minoría por funciones avanzadas.', palanca: 'Palanca clave: tasa de conversión de gratis a pago, sin disparar el coste de servir a los gratuitos.' },
];

function VisModeloNegocio() {
  const [modelo, setModelo] = useState<ModeloId>('plataforma');
  const m = MODELOS.find((x) => x.id === modelo)!;

  return (
    <div className={styles.visualWrap}>
      <div className={styles.espectroGrid} role="group" aria-label="Tipo de modelo de negocio">
        {MODELOS.map((x) => (
          <button
            key={x.id}
            type="button"
            className={`${styles.espectroBtn} ${modelo === x.id ? styles.espectroActivo : ''}`}
            aria-pressed={modelo === x.id}
            onClick={() => setModelo(x.id)}
          >
            <span className={styles.espectroIcono} aria-hidden="true">{x.icono}</span>
            <span className={styles.espectroNombre}>{x.nombre}</span>
          </button>
        ))}
      </div>
      <div className={styles.matrizDetalle}>
        <div className={styles.miniCardTitulo}>Cómo gana dinero</div>
        <p className={styles.miniCardTexto} style={{ marginBottom: '0.6rem' }}>{m.comoGana}</p>
        <p className={styles.miniCardTexto} style={{ fontWeight: 600, color: 'var(--primary)' }}>{m.palanca}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Visual 5 — Matriz de Ansoff (2x2)
// ─────────────────────────────────────────────

type AnsoffId = 'penetracion' | 'desarrollo-producto' | 'desarrollo-mercado' | 'diversificacion';

const ANSOFF: Record<AnsoffId, { nombre: string; riesgo: string; color: string; desc: string }> = {
  penetracion: { nombre: 'Penetración', riesgo: 'Riesgo bajo', color: '#27ae60', desc: 'Vender más de tus productos actuales a tus clientes actuales: más frecuencia, más cuota, mejor conversión. La vía más segura.' },
  'desarrollo-producto': { nombre: 'Desarrollo de producto', riesgo: 'Riesgo medio', color: '#e67e22', desc: 'Lanzar productos nuevos a tus clientes de siempre. Aprovechas la relación, pero apuestas por algo no probado.' },
  'desarrollo-mercado': { nombre: 'Desarrollo de mercado', riesgo: 'Riesgo medio', color: '#e67e22', desc: 'Llevar tus productos actuales a mercados o públicos nuevos (otra ciudad, otro país, otro segmento).' },
  diversificacion: { nombre: 'Diversificación', riesgo: 'Riesgo alto', color: '#e74c3c', desc: 'Producto nuevo en mercado nuevo: la apuesta más ambiciosa y arriesgada, porque todo es desconocido a la vez.' },
};

function VisAnsoff() {
  const [celda, setCelda] = useState<AnsoffId>('penetracion');
  const c = ANSOFF[celda];

  const Boton = ({ id }: { id: AnsoffId }) => (
    <button
      type="button"
      className={`${styles.matrizCelda} ${celda === id ? styles.matrizCeldaActiva : ''}`}
      aria-pressed={celda === id}
      onClick={() => setCelda(id)}
    >
      <span className={styles.matrizCeldaTitulo}>{ANSOFF[id].nombre}</span>
      <span className={styles.matrizCeldaRiesgo} style={{ color: ANSOFF[id].color }}>{ANSOFF[id].riesgo}</span>
    </button>
  );

  return (
    <div className={styles.visualWrap}>
      <div className={styles.matrizWrap}>
        <div className={styles.matrizEsquina} />
        <div className={styles.matrizCabeceraCol}>Producto actual</div>
        <div className={styles.matrizCabeceraCol}>Producto nuevo</div>
        <div className={styles.matrizCabeceraFila}>Mercado actual</div>
        <Boton id="penetracion" />
        <Boton id="desarrollo-producto" />
        <div className={styles.matrizCabeceraFila}>Mercado nuevo</div>
        <Boton id="desarrollo-mercado" />
        <Boton id="diversificacion" />
      </div>
      <div className={styles.matrizDetalle}>
        <div className={styles.veredictoTitulo} style={{ color: c.color, fontSize: '0.95rem' }}>{c.nombre} · {c.riesgo}</div>
        <p className={styles.miniCardTexto}>{c.desc}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Visual 6 — Planificar vs experimentar (slider)
// ─────────────────────────────────────────────

function VisEjecucion() {
  const [incertidumbre, setIncertidumbre] = useState(50);
  const experimentar = incertidumbre;
  const planificar = 100 - incertidumbre;
  const recomendacion =
    incertidumbre < 35
      ? 'Entorno predecible: compensa planificar con detalle y ejecutar el plan con disciplina.'
      : incertidumbre > 65
      ? 'Entorno muy incierto: mejor apostar por experimentos pequeños, medir y corregir rápido.'
      : 'Incertidumbre media: combina un rumbo general planificado con experimentos para ajustar los detalles.';

  return (
    <div className={styles.visualWrap}>
      <div className={styles.sliderRow}>
        <span className={styles.sliderLabel}>Predecible</span>
        <input
          type="range" min={0} max={100} value={incertidumbre}
          onChange={(e) => setIncertidumbre(Number(e.target.value))}
          className={styles.slider}
          aria-label="Nivel de incertidumbre del entorno"
        />
        <span className={styles.sliderLabel}>Incierto</span>
      </div>
      <div className={styles.datosFila}>
        <div className={styles.meterBox}>
          <div className={styles.meterTitulo}>Planificar por adelantado</div>
          <div className={styles.meterTrack}>
            <div className={styles.meterFill} style={{ width: `${planificar}%`, background: '#2E86AB' }} />
          </div>
          <div className={styles.meterValor}>{planificar}%</div>
        </div>
        <div className={styles.meterBox}>
          <div className={styles.meterTitulo}>Experimentar y adaptar</div>
          <div className={styles.meterTrack}>
            <div className={styles.meterFill} style={{ width: `${experimentar}%`, background: '#48A9A6' }} />
          </div>
          <div className={styles.meterValor} style={{ color: '#48A9A6' }}>{experimentar}%</div>
        </div>
      </div>
      <p className={styles.visualLeyenda} style={{ marginTop: '0.8rem' }}>{recomendacion}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Render del visual según módulo
// ─────────────────────────────────────────────

function VisualDelModulo({ id }: { id: ModuloId }) {
  switch (id) {
    case 'entorno': return <Vis5Fuerzas />;
    case 'interna': return <VisVRIO />;
    case 'ventaja': return <VisMoat />;
    case 'modelo': return <VisModeloNegocio />;
    case 'crecimiento': return <VisAnsoff />;
    case 'ejecucion': return <VisEjecucion />;
  }
}

// ─────────────────────────────────────────────
// Cronología del pensamiento estratégico
// ─────────────────────────────────────────────

const ERAS = [
  { anios: '1960s', nombre: 'Planificación corporativa', desc: 'Grandes planes a varios años; la estrategia se diseña arriba y se ejecuta abajo.' },
  { anios: '1970-80', nombre: 'Matrices de cartera', desc: 'Auge de los conglomerados. Matrices BCG y GE/McKinsey reparten la inversión entre negocios.' },
  { anios: '1980s', nombre: 'Posicionamiento competitivo', desc: 'Porter: 5 fuerzas y estrategias genéricas. La clave está en la estructura del sector.' },
  { anios: '1990s', nombre: 'Recursos y capacidades', desc: 'La ventaja nace de dentro: competencias nucleares y recursos difíciles de imitar (VRIO).' },
  { anios: '2000s', nombre: 'Disrupción e innovación', desc: 'Christensen y la disrupción; «Océano Azul» y la creación de mercados nuevos.' },
  { anios: '2010s-hoy', nombre: 'Plataformas, datos e IA', desc: 'Efectos de red, ecosistemas y estrategia ágil y experimental ante la incertidumbre.' },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorEstrategiaEmpresarialPage() {
  const [activo, setActivo] = useState<ModuloId>('entorno');
  const modulo = MODULOS.find((m) => m.id === activo)!;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Estrategia Empresarial Visual</h1>
        <p className={styles.subtitle}>Los 6 módulos que toda empresa necesita, del clásico Porter a la era de las plataformas y la IA</p>
      </header>

      <LegalNotice />

      <div className={styles.intro}>
        <p className={styles.introTexto}>
          Toda empresa necesita una <strong>estrategia</strong>: decidir dónde competir, con qué ventaja y cómo crecer.
          Pero la forma de pensarla ha cambiado mucho: la estrategia de un gran conglomerado industrial de los años
          70-80 (como <strong>General Electric</strong>) poco tiene que ver con la de una plataforma digital o de IA
          actual. Aquí tienes los <strong>6 módulos esenciales</strong>, cada uno con su versión clásica y su evolución
          moderna, un visual interactivo y ejemplos cotidianos y de actualidad.
        </p>
      </div>

      {/* Selector de módulos */}
      <div className={styles.conceptosGrid} role="list">
        {MODULOS.map((m) => (
          <button
            key={m.id}
            type="button"
            role="listitem"
            className={`${styles.conceptoBtn} ${activo === m.id ? styles.conceptoActivo : ''}`}
            onClick={() => setActivo(m.id)}
            aria-pressed={activo === m.id}
          >
            <span className={styles.conceptoNum}>{m.num}</span>
            <span className={styles.conceptoIcono} aria-hidden="true">{m.icono}</span>
            <span className={styles.conceptoTitulo}>{m.titulo}</span>
          </button>
        ))}
      </div>

      {/* Panel del módulo activo */}
      <div className={styles.panel} key={modulo.id}>
        <div className={styles.panelHeader}>
          <span className={styles.panelIcono} aria-hidden="true">{modulo.icono}</span>
          <div>
            <h2 className={styles.panelTitulo}>{modulo.titulo}</h2>
            <p className={styles.panelSubtitulo}>{modulo.pregunta}</p>
          </div>
        </div>

        <p className={styles.panelDescripcion}>{modulo.ideaCentral}</p>

        {/* Evolución: clásico vs moderno */}
        <div className={styles.evoFila}>
          <div className={`${styles.evoCard} ${styles.evoClasico}`}>
            <div className={`${styles.evoEtiqueta} ${styles.evoEtiquetaClasico}`}>Enfoque clásico</div>
            <p className={styles.evoTexto}>{modulo.clasico}</p>
          </div>
          <div className={styles.evoFlecha} aria-hidden="true">→</div>
          <div className={`${styles.evoCard} ${styles.evoModerno}`}>
            <div className={`${styles.evoEtiqueta} ${styles.evoEtiquetaModerno}`}>Hoy</div>
            <p className={styles.evoTexto}>{modulo.moderno}</p>
          </div>
        </div>

        {/* Visual interactivo */}
        <h3 className={styles.seccionTitulo}>Pruébalo</h3>
        <VisualDelModulo id={modulo.id} />

        {/* Cómo funciona */}
        <div className={styles.mecanismoCard}>
          <div className={styles.mecanismoTitulo}>Cómo funciona</div>
          <p className={styles.mecanismoTexto}>{modulo.comoFunciona}</p>
        </div>

        {/* Ejemplos */}
        <div className={styles.ejemplosFila}>
          <div className={`${styles.ejemploCard} ${styles.ejemploCotidiano}`}>
            <div className={styles.ejemploTitulo}><span aria-hidden="true">🏠</span> En tu día a día</div>
            <p className={styles.ejemploTexto}>{modulo.ejemploCotidiano}</p>
          </div>
          <div className={`${styles.ejemploCard} ${styles.ejemploActual}`}>
            <div className={styles.ejemploTitulo}><span aria-hidden="true">📰</span> Caso actual</div>
            <p className={styles.ejemploTexto}>{modulo.ejemploActual}</p>
          </div>
        </div>

        {/* Para llevar */}
        <div className={styles.paraLlevar} role="note">
          <span className={styles.paraLlevarIcono} aria-hidden="true">💡</span>
          <p className={styles.paraLlevarTexto}>{modulo.paraLlevar}</p>
        </div>

        {/* Enlace a app relacionada */}
        {modulo.enlace && (
          <a href={modulo.enlace.url} className={styles.enlaceApp}>
            <span aria-hidden="true">→</span> {modulo.enlace.texto}
          </a>
        )}
      </div>

      {/* Mapa de los 6 módulos */}
      <div className={styles.resumenCard}>
        <h3 className={styles.resumenTitulo}>El mapa de la estrategia</h3>
        <div className={styles.resumenGrid}>
          {MODULOS.map((m) => (
            <button key={m.id} type="button" className={styles.resumenItem} onClick={() => setActivo(m.id)}>
              <span className={styles.resumenIcono} aria-hidden="true">{m.icono}</span>
              <span>
                <span className={styles.resumenNombre}>{m.num}. {m.titulo}</span>
                {' — '}
                <span className={styles.resumenDesc}>{m.pregunta}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Reloj del pensamiento estratégico */}
      <div className={styles.resumenCard}>
        <h3 className={styles.resumenTitulo}>El reloj del pensamiento estratégico</h3>
        <p className={styles.eduTexto} style={{ marginBottom: '1rem' }}>
          Ningún enfoque sustituyó del todo al anterior: cada época añadió una lente nueva sobre las que ya existían.
        </p>
        <div className={styles.evoTimeline}>
          {ERAS.map((e) => (
            <div key={e.anios} className={styles.evoEra}>
              <span className={styles.evoEraAnios}>{e.anios}</span>
              <span>
                <span className={styles.evoEraNombre}>{e.nombre}</span>
                <br />
                <span className={styles.evoEraDesc}>{e.desc}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sección educativa */}
      <EducationalSection title="Estrategia en profundidad" subtitle="Marcos, matices y advertencias" defaultOpen={false}>
        <div className={styles.eduBloque}>
          <h3 className={styles.eduTitulo}>Los marcos son lentes, no leyes</h3>
          <p className={styles.eduTexto}>
            Las 5 fuerzas, el VRIO, la matriz de Ansoff o el Business Model Canvas son <em>herramientas de análisis</em>,
            no fórmulas que garanticen el éxito. Cada una ilumina una parte del problema y deja otras en sombra. Autores
            como Porter, Mintzberg, Christensen o Kim y Mauborgne <strong>propusieron y popularizaron</strong> estos
            marcos en contextos concretos; conviene usarlos como mapas, sabiendo que ningún mapa es el territorio.
          </p>
        </div>

        <div className={styles.eduBloque}>
          <h3 className={styles.eduTitulo}>Cuidado con el sesgo de supervivencia</h3>
          <p className={styles.eduTexto}>
            Gran parte de la literatura de estrategia estudia empresas que triunfaron y deduce qué hicieron «bien». Pero
            muchas empresas que fracasaron hicieron exactamente lo mismo: solo que de ellas no se escriben libros. Por
            eso frases como «las empresas excelentes hacen X» deben tomarse con cautela: <strong>ninguna estrategia
            garantiza el éxito</strong>, y el papel de la suerte y el contexto suele estar infravalorado. La propia
            General Electric, modelo a imitar durante décadas, acabó teniendo que trocearse.
          </p>
        </div>

        <div className={styles.eduBloque}>
          <h3 className={styles.eduTitulo}>De la planificación a la adaptación</h3>
          <p className={styles.eduTexto}>
            El cambio de fondo de las últimas décadas es el paso de la <strong>planificación rígida</strong> (diseñar un
            plan perfecto y ejecutarlo) a la <strong>adaptación continua</strong> (lanzar, medir y corregir). No es que
            planificar haya dejado de servir: es que, cuanto más incierto es el entorno, más valor tiene la capacidad de
            aprender rápido frente al plan cerrado. La mayoría de empresas necesitan dosis de ambas cosas.
          </p>
        </div>

        <div className={styles.eduBloque}>
          <h3 className={styles.eduTitulo}>Origen cultural de los marcos</h3>
          <p className={styles.eduTexto}>
            Casi todos los grandes marcos de estrategia nacieron en escuelas de negocio y consultoras estadounidenses,
            pensando en grandes corporaciones. Son muy útiles, pero conviene adaptarlos: una pyme, un autónomo o una
            empresa fuera de ese contexto no siempre se rigen por las mismas reglas. Usa los marcos como punto de
            partida, no como receta universal.
          </p>
        </div>

        <div className={styles.warningBox} role="note">
          <strong>Nota educativa:</strong> los valores numéricos de los visuales (intensidad de fuerzas, anchura del
          foso, niveles de riesgo) son ejemplos simplificados para ilustrar los conceptos, no mediciones de empresas o
          sectores reales. Las referencias a empresas concretas son ilustraciones históricas, no recomendaciones de
          inversión ni juicios sobre su situación actual.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-estrategia-empresarial')} />
      <ShareCard appName="visualizador-estrategia-empresarial" />
      <Footer appName="visualizador-estrategia-empresarial" />
    </div>
  );
}
