'use client';

import { useState, useMemo } from 'react';
import styles from './PlanificadorChequeosMedicos.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, EducationalSection, DisclaimerCard, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { parseSpanishNumber } from '@/lib';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Sexo = 'hombre' | 'mujer';
type AplicaA = 'todos' | 'hombre' | 'mujer';
type CategoriaChequeo = 'general' | 'cardiovascular' | 'oncologico' | 'sensorial' | 'oseo' | 'preventivo';

interface Chequeo {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  categoria: CategoriaChequeo;
  frecuencia: string;
  aplicaA: AplicaA;
  edadDesde: number;    // edad mínima (0 = sin límite inferior)
  edadHasta: number;    // edad máxima (150 = sin límite superior)
  nota?: string;        // contexto adicional
  fuente: string;
}

// ─── Datos de chequeos (Ministerio de Sanidad / SEMFyC) ───────────────────────

const CHEQUEOS: Chequeo[] = [
  // ── GENERAL ──────────────────────────────────────────────────────────────
  {
    id: 'analitica',
    nombre: 'Analítica de sangre general',
    descripcion: 'Hemograma, glucosa, colesterol, función renal y hepática.',
    icono: '🩸',
    categoria: 'general',
    frecuencia: 'Anual',
    aplicaA: 'todos',
    edadDesde: 18,
    edadHasta: 150,
    fuente: 'SEMFyC',
  },
  {
    id: 'revision-general',
    nombre: 'Revisión médica general',
    descripcion: 'Consulta con tu médico de cabecera para valoración global de salud.',
    icono: '💊',
    categoria: 'general',
    frecuencia: 'Anual',
    aplicaA: 'todos',
    edadDesde: 18,
    edadHasta: 150,
    fuente: 'SEMFyC',
  },
  {
    id: 'tension',
    nombre: 'Control de tensión arterial',
    descripcion: 'Medición de tensión sistólica y diastólica en adultos.',
    icono: '❤️',
    categoria: 'cardiovascular',
    frecuencia: 'Anual',
    aplicaA: 'todos',
    edadDesde: 18,
    edadHasta: 150,
    fuente: 'ESH/ESC 2018',
  },
  // ── SENSORIAL ─────────────────────────────────────────────────────────────
  {
    id: 'dental',
    nombre: 'Revisión dental',
    descripcion: 'Control de caries, encías y higiene bucal.',
    icono: '🦷',
    categoria: 'sensorial',
    frecuencia: 'Anual',
    aplicaA: 'todos',
    edadDesde: 18,
    edadHasta: 150,
    fuente: 'SEOC',
  },
  {
    id: 'vision',
    nombre: 'Revisión visual (optometría)',
    descripcion: 'Control de agudeza visual y detección de defectos de refracción.',
    icono: '👁️',
    categoria: 'sensorial',
    frecuencia: 'Cada 2 años',
    aplicaA: 'todos',
    edadDesde: 18,
    edadHasta: 150,
    fuente: 'SEEOF',
  },
  // ── CARDIOVASCULAR ───────────────────────────────────────────────────────
  {
    id: 'colesterol',
    nombre: 'Control de colesterol y lípidos',
    descripcion: 'Perfil lipídico: LDL, HDL, triglicéridos y colesterol total.',
    icono: '🫀',
    categoria: 'cardiovascular',
    frecuencia: 'Cada 5 años (o anual si hay factores de riesgo)',
    aplicaA: 'todos',
    edadDesde: 20,
    edadHasta: 150,
    nota: 'Más frecuente a partir de los 40 si hay antecedentes familiares, tabaquismo u obesidad.',
    fuente: 'SEA / SEMFyC',
  },
  {
    id: 'glucosa',
    nombre: 'Control de glucosa (diabetes tipo 2)',
    descripcion: 'Detección precoz de prediabetes y diabetes mediante glucosa en ayunas.',
    icono: '🍬',
    categoria: 'cardiovascular',
    frecuencia: 'Cada 3 años',
    aplicaA: 'todos',
    edadDesde: 45,
    edadHasta: 150,
    nota: 'Antes si existe obesidad, hipertensión o antecedentes familiares.',
    fuente: 'SED / ADA',
  },
  {
    id: 'tension-ocular',
    nombre: 'Tensión ocular (glaucoma)',
    descripcion: 'Medición de presión intraocular para detectar glaucoma precoz.',
    icono: '🔭',
    categoria: 'sensorial',
    frecuencia: 'Cada 2 años',
    aplicaA: 'todos',
    edadDesde: 40,
    edadHasta: 150,
    fuente: 'SEEOF',
  },
  // ── ONCOLÓGICO ───────────────────────────────────────────────────────────
  {
    id: 'dermato',
    nombre: 'Revisión dermatológica (lunares)',
    descripcion: 'Exploración de lunares y lesiones cutáneas para detección precoz de melanoma.',
    icono: '🌞',
    categoria: 'oncologico',
    frecuencia: 'Cada 2 años',
    aplicaA: 'todos',
    edadDesde: 18,
    edadHasta: 150,
    nota: 'Anual si tienes muchos nevos, fototipo bajo o antecedentes familiares.',
    fuente: 'AEDV',
  },
  {
    id: 'citologia',
    nombre: 'Citología vaginal / PAP test',
    descripcion: 'Cribado de cáncer de cuello de útero (VPH y células anómalas).',
    icono: '🔬',
    categoria: 'oncologico',
    frecuencia: 'Cada 3-5 años',
    aplicaA: 'mujer',
    edadDesde: 25,
    edadHasta: 65,
    nota: 'Desde los 25 hasta los 65 años. La frecuencia depende del resultado previo.',
    fuente: 'Ministerio de Sanidad',
  },
  {
    id: 'mamografia',
    nombre: 'Mamografía (cáncer de mama)',
    descripcion: 'Cribado mediante mamografía bilateral para detección precoz.',
    icono: '🩻',
    categoria: 'oncologico',
    frecuencia: 'Cada 2 años',
    aplicaA: 'mujer',
    edadDesde: 50,
    edadHasta: 69,
    nota: 'El Programa de Cribado de Cáncer de Mama del SNS cita a las mujeres de 50 a 69 años (cartera común, Orden SSI/2065/2014). Algunas comunidades han empezado a invitar desde los 45: consúltalo en la tuya.',
    fuente: 'Ministerio de Sanidad',
  },
  {
    id: 'colorrectal',
    nombre: 'Sangre oculta en heces (cáncer colorrectal)',
    descripcion: 'Cribado de cáncer colorrectal mediante test de sangre oculta en heces.',
    icono: '🔬',
    categoria: 'oncologico',
    frecuencia: 'Cada 2 años',
    aplicaA: 'todos',
    edadDesde: 50,
    edadHasta: 69,
    nota: 'El Programa de Cribado de Cáncer Colorrectal del SNS cita a hombres y mujeres de 50 a 69 años (cartera común, Orden SSI/2065/2014). Pasados los 69 la decisión se individualiza con tu médico.',
    fuente: 'Ministerio de Sanidad',
  },
  {
    id: 'prostata',
    nombre: 'Próstata: NO hay cribado poblacional',
    descripcion: 'Valoración de síntomas urinarios cuando aparecen. El PSA no es una prueba de cribado sistemático.',
    icono: '🩺',
    categoria: 'oncologico',
    aplicaA: 'hombre',
    frecuencia: 'Solo si hay síntomas o lo indica tu médico',
    edadDesde: 50,
    edadHasta: 150,
    nota: 'El PAPPS/semFYC recomienda EN CONTRA de ofrecer el PSA de forma sistemática a varones sin síntomas: detecta tumores que nunca habrían dado problemas y lleva a biopsias y tratamientos con efectos adversos. No forma parte de los programas de cribado del SNS. Si tienes síntomas urinarios o antecedentes familiares, coméntalo con tu médico.',
    fuente: 'PAPPS-semFYC / AEU',
  },
  // ── ÓSEO ─────────────────────────────────────────────────────────────────
  {
    id: 'densitometria',
    nombre: 'Densitometría ósea (osteoporosis)',
    descripcion: 'Medición de densidad mineral ósea para detectar osteoporosis.',
    icono: '🦴',
    categoria: 'oseo',
    frecuencia: 'Cada 2-4 años',
    aplicaA: 'mujer',
    edadDesde: 65,
    edadHasta: 150,
    nota: 'Antes si hay factores de riesgo: corticoides, menopausia precoz, bajo peso corporal.',
    fuente: 'SEIOMM',
  },
  // ── PREVENTIVO / VACUNAS ─────────────────────────────────────────────────
  {
    id: 'vacuna-gripe',
    nombre: 'Vacuna antigripal',
    descripcion: 'Vacunación anual frente a la gripe (campaña de otoño).',
    icono: '💉',
    categoria: 'preventivo',
    frecuencia: 'Anual (octubre-noviembre)',
    aplicaA: 'todos',
    edadDesde: 65,
    edadHasta: 150,
    nota: 'También recomendada antes de los 65 si hay enfermedades crónicas, embarazo o trabajo sanitario.',
    fuente: 'Ministerio de Sanidad',
  },
  {
    id: 'vacuna-tetanos',
    nombre: 'Vacuna tétanos-difteria (Td)',
    descripcion: 'Recuerdo de la vacunación frente a tétanos y difteria.',
    icono: '💉',
    categoria: 'preventivo',
    frecuencia: 'Cada 10 años',
    aplicaA: 'todos',
    edadDesde: 18,
    edadHasta: 150,
    fuente: 'Ministerio de Sanidad',
  },
];

