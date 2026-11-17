'use client';
// @disclaimer: exempt

import { useState } from 'react';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import styles from './GuiaMetricaEstrofas.module.css';

type TabId = 'reglas' | 'versos' | 'rima' | 'estrofas' | 'formas';

// ──────────────────────────────────────────────
// Algoritmo de cuenta silábica (orientativo)
// ──────────────────────────────────────────────
const VOCALES = 'aeiouáéíóúüï';
const DEBILES = 'iuüï';
const DEBILES_ACENT = 'íú';
/** Letras que se conservan al limpiar una palabra (las vocales con diéresis incluidas) */
const NO_LETRA = /[^a-záéíóúüïñ]/g;

function esVocal(c: string): boolean {
  return VOCALES.includes(c.toLowerCase());
}

/**
 * Diptongo entre dos vocales contiguas: una de ellas es cerrada y átona. La diéresis poética
 * (`süave`, `rüido`, `dïamante`) marca justo lo contrario, un hiato (hallazgo 4982); la de
 * «güe», «güi» (`pingüino`) solo dice que la «u» suena, y sí forma diptongo.
 */
function esDiptongo(v1: string, v2: string, dieresisPoetica: boolean): boolean {
  if (dieresisPoetica) return false;
  const d1 = DEBILES.includes(v1) && !DEBILES_ACENT.includes(v1);
  const d2 = DEBILES.includes(v2) && !DEBILES_ACENT.includes(v2);
  return d1 || d2;
}

function silabasPalabra(palabra: string): number {
  const limpia = palabra.toLowerCase().replace(NO_LETRA, '');
  let count = 0;
  // Vocal anterior del mismo grupo (vocales seguidas), para decidir si la siguiente abre sílaba
  let anterior: { v: string; poetica: boolean } | null = null;
  for (let i = 0; i < limpia.length; i++) {
    const c = limpia[i];
    const previa = limpia[i - 1] ?? '';
    const siguiente = limpia[i + 1] ?? '';
    // La «u» de «qu», y la de «gu» ante e/i, no suena: no es núcleo (hallazgo 4978)
    const uMuda = c === 'u' && (previa === 'q' || (previa === 'g' && 'eiéí'.includes(siguiente)));
    if (!esVocal(c) || uMuda) {
      anterior = null;
      continue;
    }
    const poetica = (c === 'ü' && previa !== 'g') || c === 'ï';
    if (anterior && esDiptongo(anterior.v, c, anterior.poetica || poetica)) {
      // Mismo núcleo silábico (diptongo, o triptongo si ya venía de uno)
    } else {
      count++;
    }
    anterior = { v: c, poetica };
  }
  return Math.max(count, 1);
}

function acento(palabra: string): 'aguda' | 'llana' | 'esdrujula' {
  const limpia = palabra.toLowerCase().replace(NO_LETRA, '');
  const posAcent = limpia.search(/[áéíóú]/);
  if (posAcent >= 0) {
    const sylTotal = silabasPalabra(limpia);
    const sylHasta = silabasPalabra(limpia.substring(0, posAcent + 1));
    const tras = sylTotal - sylHasta;
    if (tras === 0) return 'aguda';
    if (tras === 1) return 'llana';
    return 'esdrujula';
  }
  // Un monosílabo al final del verso es tónico: el verso es agudo (hallazgo 4981)
  if (silabasPalabra(limpia) === 1) return 'aguda';
  const ult = limpia.slice(-1);
  return (esVocal(ult) || ult === 'n' || ult === 's') ? 'llana' : 'aguda';
}

/**
 * ¿Termina la palabra en sonido vocálico? Vale también la «y» final (`hoy`, `muy`, la
 * conjunción «y»), que suena /i/ y entra en la sinalefa (hallazgo 4979).
 */
function terminaEnVocal(p: string): boolean {
  const ult = p.slice(-1);
  return esVocal(ult) || ult === 'y';
}

/** ¿Empieza en sonido vocálico? La conjunción «y» sí; «yo», «ya»… no: ahí la «y» es consonante. */
function empiezaEnVocal(p: string): boolean {
  return esVocal(p[0]) || p === 'y';
}

interface ConteoResultado {
  silabas: number;
  sinalefas: number;
  tipoVerso: string;
  acentoFinal: string;
}

