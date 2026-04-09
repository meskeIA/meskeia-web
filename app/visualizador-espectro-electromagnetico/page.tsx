'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './EspectroElectromagnetico.module.css';
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

type Seccion = 'espectro' | 'bandas' | 'energia' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'espectro', titulo: 'Espectro completo', icono: '🌈', subtitulo: 'Barra logarítmica 7 bandas' },
  { id: 'bandas', titulo: 'Cada banda', icono: '📡', subtitulo: 'Detalle y aplicaciones' },
  { id: 'energia', titulo: 'Energía y peligro', icono: '⚡', subtitulo: 'Ionizante vs no ionizante' },
  { id: 'datos', titulo: 'Datos y curiosidades', icono: '🔭', subtitulo: 'Historia y récords' },
];

// ─── Datos del espectro ───

interface BandaEM {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  colorClaro: string;
  freqMin: string;
  freqMax: string;
  lambdaMin: string;
  lambdaMax: string;
  energiaRango: string;
  descripcion: string;
  fuentes: string[];
  aplicaciones: string[];
  detalle: string;
  peligro: 'seguro' | 'bajo' | 'medio' | 'alto' | 'muy-alto' | 'extremo' | 'maximo';
  peligroPct: number;
}

const BANDAS: BandaEM[] = [
  {
    id: 'radio', nombre: 'Radio', icono: '📻', color: '#e74c3c', colorClaro: 'rgba(231,76,60,0.12)',
    freqMin: '3 Hz', freqMax: '300 MHz', lambdaMin: '1 m', lambdaMax: '100.000 km',
    energiaRango: '~10⁻³² – 10⁻²⁵ J', descripcion: 'Las ondas de radio tienen la mayor longitud de onda y menor frecuencia del espectro.',
    fuentes: ['Antenas de radio AM/FM', 'Torres de televisión', 'Routers WiFi (2,4/5 GHz)', 'Bluetooth', 'Walkie-talkies'],
    aplicaciones: ['Radio AM (~1 MHz): alcanza cientos de km, rebota en ionosfera', 'Radio FM (~100 MHz): mejor calidad, alcance local', 'TV: canales VHF/UHF', 'WiFi: 2,4 GHz (mayor alcance) y 5 GHz (mayor velocidad)', 'Bluetooth: 2,4 GHz, corto alcance (~10 m)'],
    detalle: 'La antena de radio más potente del mundo (SAQ en Suecia) emite a 17,2 kHz con ondas de 17 km de longitud. Las ondas de radio atraviesan paredes, nubes y la mayoría de materiales no metálicos.',
    peligro: 'seguro', peligroPct: 5,
  },
  {
    id: 'microondas', nombre: 'Microondas', icono: '🍿', color: '#e67e22', colorClaro: 'rgba(230,126,34,0.12)',
    freqMin: '300 MHz', freqMax: '300 GHz', lambdaMin: '1 mm', lambdaMax: '1 m',
    energiaRango: '~10⁻²⁵ – 10⁻²² J', descripcion: 'Microondas: frecuencias intermedias que interactúan con moléculas de agua.',
    fuentes: ['Hornos microondas (2,45 GHz)', 'Radares', 'Satélites de comunicación', 'Redes 5G (24-39 GHz)', 'GPS'],
    aplicaciones: ['Horno microondas: 2,45 GHz hace vibrar moléculas de agua → calor', 'Radar: detecta objetos midiendo el eco de microondas', '5G mmWave: velocidades de Gbps, alcance corto', 'Satélites: enlaces de comunicación a larga distancia', 'Radioastronomía: estudia objetos celestes fríos'],
    detalle: 'Un horno microondas emite a 2,45 GHz porque es la frecuencia óptima para excitar moléculas de agua. La rejilla metálica de la puerta bloquea las microondas (λ ≈ 12 cm) pero deja pasar la luz visible (λ ≈ 500 nm).',
    peligro: 'bajo', peligroPct: 15,
  },
  {
    id: 'infrarrojo', nombre: 'Infrarrojo', icono: '🌡️', color: '#f39c12', colorClaro: 'rgba(243,156,18,0.12)',
    freqMin: '300 GHz', freqMax: '430 THz', lambdaMin: '700 nm', lambdaMax: '1 mm',
    energiaRango: '~10⁻²² – 10⁻¹⁹ J', descripcion: 'Radiación térmica: todo objeto con temperatura emite infrarrojo.',
    fuentes: ['El Sol (50% de su radiación)', 'Cuerpo humano (~10 μm)', 'Estufas y radiadores', 'Mandos a distancia', 'Incendios forestales'],
    aplicaciones: ['Cámaras térmicas: detectan diferencias de temperatura', 'Mandos a distancia: LED infrarrojo modula señal', 'Efecto invernadero: CO₂ atrapa IR reemitido por la Tierra', 'Astronomía IR: ve a través de nubes de polvo', 'Comunicaciones por fibra óptica (~1.550 nm)'],
    detalle: 'William Herschel descubrió el infrarrojo en 1800 al medir la temperatura más allá del rojo visible con un termómetro. El cuerpo humano emite infrarrojo con pico en ~10 μm (ley de Wien).',
    peligro: 'bajo', peligroPct: 20,
  },
  {
    id: 'visible', nombre: 'Visible', icono: '👁️', color: '#27ae60', colorClaro: 'rgba(39,174,96,0.12)',
    freqMin: '430 THz', freqMax: '790 THz', lambdaMin: '380 nm', lambdaMax: '700 nm',
    energiaRango: '~2,8 – 5,2 × 10⁻¹⁹ J', descripcion: 'La única parte del espectro que nuestros ojos detectan: una rendija minúscula.',
    fuentes: ['El Sol (máximo en verde-amarillo)', 'Bombillas y LEDs', 'Pantallas (RGB)', 'Fuego', 'Bioluminiscencia (luciérnagas)'],
    aplicaciones: ['Visión humana: conos RGB en la retina', 'Fotografía y vídeo', 'Fibra óptica de corto alcance', 'Fotosíntesis (plantas absorben rojo y azul)', 'Iluminación LED: eficiencia >90%'],
    detalle: 'El arcoíris visible va de rojo (700 nm) a violeta (380 nm). El ojo humano es más sensible al verde-amarillo (~555 nm), la zona donde el Sol emite más. El cielo es azul porque las moléculas de aire dispersan más las longitudes de onda cortas (azul) que las largas (rojo): efecto Rayleigh.',
    peligro: 'seguro', peligroPct: 10,
  },
  {
    id: 'uv', nombre: 'Ultravioleta', icono: '☀️', color: '#8e44ad', colorClaro: 'rgba(142,68,173,0.12)',
    freqMin: '790 THz', freqMax: '30 PHz', lambdaMin: '10 nm', lambdaMax: '380 nm',
    energiaRango: '~5 × 10⁻¹⁹ – 2 × 10⁻¹⁷ J', descripcion: 'Donde empieza el peligro: energía suficiente para dañar el ADN.',
    fuentes: ['El Sol (5-7% de su radiación)', 'Lámparas UV germicidas', 'Camas de bronceado', 'Arco eléctrico de soldadura', 'Estrellas jóvenes y calientes'],
    aplicaciones: ['UV-A (315-380 nm): bronceado, envejecimiento de piel, luz negra', 'UV-B (280-315 nm): quemaduras solares, vitamina D, daño ADN', 'UV-C (100-280 nm): germicida, esterilización agua, filtrado por ozono', 'Detección de billetes falsos', 'Litografía en semiconductores (UV extremo ~13,5 nm)'],
    detalle: 'La capa de ozono absorbe el 97-99% del UV-B y todo el UV-C solar. Sin ella, la vida terrestre sería imposible. El agujero de ozono antártico (descubierto 1985) fue causado por CFCs y está recuperándose gracias al Protocolo de Montreal.',
    peligro: 'medio', peligroPct: 45,
  },
  {
    id: 'rayosx', nombre: 'Rayos X', icono: '🦴', color: '#2E86AB', colorClaro: 'rgba(46,134,171,0.12)',
    freqMin: '30 PHz', freqMax: '30 EHz', lambdaMin: '0,01 nm', lambdaMax: '10 nm',
    energiaRango: '~2 × 10⁻¹⁷ – 2 × 10⁻¹⁴ J', descripcion: 'Radiación ionizante que atraviesa tejidos blandos pero no huesos.',
    fuentes: ['Tubos de rayos X médicos', 'Estrellas de neutrones', 'Agujeros negros (disco de acreción)', 'Aceleradores de partículas', 'Material radiactivo'],
    aplicaciones: ['Radiografías médicas: huesos absorben, tejidos transmiten', 'TAC (tomografía): múltiples rayos X → imagen 3D', 'Cristalografía de rayos X: reveló la estructura del ADN (Rosalind Franklin, 1952)', 'Seguridad aeroportuaria: escáneres de equipaje', 'Astronomía de rayos X: estudia fenómenos extremos'],
    detalle: 'Wilhelm Röntgen descubrió los rayos X en 1895 y ganó el primer Nobel de Física (1901). La primera radiografía fue de la mano de su esposa Anna Bertha. Rosalind Franklin usó cristalografía de rayos X para obtener la Fotografía 51, clave para descifrar la estructura de doble hélice del ADN.',
    peligro: 'alto', peligroPct: 75,
  },
  {
    id: 'gamma', nombre: 'Gamma', icono: '☢️', color: '#6c3483', colorClaro: 'rgba(108,52,131,0.12)',
    freqMin: '>30 EHz', freqMax: '→ ∞', lambdaMin: '→ 0', lambdaMax: '<0,01 nm',
    energiaRango: '>2 × 10⁻¹⁴ J', descripcion: 'La radiación más energética: nace en reacciones nucleares y eventos cósmicos.',
    fuentes: ['Desintegración nuclear', 'Supernovas', 'Púlsares y magnetares', 'Brotes de rayos gamma (GRB)', 'Reactores nucleares'],
    aplicaciones: ['Radioterapia: destruye células cancerosas', 'Esterilización de instrumental médico y alimentos', 'Gammagrafía nuclear: diagnóstico médico con trazadores', 'Datación radiactiva (carbono-14)', 'Astronomía gamma: detecta los eventos más violentos del universo'],
    detalle: 'Un brote de rayos gamma (GRB) libera en segundos más energía que el Sol en toda su vida. Si uno ocurriera a menos de 6.000 años luz de la Tierra, destruiría la capa de ozono. Los GRB más lejanos detectados están a 13.000 millones de años luz.',
    peligro: 'maximo', peligroPct: 100,
  },
];

