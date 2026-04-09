'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './SistemaEndocrino.module.css';
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

type Seccion = 'glandulas' | 'hormonas' | 'feedback' | 'estres';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'glandulas', titulo: 'Las glándulas', icono: '🫀', subtitulo: 'Dónde están y qué producen' },
  { id: 'hormonas', titulo: 'Hormonas clave', icono: '🧬', subtitulo: '10 mensajeros esenciales' },
  { id: 'feedback', titulo: 'Feedback negativo', icono: '🔄', subtitulo: 'El termostato del cuerpo' },
  { id: 'estres', titulo: 'Estrés y datos', icono: '⚡', subtitulo: 'Cortisol, eje HPA y curiosidades' },
];

// ─────────────────────────────────────────────
// Datos: Glándulas
// ─────────────────────────────────────────────

interface GlandulaInfo {
  id: string;
  nombre: string;
  ubicacion: string;
  hormona: string;
  funcion: string;
  exceso: string;
  deficit: string;
  color: string;
  cx: number;
  cy: number;
}

const GLANDULAS: GlandulaInfo[] = [
  {
    id: 'hipotalamo', nombre: 'Hipotálamo', ubicacion: 'Centro del cerebro',
    hormona: 'CRH, TRH, GnRH (hormonas liberadoras)',
    funcion: 'Directora de orquesta: controla a la hipófisis y regula temperatura, hambre, sed y sueño.',
    exceso: 'Exceso: pubertad precoz, desregulación térmica.',
    deficit: 'Déficit: hipotiroidismo secundario, insuficiencia suprarrenal.',
    color: '#8e44ad', cx: 150, cy: 52,
  },
  {
    id: 'hipofisis', nombre: 'Hipófisis (pituitaria)', ubicacion: 'Base del cerebro',
    hormona: 'GH, TSH, ACTH, FSH, LH, prolactina, ADH, oxitocina',
    funcion: 'Glándula maestra: envía órdenes a casi todas las demás glándulas del cuerpo.',
    exceso: 'Exceso de GH: gigantismo (niños) o acromegalia (adultos).',
    deficit: 'Déficit de GH: enanismo hipofisario, fatiga crónica.',
    color: '#9b59b6', cx: 150, cy: 72,
  },
  {
    id: 'tiroides', nombre: 'Tiroides', ubicacion: 'Parte anterior del cuello',
    hormona: 'T3 y T4 (tiroxina), calcitonina',
    funcion: 'Regula el metabolismo basal: velocidad a la que quemas calorías, ritmo cardíaco, temperatura.',
    exceso: 'Hipertiroidismo: pérdida de peso, taquicardia, ansiedad, temblores.',
    deficit: 'Hipotiroidismo: aumento de peso, fatiga, frío constante, depresión.',
    color: '#2E86AB', cx: 150, cy: 115,
  },
  {
    id: 'paratiroides', nombre: 'Paratiroides (4)', ubicacion: 'Detrás de la tiroides',
    hormona: 'PTH (parathormona)',
    funcion: 'Regula los niveles de calcio en sangre: esencial para huesos, nervios y músculos.',
    exceso: 'Hiperparatiroidismo: piedras en el riñón, huesos frágiles.',
    deficit: 'Hipoparatiroidismo: calambres, hormigueo, espasmos musculares.',
    color: '#48A9A6', cx: 168, cy: 115,
  },
  {
    id: 'timo', nombre: 'Timo', ubicacion: 'Detrás del esternón',
    hormona: 'Timosina, timopoietina',
    funcion: 'Entrena linfocitos T durante la infancia. Se atrofia en la edad adulta.',
    exceso: 'Exceso (raro): hiperplasia tímica, asociada a miastenia gravis.',
    deficit: 'Déficit: inmunodeficiencia en niños (síndrome de DiGeorge).',
    color: '#e67e22', cx: 150, cy: 148,
  },
  {
    id: 'suprarrenales', nombre: 'Suprarrenales (2)', ubicacion: 'Encima de cada riñón',
    hormona: 'Cortisol, aldosterona, adrenalina, noradrenalina',
    funcion: 'Gestión del estrés (cortisol), presión arterial (aldosterona) y respuesta lucha/huida (adrenalina).',
    exceso: 'Síndrome de Cushing: cara redonda, grasa abdominal, hipertensión.',
    deficit: 'Enfermedad de Addison: fatiga extrema, piel oscura, hipotensión.',
    color: '#e74c3c', cx: 135, cy: 198,
  },
  {
    id: 'pancreas', nombre: 'Páncreas', ubicacion: 'Detrás del estómago',
    hormona: 'Insulina (células beta) y glucagón (células alfa)',
    funcion: 'Regula la glucosa en sangre: insulina la baja, glucagón la sube. Equilibrio vital.',
    exceso: 'Exceso de insulina: hipoglucemia, mareos, desmayos.',
    deficit: 'Déficit de insulina: diabetes mellitus (glucosa alta crónica).',
    color: '#27ae60', cx: 165, cy: 215,
  },
  {
    id: 'gonadas', nombre: 'Ovarios / Testículos', ubicacion: 'Pelvis (ovarios) o escroto (testículos)',
    hormona: 'Estrógeno, progesterona (ovarios) / Testosterona (testículos)',
    funcion: 'Desarrollo sexual, reproducción, masa ósea y muscular, distribución de grasa corporal.',
    exceso: 'Exceso de testosterona: acné, agresividad. Exceso de estrógeno: riesgo trombosis.',
    deficit: 'Déficit: osteoporosis, infertilidad, falta de desarrollo sexual.',
    color: '#d35400', cx: 150, cy: 270,
  },
];