/** Sin ninguna palabra con letras no hay verso que medir: devuelve null (hallazgo 4996). */
function contarVerso(verso: string): ConteoResultado | null {
  const palabras = verso.trim().split(/\s+/).filter((p) => p.toLowerCase().replace(NO_LETRA, '').length > 0);
  if (!palabras.length) return null;

  let total = palabras.reduce((s, p) => s + silabasPalabra(p), 0);
  let sinalefas = 0;

  for (let i = 0; i < palabras.length - 1; i++) {
    const p1 = palabras[i].toLowerCase().replace(NO_LETRA, '');
    const p2 = palabras[i + 1].toLowerCase().replace(NO_LETRA, '').replace(/^h+/, '');
    if (p1 && p2 && terminaEnVocal(p1) && empiezaEnVocal(p2)) {
      total--;
      sinalefas++;
    }
  }

  const acentoUlt = acento(palabras[palabras.length - 1]);
  if (acentoUlt === 'aguda') total++;
  if (acentoUlt === 'esdrujula') total--;

  const nombres: Record<number, string> = {
    4: 'tetrasílabo', 5: 'pentasílabo', 6: 'hexasílabo', 7: 'heptasílabo',
    8: 'octosílabo', 9: 'eneasílabo', 10: 'decasílabo', 11: 'endecasílabo',
    12: 'dodecasílabo', 14: 'alejandrino',
  };
  const acentoLabel = { aguda: 'aguda (+1)', llana: 'llana (sin ajuste)', esdrujula: 'esdrújula (−1)' };

  return {
    silabas: total,
    sinalefas,
    tipoVerso: nombres[total] ?? (total <= 8 ? `${total} sílabas (arte menor)` : `${total} sílabas (arte mayor)`),
    acentoFinal: acentoLabel[acentoUlt],
  };
}

// ──────────────────────────────────────────────
// Datos de referencia
// ──────────────────────────────────────────────
interface TipoVerso {
  silabas: number;
  nombre: string;
  arte: 'menor' | 'mayor';
  descripcion: string;
  ejemplo: { verso: string; autor: string; obra: string };
}

const TIPOS_VERSO: TipoVerso[] = [
  { silabas: 5, nombre: 'Pentasílabo', arte: 'menor', descripcion: 'Poco frecuente solo; aparece en combinación con otros versos, sobre todo en la lírica popular, y en los versos primero y tercero del haiku adaptado al español.', ejemplo: { verso: 'Un viejo estanque', autor: 'Matsuo Bashō', obra: 'El estanque (traducción)' } },
  { silabas: 6, nombre: 'Hexasílabo', arte: 'menor', descripcion: 'Verso de cadencia ágil, muy usado en la lírica popular, en las serranillas medievales y en combinación con heptasílabos.', ejemplo: { verso: 'Moza tan fermosa', autor: 'Marqués de Santillana', obra: 'Serranilla de la Finojosa' } },
  { silabas: 7, nombre: 'Heptasílabo', arte: 'menor', descripcion: 'Uno de los versos de arte menor más usados en la poesía culta. Pieza clave de la lira (combinado con endecasílabos) y de la silva. Muy musical.', ejemplo: { verso: 'Si de mi baja lira', autor: 'Garcilaso de la Vega', obra: 'Canción V' } },
  { silabas: 8, nombre: 'Octosílabo', arte: 'menor', descripcion: 'El verso rey de la poesía popular española. Base del romance, la redondilla y la décima. Ritmo natural del castellano.', ejemplo: { verso: 'Por las ramas del laurel', autor: 'Federico García Lorca', obra: 'Romance sonámbulo' } },
  { silabas: 9, nombre: 'Eneasílabo', arte: 'mayor', descripcion: 'Verso relativamente infrecuente en la tradición clásica, más habitual en el Romanticismo y el Modernismo.', ejemplo: { verso: 'Juventud, divino tesoro', autor: 'Rubén Darío', obra: 'Canción de otoño en primavera' } },
  { silabas: 10, nombre: 'Decasílabo', arte: 'mayor', descripcion: 'Aparece en la épica medieval y renace en el Modernismo. Se divide en dos hemistiquios de 4+6 o variantes.', ejemplo: { verso: 'Hemos perdido aun este crepúsculo', autor: 'Pablo Neruda', obra: 'Poema XX' } },
  { silabas: 11, nombre: 'Endecasílabo', arte: 'mayor', descripcion: 'El verso culto por excelencia del castellano. Base del soneto, la lira, la octava real y la silva. Introducido por Garcilaso en el siglo XVI desde Italia.', ejemplo: { verso: 'Yo no nací sino para quereros', autor: 'Garcilaso de la Vega', obra: 'Soneto V' } },
  { silabas: 14, nombre: 'Alejandrino', arte: 'mayor', descripcion: 'Verso de 14 sílabas dividido en dos hemistiquios de 7 (7+7). Protagonista del Modernismo hispanoamericano. Rubén Darío lo popularizó en castellano.', ejemplo: { verso: 'La princesa está triste… ¿qué tendrá la princesa?', autor: 'Rubén Darío', obra: 'Sonatina' } },
];

interface Estrofa {
  nombre: string;
  versos: number;
  esquema: string;
  medida: string;
  descripcion: string;
  ejemplo: { lineas: string[]; autor: string; obra: string };
}

