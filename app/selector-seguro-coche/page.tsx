'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './SelectorSeguroCoche.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
  DisclaimerCard,
  RegionBadge,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  calcularResultado,
  PREGUNTAS,
  RESULTADOS,
  CON_ARTICULO,
  RESPUESTA,
  NOMBRE_CORTO,
  PREGUNTA_ANTIGUEDAD,
  orientacionDe,
  type Nota,
  type Resultado,
} from './motor';

// Las preguntas con sus pesos, las fichas de cada modalidad y la lógica viven en ./motor.ts.

/** La respuesta literal que el usuario eligió, para citarla entre comillas. */
function respuestaLiteral([pregunta, opcion]: readonly [number, number]): string {
  return PREGUNTAS[pregunta].opciones[opcion].texto;
}

/**
 * Lo declarado que choca con la recomendación, dicho con sus palabras (hallazgos 1473-1477).
 * Por qué son notas y no filtros: comentario de `Nota` en ./motor.ts.
 */
function textoNota(nota: Nota, respuestas: readonly number[]): string {
  const alternativa = nota.alternativa ? CON_ARTICULO[nota.alternativa] : '';
  const eligio = ([p, o]: readonly [number, number]) => respuestas[p] === o;
  switch (nota.tipo) {
    case 'financiacion':
      return (
        'Has dicho que el coche sigue financiado. La ley solo obliga a la responsabilidad civil, ' +
        'pero tu contrato de préstamo o leasing puede exigir un seguro a todo riesgo: revísalo antes ' +
        `de contratar. Si lo exige, la opción que mejor encaja con tus respuestas es ${alternativa}.`
      );
    case 'valor-bajo':
      return (
        `Has dicho que el coche vale «${respuestaLiteral(RESPUESTA.valorMenos3000)}». Como regla, el ` +
        'seguro indemniza según el valor que tenía el coche justo antes del siniestro (Ley 50/1980 de ' +
        'Contrato de Seguro, art. 26), así que la prima de un todo riesgo puede acercarse a lo máximo ' +
        `que llegaría a pagarte. Pide también precio para ${alternativa}, la modalidad a terceros ` +
        'que mejor encaja con tus respuestas.'
      );
    case 'valor-alto': {
      const dicho = [
        eligio(RESPUESTA.antiguedadMenos2) && `tiene «${respuestaLiteral(RESPUESTA.antiguedadMenos2)}»`,
        eligio(RESPUESTA.valorMas25000) && `vale «${respuestaLiteral(RESPUESTA.valorMas25000)}»`,
      ].filter((x): x is string => Boolean(x));
      return (
        `Has dicho que el coche ${enumerar(dicho)}. Con un seguro a terceros, si tienes un accidente ` +
        'del que eres responsable, la reparación de tu coche la pagas tú. Si no podrías asumirla, ' +
        `compara también ${alternativa}, el todo riesgo que mejor encaja con tus respuestas.`
      );
    }
    case 'uso-profesional':
      return (
        `Has elegido «${respuestaLiteral(RESPUESTA.usoProfesional)}»: declara ese uso al contratar. ` +
        'Hay que declarar a la aseguradora todo lo que influya en el riesgo, y si se declaró de forma ' +
        'inexacta, en un siniestro la indemnización se reduce en proporción a la prima que habría ' +
        'correspondido (Ley 50/1980 de Contrato de Seguro, art. 10).'
      );
    case 'conductor-joven': {
      const cual = eligio(RESPUESTA.jovenFrecuente) ? RESPUESTA.jovenFrecuente : RESPUESTA.jovenEsporadico;
      return (
        `Has dicho que conducen el coche menores de 25 años («${respuestaLiteral(cual)}»): decláralos ` +
        'en la póliza tal como lo usan, como conductores habituales u ocasionales. Si no constan, o ' +
        'constan como ocasionales siendo habituales, en un siniestro la indemnización puede reducirse ' +
        '(Ley 50/1980 de Contrato de Seguro, arts. 10 y 11).'
      );
    }
  }
}

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

  // Al pulsar «Ver resultado» el test se desmonta con el botón que tenía el foco, que caía a
  // <body>: se lleva al título del resultado (familia de selectores, punto g).
  const tituloResultado = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (calculo) tituloResultado.current?.focus();
  }, [calculo]);

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

      {/* La responsabilidad civil obligatoria, su ámbito en el EEE y el preaviso de la póliza
          son de la ley española; las modalidades se parecen en otros países (hallazgo 1481). */}
      <RegionBadge
        variant="es-data"
        text="Normativa de referencia: España. En otros países las modalidades se parecen, pero el seguro obligatorio y lo que cubre dependen de su ley"
      />

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
            <h2 className={styles.resultadoTitulo} ref={tituloResultado} tabIndex={-1}>
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

          {calculo && calculo.notas.map((nota) => (
            <p key={nota.tipo} className={styles.avisoNota} role="note" data-nota={nota.tipo}>
              <span aria-hidden="true">⚠️</span> {textoNota(nota, respuestas)}
            </p>
          ))}

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
          {/* Antes afirmaba para Colombia, México, Argentina y Chile que el mínimo legal cubre los
              daños a personas «o sus bienes», y no en todos es así (hallazgo 1479). La guía se
              ciñe a lo que la app puede sostener: la ley española. */}
          <p>
            El seguro del vehículo recibe distintos nombres según el país (seguro de coche,
            de carro o de auto), y el seguro mínimo obligatorio, y lo que cubre, depende de la
            ley de cada uno. Esta guía describe el caso de España, donde todo propietario de
            un coche con estacionamiento habitual en el país debe tener un seguro de
            responsabilidad civil (RC) obligatoria (Real Decreto Legislativo 8/2004, art. 2.1),
            que cubre los daños que causes a otras personas y a sus bienes, y que vale en todo el
            Espacio Económico Europeo con una sola prima (art. 4.1). A partir de ahí, las
            compañías estructuran sus productos en cuatro grandes modalidades:
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
            la prima podría acercarse al propio valor del coche. Así empuja este test según la
            antigüedad (pregunta 1):
          </p>
          {/* Sale de los pesos de la pregunta 1, como el FAQPage: antes la guía tenía sus
              propios tramos (3 / 7 / 12 años) y contradecía al FAQ (hallazgo 1480). */}
          <ul>
            {orientacionDe(PREGUNTA_ANTIGUEDAD).map(({ opcion, modalidad }) => (
              <li key={opcion}>{opcion} → {NOMBRE_CORTO[modalidad]}</li>
            ))}
          </ul>
          <p>
            Es solo un punto de partida: el valor del coche, la financiación, tu experiencia y
            lo que podrías pagar de tu bolsillo pueden cambiar la recomendación.
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
            {/* Decía «todo riesgo obligatorio»: la ley solo obliga a la responsabilidad civil
                (RDL 8/2004, art. 2.1); el todo riesgo, si acaso, lo exige el contrato (hallazgo 1478). */}
            <li>
              Si el coche es nuevo o de valor alto: el todo riesgo cubre también los daños
              propios. Ninguna ley lo exige; si el coche está financiado, revisa el contrato,
              porque puede pedirlo.
            </li>
            <li>
              Declarar al conductor joven tal como usa el coche, como conductor habitual u
              ocasional: si figura como ocasional y en realidad es el habitual, la
              indemnización puede reducirse (Ley 50/1980 de Contrato de Seguro, art. 10).
            </li>
          </ul>
        </section>

        <section>
          <h2>Consejos para contratar o cambiar de seguro</h2>
          <ul>
            {/* Sin el «puede variar un 40 %», que no tenía fuente ni año (hallazgo 1483). */}
            <li>
              Compara siempre varios presupuestos: para la misma modalidad, el precio cambia
              mucho de una compañía a otra y según tu perfil.
            </li>
            <li>
              Lee el condicionado específico de cada póliza: las coberturas incluidas pueden
              diferir aunque la modalidad tenga el mismo nombre.
            </li>
            <li>
              Si la póliza se prorroga cada año, puedes oponerte a la prórroga avisando con al
              menos un mes de antelación a su vencimiento (Ley 50/1980, art. 22).
            </li>
            <li>
              Informa siempre de todos los conductores habituales y del uso real del coche
              (particular o profesional): si el riesgo se declaró de forma inexacta, la
              indemnización se reduce en proporción a la prima (Ley 50/1980, art. 10).
            </li>
            <li>
              Si el coche está financiado, revisa el contrato de préstamo o leasing: puede
              exigir un seguro a todo riesgo. Es una condición del contrato, no de la ley, que
              solo obliga a la responsabilidad civil.
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