// ─────────────────────────────────────────────
// Datos: Hormonas
// ─────────────────────────────────────────────

interface HormonaInfo {
  nombre: string;
  icono: string;
  origen: string;
  funcion: string;
  curioso: string;
}

const HORMONAS: HormonaInfo[] = [
  {
    nombre: 'Insulina', icono: '🩸', origen: 'Páncreas (células beta)',
    funcion: 'Baja la glucosa en sangre haciendo que las células la absorban. Sin ella, la glucosa se acumula en sangre (diabetes).',
    curioso: 'Fue la primera hormona descubierta (1921). Su descubrimiento salvó millones de vidas.',
  },
  {
    nombre: 'Glucagón', icono: '📈', origen: 'Páncreas (células alfa)',
    funcion: 'Sube la glucosa en sangre liberando las reservas del hígado. Trabaja en equipo con la insulina.',
    curioso: 'Cuando duermes, el glucagón mantiene tu glucosa estable toda la noche.',
  },
  {
    nombre: 'Tiroxina (T4)', icono: '🔥', origen: 'Tiroides',
    funcion: 'Regula el metabolismo basal: velocidad a la que quemas calorías, ritmo cardíaco y temperatura.',
    curioso: 'La tiroides necesita yodo para fabricar T4. Por eso la sal se yoda en muchos países.',
  },
  {
    nombre: 'Cortisol', icono: '😰', origen: 'Glándulas suprarrenales',
    funcion: 'Hormona del estrés: sube la glucosa, suprime inmunidad y moviliza energía para emergencias.',
    curioso: 'Tu cortisol está en su pico máximo al despertar (cortisol awakening response) para activarte.',
  },
  {
    nombre: 'Adrenalina', icono: '🏃', origen: 'Médula suprarrenal',
    funcion: 'Respuesta de lucha o huida: acelera el corazón, dilata pupilas, redirige sangre a músculos.',
    curioso: 'Actúa en segundos. Una descarga puede darte fuerza para levantar un coche (temporalmente).',
  },
  {
    nombre: 'Melatonina', icono: '🌙', origen: 'Glándula pineal',
    funcion: 'Hormona del sueño: se dispara con la oscuridad y te prepara para dormir.',
    curioso: 'La luz azul de las pantallas bloquea la melatonina. Por eso el móvil antes de dormir desordena el sueño.',
  },
  {
    nombre: 'Testosterona', icono: '💪', origen: 'Testículos (y algo las suprarrenales)',
    funcion: 'Desarrollo muscular, óseo y sexual masculino. También presente en mujeres en menor cantidad.',
    curioso: 'Los niveles de testosterona son más altos por la mañana y bajan a lo largo del día.',
  },
  {
    nombre: 'Estrógeno', icono: '🌸', origen: 'Ovarios (y algo las suprarrenales)',
    funcion: 'Desarrollo sexual femenino, ciclo menstrual, protección ósea y cardiovascular.',
    curioso: 'Los hombres también producen estrógeno (en menor cantidad). Es esencial para su salud ósea.',
  },
  {
    nombre: 'Hormona del crecimiento (GH)', icono: '📏', origen: 'Hipófisis anterior',
    funcion: 'Estimula el crecimiento en la infancia y mantiene la masa muscular y ósea en adultos.',
    curioso: 'Se libera sobre todo durante el sueño profundo. Los niños que duermen mal pueden crecer menos.',
  },
  {
    nombre: 'Oxitocina', icono: '🤗', origen: 'Hipotálamo (liberada por hipófisis)',
    funcion: 'Hormona del vínculo social: promueve apego, confianza, contracciones del parto y lactancia.',
    curioso: 'Acariciar a un perro sube la oxitocina tanto en ti como en el perro.',
  },
];

