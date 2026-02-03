'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../ChapterPage';
import styles from '../CursoInversion.module.css';

const sections = [
  {
    title: 'Introducción a las Inversiones',
    icon: '🎯',
    content: (
      <>
        <p>En el dinámico contexto financiero actual, <strong>tomar decisiones de inversión informadas no es solo una opción, sino una necesidad</strong> para proteger y hacer crecer el patrimonio.</p>

        <div className={styles.infoBox}>
          <p><strong>💡 ¿Por qué es importante invertir?</strong><br />
          La inflación reduce el poder adquisitivo del dinero con el tiempo. Mantener ahorros solo en cuentas bancarias tradicionales puede resultar en una pérdida de valor real a largo plazo.</p>
        </div>

        <h3>Objetivos de este curso</h3>
        <p>Este curso te ayudará a:</p>
        <ul>
          <li>Comprender cómo funcionan los mercados financieros</li>
          <li>Conocer los diferentes instrumentos de inversión</li>
          <li>Aprender a construir y gestionar una cartera</li>
          <li>Entender los factores psicológicos en las inversiones</li>
          <li>Tomar decisiones informadas sobre tu patrimonio</li>
        </ul>
      </>
    ),
  },
  {
    title: 'El Engranaje Financiero de las Empresas',
    icon: '🏢',
    content: (
      <>
        <p>Para comprender las inversiones, primero debemos entender <strong>cómo se financian las empresas</strong> en las que potencialmente invertiremos.</p>

        <h3>¿Por qué necesitan financiación las empresas?</h3>

        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>💼</div>
            <div className={styles.exampleName}>Operaciones diarias</div>
            <div className={styles.exampleDesc}>Pagar salarios, proveedores, mantener inventarios y cubrir gastos operativos</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>🚀</div>
            <div className={styles.exampleName}>Crecimiento y expansión</div>
            <div className={styles.exampleDesc}>Desarrollar productos, expandirse a nuevos mercados, adquirir tecnología</div>
          </div>
        </div>

        <div className={styles.warningBox}>
          <p><strong>⚠️ Punto clave:</strong> La forma en que una empresa se financia afecta directamente el riesgo y el potencial de retorno de nuestras inversiones.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Fondos Propios vs Fondos Ajenos',
    icon: '⚖️',
    content: (
      <>
        <p>Las empresas tienen fundamentalmente <strong>dos formas de obtener financiación</strong>:</p>

        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>💰</div>
            <div className={styles.exampleName}>Fondos Propios (Equity)</div>
            <div className={styles.exampleDesc}>
              <strong>Características:</strong> Inversión de socios, sin obligación de devolución, cesión de participación<br /><br />
              <strong>Ventajas:</strong> No genera deuda, menor riesgo financiero<br />
              <strong>Desventajas:</strong> Pérdida de control, dilución de beneficios
            </div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>🏛️</div>
            <div className={styles.exampleName}>Fondos Ajenos (Deuda)</div>
            <div className={styles.exampleDesc}>
              <strong>Características:</strong> Préstamos a terceros, debe reembolsarse con intereses<br /><br />
              <strong>Ventajas:</strong> No se cede propiedad, intereses deducibles<br />
              <strong>Desventajas:</strong> Mayor riesgo financiero, obligación de pago
            </div>
          </div>
        </div>

        <div className={styles.highlightBox}>
          <p><strong>🎯 Para el inversor:</strong><br />
          • <strong>Fondos Propios</strong> → Compras <strong>acciones</strong> (eres propietario)<br />
          • <strong>Fondos Ajenos</strong> → Compras <strong>bonos</strong> (eres prestamista)</p>
        </div>
      </>
    ),
  },
  {
    title: 'El Mercado de Capitales',
    icon: '🏛️',
    content: (
      <>
        <p>El <strong>Mercado de Capitales</strong> es el punto de encuentro donde las empresas obtienen financiación y los inversores colocan sus ahorros.</p>

        <h3>Funciones principales</h3>
        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>🔄</div>
            <div className={styles.exampleName}>Transferencia de Recursos</div>
            <div className={styles.exampleDesc}>Desde ahorradores hacia empresas que necesitan financiación</div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>💧</div>
            <div className={styles.exampleName}>Proporcionar Liquidez</div>
            <div className={styles.exampleDesc}>Permite comprar y vender activos financieros fácilmente</div>
          </div>
        </div>

        <h3>Estructura del mercado</h3>
        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Segmento</th>
              <th>Tipo</th>
              <th>Características</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Mercado de Acciones</strong></td>
              <td>Renta Variable</td>
              <td>Participación en la propiedad de empresas</td>
            </tr>
            <tr>
              <td><strong>Mercado de Bonos</strong></td>
              <td>Renta Fija</td>
              <td>Préstamos con obligación de pago</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.infoBox}>
          <p><strong>💡 Concepto clave:</strong> El mercado de capitales es como un gran centro comercial financiero donde se "venden" oportunidades de inversión y se "compra" financiación.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Primeros Pasos para Invertir',
    icon: '🚀',
    content: (
      <>
        <p>Antes de comenzar a invertir, es fundamental seguir estos pasos:</p>

        <h3>1. Fondo de emergencia</h3>
        <p>Antes de invertir, asegúrate de tener un colchón de <strong>3-6 meses de gastos</strong> en una cuenta accesible. Este dinero NO es para invertir.</p>

        <h3>2. Eliminar deudas de alto interés</h3>
        <p>Las deudas con tarjetas de crédito o préstamos personales suelen tener intereses del 15-25%. Prioriza pagarlas antes de invertir.</p>

        <h3>3. Definir objetivos</h3>
        <ul>
          <li><strong>Corto plazo (1-3 años):</strong> Vacaciones, entrada de coche</li>
          <li><strong>Medio plazo (3-10 años):</strong> Entrada de vivienda, estudios</li>
          <li><strong>Largo plazo (+10 años):</strong> Jubilación, independencia financiera</li>
        </ul>

        <h3>4. Conocer tu perfil de riesgo</h3>
        <p>Tu tolerancia al riesgo depende de:</p>
        <ul>
          <li>Edad y horizonte temporal</li>
          <li>Situación financiera actual</li>
          <li>Conocimientos y experiencia</li>
          <li>Capacidad emocional para soportar pérdidas</li>
        </ul>

        <div className={styles.highlightBox}>
          <p><strong>📌 Regla de oro:</strong> Solo invierte dinero que no necesitarás en el corto plazo y que puedes permitirte perder sin afectar tu calidad de vida.</p>
        </div>
      </>
    ),
  },
];

export default function ConceptosBasicosPage() {
  return <ChapterPage slug="conceptos-basicos" sections={sections} />;
}
