'use client';

import { useMemo, useRef, useState } from 'react';
import styles from './ConversorCnaeIae.module.css';
import {
  MeskeiaLogo,
  LegalNotice,
  RegionBadge,
  DisclaimerCard,
  DataReference,
  EducationalSection,
  RelatedApps,
  ShareCard,
  Footer,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  ACTIVIDADES_CNAE_IAE,
  CNAE_IAE_META,
  COBERTURA_CATALOGO,
  SECCIONES_IAE,
  buscarActividades,
  buscarPorCnae,
  buscarPorEpigrafeIae,
  normalizarTexto,
  type ActividadCnaeIae,
  type EpigrafeIAE,
  type SeccionIAE,
} from '@/data/fiscal/cnae-iae';

// ─── Modos de consulta ───────────────────────────────────────────────────────

type ModoBusqueda = 'actividad' | 'cnae' | 'iae';

interface ConfiguracionModo {
  id: ModoBusqueda;
  etiqueta: string;
  icono: string;
  titulo: string;
  ayuda: string;
  placeholder: string;
}

const MODOS: ConfiguracionModo[] = [
  {
    id: 'actividad',
    etiqueta: 'Por actividad',
    icono: '🔎',
    titulo: 'Describe tu actividad con tus palabras',
    ayuda:
      'No hace falta que uses el nombre oficial: escribe cómo se lo contarías a alguien. Buscamos también sobre términos coloquiales.',
    placeholder: 'hago páginas web, corto el pelo, vendo ropa por internet...',
  },
  {
    id: 'cnae',
    etiqueta: 'Desde un CNAE',
    icono: '🏷️',
    titulo: 'Introduce un código CNAE-2009',
    ayuda:
      'Escribe el código de 4 dígitos (o solo sus primeras cifras) y verás los epígrafes de IAE que suelen corresponderle.',
    placeholder: '6201',
  },
  {
    id: 'iae',
    etiqueta: 'Desde un epígrafe IAE',
    icono: '⚖️',
    titulo: 'Introduce un epígrafe del IAE',
    ayuda:
      'Escribe el epígrafe o grupo tal y como figura en las Tarifas (por ejemplo 763 o 505.6) y verás a qué CNAE se asocia.',
    placeholder: '763',
  },
];

const EJEMPLOS_BUSQUEDA: string[] = [
  'hago páginas web',
  'corto el pelo',
  'vendo ropa por internet',
  'soy fotógrafo',
  'clases particulares',
  'reformas',
  'traductora',
  'transportista',
];

const SECCION_POR_ID: Record<SeccionIAE, (typeof SECCIONES_IAE)[number]> = SECCIONES_IAE.reduce(
  (mapa, s) => {
    mapa[s.seccion] = s;
    return mapa;
  },
  {} as Record<SeccionIAE, (typeof SECCIONES_IAE)[number]>
);

/** Clase CSS del distintivo de color de cada sección del IAE */
function claseDeSeccion(seccion: SeccionIAE): string {
  if (seccion === '1ª') return styles.seccion1;
  if (seccion === '2ª') return styles.seccion2;
  return styles.seccion3;
}

// ─── Ordenación de candidatos ────────────────────────────────────────────────

/**
 * Ordena los candidatos por proximidad al término escrito: primero aquellos
 * cuyo sinónimo o denominación empieza por la consulta. No decide nada: solo
 * evita que lo más próximo quede sepultado al final de la lista.
 */
