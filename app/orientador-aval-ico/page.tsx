'use client';

import { useState, useMemo } from 'react';
import styles from './OrientadorAvalIco.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type Perfil = 'jovenes' | 'familias';

interface Requisito {
  id: string;
  pregunta: string;
  explicacion: string;
  bloqueante: boolean;
  perfil: Perfil | 'ambos';
}

const REQUISITOS: Requisito[] = [
  {
    id: 'edad-joven',
    pregunta: 'Tienes menos de 35 años',
    explicacion: 'El Aval ICO para jóvenes está dirigido a menores de 35 años. Si tienes 35 o más, consulta si accedes por el tramo de familias con menores.',
    bloqueante: true,
    perfil: 'jovenes',
  },
  {
    id: 'menores-familia',
    pregunta: 'Tienes a tu cargo al menos un menor de edad',
    explicacion: 'El segundo tramo del Aval ICO es para familias o unidades de convivencia que tengan hijos menores de edad a su cargo.',
    bloqueante: true,
    perfil: 'familias',
  },
  {
    id: 'residente',
    pregunta: 'Eres residente legal en España',
    explicacion: 'Debes tener residencia legal en España. Los extranjeros comunitarios con certificado de registro o extracomunitarios con permiso de residencia pueden acceder.',
    bloqueante: true,
    perfil: 'ambos',
  },
  {
    id: 'ingresos',
    pregunta: 'Tus ingresos no superan 4,5 veces el IPREM (37.800 €/año aprox.)',
    explicacion: 'El límite de ingresos es 4,5 × IPREM anual. Para familias numerosas o con discapacidad el límite se amplía a 6,5 × IPREM (~54.600 €).',
    bloqueante: true,
    perfil: 'ambos',
  },
  {
    id: 'primera-vivienda',
    pregunta: 'Vas a comprar tu primera vivienda habitual',
    explicacion: 'La vivienda debe destinarse a residencia habitual y permanente. No puede ser una segunda vivienda, inversión o alquiler. No puedes ser propietario de otra vivienda en España.',
    bloqueante: true,
    perfil: 'ambos',
  },
  {
    id: 'precio',
    pregunta: 'El precio de la vivienda no supera los 250.000 €',
    explicacion: 'El Aval ICO cubre viviendas cuyo precio de adquisición no supere 250.000 €. Para familias numerosas o en situaciones especiales, el límite puede variar según la CA.',
    bloqueante: false,
    perfil: 'ambos',
  },
  {
    id: 'solvencia',
    pregunta: 'Tienes ingresos regulares y no tienes impagos en CIRBE',
    explicacion: 'El banco evaluará tu solvencia crediticia. No debes constar en registros de morosos (ASNEF, CIRBE) con impagos significativos. El aval ICO no reemplaza el análisis de riesgo del banco.',
    bloqueante: false,
    perfil: 'ambos',
  },
];

type EstadoRequisito = 'si' | 'no' | 'pendiente';

