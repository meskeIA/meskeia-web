'use client';

import { useState } from 'react';
import Link from 'next/link';
import FixedHeader from '@/components/FixedHeader';
import Footer from '@/components/Footer';
import InfoBox from '@/components/legal/InfoBox';
import styles from './page.module.css';

export default function PrivacidadPage() {
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleDeleteLocalData = () => {
    try {
      // Obtener todas las claves de localStorage
      const keysToDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keysToDelete.push(key);
        }
      }

      // Borrar todas las claves
      keysToDelete.forEach(key => localStorage.removeItem(key));

      setDeleteStatus('success');

      // Resetear el estado después de 5 segundos
      setTimeout(() => setDeleteStatus('idle'), 5000);
    } catch {
      setDeleteStatus('error');
      setTimeout(() => setDeleteStatus('idle'), 5000);
    }
  };

  return (
    <>
      <FixedHeader />

      <main className={styles.container}>
        <article className={styles.legalDocument}>
          <div className={styles.documentHeader}>
            <h1 className={styles.documentTitle}>Política de Privacidad</h1>
            <p className={styles.lastUpdated}>Última actualización: 26 de enero de 2026</p>
          </div>

          <InfoBox type="success" title="COMPROMISO DE PRIVACIDAD" icon="🔒">
            <p><strong>Su privacidad es nuestra prioridad.</strong> meskeIA está diseñado para funcionar completamente en su navegador. Todos los datos que introduce en las calculadoras se procesan localmente y nunca salen de su dispositivo.</p>
          </InfoBox>

          <h2>1. Información del Responsable</h2>
          <p><strong>Responsable del tratamiento:</strong> meskeIA</p>
          <p><strong>Contacto para privacidad:</strong> meskeia24@gmail.com</p>
          <p><strong>Ámbito de aplicación:</strong> Esta política se aplica a todas las utilidades web disponibles en meskeIA.</p>

          <h2>2. Qué Datos Recopilamos y Qué NO</h2>

          <InfoBox type="success" title="PROCESAMIENTO 100% LOCAL" icon="✅">
            <p><strong>Todas nuestras herramientas funcionan exclusivamente en su navegador.</strong> Esto significa que:</p>
            <ul>
              <li><strong>NO recopilamos</strong> los datos que introduce en las calculadoras</li>
              <li><strong>NO almacenamos</strong> información personal sensible en servidores</li>
              <li><strong>NO transmitimos</strong> sus cálculos a ningún servidor</li>
              <li><strong>NO creamos</strong> perfiles de usuario</li>
              <li><strong>NO usamos</strong> cookies de seguimiento de terceros</li>
            </ul>
          </InfoBox>

          <h2 id="localstorage">3. Almacenamiento Local (localStorage)</h2>

          <InfoBox type="info" title="DATOS QUE SE GUARDAN EN SU DISPOSITIVO" icon="💾">
            <p><strong>Para mejorar su experiencia, guardamos algunas preferencias en su navegador usando localStorage:</strong></p>
            <ul>
              <li><strong>Preferencia de tema</strong> (claro/oscuro)</li>
              <li><strong>Progreso en cursos</strong> (capítulos completados)</li>
              <li><strong>Configuraciones de apps</strong> (valores frecuentes, últimas opciones)</li>
              <li><strong>Estado del banner de transparencia</strong> (si ya lo vio)</li>
            </ul>
            <p><strong>IMPORTANTE:</strong> Estos datos:</p>
            <ul>
              <li>Se guardan <strong>solo en su dispositivo</strong></li>
              <li><strong>Nunca se envían</strong> a nuestros servidores</li>
              <li><strong>No contienen</strong> información personal identificable</li>
              <li><strong>Usted puede borrarlos</strong> en cualquier momento (ver abajo)</li>
            </ul>
          </InfoBox>

          <div className={styles.deleteSection}>
            <h3>Borrar mis datos locales</h3>
            <p>Puede eliminar todos los datos guardados en su navegador por meskeIA. Esto incluye preferencias de tema, progreso en cursos y cualquier configuración personalizada.</p>
            <button
              type="button"
              onClick={handleDeleteLocalData}
              className={styles.deleteButton}
              disabled={deleteStatus === 'success'}
              aria-describedby="delete-status"
            >
              <span aria-hidden="true">🗑️</span> Borrar todos mis datos locales
            </button>
            {deleteStatus === 'success' && (
              <p id="delete-status" className={styles.deleteSuccess} role="alert">
                ✅ Datos borrados correctamente. La página se comportará como si fuera su primera visita.
              </p>
            )}
            {deleteStatus === 'error' && (
              <p id="delete-status" className={styles.deleteError} role="alert">
                ❌ Ocurrió un error al borrar los datos. Por favor, intente borrar los datos del sitio desde la configuración de su navegador.
              </p>
            )}
          </div>

          <h2>4. Analytics Propio</h2>

          <InfoBox type="info" title="ESTADÍSTICAS BÁSICAS Y ANÓNIMAS" icon="📊">
            <p><strong>Utilizamos un sistema de analytics propio para entender qué herramientas son más útiles:</strong></p>
            <ul>
              <li><strong>Páginas visitadas</strong> (qué calculadoras son más populares)</li>
              <li><strong>Tiempo aproximado de uso</strong> (si las herramientas son útiles)</li>
              <li><strong>País de origen</strong> (datos agregados y anónimos, derivados de IP)</li>
              <li><strong>Tipo de dispositivo</strong> (móvil o escritorio)</li>
            </ul>
            <p><strong>NO registramos:</strong></p>
            <ul>
              <li>Los datos que introduce en las calculadoras</li>
              <li>Su dirección IP completa (se anonimiza)</li>
              <li>Información personal identificable</li>
            </ul>
          </InfoBox>

          <h2>5. Sus Derechos (RGPD)</h2>

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
                <td>Solo estadísticas anónimas agregadas. Datos locales visibles en DevTools</td>
              </tr>
              <tr>
                <td><strong>Rectificación</strong></td>
                <td>Corregir datos incorrectos</td>
                <td>Puede editar localStorage desde su navegador</td>
              </tr>
              <tr>
                <td><strong>Supresión</strong></td>
                <td>Eliminar sus datos</td>
                <td>Use el botón &quot;Borrar datos locales&quot; arriba o contacte por email</td>
              </tr>
              <tr>
                <td><strong>Portabilidad</strong></td>
                <td>Exportar sus datos</td>
                <td>Puede exportar localStorage desde DevTools de su navegador</td>
              </tr>
              <tr>
                <td><strong>Oposición</strong></td>
                <td>Oponerse al tratamiento</td>
                <td>Puede bloquear localStorage en su navegador</td>
              </tr>
            </tbody>
          </table>

          <h2>6. Seguridad de los Datos</h2>

          <InfoBox type="success" title="MÁXIMA SEGURIDAD POR DISEÑO" icon="🛡️">
            <p><strong>La mejor protección es no recopilar datos.</strong> Al procesar todo localmente:</p>
            <ul>
              <li>Sus datos sensibles nunca salen de su dispositivo</li>
              <li>No hay riesgo de filtración de información personal</li>
              <li>No hay base de datos de usuarios que pueda ser hackeada</li>
              <li>Usted mantiene control total sobre su información</li>
            </ul>
          </InfoBox>

          <h2>7. Cookies</h2>

          <InfoBox type="success" title="SIN COOKIES DE SEGUIMIENTO" icon="🍪">
            <p><strong>meskeIA NO utiliza cookies de seguimiento ni de terceros.</strong></p>
            <p>Usamos <strong>localStorage</strong> (almacenamiento local del navegador) para guardar sus preferencias. A diferencia de las cookies:</p>
            <ul>
              <li>Los datos NO se envían automáticamente al servidor</li>
              <li>NO hay cookies de publicidad ni de tracking</li>
              <li>NO compartimos datos con terceros a través de cookies</li>
            </ul>
          </InfoBox>

          <h2>8. Contacto y Ejercicio de Derechos</h2>

          <div className={styles.contactInfo}>
            <p><strong>Para consultas sobre privacidad y protección de datos:</strong></p>
            <p>📧 Email: <strong>meskeia24@gmail.com</strong></p>
            <p>🌐 Web: <strong>meskeIA</strong></p>
            <p><em>Responderemos en un plazo máximo de 30 días</em></p>
          </div>

          <InfoBox type="success" title="NUESTRO COMPROMISO" icon="🤝">
            <p><strong>meskeIA se compromete con la privacidad por diseño.</strong> Creemos que las herramientas útiles no requieren recopilar datos personales. Sus cálculos, sus contraseñas y su información sensible permanecen siempre bajo su control.</p>
          </InfoBox>
        </article>
      </main>

      <Footer appName="meskeIA" />
    </>
  );
}
