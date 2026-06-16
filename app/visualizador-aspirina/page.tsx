'use client';

import { useState } from 'react';
import styles from './VisualizadorAspirina.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

interface PasoMecanismo {
  id: number;
  icono: string;
  titulo: string;
  descripcion: string;
  detalle: string;
}

const PASOS_MECANISMO: PasoMecanismo[] = [
  {
    id: 1,
    icono: '🧬',
    titulo: 'Daño tisular',
    descripcion: 'Se libera ácido araquidónico de las membranas celulares',
    detalle:
      'Cuando las células sufren daño (infección, golpe, quemadura), las fosfolipasas liberan ácido araquidónico de los fosfolípidos de la membrana plasmática. Este ácido graso de 20 carbonos es el sustrato de las enzimas COX.',
  },
  {
    id: 2,
    icono: '⚙️',
    titulo: 'Enzimas COX activas',
    descripcion: 'COX-1 (siempre presente) y COX-2 (inducida por inflamación) actúan',
    detalle:
      'COX-1 es constitutiva: está siempre en estómago, plaquetas y riñón. COX-2 se induce con inflamación en tejidos dañados y el SNC. Ambas convierten el ácido araquidónico en prostaglandinas (PGE2, PGI2) y tromboxanos (TXA2) que amplifican el dolor, la fiebre y la inflamación.',
  },
  {
    id: 3,
    icono: '💊',
    titulo: 'La aspirina actúa',
    descripcion: 'Acetila irreversiblemente una serina en el sitio activo de ambas COX',
    detalle:
      'El ácido acetilsalicílico transfiere un grupo acetilo a la Serina-530 (COX-1) o Serina-516 (COX-2), bloqueando permanentemente el canal por donde entra el ácido araquidónico. Es irreversible: la célula debe sintetizar nueva enzima. En plaquetas, que no tienen núcleo, el bloqueo dura toda su vida (~7-10 días).',
  },
  {
    id: 4,
    icono: '🔇',
    titulo: 'Sin prostaglandinas',
    descripcion: 'Cesa la señal de dolor, fiebre e inflamación. Sin TXA2 → sin agregación',
    detalle:
      'Al bloquearse COX, no se sintetizan PGE2 (dolor y fiebre), PGI2 (vasodilatación e inflamación) ni TXA2 (agregación plaquetaria). Este último efecto es la base del uso cardiovascular: 100 mg/día inhiben TXA2 sin bloquear completamente PGI2 en el endotelio, que sí puede regenerar COX.',
  },
];

interface EfectoAspirina {
  icono: string;
  nombre: string;
  mecanismo: string;
  dosis: string;
  color: string;
}

const EFECTOS: EfectoAspirina[] = [
  {
    icono: '🌡️',
    nombre: 'Antipirético',
    mecanismo:
      'Bloquea la síntesis de PGE2 en el hipotálamo. Las prostaglandinas E2 elevan el punto de ajuste térmico hipotalámico; al inhibirlas, el termostato corporal vuelve a 37 °C.',
    dosis: '500-1000 mg cada 4-6 h',
    color: '#E87B3B',
  },
  {
    icono: '💊',
    nombre: 'Analgésico',
    mecanismo:
      'Reduce PGE2 y PGI2 que sensibilizan los nociceptores periféricos al dolor. Sin estas prostaglandinas, el umbral de dolor sube y la señal dolorosa disminuye. Efecto central modesto.',
    dosis: '500-1000 mg cada 4-6 h',
    color: '#2E86AB',
  },
  {
    icono: '🔴',
    nombre: 'Antiinflamatorio',
    mecanismo:
      'Menos PGE2, PGI2 y TXA2 → menos vasodilatación, menos edema y menor reclutamiento de leucocitos en tejidos inflamados. El efecto antiinflamatorio requiere dosis más altas que el analgésico.',
    dosis: '2-4 g/día (uso reumatológico)',
    color: '#E84545',
  },
  {
    icono: '🩸',
    nombre: 'Antiagregante',
    mecanismo:
      'Inhibe TXA2 en plaquetas irreversiblemente. Como las plaquetas no tienen núcleo, no pueden sintetizar nueva COX: el bloqueo dura toda su vida (~7-10 días). El endotelio sí regenera COX y mantiene PGI2 antiagregante. Indicación clínica: prevención cardiovascular secundaria (post-infarto/ictus). En prevención primaria, las guías USPSTF (2022) y ESC ya no la recomiendan de rutina por balance beneficio-riesgo de sangrado.',
    dosis: '75-100 mg/día (baja dosis)',
    color: '#48A9A6',
  },
];

