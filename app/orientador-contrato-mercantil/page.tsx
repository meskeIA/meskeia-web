'use client';

import { useState } from 'react';
import styles from './OrientadorContratoMercantil.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import DisclaimerCard from '@/components/DisclaimerCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// Tipos de contrato mercantil
interface TipoContrato {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  duracionTipica: string;
  obligacionResultado: string;
  responsabilidad: string;
  formaRecomendada: string;
  clausulasEsenciales: string[];
  erroresFrecuentes: string[];
  ejemplos: string[];
  cuandoUsarlo: string;
}

const TIPOS_CONTRATO: TipoContrato[] = [
  {
    id: 'servicios',
    nombre: 'Contrato de Servicios',
    icono: '🛠️',
    descripcion:
      'Prestación de una actividad continuada o periódica sin garantizar un resultado concreto.',
    duracionTipica: 'Indefinida o periódica (mensual, anual)',
    obligacionResultado: 'No — obligación de medios',
    responsabilidad: 'Por negligencia o incumplimiento del servicio',
    formaRecomendada: 'Escrita (recomendada)',
    clausulasEsenciales: [
      'Descripción detallada del servicio',
      'Precio y forma de pago (periodicidad)',
      'Plazo de preaviso para rescisión',
      'Confidencialidad y propiedad intelectual',
      'Exclusividad (si aplica)',
    ],
    erroresFrecuentes: [
      'No definir el alcance del servicio con precisión',
      'Omitir cláusula de preaviso para terminar el contrato',
      'Confundir con relación laboral (sin alta en SS)',
      'No incluir propiedad intelectual sobre los entregables',
    ],
    ejemplos: ['Consultoría estratégica', 'Mantenimiento informático', 'Asesoría contable periódica'],
    cuandoUsarlo:
      'Cuando contratas una actividad continuada donde importa el proceso y la dedicación, no un resultado cerrado.',
  },
  {
    id: 'obra',
    nombre: 'Arrendamiento de Obra',
    icono: '🏗️',
    descripcion:
      'El contratista se compromete a entregar un resultado concreto y definido a cambio de un precio.',
    duracionTipica: 'Definida (hasta entrega del resultado)',
    obligacionResultado: 'Sí — obligación de resultado',
    responsabilidad: 'Por vicios o defectos del resultado entregado',
    formaRecomendada: 'Escrita con especificaciones técnicas',
    clausulasEsenciales: [
      'Descripción exacta del resultado (especificaciones técnicas)',
      'Precio cerrado o por hitos',
      'Plazos de entrega y penalizaciones por retraso',
      'Criterios de aceptación y pruebas',
      'Garantía post-entrega',
      'Propiedad intelectual sobre el resultado',
    ],
    erroresFrecuentes: [
      'No definir criterios de aceptación del resultado',
      'Precio sin especificar qué incluye (alcance scope creep)',
      'Omitir penalizaciones por retraso',
      'No pactar a quién pertenece el código/diseño entregado',
    ],
    ejemplos: [
      'Desarrollo de una aplicación web',
      'Proyecto de arquitectura o construcción',
      'Diseño de campaña publicitaria cerrada',
    ],
    cuandoUsarlo:
      'Cuando contratas para obtener un entregable concreto: software, edificio, diseño, estudio, informe...',
  },
  {
    id: 'compraventa',
    nombre: 'Compraventa Mercantil',
    icono: '📦',
    descripcion:
      'Transmisión de bienes (productos, mercancías) entre empresas o autónomos a cambio de precio.',
    duracionTipica: 'Puntual o recurrente (contrato marco)',
    obligacionResultado: 'Sí — entrega de bienes conformes',
    responsabilidad: 'Por vicios ocultos y falta de conformidad',
    formaRecomendada: 'Escrita para importes relevantes; albarán + factura en operaciones simples',
    clausulasEsenciales: [
      'Descripción y cantidad de los bienes',
      'Precio, condiciones de pago y INCOTERMS (si aplica)',
      'Plazo y lugar de entrega',
      'Inspección y conformidad',
      'Garantía y plazo de reclamación por defectos',
      'Reserva de dominio (si pago aplazado)',
    ],
    erroresFrecuentes: [
      'No especificar las condiciones exactas de los bienes',
      'Olvidar la reserva de dominio en pagos aplazados',
      'No acordar quién asume el riesgo durante el transporte',
      'Omitir el plazo para reclamar vicios ocultos',
    ],
    ejemplos: [
      'Venta de maquinaria entre empresas',
      'Suministro recurrente de materias primas',
      'Venta de stock o inventario',
    ],
    cuandoUsarlo:
      'Cuando intercambias bienes físicos (o digitales) a cambio de precio entre profesionales o empresas.',
  },
  {
    id: 'agencia',
    nombre: 'Contrato de Agencia',
    icono: '🤝',
    descripcion:
      'Un agente independiente actúa de forma estable en nombre del empresario para promover o concluir negocios.',
    duracionTipica: 'Indefinida o de larga duración',
    obligacionResultado: 'No — obligación de medios (salvo agente con poder de cierre)',
    responsabilidad: 'El empresario responde por actos del agente dentro de su poder',
    formaRecomendada: 'Escrita (obligatoria si alguna parte lo exige — art. 22 Ley de Contrato de Agencia)',
    clausulasEsenciales: [
      'Territorio o cartera de clientes asignados',
      'Comisión y base de cálculo',
      'Exclusividad (si aplica)',
      'Poderes del agente (solo promoción o también cierre)',
      'Indemnización por clientela al finalizar',
      'Preaviso de rescisión',
    ],
    erroresFrecuentes: [
      'Confundir agente con distribuidor (el agente actúa por cuenta ajena)',
      'No pactar la indemnización por clientela (art. 28 LCA)',
      'Exclusividad sin contrapartida económica',
      'No delimitar el territorio o cartera con precisión',
    ],
    ejemplos: [
      'Agente comercial para distribución de seguros',
      'Representante de fabricante en una región',
      'Intermediario inmobiliario',
    ],
    cuandoUsarlo:
      'Cuando necesitas un representante independiente que actúe en tu nombre de forma estable, sin asumir el riesgo de las ventas.',
  },
  {
    id: 'nda',
    nombre: 'Acuerdo de Confidencialidad (NDA)',
    icono: '🔒',
    descripcion:
      'Protege información sensible intercambiada antes o durante negociaciones o colaboraciones.',
    duracionTipica: '1-5 años (incluso tras finalización del acuerdo principal)',
    obligacionResultado: 'Sí — no divulgar ni usar la información sin autorización',
    responsabilidad: 'Daños y perjuicios por revelación indebida',
    formaRecomendada: 'Escrita (imprescindible para ser exigible)',
    clausulasEsenciales: [
      'Definición precisa de "información confidencial"',
      'Excepciones (información pública, conocida previamente, etc.)',
      'Obligaciones del receptor',
      'Duración de la confidencialidad',
      'Consecuencias del incumplimiento (penalización pactada)',
      'Devolución o destrucción de la información al final',
    ],
    erroresFrecuentes: [
      'Definir "confidencial" de forma demasiado amplia o vaga',
      'No incluir excepciones estándar (información que ya era pública)',
      'Omitir la duración: sin plazo, puede considerarse indefinida',
      'No especificar qué pasa con la información al finalizar la relación',
    ],
    ejemplos: [
      'Antes de una negociación de adquisición empresarial',
      'Al compartir idea de negocio con un socio potencial',
      'Durante desarrollo de producto con proveedor externo',
    ],
    cuandoUsarlo:
      'Siempre que compartas información sensible (tecnología, finanzas, estrategia) antes de tener firmado el contrato principal.',
  },
  {
    id: 'distribucion',
    nombre: 'Contrato de Distribución',
    icono: '🚚',
    descripcion:
      'El distribuidor compra los productos al fabricante/proveedor y los revende en su propio nombre y riesgo.',
    duracionTipica: 'Indefinida o plurianual',
    obligacionResultado: 'Sí — comprar mínimos pactados y distribuir',
    responsabilidad: 'El distribuidor responde frente a los clientes finales',
    formaRecomendada: 'Escrita (contrato marco + órdenes de pedido)',
    clausulasEsenciales: [
      'Territorio exclusivo o no exclusivo',
      'Mínimos de compra garantizados',
      'Precio mayorista y condiciones de pago',
      'Política de marca y uso de imagen',
      'Obligaciones de stock y servicio posventa',
      'Causas de resolución y stock al finalizar',
    ],
    erroresFrecuentes: [
      'Confundir con contrato de agencia (el distribuidor actúa por cuenta propia)',
      'No pactar mínimos de compra exigibles',
      'Exclusividad sin delimitación geográfica clara',
      'No regular qué pasa con el stock al terminar el contrato',
    ],
    ejemplos: [
      'Distribución de productos alimenticios en una región',
      'Reventa de software o licencias en España',
      'Distribuidor oficial de una marca extranjera',
    ],
    cuandoUsarlo:
      'Cuando quieres que otro empresa revenda tus productos en su nombre, asumiendo el riesgo comercial frente a los clientes finales.',
  },
  {
    id: 'colaboracion',
    nombre: 'Contrato de Colaboración',
    icono: '🤜🤛',
    descripcion:
      'Dos autónomos o empresas unen fuerzas puntualmente en un proyecto concreto, aportando cada uno sus capacidades.',
    duracionTipica: 'Definida (duración del proyecto)',
    obligacionResultado: 'Mixta — aportación de medios y/o resultado parcial',
    responsabilidad: 'Cada parte responde de su aportación; responsabilidad solidaria frente a terceros si no se pacta otra cosa',
    formaRecomendada: 'Escrita (imprescindible para delimitar responsabilidades)',
    clausulasEsenciales: [
      'Aportación concreta de cada parte',
      'Reparto de ingresos o beneficios',
      'Propiedad intelectual de lo creado conjuntamente',
      'Responsabilidad frente a terceros (solidaria vs. mancomunada)',
      'Toma de decisiones y resolución de conflictos',
      'Confidencialidad durante y después del proyecto',
    ],
    erroresFrecuentes: [
      'No aclarar quién lidera y toma decisiones finales',
      'No repartir la propiedad intelectual de los entregables',
      'Responsabilidad solidaria no pactada expresamente',
      'Confundir con sociedad civil (implica estructura societaria)',
    ],
    ejemplos: [
      'Dos freelances que ofrecen un proyecto conjunto a un cliente',
      'Empresas que colaboran en una licitación pública (UTE)',
      'Cofounders que desarrollan un producto antes de constituir sociedad',
    ],
    cuandoUsarlo:
      'Cuando vas a trabajar con otro profesional o empresa en un proyecto puntual, aportando capacidades complementarias.',
  },
];

