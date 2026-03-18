'use client';

import { useState, useMemo } from 'react';
import styles from './RequisitosNomadaDigital.module.css';
import {
  MeskeiaLogo,
  Footer,
  NumberInput,
  EducationalSection,
  ShareCard,
} from '@/components';
import { formatCurrency, parseSpanishNumber } from '@/lib';
import {
  MINIMO_INGRESOS_TITULAR_NOMADA,
  MINIMO_INGRESOS_DEPENDIENTE_NOMADA,
} from '@/data/fiscal';

type Perfil = 'empleado' | 'freelancer' | '';
type Respuesta = true | false | null;

interface Requisito {
  id: string;
  pregunta: string;
  explicacion: string;
  soloEmpleado?: boolean;
  soloFreelancer?: boolean;
  bloqueante?: boolean; // requisito que si falla, descalifica directamente
}

const REQUISITOS: Requisito[] = [
  {
    id: 'noUE',
    pregunta: '¿Eres ciudadano/a de un país no perteneciente a la UE / EEE / Suiza?',
    explicacion:
      'Los ciudadanos de la UE, el Espacio Económico Europeo y Suiza pueden residir y trabajar libremente en España. Si eres de estos países, no necesitas este visado.',
    bloqueante: true,
  },
  {
    id: 'trabajoRemoto',
    pregunta: '¿Trabajas (o vas a trabajar) completamente en remoto usando medios telemáticos?',
    explicacion:
      'Tu actividad debe poder realizarse íntegramente a distancia, mediante ordenador u otros medios digitales, sin necesidad de presencia física en la empresa.',
    bloqueante: true,
  },
  {
    id: 'empresaExtranjera',
    pregunta: '¿Tu empresa empleadora tiene su sede o domicilio social fuera de España?',
    explicacion:
      'El empleador debe ser una empresa radicada en el extranjero. Si tiene presencia en España, los clientes o facturación española no puede superar el 20% del total.',
    soloEmpleado: true,
    bloqueante: true,
  },
  {
    id: 'clientesExtranjeros',
    pregunta: '¿La mayoría de tus clientes e ingresos provienen de fuera de España?',
    explicacion:
      'Como freelancer, tu actividad económica debe desarrollarse mayoritariamente con empresas o clientes extranjeros. Los clientes en España deben ser minoría.',
    soloFreelancer: true,
    bloqueante: true,
  },
  {
    id: 'antiguedad',
    pregunta: '¿Llevas al menos 3 meses trabajando con tu empresa actual?',
    explicacion:
      'Se exige una relación laboral preexistente de mínimo 3 meses antes de presentar la solicitud, para acreditar la estabilidad del empleo remoto.',
    soloEmpleado: true,
  },
  {
    id: 'experiencia',
    pregunta: '¿Tienes al menos 1 año de experiencia profesional acreditable en tu campo?',
    explicacion:
      'Como freelancer debes demostrar experiencia laboral previa mediante contratos, facturas, cartas de clientes u otros documentos que justifiquen tu trayectoria.',
    soloFreelancer: true,
  },
  {
    id: 'titulacion',
    pregunta: '¿Tienes titulación universitaria o acreditas más de 3 años de experiencia profesional?',
    explicacion:
      'Se puede acreditar la cualificación con un título universitario homologable en España, o demostrar al menos 3 años de experiencia laboral en el sector.',
  },
  {
    id: 'sinAntecedentes',
    pregunta: '¿Estás libre de antecedentes penales en los últimos 5 años en España y en tus países de residencia anteriores?',
    explicacion:
      'Debes aportar certificado de antecedentes penales del Registro Central de Penados (si ya residiste en España) y de los países donde hayas vivido los últimos 5 años.',
    bloqueante: true,
  },
  {
    id: 'situacionRegular',
    pregunta: '¿Estás en situación regular en España (o vas a solicitar el visado desde el extranjero)?',
    explicacion:
      'Si ya estás en España, no puedes estar en situación irregular. Si aún no has llegado, solicitas el visado en el consulado español de tu país y este requisito no aplica.',
  },
  {
    id: 'seguroMedico',
    pregunta: '¿Tienes (o puedes contratar) seguro médico con cobertura completa en España?',
    explicacion:
      'El seguro puede ser privado o público (convenio bilateral, tarjeta sanitaria europea, etc.) pero debe cubrir todos los riesgos sin copagos ni límites de cobertura.',
  },
];

