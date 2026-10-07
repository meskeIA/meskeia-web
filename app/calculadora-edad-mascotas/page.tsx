'use client';

import { useState } from 'react';
import styles from './CalculadoraEdadMascotas.module.css';
import { MeskeiaLogo, Footer, RelatedApps, DisclaimerCard, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { PREGUNTAS_FRECUENTES } from './metadata';
import {
  EDAD_MAXIMA,
  EDAD_MINIMA,
  FACTOR_GATO,
  NOMBRE_TAMANO,
  PESO_TAMANO,
  TAMANOS,
  UMBRALES_GATO,
  UMBRALES_PERRO,
  calcularEdadHumana,
  obtenerEtapa,
  textoAnios,
  type ClaveEtapa,
  type TamanoPerro,
  type TipoMascota,
  type UmbralesEtapa,
} from './motor';

interface Resultado {
  tipo: TipoMascota;
  edad: number;
  edadHumana: number;
  etapa: ClaveEtapa;
  etapaNombre: string;
  descripcion: string;
}

const EMOJI_ETAPA: Record<ClaveEtapa, string> = {
  cria: '🍼',
  joven: '🎾',
  adulto: '💪',
  maduro: '🛋️',
  senior: '🧓',
  geriatrico: '❤️',
};

/** Edad del animal con los decimales que tenga, en formato español: «2,5». */
const formatEdad = (n: number): string => n.toLocaleString('es-ES', { maximumFractionDigits: 2 });

/** Años humanos redondeados para presentar. */
const humanos = (tipo: TipoMascota, tamano: TamanoPerro, edad: number): string =>
  formatNumber(calcularEdadHumana(tipo, tamano, edad), 0);

const mayuscula = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

const ID_EDAD = 'edad-mascota';
const ID_TAMANO = 'tamano-perro-etiqueta';

/** «0-1», «1-3», …, «14 o más» para una fila de umbrales. */
function rangosEtapa(u: UmbralesEtapa): string[] {
  return [
    `0-${u.joven}`,
    `${u.joven}-${u.adulto}`,
    `${u.adulto}-${u.maduro}`,
    `${u.maduro}-${u.senior}`,
    `${u.senior}-${u.geriatrico}`,
    `${u.geriatrico} o más`,
  ];
}

export default function CalculadoraEdadMascotasPage() {
  const [tipoMascota, setTipoMascota] = useState<TipoMascota>('perro');
  const [tamanoPerro, setTamanoPerro] = useState<TamanoPerro>('mediano');
  const [edadMascota, setEdadMascota] = useState('');
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState('');

  const calcular = () => {
    const edad = parseSpanishNumber(edadMascota);
    if (edadMascota.trim() === '' || isNaN(edad) || edad < EDAD_MINIMA || edad > EDAD_MAXIMA) {
      // Antes se descartaba en silencio y quedaba el resultado anterior (hallazgo 3015)
      setResultado(null);
      setError(
        `Introduce la edad en años, un número entre ${EDAD_MINIMA} y ${EDAD_MAXIMA} (puedes usar decimales: 3 meses son 0,25 años).`,
      );
      return;
    }

    const etapa = obtenerEtapa(tipoMascota, tamanoPerro, edad);
    setError('');
    setResultado({
      tipo: tipoMascota,
      edad,
      edadHumana: calcularEdadHumana(tipoMascota, tamanoPerro, edad),
      etapa: etapa.clave,
      etapaNombre: etapa.nombre,
      descripcion: etapa.descripcion,
    });
  };

  const limpiar = () => {
    setEdadMascota('');
    setResultado(null);
    setError('');
  };

  // Cambiar el tamaño invalida el resultado, como ya hacía el tipo de mascota (hallazgo 3014)
  const cambiarTamano = (tamano: TamanoPerro) => {
    setTamanoPerro(tamano);
    setResultado(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Edad de Mascotas</h1>
        <p className={styles.subtitle}>
          Descubre la edad de tu perro o gato en años humanos
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          {/* Selector de mascota */}
          <div className={styles.mascotaSelector}>
            <button
              type="button"
              aria-pressed={tipoMascota === 'perro'}
              className={`${styles.mascotaBtn} ${tipoMascota === 'perro' ? styles.active : ''}`}
              onClick={() => { setTipoMascota('perro'); setResultado(null); }}
            >
              <span aria-hidden="true">🐕</span> Perro
            </button>
            <button
              type="button"
              aria-pressed={tipoMascota === 'gato'}
              className={`${styles.mascotaBtn} ${tipoMascota === 'gato' ? styles.active : ''}`}
              onClick={() => { setTipoMascota('gato'); setResultado(null); }}
            >
              <span aria-hidden="true">🐈</span> Gato
            </button>
          </div>

          {/* Selector de tamaño (solo para perros) */}
          {tipoMascota === 'perro' && (
            <div className={styles.inputGroup}>
              <span id={ID_TAMANO} className={styles.groupLabel}>Tamaño del perro</span>
              <div className={styles.tamanoGrid} role="group" aria-labelledby={ID_TAMANO}>
                {TAMANOS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={tamanoPerro === t}
                    className={`${styles.tamanoBtn} ${tamanoPerro === t ? styles.active : ''}`}
                    onClick={() => cambiarTamano(t)}
                  >
                    <span className={styles.tamanoIcon} aria-hidden="true">🐕</span>
                    <span className={styles.tamanoNombre}>{mayuscula(NOMBRE_TAMANO[t])}</span>
                    <span className={styles.tamanoPeso}>{PESO_TAMANO[t]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor={ID_EDAD}>Edad de tu {tipoMascota === 'perro' ? 'perro' : 'gato'}</label>
            <div className={styles.inputConUnidad}>
              <input
                id={ID_EDAD}
                type="text"
                inputMode="decimal"
                value={edadMascota}
                onChange={(e) => setEdadMascota(e.target.value)}
                placeholder="5"
                className={styles.input}
                aria-invalid={error !== ''}
                aria-describedby={`${ID_EDAD}-ayuda`}
              />
              <span className={styles.unidad}>años</span>
            </div>
            <span id={`${ID_EDAD}-ayuda`} className={styles.hint}>
              Puedes usar decimales (ej: 2,5 años; 3 meses = 0,25)
            </span>
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
          </div>

          <div className={styles.botones}>
            <button type="button" onClick={calcular} className={styles.btnPrimary}>
              Calcular Edad Humana
            </button>
            <button type="button" onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel} aria-live="polite">
          {resultado ? (
            <>
              {/* Edad humana */}
              <div className={styles.resultadoPrincipal}>
                <span className={styles.resultadoIcon} aria-hidden="true">
                  {resultado.tipo === 'perro' ? '🐕' : '🐈'}
                </span>
                <div className={styles.resultadoValor}>
                  {formatNumber(resultado.edadHumana, 0)} años humanos
                </div>
                <div className={styles.resultadoLabel}>
                  Equivalente en edad humana
                </div>
              </div>

              {/* Etapa de vida */}
              <div className={styles.etapaVida}>
                <div className={styles.etapaTitulo}>
                  <span className={styles.etapaEmoji} aria-hidden="true">
                    {EMOJI_ETAPA[resultado.etapa]}
                  </span>
                  <span>Etapa: {resultado.etapaNombre}</span>
                </div>
                <p className={styles.etapaDescripcion}>{resultado.descripcion}</p>
              </div>

              {/* Comparación visual: la edad con que se calculó, no el campo en vivo */}
              <div className={styles.comparacion}>
                <div className={styles.comparacionItem}>
                  <div className={styles.comparacionIcono} aria-hidden="true">
                    {resultado.tipo === 'perro' ? '🐕' : '🐈'}
                  </div>
                  <div className={styles.comparacionEdad}>
                    {textoAnios(resultado.edad, formatEdad)}
                  </div>
                  <div className={styles.comparacionLabel}>
                    {resultado.tipo === 'perro' ? 'Perro' : 'Gato'}
                  </div>
                </div>
                <div className={styles.comparacionIgual}>=</div>
                <div className={styles.comparacionItem}>
                  <div className={styles.comparacionIcono} aria-hidden="true">👤</div>
                  <div className={styles.comparacionEdad}>
                    {formatNumber(resultado.edadHumana, 0)} años
                  </div>
                  <div className={styles.comparacionLabel}>Humano</div>
                </div>
              </div>

              {/* Info adicional */}
              <div className={styles.infoAdicional}>
                <h4><span aria-hidden="true">💡</span> ¿Sabías que...?</h4>
                {resultado.tipo === 'perro' ? (
                  <p>
                    Por lo general, los perros de tamaño pequeño viven más años que los grandes y los
                    gigantes, y también llegan más tarde a la etapa senior.
                  </p>
                ) : (
                  <p>
                    A partir del segundo año, el gato envejece al mismo ritmo sea cual sea su peso:
                    cada año suma unos {FACTOR_GATO} años humanos.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">🐾</span>
              <p>Introduce la edad de tu mascota para calcular</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de referencia: sale del motor, no se teclea */}
      <div className={styles.tablaReferencia}>
        <h3><span aria-hidden="true">📊</span> Tabla de Referencia Rápida</h3>
        <div className={styles.tablasGrid}>
          <div className={styles.tablaCard}>
            <h4><span aria-hidden="true">🐕</span> Perros (tamaño mediano)</h4>
            <table>
              <thead>
                <tr>
                  <th>Edad perro</th>
                  <th>Edad humana</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 5, 7, 10].map((e) => (
                  <tr key={e}><td>{textoAnios(e, formatEdad)}</td><td>{humanos('perro', 'mediano', e)} años</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.tablaCard}>
            <h4><span aria-hidden="true">🐈</span> Gatos</h4>
            <table>
              <thead>
                <tr>
                  <th>Edad gato</th>
                  <th>Edad humana</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 5, 10, 15].map((e) => (
                  <tr key={e}><td>{textoAnios(e, formatEdad)}</td><td>{humanos('gato', 'mediano', e)} años</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>


      <DisclaimerCard variant="medical" severity="high" collapsible={false} context="calculadora-edad-mascotas">
        <p>Esta calculadora usa una regla convencional de equivalencia y es <strong>solo orientativa</strong>:</p>
        <ul className={styles.disclaimerList}>
          <li><strong>La edad biológica varía</strong>: Depende de raza, tamaño, alimentación, ejercicio y genética individual</li>
          <li><strong>No reemplaza revisiones veterinarias</strong>: El envejecimiento de tu mascota debe evaluarlo un veterinario con exploración física</li>
        </ul>
        <p className={styles.highlight}><strong><span aria-hidden="true">🐾</span> Consulta con tu veterinario sobre cuidados específicos según la edad de tu mascota.</strong></p>
      </DisclaimerCard>

      <EducationalSection
        title="Todo sobre la edad de tu mascota"
        subtitle="Cómo se calcula la equivalencia, tablas por tamaño y guía de cuidados por etapa vital"
      >
        {/* 1. TABLA COMPARATIVA */}
        <section>
          <h3>Tabla comparativa de equivalencia de edad</h3>
          <p>
            La popular &quot;regla de los 7 años&quot; es una simplificación: la proporción varía
            según el tamaño del perro y la edad real. Los perros grandes envejecen más rápido
            que los pequeños.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Edad real</th>
                  {TAMANOS.map((t) => (
                    <th key={t}>
                      {mayuscula(NOMBRE_TAMANO[t])} <span aria-hidden="true">({PESO_TAMANO[t]})</span>
                    </th>
                  ))}
                  <th>Gato</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 5, 7, 10, 12, 15].map((e) => (
                  <tr key={e}>
                    <td>{textoAnios(e, formatEdad)}</td>
                    {TAMANOS.map((t) => (
                      <td key={t}>{t === 'gigante' && e === 15 ? '—' : `${humanos('perro', t, e)} años`}</td>
                    ))}
                    <td>{humanos('gato', 'mediano', e)} años</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.faqTip}>
            <strong>Nota:</strong> Valores de la regla convencional orientativa (15 años humanos el
            primer año, 9 más el segundo y, desde el tercero, 4, 5, 6 o 7 por año según el tamaño;
            4 en el gato). No es un modelo científico: un estudio de 2020 (Wang et al., Cell Systems)
            propuso otro, basado en cambios epigenéticos y calibrado en labradores, que esta
            calculadora no usa.
          </p>
        </section>

        {/* 1 bis. ETAPAS VITALES — la misma tabla que usa el motor */}
        <section>
          <h3>Etapas vitales según el tamaño</h3>
          <p>
            Edades orientativas, en años del animal, con las que la calculadora asigna la etapa. No
            hay un umbral oficial único: cada veterinario lo ajusta al animal concreto.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Etapa</th>
                  {TAMANOS.map((t) => (
                    <th key={t}>Perro {NOMBRE_TAMANO[t]}</th>
                  ))}
                  <th>Gato</th>
                </tr>
              </thead>
              <tbody>
                {(['Cría', 'Joven', 'Adulto', 'Maduro', 'Senior', 'Geriátrico'] as const).map((nombre, i) => (
                  <tr key={nombre}>
                    <td>{nombre}</td>
                    {TAMANOS.map((t) => (
                      <td key={t}>{rangosEtapa(UMBRALES_PERRO[t])[i]}</td>
                    ))}
                    <td>{rangosEtapa(UMBRALES_GATO)[i]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. CASOS DE USO */}
        <section>
          <h3>¿Para quién es útil esta calculadora?</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏠</span>
                <strong>Adoptante de rescate</strong>
              </div>
              <p className={styles.escenarioExample}>
                Has adoptado un perro sin historial conocido y el veterinario estima 5-6 años.
                Si es mediano, la calculadora te dice que equivale a un humano de {humanos('perro', 'mediano', 5)}-{humanos('perro', 'mediano', 6)} años: adulto activo,
                pero con revisiones anuales ya recomendables.
              </p>
              <p className={styles.escenarioTip}>
                Usa la calculadora para dimensionar expectativas de vida y planificar cuidados preventivos.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🥗</span>
                <strong>Propietario que ajusta la dieta</strong>
              </div>
              <p className={styles.escenarioExample}>
                Tu Golden Retriever (perro grande) cumple 8 años. La calculadora muestra {humanos('perro', 'grande', 8)} años humanos
                equivalentes y la etapa senior: es momento de hablar con el veterinario del pienso &quot;senior&quot; y de ajustar las calorías.
              </p>
              <p className={styles.escenarioTip}>
                La etapa vital equivalente orienta cuándo y cómo adaptar la alimentación.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🩺</span>
                <strong>Veterinario en consulta</strong>
              </div>
              <p className={styles.escenarioExample}>
                Comunicar &quot;tu perro tiene 9 años&quot; no genera la misma empatía que
                &quot;equivale a una persona de {humanos('perro', 'grande', 9)} años&quot; (si es grande). La equivalencia humana ayuda al propietario
                a comprender la urgencia de revisiones semestrales.
              </p>
              <p className={styles.escenarioTip}>
                Herramienta de comunicación eficaz para mejorar la adherencia a protocolos preventivos.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🐕</span>
                <strong>Criador responsable</strong>
              </div>
              <p className={styles.escenarioExample}>
                Una perra de 7 años de raza grande equivale a {humanos('perro', 'grande', 7)} años humanos. Conocer esto orienta
                las decisiones éticas sobre reproducción tardía y el momento de retirar a la reproductora
                del programa de cría.
              </p>
              <p className={styles.escenarioTip}>
                Fundamental para planificar la vida reproductiva sin comprometer el bienestar animal.
              </p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section>
          <h3>Preguntas frecuentes sobre la edad de las mascotas</h3>
          <dl className={styles.faqList}>
            {/* Del MISMO array que el FAQPage de metadata.ts: las dos bocas no pueden divergir */}
            {PREGUNTAS_FRECUENTES.map((f) => (
              <div key={f.question} className={styles.faqItem}>
                <dt>{f.question}</dt>
                <dd>{f.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 4. GUÍA PASO A PASO */}
        <section>
          <h3>Cómo adaptar los cuidados según la etapa vital</h3>
          <p>Una vez conocida la edad equivalente de tu mascota, sigue estos 7 pasos para ajustar su rutina:</p>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Identifica la etapa vital</strong>
                <p>
                  Cachorro, joven, adulto, maduro, senior o geriátrico: la calculadora te la da, y las
                  edades de cada una según el tamaño están en la tabla de etapas de arriba (un perro
                  gigante es senior a los {UMBRALES_PERRO.gigante.senior} años; uno pequeño, a los {UMBRALES_PERRO.pequeno.senior}). Cada etapa tiene necesidades
                  nutricionales y de ejercicio distintas.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Revisa la alimentación</strong>
                <p>
                  Ajusta la cantidad calórica y el tipo de pienso según la etapa. Los cachorros
                  necesitan más proteína para el crecimiento; los seniors requieren menos calorías
                  y más fibra para mantener el peso ideal.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Adapta el ejercicio</strong>
                <p>
                  La cantidad de ejercicio depende de la raza, la edad y la salud: pregunta a tu
                  veterinario por la de tu perro. Con los seniors suelen ir mejor paseos más cortos
                  pero más frecuentes. Evita superficies duras
                  y saltos en perros mayores para proteger las articulaciones.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Programa revisiones veterinarias</strong>
                <p>
                  Cachorros: seguimiento mensual el primer año. Adultos: revisión anual.
                  Seniors y geriátricos: revisión semestral con analítica completa para detectar
                  problemas renales, hepáticos o tiroideos.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Cuida el entorno doméstico</strong>
                <p>
                  Para mascotas mayores, facilita el acceso: rampas en lugar de escalones, cama
                  ortopédica a ras del suelo, comedero elevado para reducir tensión cervical y
                  antideslizantes en suelos resbaladizos.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">6</span>
              <div className={styles.stepContent}>
                <strong>Mantén la estimulación mental</strong>
                <p>
                  Incluso los perros seniors necesitan juego e interacción. Los juguetes Kong,
                  los puzzles de sniffing y las sesiones cortas de entrenamiento mantienen el
                  cerebro activo y retrasan el deterioro cognitivo.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">7</span>
              <div className={styles.stepContent}>
                <strong>Observa señales de alerta temprana</strong>
                <p>
                  Cambios en el apetito o el peso, aumento del consumo de agua, dificultad para
                  levantarse, tos persistente o jadeo excesivo son señales que justifican una
                  visita al veterinario sin esperar a la revisión programada.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* 5. MEJORES PRÁCTICAS */}
        <section>
          <h3>Mejores prácticas de cuidado por etapa vital</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🍼</span>
              <strong>Cachorro</strong>
              <p>
                Socialización intensiva con personas, animales y entornos variados. Vacunación
                completa y desparasitaciones periódicas. Limitar el ejercicio de alto impacto para
                proteger las articulaciones en desarrollo. Alimentación con pienso específico de cachorro.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎾</span>
              <strong>Joven</strong>
              <p>
                Máxima actividad física y juego. Momento ideal para consolidar el adiestramiento
                y establecer rutinas. Esterilización si no se destina a cría. Mantener el peso
                controlado: es la etapa en que más riesgo de sobrepeso existe por la transición
                de cachorro a adulto.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💪</span>
              <strong>Adulto</strong>
              <p>
                Etapa de equilibrio. Mantener la rutina de ejercicio y una dieta estable.
                Revisión dental anual (el sarro acumulado puede causar infecciones cardíacas
                y renales). Controla el peso mensualmente para detectar cambios sutiles.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🛋️</span>
              <strong>Maduro</strong>
              <p>
                Empieza a valorar el cambio a pienso senior. Incorpora suplementos de omega-3
                y glucosamina para las articulaciones si el veterinario lo recomienda. Reduce
                paulatinamente el ejercicio de alta intensidad. Primera analítica completa
                de sangre y orina como referencia basal.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧓</span>
              <strong>Senior</strong>
              <p>
                Revisión veterinaria semestral obligatoria. Adapta el entorno: cama ortopédica,
                rampas y suelos antideslizantes. Paseos cortos y frecuentes en lugar de
                largas caminatas. Vigilar la ingesta de agua como indicador de salud renal.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">❤️</span>
              <strong>Geriátrico</strong>
              <p>
                Prioridad: confort y calidad de vida. Revisiones veterinarias trimestrales.
                Medicación para el dolor articular si el veterinario la prescribe. Dieta
                blanda o húmeda si hay pérdida dental. Maximizar el tiempo de calidad con
                tu mascota en su entorno familiar y seguro.
              </p>
            </div>
          </div>
        </section>

        {/* 6. WARNING BOX */}
        <section>
          <div className={styles.warningBox} role="alert">
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>6 errores que acortan la vida de tu mascota</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Esperar demasiado para cambiar a dieta senior:</strong> Un perro grande de {UMBRALES_PERRO.grande.senior} años
                equivale ya a {humanos('perro', 'grande', UMBRALES_PERRO.grande.senior)} años humanos; mantenerle la alimentación de adulto joven
                ignora que sus necesidades metabólicas han cambiado.
              </li>
              <li>
                <strong>No ajustar el ejercicio en perros mayores:</strong> Los saltos, las carreras
                en superficies duras y el juego intenso dañan las articulaciones ya deterioradas.
                El dolor articular crónico reduce drásticamente la calidad de vida.
              </li>
              <li>
                <strong>Ignorar el aumento de sed o el cambio en la orina:</strong> Son de los primeros
                indicadores de insuficiencia renal o diabetes. Detectados a tiempo, estas enfermedades
                son manejables; ignoradas, acortan la vida varios años.
              </li>
              <li>
                <strong>Saltar las revisiones dentales:</strong> La enfermedad periodontal es frecuente
                en perros mayores y puede afectar a otros órganos. Pregunta a tu veterinario cada
                cuánto conviene revisarle la boca.
              </li>
              <li>
                <strong>Subestimar el envejecimiento acelerado en razas grandes:</strong> Un Pastor
                Alemán (perro grande) de 8 años ya es senior ({humanos('perro', 'grande', 8)} años equivalentes). Tratarlo como un
                adulto de mediana edad en términos de ejercicio o dieta puede precipitar su deterioro.
              </li>
              <li>
                <strong>Ignorar cambios en el comportamiento o el apetito:</strong> En mascotas
                mayores, una pérdida de apetito de más de 48 horas o un cambio brusco de carácter
                puede ser señal de dolor, enfermedad o deterioro cognitivo. Nunca esperes más de
                2-3 días para consultar al veterinario.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps
        apps={getRelatedApps('calculadora-edad-mascotas')}
        title="Más herramientas para tu mascota"
        icon="🐾"
      />

      <ShareCard appName="calculadora-edad-mascotas" />
      <Footer appName="calculadora-edad-mascotas" />
    </div>
  );
}
