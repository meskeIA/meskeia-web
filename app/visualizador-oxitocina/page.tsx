'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorOxitocina.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ========================
// TIPOS
// ========================

interface Situacion {
  id: number;
  emoji: string;
  nombre: string;
  mecanismo: string;
}

interface PuntoEfecto {
  id: string;
  emoji: string;
  label: string;
  cx: string;
  cy: string;
  efecto: string;
}

interface TarjetaDato {
  id: number;
  emoji: string;
  titulo: string;
  texto: string;
}

// ========================
// DATOS
// ========================

const SITUACIONES: Situacion[] = [
  {
    id: 1,
    emoji: '🤗',
    nombre: 'Abrazo',
    mecanismo:
      'El contacto físico con alguien de confianza activa receptores táctiles que señalan al hipotálamo. Efecto: reduce el cortisol, aumenta la sensación de seguridad y bienestar.',
  },
  {
    id: 2,
    emoji: '👶',
    nombre: 'Parto',
    mecanismo:
      'La distensión del cuello uterino desencadena una cascada masiva de oxitocina que intensifica las contracciones (retroalimentación positiva de Ferguson). Es uno de los picos más altos que experimenta el cuerpo humano.',
  },
  {
    id: 3,
    emoji: '🤱',
    nombre: 'Lactancia',
    mecanismo:
      'El estímulo de succión del bebé activa la liberación pulsátil de oxitocina, que provoca la eyección de leche (reflejo de letdown). Crea un ciclo de retroalimentación positiva madre-bebé.',
  },
  {
    id: 4,
    emoji: '👀',
    nombre: 'Mirada con mascotas',
    mecanismo:
      'La mirada mutua con el perro u otras mascotas eleva la oxitocina en ambos — humano y animal. Un efecto bidireccional único entre especies documentado científicamente.',
  },
  {
    id: 5,
    emoji: '🎶',
    nombre: 'Música',
    mecanismo:
      'La música emocionalmente significativa puede estimular la liberación de oxitocina, especialmente en contextos sociales como conciertos o cantar en grupo.',
  },
  {
    id: 6,
    emoji: '🤝',
    nombre: 'Contacto social',
    mecanismo:
      'El apretón de manos y otros rituales de contacto social tienen efecto en la oxitocina. Los rituales sociales de saludo están profundamente conectados con el sistema de vínculos.',
  },
  {
    id: 7,
    emoji: '💬',
    nombre: 'Conversación íntima',
    mecanismo:
      'Compartir experiencias personales con alguien de confianza activa el sistema de oxitocina. La vulnerabilidad y la escucha activa son potentes estimuladores.',
  },
  {
    id: 8,
    emoji: '🏃',
    nombre: 'Ejercicio en grupo',
    mecanismo:
      'La actividad física sincronizada con otros eleva la oxitocina más que el ejercicio individual. La sincronización de movimientos parece ser clave en el efecto social.',
  },
  {
    id: 9,
    emoji: '😂',
    nombre: 'Reír juntos',
    mecanismo:
      'La risa compartida tiene efecto oxitocérgico similar al contacto físico. Es uno de los aceleradores más potentes de la confianza interpersonal.',
  },
  {
    id: 10,
    emoji: '🍽️',
    nombre: 'Comer juntos',
    mecanismo:
      'El ritual social de la comida compartida activa el sistema de vínculos. En todas las culturas humanas, compartir alimento es un marcador de confianza y pertenencia.',
  },
];

