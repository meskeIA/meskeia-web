'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from './OrientadorBecasAyudasEstudio.module.css';
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
  CATEGORIAS_BECAS_ESTUDIO,
  FISCAL_BECAS_ESTUDIO_META,
  type NivelEstudio,
  type NecesidadBeca,
  type PerfilBeca,
} from '@/data/fiscal';

const NIVELES: { id: NivelEstudio; icono: string; titulo: string; subtitulo: string }[] = [
  { id: 'educacion-obligatoria', icono: '🏫', titulo: 'Educación obligatoria', subtitulo: 'Infantil, primaria o secundaria' },
  { id: 'bachillerato-fp', icono: '📘', titulo: 'Bachillerato o Formación Profesional', subtitulo: 'Estudios postobligatorios no universitarios' },
  { id: 'universidad', icono: '🎓', titulo: 'Universidad', subtitulo: 'Grado, máster u otros estudios superiores' },
  { id: 'necesidades-educativas-especiales', icono: '🧩', titulo: 'Necesidades educativas especiales', subtitulo: 'El alumno tiene una NEAE reconocida o en valoración' },
];

const NECESIDADES: { id: NecesidadBeca; icono: string; label: string }[] = [
  { id: 'beca-general', icono: '🎓', label: 'Beca general para matrícula y gastos de estudio' },
  { id: 'comedor', icono: '🍽️', label: 'Ayuda para el comedor escolar' },
  { id: 'transporte', icono: '🚌', label: 'Ayuda de transporte escolar' },
  { id: 'libros-material', icono: '📚', label: 'Libros de texto o material escolar' },
  { id: 'residencia', icono: '🏠', label: 'Ayuda para residencia o desplazamiento fuera de mi localidad' },
  { id: 'apoyo-discapacidad', icono: '🧩', label: 'Apoyo educativo por discapacidad o necesidad especial' },
];

const PERFILES: { id: PerfilBeca; icono: string; label: string }[] = [
  { id: 'familia-numerosa', icono: '👨‍👩‍👧‍👦', label: 'Formo parte de una familia numerosa' },
  { id: 'monoparental', icono: '👩‍👧', label: 'Soy familia monoparental' },
  { id: 'renta-baja', icono: '💶', label: 'Mi unidad familiar tiene ingresos bajos' },
  { id: 'discapacidad', icono: '♿', label: 'El alumno o algún familiar tiene una discapacidad reconocida' },
  { id: 'rural', icono: '🌾', label: 'Vivimos en una zona rural o de baja densidad' },
  { id: 'violencia-genero', icono: '🆘', label: 'Situación de violencia de género en la familia' },
];

