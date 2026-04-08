'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './SistemasCirculatorios.module.css';
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

type Seccion = 'evolucion' | 'corazones' | 'temperatura' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'evolucion', titulo: 'Evolución', icono: '🔄', subtitulo: 'De sin sistema al doble circuito' },
  { id: 'corazones', titulo: 'Corazones', icono: '❤️', subtitulo: 'De 2 a 4 cámaras' },
  { id: 'temperatura', titulo: 'Fría vs Caliente', icono: '🌡️', subtitulo: 'Ectotermia y endotermia' },
  { id: 'datos', titulo: 'Datos', icono: '🐋', subtitulo: 'Récords del reino animal' },
];

// ─────────────────────────────────────────────
// Datos: Evolución del Sistema
// ─────────────────────────────────────────────

interface SistemaCirculatorio {
  id: string;
  titulo: string;
  ejemplos: string;
  descripcion: string;
  detalle: string;
  flujoEtapas: string[];
  colorFlujo: string;
  icono: string;
  eficiencia: string;
}

const SISTEMAS: SistemaCirculatorio[] = [
  {
    id: 'sin-sistema',
    titulo: 'Sin sistema circulatorio',
    ejemplos: 'Esponjas, cnidarios (medusas), platelmintos',
    descripcion: 'Organismos pequeños o planos donde cada célula está lo suficientemente cerca del exterior para intercambiar gases y nutrientes por difusión directa. No necesitan un sistema de transporte.',
    detalle: 'Funciona porque el grosor del organismo es de pocas células. Limitación: no pueden crecer mucho ni ser complejos.',
    flujoEtapas: ['Medio externo', 'Difusión directa', 'Cada célula'],
    colorFlujo: '#95a5a6',
    icono: '🪸',
    eficiencia: 'Muy baja — solo organismos simples',
  },
  {
    id: 'abierto',
    titulo: 'Sistema abierto',
    ejemplos: 'Insectos, arácnidos, la mayoría de moluscos',
    descripcion: 'La hemolinfa (equivalente a la sangre) es bombeada por el corazón y sale por arterias abiertas a espacios llamados hemocele, donde baña directamente los órganos. Luego regresa lentamente al corazón.',
    detalle: 'Sin capilares ni circuito cerrado. Baja presión. La hemolinfa NO transporta oxígeno en insectos (usan tráqueas). En moluscos sí transporta O₂ con hemocianina (azul).',
    flujoEtapas: ['Corazón', 'Arterias', 'Hemocele (espacios)', 'Venas', 'Corazón'],
    colorFlujo: '#3498db',
    icono: '🦗',
    eficiencia: 'Baja — presión baja, flujo lento',
  },
  {
    id: 'cerrado-simple',
    titulo: 'Cerrado simple (1 circuito)',
    ejemplos: 'Peces',
    descripcion: 'La sangre circula en un solo circuito: del corazón a las branquias (donde se oxigena), de las branquias al resto del cuerpo, y de vuelta al corazón. Corazón de 2 cámaras.',
    detalle: 'Problema: tras pasar por las branquias, la sangre pierde presión. Llega al cuerpo con menos fuerza. Limita la actividad metabólica del pez.',
    flujoEtapas: ['Corazón (2 cámaras)', 'Branquias (oxigenación)', 'Cuerpo (desoxigenación)', 'Corazón'],
    colorFlujo: '#e74c3c',
    icono: '🐟',
    eficiencia: 'Media — presión baja tras branquias',
  },
  {
    id: 'cerrado-doble',
    titulo: 'Cerrado doble (2 circuitos)',
    ejemplos: 'Anfibios, reptiles, aves, mamíferos',
    descripcion: 'La sangre recorre dos circuitos separados: pulmonar (corazón → pulmones → corazón) y sistémico (corazón → cuerpo → corazón). Mayor presión y eficiencia.',
    detalle: 'Separar los circuitos permite bombear con alta presión al cuerpo sin dañar los pulmones. La clave fue añadir cámaras al corazón para separar sangre oxigenada de desoxigenada.',
    flujoEtapas: ['Corazón derecho', 'Pulmones (oxigenación)', 'Corazón izquierdo', 'Cuerpo (desoxigenación)', 'Corazón derecho'],
    colorFlujo: '#27ae60',
    icono: '🐕',
    eficiencia: 'Alta — doble bombeo, máxima presión',
  },
];

