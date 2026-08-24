'use client';

import { useState } from 'react';
import styles from './MetabolismoAlcohol.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  DisclaimerCard,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ───────────────────────────────────────────
type TabId = 'ruta' | 'organos' | 'aldh2' | 'cerebro';
type OrganoId = 'higado' | 'boca' | 'estomago' | 'cerebro';

interface PasoMetabolico {
  numero: number;
  reactivo: string;
  enzima: string;
  producto: string;
  icono: string;
  descripcion: string;
  peligro: boolean;
}

interface OrganoInfo {
  id: OrganoId;
  nombre: string;
  icono: string;
  color: string;
  mecanismo: string;
  acetaldehido: string;
  consecuencias: string[];
  datosClave: string;
}

interface EfectoALDH2 {
  porcentaje: string;
  poblacion: string;
  descripcion: string;
  riesgo: string;
  color: string;
}

// ─── Datos ───────────────────────────────────────────
const PASOS_METABOLICOS: PasoMetabolico[] = [
  {
    numero: 1,
    reactivo: 'Etanol (alcohol)',
    enzima: 'ADH (Alcohol Deshidrogenasa)',
    producto: 'Acetaldehído',
    icono: '🍷',
    descripcion: 'La enzima ADH, presente principalmente en el hígado (y en menor cantidad en el estómago y mucosa intestinal), oxida el etanol a acetaldehído. Por cada molécula de etanol se consume una de NAD+, generando NADH. La acumulación de NADH altera el metabolismo normal de la célula hepática.',
    peligro: true,
  },
  {
    numero: 2,
    reactivo: 'Acetaldehído',
    enzima: 'ALDH2 (Aldehído Deshidrogenasa 2)',
    producto: 'Acetato',
    icono: '⚠️',
    descripcion: 'El acetaldehído es el metabolito más tóxico. La enzima ALDH2 (localizada en las mitocondrias hepáticas) lo convierte en acetato, relativamente inocuo. Si ALDH2 se satura o es deficiente (mutación ALDH2*2), el acetaldehído se acumula en sangre y tejidos, causando daño directo al ADN y a las proteínas.',
    peligro: true,
  },
  {
    numero: 3,
    reactivo: 'Acetato',
    enzima: 'Acetil-CoA sintetasa',
    producto: 'Acetil-CoA → CO₂ + H₂O',
    icono: '✅',
    descripcion: 'El acetato pasa a la sangre y se distribuye a tejidos periféricos (músculo, corazón, cerebro) donde se convierte en Acetil-CoA y entra en el ciclo de Krebs. Es la fase relativamente inocua del proceso. Sin embargo, el alto ratio NADH/NAD+ persiste e interfiere con el metabolismo de la glucosa y los lípidos.',
    peligro: false,
  },
  {
    numero: 4,
    reactivo: 'Via MEOS (consumo elevado)',
    enzima: 'CYP2E1 (Citocromo P450 2E1)',
    producto: 'Acetaldehído + Radicales libres',
    icono: '🔥',
    descripcion: 'Cuando el consumo de alcohol es elevado o la ADH se satura, el sistema microsomal CYP2E1 (en el retículo endoplásmico) toma el relevo. Además de producir más acetaldehído, genera radicales libres (ROS) que causan estrés oxidativo directo en el hepatocito, acelerando el daño hepático.',
    peligro: true,
  },
];

