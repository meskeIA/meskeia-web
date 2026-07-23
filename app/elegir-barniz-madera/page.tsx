'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './ElegirBarnizMadera.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ── Tipos del motor de decisión ──────────────────────────────────────────
type Elemento = 'interior' | 'exterior' | 'suelo' | 'contacto-alimentos' | 'melamina';
type Aspecto = 'natural' | 'color';
type Estado = 'nueva' | 'tratada' | 'deteriorada';

interface Opcion<T> {
  valor: T;
  icono: string;
  titulo: string;
  desc: string;
}

interface Recomendacion {
  producto: string;
  porque: string;
  preparacion: string;
  capas: string;
  herramienta: string;
  avisos: string[];
}

// ── Opciones de cada pregunta ────────────────────────────────────────────
const ELEMENTOS: Opcion<Elemento>[] = [
  { valor: 'interior', icono: '🚪', titulo: 'Carpintería interior', desc: 'Puerta, mueble, rodapié' },
  { valor: 'exterior', icono: '🌳', titulo: 'Madera a la intemperie', desc: 'Valla, pérgola, porche' },
  { valor: 'suelo', icono: '🪵', titulo: 'Suelo o parquet', desc: 'Tarima, parquet (se pisa)' },
  { valor: 'contacto-alimentos', icono: '🍽️', titulo: 'Encimera o mesa', desc: 'Contacto con alimentos' },
  { valor: 'melamina', icono: '🗄️', titulo: 'Melamina o laminado', desc: 'Mueble laminado, no macizo' },
];

const ASPECTOS: Opcion<Aspecto>[] = [
  { valor: 'natural', icono: '🌾', titulo: 'Natural', desc: 'Ver la veta (transparente)' },
  { valor: 'color', icono: '🎨', titulo: 'Color opaco', desc: 'Tapar con color' },
];

const ESTADOS: Opcion<Estado>[] = [
  { valor: 'nueva', icono: '🆕', titulo: 'Madera nueva', desc: 'Sin tratar, en bruto' },
  { valor: 'tratada', icono: '🔄', titulo: 'Ya tratada', desc: 'Barnizada o pintada, a repintar' },
  { valor: 'deteriorada', icono: '🌦️', titulo: 'Deteriorada', desc: 'Gris, descascarillada' },
];

