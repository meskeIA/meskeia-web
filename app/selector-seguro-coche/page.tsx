'use client';

import { useState } from 'react';
import styles from './SelectorSeguroCoche.module.css';
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

// ============================================================
// Tipos
// ============================================================

type Modalidad =
  | 'terceros_basico'
  | 'terceros_ampliado'
  | 'todo_riesgo_franquicia'
  | 'todo_riesgo_sin_franquicia';

interface Opcion {
  texto: string;
  icono: string;
  pesos: Partial<Record<Modalidad, number>>;
}

interface Pregunta {
  id: number;
  texto: string;
  icono: string;
  opciones: Opcion[];
}

interface ResultadoInfo {
  titulo: string;
  descripcion: string;
  icono: string;
  coberturas: string[];
  advertencia: string;
}

// ============================================================
// Datos del test
// ============================================================

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuántos años tiene tu vehículo?',
    icono: '📅',
    opciones: [
      {
        texto: 'Menos de 2 años (vehículo nuevo o casi nuevo)',
        icono: '🆕',
        pesos: { todo_riesgo_sin_franquicia: 3 },
      },
      {
        texto: 'Entre 2 y 5 años',
        icono: '🚗',
        pesos: { todo_riesgo_franquicia: 2, todo_riesgo_sin_franquicia: 1 },
      },
      {
        texto: 'Entre 5 y 10 años',
        icono: '🚙',
        pesos: { terceros_ampliado: 2, todo_riesgo_franquicia: 1 },
      },
      {
        texto: 'Más de 10 años',
        icono: '🏚️',
        pesos: { terceros_basico: 3, terceros_ampliado: 1 },
      },
    ],
  },
  {
    id: 2,
    texto: '¿Cuál es el valor de mercado aproximado de tu coche?',
    icono: '💶',
    opciones: [
      {
        texto: 'Más de 25.000 €',
        icono: '💎',
        pesos: { todo_riesgo_sin_franquicia: 3 },
      },
      {
        texto: 'Entre 10.000 € y 25.000 €',
        icono: '💰',
        pesos: { todo_riesgo_franquicia: 2, todo_riesgo_sin_franquicia: 1 },
      },
      {
        texto: 'Entre 3.000 € y 10.000 €',
        icono: '🪙',
        pesos: { terceros_ampliado: 2, todo_riesgo_franquicia: 1 },
      },
      {
        texto: 'Menos de 3.000 €',
        icono: '📉',
        pesos: { terceros_basico: 3 },
      },
    ],
  },
  {
    id: 3,
    texto: '¿El coche está financiado (préstamo o leasing)?',
    icono: '🏦',
    opciones: [
      {
        texto: 'Sí, sigue con financiación activa',
        icono: '✅',
        pesos: { todo_riesgo_sin_franquicia: 3, todo_riesgo_franquicia: 1 },
      },
      {
        texto: 'No, es de mi propiedad total',
        icono: '❌',
        pesos: { terceros_basico: 1, terceros_ampliado: 1, todo_riesgo_franquicia: 1 },
      },
    ],
  },
  {
    id: 4,
    texto: '¿Cuántos años llevas conduciendo?',
    icono: '🎓',
    opciones: [
      {
        texto: 'Menos de 2 años (conductor novel)',
        icono: '🟢',
        pesos: { todo_riesgo_sin_franquicia: 2, todo_riesgo_franquicia: 2 },
      },
      {
        texto: 'Entre 2 y 5 años',
        icono: '🟡',
        pesos: { todo_riesgo_franquicia: 2, terceros_ampliado: 1 },
      },
      {
        texto: 'Más de 5 años con experiencia sólida',
        icono: '🏆',
        pesos: { terceros_basico: 1, terceros_ampliado: 1 },
      },
    ],
  },
  {
    id: 5,
    texto: '¿Has tenido siniestros o partes en los últimos 3 años?',
    icono: '🚨',
    opciones: [
      {
        texto: 'No, ninguno',
        icono: '😊',
        pesos: { terceros_basico: 1, terceros_ampliado: 1 },
      },
      {
        texto: 'Uno leve (golpe pequeño, rayada)',
        icono: '😐',
        pesos: { todo_riesgo_franquicia: 2, terceros_ampliado: 1 },
      },
      {
        texto: 'Más de uno o alguno grave',
        icono: '😬',
        pesos: { todo_riesgo_sin_franquicia: 2, todo_riesgo_franquicia: 1 },
      },
    ],
  },
  {
    id: 6,
    texto: '¿Cuál es el uso principal del vehículo?',
    icono: '🛣️',
    opciones: [
      {
        texto: 'Uso particular ocasional (fines de semana)',
        icono: '🌅',
        pesos: { terceros_basico: 2, terceros_ampliado: 1 },
      },
      {
        texto: 'Uso diario (trabajo, familia)',
        icono: '🏢',
        pesos: { terceros_ampliado: 1, todo_riesgo_franquicia: 1 },
      },
      {
        texto: 'Uso profesional o comercial intensivo',
        icono: '🔧',
        pesos: { todo_riesgo_sin_franquicia: 2, todo_riesgo_franquicia: 1 },
      },
      {
        texto: 'Lo comparten varias personas (coche de empresa o familiar)',
        icono: '👨‍👩‍👧',
        pesos: { todo_riesgo_franquicia: 2, todo_riesgo_sin_franquicia: 1 },
      },
    ],
  },
  {
    id: 7,
    texto: '¿Conduces principalmente en zona urbana o rural?',
    icono: '🗺️',
    opciones: [
      {
        texto: 'Zona urbana con tráfico denso (ciudad)',
        icono: '🏙️',
        pesos: { todo_riesgo_franquicia: 2, todo_riesgo_sin_franquicia: 1 },
      },
      {
        texto: 'Zona semiurbana o mixta',
        icono: '🌆',
        pesos: { terceros_ampliado: 1, todo_riesgo_franquicia: 1 },
      },
      {
        texto: 'Principalmente carretera o zona rural',
        icono: '🌳',
        pesos: { terceros_basico: 1, terceros_ampliado: 2 },
      },
    ],
  },
  {
    id: 8,
    texto: '¿Tienes garaje o aparcamiento privado habitual?',
    icono: '🅿️',
    opciones: [
      {
        texto: 'Sí, siempre guardo el coche en garaje privado',
        icono: '✅',
        pesos: { terceros_basico: 1, terceros_ampliado: 1 },
      },
      {
        texto: 'A veces, pero también aparca en calle',
        icono: '🔄',
        pesos: { terceros_ampliado: 1, todo_riesgo_franquicia: 1 },
      },
      {
        texto: 'No, siempre en la calle o zona pública',
        icono: '❌',
        pesos: { terceros_ampliado: 2, todo_riesgo_franquicia: 1 },
      },
    ],
  },
  {
    id: 9,
    texto: '¿Podrías asumir una reparación importante de tu bolsillo si ocurriera un accidente?',
    icono: '💳',
    opciones: [
      {
        texto: 'Sí, sin problemas (tengo ahorro suficiente)',
        icono: '💪',
        pesos: { terceros_basico: 2, terceros_ampliado: 1 },
      },
      {
        texto: 'Podría asumir parte, pero no el total',
        icono: '😅',
        pesos: { todo_riesgo_franquicia: 3 },
      },
      {
        texto: 'No, sería un problema económico serio',
        icono: '😰',
        pesos: { todo_riesgo_sin_franquicia: 3 },
      },
    ],
  },
  {
    id: 10,
    texto: '¿Hay conductores menores de 25 años que usen habitualmente el coche?',
    icono: '👨‍🎓',
    opciones: [
      {
        texto: 'Sí, conductor/a joven o novel frecuente',
        icono: '🧑',
        pesos: { todo_riesgo_sin_franquicia: 2, todo_riesgo_franquicia: 1 },
      },
      {
        texto: 'Sí, esporádicamente',
        icono: '🔁',
        pesos: { todo_riesgo_franquicia: 2, terceros_ampliado: 1 },
      },
      {
        texto: 'No, solo conductores con experiencia',
        icono: '✅',
        pesos: { terceros_basico: 1, terceros_ampliado: 1 },
      },
    ],
  },
];

