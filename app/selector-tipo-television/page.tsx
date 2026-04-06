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
import styles from './SelectorTipoTelevision.module.css';

// ── Tipos ──────────────────────────────────────────────────────────────────

type TecnologiaKey = 'oled' | 'qled' | 'led_ips' | 'led_va';

interface OpcionPregunta {
  texto: string;
  pesos: Partial<Record<TecnologiaKey, number>>;
}

interface Pregunta {
  id: number;
  texto: string;
  opciones: OpcionPregunta[];
}

interface Tecnologia {
  key: TecnologiaKey;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  ventajas: string[];
  limitaciones: string[];
  idealPara: string[];
  rangoPrecios: string;
  especificaciones: { titulo: string; valor: string }[];
}

// ── Datos de preguntas ─────────────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuál es tu presupuesto para la televisión?',
    opciones: [
      { texto: 'Menos de 400 €', pesos: { led_ips: 3, led_va: 3 } },
      { texto: 'Entre 400 € y 800 €', pesos: { led_ips: 2, led_va: 2, qled: 1 } },
      { texto: 'Entre 800 € y 1.500 €', pesos: { qled: 3, led_ips: 1 } },
      { texto: 'Más de 1.500 €', pesos: { oled: 4, qled: 2 } },
    ],
  },
  {
    id: 2,
    texto: '¿Para qué vas a usar principalmente la televisión?',
    opciones: [
      { texto: 'Ver películas y series en modo cine', pesos: { oled: 4, qled: 2 } },
      { texto: 'Gaming de alta respuesta', pesos: { oled: 3, led_ips: 2 } },
      { texto: 'Deportes y contenido en movimiento', pesos: { qled: 3, led_va: 2 } },
      { texto: 'Uso general variado', pesos: { led_ips: 3, qled: 2 } },
    ],
  },
  {
    id: 3,
    texto: '¿Cómo es la iluminación habitual de la habitación donde estará la TV?',
    opciones: [
      { texto: 'Muy oscura, siempre con las persianas bajadas', pesos: { oled: 4 } },
      { texto: 'Semi-oscura, luz controlada', pesos: { qled: 3, oled: 2 } },
      { texto: 'Con luz natural moderada', pesos: { qled: 3, led_va: 2 } },
      { texto: 'Muy iluminada, mucha luz solar directa', pesos: { qled: 4, led_va: 3 } },
    ],
  },
  {
    id: 4,
    texto: '¿Desde cuántos ángulos distintos verás la TV?',
    opciones: [
      { texto: 'Solo desde el frente, una sola posición', pesos: { led_va: 3, oled: 1 } },
      { texto: 'Desde varios ángulos pero principalmente el frente', pesos: { qled: 2, led_ips: 2 } },
      { texto: 'Desde muchos ángulos diferentes (salón grande, sofás laterales)', pesos: { oled: 4, led_ips: 3 } },
    ],
  },
  {
    id: 5,
    texto: '¿Juegas a videojuegos en esta televisión?',
    opciones: [
      { texto: 'Sí, mucho y quiero el mínimo input lag posible', pesos: { oled: 4, led_ips: 2 } },
      { texto: 'Sí, ocasionalmente', pesos: { qled: 2, led_ips: 2 } },
      { texto: 'No, nunca', pesos: { led_va: 2, qled: 1 } },
    ],
  },
  {
    id: 6,
    texto: '¿Qué tamaño de TV buscas?',
    opciones: [
      { texto: 'Hasta 50 pulgadas', pesos: { led_ips: 2, led_va: 2 } },
      { texto: 'Entre 55 y 65 pulgadas', pesos: { qled: 2, oled: 2 } },
      { texto: 'Más de 65 pulgadas', pesos: { qled: 3, led_va: 2 } },
    ],
  },
  {
    id: 7,
    texto: '¿La TV estará encendida muchas horas seguidas (más de 6 horas diarias)?',
    opciones: [
      { texto: 'Sí, prácticamente todo el día', pesos: { led_ips: 3, led_va: 3 } },
      { texto: 'Moderadamente, entre 3 y 6 horas diarias', pesos: { qled: 2, led_ips: 1 } },
      { texto: 'Poco, menos de 3 horas', pesos: { oled: 3, qled: 2 } },
    ],
  },
  {
    id: 8,
    texto: '¿Qué importancia le das a los negros perfectos y el contraste infinito?',
    opciones: [
      { texto: 'Es lo más importante para mí', pesos: { oled: 5 } },
      { texto: 'Es importante pero no lo único', pesos: { qled: 3 } },
      { texto: 'No me preocupa especialmente', pesos: { led_ips: 2, led_va: 2 } },
    ],
  },
  {
    id: 9,
    texto: '¿Usarás la TV también como monitor de ordenador?',
    opciones: [
      { texto: 'Sí, durante muchas horas (trabajo o estudio)', pesos: { led_ips: 4 } },
      { texto: 'Ocasionalmente', pesos: { qled: 2, led_ips: 2 } },
      { texto: 'No, solo para TV y entretenimiento', pesos: { oled: 1, qled: 1, led_va: 1 } },
    ],
  },
  {
    id: 10,
    texto: '¿Cuánto tiempo planeas quedarte con esta televisión?',
    opciones: [
      { texto: '2 o 3 años', pesos: { led_ips: 2, led_va: 2 } },
      { texto: 'Entre 4 y 6 años', pesos: { qled: 2, led_ips: 1 } },
      { texto: 'Más de 7 años', pesos: { oled: 2, qled: 2 } },
    ],
  },
];

