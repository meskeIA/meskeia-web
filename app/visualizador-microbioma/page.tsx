'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './Microbioma.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// --- Tipos ---

interface ZonaData {
  id: string;
  nombre: string;
  icono: string;
  cantidad: string;
  bacteriasPrincipales: string[];
  funcion: string;
  datoCurioso: string;
  color: string;
}

interface FactorData {
  id: string;
  icono: string;
  nombre: string;
  queOcurre: string;
  tiempoEfecto: string;
  recuperacion: string;
}

// --- Datos ---

const ZONAS: ZonaData[] = [
  {
    id: 'intestino',
    nombre: 'Intestino grueso',
    icono: '🫁',
    cantidad: '~38 billones de bacterias',
    bacteriasPrincipales: ['Firmicutes (60%)', 'Bacteroidetes (20%)', 'Actinobacteria (10%)', 'Otras especies (10%)'],
    funcion: 'Digieren fibra, producen vitaminas B y K, y entrenan al sistema inmune para distinguir aliados de amenazas.',
    datoCurioso: 'Las bacterias intestinales pueden pesar entre 0,5 y 2 kg: más que el cerebro.',
    color: '#2E86AB',
  },
  {
    id: 'piel',
    nombre: 'Piel',
    icono: '🧴',
    cantidad: '~1 billón de microorganismos',
    bacteriasPrincipales: ['Staphylococcus epidermidis', 'Cutibacterium acnes (no patógeno a densidades normales)', 'Corynebacterium spp.'],
    funcion: 'Forman una barrera protectora que compite con patógenos y modula la inflamación local.',
    datoCurioso: 'Cada cm² de piel alberga unas 100.000 bacterias, más que habitantes tiene la mayoría de ciudades medianas.',
    color: '#48A9A6',
  },
  {
    id: 'boca',
    nombre: 'Boca',
    icono: '🦷',
    cantidad: '~700 especies diferentes',
    bacteriasPrincipales: ['Streptococcus salivarius', 'Veillonella spp.', 'Fusobacterium nucleatum'],
    funcion: 'Primera línea defensiva del aparato digestivo; inician la digestión de carbohidratos mediante enzimas.',
    datoCurioso: 'Un beso puede transferir hasta 80 millones de bacterias en tan solo 10 segundos.',
    color: '#7FB3D3',
  },
  {
    id: 'pulmones',
    nombre: 'Pulmones',
    icono: '🫀',
    cantidad: '~2.000 especies identificadas',
    bacteriasPrincipales: ['Prevotella spp.', 'Streptococcus spp.', 'Veillonella spp.'],
    funcion: 'Modulan la respuesta inmune pulmonar y forman una barrera ante patógenos respiratorios.',
    datoCurioso: 'Durante décadas se creyó que los pulmones eran estériles. Los estudios modernos demuestran todo lo contrario.',
    color: '#5BA4CF',
  },
];

const FACTORES: FactorData[] = [
  {
    id: 'antibioticos',
    icono: '🦠',
    nombre: 'Antibióticos',
    queOcurre: 'Eliminan tanto bacterias patógenas como beneficiosas. Reducen drásticamente la diversidad microbiana, especialmente Firmicutes y Lactobacillus.',
    tiempoEfecto: 'Inmediato (24-48 horas tras la primera dosis)',
    recuperacion: '1-2 meses para diversidad parcial; hasta 2 años para recuperación completa en algunos casos',
  },
  {
    id: 'dieta-fibra',
    icono: '🥗',
    nombre: 'Dieta baja en fibra',
    queOcurre: 'Reduce la diversidad microbiana de forma progresiva. Sin fibra como sustrato, las bacterias beneficiosas no tienen alimento y decaen.',
    tiempoEfecto: 'Visible en análisis de microbioma tras 2-4 semanas',
    recuperacion: 'Reversible aumentando a 25-30 g de fibra/día mediante legumbres, verduras y cereales integrales',
  },
  {
    id: 'estres',
    icono: '😰',
    nombre: 'Estrés crónico',
    queOcurre: 'Altera la motilidad intestinal y cambia la composición microbiana. El eje HPA libera cortisol, que aumenta la permeabilidad intestinal.',
    tiempoEfecto: 'Cambios detectables tras semanas de estrés sostenido',
    recuperacion: 'Mejora progresiva al reducir el estrés; técnicas de mindfulness y ejercicio aceleran la recuperación',
  },
  {
    id: 'probioticos',
    icono: '💊',
    nombre: 'Probióticos y fermentados',
    queOcurre: 'Añaden temporalmente especies beneficiosas (Lactobacillus, Bifidobacterium). Los fermentados naturales —yogur, kéfir, kimchi, chucrut— son más efectivos que cápsulas de dudosa calidad.',
    tiempoEfecto: 'Colonización temporal (días-semanas); no permanente sin cambio de dieta',
    recuperacion: 'N/A — efecto positivo acumulativo con consumo regular',
  },
  {
    id: 'ejercicio',
    icono: '🏃',
    nombre: 'Ejercicio regular',
    queOcurre: 'Aumenta la diversidad microbiana hasta un 20%, especialmente Lactobacillus y Bifidobacterium. Mejora la integridad de la barrera intestinal.',
    tiempoEfecto: 'Mejoras observables tras 6-8 semanas de ejercicio aeróbico moderado',
    recuperacion: 'N/A — efecto protector mantenido mientras persiste el hábito',
  },
];

