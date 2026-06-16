'use client';
// @disclaimer: exempt

import { useState } from 'react';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './Superconductividad.module.css';

// ── Tipos ──────────────────────────────────────────────────────────────────
interface Material {
  nombre: string;
  tc: number;
  descubridor: string;
  anio: number;
  tipo: string;
}

// ── Datos ──────────────────────────────────────────────────────────────────
const MATERIALES: Material[] = [
  { nombre: 'Mercurio (Hg)',    tc: 4.2,  descubridor: 'Kamerlingh Onnes', anio: 1911, tipo: 'Convencional' },
  { nombre: 'Plomo (Pb)',       tc: 7.2,  descubridor: 'Kamerlingh Onnes', anio: 1913, tipo: 'Convencional' },
  { nombre: 'Niobio (Nb)',      tc: 9.3,  descubridor: 'varios',           anio: 1930, tipo: 'Convencional' },
  { nombre: 'YBCO (cerámico)',  tc: 93,   descubridor: 'Wu/Chu',           anio: 1987, tipo: 'Alta Tc' },
  { nombre: 'Bi₂Sr₂Ca₂Cu₃O',  tc: 110,  descubridor: 'Maeda',            anio: 1988, tipo: 'Alta Tc' },
  { nombre: 'HgBaCaCuO',       tc: 134,  descubridor: 'Schilling',         anio: 1993, tipo: 'Alta Tc' },
  { nombre: 'H₂S (presión)',   tc: 203,  descubridor: 'Drozdov',           anio: 2015, tipo: 'Temperatura ambiente' },
  { nombre: 'LaH₁₀ (presión)', tc: 250,  descubridor: 'Drozdov',          anio: 2019, tipo: 'Temperatura ambiente' },
];

const APLICACIONES_ACTUALES = [
  {
    icono: '🏥',
    titulo: 'MRI (Resonancia Magnética)',
    descripcion:
      'Los imanes superconductores de los escáneres MRI usan Nb-Ti a 4K con helio líquido. Generan campos de 1.5–3 T. Sin superconductividad, los MRI serían imposibles.',
  },
  {
    icono: '⚛️',
    titulo: 'LHC (CERN)',
    descripcion:
      '1.232 dipolos superconductores a 1.9K, más frío que el espacio exterior. Generan 8.3 T para doblar los protones en el túnel de 27 km.',
  },
  {
    icono: '🚄',
    titulo: 'Trenes Maglev',
    descripcion:
      'El SCMaglev japonés batió el récord mundial de velocidad terrestre: 603 km/h (2015) usando superconductores de Nb-Ti refrigerados con helio.',
  },
  {
    icono: '🔬',
    titulo: 'SQUID',
    descripcion:
      'Superconducting Quantum Interference Device: el detector de campos magnéticos más sensible conocido. Detecta el campo magnético del cerebro humano.',
  },
];

const APLICACIONES_FUTURAS = [
  {
    icono: '⚡',
    titulo: 'Cables sin pérdidas',
    descripcion:
      'Las redes eléctricas actuales pierden ~6% en transmisión. Cables superconductores de alta Tc eliminarían esas pérdidas por completo.',
  },
  {
    icono: '☀️',
    titulo: 'ITER (fusión nuclear)',
    descripcion:
      'El reactor de fusión internacional usa 18 imanes superconductores de Nb₃Sn que generan 11.8 T. Sin ellos, contener el plasma a 150 millones de grados es imposible.',
  },
  {
    icono: '💻',
    titulo: 'Computación cuántica',
    descripcion:
      'Los qubits superconductores (Google, IBM, Intel) operan a ~15 mK. Son el tipo de qubit más avanzado en la actualidad.',
  },
  {
    icono: '🌡️',
    titulo: 'Temperatura ambiente',
    descripcion:
      'El Santo Grial. Si se logra a presión normal (actualmente solo funciona a megabares), transformaría completamente la civilización humana.',
  },
];

// ── Marcas del slider ──────────────────────────────────────────────────────
const MARCAS_SLIDER = [
  { k: 0,   etiqueta: '0 K\nCero abs.' },
  { k: 4.2, etiqueta: '4 K\nTc Hg' },
  { k: 77,  etiqueta: '77 K\nN₂ líq.' },
  { k: 93,  etiqueta: '93 K\nTc YBCO' },
  { k: 273, etiqueta: '273 K\n0 °C' },
  { k: 300, etiqueta: '300 K\nAmb.' },
];