// ── Datos de tecnologías ───────────────────────────────────────────────────

const TECNOLOGIAS: Record<TecnologiaKey, Tecnologia> = {
  oled: {
    key: 'oled',
    titulo: 'OLED',
    subtitulo: 'Contraste infinito y negros perfectos',
    descripcion:
      'La tecnología OLED utiliza píxeles autoiluminados que se apagan por completo para mostrar el negro. Esto genera un contraste prácticamente infinito, colores extremadamente precisos y tiempos de respuesta muy bajos. Es la elección de referencia para cine en casa y gaming exigente en habitaciones oscuras o semi-oscuras.',
    ventajas: [
      'Negros perfectos: cada píxel se apaga individualmente',
      'Contraste infinito (100.000:1 o superior)',
      'Colores absolutamente precisos, calibración de fábrica excelente',
      'Tiempo de respuesta < 1 ms, ideal para gaming',
      'Ángulos de visión casi perfectos en todas las direcciones',
      'Sin backlight bleeding ni efecto halo',
    ],
    limitaciones: [
      'Riesgo de burn-in (retención de imagen) con uso estático prolongado',
      'Brillo máximo inferior a QLED en habitaciones muy iluminadas',
      'Precio más elevado, especialmente en tamaños grandes',
      'No recomendado para uso como monitor de PC durante muchas horas',
    ],
    idealPara: [
      'Cine en casa y series en habitaciones oscuras',
      'Gaming competitivo o inmersivo',
      'Ver la TV desde varios ángulos del salón',
      'Quienes priorizan calidad de imagen sobre precio',
    ],
    rangoPrecios: '800 € – 4.000 €+',
    especificaciones: [
      { titulo: 'Contraste', valor: 'Infinito' },
      { titulo: 'Brillo', valor: 'Medio-alto' },
      { titulo: 'Ángulos visión', valor: 'Excelentes' },
      { titulo: 'Resp. gaming', valor: '< 1 ms' },
      { titulo: 'Burn-in', valor: 'Riesgo bajo-medio' },
    ],
  },
  qled: {
    key: 'qled',
    titulo: 'QLED / Mini-LED',
    subtitulo: 'Máximo brillo y colores vivos sin riesgo de burn-in',
    descripcion:
      'Los televisores QLED y Mini-LED utilizan puntos cuánticos (quantum dots) para mejorar la gama cromática de un panel LCD retroiluminado. Los modelos Mini-LED añaden miles de zonas de retroiluminación independientes para un control de la luz mucho más preciso. Son ideales para habitaciones iluminadas por su alto brillo y no tienen riesgo de burn-in.',
    ventajas: [
      'Brillo máximo muy alto (ideal con mucha luz ambiente)',
      'Gama de colores amplia y saturada gracias a los quantum dots',
      'Sin riesgo de burn-in, perfecto para uso prolongado',
      'Buena relación calidad-precio en gama media-alta',
      'Excelente para deportes y contenido de acción',
      'Disponible en tamaños grandes a precios razonables',
    ],
    limitaciones: [
      'Efecto halo o blooming alrededor de objetos brillantes en fondos oscuros',
      'Contraste inferior al OLED, aunque muy bueno en Mini-LED premium',
      'Ángulos de visión algo peores que OLED o IPS según el modelo',
    ],
    idealPara: [
      'Salones o habitaciones con mucha luz natural',
      'Ver deportes, noticias y contenido variado',
      'Familias con uso intensivo sin preocupación por burn-in',
      'Quienes buscan gran tamaño con buen presupuesto medio-alto',
    ],
    rangoPrecios: '400 € – 2.000 €',
    especificaciones: [
      { titulo: 'Contraste', valor: 'Muy bueno' },
      { titulo: 'Brillo', valor: 'Muy alto' },
      { titulo: 'Ángulos visión', valor: 'Buenos' },
      { titulo: 'Resp. gaming', valor: '4-8 ms' },
      { titulo: 'Burn-in', valor: 'Sin riesgo' },
    ],
  },
  led_ips: {
    key: 'led_ips',
    titulo: 'LED LCD IPS',
    subtitulo: 'Ángulos amplios y colores uniformes desde cualquier posición',
    descripcion:
      'Los paneles IPS (In-Plane Switching) son un tipo de panel LCD que destaca por sus amplios ángulos de visión y la estabilidad del color al ver desde los lados. Son la opción más común en ordenadores y televisores de gama media. Su mayor debilidad es el contraste, inferior a los paneles VA y muy inferior al OLED.',
    ventajas: [
      'Ángulos de visión muy amplios: colores estables desde los lados',
      'Ideal para usar como monitor de PC durante muchas horas',
      'Precio asequible, amplia oferta en el mercado',
      'Sin riesgo de burn-in',
      'Colores precisos y uniformes en toda la pantalla',
    ],
    limitaciones: [
      'Contraste nativo bajo (800:1 – 1200:1 aproximadamente)',
      'Los negros no son profundos, parecen grisáceos en escenas oscuras',
      'Brillo inferior a QLED en habitaciones muy iluminadas',
    ],
    idealPara: [
      'Uso mixto: TV y monitor de PC o trabajo',
      'Ver la TV desde varios ángulos (salón amplio)',
      'Presupuesto ajustado con buena calidad de imagen diurna',
      'Habitaciones con iluminación moderada',
    ],
    rangoPrecios: '200 € – 800 €',
    especificaciones: [
      { titulo: 'Contraste', valor: 'Moderado' },
      { titulo: 'Brillo', valor: 'Bueno' },
      { titulo: 'Ángulos visión', valor: 'Muy buenos' },
      { titulo: 'Resp. gaming', valor: '5-10 ms' },
      { titulo: 'Burn-in', valor: 'Sin riesgo' },
    ],
  },
  led_va: {
    key: 'led_va',
    titulo: 'LED LCD VA',
    subtitulo: 'Mejor contraste que IPS a precio económico',
    descripcion:
      'Los paneles VA (Vertical Alignment) ofrecen un contraste nativo considerablemente mejor que los IPS, con negros más profundos y colores más ricos en condiciones de luz controlada. Son una opción equilibrada para quienes buscan buena calidad de imagen sin pagar el precio del OLED. Su principal limitación son los ángulos de visión.',
    ventajas: [
      'Mejor contraste nativo que IPS (3000:1 – 6000:1)',
      'Negros más profundos, buena experiencia en escenas oscuras',
      'Precio competitivo, especialmente en gama media',
      'Sin riesgo de burn-in',
      'Buena reproducción de colores cuando se ve de frente',
    ],
    limitaciones: [
      'Ángulos de visión más limitados: colores cambian al ver desde los lados',
      'Tiempo de respuesta algo mayor que IPS, menos óptimo para gaming',
      'Rendimiento inferior a OLED en negros absolutos',
    ],
    idealPara: [
      'Ver la TV principalmente de frente desde el sofá',
      'Habitaciones con buena capacidad de oscurecer',
      'Presupuesto ajustado con mejor contraste que IPS',
      'Ver películas y series sin exigencias extremas de color',
    ],
    rangoPrecios: '200 € – 700 €',
    especificaciones: [
      { titulo: 'Contraste', valor: 'Bueno' },
      { titulo: 'Brillo', valor: 'Bueno' },
      { titulo: 'Ángulos visión', valor: 'Limitados' },
      { titulo: 'Resp. gaming', valor: '8-15 ms' },
      { titulo: 'Burn-in', valor: 'Sin riesgo' },
    ],
  },
};