const RESULTADOS: Record<Modalidad, ResultadoInfo> = {
  terceros_basico: {
    titulo: 'Seguro a Terceros Básico',
    descripcion:
      'La cobertura mínima legal. Ideal para vehículos antiguos de bajo valor donde el coste del seguro podría superar el valor del coche.',
    icono: '🛡️',
    coberturas: [
      'Responsabilidad civil obligatoria',
      'Daños a terceros (personas y bienes)',
      'Asistencia en viaje básica (según compañía)',
      'Defensa jurídica básica',
    ],
    advertencia:
      'No cubre daños propios del vehículo. Si sufres un accidente sin culpable identificado, correrás con el gasto de reparación.',
  },
  terceros_ampliado: {
    titulo: 'Seguro a Terceros Ampliado',
    descripcion:
      'Amplía la cobertura básica con protección ante robos, incendios, fenómenos naturales y daños en lunas. Una opción equilibrada para coches de valor medio.',
    icono: '🛡️',
    coberturas: [
      'Responsabilidad civil obligatoria',
      'Robo e intento de robo',
      'Incendio y explosión',
      'Rotura de lunas (parabrisas, luneta, laterales)',
      'Fenómenos naturales y daños por inundación',
      'Asistencia en carretera 24h',
    ],
    advertencia:
      'No incluye cobertura de daños propios por accidente. Si chocas por tu culpa, los daños en tu coche no quedarán cubiertos.',
  },
  todo_riesgo_franquicia: {
    titulo: 'Todo Riesgo con Franquicia',
    descripcion:
      'Cobertura total con una parte del coste de reparación a tu cargo (franquicia). Protección completa a un precio más asequible.',
    icono: '🔰',
    coberturas: [
      'Todo lo incluido en terceros ampliado',
      'Daños propios por accidente (independientemente de la culpa)',
      'Daños en aparcamiento (golpes sin parte contrario)',
      'Actos vandálicos',
      'Cobertura en el extranjero (zona UE)',
    ],
    advertencia:
      'En cada siniestro deberás abonar la franquicia pactada (habitualmente entre 150 € y 600 €). Compara el importe de la franquicia antes de contratar.',
  },
  todo_riesgo_sin_franquicia: {
    titulo: 'Todo Riesgo sin Franquicia',
    descripcion:
      'La cobertura más completa del mercado. Cualquier daño queda cubierto sin coste adicional. Recomendado para vehículos nuevos, de alto valor o conductores noveles.',
    icono: '⭐',
    coberturas: [
      'Cobertura total de daños propios y a terceros',
      'Sin coste adicional por siniestro (0 € franquicia)',
      'Robo, incendio, lunas y fenómenos naturales',
      'Conductor designado sin recargo',
      'Vehículo de sustitución incluido (según póliza)',
      'Cobertura en toda Europa',
    ],
    advertencia:
      'Es la opción más cara del mercado. Valora si la prima anual compensa respecto al valor real del vehículo.',
  },
};