// ── Lógica de recomendación ──────────────────────────────────────────────
function calcularRecomendacion(elem: Elemento, asp: Aspecto, est: Estado): Recomendacion {
  let producto = '';
  let porque = '';
  const avisos: string[] = [];

  switch (elem) {
    case 'interior':
      if (asp === 'natural') {
        producto =
          'Barniz de interior al agua (acrílico), en el acabado que prefieras (mate, satinado o brillo).';
        porque =
          'Crea una película protectora transparente que resalta la veta; al agua seca rápido, apenas huele y no amarillea como el barniz sintético.';
      } else {
        producto = 'Esmalte al agua (acrílico) para puertas, muebles y rodapiés.';
        porque =
          'Da un acabado duro, lavable y de color pleno; frente al esmalte sintético (con disolvente) no amarillea y huele mucho menos.';
      }
      break;

    case 'exterior':
      if (asp === 'natural') {
        producto = 'Lasur (protector de poro abierto) con filtro UV.';
        porque =
          'A la intemperie el barniz filmógeno acaba cuarteándose y saltando; el lasur penetra, deja transpirar la madera y se mantiene con solo una mano de repaso cada 2-4 años.';
      } else {
        producto =
          'Lasur cubriente (con color, pero de poro abierto) o esmalte para exterior con protección UV. Aplica antes un protector de fondo (fungicida e insecticida).';
        porque =
          'Necesita resistir sol, lluvia y hongos; el fondo protector previene el azulado y la pudrición de la madera.';
      }
      break;

    case 'suelo':
      producto =
        'Barniz de poliuretano específico para suelos (alta resistencia a la abrasión). Como alternativa de aspecto natural, aceite-cera de alta resistencia.';
      porque =
        'El suelo sufre el pisado y la abrasión constantes; el poliuretano para suelos lo aguanta, y el aceite-cera da un aspecto natural mate y permite reparar zonas sin lijar todo.';
      if (asp === 'color') {
        avisos.push(
          'En suelos de madera lo habitual es un acabado transparente que deja ver la veta; el color opaco es poco frecuente y se raya más a la vista.',
        );
      }
      break;

    case 'contacto-alimentos':
      producto =
        'Aceite específico apto para contacto alimentario (aceites duros tipo tung o linaza tratada, con certificación «food safe»).';
      porque =
        'En encimeras, tablas y mesas que tocan comida conviene una terminación con aceite apto alimentario: penetra, es fácil de reparar y se renueva pasando otra mano, sin barnices no certificados.';
      avisos.push(
        'Comprueba en el envase que el producto declara aptitud para el contacto con alimentos una vez curado.',
      );
      if (asp === 'color') {
        avisos.push(
          'Para superficies que tocan alimentos se recomienda aceite natural apto; si quieres color, busca expresamente un producto certificado «food safe».',
        );
      }
      break;

    case 'melamina':
      producto =
        'La melamina no es madera, es una superficie no porosa: necesita una imprimación de agarre multisuperficie (específica para melamina, laminado o PVC) y, encima, esmalte al agua.';
      porque =
        'La melamina no absorbe nada: la clave es la imprimación de agarre; sin ella, cualquier esmalte se pela con el uso.';
      if (asp === 'natural') {
        avisos.push('En melamina no se puede dejar la veta a la vista: el acabado será de color opaco.');
      }
      break;
  }

  // Preparación (protagonista). La melamina tiene su propia preparación.
  let preparacion = '';
  if (elem === 'melamina') {
    preparacion =
      'Desengrasa a fondo (limpiador amoniacal o desengrasante) para eliminar grasa y silicona. Lija muy suave con grano fino (220-240) solo para dar «mordiente», retira el polvo y aplica la imprimación de agarre. Déjala curar el tiempo que indique el envase antes del esmalte.';
  } else {
    switch (est) {
      case 'nueva':
        preparacion =
          'Lija en la dirección de la veta subiendo de grano: empieza con 120-150 para igualar y termina con 180-220 para dejarla fina. Quita todo el polvo con un paño ligeramente humedecido antes de aplicar. En maderas de poro abierto (roble, fresno) usa tapaporos si quieres un acabado liso.';
        break;
      case 'tratada':
        preparacion =
          'Si el barniz o la pintura antiguos están sanos, lija para matar el brillo (grano 220) y dar mordiente. Si están descascarillados, decapa o lija a fondo hasta llegar a la madera. Limpia el polvo antes de la primera mano.';
        break;
      case 'deteriorada':
        preparacion =
          'Lija hasta eliminar la capa gris y suelta y llegar a madera sana (grano 80-120 y termina en 150-180). En exterior, aplica un protector de fondo (fungicida e insecticida) antes del acabado.';
        break;
    }
  }

  // Capas y lijado entre manos
  const capas =
    elem === 'contacto-alimentos'
      ? '2-3 manos finas, dejando penetrar y retirando el sobrante con un paño; normalmente no se lija entre manos, salvo que lo indique el fabricante.'
      : '2-3 manos. Entre manos, lija muy suave con grano fino (240-320) para quitar el «pelo» que levanta la madera y mejorar el agarre; retira el polvo cada vez.';

  // Herramienta
  const herramienta =
    elem === 'contacto-alimentos'
      ? 'Aplica con brocha o con un paño que no suelte pelusa, extendiendo bien y retirando el aceite sobrante; deja curar antes de usar la superficie.'
      : 'Brocha o paletina de calidad para molduras, cantos y rincones, y rodillo de espuma o de microfibra de pelo muy corto para superficies planas (deja menos marcas). Con productos al agua, no cargues mucho la herramienta para evitar goterones.';

  return { producto, porque, preparacion, capas, herramienta, avisos };
}

