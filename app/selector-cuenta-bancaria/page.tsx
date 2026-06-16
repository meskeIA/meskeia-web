'use client';

import { useState } from 'react';
import styles from './SelectorCuentaBancaria.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

/* ============================================================
   Tipos
   ============================================================ */

type TipoCuenta = 'corriente' | 'nomina' | 'joven' | 'ahorro' | 'sin_cambio';

interface Opcion {
  texto: string;
  icono: string;
  pesos: Partial<Record<TipoCuenta, number>>;
}

interface Pregunta {
  id: number;
  texto: string;
  opciones: Opcion[];
}

/* ============================================================
   Datos: preguntas + pesos
   ============================================================ */

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuántos años tienes?',
    opciones: [
      {
        texto: 'Menos de 30 años',
        icono: '🧑',
        pesos: { joven: 3 },
      },
      {
        texto: '30 años o más',
        icono: '👤',
        pesos: { corriente: 1, nomina: 1, ahorro: 1 },
      },
    ],
  },
  {
    id: 2,
    texto: '¿Cobras una nómina, pensión u otro ingreso regular domiciliado en tu cuenta?',
    opciones: [
      {
        texto: 'Sí, tengo ingresos regulares domiciliados',
        icono: '💼',
        pesos: { nomina: 3 },
      },
      {
        texto: 'No, o mis ingresos son irregulares',
        icono: '🔀',
        pesos: { corriente: 2, ahorro: 1 },
      },
    ],
  },
  {
    id: 3,
    texto: '¿Tienes ahorros que quieres rentabilizar sin asumir riesgo?',
    opciones: [
      {
        texto: 'Sí, quiero que mi dinero genere intereses',
        icono: '📈',
        pesos: { ahorro: 3 },
      },
      {
        texto: 'No, el dinero lo uso para el día a día',
        icono: '🛒',
        pesos: { corriente: 2, nomina: 1 },
      },
    ],
  },
  {
    id: 4,
    texto: '¿Pagas comisiones de mantenimiento o administración en tu cuenta actual?',
    opciones: [
      {
        texto: 'Sí, pago comisiones y me molesta',
        icono: '😤',
        pesos: { nomina: 2, joven: 2, corriente: 1 },
      },
      {
        texto: 'No tengo comisiones',
        icono: '✅',
        pesos: { sin_cambio: 3 },
      },
    ],
  },
  {
    id: 5,
    texto: '¿Con qué frecuencia usas tu cuenta bancaria?',
    opciones: [
      {
        texto: 'A diario: compras, transferencias, recibos…',
        icono: '📱',
        pesos: { corriente: 2, nomina: 2 },
      },
      {
        texto: 'Ocasionalmente, sobre todo para guardar dinero',
        icono: '🏦',
        pesos: { ahorro: 3 },
      },
    ],
  },
  {
    id: 6,
    texto: '¿Prefieres operar de forma digital o te importa tener oficina física cerca?',
    opciones: [
      {
        texto: 'Totalmente digital, no necesito oficina',
        icono: '💻',
        pesos: { corriente: 1, nomina: 1, joven: 2, ahorro: 1 },
      },
      {
        texto: 'Prefiero tener oficina o cajero propio cerca',
        icono: '🏢',
        pesos: { corriente: 2, nomina: 2 },
      },
    ],
  },
  {
    id: 7,
    texto: '¿Necesitas una tarjeta de crédito incluida sin coste adicional?',
    opciones: [
      {
        texto: 'Sí, me interesa tener tarjeta de crédito gratuita',
        icono: '💳',
        pesos: { nomina: 2, joven: 2 },
      },
      {
        texto: 'No, con tarjeta de débito me basta',
        icono: '🪙',
        pesos: { corriente: 1, ahorro: 1 },
      },
    ],
  },
  {
    id: 8,
    texto: '¿Viajas al extranjero con frecuencia y necesitas evitar comisiones en divisas?',
    opciones: [
      {
        texto: 'Sí, viajo habitualmente fuera de España',
        icono: '✈️',
        pesos: { joven: 2, corriente: 1 },
      },
      {
        texto: 'No, raramente salgo de España',
        icono: '🇪🇸',
        pesos: { sin_cambio: 1, nomina: 1 },
      },
    ],
  },
  {
    id: 9,
    texto: '¿Eres autónomo o trabajas por cuenta propia con ingresos variables?',
    opciones: [
      {
        texto: 'Sí, soy autónomo o tengo ingresos irregulares',
        icono: '🧾',
        pesos: { corriente: 3 },
      },
      {
        texto: 'No, tengo ingresos por cuenta ajena o fijos',
        icono: '📋',
        pesos: { nomina: 2 },
      },
    ],
  },
  {
    id: 10,
    texto: '¿Tu cuenta actual cumple bien tus necesidades cotidianas?',
    opciones: [
      {
        texto: 'Sí, estoy satisfecho con mi cuenta actual',
        icono: '😊',
        pesos: { sin_cambio: 4 },
      },
      {
        texto: 'No, me gustaría mejorar mis condiciones',
        icono: '🔄',
        pesos: { corriente: 1, nomina: 1, joven: 1, ahorro: 1 },
      },
    ],
  },
];

