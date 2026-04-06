'use client';

import { useState, useCallback, useMemo } from 'react';
import styles from './EstimacionCertificacionEnergetica.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  ShareCard,
  DisclaimerCard,
  LegalNotice,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';
import { jsonLd } from './metadata';

// ===== CONSTANTES =====

/** Escala de letras energeticas: limites en kWh/m2/anio de energia primaria */
const ESCALA_ENERGETICA: {
  letra: string;
  maxConsumo: number;
  color: string;
  descripcion: string;
}[] = [
  { letra: 'A', maxConsumo: 29, color: '#00873c', descripcion: 'Passivhaus, consumo casi nulo' },
  { letra: 'B', maxConsumo: 48, color: '#55a630', descripcion: 'Muy eficiente, obra nueva post-2020' },
  { letra: 'C', maxConsumo: 80, color: '#a7c957', descripcion: 'Eficiente, renovacion reciente' },
  { letra: 'D', maxConsumo: 119, color: '#f9c74f', descripcion: 'Obra nueva pre-2020' },
  { letra: 'E', maxConsumo: 172, color: '#f8961e', descripcion: 'Tipico anos 1990-2000' },
  { letra: 'F', maxConsumo: 230, color: '#f3722c', descripcion: 'Decadas 1970-1990, sin aislamiento' },
  { letra: 'G', maxConsumo: 999, color: '#e63946', descripcion: 'Anterior a 1970, sin mejoras' },
];

/** Opciones de anio de construccion */
const OPCIONES_ANIO = [
  { value: 'pre1970', label: 'Antes de 1970', base: 260 },
  { value: '1970-1979', label: '1970 - 1979', base: 220 },
  { value: '1980-1989', label: '1980 - 1989', base: 190 },
  { value: '1990-1999', label: '1990 - 1999', base: 155 },
  { value: '2000-2006', label: '2000 - 2006', base: 130 },
  { value: '2007-2013', label: '2007 - 2013 (CTE)', base: 95 },
  { value: '2014-2019', label: '2014 - 2019', base: 72 },
  { value: 'post2020', label: '2020 o posterior (nZEB)', base: 40 },
];

const OPCIONES_ZONA = [
  { value: 'norte', label: 'Norte frio (Burgos, Leon, Vitoria)', ajuste: 1.15 },
  { value: 'centro', label: 'Centro (Madrid, Zaragoza, Valladolid)', ajuste: 1.05 },
  { value: 'mediterraneo', label: 'Mediterraneo (Barcelona, Valencia)', ajuste: 0.92 },
  { value: 'sur', label: 'Sur calido (Sevilla, Cadiz, Malaga)', ajuste: 0.85 },
  { value: 'canarias', label: 'Canarias', ajuste: 0.78 },
];

type TipoAislamiento = 'ninguno' | 'parcial' | 'completo';
type TipoVentana = 'simple' | 'doble' | 'triple';
type TipoCalefaccion = 'electrico' | 'gas' | 'bomba' | 'biomasa' | 'sin';
type TipoACS = 'electrico' | 'gas' | 'bomba' | 'solar';
type TipoOrientacion = 'sur' | 'este-oeste' | 'norte';

const AJUSTE_AISLAMIENTO: Record<TipoAislamiento, number> = {
  ninguno: 1.20,
  parcial: 1.00,
  completo: 0.75,
};

const AJUSTE_VENTANA: Record<TipoVentana, number> = {
  simple: 1.15,
  doble: 1.00,
  triple: 0.82,
};

const AJUSTE_CALEFACCION: Record<TipoCalefaccion, number> = {
  electrico: 1.25,
  gas: 1.00,
  bomba: 0.65,
  biomasa: 0.70,
  sin: 0.90,
};

const AJUSTE_ACS: Record<TipoACS, number> = {
  electrico: 1.10,
  gas: 1.00,
  bomba: 0.70,
  solar: 0.60,
};

const AJUSTE_ORIENTACION: Record<TipoOrientacion, number> = {
  sur: 0.92,
  'este-oeste': 1.00,
  norte: 1.10,
};

// ===== TIPOS =====