// ─────────────────────────────────────────────
// Datos: Efectos del cortisol crónico
// ─────────────────────────────────────────────

interface EfectoCortisol {
  icono: string;
  titulo: string;
  desc: string;
}

const EFECTOS_CORTISOL: EfectoCortisol[] = [
  { icono: '🛡️', titulo: 'Inmunidad ↓', desc: 'El cortisol crónico suprime los linfocitos. Más resfriados y más lentas las recuperaciones.' },
  { icono: '🍔', titulo: 'Grasa abdominal ↑', desc: 'El cortisol activa la acumulación de grasa visceral (la más peligrosa para el corazón).' },
  { icono: '🧠', titulo: 'Memoria ↓', desc: 'Daña el hipocampo (centro de la memoria). El estrés crónico reduce la capacidad de aprender.' },
  { icono: '😴', titulo: 'Sueño ↓', desc: 'Bloquea la melatonina. Más cortisol por la noche = insomnio y sueño de mala calidad.' },
  { icono: '💔', titulo: 'Presión arterial ↑', desc: 'Retiene sodio y agua, aumentando la tensión. Factor de riesgo cardiovascular.' },
  { icono: '🦴', titulo: 'Huesos frágiles', desc: 'Inhibe la absorción de calcio y reduce la formación ósea. Riesgo de osteoporosis.' },
];

// ─────────────────────────────────────────────
// Datos: curiosidades
// ─────────────────────────────────────────────

interface DatoCurioso {
  icono: string;
  titulo: string;
  descripcion: string;
}

const DATOS_CURIOSOS: DatoCurioso[] = [
  { icono: '🧪', titulo: '~50 hormonas', descripcion: 'Tu cuerpo produce unas 50 hormonas diferentes, coordinadas por el hipotálamo y la hipófisis.' },
  { icono: '🫗', titulo: '1-2 L de jugo pancreático', descripcion: 'El páncreas produce entre 1 y 2 litros diarios de jugo pancreático para la digestión.' },
  { icono: '🌑', titulo: 'Melatonina y oscuridad', descripcion: 'La melatonina se dispara cuando cae la noche. 30 min de pantalla antes de dormir pueden retrasarla 90 min.' },
  { icono: '⏱️', titulo: 'Adrenalina en 2 s', descripcion: 'La adrenalina tarda solo 2-3 segundos en llegar a todo el cuerpo tras un susto.' },
  { icono: '🦋', titulo: 'Tiroides: 20 g', descripcion: 'La tiroides pesa unos 20 gramos (como una mariposa) pero controla el metabolismo de todo tu cuerpo.' },
  { icono: '👶', titulo: 'GH y sueño', descripcion: 'Hasta el 75% de la hormona del crecimiento se libera durante el sueño profundo (fases 3-4).' },
];

// ─────────────────────────────────────────────
// Sección 1: Las Glándulas
// ─────────────────────────────────────────────

