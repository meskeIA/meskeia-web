'use client';

import { useState, useMemo } from 'react';
import styles from './SimuladorBonoJovenAlquiler.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard, RegionBadge
} from '@/components';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

interface Requisito {
  id: string;
  pregunta: string;
  explicacion: string;
  bloqueante: boolean;
}

const REQUISITOS: Requisito[] = [
  {
    id: 'edad',
    pregunta: 'Tienes entre 18 y 35 años (inclusive)',
    explicacion: 'El Bono Joven está destinado exclusivamente a personas de hasta 35 años.',
    bloqueante: true,
  },
  {
    id: 'ingresos',
    pregunta: 'Tus ingresos están dentro del límite establecido por tu Comunidad Autónoma',
    explicacion: 'El Plan Estatal 2026-2030 establece un límite de ingresos máximos, pero cada Comunidad Autónoma puede concretar o ajustar ese umbral en su convocatoria. Consulta la convocatoria de tu CA para conocer el límite exacto aplicable.',
    bloqueante: true,
  },
  {
    id: 'propietario',
    pregunta: 'No eres propietario de una vivienda en España',
    explicacion: 'No puedes ser titular de un derecho de propiedad o usufructo sobre ninguna vivienda en España.',
    bloqueante: true,
  },
  {
    id: 'habitual',
    pregunta: 'La vivienda es tu residencia habitual y permanente',
    explicacion: 'Debes destinar la vivienda alquilada a tu domicilio habitual y permanente.',
    bloqueante: true,
  },
  {
    id: 'contrato',
    pregunta: 'El contrato de arrendamiento está registrado (o lo estará)',
    explicacion: 'El contrato debe estar formalizado por escrito y depositada la fianza. Las CA pueden pedir su depósito oficial.',
    bloqueante: false,
  },
  {
    id: 'renta',
    pregunta: 'La renta mensual no supera 600 € (o 900 € en zonas tensionadas)',
    explicacion: 'El límite general es 600 €/mes. En zonas de mercado residencial tensionado la CA puede ampliar hasta 900 €/mes.',
    bloqueante: false,
  },
  {
    id: 'comunidad',
    pregunta: 'Tu Comunidad Autónoma tiene el Bono Joven activo',
    explicacion: 'La gestión y disponibilidad del Bono Joven depende de cada Comunidad Autónoma, que recibe los fondos del Estado y los tramita.',
    bloqueante: false,
  },
];

type EstadoRequisito = 'si' | 'no' | 'pendiente';
type TipoVivienda = 'vivienda' | 'habitacion';

const BONO: Record<TipoVivienda, number> = { vivienda: 300, habitacion: 200 };
const DURACION_MAX_MESES = 48; // hasta 4 años (2 + renovación 2)

