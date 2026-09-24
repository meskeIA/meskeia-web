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
import { calcularResultado, PREGUNTAS, RESULTADOS, CON_ARTICULO, type Resultado } from './motor';

// Las preguntas con sus pesos, las fichas de cada modalidad y la lógica viven en ./motor.ts.

/** Lista legible: «A, B y C». */
function enumerar(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

// ============================================================
// Componente principal
// ============================================================

export default function SelectorSeguroCochePage() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>([]);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<number | null>(null);
  const [calculo, setCalculo] = useState<Resultado | null>(null);
  const resultado = calculo ? calculo.modalidad : null;

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
      setCalculo(calcularResultado(nuevasRespuestas));
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
    setCalculo(null);
  };

  const pregunta = PREGUNTAS[preguntaActual];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1><span aria-hidden="true">🚗</span> ¿Qué seguro de coche, carro o auto necesitas?</h1>
        <p>
          Responde 10 preguntas y descubre qué seguro de coche (carro o auto) te conviene:
          terceros básico, terceros ampliado, todo riesgo con franquicia o todo riesgo sin
          franquicia.
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
              <span aria-hidden="true">{pregunta.icono}</span> {pregunta.texto}
            </p>

            <div className={styles.opciones} role="radiogroup" aria-label={pregunta.texto}>
              {pregunta.opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.opcion} ${opcionSeleccionada === idx ? styles.seleccionada : ''}`}
                  onClick={() => handleSeleccionarOpcion(idx)}
                  // role="radio" + aria-checked, no aria-pressed: la elección es ÚNICA entre
                  // varias, no un conmutador. El contenedor declaraba radiogroup sin un solo
                  // radio dentro (selector-smartphone, hallazgo 950).
                  role="radio"
                  aria-checked={opcionSeleccionada === idx}
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

          {/* Un empate no se resuelve en silencio por el orden del objeto: antes se quedaba
              siempre la primera, terceros básico, la de menos cobertura. */}
          {calculo && calculo.empatadas.length > 0 && (
            <p className={styles.avisoEmpate} role="note">
              <span aria-hidden="true">⚖️</span> Empate: con tus respuestas,{' '}
              {enumerar([calculo.modalidad, ...calculo.empatadas].map((k) => CON_ARTICULO[k]))}{' '}
              encajan exactamente igual; {calculo.criterioDesempate}.
            </p>
          )}

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
              <strong aria-hidden="true">⚠️</strong>
              <span>{RESULTADOS[resultado].advertencia}</span>
            </div>
          </div>

          <button
            type="button"
            className={styles.btnReiniciar}
            onClick={handleReiniciar}
            aria-label="Reiniciar el test"
          >
            <span aria-hidden="true">🔄</span> Repetir el test
          </button>
        </section>
      )}

      {/* Disclaimer — Nivel 2 ALTO (asesoramiento financiero-contractual) */}
      <DisclaimerCard variant="financial" severity="high" />

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="Todo sobre los seguros de coche, carro o auto"
        subtitle="Guía completa para entender coberturas, precios y cómo elegir bien"
      >
        <section>
          <h2>¿Qué tipos de seguro de coche (carro o auto) existen?</h2>
          <p>
            El seguro del vehículo recibe distintos nombres según el país (seguro de coche
            en España, seguro de carro en Colombia o México, seguro de auto en Argentina o
            Chile), pero la estructura de coberturas es muy similar. Normalmente se exige
            por ley contratar como mínimo un seguro de responsabilidad civil (RC)
            obligatoria, que cubre los daños que puedas causar a otras personas o sus
            bienes. A partir de ahí, cada compañía estructura sus productos en cuatro
            grandes modalidades:
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