function SeccionGlandulas() {
  const [glandulaActiva, setGlandulaActiva] = useState<string | null>(null);
  const seleccionada = GLANDULAS.find(g => g.id === glandulaActiva);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El sistema endocrino es una red de <strong>glándulas</strong> que producen hormonas: mensajeros químicos que viajan por la sangre y regulan casi todo en tu cuerpo. Haz clic en cada glándula para conocerla.</p>
      </div>

      {/* Silueta SVG con glándulas */}
      <div className={styles.siluetaZona}>
        <svg
          viewBox="0 0 300 370"
          className={styles.siluetaSvg}
          role="img"
          aria-label="Silueta humana con glándulas endocrinas clickables en su posición anatómica"
        >
          {/* Silueta simplificada */}
          {/* Cabeza */}
          <ellipse cx="150" cy="45" rx="35" ry="40" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
          {/* Cuello */}
          <rect x="140" y="85" width="20" height="20" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
          {/* Torso */}
          <path d="M100 105 Q100 100 110 100 L190 100 Q200 100 200 105 L210 250 Q210 260 200 260 L100 260 Q90 260 90 250 Z" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
          {/* Pelvis */}
          <path d="M100 260 Q95 290 110 310 L130 310 L150 330 L170 310 L190 310 Q205 290 200 260" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
          {/* Piernas */}
          <line x1="130" y1="310" x2="120" y2="365" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
          <line x1="170" y1="310" x2="180" y2="365" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
          {/* Brazos */}
          <line x1="100" y1="115" x2="65" y2="220" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
          <line x1="200" y1="115" x2="235" y2="220" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />

          {/* Glándulas como puntos clickables */}
          {GLANDULAS.map(g => (
            <g key={g.id}>
              <circle
                cx={g.cx}
                cy={g.cy}
                r={glandulaActiva === g.id ? 11 : 9}
                fill={g.color}
                opacity={glandulaActiva === g.id ? 1 : 0.8}
                stroke={glandulaActiva === g.id ? '#fff' : 'none'}
                strokeWidth="2"
                className={styles.glandulaDot}
                onClick={() => setGlandulaActiva(glandulaActiva === g.id ? null : g.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setGlandulaActiva(glandulaActiva === g.id ? null : g.id); } }}
                tabIndex={0}
                role="button"
                aria-pressed={glandulaActiva === g.id}
                aria-label={`Ver detalles de ${g.nombre}`}
              />
              {/* Etiqueta con línea */}
              <line
                x1={g.cx + (g.cx > 150 ? 12 : -12)}
                y1={g.cy}
                x2={g.cx + (g.cx > 150 ? 30 : -30)}
                y2={g.cy}
                stroke={g.color}
                strokeWidth="1"
                opacity="0.5"
              />
              <text
                x={g.cx + (g.cx > 150 ? 33 : -33)}
                y={g.cy + 4}
                fill="currentColor"
                fontSize="8"
                fontWeight="600"
                textAnchor={g.cx > 150 ? 'start' : 'end'}
                opacity="0.7"
              >
                {g.nombre.split(' (')[0].split(' /')[0]}
              </text>
            </g>
          ))}
        </svg>

        <div className={styles.siluetaLeyenda}>
          <span>Haz clic en cualquier glándula para ver sus hormonas y funciones</span>
        </div>
      </div>

      {/* Card de detalle de glándula seleccionada */}
      {seleccionada && (
        <div className={styles.glandulaDetalle} style={{ borderLeftColor: seleccionada.color }}>
          <div className={styles.glandulaHeader}>
            <h3 className={styles.glandulaNombre}>{seleccionada.nombre}</h3>
          </div>
          <p className={styles.glandulaUbicacion}>{seleccionada.ubicacion}</p>
          <p className={styles.glandulaHormona}><strong>Produce:</strong> {seleccionada.hormona}</p>
          <p className={styles.glandulaFuncion}>{seleccionada.funcion}</p>
          <p className={styles.glandulaExceso}><span aria-hidden="true">⬆️</span> {seleccionada.exceso}</p>
          <p className={styles.glandulaDeficit}><span aria-hidden="true">⬇️</span> {seleccionada.deficit}</p>
        </div>
      )}

      <div className={styles.insight}>
        <p>
          Aunque la hipófisis se llama &ldquo;glándula maestra&rdquo;, en realidad quien manda es el <strong>hipotálamo</strong>:
          recibe información del cerebro (estrés, temperatura, hambre) y le dice a la hipófisis qué hormonas liberar.
          Es la directora de orquesta del sistema endocrino.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Hormonas Clave
// ─────────────────────────────────────────────

