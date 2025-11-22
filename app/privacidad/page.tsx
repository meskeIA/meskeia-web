'use client';

import Link from 'next/link';
import FixedHeader from '@/components/FixedHeader';
import Footer from '@/components/Footer';
import InfoBox from '@/components/legal/InfoBox';
import styles from './page.module.css';

export default function PrivacidadPage() {
  return (
    <>
      <FixedHeader />

      <main className={styles.container}>
        <article className={styles.legalDocument}>
          <div className={styles.documentHeader}>
            <h1 className={styles.documentTitle}>Política de Privacidad</h1>
            <p className={styles.lastUpdated}>Última actualización: 2 de noviembre de 2025</p>
          </div>

          <InfoBox type="success" title="COMPROMISO DE PRIVACIDAD" icon="🔒">
            <p><strong>Su privacidad es nuestra prioridad.</strong> meskeIA está diseñado para funcionar completamente en su navegador. Utilizamos Google Analytics para estadísticas básicas de uso, pero nunca accedemos a los datos que introduce en las calculadoras.</p>
          </InfoBox>

          <h2>1. Información del Responsable</h2>
          <p><strong>Responsable del tratamiento:</strong> meskeIA</p>
          <p><strong>Contacto para privacidad:</strong> meskeia24@gmail.com</p>
          <p><strong>Ámbito de aplicación:</strong> Esta política se aplica a todas las utilidades web disponibles en meskeIA.</p>

          <h2>2. Qué Datos Recopilamos y Qué NO</h2>

          <InfoBox type="success" title="PROCESAMIENTO LOCAL" icon="✅">
            <p><strong>Todas nuestras herramientas funcionan exclusivamente en su navegador.</strong> Esto significa que:</p>
            <ul>
              <li><strong>NO recopilamos</strong> los datos que introduce en las calculadoras</li>
              <li><strong>NO almacenamos</strong> información personal sensible</li>
              <li><strong>NO transmitimos</strong> sus cálculos a nuestros servidores</li>
              <li><strong>NO creamos</strong> perfiles detallados de usuario</li>
            </ul>
          </InfoBox>

          <InfoBox type="info" title="GOOGLE ANALYTICS - ESTADÍSTICAS BÁSICAS" icon="📊">
            <p><strong>SÍ utilizamos Google Analytics para comprender mejor cómo se usa nuestro sitio web:</strong></p>
            <ul>
              <li><strong>Páginas visitadas</strong> (qué calculadoras son más populares)</li>
              <li><strong>Tiempo en el sitio</strong> (si las herramientas son útiles)</li>
              <li><strong>País de origen</strong> (datos agregados y anónimos)</li>
              <li><strong>Tipo de dispositivo</strong> (móvil, escritorio)</li>
              <li><strong>Flujo de navegación</strong> (cómo se mueve entre páginas)</li>
            </ul>
            <p><strong>IMPORTANTE:</strong> Google Analytics NO puede ver los datos que introduce en las calculadoras (números, contraseñas, información de salud, etc.). Solo ve que visitó la página, no qué calculó en ella.</p>
          </InfoBox>

          <h3>2.1 Herramientas Específicas</h3>
          <p><strong>Generador de Contraseñas:</strong> Las contraseñas se generan localmente. Google Analytics no las ve.</p>
          <p><strong>Calculadoras Financieras:</strong> Todos los cálculos se realizan en su navegador. Sus datos financieros permanecen privados.</p>
          <p><strong>Calculadoras de Salud:</strong> La información de salud se procesa únicamente en su dispositivo.</p>
          <p><strong>Herramientas de Color:</strong> Las paletas se generan localmente sin recopilar preferencias.</p>

          <h2>3. Sus Derechos (RGPD)</h2>

          <InfoBox type="info" title="DERECHOS SEGÚN RGPD" icon="⚖️">
            <p>Según el Reglamento General de Protección de Datos, usted tiene los siguientes derechos:</p>
          </InfoBox>

          <table className={styles.rightsTable}>
            <thead>
              <tr>
                <th>Derecho</th>
                <th>Descripción</th>
                <th>En meskeIA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Acceso</strong></td>
                <td>Conocer qué datos tenemos sobre usted</td>
                <td>Solo datos técnicos básicos y estadísticas agregadas</td>
              </tr>
              <tr>
                <td><strong>Rectificación</strong></td>
                <td>Corregir datos incorrectos</td>
                <td>Los datos son técnicos automáticos, sin datos personales editables</td>
              </tr>
              <tr>
                <td><strong>Supresión</strong></td>
                <td>Eliminar sus datos</td>
                <td>Puede solicitarlo por email. GA se borra automáticamente según retención</td>
              </tr>
              <tr>
                <td><strong>Portabilidad</strong></td>
                <td>Exportar sus datos</td>
                <td>Solo datos técnicos básicos disponibles</td>
              </tr>
              <tr>
                <td><strong>Oposición</strong></td>
                <td>Oponerse al tratamiento</td>
                <td>Puede desactivar cookies o dejar de usar el sitio</td>
              </tr>
            </tbody>
          </table>

          <h2>4. Seguridad de los Datos</h2>

          <InfoBox type="success" title="MÁXIMA SEGURIDAD" icon="🛡️">
            <p><strong>La mejor protección es el procesamiento local.</strong> Al procesar casi todo localmente:</p>
            <ul>
              <li>Sus datos sensibles nunca salen de su dispositivo</li>
              <li>No hay riesgo de filtración de información personal</li>
              <li>Google Analytics solo recibe datos técnicos agregados</li>
              <li>Usted mantiene control total sobre su información privada</li>
            </ul>
          </InfoBox>

          <h2>5. Cookies y Tecnologías Similares</h2>

          <h3>5.1 Cookies Utilizadas</h3>

          <h4>🔧 Cookies Técnicas Esenciales:</h4>
          <ul>
            <li><strong>Preferencias de idioma</strong> (si las hubiera)</li>
            <li><strong>Configuraciones de sesión</strong> (funcionalidad básica)</li>
            <li><strong>Estado de navegación</strong> (experiencia de usuario)</li>
          </ul>

          <h4>📊 Cookies de Google Analytics:</h4>
          <ul>
            <li><strong>_ga:</strong> Distingue usuarios únicos (expira en 2 años)</li>
            <li><strong>_ga_[ID]:</strong> Mantiene estado de sesión (expira en 2 años)</li>
            <li><strong>_gid:</strong> Distingue usuarios (expira en 24 horas)</li>
          </ul>

          <h2>6. Contacto y Ejercicio de Derechos</h2>

          <div className={styles.contactInfo}>
            <p><strong>Para consultas sobre privacidad y protección de datos:</strong></p>
            <p>📧 Email: <strong>meskeia24@gmail.com</strong></p>
            <p>🌐 Web: <strong>meskeIA</strong></p>
            <p><em>Responderemos en un plazo máximo de 30 días</em></p>
          </div>

          <InfoBox type="warning" title="AUTORIDAD DE CONTROL" icon="⚖️">
            <p>Si considera que el tratamiento de sus datos personales infringe el RGPD, tiene derecho a presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong>:</p>
            <p>🌐 <strong>www.aepd.es</strong> | 📧 <strong>consultas@aepd.es</strong></p>
          </InfoBox>

          <InfoBox type="success" title="NUESTRO COMPROMISO" icon="🤝">
            <p><strong>meskeIA se compromete a mantener el equilibrio perfecto entre utilidad y privacidad.</strong> Utilizamos Google Analytics únicamente para mejorar nuestro servicio, mientras mantenemos sus datos más sensibles siempre bajo su control directo.</p>
          </InfoBox>
        </article>
      </main>

      <Footer appName="meskeIA" />
    </>
  );
}