/* ============================================================
   Resultado por tipo de cuenta
   ============================================================ */

interface InfoResultado {
  emoji: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  consejos: string[];
}

const RESULTADOS: Record<TipoCuenta, InfoResultado> = {
  corriente: {
    emoji: '🏦',
    titulo: 'Cuenta Corriente Estándar',
    subtitulo: 'La opción versátil para el día a día sin ataduras',
    descripcion:
      'Una cuenta corriente estándar es ideal para ti: gestionas tus pagos, domiciliaciones y transferencias sin necesidad de domiciliar una nómina ni cumplir requisitos especiales. Muchos bancos ofrecen cuentas sin comisiones con uso digital. Ideal si eres autónomo, tienes ingresos variables o simplemente no quieres compromisos.',
    consejos: [
      'Busca cuentas sin comisiones de mantenimiento (existen en la mayoría de bancos digitales).',
      'Compara la red de cajeros gratuitos si usas efectivo habitualmente.',
      'Revisa si incluye seguro de compras o descuentos en servicios.',
      'Valora una cuenta en un banco online: suelen tener mejores condiciones sin requisitos.',
    ],
  },
  nomina: {
    emoji: '💼',
    titulo: 'Cuenta Nómina',
    subtitulo: 'Bonificaciones y sin comisiones a cambio de tus ingresos',
    descripcion:
      'Con ingresos regulares domiciliados tienes acceso a las mejores condiciones del mercado: cero comisiones, tarjeta de crédito gratuita, descuentos en seguros y hasta bonificaciones por usar la tarjeta. La cuenta nómina premia tu fidelidad con beneficios tangibles cada mes.',
    consejos: [
      'Compara el importe mínimo de nómina exigido (suele ser 600 €–1.000 € según banco).',
      'Fíjate en la bonificación por uso de tarjeta (algunos devuelven hasta un 3% en compras).',
      'Valora si el banco ofrece acceso a hipotecas o préstamos personales con condiciones preferentes.',
      'Atención a los requisitos: algunos exigen X recibos domiciliados o saldo mínimo.',
    ],
  },
  joven: {
    emoji: '🧑‍🎓',
    titulo: 'Cuenta Joven',
    subtitulo: 'Ventajas exclusivas para menores de 30 años',
    descripcion:
      'Las cuentas joven están diseñadas para ti: sin comisiones, tarjeta gratuita, acceso a descuentos en ocio, viajes y cultura, y en muchos casos sin necesidad de domiciliar nómina. Son el punto de entrada ideal al sistema bancario y te permiten ahorrar mientras construyes tu historial financiero.',
    consejos: [
      'Compara los descuentos y ventajas en ocio, viajes y compras online que ofrece cada banco.',
      'Muchas cuentas joven permiten ahorros con tipos de interés más altos que las cuentas normales.',
      'Asegúrate de revisar hasta qué edad aplica (normalmente hasta los 25–30 años).',
      'Valora si incluye cobertura de seguro de accidentes o asistencia en viaje.',
    ],
  },
  ahorro: {
    emoji: '💰',
    titulo: 'Cuenta de Ahorro Remunerada',
    subtitulo: 'Rentabiliza el dinero que no necesitas en el día a día',
    descripcion:
      'Tu perfil encaja con una cuenta de ahorro remunerada: apartas una parte del dinero, este genera intereses y tú no lo tocas para gastos corrientes. Es la opción más segura para hacer crecer tus ahorros sin asumir el riesgo de la bolsa. Complementa perfectamente una cuenta corriente para operativa diaria.',
    consejos: [
      'Compara la TAE (Tasa Anual Equivalente) y no solo el TIN; determina el rendimiento real.',
      'Revisa los plazos de liquidez: algunas cuentas penalizan la retirada anticipada.',
      'Considera combinarla con una cuenta corriente en el mismo banco para facilitar transferencias.',
      'Recuerda que los intereses tributan como rendimiento de capital mobiliario en el IRPF.',
    ],
  },
  sin_cambio: {
    emoji: '✅',
    titulo: 'Mantener tu Cuenta Actual',
    subtitulo: 'Si funciona bien, cambiar puede no merecer la pena',
    descripcion:
      'Según tus respuestas, tu cuenta actual parece cubrir bien tus necesidades. Cambiar de banco conlleva tiempo (actualizar domiciliaciones, datos bancarios en empresas y plataformas) y no siempre compensa el esfuerzo. Sin embargo, es recomendable revisar las condiciones cada 1–2 años para asegurarte de que sigues en la mejor opción.',
    consejos: [
      'Revisa anualmente si hay cuentas con mejores condiciones para tu perfil actual.',
      'Negocia con tu banco actual: muchos ofrecen mejoras de condiciones a clientes que amenazan con irse.',
      'Ojo con los cambios de vida (nómina nueva, más ahorros): pueden hacerte elegible para mejores cuentas.',
      'Compara comparadores como HelpMyCash o iAhorro para mantenerte informado del mercado.',
    ],
  },
};