const DOCUMENTOS_COMUNES = [
  'Formulario de solicitud oficial (modelo EX-01)',
  'Pasaporte vigente con mínimo 1 año de validez (copia y original)',
  'Fotografía reciente en color con fondo blanco',
  'Certificado de antecedentes penales apostillado (de España y países de residencia últimos 5 años)',
  'Seguro médico con cobertura en España (privado o equivalente)',
  'Justificante de medios económicos (nóminas, extractos bancarios o declaración de ingresos)',
  'Tasas administrativas abonadas',
];

const DOCUMENTOS_EMPLEADO = [
  'Contrato de trabajo con empresa extranjera (traducido y apostillado)',
  'Carta del empleador confirmando modalidad 100% remota y antigüedad ≥ 3 meses',
  'Documentación acreditativa de la empresa (registro mercantil, actividad, sede)',
  'Últimas 3 nóminas que acrediten ingresos ≥ 200% SMI (2.646 €/mes)',
];

const DOCUMENTOS_FREELANCER = [
  'Contratos o acuerdos con clientes extranjeros (últimos 12 meses)',
  'Últimas facturas emitidas a clientes fuera de España',
  'Declaraciones fiscales que acrediten ingresos ≥ 200% SMI (2.646 €/mes)',
  'Documentación que acredite al menos 1 año de experiencia profesional',
  'Relación de clientes con indicación de su país (para demostrar mayoría extranjera)',
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
  const ingresosOk = ingresos !== '' && ingresosNum >= minimoRequerido;
  const ingresosInsuficientes = ingresos !== '' && ingresosNum < minimoRequerido;

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
    if (ingresos === '') return 'pendiente';

    const respondidos = requisitosAplicables.filter((r) => respuestas[r.id] !== undefined);
    if (respondidos.length < requisitosAplicables.length) return 'pendiente';

    // Requisitos bloqueantes fallidos
    const bloqueanteFallido = requisitosAplicables.some(
      (r) => r.bloqueante && respuestas[r.id] === false
    );
    if (bloqueanteFallido || ingresosInsuficientes) return 'no-apto';

    const fallidos = requisitosAplicables.filter((r) => respuestas[r.id] === false).length;
    if (fallidos === 0) return 'apto';
    if (fallidos <= 1) return 'casi';
    return 'no-apto';
  }, [perfil, respuestas, requisitosAplicables, ingresos, ingresosInsuficientes]);

  const totalRespondidos = requisitosAplicables.filter((r) => respuestas[r.id] !== undefined).length;
  const totalOk = requisitosAplicables.filter((r) => respuestas[r.id] === true).length;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon}>🌍</div>
        <h1 className={styles.title}>Visa Nómada Digital</h1>
        <p className={styles.subtitle}>
          Comprueba si cumples los requisitos para trabajar en remoto desde España
        </p>
        <p className={styles.heroLaw}>Ley 28/2022 de Startups · RD 1008/2023</p>
      </header>

      {/* Selector de perfil */}
      <section className={styles.perfilSection}>
        <h2 className={styles.sectionTitle}>¿Cuál es tu situación?</h2>
        <div className={styles.perfilGrid}>
          <button
            className={`${styles.perfilCard} ${perfil === 'empleado' ? styles.perfilActive : ''}`}
            onClick={() => { setPerfil('empleado'); setRespuestas({}); }}
          >
            <span className={styles.perfilIcon}>👔</span>
            <strong>Empleado por cuenta ajena</strong>
            <span>Trabajo para una empresa con sede fuera de España</span>
          </button>
          <button
            className={`${styles.perfilCard} ${perfil === 'freelancer' ? styles.perfilActive : ''}`}
            onClick={() => { setPerfil('freelancer'); setRespuestas({}); }}
          >
            <span className={styles.perfilIcon}>💻</span>
            <strong>Freelancer / Autónomo</strong>
            <span>Tengo clientes propios mayoritariamente fuera de España</span>
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
                placeholder="2646"
                helperText={`Mínimo requerido: ${formatCurrency(minimoRequerido)}/mes`}
                min={0}
              />
              <div className={styles.dependientesField}>
                <label className={styles.label}>Familiares dependientes a cargo</label>
                <div className={styles.stepperContainer}>
                  <button
                    className={styles.stepperBtn}
                    onClick={() => setDependientes(String(Math.max(0, dependientesNum - 1)))}
                    aria-label="Reducir dependientes"
                  >−</button>
                  <span className={styles.stepperValue}>{dependientesNum}</span>
                  <button
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

            {ingresos !== '' && (
              <div className={`${styles.ingresosBanner} ${ingresosOk ? styles.bannerOk : styles.bannerError}`}>
                {ingresosOk ? (
                  <>✅ Ingresos suficientes — {formatCurrency(ingresosNum)}/mes ≥ mínimo de {formatCurrency(minimoRequerido)}/mes</>
                ) : (
                  <>❌ Ingresos insuficientes — {formatCurrency(ingresosNum)}/mes &lt; mínimo de {formatCurrency(minimoRequerido)}/mes</>
                )}
              </div>
            )}
          </section>

          {/* Checklist de requisitos */}
          <section className={styles.checklistSection}>
            <h2 className={styles.sectionTitle}>
              Requisitos legales
              <span className={styles.progreso}>{totalRespondidos}/{requisitosAplicables.length} respondidos</span>
            </h2>

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
                      {req.bloqueante && (
                        <span className={styles.badgeBloqueante}>Imprescindible</span>
                      )}
                    </div>
                    <p className={styles.reqExplicacion}>{req.explicacion}</p>
                    <div className={styles.reqBotones}>
                      <button
                        className={`${styles.btnResp} ${resp === true ? styles.btnRespActiveSi : ''}`}
                        onClick={() => setRespuesta(req.id, true)}
                      >
                        Sí
                      </button>
                      <button
                        className={`${styles.btnResp} ${resp === false ? styles.btnRespActiveNo : ''}`}
                        onClick={() => setRespuesta(req.id, false)}
                      >
                        No
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Resultado */}
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
                {resultado === 'casi' && (
                  <>
                    <div className={styles.resultadoIcon} aria-hidden="true">⚠️</div>
                    <h2 className={styles.resultadoTitulo}>Casi cumples los requisitos</h2>
                    <p className={styles.resultadoTexto}>
                      Tienes algún requisito sin cubrir totalmente. Revisa los puntos marcados con ❌
                      y consulta con un abogado especializado: en algunos casos hay margen de interpretación
                      o documentación alternativa.
                    </p>
                  </>
                )}
                {resultado === 'no-apto' && (
                  <>
                    <div className={styles.resultadoIcon} aria-hidden="true">❌</div>
                    <h2 className={styles.resultadoTitulo}>No cumples algún requisito clave</h2>
                    <p className={styles.resultadoTexto}>
                      Hay uno o más requisitos imprescindibles que no se cumplen según tus respuestas.
                      Revisa los puntos marcados con ❌. Si tienes dudas, consulta con un abogado
                      especializado en derecho migratorio: los casos tienen matices.
                    </p>
                  </>
                )}
              </div>

              {/* Documentación necesaria */}
              {resultado === 'apto' || resultado === 'casi' ? (
                <div className={styles.documentosSection}>
                  <h3 className={styles.docsTitulo}>📄 Documentación que necesitarás</h3>
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
        </>
      )}

      {!perfil && (
        <div className={styles.emptyState}>
          <p>Selecciona tu perfil para comenzar el orientador de elegibilidad</p>
        </div>
      )}

      {/* Disclaimer — siempre visible */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso importante</h3>
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
      </div>

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="📚 Todo sobre la Visa Nómada Digital"
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
                  <td>1 año (no renovable)</td>
                  <td>3 años (renovable 2 años más)</td>
                </tr>
                <tr>
                  <td>Trabajo en España</td>
                  <td>No autorizado (solo remoto para empresa extranjera)</td>
                  <td>No autorizado (solo remoto para empresa extranjera)</td>
                </tr>
                <tr>
                  <td>Residencia fiscal</td>
                  <td>Posible régimen especial (24% fijo hasta 600.000 €)</td>
                  <td>Posible régimen especial (24% fijo hasta 600.000 €)</td>
                </tr>
                <tr>
                  <td>Plazo de resolución</td>
                  <td>~10 días hábiles</td>
                  <td>~10 días hábiles</td>
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
              <span className={styles.scenarioIcon}>👨‍💻</span>
              <h3>Desarrollador de software</h3>
              <p>
                Trabaja para una startup norteamericana en remoto. Quiere vivir en España disfrutando
                del clima y la calidad de vida. Si lleva ≥3 meses en la empresa y gana ≥2.646 €/mes,
                puede solicitar el visado en el consulado.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🎨</span>
              <h3>Diseñadora freelancer</h3>
              <p>
                Diseñadora gráfica con clientes en Reino Unido, Alemania y Estados Unidos. Factura
                ≥2.646 €/mes. Solicita la Autorización de Residencia estando ya en España con visa
                de turista.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>📊</span>
              <h3>Consultor financiero</h3>
              <p>
                Trabaja para un banco suizo en remoto. Ya lleva 6 meses con la empresa y tiene nóminas
                que acreditan ingresos superiores al mínimo. Solicita el visado antes de viajar a España.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>✍️</span>
              <h3>Copywriter internacional</h3>
              <p>
                Escribe contenido para marcas de EE.UU. y el Reino Unido. Sus ingresos superan el mínimo
                pero tiene un cliente español. Puede optar al visado si los ingresos de España no superan
                el 20% del total.
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
                Sí, pero de forma minoritaria. La ley no especifica un porcentaje exacto para freelancers,
                pero la práctica habitual es que los ingresos procedentes de España representen una parte
                claramente menor del total. Para empleados, el límite del empleador es claro: máximo el
                20% de actividad en España.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué ocurre después del año del visado?</h3>
              <p>
                Una vez en España con el visado, puedes solicitar la Autorización de Residencia para
                Teletrabajo Internacional, que se concede por 3 años y es renovable por periodos de 2 años.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Puedo incluir a mi familia?</h3>
              <p>
                Sí. El cónyuge o pareja de hecho y los hijos menores a cargo pueden obtener autorización
                de residencia vinculada. Por cada familiar dependiente, los ingresos mínimos se incrementan
                en un 75% del SMI (≈992 €/mes por persona).
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Tengo que pagar impuestos en España?</h3>
              <p>
                Si resides en España más de 183 días al año, pasas a ser residente fiscal. Puedes acogerte
                al régimen especial del art. 93 LIRPF (conocido como "Ley Beckham") que permite tributar
                a tipo fijo del 24% sobre los primeros 600.000 € durante 5 años.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cuánto tarda la resolución?</h3>
              <p>
                La ley establece un plazo máximo de 10 días hábiles para resolver la solicitud (vs. los
                meses habituales en otros trámites de extranjería). En la práctica puede variar según el
                consulado o la oficina gestora.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Puedo trabajar para una empresa española también?</h3>
              <p>
                La autorización no habilita para trabajar para empresas españolas ni realizar actividades
                económicas en territorio español (salvo el porcentaje permitido). Si quieres trabajar para
                empresas españolas, necesitarías una autorización de trabajo diferente.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué pasa si mi empresa tiene oficina en España?</h3>
              <p>
                Es posible si tu empleador tiene establecimiento en España, siempre que la actividad
                desarrollada desde España sea mayoritariamente para sus clientes o mercados extranjeros
                (máximo 20% en España).
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué es el SMI y por qué se usa como referencia?</h3>
              <p>
                El Salario Mínimo Interprofesional (SMI) es el salario mínimo legalmente establecido en
                España. En 2025 es de 1.323 €/mes (14 pagas). La Ley de Startups fija el mínimo de
                ingresos en 200% del SMI para garantizar la solvencia económica del nómada digital.
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
                Comprueba que cumples todos los requisitos: perfil de trabajo remoto, empleador
                o clientes extranjeros, ingresos mínimos (≥200% SMI) y ausencia de antecedentes
                penales en los últimos 5 años.
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
                El plazo legal es de 10 días hábiles. Si pasado ese plazo no hay respuesta, se entiende
                concedida por silencio administrativo positivo (en la práctica, espera la resolución
                expresa).
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
              <span className={styles.tipIcon}>📑</span>
              <h3>Apostilla todo lo extranjero</h3>
              <p>
                Cualquier documento emitido en el extranjero (contrato, antecedentes penales,
                titulación) debe estar apostillado según el Convenio de La Haya y traducido por
                traductor oficial jurado.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💰</span>
              <h3>Demuestra ingresos con solvencia</h3>
              <p>
                Aporta los últimos 3-6 meses de nóminas o extractos bancarios. Si eres freelancer,
                incluye declaraciones fiscales y facturas que demuestren ingresos recurrentes
                superiores al mínimo exigido.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚖️</span>
              <h3>Asesórate antes de solicitar</h3>
              <p>
                Un abogado especializado en derecho migratorio puede revisar tu caso, detectar
                posibles problemas y preparar la documentación correctamente, aumentando las
                probabilidades de éxito.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏥</span>
              <h3>Contrata el seguro médico antes</h3>
              <p>
                El seguro médico debe estar activo en el momento de la solicitud y cubrir toda tu
                estancia en España. Compara opciones específicas para nómadas digitales que suelen
                ser más económicas que los seguros locales estándar.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📧</span>
              <h3>Pide carta detallada al empleador</h3>
              <p>
                La carta del empleador debe detallar: que el trabajo es 100% remoto, tu antigüedad
                en la empresa (≥3 meses), tu salario bruto mensual y que la empresa no tiene actividad
                mayoritaria en España.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🌍</span>
              <h3>Evalúa el régimen fiscal especial</h3>
              <p>
                Si te conviertes en residente fiscal en España, estudia si te interesa el régimen del
                art. 93 LIRPF (24% fijo hasta 600.000 €). Debes solicitarlo en los 6 meses siguientes
                al inicio de la actividad en España.
              </p>
            </div>
          </div>
        </section>

        {/* Warning box */}
        <section className={styles.warningBox}>
          <h2>⚠️ 6 errores que pueden tumbar tu solicitud</h2>
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
                No basta con tener ese salario: hay que demostrarlo. Si tienes ingresos variables,
                usa el promedio de los últimos 6 meses para superar con margen el umbral del 200% SMI.
              </p>
            </div>
            <div className={styles.warningItem}>
              <strong>3. No acreditar la modalidad 100% remota</strong>
              <p>
                Debes demostrar que tu trabajo se realiza íntegramente a distancia. Un contrato
                híbrido o con presencia física obligatoria en la empresa puede invalidar la solicitud.
              </p>
            </div>
            <div className={styles.warningItem}>
              <strong>4. Empresa con más del 20% de actividad en España</strong>
              <p>
                Si tu empleador supera ese umbral de actividad española, tu solicitud puede ser
                denegada. Solicita documentación a la empresa sobre su distribución geográfica de
                clientes e ingresos.
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
                Si te interesa tributar al 24% (régimen del art. 93 LIRPF), debes solicitarlo
                en los 6 meses siguientes al inicio de tu actividad en España. Pasado ese plazo,
                perderás la opción para ese periodo.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <ShareCard appName="requisitos-nomada-digital" />
      <Footer appName="requisitos-nomada-digital" />
    </div>
  );
}
