'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from './OrientadorTramitesJubilacion.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard,
  RegionBadge,
  DataReference,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  CATEGORIAS_JUBILACION_TRAMITES,
  FISCAL_JUBILACION_TRAMITES_META,
  type SituacionJubilacion,
  type NecesidadJubilacion,
  type PerfilJubilacion,
} from '@/data/fiscal';

const SITUACIONES: { id: SituacionJubilacion; icono: string; titulo: string; subtitulo: string }[] = [
  { id: 'proximo-jubilarme', icono: '🚪', titulo: 'Voy a jubilarme próximamente', subtitulo: 'Quiero prepararlo con tiempo' },
  { id: 'ya-jubilado', icono: '🏖️', titulo: 'Ya estoy jubilado/a', subtitulo: 'Quiero revisar si me corresponde algo más' },
  { id: 'cuido-familiar-mayor', icono: '🤝', titulo: 'Cuido o ayudo a un familiar jubilado/mayor', subtitulo: 'Quiero conocer trámites y recursos disponibles' },
];

const NECESIDADES: { id: NecesidadJubilacion; icono: string; label: string }[] = [
  { id: 'solicitar-pension', icono: '📝', label: 'Solicitar la pensión de jubilación' },
  { id: 'conocer-cuantia', icono: '🧮', label: 'Saber cuánto voy a cobrar de pensión' },
  { id: 'ahorro-privado', icono: '💹', label: 'Planificar ahorro privado o un plan de pensiones' },
  { id: 'complemento-minimos', icono: '🏛️', label: 'Comprobar si tengo derecho al complemento a mínimos' },
  { id: 'complemento-brecha-genero', icono: '⚖️', label: 'Comprobar el complemento por brecha de género' },
  { id: 'fiscalidad-pension', icono: '📊', label: 'Saber cómo tributa mi pensión en el IRPF' },
  { id: 'servicios-mayores', icono: '🤲', label: 'Conocer servicios para mayores (teleasistencia, ayuda a domicilio...)' },
  { id: 'ocio-mayores', icono: '🎟️', label: 'Conocer descuentos y programas de ocio para mayores' },
];

const PERFILES: { id: PerfilJubilacion; icono: string; label: string }[] = [
  { id: 'autonomo', icono: '👔', label: 'Soy o he sido autónomo' },
  { id: 'viudo', icono: '💍', label: 'Soy viudo/a o podría necesitar una pensión de viudedad' },
  { id: 'dependencia', icono: '♿', label: 'Tengo o podría tener una situación de dependencia' },
  { id: 'bajos-ingresos', icono: '💶', label: 'Mis ingresos son bajos o ajustados' },
  { id: 'vivo-solo', icono: '🏠', label: 'Vivo solo/a' },
  { id: 'cuidador', icono: '🤲', label: 'Cuido a un familiar mayor o dependiente' },
];

