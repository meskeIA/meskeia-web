'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './SelectorTablet.module.css';
import { margenBarraLogo } from '@/lib';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
  DisclaimerCard,
} from '@/components';
import {
  calcularResultado,
  PREGUNTAS,
  type Motivo,
  type Requisito,
  type ResultadoMotor,
  type TipoTablet,
} from './motor';

// ─── Resultados ───────────────────────────────────────────────────────────────
// Sin marcas, modelos ni precios concretos: la plataforma y las características a buscar, como en
// selector-smartphone (pauta del catálogo, 81fd4bea; hallazgo 3205). Las preguntas, los puntos y
// las reglas de descarte viven en ./motor.

interface ResultadoInfo {
  emoji: string;
  titulo: string;
  descripcion: string;
  /** Encabezado del bloque de características. */
  queMirar: string;
  caracteristicas: string[];
}

const RESULTADOS: Record<TipoTablet, ResultadoInfo> = {
  android: {
    emoji: '🤖',
    titulo: 'Tablet Android',
    descripcion:
      'Mayor variedad de precios y tamaños, ecosistema abierto, ideal para entretenimiento y uso general. Hay modelos de varios fabricantes en todas las gamas de precio.',
    queMirar: 'Qué mirar al comprarla',
    caracteristicas: [
      'Los años de actualizaciones de sistema y de seguridad que el fabricante comprometa por escrito',
      'Pantalla de 10-11 pulgadas para vídeo y estudio; de 8 si prima llevarla encima',
      'Almacenamiento ampliable con tarjeta microSD si vas a guardar vídeo o libros',
      'Control parental y perfiles de usuario si la va a usar un menor',
    ],
  },
  ios_ipad: {
    emoji: '🍎',
    titulo: 'Tablet con iPadOS',
    descripcion:
      'La plataforma con más recorrido en creatividad, dibujo digital y apps de productividad. Se integra con iPhone y Mac, y ofrece una experiencia de usuario muy pulida.',
    queMirar: 'Qué mirar al comprarla',
    caracteristicas: [
      'Qué lápiz admite cada modelo: no todos son compatibles con los mismos',
      'Almacenamiento suficiente desde el principio: no se puede ampliar después',
      'Solo Wi-Fi o también datos móviles, según dónde la vayas a usar',
      'Una generación anterior o un equipo reacondicionado con garantía, si el precio aprieta',
    ],
  },
  windows: {
    emoji: '🪟',
    titulo: 'Tablet Windows (2 en 1)',
    descripcion:
      'Para quienes necesitan un ordenador portátil compacto con compatibilidad total con programas de escritorio. Ideal si quieres sustituir tu portátil con flexibilidad táctil.',
    queMirar: 'Qué mirar al comprarla',
    caracteristicas: [
      'Procesador y memoria RAM de portátil, no de tablet, si vas a usar programas de escritorio',
      'Si el teclado acoplable viene incluido o se compra aparte',
      'Autonomía declarada en uso real, no solo en reposo',
      'Puertos (USB-C, carga, pantalla externa) para conectar lo que ya usas',
    ],
  },
  ereader: {
    emoji: '📚',
    titulo: 'eReader (lector de libros electrónicos)',
    descripcion:
      'Para lectura intensiva: pantalla de tinta electrónica sin reflejos, batería de semanas y sin distracciones. Los venden varios fabricantes, unos ligados a su propia tienda de libros y otros abiertos.',
    queMirar: 'Qué mirar al comprarlo',
    caracteristicas: [
      'Luz frontal regulable, y temperatura de color si lees de noche',
      'Los formatos que admite (EPUB, PDF) y si lee los de la tienda o la biblioteca que usas',
      'Pantalla de 6-7 pulgadas para novela; más grande si vas a leer PDF o cómics',
      'Resistencia al agua si lees en la playa o en la bañera',
    ],
  },
  sin_tablet: {
    emoji: '📱',
    titulo: 'Sin Tablet — Tu Smartphone o Portátil son Suficientes',
    descripcion:
      'Si tu uso no justifica un dispositivo extra, el smartphone o portátil cubren tus necesidades perfectamente. Ahórrate el gasto y la complejidad de gestionar otro dispositivo.',
    queMirar: 'Antes de descartarla del todo',
    caracteristicas: [
      'Si tu móvil tiene pantalla grande (6,5 pulgadas o más), cubre casi todo lo que haría una tablet pequeña',
      'Si el portátil pesa poco, también te sirve fuera de casa',
      'Si echas en falta leer en pantalla grande, un eReader es más barato que una tablet',
    ],
  },
};

