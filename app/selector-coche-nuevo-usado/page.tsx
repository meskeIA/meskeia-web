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
import styles from './SelectorCocheNuevoUsado.module.css';

/* ============================================================
   TIPOS
   ============================================================ */
type VeredictoKey = 'nuevo' | 'seminuevo' | 'segundamano';

interface Opcion {
  texto: string;
  puntos: number;
}

interface Pregunta {
  id: number;
  texto: string;
  opciones: Opcion[];
}

interface Veredicto {
  key: VeredictoKey;
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
    texto: '¿Cuál es tu presupuesto máximo para el coche?',
    opciones: [
      { texto: 'Hasta 10.000 €', puntos: -4 },
      { texto: 'Entre 10.000 € y 20.000 €', puntos: -1 },
      { texto: 'Entre 20.000 € y 35.000 €', puntos: 2 },
      { texto: 'Más de 35.000 €', puntos: 4 },
    ],
  },
  {
    id: 2,
    texto: '¿Cuántos km vas a hacer al año aproximadamente?',
    opciones: [
      { texto: 'Menos de 10.000 km', puntos: -1 },
      { texto: 'Entre 10.000 y 20.000 km', puntos: 0 },
      { texto: 'Entre 20.000 y 40.000 km', puntos: 1 },
      { texto: 'Más de 40.000 km', puntos: 3 },
    ],
  },
  {
    id: 3,
    texto: '¿Cuántos años planeas quedarte con este coche?',
    opciones: [
      { texto: '1 o 2 años', puntos: -3 },
      { texto: 'Entre 3 y 5 años', puntos: 0 },
      { texto: 'Entre 5 y 10 años', puntos: 2 },
      { texto: 'Más de 10 años', puntos: 3 },
    ],
  },
  {
    id: 4,
    texto: '¿Qué importancia le das a la garantía del fabricante?',
    opciones: [
      { texto: 'Es imprescindible para mí', puntos: 3 },
      { texto: 'Es importante pero no fundamental', puntos: 1 },
      { texto: 'Puedo prescindir de ella si el precio es bueno', puntos: -2 },
    ],
  },
  {
    id: 5,
    texto: '¿Vives o trabajas en una ciudad con Zona de Bajas Emisiones (ZBE)?',
    opciones: [
      { texto: 'Sí, necesito etiqueta CERO o ECO', puntos: 2 },
      { texto: 'Puede afectarme en el futuro', puntos: 1 },
      { texto: 'No, vivo en zona sin restricciones', puntos: -1 },
    ],
  },
  {
    id: 6,
    texto: '¿Cómo piensas financiar la compra?',
    opciones: [
      { texto: 'Al contado, sin financiación', puntos: -1 },
      { texto: 'Con financiación parcial', puntos: 0 },
      { texto: 'Necesito financiación total', puntos: 2 },
    ],
  },
  {
    id: 7,
    texto: '¿Tienes conocimientos o puedes verificar el estado de un coche de segunda mano?',
    opciones: [
      { texto: 'Sí, con ayuda de mecánico de confianza', puntos: -2 },
      { texto: 'Tengo conocimientos básicos', puntos: -1 },
      { texto: 'No, necesito comprar con garantías', puntos: 2 },
    ],
  },
  {
    id: 8,
    texto: '¿Cuánto te importa estrenar el coche (ser el primer propietario)?',
    opciones: [
      { texto: 'Mucho, es importante para mí', puntos: 3 },
      { texto: 'Algo, pero no es prioritario', puntos: 1 },
      { texto: 'Nada, solo me importa que funcione bien', puntos: -2 },
    ],
  },
  {
    id: 9,
    texto: '¿Has tenido problemas con coches de segunda mano antes?',
    opciones: [
      { texto: 'Sí, tuve malas experiencias', puntos: 2 },
      { texto: 'No, buenas experiencias con usados', puntos: -2 },
      { texto: 'Es la primera vez que compro', puntos: 0 },
    ],
  },
  {
    id: 10,
    texto: '¿Qué modelo o tipo de coche tienes en mente?',
    opciones: [
      { texto: 'Un modelo específico y reciente que solo existe nuevo', puntos: 2 },
      { texto: 'Cualquier modelo que cumpla mis necesidades', puntos: -1 },
      { texto: 'Me da igual, busco relación calidad-precio', puntos: -2 },
    ],
  },
];

/* ============================================================
   VEREDICTOS
   ============================================================ */