export default function SimuladorBonoJovenAlquilerPage() {
  const [alquilMensual, setAlquilMensual] = useState('');
  const [tipoVivienda, setTipoVivienda] = useState<TipoVivienda>('vivienda');
  const [estados, setEstados] = useState<Record<string, EstadoRequisito>>(
    Object.fromEntries(REQUISITOS.map(r => [r.id, 'pendiente']))
  );

  const toggleEstado = (id: string, valor: EstadoRequisito) => {
    setEstados(prev => ({ ...prev, [id]: prev[id] === valor ? 'pendiente' : valor }));
  };

  const resultado = useMemo(() => {
    const bloqueantes = REQUISITOS.filter(r => r.bloqueante);
    const algunBloqueanteFalla = bloqueantes.some(r => estados[r.id] === 'no');
    const algunBloqueantePendiente = bloqueantes.some(r => estados[r.id] === 'pendiente');
    const todosConfirmados = REQUISITOS.every(r => estados[r.id] === 'si');
    const algunNoRecomendado = REQUISITOS.filter(r => !r.bloqueante).some(r => estados[r.id] === 'no');

    if (algunBloqueanteFalla) return 'no-apto';
    if (todosConfirmados && !algunNoRecomendado) return 'apto';
    if (!algunBloqueantePendiente && !algunBloqueanteFalla) return 'casi';
    return 'pendiente';
  }, [estados]);

  const alquilerNum = parseFloat(alquilMensual.replace(',', '.')) || 0;
  const bonificacionMaxima = BONO[tipoVivienda];
  // El bono no puede superar el 60% de la renta mensual (RD 326/2026)
  const bonificacionEfectiva = alquilerNum > 0 ? Math.min(bonificacionMaxima, alquilerNum * 0.6) : bonificacionMaxima;
  const totalAyudaMax = bonificacionMaxima * DURACION_MAX_MESES;
  const alquilerConBono = Math.max(0, alquilerNum - bonificacionEfectiva);

  const iconoEstado = (estado: EstadoRequisito) => {
    if (estado === 'si') return '✅';
    if (estado === 'no') return '❌';
    return '⬜';
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🏠</div>
        <h1 className={styles.title}>Simulador Bono Joven Alquiler</h1>
        <p className={styles.subtitle}>Comprueba si puedes recibir hasta 300 €/mes (vivienda) o 200 €/mes (habitación) durante hasta 4 años</p>
        <p className={styles.heroLaw}>Real Decreto 326/2026, de 22 de abril · Plan Estatal de Vivienda 2026-2030</p>
      </header>

      <RegionBadge variant="es-only" />


      <LegalNotice />

      <DisclaimerCard
        variant="financial"
        severity="critical"
        collapsible={false}
        context="Bono Joven al Alquiler 2026-2030 (RD 326/2026): las cuantías son orientativas. Los requisitos concretos, límite de ingresos y condiciones específicas los fija cada Comunidad Autónoma en su convocatoria. Consulta siempre con tu CA antes de tomar decisiones económicas."
      />

      {/* Sección de tu alquiler */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><span aria-hidden="true">💶</span> Tu alquiler actual</h2>

        <div className={styles.field}>
          <span className={styles.label}>¿Alquilas una vivienda completa o una habitación?</span>
          <div className={styles.tipoSelector}>
            <button
              className={`${styles.tipoBtn} ${tipoVivienda === 'vivienda' ? styles.tipoBtnActivo : ''}`}
              type="button"
              onClick={() => setTipoVivienda('vivienda')}
              aria-pressed={tipoVivienda === 'vivienda'}
            >
              🏠 Vivienda completa <span className={styles.tipoBono}>hasta 300 €/mes</span>
            </button>
            <button
              className={`${styles.tipoBtn} ${tipoVivienda === 'habitacion' ? styles.tipoBtnActivo : ''}`}
              type="button"
              onClick={() => setTipoVivienda('habitacion')}
              aria-pressed={tipoVivienda === 'habitacion'}
            >
              🛏️ Habitación (piso compartido) <span className={styles.tipoBono}>hasta 200 €/mes</span>
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="alquiler">Renta mensual del alquiler</label>
          <div className={styles.inputEuro}>
            <span aria-hidden="true">€</span>
            <input
              id="alquiler"
              type="number"
              inputMode="decimal"
              min={0}
              step={10}
              value={alquilMensual}
              onChange={e => setAlquilMensual(e.target.value)}
              placeholder="550"
              aria-label="Renta mensual en euros"
            />
            <span>/mes</span>
          </div>
          <span className={styles.helperText}>Introduce lo que pagas actualmente o lo que pagarás</span>
        </div>

        {alquilerNum > 0 && (
          <div className={styles.ahorroPanel}>
            <div className={styles.ahorroCard}>
              <span className={styles.ahorroValor}>{formatCurrency(bonificacionEfectiva)}</span>
              <span className={styles.ahorroLabel}>Ayuda mensual</span>
              {bonificacionEfectiva < bonificacionMaxima && (
                <span className={styles.ahorroNota}>Límite: 60% de la renta</span>
              )}
            </div>
            <div className={styles.ahorroCard}>
              <span className={styles.ahorroValor}>{formatCurrency(alquilerConBono)}</span>
              <span className={styles.ahorroLabel}>Tu pago real</span>
            </div>
            <div className={styles.ahorroCard}>
              <span className={styles.ahorroValor}>{formatCurrency(totalAyudaMax)}</span>
              <span className={styles.ahorroLabel}>Máximo en 4 años</span>
            </div>
          </div>
        )}
      </section>

      {/* Checklist de requisitos */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><span aria-hidden="true">✅</span> Comprueba tus requisitos</h2>

        <div className={styles.checkGrid} role="list">
          {REQUISITOS.map(req => {
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
                    className={`${styles.radioBtn} ${estado === 'si' ? styles.radioBtnActive : ''}`}
                    onClick={() => toggleEstado(req.id, 'si')}
                    aria-pressed={estado === 'si'}
                  >
                    Sí
                  </button>
                  <button
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

      {/* Resultado */}
      {resultado !== 'pendiente' && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><span aria-hidden="true">📊</span> Tu resultado</h2>
          {resultado === 'apto' && (
            <div className={`${styles.resultadoCard} ${styles['resultado-apto']}`} role="status" aria-live="polite" aria-atomic="true">
              <div className={styles.resultadoIcon} aria-hidden="true">🎉</div>
              <h3 className={styles.resultadoTitulo}>¡Cumples todos los requisitos!</h3>
              <p className={styles.resultadoTexto}>
                En principio puedes solicitar el Bono Joven al Alquiler y recibir hasta <strong>{formatCurrency(bonificacionMaxima)}/mes durante hasta 4 años</strong> (2 años renovables).
                El siguiente paso es contactar con la oficina de vivienda de tu Comunidad Autónoma para tramitar la solicitud.
              </p>
            </div>
          )}
          {resultado === 'casi' && (
            <div className={`${styles.resultadoCard} ${styles['resultado-casi']}`} role="status" aria-live="polite" aria-atomic="true">
              <div className={styles.resultadoIcon} aria-hidden="true">⚠️</div>
              <h3 className={styles.resultadoTitulo}>Cumples los requisitos básicos</h3>
              <p className={styles.resultadoTexto}>
                Cumples los requisitos obligatorios, aunque algunos aspectos adicionales (renta, contrato registrado, disponibilidad en tu CA)
                pueden condicionar la aprobación final. Consulta con tu Comunidad Autónoma.
              </p>
            </div>
          )}
          {resultado === 'no-apto' && (
            <div className={`${styles.resultadoCard} ${styles['resultado-no-apto']}`} role="status" aria-live="polite" aria-atomic="true">
              <div className={styles.resultadoIcon} aria-hidden="true">❌</div>
              <h3 className={styles.resultadoTitulo}>No cumples los requisitos obligatorios</h3>
              <p className={styles.resultadoTexto}>
                Existe al menos un requisito imprescindible que no cumples. El Bono Joven al Alquiler no estaría disponible para tu situación actual.
                Consulta otras ayudas al alquiler disponibles en tu Comunidad Autónoma.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Próximos pasos */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><span aria-hidden="true">📋</span> Proceso de solicitud</h2>
        <div className={styles.pasosGrid}>
          {[
            { num: '1', titulo: 'Verifica disponibilidad en tu CA', desc: 'Cada Comunidad Autónoma gestiona su propia convocatoria. Algunas están activas todo el año, otras tienen plazos específicos.' },
            { num: '2', titulo: 'Reúne la documentación', desc: 'DNI/NIE, declaración de la renta, contrato de alquiler, certificado de empadronamiento y justificante de ingresos.' },
            { num: '3', titulo: 'Presenta la solicitud', desc: 'Normalmente se tramita online a través del portal de vivienda de tu CA o presencialmente en las oficinas de vivienda.' },
            { num: '4', titulo: 'Resolución y cobro', desc: 'El plazo de resolución varía por CA (3-6 meses). Una vez aprobado, la ayuda se abona mensualmente o de forma retroactiva.' },
          ].map(paso => (
            <div key={paso.num} className={styles.pasoCard}>
              <div className={styles.pasoNum} aria-hidden="true">{paso.num}</div>
              <div className={styles.pasoInfo}>
                <h3>{paso.titulo}</h3>
                <p>{paso.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <EducationalSection
        title="Guía completa del Bono Joven al Alquiler"
        subtitle="Todo lo que necesitas saber sobre esta ayuda estatal"
      >
        {/* Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>Comparativa: Bono Joven vs otras ayudas al alquiler</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>Ayuda</th>
                  <th>Cuantía</th>
                  <th>Duración</th>
                  <th>Edad límite</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Bono Joven al Alquiler 2026-2030 (estatal)</td>
                  <td>Hasta 300 €/mes (vivienda) · 200 €/mes (habitación)</td>
                  <td>Hasta 4 años (2+2)</td>
                  <td>≤35 años</td>
                </tr>
                <tr>
                  <td>Ayudas al alquiler de la CA</td>
                  <td>Variable (30-40% renta)</td>
                  <td>Variable (1-3 años)</td>
                  <td>Sin límite (en general)</td>
                </tr>
                <tr>
                  <td>Renta Básica de Emancipación (derogada)</td>
                  <td>210 €/mes</td>
                  <td>4 años</td>
                  <td>22-30 años</td>
                </tr>
                <tr>
                  <td>Deducción IRPF por alquiler (estatal)</td>
                  <td>Derogada (solo CCAA)</td>
                  <td>Anual</td>
                  <td>Sin límite general</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Escenarios */}
        <section className={styles.guideSection}>
          <h2>Casos prácticos: ¿cuánto ahorras?</h2>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">👩‍🎓</span>
              <h3>Recién graduada, 23 años</h3>
              <p>Alquiler de 600 €/mes (vivienda). Bono de 300 €/mes (el 50%, por debajo del límite del 60%). Paga 300 €/mes real. En 4 años ahorra 14.400 €.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">👨‍💼</span>
              <h3>Trabajador de 32 años</h3>
              <p>Alquiler de 800 €/mes. El bono máximo es 300 €/mes (el 37,5% de la renta, dentro del límite del 60%). Paga 500 €/mes reales.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">👫</span>
              <h3>Pareja joven, ambos ≤35</h3>
              <p>Solo uno de los titulares puede beneficiarse del bono. Si ambos cumplen, el bono se asigna a uno. Conviene revisar quién tiene mejor perfil para la solicitud.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🏙️</span>
              <h3>Habitación en piso compartido</h3>
              <p>El Plan 2026-2030 incluye expresamente la modalidad de habitación: hasta 200 €/mes. Alquiler de 350 €/mes por habitación → bono de 200 €/mes (57%, dentro del límite del 60%).</p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre el Bono Joven</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>¿Se puede pedir el bono si ya tengo contrato firmado?</h3>
              <p>Sí, en la mayoría de las CCAA puedes solicitar el Bono Joven aunque el contrato ya esté vigente. La ayuda suele ser retroactiva desde la fecha de solicitud.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué pasa si cumplo 36 años mientras cobro el bono?</h3>
              <p>En general, si cumples los requisitos al inicio, el bono se mantiene durante todo el período (hasta 4 años) aunque cumplas 36 años durante el cobro. Consulta con tu CA para confirmarlo, ya que la renovación tras los 2 primeros años puede requerir nueva evaluación.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Es compatible el bono con otras ayudas?</h3>
              <p>Depende de cada CA. Algunas permiten compatibilidad con ayudas autonómicas al alquiler, otras no. La deducción en el IRPF autonómica por alquiler también puede ser compatible según la normativa de cada región.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué ocurre si cambio de piso durante el periodo de cobro?</h3>
              <p>Generalmente debes comunicarlo a la CA. Según los casos, la ayuda puede mantenerse si el nuevo piso también cumple los requisitos, o es necesario iniciar una nueva solicitud.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿El propietario del piso debe cumplir algún requisito?</h3>
              <p>El propietario no puede ser familiar hasta segundo grado del solicitante. Además, el piso no puede ser de protección oficial en algunos casos. El contrato debe ser legal y vigente.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cuánto tarda en resolverse la solicitud?</h3>
              <p>El plazo varía mucho por Comunidad Autónoma: desde 1-2 meses en algunas hasta 6 meses en otras. Es recomendable solicitarlo cuanto antes, ya que muchas CCAA agotan los fondos antes de fin de año.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Se puede pedir si tengo contrato de habitación?</h3>
              <p>Depende de la CA. Algunas aceptan contratos de habitación en pisos compartidos; otras solo pisos completos. Consulta la normativa específica de tu Comunidad Autónoma.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué pasa si mis ingresos suben durante el cobro?</h3>
              <p>Algunas CCAA realizan comprobaciones periódicas de ingresos. Si superas el límite de ingresos establecido por tu CA durante el cobro, podrías perder la ayuda. Informa siempre a tu CA de cualquier cambio relevante en tu situación económica.</p>
            </div>
          </div>
        </section>

        {/* Guía pasos */}
        <section className={styles.guideSection}>
          <h2>Documentación que necesitarás</h2>
          <div className={styles.stepsGrid}>
            {[
              { n: '1', titulo: 'DNI o NIE vigente', desc: 'Documento de identidad en vigor. Si eres extranjero comunitario, también sirve el certificado de registro.' },
              { n: '2', titulo: 'Última declaración de IRPF', desc: 'O certificado de imputaciones de IRPF si no estás obligado a declarar. Justifica tus ingresos.' },
              { n: '3', titulo: 'Contrato de arrendamiento', desc: 'Copia del contrato vigente con fecha, partes, renta mensual y duración. Debe estar firmado por ambas partes.' },
              { n: '4', titulo: 'Certificado de empadronamiento', desc: 'Que acredite que el piso alquilado es tu residencia habitual. Reciente (no más de 3 meses).' },
              { n: '5', titulo: 'Datos bancarios', desc: 'Número de cuenta (IBAN) donde quieres recibir la ayuda, de titularidad del solicitante.' },
              { n: '6', titulo: 'Declaración responsable', desc: 'Formulario propio de la CA donde declaras que cumples los requisitos. Suele incluirse en el formulario de solicitud.' },
            ].map(s => (
              <div key={s.n} className={styles.stepCard}>
                <div className={styles.stepNum} aria-hidden="true">{s.n}</div>
                <h3>{s.titulo}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className={styles.guideSection}>
          <h2>6 consejos para maximizar tus posibilidades</h2>
          <div className={styles.tipsGrid}>
            {[
              { icon: '⚡', titulo: 'Solicita cuanto antes', desc: 'Muchas CCAA agotan los fondos. No esperes: solicita el bono en cuanto tengas el contrato firmado.' },
              { icon: '📋', titulo: 'Prepara la documentación completa', desc: 'Una solicitud incompleta genera retrasos. Revisa la lista de documentos de tu CA antes de presentar.' },
              { icon: '🔍', titulo: 'Consulta el límite de renta de tu CA', desc: 'El límite general es 600 €/mes, pero tu CA puede ampliarlo hasta 900 € en zonas tensionadas. Infórmate.' },
              { icon: '💡', titulo: 'Comprueba la deducción autonómica IRPF', desc: 'Aparte del bono, muchas CCAA tienen deducción en el IRPF por alquiler de vivienda habitual. Puedes acumular ambas.' },
              { icon: '📱', titulo: 'Activa notificaciones en la sede electrónica', desc: 'La CA puede pedir documentación adicional. Deja activadas las notificaciones para no perder plazos de respuesta.' },
              { icon: '🤝', titulo: 'Involucra al propietario', desc: 'El propietario puede necesitar aportar documentación (datos catastrales, etc.). Informa al arrendador con antelación.' },
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
          <h2>⚠️ Advertencias importantes</h2>
          <div className={styles.warningGrid}>
            {[
              { titulo: 'Los fondos son limitados y se agotan', desc: 'El Estado transfiere fondos a las CCAA, pero estos son finitos. Cada año puede haber convocatorias distintas o sin fondos disponibles.' },
              { titulo: 'Cada CA tiene sus propias condiciones', desc: 'Los requisitos, límites de renta, duración y documentación varían significativamente según tu Comunidad Autónoma. Consulta siempre la normativa específica.' },
              { titulo: 'El fraude puede conllevar devolución + sanción', desc: 'Si se detecta que no cumplías los requisitos, deberás devolver todo lo cobrado más posibles sanciones. Declara siempre tu situación real.' },
              { titulo: 'La retroactividad no está garantizada en todas las CCAA', desc: 'Algunas CCAA pagan desde la fecha de solicitud, no desde el inicio del contrato. Solicita cuanto antes para no perder mensualidades.' },
            ].map(w => (
              <div key={w.titulo} className={styles.warningItem}>
                <strong>{w.titulo}</strong>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-bono-joven-alquiler')} />
      <ShareCard appName="simulador-bono-joven-alquiler" />
      <Footer appName="simulador-bono-joven-alquiler" />
    </div>
  );
}
