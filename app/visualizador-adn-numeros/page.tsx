'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorAdnNumeros.module.css';
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
// Tipos
// ─────────────────────────────────────────────

interface DatoAdn {
  id: string;
  icono: string;
  cifra: string;
  titulo: string;
  resumen: string;
  detalle: string;
  comparacion: string;
  color: string;
}

interface Organismo {
  nombre: string;
  icono: string;
  similitud: number;
  descripcion: string;
}

// ─────────────────────────────────────────────
// Datos principales
// ─────────────────────────────────────────────

const DATOS_ADN: DatoAdn[] = [
  {
    id: 'pares-bases',
    icono: '🧬',
    cifra: '3.200 millones',
    titulo: 'Pares de bases en el genoma humano',
    resumen: 'El genoma humano haploide contiene aproximadamente 3.200 millones de pares de bases nucleotídicas.',
    detalle: 'Cada célula de tu cuerpo contiene dos copias del genoma (diploide), lo que suma ~6.400 millones de pares de bases por célula. Un par de bases es la unión de dos nucleótidos complementarios: Adenina-Timina (A-T) o Guanina-Citosina (G-C). Si pudieras leer el genoma a razón de un par de bases por segundo, tardarías más de 100 años en completarlo.',
    comparacion: 'Es como un libro de texto con 3.200 millones de letras — equivalente a unos 1.000 libros de 1.000 páginas cada uno.',
    color: '#2E86AB',
  },
  {
    id: 'identidad',
    icono: '👯',
    cifra: '99,9%',
    titulo: 'Idéntico a cualquier otro ser humano',
    resumen: 'El 99,9% del ADN es compartido entre cualquier par de seres humanos del planeta, independientemente de su origen.',
    detalle: 'Ese 0,1% de diferencia representa unos 3 millones de variantes en el genoma. Estas variantes (SNPs, inserciones, deleciones) determinan diferencias en apariencia, susceptibilidad a enfermedades y rasgos personales. Toda la diversidad humana visible — color de piel, altura, tipo de cabello — emerge de ese pequeño porcentaje.',
    comparacion: 'Si el genoma fuera una novela de 1.000 páginas, las diferencias entre tú y cualquier otra persona equivaldrían a cambiar 1 letra en cada 1.000. El 99,9% del texto sería idéntico.',
    color: '#48A9A6',
  },
  {
    id: 'platano',
    icono: '🍌',
    cifra: '60%',
    titulo: 'Compartido con un plátano',
    resumen: 'Los humanos compartimos aproximadamente el 60% de nuestros genes con el plátano (Musa acuminata).',
    detalle: 'Esta similitud se concentra en genes relacionados con procesos biológicos fundamentales: metabolismo celular, replicación del ADN, síntesis de proteínas. Estos genes son tan esenciales para la vida que han permanecido casi inalterados a lo largo de miles de millones de años de evolución. Es una evidencia poderosa de la unidad evolutiva de toda la vida en la Tierra.',
    comparacion: 'No significa que seamos "parecidos" a los plátanos, sino que las herramientas moleculares básicas de la vida se inventaron hace mucho tiempo y se reutilizan en todos los organismos vivos.',
    color: '#f39c12',
  },
  {
    id: 'chimpance',
    icono: '🐒',
    cifra: '96%',
    titulo: 'Compartido con el chimpancé',
    resumen: 'El genoma humano es aproximadamente un 96% idéntico al del chimpancé (Pan troglodytes).',
    detalle: 'Ese 4% de diferencia representa unos 35 millones de sustituciones nucleotídicas más unas 5 millones de inserciones y deleciones. Muchas de las diferencias se concentran en regiones reguladoras (que controlan cuándo y cuánto se expresan los genes), no solo en los genes en sí. Entre los cambios clave: genes relacionados con el tamaño del cerebro, la deambulación bípeda y el lenguaje.',
    comparacion: 'El 4% parece poco, pero son millones de cambios que se han acumulado en ~6 millones de años desde que divergieron nuestros linajes del antepasado común.',
    color: '#8B4513',
  },
  {
    id: 'longitud',
    icono: '📏',
    cifra: '2 metros',
    titulo: 'ADN por célula',
    resumen: 'Si se desenrollase todo el ADN de una sola célula humana, mediría aproximadamente 2 metros de longitud.',
    detalle: 'Ese ADN está compactado dentro de un núcleo celular de apenas 6 micrómetros de diámetro — unas 300.000 veces más pequeño. Esta compactación se logra enrollando el ADN alrededor de proteínas llamadas histonas, formando nucleosomas, que a su vez se pliegan en estructuras de orden superior. Es equivalente a meter un hilo de 2 km dentro de una pelota de tenis.',
    comparacion: 'Si el núcleo celular fuera del tamaño de un balón de fútbol (22 cm), el ADN que contiene tendría la longitud equivalente a 67 km de hilo muy fino.',
    color: '#9b59b6',
  },
  {
    id: 'total-cuerpo',
    icono: '🌌',
    cifra: '74.000 millones de km',
    titulo: 'ADN total en tu cuerpo',
    resumen: 'Si se pudiera estirar todo el ADN de todas las células del cuerpo humano, llegaría casi 250 veces hasta el Sol y de vuelta.',
    detalle: 'El cuerpo humano contiene aproximadamente 37 billones de células (3,7 × 10¹³), cada una con 2 metros de ADN. En total: 37 × 10¹² × 2 m = 74 × 10¹² m = 74.000 millones de km. La distancia Tierra-Sol es ~150 millones de km, así que el ADN de tu cuerpo daría unas 500 vueltas ida sola, o 250 viajes de ida y vuelta.',
    comparacion: 'La distancia de la Tierra al Sol es 150 millones de km. Tu ADN la recorre 500 veces en un único sentido. La Voyager 1 lleva 46 años viajando y está a 23.500 millones de km — tu ADN la superaría por mucho.',
    color: '#e74c3c',
  },
  {
    id: 'genes',
    icono: '🔬',
    cifra: '20.000-25.000',
    titulo: 'Genes en el genoma humano',
    resumen: 'El genoma humano contiene entre 20.000 y 25.000 genes codificantes de proteínas — mucho menos de lo que se pensaba.',
    detalle: 'Antes del Proyecto Genoma Humano (completado en 2003), los científicos esperaban encontrar 100.000 o más genes. El resultado — apenas 20.000-25.000 — fue una sorpresa. C. elegans (un gusano de 1 mm) tiene ~19.000 genes. La riqueza de la biología humana no proviene de tener más genes, sino de cómo se regulan, se combinan y se procesan.',
    comparacion: 'Solo el 2% del genoma codifica proteínas. El 98% restante fue llamado "ADN basura" durante décadas, pero ahora sabemos que gran parte tiene funciones reguladoras cruciales.',
    color: '#27ae60',
  },
];

