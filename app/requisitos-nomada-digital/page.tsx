'use client';

import { useState, useMemo } from 'react';
import styles from './RequisitosNomadaDigital.module.css';
import {
  MeskeiaLogo,
  Footer,
  NumberInput,
  EducationalSection,
  ShareCard,
  LegalNotice,
  RelatedApps,
  DisclaimerCard,
  DataReference, RegionBadge
} from '@/components';
import { formatCurrency, parseSpanishNumber } from '@/lib';
import {
  MINIMO_INGRESOS_TITULAR_NOMADA,
  MINIMO_INGRESOS_DEPENDIENTE_NOMADA,
  SMI_MENSUAL_NOMADA,
  NOMADA_DIGITAL_META,
  MAX_CLIENTES_ESPANA_PORCENTAJE,
  ANTIGUEDAD_MINIMA_EMPLEADO_MESES,
  DURACION_VISADO_MESES,
  DURACION_AUTORIZACION_INICIAL_MESES,
  DURACION_RENOVACION_MESES,
} from '@/data/fiscal';
import { FAQ_PLAZO, FAQ_FISCAL } from './faq';

type Perfil = 'empleado' | 'freelancer' | '';
type Respuesta = true | false | null;

/** «20 %» con espacio duro (CLAUDE.md §2) */
const pct = (n: number): string => `${n} %`;
const TOPE_ESPANA = pct(MAX_CLIENTES_ESPANA_PORCENTAJE);
const MESES_ANTIGUEDAD = ANTIGUEDAD_MINIMA_EMPLEADO_MESES;
const anios = (meses: number): string => (meses === 12 ? '1 año' : `${meses / 12} años`);

interface Requisito {
  id: string;
  pregunta: string;
  explicacion: string;
  soloEmpleado?: boolean;
  soloFreelancer?: boolean;
}

