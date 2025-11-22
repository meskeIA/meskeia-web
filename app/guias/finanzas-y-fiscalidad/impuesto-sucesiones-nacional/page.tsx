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
          <h1>Guía Completa: Impuesto de Sucesiones Nacional 2025</h1>
<blockquote>
<p>Aprende a calcular el impuesto de sucesiones en España bajo régimen común. Guía práctica con ejemplos reales para 14 comunidades autónomas.</p>
</blockquote>
<h2>📋 Tabla de Contenidos</h2>
<ol>
<li><a href="#que-es">¿Qué es el Impuesto de Sucesiones Nacional?</a></li>
<li><a href="#para-que-sirve">¿Para qué sirve?</a></li>
<li><a href="#como-usar">Cómo usar la calculadora paso a paso</a></li>
<li><a href="#ejemplos">Ejemplos prácticos</a></li>
<li><a href="#faqs">Preguntas frecuentes</a></li>
<li><a href="#consejos">Consejos y mejores prácticas</a></li>
</ol>
<hr/>
<h2 id="que-es">💰 ¿Qué es el Impuesto de Sucesiones Nacional?</h2>
<p>El <strong>Impuesto sobre Sucesiones y Donaciones (ISD)</strong> es un tributo que se paga en España cuando recibes una herencia. Aunque es un impuesto estatal, cada comunidad autónoma tiene competencias para aplicar bonificaciones y reducciones propias.</p>
<p><strong>Régimen común vs. regímenes forales:</strong></p>
<ul>
<li><strong>Régimen común:</strong> Aplicable en 14 comunidades autónomas (todas excepto Cataluña, País Vasco y Navarra)</li>
<li><strong>Regímenes forales:</strong> Cataluña, País Vasco y Navarra tienen normativa propia completamente diferente</li>
</ul>
<p>Esta calculadora está diseñada específicamente para el <strong>régimen común nacional</strong>, que incluye:</p>
<ul>
<li>Andalucía</li>
<li>Aragón</li>
<li>Asturias</li>
<li>Baleares</li>
<li>Canarias</li>
<li>Cantabria</li>
<li>Castilla y León</li>
<li>Castilla-La Mancha</li>
<li>Extremadura</li>
<li>Galicia</li>
<li>La Rioja</li>
<li>Madrid</li>
<li>Murcia</li>
<li>Comunidad Valenciana</li>
</ul>
<p><strong>Características principales de la calculadora:</strong></p>
<ul>
<li>📊 Cálculo automático según normativa estatal de 2025</li>
<li>👨‍👩‍👧‍👦 Diferenciación por grupos de parentesco (I, II, III, IV)</li>
<li>💶 Aplicación de reducciones estatales y autonómicas</li>
<li>🧮 Cálculo de cuota tributaria con tarifa progresiva</li>
<li>📱 Compatible con móvil, tablet y ordenador</li>
<li>🆓 Completamente gratuito sin registro</li>
</ul>
<hr/>
<h2 id="para-que-sirve">¿Para qué sirve esta calculadora?</h2>
<h3>Casos de uso principales:</h3>
<h4>1. Estimar el impuesto a pagar tras recibir una herencia</h4>
<p>Si acabas de recibir una herencia y necesitas saber cuánto deberás pagar a Hacienda, esta calculadora te dará una estimación precisa basada en los baremos oficiales de 2025. Así podrás planificar el pago antes de que expire el plazo de 6 meses.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Tu padre fallece y te deja una herencia de 150.000 €. Vives en la Comunidad de Madrid y eres hijo directo (Grupo I). Introduces estos datos en la calculadora y descubres que gracias a la bonificación del 99% en Madrid, solo pagarás unos 200 €, en lugar de los 20.000 € que correspondería sin bonificación.</p>
</blockquote>
<h4>2. Comparar el coste fiscal entre diferentes comunidades autónomas</h4>
<p>El impuesto de sucesiones varía drásticamente según la comunidad autónoma. Madrid y Andalucía tienen bonificaciones del 99% para descendientes directos, mientras que otras comunidades apenas bonifican. Esta calculadora te permite ver estas diferencias.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Estás pensando en mudarte a otra comunidad autónoma y quieres saber cómo afectaría fiscalmente recibir una futura herencia. Pruebas con Madrid (bonificación 99%), Castilla-La Mancha (reducción limitada) y Andalucía (bonificación 99%), y descubres que la diferencia puede ser de decenas de miles de euros.</p>
</blockquote>
<h4>3. Planificar la sucesión con antelación</h4>
<p>Si estás planificando tu testamento y quieres minimizar la carga fiscal para tus herederos, puedes usar la calculadora para simular diferentes escenarios de reparto y ver cuál es más favorable fiscalmente.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Tienes un patrimonio de 500.000 € y dos hijos. Simulas dividir la herencia en partes iguales (250.000 € cada uno) vs. crear un usufructo vitalicio para tu cónyuge. La calculadora te muestra que la segunda opción reduce significativamente el impuesto inmediato para tus hijos.</p>
</blockquote>
<h4>4. Entender el impacto del parentesco en el impuesto</h4>
<p>El impuesto de sucesiones es radicalmente diferente según el parentesco:</p>
<ul>
<li><strong>Grupo I (hijos menores de 21 años):</strong> Máximas reducciones</li>
<li><strong>Grupo II (hijos mayores de 21, cónyuge, padres):</strong> Reducciones medias</li>
<li><strong>Grupo III (hermanos, tíos, sobrinos):</strong> Reducciones bajas</li>
<li><strong>Grupo IV (primos, amigos, extraños):</strong> Sin reducciones</li>
</ul>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Un tío sin hijos te deja 100.000 € en herencia. Eres su sobrino (Grupo III). La calculadora muestra que pagarás aproximadamente 20.000 €, mientras que un hijo directo (Grupo II) solo pagaría 1.000 € por la misma cantidad gracias a las reducciones.</p>
</blockquote>
<hr/>
<h2 id="como-usar">Cómo usar la calculadora paso a paso</h2>
<h3>Paso 1: Accede a la calculadora</h3>
<p>Abre tu navegador y dirígete a <strong>https://meskeia.com/impuesto-sucesiones-nacional/</strong>. La calculadora cargará automáticamente. No necesitas registrarte ni descargar nada.</p>
<h3>Paso 2: Introduce el valor de la herencia recibida</h3>
<p>En el campo <strong>"Valor de la herencia (€)"</strong>, escribe la cantidad total que heredas. Esto incluye:</p>
<ul>
<li>Dinero en efectivo o cuentas bancarias</li>
<li>Valor catastral de inmuebles (viviendas, locales, terrenos)</li>
<li>Valor de acciones, fondos de inversión o bonos</li>
<li>Valor de vehículos, joyas u otros bienes</li>
<li>Seguros de vida (si no están exentos)</li>
</ul>
<p>💡 <strong>Consejo:</strong> Para inmuebles, usa el valor catastral (aparece en el recibo del IBI), no el valor de mercado. Hacienda puede ajustarlo posteriormente si considera que está infravalorado.</p>
<h3>Paso 3: Selecciona tu comunidad autónoma</h3>
<p>En el desplegable <strong>"Comunidad Autónoma"</strong>, selecciona la comunidad donde residía el fallecido en el momento de su muerte. Esto determina qué bonificaciones se aplicarán.</p>
<p>⚠️ <strong>Importante:</strong> No importa dónde vivas tú como heredero, sino dónde residía el causante (la persona fallecida).</p>
<h3>Paso 4: Indica tu grado de parentesco</h3>
<p>Selecciona uno de los cuatro grupos:</p>
<ul>
<li><strong>Grupo I:</strong> Descendientes menores de 21 años (hijos, nietos)</li>
<li><strong>Grupo II:</strong> Descendientes mayores de 21, cónyuge, ascendientes (hijos adultos, esposo/a, padres)</li>
<li><strong>Grupo III:</strong> Colaterales de 2º y 3º grado (hermanos, tíos, sobrinos)</li>
<li><strong>Grupo IV:</strong> Colaterales de 4º grado y extraños (primos, amigos, conocidos)</li>
</ul>
<h3>Paso 5: Introduce tu patrimonio preexistente (opcional pero recomendado)</h3>
<p>El campo <strong>"Patrimonio preexistente (€)"</strong> se refiere al patrimonio que ya tenías antes de recibir la herencia. Esto incluye:</p>
<ul>
<li>Valor de tu vivienda habitual</li>
<li>Cuentas bancarias y depósitos</li>
<li>Inversiones (acciones, fondos, planes de pensiones)</li>
<li>Otros inmuebles o bienes de valor</li>
</ul>
<p>💡 <strong>Consejo:</strong> Si no conoces tu patrimonio exacto, puedes dejarlo en 0 € para obtener una estimación conservadora. Sin embargo, declarar el patrimonio real puede aumentar el coeficiente multiplicador y por tanto el impuesto.</p>
<h3>Paso 6: Haz clic en "Calcular Impuesto"</h3>
<p>La calculadora procesará los datos instantáneamente y mostrará:</p>
<ul>
<li><strong>Base imponible:</strong> Herencia menos reducciones estatales y autonómicas</li>
<li><strong>Cuota tributaria:</strong> Impuesto bruto según tarifa progresiva</li>
<li><strong>Coeficiente multiplicador:</strong> Ajuste según patrimonio preexistente y parentesco</li>
<li><strong>Bonificaciones aplicadas:</strong> Porcentaje de descuento según comunidad autónoma</li>
<li><strong>Cuota a pagar final:</strong> Cantidad que deberás ingresar en Hacienda</li>
</ul>
<h3>Paso 7: Interpreta los resultados</h3>
<p>Lee atentamente el desglose del cálculo. Verás explicaciones detalladas de cada paso:</p>
<ul>
<li>Qué reducciones se han aplicado (estatal de 15.956,87 € para Grupo II, reducciones autonómicas adicionales, etc.)</li>
<li>Cómo se ha calculado la cuota tributaria (aplicando la tarifa progresiva estatal)</li>
<li>Qué bonificación se ha aplicado (por ejemplo, 99% en Madrid para descendientes directos)</li>
</ul>
<p>💡 <strong>Consejo:</strong> Si el resultado te parece muy alto, revisa si has seleccionado correctamente el grupo de parentesco y la comunidad autónoma. Un error en estos campos puede duplicar o triplicar el impuesto.</p>
<hr/>
<h2 id="ejemplos">Ejemplos prácticos</h2>
<h3>Ejemplo 1: Herencia de padre a hijo en Madrid (250.000 €)</h3>
<p><strong>Situación:</strong> Tu padre fallece en Madrid y te deja una herencia de 250.000 €. Eres hijo directo mayor de 21 años (Grupo II). Tu patrimonio preexistente es de 100.000 €.</p>
<p><strong>Datos de entrada:</strong></p>
<ul>
<li>Valor herencia: 250.000 €</li>
<li>Comunidad: Madrid</li>
<li>Parentesco: Grupo II (hijo mayor 21)</li>
<li>Patrimonio preexistente: 100.000 €</li>
</ul>
<p><strong>Proceso de cálculo:</strong></p>
<ol>
<li><strong>Reducción estatal Grupo II:</strong> 15.956,87 € → Base imponible = 234.043,13 €</li>
<li><strong>Cuota tributaria (tarifa progresiva):</strong> Aproximadamente 50.000 €</li>
<li><strong>Coeficiente multiplicador:</strong> 1,0 (patrimonio preexistente bajo)</li>
<li><strong>Cuota ajustada:</strong> 50.000 €</li>
<li><strong>Bonificación Madrid 99%:</strong> -49.500 €</li>
<li><strong>Cuota final a pagar:</strong> 500 €</li>
</ol>
<p><strong>Interpretación:</strong> Gracias a la bonificación del 99% de Madrid para descendientes directos, pagas solo 500 € en lugar de 50.000 €. Esta es una de las bonificaciones más generosas de España.</p>
<h3>Ejemplo 2: Herencia de tío a sobrino en Castilla-La Mancha (100.000 €)</h3>
<p><strong>Situación:</strong> Tu tío sin hijos te deja 100.000 € en Castilla-La Mancha. Eres sobrino (Grupo III). Tu patrimonio preexistente es de 50.000 €.</p>
<p><strong>Datos de entrada:</strong></p>
<ul>
<li>Valor herencia: 100.000 €</li>
<li>Comunidad: Castilla-La Mancha</li>
<li>Parentesco: Grupo III (sobrino)</li>
<li>Patrimonio preexistente: 50.000 €</li>
</ul>
<p><strong>Proceso de cálculo:</strong></p>
<ol>
<li><strong>Reducción estatal Grupo III:</strong> 7.993,46 € → Base imponible = 92.006,54 €</li>
<li><strong>Cuota tributaria:</strong> Aproximadamente 18.000 €</li>
<li><strong>Coeficiente multiplicador:</strong> 1,5882 (Grupo III + patrimonio medio)</li>
<li><strong>Cuota ajustada:</strong> 28.587 €</li>
<li><strong>Bonificación Castilla-La Mancha:</strong> Mínima o inexistente para Grupo III</li>
<li><strong>Cuota final a pagar:</strong> Aproximadamente 28.000 €</li>
</ol>
<p><strong>Interpretación:</strong> Como sobrino (Grupo III) en una comunidad sin bonificaciones significativas, pagas un 28% de la herencia en impuestos. Esto demuestra la importancia del parentesco en el cálculo.</p>
<h3>Ejemplo 3: Comparación entre Madrid y Asturias (200.000 €, Grupo II)</h3>
<p><strong>Situación:</strong> Quieres comparar cuánto pagarías por una herencia de 200.000 € como hijo directo en Madrid vs. Asturias.</p>
<p><strong>Datos de entrada:</strong></p>
<ul>
<li>Valor herencia: 200.000 €</li>
<li>Parentesco: Grupo II (hijo mayor 21)</li>
<li>Patrimonio preexistente: 80.000 €</li>
</ul>
<p><strong>Resultado en Madrid:</strong></p>
<ul>
<li>Cuota antes bonificación: 40.000 €</li>
<li>Bonificación 99%: -39.600 €</li>
<li><strong>Cuota final: 400 €</strong></li>
</ul>
<p><strong>Resultado en Asturias:</strong></p>
<ul>
<li>Cuota antes bonificación: 40.000 €</li>
<li>Bonificación variable (menor que Madrid)</li>
<li><strong>Cuota final: Aproximadamente 5.000-8.000 €</strong></li>
</ul>
<p><strong>Interpretación:</strong> La diferencia entre comunidades puede ser de miles de euros. Madrid tiene la bonificación más generosa (99%) para descendientes directos, mientras que otras comunidades como Asturias tienen bonificaciones menores.</p>
<hr/>
<h2 id="faqs">Preguntas frecuentes (FAQs)</h2>
<h3>❓ ¿Qué pasa si heredo en Cataluña, País Vasco o Navarra?</h3>
<p>Esta calculadora es exclusivamente para el <strong>régimen común nacional</strong>. Cataluña, País Vasco y Navarra tienen regímenes forales propios con normativa completamente diferente. Deberás usar una calculadora específica para esas comunidades o consultar con un asesor fiscal local.</p>
<h3>❓ ¿Cuánto tiempo tengo para pagar el impuesto de sucesiones?</h3>
<p>Tienes <strong>6 meses desde el fallecimiento</strong> para presentar la autoliquidación y pagar el impuesto. Puedes solicitar una prórroga de otros 6 meses si presentas la solicitud dentro de los primeros 5 meses. Pasado el plazo, Hacienda aplicará recargos e intereses de demora.</p>
<h3>❓ ¿Puedo fraccionar o aplazar el pago?</h3>
<p>Sí, puedes solicitar el fraccionamiento o aplazamiento del pago si no dispones de liquidez inmediata. Sin embargo, deberás aportar garantías (aval bancario, hipoteca) y pagar intereses de demora. La decisión final la toma la Agencia Tributaria.</p>
<h3>❓ ¿Los seguros de vida tributan en el impuesto de sucesiones?</h3>
<p>Depende de quién sea el beneficiario:</p>
<ul>
<li>Si el beneficiario es el <strong>cónyuge, descendientes o ascendientes directos</strong>, el seguro está exento hasta 9.195,49 € por beneficiario.</li>
<li>Si el beneficiario es otro familiar o extraño, tributa íntegramente como parte de la herencia.</li>
</ul>
<h3>❓ ¿Qué ocurre si renuncio a la herencia?</h3>
<p>Si renuncias formalmente a la herencia ante notario <strong>antes de aceptarla</strong>, no tendrás que pagar el impuesto de sucesiones. Sin embargo, ten en cuenta que la renuncia es total: no puedes aceptar solo una parte de la herencia. Si renuncias después de aceptar, Hacienda puede considerar que se trata de una donación a los demás herederos y exigir el pago del impuesto de donaciones.</p>
<h3>❓ ¿La vivienda habitual del fallecido tiene alguna bonificación?</h3>
<p>Sí, la vivienda habitual del fallecido tiene una <strong>reducción del 95% de su valor</strong> (hasta un máximo de 122.606,47 € por heredero) si se cumplen estos requisitos:</p>
<ul>
<li>El heredero es cónyuge, descendiente o ascendiente mayor de 65 años</li>
<li>El heredero mantiene la vivienda durante al menos 10 años</li>
</ul>
<hr/>
<h2 id="consejos">💡 Consejos y mejores prácticas</h2>
<h3>1. Valora correctamente los inmuebles desde el principio</h3>
<p>Usa el <strong>valor catastral</strong> multiplicado por el coeficiente que establezca tu comunidad autónoma. No subestimes el valor para evitar sanciones posteriores. Hacienda puede comprobar y ajustar valores bajos.</p>
<h3>2. Aprovecha las bonificaciones autonómicas si eres Grupo I o II</h3>
<p>Madrid, Andalucía, Galicia y otras comunidades tienen bonificaciones del 99% para descendientes directos. Si puedes elegir dónde residir fiscalmente, esto puede ahorrarte decenas de miles de euros.</p>
<h3>3. Considera fraccionar el pago si no tienes liquidez inmediata</h3>
<p>Si heredas una vivienda pero no tienes efectivo para pagar el impuesto, solicita el aplazamiento o fraccionamiento. Los intereses de demora de Hacienda suelen ser más bajos que los de un préstamo bancario.</p>
<h3>4. Consulta con un asesor fiscal si la herencia incluye empresas</h3>
<p>Las empresas familiares pueden tener reducciones del 95% si se cumplen ciertos requisitos (mantener la actividad, continuar trabajando en ella, etc.). Esta calculadora no contempla estas reducciones especiales, así que consulta con un profesional.</p>
<h3>5. No confundas régimen común con regímenes forales</h3>
<p>Si heredas en Cataluña, País Vasco o Navarra, NO uses esta calculadora. Los regímenes forales tienen normativa propia completamente diferente y los resultados serían incorrectos.</p>
<hr/>

<div style={{marginTop: "3rem", paddingTop: "2rem", borderTop: "2px solid var(--border)", textAlign: "center"}}>
<a href="../index.html" style={{display: "inline-block", background: "var(--primary)", color: "white", padding: "0.75rem 2rem", borderRadius: "8px", textDecoration: "none", fontWeight: "600", transition: "all 0.3s ease", boxShadow: "0 2px 8px rgba(46, 134, 171, 0.2)"}}>
                ← Volver al índice de guías
            </a>

<div className="cta-box">
<h3>💰 Calcula tu Impuesto de Sucesiones ahora</h3>
<p>Herramienta 100% gratuita para régimen común de España (14 CCAA)</p>
<a className="cta-button" href="https://meskeia.com/impuesto-sucesiones-nacional/">Ir a la Calculadora →</a>
</div>
</div>
        </article>
      </div>

      <Footer appName="meskeIA" />
    </>
  );
}
