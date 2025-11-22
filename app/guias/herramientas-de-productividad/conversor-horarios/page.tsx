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
          <h1>⏰ Conversor de Horarios Mundial: Guía Completa 2025</h1>
<p>El <strong>Conversor de Horarios Mundial de meskeIA</strong> es una herramienta gratuita que te permite visualizar y comparar las horas de 31 ciudades principales del mundo en tiempo real mediante relojes analógicos, indicadores visuales de día/noche y un convertidor entre zonas horarias.</p>
<div className="cta-box">
<h3>🚀 Prueba el Conversor de Horarios Mundial</h3>
<a className="cta-button" href="../../conversor-horarios/">Abrir Herramienta →</a>

<h2>🌍 ¿Qué es el Conversor de Horarios Mundial?</h2>
<p>Es una aplicación web que te muestra la hora actual de 31 ciudades principales distribuidas en todos los continentes, con relojes analógicos animados que se actualizan cada segundo. Además, incluye un conversor que te permite calcular qué hora será en una ciudad cuando en otra sean las X horas.</p>
<h3>Características principales</h3>
<ul>
<li><strong>4 relojes analógicos en tiempo real</strong>: Visualiza simultáneamente 4 ciudades con relojes que se actualizan cada segundo</li>
<li><strong>31 ciudades disponibles</strong>: Ciudades de Europa, América, Asia, Oceanía y África</li>
<li><strong>Indicadores día/noche</strong>: Cada ciudad muestra si es de día (☀️) o de noche (🌙) según su hora local</li>
<li><strong>Diferencia horaria automática</strong>: Muestra cuántas horas de diferencia hay respecto a Madrid</li>
<li><strong>Conversor entre ciudades</strong>: Calcula qué hora es en una ciudad cuando en otra son las X horas</li>
<li><strong>Conversor por abreviaturas</strong>: Convierte entre zonas horarias usando abreviaturas estándar (PST, EST, CET, GMT, JST, etc.) con tabla de equivalencias completa</li>
<li><strong>Cambio de ciudades</strong>: Personaliza qué ciudades ver en cada reloj mediante selectores</li>
</ul>
<h2>🎯 Casos de Uso Prácticos</h2>
<h3>1. Coordinar llamadas con clientes internacionales</h3>
<p>Si trabajas con clientes en Nueva York, Tokio o Londres, necesitas saber si están en horario laboral antes de llamar. Con el conversor puedes ver rápidamente si es de día o de noche en su ubicación y planificar la llamada para cuando estén disponibles.</p>
<blockquote>
            Ejemplo: Quieres llamar a un cliente en Singapur. Ves que son las 10:00 en Madrid y el indicador de Singapur muestra "🌙 Noche" (las 16:00). Decides esperar hasta las 14:00 hora española (20:00 en Singapur) para que sea más razonable.
        </blockquote>
<h3>2. Equipos remotos distribuidos globalmente</h3>
<p>Si trabajas en un equipo con miembros en diferentes continentes, necesitas encontrar horarios de reunión que funcionen para todos. El conversor te permite ver las 4 ciudades a la vez y detectar ventanas de tiempo donde todos estén en horario laboral.</p>
<h3>3. Mercados financieros internacionales</h3>
<p>Los inversores necesitan saber cuándo abren y cierran los mercados de Nueva York, Londres, Hong Kong y Tokio. El conversor te muestra la hora exacta en cada plaza financiera para no perderte las aperturas.</p>
<h3>4. Contactar familiares en el extranjero</h3>
<p>Si tienes familiares viviendo en otro país, quieres evitar llamarles de madrugada. El indicador día/noche te avisa visualmente si es buen momento para contactar.</p>
<h2>🛠️ Cómo Usar el Conversor Paso a Paso</h2>
<h3>Visualización de Relojes en Tiempo Real</h3>
<ol>
<li><strong>Observa los 4 relojes predeterminados</strong>: Al abrir la herramienta verás Madrid, Londres, Nueva York y Tokio</li>
<li><strong>Cada reloj muestra</strong>:
                <ul>