const PUNTOS_EFECTO: PuntoEfecto[] = [
  {
    id: 'cerebro',
    emoji: '🧠',
    label: 'Cerebro',
    cx: '50%',
    cy: '12%',
    efecto:
      'Reduce la actividad de la amígdala (centro del miedo), aumenta la confianza, mejora la lectura de emociones en los demás y refuerza la memoria social positiva.',
  },
  {
    id: 'corazon',
    emoji: '❤️',
    label: 'Corazón',
    cx: '44%',
    cy: '34%',
    efecto:
      'Leve efecto cardioprotector en situaciones de estrés agudo. Puede reducir la presión arterial y la frecuencia cardíaca cuando se libera en contextos de vínculo positivo.',
  },
  {
    id: 'sna',
    emoji: '🫁',
    label: 'Sistema nervioso autónomo',
    cx: '56%',
    cy: '42%',
    efecto:
      'Promueve el estado parasimpático ("reposa y digiere") frente al simpático ("lucha o huye"). Favorece la relajación, la digestión y la recuperación del estrés.',
  },
  {
    id: 'utero',
    emoji: '💪',
    label: 'Músculos uterinos',
    cx: '50%',
    cy: '62%',
    efecto:
      'Principal efector del parto: provoca contracciones rítmicas e intensas que progresan con el tiempo (bucle de retroalimentación positiva). También activa después del parto para reducir hemorragias.',
  },
  {
    id: 'mamas',
    emoji: '🤱',
    label: 'Glándulas mamarias',
    cx: '40%',
    cy: '38%',
    efecto:
      'Provoca la eyección de leche en respuesta a la succión del bebé. El pico de oxitocina es tan predecible que incluso escuchar llorar a un bebé puede desencadenar el reflejo.',
  },
];

const TARJETAS_DATO: TarjetaDato[] = [
  {
    id: 1,
    emoji: '🐁',
    titulo: 'Ratas de pradera vs ratas de campo',
    texto:
      'Las ratas de pradera, monógamas, tienen más receptores de oxitocina en el núcleo accumbens. Las de campo, promiscuas, tienen menos. Mismo fármaco, comportamientos opuestos según el receptor.',
  },
  {
    id: 2,
    emoji: '🐕',
    titulo: 'Perros y humanos',
    texto:
      'Un estudio de la U. Azabu (Japón, 2015) mostró que la mirada mutua perro-humano aumenta la oxitocina en ambos. Un efecto bidireccional único entre especies distintas.',
  },
  {
    id: 3,
    emoji: '👃',
    titulo: 'Administración nasal',
    texto:
      'La oxitocina se puede administrar por vía nasal en investigación. Los estudios muestran efectos mixtos: el contexto social importa mucho. No funciona igual en todos los individuos.',
  },
  {
    id: 4,
    emoji: '🤱',
    titulo: 'Diálogo hormonal',
    texto:
      'Las madres que amamantan tienen picos de oxitocina sincronizados con los del bebé, creando un "diálogo hormonal" bidireccional. La sincronización refuerza el vínculo de apego.',
  },
  {
    id: 5,
    emoji: '🏆',
    titulo: 'Victoria en equipo',
    texto:
      'Ganar una competición en equipo eleva más la oxitocina que ganar individualmente. El logro colectivo amplifica el efecto hormonal del éxito.',
  },
  {
    id: 6,
    emoji: '💔',
    titulo: 'Ruptura sentimental',
    texto:
      'Los niveles de oxitocina pueden bajar tras una ruptura de pareja, contribuyendo a la sensación de "abstinencia social". El dolor de la pérdida tiene una base fisiológica real.',
  },
];

// ========================
// COMPONENTE PRINCIPAL
// ========================

