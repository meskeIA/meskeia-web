'use client';

import { useState, useMemo } from 'react';
import styles from './PlanificadorChequeosMedicos.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, EducationalSection, DisclaimerCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type GrupoEdad = '18-39' | '40-49' | '50-64' | '65+';
type Sexo = 'todos' | 'hombre' | 'mujer';
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
    edadDesde: 45,
    edadHasta: 69,
    nota: 'Incluida en el Programa de Cribado de Cáncer de Mama del SNS.',
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
    edadHasta: 74,
    nota: 'Incluido en el Programa de Cribado de Cáncer Colorrectal del SNS.',
    fuente: 'Ministerio de Sanidad',
  },
  {
    id: 'prostata',
    nombre: 'Revisión de próstata',
    descripcion: 'Valoración de síntomas urinarios y, si el médico lo indica, PSA en sangre.',
    icono: '🩺',
    categoria: 'oncologico',
    aplicaA: 'hombre',
    frecuencia: 'Según criterio médico',
    edadDesde: 50,
    edadHasta: 150,
    nota: 'Consulta a tu médico. El cribado con PSA es controvertido y debe valorarse individualmente.',
    fuente: 'EAU / SEF',
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

// Edad representativa de cada grupo para filtrar
const EDAD_REPR: Record<GrupoEdad, number> = {
  '18-39': 30,
  '40-49': 45,
  '50-64': 55,
  '65+':   70,
};

const GRUPOS_EDAD: GrupoEdad[] = ['18-39', '40-49', '50-64', '65+'];

// ─── Lógica de filtrado ───────────────────────────────────────────────────────

function filtrarChequeos(
  chequeos: Chequeo[],
  grupo: GrupoEdad,
  sexo: Sexo,
): Chequeo[] {
  const edad = EDAD_REPR[grupo];
  return chequeos.filter(c => {
    const edadOk = edad >= c.edadDesde && edad <= c.edadHasta;
    const sexoOk =
      c.aplicaA === 'todos' ||
      sexo === 'todos' ||
      c.aplicaA === sexo;
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
            <span className={styles.badge}>{catConfig.icono} {catConfig.nombre}</span>
            <span className={styles.frecuencia}>⏱ {chequeo.frecuencia}</span>
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
        <p className={styles.tarjetaNota}>ℹ️ {chequeo.nota}</p>
      )}

      <p className={styles.tarjetaFuente}>Fuente: {chequeo.fuente}</p>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PlanificadorChequeosMedicos() {
  const [grupoEdad, setGrupoEdad] = useState<GrupoEdad>('40-49');
  const [sexo, setSexo] = useState<Sexo>('todos');
  const [checkados, setCheckados] = useState<Set<string>>(new Set());

  const chequeosAplicables = useMemo(
    () => filtrarChequeos(CHEQUEOS, grupoEdad, sexo),
    [grupoEdad, sexo],
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
          severity="medium"
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

      {/* Filtros */}
      <div className={styles.filtrosCard}>
        <div className={styles.filtroGrupo}>
          <span className={styles.filtroLabel}>Tu grupo de edad:</span>
          <div className={styles.filtroOpciones} role="group" aria-label="Grupo de edad">
            {GRUPOS_EDAD.map(g => (
              <button
                key={g}
                type="button"
                className={`${styles.filtroBtn} ${grupoEdad === g ? styles.filtroBtnActivo : ''}`}
                onClick={() => setGrupoEdad(g)}
                aria-pressed={grupoEdad === g}
              >
                {g} años
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filtroGrupo}>
          <span className={styles.filtroLabel}>Sexo biológico:</span>
          <div className={styles.filtroOpciones} role="group" aria-label="Sexo biológico">
            {([['todos', 'Sin especificar'], ['mujer', '♀ Mujer'], ['hombre', '♂ Hombre']] as [Sexo, string][]).map(([val, label]) => (
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
        </div>
      </div>

      {/* Resumen / progreso */}
      <div className={styles.resumen}>
        <div className={styles.resumenTexto}>
          <strong>{totalAplicables}</strong> revisiones aplicables a tu perfil
          {totalAlDia > 0 && (
            <span className={styles.resumenAlDia}> · <strong>{totalAlDia}</strong> marcadas como al día</span>
          )}
        </div>
        {totalAlDia > 0 && (
          <div className={styles.progresoBarra} role="progressbar" aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100} aria-label={`${porcentaje}% al día`}>
            <div className={styles.progresoRelleno} style={{ width: `${porcentaje}%` }} />
          </div>
        )}
        {totalAlDia === totalAplicables && totalAplicables > 0 && (
          <p className={styles.resumenCompleto} role="status">
            ✅ ¡Tienes todas las revisiones de tu perfil al día!
          </p>
        )}
      </div>

      {/* Listado por categorías */}
      <div className={styles.listado}>
        {porCategoria.size === 0 ? (
          <p className={styles.sinResultados}>No hay revisiones para el perfil seleccionado.</p>
        ) : (
          Array.from(porCategoria.entries()).map(([cat, chequeos]) => {
            const catConfig = CATEGORIA_CONFIG[cat];
            return (
              <section key={cat} className={styles.categoria}>
                <h2 className={styles.categoriaTitulo}>
                  {catConfig.icono} {catConfig.nombre}
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
        title="¿Qué es la medicina preventiva?"
        subtitle="Por qué los chequeos regulares son importantes aunque te encuentres bien"
        icon="🏥"
      >
        <h3>Prevención primaria y secundaria</h3>
        <p>
          La medicina preventiva actúa antes de que aparezca la enfermedad (<strong>prevención primaria</strong>,
          como las vacunas) o detecta enfermedades en fases muy tempranas cuando son más tratables
          (<strong>prevención secundaria</strong>, como los cribados de cáncer).
        </p>

        <h3>¿Por qué seguir las guías clínicas?</h3>
        <p>
          Las recomendaciones de revisiones están respaldadas por evidencia científica y priorizan
          las pruebas con mejor relación beneficio-riesgo. No todas las pruebas son útiles en todos
          los grupos de edad: por eso las guías establecen a partir de qué edad y con qué frecuencia
          deben realizarse.
        </p>

        <h3>El papel del médico de cabecera</h3>
        <p>
          Tu médico de cabecera es quien mejor conoce tu historial y puede ajustar estas recomendaciones
          a tu situación particular: antecedentes familiares, hábitos, medicación o enfermedades crónicas.
          Esta guía es un punto de partida, no un sustituto de esa relación.
        </p>

        <h3>Cribados del Sistema Nacional de Salud (SNS)</h3>
        <ul>
          <li><strong>Cáncer colorrectal</strong>: sangre oculta en heces cada 2 años entre 50 y 74 años.</li>
          <li><strong>Cáncer de mama</strong>: mamografía cada 2 años entre 45/50 y 69/70 años (varía por comunidad).</li>
          <li><strong>Cáncer de cuello de útero</strong>: citología/test VPH cada 3-5 años entre 25 y 65 años.</li>
          <li>Estos programas son <strong>gratuitos y accesibles</strong> a través de la sanidad pública española.</li>
        </ul>

        <h3>Las marcas «al día» son orientativas</h3>
        <p>
          Los checks en esta herramienta son solo un recordatorio visual de sesión. No se guardan ni
          se procesan. Su único propósito es ayudarte a identificar qué revisiones tienes pendientes
          durante la consulta de esta guía.
        </p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('planificador-chequeos-medicos')} />
      <Footer appName="planificador-chequeos-medicos" />
    </div>
  );
}