// Preguntas del selector interactivo
interface Pregunta {
  id: string;
  texto: string;
  opciones: { valor: string; etiqueta: string }[];
}

const PREGUNTAS: Pregunta[] = [
  {
    id: 'objeto',
    texto: '¿Qué vas a contratar o formalizar?',
    opciones: [
      { valor: 'actividad', etiqueta: 'Una actividad o servicio continuo (sin resultado fijo)' },
      { valor: 'resultado', etiqueta: 'Un resultado concreto (entregable cerrado)' },
      { valor: 'bienes', etiqueta: 'Compra o venta de productos/mercancías' },
      { valor: 'representar', etiqueta: 'Alguien que venda o represente en mi nombre' },
      { valor: 'revender', etiqueta: 'Alguien que revenda mis productos por su cuenta' },
      { valor: 'informacion', etiqueta: 'Proteger información sensible antes de negociar' },
      { valor: 'proyecto_conjunto', etiqueta: 'Unir fuerzas con otro profesional en un proyecto' },
    ],
  },
  {
    id: 'duracion',
    texto: '¿Cuánto tiempo durará la relación?',
    opciones: [
      { valor: 'puntual', etiqueta: 'Puntual (hasta entregar un resultado)' },
      { valor: 'periodica', etiqueta: 'Periódica o recurrente (meses o años)' },
      { valor: 'indefinida', etiqueta: 'Indefinida o de larga duración' },
      { valor: 'previa', etiqueta: 'Solo antes de firmar el contrato principal' },
    ],
  },
  {
    id: 'contrapartida',
    texto: '¿Quién asume el riesgo comercial?',
    opciones: [
      { valor: 'contratante', etiqueta: 'Yo (el que contrata) — pago aunque no haya resultado' },
      { valor: 'prestador', etiqueta: 'La otra parte — solo cobra si entrega el resultado' },
      { valor: 'distribuidor', etiqueta: 'La otra parte compra y revende por su cuenta y riesgo' },
      { valor: 'agente', etiqueta: 'La otra parte actúa en mi nombre, yo asumo el riesgo' },
      { valor: 'compartido', etiqueta: 'Ambas partes aportamos y compartimos resultado/riesgo' },
    ],
  },
];