const ORGANOS: OrganoInfo[] = [
  {
    id: 'higado',
    nombre: 'Hígado',
    icono: '🫀',
    color: '#C0392B',
    mecanismo: 'El hígado metaboliza el 90-95% del alcohol ingerido. La acumulación de NADH altera la beta-oxidación de ácidos grasos, provocando su acumulación (esteatosis). El acetaldehído forma adductos covalentes con proteínas y ADN del hepatocito, iniciando fibrosis.',
    acetaldehido: 'Concentración local máxima: es el órgano más expuesto. Los adductos proteína-acetaldehído activan células estrelladas → fibrosis → cirrosis.',
    consecuencias: [
      'Esteatosis hepática alcohólica (hígado graso): reversible si se deja de beber',
      'Hepatitis alcohólica: inflamación aguda, potencialmente grave',
      'Fibrosis: cicatrización del tejido hepático, parcialmente reversible',
      'Cirrosis: estadio final, irreversible, riesgo de hepatocarcinoma',
    ],
    datosClave: 'El hígado tarda ~1 hora en procesar una UBE (Unidad de Bebida Estándar: 10g de alcohol). No hay forma de "acelerar" este proceso.',
  },
  {
    id: 'boca',
    nombre: 'Boca y esófago',
    icono: '🦷',
    color: '#E67E22',
    mecanismo: 'Las bacterias de la microbiota oral (Streptococcus, Fusobacterium, Candida) poseen su propia ADH bacteriana: convierten el alcohol de la saliva en acetaldehído local. Este acetaldehído no pasa por el hígado: actúa directamente sobre la mucosa.',
    acetaldehido: 'Concentración en saliva tras beber: 10-100 veces mayor que en sangre. El acetaldehído salival es el principal responsable del riesgo de cáncer oral y esofágico.',
    consecuencias: [
      'Riesgo de cáncer de cavidad oral (clasificado como carcinógeno Tipo 1 por IARC)',
      'Riesgo de cáncer de esófago (especialmente en portadores de mutación ALDH2)',
      'Daño directo a la mucosa oral por acetaldehído local',
      'El alcohol de los enjuagues bucales puede contribuir si contienen etanol',
    ],
    datosClave: 'El tabaco combinado con alcohol multiplica el riesgo: la nicotina altera la microbiota oral y reduce la capacidad de reparación del ADN.',
  },
  {
    id: 'estomago',
    nombre: 'Estómago',
    icono: '🫁',
    color: '#8E44AD',
    mecanismo: 'La mucosa gástrica tiene su propia ADH, pero en menor cantidad que el hígado. El alcohol inhibe parcialmente esta ADH gástrica, permitiendo que más etanol pase al torrente sanguíneo sin ser metabolizado. Esto explica por qué el alcohol en ayunas llega más rápido y con mayor concentración al cerebro.',
    acetaldehido: 'La producción local de acetaldehído en el estómago causa irritación directa de la mucosa gástrica. Las bebidas fermentadas (vino, cerveza) contienen también acetaldehído preformado.',
    consecuencias: [
      'Gastritis aguda: irritación e inflamación de la mucosa',
      'Úlceras gástricas en consumo crónico',
      'Inhibición de la ADH gástrica: las mujeres tienen menor actividad ADH gástrica (mayor vulnerabilidad)',
      'Náuseas y vómitos: respuesta protectora ante concentraciones elevadas',
    ],
    datosClave: 'Comer antes de beber reduce la velocidad de absorción (dilución + la ADH gástrica actúa más tiempo) y disminuye el pico de acetaldehído.',
  },
  {
    id: 'cerebro',
    nombre: 'Cerebro',
    icono: '🧠',
    color: '#2E86AB',
    mecanismo: 'El etanol cruza la barrera hematoencefálica con facilidad. Potencia los receptores GABA-A (inhibe la actividad neuronal) y bloquea los receptores NMDA (glutamato, principal excitador). El acetaldehído también puede cruzar parcialmente la BBB y formar condensación con dopamina → tetrahidroisoquinolinas (posibles adicción).',
    acetaldehido: 'Las concentraciones cerebrales de acetaldehído son bajas pero suficientes para interferir con neurotransmisores. La interacción acetaldehído-dopamina es una de las hipótesis sobre el desarrollo de la dependencia alcohólica.',
    consecuencias: [
      'Sedación y desinhibición: potenciación GABA, bloqueo NMDA',
      'Tolerancia: downregulation de receptores GABA-A con el consumo crónico',
      'Dependencia: el sistema se adapta al alcohol como "normal"; la abstinencia produce hiperexcitabilidad (riesgo de convulsiones)',
      'Daño neurotóxico crónico: reducción de volumen de sustancia gris, déficits de memoria (Wernicke-Korsakoff por déficit de tiamina)',
    ],
    datosClave: 'El síndrome de abstinencia alcohólica puede ser potencialmente mortal (delirium tremens). A diferencia de otras drogas, la retirada brusca del alcohol requiere supervisión médica.',
  },
];