const ESTROFAS: Estrofa[] = [
  {
    nombre: 'Pareado',
    versos: 2,
    esquema: 'AA / aa',
    medida: 'Arte mayor o menor',
    descripcion: 'La estrofa más simple: dos versos que riman entre sí. Base de refranes y coplas populares.',
    ejemplo: { lineas: ['Del dicho al hecho', 'hay mucho trecho.'], autor: 'Anónimo', obra: 'Refrán popular' },
  },
  {
    nombre: 'Terceto',
    versos: 3,
    esquema: 'ABA / BCB / CDC…',
    medida: 'Endecasílabos',
    descripcion: 'Tres endecasílabos encadenados. La terza rima de Dante. En castellano, los tercetos encadenados se usan en elegías y poemas filosóficos.',
    ejemplo: { lineas: ['Estas que me dictó rimas sonoras,', 'culta sí, aunque bucólica, Talía', '—¡oh excelso Conde!—, en las purpúreas horas'], autor: 'Luis de Góngora', obra: 'Soledades' },
  },
  {
    nombre: 'Redondilla',
    versos: 4,
    esquema: 'abba',
    medida: 'Octosílabos',
    descripcion: 'Cuatro octosílabos con rima abrazada (abba). Una de las estrofas más características de la poesía castellana. Usada por Lope, Calderón y Sor Juana.',
    ejemplo: { lineas: ['Hombres necios que acusáis', 'a la mujer sin razón,', 'sin ver que sois la ocasión', 'de lo mismo que culpáis.'], autor: 'Sor Juana Inés de la Cruz', obra: 'Redondillas' },
  },
  {
    nombre: 'Cuarteto',
    versos: 4,
    esquema: 'ABBA',
    medida: 'Endecasílabos',
    descripcion: 'Cuatro endecasílabos con rima abrazada. Base de los dos primeros cuartetos del soneto. Verso de mayor solemnidad que la redondilla.',
    ejemplo: { lineas: ['Cerrar podrá mis ojos la postrera', 'sombra que me llevare el blanco día,', 'y podrá desatar esta alma mía', 'hora a su afán ansioso lisonjera;'], autor: 'Francisco de Quevedo', obra: 'Amor constante más allá de la muerte' },
  },
  {
    nombre: 'Serventesio',
    versos: 4,
    esquema: 'ABAB',
    medida: 'Arte mayor',
    descripcion: 'Cuatro versos de arte mayor con rima alterna (encadenada). El más habitual es el endecasílabo, pero también se escribe con otros versos de arte mayor, como los eneasílabos del ejemplo de Darío. Más dinámico que el cuarteto; frecuente en el Romanticismo y el Modernismo.',
    ejemplo: { lineas: ['Juventud, divino tesoro,', '¡ya te vas para no volver!', 'Cuando quiero llorar, no lloro...', 'y a veces lloro sin querer.'], autor: 'Rubén Darío', obra: 'Canción de otoño en primavera' },
  },
  {
    nombre: 'Décima / Espinela',
    versos: 10,
    esquema: 'abbaaccddc',
    medida: 'Octosílabos',
    descripcion: 'Diez octosílabos con el esquema abbaaccddc. La pausa obligatoria después del cuarto verso (el "puente") la distingue de otras estrofas de diez. Vive con enorme vitalidad en la poesía oral latinoamericana.',
    ejemplo: { lineas: ['Cuentan de un sabio que un día', 'tan pobre y mísero estaba,', 'que sólo se sustentaba', 'de unas hierbas que cogía.', '¿Habrá otro, entre sí decía,', 'más pobre y triste que yo?', 'Y cuando el rostro volvió', 'halló la respuesta, viendo', 'que otro sabio iba cogiendo', 'las hierbas que él arrojó.'], autor: 'Calderón de la Barca', obra: 'La vida es sueño' },
  },
  {
    nombre: 'Romance',
    versos: 0,
    esquema: '_ a _ a _ a…',
    medida: 'Octosílabos',
    descripcion: 'Serie indefinida de octosílabos. Riman en asonancia los versos pares; los impares quedan libres. Es la forma narrativa popular por excelencia del castellano.',
    ejemplo: { lineas: ['Verde que te quiero verde.', 'Verde viento. Verdes ramas.', 'El barco sobre la mar', 'y el caballo en la montaña.'], autor: 'Federico García Lorca', obra: 'Romance sonámbulo' },
  },
  {
    nombre: 'Soneto',
    versos: 14,
    esquema: 'ABBA ABBA / CDC DCD',
    medida: 'Endecasílabos',
    descripcion: 'Catorce endecasílabos: dos cuartetos (ABBA ABBA) y dos tercetos (CDC DCD o variantes). La forma poética más estudiada de la tradición occidental. La vuelta (los tercetos) suele resolver o contrastar lo planteado en los cuartetos.',
    ejemplo: { lineas: ['Cerrar podrá mis ojos la postrera', 'sombra que me llevare el blanco día,', 'y podrá desatar esta alma mía', 'hora a su afán ansioso lisonjera;', 'mas no de esotra parte en la ribera', 'dejará la memoria, en donde ardía:', 'nadar sabe mi llama la agua fría,', 'y perder el respeto a ley severa.', 'Alma a quien todo un dios prisión ha sido,', 'venas que humor a tanto fuego han dado,', 'médulas que han gloriosamente ardido,', 'su cuerpo dejará, no su cuidado;', 'serán ceniza, mas tendrá sentido;', 'polvo serán, mas polvo enamorado.'], autor: 'Francisco de Quevedo', obra: 'Amor constante más allá de la muerte' },
  },
];

interface FormaPoética {
  nombre: string;
  icono: string;
  descripcion: string;
  estructura: string;
  historia: string;
  ejemplo: { lineas: string[]; titulo: string; autor: string };
}

