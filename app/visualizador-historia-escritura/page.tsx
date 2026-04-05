'use client';

import { useState } from 'react';
import styles from './VisualizadorHistoriaEscritura.module.css';
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

type Seccion = 'oral' | 'sistemas' | 'papel' | 'futuro';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'oral', titulo: 'Antes de escribir', icono: '🎨', subtitulo: 'Tradición oral, cuevas y fichas de arcilla' },
  { id: 'sistemas', titulo: 'Los grandes sistemas', icono: '𒀀', subtitulo: 'Cuneiforme, jeroglíficos, alfabeto' },
  { id: 'papel', titulo: 'La revolución del papel', icono: '📜', subtitulo: 'Del papiro a la imprenta de Gutenberg' },
  { id: 'futuro', titulo: 'El futuro de escribir', icono: '💬', subtitulo: 'Emojis, IA y voz — ¿volvemos al principio?' },
];

// ─────────────────────────────────────────────
// Sección 1: Antes de escribir
// ─────────────────────────────────────────────

interface HitoOral {
  fecha: string;
  titulo: string;
  icono: string;
  descripcion: string;
  detalle: string;
}

const HITOS_ORALES: HitoOral[] = [
  {
    fecha: '~100.000 a.C.',
    titulo: 'Lenguaje hablado',
    icono: '🗣️',
    descripcion: 'Los humanos desarrollan el habla articulada',
    detalle: 'Durante decenas de miles de años, todo el conocimiento se transmitió de boca en boca: historias, leyes, medicina, rutas de caza. Un anciano que moría era como una biblioteca que ardía.',
  },
  {
    fecha: '~40.000 a.C.',
    titulo: 'Pinturas rupestres',
    icono: '🎨',
    descripcion: 'Las cuevas de Altamira, Lascaux, Chauvet',
    detalle: 'Las primeras imágenes no eran arte por placer. Probablemente tenían función ritual, educativa o de marcado territorial. Un bisonte pintado podía significar "aquí hay caza" o formar parte de un rito de iniciación.',
  },
  {
    fecha: '~8.000 a.C.',
    titulo: 'Fichas de arcilla',
    icono: '🔢',
    descripcion: 'Mesopotamia: contar sin escribir',
    detalle: 'Los sumerios usaban pequeñas fichas de arcilla con formas distintas para representar ovejas, medidas de grano o jarras de aceite. Se guardaban en "sobres" de arcilla sellados — los primeros recibos de la historia.',
  },
  {
    fecha: '~3.500 a.C.',
    titulo: 'Tablillas contables',
    icono: '📋',
    descripcion: 'Las marcas en arcilla se vuelven sistema',
    detalle: 'Las fichas evolucionaron: en vez de guardarlas dentro de un sobre, se presionaban contra la arcilla blanda dejando marcas. Así nacieron las primeras tablillas. El motivo no fue la poesía, sino los impuestos y el comercio.',
  },
];