const VEREDICTOS: Record<VeredictoKey, Veredicto> = {
  nuevo: {
    key: 'nuevo',
    icono: '🆕',
    titulo: 'Coche Nuevo',
    subtitulo: 'Tu perfil encaja con comprar un vehículo nuevo',
    descripcion:
      'Con tu presupuesto, el tiempo que planeas conservar el coche y la importancia que le das a la garantía y la etiqueta DGT, un coche nuevo es probablemente tu mejor opción. Estrenarás con garantía oficial, la última tecnología de seguridad y emisiones, y podrás beneficiarte de planes de financiación del fabricante. Ten en cuenta que la depreciación es mayor durante los primeros 2-3 años.',
    ventajas: [
      'Garantía del fabricante (3 años mínimo en España)',
      'Última tecnología de seguridad y conectividad',
      'Etiqueta DGT ECO o CERO en la mayoría de modelos nuevos',
      'Sin historial desconocido ni km previos',
      'Planes de financiación y mantenimiento incluido',
    ],
    consejos: [
      'Compara entre varios concesionarios: los descuentos sobre el precio de lista pueden llegar al 15-20%.',
      'Consulta el Plan MOVES u otras ayudas autonómicas si consideras un vehículo electrófico o híbrido.',
      'Calcula el coste total: precio + seguro + mantenimiento + combustible a lo largo de los años que lo vas a usar.',
      'Revisa el historial de fiabilidad del modelo en foros y asociaciones de consumidores.',
    ],
  },
  seminuevo: {
    key: 'seminuevo',
    icono: '🔄',
    titulo: 'Coche Seminuevo (1-3 años)',
    subtitulo: 'La mejor relación calidad-precio para tu perfil',
    descripcion:
      'Un coche seminuevo de entre 1 y 3 años es el punto óptimo para tu situación: la depreciación más brusca ya ha ocurrido (el coche pierde un 30-40% de valor en el primer año), pero el vehículo conserva la mayor parte de su vida útil, las garantías pueden seguir vigentes y suele tener etiqueta DGT reciente. Es la elección inteligente para quien quiere un coche moderno sin pagar el precio de nuevo.',
    ventajas: [
      'Precio hasta un 30-40% inferior al nuevo equivalente',
      'Garantía oficial que puede seguir vigente o ser extensible',
      'Etiqueta DGT reciente (ECO o C en la mayoría de casos)',
      'Pocos km y estado casi como nuevo',
      'Historial de servicio verificable',
    ],
    consejos: [
      'Busca en programas de coches de ocasión certificados del propio fabricante (BMW Selekt, Volkswagen Das WeltAuto, Toyota Kinto…).',
      'Verifica el informe de la DGT (cargas, embargos, km reales) antes de cerrar la compra.',
      'Exige siempre garantía por escrito de al menos 1 año (obligatorio por ley).',
      'Lleva el coche a un mecánico de confianza para una revisión previa a la compra.',
    ],
  },
  segundamano: {
    key: 'segundamano',
    icono: '🔍',
    titulo: 'Coche de Segunda Mano',
    subtitulo: 'Máximo ahorro si priorizas el precio',
    descripcion:
      'Tu perfil apunta a que un coche de segunda mano (más de 3 años) es el más adecuado para ti: ya sea por presupuesto ajustado, pocos km anuales previstos o experiencia previa con usados. Es la opción con mayor ahorro inicial, aunque requiere más diligencia en la compra para evitar sorpresas. Con una buena revisión técnica previa, puedes encontrar un coche fiable a muy buen precio.',
    ventajas: [
      'Precio muy inferior al nuevo o seminuevo',
      'Sin depreciación inicial brusca (ya está amortizada)',
      'Ideal para pocos km anuales o uso urbano suave',
      'Mayor variedad de modelos disponibles',
      'Garantía legal mínima de 1 año en España',
    ],
    consejos: [
      'Nunca compres sin revisar el historial de km y mantenimiento (ITV, libro de revisiones).',
      'Solicita un informe DGT para verificar cargas, embargos y titularidad real.',
      'Lleva el coche a un mecánico de confianza antes de comprar: una revisión de 50-100 € puede ahorrarte miles.',
      'Comprueba la etiqueta DGT del vehículo: un coche sin etiqueta puede tener restricciones en ciudades con ZBE.',
      'Negocia el precio: en segunda mano hay más margen que en concesionario oficial.',
    ],
  },
};

/* ============================================================
   FUNCIÓN DE CÁLCULO DEL VEREDICTO
   ============================================================ */