// ─────────────────────────────────────────────
// Datos: Evolución del Corazón
// ─────────────────────────────────────────────

interface TipoCorazon {
  animal: string;
  icono: string;
  auriculas: number;
  ventriculos: number;
  camaras: number;
  mezcla: string;
  eficiencia: string;
  consecuencia: string;
  colorAuricula: string;
  colorVentriculo: string;
  descripcion: string;
}

const CORAZONES: TipoCorazon[] = [
  {
    animal: 'Pez',
    icono: '🐟',
    auriculas: 1,
    ventriculos: 1,
    camaras: 2,
    mezcla: 'No aplica — solo sangre desoxigenada pasa por el corazón',
    eficiencia: '25-30%',
    consecuencia: 'Toda la sangre se mezcla. Ectotermo obligado.',
    colorAuricula: '#6366f1',
    colorVentriculo: '#6366f1',
    descripcion: 'El corazón solo bombea sangre desoxigenada. Tras pasar por las branquias, la sangre oxigenada va al cuerpo sin volver al corazón. Presión baja.',
  },
  {
    animal: 'Anfibio',
    icono: '🐸',
    auriculas: 2,
    ventriculos: 1,
    camaras: 3,
    mezcla: 'Parcial — sangre oxigenada y desoxigenada se mezclan en el ventrículo único',
    eficiencia: '40-50%',
    consecuencia: 'Mezcla parcial. Complementan con respiración cutánea.',
    colorAuricula: '#ef4444',
    colorVentriculo: '#a855f7',
    descripcion: 'Dos aurículas reciben sangre separada (pulmones y cuerpo), pero un solo ventrículo las mezcla parcialmente. La piel ayuda a oxigenar la sangre.',
  },
  {
    animal: 'Reptil',
    icono: '🦎',
    auriculas: 2,
    ventriculos: 1,
    camaras: 3,
    mezcla: 'Reducida — tabique parcial en el ventrículo minimiza la mezcla',
    eficiencia: '50-65%',
    consecuencia: 'Menos mezcla que anfibios. Algunos reptiles casi la eliminan.',
    colorAuricula: '#ef4444',
    colorVentriculo: '#f97316',
    descripcion: 'Similar al anfibio pero con un tabique parcial en el ventrículo que reduce la mezcla. Los cocodrilos tienen un tabique casi completo y pueden desviar sangre a voluntad.',
  },
  {
    animal: 'Ave / Mamífero',
    icono: '🐕',
    auriculas: 2,
    ventriculos: 2,
    camaras: 4,
    mezcla: 'Ninguna — separación total de sangre oxigenada y desoxigenada',
    eficiencia: '80-90%',
    consecuencia: 'Separación total → sangre caliente → máxima actividad.',
    colorAuricula: '#ef4444',
    colorVentriculo: '#3b82f6',
    descripcion: 'Cuatro cámaras independientes: la sangre oxigenada y desoxigenada nunca se mezclan. Permite alta presión sistémica y baja presión pulmonar simultáneamente.',
  },
];

// ─────────────────────────────────────────────
// Datos: Sangre Fría vs Caliente
// ─────────────────────────────────────────────

interface GrupoTermico {
  tipo: 'ectotermo' | 'endotermo';
  titulo: string;
  ejemplos: string;
  tempCorporal: string;
  ventajas: string[];
  desventajas: string[];
  icono: string;
  relCirculatorio: string;
}

