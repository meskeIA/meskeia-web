'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from './OrientadorAyudasPersonasFamilias.module.css';
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
  CATEGORIAS_AYUDAS_PERSONAS,
  FISCAL_AYUDAS_PERSONAS_META,
  type SituacionPersonal,
  type NecesidadPersonal,
  type PerfilPersonal,
} from '@/data/fiscal';

const SITUACIONES: { id: SituacionPersonal; icono: string; titulo: string; subtitulo: string }[] = [
  { id: 'desempleo', icono: '🔍', titulo: 'Estoy en desempleo', subtitulo: 'He perdido mi empleo o lo voy a perder' },
  { id: 'bajos-ingresos', icono: '💶', titulo: 'Ingresos bajos o insuficientes', subtitulo: 'Mi hogar tiene dificultades económicas' },
  { id: 'familia-hijos', icono: '👨‍👩‍👧', titulo: 'Familia con hijos a cargo', subtitulo: 'Tengo hijos menores o familiares dependientes' },
  { id: 'jubilado', icono: '🧓', titulo: 'Jubilado/a o cerca de jubilarme', subtitulo: 'Estoy en edad de pensión o cerca' },
  { id: 'joven-emancipacion', icono: '🏠', titulo: 'Quiero independizarme', subtitulo: 'Busco mi primera vivienda en alquiler o compra' },
  { id: 'dependencia-discapacidad', icono: '♿', titulo: 'Dependencia o discapacidad', subtitulo: 'Yo o un familiar tenemos una situación de dependencia o discapacidad' },
];

const NECESIDADES: { id: NecesidadPersonal; icono: string; label: string }[] = [
  { id: 'ingresos-minimos', icono: '💶', label: 'Necesito un ingreso mínimo mensual' },
  { id: 'prestacion-paro', icono: '🔍', label: 'Quiero saber sobre la prestación o el subsidio por desempleo' },
  { id: 'ayuda-vivienda', icono: '🏠', label: 'Busco ayuda para alquiler o compra de vivienda' },
  { id: 'ayuda-energia', icono: '💡', label: 'Necesito ayuda con la factura de la luz' },
  { id: 'deducciones-familia', icono: '🧾', label: 'Quiero conocer deducciones fiscales por hijos o familiares' },
  { id: 'reconocimiento-discapacidad', icono: '♿', label: 'Quiero información sobre el reconocimiento de discapacidad' },
  { id: 'cuidado-dependiente', icono: '🤲', label: 'Cuido a una persona dependiente' },
  { id: 'formacion-empleo', icono: '🎓', label: 'Busco formación gratuita para encontrar empleo' },
];

const PERFILES: { id: PerfilPersonal; icono: string; label: string }[] = [
  { id: 'familia-numerosa', icono: '👨‍👩‍👧‍👦', label: 'Formo parte de una familia numerosa' },
  { id: 'monoparental', icono: '👩‍👧', label: 'Soy familia monoparental' },
  { id: 'joven', icono: '🧑‍🎓', label: 'Tengo menos de 35 años' },
  { id: 'mayor45', icono: '🧑‍🦳', label: 'Tengo más de 45 años' },
  { id: 'discapacidad', icono: '♿', label: 'Tengo una discapacidad reconocida' },
  { id: 'rural', icono: '🌾', label: 'Vivo en una zona rural o de baja densidad' },
  { id: 'violencia-genero', icono: '🆘', label: 'Soy víctima de violencia de género' },
];

