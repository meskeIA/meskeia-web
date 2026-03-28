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
import styles from './SelectorTipoVivienda.module.css';

/* ── Tipos ── */
type RecomendacionKey = 'piso' | 'casa' | 'atico' | 'estudio' | 'compartido';

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
  consideraciones: string[];
}

/* ── Preguntas del test ── */
const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuántas personas vivirán en la vivienda?',
    opciones: [
      { texto: 'Solo yo', pesos: { estudio: 4, compartido: 2 } },
      { texto: 'Pareja sin hijos', pesos: { piso: 3, estudio: 2, atico: 2 } },
      { texto: 'Familia con 1-2 hijos', pesos: { piso: 4, casa: 3 } },
      { texto: 'Familia numerosa (3 o más hijos)', pesos: { casa: 5, piso: 2 } },
      { texto: 'Temporalmente solo, preveo cambios', pesos: { piso: 2, compartido: 2 } },
    ],
  },
  {
    id: 2,
    texto: '¿Cuál es tu presupuesto para la vivienda (compra o alquiler mensual)?',
    opciones: [
      { texto: 'Muy ajustado', pesos: { compartido: 4, estudio: 3 } },
      { texto: 'Moderado', pesos: { estudio: 3, piso: 2 } },
      { texto: 'Estándar', pesos: { piso: 4 } },
      { texto: 'Amplio', pesos: { atico: 3, piso: 2, casa: 2 } },
      { texto: 'Alto, puedo elegir libremente', pesos: { casa: 3, atico: 3 } },
    ],
  },
  {
    id: 3,
    texto: '¿Cuánto espacio exterior (jardín, terraza, patio) necesitas?',
    opciones: [
      { texto: 'No me importa, no lo usaría', pesos: { estudio: 2, piso: 2 } },
      { texto: 'Una pequeña terraza me bastaría', pesos: { piso: 2, atico: 2 } },
      { texto: 'Terraza amplia o ático', pesos: { atico: 4 } },
      { texto: 'Jardín propio es importante', pesos: { casa: 4 } },
      { texto: 'Jardín grande es imprescindible', pesos: { casa: 5 } },
    ],
  },
  {
    id: 4,
    texto: '¿Dónde prefieres que esté ubicada tu vivienda?',
    opciones: [
      { texto: 'Centro de ciudad, máxima accesibilidad', pesos: { estudio: 3, piso: 3, compartido: 2 } },
      { texto: 'Barrio residencial urbano', pesos: { piso: 4, atico: 2 } },
      { texto: 'Periferia con buena comunicación', pesos: { piso: 3, casa: 2 } },
      { texto: 'Extrarradio o zona semirural', pesos: { casa: 4 } },
      { texto: 'No me importa, lo decido según precio', pesos: { estudio: 2, piso: 2 } },
    ],
  },
  {
    id: 5,
    texto: '¿Tienes o planeas tener mascotas?',
    opciones: [
      { texto: 'No, y no planeo tenerlas', pesos: { estudio: 2, compartido: 2 } },
      { texto: 'Sí, animal pequeño', pesos: { piso: 2 } },
      { texto: 'Sí, perro mediano o grande', pesos: { piso: 2, casa: 3, atico: 2 } },
      { texto: 'Varios animales o animales grandes', pesos: { casa: 4 } },
    ],
  },
  {
    id: 6,
    texto: '¿Cuánta privacidad y tranquilidad necesitas en casa?',
    opciones: [
      { texto: 'Máxima, el ruido me afecta mucho', pesos: { casa: 4, atico: 3 } },
      { texto: 'Bastante, prefiero pocos vecinos', pesos: { atico: 3, piso: 2 } },
      { texto: 'Normal, lo del bloque me parece bien', pesos: { piso: 3 } },
      { texto: 'No me importa, soy poco tiempo en casa', pesos: { estudio: 2, compartido: 3 } },
    ],
  },
  {
    id: 7,
    texto: '¿En qué etapa vital te encuentras?',
    opciones: [
      { texto: 'Estudiante o inicio de carrera', pesos: { compartido: 4, estudio: 3 } },
      { texto: 'Joven profesional independiente', pesos: { estudio: 3, piso: 2 } },
      { texto: 'Pareja establecida con planes de familia', pesos: { piso: 3, casa: 2 } },
      { texto: 'Familia consolidada', pesos: { casa: 4, piso: 2 } },
      { texto: 'Nido vacío, hijos independientes', pesos: { piso: 3, atico: 2, estudio: 2 } },
    ],
  },
  {
    id: 8,
    texto: '¿Cuánto te importa el mantenimiento y la gestión de la vivienda?',
    opciones: [
      { texto: 'Quiero mínima responsabilidad', pesos: { compartido: 3, estudio: 2 } },
      { texto: 'Puedo asumir mantenimiento básico', pesos: { piso: 3 } },
      { texto: 'No me importa gestionar', pesos: { piso: 2, atico: 2 } },
      { texto: 'Quiero total control y personalización', pesos: { casa: 4 } },
    ],
  },
  {
    id: 9,
    texto: '¿Trabajas desde casa o tienes necesidades de espacio para trabajo?',
    opciones: [
      { texto: 'Trabajo mayormente fuera', pesos: { estudio: 3, compartido: 2 } },
      { texto: 'Teletrabajo puntual, necesito un rincón', pesos: { piso: 3 } },
      { texto: 'Teletrabajo habitual, necesito despacho', pesos: { piso: 3, casa: 2 } },
      { texto: 'Trabajo en casa a tiempo completo o tengo negocio en el hogar', pesos: { casa: 4, atico: 2 } },
    ],
  },
  {
    id: 10,
    texto: '¿Qué valoras más en una vivienda?',
    opciones: [
      { texto: 'El precio y la ubicación por encima de todo', pesos: { compartido: 3, estudio: 3 } },
      { texto: 'El espacio y la comodidad del día a día', pesos: { piso: 3, casa: 2 } },
      { texto: 'Las vistas y la luz natural', pesos: { atico: 4 } },
      { texto: 'La conexión con la naturaleza y el entorno', pesos: { casa: 4 } },
      { texto: 'La independencia y la privacidad total', pesos: { casa: 3, atico: 2 } },
    ],
  },
];