function calcularVeredicto(respuestas: (number | null)[]): VeredictoKey {
  const total = respuestas.reduce<number>((acc, r) => acc + (r ?? 0), 0);
  if (total >= 8) return 'nuevo';
  if (total <= -8) return 'segundamano';
  return 'seminuevo';
}

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */
export default function SelectorCocheNuevoUsado() {
  const [preguntaActual, setPreguntaActual] = useState<number>(0);
  // null = sin respuesta todavía; number = índice de la opción elegida
  const [respuestas, setRespuestas] = useState<(number | null)[]>(
    Array(PREGUNTAS.length).fill(null)
  );
  const [mostrarResultado, setMostrarResultado] = useState<boolean>(false);

  const pregunta = PREGUNTAS[preguntaActual];
  const esUltima = preguntaActual === PREGUNTAS.length - 1;
  const respuestaActual = respuestas[preguntaActual];
  const progresoPct = ((preguntaActual + 1) / PREGUNTAS.length) * 100;

  function seleccionarOpcion(indiceOpcion: number) {
    const nuevas = [...respuestas];
    nuevas[preguntaActual] = indiceOpcion;
    setRespuestas(nuevas);
  }

  function irAnterior() {
    if (preguntaActual > 0) setPreguntaActual(preguntaActual - 1);
  }

  function irSiguiente() {
    if (preguntaActual < PREGUNTAS.length - 1) setPreguntaActual(preguntaActual + 1);
  }

  function verResultado() {
    setMostrarResultado(true);
  }

  function reiniciar() {
    setRespuestas(Array(PREGUNTAS.length).fill(null));
    setPreguntaActual(0);
    setMostrarResultado(false);
  }

  // Calcular puntos para el veredicto
  const puntosRespuestas: (number | null)[] = respuestas.map((r, i) =>
    r !== null ? PREGUNTAS[i].opciones[r].puntos : null
  );
  const veredictoKey = calcularVeredicto(puntosRespuestas);
  const veredicto = VEREDICTOS[veredictoKey];

  const claseVeredicto =
    veredictoKey === 'nuevo'
      ? styles.veredicto_nuevo
      : veredictoKey === 'seminuevo'
        ? styles.veredicto_seminuevo
        : styles.veredicto_segundamano;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>¿Coche nuevo, seminuevo o segunda mano?</h1>
        <p className={styles.heroSubtitle}>
          Responde 10 preguntas sobre tu presupuesto, uso y prioridades. Te diremos qué opción se
          adapta mejor a ti.
        </p>
      </header>

      <div className={styles.legalNoticeWrapper}>
        <LegalNotice />
      </div>

      {!mostrarResultado ? (
        <main className={styles.testSection} aria-label="Test de selección de coche">
          {/* Barra de progreso */}
          <div className={styles.progreso} role="progressbar" aria-valuenow={preguntaActual + 1} aria-valuemin={1} aria-valuemax={PREGUNTAS.length} aria-label={`Pregunta ${preguntaActual + 1} de ${PREGUNTAS.length}`}>
            <div className={styles.progresoBar}>
              <div
                className={styles.progresoFill}
                style={{ width: `${progresoPct}%` }}
              />
            </div>
          </div>

          {/* Pregunta */}
          <div className={styles.pregunta}>
            <p className={styles.preguntaNumero}>
              Pregunta {preguntaActual + 1} de {PREGUNTAS.length}
            </p>
            <p className={styles.preguntaTexto}>{pregunta.texto}</p>

            <div className={styles.opciones} role="group" aria-label={`Opciones para: ${pregunta.texto}`}>
              {pregunta.opciones.map((opcion, idx) => {
                const esSeleccionada = respuestaActual === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`${styles.opcionBtn} ${esSeleccionada ? styles.selected : ''}`}
                    onClick={() => seleccionarOpcion(idx)}
                    aria-pressed={esSeleccionada ? true : false}
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
                className={styles.btnSiguiente}
                onClick={irSiguiente}
                disabled={respuestaActual === null}
                aria-label="Ir a la siguiente pregunta"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                className={styles.btnResultado}
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
        <section className={styles.resultadoSection} aria-label="Resultado del test">
          <div className={`${styles.resultadoCard} ${claseVeredicto}`}>
            <span className={styles.veredictoIcono} aria-hidden="true">
              {veredicto.icono}
            </span>
            <h2 className={styles.veredictoTitulo}>{veredicto.titulo}</h2>
            <p className={styles.veredictoSubtitulo}>{veredicto.subtitulo}</p>

            <p className={styles.veredictoDesc}>{veredicto.descripcion}</p>

            {/* Grid de factores clave */}
            <div className={styles.factoresGrid}>
              <div className={styles.factorCard}>
                <strong>Presupuesto</strong>
                {veredictoKey === 'nuevo'
                  ? 'Permite acceder a vehículos nuevos'
                  : veredictoKey === 'seminuevo'
                    ? 'Rango ideal para seminuevos de calidad'
                    : 'Optimizar el ahorro inicial'}
              </div>
              <div className={styles.factorCard}>
                <strong>Garantía</strong>
                {veredictoKey === 'nuevo'
                  ? 'Garantía oficial del fabricante'
                  : veredictoKey === 'seminuevo'
                    ? 'Garantía vigente o extensible'
                    : 'Garantía legal mínima 1 año'}
              </div>
              <div className={styles.factorCard}>
                <strong>Etiqueta DGT</strong>
                {veredictoKey === 'nuevo'
                  ? 'ECO o CERO en modelos 2020+'
                  : veredictoKey === 'seminuevo'
                    ? 'ECO o C según modelo y año'
                    : 'Verificar etiqueta antes de comprar'}
              </div>
              <div className={styles.factorCard}>
                <strong>Depreciación</strong>
                {veredictoKey === 'nuevo'
                  ? 'Mayor en primeros 2-3 años'
                  : veredictoKey === 'seminuevo'
                    ? 'Lo peor ya ha ocurrido'
                    : 'Mínima, ya está amortizada'}
              </div>
            </div>

            {/* Ventajas */}
            <div className={styles.ventajasSection}>
              <h3>Ventajas principales</h3>
              <ul>
                {veredicto.ventajas.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>

            {/* Consejos */}
            <div className={styles.consejosSection}>
              <h3>Consejos antes de comprar</h3>
              <ol>
                {veredicto.consejos.map((c, i) => (
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

      <DisclaimerCard variant="general" severity="medium" />

      <EducationalSection title="Nuevo, seminuevo o segunda mano: lo que debes saber" subtitle="Claves para tomar la mejor decisión de compra">
        <h3>Depreciación: el coste oculto del coche nuevo</h3>
        <p>
          Un coche nuevo pierde aproximadamente un <strong>20% de su valor</strong> en el momento en
          que sale del concesionario, y entre un <strong>30% y un 40%</strong> durante el primer
          año. A partir del tercer año, la depreciación se estabiliza. Esto significa que quien
          compra un seminuevo de 1-2 años se beneficia de una caída de precio que ya ha ocurrido
          sin renunciar a un vehículo moderno.
        </p>

        <h3>Garantías: lo que dice la ley española</h3>
        <p>
          En España, la Ley de Garantías establece:
        </p>
        <ul>
          <li>
            <strong>Coche nuevo:</strong> garantía legal mínima de <strong>3 años</strong> desde
            2022 (antes 2 años).
          </li>
          <li>
            <strong>Coche seminuevo (certificado):</strong> puede conservar la garantía oficial del
            fabricante si no ha expirado, o disponer de garantía extendida.
          </li>
          <li>
            <strong>Coche de segunda mano:</strong> garantía legal mínima de <strong>1 año</strong>{' '}
            cuando se compra a un profesional (concesionario o empresa). En transacciones entre
            particulares no existe obligación legal.
          </li>
        </ul>

        <div className={styles.warningBox} role="note">
          <strong>Aviso importante:</strong> Un coche de segunda mano puede parecer más barato, pero
          las reparaciones no previstas pueden encarecer el coste total de propiedad
          significativamente. Siempre revísalo con un mecánico de confianza antes de comprar, y
          solicita el informe de la DGT para comprobar km reales, cargas y titularidad.
        </div>

        <h3>Etiqueta DGT y Zonas de Bajas Emisiones (ZBE)</h3>
        <p>
          La DGT clasifica los vehículos según sus emisiones con cuatro etiquetas:{' '}
          <strong>CERO</strong> (eléctricos e hidrógeno), <strong>ECO</strong> (híbridos enchufables
          y no enchufables, GNC/GLP), <strong>C</strong> (gasolina desde 2006, diésel desde 2014) y{' '}
          <strong>B</strong> (gasolina desde 2000, diésel desde 2006). Los vehículos más antiguos
          no tienen etiqueta.
        </p>
        <p>
          Los coches nuevos desde 2020 suelen obtener etiqueta <strong>ECO o CERO</strong>. Los
          vehículos de segunda mano más antiguos pueden no tener etiqueta y tener restringido el
          acceso a ciudades con ZBE (Madrid, Barcelona, Valladolid, Zaragoza…).
        </p>

        <h3>Coste total de propiedad: más allá del precio de compra</h3>
        <p>
          Para comparar correctamente tres opciones, suma durante los años que planeas conservar el
          coche:
        </p>
        <ul>
          <li>Precio de compra menos valor de reventa estimado</li>
          <li>Seguro anual (suele ser más barato en usados)</li>
          <li>Mantenimiento y reparaciones estimadas</li>
          <li>Combustible o electricidad según km previstos</li>
          <li>ITV y otros impuestos</li>
        </ul>
        <p>
          A menudo, un seminuevo bien elegido resulta más económico en coste total que un nuevo,
          aunque la cuota mensual de financiación sea similar.
        </p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-coche-nuevo-usado')} />
      <ShareCard appName="selector-coche-nuevo-usado" />
      <Footer appName="selector-coche-nuevo-usado" />
    </div>
  );
}