export default function OrientadorAyudasPersonasFamiliasPage() {
  const [situacion, setSituacion] = useState<SituacionPersonal | null>(null);
  const [necesidades, setNecesidades] = useState<NecesidadPersonal[]>([]);
  const [perfiles, setPerfiles] = useState<PerfilPersonal[]>([]);

  const toggleNecesidad = (id: NecesidadPersonal) => {
    setNecesidades(prev => (prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]));
  };

  const togglePerfil = (id: PerfilPersonal) => {
    setPerfiles(prev => (prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]));
  };

  const resultado = useMemo(() => {
    return CATEGORIAS_AYUDAS_PERSONAS.filter(cat => {
      if (cat.siempre) return true;
      if (!situacion) return false;
      if (!cat.figuras.includes(situacion)) return false;
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
        <div className={styles.heroIcon} aria-hidden="true">🧭</div>
        <h1 className={styles.title}>Orientador de Ayudas y Prestaciones para Personas y Familias</h1>
        <p className={styles.subtitle}>
          Descubre qué tipos de ayudas y prestaciones sociales pueden encajar con tu situación personal o familiar
        </p>
        <p className={styles.heroNote}>Categorías estables · Enlaces a organismos oficiales · Sin importes ni promesas de elegibilidad</p>
      </header>

      <LegalNotice />

      <RegionBadge variant="es-only" />

      <DisclaimerCard
        variant="financial"
        severity="critical"
        collapsible={false}
        context="Esta herramienta es solo orientativa: describe TIPOS de ayuda y prestación (marcos normativos generales), no un cálculo de elegibilidad ni de cuantía. El acceso real a cada ayuda y su importe dependen de una valoración individual del organismo competente, a partir de tus datos concretos (ingresos, patrimonio, composición del hogar, cotizaciones...). Esta página no garantiza que tengas derecho a ninguna prestación. Para una estimación con tus datos reales, usa siempre los simuladores oficiales enlazados, y si tu situación es urgente acude a los Servicios Sociales de tu ayuntamiento."
      />

      <DataReference
        normativa="Ayudas y prestaciones sociales para personas y familias"
        fuente={FISCAL_AYUDAS_PERSONAS_META.fuente}
        verificado={FISCAL_AYUDAS_PERSONAS_META.verificado}
        urlOficial={FISCAL_AYUDAS_PERSONAS_META.urlOficial}
        nota={FISCAL_AYUDAS_PERSONAS_META.nota}
      />

      <div className={styles.infoBanner}>
        <span aria-hidden="true">ℹ️</span>
        <span>
          Este orientador <strong>no calcula si tienes derecho a una ayuda ni su importe</strong>. Te muestra{' '}
          <strong>tipos de ayuda</strong> que existen de forma estable, para que sepas qué buscar y dónde solicitar
          una valoración real. Para una estimación con tus datos, consulta siempre el simulador oficial de cada
          organismo.
        </span>
      </div>

      {/* Paso 1: situación */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. ¿Cuál es tu situación principal ahora mismo?</h2>
        <div className={styles.figuraGrid}>
          {SITUACIONES.map(s => (
            <button
              key={s.id}
              type="button"
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
        <h2 className={styles.sectionTitle}>2. ¿Qué tipo de ayuda buscas?</h2>
        <p className={styles.sectionHint}>Puedes marcar varias opciones</p>
        <div className={styles.checkboxGrid} role="group" aria-label="Necesidades">
          {NECESIDADES.map(n => {
            const activo = necesidades.includes(n.id);
            return (
              <button
                key={n.id}
                type="button"
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
          Opcional: varias categorías de ayuda incluyen condiciones reforzadas para estos perfiles
        </p>
        <div className={styles.checkboxGrid} role="group" aria-label="Perfiles específicos">
          {PERFILES.map(p => {
            const activo = perfiles.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
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
          <span aria-hidden="true">📋</span>{' '}
          {situacion
            ? `${totalEspecificas} categorías para tu situación + recursos generales`
            : 'Recursos generales — selecciona tu situación para ver más'}
        </h2>
        {!situacion && (
          <div className={styles.pendienteMsg}>
            Selecciona tu situación en el paso 1 para ver las categorías de ayuda específicas para ti.
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
        title="📚 Guía: ayudas y prestaciones sociales para personas y familias"
        subtitle="Tipos de ayuda, ejemplos prácticos y consejos antes de solicitar"
      >
        {/* Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>Tipos de ayuda: ¿qué significa cada uno?</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>¿Qué recibes?</th>
                  <th>Ejemplo</th>
                  <th>Cuándo lo notas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Prestación económica</td>
                  <td>Un ingreso mensual mientras se mantenga la situación</td>
                  <td>Ingreso Mínimo Vital, prestación por desempleo, pensión no contributiva</td>
                  <td>Recibes un importe periódico en tu cuenta</td>
                </tr>
                <tr>
                  <td>Descuento en factura</td>
                  <td>Una reducción del precio de un suministro</td>
                  <td>Bono social eléctrico</td>
                  <td>Tu factura de la luz llega con un porcentaje de descuento</td>
                </tr>
                <tr>
                  <td>Deducción / anticipo fiscal</td>
                  <td>Menos impuesto a pagar, o un anticipo mensual</td>
                  <td>Deducciones familiares del IRPF</td>
                  <td>Pagas menos en tu declaración o recibes un anticipo cada mes</td>
                </tr>
                <tr>
                  <td>Reconocimiento administrativo</td>
                  <td>Un certificado oficial que da acceso a otros beneficios</td>
                  <td>Grado de discapacidad o de dependencia</td>
                  <td>No es dinero directo, pero abre la puerta a otras ayudas</td>
                </tr>
                <tr>
                  <td>Ayuda local</td>
                  <td>Apoyo puntual gestionado por tu municipio</td>
                  <td>Ayudas de emergencia social, comedor escolar</td>
                  <td>Lo gestionan los Servicios Sociales de tu ayuntamiento</td>
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
              <span className={styles.scenarioIcon} aria-hidden="true">🔍</span>
              <h3>Te quedas sin trabajo y tienes una hipoteca o un alquiler</h3>
              <p>
                Comprueba primero si cumples los requisitos para la prestación o el subsidio por desempleo en el
                SEPE. Si tu situación económica es muy ajustada, el Ingreso Mínimo Vital y el bono social eléctrico
                pueden ser recursos adicionales a valorar con su simulador oficial.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">👨‍👩‍👧</span>
              <h3>Eres una familia numerosa con ingresos ajustados</h3>
              <p>
                Las deducciones familiares del IRPF (anticipables mes a mes) y el bono social eléctrico suelen tener
                condiciones reforzadas para familias numerosas. Revisa también si tu Comunidad Autónoma tiene ayudas
                propias para libros, comedor o material escolar.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🤲</span>
              <h3>Cuidas a un familiar mayor con dependencia</h3>
              <p>
                Empieza por el reconocimiento del grado de dependencia: a partir de ahí pueden corresponder
                prestaciones o servicios del SAAD (ayuda a domicilio, centro de día, prestación para cuidados en el
                entorno familiar) y deducciones fiscales por ascendiente a cargo.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🏠</span>
              <h3>Eres joven y quieres independizarte con pocos recursos</h3>
              <p>
                El Bono Joven de Alquiler, el aval ICO para primera vivienda o las ayudas a la vivienda en zona rural
                pueden reducir el esfuerzo económico inicial. Si además estás en desempleo, la formación gratuita
                para el empleo puede ayudarte a mejorar tu situación laboral mientras buscas vivienda.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>¿Qué es el Ingreso Mínimo Vital y quién puede solicitarlo?</h3>
              <p>
                El Ingreso Mínimo Vital (IMV) es una prestación mensual del INSS para hogares con ingresos y
                patrimonio por debajo de determinados umbrales, que varían según el número de personas que conviven
                en el hogar y su composición (menores, monoparentalidad, discapacidad...). No existe una cifra única:
                cada solicitud se valora de forma individual. El simulador oficial en imv.seg-social.es permite hacer
                una primera estimación con tus datos reales.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cómo sé si tengo derecho a la prestación o al subsidio por desempleo?</h3>
              <p>
                La prestación contributiva exige haber cotizado un mínimo de días en los últimos años y encontrarte
                en situación legal de desempleo (despido, fin de contrato, etc.). Si no cumples ese mínimo, existen
                subsidios para colectivos concretos: mayores de 45 años con cargas familiares, quienes agotan la
                prestación contributiva o quienes nunca llegaron al periodo mínimo cotizado. El SEPE dispone de un
                simulador que calcula tu situación a partir de tu vida laboral.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué es el bono social eléctrico y cómo se solicita?</h3>
              <p>
                El bono social eléctrico es un descuento sobre el precio de la luz para hogares vulnerables, que se
                solicita ante la comercializadora de referencia con contrato PVPC. El porcentaje de descuento depende
                del nivel de renta del hogar (medido en múltiplos del IPREM) y de la composición familiar, con
                condiciones reforzadas para familias numerosas, monoparentales o con personas con discapacidad o
                dependencia.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué deducciones fiscales existen por tener hijos o familiares a cargo?</h3>
              <p>
                La Agencia Tributaria reconoce deducciones por familia numerosa, por ascendiente o descendiente con
                discapacidad a cargo y por cada hijo menor de 3 años. Pueden cobrarse de forma anticipada cada mes
                solicitando el modelo 143, o aplicarse directamente en la declaración de la Renta. Son compatibles
                entre sí cuando se cumple más de un requisito a la vez.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Dónde puedo pedir ayuda si mi situación económica es urgente y no encajo en ninguna de estas categorías?</h3>
              <p>
                Los Servicios Sociales de tu ayuntamiento son el punto de partida recomendado para situaciones
                urgentes: gestionan ayudas de emergencia social, suministros básicos, alquiler o comedor escolar, con
                requisitos propios de cada municipio y comunidad autónoma. También puedes consultar el buscador
                oficial BDNS (infosubvenciones.es) para ver qué convocatorias están abiertas en tu zona.
              </p>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className={styles.guideSection}>
          <h2>4 consejos antes de solicitar una ayuda</h2>
          <div className={styles.tipsGrid}>
            {[
              { icon: '🏛️', titulo: 'Empieza por Servicios Sociales de tu ayuntamiento', desc: 'Pueden orientarte sobre el conjunto de ayudas municipales, autonómicas y estatales disponibles para tu situación concreta, y derivarte al organismo adecuado.' },
              { icon: '🧮', titulo: 'Usa los simuladores oficiales antes de solicitar', desc: 'El IMV (imv.seg-social.es) y el SEPE (sepe.es) ofrecen simuladores que calculan tu situación con tus datos reales, sin necesidad de presentar la solicitud.' },
              { icon: '🔄', titulo: 'Revisa la compatibilidad entre ayudas', desc: 'Algunas prestaciones son incompatibles entre sí o se descuentan unas de otras (por ejemplo, IMV y prestación por desempleo). Consulta esta compatibilidad antes de solicitar varias a la vez.' },
              { icon: '🗂️', titulo: 'Guarda toda la documentación acreditativa', desc: 'Empadronamiento, libro de familia, certificados de discapacidad o dependencia, declaraciones de la renta... Tener la documentación lista agiliza cualquier solicitud.' },
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
          <h2><span aria-hidden="true">⚠️</span> Lo que debes saber antes de solicitar</h2>
          <div className={styles.warningGrid}>
            {[
              { titulo: 'No garantiza que tengas derecho a ninguna ayuda', desc: 'Esta herramienta describe tipos de ayuda con carácter general. El acceso real depende de una valoración individual de tu situación por parte del organismo competente.' },
              { titulo: 'Las cuantías cambian cada año y no se muestran aquí', desc: 'Los importes, umbrales de renta y porcentajes se actualizan periódicamente. Para conocer la cifra que te correspondería, usa siempre el simulador oficial del organismo.' },
              { titulo: 'Algunas ayudas son incompatibles entre sí', desc: 'Por ejemplo, el IMV puede verse afectado por otras prestaciones que recibas. Revisa la compatibilidad en cada organismo antes de solicitar varias ayudas a la vez.' },
              { titulo: 'Si tu situación es urgente, acude a Servicios Sociales', desc: 'Para necesidades inmediatas (vivienda, alimentación, suministros), los Servicios Sociales de tu ayuntamiento pueden ofrecer respuestas más rápidas que las prestaciones estatales.' },
            ].map(w => (
              <div key={w.titulo} className={styles.warningItem}>
                <strong>{w.titulo}</strong>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-ayudas-personas-familias')} />
      <ShareCard appName="orientador-ayudas-personas-familias" />
      <Footer appName="orientador-ayudas-personas-familias" />
    </div>
  );
}