// --- Componente ---

export default function VisualizadorMicrobiomaPage() {
  const [zonaActiva, setZonaActiva] = useState<string>('intestino');
  const [factorActivo, setFactorActivo] = useState<string>('antibioticos');

  const zonaData = ZONAS.find((z) => z.id === zonaActiva) ?? ZONAS[0];
  const factorData = FACTORES.find((f) => f.id === factorActivo) ?? FACTORES[0];

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🦠</span> El Microbioma</h1>
          <p className={styles.subtitle}>
            Billones de aliados en tu interior — descubre el ecosistema bacteriano que vive en tu cuerpo y cómo influye en tu salud
          </p>
        </header>

        <LegalNotice />

        {/* Sección 1 — Zonas del cuerpo */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>¿Dónde vive el microbioma?</h2>
          <p className={styles.sectionSubtitle}>
            Selecciona una zona del cuerpo para explorar su ecosistema bacteriano
          </p>

          <div className={styles.zonaSelector} role="tablist" aria-label="Zonas del microbioma">
            {ZONAS.map((zona) => (
              <button
                key={zona.id}
                type="button"
                role="tab"
                aria-selected={zonaActiva === zona.id}
                className={`${styles.zonaBtnTab} ${zonaActiva === zona.id ? styles.zonaBtnActive : ''}`}
                onClick={() => setZonaActiva(zona.id)}
              >
                <span aria-hidden="true">{zona.icono}</span>
                {zona.nombre}
              </button>
            ))}
          </div>

          <div className={styles.zonaCard} role="tabpanel">
            <div className={styles.zonaHeader} style={{ borderColor: zonaData.color }}>
              <span className={styles.zonaIconBig} aria-hidden="true">{zonaData.icono}</span>
              <div>
                <h3 className={styles.zonaNombre}>{zonaData.nombre}</h3>
                <p className={styles.zonaCantidad}>{zonaData.cantidad}</p>
              </div>
            </div>

            <div className={styles.zonaGrid}>
              <div className={styles.zonaBlock}>
                <h4 className={styles.zonaBlockTitle}>Bacterias principales</h4>
                <ul className={styles.bacteriasList}>
                  {zonaData.bacteriasPrincipales.map((b, i) => (
                    <li key={i} className={styles.bacteriaItem}>
                      <span className={styles.bacteriaDot} style={{ background: zonaData.color }} aria-hidden="true" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.zonaBlock}>
                <h4 className={styles.zonaBlockTitle}>Función principal</h4>
                <p className={styles.zonaText}>{zonaData.funcion}</p>
              </div>
            </div>

            <div className={styles.datoCuriosoBox}>
              <span className={styles.datoCuriosoIcon} aria-hidden="true">💡</span>
              <p className={styles.datoCuriosoText}><strong>Dato curioso:</strong> {zonaData.datoCurioso}</p>
            </div>
          </div>
        </section>

        {/* Sección 2 — Eje intestino-cerebro */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>El eje intestino-cerebro</h2>
          <p className={styles.sectionSubtitle}>
            Una autopista bidireccional de señales entre tus bacterias intestinales y tu mente
          </p>

          <div className={styles.ejeGrid}>
            <div className={styles.ejeColumna}>
              <div className={styles.ejeHeader}>
                <span aria-hidden="true">🫁</span>
                <h3>Intestino → Cerebro</h3>
              </div>
              <ul className={styles.ejeList}>
                <li>
                  <strong>Nervio vago:</strong> ruta principal; transporta señales electroquímicas del intestino al tronco cerebral en milisegundos.
                </li>
                <li>
                  <strong>Serotonina:</strong> cerca del 90% de la serotonina del cuerpo se sintetiza en el intestino (células enterocromafines) y actúa principalmente sobre la motilidad intestinal. Esta serotonina no cruza la barrera hematoencefálica, por lo que su relación con el ánimo cerebral es indirecta y aún en investigación.
                </li>
                <li>
                  <strong>Metabolitos bacterianos:</strong> los ácidos grasos de cadena corta (propionato, butirato) cruzan la barrera hematoencefálica y modulan la inflamación neuronal.
                </li>
              </ul>
            </div>

            <div className={styles.ejeFlecha} aria-hidden="true">
              <span className={styles.ejeFlecha1}>→</span>
              <span className={styles.ejeFlecha2}>←</span>
            </div>

            <div className={styles.ejeColumna}>
              <div className={styles.ejeHeader}>
                <span aria-hidden="true">🧠</span>
                <h3>Cerebro → Intestino</h3>
              </div>
              <ul className={styles.ejeList}>
                <li>
                  <strong>Estrés y cortisol:</strong> el cerebro bajo estrés libera cortisol, que altera la motilidad intestinal y la composición microbiana.
                </li>
                <li>
                  <strong>Sistema nervioso autónomo:</strong> el cerebro regula directamente los movimientos del intestino (peristalsis) y la secreción de moco.
                </li>
                <li>
                  <strong>Ánimo, sueño y apetito:</strong> estados mentales prolongados modifican cuánto y qué comen las bacterias intestinales.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Sección 3 — Factores */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Factores que alteran el microbioma</h2>
          <p className={styles.sectionSubtitle}>
            Selecciona un factor para ver cómo afecta a tu ecosistema bacteriano
          </p>

          <div className={styles.factoresGrid} role="tablist" aria-label="Factores del microbioma">
            {FACTORES.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={factorActivo === f.id}
                className={`${styles.factorBtn} ${factorActivo === f.id ? styles.factorBtnActive : ''}`}
                onClick={() => setFactorActivo(f.id)}
              >
                <span className={styles.factorIcono} aria-hidden="true">{f.icono}</span>
                <span className={styles.factorNombre}>{f.nombre}</span>
              </button>
            ))}
          </div>

          <div className={styles.factorDetalle} role="tabpanel">
            <div className={styles.factorDetalleHeader}>
              <span aria-hidden="true" className={styles.factorDetalleIcono}>{factorData.icono}</span>
              <h3>{factorData.nombre}</h3>
            </div>

            <div className={styles.factorDetalleGrid}>
              <div className={styles.factorDetalleBlock}>
                <h4>¿Qué ocurre en el microbioma?</h4>
                <p>{factorData.queOcurre}</p>
              </div>
              <div className={styles.factorDetalleBlock}>
                <h4>Tiempo de efecto</h4>
                <p>{factorData.tiempoEfecto}</p>
              </div>
              <div className={styles.factorDetalleBlock}>
                <h4>Recuperación / Continuidad</h4>
                <p>{factorData.recuperacion}</p>
              </div>
            </div>
          </div>
        </section>

        {/* warningBox */}
        <div className={styles.warningBox} role="note">
          <span aria-hidden="true">💡</span>
          <div>
            <strong>Diversidad y salud:</strong> mayor diversidad suele asociarse a buena salud metabólica e inmunitaria en estudios observacionales, aunque no es una regla universal. La relación con la salud mental sigue en investigación. La dieta variada rica en fibra vegetal es el factor modificable más potente para mejorar la diversidad microbiana.
          </div>
        </div>

        {/* Sección educativa */}
        <EducationalSection
          title="¿Quieres aprender más sobre el microbioma?"
          subtitle="Tablas, preguntas frecuentes y pasos prácticos para cuidar tu microbiota"
        >
          <section className={styles.guideSection}>
            <h2>El microbioma por zonas del cuerpo</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Zona</th>
                    <th>Número aproximado</th>
                    <th>Función principal</th>
                    <th>Cómo mantenerlo sano</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Intestino grueso</td>
                    <td>~38 billones</td>
                    <td>Digestión de fibra, vitaminas B y K, inmunidad</td>
                    <td>Fibra variada, fermentados, ejercicio, menos antibióticos</td>
                  </tr>
                  <tr>
                    <td>Piel</td>
                    <td>~1 billón</td>
                    <td>Barrera protectora, antiinflamatoria</td>
                    <td>Jabones suaves, no sobredesinfectar, hidratación</td>
                  </tr>
                  <tr>
                    <td>Boca</td>
                    <td>~700 especies</td>
                    <td>Primera defensa digestiva, digestión carbohidratos</td>
                    <td>Higiene dental, reducir azúcar, no antibióticos innecesarios</td>
                  </tr>
                  <tr>
                    <td>Pulmones</td>
                    <td>~2.000 especies</td>
                    <td>Inmunidad pulmonar, barrera ante patógenos</td>
                    <td>No fumar, ejercicio aeróbico, aire limpio</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>¿Para qué sirve este visualizador?</h2>
            <ul className={styles.useCaseList}>
              <li>Entender por qué los antibióticos deben usarse con moderación</li>
              <li>Comprender la relación entre dieta, estrés y salud intestinal</li>
              <li>Descubrir por qué el 90% de la serotonina se produce en el intestino</li>
              <li>Aprender qué factores cotidianos afectan a billones de seres vivos que te protegen</li>
              <li>Tomar decisiones informadas sobre hábitos alimentarios y estilo de vida</li>
            </ul>
          </section>

          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqList}>
              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>¿Son todas las bacterias del microbioma malas?</summary>
                <p className={styles.faqAnswer}>No. La inmensa mayoría son comensales (neutras) o beneficiosas. Solo una minoría son patógenos oportunistas que solo causan problemas si el sistema inmune está comprometido o si su población crece desproporcionadamente.</p>
              </details>
              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>¿Cuánto tarda en recuperarse el microbioma tras un antibiótico?</summary>
                <p className={styles.faqAnswer}>La diversidad parcial se recupera en 1-2 meses. Sin embargo, algunos estudios muestran que ciertos grupos bacterianos pueden tardar hasta 2 años en volver a sus niveles previos, y en algunos casos no se recuperan del todo. Una dieta rica en fibra y probióticos acelera la recuperación.</p>
              </details>
              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>¿Los probióticos del supermercado funcionan?</summary>
                <p className={styles.faqAnswer}>Los fermentados naturales (yogur con cultivos vivos, kéfir, kimchi, chucrut) tienen evidencia más sólida que muchas cápsulas comerciales. Los suplementos probióticos son útiles en contextos específicos, pero la mayoría coloniza el intestino solo temporalmente. Sin un cambio de dieta, el efecto desaparece al dejar de tomarlos.</p>
              </details>
              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>¿El microbioma cambia con la edad?</summary>
                <p className={styles.faqAnswer}>Sí, significativamente. El microbioma cambia desde el nacimiento (colonización inicial) hasta la vejez. La diversidad tiende a reducirse con la edad. Los bebés nacidos por parto vaginal reciben bacterias vaginales de la madre; los nacidos por cesárea tienen microbiomas inicialmente menos diversos, aunque la lactancia materna los enriquece.</p>
              </details>
              <details className={styles.faqItem}>
                <summary className={styles.faqQuestion}>¿El estrés afecta realmente al intestino?</summary>
                <p className={styles.faqAnswer}>Sí. El eje intestino-cerebro es bidireccional y el estrés crónico altera la composición del microbioma. El cortisol puede aumentar la permeabilidad de la pared intestinal. La traducción clínica de esto en personas sanas sigue siendo objeto de investigación; el término popular "intestino permeable" no corresponde a un diagnóstico médico reconocido. No es solo "nervios en el estómago": es una respuesta fisiológica medible.</p>
              </details>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>5 pasos para cuidar tu microbioma</h2>
            <ol className={styles.stepsList}>
              <li><strong>Aumenta la fibra vegetal:</strong> apunta a 25-30 g/día de fuentes variadas — legumbres, verduras de hoja, frutas con piel, cereales integrales.</li>
              <li><strong>Consume fermentados regularmente:</strong> yogur natural, kéfir, kimchi o chucrut varias veces por semana aportan bacterias beneficiosas activas.</li>
              <li><strong>Usa antibióticos solo cuando sean imprescindibles:</strong> no pidas antibióticos para infecciones virales (gripe, resfriado). Completa siempre el tratamiento prescrito.</li>
              <li><strong>Muévete cada día:</strong> 30 minutos de ejercicio aeróbico moderado aumentan la diversidad microbiana y refuerzan la barrera intestinal.</li>
              <li><strong>Gestiona el estrés:</strong> meditación, respiración consciente, sueño de calidad y relaciones sociales positivas son aliados de tu microbioma.</li>
            </ol>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-microbioma')} />
        <ShareCard appName="visualizador-microbioma" />
        <Footer appName="visualizador-microbioma" />
    </div>
  );
}
