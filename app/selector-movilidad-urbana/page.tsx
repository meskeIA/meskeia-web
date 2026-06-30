'use client';

import { useState } from 'react';
import styles from './SelectorMovilidadUrbana.module.css';
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

// ===== TIPOS =====

type TipoTransporte =
  | 'coche_propio'
  | 'transporte_publico'
  | 'moto_escuter'
  | 'bici_patinete'
  | 'combinacion';

interface Opcion {
  texto: string;
  icono: string;
  pesos: Partial<Record<TipoTransporte, number>>;
}

interface Pregunta {
  id: number;
  icono: string;
  texto: string;
  opciones: Opcion[];
}

interface Resultado {
  tipo: TipoTransporte;
  titulo: string;
  etiqueta: string;
  icono: string;
  descripcion: string;
  ventajas: string[];
  costoMensual: string;
}

// ===== PREGUNTAS =====

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    icono: '📏',
    texto: '¿Cuál es tu distancia habitual al trabajo o estudios?',
    opciones: [
      {
        texto: 'Menos de 5 km',
        icono: '🚶',
        pesos: { bici_patinete: 3, transporte_publico: 2, combinacion: 1 },
      },
      {
        texto: 'Entre 5 y 15 km',
        icono: '🛴',
        pesos: { moto_escuter: 3, bici_patinete: 2, transporte_publico: 2, combinacion: 2 },
      },
      {
        texto: 'Entre 15 y 40 km',
        icono: '🚇',
        pesos: { coche_propio: 2, transporte_publico: 3, moto_escuter: 2, combinacion: 2 },
      },
      {
        texto: 'Más de 40 km',
        icono: '🚗',
        pesos: { coche_propio: 4, combinacion: 1 },
      },
    ],
  },
  {
    id: 2,
    icono: '🚇',
    texto: '¿Tu ciudad o barrio tiene buena red de transporte público (metro, autobús, cercanías)?',
    opciones: [
      {
        texto: 'Sí, muy completa y frecuente',
        icono: '✅',
        pesos: { transporte_publico: 4, combinacion: 2 },
      },
      {
        texto: 'Regular, con algunas líneas útiles',
        icono: '🟡',
        pesos: { transporte_publico: 2, combinacion: 3, moto_escuter: 1 },
      },
      {
        texto: 'Deficiente o inexistente en mi zona',
        icono: '❌',
        pesos: { coche_propio: 3, moto_escuter: 2 },
      },
    ],
  },
  {
    id: 3,
    icono: '📦',
    texto: '¿Necesitas transportar objetos pesados, sillas de bebé u otros bultos con frecuencia?',
    opciones: [
      {
        texto: 'Sí, habitualmente',
        icono: '👶',
        pesos: { coche_propio: 4 },
      },
      {
        texto: 'A veces, pero no siempre',
        icono: '🎒',
        pesos: { coche_propio: 2, combinacion: 2, transporte_publico: 1 },
      },
      {
        texto: 'Casi nunca, solo lo básico',
        icono: '💼',
        pesos: { bici_patinete: 2, moto_escuter: 2, transporte_publico: 2, combinacion: 1 },
      },
    ],
  },
  {
    id: 4,
    icono: '🌙',
    texto: '¿Trabajas en horarios nocturnos, fines de semana o con horarios muy irregulares?',
    opciones: [
      {
        texto: 'Sí, con frecuencia',
        icono: '🌃',
        pesos: { coche_propio: 3, moto_escuter: 2 },
      },
      {
        texto: 'Ocasionalmente',
        icono: '🌆',
        pesos: { coche_propio: 1, moto_escuter: 1, combinacion: 2 },
      },
      {
        texto: 'No, horario fijo de lunes a viernes',
        icono: '☀️',
        pesos: { transporte_publico: 3, bici_patinete: 2, combinacion: 2 },
      },
    ],
  },
  {
    id: 5,
    icono: '💶',
    texto: '¿Qué importancia tiene el coste mensual del transporte para ti?',
    opciones: [
      {
        texto: 'Crítica, quiero el mínimo gasto posible',
        icono: '🔴',
        pesos: { transporte_publico: 4, bici_patinete: 3 },
      },
      {
        texto: 'Importante, pero puedo asumir costes razonables',
        icono: '🟡',
        pesos: { transporte_publico: 2, moto_escuter: 2, bici_patinete: 1, combinacion: 2 },
      },
      {
        texto: 'Secundaria, priorizo comodidad y tiempo',
        icono: '🟢',
        pesos: { coche_propio: 3, moto_escuter: 1 },
      },
    ],
  },
  {
    id: 6,
    icono: '🅿️',
    texto: '¿Tienes aparcamiento garantizado en tu trabajo o lugar de destino habitual?',
    opciones: [
      {
        texto: 'Sí, gratuito o muy asequible',
        icono: '✅',
        pesos: { coche_propio: 3, moto_escuter: 1 },
      },
      {
        texto: 'Sí, pero tiene coste notable',
        icono: '💰',
        pesos: { coche_propio: 1, moto_escuter: 2, combinacion: 2 },
      },
      {
        texto: 'No, es complicado o caro aparcar',
        icono: '❌',
        pesos: { transporte_publico: 3, moto_escuter: 2, bici_patinete: 2, combinacion: 2 },
      },
    ],
  },
  {
    id: 7,
    icono: '⚠️',
    texto: '¿Te preocupa especialmente la seguridad vial en tu desplazamiento?',
    opciones: [
      {
        texto: 'Mucho, es una prioridad para mí',
        icono: '🛡️',
        pesos: { transporte_publico: 3, coche_propio: 2 },
      },
      {
        texto: 'Me preocupa, pero tengo experiencia',
        icono: '🚦',
        pesos: { coche_propio: 1, moto_escuter: 1, combinacion: 2, transporte_publico: 1 },
      },
      {
        texto: 'Poco, me siento cómodo/a en cualquier vehículo',
        icono: '😎',
        pesos: { moto_escuter: 2, bici_patinete: 2, combinacion: 2 },
      },
    ],
  },
  {
    id: 8,
    icono: '🌧️',
    texto: '¿El clima de tu ciudad es adverso frecuentemente (lluvia, frío intenso, calor extremo)?',
    opciones: [
      {
        texto: 'Sí, llueve mucho o hace mucho frío/calor',
        icono: '🌩️',
        pesos: { coche_propio: 3, transporte_publico: 2 },
      },
      {
        texto: 'Moderado, con algunas semanas complicadas',
        icono: '🌦️',
        pesos: { combinacion: 3, transporte_publico: 1, moto_escuter: 1 },
      },
      {
        texto: 'Muy bueno, clima seco y agradable casi todo el año',
        icono: '☀️',
        pesos: { bici_patinete: 3, moto_escuter: 2, combinacion: 1 },
      },
    ],
  },
  {
    id: 9,
    icono: '🌿',
    texto: '¿Priorizar la sostenibilidad medioambiental es importante en tu decisión?',
    opciones: [
      {
        texto: 'Sí, es fundamental para mí',
        icono: '♻️',
        pesos: { bici_patinete: 4, transporte_publico: 3, combinacion: 1 },
      },
      {
        texto: 'Me importa, pero no es el factor decisivo',
        icono: '🌱',
        pesos: { transporte_publico: 2, bici_patinete: 1, combinacion: 2 },
      },
      {
        texto: 'Poco relevante frente a comodidad y tiempo',
        icono: '⚡',
        pesos: { coche_propio: 2, moto_escuter: 1 },
      },
    ],
  },
  {
    id: 10,
    icono: '♿',
    texto: '¿Tienes alguna limitación de movilidad física o condición de salud que afecte al transporte?',
    opciones: [
      {
        texto: 'Sí, tengo limitaciones importantes',
        icono: '♿',
        pesos: { coche_propio: 4, transporte_publico: 2 },
      },
      {
        texto: 'Leve, prefiero comodidad en el transporte',
        icono: '🦽',
        pesos: { coche_propio: 2, transporte_publico: 2, combinacion: 1 },
      },
      {
        texto: 'No, estoy en buena forma física',
        icono: '💪',
        pesos: { bici_patinete: 3, moto_escuter: 2, combinacion: 2, transporte_publico: 1 },
      },
    ],
  },
];

