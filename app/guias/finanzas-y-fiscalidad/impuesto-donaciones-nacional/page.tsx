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
          <h1>Guía Completa: Impuesto de Donaciones Nacional 2025</h1>
<blockquote>
<p>Aprende a calcular el impuesto de donaciones en España bajo régimen común. Guía práctica con ejemplos para 14 comunidades autónomas.</p>
</blockquote>
<h2>📋 Tabla de Contenidos</h2>
<ol>
<li><a href="#que-es">¿Qué es el Impuesto de Donaciones Nacional?</a></li>
<li><a href="#para-que-sirve">¿Para qué sirve?</a></li>
<li><a href="#como-usar">Cómo usar la calculadora paso a paso</a></li>
<li><a href="#ejemplos">Ejemplos prácticos</a></li>
<li><a href="#faqs">Preguntas frecuentes</a></li>
<li><a href="#consejos">Consejos y mejores prácticas</a></li>
</ol>
<hr/>
<h2 id="que-es">💰 ¿Qué es el Impuesto de Donaciones Nacional?</h2>
<p>El <strong>Impuesto sobre Sucesiones y Donaciones (ISD)</strong> grava las transmisiones gratuitas de bienes entre personas vivas. Cuando recibes dinero, inmuebles, acciones u otros bienes como regalo o donación de familiares o terceros, debes pagar este impuesto en España.</p>
<p><strong>Diferencia con el impuesto de sucesiones:</strong></p>
<ul>
<li><strong>Impuesto de sucesiones:</strong> Se paga al recibir herencia tras fallecimiento</li>
<li><strong>Impuesto de donaciones:</strong> Se paga al recibir regalos/donaciones en vida</li>
</ul>
<p><strong>Régimen común vs. regímenes forales:</strong></p>
<ul>
<li><strong>Régimen común:</strong> Aplicable en 14 comunidades autónomas (todas excepto Cataluña, País Vasco y Navarra)</li>
<li><strong>Regímenes forales:</strong> Cataluña, País Vasco y Navarra tienen normativa propia completamente diferente</li>
</ul>
<p>Esta calculadora está diseñada específicamente para el <strong>régimen común nacional</strong>, que incluye las mismas 14 comunidades autónomas que el impuesto de sucesiones.</p>
<p><strong>Características principales de la calculadora:</strong></p>
<ul>
<li>📊 Cálculo automático según normativa estatal de 2025</li>
<li>👨‍��‍👧‍👦 Diferenciación por grupos de parentesco (I, II, III, IV)</li>
<li>💶 Aplicación de reducciones estatales y bonificaciones autonómicas</li>
<li>🧮 Cálculo de cuota tributaria con tarifa progresiva</li>
<li>📱 Compatible con móvil, tablet y ordenador</li>
<li>🆓 Completamente gratuito sin registro</li>
</ul>
<hr/>
<h2 id="para-que-sirve">¿Para qué sirve esta calculadora?</h2>
<h3>Casos de uso principales:</h3>
<h4>1. Calcular el coste fiscal antes de recibir una donación de padres a hijos</h4>
<p>Una de las donaciones más comunes en España es de padres a hijos para ayudarles a comprar su primera vivienda. Antes de hacer la transferencia bancaria, es crucial calcular cuánto deberá pagar el hijo en impuestos, porque puede variar drásticamente según la comunidad autónoma.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Tus padres quieren donarte 50.000 € para la entrada del piso. Vives en Madrid. Introduces los datos en la calculadora y descubres que gracias a la bonificación del 99% de Madrid para descendientes directos, solo pagarás unos 100 €. Si vivieras en Castilla-La Mancha sin bonificaciones significativas, podrías pagar más de 5.000 €.</p>
</blockquote>
<h4>2. Comparar el coste fiscal entre diferentes comunidades autónomas antes de hacer la donación</h4>
<p>El impuesto de donaciones varía enormemente entre comunidades. Madrid, Andalucía, Galicia y Cantabria tienen bonificaciones del 99% para descendientes directos, mientras que otras comunidades apenas bonifican. Si tienes flexibilidad de residencia, esto puede ahorrarte miles de euros.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Tus abuelos quieren donarte 100.000 €. Vives en Asturias pero estás planteándote mudarte a Madrid por trabajo. Comparas ambas comunidades en la calculadora: En Madrid pagarías 200 €, mientras que en Asturias podrías pagar 20.000 €. La diferencia es de 19.800 €, lo que justifica planificar la mudanza antes de formalizar la donación.</p>
</blockquote>
<h4>3. Planificar donaciones en vida para minimizar el impuesto de sucesiones futuro</h4>
<p>En muchas comunidades, donar en vida es fiscalmente más ventajoso que dejar herencia tras el fallecimiento, especialmente si se aprovechan bonificaciones autonómicas. Puedes simular diferentes escenarios de donaciones parciales a lo largo de varios años para minimizar la carga fiscal total.</p>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Tienes 60 años y un patrimonio de 500.000 €. Quieres dejar el mínimo impuesto posible a tus dos hijos. Simulas donarles 50.000 € anuales durante 5 años en Madrid. Con la bonificación del 99%, cada donación cuesta solo 100 € en impuestos. Si esperaras a fallecer y dejarles herencia, el impuesto podría ser mucho mayor dependiendo de cambios legislativos futuros.</p>
</blockquote>
<h4>4. Entender el impacto del parentesco en el impuesto</h4>
<p>Al igual que en sucesiones, el parentesco es determinante. Donar a un hijo cuesta mucho menos que donar a un sobrino, primo o amigo.</p>
<p><strong>Grupos de parentesco:</strong></p>
<ul>
<li><strong>Grupo I (hijos menores de 21 años):</strong> Máximas reducciones</li>
<li><strong>Grupo II (hijos mayores de 21, cónyuge, padres):</strong> Reducciones medias</li>
<li><strong>Grupo III (hermanos, tíos, sobrinos):</strong> Reducciones bajas</li>
<li><strong>Grupo IV (primos, amigos, extraños):</strong> Sin reducciones</li>
</ul>
<p><strong>Ejemplo práctico:</strong></p>
<blockquote>
<p>Quieres donar 80.000 € a tu sobrino (Grupo III) para que monte un negocio. Introduces los datos y descubres que pagará aproximadamente 16.000 € en impuestos en una comunidad sin bonificaciones. Si en lugar de donárselo directamente se lo donas primero a su padre (tu hermano, Grupo III) y luego él a su hijo (Grupo II), el impuesto total podría ser menor gracias a las bonificaciones para descendientes directos.</p>
</blockquote>
<hr/>
<h2 id="como-usar">Cómo usar la calculadora paso a paso</h2>
<h3>Paso 1: Accede a la calculadora</h3>
<p>Abre tu navegador y dirígete a <strong>https://meskeia.com/impuesto-donaciones-nacional/</strong>. La calculadora cargará automáticamente. No necesitas registrarte ni descargar nada.</p>
<h3>Paso 2: Introduce el valor de la donación</h3>
<p>En el campo <strong>"Valor de la donación (€)"</strong>, escribe la cantidad total que vas a donar o recibir. Esto incluye:</p>
<ul>
<li>Dinero en efectivo o transferencias bancarias</li>
<li>Valor de mercado de inmuebles (viviendas, locales, terrenos)</li>
<li>Valor de acciones, fondos de inversión o bonos</li>
<li>Valor de vehículos, joyas u otros bienes</li>
</ul>
<p>💡 <strong>Consejo:</strong> Para inmuebles, usa el <strong>valor de mercado</strong> (precio de compraventa real), no el valor catastral. Hacienda puede comprobar valores y ajustarlos si considera que están infravalorados, con las correspondientes sanciones.</p>
<h3>Paso 3: Selecciona la comunidad autónoma del donatario (quien recibe)</h3>
<p>En el desplegable <strong>"Comunidad Autónoma"</strong>, selecciona la comunidad donde reside habitualmente el <strong>donatario</strong> (la persona que recibe la donación).</p>
<p>⚠️ <strong>Importante:</strong> A diferencia del impuesto de sucesiones, en donaciones importa dónde vive quien <strong>recibe</strong>, no quien dona. Si el donante vive en Madrid pero el donatario en Asturias, se aplica la normativa de Asturias.</p>
<h3>Paso 4: Indica el grado de parentesco entre donante y donatario</h3>
<p>Selecciona uno de los cuatro grupos de parentesco:</p>
<ul>
<li><strong>Grupo I:</strong> Descendientes menores de 21 años (hijos, nietos)</li>
<li><strong>Grupo II:</strong> Descendientes mayores de 21, cónyuge, ascendientes (hijos adultos, esposo/a, padres)</li>
<li><strong>Grupo III:</strong> Colaterales de 2º y 3º grado (hermanos, tíos, sobrinos)</li>
<li><strong>Grupo IV:</strong> Colaterales de 4º grado y extraños (primos, amigos, conocidos)</li>
</ul>
<p>💡 <strong>Consejo:</strong> Si el donatario es tu hijo de 20 años, usa Grupo I (menores de 21). Si tiene 22 años, usa Grupo II. La diferencia puede ser significativa en las reducciones aplicables.</p>
<h3>Paso 5: Introduce el patrimonio preexistente del donatario</h3>
<p>El campo <strong>"Patrimonio preexistente (€)"</strong> se refiere al patrimonio que ya tiene el donatario <strong>antes</strong> de recibir la donación. Esto incluye:</p>
<ul>
<li>Valor de su vivienda habitual (si es propietario)</li>
<li>Cuentas bancarias y depósitos</li>
<li>Inversiones (acciones, fondos, planes de pensiones)</li>
<li>Otros inmuebles o bienes de valor</li>
</ul>
<p>💡 <strong>Consejo:</strong> Si el donatario es joven y no tiene patrimonio significativo, puedes dejarlo en 0 €. Si es una persona adulta con vivienda propia y ahorros, declara el patrimonio real, porque afecta al coeficiente multiplicador.</p>
<h3>Paso 6: Haz clic en "Calcular Impuesto"</h3>
<p>La calculadora procesará los datos instantáneamente y mostrará:</p>
<ul>
<li><strong>Base imponible:</strong> Donación menos reducciones estatales y autonómicas</li>
<li><strong>Cuota tributaria:</strong> Impuesto bruto según tarifa progresiva</li>
<li><strong>Coeficiente multiplicador:</strong> Ajuste según patrimonio preexistente y parentesco</li>
<li><strong>Bonificaciones aplicadas:</strong> Porcentaje de descuento según comunidad autónoma</li>
<li><strong>Cuota a pagar final:</strong> Cantidad que deberá ingresar el donatario en Hacienda</li>
</ul>
<h3>Paso 7: Interpreta los resultados</h3>
<p>Lee atentamente el desglose del cálculo. Verás explicaciones detalladas de cada paso:</p>
<ul>
<li>Qué reducciones se han aplicado (estatal de 15.956,87 € para Grupo II, reducciones autonómicas adicionales, etc.)</li>
<li>Cómo se ha calculado la cuota tributaria (aplicando la tarifa progresiva estatal)</li>
<li>Qué bonificación se ha aplicado (por ejemplo, 99% en Madrid para descendientes directos)</li>
</ul>
<p>⚠️ <strong>Importante:</strong> La presentación del impuesto debe hacerse en un plazo de <strong>30 días hábiles</strong> desde la fecha de la donación. No confundir con los 6 meses del impuesto de sucesiones.</p>
<hr/>
<h2 id="ejemplos">Ejemplos prácticos</h2>
<h3>Ejemplo 1: Donación de padres a hijo para comprar vivienda en Madrid (60.000 €)</h3>
<p><strong>Situación:</strong> Tus padres te donan 60.000 € para la entrada de tu primera vivienda. Vives en Madrid, tienes 28 años (Grupo II) y tu patrimonio preexistente es de 10.000 € en ahorros.</p>
<p><strong>Datos de entrada:</strong></p>
<ul>
<li>Valor donación: 60.000 €</li>
<li>Comunidad: Madrid</li>
<li>Parentesco: Grupo II (hijo mayor 21)</li>
<li>Patrimonio preexistente: 10.000 €</li>
</ul>
<p><strong>Proceso de cálculo:</strong></p>
<ol>
<li><strong>Reducción estatal Grupo II:</strong> 15.956,87 € → Base imponible = 44.043,13 €</li>
<li><strong>Cuota tributaria (tarifa progresiva):</strong> Aproximadamente 6.500 €</li>
<li><strong>Coeficiente multiplicador:</strong> 1,0 (patrimonio preexistente bajo)</li>
<li><strong>Cuota ajustada:</strong> 6.500 €</li>
<li><strong>Bonificación Madrid 99%:</strong> -6.435 €</li>
<li><strong>Cuota final a pagar:</strong> 65 €</li>
</ol>
<p><strong>Interpretación:</strong> Gracias a la bonificación del 99% de Madrid para descendientes directos, pagas solo 65 € por recibir 60.000 €. Esta es una de las bonificaciones más generosas de España para donaciones entre padres e hijos.</p>
<h3>Ejemplo 2: Donación entre hermanos en Castilla-La Mancha (40.000 €)</h3>
<p><strong>Situación:</strong> Tu hermano te dona 40.000 € para ayudarte a salir de deudas. Ambos vivís en Castilla-La Mancha. Eres Grupo III (hermano) y tu patrimonio preexistente es de 30.000 €.</p>
<p><strong>Datos de entrada:</strong></p>
<ul>
<li>Valor donación: 40.000 €</li>
<li>Comunidad: Castilla-La Mancha</li>
<li>Parentesco: Grupo III (hermano)</li>
<li>Patrimonio preexistente: 30.000 €</li>
</ul>
<p><strong>Proceso de cálculo:</strong></p>
<ol>
<li><strong>Reducción estatal Grupo III:</strong> 7.993,46 € → Base imponible = 32.006,54 €</li>
<li><strong>Cuota tributaria:</strong> Aproximadamente 5.000 €</li>
<li><strong>Coeficiente multiplicador:</strong> 1,5882 (Grupo III + patrimonio medio)</li>
<li><strong>Cuota ajustada:</strong> 7.941 €</li>
<li><strong>Bonificación Castilla-La Mancha:</strong> Mínima o inexistente para Grupo III</li>
<li><strong>Cuota final a pagar:</strong> Aproximadamente 7.900 €</li>
</ol>
<p><strong>Interpretación:</strong> Como hermano (Grupo III) en una comunidad sin bonificaciones significativas, pagas casi el 20% de la donación en impuestos. Esto demuestra la importancia del parentesco y la comunidad autónoma en el cálculo.</p>
<h3>Ejemplo 3: Donación de abuelos a nieto en Andalucía (100.000 €)</h3>
<p><strong>Situación:</strong> Tus abuelos te donan 100.000 € en vida para evitar problemas de herencia futuros. Vives en Andalucía, tienes 30 años (Grupo II, porque eres descendiente directo) y tu patrimonio preexistente es de 50.000 €.</p>
<p><strong>Datos de entrada:</strong></p>
<ul>
<li>Valor donación: 100.000 €</li>
<li>Comunidad: Andalucía</li>
<li>Parentesco: Grupo II (nieto = descendiente directo)</li>
<li>Patrimonio preexistente: 50.000 €</li>
</ul>
<p><strong>Proceso de cálculo:</strong></p>
<ol>
<li><strong>Reducción estatal Grupo II:</strong> 15.956,87 € → Base imponible = 84.043,13 €</li>
<li><strong>Cuota tributaria:</strong> Aproximadamente 16.000 €</li>
<li><strong>Coeficiente multiplicador:</strong> 1,1 (patrimonio medio)</li>
<li><strong>Cuota ajustada:</strong> 17.600 €</li>
<li><strong>Bonificación Andalucía 99%:</strong> -17.424 €</li>
<li><strong>Cuota final a pagar:</strong> 176 €</li>
</ol>
<p><strong>Interpretación:</strong> Andalucía también tiene bonificación del 99% para descendientes directos (incluye nietos). Pagas solo 176 € por recibir 100.000 €, lo que convierte esta operación en fiscalmente muy eficiente.</p>
<hr/>
<h2 id="faqs">Preguntas frecuentes (FAQs)</h2>
<h3>❓ ¿Quién paga el impuesto de donaciones, el donante o el donatario?</h3>
<p>El impuesto lo paga el <strong>donatario</strong> (quien recibe la donación), no el donante. Sin embargo, es común que el donante asuma el pago del impuesto como parte del acuerdo. Si el donante paga el impuesto, Hacienda puede considerar que esa cantidad también es una donación adicional y exigir impuestos sobre ella.</p>
<h3>❓ ¿Cuánto tiempo tengo para pagar el impuesto de donaciones?</h3>
<p>Tienes <strong>30 días hábiles</strong> desde la fecha de la donación para presentar la autoliquidación y pagar el impuesto. Este plazo es mucho más corto que el del impuesto de sucesiones (6 meses). Pasado el plazo, Hacienda aplicará recargos e intereses de demora.</p>
<h3>❓ ¿Puedo hacer donaciones en metálico sin declarar?</h3>
<p>No. Toda donación de dinero superior a 3.000 € debe hacerse mediante transferencia bancaria y declararse. Las donaciones en efectivo superiores a esta cantidad son ilegales por la Ley Antifraude. Además, Hacienda tiene acceso a movimientos bancarios y puede descubrir donaciones no declaradas, aplicando sanciones del 50% al 150% del impuesto debido.</p>
<h3>❓ ¿Las donaciones para comprar vivienda habitual tienen alguna bonificación especial?</h3>
<p>Depende de la comunidad autónoma. Algunas comunidades como Madrid, Andalucía o Galicia tienen bonificaciones del 99% para donaciones de padres a hijos <strong>sin importar el destino del dinero</strong>. Otras comunidades como Castilla y León o Cantabria tienen bonificaciones adicionales específicas si el dinero se usa para comprar la primera vivienda habitual del donatario menor de 36 años.</p>
<h3>❓ ¿Qué pasa si heredo en Cataluña, País Vasco o Navarra?</h3>
<p>Esta calculadora es exclusivamente para el <strong>régimen común nacional</strong>. Cataluña, País Vasco y Navarra tienen regímenes forales propios con normativa completamente diferente. Deberás usar una calculadora específica para esas comunidades o consultar con un asesor fiscal local.</p>
<h3>❓ ¿Puedo donar un inmueble directamente o es mejor venderlo y donar el dinero?</h3>
<p>Puedes donar inmuebles directamente, pero ten en cuenta que:</p>
<ul>
<li>El donante puede tener que pagar <strong>plusvalía municipal</strong> si el inmueble ha aumentado de valor</li>
<li>El donante puede tener que pagar <strong>IRPF por ganancia patrimonial</strong> si el valor de transmisión supera el valor de adquisición original</li>
<li>El donatario pagará el <strong>impuesto de donaciones</strong> sobre el valor de mercado del inmueble</li>
</ul>
<p>En muchos casos, es más eficiente fiscalmente vender el inmueble primero (tributando solo una vez) y luego donar el dinero resultante.</p>
<hr/>
<h2 id="consejos">💡 Consejos y mejores prácticas</h2>
<h3>1. Aprovecha las bonificaciones autonómicas si eres Grupo I o II</h3>
<p>Si planeas hacer una donación importante a hijos o nietos, considera hacerlo en comunidades con bonificación del 99% como Madrid, Andalucía, Galicia o Cantabria. La diferencia puede ser de decenas de miles de euros.</p>
<h3>2. Fracciona donaciones grandes en varios años si no hay bonificaciones</h3>
<p>Si vives en una comunidad sin bonificaciones significativas, puedes reducir el impuesto total fraccionando la donación en varios años. Por ejemplo, donar 100.000 € en un solo año puede tener una tarifa progresiva del 20%, mientras que donar 25.000 € durante 4 años consecutivos puede tener una tarifa media del 10%.</p>
<h3>3. Documenta siempre las donaciones con transferencia bancaria</h3>
<p>NUNCA hagas donaciones en efectivo superiores a 3.000 €. Usa siempre transferencia bancaria con concepto claro ("Donación padres a hijo para vivienda"). Esto evita problemas con Hacienda y facilita la autoliquidación del impuesto.</p>
<h3>4. Considera el coste total: donaciones vs. herencia futura</h3>
<p>Simula ambas opciones en la calculadora. En algunas comunidades puede ser más barato donar en vida (aprovechando bonificaciones actuales) que dejar herencia (que puede tributar más si cambia la legislación). En otras comunidades, puede ser más eficiente esperar a la herencia si el donatario tiene patrimonio preexistente alto.</p>
<h3>5. Consulta con un asesor fiscal si la donación incluye empresas o negocios</h3>
<p>Las donaciones de empresas familiares pueden tener reducciones del 95% si se cumplen ciertos requisitos (mantener la actividad, continuar trabajando en ella, etc.). Esta calculadora no contempla estas reducciones especiales, así que consulta con un profesional antes de donar participaciones empresariales.</p>
<hr/>

<div style={{marginTop: "3rem", paddingTop: "2rem", borderTop: "2px solid var(--border)", textAlign: "center"}}>
<a href="../index.html" style={{display: "inline-block", background: "var(--primary)", color: "white", padding: "0.75rem 2rem", borderRadius: "8px", textDecoration: "none", fontWeight: "600", transition: "all 0.3s ease", boxShadow: "0 2px 8px rgba(46, 134, 171, 0.2)"}}>
                ← Volver al índice de guías
            </a>

<div className="cta-box">
<h3>💰 Calcula tu Impuesto de Donaciones ahora</h3>
<p>Herramienta 100% gratuita para régimen común de España (14 CCAA)</p>
<a className="cta-button" href="https://meskeia.com/impuesto-donaciones-nacional/">Ir a la Calculadora →</a>
</div>
</div>
        </article>
      </div>

      <Footer appName="meskeIA" />
    </>
  );
}