function SeccionHormonas() {
  const [hormonaActiva, setHormonaActiva] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Las hormonas son <strong>mensajeros químicos</strong> que viajan por la sangre y actúan sobre órganos diana. Aquí tienes las 10 más importantes para tu vida diaria.</p>
      </div>

      <div className={styles.hormonasGrid}>
        {HORMONAS.map((h, i) => (
          <div
            key={i}
            className={`${styles.hormonaCard} ${hormonaActiva === i ? styles.hormonaActiva : ''}`}
            onClick={() => setHormonaActiva(hormonaActiva === i ? null : i)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setHormonaActiva(hormonaActiva === i ? null : i); } }}
            tabIndex={0}
            role="button"
            aria-expanded={hormonaActiva === i}
            aria-label={`Ver detalles de ${h.nombre}`}
          >
            <div className={styles.hormonaHeaderRow}>
              <span className={styles.hormonaIcono} aria-hidden="true">{h.icono}</span>
              <h4 className={styles.hormonaNombre}>{h.nombre}</h4>
            </div>
            <p className={styles.hormonaOrigen}>{h.origen}</p>
            {hormonaActiva === i && (
              <div className={styles.hormonaDetalle}>
                <p className={styles.hormonaFuncion}>{h.funcion}</p>
                <p className={styles.hormonaCurioso}><span aria-hidden="true">💡</span> {h.curioso}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Error común */}
      <h3 className={styles.subSeccionTitulo}>Error común</h3>
      <div className={styles.errorComun}>
        <div className={styles.errorIncorrecto}>
          <span className={styles.errorLabel}><span aria-hidden="true">❌</span> Mito</span>
          <p>&ldquo;La adrenalina y el cortisol son lo mismo&rdquo;</p>
        </div>
        <div className={styles.errorCorrecto}>
          <span className={styles.errorLabel}><span aria-hidden="true">✅</span> Realidad</span>
          <p>La <strong>adrenalina</strong> actúa en segundos (emergencia inmediata). El <strong>cortisol</strong> tarda minutos-horas y gestiona el estrés prolongado. Ambas vienen de las suprarrenales, pero son hormonas distintas con funciones complementarias.</p>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Las hormonas funcionan en cantidades <strong>minúsculas</strong>: una gota de adrenalina diluida en
          un vagón cisterna de agua seguiría siendo detectable. Por eso un pequeño
          desequilibrio hormonal puede tener efectos enormes en todo el cuerpo.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Feedback Negativo
// ─────────────────────────────────────────────

function SeccionFeedback() {
  const [glucosa, setGlucosa] = useState(100);

  // Calcular niveles de insulina y glucagón según glucosa
  const insulinaNivel = glucosa > 100 ? Math.min(((glucosa - 100) / 200) * 100, 100) : 5;
  const glucagonNivel = glucosa < 100 ? Math.min(((100 - glucosa) / 60) * 100, 100) : 5;

  const estadoGlucosa = glucosa < 70
    ? 'Hipoglucemia: el glucagón sube para liberar glucosa del hígado. Puedes sentir temblores y mareos.'
    : glucosa > 140
      ? 'Hiperglucemia: la insulina sube para que las células absorban glucosa. Sin insulina (diabetes), la glucosa se acumula.'
      : 'Rango normal (~70-140 mg/dL): insulina y glucagón en equilibrio. Tu cuerpo funciona correctamente.';

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El <strong>feedback negativo</strong> es como un termostato: cuando una hormona sube demasiado, el cuerpo reduce su producción. Cuando baja, la activa. Así se mantiene el equilibrio (homeostasis).</p>
      </div>

      {/* Diagrama circular feedback */}
      <h3 className={styles.subSeccionTitulo}>El ciclo del feedback negativo</h3>
      <div className={styles.feedbackDiagrama}>
        <svg viewBox="0 0 340 280" className={styles.feedbackSvg} role="img" aria-label="Diagrama circular del feedback negativo: hipotálamo detecta, hipófisis envía señal, glándula produce hormona, niveles suben, hipotálamo reduce señal">
          {/* Nodos */}
          <rect x="110" y="10" width="120" height="44" rx="10" fill="#8e44ad" opacity="0.85" />
          <text x="170" y="30" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">Hipotálamo</text>
          <text x="170" y="44" textAnchor="middle" fill="#fff" fontSize="8">detecta niveles</text>

          <rect x="230" y="100" width="100" height="44" rx="10" fill="#9b59b6" opacity="0.85" />
          <text x="280" y="120" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">Hipófisis</text>
          <text x="280" y="134" textAnchor="middle" fill="#fff" fontSize="8">envía señal</text>

          <rect x="220" y="210" width="110" height="44" rx="10" fill="#2E86AB" opacity="0.85" />
          <text x="275" y="230" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">Glándula diana</text>
          <text x="275" y="244" textAnchor="middle" fill="#fff" fontSize="8">produce hormona</text>

          <rect x="10" y="210" width="110" height="44" rx="10" fill="#27ae60" opacity="0.85" />
          <text x="65" y="230" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">Niveles suben</text>
          <text x="65" y="244" textAnchor="middle" fill="#fff" fontSize="8">en sangre</text>

          <rect x="10" y="100" width="110" height="44" rx="10" fill="#e74c3c" opacity="0.85" />
          <text x="65" y="120" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">Freno</text>
          <text x="65" y="134" textAnchor="middle" fill="#fff" fontSize="8">hipotálamo reduce</text>

          {/* Flechas */}
          <path d="M230 35 Q260 35 260 70 L260 100" fill="none" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowFb)" opacity="0.5" />
          <path d="M280 144 Q280 180 275 210" fill="none" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowFb)" opacity="0.5" />
          <path d="M220 232 L120 232" fill="none" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowFb)" opacity="0.5" />
          <path d="M65 210 L65 144" fill="none" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowFb)" opacity="0.5" />
          <path d="M80 100 Q80 70 110 40" fill="none" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowFb)" opacity="0.5" />

          {/* Marcador de flecha */}
          <defs>
            <marker id="arrowFb" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6" fill="currentColor" opacity="0.5" />
            </marker>
          </defs>

          {/* Etiqueta central */}
          <text x="170" y="160" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="600" opacity="0.5">FEEDBACK</text>
          <text x="170" y="173" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="600" opacity="0.5">NEGATIVO</text>
        </svg>
      </div>

      {/* Ejemplo 1: Tiroides */}
      <h3 className={styles.subSeccionTitulo}>Ejemplo: Tiroides (TSH → T3/T4)</h3>
      <div className={styles.feedbackEjemplo}>
        <div className={styles.feedbackPasos}>
          <div className={styles.feedbackPaso}>
            <span className={styles.feedbackPasoIcono} aria-hidden="true">1️⃣</span>
            El hipotálamo libera <strong>TRH</strong> (hormona liberadora de tirotropina).
          </div>
          <div className={styles.feedbackPaso}>
            <span className={styles.feedbackPasoIcono} aria-hidden="true">2️⃣</span>
            La hipófisis responde liberando <strong>TSH</strong> (hormona estimulante del tiroides).
          </div>
          <div className={styles.feedbackPaso}>
            <span className={styles.feedbackPasoIcono} aria-hidden="true">3️⃣</span>
            La tiroides produce <strong>T3 y T4</strong> → sube el metabolismo.
          </div>
          <div className={styles.feedbackPaso}>
            <span className={styles.feedbackPasoIcono} aria-hidden="true">4️⃣</span>
            Cuando T3/T4 suben lo suficiente, el hipotálamo <strong>frena TRH</strong> → la hipófisis baja TSH → la tiroides produce menos.
          </div>
          <div className={styles.feedbackPaso}>
            <span className={styles.feedbackPasoIcono} aria-hidden="true">🔄</span>
            Si T3/T4 bajan, el hipotálamo vuelve a activar el ciclo. <strong>Equilibrio constante</strong>.
          </div>
        </div>
      </div>

      {/* Ejemplo 2: Slider glucosa */}
      <h3 className={styles.subSeccionTitulo}>Ejemplo interactivo: Glucosa en sangre</h3>
      <div className={styles.sliderZona}>
        <div className={styles.sliderLabel}>
          <span>Nivel de glucosa</span>
          <span className={styles.sliderValor}>{formatNumber(glucosa, 0)} mg/dL</span>
        </div>
        <input
          type="range"
          min="40"
          max="300"
          value={glucosa}
          onChange={(e) => setGlucosa(Number(e.target.value))}
          className={styles.sliderInput}
          aria-label="Nivel de glucosa en sangre"
        />

        <div className={styles.sliderBarras}>
          {/* Insulina */}
          <div className={styles.sliderBarraGrupo}>
            <div className={styles.sliderBarraLabel}>
              <span><span aria-hidden="true">🔵</span> Insulina (baja glucosa)</span>
              <span className={styles.sliderBarraNivel} style={{ color: '#2E86AB' }}>
                {insulinaNivel > 50 ? 'Alta' : insulinaNivel > 15 ? 'Media' : 'Baja'}
              </span>
            </div>
            <div className={styles.sliderBarraTrack}>
              <div className={styles.sliderBarraFill} style={{ width: `${insulinaNivel}%`, background: '#2E86AB' }} />
            </div>
          </div>

          {/* Glucagón */}
          <div className={styles.sliderBarraGrupo}>
            <div className={styles.sliderBarraLabel}>
              <span><span aria-hidden="true">🟠</span> Glucagón (sube glucosa)</span>
              <span className={styles.sliderBarraNivel} style={{ color: '#e67e22' }}>
                {glucagonNivel > 50 ? 'Alto' : glucagonNivel > 15 ? 'Medio' : 'Bajo'}
              </span>
            </div>
            <div className={styles.sliderBarraTrack}>
              <div className={styles.sliderBarraFill} style={{ width: `${glucagonNivel}%`, background: '#e67e22' }} />
            </div>
          </div>
        </div>

        <div className={styles.sliderEstado}>
          <p>{estadoGlucosa}</p>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El feedback negativo es el mismo principio que un <strong>termostato</strong>: cuando la casa está fría,
          se enciende la calefacción; cuando alcanza la temperatura deseada, se apaga.
          Tu cuerpo hace esto con docenas de hormonas a la vez, las 24 horas del día.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Estrés y Datos