const ALTERNATIVAS_LABELS: Record<TipoTablet, string> = {
  android: '🤖 Tablet Android',
  ios_ipad: '🍎 Tablet con iPadOS',
  windows: '🪟 Tablet Windows',
  ereader: '📚 eReader',
  sin_tablet: '📱 Sin tablet adicional',
};

const NOMBRE_MOTIVO: Record<Motivo, string> = {
  leer: 'leer mucho',
  dibujar: 'dibujar',
  menores: 'uso infantil o adolescente',
  viajar: 'viajar',
};

/** Por qué sale lo que sale, cuando no se explica solo con la descripción. */
function porQue(r: ResultadoMotor): string | null {
  if (r.ganador === 'sin_tablet') {
    const casos = (Object.values(NOMBRE_MOTIVO) as string[]).join(', ');
    return `Tus respuestas no tocan ninguno de los cuatro casos en que una tablet suele aportar algo que no dan el móvil y el portátil (${casos}), y ya usas mucho un portátil.`;
  }
  if (r.ipadosHabriaSalido) {
    return 'Por tus respuestas habría salido una tablet con iPadOS, pero en tu presupuesto no hay ninguna nueva: el modelo de entrada está por encima de 350 €. Si quieres esa plataforma, la vía en tu tramo es una reacondicionada o de segunda mano.';
  }
  return null;
}

/** Nombre de cada plataforma dentro de una frase, con artículo. */
const CON_ARTICULO: Record<TipoTablet, string> = {
  android: 'la tablet Android',
  ios_ipad: 'la tablet con iPadOS',
  windows: 'la tablet Windows (2 en 1)',
  ereader: 'el eReader',
  sin_tablet: 'quedarte sin tablet',
};

