'use client';

import React, { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import DisclaimerCard from '@/components/DisclaimerCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import styles from './SelectorAuriculares.module.css';

/* ============================================================
   TIPOS
   ============================================================ */
type TipoAuricular = 'in_ear_tws' | 'over_ear_anc' | 'deportivos' | 'gaming' | 'cable';

interface Pesos {
  in_ear_tws: number;
  over_ear_anc: number;
  deportivos: number;
  gaming: number;
  cable: number;
}

interface Opcion {
  texto: string;
  pesos: Pesos;
}

interface Pregunta {
  id: number;
  texto: string;
  opciones: Opcion[];
}

interface ResultadoInfo {
  icono: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  ventajas: string[];
  consejos: string[];
}

/* ============================================================
   PREGUNTAS DEL TEST
   ============================================================ */
const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuál es tu uso principal de los auriculares?',
    opciones: [
      {
        texto: 'Música y podcasts en el día a día',
        pesos: { in_ear_tws: 3, over_ear_anc: 1, deportivos: 1, gaming: 0, cable: 2 },
      },
      {
        texto: 'Videollamadas y reuniones de trabajo',
        pesos: { in_ear_tws: 2, over_ear_anc: 3, deportivos: 0, gaming: 1, cable: 1 },
      },
      {
        texto: 'Videojuegos (PC, consola o móvil)',
        pesos: { in_ear_tws: 0, over_ear_anc: 0, deportivos: 0, gaming: 5, cable: 1 },
      },
      {
        texto: 'Deporte y actividad física',
        pesos: { in_ear_tws: 1, over_ear_anc: 0, deportivos: 5, gaming: 0, cable: 0 },
      },
      {
        texto: 'Escucha crítica o audiófilos',
        pesos: { in_ear_tws: 0, over_ear_anc: 2, deportivos: 0, gaming: 0, cable: 4 },
      },
    ],
  },
  {
    id: 2,
    texto: '¿Dónde los usarás principalmente?',
    opciones: [
      {
        texto: 'En movimiento: transporte público, calle, viajes',
        pesos: { in_ear_tws: 4, over_ear_anc: 3, deportivos: 2, gaming: 0, cable: 0 },
      },
      {
        texto: 'En casa o la oficina, en un sitio fijo',
        pesos: { in_ear_tws: 1, over_ear_anc: 2, deportivos: 0, gaming: 4, cable: 4 },
      },
      {
        texto: 'Haciendo ejercicio al aire libre o en el gimnasio',
        pesos: { in_ear_tws: 1, over_ear_anc: 0, deportivos: 5, gaming: 0, cable: 0 },
      },
      {
        texto: 'En un entorno de oficina abierta con mucho ruido',
        pesos: { in_ear_tws: 1, over_ear_anc: 5, deportivos: 0, gaming: 1, cable: 1 },
      },
    ],
  },
  {
    id: 3,
    texto: '¿Necesitas cancelación de ruido activa (ANC)?',
    opciones: [
      {
        texto: 'Sí, es fundamental para concentrarme o viajar',
        pesos: { in_ear_tws: 1, over_ear_anc: 5, deportivos: 0, gaming: 0, cable: 0 },
      },
      {
        texto: 'Me vendría bien pero no es imprescindible',
        pesos: { in_ear_tws: 2, over_ear_anc: 3, deportivos: 0, gaming: 1, cable: 1 },
      },
      {
        texto: 'No, prefiero escuchar lo que pasa a mi alrededor',
        pesos: { in_ear_tws: 2, over_ear_anc: 0, deportivos: 3, gaming: 1, cable: 2 },
      },
      {
        texto: 'No lo sé, nunca lo he probado',
        pesos: { in_ear_tws: 2, over_ear_anc: 2, deportivos: 1, gaming: 1, cable: 2 },
      },
    ],
  },
  {
    id: 4,
    texto: '¿Harás deporte o actividad física con ellos?',
    opciones: [
      {
        texto: 'Sí, ejercicio intenso: running, ciclismo, crossfit…',
        pesos: { in_ear_tws: 0, over_ear_anc: 0, deportivos: 6, gaming: 0, cable: 0 },
      },
      {
        texto: 'Actividad ligera: paseos, yoga, stretching',
        pesos: { in_ear_tws: 3, over_ear_anc: 0, deportivos: 3, gaming: 0, cable: 0 },
      },
      {
        texto: 'No, son para uso sedentario',
        pesos: { in_ear_tws: 2, over_ear_anc: 3, deportivos: 0, gaming: 3, cable: 3 },
      },
    ],
  },
  {
    id: 5,
    texto: '¿Juegas a videojuegos y necesitas audio posicional o chat de voz?',
    opciones: [
      {
        texto: 'Sí, gaming es mi uso principal y necesito precisión sonora',
        pesos: { in_ear_tws: 0, over_ear_anc: 0, deportivos: 0, gaming: 6, cable: 1 },
      },
      {
        texto: 'Juego de vez en cuando, no es mi uso principal',
        pesos: { in_ear_tws: 2, over_ear_anc: 1, deportivos: 0, gaming: 2, cable: 2 },
      },
      {
        texto: 'No juego a videojuegos',
        pesos: { in_ear_tws: 3, over_ear_anc: 2, deportivos: 2, gaming: 0, cable: 2 },
      },
    ],
  },
  {
    id: 6,
    texto: '¿Prefieres que sean inalámbricos o no te importa el cable?',
    opciones: [
      {
        texto: 'Inalámbricos, sin cables sí o sí',
        pesos: { in_ear_tws: 5, over_ear_anc: 3, deportivos: 3, gaming: 2, cable: 0 },
      },
      {
        texto: 'No me importa el cable si la calidad es mejor',
        pesos: { in_ear_tws: 0, over_ear_anc: 0, deportivos: 0, gaming: 1, cable: 5 },
      },
      {
        texto: 'Prefiero inalámbrico, pero acepto cable para gaming',
        pesos: { in_ear_tws: 2, over_ear_anc: 1, deportivos: 1, gaming: 3, cable: 1 },
      },
      {
        texto: 'Me da igual, lo que funcione mejor',
        pesos: { in_ear_tws: 2, over_ear_anc: 2, deportivos: 1, gaming: 2, cable: 2 },
      },
    ],
  },
  {
    id: 7,
    texto: '¿Cuál es tu presupuesto aproximado?',
    opciones: [
      {
        texto: 'Hasta 50 €',
        pesos: { in_ear_tws: 3, over_ear_anc: 0, deportivos: 2, gaming: 2, cable: 2 },
      },
      {
        texto: 'Entre 50 € y 150 €',
        pesos: { in_ear_tws: 3, over_ear_anc: 2, deportivos: 3, gaming: 3, cable: 2 },
      },
      {
        texto: 'Entre 150 € y 350 €',
        pesos: { in_ear_tws: 2, over_ear_anc: 4, deportivos: 2, gaming: 3, cable: 3 },
      },
      {
        texto: 'Más de 350 €',
        pesos: { in_ear_tws: 1, over_ear_anc: 3, deportivos: 1, gaming: 2, cable: 4 },
      },
    ],
  },
  {
    id: 8,
    texto: '¿Cuánta autonomía de batería necesitas?',
    opciones: [
      {
        texto: 'Pocas horas, lo cargo cada día',
        pesos: { in_ear_tws: 4, over_ear_anc: 2, deportivos: 3, gaming: 2, cable: 5 },
      },
      {
        texto: 'Al menos una jornada laboral completa (8 h)',
        pesos: { in_ear_tws: 2, over_ear_anc: 4, deportivos: 2, gaming: 3, cable: 5 },
      },
      {
        texto: 'Mucha batería, viajes largos o uso intensivo',
        pesos: { in_ear_tws: 1, over_ear_anc: 4, deportivos: 1, gaming: 2, cable: 5 },
      },
      {
        texto: 'No me importa la batería (o prefiero cable)',
        pesos: { in_ear_tws: 1, over_ear_anc: 1, deportivos: 0, gaming: 3, cable: 5 },
      },
    ],
  },
  {
    id: 9,
    texto: '¿Utilizas el micrófono frecuentemente para llamadas o reuniones?',
    opciones: [
      {
        texto: 'Sí, a diario para reuniones y llamadas de trabajo',
        pesos: { in_ear_tws: 3, over_ear_anc: 4, deportivos: 0, gaming: 3, cable: 1 },
      },
      {
        texto: 'Ocasionalmente, para llamadas personales',
        pesos: { in_ear_tws: 3, over_ear_anc: 2, deportivos: 1, gaming: 1, cable: 1 },
      },
      {
        texto: 'Casi nunca, solo escucho',
        pesos: { in_ear_tws: 2, over_ear_anc: 1, deportivos: 2, gaming: 0, cable: 3 },
      },
    ],
  },
  {
    id: 10,
    texto: '¿Qué priorizas más?',
    opciones: [
      {
        texto: 'Calidad de sonido por encima de todo',
        pesos: { in_ear_tws: 1, over_ear_anc: 3, deportivos: 0, gaming: 1, cable: 5 },
      },
      {
        texto: 'Comodidad y facilidad de uso cotidiano',
        pesos: { in_ear_tws: 4, over_ear_anc: 3, deportivos: 2, gaming: 2, cable: 1 },
      },
      {
        texto: 'Rendimiento en mi actividad principal (deporte/gaming)',
        pesos: { in_ear_tws: 0, over_ear_anc: 0, deportivos: 5, gaming: 5, cable: 1 },
      },
      {
        texto: 'Relación calidad-precio y durabilidad',
        pesos: { in_ear_tws: 3, over_ear_anc: 2, deportivos: 2, gaming: 2, cable: 3 },
      },
    ],
  },
];

