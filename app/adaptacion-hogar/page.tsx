'use client';

import { useMemo, useState } from 'react';
import styles from './AdaptacionHogar.module.css';
import { MeskeiaLogo, LegalNotice, Footer, EducationalSection, RelatedApps, ShareCard, DisclaimerCard, DataReference } from '@/components';
import { formatCurrency } from '@/lib';
import { cuantiaMaximaPEVS, FISCAL_DEPENDENCIA_META } from '@/data/fiscal';
import { CATEGORIAS, TODOS_LOS_ITEMS, rangoDe } from './catalogo';

/** Tope estatal de la prestación vinculada al servicio en grado III (anexo IV del RD 1051/2013). */
const PEVS_GRADO_III = cuantiaMaximaPEVS(3);

// ─── Datos ────────────────────────────────────────────────────────────────────
// El catálogo vive en catalogo.ts: de él salen también las cifras de las dos FAQ.

const LABELS_PRIORIDAD: Record<string, string> = {
  alta: 'Prioritario',
  media: 'Recomendado',
  baja: 'Opcional',
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AdaptacionHogar() {
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  function toggleItem(id: string) {
    setSeleccionados(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const resumen = useMemo(() => {
    const items = TODOS_LOS_ITEMS.filter(i => seleccionados.has(i.id));
    return {
      total: items.length,
      totalMin: items.reduce((s, i) => s + i.costeMin, 0),
      totalMax: items.reduce((s, i) => s + i.costeMax, 0),
      conAyuda: items.filter(i => i.ayuda).length,
      prioridadAlta: items.filter(i => i.prioridad === 'alta').length,
      items,
    };
  }, [seleccionados]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🏠</span>
        <h1 className={styles.title}>Adaptación del Hogar</h1>
        <p className={styles.subtitle}>Checklist de accesibilidad para mayores y personas con discapacidad · Costes orientativos y ayudas públicas</p>
      </header>

      <LegalNotice />
      <DisclaimerCard variant="general"
        severity="critical">
        <span>
          Los costes son <strong>estimaciones orientativas</strong> nacionales (2025). Los precios reales varían por zona geográfica, calidades y mano de obra.
          <br />Las ayudas públicas dependen de la comunidad autónoma, municipio y situación personal. Consulta en tu ayuntamiento o servicios sociales.
          <br /><em>meskeIA no se responsabiliza de decisiones basadas en estas estimaciones.</em>
        </span>
      </DisclaimerCard>
      <DataReference
        normativa="Prestaciones de dependencia (Ley 39/2006 y RD 1051/2013)"
        fuente={FISCAL_DEPENDENCIA_META.fuente}
        verificado={FISCAL_DEPENDENCIA_META.verificado}
        urlOficial={FISCAL_DEPENDENCIA_META.urlOficial}
      />

      <div className={styles.mainContent}>
        {/* Checklist */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Selecciona las adaptaciones que necesitas</h2>
          {CATEGORIAS.map(cat => (
            <div key={cat.id} className={styles.categoriaSection}>
              <div className={styles.categoriaHeader}>{cat.nombre}</div>
              {cat.items.map(item => (
                <div
                  key={item.id}
                  className={styles.checkItem}
                  onClick={() => toggleItem(item.id)}
                >
                  {/* stopPropagation: sin esto, pulsar la casilla la conmuta dos veces
                      —su onChange y el onClick de la fila— y se queda como estaba. */}
                  <input
                    type="checkbox"
                    className={styles.checkboxInput}
                    checked={seleccionados.has(item.id)}
                    onChange={() => toggleItem(item.id)}
                    onClick={e => e.stopPropagation()}
                    aria-label={item.nombre}
                  />
                  <label className={styles.checklistLabel}>
                    <div className={styles.itemNombre}>{item.nombre}</div>
                    <div className={styles.itemBadges}>
                      <span className={styles.itemCoste}>
                        {item.costeMin === 0 ? 'Sin coste' : `${formatCurrency(item.costeMin)} – ${formatCurrency(item.costeMax)}`}
                      </span>
                      <span className={`${styles.badge} ${styles[`prioridad${item.prioridad.charAt(0).toUpperCase() + item.prioridad.slice(1)}`]}`}>
                        {LABELS_PRIORIDAD[item.prioridad]}
                      </span>
                      {item.ayuda && (
                        <span className={`${styles.badge} ${styles.badgeAyuda}`}>✓ Con ayudas</span>
                      )}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Resumen en tiempo real */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Resumen de tu plan</h2>

          {resumen.total === 0 ? (
            <p className={styles.sinSeleccion}>
              Marca las adaptaciones que necesitas en la lista de la izquierda.<br />El resumen se actualiza en tiempo real.
            </p>
          ) : (
            <div className={styles.resumenGrid}>
              <div className={styles.costoBox}>
                <div className={styles.costoLabel}>Coste total orientativo</div>
                <div className={styles.costoValor}>
                  {formatCurrency(resumen.totalMin)} – {formatCurrency(resumen.totalMax)}
                </div>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>{resumen.total}</div>
                  <div className={styles.statLabel}>Adaptaciones seleccionadas</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumberDanger}>{resumen.prioridadAlta}</div>
                  <div className={styles.statLabel}>Prioritarias</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumberSuccess}>{resumen.conAyuda}</div>
                  <div className={styles.statLabel}>Con ayudas posibles</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>{resumen.total - resumen.conAyuda}</div>
                  <div className={styles.statLabel}>Sin ayudas específicas</div>
                </div>
              </div>

              {resumen.conAyuda > 0 && (
                <div className={styles.ayudasCard}>
                  <div className={styles.ayudasCardTitulo}><span aria-hidden="true">ℹ</span> Posibles ayudas públicas</div>
                  {resumen.conAyuda} de tus adaptaciones pueden ser elegibles para ayudas del IMSERSO, Plan Estatal de Vivienda o programas autonómicos. Consulta en tu ayuntamiento o servicios sociales municipales.
                </div>
              )}

              <div>
                <div className={styles.cardTitle} style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                  Detalle de adaptaciones ({resumen.total})
                </div>
                <div className={styles.itemsSeleccionados}>
                  {resumen.items.map(item => (
                    <div key={item.id} className={styles.itemSelRow}>
                      <span className={styles.itemSelNombre}>{item.nombre}</span>
                      <span className={styles.itemSelCoste}>
                        {item.costeMin === 0 ? 'Sin coste' : `${formatCurrency(item.costeMin)}–${formatCurrency(item.costeMax)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="¿Qué ayudas existen para adaptar el hogar?" subtitle="IMSERSO, Plan de Vivienda y programas autonómicos">
        <p>Existen varias vías de financiación pública para adaptar el hogar a las necesidades de personas mayores o con discapacidad:</p>
        <h3>Plan Estatal de Vivienda</h3>
        <p>El Plan Estatal de Vivienda 2026-2030 (Real Decreto 326/2026) subvenciona obras de accesibilidad en los edificios y dentro de las viviendas. Pueden pedirlo los propietarios, los usufructuarios, las comunidades de propietarios y, si su contrato se lo permite, los inquilinos: <strong>no hace falta tener reconocida una discapacidad ni una dependencia</strong>. La ayuda es un porcentaje del coste con un tope por vivienda; sube si en la vivienda o el edificio reside una persona con discapacidad o mayor, y tiene un refuerzo para situaciones de vulnerabilidad económica. Los porcentajes, los topes y los plazos los aplica cada comunidad autónoma en su convocatoria.</p>
        <h3>Servicios Sociales municipales</h3>
        <p>Muchos ayuntamientos tienen programas propios de adaptación del hogar para mayores. Es el primer lugar donde consultar, ya que gestionan los recursos locales y autonómicos.</p>
        <h3>Prestaciones por dependencia</h3>
        <p>Con un grado de dependencia reconocido (I, II o III), la prestación económica vinculada al servicio ayuda a pagar un servicio del catálogo de la Ley de Dependencia (teleasistencia, ayuda a domicilio, centro de día…), <strong>no obras</strong>. Las adaptaciones del hogar se financian con otra vía de la misma ley (disposición adicional 3.ª): ayudas para la autonomía personal, con carácter de subvención, que convoca cada comunidad autónoma. Tener el grado reconocido abre las dos.</p>
        <h3>IMSERSO</h3>
        <p>El IMSERSO y sus equivalentes autonómicos financian adaptaciones específicas (telealarma, ayudas técnicas, eliminación de barreras) para personas en situación de dependencia o vulnerabilidad.</p>
        <h3>Deducción IRPF</h3>
        <p>Las obras de accesibilidad en la vivienda habitual pueden generar deducciones autonómicas en la declaración de la renta. Consúltalo con la administración tributaria de tu comunidad.</p>
      {/* === SECCIONES PROFESIONALES v2.0 === */}

      {/* 1. Tabla Comparativa */}
      <div className={styles.tableWrapper}>
        <h3>Comparativa: Ayudas disponibles para adaptación del hogar</h3>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Ayuda</th>
              <th>Cobertura</th>
              <th>Requisito principal</th>
              <th>Gestión</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Plan Estatal de Vivienda 2026-2030 (RD 326/2026)</td>
              <td>Porcentaje del coste con tope por vivienda, según convocatoria (más si reside una persona con discapacidad o mayor)</td>
              <td>Ser propietario, usufructuario, comunidad o inquilino autorizado; no exige discapacidad</td>
              <td>CCAA / Ayuntamiento</td>
            </tr>
            <tr>
              <td>Prestación Servicios Sociales Municipales</td>
              <td>Variable (hasta 100%)</td>
              <td>Valoración social + renta</td>
              <td>Servicios Sociales municipales</td>
            </tr>
            <tr>
              <td>Ayudas para adaptaciones del hogar (Ley 39/2006, disposición adicional 3.ª)</td>
              <td>Subvención según convocatoria</td>
              <td>Grado de dependencia reconocido</td>
              <td>CCAA</td>
            </tr>
            <tr>
              <td>Prestación vinculada al servicio (SAAD)</td>
              <td>Hasta {formatCurrency(PEVS_GRADO_III)}/mes en grado III, para pagar un servicio del catálogo (teleasistencia, ayuda a domicilio…), no obras</td>
              <td>Grado de dependencia reconocido</td>
              <td>CCAA</td>
            </tr>
            <tr>
              <td>Deducción IRPF autonómica</td>
              <td>10-30% gastos adaptación</td>
              <td>Discapacidad ≥33% o dependencia</td>
              <td>CCAA (en declaración)</td>
            </tr>
            <tr>
              <td>IVA reducido en obras de adaptación</td>
              <td>10% en lugar de 21%</td>
              <td>Vivienda habitual, contratista registrado</td>
              <td>Automático en factura</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Casos de Uso */}
      <div className={styles.escenariosGrid}>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon} aria-hidden="true">🦯</span>
            <strong>Persona mayor con movilidad reducida</strong>
          </div>
          <p>75 años, dificultad para subir escaleras y bañarse. Necesita instalación de barras, sustitución de bañera por plato ducha y posiblemente elevador o rampa.</p>
          <div className={styles.escenarioExample}>Coste estimado: 3.000-8.000 € → las ayudas a la accesibilidad pueden cubrir una parte, según la convocatoria de su comunidad; las del Plan Estatal de Vivienda no le piden un grado reconocido</div>
          <div className={styles.escenarioTip}><span aria-hidden="true">💡</span> Solicitar valoración de dependencia antes de iniciar obras para poder acceder a todas las ayudas.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon} aria-hidden="true">♿</span>
            <strong>Persona con discapacidad reconocida</strong>
          </div>
          <p>Discapacidad motriz 40%, trabaja en casa y necesita adaptar el acceso, baño y cocina. El Plan Estatal de Vivienda puede cubrir una parte del coste.</p>
          <div className={styles.escenarioExample}>Ejemplo: presupuesto de 15.000 € → la subvención es un porcentaje de ese coste con un tope por vivienda que fija la convocatoria; con la discapacidad reconocida puede ser mayor</div>
          <div className={styles.escenarioTip}><span aria-hidden="true">💡</span> Con certificado de discapacidad en vigor, los trámites para las ayudas son más ágiles.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏠</span>
            <strong>Familiar cuidador que acondiciona la casa</strong>
          </div>
          <p>Hijo que acoge a su madre con dependencia Grado II. Necesita adaptar una habitación y el baño. Puede pedir las ayudas autonómicas para adaptar el hogar de la Ley de Dependencia y la deducción autonómica.</p>
          <div className={styles.escenarioExample}>Subvención autonómica para adaptaciones del hogar (dependencia) + deducción IRPF autonómica por obras</div>
          <div className={styles.escenarioTip}><span aria-hidden="true">💡</span> El cuidador familiar puede solicitar la prestación económica para cuidados en el entorno familiar también.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon} aria-hidden="true">🔨</span>
            <strong>Propietario mayor que quiere hacer accesible el piso</strong>
          </div>
          <p>70 años, sin dependencia reconocida pero prevé dificultades. Inversión preventiva en accesibilidad. Puede aprovechar IVA reducido y deducciones IRPF autonómicas.</p>
          <div className={styles.escenarioExample}>Obras 10.000 € con IVA 10% en vez de 21% → ahorro 1.100 € en IVA</div>
          <div className={styles.escenarioTip}><span aria-hidden="true">💡</span> Invertir en accesibilidad preventiva aumenta el valor de la vivienda y facilita el envejecimiento activo.</div>
        </div>
      </div>

      {/* 3. FAQ */}
      <div className={styles.faqList}>
        <h3>Preguntas frecuentes sobre adaptación del hogar</h3>
        <div className={styles.faqItem}>
          <strong>¿Qué adaptaciones son las más habituales?</strong>
          <p>Barras de apoyo en ducha y WC ({rangoDe(['barras_apoyo'])}), ducha accesible sin barreras en lugar de la bañera ({rangoDe(['ducha_accesible'])}), ampliación de puertas ({rangoDe(['ampliar_puertas'])}), rampa de acceso ({rangoDe(['rampa_entrada'])}), silla salvaescaleras ({rangoDe(['silla_salvaescaleras'])}) y plataforma elevadora ({rangoDe(['plataforma_elevadora'])}). Son los mismos rangos orientativos que suma la lista de arriba.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Necesito certificado de discapacidad para acceder a las ayudas?</strong>
          <p>No siempre. Las ayudas a la accesibilidad del Plan Estatal de Vivienda no lo exigen: el certificado de discapacidad, o ser una persona mayor, solo puede subir la cuantía. Las ayudas de dependencia sí piden el grado reconocido, y muchas municipales valoran la situación social y la renta.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Se pueden hacer obras en un piso de alquiler?</strong>
          <p>En España, sí. La Ley de Arrendamientos Urbanos (art. 24) permite al inquilino hacer en el interior de la vivienda las obras necesarias por la discapacidad o la edad superior a setenta años suya, de su cónyuge o pareja o de los familiares que convivan con él. No necesita el consentimiento del propietario: basta con <strong>notificárselo antes por escrito</strong>. Las obras no pueden afectar a elementos o servicios comunes del edificio ni a su estabilidad o seguridad, y al terminar el contrato el inquilino tendrá que reponer la vivienda a su estado anterior si el propietario lo exige.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿El ascensor de la comunidad puede adaptarse con ayudas?</strong>
          <p>Sí, la instalación o adaptación de ascensores en comunidades de propietarios puede beneficiarse de las ayudas a la accesibilidad de edificios del Plan Estatal de Vivienda, que pide la comunidad. Si en el edificio reside una persona con discapacidad o mayor, la ayuda puede ser mayor.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Cuánto tarda en resolverse la ayuda del Plan de Vivienda?</strong>
          <p>Variable por CCAA, generalmente entre 3 y 12 meses. Algunas comunidades tienen convocatorias anuales con fechas límite. Consultar el calendario de tu CCAA.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Puedo pedir la ayuda después de hacer las obras?</strong>
          <p>Depende de la convocatoria. Muchas ayudas requieren solicitar ANTES de iniciar las obras. Hacer obras sin solicitar primero puede excluir del acceso a subvenciones.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué es el IMSERSO y qué ayudas ofrece?</strong>
          <p>El IMSERSO gestiona prestaciones del Sistema de Autonomía y Atención a la Dependencia (SAAD). Ofrece prestaciones económicas para servicios y para cuidados en el entorno familiar.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿La tecnología domótica puede incluirse en las ayudas?</strong>
          <p>Sí, adaptaciones tecnológicas como sistemas de alarma, control domótico por voz o sensores de seguridad para mayores pueden incluirse en algunas convocatorias de ayudas a la accesibilidad.</p>
          <div className={styles.faqTip}><span aria-hidden="true">💡</span> Consultar con servicios sociales municipales qué tecnologías específicas están subvencionadas en tu localidad.</div>
        </div>
      </div>

      {/* 4. Guía Paso a Paso */}
      <div className={styles.stepGuide}>
        <h3>Cómo planificar y financiar la adaptación del hogar</h3>
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <strong>Valora las necesidades reales</strong>
            <p>Identifica qué zonas del hogar son problemáticas: baño, acceso, dormitorio, cocina. Consulta con un terapeuta ocupacional para una evaluación profesional gratuita.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <strong>Obtén el reconocimiento de discapacidad/dependencia</strong>
            <p>Si aún no tienes valoración, solicítala en tu CCAA. La dependencia se valora a través del Servicio de Autonomía y Atención a la Dependencia autonómico.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <strong>Investiga las ayudas disponibles en tu zona</strong>
            <p>Consulta con Servicios Sociales municipales, la web de tu CCAA y el portal del IMSERSO. Cada CCAA tiene convocatorias propias con plazos distintos.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>4</div>
          <div className={styles.stepContent}>
            <strong>Solicita la ayuda ANTES de iniciar obras</strong>
            <p>La mayoría de subvenciones requieren solicitar antes de comenzar las obras. Obtén presupuesto de empresa instaladora y preséntalo con la solicitud.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>5</div>
          <div className={styles.stepContent}>
            <strong>Ejecuta las obras con empresa registrada</strong>
            <p>Usa empresas de instalación registradas para aplicar el IVA reducido del 10%. Guarda todas las facturas para justificar la subvención y para la declaración de IRPF.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>6</div>
          <div className={styles.stepContent}>
            <strong>Justifica la ayuda recibida</strong>
            <p>Presenta las facturas y documentación requerida por el organismo que concedió la ayuda. Sin justificación adecuada, pueden reclamar el reintegro.</p>
          </div>
        </div>
      </div>

      {/* 5. Mejores Prácticas */}
      <div className={styles.tipsGrid}>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">📋</div>
          <strong>Consulta Servicios Sociales primero</strong>
          <p>Antes de contratar ninguna obra, visita Servicios Sociales municipales. Pueden asesorarte sobre todas las ayudas disponibles y los pasos a seguir.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">🏗️</div>
          <strong>Prioriza las zonas de mayor riesgo</strong>
          <p>El baño es la zona de mayor riesgo de caídas en mayores. Adaptarlo primero (barras, ducha accesible, antideslizante) tiene el mayor impacto en seguridad.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">📅</div>
          <strong>Actúa antes de que sea urgente</strong>
          <p>Las adaptaciones preventivas son más baratas y mejor planificadas. No esperes a tener un accidente para solicitar ayudas y hacer obras.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">🔍</div>
          <strong>Pide varios presupuestos</strong>
          <p>Las empresas especializadas en adaptaciones para mayores o discapacidad son necesarias para el IVA reducido. Compara al menos 3 presupuestos.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">📊</div>
          <strong>Combina varias ayudas</strong>
          <p>Es posible combinar subvención del Plan de Vivienda con ayudas municipales y deducción IRPF autonómica. La combinación puede cubrir casi todo el coste.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">🏦</div>
          <strong>Considera el ICO para financiar si hay espera</strong>
          <p>Mientras tramitas las ayudas, existe financiación ICO específica para obras de accesibilidad con condiciones ventajosas. Consulta con tu banco.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">🤝</div>
          <strong>Recursos si el coste sigue siendo inasumible</strong>
          <p>Si el coste sigue siendo inasumible incluso con todas las ayudas, los Servicios Sociales municipales pueden valorar ayudas excepcionales por emergencia social, y existen ayudas técnicas de préstamo (Bancos de Productos de Apoyo) gestionadas por algunas CCAA o entidades como Cruz Roja para soluciones temporales sin coste.</p>
        </div>
      </div>

      {/* 6. Warning Box */}
      <div className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
          <strong>Errores frecuentes al adaptar el hogar</strong>
        </div>
        <ul className={styles.warningList}>
          <li><strong>Hacer las obras antes de solicitar la ayuda</strong>: La mayoría de subvenciones no se pueden solicitar retroactivamente. Una vez iniciadas las obras, se pierde el derecho a muchas ayudas.</li>
          <li><strong>No solicitar valoración de dependencia</strong>: Sin el grado reconocido, se pierden los servicios y prestaciones del SAAD (teleasistencia, ayuda a domicilio…) y las ayudas autonómicas para adaptar el hogar que lo exigen.</li>
          <li><strong>Contratar empresa no registrada</strong>: Para aplicar el IVA reducido del 10%, la empresa debe cumplir requisitos. Una empresa no registrada puede implicar pagar el 21%.</li>
          <li><strong>Ignorar las ayudas autonómicas</strong>: Muchas CCAA tienen ayudas adicionales a las estatales. No consultarlas puede suponer perder miles de euros en subvenciones disponibles.</li>
          <li><strong>No guardar todas las facturas</strong>: Las facturas son necesarias para justificar subvenciones, aplicar deducciones en IRPF y garantizar la garantía de las instalaciones.</li>
          <li><strong>Hacer adaptaciones insuficientes por ahorro</strong>: Hacer solo adaptaciones parciales puede resultar en tener que volver a hacer obras pocos años después, gastando más en total.</li>
        </ul>
      </div>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="adaptacion-hogar" />
      <Footer appName="adaptacion-hogar" />
    </div>
  );
}
