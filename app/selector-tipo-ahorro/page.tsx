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
import styles from './SelectorTipoAhorro.module.css';

// ============================================================
// Tipos
// ============================================================

type RecomendacionKey = 'cuenta' | 'deposito' | 'indexado' | 'combinacion';

interface Opcion {
  texto: string;
  pesos: Partial<Record<RecomendacionKey, number>>;
}

interface Pregunta {
  id: number;
  texto: string;
  opciones: Opcion[];
}

interface Recomendacion {
  key: RecomendacionKey;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  ventajas: string[];
  fiscalidad: string;
  consejos: string[];
}

// ============================================================
// Datos: 10 preguntas con sistema de pesos
// ============================================================

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuándo podrías necesitar acceder a este dinero?',
    opciones: [
      { texto: 'En cualquier momento, es mi colchón de emergencia', pesos: { cuenta: 5 } },
      { texto: 'En menos de 1 año', pesos: { cuenta: 3, deposito: 2 } },
      { texto: 'En 1-3 años', pesos: { deposito: 3, combinacion: 2 } },
      { texto: 'En más de 5 años', pesos: { indexado: 4, combinacion: 3 } },
    ],
  },
  {
    id: 2,
    texto: '¿Cuál es tu principal objetivo con este ahorro?',
    opciones: [
      { texto: 'Mantener el poder adquisitivo sin riesgo', pesos: { deposito: 3, cuenta: 2 } },
      { texto: 'Hacer crecer el capital a largo plazo', pesos: { indexado: 4 } },
      { texto: 'Tener un colchón de seguridad', pesos: { cuenta: 4 } },
      { texto: 'Combinar seguridad y crecimiento', pesos: { combinacion: 4 } },
    ],
  },
  {
    id: 3,
    texto: '¿Cómo reaccionarías si tu ahorro bajara un 20% temporalmente?',
    opciones: [
      { texto: 'Me quitaría el sueño, no lo toleraría', pesos: { cuenta: 4, deposito: 3 } },
      { texto: 'Me preocuparía pero aguantaría', pesos: { combinacion: 3, deposito: 2 } },
      { texto: 'Lo vería como una oportunidad de compra', pesos: { indexado: 4 } },
    ],
  },
  {
    id: 4,
    texto: '¿Cuánto tienes ahorrado o piensas ahorrar en este producto?',
    opciones: [
      { texto: 'Menos de 5.000 €', pesos: { cuenta: 3 } },
      { texto: 'Entre 5.000 € y 20.000 €', pesos: { deposito: 3, cuenta: 2 } },
      { texto: 'Entre 20.000 € y 50.000 €', pesos: { combinacion: 3, indexado: 2 } },
      { texto: 'Más de 50.000 €', pesos: { indexado: 3, combinacion: 3 } },
    ],
  },
  {
    id: 5,
    texto: '¿Tienes ya un fondo de emergencia cubierto (3-6 meses de gastos)?',
    opciones: [
      { texto: 'No, este dinero es mi fondo de emergencia', pesos: { cuenta: 5 } },
      { texto: 'Tengo algo pero incompleto', pesos: { cuenta: 2, deposito: 2 } },
      { texto: 'Sí, este dinero es adicional al fondo', pesos: { indexado: 3, combinacion: 3 } },
    ],
  },
  {
    id: 6,
    texto: '¿Cuánta experiencia tienes con productos financieros?',
    opciones: [
      { texto: 'Ninguna, soy principiante completo', pesos: { cuenta: 3, deposito: 3 } },
      { texto: 'Conozco lo básico', pesos: { deposito: 2, combinacion: 2 } },
      { texto: 'Tengo experiencia con fondos o bolsa', pesos: { indexado: 3, combinacion: 2 } },
    ],
  },
  {
    id: 7,
    texto: '¿Cuánto tiempo puedes dedicar a gestionar tus ahorros?',
    opciones: [
      { texto: 'Nada, quiero algo automático y sin gestión', pesos: { cuenta: 3, deposito: 2, indexado: 2 } },
      { texto: 'Un par de horas al año', pesos: { indexado: 3, combinacion: 2 } },
      { texto: 'Puedo revisar y ajustar regularmente', pesos: { combinacion: 3 } },
    ],
  },
  {
    id: 8,
    texto: '¿Estás en un tramo alto de IRPF?',
    opciones: [
      { texto: 'Sí, pago mucho en impuestos', pesos: { indexado: 2, combinacion: 2 } },
      { texto: 'Tramo medio', pesos: { combinacion: 2, deposito: 1 } },
      { texto: 'Tramo bajo o no lo sé', pesos: { cuenta: 1, deposito: 2 } },
    ],
  },
  {
    id: 9,
    texto: '¿Cuál es tu situación financiera actual?',
    opciones: [
      { texto: 'Con deudas o gastos variables importantes', pesos: { cuenta: 4 } },
      { texto: 'Estable pero con alguna incertidumbre', pesos: { cuenta: 2, deposito: 2 } },
      { texto: 'Estable y sin compromisos grandes', pesos: { indexado: 3, combinacion: 3 } },
    ],
  },
  {
    id: 10,
    texto: '¿Has tenido malas experiencias con productos de inversión antes?',
    opciones: [
      { texto: 'Sí, perdí dinero y no quiero repetir', pesos: { cuenta: 4, deposito: 3 } },
      { texto: 'Sin experiencia previa', pesos: { deposito: 2, cuenta: 2 } },
      { texto: 'No, tengo buena perspectiva de la inversión', pesos: { indexado: 3, combinacion: 3 } },
    ],
  },
];

