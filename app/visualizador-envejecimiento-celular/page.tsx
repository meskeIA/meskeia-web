'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorEnvejecimientoCelular.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type SeccionActiva = 'telomeros' | 'hallmarks' | 'senescencia' | 'relojes';

interface Hallmark {
  numero: number;
  nombre: string;
  icono: string;
  descripcion: string;
  enfermedades: string;
  nuevo?: boolean;
}

interface TeoríaEnvejecimiento {
  nombre: string;
  autor: string;
  mecanismo: string;
  consecuencia: string;
}

const TEORIAS: TeoríaEnvejecimiento[] = [
  {
    nombre: 'Teoría de los telómeros',
    autor: 'Hayflick, Blackburn',
    mecanismo: 'Los telómeros se acortan con cada división celular (~50 divisiones = límite de Hayflick)',
    consecuencia: 'Senescencia o apoptosis cuando los telómeros alcanzan longitud crítica',
  },
  {
    nombre: 'Teoría mitocondrial / radicales libres',
    autor: 'Harman (1956)',
    mecanismo: 'Las mitocondrias generan ROS como subproducto de la respiración celular',
    consecuencia: 'Daño acumulativo en ADN, proteínas y lípidos; círculo vicioso con la edad',
  },
  {
    nombre: 'Teoría de la senescencia celular',
    autor: 'Campisi, d\'Adda di Fagagna',
    mecanismo: 'Células que dejan de dividirse pero no mueren, secretan SASP (citocinas inflamatorias)',
    consecuencia: 'Inflammaging: inflamación crónica de baja intensidad que daña tejidos circundantes',
  },
  {
    nombre: 'Teoría epigenética',
    autor: 'Horvath (2013)',
    mecanismo: 'La metilación del ADN cambia con la edad de forma predecible (reloj de Horvath)',
    consecuencia: 'Edad biológica ≠ edad cronológica; reversible parcialmente con reprogramación',
  },
];

const HALLMARKS: Hallmark[] = [
  {
    numero: 1,
    nombre: 'Inestabilidad genómica',
    icono: '🧬',
    descripcion: 'Acumulación de daño en el ADN por errores en la replicación, radiación UV, toxinas. Los sistemas de reparación se vuelven menos eficientes con la edad.',
    enfermedades: 'Cáncer, síndromes progeroides',
  },
  {
    numero: 2,
    nombre: 'Desgaste de telómeros',
    icono: '🔚',
    descripcion: 'Acortamiento progresivo de los telómeros con cada división celular. Al alcanzar el límite crítico, la célula entra en senescencia o apoptosis.',
    enfermedades: 'Envejecimiento prematuro, fibrosis pulmonar, anemia aplásica',
  },
  {
    numero: 3,
    nombre: 'Alteraciones epigenéticas',
    icono: '🔖',
    descripcion: 'Cambios en la metilación del ADN, modificaciones de histonas y remodelación de la cromatina que alteran la expresión génica sin cambiar la secuencia.',
    enfermedades: 'Cáncer, enfermedades neurodegenerativas',
  },
  {
    numero: 4,
    nombre: 'Pérdida de proteostasis',
    icono: '🧩',
    descripcion: 'Acumulación de proteínas mal plegadas o dañadas. El sistema ubiquitina-proteasoma y la autofagia se deterioran, permitiendo agregados tóxicos.',
    enfermedades: 'Alzheimer (tau, amiloide), Parkinson (alfa-sinucleína), cataratas',
  },
  {
    numero: 5,
    nombre: 'Macroautofagia desregulada',
    icono: '♻️',
    descripcion: 'La autofagia (reciclaje celular de componentes dañados) disminuye con la edad, permitiendo la acumulación de orgánulos disfuncionales y proteínas tóxicas.',
    enfermedades: 'Neurodegeneración, miocardiopatía, hígado graso',
  },
  {
    numero: 6,
    nombre: 'Senescencia celular',
    icono: '⛔',
    descripcion: 'Células que dejan de dividirse pero permanecen metabólicamente activas, secretando el SASP (factor inflamatorio). Se acumulan con la edad en tejidos.',
    enfermedades: 'Artritis, aterosclerosis, fibrosis, diabetes tipo 2',
  },
  {
    numero: 7,
    nombre: 'Disfunción mitocondrial',
    icono: '⚡',
    descripcion: 'Las mitocondrias envejecidas producen menos ATP y más ROS (radicales libres). El círculo vicioso daño→ROS→más daño se amplifica con la edad.',
    enfermedades: 'Sarcopenia, enfermedades cardiovasculares, neurodegeneración',
  },
  {
    numero: 8,
    nombre: 'Agotamiento de células madre',
    icono: '🌱',
    descripcion: 'Las células madre tisulares disminuyen en número y funcionalidad, reduciendo la capacidad regenerativa de tejidos como médula ósea, piel e intestino.',
    enfermedades: 'Anemia, cicatrización deteriorada, inmunosenescencia',
  },
  {
    numero: 9,
    nombre: 'Comunicación intercelular alterada',
    icono: '📡',
    descripcion: 'Cambios en la señalización endocrina, paracrina y nerviosa. Incluye inflammaging, cambios en el microbioma e inmunosenescencia.',
    enfermedades: 'Inflamación sistémica, cáncer, demencia',
  },
  {
    numero: 10,
    nombre: 'Inflamación crónica (añadido 2023)',
    icono: '🔥',
    descripcion: 'Inflammaging: estado de inflamación crónica de baja intensidad que acelera todos los hallmarks. Impulsado por SASP, disfunción inmune y senolitos.',
    enfermedades: 'Enfermedades cardiovasculares, metabólicas y neurodegenerativas',
    nuevo: true,
  },
  {
    numero: 11,
    nombre: 'Disbiosis (añadido 2023)',
    icono: '🦠',
    descripcion: 'El microbioma intestinal cambia con la edad hacia un perfil proinflamatorio, reduciendo la diversidad y aumentando patobiontes.',
    enfermedades: 'Inflamación sistémica, fragilidad, inmunosenescencia',
    nuevo: true,
  },
  {
    numero: 12,
    nombre: 'Alteración mecánica (añadido 2023)',
    icono: '🏗️',
    descripcion: 'Cambios en las propiedades mecánicas del núcleo celular y la lámina nuclear (laminas A/C), que afectan la expresión génica y la senescencia.',
    enfermedades: 'Progeria, envejecimiento acelerado, cáncer',
    nuevo: true,
  },
];