// ─── Configuración de categorías ────────────────────────────────────────────

const CATEGORIA_CONFIG: Record<CategoriaChequeo, { nombre: string; icono: string }> = {
  general:       { nombre: 'General',          icono: '🏥' },
  cardiovascular:{ nombre: 'Cardiovascular',   icono: '❤️' },
  oncologico:    { nombre: 'Oncológico',        icono: '🔬' },
  sensorial:     { nombre: 'Sensorial',         icono: '👁️' },
  oseo:          { nombre: 'Óseo',              icono: '🦴' },
  preventivo:    { nombre: 'Preventivo',        icono: '💉' },
};

const EDAD_MINIMA = 18;
const EDAD_MAXIMA = 110;

// ─── Lógica de filtrado ───────────────────────────────────────────────────────

/**
 * ⚠️ 2026-09-21 (hallazgos 1141, 1142 y 1145 del Inspector): esto filtraba por TRAMOS
 *    («18-39», «40-49», «50-64», «65+») y cada tramo se evaluaba con una edad
 *    representativa fija, su punto medio. Las consecuencias iban en los dos sentidos y
 *    sobre cribados poblacionales:
 *
 *      · El tramo abierto «65+» valía siempre 70, así que a una mujer de 66 —de lleno
 *        en el programa de mama— no se le ofrecía la mamografía, y a una de 65 no se le
 *        ofrecía la citología en su último año de programa. Falsos negativos, y la app
 *        no daba ninguna forma de expresar esa edad.
 *      · «40-49» valía 45, así que a los 40 se ofrecían mamografía y control de glucosa
 *        que el propio catálogo arranca a los 45; y a los 75, 85 o 95 se seguía ofreciendo
 *        la sangre oculta en heces como programa del SNS.
 *
 *    El h1 promete «qué revisiones te corresponden según tu edad», así que la edad se
 *    pregunta y se usa tal cual. La misma razón vale para el sexo: «Sin especificar»
 *    dejaba pasar TODO lo exclusivo de un sexo y ponía en pantalla a la vez una tarjeta
 *    «Solo mujeres» y otra «Solo hombres».
 */
