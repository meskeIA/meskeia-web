'use client';

import ChapterPage from '../ChapterPage';
import styles from '../CursoInversion.module.css';

const sections = [
  {
    title: 'Introducción a los Casos Prácticos',
    icon: '📊',
    content: (
      <>
        <p>La teoría está muy bien, pero la inversión se aprende con la práctica. En este capítulo analizaremos casos realistas de diferentes perfiles de inversores y las decisiones que tomaron.</p>

        <div className={styles.warningBox}>
          <p><strong>⚠️ Nota importante:</strong> Estos casos son ilustrativos y educativos. Las rentabilidades pasadas no garantizan resultados futuros. Cada situación personal es única y requiere un análisis individualizado.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Caso 1: María - Perfil Conservador',
    icon: '🛡️',
    content: (
      <>
        <h3>Situación inicial</h3>
        <ul>
          <li><strong>Edad:</strong> 58 años</li>
          <li><strong>Profesión:</strong> Funcionaria</li>
          <li><strong>Capital disponible:</strong> 150.000€ (herencia)</li>
          <li><strong>Ingresos estables:</strong> 2.800€/mes netos</li>
          <li><strong>Horizonte:</strong> 7 años hasta jubilación</li>
          <li><strong>Objetivo:</strong> Complementar pensión, preservar capital</li>
        </ul>

        <h3>Análisis del perfil</h3>
        <p>María tiene un horizonte relativamente corto y prioriza la seguridad. No puede permitirse una caída del 40% justo antes de jubilarse.</p>

        <h3>Estrategia elegida</h3>
        <div className={styles.highlightBox}>
          <p><strong>Asset Allocation: 30% RV / 70% RF</strong><br /><br />
          • 30% Fondo indexado MSCI World (45.000€)<br />
          • 40% Fondo de renta fija euro agregada (60.000€)<br />
          • 20% Fondo monetario / Letras del Tesoro (30.000€)<br />
          • 10% Fondo indexado de bonos ligados a inflación (15.000€)</p>
        </div>

        <h3>Resultado a 5 años (simulación)</h3>
        <ul>
          <li>Capital inicial: 150.000€</li>
          <li>Rentabilidad media estimada: 4% anual</li>
          <li>Capital final estimado: ~182.000€</li>
          <li>Máximo drawdown experimentado: -8%</li>
        </ul>

        <div className={styles.infoBox}>
          <p><strong>💡 Lección:</strong> María sacrificó rentabilidad potencial por tranquilidad. En las caídas de mercado, su cartera apenas se inmutó, lo que le permitió dormir tranquila.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Caso 2: Carlos - Perfil Agresivo',
    icon: '🚀',
    content: (
      <>
        <h3>Situación inicial</h3>
        <ul>
          <li><strong>Edad:</strong> 28 años</li>
          <li><strong>Profesión:</strong> Ingeniero de software</li>
          <li><strong>Capital inicial:</strong> 15.000€ (ahorros)</li>
          <li><strong>Capacidad de ahorro:</strong> 800€/mes</li>
          <li><strong>Horizonte:</strong> +30 años</li>
          <li><strong>Objetivo:</strong> Independencia financiera</li>
        </ul>

        <h3>Análisis del perfil</h3>
        <p>Carlos tiene tiempo de sobra para recuperarse de cualquier crisis. Su trabajo es estable y demandado. Puede asumir máximo riesgo.</p>

        <h3>Estrategia elegida</h3>
        <div className={styles.highlightBox}>
          <p><strong>Asset Allocation: 100% RV</strong><br /><br />
          • 70% ETF MSCI World (iShares IWDA)<br />
          • 20% ETF Small Cap Value (factor investing)<br />
          • 10% ETF Mercados Emergentes<br /><br />
          <strong>Aportación:</strong> 800€/mes via DCA automático</p>
        </div>

        <h3>Evolución real (2020-2024)</h3>
        <ul>
          <li>Marzo 2020: Caída COVID -35%. Carlos siguió aportando</li>
          <li>2021: Recuperación +25%. Cartera en máximos</li>
          <li>2022: Caída -20%. Carlos aumentó aportación a 1.000€</li>
          <li>2023-2024: Recuperación. Cartera actual: ~85.000€</li>
        </ul>

        <div className={styles.highlightBox}>
          <p><strong>📊 Clave del éxito de Carlos:</strong> Nunca vendió en pánico. Cuando el mercado cayó, lo vio como "acciones en oferta" y aumentó sus aportaciones. Su horizonte largo le dio perspectiva.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Caso 3: Ana y Pedro - Pareja Moderada',
    icon: '👫',
    content: (
      <>
        <h3>Situación inicial</h3>
        <ul>
          <li><strong>Edades:</strong> 42 y 40 años</li>
          <li><strong>Profesiones:</strong> Profesora y comercial</li>
          <li><strong>Capital conjunto:</strong> 80.000€</li>
          <li><strong>Ingresos:</strong> 4.500€/mes netos conjuntos</li>
          <li><strong>Objetivos:</strong> Universidad hijos (10 años) + jubilación (25 años)</li>
        </ul>

        <h3>Estrategia: Dos carteras por objetivo</h3>

        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>🎓</div>
            <div className={styles.exampleName}>Cartera Universidad (30.000€)</div>
            <div className={styles.exampleDesc}>
              <strong>Horizonte:</strong> 10 años<br />
              <strong>Allocation:</strong> 60% RV / 40% RF<br />
              Aportación: 200€/mes<br />
              Se irá haciendo más conservadora cada año
            </div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>🏖️</div>
            <div className={styles.exampleName}>Cartera Jubilación (50.000€)</div>
            <div className={styles.exampleDesc}>
              <strong>Horizonte:</strong> 25 años<br />
              <strong>Allocation:</strong> 80% RV / 20% RF<br />
              Aportación: 400€/mes<br />
              Vía fondos indexados (ventaja fiscal)
            </div>
          </div>
        </div>

        <h3>Estrategia de "glide path"</h3>
        <p>Para la cartera universidad, cada año reducen 5% de RV y aumentan RF. Así, cuando necesiten el dinero, estará protegido:</p>
        <ul>
          <li>Año 1: 60% RV / 40% RF</li>
          <li>Año 5: 35% RV / 65% RF</li>
          <li>Año 10: 10% RV / 90% RF</li>
        </ul>

        <div className={styles.infoBox}>
          <p><strong>💡 Lección:</strong> Diferentes objetivos pueden requerir diferentes carteras. No todo tiene que estar en el mismo "saco".</p>
        </div>
      </>
    ),
  },
  {
    title: 'Caso 4: Errores Reales a Evitar',
    icon: '❌',
    content: (
      <>
        <p>Aprendamos también de los errores más comunes:</p>

        <h3>Error 1: Luis y el FOMO de las criptomonedas</h3>
        <ul>
          <li>Noviembre 2021: Invirtió 20.000€ en Bitcoin a 60.000$</li>
          <li>Motivo: "Todos mis amigos están ganando dinero"</li>
          <li>Enero 2022: Bitcoin a 35.000$. Aguantó</li>
          <li>Junio 2022: Bitcoin a 20.000$. Vendió en pánico</li>
          <li>Pérdida: -66% (~13.000€ perdidos)</li>
        </ul>
        <div className={styles.warningBox}>
          <p><strong>Lección:</strong> Compró por FOMO, sin entender el activo, con dinero que no podía perder, y vendió en el peor momento por pánico.</p>
        </div>

        <h3>Error 2: Marta y las comisiones del banco</h3>
        <ul>
          <li>Cartera de 100.000€ en fondos de su banco</li>
          <li>Comisiones totales: 2,5% anual</li>
          <li>En 20 años: pagó ~50.000€ en comisiones</li>
          <li>Si hubiera usado fondos indexados (0,2%): ~4.000€</li>
          <li>Diferencia: 46.000€ regalados al banco</li>
        </ul>
        <div className={styles.warningBox}>
          <p><strong>Lección:</strong> Las comisiones "pequeñas" se comen una parte enorme de tu patrimonio a largo plazo. Un 2% anual parece poco, pero es devastador.</p>
        </div>

        <h3>Error 3: Javier y el market timing</h3>
        <ul>
          <li>2019: "El mercado está muy alto, voy a esperar"</li>
          <li>2020: "Ahora hay una pandemia, mejor espero más"</li>
          <li>2021: "Ya ha subido mucho, seguro que corrige"</li>
          <li>2024: Sigue esperando el "momento perfecto"</li>
          <li>Resultado: Se perdió un +80% del mercado</li>
        </ul>
        <div className={styles.highlightBox}>
          <p><strong>Lección:</strong> "Time in the market beats timing the market". Nadie sabe cuándo es el mejor momento. El mejor momento fue ayer, el segundo mejor es hoy.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Tu Plan de Acción Personal',
    icon: '✅',
    content: (
      <>
        <p>Basándote en lo aprendido, crea tu propio plan:</p>

        <h3>Checklist antes de invertir</h3>
        <ol>
          <li>☐ Tengo fondo de emergencia (3-6 meses gastos)</li>
          <li>☐ No tengo deudas de alto interés</li>
          <li>☐ He definido mi horizonte temporal</li>
          <li>☐ Conozco mi tolerancia al riesgo</li>
          <li>☐ He elegido mi asset allocation</li>
          <li>☐ He seleccionado productos concretos (ETFs/fondos)</li>
          <li>☐ He abierto cuenta en un broker adecuado</li>
          <li>☐ He configurado aportaciones automáticas</li>
          <li>☐ He documentado mi plan por escrito</li>
          <li>☐ Entiendo la fiscalidad básica</li>
        </ol>

        <h3>Plantilla de Plan de Inversión</h3>
        <div className={styles.highlightBox}>
          <p><strong>Mi situación:</strong><br />
          Edad: ___ | Horizonte: ___ años | Capacidad ahorro: ___€/mes<br /><br />
          <strong>Mi objetivo principal:</strong><br />
          ________________________________<br /><br />
          <strong>Mi asset allocation:</strong><br />
          ___% Renta Variable | ___% Renta Fija | ___% Otros<br /><br />
          <strong>Mis productos elegidos:</strong><br />
          1. ________________________________<br />
          2. ________________________________<br />
          3. ________________________________<br /><br />
          <strong>Rebalanceo:</strong> Cada ___ meses o si desviación &gt; ___%<br /><br />
          <strong>Venderé solo si:</strong><br />
          ________________________________</p>
        </div>

        <div className={styles.infoBox}>
          <p><strong>💡 Último consejo:</strong> Imprime tu plan y guárdalo. Cuando el mercado caiga y sientas pánico, léelo. Te recordará por qué tomaste estas decisiones cuando estabas calmado y racional.</p>
        </div>
      </>
    ),
  },
];

export default function CasosPracticosPage() {
  return <ChapterPage slug="casos-practicos" sections={sections} />;
}
