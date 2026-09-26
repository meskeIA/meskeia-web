'use client';

import React, { useEffect, useRef, useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import DisclaimerCard from '@/components/DisclaimerCard';
import DataReference from '@/components/DataReference';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import { PREGUNTAS, calcularResultado, type TipoVivienda } from './motor';
import {
  IVA_OBRA_NUEVA,
  PRECIO_EJEMPLO_TEXTO,
  RANGO_AJD,
  RANGO_GASTOS_NUEVA,
  RANGO_GASTOS_USADA,
  RANGO_ITP,
  REFERENCIA_NORMATIVA,
} from './cifras';
import styles from './SelectorTipoVivienda.module.css';

// Las preguntas, sus puntos, lo que cada respuesta descarta y la resolución viven en ./motor.ts;
// las cifras de la guía que salen de la normativa, en ./cifras.ts.

/* ── Tipos ── */
interface Recomendacion {
  key: TipoVivienda;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  ventajas: string[];
  consideraciones: string[];
}

/* ── Datos de recomendaciones ── */
const RECOMENDACIONES: Record<TipoVivienda, Recomendacion> = {
  piso: {
    key: 'piso',
    titulo: 'Piso Estándar',
    subtitulo: 'La opción más versátil para la mayoría de situaciones',
    descripcion:
      'Un piso en bloque residencial ofrece el mejor equilibrio entre precio, ubicación y acceso a servicios. Es la tipología más extendida en España y se adapta a una amplia variedad de perfiles: familias, parejas y profesionales. La comunidad de vecinos es una responsabilidad compartida que conviene valorar.',
    ventajas: [
      'Amplia oferta, tanto en compra como en alquiler',
      'Acceso a servicios urbanos y transporte público',
      'Precio generalmente más asequible que ático o casa',
      'Comunidad de vecinos para gastos compartidos',
    ],
    consideraciones: [
      'Ruido de vecinos superior a casa o ático',
      'Sin espacio exterior propio (salvo terraza pequeña)',
      'Comunidad de vecinos implica cuotas y acuerdos',
      'Menor privacidad que una vivienda unifamiliar',
    ],
  },
  casa: {
    key: 'casa',
    titulo: 'Casa Unifamiliar',
    subtitulo: 'Máximo espacio, privacidad y jardín propio',
    descripcion:
      'La casa unifamiliar es ideal para familias con hijos, mascotas o quienes valoran la privacidad y el contacto con el exterior. El jardín, el garaje y la mayor superficie compensan el mayor coste, el mantenimiento adicional y la ubicación normalmente más periférica.',
    ventajas: [
      'Máxima privacidad y ausencia de vecinos de pared',
      'Jardín, garaje y almacenamiento propio',
      // Hallazgo 2080: la app sirve para comprar y para alquilar, y en alquiler la Ley 29/1994 de
      // Arrendamientos Urbanos dice lo contrario (art. 23.1: las obras que modifiquen la
      // configuración exigen consentimiento escrito del arrendador; art. 21.1: las reparaciones de
      // habitabilidad son del arrendador). BOE-A-1994-26003, consultado el 26/09/2026.
      'En propiedad, libertad para reformar y personalizar (en alquiler, las obras que cambian la configuración necesitan el permiso escrito del propietario)',
      'Ideal para familias numerosas y mascotas',
    ],
    consideraciones: [
      'Mayor precio de compra o de alquiler, y más gastos de mantenimiento',
      'Ubicación frecuentemente periférica (más dependencia del coche)',
      'Calefacción y suministros con mayor coste',
      'En propiedad, la conservación corre íntegramente a tu cargo (en alquiler, las reparaciones que mantienen la vivienda habitable corresponden al propietario)',
    ],
  },
  atico: {
    key: 'atico',
    titulo: 'Ático o Dúplex',
    subtitulo: 'Vistas, terraza amplia y privacidad en altura',
    descripcion:
      'El ático o dúplex combina la ubicación urbana del piso con una gran terraza y mayor privacidad al tener menos vecinos colindantes. Las vistas y la luz natural son sus puntos fuertes. El precio suele ser más elevado y hay que considerar el calor en verano si no cuenta con buenas instalaciones.',
    ventajas: [
      'Terraza grande o azotea privada',
      'Vistas y abundante luz natural',
      'Mayor privacidad (menos vecinos en planta)',
      'Ubicación urbana con sensación de vivienda espaciosa',
    ],
    consideraciones: [
      'Precio generalmente superior al piso equivalente',
      'Puede acumular más calor en verano',
      'Coste energético más elevado (techo en contacto con exterior)',
      'Subida de escaleras o ascensor obligatorio',
    ],
  },
  estudio: {
    key: 'estudio',
    titulo: 'Estudio o Apartamento',
    subtitulo: 'Máxima eficiencia económica y céntrico',
    descripcion:
      'El estudio o apartamento es la solución más económica para una persona sola o pareja sin hijos que pasa poco tiempo en casa. Su bajo mantenimiento, precio reducido y ubicación habitual en zonas céntricas son sus principales ventajas. El espacio reducido puede resultar limitante a largo plazo.',
    ventajas: [
      'Precio de compra o alquiler más bajo',
      'Mínimo mantenimiento y gastos de comunidad',
      'Habitualmente en ubicaciones céntricas',
      'Ideal para quien viaja o teletrabaja fuera',
    ],
    consideraciones: [
      'Espacio muy reducido para más de una persona',
      'Sin despacho ni habitaciones separadas',
      'Difícil organización si recibes visitas frecuentes',
      'Puede resultar pequeño con el tiempo',
    ],
  },
  compartido: {
    key: 'compartido',
    titulo: 'Piso Compartido',
    subtitulo: 'Mayor ahorro y flexibilidad en etapas de transición',
    descripcion:
      'El piso compartido es la opción óptima cuando el presupuesto es ajustado o la situación vital es transitoria. Permite acceder a viviendas mejor ubicadas y de mayor tamaño a menor coste individual. La menor privacidad y la necesidad de convivir con otras personas son sus principales inconvenientes.',
    ventajas: [
      'Ahorro significativo en alquiler y suministros',
      'Acceso a pisos más grandes o mejor ubicados',
      'Socialización y apoyo en momentos de transición',
      'Flexibilidad y menor compromiso a largo plazo',
    ],
    consideraciones: [
      'Privacidad limitada en zonas comunes',
      'Dependencia de la convivencia con compañeros',
      'No permite personalizar ni reformar el espacio',
      'No es una solución para familias con hijos',
    ],
  },
};

/* ── Colores por tipo ── */
const COLORES: Record<TipoVivienda, string> = {
  piso: '#2E86AB',
  casa: '#5b9e6f',
  atico: '#e8a020',
  estudio: '#48A9A6',
  compartido: '#c0392b',
};


/** «A», «A y B», «A, B y C». */
const enumerar = (items: string[]): string =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;

interface DetalleProps {
  recomendacion: Recomendacion;
  /** Con un solo ganador el título ya está en el <h2>; con empate, cada tipo lleva el suyo. */
  conTitulo: boolean;
}

function Detalle({ recomendacion, conTitulo }: DetalleProps) {
  const Encabezado = conTitulo ? 'h4' : 'h3';
  return (
    <div className={conTitulo ? styles.detalleEmpatado : undefined}>
      {conTitulo && <h3 className={styles.detalleTitulo}>{recomendacion.titulo}</h3>}
      <p className={styles.recomendacionSubtitulo}>{recomendacion.subtitulo}</p>
      <p className={styles.recomendacionDesc}>{recomendacion.descripcion}</p>

      <div className={styles.ventajasGrid}>
        <div className={styles.ventajaCard}>
          <Encabezado>Ventajas</Encabezado>
          <ul>
            {recomendacion.ventajas.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </div>
        <div className={styles.ventajaCard}>
          <Encabezado>A tener en cuenta</Encabezado>
          <ul>
            {recomendacion.consideraciones.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ── Componente principal ── */
export default function SelectorTipoVivienda() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const enunciado = useRef<HTMLHeadingElement>(null);
  const tituloResultado = useRef<HTMLHeadingElement>(null);
  /** Solo se mueve el foco tras una acción del usuario, nunca al cargar la página. */
  const moverFoco = useRef(false);

  const total = PREGUNTAS.length;
  const opcionSeleccionada = respuestas[preguntaActual] ?? -1;
  // Lo pintado y lo anunciado son la misma fracción: preguntas ya superadas / total. Antes la
  // barra anunciaba el número de pregunta con mínimo 1 y pintaba (pregunta − 1) / 10, y en la
  // pregunta 10 anunciaba el 100 % con el test sin terminar (hallazgo 2075).
  const progresoPct = mostrarResultado ? 100 : (preguntaActual / total) * 100;

  // Al avanzar, el «Siguiente» pulsado queda desactivado en la pregunta nueva (aún sin
  // respuesta) o se desmonta, y el foco caía a <body>: el lector de pantalla no oía ni la
  // pregunta nueva ni el resultado (hallazgo 2073). Se lleva al enunciado o al resultado.
  useEffect(() => {
    if (!moverFoco.current) return;
    moverFoco.current = false;
    if (mostrarResultado) tituloResultado.current?.focus();
    else enunciado.current?.focus();
  }, [preguntaActual, mostrarResultado]);

  /* ── Handlers ── */
  const handleSeleccionarOpcion = (idx: number) => {
    setRespuestas((prev) => ({ ...prev, [preguntaActual]: idx }));
  };

  /**
   * Teclado del patrón de radios (WAI-ARIA APG): las flechas mueven el foco a la opción vecina y
   * la marcan, e Inicio/Fin van a los extremos. El grupo es una sola parada de Tab.
   */
  const teclaEnOpcion = (e: React.KeyboardEvent<HTMLButtonElement>, indice: number) => {
    const n = PREGUNTAS[preguntaActual].opciones.length;
    let destino: number;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') destino = (indice + 1) % n;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') destino = (indice - 1 + n) % n;
    else if (e.key === 'Home') destino = 0;
    else if (e.key === 'End') destino = n - 1;
    else return;
    e.preventDefault();
    handleSeleccionarOpcion(destino);
    const radios = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    radios?.[destino]?.focus();
  };

  const handleSiguiente = () => {
    if (preguntaActual < total - 1) {
      moverFoco.current = true;
      setPreguntaActual((p) => p + 1);
    }
  };

  const handleAnterior = () => {
    if (preguntaActual > 0) {
      moverFoco.current = true;
      setPreguntaActual((p) => p - 1);
    }
  };

  const handleVerResultado = () => {
    moverFoco.current = true;
    setMostrarResultado(true);
  };

  const handleReiniciar = () => {
    moverFoco.current = true;
    setPreguntaActual(0);
    setRespuestas({});
    setMostrarResultado(false);
  };

  const resultado = mostrarResultado ? calcularResultado(respuestas) : null;
  const ganadores = resultado ? resultado.ganadores.map((t) => RECOMENDACIONES[t]) : [];
  const principal = resultado ? resultado.ganadores[0] : null;
  const puntosGanador = resultado && principal ? resultado.puntos[principal] : 0;
  const presupuesto = PREGUNTAS[1].opciones[respuestas[1]]?.texto.toLowerCase() ?? '';
  // Los tipos que tus preferencias puntuaban MÁS alto pero el presupuesto deja fuera (2069).
  const acotadosPorPresupuesto =
    resultado && !resultado.chocaConPresupuesto
      ? resultado.fueraDePresupuesto.filter((t) => resultado.puntos[t] > puntosGanador)
      : [];
  const esUltima = preguntaActual === total - 1;
  const preguntaData = PREGUNTAS[preguntaActual];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>¿Piso, casa, ático o estudio?</h1>
        <p className={styles.heroSubtitle}>
          Responde 10 preguntas sobre tu familia, presupuesto y estilo de vida para descubrir qué tipo de vivienda se adapta mejor a ti.
        </p>
      </header>

      <LegalNotice />

      {/* ── Test ── */}
      {!mostrarResultado && (
        <section className={styles.testSection} aria-label="Test de tipo de vivienda">
          {/* Barra de progreso */}
          <div
            className={styles.progreso}
            role="progressbar"
            aria-valuenow={preguntaActual}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuetext={`Pregunta ${preguntaActual + 1} de ${total}`}
            aria-label="Progreso del test"
          >
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
              Pregunta {preguntaActual + 1} de {total}
            </p>
            <h2 className={styles.preguntaTexto} ref={enunciado} tabIndex={-1}>{preguntaData.texto}</h2>

            {/* role="radio" + aria-checked, no aria-pressed: es una elección ÚNICA entre
                alternativas, no un conjunto de conmutadores (hallazgo 2074). */}
            <div className={styles.opciones} role="radiogroup" aria-label={preguntaData.texto}>
              {preguntaData.opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="radio"
                  aria-checked={opcionSeleccionada === idx}
                  // Tabindex itinerante: la marcada, o la primera si no hay ninguna.
                  tabIndex={opcionSeleccionada === -1 ? (idx === 0 ? 0 : -1) : opcionSeleccionada === idx ? 0 : -1}
                  className={`${styles.opcionBtn}${opcionSeleccionada === idx ? ` ${styles.selected}` : ''}`}
                  onClick={() => handleSeleccionarOpcion(idx)}
                  onKeyDown={(e) => teclaEnOpcion(e, idx)}
                >
                  {opcion.texto}
                </button>
              ))}
            </div>
          </div>

          {/* Navegación */}
          <div className={styles.navegacion}>
            <button
              type="button"
              className={styles.btnAnterior}
              onClick={handleAnterior}
              disabled={preguntaActual === 0}
              aria-label="Pregunta anterior"
            >
              ← Anterior
            </button>

            {!esUltima && (
              <button
                type="button"
                className={styles.btnSiguiente}
                onClick={handleSiguiente}
                disabled={opcionSeleccionada === -1}
                aria-label="Siguiente pregunta"
              >
                Siguiente →
              </button>
            )}

            {esUltima && (
              <button
                type="button"
                className={styles.btnResultado}
                onClick={handleVerResultado}
                disabled={opcionSeleccionada === -1}
                aria-label="Ver mi resultado"
              >
                Ver mi resultado →
              </button>
            )}
          </div>
        </section>
      )}

      {/* ── Resultado ── */}
      {resultado && principal && (
        <section className={styles.resultadoSection} aria-label="Resultado del test">
          <div
            className={`${styles.resultadoCard} ${styles[`recomendacion_${principal}`]}`}
            style={{ borderTopColor: COLORES[principal] }}
          >
            <h2 className={styles.recomendacionTitulo} ref={tituloResultado} tabIndex={-1}>
              Tu tipo de vivienda ideal: {ganadores.map((g) => g.titulo).join(' o ')}
            </h2>

            {/* Un empate exacto se dice: antes lo deshacía en silencio el orden de declaración
                (hallazgo 2070). */}
            {ganadores.length > 1 && (
              <p className={styles.avisoResultado}>
                <strong>Empate a {puntosGanador} puntos.</strong> Tus respuestas encajan igual de bien con{' '}
                {enumerar(ganadores.map((g) => g.titulo))}. Abajo tienes las ventajas y cautelas de cada uno para que
                decidas qué pesa más para ti.
              </p>
            )}

            {/* El presupuesto acota (hallazgo 2069): si ningún tipo compatible cabe en él, se dice. */}
            {resultado.chocaConPresupuesto && (
              <p className={styles.avisoResultado}>
                <strong>Choque con tu presupuesto.</strong> Con un presupuesto «{presupuesto}», este tipo de vivienda
                suele quedar fuera de alcance, pero es el único compatible con el resto de tus respuestas. Valora qué
                pesa más: lo que necesitas o lo que puedes gastar.
              </p>
            )}
            {acotadosPorPresupuesto.length > 0 && (
              <p className={styles.avisoResultado}>
                Por tus preferencias, {enumerar(acotadosPorPresupuesto.map((t) => RECOMENDACIONES[t].titulo))}{' '}
                {acotadosPorPresupuesto.length > 1 ? 'sumaban' : 'sumaba'} más puntos, pero con un presupuesto
                «{presupuesto}» suele quedar fuera de alcance.
              </p>
            )}

            {ganadores.map((g) => (
              <Detalle key={g.key} recomendacion={g} conTitulo={ganadores.length > 1} />
            ))}

            <div className={styles.consejosSection}>
              <h3>Próximos pasos recomendados</h3>
              <ul>
                <li>Utiliza el <a href="/selector-zona-residencia/">Selector de Zona de Residencia</a> para elegir en qué tipo de ciudad o zona vivir.</li>
                <li>Decide entre alquilar o comprar con el <a href="/selector-alquiler-vs-compra/">Selector de Alquiler o Compra</a>.</li>
                {/* Hallazgo 2081: los gastos de compra los calcula este estimador; el «Estimador
                    Coste Vivienda» calcula lo que cuesta MANTENER la vivienda cada mes. */}
                <li>Si vas a comprar, calcula los impuestos, la notaría y el registro con el <a href="/estimador-compraventa-inmueble/">Estimador Gastos Compraventa Vivienda</a>.</li>
                <li>Si vas a hipotecarte, consulta el <a href="/estimador-hipoteca/">Estimador de Hipoteca</a> para simular tu cuota mensual.</li>
              </ul>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button
                type="button"
                className={styles.btnReiniciar}
                onClick={handleReiniciar}
                aria-label="Repetir el test desde el principio"
              >
                Repetir el test
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Disclaimer ── */}
      <DisclaimerCard variant="financial" severity="critical" />
      <DataReference
        normativa={REFERENCIA_NORMATIVA.normativa}
        fuente={REFERENCIA_NORMATIVA.fuente}
        verificado={REFERENCIA_NORMATIVA.verificado}
        urlOficial={REFERENCIA_NORMATIVA.urlOficial}
      />

      {/* ── Sección educativa ── */}
      <EducationalSection
        title="Tipos de vivienda: ventajas e inconvenientes"
        subtitle="Guía para elegir la vivienda que mejor se adapta a tu vida"
      >
        <h3>Piso estándar: la opción más habitual en España</h3>
        <p>
          El piso en bloque de pisos es con diferencia la tipología más extendida en las ciudades españolas. Ofrece un equilibrio razonable entre precio, superficie, ubicación y acceso a servicios. La comunidad de propietarios gestiona el mantenimiento de zonas comunes, lo que reduce la responsabilidad individual pero implica cuotas mensuales y acuerdos colectivos.
        </p>

        <h3>Casa unifamiliar: espacio y privacidad a cambio de mayor coste</h3>
        <p>
          La vivienda unifamiliar (adosada, pareada o aislada) proporciona el mayor nivel de privacidad, autonomía y espacio exterior. Es la preferida por familias numerosas y quienes tienen mascotas. Sin embargo, su precio de adquisición es generalmente más alto, suele estar ubicada en la periferia y todo el mantenimiento recae sobre el propietario: jardín, tejado, instalaciones y fachada. Si se alquila, en España las reparaciones que mantienen la vivienda habitable corresponden al propietario, y las obras que cambian su configuración necesitan su permiso por escrito (Ley 29/1994 de Arrendamientos Urbanos, arts. 21 y 23).
        </p>

        <h3>Ático y dúplex: luz, vistas y terraza en entorno urbano</h3>
        <p>
          Los áticos ofrecen lo mejor de dos mundos: ubicación urbana y una terraza o azotea amplia que simula el espacio exterior de una casa. La luz natural y las vistas son sus puntos fuertes. Su principal inconveniente es el precio superior al piso equivalente y la mayor exposición a temperaturas extremas (verano especialmente), que pueden incrementar el consumo energético si la vivienda no está bien aislada.
        </p>

        <h3>Estudio y apartamento: eficiencia para personas solas</h3>
        <p>
          Los estudios son la opción más económica para una persona que vive sola, trabaja fuera de casa y no necesita espacio adicional, tanto en compra como en alquiler (arriendo). Su menor superficie reduce la factura energética y los gastos de comunidad. En contrapartida, la falta de espacio puede resultar limitante si la situación familiar cambia o si se necesita trabajar regularmente desde casa.
        </p>

        <h3>Cómo cambian las necesidades según el ciclo vital</h3>
        <p>
          Las necesidades de vivienda evolucionan: un estudiante puede comenzar alquilando (arrendando) una habitación en piso compartido, saltar a un estudio al independizarse, mudarse a un piso estándar con su pareja y plantearse una casa unifamiliar al tener hijos. Con la llegada del «nido vacío» (hijos independizados), muchas familias vuelven a un piso más pequeño o a un ático con buenas vistas. Anticipar este recorrido vital ayuda a tomar decisiones más acertadas.
        </p>

        {/* Hallazgo 2071: las cifras salen de ./cifras.ts, derivadas de data/itp-ccaa.ts. Decía,
            escrito a mano, que los gastos eran «entre el 10 y el 15» por ciento del precio, el ITP
            «entre el 6 y el 10» y el AJD de toda compra «entre el 0,5 y el 1,5». */}
        <h3>Gastos adicionales al comprar cualquier tipo de vivienda</h3>
        <p>
          Independientemente del tipo elegido, comprar una vivienda en España tiene costes que se suman al precio y que la hipoteca no suele cubrir. Con los tipos generales de cada comunidad (sin reducciones por colectivo), los impuestos, la notaría y el registro de una vivienda de {PRECIO_EJEMPLO_TEXTO} suman {RANGO_GASTOS_USADA} del precio si es usada, y {RANGO_GASTOS_NUEVA} si es nueva:
        </p>
        <ul>
          <li><strong>ITP (Impuesto de Transmisiones Patrimoniales), en la vivienda usada</strong>: {RANGO_ITP} según la comunidad autónoma y, en las que tienen escala progresiva, según el precio.</li>
          <li><strong>IVA ({IVA_OBRA_NUEVA}), en la vivienda nueva</strong>: en lugar del ITP (en Canarias, Ceuta y Melilla rigen el IGIC o el IPSI).</li>
          <li><strong>AJD (Actos Jurídicos Documentados), en la vivienda nueva</strong>: {RANGO_AJD} sobre la escritura, según la comunidad. En la usada no se paga aparte.</li>
          <li><strong>Notaría y registro</strong>: aranceles regulados que crecen con el precio; ya están incluidos en los porcentajes de arriba.</li>
          <li><strong>Gestoría y tasación</strong>: aparte, si se contratan o las pide el banco.</li>
        </ul>

        <div className={styles.warningBox}>
          <strong>Nota importante:</strong> Las características del mercado inmobiliario varían enormemente por ciudad y zona. Este selector analiza el tipo de vivienda, no la ubicación. Complementa este análisis con el <strong>Selector de Zona de Residencia</strong> para una visión completa de dónde y cómo quieres vivir.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-tipo-vivienda')} />
      <ShareCard appName="selector-tipo-vivienda" />
      <Footer appName="selector-tipo-vivienda" />
    </div>
  );
}