export default function OrientadorAvalIcoPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [estados, setEstados] = useState<Record<string, EstadoRequisito>>(
    Object.fromEntries(REQUISITOS.map(r => [r.id, 'pendiente']))
  );

  const toggleEstado = (id: string, valor: EstadoRequisito) => {
    setEstados(prev => ({ ...prev, [id]: prev[id] === valor ? 'pendiente' : valor }));
  };

  const requisitosFiltrados = useMemo(() => {
    if (!perfil) return [];
    return REQUISITOS.filter(r => r.perfil === 'ambos' || r.perfil === perfil);
  }, [perfil]);

  const resultado = useMemo(() => {
    if (!perfil || requisitosFiltrados.length === 0) return 'pendiente';
    const bloqueantes = requisitosFiltrados.filter(r => r.bloqueante);
    const algunBloqueanteFalla = bloqueantes.some(r => estados[r.id] === 'no');
    const algunBloqueantePendiente = bloqueantes.some(r => estados[r.id] === 'pendiente');
    const algunNoRecomendado = requisitosFiltrados.filter(r => !r.bloqueante).some(r => estados[r.id] === 'no');
    const todosOk = requisitosFiltrados.every(r => estados[r.id] === 'si');

    if (algunBloqueanteFalla) return 'negativo';
    if (todosOk && !algunNoRecomendado) return 'positivo';
    if (!algunBloqueantePendiente) return 'parcial';
    return 'pendiente';
  }, [perfil, requisitosFiltrados, estados]);

  const iconoEstado = (estado: EstadoRequisito) => {
    if (estado === 'si') return '✅';
    if (estado === 'no') return '❌';
    return '⬜';
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🏡</div>
        <h1 className={styles.title}>Orientador Aval ICO Vivienda</h1>
        <p className={styles.subtitle}>¿Puedes acceder al aval del Estado para comprar tu primera casa?</p>
        <p className={styles.heroNote}>Línea de Avales ICO · Ministerio de Vivienda</p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="financial"
        severity="critical"
        collapsible={false}
        context="El Aval ICO es gestionado por entidades financieras adheridas al programa. Esta herramienta es orientativa: los criterios de aprobación los fija el banco. Consulta siempre con tu entidad financiera y con el ICO (ico.es) antes de tomar decisiones."
      />

      <div className={styles.infoBanner}>
        <span aria-hidden="true">ℹ️</span>
        <span>
          El <strong>Aval ICO Vivienda</strong> permite al Estado avalar hasta el <strong>20% del precio</strong> (o 25% para jóvenes y familias)
          de tu primera vivienda, de forma que el banco solo te exija financiar el 80% en lugar del 100%. Así, no necesitas tener ahorrado
          el 20% que normalmente pide el banco. El aval no es una subvención: el préstamo hipotecario lo pagas íntegramente.
        </span>
      </div>

      {/* Selección de perfil */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>¿Cuál es tu perfil?</h2>
        <div className={styles.perfilGrid}>
          <button
            type="button"
            className={`${styles.perfilCard} ${perfil === 'jovenes' ? styles.perfilActivo : ''}`}
            onClick={() => setPerfil('jovenes')}
            aria-pressed={perfil === 'jovenes'}
          >
            <span className={styles.perfilIcon} aria-hidden="true">🧑</span>
            <strong>Jóvenes menores de 35 años</strong>
            <span>Aval del 20-25% del precio</span>
          </button>
          <button
            type="button"
            className={`${styles.perfilCard} ${perfil === 'familias' ? styles.perfilActivo : ''}`}
            onClick={() => setPerfil('familias')}
            aria-pressed={perfil === 'familias'}
          >
            <span className={styles.perfilIcon} aria-hidden="true">👨‍👩‍👧</span>
            <strong>Familias con hijos menores</strong>
            <span>Aval del 20-25% del precio</span>
          </button>
        </div>
      </section>

      {/* Checklist */}
      {perfil && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><span aria-hidden="true">✅</span> Comprueba tus requisitos</h2>
          <div className={styles.checkGrid} role="list">
            {requisitosFiltrados.map(req => {
              const estado = estados[req.id];
              return (
                <div
                  key={req.id}
                  className={`${styles.checkCard} ${estado === 'si' ? styles.checkCardOk : estado === 'no' ? styles.checkCardFail : ''}`}
                  role="listitem"
                >
                  <span className={styles.checkEstado} aria-hidden="true">{iconoEstado(estado)}</span>
                  <div className={styles.checkInfo}>
                    <p className={styles.checkPregunta}>{req.pregunta}</p>
                    <p className={styles.checkExplicacion}>{req.explicacion}</p>
                  </div>
                  {req.bloqueante && (
                    <span className={styles.badgeImprescindible} aria-label="Requisito imprescindible">IMPRESCINDIBLE</span>
                  )}
                  <div className={styles.radioGroup} role="group" aria-label={`Respuesta para: ${req.pregunta}`}>
                    <button
                      type="button"
                      className={`${styles.radioBtn} ${estado === 'si' ? styles.radioBtnActive : ''}`}
                      onClick={() => toggleEstado(req.id, 'si')}
                      aria-pressed={estado === 'si'}
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      className={`${styles.radioBtn} ${estado === 'no' ? styles.radioBtnActive : ''}`}
                      onClick={() => toggleEstado(req.id, 'no')}
                      aria-pressed={estado === 'no'}
                    >
                      No
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Resultado */}
      {resultado !== 'pendiente' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><span aria-hidden="true">📊</span> Tu resultado orientativo</h2>
          {resultado === 'positivo' && (
            <div className={`${styles.resultadoCard} ${styles['resultado-positivo']}`} role="alert" aria-live="polite">
              <div className={styles.resultadoIcon} aria-hidden="true">✅</div>
              <h3 className={styles.resultadoTitulo}>En principio puedes solicitar el Aval ICO</h3>
              <p className={styles.resultadoTexto}>
                Cumples los requisitos orientativos para acceder al Aval ICO Vivienda. El siguiente paso es contactar
                con una entidad financiera adherida al programa para que evalúe tu solicitud de hipoteca con aval.
              </p>
              <div className={styles.siguientePasoBox}>
                <strong>Siguiente paso:</strong> Consulta el listado de entidades financieras y toda la información
                oficial en{' '}
                <a
                  href="https://www.ico.es"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkIco}
                  aria-label="Sitio web oficial del ICO (se abre en nueva ventana)"
                >
                  ico.es ↗
                </a>
              </div>
            </div>
          )}
          {resultado === 'parcial' && (
            <div className={`${styles.resultadoCard} ${styles['resultado-parcial']}`} role="alert" aria-live="polite">
              <div className={styles.resultadoIcon} aria-hidden="true">⚠️</div>
              <h3 className={styles.resultadoTitulo}>Cumples los requisitos básicos</h3>
              <p className={styles.resultadoTexto}>
                Cumples los requisitos obligatorios, pero algunos factores adicionales (precio de vivienda, historial crediticio)
                pueden condicionar la aprobación. Consulta directamente con una entidad financiera adherida y verifica los
                detalles en ico.es.
              </p>
              <div className={styles.siguientePasoBox}>
                <strong>Información oficial:</strong>{' '}
                <a
                  href="https://www.ico.es"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkIco}
                  aria-label="Sitio web oficial del ICO (se abre en nueva ventana)"
                >
                  ico.es ↗
                </a>
              </div>
            </div>
          )}
          {resultado === 'negativo' && (
            <div className={`${styles.resultadoCard} ${styles['resultado-negativo']}`} role="alert" aria-live="polite">
              <div className={styles.resultadoIcon} aria-hidden="true">❌</div>
              <h3 className={styles.resultadoTitulo}>No cumples algún requisito obligatorio</h3>
              <p className={styles.resultadoTexto}>
                Existe al menos un requisito imprescindible que no cumples en tu situación actual. El Aval ICO no estaría disponible.
                Puedes consultar otras líneas de ayudas o esperar a que cambie tu situación. Para más información, visita ico.es.
              </p>
            </div>
          )}
        </section>
      )}

      {!perfil && (
        <div className={styles.pendienteMsg}>Selecciona tu perfil para comenzar la comprobación de requisitos</div>
      )}

      {/* Proceso */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><span aria-hidden="true">📋</span> Proceso de solicitud del Aval ICO</h2>
        <div className={styles.procesoPasos}>
          {[
            { n: '1', titulo: 'Consulta la lista de entidades adheridas', desc: 'El Aval ICO se tramita a través de entidades financieras adheridas al convenio con el ICO. Consulta el listado actualizado en ico.es.' },
            { n: '2', titulo: 'Solicita la hipoteca en el banco', desc: 'Acude a la entidad elegida con tu documentación. El banco evalúa tu solvencia y decide si tramita el aval ante el ICO.' },
            { n: '3', titulo: 'El banco solicita el aval al ICO', desc: 'Si el banco aprueba tu perfil, solicita el aval ICO en tu nombre. Tú no tramitas el aval directamente: lo hace el banco.' },
            { n: '4', titulo: 'Firma de la hipoteca', desc: 'Una vez aprobado el aval, se firma la hipoteca con el aval del Estado. El préstamo lo pagas íntegro; el aval solo actúa si no puedes pagar.' },
          ].map(p => (
            <div key={p.n} className={styles.procesoStep}>
              <div className={styles.procesoNum} aria-hidden="true">{p.n}</div>
              <div className={styles.procesoInfo}>
                <h3>{p.titulo}</h3>
                <p>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Documentación */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><span aria-hidden="true">📄</span> Documentación habitual</h2>
        <div className={styles.docsGrid}>
          <div className={styles.docsGrupo}>
            <h4>Documentación personal</h4>
            <ul className={styles.docsList}>
              <li>DNI o NIE en vigor</li>
              <li>Certificado de empadronamiento</li>
              <li>Vida laboral actualizada</li>
              <li>Libro de familia (si tienes hijos)</li>
            </ul>
          </div>
          <div className={styles.docsGrupo}>
            <h4>Documentación económica</h4>
            <ul className={styles.docsList}>
              <li>Últimas 3 nóminas o acreditación de ingresos</li>
              <li>Declaración de IRPF últimos 2 años</li>
              <li>Extractos bancarios recientes</li>
              <li>Contratos de trabajo vigentes</li>
            </ul>
          </div>
          <div className={styles.docsGrupo}>
            <h4>Documentación de la vivienda</h4>
            <ul className={styles.docsList}>
              <li>Nota simple del Registro de la Propiedad</li>
              <li>Tasación del inmueble (la solicita el banco)</li>
              <li>Contrato de arras o señal (si ya existe)</li>
              <li>Referencia catastral</li>
            </ul>
          </div>
        </div>
      </section>

      <EducationalSection
        title="📚 Guía completa: Aval ICO Vivienda"
        subtitle="Todo lo que necesitas saber sobre el aval estatal para comprar casa"
      >
        {/* Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>Aval ICO vs. compra sin aval: comparativa</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>Aspecto</th>
                  <th>Sin aval ICO</th>
                  <th>Con aval ICO</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ahorros necesarios</td>
                  <td>20% del precio + gastos (30-35% en total)</td>
                  <td>Solo gastos de compra (~10-12%)</td>
                </tr>
                <tr>
                  <td>Tipo de interés hipotecario</td>
                  <td>Mercado estándar</td>
                  <td>Puede ser algo superior por mayor riesgo percibido</td>
                </tr>
                <tr>
                  <td>Importe máximo financiado</td>
                  <td>80% del valor tasado</td>
                  <td>Hasta 100% (con el aval cubriendo el 20-25%)</td>
                </tr>
                <tr>
                  <td>Vivienda máxima</td>
                  <td>Sin límite</td>
                  <td>Hasta 250.000 € (orientativo)</td>
                </tr>
                <tr>
                  <td>Requisito de edad</td>
                  <td>Ninguno</td>
                  <td>Menor de 35 años o con hijos menores</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Escenarios */}
        <section className={styles.guideSection}>
          <h2>Ejemplos prácticos del Aval ICO</h2>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🧑‍💻</span>
              <h3>Joven de 28 años, piso de 180.000 €</h3>
              <p>Sin aval necesitaría 36.000 € ahorrados (20%). Con el Aval ICO solo necesita los gastos de compra: ~18.000-22.000 €. Ahorro en ahorros previos: ~18.000 €.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">👨‍👩‍👦</span>
              <h3>Familia con 2 hijos, piso de 220.000 €</h3>
              <p>Acceden por el tramo de familias con menores aunque tengan más de 35 años. El aval del ICO les permite financiar los 220.000 € con solo los gastos de compra ahorrados.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">👩‍🎓</span>
              <h3>Graduada de 31 años, ingresos de 25.000 €</h3>
              <p>Cumple el límite de ingresos (4,5 × IPREM ≈ 37.800 €). Si el banco aprueba su solvencia, puede acceder al aval y comprar sin necesitar el 20% de entrada.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🚫</span>
              <h3>Persona de 40 años sin hijos</h3>
              <p>No cumple ninguno de los dos tramos del Aval ICO (ni joven ni familia con menores). Debe buscar financiación estándar o explorar ayudas autonómicas específicas de su CA.</p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre el Aval ICO</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>¿El Aval ICO es una subvención o una ayuda directa?</h3>
              <p>No. El Aval ICO no es dinero que recibes. Es una garantía del Estado que permite al banco prestarte más dinero (hasta el 100% del valor de la vivienda). Tú sigues pagando toda la hipoteca.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué pasa si no puedo pagar la hipoteca?</h3>
              <p>Si dejas de pagar, el banco puede ejecutar el aval ICO (el Estado paga al banco la parte avalada). Pero el Estado puede reclamarte esa deuda posteriormente. El aval no te protege de la ejecución hipotecaria.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Todos los bancos ofrecen el Aval ICO?</h3>
              <p>No. Solo las entidades financieras adheridas al convenio con el ICO pueden tramitarlo. Consulta el listado actualizado en ico.es, ya que cambia periódicamente.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿El aval tiene algún coste?</h3>
              <p>Actualmente el Aval ICO Vivienda es gratuito para el solicitante. No se cobra comisión por el aval. Sin embargo, el banco puede aplicar un tipo de interés algo superior al de una hipoteca estándar.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Puedo comprar una vivienda de obra nueva con el Aval ICO?</h3>
              <p>Sí, tanto obra nueva como segunda mano son elegibles, siempre que la vivienda sea tu primera vivienda habitual y no supere el precio máximo establecido.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Puedo acceder si soy autónomo?</h3>
              <p>Sí, los autónomos pueden acceder al Aval ICO si cumplen los requisitos de ingresos y resto de condiciones. Deberán justificar sus ingresos con declaraciones de IRPF, IVA y extractos bancarios.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿El aval dura toda la vida de la hipoteca?</h3>
              <p>No. El aval del ICO tiene un período máximo de vigencia (generalmente 10 años). Pasado ese tiempo, si has pagado bien la hipoteca, suele liberarse sin coste adicional.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Puedo combinar el Aval ICO con ayudas autonómicas?</h3>
              <p>En algunos casos sí. Algunas CCAA tienen programas complementarios de ayuda a la compra de primera vivienda compatibles con el Aval ICO. Consulta la normativa de tu CA.</p>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className={styles.guideSection}>
          <h2>6 consejos antes de solicitar el Aval ICO</h2>
          <div className={styles.tipsGrid}>
            {[
              { icon: '🏦', titulo: 'Compara varias entidades', desc: 'No todas las entidades adheridas ofrecen las mismas condiciones hipotecarias. Compara TAE, comisiones y condiciones antes de decidir.' },
              { icon: '📊', titulo: 'Simula la cuota mensual', desc: 'Asegúrate de que la cuota hipotecaria no supere el 30-35% de tus ingresos netos. Un endeudamiento excesivo puede generar problemas a largo plazo.' },
              { icon: '🔎', titulo: 'Consulta el estado de los fondos', desc: 'El aval tiene cupos limitados por entidad. Infórmate de la disponibilidad actual antes de gestionar la operación hipotecaria completa.' },
              { icon: '📋', titulo: 'Prepara la documentación con antelación', desc: 'La tasación, nota simple y vida laboral pueden tardar días en obtenerse. Solicítalos antes de las reuniones con el banco para agilizar el proceso.' },
              { icon: '⚖️', titulo: 'Considera los gastos de compra', desc: 'Aunque el aval cubre la entrada, los gastos de compraventa (notaría, registro, impuestos) pueden suponer el 10-12% del precio. Debes tenerlos ahorrados.' },
              { icon: '🤝', titulo: 'Consulta con un intermediario hipotecario', desc: 'Un bróker hipotecario puede ayudarte a encontrar la mejor entidad adherida y las mejores condiciones, sin coste en muchos casos.' },
            ].map(t => (
              <div key={t.icon} className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">{t.icon}</span>
                <h3>{t.titulo}</h3>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Warning */}
        <section className={styles.warningBox}>
          <h2><span aria-hidden="true">⚠️</span> Lo que debes saber antes de solicitar</h2>
          <div className={styles.warningGrid}>
            {[
              { titulo: 'El banco puede rechazarte aunque cumplas los requisitos del ICO', desc: 'El ICO establece los requisitos del programa, pero la entidad financiera evalúa tu solvencia de forma independiente. Pueden rechazar la operación por riesgo crediticio.' },
              { titulo: 'Los fondos son limitados', desc: 'El aval ICO tiene un cupo total asignado. Cuando se agota, no hay más avales hasta que se apruebe una nueva dotación. Es importante actuar con rapidez.' },
              { titulo: 'El aval no elimina el riesgo de ejecución hipotecaria', desc: 'Si no puedes pagar la hipoteca, el proceso de ejecución es el mismo que en cualquier hipoteca. El aval solo protege al banco, no al comprador.' },
              { titulo: 'Comprar con el 100% financiado implica más riesgo', desc: 'Si el valor de la vivienda baja, puedes deber más de lo que vale el inmueble (patrimonio negativo). Valora bien la estabilidad del mercado antes de comprar al máximo.' },
            ].map(w => (
              <div key={w.titulo} className={styles.warningItem}>
                <strong>{w.titulo}</strong>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-aval-ico')} />
      <ShareCard appName="orientador-aval-ico" />
      <Footer appName="orientador-aval-ico" />
    </div>
  );
}
