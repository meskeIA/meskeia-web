'use client';

import Link from 'next/link';
import FixedHeader from '@/components/FixedHeader';
import Footer from '@/components/Footer';
import InfoBox from '@/components/legal/InfoBox';
import styles from '../privacidad/page.module.css'; // Reutilizamos los estilos

export default function TerminosPage() {
  return (
    <>
      <FixedHeader />

      <main className={styles.container}>
        <article className={styles.legalDocument}>
          <div className={styles.documentHeader}>
            <h1 className={styles.documentTitle}>Términos de Uso y Condiciones</h1>
            <p className={styles.lastUpdated}>Última actualización: 20 de noviembre de 2025</p>
          </div>

          <InfoBox type="warning" title="IMPORTANTE - LEA ANTES DE USAR" icon="⚠️">
            <p><strong>Al utilizar cualquiera de las herramientas de meskeIA, usted acepta estos términos en su totalidad.</strong> Si no está de acuerdo con alguna parte de estos términos, no utilice nuestros servicios.</p>
          </InfoBox>

          <h2>1. Aceptación de los Términos</h2>
          <p>Al acceder y utilizar las utilidades web de <strong>meskeIA</strong>, usted acepta cumplir con estos Términos de Uso y todas las leyes y regulaciones aplicables. Estos términos constituyen un acuerdo legal vinculante entre usted y meskeIA.</p>

          <h2>2. Descripción del Servicio</h2>
          <p>meskeIA proporciona una <strong>biblioteca gratuita de utilidades web</strong> que incluye, pero no se limita a:</p>
          <ul>
            <li>Generadores de contraseñas</li>
            <li>Calculadoras financieras y de préstamos</li>
            <li>Herramientas de productividad y temporizadores</li>
            <li>Generadores de paletas de colores</li>
            <li>Información meteorológica</li>
            <li><strong>Calculadoras relacionadas con la salud (únicamente informativas)</strong></li>
          </ul>

          <InfoBox type="info" title="RECOPILACIÓN DE ESTADÍSTICAS" icon="📊">
            <p><strong>Para mejorar nuestro servicio, utilizamos Google Analytics que recopila información básica de uso:</strong></p>
            <ul>
              <li>Páginas visitadas y tiempo en el sitio</li>
              <li>País de origen (datos agregados)</li>
              <li>Tipo de dispositivo utilizado</li>
              <li>Flujo de navegación entre páginas</li>
            </ul>
            <p><strong>IMPORTANTE:</strong> Esta recopilación estadística NO incluye los datos que introduce en las calculadoras. Sus cálculos, contraseñas, información financiera y de salud permanecen completamente privados.</p>
          </InfoBox>

          <InfoBox type="medical" title="SECCIÓN ESPECIAL: CALCULADORA DE SALUD" icon="⚕️">
            <h3>2.1 Naturaleza de la Herramienta de Salud</h3>
            <p><strong>La calculadora de salud de meskeIA es ÚNICAMENTE una herramienta informativa y educativa.</strong> NO es un dispositivo médico, NO realiza diagnósticos, y NO sustituye en ningún caso la consulta médica profesional.</p>

            <h4>Limitaciones Específicas:</h4>
            <ul>
              <li><strong>Solo estimaciones:</strong> Todos los cálculos se basan en fórmulas poblacionales que proporcionan estimaciones generales</li>
              <li><strong>Variabilidad individual:</strong> Los resultados pueden diferir significativamente de análisis médicos profesionales</li>
              <li><strong>No diagnóstica:</strong> La herramienta NO diagnostica enfermedades ni condiciones médicas</li>
              <li><strong>Solo informativa:</strong> Los resultados son únicamente para fines educativos y de concientización</li>
            </ul>
          </InfoBox>

          <h2>3. Descargo de Responsabilidad General</h2>

          <InfoBox type="warning" title="LIMITACIÓN TOTAL DE RESPONSABILIDAD" icon="🚨">
            <p><strong>LAS HERRAMIENTAS SE PROPORCIONAN "TAL COMO ESTÁN" Y "SEGÚN DISPONIBILIDAD".</strong> meskeIA no asume ninguna responsabilidad por:</p>
            <ul>
              <li>La precisión, completitud o fiabilidad de los resultados</li>
              <li>Decisiones tomadas basándose en los resultados de las herramientas</li>
              <li>Pérdidas económicas, daños directos, indirectos o consecuenciales</li>
              <li>Interrupciones del servicio o errores técnicos</li>
              <li><strong>Consecuencias de decisiones de salud basadas en estimaciones de la calculadora</strong></li>
            </ul>
          </InfoBox>

          <h3>3.1 Calculadoras Financieras</h3>
          <p>Los resultados de las <strong>calculadoras de préstamos, hipotecas y financieras</strong> son aproximaciones para fines informativos únicamente. <strong>NO constituyen asesoramiento financiero profesional</strong>. Para decisiones financieras importantes, consulte siempre con un asesor financiero cualificado.</p>

          <h3>3.2 Herramientas Relacionadas con la Salud</h3>

          <InfoBox type="medical" title="AVISO MÉDICO IMPORTANTE" icon="🏥">
            <p><strong>Las calculadoras de salud NO sustituyen el consejo médico profesional.</strong> Los resultados son únicamente informativos y educativos. <strong>SIEMPRE consulte con su médico</strong> antes de tomar decisiones relacionadas con su salud, dieta, ejercicio o tratamiento médico.</p>

            <p><strong>EMERGENCIAS MÉDICAS:</strong> En caso de síntomas graves o emergencias médicas, contacte inmediatamente con servicios de emergencia (112 en España) o acuda al centro médico más cercano. NO use esta calculadora en situaciones de emergencia.</p>
          </InfoBox>

          <h2>4. Uso Aceptable</h2>
          <p>Usted se compromete a utilizar las herramientas únicamente para:</p>
          <ul>
            <li><strong>Fines legales y legítimos</strong></li>
            <li><strong>Uso personal o educativo</strong></li>
            <li><strong>Respetando los derechos de terceros</strong></li>
          </ul>

          <h3>4.1 Usos Prohibidos</h3>
          <p>Está expresamente prohibido:</p>
          <ol>
            <li>Usar las herramientas para actividades ilegales</li>
            <li>Intentar comprometer la seguridad del sitio</li>
            <li>Reproducir, distribuir o modificar el código sin autorización</li>
            <li>Usar las herramientas para spam o actividades maliciosas</li>
            <li>Sobrecargar intencionalmente los servidores</li>
            <li><strong>Usar la calculadora de salud para proporcionar consejos médicos a terceros</strong></li>
            <li><strong>Presentar los resultados como diagnósticos médicos profesionales</strong></li>
          </ol>

          <h2>5. Privacidad y Datos</h2>

          <InfoBox type="info" title="COMPROMISO DE PRIVACIDAD" icon="🔒">
            <p>Las herramientas funcionan <strong>completamente en su navegador</strong> para datos sensibles. Utilizamos Google Analytics únicamente para estadísticas básicas de uso del sitio web. Para más información, consulte nuestra <Link href="/privacidad" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Política de Privacidad</Link>.</p>

            <p><strong>DATOS DE SALUD:</strong> La información de salud que introduce en nuestra calculadora es especialmente sensible. Por esta razón, garantizamos que:</p>
            <ul>
              <li>Todos los cálculos se procesan localmente en su dispositivo</li>
              <li>No enviamos datos de salud a ningún servidor externo</li>
              <li>Google Analytics no puede acceder a esta información</li>
              <li>Los resultados solo se almacenan temporalmente en su navegador</li>
            </ul>
          </InfoBox>

          <h2>6. Limitación de Responsabilidad y Precisión de Herramientas</h2>

          <h3>6.1 Precisión de las Herramientas</h3>
          <p>Las aplicaciones de meskeIA son <strong>herramientas educativas y orientativas</strong> diseñadas para facilitar cálculos y tareas cotidianas. Aunque nos esforzamos por mantener la precisión de nuestros cálculos y algoritmos, <strong>no garantizamos que los resultados sean 100% exactos</strong> ni libres de errores.</p>

          <h3>6.2 Uso de los Resultados</h3>
          <p>Los resultados generados por nuestras aplicaciones deben considerarse <strong>estimaciones aproximadas</strong> y no deben sustituir:</p>
          <ul>
            <li>Asesoramiento profesional (legal, fiscal, médico, financiero)</li>
            <li>Cálculos oficiales de organismos públicos o entidades reguladoras</li>
            <li>Consultas con expertos certificados en cada materia</li>
            <li>Verificación independiente para decisiones críticas</li>
          </ul>

          <InfoBox type="warning" title="ESPECIALMENTE IMPORTANTE PARA" icon="⚠️">
            <ul>
              <li>💰 <strong>Calculadoras fiscales:</strong> IRPF, impuesto de sucesiones, impuesto de donaciones</li>
              <li>🏥 <strong>Calculadoras de salud:</strong> IMC, calorías, hidratación, evaluador de salud</li>
              <li>📊 <strong>Simuladores financieros:</strong> Hipotecas, inversiones, TIR-VAN, jubilación</li>
              <li>📐 <strong>Cálculos técnicos:</strong> Matemáticas avanzadas, física, química</li>
            </ul>
          </InfoBox>

          <h3>6.3 Responsabilidad del Usuario</h3>
          <p>Al utilizar meskeIA, usted acepta que:</p>
          <ol>
            <li><strong>Verificará información crítica</strong> con fuentes oficiales o profesionales cualificados antes de tomar decisiones importantes</li>
            <li><strong>Asume el riesgo</strong> de decisiones basadas en los resultados obtenidos de nuestras herramientas</li>
            <li><strong>meskeIA no es responsable</strong> de pérdidas económicas, daños a la salud, consecuencias legales o cualquier otro perjuicio derivado del uso de estas aplicaciones</li>
            <li><strong>Entiende que los resultados son orientativos</strong> y pueden diferir de cálculos profesionales o certificados</li>
          </ol>

          <h3>6.4 Recomendación de Uso</h3>
          <p>Use nuestras aplicaciones como <strong>punto de partida</strong> para:</p>
          <ul>
            <li>✅ Entender conceptos básicos y familiarizarse con cálculos</li>
            <li>✅ Hacer estimaciones rápidas y planificación inicial</li>
            <li>✅ Explorar escenarios hipotéticos y simulaciones educativas</li>
            <li>✅ Aprender sobre diferentes áreas (finanzas, salud, matemáticas, etc.)</li>
          </ul>

          <p>Para decisiones finales e importantes, <strong>siempre consulte con un profesional cualificado</strong> en la materia correspondiente.</p>

          <h3>6.5 Limitación Legal de Responsabilidad</h3>
          <p><strong>EN NINGÚN CASO meskeIA SERÁ RESPONSABLE DE DAÑOS DIRECTOS, INDIRECTOS, INCIDENTALES, ESPECIALES O CONSECUENCIALES</strong> que resulten del uso o la imposibilidad de usar las herramientas, incluso si se ha advertido de la posibilidad de tales daños.</p>

          <p>La responsabilidad total de meskeIA, si la hubiera, no excederá en ningún caso el importe de <strong>cero euros (0€)</strong>, dado que el servicio es completamente gratuito.</p>

          <h2>7. Modificaciones del Servicio</h2>
          <p>meskeIA se reserva el derecho de:</p>
          <ul>
            <li>Modificar, suspender o discontinuar cualquier herramienta</li>
            <li>Actualizar estos términos en cualquier momento</li>
            <li>Cambiar la funcionalidad de las utilidades</li>
            <li>Actualizar configuraciones de Google Analytics</li>
            <li><strong>Actualizar algoritmos de cálculo médico según nuevos estándares científicos</strong></li>
          </ul>

          <h2>8. Contacto</h2>

          <div className={styles.contactInfo}>
            <p><strong>Para consultas sobre estos términos:</strong></p>
            <p>📧 Email: <strong>meskeia24@gmail.com</strong></p>
            <p>🌐 Web: <strong>meskeIA</strong></p>
            <p><em>Responderemos a la mayor brevedad posible</em></p>
          </div>

          <InfoBox type="info" title="RECONOCIMIENTO" icon="✅">
            <p><strong>Al utilizar nuestras herramientas, usted reconoce que ha leído, entendido y acepta quedar vinculado por estos Términos de Uso.</strong></p>

            <p><strong>RECONOCIMIENTO ESPECÍFICO PARA SALUD:</strong> Al usar la calculadora de salud, usted reconoce específicamente que:</p>
            <ul>
              <li>Entiende que es solo una herramienta informativa</li>
              <li>No la usará para diagnósticos médicos</li>
              <li>Consultará con profesionales de salud para decisiones médicas</li>
              <li>No responsabilizará a meskeIA por consecuencias de decisiones de salud</li>
            </ul>
          </InfoBox>

          <InfoBox type="warning" title="AVISO FINAL IMPORTANTE" icon="🚨">
            <p><strong>Si tiene dudas sobre su salud, consulte inmediatamente con un profesional médico cualificado. Ninguna herramienta online puede sustituir el juicio clínico profesional.</strong></p>
          </InfoBox>
        </article>
      </main>

      <Footer appName="meskeIA" />
    </>
  );
}
