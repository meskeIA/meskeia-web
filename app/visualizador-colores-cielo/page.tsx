'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './VisualizadorColoresCielo.module.css';

interface PaletaColor {
  nombre: string;
  limpio: string;
  turbio: string;
}

interface Fase {
  id: string;
  nombre: string;
  icono: string;
  horas: string;
  elevacionSol: number;
  descripcion: string;
  fisicaExplicacion: string;
  consejoFoto: string;
  paleta: [PaletaColor, PaletaColor, PaletaColor];
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function lerpColor(hex1: string, hex2: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const r = Math.round(r1 + (r2 - r1) * t).toString(16).padStart(2, '0');
  const g = Math.round(g1 + (g2 - g1) * t).toString(16).padStart(2, '0');
  const b = Math.round(b1 + (b2 - b1) * t).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

const FASES: Fase[] = [
  {
    id: 'noche-profunda',
    nombre: 'Noche Profunda',
    icono: '🌑',
    horas: '22:00 — 4:30',
    elevacionSol: -45,
    descripcion: 'El Sol está muy por debajo del horizonte. La atmósfera no dispersa ninguna luz solar y el cielo refleja únicamente el airglow natural y la luz zodiacal: un tenue resplandor azulado-violáceo invisible a simple vista en zonas urbanas.',
    fisicaExplicacion: 'Ausencia de dispersión solar. El airglow (emisión por recombinación de O₂ ionizado a 90 km de altitud) aporta ~250 R de brillo, equivalente a mv ≈ 22/arcsec². La luz zodiacal se debe a dispersión de luz solar en polvo interplanetario eclíptico.',
    consejoFoto: 'ISO 3200-6400, f/1.4-f/2.8, 15-25 s. Usa la "regla 500" para evitar trail de estrellas: tiempo máximo = 500 ÷ distancia focal (o 300 ÷ focal en cuerpos crop). Apunta al Sur para capturar el núcleo galáctico entre marzo y septiembre.',
    paleta: [
      { nombre: 'Cénit', limpio: '#04041a', turbio: '#060620' },
      { nombre: 'Punto Medio', limpio: '#0a0a2e', turbio: '#0e0e35' },
      { nombre: 'Horizonte', limpio: '#161640', turbio: '#1c1c4a' },
    ],
  },
  {
    id: 'hora-azul-matinal',
    nombre: 'Hora Azul — Alba',
    icono: '🌌',
    horas: '4:30 — 5:30',
    elevacionSol: -8,
    descripcion: 'El Sol está entre -18° y -6° bajo el horizonte. La luz solar comienza a dispersarse en las capas altas de la troposfera y estratosfera, produciendo el azul característico más puro del día. Las estrellas más brillantes aún son visibles.',
    fisicaExplicacion: 'Crepúsculo náutico y astronómico. La capa de ozono (estratosfera, 20-35 km) absorbe intensamente en el UV y en el rojo-naranja (banda de Chappuis, 500-700 nm), filtrando los tonos cálidos. Solo penetran el azul índigo y el violeta, creando el "azul de ozona" característico.',
    consejoFoto: 'Luz uniforme y sin sombras duras. Perfecta para arquitectura y cityscapes: el cielo azul profundo equilibra visualmente la iluminación artificial cálida de edificios e interiores, eliminando la necesidad de HDR.',
    paleta: [
      { nombre: 'Cénit', limpio: '#0d1a3e', turbio: '#0f1c42' },
      { nombre: 'Punto Medio', limpio: '#1a3060', turbio: '#202f65' },
      { nombre: 'Horizonte', limpio: '#2a4a80', turbio: '#35507a' },
    ],
  },
  {
    id: 'pre-amanecer',
    nombre: 'Pre-amanecer',
    icono: '🌆',
    horas: '5:30 — 6:00',
    elevacionSol: -2,
    descripcion: 'Crepúsculo civil. El Sol está a menos de 6° bajo el horizonte. El horizonte se tiñe de lila y magenta mientras el cénit mantiene el azul profundo, creando un bicolor único de apenas 15-20 minutos de duración.',
    fisicaExplicacion: 'La luz solar alcanza el horizonte con camino óptico máximo, mezclando dispersión de Rayleigh (azul en cénit, λ⁻⁴) con dispersión de Mie por aerosoles de la capa límite (tonos rosa-magenta). La diferencia de color entre cénit y horizonte es de ~3500 K.',
    consejoFoto: 'Ventana de 10-20 minutos con bicolor cielo único. Ideal para paisajes montañosos y costas donde el horizonte está limpio. Usa un filtro degradado ND para equilibrar la exposición del cielo brillante con el primer plano oscuro.',
    paleta: [
      { nombre: 'Cénit', limpio: '#1a1a50', turbio: '#1e1e4e' },
      { nombre: 'Punto Medio', limpio: '#6a3090', turbio: '#7a3060' },
      { nombre: 'Horizonte', limpio: '#c05090', turbio: '#c04040' },
    ],
  },
  {
    id: 'amanecer',
    nombre: 'Amanecer',
    icono: '🌅',
    horas: '6:00 — 6:20',
    elevacionSol: 1,
    descripcion: 'El disco solar asoma en el horizonte. La luz recorre ~38 veces más atmósfera que al mediodía. La temperatura de color cae a 2000-3000 K. Toda la radiación azul y verde se dispersa y solo los rojos y naranjas llegan al suelo.',
    fisicaExplicacion: 'Camino óptico máximo (masa de aire ~38). Según la ley de Bouguer-Lambert-Beer, la transmitancia del azul (450 nm) es e^(-38τ_Rayleigh) ≈ 0,001, mientras el rojo (700 nm) transmite ~40%. El disco solar aparece anaranjado-rojizo por atenuación selectiva.',
    consejoFoto: 'Máximo contraste cromático: cielo naranja vs. azul residual en el cénit. Usa el histograma para no sobreexponer el horizonte. Las primeras sombras largas dan volumen máximo al terreno.',
    paleta: [
      { nombre: 'Cénit', limpio: '#1e2e60', turbio: '#1c1c45' },
      { nombre: 'Punto Medio', limpio: '#b84020', turbio: '#c03010' },
      { nombre: 'Horizonte', limpio: '#f07830', turbio: '#f04010' },
    ],
  },
  {
    id: 'golden-hour-manana',
    nombre: 'Golden Hour — Mañana',
    icono: '✨',
    horas: '6:20 — 7:30',
    elevacionSol: 5,
    descripcion: 'La "hora dorada" de los fotógrafos. El Sol está entre 0° y 10°, con un camino óptico de 6-10 veces el cénit. Luz difusa, cálida (3000-4500 K) y con sombras largas que dan volumen y textura a cualquier sujeto.',
    fisicaExplicacion: 'Con masa de aire 6-10, los azules se atenúan moderadamente (transmitancia 10-30%) pero no desaparecen. El balance entre Rayleigh residual (azul en cénit) y luz directa cálida produce el característico bicolor dorado-azul de esta fase.',
    consejoFoto: 'La luz rasante moldea cada textura. La dirección lateral perfecta para retratos, arquitectura y macro. Prueba el contraluz para crear halos y flares cálidos. La temperatura de color (3000-4500 K) es similar a las luces de tungsteno del cine clásico.',
    paleta: [
      { nombre: 'Cénit', limpio: '#2a4a80', turbio: '#1e2e50' },
      { nombre: 'Punto Medio', limpio: '#c08020', turbio: '#d06010' },
      { nombre: 'Horizonte', limpio: '#f0c040', turbio: '#f09020' },
    ],
  },
  {
    id: 'manana',
    nombre: 'Mañana',
    icono: '☀️',
    horas: '7:30 — 10:00',
    elevacionSol: 20,
    descripcion: 'Sol entre 10° y 30°. El azul se dispersa en todas direcciones creando el cielo azul celeste característico. La temperatura de color sube a 5000-5500 K y las sombras son todavía largas, favoreciendo la dirección de la luz.',
    fisicaExplicacion: 'Dispersión de Rayleigh dominante con masa de aire 3-6. El color del cielo sigue la distribución espectral de Rayleigh puro, con máximo de dispersión en ~450 nm. El cénit azul es más saturado que el horizonte por la menor cantidad de atmósfera.',
    consejoFoto: 'Temperatura de color cercana a la del flash estudio (5000-5500 K). Buen momento para retratos al sol con un reflector plateado para suavizar sombras bajo los ojos. El contraste es moderado y las sombras aún tienen dirección.',
    paleta: [
      { nombre: 'Cénit', limpio: '#1a6ec0', turbio: '#2878b0' },
      { nombre: 'Punto Medio', limpio: '#4a9ad4', turbio: '#5aa0c0' },
      { nombre: 'Horizonte', limpio: '#8ac8e8', turbio: '#a0c8d8' },
    ],
  },
  {
    id: 'mediodia',
    nombre: 'Mediodía',
    icono: '🌞',
    horas: '10:00 — 14:00',
    elevacionSol: 55,
    descripcion: 'El Sol alcanza su máxima elevación. El camino óptico es mínimo (~1×). El azul del cénit es el más puro e intenso del día (Rayleigh puro). La temperatura de color alcanza 5500-6500 K.',
    fisicaExplicacion: 'Masa de aire ≈ 1 (cénit) a 2 (60° de elevación). La transmitancia del azul es máxima (~80-90%). El gradiente de saturación de azul entre cénit y horizonte (~20°) es de ~15 puntos HSL, visible a simple vista en cielos despejados.',
    consejoFoto: 'La luz cenital es la más dura del día: sombras cortas y negras bajo los ojos en retratos. Busca sombra para personas, o aprovecha el mediodía para patrones abstractos, arquitectura urbana y colores saturados de objetos.',
    paleta: [
      { nombre: 'Cénit', limpio: '#0a50b0', turbio: '#1a58b0' },
      { nombre: 'Punto Medio', limpio: '#1a78c8', turbio: '#3a88c0' },
      { nombre: 'Horizonte', limpio: '#4aa0d8', turbio: '#60a8d0' },
    ],
  },
  {
    id: 'media-tarde',
    nombre: 'Media Tarde',
    icono: '⛅',
    horas: '14:00 — 17:00',
    elevacionSol: 30,
    descripcion: 'Sol descendiendo. El azul del cénit comienza a suavizarse levemente. En cielos con turbidez acumulada por el calor del día, el horizonte empieza a mostrar el primer tinte amarillento conforme aumenta el camino óptico del Sol.',
    fisicaExplicacion: 'La turbidez media suele ser mayor que al inicio del día: la convección térmica levanta aerosoles y polvo. Esto amplifica la dispersión de Mie en el horizonte, añadiendo el primer toque amarillento que precede a la golden hour vespertina.',
    consejoFoto: 'Las sombras se alargan gradualmente. El momento de posicionar sujetos para aprovechar la creciente directionalidad de la luz antes de la golden hour. Con ángulo adecuado, ya se obtienen sombras con longitud fotogénica.',
    paleta: [
      { nombre: 'Cénit', limpio: '#0c52b2', turbio: '#1c60b0' },
      { nombre: 'Punto Medio', limpio: '#2080cc', turbio: '#4090c0' },
      { nombre: 'Horizonte', limpio: '#50a8da', turbio: '#70b0d5' },
    ],
  },
  {
    id: 'golden-hour-tarde',
    nombre: 'Golden Hour — Tarde',
    icono: '🌇',
    horas: '17:00 — 19:00',
    elevacionSol: 6,
    descripcion: 'Segunda "hora dorada". Simétrica a la matinal pero con una diferencia clave: la turbidez vespertina (calor acumulado + evaporación) intensifica los naranjas y enriquece la paleta. En latitudes medias dura 40-60 minutos.',
    fisicaExplicacion: 'La turbidez óptica vespertina (τ ≈ 0,3-0,6 en verano) desplaza el espectro dominante hacia λ > 580 nm más que por la mañana (τ ≈ 0,1-0,2 tras la noche). El efecto neto es una golden hour vespertina con naranjas más saturados y transiciones más suaves.',
    consejoFoto: 'El contraluz es especialmente potente en esta fase. Prueba siluetas con el Sol a tu espalda o exposición para el cielo con relleno de flash. La diferencia de temperatura de color entre sol y sombra (~2000 K) crea contrastes dramáticos.',
    paleta: [
      { nombre: 'Cénit', limpio: '#2a4a80', turbio: '#1e2e50' },
      { nombre: 'Punto Medio', limpio: '#d08030', turbio: '#d06010' },
      { nombre: 'Horizonte', limpio: '#f0c040', turbio: '#f09020' },
    ],
  },
  {
    id: 'atardecer',
    nombre: 'Atardecer',
    icono: '🌅',
    horas: '19:00 — 19:30',
    elevacionSol: 0,
    descripcion: 'Simétrico al amanecer pero con mayor turbidez y un fenómeno único: el Cinturón de Venus. Al girar 180° respecto al Sol, aparece una franja rosada sobre el horizonte oriental: la sombra de la Tierra proyectada en la atmósfera.',
    fisicaExplicacion: 'La turbidez diurna acumulada (τ vespertino > τ matutino) amplifica los tonos rojos respecto al amanecer. El Cinturón de Venus (~15° sobre el horizonte opuesto) se debe a la dispersión de la luz solar en la zona donde la atmósfera pasa de iluminada a sombreada.',
    consejoFoto: 'Gira 180° respecto al Sol poniente para fotografiar el Cinturón de Venus. Una composición de gran angular con el rosa del cinturón sobre un lago o mar es difícil de igualar. La metering matricial puede fallar: mide en el cielo a 45° del horizonte.',
    paleta: [
      { nombre: 'Cénit', limpio: '#1e2e5a', turbio: '#1a1a40' },
      { nombre: 'Punto Medio', limpio: '#a03020', turbio: '#b02010' },
      { nombre: 'Horizonte', limpio: '#e86830', turbio: '#e83010' },
    ],
  },
  {
    id: 'hora-azul-tarde',
    nombre: 'Hora Azul — Ocaso',
    icono: '🌃',
    horas: '19:30 — 20:30',
    elevacionSol: -5,
    descripcion: 'El cielo oscila entre azul profundo en el cénit y ciano-turquesa en el horizonte. La iluminación urbana cálida contrasta con el frío del cielo, creando la combinación más fotogénica para fotografía de ciudad.',
    fisicaExplicacion: 'Simétrica a la hora azul matinal. La absorción de la capa de ozono (banda de Chappuis, 500-700 nm) elimina los rojos residuales. El espectro resulta dominado por 430-510 nm (azul-ciano). Ventana de 10-15 minutos antes de que el cielo se oscurezca completamente.',
    consejoFoto: 'La ventana más buscada por fotógrafos de arquitectura y ciudad. La exposición se equilibra naturalmente entre interior y exterior sin necesidad de HDR. Trípode obligatorio: 1-4 segundos a f/8-f/11, ISO 400-800.',
    paleta: [
      { nombre: 'Cénit', limpio: '#0e1a3e', turbio: '#0f1c42' },
      { nombre: 'Punto Medio', limpio: '#1a3060', turbio: '#1f3065' },
      { nombre: 'Horizonte', limpio: '#305a8a', turbio: '#3a5080' },
    ],
  },
  {
    id: 'anochecer',
    nombre: 'Anochecer',
    icono: '🌙',
    horas: '20:30 — 22:00',
    elevacionSol: -15,
    descripcion: 'Transición hacia la noche. El Sol está entre -6° y -18° bajo el horizonte. El horizonte retiene un levísimo rubor índigo que se apaga progresivamente. Las primeras estrellas se hacen visibles según avanza la oscuridad.',
    fisicaExplicacion: 'Crepúsculo astronómico tardío. La dispersión atmosférica cesa gradualmente conforme el ángulo solar disminuye. El horizonte retiene ~10-15 minutos de luz residual azul-índigo antes de alcanzar la oscuridad astronómica real (mag > 21/arcsec²).',
    consejoFoto: 'Inicio del cielo nocturno. Con exposiciones de 5-30 segundos puedes mezclar el último vestigio de luz azul con el cielo estrellado naciente, creando un gradiente natural de noche que ningún postprocesado puede replicar fielmente.',
    paleta: [
      { nombre: 'Cénit', limpio: '#070718', turbio: '#08081e' },
      { nombre: 'Punto Medio', limpio: '#0c0c28', turbio: '#0e0e2e' },
      { nombre: 'Horizonte', limpio: '#181840', turbio: '#1e1e48' },
    ],
  },
];

function getTurbidezLabel(valor: number): string {
  if (valor <= 15) return 'Aire alpino (τ ≈ 0.05)';
  if (valor <= 35) return 'Aire marino limpio (τ ≈ 0.15)';
  if (valor <= 55) return 'Aire urbano típico (τ ≈ 0.35)';
  if (valor <= 75) return 'Bruma húmeda (τ ≈ 0.55)';
  return 'Calima sahariana (τ ≈ 0.90)';
}

export default function VisualizadorColoresCielo() {
  const [faseActiva, setFaseActiva] = useState<number>(6);
  const [turbidez, setTurbidez] = useState<number>(20);
  const [hexCopiado, setHexCopiado] = useState<string>('');

  const fase = FASES[faseActiva];
  const t = turbidez / 100;

  const coloresCalculados = fase.paleta.map((c) => ({
    nombre: c.nombre,
    hex: lerpColor(c.limpio, c.turbio, t),
    hexLimpio: c.limpio,
    hexTurbio: c.turbio,
  }));

  const gradiente = `linear-gradient(to bottom, ${coloresCalculados[0].hex} 0%, ${coloresCalculados[1].hex} 55%, ${coloresCalculados[2].hex} 100%)`;

  const copiarHex = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      setHexCopiado(hex);
      setTimeout(() => setHexCopiado(''), 1800);
    });
  }, []);

  const elevNorm = Math.max(-20, Math.min(90, fase.elevacionSol));
  const sunY = elevNorm >= 0
    ? Math.max(8, 90 - (elevNorm / 90) * 75)
    : 100;
  const sunX = 50;
  const sunVisible = elevNorm > -5;

  const relatedApps = getRelatedApps('visualizador-colores-cielo');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Colores del Cielo</h1>
        <p>Evolución cromática en 24 horas — física atmosférica, paleta HEX y consejos de fotografía</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <div className={styles.skyWrapper}>
          <div
            className={styles.skyDisplay}
            style={{ background: gradiente }}
            role="img"
            aria-label={`Simulación del cielo durante ${fase.nombre}`}
          >
            {sunVisible && (
              <div
                className={styles.sunDot}
                style={{
                  top: `${sunY}%`,
                  left: `${sunX}%`,
                  opacity: elevNorm > 5 ? 1 : 0.6 + elevNorm * 0.08,
                }}
                aria-hidden="true"
              />
            )}
            <div className={styles.skyLabel}>
              <span className={styles.skyIcon} aria-hidden="true">{fase.icono}</span>
              <span className={styles.skyNombre}>{fase.nombre}</span>
              <span className={styles.skyHoras}>{fase.horas}</span>
            </div>
            <div className={styles.elevacionBadge} aria-label={`Elevación solar: ${fase.elevacionSol}°`}>
              ☀️ {fase.elevacionSol > 0 ? `+${fase.elevacionSol}°` : `${fase.elevacionSol}°`}
            </div>
          </div>

          <div className={styles.paletaRow}>
            {coloresCalculados.map((c) => (
              <button
                key={c.nombre}
                type="button"
                className={`${styles.swatchBtn} ${hexCopiado === c.hex ? styles.swatchCopiado : ''}`}
                style={{ background: c.hex }}
                onClick={() => copiarHex(c.hex)}
                aria-label={`Copiar color ${c.nombre}: ${c.hex}`}
                title={`${c.nombre} — clic para copiar`}
              >
                <span className={styles.swatchNombre}>{c.nombre}</span>
                <span className={styles.swatchHex}>
                  {hexCopiado === c.hex ? '¡Copiado!' : c.hex.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.timeline} role="tablist" aria-label="Fases del cielo">
          {FASES.map((f, idx) => {
            const tLocal = turbidez / 100;
            const zenithLerp = lerpColor(f.paleta[0].limpio, f.paleta[0].turbio, tLocal);
            const horizLerp = lerpColor(f.paleta[2].limpio, f.paleta[2].turbio, tLocal);
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={idx === faseActiva}
                className={`${styles.timelineCard} ${idx === faseActiva ? styles.timelineCardActiva : ''}`}
                style={{
                  background: `linear-gradient(to bottom, ${zenithLerp}, ${horizLerp})`,
                }}
                onClick={() => setFaseActiva(idx)}
              >
                <span className={styles.timelineIcono}>{f.icono}</span>
                <span className={styles.timelineNombre}>{f.nombre}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.controlesPanel}>
          <div className={styles.turbidezControl}>
            <label htmlFor="turbidez" className={styles.turbidezLabel}>
              <span>🌫️ Turbidez atmosférica</span>
              <span className={styles.turbidezValor}>{getTurbidezLabel(turbidez)}</span>
            </label>
            <div className={styles.sliderRow}>
              <span className={styles.sliderEtiq}>Limpio</span>
              <input
                id="turbidez"
                type="range"
                min={0}
                max={100}
                value={turbidez}
                onChange={(e) => setTurbidez(Number(e.target.value))}
                className={styles.slider}
                aria-valuetext={getTurbidezLabel(turbidez)}
              />
              <span className={styles.sliderEtiq}>Calima</span>
            </div>
            <p className={styles.turbidezDesc}>
              Arrastra para ver cómo la dispersión de Mie (partículas en suspensión) modifica los colores del cielo.
            </p>
          </div>
        </div>

        <div className={styles.faseInfo}>
          <div className={styles.faseInfoCard}>
            <h2 className={styles.faseInfoTitulo}>
              <span aria-hidden="true">{fase.icono}</span> {fase.nombre}
            </h2>
            <p className={styles.faseInfoDesc}>{fase.descripcion}</p>

            <div className={styles.faseInfoGrid}>
              <div className={styles.faseInfoBloque}>
                <h3 className={styles.faseInfoSubtitulo}><span aria-hidden="true">⚗️</span> Física atmosférica</h3>
                <p>{fase.fisicaExplicacion}</p>
              </div>
              <div className={styles.faseInfoBloque}>
                <h3 className={styles.faseInfoSubtitulo}><span aria-hidden="true">📷</span> Consejo fotográfico</h3>
                <p>{fase.consejoFoto}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <EducationalSection
        title="Guía Completa: La Física del Color del Cielo"
        subtitle="Rayleigh, Mie, golden hour y cómo usar cada fase para fotografía y diseño"
        icon="🌈"
      >
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Fase</th>
                <th>Elevación Sol</th>
                <th>Temperatura Color</th>
                <th>Fenómeno Físico</th>
                <th>Mejor Para</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>🌑 Noche</td>
                <td>&lt; -18°</td>
                <td>— (sin Sol)</td>
                <td>Airglow, luz zodiacal</td>
                <td>Astrofotografía</td>
              </tr>
              <tr>
                <td>🌌 Hora azul alba</td>
                <td>-6° a -18°</td>
                <td>~7000-10000 K</td>
                <td>Absorción de ozono</td>
                <td>Arquitectura, ciudad</td>
              </tr>
              <tr>
                <td>🌅 Amanecer</td>
                <td>0°</td>
                <td>~2000-3000 K</td>
                <td>Rayleigh máximo (masa aire 38)</td>
                <td>Paisaje, contraste extremo</td>
              </tr>
              <tr>
                <td>✨ Golden hour</td>
                <td>0°-6°</td>
                <td>3000-4500 K</td>
                <td>Rayleigh con masa aire 6-10</td>
                <td>Retratos, paisaje, cine</td>
              </tr>
              <tr>
                <td>☀️ Mañana</td>
                <td>10°-30°</td>
                <td>5000-5500 K</td>
                <td>Rayleigh dominante</td>
                <td>Retratos con reflector</td>
              </tr>
              <tr>
                <td>🌞 Mediodía</td>
                <td>40°-70°</td>
                <td>5500-6500 K</td>
                <td>Rayleigh puro, masa aire ≈1</td>
                <td>Patrones, color saturo</td>
              </tr>
              <tr>
                <td>🌃 Hora azul ocaso</td>
                <td>-4° a -6°</td>
                <td>~7000-10000 K</td>
                <td>Absorción de ozono</td>
                <td>Cityscape, interior/exterior</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h4><span aria-hidden="true">📸</span> Fotógrafo de paisaje</h4>
            <p>Planifica amanecer y atardecer según la orientación del paisaje: usa las golden hours para luz lateral que da volumen. El Cinturón de Venus (horizonte opuesto al atardecer) añade una franja rosada única. Consulta la app <strong>Golden Hour</strong> para calcular los horarios exactos por ubicación.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h4><span aria-hidden="true">🎨</span> Diseñador gráfico</h4>
            <p>Las paletas de cielo tienen armonía natural porque siguen el espectro solar. Los azules nocturnos (#0a0a2e) combinan de forma armónica con los dorados de la golden hour (#f0c040). Copia los HEX de cada fase directamente con un clic para usar en tu diseño.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h4><span aria-hidden="true">🏙️</span> Fotógrafo de arquitectura</h4>
            <p>Las horas azules (alba y ocaso) son las ventanas ideales: el cielo uniforme azul-ciano equilibra visualmente la iluminación cálida de edificios iluminados, sin necesidad de HDR. La ventana dura solo 10-15 minutos: prepara encuadre y ajustes con antelación.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h4><span aria-hidden="true">🎬</span> Cineasta y director de fotografía</h4>
            <p>La golden hour (3000-4500 K) es la temperatura de color favorita del cine clásico, similar al tungsteno. La hora azul crea el ambiente de "final de tarde artificial" que el cine noir usaba con filtros. En exteriores, el cielo es la fuente de luz más grande del mundo.</p>
          </div>
        </div>

        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Por qué el cielo nocturno no es negro puro?</h4>
            <p>El cielo nocturno emite luz propia llamada <em>airglow</em>: la recombinación de moléculas de O₂ ionizadas durante el día libera fotones por la noche a altitudes de 80-100 km. Añade ~250 Rayleigh de brillo, más la luz zodiacal (polvo interplanetario que dispersa el sol). En zonas sin contaminación lumínica, el cielo nunca llega al negro absoluto.</p>
            <span className={styles.faqTip}>💡 Dato: el fundamento del límite de magnitud 21-22 en astrofotografía viene precisamente del airglow natural.</span>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué los amaneceres y atardeceres son más rojos con calima?</h4>
            <p>Con polvo o humedad en suspensión, se añade dispersión de Mie (partículas grandes, efecto no selectivo) sobre la dispersión de Rayleigh. Pero en el horizonte al amanecer/atardecer, la luz ya llega con muy poco azul (dispersado completamente por la masa de aire). La dispersión de Mie amplifica y extiende los rojos-naranjas residuales, saturando aún más la gama cálida.</p>
            <span className={styles.faqTip}>💡 Por eso los atardeceres tras erupciones volcánicas o con polvo sahariano son espectacularmente rojos.</span>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuánto dura realmente la golden hour?</h4>
            <p>Depende de la latitud y la época del año. En el ecuador puede durar solo 20-25 minutos. En Madrid (40°N) en verano dura ~50-60 minutos. En el Círculo Polar en verano puede prolongarse horas porque el Sol avanza muy lentamente respecto al horizonte. La "regla" del nombre es simplificadora: en realidad se llama hora pero puede ser mucho menos.</p>
            <span className={styles.faqTip}>💡 Para calcular la golden hour exacta de cualquier día y lugar, usa la app Golden Hour de meskeIA.</span>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué la hora azul tiene ese color tan específico?</h4>
            <p>La capa de ozono estratosférico (20-35 km) absorbe intensamente en el rango 500-700 nm (banda de Chappuis), eliminando los verdes, amarillos, naranjas y rojos residuales del crepúsculo. Solo las longitudes de onda cortas (400-500 nm, azul-índigo-violeta) atraviesan sin atenuarse. El resultado es ese azul saturado y homogéneo que distingue la hora azul de cualquier otra fase del día.</p>
            <span className={styles.faqTip}>💡 La misma capa de ozono que nos protege del UV crea una de las fases más fotogénicas del día.</span>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué es el Cinturón de Venus que aparece al atardecer?</h4>
            <p>El Cinturón de Venus es la franja rosada-púrpura visible en el horizonte opuesto al Sol poniente, a unos 10-20° sobre el horizonte. Es literalmente la sombra de la Tierra proyectada en la atmósfera: la zona donde la atmósfera baja deja de estar iluminada directamente. El rosa se debe a la retroiluminación de la luz solar crepuscular sobre el horizonte oriental.</p>
            <span className={styles.faqTip}>💡 Para fotografiarlo, gira 180° respecto al Sol poniente unos minutos después de que el disco solar desaparezca.</span>
          </div>
        </div>

        <div className={styles.stepGuide}>
          <h3 className={styles.stepGuideTitle}>Cómo usar esta herramienta</h3>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Elige la fase del día</strong> — Haz clic en cualquier tarjeta de la línea de tiempo para ver el cielo de esa fase. Las 12 fases cubren el ciclo completo de 24 horas.
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Ajusta la turbidez</strong> — Mueve el slider para simular distintas condiciones atmosféricas: desde aire alpino limpio hasta calima sahariana. Observa cómo cambian los colores en tiempo real.
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Copia los colores HEX</strong> — Haz clic en cualquiera de las 3 muestras de color (cénit, punto medio, horizonte) para copiar el código HEX al portapapeles. Úsalos directamente en tu diseño.
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Lee la física y el consejo fotográfico</strong> — Cada fase incluye una explicación del fenómeno físico que causa esos colores y un consejo práctico específico para fotografía.
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Planifica tu salida fotográfica</strong> — Combina esta herramienta con la app <em>Golden Hour</em> de meskeIA para calcular los horarios exactos de cada fase en tu ubicación y fecha.
            </div>
          </div>
        </div>

        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎯</span>
            <strong>Llega 30 min antes</strong>
            <p>Las transiciones más rápidas (amanecer, golden hour) duran 15-20 min. Llega antes de que empiece, con encuadre y ajustes listos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📱</span>
            <strong>Usa modo manual</strong>
            <p>El medidor automático sobreexpone el cielo oscuro de la hora azul y subexpone el amanecer brillante. Metering puntual en el cielo a 45° del horizonte.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
            <strong>Balance de blancos fijo</strong>
            <p>Configura el WB en "luz día" (5600 K) y no en automático: el AWB elimina precisamente los tonos cálidos de la golden hour que querías capturar.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🖼️</span>
            <strong>Paletas naturales para diseño</strong>
            <p>Los gradientes del cielo son las paletas más armónicas que existen: están basados en el espectro solar físico, no en teoría del color artificial.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌫️</span>
            <strong>La calima puede ser aliada</strong>
            <p>Una turbidez media (τ ≈ 0,3-0,5) suaviza el gradiente y enriquece los naranjas del atardecer. El cielo perfectamente limpio puede resultar demasiado saturado.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <strong>Repite en distintas estaciones</strong>
            <p>La duración de la golden hour varía el doble entre verano e invierno en latitudes medias. Los colores del amanecer también cambian con la posición del Sol.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores frecuentes</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Confundir golden hour con amanecer/atardecer exacto.</strong> La golden hour comienza cuando el disco solar ha emergido del horizonte (~0°), no cuando el cielo se tiñe de colores previos. Son fases distintas con física diferente.</li>
            <li><strong>Mirar solo hacia el Sol.</strong> Las fases más espectaculares —Cinturón de Venus, hora azul— están en el horizonte opuesto al Sol. Gira 180° para no perdértelas.</li>
            <li><strong>Balance de blancos en automático.</strong> El AWB de la cámara neutraliza activamente los tonos de la golden hour, el resultado es un cielo sin calidez. Fija el WB en "luz día".</li>
            <li><strong>Los colores de esta simulación son aproximados.</strong> Dependen de la latitud, estación, altitud, humedad y aerosoles locales. Son una guía educativa y de diseño, no valores científicos precisos para cada localización.</li>
            <li><strong>La turbidez sahariana no solo da colores bonitos.</strong> La calima reduce la visibilidad y la nitidez fotográfica. Con τ &gt; 0.7 los detalles del horizonte se difuminan significativamente.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={relatedApps} />
      <ShareCard appName="visualizador-colores-cielo" />
      <Footer appName="visualizador-colores-cielo" />
    </div>
  );
}