const EFECTOS_ALDH2: EfectoALDH2[] = [
  {
    porcentaje: '~85%',
    poblacion: 'ALDH2 normal (dos copias funcionales)',
    descripcion: 'Metabolizan el acetaldehído con eficiencia normal. El riesgo de cáncer existe pero es menor que en portadores de la mutación.',
    riesgo: 'Riesgo basal',
    color: '#27AE60',
  },
  {
    porcentaje: '~15% europeos / ~50% asiáticos orientales',
    poblacion: 'ALDH2*2 heterocigoto (una copia deficiente)',
    descripcion: 'La enzima ALDH2 funciona al 25-30% de su capacidad. El acetaldehído se acumula más rápido. Síntomas: enrojecimiento facial (flush), taquicardia, náuseas, cefalea. El riesgo de cáncer esofágico al beber es significativamente mayor.',
    riesgo: 'Riesgo elevado de cáncer',
    color: '#E67E22',
  },
  {
    porcentaje: '~5-8% asiáticos orientales',
    poblacion: 'ALDH2*2 homocigoto (dos copias deficientes)',
    descripcion: 'ALDH2 prácticamente inactiva. El acetaldehído se acumula masivamente. Los síntomas son tan intensos que la mayoría no puede consumir alcohol con regularidad. Paradójicamente, esto reduce la exposición acumulada.',
    riesgo: 'Máximo riesgo si beben',
    color: '#DC2626',
  },
];

