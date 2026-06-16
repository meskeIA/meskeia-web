'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './CicloCarbono.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type TabId = 'reservorios' | 'flujos' | 'perturbacion' | 'soluciones';

interface TabInfo {
  id: TabId;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const TABS: TabInfo[] = [
  { id: 'reservorios', titulo: 'Los 5 Reservorios', icono: '🌍', subtitulo: 'Magnitudes comparadas' },
  { id: 'flujos', titulo: 'Flujos Naturales', icono: '🔄', subtitulo: 'El ciclo preindustrial' },
  { id: 'perturbacion', titulo: 'Perturbación Humana', icono: '🏭', subtitulo: '+11 Gt C/año extra' },
  { id: 'soluciones', titulo: 'Soluciones', icono: '🌱', subtitulo: 'Reducción y captura' },
];

// ─────────────────────────────────────────────
// Datos: Reservorios
// ─────────────────────────────────────────────

interface Reservorio {
  id: string;
  nombre: string;
  icono: string;
  cantidad: string;
  unidad: string;
  cantidadNum: number; // en Gt C, para escala logarítmica
  color: string;
  descripcion: string;
  detalle: string;
  datoImpactante: string;
}

const RESERVORIOS: Reservorio[] = [
  {
    id: 'atmosfera',
    nombre: 'Atmósfera',
    icono: '🌤️',
    cantidad: '~870',
    unidad: 'Gt C (2023)',
    cantidadNum: 870,
    color: '#2E86AB',
    descripcion: 'CO₂ (421 ppm), CH₄, CO. Era ~590 Gt C en 1750 (preindustrial).',
    detalle:
      'El CO₂ atmosférico ha aumentado de 280 ppm en 1750 a 421 ppm en 2023 (+50%). Cada ppm de CO₂ equivale a ~2,13 Gt C en la atmósfera.',
    datoImpactante: '+280 Gt C añadidos desde la industrialización',
  },
  {
    id: 'oceanos',
    nombre: 'Océanos',
    icono: '🌊',
    cantidad: '~38.000',
    unidad: 'Gt C (total)',
    cantidadNum: 38000,
    color: '#1A6E8A',
    descripcion: 'Superficie (~900 Gt) + profundo (~37.100 Gt). Disuelto como CO₂(aq), HCO₃⁻, CO₃²⁻.',
    detalle:
      'Los océanos contienen 50× más carbono que la atmósfera. El carbono tarda ~1.000 años en circular de superficie a profundidades. La acidificación oceánica ha pasado de pH 8,2 a pH 8,1 desde 1750 (30% más ácido).',
    datoImpactante: 'pH bajó de 8,2 a 8,1 → 30% más ácido en 270 años',
  },
  {
    id: 'biota',
    nombre: 'Biota Terrestre',
    icono: '🌳',
    cantidad: '~600',
    unidad: 'Gt C',
    cantidadNum: 600,
    color: '#27AE60',
    descripcion: 'Plantas, raíces, troncos. Los bosques tropicales son el mayor reservorio vivo.',
    detalle:
      'El Amazonas solo almacena ~150–200 Gt C. La biomasa forestal global es el principal reservorio vivo. La deforestación ha reducido este reservorio en ~50 Gt C desde 1750.',
    datoImpactante: 'Bosques tropicales = 45% del carbono en biota terrestre',
  },
  {
    id: 'suelos',
    nombre: 'Suelos y Permafrost',
    icono: '🏔️',
    cantidad: '~3.200',
    unidad: 'Gt C',
    cantidadNum: 3200,
    color: '#8E6BBF',
    descripcion: 'Suelos orgánicos (~1.700 Gt C) + permafrost ártico (~1.500 Gt C con metano atrapado).',
    detalle:
      'El permafrost cubre ~22% del suelo del hemisferio norte. Contiene carbono orgánico acumulado durante miles de años. El metano que libera al descongelarse es 80× más potente que el CO₂ en 20 años.',
    datoImpactante: 'Permafrost = más C que biota terrestre + atmósfera juntas',
  },
  {
    id: 'litosfera',
    nombre: 'Litosfera (Geológico)',
    icono: '⛏️',
    cantidad: '>60.000.000',
    unidad: 'Gt C',
    cantidadNum: 60000000,
    color: '#7F8C8D',
    descripcion: 'Carbón, petróleo, gas natural, calizas. Inaccesible en ciclos cortos.',
    detalle:
      'Las rocas carbonatadas (calizas, dolomitas) almacenan ~60 millones de Gt C. Los combustibles fósiles representan ~4.000 Gt C aprovechables. La quema humana hace accesible en décadas el carbono acumulado en millones de años.',
    datoImpactante: 'Quemamos en 200 años el C acumulado en 300 millones de años',
  },
];

// ─────────────────────────────────────────────
// Datos: Flujos naturales
// ─────────────────────────────────────────────

interface Flujo {
  id: string;
  nombre: string;
  icono: string;
  valor: string;
  direccion: 'entrada' | 'salida' | 'neutro';
  desde: string;
  hacia: string;
  descripcion: string;
  mecanismo: string;
}

const FLUJOS: Flujo[] = [
  {
    id: 'fotosintesis',
    nombre: 'Fotosíntesis Terrestre',
    icono: '🌿',
    valor: '−120 Gt C/año',
    direccion: 'salida',
    desde: 'Atmósfera',
    hacia: 'Biota terrestre',
    descripcion: 'Las plantas convierten CO₂ atmosférico en biomasa orgánica mediante luz solar.',
    mecanismo:
      'La fotosíntesis captura ~120 Gt C/año. Sin embargo, la respiración autótrofa devuelve ~60 Gt C/año, dejando un balance neto de absorción de ~60 Gt C/año (sumidero terrestre neto).',
  },
  {
    id: 'respiracion',
    nombre: 'Respiración y Descomposición',
    icono: '🍂',
    valor: '+60 Gt C/año',
    direccion: 'entrada',
    desde: 'Biota terrestre',
    hacia: 'Atmósfera',
    descripcion: 'Plantas, animales y bacterias devuelven CO₂ al descomponer materia orgánica.',
    mecanismo:
      'Incluye respiración autótrofa de plantas (~60 Gt/año) y respiración heterótrofa (descomposición microbiana del suelo, ~60 Gt/año). Balance neto biota: −60 Gt C/año (sumidero).',
  },
  {
    id: 'intercambio-oceano',
    nombre: 'Intercambio Océano-Atmósfera',
    icono: '💧',
    valor: '±90 Gt C/año',
    direccion: 'neutro',
    desde: 'Océanos/Atmósfera',
    hacia: 'Atmósfera/Océanos',
    descripcion: 'Los océanos tropicales emiten CO₂; las latitudes altas absorben CO₂ (aguas frías = más capacidad).',
    mecanismo:
      'La "bomba de solubilidad": el agua fría disuelve más CO₂. La "bomba biológica": el fitoplancton absorbe CO₂ y al morir hunde carbono al fondo oceánico. Este carbono tarda ~1.000 años en recircular.',
  },
  {
    id: 'vulcanismo',
    nombre: 'Vulcanismo e Intemperismo',
    icono: '🌋',
    valor: '+0,1 Gt C/año',
    direccion: 'entrada',
    desde: 'Litosfera',
    hacia: 'Atmósfera',
    descripcion: 'Emisión natural de CO₂ volcánico y liberación por intemperismo de rocas.',
    mecanismo:
      'Es el único flujo natural que conecta el reservorio geológico con la atmósfera. En el ciclo preindustrial estaba compensado por el intemperismo de silicatos que consume CO₂ (millones de años). La quema de fósiles es 100× mayor que este flujo.',
  },
];

// ─────────────────────────────────────────────
// Datos: Destino de emisiones
// ─────────────────────────────────────────────

interface DestinoEmision {
  destino: string;
  icono: string;
  gtCAnio: number;
  porcentaje: number;
  color: string;
  consecuencia: string;
}

const DESTINOS_EMISION: DestinoEmision[] = [
  {
    destino: 'Atmósfera (retiene)',
    icono: '🌤️',
    gtCAnio: 5.5,
    porcentaje: 50,
    color: '#2E86AB',
    consecuencia: '+2,5 ppm CO₂/año → calentamiento continuo',
  },
  {
    destino: 'Océanos (absorben)',
    icono: '🌊',
    gtCAnio: 2.5,
    porcentaje: 23,
    color: '#1A6E8A',
    consecuencia: 'Acidificación (pH baja) → daño ecosistemas marinos',
  },
  {
    destino: 'Biota terrestre (absorbe)',
    icono: '🌳',
    gtCAnio: 3.0,
    porcentaje: 27,
    color: '#27AE60',
    consecuencia: 'Sumidero que puede saturarse con el calentamiento',
  },
];

// ─────────────────────────────────────────────
// Datos: Soluciones
// ─────────────────────────────────────────────

interface Solucion {
  id: string;
  nombre: string;
  icono: string;
  potencial: string;
  potencialNum: number; // Gt C/año
  estado: string;
  color: string;
  descripcion: string;
  limitaciones: string;
}

const SOLUCIONES: Solucion[] = [
  {
    id: 'renovables',
    nombre: 'Reducción directa de emisiones',
    icono: '⚡',
    potencial: '11 Gt C/año',
    potencialNum: 11,
    estado: 'Imprescindible — todavía insuficiente',
    color: '#F39C12',
    descripcion:
      'Transición a renovables, electrificación del transporte, eficiencia energética, descarbonización industrial. Elimina las 11 Gt/año antropogénicas.',
    limitaciones:
      'Requiere transformación sistémica de toda la economía global en 25-30 años. Los compromisos actuales solo cubren ~50% del camino necesario.',
  },
  {
    id: 'reforestacion',
    nombre: 'Reforestación y Rewilding',
    icono: '🌳',
    potencial: '1–3 Gt C/año',
    potencialNum: 2,
    estado: 'En marcha — escala insuficiente',
    color: '#27AE60',
    descripcion:
      'Restauración de bosques degradados, reforestación de tierras agrícolas marginales, protección de bosques primarios existentes.',
    limitaciones:
      'Los bosques tardan décadas en madurar y capturar su máximo potencial. El calentamiento reduce la eficacia (mayor mortalidad por sequía e incendios).',
  },
  {
    id: 'suelos-agricolas',
    nombre: 'Agricultura Regenerativa y Biocarbón',
    icono: '🌾',
    potencial: '0,5–1,5 Gt C/año',
    potencialNum: 1,
    estado: 'Prometedor — pocas métricas fiables',
    color: '#8E6BBF',
    descripcion:
      'Labranza mínima, cultivos de cobertura, pastoreo rotacional, aplicación de biocarbón (biochar). Aumenta el carbono en suelos agrícolas.',
    limitaciones:
      'Difícil de verificar y monitorizar. Permanencia incierta. Requiere cambio generalizado en prácticas agrícolas globales.',
  },
  {
    id: 'dac',
    nombre: 'Captura Directa de Aire (DAC/CCS)',
    icono: '🏭',
    potencial: 'Teóricamente ilimitado',
    potencialNum: 0.01,
    estado: 'Muy incipiente — coste prohibitivo',
    color: '#E74C3C',
    descripcion:
      'Máquinas que extraen CO₂ directamente del aire y lo almacenan geológicamente. Actualmente solo 0,01 Gt C/año capturado en todo el mundo.',
    limitaciones:
      'Coste actual: €300–600 por tonelada de CO₂. Requiere enormes cantidades de energía limpia para operar. Escalado requiere inversiones de billones de euros.',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCicloCarbonoCompleto() {
  const [tabActiva, setTabActiva] = useState<TabId>('reservorios');
  const [reservorioSeleccionado, setReservorioSeleccionado] = useState<string | null>(null);
  const [flujoSeleccionado, setFlujoSeleccionado] = useState<string | null>(null);
  const [reduccionEmisiones, setReduccionEmisiones] = useState<number>(0);

  // Cálculo simplificado de CO₂ en 2100 según reducción
  const co2En2100 = Math.round(421 + (11 * (1 - reduccionEmisiones / 100) * 77 * 3.67) / 2.13);
  const co2ClampedLabel =
    reduccionEmisiones >= 100
      ? '~430 ppm (estabilización + descenso lento)'
      : `~${Math.min(co2En2100, 1000)} ppm`;

  const logScale = (val: number, min: number, max: number): number => {
    const logMin = Math.log10(min);
    const logMax = Math.log10(max);
    return ((Math.log10(val) - logMin) / (logMax - logMin)) * 100;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroIcon} aria-hidden="true">
            ♻️
          </span>
          <h1 className={styles.heroTitle}>Ciclo del Carbono Completo</h1>
          <p className={styles.heroSubtitle}>
            Reservorios, flujos y la perturbación humana en el sistema carbono global
          </p>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>38.000 Gt</span>
              <span className={styles.heroStatLabel}>Carbono en océanos</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>+11 Gt/año</span>
              <span className={styles.heroStatLabel}>Emisiones humanas</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>421 ppm</span>
              <span className={styles.heroStatLabel}>CO₂ atmosférico 2023</span>
            </div>
          </div>
        </div>
      </header>

      <LegalNotice />

      {/* Tabs */}
      <div className={styles.tabsWrapper}>
        <div className={styles.tabs} role="tablist" aria-label="Secciones del ciclo del carbono">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tabActiva === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setTabActiva(tab.id)}
              className={`${styles.tab} ${tabActiva === tab.id ? styles.tabActive : ''}`}
            >
              <span className={styles.tabIcon} aria-hidden="true">
                {tab.icono}
              </span>
              <span className={styles.tabTitulo}>{tab.titulo}</span>
              <span className={styles.tabSub}>{tab.subtitulo}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Panel: Reservorios */}
      {tabActiva === 'reservorios' && (
        <section
          id="panel-reservorios"
          role="tabpanel"
          aria-labelledby="tab-reservorios"
          className={styles.content}
        >
          <div className={styles.sectionHeader}>
            <h2>Los 5 grandes reservorios de carbono</h2>
            <p>
              El carbono en la Tierra se distribuye en reservorios de magnitudes radicalmente distintas.
              Haz clic en cada uno para ver los detalles.
            </p>
          </div>

          {/* Escala logarítmica visual */}
          <div className={styles.logScaleNote}>
            <span aria-hidden="true">ℹ️</span>{' '}
            Las barras usan <strong>escala logarítmica</strong> porque los valores van de 870 a 60.000.000 Gt C
          </div>

          <div className={styles.reservoirGrid}>
            {RESERVORIOS.map((r) => {
              const anchoBarra = logScale(r.cantidadNum, 870, 60000000);
              const isSelected = reservorioSeleccionado === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  className={`${styles.reservoirCard} ${isSelected ? styles.reservoirCardActive : ''}`}
                  onClick={() => setReservorioSeleccionado(isSelected ? null : r.id)}
                  aria-expanded={isSelected}
                  style={{ borderColor: isSelected ? r.color : 'transparent' }}
                >
                  <div className={styles.reservoirCardHeader}>
                    <span className={styles.reservoirIcon} aria-hidden="true">
                      {r.icono}
                    </span>
                    <div className={styles.reservoirInfo}>
                      <span className={styles.reservoirName}>{r.nombre}</span>
                      <span className={styles.reservoirAmount} style={{ color: r.color }}>
                        {r.cantidad} {r.unidad}
                      </span>
                    </div>
                  </div>
                  <div className={styles.logBar} aria-hidden="true">
                    <div
                      className={styles.logBarFill}
                      style={{ width: `${anchoBarra}%`, backgroundColor: r.color }}
                    />
                  </div>
                  <p className={styles.reservoirDesc}>{r.descripcion}</p>

                  {isSelected && (
                    <div className={styles.reservoirDetail} role="region" aria-label={`Detalle de ${r.nombre}`}>
                      <p>{r.detalle}</p>
                      <div className={styles.datoImpactante} style={{ borderColor: r.color }}>
                        <span aria-hidden="true">💡</span> {r.datoImpactante}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className={styles.warningBox}>
            <span aria-hidden="true">⚠️</span>
            <strong>Punto crítico — Permafrost:</strong> Si el permafrost ártico (1.500 Gt C) se
            desestabiliza por el calentamiento, liberará CH₄ y CO₂ de forma prácticamente incontrolable,
            creando un feedback positivo que podría añadir 1–2 Gt C/año extra al sistema.
          </div>
        </section>
      )}

      {/* Panel: Flujos */}
      {tabActiva === 'flujos' && (
        <section
          id="panel-flujos"
          role="tabpanel"
          aria-labelledby="tab-flujos"
          className={styles.content}
        >
          <div className={styles.sectionHeader}>
            <h2>Los flujos naturales del carbono</h2>
            <p>
              En el ciclo preindustrial, los flujos de entrada y salida estaban aproximadamente en equilibrio.
              Cada flujo se mide en Gt C/año (gigatoneladas de carbono por año).
            </p>
          </div>

          {/* Balance global visual */}
          <div className={styles.balanceGlobal}>
            <div className={styles.balanceItem}>
              <span className={styles.balanceVal} style={{ color: '#27AE60' }}>
                −180 Gt C/año
              </span>
              <span className={styles.balanceLabel}>Entradas a biota + océanos</span>
            </div>
            <div className={styles.balanceSep} aria-hidden="true">≈</div>
            <div className={styles.balanceItem}>
              <span className={styles.balanceVal} style={{ color: '#E74C3C' }}>
                +180 Gt C/año
              </span>
              <span className={styles.balanceLabel}>Salidas a atmósfera (natural)</span>
            </div>
          </div>
          <p className={styles.balanceNote}>
            Ciclo preindustrial en equilibrio dinámico — entradas ≈ salidas durante miles de años
          </p>

          <div className={styles.flujosGrid}>
            {FLUJOS.map((flujo) => {
              const isSelected = flujoSeleccionado === flujo.id;
              return (
                <button
                  key={flujo.id}
                  type="button"
                  className={`${styles.flujoCard} ${
                    flujo.direccion === 'salida'
                      ? styles.flujoSalida
                      : flujo.direccion === 'entrada'
                      ? styles.flujoEntrada
                      : styles.flujoNeutro
                  } ${isSelected ? styles.flujoCardActive : ''}`}
                  onClick={() => setFlujoSeleccionado(isSelected ? null : flujo.id)}
                  aria-expanded={isSelected}
                >
                  <div className={styles.flujoHeader}>
                    <span className={styles.flujoIcon} aria-hidden="true">
                      {flujo.icono}
                    </span>
                    <div className={styles.flujoInfo}>
                      <span className={styles.flujoNombre}>{flujo.nombre}</span>
                      <span className={styles.flujoValor}>{flujo.valor}</span>
                    </div>
                  </div>
                  <p className={styles.flujoRuta}>
                    {flujo.desde} → {flujo.hacia}
                  </p>
                  <p className={styles.flujoDesc}>{flujo.descripcion}</p>
                  {isSelected && (
                    <div className={styles.flujoMecanismo}>
                      <strong>Mecanismo:</strong> {flujo.mecanismo}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className={styles.oceanoBox}>
            <h3>
              <span aria-hidden="true">🌊</span> El papel clave del océano
            </h3>
            <div className={styles.oceanoGrid}>
              <div className={styles.oceanoItem}>
                <strong>Bomba biológica</strong>
                <p>El fitoplancton captura CO₂ por fotosíntesis. Al morir, se hunde al fondo oceánico llevando el carbono consigo (secuestro a largo plazo).</p>
              </div>
              <div className={styles.oceanoItem}>
                <strong>Bomba de solubilidad</strong>
                <p>El agua fría disuelve más CO₂. Las corrientes polares arrastran CO₂ superficial hacia las profundidades donde permanece ~1.000 años.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Panel: Perturbación humana */}
      {tabActiva === 'perturbacion' && (
        <section
          id="panel-perturbacion"
          role="tabpanel"
          aria-labelledby="tab-perturbacion"
          className={styles.content}
        >
          <div className={styles.sectionHeader}>
            <h2>La perturbación humana del ciclo</h2>
            <p>
              Desde la Revolución Industrial añadimos ~11 Gt C/año al sistema, rompiendo el equilibrio que
              tardó millones de años en establecerse.
            </p>
          </div>

          {/* Emisiones actuales */}
          <div className={styles.emisionesGrid}>
            <div className={styles.emisionCard}>
              <span className={styles.emisionIcon} aria-hidden="true">🏭</span>
              <span className={styles.emisionLabel}>Combustión de fósiles</span>
              <span className={styles.emisionValor}>+9,5 Gt C/año</span>
              <span className={styles.emisionSub}>(+34,8 Gt CO₂/año)</span>
            </div>
            <div className={styles.emisionCard}>
              <span className={styles.emisionIcon} aria-hidden="true">🪓</span>
              <span className={styles.emisionLabel}>Deforestación y suelo</span>
              <span className={styles.emisionValor}>+1,5 Gt C/año</span>
              <span className={styles.emisionSub}>(+5,5 Gt CO₂/año)</span>
            </div>
            <div className={`${styles.emisionCard} ${styles.emisionTotal}`}>
              <span className={styles.emisionIcon} aria-hidden="true">⚡</span>
              <span className={styles.emisionLabel}>Total antropogénico</span>
              <span className={styles.emisionValor}>~11 Gt C/año</span>
              <span className={styles.emisionSub}>(~40 Gt CO₂/año)</span>
            </div>
          </div>

          {/* Destino de emisiones */}
          <h3 className={styles.subsectionTitle}>¿Adónde va ese carbono?</h3>
          <div className={styles.destinoGrid}>
            {DESTINOS_EMISION.map((d) => (
              <div key={d.destino} className={styles.destinoCard}>
                <div className={styles.destinoHeader}>
                  <span className={styles.destinoIcon} aria-hidden="true">
                    {d.icono}
                  </span>
                  <div className={styles.destinoInfo}>
                    <span className={styles.destinoNombre}>{d.destino}</span>
                    <span className={styles.destinoValor} style={{ color: d.color }}>
                      {d.gtCAnio} Gt C/año ({d.porcentaje}%)
                    </span>
                  </div>
                </div>
                <div className={styles.destinoBarra} aria-hidden="true">
                  <div
                    className={styles.destinoBarraFill}
                    style={{ width: `${d.porcentaje}%`, backgroundColor: d.color }}
                  />
                </div>
                <p className={styles.destinoConsecuencia}>
                  <span aria-hidden="true">→</span> {d.consecuencia}
                </p>
              </div>
            ))}
          </div>

          {/* Slider interactivo */}
          <div className={styles.sliderSection}>
            <h3>
              <span aria-hidden="true">🎛️</span> Simulador: ¿Qué pasa si reducimos emisiones?
            </h3>
            <p className={styles.sliderDesc}>
              Ajusta el nivel de reducción de emisiones y observa el impacto estimado en el CO₂
              atmosférico para 2100.
            </p>
            <div className={styles.sliderWrapper}>
              <label htmlFor="slider-reduccion" className={styles.sliderLabel}>
                Reducción de emisiones: <strong>{reduccionEmisiones}%</strong>
              </label>
              <input
                id="slider-reduccion"
                type="range"
                min={0}
                max={100}
                step={10}
                value={reduccionEmisiones}
                onChange={(e) => setReduccionEmisiones(Number(e.target.value))}
                className={styles.slider}
                aria-valuenow={reduccionEmisiones}
                aria-valuemin={0}
                aria-valuemax={100}
              />
              <div className={styles.sliderTicks} aria-hidden="true">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
            <div
              className={styles.emisionResult}
              role="status"
              aria-live="polite"
              style={{
                borderColor: reduccionEmisiones >= 80 ? '#27AE60' : reduccionEmisiones >= 50 ? '#F39C12' : '#E74C3C',
              }}
            >
              <div className={styles.emisionResultTop}>
                <span className={styles.emisionResultNum}>{co2ClampedLabel}</span>
                <span className={styles.emisionResultLabel}>CO₂ estimado en 2100</span>
              </div>
              <p className={styles.emisionResultDesc}>
                {reduccionEmisiones === 0 &&
                  'Sin reducción: ~600 ppm en 2100. Calentamiento de 3–4°C. Riesgo de múltiples tipping points.'}
                {reduccionEmisiones > 0 && reduccionEmisiones < 50 &&
                  'Reducción insuficiente: todavía por encima de los 450 ppm considerados seguros. Urgente acelerar la transición.'}
                {reduccionEmisiones >= 50 && reduccionEmisiones < 100 &&
                  'Reducción significativa: el CO₂ sube más despacio pero no se estabiliza. Los sumideros naturales ayudan pero no bastan solos.'}
                {reduccionEmisiones === 100 &&
                  'Net-zero: el CO₂ se estabiliza y luego declina lentamente gracias a los sumideros naturales. El calentamiento se frenaría en ~1,5–2°C adicionales respecto a hoy.'}
              </p>
            </div>
          </div>

          {/* Permafrost tipping point */}
          <div className={styles.tippingBox}>
            <h3>
              <span aria-hidden="true">🚨</span> Punto de no retorno: el permafrost
            </h3>
            <p>
              Si el calentamiento desestabiliza el permafrost ártico, se liberarán 1–2 Gt C/año adicionales
              en forma de CH₄ (metano). Este feedback positivo es prácticamente incontrolable una vez
              iniciado, y ninguna reducción de emisiones humanas puede compensarlo directamente.
            </p>
            <p>
              <strong>El CH₄ es 80× más potente que el CO₂ como gas de efecto invernadero en 20 años.</strong>{' '}
              Un punto de inflexión que solo podemos evitar no superando ~1,5°C de calentamiento global.
            </p>
          </div>
        </section>
      )}

      {/* Panel: Soluciones */}
      {tabActiva === 'soluciones' && (
        <section
          id="panel-soluciones"
          role="tabpanel"
          aria-labelledby="tab-soluciones"
          className={styles.content}
        >
          <div className={styles.sectionHeader}>
            <h2>Soluciones: reducción y captura</h2>
            <p>
              Cuatro grandes tipos de soluciones con su potencial estimado y estado actual de implantación.
              No existe una única bala de plata — se necesita todo a la vez.
            </p>
          </div>

          <div className={styles.solucionesGrid}>
            {SOLUCIONES.map((sol) => (
              <div key={sol.id} className={styles.solucionCard} style={{ borderTopColor: sol.color }}>
                <div className={styles.solucionHeader}>
                  <span className={styles.solucionIcon} aria-hidden="true">
                    {sol.icono}
                  </span>
                  <div>
                    <h3 className={styles.solucionNombre}>{sol.nombre}</h3>
                    <span className={styles.solucionPotencial} style={{ color: sol.color }}>
                      Potencial: {sol.potencial}
                    </span>
                  </div>
                </div>
                <div className={styles.solucionEstado}>
                  <span className={styles.solucionEstadoDot} style={{ backgroundColor: sol.color }} />
                  {sol.estado}
                </div>
                <p className={styles.solucionDesc}>{sol.descripcion}</p>
                <div className={styles.solucionLimit}>
                  <strong>Limitaciones:</strong> {sol.limitaciones}
                </div>
                {/* Barra de potencial (de 0 a 11 Gt C/año) */}
                <div className={styles.solucionBarra} aria-hidden="true">
                  <div
                    className={styles.solucionBarraFill}
                    style={{
                      width: `${Math.min((sol.potencialNum / 11) * 100, 100)}%`,
                      backgroundColor: sol.color,
                    }}
                  />
                </div>
                <p className={styles.solucionBarraLabel} aria-hidden="true">
                  Potencial vs. 11 Gt C/año de emisiones actuales
                </p>
              </div>
            ))}
          </div>

          {/* Persistencia del CO₂ */}
          <div className={styles.persistenciaBox}>
            <h3>
              <span aria-hidden="true">⏳</span> El CO₂ ya emitido persiste décadas-siglos
            </h3>
            <p>
              Aunque paráramos todas las emisiones hoy, el CO₂ acumulado permanecería en la atmósfera
              durante décadas o siglos. El sistema no &quot;resetea&quot; rápidamente porque:
            </p>
            <ul className={styles.persistenciaLista}>
              <li>
                <strong>Los sumideros están parcialmente saturados:</strong> oceanos más cálidos y ácidos
                absorben menos CO₂.
              </li>
              <li>
                <strong>El tiempo de residencia atmosférico</strong> del CO₂ es de 100–300 años para la
                mayor parte y hasta ~20% permanece ≥10.000 años.
              </li>
              <li>
                <strong>El calor atrapado ya en el sistema</strong> continuará descongelando permafrost y
                hielo durante décadas por inercia térmica.
              </li>
            </ul>
            <p className={styles.persistenciaConclusion}>
              Por eso actuar ahora es más valioso que actuar mañana: cada tonelada que no emitimos
              es CO₂ que no persiste 200 años.
            </p>
          </div>
        </section>
      )}

      {/* Sección educativa */}
      <EducationalSection title="Cómo se estudia el ciclo del carbono" subtitle="Técnicas científicas para medir reservorios y flujos globales de carbono">
        <div className={styles.eduGrid}>
          <div className={styles.eduItem}>
            <h4>
              <span aria-hidden="true">🔬</span> Isótopos de carbono como huella dactilar
            </h4>
            <p>
              El carbono tiene tres isótopos principales: ¹²C (98,9%), ¹³C (1,1%) y ¹⁴C (radiactivo,
              vida media 5.730 años). Los combustibles fósiles no contienen ¹⁴C (demasiado antiguos).
              Midiendo la proporción de ¹⁴C en la atmósfera, los científicos confirman que el CO₂
              extra proviene de la quema de fósiles.
            </p>
          </div>
          <div className={styles.eduItem}>
            <h4>
              <span aria-hidden="true">📡</span> Eddy Covariance — medir flujos in situ
            </h4>
            <p>
              Torres de medición de ~40 m de altura con sensores ultrasónicos y analizadores de gases
              miden turbulencias de aire y concentración de CO₂ con precisión de milisegundos. La red
              FLUXNET reúne datos de ~900 torres en todo el mundo para cuantificar el intercambio
              carbono-atmósfera de diferentes ecosistemas.
            </p>
          </div>
          <div className={styles.eduItem}>
            <h4>
              <span aria-hidden="true">🔢</span> Carbono vs. CO₂: cómo convertir cifras
            </h4>
            <p>
              Las cifras científicas usan <strong>Gt C</strong> (gigatoneladas de carbono puro).
              Los medios de comunicación suelen usar <strong>Gt CO₂</strong> (dióxido de carbono).
              Para convertir: multiplica Gt C × 3,67 para obtener Gt CO₂ (porque el CO₂ incluye
              2 átomos de oxígeno además del carbono).
            </p>
            <p>
              Ejemplo: 11 Gt C/año de emisiones humanas = 11 × 3,67 ≈ <strong>40,4 Gt CO₂/año</strong>.
            </p>
          </div>
          <div className={styles.eduItem}>
            <h4>
              <span aria-hidden="true">🌐</span> El IPCC y los balances de carbono
            </h4>
            <p>
              El IPCC (Grupo Intergubernamental de Expertos sobre el Cambio Climático) no realiza
              investigación propia, sino que sintetiza miles de estudios científicos. El &quot;Global Carbon
              Budget&quot;, publicado anualmente por el Global Carbon Project, es la referencia estándar
              para las cifras de flujos y reservorios.
            </p>
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-ciclo-carbono-completo')} />
      <ShareCard appName="visualizador-ciclo-carbono-completo" />
      <Footer appName="visualizador-ciclo-carbono-completo" />
    </div>
  );
}
