'use client';

import { useState, useMemo } from 'react';
import styles from './VisualizadorVidaEstrella.module.css';
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
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'nacimiento' | 'adulta' | 'muerte' | 'polvo';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'nacimiento', titulo: 'El nacimiento', icono: '🌫️', subtitulo: 'De nube de gas a estrella' },
  { id: 'adulta', titulo: 'La vida adulta', icono: '☀️', subtitulo: 'Fusión nuclear: el motor estelar' },
  { id: 'muerte', titulo: 'La muerte', icono: '💀', subtitulo: 'Enana blanca, neutrón o agujero negro' },
  { id: 'polvo', titulo: 'Polvo de estrellas', icono: '✨', subtitulo: 'Somos cenizas cósmicas' },
];

// ─────────────────────────────────────────────
// Datos de la tabla periódica simplificada
// ─────────────────────────────────────────────

type OrigenEstelar = 'bigbang' | 'pequenas' | 'supernovas' | 'fusiones';

interface ElementoInfo {
  simbolo: string;
  nombre: string;
  origen: OrigenEstelar;
  dato: string;
}

const ORIGENES: Record<OrigenEstelar, { label: string; color: string; colorDark: string }> = {
  bigbang: { label: 'Big Bang', color: '#E8D44D', colorDark: '#B8A420' },
  pequenas: { label: 'Estrellas pequeñas/medianas', color: '#48A9A6', colorDark: '#3A8A88' },
  supernovas: { label: 'Supernovas', color: '#E74C3C', colorDark: '#C0392B' },
  fusiones: { label: 'Fusión de estrellas de neutrones', color: '#9B59B6', colorDark: '#7D3C98' },
};

const ELEMENTOS: ElementoInfo[] = [
  { simbolo: 'H', nombre: 'Hidrógeno', origen: 'bigbang', dato: '75% del universo visible' },
  { simbolo: 'He', nombre: 'Helio', origen: 'bigbang', dato: 'Creado en los primeros 3 minutos' },
  { simbolo: 'Li', nombre: 'Litio', origen: 'bigbang', dato: 'Trazas del Big Bang' },
  { simbolo: 'C', nombre: 'Carbono', origen: 'pequenas', dato: 'Base de toda la vida' },
  { simbolo: 'N', nombre: 'Nitrógeno', origen: 'pequenas', dato: '78% de nuestra atmósfera' },
  { simbolo: 'O', nombre: 'Oxígeno', origen: 'pequenas', dato: 'El que respiras ahora' },
  { simbolo: 'Ne', nombre: 'Neón', origen: 'supernovas', dato: 'Carteles luminosos' },
  { simbolo: 'Na', nombre: 'Sodio', origen: 'supernovas', dato: 'En la sal de tu comida' },
  { simbolo: 'Mg', nombre: 'Magnesio', origen: 'supernovas', dato: 'En tus huesos' },
  { simbolo: 'Si', nombre: 'Silicio', origen: 'supernovas', dato: 'Chips de tu ordenador' },
  { simbolo: 'Ca', nombre: 'Calcio', origen: 'supernovas', dato: 'Tus dientes y huesos' },
  { simbolo: 'Fe', nombre: 'Hierro', origen: 'supernovas', dato: 'En tu sangre (hemoglobina)' },
  { simbolo: 'Cu', nombre: 'Cobre', origen: 'supernovas', dato: 'Cables eléctricos' },
  { simbolo: 'Ag', nombre: 'Plata', origen: 'fusiones', dato: 'Joyería y electrónica' },
  { simbolo: 'I', nombre: 'Yodo', origen: 'fusiones', dato: 'Esencial para tu tiroides' },
  { simbolo: 'Au', nombre: 'Oro', origen: 'fusiones', dato: 'De choques de estrellas de neutrones' },
  { simbolo: 'Pt', nombre: 'Platino', origen: 'fusiones', dato: 'Catalizadores y joyería' },
  { simbolo: 'U', nombre: 'Uranio', origen: 'fusiones', dato: 'Centrales nucleares' },
];

// ─────────────────────────────────────────────
// Sección 1: El nacimiento
// ─────────────────────────────────────────────