export default function ElegirBarnizMaderaPage() {
  const [elemento, setElemento] = useState<Elemento | null>(null);
  const [aspecto, setAspecto] = useState<Aspecto | null>(null);
  const [estado, setEstado] = useState<Estado | null>(null);

  const recomendacion =
    elemento && aspecto && estado ? calcularRecomendacion(elemento, aspecto, estado) : null;

  const reiniciar = () => {
    setElemento(null);
    setAspecto(null);
    setEstado(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">🪵</span> Qué barniz o pintura elegir para madera
        </h1>
        <p className={styles.subtitle}>
          Dinos qué madera vas a tratar y responde dos preguntas: te decimos si usar barniz, lasur,
          aceite o esmalte, y cómo preparar y lijar la madera antes.
        </p>
      </header>

      {/* Enlaces legales RGPD */}
      <LegalNotice />

      {/* Motor de decisión */}
      <div className={styles.mainContent}>
        {/* Pregunta 1 */}
        <div className={styles.selectorGroup}>
          <p className={styles.groupLabel}>
            <span className={styles.groupNum} aria-hidden="true">1</span> ¿Qué vas a tratar?
          </p>
          <div className={styles.optionsGrid}>
            {ELEMENTOS.map((op) => (
              <button
                key={op.valor}
                type="button"
                className={`${styles.optionCard} ${elemento === op.valor ? styles.optionCardActive : ''}`}
                aria-pressed={elemento === op.valor}
                onClick={() => setElemento(op.valor)}
              >
                <span className={styles.optionIcon} aria-hidden="true">{op.icono}</span>
                <span className={styles.optionTitle}>{op.titulo}</span>
                <span className={styles.optionDesc}>{op.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pregunta 2 */}
        <div className={styles.selectorGroup}>
          <p className={styles.groupLabel}>
            <span className={styles.groupNum} aria-hidden="true">2</span> ¿Qué aspecto quieres?
          </p>
          <div className={styles.optionsGrid}>
            {ASPECTOS.map((op) => (
              <button
                key={op.valor}
                type="button"
                className={`${styles.optionCard} ${aspecto === op.valor ? styles.optionCardActive : ''}`}
                aria-pressed={aspecto === op.valor}
                onClick={() => setAspecto(op.valor)}
              >
                <span className={styles.optionIcon} aria-hidden="true">{op.icono}</span>
                <span className={styles.optionTitle}>{op.titulo}</span>
                <span className={styles.optionDesc}>{op.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pregunta 3 */}
        <div className={styles.selectorGroup}>
          <p className={styles.groupLabel}>
            <span className={styles.groupNum} aria-hidden="true">3</span> ¿En qué estado está la madera?
          </p>
          <div className={styles.optionsGrid}>
            {ESTADOS.map((op) => (
              <button
                key={op.valor}
                type="button"
                className={`${styles.optionCard} ${estado === op.valor ? styles.optionCardActive : ''}`}
                aria-pressed={estado === op.valor}
                onClick={() => setEstado(op.valor)}
              >
                <span className={styles.optionIcon} aria-hidden="true">{op.icono}</span>
                <span className={styles.optionTitle}>{op.titulo}</span>
                <span className={styles.optionDesc}>{op.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ficha de recomendación */}
      {recomendacion && (
        <section className={styles.ficha} aria-live="polite">
          <div className={styles.fichaHeader}>
            <h2 className={styles.fichaTitle}>
              <span aria-hidden="true">✅</span> Tu ficha para la madera
            </h2>
            <button type="button" className={styles.resetBtn} onClick={reiniciar}>
              <span aria-hidden="true">🔄</span> Empezar de nuevo
            </button>
          </div>

          {recomendacion.avisos.length > 0 && (
            <div className={styles.avisos} role="note">
              {recomendacion.avisos.map((aviso, i) => (
                <p key={i} className={styles.aviso}>
                  <span aria-hidden="true">⚠️</span> {aviso}
                </p>
              ))}
            </div>
          )}

          <dl className={styles.fichaGrid}>
            <div className={styles.fichaRow}>
              <dt className={styles.fichaLabel}><span aria-hidden="true">🪵</span> Producto recomendado</dt>
              <dd className={styles.fichaValue}>{recomendacion.producto}</dd>
            </div>
            <div className={styles.fichaRow}>
              <dt className={styles.fichaLabel}><span aria-hidden="true">💡</span> Por qué</dt>
              <dd className={styles.fichaValue}>{recomendacion.porque}</dd>
            </div>
            <div className={styles.fichaRow}>
              <dt className={styles.fichaLabel}><span aria-hidden="true">🧽</span> Preparación y lijado</dt>
              <dd className={styles.fichaValue}>{recomendacion.preparacion}</dd>
            </div>
            <div className={styles.fichaRow}>
              <dt className={styles.fichaLabel}><span aria-hidden="true">🖌️</span> Capas y lijado entre manos</dt>
              <dd className={styles.fichaValue}>{recomendacion.capas}</dd>
            </div>
            <div className={styles.fichaRow}>
              <dt className={styles.fichaLabel}><span aria-hidden="true">🧑‍🎨</span> Herramienta</dt>
              <dd className={styles.fichaValue}>{recomendacion.herramienta}</dd>
            </div>
          </dl>

          <div className={styles.ctaWrapper}>
            <Link href="/elegir-pintura-paredes/" className={styles.ctaBtn}>
              <span aria-hidden="true">🖌️</span> ¿Pintas también las paredes? Elige su pintura
            </Link>
          </div>
        </section>
      )}

      {/* Disclaimer (orientación general de bricolaje doméstico) */}
      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible
        context="elegir-barniz-madera"
        title="Orientación general para tratar la madera"
      >
        <p>
          Esta herramienta ofrece una <strong>orientación general</strong> para elegir el producto y
          la preparación adecuados al tratar madera en casa. Los productos varían mucho entre
          fabricantes: sigue siempre las <strong>instrucciones de la etiqueta</strong> (diluciones,
          tiempos de secado y curado, número de manos y aptitud alimentaria).
        </p>
        <p>
          Trabaja con buena <strong>ventilación</strong> y usa mascarilla y gafas al lijar, decapar
          o aplicar productos con disolvente; el polvo de lijado y los decapantes son irritantes. En
          madera muy antigua con posible pintura de plomo, extrema las precauciones o consulta a un
          profesional.
        </p>
      </DisclaimerCard>

      {/* Contenido educativo (patrón v2.0) */}
      <EducationalSection
        icon="🪵"
        title="Guía para barnizar y pintar madera"
        subtitle="Barniz, lasur, aceite o esmalte; preparación, lijado, capas y errores frecuentes"
      >
        {/* 1. Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>Productos para madera y cuándo usar cada uno</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Aspecto</th>
                  <th>Dónde va bien</th>
                  <th>Mantenimiento</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Barniz interior al agua</td>
                  <td>Transparente, ve la veta</td>
                  <td>Muebles y carpintería interior</td>
                  <td>Bajo</td>
                </tr>
                <tr>
                  <td>Esmalte al agua</td>
                  <td>Color opaco</td>
                  <td>Puertas, rodapiés, muebles</td>
                  <td>Bajo</td>
                </tr>
                <tr>
                  <td>Lasur (poro abierto)</td>
                  <td>Natural o cubriente</td>
                  <td>Vallas, pérgolas, exterior</td>
                  <td>Repaso cada 2-4 años</td>
                </tr>
                <tr>
                  <td>Aceite apto alimentario</td>
                  <td>Natural mate</td>
                  <td>Encimeras, tablas, mesas</td>
                  <td>Renovar con una mano</td>
                </tr>
                <tr>
                  <td>Barniz poliuretano de suelos</td>
                  <td>Transparente resistente</td>
                  <td>Parquet y tarima</td>
                  <td>Medio</td>
                </tr>
                <tr>
                  <td>Imprimación de agarre + esmalte</td>
                  <td>Color opaco</td>
                  <td>Melamina, laminado, PVC</td>
                  <td>Bajo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Casos de uso */}
        <section className={styles.guideSection}>
          <h2>Casos habituales</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h3>Puerta interior blanca</h3>
              <p>
                Esmalte al agua: no amarillea y seca rápido. Lija para matar el brillo del barniz
                viejo, limpia el polvo y da 2 manos finas.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h3>Valla o pérgola de jardín</h3>
              <p>
                Lasur con filtro UV, nunca barniz de interior. Si la madera es nueva, aplica antes un
                protector de fondo fungicida.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h3>Encimera de madera de cocina</h3>
              <p>
                Aceite apto para contacto con alimentos: penetra, se repara fácil y se renueva
                pasando otra mano cuando pierde el tono.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h3>Mueble de melamina</h3>
              <p>
                No es madera: desengrasa, lija ligero, imprimación de agarre y esmalte al agua. Sin
                la imprimación, el esmalte se despega.
              </p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3>¿Barniz, lasur o aceite?</h3>
              <p>
                Barniz para muebles y carpintería interior (crea película); lasur para exterior a la
                intemperie (poro abierto, no se cuartea); aceite para aspecto natural y superficies
                que tocan alimentos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué uso en madera exterior?</h3>
              <p>
                Lasur con filtro UV. Se renueva con una mano de repaso sin lijar a fondo; el barniz
                filmógeno acaba saltando con el sol y la lluvia.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cómo preparo la madera?</h3>
              <p>
                Lija en la dirección de la veta subiendo de grano (120-150 y termina en 180-220),
                quita el polvo y usa tapaporos en maderas de poro abierto.
              </p>
              <p className={styles.faqTip}>
                Truco: la preparación es el 70% del resultado. Un buen lijado y una madera sin polvo
                hacen más por el acabado que una mano extra de barniz.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Puedo pintar la melamina?</h3>
              <p>
                Sí, con imprimación de agarre multisuperficie y esmalte al agua encima. Sin esa
                imprimación, la pintura no agarra y se pela.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Esmalte al agua o sintético?</h3>
              <p>
                Para interior, al agua: poco olor, secado rápido y no amarillea. El sintético es muy
                duro pero amarillea y huele fuerte.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo barnizar o pintar madera, paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h3>Lija subiendo de grano</h3>
                <p>Siempre en la dirección de la veta, de grano grueso a fino, hasta dejarla suave.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h3>Quita todo el polvo</h3>
                <p>Aspira y pasa un paño ligeramente humedecido; el polvo arruina el acabado.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h3>Fondo o imprimación</h3>
                <p>Tapaporos si buscas liso, imprimación de agarre en melamina, protector en exterior.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h3>Primera mano fina</h3>
                <p>Extiende sin cargar la herramienta, siguiendo la veta, y deja secar bien.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <h3>Lijado suave entre manos</h3>
                <p>Grano fino (240-320) para quitar el «pelo» levantado; limpia el polvo otra vez.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <h3>Segunda y tercera mano</h3>
                <p>Repite hasta el acabado deseado y deja curar antes de usar la superficie.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Mejores prácticas */}
        <section className={styles.guideSection}>
          <h2>Consejos que marcan la diferencia</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">➡️</span>
              <p>Lija siempre en la dirección de la veta; a contraveta deja arañazos que el barniz resalta.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <p>Prueba el producto en una zona oculta: al mojar la madera, el tono final cambia bastante.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">☀️</span>
              <p>En exterior, aplica con madera seca y evita el sol directo, la lluvia y el rocío nocturno.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🥫</span>
              <p>Guarda un poco de producto y su referencia para repasar golpes y arañazos más adelante.</p>
            </div>
          </div>
        </section>

        {/* 6. Errores frecuentes */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h2>Errores frecuentes con la madera</h2>
            </div>
            <ul className={styles.warningList}>
              <li>Barnizar madera exterior con barniz de interior: se cuartea y salta en un par de veranos.</li>
              <li>Pintar melamina sin imprimación de agarre: el esmalte se despega al primer roce.</li>
              <li>Saltarse el lijado entre manos: el acabado queda áspero y con «pelo».</li>
              <li>No quitar el polvo antes de aplicar: quedan motas atrapadas en el barniz.</li>
              <li>Usar un barniz no certificado en superficies que tocan alimentos.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      {/* Apps relacionadas */}
      <RelatedApps apps={getRelatedApps('elegir-barniz-madera')} />

      {/* Tarjeta de compartir */}
      <ShareCard appName="elegir-barniz-madera" />

      {/* Footer */}
      <Footer appName="elegir-barniz-madera" />
    </div>
  );
}