const GRUPOS_TERMICOS: GrupoTermico[] = [
  {
    tipo: 'ectotermo',
    titulo: 'Ectotermos (sangre fría)',
    ejemplos: 'Peces, anfibios, reptiles',
    tempCorporal: 'Variable (= ambiente)',
    ventajas: [
      'Necesitan mucha menos comida (~10x menos)',
      'Pueden sobrevivir largos periodos sin comer',
      'Más eficientes energéticamente',
    ],
    desventajas: [
      'Inactivos en frío — dependen del sol',
      'Reacciones lentas a baja temperatura',
      'No pueden habitar zonas extremas',
    ],
    icono: '🦎',
    relCirculatorio: 'Sistema simple → menos O₂ → menos metabolismo → poca generación de calor',
  },
  {
    tipo: 'endotermo',
    titulo: 'Endotermos (sangre caliente)',
    ejemplos: 'Aves (~40-42°C), mamíferos (~36-38°C)',
    tempCorporal: 'Constante (36-42°C)',
    ventajas: [
      'Activos a cualquier temperatura',
      'Mayor velocidad de reacción metabólica',
      'Pueden vivir en cualquier clima',
    ],
    desventajas: [
      'Necesitan mucha más comida',
      'Gastan el 80% de la energía en mantener temperatura',
      'Morirían si dejaran de comer varios días',
    ],
    icono: '🐕',
    relCirculatorio: 'Doble circuito + 4 cámaras → máximo O₂ → alto metabolismo → calor constante',
  },
];

interface ExcepcionTermica {
  animal: string;
  icono: string;
  descripcion: string;
}

const EXCEPCIONES: ExcepcionTermica[] = [
  { animal: 'Atún rojo', icono: '🐟', descripcion: 'Pez parcialmente endotermo: su sistema de vasos contracorriente calienta los músculos 10-20°C por encima del agua. Esto le permite nadar más rápido.' },
  { animal: 'Colibrí', icono: '🐦', descripcion: 'Ave endoterma que puede entrar en torpor nocturno: baja su temperatura de 40°C a 18°C para ahorrar energía. Sin esto, moriría de hambre cada noche.' },
  { animal: 'Pitón birmana', icono: '🐍', descripcion: 'Reptil que genera calor por contracciones musculares para incubar huevos. Puede subir su temperatura 7°C por encima del ambiente.' },
];

interface PuntoGrafico {
  tempAmbiente: number;
  tempEctotermo: number;
  tempEndotermo: number;
}

const DATOS_GRAFICO: PuntoGrafico[] = [
  { tempAmbiente: 5, tempEctotermo: 7, tempEndotermo: 37 },
  { tempAmbiente: 10, tempEctotermo: 12, tempEndotermo: 37 },
  { tempAmbiente: 15, tempEctotermo: 17, tempEndotermo: 37 },
  { tempAmbiente: 20, tempEctotermo: 22, tempEndotermo: 37 },
  { tempAmbiente: 25, tempEctotermo: 27, tempEndotermo: 37 },
  { tempAmbiente: 30, tempEctotermo: 32, tempEndotermo: 37 },
  { tempAmbiente: 35, tempEctotermo: 36, tempEndotermo: 37 },
  { tempAmbiente: 40, tempEctotermo: 41, tempEndotermo: 37 },
];

// ─────────────────────────────────────────────
// Datos: Datos Fascinantes
// ─────────────────────────────────────────────

interface DatoFascinante {
  icono: string;
  cifra: string;
  titulo: string;
  detalle: string;
}

const DATOS_FASCINANTES: DatoFascinante[] = [
  { icono: '❤️', cifra: '100.000', titulo: 'Latidos del corazón humano al día', detalle: 'El corazón humano late unas 100.000 veces al día y bombea aproximadamente 7.500 litros de sangre. En una vida de 80 años, latirá unos 3.000 millones de veces.' },
  { icono: '🐋', cifra: '180 kg', titulo: 'Peso del corazón de la ballena azul', detalle: 'El corazón de la ballena azul pesa tanto como un coche pequeño (~180 kg). Late solo 8-10 veces por minuto en superficie y 2-3 veces en inmersión profunda.' },
  { icono: '🐦', cifra: '1.200', titulo: 'Latidos/min del colibrí', detalle: 'El colibrí tiene el ritmo cardíaco más rápido: hasta 1.200 latidos por minuto en vuelo. Su corazón supone el 2,5% de su peso corporal (en humanos es el 0,5%).' },
  { icono: '🦑', cifra: '3', titulo: 'Corazones del pulpo', detalle: 'El pulpo tiene 3 corazones: 2 branquiales (bombean sangre a las branquias) y 1 sistémico (al resto del cuerpo). Su sangre es azul porque usa hemocianina (cobre) en vez de hemoglobina (hierro).' },
  { icono: '🦗', cifra: '0', titulo: 'Hemoglobina en insectos', detalle: 'Los insectos no tienen hemoglobina ni glóbulos rojos. Su hemolinfa no transporta oxígeno: usan un sistema de tubos (tráqueas) que lleva el aire directamente a cada célula.' },
  { icono: '🦒', cifra: '280 mmHg', titulo: 'Presión arterial de la jirafa', detalle: 'La jirafa tiene la presión arterial más alta de los mamíferos: necesita bombear la sangre 2 metros hacia arriba hasta el cerebro. Tiene válvulas especiales para evitar desmayos al bajar la cabeza.' },
  { icono: '🐊', cifra: '2 h', titulo: 'Buceo del cocodrilo', detalle: 'El cocodrilo puede desviar sangre para que no pase por los pulmones (shunt cardíaco), redistribuyendo el O₂ restante. Esto le permite permanecer hasta 2 horas bajo el agua.' },
];