function SeccionNacimiento() {
  const etapas = [
    {
      icono: '🌫️',
      titulo: 'Nube molecular',
      duracion: 'Millones de años',
      descripcion: 'Enormes nubes de hidrógeno y polvo flotan en el espacio interestelar. Una nube típica contiene materia suficiente para formar miles de estrellas.',
      detalle: 'Temperatura: -260 °C. Densidad: apenas 1.000 átomos por cm³ (el vacío en la Tierra tiene billones).',
    },
    {
      icono: '🌀',
      titulo: 'Colapso gravitatorio',
      duracion: '100.000 - 1 millón de años',
      descripcion: 'Una perturbación (onda de choque de supernova, colisión de nubes) hace que una región se contraiga. La gravedad tira del gas hacia el centro.',
      detalle: 'A medida que el gas cae, se calienta. La presión aumenta pero la gravedad gana. Se forma un disco de acreción giratorio.',
    },
    {
      icono: '🔥',
      titulo: 'Protoestrella',
      duracion: '~500.000 años',
      descripcion: 'El centro alcanza millones de grados. Aún no hay fusión nuclear — el calor viene de la compresión gravitatoria. La protoestrella brilla en infrarrojo.',
      detalle: 'Temperatura central: ~1 millón de °C. Todavía está rodeada del cascarón de gas y polvo del que nació.',
    },
    {
      icono: '⭐',
      titulo: '¡Ignición! Secuencia principal',
      duracion: 'El momento clave',
      descripcion: 'Cuando el núcleo alcanza 10 millones de °C, los átomos de hidrógeno se fusionan en helio. La energía liberada frena el colapso. Nace una estrella.',
      detalle: 'La fusión nuclear convierte 4 átomos de H en 1 de He, liberando energía según E = mc². El Sol convierte 600 millones de toneladas de H por segundo.',
    },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Todas las estrellas nacen del mismo material: <strong>nubes gigantes de hidrógeno y polvo</strong> flotando en el espacio. El proceso tarda millones de años.</p>
      </div>

      <div className={styles.timelineVertical}>
        {etapas.map((e, i) => (
          <div key={i} className={styles.timelineItem}>
            <div className={styles.timelineDot}>
              <span aria-hidden="true">{e.icono}</span>
            </div>
            <div className={styles.timelineCard}>
              <div className={styles.timelineHeader}>
                <h3 className={styles.timelineTitulo}>{e.titulo}</h3>
                <span className={styles.timelineDuracion}>{e.duracion}</span>
              </div>
              <p className={styles.timelineDesc}>{e.descripcion}</p>
              <p className={styles.timelineDetalle}>{e.detalle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          El nacimiento de una estrella es una batalla entre <strong>gravedad</strong> (que comprime) y
          <strong> presión</strong> (que expande). Cuando la fusión nuclear arranca, se alcanza un equilibrio
          que puede durar miles de millones de años.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: La vida adulta
// ─────────────────────────────────────────────

function SeccionAdulta({ masaSolar }: { masaSolar: number }) {
  const datos = useMemo(() => {
    // Vida en secuencia principal ≈ (1/masa^2.5) * 10.000 millones de años
    const vidaAnios = (1 / Math.pow(masaSolar, 2.5)) * 10_000_000_000;
    const temperatura = masaSolar >= 8 ? 30000 + (masaSolar - 8) * 2000
      : masaSolar >= 2 ? 7000 + (masaSolar - 2) * 3833
      : 3000 + masaSolar * 4000;
    const luminosidad = Math.pow(masaSolar, 3.5);
    const radio = masaSolar >= 8 ? masaSolar * 0.8 : masaSolar >= 1 ? Math.pow(masaSolar, 0.7) : Math.pow(masaSolar, 0.5);

    let colorEstrella: string;
    let tipoEspectral: string;
    if (temperatura > 25000) { colorEstrella = '#9BB0FF'; tipoEspectral = 'O/B — Azul'; }
    else if (temperatura > 10000) { colorEstrella = '#CAD7FF'; tipoEspectral = 'A — Blanca-azulada'; }
    else if (temperatura > 7000) { colorEstrella = '#F8F7FF'; tipoEspectral = 'F — Blanca'; }
    else if (temperatura > 5200) { colorEstrella = '#FFF4E8'; tipoEspectral = 'G — Amarilla (como el Sol)'; }
    else if (temperatura > 3700) { colorEstrella = '#FFD2A1'; tipoEspectral = 'K — Naranja'; }
    else { colorEstrella = '#FFAA6E'; tipoEspectral = 'M — Roja'; }

    return { vidaAnios, temperatura, luminosidad, radio, colorEstrella, tipoEspectral };
  }, [masaSolar]);

  const formatVida = (anios: number): string => {
    if (anios >= 1_000_000_000_000) return `${formatNumber(anios / 1_000_000_000_000, 1)} billones de años`;
    if (anios >= 1_000_000_000) return `${formatNumber(anios / 1_000_000_000, 1)} mil millones de años`;
    if (anios >= 1_000_000) return `${formatNumber(anios / 1_000_000, 0)} millones de años`;
    return `${formatNumber(anios, 0)} años`;
  };

  // Diagrama HR simplificado: posiciones relativas
  const hrEstrellas = [
    { nombre: 'Rigel', masa: 18, temp: 12000, lum: 120000, tipo: 'Supergigante azul' },
    { nombre: 'Sirio', masa: 2.1, temp: 9900, lum: 25, tipo: 'Secuencia principal A' },
    { nombre: 'Sol', masa: 1, temp: 5778, lum: 1, tipo: 'Secuencia principal G' },
    { nombre: 'Próxima Centauri', masa: 0.12, temp: 3042, lum: 0.0017, tipo: 'Enana roja M' },
    { nombre: 'Betelgeuse', masa: 15, temp: 3500, lum: 100000, tipo: 'Supergigante roja' },
    { nombre: 'Sirio B', masa: 1, temp: 25000, lum: 0.03, tipo: 'Enana blanca' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Una estrella en la <strong>secuencia principal</strong> fusiona hidrógeno en helio. Las más masivas brillan más pero mueren mucho antes.</p>
      </div>

      {/* Estrella visual */}
      <div className={styles.estrellaVisual}>
        <div
          className={styles.estrellaCuerpo}
          style={{
            width: `${Math.min(200, 40 + datos.radio * 30)}px`,
            height: `${Math.min(200, 40 + datos.radio * 30)}px`,
            background: `radial-gradient(circle, white 0%, ${datos.colorEstrella} 40%, ${datos.colorEstrella}88 70%, transparent 100%)`,
            boxShadow: `0 0 ${20 + datos.luminosidad * 2}px ${datos.colorEstrella}88, 0 0 ${40 + datos.luminosidad * 4}px ${datos.colorEstrella}44`,
          }}
        />
        <span className={styles.estrellaClase}>{datos.tipoEspectral}</span>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Masa</span>
          <span className={styles.statValor}>{formatNumber(masaSolar, 1)}x Sol</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Esperanza de vida</span>
          <span className={styles.statValor} style={{ color: datos.vidaAnios < 1_000_000_000 ? '#e74c3c' : '#27ae60' }}>
            {formatVida(datos.vidaAnios)}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Temperatura superficial</span>
          <span className={styles.statValor}>{formatNumber(datos.temperatura, 0)} °C</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Luminosidad</span>
          <span className={styles.statValor}>{formatNumber(datos.luminosidad, 1)}x Sol</span>
        </div>
      </div>

      {/* Diagrama HR simplificado */}
      <div className={styles.hrDiagrama}>
        <h3 className={styles.hrTitulo}>Diagrama Hertzsprung-Russell (simplificado)</h3>
        <p className={styles.hrSubtitulo}>Temperatura vs luminosidad: dónde vive cada estrella</p>
        <div className={styles.hrCampo}>
          <span className={styles.hrEjeY}>Luminosidad</span>
          <span className={styles.hrEjeX}>Temperatura (caliente → fría)</span>
          {hrEstrellas.map((e, i) => {
            const x = 100 - ((Math.log10(e.temp) - 3.4) / (4.2 - 3.4)) * 100;
            const y = 100 - ((Math.log10(Math.max(e.lum, 0.001)) + 3) / 8) * 100;
            return (
              <div
                key={i}
                className={styles.hrPunto}
                style={{
                  left: `${Math.max(5, Math.min(90, x))}%`,
                  top: `${Math.max(5, Math.min(90, y))}%`,
                  background: e.temp > 10000 ? '#9BB0FF' : e.temp > 5500 ? '#FFF4E8' : '#FFAA6E',
                }}
                title={`${e.nombre}: ${e.tipo}`}
              >
                <span className={styles.hrPuntoLabel}>{e.nombre}</span>
              </div>
            );
          })}
          <div className={styles.hrSecuencia} />
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Una estrella de <strong>{formatNumber(masaSolar, 1)} masas solares</strong> vivirá
          aproximadamente <strong>{formatVida(datos.vidaAnios)}</strong>.
          {masaSolar >= 8 ? ' Las estrellas masivas viven rápido y mueren jóvenes — en una espectacular supernova.' :
            masaSolar >= 2 ? ' Una vida larga pero no eterna. Morirá expandiéndose como gigante roja.' :
            ' Las estrellas pequeñas son las más longevas del universo — pueden durar más que la edad actual del cosmos.'}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: La muerte
// ─────────────────────────────────────────────

function SeccionMuerte({ masaSolar }: { masaSolar: number }) {
  const esMasiva = masaSolar >= 8;

  const caminoBajo = [
    { icono: '🔴', titulo: 'Gigante roja', desc: 'Se agota el hidrógeno del núcleo. La estrella se expande hasta engullir planetas cercanos. Nuestro Sol crecerá hasta la órbita de la Tierra.' },
    { icono: '💨', titulo: 'Nebulosa planetaria', desc: 'Las capas externas se expulsan suavemente al espacio, formando nubes de gas brillantes e increíblemente bellas.' },
    { icono: '⚪', titulo: 'Enana blanca', desc: 'El núcleo desnudo: del tamaño de la Tierra pero con la masa del Sol. Se enfría lentamente durante billones de años hasta apagarse.' },
  ];

  const caminoAlto = [
    { icono: '🔴', titulo: 'Supergigante roja', desc: 'La estrella masiva se hincha enormemente. Si reemplazase al Sol, llegaría hasta la órbita de Júpiter. Fusiona helio, carbono, oxígeno...' },
    { icono: '🧅', titulo: 'Núcleo en capas (cebolla)', desc: 'El interior se estructura como una cebolla: capas de H, He, C, O, Ne, Si... hasta llegar al hierro. El hierro no libera energía al fusionarse.' },
    { icono: '💥', titulo: 'Supernova', desc: 'El núcleo de hierro colapsa en milisegundos. El rebote genera una explosión que brilla más que una galaxia entera durante semanas.' },
    masaSolar < 20
      ? { icono: '⚫', titulo: 'Estrella de neutrones', desc: 'El núcleo superviviente: 20 km de diámetro, densidad de 1.000 millones de toneladas por cucharadita. Gira cientos de veces por segundo.' }
      : { icono: '🕳️', titulo: 'Agujero negro', desc: 'Con masa suficiente, nada frena el colapso. Se forma una singularidad de la que ni la luz puede escapar. Deforma el espacio-tiempo a su alrededor.' },
  ];

  const camino = esMasiva ? caminoAlto : caminoBajo;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          Con <strong>{formatNumber(masaSolar, 1)} masas solares</strong>, esta estrella
          morirá como {esMasiva
            ? (masaSolar >= 20 ? 'un agujero negro' : 'una estrella de neutrones')
            : 'una enana blanca'}.
          {esMasiva ? ' Destino violento y espectacular.' : ' Un final tranquilo y lento.'}
        </p>
      </div>

      {/* Indicador de camino */}
      <div className={styles.caminoIndicador}>
        <div className={`${styles.caminoOpcion} ${!esMasiva ? styles.caminoActivo : ''}`}>
          <span className={styles.caminoLabel}>Masa baja (&lt; 8 soles)</span>
          <span className={styles.caminoDestino}>→ Enana blanca</span>
        </div>
        <div className={styles.caminoDivisor}>
          <span className={styles.caminoMasa}>{formatNumber(masaSolar, 1)}x</span>
        </div>
        <div className={`${styles.caminoOpcion} ${esMasiva ? styles.caminoActivo : ''}`}>
          <span className={styles.caminoLabel}>Masa alta (&gt; 8 soles)</span>
          <span className={styles.caminoDestino}>→ Neutrón / Agujero negro</span>
        </div>
      </div>

      {/* Etapas de la muerte */}
      <div className={styles.muerteTimeline}>
        {camino.map((e, i) => (
          <div key={i} className={`${styles.muerteEtapa} ${i === camino.length - 1 ? styles.muerteEtapaFinal : ''}`}>
            <div className={styles.muerteIcono}>
              <span aria-hidden="true">{e.icono}</span>
            </div>
            <div className={styles.muerteContenido}>
              <h3 className={styles.muerteTitulo}>{e.titulo}</h3>
              <p className={styles.muerteDesc}>{e.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comparativa visual */}
      <div className={styles.comparativaCard}>
        <h3 className={styles.comparativaTitulo}>Comparativa de restos estelares</h3>
        <div className={styles.comparativaGrid}>
          <div className={styles.comparativaItem}>
            <div className={styles.comparativaCirculo} style={{ width: 80, height: 80, background: 'radial-gradient(circle, #fff 30%, #ddd 100%)' }} />
            <span className={styles.comparativaNombre}>Enana blanca</span>
            <span className={styles.comparativaDato}>Tamaño de la Tierra</span>
          </div>
          <div className={styles.comparativaItem}>
            <div className={styles.comparativaCirculo} style={{ width: 20, height: 20, background: 'radial-gradient(circle, #9BB0FF 30%, #5566AA 100%)' }} />
            <span className={styles.comparativaNombre}>Estrella de neutrones</span>
            <span className={styles.comparativaDato}>20 km de diámetro</span>
          </div>
          <div className={styles.comparativaItem}>
            <div className={styles.comparativaCirculo} style={{ width: 50, height: 50, background: 'radial-gradient(circle, #333 30%, #000 70%)', border: '2px solid #FF6B35' }} />
            <span className={styles.comparativaNombre}>Agujero negro</span>
            <span className={styles.comparativaDato}>Singularidad infinita</span>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          La muerte de una estrella no es el final — es un <strong>reciclaje cósmico</strong>.
          {esMasiva
            ? ' La supernova esparce elementos pesados por el espacio, sembrando las semillas de futuras estrellas, planetas y... vida.'
            : ' La nebulosa planetaria devuelve gas enriquecido al espacio, que formará nuevas estrellas y sistemas planetarios.'}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Somos polvo de estrellas
// ─────────────────────────────────────────────

function SeccionPolvo() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Cada átomo de tu cuerpo (excepto el hidrógeno) se forjó en el interior de una estrella o en su muerte violenta. <strong>Somos, literalmente, polvo de estrellas.</strong></p>
      </div>

      {/* Datos del cuerpo humano */}
      <div className={styles.cuerpoGrid}>
        <div className={styles.cuerpoCard}>
          <span className={styles.cuerpoIcono} aria-hidden="true">🫁</span>
          <span className={styles.cuerpoElemento}>Oxígeno (65%)</span>
          <span className={styles.cuerpoOrigen}>Forjado en estrellas masivas</span>
        </div>
        <div className={styles.cuerpoCard}>
          <span className={styles.cuerpoIcono} aria-hidden="true">🧬</span>
          <span className={styles.cuerpoElemento}>Carbono (18%)</span>
          <span className={styles.cuerpoOrigen}>Núcleo de estrellas gigantes rojas</span>
        </div>
        <div className={styles.cuerpoCard}>
          <span className={styles.cuerpoIcono} aria-hidden="true">🩸</span>
          <span className={styles.cuerpoElemento}>Hierro (trazas)</span>
          <span className={styles.cuerpoOrigen}>Última fusión antes de la supernova</span>
        </div>
        <div className={styles.cuerpoCard}>
          <span className={styles.cuerpoIcono} aria-hidden="true">💍</span>
          <span className={styles.cuerpoElemento}>Oro (trazas)</span>
          <span className={styles.cuerpoOrigen}>Colisión de estrellas de neutrones</span>
        </div>
      </div>

      {/* Leyenda de orígenes */}
      <div className={styles.leyendaOrigenes}>
        {Object.entries(ORIGENES).map(([key, val]) => (
          <div key={key} className={styles.leyendaItem}>
            <span className={styles.leyendaColor} style={{ background: val.color }} />
            <span className={styles.leyendaTexto}>{val.label}</span>
          </div>
        ))}
      </div>

      {/* Tabla periódica simplificada */}
      <div className={styles.tablaContainer}>
        <h3 className={styles.tablaTitulo}>Tabla periódica por origen estelar</h3>
        <div className={styles.tablaGrid}>
          {ELEMENTOS.map((el, i) => (
            <div
              key={i}
              className={styles.tablaElemento}
              style={{ borderColor: ORIGENES[el.origen].color, borderLeftWidth: 4 }}
              title={`${el.nombre}: ${el.dato}`}
            >
              <span className={styles.tablaSimbolo} style={{ color: ORIGENES[el.origen].color }}>
                {el.simbolo}
              </span>
              <span className={styles.tablaNombre}>{el.nombre}</span>
              <span className={styles.tablaDato}>{el.dato}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.citaCard}>
        <p className={styles.citaTexto}>
          &ldquo;El nitrógeno de nuestro ADN, el calcio de nuestros dientes, el hierro de nuestra sangre,
          el carbono de nuestras tartas de manzana se hicieron en el interior de estrellas que colapsaron.
          Estamos hechos de materia estelar.&rdquo;
        </p>
        <span className={styles.citaAutor}>— Carl Sagan</span>
      </div>

      <div className={styles.insight}>
        <p>
          La próxima vez que mires al cielo nocturno, recuerda: no solo estás mirando estrellas.
          Estás mirando <strong>las fábricas que construyeron cada átomo de tu cuerpo</strong>.
          El universo no es algo que observamos desde fuera — somos parte de él.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorVidaEstrellaPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('nacimiento');
  const [masaSolar, setMasaSolar] = useState(1);

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'nacimiento': return <SeccionNacimiento />;
      case 'adulta': return <SeccionAdulta masaSolar={masaSolar} />;
      case 'muerte': return <SeccionMuerte masaSolar={masaSolar} />;
      case 'polvo': return <SeccionPolvo />;
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
          <h1 className={styles.title}>La Vida de una Estrella</h1>
          <p className={styles.subtitle}>De la nebulosa al agujero negro — todo lo que brilla, nace y muere</p>
        </header>

        <LegalNotice />

        {/* Slider de masa (visible en secciones 2 y 3) */}
        {(seccionActiva === 'adulta' || seccionActiva === 'muerte') && (
          <div className={styles.sliderZona}>
            <div className={styles.sliderHeader}>
              <label className={styles.sliderLabel}>Masa de la estrella</label>
              <span className={styles.sliderValor}>{formatNumber(masaSolar, 1)}x Sol</span>
            </div>
            <input
              type="range"
              className={styles.slider}
              min={5}
              max={200}
              value={masaSolar * 10}
              onChange={(e) => setMasaSolar(parseInt(e.target.value) / 10)}
              aria-label={`Masa estelar: ${formatNumber(masaSolar, 1)} veces la del Sol`}
            />
            <div className={styles.sliderExtremos}>
              <span>0,5x Sol (enana roja)</span>
              <span>20x Sol (supergigante)</span>
            </div>
          </div>
        )}

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
          title="Más sobre la vida de las estrellas"
          subtitle="Conceptos clave de astrofísica estelar"
          defaultOpen={false}
        >
          <h3>¿Por qué las estrellas brillan?</h3>
          <p>
            Las estrellas brillan porque en su núcleo se produce <strong>fusión nuclear</strong>: átomos
            de hidrógeno se unen para formar helio, liberando enormes cantidades de energía. Esta energía
            tarda miles de años en llegar desde el núcleo hasta la superficie, donde escapa como luz y calor.
          </p>

          <h3>¿Cuántas estrellas hay en el universo?</h3>
          <p>
            Se estima que hay unas <strong>200.000 millones de billones</strong> (2 × 10²³) de estrellas
            en el universo observable. Solo en la Vía Láctea hay entre 100.000 y 400.000 millones.
            Cada una con su propia historia de nacimiento, vida y muerte.
          </p>

          <h3>¿El Sol explotará como supernova?</h3>
          <p>
            No. El Sol es demasiado pequeño (1 masa solar). En unos 5.000 millones de años se expandirá
            como gigante roja, expulsará sus capas externas formando una nebulosa planetaria, y su núcleo
            quedará como enana blanca del tamaño de la Tierra. Un final pacífico.
          </p>

          <h3>¿Qué es un agujero negro?</h3>
          <p>
            Es el cadáver de una estrella muy masiva cuya gravedad es tan intensa que ni la luz puede escapar.
            No es un &quot;agujero&quot; literal — es una región del espacio donde la masa está comprimida
            en un volumen casi infinitamente pequeño. La frontera de no retorno se llama <strong>horizonte
            de sucesos</strong>.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador simplifica conceptos de astrofísica estelar con fines
            educativos. La evolución estelar real depende de muchos factores adicionales: metalicidad,
            rotación, campos magnéticos, interacción binaria, pérdida de masa por viento estelar, etc.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-vida-estrella')} />
        <ShareCard appName="visualizador-vida-estrella" />
        <Footer appName="visualizador-vida-estrella" />
      </div>
    </>
  );
}
