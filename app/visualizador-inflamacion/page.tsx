'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './Inflamacion.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type TabPrincipal = 'signos' | 'comparativa' | 'celulas' | 'factores';

interface TabInfo {
  id: TabPrincipal;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const TABS: TabInfo[] = [
  { id: 'signos', titulo: 'Los 5 signos clásicos', icono: '🩺', subtitulo: 'Celso y Galeno, actualizado con bioquímica' },
  { id: 'comparativa', titulo: 'Aguda vs Crónica', icono: '⚖️', subtitulo: 'La diferencia que lo cambia todo' },
  { id: 'celulas', titulo: 'Células protagonistas', icono: '🔬', subtitulo: 'Quién hace qué en el proceso' },
  { id: 'factores', titulo: 'Factores amplificadores', icono: '🔥', subtitulo: 'Por qué no se apaga la llama' },
];

// ─────────────────────────────────────────────
// Datos: 5 signos clásicos
// ─────────────────────────────────────────────

interface SignoInflamacion {
  id: string;
  nombre: string;
  latinNombre: string;
  icono: string;
  color: string;
  resumen: string;
  mecanismo: string;
}

const SIGNOS: SignoInflamacion[] = [
  {
    id: 'rubor',
    nombre: 'Rubor',
    latinNombre: 'Enrojecimiento',
    icono: '🔴',
    color: '#e74c3c',
    resumen: 'Vasodilatación por histamina y prostaglandinas → más sangre llega a la zona',
    mecanismo: 'Los mastocitos liberan histamina, que relaja el músculo liso de las arteriolas. Las prostaglandinas (especialmente PGE2) amplifican este efecto. El resultado: vasos más anchos, mayor flujo → la piel se ve roja. Es la señal de que el sistema inmune está activado y llamando refuerzos.',
  },
  {
    id: 'calor',
    nombre: 'Calor',
    latinNombre: 'Calor',
    icono: '🌡️',
    color: '#e67e22',
    resumen: 'Aumento de temperatura local por mayor flujo sanguíneo + pirógenos',
    mecanismo: 'El mayor flujo sanguíneo trae más sangre caliente (37 °C) a una zona que normalmente está más fría (piel, extremidades). Los pirógenos endógenos (IL-1β, IL-6, TNF-α) actúan sobre el hipotálamo y elevan también la temperatura sistémica (fiebre). El calor dificulta la replicación de muchos patógenos, que están optimizados para crecer a 37 °C.',
  },
  {
    id: 'tumor',
    nombre: 'Tumor',
    latinNombre: 'Hinchazón / Edema',
    icono: '💧',
    color: '#3498db',
    resumen: 'Aumento de permeabilidad vascular → proteínas y fluido salen al tejido',
    mecanismo: 'La histamina, bradiquinina y el factor activador de plaquetas (PAF) contraen las células endoteliales, abriendo "espacios" entre ellas. Por estos huecos salen al espacio intersticial: plasma (agua + electrolitos), proteínas del complemento y anticuerpos. Esto forma el edema. El propósito: llevar anticuerpos y proteínas de defensa directamente al foco infeccioso.',
  },
  {
    id: 'dolor',
    nombre: 'Dolor',
    latinNombre: 'Dolor',
    icono: '😣',
    color: '#9b59b6',
    resumen: 'Mediadores inflamatorios (bradiquinina, prostaglandinas) sensibilizan los nociceptores',
    mecanismo: 'La bradiquinina activa directamente los nociceptores (receptores del dolor). Las prostaglandinas (PGE2) bajan el umbral de activación de estos receptores: el tejido se vuelve hipersensible al dolor (hiperalgesia) y cualquier estímulo normal se percibe como doloroso (alodinia). Los AINEs (ibuprofeno, aspirina) actúan aquí bloqueando la enzima COX que fabrica prostaglandinas.',
  },
  {
    id: 'impotencia',
    nombre: 'Functio laesa',
    latinNombre: 'Impotencia funcional',
    icono: '🚫',
    color: '#7f8c8d',
    resumen: 'Mecanismo protector para limitar el daño mientras se repara',
    mecanismo: 'La combinación de dolor + edema + calor limita el movimiento del tejido dañado. Este "quinto signo", descrito por Galeno (Virchow lo incorporó formalmente), es en realidad un mecanismo de protección inteligente: inmovilizar la zona permite que los procesos de reparación actúen sin interrupciones mecánicas. Ignorar esta señal puede empeorar la lesión.',
  },
];

// ─────────────────────────────────────────────
// Datos: células protagonistas
// ─────────────────────────────────────────────

interface CelulaInflamacion {
  nombre: string;
  icono: string;
  color: string;
  funcion: string;
  llegada: string;
  libera: string;
  curiosidad: string;
}

const CELULAS: CelulaInflamacion[] = [
  {
    nombre: 'Mastocitos',
    icono: '🟣',
    color: '#8e44ad',
    funcion: 'Primeros en activarse. Centinelas residentes en tejidos. Reconocen el daño en segundos.',
    llegada: 'Ya están en el tejido — no necesitan llegar',
    libera: 'Histamina, heparina, TNF-α, IL-4, leucotrienos. Lanzan el "disparo de salida" de la inflamación.',
    curiosidad: 'Los mastocitos activados pueden desgranularse (liberar su contenido) en milisegundos. Son responsables también de las reacciones alérgicas cuando se activan erróneamente.',
  },
  {
    nombre: 'Neutrófilos',
    icono: '⚪',
    color: '#7f8c8d',
    funcion: 'Soldados de primera línea. Fagocitan patógenos, liberan enzimas destructivas y forman NETs (trampas extracelulares de neutrófilos).',
    llegada: '6-12 horas tras el inicio. Los más abundantes (60-70 % de leucocitos circulantes).',
    libera: 'Especies reactivas de oxígeno (ROS), elastasa, MPO, IL-8 (que llama a más neutrófilos).',
    curiosidad: 'Los neutrófilos tienen una vida media de solo 6-8 horas en sangre. Los restos de neutrófilos muertos forman el pus. Un absceso es básicamente una batalla ganada por los neutrófilos.',
  },
  {
    nombre: 'Macrófagos',
    icono: '🟤',
    color: '#e67e22',
    funcion: 'Limpiadores y coordinadores. Fagocitan hasta 100 bacterias. Presentan antígenos. Coordinan la resolución o perpetuación de la respuesta.',
    llegada: '24-48 horas. Reemplazan a los neutrófilos como células dominantes.',
    libera: 'M1 (proinflamatorio): IL-1β, IL-6, TNF-α, IL-12. M2 (antiinflamatorio/reparador): IL-10, TGF-β, factores de crecimiento.',
    curiosidad: 'Los macrófagos existen en dos "modos": M1 (ataque) y M2 (reparación). La transición M1→M2 es clave para resolver la inflamación. En inflamación crónica, el switch M1→M2 falla.',
  },
  {
    nombre: 'Linfocitos T',
    icono: '🟢',
    color: '#27ae60',
    funcion: 'Inteligencia estratégica. Coordinan la respuesta específica. En inflamación crónica, algunos subtipos (Th1, Th17) pueden perpetuar o amplificar el daño.',
    llegada: '72+ horas. Predominan en inflamación crónica.',
    libera: 'IFN-γ (Th1, activa macrófagos M1), IL-17 (Th17, recruta neutrófilos), IL-4/IL-5 (Th2, activa eosinófilos). Treg: IL-10, TGF-β (antiinflamatorio).',
    curiosidad: 'Los linfocitos T reguladores (Treg) son los "árbitros" de la inflamación: suprimen respuestas excesivas. Una deficiencia de Treg se asocia con enfermedades autoinmunes y alergia.',
  },
];

// ─────────────────────────────────────────────
// Datos: factores amplificadores
// ─────────────────────────────────────────────

interface FactorAmplificador {
  icono: string;
  titulo: string;
  mecanismo: string;
}

const FACTORES: FactorAmplificador[] = [
  {
    icono: '🚬',
    titulo: 'Tabaco',
    mecanismo: 'Los componentes del humo activan continuamente los macrófagos alveolares e inhiben la resolución de la inflamación. Aumenta IL-6, TNF-α y PCR sistémica.',
  },
  {
    icono: '🍔',
    titulo: 'Dieta ultraprocesada',
    mecanismo: 'Los ácidos grasos trans y los azúcares refinados activan NF-κB, el interruptor molecular maestro de la inflamación. El exceso de omega-6 favorece síntesis de prostaglandinas proinflamatorias.',
  },
  {
    icono: '😴',
    titulo: 'Falta de sueño',
    mecanismo: 'Dormir menos de 6-7 horas aumenta IL-6 y TNF-α. Durante el sueño, el sistema glinfático limpia residuos inflamatorios del cerebro. Sin descanso, se acumulan.',
  },
  {
    icono: '😰',
    titulo: 'Estrés crónico',
    mecanismo: 'El cortisol en exceso produce resistencia a los glucocorticoides: las células inmunes dejan de responder a su señal antiinflamatoria. Paradójicamente, el estrés crónico activa en lugar de frenar la inflamación.',
  },
  {
    icono: '🏋️',
    titulo: 'Sedentarismo',
    mecanismo: 'El tejido adiposo visceral acumulado secreta adipocinas proinflamatorias (leptina, IL-6, TNF-α). El ejercicio moderado, en cambio, libera IL-6 muscular con efecto antiinflamatorio.',
  },
  {
    icono: '💊',
    titulo: 'Microbioma alterado',
    mecanismo: 'La disbiosis intestinal aumenta la permeabilidad de la pared intestinal ("intestino permeable"). Fragmentos de bacterias (LPS, lipopolisacárido) pasan a sangre y activan receptores TLR4 en macrófagos, generando inflamación sistémica de bajo grado.',
  },
];

// ─────────────────────────────────────────────
// Sección 1: Los 5 signos clásicos
// ─────────────────────────────────────────────

function SeccionSignos() {
  const [signoAbierto, setSignoAbierto] = useState<string | null>(null);

  const toggle = (id: string) => {
    setSignoAbierto(prev => (prev === id ? null : id));
  };

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          Aulo Cornelio Celso describió los primeros 4 signos en el siglo I d.C.
          Galeno añadió el 5.º. Dos mil años después, la bioquímica moderna explica
          por qué tienen sentido a nivel molecular.
        </p>
      </div>

      <div className={styles.signosGrid}>
        {SIGNOS.map((s) => {
          const abierto = signoAbierto === s.id;
          return (
            <div
              key={s.id}
              className={`${styles.signoCard} ${abierto ? styles.signoAbierto : ''}`}
              style={{ borderLeftColor: s.color }}
            >
              <button
                type="button"
                className={styles.signoCabecera}
                onClick={() => toggle(s.id)}
                aria-expanded={abierto}
                aria-controls={`mecanismo-${s.id}`}
              >
                <span className={styles.signoIcono} aria-hidden="true">{s.icono}</span>
                <div className={styles.signoTextos}>
                  <strong className={styles.signoNombre} style={{ color: s.color }}>
                    {s.nombre}
                  </strong>
                  <span className={styles.signoLatino}>{s.latinNombre}</span>
                  <span className={styles.signoResumen}>{s.resumen}</span>
                </div>
                <span className={styles.signoChevron} aria-hidden="true">
                  {abierto ? '▲' : '▼'}
                </span>
              </button>

              {abierto && (
                <div id={`mecanismo-${s.id}`} className={styles.signoDetalle}>
                  <p className={styles.signoMecanismo}>{s.mecanismo}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.insight}>
        <p>
          Estos 5 signos no son "errores" del cuerpo: son señales coordinadas que
          traen células defensoras, anticuerpos y nutrientes precisamente donde se
          necesitan. El dolor y la hinchazón son mensajeros, no enemigos.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Aguda vs Crónica
// ─────────────────────────────────────────────

type TipoInflamacion = 'aguda' | 'cronica';

function SeccionComparativa() {
  const [activa, setActiva] = useState<TipoInflamacion>('aguda');

  const datos = {
    aguda: {
      color: '#27ae60',
      colorBg: 'rgba(39,174,96,0.08)',
      etiqueta: 'Protectora',
      filas: [
        { campo: 'Duración', valor: 'Horas a días' },
        { campo: 'Trigger', valor: 'Infección, herida, cuerpo extraño' },
        { campo: 'Células protagonistas', valor: 'Neutrófilos (6-12h), macrófagos M1 (24-48h)' },
        { campo: 'Objetivo', valor: 'Eliminar el agente dañino y preparar la reparación' },
        { campo: 'Resolución', valor: 'Lipoxinas y resolvinas apagan la respuesta cuando el trigger desaparece' },
        { campo: 'Resultado', valor: '✅ Curación del tejido' },
      ],
    },
    cronica: {
      color: '#e74c3c',
      colorBg: 'rgba(231,76,60,0.08)',
      etiqueta: 'Dañina',
      filas: [
        { campo: 'Duración', valor: 'Meses a años' },
        { campo: 'Trigger', valor: 'Agente no eliminado (infección crónica, autoinmunidad) o fallo en la resolución' },
        { campo: 'Células protagonistas', valor: 'Macrófagos M1 persistentes, linfocitos Th1/Th17, células dendríticas' },
        { campo: 'Daño colateral', valor: 'El tejido sano propio es dañado por ROS, proteasas y citocinas' },
        { campo: 'Procesos asociados', valor: 'Artritis reumatoide, aterosclerosis, diabetes tipo 2, neurodegeneración (contexto fisiológico)' },
        { campo: 'Resultado', valor: '⚠️ Daño tisular acumulativo' },
      ],
    },
  };

  const d = datos[activa];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          La inflamación aguda es <strong>aliada</strong>; la crónica es <strong>enemiga</strong>.
          La diferencia no está en los mecanismos (son los mismos) sino en si el cuerpo
          consigue <strong>resolver y apagar</strong> la respuesta o no.
        </p>
      </div>

      {/* Selector tipo */}
      <div className={styles.tipoSelector} role="group" aria-label="Tipo de inflamación">
        <button
          type="button"
          className={`${styles.tipoBtn} ${activa === 'aguda' ? styles.tipoBtnActivo : ''}`}
          style={activa === 'aguda' ? { background: datos.aguda.color, borderColor: datos.aguda.color } : { borderColor: datos.aguda.color, color: datos.aguda.color }}
          onClick={() => setActiva('aguda')}
          aria-pressed={activa === 'aguda'}
        >
          <span aria-hidden="true">🟢</span>
          <span>Inflamación aguda</span>
          <span className={styles.tipoBadge}>Protectora</span>
        </button>
        <button
          type="button"
          className={`${styles.tipoBtn} ${activa === 'cronica' ? styles.tipoBtnActivo : ''}`}
          style={activa === 'cronica' ? { background: datos.cronica.color, borderColor: datos.cronica.color } : { borderColor: datos.cronica.color, color: datos.cronica.color }}
          onClick={() => setActiva('cronica')}
          aria-pressed={activa === 'cronica'}
        >
          <span aria-hidden="true">🔴</span>
          <span>Inflamación crónica</span>
          <span className={styles.tipoBadge}>Dañina</span>
        </button>
      </div>

      {/* Tabla de detalles */}
      <div
        className={styles.comparativaPanel}
        style={{ borderColor: d.color, background: d.colorBg }}
      >
        <div className={styles.comparativaHeader} style={{ background: d.color }}>
          <h3 className={styles.comparativaTitulo}>
            Inflamación {activa === 'aguda' ? 'Aguda' : 'Crónica'} — {d.etiqueta}
          </h3>
        </div>
        <table className={styles.comparativaTabla}>
          <tbody>
            {d.filas.map((f, i) => (
              <tr key={i} className={styles.comparativaFila}>
                <th className={styles.comparativaCampo} style={{ color: d.color }}>{f.campo}</th>
                <td className={styles.comparativaValor}>{f.valor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista doble columna lateral */}
      <h3 className={styles.subSeccionTitulo}>Comparativa rápida</h3>
      <div className={styles.comparativaDoble}>
        <div className={styles.comparativaCol} style={{ borderTopColor: datos.aguda.color }}>
          <h4 className={styles.comparativaColTitulo} style={{ color: datos.aguda.color }}>Aguda ✅</h4>
          <ul className={styles.comparativaLista}>
            <li>Trigger claro y controlable</li>
            <li>Neutrófilos como vanguardia</li>
            <li>Resolución activa (lipoxinas)</li>
            <li>Termina en días</li>
            <li>Deja tejido reparado</li>
          </ul>
        </div>
        <div className={styles.comparativaCol} style={{ borderTopColor: datos.cronica.color }}>
          <h4 className={styles.comparativaColTitulo} style={{ color: datos.cronica.color }}>Crónica ⚠️</h4>
          <ul className={styles.comparativaLista}>
            <li>Trigger persistente o inmunológico</li>
            <li>Macrófagos M1 bloqueados</li>
            <li>Fallo en la resolución</li>
            <li>Dura meses o años</li>
            <li>Daño tisular acumulativo</li>
          </ul>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          La diferencia clave es la <strong>resolución activa</strong>: en la inflamación aguda,
          los macrófagos M2 y las resolvinas &ldquo;apagan el incendio&rdquo;. En la crónica,
          ese mecanismo de extinción falla o está desbordado.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Células protagonistas
// ─────────────────────────────────────────────

function SeccionCelulas() {
  const [celulaActiva, setCelulaActiva] = useState<number>(0);
  const c = CELULAS[celulaActiva];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          La respuesta inflamatoria es una <strong>coreografía celular</strong>: cada tipo de célula
          aparece en el momento correcto, hace su trabajo y cede el paso. Aquí están los protagonistas.
        </p>
      </div>

      {/* Selector de células */}
      <div className={styles.celulasNav} role="group" aria-label="Seleccionar célula">
        {CELULAS.map((cel, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.celulaBtn} ${celulaActiva === i ? styles.celulaBtnActiva : ''}`}
            style={celulaActiva === i ? { background: cel.color, borderColor: cel.color } : { borderColor: cel.color, color: cel.color }}
            onClick={() => setCelulaActiva(i)}
            aria-pressed={celulaActiva === i}
          >
            <span aria-hidden="true">{cel.icono}</span>
            <span className={styles.celulaBtnNombre}>{cel.nombre}</span>
          </button>
        ))}
      </div>

      {/* Detalle de célula seleccionada */}
      <div className={styles.celulaDetalle} style={{ borderLeftColor: c.color }}>
        <div className={styles.celulaHeader}>
          <span className={styles.celulaIconoGrande} aria-hidden="true">{c.icono}</span>
          <div>
            <h3 className={styles.celulaNombre} style={{ color: c.color }}>{c.nombre}</h3>
          </div>
        </div>
        <dl className={styles.celulaData}>
          <dt className={styles.celulaDt}>Función</dt>
          <dd className={styles.celulaDd}>{c.funcion}</dd>
          <dt className={styles.celulaDt}>Cuándo aparece</dt>
          <dd className={styles.celulaDd}>{c.llegada}</dd>
          <dt className={styles.celulaDt}>Qué libera</dt>
          <dd className={styles.celulaDd}>{c.libera}</dd>
          <dt className={styles.celulaDt}>Curiosidad</dt>
          <dd className={`${styles.celulaDd} ${styles.celulaCuriosidad}`}>{c.curiosidad}</dd>
        </dl>
      </div>

      {/* Línea temporal */}
      <h3 className={styles.subSeccionTitulo}>Cronología celular de la respuesta aguda</h3>
      <div className={styles.timeline}>
        {[
          { tiempo: '0 h', color: '#8e44ad', icono: '🟣', label: 'Mastocitos', desc: 'Desgranulación → histamina → vasodilatación inmediata' },
          { tiempo: '6-12 h', color: '#7f8c8d', icono: '⚪', label: 'Neutrófilos', desc: 'Migración masiva → fagocitosis de patógenos' },
          { tiempo: '24-48 h', color: '#e67e22', icono: '🟤', label: 'Macrófagos M1', desc: 'Relevo de neutrófilos → fagocitosis + presentación antigénica' },
          { tiempo: '72+ h', color: '#27ae60', icono: '🟢', label: 'Linfocitos T/B', desc: 'Respuesta adaptativa específica → anticuerpos' },
          { tiempo: 'Resolución', color: '#2E86AB', icono: '✅', label: 'Macrófagos M2', desc: 'Switch antiinflamatorio → lipoxinas, resolvinas → curación' },
        ].map((paso, i) => (
          <div key={i} className={styles.timelinePaso}>
            <div className={styles.timelineIndicador}>
              <div className={styles.timelineDot} style={{ background: paso.color }} />
              {i < 4 && <div className={styles.timelineLinea} />}
            </div>
            <div className={styles.timelineContenido}>
              <span className={styles.timelineTiempo} style={{ color: paso.color }}>{paso.tiempo}</span>
              <strong className={styles.timelineCelula}>
                <span aria-hidden="true">{paso.icono}</span> {paso.label}
              </strong>
              <p className={styles.timelineDesc}>{paso.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          El proceso es tan coordinado que los neutrófilos muertos liberan señales que
          &ldquo;invitan&rdquo; a los macrófagos. Y los macrófagos que fagocitan neutrófilos apoptóticos
          (efferocitosis) cambian a perfil M2, iniciando la reparación.
          La muerte de los soldados activa a los constructores.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Factores amplificadores
// ─────────────────────────────────────────────

function SeccionFactores() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          Estos 6 factores no <em>causan</em> inflamación directamente, pero
          <strong> impiden que el cuerpo la apague</strong>. Actúan como leña en
          un fuego que debería haberse extinguido.
        </p>
      </div>

      <div className={styles.factoresGrid}>
        {FACTORES.map((f, i) => (
          <div key={i} className={styles.factorCard}>
            <div className={styles.factorHeader}>
              <span className={styles.factorIcono} aria-hidden="true">{f.icono}</span>
              <h4 className={styles.factorTitulo}>{f.titulo}</h4>
            </div>
            <p className={styles.factorMecanismo}>{f.mecanismo}</p>
          </div>
        ))}
      </div>

      {/* Warning box */}
      <div className={styles.warningBox}>
        <p>
          <strong>⚖️ La inflamación no es el enemigo:</strong> la respuesta inflamatoria
          aguda es esencial para sobrevivir a infecciones y reparar lesiones. El problema
          es la inflamación crónica de bajo grado, que el cuerpo no sabe apagar. Los hábitos
          de vida son el factor más modificable para mantenerla bajo control.
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          Los marcadores de inflamación sistémica (PCR, IL-6) se pueden medir en sangre.
          Los valores elevados de forma crónica se asocian con mayor riesgo de enfermedades
          cardiovasculares, metabólicas y neurodegenerativas — aunque la relación es compleja
          y no necesariamente causal.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorInflamacionPage() {
  const [tabActiva, setTabActiva] = useState<TabPrincipal>('signos');

  const renderTab = () => {
    switch (tabActiva) {
      case 'signos': return <SeccionSignos />;
      case 'comparativa': return <SeccionComparativa />;
      case 'celulas': return <SeccionCelulas />;
      case 'factores': return <SeccionFactores />;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>La Inflamación</h1>
          <p className={styles.subtitle}>Aliada y Enemiga del Cuerpo — Mecanismo celular de la respuesta inflamatoria aguda y crónica</p>
        </header>

        <LegalNotice />

        {/* Navegación por tabs */}
        <nav className={styles.navTabs} aria-label="Secciones del explicador">
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              className={`${styles.navBtn} ${tabActiva === t.id ? styles.navActivo : ''}`}
              onClick={() => setTabActiva(t.id)}
              aria-pressed={tabActiva === t.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{t.icono}</span>
              <span className={styles.navTexto}>{t.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera de sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            {TABS.find(t => t.id === tabActiva)?.icono}{' '}
            {TABS.find(t => t.id === tabActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>
            {TABS.find(t => t.id === tabActiva)?.subtitulo}
          </p>
        </div>

        {renderTab()}

        <EducationalSection
          title="Más sobre la inflamación"
          subtitle="Preguntas frecuentes, tabla resumen y cronología del proceso agudo"
          defaultOpen={false}
        >
          {/* Tabla resumen */}
          <h3>Tabla resumen: aguda vs crónica</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.tablaEdu}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Duración</th>
                  <th>Células protagonistas</th>
                  <th>Mediadores clave</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Aguda</strong></td>
                  <td>Horas – días</td>
                  <td>Neutrófilos, macrófagos M1</td>
                  <td>Histamina, bradiquinina, PGE2, IL-1β, TNF-α</td>
                  <td>✅ Curación</td>
                </tr>
                <tr>
                  <td><strong>Crónica</strong></td>
                  <td>Meses – años</td>
                  <td>Macrófagos M1, linfocitos Th1/Th17</td>
                  <td>IL-6, TNF-α, IL-17, IFN-γ, ROS</td>
                  <td>⚠️ Daño tisular</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Preguntas frecuentes */}
          <h3>Preguntas frecuentes</h3>

          <h4>¿Tomar antiinflamatorios siempre es bueno?</h4>
          <p>
            No necesariamente. Los AINEs (ibuprofeno, aspirina) inhiben la COX-1 y COX-2, bloqueando prostaglandinas.
            En inflamación aguda excesiva son útiles para controlar el dolor y la hinchazón, pero bloquear
            la inflamación demasiado pronto puede <strong>retrasar la reparación tisular</strong>. El uso crónico
            tiene efectos adversos gastrointestinales y cardiovasculares. Siempre bajo criterio médico.
          </p>

          <h4>¿La fiebre es inflamación?</h4>
          <p>
            La fiebre es una <em>consecuencia</em> de la inflamación sistémica, no la inflamación en sí.
            Las citocinas proinflamatorias (IL-1β, IL-6, TNF-α) actúan sobre el hipotálamo y elevan el punto
            de ajuste térmico. Es un mecanismo <strong>adaptativo</strong>: muchos patógenos se replican
            peor a 38-39 °C. La fiebre moderada (hasta ~38,5 °C en adultos) generalmente no requiere tratamiento.
          </p>

          <h4>¿Qué son las citocinas?</h4>
          <p>
            Son proteínas de señalización que las células inmunes usan para comunicarse. Las hay
            proinflamatorias (IL-1β, IL-6, TNF-α, IL-17) y antiinflamatorias (IL-10, TGF-β).
            Actúan en concentraciones muy bajas (nanomolar) y a corta distancia (paracrina) o
            larga distancia (endocrina). Las &ldquo;tormentas de citocinas&rdquo; (como las vistas en COVID-19
            grave) son una activación descontrolada de estas señales.
          </p>

          <h4>¿Se puede medir la inflamación con un análisis?</h4>
          <p>
            Sí, hay varios marcadores. La <strong>PCR (proteína C reactiva)</strong> sube rápido en
            inflamación aguda. La <strong>PCR ultrasensible (PCR-us)</strong> detecta inflamación crónica
            de bajo grado. La <strong>VSG (velocidad de sedimentación)</strong> es inespecífica pero útil.
            La <strong>IL-6</strong> y el <strong>fibrinógeno</strong> se usan en contextos específicos.
            Un análisis puntual no determina si tienes inflamación crónica — se necesitan valores repetidos
            y contexto clínico.
          </p>

          <h4>¿El frío en una lesión reduce la inflamación?</h4>
          <p>
            El hielo (crioterapia) reduce el dolor y el edema localmente al causar vasoconstricción
            y bajar el metabolismo celular. Sin embargo, la evidencia reciente sugiere que puede
            <strong> retrasar la reparación muscular</strong> si se aplica durante demasiado tiempo,
            porque también inhibe los macrófagos M2 reparadores. La recomendación actual es
            hielo breve (10-15 min) para el dolor, no para eliminar la inflamación en sí.
          </p>

          {/* Cronología */}
          <h3>5 pasos del proceso inflamatorio agudo</h3>
          <ol className={styles.cronologiaLista}>
            <li><strong>0 h — Daño/trigger:</strong> tejido dañado o patógeno detectado. Los mastocitos se desgranulan → histamina → vasodilatación y permeabilidad vascular aumentan en segundos.</li>
            <li><strong>1-6 h — Reclutamiento de neutrófilos:</strong> IL-8 y selectinas guían a los neutrófilos desde la sangre hasta el tejido (diapédesis). Fagocitosis masiva de bacterias.</li>
            <li><strong>6-24 h — Pico de respuesta aguda:</strong> los 5 signos clásicos son máximos. Monocitos empiezan a diferenciarse en macrófagos M1 en el tejido.</li>
            <li><strong>24-72 h — Resolución o cronificación:</strong> si el trigger se elimina, los macrófagos M2 liberan lipoxinas y resolvinas. Los neutrófilos muertos son fagocitados (efferocitosis). Si el trigger persiste → cronicidad.</li>
            <li><strong>Resolución (días) — Reparación:</strong> fibroblastos reconstituyen la matriz extracelular. En piel, cicatrización. El tejido recupera su función. La inflamación se apaga silenciosamente.</li>
          </ol>

          <div className={styles.warningBox}>
            <strong>Nota educativa:</strong> este explicador simplifica conceptos de inmunología
            y fisiología con fines didácticos. La biología real es enormemente más compleja.
            Para cualquier duda sobre tu salud, consulta siempre con un profesional sanitario.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-inflamacion')} />
        <ShareCard appName="visualizador-inflamacion" />
        <Footer appName="visualizador-inflamacion" />
      </div>
    </>
  );
}