interface Resultado {
  letra: string;
  color: string;
  consumoEstimado: number;
  co2Estimado: number;
  descripcion: string;
  mejoras: string[];
}

// ===== COMPONENTE =====

export default function EstimacionCertificacionEnergeticaPage() {
  // Estado del formulario
  const [anio, setAnio] = useState('');
  const [zona, setZona] = useState('');
  const [aislamiento, setAislamiento] = useState<TipoAislamiento | ''>('');
  const [ventana, setVentana] = useState<TipoVentana | ''>('');
  const [calefaccion, setCalefaccion] = useState<TipoCalefaccion | ''>('');
  const [acs, setAcs] = useState<TipoACS | ''>('');
  const [solarTermica, setSolarTermica] = useState(false);
  const [solarFV, setSolarFV] = useState(false);
  const [orientacion, setOrientacion] = useState<TipoOrientacion | ''>('');

  const [resultado, setResultado] = useState<Resultado | null>(null);

  /** Formulario completo */
  const formularioCompleto = useMemo(
    () => anio !== '' && zona !== '' && aislamiento !== '' && ventana !== '' && calefaccion !== '' && acs !== '' && orientacion !== '',
    [anio, zona, aislamiento, ventana, calefaccion, acs, orientacion],
  );

  /** Calcular letra estimada */
  const calcular = useCallback(() => {
    if (!formularioCompleto) return;

    // Base segun anio
    const datosAnio = OPCIONES_ANIO.find((o) => o.value === anio);
    const datosZona = OPCIONES_ZONA.find((o) => o.value === zona);
    if (!datosAnio || !datosZona) return;

    let consumo = datosAnio.base;

    // Ajustes multiplicativos
    consumo *= datosZona.ajuste;
    consumo *= AJUSTE_AISLAMIENTO[aislamiento as TipoAislamiento];
    consumo *= AJUSTE_VENTANA[ventana as TipoVentana];
    consumo *= AJUSTE_CALEFACCION[calefaccion as TipoCalefaccion];
    consumo *= AJUSTE_ACS[acs as TipoACS];
    consumo *= AJUSTE_ORIENTACION[orientacion as TipoOrientacion];

    // Renovables: reducciones aditivas
    if (solarTermica) consumo *= 0.88;
    if (solarFV) consumo *= 0.85;

    // Redondear
    consumo = Math.round(consumo);

    // Determinar letra
    const escala = ESCALA_ENERGETICA.find((e) => consumo <= e.maxConsumo) ?? ESCALA_ENERGETICA[6];

    // Estimacion CO2 (factor medio Espana: ~0,25 kg CO2 / kWh primario)
    const co2 = consumo * 0.25;

    // Mejoras sugeridas
    const mejoras: string[] = [];

    if (aislamiento !== 'completo') {
      mejoras.push(
        aislamiento === 'ninguno'
          ? 'Instalar aislamiento termico en fachada y cubierta (SATE): puede reducir el consumo un 25-40%'
          : 'Completar el aislamiento termico en fachada y cubierta: mejora estimada del 15-25%',
      );
    }

    if (ventana === 'simple') {
      mejoras.push('Sustituir ventanas por doble acristalamiento con rotura de puente termico: ahorro del 10-20%');
    } else if (ventana === 'doble') {
      mejoras.push('Mejorar a triple acristalamiento bajo emisivo: ahorro adicional del 8-15%');
    }

    if (calefaccion === 'electrico') {
      mejoras.push('Sustituir radiadores electricos por bomba de calor aerotermia: reduce el consumo de calefaccion un 50-65%');
    } else if (calefaccion === 'gas') {
      mejoras.push('Instalar bomba de calor aerotermia en lugar de caldera de gas: reduce el consumo de calefaccion un 30-40%');
    }

    if (acs === 'electrico') {
      mejoras.push('Instalar termosifon solar o bomba de calor para ACS: reduce el consumo de agua caliente un 40-60%');
    }

    if (!solarFV) {
      mejoras.push('Instalar placas fotovoltaicas para autoconsumo: reduce la factura electrica un 30-50%');
    }

    if (!solarTermica && acs !== 'solar') {
      mejoras.push('Instalar paneles solares termicos para agua caliente: cubre el 50-70% de la demanda de ACS');
    }

    setResultado({
      letra: escala.letra,
      color: escala.color,
      consumoEstimado: consumo,
      co2Estimado: Math.round(co2 * 10) / 10,
      descripcion: escala.descripcion,
      mejoras: mejoras.slice(0, 3),
    });
  }, [formularioCompleto, anio, zona, aislamiento, ventana, calefaccion, acs, orientacion, solarTermica, solarFV]);

  /** Indice de la letra del resultado en la escala */
  const indiceLetra = resultado ? ESCALA_ENERGETICA.findIndex((e) => e.letra === resultado.letra) : -1;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        {/* Hero */}
        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">🏷️</span>
          <h1 className={styles.title}>Estimacion de Certificacion Energetica</h1>
          <p className={styles.subtitle}>
            Descubre la letra energetica aproximada de tu vivienda segun sus caracteristicas
          </p>
        </header>

        <LegalNotice />

        {/* Disclaimer — nivel 3 (orientativo, sin validez legal) */}
        <DisclaimerCard variant="general" severity="medium">
          Esta herramienta ofrece una estimacion <strong>MUY APROXIMADA</strong> de la letra
          energetica de tu vivienda. El certificado energetico oficial solo puede ser emitido por
          un tecnico competente (arquitecto, ingeniero) mediante visita presencial y software
          homologado (CE3X, HULC). Esta orientacion <strong>NO tiene validez legal</strong> ni
          sustituye al certificado oficial.
        </DisclaimerCard>

        {/* Aviso normativa vigente 2026 */}
        <div className={styles.infoBox}>
          <p>
            <strong>Normativa vigente (RD 390/2021):</strong> Es <strong>obligatorio</strong> tener
            un certificado energetico en vigor para anunciar, vender o alquilar cualquier vivienda en
            Espana. Sin embargo, <strong>no existe ninguna prohibicion</strong> de alquilar viviendas
            con calificacion F o G — esto es un mito extendido. La Directiva UE 2024/1275 establece
            objetivos futuros de rehabilitacion, pero no impone restricciones por letra energetica a
            dia de hoy. Lo que si puede acarrear sanciones (desde 300 &#8364;) es <strong>no tener el
            certificado</strong> al firmar el contrato.
          </p>
        </div>

        {/* Formulario */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span aria-hidden="true">📋</span> Datos de tu vivienda
          </h2>

          <div className={styles.formGrid}>
            {/* 1. Anio de construccion */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="anio">Anio de construccion</label>
              <select
                id="anio"
                className={styles.select}
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
              >
                <option value="">Selecciona...</option>
                {OPCIONES_ANIO.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* 2. Zona climatica */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="zona">Zona climatica</label>
              <select
                id="zona"
                className={styles.select}
                value={zona}
                onChange={(e) => setZona(e.target.value)}
              >
                <option value="">Selecciona...</option>
                {OPCIONES_ZONA.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* 3. Aislamiento */}
            <div className={styles.field}>
              <span className={styles.label}>Aislamiento termico</span>
              <div className={styles.radioGroup} role="radiogroup" aria-label="Tipo de aislamiento">
                {([
                  { value: 'ninguno', label: 'Sin aislamiento' },
                  { value: 'parcial', label: 'Parcial' },
                  { value: 'completo', label: 'Aislamiento completo' },
                ] as const).map((opt) => (
                  <label key={opt.value} className={`${styles.radioOption} ${aislamiento === opt.value ? styles.radioOptionActive : ''}`}>
                    <input
                      type="radio"
                      name="aislamiento"
                      value={opt.value}
                      checked={aislamiento === opt.value}
                      onChange={() => setAislamiento(opt.value)}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioLabel}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Ventanas */}
            <div className={styles.field}>
              <span className={styles.label}>Tipo de ventanas</span>
              <div className={styles.radioGroup} role="radiogroup" aria-label="Tipo de ventanas">
                {([
                  { value: 'simple', label: 'Cristal simple' },
                  { value: 'doble', label: 'Doble acristalamiento' },
                  { value: 'triple', label: 'Triple o bajo emisivo' },
                ] as const).map((opt) => (
                  <label key={opt.value} className={`${styles.radioOption} ${ventana === opt.value ? styles.radioOptionActive : ''}`}>
                    <input
                      type="radio"
                      name="ventana"
                      value={opt.value}
                      checked={ventana === opt.value}
                      onChange={() => setVentana(opt.value)}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioLabel}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 5. Calefaccion */}
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.label}>Sistema de calefaccion</span>
              <div className={styles.radioGroup} role="radiogroup" aria-label="Sistema de calefaccion">
                {([
                  { value: 'electrico', label: 'Electrico (radiadores)' },
                  { value: 'gas', label: 'Gas natural' },
                  { value: 'bomba', label: 'Bomba de calor' },
                  { value: 'biomasa', label: 'Biomasa / pellets' },
                  { value: 'sin', label: 'Sin calefaccion' },
                ] as const).map((opt) => (
                  <label key={opt.value} className={`${styles.radioOption} ${calefaccion === opt.value ? styles.radioOptionActive : ''}`}>
                    <input
                      type="radio"
                      name="calefaccion"
                      value={opt.value}
                      checked={calefaccion === opt.value}
                      onChange={() => setCalefaccion(opt.value)}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioLabel}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 6. Agua caliente */}
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.label}>Agua caliente sanitaria (ACS)</span>
              <div className={styles.radioGroup} role="radiogroup" aria-label="Sistema de agua caliente">
                {([
                  { value: 'electrico', label: 'Electrico' },
                  { value: 'gas', label: 'Gas' },
                  { value: 'bomba', label: 'Bomba de calor' },
                  { value: 'solar', label: 'Solar termica' },
                ] as const).map((opt) => (
                  <label key={opt.value} className={`${styles.radioOption} ${acs === opt.value ? styles.radioOptionActive : ''}`}>
                    <input
                      type="radio"
                      name="acs"
                      value={opt.value}
                      checked={acs === opt.value}
                      onChange={() => setAcs(opt.value)}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioLabel}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 7. Renovables (checkboxes) */}
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.label}>Energia renovable instalada</span>
              <div className={styles.checkboxGroup}>
                <label className={`${styles.checkboxRow} ${solarTermica ? styles.checkboxRowActive : ''}`}>
                  <input
                    type="checkbox"
                    checked={solarTermica}
                    onChange={(e) => setSolarTermica(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxLabel}>Placas solares termicas</span>
                </label>
                <label className={`${styles.checkboxRow} ${solarFV ? styles.checkboxRowActive : ''}`}>
                  <input
                    type="checkbox"
                    checked={solarFV}
                    onChange={(e) => setSolarFV(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxLabel}>Placas fotovoltaicas</span>
                </label>
              </div>
            </div>

            {/* 8. Orientacion */}
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.label}>Orientacion principal de la vivienda</span>
              <div className={styles.radioGroup} role="radiogroup" aria-label="Orientacion principal">
                {([
                  { value: 'sur', label: 'Sur' },
                  { value: 'este-oeste', label: 'Este / Oeste' },
                  { value: 'norte', label: 'Norte' },
                ] as const).map((opt) => (
                  <label key={opt.value} className={`${styles.radioOption} ${orientacion === opt.value ? styles.radioOptionActive : ''}`}>
                    <input
                      type="radio"
                      name="orientacion"
                      value={opt.value}
                      checked={orientacion === opt.value}
                      onChange={() => setOrientacion(opt.value)}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioLabel}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={calcular}
            className={styles.btnPrimary}
            disabled={!formularioCompleto}
            aria-label="Estimar letra energetica"
          >
            Estimar letra energetica
          </button>
        </div>

        {/* Resultados */}
        {resultado && (
          <div className={styles.section} role="region" aria-label="Resultado de la estimacion">
            <h2 className={styles.sectionTitle}>
              <span aria-hidden="true">📊</span> Resultado estimado
            </h2>

            {/* Letra grande */}
            <div className={styles.letraDisplay}>
              <div
                className={styles.letraCircle}
                style={{ backgroundColor: resultado.color }}
                aria-label={`Letra energetica estimada: ${resultado.letra}`}
              >
                <span className={styles.letraTexto}>{resultado.letra}</span>
              </div>
              <div className={styles.letraInfo}>
                <p className={styles.letraDescripcion}>{resultado.descripcion}</p>
                <div className={styles.letraStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{formatNumber(resultado.consumoEstimado, 0)}</span>
                    <span className={styles.statLabel}>kWh/m2/anio</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{formatNumber(resultado.co2Estimado, 1)}</span>
                    <span className={styles.statLabel}>kg CO2/m2/anio</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra comparativa */}
            <div className={styles.scaleBar} aria-label="Escala de letras energeticas">
              {ESCALA_ENERGETICA.map((e, i) => (
                <div
                  key={e.letra}
                  className={`${styles.scaleItem} ${i === indiceLetra ? styles.scaleItemActive : ''}`}
                  style={{ backgroundColor: e.color }}
                  aria-label={`Letra ${e.letra}${i === indiceLetra ? ' (tu vivienda)' : ''}`}
                >
                  <span className={styles.scaleLetter}>{e.letra}</span>
                  {i < 6 && <span className={styles.scaleLimit}>&le;{e.maxConsumo}</span>}
                  {i === 6 && <span className={styles.scaleLimit}>&gt;230</span>}
                </div>
              ))}
            </div>

            {/* Mejoras sugeridas */}
            {resultado.mejoras.length > 0 && (
              <div className={styles.mejorasSection}>
                <h3 className={styles.mejorasTitle}>
                  <span aria-hidden="true">💡</span> Como mejorar tu letra energetica
                </h3>
                <div className={styles.mejorasGrid}>
                  {resultado.mejoras.map((mejora, i) => (
                    <div key={i} className={styles.mejoraCard}>
                      <span className={styles.mejoraNum}>{i + 1}</span>
                      <p className={styles.mejoraTexto}>{mejora}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Coste certificado oficial */}
            <div className={styles.infoBox}>
              <span aria-hidden="true">ℹ️</span>
              <p>
                Un certificado energetico oficial cuesta entre <strong>50 y 150 EUR</strong> segun
                el tipo de vivienda y la zona geografica. Busca un tecnico certificador en tu
                comunidad autonoma.
              </p>
            </div>
          </div>
        )}

        {/* Contenido educativo v2.0 */}
        <EducationalSection
          title="📚 Todo sobre el certificado energetico"
          subtitle="Que es, cuando lo necesitas y como mejorar la eficiencia de tu hogar"
        >
          {/* Que es */}
          <section className={styles.guideSection}>
            <h2>Que es el certificado energetico</h2>
            <p>
              El certificado de eficiencia energetica es un documento oficial que califica la
              eficiencia energetica de un inmueble mediante una escala de letras de la A (mas
              eficiente) a la G (menos eficiente). Incluye informacion sobre el consumo de
              energia primaria no renovable (kWh/m2/anio) y las emisiones de CO2 (kg CO2/m2/anio).
            </p>
            <p>
              Desde 2013, es obligatorio en Espana para vender o alquilar una vivienda (Real
              Decreto 235/2013, actualizado por RD 390/2021). Solo puede ser emitido por un
              tecnico competente (arquitecto, arquitecto tecnico, ingeniero o ingeniero tecnico)
              mediante software homologado como CE3X o HULC.
            </p>
          </section>

          {/* Cuando es obligatorio */}
          <section className={styles.guideSection}>
            <h2>Cuando es obligatorio</h2>
            <p>
              Es <strong>obligatorio</strong> en estos casos: venta de vivienda o local, alquiler
              de vivienda o local, edificios publicos de mas de 250 m2 y anuncios inmobiliarios
              (debe aparecer la letra en el anuncio). La validez del certificado es de
              <strong> 10 anios</strong>, salvo que se realicen reformas que alteren la eficiencia.
            </p>
            <p>
              La sancion por no tener el certificado puede ir de 300 a 6.000 EUR segun gravedad.
            </p>
          </section>

          {/* Tabla comparativa de letras */}
          <section className={styles.guideSection}>
            <h2>Escala de letras energeticas</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.compareTable}>
                <thead>
                  <tr>
                    <th>Letra</th>
                    <th>Consumo (kWh/m2/anio)</th>
                    <th>Tipologia habitual</th>
                    <th>Factura orientativa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><strong style={{ color: '#00873c' }}>A</strong></td><td>&lt; 29</td><td>Passivhaus, nZEB</td><td>Muy baja (&lt; 300 EUR/anio)</td></tr>
                  <tr><td><strong style={{ color: '#55a630' }}>B</strong></td><td>29 - 48</td><td>Obra nueva post-2020</td><td>Baja (300 - 500 EUR/anio)</td></tr>
                  <tr><td><strong style={{ color: '#a7c957' }}>C</strong></td><td>48 - 80</td><td>Renovacion reciente</td><td>Moderada (500 - 750 EUR/anio)</td></tr>
                  <tr><td><strong style={{ color: '#f9c74f' }}>D</strong></td><td>80 - 119</td><td>Obra nueva pre-2020</td><td>Media (750 - 1.000 EUR/anio)</td></tr>
                  <tr><td><strong style={{ color: '#f8961e' }}>E</strong></td><td>119 - 172</td><td>Vivienda anos 1990-2000</td><td>Alta (1.000 - 1.400 EUR/anio)</td></tr>
                  <tr><td><strong style={{ color: '#f3722c' }}>F</strong></td><td>172 - 230</td><td>Decadas 1970-1990</td><td>Muy alta (1.400 - 1.800 EUR/anio)</td></tr>
                  <tr><td><strong style={{ color: '#e63946' }}>G</strong></td><td>&gt; 230</td><td>Anterior a 1970</td><td>Extrema (&gt; 1.800 EUR/anio)</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Escenarios */}
          <section className={styles.guideSection}>
            <h2>Escenarios tipicos</h2>
            <div className={styles.scenariosGrid}>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">🏢</span>
                <h3>Piso antiguo en ciudad</h3>
                <p>
                  Construido en los anios 60-70, sin aislamiento, ventanas de aluminio con cristal
                  simple y caldera de gas antigua. Letra habitual: F-G. Mejorar ventanas y anadir
                  aislamiento puede subir a D-E.
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">🏠</span>
                <h3>Casa nueva (post-2020)</h3>
                <p>
                  Cumple el CTE 2019 (edificios nZEB). Aislamiento completo, doble o triple
                  acristalamiento, bomba de calor y placas solares. Letra habitual: A-B. Consumo
                  muy reducido.
                </p>
              </div>
              <div className={styles.scenarioCard}>
                <span className={styles.scenarioIcon} aria-hidden="true">🔧</span>
                <h3>Vivienda renovada</h3>
                <p>
                  Piso de los 80 con reforma integral: SATE en fachada, ventanas nuevas de PVC con
                  doble acristalamiento y aerotermia. Puede pasar de E-F a B-C con la inversion
                  adecuada.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqGrid}>
              <div className={styles.faqItem}>
                <h3>Cuanto cuesta el certificado energetico oficial?</h3>
                <p>
                  Entre 50 y 150 EUR para una vivienda estandar. Depende del tamano, tipo de
                  inmueble y la comunidad autonoma. Incluye la visita del tecnico y el registro.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3>Cuanto tarda en hacerse?</h3>
                <p>
                  La visita del tecnico dura entre 30 minutos y 1 hora. El informe se suele
                  entregar en 24-72 horas. El registro en la comunidad autonoma puede tardar unos
                  dias mas.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3>Puedo alquilar sin certificado?</h3>
                <p>
                  No. Desde 2013 es obligatorio para alquilar. La multa por no tenerlo puede ir de
                  300 EUR (leve) a 6.000 EUR (grave). El inquilino puede reclamarlo.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3>Que mejoras suben mas la letra?</h3>
                <p>
                  Las mas efectivas son: aislamiento termico de fachada (SATE), sustitucion de
                  ventanas por doble acristalamiento y cambio a bomba de calor (aerotermia). Con
                  estas tres se puede subir 2-3 letras.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3>Tiene fecha de caducidad?</h3>
                <p>
                  Si, el certificado tiene una validez de 10 anios. Si realizas reformas importantes
                  (aislamiento, cambio de caldera, etc.), conviene renovarlo para reflejar la mejora.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3>Es lo mismo el certificado que la etiqueta?</h3>
                <p>
                  La etiqueta energetica es el resumen visual (con las letras y colores) del
                  certificado. El certificado es el documento completo con los datos tecnicos,
                  recomendaciones de mejora y registro oficial.
                </p>
              </div>
            </div>
          </section>

          {/* Consejos / Tips */}
          <section className={styles.guideSection}>
            <h2>Consejos para mejorar la eficiencia energetica</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🧱</span>
                <h3>Prioriza el aislamiento</h3>
                <p>El SATE (Sistema de Aislamiento Termico Exterior) es la mejora con mayor impacto. Puede reducir el consumo un 30-40%.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🪟</span>
                <h3>Cambia las ventanas</h3>
                <p>Sustituir cristal simple por doble acristalamiento con RPT elimina puentes termicos y reduce perdidas un 15-25%.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
                <h3>Elige aerotermia</h3>
                <p>La bomba de calor consume 3-4 veces menos que un radiador electrico y es mas limpia que el gas natural.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">☀️</span>
                <h3>Instala fotovoltaica</h3>
                <p>Con 3-5 kWp de placas solares puedes cubrir el 50-70% del consumo electrico de un piso medio.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">💡</span>
                <h3>LED y electrodomesticos A</h3>
                <p>Cambiar toda la iluminacion a LED y elegir electrodomesticos clase A reduce el consumo base un 10-15%.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📋</span>
                <h3>Pide varias ofertas</h3>
                <p>Solicita al menos 3 presupuestos de certificadores. Los precios varian mucho entre profesionales y zonas.</p>
              </div>
            </div>
          </section>

          {/* Warning Box v2.0 */}
          <section className={styles.guideSection}>
            <div className={styles.warningBox}>
              <h2><span aria-hidden="true">⚠️</span> Errores comunes que encarecen tu factura energetica</h2>
              <div className={styles.warningGrid}>
                <div className={styles.warningItem}>
                  <strong>❌ No revisar el aislamiento al comprar una vivienda antigua</strong>
                  <p>Un piso sin aislamiento puede gastar 1.500-2.500 EUR/anio en calefaccion. Pide siempre el certificado antes de comprar para valorar la inversion real.</p>
                </div>
                <div className={styles.warningItem}>
                  <strong>❌ Cambiar la caldera sin mejorar la envolvente</strong>
                  <p>Instalar una bomba de calor en un edificio sin aislamiento es como poner aire acondicionado con las ventanas abiertas. Primero aisla, luego cambia el sistema.</p>
                </div>
                <div className={styles.warningItem}>
                  <strong>❌ Ignorar la ventilacion al aislar</strong>
                  <p>Un buen aislamiento sin ventilacion mecanica genera humedades y mala calidad del aire. Incluye siempre VMC (ventilacion mecanica controlada) en la reforma.</p>
                </div>
                <div className={styles.warningItem}>
                  <strong>❌ No aprovechar las subvenciones disponibles</strong>
                  <p>Los fondos Next Generation de la UE subvencionan hasta el 80% de reformas energeticas. Consulta las ayudas de tu comunidad autonoma antes de empezar.</p>
                </div>
                <div className={styles.warningItem}>
                  <strong>❌ Confiar en estimaciones online como certificado real</strong>
                  <p>Ninguna herramienta online sustituye al certificado oficial. Solo un tecnico con visita presencial y software homologado puede emitir un certificado valido.</p>
                </div>
                <div className={styles.warningItem}>
                  <strong>❌ No negociar el precio de compra segun la letra</strong>
                  <p>Una vivienda con letra F-G necesitara 15.000-30.000 EUR en reformas energeticas. Usa la mala letra como argumento de negociacion al comprar.</p>
                </div>
              </div>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('estimacion-certificacion-energetica')} />
        <ShareCard appName="estimacion-certificacion-energetica" />
        <Footer appName="estimacion-certificacion-energetica" />
      </div>
    </>
  );
}