<li>Hora digital (formato 24h)</li>
<li>Reloj analógico con manecillas animadas</li>
<li>Diferencia horaria respecto a Madrid (ej: "+8h")</li>
<li>Indicador día/noche (☀️ Día o 🌙 Noche)</li>
</ul>
</li>
<li><strong>Los relojes se actualizan automáticamente</strong>: Las manecillas se mueven cada segundo sin necesidad de recargar</li>
</ol>
<h3>Cambiar de Ciudad en un Reloj</h3>
<ol>
<li><strong>Haz clic en el selector</strong> que aparece encima de cada reloj</li>
<li><strong>Elige una ciudad de la lista</strong>: Verás 31 opciones con bandera emoji (ej: 🇪🇸 Madrid, 🇺🇸 Nueva York)</li>
<li><strong>El reloj se actualiza instantáneamente</strong>: Verás la nueva hora, diferencia horaria y indicador día/noche</li>
</ol>
<h3>Usar el Conversor Manual de Horarios</h3>
<p>En la parte inferior de la página encontrarás el <strong>Convertidor Entre Ciudades</strong>:</p>
<ol>
<li><strong>Selecciona la ciudad de origen</strong>: Por ejemplo, Madrid</li>
<li><strong>Selecciona la ciudad de destino</strong>: Por ejemplo, Nueva York</li>
<li><strong>Introduce una hora</strong>: Por ejemplo, 18:00 (6 de la tarde)</li>
<li><strong>Lee el resultado automático</strong>: "Cuando en 🇪🇸 Madrid son las 18:00, en 🇺🇸 Nueva York son las 12:00"</li>
</ol>
<blockquote>
            💡 <strong>Tip</strong>: Usa el conversor para planificar reuniones. Si propones las 15:00 hora española, el conversor te dice qué hora será para cada participante en su zona.
        </blockquote>