// ─── Componente principal ─────────────────────────────
export default function MetabolismoAlcoholPage() {
  const [tabActiva, setTabActiva] = useState<TabId>('ruta');
  const [organoSeleccionado, setOrganoSeleccionado] = useState<OrganoId>('higado');

  const tabs: { id: TabId; label: string; icono: string }[] = [
    { id: 'ruta', label: 'Ruta metabólica', icono: '🔬' },
    { id: 'organos', label: 'Órganos afectados', icono: '🫀' },
    { id: 'aldh2', label: 'Variante ALDH2', icono: '🧬' },
    { id: 'cerebro', label: 'Cerebro y adicción', icono: '🧠' },
  ];

  const organoActual = ORGANOS.find(o => o.id === organoSeleccionado) ?? ORGANOS[0];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🍷</div>
        <h1>Metabolismo del Alcohol</h1>
        <p>Del etanol al acetaldehído: por qué el metabolito intermedio es el verdadero responsable del daño</p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="medical"
        severity="high"
        collapsible={false}
        context="visualizador-metabolismo-alcohol"
      >
        <p>
          Este visualizador explica <strong>mecanismos fisiológicos</strong> del metabolismo del alcohol
          con fines educativos. No constituye consejo médico, nutricional ni recomendación sobre consumo.
        </p>
        <p>
          <strong>El alcohol etílico es una sustancia adictiva y carcinógena.</strong> La Agencia Internacional
          para la Investigación del Cáncer (IARC) clasifica el alcohol como carcinógeno del Grupo 1 (evidencia
          suficiente en humanos). Si tienes dudas sobre tu consumo de alcohol, consulta con un profesional sanitario.
        </p>
        <p>
          <strong>TÚ ERES RESPONSABLE</strong> de consultar con un profesional antes de actuar sobre esta
          información. <strong>meskeIA no ejerce actividades sanitarias reguladas y no se responsabiliza
          de las consecuencias derivadas del uso de esta herramienta.</strong>
        </p>
      </DisclaimerCard>

      {/* Navegación tabs */}
      <nav className={styles.tabs} aria-label="Secciones del visualizador">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${tabActiva === tab.id ? styles.tabActiva : ''}`}
            onClick={() => setTabActiva(tab.id)}
            aria-pressed={tabActiva === tab.id}
          >
            <span aria-hidden="true">{tab.icono}</span> {tab.label}
          </button>
        ))}
      </nav>

      {/* TAB: Ruta metabólica */}
      {tabActiva === 'ruta' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Ruta metabólica del etanol</h2>
          <p className={styles.seccionSubtitulo}>
            El alcohol se metaboliza en dos pasos principales. El primero produce el metabolito más peligroso.
          </p>

          <div className={styles.rutaFlujo}>
            {PASOS_METABOLICOS.map((paso, i) => (
              <div key={paso.numero} className={styles.rutaGrupo}>
                <div className={`${styles.pasoCaja} ${paso.peligro ? styles.pasoPeligro : styles.pasoSeguro}`}>
                  <div className={styles.pasoNumero}>{paso.numero}</div>
                  <div className={styles.pasoContent}>
                    <div className={styles.pasoReaccion}>
                      <span className={styles.pasoReactivo}>{paso.reactivo}</span>
                      <span className={styles.pasoEnzima}>─ {paso.enzima} ─▶</span>
                      <span className={styles.pasoProducto}>{paso.producto}</span>
                    </div>
                    <div className={styles.pasoIcono} aria-hidden="true">{paso.icono}</div>
                    <p className={styles.pasoDesc}>{paso.descripcion}</p>
                  </div>
                </div>
                {i < PASOS_METABOLICOS.length - 1 && (
                  <div className={styles.rutaConector} aria-hidden="true">↓</div>
                )}
              </div>
            ))}
          </div>

          <div className={styles.warningBox}>
            <strong><span aria-hidden="true">⚠️</span> El acetaldehído es un carcinógeno Tipo 1 (IARC):</strong> Forma adductos covalentes
            con el ADN celular, causando mutaciones. No existe un &ldquo;umbral seguro&rdquo; conocido.
            El daño es acumulativo con cada exposición.
          </div>

          <div className={styles.infoBox}>
            <strong><span aria-hidden="true">💡</span> Ratio NADH/NAD+:</strong> Por cada gramo de alcohol metabolizado, se consume
            NAD+ y se produce NADH. Este desequilibrio altera el metabolismo de la glucosa (hipoglucemia),
            los lípidos (acumulación grasa) y el lactato. Es la razón por la que el alcohol &ldquo;roba&rdquo;
            el metabolismo normal del hígado.
          </div>
        </section>
      )}

      {/* TAB: Órganos afectados */}
      {tabActiva === 'organos' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>El acetaldehído, un tóxico multi-órgano</h2>
          <p className={styles.seccionSubtitulo}>
            El acetaldehído no se queda en el hígado: circula por la sangre y las bacterias de la boca
            lo producen directamente. Selecciona un órgano para ver su mecanismo.
          </p>

          <div className={styles.organosSelector} role="group" aria-label="Seleccionar órgano">
            {ORGANOS.map(organo => (
              <button
                key={organo.id}
                type="button"
                className={`${styles.organoBtn} ${organoSeleccionado === organo.id ? styles.organoBtnActivo : ''}`}
                style={organoSeleccionado === organo.id ? { borderColor: organo.color, backgroundColor: organo.color + '18' } : {}}
                onClick={() => setOrganoSeleccionado(organo.id)}
                aria-pressed={organoSeleccionado === organo.id}
              >
                <span aria-hidden="true">{organo.icono}</span>
                <span>{organo.nombre}</span>
              </button>
            ))}
          </div>

          <div className={styles.organoDetalle} style={{ borderLeftColor: organoActual.color }}>
            <div className={styles.organoHeader}>
              <span className={styles.organoIconoGrande} aria-hidden="true">{organoActual.icono}</span>
              <h3 className={styles.organoNombre} style={{ color: organoActual.color }}>
                {organoActual.nombre}
              </h3>
            </div>

            <div className={styles.organoBloque}>
              <h4 className={styles.organoBloqueTitle}>Mecanismo principal</h4>
              <p className={styles.organoBloqueText}>{organoActual.mecanismo}</p>
            </div>

            <div className={styles.organoBloque}>
              <h4 className={styles.organoBloqueTitle}>Papel del acetaldehído</h4>
              <p className={styles.organoBloqueText}>{organoActual.acetaldehido}</p>
            </div>

            <div className={styles.organoBloque}>
              <h4 className={styles.organoBloqueTitle}>Consecuencias del consumo crónico</h4>
              <ul className={styles.organoLista}>
                {organoActual.consecuencias.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <div className={styles.datosClave}>
              <strong><span aria-hidden="true">💡</span> Dato clave:</strong> {organoActual.datosClave}
            </div>
          </div>
        </section>
      )}

      {/* TAB: Variante ALDH2 */}
      {tabActiva === 'aldh2' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>La variante ALDH2: el «efecto flus»</h2>
          <p className={styles.seccionSubtitulo}>
            Una variante genética común en Asia oriental afecta a la enzima que elimina el acetaldehído,
            con consecuencias muy concretas en la salud.
          </p>

          <div className={styles.aldh2Intro}>
            <p>
              La enzima <strong>ALDH2 (Aldehído Deshidrogenasa 2)</strong> es responsable de eliminar el
              acetaldehído. Una mutación puntual en el gen ALDH2 (variante ALDH2*2, rs671) reduce o elimina
              la actividad de la enzima. Las personas con esta variante acumulan acetaldehído más rápido al beber.
            </p>
            <p>
              El <strong>&ldquo;efecto flus&rdquo;</strong> o &ldquo;Asian flush&rdquo; (enrojecimiento facial,
              taquicardia, náuseas) es la señal visible de esa acumulación. Lo que parece una incomodidad
              menor es, en realidad, un marcador de mayor exposición a un carcinógeno.
            </p>
          </div>

          <div className={styles.aldh2Grid}>
            {EFECTOS_ALDH2.map(efecto => (
              <div key={efecto.porcentaje} className={styles.aldh2Card} style={{ borderTopColor: efecto.color }}>
                <div className={styles.aldh2Porcentaje} style={{ color: efecto.color }}>
                  {efecto.porcentaje}
                </div>
                <h3 className={styles.aldh2Poblacion}>{efecto.poblacion}</h3>
                <p className={styles.aldh2Desc}>{efecto.descripcion}</p>
                <span className={styles.aldh2Riesgo} style={{ backgroundColor: efecto.color + '20', color: efecto.color }}>
                  {efecto.riesgo}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.warningBox}>
            <strong><span aria-hidden="true">⚠️</span> El &ldquo;efecto flus&rdquo; no es solo una molestia:</strong> Los estudios muestran que
            las personas con ALDH2*2 heterocigoto que beben regularmente tienen un riesgo de cáncer esofágico
            hasta 6-10 veces mayor que la población general. El enrojecimiento es una señal de alerta biológica,
            no simplemente una predisposición a la intolerancia.
          </div>
        </section>
      )}

      {/* TAB: Cerebro y adicción */}
      {tabActiva === 'cerebro' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>El cerebro: tolerancia y dependencia</h2>

          <div className={styles.cerebroGrid}>
            <div className={styles.cerebroCard}>
              <h3>Efectos agudos: GABA y NMDA</h3>
              <p>
                El etanol actúa sobre dos sistemas principales:
              </p>
              <ul>
                <li><strong>GABA-A (inhibitorio)</strong>: el alcohol potencia su acción → sedación, ansiolisis, desinhibición. Es el mismo mecanismo de las benzodiacepinas.</li>
                <li><strong>NMDA (excitatorio)</strong>: el alcohol bloquea los receptores de glutamato → deterioro de la memoria, disartria, ataxia.</li>
              </ul>
              <p>La combinación produce los efectos conocidos del estado de embriaguez.</p>
            </div>

            <div className={styles.cerebroCard}>
              <h3>Tolerancia: el cerebro se adapta</h3>
              <p>
                Con el consumo crónico, el cerebro realiza ajustes compensatorios:
              </p>
              <ul>
                <li>Downregulation de receptores GABA-A (menos sensibles al alcohol y a benzodiacepinas)</li>
                <li>Upregulation de receptores NMDA (más excitables)</li>
                <li>Resultado: se necesita más alcohol para el mismo efecto → tolerancia</li>
              </ul>
            </div>

            <div className={styles.cerebroCard}>
              <h3>Abstinencia: el peligro del rebote</h3>
              <p>
                Cuando el alcohol desaparece, el cerebro adaptado queda <strong>hiperexcitado</strong>:
              </p>
              <ul>
                <li>GABA-A hipofuncionante sin el refuerzo del alcohol</li>
                <li>NMDA hiperactivado sin el bloqueo del alcohol</li>
                <li>Síntomas: ansiedad, insomnio, temblores, convulsiones, delirium tremens</li>
              </ul>
              <div className={styles.peligroAbstinencia}>
                <span aria-hidden="true">⚠️</span> La abstinencia alcohólica severa puede ser mortal. A diferencia de opiáceos o estimulantes,
                requiere supervisión médica.
              </div>
            </div>

            <div className={styles.cerebroCard}>
              <h3>Acetaldehído y dopamina</h3>
              <p>
                El acetaldehído puede condensarse con la dopamina para formar
                <strong> tetrahidroisoquinolinas (TIQs)</strong>, compuestos con propiedades similares a
                los opiáceos. Esto ha llevado a investigar si el acetaldehído contribuye directamente
                al desarrollo de la dependencia alcohólica, más allá del etanol en sí.
              </p>
            </div>

            <div className={styles.cerebroCard}>
              <h3>Daño crónico: Wernicke-Korsakoff</h3>
              <p>
                El consumo crónico puede causar déficit de <strong>tiamina (vitamina B1)</strong> por
                absorción intestinal reducida y dieta inadecuada. La encefalopatía de Wernicke y el
                síndrome de Korsakoff son consecuencias neurológicas graves: pérdida de memoria anterógrada,
                confabulación y, en casos severos, daño permanente al diencéfalo.
              </p>
            </div>

            <div className={styles.cerebroCard}>
              <h3>Neuroplasticidad y recuperación</h3>
              <p>
                El cerebro tiene capacidad de recuperarse parcialmente con la abstinencia. Estudios de
                neuroimagen muestran aumento del volumen de sustancia gris a los 6-12 meses de abstinencia.
                Sin embargo, algunas regiones (hipocampo, corteza prefrontal) pueden no recuperarse
                completamente en casos de dependencia grave y prolongada.
              </p>
            </div>
          </div>
        </section>
      )}

      <EducationalSection
        title="Fisiología completa del metabolismo del alcohol"
        subtitle="Bioquímica, epidemiología y mecanismos de daño tisular"
      >
        <h3>El concepto de Unidad de Bebida Estándar (UBE)</h3>
        <p>
          En España, una <strong>UBE</strong> equivale a 10 gramos de alcohol puro. Una caña (200 ml al 5%),
          un vaso de vino (100 ml al 12%) o un shot de destilado (25 ml al 40%) contienen aproximadamente
          1 UBE. El hígado necesita aproximadamente 1 hora para metabolizar cada UBE. No existe ninguna
          sustancia, alimento ni técnica que acelere este proceso.
        </p>

        <h3>¿Por qué el alcohol afecta más a las mujeres?</h3>
        <p>
          Las mujeres tienen, en promedio, menor actividad de ADH gástrica que los hombres. Esto significa
          que una mayor proporción del alcohol ingerido llega al torrente sanguíneo sin metabolizarse en el
          estómago. Además, la menor cantidad de agua corporal total concentra más el alcohol en sangre.
          Por estas razones, la misma cantidad de alcohol produce mayor impacto biológico en mujeres.
        </p>

        <h3>Alcohol y medicamentos</h3>
        <p>
          El etanol compite con muchos fármacos por el metabolismo hepático (citocromo P450). El consumo
          agudo puede inhibir el metabolismo de fármacos como el paracetamol (aumentando su toxicidad
          hepática) o las benzodiacepinas (potenciando la sedación). El consumo crónico puede inducir
          CYP2E1 y acelerar el metabolismo de algunos fármacos, reduciendo su eficacia.
        </p>

        <h3>El acetaldehído en bebidas fermentadas</h3>
        <p>
          Las bebidas fermentadas (vino, cerveza, sidra) contienen acetaldehído preformado como subproducto
          de la fermentación. En vino se describen concentraciones del orden de 10-200 mg/L y en cerveza
          bastante menores, con frecuencia entre 1 y 20 mg/L. Los rangos son amplios y no permiten predecir
          el contenido de una botella concreta: algunos estudios sitúan las medias en torno a 9 mg/L en
          cerveza, 34 mg/L en vino y 118 mg/L en vinos fortificados. Donde sí cabe esperar niveles altos es
          en los vinos deliberadamente oxidativos, como determinados estilos de jerez; que un vino sea
          espumoso no basta para suponer que tenga más.
        </p>
        <p>
          Este acetaldehído no necesita que la ADH lo fabrique, porque <em>ya es</em> acetaldehído: entra en
          contacto de forma inmediata con la mucosa de la boca, la faringe y el esófago. Eso no significa
          que llegue intacto a la sangre o al hígado, porque se metaboliza localmente y durante el primer
          paso gastrointestinal y hepático.
        </p>
        <p>
          Conviene además ponerlo a escala. Una copa de 150 ml de un vino con 50 mg/L aporta unos 7,5 mg de
          acetaldehído preformado, mientras que los aproximadamente 14 g de etanol de esa misma copa
          generarán, al metabolizarse, del orden de varios miles de miligramos. El preformado importa por
          <strong> dónde</strong> actúa —la exposición local de las mucosas, con picos breves en la saliva—
          y no por su cantidad: la exposición dominante procede del etanol.
        </p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-metabolismo-alcohol')} />
      <ShareCard appName="visualizador-metabolismo-alcohol" />
      <Footer appName="visualizador-metabolismo-alcohol" />
    </div>
  );
}