// ─────────────────────────────────────────────
// Similitud genética
// ─────────────────────────────────────────────

const ORGANISMOS: Organismo[] = [
  {
    nombre: 'Humano',
    icono: '🧑',
    similitud: 100,
    descripcion: 'Referencia: genoma humano completo.',
  },
  {
    nombre: 'Chimpancé',
    icono: '🐒',
    similitud: 96,
    descripcion: 'Nuestro pariente más cercano. Divergimos hace ~6 millones de años.',
  },
  {
    nombre: 'Ratón',
    icono: '🐭',
    similitud: 85,
    descripcion: 'El 85% de los genes codificantes tienen un homólogo en el ratón. Divergimos hace ~75 millones de años.',
  },
  {
    nombre: 'Mosca',
    icono: '🪰',
    similitud: 60,
    descripcion: 'Drosophila melanogaster. ~60% de genes de enfermedades humanas tienen equivalente en la mosca.',
  },
  {
    nombre: 'Plátano',
    icono: '🍌',
    similitud: 60,
    descripcion: 'Genes del metabolismo celular básico compartidos. Evidencia de la unidad molecular de la vida.',
  },
  {
    nombre: 'Bacteria E. coli',
    icono: '🦠',
    similitud: 7,
    descripcion: 'Genes fundamentales de replicación del ADN y síntesis de proteínas conservados incluso con bacterias.',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorAdnNumerosPage() {
  const [datoActivo, setDatoActivo] = useState<string | null>(null);

  const toggleDato = (id: string) => {
    setDatoActivo(prev => (prev === id ? null : id));
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
          <div className={styles.heroIcono} aria-hidden="true">🧬</div>
          <h1 className={styles.title}>Tu ADN en Números</h1>
          <p className={styles.subtitle}>
            Las cifras más asombrosas de tu genoma — explicadas con perspectiva real
          </p>
          <p className={styles.heroNota}>Toca cada dato para ampliar la explicación</p>
        </header>

        <LegalNotice />

        {/* Bloques de datos clickables */}
        <section className={styles.datosGrid} aria-label="Datos sobre el ADN humano">
          {DATOS_ADN.map(dato => {
            const abierto = datoActivo === dato.id;
            return (
              <article key={dato.id} className={styles.datoCard}>
                <button
                  type="button"
                  className={`${styles.datoHeader} ${abierto ? styles.datoHeaderActivo : ''}`}
                  onClick={() => toggleDato(dato.id)}
                  aria-expanded={abierto}
                  aria-controls={`detalle-${dato.id}`}
                  style={{ borderColor: abierto ? dato.color : undefined }}
                >
                  <span className={styles.datoIcono} aria-hidden="true">{dato.icono}</span>
                  <div className={styles.datoTexto}>
                    <span className={styles.datoCifra} style={{ color: dato.color }}>
                      {dato.cifra}
                    </span>
                    <span className={styles.datoTitulo}>{dato.titulo}</span>
                  </div>
                  <span
                    className={`${styles.datoChevron} ${abierto ? styles.datoChevronAbierto : ''}`}
                    aria-hidden="true"
                  >
                    ▼
                  </span>
                </button>

                {abierto && (
                  <div
                    id={`detalle-${dato.id}`}
                    className={styles.datoDetalle}
                    style={{ borderLeftColor: dato.color }}
                  >
                    <p className={styles.datoResumen}>{dato.resumen}</p>
                    <p className={styles.datoExplicacion}>{dato.detalle}</p>
                    <div className={styles.datoComparacion}>
                      <span className={styles.datoComparacionIcono} aria-hidden="true">📐</span>
                      <p>{dato.comparacion}</p>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>

        {/* Escala visual del ADN */}
        <section className={styles.escalaSection}>
          <h2 className={styles.seccionTitulo}>
            <span aria-hidden="true">🌍</span> De la Célula al Sistema Solar
          </h2>
          <p className={styles.seccionSubtitulo}>
            La escala real del ADN en el cuerpo humano
          </p>

          <div className={styles.escalaItems}>
            {[
              { icono: '⚛️', etiqueta: 'Par de bases', valor: '0,34 nm', desc: '0,00000034 mm' },
              { icono: '🔬', etiqueta: 'ADN por célula (estirado)', valor: '2 metros', desc: 'compactado en 6 μm' },
              { icono: '🧑', etiqueta: 'Células en el cuerpo', valor: '37 billones', desc: '3,7 × 10¹³' },
              { icono: '🌍', etiqueta: 'ADN total (estirado)', valor: '74.000 M km', desc: 'Todo tu ADN junto' },
              { icono: '☀️', etiqueta: 'Tierra → Sol (ida y vuelta)', valor: '300 M km', desc: '2 × 150 M km' },
              { icono: '🚀', etiqueta: 'Tu ADN vs Tierra-Sol', valor: '×250', desc: 'viajes de ida y vuelta' },
            ].map(item => (
              <div key={item.etiqueta} className={styles.escalaItem}>
                <span className={styles.escalaIcono} aria-hidden="true">{item.icono}</span>
                <div className={styles.escalaInfo}>
                  <span className={styles.escalaEtiqueta}>{item.etiqueta}</span>
                  <span className={styles.escalaValor}>{item.valor}</span>
                  <span className={styles.escalaDesc}>{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Barra de similitud genética */}
        <section className={styles.similitudSection}>
          <h2 className={styles.seccionTitulo}>
            <span aria-hidden="true">🔗</span> Similitud Genética con otros Organismos
          </h2>
          <p className={styles.seccionSubtitulo}>
            % del genoma codificante compartido con el humano
          </p>

          <div className={styles.similitudLista}>
            {ORGANISMOS.map(org => (
              <div key={org.nombre} className={styles.similitudItem}>
                <div className={styles.similitudCabecera}>
                  <span className={styles.similitudIcono} aria-hidden="true">{org.icono}</span>
                  <span className={styles.similitudNombre}>{org.nombre}</span>
                  <span className={styles.similitudPorcentaje}>{org.similitud}%</span>
                </div>
                <div className={styles.similitudBarraFondo}>
                  <div
                    className={styles.similitudBarra}
                    style={{ width: `${org.similitud}%` }}
                    role="progressbar"
                    aria-valuenow={org.similitud}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Similitud genética de ${org.nombre}: ${org.similitud}%`}
                  />
                </div>
                <p className={styles.similitudDesc}>{org.descripcion}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Insight final */}
        <div className={styles.insight}>
          <p>
            <strong>La conclusión más poderosa:</strong> toda la vida en la Tierra comparte el mismo
            código molecular. El ADN, el ARN y las proteínas son universales. Esto no es
            coincidencia — es evidencia de un origen común. La biología molecular es, en esencia,
            la historia de cómo ese código se fue diversificando durante 3.800 millones de años.
          </p>
        </div>

        <EducationalSection
          title="Conceptos clave del genoma humano"
          subtitle="Lo esencial para entender las cifras del ADN"
          defaultOpen={false}
        >
          <h3>¿Qué es exactamente el ADN?</h3>
          <p>
            El ácido desoxirribonucleico (ADN) es una molécula de doble hélice formada por cuatro
            tipos de nucleótidos: Adenina (A), Timina (T), Guanina (G) y Citosina (C). La secuencia
            de estas &quot;letras&quot; codifica las instrucciones para construir y mantener un organismo.
            La regla de complementariedad (A-T, G-C) es la base de la replicación fiel del ADN.
          </p>

          <h3>Proyecto Genoma Humano (1990-2003)</h3>
          <p>
            El Proyecto Genoma Humano fue el mayor esfuerzo de colaboración científica internacional
            de la historia: 20 países, 13 años y más de 3.000 millones de dólares para secuenciar
            el primer genoma humano completo. El resultado sorprendió: 20.000-25.000 genes
            (menos de un cuarto de lo esperado). En 2022 se completó la secuenciación del 100%
            (el proyecto original dejó algunas regiones sin secuenciar).
          </p>

          <h3>Genes vs. ADN no codificante</h3>
          <p>
            Solo el 2% del genoma humano son exones (regiones que codifican directamente proteínas).
            El 98% restante fue llamado &quot;ADN basura&quot; durante décadas. Hoy sabemos que incluye:
            intrones (secuencias dentro de genes que se eliminan), regiones reguladoras (promotores,
            potenciadores), ARN no codificantes funcionales, y secuencias repetitivas con diversas
            funciones estructurales y reguladoras.
          </p>

          <h3>¿Por qué nos parecemos tanto a otras especies?</h3>
          <p>
            Los genes más conservados entre especies son los que codifican funciones esenciales:
            replicación del ADN, síntesis de proteínas, ciclo celular. Mutaciones en estos genes
            suelen ser letales, así que la selección natural los mantiene prácticamente igual
            durante miles de millones de años. Esto se llama <em>conservación evolutiva</em>.
          </p>

          <h3>SNPs: la fuente de nuestra diversidad</h3>
          <p>
            Las variantes de un solo nucleótido (SNPs, &quot;snips&quot;) son el tipo más común de variación
            genética humana. Hay ~10 millones de SNPs en el genoma humano. Muchos son neutros,
            pero algunos afectan la susceptibilidad a enfermedades, la respuesta a fármacos
            (farmacogenómica) o rasgos físicos. Son la base de los tests de ancestría genética.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota pedagógica:</strong> algunos porcentajes de similitud genética varían
            según el estudio y el método de comparación utilizado (secuencias codificantes, genoma
            completo, ortólogos directos). Los valores indicados son las estimaciones más citadas
            en literatura científica de referencia y son adecuados para Bachillerato y Selectividad.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-adn-numeros')} />
        <ShareCard appName="visualizador-adn-numeros" />
        <Footer appName="visualizador-adn-numeros" />
      </div>
    </>
  );
}
