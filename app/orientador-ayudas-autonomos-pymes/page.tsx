'use client';

import { useState, useMemo } from 'react';
import styles from './OrientadorAyudasAutonomosPymes.module.css';
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
  CATEGORIAS_AYUDAS,
  FISCAL_AYUDAS_PUBLICAS_META,
  type FiguraNegocio,
  type ObjetivoAyuda,
  type PerfilAyuda,
} from '@/data/fiscal';

const FIGURAS: { id: FiguraNegocio; icono: string; titulo: string; subtitulo: string }[] = [
  { id: 'nueva', icono: '🌱', titulo: 'Voy a empezar', subtitulo: 'Alta nueva o menos de 1 año de actividad' },
  { id: 'autonomo', icono: '🧑‍💼', titulo: 'Autónomo/a en activo', subtitulo: 'Ya estoy dado de alta' },
  { id: 'pyme', icono: '🏢', titulo: 'Pyme o cooperativa', subtitulo: 'Microempresa, SL o cooperativa' },
  { id: 'startup', icono: '🚀', titulo: 'Startup tecnológica', subtitulo: 'Empresa innovadora de base tecnológica' },
];

const OBJETIVOS: { id: ObjetivoAyuda; icono: string; label: string }[] = [
  { id: 'empezar', icono: '🌱', label: 'Dar el primer paso o poner en marcha mi negocio' },
  { id: 'financiacion', icono: '💶', label: 'Conseguir financiación (préstamo, aval, capital)' },
  { id: 'contratar', icono: '🤝', label: 'Contratar personal' },
  { id: 'digitalizar', icono: '💻', label: 'Digitalizar mi negocio (web, software, ciberseguridad)' },
  { id: 'innovar', icono: '🔬', label: 'Innovar o desarrollar nuevos productos (I+D+i)' },
  { id: 'sostenibilidad', icono: '♻️', label: 'Mejorar eficiencia energética o sostenibilidad' },
  { id: 'exportar', icono: '🌍', label: 'Exportar o crecer fuera de España' },
  { id: 'formacion', icono: '🎓', label: 'Formación para mí o para mi equipo' },
];

const PERFILES: { id: PerfilAyuda; icono: string; label: string }[] = [
  { id: 'mujer', icono: '👩', label: 'Soy mujer' },
  { id: 'joven', icono: '🧑‍🎓', label: 'Tengo menos de 35 años' },
  { id: 'mayor45', icono: '🧑‍🦳', label: 'Tengo más de 45 años o soy parado/a de larga duración' },
  { id: 'discapacidad', icono: '♿', label: 'Tengo una discapacidad reconocida' },
  { id: 'rural', icono: '🌾', label: 'Mi actividad está en una zona rural o de baja densidad' },
];

