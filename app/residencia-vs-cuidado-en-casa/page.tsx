'use client';

import { useState } from 'react';
import styles from './ResidenciaVsCuidadoCasa.module.css';
import { MeskeiaLogo, Footer, NumberInput, EducationalSection, RelatedApps, ShareCard, DisclaimerCard, RegionBadge } from '@/components';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos y datos ────────────────────────────────────────────────────────────

type GradoDependencia = 'no_valorado' | 'grado1' | 'grado2' | 'grado3';

interface FactorComparacion {
  icono: string;
  texto: string;
}

interface Opcion {
  id: string;
  icono: string;
  nombre: string;
  costeTexto: string;
  costeMin: number;
  costeMax: number;
  factores: FactorComparacion[];
  notaPublica?: string;
}

// ─── Lógica ───────────────────────────────────────────────────────────────────

function calcularOpciones(horasDia: number, gradoDependencia: GradoDependencia): Opcion[] {
  // Residencia privada: coste relativamente fijo, varía por CCAA
  const residenciaMin = 1600;
  const residenciaMax = 3200;

  // SAD privado: precio/hora × horas × días/mes (~22 laborables, pero SAD también en fines)
  // Usamos 26 días de media para incluir fines de semana parciales
  const precioHoraSAD = 18; // €/hora media nacional SAD privado de agencia
  const costeSADMin = Math.round(horasDia * precioHoraSAD * 22);
  const costeSADMax = Math.round(horasDia * 22 * 26);

  // Cuidador en casa: coste real = salario neto + SS empleador (~32%) + prorrata 14 pagas
  // SMI 2025 = 1.134 €/mes (12 pagas) → coste total empleador ~1.750 €/mes en jornada completa
  let cuidadorMin: number;
  let cuidadorMax: number;
  let cuidadorTipo: string;

  if (horasDia <= 4) {
    // €16-20/h efectivos (neto + cuota SS empleador proporcional)
    cuidadorMin = Math.round(horasDia * 16 * 22);
    cuidadorMax = Math.round(horasDia * 20 * 22);
    cuidadorTipo = 'Auxiliar a tiempo parcial';
  } else if (horasDia <= 8) {
    // Jornada completa: SMI 2025 + SS empleador + prorrata pagas extras ≈ 1.750 € mínimo real
    cuidadorMin = 1750;
    cuidadorMax = 2200;
    cuidadorTipo = 'Auxiliar a jornada completa';
  } else {
    // Interno: salario inferior por alojamiento incluido; coste total empleador 1.300-1.700 €
    cuidadorMin = 1300;
    cuidadorMax = 1700;
    cuidadorTipo = 'Cuidador interno (incluye alojamiento)';
  }

  const tienePrestacion = gradoDependencia === 'grado2' || gradoDependencia === 'grado3';
  const notaPublica = gradoDependencia !== 'no_valorado'
    ? `Con ${gradoDependencia.replace('grado', 'Grado ')} reconocido, puedes acceder a prestaciones económicas y SAD público que reducen el coste real.`
    : 'Sin valoración de dependencia, los costes son íntegramente privados. Valorar la dependencia desbloquea ayudas públicas.';

  return [
    {
      id: 'residencia',
      icono: '🏢',
      nombre: 'Residencia privada',
      costeTexto: `${formatCurrency(residenciaMin)} – ${formatCurrency(residenciaMax)}/mes`,
      costeMin: residenciaMin,
      costeMax: residenciaMax,
      factores: [
        { icono: '✅', texto: 'Atención 24 horas garantizada' },
        { icono: '✅', texto: 'Sin carga para la familia' },
        { icono: '✅', texto: 'Socialización y actividades' },
        { icono: '✅', texto: 'Atención sanitaria integrada' },
        { icono: '❌', texto: 'La persona abandona su hogar' },
        { icono: '❌', texto: 'Coste más elevado' },
        { icono: '⚠️', texto: 'Variabilidad de calidad entre centros' },
      ],
    },
    {
      id: 'sad',
      icono: '🏠',
      nombre: `SAD en domicilio (${horasDia}h/día)`,
      costeTexto: `${formatCurrency(costeSADMin)} – ${formatCurrency(costeSADMax)}/mes`,
      costeMin: costeSADMin,
      costeMax: costeSADMax,
      factores: [
        { icono: '✅', texto: 'Permanece en su hogar' },
        { icono: '✅', texto: 'Mayor autonomía y privacidad' },
        { icono: '✅', texto: 'Coste proporcional a las horas' },
        { icono: tienePrestacion ? '✅' : '⚠️', texto: tienePrestacion ? 'SAD público disponible con tu grado' : 'SAD público posible si se valora dependencia' },
        { icono: '❌', texto: 'No cubre las horas fuera del servicio' },
        { icono: '⚠️', texto: 'Requiere apoyo familiar complementario' },
      ],
      notaPublica,
    },
    {
      id: 'cuidador',
      icono: '👤',
      nombre: cuidadorTipo,
      costeTexto: `${formatCurrency(cuidadorMin)} – ${formatCurrency(cuidadorMax)}/mes`,
      costeMin: cuidadorMin,
      costeMax: cuidadorMax,
      factores: [
        { icono: '✅', texto: 'Permanece en su hogar' },
        { icono: '✅', texto: 'Atención personalizada y continua' },
        { icono: horasDia >= 8 ? '✅' : '⚠️', texto: horasDia >= 8 ? 'Cobertura amplia de horas' : 'Cobertura limitada a las horas contratadas' },
        { icono: '⚠️', texto: 'Responsabilidad como empleador (SS y contrato)' },
        { icono: '⚠️', texto: 'Gestión de sustituciones en vacaciones/bajas' },
        { icono: '❌', texto: 'Sin cobertura sanitaria integrada' },
      ],
      notaPublica,
    },
  ];
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ResidenciaVsCuidadoCasa() {
  const [horasDia, setHorasDia] = useState('4');
  const [gradoDependencia, setGradoDependencia] = useState<GradoDependencia>('no_valorado');
  const [opciones, setOpciones] = useState<Opcion[] | null>(null);
  const [error, setError] = useState('');

  function comparar() {
    setError('');
    const horas = parseFloat(horasDia.replace(',', '.'));
    if (isNaN(horas) || horas < 1 || horas > 24) {
      setError('Introduce las horas de cuidado al día (entre 1 y 24).');
      return;
    }
    setOpciones(calcularOpciones(horas, gradoDependencia));
  }

  const opcionesSorted = opciones ? [...opciones].sort((a, b) => a.costeMin - b.costeMin) : null;
  const opcionMasBajaId = opcionesSorted?.[0]?.id;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🏡</span>
        <h1 className={styles.title}>Residencia vs Cuidado en Casa</h1>
        <p className={styles.subtitle}>Compara costes y factores de las opciones de cuidado para mayores · 2025</p>
      </header>

      <RegionBadge variant="es-only" />


      <DisclaimerCard variant="financial"
        severity="high">
        <span>
          Los costes son <strong>estimaciones orientativas</strong> con medias nacionales 2025. Los precios reales varían significativamente por comunidad autónoma, calidad del servicio y situación personal.
          <br /><strong>No es</strong> asesoramiento financiero ni de servicios sociales personalizado.
          <br />Las prestaciones públicas de dependencia dependen del reconocimiento oficial del grado. Consulta con los Servicios Sociales de tu municipio.
          <br /><em>meskeIA no se responsabiliza de decisiones basadas en estas estimaciones.</em>
        </span>
      </DisclaimerCard>

      <div className={styles.mainContent}>
        {/* Formulario */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Tu situación</h2>

          <NumberInput
            value={horasDia}
            onChange={setHorasDia}
            label="Horas de cuidado necesarias al día"
            placeholder="4"
            helperText="Horas diarias de ayuda que requiere la persona: aseo, comidas, movilidad, etc."
            min={1}
            max={24}
          />

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="gradoDep">Grado de Dependencia reconocido</label>
            <select
              id="gradoDep"
              className={styles.select}
              value={gradoDependencia}
              onChange={e => setGradoDependencia(e.target.value as GradoDependencia)}
            >
              <option value="no_valorado">No valorado (o en trámite)</option>
              <option value="grado1">Grado I — Dependencia moderada</option>
              <option value="grado2">Grado II — Dependencia severa</option>
              <option value="grado3">Grado III — Gran dependencia</option>
            </select>
            <p className={styles.hint}>
              Si aún no está valorado, solicitar el reconocimiento desbloquea prestaciones y ayudas públicas.
            </p>
          </div>

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              ⚠️ {error}
            </div>
          )}

          <button type="button" className={styles.btn} onClick={comparar} aria-label="Comparar opciones de cuidado">
            Comparar opciones
          </button>
        </div>

        {/* Resultados */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Comparativa de opciones</h2>

          {!opciones ? (
            <p className={styles.placeholder}>
              Indica las horas de cuidado y pulsa el botón para ver la comparativa de las tres opciones.
            </p>
          ) : (
            <div className={styles.opcionesGrid}>
              {opciones.map(opcion => (
                <div
                  key={opcion.id}
                  className={`${styles.opcionCard} ${opcion.id === opcionMasBajaId ? styles.opcionMasBaja : ''}`}
                >
                  <div className={styles.opcionHeader}>
                    <span className={styles.opcionIcono} aria-hidden="true">{opcion.icono}</span>
                    <span className={styles.opcionNombre}>{opcion.nombre}</span>
                    {opcion.id === opcionMasBajaId && (
                      <span className={styles.opcionBadge}>Más económica</span>
                    )}
                  </div>

                  <div className={styles.opcionCoste}>{opcion.costeTexto}</div>

                  <div className={styles.factoresLista}>
                    {opcion.factores.map((f, i) => (
                      <div key={i} className={styles.factorItem}>
                        <span className={styles.factorIcono} aria-hidden="true">{f.icono}</span>
                        <span>{f.texto}</span>
                      </div>
                    ))}
                  </div>

                  {opcion.notaPublica && (
                    <>
                      <div className={styles.divider} />
                      <p className={styles.notaPublica}>💡 {opcion.notaPublica}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="¿Cómo elegir entre residencia y cuidado en casa?" subtitle="Factores económicos, emocionales y prácticos a considerar">
        <p>No existe una opción universalmente mejor: la decisión depende de la situación médica, la red familiar, el entorno de la vivienda y los recursos económicos. Estos son los factores clave:</p>
        <h3>¿Cuándo puede ser mejor la residencia?</h3>
        <ul>
          <li>Dependencia severa o gran dependencia (Grado II o III) con necesidad de atención 24h.</li>
          <li>Aislamiento social o cuando la persona se beneficia de la vida comunitaria.</li>
          <li>Cuando la vivienda no es adaptable o la familia no puede asumir el rol cuidador.</li>
          <li>Cuando el coste de los cuidados en casa supera al de la residencia.</li>
        </ul>
        <h3>¿Cuándo puede ser mejor el cuidado en casa?</h3>
        <ul>
          <li>Dependencia moderada que no requiere atención médica especializada continua.</li>
          <li>Fuerte vínculo de la persona con su hogar y entorno habitual.</li>
          <li>Red familiar que puede complementar las horas del cuidador o SAD.</li>
          <li>Vivienda adaptable o ya adaptada.</li>
        </ul>
        <h3>El papel de la valoración de dependencia</h3>
        <p>Solicitar el reconocimiento oficial de la dependencia (IMSERSO / CCAA) es el primer paso. Desbloquea prestaciones económicas, plazas en centros de día, SAD público y prioridad en residencias concertadas, reduciendo notablemente el coste real.</p>

      {/* === SECCIONES PROFESIONALES v2.0 === */}

      {/* 1. Tabla Comparativa */}
      <div className={styles.tableWrapper}>
        <h3>Comparativa: Residencia vs Cuidado en Casa</h3>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Factor</th>
              <th>Residencia</th>
              <th>Cuidado en Casa</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Coste mensual</td>
              <td>1.500-4.500 € (pública/privada)</td>
              <td>800-3.000 € (SAD/cuidador)</td>
            </tr>
            <tr>
              <td>Atención médica 24h</td>
              <td>Sí</td>
              <td>No (salvo contratación adicional)</td>
            </tr>
            <tr>
              <td>Entorno familiar</td>
              <td>No (entorno institucional)</td>
              <td>Sí</td>
            </tr>
            <tr>
              <td>Adecuado para dependencia severa (Grado III)</td>
              <td>Sí</td>
              <td>Difícil sin apoyo intensivo</td>
            </tr>
            <tr>
              <td>Impacto en vivienda propia</td>
              <td>Puede mantenerse o venderse</td>
              <td>Se mantiene habitada</td>
            </tr>
            <tr>
              <td>Apoyo para cuidador familiar</td>
              <td>Cuidador descanso total</td>
              <td>Cuidador sobrecargado (riesgo burnout)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Casos de Uso */}
      <div className={styles.escenariosGrid}>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>🏥</span>
            <strong>Dependencia Grado III con necesidad médica</strong>
          </div>
          <p>Persona con demencia avanzada, incontinencia y riesgo de caídas. Necesita atención 24h que la familia no puede proveer. La residencia especializada es la opción más segura.</p>
          <div className={styles.escenarioExample}>Indicador: Grado III + necesidad atención médica continua → residencia especializada</div>
          <div className={styles.escenarioTip}>💡 La lista de espera en residencias públicas puede ser larga; solicitar plaza con antelación.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>🏠</span>
            <strong>Dependencia moderada con familia cercana</strong>
          </div>
          <p>Grado I-II, familia próxima, preferencia por el hogar. SAD + cuidador parcial puede ser suficiente con apoyos municipales y adaptación del hogar.</p>
          <div className={styles.escenarioExample}>Solución: SAD municipal 3h/día + cuidador interno 2 días + teleasistencia</div>
          <div className={styles.escenarioTip}>💡 Combinar SAD, teleasistencia y prestación económica del SAAD puede cubrir necesidades a coste razonable.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>👩‍👦</span>
            <strong>Cuidador único con trabajo a jornada completa</strong>
          </div>
          <p>Hijo único trabajador, no puede atender a progenitor con dependencia durante el día. Sin red de apoyo, el cuidado en casa no es sostenible.</p>
          <div className={styles.escenarioExample}>Alternativa: Centro de día + teleasistencia + cuidador nocturno eventual</div>
          <div className={styles.escenarioTip}>💡 Los centros de día (no internamiento) son una solución intermedia menos costosa y más flexible.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>🏘️</span>
            <strong>Persona mayor que rechaza la residencia</strong>
          </div>
          <p>Autonomía suficiente pero soledad y riesgos. Prefiere su casa. Teleasistencia + visitas SAD + comunidad de vecinos puede ser viable con seguimiento estrecho.</p>
          <div className={styles.escenarioExample}>Mínimo viable: teleasistencia + visita SAD diaria + red vecinal activa</div>
          <div className={styles.escenarioTip}>💡 La teleasistencia avanzada (sensores de movimiento, detección de caídas) permite mayor autonomía con seguridad.</div>
        </div>
      </div>

      {/* 3. FAQ */}
      <div className={styles.faqList}>
        <h3>Preguntas frecuentes: residencia vs cuidado en casa</h3>
        <div className={styles.faqItem}>
          <strong>¿Cuánto cuesta una residencia pública vs privada?</strong>
          <p>La residencia pública cuesta entre 1.500-2.500 €/mes (con copago según renta). La privada, entre 2.000-4.500 € según calidad y ubicación. Las listas de espera en plazas públicas pueden ser de 1-3 años.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué es el SAD (Servicio de Atención Domiciliaria)?</strong>
          <p>Servicio municipal que proporciona cuidados básicos en el domicilio (higiene, comidas, acompañamiento). Incluido en las prestaciones del SAAD, con copago según renta.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué diferencia hay entre centro de día y residencia?</strong>
          <p>El centro de día es atención diurna (8-20h) sin internamiento. La persona duerme en casa. Es más barato y menos disruptivo, adecuado para dependencias moderadas.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Puede la familia cobrar por cuidar a un familiar?</strong>
          <p>Sí, a través de la prestación económica para cuidados en el entorno familiar del SAAD (hasta 387 €/mes para Grado III). El cuidador debe darse de alta en la SS.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿La residencia implica perder la pensión?</strong>
          <p>No, la pensión se sigue cobrando. Se destina al pago de la residencia (copago según renta). El Estado puede reclamar parte de los bienes al fallecimiento en algunas CCAA.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Se puede volver a casa desde la residencia?</strong>
          <p>Sí, si la situación de salud mejora o la familia puede asumir los cuidados, es posible volver al domicilio. Las plazas públicas se pueden dejar con un periodo de preaviso.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué es la teleasistencia avanzada?</strong>
          <p>Sistemas que van más allá del botón de emergencia: sensores de movimiento, detección de caídas, alertas médicas, videollamada. Permite mayor seguridad con mayor autonomía en casa.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Cómo afecta esta decisión a la herencia?</strong>
          <p>La residencia consume el patrimonio más rápido. En algunas CCAA, el Estado puede exigir reintegro de prestaciones del SAAD con cargo a la herencia. Consultar con un abogado antes.</p>
          <div className={styles.faqTip}>💡 Planificar con un notario puede proteger ciertos activos dentro de los límites legales.</div>
        </div>
      </div>

      {/* 4. Guía Paso a Paso */}
      <div className={styles.stepGuide}>
        <h3>Cómo tomar la decisión: residencia vs cuidado en casa</h3>
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <strong>Evalúa el grado de dependencia</strong>
            <p>Si aún no hay valoración oficial, solicítala. El grado determina qué prestaciones están disponibles y qué nivel de cuidado es necesario objetivamente.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <strong>Analiza la situación familiar realista</strong>
            <p>¿Hay cuidadores disponibles? ¿Cuántas horas pueden dedicar? ¿Tienen formación? ¿Cómo afectará a su trabajo y vida personal? Sé honesto sobre la capacidad familiar.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <strong>Consulta con el trabajador social</strong>
            <p>Los trabajadores sociales del municipio o del SAAD pueden orientar sobre servicios disponibles, listas de espera, costes y opciones más adecuadas para el caso concreto.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>4</div>
          <div className={styles.stepContent}>
            <strong>Calcula el coste real de cada opción</strong>
            <p>Suma SAD + adaptaciones + cuidador + teleasistencia para el cuidado en casa. Compara con el copago de residencia pública o el coste de privada.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>5</div>
          <div className={styles.stepContent}>
            <strong>Incluye a la persona dependiente en la decisión</strong>
            <p>Siempre que sea posible, la persona mayor debe participar en la decisión. Sus preferencias son importantes aunque no siempre determinantes por razones de seguridad.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>6</div>
          <div className={styles.stepContent}>
            <strong>Revisa la decisión periódicamente</strong>
            <p>La situación de dependencia evoluciona. Una solución adecuada hoy puede no serlo en 6-12 meses. Planifica revisiones periódicas con el equipo de atención.</p>
          </div>
        </div>
      </div>

      {/* 5. Mejores Prácticas */}
      <div className={styles.tipsGrid}>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>⏰</div>
          <strong>Solicita la valoración de dependencia pronto</strong>
          <p>Las listas de espera tanto para valoración como para plazas en residencias públicas son largas. No esperar a una crisis para iniciar los trámites.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🤝</div>
          <strong>Cuida al cuidador</strong>
          <p>El cuidador familiar tiene riesgo de síndrome de burnout. Incluir servicios de respiro, grupos de apoyo y tiempo libre en la planificación es fundamental.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>📱</div>
          <strong>Invierte en teleasistencia</strong>
          <p>Es uno de los servicios con mejor relación coste-beneficio. Da tranquilidad a la familia y seguridad a la persona mayor con un coste muy bajo.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🔄</div>
          <strong>Considera soluciones mixtas</strong>
          <p>El centro de día + casa es una opción intermedia valiosa. La persona duerme en casa pero recibe atención profesional durante el día.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>💼</div>
          <strong>Verifica la regularización del cuidador</strong>
          <p>Los cuidadores contratados en casa deben estar regularizados (Sistema Especial Empleados del Hogar). La economía sumergida conlleva riesgos legales y laborales.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>⚖️</div>
          <strong>Planifica el aspecto patrimonial</strong>
          <p>La decisión sobre residencia tiene implicaciones hereditarias. Consultar con un notario o abogado antes de tomar decisiones que afecten al patrimonio familiar.</p>
        </div>
      </div>

      {/* 6. Warning Box */}
      <div className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon}>⚠️</span>
          <strong>Errores frecuentes en la decisión residencia vs casa</strong>
        </div>
        <ul className={styles.warningList}>
          <li><strong>Decidir en crisis</strong>: Tomar la decisión después de una hospitalización urgente genera malas elecciones. Planificar antes de que la situación se agrave da mejores resultados.</li>
          <li><strong>No valorar el impacto en el cuidador</strong>: La sobrecarga del cuidador puede llevar al colapso familiar. Si el cuidador no puede sostener el cuidado, la residencia puede ser mejor para todos.</li>
          <li><strong>Elegir solo por coste</strong>: La opción más barata puede no ser la más adecuada para las necesidades médicas y emocionales de la persona dependiente.</li>
          <li><strong>No explorar todas las ayudas públicas</strong>: Muchas familias pagan más de lo necesario por desconocimiento de las prestaciones del SAAD, SAD municipal o deducciones fiscales.</li>
          <li><strong>Contratar cuidadores sin regularizar</strong>: Los cuidadores en economía sumergida no tienen acceso a bajas médicas ni prestaciones. Un accidente puede generar problemas legales graves para la familia.</li>
          <li><strong>No planificar la evolución de la situación</strong>: Las necesidades de cuidado aumentan con el tiempo. Una solución adecuada hoy puede ser insuficiente en 2 años. Planificar la progresión evita decisiones urgentes.</li>
        </ul>
      </div>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('residencia-vs-cuidado-en-casa')} />
      <ShareCard appName="residencia-vs-cuidado-en-casa" />
      <Footer appName="residencia-vs-cuidado-en-casa" />
    </div>
  );
}
