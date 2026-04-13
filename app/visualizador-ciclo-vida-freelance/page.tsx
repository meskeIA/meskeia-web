'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorCicloVidaFreelance.module.css';
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
// Tipos y datos
// ─────────────────────────────────────────────

interface FaseProyecto {
  id: string;
  nombre: string;
  icono: string;
  diasMin: number;
  diasMax: number;
  facturable: 'si' | 'no' | 'parcial';
  colorBarra: string;
  descripcion: string;
  tareas: string[];
  cuelloBotella: string;
  tip: string;
}

const FASES: FaseProyecto[] = [
  {
    id: 'captacion',
    nombre: 'Captacion',
    icono: '\uD83C\uDFAF',
    diasMin: 5,
    diasMax: 15,
    facturable: 'no',
    colorBarra: '#e74c3c',
    descripcion: 'Buscar clientes activamente: networking, portafolio, redes sociales, plataformas, referencias. Es el motor del negocio, pero no genera ingresos directos.',
    tareas: [
      'Mantener portafolio actualizado',
      'Publicar contenido en redes profesionales',
      'Asistir a eventos y networking',
      'Responder a ofertas en plataformas',
      'Pedir referencias a clientes anteriores',
    ],
    cuelloBotella: 'Depender de un solo canal de captacion. Si ese canal falla, no hay proyectos.',
    tip: 'Diversifica: al menos 3 canales activos (web propia, LinkedIn, referencias). Dedica 2-3 horas semanales a captacion incluso cuando tengas trabajo.',
  },
  {
    id: 'propuesta',
    nombre: 'Propuesta',
    icono: '\uD83D\uDCDD',
    diasMin: 2,
    diasMax: 5,
    facturable: 'no',
    colorBarra: '#e74c3c',
    descripcion: 'Redactar propuesta comercial, estimar tiempo y coste, definir alcance y entregables. Es trabajo especializado que no se cobra.',
    tareas: [
      'Analizar requisitos del cliente',
      'Estimar horas y complejidad',
      'Redactar propuesta con alcance definido',
      'Definir entregables concretos',
      'Establecer plazos realistas',
    ],
    cuelloBotella: 'Subestimar el alcance. El 70% de los freelancers subestiman el tiempo necesario en al menos un 30%.',
    tip: 'Multiplica tu estimacion por 1,5. Incluye siempre clausula de cambios de alcance. Usa plantillas para no empezar de cero.',
  },
  {
    id: 'negociacion',
    nombre: 'Negociacion',
    icono: '\uD83E\uDD1D',
    diasMin: 3,
    diasMax: 10,
    facturable: 'no',
    colorBarra: '#e74c3c',
    descripcion: 'Negociar precio, plazos, condiciones de pago y alcance final. Muchos freelancers ceden demasiado por miedo a perder el proyecto.',
    tareas: [
      'Defender el precio propuesto',
      'Negociar condiciones de pago (anticipo)',
      'Acordar plazos y revisiones incluidas',
      'Firmar contrato o acuerdo escrito',
      'Definir canal de comunicacion',
    ],
    cuelloBotella: 'Ceder demasiado por miedo a perder el cliente. Si bajas el precio un 30%, necesitas un 43% mas de proyectos para facturar lo mismo.',
    tip: 'Pide siempre un anticipo del 30-50% antes de empezar. Sin anticipo, no hay compromiso real del cliente.',
  },
  {
    id: 'ejecucion',
    nombre: 'Ejecucion',
    icono: '\u2699\uFE0F',
    diasMin: 10,
    diasMax: 30,
    facturable: 'si',
    colorBarra: '#27ae60',
    descripcion: 'El trabajo tecnico real: la unica fase que genera ingresos directos. Incluye comunicacion con el cliente, reuniones de seguimiento y revisiones intermedias.',
    tareas: [
      'Trabajo tecnico (diseno, desarrollo, redaccion...)',
      'Comunicacion con el cliente',
      'Reuniones de seguimiento',
      'Revisiones intermedias',
      'Documentacion del progreso',
    ],
    cuelloBotella: 'Scope creep: el cliente pide "pequenos cambios" que acumulados suponen un 20-40% mas de trabajo no presupuestado.',
    tip: 'Documenta cada peticion extra por escrito. Si supera el alcance, presupuesta aparte. "Eso no estaba en la propuesta, lo presupuesto como fase 2."',
  },
  {
    id: 'entrega',
    nombre: 'Entrega',
    icono: '\uD83D\uDCE6',
    diasMin: 1,
    diasMax: 3,
    facturable: 'parcial',
    colorBarra: '#f39c12',
    descripcion: 'Entrega final, ultimas revisiones, documentacion y traspaso. Es parcialmente facturable: la entrega en si lo es, pero las revisiones extra a menudo no.',
    tareas: [
      'Preparar entrega final',
      'Documentar el trabajo realizado',
      'Revisiones de ultima hora',
      'Traspaso al cliente',
      'Obtener aprobacion formal',
    ],
    cuelloBotella: 'El cliente tarda en aprobar. Sin aprobacion no puedes facturar, y el proyecto queda "en limbo" semanas.',
    tip: 'Incluye en el contrato: "Sin respuesta en 5 dias habiles, se considera aprobado". Factura al entregar, no al aprobar.',
  },
  {
    id: 'facturacion',
    nombre: 'Facturacion',
    icono: '\uD83E\uDDFE',
    diasMin: 1,
    diasMax: 2,
    facturable: 'no',
    colorBarra: '#e74c3c',
    descripcion: 'Emitir factura, gestion administrativa, IVA, IRPF, modelo 303/130. Tiempo puro de gestion que ningun cliente paga.',
    tareas: [
      'Emitir factura con datos correctos',
      'Registrar en libro de facturas',
      'Calcular IVA e IRPF',
      'Enviar al cliente',
      'Archivar para la declaracion trimestral',
    ],
    cuelloBotella: 'Olvidar facturar a tiempo. Cuanto mas tardes en facturar, mas tardaras en cobrar.',
    tip: 'Factura el mismo dia de la entrega. Usa software de facturacion automatizado. Configura recordatorios.',
  },
  {
    id: 'cobro',
    nombre: 'Cobro',
    icono: '\uD83D\uDCB0',
    diasMin: 30,
    diasMax: 60,
    facturable: 'no',
    colorBarra: '#e74c3c',
    descripcion: 'Esperar el pago, reclamar si hay retraso. El plazo medio de cobro en Espana es de 82 dias, muy por encima del maximo legal de 60 dias.',
    tareas: [
      'Verificar recepcion de factura',
      'Seguimiento del pago',
      'Reclamar si hay retraso',
      'Aplicar intereses de demora si procede',
      'Valorar si reclamar judicialmente',
    ],
    cuelloBotella: 'Morosidad. El 40% de los autonomos espanoles ha sufrido impagos. El plazo medio real de cobro en Espana es de 82 dias.',
    tip: 'Anticipo del 30-50% + pago a 30 dias maximo. Si el cliente paga tarde sistematicamente, sube el precio un 15-20% para compensar.',
  },
];