const FORMAS: FormaPoética[] = [
  {
    nombre: 'Lira',
    icono: '🎶',
    descripcion: 'Estrofa de cinco versos con esquema 7a 11B 7a 7b 11B. El nombre viene del primer poema de Garcilaso que la usó: "Si de mi baja lira".',
    estructura: '7a · 11B · 7a · 7b · 11B (heptasílabos y endecasílabos)',
    historia: 'Introducida por Garcilaso desde la forma italiana del "canzone". San Juan de la Cruz la usó en sus grandes poemas místicos. Fray Luis de León la adoptó para sus odas.',
    ejemplo: { lineas: ['Si de mi baja lira', 'tanto pudiese el son, que en un momento', 'aplacase la ira', 'del animoso viento', 'y la furia del mar y el movimiento;'], titulo: 'Canción V', autor: 'Garcilaso de la Vega' },
  },
  {
    nombre: 'Haiku',
    icono: '🌸',
    descripcion: 'Poema de tres versos con 5, 7 y 5 sílabas. Originario de Japón. En su adaptación al español se mantiene el recuento silábico fonético. Capta un instante concreto, generalmente de la naturaleza.',
    estructura: '5 sílabas · 7 sílabas · 5 sílabas',
    historia: 'Forma desarrollada por Matsuo Bashō en el siglo XVII. Introducida en la poesía en español por los modernistas a través de las traducciones. Hoy es una de las formas más practicadas en los talleres de escritura en lengua española.',
    ejemplo: { lineas: ['Un viejo estanque,', 'salta una rana —ruido', 'del agua oscura.'], titulo: 'El estanque (traducción)', autor: 'Matsuo Bashō' },
  },
  {
    nombre: 'Octava Real',
    icono: '👑',
    descripcion: 'Ocho endecasílabos con esquema ABABABCC. Los dos últimos forman un pareado de cierre. Fue la estrofa de la épica culta renacentista y barroca.',
    estructura: 'ABABAB + CC (ocho endecasílabos)',
    historia: 'Importada del italiano por Garcilaso y Boscán. Usada por Ercilla en La Araucana, por Ariosto en Orlando Furioso y por Torquato Tasso. El pareado final la distingue de la ottava y le da un remate sentencioso.',
    ejemplo: { lineas: ['Las armas y el furor del pecho airado', 'que al cielo con su fuerza puso en duda', 'y a la terrible diosa que ha negado', 'su vengativa cólera sañuda,', 'el nuevo ardor del mozo arrebatado', 'que al reino puso en áspera congoja,', 'canto, Señor, en tu servicio solo,', 'bajo el amparo tuyo y tu vitola.'], titulo: 'La Araucana (adaptado)', autor: 'Alonso de Ercilla' },
  },
  {
    nombre: 'Silva',
    icono: '🌿',
    descripcion: 'Combinación libre de endecasílabos y heptasílabos sin esquema de rima fijo. Cada poeta decide cuántos versos quedan sin rima y cómo distribuye las consonancias.',
    estructura: 'Endecasílabos (11) y heptasílabos (7) en combinación libre',
    historia: 'La silva permitió una libertad formal desconocida hasta entonces. Góngora la usó en las Soledades llevándola a extremos barrocos. En el XVIII y XIX se convirtió en el vehículo de la poesía filosófica y descriptiva.',
    ejemplo: { lineas: ['Era del año la estación florida', 'en que el mentido robador de Europa', '—media luna las armas de su frente,', 'y el Sol todos los rayos de su pelo—,', 'luciente honor del cielo,', 'en campos de zafiro pace estrellas;'], titulo: 'Soledades', autor: 'Luis de Góngora' },
  },
];

const TABS: { id: TabId; icono: string; titulo: string }[] = [
  { id: 'reglas', icono: '✍️', titulo: 'Reglas y contador' },
  { id: 'versos', icono: '📏', titulo: 'Tipos de verso' },
  { id: 'rima', icono: '🎵', titulo: 'Rima' },
  { id: 'estrofas', icono: '🏛️', titulo: 'Estrofas' },
  { id: 'formas', icono: '📜', titulo: 'Formas poéticas' },
];