/* ============================================================
   Función de cálculo de resultado
   ============================================================ */

function calcularResultado(respuestas: (number | null)[]): TipoCuenta {
  const totales: Record<TipoCuenta, number> = {
    corriente: 0,
    nomina: 0,
    joven: 0,
    ahorro: 0,
    sin_cambio: 0,
  };

  respuestas.forEach((idxOpcion, idxPregunta) => {
    if (idxOpcion === null) return;
    const pregunta = PREGUNTAS[idxPregunta];
    const opcion = pregunta.opciones[idxOpcion];
    (Object.entries(opcion.pesos) as [TipoCuenta, number][]).forEach(([tipo, peso]) => {
      totales[tipo] += peso;
    });
  });

  return (Object.entries(totales) as [TipoCuenta, number][]).reduce(
    (max, [tipo, val]) => (val > totales[max] ? tipo : max),
    'corriente' as TipoCuenta
  );
}

/* ============================================================
   Componente principal
   ============================================================ */

export default function SelectorCuentaBancariaPage() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(
    Array(PREGUNTAS.length).fill(null)
  );
  const [resultado, setResultado] = useState<TipoCuenta | null>(null);

  const opcionSeleccionada = respuestas[preguntaActual];
  const totalPreguntas = PREGUNTAS.length;
  const progresoPct = Math.round(((preguntaActual + (opcionSeleccionada !== null ? 1 : 0)) / totalPreguntas) * 100);

  const seleccionarOpcion = (idx: number) => {
    const nuevas = [...respuestas];
    nuevas[preguntaActual] = idx;
    setRespuestas(nuevas);
  };

  const irAnterior = () => {
    if (preguntaActual > 0) setPreguntaActual(preguntaActual - 1);
  };

  const irSiguiente = () => {
    if (opcionSeleccionada === null) return;
    if (preguntaActual < totalPreguntas - 1) {
      setPreguntaActual(preguntaActual + 1);
    } else {
      setResultado(calcularResultado(respuestas));
    }
  };

  const reiniciar = () => {
    setPreguntaActual(0);
    setRespuestas(Array(PREGUNTAS.length).fill(null));
    setResultado(null);
  };

  const esUltimaPregunta = preguntaActual === totalPreguntas - 1;
  const info = resultado ? RESULTADOS[resultado] : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1><span aria-hidden="true">🏦</span> Selector de Cuenta Bancaria</h1>
        <p>Responde 10 preguntas y descubre qué tipo de cuenta bancaria se adapta mejor a tu situación</p>
      </header>

      <LegalNotice />

      {/* ---- Test o Resultado ---- */}
      {!resultado ? (
        <section className={styles.quiz} aria-label="Test de selección de cuenta bancaria">
          {/* Barra de progreso */}
          <div className={styles.progreso} role="progressbar" aria-valuenow={progresoPct} aria-valuemin={0} aria-valuemax={100}>
            <div className={styles.progresoTexto}>
              <span>Pregunta {preguntaActual + 1} de {totalPreguntas}</span>
              <span>{progresoPct}% completado</span>
            </div>
            <div className={styles.progresoBar}>
              <div className={styles.progresoFill} style={{ width: `${progresoPct}%` }} />
            </div>
          </div>

          {/* Pregunta */}
          <div className={styles.pregunta}>
            <p className={styles.preguntaTitulo}>
              {PREGUNTAS[preguntaActual].texto}
            </p>
            <div className={styles.opciones} role="group" aria-label="Opciones de respuesta">
              {PREGUNTAS[preguntaActual].opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.opcion} ${opcionSeleccionada === idx ? styles.seleccionada : ''}`}
                  onClick={() => seleccionarOpcion(idx)}
                  aria-pressed={opcionSeleccionada === idx}
                >
                  <span className={styles.opcionIcono} aria-hidden="true">{opcion.icono}</span>
                  <span>{opcion.texto}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navegación */}
          <nav className={styles.navQuiz} aria-label="Navegación del test">
            <button
              type="button"
              className={styles.btnSecundario}
              onClick={irAnterior}
              disabled={preguntaActual === 0}
              aria-label="Ir a la pregunta anterior"
            >
              ← Anterior
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={irSiguiente}
              disabled={opcionSeleccionada === null}
              aria-label={esUltimaPregunta ? 'Ver mi resultado' : 'Ir a la siguiente pregunta'}
            >
              {esUltimaPregunta ? 'Ver mi resultado →' : 'Siguiente →'}
            </button>
          </nav>
        </section>
      ) : (
        info && (
          <section className={styles.resultado} aria-label="Resultado del selector de cuenta bancaria" aria-live="polite">
            <div className={styles.resultadoCard}>
              <span className={styles.resultadoEmoji} aria-hidden="true">{info.emoji}</span>
              <h2 className={styles.resultadoTitulo}>{info.titulo}</h2>
              <p className={styles.resultadoSubtitulo}>{info.subtitulo}</p>
              <div className={styles.resultadoDescripcion}>
                <p>{info.descripcion}</p>
              </div>
              <div className={styles.resultadoConsejos}>
                <h3>Consejos para elegir bien:</h3>
                <ul>
                  {info.consejos.map((consejo, i) => (
                    <li key={i}>{consejo}</li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              type="button"
              className={styles.btnReiniciar}
              onClick={reiniciar}
              aria-label="Repetir el test desde el principio"
            >
              <span aria-hidden="true">🔄</span> Repetir el test
            </button>
          </section>
        )
      )}

      {/* Disclaimer */}
      <DisclaimerCard variant="financial" severity="high" />

      {/* Sección educativa */}
      <EducationalSection
        title="Tipos de cuenta bancaria en España"
        subtitle="Elige la que mejor se adapta a tu situación"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué diferencia a cada tipo de cuenta?</h2>
          <p>
            En España existen varios tipos de cuentas bancarias pensadas para perfiles distintos. Conocer sus características te ayuda a evitar comisiones innecesarias y sacar más partido a tu dinero.
          </p>

          <div className={styles.comparativaGrid}>
            <div className={styles.comparativaItem}>
              <h4><span aria-hidden="true">🏦</span> Cuenta corriente</h4>
              <p>Operativa diaria sin requisitos especiales. Ideal para autónomos y quienes no quieren compromisos.</p>
            </div>
            <div className={styles.comparativaItem}>
              <h4><span aria-hidden="true">💼</span> Cuenta nómina</h4>
              <p>Requiere domiciliar ingresos regulares. A cambio: sin comisiones, tarjeta gratuita y bonificaciones.</p>
            </div>
            <div className={styles.comparativaItem}>
              <h4><span aria-hidden="true">🧑‍🎓</span> Cuenta joven</h4>
              <p>Para menores de 25–30 años. Sin comisiones, ventajas en ocio y a veces mayor remuneración del ahorro.</p>
            </div>
            <div className={styles.comparativaItem}>
              <h4><span aria-hidden="true">💰</span> Cuenta de ahorro</h4>
              <p>Diseñada para apartar dinero y generar intereses. No apta como cuenta operativa principal.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Comisiones habituales a vigilar</h2>
          <ul>
            <li><strong>Mantenimiento y administración:</strong> las más frecuentes; muchos bancos las eliminan con ciertos requisitos.</li>
            <li><strong>Cajeros ajenos:</strong> entre 1 € y 2 € por reintegro en cajeros de otras entidades.</li>
            <li><strong>Transferencias internacionales:</strong> pueden llegar al 0,5%–1% del importe enviado.</li>
            <li><strong>Descubierto:</strong> tipo de interés muy elevado (a veces superior al 20% TAE).</li>
            <li><strong>Tarjeta de crédito:</strong> cuota anual de 20 € a 60 € si no está bonificada por nómina.</li>
          </ul>
        </section>

        <section className={styles.guideSection}>
          <h2>Cuenta nómina vs. cuenta corriente sin requisitos</h2>
          <p>
            La principal diferencia está en los compromisos adquiridos. Una cuenta nómina ofrece mayores beneficios, pero si pierdes el empleo o cambias de banco, puede pasar a cobrar comisiones automáticamente. Una cuenta corriente sin requisitos no cambia de condiciones aunque varíe tu situación laboral.
          </p>
          <p>
            Para ingresos irregulares (autónomos, freelances, trabajos eventuales), la cuenta corriente estándar suele ser más adecuada.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Cómo cambiar de banco en España</h2>
          <ul>
            <li>El proceso de cambio puede hacerse en 1–2 semanas con la Ley de Servicios de Pago.</li>
            <li>El nuevo banco puede gestionar el traslado de domiciliaciones si lo solicitas.</li>
            <li>No olvides actualizar tus datos bancarios en la Seguridad Social, Hacienda y plataformas de pago.</li>
            <li>Mantén la cuenta antigua abierta unos meses para recibir cargos rezagados.</li>
          </ul>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <h3>¿Puedo tener varias cuentas a la vez?</h3>
          <p>
            Sí. Es habitual combinar una cuenta corriente para gastos del día a día con una cuenta de ahorro para reservas. No existe límite legal en España para el número de cuentas bancarias.
          </p>
          <h3>¿Cuánto tardan en abrirse una cuenta online?</h3>
          <p>
            Los bancos digitales (Revolut, Wise, N26, MyInvestor…) suelen activar la cuenta en minutos tras verificar tu identidad con el DNI o pasaporte. Los bancos tradicionales pueden tardar 1–3 días hábiles.
          </p>
          <h3>¿Los intereses de las cuentas de ahorro tributan?</h3>
          <p>
            Sí. Se consideran rendimientos de capital mobiliario y tributan en el IRPF al tipo del ahorro: 19% hasta 6.000 €, 21% entre 6.000 € y 50.000 €, 23% entre 50.000 € y 200.000 €, y 27% a partir de 200.000 €.
          </p>

          <div className={styles.warningBox}>
            <strong>Aviso:</strong> Las condiciones bancarias (tipos de interés, comisiones, requisitos) cambian con frecuencia. Consulta siempre la información actualizada en el folleto informativo del banco antes de contratar.
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-cuenta-bancaria')} />
      <ShareCard appName="selector-cuenta-bancaria" />
      <Footer appName="selector-cuenta-bancaria" />
    </div>
  );
}