export default function OrientadorTramitesJubilacionPage() {
  const [situacion, setSituacion] = useState<SituacionJubilacion | null>(null);
  const [necesidades, setNecesidades] = useState<NecesidadJubilacion[]>([]);
  const [perfiles, setPerfiles] = useState<PerfilJubilacion[]>([]);

  const toggleNecesidad = (id: NecesidadJubilacion) => {
    setNecesidades(prev => (prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]));
  };

  const togglePerfil = (id: PerfilJubilacion) => {
    setPerfiles(prev => (prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]));
  };

  const resultado = useMemo(() => {
    return CATEGORIAS_JUBILACION_TRAMITES.filter(cat => {
      if (cat.siempre) return true;
      if (!situacion) return false;
      if (!cat.situaciones.includes(situacion)) return false;
      if (necesidades.length === 0 && perfiles.length === 0) return true;
      const matchNecesidad = cat.objetivos.some(o => necesidades.includes(o));
      const matchPerfil = cat.perfiles.some(p => perfiles.includes(p));
      return matchNecesidad || matchPerfil;
    });
  }, [situacion, necesidades, perfiles]);

  const totalEspecificas = resultado.filter(c => !c.siempre).length;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🏖️</div>
        <h1 className={styles.title}>Orientador de Trámites de Jubilación</h1>
        <p className={styles.subtitle}>
          Descubre qué trámites, complementos y servicios relacionados con la jubilación pueden corresponderte y dónde gestionarlos
        </p>
        <p className={styles.heroNote}>Categorías estables · Enlaces a calculadoras y organismos oficiales · Sin importes ni promesas</p>
      </header>

      <LegalNotice />

      <RegionBadge variant="es-only" />

      <DisclaimerCard
        variant="financial"
        severity="critical"
        collapsible={false}
        context="Esta herramienta es solo orientativa: describe TIPOS de trámite, complemento o servicio relacionados con la jubilación (marcos normativos generales), no calcula cuantías, fechas ni la concesión de ningún complemento o prestación. Para una estimación con tus datos, usa las calculadoras de meskeIA enlazadas en cada categoría o el simulador 'Tu Seguridad Social'. Para iniciar cualquier trámite real, dirígete siempre a la Seguridad Social (INSS), la Agencia Tributaria o los Servicios Sociales de tu Comunidad Autónoma."
      />

      <DataReference
        normativa="Trámites y recursos de jubilación en España"
        fuente={FISCAL_JUBILACION_TRAMITES_META.fuente}
        verificado={FISCAL_JUBILACION_TRAMITES_META.verificado}
        urlOficial={FISCAL_JUBILACION_TRAMITES_META.urlOficial}
        nota={FISCAL_JUBILACION_TRAMITES_META.nota}
      />

      <div className={styles.infoBanner}>
        <span aria-hidden="true">ℹ️</span>
        <span>
          Este orientador <strong>no calcula tu pensión ni tramita nada por ti</strong>. Te muestra{' '}
          <strong>qué trámites, complementos y servicios</strong> existen según tu situación, con enlaces a la
          calculadora meskeIA específica o al organismo oficial correspondiente.
        </span>
      </div>

      {/* Paso 1: situación */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. ¿Cuál es tu situación?</h2>
        <div className={styles.figuraGrid}>
          {SITUACIONES.map(s => (
            <button
              key={s.id}
              className={`${styles.figuraCard} ${situacion === s.id ? styles.figuraActiva : ''}`}
              onClick={() => setSituacion(s.id)}
              aria-pressed={situacion === s.id}
            >
              <span className={styles.figuraIcon} aria-hidden="true">{s.icono}</span>
              <strong>{s.titulo}</strong>
              <span>{s.subtitulo}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Paso 2: necesidades */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. ¿Qué quieres resolver?</h2>
        <p className={styles.sectionHint}>Puedes marcar varias opciones</p>
        <div className={styles.checkboxGrid} role="group" aria-label="Necesidades">
          {NECESIDADES.map(n => {
            const activo = necesidades.includes(n.id);
            return (
              <button
                key={n.id}
                className={`${styles.checkboxCard} ${activo ? styles.checkboxActivo : ''}`}
                onClick={() => toggleNecesidad(n.id)}
                aria-pressed={activo}
              >
                <span className={styles.checkboxEstado} aria-hidden="true">{activo ? '✅' : '⬜'}</span>
                <span className={styles.checkboxIcon} aria-hidden="true">{n.icono}</span>
                <span>{n.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Paso 3: perfiles */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3. ¿Te identificas con alguna de estas situaciones?</h2>
        <p className={styles.sectionHint}>
          Opcional: varias categorías incluyen condiciones reforzadas para estos perfiles
        </p>
        <div className={styles.checkboxGrid} role="group" aria-label="Perfiles específicos">
          {PERFILES.map(p => {
            const activo = perfiles.includes(p.id);
            return (
              <button
                key={p.id}
                className={`${styles.checkboxCard} ${activo ? styles.checkboxActivo : ''}`}
                onClick={() => togglePerfil(p.id)}
                aria-pressed={activo}
              >
                <span className={styles.checkboxEstado} aria-hidden="true">{activo ? '✅' : '⬜'}</span>
                <span className={styles.checkboxIcon} aria-hidden="true">{p.icono}</span>
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Resultados */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle} aria-live="polite">
          {situacion
            ? `📋 ${totalEspecificas} categorías para tu situación + recursos generales`
            : '📋 Recursos generales — selecciona tu situación para ver más'}
        </h2>
        {!situacion && (
          <div className={styles.pendienteMsg}>
            Selecciona tu situación en el paso 1 para ver las categorías de trámite específicas.
          </div>
        )}
        <div className={styles.resultGrid} role="list">
          {resultado.map(cat => (
            <div key={cat.id} className={styles.resultCard} role="listitem">
              <div className={styles.resultHeader}>
                <span className={styles.resultIcon} aria-hidden="true">{cat.icono}</span>
                <div>
                  <h3 className={styles.resultTitulo}>{cat.nombre}</h3>
                  <span className={styles.resultTipoBadge}>{cat.tipo}</span>
                </div>
              </div>
              <p className={styles.resultDescripcion}>{cat.descripcion}</p>
              <p className={styles.resultComoFunciona}>
                <strong>¿Cómo funciona?</strong> {cat.comoFunciona}
              </p>
              <div className={styles.resultFooter}>
                <span className={styles.resultOrganismo}>{cat.organismo}</span>
                {cat.enlace && (
                  cat.enlace.url.startsWith('/') ? (
                    <Link href={cat.enlace.url} className={styles.resultEnlace}>
                      {cat.enlace.texto} →
                    </Link>
                  ) : (
                    <a
                      href={cat.enlace.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.resultEnlace}
                      aria-label={`Información oficial en ${cat.enlace.texto} (se abre en nueva ventana)`}
                    >
                      {cat.enlace.texto} ↗
                    </a>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <EducationalSection
        title="Guía: trámites de jubilación en España"
        subtitle="Qué solicitar, en qué orden y dónde gestionar cada trámite"
      >
        {/* Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>¿Quién gestiona cada trámite?</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>Trámite o recurso</th>
                  <th>Ámbito</th>
                  <th>Quién lo gestiona</th>
                  <th>Cuándo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Solicitud de la pensión</td>
                  <td>Estatal</td>
                  <td>Seguridad Social (INSS)</td>
                  <td>1-3 meses antes de la fecha deseada</td>
                </tr>
                <tr>
                  <td>Estimación de la cuantía</td>
                  <td>Estatal</td>
                  <td>Seguridad Social / meskeIA</td>
                  <td>Antes de decidir la fecha de jubilación</td>
                </tr>
                <tr>
                  <td>Complemento a mínimos</td>
                  <td>Estatal</td>
                  <td>Seguridad Social (INSS)</td>
                  <td>Se revisa al resolver la pensión</td>
                </tr>
                <tr>
                  <td>Complemento brecha de género</td>
                  <td>Estatal</td>
                  <td>Seguridad Social (INSS)</td>
                  <td>Junto a la solicitud o a posteriori</td>
                </tr>
                <tr>
                  <td>Tributación IRPF de la pensión</td>
                  <td>Estatal</td>
                  <td>Agencia Tributaria</td>
                  <td>Cada ejercicio fiscal</td>
                </tr>
                <tr>
                  <td>Servicios para mayores y dependencia</td>
                  <td>Autonómico / municipal</td>
                  <td>Comunidad Autónoma / Ayuntamiento</td>
                  <td>Cuando aparece la necesidad</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Escenarios */}
        <section className={styles.guideSection}>
          <h2>Ejemplos de combinaciones habituales</h2>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🚪</span>
              <h3>Te vas a jubilar en los próximos meses</h3>
              <p>
                Estima primero tu pensión con el simulador, comprueba si tendrías derecho a algún complemento y
                calcula tu IRPF como pensionista. Cuando tengas clara la fecha, solicita la pensión con 1-3 meses
                de antelación en la Sede Electrónica de la Seguridad Social.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🏖️</span>
              <h3>Ya estás jubilado/a y quieres revisar si te corresponde algo más</h3>
              <p>
                Comprueba el complemento a mínimos y el complemento por brecha de género: muchas personas no los
                solicitan por desconocimiento. Revisa también si tu pensión tributa correctamente en el IRPF según
                tu edad.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">💍</span>
              <h3>Has enviudado o podrías necesitar una pensión de viudedad</h3>
              <p>
                Usa el estimador de pensión de viudedad para tener una primera referencia del porcentaje y la
                cuantía aproximada antes de iniciar el trámite con la Seguridad Social.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🤝</span>
              <h3>Cuidas a un familiar mayor y necesitas apoyo</h3>
              <p>
                Infórmate sobre el grado de dependencia y los servicios de teleasistencia o ayuda a domicilio
                disponibles en tu zona, y consulta con los Servicios Sociales de tu Ayuntamiento qué recursos
                adicionales existen.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>¿Cuándo y cómo debo solicitar la pensión de jubilación?</h3>
              <p>
                La pensión de jubilación hay que solicitarla, no se concede automáticamente. Se recomienda iniciar
                el trámite con 1-3 meses de antelación a la fecha en la que dejarás de trabajar, ya que los efectos
                económicos retroactivos suelen estar limitados a los meses previos a la solicitud. Puedes
                solicitarla de forma telemática en la Sede Electrónica de la Seguridad Social (con certificado
                digital, Cl@ve o usuario y contraseña) o mediante cita previa presencial.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cómo sé cuánto voy a cobrar de pensión?</h3>
              <p>
                La cuantía depende de tu edad de jubilación, los años cotizados y tu base reguladora, calculada a
                partir de tus últimas bases de cotización. El Simulador de Jubilación Pública de meskeIA da una
                estimación orientativa con estos datos, incluyendo los coeficientes reductores de la jubilación
                anticipada. Para una cifra oficial con tus datos reales, usa el simulador de &quot;Tu Seguridad
                Social&quot; en la sede electrónica.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué son el complemento a mínimos y el complemento por brecha de género?</h3>
              <p>
                El complemento a mínimos eleva tu pensión hasta el importe mínimo garantizado si tu cuantía
                calculada queda por debajo y el conjunto de tus rentas no supera ciertos límites anuales. El
                complemento por brecha de género es un importe adicional por cada hijo o hija (hasta un máximo) para
                compensar el impacto de la maternidad o paternidad en la cotización; tras la sentencia del TJUE de
                2025 puede solicitarlo tanto la madre como el padre. Ambos son compatibles entre sí cuando se cumplen
                los requisitos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cómo tributa la pensión en el IRPF?</h3>
              <p>
                Las pensiones públicas tributan como rendimientos del trabajo en el IRPF, pero existen un mínimo
                personal incrementado a partir de los 65 y los 75 años, y la reducción general por rendimientos del
                trabajo, que reducen la base imponible. El Estimador IRPF Pensionista de meskeIA calcula de forma
                orientativa la retención y el IRPF anual aproximado a partir de tu pensión y tu edad.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué servicios existen para mayores que necesitan ayuda en el día a día?</h3>
              <p>
                Existen servicios como la teleasistencia, la ayuda a domicilio, los centros de día y las
                prestaciones económicas del Sistema para la Autonomía y Atención a la Dependencia (SAAD), gestionados
                por cada Comunidad Autónoma. La mayoría requieren el reconocimiento previo de un grado de dependencia
                mediante el Baremo de Valoración de la Dependencia (BVD). Además, los pensionistas pueden acceder a
                programas de turismo social del IMSERSO, la Tarjeta Dorada de Renfe y descuentos en museos y
                transporte.
              </p>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className={styles.guideSection}>
          <h2>4 consejos antes de jubilarte</h2>
          <div className={styles.tipsGrid}>
            {[
              { icon: '🔐', titulo: 'Consulta tu vida laboral en "Tu Seguridad Social"', desc: 'Antes de decidir la fecha de jubilación, revisa que tus años y bases de cotización estén correctos: cualquier error puede afectar a tu pensión y es más fácil corregirlo antes de solicitarla.' },
              { icon: '🏛️', titulo: 'Revisa los complementos antes de cerrar el expediente', desc: 'El complemento a mínimos y el complemento por brecha de género no siempre se aplican de oficio. Compruébalos con las calculadoras y, si crees que te corresponden, pregunta expresamente al tramitar tu pensión.' },
              { icon: '💹', titulo: 'Planifica el orden de tus rentas', desc: 'Si además de la pensión tienes un plan de pensiones u otros ahorros, el orden y el momento en que los rescates puede cambiar significativamente tu IRPF. Conviene planificarlo con antelación.' },
              { icon: '🆘', titulo: 'Si necesitas apoyo para el día a día, empieza por Servicios Sociales', desc: 'Para teleasistencia, ayuda a domicilio o cualquier duda sobre recursos para mayores en tu municipio, los Servicios Sociales de tu Ayuntamiento son el punto de partida más directo.' },
            ].map(t => (
              <div key={t.titulo} className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">{t.icon}</span>
                <h3>{t.titulo}</h3>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Warning */}
        <section className={styles.warningBox}>
          <h2>⚠️ Lo que debes saber antes de iniciar un trámite</h2>
          <div className={styles.warningGrid}>
            {[
              { titulo: 'No calcula tu pensión ni gestiona ningún trámite', desc: 'Esta herramienta describe tipos de trámite, complemento y servicio con carácter general. La cuantía real, la concesión de complementos y la resolución de cualquier prestación dependen de la Seguridad Social, la Agencia Tributaria o tu Comunidad Autónoma.' },
              { titulo: 'Los importes y umbrales se revisan cada año', desc: 'Las cuantías de pensión mínima, complementos, límites de renta y reducciones del IRPF se actualizan anualmente. Para una cifra concreta, usa siempre las calculadoras enlazadas o el simulador "Tu Seguridad Social".' },
              { titulo: 'Los plazos de solicitud importan', desc: 'Solicitar la pensión tarde puede hacerte perder los efectos económicos retroactivos de los meses previos. Infórmate con tiempo sobre el procedimiento y la documentación necesaria.' },
              { titulo: 'Los servicios para mayores dependen de tu región', desc: 'Teleasistencia, ayuda a domicilio, dependencia y muchos descuentos para mayores los gestiona tu Comunidad Autónoma o tu Ayuntamiento, con requisitos y plazos propios. Consulta siempre con los Servicios Sociales de tu zona.' },
            ].map(w => (
              <div key={w.titulo} className={styles.warningItem}>
                <strong>{w.titulo}</strong>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-tramites-jubilacion')} />
      <ShareCard appName="orientador-tramites-jubilacion" />
      <Footer appName="orientador-tramites-jubilacion" />
    </div>
  );
}