// ─────────────────────────────────────────────
// Funciones auxiliares
// ─────────────────────────────────────────────

function etiquetaFacturable(tipo: 'si' | 'no' | 'parcial'): string {
  switch (tipo) {
    case 'si': return 'Facturable';
    case 'no': return 'No facturable';
    case 'parcial': return 'Parcialmente facturable';
  }
}

function colorFacturable(tipo: 'si' | 'no' | 'parcial'): string {
  switch (tipo) {
    case 'si': return '#27ae60';
    case 'no': return '#e74c3c';
    case 'parcial': return '#f39c12';
  }
}

// ─────────────────────────────────────────────
// Componente: Timeline visual
// ─────────────────────────────────────────────

function TimelineVisual({ onSelectFase, faseActiva }: { onSelectFase: (id: string | null) => void; faseActiva: string | null }) {
  const totalDiasMax = FASES.reduce((sum, f) => sum + f.diasMax, 0);

  return (
    <div className={styles.timelineContainer}>
      <h2 className={styles.timelineTitulo}>Timeline del proyecto</h2>
      <p className={styles.timelineSubtitulo}>Duracion proporcional de cada fase (escenario maximo)</p>

      <div className={styles.timelineBarra}>
        {FASES.map(fase => {
          const pct = (fase.diasMax / totalDiasMax) * 100;
          return (
            <button
              key={fase.id}
              type="button"
              className={`${styles.timelineSegmento} ${faseActiva === fase.id ? styles.timelineSegmentoActivo : ''}`}
              style={{ width: `${pct}%`, background: fase.colorBarra }}
              onClick={() => onSelectFase(faseActiva === fase.id ? null : fase.id)}
              aria-label={`${fase.nombre}: ${fase.diasMax} dias, ${etiquetaFacturable(fase.facturable)}`}
              aria-pressed={faseActiva === fase.id}
            >
              <span className={styles.timelineSegmentoIcono} aria-hidden="true">{fase.icono}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.timelineLeyenda}>
        <div className={styles.leyendaItem}>
          <span className={styles.leyendaDot} style={{ background: '#27ae60' }} />
          <span>Facturable</span>
        </div>
        <div className={styles.leyendaItem}>
          <span className={styles.leyendaDot} style={{ background: '#f39c12' }} />
          <span>Parcial</span>
        </div>
        <div className={styles.leyendaItem}>
          <span className={styles.leyendaDot} style={{ background: '#e74c3c' }} />
          <span>No facturable</span>
        </div>
      </div>

      <div className={styles.timelineEtiquetas}>
        {FASES.map(fase => {
          const pct = (fase.diasMax / totalDiasMax) * 100;
          return (
            <span key={fase.id} className={styles.timelineEtiqueta} style={{ width: `${pct}%` }}>
              {fase.diasMin}-{fase.diasMax}d
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente: Bloques de fases
// ─────────────────────────────────────────────

function BloquesFases({ faseActiva, onSelectFase }: { faseActiva: string | null; onSelectFase: (id: string | null) => void }) {
  return (
    <div className={styles.fasesGrid}>
      {FASES.map((fase, i) => {
        const activa = faseActiva === fase.id;
        return (
          <div key={fase.id} className={styles.faseWrapper}>
            <button
              type="button"
              className={`${styles.faseCard} ${activa ? styles.faseCardActiva : ''}`}
              onClick={() => onSelectFase(activa ? null : fase.id)}
              aria-expanded={activa}
            >
              <div className={styles.faseCardHeader}>
                <span className={styles.faseNumero}>{i + 1}</span>
                <span className={styles.faseIcono} aria-hidden="true">{fase.icono}</span>
                <span className={styles.faseNombre}>{fase.nombre}</span>
                <span className={styles.faseDias}>{fase.diasMin}-{fase.diasMax} dias</span>
              </div>
              <span
                className={styles.faseEtiqueta}
                style={{ background: colorFacturable(fase.facturable), color: 'white' }}
              >
                {etiquetaFacturable(fase.facturable)}
              </span>
            </button>

            {activa && (
              <div className={styles.faseDetalle}>
                <p className={styles.faseDesc}>{fase.descripcion}</p>

                <div className={styles.faseTareasBox}>
                  <h4 className={styles.faseTareasTitle}>Tareas tipicas</h4>
                  <ul className={styles.faseTareasList}>
                    {fase.tareas.map((t, j) => (
                      <li key={j}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.faseCuelloBox}>
                  <div className={styles.faseCuelloHeader}>
                    <span aria-hidden="true">&#9888;&#65039;</span>
                    <strong>Cuello de botella</strong>
                  </div>
                  <p>{fase.cuelloBotella}</p>
                </div>

                <div className={styles.faseTipBox}>
                  <div className={styles.faseTipHeader}>
                    <span aria-hidden="true">&#128161;</span>
                    <strong>Consejo</strong>
                  </div>
                  <p>{fase.tip}</p>
                </div>
              </div>
            )}

            {i < FASES.length - 1 && (
              <div className={styles.faseFlecha} aria-hidden="true">&#8595;</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente: Resumen de numeros
// ─────────────────────────────────────────────

function ResumenNumeros() {
  const totalMin = FASES.reduce((s, f) => s + f.diasMin, 0);
  const totalMax = FASES.reduce((s, f) => s + f.diasMax, 0);

  // Facturable: solo ejecucion (100%) + entrega (50%)
  const facturableMin = 10 + 1 * 0.5;
  const facturableMax = 30 + 3 * 0.5;

  const pctFacturableMin = (facturableMin / totalMax) * 100;
  const pctFacturableMax = (facturableMax / totalMin) * 100;

  const tarifaEjemplo = 50; // euros/hora
  const horasDiaTrabajo = 6;

  const horasRealesMin = totalMin * horasDiaTrabajo;
  const horasRealesMax = totalMax * horasDiaTrabajo;
  const horasFacturablesMin = facturableMin * horasDiaTrabajo;
  const horasFacturablesMax = facturableMax * horasDiaTrabajo;

  const tarifaRealMin = (tarifaEjemplo * horasFacturablesMin) / horasRealesMax;
  const tarifaRealMax = (tarifaEjemplo * horasFacturablesMax) / horasRealesMin;

  return (
    <div className={styles.resumenCard}>
      <h2 className={styles.resumenTitulo}>La realidad en numeros</h2>

      <div className={styles.resumenGrid}>
        <div className={styles.resumenItem}>
          <span className={styles.resumenIcono} aria-hidden="true">&#128197;</span>
          <span className={styles.resumenLabel}>Duracion total del ciclo</span>
          <span className={styles.resumenValor}>{totalMin} - {totalMax} dias</span>
        </div>
        <div className={styles.resumenItem}>
          <span className={styles.resumenIcono} aria-hidden="true">&#9989;</span>
          <span className={styles.resumenLabel}>Tiempo facturable</span>
          <span className={styles.resumenValor} style={{ color: '#27ae60' }}>
            {formatNumber(pctFacturableMin, 0)} - {formatNumber(pctFacturableMax, 0)}%
          </span>
        </div>
        <div className={styles.resumenItem}>
          <span className={styles.resumenIcono} aria-hidden="true">&#10060;</span>
          <span className={styles.resumenLabel}>Tiempo no facturable</span>
          <span className={styles.resumenValor} style={{ color: '#e74c3c' }}>
            {formatNumber(100 - pctFacturableMax, 0)} - {formatNumber(100 - pctFacturableMin, 0)}%
          </span>
        </div>
      </div>

      {/* Barra visual facturable vs no facturable */}
      <div className={styles.resumenBarraContainer}>
        <p className={styles.resumenBarraLabel}>Distribucion del tiempo (escenario tipico)</p>
        <div className={styles.resumenBarra}>
          <div className={styles.resumenBarraSegmento} style={{ width: '35%', background: '#e74c3c' }}>
            <span>Preventa</span>
          </div>
          <div className={styles.resumenBarraSegmento} style={{ width: '40%', background: '#27ae60' }}>
            <span>Ejecucion</span>
          </div>
          <div className={styles.resumenBarraSegmento} style={{ width: '5%', background: '#f39c12' }}>
            <span></span>
          </div>
          <div className={styles.resumenBarraSegmento} style={{ width: '20%', background: '#e74c3c' }}>
            <span>Cobro</span>
          </div>
        </div>
      </div>

      {/* Calculo tarifa real */}
      <div className={styles.tarifaCard}>
        <h3 className={styles.tarifaTitulo}>Si cobras {formatNumber(tarifaEjemplo, 0)} &euro;/hora...</h3>
        <div className={styles.tarifaComparacion}>
          <div className={styles.tarifaColumna}>
            <span className={styles.tarifaLabel}>Tarifa nominal</span>
            <span className={styles.tarifaValorNominal}>{formatNumber(tarifaEjemplo, 0)} &euro;/h</span>
          </div>
          <div className={styles.tarifaFlecha} aria-hidden="true">&#8594;</div>
          <div className={styles.tarifaColumna}>
            <span className={styles.tarifaLabel}>Tarifa real (contando todo)</span>
            <span className={styles.tarifaValorReal}>
              {formatNumber(tarifaRealMin, 0)} - {formatNumber(tarifaRealMax, 0)} &euro;/h
            </span>
          </div>
        </div>
        <p className={styles.tarifaNota}>
          Contando las horas de captacion, propuesta, negociacion, facturacion y cobro
          que ningun cliente paga directamente.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCicloVidaFreelancePage() {
  const [faseActiva, setFaseActiva] = useState<string | null>(null);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>El Ciclo de Vida de un Proyecto Freelance</h1>
          <p className={styles.subtitle}>Visualiza las fases, tiempos y cuellos de botella de cada proyecto</p>
        </header>

        <LegalNotice />

        {/* Timeline visual */}
        <TimelineVisual onSelectFase={setFaseActiva} faseActiva={faseActiva} />

        {/* Bloques de fases clickables */}
        <BloquesFases faseActiva={faseActiva} onSelectFase={setFaseActiva} />

        {/* Resumen numerico */}
        <ResumenNumeros />

        {/* Insight destacado */}
        <div className={styles.insight}>
          <p>
            El freelance no es solo &laquo;hacer el trabajo&raquo;. Por cada hora facturable,
            hay entre 30 y 60 minutos de trabajo invisible: captar, negociar, facturar, cobrar.
            Los freelancers que prosperan son los que <strong>gestionan todo el ciclo</strong>,
            no solo la fase de ejecucion.
          </p>
        </div>

        <EducationalSection
          title="Aprende sobre gestion de proyectos freelance"
          subtitle="Conceptos clave para mejorar tu rentabilidad como autonomo"
          defaultOpen={false}
        >
          <h3>El tiempo no facturable: el enemigo silencioso</h3>
          <p>
            La mayoria de freelancers calculan su tarifa dividiendo lo que quieren ganar al mes
            entre las horas que pueden trabajar. Pero olvidan que entre el 40% y el 60% de su
            tiempo no es facturable: buscar clientes, hacer propuestas, negociar, facturar, cobrar,
            formarse y gestionar la administracion. Si quieres ganar 3.000 &euro; netos al mes,
            tu tarifa debe reflejar que solo la mitad de tu tiempo genera ingresos.
          </p>

          <h3>Scope creep: cuando el proyecto crece sin control</h3>
          <p>
            El <em>scope creep</em> es el fenomeno por el que un proyecto se expande poco a poco
            mas alla del alcance original. &laquo;Ya que estamos, podrias anadir...&raquo;,
            &laquo;esto deberia ser rapido...&raquo;, &laquo;una ultima cosa...&raquo;.
            Cada peticion parece pequena, pero acumuladas pueden suponer un 20-40% mas de trabajo
            no presupuestado. La solucion: definir el alcance por escrito antes de empezar y
            presupuestar aparte cualquier cambio.
          </p>

          <h3>La morosidad en Espana: un problema estructural</h3>
          <p>
            Segun datos de CEPYME (2024), el plazo medio de pago en Espana es de 82 dias,
            muy por encima del maximo legal de 60 dias. El 40% de los autonomos ha sufrido
            al menos un impago significativo. Para protegerte: anticipo del 30-50% antes de
            empezar, pago por hitos en proyectos largos y clausula de intereses de demora
            en el contrato.
          </p>

          <h3>Formula para calcular tu tarifa real</h3>
          <p>
            Una formula sencilla: <strong>Tarifa = (Gastos mensuales + Beneficio deseado) /
            Horas facturables reales</strong>. Si tus gastos son 2.000 &euro;/mes, quieres
            ganar 1.500 &euro; mas y solo puedes facturar 80 horas al mes (de 160 disponibles),
            tu tarifa minima es de 43,75 &euro;/hora. Sin este calculo, muchos freelancers
            acaban cobrando por debajo de lo que necesitan para ser sostenibles.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los tiempos y porcentajes de este explicador son medias
            aproximadas basadas en estudios del sector freelance en Espana. Cada proyecto y
            sector es diferente. No constituye asesoramiento profesional ni financiero.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-ciclo-vida-freelance')} />
        <ShareCard appName="visualizador-ciclo-vida-freelance" />
        <Footer appName="visualizador-ciclo-vida-freelance" />
      </div>
    </>
  );
}