// ============================================================
// Lógica de puntuación
// ============================================================

function calcularResultado(respuestas: number[]): Modalidad {
  const puntos: Record<Modalidad, number> = {
    terceros_basico: 0,
    terceros_ampliado: 0,
    todo_riesgo_franquicia: 0,
    todo_riesgo_sin_franquicia: 0,
  };

  respuestas.forEach((opcionIdx, preguntaIdx) => {
    const opcion = PREGUNTAS[preguntaIdx].opciones[opcionIdx];
    (Object.entries(opcion.pesos) as [Modalidad, number][]).forEach(([modalidad, peso]) => {
      puntos[modalidad] += peso;
    });
  });

  return (Object.entries(puntos) as [Modalidad, number][]).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )[0];
}

// ============================================================
// Componente principal
// ============================================================

export default function SelectorSeguroCochePage() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>([]);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<number | null>(null);
  const [resultado, setResultado] = useState<Modalidad | null>(null);

  const totalPreguntas = PREGUNTAS.length;
  const progresoPct = resultado
    ? 100
    : Math.round((preguntaActual / totalPreguntas) * 100);

  const handleSeleccionarOpcion = (idx: number) => {
    setOpcionSeleccionada(idx);
  };

  const handleSiguiente = () => {
    if (opcionSeleccionada === null) return;

    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaActual] = opcionSeleccionada;
    setRespuestas(nuevasRespuestas);

    if (preguntaActual + 1 < totalPreguntas) {
      setPreguntaActual(preguntaActual + 1);
      setOpcionSeleccionada(
        nuevasRespuestas[preguntaActual + 1] !== undefined
          ? nuevasRespuestas[preguntaActual + 1]
          : null
      );
    } else {
      const modalidad = calcularResultado(nuevasRespuestas);
      setResultado(modalidad);
    }
  };

  const handleAnterior = () => {
    if (preguntaActual === 0) return;
    const anterior = preguntaActual - 1;
    setPreguntaActual(anterior);
    setOpcionSeleccionada(respuestas[anterior] !== undefined ? respuestas[anterior] : null);
  };

  const handleReiniciar = () => {
    setPreguntaActual(0);
    setRespuestas([]);
    setOpcionSeleccionada(null);
    setResultado(null);
  };

  const pregunta = PREGUNTAS[preguntaActual];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>🚗 ¿Qué seguro de coche necesitas?</h1>
        <p>
          Responde 10 preguntas y descubre si te conviene terceros básico, terceros
          ampliado, todo riesgo con franquicia o todo riesgo sin franquicia.
        </p>
      </header>

      <LegalNotice />

      {/* ---- Quiz o resultado ---- */}
      {!resultado ? (
        <section className={styles.quiz} aria-label="Test de seguro de coche">
          {/* Barra de progreso */}
          <div className={styles.progreso}>
            <span className={styles.progresoTexto}>
              Pregunta {preguntaActual + 1} de {totalPreguntas}
            </span>
            <div className={styles.barraProgreso} role="progressbar" aria-valuenow={progresoPct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso del test">
              <div
                className={styles.barraRelleno}
                style={{ width: `${progresoPct}%` }}
              />
            </div>
          </div>

          {/* Pregunta */}
          <div className={styles.pregunta}>
            <p className={styles.preguntaTexto}>
              {pregunta.icono} {pregunta.texto}
            </p>

            <div className={styles.opciones} role="radiogroup" aria-label={pregunta.texto}>
              {pregunta.opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.opcion} ${opcionSeleccionada === idx ? styles.seleccionada : ''}`}
                  onClick={() => handleSeleccionarOpcion(idx)}
                  aria-pressed={opcionSeleccionada === idx}
                >
                  <span className={styles.opcionIcono} aria-hidden="true">
                    {opcion.icono}
                  </span>
                  <span className={styles.opcionTexto}>{opcion.texto}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navegación */}
          <div className={styles.navegacion}>
            <button
              type="button"
              className={styles.btnSecundario}
              onClick={handleAnterior}
              disabled={preguntaActual === 0}
              aria-label="Volver a la pregunta anterior"
            >
              ← Anterior
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleSiguiente}
              disabled={opcionSeleccionada === null}
              aria-label={
                preguntaActual + 1 < totalPreguntas
                  ? 'Ir a la siguiente pregunta'
                  : 'Ver resultado'
              }
            >
              {preguntaActual + 1 < totalPreguntas ? 'Siguiente →' : 'Ver resultado'}
            </button>
          </div>
        </section>
      ) : (
        <section className={styles.resultado} aria-label="Tu recomendación de seguro">
          {/* Tarjeta de resultado */}
          <div className={styles.resultadoCard}>
            <div className={styles.resultadoIcono} aria-hidden="true">
              {RESULTADOS[resultado].icono}
            </div>
            <h2 className={styles.resultadoTitulo}>
              {RESULTADOS[resultado].titulo}
            </h2>
            <p className={styles.resultadoSubtitulo}>
              {RESULTADOS[resultado].descripcion}
            </p>
          </div>

          {/* Coberturas incluidas */}
          <div className={styles.resultadoDetalles}>
            <h3>Coberturas habituales en esta modalidad</h3>
            <ul className={styles.coberturaLista} aria-label="Coberturas incluidas">
              {RESULTADOS[resultado].coberturas.map((cobertura, idx) => (
                <li key={idx} className={styles.coberturaItem}>
                  {cobertura}
                </li>
              ))}
            </ul>

            {/* Warning box */}
            <div className={styles.warningBox} role="note">
              <strong>⚠️</strong>
              <span>{RESULTADOS[resultado].advertencia}</span>
            </div>
          </div>

          <button
            type="button"
            className={styles.btnReiniciar}
            onClick={handleReiniciar}
            aria-label="Reiniciar el test"
          >
            🔄 Repetir el test
          </button>
        </section>
      )}

      {/* Disclaimer — Nivel 2 ALTO (asesoramiento financiero-contractual) */}
      <DisclaimerCard variant="financial" severity="high" />

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="📚 Todo sobre los seguros de coche en España"
        subtitle="Guía completa para entender coberturas, precios y cómo elegir bien"
      >
        <section>
          <h2>¿Qué tipos de seguro de coche existen en España?</h2>
          <p>
            En España la ley obliga a tener contratado como mínimo un seguro de
            responsabilidad civil (RC) obligatoria, que cubre los daños que puedas causar
            a otras personas o sus bienes. A partir de ahí, cada compañía estructura sus
            productos en cuatro grandes modalidades:
          </p>
          <ul>
            <li>
              <strong>Terceros básico</strong>: solo la cobertura obligatoria por ley. Sin
              protección para el propio vehículo.
            </li>
            <li>
              <strong>Terceros ampliado</strong>: añade robo, incendio, lunas y asistencia
              en carretera. Buen equilibrio para coches de valor medio.
            </li>
            <li>
              <strong>Todo riesgo con franquicia</strong>: cubre daños propios con un
              importe mínimo a cargo del asegurado por siniestro (franquicia).
            </li>
            <li>
              <strong>Todo riesgo sin franquicia</strong>: la cobertura más amplia sin
              costes adicionales. Indicado para vehículos nuevos o de alto valor.
            </li>
          </ul>
        </section>

        <section>
          <h2>¿Cómo influye la antigüedad del vehículo en la elección?</h2>
          <p>
            La antigüedad es uno de los factores más importantes. A mayor antigüedad, menor
            valor de mercado y menor sentido tiene contratar una cobertura muy amplia, pues
            la prima podría superar el propio valor del coche. Como regla general:
          </p>
          <ul>
            <li>Menos de 3 años → todo riesgo sin franquicia</li>
            <li>3 a 7 años → todo riesgo con franquicia</li>
            <li>7 a 12 años → terceros ampliado</li>
            <li>Más de 12 años → terceros básico</li>
          </ul>
          <p>
            Esta guía es orientativa; el valor real y el uso del vehículo pueden cambiar
            la recomendación.
          </p>
        </section>

        <section>
          <h2>¿Qué es la franquicia y cómo afecta al precio?</h2>
          <p>
            La franquicia es la cantidad que el asegurado paga de su bolsillo en cada
            siniestro antes de que la aseguradora se haga cargo del resto. Por ejemplo, con
            una franquicia de 300 € y una reparación de 1.200 €, tú pagas 300 € y la
            compañía abona 900 €.
          </p>
          <p>
            A mayor franquicia, menor prima anual. Si eres un conductor experimentado con
            buen historial, la franquicia puede ser una excelente forma de reducir el coste
            anual del seguro sin perder protección ante siniestros graves.
          </p>
        </section>

        <section>
          <h2>Conductores jóvenes: ¿qué seguro conviene?</h2>
          <p>
            Los conductores menores de 25 años pagan primas más elevadas porque las
            estadísticas indican mayor siniestralidad. En su caso, lo más habitual es:
          </p>
          <ul>
            <li>
              Para el primer coche (de bajo valor): terceros ampliado para no encarecer
              demasiado la prima.
            </li>
            <li>
              Si el coche es nuevo o financiado: todo riesgo obligatorio y, si la prima es
              asumible, sin franquicia.
            </li>
            <li>
              Añadir al conductor joven como conductor principal (no secundario) para evitar
              problemas en caso de siniestro.
            </li>
          </ul>
        </section>

        <section>
          <h2>Consejos para contratar o cambiar de seguro</h2>
          <ul>
            <li>
              Compara siempre al menos 3 presupuestos: el precio puede variar un 40 % entre
              compañías para la misma cobertura.
            </li>
            <li>
              Lee el condicionado específico de cada póliza: las coberturas incluidas pueden
              diferir aunque la modalidad tenga el mismo nombre.
            </li>
            <li>
              El seguro se renueva automáticamente cada año; tienes derecho a cancelar con
              un mes de antelación antes de la fecha de renovación.
            </li>
            <li>
              Informa siempre de todos los conductores habituales para evitar que la
              aseguradora pueda reducir la indemnización por conductor no declarado.
            </li>
            <li>
              Si el coche está financiado, el contrato de leasing o préstamo suele exigir
              todo riesgo sin franquicia o con franquicia máxima pactada.
            </li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-seguro-coche')} />
      <ShareCard appName="selector-seguro-coche" />
      <Footer appName="selector-seguro-coche" />
    </div>
  );
}
