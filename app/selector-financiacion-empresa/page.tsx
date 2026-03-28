'use client';

import { useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './SelectorFinanciacionEmpresa.module.css';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type FinanciacionId =
  | 'autofinanciacion'
  | 'prestamo_bancario'
  | 'inversores'
  | 'crowdfunding'
  | 'subvenciones';

interface OpcionFinanciacion {
  id: FinanciacionId;
  nombre: string;
  icono: string;
  tagline: string;
  descripcion: string;
}

interface PesoOpcion {
  tipo: FinanciacionId;
  peso: number;
}

interface Opcion {
  texto: string;
  pesos: PesoOpcion[];
}

interface Pregunta {
  id: number;
  icono: string;
  texto: string;
  opciones: Opcion[];
}

type Puntuaciones = Record<FinanciacionId, number>;

// ─── Datos ────────────────────────────────────────────────────────────────────

const OPCIONES_FINANCIACION: OpcionFinanciacion[] = [
  {
    id: 'autofinanciacion',
    nombre: 'Autofinanciación (Bootstrapping)',
    icono: '🏦',
    tagline: 'Crecer con ingresos propios, sin deuda ni ceder capital',
    descripcion:
      'El bootstrapping consiste en financiar el negocio con recursos propios y con los ingresos que genera la propia actividad. Ofreces máximo control sobre la empresa sin deudas ni inversores, pero el crecimiento suele ser más lento. Es la opción ideal si tienes bajos costes iniciales, puedes generar caja desde el principio y valoras la independencia total.',
  },
  {
    id: 'prestamo_bancario',
    nombre: 'Préstamo Bancario o ICO',
    icono: '🏛️',
    tagline: 'Financiación estructurada para proyectos consolidados con capacidad de devolución',
    descripcion:
      'Los préstamos bancarios y las líneas ICO (Instituto de Crédito Oficial) son la vía tradicional de financiación para pymes y autónomos. Requieren historial de facturación, garantías o avales y un plan de negocio sólido. Las líneas ICO ofrecen condiciones ventajosas (tipos más bajos, plazos más largos) para proyectos de inversión o liquidez. No implica ceder participación en la empresa.',
  },
  {
    id: 'inversores',
    nombre: 'Inversores o Business Angels',
    icono: '🤝',
    tagline: 'Capital + mentoring para startups con alto potencial de crecimiento',
    descripcion:
      'Los business angels son inversores privados que aportan capital, experiencia y red de contactos a cambio de una participación en la empresa. El capital riesgo (venture capital) opera de forma similar pero con ticket mayor y mayor formalización. Es la opción adecuada para proyectos escalables con alto potencial de crecimiento que necesitan capital intensivo. Implica ceder parte del control y asumir expectativas de rentabilidad.',
  },
  {
    id: 'crowdfunding',
    nombre: 'Crowdfunding',
    icono: '🌐',
    tagline: 'Validación y financiación simultánea desde la comunidad',
    descripcion:
      'El crowdfunding permite financiar un proyecto a través de pequeñas aportaciones de muchas personas, normalmente a través de plataformas como Kickstarter, Indiegogo o Goteo. Es especialmente eficaz para productos físicos, proyectos creativos o iniciativas con base de seguidores. Tiene la ventaja de validar la demanda antes de producir. Existe el crowdfunding de recompensa (pre-ventas), el de donación y el de inversión (equity crowdfunding).',
  },
  {
    id: 'subvenciones',
    nombre: 'Subvenciones y Ayudas Públicas',
    icono: '📋',
    tagline: 'Financiación no reembolsable para proyectos innovadores, sostenibles o prioritarios',
    descripcion:
      'Las subvenciones públicas (CDTI, ENISA, ICEX, ayudas autonómicas, fondos europeos) ofrecen financiación no reembolsable o en condiciones muy ventajosas para proyectos innovadores, de internacionalización, sostenibilidad o en sectores estratégicos. El proceso de solicitud es largo y requiere documentación exhaustiva, pero el retorno puede ser muy alto. Requiere conocer la convocatoria adecuada y preparar una memoria técnica rigurosa.',
  },
];

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    icono: '🌱',
    texto: '¿En qué fase se encuentra tu negocio?',
    opciones: [
      {
        texto: 'Idea o proyecto — todavía no tengo clientes ni ingresos',
        pesos: [
          { tipo: 'crowdfunding', peso: 3 },
          { tipo: 'inversores', peso: 2 },
          { tipo: 'subvenciones', peso: 2 },
        ],
      },
      {
        texto: 'Validado — tengo algunos clientes y estoy generando primeros ingresos',
        pesos: [
          { tipo: 'autofinanciacion', peso: 2 },
          { tipo: 'prestamo_bancario', peso: 2 },
          { tipo: 'inversores', peso: 2 },
        ],
      },
      {
        texto: 'En crecimiento — tengo facturación estable y quiero escalar',
        pesos: [
          { tipo: 'prestamo_bancario', peso: 3 },
          { tipo: 'autofinanciacion', peso: 2 },
          { tipo: 'inversores', peso: 1 },
        ],
      },
    ],
  },
  {
    id: 2,
    icono: '💶',
    texto: '¿Qué importe de financiación necesitas aproximadamente?',
    opciones: [
      {
        texto: 'Menos de 20.000 € — arrancar con poco',
        pesos: [
          { tipo: 'autofinanciacion', peso: 3 },
          { tipo: 'crowdfunding', peso: 2 },
          { tipo: 'subvenciones', peso: 1 },
        ],
      },
      {
        texto: 'Entre 20.000 € y 150.000 € — inversión moderada',
        pesos: [
          { tipo: 'prestamo_bancario', peso: 3 },
          { tipo: 'subvenciones', peso: 2 },
          { tipo: 'crowdfunding', peso: 1 },
        ],
      },
      {
        texto: 'Más de 150.000 € — crecimiento ambicioso',
        pesos: [
          { tipo: 'inversores', peso: 3 },
          { tipo: 'prestamo_bancario', peso: 2 },
          { tipo: 'subvenciones', peso: 1 },
        ],
      },
    ],
  },
  {
    id: 3,
    icono: '🏠',
    texto: '¿Puedes aportar garantías personales o avales para un préstamo?',
    opciones: [
      {
        texto: 'Sí, tengo bienes o avales que puedo comprometer',
        pesos: [
          { tipo: 'prestamo_bancario', peso: 3 },
        ],
      },
      {
        texto: 'Parcialmente — puedo aportar algo pero no cubre el total',
        pesos: [
          { tipo: 'prestamo_bancario', peso: 1 },
          { tipo: 'subvenciones', peso: 2 },
          { tipo: 'crowdfunding', peso: 1 },
        ],
      },
      {
        texto: 'No, no tengo garantías o prefiero no comprometer patrimonio personal',
        pesos: [
          { tipo: 'inversores', peso: 2 },
          { tipo: 'crowdfunding', peso: 2 },
          { tipo: 'subvenciones', peso: 2 },
          { tipo: 'autofinanciacion', peso: 1 },
        ],
      },
    ],
  },
  {
    id: 4,
    icono: '🤲',
    texto: '¿Estás dispuesto a ceder parte del capital de tu empresa a cambio de financiación?',
    opciones: [
      {
        texto: 'Sí, si el inversor aporta también experiencia y contactos',
        pesos: [
          { tipo: 'inversores', peso: 3 },
        ],
      },
      {
        texto: 'Solo una participación pequeña y minoritaria',
        pesos: [
          { tipo: 'inversores', peso: 1 },
          { tipo: 'crowdfunding', peso: 2 },
        ],
      },
      {
        texto: 'No, prefiero mantener el 100 % del control de mi empresa',
        pesos: [
          { tipo: 'autofinanciacion', peso: 3 },
          { tipo: 'prestamo_bancario', peso: 2 },
          { tipo: 'subvenciones', peso: 2 },
        ],
      },
    ],
  },
  {
    id: 5,
    icono: '⏱️',
    texto: '¿Con qué urgencia necesitas el dinero?',
    opciones: [
      {
        texto: 'De inmediato o en menos de 2 meses',
        pesos: [
          { tipo: 'autofinanciacion', peso: 3 },
          { tipo: 'crowdfunding', peso: 2 },
          { tipo: 'inversores', peso: 1 },
        ],
      },
      {
        texto: 'En 2 a 6 meses — tengo margen para tramitar',
        pesos: [
          { tipo: 'prestamo_bancario', peso: 3 },
          { tipo: 'inversores', peso: 2 },
          { tipo: 'crowdfunding', peso: 1 },
        ],
      },
      {
        texto: 'Puedo esperar más de 6 meses si merece la pena',
        pesos: [
          { tipo: 'subvenciones', peso: 3 },
          { tipo: 'prestamo_bancario', peso: 1 },
        ],
      },
    ],
  },
  {
    id: 6,
    icono: '📊',
    texto: '¿Tienes historial de facturación o cuentas auditadas?',
    opciones: [
      {
        texto: 'Sí, llevo al menos 2 años facturando y tengo cuentas ordenadas',
        pesos: [
          { tipo: 'prestamo_bancario', peso: 3 },
          { tipo: 'autofinanciacion', peso: 1 },
        ],
      },
      {
        texto: 'Tengo algo de historial pero es reciente o irregular',
        pesos: [
          { tipo: 'crowdfunding', peso: 2 },
          { tipo: 'subvenciones', peso: 2 },
          { tipo: 'inversores', peso: 1 },
        ],
      },
      {
        texto: 'No, soy empresa nueva sin historial financiero',
        pesos: [
          { tipo: 'inversores', peso: 2 },
          { tipo: 'crowdfunding', peso: 2 },
          { tipo: 'subvenciones', peso: 2 },
          { tipo: 'autofinanciacion', peso: 1 },
        ],
      },
    ],
  },
  {
    id: 7,
    icono: '🔬',
    texto: '¿Tu proyecto es innovador o tecnológico?',
    opciones: [
      {
        texto: 'Sí, tiene componente de I+D, tecnología o innovación disruptiva',
        pesos: [
          { tipo: 'subvenciones', peso: 3 },
          { tipo: 'inversores', peso: 3 },
        ],
      },
      {
        texto: 'Tiene algún elemento diferencial pero no es tech puro',
        pesos: [
          { tipo: 'subvenciones', peso: 1 },
          { tipo: 'crowdfunding', peso: 2 },
          { tipo: 'prestamo_bancario', peso: 1 },
        ],
      },
      {
        texto: 'No, es un negocio tradicional o de servicios estándar',
        pesos: [
          { tipo: 'prestamo_bancario', peso: 3 },
          { tipo: 'autofinanciacion', peso: 2 },
        ],
      },
    ],
  },
  {
    id: 8,
    icono: '👥',
    texto: '¿Tienes una comunidad, seguidores o base de clientes potenciales que podrían apoyarte?',
    opciones: [
      {
        texto: 'Sí, tengo una comunidad activa online o lista de contactos amplia',
        pesos: [
          { tipo: 'crowdfunding', peso: 3 },
          { tipo: 'autofinanciacion', peso: 1 },
        ],
      },
      {
        texto: 'Tengo algunos seguidores pero no una comunidad consolidada',
        pesos: [
          { tipo: 'crowdfunding', peso: 1 },
          { tipo: 'prestamo_bancario', peso: 1 },
          { tipo: 'subvenciones', peso: 1 },
        ],
      },
      {
        texto: 'No, parto de cero en cuanto a audiencia propia',
        pesos: [
          { tipo: 'inversores', peso: 2 },
          { tipo: 'prestamo_bancario', peso: 2 },
          { tipo: 'subvenciones', peso: 2 },
        ],
      },
    ],
  },
  {
    id: 9,
    icono: '📑',
    texto: '¿Conoces las ayudas públicas disponibles en tu sector o comunidad autónoma?',
    opciones: [
      {
        texto: 'Sí, he identificado convocatorias concretas que encajan con mi proyecto',
        pesos: [
          { tipo: 'subvenciones', peso: 3 },
        ],
      },
      {
        texto: 'Tengo conocimiento general pero no he profundizado',
        pesos: [
          { tipo: 'subvenciones', peso: 2 },
          { tipo: 'prestamo_bancario', peso: 1 },
        ],
      },
      {
        texto: 'No tengo ni idea de si existen ayudas para mi caso',
        pesos: [
          { tipo: 'prestamo_bancario', peso: 2 },
          { tipo: 'autofinanciacion', peso: 2 },
          { tipo: 'inversores', peso: 1 },
        ],
      },
    ],
  },
  {
    id: 10,
    icono: '🎓',
    texto: '¿Valoras recibir mentoring, red de contactos o acompañamiento además del dinero?',
    opciones: [
      {
        texto: 'Sí, es tan importante como la financiación en sí',
        pesos: [
          { tipo: 'inversores', peso: 3 },
        ],
      },
      {
        texto: 'Me vendría bien pero no es imprescindible',
        pesos: [
          { tipo: 'inversores', peso: 1 },
          { tipo: 'subvenciones', peso: 1 },
          { tipo: 'prestamo_bancario', peso: 1 },
        ],
      },
      {
        texto: 'No, prefiero autonomía total sin compromisos adicionales',
        pesos: [
          { tipo: 'autofinanciacion', peso: 3 },
          { tipo: 'prestamo_bancario', peso: 2 },
          { tipo: 'crowdfunding', peso: 1 },
        ],
      },
    ],
  },
];