<h2>🌐 Ciudades Disponibles por Continente</h2>
<h3>Europa (8 ciudades)</h3>
<ul>
<li>🇪🇸 Madrid</li>
<li>🇬🇧 Londres</li>
<li>🇫🇷 París</li>
<li>🇩🇪 Berlín</li>
<li>🇮🇹 Roma</li>
<li>🇷🇺 Moscú</li>
<li>🇬🇷 Atenas</li>
<li>🇳🇱 Ámsterdam</li>
</ul>
<h3>América (9 ciudades)</h3>
<ul>
<li>🇺🇸 Nueva York</li>
<li>🇺🇸 Los Ángeles</li>
<li>🇺🇸 Chicago</li>
<li>🇲🇽 Ciudad de México</li>
<li>🇨🇦 Toronto</li>
<li>🇦🇷 Buenos Aires</li>
<li>🇧🇷 São Paulo</li>
<li>🇵🇪 Lima</li>
<li>🇨🇴 Bogotá</li>
</ul>
<h3>Asia (9 ciudades)</h3>
<ul>
<li>🇯🇵 Tokio</li>
<li>🇨🇳 Pekín</li>
<li>🇨🇳 Shanghái</li>
<li>🇸🇬 Singapur</li>
<li>🇭🇰 Hong Kong</li>
<li>🇦🇪 Dubái</li>
<li>🇮🇳 Delhi</li>
<li>🇰🇷 Seúl</li>
<li>🇹🇭 Bangkok</li>
</ul>
<h3>Oceanía (2 ciudades)</h3>
<ul>
<li>🇦🇺 Sídney</li>
<li>🇳🇿 Auckland</li>
</ul>
<h3>África (2 ciudades)</h3>
<ul>
<li>🇪🇬 El Cairo</li>
<li>🇿🇦 Johannesburgo</li>
</ul>
<h2>💡 Trucos y Consejos de Uso</h2>
<h3>1. Planificar reuniones internacionales</h3>
<p>Configura los 4 relojes con las ciudades de tus compañeros de equipo. Busca una franja horaria donde los 4 muestren "☀️ Día" para asegurar que nadie tiene que conectarse de madrugada.</p>
<h3>2. Detectar cambios de horario de verano</h3>
<p>La herramienta ajusta automáticamente el horario de verano (DST) de cada país. Si ves que la diferencia horaria cambia en primavera/otoño, es porque algún país ha cambiado la hora.</p>
<h3>3. Verificar antes de enviar mensajes importantes</h3>
<p>Antes de enviar un email urgente a un cliente internacional, verifica si está en horario laboral. Evita enviar notificaciones a las 3 AM de su hora local.</p>
<h3>4. Freelancers con clientes en varios husos</h3>
<p>Si trabajas con clientes en 3-4 zonas horarias diferentes, deja la herramienta abierta en una pestaña. Te sirve como referencia rápida para saber si están disponibles.</p>
<h2>⚙️ Características Técnicas</h2>
<h3>Actualización en tiempo real</h3>
<p>Los relojes se actualizan cada segundo mediante JavaScript nativo. Las manecillas de hora, minuto y segundo se mueven de forma fluida sin necesidad de recargar la página.</p>
<h3>Zonas horarias precisas</h3>
<p>La herramienta usa la API <code>Intl.DateTimeFormat</code> de JavaScript con las zonas horarias oficiales IANA (ej: <code>Europe/Madrid</code>, <code>America/New_York</code>). Esto garantiza que los horarios sean exactos incluso durante cambios de horario de verano.</p>
<h3>Indicadores día/noche automáticos</h3>
<p>El indicador considera que es "Día" entre las 6:00 y las 19:59 hora local, y "Noche" entre las 20:00 y las 5:59. El badge cambia automáticamente según la hora de cada ciudad.</p>
<h3>Diferencia horaria respecto a Madrid</h3>
<p>Cada reloj muestra la diferencia en horas respecto a Madrid, España (zona <code>Europe/Madrid</code>). Ejemplos: "+8h" (Tokio), "-5h" (Nueva York), "+0h" (Londres en invierno).</p>
<h2>🔧 Preguntas Frecuentes (FAQ)</h2>
<h3>¿Por qué algunas banderas no se ven?</h3>
<p>Los emojis de banderas (🇪🇸, 🇺🇸) funcionan en navegadores modernos como Chrome, Edge y Safari. En versiones antiguas de Firefox o Windows puede que se vean como códigos de país (ES, US). La funcionalidad no se ve afectada.</p>
<h3>¿Cómo sabe la herramienta cuándo es horario de verano?</h3>
<p>JavaScript detecta automáticamente el horario de verano (DST) según la configuración del sistema operativo y las reglas de cada zona horaria. No necesitas hacer nada manual.</p>
<h3>¿Puedo ver más de 4 ciudades a la vez?</h3>
<p>Actualmente la herramienta muestra 4 relojes simultáneamente, pero puedes cambiar las ciudades en cualquier momento mediante los selectores. En dispositivos móviles se muestran en columna para mejor visualización.</p>
<h3>¿La herramienta funciona offline?</h3>
<p>Sí, una vez cargada la página, los relojes funcionan completamente offline. La hora se obtiene del reloj de tu dispositivo y se convierte a las zonas horarias correspondientes.</p>
<h3>¿Por qué la diferencia horaria varía a lo largo del año?</h3>
<p>Porque no todos los países cambian la hora el mismo día. Por ejemplo, EEUU puede cambiar en marzo y Europa en abril, generando diferencias temporales hasta que ambos hayan cambiado.</p>
<h2>🎓 Casos de Uso Avanzados</h2>
<h3>Coordinación de eventos globales</h3>
<p>Si organizas un webinar internacional, usa el conversor para encontrar el "punto medio" donde la mayoría de participantes estén en horario razonable. Por ejemplo, 15:00 Madrid = 9:00 Nueva York = 22:00 Tokio (algo tarde pero aceptable).</p>
<h3>Trading de criptomonedas 24/7</h3>
<p>Los mercados crypto nunca cierran, pero los traders activos suelen estar en ciertas zonas. Configura los relojes con Nueva York, Londres, Hong Kong y Singapur para ver cuándo hay más actividad.</p>
<h3>Atención al cliente global</h3>
<p>Si gestionas un equipo de soporte distribuido, usa la herramienta para saber qué agentes están en turno según su zona horaria. Asigna tickets urgentes a quien esté en horario diurno.</p>
<h2>🌐 Conversor por Abreviaturas de Zona Horaria</h2>
<p>Además de los relojes en tiempo real y el conversor entre ciudades, la herramienta incluye un <strong>conversor avanzado por abreviaturas de zona horaria</strong> (PST, EST, CET, GMT, etc.), ideal para interpretar horarios en documentos internacionales, reuniones profesionales y eventos globales.</p>
<h3>¿Qué son las abreviaturas de zona horaria?</h3>
<p>Las abreviaturas de zona horaria son códigos de 3-4 letras que identifican zonas horarias estándar en diferentes regiones del mundo. Por ejemplo:</p>
<ul>
<li><strong>PST</strong> - Pacific Standard Time (Costa oeste de EE.UU., UTC-8)</li>
<li><strong>EST</strong> - Eastern Standard Time (Costa este de EE.UU., UTC-5)</li>
<li><strong>CET</strong> - Central European Time (Europa central, UTC+1)</li>
<li><strong>GMT</strong> - Greenwich Mean Time (Reino Unido, UTC+0)</li>
<li><strong>JST</strong> - Japan Standard Time (Japón, UTC+9)</li>
</ul>
<h3>Casos de uso del conversor de abreviaturas</h3>
<h4>1. Interpretar correos electrónicos internacionales</h4>
<p>Si recibes un correo que dice "Reunión programada para November 19th, 2025 12:01 AM PST", puedes introducir PST en el conversor y ver automáticamente qué hora es en tu zona horaria (CET, GMT, etc.).</p>
<blockquote>
<strong>Ejemplo práctico:</strong> Recibes "Meeting at 3:00 PM EST". Introduces EST y 15:00 en el conversor, y ves que en CET serán las 21:00 (9 PM). Decides si puedes asistir.
        </blockquote>
