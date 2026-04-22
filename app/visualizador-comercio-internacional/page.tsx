'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './VisualizadorComercioInternacional.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type SeccionActiva = 'comparativa' | 'balanza' | 'cambio' | 'aranceles';

interface SeccionNav {
  id: SeccionActiva;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES_NAV: SeccionNav[] = [
  {
    id: 'comparativa',
    titulo: 'Ventaja Comparativa',
    icono: '🔄',
    subtitulo: 'Teoría de David Ricardo',
  },
  {
    id: 'balanza',
    titulo: 'Balanza Comercial',
    icono: '⚖️',
    subtitulo: 'Exportaciones e importaciones',
  },
  {
    id: 'cambio',
    titulo: 'Tipos de Cambio',
    icono: '💱',
    subtitulo: 'Efecto en el comercio exterior',
  },
  {
    id: 'aranceles',
    titulo: 'Aranceles',
    icono: '🛡️',
    subtitulo: 'Proteccionismo comercial',
  },
];

// Datos por país para la Balanza Comercial
interface DatosBalanza {
  pais: string;
  bandera: string;
  exportaciones: number; // en miles de millones €
  importaciones: number;
  balanzaComercial: number;
  balanzaServicios: number;
  balanzaCorriente: number;
  exportacionTop: string;
  nota: string;
}

const DATOS_BALANZA: Record<string, DatosBalanza> = {
  espana: {
    pais: 'España',
    bandera: '🇪🇸',
    exportaciones: 430,
    importaciones: 450,
    balanzaComercial: -20,
    balanzaServicios: 72,
    balanzaCorriente: 28,
    exportacionTop: 'Automoción, turismo, agroalimentario',
    nota: 'El superávit turístico compensa el déficit comercial en bienes.',
  },
  alemania: {
    pais: 'Alemania',
    bandera: '🇩🇪',
    exportaciones: 1560,
    importaciones: 1330,
    balanzaComercial: 230,
    balanzaServicios: -18,
    balanzaCorriente: 196,
    exportacionTop: 'Vehículos, maquinaria, productos químicos',
    nota: 'Alemania es el mayor exportador de Europa y tiene uno de los mayores superávits del mundo.',
  },
  china: {
    pais: 'China',
    bandera: '🇨🇳',
    exportaciones: 3380,
    importaciones: 2560,
    balanzaComercial: 820,
    balanzaServicios: -55,
    balanzaCorriente: 401,
    exportacionTop: 'Electrónica, maquinaria, textil',
    nota: 'China es el mayor exportador mundial de bienes, con un superávit récord en 2023.',
  },
};

// Tipos de barreras comerciales
interface BarreraComercial {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  ejemplo: string;
  color: string;
}

const BARRERAS_COMERCIALES: BarreraComercial[] = [
  {
    id: 'advalorem',
    nombre: 'Aranceles ad valorem',
    icono: '📊',
    descripcion:
      'Se calcula como un porcentaje del valor del producto importado. Es el tipo más habitual en la UE y la OMC.',
    ejemplo: 'Arancel UE sobre coches chinos: 27,5% del valor declarado en aduana',
    color: '#2E86AB',
  },
  {
    id: 'especifico',
    nombre: 'Aranceles específicos',
    icono: '⚖️',
    descripcion:
      'Cantidad fija por unidad de producto, independientemente de su precio. Más predecible pero menos flexible.',
    ejemplo: 'Arancel sobre pollo: 0,80 € por kilogramo importado',
    color: '#48A9A6',
  },
  {
    id: 'cuotas',
    nombre: 'Cuotas de importación',
    icono: '🚫',
    descripcion:
      'Límite máximo de cantidad que puede importarse en un período. Más restrictivo que un arancel.',
    ejemplo: 'UE fija una cuota de 100.000 toneladas anuales de azúcar de terceros países',
    color: '#E67E22',
  },
  {
    id: 'notarancelarias',
    nombre: 'Barreras no arancelarias',
    icono: '📋',
    descripcion:
      'Normas técnicas, sanitarias, de etiquetado o certificaciones que pueden actuar como obstáculos al comercio.',
    ejemplo: 'Normas REACH de la UE sobre sustancias químicas, o estándares fitosanitarios para frutas',
    color: '#8E44AD',
  },
];

// Hitos de la guerra comercial
interface HitoGuerraComercial {
  fecha: string;
  titulo: string;
  descripcion: string;
  impacto: string;
}

const HITOS_GUERRA_COMERCIAL: HitoGuerraComercial[] = [
  {
    fecha: 'Mar 2018',
    titulo: 'EEUU impone aranceles al acero y aluminio',
    descripcion: 'Trump aplica aranceles del 25% al acero y 10% al aluminio a casi todo el mundo, incluida China.',
    impacto: 'Inicio del conflicto. China responde con aranceles a soja y aviación.',
  },
  {
    fecha: 'Jul 2018',
    titulo: 'Primera oleada: 34.000M$ en bienes chinos',
    descripcion: 'EEUU impone aranceles del 25% sobre 818 productos chinos. China replica de forma inmediata.',
    impacto: 'Coste estimado para la economía EEUU: 0,1% del PIB anual.',
  },
  {
    fecha: 'Sep 2019',
    titulo: 'Aranceles a casi todo el comercio con China',
    descripcion:
      'Cerca del 96% de las importaciones chinas en EEUU sujetas a aranceles extra. Tipo medio supera el 20%.',
    impacto: 'Recomposición de cadenas de suministro. Auge de Vietnam y México como alternativas.',
  },
  {
    fecha: 'Ene 2020',
    titulo: 'Acuerdo de "Fase 1"',
    descripcion:
      'China se compromete a comprar 200.000M$ adicionales de bienes EEUU en 2 años. Se suspenden algunos aranceles.',
    impacto: 'China no cumple el objetivo de compras. Tensión estructural persiste.',
  },
  {
    fecha: 'Ene 2021',
    titulo: 'Biden mantiene aranceles Trump',
    descripcion:
      'La nueva administración mantiene la mayoría de los aranceles como palanca de negociación.',
    impacto: 'Continuidad de la política comercial restrictiva bipartidista.',
  },
  {
    fecha: 'May 2024',
    titulo: 'Nuevos aranceles: VE, semiconductores y paneles solares',
    descripcion:
      'Biden multiplica por 4 los aranceles a vehículos eléctricos chinos (hasta 100%). Semiconductores al 50%.',
    impacto: 'Reacción de la UE: aranceles propios sobre coches eléctricos chinos (hasta 35%).',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorComercioInternacional() {
  // Estado de navegación
  const [seccionActiva, setSeccionActiva] = useState<SeccionActiva>('comparativa');

  // ── Sección 1: Ventaja Comparativa ──
  const [horasEspaniaCoche, setHorasEspaniaCoche] = useState(10);
  const [horasEspaniaNaranja, setHorasEspaniaNaranja] = useState(2);
  const [horasMarruecosCoche, setHorasMarruecosCoche] = useState(20);
  const [horasMarruecosNaranja, setHorasMarruecosNaranja] = useState(1);
  const [verConComercio, setVerConComercio] = useState(false);

  // ── Sección 2: Balanza Comercial ──
  const [paisSeleccionado, setPaisSeleccionado] = useState<'espana' | 'alemania' | 'china'>('espana');

  // ── Sección 3: Tipos de Cambio ──
  const [parDivisas, setParDivisas] = useState<'EUR/USD' | 'EUR/GBP' | 'EUR/JPY' | 'EUR/CNY'>('EUR/USD');
  const [variacionCambio, setVariacionCambio] = useState(0); // -30 a +30 %

  // ── Sección 4: Aranceles ──
  const [precioImportacion, setPrecioImportacion] = useState(200);
  const [porcentajeArancel, setPorcentajeArancel] = useState(25);
  const [barreraSeleccionada, setBarreraSeleccionada] = useState<string | null>(null);

  // ─────────────────────────────────────────────
  // Cálculos: Ventaja Comparativa
  // ─────────────────────────────────────────────

  const calcularVentajaComparativa = useCallback(() => {
    // Coste de oportunidad: cuántas naranjas se sacrifican por producir 1 coche
    const costeOportEspaniaCoche = horasEspaniaCoche / horasEspaniaNaranja;
    const costeOportMarruecosCoche = horasMarruecosCoche / horasMarruecosNaranja;
    // Cuántos coches se sacrifican por producir 1 naranja
    const costeOportEspaniaNaranja = horasEspaniaNaranja / horasEspaniaCoche;
    const costeOportMarruecosNaranja = horasMarruecosNaranja / horasMarruecosCoche;

    // Ventaja absoluta
    const ventajaAbsolutaCoche = horasEspaniaCoche < horasMarruecosCoche ? 'España' : 'Marruecos';
    const ventajaAbsolutaNaranja = horasEspaniaNaranja < horasMarruecosNaranja ? 'España' : 'Marruecos';

    // Ventaja comparativa
    const ventajaComparativaCoche =
      costeOportEspaniaCoche < costeOportMarruecosCoche ? 'España' : 'Marruecos';
    const ventajaComparativaNaranja =
      costeOportEspaniaNaranja < costeOportMarruecosNaranja ? 'España' : 'Marruecos';

    // Producción sin comercio (ejemplo: 100 horas para cada país)
    const horasTotales = 100;
    const espaniaCochesSinComercio = Math.floor(horasTotales / 2 / horasEspaniaCoche);
    const espaniaNaranjasSinComercio = Math.floor(horasTotales / 2 / horasEspaniaNaranja);
    const marrueccosCochesSinComercio = Math.floor(horasTotales / 2 / horasMarruecosCoche);
    const marruecosNaranjasSinComercio = Math.floor(horasTotales / 2 / horasMarruecosNaranja);

    // Producción con especialización (cada país produce solo su bien comparativo)
    const espaniaCochesConComercio =
      ventajaComparativaCoche === 'España' ? Math.floor(horasTotales / horasEspaniaCoche) : 0;
    const espaniaNaranjasConComercio =
      ventajaComparativaNaranja === 'España' ? Math.floor(horasTotales / horasEspaniaNaranja) : 0;
    const marrueccosCochesConComercio =
      ventajaComparativaCoche === 'Marruecos' ? Math.floor(horasTotales / horasMarruecosCoche) : 0;
    const marruecosNaranjasConComercio =
      ventajaComparativaNaranja === 'Marruecos' ? Math.floor(horasTotales / horasMarruecosNaranja) : 0;

    return {
      costeOportEspaniaCoche: costeOportEspaniaCoche.toFixed(2),
      costeOportMarruecosCoche: costeOportMarruecosCoche.toFixed(2),
      costeOportEspaniaNaranja: costeOportEspaniaNaranja.toFixed(2),
      costeOportMarruecosNaranja: costeOportMarruecosNaranja.toFixed(2),
      ventajaAbsolutaCoche,
      ventajaAbsolutaNaranja,
      ventajaComparativaCoche,
      ventajaComparativaNaranja,
      sinComercio: {
        espaniaCocheSinComercio: espaniaCochesSinComercio,
        espaniaNaranjaSinComercio: espaniaNaranjasSinComercio,
        marruecosCocheSinComercio: marrueccosCochesSinComercio,
        marruecosNaranjaSinComercio: marruecosNaranjasSinComercio,
        totalCoches: espaniaCochesSinComercio + marrueccosCochesSinComercio,
        totalNaranjas: espaniaNaranjasSinComercio + marruecosNaranjasSinComercio,
      },
      conComercio: {
        espaniaCoches: espaniaCochesConComercio,
        espaniaNaranjas: espaniaNaranjasConComercio,
        marruecosCoches: marrueccosCochesConComercio,
        marruecosNaranjas: marruecosNaranjasConComercio,
        totalCoches: espaniaCochesConComercio + marrueccosCochesConComercio,
        totalNaranjas: espaniaNaranjasConComercio + marruecosNaranjasConComercio,
      },
    };
  }, [
    horasEspaniaCoche,
    horasEspaniaNaranja,
    horasMarruecosCoche,
    horasMarruecosNaranja,
  ]);

  const vc = calcularVentajaComparativa();

  // ─────────────────────────────────────────────
  // Cálculos: Tipos de Cambio
  // ─────────────────────────────────────────────

  const TIPOS_BASE: Record<string, number> = {
    'EUR/USD': 1.08,
    'EUR/GBP': 0.86,
    'EUR/JPY': 162.0,
    'EUR/CNY': 7.85,
  };

  const NOMBRES_DIVISA: Record<string, string> = {
    'EUR/USD': 'dólar estadounidense',
    'EUR/GBP': 'libra esterlina',
    'EUR/JPY': 'yen japonés',
    'EUR/CNY': 'yuan chino',
  };

  const tipoBase = TIPOS_BASE[parDivisas];
  const tipoActual = tipoBase * (1 + variacionCambio / 100);
  const euro100EnDivisa = (100 * tipoActual).toFixed(2);
  const apreciacion = variacionCambio > 0;
  const depreciacion = variacionCambio < 0;

  // Ejemplo concreto Airbus
  const precioAirbusEur = 100; // Millones €
  const precioAirbusBase = (precioAirbusEur * tipoBase).toFixed(1);
  const precioAirbusActual = (precioAirbusEur * tipoActual).toFixed(1);
  const diferenciaPct = variacionCambio.toFixed(1);

  // ─────────────────────────────────────────────
  // Cálculos: Aranceles
  // ─────────────────────────────────────────────

  const arancelEuros = (precioImportacion * porcentajeArancel) / 100;
  const precioFinal = precioImportacion + arancelEuros;
  const porcentajeEncarecimiento = porcentajeArancel;

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  const datosBalanza = DATOS_BALANZA[paisSeleccionado];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Economía Global</span>
          <h1 className={styles.heroTitle}>Comercio Internacional</h1>
          <p className={styles.heroSubtitle}>
            Ventaja comparativa · Balanza comercial · Tipos de cambio · Aranceles
          </p>
          <p className={styles.heroDesc}>
            Explora los mecanismos del comercio global: por qué los países se especializan, cómo se
            miden los flujos comerciales, el impacto de las divisas en las exportaciones y cómo
            funcionan las barreras arancelarias.
          </p>
        </div>
      </header>

      <LegalNotice />

      {/* Navegación de secciones */}
      <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
        {SECCIONES_NAV.map((s) => (
          <button
            key={s.id}
            className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navBtnActivo : ''}`}
            onClick={() => setSeccionActiva(s.id)}
            aria-pressed={seccionActiva === s.id}
          >
            <span aria-hidden="true" className={styles.navBtnIcono}>{s.icono}</span>
            <span className={styles.navBtnTitulo}>{s.titulo}</span>
            <span className={styles.navBtnSub}>{s.subtitulo}</span>
          </button>
        ))}
      </nav>

      {/* ── SECCIÓN 1: VENTAJA COMPARATIVA ── */}
      {seccionActiva === 'comparativa' && (
        <section className={styles.section} aria-labelledby="titulo-comparativa">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">🔄</span>
            <div>
              <h2 className={styles.sectionTitle} id="titulo-comparativa">
                Ventaja Comparativa — Teoría de David Ricardo (1817)
              </h2>
              <p className={styles.sectionSubtitle}>
                Ajusta las horas de producción y observa cómo cada país se especializa según su ventaja
                comparativa, aunque uno sea más eficiente en todo.
              </p>
            </div>
          </div>

          <div className={styles.comparativaGrid}>
            {/* Sliders España */}
            <div className={styles.paisCard}>
              <h3 className={styles.paisNombre}>🇪🇸 España</h3>
              <div className={styles.sliderGrupo}>
                <label className={styles.sliderLabel} htmlFor="esp-coche">
                  Horas para producir 1 coche: <strong>{horasEspaniaCoche}h</strong>
                </label>
                <input
                  id="esp-coche"
                  type="range"
                  min={1}
                  max={40}
                  value={horasEspaniaCoche}
                  onChange={(e) => setHorasEspaniaCoche(Number(e.target.value))}
                  className={styles.slider}
                  aria-label="Horas España para producir un coche"
                />
                <div className={styles.sliderValores}><span>1h</span><span>40h</span></div>
              </div>
              <div className={styles.sliderGrupo}>
                <label className={styles.sliderLabel} htmlFor="esp-naranja">
                  Horas para producir 1 naranja: <strong>{horasEspaniaNaranja}h</strong>
                </label>
                <input
                  id="esp-naranja"
                  type="range"
                  min={1}
                  max={20}
                  value={horasEspaniaNaranja}
                  onChange={(e) => setHorasEspaniaNaranja(Number(e.target.value))}
                  className={styles.slider}
                  aria-label="Horas España para producir una naranja"
                />
                <div className={styles.sliderValores}><span>1h</span><span>20h</span></div>
              </div>
            </div>

            {/* Sliders Marruecos */}
            <div className={styles.paisCard}>
              <h3 className={styles.paisNombre}>🇲🇦 Marruecos</h3>
              <div className={styles.sliderGrupo}>
                <label className={styles.sliderLabel} htmlFor="mar-coche">
                  Horas para producir 1 coche: <strong>{horasMarruecosCoche}h</strong>
                </label>
                <input
                  id="mar-coche"
                  type="range"
                  min={1}
                  max={40}
                  value={horasMarruecosCoche}
                  onChange={(e) => setHorasMarruecosCoche(Number(e.target.value))}
                  className={styles.slider}
                  aria-label="Horas Marruecos para producir un coche"
                />
                <div className={styles.sliderValores}><span>1h</span><span>40h</span></div>
              </div>
              <div className={styles.sliderGrupo}>
                <label className={styles.sliderLabel} htmlFor="mar-naranja">
                  Horas para producir 1 naranja: <strong>{horasMarruecosNaranja}h</strong>
                </label>
                <input
                  id="mar-naranja"
                  type="range"
                  min={1}
                  max={20}
                  value={horasMarruecosNaranja}
                  onChange={(e) => setHorasMarruecosNaranja(Number(e.target.value))}
                  className={styles.slider}
                  aria-label="Horas Marruecos para producir una naranja"
                />
                <div className={styles.sliderValores}><span>1h</span><span>20h</span></div>
              </div>
            </div>
          </div>

          {/* Tabla de costes de oportunidad */}
          <div className={styles.tablaComparativaWrapper}>
            <h3 className={styles.tablaComparativaTitulo}>Coste de oportunidad</h3>
            <table className={styles.tablaComparativa}>
              <caption className={styles.tablaCaption}>
                Coste de oportunidad por bien y país
              </caption>
              <thead>
                <tr>
                  <th scope="col">País</th>
                  <th scope="col">1 coche cuesta…</th>
                  <th scope="col">1 naranja cuesta…</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🇪🇸 España</td>
                  <td>{vc.costeOportEspaniaCoche} naranjas</td>
                  <td>{vc.costeOportEspaniaNaranja} coches</td>
                </tr>
                <tr>
                  <td>🇲🇦 Marruecos</td>
                  <td>{vc.costeOportMarruecosCoche} naranjas</td>
                  <td>{vc.costeOportMarruecosNaranja} coches</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Conclusión de ventajas */}
          <div className={styles.ventajasGrid}>
            <div className={styles.ventajaCard}>
              <p className={styles.ventajaTipo}>Ventaja absoluta 🏆</p>
              <p className={styles.ventajaDetalle}>
                🚗 Coches: <strong>{vc.ventajaAbsolutaCoche}</strong>
              </p>
              <p className={styles.ventajaDetalle}>
                🍊 Naranjas: <strong>{vc.ventajaAbsolutaNaranja}</strong>
              </p>
              <p className={styles.ventajaExplicacion}>
                El país que produce cada bien con menos horas totales.
              </p>
            </div>
            <div className={`${styles.ventajaCard} ${styles.ventajaCardDestacada}`}>
              <p className={styles.ventajaTipo}>Ventaja comparativa ⭐</p>
              <p className={styles.ventajaDetalle}>
                🚗 Debe especializarse: <strong>{vc.ventajaComparativaCoche}</strong>
              </p>
              <p className={styles.ventajaDetalle}>
                🍊 Debe especializarse: <strong>{vc.ventajaComparativaNaranja}</strong>
              </p>
              <p className={styles.ventajaExplicacion}>
                El país con menor coste de oportunidad relativo. Esto es lo que impulsa el comercio,
                aunque un país sea peor en todo.
              </p>
            </div>
          </div>

          {/* Producción con/sin comercio */}
          <div className={styles.comercioToggle}>
            <button
              className={!verConComercio ? styles.btnPrimario : styles.btnSecundario}
              onClick={() => setVerConComercio(false)}
              aria-pressed={!verConComercio}
            >
              Sin comercio
            </button>
            <button
              className={verConComercio ? styles.btnPrimario : styles.btnSecundario}
              onClick={() => setVerConComercio(true)}
              aria-pressed={verConComercio}
            >
              Con especialización
            </button>
          </div>

          {!verConComercio ? (
            <div className={styles.produccionGrid}>
              <div className={styles.produccionCard}>
                <p className={styles.produccionPais}>🇪🇸 España (100h divididas)</p>
                <p className={styles.produccionDato}>🚗 {vc.sinComercio.espaniaCocheSinComercio} coches</p>
                <p className={styles.produccionDato}>🍊 {vc.sinComercio.espaniaNaranjaSinComercio} naranjas</p>
              </div>
              <div className={styles.produccionCard}>
                <p className={styles.produccionPais}>🇲🇦 Marruecos (100h divididas)</p>
                <p className={styles.produccionDato}>🚗 {vc.sinComercio.marruecosCocheSinComercio} coches</p>
                <p className={styles.produccionDato}>🍊 {vc.sinComercio.marruecosNaranjaSinComercio} naranjas</p>
              </div>
              <div className={`${styles.produccionCard} ${styles.produccionTotal}`}>
                <p className={styles.produccionPais}>Total mundial</p>
                <p className={styles.produccionDato}>🚗 {vc.sinComercio.totalCoches} coches</p>
                <p className={styles.produccionDato}>🍊 {vc.sinComercio.totalNaranjas} naranjas</p>
              </div>
            </div>
          ) : (
            <div className={styles.produccionGrid}>
              <div className={styles.produccionCard}>
                <p className={styles.produccionPais}>🇪🇸 España (especializada)</p>
                <p className={styles.produccionDato}>🚗 {vc.conComercio.espaniaCoches} coches</p>
                <p className={styles.produccionDato}>🍊 {vc.conComercio.espaniaNaranjas} naranjas</p>
              </div>
              <div className={styles.produccionCard}>
                <p className={styles.produccionPais}>🇲🇦 Marruecos (especializado)</p>
                <p className={styles.produccionDato}>🚗 {vc.conComercio.marruecosCoches} coches</p>
                <p className={styles.produccionDato}>🍊 {vc.conComercio.marruecosNaranjas} naranjas</p>
              </div>
              <div className={`${styles.produccionCard} ${styles.produccionTotal}`}>
                <p className={styles.produccionPais}>Total mundial (especialización)</p>
                <p className={styles.produccionDato}>🚗 {vc.conComercio.totalCoches} coches</p>
                <p className={styles.produccionDato}>🍊 {vc.conComercio.totalNaranjas} naranjas</p>
              </div>
            </div>
          )}

          <div className={styles.warningBox}>
            <span aria-hidden="true">💡</span>
            <p>
              <strong>Insight clave</strong>: Ricardo demostró que aunque España fuese más eficiente
              produciendo ambos bienes, ambos países ganan si cada uno se especializa en aquel
              donde su desventaja es <em>relativamente menor</em>. El comercio crea riqueza aunque un
              país sea mejor en todo.
            </p>
          </div>
        </section>
      )}

      {/* ── SECCIÓN 2: BALANZA COMERCIAL ── */}
      {seccionActiva === 'balanza' && (
        <section className={styles.section} aria-labelledby="titulo-balanza">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">⚖️</span>
            <div>
              <h2 className={styles.sectionTitle} id="titulo-balanza">
                La Balanza Comercial
              </h2>
              <p className={styles.sectionSubtitle}>
                Compara exportaciones e importaciones de diferentes países y entiende por qué un
                déficit comercial no es siempre negativo.
              </p>
            </div>
          </div>

          {/* Selector de país */}
          <div className={styles.selectorPais}>
            {(['espana', 'alemania', 'china'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPaisSeleccionado(p)}
                className={`${styles.btnPais} ${paisSeleccionado === p ? styles.btnPaisActivo : ''}`}
                aria-pressed={paisSeleccionado === p}
              >
                {DATOS_BALANZA[p].bandera} {DATOS_BALANZA[p].pais}
              </button>
            ))}
          </div>

          {/* Diagrama SVG de flujos */}
          <div className={styles.flujoSvg} role="img" aria-label={`Flujo comercial de ${datosBalanza.pais}`}>
            <svg viewBox="0 0 600 200" className={styles.svgDiagrama}>
              {/* País central */}
              <rect x="220" y="60" width="160" height="80" rx="12" fill="var(--primary)" opacity="0.15" />
              <rect x="220" y="60" width="160" height="80" rx="12" fill="none" stroke="var(--primary)" strokeWidth="2" />
              <text x="300" y="95" textAnchor="middle" fill="var(--primary)" fontWeight="700" fontSize="16">
                {datosBalanza.bandera} {datosBalanza.pais}
              </text>
              <text x="300" y="118" textAnchor="middle" fill="var(--text-secondary)" fontSize="12">
                Economía abierta
              </text>

              {/* Flecha exportaciones (saliente, azul) */}
              <defs>
                <marker id="arrowBlue" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#2E86AB" />
                </marker>
                <marker id="arrowRed" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                  <polygon points="10 0, 0 3.5, 10 7" fill="#E74C3C" />
                </marker>
              </defs>
              <line x1="380" y1="85" x2="540" y2="85" stroke="#2E86AB" strokeWidth="4"
                markerEnd="url(#arrowBlue)" />
              <text x="460" y="75" textAnchor="middle" fill="#2E86AB" fontSize="12" fontWeight="600">
                Exportaciones
              </text>
              <text x="460" y="102" textAnchor="middle" fill="#2E86AB" fontSize="11">
                {datosBalanza.exportaciones.toLocaleString('es-ES')}M€
              </text>

              {/* Flecha importaciones (entrante, roja) */}
              <line x1="540" y1="125" x2="380" y2="125" stroke="#E74C3C" strokeWidth="4"
                markerEnd="url(#arrowRed)" />
              <text x="460" y="148" textAnchor="middle" fill="#E74C3C" fontSize="12" fontWeight="600">
                Importaciones
              </text>
              <text x="460" y="165" textAnchor="middle" fill="#E74C3C" fontSize="11">
                {datosBalanza.importaciones.toLocaleString('es-ES')}M€
              </text>

              {/* Mundo */}
              <text x="560" y="108" textAnchor="start" fill="var(--text-secondary)" fontSize="14">🌍</text>
              <text x="555" y="125" textAnchor="start" fill="var(--text-secondary)" fontSize="11">Mundo</text>
            </svg>
          </div>

          {/* Tarjetas de balanza */}
          <div className={styles.balanzaGrid}>
            <div
              className={`${styles.balanzaCard} ${datosBalanza.balanzaComercial >= 0 ? styles.balanzaPositiva : styles.balanzaNegativa}`}
            >
              <p className={styles.balanzaTipo}>Balanza Comercial</p>
              <p className={styles.balanzaDescripcion}>Bienes tangibles (coches, máquinas, alimentos)</p>
              <p className={styles.balanzaValor}>
                {datosBalanza.balanzaComercial >= 0 ? '+' : ''}
                {datosBalanza.balanzaComercial.toLocaleString('es-ES')}M€
              </p>
              <span className={styles.balanzaEstado}>
                {datosBalanza.balanzaComercial >= 0 ? '▲ Superávit' : '▼ Déficit'}
              </span>
            </div>

            <div
              className={`${styles.balanzaCard} ${datosBalanza.balanzaServicios >= 0 ? styles.balanzaPositiva : styles.balanzaNegativa}`}
            >
              <p className={styles.balanzaTipo}>Balanza de Servicios</p>
              <p className={styles.balanzaDescripcion}>Turismo, transporte, seguros, royalties</p>
              <p className={styles.balanzaValor}>
                {datosBalanza.balanzaServicios >= 0 ? '+' : ''}
                {datosBalanza.balanzaServicios.toLocaleString('es-ES')}M€
              </p>
              <span className={styles.balanzaEstado}>
                {datosBalanza.balanzaServicios >= 0 ? '▲ Superávit' : '▼ Déficit'}
              </span>
            </div>

            <div
              className={`${styles.balanzaCard} ${datosBalanza.balanzaCorriente >= 0 ? styles.balanzaPositiva : styles.balanzaNegativa}`}
            >
              <p className={styles.balanzaTipo}>Cuenta Corriente</p>
              <p className={styles.balanzaDescripcion}>Comercial + Servicios + Rentas + Transferencias</p>
              <p className={styles.balanzaValor}>
                {datosBalanza.balanzaCorriente >= 0 ? '+' : ''}
                {datosBalanza.balanzaCorriente.toLocaleString('es-ES')}M€
              </p>
              <span className={styles.balanzaEstado}>
                {datosBalanza.balanzaCorriente >= 0 ? '▲ Superávit' : '▼ Déficit'}
              </span>
            </div>
          </div>

          <div className={styles.balanzaInfo}>
            <p className={styles.balanzaExportTop}>
              <strong>Principales exportaciones:</strong> {datosBalanza.exportacionTop}
            </p>
            <p className={styles.balanzaNota}>{datosBalanza.nota}</p>
          </div>

          <div className={styles.warningBox}>
            <span aria-hidden="true">💡</span>
            <p>
              <strong>Mito a desmentir</strong>: Un déficit comercial en bienes no es necesariamente
              malo. España tiene déficit en bienes pero superávit en servicios (principalmente turismo),
              resultando en una cuenta corriente positiva. Un país puede importar más bienes porque su
              economía crece y consume más, o porque su sector servicios es muy competitivo.
            </p>
          </div>
        </section>
      )}

      {/* ── SECCIÓN 3: TIPOS DE CAMBIO ── */}
      {seccionActiva === 'cambio' && (
        <section className={styles.section} aria-labelledby="titulo-cambio">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">💱</span>
            <div>
              <h2 className={styles.sectionTitle} id="titulo-cambio">
                Tipos de Cambio y el Comercio Exterior
              </h2>
              <p className={styles.sectionSubtitle}>
                Simula cómo una apreciación o depreciación del euro afecta a las exportaciones e
                importaciones.
              </p>
            </div>
          </div>

          <div className={styles.cambioControles}>
            {/* Selector de par de divisas */}
            <div className={styles.cambioGrupo}>
              <label className={styles.sliderLabel} htmlFor="par-divisas">
                Par de divisas
              </label>
              <div className={styles.divButtons}>
                {(['EUR/USD', 'EUR/GBP', 'EUR/JPY', 'EUR/CNY'] as const).map((par) => (
                  <button
                    key={par}
                    onClick={() => setParDivisas(par)}
                    className={`${styles.btnPaisSmall} ${parDivisas === par ? styles.btnPaisActivo : ''}`}
                    aria-pressed={parDivisas === par}
                  >
                    {par}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider de variación */}
            <div className={styles.cambioGrupo}>
              <label className={styles.sliderLabel} htmlFor="variacion-cambio">
                Variación del euro:{' '}
                <strong
                  className={
                    variacionCambio > 0 ? styles.textoPositivo : variacionCambio < 0 ? styles.textoNegativo : ''
                  }
                >
                  {variacionCambio > 0 ? '+' : ''}{variacionCambio}%
                </strong>{' '}
                {apreciacion ? '(apreciación)' : depreciacion ? '(depreciación)' : '(neutro)'}
              </label>
              <input
                id="variacion-cambio"
                type="range"
                min={-30}
                max={30}
                value={variacionCambio}
                onChange={(e) => setVariacionCambio(Number(e.target.value))}
                className={styles.slider}
                aria-label="Variación del tipo de cambio"
              />
              <div className={styles.sliderValores}><span>−30% (depreciación)</span><span>+30% (apreciación)</span></div>
            </div>
          </div>

          {/* Panel de resultados */}
          <div className={styles.cambioResultados}>
            <div className={styles.cambioTipoCambio}>
              <p className={styles.cambioTipoLabel}>Tipo de cambio actual</p>
              <p className={styles.cambioTipoValor}>
                1 € = {tipoActual.toFixed(parDivisas === 'EUR/JPY' ? 1 : 4)} {parDivisas.split('/')[1]}
              </p>
              <p className={styles.cambioTipoBase}>
                Valor base: {tipoBase} | 100€ = {euro100EnDivisa} {parDivisas.split('/')[1]}
              </p>
            </div>

            <div className={styles.cambioEfectos}>
              <div className={`${styles.cambioEfecto} ${apreciacion ? styles.efectoNegativo : depreciacion ? styles.efectoPositivo : styles.efectoNeutro}`}>
                <p className={styles.cambioEfectoTitulo}>
                  {apreciacion ? '📉' : depreciacion ? '📈' : '➡️'} Exportaciones españolas
                </p>
                <p className={styles.cambioEfectoDesc}>
                  {apreciacion
                    ? 'Más caras para los compradores extranjeros → pierden competitividad'
                    : depreciacion
                    ? 'Más baratas para el exterior → ganan competitividad'
                    : 'Sin cambio en competitividad exterior'}
                </p>
              </div>
              <div className={`${styles.cambioEfecto} ${apreciacion ? styles.efectoPositivo : depreciacion ? styles.efectoNegativo : styles.efectoNeutro}`}>
                <p className={styles.cambioEfectoTitulo}>
                  {apreciacion ? '📈' : depreciacion ? '📉' : '➡️'} Importaciones a España
                </p>
                <p className={styles.cambioEfectoDesc}>
                  {apreciacion
                    ? 'Más baratas para los consumidores españoles → aumenta el poder de compra exterior'
                    : depreciacion
                    ? 'Más caras en euros → inflación importada, encarece materias primas'
                    : 'Sin cambio en precio de importaciones'}
                </p>
              </div>
            </div>
          </div>

          {/* Ejemplo concreto Airbus */}
          <div className={styles.ejemploCambio}>
            <h3 className={styles.ejemploTitulo}>Ejemplo concreto: venta de un Airbus</h3>
            <p className={styles.ejemploDesc}>
              Un Airbus cuesta <strong>100 M€</strong>. A {parDivisas} {tipoBase.toFixed(4)} (base),
              equivale a <strong>{precioAirbusBase} M{parDivisas.split('/')[1]}</strong>.
            </p>
            {variacionCambio !== 0 && (
              <p className={styles.ejemploDescDestacado}>
                Con el euro al{' '}
                {apreciacion ? `+${diferenciaPct}%` : `${diferenciaPct}%`}, el mismo Airbus cuesta{' '}
                <strong>{precioAirbusActual} M{parDivisas.split('/')[1]}</strong> para el comprador
                extranjero. Es un <strong>{Math.abs(variacionCambio)}% {apreciacion ? 'más caro' : 'más barato'}</strong>.
              </p>
            )}
          </div>

          {/* Mapa mental de efectos */}
          <div className={styles.mapaMental}>
            <h3 className={styles.mapaTitulo}>Cadena de efectos de una depreciación</h3>
            <div className={styles.mapaFlujo}>
              {[
                'Depreciación del euro',
                'Exportaciones más competitivas',
                'Mayor demanda exterior',
                'Aumento de la producción',
                'Pero… importaciones más caras',
                'Inflación importada',
              ].map((paso, i) => (
                <div key={i} className={styles.mapaPaso}>
                  <div className={styles.mapaBurbuja}>{paso}</div>
                  {i < 5 && <div className={styles.mapaFlecha} aria-hidden="true">→</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SECCIÓN 4: ARANCELES ── */}
      {seccionActiva === 'aranceles' && (
        <section className={styles.section} aria-labelledby="titulo-aranceles">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">🛡️</span>
            <div>
              <h2 className={styles.sectionTitle} id="titulo-aranceles">
                Aranceles y Proteccionismo
              </h2>
              <p className={styles.sectionSubtitle}>
                Simula el efecto de un arancel en el precio final y descubre los distintos tipos de
                barreras comerciales.
              </p>
            </div>
          </div>

          {/* Simulador de arancel */}
          <div className={styles.simuladorArancel}>
            <h3 className={styles.simuladorTitulo}>Simulador de arancel — Panel solar chino</h3>

            <div className={styles.simuladorControles}>
              <div className={styles.sliderGrupo}>
                <label className={styles.sliderLabel} htmlFor="precio-cif">
                  Precio CIF de importación: <strong>{precioImportacion} €</strong>
                </label>
                <input
                  id="precio-cif"
                  type="range"
                  min={10}
                  max={1000}
                  step={10}
                  value={precioImportacion}
                  onChange={(e) => setPrecioImportacion(Number(e.target.value))}
                  className={styles.slider}
                  aria-label="Precio CIF de importación"
                />
                <div className={styles.sliderValores}><span>10 €</span><span>1.000 €</span></div>
              </div>

              <div className={styles.sliderGrupo}>
                <label className={styles.sliderLabel} htmlFor="pct-arancel">
                  Arancel: <strong>{porcentajeArancel}%</strong>
                </label>
                <input
                  id="pct-arancel"
                  type="range"
                  min={0}
                  max={100}
                  value={porcentajeArancel}
                  onChange={(e) => setPorcentajeArancel(Number(e.target.value))}
                  className={styles.slider}
                  aria-label="Porcentaje de arancel"
                />
                <div className={styles.sliderValores}><span>0%</span><span>100%</span></div>
              </div>
            </div>

            {/* Barra de aranceles */}
            <div className={styles.barraAranceles} role="img" aria-label="Desglose del precio final">
              <div
                className={styles.barraBase}
                style={{ width: `${(precioImportacion / precioFinal) * 100}%` }}
                title={`Precio base: ${precioImportacion} €`}
              >
                {precioImportacion} €
              </div>
              {arancelEuros > 0 && (
                <div
                  className={styles.barraArancel}
                  style={{ width: `${(arancelEuros / precioFinal) * 100}%` }}
                  title={`Arancel: ${arancelEuros.toFixed(2)} €`}
                >
                  +{arancelEuros.toFixed(0)} €
                </div>
              )}
            </div>

            <div className={styles.arancelResultados}>
              <div className={styles.arancelResultado}>
                <p className={styles.arancelResultadoLabel}>Precio base</p>
                <p className={styles.arancelResultadoValor}>{precioImportacion.toLocaleString('es-ES')} €</p>
              </div>
              <div className={styles.arancelResultado}>
                <p className={styles.arancelResultadoLabel}>Arancel recaudado</p>
                <p className={`${styles.arancelResultadoValor} ${styles.textoNegativo}`}>
                  +{arancelEuros.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </p>
              </div>
              <div className={`${styles.arancelResultado} ${styles.arancelResultadoTotal}`}>
                <p className={styles.arancelResultadoLabel}>Precio final al consumidor</p>
                <p className={styles.arancelResultadoValor}>
                  {precioFinal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </p>
              </div>
              <div className={styles.arancelResultado}>
                <p className={styles.arancelResultadoLabel}>Encarecimiento</p>
                <p className={`${styles.arancelResultadoValor} ${styles.textoNegativo}`}>
                  {porcentajeEncarecimiento}%
                </p>
              </div>
            </div>
          </div>

          {/* Tipos de barreras comerciales */}
          <h3 className={styles.barrerasTitulo}>Tipos de barreras comerciales</h3>
          <div className={styles.barrerasGrid}>
            {BARRERAS_COMERCIALES.map((b) => (
              <button
                key={b.id}
                className={`${styles.barreraCard} ${barreraSeleccionada === b.id ? styles.barreraCardActiva : ''}`}
                onClick={() => setBarreraSeleccionada(barreraSeleccionada === b.id ? null : b.id)}
                style={{ '--barrera-color': b.color } as React.CSSProperties}
                aria-expanded={barreraSeleccionada === b.id}
              >
                <span className={styles.barreraIcono} aria-hidden="true">{b.icono}</span>
                <p className={styles.barreraNombre}>{b.nombre}</p>
                {barreraSeleccionada === b.id && (
                  <div className={styles.barreraDetalle}>
                    <p className={styles.barreraDesc}>{b.descripcion}</p>
                    <p className={styles.barreraEjemplo}>
                      <strong>Ejemplo real:</strong> {b.ejemplo}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Timeline guerra comercial */}
          <div className={styles.timeline}>
            <h3 className={styles.timelineTitulo}>
              Guerra Comercial EEUU–China (2018–2025)
            </h3>
            <div className={styles.timelineLinea}>
              {HITOS_GUERRA_COMERCIAL.map((h, i) => (
                <div key={i} className={styles.timelineHito}>
                  <div className={styles.timelineFecha}>{h.fecha}</div>
                  <div className={styles.timelinePunto} aria-hidden="true" />
                  <div className={styles.timelineContenido}>
                    <p className={styles.timelineTituloHito}>{h.titulo}</p>
                    <p className={styles.timelineDesc}>{h.descripcion}</p>
                    <p className={styles.timelineImpacto}>
                      <strong>Impacto:</strong> {h.impacto}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SECCIÓN EDUCATIVA ── */}
      <section className={styles.sectionAlt}>
        <EducationalSection
          title="El Comercio Internacional en Profundidad"
          subtitle="Fundamentos, historia y debate sobre el libre comercio y el proteccionismo"
          icon="🌐"
        >
          <div className={styles.educativoGrid}>
            <div className={styles.educativoCard}>
              <h3 className={styles.educativoTitulo}>¿Por qué existe el comercio?</h3>
              <p className={styles.educativoTexto}>
                El comercio surge de las diferencias entre países: en recursos naturales (petróleo,
                minerales), en clima (cultivos tropicales vs. templados), en capital físico y humano,
                y en tecnología. La teoría de <strong>Heckscher-Ohlin</strong> amplía a Ricardo: los
                países exportan los bienes que usan intensivamente el factor del que abundan. EEUU
                exporta bienes intensivos en capital; Bangladesh, intensivos en trabajo.
              </p>
            </div>

            <div className={styles.educativoCard}>
              <h3 className={styles.educativoTitulo}>De Adam Smith a David Ricardo</h3>
              <p className={styles.educativoTexto}>
                Smith (1776) argumentó que el comercio libre permite a cada nación especializarse
                donde tiene <em>ventaja absoluta</em> (produce más con los mismos recursos). Ricardo
                (1817) fue más lejos: incluso si un país es peor en todo, ambos se benefician
                especializándose en lo que hacen <em>relativamente mejor</em>. Esta idea es la base
                del libre comercio moderno y de organizaciones como la OMC.
              </p>
            </div>

            <div className={styles.educativoCard}>
              <h3 className={styles.educativoTitulo}>La OMC: árbitro del comercio mundial</h3>
              <p className={styles.educativoTexto}>
                La <strong>Organización Mundial del Comercio</strong> (1995, heredera del GATT de
                1947) fija las reglas del comercio entre 166 países. Sus principios: no
                discriminación (trato de nación más favorecida), reciprocidad y transparencia. Gestiona
                disputas comerciales (ej. UE vs. EEUU por Airbus/Boeing). En crisis desde 2017 por el
                bloqueo de EEUU al Órgano de Apelación y el auge del bilateralismo.
              </p>
            </div>

            <div className={styles.educativoCard}>
              <h3 className={styles.educativoTitulo}>Cadenas de Valor Globales (GVC)</h3>
              <p className={styles.educativoTexto}>
                Un iPhone tiene componentes de más de 40 países: pantalla de Samsung (Corea),
                procesador diseñado en EEUU y fabricado en TSMC (Taiwán), cámara de Sony (Japón),
                ensamblado en Foxconn (China). Esta fragmentación de la producción significa que los
                aranceles gravan bienes intermedios y elevan costes para todos. El &quot;Made in China&quot;
                esconde valor añadido de decenas de países.
              </p>
            </div>

            <div className={styles.educativoCard}>
              <h3 className={styles.educativoTitulo}>Desglobalización y nearshoring</h3>
              <p className={styles.educativoTexto}>
                La pandemia de COVID-19 (2020) y la guerra de Ucrania (2022) revelaron la
                vulnerabilidad de las cadenas de suministro largas. La tendencia actual es el
                <strong> nearshoring</strong> (acercar la producción a mercados consumidores) y el
                <strong> friend-shoring</strong> (concentrar producción en países aliados). México y
                Europa del Este son grandes beneficiarios. El comercio no desaparece, pero se
                reorganiza geográficamente.
              </p>
            </div>

            <div className={styles.educativoCard}>
              <h3 className={styles.educativoTitulo}>España en el comercio mundial</h3>
              <p className={styles.educativoTexto}>
                España es la 15.ª economía exportadora del mundo. Sus sectores estrella:{' '}
                <strong>automoción</strong> (VW, Stellantis, Ford; 14% de las exportaciones
                industriales), <strong>turismo</strong> (mayor exportador de servicios; 85M turistas
                en 2023), <strong>agroalimentario</strong> (aceite de oliva, vino, frutas; 65.000M€
                anuales). El reto: diversificar hacia tecnología y servicios digitales de mayor valor
                añadido.
              </p>
            </div>
          </div>
        </EducationalSection>
      </section>

      <RelatedApps apps={getRelatedApps('visualizador-comercio-internacional')} />
      <ShareCard appName="visualizador-comercio-internacional" />
      <Footer appName="visualizador-comercio-internacional" />
    </div>
  );
}
