'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNutrisalud.module.css';

export default function MitosNutricionalesPage() {
  const sections = [
    {
      title: 'Mitos vs. Ciencia: Separando Hechos de Ficción',
      icon: '🔬',
      content: (
        <>
          <p>
            La nutrición está plagada de mitos que se repiten tanto que parecen
            verdades. Muchos nacen de estudios mal interpretados, marketing agresivo,
            o simplificaciones excesivas. Desmontarlos requiere entender la ciencia
            detrás de cada afirmación.
          </p>
          <p>
            En este capítulo analizamos los mitos más extendidos con evidencia
            científica actual. Algunos te sorprenderán porque contradicen lo que
            has escuchado toda tu vida.
          </p>

          <div className={styles.highlightBox}>
            <p>
              <strong>🎯 Criterio para evaluar afirmaciones:</strong> Una afirmación
              nutricional es sospechosa si: (1) promete resultados milagrosos,
              (2) demoniza o glorifica un solo alimento, (3) ignora el contexto
              individual, o (4) viene de fuentes con conflictos de interés.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Mitos sobre Grasas',
      icon: '🧈',
      content: (
        <>
          <h3>❌ MITO: &quot;Las grasas engordan y son malas&quot;</h3>
          <div className={styles.mythCard}>
            <p className={styles.mythStatement}>
              &quot;Debes evitar las grasas para perder peso y estar sano&quot;
            </p>
            <p className={styles.truthStatement}>
              <strong>✅ REALIDAD:</strong> Las grasas son esenciales y no engordan
              más que otros macronutrientes a igual cantidad de calorías. Lo que
              importa es el <em>tipo</em> de grasa y el contexto dietético total.
            </p>
          </div>

          <h4>La evidencia:</h4>
          <ul>
            <li>Estudios metaanalíticos muestran que dietas altas en grasas saludables son igual de efectivas para perder peso</li>
            <li>Las grasas saturadas no son tan dañinas como se creía (contexto importa)</li>
            <li>Las grasas trans artificiales sí son perjudiciales</li>
            <li>Omega-3 tiene efectos antiinflamatorios demostrados</li>
          </ul>

          <h3>❌ MITO: &quot;El colesterol dietético sube el colesterol en sangre&quot;</h3>
          <div className={styles.mythCard}>
            <p className={styles.mythStatement}>
              &quot;Evita los huevos porque tienen mucho colesterol&quot;
            </p>
            <p className={styles.truthStatement}>
              <strong>✅ REALIDAD:</strong> El hígado regula el colesterol. Para la
              mayoría de personas, el colesterol dietético tiene poco impacto en
              el colesterol sanguíneo. Los huevos son un alimento muy nutritivo.
            </p>
          </div>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Dato:</strong> Las guías dietéticas de EE.UU. eliminaron
              en 2015 el límite de 300mg de colesterol diario porque la evidencia
              no lo justificaba. Un huevo tiene ~186mg y puede consumirse a diario
              sin problemas para la mayoría de personas.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Mitos sobre Carbohidratos',
      icon: '🍞',
      content: (
        <>
          <h3>❌ MITO: &quot;Los carbohidratos engordan&quot;</h3>
          <div className={styles.mythCard}>
            <p className={styles.mythStatement}>
              &quot;Elimina los carbohidratos para perder peso&quot;
            </p>
            <p className={styles.truthStatement}>
              <strong>✅ REALIDAD:</strong> Los carbohidratos no engordan per se.
              El exceso calórico engorda, venga de donde venga. Los carbohidratos
              complejos (integrales, legumbres, verduras) son parte de dietas
              saludables en todo el mundo.
            </p>
          </div>

          <h4>Contexto importante:</h4>
          <ul>
            <li>Las poblaciones más longevas (zonas azules) consumen carbohidratos abundantes</li>
            <li>La diferencia está en la <strong>calidad</strong>: integral vs. refinado</li>
            <li>Dietas low-carb funcionan para algunos, pero no son superiores a largo plazo</li>
            <li>Los deportistas necesitan carbohidratos para rendimiento</li>
          </ul>

          <h3>❌ MITO: &quot;El gluten es malo para todos&quot;</h3>
          <div className={styles.mythCard}>
            <p className={styles.mythStatement}>
              &quot;Todos deberíamos evitar el gluten&quot;
            </p>
            <p className={styles.truthStatement}>
              <strong>✅ REALIDAD:</strong> Solo el 1% tiene celiaquía y ~6% tiene
              sensibilidad no celíaca. Para el 93% restante, el gluten no es un
              problema. Los productos &quot;sin gluten&quot; no son más saludables
              (a menudo son más procesados).
            </p>
          </div>

          <div className={styles.warningBox}>
            <p>
              <strong>⚠️ Importante:</strong> Si sospechas intolerancia al gluten,
              NO elimines el gluten antes de hacerte las pruebas. Las pruebas
              requieren que estés consumiendo gluten para ser precisas.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Mitos sobre Proteínas y Suplementos',
      icon: '💪',
      content: (
        <>
          <h3>❌ MITO: &quot;Necesitas suplementos de proteína&quot;</h3>
          <div className={styles.mythCard}>
            <p className={styles.mythStatement}>
              &quot;Sin batidos de proteína no ganarás músculo&quot;
            </p>
            <p className={styles.truthStatement}>
              <strong>✅ REALIDAD:</strong> La mayoría de personas obtiene suficiente
              proteína de la dieta. Los suplementos son convenientes, no mágicos.
              Un huevo, 100g de pollo o 200g de legumbres aportan 15-25g de proteína.
            </p>
          </div>

          <h3>❌ MITO: &quot;Demasiada proteína daña los riñones&quot;</h3>
          <div className={styles.mythCard}>
            <p className={styles.mythStatement}>
              &quot;Las dietas altas en proteína causan problemas renales&quot;
            </p>
            <p className={styles.truthStatement}>
              <strong>✅ REALIDAD:</strong> En personas con riñones sanos, no hay
              evidencia de daño con proteína alta (hasta 2-3g/kg). Solo quienes
              ya tienen enfermedad renal deben limitar proteína.
            </p>
          </div>

          <h3>❌ MITO: &quot;Los multivitamínicos son necesarios&quot;</h3>
          <div className={styles.mythCard}>
            <p className={styles.mythStatement}>
              &quot;Toma un multivitamínico como seguro&quot;
            </p>
            <p className={styles.truthStatement}>
              <strong>✅ REALIDAD:</strong> Los estudios no muestran beneficios
              de multivitamínicos en personas con dieta variada. Excepciones:
              B12 en veganos, vitamina D en deficiencia, folato en embarazo.
              Mejor suplementar específicamente si hay carencia demostrada.
            </p>
          </div>

          <div className={styles.infoBox}>
            <p>
              <strong>💡 Suplementos con evidencia sólida:</strong> Vitamina D
              (si hay deficiencia), Omega-3 (si no comes pescado), B12 (veganos),
              Creatina (deportistas), y poco más. El resto generalmente es dinero
              tirado.
            </p>
          </div>
        </>
      ),
    },
    {
      title: 'Mitos sobre Alimentos Específicos',
      icon: '🍎',
      content: (
        <>
          <h3>❌ MITO: &quot;Desayunar es obligatorio&quot;</h3>
          <div className={styles.mythCard}>
            <p className={styles.mythStatement}>
              &quot;El desayuno es la comida más importante del día&quot;
            </p>
            <p className={styles.truthStatement}>
              <strong>✅ REALIDAD:</strong> El desayuno no es más importante que
              otras comidas. Si no tienes hambre por la mañana, no pasa nada por
              saltártelo. Lo que importa es la calidad y cantidad total del día.
            </p>
          </div>

          <h3>❌ MITO: &quot;Los superalimentos curan todo&quot;</h3>
          <div className={styles.mythCard}>
            <p className={styles.mythStatement}>
              &quot;La chía/quinoa/açaí son milagrosos&quot;
            </p>
            <p className={styles.truthStatement}>
              <strong>✅ REALIDAD:</strong> &quot;Superalimento&quot; es un término de
              marketing, no científico. Estos alimentos son nutritivos, pero no
              más que alternativas locales más baratas. Las lentejas son tan
              &quot;super&quot; como la quinoa.
            </p>
          </div>

          <h3>❌ MITO: &quot;El zumo de fruta es sano&quot;</h3>
          <div className={styles.mythCard}>
            <p className={styles.mythStatement}>
              &quot;Un zumo natural es tan sano como la fruta&quot;
            </p>
            <p className={styles.truthStatement}>
              <strong>✅ REALIDAD:</strong> Al exprimir, pierdes la fibra y concentras
              el azúcar. Un vaso de zumo tiene el azúcar de 3-4 naranjas sin la
              fibra que modula su absorción. Mejor comer la fruta entera.
            </p>
          </div>

          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Mito</th>
                <th>Realidad</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>&quot;Beber 8 vasos de agua al día&quot;</td>
                <td>Bebe según tu sed. Las necesidades varían.</td>
              </tr>
              <tr>
                <td>&quot;Cenar engorda&quot;</td>
                <td>Las calorías totales importan, no la hora.</td>
              </tr>
              <tr>
                <td>&quot;Lo natural es mejor&quot;</td>
                <td>Natural ≠ saludable. El arsénico es natural.</td>
              </tr>
              <tr>
                <td>&quot;Los lácteos son malos&quot;</td>
                <td>Para la mayoría son nutritivos y seguros.</td>
              </tr>
              <tr>
                <td>&quot;Comer cada 3 horas&quot;</td>
                <td>No hay evidencia. Come según tu hambre.</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.highlightBox}>
            <p>
              <strong>🧠 Principio general:</strong> Desconfía de afirmaciones
              extremas. La nutrición rara vez es blanco o negro. Casi todo
              depende del contexto: cantidad, frecuencia, qué más comes, tu
              genética, tu actividad, tus objetivos. La moderación y variedad
              funcionan para casi todos.
            </p>
          </div>
        </>
      ),
    },
  ];

  return <ChapterPage slug="mitos-nutricionales" sections={sections} />;
}