export default function OrientadorAyudasAutonomosPymesPage() {
  const [figura, setFigura] = useState<FiguraNegocio | null>(null);
  const [objetivos, setObjetivos] = useState<ObjetivoAyuda[]>([]);
  const [perfiles, setPerfiles] = useState<PerfilAyuda[]>([]);

  const toggleObjetivo = (id: ObjetivoAyuda) => {
    setObjetivos(prev => (prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]));
  };

  const togglePerfil = (id: PerfilAyuda) => {
    setPerfiles(prev => (prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]));
  };

  const resultado = useMemo(() => {
    return CATEGORIAS_AYUDAS.filter(cat => {
      if (cat.siempre) return true;
      if (!figura) return false;
      if (!cat.figuras.includes(figura)) return false;
      if (objetivos.length === 0 && perfiles.length === 0) return true;
      const matchObjetivo = cat.objetivos.some(o => objetivos.includes(o));
      const matchPerfil = cat.perfiles.some(p => perfiles.includes(p));
      return matchObjetivo || matchPerfil;
    });
  }, [figura, objetivos, perfiles]);

  const totalEspecificas = resultado.filter(c => !c.siempre).length;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🎁</div>
        <h1 className={styles.title}>Orientador de Ayudas para Autónomos y Pymes</h1>
        <p className={styles.subtitle}>
          Descubre qué ayudas, subvenciones y financiación pública pueden encajar con tu situación
        </p>
        <p className={styles.heroNote}>Categorías estables · Enlaces a organismos oficiales · Buscador BDNS</p>
      </header>

      <LegalNotice />

      <RegionBadge variant="es-only" />

      <DisclaimerCard
        variant="financial"
        severity="critical"
        collapsible={false}
        context="Esta herramienta describe TIPOS de ayuda (programas marco), no convocatorias activas concretas. Las convocatorias cambian varias veces al año y tienen presupuesto limitado: consulta siempre BDNS (infosubvenciones.es) y al organismo gestor antes de tomar decisiones, y valora contar con un gestor o asesor especializado."
      />

      <DataReference
        normativa="Ayudas y financiación pública para autónomos y pymes"
        fuente={FISCAL_AYUDAS_PUBLICAS_META.fuente}
        verificado={FISCAL_AYUDAS_PUBLICAS_META.verificado}
        urlOficial={FISCAL_AYUDAS_PUBLICAS_META.urlOficial}
        nota={FISCAL_AYUDAS_PUBLICAS_META.nota}
      />

      <div className={styles.infoBanner}>
        <span aria-hidden="true">ℹ️</span>
        <span>
          Este orientador <strong>no es un listado de convocatorias activas</strong> (sería imposible mantenerlo al día:
          cambian varias veces al año y su presupuesto se agota). Te muestra <strong>tipos de ayuda</strong> que existen
          de forma estable, para que sepas qué buscar y dónde. Para ver qué está abierto <strong>ahora mismo</strong>,
          consulta el buscador oficial BDNS que aparece siempre en los resultados.
        </span>
      </div>

      {/* Paso 1: figura */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. ¿Cuál es tu situación?</h2>
        <div className={styles.figuraGrid}>
          {FIGURAS.map(f => (
            <button
              key={f.id}
              className={`${styles.figuraCard} ${figura === f.id ? styles.figuraActiva : ''}`}
              onClick={() => setFigura(f.id)}
              aria-pressed={figura === f.id}
            >
              <span className={styles.figuraIcon} aria-hidden="true">{f.icono}</span>
              <strong>{f.titulo}</strong>
              <span>{f.subtitulo}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Paso 2: objetivos */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. ¿Qué necesitas ahora mismo?</h2>
        <p className={styles.sectionHint}>Puedes marcar varias opciones</p>
        <div className={styles.checkboxGrid} role="group" aria-label="Necesidades">
          {OBJETIVOS.map(o => {
            const activo = objetivos.includes(o.id);
            return (
              <button
                key={o.id}
                className={`${styles.checkboxCard} ${activo ? styles.checkboxActivo : ''}`}
                onClick={() => toggleObjetivo(o.id)}
                aria-pressed={activo}
              >
                <span className={styles.checkboxEstado} aria-hidden="true">{activo ? '✅' : '⬜'}</span>
                <span className={styles.checkboxIcon} aria-hidden="true">{o.icono}</span>
                <span>{o.label}</span>
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
          {figura
            ? `📋 ${totalEspecificas} categorías para tu situación + recursos generales`
            : '📋 Recursos generales — selecciona tu situación para ver más'}
        </h2>
        {!figura && (
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
                  <a
                    href={cat.enlace.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.resultEnlace}
                    aria-label={`Información oficial en ${cat.enlace.texto} (se abre en nueva ventana)`}
                  >
                    {cat.enlace.texto} ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <EducationalSection
        title="📚 Guía: ayudas y financiación para autónomos y pymes"
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
                  <th>¿Hay que devolverlo?</th>
                  <th>Ejemplo</th>
                  <th>Cuándo lo notas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Subvención</td>
                  <td>No, cubre parte del gasto</td>
                  <td>Ayudas IDAE eficiencia energética</td>
                  <td>Te reembolsan o ingresan un % de la inversión</td>
                </tr>
                <tr>
                  <td>Préstamo / préstamo participativo</td>
                  <td>Sí, con intereses</td>
                  <td>ENISA, financiación CDTI</td>
                  <td>Recibes el dinero y lo devuelves en cuotas</td>
                </tr>
                <tr>
                  <td>Aval</td>
                  <td>No es dinero, es garantía</td>
                  <td>Avales ICO</td>
                  <td>El banco te concede más financiación</td>
                </tr>
                <tr>
                  <td>Bonificación</td>
                  <td>No aplica (reduce un coste)</td>
                  <td>Tarifa plana de autónomos</td>
                  <td>Pagas menos cuota a la Seguridad Social cada mes</td>
                </tr>
                <tr>
                  <td>Deducción fiscal</td>
                  <td>No aplica (reduce un impuesto)</td>
                  <td>Deducción por I+D+i</td>
                  <td>Pagas menos en tu declaración (IS o IRPF)</td>
                </tr>
                <tr>
                  <td>Bono / programa de apoyo</td>
                  <td>Variable según programa</td>
                  <td>Kit Digital</td>
                  <td>Un proveedor autorizado te factura el servicio</td>
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
              <span className={styles.scenarioIcon} aria-hidden="true">🌱</span>
              <h3>Te das de alta como autónomo/a por primera vez</h3>
              <p>
                Tarifa plana en la cuota desde el primer mes, posibilidad de capitalizar el paro si tenías prestación
                pendiente, y asesoramiento gratuito en tu Cámara de Comercio para resolver dudas iniciales.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">💻</span>
              <h3>Tu pyme quiere digitalizarse</h3>
              <p>
                El Kit Digital cubre el coste de soluciones de gestión, web o ciberseguridad a través de un agente
                digitalizador, mientras que tu Comunidad Autónoma puede tener líneas propias de apoyo a la digitalización.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🚀</span>
              <h3>Tu startup busca financiación para crecer</h3>
              <p>
                Un préstamo participativo de ENISA (sin avales) puede combinarse con financiación de CDTI si el
                proyecto tiene un componente de I+D+i, o con un aval ICO para acceder a más crédito bancario.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🌾</span>
              <h3>Eres autónoma en una zona rural y quieres contratar</h3>
              <p>
                Puedes acceder a una tarifa plana ampliada por residir en zona de baja densidad y, al contratar,
                aplicar bonificaciones reforzadas si la persona contratada pertenece a un colectivo bonificado.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>¿Qué ayudas existen para quien se da de alta como autónomo por primera vez?</h3>
              <p>
                Las más habituales son la tarifa plana en la cuota de autónomos (con extensiones según tu perfil), la
                capitalización de la prestación por desempleo si la tenías reconocida, y el asesoramiento gratuito de
                las Cámaras de Comercio. Mujeres, jóvenes, mayores de 45, personas con discapacidad o residentes en
                zonas rurales pueden acceder a duraciones o cuantías ampliadas en varias de estas ayudas.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Dónde puedo consultar las convocatorias de subvenciones activas en España?</h3>
              <p>
                La Base de Datos Nacional de Subvenciones (BDNS), en infosubvenciones.es, es el registro oficial donde
                se publican todas las convocatorias activas de cualquier administración: estatal, autonómica y local.
                Permite filtrar por tipo de beneficiario, sector y fecha, y es la fuente más fiable porque las
                convocatorias cambian varias veces al año.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué diferencia hay entre una subvención, un préstamo, un aval y una bonificación?</h3>
              <p>
                Una subvención suele cubrir parte del coste de un proyecto sin devolución. Un préstamo (como los de
                ENISA) hay que devolverlo, aunque en condiciones más favorables que un banco. Un aval (como el de ICO)
                no es dinero: es una garantía que facilita que el banco te conceda financiación. Una bonificación reduce
                lo que pagas (por ejemplo, tu cuota de autónomo) y una deducción fiscal reduce el impuesto que pagas en
                tu declaración.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Hay ayudas específicas para mujeres, jóvenes o personas con discapacidad que emprenden?</h3>
              <p>
                Sí. Existen programas como el PAEM (Programa de Apoyo Empresarial a las Mujeres) gestionado por las
                Cámaras de Comercio, líneas de ENISA orientadas a jóvenes emprendedores, y financiación específica de
                Fundación ONCE para personas con discapacidad. Además, varios de estos colectivos acceden a extensiones
                en la tarifa plana de autónomos y a bonificaciones reforzadas en la contratación.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Las ayudas autonómicas son compatibles con las ayudas estatales o europeas?</h3>
              <p>
                En muchos casos sí, pero depende de las bases reguladoras de cada convocatoria, que pueden establecer
                límites de acumulación o exigir que el conjunto de ayudas no supere un determinado porcentaje de la
                inversión. Antes de solicitar varias ayudas a la vez, conviene revisar las condiciones de
                compatibilidad de cada una en su convocatoria oficial.
              </p>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className={styles.guideSection}>
          <h2>4 consejos antes de solicitar una ayuda</h2>
          <div className={styles.tipsGrid}>
            {[
              { icon: '🔍', titulo: 'Empieza siempre por BDNS', desc: 'Antes de buscar por tu cuenta, consulta el buscador oficial de subvenciones (infosubvenciones.es) para ver qué convocatorias están abiertas ahora mismo en tu sector y comunidad.' },
              { icon: '📄', titulo: 'Lee las bases reguladoras completas', desc: 'Cada convocatoria tiene sus propios requisitos, plazos y documentación. Un detalle pequeño (fecha, forma jurídica, ubicación) puede dejarte fuera si no lo revisas antes.' },
              { icon: '🏛️', titulo: 'Pide cita en tu Cámara de Comercio', desc: 'El asesoramiento básico suele ser gratuito y te pueden orientar sobre qué ayudas encajan mejor con tu proyecto concreto, incluidas las autonómicas y locales.' },
              { icon: '🗂️', titulo: 'Guarda toda la documentación desde el principio', desc: 'Muchas ayudas exigen justificar después el gasto realizado (facturas, contratos, pagos). Organiza esa documentación desde el primer día para no tener problemas en la justificación.' },
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
          <h2>⚠️ Lo que debes saber antes de solicitar</h2>
          <div className={styles.warningGrid}>
            {[
              { titulo: 'El presupuesto suele ser limitado', desc: 'Muchas convocatorias se resuelven por orden de llegada o agotan su dotación antes de la fecha límite. Cuanto antes presentes la solicitud completa, mejor.' },
              { titulo: 'Algunas ayudas son incompatibles entre sí', desc: 'Las bases de cada convocatoria pueden limitar la acumulación de ayudas para un mismo gasto o proyecto. Revisa la compatibilidad antes de solicitar varias a la vez.' },
              { titulo: 'Una subvención puede generar obligaciones fiscales', desc: 'En general, el importe recibido tributa como ingreso en tu IRPF o Impuesto sobre Sociedades. Tenlo en cuenta al planificar tu fiscalidad.' },
              { titulo: 'Un préstamo no es dinero gratis', desc: 'Líneas como ENISA o ICO hay que devolverlas. Antes de solicitarlas, valora si tu negocio podrá asumir esa devolución en el plazo previsto.' },
            ].map(w => (
              <div key={w.titulo} className={styles.warningItem}>
                <strong>{w.titulo}</strong>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-ayudas-autonomos-pymes')} />
      <ShareCard appName="orientador-ayudas-autonomos-pymes" />
      <Footer appName="orientador-ayudas-autonomos-pymes" />
    </div>
  );
}
