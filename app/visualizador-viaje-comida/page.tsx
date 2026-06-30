'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorViajeComida.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Etapas del sistema digestivo
// ─────────────────────────────────────────────

interface EtapaDigestiva {
  id: string;
  numero: number;
  titulo: string;
  organo: string;
  icono: string;
  duracion: string;
  color: string;
  queOcurre: string;
  procesoBioquimico: string;
  datoSorprendente: string;
}

const ETAPAS: EtapaDigestiva[] = [
  {
    id: 'boca',
    numero: 1,
    titulo: 'Boca',
    organo: 'Cavidad bucal',
    icono: '😮',
    duracion: '30 seg – 2 min',
    color: '#2E86AB',
    queOcurre:
      'La comida entra en la boca y comienza la digestión mecánica y química simultáneamente. Los dientes trituran el alimento en trozos pequeños (masticación) mientras la lengua mezcla la masa con saliva. Se forma el bolo alimenticio, una pasta suave y lubricada lista para ser tragada.',
    procesoBioquimico:
      'Las glándulas salivales producen ~1,5 litros de saliva al día. La saliva contiene amilasa salival (ptialina), una enzima que rompe el almidón (polisacáridos) en maltosa (disacárido). También contiene lisozima (antibacteriana), mucina (lubricante) y agua. El pH bucal es neutro (~7). El almidón cocido se digiere hasta un 40% ya en la boca.',
    datoSorprendente:
      'Un adulto mastica entre 70 y 90 veces por minuto. Si masticas cada bocado 30 veces, la digestión posterior es un 25% más eficiente porque el área superficial disponible para las enzimas se multiplica.',
  },
  {
    id: 'esofago',
    numero: 2,
    titulo: 'Esófago',
    organo: 'Tubo muscular ~25 cm',
    icono: '🌊',
    duracion: '6 – 10 segundos',
    color: '#48A9A6',
    queOcurre:
      'El bolo alimenticio desciende por el esófago gracias al peristaltismo: contracciones musculares rítmicas en forma de ola que empujan el alimento hacia abajo. No es caída libre por gravedad — puedes tragar boca abajo y los alimentos llegan igualmente al estómago. El esfínter esofágico inferior (cardias) se abre para dejar pasar el bolo y se cierra para evitar el reflujo.',
    procesoBioquimico:
      'El esófago es el único tramo del tubo digestivo donde NO ocurre digestión química. Su función es exclusivamente mecánica: transporte. Las capas musculares (circular interna y longitudinal externa) se contraen coordinadas por el sistema nervioso entérico, independientemente del cerebro central.',
    datoSorprendente:
      'El peristaltismo es tan potente que los astronautas en gravedad cero digieren igual de bien que en la Tierra. El sistema nervioso del intestino (llamado "el segundo cerebro") tiene 100 millones de neuronas — más que toda la médula espinal.',
  },
  {
    id: 'estomago',
    numero: 3,
    titulo: 'Estómago',
    organo: 'Bolsa muscular ~1,5 L',
    icono: '🫙',
    duracion: '2 – 4 horas',
    color: '#e67e22',
    queOcurre:
      'El estómago actúa como una lavadora ácida. Sus paredes musculares se contraen y mezclan el bolo alimenticio con jugos gástricos, transformándolo en quimo (papilla líquida y ácida). El píloro regula la salida del quimo hacia el intestino delgado en pequeñas porciones controladas. Las proteínas se desnaturalizan y empiezan a romperse.',
    procesoBioquimico:
      'Las células parietales secretan HCl (ácido clorhídrico), bajando el pH hasta 1,5-2 — más ácido que el vinagre. Este entorno activa el pepsinógeno (forma inactiva) convirtiéndolo en pepsina, una enzima proteasa que rompe las proteínas en péptidos. Las células principales secretan pepsinógeno. Las células mucosas producen moco que protege la pared gástrica de su propio ácido. El factor intrínseco gástrico es esencial para absorber vitamina B12 en el intestino.',
    datoSorprendente:
      'El estómago se reemplaza completamente cada 3-5 días: las células del epitelio gástrico mueren por el propio ácido y se renuevan constantemente. Si no fuera así, el estómago se digeriría a sí mismo. En personas con úlcera, este sistema de protección falla localmente.',
  },
  {
    id: 'intestino-delgado',
    numero: 4,
    titulo: 'Intestino Delgado',
    organo: '~6-7 metros de longitud',
    icono: '🌀',
    duracion: '3 – 5 horas',
    color: '#27ae60',
    queOcurre:
      'El intestino delgado es la gran fábrica de absorción del cuerpo. El quimo llega al duodeno, donde se mezcla con bilis (hígado) y jugo pancreático. Las enzimas terminan de descomponer carbohidratos, proteínas y grasas en moléculas simples. Las vellosidades y microvellosidades intestinales absorben los nutrientes hacia la sangre. Es la etapa más larga y crucial del proceso.',
    procesoBioquimico:
      'El páncreas secreta amilasa pancreática (carbohidratos → glucosa), lipasas (grasas → ácidos grasos + glicerol), tripsina y quimotripsina (proteínas → aminoácidos). La bilis emulsiona las grasas (las hace solubles en agua). Las vellosidades intestinales multiplican la superficie de absorción: si extendieras el intestino delgado completamente, tendría la superficie de una cancha de tenis (250 m²). Los nutrientes pasan a la sangre portal y van al hígado.',
    datoSorprendente:
      'La superficie total del intestino delgado con sus vellosidades y microvellosidades es de ~250 m² — el tamaño de un apartamento de dos habitaciones. Sin esas estructuras, necesitarías 600 metros de intestino para absorber los mismos nutrientes.',
  },
  {
    id: 'intestino-grueso',
    numero: 5,
    titulo: 'Intestino Grueso',
    organo: '~1,5 metros de longitud',
    icono: '🔄',
    duracion: '12 – 36 horas',
    color: '#9b59b6',
    queOcurre:
      'Lo que el intestino delgado no absorbió llega al intestino grueso (colon). Aquí se absorbe el agua y los electrolitos (sodio, potasio), convirtiendo el quimo líquido en heces semisólidas. Las bacterias de la microbiota intestinal fermentan la fibra y producen vitaminas K y B. El contenido avanza lentamente hacia el recto impulsado por movimientos peristálticos lentos.',
    procesoBioquimico:
      'El colon no tiene vellosidades ni produce enzimas digestivas propias. La microbiota intestinal (100 billones de bacterias de ~1.000 especies) fermenta la fibra dietética produciendo ácidos grasos de cadena corta (acetato, propionato, butirato) que nutren las células del colon. También sintetizan vitamina K2 y algunas vitaminas del grupo B. El colon absorbe hasta 1,3 litros de agua al día. Las heces son ~75% agua, 25% bacterias muertas, fibra no digerida y células epiteliales.',
    datoSorprendente:
      'El microbioma intestinal pesa entre 1,5 y 2 kg — aproximadamente lo mismo que el cerebro. Tiene 100 veces más genes que el genoma humano. Los científicos lo consideran "un órgano más" y está relacionado con el estado de ánimo, la inmunidad y el riesgo de enfermedades crónicas.',
  },
  {
    id: 'eliminacion',
    numero: 6,
    titulo: 'Eliminación',
    organo: 'Recto y ano',
    icono: '♻️',
    duracion: 'Variable',
    color: '#7F8C8D',
    queOcurre:
      'Las heces se acumulan en el recto. Cuando la presión es suficiente, los receptores de estiramiento envían señal al cerebro generando la sensación de urgencia. El esfínter anal interno (involuntario) se relaja, y el esfínter anal externo (voluntario) permite controlar el momento de la defecación. La maniobra de Valsalva (aumento de presión abdominal) facilita la expulsión.',
    procesoBioquimico:
      'La consistencia de las heces depende del tiempo de tránsito: si va demasiado rápido, el colon no absorbe suficiente agua (diarrea). Si va demasiado lento, las heces se endurecen (estreñimiento). El color marrón proviene de la estercobilina, un derivado de la bilirrubina (producto de la degradación de los glóbulos rojos). El pH de las heces es ligeramente ácido (~6,5).',
    datoSorprendente:
      'El tiempo de tránsito total desde que comes hasta que eliminas es de 24 a 72 horas en una persona sana. Comer remolachas lo tiñe de rojo, lo que es completamente inofensivo y sirve para medir aproximadamente tu tiempo de tránsito personal.',
  },
];

