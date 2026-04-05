'use client';

import { useState } from 'react';
import styles from './VisualizadorIdiomasMundo.module.css';
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

type Seccion = 'familias' | 'hablados' | 'peligro' | 'curiosidades';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'familias', titulo: 'Las grandes familias', icono: '🌍', subtitulo: 'Las ramas del árbol de los idiomas' },
  { id: 'hablados', titulo: 'Los más hablados', icono: '🗣️', subtitulo: 'Top 10 por hablantes nativos y totales' },
  { id: 'peligro', titulo: 'En peligro', icono: '⚠️', subtitulo: '~3.000 lenguas al borde de la extinción' },
  { id: 'curiosidades', titulo: 'Curiosidades', icono: '💡', subtitulo: 'Lo que no sabías sobre los idiomas' },
];

// ─────────────────────────────────────────────
// Sección 1: Las grandes familias lingüísticas
// ─────────────────────────────────────────────

interface FamiliaLinguistica {
  nombre: string;
  hablantes: number;
  color: string;
  ejemplo: string;
  idiomas: string;
}

const FAMILIAS: FamiliaLinguistica[] = [
  { nombre: 'Indoeuropea', hablantes: 3200000000, color: '#2E86AB', ejemplo: 'Español, inglés, hindi, ruso', idiomas: '~450 lenguas' },
  { nombre: 'Sino-tibetana', hablantes: 1300000000, color: '#48A9A6', ejemplo: 'Mandarín, cantonés, birmano', idiomas: '~450 lenguas' },
  { nombre: 'Níger-Congo', hablantes: 530000000, color: '#E67E22', ejemplo: 'Suajili, yoruba, zulú', idiomas: '~1.500 lenguas' },
  { nombre: 'Austronesia', hablantes: 386000000, color: '#9B59B6', ejemplo: 'Malayo, tagalo, malgache', idiomas: '~1.200 lenguas' },
  { nombre: 'Afroasiática', hablantes: 350000000, color: '#E74C3C', ejemplo: 'Árabe, hebreo, amárico', idiomas: '~300 lenguas' },
  { nombre: 'Dravídica', hablantes: 250000000, color: '#27AE60', ejemplo: 'Tamil, télugu, canarés', idiomas: '~80 lenguas' },
  { nombre: 'Turca', hablantes: 200000000, color: '#F39C12', ejemplo: 'Turco, azerí, uzbeco', idiomas: '~35 lenguas' },
  { nombre: 'Japónica', hablantes: 128000000, color: '#1ABC9C', ejemplo: 'Japonés, ryukyuense', idiomas: '~10 lenguas' },
];