// ─── Colores del espectro visible ───

interface ColorVisible {
  nombre: string;
  lambda: string;
  hex: string;
}

const COLORES_VISIBLES: ColorVisible[] = [
  { nombre: 'Rojo', lambda: '620-700 nm', hex: '#FF0000' },
  { nombre: 'Naranja', lambda: '590-620 nm', hex: '#FF7F00' },
  { nombre: 'Amarillo', lambda: '570-590 nm', hex: '#FFFF00' },
  { nombre: 'Verde', lambda: '495-570 nm', hex: '#00FF00' },
  { nombre: 'Azul', lambda: '450-495 nm', hex: '#0000FF' },
  { nombre: 'Añil', lambda: '420-450 nm', hex: '#4B0082' },
  { nombre: 'Violeta', lambda: '380-420 nm', hex: '#8B00FF' },
];

// ─── Datos de energía y peligro ───

interface NivelPeligro {
  banda: string;
  icono: string;
  tipo: string;
  peligro: string;
  proteccion: string;
  color: string;
  zona: 'seguro' | 'precaucion' | 'peligro' | 'extremo';
}

const NIVELES_PELIGRO: NivelPeligro[] = [
  { banda: 'Radio', icono: '📻', tipo: 'No ionizante', peligro: 'Ninguno a niveles normales', proteccion: 'No necesaria', color: '#27ae60', zona: 'seguro' },
  { banda: 'Microondas', icono: '🍿', tipo: 'No ionizante', peligro: 'Calentamiento de tejidos a alta potencia', proteccion: 'Blindaje metálico (ej. puerta del horno)', color: '#27ae60', zona: 'seguro' },
  { banda: 'Infrarrojo', icono: '🌡️', tipo: 'No ionizante', peligro: 'Quemaduras térmicas', proteccion: 'Distancia, ropa protectora', color: '#2ecc71', zona: 'seguro' },
  { banda: 'Visible', icono: '👁️', tipo: 'No ionizante', peligro: 'Daño retiniano si miras al Sol', proteccion: 'No mirar fuentes intensas', color: '#f1c40f', zona: 'precaucion' },
  { banda: 'Ultravioleta', icono: '☀️', tipo: 'Ionizante (UV-B/C)', peligro: 'Quemaduras, cáncer de piel, cataratas', proteccion: 'Crema solar, gafas de sol, ropa', color: '#e67e22', zona: 'precaucion' },
  { banda: 'Rayos X', icono: '🦴', tipo: 'Ionizante', peligro: 'Daño celular, mutaciones, cáncer', proteccion: 'Delantal de plomo, paredes plomadas', color: '#e74c3c', zona: 'peligro' },
  { banda: 'Gamma', icono: '☢️', tipo: 'Ionizante', peligro: 'Destrucción celular masiva, muerte', proteccion: 'Hormigón grueso, plomo denso, distancia', color: '#8e44ad', zona: 'extremo' },
];