export default function OrientadorBecasAyudasEstudioPage() {
  const [nivel, setNivel] = useState<NivelEstudio | null>(null);
  const [necesidades, setNecesidades] = useState<NecesidadBeca[]>([]);
  const [perfiles, setPerfiles] = useState<PerfilBeca[]>([]);

  const toggleNecesidad = (id: NecesidadBeca) => {
    setNecesidades(prev => (prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]));
  };

  const togglePerfil = (id: PerfilBeca) => {
    setPerfiles(prev => (prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]));
  };

  const resultado = useMemo(() => {
    return CATEGORIAS_BECAS_ESTUDIO.filter(cat => {
      if (cat.siempre) return true;
      if (!nivel) return false;
      if (!cat.niveles.includes(nivel)) return false;
      if (necesidades.length === 0 && perfiles.length === 0) return true;
      const matchNecesidad = cat.objetivos.some(o => necesidades.includes(o));
      const matchPerfil = cat.perfiles.some(p => perfiles.includes(p));
      return matchNecesidad || matchPerfil;
    });
  }, [nivel, necesidades, perfiles]);

  const totalEspecificas = resultado.filter(c => !c.siempre).length;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🎓</div>
        <h1 className={styles.title}>Orientador de Becas y Ayudas al Estudio</h1>
        <p className={styles.subtitle}>
          Descubre qué tipos de becas y ayudas al estudio existen según el nivel educativo y la situación familiar
        </p>
        <p className={styles.heroNote}>Categorías estables · Enlaces a organismos oficiales · Sin importes ni promesas de concesión</p>
      </header>

      <LegalNotice />

      <RegionBadge variant="es-only" />

      <DisclaimerCard
        variant="financial"
        severity="critical"
        collapsible={false}
        context="Esta herramienta es solo orientativa: describe TIPOS de beca y ayuda al estudio (marcos normativos generales), no calcula la elegibilidad ni el importe que te correspondería. La concesión real depende de una valoración individual del organismo competente, a partir de tus datos concretos (renta, patrimonio, nota media, necesidad acreditada...). Además, la educación está mayoritariamente transferida a las Comunidades Autónomas: solo las becas generales (MEC) y las ayudas NEAE tienen criterios comunes en toda España (excepto País Vasco y Navarra); comedor, transporte y libros/material dependen de tu Comunidad Autónoma, ayuntamiento o centro educativo. Para una estimación con tus datos reales, usa siempre los simuladores y comprobadores oficiales enlazados."
      />

      <DataReference
        normativa="Becas y ayudas al estudio en España"
        fuente={FISCAL_BECAS_ESTUDIO_META.fuente}
        verificado={FISCAL_BECAS_ESTUDIO_META.verificado}
        urlOficial={FISCAL_BECAS_ESTUDIO_META.urlOficial}
        nota={FISCAL_BECAS_ESTUDIO_META.nota}
      />

      <div className={styles.infoBanner}>
        <span aria-hidden="true">ℹ️</span>
        <span>
          Este orientador <strong>no calcula si tienes derecho a una beca ni su importe</strong>. Te muestra{' '}
          <strong>tipos de beca y ayuda</strong> que existen de forma estable, para que sepas qué buscar y dónde
          solicitar una valoración real. Para una estimación con tus datos, consulta siempre el comprobador o
          simulador oficial de cada organismo.
        </span>
      </div>

      {/* Paso 1: nivel educativo */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. ¿Qué nivel educativo te interesa?</h2>
        <div className={styles.figuraGrid}>
          {NIVELES.map(n => (
            <button
              key={n.id}
              type="button"
              className={`${styles.figuraCard} ${nivel === n.id ? styles.figuraActiva : ''}`}
              onClick={() => setNivel(n.id)}
              aria-pressed={nivel === n.id}
            >
              <span className={styles.figuraIcon} aria-hidden="true">{n.icono}</span>
              <strong>{n.titulo}</strong>
              <span>{n.subtitulo}</span>
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
          {nivel
            ? `${totalEspecificas} categorías para tu situación + recursos generales`
            : 'Recursos generales — selecciona el nivel educativo para ver más'}
        </h2>
        {!nivel && (
          <div className={styles.pendienteMsg}>
            Selecciona el nivel educativo en el paso 1 para ver las categorías de beca específicas.
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
        title="📚 Guía: becas y ayudas al estudio en España"
        subtitle="Tipos de beca, ejemplos prácticos y consejos antes de solicitar"
      >
        {/* Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>¿Quién gestiona cada tipo de ayuda?</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>Ayuda</th>
                  <th>Ámbito</th>
                  <th>Quién la gestiona</th>
                  <th>Criterios</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Beca General (Bachillerato, FP, universidad)</td>
                  <td>Estatal</td>
                  <td>Ministerio de Educación, FP y Deportes</td>
                  <td>Comunes en toda España (salvo País Vasco y Navarra)</td>
                </tr>
                <tr>
                  <td>Ayuda NEAE</td>
                  <td>Estatal</td>
                  <td>Ministerio de Educación, FP y Deportes</td>
                  <td>Comunes, requiere informe de necesidad específica</td>
                </tr>
                <tr>
                  <td>Comedor escolar</td>
                  <td>Autonómico / municipal</td>
                  <td>Consejería de Educación, ayuntamiento o centro</td>
                  <td>Distintos en cada Comunidad Autónoma</td>
                </tr>
                <tr>
                  <td>Transporte escolar</td>
                  <td>Autonómico</td>
                  <td>Consejería de Educación</td>
                  <td>Distintos en cada Comunidad Autónoma</td>
                </tr>
                <tr>
                  <td>Libros y material escolar</td>
                  <td>Autonómico / municipal / centro</td>
                  <td>Consejería, ayuntamiento, AMPA o banco de libros</td>
                  <td>Distintos en cada Comunidad Autónoma</td>
                </tr>
                <tr>
                  <td>Becas propias autonómicas</td>
                  <td>Autonómico</td>
                  <td>Consejería de Educación</td>
                  <td>Convocatoria propia de cada región, compatible con la beca general</td>
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
              <span className={styles.scenarioIcon} aria-hidden="true">🎓</span>
              <h3>Vas a empezar Bachillerato, FP o universidad</h3>
              <p>
                Comprueba primero los tres requisitos de la Beca General (académico, económico y patrimonial) con el
                comprobador oficial del Ministerio. Si necesitas alojarte fuera de tu localidad, la beca puede incluir
                un componente de residencia o desplazamiento.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🧩</span>
              <h3>Tu hijo/a tiene una necesidad educativa especial</h3>
              <p>
                La ayuda NEAE del Ministerio puede cubrir refuerzo educativo, comedor, transporte o material adaptado,
                siempre que el equipo de orientación del centro emita el informe correspondiente y se cumplan los
                umbrales de renta del curso.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🍽️</span>
              <h3>Necesitas ayuda con el comedor, el transporte o los libros</h3>
              <p>
                Estas ayudas dependen de tu Comunidad Autónoma, tu ayuntamiento o el propio centro. La secretaría del
                centro educativo es el mejor punto de partida: te informará del procedimiento, los plazos y si existen
                programas de banco de libros o transporte gratuito en tu zona.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🏛️</span>
              <h3>Quieres saber si tu región ofrece algo más</h3>
              <p>
                Además de las becas estatales, muchas Comunidades Autónomas convocan ayudas propias (excelencia
                académica, conectividad, estudios en el extranjero...), normalmente compatibles con la beca general.
                Consulta la consejería de educación de tu región o el buscador BDNS.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>¿Qué es la Beca General de Estudios Postobligatorios y quién puede solicitarla?</h3>
              <p>
                Es la beca del Ministerio de Educación para Bachillerato, Formación Profesional, universidad y
                enseñanzas artísticas superiores. Su concesión depende de tres tipos de requisitos publicados cada
                curso: académico (nota media mínima), económico (la renta familiar debe estar por debajo de unos
                umbrales que determinan los componentes que recibes) y patrimonial (límites sobre inmuebles y
                rendimientos del capital). El comprobador oficial en becaseducacion.gob.es indica con tus datos reales
                qué umbral te correspondería.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué son las ayudas NEAE y para quién son?</h3>
              <p>
                Las ayudas para alumnado con Necesidad Específica de Apoyo Educativo (NEAE) son una convocatoria
                estatal para estudiantes de infantil, primaria, secundaria, bachillerato o FP con discapacidad,
                trastorno del desarrollo, TDAH, trastorno grave de conducta o de la comunicación, o altas capacidades.
                Según el caso, pueden cubrir refuerzo educativo, comedor, transporte, residencia y material específico,
                sujetas también a umbrales de renta familiar.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Quién gestiona las ayudas de comedor, transporte y libros escolares?</h3>
              <p>
                A diferencia de la beca general (estatal), estas ayudas dependen casi siempre de la Comunidad
                Autónoma, el ayuntamiento o el propio centro educativo, con requisitos, porcentajes de bonificación y
                plazos propios de cada región. La secretaría de tu centro o la consejería de educación de tu Comunidad
                Autónoma son la fuente más fiable para conocer el procedimiento exacto.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Las becas autonómicas son compatibles con la beca general del Ministerio?</h3>
              <p>
                En general sí, las convocatorias autonómicas (becas de excelencia, complementos, ayudas para material
                o conectividad) suelen ser compatibles con la beca general estatal, salvo que las bases de alguna de
                ellas indiquen lo contrario. Conviene revisar la compatibilidad en la convocatoria autonómica concreta
                antes de solicitar varias ayudas a la vez.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Dónde puedo pedir ayuda si necesito apoyo urgente para gastos escolares y no sé qué beca me corresponde?</h3>
              <p>
                Los Servicios Sociales de tu ayuntamiento pueden orientarte sobre el conjunto de ayudas municipales,
                autonómicas y estatales disponibles para tu situación, incluido apoyo para tramitar becas. También
                puedes consultar el buscador oficial BDNS (infosubvenciones.es) para ver qué convocatorias de becas
                están abiertas en tu zona.
              </p>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className={styles.guideSection}>
          <h2>4 consejos antes de solicitar una beca</h2>
          <div className={styles.tipsGrid}>
            {[
              { icon: '🧮', titulo: 'Usa el comprobador de requisitos antes de matricularte', desc: 'El simulador oficial de becaseducacion.gob.es indica, con tus datos reales de renta, patrimonio y nota, qué umbral y componentes de la beca general te corresponderían.' },
              { icon: '🏫', titulo: 'Pregunta en la secretaría de tu centro', desc: 'Para comedor, transporte, libros o material, el centro educativo suele ser el punto de información más directo sobre los programas vigentes en tu municipio y región.' },
              { icon: '📅', titulo: 'No dejes pasar los plazos', desc: 'Las becas y ayudas suelen tener convocatorias anuales con plazos cerrados, normalmente al inicio del curso. Presentar la solicitud fuera de plazo significa perder la ayuda ese curso.' },
              { icon: '🗂️', titulo: 'Guarda toda la documentación acreditativa', desc: 'Declaración de la renta, libro de familia, certificados de discapacidad o de necesidad específica, empadronamiento... Tener la documentación lista agiliza cualquier solicitud.' },
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
              { titulo: 'No garantiza que tengas derecho a ninguna beca', desc: 'Esta herramienta describe tipos de beca y ayuda con carácter general. La concesión real depende de una valoración individual de tu situación por parte del organismo competente.' },
              { titulo: 'Los umbrales de renta y las cuantías cambian cada curso', desc: 'Los importes, umbrales de renta, patrimonio y notas mínimas se publican en cada convocatoria anual. Para conocer la cifra que te correspondería, usa siempre el comprobador oficial del Ministerio de Educación.' },
              { titulo: 'Comedor, transporte y libros dependen de tu región', desc: 'No existe un sistema único: cada Comunidad Autónoma, ayuntamiento o centro educativo fija sus propios criterios. Consulta siempre con la secretaría de tu centro o la consejería de educación de tu región.' },
              { titulo: 'Si tu situación es urgente, acude a Servicios Sociales', desc: 'Para necesidades inmediatas (alimentación, material escolar), los Servicios Sociales de tu ayuntamiento pueden ofrecer respuestas más rápidas y orientarte sobre el conjunto de ayudas disponibles.' },
            ].map(w => (
              <div key={w.titulo} className={styles.warningItem}>
                <strong>{w.titulo}</strong>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-becas-ayudas-estudio')} />
      <ShareCard appName="orientador-becas-ayudas-estudio" />
      <Footer appName="orientador-becas-ayudas-estudio" />
    </div>
  );
}