<h4>2. Webinars y eventos globales</h4>
<p>Los webinars internacionales suelen anunciarse con abreviaturas ("Webinar starts at 10 AM PST"). El conversor te muestra las equivalencias en todas las zonas horarias principales, para que sepas exactamente cuándo conectarte desde tu ubicación.</p>
<h4>3. Coordinación con equipos en diferentes continentes</h4>
<p>Si trabajas con equipos en EE.UU., Europa y Asia, puedes usar el conversor para encontrar horarios que funcionen para todos. Introduces una hora en PST y ves las equivalencias en CET, JST, AEST, etc.</p>
<h3>Zonas horarias incluidas (31 abreviaturas)</h3>
<h4>América del Norte</h4>
<ul>
<li><strong>PST/PDT</strong> - Pacific Standard/Daylight Time (Los Ángeles, Seattle)</li>
<li><strong>MST/MDT</strong> - Mountain Standard/Daylight Time (Denver, Phoenix)</li>
<li><strong>CST/CDT</strong> - Central Standard/Daylight Time (Chicago, Ciudad de México)</li>
<li><strong>EST/EDT</strong> - Eastern Standard/Daylight Time (Nueva York, Toronto)</li>
<li><strong>AST/ADT</strong> - Atlantic Standard/Daylight Time (Halifax)</li>
</ul>
<h4>Europa</h4>
<ul>
<li><strong>GMT</strong> - Greenwich Mean Time (Londres en invierno)</li>
<li><strong>UTC</strong> - Coordinated Universal Time (Referencia internacional)</li>
<li><strong>BST</strong> - British Summer Time (Londres en verano)</li>
<li><strong>CET/CEST</strong> - Central European Time/Summer Time (Madrid, París, Berlín)</li>
<li><strong>EET/EEST</strong> - Eastern European Time/Summer Time (Atenas, Bucarest)</li>
<li><strong>MSK</strong> - Moscow Standard Time (Moscú)</li>
</ul>
<h4>Asia y Oceanía</h4>
<ul>
<li><strong>GST</strong> - Gulf Standard Time (Dubái)</li>
<li><strong>IST</strong> - India Standard Time (Delhi)</li>
<li><strong>ICT</strong> - Indochina Time (Bangkok)</li>
<li><strong>CST (Asia)</strong> - China Standard Time (Pekín, Shanghái)</li>
<li><strong>JST</strong> - Japan Standard Time (Tokio)</li>
<li><strong>KST</strong> - Korea Standard Time (Seúl)</li>
<li><strong>AEST/AEDT</strong> - Australian Eastern Standard/Daylight Time (Sídney)</li>
<li><strong>NZST/NZDT</strong> - New Zealand Standard/Daylight Time (Auckland)</li>
</ul>
<h3>Cómo usar el conversor de abreviaturas</h3>
<ol>
<li><strong>Selecciona la zona horaria origen</strong>: Por ejemplo, PST (Pacific Standard Time)</li>
<li><strong>Introduce la hora en esa zona</strong>: Por ejemplo, 14:00 (2 PM)</li>
<li><strong>Consulta la tabla de resultados</strong>: Verás automáticamente las equivalencias en todas las 31 zonas horarias</li>
<li><strong>Identifica tu zona</strong>: La fila de la zona origen estará resaltada en azul para fácil identificación</li>
<li><strong>Lee las equivalencias</strong>: Cada fila muestra el nombre completo, abreviatura, offset UTC y hora local correspondiente</li>
</ol>
<h3>Diferencia entre Standard Time y Daylight Time</h3>
<p>Algunas zonas horarias tienen dos abreviaturas (ej: PST/PDT, CET/CEST) porque aplican <strong>horario de verano (Daylight Saving Time)</strong>:</p>
<ul>
<li><strong>Standard Time (horario estándar)</strong>: Se usa durante el invierno</li>
<li><strong>Daylight Time (horario de verano)</strong>: Se usa durante el verano, adelantando 1 hora</li>
</ul>
<blockquote>
            💡 <strong>Consejo</strong>: El conversor incluye ambas versiones (estándar y verano) para cada zona, así siempre encuentras la abreviatura que aparece en tu correo o documento.
        </blockquote>
