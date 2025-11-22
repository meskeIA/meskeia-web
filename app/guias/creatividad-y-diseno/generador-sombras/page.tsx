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
          <h1 id="guia-completa-generador-de-sombras-2025">Guía Completa: Generador de Sombras 2025</h1>
<blockquote>
<p>Aprende a usar Generador de Sombras de forma efectiva. Guía práctica con ejemplos reales y casos de uso.</p>
</blockquote>
<h2 id="tabla-de-contenidos">📋 Tabla de Contenidos</h2>
<ol>
<li><a href="#que-es">¿Qué es Generador de Sombras?</a></li>
<li><a href="#para-que-sirve">¿Para qué sirve?</a></li>
<li><a href="#como-usar">Cómo usar Generador de Sombras paso a paso</a></li>
<li><a href="#ejemplos">Ejemplos prácticos</a></li>
<li><a href="#faqs">Preguntas frecuentes</a></li>
<li><a href="#consejos">Consejos y mejores prácticas</a></li>
</ol>
<hr/>
<h2 id="que-es">¿Qué es Generador de Sombras?</h2>
<p>El Generador de Sombras es una herramienta web que te permite crear efectos de sombra CSS (box-shadow) de forma visual e intuitiva, sin necesidad de escribir código manualmente ni de memorizar la sintaxis de las propiedades CSS. Funciona como un editor visual donde configuras los parámetros de la sombra y ves el resultado en tiempo real.</p>
<p>Si trabajas con diseño web, desarrollo frontend o edición de interfaces, sabrás que crear sombras CSS que se vean bien requiere cierta práctica. El Generador de Sombras te ahorra ese tiempo de prueba y error, permitiéndote ajustar cada detalle de la sombra hasta conseguir exactamente el efecto que buscas. Una vez satisfecho con el resultado, simplemente copias el código CSS generado y lo pegas en tu proyecto.</p>
<p>Esta herramienta es especialmente útil cuando trabajas con diseños modernos que requieren efectos visuales sutiles pero profesionales, como sombras en tarjetas, botones, formularios o cajas de contenido.</p>
<p><strong>Características principales:</strong></p>
<ul>
<li><strong>Control de difuminado (blur):</strong> Ajusta el nivel de desenfoque de la sombra desde muy nítida hasta completamente difuminada</li>
<li><strong>Desplazamiento XY (offset):</strong> Controla la posición exacta de la sombra respecto al elemento (horizontal y vertical)</li>
<li><strong>Selector de color:</strong> Elige cualquier color para tu sombra con herramientas de color personalizadas</li>
<li><strong>Vista previa en tiempo real:</strong> Ve instantáneamente cómo se ve tu sombra mientras ajustas los parámetros</li>
<li><strong>Copia de código automática:</strong> Obtén el código CSS generado listo para usar en tu proyecto</li>
</ul>
<hr/>
<h2 id="para-que-sirve">¿Para qué sirve Generador de Sombras?</h2>
<h3 id="casos-de-uso-principales">Casos de uso principales:</h3>
<h4 id="1-crear-efectos-de-sombra-para-botones-y-elementos-interactivos">1. Crear efectos de sombra para botones y elementos interactivos</h4>
<p>Los botones modernos necesitan tener profundidad visual. Con el Generador de Sombras puedes crear sombras que hagan que tus botones se destaquen del fondo y comuniquen que son clicables. Puedes ajustar la sombra para que sea más profunda cuando el usuario pasa el ratón sobre el botón, creando una sensación de interactividad.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Estás diseñando una página de inicio para una agencia digital. Necesitas que tus botones "Solicitar presupuesto" tengan un efecto de profundidad que atraiga la atención. Con el Generador de Sombras creas una sombra suave con desplazamiento hacia abajo y un blur moderado. El resultado es un botón que parece flotar sobre la página.</p>
</blockquote>
<h4 id="2-generar-sombras-para-tarjetas-y-contenedores">2. Generar sombras para tarjetas y contenedores</h4>
<p>Las tarjetas (cards) son uno de los elementos más comunes en el diseño web moderno. Necesitan una sombra que las separe del fondo sin ser invasiva. El Generador de Sombras te permite crear exactamente el tipo de sombra que necesitas: sutil durante el estado normal y más pronunciada cuando el usuario interactúa con ella.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Tienes un sitio de e-commerce con galerías de productos. Necesitas que cada tarjeta de producto tenga una sombra que la haga verse como un objeto físico. Usas el Generador de Sombras para crear una sombra equilibrada que funcione tanto en el estado normal como en el hover (cuando pasas el ratón).</p>
</blockquote>
<h4 id="3-disenar-efectos-visuales-personalizados-sin-escribir-codigo">3. Diseñar efectos visuales personalizados sin escribir código</h4>
<p>Si no tienes experiencia escribiendo código CSS, el Generador de Sombras es tu aliado. Te permite experimentar con diferentes valores de blur, desplazamiento y colores de una forma visual. Una vez encuentras la combinación que te gusta, simplemente copias el código CSS generado.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Eres diseñador UX/UI y necesitas proporcionar especificaciones CSS a tu desarrollador. En lugar de intentar calcular manualmente los valores correctos del box-shadow, usas el Generador de Sombras para crear visualmente la sombra exacta que imaginaste en tu prototipo. Luego compartes el código CSS con el equipo de desarrollo.</p>
</blockquote>
<h4 id="4-experimentar-con-multiples-sombras-superpuestas">4. Experimentar con múltiples sombras superpuestas</h4>
<p>El CSS permite aplicar múltiples sombras al mismo elemento separadas por comas. El Generador de Sombras te facilita este proceso, permitiéndote crear capas de sombras complejas que generan efectos visuales muy sofisticados.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Quieres crear un efecto neomórfico (neumorfismo) en tu interfaz de usuario. Este estilo requiere sombras claras y oscuras superpuestas. El Generador de Sombras te permite agregar múltiples capas de sombras fácilmente y ver en tiempo real cómo interactúan entre sí.</p>
</blockquote>
<h4 id="5-optimizar-tiempos-de-desarrollo">5. Optimizar tiempos de desarrollo</h4>
<p>En proyectos con plazos ajustados, el Generador de Sombras te ahorra tiempo precioso que de otra forma gastarías ajustando manualmente los valores de blur y offset del box-shadow. Esto es especialmente valioso cuando necesitas crear variaciones de sombras para diferentes estados de elementos (normal, hover, active, disabled).</p>
<hr/>
<h2 id="como-usar">Cómo usar Generador de Sombras paso a paso</h2>
<h3 id="paso-1-accede-a-la-herramienta-desde-tu-navegador">Paso 1: Accede a la herramienta desde tu navegador</h3>
<p>Abre tu navegador web preferido e ingresa directamente a la URL de Generador de Sombras. No necesitas registrarte ni crear una cuenta, la herramienta funciona directamente desde el navegador sin necesidad de descargas adicionales.</p>
<p><strong>Ventaja importante:</strong> El generador de sombras funciona perfectamente en dispositivos móviles y ordenadores de escritorio, así que puedes usarlo donde sea que trabajes.</p>
<h3 id="paso-2-observa-el-elemento-de-vista-previa">Paso 2: Observa el elemento de vista previa</h3>
<p>Al abrir el Generador de Sombras, verás una zona donde aparece un elemento de prueba (generalmente una caja o un botón). Este elemento muestra en tiempo real cómo se verá tu sombra CSS mientras la vas configurando. La vista previa es el corazón de la herramienta porque te permite ver instantáneamente el impacto de cada cambio que haces.</p>
<h3 id="paso-3-ajusta-los-parametros-de-la-sombra">Paso 3: Ajusta los parámetros de la sombra</h3>
<p>El Generador de Sombras presenta varios controles deslizantes o campos numéricos para configurar:</p>
<ul>
<li><strong>Desplazamiento horizontal (X):</strong> Controla hacia dónde se desplaza la sombra hacia la izquierda o derecha (valores negativos mueven la sombra hacia la izquierda, positivos hacia la derecha)</li>
<li><strong>Desplazamiento vertical (Y):</strong> Controla el desplazamiento vertical de la sombra (valores positivos la mueven hacia abajo)</li>
<li><strong>Difuminado (Blur):</strong> Aumenta o disminuye el nivel de desenfoque de la sombra. Mayor blur = sombra más suave y dispersa</li>
<li><strong>Expansión (Spread):</strong> Opcional en algunas herramientas, controla cuánto se expande la sombra desde los bordes del elemento</li>
<li><strong>Color de la sombra:</strong> Selecciona el color exacto que deseas para tu sombra. Puedes usar un color picker o introducir valores hexadecimales</li>
<li><strong>Opacidad (Alpha):</strong> Controla la transparencia de la sombra, permitiéndote hacer sombras más sutiles o más visibles</li>
</ul>
<p>💡 <strong>Consejo:</strong> Comienza con valores moderados (por ejemplo, X: 2px, Y: 4px, Blur: 8px) y ajusta desde ahí. Las sombras muy pronunciadas suelen verse poco profesionales.</p>
<h3 id="paso-4-copia-el-codigo-css-generado">Paso 4: Copia el código CSS generado</h3>
<p>Una vez estés satisfecho con cómo se ve tu sombra en la vista previa, el Generador de Sombras te proporciona el código CSS completo listo para copiar. Simplemente busca el botón "Copiar código" o similar, y tendrás el box-shadow en tu portapapeles para pegarlo directamente en tu archivo CSS.</p>
<p>El código será algo como:</p>
<div className="codehilite"><pre><span></span><code><span className="nt">box-shadow</span><span className="o">:</span><span className="w"> </span><span className="nt">2px</span><span className="w"> </span><span className="nt">4px</span><span className="w"> </span><span className="nt">8px</span><span className="w"> </span><span className="nt">rgba</span><span className="o">(</span><span className="nt">0</span><span className="o">,</span><span className="w"> </span><span className="nt">0</span><span className="o">,</span><span className="w"> </span><span className="nt">0</span><span className="o">,</span><span className="w"> </span><span className="nt">0</span><span className="p">.</span><span className="nc">2</span><span className="o">);</span>
</code></pre>
<hr/>
<h2 id="ejemplos">Ejemplos prácticos</h2>
<h3 id="ejemplo-1-sombra-sutil-para-tarjetas-de-producto">Ejemplo 1: Sombra sutil para tarjetas de producto</h3>
<p><strong>Situación:</strong> Tienes un sitio web de tienda online y necesitas que las tarjetas de productos tengan una sombra discreta que las separe del fondo blanco sin ser demasiado invasiva.</p>
<p><strong>Datos de entrada:</strong>
- Desplazamiento horizontal (X): 0px
- Desplazamiento vertical (Y): 2px
- Difuminado (Blur): 8px
- Color: Negro (#000000)
- Opacidad: 0.1 (10%)</p>
<p><strong>Resultado:</strong> El Generador de Sombras genera: <code>box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);</code></p>
<p><strong>Interpretación:</strong> Esta sombra es perfecta para tarjetas. El desplazamiento vertical mínimo (2px) crea la sensación de que la tarjeta está ligeramente elevada. El blur de 8px hace que la sombra sea muy suave y profesional. La opacidad baja (10%) asegura que no sea invasiva ni distraiga del contenido de la tarjeta.</p>
<h3 id="ejemplo-2-sombra-pronunciada-para-botones-interactivos">Ejemplo 2: Sombra pronunciada para botones interactivos</h3>
<p><strong>Situación:</strong> Estás diseñando un botón de llamada a acción para un formulario de contacto. Necesita destacar bastante del fondo gris claro de tu página.</p>
<p><strong>Datos de entrada:</strong>
- Desplazamiento horizontal (X): 0px
- Desplazamiento vertical (Y): 6px
- Difuminado (Blur): 12px
- Color: Negro (#000000)
- Opacidad: 0.25 (25%)</p>
<p><strong>Resultado:</strong> El Generador de Sombras genera: <code>box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);</code></p>
<p><strong>Interpretación:</strong> Esta sombra es más profunda y visible, perfecta para un botón que deseas que se destaque. El desplazamiento vertical de 6px crea una sensación clara de elevación. El blur de 12px con opacidad del 25% hace que la sombra sea visible pero sigue siendo elegante. Idealmente, en el estado hover podrías aumentar aún más estos valores.</p>
<h3 id="ejemplo-3-sombra-multiple-para-efecto-neomorfico">Ejemplo 3: Sombra múltiple para efecto neomórfico</h3>
<p><strong>Situación:</strong> Quieres crear un diseño con estilo neumórfico (neomorphism), que combina sombras claras y oscuras para crear un efecto 3D muy sutil.</p>
<p><strong>Datos de entrada (dos sombras superpuestas):</strong></p>
<p>Primera sombra:
- Desplazamiento: -3px -3px
- Blur: 8px
- Color: Blanco (#FFFFFF)
- Opacidad: 0.8 (80%)</p>
<p>Segunda sombra:
- Desplazamiento: 3px 3px
- Blur: 8px
- Color: Negro (#000000)
- Opacidad: 0.15 (15%)</p>
<p><strong>Resultado:</strong> El Generador de Sombras genera: <code>box-shadow: -3px -3px 8px rgba(255, 255, 255, 0.8), 3px 3px 8px rgba(0, 0, 0, 0.15);</code></p>
<p><strong>Interpretación:</strong> Esta combinación crea un efecto de profundidad muy sutil. La sombra blanca en la esquina superior izquierda y la sombra oscura en la esquina inferior derecha crean la ilusión de que el elemento está ligeramente hundido en la superficie. Es perfecto para interfaces modernas y minimalistas.</p>
<hr/>
<h2 id="faqs">Preguntas frecuentes (FAQs)</h2>
<h3 id="cual-es-la-diferencia-entre-offset-desplazamiento-y-blur-difuminado">❓ ¿Cuál es la diferencia entre offset (desplazamiento) y blur (difuminado)?</h3>
<p>El <strong>desplazamiento (offset)</strong> define dónde aparece la sombra en relación al elemento. Si estableces un desplazamiento vertical positivo (Y: 5px), la sombra aparecerá 5 píxeles debajo del elemento. El <strong>difuminado (blur)</strong> controla cuánto de desenfoque tiene la sombra. Un blur bajo hace que los bordes sean definidos, mientras que un blur alto crea una sombra más suave y dispersa. Ambos parámetros trabajan juntos: el offset define la posición, el blur define cómo de "blanda" es la sombra.</p>
<h3 id="por-que-mi-sombra-generada-en-el-generador-de-sombras-no-se-ve-igual-en-mi-navegador">❓ ¿Por qué mi sombra generada en el Generador de Sombras no se ve igual en mi navegador?</h3>
<p>Esto puede ocurrir por varias razones. Primero, verifica que hayas copiado correctamente el código CSS. Segundo, asegúrate de que la propiedad <code>box-shadow</code> está aplicada al elemento correcto. Tercero, otros estilos CSS como bordes redondeados o overflow pueden afectar cómo se ve la sombra. Finalmente, diferentes navegadores pueden renderizar las sombras ligeramente diferentes, aunque esto es cada vez menos común en navegadores modernos.</p>
<h3 id="puedo-crear-multiples-sombras-con-el-generador-de-sombras">❓ ¿Puedo crear múltiples sombras con el Generador de Sombras?</h3>
<p>Sí, la mayoría de versiones modernas del Generador de Sombras permiten agregar múltiples capas de sombras. Esto es especialmente útil para efectos más complejos. Simplemente agrega una nueva sombra, configura sus parámetros, y verás cómo se superpone con las sombras existentes en la vista previa.</p>
<h3 id="que-valores-de-blur-y-offset-son-mejores-para-no-exagerar">❓ ¿Qué valores de blur y offset son mejores para no exagerar?</h3>
<p>Para un efecto profesional y moderno, considera estas pautas generales: utiliza desplazamientos pequeños (0-6px en la mayoría de casos), difuminados entre 4 y 16px, y opacidad entre el 10% y el 30%. Estos valores crean sombras visibles pero sutiles. Evita desplazamientos muy grandes o blur muy alto a menos que busques un efecto muy dramático. El Generador de Sombras te permite experimentar para encontrar el equilibrio que funciona con tu diseño específico.</p>
<h3 id="el-codigo-generado-por-el-generador-de-sombras-es-compatible-con-todos-los-navegadores">❓ ¿El código generado por el Generador de Sombras es compatible con todos los navegadores?</h3>
<p>La propiedad CSS <code>box-shadow</code> es ampliamente soportada en todos los navegadores modernos (Chrome, Firefox, Safari, Edge). No necesitas prefijos de navegador como lo hacías hace años. Sin embargo, si necesitas soportar navegadores muy antiguos (Internet Explorer 8 o anterior), el <code>box-shadow</code> no funcionará. Para la mayoría de proyectos web actuales, el código generado funciona perfecto en cualquier navegador.</p>
<hr/>
<h2 id="consejos">Consejos y mejores prácticas</h2>
<h3 id="recomendaciones">✅ Recomendaciones:</h3>
<ul>
<li><strong>Mantén la coherencia:</strong> Si usas un tipo</li>
</ul>

<div style={{marginTop: "3rem", paddingTop: "2rem", borderTop: "2px solid var(--border)", textAlign: "center"}}>
<a href="../index.html" style={{display: "inline-block", background: "var(--primary)", color: "white", padding: "0.75rem 2rem", borderRadius: "8px", textDecoration: "none", fontWeight: "600", transition: "all 0.3s ease", boxShadow: "0 2px 8px rgba(46, 134, 171, 0.2)"}}>
                ← Volver al índice de guías
            </a>
</div>
<div className="cta-box">
<h3>🎯 Prueba Generador de Sombras ahora</h3>
<p>Herramienta 100% gratuita, sin registro, funciona offline</p>
<a className="cta-button" href="https://meskeia.com/generador-sombras/">Ir a Generador de Sombras →</a>
</div>
</div>
        </article>
      </div>

      <Footer appName="meskeIA" />
    </>
  );
}