// ─────────────────────────────────────────────
// Datos del proceso completo
// ─────────────────────────────────────────────

interface DatoResumen {
  icono: string;
  cifra: string;
  descripcion: string;
}

const DATOS_RESUMEN: DatoResumen[] = [
  { icono: '📏', cifra: '~9 metros', descripcion: 'longitud total del tubo digestivo' },
  { icono: '⏱️', cifra: '24-72 horas', descripcion: 'tiempo total de digestión' },
  { icono: '🧫', cifra: '100 billones', descripcion: 'bacterias en el intestino' },
  { icono: '💧', cifra: '~8 litros', descripcion: 'fluidos digestivos por día' },
  { icono: '🏟️', cifra: '250 m²', descripcion: 'superficie absorbente intestinal' },
  { icono: '⚡', cifra: '~2.000 kcal', descripcion: 'calorías procesadas al día (adulto medio)' },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorViajeComidaPage() {
  const [etapaActiva, setEtapaActiva] = useState<string>(ETAPAS[0].id);
  const [vistaDetalle, setVistaDetalle] = useState<'simple' | 'bioquimica'>('simple');

  const etapa = ETAPAS.find(e => e.id === etapaActiva)!;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>El Viaje de tu Comida</h1>
          <p className={styles.subtitle}>
            De la boca al intestino grueso: 6 etapas del sistema digestivo con tiempos reales,
            enzimas y datos sorprendentes
          </p>
        </header>

        <LegalNotice />

        {/* Timeline vertical cascada */}
        <div className={styles.timelineWrap}>
          {ETAPAS.map((e, i) => (
            <div key={e.id} className={styles.timelineRow}>
              <button
                type="button"
                className={`${styles.timelineStep} ${etapaActiva === e.id ? styles.timelineActivo : ''}`}
                onClick={() => setEtapaActiva(e.id)}
                style={etapaActiva === e.id ? { borderColor: e.color, backgroundColor: `${e.color}10` } : undefined}
                aria-pressed={etapaActiva === e.id}
              >
                <span
                  className={styles.stepNum}
                  style={etapaActiva === e.id ? { backgroundColor: e.color, color: 'white' } : undefined}
                >
                  {e.numero}
                </span>
                <span className={styles.stepIcono} aria-hidden="true">{e.icono}</span>
                <div className={styles.stepInfo}>
                  <span className={styles.stepTitulo}>{e.titulo}</span>
                  <span className={styles.stepOrgano}>{e.organo}</span>
                </div>
                <span className={styles.stepDuracion} style={etapaActiva === e.id ? { color: e.color } : undefined}>
                  {e.duracion}
                </span>
              </button>
              {i < ETAPAS.length - 1 && (
                <div className={styles.timelineConector}>
                  <div
                    className={styles.timelineLinea}
                    style={ETAPAS.findIndex(ee => ee.id === etapaActiva) > i ? { backgroundColor: e.color } : undefined}
                  />
                  <span className={styles.timelineFlecha} aria-hidden="true">↓</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Barra de progreso */}
        <div className={styles.progressBar}>
          {ETAPAS.map((e, i) => (
            <div
              key={e.id}
              className={styles.progressSegment}
              style={
                ETAPAS.findIndex(ee => ee.id === etapaActiva) >= i
                  ? { backgroundColor: e.color }
                  : undefined
              }
            />
          ))}
        </div>

        {/* Toggle simple/bioquímica */}
        <div className={styles.vistaToggle}>
          <button
            type="button"
            className={`${styles.vistaBtn} ${vistaDetalle === 'simple' ? styles.vistaActiva : ''}`}
            onClick={() => setVistaDetalle('simple')}
            aria-pressed={vistaDetalle === 'simple'}
          >
            Explicación simple
          </button>
          <button
            type="button"
            className={`${styles.vistaBtn} ${vistaDetalle === 'bioquimica' ? styles.vistaActiva : ''}`}
            onClick={() => setVistaDetalle('bioquimica')}
            aria-pressed={vistaDetalle === 'bioquimica'}
          >
            Proceso bioquímico
          </button>
        </div>

        {/* Detalle de la etapa */}
        <div className={styles.etapaDetalle} style={{ borderLeftColor: etapa.color }}>
          <div className={styles.etapaHeader}>
            <span className={styles.etapaIcono} aria-hidden="true">{etapa.icono}</span>
            <div>
              <span className={styles.etapaNum} style={{ color: etapa.color }}>
                Etapa {etapa.numero} · {etapa.duracion}
              </span>
              <h2 className={styles.etapaTitulo}>{etapa.titulo}</h2>
              <span className={styles.etapaOrgano}>{etapa.organo}</span>
            </div>
          </div>

          <p className={styles.etapaTexto}>
            {vistaDetalle === 'simple' ? etapa.queOcurre : etapa.procesoBioquimico}
          </p>

          <div className={styles.etapaSorpresa}>
            <span className={styles.sorpresaLabel}>Dato sorprendente</span>
            <p>{etapa.datoSorprendente}</p>
          </div>

          {/* Navegación */}
          <div className={styles.etapaNav}>
            <button
              type="button"
              className={styles.etapaNavBtn}
              onClick={() => {
                const idx = ETAPAS.findIndex(e => e.id === etapaActiva);
                if (idx > 0) setEtapaActiva(ETAPAS[idx - 1].id);
              }}
              disabled={ETAPAS.findIndex(e => e.id === etapaActiva) === 0}
            >
              ← Anterior
            </button>
            <span className={styles.etapaNavInfo}>{etapa.numero} / {ETAPAS.length}</span>
            <button
              type="button"
              className={styles.etapaNavBtn}
              onClick={() => {
                const idx = ETAPAS.findIndex(e => e.id === etapaActiva);
                if (idx < ETAPAS.length - 1) setEtapaActiva(ETAPAS[idx + 1].id);
              }}
              disabled={ETAPAS.findIndex(e => e.id === etapaActiva) === ETAPAS.length - 1}
            >
              Siguiente →
            </button>
          </div>
        </div>

        {/* Resumen de datos */}
        <div className={styles.resumenSection}>
          <h3 className={styles.resumenTitulo}>El sistema digestivo en cifras</h3>
          <div className={styles.resumenGrid}>
            {DATOS_RESUMEN.map((d, i) => (
              <div key={i} className={styles.resumenCard}>
                <span className={styles.resumenIcono} aria-hidden="true">{d.icono}</span>
                <span className={styles.resumenCifra}>{d.cifra}</span>
                <span className={styles.resumenDesc}>{d.descripcion}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.insight}>
          <p>
            El sistema digestivo no es un simple tubo: es un ecosistema complejo con <strong>más
            neuronas que la médula espinal</strong>, 100 billones de bacterias aliadas y una
            superficie de absorción del tamaño de una cancha de tenis, todo comprimido en 9 metros.
          </p>
        </div>

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Relacionado →{' '}
          <a href="/visualizador-envejecimiento-cuerpo/">Cómo Envejece el Cuerpo</a> ·{' '}
          <a href="/visualizador-huella-alimentos/">Huella de los Alimentos</a>
        </div>

        <EducationalSection
          title="Biología del sistema digestivo"
          subtitle="Conceptos clave para secundaria, preparatoria y Bachillerato"
          defaultOpen={false}
        >
          <h3>Las enzimas digestivas: las herramientas moleculares</h3>
          <p>
            Las enzimas son proteínas catalizadoras que aceleran reacciones químicas sin consumirse.
            Cada enzima digestiva actúa sobre un sustrato específico (principio llave-cerradura):
            la amilasa rompe el almidón, la pepsina y tripsina rompen proteínas, la lipasa rompe
            grasas, y la lactasa rompe la lactosa. La intolerancia a la lactosa es precisamente la
            deficiencia de esta última enzima.
          </p>

          <h3>El pH a lo largo del tubo digestivo</h3>
          <p>
            El pH varía drásticamente en cada tramo para activar distintas enzimas: boca (~7,
            neutro), estómago (1,5-2, muy ácido), duodeno (6-7, ligeramente ácido gracias al
            bicarbonato pancreático), intestino delgado (7-8, ligeramente alcalino), intestino
            grueso (5,5-7, ligeramente ácido por fermentación bacteriana). Los antiácidos funcionan
            neutralizando el HCl gástrico, subiendo el pH del estómago.
          </p>

          <h3>La microbiota intestinal: el segundo genoma</h3>
          <p>
            El intestino grueso alberga unos 100 billones de microorganismos (bacterias, arqueas,
            hongos, virus). Este ecosistema tiene 150 veces más genes que el genoma humano. La
            microbiota entrena al sistema inmune, produce vitaminas, fermenta fibra en energía
            para el colon y protege frente a patógenos. Los antibióticos pueden alterar la
            microbiota durante meses; los probióticos y la dieta rica en fibra la favorecen.
          </p>

          <h3>Regulación hormonal de la digestión</h3>
          <p>
            La digestión está controlada por hormonas gastrointestinales. La <em>gastrina</em>
            (estómago) estimula la secreción de HCl. La <em>secretina</em> (duodeno) estimula
            la secreción de bicarbonato pancreático. La <em>colecistoquinina (CCK)</em> estimula
            la vesícula biliar y el páncreas exocrino. La <em>ghrelina</em> (estómago vacío)
            genera la sensación de hambre; la <em>leptina</em> (tejido adiposo) genera saciedad.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota académica:</strong> los tiempos de tránsito son estimaciones para una
            persona adulta sana en reposo. Varían según el tipo de alimento (las grasas tardan más,
            los líquidos menos), la actividad física, la edad y el estado de salud. Esta información
            es de carácter educativo y no sustituye el consejo médico.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-viaje-comida')} />
        <ShareCard appName="visualizador-viaje-comida" />
        <Footer appName="visualizador-viaje-comida" />
    </div>
  );
}