function ordenarPorProximidad(
  actividades: ActividadCnaeIae[],
  consulta: string
): ActividadCnaeIae[] {
  const q = normalizarTexto(consulta);
  if (!q) return actividades;

  const puntuar = (a: ActividadCnaeIae): number => {
    const sinonimos = a.sinonimos.map(normalizarTexto);
    if (sinonimos.includes(q)) return 0;
    if (sinonimos.some((s) => s.startsWith(q))) return 1;
    if (normalizarTexto(a.descripcionCnae).startsWith(q)) return 2;
    if (sinonimos.some((s) => s.includes(q))) return 3;
    return 4;
  };

  return [...actividades].sort((a, b) => puntuar(a) - puntuar(b));
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function ConversorCnaeIaePage() {
  const [modo, setModo] = useState<ModoBusqueda>('actividad');
  const [consulta, setConsulta] = useState('');
  const [abiertas, setAbiertas] = useState<string[]>([]);
  const campoRef = useRef<HTMLInputElement>(null);

  const modoActual = MODOS.find((m) => m.id === modo) ?? MODOS[0];

  const resultados = useMemo<ActividadCnaeIae[]>(() => {
    const termino = consulta.trim();
    if (termino.length < 2) return [];

    if (modo === 'cnae') {
      const digitos = termino.replace(/\D/g, '');
      if (digitos.length < 2) return [];
      const exacta = buscarPorCnae(digitos);
      if (exacta) return [exacta];
      return ACTIVIDADES_CNAE_IAE.filter((a) => a.cnae.startsWith(digitos));
    }

    if (modo === 'iae') {
      const codigo = termino.replace(/[^0-9.]/g, '');
      if (codigo.length < 2) return [];
      const exactas = buscarPorEpigrafeIae(codigo);
      if (exactas.length > 0) return exactas;
      return ACTIVIDADES_CNAE_IAE.filter((a) =>
        a.iae.some((e) => e.epigrafe.startsWith(codigo))
      );
    }

    return ordenarPorProximidad(buscarActividades(termino), termino);
  }, [consulta, modo]);

  const hayConsulta = consulta.trim().length >= 2;

  const cambiarModo = (nuevo: ModoBusqueda) => {
    setModo(nuevo);
    setConsulta('');
    setAbiertas([]);
    campoRef.current?.focus();
  };

  const usarEjemplo = (texto: string) => {
    setModo('actividad');
    setConsulta(texto);
    setAbiertas([]);
    campoRef.current?.focus();
  };

  const alternarFicha = (cnae: string) => {
    setAbiertas((previas) =>
      previas.includes(cnae) ? previas.filter((c) => c !== cnae) : [...previas, cnae]
    );
  };

  const mensajeResultados = !hayConsulta
    ? 'Escribe al menos dos caracteres para ver candidatos.'
    : resultados.length === 0
      ? 'Ninguna actividad del catálogo encaja con lo que has escrito.'
      : `${formatNumber(resultados.length, 0)} ${
          resultados.length === 1 ? 'actividad encaja' : 'actividades encajan'
        } con tu búsqueda.`;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor CNAE ⇄ IAE</h1>
        <p className={styles.subtitle}>
          Busca tu código CNAE y tu epígrafe de IAE describiendo tu actividad con tus
          palabras. Convierte en ambos sentidos y consulta qué implica cada sección.
        </p>
      </header>

      <LegalNotice />

      <RegionBadge variant="es-only" />

      <DisclaimerCard
        variant="financial"
        severity="high"
        collapsible={false}
        title="Antes de usar estos códigos en tu alta"
      >
        <p>
          Esta herramienta <strong>orienta, no decide</strong>. La correspondencia entre el
          CNAE y el IAE no es oficial ni biunívoca: no existe una tabla de equivalencia
          publicada, un mismo CNAE admite varios epígrafes y un mismo epígrafe puede
          corresponder a varios CNAE. Lo que verás son <strong>candidatos</strong>, nunca un
          veredicto.
        </p>
        <p>
          Elegir el epígrafe equivocado tiene consecuencias reales: afecta a la retención de
          IRPF de tus facturas, al régimen de IVA y a tus obligaciones censales. Antes de
          presentar el modelo 036 o 037, contrasta el resultado con la Agencia Tributaria o
          con un asesor fiscal.
        </p>
      </DisclaimerCard>

      <DataReference
        normativa="CNAE-2009 e IAE (Tarifas vigentes)"
        fuente={CNAE_IAE_META.fuente}
        verificado={CNAE_IAE_META.verificado}
        urlOficial={CNAE_IAE_META.urlOficialIae}
        nota="Catálogo curado de las actividades más frecuentes en altas de autónomo, no el listado completo del INE ni de las Tarifas del IAE."
      />

      {/* ─── Buscador / conversor ─────────────────────────────────────────── */}
      <section className={styles.buscadorPanel} aria-labelledby="titulo-buscador">
        <h2 id="titulo-buscador" className={styles.buscadorTitulo}>
          <span aria-hidden="true">🧭</span> Localiza tu actividad
        </h2>

        <div className={styles.modos} role="group" aria-label="Forma de búsqueda">
          {MODOS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`${styles.modoBtn} ${modo === m.id ? styles.modoBtnActivo : ''}`}
              aria-pressed={modo === m.id}
              onClick={() => cambiarModo(m.id)}
            >
              <span aria-hidden="true">{m.icono}</span> {m.etiqueta}
            </button>
          ))}
        </div>

        <div className={styles.campo}>
          <label className={styles.label} htmlFor="campo-consulta">
            {modoActual.titulo}
          </label>
          <input
            id="campo-consulta"
            ref={campoRef}
            className={styles.input}
            type="search"
            autoFocus
            autoComplete="off"
            inputMode={modo === 'actividad' ? 'text' : 'numeric'}
            value={consulta}
            placeholder={modoActual.placeholder}
            aria-describedby="ayuda-consulta"
            onChange={(e) => setConsulta(e.target.value)}
          />
          <p id="ayuda-consulta" className={styles.ayuda}>
            {modoActual.ayuda}
          </p>
        </div>

        {modo === 'actividad' && (
          <div className={styles.ejemplos}>
            <span className={styles.ejemplosEtiqueta}>Prueba con:</span>
            {EJEMPLOS_BUSQUEDA.map((ejemplo) => (
              <button
                key={ejemplo}
                type="button"
                className={styles.ejemploBtn}
                onClick={() => usarEjemplo(ejemplo)}
              >
                {ejemplo}
              </button>
            ))}
          </div>
        )}

        <p className={styles.contador} role="status" aria-live="polite">
          {mensajeResultados}
        </p>

        {hayConsulta && resultados.length === 0 && (
          <div className={styles.sinResultados}>
            <p>
              <strong>Que no aparezca no significa que no exista.</strong> Este catálogo
              recoge {formatNumber(COBERTURA_CATALOGO.totalActividades, 0)} actividades, las
              más frecuentes en altas de autónomo; la CNAE-2009 completa tiene alrededor de
              700 clases y las Tarifas del IAE, miles de epígrafes.
            </p>
            <ul>
              <li>Prueba con una palabra más corta o con otro término coloquial.</li>
              <li>
                Consulta el listado completo en el{' '}
                <a href={CNAE_IAE_META.urlOficialCnae} target="_blank" rel="noopener noreferrer">
                  buscador de la CNAE-2009 del INE
                </a>{' '}
                y en la{' '}
                <a href={CNAE_IAE_META.urlOficialIae} target="_blank" rel="noopener noreferrer">
                  sede electrónica de la AEAT
                </a>
                .
              </li>
            </ul>
          </div>
        )}

        {/* Fichas de resultado */}
        {resultados.length > 0 && (
          <ul className={styles.listaResultados}>
            {resultados.map((actividad) => (
              <li key={actividad.cnae}>
                <FichaActividad
                  actividad={actividad}
                  abierta={abiertas.includes(actividad.cnae)}
                  onToggle={() => alternarFicha(actividad.cnae)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ─── Secciones del IAE ─────────────────────────────────────────────── */}
      <section className={styles.seccionesPanel} aria-labelledby="titulo-secciones">
        <h2 id="titulo-secciones" className={styles.panelTitulo}>
          <span aria-hidden="true">📑</span> Qué significan las secciones del IAE
        </h2>
        <p className={styles.panelIntro}>
          Las Tarifas del IAE se dividen en tres secciones. La sección de tu epígrafe no es
          un detalle administrativo: determina si tus facturas llevan retención de IRPF.
        </p>
        <div className={styles.seccionesGrid}>
          {SECCIONES_IAE.map((s) => (
            <article key={s.seccion} className={styles.seccionCard}>
              <h3 className={styles.seccionCardTitulo}>
                <span className={`${styles.badgeSeccion} ${claseDeSeccion(s.seccion)}`}>
                  Sección {s.seccion}
                </span>
                {s.nombre}
              </h3>
              <p className={styles.seccionQuienes}>{s.quienes}</p>
              <p className={styles.seccionImplicacion}>
                <strong>En tus facturas:</strong> {s.implicacion}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ─── Transparencia sobre la cobertura ──────────────────────────────── */}
      <section className={styles.transparencia} aria-labelledby="titulo-transparencia">
        <h2 id="titulo-transparencia" className={styles.panelTitulo}>
          <span aria-hidden="true">🔍</span> Qué cubre este catálogo y qué no
        </h2>

        <div className={styles.statGrid}>
          <div className={styles.stat}>
            <span className={styles.statNum}>
              {formatNumber(COBERTURA_CATALOGO.totalActividades, 0)}
            </span>
            <span className={styles.statLabel}>actividades con código CNAE</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>
              {formatNumber(COBERTURA_CATALOGO.totalEpigrafes, 0)}
            </span>
            <span className={styles.statLabel}>epígrafes de IAE asociados</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>
              {formatNumber(COBERTURA_CATALOGO.epigrafesAltaConfianza, 0)}
            </span>
            <span className={styles.statLabel}>epígrafes contrastados</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>
              {formatNumber(COBERTURA_CATALOGO.epigrafesMediaConfianza, 0)}
            </span>
            <span className={styles.statLabel}>epígrafes que conviene verificar</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>
              {formatNumber(COBERTURA_CATALOGO.sinEpigrafeIae, 0)}
            </span>
            <span className={styles.statLabel}>actividades sin epígrafe verificado</span>
          </div>
        </div>

        <div className={styles.transparenciaTexto}>
          <p>
            <strong>Es un subconjunto curado, no el catálogo completo.</strong>{' '}
            {CNAE_IAE_META.cobertura}
          </p>
          <p>
            <strong>No hay equivalencia oficial.</strong> {CNAE_IAE_META.nota}
          </p>
          <p>
            <strong>Lo dudoso se declara como dudoso.</strong> Cada epígrafe lleva su nivel
            de certeza a la vista: los marcados como <em>conviene verificar</em> explican
            exactamente qué no está contrastado. {CNAE_IAE_META.escalaConfianza}
          </p>
          <p>
            Hay {formatNumber(COBERTURA_CATALOGO.sinEpigrafeIae, 0)} actividades para las que
            se conoce el CNAE pero <strong>no se incluye ningún epígrafe</strong>: entre
            ellas, el diseño gráfico y varias profesiones sanitarias no médicas. Aparecen en
            el buscador y se dice abiertamente que falta el dato, porque una ficha incompleta
            es preferible a una correspondencia inventada.
          </p>
        </div>
      </section>

      {/* ─── Contenido educativo v2.0 ──────────────────────────────────────── */}
      <EducationalSection
        icon="📚"
        title="CNAE e IAE: guía completa para el alta"
        subtitle="Qué es cada código, dónde te lo piden, qué implica la sección y cómo se corrige un error"
      >
        <section className={styles.guideSection}>
          <h2>Dos códigos, dos organismos, dos finalidades</h2>
          <p className={styles.introText}>
            Casi todo el lío viene de tratarlos como si fueran lo mismo. El{' '}
            <strong>CNAE</strong> es la Clasificación Nacional de Actividades Económicas que
            mantiene el INE (versión CNAE-2009, aprobada por el RD 475/2007). Su finalidad es{' '}
            <strong>estadística</strong>: sirve para saber cuánta gente hace qué en el país,
            y aparece en el alta en el RETA, en el Registro Mercantil o al abrir una cuenta
            bancaria de empresa. El <strong>epígrafe del IAE</strong> procede de las Tarifas
            del Impuesto sobre Actividades Económicas (RD Legislativo 1175/1990) y su
            finalidad es <strong>censal y tributaria</strong>: es el código que declaras a la
            AEAT en el modelo 036 o 037 y el que define, de hecho, cómo tributa tu actividad.
          </p>
          <p className={styles.introText}>
            No existe una tabla oficial que traduzca uno en otro. Por eso ninguna herramienta
            —esta tampoco— puede decirte «tu epígrafe es el X»: lo que se puede hacer es
            enseñarte los candidatos habituales para tu tipo de actividad y explicarte qué
            distingue a unos de otros para que la decisión final la tomes con criterio, o la
            contrastes con quien tenga responsabilidad profesional sobre ella.
          </p>

          {/* 1. Tabla comparativa */}
          <h2>CNAE frente a IAE, de un vistazo</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th scope="col">Criterio</th>
                  <th scope="col">CNAE-2009</th>
                  <th scope="col">Epígrafe IAE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Quién lo mantiene</strong>
                  </td>
                  <td>INE (RD 475/2007)</td>
                  <td>AEAT (RD Legislativo 1175/1990)</td>
                </tr>
                <tr>
                  <td>
                    <strong>Para qué sirve</strong>
                  </td>
                  <td>Clasificar la actividad con fines estadísticos</td>
                  <td>Registrar la actividad a efectos censales y tributarios</td>
                </tr>
                <tr>
                  <td>
                    <strong>Formato</strong>
                  </td>
                  <td>4 dígitos de clase (por ejemplo, 6201)</td>
                  <td>Grupo o epígrafe con posible sufijo (763, 505.6)</td>
                </tr>
                <tr>
                  <td>
                    <strong>Dónde te lo piden</strong>
                  </td>
                  <td>Alta en el RETA, bancos, subvenciones, mutua</td>
                  <td>Modelo 036 / 037, facturación, censo de empresarios</td>
                </tr>
                <tr>
                  <td>
                    <strong>Efecto sobre tus facturas</strong>
                  </td>
                  <td>Ninguno directo</td>
                  <td>La sección determina si procede retención de IRPF</td>
                </tr>
                <tr>
                  <td>
                    <strong>¿Se paga algo por él?</strong>
                  </td>
                  <td>No, es una clasificación</td>
                  <td>Es un impuesto, aunque la mayoría de autónomos está exenta</td>
                </tr>
                <tr>
                  <td>
                    <strong>¿Puedes tener varios?</strong>
                  </td>
                  <td>Se declara el principal de cada registro</td>
                  <td>Sí: tantos epígrafes como actividades ejerzas</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. Casos de uso */}
          <h2>Cuatro situaciones reales</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  💻
                </span>
                <h3>Desarrollo web por cuenta propia</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  <strong>Situación:</strong>
                </p>
                <code>
                  CNAE 6201 · Candidatos IAE: 763 (Sección 2ª) o 845 (Sección 1ª)
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Qué está en juego:</strong> el mismo trabajo admite dos encuadres. Sin
                estructura empresarial, el epígrafe 763 de la Sección 2ª; con local, equipo o
                personal organizado, el 845 de la Sección 1ª. La diferencia aparece en cada
                factura: con el 763 tus clientes empresa te retienen IRPF; con el 845, no.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  🛒
                </span>
                <h3>Tienda online</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  <strong>Situación:</strong>
                </p>
                <code>CNAE 4791 · IAE 665 (Sección 1ª)</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Qué está en juego:</strong> el 665 cubre la venta por correo o
                catálogo, y es el epígrafe habitual del comercio electrónico. Si además
                vendes en un local físico, esa venta es otra actividad y procede alta
                adicional en el epígrafe de comercio que corresponda.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  ✂️
                </span>
                <h3>Peluquería con servicios de estética</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  <strong>Situación:</strong>
                </p>
                <code>CNAE 9602 · IAE 972.1 (peluquería) + 972.2 (estética)</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Qué está en juego:</strong> son dos epígrafes distintos. Quien corta
                el pelo y además hace manicura o depilación ejerce dos actividades y procede
                el alta en las dos; no es una elección entre una y otra.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  🎨
                </span>
                <h3>Diseño gráfico</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  <strong>Situación:</strong>
                </p>
                <code>CNAE 7410 · Sin epígrafe claro en las Tarifas</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Qué está en juego:</strong> no hay un epígrafe de «diseñador gráfico»
                claramente identificado. En la práctica se recurre al 844 (publicidad,
                Sección 1ª) o a un epígrafe profesional de la Sección 2ª, y la elección
                determina si tus facturas llevan retención. Es de los casos en los que más
                merece la pena preguntar antes de presentar el alta.
              </p>
            </div>
          </div>

          {/* 3. FAQ */}
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>
                <span aria-hidden="true">❓</span> ¿Por qué me piden los dos códigos si
                describen lo mismo?
              </h4>
              <p>
                Porque los pide gente distinta para cosas distintas. La AEAT necesita el
                epígrafe del IAE para el censo de empresarios, profesionales y retenedores:
                de ahí deduce qué obligaciones de IVA y de retenciones te corresponden. La
                Seguridad Social necesita el CNAE al inscribirte en el RETA, entre otras
                razones porque el código de actividad se relaciona con la cobertura de
                accidentes de trabajo. Ninguno de los dos organismos consulta el código del
                otro.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>En la práctica:</strong> localiza
                primero el epígrafe del IAE, que es el que tiene consecuencias fiscales, y
                elige después el CNAE de la clase que mejor describa esa misma actividad.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>
                <span aria-hidden="true">❓</span> ¿Tengo que pagar el IAE?
              </h4>
              <p>
                Con toda probabilidad, no. Están exentas las personas físicas y quienes
                tengan un importe neto de la cifra de negocios inferior a 1.000.000 de euros,
                lo que deja fuera de la cuota a la inmensa mayoría de autónomos. Ahora bien,
                la exención es del pago, no de la declaración: el alta en el epígrafe sigue
                siendo obligatoria, porque es la forma en que la AEAT sabe qué actividad
                ejerces.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Ojo con la confusión:</strong>{' '}
                «estoy exento del IAE» no equivale a «no tengo epígrafe». Todo el mundo que
                se da de alta tiene epígrafe.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>
                <span aria-hidden="true">❓</span> ¿Puedo estar dado de alta en varios
                epígrafes a la vez?
              </h4>
              <p>
                Sí, y es más común de lo que parece. Cada actividad económica distinta exige
                su propia alta: quien fabrica joyas y además las vende al por menor ejerce dos
                actividades; quien tiene una academia y además da clases particulares por su
                cuenta, también. Se declaran todas en el mismo modelo 036 o 037, y puedes
                añadir o retirar epígrafes después mediante una declaración de modificación.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Cuidado:</strong> facturar de forma
                habitual por una actividad para la que no tienes epígrafe es precisamente el
                supuesto que conviene evitar. Si el trabajo cambia, actualiza el alta.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>
                <span aria-hidden="true">❓</span> ¿Cómo sé si mi actividad es empresarial o
                profesional?
              </h4>
              <p>
                La frontera está en la organización de medios. Si trabajas por tu cuenta
                aportando fundamentalmente tu propia cualificación, la actividad tiende a ser
                profesional (Sección 2ª). Si hay una estructura organizada —local abierto al
                público, personal contratado, medios materiales significativos— la actividad
                se acerca a lo empresarial (Sección 1ª). No es una etiqueta que elijas a
                voluntad: debe reflejar cómo ejerces realmente.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Comprobación rápida:</strong> si tu
                cliente te pregunta «¿tu factura lleva retención?», está preguntando en el
                fondo por tu sección.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>
                <span aria-hidden="true">❓</span> ¿Qué es exactamente la retención de IRPF de
                la Sección 2ª?
              </h4>
              <p>
                Cuando un profesional factura a una empresa o a otro profesional, quien paga
                está obligado a retener una parte del importe e ingresarla en Hacienda a
                cuenta del IRPF del profesional. El tipo general es el 15 %, reducido al 7 %
                durante el año de inicio de actividad y los dos siguientes. No es un coste
                añadido: es un anticipo de tu propio impuesto, que se descuenta al presentar
                la declaración anual. En facturas a particulares no se practica retención.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Efecto de caja:</strong> con
                retención cobras menos cada mes y regularizas en la renta, lo que conviene
                tener presente al planificar la tesorería del primer año.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>
                <span aria-hidden="true">❓</span> Mi actividad no aparece en el buscador, ¿es
                que no existe?
              </h4>
              <p>
                No. Este catálogo recoge las actividades más habituales en altas de autónomo,
                mientras que la CNAE-2009 tiene alrededor de 700 clases y las Tarifas del IAE,
                miles de epígrafes. Que algo falte aquí solo significa que no está entre las
                correspondencias curadas. El listado completo de la CNAE está publicado por el
                INE y las Tarifas del IAE, en la sede electrónica de la AEAT.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Antes de rendirte:</strong> prueba
                con una palabra distinta. «Rider», «mensajería» y «reparto» llevan a la misma
                ficha, pero solo si escribes alguna de ellas.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>
                <span aria-hidden="true">❓</span> ¿Qué significa que un epígrafe aparezca
                marcado como «conviene verificar»?
              </h4>
              <p>
                Que la correspondencia orienta bien, pero algo concreto no está contrastado:
                puede ser el número exacto del epígrafe, su literal en las Tarifas o el encaje
                de tu actividad en él. En cada caso se dice qué es lo dudoso. Los epígrafes
                marcados como contrastados tienen número y denominación verificados, lo que
                tampoco los convierte en una decisión cerrada: sigue siendo el criterio de la
                AEAT el que manda.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Uso recomendado:</strong> lleva el
                candidato a la consulta con tu asesor o a la sede de la AEAT y verifica el
                literal; ir con un número concreto acorta mucho la conversación.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>
                <span aria-hidden="true">❓</span> ¿Cambia el CNAE con la nueva clasificación?
              </h4>
              <p>
                La clasificación en vigor en España para estos trámites es la CNAE-2009. Las
                clasificaciones estadísticas se revisan periódicamente y una revisión implica
                recodificar actividades, pero mientras la Administración siga pidiendo el
                código CNAE-2009 es el que corresponde declarar. Si en tu trámite concreto te
                piden otra versión, el propio formulario lo indica.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Comprobación:</strong> el código
                CNAE-2009 tiene siempre 4 dígitos de clase; si el formulario te pide más
                dígitos o un formato distinto, no estás ante una CNAE-2009.
              </p>
            </div>
          </div>

          {/* 4. Guía paso a paso */}
          <h2>Cómo localizar tus códigos, paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Describe tu actividad en una frase corta</h4>
                <p>
                  Escríbela como se la contarías a un amigo: «hago páginas web», «arreglo
                  tuberías», «doy clases de inglés». El nombre oficial ya lo pondrá la
                  clasificación; tu trabajo aquí es describir el trabajo real, incluyendo lo
                  que haces de forma habitual aunque no sea lo principal.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Revisa todos los candidatos, no solo el primero</h4>
                <p>
                  La correspondencia no es uno a uno. Abre las fichas y compara: es habitual
                  que dos o tres clases describan matices distintos de lo mismo (fabricar
                  frente a vender, instalar frente a reparar, academia frente a clase
                  particular). Quédate con la que describa lo que de verdad ocupa tu jornada.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Decide si ejerces de forma empresarial o profesional</h4>
                <p>
                  Pregúntate si hay local abierto al público, personal contratado o medios
                  materiales organizados. Si los hay, apunta a la Sección 1ª; si trabajas
                  aportando sobre todo tu cualificación, a la Sección 2ª. Esta decisión, no el
                  número del epígrafe, es la que más consecuencias tiene.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Comprueba si necesitas más de un epígrafe</h4>
                <p>
                  Repasa tus fuentes de ingresos previstas. Fabricar y vender, dar clases y
                  vender cursos grabados, cortar el pelo y hacer estética: en cada uno de esos
                  pares hay dos actividades. Añadir un epígrafe extra en el alta inicial no
                  cuesta nada; regularizar después, sí cuesta tiempo.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Verifica el literal exacto en la fuente oficial</h4>
                <p>
                  Con el número candidato en la mano, contrasta la denominación en las Tarifas
                  del IAE de la sede de la AEAT y el código CNAE en el buscador del INE. Es el
                  paso que convierte un candidato en una decisión: los literales oficiales
                  contienen matices y salvedades que ningún resumen recoge completo.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Presenta el modelo 036 o 037 con la actividad declarada</h4>
                <p>
                  La declaración censal se presenta antes de iniciar la actividad, en la sede
                  electrónica de la AEAT. Ahí figuran el epígrafe o epígrafes, la fecha de
                  inicio y el régimen de IVA e IRPF aplicable. El modelo 037 es la versión
                  simplificada, disponible solo si se cumplen determinados requisitos.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Da de alta el RETA con el CNAE correspondiente</h4>
                <p>
                  El alta en el Régimen Especial de Trabajadores Autónomos se tramita en la
                  Seguridad Social, dentro de los 60 días naturales anteriores al inicio de la
                  actividad, y ahí es donde se usa el CNAE. Conserva ambos justificantes: te
                  los pedirán en bancos, mutuas y subvenciones durante años.
                </p>
              </div>
            </div>
          </div>

          {/* 5. Mejores prácticas */}
          <h2>Buenas prácticas al elegir tus códigos</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✅
              </span>
              <h4>Empieza por el epígrafe, no por el CNAE</h4>
              <p>
                El epígrafe es el que tiene efectos fiscales. Una vez fijado, el CNAE se elige
                casi solo.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✅
              </span>
              <h4>Huye de los cajones de sastre si puedes</h4>
              <p>
                Los epígrafes residuales (849.9, 979.9) solo encajan cuando no existe ninguno
                específico para tu actividad.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✅
              </span>
              <h4>Anota el literal completo, no solo el número</h4>
              <p>
                El literal de las Tarifas es lo que delimita qué cubre el epígrafe; el número
                por sí solo no discute nada ante la AEAT.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✅
              </span>
              <h4>Declara todas tus actividades desde el principio</h4>
              <p>
                Añadir un segundo epígrafe en el alta inicial es gratis y evita facturar por
                una actividad no declarada.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✅
              </span>
              <h4>Avisa a tus clientes de si llevas retención</h4>
              <p>
                Un profesional de la Sección 2ª que factura sin retención a una empresa genera
                un problema al cliente, no solo a sí mismo.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✅
              </span>
              <h4>Revisa tus códigos cuando cambie tu trabajo</h4>
              <p>
                Muchos autónomos siguen con el epígrafe de 2015 haciendo algo distinto desde
                hace años. La modificación es un trámite menor.
              </p>
            </div>
          </div>

          {/* 6. Warning box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              <h3>Errores comunes al elegir CNAE y epígrafe</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>
                  <span aria-hidden="true">❌</span> Copiar el epígrafe de otro autónomo del
                  sector:
                </strong>{' '}
                dos personas que hacen lo mismo pueden tener secciones distintas si una tiene
                local y personal y la otra no. Copiar arrastra el criterio ajeno a tu
                facturación.
              </li>
              <li>
                <strong>
                  <span aria-hidden="true">❌</span> Confundir estar exento del IAE con no
                  tener epígrafe:
                </strong>{' '}
                la exención por cifra de negocios inferior a 1.000.000 de euros libera del
                pago, no de la declaración. El alta censal en el epígrafe sigue siendo
                obligatoria.
              </li>
              <li>
                <strong>
                  <span aria-hidden="true">❌</span> Facturar una actividad no declarada:
                </strong>{' '}
                empezar a vender cursos grabados estando de alta solo como consultor deja
                ingresos fuera de lo declarado. Añadir el epígrafe cuesta un trámite;
                regularizarlo después, bastante más.
              </li>
              <li>
                <strong>
                  <span aria-hidden="true">❌</span> Elegir Sección 1ª para evitar la
                  retención:
                </strong>{' '}
                la sección debe reflejar cómo ejerces realmente. Declarar una estructura
                empresarial que no existe es una incorrección censal, y las retenciones no
                practicadas se reclaman al pagador.
              </li>
              <li>
                <strong>
                  <span aria-hidden="true">❌</span> Usar un epígrafe residual habiendo uno
                  específico:
                </strong>{' '}
                el 849.9 y el 979.9 son cajones de sastre. Si existe un epígrafe concreto para
                tu actividad, el residual no procede y puede dar lugar a una regularización.
              </li>
              <li>
                <strong>
                  <span aria-hidden="true">❌</span> Presentar el alta después de empezar a
                  trabajar:
                </strong>{' '}
                la declaración censal se presenta con carácter previo al inicio de la
                actividad. Facturar antes del alta deja un rastro difícil de explicar después.
              </li>
              <li>
                <strong>
                  <span aria-hidden="true">❌</span> Dar por buena una correspondencia sin
                  verificar el literal:
                </strong>{' '}
                los números de epígrafe circulan por foros con erratas frecuentes. Comprueba
                siempre la denominación en las Tarifas oficiales antes de presentar el
                modelo.
              </li>
              <li>
                <strong>
                  <span aria-hidden="true">❌</span> No revisar los códigos al cambiar de
                  actividad:
                </strong>{' '}
                un alta de hace años puede describir un trabajo que ya no haces. Eso afecta a
                tu régimen de IVA, a tus retenciones y a la coherencia de tu declaración
                anual.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-cnae-iae')} />

      <ShareCard appName="conversor-cnae-iae" />

      <Footer appName="conversor-cnae-iae" />
    </div>
  );
}

// ─── Ficha de actividad ──────────────────────────────────────────────────────

interface FichaActividadProps {
  actividad: ActividadCnaeIae;
  abierta: boolean;
  onToggle: () => void;
}

function FichaActividad({ actividad, abierta, onToggle }: FichaActividadProps) {
  const idDetalle = `ficha-${actividad.cnae}`;
  const sinEpigrafes = actividad.iae.length === 0;

  return (
    <article className={styles.ficha}>
      <div className={styles.fichaCabecera}>
        <div className={styles.fichaIdentidad}>
          <span className={styles.codigoCnae}>CNAE {actividad.cnae}</span>
          <h3 className={styles.denominacion}>{actividad.descripcionCnae}</h3>
        </div>
        <button
          type="button"
          className={styles.btnDetalle}
          aria-expanded={abierta}
          aria-controls={idDetalle}
          onClick={onToggle}
        >
          {abierta ? 'Ocultar detalle' : 'Ver detalle'}
        </button>
      </div>

      <div className={styles.resumenEpigrafes}>
        {sinEpigrafes ? (
          <p className={styles.sinEpigrafe}>
            <span aria-hidden="true">🔎</span> <strong>Sin epígrafe de IAE verificado.</strong>{' '}
            Conocemos el código CNAE de esta actividad, pero no incluimos ningún epígrafe
            porque no hay certeza suficiente. Consúltalo en las Tarifas del IAE de la{' '}
            <a href={CNAE_IAE_META.urlOficialIae} target="_blank" rel="noopener noreferrer">
              sede electrónica de la AEAT
            </a>
            .
          </p>
        ) : (
          <p className={styles.resumenTexto}>
            <span aria-hidden="true">⚖️</span> Posibles epígrafes de IAE:{' '}
            {actividad.iae.map((e, i) => (
              <span key={e.epigrafe}>
                {i > 0 && ' · '}
                <strong>{e.epigrafe}</strong> (Sección {e.seccion})
              </span>
            ))}
          </p>
        )}
      </div>

      <div id={idDetalle} className={styles.fichaDetalle} hidden={!abierta}>
        {actividad.notas && (
          <p className={styles.notaActividad}>
            <span aria-hidden="true">📝</span> {actividad.notas}
          </p>
        )}

        {!sinEpigrafes && (
          <ul className={styles.epigrafesLista}>
            {actividad.iae.map((epigrafe) => (
              <li key={`${actividad.cnae}-${epigrafe.epigrafe}`}>
                <TarjetaEpigrafe epigrafe={epigrafe} />
              </li>
            ))}
          </ul>
        )}

        <p className={styles.sinonimosLinea}>
          <strong>También se busca como:</strong> {actividad.sinonimos.join(' · ')}
        </p>
      </div>
    </article>
  );
}

// ─── Tarjeta de epígrafe ─────────────────────────────────────────────────────

function TarjetaEpigrafe({ epigrafe }: { epigrafe: EpigrafeIAE }) {
  const seccion = SECCION_POR_ID[epigrafe.seccion];
  const esMedia = epigrafe.confianza === 'media';
  const claseSeccion = claseDeSeccion(epigrafe.seccion);

  return (
    <div className={`${styles.epigrafeCard} ${esMedia ? styles.epigrafeCardMedia : ''}`}>
      <div className={styles.epigrafeCabecera}>
        <span className={styles.epigrafeCodigo}>{epigrafe.epigrafe}</span>
        <span className={`${styles.badgeSeccion} ${claseSeccion}`}>
          Sección {epigrafe.seccion} · {seccion?.nombre}
        </span>
        <span
          className={`${styles.badgeConfianza} ${esMedia ? styles.confianzaMedia : styles.confianzaAlta}`}
        >
          <span aria-hidden="true">{esMedia ? '🔍' : '✔️'}</span>{' '}
          {esMedia ? 'Conviene verificar' : 'Correspondencia contrastada'}
        </span>
      </div>

      <p className={styles.epigrafeDesc}>{epigrafe.descripcion}</p>

      {seccion && (
        <p className={styles.epigrafeImplicacion}>
          <strong>Qué implica esta sección:</strong> {seccion.implicacion}
        </p>
      )}

      {esMedia && epigrafe.notaConfianza && (
        <p className={styles.notaConfianza}>
          <strong>Qué no está verificado:</strong> {epigrafe.notaConfianza}
        </p>
      )}

      {!esMedia && (
        <p className={styles.notaAlta}>
          Número y denominación contrastados. Aun así es un candidato, no una decisión:
          confírmalo antes de presentar el alta.
        </p>
      )}
    </div>
  );
}