// ===== RESULTADOS =====

const RESULTADOS: Record<TipoTransporte, Resultado> = {
  coche_propio: {
    tipo: 'coche_propio',
    titulo: 'Coche Propio',
    etiqueta: 'Máxima flexibilidad',
    icono: '🚗',
    descripcion:
      'Tu perfil indica que el coche propio es la opción más adecuada para ti. Ya sea por distancias largas, necesidad de cargar bultos, horarios irregulares o limitaciones de movilidad, el coche te ofrece la autonomía y comodidad que necesitas.',
    ventajas: [
      'Total independencia de horarios y rutas',
      'Capacidad para transportar personas y carga',
      'Protección ante cualquier condición meteorológica',
      'Ideal para zonas con transporte público deficiente',
    ],
    costoMensual:
      'Coste estimado: 400–700 €/mes (amortización, seguro, combustible, aparcamiento y mantenimiento en ciudad española)',
  },
  transporte_publico: {
    tipo: 'transporte_publico',
    titulo: 'Transporte Público',
    etiqueta: 'Económico y sin estrés',
    icono: '🚇',
    descripcion:
      'El transporte público es tu mejor aliado. Vives en una ciudad bien comunicada, tus horarios son regulares y valoras el ahorro económico. Olvídate del estrés del tráfico y el aparcamiento.',
    ventajas: [
      'El más económico: desde 20–60 €/mes con abono',
      'Sin preocupaciones de aparcamiento ni tráfico',
      'Tiempo productivo durante el trayecto',
      'Red amplia y frecuente en tu zona',
    ],
    costoMensual:
      'Coste estimado: 20–80 €/mes (abono transporte en grandes ciudades españolas, incluyendo metro, bus y cercanías)',
  },
  moto_escuter: {
    tipo: 'moto_escuter',
    titulo: 'Moto o Escúter',
    etiqueta: 'Agilidad urbana',
    icono: '🛵',
    descripcion:
      'La moto o escúter es tu punto de equilibrio perfecto. Ágil en el tráfico, fácil de aparcar y mucho más económica que el coche. Ideal para distancias medias en ciudad con algo de experiencia vial.',
    ventajas: [
      'Agilidad en el tráfico y reducción de tiempo',
      'Aparcamiento gratuito o muy económico',
      'Menor coste que el coche',
      'Ideal para distancias de 5–30 km en ciudad',
    ],
    costoMensual:
      'Coste estimado: 100–200 €/mes (seguro, combustible, mantenimiento y amortización de una moto de ciudad)',
  },
  bici_patinete: {
    tipo: 'bici_patinete',
    titulo: 'Bicicleta o Patinete Eléctrico',
    etiqueta: 'Sostenible y económico',
    icono: '🚴',
    descripcion:
      'La opción más sostenible y económica para tu perfil. Distancias cortas, buen clima y una ciudad con infraestructura ciclista hacen de la bici o el patinete eléctrico tu transporte ideal.',
    ventajas: [
      'Coste casi nulo de operación',
      'Cero emisiones contaminantes',
      'Ejercicio físico integrado en tu rutina',
      'Sin problemas de aparcamiento ni atascos',
    ],
    costoMensual:
      'Coste estimado: 5–30 €/mes (mantenimiento bici convencional o carga eléctrica de patinete/e-bike)',
  },
  combinacion: {
    tipo: 'combinacion',
    titulo: 'Combinación Multimodal',
    etiqueta: 'Lo mejor de cada mundo',
    icono: '🔀',
    descripcion:
      'Tu situación es variada y ningún medio de transporte único cubre todas tus necesidades. La movilidad multimodal —combinar transporte público con bici, coche en ocasiones puntuales, o moto con metro— es tu solución más inteligente.',
    ventajas: [
      'Flexibilidad según la situación y el día',
      'Optimización de costes y tiempos',
      'Adaptación a diferentes condiciones meteorológicas',
      'Menor dependencia de un único medio',
    ],
    costoMensual:
      'Coste estimado: 80–250 €/mes (varía según la combinación: abono + bici/patinete o uso puntual de coche/taxi)',
  },
};

