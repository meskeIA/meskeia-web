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
          <h1 id="guia-completa-cuaderno-digital-2025">Guía Completa: Cuaderno Digital 2025</h1>
<blockquote>
<p>Aprende a usar Cuaderno Digital de forma efectiva. Guía práctica con ejemplos reales y casos de uso.</p>
</blockquote>
<h2 id="tabla-de-contenidos">📋 Tabla de Contenidos</h2>
<ol>
<li><a href="#que-es">¿Qué es Cuaderno Digital?</a></li>
<li><a href="#para-que-sirve">¿Para qué sirve?</a></li>
<li><a href="#como-usar">Cómo usar Cuaderno Digital paso a paso</a></li>
<li><a href="#ejemplos">Ejemplos prácticos</a></li>
<li><a href="#faqs">Preguntas frecuentes</a></li>
<li><a href="#consejos">Consejos y mejores prácticas</a></li>
</ol>
<hr/>
<h2 id="que-es">¿Qué es Cuaderno Digital?</h2>
<p>Cuaderno Digital es una herramienta web de productividad diseñada para tomar notas rápidas sin complicaciones innecesarias. Se trata de un editor de texto minimalista que funciona directamente en tu navegador, sin necesidad de descargar aplicaciones pesadas ni registrarse con complicados formularios. Lo que distingue a este cuaderno digital es su capacidad para almacenar toda la información localmente en tu ordenador, garantizando que tus apuntes permanezcan bajo tu control y no en servidores externos.</p>
<p>Este cuaderno digital incorpora compatibilidad con Markdown, un lenguaje de formato muy popular entre profesionales, estudiantes y escritores. Con Markdown puedes crear listas, títulos, enlaces y formatos enriquecidos sin abandonar el flujo natural de escritura. Además, incluye una función de búsqueda potente que te permite localizar tus notas antiguas al instante, sin importar cuántos apuntes hayas acumulado.</p>
<p><strong>Características principales:</strong>
- Almacenamiento local: tus datos nunca salen de tu dispositivo
- Compatibilidad con Markdown para formatear texto de forma elegante
- Búsqueda instantánea para encontrar cualquier nota rápidamente
- Interfaz limpia y sin distracciones
- Funcionamiento offline total
- Acceso multiplataforma desde cualquier navegador
- Interfaz responsive adaptada a móviles y ordenadores</p>
<hr/>
<h2 id="para-que-sirve">¿Para qué sirve Cuaderno Digital?</h2>
<h3 id="casos-de-uso-principales">Casos de uso principales:</h3>
<h4 id="1-tomar-notas-sin-perder-tus-apuntes">1. Tomar notas sin perder tus apuntes</h4>
<p>Uno de los problemas más frustrantes es perder notas importantes porque desaparece la aplicación donde las guardaste, cambia el proveedor del servicio o simplemente olvidas dónde las almacenaste. Con un cuaderno digital basado en almacenamiento local, eliminamos ese problema de raíz. Todas tus notas se guardan automáticamente en tu navegador, en un lugar seguro y accesible siempre que lo necesites.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Eres estudiante de Ingeniería y necesitas guardar apuntes de ecuaciones diferenciales. Durante la clase, abres tu cuaderno digital y escribes los conceptos importantes. Sin conexión a internet ni sincronización con servidores, tus notas quedan almacenadas en tu portátil. Cuando cierras el navegador y lo abres tres meses después, ahí siguen exactamente igual, esperándote.</p>
</blockquote>
<h4 id="2-escribir-notas-rapidas-sin-conexion-a-internet">2. Escribir notas rápidas sin conexión a internet</h4>
<p>Muchas veces nos encontramos en situaciones donde no tenemos acceso a una conexión estable: en un tren, en una reunión sin WiFi, en una zona rural o simplemente con datos limitados. Un cuaderno digital offline te permite seguir trabajando sin interrupciones. Escribes, guardas y prosigues, todo sin depender de servidores remotos.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Vas en autobús hacia una entrevista de trabajo. Mientras esperas, quieres revisar tus notas de preparación sobre la empresa. Abre tu cuaderno digital en el teléfono: funciona perfectamente sin WiFi. Puedes leer, editar o añadir nuevas reflexiones mientras viajas, todo funciona con fluidez.</p>
</blockquote>
<h4 id="3-organizar-notas-con-formato-sin-instalar-programas-pesados">3. Organizar notas con formato sin instalar programas pesados</h4>
<p>Aplicaciones como Word, Notion o Evernote son potentes, pero requieren instalación, ocupan memoria considerable y a menudo necesitan suscripciones. Un cuaderno digital en la web te ofrece un equilibrio perfecto: la capacidad de formatear texto con Markdown (títulos, listas, énfasis) sin la sobrecarga de recursos que consumen los programas tradicionales.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Trabajas como freelance en contenidos y necesitas guardar fragmentos de investigación. Tu portátil tiene poco espacio libre. Abres el cuaderno digital, escribes tus hallazgos con formato Markdown (listas, viñetas, enlaces), todo se sincroniza automáticamente en tu navegador. Sin instalar nada, tienes un sistema de notas completamente funcional.</p>
</blockquote>
<h4 id="4-guardar-todo-en-tu-ordenador-sin-depender-de-la-nube">4. Guardar todo en tu ordenador sin depender de la nube</h4>
<p>La privacidad y el control son aspectos cada vez más valorados. Si prefieres no compartir tus datos con proveedores de almacenamiento en la nube, un cuaderno digital con almacenamiento local es tu solución. Todas tus notas permanecen en tu dispositivo, bajo tu total supervisión.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Eres abogado y necesitas guardar notas confidenciales sobre casos. Un cuaderno digital que almacena todo localmente te permite mantener esta información privada sin depender de servidores externos. Tus apuntes sobre estrategias legales, testimonios y documentos sensibles quedan protegidos en tu máquina.</p>
</blockquote>
<h4 id="5-buscar-tus-notas-antiguas-al-momento">5. Buscar tus notas antiguas al momento</h4>
<p>Cuando acumulas cientos de apuntes, encontrar uno específico puede ser una tarea complicada sin la herramienta adecuada. La función de búsqueda del cuaderno digital te permite localizar cualquier nota por palabra clave en cuestión de segundos.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Hace un año tomaste notas sobre cómo usar CSS Grid. Hace poco necesitas recordar un detalle específico. Simplemente escribes "CSS Grid" en la búsqueda del cuaderno digital y aparecen todos tus apuntes relacionados al instante, con las palabras destacadas para localizar rápidamente la información que buscas.</p>
</blockquote>
<hr/>
<h2 id="como-usar">Cómo usar Cuaderno Digital paso a paso</h2>
<h3 id="paso-1-acceder-a-la-herramienta">Paso 1: Acceder a la herramienta</h3>
<p>Dirígete a https://meskeia.com/cuaderno-digital/ desde tu navegador preferido. No necesitas instalar nada ni crear una cuenta. La interfaz se cargará inmediatamente, mostrándote un espacio en blanco listo para que comiences a escribir.</p>
<h3 id="paso-2-empezar-a-escribir-tus-notas">Paso 2: Empezar a escribir tus notas</h3>
<p>Simplemente haz clic en el área de texto principal y comienza a escribir. Escribe de forma natural, como lo harías en cualquier editor de texto. El cuaderno digital capturará cada palabra que escribas sin retrasos ni complicaciones.</p>
<h3 id="paso-3-formatear-con-markdown-opcional-pero-recomendado">Paso 3: Formatear con Markdown (opcional pero recomendado)</h3>
<p>Si deseas dar estructura a tus notas, aprovecha la sintaxis Markdown:
- Para títulos: <code># Título grande</code>, <code>## Título mediano</code>, <code>### Título pequeño</code>
- Para listas: <code>- elemento 1</code>, <code>- elemento 2</code> (con guiones)
- Para énfasis: <code>*cursiva*</code> o <code>**negrita**</code>
- Para enlaces: <code>[texto del enlace](URL)</code>
- Para código: usa triple acento grave (```)</p>
<p>Estas marcas de formato se convertirán automáticamente en un texto estructurado y legible.</p>
<h3 id="paso-4-buscar-y-recuperar-tus-notas">Paso 4: Buscar y recuperar tus notas</h3>
<p>Cuando necesites encontrar una nota anterior, utiliza la función de búsqueda disponible en la interfaz. Escribe la palabra clave o frase que recuerdes y el cuaderno digital mostrará instantáneamente todas las notas que coincidan. Esta función es especialmente útil cuando has acumulado decenas o cientos de apuntes.</p>
<p>💡 <strong>Consejo</strong>: Mantén tus notas bien estructuradas desde el principio usando títulos descriptivos. Cuando busques later, encontrarás exactamente lo que necesitas sin perder tiempo entre resultados irrelevantes.</p>
<hr/>
<h2 id="ejemplos">Ejemplos prácticos</h2>
<h3 id="ejemplo-1-estudiante-organizando-apuntes-de-clase">Ejemplo 1: Estudiante organizando apuntes de clase</h3>
<p><strong>Situación:</strong> Eres estudiante de Marketing Digital y asistes a clases de SEO. Necesitas guardar información que el profesor explica, junto con ejemplos propios que se te ocurren durante la clase.</p>
<p><strong>Datos de entrada:</strong>
- Concepto: "Palabras clave long-tail"
- Definición del profesor: "Son búsquedas específicas con 3+ palabras"
- Ejemplo personal: "mejor que buscar 'café', buscar 'café con leche descafeinado'"
- Enlace útil: https://ejemplo-seo.com/guia-keywords</p>
<p><strong>Nota formateada en Markdown:</strong></p>
<div className="codehilite"><pre><span></span><code>## Palabras clave Long-Tail

### Definición
Son búsquedas específicas con 3 o más palabras que tienen menos volumen 
pero mayor intención de compra.

### Ejemplo
- ❌ Mal: café
- ✅ Bien: café con leche descafeinado cerca de mi zona

### Recurso
[Guía completa de keywords](https://ejemplo-seo.com/guia-keywords)
</code></pre>
<p><strong>Resultado:</strong> Cuando necesites repasar antes del examen, busca "long-tail" y accedes instantáneamente a tus apuntes bien organizados con ejemplos claros.</p>
<p><strong>Interpretación:</strong> El cuaderno digital permite transformar notas desordenadas en documentos estructurados mediante Markdown, facilitando la comprensión y el repaso posterior.</p>
<h3 id="ejemplo-2-freelancer-documentando-procesos-de-trabajo">Ejemplo 2: Freelancer documentando procesos de trabajo</h3>
<p><strong>Situación:</strong> Trabajas como diseñador gráfico freelance y necesitas guardar tus procesos, configuraciones y comandos útiles para acelerar proyectos futuros.</p>
<p><strong>Datos de entrada:</strong>
- Proceso: "Crear paleta de colores consistente"
- Herramientas: Adobe Color, Coolors.co
- Pasos: desde seleccionar color primario hasta exportar en diferentes formatos
- Referencias: pantone, especificaciones RGB</p>
<p><strong>Nota formateada:</strong></p>
<div className="codehilite"><pre><span></span><code># Flujo: Creación de Paleta de Colores

## Herramientas
- Adobe Color CC
- Coolors.co (para inspiración rápida)
- Exportador de CSS/JSON

## Proceso paso a paso
1. Seleccionar color primario (cliente/brief)
2. Generar complementarios en Adobe Color
3. Probar contraste (WCAG AAA si es posible)
4. Exportar en formato CSS/SCSS
5. Documentar en archivo de marca

## Configuración estándar
RGB: 255,255,255 (blanco) como referencia
Contrast ratio mínimo: 4.5:1
</code></pre></div>
<p><strong>Resultado:</strong> Después de varios proyectos, tienes un repositorio personal de procesos testados. Para el próximo cliente, simplemente abres tu cuaderno digital, buscas "paleta colores" y accedes a tu flujo probado.</p>
<p><strong>Interpretación:</strong> El cuaderno digital actúa como una base de conocimiento personal, reduciendo tiempo en investigación repetitiva y mejorando la consistencia entre proyectos.</p>
<h3 id="ejemplo-3-profesional-registrando-ideas-empresariales">Ejemplo 3: Profesional registrando ideas empresariales</h3>
<p><strong>Situación:</strong> Eres emprendedor y durante la semana se te ocurren ideas para tu startup. Necesitas capturarlas rápidamente sin perder el hilo de trabajo actual.</p>
<p><strong>Datos de entrada:</strong>
- Idea: "Aplicación para gestionar plantas del hogar"
- Mercado: Millennials urbanos con plantas de interior
- Características principales: recordatorios de riego, diagnóstico de enfermedades, comunidad
- Problemas a resolver: olvido de riego, identificación de plagas</p>
<p><strong>Nota en el cuaderno digital:</strong></p>
<div className="codehilite"><pre><span></span><code><span className="p">#</span><span className="w"> </span><span className="nl">Idea:</span><span className="w"> </span><span className="n">PlantApp</span><span className="w"> </span><span className="o">-</span><span className="w"> </span><span className="n">Gestor</span><span className="w"> </span><span className="n">de</span><span className="w"> </span><span className="n">plantas</span><span className="w"> </span><span className="n">urbanas</span>

<span className="p">##</span><span className="w"> </span><span className="n">Problema</span>
<span className="n">Los</span><span className="w"> </span><span className="n">urbanitas</span><span className="w"> </span><span className="n">olvidan</span><span className="w"> </span><span className="n">regar</span><span className="w"> </span><span className="n">sus</span><span className="w"> </span><span className="n">plantas</span><span className="w"> </span><span className="n">o</span><span className="w"> </span><span className="n">no</span><span className="w"> </span><span className="n">saben</span><span className="w"> </span><span className="n">diagnosticar</span><span className="w"> </span><span className="n">qué</span><span className="w"> </span><span className="n">les</span><span className="w"> </span><span className="n">pasa</span><span className="p">.</span>

<span className="p">##</span><span className="w"> </span><span className="n">Solución</span>
<span className="n">App</span><span className="w"> </span><span className="nl">con:</span>
<span className="o">-</span><span className="w"> </span><span className="n">Recordatorios</span><span className="w"> </span><span className="n">de</span><span className="w"> </span><span className="n">riego</span><span className="w"> </span><span className="n">personalizados</span><span className="w"> </span><span className="n">por</span><span className="w"> </span><span className="n">tipo</span><span className="w"> </span><span className="n">de</span><span className="w"> </span><span className="n">planta</span>
<span className="o">-</span><span className="w"> </span><span className="n">Foto</span><span className="w"> </span><span className="o">&gt;</span><span className="w"> </span><span className="n">IA</span><span className="w"> </span><span className="n">identifica</span><span className="w"> </span><span className="n">la</span><span className="w"> </span><span className="n">planta</span><span className="w"> </span><span className="n">y</span><span className="w"> </span><span className="n">su</span><span className="w"> </span><span className="n">especie</span>
<span className="o">-</span><span className="w"> </span><span className="n">Sistema</span><span className="w"> </span><span className="n">de</span><span className="w"> </span><span className="n">diagnóstico</span><span className="w"> </span><span className="n">de</span><span className="w"> </span><span className="n">plagas</span><span className="o">/</span><span className="n">enfermedades</span>
<span className="o">-</span><span className="w"> </span><span className="n">Comunidad</span><span className="w"> </span><span className="n">para</span><span className="w"> </span><span className="n">compartir</span><span className="w"> </span><span className="n">tips</span>

<span className="p">##</span><span className="w"> </span><span className="n">Mercado</span><span className="w"> </span><span className="n">objetivo</span>
<span className="o">-</span><span className="w"> </span><span className="nl">Edad:</span><span className="w"> </span><span className="mh">25</span><span className="o">-</span><span className="mh">40</span><span className="w"> </span><span className="n">años</span>
<span className="o">-</span><span className="w"> </span><span className="nl">Ubicación:</span><span className="w"> </span><span className="n">ciudades</span><span className="w"> </span><span className="n">principales</span>
<span className="o">-</span><span className="w"> </span><span className="nl">Perfil:</span><span className="w"> </span><span className="n">propietarios</span><span className="w"> </span><span className="n">de</span><span className="w"> </span><span className="mh">3</span><span className="o">+</span><span className="w"> </span><span className="n">plantas</span>

<span className="p">##</span><span className="w"> </span><span className="n">Competencia</span>
<span className="o">-</span><span className="w"> </span><span className="n">Gardenize</span><span className="w"> </span><span className="p">(</span><span className="n">cara</span><span className="p">,</span><span className="w"> </span><span className="n">desactualizada</span><span className="p">)</span>
<span className="o">-</span><span className="w"> </span><span className="n">PlantSnap</span><span className="w"> </span><span className="p">(</span><span className="n">solo</span><span className="w"> </span><span className="n">identificación</span><span className="p">)</span>
</code></pre></div>
<p><strong>Resultado:</strong> Cuando tengas una reunión con inversores o socios, abre tu cuaderno digital, busca "PlantApp" y presenta una idea completamente desarrollada, sin detalles faltantes.</p>
<p><strong>Interpretación:</strong> El cuaderno digital transforma ideas fugaces en propuestas documentadas, facilitando la comunicación y el desarrollo posterior de proyectos.</p>
<hr/>
<h2 id="faqs">Preguntas frecuentes (FAQs)</h2>
<h3 id="mis-notas-estan-realmente-seguras-si-se-guardan-localmente">❓ ¿Mis notas están realmente seguras si se guardan localmente?</h3>
<p>Sí, mucho más que en servicios en la nube. Tus notas se almacenan en el almacenamiento local de tu navegador (localStorage), un espacio destinado específicamente a guardar información del dispositivo. Solo tú, desde tu navegador, puedes acceder a ellas. No salen de tu ordenador, no se sincronizan con servidores externos, no se rastrean. Por supuesto, si desformateas el dispositivo o limpias el almacenamiento del navegador sin hacer backup, sí que podrías perderlas.</p>
<h3 id="puedo-acceder-a-mis-notas-desde-diferentes-dispositivos">❓ ¿Puedo acceder a mis notas desde diferentes dispositivos?</h3>
<p>Por defecto, al ser almacenamiento local, tus notas están vinculadas al navegador de un dispositivo específico. Sin embargo, puedes hacer copy-paste de tus notas y transferirlas manualmente entre dispositivos. Alternativamente, puedes exportar tu contenido y sincronizarlo manualmente. Si necesitas sincronización automática entre dispositivos, considera usar herramientas adicionales o servicios en la nube, aunque esto implicaría sacrificar parte de la privacidad.</p>
<h3 id="funciona-markdown-en-el-cuaderno-digital">❓ ¿Funciona Markdown en el cuaderno digital?</h3>
<p>Completamente. El cuaderno digital interpreta y renderiza Markdown automáticamente, permitiéndote usar toda la sintaxis estándar. Tus títulos (<code>#</code>), listas (<code>-</code>), enlaces y formato de texto se mostrarán correctamente sin que tengas que aprender comandos complejos.</p>
<h3 id="que-hago-si-pierdo-mis-notas-accidentalmente">❓ ¿Qué hago si pierdo mis notas accidentalmente?</h3>
<p>Esto depende del método de almacenamiento de tu navegador. Si simplemente eliminas el contenido por error, es complicado recuperarlo sin hacer copia de seguridad. Por eso recomendamos exportar regularmente tus notas importantes. Algunos navegadores permiten restaurar datos eliminados si actúas rápidamente, pero no es garantizado.</p>
<h3 id="hay-limite-de-notas-o-cantidad-de-caracteres">❓ ¿Hay límite de notas o cantidad de caracteres?</h3>
<p>El almacenamiento local típicamente permite entre 5-10MB de datos dependiendo del navegador. Esto significa que puedes guardar miles de notas sin problemas. Sin embargo, si intentas guardar contenido multimedia pesado, podrías alcanzar el límite. Para documentos puramente texto, no deberías enfrentarte a restricciones prácticas.</p>
<h3 id="funciona-correctamente-en-moviles">❓ ¿Funciona correctamente en móviles?</h3>
<p>Sí, el cuaderno digital tiene diseño responsive. Accede desde tu teléfono móvil usando cualquier navegador moderno (Chrome, Safari, Firefox) y funciona de manera idéntica. Puedes tomar notas, buscar y editar sin diferencia respecto a la versión de escritorio.</p>
<h3 id="neces">❓ ¿Neces</h3>

<div style={{marginTop: "3rem", paddingTop: "2rem", borderTop: "2px solid var(--border)", textAlign: "center"}}>
<a href="../index.html" style={{display: "inline-block", background: "var(--primary)", color: "white", padding: "0.75rem 2rem", borderRadius: "8px", textDecoration: "none", fontWeight: "600", transition: "all 0.3s ease", boxShadow: "0 2px 8px rgba(46, 134, 171, 0.2)"}}>
                ← Volver al índice de guías
            </a>
</div>
<div className="cta-box">
<h3>🎯 Prueba Cuaderno Digital ahora</h3>
<p>Herramienta 100% gratuita, sin registro, funciona offline</p>
<a className="cta-button" href="https://meskeia.com/cuaderno-digital/">Ir a Cuaderno Digital →</a>
</div>
</div>
        </article>
      </div>

      <Footer appName="meskeIA" />
    </>
  );
}
