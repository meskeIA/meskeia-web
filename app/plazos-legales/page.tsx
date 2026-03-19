'use client';

import { useState, useMemo } from 'react';
import styles from './PlazosLegales.module.css';
import { MeskeiaLogo, Footer, RelatedApps, EducationalSection, ShareCard, DisclaimerCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  PLAZOS_LEGALES,
  CATEGORIES,
  searchPlazos,
  getImportantPlazos,
  type PlazoCategory,
  type PlazoLegal,
} from './plazos-data';

export default function PlazosLegalesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlazoCategory | null>(null);
  const [expandedPlazo, setExpandedPlazo] = useState<string | null>(null);

  const filteredPlazos = useMemo(() => {
    return searchPlazos(searchQuery, selectedCategory || undefined);
  }, [searchQuery, selectedCategory]);

  const importantPlazos = useMemo(() => getImportantPlazos(), []);

  const handleCategoryClick = (categoryId: PlazoCategory) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const toggleExpand = (plazoId: string) => {
    setExpandedPlazo(expandedPlazo === plazoId ? null : plazoId);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>⏱️</span>
        <h1 className={styles.title}>Plazos Legales España</h1>
        <p className={styles.subtitle}>
          Consulta los plazos de prescripción, caducidad y reclamación más importantes
        </p>
      </header>

      <DisclaimerCard variant="financial" severity="critical" />

      {/* Buscador */}
      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar plazo... (ej: garantía, despido, multa, herencia)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {(searchQuery || selectedCategory) && (
            <button className={styles.clearButton} onClick={clearFilters}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Categorías */}
      <div className={styles.categoriesSection}>
        <div className={styles.categoriesGrid}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.categoryButton} ${selectedCategory === cat.id ? styles.categoryActive : ''}`}
              onClick={() => handleCategoryClick(cat.id)}
            >
              <span className={styles.categoryIcon}>{cat.icon}</span>
              <span className={styles.categoryName}>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Plazos destacados (solo si no hay búsqueda ni filtro) */}
      {!searchQuery && !selectedCategory && (
        <section className={styles.importantSection}>
          <h2 className={styles.sectionTitle}>
            <span>⭐</span> Plazos más consultados
          </h2>
          <div className={styles.importantGrid}>
            {importantPlazos.map((plazo) => (
              <div key={plazo.id} className={styles.importantCard}>
                <div className={styles.importantPlazo}>{plazo.plazo}</div>
                <div className={styles.importantTitle}>{plazo.title}</div>
                <button
                  className={styles.importantLink}
                  onClick={() => {
                    setExpandedPlazo(plazo.id);
                    document.getElementById(plazo.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Ver detalles →
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Resultados */}
      <section className={styles.resultsSection}>
        <div className={styles.resultsHeader}>
          <h2 className={styles.sectionTitle}>
            {selectedCategory
              ? `📋 ${CATEGORIES.find(c => c.id === selectedCategory)?.name}`
              : searchQuery
                ? `🔍 Resultados para "${searchQuery}"`
                : '📚 Todos los plazos'}
          </h2>
          <span className={styles.resultsCount}>
            {filteredPlazos.length} {filteredPlazos.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>

        {filteredPlazos.length === 0 ? (
          <div className={styles.noResults}>
            <span className={styles.noResultsIcon}>🔍</span>
            <p>No se encontraron plazos con esos criterios</p>
            <button className={styles.clearFiltersButton} onClick={clearFilters}>
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className={styles.plazosList}>
            {filteredPlazos.map((plazo) => (
              <PlazoCard
                key={plazo.id}
                plazo={plazo}
                isExpanded={expandedPlazo === plazo.id}
                onToggle={() => toggleExpand(plazo.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Legal Importante</h3>
        <p>
          Esta información tiene carácter <strong>orientativo y educativo</strong>.
          Los plazos legales pueden verse afectados por circunstancias específicas, modificaciones
          legislativas o interpretaciones judiciales. <strong>No constituye asesoramiento jurídico</strong>.
        </p>
        <p>
          Para casos concretos, consulta siempre con un profesional del derecho o las fuentes
          oficiales (BOE, organismos competentes). Los plazos pueden variar según la comunidad
          autónoma o la situación particular.
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres entender mejor los plazos legales?"
        subtitle="Conceptos clave: prescripción, caducidad y cómputo de plazos"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>Diferencia entre prescripción y caducidad</h2>

          <div className={styles.conceptsGrid}>
            <div className={styles.conceptCard}>
              <h4>⏳ Prescripción</h4>
              <p>
                Es la pérdida de un derecho por no ejercerlo durante el tiempo establecido por ley.
                Se puede <strong>interrumpir</strong> (el plazo vuelve a empezar) mediante reclamación
                judicial, extrajudicial o reconocimiento de la deuda.
              </p>
              <p className={styles.conceptExample}>
                Ejemplo: Una deuda prescribe a los 5 años, pero si el acreedor te envía un burofax,
                el plazo se interrumpe y vuelven a contar 5 años desde ese momento.
              </p>
            </div>

            <div className={styles.conceptCard}>
              <h4>📅 Caducidad</h4>
              <p>
                Es un plazo fijo e improrrogable para ejercer un derecho o interponer una acción.
                <strong>No se puede interrumpir</strong>: una vez pasado el plazo, el derecho se extingue definitivamente.
              </p>
              <p className={styles.conceptExample}>
                Ejemplo: El plazo de 20 días hábiles para impugnar un despido es de caducidad.
                Si no demandas en ese plazo, pierdes el derecho a reclamar.
              </p>
            </div>
          </div>

          <h2>Cómo se cuentan los plazos</h2>

          <div className={styles.countingRules}>
            <div className={styles.ruleCard}>
              <h4>📆 Días naturales vs hábiles</h4>
              <ul>
                <li><strong>Naturales</strong>: todos los días del calendario (incluye festivos)</li>
                <li><strong>Hábiles</strong>: excluyen sábados, domingos y festivos</li>
                <li>En caso de duda, los plazos civiles suelen ser naturales y los procesales, hábiles</li>
              </ul>
            </div>

            <div className={styles.ruleCard}>
              <h4>🗓️ Reglas de cómputo</h4>
              <ul>
                <li>El día inicial (dies a quo) generalmente <strong>no se cuenta</strong></li>
                <li>Si el último día es inhábil, se prorroga al siguiente hábil</li>
                <li>El mes de agosto es hábil en la mayoría de procedimientos</li>
                <li>Los plazos por meses se cuentan de fecha a fecha</li>
              </ul>
            </div>
          </div>

          <h2>Preguntas frecuentes</h2>

          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary>¿Qué pasa si dejo prescribir una deuda?</summary>
              <p>
                Si la deuda prescribe, el acreedor pierde el derecho a reclamarla judicialmente.
                Sin embargo, debes <strong>alegar la prescripción</strong> si te demandan; el juez no la
                aplica de oficio. Además, la deuda puede seguir apareciendo en ficheros de morosos
                hasta que pases del plazo de conservación (5 años desde vencimiento).
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Cuándo empieza a contar un plazo?</summary>
              <p>
                Depende del tipo de plazo. Generalmente, desde el día siguiente al hecho que lo origina:
                notificación, entrega del producto, fin del contrato, fecha del fallecimiento, etc.
                En responsabilidad civil, desde que se conoce el daño (no necesariamente cuando se produce).
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Una reclamación por email interrumpe la prescripción?</summary>
              <p>
                La jurisprudencia es variable. Un email simple puede no ser suficiente.
                Para mayor seguridad, usa <strong>burofax con certificación de contenido</strong> o
                <strong>reclamación judicial</strong>. Un requerimiento notarial también interrumpe.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Los plazos se suspenden en vacaciones?</summary>
              <p>
                En procedimientos judiciales, el mes de <strong>agosto es inhábil</strong> para actuaciones
                procesales (salvo urgentes). En plazos administrativos, agosto sí cuenta.
                Los plazos de prescripción de acciones civiles no se suspenden por vacaciones.
              </p>
            </details>
          </div>
        </section>

        {/* === SECCIÓN 1: TABLA COMPARATIVA === */}
        <section className={styles.guideSection}>
          <h2>Tabla comparativa de plazos legales principales</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo de plazo</th>
                  <th>Duración</th>
                  <th>Naturaleza</th>
                  <th>Norma de referencia</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Garantía consumidor (bien mueble)</td>
                  <td>3 años</td>
                  <td>Caducidad</td>
                  <td>RDL 1/2007 (modificado 2022)</td>
                </tr>
                <tr>
                  <td>Reclamación laboral — despido</td>
                  <td>20 días hábiles</td>
                  <td>Caducidad</td>
                  <td>Art. 59 ET</td>
                </tr>
                <tr>
                  <td>Prescripción deuda civil (general)</td>
                  <td>5 años</td>
                  <td>Prescripción</td>
                  <td>Art. 1964 CC</td>
                </tr>
                <tr>
                  <td>Prescripción penal — delito leve</td>
                  <td>1 año</td>
                  <td>Prescripción</td>
                  <td>Art. 131 CP</td>
                </tr>
                <tr>
                  <td>Prescripción penal — delito grave (&gt;5 años pena)</td>
                  <td>10 años</td>
                  <td>Prescripción</td>
                  <td>Art. 131 CP</td>
                </tr>
                <tr>
                  <td>Reclamación administrativa (responsabilidad patrimonial)</td>
                  <td>1 año</td>
                  <td>Prescripción</td>
                  <td>Art. 67 Ley 39/2015</td>
                </tr>
                <tr>
                  <td>Prescripción fiscal (Hacienda)</td>
                  <td>4 años</td>
                  <td>Prescripción</td>
                  <td>Art. 66 LGT</td>
                </tr>
                <tr>
                  <td>Garantía inmueble — vicios estructurales (OCT)</td>
                  <td>10 años</td>
                  <td>Caducidad</td>
                  <td>Art. 17 LOE</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* === SECCIÓN 2: CASOS DE USO === */}
        <section className={styles.guideSection}>
          <h2>Casos de uso: plazos en situaciones reales</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🛒</span>
                <h4>Consumidor con producto defectuoso comprado online</h4>
              </div>
              <p className={styles.escenarioExample}>
                Tienes <strong>3 años de garantía legal</strong> desde la entrega del producto (RDL 1/2007 tras reforma 2022).
                Durante los primeros 2 años se presume que el defecto ya existía al comprar. Puedes exigir reparación,
                sustitución, rebaja del precio o devolución. El vendedor online está obligado aunque sea un marketplace.
              </p>
              <p className={styles.escenarioTip}>
                Pasos: 1) Documenta el defecto con fotos y vídeo. 2) Reclama por escrito al vendedor (email con acuse o
                formulario oficial). 3) Si no responde en 30 días, presenta reclamación ante OMIC o Consumo de tu CCAA.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👷</span>
                <h4>Trabajador despedido</h4>
              </div>
              <p className={styles.escenarioExample}>
                El plazo para impugnar un despido es de <strong>20 días hábiles de caducidad</strong> desde la fecha de
                efectos del despido. Es imprescindible acudir primero al SMAC (Servicio de Mediación, Arbitraje y
                Conciliación) antes de demandar — esto interrumpe el plazo mientras dura la conciliación.
              </p>
              <p className={styles.escenarioTip}>
                Los días hábiles excluyen sábados, domingos y festivos nacionales y autonómicos. La papeleta de
                conciliación ante el SMAC suspende el cómputo; el plazo se reanuda al día siguiente de la celebración
                (o intento fallido) del acto de conciliación.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📄</span>
                <h4>Autónomo con factura impagada de hace 2 años</h4>
              </div>
              <p className={styles.escenarioExample}>
                Las facturas por servicios profesionales prescriben a los <strong>3 años</strong> (art. 1967 CC para
                servicios, o 5 años si se considera obligación personal general). Con 2 años transcurridos, aún estás
                a tiempo, pero debes actuar cuanto antes.
              </p>
              <p className={styles.escenarioTip}>
                Interrumpe la prescripción enviando un <strong>burofax con certificación de contenido</strong> al
                deudor. Esto reinicia el plazo desde cero. Conserva el acuse y el certificado de texto enviado —
                son la prueba fehaciente si acabas demandando.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏠</span>
                <h4>Propietario que descubre vicio oculto en vivienda</h4>
              </div>
              <p className={styles.escenarioExample}>
                Si compraste la vivienda hace 3 años y descubres un vicio estructural, la garantía decenal (OCT)
                cubre <strong>10 años desde la recepción de la obra</strong> para daños que comprometan la
                estabilidad. La acción para reclamar tiene un plazo de <strong>2 años desde que descubres el daño</strong>.
              </p>
              <p className={styles.escenarioTip}>
                Documenta el vicio con informe técnico (arquitecto o aparejador). El responsable puede ser el
                promotor, constructor o proyectista según el tipo de daño. Acción ante el juzgado civil ordinario.
                Para vicios ocultos no estructurales, el plazo del CC es 6 meses desde el descubrimiento.
              </p>
            </div>
          </div>
        </section>

        {/* === SECCIÓN 3: FAQ PRO === */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes avanzadas</h2>
          <div className={styles.faqListPro}>
            <details className={styles.faqItemPro}>
              <summary>¿Qué plazos interrumpen la prescripción y cuáles no?</summary>
              <p>
                Solo los plazos de <strong>prescripción</strong> pueden interrumpirse. Los de <strong>caducidad</strong> no admiten interrupción bajo ningún concepto.
                La prescripción se interrumpe por: reclamación judicial (demanda), reclamación extrajudicial fehaciente (burofax),
                reconocimiento de la deuda por el deudor o cualquier acto de ejercicio del derecho ante organismos públicos.
                Cada interrupción reinicia el cómputo íntegro del plazo.
              </p>
            </details>

            <details className={styles.faqItemPro}>
              <summary>¿Cuánto tiempo tengo para reclamar al seguro tras un accidente?</summary>
              <p>
                En seguros de daños (auto, hogar), el plazo de prescripción es de <strong>2 años</strong> desde el siniestro (art. 23 LCS).
                En seguros de vida y accidentes personales, el plazo es de <strong>5 años</strong>. Estos plazos se interrumpen
                mediante reclamación escrita a la aseguradora. Si la compañía rechaza la reclamación, el plazo vuelve a contar
                desde la notificación de la resolución denegatoria.
              </p>
            </details>

            <details className={styles.faqItemPro}>
              <summary>¿Cuál es el plazo para reclamar una herencia impugnada?</summary>
              <p>
                La acción de petición de herencia (reclamar la condición de heredero) tiene un plazo de <strong>30 años</strong> por
                aplicación del art. 1963 CC (acción real sobre inmuebles). La impugnación de testamento por vicios formales
                prescribe a los <strong>5 años</strong> (art. 1964 CC). La acción de rescisión por lesión en la partición,
                a los <strong>4 años</strong> desde la partición. Cada acción tiene su propio plazo — consulta con abogado de herencias.
              </p>
            </details>

            <details className={styles.faqItemPro}>
              <summary>¿Los plazos siguen corriendo durante un proceso de mediación?</summary>
              <p>
                Desde la reforma de la Ley 5/2012 de mediación civil, el inicio de un procedimiento de mediación
                <strong> suspende</strong> los plazos de prescripción (no los de caducidad). La suspensión opera desde la
                solicitud de inicio de la mediación y se levanta cuando concluye el procedimiento (acuerdo, desacuerdo o
                abandono). En materia laboral, el SMAC suspende el plazo de caducidad del despido de manera específica.
              </p>
            </details>

            <details className={styles.faqItemPro}>
              <summary>¿Cuál es el plazo para recurrir una multa de tráfico?</summary>
              <p>
                Tras recibir la notificación de la sanción de tráfico, tienes <strong>20 días naturales</strong> para
                presentar alegaciones (fase voluntaria) o pagar con descuento del 50 %. Si no pagas ni alegas, la sanción
                deviene firme. Para recurso de reposición: <strong>1 mes</strong> desde que la sanción es firme. Para recurso
                contencioso-administrativo: <strong>2 meses</strong> desde la resolución del recurso de reposición (art. 46 LJCA).
              </p>
            </details>

            <details className={styles.faqItemPro}>
              <summary>¿Cuánto tiempo tiene Hacienda para revisarme la declaración de la renta?</summary>
              <p>
                La Agencia Tributaria tiene <strong>4 años</strong> para liquidar, sancionar o exigir el pago de deudas tributarias
                (art. 66 LGT). El plazo empieza a contarse desde el <strong>último día del periodo voluntario de presentación</strong>
                (normalmente el 30 de junio del año siguiente). La prescripción se interrumpe por cualquier actuación inspectora
                o por la presentación de una autoliquidación complementaria.
              </p>
            </details>

            <details className={styles.faqItemPro}>
              <summary>¿El plazo de garantía de Amazon/tiendas online es diferente al legal?</summary>
              <p>
                No: la garantía <strong>mínima legal es 3 años</strong> para productos nuevos (RDL 1/2007 tras reforma RDL 7/2021),
                independientemente de la política comercial de la tienda. Amazon u otras plataformas pueden ofrecer garantías
                comerciales adicionales (más largas), pero nunca pueden reducir la garantía legal. Si la tienda ofrece solo
                2 años, tu derecho legal a 3 años prevalece igualmente.
              </p>
            </details>

            <details className={styles.faqItemPro}>
              <summary>¿Cuándo prescribe una deuda hipotecaria?</summary>
              <p>
                La acción real hipotecaria (ejecutar la hipoteca sobre el inmueble) prescribe a los <strong>20 años</strong>
                desde que pudo ejercitarse (art. 1964 CC antes de 2015, y art. 128 LH). La acción personal para reclamar el
                saldo restante tras ejecución prescribe a los <strong>5 años</strong>. El TS ha matizado estos plazos en casos
                de cláusulas abusivas (hipotecas multidivisa, IRPH), donde los plazos para reclamar la nulidad pueden ser distintos.
              </p>
            </details>
          </div>
        </section>

        {/* === SECCIÓN 4: GUÍA PASO A PASO === */}
        <section className={styles.guideSection}>
          <h2>Cómo gestionar un plazo legal: guía en 6 pasos</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Identifica el tipo de plazo y la norma que lo regula</h4>
                <p>
                  Determina si es un plazo de <strong>prescripción</strong> (interrumpible) o <strong>caducidad</strong>
                  (improrrogable). Busca la norma concreta: Código Civil, Estatuto de los Trabajadores, LGT, Ley de
                  Consumidores... Cada ámbito tiene su propia regulación. En caso de duda, consulta con un abogado antes
                  de asumir el plazo aplicable.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Calcula la fecha exacta de inicio (dies a quo)</h4>
                <p>
                  El plazo comienza generalmente el <strong>día siguiente</strong> al hecho que lo origina: entrega del
                  producto, notificación del despido, fecha de la factura, fecha del siniestro o fecha en que conociste
                  el daño. En responsabilidad civil extracontractual, el inicio puede ser la fecha de conocimiento
                  del perjuicio, no necesariamente cuando se produjo.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Verifica si el plazo es en días naturales o hábiles</h4>
                <p>
                  Los plazos <strong>procesales</strong> (demandas, recursos judiciales) suelen ser en días hábiles,
                  excluyendo sábados, domingos y festivos. Los plazos <strong>civiles y administrativos</strong> suelen
                  ser en días naturales o en meses/años (de fecha a fecha). Confirma siempre en la norma de referencia:
                  esta distinción puede suponer ganar o perder un día crítico.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Si es prescripción, documenta cualquier acto interruptivo</h4>
                <p>
                  Envía un <strong>burofax con certificación de contenido</strong> al responsable o deudor para interrumpir
                  la prescripción. Guarda el resguardo y el certificado del texto enviado. Una reclamación judicial
                  (demanda o diligencias previas) también interrumpe el plazo desde la fecha de presentación en el juzgado.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Actúa con margen: no esperes al último día</h4>
                <p>
                  Un error en el cómputo (confundir días naturales con hábiles, olvidar un festivo autonómico o calcular
                  mal el dies a quo) puede costar la acción. Actúa con al menos <strong>5-10 días de margen</strong> antes
                  del vencimiento. Si tienes dudas sobre la fecha exacta, sé conservador y actúa antes.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Guarda prueba de la reclamación</h4>
                <p>
                  Conserva <strong>todos los justificantes</strong>: acuse de recibo del burofax, sello de entrada del
                  juzgado o administración, confirmación del registro electrónico, certificado del acto de conciliación
                  (SMAC). Sin prueba, no podrás demostrar que actuaste dentro del plazo si el asunto acaba en litigio.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* === SECCIÓN 5: MEJORES PRÁCTICAS === */}
        <section className={styles.guideSection}>
          <h2>Mejores prácticas para no perder tus derechos</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📮</span>
              <p>
                Usa <strong>burofax con certificación de contenido</strong> para interrumpir prescripciones civiles o
                mercantiles. El email simple puede no ser admitido como prueba fehaciente si el deudor niega haberlo recibido.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🤝</span>
              <p>
                En plazos laborales por despido, acude al <strong>SMAC (Servicio de Mediación)</strong> antes de demandar.
                Es gratuito, obligatorio y suspende el plazo de caducidad mientras dura la conciliación.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📰</span>
              <p>
                Revisa periódicamente el <strong>BOE</strong> si tienes procesos abiertos: las suspensiones de plazos
                por estado de alarma u otras circunstancias excepcionales se publican allí y pueden ampliar tus opciones.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧾</span>
              <p>
                En garantías de consumo, conserva siempre el <strong>tique o factura de compra</strong> — es la prueba
                de la fecha de adquisición. Sin ella, el vendedor puede negar la garantía o reducir el plazo aplicable.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <p>
                Para plazos fiscales, recuerda que los 4 años de Hacienda se computan desde el <strong>último día del
                periodo voluntario de presentación</strong>, no desde la fecha de devengo del impuesto.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚖️</span>
              <p>
                Consulta la <strong>jurisprudencia reciente</strong> antes de dar un plazo por expirado: el TS ha ampliado
                plazos en supuestos de hipotecas con cláusulas abusivas, préstamos usurarios y otras materias de consumo.
              </p>
            </div>
          </div>
        </section>

        {/* === SECCIÓN 6: WARNING BOX — ERRORES COMUNES === */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores frecuentes que cuestan derechos</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confundir prescripción con caducidad:</strong> esperar a que el deudor "reconozca" la deuda para
                interrumpir no funciona en plazos de caducidad — estos se extinguen sin posibilidad de interrupción.
              </li>
              <li>
                <strong>Contar el plazo desde el día del hecho</strong> (en lugar del día siguiente) puede costar
                un día hábil crítico — el dies a quo generalmente no computa en el plazo.
              </li>
              <li>
                <strong>Olvidar que el SMAC interrumpe el plazo del despido pero no lo suspende indefinidamente:</strong>
                si no hay acuerdo, el cómputo de los 20 días hábiles se reanuda al día siguiente de la conciliación fallida.
              </li>
              <li>
                <strong>Creer que un WhatsApp o email interrumpe la prescripción:</strong> sin prueba fehaciente de
                recepción, el juzgado puede no admitirlo. Usa burofax o reclamación por registro oficial.
              </li>
              <li>
                <strong>Ignorar el plazo de 4 años de Hacienda:</strong> que no hayas tenido noticias de la AEAT en 4
                años no significa que el plazo haya prescrito — cuenta desde la fecha de presentación de la declaración,
                no desde el devengo.
              </li>
              <li>
                <strong>No reclamar en garantía por miedo a complicaciones:</strong> el vendedor está obligado legalmente
                y la reclamación escrita interrumpe el plazo de garantía mientras se tramita la reparación o sustitución.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('plazos-legales')} />
      <ShareCard appName="plazos-legales" />
      <Footer appName="plazos-legales" />
    </div>
  );
}

// Componente para cada plazo
function PlazoCard({
  plazo,
  isExpanded,
  onToggle,
}: {
  plazo: PlazoLegal;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const category = CATEGORIES.find(c => c.id === plazo.category);

  return (
    <div id={plazo.id} className={`${styles.plazoCard} ${isExpanded ? styles.plazoExpanded : ''}`}>
      <button className={styles.plazoHeader} onClick={onToggle}>
        <div className={styles.plazoMain}>
          <span className={styles.plazoCategoryIcon}>{category?.icon}</span>
          <div className={styles.plazoInfo}>
            <h3 className={styles.plazoTitle}>
              {plazo.title}
              {plazo.important && <span className={styles.importantBadge}>Importante</span>}
            </h3>
            <p className={styles.plazoDescription}>{plazo.description}</p>
          </div>
        </div>
        <div className={styles.plazoPlazoContainer}>
          <span className={styles.plazoPlazo}>{plazo.plazo}</span>
          <span className={styles.plazoExpandIcon}>{isExpanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {isExpanded && (
        <div className={styles.plazoDetails}>
          <div className={styles.detailsContent}>
            <p className={styles.detailsText}>{plazo.details}</p>
            <div className={styles.detailsMeta}>
              <span className={styles.detailsCategory}>
                {category?.icon} {category?.name}
              </span>
              <span className={styles.detailsLaw}>
                📜 {plazo.legalReference}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
