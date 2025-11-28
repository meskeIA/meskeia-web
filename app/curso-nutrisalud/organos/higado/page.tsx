'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNutrisalud.module.css';

export default function HigadoPage() {
  const sections = [
    {
      title: 'El Hígado: Tu Laboratorio Metabólico Central',
      icon: '🧪',
      content: (
        <>
          <p>
            El hígado es el órgano metabólico más importante de tu cuerpo. Con más de
            500 funciones conocidas, actúa como laboratorio bioquímico, almacén de
            nutrientes, central de desintoxicación y regulador del metabolismo
            energético. Todo lo que comes pasa primero por el hígado antes de
            llegar al resto del cuerpo.
          </p>

          <h3>Funciones principales:</h3>
          <ul>
            <li><strong>Metabolismo de carbohidratos:</strong> Almacena glucógeno, regula glucemia</li>
            <li><strong>Metabolismo de lípidos:</strong> Produce colesterol, metaboliza grasas</li>
            <li><strong>Síntesis de proteínas:</strong> Albúmina, factores de coagulación</li>
            <li><strong>Desintoxicación:</strong> Neutraliza toxinas, medicamentos, alcohol</li>
            <li><strong>Producción de bilis:</strong> Necesaria para digerir grasas</li>
            <li><strong>Almacenamiento:</strong> Vitaminas A, D, B12, hierro, glucógeno</li>
          </ul>

          <div className={styles.highlightBox}>
            <p>
              <strong>🔬 Capacidad de regeneración:</strong> El hígado es el único
              órgano interno que puede regenerarse. Si se extirpa hasta el 75%,
              puede volver a su tamaño original en semanas. Esto demuestra su
              importancia evolutiva y su resiliencia.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Desintoxicación: Fase I y Fase II',
      icon: '🧹',
      content: (
        <>
          <p>
            El hígado neutraliza toxinas en un proceso de dos fases que requiere
            nutrientes específicos. Sin estos nutrientes, las toxinas pueden
            quedarse &quot;a medio procesar&quot; en formas incluso más dañinas.
          </p>

          <h3>Fase I: Activación (Citocromo P450)</h3>
          <p>
            Convierte toxinas liposolubles en compuestos intermedios (a veces más
            reactivos). Requiere:
          </p>
          <ul>
            <li>Vitaminas B (especialmente B2, B3, B6, B12)</li>
            <li>Ácido fólico</li>
            <li>Antioxidantes (vitamina C, E, carotenoides)</li>
            <li>Hierro, cobre, zinc, magnesio</li>
          </ul>

          <h3>Fase II: Conjugación</h3>
          <p>
            Une los intermedios a moléculas que los hacen hidrosolubles y excretables.
            Requiere:
          </p>
          <ul>
            <li><strong>Glutatión:</strong> Principal antioxidante. Necesita cisteína (huevos, ajo)</li>
            <li><strong>Aminoácidos azufrados:</strong> Metionina, cisteína, taurina</li>
            <li><strong>Glucosinolatos:</strong> Brócoli, coles (activan enzimas de fase II)</li>
            <li><strong>Glicina:</strong> Abundante en colágeno, caldo de huesos</li>
          </ul>

          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🥦</span>
              <h4 className={styles.exampleTitle}>Crucíferas</h4>
              <p className={styles.exampleDesc}>
                Brócoli, coliflor, kale, coles.
                Sulforafano activa enzimas de desintoxicación.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🧄</span>
              <h4 className={styles.exampleTitle}>Alliums</h4>
              <p className={styles.exampleDesc}>
                Ajo, cebolla, puerro.
                Compuestos azufrados para glutatión.
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      title: 'Hígado Graso: La Epidemia Silenciosa',
      icon: '⚠️',
      content: (
        <>
          <p>
            El <strong>hígado graso no alcohólico (NAFLD)</strong> afecta a cerca del
            25% de la población adulta. Es la acumulación de grasa en el hígado por
            causas no relacionadas con el alcohol, principalmente dieta y estilo de vida.
          </p>

          <h3>Factores de riesgo:</h3>
          <ul>
            <li>Exceso de fructosa (refrescos, zumos, alimentos procesados)</li>
            <li>Resistencia a la insulina y diabetes tipo 2</li>
            <li>Obesidad abdominal</li>
            <li>Dieta alta en carbohidratos refinados</li>
            <li>Sedentarismo</li>
            <li>Exceso de omega-6 / déficit de omega-3</li>
          </ul>

          <div className={styles.warningBox}>
            <p>
              <strong>⚠️ La fructosa y el hígado:</strong> A diferencia de la glucosa
              (que todo el cuerpo puede usar), la fructosa solo se metaboliza en el
              hígado. El exceso de fructosa (especialmente jarabe de maíz alto en
              fructosa) sobrecarga el hígado y se convierte directamente en grasa.
            </p>
          </div>

          <h3>Progresión:</h3>
          <ol>
            <li><strong>Esteatosis simple:</strong> Grasa acumulada, reversible</li>
            <li><strong>Esteatohepatitis (NASH):</strong> Inflamación, daño</li>
            <li><strong>Fibrosis:</strong> Cicatrización del tejido</li>
            <li><strong>Cirrosis:</strong> Daño irreversible</li>
          </ol>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Buena noticia:</strong> Las primeras etapas son completamente
              reversibles con cambios en la alimentación y ejercicio. El hígado puede
              regenerarse si se eliminan las causas del daño.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Alimentos Hepatoprotectores',
      icon: '🛡️',
      content: (
        <>
          <h3>Alimentos que apoyan la función hepática:</h3>

          <div className={styles.exampleGrid}>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>☕</span>
              <h4 className={styles.exampleTitle}>Café</h4>
              <p className={styles.exampleDesc}>
                2-3 tazas/día reduce riesgo de enfermedad
                hepática. Antioxidantes y polifenoles.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🫒</span>
              <h4 className={styles.exampleTitle}>Aceite de oliva</h4>
              <p className={styles.exampleDesc}>
                Reduce acumulación de grasa hepática.
                Antiinflamatorio. Virgen extra mejor.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🐟</span>
              <h4 className={styles.exampleTitle}>Pescados grasos</h4>
              <p className={styles.exampleDesc}>
                Omega-3 reduce inflamación y grasa hepática.
                Salmón, sardinas, caballa.
              </p>
            </div>
            <div className={styles.exampleCard}>
              <span className={styles.exampleIcon}>🥜</span>
              <h4 className={styles.exampleTitle}>Nueces</h4>
              <p className={styles.exampleDesc}>
                Omega-3 vegetal, vitamina E.
                Mejoran enzimas hepáticas.
              </p>
            </div>
          </div>

          <h3>Otros alimentos beneficiosos:</h3>
          <ul>
            <li><strong>Crucíferas:</strong> Brócoli, coles (glucosinolatos)</li>
            <li><strong>Alcachofa:</strong> Tradicionalmente usado para la bilis</li>
            <li><strong>Remolacha:</strong> Betaína apoya metilación hepática</li>
            <li><strong>Cardo mariano:</strong> Silimarina, hepatoprotector demostrado</li>
            <li><strong>Cúrcuma:</strong> Antiinflamatorio, protege células hepáticas</li>
            <li><strong>Té verde:</strong> EGCG reduce grasa hepática</li>
          </ul>

          <div className={styles.highlightBox}>
            <p>
              <strong>🍵 Combinación óptima:</strong> Té verde + cúrcuma + pimienta
              negra + aceite de oliva. Sinergias antioxidantes, antiinflamatorias y
              hepatoprotectoras en una bebida.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Qué Evitar para Proteger Tu Hígado',
      icon: '🚫',
      content: (
        <>
          <h3>Principales amenazas hepáticas:</h3>

          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Factor</th>
                <th>Efecto en el hígado</th>
                <th>Recomendación</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Alcohol excesivo</td>
                <td>Daño directo, cirrosis</td>
                <td>Máximo 1-2 unidades/día, días libres</td>
              </tr>
              <tr>
                <td>Fructosa añadida</td>
                <td>Grasa hepática, resistencia insulina</td>
                <td>Evitar refrescos, zumos industriales</td>
              </tr>
              <tr>
                <td>Grasas trans</td>
                <td>Inflamación, daño celular</td>
                <td>Cero tolerancia</td>
              </tr>
              <tr>
                <td>Exceso de medicamentos</td>
                <td>Sobrecarga de desintoxicación</td>
                <td>Solo los necesarios, bajo supervisión</td>
              </tr>
              <tr>
                <td>Exceso omega-6</td>
                <td>Proinflamatorio</td>
                <td>Reducir aceites vegetales refinados</td>
              </tr>
            </tbody>
          </table>

          <h3>Plan de acción para un hígado sano:</h3>
          <ol>
            <li>Elimina bebidas azucaradas y zumos industriales</li>
            <li>Limita el alcohol o elimínalo periódicamente</li>
            <li>Aumenta el consumo de crucíferas (brócoli, kale)</li>
            <li>Incluye pescado graso 2-3 veces por semana</li>
            <li>Usa aceite de oliva virgen extra como grasa principal</li>
            <li>Café sin azúcar (si lo toleras) tiene beneficios</li>
            <li>Ejercicio regular (reduce grasa hepática directamente)</li>
          </ol>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 El hígado no duele:</strong> No tiene receptores de dolor,
              por lo que la enfermedad hepática puede avanzar silenciosamente.
              Los análisis de sangre (transaminasas ALT, AST) son la forma de
              detectar problemas tempranamente.
            </p>
          </div>
        </>
      ),
    },
  ];

  return <ChapterPage slug="higado" sections={sections} />;
}