export default function GuiaMetricaEstrofasPage() {
  const [tab, setTab] = useState<TabId>('reglas');
  const [verso, setVerso] = useState('');
  const [estrofaAbierta, setEstrofaAbierta] = useState<string | null>(null);

  const resultado = verso.trim() ? contarVerso(verso) : null;
  const sinPalabras = verso.trim() !== '' && resultado === null;

  const EJEMPLOS_CONTADOR = [
    'Yo no nací sino para quereros',
    'Por las ramas del laurel',
    'Si de mi baja lira',
    'La princesa está triste, ¿qué tendrá la princesa?',
    'Del salón en el ángulo oscuro',
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Métrica y Estrofas</h1>
        <p className={styles.heroSubtitle}>
          Las reglas del verso en español: cómo contar sílabas, tipos de verso,
          rima y las grandes estrofas de la poesía clásica.
        </p>
      </header>

      <LegalNotice />

      <nav className={styles.tabsNav} role="tablist" aria-label="Secciones de métrica">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${styles.tabBtn} ${tab === t.id ? styles.tabBtnActive : ''}`}
            onClick={() => setTab(t.id)}
            role="tab"
            id={`pestana-${t.id}`}
            aria-controls="panel-metrica"
            aria-selected={tab === t.id}
          >
            <span aria-hidden="true">{t.icono}</span>
            <span className={styles.tabNombre}>{t.titulo}</span>
          </button>
        ))}
      </nav>

      <div className={styles.tabContent} role="tabpanel" id="panel-metrica" aria-labelledby={`pestana-${tab}`}>

        {/* ── TAB 1: Reglas y contador ── */}
        {tab === 'reglas' && (
          <>
            {/* Contador interactivo */}
            <div className={styles.contadorBox}>
              <h2 className={styles.contadorTitulo}>Contador de sílabas</h2>
              <input
                type="text"
                className={styles.contadorInput}
                value={verso}
                onChange={(e) => setVerso(e.target.value)}
                placeholder="Escribe un verso aquí…"
                aria-label="Verso para contar sílabas"
              />
              <div className={styles.contadorEjemplos}>
                {EJEMPLOS_CONTADOR.map((ej) => (
                  <button key={ej} type="button" className={styles.contadorEjBtn} onClick={() => setVerso(ej)}>
                    {ej}
                  </button>
                ))}
              </div>
              {resultado && (
                <div className={styles.contadorResultado}>
                  <div className={styles.contadorNumero}>{resultado.silabas}</div>
                  <div className={styles.contadorTipoVerso}>{resultado.tipoVerso}</div>
                  <div className={styles.contadorDetalles}>
                    {resultado.sinalefas > 0 && (
                      <span className={styles.contadorBadge}>
                        {resultado.sinalefas} sinalefa<span>{resultado.sinalefas > 1 ? 's' : ''}</span>
                      </span>
                    )}
                    <span className={styles.contadorBadge}>Última palabra: {resultado.acentoFinal}</span>
                  </div>
                </div>
              )}
              <p className={styles.contadorNota} aria-live="polite">
                <span>{sinPalabras ? 'No hay ninguna palabra que medir: escribe un verso con letras.' : ''}</span>
              </p>
              <p className={styles.contadorNota}>
                Resultado orientativo. La métrica literaria requiere conocer el acento exacto de cada palabra y las licencias del autor.
              </p>
            </div>

            {/* Reglas */}
            <div className={styles.reglasList}>
              <div className={styles.reglaCard}>
                <h3 className={styles.reglaTitulo}>Sinalefa</h3>
                <p className={styles.reglaDesc}>
                  Cuando una palabra termina en vocal y la siguiente empieza por vocal (o <em>h</em> muda seguida de vocal), ambas vocales forman una sola sílaba en la pronunciación del verso.
                </p>
                <div className={styles.reglaEjemplo}>
                  <span className={styles.reglaVerso}>&ldquo;l<u>a</u> <u>a</u>legrí<u>a</u> <u>e</u>terna&rdquo;</span>
                  <span className={styles.reglaFlecha}>→ &ldquo;la_a-le-grí-a_e-ter-na&rdquo; — la unión se marca con _</span>
                </div>
              </div>

              <div className={styles.reglaCard}>
                <h3 className={styles.reglaTitulo}>Hiato (ruptura de sinalefa)</h3>
                <p className={styles.reglaDesc}>
                  A veces el poeta rompe la sinalefa intencionadamente para conseguir un efecto rítmico o de pausa. No es un error: es una licencia poética.
                </p>
              </div>

              <div className={styles.reglaCard}>
                <h3 className={styles.reglaTitulo}>Corrección por acento final</h3>
                <p className={styles.reglaDesc}>
                  El número de sílabas métricas se cuenta hasta la última sílaba acentuada, más uno. Por convenio:
                </p>
                <ul className={styles.reglaLista}>
                  <li><strong>Verso llano</strong> (acento en penúltima): cuenta real = sílabas sin ajuste.</li>
                  <li><strong>Verso agudo</strong> (acento en última): se suma 1 al cómputo.</li>
                  <li><strong>Verso esdrújulo</strong> (acento en antepenúltima): se resta 1.</li>
                </ul>
                <div className={styles.reglaEjemplo}>
                  <span className={styles.reglaVerso}>&ldquo;¡A las armas!&rdquo;</span>
                  <span className={styles.reglaFlecha}>→ a-las-ar-mas: «armas» es llana, cómputo directo. 4 sílabas.</span>
                </div>
              </div>

              <div className={styles.reglaCard}>
                <h3 className={styles.reglaTitulo}>Diptongo y diéresis</h3>
                <p className={styles.reglaDesc}>
                  Dos vocales contiguas dentro de una misma palabra forman diptongo (una sola sílaba) cuando una de ellas es cerrada (<em>i</em>, <em>u</em>) y átona: &ldquo;cie-lo&rdquo;, &ldquo;cuer-po&rdquo;. Dos vocales abiertas (<em>a</em>, <em>e</em>, <em>o</em>) forman hiato: &ldquo;po-e-ma&rdquo;. Si el poeta necesita separar un diptongo en dos sílabas, usa la <strong>diéresis</strong> (ü en palabras como &ldquo;süave&rdquo;). Lo contrario es la <strong>sinéresis</strong>: contar como diptongo lo que no lo es normalmente.
                </p>
              </div>
            </div>
          </>
        )}

        {/* ── TAB 2: Tipos de verso ── */}
        {tab === 'versos' && (
          <div className={styles.tiposGrid}>
            {TIPOS_VERSO.map((tv) => (
              <div key={tv.silabas} className={`${styles.tipoCard} ${tv.arte === 'mayor' ? styles.tipoCardMayor : ''}`}>
                <div className={styles.tipoHeader}>
                  <span className={styles.tipoNumero}>{tv.silabas}</span>
                  <div>
                    <span className={styles.tipoNombre}>{tv.nombre}</span>
                    <span className={`${styles.tipoArte} ${tv.arte === 'mayor' ? styles.tipoArteMayor : ''}`}>
                      arte {tv.arte}
                    </span>
                  </div>
                </div>
                <p className={styles.tipoDesc}>{tv.descripcion}</p>
                <div className={styles.tipoEjemplo}>
                  <em className={styles.tipoVerso}>&ldquo;{tv.ejemplo.verso}&rdquo;</em>
                  <span className={styles.tipoAtrib}>{tv.ejemplo.autor} · <cite>{tv.ejemplo.obra}</cite></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 3: Rima ── */}
        {tab === 'rima' && (
          <div className={styles.rimaContent}>
            <div className={styles.rimaTipos}>
              <div className={styles.rimaTipoCard}>
                <h3 className={styles.rimaTipoTitulo}>Rima consonante</h3>
                <p>Coinciden todos los sonidos desde la última vocal tónica: vocal <strong>y</strong> consonantes. La rima más exigente.</p>
                <div className={styles.rimaPar}>
                  <span className={styles.rimaVerso}>&ldquo;Cerrar podrá mis ojos la postrera&rdquo;</span>
                  <span className={styles.rimaVerso}>&ldquo;mas no de esotra parte en la ribera&rdquo;</span>
                  <span className={styles.rimaIndicador}>-era / -era ✓ (consonante)</span>
                </div>
              </div>
              <div className={styles.rimaTipoCard}>
                <h3 className={styles.rimaTipoTitulo}>Rima asonante</h3>
                <p>Solo coinciden las vocales desde la última vocal tónica; las consonantes pueden ser distintas. Típica del romance.</p>
                <div className={styles.rimaPar}>
                  <span className={styles.rimaVerso}>&ldquo;Verde viento. Verdes ramas&rdquo;</span>
                  <span className={styles.rimaVerso}>&ldquo;y el caballo en la montaña&rdquo;</span>
                  <span className={styles.rimaIndicador}>rá-mas / ta-ña: á-a / á-a ✓ (asonante: mismas vocales desde la tónica)</span>
                </div>
              </div>
            </div>

            <h3 className={styles.rimaSubtitulo}>Principales esquemas de rima</h3>
            <div className={styles.rimaEsquemasGrid}>
              {[
                { nombre: 'Pareada', esquema: 'AA / aa', desc: 'Los dos versos riman entre sí. Estrofa del pareado y de refranes.' },
                { nombre: 'Abrazada', esquema: 'ABBA / abba', desc: 'Los versos externos riman entre sí y los internos entre sí. Cuarteto y redondilla.' },
                { nombre: 'Encadenada', esquema: 'ABAB / abab', desc: 'Versos alternos riman entre sí. Serventesio y cuarteta.' },
                { nombre: 'En cadena', esquema: 'ABA BCB CDC', desc: 'Cada terceto comparte rima con el siguiente. Tercetos encadenados (terza rima).' },
                { nombre: 'Libre', esquema: '—', desc: 'Sin esquema fijo. El poeta puede rimar o no según el efecto buscado.' },
                { nombre: 'Blanca', esquema: 'sin rima + metro', desc: 'Versos con métrica regular pero sin rima. Frecuente en el teatro clásico inglés y en la épica culta.' },
              ].map((e) => (
                <div key={e.nombre} className={styles.rimaEsquemaCard}>
                  <strong className={styles.rimaEsquemaNombre}>{e.nombre}</strong>
                  <code className={styles.rimaEsquemaCodigo}>{e.esquema}</code>
                  <p className={styles.rimaEsquemaDesc}>{e.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: Estrofas ── */}
        {tab === 'estrofas' && (
          <div className={styles.estrofasLista}>
            {ESTROFAS.map((est) => (
              <div key={est.nombre} className={styles.estrofaCard}>
                <button
                  type="button"
                  className={styles.estrofaHeader}
                  onClick={() => setEstrofaAbierta(estrofaAbierta === est.nombre ? null : est.nombre)}
                  aria-expanded={estrofaAbierta === est.nombre}
                >
                  <div className={styles.estrofaHeaderIzq}>
                    <span className={styles.estrofaNombre}>{est.nombre}</span>
                    <span className={styles.estrofaMeta}>{est.versos > 0 ? `${est.versos} versos` : 'serie indefinida'} · {est.medida}</span>
                  </div>
                  <code className={styles.estrofaEsquema}>{est.esquema}</code>
                  <span className={styles.estrofaToggle} aria-hidden="true">{estrofaAbierta === est.nombre ? '▲' : '▼'}</span>
                </button>
                {estrofaAbierta === est.nombre && (
                  <div className={styles.estrofaBody}>
                    <p className={styles.estrofaDesc}>{est.descripcion}</p>
                    <div className={styles.estrofaEjemploBox}>
                      <div className={styles.estrofaVersos}>
                        {est.ejemplo.lineas.map((l, i) => (
                          <p key={i} className={styles.estrofaVerso}>{l}</p>
                        ))}
                      </div>
                      <span className={styles.estrofaAtrib}>{est.ejemplo.autor} · <cite>{est.ejemplo.obra}</cite></span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 5: Formas poéticas ── */}
        {tab === 'formas' && (
          <div className={styles.formasGrid}>
            {FORMAS.map((f) => (
              <div key={f.nombre} className={styles.formaCard}>
                <div className={styles.formaHeader}>
                  <span className={styles.formaIcono} aria-hidden="true">{f.icono}</span>
                  <h2 className={styles.formaNombre}>{f.nombre}</h2>
                </div>
                <p className={styles.formaDesc}>{f.descripcion}</p>
                <div className={styles.formaEstructuraBox}>
                  <span className={styles.formaEstructuraLabel}>Estructura</span>
                  <span className={styles.formaEstructura}>{f.estructura}</span>
                </div>
                <p className={styles.formaHistoria}>{f.historia}</p>
                <div className={styles.formaEjemploBox}>
                  <div className={styles.formaVersos}>
                    {f.ejemplo.lineas.map((l, i) => (
                      <p key={i} className={styles.formaVerso}>{l}</p>
                    ))}
                  </div>
                  <span className={styles.formaAtrib}><cite>{f.ejemplo.titulo}</cite> · {f.ejemplo.autor}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EducationalSection
        title="La métrica como herramienta del significado"
        subtitle="Por qué el metro y la estrofa no son ornamento sino sentido"
      >
        <h3>Verso libre frente a verso medido: ¿cuándo usar cada uno?</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Aspecto</th>
                <th>Verso medido</th>
                <th>Verso libre</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Ritmo</td><td>Regular, predecible, hipnótico</td><td>Irregular, variable, conversacional</td></tr>
              <tr><td>Tensión</td><td>La ruptura del metro crea énfasis</td><td>El ritmo emerge de la sintaxis y el corte de línea</td></tr>
              <tr><td>Memorabilidad</td><td>Alta: el patrón facilita la memorización</td><td>Menor, pero compensa con imagen y dicción</td></tr>
              <tr><td>Tradición</td><td>Poesía épica, lírica clásica, soneto, romance</td><td>Poesía moderna desde Whitman y Verlaine</td></tr>
              <tr><td>Uso actual</td><td>Haiku, soneto contemporáneo, poesía oral</td><td>Predominante en la poesía del siglo XX y XXI</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Para qué tipo de lector y escritor es esta guía</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <strong><span aria-hidden="true">🎓</span> Estudiante de literatura</strong>
            <p>El análisis métrico es una competencia evaluada en los exámenes de admisión universitaria y en los primeros cursos universitarios. Conocer los tipos de verso y estrofa permite identificar la forma de un poema de forma rápida y precisa.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong><span aria-hidden="true">✍️</span> Escritor de poesía</strong>
            <p>Entender las reglas es necesario para saber cuándo y cómo romperlas. Muchos poetas modernos usan el metro "con acento" —conocen las formas clásicas y las subvierten conscientemente.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong><span aria-hidden="true">📖</span> Lector avanzado</strong>
            <p>Saber que un poema está escrito en décimas o en tercetos encadenados añade una capa de lectura. La forma y el contenido no son separables: la elección del metro es parte del significado.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong><span aria-hidden="true">🌍</span> Hispanohablante de cualquier región</strong>
            <p>La décima es la estrofa de la improvisación oral en Cuba, Venezuela, Colombia y Argentina. El romance es base de la poesía popular en toda Latinoamérica. La métrica española es un patrimonio compartido.</p>
          </div>
        </div>

        <h3>Preguntas frecuentes sobre métrica española</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿La sinalefa es obligatoria o el poeta puede evitarla?</strong>
            <p>En la métrica clásica, la sinalefa es la norma general: si hay vocales contiguas entre palabras, se unen por defecto. El poeta puede romperla (hiato) para conseguir un efecto de pausa o énfasis, pero la no-sinalefa es la excepción que requiere justificación.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es el "arte mayor" y el "arte menor"?</strong>
            <p>Arte menor son los versos de 2 a 8 sílabas; arte mayor los de 9 o más. La distinción tiene raíces históricas: el arte mayor (de 12 o más sílabas) fue el verso culto medieval antes de que el endecasílabo lo desplazara en el Renacimiento.</p>
            <div className={styles.faqTip}>El octosílabo es arte menor; el endecasílabo es arte mayor. Ambos son los dos versos más importantes de la poesía en español.</div>
          </li>
          <li className={styles.faqItem}>
            <strong>¿El haiku en español tiene las mismas reglas que en japonés?</strong>
            <p>No exactamente. El haiku japonés cuenta "morae" (unidades de tiempo), no sílabas en sentido occidental. En español se adapta contando sílabas fonéticas, lo que produce un resultado diferente. Lo importante es la imagen, la brevedad y la referencia a un momento concreto.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿El verso libre tiene alguna regla?</strong>
            <p>Sí, aunque no sea métrica. El verso libre se rige por el ritmo sintáctico, la intensidad acentual, la disposición visual y el corte de línea. Un verso libre bien escrito tiene ritmo: simplemente no es regular ni predecible.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué el octosílabo es el verso más natural del español?</strong>
            <p>Se dice que coincide con el ritmo natural del habla española y con el ciclo respiratorio medio. El español tiende a acentuar cada cuatro o cinco sílabas, y el octosílabo encaja bien con ese patrón. Por eso el romance y la copla popular son en octosílabos.</p>
          </li>
        </ul>

        <h3>Cómo analizar la métrica de un poema</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Lee el poema en voz alta antes de analizar</strong>
              <p>La métrica es música: hay que escucharla. Lee despacio, siguiendo el ritmo natural del habla culta (sin forzar las sinalefas ni canturrear). El oído detecta anomalías antes que el cómputo matemático.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Divide el primer verso en sílabas fonéticas</strong>
              <p>Marca las sinalefas (uniones entre palabras) y cuenta el número de sílabas resultante. Aplica la corrección de acento final. Ese número es el metro del poema.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Verifica el metro con otros versos</strong>
              <p>Un metro no se confirma con un solo verso. Analiza al menos dos o tres más para confirmar el patrón. Si hay variación, puede ser una licencia poética consciente o el poema puede usar metros combinados (silva, por ejemplo).</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Identifica el esquema de rima</strong>
              <p>Marca las terminaciones de cada verso con letras (A, B, C… para arte mayor; a, b, c… para arte menor). Busca el patrón de rima: ¿abrazada (ABBA)? ¿alterna (ABAB)? ¿libre?</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Nombra la estrofa o la forma</strong>
              <p>Con el metro y el esquema de rima puedes identificar la estrofa: redondilla (8a abba), cuarteto (11A ABBA), soneto (14 versos endecasílabos ABBA ABBA + tercetos), etc.</p>
            </div>
          </li>
        </ol>

        <h3>Errores comunes al contar sílabas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">👂</span>
            <strong>No confundir sílabas ortográficas con métricas</strong>
            <p>«Poema» tiene 3 sílabas (po-e-ma), pero el poeta puede contarla como 2 (poe-ma) uniendo las dos vocales abiertas: es la sinéresis. La sinalefa, en cambio, solo une vocales de palabras distintas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔤</span>
            <strong>La h no cuenta</strong>
            <p>La h muda no impide la sinalefa. «La hora» forma sinalefa: la_ho-ra = 2 sílabas, no 3. La h es muda para la métrica.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📍</span>
            <strong>El acento final siempre se aplica</strong>
            <p>Cada verso se corrige por su última palabra: si es aguda, suma 1; si es esdrújula, resta 1. Va verso a verso, no solo en el último del poema. Muchos errores en el recuento vienen de olvidar esta corrección.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎶</span>
            <strong>Una tilde en la vocal cerrada rompe el diptongo</strong>
            <p>Una vocal cerrada (i, u) junto a una abierta forma diptongo (una sílaba), pero si la cerrada lleva tilde lo rompe: «día» = dí-a (2 sílabas), no «dia» (1).</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Confusiones frecuentes en el análisis métrico
          </div>
          <ul className={styles.warningList}>
            <li><span aria-hidden="true">❌</span> Confundir verso blanco con verso libre: el verso blanco tiene metro regular pero sin rima; el verso libre no tiene ni metro ni rima fijos.</li>
            <li><span aria-hidden="true">❌</span> Creer que la rima asonante es "rima mal hecha": es una rima deliberada con sus propias reglas, característica del romance y de mucha poesía popular latinoamericana.</li>
            <li><span aria-hidden="true">❌</span> Aplicar la corrección de acento solo a algunos versos: se aplica a cada verso según su última palabra (aguda +1, esdrújula −1), como los cuatro versos agudos de la redondilla de Sor Juana.</li>
            <li><span aria-hidden="true">❌</span> Confundir décima con cualquier poema de 10 versos: la décima o espinela tiene un esquema fijo (abbaaccddc) y una pausa obligatoria. No todo poema de 10 versos es una décima.</li>
            <li><span aria-hidden="true">❌</span> Olvidar que el haiku en español es una adaptación: el número de sílabas (5-7-5) es una convención del español, no una regla del haiku japonés original.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="guia-metrica-estrofas" />
      <Footer appName="guia-metrica-estrofas" />
    </div>
  );
}