<h2>📊 Comparación con Otras Herramientas</h2>
<table border="1" cellpadding="10" cellspacing="0" style={{width: "100%", margin: "1rem 0", borderCollapse: "collapse"}}>
<thead>
<tr style={{background: "var(--primary)", color: "white"}}>
<th>Característica</th>
<th>meskeIA</th>
<th>Otras webs</th>
</tr>
</thead>
<tbody>
<tr>
<td>Relojes analógicos animados</td>
<td>✅ Sí</td>
<td>❌ Solo digitales</td>
</tr>
<tr>
<td>Indicador día/noche visual</td>
<td>✅ Automático</td>
<td>❌ No incluido</td>
</tr>
<tr>
<td>Conversor entre ciudades</td>
<td>✅ Incluido</td>
<td>✅ Algunas</td>
</tr>
<tr>
<td>Conversor por abreviaturas (PST, EST, CET, etc.)</td>
<td>✅ 31 zonas horarias</td>
<td>❌ No incluido</td>
</tr>
<tr>
<td>Publicidad</td>
<td>✅ Sin publicidad</td>
<td>❌ Con anuncios</td>
</tr>
<tr>
<td>Registro requerido</td>
<td>✅ Sin registro</td>
<td>❌ Requiere cuenta</td>
</tr>
<tr>
<td>Funciona offline</td>
<td>✅ Sí</td>
<td>❌ Requiere internet</td>
</tr>
</tbody>
</table>
<h2>🚀 Conclusión</h2>
<p>El <strong>Conversor de Horarios Mundial de meskeIA</strong> es la herramienta perfecta para cualquiera que necesite coordinar actividades internacionales. Su interfaz visual con relojes analógicos, indicadores día/noche y conversor manual te ahorra tiempo y evita errores al planificar llamadas o reuniones con personas en otros países.</p>
<p>Al ser 100% gratuita, sin registro y sin publicidad, puedes usarla diariamente como referencia rápida sin interrupciones molestas. Funciona en cualquier dispositivo y se adapta perfectamente a móviles.</p>
<div className="cta-box">
<h3>⏰ Empieza a Usar el Conversor Ahora</h3>
<p style={{color: "rgba(255,255,255,0.9)", marginBottom: "1.5rem"}}>Coordina tus actividades internacionales sin errores</p>
<a className="cta-button" href="../../conversor-horarios/">Abrir Conversor de Horarios →</a>
</div>
<hr style={{border: "none", borderTop: "1px solid var(--border)", margin: "2rem 0"}}/>
<p style={{textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem"}}>
<strong>meskeIA</strong> | Herramientas web gratuitas sin registro<br/>
<a href="../../index.html" style={{color: "var(--primary)", textDecoration: "none"}}>← Volver al inicio</a> |
            <a href="../index.html" style={{color: "var(--primary)", textDecoration: "none"}}>Ver todas las guías →</a>
</p>
</div>
        </article>
      </div>

      <Footer appName="meskeIA" />
    </>
  );
}