function SeccionFamilias() {
  const [familiaActiva, setFamiliaActiva] = useState<number | null>(null);
  const maxHablantes = FAMILIAS[0].hablantes;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Hay más de <strong>7.000 idiomas</strong> en el mundo, pero casi todos pertenecen a unas pocas grandes familias. La más grande — la indoeuropea — la habla casi la mitad de la humanidad.</p>
      </div>

      <div className={styles.familiasGrid}>
        {FAMILIAS.map((f, i) => {
          const ancho = Math.max((f.hablantes / maxHablantes) * 100, 15);
          const activa = familiaActiva === i;
          return (
            <button
              key={f.nombre}
              type="button"
              className={`${styles.familiaBloque} ${activa ? styles.familiaBloqueActiva : ''}`}
              style={{ width: `${ancho}%`, borderLeftColor: f.color }}
              onClick={() => setFamiliaActiva(activa ? null : i)}
              aria-expanded={activa}
              aria-label={`${f.nombre}: ${formatNumber(f.hablantes / 1000000, 0)} millones de hablantes`}
            >
              <div className={styles.familiaHeader}>
                <span className={styles.familiaNombre}>{f.nombre}</span>
                <span className={styles.familiaHablantes} style={{ color: f.color }}>
                  {f.hablantes >= 1000000000
                    ? `${formatNumber(f.hablantes / 1000000000, 1)} mil M`
                    : `${formatNumber(f.hablantes / 1000000, 0)} M`}
                </span>
              </div>
              {activa && (
                <div className={styles.familiaDetalle}>
                  <p><strong>Ejemplos:</strong> {f.ejemplo}</p>
                  <p><strong>Diversidad:</strong> {f.idiomas}</p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className={styles.insight}>
        <p>
          <strong>La familia indoeuropea domina, pero no es la más diversa.</strong> Níger-Congo tiene ~1.500 lenguas
          (solo Nigeria tiene más de 500 idiomas). La diversidad lingüística no depende del número de hablantes,
          sino de la historia, la geografía y el aislamiento de las comunidades.
        </p>
      </div>

      <div className={styles.preguntaCard}>
        <span className={styles.preguntaIcono} aria-hidden="true">🤔</span>
        <p>¿Sabías que Papúa Nueva Guinea, un país con solo 10 millones de habitantes, tiene <strong>más de 840 idiomas</strong>? Es el país con mayor diversidad lingüística del mundo — una lengua por cada 12.000 personas.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Los idiomas más hablados
// ─────────────────────────────────────────────

interface IdiomaTop {
  nombre: string;
  nativos: number;
  total: number;
  bandera: string;
}

const TOP_IDIOMAS: IdiomaTop[] = [
  { nombre: 'Inglés', nativos: 380, total: 1460, bandera: '🇬🇧' },
  { nombre: 'Mandarín', nativos: 920, total: 1120, bandera: '🇨🇳' },
  { nombre: 'Hindi', nativos: 345, total: 610, bandera: '🇮🇳' },
  { nombre: 'Español', nativos: 485, total: 560, bandera: '🇪🇸' },
  { nombre: 'Árabe', nativos: 310, total: 420, bandera: '🌍' },
  { nombre: 'Francés', nativos: 80, total: 310, bandera: '🇫🇷' },
  { nombre: 'Bengalí', nativos: 230, total: 270, bandera: '🇧🇩' },
  { nombre: 'Portugués', nativos: 230, total: 260, bandera: '🇧🇷' },
  { nombre: 'Ruso', nativos: 150, total: 255, bandera: '🇷🇺' },
  { nombre: 'Japonés', nativos: 125, total: 128, bandera: '🇯🇵' },
];

function SeccionHablados() {
  const maxTotal = TOP_IDIOMAS[0].total;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>¿Cuáles son los idiomas más hablados? Depende de cómo cuentes: <strong>hablantes nativos</strong> (los que lo aprenden de niño) o <strong>hablantes totales</strong> (incluidos los que lo aprenden después). El ranking cambia completamente.</p>
      </div>

      <div className={styles.leyendaBarras}>
        <span className={styles.leyendaItem}>
          <span className={styles.leyendaDot} style={{ background: '#2E86AB' }} /> Nativos
        </span>
        <span className={styles.leyendaItem}>
          <span className={styles.leyendaDot} style={{ background: '#48A9A6' }} /> Segunda lengua (L2)
        </span>
      </div>

      <div className={styles.barrasLista}>
        {TOP_IDIOMAS.map((idioma) => {
          const anchoTotal = (idioma.total / maxTotal) * 100;
          const anchoNativos = (idioma.nativos / idioma.total) * anchoTotal;
          const anchoL2 = anchoTotal - anchoNativos;

          return (
            <div key={idioma.nombre} className={styles.barraItem}>
              <div className={styles.barraLabel}>
                <span aria-hidden="true">{idioma.bandera}</span>
                <span className={styles.barraNombre}>{idioma.nombre}</span>
              </div>
              <div className={styles.barraTrack}>
                <div className={styles.barraNativos} style={{ width: `${anchoNativos}%` }}>
                  {idioma.nativos >= 200 && <span className={styles.barraTexto}>{formatNumber(idioma.nativos, 0)} M</span>}
                </div>
                <div className={styles.barraL2} style={{ width: `${anchoL2}%` }}>
                  {(idioma.total - idioma.nativos) >= 100 && <span className={styles.barraTexto}>+{formatNumber(idioma.total - idioma.nativos, 0)} M</span>}
                </div>
              </div>
              <span className={styles.barraTotal}>{formatNumber(idioma.total, 0)} M</span>
            </div>
          );
        })}
      </div>

      <div className={styles.insight}>
        <p>
          <strong>El inglés es el idioma más hablado del mundo, pero no por nativos.</strong> De sus 1.460 millones
          de hablantes, solo 380 millones lo aprendieron de niño. El mandarín tiene más del doble de nativos, pero
          muy pocos lo aprenden como segunda lengua. El español es la segunda lengua nativa más hablada del mundo.
        </p>
      </div>

      <div className={styles.preguntaCard}>
        <span className={styles.preguntaIcono} aria-hidden="true">🤔</span>
        <p>El japonés es un caso extremo: casi todos sus hablantes son nativos. Solo 3 millones de personas en el mundo estudian japonés como segunda lengua — un idioma de <strong>128 millones de personas, casi cerrado al exterior</strong>.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Lenguas en peligro
// ─────────────────────────────────────────────

interface LenguaPeligro {
  nombre: string;
  hablantes: string;
  lugar: string;
  detalle: string;
  estado: 'critico' | 'peligro' | 'salvada';
}

const LENGUAS_PELIGRO: LenguaPeligro[] = [
  { nombre: 'Yagán', hablantes: '1 hablante', lugar: '🇨🇱 Chile', detalle: 'Cristina Calderón fue la última hablante nativa. Falleció en 2022. La lengua se documenta para preservarla.', estado: 'critico' },
  { nombre: 'Ainu', hablantes: '~10 hablantes', lugar: '🇯🇵 Japón', detalle: 'Lengua del pueblo indígena de Hokkaido. Japón la reconoció como lengua indígena en 2019, pero quedan poquísimos hablantes fluidos.', estado: 'critico' },
  { nombre: 'Silbo Gomero', hablantes: '~22.000 conocedores', lugar: '🇪🇸 Canarias', detalle: 'Lenguaje silbado de La Gomera. Se enseña en colegios desde 1999. Patrimonio de la Humanidad (UNESCO, 2009).', estado: 'salvada' },
  { nombre: 'Navajo', hablantes: '~170.000 hablantes', lugar: '🇺🇸 EE.UU.', detalle: 'Lengua de los code talkers de la WWII. Tiene comunidad activa pero los jóvenes prefieren inglés.', estado: 'peligro' },
  { nombre: 'Euskera', hablantes: '~750.000 hablantes', lugar: '🇪🇸 España', detalle: 'La lengua más antigua de Europa occidental. No está emparentada con ninguna otra. En recuperación gracias a las ikastolas.', estado: 'peligro' },
  { nombre: 'Gaélico irlandés', hablantes: '~70.000 nativos', lugar: '🇮🇪 Irlanda', detalle: 'Idioma oficial de Irlanda, pero solo el 2% lo usa a diario. Las zonas Gaeltacht luchan por mantenerlo vivo.', estado: 'peligro' },
];

const EMBUDO = [
  { label: 'Idiomas en el mundo', valor: 7000, color: '#2E86AB', ancho: 100 },
  { label: 'En peligro (UNESCO)', valor: 3000, color: '#E67E22', ancho: 70 },
  { label: 'En peligro crítico', valor: 1500, color: '#E74C3C', ancho: 45 },
  { label: 'Con menos de 10 hablantes', valor: 350, color: '#922B21', ancho: 22 },
];

function SeccionPeligro() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Cada <strong>dos semanas</strong> muere un idioma en el mundo. De los ~7.000 que existen, casi la mitad está en peligro. Cuando desaparece una lengua, se pierde una forma única de entender el mundo.</p>
      </div>

      {/* Embudo */}
      <div className={styles.embudo}>
        {EMBUDO.map((e) => (
          <div key={e.label} className={styles.embudoNivel} style={{ width: `${e.ancho}%` }}>
            <div className={styles.embudoBarra} style={{ background: e.color }}>
              <span className={styles.embudoValor}>{formatNumber(e.valor, 0)}</span>
            </div>
            <span className={styles.embudoLabel}>{e.label}</span>
          </div>
        ))}
      </div>

      <h3 className={styles.seccionSubtitulo}>Casos emblemáticos</h3>
      <div className={styles.lenguasGrid}>
        {LENGUAS_PELIGRO.map((l) => (
          <div key={l.nombre} className={`${styles.lenguaCard} ${styles[`lengua_${l.estado}`]}`}>
            <div className={styles.lenguaHeader}>
              <span className={styles.lenguaNombre}>{l.nombre}</span>
              <span className={`${styles.lenguaBadge} ${styles[`badge_${l.estado}`]}`}>
                {l.estado === 'critico' ? 'Crítico' : l.estado === 'peligro' ? 'En peligro' : 'Recuperada'}
              </span>
            </div>
            <div className={styles.lenguaMeta}>
              <span>{l.lugar}</span>
              <span>{l.hablantes}</span>
            </div>
            <p className={styles.lenguaDetalle}>{l.detalle}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          <strong>No todo son malas noticias.</strong> El silbo gomero, el hebreo (revivido en el siglo XX) y el galés
          demuestran que con voluntad política y educación es posible salvar una lengua. Pero hace falta actuar:
          <strong> el 95% del contenido de internet está en solo 10 idiomas</strong>.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Curiosidades lingüísticas
// ─────────────────────────────────────────────

interface Curiosidad {
  icono: string;
  titulo: string;
  dato: string;
  detalle: string;
}

const CURIOSIDADES: Curiosidad[] = [
  {
    icono: '🔤',
    titulo: 'El alfabeto más largo',
    dato: 'Jemer (camboyano): 74 letras',
    detalle: 'El alfabeto jemer tiene 33 consonantes, 23 vocales y 12 vocales independientes. El más corto es el rotokas (Papúa Nueva Guinea) con solo 12 letras.',
  },
  {
    icono: '🎵',
    titulo: 'Más tonos que notas',
    dato: 'Hmong: hasta 8 tonos',
    detalle: 'En lenguas tonales, la misma sílaba significa cosas distintas según la entonación. El mandarín tiene 4 tonos, el cantonés 6-9, y el hmong hasta 8.',
  },
  {
    icono: '👅',
    titulo: 'Idiomas con clics',
    dato: 'Lenguas khoisan: hasta 5 tipos de clic',
    detalle: 'Las lenguas khoisan del sur de África usan chasquidos de la lengua como consonantes. El !xóõ tiene 83 clics distintos — probablemente el idioma con más sonidos del mundo.',
  },
  {
    icono: '🚫',
    titulo: 'Sin "por favor"',
    dato: 'Varias lenguas no tienen esa palabra',
    detalle: 'En muchas lenguas (como el islandés o algunas lenguas indígenas) no existe "por favor" como palabra separada. La cortesía se expresa con la entonación, el contexto o formas verbales.',
  },
  {
    icono: '📖',
    titulo: 'La palabra más larga',
    dato: 'Alemán: sin límite teórico',
    detalle: 'El alemán permite palabras compuestas infinitas. "Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz" (63 letras) fue una ley real sobre etiquetado de carne.',
  },
  {
    icono: '🔢',
    titulo: 'Idiomas sin números',
    dato: 'Pirahã (Amazonas): solo "pocos" y "muchos"',
    detalle: 'Los pirahã no tienen palabras para números concretos. Tampoco tienen colores, tiempos verbales pasados ni frases subordinadas. Es una de las lenguas más simples conocidas.',
  },
  {
    icono: '🪞',
    titulo: 'Escritura espejo',
    dato: 'Árabe y hebreo: de derecha a izquierda',
    detalle: 'El 12% de las lenguas escritas van de derecha a izquierda. El boustrofedon (griego antiguo) alternaba: una línea a la derecha, la siguiente a la izquierda, como un buey arando.',
  },
  {
    icono: '🌐',
    titulo: 'El idioma inventado más exitoso',
    dato: 'Esperanto: ~2 millones de hablantes',
    detalle: 'Creado en 1887 por Zamenhof para ser una lengua universal. Hay hablantes nativos (niños criados en esperanto), literatura propia, música, e incluso una Wikipedia con 300.000 artículos.',
  },
];

function SeccionCuriosidades() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Los idiomas esconden datos fascinantes. Desde alfabetos con 74 letras hasta lenguas sin números, pasando por idiomas que se silban o se chasquean.</p>
      </div>

      <div className={styles.curiosidadesGrid}>
        {CURIOSIDADES.map((c) => (
          <div key={c.titulo} className={styles.curiosidadCard}>
            <span className={styles.curiosidadIcono} aria-hidden="true">{c.icono}</span>
            <div>
              <span className={styles.curiosidadTitulo}>{c.titulo}</span>
              <span className={styles.curiosidadDato}>{c.dato}</span>
              <p className={styles.curiosidadDetalle}>{c.detalle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          <strong>Cada idioma es una forma diferente de pensar.</strong> Los hopi no distinguen pasado y futuro.
          Los guugu yimithirr (Australia) no usan izquierda/derecha, sino puntos cardinales — &quot;la hormiga
          está al norte de tu pie&quot;. Perder un idioma es perder una perspectiva única sobre la realidad.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorIdiomasMundoPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('familias');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'familias': return <SeccionFamilias />;
      case 'hablados': return <SeccionHablados />;
      case 'peligro': return <SeccionPeligro />;
      case 'curiosidades': return <SeccionCuriosidades />;
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
          <h1 className={styles.title}>El Mapa de los Idiomas del Mundo</h1>
          <p className={styles.subtitle}>7.000 lenguas, una humanidad</p>
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
          title="La diversidad lingüística, explicada"
          subtitle="Conceptos clave para entender el mundo de los idiomas"
          defaultOpen={false}
        >
          <h3>¿Por qué hay tantos idiomas?</h3>
          <p>
            La diversidad lingüística es resultado de miles de años de migración, aislamiento geográfico
            y evolución cultural. Las montañas, los ríos y los océanos separan a las comunidades, y con
            el tiempo sus hablas divergen hasta ser mutuamente ininteligibles. Papúa Nueva Guinea, con
            su terreno extremadamente montañoso, tiene más de 840 idiomas.
          </p>

          <h3>¿Qué se pierde cuando muere un idioma?</h3>
          <p>
            Cada lengua codifica conocimiento único: nombres de plantas medicinales, técnicas agrícolas
            ancestrales, formas de orientarse en el territorio, mitología y cosmovisión. Los lingüistas
            estiman que el 80% de las plantas medicinales conocidas por pueblos indígenas no están
            documentadas en ninguna lengua colonial.
          </p>

          <h3>¿El inglés acabará con los demás idiomas?</h3>
          <p>
            No necesariamente. Lo que ocurre es un fenómeno de <strong>diglosia</strong>: muchas personas
            hablan inglés como segunda lengua para trabajo o internet, pero mantienen su lengua materna
            en casa. El peligro real no es el inglés, sino la falta de uso: cuando los padres dejan de
            hablar su lengua a sus hijos, la transmisión se rompe en una generación.
          </p>

          <h3>¿Se pueden salvar las lenguas en peligro?</h3>
          <p>
            Sí, hay casos de éxito. El hebreo pasó de lengua muerta a idioma de 9 millones de personas.
            El galés se recuperó de 500.000 a 900.000 hablantes con educación bilingüe. El silbo gomero
            se salvó enseñándolo en colegios. La clave es siempre la misma: <strong>educación,
            prestigio social y uso en la vida cotidiana</strong>.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> las cifras de hablantes son estimaciones (Ethnologue, UNESCO) y varían
            según la fuente y los criterios de &quot;hablante&quot;. Los datos de lenguas en peligro provienen del
            Atlas UNESCO de Lenguas en Peligro.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-idiomas-mundo')} />
        <ShareCard appName="visualizador-idiomas-mundo" />
        <Footer appName="visualizador-idiomas-mundo" />
      </div>
    </>
  );
}