// ─────────────────────────────────────────────

function SeccionEstres() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El <strong>eje HPA</strong> (hipotálamo-pituitaria-adrenal) es la cadena de mando del estrés. Cuando se activa crónicamente, el cortisol afecta a <strong>todo</strong> el cuerpo.</p>
      </div>

      {/* Eje HPA diagrama */}
      <h3 className={styles.subSeccionTitulo}>Eje HPA: la cadena del estrés</h3>
      <div className={styles.ejeHpaZona}>
        <svg viewBox="0 0 300 320" className={styles.ejeHpaSvg} role="img" aria-label="Diagrama del eje HPA: estrés activa hipotálamo, que libera CRH, la hipófisis libera ACTH, las suprarrenales liberan cortisol">
          {/* Estresor */}
          <rect x="90" y="5" width="120" height="36" rx="8" fill="#e74c3c" opacity="0.85" />
          <text x="150" y="20" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">ESTRÉS</text>
          <text x="150" y="34" textAnchor="middle" fill="#fff" fontSize="7.5">trabajo, peligro, ansiedad</text>

          {/* Flecha */}
          <line x1="150" y1="41" x2="150" y2="58" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowHpa)" opacity="0.5" />

          {/* Hipotálamo */}
          <rect x="85" y="58" width="130" height="40" rx="8" fill="#8e44ad" opacity="0.85" />
          <text x="150" y="75" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">Hipotálamo</text>
          <text x="150" y="90" textAnchor="middle" fill="#fff" fontSize="8">libera CRH</text>

          <line x1="150" y1="98" x2="150" y2="115" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowHpa)" opacity="0.5" />

          {/* Hipófisis */}
          <rect x="85" y="115" width="130" height="40" rx="8" fill="#9b59b6" opacity="0.85" />
          <text x="150" y="132" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">Hipófisis</text>
          <text x="150" y="147" textAnchor="middle" fill="#fff" fontSize="8">libera ACTH</text>

          <line x1="150" y1="155" x2="150" y2="172" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowHpa)" opacity="0.5" />

          {/* Suprarrenales */}
          <rect x="75" y="172" width="150" height="40" rx="8" fill="#e67e22" opacity="0.85" />
          <text x="150" y="189" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">Suprarrenales</text>
          <text x="150" y="203" textAnchor="middle" fill="#fff" fontSize="8">liberan CORTISOL</text>

          <line x1="150" y1="212" x2="150" y2="229" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowHpa)" opacity="0.5" />

          {/* Efectos */}
          <rect x="55" y="229" width="190" height="40" rx="8" fill="#2E86AB" opacity="0.85" />
          <text x="150" y="247" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">Efectos en todo el cuerpo</text>
          <text x="150" y="261" textAnchor="middle" fill="#fff" fontSize="7.5">glucosa↑ inmunidad↓ inflamación↓ energía↑</text>

          {/* Feedback negativo (flecha de vuelta) */}
          <path d="M55 249 Q20 249 20 160 Q20 70 85 70" fill="none" stroke="#e74c3c" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrowHpaRed)" opacity="0.6" />
          <text x="8" y="165" fill="currentColor" fontSize="7" fontWeight="600" opacity="0.5" transform="rotate(-90, 8, 165)">Feedback (frena)</text>

          <defs>
            <marker id="arrowHpa" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6" fill="currentColor" opacity="0.5" />
            </marker>
            <marker id="arrowHpaRed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6" fill="#e74c3c" opacity="0.6" />
            </marker>
          </defs>
        </svg>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          En una emergencia puntual, este eje te salva la vida. El problema es cuando se activa <strong>todos los días</strong>: el cortisol crónico daña múltiples sistemas.
        </p>
      </div>

      {/* Efectos del cortisol crónico */}
      <h3 className={styles.subSeccionTitulo}>Efectos del cortisol crónico</h3>
      <div className={styles.efectosGrid}>
        {EFECTOS_CORTISOL.map((e, i) => (
          <div key={i} className={styles.efectoCard}>
            <span className={styles.efectoIcono} aria-hidden="true">{e.icono}</span>
            <h4 className={styles.efectoTitulo}>{e.titulo}</h4>
            <p className={styles.efectoDesc}>{e.desc}</p>
          </div>
        ))}
      </div>

      {/* Datos curiosos */}
      <h3 className={styles.subSeccionTitulo}>Datos curiosos del sistema endocrino</h3>
      <div className={styles.datosGrid}>
        {DATOS_CURIOSOS.map((d, i) => (
          <div key={i} className={styles.datoCard}>
            <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
            <h4 className={styles.datoTitulo}>{d.titulo}</h4>
            <p className={styles.datoDesc}>{d.descripcion}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          El estrés no es &ldquo;malo&rdquo; en sí: la respuesta aguda del cortisol te da energía para afrontar un examen o huir de un peligro.
          El problema es el <strong>estrés crónico</strong> — cuando el eje HPA se queda encendido semanas o meses. Técnicas como ejercicio regular,
          meditación y sueño de calidad ayudan a <strong>resetear</strong> el sistema.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorSistemaEndocrinoPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('glandulas');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'glandulas': return <SeccionGlandulas />;
      case 'hormonas': return <SeccionHormonas />;
      case 'feedback': return <SeccionFeedback />;
      case 'estres': return <SeccionEstres />;
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
          <h1 className={styles.title}>El Sistema Endocrino</h1>
          <p className={styles.subtitle}>Glándulas, hormonas y feedback negativo — por qué el estrés afecta a todo tu cuerpo</p>
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
          title="Más sobre el sistema endocrino"
          subtitle="Preguntas frecuentes y conceptos clave"
          defaultOpen={false}
        >
          <h3>¿Qué diferencia hay entre el sistema endocrino y el nervioso?</h3>
          <p>
            El sistema nervioso envía señales eléctricas rápidas (milisegundos) a través de nervios.
            El sistema endocrino envía señales químicas (hormonas) por la sangre, más lentas (segundos a horas)
            pero con efectos más prolongados y amplios. Ambos trabajan juntos para coordinar el cuerpo.
          </p>

          <h3>¿Qué es la diabetes en términos endocrinos?</h3>
          <p>
            La <strong>diabetes tipo 1</strong> es una enfermedad autoinmune: el sistema inmune destruye las células
            beta del páncreas y se deja de producir insulina. La <strong>diabetes tipo 2</strong> ocurre cuando las células
            se vuelven resistentes a la insulina: el páncreas produce cada vez más, hasta que se agota.
          </p>

          <h3>¿Por qué el estrés crónico engorda?</h3>
          <p>
            El cortisol elevado activa la acumulación de grasa visceral (abdominal) como reserva de energía.
            Además, aumenta el apetito (especialmente por alimentos calóricos) y altera la insulina,
            favoreciendo el almacenamiento de grasa. Es un mecanismo de supervivencia que en la vida moderna
            se convierte en problema.
          </p>

          <h3>¿Las hormonas sintéticas son seguras?</h3>
          <p>
            Las hormonas sintéticas (anticonceptivos, terapia de reemplazo, insulina) son herramientas
            médicas efectivas cuando se usan bajo supervisión profesional. Imitan la acción de las hormonas
            naturales, pero su dosificación debe ser precisa. Nunca automediques con hormonas.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador simplifica conceptos de endocrinología con fines
            educativos. El sistema endocrino real es enormemente más complejo. Para decisiones sobre
            salud hormonal, consulta siempre con endocrinólogos y fuentes médicas oficiales.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-sistema-endocrino')} />
        <ShareCard appName="visualizador-sistema-endocrino" />
        <Footer appName="visualizador-sistema-endocrino" />
      </div>
    </>
  );
}