// ============================================================
// Datos: recomendaciones por tipo
// ============================================================

const RECOMENDACIONES: Record<RecomendacionKey, Recomendacion> = {
  cuenta: {
    key: 'cuenta',
    titulo: 'Cuenta Remunerada',
    subtitulo: 'Liquidez total con rentabilidad garantizada',
    descripcion:
      'Una cuenta remunerada es el vehículo ideal para tu situación. Ofrece acceso inmediato al dinero sin penalizaciones, rentabilidad garantizada aunque moderada, y está cubierta por el Fondo de Garantía de Depósitos hasta 100.000 € por titular. Perfecta como colchón de emergencia o para ahorros que puedas necesitar pronto.',
    ventajas: [
      'Liquidez total: dispones del dinero en cualquier momento',
      'Rentabilidad garantizada, sin sorpresas',
      'Cobertura FGD hasta 100.000 € por titular y entidad',
      'Sin plazo mínimo ni penalización por retirada',
      'Gestión sencilla, sin conocimientos previos necesarios',
    ],
    fiscalidad:
      'Los intereses tributan como rendimientos del capital mobiliario en el IRPF: 19% hasta 6.000 €, 21% entre 6.000 € y 50.000 €, 23% entre 50.000 € y 200.000 €, 27% entre 200.000 € y 300.000 €, y 28% a partir de 300.000 €. La entidad practica retención del 19% en origen.',
    consejos: [
      'Mantén entre 3 y 6 meses de gastos como fondo de emergencia',
      'Compara las condiciones: algunas cuentas exigen domiciliar nómina o recibos',
      'Revisa que el saldo esté cubierto por el FGD (límite por titular y entidad)',
      'Una vez cubierto el fondo de emergencia, valora diversificar el exceso en depósito o fondo indexado',
    ],
  },
  deposito: {
    key: 'deposito',
    titulo: 'Depósito a Plazo Fijo',
    subtitulo: 'Rentabilidad garantizada sin riesgo de mercado',
    descripcion:
      'Un depósito a plazo fijo es tu mejor opción. Ofrece una rentabilidad superior a la cuenta remunerada, completamente garantizada durante el plazo contratado. Ideal para dinero que no necesitas tocar en los próximos 6 a 24 meses. Cubierto por el Fondo de Garantía de Depósitos hasta 100.000 € por titular.',
    ventajas: [
      'Rentabilidad superior a la cuenta remunerada',
      'Capital e intereses 100% garantizados al vencimiento',
      'Cobertura FGD hasta 100.000 € por titular y entidad',
      'Sin fluctuaciones: sabes exactamente cuánto ganarás',
      'Sin conocimientos financieros previos necesarios',
    ],
    fiscalidad:
      'Los intereses tributan como rendimientos del capital mobiliario en el IRPF: 19% hasta 6.000 €, 21% entre 6.000 € y 50.000 €, 23% entre 50.000 € y 200.000 €, 27% entre 200.000 € y 300.000 €, y 28% a partir de 300.000 €. La retención es del 19% en origen. Los intereses tributan en el año en que se cobran.',
    consejos: [
      'Contrata el plazo que realmente puedas cumplir: la cancelación anticipada suele implicar penalización',
      'Asegúrate de que el saldo está dentro del límite FGD de 100.000 €',
      'Si tienes importes superiores, distribúyelos entre varias entidades',
      'Combínalo con una cuenta remunerada para el fondo de emergencia: lo mejor de los dos mundos',
    ],
  },
  indexado: {
    key: 'indexado',
    titulo: 'Fondo de Inversión Indexado',
    subtitulo: 'Máximo potencial a largo plazo con bajas comisiones',
    descripcion:
      'Un fondo de inversión indexado (también llamado fondo pasivo) es la opción más adecuada para tu perfil. Replica índices bursátiles globales como el MSCI World, ofrece diversificación automática en miles de empresas y tiene comisiones muy bajas. Históricamente supera a la mayoría de fondos activos a largo plazo. Solo adecuado si tienes horizonte de 5 o más años y puedes tolerar fluctuaciones.',
    ventajas: [
      'Máximo potencial de crecimiento a largo plazo',
      'Diversificación global automática: miles de empresas',
      'Comisiones muy bajas (fondos indexados)',
      'Tributación diferida hasta el reembolso (ventaja fiscal importante)',
      'Traspaso entre fondos sin tributar (en España)',
    ],
    fiscalidad:
      'Los fondos de inversión tienen una ventaja fiscal clave: no tributas hasta que reembolsas (vendes). Las ganancias tributan como capital mobiliario: 19% hasta 6.000 €, 21% entre 6.000 € y 50.000 €, 23% entre 50.000 € y 200.000 €, 27% entre 200.000 € y 300.000 €, y 28% a partir de 300.000 €. Además, puedes traspasar entre fondos sin tributar, difiriendo el pago.',
    consejos: [
      'Asegúrate de tener el fondo de emergencia cubierto ANTES de invertir en fondos indexados',
      'Invierte solo dinero que no vayas a necesitar en los próximos 5-10 años',
      'Mantén el rumbo en las caídas: vender en mínimos es el error más común',
      'Aporta de forma periódica (dollar-cost averaging) para reducir el riesgo de timing',
      'Diversifica en índices globales, no solo en el mercado español',
    ],
  },
  combinacion: {
    key: 'combinacion',
    titulo: 'Combinación de Vehículos',
    subtitulo: 'La estrategia más equilibrada para diferentes horizontes',
    descripcion:
      'Tu perfil apunta a una estrategia combinada: parte del dinero en una cuenta remunerada o depósito para la liquidez y seguridad, y el resto en un fondo indexado para el crecimiento a largo plazo. Esta diversificación entre vehículos de ahorro es la más adecuada cuando tienes objetivos con diferentes horizontes temporales y un perfil mixto.',
    ventajas: [
      'Cubre tanto la liquidez inmediata como el crecimiento a largo plazo',
      'Reduce el riesgo total al diversificar entre vehículos',
      'Aprovecha las ventajas fiscales del fondo indexado',
      'Mantiene la seguridad del FGD para la parte conservadora',
      'Adaptable a tu situación: puedes ajustar los porcentajes',
    ],
    fiscalidad:
      'La parte en cuenta o depósito tributa cada año como capital mobiliario (19-28%). La parte en fondo indexado tributa solo al reembolsar, con la ventaja de poder diferir y traspasar sin peaje fiscal. La combinación puede optimizar la carga fiscal según tu tramo de IRPF y horizonte temporal.',
    consejos: [
      'Regla orientativa: colchón de emergencia (3-6 meses) en cuenta; dinero a 1-3 años en depósito; horizonte >5 años en fondo indexado',
      'Revisa la distribución anualmente y ajusta según cambien tus circunstancias',
      'No inviertas en fondos dinero que puedas necesitar en menos de 5 años',
      'La parte en fondo puede crecer con aportaciones periódicas mensuales',
    ],
  },
};