// ── Componente principal ───────────────────────────────────────────────────

export default function SelectorTipoTelevision() {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [preguntaActual, setPreguntaActual] = useState<number>(0);
  const [resultado, setResultado] = useState<TecnologiaKey | null>(null);

  const totalPreguntas = PREGUNTAS.length;
  const pregunta = PREGUNTAS[preguntaActual];
  const seleccionActual = respuestas[preguntaActual];
  const esPrimeraPregunta = preguntaActual === 0;
  const esUltimaPregunta = preguntaActual === totalPreguntas - 1;
  const progresoPorc = ((preguntaActual + (seleccionActual !== undefined ? 1 : 0)) / totalPreguntas) * 100;

  function seleccionarOpcion(indice: number): void {
    setRespuestas((prev) => ({ ...prev, [preguntaActual]: indice }));
  }

  function irAnterior(): void {
    if (preguntaActual > 0) {
      setPreguntaActual((prev) => prev - 1);
    }
  }

  function irSiguiente(): void {
    if (seleccionActual !== undefined && preguntaActual < totalPreguntas - 1) {
      setPreguntaActual((prev) => prev + 1);
    }
  }

  function calcularResultado(): void {
    const puntos: Record<TecnologiaKey, number> = {
      oled: 0,
      qled: 0,
      led_ips: 0,
      led_va: 0,
    };

    PREGUNTAS.forEach((preg, idx) => {
      const respuestaIdx = respuestas[idx];
      if (respuestaIdx !== undefined) {
        const pesos = preg.opciones[respuestaIdx].pesos;
        (Object.keys(pesos) as TecnologiaKey[]).forEach((key) => {
          puntos[key] += pesos[key] ?? 0;
        });
      }
    });

    let mejorKey: TecnologiaKey = 'led_ips';
    let mejorPuntuacion = -1;
    (Object.keys(puntos) as TecnologiaKey[]).forEach((key) => {
      if (puntos[key] > mejorPuntuacion) {
        mejorPuntuacion = puntos[key];
        mejorKey = key;
      }
    });

    setResultado(mejorKey);
  }

  function reiniciar(): void {
    setRespuestas({});
    setPreguntaActual(0);
    setResultado(null);
  }

  const tecnologiaResultado = resultado ? TECNOLOGIAS[resultado] : null;

  const clasesPorTecnologia: Record<TecnologiaKey, string> = {
    oled: styles.tecnologia_oled,
    qled: styles.tecnologia_qled,
    led_ips: styles.tecnologia_led_ips,
    led_va: styles.tecnologia_led_va,
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>¿Qué tecnología de TV te conviene?</h1>
        <p className={styles.heroSubtitle}>
          Test de 10 preguntas para descubrir si necesitas OLED, QLED/Mini-LED, LED IPS o LED VA
          según tu uso, habitación y presupuesto.
        </p>
      </header>

      <div className={styles.legalNoticeWrapper}>
        <LegalNotice />
      </div>

      {!resultado ? (
        <section className={styles.testSection} aria-label="Test de selección de tecnología TV">
          <div className={styles.progreso} role="progressbar" aria-valuenow={Math.round(progresoPorc)} aria-valuemin={0} aria-valuemax={100} aria-label={`Pregunta ${preguntaActual + 1} de ${totalPreguntas}`}>
            <div className={styles.progresoBar}>
              <div
                className={styles.progresoFill}
                style={{ width: `${progresoPorc}%` }}
              />
            </div>
            <p className={styles.progresoTexto}>
              Pregunta {preguntaActual + 1} de {totalPreguntas}
            </p>
          </div>

          <div className={styles.pregunta}>
            <p className={styles.preguntaNumero}>Pregunta {pregunta.id}</p>
            <h2 className={styles.preguntaTexto}>{pregunta.texto}</h2>

            <div className={styles.opciones} role="group" aria-label={`Opciones para: ${pregunta.texto}`}>
              {pregunta.opciones.map((opcion, idx) => {
                const esSeleccionada = seleccionActual === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`${styles.opcionBtn}${esSeleccionada ? ` ${styles.selected}` : ''}`}
                    onClick={() => seleccionarOpcion(idx)}
                    aria-pressed={esSeleccionada ? true : false}
                  >
                    {opcion.texto}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.navegacion}>
            <button
              type="button"
              className={styles.btnAnterior}
              onClick={irAnterior}
              disabled={esPrimeraPregunta}
              aria-label="Ir a la pregunta anterior"
            >
              ← Anterior
            </button>

            {esUltimaPregunta ? (
              <button
                type="button"
                className={styles.btnResultado}
                onClick={calcularResultado}
                disabled={seleccionActual === undefined}
                aria-label="Ver el resultado del test"
              >
                Ver resultado →
              </button>
            ) : (
              <button
                type="button"
                className={styles.btnSiguiente}
                onClick={irSiguiente}
                disabled={seleccionActual === undefined}
                aria-label="Ir a la pregunta siguiente"
              >
                Siguiente →
              </button>
            )}
          </div>
        </section>
      ) : (
        tecnologiaResultado && (
          <section className={styles.resultadoSection} aria-label="Resultado del test">
            <div className={`${styles.resultadoCard} ${clasesPorTecnologia[resultado]}`}>
              <p className={styles.tecnologiaEtiqueta}>Tu tecnología recomendada</p>
              <h2 className={styles.tecnologiaTitulo}>{tecnologiaResultado.titulo}</h2>
              <p className={styles.tecnologiaSubtitulo}>{tecnologiaResultado.subtitulo}</p>

              <span className={styles.rangoPreciosTag}>
                Rango orientativo: {tecnologiaResultado.rangoPrecios}
              </span>

              <p className={styles.tecnologiaDesc}>{tecnologiaResultado.descripcion}</p>

              <div className={styles.especsGrid} aria-label="Especificaciones clave">
                {tecnologiaResultado.especificaciones.map((spec) => (
                  <div key={spec.titulo} className={styles.especCard}>
                    <p className={styles.especTitulo}>{spec.titulo}</p>
                    <p className={styles.especValor}>{spec.valor}</p>
                  </div>
                ))}
              </div>

              <div className={styles.ventajasSection}>
                <h3>Puntos fuertes</h3>
                <ul>
                  {tecnologiaResultado.ventajas.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.limitacionesSection}>
                <h3>Limitaciones a tener en cuenta</h3>
                <ul>
                  {tecnologiaResultado.limitaciones.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.consejosSection}>
                <h3>Ideal para</h3>
                <ul>
                  {tecnologiaResultado.idealPara.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="button"
              className={styles.btnReiniciar}
              onClick={reiniciar}
            >
              Repetir el test
            </button>
          </section>
        )
      )}

      <DisclaimerCard
        variant="technical"
        severity="medium"
        collapsible
        context="selector-tipo-television"
      />

      <EducationalSection title="Guía de tecnologías de panel: OLED, QLED, IPS y VA" subtitle="Diferencias clave para elegir la pantalla adecuada">
        <h3>Las cuatro tecnologías principales</h3>

        <p>
          <strong>OLED (Organic Light-Emitting Diode)</strong>: Cada píxel emite su propia luz y
          puede apagarse completamente. Esto produce negros absolutos y contraste infinito. Los
          paneles OLED son más delgados y ligeros que los LCD, pero tienen un límite de brillo
          máximo inferior a los QLED y existe cierto riesgo de burn-in con contenido estático
          prolongado (logotipos fijos, barras de información en televisiones de noticias).
        </p>

        <p>
          <strong>QLED / Mini-LED</strong>: Son paneles LCD retroiluminados con puntos cuánticos
          (quantum dots) que amplían la gama de colores. Los Mini-LED añaden miles de zonas de
          retroiluminación independientes (local dimming) para mejorar el contraste. Alcanzan
          niveles de brillo muy superiores al OLED, lo que los hace ideales para habitaciones con
          mucha luz. No tienen riesgo de burn-in.
        </p>

        <p>
          <strong>LED LCD IPS (In-Plane Switching)</strong>: Panel LCD cuyas moléculas de cristal
          se orientan en el plano horizontal. Ofrecen ángulos de visión muy amplios y colores
          estables al ver desde los lados. Son la tecnología dominante en monitores de ordenador.
          Su contraste nativo es bajo comparado con VA u OLED.
        </p>

        <p>
          <strong>LED LCD VA (Vertical Alignment)</strong>: Las moléculas de cristal se alinean
          verticalmente en reposo, bloqueando mejor la luz trasera. Esto produce negros más
          profundos y mayor contraste nativo que los IPS. Sin embargo, los ángulos de visión son
          más limitados: los colores y el contraste se degradan al ver desde posiciones laterales.
        </p>

        <h3>Comparativa de características principales</h3>

        <table className={styles.tablaComparativa} aria-label="Comparativa de tecnologías de panel de TV">
          <thead>
            <tr>
              <th scope="col">Característica</th>
              <th scope="col">OLED</th>
              <th scope="col">QLED/Mini-LED</th>
              <th scope="col">IPS</th>
              <th scope="col">VA</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Contraste</td>
              <td>Infinito ★★★★★</td>
              <td>Muy bueno ★★★★</td>
              <td>Moderado ★★</td>
              <td>Bueno ★★★</td>
            </tr>
            <tr>
              <td>Brillo máximo</td>
              <td>Medio-alto ★★★</td>
              <td>Muy alto ★★★★★</td>
              <td>Bueno ★★★</td>
              <td>Bueno ★★★</td>
            </tr>
            <tr>
              <td>Ángulos de visión</td>
              <td>Excelentes ★★★★★</td>
              <td>Buenos ★★★</td>
              <td>Muy buenos ★★★★</td>
              <td>Limitados ★★</td>
            </tr>
            <tr>
              <td>Gaming (resp.)</td>
              <td>Excelente ★★★★★</td>
              <td>Buena ★★★★</td>
              <td>Buena ★★★</td>
              <td>Regular ★★</td>
            </tr>
            <tr>
              <td>Riesgo burn-in</td>
              <td>Bajo-medio</td>
              <td>Sin riesgo</td>
              <td>Sin riesgo</td>
              <td>Sin riesgo</td>
            </tr>
            <tr>
              <td>Precio orientativo</td>
              <td>800 €–4.000 €+</td>
              <td>400 €–2.000 €</td>
              <td>200 €–800 €</td>
              <td>200 €–700 €</td>
            </tr>
          </tbody>
        </table>

        <h3>Cómo calcular el tamaño ideal según la distancia</h3>

        <p>
          Una fórmula práctica ampliamente utilizada es:
        </p>
        <p>
          <strong>Diagonal recomendada (cm) = distancia de visión (metros) × 40 a 50</strong>
        </p>
        <p>
          Por ejemplo, si el sofá está a 2,5 metros de la TV: 2,5 × 40 = 100 cm (≈ 40 pulgadas) como
          mínimo, y 2,5 × 50 = 125 cm (≈ 49 pulgadas) como máximo. Para contenido en 4K con muy
          buena resolución, se puede aplicar el multiplicador más alto. Para Full HD o contenido
          variado, el multiplicador más bajo ofrece mayor comodidad.
        </p>

        <h3>Hercios reales vs. hercios «virtuales»</h3>

        <p>
          Los fabricantes anuncian en ocasiones tasas de refresco de 120 Hz, 240 Hz o incluso
          1.000 Hz que no corresponden a la tasa de refresco nativa del panel. Algunas cifras se
          obtienen mediante técnicas de interpolación de fotogramas (Motion Rate, TruMotion,
          MotionXR...), que crean fotogramas artificiales y pueden producir el llamado
          «efecto telenovela» en las películas. Los hercios relevantes para gaming son los{' '}
          <strong>hercios nativos del panel</strong> (generalmente 60 Hz en gama básica o 120 Hz en
          gama media-alta). Para gaming competitivo, busca explícitamente paneles con 120 Hz
          nativos y compatibilidad con VRR (Variable Refresh Rate).
        </p>

        <div className={styles.warningBox} role="note">
          <strong>Nota sobre precios:</strong> Los precios de las tecnologías de TV evolucionan
          rápidamente. El OLED ha bajado considerablemente en los últimos años y puede ser más
          asequible de lo que parece. Los rangos de esta herramienta son orientativos para 2025.
          Compara en tiendas actualizadas antes de tomar una decisión de compra.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-tipo-television')} />
      <ShareCard appName="selector-tipo-television" />
      <Footer appName="selector-tipo-television" />
    </div>
  );
}
