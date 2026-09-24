'use client';

import React, { useState } from 'react';
import styles from './SelectorPortatil.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { calcularResultado, FORMATOS, OS_INFO, GAMAS, PREGUNTAS, FORMATO_CON_ARTICULO, type Resultado } from './motor';

// Las preguntas, las fichas, los modelos y la lógica de recomendación viven en ./motor.ts.

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

  const preguntaActual = PREGUNTAS[paso];
  const totalPreguntas = PREGUNTAS.length;
  const progreso = (paso / totalPreguntas) * 100;

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
          <h1 className={styles.heroTitleSm}>Tu ordenador ideal</h1>
          <p className={styles.heroSubtitleSm}>Resultado personalizado basado en tu perfil y uso</p>
        </header>
      )}

      <LegalNotice />
      <DisclaimerCard variant="technical" severity="medium" />

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
              El mercado de computadoras tiene más opciones que nunca: chips Apple Silicon, portátiles (laptops y
              notebooks) ultraligeros, mini PCs, 2 en 1 táctiles… y una brecha enorme entre la oferta de entrada y la
              gama pro. Este test te orienta hacia el formato, sistema operativo y gama que mejor encajan con tu uso real.
            </p>
            <ul className={styles.introFeatures} aria-label="Qué obtendrás">
              <li><span aria-hidden="true">✅</span> Formato recomendado (portátil, sobremesa, 2 en 1…)</li>
              <li><span aria-hidden="true">✅</span> Sistema operativo según tu perfil</li>
              <li><span aria-hidden="true">✅</span> Gama con precio orientativo</li>
              <li><span aria-hidden="true">✅</span> Modelos de referencia concretos</li>
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

          {/* Modelos */}
          <div className={styles.modelosSection}>
            <p className={styles.modelosTitulo}>
              Modelos de referencia — {OS_INFO[resultado.os].nombre} · {GAMAS[resultado.gama].nombre}
            </p>
            <p className={styles.modelosNota}>Orientativo. Los precios varían según tienda y configuración.</p>
            <div className={styles.modelosGrid}>
              {resultado.modelos.map((m, i) => (
                <div key={i} className={styles.modeloItem}>
                  <span className={styles.modeloIcon} aria-hidden="true">{m.icon}</span>
                  <div className={styles.modeloInfo}>
                    <p className={styles.modeloNombre}>{m.nombre} · {m.precio}</p>
                    <p className={styles.modeloDesc}>{m.nota}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consejos */}
          <div className={styles.consejosSection}>
            <p className={styles.consejosTitulo}>Antes de comprar</p>
            {resultado.consejos.map((c, i) => (
              <p key={i} className={styles.consejoItem}>{c}</p>
            ))}
          </div>

          <button type="button" className={styles.btnRepetir} onClick={reiniciar} aria-label="Repetir el test">
            ← Repetir el test
          </button>

          <EducationalSection
            title="Guía completa: cómo elegir ordenador en 2025"
            subtitle="Formato, OS, gama, qué especificaciones importan y cuándo comprar"
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
              Los <strong>2 en 1</strong> (bisagra 360° con pantalla táctil) son ideales para estudiantes que toman
              notas a mano o creativos que usan stylus. No son los más potentes por euro, pero ofrecen versatilidad real.
              Los <strong>mini PC</strong> son una opción emergente: muy compactos, silenciosos y con buen rendimiento a
              precios razonables (Beelink, Intel NUC, Mac mini).
            </p>

            <h3>Windows, macOS, Linux o ChromeOS</h3>
            <p>
              <strong>Windows</strong> tiene la mayor compatibilidad de software: es obligatorio si usas AutoCAD, SolidWorks,
              software de empresa o quieres gaming serio. La variedad de modelos y precios es enorme.
            </p>
            <p>
              <strong>macOS</strong> es la mejor opción si ya usas iPhone y quieres integración perfecta (AirDrop, iMessage,
              Continuity Camera). El chip Apple Silicon (M3, M4) es excepcionalmente eficiente: mejor autonomía y
              rendimiento por vatio que cualquier chip Intel/AMD equivalente. La Suite Adobe, Final Cut Pro y Logic Pro
              funcionan mejor que en cualquier otra plataforma.
            </p>
            <p>
              <strong>Linux</strong> es la opción de los desarrolladores y administradores de sistemas. Máxima
              personalización, excelente para programación, servidores y ciencia de datos. Requiere cierta curva de
              aprendizaje y algunos programas populares no tienen versión nativa.
            </p>
            <p>
              <strong>ChromeOS</strong> es ligero, seguro y perfecto para tareas en la nube y Google Workspace.
              Ideal para perfiles básicos, estudiantes de educación y entornos corporativos con Google.
            </p>

            <h3>Qué especificaciones importan de verdad</h3>
            <ul>
              <li><strong>Procesador (CPU):</strong> para ofimática, cualquier Intel Core i5/Ryzen 5 actual es suficiente. Para edición de vídeo o IA, busca i7/Ryzen 7 o el M3 Pro/M4 Pro de Apple.</li>
              <li><strong>RAM:</strong> 8 GB es el mínimo para 2025. Con 16 GB irás cómodo para multitarea. 32 GB si editas vídeo o usas máquinas virtuales.</li>
              <li><strong>Almacenamiento:</strong> SSD NVMe obligatorio. 256 GB es justo; 512 GB es lo recomendable; 1 TB si guardas muchos archivos localmente.</li>
              <li><strong>Pantalla:</strong> resolución mínima Full HD (1920×1080). Un panel IPS da mejores colores que TN. OLED es excelente para creativos pero más caro y con riesgo de burn-in.</li>
              <li><strong>Batería:</strong> los fabricantes mienten. Busca reseñas con prueba de batería real en Notebookcheck o YouTube.</li>
            </ul>
            <div className={styles.warningBox}>
              <strong>Truco de compra:</strong> la generación del procesador importa más que el número de serie.
              Un Intel Core Ultra 5 (13ª-14ª gen) supera claramente a un Core i7 de 10ª generación. Comprueba siempre
              el año del chip, no solo el modelo.
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