// ============================================================
// Componente principal
// ============================================================

export default function SelectorTipoAhorro() {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [preguntaActual, setPreguntaActual] = useState<number>(0);
  const [mostrarResultado, setMostrarResultado] = useState<boolean>(false);

  const totalPreguntas = PREGUNTAS.length;
  const pregunta = PREGUNTAS[preguntaActual];
  const respuestaSeleccionada = respuestas[preguntaActual];
  const esUltimaPregunta = preguntaActual === totalPreguntas - 1;
  const progresoPorc = ((preguntaActual + 1) / totalPreguntas) * 100;

  // Calcula puntuaciones acumuladas
  function calcularResultado(): RecomendacionKey {
    const puntuaciones: Record<RecomendacionKey, number> = {
      cuenta: 0,
      deposito: 0,
      indexado: 0,
      combinacion: 0,
    };

    PREGUNTAS.forEach((p, idx) => {
      const respIdx = respuestas[idx];
      if (respIdx !== undefined) {
        const opcion = p.opciones[respIdx];
        if (opcion) {
          (Object.keys(opcion.pesos) as RecomendacionKey[]).forEach((key) => {
            puntuaciones[key] += opcion.pesos[key] ?? 0;
          });
        }
      }
    });

    let mejor: RecomendacionKey = 'cuenta';
    let maxPuntos = -1;
    (Object.keys(puntuaciones) as RecomendacionKey[]).forEach((key) => {
      if (puntuaciones[key] > maxPuntos) {
        maxPuntos = puntuaciones[key];
        mejor = key;
      }
    });

    return mejor;
  }

  function seleccionarOpcion(opcionIdx: number) {
    setRespuestas((prev) => ({ ...prev, [preguntaActual]: opcionIdx }));
  }

  function irAnterior() {
    if (preguntaActual > 0) {
      setPreguntaActual((prev) => prev - 1);
    }
  }

  function irSiguiente() {
    if (preguntaActual < totalPreguntas - 1) {
      setPreguntaActual((prev) => prev + 1);
    }
  }

  function verResultado() {
    setMostrarResultado(true);
    setTimeout(() => {
      document.getElementById('resultado-ahorro')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function reiniciar() {
    setRespuestas({});
    setPreguntaActual(0);
    setMostrarResultado(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const recomendacionKey = mostrarResultado ? calcularResultado() : null;
  const recomendacion = recomendacionKey ? RECOMENDACIONES[recomendacionKey] : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>¿Cuenta, depósito o fondo indexado?</h1>
        <p className={styles.heroSubtitle}>
          Test de 10 preguntas para descubrir qué vehículo de ahorro se adapta mejor a tu perfil, horizonte temporal y
          necesidades de liquidez.
        </p>
      </header>

      <div className={styles.legalNoticeWrapper}>
        <LegalNotice />
      </div>

      {/* ---- Test ---- */}
      {!mostrarResultado && (
        <section className={styles.testSection} aria-label="Test de tipo de ahorro">
          {/* Barra de progreso */}
          <div className={styles.progreso} role="progressbar" aria-valuenow={preguntaActual + 1} aria-valuemin={1} aria-valuemax={totalPreguntas}>
            <div className={styles.progresoBar}>
              <div className={styles.progresoFill} style={{ width: `${progresoPorc}%` }} />
            </div>
            <p className={styles.progresoTexto}>
              Pregunta {preguntaActual + 1} de {totalPreguntas}
            </p>
          </div>

          {/* Pregunta actual */}
          <div className={styles.pregunta}>
            <p className={styles.preguntaNumero}>Pregunta {pregunta.id} de {totalPreguntas}</p>
            <p className={styles.preguntaTexto}>{pregunta.texto}</p>

            <div className={styles.opciones} role="group" aria-label={`Opciones de la pregunta ${pregunta.id}`}>
              {pregunta.opciones.map((opcion, idx) => {
                const esSeleccionada = respuestaSeleccionada === idx;
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

              {esUltimaPregunta ? (
                <button
                  type="button"
                  className={styles.btnResultado}
                  onClick={verResultado}
                  disabled={respuestaSeleccionada === undefined}
                  aria-label="Ver el resultado del test"
                >
                  Ver resultado →
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.btnSiguiente}
                  onClick={irSiguiente}
                  disabled={respuestaSeleccionada === undefined}
                  aria-label="Ir a la siguiente pregunta"
                >
                  Siguiente →
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ---- Resultado ---- */}
      {mostrarResultado && recomendacion && (
        <section
          id="resultado-ahorro"
          className={styles.resultadoSection}
          aria-label="Resultado del test de ahorro"
          aria-live="polite"
        >
          <div className={`${styles.resultadoCard} ${styles[`recomendacion_${recomendacion.key}`]}`}>
            <p className={styles.recomendacionEtiqueta}>Tu recomendación</p>
            <h2 className={styles.recomendacionTitulo}>{recomendacion.titulo}</h2>
            <p className={styles.recomendacionSubtitulo}>{recomendacion.subtitulo}</p>
            <p className={styles.recomendacionDesc}>{recomendacion.descripcion}</p>

            {/* Ventajas */}
            <div className={styles.ventajasSection}>
              <p className={styles.seccionTitulo}>Por qué te conviene</p>
              {recomendacion.ventajas.map((v, i) => (
                <div key={i} className={styles.seccionItem}>
                  <span aria-hidden="true">✓</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>

            {/* Fiscalidad */}
            <div className={styles.fiscalidadSection}>
              <p className={styles.seccionTitulo}>Fiscalidad</p>
              <p className={styles.fiscalidadTexto}>{recomendacion.fiscalidad}</p>
            </div>

            {/* Consejos */}
            <div className={styles.consejosSection}>
              <p className={styles.seccionTitulo}>Consejos prácticos</p>
              {recomendacion.consejos.map((c, i) => (
                <div key={i} className={styles.seccionItem}>
                  <span aria-hidden="true">→</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>

            <button type="button" className={styles.btnReiniciar} onClick={reiniciar}>
              Repetir el test
            </button>
          </div>
        </section>
      )}

      {/* ---- Disclaimer (nivel ALTO, visible siempre) ---- */}
      <div className={styles.disclaimerWrapper}>
        <DisclaimerCard variant="financial" severity="high" />
      </div>

      {/* ---- Sección educativa ---- */}
      <div className={styles.educationalWrapper}>
        <EducationalSection title="Cómo elegir dónde poner tus ahorros" subtitle="Guía práctica sobre vehículos de ahorro en España">
          <h3>El primer paso: el fondo de emergencia</h3>
          <p>
            Antes de pensar en rentabilidad, necesitas tener cubierto un fondo de emergencia equivalente a 3-6 meses de
            tus gastos habituales. Este dinero debe estar en un vehículo con liquidez total —normalmente una cuenta
            remunerada— para que puedas acceder a él de inmediato sin penalizaciones. Mientras no tengas este colchón,
            no es conveniente inmovilizar dinero en depósitos a plazo ni invertirlo en fondos.
          </p>

          <h3>Comparativa de rentabilidad histórica orientativa</h3>
          <p>
            Las rentabilidades pasadas no garantizan las futuras, pero sirven como referencia orientativa:
          </p>
          <ul>
            <li>
              <strong>Cuenta remunerada:</strong> ~2-3% TAE (varía según entidad y condiciones de mercado). Sin riesgo
              de mercado, liquidez total.
            </li>
            <li>
              <strong>Depósito a plazo fijo:</strong> ~3-4% TAE (2024-2025). Capital e intereses garantizados, sin
              riesgo, con penalización si se rescata antes.
            </li>
            <li>
              <strong>Fondo indexado global (MSCI World):</strong> ~7-10% de rentabilidad media anual a largo plazo,
              históricamente. Con riesgo de mercado: puede bajar temporalmente.
            </li>
          </ul>

          <div className={styles.warningBox}>
            <strong>Aviso importante sobre fondos indexados:</strong> los fondos indexados pueden bajar
            temporalmente de forma significativa. Una caída del 30-50% es posible en una crisis económica o bursátil
            (como ocurrió en 2008-2009 o en 2020). Solo son adecuados si tienes un horizonte temporal de 5 o más años
            y no necesitas ese dinero durante ese periodo. Si retiras en el peor momento, puedes perder capital.
          </div>

          <h3>Fiscalidad comparada: cuándo pagas impuestos</h3>
          <p>
            La diferencia fiscal entre vehículos puede ser muy relevante, especialmente en tramos altos de IRPF:
          </p>
          <ul>
            <li>
              <strong>Cuentas remuneradas y depósitos:</strong> tributan cada año en que se generan los intereses,
              independientemente de si los retiras o no. La entidad practica una retención del 19% en origen.
            </li>
            <li>
              <strong>Fondos de inversión:</strong> no tributan hasta que reembolsas (vendes). Mientras el dinero
              permanece en el fondo, las ganancias no generan obligación fiscal. Además, en España puedes traspasar
              entre fondos sin tributar, difiriendo el pago indefinidamente.
            </li>
          </ul>
          <p>
            Esta diferencia hace que los fondos indexados sean especialmente ventajosos para horizontes largos y
            patrimonios en crecimiento, al permitir el efecto del interés compuesto sin roce fiscal anual.
          </p>

          <h3>Cobertura del Fondo de Garantía de Depósitos (FGD)</h3>
          <p>
            Las cuentas corrientes, cuentas de ahorro, cuentas remuneradas y depósitos a plazo en entidades bancarias
            europeas están cubiertos por el Fondo de Garantía de Depósitos hasta <strong>100.000 € por titular y por
            entidad</strong>. Si tienes más de 100.000 € en una sola entidad, la parte que supere ese límite no está
            garantizada. En ese caso, distribuye el exceso entre varias entidades para mantener la cobertura completa.
          </p>
          <p>
            Los fondos de inversión no están cubiertos por el FGD, aunque sí tienen protección propia: el patrimonio
            del fondo está segregado del balance de la gestora, lo que protege al inversor en caso de quiebra de la
            gestora.
          </p>
        </EducationalSection>
      </div>

      {/* ---- Apps relacionadas ---- */}
      <div className={styles.relatedWrapper}>
        <RelatedApps apps={getRelatedApps('selector-tipo-ahorro')} />
      </div>

      <ShareCard appName="selector-tipo-ahorro" />
      <Footer appName="selector-tipo-ahorro" />
    </div>
  );
}