function SeccionOral() {
  const [hitoActivo, setHitoActivo] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Durante más del <strong>95% de la historia humana</strong>, no existió la escritura. Todo lo que sabíamos se transmitía de voz en voz. La escritura nació por una razón muy práctica: <strong>comercio, impuestos y religión</strong>.</p>
      </div>

      <div className={styles.timeline}>
        {HITOS_ORALES.map((h, i) => {
          const activo = hitoActivo === i;
          return (
            <button
              key={h.titulo}
              type="button"
              className={`${styles.timelineCard} ${activo ? styles.timelineCardActivo : ''}`}
              onClick={() => setHitoActivo(activo ? null : i)}
              aria-expanded={activo}
              aria-label={`${h.fecha} — ${h.titulo}`}
            >
              <div className={styles.timelineFecha}>{h.fecha}</div>
              <div className={styles.timelineIcono} aria-hidden="true">{h.icono}</div>
              <div className={styles.timelineTitulo}>{h.titulo}</div>
              <div className={styles.timelineDesc}>{h.descripcion}</div>
              {activo && (
                <div className={styles.timelineDetalle}>{h.detalle}</div>
              )}
            </button>
          );
        })}
      </div>

      <div className={styles.insight}>
        <p>
          <strong>¿Por qué se inventó la escritura?</strong> No fue para escribir poemas ni cartas de amor. Los primeros textos de la historia son listas de inventario: &quot;30 sacos de cebada&quot;, &quot;12 cabezas de ganado&quot;. La escritura nació como herramienta contable — la burocracia es más antigua que la literatura.
        </p>
      </div>

      <div className={styles.preguntaCard}>
        <span className={styles.preguntaIcono} aria-hidden="true">🤔</span>
        <p>Las pinturas rupestres de Altamira (España) tienen <strong>{formatNumber(36000, 0)} años</strong>. Un bisonte pintado con pigmentos naturales ha sobrevivido más que cualquier libro, disco duro o nube digital. ¿Qué dice eso sobre nuestros formatos actuales?</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Los grandes sistemas de escritura
// ─────────────────────────────────────────────

interface SistemaEscritura {
  nombre: string;
  fecha: string;
  lugar: string;
  tipo: string;
  ejemplo: string;
  explicacion: string;
  color: string;
  detalle: string;
  legado: string;
}

const SISTEMAS: SistemaEscritura[] = [
  {
    nombre: 'Cuneiforme',
    fecha: '~3.400 a.C.',
    lugar: 'Sumer (Mesopotamia)',
    tipo: 'Logográfico → silábico',
    ejemplo: '𒀀 𒁀 𒂗 𒄑',
    explicacion: 'Cada signo era una palabra o sílaba, presionada con un cálamo en arcilla húmeda',
    color: '#2E86AB',
    detalle: 'El cuneiforme empezó como pictogramas (dibujos simplificados) y evolucionó hacia marcas en forma de cuña. Lo usaron sumerios, acadios, babilonios y asirios durante 3.000 años. Se han encontrado más de 500.000 tablillas.',
    legado: 'La Epopeya de Gilgamesh, el primer relato literario conocido, está escrita en cuneiforme.',
  },
  {
    nombre: 'Jeroglíficos',
    fecha: '~3.200 a.C.',
    lugar: 'Egipto',
    tipo: 'Logográfico + alfabético',
    ejemplo: '𓀀 𓁐 𓂀 𓃭 𓅃',
    explicacion: 'Combinaban ideogramas (un ojo = "ver") con signos fonéticos (consonantes)',
    color: '#E67E22',
    detalle: 'Los egipcios usaron jeroglíficos durante 3.500 años. No son solo dibujos: incluyen signos fonéticos que representan sonidos. Tras la conquista romana, se olvidó cómo leerlos hasta que Champollion descifró la Piedra de Rosetta en 1822.',
    legado: 'De los jeroglíficos surgieron el hierático y el demótico, que influyeron en el alfabeto copto y, a través de los fenicios, en nuestro abecedario.',
  },
  {
    nombre: 'Caracteres chinos',
    fecha: '~1.200 a.C.',
    lugar: 'China (dinastía Shang)',
    tipo: 'Logográfico',
    ejemplo: '山 水 火 人 大',
    explicacion: 'Cada carácter representa una palabra o concepto. 山 = montaña, 水 = agua',
    color: '#E74C3C',
    detalle: 'Los primeros caracteres aparecen en huesos de oráculo (jiǎgǔwén). Hoy existen más de 50.000 caracteres, aunque para leer un periódico bastan unos 3.000. Es el único sistema antiguo que sigue en uso diario por más de mil millones de personas.',
    legado: 'Los caracteres chinos dieron origen a los sistemas japonés (kanji) y coreano (antes del hangul). El hangul, creado en 1443, es considerado el alfabeto más científicamente diseñado del mundo.',
  },
  {
    nombre: 'Alfabeto fenicio',
    fecha: '~1.050 a.C.',
    lugar: 'Fenicia (Líbano actual)',
    tipo: 'Alfabético (solo consonantes)',
    ejemplo: '𐤀 𐤁 𐤂 𐤃 𐤄',
    explicacion: '22 signos, cada uno un sonido. Sin vocales. La gran simplificación.',
    color: '#48A9A6',
    detalle: 'La revolución fenicia: reducir cientos de signos a solo 22. Cada signo = un sonido consonántico. Los comerciantes fenicios lo extendieron por el Mediterráneo. Era tan fácil que cualquiera podía aprender a escribir, no solo los escribas.',
    legado: 'Fenicio → Griego (añadieron vocales) → Latino → nuestro ABCDE actual. También dio origen al hebreo, árabe y arameo. Casi todos los alfabetos del mundo descienden del fenicio.',
  },
];

function SeccionSistemas() {
  const [sistemaActivo, setSistemaActivo] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La escritura se inventó <strong>al menos 3 veces de forma independiente</strong>: en Mesopotamia, Egipto y China. Del Mediterráneo llegó la idea más revolucionaria: <strong>el alfabeto</strong>, un sistema tan simple que democratizó la lectura.</p>
      </div>

      <div className={styles.sistemasTimeline}>
        {SISTEMAS.map((s, i) => {
          const activo = sistemaActivo === i;
          return (
            <button
              key={s.nombre}
              type="button"
              className={`${styles.sistemaCard} ${activo ? styles.sistemaCardActivo : ''}`}
              onClick={() => setSistemaActivo(activo ? null : i)}
              aria-expanded={activo}
              aria-label={`${s.nombre} — ${s.fecha}`}
              style={{ borderLeftColor: s.color }}
            >
              <div className={styles.sistemaHeader}>
                <div>
                  <span className={styles.sistemaFecha} style={{ color: s.color }}>{s.fecha}</span>
                  <span className={styles.sistemaNombre}>{s.nombre}</span>
                  <span className={styles.sistemaLugar}>{s.lugar}</span>
                </div>
                <span className={styles.sistemaTipo}>{s.tipo}</span>
              </div>
              <div className={styles.sistemaEjemplo}>
                <span className={styles.sistemaChars}>{s.ejemplo}</span>
                <span className={styles.sistemaExplicacion}>{s.explicacion}</span>
              </div>
              {activo && (
                <div className={styles.sistemaDetalle}>
                  <p>{s.detalle}</p>
                  <div className={styles.sistemaLegado}>
                    <strong>Legado:</strong> {s.legado}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className={styles.cadenaAlfabeto}>
        <h3 className={styles.cadenaTitle}>La cadena del alfabeto</h3>
        <div className={styles.cadenaFlow}>
          <span className={styles.cadenaStep} style={{ borderColor: '#48A9A6' }}>Fenicio 𐤀</span>
          <span className={styles.cadenaFlecha} aria-hidden="true">→</span>
          <span className={styles.cadenaStep} style={{ borderColor: '#2E86AB' }}>Griego Α</span>
          <span className={styles.cadenaFlecha} aria-hidden="true">→</span>
          <span className={styles.cadenaStep} style={{ borderColor: '#E67E22' }}>Latino A</span>
          <span className={styles.cadenaFlecha} aria-hidden="true">→</span>
          <span className={styles.cadenaStep} style={{ borderColor: '#E74C3C' }}>Moderno A</span>
        </div>
        <p className={styles.cadenaExplicacion}>La letra A viene de &quot;aleph&quot; (buey en fenicio). Si giras la A 180°, verás la cabeza de un buey con cuernos. Cada letra de nuestro alfabeto tiene una historia así de antigua.</p>
      </div>

      <div className={styles.insight}>
        <p>
          <strong>El alfabeto fue la mayor democratización de la historia.</strong> Los jeroglíficos requerían años de estudio. El cuneiforme tenía cientos de signos. El alfabeto fenicio tenía 22. De repente, un comerciante podía aprender a leer y escribir en semanas. Eso cambió todo: leyes escritas, contratos, literatura popular.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: La revolución del papel
// ─────────────────────────────────────────────

interface MedioEscritura {
  nombre: string;
  fecha: string;
  lugar: string;
  icono: string;
  descripcion: string;
  impacto: string;
  dato: string;
}

const MEDIOS: MedioEscritura[] = [
  {
    nombre: 'Arcilla',
    fecha: '~3.400 a.C.',
    lugar: 'Mesopotamia',
    icono: '🧱',
    descripcion: 'Tablillas de arcilla húmeda marcadas con un cálamo de caña. Se secaban al sol o se cocían en horno.',
    impacto: 'Duradero pero pesado: la biblioteca de Asurbanipal tenía 30.000 tablillas. Mover una biblioteca requería carros de bueyes.',
    dato: 'Algunas tablillas sumerias de 5.000 años se leen perfectamente hoy — mejor conservadas que un CD de hace 20 años.',
  },
  {
    nombre: 'Papiro',
    fecha: '~3.000 a.C.',
    lugar: 'Egipto',
    icono: '📜',
    descripcion: 'Tiras de la planta de papiro prensadas y secadas. Ligero, flexible, enrollable.',
    impacto: 'Permitió documentos más largos y portables. Egipto controló el monopolio del papiro durante siglos — un poder geopolítico real.',
    dato: 'La palabra "papel" viene del latín papyrus. El rollo más largo conocido mide 40 metros (el Papiro Harris I, ~1150 a.C.).',
  },
  {
    nombre: 'Pergamino',
    fecha: '~200 a.C.',
    lugar: 'Pérgamo (Turquía)',
    icono: '🐑',
    descripcion: 'Piel de animal (oveja, cabra, ternera) tratada y pulida. Se podía escribir por ambos lados.',
    impacto: 'Más resistente que el papiro. Permitió el códice (libro con páginas) que reemplazó al rollo. Se podía borrar y reutilizar (palimpsesto).',
    dato: 'Producir una Biblia en pergamino requería la piel de ~250 ovejas. Un libro era literalmente un rebaño.',
  },
  {
    nombre: 'Papel',
    fecha: '105 d.C.',
    lugar: 'China → mundo islámico → Europa',
    icono: '📄',
    descripcion: 'Cai Lun perfeccionó la técnica: fibras vegetales machacadas, prensadas y secadas. Barato y escalable.',
    impacto: 'Tardó 1.000 años en llegar a Europa (vía mundo islámico, 711). Sin papel barato, la imprenta de Gutenberg no habría tenido sentido.',
    dato: 'Los árabes aprendieron el secreto del papel de prisioneros chinos en la Batalla de Talas (751). El conocimiento viajó de Samarcanda a Bagdad, Córdoba y finalmente Italia.',
  },
  {
    nombre: 'Imprenta de Gutenberg',
    fecha: '~1.440',
    lugar: 'Maguncia, Alemania',
    icono: '🖨️',
    descripcion: 'Tipos móviles de metal + prensa de tornillo. Cada letra era una pieza reutilizable.',
    impacto: 'Antes de Gutenberg: copiar un libro costaba meses de trabajo manual. Después: cientos de copias en días. En 50 años se imprimieron más libros que en los 1.000 años anteriores.',
    dato: 'La Biblia de Gutenberg (~1455) tiraba 180 copias. Hoy sobreviven 49. Cada una vale unos 25-35 millones de euros.',
  },
  {
    nombre: 'Máquina de escribir',
    fecha: '1868',
    lugar: 'EE.UU.',
    icono: '⌨️',
    descripcion: 'Christopher Latham Sholes patentó la primera máquina comercial. El teclado QWERTY se diseñó para evitar que las barras se atasquen.',
    impacto: 'Democratizó la escritura profesional. Abrió puertas a las mujeres en el mundo laboral: ser "mecanógrafa" fue una de las primeras profesiones femeninas aceptadas.',
    dato: 'El teclado QWERTY (1873) se diseñó para máquinas mecánicas. 150 años después, seguimos usándolo en smartphones — un legado accidental.',
  },
  {
    nombre: 'Era digital',
    fecha: 'Años 70',
    lugar: 'Global',
    icono: '💻',
    descripcion: 'Del procesador de texto al correo electrónico, de los SMS a las redes sociales.',
    impacto: 'Por primera vez en la historia, cualquier persona puede publicar texto que llegue a millones. Escribimos más que nunca: se envían 300.000 millones de emails al día.',
    dato: 'En 2025 se generan más datos escritos en un día que en toda la historia humana antes de la era digital.',
  },
];

function SeccionPapel() {
  const [medioActivo, setMedioActivo] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La escritura no es solo signos — es también el <strong>soporte</strong> donde se escribe. Cada nuevo material cambió quién podía escribir, cuánto se conservaba y cómo se difundía el conocimiento.</p>
      </div>

      <div className={styles.mediosTimeline}>
        {MEDIOS.map((m, i) => {
          const activo = medioActivo === i;
          return (
            <button
              key={m.nombre}
              type="button"
              className={`${styles.medioCard} ${activo ? styles.medioCardActivo : ''}`}
              onClick={() => setMedioActivo(activo ? null : i)}
              aria-expanded={activo}
              aria-label={`${m.nombre} — ${m.fecha}`}
            >
              <div className={styles.medioHeader}>
                <span className={styles.medioIcono} aria-hidden="true">{m.icono}</span>
                <div>
                  <span className={styles.medioNombre}>{m.nombre}</span>
                  <span className={styles.medioFecha}>{m.fecha} · {m.lugar}</span>
                </div>
              </div>
              <p className={styles.medioDesc}>{m.descripcion}</p>
              {activo && (
                <div className={styles.medioDetalle}>
                  <p className={styles.medioImpacto}><strong>Impacto:</strong> {m.impacto}</p>
                  <div className={styles.medioDato}>
                    <span className={styles.medioDatoIcono} aria-hidden="true">💡</span>
                    {m.dato}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className={styles.velocidadBox}>
        <h3 className={styles.velocidadTitle}>Velocidad de copia: antes y después de Gutenberg</h3>
        <div className={styles.velocidadComparacion}>
          <div className={styles.velocidadItem}>
            <span className={styles.velocidadLabel}>Monje copista (1400)</span>
            <div className={styles.velocidadBarra}>
              <div className={styles.velocidadFill} style={{ width: '3%', background: '#E74C3C' }} />
            </div>
            <span className={styles.velocidadValor}>~1 página/día</span>
          </div>
          <div className={styles.velocidadItem}>
            <span className={styles.velocidadLabel}>Imprenta Gutenberg (1455)</span>
            <div className={styles.velocidadBarra}>
              <div className={styles.velocidadFill} style={{ width: '40%', background: '#E67E22' }} />
            </div>
            <span className={styles.velocidadValor}>~{formatNumber(3600, 0)} páginas/día</span>
          </div>
          <div className={styles.velocidadItem}>
            <span className={styles.velocidadLabel}>Imprenta industrial (1900)</span>
            <div className={styles.velocidadBarra}>
              <div className={styles.velocidadFill} style={{ width: '75%', background: '#48A9A6' }} />
            </div>
            <span className={styles.velocidadValor}>~{formatNumber(100000, 0)} páginas/día</span>
          </div>
          <div className={styles.velocidadItem}>
            <span className={styles.velocidadLabel}>Digital (2025)</span>
            <div className={styles.velocidadBarra}>
              <div className={styles.velocidadFill} style={{ width: '100%', background: '#2E86AB' }} />
            </div>
            <span className={styles.velocidadValor}>∞ copias/segundo</span>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          <strong>Cada salto de soporte multiplicó quién podía leer.</strong> Con arcilla, solo los escribas del templo. Con papiro, la élite educada. Con pergamino, los monasterios. Con papel e imprenta, la clase media. Con internet, cualquiera con un móvil.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: El futuro de escribir
// ─────────────────────────────────────────────

interface TendenciaFuturo {
  titulo: string;
  icono: string;
  descripcion: string;
  dato: string;
  reflexion: string;
}

const TENDENCIAS: TendenciaFuturo[] = [
  {
    titulo: 'SMS y abreviaturas',
    icono: '📱',
    descripcion: 'Los mensajes de texto reinventaron la escritura informal. "xq", "tb", "tq" — un nuevo código entre generaciones.',
    dato: 'Los lingüistas no lo ven como degradación del idioma, sino como un registro más: los jóvenes que usan abreviaturas en WhatsApp escriben formalmente cuando lo necesitan.',
    reflexion: 'Es lo mismo que ocurrió con el latín vulgar: la lengua hablada evolucionaba mientras los textos formales se mantenían en latín clásico.',
  },
  {
    titulo: 'Emojis: ¿nuevos jeroglíficos?',
    icono: '😀',
    descripcion: 'Más de 3.600 emojis en Unicode 15. Se usan en todos los idiomas del mundo. Un lenguaje visual universal.',
    dato: 'En 2015, 😂 (cara con lágrimas de risa) fue la "Palabra del Año" del Oxford Dictionary. Hay quien ha traducido Moby Dick enteramente a emojis ("Emoji Dick", aprobado por la Biblioteca del Congreso de EE.UU.).',
    reflexion: '¿Son los emojis un retorno a los pictogramas? Como los jeroglíficos, combinan lo visual con lo fonético (🐝 + 🍺 = "be beer" en inglés). Quizá estamos cerrando un círculo de 5.000 años.',
  },
  {
    titulo: 'Texto generado por IA',
    icono: '🤖',
    descripcion: 'Los modelos de lenguaje generan texto indistinguible del humano. GPT, Claude, Gemini escriben artículos, código, poesía.',
    dato: 'Se estima que en 2025 más del 10% del contenido web nuevo está generado o asistido por IA. En algunas categorías (descripciones de producto, resúmenes) supera el 50%.',
    reflexion: 'Por primera vez desde los escribas sumerios, la autoría se separa del esfuerzo manual. ¿Cambiará eso lo que consideramos "saber escribir"?',
  },
  {
    titulo: 'Voz a texto',
    icono: '🎤',
    descripcion: 'Dictado por voz, asistentes virtuales, audios de WhatsApp. La voz vuelve a ganar terreno sobre la escritura.',
    dato: 'Los mensajes de voz representan ya más del 30% de los mensajes en WhatsApp en España. Los jóvenes en China usan WeChat casi exclusivamente por voz.',
    reflexion: 'Empezamos con tradición oral, inventamos la escritura, y ahora volvemos a hablar. Pero con una diferencia: hoy la voz se transcribe automáticamente a texto. Lo oral y lo escrito se funden.',
  },
];

interface ComparacionVisual {
  antiguo: string;
  moderno: string;
  significado: string;
}

const COMPARACIONES: ComparacionVisual[] = [
  { antiguo: '𓁿', moderno: '👁️', significado: 'Ojo / Ver' },
  { antiguo: '𓇳', moderno: '☀️', significado: 'Sol / Día' },
  { antiguo: '𓃭', moderno: '🐆', significado: 'Animal / Fiera' },
  { antiguo: '𓂋', moderno: '👄', significado: 'Boca / Hablar' },
  { antiguo: '𓈖', moderno: '🌊', significado: 'Agua' },
  { antiguo: '𓉐', moderno: '🏠', significado: 'Casa' },
];

function SeccionFuturo() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Escribimos más que nunca, pero <strong>cómo</strong> escribimos está cambiando radicalmente. Abreviaturas, emojis, dictado por voz, IA... ¿Estamos volviendo al principio?</p>
      </div>

      <div className={styles.tendenciasGrid}>
        {TENDENCIAS.map((t) => (
          <div key={t.titulo} className={styles.tendenciaCard}>
            <div className={styles.tendenciaHeader}>
              <span className={styles.tendenciaIcono} aria-hidden="true">{t.icono}</span>
              <span className={styles.tendenciaTitulo}>{t.titulo}</span>
            </div>
            <p className={styles.tendenciaDesc}>{t.descripcion}</p>
            <div className={styles.tendenciaDato}>
              <span className={styles.tendenciaDatoIcono} aria-hidden="true">📊</span>
              {t.dato}
            </div>
            <div className={styles.tendenciaReflexion}>
              <span className={styles.tendenciaReflexionIcono} aria-hidden="true">💭</span>
              {t.reflexion}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.comparacionBox}>
        <h3 className={styles.comparacionTitle}>Jeroglíficos vs. Emojis — ¿Mismo concepto?</h3>
        <div className={styles.comparacionGrid}>
          {COMPARACIONES.map((c) => (
            <div key={c.significado} className={styles.comparacionItem}>
              <span className={styles.comparacionAntiguo}>{c.antiguo}</span>
              <span className={styles.comparacionFlecha} aria-hidden="true">↔</span>
              <span className={styles.comparacionModerno}>{c.moderno}</span>
              <span className={styles.comparacionSignificado}>{c.significado}</span>
            </div>
          ))}
        </div>
        <p className={styles.comparacionNota}>5.000 años de diferencia, la misma idea: representar conceptos con imágenes.</p>
      </div>

      <div className={styles.insight}>
        <p>
          <strong>La historia de la escritura no es una línea recta, es un ciclo.</strong> Pictogramas → escritura abstracta → alfabeto → vuelta a lo visual (emojis). La diferencia es que hoy combinamos todo: texto, imagen, voz, video y código en el mismo mensaje. Nunca en la historia la humanidad ha tenido tantas formas de expresarse por escrito.
        </p>
      </div>

      <div className={styles.preguntaCard}>
        <span className={styles.preguntaIcono} aria-hidden="true">🤔</span>
        <p>En {formatNumber(40000, 0)} años hemos pasado de dibujar bisontes en cuevas a enviar 😂 por WhatsApp. En ambos casos, el impulso es el mismo: <strong>dejar una marca que sobreviva al momento</strong>. ¿Qué sobrevivirá de lo que escribimos hoy?</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorHistoriaEscrituraPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('oral');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'oral': return <SeccionOral />;
      case 'sistemas': return <SeccionSistemas />;
      case 'papel': return <SeccionPapel />;
      case 'futuro': return <SeccionFuturo />;
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
          <h1 className={styles.title}>La Evolución de la Escritura</h1>
          <p className={styles.subtitle}>De las cuevas al emoji — {formatNumber(40000, 0)} años contando historias</p>
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
          title="La escritura, explicada"
          subtitle="Conceptos clave para entender esta historia"
          defaultOpen={false}
        >
          <h3>¿Cuántas veces se inventó la escritura?</h3>
          <p>
            Al menos tres veces de forma completamente independiente: en Mesopotamia (~3.400 a.C.),
            Egipto (~3.200 a.C.) y China (~1.200 a.C.). La escritura mesoamericana (olmeca/maya)
            podría ser una cuarta invención independiente. Esto sugiere que la escritura no fue un
            accidente, sino una necesidad que surge cuando una sociedad alcanza cierto nivel de
            complejidad económica y administrativa.
          </p>

          <h3>¿Qué diferencia hay entre un alfabeto y un silabario?</h3>
          <p>
            Un <strong>alfabeto</strong> asigna un signo a cada sonido individual (a, b, c...).
            Un <strong>silabario</strong> asigna un signo a cada sílaba (ka, ke, ki, ko, ku...).
            Un <strong>sistema logográfico</strong> asigna un signo a cada palabra o concepto.
            El alfabeto es el más eficiente: con 26-30 signos se puede escribir cualquier palabra.
            El chino necesita miles de caracteres, pero cada uno transmite significado directamente,
            lo que permite leer sin conocer la pronunciación.
          </p>

          <h3>¿Por qué Gutenberg cambió el mundo?</h3>
          <p>
            Antes de la imprenta, copiar un libro costaba meses de trabajo manual. Un libro valía tanto
            como una casa. Gutenberg no inventó la imprenta (China la tenía desde el siglo XI), sino
            los <strong>tipos móviles de metal</strong>: letras individuales reutilizables que se
            componían en páginas. Esto hizo que copiar un libro pasara de meses a días. En 50 años
            (1450-1500) se imprimieron más de 20 millones de volúmenes — más que en los 1.000 años anteriores.
          </p>

          <h3>¿Los emojis son un retroceso?</h3>
          <p>
            Los lingüistas no lo ven así. Los emojis no reemplazan al texto, lo complementan: añaden
            tono, emoción y contexto que las palabras escritas no transmiten (como los gestos faciales
            en la conversación). Funcionan como una capa <strong>paralingüística</strong>. Dicho esto,
            hay un paralelismo fascinante: como los pictogramas sumerios, los emojis son universalmente
            comprensibles sin importar el idioma del lector.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> las fechas y cifras son aproximadas y basadas en el consenso
            académico actual. La investigación arqueológica actualiza continuamente estos datos.
            Las fechas de invención de la escritura son especialmente debatidas.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-historia-escritura')} />
        <ShareCard appName="visualizador-historia-escritura" />
        <Footer appName="visualizador-historia-escritura" />
      </div>
    </>
  );
}