function filtrarChequeos(chequeos: Chequeo[], edad: number, sexo: Sexo): Chequeo[] {
  return chequeos.filter(c => {
    const edadOk = edad >= c.edadDesde && edad <= c.edadHasta;
    const sexoOk = c.aplicaA === 'todos' || c.aplicaA === sexo;
    return edadOk && sexoOk;
  });
}

// ─── Componente tarjeta de chequeo ───────────────────────────────────────────

interface TarjetaChequeoProps {
  chequeo: Chequeo;
  alDia: boolean;
  onToggle: () => void;
}

function TarjetaChequeo({ chequeo, alDia, onToggle }: TarjetaChequeoProps) {
  const catConfig = CATEGORIA_CONFIG[chequeo.categoria];
  return (
    <div className={`${styles.tarjeta} ${alDia ? styles.tarjetaAlDia : ''}`}>
      <div className={styles.tarjetaCabecera}>
        <span className={styles.tarjetaIcono} aria-hidden="true">{chequeo.icono}</span>
        <div className={styles.tarjetaInfo}>
          <h3 className={styles.tarjetaNombre}>{chequeo.nombre}</h3>
          <div className={styles.tarjetaMeta}>
            <span className={styles.badge}><span aria-hidden="true">{catConfig.icono}</span> {catConfig.nombre}</span>
            <span className={styles.frecuencia}><span aria-hidden="true">⏱</span> {chequeo.frecuencia}</span>
            {chequeo.aplicaA !== 'todos' && (
              <span className={`${styles.badge} ${styles.badgeSexo}`}>
                {chequeo.aplicaA === 'mujer' ? '♀ Solo mujeres' : '♂ Solo hombres'}
              </span>
            )}
          </div>
        </div>
        <label className={styles.checkLabel} title={alDia ? 'Marcar como pendiente' : 'Marcar como al día'}>
          <input
            type="checkbox"
            className={styles.checkInput}
            checked={alDia}
            onChange={onToggle}
            aria-label={`${chequeo.nombre}: ${alDia ? 'al día' : 'pendiente'}`}
          />
          <span className={`${styles.checkBox} ${alDia ? styles.checkBoxAlDia : ''}`} aria-hidden="true">
            {alDia ? '✓' : ''}
          </span>
        </label>
      </div>

      <p className={styles.tarjetaDescripcion}>{chequeo.descripcion}</p>

      {chequeo.nota && (
        <p className={styles.tarjetaNota}><span aria-hidden="true">ℹ️</span> {chequeo.nota}</p>
      )}

      <p className={styles.tarjetaFuente}>Fuente: {chequeo.fuente}</p>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PlanificadorChequeosMedicos() {
  // Arranca VACÍO: la app no contesta hasta que le preguntan (hallazgo 1145).
  const [edadTexto, setEdadTexto] = useState('');
  const [sexo, setSexo] = useState<Sexo | null>(null);
  const [checkados, setCheckados] = useState<Set<string>>(new Set());

  const edad = useMemo(() => {
    const n = parseSpanishNumber(edadTexto);
    if (Number.isNaN(n) || n < EDAD_MINIMA || n > EDAD_MAXIMA) return null;
    return Math.floor(n);
  }, [edadTexto]);

  const perfilCompleto = edad !== null && sexo !== null;
  const edadInvalida = edadTexto.trim() !== '' && edad === null;

  const chequeosAplicables = useMemo(
    () => (perfilCompleto ? filtrarChequeos(CHEQUEOS, edad, sexo) : []),
    [perfilCompleto, edad, sexo],
  );

  const totalAlDia = chequeosAplicables.filter(c => checkados.has(c.id)).length;
  const totalAplicables = chequeosAplicables.length;
  const porcentaje = totalAplicables > 0 ? Math.round((totalAlDia / totalAplicables) * 100) : 0;

  function toggleCheck(id: string) {
    setCheckados(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Agrupar por categoría para mostrar en secciones
  const porCategoria = useMemo(() => {
    const mapa = new Map<CategoriaChequeo, Chequeo[]>();
    for (const c of chequeosAplicables) {
      if (!mapa.has(c.categoria)) mapa.set(c.categoria, []);
      mapa.get(c.categoria)!.push(c);
    }
    return mapa;
  }, [chequeosAplicables]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitulo}>Chequeos Médicos Preventivos</h1>
        <p className={styles.heroSubtitulo}>
          Consulta qué revisiones te corresponden según tu edad y sexo · Guías clínicas españolas
        </p>
      </header>

      <LegalNotice />

      {/* Aviso médico */}
      <div className={styles.disclaimerWrapper}>
        <DisclaimerCard
          variant="medical"
          severity="critical"
          title="Información orientativa — Consulta siempre a tu médico"
          collapsible={false}
        >
          <p>
            Esta guía se basa en las recomendaciones del <strong>Ministerio de Sanidad de España</strong>,
            la <strong>SEMFyC</strong> y sociedades médicas especializadas, pero <strong>no sustituye
            la consulta con tu médico de cabecera</strong>. La frecuencia y necesidad de cada revisión
            puede variar según tu historial clínico, factores de riesgo y criterio médico individual.
          </p>
        </DisclaimerCard>
      </div>

      {/* Síntomas de alarma — FUERA del bloque colapsable: una advertencia de salud no
          es maquetación, y en una app cuyo mensaje es «espera a tu próxima revisión» la
          lista de lo que NO debe esperar es la pieza que más necesita verse (hallazgo 1146). */}
      <div className={styles.warningBox} role="note">
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
          <h2>Síntomas que no deben esperar a la próxima revisión</h2>
        </div>
        <ul className={styles.warningList}>
          <li>Dolor torácico, dificultad para respirar o palpitaciones irregulares → urgencias</li>
          <li>Pérdida de peso involuntaria mayor al 5% en 6 meses sin causa conocida</li>
          <li>Sangrado rectal, urinario o vaginal no esperado</li>
          <li>Bulto o nódulo nuevo en mama, testículo, cuello o axila</li>
          <li>Cambio en lunares (tamaño, color, bordes irregulares) → dermatología</li>
          <li>Tos persistente más de 3 semanas, especialmente con sangre o en fumadores</li>
        </ul>
      </div>

      {/* Filtros */}
      <div className={styles.filtrosCard}>
        <div className={styles.filtroGrupo}>
          <label className={styles.filtroLabel} htmlFor="edad">Tu edad:</label>
          <input
            id="edad"
            type="text"
            inputMode="numeric"
            className={styles.edadInput}
            placeholder={`Ej: 66 (entre ${EDAD_MINIMA} y ${EDAD_MAXIMA})`}
            value={edadTexto}
            onChange={e => setEdadTexto(e.target.value)}
            aria-describedby="edad-ayuda"
          />
          <p id="edad-ayuda" className={styles.filtroAyuda}>
            La edad exacta, no un tramo: los programas de cribado empiezan y terminan en
            un año concreto.
          </p>
        </div>

        <div className={styles.filtroGrupo}>
          <span className={styles.filtroLabel}>Sexo biológico:</span>
          <div className={styles.filtroOpciones} role="group" aria-label="Sexo biológico">
            {([['mujer', '♀ Mujer'], ['hombre', '♂ Hombre']] as [Sexo, string][]).map(([val, label]) => (
              <button
                key={val}
                type="button"
                className={`${styles.filtroBtn} ${sexo === val ? styles.filtroBtnActivo : ''}`}
                onClick={() => setSexo(val)}
                aria-pressed={sexo === val}
              >
                {label}
              </button>
            ))}
          </div>
          <p className={styles.filtroAyuda}>
            Hace falta para saber si te corresponden la mamografía, la citología o la
            densitometría, que son distintas según el sexo.
          </p>
        </div>

        {edadInvalida && (
          <div role="alert" aria-live="polite" className={styles.avisoEdad}>
            <span aria-hidden="true">⚠️</span> Escribe una edad entre {EDAD_MINIMA} y {EDAD_MAXIMA} años.
            Esta guía cubre revisiones de personas adultas.
          </div>
        )}
      </div>

      {/* Resumen / progreso */}
      {!perfilCompleto ? (
        <div className={styles.resumen} role="status">
          <div className={styles.resumenTexto}>
            Escribe tu edad y elige el sexo biológico para ver qué revisiones te
            corresponden. Sin esos dos datos no hay nada que contar: los cribados
            del SNS dependen precisamente de ellos.
          </div>
        </div>
      ) : (
      <div className={styles.resumen}>
        <div className={styles.resumenTexto}>
          <strong>{totalAplicables}</strong>{' '}
          {totalAplicables === 1 ? 'revisión aplicable' : 'revisiones aplicables'} a los {edad} años
          {totalAlDia > 0 && (
            <span className={styles.resumenAlDia}>
              {' · '}<strong>{totalAlDia}</strong>{' '}
              {totalAlDia === 1 ? 'marcada' : 'marcadas'} como al día
            </span>
          )}
        </div>
        {totalAlDia > 0 && (
          <div className={styles.progresoBarra} role="progressbar" aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100} aria-label={`${porcentaje}% al día`}>
            <div className={styles.progresoRelleno} style={{ width: `${porcentaje}%` }} />
          </div>
        )}
        {totalAlDia === totalAplicables && totalAplicables > 0 && (
          <p className={styles.resumenCompleto} role="status">
            <span aria-hidden="true">✅</span> ¡Tienes todas las revisiones de tu perfil al día!
          </p>
        )}
      </div>
      )}

      {/* Listado por categorías */}
      <div className={styles.listado}>
        {!perfilCompleto ? null : porCategoria.size === 0 ? (
          <p className={styles.sinResultados}>
            Con los datos indicados no queda ninguna revisión de esta guía. No significa que
            no haya nada que hacer: a partir de cierta edad las decisiones se individualizan
            con el médico de cabecera en vez de seguir un programa por edad.
          </p>
        ) : (
          Array.from(porCategoria.entries()).map(([cat, chequeos]) => {
            const catConfig = CATEGORIA_CONFIG[cat];
            return (
              <section key={cat} className={styles.categoria}>
                <h2 className={styles.categoriaTitulo}>
                  <span aria-hidden="true">{catConfig.icono}</span> {catConfig.nombre}
                </h2>
                <div className={styles.categoriaGrid}>
                  {chequeos.map(c => (
                    <TarjetaChequeo
                      key={c.id}
                      chequeo={c}
                      alDia={checkados.has(c.id)}
                      onToggle={() => toggleCheck(c.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>

      <EducationalSection
        title="Guía completa de medicina preventiva"
        subtitle="Chequeos recomendados por edad, cribados del SNS y cómo organizarte"
        icon="🏥"
      >
        {/* Tabla comparativa: chequeos por franja de edad */}
        <h2>Chequeos clave por franja de edad</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.tablaComparativa}>
            <thead>
              <tr>
                <th>Franja de edad</th>
                <th>Chequeos prioritarios</th>
                <th>Cribados SNS</th>
                <th>Frecuencia</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>18-39 años</td>
                <td>Tensión arterial, IMC, colesterol, salud sexual</td>
                <td>Cérvix: citología/VPH en mujeres de 25 a 65</td>
                <td>Cada 1-3 años</td>
              </tr>
              <tr>
                <td>40-49 años</td>
                <td>Glucemia en ayunas (desde los 45), tensión ocular, visión/audición</td>
                <td>Cérvix (25-65). La mamografía aún no: el programa empieza a los 50</td>
                <td>Cada 1-2 años</td>
              </tr>
              <tr>
                <td>50-64 años</td>
                <td>Densitometría si hay factores de riesgo, control de glucosa</td>
                <td>Mama (50-69) · colorrectal (50-69) · cérvix hasta los 65</td>
                <td>Cada 2 años los tres cribados</td>
              </tr>
              <tr>
                <td>65-69 años</td>
                <td>Deterioro cognitivo, caídas, audición, función renal, densitometría</td>
                <td>Mama y colorrectal hasta los 69, último año de programa</td>
                <td>Anual la revisión; cada 2 años los cribados</td>
              </tr>
              <tr>
                <td>70+ años</td>
                <td>Valoración geriátrica integral, polifarmacia, visión</td>
                <td>Fuera de los tres programas: se individualiza con el médico</td>
                <td>Según estado de salud</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={styles.tablaNota}>
          Los tres cribados poblacionales del SNS son mama (mujeres de 50 a 69),
          colorrectal (50 a 69, ambos sexos) y cérvix (mujeres de 25 a 65), según la
          cartera común de servicios (RD 1030/2006, en la redacción de la Orden
          SSI/2065/2014). Son los únicos que llegan por carta de citación. El PSA de
          próstata <strong>no</strong> es uno de ellos: el PAPPS/semFYC recomienda en
          contra de ofrecerlo sistemáticamente a varones sin síntomas.
        </p>

        {/* Casos de uso */}
        <h2>Casos reales de prevención efectiva</h2>
        <div className={styles.casosGrid}>
          <div className={styles.casoCard}>
            <div className={styles.casoHeader}>
              <span className={styles.casoEmoji} aria-hidden="true">👨‍💼</span>
              <h3>Hombre 45 años, sedentario</h3>
              <span className={styles.casoTag}>Cardiovascular</span>
            </div>
            <p>Carlos, ejecutivo con estrés laboral, nunca había hecho analíticas. Un chequeo rutinario detecta colesterol 280 mg/dL y glucemia 118 mg/dL (prediabetes). Cambia dieta y hace ejercicio.</p>
            <p className={styles.casoResultado}><span aria-hidden="true">✅</span> Evita evento cardiovascular en 5-10 años</p>
          </div>
          <div className={styles.casoCard}>
            <div className={styles.casoHeader}>
              <span className={styles.casoEmoji} aria-hidden="true">👩</span>
              <h3>Mujer 52 años, menopausia</h3>
              <span className={styles.casoTag}>Cribado SNS</span>
            </div>
            <p>Marta recibe carta del programa de cribado de mama. En la mamografía encuentran una lesión de 8 mm en estadio I. Tratamiento conservador con alta probabilidad de curación.</p>
            <p className={styles.casoResultado}><span aria-hidden="true">✅</span> Detección precoz = mejor pronóstico</p>
          </div>
          <div className={styles.casoCard}>
            <div className={styles.casoHeader}>
              <span className={styles.casoEmoji} aria-hidden="true">👴</span>
              <h3>Hombre 68 años, fumador ex</h3>
              <span className={styles.casoTag}>Respiratorio</span>
            </div>
            <p>Antonio, exfumador de 40 paquetes-año, consulta por tos persistente. La espirometría revela una EPOC moderada no diagnosticada. Pregunta por el cribado de cáncer de pulmón con TC de baja dosis y su médico le explica que <strong>en España no es un programa poblacional</strong>: solo existen proyectos piloto, y fuera de ellos se valora caso por caso.</p>
            <p className={styles.casoResultado}><span aria-hidden="true">✅</span> Tratamiento precoz frena el deterioro</p>
          </div>
          <div className={styles.casoCard}>
            <div className={styles.casoHeader}>
              <span className={styles.casoEmoji} aria-hidden="true">👧</span>
              <h3>Mujer 28 años, antecedentes familiares</h3>
              <span className={styles.casoTag}>Genética</span>
            </div>
            <p>Sara tiene madre y abuela con cáncer de mama. Su médico la deriva a la Unidad de Consejo Genético que estudia mutación BRCA. Con resultado positivo inicia seguimiento intensificado.</p>
            <p className={styles.casoResultado}><span aria-hidden="true">✅</span> Vigilancia precoz individualizada</p>
          </div>
        </div>

        {/* FAQ */}
        <h2>Preguntas frecuentes sobre chequeos médicos</h2>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Necesito pagar un chequeo privado si tengo tarjeta sanitaria?</h4>
            <p>No para los cribados del SNS (mama, colon, cuello uterino): son gratuitos y el sistema te avisará cuando corresponda. Para pruebas adicionales no incluidas en la cartera pública (como revisiones de empresa), sí puede requerirse privada o mutua laboral.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Con qué frecuencia debo hacerme analíticas de sangre?</h4>
            <p>Para adultos sanos sin factores de riesgo, cada 2-3 años hasta los 40, luego anual. Con hipertensión, diabetes, dislipemia o antecedentes, el médico establecerá la frecuencia según tu caso particular.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Debo ir a urgencias si tengo una duda sobre un resultado?</h4>
            <p>No, las urgencias son para situaciones que no pueden esperar. Para interpretar resultados de analíticas o revisiones, pide cita con tu médico de cabecera, que conoce tu historial completo y puede contextualizar los valores.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Tiene sentido hacerse pruebas genéticas de salud en Internet?</h4>
            <p>Las pruebas genéticas de consumo directo tienen limitaciones importantes y pueden generar ansiedad sin base clínica. Si tienes antecedentes familiares relevantes, lo correcto es solicitar derivación a la Unidad de Consejo Genético de tu hospital de referencia.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Los chequeos de empresa son suficientes?</h4>
            <p>Los reconocimientos médicos laborales evalúan la aptitud para el puesto de trabajo específico, no son un chequeo integral de salud. Son un complemento, no un sustituto de la revisión con tu médico de cabecera.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿A qué edad debo empezar con el chequeo cardiovascular?</h4>
            <p>La tensión arterial se mide desde la infancia/adolescencia. El perfil lipídico (colesterol) se recomienda por primera vez a los 20 años, o antes si hay antecedentes familiares de enfermedad cardiovascular precoz.</p>
          </div>
        </div>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo organizarte para no saltarte ningún chequeo</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Haz una lista de tus antecedentes personales y familiares</strong>
                <p>Hipertensión, diabetes, enfermedades cardiovasculares, cánceres hereditarios. Esto define qué pruebas son prioritarias para ti.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Revisa qué chequeos tienes pendientes según tu edad</strong>
                <p>Usa este planificador como referencia. Marca los que ya tienes al día y los que necesitas solicitar próximamente.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Pide cita con tu médico de cabecera</strong>
                <p>Lleva tu lista de chequeos pendientes. El médico decidirá cuáles son prioritarios y solicitará las pruebas pertinentes desde el SNS.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Atiende las cartas de cribado del SNS</strong>
                <p>Los programas de cribado de mama y colorrectal envían citaciones periódicas. No las ignores: son pruebas con evidencia sólida de reducción de mortalidad.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Registra las fechas de tus últimas pruebas</strong>
                <p>Guarda los informes en un lugar accesible (carpeta física o digital). Facilita mucho la comunicación con cualquier médico especialista.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Programa recordatorios para las revisiones anuales</strong>
                <p>Pon una alarma recurrente en el calendario para tu cumpleaños o inicio de año: es el mejor momento para revisar qué chequeos te corresponden ese año.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Mejores prácticas */}
        <h2>Hábitos que potencian la eficacia de tus chequeos</h2>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">📋</div>
            <h4>Lleva un historial propio</h4>
            <p>Guarda todos tus informes médicos. Tener acceso rápido a resultados anteriores permite comparar evolución.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">🩸</div>
            <h4>Ayuno correcto para analíticas</h4>
            <p>8-12 horas de ayuno para glucemia y triglicéridos fiables. Puedes beber agua, pero no café ni zumos.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">💊</div>
            <h4>Comunica tu medicación</h4>
            <p>Informa siempre de todos los medicamentos, suplementos y vitaminas que tomas. Algunos alteran resultados.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">🏃</div>
            <h4>Prevención activa</h4>
            <p>No fumar, 150 min/semana de ejercicio moderado, dieta mediterránea y peso saludable reducen el 80% de las enfermedades crónicas.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">🦷</div>
            <h4>No olvides la salud bucodental</h4>
            <p>Revisión dental anual: la enfermedad periodontal se asocia a mayor riesgo cardiovascular y de diabetes.</p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">🧠</div>
            <h4>Salud mental también es salud</h4>
            <p>El cribado de depresión está recomendado en atención primaria. No dudes en comentar a tu médico cómo te sientes emocionalmente.</p>
          </div>
        </div>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('planificador-chequeos-medicos')} />
      <ShareCard appName="planificador-chequeos-medicos" />
      <Footer appName="planificador-chequeos-medicos" />
    </div>
  );
}