// Lógica de recomendación
function recomendarContrato(respuestas: Record<string, string>): string[] {
  const { objeto, duracion, contrapartida } = respuestas;

  if (objeto === 'informacion') return ['nda'];
  if (objeto === 'proyecto_conjunto') return ['colaboracion'];
  if (objeto === 'bienes') return ['compraventa'];
  if (objeto === 'revender') return ['distribucion'];
  if (objeto === 'representar') return ['agencia'];

  if (objeto === 'resultado') {
    if (contrapartida === 'prestador') return ['obra'];
    if (contrapartida === 'contratante') return ['obra', 'servicios'];
    return ['obra'];
  }

  if (objeto === 'actividad') {
    if (duracion === 'puntual') return ['obra', 'servicios'];
    if (duracion === 'periodica' || duracion === 'indefinida') return ['servicios'];
    return ['servicios'];
  }

  return ['servicios'];
}

export default function OrientadorContratoMercantilPage() {
  const [paso, setPaso] = useState<'preguntas' | 'resultado' | 'tabla'>('preguntas');
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [contratos, setContratos] = useState<TipoContrato[]>([]);

  const handleRespuesta = (valor: string) => {
    const nuevasRespuestas = { ...respuestas, [PREGUNTAS[preguntaActual].id]: valor };
    setRespuestas(nuevasRespuestas);

    if (preguntaActual < PREGUNTAS.length - 1) {
      setPreguntaActual(preguntaActual + 1);
    } else {
      // Calcular recomendación
      const ids = recomendarContrato(nuevasRespuestas);
      const recomendados = ids.map((id) => TIPOS_CONTRATO.find((t) => t.id === id)).filter(Boolean) as TipoContrato[];
      setContratos(recomendados);
      setPaso('resultado');
    }
  };

  const reiniciar = () => {
    setPaso('preguntas');
    setPreguntaActual(0);
    setRespuestas({});
    setContratos([]);
  };

  const progreso = Math.round(((preguntaActual) / PREGUNTAS.length) * 100);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>⚖️ Orientador de Contrato Mercantil</h1>
          <p className={styles.subtitle}>
            Descubre qué tipo de contrato necesitas y qué cláusulas no pueden faltar
          </p>
        </header>

        <LegalNotice />

        <DisclaimerCard
          variant="financial"
          severity="critical"
          collapsible={false}
        />

        <main className={styles.mainContent}>
          {/* Selector interactivo */}
          {paso === 'preguntas' && (
            <div className={styles.selectorCard}>
              <div className={styles.selectorHeader}>
                <span className={styles.pasoIndicador}>
                  Pregunta {preguntaActual + 1} de {PREGUNTAS.length}
                </span>
                <div className={styles.barraProgreso} role="progressbar" aria-valuenow={progreso} aria-valuemin={0} aria-valuemax={100}>
                  <div className={styles.barraProgresoRelleno} style={{ width: `${progreso}%` }} />
                </div>
              </div>

              <h2 className={styles.preguntaTexto}>{PREGUNTAS[preguntaActual].texto}</h2>

              <div className={styles.opcionesGrid}>
                {PREGUNTAS[preguntaActual].opciones.map((opcion) => (
                  <button
                    key={opcion.valor}
                    className={styles.opcionBtn}
                    onClick={() => handleRespuesta(opcion.valor)}
                    aria-label={opcion.etiqueta}
                  >
                    {opcion.etiqueta}
                  </button>
                ))}
              </div>

              {preguntaActual > 0 && (
                <button
                  className={styles.btnSecundario}
                  onClick={() => {
                    const nuevasRespuestas = { ...respuestas };
                    delete nuevasRespuestas[PREGUNTAS[preguntaActual - 1].id];
                    setRespuestas(nuevasRespuestas);
                    setPreguntaActual(preguntaActual - 1);
                  }}
                >
                  ← Volver
                </button>
              )}
            </div>
          )}

          {/* Resultado de recomendación */}
          {paso === 'resultado' && contratos.length > 0 && (
            <div className={styles.resultadoSection}>
              <div className={styles.resultadoHeader}>
                <span className={styles.badgeRecomendado}>Contrato recomendado</span>
                <h2 className={styles.resultadoTitulo}>
                  {contratos.length === 1
                    ? `${contratos[0].icono} ${contratos[0].nombre}`
                    : 'Tienes varias opciones — elige la que mejor se ajusta'}
                </h2>
              </div>

              {contratos.map((contrato) => (
                <div key={contrato.id} className={styles.contratoCard}>
                  <div className={styles.contratoCardHeader}>
                    <span className={styles.contratoIcono} aria-hidden="true">{contrato.icono}</span>
                    <div>
                      <h3 className={styles.contratoNombre}>{contrato.nombre}</h3>
                      <p className={styles.contratoDesc}>{contrato.descripcion}</p>
                    </div>
                  </div>

                  <p className={styles.cuandoUsarlo}><strong>¿Cuándo usarlo?</strong> {contrato.cuandoUsarlo}</p>

                  <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaEtiqueta}>Duración típica</span>
                      <span className={styles.metaValor}>{contrato.duracionTipica}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaEtiqueta}>Obligación de resultado</span>
                      <span className={styles.metaValor}>{contrato.obligacionResultado}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaEtiqueta}>Forma recomendada</span>
                      <span className={styles.metaValor}>{contrato.formaRecomendada}</span>
                    </div>
                  </div>

                  <div className={styles.clausulasSection}>
                    <h4 className={styles.clausulasTitulo}>Cláusulas esenciales</h4>
                    <ul className={styles.clausulasList}>
                      {contrato.clausulasEsenciales.map((clausula, i) => (
                        <li key={i} className={styles.clausulasItem}>
                          <span className={styles.checkIcon} aria-hidden="true">✅</span>
                          {clausula}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.erroresSection}>
                    <h4 className={styles.erroresTitulo}>
                      <span aria-hidden="true">⚠️</span> Errores frecuentes a evitar
                    </h4>
                    <ul className={styles.erroresList}>
                      {contrato.erroresFrecuentes.map((error, i) => (
                        <li key={i} className={styles.erroresItem}>
                          <span className={styles.errorIcon} aria-hidden="true">❌</span>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.ejemplosSection}>
                    <h4 className={styles.ejemplosTitulo}>Ejemplos habituales</h4>
                    <div className={styles.ejemplosTags}>
                      {contrato.ejemplos.map((ejemplo, i) => (
                        <span key={i} className={styles.ejemploTag}>{ejemplo}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div className={styles.accionesResultado}>
                <button className={styles.btnPrimary} onClick={reiniciar}>
                  Volver a empezar
                </button>
                <button
                  className={styles.btnSecundario}
                  onClick={() => setPaso('tabla')}
                >
                  Ver tabla comparativa de todos los contratos
                </button>
              </div>
            </div>
          )}

          {/* Tabla comparativa */}
          {paso === 'tabla' && (
            <div className={styles.tablaSection}>
              <div className={styles.tablaTitulo}>
                <h2>Comparativa de contratos mercantiles</h2>
                <button className={styles.btnSecundario} onClick={() => setPaso('preguntas')}>
                  ← Volver al orientador
                </button>
              </div>
              <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th scope="col">Tipo</th>
                      <th scope="col">Duración típica</th>
                      <th scope="col">Obligación resultado</th>
                      <th scope="col">Responsabilidad</th>
                      <th scope="col">Forma recomendada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TIPOS_CONTRATO.map((tipo) => (
                      <tr key={tipo.id}>
                        <td>
                          <span aria-hidden="true">{tipo.icono}</span>{' '}
                          <strong>{tipo.nombre}</strong>
                        </td>
                        <td>{tipo.duracionTipica}</td>
                        <td>{tipo.obligacionResultado}</td>
                        <td>{tipo.responsabilidad}</td>
                        <td>{tipo.formaRecomendada}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.tablaAcciones}>
                <button className={styles.btnPrimary} onClick={reiniciar}>
                  Volver al orientador
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Sección educativa v2.0 */}
        <EducationalSection
          title="📚 Todo sobre contratos mercantiles"
          subtitle="Guía práctica para autónomos y empresas en España"
        >
          {/* Tabla comparativa educativa */}
          <section className={styles.guideSection}>
            <h2>Los 7 tipos de contrato mercantil en España</h2>
            <p>
              El ordenamiento mercantil español regula las relaciones entre profesionales y empresas mediante
              distintas figuras contractuales. Cada una responde a una necesidad diferente y tiene
              consecuencias jurídicas propias.
            </p>
            <div className={styles.tiposGrid}>
              {TIPOS_CONTRATO.map((tipo) => (
                <div key={tipo.id} className={styles.tipoCard}>
                  <div className={styles.tipoCardHeader}>
                    <span className={styles.tipoIcono} aria-hidden="true">{tipo.icono}</span>
                    <strong>{tipo.nombre}</strong>
                  </div>
                  <p className={styles.tipoDesc}>{tipo.descripcion}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Guía paso a paso */}
          <section className={styles.guideSection}>
            <h2>Cómo redactar un contrato de servicios básico (paso a paso)</h2>
            <ol className={styles.pasosList}>
              <li className={styles.pasoItem}>
                <strong>Identifica a las partes</strong> — nombre completo, NIF/CIF, domicilio fiscal y
                capacidad de representación (si actúas por una empresa, incluye el poder notarial).
              </li>
              <li className={styles.pasoItem}>
                <strong>Define el objeto del contrato</strong> — describe con precisión qué servicio se
                presta, qué incluye y qué excluye (el &ldquo;scope&rdquo;).
              </li>
              <li className={styles.pasoItem}>
                <strong>Fija el precio y la forma de pago</strong> — importe, periodicidad, condiciones de
                facturación y consecuencias del impago (intereses de demora).
              </li>
              <li className={styles.pasoItem}>
                <strong>Establece la duración y la rescisión</strong> — fecha de inicio, duración y plazo
                de preaviso para finalizar (habitualmente 15-30 días).
              </li>
              <li className={styles.pasoItem}>
                <strong>Añade cláusulas de protección</strong> — confidencialidad, propiedad intelectual
                sobre entregables, exclusividad si procede y no competencia (con límite temporal).
              </li>
              <li className={styles.pasoItem}>
                <strong>Elige el fuero y la ley aplicable</strong> — juzgado competente (ciudad del
                prestador o del cliente, lo que sea más favorable), y en contratos internacionales,
                la legislación aplicable.
              </li>
              <li className={styles.pasoItem}>
                <strong>Firma en todas las páginas</strong> — o usa firma electrónica reconocida
                (herramientas como Signaturit, DocuSign o la firma digital de la FNMT).
              </li>
            </ol>
          </section>

          {/* FAQ */}
          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>

            <div className={styles.faqItem}>
              <h3>¿Vale un contrato oral entre empresas?</h3>
              <p>
                En España, la mayoría de contratos mercantiles son válidos aunque sean verbales (principio
                de libertad de forma del Código de Comercio). Sin embargo, sin contrato escrito es muy difícil
                demostrar los términos acordados en caso de conflicto. El contrato escrito no es un trámite
                burocrático: es tu protección.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Qué pasa si trabajo sin contrato escrito?</h3>
              <p>
                Corres el riesgo de que el otro no pague, cambie las condiciones unilateralmente o te
                demande por algo que no acordaste. Además, sin contrato escrito una relación mercantil
                continuada puede ser recalificada como relación laboral (con obligaciones de cotización
                y despido improcedente).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Cuándo necesito obligatoriamente un abogado?</h3>
              <p>
                Aunque para contratos simples puedes usar plantillas adaptadas, consulta siempre con un
                abogado cuando: el importe sea significativo (más de 3.000-5.000 €), haya propiedad
                intelectual relevante, el contrato sea de larga duración o indefinido, intervenga una
                empresa extranjera, o el contrato incluya cláusulas de exclusividad o no competencia.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Qué diferencia hay entre servicios y arrendamiento de obra?</h3>
              <p>
                En el contrato de servicios el prestador se compromete a realizar una actividad
                (obligación de medios), no garantiza un resultado concreto. En el arrendamiento de
                obra, se compromete a entregar un resultado definido (obligación de resultado).
                Esta distinción es clave para determinar quién responde si el resultado no es el esperado.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Necesito un NDA antes de hablar con un inversor o socio?</h3>
              <p>
                Depende. Los inversores profesionales (VCs, business angels) suelen negarse a firmar
                NDAs en fases muy tempranas porque reciben cientos de pitches. En cambio, con socios
                potenciales, proveedores o clientes con quienes compartes información técnica o
                financiera específica, sí es recomendable firmarlo antes de revelar detalles sensibles.
              </p>
            </div>
          </section>

          {/* Warning box — indicador v2.0 obligatorio */}
          <div className={styles.warningBox} role="alert">
            <span aria-hidden="true">⚠️</span>{' '}
            <strong>Aviso legal:</strong> Estos contenidos son orientativos. Siempre consulta con un
            abogado para redactar contratos con implicaciones económicas o de responsabilidad. El
            orientador no sustituye el asesoramiento jurídico personalizado.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('orientador-contrato-mercantil')} />

        <ShareCard appName="orientador-contrato-mercantil" />

        <Footer appName="orientador-contrato-mercantil" />
      </div>
    </>
  );
}