// ─── Datos y curiosidades ───

interface Curiosidad {
  icono: string;
  titulo: string;
  texto: string;
}

const CURIOSIDADES: Curiosidad[] = [
  { icono: '🧠', titulo: 'Maxwell predijo las ondas EM (1865)', texto: 'James Clerk Maxwell unificó electricidad y magnetismo en 4 ecuaciones y predijo que las ondas electromagnéticas viajan a la velocidad de la luz. Conclusión revolucionaria: la luz es una onda electromagnética.' },
  { icono: '📡', titulo: 'Hertz las demostró (1887)', texto: 'Heinrich Hertz construyó el primer transmisor y receptor de ondas de radio, confirmando la predicción de Maxwell. La unidad de frecuencia (hercio) lleva su nombre.' },
  { icono: '💡', titulo: 'La velocidad exacta: 299.792.458 m/s', texto: 'Desde 1983, la velocidad de la luz define el metro: un metro es la distancia que la luz recorre en 1/299.792.458 de segundo. No es una medición: es una definición.' },
  { icono: '🌡️', titulo: 'Tu cuerpo emite infrarrojo', texto: 'A ~37 °C, el cuerpo humano emite radiación infrarroja con pico en ~10 μm (según la ley de Wien). Es lo que detectan las cámaras térmicas. Emites unos 100 W de radiación infrarroja.' },
  { icono: '📻', titulo: 'El eco del Big Bang', texto: 'El fondo cósmico de microondas (CMB) es radiación de microondas que llena todo el universo, a una temperatura de 2,725 K. Es la luz más antigua del cosmos, emitida 380.000 años después del Big Bang.' },
  { icono: '📱', titulo: 'Tu smartphone usa 4 bandas', texto: 'Radio (4G/5G para datos), infrarrojo (sensor de proximidad), visible (pantalla LCD/OLED), y emite microondas cuando usas WiFi. Todo el espectro EM en tu bolsillo.' },
  { icono: '🌍', titulo: 'La Tierra brilla en infrarrojo', texto: 'Vista desde el espacio, la Tierra emite intensamente en infrarrojo. Los satélites meteorológicos usan sensores IR para medir temperatura de nubes, océanos y superficie terrestre.' },
  { icono: '⚡', titulo: 'Rayos gamma de un rayo', texto: 'Los relámpagos producen brevísimos destellos de rayos gamma llamados TGF (Terrestrial Gamma-ray Flashes). Fueron descubiertos en 1994 por un satélite de la NASA.' },
];

