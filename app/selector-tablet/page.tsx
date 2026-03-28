'use client';

import { useState } from 'react';
import styles from './SelectorTablet.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoTablet = 'android' | 'ios_ipad' | 'windows' | 'ereader' | 'sin_tablet';

interface PuntajeMap {
  android: number;
  ios_ipad: number;
  windows: number;
  ereader: number;
  sin_tablet: number;
}

interface Opcion {
  texto: string;
  icono: string;
  puntaje: Partial<PuntajeMap>;
}

interface Pregunta {
  id: number;
  texto: string;
  opciones: Opcion[];
}

interface ResultadoInfo {
  tipo: TipoTablet;
  emoji: string;
  titulo: string;
  descripcion: string;
}

// ─── Datos ────────────────────────────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuál será tu uso principal de la tablet?',
    opciones: [
      { texto: 'Leer libros, revistas o artículos', icono: '📚', puntaje: { ereader: 4, android: 1 } },
      { texto: 'Entretenimiento: vídeo, música y redes sociales', icono: '🎬', puntaje: { android: 3, ios_ipad: 2 } },
      { texto: 'Trabajo y productividad (documentos, correo, videollamadas)', icono: '💼', puntaje: { windows: 3, ios_ipad: 2, android: 1 } },
      { texto: 'Dibujo digital y creatividad', icono: '🎨', puntaje: { ios_ipad: 4, android: 2 } },
      { texto: 'Estudio (apuntes, PDFs, apps educativas)', icono: '🎓', puntaje: { ios_ipad: 3, android: 2, windows: 2 } },
    ],
  },
  {
    id: 2,
    texto: '¿Tienes ya smartphone y cuál es su sistema operativo?',
    opciones: [
      { texto: 'Sí, tengo iPhone (iOS)', icono: '📱', puntaje: { ios_ipad: 3 } },
      { texto: 'Sí, tengo Android', icono: '🤖', puntaje: { android: 2 } },
      { texto: 'No tengo smartphone o tengo un modelo básico', icono: '📵', puntaje: { android: 1, ios_ipad: 1 } },
    ],
  },
  {
    id: 3,
    texto: '¿Cuánto estás dispuesto/a a gastar en la tablet?',
    opciones: [
      { texto: 'Menos de 150 €', icono: '💶', puntaje: { android: 3, ereader: 3, sin_tablet: 2 } },
      { texto: 'Entre 150 € y 350 €', icono: '💵', puntaje: { android: 3, ereader: 2 } },
      { texto: 'Entre 350 € y 700 €', icono: '💴', puntaje: { ios_ipad: 2, android: 1, windows: 2 } },
      { texto: 'Más de 700 €', icono: '💎', puntaje: { ios_ipad: 3, windows: 3 } },
    ],
  },
  {
    id: 4,
    texto: '¿Necesitarás teclado físico para escribir documentos largos?',
    opciones: [
      { texto: 'Sí, es fundamental para mí', icono: '⌨️', puntaje: { windows: 4, ios_ipad: 2 } },
      { texto: 'A veces, pero no es imprescindible', icono: '🤔', puntaje: { ios_ipad: 2, android: 1 } },
      { texto: 'No, escribiré poco o usaré teclado táctil', icono: '👆', puntaje: { android: 2, ereader: 2, sin_tablet: 1 } },
    ],
  },
  {
    id: 5,
    texto: '¿Piensas usar lápiz digital o stylus para dibujar o tomar apuntes?',
    opciones: [
      { texto: 'Sí, es una de mis razones principales para comprar tablet', icono: '✏️', puntaje: { ios_ipad: 4, android: 2 } },
      { texto: 'Quizás lo use ocasionalmente', icono: '🖊️', puntaje: { ios_ipad: 1, android: 1 } },
      { texto: 'No lo usaré', icono: '🚫', puntaje: { android: 1, ereader: 2, sin_tablet: 1 } },
    ],
  },
  {
    id: 6,
    texto: '¿Cuánto lees actualmente (libros, artículos largos)?',
    opciones: [
      { texto: 'Leo mucho, es mi actividad principal en pantalla', icono: '📖', puntaje: { ereader: 4, android: 1 } },
      { texto: 'Leo con regularidad, pero también hago otras cosas', icono: '📰', puntaje: { android: 2, ios_ipad: 1, ereader: 1 } },
      { texto: 'Leo poco; prefiero vídeo y redes sociales', icono: '🎥', puntaje: { android: 2, ios_ipad: 2, sin_tablet: 1 } },
    ],
  },
  {
    id: 7,
    texto: '¿Necesitas compatibilidad con software profesional de escritorio (Adobe CC, Office completo, programas específicos de tu sector)?',
    opciones: [
      { texto: 'Sí, es imprescindible', icono: '🖥️', puntaje: { windows: 4, sin_tablet: 1 } },
      { texto: 'Prefiero versiones móviles o web de esas apps', icono: '☁️', puntaje: { ios_ipad: 2, android: 2 } },
      { texto: 'No necesito software de escritorio', icono: '📲', puntaje: { android: 2, ereader: 1, sin_tablet: 1 } },
    ],
  },
  {
    id: 8,
    texto: '¿Es para un niño o adolescente?',
    opciones: [
      { texto: 'Sí, para un niño menor de 10 años', icono: '👧', puntaje: { android: 3 } },
      { texto: 'Sí, para un adolescente (10-17 años)', icono: '🧑', puntaje: { android: 2, ios_ipad: 2 } },
      { texto: 'No, es para uso adulto', icono: '🧑‍💼', puntaje: { ios_ipad: 1, windows: 1, ereader: 1 } },
    ],
  },
  {
    id: 9,
    texto: '¿Viajas frecuentemente y necesitas usarla fuera de casa durante horas?',
    opciones: [
      { texto: 'Sí, la usaré mucho en transporte y viajes', icono: '✈️', puntaje: { ereader: 2, ios_ipad: 2, android: 2 } },
      { texto: 'Ocasionalmente, pero principalmente en casa', icono: '🏠', puntaje: { android: 1, ereader: 1, sin_tablet: 1 } },
      { texto: 'Prácticamente siempre en casa o la oficina', icono: '🖥️', puntaje: { windows: 1, sin_tablet: 2 } },
    ],
  },
  {
    id: 10,
    texto: '¿Ya tienes un portátil o PC que usas con frecuencia?',
    opciones: [
      { texto: 'Sí, tengo portátil Windows y lo uso mucho', icono: '💻', puntaje: { android: 2, ereader: 1, sin_tablet: 3 } },
      { texto: 'Sí, tengo Mac y lo uso mucho', icono: '🍎', puntaje: { ios_ipad: 3, android: 1 } },
      { texto: 'Tengo PC pero lo uso poco o quiero reemplazarlo', icono: '🖥️', puntaje: { windows: 2, ios_ipad: 1 } },
      { texto: 'No tengo portátil o mi PC está anticuado', icono: '❌', puntaje: { windows: 3, ios_ipad: 2, android: 2 } },
    ],
  },
];

