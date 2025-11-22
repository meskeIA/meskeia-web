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
          <h1 id="guia-completa-contraste-de-colores-2025">Guía Completa: Contraste de Colores 2025</h1>
<blockquote>
<p>Aprende a usar Contraste de Colores de forma efectiva. Guía práctica con ejemplos reales y casos de uso.</p>
</blockquote>
<h2 id="tabla-de-contenidos">📋 Tabla de Contenidos</h2>
<ol>
<li><a href="#que-es">¿Qué es Contraste de Colores?</a></li>
<li><a href="#para-que-sirve">¿Para qué sirve?</a></li>
<li><a href="#como-usar">Cómo usar Contraste de Colores paso a paso</a></li>
<li><a href="#ejemplos">Ejemplos prácticos</a></li>
<li><a href="#faqs">Preguntas frecuentes</a></li>
<li><a href="#consejos">Consejos y mejores prácticas</a></li>
</ol>
<hr/>
<h2 id="que-es">¿Qué es Contraste de Colores?</h2>
<p>Contraste de Colores es una herramienta web diseñada para verificar la accesibilidad del contraste entre el texto y el fondo de tus páginas web según los estándares WCAG (Web Content Accessibility Guidelines). En pocas palabras, te permite saber si la combinación de colores que has elegido para tu sitio web es legible para todo el mundo, incluyendo personas con problemas de visión o daltonismo.</p>
<p>Cuando diseñas una página web, es fácil elegir colores que te parecen bonitos, pero que resultan prácticamente ilegibles para muchas personas. Un texto gris muy claro sobre un fondo blanco, o un texto amarillo sobre naranja, pueden ser frustrantes para usuarios con baja visión. Con esta herramienta, puedes verificar si el contraste de colores que has seleccionado cumple con los estándares internacionales de accesibilidad web.</p>
<p>La herramienta funciona de manera sencilla: introduces dos colores (uno para el texto y otro para el fondo), y te proporciona instantáneamente un análisis sobre si esa combinación es accesible según los niveles WCAG AA y AAA. Esto es particularmente importante si quieres que tu web sea usable por el máximo número de personas posible.</p>
<p><strong>Características principales:</strong>
- Verificación instantánea del contraste de colores
- Cumplimiento con estándares WCAG AA y AAA
- Pruebas de daltonismo (simulación de diferentes tipos de ceguera de color)
- Interfaz intuitiva y sin necesidad de registro
- Resultados en tiempo real
- Compatible con cualquier dispositivo</p>
<hr/>
<h2 id="para-que-sirve">¿Para qué sirve Contraste de Colores?</h2>
<h3 id="casos-de-uso-principales">Casos de uso principales:</h3>
<h4 id="1-verificar-accesibilidad-wcag-en-tu-sitio-web">1. Verificar accesibilidad WCAG en tu sitio web</h4>
<p>Si eres diseñador web o desarrollador, sabes que la accesibilidad no es una opción, sino una responsabilidad. Los estándares WCAG establecen que el contraste de colores debe ser mínimo para asegurar que el contenido sea legible. Contraste de Colores te permite verificar rápidamente si tus combinaciones de colores cumplen estos requisitos antes de publicar tu sitio.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Estás rediseñando el sitio de tu empresa y has elegido un texto azul oscuro (#003366) sobre un fondo gris claro (#E8E8E8). Antes de publicar, usas Contraste de Colores y descubres que la combinación no cumple con WCAG AA. Cambias el fondo a blanco (#FFFFFF) y verificas nuevamente: ahora sí cumple los estándares. Esto garantiza que tus clientes con baja visión puedan leer tu contenido sin dificultades.</p>
</blockquote>
<h4 id="2-disenar-interfaces-accesibles-para-daltonicos">2. Diseñar interfaces accesibles para daltónicos</h4>
<p>La ceguera al color afecta aproximadamente al 8% de los hombres y al 0,5% de las mujeres. Si tu diseño depende únicamente del color para comunicar información (por ejemplo, usando rojo para errores y verde para éxito), estás excluyendo a estas personas. Contraste de Colores te permite simular cómo ven tu diseño las personas con diferentes tipos de daltonismo.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Estás diseñando un formulario de reservas online. Has utilizado un botón verde para "Reservar" y uno rojo para "Cancelar". Al probar el contraste de colores con simulación de daltonismo tipo Protanopia (ceguera al rojo), descubres que ambos botones se ven prácticamente idénticos. Añades iconos y texto adicional para diferenciarlos, mejorando la experiencia de todos tus usuarios.</p>
</blockquote>
<h4 id="3-asegurar-que-tu-web-sea-accesible-para-todos">3. Asegurar que tu web sea accesible para todos</h4>
<p>La accesibilidad web no solo beneficia a personas con discapacidades visuales. También es importante para usuarios en ambientes difíciles, como cuando alguien intenta leer tu web en un teléfono móvil bajo la luz solar directa. Un contraste de colores adecuado mejora la experiencia de usuario en general.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Tu tienda online tiene un problema: los clientes se quejan de que no pueden leer los precios en la ficha de productos cuando usan el móvil en exterior. Compruebas el contraste de colores de los precios (gris medio #777777) sobre el fondo blanco y descubres que apenas cumple WCAG AA. Cambias a gris más oscuro (#555555) y los usuarios informan que ahora se lee mucho mejor, incluso al aire libre.</p>
</blockquote>
<h4 id="4-cumplir-con-requisitos-legales-y-regulaciones">4. Cumplir con requisitos legales y regulaciones</h4>
<p>En muchos países, especialmente en Europa, existe legislación que obliga a los sitios web públicos y empresariales a cumplir con ciertos estándares de accesibilidad. Usar Contraste de Colores te ayuda a documentar que has tomado medidas para asegurar que tu web cumple con estas normativas.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Trabajas para una administración pública que debe cumplir con la Norma EN 301 549 (equivalente europeo de WCAG). Tu equipo audita todos los colores del sitio usando Contraste de Colores, documenta qué combinaciones cumplen y cuáles no, y realiza los ajustes necesarios. Cuando llega la auditoría de cumplimiento, puedes demostrar que has cumplido deliberadamente con los estándares.</p>
</blockquote>
<h4 id="5-optimizar-la-legibilidad-general-de-tu-contenido">5. Optimizar la legibilidad general de tu contenido</h4>
<p>Aunque una combinación de colores técnicamente cumpla con WCAG AA, eso no significa que sea la mejor opción. Contraste de Colores te ayuda a experimentar con diferentes opciones y encontrar la combinación que ofrece la mejor legibilidad y experiencia visual.</p>
<hr/>
<h2 id="como-usar">Cómo usar Contraste de Colores paso a paso</h2>
<h3 id="paso-1-acceder-a-la-herramienta">Paso 1: Acceder a la herramienta</h3>
<p>Dirígete a https://meskeia.com/contraste-colores/ en tu navegador web. No necesitas registrarte ni instalar nada. La herramienta se abre directamente en tu navegador, ya sea desde un ordenador de escritorio, tablet o smartphone.</p>
<h3 id="paso-2-seleccionar-el-color-del-texto">Paso 2: Seleccionar el color del texto</h3>
<p>La herramienta te presentará dos campos para seleccionar colores. El primero es para el color del texto. Puedes introducir el color de varias formas:
- Usando el selector de color visual (haciendo clic en el cuadrado de color)
- Escribiendo el código hexadecimal del color (por ejemplo, #000000 para negro)
- Escribiendo valores RGB (por ejemplo, rgb(0, 0, 0))</p>
<p>Si no sabes qué color usar, puedes copiar el código hexadecimal del color que ya está usando en tu web. La mayoría de editores de diseño (Figma, Adobe XD) te permiten copiar fácilmente estos códigos.</p>
<h3 id="paso-3-seleccionar-el-color-del-fondo">Paso 3: Seleccionar el color del fondo</h3>
<p>Ahora introduce el color de fondo de la manera que prefieras. Este debe ser el color sobre el que irá el texto en tu página web. Por ejemplo, si el fondo de tu sitio es blanco, introduce #FFFFFF.</p>
<h3 id="paso-4-analizar-los-resultados">Paso 4: Analizar los resultados</h3>
<p>Una vez hayas introducido ambos colores, Contraste de Colores te mostrará automáticamente el resultado del contraste. Verás:</p>
<ul>
<li><strong>Ratio de contraste</strong>: Un número que indica la relación entre la luminosidad del texto y el fondo (por ejemplo, 4.5:1)</li>
<li><strong>Cumplimiento WCAG AA</strong>: Si la combinación cumple con el nivel AA (el más común)</li>
<li><strong>Cumplimiento WCAG AAA</strong>: Si la combinación cumple con el nivel AAA (más estricto)</li>
<li><strong>Previsualización</strong>: Una muestra visual de cómo se ve el texto con esos colores</li>
</ul>
<p>💡 <strong>Consejo</strong>: Si los resultados muestran que tu combinación de colores no cumple con los estándares, intenta oscurecer el color del texto o aclarar el fondo. Estos cambios pequeños a menudo son suficientes para alcanzar la accesibilidad requerida.</p>
<hr/>
<h2 id="ejemplos">Ejemplos prácticos</h2>
<h3 id="ejemplo-1-blog-con-texto-gris-sobre-fondo-blanco">Ejemplo 1: Blog con texto gris sobre fondo blanco</h3>
<p><strong>Situación:</strong> Eres bloguero y has diseñado tu sitio con un estilo minimalista. El texto del cuerpo es gris medio (#888888) sobre fondo blanco (#FFFFFF). Quieres asegurarte de que sea legible.</p>
<p><strong>Datos de entrada:</strong>
- Color de texto: #888888 (gris medio)
- Color de fondo: #FFFFFF (blanco puro)</p>
<p><strong>Resultado:</strong> 
- Ratio de contraste: 2.4:1
- WCAG AA: ❌ No cumple
- WCAG AAA: ❌ No cumple</p>
<p><strong>Interpretación:</strong> Este contraste es insuficiente. El gris es demasiado claro. Necesitas oscurecer el texto.</p>
<p><strong>Solución:</strong> Cambias el color del texto a #444444 (gris más oscuro) y verificas nuevamente:
- Nuevo ratio: 8.3:1
- WCAG AA: ✅ Cumple
- WCAG AAA: ✅ Cumple</p>
<h3 id="ejemplo-2-boton-de-llamada-a-accion-en-tienda-online">Ejemplo 2: Botón de llamada a acción en tienda online</h3>
<p><strong>Situación:</strong> Tu tienda online tiene un botón "Comprar ahora" con texto blanco (#FFFFFF) sobre fondo naranja (#FF9900). Quieres verificar que sea accesible.</p>
<p><strong>Datos de entrada:</strong>
- Color de texto: #FFFFFF (blanco)
- Color de fondo: #FF9900 (naranja)</p>
<p><strong>Resultado:</strong> 
- Ratio de contraste: 4.5:1
- WCAG AA: ✅ Cumple
- WCAG AAA: ❌ No cumple</p>
<p><strong>Interpretación:</strong> El botón es legible para la mayoría de personas (cumple AA), pero no alcanza el nivel AAA más restrictivo. Para muchos usos, esto es suficiente, pero si quieres máxima accesibilidad, podrías usar naranja más oscuro (#FF8800) para mejorar el contraste.</p>
<h3 id="ejemplo-3-enlaces-de-navegacion-en-encabezado">Ejemplo 3: Enlaces de navegación en encabezado</h3>
<p><strong>Situación:</strong> En el menú principal de tu web, tienes enlaces azules (#0066CC) sobre fondo gris claro (#F5F5F5). Necesitas verificar si son suficientemente legibles.</p>
<p><strong>Datos de entrada:</strong>
- Color de texto: #0066CC (azul estándar web)
- Color de fondo: #F5F5F5 (gris muy claro)</p>
<p><strong>Resultado:</strong> 
- Ratio de contraste: 7.9:1
- WCAG AA: ✅ Cumple
- WCAG AAA: ✅ Cumple</p>
<p><strong>Interpretación:</strong> Excelente. Este es un buen contraste de colores que funciona bien. Los usuarios podrán leer estos enlaces sin problemas, incluso aquellos con baja visión moderada.</p>
<hr/>
<h2 id="faqs">Preguntas frecuentes (FAQs)</h2>
<h3 id="que-es-wcag-y-por-que-es-importante">❓ ¿Qué es WCAG y por qué es importante?</h3>
<p>WCAG significa Web Content Accessibility Guidelines (Directrices de Accesibilidad para el Contenido Web). Son estándares internacionales creados por el W3C que establecen cómo hacer que el contenido web sea accesible para personas con discapacidades. El contraste de colores es uno de los aspectos clave de estas directrices. WCAG tiene tres niveles: A, AA y AAA, siendo AA el más comúnmente requerido por ley.</p>
<h3 id="cual-es-la-diferencia-entre-wcag-aa-y-aaa">❓ ¿Cuál es la diferencia entre WCAG AA y AAA?</h3>
<p>WCAG AA es el nivel de conformidad más comúnmente requerido y esperado. Requiere un ratio de contraste de al menos 4.5:1 para texto normal y 3:1 para texto grande. WCAG AAA es más estricto y requiere 7:1 para texto normal y 4.5:1 para texto grande. Si tu web cumple con AAA, también cumple con AA automáticamente.</p>
<h3 id="que-es-un-ratio-de-contraste-y-como-se-calcula">❓ ¿Qué es un ratio de contraste y cómo se calcula?</h3>
<p>El ratio de contraste es un número que compara la luminosidad relativa del texto y el fondo. Se expresa como una proporción, por ejemplo 4.5:1. Un ratio más alto significa mayor diferencia entre los colores. La fórmula considera la luminosidad relativa de ambos colores, no simplemente la diferencia entre ellos. Por eso dos colores que parecen muy diferentes visualmente podrían tener un ratio bajo.</p>
<h3 id="puedo-usar-colores-brillantes-si-tienen-buen-contraste">❓ ¿Puedo usar colores brillantes si tienen buen contraste?</h3>
<p>Sí, el contraste de colores es lo importante, no la intensidad del color. Puedes usar colores brillantes siempre que haya suficiente diferencia de luminosidad entre el texto y el fondo. Por ejemplo, texto amarillo muy brillante sobre fondo azul oscuro podría tener un excelente contraste de colores.</p>
<h3 id="que-hago-si-mi-diseno-favorito-no-cumple-con-los-estandares">❓ ¿Qué hago si mi diseño favorito no cumple con los estándares?</h3>
<p>Tienes varias opciones: (1) Oscurece el color del texto, (2) Aclara el color del fondo, (3) Usa ambos cambios simultáneamente, (4) Considera usar un color completamente diferente que sea más compatible. Generalmente, hacer cambios pequeños es suficiente. La herramienta Contraste de Colores te permite experimentar en tiempo real hasta encontrar la mejor solución.</p>
<h3 id="el-contraste-de-colores-es-relevante-solo-para-personas-ciegas-al-color">❓ ¿El contraste de colores es relevante solo para personas ciegas al color?</h3>
<p>No. Aunque el daltonismo es un caso importante, el contraste de colores beneficia a muchas más personas: ancianos con visión reducida, personas en ambientes muy iluminados o muy oscuros, usuarios con pantallas de mala calidad, y en general, cualquiera que aprecie una buena legibilidad. Es un tema de usabilidad general, no solo de accesibilidad.</p>
<h3 id="como-pruebo-si-mi-web-es-accesible-para-daltonicos">❓ ¿Cómo pruebo si mi web es accesible para daltónicos?</h3>
<p>Contraste de Colores incluye opciones para simular diferentes tipos de daltonismo (Deuteranopia, Protanopia, Tritanopia, Acromatopsia). Puedes ver cómo perciben tu diseño las personas con estos tipos específicos de ceguera al color. También puedes usar extensiones de navegador que simulan estas condiciones mientras navegas por tu web.</p>
<hr/>
<h2 id="consejos">Consejos y mejores prácticas</h2>
<h3 id="recomendaciones">✅ Recomendaciones:</h3>
<ul>
<li>
<p><strong>Comienza con negro o gris muy oscuro para el texto principal</strong>: Es más fácil lograr buen contraste de colores usando texto muy oscuro. El negro puro (#000000) o casi negro (#111111) es una opción segura que cumple con todos los estándares.</p>
</li>
<li>
<p><strong>Verifica todos los niveles de contenido</strong>: No solo revises el texto principal. También verifica el contraste de colores en enlaces, botones, etiquetas de formularios, mensajes de error, encabezados y cualquier otro elemento</p>
</li>
</ul>

<div style={{marginTop: "3rem", paddingTop: "2rem", borderTop: "2px solid var(--border)", textAlign: "center"}}>
<a href="../index.html" style={{display: "inline-block", background: "var(--primary)", color: "white", padding: "0.75rem 2rem", borderRadius: "8px", textDecoration: "none", fontWeight: "600", transition: "all 0.3s ease", boxShadow: "0 2px 8px rgba(46, 134, 171, 0.2)"}}>
                ← Volver al índice de guías
            </a>

<div className="cta-box">
<h3>🎯 Prueba Contraste de Colores ahora</h3>
<p>Herramienta 100% gratuita, sin registro, funciona offline</p>
<a className="cta-button" href="https://meskeia.com/contraste-colores/">Ir a Contraste de Colores →</a>
</div>
</div>
        </article>
      </div>

      <Footer appName="meskeIA" />
    </>
  );
}
