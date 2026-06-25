// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from '../StemumHome.module.css';

export const metadata: Metadata = {
  title: 'Física interactiva: campos, ondas, mecánica y termodinámica | Stemum',
  description:
    'Simuladores de física para experimentar: campo eléctrico, péndulo, colisiones, ondas e interferencia, gas ideal y efecto Doppler.',
  alternates: { canonical: 'https://stemum.com/fisica/' },
};

// Apps de la disciplina Física. Viven físicamente en meskeIA y se sirven bajo
// stemum.com mediante el host-rewrite (lista blanca en proxy.ts).
const APPS = [
  {
    icon: '⚡',
    titulo: 'Campo eléctrico',
    desc: 'Coloca cargas puntuales y observa las líneas de campo, las equipotenciales y la fuerza sobre una carga de prueba.',
    slug: 'simulador-campo-electrico',
  },
  {
    icon: '🕰️',
    titulo: 'Péndulo y MAS',
    desc: 'Péndulo simple y movimiento armónico: periodo, frecuencia, energía cinética y potencial, y el límite de ángulos pequeños.',
    slug: 'simulador-pendulo',
  },
  {
    icon: '💥',
    titulo: 'Colisiones',
    desc: 'Choques elásticos e inelásticos en 1D con sliders de masa, velocidad y coeficiente de restitución; momento y energía.',
    slug: 'simulador-colisiones',
  },
  {
    icon: '🌊',
    titulo: 'Ondas e interferencia',
    desc: 'Onda viajera, interferencia de dos fuentes y ondas estacionarias en cuerda y tubo, con sus modos armónicos.',
    slug: 'simulador-ondas-interferencia',
  },
  {
    icon: '🎈',
    titulo: 'Gas ideal',
    desc: 'PV = nRT con procesos isotermo, isobaro, isocoro y adiabático, y ciclos Carnot, Otto y Diesel en el diagrama PV.',
    slug: 'simulador-gas-ideal',
  },
  {
    icon: '🚨',
    titulo: 'Efecto Doppler',
    desc: 'Ondas comprimidas y expandidas según la velocidad de la fuente: radar, ecografía, SONAR y el corrimiento al rojo cósmico.',
    slug: 'visualizador-efecto-doppler',
  },
  {
    icon: '🎯',
    titulo: 'Proyectiles',
    desc: 'Movimiento parabólico 2D con alcance, altura máxima y tiempo de vuelo, gravedades planetarias y resistencia del aire.',
    slug: 'simulador-proyectiles',
  },
  {
    icon: '🔌',
    titulo: 'Circuitos eléctricos',
    desc: 'Circuitos en serie y paralelo con la Ley de Ohm y la potencia, con hasta seis resistencias.',
    slug: 'simulador-circuitos-electricos',
  },
  {
    icon: '⛰️',
    titulo: 'Conservación de la energía',
    desc: 'Pelota animada en cuatro pistas con barras dinámicas de energía cinética y potencial y fricción ajustable.',
    slug: 'simulador-conservacion-energia',
  },
  {
    icon: '🔍',
    titulo: 'Lentes ópticas',
    desc: 'Trazado de los tres rayos principales en lentes convergentes y divergentes, con imagen real o virtual.',
    slug: 'simulador-lentes-opticas',
  },
  {
    icon: '🚰',
    titulo: 'Fluidos y Bernoulli',
    desc: 'Tubería Venturi con partículas animadas y manómetros que aplican la continuidad y la ecuación de Bernoulli.',
    slug: 'simulador-fluidos-bernoulli',
  },
  {
    icon: '🌀',
    titulo: 'Movimiento circular',
    desc: 'MCU y MCNU con vectores de velocidad tangencial y aceleración centrípeta.',
    slug: 'simulador-movimiento-circular',
  },
  {
    icon: '🪀',
    titulo: 'Masa y resorte',
    desc: 'Movimiento armónico simple con resorte animado, gráfica x(t), energías y amortiguamiento.',
    slug: 'simulador-mas-resorte',
  },
  {
    icon: '✈️',
    titulo: 'Vuelo del avión',
    desc: 'Sustentación según el ángulo de ataque frente al mito de Bernoulli, con slider, pérdida y vuelo invertido.',
    slug: 'visualizador-vuelo-avion',
  },
  {
    icon: '🔋',
    titulo: 'Motor eléctrico',
    desc: 'Campo magnético rotante, inversor IGBT y regeneración, comparado con el motor de combustión.',
    slug: 'visualizador-motor-electrico',
  },
  {
    icon: '🌌',
    titulo: 'Relatividad general',
    desc: 'Malla del espacio-tiempo deformada por la masa con slider, geodésicas, LIGO y GPS.',
    slug: 'visualizador-relatividad-general',
  },
  {
    icon: '🧲',
    titulo: 'Superconductividad',
    desc: 'Efecto Meissner animado, pares de Cooper y temperatura crítica ajustable.',
    slug: 'visualizador-superconductividad',
  },
  {
    icon: '💡',
    titulo: 'Óptica ondulatoria',
    desc: 'Doble rendija de Young, difracción, polarización de Malus y coherencia láser.',
    slug: 'visualizador-optica-ondulatoria',
  },
  {
    icon: '📟',
    titulo: 'Circuitos electrónicos',
    desc: 'Impedancia R/L/C, carga y descarga RC, transistor BJT y puertas lógicas.',
    slug: 'visualizador-circuitos-electronicos',
  },
  {
    icon: '🏎️',
    titulo: 'Motor de combustión',
    desc: 'Ciclo Otto en diagrama, slider de compresión, diagrama Sankey de energía y comparativa con el eléctrico.',
    slug: 'visualizador-motor-combustion',
  },
  {
    icon: '☢️',
    titulo: 'Radiactividad',
    desc: 'Desintegración α/β/γ, ley N(t)=N₀e^(−λt), datación por carbono-14 y dosis.',
    slug: 'visualizador-radioactividad',
  },
  {
    icon: '🔍',
    titulo: 'Óptica de la luz',
    desc: 'Diagramas SVG en vivo de reflexión, refracción con ley de Snell, lentes convergentes/divergentes y dispersión en prisma; ajustas ángulo, medio y distancia del objeto.',
    slug: 'visualizador-optica',
  },
  {
    icon: '⚙️',
    titulo: 'Máquinas simples',
    desc: 'Sliders de palanca y plano inclinado recalculan ventaja mecánica y fuerza sobre diagramas SVG; fulcro, ángulo y longitud se mueven en tiempo real.',
    slug: 'visualizador-maquinas-simples',
  },
  {
    icon: '🔊',
    titulo: 'Sonido y ondas',
    desc: 'Sliders de frecuencia y amplitud redibujan la onda y suenan vía Web Audio; explora notas, decibelios y la mezcla de armónicos de cada instrumento.',
    slug: 'visualizador-sonido-ondas',
  },
  {
    icon: '🌈',
    titulo: 'Espectro electromagnético',
    desc: 'Barra logarítmica de 7 bandas clicables más calculadora que convierte longitud de onda en frecuencia y energía por fotón con c=λ·f.',
    slug: 'visualizador-espectro-electromagnetico',
  },
  {
    icon: '💥',
    titulo: 'Energía nuclear',
    desc: 'Slider del factor k marca reactor subcrítico/crítico/supercrítico; selector de reactores y barras comparativas conmutables entre CO₂ y factor de capacidad.',
    slug: 'visualizador-energia-nuclear',
  },
  {
    icon: '🌌',
    titulo: 'Relatividad especial',
    desc: 'Sliders de velocidad recalculan factor gamma, dilatación temporal y contracción de longitud; selector de masa para E=mc² y paradoja de gemelos paso a paso.',
    slug: 'visualizador-relatividad-especial',
  },
  {
    icon: '⚛️',
    titulo: 'Mecánica cuántica',
    desc: 'Observas el colapso de la doble rendija, ajustas certeza posición/momento de Heisenberg, abres la caja de Schrödinger y varías la barrera del efecto túnel.',
    slug: 'visualizador-mecanica-cuantica',
  },
  {
    icon: '🧩',
    titulo: 'Partículas subatómicas',
    desc: 'Tabla clicable del Modelo Estándar con toggle de antipartículas y slider que liga la masa de cada partícula a su acoplamiento con el campo de Higgs.',
    slug: 'visualizador-particulas-subatomicas',
  },
];

export default function StemumFisica() {
  return (
    <>
      <AnalyticsTracker appName="stemum-fisica" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-fisica">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Stemum
          </Link>
          <h1 id="titulo-fisica" className={styles.ejeTitle}>
            <span aria-hidden="true">⚛️</span> Física
          </h1>
          <p className={styles.ejeIntro}>
            Mecánica, ondas, electricidad y termodinámica para manipular en tiempo real.
            Mueve un control y observa cómo responde el sistema.
          </p>
          <div className={styles.grid}>
            {APPS.map((a) => (
              <Link key={a.slug} href={`/${a.slug}`} className={styles.appCard}>
                <span className={styles.cardIcon} aria-hidden="true">{a.icon}</span>
                <h2 className={styles.cardTitulo}>{a.titulo}</h2>
                <p className={styles.cardDesc}>{a.desc}</p>
                <span className={styles.appCardCta}>Abrir →</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