// Todos son requisitos de la Ley 14/2013 (arts. 62.3, 74 bis y 74 ter, leídos en el BOE el
// 19/11/2026): un «No» en cualquiera impide el visado o la autorización. Antes cuatro de ellos no
// eran «imprescindibles» y un solo «No» daba «Casi cumples» (hallazgo 5170).
const REQUISITOS: Requisito[] = [
  {
    id: 'noUE',
    pregunta: '¿Eres ciudadano/a de un país no perteneciente a la UE / EEE / Suiza?',
    explicacion:
      'Los ciudadanos de la UE, el Espacio Económico Europeo y Suiza pueden residir y trabajar libremente en España. Si eres de estos países, no necesitas este visado.',
  },
  {
    id: 'trabajoRemoto',
    pregunta: '¿Trabajas (o vas a trabajar) completamente en remoto usando medios telemáticos?',
    explicacion:
      'Tu actividad debe poder realizarse íntegramente a distancia, mediante ordenador u otros medios digitales, sin necesidad de presencia física en la empresa.',
  },
  {
    id: 'empresaExtranjera',
    pregunta: '¿Tu empresa empleadora está radicada fuera de España?',
    explicacion:
      'Por cuenta ajena solo puedes trabajar para empresas radicadas fuera del territorio nacional (Ley 14/2013, art. 74 bis). Para el empleado la ley no prevé ningún porcentaje de trabajo en España: ese margen es solo de los profesionales por cuenta propia.',
    soloEmpleado: true,
  },
  {
    id: 'clientesExtranjeros',
    pregunta: `¿Tu trabajo para empresas ubicadas en España es, como mucho, el ${TOPE_ESPANA} de tu actividad profesional?`,
    explicacion:
      `Como profesional por cuenta propia puedes trabajar para una empresa ubicada en España siempre que ese trabajo no supere el ${TOPE_ESPANA} del total de tu actividad (Ley 14/2013, art. 74 bis). Con un 60 % para clientes de fuera y un 40 % para empresas de España, la respuesta es «No».`,
    soloFreelancer: true,
  },
  {
    id: 'antiguedad',
    pregunta: `¿Llevas al menos ${MESES_ANTIGUEDAD} meses trabajando con tu empresa actual?`,
    explicacion:
      `La relación laboral con la empresa no localizada en España tiene que existir durante, al menos, los ${MESES_ANTIGUEDAD} meses anteriores a la solicitud (Ley 14/2013, art. 74 ter c).`,
    soloEmpleado: true,
  },
  {
    id: 'relacionMercantil',
    pregunta: `¿Llevas al menos ${MESES_ANTIGUEDAD} meses trabajando para una o varias empresas no localizadas en España?`,
    explicacion:
      `Como freelancer tienes que acreditar una relación mercantil con empresas no localizadas en España durante, al menos, los ${MESES_ANTIGUEDAD} meses anteriores a la solicitud (Ley 14/2013, art. 74 ter d), con contratos o facturas. La ley no pide un año de experiencia propia.`,
    soloFreelancer: true,
  },
  {
    id: 'actividadEmpresa',
    pregunta: '¿La empresa (o grupo) para la que trabajas lleva al menos un año de actividad real y continuada?',
    explicacion:
      'La ley exige que la empresa o grupo de empresas con la que mantienes la relación laboral o profesional tenga una actividad real y continuada durante al menos un año (Ley 14/2013, art. 74 ter a). Es la empresa, no tu experiencia, la que tiene que llevar ese año.',
  },
  {
    id: 'titulacion',
    pregunta: '¿Tienes titulación universitaria o acreditas al menos 3 años de experiencia profesional?',
    explicacion:
      'Puedes acreditar la cualificación como graduado o postgraduado universitario, o con una experiencia profesional mínima de tres años (Ley 14/2013, art. 74 bis): con exactamente tres años, la respuesta es «Sí».',
  },
  {
    id: 'sinAntecedentes',
    pregunta: '¿Estás libre de antecedentes penales en España y en los países donde has residido los últimos 2 años?',
    explicacion:
      'Debes carecer de antecedentes penales en España y en los países donde hayas residido durante los dos últimos años, y firmar una declaración responsable de que no los tienes en los últimos cinco (Ley 14/2013, art. 62.3.c).',
  },
  {
    id: 'situacionRegular',
    pregunta: '¿Estás en situación regular en España (o vas a solicitar el visado desde el extranjero)?',
    explicacion:
      'Si ya estás en España, no puedes encontrarte en situación irregular (Ley 14/2013, art. 62.3.a). Si aún no has llegado, solicitas el visado en el consulado español de tu país y puedes responder «Sí».',
  },
  {
    id: 'seguroMedico',
    pregunta: '¿Tienes (o puedes contratar) seguro médico con cobertura completa en España?',
    explicacion:
      'Necesitas un seguro público o un seguro privado de enfermedad concertado con una entidad aseguradora (Ley 14/2013, art. 62.3.e).',
  },
];

const DOCUMENTOS_COMUNES = [
  'Formulario de solicitud oficial (modelo EX-01)',
  'Pasaporte vigente con mínimo 1 año de validez (copia y original)',
  'Fotografía reciente en color con fondo blanco',
  'Certificado de antecedentes penales apostillado de España y de los países de residencia de los últimos 2 años, y declaración responsable de no tenerlos en los últimos 5',
  'Seguro médico con cobertura en España (privado o equivalente)',
  'Justificante de medios económicos (nóminas, extractos bancarios o declaración de ingresos)',
  'Tasas administrativas abonadas',
];

const DOCUMENTOS_EMPLEADO = [
  'Contrato de trabajo con empresa extranjera (traducido y apostillado)',
  `Carta del empleador confirmando modalidad 100 % remota y antigüedad ≥ ${MESES_ANTIGUEDAD} meses`,
  'Documentación acreditativa de la empresa (registro mercantil, sede fuera de España y al menos un año de actividad)',
  `Últimas 3 nóminas que acrediten ingresos ≥ ${pct(200)} SMI (${MINIMO_INGRESOS_TITULAR_NOMADA.toLocaleString('es-ES')} €/mes)`,
];

const DOCUMENTOS_FREELANCER = [
  `Contratos o facturas con empresas no localizadas en España de, al menos, los últimos ${MESES_ANTIGUEDAD} meses`,
  'Documentación de esas empresas que acredite al menos un año de actividad',
  `Declaraciones fiscales que acrediten ingresos ≥ ${pct(200)} SMI (${MINIMO_INGRESOS_TITULAR_NOMADA.toLocaleString('es-ES')} €/mes)`,
  `Relación de clientes con indicación de su país (para demostrar que el trabajo para empresas de España no pasa del ${TOPE_ESPANA})`,
];

