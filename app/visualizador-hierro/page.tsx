'use client';

import { useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import styles from './VisualizadorHierro.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

ChartJS.register(ArcElement, Tooltip, Legend);

// ─────────────────────────────────────────────
// Tipos y datos
// ─────────────────────────────────────────────

interface SectorHierro {
  nombre: string;
  porcentaje: number;
  descripcion: string;
  color: string;
}

const SECTORES_HIERRO: SectorHierro[] = [
  {
    nombre: 'Hemoglobina (glóbulos rojos)',
    porcentaje: 65,
    descripcion:
      'La mayor parte del hierro del organismo se encuentra en la hemoglobina, la proteína de los glóbulos rojos encargada de transportar el oxígeno desde los pulmones hasta todos los tejidos. Cada molécula de hemoglobina contiene 4 átomos de hierro, cada uno capaz de unir una molécula de O₂.',
    color: '#C0392B',
  },
  {
    nombre: 'Ferritina / Hemosiderina (almacén)',
    porcentaje: 25,
    descripcion:
      'Las reservas de hierro se almacenan principalmente en el hígado, el bazo y la médula ósea en forma de ferritina (proteína esférica que puede alojar hasta 4.500 átomos de hierro) y hemosiderina (forma más condensada, menos movilizable). La ferritina sérica es el mejor indicador analítico de las reservas totales de hierro.',
    color: '#E67E22',
  },
  {
    nombre: 'Mioglobina (músculo)',
    porcentaje: 4,
    descripcion:
      'La mioglobina es la hemoglobina del músculo: almacena oxígeno directamente en las fibras musculares, permitiendo que los músculos continúen trabajando durante esfuerzos intensos cuando el aporte de oxígeno a través de la sangre es insuficiente. Es la responsable del color rojizo de la carne.',
    color: '#8E44AD',
  },
  {
    nombre: 'Enzimas y citocromos',
    porcentaje: 3,
    descripcion:
      'El hierro es cofactor imprescindible de numerosas enzimas: la cadena de transporte de electrones mitocondrial (citocromos b, c, a), la catalasa, la peroxidasa y las ribonucleótido reductasas necesarias para la síntesis de ADN. Sin hierro, estas reacciones esenciales se detienen.',
    color: '#2980B9',
  },
  {
    nombre: 'Transferrina (transporte en sangre)',
    porcentaje: 2,
    descripcion:
      'La transferrina es la proteína transportadora del hierro en el plasma sanguíneo. Capta el hierro absorbido en el intestino o liberado del almacén y lo lleva hasta los órganos que lo necesitan. La capacidad total de fijación del hierro (TIBC) refleja la cantidad disponible de transferrina.',
    color: '#27AE60',
  },
  {
    nombre: 'Hierro libre (muy tóxico)',
    porcentaje: 1,
    descripcion:
      'El hierro libre (no unido a proteína) es extremadamente tóxico: cataliza la reacción de Fenton, generando radicales hidroxilo (•OH) que dañan el ADN, las membranas celulares y las proteínas. El organismo mantiene el hierro libre en niveles casi indetectables mediante un sistema de proteínas de unión.',
    color: '#E74C3C',
  },
];

interface EscenarioHepcidina {
  id: string;
  titulo: string;
  nivelHepcidina: 'alta' | 'baja' | 'alta-paradoja';
  descripcion: string;
  consecuencia: string;
  icono: string;
}

const ESCENARIOS_HEPCIDINA: EscenarioHepcidina[] = [
  {
    id: 'reservas-llenas',
    titulo: 'Reservas llenas',
    nivelHepcidina: 'alta',
    descripcion:
      'Cuando el hígado detecta que las reservas de hierro son suficientes, secreta hepcidina al torrente sanguíneo. La hepcidina se une a la ferroportina (el único exportador conocido de hierro de las células) y provoca su degradación. Sin ferroportina, el enterocito no puede volcar el hierro absorbido hacia la sangre.',
    consecuencia: 'Absorción intestinal bloqueada. Hierro acumulado en enterocitos y macrófagos.',
    icono: '🔒',
  },
  {
    id: 'reservas-vacias',
    titulo: 'Reservas vacías (déficit)',
    nivelHepcidina: 'baja',
    descripcion:
      'Con las reservas bajas, el hígado reduce drásticamente la producción de hepcidina. La ferroportina permanece activa en la membrana del enterocito y de los macrófagos. El hierro absorbido en el intestino pasa libremente al torrente sanguíneo para reponer las reservas.',
    consecuencia: 'Absorción intestinal aumentada. Movilización del hierro almacenado.',
    icono: '🔓',
  },
  {
    id: 'inflamacion',
    titulo: 'Inflamación crónica',
    nivelHepcidina: 'alta-paradoja',
    descripcion:
      'Las citocinas inflamatorias (IL-6, IL-1) estimulan la producción hepática de hepcidina independientemente del nivel de hierro. El resultado es una paradoja: el paciente tiene déficit funcional de hierro (el hierro queda secuestrado en macrófagos) pero la hepcidina sigue alta, bloqueando la absorción y la movilización.',
    consecuencia:
      'Anemia de proceso crónico (antes "anemia de enfermedad crónica"). No responde a suplementos de hierro oral. Frecuente en enfermedades inflamatorias, infecciones crónicas, insuficiencia renal.',
    icono: '🔥',
  },
];

interface EstadoClinico {
  id: string;
  etiqueta: string;
  descripcion: string;
  ferritina: string;
  hemoglobina: string;
  sintomas: string[];
  posicion: number; // 0-100 en el espectro
  color: string;
}

const ESTADOS_CLINICOS: EstadoClinico[] = [
  {
    id: 'hemocromatosis',
    etiqueta: 'Hemocromatosis',
    descripcion: 'Sobrecarga de hierro, mayoritariamente genética (mutación HFE). El exceso de hierro se deposita en hígado, corazón y páncreas.',
    ferritina: '> 1.000 ng/mL',
    hemoglobina: 'Normal o alta',
    sintomas: ['Cirrosis hepática', 'Insuficiencia cardíaca', 'Diabetes por depósito en páncreas', 'Artropatía', 'Bronceado cutáneo'],
    posicion: 95,
    color: '#8B0000',
  },
  {
    id: 'normal',
    etiqueta: 'Normal',
    descripcion: 'Reservas adecuadas. El organismo regula la absorción mediante hepcidina para mantener el equilibrio.',
    ferritina: '20-200 ng/mL',
    hemoglobina: '≥ 13 g/dL (hombre) / ≥ 12 g/dL (mujer)',
    sintomas: ['Sin síntomas de déficit ni sobrecarga'],
    posicion: 50,
    color: '#27AE60',
  },
  {
    id: 'deplecion',
    etiqueta: 'Depleción de reservas',
    descripcion: 'Las reservas comienzan a agotarse pero la hemoglobina aún es normal. Esta fase pasa desapercibida en analíticas básicas que no incluyen ferritina.',
    ferritina: '< 15 ng/mL',
    hemoglobina: 'Normal (12-13 g/dL)',
    sintomas: ['Fatiga desproporcionada', 'Caída de cabello', 'Uñas quebradizas', 'Reducción del rendimiento cognitivo', 'Síndrome de piernas inquietas'],
    posicion: 20,
    color: '#E67E22',
  },
  {
    id: 'anemia',
    etiqueta: 'Anemia ferropénica',
    descripcion: 'La falta de hierro impide fabricar hemoglobina suficiente. Los glóbulos rojos son pequeños (microcíticos) y pálidos (hipocrómicos). Afecta a 2.000 millones de personas en el mundo.',
    ferritina: '< 12 ng/mL',
    hemoglobina: '< 12 g/dL (mujer) / < 13 g/dL (hombre)',
    sintomas: ['Palidez', 'Disnea con esfuerzo mínimo', 'Taquicardia', 'Pica (apetencia por tierra o hielo)', 'Glositis (lengua inflamada)', 'Rendimiento escolar/laboral reducido'],
    posicion: 5,
    color: '#C0392B',
  },
];

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function DonutDistribucion() {
  const [sectorSeleccionado, setSectorSeleccionado] = useState<number | null>(null);

  const data: ChartData<'doughnut'> = {
    labels: SECTORES_HIERRO.map((s) => s.nombre),
    datasets: [
      {
        data: SECTORES_HIERRO.map((s) => s.porcentaje),
        backgroundColor: SECTORES_HIERRO.map((s) => s.color),
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 12,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`,
        },
      },
    },
    onClick: (_evt, elements) => {
      if (elements.length > 0) {
        const idx = elements[0].index;
        setSectorSeleccionado(idx === sectorSeleccionado ? null : idx);
      }
    },
    cutout: '60%',
  } as ChartOptions<'doughnut'>;

  const sectorInfo = sectorSeleccionado !== null ? SECTORES_HIERRO[sectorSeleccionado] : null;

  return (
    <div className={styles.distributionSection}>
      <div className={styles.donutWrapper}>
        <Doughnut data={data} options={options} aria-label="Distribución del hierro en el cuerpo" />
        <div className={styles.donutCenter}>
          <span className={styles.donutCenterIcon} aria-hidden="true">🩸</span>
          <span className={styles.donutCenterText}>Hierro total</span>
        </div>
      </div>

      <div className={styles.donutLeyenda}>
        {SECTORES_HIERRO.map((sector, i) => (
          <button
            key={sector.nombre}
            className={`${styles.leyendaItem} ${sectorSeleccionado === i ? styles.leyendaItemActivo : ''}`}
            onClick={() => setSectorSeleccionado(i === sectorSeleccionado ? null : i)}
            aria-pressed={sectorSeleccionado === i}
            style={{ '--sector-color': sector.color } as React.CSSProperties}
          >
            <span
              className={styles.leyendaColor}
              style={{ backgroundColor: sector.color }}
              aria-hidden="true"
            />
            <span className={styles.leyendaNombre}>{sector.nombre}</span>
            <span className={styles.leyendaPorcentaje}>{sector.porcentaje}%</span>
          </button>
        ))}
      </div>

      {sectorInfo && (
        <div className={styles.sectorInfoBox} role="region" aria-label={`Información sobre ${sectorInfo.nombre}`}>
          <h3 className={styles.sectorInfoTitulo} style={{ color: sectorInfo.color }}>
            {sectorInfo.nombre} — {sectorInfo.porcentaje}%
          </h3>
          <p className={styles.sectorInfoDescripcion}>{sectorInfo.descripcion}</p>
        </div>
      )}

      {!sectorInfo && (
        <p className={styles.donutHint} aria-live="polite">
          Haz clic en un sector del gráfico o en una etiqueta para ver el detalle
        </p>
      )}
    </div>
  );
}

function AbsorcionComparativa({ vitaminaCmg }: { vitaminaCmg: number }) {
  // Cálculo de absorción no hemo con vitamina C
  // Base 5%, máximo 15% con 500mg vitamina C
  const absorcionNoHemoBase = 5;
  const absorcionNoHemoConVitC = Math.round(
    absorcionNoHemoBase + (vitaminaCmg / 500) * 10
  );
  const absorcionHemo = 25; // 15-35%, tomamos 25% representativo

  return (
    <div className={styles.absorptionComparison}>
      {/* Hemo */}
      <div className={`${styles.absorptionSide} ${styles.absorptionHemo}`}>
        <div className={styles.absorptionHeader}>
          <span className={styles.absorptionIcon} aria-hidden="true">🥩</span>
          <h3 className={styles.absorptionTitulo}>Hierro hemo</h3>
        </div>
        <p className={styles.absorptionSubtitulo}>Carnes rojas, pescado, aves</p>

        <div className={styles.absorptionDataGrid}>
          <div className={styles.absorptionDato}>
            <span className={styles.absorptionLabel}>Forma química</span>
            <span className={styles.absorptionValor}>Fe²⁺ (ferroso)</span>
          </div>
          <div className={styles.absorptionDato}>
            <span className={styles.absorptionLabel}>Absorción</span>
            <span className={styles.absorptionValorDestacado}>15-35%</span>
          </div>
          <div className={styles.absorptionDato}>
            <span className={styles.absorptionLabel}>Mecanismo</span>
            <span className={styles.absorptionValor}>Absorbido como complejo porfirina intacto</span>
          </div>
          <div className={styles.absorptionDato}>
            <span className={styles.absorptionLabel}>Afectan otros alimentos</span>
            <span className={styles.absorptionValorBueno}>No — absorción estable</span>
          </div>
        </div>

        <div className={styles.barraAbsorcion}>
          <div
            className={`${styles.barraRelleno} ${styles.barraHemo}`}
            style={{ width: `${absorcionHemo}%` }}
            role="meter"
            aria-valuenow={absorcionHemo}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Absorción hierro hemo: ${absorcionHemo}%`}
          />
          <span className={styles.barraEtiqueta}>{absorcionHemo}% absorbido</span>
        </div>
      </div>

      {/* No hemo */}
      <div className={`${styles.absorptionSide} ${styles.absorptionNoHemo}`}>
        <div className={styles.absorptionHeader}>
          <span className={styles.absorptionIcon} aria-hidden="true">🌿</span>
          <h3 className={styles.absorptionTitulo}>Hierro no hemo</h3>
        </div>
        <p className={styles.absorptionSubtitulo}>Legumbres, espinacas, frutos secos, cereales</p>

        <div className={styles.absorptionDataGrid}>
          <div className={styles.absorptionDato}>
            <span className={styles.absorptionLabel}>Forma química</span>
            <span className={styles.absorptionValor}>Fe³⁺ (férrico) → necesita reducirse a Fe²⁺</span>
          </div>
          <div className={styles.absorptionDato}>
            <span className={styles.absorptionLabel}>Absorción</span>
            <span className={styles.absorptionValorDestacado}>{absorcionNoHemoConVitC}%</span>
            <span className={styles.absorptionValorMini}>con {vitaminaCmg} mg vitamina C</span>
          </div>
          <div className={styles.absorptionDato}>
            <span className={styles.absorptionLabel}>Potenciadores</span>
            <span className={styles.absorptionValorBueno}>Vitamina C, fermentación, remojo</span>
          </div>
          <div className={styles.absorptionDato}>
            <span className={styles.absorptionLabel}>Inhibidores</span>
            <span className={styles.absorptionValorMalo}>Fitatos, oxalatos, taninos (té/café), calcio</span>
          </div>
        </div>

        <div className={styles.barraAbsorcion}>
          <div
            className={`${styles.barraRelleno} ${styles.barraNoHemo}`}
            style={{ width: `${absorcionNoHemoConVitC}%` }}
            role="meter"
            aria-valuenow={absorcionNoHemoConVitC}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Absorción hierro no hemo: ${absorcionNoHemoConVitC}%`}
          />
          <span className={styles.barraEtiqueta}>{absorcionNoHemoConVitC}% absorbido</span>
        </div>
      </div>
    </div>
  );
}

function SliderVitaminaC({ valor, onChange }: { valor: number; onChange: (v: number) => void }) {
  return (
    <div className={styles.vitaminCSlider}>
      <label className={styles.sliderLabel} htmlFor="vitamina-c-slider">
        Vitamina C junto a la comida: <strong>{valor} mg</strong>
        <span className={styles.sliderReferencia}>
          {valor === 0 ? '(sin vitamina C)' : valor < 100 ? '(poca)' : valor < 300 ? '(moderada — 1 naranja ≈ 60 mg)' : '(alta — suplemento)'}
        </span>
      </label>
      <input
        id="vitamina-c-slider"
        type="range"
        min={0}
        max={500}
        step={25}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.sliderInput}
        aria-label={`Vitamina C: ${valor} miligramos`}
      />
      <div className={styles.sliderMarks}>
        <span>0 mg</span>
        <span>250 mg</span>
        <span>500 mg</span>
      </div>
    </div>
  );
}

function DiagramaHepcidina() {
  const [escenarioActivo, setEscenarioActivo] = useState<string>('reservas-vacias');
  const escenario = ESCENARIOS_HEPCIDINA.find((e) => e.id === escenarioActivo)!;

  return (
    <div className={styles.hepcidinDiagram}>
      {/* Botones de escenario */}
      <div className={styles.escenariosBtns} role="group" aria-label="Seleccionar escenario de hepcidina">
        {ESCENARIOS_HEPCIDINA.map((esc) => (
          <button
            key={esc.id}
            className={`${styles.escenarioBtn} ${escenarioActivo === esc.id ? styles.escenarioBtnActivo : ''} ${esc.nivelHepcidina === 'alta-paradoja' ? styles.escenarioBtnParadoja : ''}`}
            onClick={() => setEscenarioActivo(esc.id)}
            aria-pressed={escenarioActivo === esc.id}
          >
            <span aria-hidden="true">{esc.icono}</span>
            {esc.titulo}
          </button>
        ))}
      </div>

      {/* Diagrama de flujo */}
      <div className={styles.hepcidinFlujo}>
        {/* Nivel de hepcidina */}
        <div className={`${styles.hepcidinIndicador} ${
          escenario.nivelHepcidina === 'alta' || escenario.nivelHepcidina === 'alta-paradoja'
            ? styles.hepcidinAlta
            : styles.hepcidinBaja
        }`}>
          <span className={styles.hepcidinLabel}>Hepcidina hepática</span>
          <span className={styles.hepcidinValor}>
            {escenario.nivelHepcidina === 'baja' ? '↓ Baja' : '↑ Alta'}
            {escenario.nivelHepcidina === 'alta-paradoja' && ' (paradoja)'}
          </span>
        </div>

        <div className={styles.hepcidinFlechaBajada} aria-hidden="true">↓</div>

        {/* Ferroportina */}
        <div className={`${styles.ferroportinaBox} ${
          escenario.nivelHepcidina === 'baja' ? styles.ferroportinaActiva : styles.ferroportinaInactiva
        }`}>
          <span className={styles.ferroportinaLabel}>Ferroportina (exportador de Fe)</span>
          <span className={styles.ferroportinaEstado}>
            {escenario.nivelHepcidina === 'baja' ? '✓ Activa — exporta hierro' : '✗ Degradada — hierro bloqueado'}
          </span>
        </div>

        {/* Descripción */}
        <div className={styles.hepcidinDescripcion}>
          <p>{escenario.descripcion}</p>
          <div className={styles.hepcidinConsecuencia}>
            <strong>Resultado:</strong> {escenario.consecuencia}
          </div>
        </div>
      </div>
    </div>
  );
}

function EspetroCli() {
  const [estadoActivo, setEstadoActivo] = useState<string>('normal');
  const estado = ESTADOS_CLINICOS.find((e) => e.id === estadoActivo)!;

  // Ordenar por posicion para la barra
  const estadosOrdenados = [...ESTADOS_CLINICOS].sort((a, b) => a.posicion - b.posicion);

  return (
    <div className={styles.clinicalSpectrum}>
      {/* Barra de espectro */}
      <div className={styles.spectrumBarWrapper} aria-label="Espectro clínico del hierro">
        <div className={styles.spectrumBar}>
          {estadosOrdenados.map((est) => (
            <button
              key={est.id}
              className={`${styles.spectrumPoint} ${estadoActivo === est.id ? styles.spectrumPointActivo : ''}`}
              style={{
                left: `${est.posicion}%`,
                '--point-color': est.color,
              } as React.CSSProperties}
              onClick={() => setEstadoActivo(est.id)}
              aria-pressed={estadoActivo === est.id}
              aria-label={est.etiqueta}
            >
              <span className={styles.spectrumPointDot} style={{ backgroundColor: est.color }} aria-hidden="true" />
              <span className={styles.spectrumPointLabel}>{est.etiqueta}</span>
            </button>
          ))}
          {/* Barra de degradado: déficit → normal → sobrecarga */}
          <div className={styles.spectrumGradient} aria-hidden="true" />
        </div>
        <div className={styles.spectrumAxisLabels} aria-hidden="true">
          <span>Déficit severo</span>
          <span>Equilibrio</span>
          <span>Sobrecarga</span>
        </div>
      </div>

      {/* Detalle del estado seleccionado */}
      <div
        className={styles.estadoDetalle}
        style={{ borderColor: estado.color }}
        role="region"
        aria-label={`Detalle: ${estado.etiqueta}`}
      >
        <h3 className={styles.estadoTitulo} style={{ color: estado.color }}>
          {estado.etiqueta}
        </h3>
        <p className={styles.estadoDescripcion}>{estado.descripcion}</p>

        <div className={styles.estadoAnalytics}>
          <div className={styles.estadoAnalitica}>
            <span className={styles.analiticaLabel}>Ferritina</span>
            <span className={styles.analiticaValor}>{estado.ferritina}</span>
          </div>
          <div className={styles.estadoAnalitica}>
            <span className={styles.analiticaLabel}>Hemoglobina</span>
            <span className={styles.analiticaValor}>{estado.hemoglobina}</span>
          </div>
        </div>

        <div className={styles.estadoSintomas}>
          <span className={styles.sintomasLabel}>Signos y síntomas:</span>
          <ul className={styles.sintomasList}>
            {estado.sintomas.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorHierro() {
  const [vitaminaCmg, setVitaminaCmg] = useState<number>(0);
  const relacionadas = getRelatedApps('visualizador-hierro');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>El Hierro</h1>
        <p>Oxígeno, hemoglobina y la anemia más frecuente del mundo</p>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="medical" severity="high" />

      {/* ── BLOQUE 1: Distribución del hierro ── */}
      <section className={styles.section} aria-labelledby="titulo-distribucion">
        <h2 id="titulo-distribucion" className={styles.sectionTitle}>
          ¿Dónde está el hierro en tu cuerpo?
        </h2>
        <p className={styles.sectionIntro}>
          Un adulto sano contiene entre 3 y 5 gramos de hierro total. Lejos de ser un elemento
          inerte, el hierro está integrado en proteínas críticas de casi todos los procesos vitales.
          Haz clic en cada sector para explorar su función.
        </p>
        <DonutDistribucion />
      </section>

      {/* ── BLOQUE 2: Hemo vs No hemo ── */}
      <section className={styles.section} aria-labelledby="titulo-absorcion">
        <h2 id="titulo-absorcion" className={styles.sectionTitle}>
          Absorción: Hemo vs No Hemo
        </h2>
        <p className={styles.sectionIntro}>
          No todo el hierro que comemos se absorbe igual. La forma química del hierro y el contexto
          de la comida determinan si el 2% o el 35% llega al torrente sanguíneo.
        </p>
        <SliderVitaminaC valor={vitaminaCmg} onChange={setVitaminaCmg} />
        <AbsorcionComparativa vitaminaCmg={vitaminaCmg} />
        <div className={styles.absorcionNota} role="note">
          <strong>Dato clave:</strong> Un vaso de zumo de naranja (≈60 mg vitamina C) junto a las
          legumbres puede triplicar la absorción de hierro no hemo. El café o el té después de comer
          pueden reducirla hasta un 60% por los taninos.
        </div>
      </section>

      {/* ── BLOQUE 3: Hepcidina ── */}
      <section className={styles.section} aria-labelledby="titulo-hepcidina">
        <h2 id="titulo-hepcidina" className={styles.sectionTitle}>
          La Hepcidina: el Regulador Maestro del Hierro
        </h2>
        <p className={styles.sectionIntro}>
          El organismo no puede excretar hierro activamente — solo puede regular cuánto absorbe.
          Este control recae sobre una pequeña hormona hepática: la hepcidina.
        </p>
        <DiagramaHepcidina />
      </section>

      {/* ── BLOQUE 4: Espectro clínico ── */}
      <section className={styles.section} aria-labelledby="titulo-espectro">
        <h2 id="titulo-espectro" className={styles.sectionTitle}>
          Espectro Clínico: Del Déficit a la Sobrecarga
        </h2>
        <p className={styles.sectionIntro}>
          El hierro tiene un margen terapéutico estrecho: tanto el déficit como el exceso son
          patológicos. Explora los 4 estados clínicos más relevantes.
        </p>
        <EspetroCli />
        <div className={styles.warningBox} role="note">
          <strong>Nota:</strong> El diagnóstico de anemia o hemocromatosis requiere análisis
          clínicos completos y valoración médica. Esta visualización es de carácter educativo.
          Si sospechas un déficit de hierro, pide a tu médico que incluya ferritina (no solo
          hemoglobina) en la analítica.
        </div>
      </section>

      {/* ── SECCIÓN EDUCATIVA ── */}
      <EducationalSection
        title="Hierro: Ciencia en Profundidad"
        subtitle="Reacción de Fenton, grupos de riesgo, analítica completa y fuentes alimentarias"
      >
        <h3>Por qué el hierro libre es tóxico: la reacción de Fenton</h3>
        <p>
          El hierro libre (Fe²⁺) reacciona con el peróxido de hidrógeno (H₂O₂) — un subproducto
          normal del metabolismo — para generar radicales hidroxilo (•OH) extremadamente reactivos.
          Esta es la <strong>reacción de Fenton</strong>: Fe²⁺ + H₂O₂ → Fe³⁺ + •OH + OH⁻. El
          radical hidroxilo daña el ADN (mutaciones), las membranas lipídicas (peroxidación) y las
          proteínas. El organismo mantiene el hierro libre en niveles casi indetectables mediante
          proteínas quelantes como la ferritina, la transferrina y la ceruloplasmina.
        </p>

        <h3>Grupos de mayor riesgo de déficit</h3>
        <ul>
          <li>
            <strong>Mujeres en edad fértil:</strong> La menstruación supone una pérdida mensual de
            15-25 mg de hierro (mayor en menorragias). Es la causa más frecuente de anemia
            ferropénica en países desarrollados.
          </li>
          <li>
            <strong>Embarazadas:</strong> La demanda aumenta un 50% en el tercer trimestre para
            cubrir el desarrollo fetal y la expansión del volumen sanguíneo materno.
          </li>
          <li>
            <strong>Deportistas de resistencia:</strong> La hemólisis mecánica (destrucción de
            glóbulos rojos por impacto repetido, especialmente en corredores) y la hepcidina
            elevada post-ejercicio reducen la disponibilidad de hierro.
          </li>
          <li>
            <strong>Vegetarianos y veganos estrictos:</strong> Solo consumen hierro no hemo, con
            absorción menor y más dependiente del contexto alimentario.
          </li>
          <li>
            <strong>Personas mayores:</strong> Menor acidez gástrica (necesaria para reducir Fe³⁺
            a Fe²⁺), menor ingesta calórica y posibles microhemorragias digestivas.
          </li>
        </ul>

        <h3>Analítica completa de hierro: qué pedir</h3>
        <ul>
          <li>
            <strong>Hemoglobina y hematocrito:</strong> Detecta anemia establecida, pero no el
            déficit previo.
          </li>
          <li>
            <strong>Ferritina sérica:</strong> El mejor marcador de reservas. Una ferritina baja
            es diagnóstica de deficit, incluso con hemoglobina normal.
          </li>
          <li>
            <strong>Sideremia (hierro sérico):</strong> Variable (varía con la hora del día,
            inflamación). Útil solo en conjunto.
          </li>
          <li>
            <strong>TIBC (capacidad total de fijación):</strong> Refleja la transferrina disponible.
            Alta en déficit, baja en sobrecarga.
          </li>
          <li>
            <strong>Saturación de transferrina:</strong> % de transferrina que lleva hierro.
            Normal: 20-50%. Baja en déficit, alta en hemocromatosis.
          </li>
          <li>
            <strong>Receptor soluble de transferrina (sTfR):</strong> Sube cuando las células
            necesitan más hierro. Útil para distinguir anemia ferropénica de anemia de proceso
            crónico.
          </li>
        </ul>

        <h3>Fuentes alimentarias de hierro</h3>
        <ul>
          <li><strong>Hígado de ternera:</strong> 8 mg/100g (hemo — alta biodisponibilidad)</li>
          <li><strong>Almejas y moluscos:</strong> 6-14 mg/100g (hemo)</li>
          <li><strong>Legumbres (lentejas, garbanzos):</strong> 6-8 mg/100g (no hemo — mejorar con vitamina C)</li>
          <li><strong>Semillas de calabaza:</strong> 8-9 mg/100g (no hemo)</li>
          <li><strong>Tofu:</strong> 5 mg/100g (no hemo)</li>
          <li><strong>Espinacas cocidas:</strong> 2,7 mg/100g (no hemo — el oxalato reduce absorción)</li>
          <li><strong>Carne roja (ternera):</strong> 2-3 mg/100g (hemo — alta biodisponibilidad)</li>
          <li><strong>Cereales integrales:</strong> 2-4 mg/100g (no hemo — los fitatos reducen absorción)</li>
        </ul>

        <div className={styles.warningBox} role="note">
          <strong>Suplementación:</strong> La suplementación de hierro sin diagnóstico de déficit
          puede ser perjudicial. El exceso de hierro libre genera estrés oxidativo. Si sospechas
          déficit, confirma primero con analítica (especialmente ferritina) antes de suplementar.
        </div>
      </EducationalSection>

      <RelatedApps apps={relacionadas} />
      <ShareCard appName="visualizador-hierro" />
      <Footer appName="visualizador-hierro" />
    </div>
  );
}