interface HitoHistorico {
  anio: string;
  titulo: string;
  descripcion: string;
  relevancia: string;
}

const HITOS_HISTORICOS: HitoHistorico[] = [
  {
    anio: '~400 a.C.',
    titulo: 'Hipócrates y el sauce',
    descripcion:
      'Hipócrates recomienda masticar corteza de sauce blanco (Salix alba) para aliviar el dolor y la fiebre. El principio activo es la salicina, un glucósido que el cuerpo convierte en ácido salicílico.',
    relevancia: 'Primer uso documentado de salicilatos en medicina occidental',
  },
  {
    anio: '1828',
    titulo: 'Aislamiento de la salicina',
    descripcion:
      'Johann Andreas Büchner, farmacéutico de Munich, aísla la salicina pura de la corteza de sauce. Es amarga y eficaz, pero irrita el estómago intensamente al ser metabolizada a ácido salicílico.',
    relevancia: 'Primer principio activo aislado de origen vegetal con actividad analgésica demostrada',
  },
  {
    anio: '1897',
    titulo: 'Felix Hoffmann y Bayer',
    descripcion:
      'Felix Hoffmann, químico de Bayer, sintetiza el ácido acetilsalicílico estable por acetilación del ácido salicílico. La empresa lo comercializa en 1899 como "Aspirin" (A de acetil + spirin de Spiraea ulmaria, fuente de salicilatos).',
    relevancia: 'Nace el primer fármaco sintético de la historia moderna de la farmacología',
  },
  {
    anio: '1971',
    titulo: 'John Vane descubre el mecanismo',
    descripcion:
      'John Vane publica en Nature el descubrimiento de que la aspirina actúa inhibiendo la síntesis de prostaglandinas. Trabajando en el Royal College of Surgeons de Londres, identifica el papel de las prostaglandinas en la inflamación.',
    relevancia: 'Premio Nobel de Fisiología o Medicina 1982 compartido con Bergström y Samuelsson',
  },
  {
    anio: '1988',
    titulo: 'ISIS-2: uso cardiovascular',
    descripcion:
      'El ensayo ISIS-2 (17.187 pacientes) demuestra que la aspirina reduce la mortalidad tras infarto agudo de miocardio un 23% cuando se administra en las primeras horas. Combinada con estreptoquinasa, la reducción sube al 42%.',
    relevancia: 'Establece el uso antiagregante de baja dosis como estándar en cardiología',
  },
];

interface FilaCOX {
  caracteristica: string;
  cox1: string;
  cox2: string;
}