/* ============================================================
   RESULTADOS
   ============================================================ */
const RESULTADOS: Record<TipoAuricular, ResultadoInfo> = {
  in_ear_tws: {
    icono: '🎵',
    titulo: 'Auriculares In-Ear TWS (Inalámbricos)',
    subtitulo: 'La opción más versátil para el día a día',
    descripcion:
      'Los auriculares True Wireless (TWS) son compactos, cómodos para el día a día y el transporte. Con estuche de carga integrado, ofrecen hasta 30-40 horas de autonomía total. Son la opción más versátil para música y llamadas en movimiento, y los modelos modernos incluyen ANC básico, resistencia al sudor y control por voz.',
    ventajas: [
      'Sin cables: máxima libertad de movimiento',
      'Compactos y fáciles de transportar con estuche de carga',
      'Compatibles con todos los dispositivos (Bluetooth)',
      'Gran oferta en el mercado a precios desde 30 €',
      'Muchos modelos incluyen ANC y resistencia al agua (IPX4+)',
    ],
    consejos: [
      'Busca certificación IPX4 o superior si los usas en exteriores o con actividad ligera.',
      'Comprueba la autonomía total (auricular + estuche): los mejores superan 30 h.',
      'Modelos recomendados por rango: Xiaomi Redmi Buds (< 50 €), Nothing Ear (50-100 €), Sony WF-1000XM5 o Apple AirPods Pro (> 150 €).',
      'Verifica la compatibilidad con tu dispositivo: los AirPods son ideales para iPhone, pero funcionan bien con Android.',
    ],
  },
  over_ear_anc: {
    icono: '🎧',
    titulo: 'Over-Ear con Cancelación de Ruido (ANC)',
    subtitulo: 'La mejor inmersión sonora para trabajo y viajes',
    descripcion:
      'Los auriculares circumaurales (over-ear) con cancelación de ruido activa (ANC) ofrecen la mejor experiencia sonora e inmersión. Ideales para trabajo en oficina abierta, viajes largos o necesitar concentración máxima. Su almohadilla envuelve la oreja por completo, aislando física y activamente el ruido exterior.',
    ventajas: [
      'Cancelación de ruido activa (ANC) de máxima eficacia',
      'Mejor calidad de sonido general por su mayor tamaño de driver',
      'Comodidad en sesiones largas gracias a las almohadillas envolventes',
      'Larga autonomía: 30-40 h en un solo ciclo de carga',
      'Micrófonos de alta calidad para reuniones y llamadas',
    ],
    consejos: [
      'Los modelos de referencia son Sony WH-1000XM5, Bose QuietComfort 45 y Apple AirPods Max.',
      'Si viajas mucho, busca plegabilidad y estuche incluido.',
      'Comprueba si el ANC es ajustable o tiene modo "transparencia" para escuchar el entorno cuando lo necesites.',
      'Para teletrabajo, verifica la calidad del micrófono: algunos modelos de gama media decepcionan en llamadas.',
    ],
  },
  deportivos: {
    icono: '🏃',
    titulo: 'Auriculares Deportivos',
    subtitulo: 'Diseñados para no caerse ni rendirse en movimiento',
    descripcion:
      'Los auriculares deportivos están diseñados para resistir el sudor y mantenerse seguros en la oreja durante el ejercicio. Con certificación IPX5 o superior, ganchos estabilizadores y ajuste ergonómico, no se caerán en tu carrera ni sesión de HIIT. Algunos modelos incorporan modo de transparencia para mantener la conciencia del entorno al correr en exteriores.',
    ventajas: [
      'Resistencia al agua y sudor (IPX5 o superior)',
      'Gancho o aleta estabilizadora para que no se caigan',
      'Ajuste ergonómico diseñado para el movimiento',
      'Modo de transparencia en modelos premium para mayor seguridad',
      'Buena autonomía para sesiones de entrenamiento típicas',
    ],
    consejos: [
      'Para running en exteriores, elige modelos con modo transparencia o de conducción ósea (como Shokz) para escuchar el tráfico.',
      'Busca certificación IP68 si nadas o sudas mucho.',
      'Modelos populares: Jabra Elite Active, Beats Powerbeats Pro, Bose Sport Earbuds.',
      'Si haces crossfit o actividad de mucho impacto, los ganchos sobre la oreja son más seguros que las aletas de silicona.',
    ],
  },
  gaming: {
    icono: '🎮',
    titulo: 'Auriculares Gaming',
    subtitulo: 'Audio posicional y micrófono para sesiones largas',
    descripcion:
      'Los auriculares gaming priorizan el audio posicional (sonido envolvente 7.1 virtual), micrófonos de alta calidad para comunicación en equipo y confort en sesiones de varias horas. Disponibles para PC, consola y móvil, con conexión USB, jack 3,5 mm o inalámbrica de baja latencia (2,4 GHz).',
    ventajas: [
      'Audio posicional 7.1 para localizar enemigos y efectos de sonido',
      'Micrófono boom desmontable con cancelación de ruido ambiental',
      'Almohadillas grandes y cómodas para sesiones largas',
      'Compatibilidad con PC, PlayStation, Xbox y Nintendo Switch',
      'Modelos inalámbricos de baja latencia (2,4 GHz) sin lag perceptible',
    ],
    consejos: [
      'Para PC, el audio USB o DAC integrado da mejor calidad que el jack de placa base.',
      'Marcas de referencia: SteelSeries, HyperX, Razer, Astro, Logitech G.',
      'Si juegas en consola, verifica la compatibilidad: no todos los modelos USB funcionan con PS5 y Xbox.',
      'El sonido 7.1 virtual depende del software del fabricante: instálalo y configura el perfil de juego para sacar el máximo partido.',
    ],
  },
  cable: {
    icono: '🔌',
    titulo: 'Auriculares de Cable',
    subtitulo: 'Sin preocupaciones de batería, latencia cero y más calidad por precio',
    descripcion:
      'Los auriculares con cable eliminan las preocupaciones de batería y latencia. Ofrecen la mejor calidad de sonido por precio, ya que todo el presupuesto va al driver y los materiales, no a la electrónica inalámbrica. Son la elección de audiófilos, productores musicales y quienes usan auriculares principalmente en casa o en el estudio.',
    ventajas: [
      'Sin batería: siempre listos para usar',
      'Latencia cero: ideal para producción musical o uso profesional',
      'Mejor calidad de sonido por precio (más driver por el mismo dinero)',
      'Más duraderos: sin electrónica inalámbrica que falle',
      'Compatibles con amplificadores y DACs para escucha crítica',
    ],
    consejos: [
      'Si tu dispositivo no tiene jack 3,5 mm, necesitarás un adaptador o un DAC USB-C (recomendado: FiiO BTR3K, Hidizs S9 Pro).',
      'Modelos de referencia por precio: Sennheiser HD 559 (< 100 €), AKG K371 (< 150 €), Beyerdynamic DT 990 Pro (< 200 €), Sony MDR-7506 (estudio).',
      'Para uso en casa, considera un amplificador de auriculares si la impedancia es alta (250 Ω o más).',
      'El cable suele ser desmontable en modelos de gama media y alta: esto multiplica la vida útil del auricular.',
    ],
  },
};