// ─── Constantes físicas ───

const C_LUZ = 299792458; // m/s
const H_PLANCK = 6.62607015e-34; // J·s

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function EspectroElectromagneticoPage() {
  const [seccion, setSeccion] = useState<Seccion>('espectro');
  const [bandaSeleccionada, setBandaSeleccionada] = useState(0);
  const [bandaEspectroActiva, setBandaEspectroActiva] = useState<number | null>(null);

  // Calculadora c = λ × f
  const [lambdaInput, setLambdaInput] = useState('500');
  const freqCalculada = lambdaInput ? C_LUZ / (parseFloat(lambdaInput) * 1e-9) : 0;
  const energiaCalculada = freqCalculada ? H_PLANCK * freqCalculada : 0;

  // ─── Renderizado secciones ───

  function renderEspectro() {
    return (
      <>
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>El espectro electromagnético completo</h2>
          <p className={styles.seccionSubtitulo}>7 bandas, una sola familia: ondas electromagnéticas</p>
        </div>

        {/* Fórmula fundamental */}
        <div className={styles.formulaCard}>
          <div className={styles.formula}>c = λ × f</div>
          <p className={styles.formulaDesc}>
            Velocidad de la luz ({formatNumber(C_LUZ, 0)} m/s) = longitud de onda (λ) × frecuencia (f)
          </p>
        </div>

        {/* Barra del espectro */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Barra del espectro EM (escala logarítmica)</h3>
          <p className={styles.cardSubtitulo}>Pulsa cada banda para ver detalles</p>

          <div className={styles.espectroBar} role="group" aria-label="Bandas del espectro electromagnético">
            {BANDAS.map((banda, idx) => (
              <button
                key={banda.id}
                type="button"
                className={`${styles.espectroBanda} ${bandaEspectroActiva === idx ? styles.espectroBandaActiva : ''}`}
                style={{ background: banda.color }}
                onClick={() => setBandaEspectroActiva(bandaEspectroActiva === idx ? null : idx)}
                aria-pressed={bandaEspectroActiva === idx}
                aria-label={`${banda.nombre}: ${banda.lambdaMin} a ${banda.lambdaMax}`}
              >
                <span className={styles.espectroBandaIcono} aria-hidden="true">{banda.icono}</span>
                <span className={styles.espectroBandaNombre}>{banda.nombre}</span>
              </button>
            ))}
          </div>

          <div className={styles.espectroLabels}>
            <span>← Mayor λ / Menor f</span>
            <span>Mayor f / Menor λ →</span>
          </div>

          {/* Detalle de banda clickada */}
          {bandaEspectroActiva !== null && (
            <div className={styles.bandaDetalle} style={{ borderLeftColor: BANDAS[bandaEspectroActiva].color }}>
              <h4 className={styles.bandaDetalleTitulo}>
                <span aria-hidden="true">{BANDAS[bandaEspectroActiva].icono}</span>{' '}
                {BANDAS[bandaEspectroActiva].nombre}
              </h4>
              <div className={styles.bandaDetalleGrid}>
                <div><strong>Frecuencia:</strong> {BANDAS[bandaEspectroActiva].freqMin} – {BANDAS[bandaEspectroActiva].freqMax}</div>
                <div><strong>Longitud de onda:</strong> {BANDAS[bandaEspectroActiva].lambdaMin} – {BANDAS[bandaEspectroActiva].lambdaMax}</div>
                <div><strong>Energía por fotón:</strong> {BANDAS[bandaEspectroActiva].energiaRango}</div>
              </div>
              <p className={styles.bandaDetalleDesc}>{BANDAS[bandaEspectroActiva].descripcion}</p>
            </div>
          )}
        </div>

        {/* Zoom: luz visible */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Zoom: la luz visible</h3>
          <p className={styles.cardSubtitulo}>Solo el 0,0035% del espectro EM es visible para nosotros</p>

          <div className={styles.zoomContainer}>
            <div className={styles.zoomFull}>
              <div className={styles.zoomFullBar}>
                {BANDAS.map(b => (
                  <div key={b.id} className={styles.zoomBandaGris} style={{ background: b.id === 'visible' ? undefined : '#d0d0d0' }}>
                    {b.id === 'visible' && <div className={styles.zoomVisibleMark} />}
                  </div>
                ))}
              </div>
              <p className={styles.zoomLabel}>Espectro completo — la franja de color es TODO lo que ves</p>
            </div>

            <div className={styles.arcoiris} aria-label="Espectro de luz visible de rojo a violeta">
              {COLORES_VISIBLES.map(c => (
                <div key={c.nombre} className={styles.arcoirisColor} style={{ background: c.hex }}>
                  <span className={styles.arcoirisNombre}>{c.nombre}</span>
                  <span className={styles.arcoirisLambda}>{c.lambda}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.insight}>
            <p>
              <strong>¿Por qué el cielo es azul?</strong> Las moléculas de aire dispersan más las longitudes de onda cortas (azul, ~450 nm) que las largas (rojo, ~700 nm). Este fenómeno se llama <strong>dispersión de Rayleigh</strong>. Al atardecer, la luz cruza más atmósfera y el azul se dispersa tanto que solo llega el rojo y naranja.
            </p>
          </div>
        </div>

        {/* Calculadora λ ↔ f */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Calculadora λ ↔ f ↔ E</h3>
          <p className={styles.cardSubtitulo}>Introduce una longitud de onda para calcular frecuencia y energía</p>

          <div className={styles.calcGrid}>
            <div className={styles.calcInput}>
              <label className={styles.sliderLabel}>
                <span>Longitud de onda (nm)</span>
                <span className={styles.sliderValue}>{lambdaInput} nm</span>
              </label>
              <input
                type="range"
                min="0.001"
                max="1000000"
                step="1"
                value={lambdaInput}
                onChange={e => setLambdaInput(e.target.value)}
                className={styles.sliderInput}
                aria-label="Longitud de onda en nanómetros"
              />
              <div className={styles.sliderRange}>
                <span>0,001 nm (gamma)</span>
                <span>1.000.000 nm (IR)</span>
              </div>
            </div>
            <div className={styles.calcResultados}>
              <div className={styles.calcResultado}>
                <span className={styles.calcLabel}>Frecuencia</span>
                <span className={styles.calcValor}>
                  {freqCalculada >= 1e15 ? `${formatNumber(freqCalculada / 1e15, 2)} PHz`
                    : freqCalculada >= 1e12 ? `${formatNumber(freqCalculada / 1e12, 2)} THz`
                    : freqCalculada >= 1e9 ? `${formatNumber(freqCalculada / 1e9, 2)} GHz`
                    : freqCalculada >= 1e6 ? `${formatNumber(freqCalculada / 1e6, 2)} MHz`
                    : `${formatNumber(freqCalculada, 0)} Hz`}
                </span>
              </div>
              <div className={styles.calcResultado}>
                <span className={styles.calcLabel}>Energía por fotón</span>
                <span className={styles.calcValor}>
                  {energiaCalculada >= 1e-15 ? `${formatNumber(energiaCalculada * 1e15, 3)} fJ`
                    : `${formatNumber(energiaCalculada / 1.602e-19, 3)} eV`}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.datoDestacado}>
          <div>
            <span className={styles.datoNumero}>0,0035%</span>
          </div>
          <p className={styles.datoTexto}>
            La luz visible (380-700 nm) es solo el 0,0035% del espectro electromagnético conocido. Nuestros ojos evolucionaron para detectar exactamente el rango donde el Sol emite más intensamente.
          </p>
        </div>
      </>
    );
  }

  function renderBandas() {
    const banda = BANDAS[bandaSeleccionada];

    return (
      <>
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>Cada banda en detalle</h2>
          <p className={styles.seccionSubtitulo}>Selecciona una banda para explorar sus aplicaciones</p>
        </div>

        {/* Selector de bandas */}
        <div className={styles.bandasSelector} role="group" aria-label="Selector de banda electromagnética">
          {BANDAS.map((b, idx) => (
            <button
              key={b.id}
              type="button"
              className={`${styles.bandaBtn} ${bandaSeleccionada === idx ? styles.bandaBtnActivo : ''}`}
              style={{
                borderColor: bandaSeleccionada === idx ? b.color : undefined,
                background: bandaSeleccionada === idx ? b.colorClaro : undefined,
              }}
              onClick={() => setBandaSeleccionada(idx)}
              aria-pressed={bandaSeleccionada === idx}
            >
              <span aria-hidden="true">{b.icono}</span>
              <span>{b.nombre}</span>
            </button>
          ))}
        </div>

        {/* Tarjeta de la banda */}
        <div className={styles.bandaCard} style={{ borderLeftColor: banda.color }}>
          <div className={styles.bandaHeader}>
            <span className={styles.bandaIconoGrande} aria-hidden="true">{banda.icono}</span>
            <div>
              <h3 className={styles.bandaNombre}>{banda.nombre}</h3>
              <p className={styles.bandaRango}>
                λ: {banda.lambdaMin} – {banda.lambdaMax} | f: {banda.freqMin} – {banda.freqMax}
              </p>
            </div>
          </div>

          <p className={styles.bandaDescripcion}>{banda.descripcion}</p>

          {/* Fuentes */}
          <div className={styles.bandaSeccion}>
            <h4 className={styles.bandaSeccionTitulo}>
              <span aria-hidden="true">🔌</span> Fuentes
            </h4>
            <ul className={styles.bandaLista}>
              {banda.fuentes.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          {/* Aplicaciones */}
          <div className={styles.bandaSeccion}>
            <h4 className={styles.bandaSeccionTitulo}>
              <span aria-hidden="true">⚙️</span> Aplicaciones
            </h4>
            <ul className={styles.bandaLista}>
              {banda.aplicaciones.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>

          {/* Dato interesante */}
          <div className={styles.insight}>
            <p>{banda.detalle}</p>
          </div>
        </div>

        {/* Colores del visible (solo si banda seleccionada es visible) */}
        {banda.id === 'visible' && (
          <div className={styles.card}>
            <h3 className={styles.cardTitulo}>El arcoíris: ROY-G-BIV</h3>
            <p className={styles.cardSubtitulo}>Rojo, Naranja, Amarillo, Verde, Azul, Añil, Violeta</p>
            <div className={styles.coloresGrid}>
              {COLORES_VISIBLES.map(c => (
                <div key={c.nombre} className={styles.colorCard}>
                  <div className={styles.colorMuestra} style={{ background: c.hex }} />
                  <span className={styles.colorNombre}>{c.nombre}</span>
                  <span className={styles.colorLambda}>{c.lambda}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.datoDestacado}>
          <div>
            <span className={styles.datoNumero}>7</span>
            <span className={styles.datoUnidad}> bandas</span>
          </div>
          <p className={styles.datoTexto}>
            Radio, microondas, infrarrojo, visible, ultravioleta, rayos X y gamma. Todas son ondas electromagnéticas que viajan a la misma velocidad (c), pero difieren en frecuencia y longitud de onda.
          </p>
        </div>
      </>
    );
  }

  function renderEnergia() {
    return (
      <>
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>Energía y peligro</h2>
          <p className={styles.seccionSubtitulo}>E = h × f — más frecuencia = más energía por fotón</p>
        </div>

        {/* Fórmula */}
        <div className={styles.formulaCard}>
          <div className={styles.formula}>E = h × f</div>
          <p className={styles.formulaDesc}>
            Energía del fotón = constante de Planck (6,626 × 10⁻³⁴ J·s) × frecuencia
          </p>
        </div>

        {/* Ionizante vs no ionizante */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Radiación no ionizante vs ionizante</h3>
          <p className={styles.cardSubtitulo}>El límite está en el ultravioleta</p>

          <div className={styles.ionizanteBar}>
            <div className={styles.ionizanteNoIon}>
              <span className={styles.ionizanteLabel}>No ionizante</span>
              <span className={styles.ionizanteBandas}>Radio → Visible</span>
            </div>
            <div className={styles.ionizanteLimite}>
              <span>UV</span>
            </div>
            <div className={styles.ionizanteIon}>
              <span className={styles.ionizanteLabel}>Ionizante</span>
              <span className={styles.ionizanteBandas}>UV-B/C → Gamma</span>
            </div>
          </div>

          <div className={styles.insight}>
            <p>
              <strong>No ionizante:</strong> los fotones no tienen suficiente energía para arrancar electrones de los átomos. Pueden calentar (microondas) pero no causan cáncer.
              <br /><br />
              <strong>Ionizante:</strong> los fotones tienen energía suficiente para romper enlaces químicos y dañar el ADN. Por eso los rayos X y gamma son peligrosos y se usan con precaución médica.
            </p>
          </div>
        </div>

        {/* ¿Por qué las microondas no causan cáncer? */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>¿Por qué las microondas calientan pero no causan cáncer?</h3>
          <p className={styles.cardSubtitulo}>La clave está en la energía por fotón</p>

          <div className={styles.contexto}>
            Un fotón de microondas (2,45 GHz) tiene una energía de ~10⁻²⁴ julios. Para romper un enlace del ADN se necesitan ~10⁻¹⁸ julios: un millón de veces más. Las microondas solo hacen vibrar moléculas de agua (calor), no rompen enlaces químicos.
          </div>
        </div>

        {/* Escala de peligro */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Escala de peligro por banda</h3>
          <p className={styles.cardSubtitulo}>De verde (seguro) a rojo (extremo)</p>

          <div className={styles.peligroScale}>
            {NIVELES_PELIGRO.map(nivel => (
              <div key={nivel.banda} className={styles.peligroRow}>
                <span className={styles.peligroIcono} aria-hidden="true">{nivel.icono}</span>
                <div className={styles.peligroInfo}>
                  <div className={styles.peligroNombre}>{nivel.banda}</div>
                  <div className={styles.peligroTipo}>{nivel.tipo}</div>
                </div>
                <div className={styles.peligroBarContainer}>
                  <div
                    className={styles.peligroBar}
                    style={{
                      width: `${BANDAS.find(b => b.nombre === nivel.banda)?.peligroPct ?? 10}%`,
                      background: nivel.color,
                    }}
                  />
                </div>
                <span className={`${styles.peligroTag} ${styles[`peligro${nivel.zona.charAt(0).toUpperCase()}${nivel.zona.slice(1)}`]}`}>
                  {nivel.zona === 'seguro' && 'Seguro'}
                  {nivel.zona === 'precaucion' && 'Precaución'}
                  {nivel.zona === 'peligro' && 'Peligro'}
                  {nivel.zona === 'extremo' && 'Extremo'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Protecciones */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Protecciones por tipo de radiación</h3>
          <p className={styles.cardSubtitulo}>Cómo nos protegemos de cada banda</p>

          <div className={styles.proteccionGrid}>
            {NIVELES_PELIGRO.filter(n => n.proteccion !== 'No necesaria').map(nivel => (
              <div key={nivel.banda} className={styles.proteccionCard}>
                <div className={styles.proteccionHeader}>
                  <span aria-hidden="true">{nivel.icono}</span>
                  <strong>{nivel.banda}</strong>
                </div>
                <p className={styles.proteccionPeligro}>{nivel.peligro}</p>
                <p className={styles.proteccionSolucion}>
                  <span aria-hidden="true">🛡️</span> {nivel.proteccion}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.warningBox}>
          <strong>Nota importante:</strong> La peligrosidad depende de la <em>dosis</em> (energía × tiempo de exposición), no solo del tipo de radiación. Una radiografía dental (0,005 mSv) es mucho menos que la radiación natural anual (~2,4 mSv). Todo es cuestión de cantidad.
        </div>

        <div className={styles.datoDestacado}>
          <div>
            <span className={styles.datoNumero}>10⁶×</span>
          </div>
          <p className={styles.datoTexto}>
            Un fotón gamma tiene más de un millón de veces más energía que un fotón de microondas. Esa diferencia es lo que separa &quot;calienta agua&quot; de &quot;rompe ADN&quot;.
          </p>
        </div>
      </>
    );
  }

  function renderDatos() {
    return (
      <>
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>Datos y curiosidades</h2>
          <p className={styles.seccionSubtitulo}>Historia, récords y hechos sorprendentes</p>
        </div>

        {/* Timeline histórico */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>Hitos históricos</h3>
          <p className={styles.cardSubtitulo}>De Maxwell al fondo cósmico de microondas</p>

          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <span className={styles.timelineAnio}>1800</span>
              <div className={styles.timelineContenido}>
                <strong>Herschel descubre el infrarrojo</strong>
                <p>Midió temperatura más allá del rojo visible con un termómetro.</p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <span className={styles.timelineAnio}>1801</span>
              <div className={styles.timelineContenido}>
                <strong>Ritter descubre el ultravioleta</strong>
                <p>Observó que cloruro de plata se oscurecía más allá del violeta.</p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <span className={styles.timelineAnio}>1865</span>
              <div className={styles.timelineContenido}>
                <strong>Maxwell: ecuaciones del electromagnetismo</strong>
                <p>Predijo las ondas EM y que la luz es una de ellas.</p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <span className={styles.timelineAnio}>1887</span>
              <div className={styles.timelineContenido}>
                <strong>Hertz demuestra las ondas de radio</strong>
                <p>Primer transmisor y receptor. Confirmó a Maxwell.</p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <span className={styles.timelineAnio}>1895</span>
              <div className={styles.timelineContenido}>
                <strong>Röntgen descubre los rayos X</strong>
                <p>Primera radiografía: la mano de su esposa. Nobel 1901.</p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <span className={styles.timelineAnio}>1900</span>
              <div className={styles.timelineContenido}>
                <strong>Villard identifica los rayos gamma</strong>
                <p>Más penetrantes que alfa y beta. Radiación nuclear.</p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <span className={styles.timelineAnio}>1965</span>
              <div className={styles.timelineContenido}>
                <strong>Penzias y Wilson: fondo cósmico de microondas</strong>
                <p>Detectaron el eco del Big Bang a 2,725 K. Nobel 1978.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Curiosidades */}
        <div className={styles.curiosidadGrid}>
          {CURIOSIDADES.map((c, idx) => (
            <div key={idx} className={styles.curiosidadCard}>
              <div className={styles.curiosidadHeader}>
                <span className={styles.curiosidadIcono} aria-hidden="true">{c.icono}</span>
                <h4 className={styles.curiosidadTitulo}>{c.titulo}</h4>
              </div>
              <p className={styles.curiosidadTexto}>{c.texto}</p>
            </div>
          ))}
        </div>

        {/* La velocidad */}
        <div className={styles.card}>
          <h3 className={styles.cardTitulo}>La velocidad de la luz en perspectiva</h3>
          <p className={styles.cardSubtitulo}>299.792.458 m/s — nada viaja más rápido</p>

          <div className={styles.velocidadGrid}>
            {[
              { destino: 'Luna', distancia: '384.400 km', tiempo: '1,3 segundos', pct: 4 },
              { destino: 'Sol', distancia: '150 millones km', tiempo: '8 min 20 s', pct: 25 },
              { destino: 'Marte (mín)', distancia: '55 millones km', tiempo: '3 min 2 s', pct: 15 },
              { destino: 'Júpiter', distancia: '778 millones km', tiempo: '43 min', pct: 45 },
              { destino: 'Estrella más cercana', distancia: '4,24 años luz', tiempo: '4,24 años', pct: 80 },
              { destino: 'Centro Vía Láctea', distancia: '26.000 años luz', tiempo: '26.000 años', pct: 100 },
            ].map(v => (
              <div key={v.destino} className={styles.velocidadRow}>
                <span className={styles.velocidadMedio}>{v.destino}</span>
                <div className={styles.velocidadBarContainer}>
                  <div className={styles.velocidadBar} style={{ width: `${v.pct}%` }} />
                </div>
                <span className={styles.velocidadValor}>{v.tiempo}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.datoDestacado}>
          <div>
            <span className={styles.datoNumero}>c</span>
            <span className={styles.datoUnidad}> exacto</span>
          </div>
          <p className={styles.datoTexto}>
            La velocidad de la luz no se mide: se define. Desde 1983, un metro es la distancia que la luz recorre en 1/{formatNumber(C_LUZ, 0)} de segundo. Es una de las constantes fundamentales del universo.
          </p>
        </div>
      </>
    );
  }

  // ─── Render principal ───

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🌈</span> Espectro Electromagnético</h1>
          <p className={styles.subtitle}>Radio, microondas, infrarrojo, visible, UV, rayos X y gamma — el mismo fenómeno a distinta frecuencia</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccion === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccion(s.id)}
              aria-pressed={seccion === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Contenido de sección activa */}
        {seccion === 'espectro' && renderEspectro()}
        {seccion === 'bandas' && renderBandas()}
        {seccion === 'energia' && renderEnergia()}
        {seccion === 'datos' && renderDatos()}

        {/* Contenido educativo */}
        <EducationalSection
          title="📚 ¿Quieres profundizar?"
          subtitle="Conceptos avanzados sobre ondas electromagnéticas"
        >
          <section>
            <h2>¿Qué es realmente una onda electromagnética?</h2>
            <p>
              Una onda electromagnética es una perturbación autosostenida de campos eléctricos y magnéticos perpendiculares entre sí,
              que se propaga por el espacio sin necesidad de medio material. A diferencia del sonido (que necesita aire), la luz viaja
              perfectamente por el vacío. Maxwell demostró en 1865 que un campo eléctrico cambiante genera un campo magnético, y viceversa,
              creando una onda que se autopropaga a la velocidad de la luz.
            </p>

            <h2>Dualidad onda-partícula</h2>
            <p>
              La luz se comporta como onda (interferencia, difracción) y como partícula (efecto fotoeléctrico).
              Einstein explicó en 1905 que la luz viene en paquetes discretos de energía llamados fotones,
              cada uno con energía E = h × f. Este descubrimiento revolucionó la física y le valió el Nobel en 1921.
              Hoy sabemos que toda la radiación EM tiene esta naturaleza dual.
            </p>

            <h2>Ley de Wien y radiación de cuerpo negro</h2>
            <p>
              Todo objeto con temperatura emite radiación EM. La ley de Wien dice que el pico de emisión se desplaza a
              frecuencias más altas (λ más corta) cuanto más caliente está el objeto. El Sol (~5.778 K) emite máximo en
              el visible (verde-amarillo). Una persona (~310 K) emite en infrarrojo. Una estrella muy caliente (~30.000 K)
              emite máximo en ultravioleta y se ve azulada.
            </p>

            <h2>Aplicaciones modernas del espectro</h2>
            <p>
              La espectroscopía permite identificar la composición química de estrellas lejanas analizando qué longitudes
              de onda absorben. Los telescopios de radio (como ALMA en Chile) observan el universo frío. Los de rayos X
              (Chandra) estudian agujeros negros. Los de gamma (Fermi) detectan las explosiones más violentas del cosmos.
              En medicina, la resonancia magnética usa ondas de radio, la PET usa radiación gamma, y la ecografía usa
              ultrasonido (que no es EM, sino mecánico).
            </p>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-espectro-electromagnetico')} />
        <ShareCard appName="visualizador-espectro-electromagnetico" />
        <Footer appName="visualizador-espectro-electromagnetico" />
      </div>
    </>
  );
}
