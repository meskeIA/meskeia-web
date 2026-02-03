'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../ChapterPage';
import styles from '../CursoInversion.module.css';

const sections = [
  {
    title: '¿Qué es un Broker?',
    icon: '🏦',
    content: (
      <>
        <p>Un <strong>broker</strong> es el intermediario que te permite comprar y vender activos financieros en los mercados. Sin un broker, no puedes acceder a la bolsa directamente.</p>

        <h3>Tipos de brokers</h3>
        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>🏛️</div>
            <div className={styles.exampleName}>Broker tradicional (Banco)</div>
            <div className={styles.exampleDesc}>
              Ofrecido por tu banco habitual (BBVA, Santander, CaixaBank...)<br />
              <strong>Pros:</strong> Confianza, todo integrado<br />
              <strong>Contras:</strong> Comisiones muy altas, poca variedad
            </div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>💻</div>
            <div className={styles.exampleName}>Broker online</div>
            <div className={styles.exampleDesc}>
              Plataformas especializadas (Interactive Brokers, DEGIRO, Trade Republic...)<br />
              <strong>Pros:</strong> Comisiones bajas, gran variedad<br />
              <strong>Contras:</strong> Requiere más autonomía
            </div>
          </div>
        </div>

        <div className={styles.exampleGrid}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>🤖</div>
            <div className={styles.exampleName}>Roboadvisor</div>
            <div className={styles.exampleDesc}>
              Gestión automatizada (Indexa Capital, Finizens, MyInvestor...)<br />
              <strong>Pros:</strong> Todo automático, rebalanceo incluido<br />
              <strong>Contras:</strong> Menos control, comisión de gestión
            </div>
          </div>
          <div className={styles.exampleCard}>
            <div className={styles.exampleLogo}>📱</div>
            <div className={styles.exampleName}>Neobroker</div>
            <div className={styles.exampleDesc}>
              Apps móviles (Trade Republic, eToro, Revolut...)<br />
              <strong>Pros:</strong> Interfaz simple, acceso fácil<br />
              <strong>Contras:</strong> Pueden incentivar el trading excesivo
            </div>
          </div>
        </div>
      </>
    ),
  },
  {
    title: 'Criterios de Selección',
    icon: '✅',
    content: (
      <>
        <p>Factores a evaluar antes de elegir un broker:</p>

        <h3>1. Regulación y seguridad</h3>
        <ul>
          <li><strong>CNMV:</strong> Regulador español. Obligatorio para operar en España.</li>
          <li><strong>FGD:</strong> Fondo de Garantía de Depósitos (hasta 100.000€ en efectivo)</li>
          <li><strong>FOGAIN:</strong> Fondo de Garantía de Inversiones (hasta 100.000€ en valores)</li>
          <li><strong>Segregación de cuentas:</strong> Tus valores separados de los del broker</li>
        </ul>

        <div className={styles.warningBox}>
          <p><strong>⚠️ Importante:</strong> Nunca uses un broker no regulado. Si quiebra, podrías perder todo tu dinero. Verifica siempre en la web de la CNMV.</p>
        </div>

        <h3>2. Comisiones</h3>
        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Tipo de comisión</th>
              <th>Descripción</th>
              <th>Impacto</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Compra/venta</strong></td>
              <td>Por cada operación</td>
              <td>Alto si operas mucho</td>
            </tr>
            <tr>
              <td><strong>Custodia</strong></td>
              <td>Por tener valores depositados</td>
              <td>Alto a largo plazo</td>
            </tr>
            <tr>
              <td><strong>Cambio de divisa</strong></td>
              <td>Al comprar en otra moneda</td>
              <td>Medio (0,25-1%)</td>
            </tr>
            <tr>
              <td><strong>Inactividad</strong></td>
              <td>Por no operar en X meses</td>
              <td>Evitable</td>
            </tr>
            <tr>
              <td><strong>Cobro dividendos</strong></td>
              <td>Al recibir dividendos</td>
              <td>Bajo/Medio</td>
            </tr>
          </tbody>
        </table>

        <h3>3. Productos disponibles</h3>
        <ul>
          <li>Acciones españolas y extranjeras</li>
          <li>ETFs (especialmente los domiciliados en Irlanda)</li>
          <li>Fondos de inversión</li>
          <li>Bonos</li>
          <li>Derivados (opciones, futuros) - solo si los necesitas</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Comparativa de Brokers en España',
    icon: '📊',
    content: (
      <>
        <p>Comparativa actualizada de brokers populares para inversores españoles:</p>

        <h3>Para inversión indexada a largo plazo</h3>
        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Broker</th>
              <th>Mejor para</th>
              <th>Comisiones</th>
              <th>Regulación</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>MyInvestor</strong></td>
              <td>Fondos indexados Vanguard</td>
              <td>Sin comisiones de custodia</td>
              <td>CNMV + BdE</td>
            </tr>
            <tr>
              <td><strong>Openbank</strong></td>
              <td>Fondos indexados</td>
              <td>Sin comisiones</td>
              <td>CNMV + BdE</td>
            </tr>
            <tr>
              <td><strong>Indexa Capital</strong></td>
              <td>Gestión automatizada</td>
              <td>0,40-0,62% anual</td>
              <td>CNMV</td>
            </tr>
            <tr>
              <td><strong>Finizens</strong></td>
              <td>Roboadvisor</td>
              <td>0,30-0,65% anual</td>
              <td>CNMV</td>
            </tr>
          </tbody>
        </table>

        <h3>Para ETFs y acciones internacionales</h3>
        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Broker</th>
              <th>Comisión ETF</th>
              <th>Custodia</th>
              <th>Ideal para</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Interactive Brokers</strong></td>
              <td>~1€-3€</td>
              <td>Sin custodia</td>
              <td>Inversores serios, mucha variedad</td>
            </tr>
            <tr>
              <td><strong>DEGIRO</strong></td>
              <td>0€ (ETFs selección) - 2€</td>
              <td>Sin custodia</td>
              <td>Comisiones bajas, interfaz simple</td>
            </tr>
            <tr>
              <td><strong>Trade Republic</strong></td>
              <td>0€ (planes) - 1€</td>
              <td>Sin custodia</td>
              <td>DCA automático, app móvil</td>
            </tr>
            <tr>
              <td><strong>XTB</strong></td>
              <td>0€</td>
              <td>Sin custodia*</td>
              <td>Sin comisiones, pero spread</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.infoBox}>
          <p><strong>💡 Mi recomendación personal:</strong><br />
          • <strong>Principiantes:</strong> MyInvestor o Indexa Capital (fondos indexados, todo simple)<br />
          • <strong>Intermedios:</strong> DEGIRO o Trade Republic (ETFs con costes bajos)<br />
          • <strong>Avanzados:</strong> Interactive Brokers (máxima variedad y control)</p>
        </div>
      </>
    ),
  },
  {
    title: 'Fiscalidad y Modelo 720',
    icon: '📋',
    content: (
      <>
        <p>Al usar brokers extranjeros, hay obligaciones fiscales adicionales en España:</p>

        <h3>Modelo 720</h3>
        <p>Declaración informativa de bienes en el extranjero si superas 50.000€ en cualquier categoría:</p>
        <ul>
          <li>Cuentas bancarias</li>
          <li>Valores y derechos</li>
          <li>Inmuebles</li>
        </ul>

        <div className={styles.warningBox}>
          <p><strong>⚠️ Importante:</strong> El incumplimiento del 720 tenía multas desproporcionadas que el TJUE declaró ilegales. Aún así, sigue siendo obligatorio presentarlo. Consulta con un asesor fiscal si tienes dudas.</p>
        </div>

        <h3>Modelo D6</h3>
        <p>Declaración de inversiones en el exterior ante el Registro de Inversiones del Ministerio de Economía. Obligatorio si:</p>
        <ul>
          <li>Participación en empresa extranjera ≥ 10% del capital</li>
          <li>Inversión en empresa extranjera &gt; 1.503.000€</li>
        </ul>
        <p><em>La mayoría de inversores minoristas NO están obligados al D6.</em></p>

        <h3>Retención en dividendos extranjeros</h3>
        <ul>
          <li><strong>EEUU:</strong> Retención 15% (con W-8BEN) o 30% (sin formulario)</li>
          <li><strong>Irlanda:</strong> 0% (por eso los ETFs irlandeses son populares)</li>
          <li><strong>España:</strong> El broker español retiene 19%</li>
        </ul>

        <div className={styles.highlightBox}>
          <p><strong>📌 Consejo:</strong> Para simplificar la fiscalidad, considera usar ETFs domiciliados en Irlanda (ISIN empieza por IE) que son eficientes fiscalmente para inversores españoles.</p>
        </div>
      </>
    ),
  },
  {
    title: 'Proceso de Apertura de Cuenta',
    icon: '📝',
    content: (
      <>
        <p>Pasos típicos para abrir una cuenta en un broker:</p>

        <h3>Documentación necesaria</h3>
        <ul>
          <li>DNI/NIE en vigor (ambas caras)</li>
          <li>Justificante de domicilio (recibo, extracto bancario)</li>
          <li>Datos bancarios (IBAN para transferencias)</li>
          <li>Selfie o videollamada (verificación de identidad)</li>
        </ul>

        <h3>Cuestionario de idoneidad</h3>
        <p>Por normativa MiFID II, el broker te preguntará sobre:</p>
        <ul>
          <li>Experiencia previa en inversiones</li>
          <li>Conocimientos financieros</li>
          <li>Situación financiera</li>
          <li>Objetivos de inversión</li>
          <li>Tolerancia al riesgo</li>
        </ul>
        <p><em>Responde honestamente; esto protege tus intereses.</em></p>

        <h3>Plazos típicos</h3>
        <ul>
          <li><strong>Neobrokers:</strong> 1-3 días</li>
          <li><strong>Brokers online:</strong> 3-7 días</li>
          <li><strong>Bancos tradicionales:</strong> 1-2 semanas</li>
        </ul>

        <h3>Primera transferencia</h3>
        <ol>
          <li>Transfiere una cantidad pequeña primero (100-500€) para verificar</li>
          <li>Comprueba que llega correctamente (1-3 días laborables)</li>
          <li>Una vez verificado, transfiere cantidades mayores</li>
        </ol>

        <div className={styles.infoBox}>
          <p><strong>💡 Consejo:</strong> Guarda siempre los justificantes de transferencias y operaciones. Los necesitarás para la declaración de la renta.</p>
        </div>
      </>
    ),
  },
];

export default function GuiaBrokersPage() {
  return <ChapterPage slug="guia-brokers" sections={sections} />;
}