const TABLA_COX: FilaCOX[] = [
  {
    caracteristica: 'Expresión',
    cox1: 'Constitutiva (siempre presente)',
    cox2: 'Inducible (solo con inflamación)',
  },
  {
    caracteristica: 'Localización principal',
    cox1: 'Estómago, plaquetas, riñón',
    cox2: 'Tejidos inflamados, SNC, macrófagos',
  },
  {
    caracteristica: 'Productos principales',
    cox1: 'TXA2, PGE2 protectora gástrica',
    cox2: 'PGE2 y PGI2 proinflamatorias',
  },
  {
    caracteristica: 'Inhibición por aspirina',
    cox1: 'Sí → causa úlceras gástricas',
    cox2: 'Sí → reduce inflamación',
  },
  {
    caracteristica: 'Regeneración tras inhibición',
    cox1: 'Células nucleadas: horas/días',
    cox2: 'Células nucleadas: horas/días',
  },
  {
    caracteristica: 'Plaquetas (sin núcleo)',
    cox1: 'NO regeneran → bloqueo 7-10 días',
    cox2: 'No relevante en plaquetas',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorAspirina() {
  const [pasoActivo, setPasoActivo] = useState<number>(0);
  const [efectoActivo, setEfectoActivo] = useState<number | null>(null);
  const [hitoActivo, setHitoActivo] = useState<number>(0);

  const paso = PASOS_MECANISMO[pasoActivo];
  const hito = HITOS_HISTORICOS[hitoActivo];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* HERO */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>FARMACOLOGÍA</span>
          <h1 className={styles.heroTitle}>Aspirina: Cómo Funciona el Fármaco más Universal</h1>
          <p className={styles.heroSubtitle}>
            Del sauce al laboratorio: 120 años de mecanismo molecular
          </p>
          <p className={styles.heroDesc}>
            La aspirina inhibe irreversiblemente las enzimas COX y bloquea la síntesis de
            prostaglandinas. Descubre por qué un comprimido puede ser a la vez antipirético,
            analgésico, antiinflamatorio y antiagregante plaquetario.
          </p>
        </div>
      </header>

      <LegalNotice />

      {/* SECCIÓN 1: Mecanismo molecular */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>El mecanismo: COX-1 y COX-2</h2>
        <p className={styles.sectionDesc}>
          Haz clic en cada paso para ver cómo la aspirina interrumpe la cascada del ácido
          araquidónico. El bloqueo irreversible es la clave que la diferencia de otros AINEs.
        </p>

        {/* Indicadores de paso */}
        <div className={styles.stepIndicator} role="tablist" aria-label="Pasos del mecanismo">
          {PASOS_MECANISMO.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={i === pasoActivo}
              aria-label={`Paso ${p.id}: ${p.titulo}`}
              className={`${styles.indicadorPunto} ${i === pasoActivo ? styles.indicadorActivo : ''}`}
              onClick={() => setPasoActivo(i)}
            />
          ))}
        </div>

        {/* Tarjetas de paso */}
        <div className={styles.mecanismoGrid}>
          {PASOS_MECANISMO.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={`${styles.mecanismoCard} ${i === pasoActivo ? styles.mecanismoCardActiva : ''}`}
              onClick={() => setPasoActivo(i)}
              aria-pressed={i === pasoActivo}
            >
              <span className={styles.mecanismoIcono} aria-hidden="true">{p.icono}</span>
              <span className={styles.mecanismoNumero}>Paso {p.id}</span>
              <span className={styles.mecanismoTitulo}>{p.titulo}</span>
              <span className={styles.mecanismoDesc}>{p.descripcion}</span>
            </button>
          ))}
        </div>

        {/* Detalle del paso seleccionado */}
        <div className={styles.pasoDetalle} role="region" aria-live="polite">
          <div className={styles.pasoDetalleHeader}>
            <span className={styles.pasoDetalleIcono} aria-hidden="true">{paso.icono}</span>
            <div>
              <p className={styles.pasoDetalleNumero}>Paso {paso.id} de {PASOS_MECANISMO.length}</p>
              <h3 className={styles.pasoDetalleTitulo}>{paso.titulo}</h3>
            </div>
          </div>
          <p className={styles.pasoDetalleTexto}>{paso.detalle}</p>
          <div className={styles.irreversibleBox}>
            <strong>Irreversible vs. reversible:</strong> La aspirina forma un enlace covalente
            permanente con la COX (acetilación). El ibuprofeno y el naproxeno se unen de forma
            reversible: cuando se elimina el fármaco, la enzima recupera su actividad. En las
            plaquetas, sin núcleo para sintetizar nueva COX, la aspirina bloquea la agregación
            durante toda la vida de la plaqueta (~7-10 días).
          </div>
          {/* Controles de navegación */}
          <div className={styles.stepControls}>
            <button
              type="button"
              className={styles.stepBtn}
              onClick={() => setPasoActivo((prev) => Math.max(0, prev - 1))}
              disabled={pasoActivo === 0}
              aria-label="Paso anterior"
            >
              ← Anterior
            </button>
            <span className={styles.stepCounter}>
              {pasoActivo + 1} / {PASOS_MECANISMO.length}
            </span>
            <button
              type="button"
              className={styles.stepBtn}
              onClick={() => setPasoActivo((prev) => Math.min(PASOS_MECANISMO.length - 1, prev + 1))}
              disabled={pasoActivo === PASOS_MECANISMO.length - 1}
              aria-label="Paso siguiente"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: Los 4 efectos */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <h2 className={styles.sectionTitle}>Los 4 efectos y su base molecular</h2>
        <p className={styles.sectionDesc}>
          Un solo mecanismo — bloquear COX — explica cuatro efectos terapéuticos distintos. La
          diferencia está en qué prostaglandinas se inhiben y en qué tejidos.
        </p>
        <div className={styles.efectosGrid}>
          {EFECTOS.map((efecto, i) => (
            <button
              key={efecto.nombre}
              type="button"
              className={`${styles.efectoCard} ${efectoActivo === i ? styles.efectoCardActivo : ''}`}
              onClick={() => setEfectoActivo(efectoActivo === i ? null : i)}
              aria-expanded={efectoActivo === i}
              style={{ '--efecto-color': efecto.color } as React.CSSProperties}
            >
              <span className={styles.efectoIcono} aria-hidden="true">{efecto.icono}</span>
              <span className={styles.efectoNombre}>{efecto.nombre}</span>
              <span className={styles.efectoDosis}>{efecto.dosis}</span>
              {efectoActivo === i && (
                <p className={styles.efectoMecanismo}>{efecto.mecanismo}</p>
              )}
              <span className={styles.efectoToggle} aria-hidden="true">
                {efectoActivo === i ? '▲' : '▼'}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* SECCIÓN 3: Timeline histórico */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Historia interactiva: 2.400 años de salicilatos</h2>
        <p className={styles.sectionDesc}>
          Selecciona cada hito para conocer el contexto completo de uno de los fármacos más
          estudiados de la historia de la medicina.
        </p>

        {/* Botones del timeline */}
        <div className={styles.timeline} role="tablist" aria-label="Hitos históricos de la aspirina">
          {HITOS_HISTORICOS.map((h, i) => (
            <button
              key={h.anio}
              type="button"
              role="tab"
              aria-selected={i === hitoActivo}
              className={`${styles.hitoBtn} ${i === hitoActivo ? styles.hitoBtnActivo : ''}`}
              onClick={() => setHitoActivo(i)}
            >
              <span className={styles.hitoAnio}>{h.anio}</span>
              <span className={styles.hitoTituloBreve}>{h.titulo}</span>
            </button>
          ))}
        </div>

        {/* Detalle del hito seleccionado */}
        <div className={styles.hitoDetalle} role="region" aria-live="polite">
          <h3 className={styles.hitoDetalleAnio}>{hito.anio}</h3>
          <h4 className={styles.hitoDetalleTitulo}>{hito.titulo}</h4>
          <p className={styles.hitoDetalleTexto}>{hito.descripcion}</p>
          <div className={styles.hitoRelevancia}>
            <strong>Relevancia:</strong> {hito.relevancia}
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: COX-1 vs COX-2 */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <h2 className={styles.sectionTitle}>COX-1 vs COX-2: por qué importan las diferencias</h2>
        <p className={styles.sectionDesc}>
          La distinción entre ambas isoformas explica tanto los beneficios como los efectos
          adversos de la aspirina y de los AINEs selectivos.
        </p>

        <div className={styles.tablaWrapper}>
          <table className={styles.tablaComparativa} aria-label="Comparativa COX-1 vs COX-2">
            <thead>
              <tr>
                <th scope="col" className={styles.thCaracteristica}>Característica</th>
                <th scope="col" className={styles.thCox1}>COX-1</th>
                <th scope="col" className={styles.thCox2}>COX-2</th>
              </tr>
            </thead>
            <tbody>
              {TABLA_COX.map((fila) => (
                <tr key={fila.caracteristica}>
                  <td className={styles.tdCaracteristica}>{fila.caracteristica}</td>
                  <td className={styles.tdCox1}>{fila.cox1}</td>
                  <td className={styles.tdCox2}>{fila.cox2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.insightBox}>
          <strong>Insight: el dilema de los coxibs</strong>
          <br />
          Los AINEs selectivos COX-2 (celecoxib, rofecoxib) se desarrollaron para evitar las
          úlceras gástricas causadas por la inhibición de COX-1. Funcionó para el estómago, pero
          al inhibir solo COX-2 (que produce PGI2 vasoprotectora en el endotelio) sin tocar COX-1
          (que produce TXA2 proagregante en plaquetas), se inclinó la balanza hacia la trombosis.
          Rofecoxib fue retirado en 2004 por aumento de infarto. Un ejemplo de cómo comprender el
          mecanismo revela efectos adversos no previstos.
        </div>
      </section>

      {/* DISCLAIMER */}
      <div className={styles.section}>
        <DisclaimerCard variant="medical" severity="high" />
      </div>

      {/* EDUCATIONAL SECTION */}
      <EducationalSection
        title="¿Quieres profundizar? Conceptos clave de farmacología"
        subtitle="Prostaglandinas, COX, ácido araquidónico y el ciclo del dolor"
      >
        <div className={styles.educSection}>
          <h3 className={styles.eduTitulo}>¿Qué son las prostaglandinas?</h3>
          <p className={styles.eduTexto}>
            Las prostaglandinas son lípidos señalizadores derivados del ácido araquidónico. No son
            hormonas clásicas (no se segregan por una glándula y no viajan por sangre a distancia):
            actúan de forma local, paracrina o autocrina, sobre células cercanas o la misma célula
            que las produce. Hay al menos 9 tipos (PGA, PGB, PGC, PGD, PGE, PGF, PGG, PGH, PGI)
            y múltiples subtipos con efectos distintos e incluso opuestos según el receptor al que
            se unan.
          </p>

          <h3 className={styles.eduTitulo}>El ciclo del ácido araquidónico</h3>
          <p className={styles.eduTexto}>
            El ácido araquidónico es un ácido graso poliinsaturado ω-6 de 20 carbonos que se
            almacena en los fosfolípidos de membrana. Ante daño celular, las fosfolipasas A2 lo
            liberan. Desde ahí, puede seguir tres rutas enzimáticas: la ruta COX (prostaglandinas
            y tromboxanos), la ruta LOX (leucotrienos, implicados en asma y alergias) y la ruta
            del citocromo P450 (EETs). La aspirina solo bloquea la ruta COX.
          </p>

          <h3 className={styles.eduTitulo}>
            Por qué antipirético no significa antibiótico
          </h3>
          <p className={styles.eduTexto}>
            La fiebre es una respuesta del sistema inmune al bloquear la síntesis de proteínas
            bacterianas a altas temperaturas y activar leucocitos. La aspirina baja la fiebre
            bloqueando PGE2 en el hipotálamo, pero no elimina la infección: solo gestiona el
            síntoma. Tomar aspirina no cura una infección bacteriana ni viral.
          </p>

          <h3 className={styles.eduTitulo}>Por qué la aspirina NO sirve para niños con gripe</h3>
          <p className={styles.eduTexto}>
            El síndrome de Reye es una complicación rara pero grave (encefalopatía + fallo
            hepático) que aparece en niños y adolescentes que reciben aspirina durante infecciones
            virales (gripe, varicela). El mecanismo exacto no está completamente aclarado, pero
            se relaciona con la interacción entre salicilatos y la disfunción mitocondrial
            inducida por el virus. Por eso, la aspirina está contraindicada en menores de 16 años
            con infecciones virales. Se usa paracetamol o ibuprofeno como alternativa.
          </p>

          <h3 className={styles.eduTitulo}>Inhibición irreversible: las implicaciones prácticas</h3>
          <p className={styles.eduTexto}>
            Como la aspirina acetila de forma irreversible, su efecto sobre las plaquetas no puede
            revertirse con ningún antídoto ni esperando a que el fármaco se elimine del organismo.
            La única forma de recuperar la función plaquetaria completa es esperar a que el cuerpo
            produzca nuevas plaquetas. En cirugía programada, los médicos recomiendan suspender la
            aspirina 7-10 días antes para restaurar la hemostasia. Los demás AINEs (ibuprofeno,
            naproxeno) son reversibles: la función plaquetaria vuelve en horas tras eliminar el
            fármaco.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota educativa:</strong> Este visualizador explica mecanismos bioquímicos con
            fines educativos. Para el uso correcto de cualquier medicamento, incluida la aspirina,
            consulta siempre con tu médico o farmacéutico. La automedicación con AINEs puede
            ocultar síntomas importantes y tiene contraindicaciones relevantes (úlcera, embarazo,
            interacciones con anticoagulantes).
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-aspirina')} />
      <ShareCard appName="visualizador-aspirina" />
      <Footer appName="visualizador-aspirina" />
    </div>
  );
}