// ─── Utilidades ───────────────────────────────────────────────────────────────

function calcularPuntuaciones(respuestas: number[]): Puntuaciones {
  const pts: Puntuaciones = {
    autofinanciacion: 0,
    prestamo_bancario: 0,
    inversores: 0,
    crowdfunding: 0,
    subvenciones: 0,
  };

  respuestas.forEach((respIdx, pregIdx) => {
    const opcion = PREGUNTAS[pregIdx]?.opciones[respIdx];
    if (!opcion) return;
    opcion.pesos.forEach(({ tipo, peso }) => {
      pts[tipo] += peso;
    });
  });

  return pts;
}

function tipoGanador(pts: Puntuaciones): FinanciacionId {
  return (Object.entries(pts) as [FinanciacionId, number][]).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )[0];
}

function rankingTipos(pts: Puntuaciones): { tipo: OpcionFinanciacion; puntos: number }[] {
  const max = Math.max(...Object.values(pts));
  return OPCIONES_FINANCIACION.map((tipo) => ({ tipo, puntos: pts[tipo.id] }))
    .sort((a, b) => b.puntos - a.puntos)
    .map((item) => ({ ...item, pct: max > 0 ? (item.puntos / max) * 100 : 0 }));
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function SelectorFinanciacionEmpresa() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>([]);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<number | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const totalPreguntas = PREGUNTAS.length;
  const progresoPct = (preguntaActual / totalPreguntas) * 100;
  const pregunta = PREGUNTAS[preguntaActual];

  function seleccionar(idx: number) {
    setRespuestaSeleccionada(idx);
  }

  function siguientePregunta() {
    if (respuestaSeleccionada === null) return;

    const nuevasRespuestas = [...respuestas, respuestaSeleccionada];
    setRespuestas(nuevasRespuestas);

    if (preguntaActual + 1 >= totalPreguntas) {
      setMostrarResultado(true);
    } else {
      setPreguntaActual(preguntaActual + 1);
      setRespuestaSeleccionada(null);
    }
  }

  function preguntaAnterior() {
    if (preguntaActual === 0) return;
    const nuevasRespuestas = respuestas.slice(0, -1);
    setRespuestas(nuevasRespuestas);
    setPreguntaActual(preguntaActual - 1);
    setRespuestaSeleccionada(nuevasRespuestas[preguntaActual - 1] ?? null);
  }

  function reiniciar() {
    setPreguntaActual(0);
    setRespuestas([]);
    setRespuestaSeleccionada(null);
    setMostrarResultado(false);
  }

  // ── Vista de resultado ──
  if (mostrarResultado) {
    const pts = calcularPuntuaciones(respuestas);
    const ganador = tipoGanador(pts);
    const tipoInfo = OPCIONES_FINANCIACION.find((t) => t.id === ganador)!;
    const ranking = rankingTipos(pts);
    const maxPuntos = ranking[0].puntos;

    return (
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1>Tu tipo de financiación ideal</h1>
          <p>Basado en tus respuestas, aquí tienes la recomendación personalizada</p>
        </header>

        <div className={styles.resultado}>
          <div className={styles.resultadoCard}>
            <span className={styles.resultadoIcono} aria-hidden="true">
              {tipoInfo.icono}
            </span>
            <h2 className={styles.resultadoTitulo}>{tipoInfo.nombre}</h2>
            <p className={styles.resultadoSubtitulo}>{tipoInfo.tagline}</p>
            <p className={styles.resultadoDesc}>{tipoInfo.descripcion}</p>

            <div className={styles.otrasOpciones}>
              <p className={styles.otrasOpcionesTitulo}>Puntuación de todas las opciones</p>
              {ranking.map(({ tipo, puntos }) => (
                <div key={tipo.id} className={styles.rankingItem}>
                  <span aria-hidden="true">{tipo.icono}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>{tipo.nombre}</span>
                  <div className={styles.rankingBarra}>
                    <div
                      className={styles.rankingRelleno}
                      style={{ width: `${maxPuntos > 0 ? (puntos / maxPuntos) * 100 : 0}%` }}
                    />
                  </div>
                  <span style={{ width: '2rem', textAlign: 'right' }}>{puntos}</span>
                </div>
              ))}
            </div>

            <div className={styles.btnReiniciar}>
              <button type="button" className={styles.btnPrimary} onClick={reiniciar}>
                Repetir el test
              </button>
            </div>
          </div>

          <DisclaimerCard variant="financial" severity="high" />

          <EducationalSection
            title="Tipos de financiación empresarial en España"
            subtitle="Entiende las opciones disponibles para financiar tu negocio"
          >
            <h3>¿Por qué importa elegir bien la financiación?</h3>
            <p>
              La elección del tipo de financiación condiciona la estructura de capital de tu empresa,
              el nivel de control que conservas, el coste financiero y la velocidad de crecimiento
              posible. No existe una opción universalmente mejor: cada vía tiene ventajas e
              inconvenientes que dependen del momento del negocio, el importe necesario y el perfil
              del emprendedor.
            </p>

            <h3>Autofinanciación (Bootstrapping)</h3>
            <p>
              Financiar el negocio con ahorros propios y reinvertir los ingresos generados es la
              forma más conservadora y la que mayor control ofrece. Es viable para negocios de
              servicios con bajos costes estructurales o modelos de negocio que generan caja desde
              el primer mes. El riesgo es que el crecimiento sea más lento y que el emprendedor
              asuma todo el riesgo financiero.
            </p>

            <h3>Préstamos bancarios y líneas ICO</h3>
            <p>
              Los préstamos bancarios siguen siendo la principal fuente de financiación para pymes
              en España. Las líneas ICO (Instituto de Crédito Oficial) canalizan fondos a través de
              entidades bancarias en condiciones más favorables: tipos de interés reducidos, plazos
              de amortización más largos y periodos de carencia. Existen líneas específicas para
              inversión, liquidez, internacionalización y empresas de nueva creación. El acceso
              requiere historial crediticio y, habitualmente, garantías reales o personales.
            </p>

            <h3>Inversores y business angels</h3>
            <p>
              Los business angels son personas físicas con experiencia empresarial que invierten
              capital propio en startups a cambio de participación. Aportan también red de contactos,
              conocimiento sectorial y mentoría activa. El venture capital opera de forma similar
              pero con importes más altos (generalmente a partir de 500.000 €) y una estructura
              más formal. España cuenta con redes como AEBAN (Asociación Española de Business Angels)
              y plataformas como SeedRocket o Lanzadera que conectan emprendedores e inversores.
            </p>

            <h3>Crowdfunding</h3>
            <p>
              Las plataformas de crowdfunding permiten obtener financiación de muchos pequeños
              aportantes a través de internet. En España destacan Kickstarter e Indiegogo para
              proyectos creativos y productos físicos, Goteo para proyectos de impacto social, y
              plataformas de equity crowdfunding como Crowdcube o Crowdfunder para startups que
              buscan inversores minoristas. La campaña exige preparación: vídeo, recompensas
              atractivas y una estrategia de comunicación activa durante todo el periodo.
            </p>

            <h3>Subvenciones y ayudas públicas</h3>
            <p>
              España ofrece un amplio ecosistema de ayudas para empresas innovadoras y pymes. A
              nivel estatal destacan el CDTI (Centro para el Desarrollo Tecnológico e Industrial),
              ENISA (préstamos participativos para startups), ICEX (internacionalización) y los
              fondos Next Generation EU. Las comunidades autónomas tienen además sus propios
              programas de apoyo a la creación de empresas, digitalización y contratación. El
              principal inconveniente es el tiempo: los procesos de solicitud son largos y la
              resolución puede tardar entre 6 meses y 2 años.
            </p>

            <h3>Combinar fuentes de financiación</h3>
            <p>
              En la práctica, muchas empresas combinan varias vías. Es habitual arrancar con
              bootstrapping para validar el modelo, solicitar un préstamo ICO para acometer la
              primera inversión significativa y, si el proyecto es escalable, abrir una ronda con
              business angels. Las subvenciones se gestionan de forma paralela como complemento no
              dilutivo.
            </p>

            <div className={styles.warningBox}>
              <strong>Importante:</strong> Antes de comprometer garantías personales en un
              préstamo o ceder capital a un inversor, consulta con un asesor financiero o jurídico.
              Las condiciones contractuales de cada vía de financiación tienen implicaciones a largo
              plazo que conviene entender en profundidad.
            </div>
          </EducationalSection>

          <RelatedApps apps={getRelatedApps('selector-financiacion-empresa')} />
          <ShareCard appName="selector-financiacion-empresa" />
          <Footer appName="selector-financiacion-empresa" />
        </div>
      </div>
    );
  }

  // ── Vista de quiz ──
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Selector de Financiación Empresarial</h1>
        <p>
          10 preguntas para descubrir qué tipo de financiación se adapta mejor a tu negocio:
          autofinanciación, préstamo bancario, inversores, crowdfunding o subvenciones
        </p>
      </header>

      <LegalNotice />

      <div className={styles.quiz}>
        <div className={styles.progreso}>
          <span>
            {preguntaActual + 1} / {totalPreguntas}
          </span>
          <div
            className={styles.barraProgreso}
            role="progressbar"
            aria-valuenow={preguntaActual + 1}
            aria-valuemin={1}
            aria-valuemax={totalPreguntas}
          >
            <div className={styles.barraRelleno} style={{ width: `${progresoPct}%` }} />
          </div>
        </div>

        <div className={styles.pregunta}>
          <div className={styles.preguntaHeader}>
            <span className={styles.preguntaIcono} aria-hidden="true">
              {pregunta.icono}
            </span>
            <span className={styles.preguntaTexto}>{pregunta.texto}</span>
          </div>

          <div
            className={styles.opciones}
            role="group"
            aria-label={`Opciones para: ${pregunta.texto}`}
          >
            {pregunta.opciones.map((opcion, idx) => (
              <button
                key={idx}
                type="button"
                className={`${styles.opcion}${respuestaSeleccionada === idx ? ' ' + styles.seleccionada : ''}`}
                onClick={() => seleccionar(idx)}
                aria-pressed={respuestaSeleccionada === idx}
              >
                {opcion.texto}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.navegacion}>
          <button
            type="button"
            className={styles.btnSecundario}
            onClick={preguntaAnterior}
            disabled={preguntaActual === 0}
          >
            ← Anterior
          </button>

          <button
            type="button"
            className={styles.btnPrimary}
            onClick={siguientePregunta}
            disabled={respuestaSeleccionada === null}
          >
            {preguntaActual + 1 === totalPreguntas ? 'Ver resultado' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  );
}
