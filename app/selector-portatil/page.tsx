'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './SelectorPortatil.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
  DisclaimerCard,
  RegionBadge,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  calcularResultado,
  FORMATOS,
  OS_INFO,
  GAMAS,
  PREGUNTAS,
  FORMATO_CON_ARTICULO,
  RAM_MINIMA_GB,
  RAM_RECOMENDADA_GB,
  RAM_EXIGENTE_GB,
  type Resultado,
} from './motor';

// Las preguntas, el perfil técnico y la lógica de recomendación viven en ./motor.ts.

/** Lista legible: «A, B y C». */
function enumerar(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

type Pantalla = 'intro' | 'test' | 'resultado';

export default function SelectorPortatil() {
  const [pantalla, setPantalla] = useState<Pantalla>('intro');
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const tituloResultado = useRef<HTMLHeadingElement>(null);

  const preguntaActual = PREGUNTAS[paso];
  const totalPreguntas = PREGUNTAS.length;
  const progreso = (paso / totalPreguntas) * 100;

  // Al pulsar «Ver resultado» se desmonta la sección del test con el botón que tenía el foco, y el
  // foco caía a <body>: se lleva al encabezado del resultado (familia selector-*, forma g).
  useEffect(() => {
    if (pantalla === 'resultado') tituloResultado.current?.focus();
  }, [pantalla]);

  function seleccionarOpcion(valor: string) {
    setRespuestas(prev => ({ ...prev, [preguntaActual.id]: valor }));
  }

  function avanzar() {
    if (paso < totalPreguntas - 1) {
      setPaso(p => p + 1);
    } else {
      setResultado(calcularResultado(respuestas));
      setPantalla('resultado');
    }
  }

  function retroceder() {
    if (paso > 0) setPaso(p => p - 1);
  }

  function reiniciar() {
    setPantalla('intro');
    setPaso(0);
    setRespuestas({});
    setResultado(null);
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {pantalla !== 'resultado' ? (
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}><span aria-hidden="true">💻</span> Asesor de Portátil, Laptop o Notebook</h1>
          <p className={styles.heroSubtitle}>
            {pantalla === 'intro'
              ? '10 preguntas para saber qué computadora te conviene de verdad: portátil (laptop), sobremesa, Mac o Windows'
              : `Pregunta ${paso + 1} de ${totalPreguntas} · ${preguntaActual.categoria}`}
          </p>
        </header>
      ) : (
        <header className={styles.heroResultados}>
          <h1 className={styles.heroTitleSm} ref={tituloResultado} tabIndex={-1}>Tu ordenador ideal</h1>
          <p className={styles.heroSubtitleSm}>Resultado personalizado basado en tu perfil y uso</p>
        </header>
      )}

      {/* Las horquillas de las gamas y la pregunta de presupuesto están en euros, y los precios de
          referencia de Apple son los de España: la metodología es universal pero los datos de
          referencia no (hallazgo 1417, como el 949 de smartphone). */}
      <RegionBadge variant="es-data" />

      <LegalNotice />
      {/* Test de consumo: aviso para el público general, no «para profesionales del dominio»
          (hallazgo 1416, como el 952 de smartphone). */}
      <DisclaimerCard variant="general" severity="medium" />

      {/* ── INTRO ── */}
      {pantalla === 'intro' && (
        <div className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid} aria-hidden="true">
              <span className={styles.introIcon}>💻</span>
              <span className={styles.introIcon}>🍎</span>
              <span className={styles.introIcon}>🪟</span>
              <span className={styles.introIcon}>🐧</span>
            </div>
            <h2 className={styles.introTitulo}>¿Portátil (laptop), sobremesa, Mac o Windows?</h2>
            <p className={styles.introDesc}>
              El mercado de computadoras tiene más opciones que nunca: portátiles (laptops y notebooks) ultraligeros,
              mini PCs, torres para jugar… y una brecha enorme entre la oferta de entrada y la gama pro. Este test te
              orienta hacia el formato, el sistema operativo y la gama que mejor encajan con tu uso real.
            </p>
            <ul className={styles.introFeatures} aria-label="Qué obtendrás">
              <li><span aria-hidden="true">✅</span> Formato recomendado (portátil, sobremesa o mini PC)</li>
              <li><span aria-hidden="true">✅</span> Sistema operativo según tu perfil (Windows, macOS, Linux o ChromeOS)</li>
              <li><span aria-hidden="true">✅</span> Gama con precio orientativo, acotada a tu presupuesto</li>
              <li><span aria-hidden="true">✅</span> Características técnicas que buscar, sin marcas ni modelos</li>
              <li><span aria-hidden="true">✅</span> Consejos de compra personalizados</li>
            </ul>
            <button type="button" className={styles.btnStart} onClick={() => setPantalla('test')}>
              Empezar el test →
            </button>
          </div>
        </div>
      )}

      {/* ── TEST ── */}
      {pantalla === 'test' && (
        <div className={styles.testContainer}>
          <div className={styles.progresoWrap}>
            <div className={styles.progresoInfo}>
              <span className={styles.progresoPaso}>Pregunta {paso + 1} de {totalPreguntas}</span>
              <span className={styles.progresoCategoria}>{preguntaActual.categoria}</span>
            </div>
            <div
              className={styles.progresoBar}
              role="progressbar"
              aria-label={`Pregunta ${paso + 1} de ${totalPreguntas}`}
              // Lo anunciado y lo pintado van sobre la misma escala: preguntas RESPONDIDAS
              // (paso / total). aria-valuenow era el número de pregunta con mínimo 1, y un
              // lector de pantalla anunciaba otra fracción que la que se veía (mismo defecto
              // y misma reparación que selector-smartphone, hallazgo 951).
              aria-valuenow={paso}
              aria-valuemin={0}
              aria-valuemax={totalPreguntas}
              aria-valuetext={`Pregunta ${paso + 1} de ${totalPreguntas}`}
            >
              <div className={styles.progresoRelleno} data-progreso={progreso} style={{ width: `${progreso}%` }} />
            </div>
          </div>

          <div className={styles.preguntaCard}>
            <span className={styles.preguntaIcon} aria-hidden="true">{preguntaActual.icon}</span>
            <h2 className={styles.preguntaTexto}>{preguntaActual.pregunta}</h2>
            <div className={styles.opcionesGrid} role="radiogroup" aria-label={preguntaActual.pregunta}>
              {preguntaActual.opciones.map(op => (
                <button
                  key={op.valor}
                  type="button"
                  className={`${styles.opcionBtn} ${respuestas[preguntaActual.id] === op.valor ? styles.opcionSeleccionada : ''}`}
                  onClick={() => seleccionarOpcion(op.valor)}
                  // role="radio" + aria-checked, no aria-pressed: la elección es ÚNICA entre
                  // varias, no un conmutador. El contenedor declaraba radiogroup sin un solo
                  // radio dentro (selector-smartphone, hallazgo 950).
                  role="radio"
                  aria-checked={respuestas[preguntaActual.id] === op.valor}
                >
                  <span className={styles.opcionEtiqueta}>{op.etiqueta}</span>
                  <span className={styles.opcionDesc}>{op.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.navegacion}>
            <button type="button" className={styles.btnAnterior} onClick={retroceder} disabled={paso === 0} aria-label="Pregunta anterior">
              ← Anterior
            </button>
            <button
              type="button"
              className={styles.btnSiguiente}
              onClick={avanzar}
              disabled={!respuestas[preguntaActual.id]}
              aria-label={paso === totalPreguntas - 1 ? 'Ver resultado' : 'Siguiente pregunta'}
            >
              {paso === totalPreguntas - 1 ? 'Ver resultado →' : 'Siguiente →'}
            </button>
          </div>
        </div>
      )}

      {/* ── RESULTADO ── */}
      {pantalla === 'resultado' && resultado && (
        <div className={styles.resultadosContainer}>

          {/* 3 tarjetas de recomendación */}
          <div className={styles.recomendacionGrid}>
            <div className={styles.recomendacionCard}>
              <span className={styles.recomendacionIcon} aria-hidden="true">{FORMATOS[resultado.formato].icon}</span>
              <p className={styles.recomendacionLabel}>Formato</p>
              <p className={styles.recomendacionValor}>{FORMATOS[resultado.formato].nombre}</p>
              <p className={styles.recomendacionDesc}>{FORMATOS[resultado.formato].descripcion}</p>
            </div>
            <div className={`${styles.recomendacionCard} ${styles.recomendacionCardOS}`}>
              <span className={styles.recomendacionIcon} aria-hidden="true">{OS_INFO[resultado.os].icon}</span>
              <p className={styles.recomendacionLabel}>Sistema operativo</p>
              <p className={styles.recomendacionValor}>{OS_INFO[resultado.os].nombre}</p>
              <p className={styles.recomendacionDesc}>{OS_INFO[resultado.os].descripcion}</p>
            </div>
            <div className={`${styles.recomendacionCard} ${styles.recomendacionCardGama}`}>
              <span className={styles.recomendacionIcon} aria-hidden="true">{GAMAS[resultado.gama].icon}</span>
              <p className={styles.recomendacionLabel}>Gama</p>
              <p className={styles.recomendacionValor}>{GAMAS[resultado.gama].nombre}</p>
              <p className={styles.recomendacionDesc}>
                {GAMAS[resultado.gama].descripcion}
                <br /><strong>{GAMAS[resultado.gama].precioOrientativo}</strong>
              </p>
            </div>
          </div>

          {/* El presupuesto declarado, dicho a la cara: en los tramos intermedios no acotaba nada y
              la gama podía salir por encima del tramo (hallazgo 1405, como el 943 de smartphone). */}
          {resultado.recortadaPorPresupuesto && (
            <p className={styles.avisoPresupuesto} role="note">
              <span aria-hidden="true">💶</span> Tu uso apuntaba a la{' '}
              <strong>{GAMAS[resultado.gamaPorUso].nombre.toLowerCase()}</strong>{' '}
              ({GAMAS[resultado.gamaPorUso].precioOrientativo}), pero la recomendación se ajusta al
              presupuesto que has declarado. Lo que sigue es lo mejor que cabe en tu tramo.
            </p>
          )}
          {resultado.ampliadaPorPresupuesto && (
            <p className={styles.avisoPresupuesto} role="note">
              <span aria-hidden="true">💶</span> Con tu uso declarado bastaría la{' '}
              <strong>{GAMAS[resultado.gamaPorUso].nombre.toLowerCase()}</strong>{' '}
              ({GAMAS[resultado.gamaPorUso].precioOrientativo}): el salto responde a tu
              presupuesto, no a una necesidad técnica.
            </p>
          )}

          {/* Un empate de formato no se resuelve en silencio por el orden del array: con «A
              veces» y pantalla grande, portátil y sobremesa empatan. */}
          {resultado.formatosEmpatados.length > 0 && (
            <p className={styles.avisoEmpate} role="note">
              <span aria-hidden="true">⚖️</span> Empate de formato: con tus respuestas,{' '}
              {enumerar([resultado.formato, ...resultado.formatosEmpatados].map(k => FORMATO_CON_ARTICULO[k]))}{' '}
              encajan exactamente igual; {resultado.criterioDesempate}.
            </p>
          )}

          {/* Razones: salen de las respuestas, no del resultado */}
          <div className={styles.razonesSection}>
            <p className={styles.razonesTitulo}>Por qué esta recomendación</p>
            {resultado.razones.map((r, i) => (
              <p key={i} className={styles.razonItem}>{r}</p>
            ))}
          </div>

          {/* Perfil técnico: qué buscar, sin marcas ni modelos. Las 27 fichas de modelos con
              precio caducaban en meses y se salían de su propia gama (hallazgos 1406, 1407, 1411
              y 1412; política del proyecto desde 81fd4bea en smartphone). */}
          <div className={styles.perfilSection}>
            <h2 className={styles.perfilTitulo}>
              Qué buscar — {FORMATOS[resultado.formato].nombre} · {OS_INFO[resultado.os].nombre} · {GAMAS[resultado.gama].nombre}
            </h2>
            <p className={styles.perfilNota}>
              Horquilla orientativa de la gama: <strong>{GAMAS[resultado.gama].precioOrientativo}</strong>. Compara
              las fichas técnicas con esta lista, en la tienda que prefieras.
            </p>
            <ul className={styles.perfilLista}>
              {resultado.perfil.map((l, i) => (
                <li key={i} className={styles.perfilItem}>
                  <span className={styles.perfilIcono} aria-hidden="true">{l.icono}</span>
                  <span>{l.texto}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Consejos */}
          <div className={styles.consejosSection}>
            <p className={styles.consejosTitulo}>Antes de comprar</p>
            {resultado.consejos.map((c, i) => (
              <p key={i} className={styles.consejoItem}>
                <span aria-hidden="true">{c.icono}</span> {c.texto}
              </p>
            ))}
          </div>

          <button type="button" className={styles.btnRepetir} onClick={reiniciar} aria-label="Repetir el test">
            ← Repetir el test
          </button>

          <EducationalSection
            title="Guía completa: cómo elegir ordenador"
            subtitle="Formato, sistema, gama, qué especificaciones importan y cuándo comprar"
            defaultOpen={false}
          >
            <h3>Portátil (laptop o notebook) vs sobremesa: la primera decisión</h3>
            <p>
              Un <strong>portátil</strong> —conocido como <strong>laptop</strong> o <strong>notebook</strong> en
              gran parte de Latinoamérica— es la elección correcta si te mueves con frecuencia, estudias o trabajas en
              distintos lugares. A igual precio, un sobremesa (computadora de escritorio) ofrece más rendimiento, mejor
              ergonomía y es más fácil de actualizar. Si siempre trabajas en casa u oficina, el sobremesa + monitor
              externo es más rentable.
            </p>
            <p>
              Los <strong>2 en 1</strong> (bisagra de 360° con pantalla táctil) son portátiles pensados para tomar
              notas a mano o dibujar con lápiz. No son los más potentes por su precio, pero ofrecen versatilidad real.
              Los <strong>mini PC</strong> son sobremesas del tamaño de un libro: silenciosos, con poco consumo y
              suficientes para cualquier uso que no pida una gráfica dedicada; para jugar a títulos exigentes o editar
              vídeo con soltura, una torre sigue dando más margen.
            </p>

            <h3>Windows, macOS, Linux o ChromeOS</h3>
            <p>
              <strong>Windows</strong> tiene la mayor compatibilidad de software: es imprescindible si usas programas
              que solo existen para Windows (algunas herramientas de ingeniería, CAD o de empresa) o si quieres jugar a
              títulos exigentes. La variedad de equipos y precios es enorme.
            </p>
            <p>
              <strong>macOS</strong> encaja si ya usas iPhone y quieres integración entre dispositivos. Los chips de
              Apple destacan por su eficiencia (autonomía y rendimiento por vatio), y algunos programas de vídeo y
              audio de Apple solo existen para sus equipos. No hay ningún Mac nuevo por debajo de 600 € a precio
              general.
            </p>
            <p>
              <strong>Linux</strong> es habitual entre desarrolladores y administradores de sistemas. Máxima
              personalización, excelente para programación, servidores y ciencia de datos. Requiere cierta curva de
              aprendizaje y algunos programas populares no tienen versión nativa.
            </p>
            <p>
              <strong>ChromeOS</strong> es ligero, seguro y pensado para tareas en la nube y Google Workspace.
              Encaja en perfiles básicos, en educación y en entornos de trabajo con Google; no instala programas de
              escritorio tradicionales.
            </p>

            <h3>Qué especificaciones importan de verdad</h3>
            <ul>
              <li><strong>Procesador (CPU):</strong> los dos grandes fabricantes de procesadores para PC numeran sus gamas
                como series 3, 5, 7 y 9. Para ofimática basta una serie 5 reciente; para edición de vídeo o IA, una serie 7
                o superior, o las gamas intermedias y altas de los chips de Apple.</li>
              <li><strong>RAM:</strong> {RAM_MINIMA_GB} GB es el mínimo razonable. Con {RAM_RECOMENDADA_GB} GB irás cómodo
                para multitarea. {RAM_EXIGENTE_GB} GB si editas vídeo o usas máquinas virtuales.</li>
              <li><strong>Almacenamiento:</strong> SSD siempre. 256 GB es justo; 512 GB es lo recomendable; 1 TB si guardas muchos archivos localmente.</li>
              <li><strong>Pantalla:</strong> resolución mínima Full HD (1920×1080). Un panel IPS da mejores colores que uno TN. OLED es excelente para creativos, pero más caro y con riesgo de marcas permanentes.</li>
              <li><strong>Batería:</strong> la cifra del fabricante se mide en condiciones favorables. Busca pruebas independientes de batería en uso real.</li>
            </ul>
            <div className={styles.warningBox}>
              <strong>Truco de compra:</strong> la generación del procesador importa tanto como su serie: una serie 5
              reciente puede rendir como una serie 7 de hace varios años. Comprueba el año del chip, no solo su nombre, y
              ojo con la nomenclatura: los Intel Core Ultra (Series 1, Series 2…) son una familia distinta de los Core i
              de 13.ª y 14.ª generación.
            </div>
          </EducationalSection>
        </div>
      )}

      <RelatedApps apps={getRelatedApps('selector-portatil')} />
      <ShareCard appName="selector-portatil" />
      <Footer appName="selector-portatil" />
    </div>
  );
}