export default function VisualizadorOxitocinaPage() {
  const [situacionActiva, setSituacionActiva] = useState<number | null>(null);
  const [puntoActivo, setPuntoActivo] = useState<string | null>(null);

  const handleSituacion = (id: number) => {
    setSituacionActiva(prev => (prev === id ? null : id));
  };

  const handlePunto = (id: string) => {
    setPuntoActivo(prev => (prev === id ? null : id));
  };

  const situacionSeleccionada = SITUACIONES.find(s => s.id === situacionActiva);
  const puntoSeleccionado = PUNTOS_EFECTO.find(p => p.id === puntoActivo);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroEmoji} aria-hidden="true">🧬</div>
        <h1 className={styles.heroTitle}>Oxitocina</h1>
        <p className={styles.heroSubtitle}>La Hormona del Vínculo Social</p>
        <p className={styles.heroDesc}>
          Producida en el hipotálamo, la oxitocina gobierna la confianza, el apego y la conexión entre personas.
          Explora cuándo se libera, qué hace en el cuerpo y cómo se compara con su "prima molecular", la vasopresina.
        </p>
      </header>

      <LegalNotice />

      {/* BLOQUE 1 — Situaciones */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">⚡</span> ¿Cuándo Libera tu Cuerpo Oxitocina?
        </h2>
        <p className={styles.sectionDesc}>
          Haz clic en cualquier situación para ver el mecanismo fisiológico.
        </p>

        <div className={styles.gridSituaciones} role="list">
          {SITUACIONES.map(situacion => (
            <button
              key={situacion.id}
              type="button"
              role="listitem"
              className={`${styles.situacionCard} ${situacionActiva === situacion.id ? styles.situacionActiva : ''}`}
              onClick={() => handleSituacion(situacion.id)}
              aria-pressed={situacionActiva === situacion.id}
              aria-label={`${situacion.nombre}: ${situacionActiva === situacion.id ? 'Ocultar explicación' : 'Ver explicación'}`}
            >
              <span className={styles.situacionEmoji} aria-hidden="true">{situacion.emoji}</span>
              <span className={styles.situacionNombre}>{situacion.nombre}</span>
            </button>
          ))}
        </div>

        {situacionSeleccionada && (
          <div className={styles.panelExplicacion} role="region" aria-live="polite">
            <div className={styles.panelHeader}>
              <span aria-hidden="true">{situacionSeleccionada.emoji}</span>
              <strong>{situacionSeleccionada.nombre}</strong>
            </div>
            <p>{situacionSeleccionada.mecanismo}</p>
          </div>
        )}
      </section>

      {/* BLOQUE 2 — Diagrama corporal */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">🫀</span> Efectos de la Oxitocina en el Cuerpo
        </h2>
        <p className={styles.sectionDesc}>
          Haz clic en los puntos de la silueta para ver qué ocurre en cada sistema.
        </p>

        <div className={styles.siluetaWrapper}>
          <div className={styles.siluetaContainer}>
            {/* Silueta SVG simple */}
            <svg
              viewBox="0 0 200 480"
              className={styles.siluetaSvg}
              aria-label="Silueta humana con puntos interactivos"
              role="img"
            >
              {/* Cabeza */}
              <ellipse cx="100" cy="48" rx="32" ry="38" fill="currentColor" opacity="0.15" />
              {/* Cuello */}
              <rect x="88" y="84" width="24" height="18" rx="4" fill="currentColor" opacity="0.12" />
              {/* Torso */}
              <path d="M60 100 Q40 130 38 200 L162 200 Q160 130 140 100 Z" fill="currentColor" opacity="0.13" />
              {/* Caderas */}
              <path d="M38 200 Q30 240 42 280 L158 280 Q170 240 162 200 Z" fill="currentColor" opacity="0.12" />
              {/* Muslos */}
              <path d="M42 280 Q35 340 40 400 L88 400 Q90 340 90 280 Z" fill="currentColor" opacity="0.11" />
              <path d="M158 280 Q165 340 160 400 L112 400 Q110 340 110 280 Z" fill="currentColor" opacity="0.11" />
              {/* Piernas */}
              <path d="M40 400 Q38 440 42 480 L88 480 L88 400 Z" fill="currentColor" opacity="0.10" />
              <path d="M160 400 Q162 440 158 480 L112 480 L112 400 Z" fill="currentColor" opacity="0.10" />
              {/* Brazos */}
              <path d="M60 105 Q30 140 20 200 L40 205 Q48 145 72 112 Z" fill="currentColor" opacity="0.11" />
              <path d="M140 105 Q170 140 180 200 L160 205 Q152 145 128 112 Z" fill="currentColor" opacity="0.11" />

              {/* Puntos interactivos */}
              {PUNTOS_EFECTO.map(punto => (
                <g key={punto.id}>
                  <circle
                    cx={punto.cx}
                    cy={punto.cy}
                    r="12"
                    className={`${styles.puntoCirculo} ${puntoActivo === punto.id ? styles.puntoActivo : ''}`}
                    onClick={() => handlePunto(punto.id)}
                    role="button"
                    aria-label={`Ver efecto en: ${punto.label}`}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handlePunto(punto.id); }}
                  />
                  <text
                    x={punto.cx}
                    y={punto.cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="10"
                    className={styles.puntoEmoji}
                    onClick={() => handlePunto(punto.id)}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {punto.emoji}
                  </text>
                </g>
              ))}
            </svg>

            {/* Leyenda */}
            <div className={styles.leyenda}>
              {PUNTOS_EFECTO.map(punto => (
                <button
                  key={punto.id}
                  type="button"
                  className={`${styles.leyendaItem} ${puntoActivo === punto.id ? styles.leyendaActiva : ''}`}
                  onClick={() => handlePunto(punto.id)}
                  aria-pressed={puntoActivo === punto.id}
                >
                  <span aria-hidden="true">{punto.emoji}</span>
                  <span>{punto.label}</span>
                </button>
              ))}
            </div>
          </div>

          {puntoSeleccionado && (
            <div className={styles.infoEfecto} role="region" aria-live="polite">
              <div className={styles.infoEfectoHeader}>
                <span aria-hidden="true">{puntoSeleccionado.emoji}</span>
                <strong>{puntoSeleccionado.label}</strong>
              </div>
              <p>{puntoSeleccionado.efecto}</p>
            </div>
          )}
        </div>
      </section>

      {/* BLOQUE 3 — Oxitocina vs Vasopresina */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">🔬</span> Oxitocina vs Vasopresina: Las Dos Hormonas del Vínculo
        </h2>
        <p className={styles.sectionDesc}>
          Ambas se producen en el hipotálamo y difieren en solo 2 de sus 9 aminoácidos. Son "primas moleculares" con roles sociales distintos.
        </p>

        <div className={styles.tablaWrapper}>
          <table className={styles.tablaComparativa}>
            <thead>
              <tr>
                <th scope="col">Aspecto</th>
                <th scope="col" className={styles.colOxitocina}><span aria-hidden="true">🩷</span> Oxitocina</th>
                <th scope="col" className={styles.colVasopresina}><span aria-hidden="true">🔵</span> Vasopresina</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Origen</td>
                <td>Hipotálamo (núcleos PVN y SON)</td>
                <td>Hipotálamo (mismos núcleos)</td>
              </tr>
              <tr>
                <td>Estructura</td>
                <td>Nonapéptido (9 aa)</td>
                <td>Nonapéptido (9 aa, 2 distintos)</td>
              </tr>
              <tr>
                <td>Rol en vínculos</td>
                <td>Vínculos madre-hijo, pareja, grupo</td>
                <td>Vínculos de pareja (más en hombres), territorialidad</td>
              </tr>
              <tr>
                <td>Rol en reproducción</td>
                <td>Parto, lactancia</td>
                <td>Menos implicada</td>
              </tr>
              <tr>
                <td>Efecto en riñón</td>
                <td>Leve</td>
                <td>Regula reabsorción de agua (antidiurética)</td>
              </tr>
              <tr>
                <td>"Lado oscuro"</td>
                <td>Puede aumentar desconfianza hacia el outgroup</td>
                <td>Puede aumentar comportamiento agresivo protector</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.notaParadoja}>
          <span aria-hidden="true">⚠️</span>
          <p>
            <strong>La paradoja del vínculo:</strong> Las hormonas del vínculo no son "solo positivas".
            La oxitocina aumenta la confianza <em>dentro</em> del grupo, pero puede aumentar la desconfianza
            hacia fuera. Su efecto depende siempre del contexto y del grupo social.
          </p>
        </div>
      </section>

      {/* BLOQUE 4 — Datos curiosos */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">📊</span> Datos Curiosos de la Ciencia
        </h2>
        <p className={styles.sectionDesc}>
          Hallazgos verificados de la investigación sobre oxitocina y comportamiento social.
        </p>

        <div className={styles.gridDatos}>
          {TARJETAS_DATO.map(tarjeta => (
            <div key={tarjeta.id} className={styles.tarjetaDato}>
              <div className={styles.tarjetaEmoji} aria-hidden="true">{tarjeta.emoji}</div>
              <h3 className={styles.tarjetaTitulo}>{tarjeta.titulo}</h3>
              <p className={styles.tarjetaTexto}>{tarjeta.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sección educativa */}
      <EducationalSection
        title="Profundiza en la Neurociencia de la Oxitocina"
        subtitle="Conceptos clave para entender la hormona del vínculo"
      >
        <section>
          <h2>¿Dónde se produce la oxitocina?</h2>
          <p>
            La oxitocina se sintetiza principalmente en dos núcleos del hipotálamo: el núcleo paraventricular (PVN) y
            el núcleo supraóptico (SON). Desde ahí, puede liberarse de dos formas: al torrente sanguíneo a través
            de la hipófisis posterior (función hormonal) o directamente en el cerebro como neurotransmisor
            (función neuromoduladora). Esta dualidad explica por qué tiene efectos tanto periféricos (útero, mamas)
            como centrales (amígdala, comportamiento social).
          </p>

          <h2>El sistema oxitocérgico: neuronas y circuitos</h2>
          <p>
            Las neuronas oxitocérgicas proyectan hacia múltiples regiones cerebrales: la amígdala (regulación del
            miedo), el núcleo accumbens (recompensa), el hipocampo (memoria) y el tronco cerebral (sistema nervioso
            autónomo). Esta distribución amplia explica por qué la oxitocina tiene efectos tan variados: desde
            reducir la ansiedad hasta modular la memoria social y la conducta de apego.
          </p>

          <h2>Oxitocina y autismo: qué dice la investigación</h2>
          <p>
            Algunos estudios han explorado la administración de oxitocina intranasal como posible ayuda en el
            espectro autista, dado el rol de la hormona en la cognición social. Sin embargo, los resultados son
            inconsistentes: algunos ensayos clínicos muestran mejoras en reconocimiento de emociones, otros no
            replican los efectos. La investigación está en curso y no hay actualmente ningún tratamiento validado
            basado en oxitocina para el autismo. La complejidad del espectro hace difícil generalizar.
          </p>

          <h2>La paradoja de la oxitocina: hormona del "nosotros" vs el "ellos"</h2>
          <p>
            Uno de los hallazgos más sorprendentes de la investigación reciente es que la oxitocina no es
            simplemente "la hormona del amor universal". Aumenta la confianza y la cooperación dentro del grupo,
            pero puede aumentar la desconfianza, el etnocentrismo y la agresión defensiva hacia los que se perciben
            como fuera del grupo. Carsten de Dreu (Universidad de Ámsterdam) documentó este efecto: la oxitocina
            promueve el "parroquialismo" — favoritismo hacia el ingroup combinado con hostilidad potencial hacia el
            outgroup.
          </p>

          <h2>Oxitocina y altruismo: ¿somos generosos por hormona?</h2>
          <p>
            Varios estudios han mostrado que administrar oxitocina nasal aumenta el comportamiento prosocial:
            donaciones en juegos económicos, generosidad en situaciones de dilema social. Sin embargo, este altruismo
            también tiene límites: es más fuerte hacia personas del mismo grupo y se reduce o desaparece hacia
            extraños o outgroups. El altruismo humano es más selectivo de lo que los titulares populares sugieren.
          </p>

          <div className={styles.warningBox} role="note">
            <strong>Nota sobre la investigación:</strong> La neurociencia de la oxitocina está en evolución.
            Muchos estudios son en animales o con muestras pequeñas. Varios resultados en humanos no se han
            replicado de forma consistente. Los efectos en humanos son más complejos de lo que los titulares
            populares — "la hormona del amor" — sugieren. La ciencia real es más matizada y fascinante.
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-oxitocina')} />

      <ShareCard appName="visualizador-oxitocina" />

      <Footer appName="visualizador-oxitocina" />
    </div>
  );
}
