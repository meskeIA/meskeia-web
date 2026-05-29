'use client';
// @disclaimer: exempt

import { LegalNotice } from '@/components';
import Link from 'next/link';
import FixedHeader from '@/components/FixedHeader';
import Footer from '@/components/Footer';
import InfoBox from '@/components/legal/InfoBox';
import styles from '../../privacidad/page.module.css';

export default function TerminosMCPPage() {
  return (
    <>
      <FixedHeader />

      <main className={styles.container}>
        <article className={styles.legalDocument}>

          <div className={styles.documentHeader}>
            <h1 className={styles.documentTitle}>Términos de Uso del Servidor MCP</h1>
            <p className={styles.lastUpdated}>Versión 1.0 — 19 de mayo de 2026</p>
          </div>

          <InfoBox type="warning" title="AVISO PARA INTEGRADORES" icon="⚠️">
            <p>
              <strong>Al integrar el servidor MCP de meskeIA en su aplicación, agente o bot, usted acepta en su totalidad estos Términos de Uso</strong> y asume la responsabilidad de informar adecuadamente a sus usuarios finales sobre el carácter orientativo de los resultados.
            </p>
          </InfoBox>

          <h2>1. Descripción del servicio</h2>
          <p>
            meskeIA pone a disposición pública un <strong>servidor MCP (Model Context Protocol)</strong> que expone más de 160 calculadoras especializadas en áreas fiscal, financiera, laboral y de salud en español.
          </p>
          <p>
            El servidor es accesible en la URL <code>https://meskeia.com/api/mcp/</code> y es compatible con cualquier cliente que implemente el protocolo MCP estándar (Claude Desktop, Cursor, Windsurf y similares).
          </p>
          <p>
            El acceso es <strong>completamente gratuito</strong>, no requiere registro previo ni API key.
          </p>

          <h2>2. Licencia de uso</h2>
          <p>
            meskeIA concede una licencia <strong>gratuita, no exclusiva e intransferible</strong> para integrar el servidor MCP en aplicaciones propias, sean de uso personal, educativo o comercial.
          </p>
          <p>
            No se exige atribución, aunque se agradece mencionar la fuente cuando sea posible.
          </p>

          <h2>3. Usos permitidos</h2>
          <ul>
            <li>Integración en aplicaciones personales, educativas o empresariales</li>
            <li>Integración en agentes, bots o asistentes de IA propios</li>
            <li>Uso como fuente de cálculo en herramientas de asesoramiento interno</li>
            <li>Integración en plataformas de desarrollo (IDE, entornos de código, etc.)</li>
            <li>Uso en proyectos de investigación y docencia</li>
          </ul>

          <h2>4. Usos no permitidos</h2>
          <ul>
            <li>Presentar los resultados como cálculos definitivos, certificados o vinculantes</li>
            <li>Suprimir, ocultar o modificar los avisos legales que acompañan a cada respuesta del servidor</li>
            <li>Usar el servicio para actividades ilegales o contrarias a la buena fe</li>
            <li>Realizar peticiones automatizadas masivas que puedan comprometer la disponibilidad del servicio</li>
            <li>Revender el acceso al servidor MCP como servicio propio</li>
          </ul>

          <h2>5. Obligaciones del integrador</h2>
          <p>
            Quien integre el servidor MCP de meskeIA en su aplicación o sistema asume las siguientes obligaciones:
          </p>
          <ul>
            <li>
              <strong>Informar al usuario final</strong> del carácter orientativo de los resultados y de que no constituyen asesoramiento fiscal, financiero, jurídico ni médico.
            </li>
            <li>
              <strong>No suprimir los avisos legales</strong> incluidos en las respuestas de cada herramienta. Estos avisos forman parte de la respuesta del servidor y tienen como finalidad proteger al usuario final.
            </li>
            <li>
              <strong>Mantener la integridad de los datos</strong>: no manipular, alterar ni reinterpretar los resultados de forma que pueda inducir a error al usuario final.
            </li>
            <li>
              <strong>Asumir la responsabilidad</strong> frente a sus propios usuarios por el uso que haga de los resultados del servidor MCP.
            </li>
          </ul>

          <h2>6. Limitación de responsabilidad de meskeIA</h2>

          <InfoBox type="warning" title="EXENCIÓN DE RESPONSABILIDAD" icon="⚖️">
            <p>
              meskeIA proporciona el servidor MCP <strong>«tal cual» (as-is)</strong>, sin garantías de ningún tipo, expresas o implícitas, sobre la exactitud, integridad o idoneidad de los resultados para ningún fin concreto.
            </p>
            <p>
              <strong>meskeIA no asume ninguna responsabilidad</strong> por decisiones tomadas por el integrador o por los usuarios finales del integrador en base a los resultados del servidor MCP, incluyendo pero no limitándose a: decisiones fiscales, financieras, laborales, jurídicas o médicas.
            </p>
            <p>
              La responsabilidad de informar adecuadamente a los usuarios finales recae exclusivamente en el integrador.
            </p>
          </InfoBox>

          <h2>7. Naturaleza orientativa de los resultados</h2>
          <p>
            Todos los cálculos del servidor MCP de meskeIA son <strong>estimaciones automáticas</strong> basadas en datos generales, tablas normativas públicas y algoritmos de cálculo aproximado. Sus resultados:
          </p>
          <ul>
            <li>No constituyen asesoramiento fiscal ni jurídico</li>
            <li>No sustituyen la consulta con un asesor fiscal colegiado o con la Agencia Tributaria</li>
            <li>No constituyen asesoramiento financiero ni de inversión</li>
            <li>No sustituyen la consulta con un profesional financiero o bancario</li>
            <li>No constituyen diagnóstico ni consejo médico</li>
            <li>No sustituyen la consulta con un profesional sanitario</li>
            <li>Pueden no reflejar normativas autonómicas, convenios colectivos o circunstancias individuales específicas</li>
          </ul>
          <p>
            Los datos normativos (tramos IRPF, cuotas de la Seguridad Social, tipos de interés, etc.) se actualizan periódicamente pero pueden no estar al día en todo momento.
          </p>

          <h2>8. Disponibilidad del servicio</h2>
          <p>
            El servidor MCP de meskeIA es un servicio gratuito prestado <strong>sin garantía de disponibilidad, continuidad ni nivel de servicio (SLA)</strong>. meskeIA se reserva el derecho a:
          </p>
          <ul>
            <li>Modificar o ampliar las herramientas disponibles sin previo aviso</li>
            <li>Suspender temporalmente el servicio por mantenimiento</li>
            <li>Limitar el acceso en caso de uso abusivo</li>
            <li>Discontinuar el servicio en cualquier momento</li>
          </ul>

          <h2>9. Privacidad y tratamiento de datos</h2>

          <InfoBox type="info" title="DATOS QUE SE REGISTRAN" icon="📊">
            <p>
              Cada llamada al servidor MCP registra de forma anónima: el <strong>nombre de la herramienta invocada</strong> y el cliente o agente que realizó la llamada (user-agent). <strong>No se registran los parámetros de entrada ni los resultados</strong> de ningún cálculo.
            </p>
            <p>
              No se recopilan datos personales de los usuarios finales del integrador. El integrador es responsable del tratamiento de datos personales que realice en su propio sistema.
            </p>
          </InfoBox>

          <p>
            Para más información sobre privacidad de datos en meskeIA, consulte la{' '}
            <Link href="/privacidad">Política de Privacidad</Link>.
          </p>

          <h2>10. Modificaciones de los términos</h2>
          <p>
            meskeIA puede actualizar estos términos en cualquier momento. La versión vigente estará siempre disponible en esta URL. El uso continuado del servidor MCP tras la publicación de cambios implica la aceptación de los nuevos términos.
          </p>

          <h2>11. Ley aplicable</h2>
          <p>
            Estos términos se rigen por la legislación española. Para cualquier controversia derivada del uso del servidor MCP, las partes se someten a los juzgados y tribunales competentes conforme a la normativa vigente.
          </p>

          <h2>12. Contacto</h2>
          <p>
            Para consultas sobre estos términos, integraciones o cualquier otra cuestión relacionada con el servidor MCP de meskeIA, puede contactar en:
          </p>
          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:meskeia@proton.me">meskeia@proton.me</a>
          </p>
          <p>
            <Link href="/developers">← Volver a la página de desarrolladores</Link>
          </p>

        </article>

        <LegalNotice />
      </main>

      <Footer appName="developers-terminos" />
    </>
  );
}
