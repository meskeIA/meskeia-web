'use client';

import { useState } from 'react';
import styles from './AsistenteReclamaciones.module.css';
import { MeskeiaLogo, Footer, RelatedApps, EducationalSection, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  PROBLEM_OPTIONS,
  CHANNEL_OPTIONS,
  TIME_OPTIONS,
  LEGAL_DEADLINES,
  getReclamationResult,
  type ProblemType,
  type PurchaseChannel,
  type TimeElapsed,
  type ReclamationResult,
} from './reclamaciones-data';

type Step = 'problem' | 'channel' | 'time' | 'result';

export default function AsistenteReclamacionesPage() {
  const [currentStep, setCurrentStep] = useState<Step>('problem');
  const [selectedProblem, setSelectedProblem] = useState<ProblemType | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<PurchaseChannel | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeElapsed | null>(null);
  const [result, setResult] = useState<ReclamationResult | null>(null);
  const [showLetter, setShowLetter] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleProblemSelect = (problem: ProblemType) => {
    setSelectedProblem(problem);
    setCurrentStep('channel');
  };

  const handleChannelSelect = (channel: PurchaseChannel) => {
    setSelectedChannel(channel);
    setCurrentStep('time');
  };

  const handleTimeSelect = (time: TimeElapsed) => {
    setSelectedTime(time);
    if (selectedProblem && selectedChannel) {
      const reclamationResult = getReclamationResult(selectedProblem, selectedChannel, time);
      setResult(reclamationResult);
      setCurrentStep('result');
    }
  };

  const handleBack = () => {
    if (currentStep === 'channel') {
      setCurrentStep('problem');
      setSelectedProblem(null);
    } else if (currentStep === 'time') {
      setCurrentStep('channel');
      setSelectedChannel(null);
    } else if (currentStep === 'result') {
      setCurrentStep('time');
      setSelectedTime(null);
      setResult(null);
      setShowLetter(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('problem');
    setSelectedProblem(null);
    setSelectedChannel(null);
    setSelectedTime(null);
    setResult(null);
    setShowLetter(false);
    setCopied(false);
  };

  const copyLetter = async () => {
    if (result?.letterTemplate) {
      await navigator.clipboard.writeText(result.letterTemplate);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case 'problem': return 1;
      case 'channel': return 2;
      case 'time': return 3;
      case 'result': return 4;
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>⚖️</span>
        <h1 className={styles.title}>Asistente de Reclamaciones</h1>
        <p className={styles.subtitle}>
          Te ayudamos a conocer tus derechos como consumidor y cómo reclamar
        </p>
      </header>

      <LegalNotice />

      {/* Progress indicator */}
      <div className={styles.progress}>
        <div className={styles.progressSteps}>
          {['Problema', 'Dónde', 'Cuándo', 'Resultado'].map((label, index) => (
            <div
              key={label}
              className={`${styles.progressStep} ${index + 1 <= getStepNumber() ? styles.progressStepActive : ''}`}
            >
              <div className={styles.progressDot}>{index + 1}</div>
              <span className={styles.progressLabel}>{label}</span>
            </div>
          ))}
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${((getStepNumber() - 1) / 3) * 100}%` }}
          />
        </div>
      </div>

      <main className={styles.mainContent}>
        {/* Step 1: Problem type */}
        {currentStep === 'problem' && (
          <div className={styles.stepCard}>
            <h2 className={styles.stepTitle}>
              <span className={styles.stepIcon}>1️⃣</span>
              ¿Qué tipo de problema tienes?
            </h2>
            <div className={styles.optionsGrid}>
              {PROBLEM_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  className={styles.optionCard}
                  onClick={() => handleProblemSelect(option.id)}
                >
                  <span className={styles.optionIcon}>{option.icon}</span>
                  <span className={styles.optionLabel}>{option.label}</span>
                  <span className={styles.optionDescription}>{option.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Purchase channel */}
        {currentStep === 'channel' && (
          <div className={styles.stepCard}>
            <button className={styles.backButton} onClick={handleBack}>
              ← Volver
            </button>
            <h2 className={styles.stepTitle}>
              <span className={styles.stepIcon}>2️⃣</span>
              ¿Dónde compraste o contrataste?
            </h2>
            <div className={styles.optionsGridSmall}>
              {CHANNEL_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  className={styles.optionCardSmall}
                  onClick={() => handleChannelSelect(option.id)}
                >
                  <span className={styles.optionIcon}>{option.icon}</span>
                  <span className={styles.optionLabel}>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Time elapsed */}
        {currentStep === 'time' && (
          <div className={styles.stepCard}>
            <button className={styles.backButton} onClick={handleBack}>
              ← Volver
            </button>
            <h2 className={styles.stepTitle}>
              <span className={styles.stepIcon}>3️⃣</span>
              ¿Cuánto tiempo ha pasado desde la compra?
            </h2>
            <div className={styles.optionsGridSmall}>
              {TIME_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  className={styles.optionCardSmall}
                  onClick={() => handleTimeSelect(option.id)}
                >
                  <span className={styles.optionIcon}>{option.icon}</span>
                  <span className={styles.optionLabel}>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {currentStep === 'result' && result && (
          <div className={styles.resultContainer}>
            <div className={styles.resultHeader}>
              <button className={styles.backButton} onClick={handleBack}>
                ← Volver
              </button>
              <button className={styles.resetButton} onClick={handleReset}>
                🔄 Nueva consulta
              </button>
            </div>

            <div className={styles.resultCard}>
              <h2 className={styles.resultTitle}>
                <span className={styles.resultIcon}>✅</span>
                {result.title}
              </h2>

              {/* Tus derechos */}
              <section className={styles.resultSection}>
                <h3 className={styles.sectionTitle}>
                  <span>⚖️</span> Tus derechos
                </h3>
                <ul className={styles.rightsList}>
                  {result.rights.map((right, index) => (
                    <li key={index}>{right}</li>
                  ))}
                </ul>
                {result.deadline && (
                  <div className={styles.deadlineBox}>
                    <span className={styles.deadlineIcon}>⏰</span>
                    <span>{result.deadline}</span>
                  </div>
                )}
                {result.legalReference && (
                  <p className={styles.legalRef}>
                    📜 Referencia legal: {result.legalReference}
                  </p>
                )}
              </section>

              {/* Pasos a seguir */}
              <section className={styles.resultSection}>
                <h3 className={styles.sectionTitle}>
                  <span>📋</span> Pasos a seguir
                </h3>
                <ol className={styles.stepsList}>
                  {result.steps.map((step, index) => (
                    <li key={index}>{step.replace(/^\d+\.\s*/, '')}</li>
                  ))}
                </ol>
              </section>

              {/* Organismos */}
              <section className={styles.resultSection}>
                <h3 className={styles.sectionTitle}>
                  <span>🏛️</span> Dónde reclamar
                </h3>
                <div className={styles.organismsGrid}>
                  {result.organisms.map((org, index) => (
                    <a
                      key={index}
                      href={org.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.organismCard}
                    >
                      <span className={styles.organismType}>
                        {org.type === 'nacional' && '🇪🇸'}
                        {org.type === 'autonomico' && '🏠'}
                        {org.type === 'europeo' && '🇪🇺'}
                      </span>
                      <span className={styles.organismName}>{org.name}</span>
                      <span className={styles.organismDesc}>{org.description}</span>
                      <span className={styles.organismLink}>Visitar web →</span>
                    </a>
                  ))}
                </div>
              </section>

              {/* Modelo de carta */}
              <section className={styles.resultSection}>
                <h3 className={styles.sectionTitle}>
                  <span>✉️</span> Modelo de carta de reclamación
                </h3>
                <button
                  className={styles.letterToggle}
                  onClick={() => setShowLetter(!showLetter)}
                >
                  {showLetter ? '📖 Ocultar modelo' : '📄 Ver modelo de carta'}
                </button>
                {showLetter && (
                  <div className={styles.letterContainer}>
                    <div className={styles.letterActions}>
                      <button className={styles.copyButton} onClick={copyLetter}>
                        {copied ? '✅ Copiado' : '📋 Copiar carta'}
                      </button>
                    </div>
                    <pre className={styles.letterTemplate}>
                      {result.letterTemplate}
                    </pre>
                    <p className={styles.letterNote}>
                      💡 Personaliza los campos entre [corchetes] con tus datos
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Plazos legales importantes */}
      <section className={styles.deadlinesSection}>
        <h2 className={styles.deadlinesSectionTitle}>
          <span>⏱️</span> Plazos legales importantes
        </h2>
        <div className={styles.deadlinesGrid}>
          {Object.entries(LEGAL_DEADLINES).map(([key, deadline]) => (
            <div key={key} className={styles.deadlineCard}>
              <div className={styles.deadlineValue}>
                {'days' in deadline ? `${deadline.days} días` : `${deadline.years} años`}
              </div>
              <div className={styles.deadlineDesc}>{deadline.description}</div>
              <div className={styles.deadlineLaw}>{deadline.law}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Esta herramienta proporciona información orientativa basada en la legislación española de consumo.
          No constituye asesoramiento jurídico profesional. Para casos complejos o de alto valor,
          te recomendamos consultar con un abogado o acudir a tu OMIC local.
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres aprender más sobre tus derechos?"
        subtitle="Conceptos clave, legislación y preguntas frecuentes"
        icon="📚"
      >
        {/* Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>Comparativa de vías de reclamación</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Vía</th>
                  <th>Coste</th>
                  <th>Plazo resolución</th>
                  <th>Vinculante</th>
                  <th>Cuándo usar</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Servicio atención al cliente</td>
                  <td>Gratuito</td>
                  <td>30 días</td>
                  <td>No siempre</td>
                  <td>Primer paso obligatorio</td>
                </tr>
                <tr>
                  <td>OMIC (Oficina Municipal)</td>
                  <td>Gratuito</td>
                  <td>1-3 meses</td>
                  <td>No</td>
                  <td>Mediación local, comercio minorista</td>
                </tr>
                <tr>
                  <td>Consumo autonómico</td>
                  <td>Gratuito</td>
                  <td>2-4 meses</td>
                  <td>Depende</td>
                  <td>Si OMIC no resuelve</td>
                </tr>
                <tr>
                  <td>Arbitraje de consumo</td>
                  <td>Gratuito</td>
                  <td>90 días</td>
                  <td>Sí (ambas partes)</td>
                  <td>Empresa adherida al sistema</td>
                </tr>
                <tr>
                  <td>Plataforma ODR (online)</td>
                  <td>Gratuito</td>
                  <td>90 días</td>
                  <td>Depende</td>
                  <td>Compras en UE online</td>
                </tr>
                <tr>
                  <td>Vía judicial (juicio verbal)</td>
                  <td>Bajo coste (&lt;2.000 €)</td>
                  <td>6-18 meses</td>
                  <td>Sí</td>
                  <td>Último recurso, daños significativos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de uso */}
        <section className={styles.guideSection}>
          <h2>Casos reales de reclamación</h2>
          <div className={styles.casosGrid}>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>📦</span>
                <span className={styles.casoTag}>Producto defectuoso en garantía</span>
              </div>
              <p>Un televisor comprado hace 2 años deja de funcionar sin causa aparente. El vendedor quiere
              cobrar la reparación. La garantía legal de 3 años (desde 2022) obliga al vendedor a reparar,
              sustituir o devolver el dinero de forma gratuita.</p>
              <div className={styles.casoResultado}>Derecho: reparación/sustitución gratuita. Reclamar al vendedor, no al fabricante</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>🛒</span>
                <span className={styles.casoTag}>Devolución compra online</span>
              </div>
              <p>Ropa comprada por internet no corresponde a las fotos. Se quiere devolver a los 10 días.
              El derecho de desistimiento (14 días naturales) permite devolver sin dar explicaciones.
              La tienda debe reembolsar incluso los gastos de envío originales.</p>
              <div className={styles.casoResultado}>14 días de desistimiento desde la recepción, sin justificación</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>✈️</span>
                <span className={styles.casoTag}>Vuelo cancelado</span>
              </div>
              <p>Una aerolínea cancela un vuelo con menos de 14 días de antelación. El Reglamento UE 261/2004
              establece compensaciones de 250 a 600 € según la distancia, además del reembolso del billete
              o vuelo alternativo. Reclamar directamente a la aerolínea o a AESA.</p>
              <div className={styles.casoResultado}>Compensación automática: 250-600 € + reembolso según caso</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>📱</span>
                <span className={styles.casoTag}>Cobro indebido en factura</span>
              </div>
              <p>Una operadora cobra un servicio que nunca se contrató. Llamar al servicio al cliente exigiendo
              la devolución y documentando la conversación. Si no responden en 30 días, acudir a la Secretaría
              de Estado de Telecomunicaciones (SETSI) o la OMIC.</p>
              <div className={styles.casoResultado}>Plazo de respuesta: 30 días. Siguiente paso: SETSI o OMIC</div>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Conceptos clave de consumo</h2>

          <div className={styles.conceptsGrid}>
            <div className={styles.conceptCard}>
              <h4>🛡️ Garantía legal</h4>
              <p>
                Desde enero de 2022, todos los productos nuevos tienen <strong>3 años de garantía</strong>.
                Los productos de segunda mano tienen mínimo 1 año. Durante los primeros 2 años,
                se presume que el defecto ya existía en el momento de la entrega.
              </p>
            </div>

            <div className={styles.conceptCard}>
              <h4>↩️ Derecho de desistimiento</h4>
              <p>
                En compras online, por teléfono o fuera de establecimiento, tienes <strong>14 días naturales</strong>
                para devolver el producto <strong>sin dar explicaciones</strong>. El plazo empieza desde que
                recibes el producto (o desde la contratación en servicios).
              </p>
            </div>

            <div className={styles.conceptCard}>
              <h4>📝 Hoja de reclamaciones</h4>
              <p>
                Todo establecimiento físico está obligado a tener <strong>hojas de reclamaciones oficiales</strong>
                y dártelas si las pides. Negarlas es sancionable. Una copia va a la administración,
                otra al consumidor y otra queda en el establecimiento.
              </p>
            </div>

            <div className={styles.conceptCard}>
              <h4>⚖️ Arbitraje de consumo</h4>
              <p>
                Sistema <strong>gratuito y voluntario</strong> para resolver conflictos. Si la empresa está
                adherida al Sistema Arbitral de Consumo, la resolución es vinculante para ambas partes.
                Es más rápido que la vía judicial.
              </p>
            </div>
          </div>

          <h2>Legislación aplicable</h2>
          <ul className={styles.lawsList}>
            <li>
              <strong>TRLGDCU</strong> - Real Decreto Legislativo 1/2007: Texto refundido de la Ley General
              para la Defensa de los Consumidores y Usuarios. Es la norma principal.
            </li>
            <li>
              <strong>Directiva 2019/771/UE</strong> - Garantía de bienes: Armoniza las garantías en toda la UE.
              España la transpuso aumentando la garantía a 3 años.
            </li>
            <li>
              <strong>Ley 7/2017</strong> - Resolución alternativa de litigios de consumo: Regula mediación
              y arbitraje de consumo.
            </li>
          </ul>

          <h2>Preguntas frecuentes</h2>

          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary>¿Puedo devolver un producto comprado en tienda física?</summary>
              <p>
                No existe un derecho legal de devolución en tiendas físicas si el producto no está defectuoso.
                La devolución depende de la política comercial de cada establecimiento. Sin embargo, si el
                producto tiene un defecto, sí puedes reclamar la garantía independientemente del canal de compra.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Qué hago si la empresa no me responde?</summary>
              <p>
                La empresa tiene 30 días para responder a tu reclamación. Si no lo hace, puedes:
                1) Acudir a la OMIC de tu localidad para mediar, 2) Presentar reclamación ante la Dirección
                de Consumo de tu comunidad autónoma, 3) Solicitar arbitraje si la empresa está adherida.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Qué diferencia hay entre garantía legal y comercial?</summary>
              <p>
                La <strong>garantía legal</strong> (3 años) es obligatoria y cubre defectos de conformidad.
                La <strong>garantía comercial</strong> es voluntaria, la ofrece el fabricante o vendedor,
                y puede tener condiciones diferentes. La garantía comercial nunca puede limitar la legal.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Puedo reclamar si compré en una web extranjera?</summary>
              <p>
                Si la web es de la UE, puedes usar la <strong>Plataforma ODR</strong> (resolución online de litigios)
                y aplican normas similares. Si es de fuera de la UE (China, USA...), es más complicado:
                puedes intentar reclamar pero la ejecución de cualquier resolución será difícil.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Quién paga los gastos de devolución?</summary>
              <p>
                En desistimiento (14 días online): el consumidor paga la devolución SOLO si le informaron
                previamente. Si no le informaron, paga el vendedor. En garantía: el vendedor asume todos
                los gastos de devolución, reparación o sustitución.
              </p>
            </details>
          </div>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo reclamar como consumidor: paso a paso</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Documenta el problema desde el principio</strong>
                <p>Guarda tickets, facturas, correos, capturas de pantalla y cualquier prueba del problema.
                Sin documentación, es mucho más difícil demostrar tu reclamación. Empieza a recopilar evidencias
                desde el primer momento.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Contacta al servicio de atención al cliente</strong>
                <p>Es el primer paso obligatorio. Comunica el problema por escrito (correo electrónico o formulario)
                para tener constancia. Guarda el número de referencia o ticket que te asignen. Tienen 30 días para responder.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Pide la hoja de reclamaciones si es presencial</strong>
                <p>Si se trata de un establecimiento físico y no resuelven el problema, solicita la hoja de
                reclamaciones oficial. Están obligados a dártela. Una copia va a la administración de consumo
                de tu comunidad autónoma.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Acude a la OMIC si no hay respuesta</strong>
                <p>Si la empresa no responde o rechaza tu reclamación en 30 días, acude a la Oficina Municipal
                de Información al Consumidor (OMIC) de tu ayuntamiento. Es gratuita y puede mediar entre
                tú y la empresa.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Solicita arbitraje de consumo si la empresa está adherida</strong>
                <p>El arbitraje es gratuito, rápido (90 días) y vinculante. Comprueba si la empresa está en el
                registro de empresas adheridas al Sistema Arbitral de Consumo. Si lo está, es la vía más eficaz
                sin necesidad de abogado.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Vía judicial como último recurso</strong>
                <p>Para reclamaciones de hasta 2.000 €, el juicio verbal no requiere abogado ni procurador.
                Para importes mayores, valora si el coste del proceso (abogado, procurador, tiempo) compensa
                el importe a recuperar. En muchos casos, la amenaza de demanda ya resuelve el conflicto.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Mejores prácticas */}
        <section className={styles.guideSection}>
          <h2>Consejos para reclamar con éxito</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✍️</span>
              <strong>Siempre por escrito</strong>
              <p>Reclama siempre por correo electrónico o formulario web, nunca solo por teléfono.
              Necesitas prueba de que reclamaste y en qué fecha.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <strong>Controla los plazos legales</strong>
              <p>Garantía: 3 años desde la entrega. Desistimiento online: 14 días. Vuelo cancelado: 5 años
              para reclamar. No esperes demasiado.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📁</span>
              <strong>Guarda toda la documentación</strong>
              <p>Ticket, factura, correos, fotos del defecto, capturas de conversaciones de chat.
              Cuanta más evidencia, más fuerte es tu posición.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <strong>Sé concreto en tu reclamación</strong>
              <p>Indica claramente: qué pasó, cuándo, qué producto/servicio, qué solución pides
              (reparación, sustitución, devolución) y en qué plazo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚖️</span>
              <strong>Conoce la legislación básica</strong>
              <p>TRLGDCU (garantías y devoluciones), Ley 50/1980 (seguros), Reglamento EU 261 (vuelos).
              Citar la normativa en tu reclamación aumenta la efectividad.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🌐</span>
              <strong>Usa la plataforma ODR para compras UE</strong>
              <p>Para conflictos con empresas de otros países de la UE, la Plataforma Online de Resolución
              de Disputas (ec.europa.eu/odr) es la vía más efectiva y gratuita.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores que debilitan o invalidan tu reclamación</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Reclamar solo por teléfono:</strong> Una conversación telefónica no deja constancia legal. Si la empresa lo niega, no tienes prueba de que reclamaste. Siempre usa canales escritos y guarda los comprobantes.</li>
            <li><strong>No guardar el ticket o factura:</strong> Sin justificante de compra, es prácticamente imposible reclamar la garantía. Guarda los tickets en formato digital (foto) para que no se borren con el tiempo.</li>
            <li><strong>Dejar pasar el plazo de desistimiento:</strong> El derecho de desistimiento en compras online caduca a los 14 días naturales desde la recepción. Pasado ese plazo, ya no puedes devolver sin causa de defecto.</li>
            <li><strong>Confundir garantía legal con garantía comercial:</strong> La garantía legal (3 años) es un derecho irrenunciable frente al vendedor. La garantía del fabricante es adicional, no la sustituye. Reclama siempre al vendedor primero.</li>
            <li><strong>Aceptar una solución peor de la que te corresponde:</strong> En garantía, tienes derecho a elegir entre reparación, sustitución o devolución del precio. La empresa no puede imponerte la opción que le resulte más barata.</li>
            <li><strong>No usar el número de referencia de la reclamación:</strong> Cuando la empresa te asigna un número de ticket o referencia, úsalo en todos los seguimientos. Sin él, cada contacto puede empezar de cero.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('asistente-reclamaciones')} />
      <ShareCard appName="asistente-reclamaciones" />
      <Footer appName="asistente-reclamaciones" />
    </div>
  );
}