const RESULTADOS: Record<TipoTablet, ResultadoInfo> = {
  android: {
    tipo: 'android',
    emoji: '🤖',
    titulo: 'Tablet Android',
    descripcion:
      'Mayor variedad de precios y tamaños, ecosistema abierto, ideal para entretenimiento y uso general. Encontrarás opciones desde 100 € hasta gamas altas como Samsung Galaxy Tab.',
  },
  ios_ipad: {
    tipo: 'ios_ipad',
    emoji: '🍎',
    titulo: 'iPad (iOS)',
    descripcion:
      'La mejor opción para creatividad, dibujo digital y apps de productividad premium. Ofrece la mejor integración con iPhone y Mac, y una experiencia de usuario muy pulida.',
  },
  windows: {
    tipo: 'windows',
    emoji: '🪟',
    titulo: 'Tablet Windows (2 en 1)',
    descripcion:
      'Para quienes necesitan un ordenador portátil compacto con compatibilidad total con programas de escritorio. Ideal si quieres sustituir tu portátil con flexibilidad táctil.',
  },
  ereader: {
    tipo: 'ereader',
    emoji: '📚',
    titulo: 'eReader (lector de libros electrónicos)',
    descripcion:
      'Para lectura intensiva con batería de semanas, sin distracciones y con pantalla sin reflejos. Dispositivos como Kindle o Kobo ofrecen la mejor experiencia de lectura posible.',
  },
  sin_tablet: {
    tipo: 'sin_tablet',
    emoji: '📱',
    titulo: 'Sin Tablet — Tu Smartphone o Portátil son Suficientes',
    descripcion:
      'Si tu uso no justifica un dispositivo extra, el smartphone o portátil cubren tus necesidades perfectamente. Ahórrate el gasto y la complejidad de gestionar otro dispositivo.',
  },
};