/** Lista legible: «A, B y C». */
function enumerar(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

/**
 * Lo declarado como imprescindible que la recomendación no cumple, dicho a la cara (hallazgo
 * 3197). La respuesta se cita literal, de PREGUNTAS, para que no diverja del cuestionario.
 */
function textoRequisito(req: Requisito, r: ResultadoMotor): string {
  const cita = (p: number, o: number) => `«${PREGUNTAS[p].opciones[o].texto}»`;
  const quien = CON_ARTICULO[r.ganador];
  switch (req) {
    case 'software':
      return `A la pregunta del software de escritorio has respondido ${cita(6, 0)}, y ${quien} no ejecuta programas de escritorio completos: para eso la opción es una tablet Windows (2 en 1), que con tus respuestas suma ${r.totales.windows} puntos frente a los ${r.totales[r.ganador]} de la recomendada.`;
    case 'teclado':
      return `A la pregunta del teclado físico has respondido ${cita(3, 0)}, y un eReader no está pensado para escribir documentos largos. Si eso pesa más que la lectura, mira ${CON_ARTICULO.windows} o una tablet con teclado acoplable.`;
    case 'lapiz':
      return `A la pregunta del lápiz digital has respondido ${cita(4, 0)}, y un eReader no sirve para dibujar. Si eso pesa más que la lectura, mira una tablet que admita lápiz.`;
  }
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function SelectorTabletPage() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(
    Array(PREGUNTAS.length).fill(null),
  );
  const [resultado, setResultado] = useState<ResultadoMotor | null>(null);

  // Al cambiar de pregunta «Siguiente» se desactiva (la nueva no tiene respuesta), «Anterior»
  // desaparece en la 1 y «Ver resultado» y «Repetir» se desmontan: el foco caía a <body> y el Tab
  // siguiente salía del cuestionario (hallazgo 3200, receta 1679/1680 de selector-smartphone). Se
  // lleva al enunciado nuevo o al título del resultado. Y la página no se movía: en móvil el
  // enunciado quedaba por encima del borde o bajo la barra fija del logo, y el título del
  // resultado, cortado (hallazgo 3201). Si no está entero a la vista y por debajo de la barra, se
  // sube a su sitio; el hueco lo da el scroll-padding del documento. Solo tras una navegación.
  const enunciado = useRef<HTMLHeadingElement>(null);
  const tituloResultado = useRef<HTMLHeadingElement>(null);
  const navegado = useRef(false);
  useEffect(() => {
    if (!navegado.current) return;
    const destino = resultado ? tituloResultado.current : enunciado.current;
    if (!destino) return;
    const caja = destino.getBoundingClientRect();
    if (caja.top < margenBarraLogo() || caja.bottom > window.innerHeight) {
      destino.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
    destino.focus({ preventScroll: true });
  }, [resultado, preguntaActual]);

  /**
   * Doble clic y dos toques seguidos (hallazgo 3202; receta `clicDeMas` de selector-smartphone,
   * 2659, con la guarda en captura sobre window de selector-alquiler-vs-compra, 3111). Las
   * preguntas tienen 3, 4 o 5 opciones, la botonera se mueve bajo el dedo y el segundo toque caía
   * en una opción de la pregunta nueva, en «Anterior» o en una tarjeta de Apps relacionadas, que
   * sacaba de la app. Un clic se ignora cuando es el 2.º de una ráfaga (`detail` > 1, que el
   * teclado no produce) Y el clic anterior de la app cambió de pantalla.
   */
  const ultimoCambioPantalla = useRef(false);
  useEffect(() => {
    function filtrar(e: MouseEvent) {
      if (e.detail > 1 && ultimoCambioPantalla.current) {
        e.preventDefault();
        e.stopPropagation();
      } else if (e.detail <= 1) {
        ultimoCambioPantalla.current = false;
      }
    }
    window.addEventListener('click', filtrar, true);
    return () => window.removeEventListener('click', filtrar, true);
  }, []);
  const cambiaPantalla = () => {
    ultimoCambioPantalla.current = true;
    navegado.current = true;
  };

  const totalPreguntas = PREGUNTAS.length;
  const pregunta = PREGUNTAS[preguntaActual];
  const respuestaActual = respuestas[preguntaActual];
  const progresoPct = ((preguntaActual + (respuestaActual !== null ? 1 : 0)) / totalPreguntas) * 100;

  const seleccionarOpcion = (idx: number) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaActual] = idx;
    setRespuestas(nuevasRespuestas);
  };

  // Avanza desde la pregunta DEL RENDER (`preguntaActual + 1`): dos clics antes de repintar no
  // saltan una pregunta.
  const avanzar = () => {
    if (respuestaActual === null) return;
    cambiaPantalla();
    if (preguntaActual < totalPreguntas - 1) {
      setPreguntaActual(preguntaActual + 1);
    } else {
      setResultado(calcularResultado(respuestas));
    }
  };

  const retroceder = () => {
    if (preguntaActual > 0) {
      cambiaPantalla();
      setPreguntaActual(preguntaActual - 1);
    }
  };

  const reiniciar = () => {
    cambiaPantalla();
    setRespuestas(Array(PREGUNTAS.length).fill(null));
    setPreguntaActual(0);
    setResultado(null);
  };

  const info = resultado ? RESULTADOS[resultado.ganador] : null;
  const alternativas = resultado ? resultado.alternativas : [];
  const explicacion = resultado ? porQue(resultado) : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>¿Qué Tablet Necesitas?</h1>
        <p>Responde 10 preguntas y descubre qué tipo de tablet se adapta mejor a tu estilo de vida</p>
      </header>

      <LegalNotice />

      {!resultado ? (
        <main className={styles.quiz} aria-label="Test selector de tablet">
          <div className={styles.progreso} role="progressbar" aria-valuenow={Math.round(progresoPct)} aria-valuemin={0} aria-valuemax={100} aria-label={`Pregunta ${preguntaActual + 1} de ${totalPreguntas}`}>
            <span className={styles.progresoTexto}>{preguntaActual + 1} / {totalPreguntas}</span>
            <div className={styles.progresoBar}>
              <div className={styles.progresoFill} style={{ width: `${progresoPct}%` }} />
            </div>
          </div>

          <div className={styles.pregunta}>
            <span className={styles.numeroPregunta} aria-hidden="true">Pregunta {preguntaActual + 1}</span>
            {/* Recibe el foco por programa al cambiar de pregunta (tabIndex=-1, hallazgo 3200). */}
            <h2 ref={enunciado} tabIndex={-1} className={styles.enunciado}>{pregunta.texto}</h2>

            <div className={styles.opciones} role="radiogroup" aria-label={pregunta.texto}>
              {pregunta.opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.opcion}${respuestaActual === idx ? ` ${styles.seleccionada}` : ''}`}
                  onClick={() => seleccionarOpcion(idx)}
                  // role="radio" + aria-checked, no aria-pressed: la elección es ÚNICA entre varias,
                  // no un conmutador (hallazgo 3199; selector-smartphone, 950).
                  role="radio"
                  aria-checked={respuestaActual === idx}
                >
                  <span className={styles.opcionIcono} aria-hidden="true">{opcion.icono}</span>
                  <span>{opcion.texto}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.navBotones}>
            {preguntaActual > 0 && (
              <button type="button" className={styles.btnSecundario} onClick={retroceder}>
                ← Anterior
              </button>
            )}
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={avanzar}
              disabled={respuestaActual === null}
              aria-disabled={respuestaActual === null}
            >
              {preguntaActual < totalPreguntas - 1 ? 'Siguiente →' : 'Ver resultado'}
            </button>
          </div>
        </main>
      ) : (
        <main className={styles.resultado} aria-label="Resultado del test">
          {info && (
            <div className={styles.resultadoCard} role="region" aria-label={`Tu tablet ideal: ${info.titulo}`}>
              <span className={styles.resultadoEmoji} aria-hidden="true">{info.emoji}</span>
              <h2 ref={tituloResultado} tabIndex={-1}>{info.titulo}</h2>
              {explicacion && <p className={styles.porque}>{explicacion}</p>}
              {/* Un empate no se resuelve en silencio por el orden del código (hallazgo 3198). */}
              {resultado && resultado.empatadas.length > 0 && (
                <p className={styles.porque} role="note">
                  <span aria-hidden="true">⚖️</span> Empate: con tus respuestas,{' '}
                  {enumerar([resultado.ganador, ...resultado.empatadas].map((k) => CON_ARTICULO[k]))} suman
                  los mismos puntos ({resultado.totales[resultado.ganador]}) y encajan igual de bien: el
                  orden en que aparecen no las distingue.
                </p>
              )}
              {/* Lo declarado como imprescindible que la recomendación no cumple (hallazgo 3197). */}
              {resultado && resultado.requisitosIncumplidos.map((req) => (
                <p key={req} className={styles.porque} role="note">
                  <span aria-hidden="true">⚠️</span> {textoRequisito(req, resultado)}
                </p>
              ))}
              <p>{info.descripcion}</p>
              <div className={styles.caracteristicas}>
                <h3>{info.queMirar}</h3>
                <ul>
                  {info.caracteristicas.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
              <button type="button" className={styles.btnReiniciar} onClick={reiniciar}>
                Repetir el test
              </button>
            </div>
          )}

          {alternativas.length > 0 && (
            <div className={styles.alternativas}>
              <h3>También podrías considerar</h3>
              {alternativas.map((alt) => (
                <div key={alt} className={styles.alternativaItem}>
                  <span>{ALTERNATIVAS_LABELS[alt]}</span>
                </div>
              ))}
            </div>
          )}

          <div className={styles.warningBox} role="note">
            <strong>Nota:</strong> Este selector ofrece una orientación general basada en tus respuestas. Te recomendamos leer análisis y comparativas actualizadas antes de realizar la compra.
          </div>

          <DisclaimerCard variant="general" severity="low" />
        </main>
      )}

      {/* Fuera de las pantallas: antes vivía dentro del resultado, así que el HTML servido no traía
          la guía (ni la «comparativa tablet vs portátil» que promete la description) y quien no
          terminaba el test no la veía (hallazgo 3204; forma del 2663 de selector-smartphone). */}
          <EducationalSection
            title="Todo lo que necesitas saber antes de comprar una tablet"
            subtitle="Guía práctica para elegir el dispositivo adecuado según tus necesidades reales"
          >
            <h3>Tipos de tablets: diferencias clave</h3>
            <p>
              El mercado de tablets se divide principalmente en cuatro categorías: <strong>Android</strong> (de muchos fabricantes), <strong>iPadOS</strong> (solo la fabrica Apple), <strong>Windows 2 en 1</strong> (de varios fabricantes de portátiles) y <strong>eReaders</strong> de tinta electrónica. Cada una tiene un caso de uso ideal.
            </p>

            <h3>¿Tablet Android o con iPadOS?</h3>
            <p>
              Las tablets Android ofrecen una relación calidad-precio mejor en gamas medias y bajas, y mayor libertad para personalizar el sistema. Las tablets con iPadOS destacan en creatividad, dibujo con lápiz digital y la calidad del ecosistema de apps, aunque su precio suele ser superior. Si ya tienes iPhone o Mac, se integran de forma natural.
            </p>

            <h3>¿Cuándo elegir una tablet Windows?</h3>
            <p>
              Una tablet Windows (o 2 en 1) es la mejor opción cuando necesitas ejecutar programas de escritorio completos: Adobe Photoshop, AutoCAD, software de contabilidad, etc. También es ideal si quieres un único dispositivo que reemplace al portátil (laptop o notebook) con la flexibilidad de la pantalla táctil.
            </p>

            <h3>eReaders: la opción olvidada</h3>
            <p>
              Si tu uso principal es leer libros y artículos largos, un eReader ofrece ventajas que ninguna tablet puede igualar: pantalla de tinta electrónica sin reflejos, batería de semanas, peso mínimo y ausencia de distracciones. Son perfectos para lectores habituales.
            </p>

            <h3>¿Tablet o portátil (laptop/notebook)?</h3>
            <p>
              Muchos usuarios descubren que su smartphone grande (6,5&quot; o más) y su portátil (laptop o notebook) cubren todas sus necesidades sin necesidad de un dispositivo intermedio. Una tablet aporta valor real cuando lees mucho en pantalla grande, dibujas digitalmente, tienes hijos en edad escolar o necesitas un segundo dispositivo más ligero para viajar. Si tu prioridad es escribir documentos largos o usar software profesional, un portátil sigue siendo más versátil que cualquier tablet.
            </p>

            <h3>Tamaño: ¿compacta o grande?</h3>
            <p>
              Las tablets de 8-10 pulgadas son más portátiles y cómodas para leer. Las de 11-13 pulgadas ofrecen mejor experiencia para trabajar, dibujar y ver contenido. Las tablets Windows suelen ser de 12-14 pulgadas para competir con portátiles.
            </p>
          </EducationalSection>

      <RelatedApps />
      <ShareCard appName="selector-tablet" />
      <Footer appName="selector-tablet" />
    </div>
  );
}