// ===== COMPONENTE PRINCIPAL =====

export default function SelectorMovilidadUrbana() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>(Array(PREGUNTAS.length).fill(-1));
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const opcionSeleccionada = respuestas[preguntaActual];
  const porcentajeProgreso = ((preguntaActual + 1) / PREGUNTAS.length) * 100;

  function seleccionarOpcion(indice: number): void {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaActual] = indice;
    setRespuestas(nuevasRespuestas);
  }

  function irSiguiente(): void {
    if (preguntaActual < PREGUNTAS.length - 1) {
      setPreguntaActual(preguntaActual + 1);
    } else {
      setMostrarResultado(true);
    }
  }

  function irAnterior(): void {
    if (preguntaActual > 0) {
      setPreguntaActual(preguntaActual - 1);
    }
  }

  function reiniciar(): void {
    setPreguntaActual(0);
    setRespuestas(Array(PREGUNTAS.length).fill(-1));
    setMostrarResultado(false);
  }

  function calcularResultado(): TipoTransporte {
    const puntuaciones: Record<TipoTransporte, number> = {
      coche_propio: 0,
      transporte_publico: 0,
      moto_escuter: 0,
      bici_patinete: 0,
      combinacion: 0,
    };

    respuestas.forEach((respuestaIdx, preguntaIdx) => {
      if (respuestaIdx === -1) return;
      const opcion = PREGUNTAS[preguntaIdx].opciones[respuestaIdx];
      if (!opcion) return;
      (Object.entries(opcion.pesos) as [TipoTransporte, number][]).forEach(([tipo, peso]) => {
        puntuaciones[tipo] += peso;
      });
    });

    return (Object.entries(puntuaciones) as [TipoTransporte, number][]).reduce(
      (mejor, [tipo, puntos]) => (puntos > puntuaciones[mejor] ? tipo : mejor),
      'combinacion' as TipoTransporte
    );
  }

  const pregunta = PREGUNTAS[preguntaActual];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Selector de Movilidad Urbana</h1>
        <p>10 preguntas para descubrir qué medio de transporte se adapta mejor a tu vida</p>
      </header>

      <LegalNotice />

      {!mostrarResultado ? (
        <main className={styles.quiz} aria-label="Test de movilidad urbana">
          <div className={styles.progreso} aria-label={`Pregunta ${preguntaActual + 1} de ${PREGUNTAS.length}`}>
            <span>{preguntaActual + 1}/{PREGUNTAS.length}</span>
            <div className={styles.barraProgreso} role="progressbar" aria-valuenow={Math.round(porcentajeProgreso)} aria-valuemin={0} aria-valuemax={100}>
              <div
                className={styles.barraProgresoRelleno}
                style={{ width: `${porcentajeProgreso}%` }}
              />
            </div>
            <span>{Math.round(porcentajeProgreso)}%</span>
          </div>

          <div className={styles.pregunta}>
            <div className={styles.preguntaHeader}>
              <span className={styles.preguntaIcono} aria-hidden="true">{pregunta.icono}</span>
              <p className={styles.preguntaTexto}>{pregunta.texto}</p>
            </div>

            <div className={styles.opciones} role="radiogroup" aria-label={pregunta.texto}>
              {pregunta.opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.opcion} ${opcionSeleccionada === idx ? styles.seleccionada : ''}`}
                  onClick={() => seleccionarOpcion(idx)}
                  aria-pressed={opcionSeleccionada === idx}
                >
                  <span className={styles.opcionIcono} aria-hidden="true">{opcion.icono}</span>
                  <span className={styles.opcionTexto}>{opcion.texto}</span>
                  <span className={styles.opcionMarca} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          <div className={styles.navegacion}>
            <button
              type="button"
              className={styles.btnSecundario}
              onClick={irAnterior}
              disabled={preguntaActual === 0}
              aria-label="Pregunta anterior"
            >
              ← Anterior
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={irSiguiente}
              disabled={opcionSeleccionada === -1}
              aria-label={preguntaActual < PREGUNTAS.length - 1 ? 'Siguiente pregunta' : 'Ver mi resultado'}
            >
              {preguntaActual < PREGUNTAS.length - 1 ? 'Siguiente →' : 'Ver mi resultado'}
            </button>
          </div>
        </main>
      ) : (
        <main className={styles.resultado} aria-label="Resultado del selector">
          {(() => {
            const tipo = calcularResultado();
            const res = RESULTADOS[tipo];
            return (
              <div className={styles.resultadoCard}>
                <div className={styles.resultadoIcono} aria-hidden="true">{res.icono}</div>
                <p className={styles.resultadoEtiqueta}>{res.etiqueta}</p>
                <h2 className={styles.resultadoTitulo}>{res.titulo}</h2>
                <p className={styles.resultadoDescripcion}>{res.descripcion}</p>

                <ul className={styles.resultadoVentajas} aria-label="Ventajas principales">
                  {res.ventajas.map((ventaja, i) => (
                    <li key={i}>{ventaja}</li>
                  ))}
                </ul>

                <div className={styles.costoEstimado}>
                  <strong><span aria-hidden="true">💶</span> Coste orientativo</strong>
                  {res.costoMensual}
                </div>

                <button
                  type="button"
                  className={styles.btnReiniciar}
                  onClick={reiniciar}
                  aria-label="Volver a hacer el test"
                >
                  Repetir el test
                </button>
              </div>
            );
          })()}
        </main>
      )}

      <DisclaimerCard variant="general" severity="medium" />

      <EducationalSection
        title="Movilidad urbana en España"
        subtitle="Encuentra el transporte que mejor se adapta a tu vida"
      >
        <div>
          <h3>¿Por qué la movilidad urbana importa?</h3>
          <p>
            El transporte representa el <strong>13–22 % del gasto mensual</strong> de los hogares
            españoles. Elegir bien puede suponer un ahorro de cientos de euros al mes y reducir
            significativamente tu huella de carbono.
          </p>

          <h3>Los 5 medios de transporte urbano en España</h3>
          <ul>
            <li>
              <strong>Coche propio (también llamado carro o auto en Latinoamérica):</strong> Necesario fuera de grandes ciudades o con cargas
              frecuentes, pero el más caro (400–700 €/mes en ciudad). Las ZBE (Zonas de Bajas
              Emisiones) restringen el acceso de vehículos contaminantes en ciudades de más de
              50.000 habitantes desde 2023.
            </li>
            <li>
              <strong>Transporte público:</strong> La red de metro, autobús y cercanías de ciudades
              como Madrid, Barcelona o Valencia es de las mejores de Europa. Los abonos mensuales
              oscilan entre 20 y 55 €, con descuentos hasta el 50 % para jóvenes (Tarjeta Joven).
            </li>
            <li>
              <strong>Moto o escúter:</strong> El equilibrio ideal para distancias medias. El seguro
              obligatorio parte de 100–200 €/año, y el aparcamiento es gratuito en la mayoría de
              aceras señalizadas. Las motos eléctricas tienen ventajas fiscales (IVA reducido,
              acceso a ZBE).
            </li>
            <li>
              <strong>Bicicleta o patinete eléctrico:</strong> Para distancias cortas (menos de 10
              km) en ciudades con infraestructura ciclista, la bici o e-patinete es casi gratuita y
              la más sostenible. El 60 % de los municipios españoles tiene red de bici-carriles en
              expansión.
            </li>
            <li>
              <strong>Combinación multimodal:</strong> Cada vez más extendida en España. Park &amp;
              Ride (aparcar en periferia + metro), o e-bike + tren, permiten optimizar tiempo y
              coste. Las tarjetas combinadas de transporte facilitan el intermodalismo.
            </li>
          </ul>

          <h3>Factores clave para decidir</h3>
          <ul>
            <li>
              <strong>Distancia y tiempo:</strong> Por encima de 30 km, el transporte público
              interurbano suele ser la mejor opción precio-tiempo.
            </li>
            <li>
              <strong>Coste total de propiedad:</strong> Un coche (carro o auto) de ciudad puede costar
              más de 7.000 €/año contando todo. La bicicleta, menos de 150 €/año.
            </li>
            <li>
              <strong>Infraestructura local:</strong> Verifica el Plan de Movilidad Urbana
              Sostenible (PMUS) de tu municipio para conocer inversiones previstas en ciclismo y
              transporte público.
            </li>
            <li>
              <strong>Zonas de Bajas Emisiones:</strong> Desde enero de 2023 son obligatorias en
              municipios de más de 50.000 habitantes. Consulta si tu vehículo tiene etiqueta
              ambiental de la DGT (CERO, ECO, C, B).
            </li>
          </ul>

          <h3>Ayudas y deducciones disponibles en España</h3>
          <p>
            El Plan MOVES III ofrece ayudas de hasta 7.000 € para la compra de vehículos
            eléctricos o de pila de combustible. Los abonos de transporte público también tienen
            deducciones en el IRPF para trabajadores (hasta 1.500 € anuales desde 2023).
          </p>

          <div className={styles.warningBox}>
            <span className={styles.warningIcono} aria-hidden="true">⚠️</span>
            <span>
              Este selector ofrece orientación general. Las condiciones específicas de tu ciudad,
              normativa de circulación y situación personal pueden variar. Consulta el Ayuntamiento
              y la DGT para información actualizada sobre ZBE y etiquetas ambientales.
            </span>
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-movilidad-urbana')} />

      <ShareCard appName="selector-movilidad-urbana" />

      <Footer appName="selector-movilidad-urbana" />
    </div>
  );
}