interface ComparativaTamano {
  animal: string;
  icono: string;
  porcentaje: number;
  latidos: string;
}

const COMPARATIVA_TAMANO: ComparativaTamano[] = [
  { animal: 'Colibrí', icono: '🐦', porcentaje: 2.5, latidos: '1.200/min' },
  { animal: 'Ratón', icono: '🐭', porcentaje: 1.2, latidos: '600/min' },
  { animal: 'Humano', icono: '🧑', porcentaje: 0.5, latidos: '72/min' },
  { animal: 'Caballo', icono: '🐴', porcentaje: 0.7, latidos: '36/min' },
  { animal: 'Elefante', icono: '🐘', porcentaje: 0.5, latidos: '28/min' },
  { animal: 'Ballena azul', icono: '🐋', porcentaje: 0.5, latidos: '8/min' },
];

// ─────────────────────────────────────────────
// Sección 1: Evolución del Sistema
// ─────────────────────────────────────────────

function SeccionEvolucion() {
  const [sistemaActivo, setSistemaActivo] = useState(0);
  const sistema = SISTEMAS[sistemaActivo];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El sistema circulatorio evolucionó en <strong>4 etapas</strong>: cada paso permitió organismos más grandes, activos y complejos.</p>
      </div>

      {/* Selector de sistema */}
      <div className={styles.sistemaSelector}>
        {SISTEMAS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={`${styles.sistemaBtn} ${sistemaActivo === i ? styles.sistemaBtnActivo : ''}`}
            onClick={() => setSistemaActivo(i)}
            aria-pressed={sistemaActivo === i}
          >
            <span aria-hidden="true">{s.icono}</span>
            <span className={styles.sistemaBtnTexto}>{s.titulo}</span>
          </button>
        ))}
      </div>

      {/* Diagrama del sistema seleccionado */}
      <div className={styles.diagramaCard}>
        <div className={styles.diagramaHeader}>
          <span className={styles.diagramaIcono} aria-hidden="true">{sistema.icono}</span>
          <div>
            <h3 className={styles.diagramaTitulo}>{sistema.titulo}</h3>
            <p className={styles.diagramaEjemplos}>{sistema.ejemplos}</p>
          </div>
        </div>

        <p className={styles.diagramaDesc}>{sistema.descripcion}</p>

        {/* Flujo animado */}
        <div className={styles.flujoCircuito}>
          {sistema.flujoEtapas.map((etapa, i) => (
            <div key={i} className={styles.flujoEtapaWrapper}>
              <div
                className={styles.flujoNodo}
                style={{ borderColor: sistema.colorFlujo }}
              >
                <span className={styles.flujoNodoTexto}>{etapa}</span>
              </div>
              {i < sistema.flujoEtapas.length - 1 && (
                <div className={styles.flujoFlechaAnimada} aria-hidden="true">
                  <span
                    className={styles.flechaPulso}
                    style={{ color: sistema.colorFlujo }}
                  >
                    →
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.diagramaMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Eficiencia</span>
            <span className={styles.metaValor}>{sistema.eficiencia}</span>
          </div>
        </div>

        <p className={styles.diagramaDetalle}>{sistema.detalle}</p>
      </div>

      {/* Escala evolutiva */}
      <div className={styles.escalaEvolutiva}>
        <h3 className={styles.escalaTitulo}>Línea evolutiva</h3>
        <div className={styles.escalaTrack}>
          {SISTEMAS.map((s, i) => (
            <div
              key={s.id}
              className={`${styles.escalaPunto} ${sistemaActivo === i ? styles.escalaPuntoActivo : ''}`}
              aria-hidden="true"
            >
              <span className={styles.escalaPuntoIcono}>{s.icono}</span>
              <div
                className={styles.escalaBarra}
                style={{
                  background: sistemaActivo >= i ? 'var(--primary)' : 'var(--border)',
                  width: i < SISTEMAS.length - 1 ? '100%' : '0',
                }}
              />
            </div>
          ))}
        </div>
        <div className={styles.escalaLabels}>
          <span>Simple</span>
          <span>Complejo</span>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          La evolución del sistema circulatorio es la historia de cómo <strong>separar la sangre limpia de la sucia</strong>.
          Cada paso permitió mayor tamaño, mayor actividad y, finalmente, sangre caliente.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: La Evolución del Corazón
// ─────────────────────────────────────────────

function SeccionCorazones() {
  const [corazonActivo, setCorazonActivo] = useState(0);
  const corazon = CORAZONES[corazonActivo];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El corazón evolucionó añadiendo cámaras para <strong>separar la sangre oxigenada de la desoxigenada</strong>.</p>
      </div>

      {/* Selector de corazones */}
      <div className={styles.corazonSelector}>
        {CORAZONES.map((c, i) => (
          <button
            key={c.animal}
            type="button"
            className={`${styles.corazonBtn} ${corazonActivo === i ? styles.corazonBtnActivo : ''}`}
            onClick={() => setCorazonActivo(i)}
            aria-pressed={corazonActivo === i}
          >
            <span aria-hidden="true">{c.icono}</span>
            <span className={styles.corazonBtnLabel}>{c.animal}</span>
            <span className={styles.corazonBtnCamaras}>{c.camaras} cámaras</span>
          </button>
        ))}
      </div>

      {/* Diagrama del corazón */}
      <div className={styles.corazonDiagrama}>
        <div className={styles.corazonVisual}>
          <div className={styles.corazonShape}>
            {/* Aurículas */}
            <div className={styles.camarasRow}>
              {Array.from({ length: corazon.auriculas }).map((_, i) => (
                <div
                  key={`a-${i}`}
                  className={styles.camara}
                  style={{ background: i === 0 && corazon.auriculas === 2 ? '#3b82f6' : corazon.colorAuricula }}
                >
                  <span className={styles.camaraLabel}>A{corazon.auriculas > 1 ? i + 1 : ''}</span>
                  <span className={styles.camaraTipo}>{i === 0 && corazon.auriculas === 2 ? 'Desoxi' : corazon.auriculas === 1 ? '' : 'Oxi'}</span>
                </div>
              ))}
            </div>
            {/* Flechas internas */}
            <div className={styles.flechasInternas} aria-hidden="true">
              {Array.from({ length: corazon.auriculas }).map((_, i) => (
                <span key={`f-${i}`} className={styles.flechaInterna}>↓</span>
              ))}
            </div>
            {/* Ventrículos */}
            <div className={styles.camarasRow}>
              {Array.from({ length: corazon.ventriculos }).map((_, i) => (
                <div
                  key={`v-${i}`}
                  className={`${styles.camara} ${styles.camaraVentriculo}`}
                  style={{ background: corazon.ventriculos === 2 ? (i === 0 ? '#3b82f6' : '#ef4444') : corazon.colorVentriculo }}
                >
                  <span className={styles.camaraLabel}>V{corazon.ventriculos > 1 ? i + 1 : ''}</span>
                  <span className={styles.camaraTipo}>{corazon.ventriculos === 2 ? (i === 0 ? 'Desoxi' : 'Oxi') : corazon.ventriculos === 1 && corazon.auriculas === 2 ? 'Mezcla' : ''}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Flujo de sangre */}
          <div className={styles.flujoSangre}>
            <div className={styles.flujoSangreItem}>
              <span className={styles.sangreOxigenada} aria-hidden="true">●</span>
              <span>Sangre oxigenada</span>
            </div>
            <div className={styles.flujoSangreItem}>
              <span className={styles.sangreDesoxigenada} aria-hidden="true">●</span>
              <span>Sangre desoxigenada</span>
            </div>
            {corazon.ventriculos === 1 && corazon.auriculas === 2 && (
              <div className={styles.flujoSangreItem}>
                <span className={styles.sangreMezclada} aria-hidden="true">●</span>
                <span>Sangre mezclada</span>
              </div>
            )}
          </div>
        </div>

        {/* Info del corazón */}
        <div className={styles.corazonInfo}>
          <div className={styles.corazonInfoGrid}>
            <div className={styles.corazonInfoItem}>
              <span className={styles.corazonInfoLabel}>Cámaras</span>
              <span className={styles.corazonInfoValor}>{corazon.auriculas}A + {corazon.ventriculos}V = {corazon.camaras}</span>
            </div>
            <div className={styles.corazonInfoItem}>
              <span className={styles.corazonInfoLabel}>Mezcla</span>
              <span className={styles.corazonInfoValor}>{corazon.mezcla}</span>
            </div>
            <div className={styles.corazonInfoItem}>
              <span className={styles.corazonInfoLabel}>Eficiencia</span>
              <span className={styles.corazonInfoValor}>{corazon.eficiencia}</span>
            </div>
          </div>
          <p className={styles.corazonInfoDesc}>{corazon.descripcion}</p>
        </div>
      </div>

      {/* Barra de eficiencia comparativa */}
      <div className={styles.eficienciaCard}>
        <h3 className={styles.eficienciaTitulo}>Eficiencia comparada</h3>
        {CORAZONES.map((c, i) => {
          const pctNum = parseInt(c.eficiencia.split('-')[1] || c.eficiencia.split('-')[0]);
          return (
            <div key={c.animal} className={styles.eficienciaBarra}>
              <div className={styles.eficienciaInfo}>
                <span aria-hidden="true">{c.icono}</span>
                <span className={styles.eficienciaAnimal}>{c.animal}</span>
                <span className={styles.eficienciaPct}>{c.eficiencia}</span>
              </div>
              <div className={styles.eficienciaTrack}>
                <div
                  className={`${styles.eficienciaRelleno} ${corazonActivo === i ? styles.eficienciaRellenoActivo : ''}`}
                  style={{ width: `${pctNum}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.insight}>
        <p>
          El corazón de 4 cámaras es lo que permitió a aves y mamíferos ser de <strong>sangre caliente</strong>.
          La separación total de la sangre oxigenada y desoxigenada fue el salto clave para la endotermia.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Sangre Fría vs Caliente
// ─────────────────────────────────────────────

function SeccionTemperatura() {
  const [grupoActivo, setGrupoActivo] = useState<number | null>(null);

  const maxTemp = 45;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La termorregulación está directamente ligada al tipo de sistema circulatorio. <strong>Doble circuito = sangre caliente</strong>.</p>
      </div>

      {/* Comparativa visual */}
      <div className={styles.termoGrid}>
        {GRUPOS_TERMICOS.map((g, i) => (
          <button
            key={g.tipo}
            type="button"
            className={`${styles.termoCard} ${grupoActivo === i ? styles.termoCardActivo : ''}`}
            onClick={() => setGrupoActivo(grupoActivo === i ? null : i)}
            aria-expanded={grupoActivo === i}
          >
            <div className={styles.termoHeader}>
              <span className={styles.termoIcono} aria-hidden="true">{g.icono}</span>
              <span className={styles.termoTitulo}>{g.titulo}</span>
            </div>
            <p className={styles.termoEjemplos}>{g.ejemplos}</p>
            <div className={styles.termoTemp}>
              <span className={styles.termoTempLabel}>Temperatura corporal</span>
              <span className={styles.termoTempValor}>{g.tempCorporal}</span>
            </div>

            {grupoActivo === i && (
              <div className={styles.termoDetalle}>
                <div className={styles.prosContras}>
                  <div className={styles.prosCol}>
                    <span className={styles.prosContrasTitulo}>Ventajas</span>
                    {g.ventajas.map((v, j) => (
                      <span key={j} className={styles.prosItem}>&#10003; {v}</span>
                    ))}
                  </div>
                  <div className={styles.contrasCol}>
                    <span className={styles.prosContrasTitulo}>Desventajas</span>
                    {g.desventajas.map((d, j) => (
                      <span key={j} className={styles.contrasItem}>&#10007; {d}</span>
                    ))}
                  </div>
                </div>
                <div className={styles.termoRelacion}>
                  <strong>Relación con el sistema circulatorio:</strong> {g.relCirculatorio}
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Gráfico temperatura corporal vs ambiente */}
      <div className={styles.graficoCard}>
        <h3 className={styles.graficoTitulo}>Temperatura corporal vs temperatura ambiente</h3>
        <div className={styles.graficoContainer}>
          {/* Eje Y */}
          <div className={styles.graficoEjeY}>
            <span>45°C</span>
            <span>30°C</span>
            <span>15°C</span>
            <span>0°C</span>
          </div>
          {/* Área del gráfico */}
          <div className={styles.graficoArea}>
            {/* Líneas de referencia */}
            <div className={styles.graficoLinea} style={{ bottom: `${(37 / maxTemp) * 100}%` }}>
              <span className={styles.graficoLineaLabel}>37°C</span>
            </div>
            {/* Puntos ectotermo */}
            <svg className={styles.graficoSvg} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {/* Línea ectotermo */}
              <polyline
                points={DATOS_GRAFICO.map((d, i) => `${(i / (DATOS_GRAFICO.length - 1)) * 100},${100 - (d.tempEctotermo / maxTemp) * 100}`).join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Línea endotermo */}
              <polyline
                points={DATOS_GRAFICO.map((d, i) => `${(i / (DATOS_GRAFICO.length - 1)) * 100},${100 - (d.tempEndotermo / maxTemp) * 100}`).join(' ')}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {/* Eje X */}
            <div className={styles.graficoEjeX}>
              {DATOS_GRAFICO.filter((_, i) => i % 2 === 0).map((d) => (
                <span key={d.tempAmbiente}>{d.tempAmbiente}°C</span>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.graficoLeyenda}>
          <div className={styles.graficoLeyendaItem}>
            <span className={styles.graficoLeyendaColor} style={{ background: '#ef4444' }} />
            <span>Endotermo (mamífero)</span>
          </div>
          <div className={styles.graficoLeyendaItem}>
            <span className={styles.graficoLeyendaColor} style={{ background: '#3b82f6' }} />
            <span>Ectotermo (reptil)</span>
          </div>
        </div>
      </div>

      {/* Excepciones */}
      <div className={styles.excepcionesCard}>
        <h3 className={styles.excepcionesTitulo}>Excepciones fascinantes</h3>
        <div className={styles.excepcionesGrid}>
          {EXCEPCIONES.map((e, i) => (
            <div key={i} className={styles.excepcionItem}>
              <span className={styles.excepcionIcono} aria-hidden="true">{e.icono}</span>
              <div>
                <span className={styles.excepcionAnimal}>{e.animal}</span>
                <p className={styles.excepcionDesc}>{e.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Un cocodrilo necesita comer <strong>~10 veces menos</strong> que un mamífero de su mismo tamaño.
          La endotermia es una ventaja competitiva enorme, pero tiene un coste energético brutal.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Datos Fascinantes
// ─────────────────────────────────────────────

function SeccionDatos() {
  const [datoActivo, setDatoActivo] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El sistema circulatorio del reino animal está lleno de <strong>récords y adaptaciones sorprendentes</strong>.</p>
      </div>

      {/* Grid de datos */}
      <div className={styles.datosGrid}>
        {DATOS_FASCINANTES.map((d, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.datoCard} ${datoActivo === i ? styles.datoCardActivo : ''}`}
            onClick={() => setDatoActivo(datoActivo === i ? null : i)}
            aria-expanded={datoActivo === i}
          >
            <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
            <span className={styles.datoCifra}>{d.cifra}</span>
            <span className={styles.datoTitulo}>{d.titulo}</span>
            {datoActivo === i && (
              <span className={styles.datoDetalle}>{d.detalle}</span>
            )}
          </button>
        ))}
      </div>

      {/* Comparativa de tamaño de corazón */}
      <div className={styles.tamanoCard}>
        <h3 className={styles.tamanoTitulo}>Tamaño del corazón vs cuerpo</h3>
        <p className={styles.tamanoSubtitulo}>Porcentaje del peso corporal que ocupa el corazón</p>
        <div className={styles.tamanoBarras}>
          {COMPARATIVA_TAMANO.map((c, i) => (
            <div key={i} className={styles.tamanoBarra}>
              <div className={styles.tamanoInfo}>
                <span aria-hidden="true">{c.icono}</span>
                <span className={styles.tamanoAnimal}>{c.animal}</span>
                <span className={styles.tamanoPct}>{c.porcentaje}%</span>
              </div>
              <div className={styles.tamanoTrack}>
                <div
                  className={styles.tamanoRelleno}
                  style={{ width: `${(c.porcentaje / 3) * 100}%` }}
                />
              </div>
              <span className={styles.tamanoLatidos}>{c.latidos}</span>
            </div>
          ))}
        </div>
        <p className={styles.tamanoNota}>
          Regla general: cuanto más pequeño el animal, mayor proporción de corazón y más rápido late.
          El colibrí ({formatNumber(1200, 0)}/min) late {formatNumber(150, 0)} veces más rápido que la ballena (8/min).
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          La diversidad de sistemas circulatorios refleja millones de años de <strong>adaptación a entornos radicalmente distintos</strong>:
          desde el fondo del océano hasta el vuelo a 10.000 metros de altitud.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorSistemasCirculatoriosPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('evolucion');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'evolucion': return <SeccionEvolucion />;
      case 'corazones': return <SeccionCorazones />;
      case 'temperatura': return <SeccionTemperatura />;
      case 'datos': return <SeccionDatos />;
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
          <h1 className={styles.title}>Sistemas Circulatorios</h1>
          <p className={styles.subtitle}>Del corazón de 2 cámaras al de 4: la evolución que permitió la sangre caliente</p>
        </header>

        <LegalNotice />

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
          title="Más sobre los sistemas circulatorios"
          subtitle="Conceptos clave de biología comparada"
          defaultOpen={false}
        >
          <h3>¿Por qué evolucionó el sistema circulatorio?</h3>
          <p>
            Los organismos unicelulares y los muy pequeños no necesitan sistema circulatorio: cada célula intercambia gases directamente con el medio. Pero cuando los animales crecieron en tamaño y complejidad, las células internas quedaron demasiado lejos del exterior. Un sistema de transporte se hizo imprescindible para llevar oxígeno, nutrientes y recoger desechos.
          </p>

          <h3>¿Qué diferencia hay entre hemoglobina y hemocianina?</h3>
          <p>
            La hemoglobina (basada en hierro) es la molécula que transporta oxígeno en vertebrados e invertebrados como las lombrices. La hemocianina (basada en cobre) hace lo mismo en moluscos y crustáceos. Por eso la sangre de un pulpo es azul y la nuestra es roja. La hemoglobina es más eficiente, pero la hemocianina funciona mejor a bajas temperaturas.
          </p>

          <h3>¿Por qué los insectos no tienen sangre roja?</h3>
          <p>
            Los insectos desarrollaron un sistema completamente diferente: las tráqueas. Son tubos que llevan el aire directamente a cada célula. Su hemolinfa (equivalente a la sangre) NO transporta oxígeno, solo nutrientes y hormonas. Esto limita su tamaño: un insecto gigante no podría respirar.
          </p>

          <h3>¿Todos los mamíferos tienen sangre caliente?</h3>
          <p>
            Sí, todos los mamíferos son endotermos, pero con matices. Los osos hibernan bajando su temperatura varios grados. Las ratas topo desnudas son casi poiquilotermas (su temperatura varía más que en otros mamíferos). Y los recién nacidos humanos tienen dificultades para termorregularse las primeras horas de vida.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> Este explicador es una simplificación educativa de procesos biológicos complejos. Los datos de eficiencia, temperaturas y latidos son aproximaciones basadas en literatura científica general. La evolución del sistema circulatorio no fue lineal ni uniforme en todos los linajes. Última revisión: 2025.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-sistemas-circulatorios')} />
        <ShareCard appName="visualizador-sistemas-circulatorios" />
        <Footer appName="visualizador-sistemas-circulatorios" />
      </div>
    </>
  );
}
