'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export default function GuiaPage() {
  return (
    <>
      {/* Navegación breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/">🏠 meskeIA</Link>
        <span>›</span>
        <Link href="/guias">📚 Guías</Link>
        <span>›</span>
        <span className={styles.current}>Guía actual</span>
      </nav>

      <div className={styles.container}>
        <article className={styles.content}>
          <h1 id="guia-completa-nutrisalud-2025">Guía Completa: NutriSalud 2025</h1>
<blockquote>
<p>Aprende a usar NutriSalud de forma efectiva. Guía práctica con ejemplos reales y casos de uso para optimizar tu alimentación.</p>
</blockquote>
<h2 id="tabla-de-contenidos">📋 Tabla de Contenidos</h2>
<ol>
<li><a href="#que-es">¿Qué es NutriSalud?</a></li>
<li><a href="#para-que-sirve">¿Para qué sirve?</a></li>
<li><a href="#como-usar">Cómo usar NutriSalud paso a paso</a></li>
<li><a href="#ejemplos">Ejemplos prácticos</a></li>
<li><a href="#faqs">Preguntas frecuentes</a></li>
<li><a href="#consejos">Consejos y mejores prácticas</a></li>
</ol>
<hr/>
<h2 id="que-es">¿Qué es NutriSalud?</h2>
<p>NutriSalud es una herramienta web de cálculo nutricional diseñada para ayudarte a entender exactamente qué estás comiendo y cómo optimizar tu alimentación. Se trata de una calculadora inteligente que analiza los macronutrientes (proteínas, grasas e hidratos de carbono) y micronutrientes (vitaminas y minerales) de tu dieta diaria.</p>
<p>Aunque existen muchas aplicaciones de nutrición, NutriSalud destaca por su simplicidad y precisión. No necesitas crear cuentas complicadas ni compartir datos personales; simplemente accedes, introduces lo que has comido, y obtienes un análisis detallado al instante. Es especialmente útil si eres alguien que quiere tomar el control de su salud sin depender de nutricionistas costosos o aplicaciones de suscripción.</p>
<p>NutriSalud es perfecta tanto si estás empezando a interesarte por la nutrición como si llevas tiempo buscando una herramienta más precisa. Ya sea que quieras perder peso, ganar masa muscular o simplemente entender mejor qué necesita tu cuerpo, NutriSalud te ofrece los datos que necesitas.</p>
<p><strong>Características principales:</strong>
- Cálculo automático de calorías diarias recomendadas según tus datos personales
- Análisis detallado de macronutrientes (proteínas, grasas, carbohidratos)
- Seguimiento de micronutrientes y su distribución
- Base de datos actualizada con alimentos españoles
- Interfaz intuitiva sin necesidad de conocimientos técnicos
- Acceso sin registro y completamente gratuito</p>
<hr/>
<h2 id="para-que-sirve">¿Para qué sirve NutriSalud?</h2>
<h3 id="casos-de-uso-principales">Casos de uso principales:</h3>
<h4 id="1-calcular-cuantas-calorias-necesitas-consumir-diariamente">1. Calcular cuántas calorías necesitas consumir diariamente</h4>
<p>Este es probablemente el uso más frecuente de NutriSalud. Muchas personas saben que deben "cuidar las calorías", pero no saben cuál es su número exacto. El metabolismo basal varía enormemente según edad, sexo, peso, altura y nivel de actividad física.</p>
<p>NutriSalud te ayuda a determinar tu gasto calórico diario total (TDEE) de forma personalizada. Introduces tus datos biométricos y tu nivel de actividad, y la herramienta calcula cuántas calorías necesitas para mantener tu peso actual, o cuántas debes consumir si quieres perder o ganar peso.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>María, 34 años, mujer, 168 cm, 72 kg, con trabajo sedentario y sin ejercicio regular. Al usar NutriSalud, descubre que su gasto calórico diario es de aproximadamente 2.100 calorías. Si quiere perder peso, debería consumir alrededor de 1.680 calorías diarias (20% menos). Este dato es fundamental para cualquier dieta que quiera seguir.</p>
</blockquote>
<h4 id="2-planificar-dietas-con-macronutrientes-automaticos">2. Planificar dietas con macronutrientes automáticos</h4>
<p>Una vez conoces tu ingesta calórica, el siguiente paso es distribuir esas calorías entre macronutrientes. NutriSalud no solo te dice cuántas calorías comer, sino cómo distribuirlas entre proteínas, grasas e hidratos de carbono, teniendo en cuenta tus objetivos específicos.</p>
<p>Si tu meta es construir músculo, necesitas más proteína. Si buscas pérdida de grasa, quizás prefieras una proporción diferente. NutriSalud calcula estas proporciones automáticamente y te muestra exactamente cuántos gramos de cada macronutriente debes consumir diariamente.</p>
<h4 id="3-controlar-y-monitorizar-micronutrientes">3. Controlar y monitorizar micronutrientes</h4>
<p>Muchas dietas se centran solo en calorías y macros, pero ignoran los micronutrientes. NutriSalud te muestra qué vitaminas y minerales estás ingiriendo realmente. ¿Comes suficiente hierro? ¿Cubres tus necesidades de calcio? ¿Tu consumo de sodio es excesivo?</p>
<p>Este análisis es crucial porque carencias en micronutrientes pueden causar fatiga, debilitamiento óseo, problemas de piel o incluso afectar tu inmunidad, sin que necesariamente falta energía calórica.</p>
<h4 id="4-disenar-planes-de-comidas-personalizados">4. Diseñar planes de comidas personalizados</h4>
<p>Con NutriSalud, puedes crear un plan de comidas semanal respaldado por datos reales. No es un plan genérico; es específico para ti, basado en tus calorías, macros y preferencias alimentarias. Puedes ajustar las comidas hasta que veas que los números encajan perfectamente con tus objetivos.</p>
<h4 id="5-identificar-desequilibrios-en-tu-alimentacion-actual">5. Identificar desequilibrios en tu alimentación actual</h4>
<p>Quizás llevas meses comiendo sin registrar nada. Al usar NutriSalud durante una semana típica, descubrirás patrones sorprendentes. Muchas personas descubren que no comen suficiente proteína, que su consumo de azúcares es excesivo, o que les falta fibra.</p>
<hr/>
<h2 id="como-usar">Cómo usar NutriSalud paso a paso</h2>
<h3 id="paso-1-acceder-a-la-herramienta">Paso 1: Acceder a la herramienta</h3>
<p>Dirígete a https://meskeia.com/nutrisalud/ en tu navegador. No necesitas descargar nada ni crear una cuenta. La herramienta funciona directamente en el navegador, así que tardará solo unos segundos en cargar. NutriSalud también es completamente responsive, lo que significa que funciona perfectamente en móvil, tablet o PC.</p>
<h3 id="paso-2-introducir-tus-datos-personales">Paso 2: Introducir tus datos personales</h3>
<p>El siguiente paso es proporcionar información básica sobre ti. NutriSalud te pedirá:</p>
<ul>
<li><strong>Edad:</strong> Introduce tu edad actual en años</li>
<li><strong>Sexo:</strong> Selecciona si eres hombre o mujer (el cálculo es diferente porque el metabolismo basal varía)</li>
<li><strong>Altura:</strong> En centímetros</li>
<li><strong>Peso actual:</strong> En kilogramos</li>
<li><strong>Nivel de actividad física:</strong> Desde sedentario (poco o ningún ejercicio) hasta muy activo (entrenamiento intenso varios días por semana)</li>
</ul>
<p>Estos datos son fundamentales porque NutriSalud los utiliza para calcular tu metabolismo basal y tu gasto calórico total. Cuanto más precisos sean estos datos, más exactos serán tus resultados.</p>
<h3 id="paso-3-definir-tu-objetivo-nutricional">Paso 3: Definir tu objetivo nutricional</h3>
<p>¿Qué esperas lograr? NutriSalud te ofrece diferentes opciones:</p>
<ul>
<li><strong>Mantener peso:</strong> Consumir el número exacto de calorías que gastas diariamente</li>
<li><strong>Pérdida de peso:</strong> Crear un déficit calórico (generalmente 15-20%)</li>
<li><strong>Ganancia muscular:</strong> Crear un superávit calórico controlado (5-10%)</li>
<li><strong>Recomposición corporal:</strong> Cambiar grasa por músculo manteniendo peso similar</li>
</ul>
<p>Selecciona el que mejor se ajuste a tu situación actual. La mayoría de personas que usan NutriSalud buscan perder peso, así que este es el escenario más común.</p>
<h3 id="paso-4-registrar-tu-consumo-diario-de-alimentos">Paso 4: Registrar tu consumo diario de alimentos</h3>
<p>Este es el paso donde realmente entra en acción NutriSalud. Para cada comida (desayuno, almuerzo, merienda, cena), añades los alimentos que has consumido. NutriSalud tiene una base de datos extensa que incluye:</p>
<ul>
<li>Alimentos básicos (arroz, pasta, carne, pescado, verduras)</li>
<li>Productos elaborados españoles comunes</li>
<li>Opciones de diferentes marcas</li>
<li>Posibilidad de buscar por nombre</li>
</ul>
<p>Introduce la cantidad que has comido (en gramos, piezas o medidas caseras), y NutriSalud calcula automáticamente las calorías y nutrientes.</p>
<p>💡 <strong>Consejo</strong>: Usa una báscula de cocina para más precisión, especialmente al principio. Los errores pequeños en cantidad se acumulan a lo largo del día. 100 gramos de más de aceite significa 900 calorías extra.</p>
<hr/>
<h2 id="ejemplos">Ejemplos prácticos</h2>
<h3 id="ejemplo-1-calcular-necesidades-caloricas-para-una-mujer-activa">Ejemplo 1: Calcular necesidades calóricas para una mujer activa</h3>
<p><strong>Situación:</strong> Ana tiene 28 años, mide 165 cm, pesa 68 kg y realiza ejercicio 4-5 veces por semana (pilates, running, algo de pesas). Su trabajo es en oficina (sedentario durante el día).</p>
<p><strong>Datos de entrada en NutriSalud:</strong>
- Edad: 28 años
- Sexo: Mujer
- Altura: 165 cm
- Peso: 68 kg
- Nivel de actividad: Muy activo (4-5 días/semana)
- Objetivo: Perder peso</p>
<p><strong>Resultado:</strong> 
- Metabolismo basal: 1.520 calorías/día
- Gasto calórico total: 2.340 calorías/día
- Ingesta recomendada para déficit (15%): 1.989 calorías/día</p>
<p><strong>Interpretación:</strong> 
Ana necesita consumir aproximadamente 2.000 calorías diarias para perder peso de forma segura sin sacrificar su energía para los entrenamientos. Si comiera solo 1.500 calorías (déficit muy agresivo), se sentiría fatigada y podría perder masa muscular además de grasa.</p>
<hr/>
<h3 id="ejemplo-2-crear-un-plan-de-macronutrientes-para-ganancia-muscular">Ejemplo 2: Crear un plan de macronutrientes para ganancia muscular</h3>
<p><strong>Situación:</strong> Carlos, 32 años, hombre, 178 cm, 75 kg, entrena musculación 5 días por semana. Quiere ganar masa muscular.</p>
<p><strong>Datos de entrada en NutriSalud:</strong>
- Edad: 32 años
- Sexo: Hombre
- Altura: 178 cm
- Peso: 75 kg
- Nivel de actividad: Muy activo (5 días/semana musculación)
- Objetivo: Ganancia de masa muscular</p>
<p><strong>Resultado:</strong>
- Gasto calórico total: 2.850 calorías/día
- Ingesta recomendada: 3.135 calorías/día (superávit 10%)
- Distribución recomendada:
  - Proteína: 150 g (30% de calorías)
  - Grasas: 104 g (30% de calorías)
  - Carbohidratos: 392 g (40% de calorías)</p>
<p><strong>Interpretación:</strong> 
Carlos debe comer 300 calorías más que su gasto para crear un ligero superávit que le permita ganar músculo. La proporción alta de proteína (2g/kg de peso corporal) es esencial para la síntesis proteica. Los carbohidratos alimentan sus entrenamientos, y las grasas mantienen hormonas normales.</p>
<hr/>
<h3 id="ejemplo-3-analizar-deficiencias-de-micronutrientes-en-una-dieta-actual">Ejemplo 3: Analizar deficiencias de micronutrientes en una dieta actual</h3>
<p><strong>Situación:</strong> Laura registra durante una semana típica qué come realmente usando NutriSalud. Come bastante verdura, algo de pescado, pero admite que toma muchos ultraprocesados.</p>
<p><strong>Datos de entrada:</strong>
Lunes a viernes: desayunos de café con tostadas, almuerzos de sándwich y refrescos, cenas de pescadilla congelada y arroz.</p>
<p><strong>Resultado en NutriSalud (análisis de micronutrientes):</strong>
- Vitamina D: 25% de la recomendación (muy baja)
- Hierro: 60% de la recomendación (insuficiente)
- Calcio: 45% de la recomendación (deficiente)
- Vitamina C: 120% de la recomendación (correcto)
- Fibra: 40% de la recomendación (muy baja)</p>
<p><strong>Interpretación:</strong>
Laura debe incluir más alimentos ricos en vitamina D (pescados grasos, huevos), aumentar hierro (lentejas, espinacas, carne roja), consumir más calcio (yogur, queso) y fibra (frutas, cereales integrales, legumbres). Estos pequeños cambios mejorarán su energía y salud general sin necesidad de aumentar calorías.</p>
<hr/>
<h2 id="faqs">Preguntas frecuentes (FAQs)</h2>
<h3 id="realmente-funciona-nutrisalud-sin-crear-una-cuenta">❓ ¿Realmente funciona NutriSalud sin crear una cuenta?</h3>
<p>Sí, completamente. NutriSalud es una herramienta gratuita sin necesidad de registro. Accedes, calculas lo que necesitas, y los resultados aparecen al instante. Si quieres guardar un plan, puedes hacerlo descargando como PDF o tomando capturas de pantalla. Algunos usuarios prefieren esta privacidad frente a apps que rastrean todos tus datos.</p>
<h3 id="cuales-son-las-diferencias-entre-un-hombre-y-una-mujer-en-los-calculos-de-nutrisalud">❓ ¿Cuáles son las diferencias entre un hombre y una mujer en los cálculos de NutriSalud?</h3>
<p>El metabolismo basal de las mujeres es generalmente 5-10% más bajo que el de los hombres con similares características (peso, altura, edad). Esto se debe a que las mujeres típicamente tienen menos masa muscular en reposo. NutriSalud aplica ecuaciones científicamente validadas (como Harris-Benedict o Mifflin-St Jeor) que tienen en cuenta estas diferencias biológicas. Por eso es crucial especificar correctamente tu sexo en la herramienta.</p>
<h3 id="que-nivel-de-actividad-debo-seleccionar-en-nutrisalud">❓ ¿Qué nivel de actividad debo seleccionar en NutriSalud?</h3>
<p>Esta es la elección que más afecta a tus resultados. La recomendación es:
- <strong>Sedentario:</strong> Trabajas en oficina, haces poco o ningún ejercicio
- <strong>Ligeramente activo:</strong> Ejercicio ligero 1-3 días por semana
- <strong>Moderadamente activo:</strong> Ejercicio moderado 3-5 días por semana
- <strong>Muy activo:</strong> Entrenamientos intensos 5-6 días por semana
- <strong>Extremadamente activo:</strong> Entrenamientos muy intensos todos los días o trabajos físicamente exigentes</p>
<p>Si dudas, elige el nivel inferior. Subestimar siempre es mejor que sobrestimar, porque si calculas más calorías de las que realmente gastas y comes esa cantidad, no perderás peso.</p>
<h3 id="como-se-si-nutrisalud-me-esta-dando-numeros-correctos">❓ ¿Cómo sé si NutriSalud me está dando números correctos?</h3>
<p>La mejor forma es hacer un pequeño test: usa NutriSalud para calcular tu ingesta durante dos semanas manteniéndote en ese número de calorías exactamente. Pésate al inicio y al final. Si ves cambios consistentes (por ejemplo, pierdes aproximadamente 0,5 kg a la semana con déficit calórico moderado), significa que los números de NutriSalud son precisos para ti. Cada persona es ligeramente diferente, así que los ajustes finales siempre son necesarios.</p>
<h3 id="puedo-usar-nutrisalud-en-mi-telefono-movil">❓ ¿Puedo usar NutriSalud en mi teléfono móvil?</h3>
<p>Absolutamente. NutriSalud es completamente responsive y funciona perfectamente en cualquier dispositivo móvil.</p>

<div style={{marginTop: "3rem", paddingTop: "2rem", borderTop: "2px solid var(--border)", textAlign: "center"}}>
<a href="../index.html" style={{display: "inline-block", background: "var(--primary)", color: "white", padding: "0.75rem 2rem", borderRadius: "8px", textDecoration: "none", fontWeight: "600", transition: "all 0.3s ease", boxShadow: "0 2px 8px rgba(46, 134, 171, 0.2)"}}>
                ← Volver al índice de guías
            </a>

<div className="cta-box">
<h3>🎯 Prueba NutriSalud ahora</h3>
<p>Herramienta 100% gratuita, sin registro, funciona offline</p>
<a className="cta-button" href="https://meskeia.com/nutrisalud/">Ir a NutriSalud →</a>
</div>
</div>
        </article>
      </div>

      <Footer appName="meskeIA" />
    </>
  );
}