const INTERVENCIONES = [
  { intervencion: 'Restricción calórica', mecanismo: 'Activa AMPK, inhibe mTOR, activa sirtuinas', evidencia: 'Fuerte (todos los organismos modelo)', efecto: 'Extensión de vida 20-40% en modelos' },
  { intervencion: 'Ejercicio aeróbico moderado', mecanismo: 'Reduce estrés oxidativo, activa AMPK, telomerasa en leucocitos', evidencia: 'Fuerte (humanos)', efecto: 'Telómeros más largos, edad biológica -5 años' },
  { intervencion: 'Dieta mediterránea', mecanismo: 'Antioxidantes, antiinflamatorios, polifenoles', evidencia: 'Fuerte (humanos)', efecto: 'Menor acortamiento telomérico' },
  { intervencion: 'Rapamicina (mTOR inhibidor)', mecanismo: 'Inhibe mTOR, activa autofagia', evidencia: 'Fuerte (ratones), preliminar (humanos)', efecto: 'Único fármaco que extiende vida en todos los organismos probados' },
  { intervencion: 'Senolíticos (dasatinib + quercetina)', mecanismo: 'Eliminan selectivamente células senescentes', evidencia: 'Ensayos fase I/II en humanos', efecto: 'Reducción SASP, mejora fibrosis pulmonar' },
  { intervencion: 'Metformina', mecanismo: 'Activa AMPK, reduce inflamación', evidencia: 'En estudio (ensayo TAME)', efecto: 'Pendiente de confirmar en humanos' },
  { intervencion: 'Meditación / mindfulness', mecanismo: 'Reduce cortisol, estrés oxidativo', evidencia: 'Moderada (estudio Blackburn/Epel)', efecto: 'Mayor actividad telomerasa en PBMCs' },
  { intervencion: 'Reprogramación parcial (OSKM)', mecanismo: 'Factores de Yamanaka reversan el reloj epigenético', evidencia: 'Animal (ratones, experimentos Sinclair)', efecto: 'Recuperación visión y función muscular en ratones' },
];