/* ── Datos de recomendaciones ── */
const RECOMENDACIONES: Record<RecomendacionKey, Recomendacion> = {
  piso: {
    key: 'piso',
    titulo: 'Piso Estándar',
    subtitulo: 'La opción más versátil para la mayoría de situaciones',
    descripcion:
      'Un piso en bloque residencial ofrece el mejor equilibrio entre precio, ubicación y acceso a servicios. Es la tipología más extendida en España y se adapta a una amplia variedad de perfiles: familias, parejas y profesionales. La comunidad de vecinos es una responsabilidad compartida que conviene valorar.',
    ventajas: [
      'Amplia oferta en el mercado (más fácil encontrar y vender)',
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
      'Total libertad para reformas y personalización',
      'Ideal para familias numerosas y mascotas',
    ],
    consideraciones: [
      'Mayor precio de compra y gastos de mantenimiento',
      'Ubicación frecuentemente periférica (más dependencia del coche)',
      'Calefacción y suministros con mayor coste',
      'Gestión y conservación íntegramente a tu cargo',
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
      'El estudio o apartamento (típicamente 25-50 m²) es la solución más económica para una persona sola o pareja sin hijos que pasa poco tiempo en casa. Su bajo mantenimiento, precio reducido y ubicación habitual en zonas céntricas son sus principales ventajas. El espacio reducido puede resultar limitante a largo plazo.',
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
const COLORES: Record<RecomendacionKey, string> = {
  piso: '#2E86AB',
  casa: '#6aaa5e',
  atico: '#e8a020',
  estudio: '#48A9A6',
  compartido: '#9b59b6',
};

/* ── Componente principal ── */
export default function SelectorTipoVivienda() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const total = PREGUNTAS.length;
  const opcionSeleccionada = respuestas[preguntaActual] ?? -1;
  const progresoPct = mostrarResultado ? 100 : Math.round((preguntaActual / total) * 100);

  /* ── Calcular resultado ── */
  const calcularResultado = (): RecomendacionKey => {
    const puntos: Record<RecomendacionKey, number> = {
      piso: 0,
      casa: 0,
      atico: 0,
      estudio: 0,
      compartido: 0,
    };

    PREGUNTAS.forEach((pregunta, idx) => {
      const idxOpcion = respuestas[idx];
      if (idxOpcion === undefined) return;
      const opcion = pregunta.opciones[idxOpcion];
      if (!opcion) return;
      (Object.entries(opcion.pesos) as [RecomendacionKey, number][]).forEach(([key, valor]) => {
        puntos[key] += valor;
      });
    });

    return (Object.entries(puntos) as [RecomendacionKey, number][]).reduce(
      (max, [key, val]) => (val > puntos[max] ? key : max),
      'piso' as RecomendacionKey
    );
  };

  /* ── Handlers ── */
  const handleSeleccionarOpcion = (idx: number) => {
    setRespuestas((prev) => ({ ...prev, [preguntaActual]: idx }));
  };

  const handleSiguiente = () => {
    if (preguntaActual < total - 1) {
      setPreguntaActual((p) => p + 1);
    }
  };

  const handleAnterior = () => {
    if (preguntaActual > 0) {
      setPreguntaActual((p) => p - 1);
    }
  };

  const handleVerResultado = () => {
    setMostrarResultado(true);
  };

  const handleReiniciar = () => {
    setPreguntaActual(0);
    setRespuestas({});
    setMostrarResultado(false);
  };

  const resultado = mostrarResultado ? calcularResultado() : null;
  const recomendacion = resultado ? RECOMENDACIONES[resultado] : null;
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
          <div className={styles.progreso} role="progressbar" aria-valuenow={preguntaActual + 1} aria-valuemin={1} aria-valuemax={total} aria-label={`Pregunta ${preguntaActual + 1} de ${total}`}>
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
            <p className={styles.preguntaTexto}>{preguntaData.texto}</p>

            <div className={styles.opciones} role="group" aria-label={preguntaData.texto}>
              {preguntaData.opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.opcionBtn}${opcionSeleccionada === idx ? ` ${styles.selected}` : ''}`}
                  onClick={() => handleSeleccionarOpcion(idx)}
                  aria-pressed={opcionSeleccionada === idx ? true : false}
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
      {mostrarResultado && recomendacion && resultado && (
        <section className={styles.resultadoSection} aria-label="Resultado del test">
          <div
            className={`${styles.resultadoCard} ${styles[`recomendacion_${resultado}`]}`}
            style={{ borderTopColor: COLORES[resultado] }}
          >
            <h2 className={styles.recomendacionTitulo}>
              Tu tipo de vivienda ideal: {recomendacion.titulo}
            </h2>
            <p className={styles.recomendacionSubtitulo}>{recomendacion.subtitulo}</p>
            <p className={styles.recomendacionDesc}>{recomendacion.descripcion}</p>

            <div className={styles.ventajasGrid}>
              <div className={styles.ventajaCard}>
                <h4>Ventajas</h4>
                <ul>
                  {recomendacion.ventajas.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.ventajaCard}>
                <h4>A tener en cuenta</h4>
                <ul>
                  {recomendacion.consideraciones.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={styles.consejosSection}>
              <h3>Próximos pasos recomendados</h3>
              <ul>
                <li>Utiliza el <strong>Selector de Zona de Residencia</strong> para elegir en qué tipo de ciudad o zona vivir.</li>
                <li>Decide entre alquilar o comprar con el <strong>Orientador Alquiler vs Compra</strong>.</li>
                <li>Calcula los gastos reales de adquisición con el <strong>Estimador Coste Vivienda</strong>.</li>
                <li>Si vas a hipotecarte, consulta el <strong>Estimador de Hipoteca</strong> para simular tu cuota mensual.</li>
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
      <DisclaimerCard variant="general" severity="medium" />

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
          La vivienda unifamiliar (adosada, pareada o aislada) proporciona el mayor nivel de privacidad, autonomía y espacio exterior. Es la preferida por familias numerosas y quienes tienen mascotas. Sin embargo, su precio de adquisición es generalmente más alto, suele estar ubicada en la periferia y todo el mantenimiento recae sobre el propietario: jardín, tejado, instalaciones y fachada.
        </p>

        <h3>Ático y dúplex: luz, vistas y terraza en entorno urbano</h3>
        <p>
          Los áticos ofrecen lo mejor de dos mundos: ubicación urbana y una terraza o azotea amplia que simula el espacio exterior de una casa. La luz natural y las vistas son sus puntos fuertes. Su principal inconveniente es el precio superior al piso equivalente y la mayor exposición a temperaturas extremas (verano especialmente), que pueden incrementar el consumo energético si la vivienda no está bien aislada.
        </p>

        <h3>Estudio y apartamento: eficiencia para personas solas</h3>
        <p>
          Los estudios (habitualmente entre 20 y 45 m²) son la opción más económica para una persona que vive sola, trabaja fuera de casa y no necesita espacio adicional. Su menor superficie reduce la factura energética y los gastos de comunidad. En contrapartida, la falta de espacio puede resultar limitante si la situación familiar cambia o si se necesita trabajar regularmente desde casa.
        </p>

        <h3>Cómo cambian las necesidades según el ciclo vital</h3>
        <p>
          Las necesidades de vivienda evolucionan: un estudiante puede comenzar con una habitación en piso compartido, saltar a un estudio al independizarse, mudarse a un piso estándar con su pareja y plantearse una casa unifamiliar al tener hijos. Con la llegada del «nido vacío» (hijos independizados), muchas familias vuelven a un piso más pequeño o a un ático con buenas vistas. Anticipar este recorrido vital ayuda a tomar decisiones más acertadas.
        </p>

        <h3>Gastos adicionales al comprar cualquier tipo de vivienda</h3>
        <p>
          Independientemente del tipo elegido, la compra de vivienda genera costes adicionales que suelen representar entre el 10 % y el 15 % del precio de escritura:
        </p>
        <ul>
          <li><strong>ITP (Impuesto de Transmisiones Patrimoniales)</strong>: entre el 6 % y el 10 % en vivienda de segunda mano, según la comunidad autónoma.</li>
          <li><strong>IVA (10 %)</strong>: aplicable a vivienda nueva en lugar del ITP.</li>
          <li><strong>AJD (Actos Jurídicos Documentados)</strong>: entre el 0,5 % y el 1,5 % en la escritura, variable por CCAA.</li>
          <li><strong>Notaría y registro</strong>: entre 800 € y 2.500 € según el importe.</li>
          <li><strong>Gestoría</strong>: entre 300 € y 600 € si se contrata para tramitar la inscripción.</li>
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