/* ============================================================
   FUNCIÓN DE CÁLCULO (weight-based)
   ============================================================ */
function calcularResultado(respuestas: (number | null)[]): TipoAuricular {
  const totales: Pesos = { in_ear_tws: 0, over_ear_anc: 0, deportivos: 0, gaming: 0, cable: 0 };

  respuestas.forEach((respIdx, pregIdx) => {
    if (respIdx === null) return;
    const pesos = PREGUNTAS[pregIdx].opciones[respIdx].pesos;
    (Object.keys(pesos) as TipoAuricular[]).forEach((tipo) => {
      totales[tipo] += pesos[tipo];
    });
  });

  return (Object.keys(totales) as TipoAuricular[]).reduce((max, tipo) =>
    totales[tipo as TipoAuricular] > totales[max] ? (tipo as TipoAuricular) : max
  , 'in_ear_tws' as TipoAuricular);
}

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */
export default function SelectorAuriculares() {
  const [preguntaActual, setPreguntaActual] = useState<number>(0);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(
    Array(PREGUNTAS.length).fill(null)
  );
  const [mostrarResultado, setMostrarResultado] = useState<boolean>(false);

  const pregunta = PREGUNTAS[preguntaActual];
  const esUltima = preguntaActual === PREGUNTAS.length - 1;
  const respuestaActual = respuestas[preguntaActual];
  const progresoPct = ((preguntaActual + 1) / PREGUNTAS.length) * 100;

  function seleccionarOpcion(indice: number): void {
    const nuevas = [...respuestas];
    nuevas[preguntaActual] = indice;
    setRespuestas(nuevas);
  }

  function irAnterior(): void {
    if (preguntaActual > 0) setPreguntaActual(preguntaActual - 1);
  }

  function irSiguiente(): void {
    if (preguntaActual < PREGUNTAS.length - 1) setPreguntaActual(preguntaActual + 1);
  }

  function verResultado(): void {
    setMostrarResultado(true);
  }

  function reiniciar(): void {
    setRespuestas(Array(PREGUNTAS.length).fill(null));
    setPreguntaActual(0);
    setMostrarResultado(false);
  }

  const tipoGanador = calcularResultado(respuestas);
  const resultado = RESULTADOS[tipoGanador];

  const claseResultado: Record<TipoAuricular, string> = {
    in_ear_tws: styles.resultado_in_ear_tws,
    over_ear_anc: styles.resultado_over_ear_anc,
    deportivos: styles.resultado_deportivos,
    gaming: styles.resultado_gaming,
    cable: styles.resultado_cable,
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>¿Qué auriculares necesitas?</h1>
        <p className={styles.heroSubtitle}>
          Responde 10 preguntas sobre tu uso, preferencias y presupuesto. Te diremos qué tipo
          de auriculares se adapta mejor a ti.
        </p>
      </header>

      <div className={styles.legalNoticeWrapper}>
        <LegalNotice />
      </div>

      {!mostrarResultado ? (
        <main className={styles.quiz} aria-label="Test de selección de auriculares">
          {/* Barra de progreso */}
          <div
            className={styles.progreso}
            role="progressbar"
            aria-valuenow={preguntaActual + 1}
            aria-valuemin={1}
            aria-valuemax={PREGUNTAS.length}
            aria-label={`Pregunta ${preguntaActual + 1} de ${PREGUNTAS.length}`}
          >
            <div className={styles.progresoBar}>
              <div className={styles.progresoFill} style={{ width: `${progresoPct}%` }} />
            </div>
          </div>

          {/* Pregunta */}
          <div className={styles.pregunta}>
            <p className={styles.preguntaNumero}>
              Pregunta {preguntaActual + 1} de {PREGUNTAS.length}
            </p>
            <p className={styles.preguntaTexto}>{pregunta.texto}</p>

            <div
              className={styles.opciones}
              role="group"
              aria-label={`Opciones para: ${pregunta.texto}`}
            >
              {pregunta.opciones.map((opcion, idx) => {
                const esSeleccionada = respuestaActual === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`${styles.opcion}${esSeleccionada ? ` ${styles.seleccionada}` : ''}`}
                    onClick={() => seleccionarOpcion(idx)}
                    aria-pressed={esSeleccionada}
                  >
                    {opcion.texto}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navegación */}
          <div className={styles.navegacion}>
            <button
              type="button"
              className={styles.btnAnterior}
              onClick={irAnterior}
              disabled={preguntaActual === 0}
              aria-label="Ir a la pregunta anterior"
            >
              ← Anterior
            </button>

            {!esUltima ? (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={irSiguiente}
                disabled={respuestaActual === null}
                aria-label="Ir a la siguiente pregunta"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={verResultado}
                disabled={respuestaActual === null}
                aria-label="Ver mi resultado"
              >
                Ver mi resultado →
              </button>
            )}
          </div>
        </main>
      ) : (
        <section className={styles.resultado} aria-label="Resultado del test">
          <div className={`${styles.resultadoCard} ${claseResultado[tipoGanador]}`}>
            <span className={styles.resultadoIcono} aria-hidden="true">
              {resultado.icono}
            </span>
            <h2 className={styles.resultadoTitulo}>{resultado.titulo}</h2>
            <p className={styles.resultadoSubtitulo}>{resultado.subtitulo}</p>
            <p className={styles.resultadoDesc}>{resultado.descripcion}</p>

            <div className={styles.ventajasSection}>
              <h3>Por qué encaja contigo</h3>
              <ul>
                {resultado.ventajas.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>

            <div className={styles.consejosSection}>
              <h3>Consejos para elegir bien</h3>
              <ol>
                {resultado.consejos.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ol>
            </div>

            <button
              type="button"
              className={styles.btnReiniciar}
              onClick={reiniciar}
              aria-label="Repetir el test desde el principio"
            >
              Repetir el test
            </button>
          </div>
        </section>
      )}

      <DisclaimerCard variant="general" severity="low" />

      <EducationalSection
        title="Guía de auriculares: tipos, tecnologías y claves de compra"
        subtitle="Todo lo que necesitas saber antes de decidirte"
      >
        <h2>In-Ear TWS: la revolución inalámbrica</h2>
        <p>
          Los auriculares True Wireless Stereo (TWS) llegaron al mercado masivo en 2016 con los
          AirPods de Apple y han evolucionado enormemente. Hoy ofrecen ANC de calidad, resistencia
          al agua, batería total de 30-40 horas con el estuche y conectividad Bluetooth 5.3 con
          códecs de alta resolución como aptX Lossless o LDAC.
        </p>
        <p>
          Son ideales para quienes buscan comodidad y versatilidad sin renunciar a la calidad.
          Su principal limitación frente a un over-ear de gama alta es el tamaño del driver
          (más pequeño) y la autonomía por carga (suelen ser 6-8 h por auricular).
        </p>

        <h2>Over-Ear ANC: inmersión y concentración total</h2>
        <p>
          Los auriculares circumaurales con cancelación de ruido activa son la mejor opción para
          trabajar en entornos ruidosos o viajar. La ANC funciona captando el ruido ambiente con
          micrófonos externos y generando una onda inversa que lo anula. Los modelos premium
          (Sony WH-1000XM5, Bose QC Ultra) reducen el ruido hasta 30-40 dB, haciendo
          prácticamente inaudible el ruido de cabina de avión o el murmullo de oficina.
        </p>
        <p>
          Su tamaño, además de aportar mejor sonido, los hace más cómodos en sesiones largas.
          La contrapartida: son más voluminosos para transportar y algunos usuarios sienten presión
          o calor en las orejas tras varias horas de uso.
        </p>

        <h2>Deportivos: resistencia ante todo</h2>
        <p>
          Los auriculares deportivos priorizan el agarre seguro y la resistencia al agua. Las
          certificaciones IP van del IPX4 (salpicaduras) al IP68 (sumergible). Para running al
          aire libre, los modelos de conducción ósea (Shokz OpenRun) transmiten el sonido a través
          de los huesos del cráneo, dejando los oídos libres para escuchar el entorno: una opción
          más segura en ciudad o montaña.
        </p>

        <h2>Gaming: más que cascos con micrófono</h2>
        <p>
          Los auriculares gaming modernos incorporan procesamiento de sonido espacial (virtual 7.1,
          Dolby Atmos, DTS:X) que permite localizar con precisión la dirección de los sonidos en el
          juego. Esto no es marketing: en FPS competitivos como CS2 o Valorant, escuchar los pasos
          de un enemigo por encima o detrás puede decidir una partida.
        </p>
        <p>
          Los modelos inalámbricos de gama alta (SteelSeries Arctis Nova Pro, Astro A50) usan
          transmisión a 2,4 GHz en lugar de Bluetooth, con latencia inferior a 20 ms, imperceptible
          en juego. Bluetooth tiene una latencia mayor (40-200 ms según códec) que puede notarse
          en algunos juegos de ritmo.
        </p>

        <h2>Cable: el estándar de los audiófilos</h2>
        <p>
          Los auriculares con cable siguen siendo la referencia en calidad sonora. Sin conversión
          Bluetooth ni compresión de audio, la señal llega limpia desde la fuente. En gama media
          (100-300 €), modelos como el Beyerdynamic DT 990 Pro (250 Ω) o el Sennheiser HD 650
          son imbatibles en fidelidad sonora frente a cualquier inalámbrico del mismo precio.
        </p>
        <p>
          Para aprovecharlos al máximo, considera un amplificador de auriculares o un DAC USB-C
          de calidad. La inversión en fuente de sonido limpia marca una diferencia notable,
          especialmente con impedancias altas.
        </p>

        <h2>Códecs Bluetooth: ¿qué significan?</h2>
        <p>
          El audio inalámbrico se comprime para transmitirse por Bluetooth. Los códecs determinan
          la calidad de esa compresión:
        </p>
        <ul>
          <li><strong>SBC</strong>: estándar básico, disponible en todos los dispositivos</li>
          <li><strong>AAC</strong>: mejor calidad, preferido por iPhone y Apple Music</li>
          <li><strong>aptX / aptX HD</strong>: alta calidad en Android, baja latencia</li>
          <li><strong>LDAC</strong>: el mejor de Sony, hasta 990 kbps (requiere Android y auricular compatible)</li>
          <li><strong>aptX Lossless</strong>: sin pérdidas, calidad CD, la más reciente</li>
        </ul>

        <div className={styles.warningBox} role="note">
          <strong>Recuerda:</strong> El mejor auricular es el que se adapta a tu uso real. Un
          TWS de 80 € que uses cada día te dará más satisfacción que unos over-ear de 400 €
          que encuentres incómodos o voluminosos para llevar. Antes de comprar, considera
          probarlo en tienda o buscar reseñas de usuarios con un perfil de uso similar al tuyo.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-auriculares')} />
      <ShareCard appName="selector-auriculares" />
      <Footer appName="selector-auriculares" />
    </div>
  );
}