export default function VisualizadorEnvejecimientoCelularPage() {
  const [seccionActiva, setSeccionActiva] = useState<SeccionActiva>('telomeros');
  const [hallmarkExpandido, setHallmarkExpandido] = useState<number | null>(null);

  const secciones: { id: SeccionActiva; label: string; icono: string }[] = [
    { id: 'telomeros', label: 'Telómeros', icono: '🔚' },
    { id: 'hallmarks', label: 'Hallmarks', icono: '🧬' },
    { id: 'senescencia', label: 'Senescencia', icono: '⛔' },
    { id: 'relojes', label: 'Relojes biológicos', icono: '⏱️' },
  ];

  const toggleHallmark = (num: number) => {
    setHallmarkExpandido(prev => (prev === num ? null : num));
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcono}>🔬</div>
        <h1>Visualizador del Envejecimiento Celular</h1>
        <p>Telómeros, senescencia, mitocondrias y las teorías moleculares del envejecimiento</p>
      </header>

      <LegalNotice />

      {/* Navegación de secciones */}
      <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
        {secciones.map(s => (
          <button
            key={s.id}
            className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navBtnActivo : ''}`}
            onClick={() => setSeccionActiva(s.id)}
            aria-pressed={seccionActiva === s.id}
          >
            <span aria-hidden="true">{s.icono}</span>
            {s.label}
          </button>
        ))}
      </nav>

      {/* SECCIÓN: TELÓMEROS */}
      {seccionActiva === 'telomeros' && (
        <section className={styles.seccion} aria-label="Telómeros">
          <h2 className={styles.seccionTitulo}>Telómeros y el límite de Hayflick</h2>
          <p className={styles.seccionIntro}>
            Los telómeros son secuencias repetitivas de ADN (TTAGGG) que protegen los extremos de
            los cromosomas, como los plásticos en los extremos de los cordones. Con cada división
            celular se acortan un poco, hasta que alcanzan un límite crítico (límite de Hayflick:
            ~50 divisiones).
          </p>

          {/* Diagrama cromosoma */}
          <div className={styles.cromosomaContainer}>
            <div className={styles.cromosomaDiagrama}>
              <div className={styles.telomeroIzq}>
                <span className={styles.telomeroLabel}>Telómero 5′</span>
                <div className={styles.telomeroBarra} />
              </div>
              <div className={styles.cromosomaBody}>
                <span className={styles.cromosomaLabel}>Cromosoma (ADN codificante)</span>
                <div className={styles.genasBar} />
              </div>
              <div className={styles.telomeroDer}>
                <div className={styles.telomeroBarra} />
                <span className={styles.telomeroLabel}>Telómero 3′</span>
              </div>
            </div>
            <p className={styles.diagramaNota}>
              El complejo <strong>shelterin</strong> protege los telómeros del sistema de reparación
              del ADN (que los confundiría con roturas)
            </p>
          </div>

          {/* Timeline de acortamiento */}
          <div className={styles.timelineContainer}>
            <h3 className={styles.subTitulo}>Acortamiento a lo largo de la vida</h3>
            <div className={styles.timeline}>
              {[
                { etapa: 'Nacimiento', longitud: 10000, color: '#2E86AB', porcentaje: 100 },
                { etapa: 'Infancia (10 años)', longitud: 9000, color: '#3A90B0', porcentaje: 90 },
                { etapa: 'Adulto joven (25 años)', longitud: 7500, color: '#48A9A6', porcentaje: 75 },
                { etapa: 'Adulto maduro (50 años)', longitud: 5000, color: '#F0A500', porcentaje: 50 },
                { etapa: 'Anciano (75 años)', longitud: 3000, color: '#E05A5A', porcentaje: 30 },
                { etapa: 'Célula senescente', longitud: 1500, color: '#9E3030', porcentaje: 15 },
              ].map(item => (
                <div key={item.etapa} className={styles.timelineItem}>
                  <span className={styles.timelineEtapa}>{item.etapa}</span>
                  <div className={styles.timelineBarContainer}>
                    <div
                      className={styles.timelineBar}
                      style={{ width: `${item.porcentaje}%`, backgroundColor: item.color }}
                      role="img"
                      aria-label={`Longitud ${item.longitud} pares de bases`}
                    />
                  </div>
                  <span className={styles.timelineValor}>{item.longitud.toLocaleString('es-ES')} pb</span>
                </div>
              ))}
            </div>
          </div>

          {/* Factores */}
          <div className={styles.factoresGrid}>
            <div className={styles.factoresColumna}>
              <h3 className={styles.factoresTitulo + ' ' + styles.factoresNegativo}>
                <span aria-hidden="true">⚠️</span> Aceleran el acortamiento
              </h3>
              <ul className={styles.factoresList}>
                {[
                  'Estrés oxidativo crónico (ROS)',
                  'Inflamación sistémica',
                  'Tabaquismo',
                  'Obesidad y sedentarismo',
                  'Estrés psicológico sostenido',
                  'Exposición a radiación UV',
                  'Dieta rica en azúcares refinados',
                  'Privación crónica de sueño',
                ].map(f => (
                  <li key={f} className={styles.factoresItem + ' ' + styles.factoresItemNeg}>{f}</li>
                ))}
              </ul>
            </div>
            <div className={styles.factoresColumna}>
              <h3 className={styles.factoresTitulo + ' ' + styles.factoresPositivo}>
                <span aria-hidden="true">✅</span> Factores protectores
              </h3>
              <ul className={styles.factoresList}>
                {[
                  'Ejercicio aeróbico moderado (≥3×/semana)',
                  'Dieta mediterránea (polifenoles)',
                  'Sueño reparador (7-9 h)',
                  'Meditación y mindfulness',
                  'Telomerasa activa (células madre)',
                  'Restricción calórica moderada',
                  'Omega-3, vitamina D',
                  'Vínculos sociales positivos',
                ].map(f => (
                  <li key={f} className={styles.factoresItem + ' ' + styles.factoresItemPos}>{f}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.warningBox}>
            <strong>Telomerasa:</strong> La enzima que reconstruye los telómeros (TERT + TERC). Activa
            en células germinales y madre; silenciada en la mayoría de células somáticas. Las células
            cancerosas reactivan la telomerasa para volverse inmortales (inmortalización maligna).
          </div>
        </section>
      )}

      {/* SECCIÓN: HALLMARKS */}
      {seccionActiva === 'hallmarks' && (
        <section className={styles.seccion} aria-label="Hallmarks of Aging">
          <h2 className={styles.seccionTitulo}>Los 12 Hallmarks of Aging</h2>
          <p className={styles.seccionIntro}>
            En 2013, López-Otín et al. (Cell) definieron los 9 pilares moleculares del envejecimiento.
            En 2023 se actualizaron a 12, añadiendo inflamación crónica, disbiosis y alteración
            mecánica. Haz clic en cada hallmark para ampliar información.
          </p>

          <div className={styles.hallmarksGrid}>
            {HALLMARKS.map(h => (
              <div
                key={h.numero}
                className={`${styles.hallmarkCard} ${hallmarkExpandido === h.numero ? styles.hallmarkExpandido : ''} ${h.nuevo ? styles.hallmarkNuevo : ''}`}
                onClick={() => toggleHallmark(h.numero)}
                role="button"
                tabIndex={0}
                aria-expanded={hallmarkExpandido === h.numero}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleHallmark(h.numero); }}
              >
                <div className={styles.hallmarkHeader}>
                  <span className={styles.hallmarkNumero}>{h.numero}</span>
                  <span className={styles.hallmarkIcono} aria-hidden="true">{h.icono}</span>
                  <span className={styles.hallmarkNombre}>{h.nombre}</span>
                  {h.nuevo && <span className={styles.badgeNuevo}>2023</span>}
                  <span className={styles.expandIcon} aria-hidden="true">
                    {hallmarkExpandido === h.numero ? '▲' : '▼'}
                  </span>
                </div>
                {hallmarkExpandido === h.numero && (
                  <div className={styles.hallmarkDetalle}>
                    <p className={styles.hallmarkDesc}>{h.descripcion}</p>
                    <p className={styles.hallmarkEnfermedades}>
                      <strong>Enfermedades asociadas:</strong> {h.enfermedades}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={styles.citacion}>
            <strong>Referencia:</strong> López-Otín et al., &ldquo;The Hallmarks of Aging&rdquo;, <em>Cell</em> 153(6):1194-1217 (2013); actualización en <em>Cell</em> 186(2):243-278 (2023).
          </div>
        </section>
      )}

      {/* SECCIÓN: SENESCENCIA */}
      {seccionActiva === 'senescencia' && (
        <section className={styles.seccion} aria-label="Senescencia celular">
          <h2 className={styles.seccionTitulo}>Senescencia celular y SASP</h2>
          <p className={styles.seccionIntro}>
            La senescencia es un estado de arresto permanente del ciclo celular. Las células
            senescentes no mueren: permanecen en el tejido y secretan el SASP (Senescence-Associated
            Secretory Phenotype), un cóctel de citocinas inflamatorias y enzimas degradantes que
            dañan las células vecinas.
          </p>

          {/* Diagrama ciclo senescencia */}
          <div className={styles.cicloContainer}>
            <h3 className={styles.subTitulo}>El ciclo del daño celular</h3>
            <div className={styles.cicloFlujo}>
              {[
                { icono: '💥', label: 'Daño al ADN', desc: 'Radiación, ROS, telómeros cortos' },
                { icono: '🛑', label: 'Arresto ciclo celular', desc: 'p53/p21 o p16/Rb activados' },
                { icono: '⛔', label: 'Senescencia', desc: 'La célula no se divide ni muere' },
                { icono: '🔥', label: 'Secreción SASP', desc: 'IL-6, IL-8, MMP, TGF-β...' },
                { icono: '🏥', label: 'Inflamación tisular', desc: 'Daño a células vecinas' },
              ].map((paso, idx) => (
                <div key={paso.label} className={styles.cicloStep}>
                  <div className={styles.cicloIcono} aria-hidden="true">{paso.icono}</div>
                  <div className={styles.cicloTexto}>
                    <strong>{paso.label}</strong>
                    <span>{paso.desc}</span>
                  </div>
                  {idx < 4 && <div className={styles.cicloFlecha} aria-hidden="true">→</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Comparativa tipos celulares */}
          <div className={styles.comparativaGrid}>
            <h3 className={styles.subTitulo}>Destinos celulares ante el daño</h3>
            {[
              {
                tipo: 'Célula normal',
                color: '#2E86AB',
                icono: '🟢',
                caracteristicas: ['Se divide normalmente', 'ADN íntegro', 'Telómeros adecuados', 'Responde a señales de crecimiento', 'Sin secreción inflamatoria'],
              },
              {
                tipo: 'Célula senescente',
                color: '#F0A500',
                icono: '🟡',
                caracteristicas: ['Ciclo celular arrestado (permanente)', 'ADN dañado (no reparado)', 'Morfología aplanada, agrandada', 'Secreta SASP inflamatorio', 'β-galactosidasa positiva (marcador)'],
              },
              {
                tipo: 'Célula apoptótica',
                color: '#E05A5A',
                icono: '🔴',
                caracteristicas: ['Inicia programa de muerte', 'Contracción celular', 'Fragmentación del ADN', 'Fagocitada sin inflamación', 'Proceso ordenado y beneficioso'],
              },
            ].map(c => (
              <div key={c.tipo} className={styles.comparativaCard} style={{ borderTopColor: c.color }}>
                <div className={styles.comparativaTipo}>
                  <span aria-hidden="true">{c.icono}</span>
                  <strong>{c.tipo}</strong>
                </div>
                <ul className={styles.comparativaLista}>
                  {c.caracteristicas.map(car => (
                    <li key={car}>{car}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Senoterapias */}
          <div className={styles.senoterapiasBox}>
            <h3 className={styles.subTitulo}>Senoterapias emergentes</h3>
            <div className={styles.senoterapiasGrid}>
              <div className={styles.senoterapiaCard}>
                <h4>Senolíticos</h4>
                <p>Eliminan selectivamente las células senescentes. Principales: <strong>dasatinib + quercetina</strong> (D+Q). En ensayos fase I/II para fibrosis pulmonar, osteoporosis, enfermedad renal.</p>
                <span className={styles.evidenciaTag}>Ensayos en humanos</span>
              </div>
              <div className={styles.senoterapiaCard}>
                <h4>Senomórficos</h4>
                <p>No eliminan las células senescentes, pero <strong>suprimen el SASP</strong>. Rapamicina, metformina, navitoclax. Más seguros pero con menor efecto.</p>
                <span className={styles.evidenciaTag}>Investigación activa</span>
              </div>
              <div className={styles.senoterapiaCard}>
                <h4>Reprogramación parcial</h4>
                <p>Factores de Yamanaka (Oct4, Sox2, Klf4, c-Myc) revierten parcialmente el reloj epigenético. Experimentos de <strong>Sinclair (Harvard)</strong>: recuperaron visión y función muscular en ratones.</p>
                <span className={styles.evidenciaTag}>Modelos animales</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECCIÓN: RELOJES BIOLÓGICOS */}
      {seccionActiva === 'relojes' && (
        <section className={styles.seccion} aria-label="Relojes biológicos">
          <h2 className={styles.seccionTitulo}>Relojes biológicos y edad epigenética</h2>
          <p className={styles.seccionIntro}>
            En 2013, Steve Horvath (UCLA) descubrió que el patrón de metilación del ADN en más de
            350 sitios CpG específicos cambia con la edad de forma predecible y universal en todos
            los tejidos humanos. Este &ldquo;reloj epigenético&rdquo; permite estimar la edad biológica
            con una precisión de ±3 años.
          </p>

          {/* Reloj de Horvath */}
          <div className={styles.relojBox}>
            <div className={styles.relojHeader}>
              <span className={styles.relojIcono} aria-hidden="true">⏱️</span>
              <div>
                <h3>El reloj de Horvath</h3>
                <p>Edad biológica ≠ Edad cronológica</p>
              </div>
            </div>
            <div className={styles.relojConceptos}>
              {[
                {
                  concepto: 'Edad cronológica',
                  descripcion: 'Los años transcurridos desde el nacimiento. No refleja el estado real del organismo.',
                  color: '#666',
                },
                {
                  concepto: 'Edad biológica',
                  descripcion: 'Estimada por el reloj epigenético. Puede diferir ±10-15 años de la cronológica.',
                  color: '#2E86AB',
                },
                {
                  concepto: 'Aceleración epigenética',
                  descripcion: 'Edad biológica > cronológica. Asociada a mayor mortalidad y riesgo de enfermedades crónicas.',
                  color: '#E05A5A',
                },
                {
                  concepto: 'Desaceleración epigenética',
                  descripcion: 'Edad biológica < cronológica. Asociada a mayor longevidad y mejor salud en centenarios.',
                  color: '#48A9A6',
                },
              ].map(c => (
                <div key={c.concepto} className={styles.relojConcepto} style={{ borderLeftColor: c.color }}>
                  <strong style={{ color: c.color }}>{c.concepto}</strong>
                  <p>{c.descripcion}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla de intervenciones */}
          <div className={styles.intervencionesBox}>
            <h3 className={styles.subTitulo}>Intervenciones con evidencia científica</h3>
            <div className={styles.tablaResponsive}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Intervención</th>
                    <th>Mecanismo</th>
                    <th>Evidencia</th>
                    <th>Efecto documentado</th>
                  </tr>
                </thead>
                <tbody>
                  {INTERVENCIONES.map(i => (
                    <tr key={i.intervencion}>
                      <td><strong>{i.intervencion}</strong></td>
                      <td>{i.mecanismo}</td>
                      <td>
                        <span className={`${styles.evidenciaBadge} ${
                          i.evidencia.startsWith('Fuerte') ? styles.evidenciaFuerte :
                          i.evidencia.startsWith('Moderada') ? styles.evidenciaMedia :
                          styles.evidenciaDebil
                        }`}>
                          {i.evidencia.split(' (')[0]}
                        </span>
                      </td>
                      <td>{i.efecto}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.warningBox}>
            <strong>Importante:</strong> Los relojes epigenéticos son herramientas de investigación.
            Los tests comerciales de &ldquo;edad biológica&rdquo; tienen limitaciones significativas
            (variabilidad entre tejidos, sensibilidad a condiciones agudas). La ciencia de la
            longevidad es un campo en desarrollo activo.
          </div>
        </section>
      )}

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="¿Por qué envejecen nuestras células?"
        subtitle="Telómeros, senescencia y los mecanismos moleculares del envejecimiento"
      >

        {/* 1. Tabla comparativa — 12 Hallmarks of Aging */}
        <h4>Los 12 Hallmarks of Aging: tabla comparativa completa</h4>
        <p>
          El marco de los Hallmarks of Aging (López-Otín et al., 2013; actualizado 2023) clasifica
          los mecanismos moleculares del envejecimiento en 12 categorías interconectadas.
        </p>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Hallmark</th>
                <th>Mecanismo principal</th>
                <th>Ejemplo representativo</th>
                <th>¿Reversible?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td><strong>Inestabilidad genómica</strong></td>
                <td>Daño en el ADN por ROS, UV, errores de replicación</td>
                <td>Mutaciones somáticas acumuladas con la edad</td>
                <td>Parcialmente (reparación del ADN)</td>
              </tr>
              <tr>
                <td>2</td>
                <td><strong>Desgaste de telómeros</strong></td>
                <td>Acortamiento con cada división celular (~50 divisiones)</td>
                <td>Fibrosis pulmonar por telómeros critically short</td>
                <td>Parcialmente (telomerasa, reprogramación)</td>
              </tr>
              <tr>
                <td>3</td>
                <td><strong>Alteraciones epigenéticas</strong></td>
                <td>Cambios en metilación ADN e histonas</td>
                <td>Reloj de Horvath: edad biológica ≠ cronológica</td>
                <td>Sí (reprogramación parcial OSKM)</td>
              </tr>
              <tr>
                <td>4</td>
                <td><strong>Pérdida de proteostasis</strong></td>
                <td>Acumulación de proteínas mal plegadas</td>
                <td>Placas de amiloide en Alzheimer</td>
                <td>Parcialmente (autofagia, chaperonas)</td>
              </tr>
              <tr>
                <td>5</td>
                <td><strong>Macroautofagia desregulada</strong></td>
                <td>Fallo del reciclaje celular</td>
                <td>Acumulación de mitocondrias disfuncionales</td>
                <td>Sí (ejercicio, restricción calórica, rapamicina)</td>
              </tr>
              <tr>
                <td>6</td>
                <td><strong>Senescencia celular</strong></td>
                <td>Arresto permanente + secreción SASP</td>
                <td>Células senescentes en articulaciones artríticas</td>
                <td>Sí (senolíticos D+Q)</td>
              </tr>
              <tr>
                <td>7</td>
                <td><strong>Disfunción mitocondrial</strong></td>
                <td>Menor producción de ATP, mayor ROS</td>
                <td>Sarcopenia: pérdida de masa muscular</td>
                <td>Parcialmente (ejercicio, MitoQ, NMN)</td>
              </tr>
              <tr>
                <td>8</td>
                <td><strong>Agotamiento de células madre</strong></td>
                <td>Reducción en número y funcionalidad</td>
                <td>Menor regeneración hematopoyética</td>
                <td>Parcialmente (factores de rejuvenecimiento)</td>
              </tr>
              <tr>
                <td>9</td>
                <td><strong>Comunicación intercelular alterada</strong></td>
                <td>Cambios en señalización endocrina y nerviosa</td>
                <td>Inmunosenescencia: respuesta inmune deteriorada</td>
                <td>Parcialmente (plasmapheresis experimental)</td>
              </tr>
              <tr>
                <td>10</td>
                <td><strong>Inflamación crónica</strong> <span style={{fontSize:'0.7rem', color:'var(--secondary)'}}>2023</span></td>
                <td>Inflammaging: inflamación de baja intensidad sistémica</td>
                <td>Niveles elevados de IL-6 en centenarios</td>
                <td>Sí (dieta antiinflamatoria, senolíticos)</td>
              </tr>
              <tr>
                <td>11</td>
                <td><strong>Disbiosis</strong> <span style={{fontSize:'0.7rem', color:'var(--secondary)'}}>2023</span></td>
                <td>Cambio del microbioma hacia perfil proinflamatorio</td>
                <td>Reducción de Akkermansia y Lactobacillus con la edad</td>
                <td>Sí (probióticos, FMT experimental)</td>
              </tr>
              <tr>
                <td>12</td>
                <td><strong>Alteración mecánica</strong> <span style={{fontSize:'0.7rem', color:'var(--secondary)'}}>2023</span></td>
                <td>Cambios en lámina nuclear (laminas A/C)</td>
                <td>Progeria: envejecimiento acelerado por mutación LMNA</td>
                <td>Parcialmente (lonafarnib en progeria)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Perfiles de usuario */}
        <h4>¿A quién le es útil este visualizador?</h4>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcono} aria-hidden="true">🎓</div>
            <h5>Estudiante de Biología</h5>
            <p>
              Comprende la biología molecular del envejecimiento a nivel mecanístico. Usa las secciones
              de Hallmarks y Senescencia para conectar los conceptos del laboratorio con las teorías
              actuales (p53/p21, SASP, autofagia). Útil para TFG o preparar oposiciones MIR.
            </p>
            <div className={styles.escenarioTag}>Biología molecular · Genética</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcono} aria-hidden="true">🏥</div>
            <h5>Profesional sanitario</h5>
            <p>
              Aplica los conceptos en geriatría o medicina preventiva. El apartado de Relojes biológicos
              y la tabla de intervenciones con evidencia facilita explicar a pacientes la diferencia
              entre edad biológica y cronológica, y qué factores de estilo de vida tienen mayor impacto.
            </p>
            <div className={styles.escenarioTag}>Geriatría · Medicina preventiva</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcono} aria-hidden="true">🧓</div>
            <h5>Persona mayor de 50 años</h5>
            <p>
              Motivado por entender el envejecimiento propio y mejorar el healthspan. La sección de
              Telómeros y los factores protectores ofrece información basada en evidencia sobre
              ejercicio, dieta mediterránea y sueño, sin sensacionalismo ni suplementos milagrosos.
            </p>
            <div className={styles.escenarioTag}>Longevidad · Estilo de vida saludable</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioIcono} aria-hidden="true">📢</div>
            <h5>Divulgador científico</h5>
            <p>
              Busca explicar la ciencia del envejecimiento al público general con rigor. Las referencias
              a López-Otín, Horvath, Blackburn y Sinclair, junto con las explicaciones visuales del
              SASP y la reprogramación, ofrecen material verificable y actualizado a 2023.
            </p>
            <div className={styles.escenarioTag}>Divulgación · Comunicación científica</div>
          </div>
        </div>

        {/* 3. FAQ */}
        <h4>Preguntas frecuentes sobre biología del envejecimiento</h4>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Los telómeros cortos causan directamente el cáncer?</strong>
            <p>
              No directamente. Los telómeros críticamente cortos pueden provocar inestabilidad
              cromosómica (fusiones y roturas) que favorece mutaciones oncogénicas. Sin embargo,
              paradójicamente, los cánceres establecidos reactivan la telomerasa para volverse
              inmortales. La relación es compleja: el acortamiento telomérico actúa como barrera
              antitumoral inicial, pero si falla, puede facilitar la transformación maligna.
            </p>
            <div className={styles.faqTip}>Clave: telómeros cortos = inestabilidad genómica, no cáncer directo</div>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué diferencia hay entre senescencia y apoptosis?</strong>
            <p>
              La apoptosis es muerte celular programada: la célula se fragmenta de forma ordenada y
              es fagocitada sin inflamación. La senescencia es un estado intermedio: la célula no muere
              ni se divide, pero permanece activa y secreta el SASP (citocinas inflamatorias, MMPs).
              Las células senescentes son beneficiosas a corto plazo (cicatrización, supresión tumoral)
              pero dañinas si se acumulan crónicamente.
            </p>
            <div className={styles.faqTip}>Senescencia: arresto permanente + secreción SASP; apoptosis: muerte limpia</div>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué es exactamente el reloj de Horvath?</strong>
            <p>
              Es un algoritmo que usa el patrón de metilación del ADN en 353 sitios CpG específicos
              para estimar la edad biológica de un tejido con una precisión de ±3,6 años. Desarrollado
              por Steve Horvath (UCLA, 2013), es el primer marcador del envejecimiento que funciona en
              todos los tejidos humanos. Versiones posteriores (GrimAge, PhenoAge) añaden marcadores
              de mortalidad y fenotipo.
            </p>
            <div className={styles.faqTip}>353 sitios CpG · Universal para todos los tejidos · Precisión ±3,6 años</div>
          </div>
          <div className={styles.faqItem}>
            <strong>¿El inflammaging es lo mismo que la inflamación aguda?</strong>
            <p>
              No. La inflamación aguda es una respuesta inmune adaptativa, intensa y autolimitada.
              El inflammaging es una inflamación crónica de muy baja intensidad, estéril (sin patógeno)
              y persistente que aumenta con la edad. Está impulsado principalmente por el SASP de
              células senescentes, la disfunción mitocondrial (liberación de ADN mitocondrial) y la
              reactivación de elementos transposibles. Es un factor causal en diabetes tipo 2,
              aterosclerosis y neurodegeneración.
            </p>
            <div className={styles.faqTip}>Inflammaging: crónico, estéril, de baja intensidad; no la respuesta inmune normal</div>
          </div>
          <div className={styles.faqItem}>
            <strong>¿La reprogramación parcial puede rejuvenecer células humanas?</strong>
            <p>
              En modelos animales, sí. Los factores de Yamanaka (Oct4, Sox2, Klf4, c-Myc) en pulsos
              cortos (no continuos, para evitar desdiferenciación) han revertido la edad biológica de
              células retinianas y musculares en ratones (laboratorio Sinclair, 2020-2023). En humanos,
              los ensayos clínicos están en fases muy preliminares. La reprogramación continua causa
              tumores (teratomas), por lo que el reto es encontrar la dosis y el vector adecuados.
            </p>
            <div className={styles.faqTip}>Eficaz en ratones; ensayos humanos muy preliminares; riesgo de teratomas</div>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Son seguros los senolíticos disponibles hoy?</strong>
            <p>
              Dasatinib + quercetina (D+Q) son los senolíticos más estudiados. Dasatinib es un
              fármaco aprobado para leucemia, con efectos adversos conocidos. Los ensayos clínicos
              para envejecimiento (fibrosis pulmonar idiopática, enfermedad renal crónica) están en
              fase I/II con muestras pequeñas. Quercetina es un flavonoide de venta libre. No existe
              evidencia suficiente para recomendar su uso preventivo en personas sanas, y la
              automedicación con dasatinib es peligrosa sin supervisión médica.
            </p>
            <div className={styles.faqTip}>D+Q: fase I/II; no usar dasatinib sin prescripción médica</div>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué distingue lifespan de healthspan?</strong>
            <p>
              Lifespan es la duración total de vida. Healthspan es el período de vida con buena salud
              funcional, sin discapacidad ni enfermedad crónica grave. El objetivo de la gerontología
              moderna no es solo aumentar el lifespan, sino comprimir la morbilidad: que la fase de
              deterioro sea lo más breve posible al final de la vida (teoría de Fries, 1980). Las
              intervenciones actuales (ejercicio, dieta mediterránea) tienen más evidencia sobre
              healthspan que sobre extensión bruta del lifespan.
            </p>
            <div className={styles.faqTip}>Objetivo: comprimir la morbilidad, no solo alargar la vida</div>
          </div>
        </div>

        {/* 4. Guía paso a paso */}
        <h4>Cómo explorar este visualizador de forma efectiva</h4>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Empieza por Telómeros</strong>
              <p>
                El acortamiento telomérico es el mecanismo más intuitivo y el mejor documentado.
                Observa el diagrama del cromosoma y la línea temporal de acortamiento. Identifica
                los factores que aceleran y ralentizan el proceso.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Explora los 12 Hallmarks</strong>
              <p>
                Haz clic en cada hallmark para ver su descripción detallada y las enfermedades
                asociadas. Fíjate en los 3 nuevos de 2023 (marcados en verde): inflammaging,
                disbiosis y alteración mecánica. Son los mecanismos más recientes.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Comprende la Senescencia y el SASP</strong>
              <p>
                El ciclo daño → senescencia → SASP es el puente entre hallmarks moleculares y
                patología tisular. Diferencia senescencia de apoptosis y comprende por qué las
                células senescentes son dañinas a largo plazo aunque benéficas a corto.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Revisa el Reloj de Horvath</strong>
              <p>
                La sección de Relojes biológicos cierra el círculo: los hallmarks moleculares
                producen cambios epigenéticos medibles. Revisa la tabla de intervenciones con
                evidencia y distingue las que tienen soporte fuerte en humanos de las experimentales.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Lee las referencias originales</strong>
              <p>
                López-Otín et al. (Cell, 2013 y 2023) son artículos de libre acceso en PubMed.
                El paper de Horvath (Genome Biology, 2013) también está disponible abiertamente.
                Son los fundamentos del campo y permiten verificar cada afirmación de este visualizador.
              </p>
            </div>
          </div>
        </div>

        {/* 5. Mejores prácticas */}
        <h4>Consejos para estudiar biología del envejecimiento</h4>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">📖</div>
            <h5>Lee los hallmarks originales</h5>
            <p>
              Los dos artículos de López-Otín (Cell 2013 y 2023) son la referencia canónica.
              Disponibles gratis en PubMed. Son largos pero su estructura es muy clara.
            </p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">🔬</div>
            <h5>Distingue aging de disease</h5>
            <p>
              No todo el deterioro funcional es envejecimiento primario. Distingue entre
              hallmarks causales (inestabilidad genómica, senescencia) y consecuencias
              (enfermedades crónicas). Esta distinción es crucial para diseñar intervenciones.
            </p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">⚖️</div>
            <h5>Evalúa el nivel de evidencia</h5>
            <p>
              Muchas intervenciones longevistas tienen evidencia sólida en modelos animales
              pero preliminar en humanos. Usa la clasificación fuerte/moderada/débil de la
              tabla de intervenciones como referencia crítica.
            </p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">🔗</div>
            <h5>Conecta los hallmarks entre sí</h5>
            <p>
              Los hallmarks no son independientes: forman un sistema. Telómeros cortos → senescencia
              → SASP → inflamación → ROS → daño epigenético → más senescencia. Entender
              estas conexiones es más valioso que memorizarlos por separado.
            </p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">🧪</div>
            <h5>Sigue los ensayos clínicos activos</h5>
            <p>
              ClinicalTrials.gov registra todos los ensayos de senolíticos, metformina (TAME),
              reprogramación y NMN. Buscar por &ldquo;aging&rdquo; o &ldquo;senescence&rdquo; para ver
              el estado actual del campo, mucho más actualizado que artículos de divulgación.
            </p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon} aria-hidden="true">📊</div>
            <h5>Consulta bases de datos de longevidad</h5>
            <p>
              GenAge (genomics.senescence.info) lista genes del envejecimiento con evidencia.
              DrugAge cataloga compuestos que modifican la longevidad en modelos. Human Ageing
              Genomic Resources ofrece datos integrados de expresión génica en envejecimiento.
            </p>
          </div>
        </div>

        {/* 6. Warning Box — errores comunes */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores conceptuales frecuentes sobre el envejecimiento celular</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Confundir envejecimiento con enfermedad:</strong> El envejecimiento es un
              proceso fisiológico universal, no una patología. Las enfermedades crónicas son
              consecuencias del envejecimiento, no sinónimos. Esta distinción importa para
              entender si las intervenciones tratan causas o síntomas.
            </li>
            <li>
              <strong>Creer que telómeros cortos causan directamente cáncer:</strong> La relación
              es más compleja. Los telómeros cortos inicialmente suprimen tumores al inducir
              senescencia; solo si la senescencia falla y hay inestabilidad cromosómica pueden
              favorecer transformación maligna.
            </li>
            <li>
              <strong>Pensar que senescencia = muerte celular:</strong> Las células senescentes
              son metabólicamente activas y permanecen en el tejido durante meses o años,
              causando daño inflamatorio continuado. La apoptosis (sí es muerte) es un proceso
              distinto y generalmente beneficioso.
            </li>
            <li>
              <strong>Asumir que más telomerasa = más longevidad:</strong> La telomerasa activa
              indiscriminadamente puede favorecer la inmortalización de células cancerosas.
              Las células cancerosas ya tienen telomerasa sobreactivada. Los estudios en ratones
              transgénicos con telomerasa extra muestran resultados mixtos en longevidad.
            </li>
            <li>
              <strong>Extrapolar directamente de ratones a humanos:</strong> Muchas intervenciones
              que extienden la vida en ratones (rapamicina +25%, restricción calórica +40%) tienen
              resultados más modestos o no confirmados en primates y humanos. La fisiología del
              envejecimiento difiere significativamente entre especies.
            </li>
            <li>
              <strong>Interpretar el reloj epigenético como edad &ldquo;real&rdquo;:</strong> Los relojes
              de metilación son estimadores estadísticos entrenados en poblaciones. Varían entre
              tejidos del mismo individuo, son sensibles a condiciones agudas (enfermedad, estrés)
              y tienen errores de ±3-5 años. Los tests comerciales de &ldquo;edad biológica&rdquo; tienen
              limitaciones importantes que rara vez se comunican al consumidor.
            </li>
          </ul>
        </div>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-envejecimiento-celular')} />
      <ShareCard appName="visualizador-envejecimiento-celular" />
      <Footer appName="visualizador-envejecimiento-celular" />
    </div>
  );
}
