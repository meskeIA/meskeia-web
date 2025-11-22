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
          <h1 id="guia-completa-tir-y-van-2025">Guía Completa: TIR y VAN 2025</h1>
<blockquote>
<p>Aprende a usar TIR y VAN de forma efectiva. Guía práctica con ejemplos reales y casos de uso para evaluar tus inversiones como un profesional.</p>
</blockquote>
<h2 id="tabla-de-contenidos">📋 Tabla de Contenidos</h2>
<ol>
<li><a href="#que-es">¿Qué es TIR y VAN?</a></li>
<li><a href="#para-que-sirve">¿Para qué sirve?</a></li>
<li><a href="#como-usar">Cómo usar TIR y VAN paso a paso</a></li>
<li><a href="#ejemplos">Ejemplos prácticos</a></li>
<li><a href="#faqs">Preguntas frecuentes</a></li>
<li><a href="#consejos">Consejos y mejores prácticas</a></li>
</ol>
<hr/>
<h2 id="que-es">¿Qué es TIR y VAN?</h2>
<p>Cuando te planteas invertir dinero en un proyecto, necesitas saber si realmente te va a ser rentable. Aquí es donde entran en juego dos conceptos financieros fundamentales: el TIR (Tasa Interna de Retorno) y el VAN (Valor Actual Neto).</p>
<p>El <strong>VAN</strong> es el valor que obtendrías hoy si ejecutaras un proyecto de inversión, teniendo en cuenta todos los flujos de dinero que entrarán y saldrán a lo largo de los años. Te ayuda a entender cuánto dinero "real" va a generarte una inversión, descontando el valor del dinero en el tiempo. Si el VAN es positivo, significa que el proyecto te hará ganar dinero; si es negativo, perderás dinero.</p>
<p>El <strong>TIR</strong>, por su parte, es la tasa de retorno porcentual que te ofrece un proyecto. Es el porcentaje de rentabilidad anual que obtendrías de tu inversión. Dicho de otra forma, es el tipo de interés al que tu inversión crece cada año. Si el TIR es mayor que lo que te ofrecería una inversión alternativa (como un depósito bancario), entonces el proyecto merece la pena.</p>
<p>La diferencia principal es que el VAN te da una cantidad en euros, mientras que el TIR te da un porcentaje. Ambas métricas trabajan juntas para darte una visión completa de si tu inversión es viable.</p>
<p><strong>Características principales:</strong>
- Cálculo automático y sin errores de fórmulas complejas
- Resultados instantáneos sin necesidad de software especializado
- Comparación fácil entre múltiples proyectos de inversión
- Interfaz intuitiva que no requiere conocimientos avanzados de finanzas</p>
<hr/>
<h2 id="para-que-sirve">¿Para qué sirve TIR y VAN?</h2>
<h3 id="casos-de-uso-principales">Casos de uso principales:</h3>
<h4 id="1-decidir-si-un-proyecto-de-negocio-es-rentable">1. Decidir si un proyecto de negocio es rentable</h4>
<p>Cuando tienes una idea de negocio o un proyecto empresarial, necesitas evaluar si realmente te va a generar beneficios antes de invertir tu dinero. Utilizando TIR y VAN, puedes proyectar los flujos de caja futuros y determinar de forma objetiva si el proyecto es viable. Esta es probablemente la aplicación más común del TIR y VAN en las pymes españolas.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Acabas de heredar 50.000 euros y tu hermano te propone invertir juntos en un pequeño bar en el centro de la ciudad. Antes de decidir, necesitas saber cuánto dinero recuperarías en 5 años y a qué ritmo crece tu inversión. Con TIR y VAN, calculas que el VAN es de 12.000 euros positivos y el TIR es del 15% anual. Esto te dice que, después de todos los gastos de funcionamiento, ganarías esos 12.000 euros en valor de hoy, y que tu dinero crece a un ritmo del 15% anual. Solo entonces te animas a invertir.</p>
</blockquote>
<h4 id="2-comparar-dos-inversiones-diferentes-para-elegir-la-mejor">2. Comparar dos inversiones diferentes para elegir la mejor</h4>
<p>Muchas veces no es un proyecto o ninguno, sino elegir entre varias opciones de inversión. El TIR y VAN te permiten poner todas las alternativas en una hoja de cálculo y compararlas de manera objetiva. Puedes ver cuál genera más valor absoluto (VAN) y cuál te da mayor rentabilidad porcentual (TIR).</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Tienes 100.000 euros y dos opciones: abrir una tienda de ropa o invertir en un negocio de consultoría. Con TIR y VAN descubres que la tienda tiene un VAN de 8.000 euros con un TIR del 12%, mientras que la consultoría tiene un VAN de 5.000 euros pero un TIR del 18%. Esto te revela que aunque la consultoría es menos rentable en valor absoluto, crece más rápido porcentualmente, lo que puede ser mejor si planeas vender el negocio en 3 años.</p>
</blockquote>
<h4 id="3-evaluar-el-retorno-de-una-inversion-inmobiliaria">3. Evaluar el retorno de una inversión inmobiliaria</h4>
<p>El sector inmobiliario es uno de los principales usuarios del TIR y VAN. Si estás considerando comprar una vivienda para alquilarla o un local comercial, estos cálculos te mostrarán exactamente cuándo recuperarás tu inversión y a qué velocidad.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Tienes la oportunidad de comprar un piso por 180.000 euros. Los alquileres en la zona son de 900 euros mensuales, los gastos de comunidad y mantenimiento rondan los 200 euros mensuales, y esperas vender el piso en 10 años por 220.000 euros. Con TIR y VAN, descubres que tu inversión tiene un VAN negativo de -15.000 euros si usas una tasa de descuento del 8%, lo que significa que no es rentable. Mejor esperar a que bajen los precios o suban los alquileres.</p>
</blockquote>
<h4 id="4-justificar-una-inversion-ante-inversores-o-bancos">4. Justificar una inversión ante inversores o bancos</h4>
<p>Si necesitas financiación para tu proyecto, los bancos y los inversores querrán ver números sólidos. El TIR y VAN son el idioma universal de las finanzas. Con estos datos en tu plan de negocio, demuestras profesionalidad y que has hecho los deberes antes de pedir dinero.</p>
<h4 id="5-evaluar-mejoras-o-actualizaciones-en-tu-negocio">5. Evaluar mejoras o actualizaciones en tu negocio</h4>
<p>No solo sirve para proyectos nuevos. Si quieres renovar la maquinaria de tu fábrica, actualizar el sistema informático de tu oficina o invertir en marketing digital, el TIR y VAN te ayudarán a determinar si esos gastos van a generarte suficiente retorno.</p>
<hr/>
<h2 id="como-usar">Cómo usar TIR y VAN paso a paso</h2>
<h3 id="paso-1-recopila-los-flujos-de-caja-proyectados">Paso 1: Recopila los flujos de caja proyectados</h3>
<p>Antes de usar cualquier herramienta de TIR y VAN, necesitas tener clara la proyección de ingresos y gastos de tu proyecto. Esto incluye:</p>
<ul>
<li>La <strong>inversión inicial</strong>: ¿cuánto dinero necesitas meter desde el primer día?</li>
<li>Los <strong>flujos anuales</strong>: ¿cuánto dinero neto (ingresos menos gastos) esperas generar cada año?</li>
<li>El <strong>horizonte temporal</strong>: ¿cuántos años vas a evaluar el proyecto?</li>
<li>El <strong>valor residual</strong>: ¿cuánto valdrá tu inversión al final (si es que tiene valor)?</li>
</ul>
<p>Por ejemplo, si abres una tienda, tu inversión inicial incluye el local, el mobiliario y el stock. Tus flujos anuales son las ventas menos los sueldos, alquileres y otros gastos operativos. El horizonte temporal podría ser 5 años, y el valor residual sería lo que podrías vender el negocio al final.</p>
<p>💡 <strong>Consejo</strong>: Sé realista en tus proyecciones. Es mejor ser pesimista que optimista. Muchos emprendedores fracasan porque sobrestiman los ingresos y subestiman los gastos.</p>
<h3 id="paso-2-define-la-tasa-de-descuento-coste-del-capital">Paso 2: Define la tasa de descuento (coste del capital)</h3>
<p>La tasa de descuento es crucial para calcular el VAN. Esta es la rentabilidad que esperas obtener de tu dinero si lo inviertieras en la alternativa más segura disponible. En España, muchos usan como referencia:</p>
<ul>
<li>El tipo de interés de un depósito bancario a plazo fijo (actualmente alrededor del 3-4%)</li>
<li>El coste del préstamo que obtendrías para financiar el proyecto (si es necesario)</li>
<li>Una tasa de retorno mínima requerida que consideres aceptable (por ejemplo, el 10% si tienes proyectos de mayor riesgo)</li>
</ul>
<p>Si no sabes qué tasa usar, comienza con el 8-10%. Esto es relativamente estándar para evaluar proyectos empresariales en España.</p>
<h3 id="paso-3-introduce-los-datos-en-la-herramienta-tir-y-van">Paso 3: Introduce los datos en la herramienta TIR y VAN</h3>
<p>La herramienta de TIR y VAN es intuitiva. Necesitarás:</p>
<ul>
<li>Introducir la <strong>inversión inicial</strong> (número negativo, ya que es dinero que sale)</li>
<li>Introducir los <strong>flujos de caja anuales</strong> para cada año (positivos si ganas dinero, negativos si pierdes)</li>
<li>Especificar la <strong>tasa de descuento</strong> que has definido antes</li>
<li>El sistema calculará automáticamente el VAN y el TIR</li>
</ul>
<p>No requiere fórmulas complicadas ni conocimientos de Excel avanzado. La herramienta hace todo por ti.</p>
<h3 id="paso-4-interpreta-los-resultados">Paso 4: Interpreta los resultados</h3>
<p>Una vez obtengas el VAN y el TIR, necesitas entender qué significan:</p>
<ul>
<li><strong>VAN positivo</strong>: Tu proyecto genera valor. Suma ese valor al dinero que invertiste y tendrás lo que "realmente" vas a tener en términos de hoy.</li>
<li><strong>VAN negativo</strong>: Tu proyecto destruye valor. Es decir, gastarías más (en términos de valor hoy) de lo que recibirías.</li>
<li><strong>TIR mayor a tu tasa de descuento</strong>: Tu proyecto es más rentable que tu alternativa. Deberías hacerlo.</li>
<li><strong>TIR menor a tu tasa de descuento</strong>: Tu dinero crece más lentamente en este proyecto que en otras opciones. Mejor rechazarlo.</li>
</ul>
<p>💡 <strong>Consejo</strong>: No bases tu decisión solo en un número. Considera también factores cualitativos: riesgo, experiencia en ese sector, situación personal, etc.</p>
<hr/>
<h2 id="ejemplos">Ejemplos prácticos</h2>
<h3 id="ejemplo-1-inversion-en-una-pequena-panaderia">Ejemplo 1: Inversión en una pequeña panadería</h3>
<p><strong>Situación:</strong> Llevas 15 años trabajando en panadería y decides montar tu propio negocio. Alquilarás un local, comprarás un horno profesional y moldes, y contratarás a un empleado.</p>
<p><strong>Datos de entrada:</strong>
- Inversión inicial: -25.000 euros (horno, equipamiento, reforma del local)
- Año 1: +8.000 euros (todavía estás dándote a conocer)
- Año 2: +12.000 euros (negocios estables crecen)
- Año 3: +15.000 euros (ya eres conocido en la zona)
- Año 4: +15.000 euros (se estabiliza)
- Año 5: +15.000 euros + 5.000 de venta de equipamiento usado = +20.000 euros
- Tasa de descuento: 8%</p>
<p><strong>Resultado:</strong> 
- VAN: +28.540 euros
- TIR: 31%</p>
<p><strong>Interpretación:</strong> ¡Excelente negocio! Tu inversión inicial de 25.000 euros genera 28.540 euros de valor neto (en términos de hoy). Además, el dinero crece a un 31% anual, muy superior al 8% que esperabas. Claramente, deberías montar esa panadería.</p>
<h3 id="ejemplo-2-renovacion-de-maquinaria-en-una-fabrica-de-embutidos">Ejemplo 2: Renovación de maquinaria en una fábrica de embutidos</h3>
<p><strong>Situación:</strong> Tu fábrica actualmente produce con maquinaria de los años 90. Invertir en maquinaria moderna te costará dinero, pero deberías ahorrar en energía y aumentar la producción.</p>
<p><strong>Datos de entrada:</strong>
- Inversión inicial: -80.000 euros (maquinaria nueva + instalación)
- Año 1: +5.000 euros (se instala y configura)
- Año 2: +18.000 euros (ya funciona correctamente)
- Año 3: +22.000 euros (ahorros completos en energía + mayor producción)
- Año 4: +22.000 euros
- Año 5: +22.000 euros + 15.000 de venta de maquinaria vieja = +37.000 euros
- Tasa de descuento: 10% (inviertes capital que podrías usar en otra cosa)</p>
<p><strong>Resultado:</strong> 
- VAN: +18.245 euros
- TIR: 15%</p>
<p><strong>Interpretación:</strong> Es un buen proyecto. La inversión es más grande, así que el VAN es menor en valor absoluto, pero sigue siendo positivo. El TIR del 15% supera tu tasa de descuento del 10%, así que es rentable. Deberías invertir en la nueva maquinaria.</p>
<h3 id="ejemplo-3-comparacion-entre-dos-negocios">Ejemplo 3: Comparación entre dos negocios</h3>
<p><strong>Situación:</strong> Tienes 50.000 euros de ahorros y te planteas dos negocios: una tienda de complementos de moda online o un taller de reparación de móviles.</p>
<p><strong>Negocio A - Tienda de moda online:</strong>
- Inversión inicial: -50.000 euros (web, stock inicial, marketing)
- Año 1: +5.000 euros
- Año 2: +12.000 euros
- Año 3: +18.000 euros
- Año 4: +20.000 euros
- Año 5: +22.000 euros
- Tasa de descuento: 12%</p>
<p><strong>Resultado negocio A:</strong> VAN = +8.920 euros | TIR = 18%</p>
<p><strong>Negocio B - Taller de reparación de móviles:</strong>
- Inversión inicial: -50.000 euros (local, herramientas, mobiliario, stock)
- Año 1: +8.000 euros
- Año 2: +10.000 euros
- Año 3: +12.000 euros
- Año 4: +12.000 euros
- Año 5: +12.000 euros
- Tasa de descuento: 12%</p>
<p><strong>Resultado negocio B:</strong> VAN = +6.520 euros | TIR = 14%</p>
<p><strong>Interpretación:</strong> Ambos son rentables, pero la tienda online es mejor. Tiene un VAN más alto (8.920 vs 6.520 euros) y un TIR más alto (18% vs 14%). Además, la tienda online es más escalable: si funciona bien, podrías expandirte a otras ciudades sin inversión inmobiliaria. El TIR y VAN no son todo, pero te dan una base objetiva para decidir.</p>
<hr/>
<h2 id="faqs">Preguntas frecuentes (FAQs)</h2>
<h3 id="que-diferencia-hay-entre-tir-y-van-exactamente">❓ ¿Qué diferencia hay entre TIR y VAN exactamente?</h3>
<p>El <strong>VAN</strong> es una cantidad en euros que te dice cuánto dinero generará tu proyecto en términos de hoy. El <strong>TIR</strong> es un porcentaje que te dice cuán rápido crece tu dinero cada año. </p>
<p>Piénsalo así: si inviertes 100 euros y el VAN es 20 euros, tu proyecto te hace 20 euros más rico (en términos de hoy). Si el TIR es 15%, tu dinero crece al 15% anual. Necesitas ambos números para tomar una buena decisión. Un proyecto puede tener un TIR altísimo pero un VAN bajo si el horizonte temporal es muy corto, o viceversa.</p>
<h3 id="cual-es-la-tasa-de-desc">❓ ¿Cuál es la tasa de desc</h3>

<div style={{marginTop: "3rem", paddingTop: "2rem", borderTop: "2px solid var(--border)", textAlign: "center"}}>
<a href="../index.html" style={{display: "inline-block", background: "var(--primary)", color: "white", padding: "0.75rem 2rem", borderRadius: "8px", textDecoration: "none", fontWeight: "600", transition: "all 0.3s ease", boxShadow: "0 2px 8px rgba(46, 134, 171, 0.2)"}}>
                ← Volver al índice de guías
            </a>

<div className="cta-box">
<h3>🎯 Prueba TIR y VAN ahora</h3>
<p>Herramienta 100% gratuita, sin registro, funciona offline</p>
<a className="cta-button" href="https://meskeia.com/tir-van/">Ir a TIR y VAN →</a>
</div>
</div>
        </article>
      </div>

      <Footer appName="meskeIA" />
    </>
  );
}