export default function RequisitosNomadaDigitalPage() {
  const [perfil, setPerfil] = useState<Perfil>('');
  const [respuestas, setRespuestas] = useState<Record<string, Respuesta>>({});
  const [ingresos, setIngresos] = useState('');
  const [dependientes, setDependientes] = useState('0');

  const dependientesNum = useMemo(() => {
    const d = parseInt(dependientes, 10);
    return isNaN(d) || d < 0 ? 0 : d;
  }, [dependientes]);

  const minimoRequerido = useMemo(
    () => MINIMO_INGRESOS_TITULAR_NOMADA + dependientesNum * MINIMO_INGRESOS_DEPENDIENTE_NOMADA,
    [dependientesNum]
  );

  const ingresosNum = useMemo(() => parseSpanishNumber(ingresos), [ingresos]);
  // Una cifra que no se puede leer («2.000.50») da NaN, y NaN no es ni ≥ ni < que el mínimo:
  // antes no contaba como insuficiente y el veredicto salía «Cumples» (hallazgo 5168). Ahora
  // se avisa y no hay veredicto hasta que se corrija.
  const ingresosIlegibles = ingresos !== '' && !Number.isFinite(ingresosNum);
  const ingresosOk = ingresos !== '' && !ingresosIlegibles && ingresosNum >= minimoRequerido;
  const ingresosInsuficientes = ingresos !== '' && !ingresosIlegibles && ingresosNum < minimoRequerido;

  const requisitosAplicables = useMemo(
    () =>
      REQUISITOS.filter(
        (r) =>
          (!r.soloEmpleado || perfil === 'empleado') &&
          (!r.soloFreelancer || perfil === 'freelancer')
      ),
    [perfil]
  );

  const setRespuesta = (id: string, valor: boolean) => {
    setRespuestas((prev) => ({ ...prev, [id]: valor }));
  };

  const resultado = useMemo(() => {
    if (!perfil) return 'sin-perfil';
    if (ingresos === '' || ingresosIlegibles) return 'pendiente';

    const respondidos = requisitosAplicables.filter((r) => respuestas[r.id] !== undefined);
    if (respondidos.length < requisitosAplicables.length) return 'pendiente';

    // Cualquier requisito legal con «No», o ingresos por debajo del mínimo, descalifica
    const fallido = requisitosAplicables.some((r) => respuestas[r.id] === false);
    if (fallido || ingresosInsuficientes) return 'no-apto';
    return 'apto';
  }, [perfil, respuestas, requisitosAplicables, ingresos, ingresosIlegibles, ingresosInsuficientes]);

  const totalRespondidos = requisitosAplicables.filter((r) => respuestas[r.id] !== undefined).length;
  const totalOk = requisitosAplicables.filter((r) => respuestas[r.id] === true).length;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🌍</div>
        <h1 className={styles.title}>Visa Nómada Digital</h1>
        <p className={styles.subtitle}>
          Comprueba si cumples los requisitos para trabajar en remoto desde España
        </p>
        <p className={styles.heroLaw}>Ley 28/2022 de Startups · RD 1008/2023</p>
      </header>

      <RegionBadge variant="es-only" />


      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="requisitos-nomada-digital-disclaimer"
      />

      <DataReference
        normativa={NOMADA_DIGITAL_META.fuente}
        fuente={NOMADA_DIGITAL_META.fuente}
        verificado={NOMADA_DIGITAL_META.verificado}
        urlOficial={NOMADA_DIGITAL_META.urlOficial}
      />

      {/* Selector de perfil */}
      <section className={styles.perfilSection}>
        <h2 className={styles.sectionTitle}>¿Cuál es tu situación?</h2>
        <div className={styles.perfilGrid}>
          <button
            type="button"
            className={`${styles.perfilCard} ${perfil === 'empleado' ? styles.perfilActive : ''}`}
            onClick={() => { setPerfil('empleado'); setRespuestas({}); }}
            aria-pressed={perfil === 'empleado'}
          >
            <span className={styles.perfilIcon} aria-hidden="true">👔</span>
            <strong>Empleado por cuenta ajena</strong>
            <span>Trabajo para una empresa radicada fuera de España</span>
          </button>
          <button
            type="button"
            className={`${styles.perfilCard} ${perfil === 'freelancer' ? styles.perfilActive : ''}`}
            onClick={() => { setPerfil('freelancer'); setRespuestas({}); }}
            aria-pressed={perfil === 'freelancer'}
          >
            <span className={styles.perfilIcon} aria-hidden="true">💻</span>
            <strong>Freelancer / Autónomo</strong>
            <span>{`Trabajo por cuenta propia; como mucho el ${TOPE_ESPANA} para empresas de España`}</span>
          </button>
        </div>
      </section>

      {perfil && (
        <>
          {/* Ingresos y dependientes */}
          <section className={styles.ingresosSection}>
            <h2 className={styles.sectionTitle}>Ingresos y situación familiar</h2>
            <div className={styles.ingresosGrid}>
              <NumberInput
                value={ingresos}
                onChange={setIngresos}
                label="Ingresos mensuales netos"
                placeholder="2442"
                helperText={`Mínimo requerido: ${formatCurrency(minimoRequerido)}/mes`}
                min={0}
              />
              <div className={styles.dependientesField}>
                <label id="dependientes-label" className={styles.label}>Familiares dependientes a cargo</label>
                <div role="group" aria-labelledby="dependientes-label" className={styles.stepperContainer}>
                  <button
                    type="button"
                    className={styles.stepperBtn}
                    onClick={() => setDependientes(String(Math.max(0, dependientesNum - 1)))}
                    aria-label="Reducir dependientes"
                  >−</button>
                  <span className={styles.stepperValue} aria-live="polite">{dependientesNum}</span>
                  <button
                    type="button"
                    className={styles.stepperBtn}
                    onClick={() => setDependientes(String(dependientesNum + 1))}
                    aria-label="Añadir dependiente"
                  >+</button>
                </div>
                {dependientesNum > 0 && (
                  <p className={styles.helperText}>
                    +{formatCurrency(dependientesNum * MINIMO_INGRESOS_DEPENDIENTE_NOMADA)}/mes por dependientes
                  </p>
                )}
              </div>
            </div>

            {/* Región viva siempre montada: el lector anuncia el banner al teclear (hallazgo 5180) */}
            <div role="status" aria-live="polite">
              {ingresos !== '' && (
                <div className={`${styles.ingresosBanner} ${ingresosOk ? styles.bannerOk : styles.bannerError}`}>
                  {ingresosIlegibles ? (
                    <span key="ilegible"><span aria-hidden="true">⚠️</span>{' '}No se puede leer la cifra de ingresos. Escríbela con coma decimal, por ejemplo 2.000,50</span>
                  ) : ingresosOk ? (
                    <span key="ok"><span aria-hidden="true">✅</span>{` Ingresos suficientes — ${formatCurrency(ingresosNum)}/mes ≥ mínimo de ${formatCurrency(minimoRequerido)}/mes`}</span>
                  ) : (
                    <span key="insuficiente"><span aria-hidden="true">❌</span>{` Ingresos insuficientes — ${formatCurrency(ingresosNum)}/mes < mínimo de ${formatCurrency(minimoRequerido)}/mes`}</span>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Checklist de requisitos */}
          <section className={styles.checklistSection}>
            <h2 className={styles.sectionTitle}>
              Requisitos legales
              <span className={styles.progreso}>{totalRespondidos}/{requisitosAplicables.length} respondidos</span>
            </h2>
            <p className={styles.reqExplicacion}>
              Todos son requisitos de la Ley 14/2013: un «No» en cualquiera de ellos impide el visado
              o la autorización.
            </p>

            <div className={styles.checklistGrid}>
              {requisitosAplicables.map((req) => {
                const resp = respuestas[req.id];
                return (
                  <div
                    key={req.id}
                    className={`${styles.requisitoCard} ${
                      resp === true ? styles.reqOk : resp === false ? styles.reqFail : ''
                    }`}
                  >
                    <div className={styles.reqHeader}>
                      <span className={styles.reqEstado} aria-hidden="true">
                        {resp === true ? '✅' : resp === false ? '❌' : '⬜'}
                      </span>
                      <p className={styles.reqPregunta}>{req.pregunta}</p>
                    </div>
                    <p className={styles.reqExplicacion}>{req.explicacion}</p>
                    <div className={styles.reqBotones}>
                      <button
                        type="button"
                        className={`${styles.btnResp} ${resp === true ? styles.btnRespActiveSi : ''}`}
                        onClick={() => setRespuesta(req.id, true)}
                        aria-pressed={resp === true}
                      >
                        Sí
                      </button>
                      <button
                        type="button"
                        className={`${styles.btnResp} ${resp === false ? styles.btnRespActiveNo : ''}`}
                        onClick={() => setRespuesta(req.id, false)}
                        aria-pressed={resp === false}
                      >
                        No
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Resultado — en una región viva siempre montada: el veredicto se anuncia al
              contestar la última pregunta (hallazgo 5180) */}
          <div aria-live="polite">
          {resultado !== 'pendiente' && resultado !== 'sin-perfil' && (
            <section className={styles.resultadoSection}>
              <div className={`${styles.resultadoCard} ${styles[`resultado-${resultado}`]}`}>
                {resultado === 'apto' && (
                  <>
                    <div className={styles.resultadoIcon} aria-hidden="true">🎉</div>
                    <h2 className={styles.resultadoTitulo}>¡Cumples los requisitos!</h2>
                    <p className={styles.resultadoTexto}>
                      Según las respuestas proporcionadas, tu perfil se ajusta a los requisitos de la
                      Visa Nómada Digital. Prepara la documentación y consulta con un abogado
                      especializado para confirmar tu caso concreto.
                    </p>
                    <div className={styles.resultadoPuntos}>
                      <span className={styles.puntoOk}>{totalOk} requisitos cumplidos</span>
                      <span className={styles.puntoDinero}>
                        Ingresos: {formatCurrency(ingresosNum)}/mes ✓
                      </span>
                    </div>
                  </>
                )}
                {resultado === 'no-apto' && (
                  <>
                    <div className={styles.resultadoIcon} aria-hidden="true">❌</div>
                    <h2 className={styles.resultadoTitulo}>No cumples algún requisito clave</h2>
                    <p className={styles.resultadoTexto}>
                      Hay uno o más requisitos legales que no se cumplen según tus respuestas.
                      Revisa los requisitos a los que has respondido «No» (marcados con <span aria-hidden="true">❌</span>). Si tienes dudas, consulta con un abogado
                      especializado en derecho migratorio: los casos tienen matices.
                    </p>
                  </>
                )}
              </div>

              {/* Documentación necesaria */}
              {resultado === 'apto' ? (
                <div className={styles.documentosSection}>
                  <h3 className={styles.docsTitulo}><span aria-hidden="true">📄</span> Documentación que necesitarás</h3>
                  <div className={styles.docsGrid}>
                    <div className={styles.docsGrupo}>
                      <h4>Documentos comunes</h4>
                      <ul className={styles.docsList}>
                        {DOCUMENTOS_COMUNES.map((doc) => (
                          <li key={doc}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.docsGrupo}>
                      <h4>Documentos específicos ({perfil === 'empleado' ? 'empleado' : 'freelancer'})</h4>
                      <ul className={styles.docsList}>
                        {(perfil === 'empleado' ? DOCUMENTOS_EMPLEADO : DOCUMENTOS_FREELANCER).map(
                          (doc) => <li key={doc}>{doc}</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          )}
          </div>
        </>
      )}

      {!perfil && (
        <div className={styles.emptyState}>
          <p>Selecciona tu perfil para comenzar el orientador de elegibilidad</p>
        </div>
      )}

      {/* Disclaimer — siempre visible */}
      <div className={styles.disclaimer}>
        <h3><span aria-hidden="true">⚠️</span> Aviso importante</h3>
        <p>
          Esta herramienta ofrece orientación general basada en la{' '}
          <strong>Ley 28/2022 de Startups y el RD 1008/2023</strong>. No sustituye el
          asesoramiento jurídico profesional. Los requisitos pueden variar según las
          circunstancias individuales y la normativa vigente en el momento de la solicitud.{' '}
          <strong>
            Consulta siempre con un abogado especializado en derecho migratorio antes de
            iniciar cualquier trámite.
          </strong>
        </p>
        <p className={styles.disclaimerResponsabilidad}>
          <strong>TÚ ERES RESPONSABLE</strong> de verificar esta información con un abogado
          especializado <strong>ANTES</strong> de iniciar cualquier trámite migratorio.{' '}
          meskeIA no se responsabiliza de decisiones tomadas basándose en esta herramienta.
        </p>
      </div>

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="Todo sobre la Visa Nómada Digital"
        subtitle="Guía completa para trabajar en remoto desde España"
      >
        {/* Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>Visado vs. Autorización de Residencia: diferencias clave</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>Visado Nómada Digital</th>
                  <th>Autorización de Residencia</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>¿Dónde se solicita?</td>
                  <td>Consulado español en tu país</td>
                  <td>UGE (Unidad Grandes Empresas) en España</td>
                </tr>
                <tr>
                  <td>¿Para quién?</td>
                  <td>Personas aún fuera de España</td>
                  <td>Personas ya en España con estancia legal</td>
                </tr>
                <tr>
                  <td>Duración</td>
                  <td>{`Hasta ${anios(DURACION_VISADO_MESES)}`}</td>
                  <td>{`Hasta ${anios(DURACION_AUTORIZACION_INICIAL_MESES)}, renovable por períodos de ${anios(DURACION_RENOVACION_MESES)}`}</td>
                </tr>
                <tr>
                  <td>Trabajo en España</td>
                  <td>{`En remoto; por cuenta ajena, solo para empresas radicadas fuera de España; por cuenta propia, hasta el ${TOPE_ESPANA} para empresas de España`}</td>
                  <td>{`En remoto; por cuenta ajena, solo para empresas radicadas fuera de España; por cuenta propia, hasta el ${TOPE_ESPANA} para empresas de España`}</td>
                </tr>
                <tr>
                  <td>Residencia fiscal</td>
                  <td>{`Posible régimen especial (${pct(24)} de la base liquidable hasta 600.000 €)`}</td>
                  <td>{`Posible régimen especial (${pct(24)} de la base liquidable hasta 600.000 €)`}</td>
                </tr>
                <tr>
                  <td>Plazo de resolución</td>
                  <td>10 días hábiles (art. 75.5)</td>
                  <td>Veinte días; sin respuesta, concedida por silencio (art. 76)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Escenarios de uso */}
        <section className={styles.guideSection}>
          <h2>¿Quién puede beneficiarse? 4 perfiles reales</h2>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">👨‍💻</span>
              <h3>Desarrollador de software</h3>
              <p>
                Trabaja para una startup norteamericana en remoto. Quiere vivir en España disfrutando
                del clima y la calidad de vida. Si lleva ≥{MESES_ANTIGUEDAD} meses en la empresa y gana ≥{MINIMO_INGRESOS_TITULAR_NOMADA.toLocaleString('es-ES')} €/mes,
                puede solicitar el visado en el consulado.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🎨</span>
              <h3>Diseñadora freelancer</h3>
              <p>
                Diseñadora gráfica con clientes en Reino Unido, Alemania y Estados Unidos. Factura
                ≥{MINIMO_INGRESOS_TITULAR_NOMADA.toLocaleString('es-ES')} €/mes. Solicita la Autorización de Residencia estando ya en España con visa
                de turista.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">📊</span>
              <h3>Consultor financiero</h3>
              <p>
                Trabaja para un banco suizo en remoto. Ya lleva 6 meses con la empresa y tiene nóminas
                que acreditan ingresos superiores al mínimo. Solicita el visado antes de viajar a España.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">✍️</span>
              <h3>Copywriter internacional</h3>
              <p>
                {`Escribe contenido para marcas de EE.UU. y el Reino Unido. Sus ingresos superan el mínimo, pero tiene un cliente español. Como profesional por cuenta propia, puede optar al visado si su trabajo para empresas de España no supera el ${TOPE_ESPANA} de su actividad.`}
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>¿Puedo tener algún cliente en España siendo freelancer?</h3>
              <p>
                {`Sí, con un tope: como profesional por cuenta propia puedes trabajar para empresas ubicadas en España siempre que ese trabajo no supere el ${TOPE_ESPANA} del total de tu actividad profesional (Ley 14/2013, art. 74 bis). Ese margen es solo del freelancer: por cuenta ajena solo puedes trabajar para empresas radicadas fuera de España.`}
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué ocurre después del año del visado?</h3>
              <p>
                {`Una vez en España con el visado, puedes solicitar la Autorización de Residencia para Teletrabajo Internacional, que se concede por un máximo de ${anios(DURACION_AUTORIZACION_INICIAL_MESES)} y es renovable por períodos de ${anios(DURACION_RENOVACION_MESES)} (Ley 14/2013, art. 74 quinquies).`}
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Puedo incluir a mi familia?</h3>
              <p>
                {`Sí. El cónyuge o pareja de hecho y los hijos menores a cargo pueden obtener autorización de residencia vinculada. Por cada familiar dependiente, los ingresos mínimos se incrementan en un ${pct(75)} del SMI (≈${MINIMO_INGRESOS_DEPENDIENTE_NOMADA.toLocaleString('es-ES')} €/mes por persona).`}
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>{FAQ_FISCAL.pregunta}</h3>
              <p>{FAQ_FISCAL.respuesta}</p>
            </div>
            <div className={styles.faqItem}>
              <h3>{FAQ_PLAZO.pregunta}</h3>
              <p>{FAQ_PLAZO.respuesta}</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Puedo trabajar para una empresa española también?</h3>
              <p>
                {`Depende del perfil. Por cuenta ajena, no: solo puedes trabajar para empresas radicadas fuera de España. Por cuenta propia, sí, siempre que ese trabajo no supere el ${TOPE_ESPANA} de tu actividad profesional (Ley 14/2013, art. 74 bis). Para trabajar más para empresas españolas, necesitarías una autorización de trabajo diferente.`}
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué pasa si mi empresa tiene oficina en España?</h3>
              <p>
                {`Si trabajas por cuenta ajena, la ley exige que tu empleador sea una empresa radicada fuera de España (Ley 14/2013, art. 74 bis); el margen del ${TOPE_ESPANA} de trabajo para empresas de España es solo de los profesionales por cuenta propia. Si tu empleador tiene sede o establecimiento en España, consulta con un abogado si cumple ese requisito antes de solicitar.`}
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué es el SMI y por qué se usa como referencia?</h3>
              <p>
                {`El Salario Mínimo Interprofesional (SMI) es el salario mínimo legalmente establecido en España. En 2026 es de ${SMI_MENSUAL_NOMADA.toLocaleString('es-ES')} €/mes (14 pagas). Para la visa de teletrabajo se toma como referencia un mínimo de ingresos del ${pct(200)} del SMI, que sirve para acreditar los recursos económicos suficientes que exige la ley.`}
              </p>
            </div>
          </div>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo solicitar la Visa Nómada Digital: 6 pasos</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>1</div>
              <h3>Verifica tu elegibilidad</h3>
              <p>
                {`Comprueba que cumples todos los requisitos: perfil de trabajo remoto, empleador o clientes extranjeros, ingresos mínimos (≥${pct(200)} SMI) y ausencia de antecedentes penales en España y en los países de residencia de los últimos 2 años.`}
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>2</div>
              <h3>Reúne la documentación</h3>
              <p>
                Recopila todos los documentos necesarios. Los emitidos en el extranjero deben estar
                traducidos al español por traductor jurado y apostillados según el Convenio de La Haya.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>3</div>
              <h3>Solicita cita previa</h3>
              <p>
                Si solicitas el visado, pide cita en el consulado español de tu país de residencia.
                Si ya estás en España y solicitas la autorización, acude a la Unidad de Grandes Empresas
                (UGE) o a la Extranjería competente.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>4</div>
              <h3>Presenta la solicitud</h3>
              <p>
                Entrega toda la documentación junto con el formulario oficial (EX-01) y el justificante
                del pago de tasas. Guarda todos los justificantes y acuses de recibo.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>5</div>
              <h3>Espera la resolución</h3>
              <p>
                El visado se resuelve en 10 días hábiles (Ley 14/2013, art. 75.5). La autorización de
                residencia, en veinte días desde la presentación electrónica; si en ese plazo no hay
                respuesta, se entiende concedida por silencio administrativo (art. 76). En la práctica,
                espera la resolución expresa.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>6</div>
              <h3>Solicita la TIE (si procede)</h3>
              <p>
                Una vez concedida la autorización de residencia, solicita la Tarjeta de Identidad de
                Extranjero (TIE) en la comisaría de policía correspondiente. Es el documento que
                acredita tu residencia legal en España.
              </p>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className={styles.guideSection}>
          <h2>6 consejos para que tu solicitud tenga éxito</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📑</span>
              <h3>Apostilla todo lo extranjero</h3>
              <p>
                Cualquier documento emitido en el extranjero (contrato, antecedentes penales,
                titulación) debe estar apostillado según el Convenio de La Haya y traducido por
                traductor oficial jurado.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💰</span>
              <h3>Demuestra ingresos con solvencia</h3>
              <p>
                Aporta los últimos 3-6 meses de nóminas o extractos bancarios. Si eres freelancer,
                incluye declaraciones fiscales y facturas que demuestren ingresos recurrentes
                superiores al mínimo exigido.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <h3>Asesórate antes de solicitar</h3>
              <p>
                Un abogado especializado en derecho migratorio puede revisar tu caso, detectar
                posibles problemas y preparar la documentación correctamente, aumentando las
                probabilidades de éxito.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏥</span>
              <h3>Contrata el seguro médico antes</h3>
              <p>
                El seguro médico debe estar activo en el momento de la solicitud y cubrir toda tu
                estancia en España. Compara opciones específicas para nómadas digitales que suelen
                ser más económicas que los seguros locales estándar.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📧</span>
              <h3>Pide carta detallada al empleador</h3>
              <p>
                {`La carta del empleador debe detallar: que el trabajo es 100 % remoto, tu antigüedad en la empresa (≥${MESES_ANTIGUEDAD} meses), tu salario bruto mensual, que la empresa está radicada fuera de España y que lleva al menos un año de actividad.`}
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌍</span>
              <h3>Evalúa el régimen fiscal especial</h3>
              <p>
                {`Si te conviertes en residente fiscal en España, estudia si te interesa el régimen del art. 93 LIRPF (${pct(24)} de la base liquidable hasta 600.000 €) y si tu perfil puede acogerse a él. Debes solicitarlo`} en los 6 meses siguientes
                al inicio de la actividad en España.
              </p>
            </div>
          </div>
        </section>

        {/* Warning box */}
        <section className={styles.warningBox}>
          <h2><span aria-hidden="true">⚠️</span> 6 errores que pueden tumbar tu solicitud</h2>
          <div className={styles.warningGrid}>
            <div className={styles.warningItem}>
              <strong>1. Documentos sin apostillar o sin traducción jurada</strong>
              <p>
                Es el error más común. Todo documento extranjero debe estar apostillado Y traducido
                al español por traductor oficial. Uno sin el otro no es válido.
              </p>
            </div>
            <div className={styles.warningItem}>
              <strong>2. Ingresos documentados por debajo del mínimo</strong>
              <p>
                {`No basta con tener ese salario: hay que demostrarlo. Si tienes ingresos variables, usa el promedio de los últimos 6 meses para superar con margen el umbral del ${pct(200)} SMI.`}
              </p>
            </div>
            <div className={styles.warningItem}>
              <strong>{'3. No acreditar la modalidad 100 % remota'}</strong>
              <p>
                Debes demostrar que tu trabajo se realiza íntegramente a distancia. Un contrato
                híbrido o con presencia física obligatoria en la empresa puede invalidar la solicitud.
              </p>
            </div>
            <div className={styles.warningItem}>
              <strong>{`4. Superar el ${TOPE_ESPANA} de trabajo para España, o un empleador radicado en España`}</strong>
              <p>
                {`Como freelancer, si tu trabajo para empresas de España supera el ${TOPE_ESPANA} de tu actividad, tu solicitud puede ser denegada: guarda facturas que muestren el reparto por países. Como empleado no hay margen: tu empresa tiene que estar radicada fuera de España.`}
              </p>
            </div>
            <div className={styles.warningItem}>
              <strong>5. Solicitar desde situación irregular en España</strong>
              <p>
                Si ya estás en España y tu estancia legal ha expirado (visa turista caducada,
                por ejemplo), no puedes solicitar la autorización desde dentro. Deberías hacerlo
                desde el consulado en tu país de origen.
              </p>
            </div>
            <div className={styles.warningItem}>
              <strong>6. Olvidar el plazo para el régimen fiscal especial</strong>
              <p>
                {`Si te interesa tributar al ${pct(24)} (régimen del art. 93 LIRPF), debes solicitarlo en los 6 meses siguientes al inicio de tu actividad en España. Pasado ese plazo, perderás la opción para ese periodo.`}
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="requisitos-nomada-digital" />
      <Footer appName="requisitos-nomada-digital" />
    </div>
  );
}