const ALTERNATIVAS_LABELS: Record<TipoTablet, string> = {
  android: '🤖 Tablet Android',
  ios_ipad: '🍎 iPad (iOS)',
  windows: '🪟 Tablet Windows',
  ereader: '📚 eReader',
  sin_tablet: '📱 Sin tablet adicional',
};

// ─── Lógica de cálculo ────────────────────────────────────────────────────────

function calcularResultado(respuestas: (number | null)[]): TipoTablet {
  const totales: PuntajeMap = { android: 0, ios_ipad: 0, windows: 0, ereader: 0, sin_tablet: 0 };

  respuestas.forEach((respuestaIdx, preguntaIdx) => {
    if (respuestaIdx === null) return;
    const opcion = PREGUNTAS[preguntaIdx]?.opciones[respuestaIdx];
    if (!opcion) return;
    (Object.keys(opcion.puntaje) as TipoTablet[]).forEach((tipo) => {
      totales[tipo] += opcion.puntaje[tipo] ?? 0;
    });
  });

  return (Object.keys(totales) as TipoTablet[]).reduce(
    (mejor, tipo) => (totales[tipo as TipoTablet] > totales[mejor] ? (tipo as TipoTablet) : mejor),
    'android' as TipoTablet,
  );
}

function calcularAlternativas(respuestas: (number | null)[], ganador: TipoTablet): TipoTablet[] {
  const totales: PuntajeMap = { android: 0, ios_ipad: 0, windows: 0, ereader: 0, sin_tablet: 0 };

  respuestas.forEach((respuestaIdx, preguntaIdx) => {
    if (respuestaIdx === null) return;
    const opcion = PREGUNTAS[preguntaIdx]?.opciones[respuestaIdx];
    if (!opcion) return;
    (Object.keys(opcion.puntaje) as TipoTablet[]).forEach((tipo) => {
      totales[tipo as TipoTablet] += opcion.puntaje[tipo] ?? 0;
    });
  });

  return (Object.keys(totales) as TipoTablet[])
    .filter((t) => t !== ganador)
    .sort((a, b) => totales[b as TipoTablet] - totales[a as TipoTablet])
    .slice(0, 2) as TipoTablet[];
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function SelectorTabletPage() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(
    Array(PREGUNTAS.length).fill(null),
  );
  const [resultado, setResultado] = useState<TipoTablet | null>(null);

  const totalPreguntas = PREGUNTAS.length;
  const pregunta = PREGUNTAS[preguntaActual];
  const respuestaActual = respuestas[preguntaActual];
  const progresoPct = ((preguntaActual + (respuestaActual !== null ? 1 : 0)) / totalPreguntas) * 100;

  const seleccionarOpcion = (idx: number) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaActual] = idx;
    setRespuestas(nuevasRespuestas);
  };

  const avanzar = () => {
    if (respuestaActual === null) return;
    if (preguntaActual < totalPreguntas - 1) {
      setPreguntaActual((p) => p + 1);
    } else {
      const ganador = calcularResultado(respuestas);
      setResultado(ganador);
    }
  };

  const retroceder = () => {
    if (preguntaActual > 0) {
      setPreguntaActual((p) => p - 1);
    }
  };

  const reiniciar = () => {
    setRespuestas(Array(PREGUNTAS.length).fill(null));
    setPreguntaActual(0);
    setResultado(null);
  };

  const info = resultado ? RESULTADOS[resultado] : null;
  const alternativas = resultado ? calcularAlternativas(respuestas, resultado) : [];

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
            <h2>{pregunta.texto}</h2>

            <div className={styles.opciones} role="group" aria-label={`Opciones para: ${pregunta.texto}`}>
              {pregunta.opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.opcion}${respuestaActual === idx ? ` ${styles.seleccionada}` : ''}`}
                  onClick={() => seleccionarOpcion(idx)}
                  aria-pressed={respuestaActual === idx}
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
              <h2>{info.titulo}</h2>
              <p>{info.descripcion}</p>
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

          <EducationalSection
            title="Todo lo que necesitas saber antes de comprar una tablet"
            subtitle="Guía práctica para elegir el dispositivo adecuado según tus necesidades reales"
          >
            <h3>Tipos de tablets: diferencias clave</h3>
            <p>
              El mercado de tablets se divide principalmente en cuatro categorías: <strong>Android</strong> (Samsung Galaxy Tab, Lenovo, Xiaomi), <strong>iPad</strong> (Apple), <strong>Windows 2 en 1</strong> (Surface, HP Spectre) y <strong>eReaders</strong> (Kindle, Kobo). Cada una tiene un caso de uso ideal.
            </p>

            <h3>¿Tablet Android o iPad?</h3>
            <p>
              Las tablets Android ofrecen una relación calidad-precio mejor en gamas medias y bajas, y mayor libertad para personalizar el sistema. Los iPads destacan en creatividad, dibujo con Apple Pencil y la calidad del ecosistema de apps, aunque su precio suele ser superior. Si ya tienes iPhone o Mac, el iPad se integra de forma natural.
            </p>

            <h3>¿Cuándo elegir una tablet Windows?</h3>
            <p>
              Una tablet Windows (o 2 en 1) es la mejor opción cuando necesitas ejecutar programas de escritorio completos: Adobe Photoshop, AutoCAD, software de contabilidad, etc. También es ideal si quieres un único dispositivo que reemplace al portátil con la flexibilidad de la pantalla táctil.
            </p>

            <h3>eReaders: la opción olvidada</h3>
            <p>
              Si tu uso principal es leer libros y artículos largos, un eReader como el Kindle Paperwhite ofrece ventajas que ninguna tablet puede igualar: pantalla de tinta electrónica sin reflejos, batería de semanas, peso mínimo y ausencia de distracciones. Son perfectos para lectores habituales.
            </p>

            <h3>¿Necesitas realmente una tablet?</h3>
            <p>
              Muchos usuarios descubren que su smartphone grande (6,5&quot; o más) y su portátil cubren todas sus necesidades sin necesidad de un dispositivo intermedio. Una tablet aporta valor real cuando lees mucho en pantalla grande, dibujas digitalmente, tienes hijos en edad escolar o necesitas un segundo dispositivo más ligero para viajar.
            </p>

            <h3>Tamaño: ¿compacta o grande?</h3>
            <p>
              Las tablets de 8-10 pulgadas son más portátiles y cómodas para leer. Las de 11-13 pulgadas ofrecen mejor experiencia para trabajar, dibujar y ver contenido. Las tablets Windows suelen ser de 12-14 pulgadas para competir con portátiles.
            </p>
          </EducationalSection>

          <RelatedApps apps={getRelatedApps('selector-tablet')} />
          <ShareCard appName="selector-tablet" />
          <Footer appName="selector-tablet" />
        </main>
      )}

      {!resultado && (
        <>
          <RelatedApps apps={getRelatedApps('selector-tablet')} />
          <ShareCard appName="selector-tablet" />
          <Footer appName="selector-tablet" />
        </>
      )}
    </div>
  );
}