// ── Componente principal ────────────────────────────────────────────────────
export default function SuperconductividadPage() {
  const [temperatura, setTemperatura] = useState(150);
  const [materialIdx, setMaterialIdx] = useState(3);

  const material = MATERIALES[materialIdx];
  const esSupercondutor = temperatura < material.tc;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Superconductividad</h1>
        <p>Resistencia cero, levitación magnética y la revolución tecnológica que viene</p>
      </header>

      <LegalNotice />

      {/* ── SECCIÓN 1: Temperatura y transición ── */}
      <section className={styles.seccion} aria-labelledby="titulo-temperatura">
        <h2 id="titulo-temperatura" className={styles.tituloSeccion}>
          Temperatura y transición de fase
        </h2>
        <p className={styles.descripcionSeccion}>
          Selecciona un material y ajusta la temperatura para ver si entra en estado superconductor.
        </p>

        {/* Selector de material */}
        <div className={styles.materialSelector} role="group" aria-label="Seleccionar material superconductor">
          {MATERIALES.map((m, i) => (
            <button
              key={m.nombre}
              type="button"
              className={`${styles.materialBtn} ${i === materialIdx ? styles.materialBtnActivo : ''}`}
              onClick={() => setMaterialIdx(i)}
              aria-pressed={i === materialIdx}
            >
              {m.nombre}
            </button>
          ))}
        </div>

        {/* Info del material seleccionado */}
        <div className={styles.materialInfo}>
          <span className={`${styles.tipoBadge} ${material.tipo === 'Convencional' ? styles.tipoConvencional : material.tipo === 'Alta Tc' ? styles.tipoAltaTc : styles.tipoAmbiente}`}>
            {material.tipo}
          </span>
          <span>
            Descubierto por <strong>{material.descubridor}</strong> en <strong>{material.anio}</strong>
          </span>
          <span className={styles.tcDestacado}>
            Tc = <strong>{material.tc} K</strong>
          </span>
        </div>

        {/* Slider de temperatura */}
        <div className={styles.sliderWrapper}>
          <label htmlFor="slider-temp" className={styles.sliderLabel}>
            Temperatura: <strong>{temperatura} K</strong>
            {temperatura < 273 && (
              <span className={styles.tempCelsius}>
                {' '}({(temperatura - 273).toFixed(0)} °C)
              </span>
            )}
          </label>
          <input
            id="slider-temp"
            type="range"
            min={0}
            max={300}
            step={1}
            value={temperatura}
            onChange={(e) => setTemperatura(Number(e.target.value))}
            className={styles.slider}
            aria-valuemin={0}
            aria-valuemax={300}
            aria-valuenow={temperatura}
            aria-label={`Temperatura: ${temperatura} Kelvin`}
          />
          {/* Marcas del slider */}
          <div className={styles.sliderMarcas} aria-hidden="true">
            {MARCAS_SLIDER.map((m) => (
              <div
                key={m.k}
                className={styles.marca}
                style={{ left: `${(m.k / 300) * 100}%` }}
              >
                <div className={styles.marcaLinea} />
                <div className={styles.marcaEtiqueta}>{m.etiqueta}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagrama de fase */}
        <div
          className={styles.diagrama}
          role="img"
          aria-label={`Diagrama de fase: el material ${material.nombre} es superconductor por debajo de ${material.tc} K`}
        >
          <div
            className={styles.zonaSuper}
            style={{ width: `${(material.tc / 300) * 100}%` }}
          >
            <span>Superconductor</span>
          </div>
          <div className={styles.zonaNormal}>
            <span>Conductor normal</span>
          </div>
          <div
            className={styles.marcadorTemp}
            style={{ left: `${(temperatura / 300) * 100}%` }}
            aria-label={`Temperatura actual: ${temperatura} K`}
          />
          <div
            className={styles.marcadorTc}
            style={{ left: `${(material.tc / 300) * 100}%` }}
            aria-label={`Temperatura crítica Tc: ${material.tc} K`}
          />
        </div>

        <div className={`${styles.estadoBadge} ${esSupercondutor ? styles.estadoSuper : styles.estadoNormal}`}
          role="status" aria-live="polite">
          {esSupercondutor
            ? `✓ T (${temperatura} K) < Tc (${material.tc} K): Estado SUPERCONDUCTOR`
            : `× T (${temperatura} K) ≥ Tc (${material.tc} K): Conductor normal`}
        </div>
      </section>

      {/* ── SECCIÓN 2: Efecto Meissner ── */}
      <section className={styles.seccion} aria-labelledby="titulo-meissner">
        <h2 id="titulo-meissner" className={styles.tituloSeccion}>
          Efecto Meissner: levitación magnética
        </h2>
        <p className={styles.descripcionSeccion}>
          En estado superconductor, el material expulsa completamente el campo magnético exterior (expulsión de flujo),
          haciendo levitar cualquier imán colocado encima.
        </p>

        <div className={styles.meissnerDemo}>
          {/* Imán */}
          <div
            className={`${styles.iman} ${esSupercondutor ? styles.imanLevita : ''}`}
            role="img"
            aria-label={esSupercondutor ? 'Imán levitando sobre superconductor' : 'Imán apoyado sobre conductor normal'}
          >
            <div className={styles.poloN}>N</div>
            <div className={styles.poloS}>S</div>
          </div>

          {/* Líneas de campo magnético — solo cuando levita */}
          {esSupercondutor && (
            <div className={styles.lineasCampo} aria-hidden="true">
              <svg viewBox="0 0 200 60" className={styles.svgCampo} aria-hidden="true">
                {[20, 40, 60, 80, 100].map((x, i) => (
                  <path
                    key={i}
                    d={`M ${x} 10 Q ${x - 30} 40 ${x} 55`}
                    fill="none"
                    stroke="#2E86AB"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    opacity={0.6 - i * 0.08}
                  />
                ))}
                {[120, 140, 160, 180].map((x, i) => (
                  <path
                    key={`r${i}`}
                    d={`M ${x} 10 Q ${x + 30} 40 ${x} 55`}
                    fill="none"
                    stroke="#2E86AB"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    opacity={0.5 - i * 0.08}
                  />
                ))}
              </svg>
            </div>
          )}

          {/* Plataforma del material */}
          <div className={`${styles.material} ${esSupercondutor ? styles.materialActivo : ''}`}>
            <span className={styles.materialNombre}>{material.nombre}</span>
            <span className={styles.tempLabel}>
              {temperatura} K &nbsp;/&nbsp; Tc = {material.tc} K
            </span>
          </div>

          <p className={styles.meissnerDesc} role="status" aria-live="polite">
            {esSupercondutor
              ? '✓ T < Tc: El material expulsa el campo magnético (Efecto Meissner). El imán levita.'
              : '× T ≥ Tc: El campo magnético penetra el material. Sin levitación.'}
          </p>
        </div>
      </section>

      {/* ── SECCIÓN 3: Pares de Cooper ── */}
      <section className={styles.seccion} aria-labelledby="titulo-cooper">
        <h2 id="titulo-cooper" className={styles.tituloSeccion}>
          Pares de Cooper: el mecanismo cuántico
        </h2>

        <div className={styles.cooperSection}>
          <p className={styles.cooperIntro}>
            En un superconductor, los electrones forman pares (pares de Cooper) a través de la interacción con la
            red cristalina: un electrón deforma levemente la red de iones positivos, creando una zona de carga
            positiva que atrae al segundo electrón.
          </p>

          {/* Animación red cristalina */}
          <div
            className={styles.redCristalina}
            role="img"
            aria-label="Animación de pares de Cooper moviéndose a través de la red cristalina"
          >
            {/* Grid de iones positivos */}
            <div className={styles.ionesGrid} aria-hidden="true">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className={styles.ion}>+</div>
              ))}
            </div>
            {/* Dos electrones formando par de Cooper */}
            <div className={styles.electron1} aria-hidden="true">e⁻</div>
            <div className={styles.electron2} aria-hidden="true">e⁻</div>
            <div className={styles.enlaceCooper} aria-hidden="true" />
            <div className={styles.cooperLabel} aria-hidden="true">Par de Cooper</div>
          </div>

          {/* Tarjetas de hechos */}
          <div className={styles.cooperFacts}>
            <div className={styles.factCard}>
              <strong>Sin resistencia</strong>
              <p>Un par de Cooper no sufre dispersión por impurezas o vibraciones: viaja sin pérdida de energía.</p>
            </div>
            <div className={styles.factCard}>
              <strong>Condensado de Bose-Einstein</strong>
              <p>Los pares tienen espín entero y forman un condensado macroscópico cuántico: todos en el mismo estado.</p>
            </div>
            <div className={styles.factCard}>
              <strong>Gap de energía</strong>
              <p>Los pares tienen una energía de enlace (gap). Las perturbaciones térmicas por encima de Tc rompen los pares.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── INSIGHT BOX ── */}
      <div className={styles.insightBox}>
        <strong>Cronología histórica:</strong> Kamerlingh Onnes descubrió la superconductividad en 1911, justo cuando
        lograba licuar el helio por primera vez. Lo llamó «conductividad persistente». La explicación microscópica
        (teoría BCS de Bardeen, Cooper y Schrieffer) llegó 46 años después, en 1957. Y en 1987, los superconductores
        de alta Tc (por encima de 77 K, el punto de ebullición del nitrógeno líquido) revolucionaron el campo — sin
        que nadie haya explicado completamente el mecanismo todavía.
      </div>

      {/* ── SECCIÓN 4: Aplicaciones ── */}
      <section className={styles.seccion} aria-labelledby="titulo-aplicaciones">
        <h2 id="titulo-aplicaciones" className={styles.tituloSeccion}>
          Aplicaciones actuales y futuras
        </h2>

        <h3 className={styles.subTitulo}>Aplicaciones actuales</h3>
        <div className={styles.aplicacionesGrid}>
          {APLICACIONES_ACTUALES.map((a) => (
            <div key={a.titulo} className={styles.aplicacionCard}>
              <div className={styles.aplicacionIcono} aria-hidden="true">{a.icono}</div>
              <div>
                <strong>{a.titulo}</strong>
                <p>{a.descripcion}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className={`${styles.subTitulo} ${styles.subTituloFuturo}`}>Aplicaciones futuras</h3>
        <div className={styles.aplicacionesGrid}>
          {APLICACIONES_FUTURAS.map((a) => (
            <div key={a.titulo} className={`${styles.aplicacionCard} ${styles.aplicacionFutura}`}>
              <div className={styles.aplicacionIcono} aria-hidden="true">{a.icono}</div>
              <div>
                <strong>{a.titulo}</strong>
                <p>{a.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECCIÓN EDUCATIVA ── */}
      <EducationalSection
        title="Historia y teoría de la superconductividad"
        subtitle="De Onnes (1911) a los superconductores de temperatura ambiente (2019)"
        defaultOpen={false}
      >
        <div className={styles.educContent}>
          <h4>1911 — El descubrimiento</h4>
          <p>
            Heike Kamerlingh Onnes, en Leiden, enfrió mercurio a 4.2 K usando helio líquido (que él mismo había
            licuado por primera vez ese año) y observó que la resistencia caía abruptamente a cero. Lo llamó
            «conductividad supramaestral». Premio Nobel en 1913.
          </p>

          <h4>1933 — Efecto Meissner</h4>
          <p>
            Walther Meissner y Robert Ochsenfeld descubrieron que los superconductores no solo tienen resistencia cero,
            sino que expulsan activamente el campo magnético del interior del material. Esta es la característica
            definitoria de la superconductividad, más fundamental que la resistencia cero.
          </p>

          <h4>1957 — Teoría BCS</h4>
          <p>
            John Bardeen, Leon Cooper y John Robert Schrieffer explicaron por primera vez la superconductividad
            convencional: los electrones cerca del nivel de Fermi forman pares correlacionados (pares de Cooper) a
            través de la interacción electrón-fonón (vibración de la red). Estos pares tienen espín entero y forman
            un condensado cuántico macroscópico. Premio Nobel en 1972.
          </p>

          <h4>1986-1987 — Alta temperatura crítica</h4>
          <p>
            Johannes Georg Bednorz y K. Alex Müller descubrieron superconductividad en cerámicas de cobre-óxido
            (cupratos) a 35 K. Un año después, el equipo de Wu y Chu logró YBCO a 93 K, superando el punto de
            ebullición del nitrógeno líquido (77 K). Esto hizo la superconductividad asequible industrialmente.
            Premio Nobel en 1987 para Bednorz y Müller.
          </p>

          <h4>2015-2019 — Superconductores a alta presión</h4>
          <p>
            Mikhail Eremets y Aleksander Drozdov lograron superconductividad en H₂S a 203 K (-70 °C) bajo una presión
            de 155 GPa. En 2019, LaH₁₀ alcanzó 250 K (-23 °C). El desafío: estas condiciones requieren millones de
            atmósferas de presión, inviables tecnológicamente.
          </p>

          <h4>El mecanismo de los cupratos — aún sin explicar</h4>
          <p>
            Después de casi 40 años, la superconductividad de alta Tc en los cupratos no tiene una teoría
            microscópica completa aceptada. La teoría BCS no explica satisfactoriamente el mecanismo. Es uno de los
            grandes problemas abiertos de la física condensada.
          </p>
        </div>

        <div className={styles.warningBox}>
          <strong>Nota:</strong> Los datos de temperatura crítica corresponden a los valores máximos publicados en
          condiciones controladas de laboratorio. Los materiales de alta presión (H₂S, LaH₁₀) requieren cientos de
          GPa y no son aplicables tecnológicamente en su estado actual. Las animaciones son modelos pedagógicos
          simplificados del comportamiento cuántico.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-superconductividad')} />
      <ShareCard appName="visualizador-superconductividad" />
      <Footer appName="visualizador-superconductividad" />
    </div>
  );
}
