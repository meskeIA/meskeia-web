'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorFuerzasInvisibles.module.css';
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
// Datos de las fuerzas físicas cotidianas
// ─────────────────────────────────────────────

interface FuerzaFisica {
  id: string;
  icono: string;
  nombre: string;
  color: string;
  colorClaro: string;
  ejemploCotidiano: string;
  pregunta: string;
  explicacionSimple: string;
  formulaLabel: string;
  formulaValor: string;
  datoSorprendente: string;
  aplicaciones: string[];
}

const FUERZAS: FuerzaFisica[] = [
  {
    id: 'gravedad',
    icono: '🌍',
    nombre: 'Gravedad',
    color: '#2E86AB',
    colorClaro: 'rgba(46,134,171,0.10)',
    pregunta: '¿Por qué no flotas?',
    ejemploCotidiano: 'Una manzana cae del árbol. Una pelota que lanzas al aire siempre vuelve. Tu peso en la báscula.',
    explicacionSimple:
      'La gravedad es la fuerza con la que la Tierra te atrae hacia su centro. Cuanta más masa tiene un objeto, más tira. La Tierra tiene una masa enorme — 6 × 10²⁴ kg — y eso genera una atracción que no puedes escapar sin un cohete. No necesitas apoyarte en nada: la gravedad actúa a distancia, igual que un imán, sin que haya contacto físico.',
    formulaLabel: 'Fuerza gravitatoria',
    formulaValor: 'F = m × g (9,8 m/s²)',
    datoSorprendente:
      'Si la Tierra tuviera el doble de masa pero el mismo tamaño, pesarías el doble. Los astronautas en la ISS no flotan porque no hay gravedad — flotan porque están en caída libre continua alrededor de la Tierra a 28.000 km/h.',
    aplicaciones: [
      'Puentes y edificios diseñados para resistir el peso (gravedad)',
      'GPS corregido para compensar la diferencia de gravedad en órbita',
      'Mareas del océano causadas por la gravedad de la Luna',
      'La atmósfera terrestre, retenida por la gravedad',
    ],
  },
  {
    id: 'friccion',
    icono: '🛑',
    nombre: 'Fricción',
    color: '#e67e22',
    colorClaro: 'rgba(230,126,34,0.10)',
    pregunta: '¿Por qué no resbalas?',
    ejemploCotidiano: 'Frenar un coche. Escribir con un bolígrafo. Caminar sin caerte. Una caja que no se mueve sola en el suelo.',
    explicacionSimple:
      'La fricción es la fuerza que se opone al movimiento entre dos superficies en contacto. Ninguna superficie es perfectamente lisa: a escala microscópica, tienen rugosidades que se enganchan entre sí. Cuando intentas mover algo, esas asperezas generan resistencia. Sin fricción, no podrías caminar (tus pies resbalarían), frenar (los frenos no agarrarían) ni escribir (el bolígrafo resbalaría).',
    formulaLabel: 'Fricción cinética',
    formulaValor: 'F_r = μ × N',
    datoSorprendente:
      'El coeficiente de fricción del hielo es 0,03 — casi sin fricción — por eso es tan resbaladizo. El de la goma en asfalto seco es 0,8. Los neumáticos de Fórmula 1 en mojado usan compuestos especiales para aumentar la fricción y evitar el aquaplaning.',
    aplicaciones: [
      'Neumáticos con dibujo para drenar agua y mantener agarre',
      'Frenos de disco que convierten movimiento en calor',
      'Zapatos antideslizantes en cocinas y piscinas',
      'Rodamientos con aceite para REDUCIR la fricción en motores',
    ],
  },
  {
    id: 'inercia',
    icono: '🚗',
    nombre: 'Inercia',
    color: '#9b59b6',
    colorClaro: 'rgba(155,89,182,0.10)',
    pregunta: '¿Por qué te lanzas hacia adelante al frenar?',
    ejemploCotidiano: 'Un frenazo brusco en el coche. Un café que se derrama en el metro. Un trineo que sigue deslizándose aunque dejes de empujar.',
    explicacionSimple:
      'La inercia es la tendencia de los objetos a mantener su estado de movimiento (o de reposo) a menos que una fuerza externa actúe sobre ellos. Cuando el coche frena bruscamente, el coche desacelera pero tu cuerpo quiere seguir moviéndose a la misma velocidad — por eso te lanzas hacia adelante. El cinturón de seguridad aplica la fuerza frenante a tu cuerpo de forma controlada para evitar que chocques con el salpicadero.',
    formulaLabel: 'Segunda Ley de Newton',
    formulaValor: 'F = m × a',
    datoSorprendente:
      'La inercia depende de la masa. Un camión de 20 toneladas a 100 km/h necesita 400 metros para frenar; un coche de 1 tonelada solo 60. Por eso los airbags y cinturones están diseñados para desacelerar el cuerpo de forma gradual — una desaceleración brusca puede ser tan letal como un impacto.',
    aplicaciones: [
      'Cinturones de seguridad: fuerza gradual contra la inercia',
      'Airbags: desaceleran el cuerpo sin impacto brusco',
      'Giroscopios: usan la inercia rotacional para mantener orientación',
      'Estabilizadores de barcos que compensan el balanceo por inercia',
    ],
  },
  {
    id: 'presion-atmosferica',
    icono: '✈️',
    nombre: 'Presión Atmosférica',
    color: '#27ae60',
    colorClaro: 'rgba(39,174,96,0.10)',
    pregunta: '¿Por qué te duelen los oídos en el avión?',
    ejemploCotidiano: 'Oídos que tapan en el avión o en la montaña. Una ventosa que se pega a la pared. El agua que no cae de un vaso invertido con papel.',
    explicacionSimple:
      'La atmósfera tiene peso y ese peso ejerce presión sobre todo lo que toca. Al nivel del mar, el aire pesa lo equivalente a 10 toneladas por metro cuadrado. Esa presión es igual por todos lados (por eso no la notas). Al subir en avión, la presión exterior baja, pero el interior de tu oído (a través de la trompa de Eustaquio) no se ajusta instantáneamente — esa diferencia de presión produce la molestia. Tragar o bostezar abre la trompa y equilibra las presiones.',
    formulaLabel: 'Presión atmosférica estándar',
    formulaValor: '1 atm = 101.325 Pa',
    datoSorprendente:
      'En el Everest (8.849 m), la presión es un tercio de la del nivel del mar — por eso los escaladores necesitan oxígeno. En el fondo del océano, la presión aumenta 1 atm cada 10 metros: a 10.000 m de profundidad, la presión es 1.000 veces mayor que en la superficie. Los submarinos militares aguantan hasta 1.000 m.',
    aplicaciones: [
      'Aviones presurizados para que los pasajeros respiren con normalidad',
      'Barómétros que miden la presión para predecir el tiempo',
      'Ventosas que usan la diferencia de presión para adherirse',
      'Jeringuillas que aspiran líquido reduciendo la presión interior',
    ],
  },
  {
    id: 'tension-superficial',
    icono: '🦟',
    nombre: 'Tensión Superficial',
    color: '#48A9A6',
    colorClaro: 'rgba(72,169,166,0.10)',
    pregunta: '¿Por qué flotan los insectos en el agua?',
    ejemploCotidiano: 'Un zapatero que camina sobre el agua. Una moneda que flota si la pones con cuidado. El agua que forma gotas en vez de extenderse. El menisco del agua en un vaso.',
    explicacionSimple:
      'Las moléculas de agua se atraen entre sí (cohesión). En el interior del agua, cada molécula está atraída por igual en todas direcciones. Pero en la superficie, no hay moléculas encima — solo debajo y a los lados — así que son atraídas más hacia abajo y los lados. Eso crea una "membrana" elástica invisible. Los insectos que caminan sobre el agua no la rompen porque su peso se distribuye sobre una superficie suficiente y las patas repelen el agua. La moneda se hunde si la inclinas porque la fuerza puntual supera la tensión superficial.',
    formulaLabel: 'Tensión superficial del agua',
    formulaValor: 'γ = 0,0728 N/m (a 20 °C)',
    datoSorprendente:
      'Las plantas absorben agua desde las raíces hasta las hojas más altas (50 metros en los árboles gigantes) en parte gracias a la tensión superficial: el agua "se agarra" a las paredes de los tubos capilares y sube sin necesidad de bomba. El jabón rompe la tensión superficial del agua — por eso lava mejor que el agua sola.',
    aplicaciones: [
      'Detergentes y jabones: rompen la tensión para limpiar mejor',
      'Capilaridad en plantas: absorción de agua por tubos finos',
      'Impermeabilización de tejidos: el agua forma gotas y resbala',
      'Soldadura: el estaño fundido usa tensión superficial para fluir',
    ],
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorFuerzasInvisiblesPage() {
  const [fuerzaActiva, setFuerzaActiva] = useState<string>(FUERZAS[0].id);
  const [abierta, setAbierta] = useState<string>(FUERZAS[0].id);

  const fuerza = FUERZAS.find(f => f.id === fuerzaActiva)!;

  const handleFuerzaClick = (id: string) => {
    setFuerzaActiva(id);
    setAbierta(prev => (prev === id ? '' : id));
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
          <p className={styles.heroTag} aria-hidden="true">Física para Bachillerato</p>
          <h1 className={styles.title}>Las Fuerzas Invisibles del Día a Día</h1>
          <p className={styles.subtitle}>
            Gravedad, fricción, inercia, presión atmosférica y tensión superficial. Las cinco fuerzas que mueven tu vida — aunque no las veas.
          </p>
        </header>

        <LegalNotice />

        {/* Selector de fuerzas */}
        <div className={styles.selectorGrid} role="tablist" aria-label="Selecciona una fuerza física">
          {FUERZAS.map(f => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={fuerzaActiva === f.id}
              className={`${styles.selectorBtn} ${fuerzaActiva === f.id ? styles.selectorActivo : ''}`}
              style={fuerzaActiva === f.id ? { borderColor: f.color, background: f.colorClaro } : undefined}
              onClick={() => handleFuerzaClick(f.id)}
            >
              <span className={styles.selectorIcono} aria-hidden="true">{f.icono}</span>
              <span className={styles.selectorNombre}>{f.nombre}</span>
              <span className={styles.selectorPregunta}>{f.pregunta}</span>
            </button>
          ))}
        </div>

        {/* Bloques clickables desplegables */}
        <div className={styles.fuerzasList}>
          {FUERZAS.map(f => (
            <div
              key={f.id}
              className={`${styles.fuerzaBloque} ${abierta === f.id ? styles.fuerzaBloqueAbierto : ''}`}
            >
              <button
                type="button"
                className={styles.fuerzaCabecera}
                onClick={() => handleFuerzaClick(f.id)}
                aria-expanded={abierta === f.id}
                style={abierta === f.id ? { borderLeft: `5px solid ${f.color}` } : undefined}
              >
                <span className={styles.fuerzaCabeceraIzq}>
                  <span className={styles.fuerzaIcono} aria-hidden="true">{f.icono}</span>
                  <span>
                    <span className={styles.fuerzaNombreBtn}>{f.nombre}</span>
                    <span className={styles.fuerzaPreguntaBtn}>{f.pregunta}</span>
                  </span>
                </span>
                <span
                  className={styles.fuerzaChevron}
                  style={abierta === f.id ? { transform: 'rotate(180deg)', color: f.color } : undefined}
                  aria-hidden="true"
                >
                  ▼
                </span>
              </button>

              {abierta === f.id && (
                <div className={styles.fuerzaContenido} role="tabpanel">
                  {/* Ejemplo cotidiano */}
                  <div className={styles.ejemploBox} style={{ borderLeftColor: f.color }}>
                    <span className={styles.ejemploLabel}>Ejemplo cotidiano</span>
                    <p className={styles.ejemploTexto}>{f.ejemploCotidiano}</p>
                  </div>

                  {/* Explicación */}
                  <p className={styles.fuerzaExplicacion}>{f.explicacionSimple}</p>

                  {/* Fórmula */}
                  <div className={styles.formulaBox} style={{ background: f.colorClaro, borderColor: f.color }}>
                    <span className={styles.formulaLabel}>{f.formulaLabel}</span>
                    <code className={styles.formulaValor} style={{ color: f.color }}>{f.formulaValor}</code>
                  </div>

                  {/* Dato sorprendente */}
                  <div className={styles.sorpresaBox}>
                    <span className={styles.sorpresaLabel} style={{ color: f.color }}>
                      ✨ Dato sorprendente
                    </span>
                    <p className={styles.sorpresaTexto}>{f.datoSorprendente}</p>
                  </div>

                  {/* Aplicaciones reales */}
                  <div className={styles.aplicacionesBox}>
                    <span className={styles.aplicacionesLabel}>Aplicaciones reales</span>
                    <ul className={styles.aplicacionesList}>
                      {f.aplicaciones.map((ap, i) => (
                        <li key={i} className={styles.aplicacionItem}>
                          <span className={styles.aplicacionBullet} style={{ background: f.color }} aria-hidden="true" />
                          {ap}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Resumen visual de las 5 fuerzas */}
        <div className={styles.resumenSection}>
          <h2 className={styles.resumenTitulo}>Las 5 fuerzas de un vistazo</h2>
          <div className={styles.resumenGrid}>
            {FUERZAS.map(f => (
              <div key={f.id} className={styles.resumenCard} style={{ borderTop: `4px solid ${f.color}` }}>
                <span className={styles.resumenIcono} aria-hidden="true">{f.icono}</span>
                <span className={styles.resumenNombre} style={{ color: f.color }}>{f.nombre}</span>
                <span className={styles.resumenFormula}>{f.formulaValor}</span>
                <span className={styles.resumenPregunta}>{f.pregunta}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.insight}>
          <p>
            Estas cinco fuerzas actúan <strong>simultáneamente</strong> sobre ti ahora mismo.
            La gravedad te mantiene en el suelo, la fricción evita que resbales al leer esto,
            tu inercia resistiría cualquier cambio brusco de movimiento, la presión atmosférica
            envuelve todo tu cuerpo, y la tensión superficial hace que el café de tu taza forme un menisco.
            La física no es algo que ocurre en laboratorios — ocurre en cada segundo de tu vida.
          </p>
        </div>

        <EducationalSection
          title="Profundiza en la física de las fuerzas"
          subtitle="Conceptos clave para Bachillerato y más allá"
          defaultOpen={false}
        >
          <h3>Las Leyes de Newton: el marco de todo</h3>
          <p>
            Isaac Newton formuló las tres leyes del movimiento en 1687 y siguen siendo la base de la mecánica clásica.
            La Primera Ley (inercia) dice que un objeto mantiene su estado a menos que actúe una fuerza.
            La Segunda (F = m × a) relaciona fuerza, masa y aceleración. La Tercera (acción y reacción) explica
            que cada fuerza tiene una reacción igual y opuesta — cuando caminas, empujas la Tierra hacia atrás,
            y la Tierra te empuja hacia adelante.
          </p>

          <h3>Gravedad: mucho más que "lo que cae"</h3>
          <p>
            La gravedad es la más débil de las cuatro fuerzas fundamentales — pero su alcance es infinito
            y siempre atractiva. La constante gravitacional universal (G = 6,674 × 10⁻¹¹ N·m²/kg²) determina
            la atracción entre cualquier par de masas en el universo. Einstein la redefinió en la Relatividad
            General: la gravedad no es una fuerza, sino la curvatura del espacio-tiempo causada por la masa.
            Pero para la física de Bachillerato, F = mg funciona perfectamente.
          </p>

          <h3>Fricción estática vs. cinética</h3>
          <p>
            Hay dos tipos de fricción. La <strong>fricción estática</strong> mantiene un objeto parado —
            es mayor que la cinética, por eso cuesta más poner algo en movimiento que mantenerlo moviéndose.
            La <strong>fricción cinética</strong> actúa cuando hay movimiento relativo entre superficies.
            Esto explica por qué frenar con el volante girado derrapar: cuando las ruedas dejan de girar
            (bloqueo), se pasa de fricción estática a cinética, que es menor — por eso los ABS modernos
            evitan el bloqueo.
          </p>

          <h3>Presión, fluidos y el principio de Bernoulli</h3>
          <p>
            La presión atmosférica no actúa sola. El principio de Bernoulli explica que en un fluido en movimiento,
            a mayor velocidad, menor presión. Esto genera la sustentación de los aviones: el ala está diseñada
            para que el aire encima vaya más rápido que el de abajo, creando menor presión arriba — esa
            diferencia levanta el avión. También explica los efectos de curvatura de la pelota de fútbol
            (efecto Magnus) y cómo funciona un atomizador.
          </p>

          <h3>Tensión superficial y capilaridad</h3>
          <p>
            La tensión superficial del agua (0,0728 N/m) es alta comparada con otros líquidos — gracias a los
            puentes de hidrógeno entre moléculas. El etanol tiene 0,022 N/m: por eso el vino "llora" en la copa
            (el alcohol sube por tensión superficial y luego cae en gotas cuando se evapora). La capilaridad
            permite que el agua suba por tubos muy finos: en un tubo de 0,1 mm de diámetro, el agua sube
            hasta 15 cm. En los xilemas de los árboles (diámetro ~0,02 mm), esto contribuye a llevar agua
            desde las raíces hasta 50 metros de altura.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> Los valores numéricos (constantes físicas, coeficientes) corresponden
            a condiciones estándar (20 °C, nivel del mar). Los datos de aplicaciones tecnológicas
            son orientativos y pueden variar según diseño y condiciones de uso.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-fuerzas-invisibles')} />
        <ShareCard appName="visualizador-fuerzas-invisibles" />
        <Footer appName="visualizador-fuerzas-invisibles" />
      </div>
    </>
  );
}
