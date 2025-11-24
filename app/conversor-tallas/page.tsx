'use client';

import { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from './ConversorTallas.module.css';

type TabType = 'hombre' | 'mujer' | 'calzado' | 'complementos';
type SistemaType = 'EU' | 'US' | 'UK';

export default function ConversorTallasPage() {
  const [activeTab, setActiveTab] = useState<TabType>('hombre');
  const [sistema, setSistema] = useState<SistemaType>('EU');
  const [tallaInput, setTallaInput] = useState<string>('');
  const [resultados, setResultados] = useState<{ [key: string]: string }>({});
  const [showEducationalContent, setShowEducationalContent] = useState<boolean>(false);

  const convertirHombreTalla = (talla: string, sistemaOrigen: SistemaType) => {
    const tallasHombre: { [key: string]: { EU: string; US: string; UK: string } } = {
      'XS': { EU: '44', US: '34', UK: '34' },
      'S': { EU: '46-48', US: '36-38', UK: '36-38' },
      'M': { EU: '50-52', US: '40-42', UK: '40-42' },
      'L': { EU: '54-56', US: '44-46', UK: '44-46' },
      'XL': { EU: '58-60', US: '48-50', UK: '48-50' },
      'XXL': { EU: '62-64', US: '52-54', UK: '52-54' },
    };

    const tallaNormalizada = talla.toUpperCase();
    if (tallasHombre[tallaNormalizada]) {
      return tallasHombre[tallaNormalizada];
    }

    return { EU: '-', US: '-', UK: '-' };
  };

  const convertirMujerTalla = (talla: string, sistemaOrigen: SistemaType) => {
    const tallasMujer: { [key: string]: { EU: string; US: string; UK: string } } = {
      'XS': { EU: '34', US: '2', UK: '6' },
      'S': { EU: '36', US: '4', UK: '8' },
      'M': { EU: '38-40', US: '6-8', UK: '10-12' },
      'L': { EU: '42-44', US: '10-12', UK: '14-16' },
      'XL': { EU: '46-48', US: '14-16', UK: '18-20' },
      'XXL': { EU: '50-52', US: '18-20', UK: '22-24' },
    };

    const tallaNormalizada = talla.toUpperCase();
    if (tallasMujer[tallaNormalizada]) {
      return tallasMujer[tallaNormalizada];
    }

    return { EU: '-', US: '-', UK: '-' };
  };

  const convertirCalzado = (tallaNum: number, sistemaOrigen: SistemaType) => {
    let eu = 0, us = 0, uk = 0;

    if (sistemaOrigen === 'EU') {
      eu = tallaNum;
      us = Math.round((tallaNum - 33) * 10) / 10;
      uk = Math.round((tallaNum - 33.5) * 10) / 10;
    } else if (sistemaOrigen === 'US') {
      us = tallaNum;
      eu = Math.round((tallaNum + 33) * 10) / 10;
      uk = Math.round((tallaNum - 0.5) * 10) / 10;
    } else if (sistemaOrigen === 'UK') {
      uk = tallaNum;
      eu = Math.round((tallaNum + 33.5) * 10) / 10;
      us = Math.round((tallaNum + 0.5) * 10) / 10;
    }

    return {
      EU: eu.toString(),
      US: us.toString(),
      UK: uk.toString()
    };
  };

  const convertir = () => {
    if (!tallaInput.trim()) {
      alert('Por favor, introduce una talla');
      return;
    }

    let resultado: { EU: string; US: string; UK: string } = { EU: '-', US: '-', UK: '-' };

    if (activeTab === 'hombre') {
      resultado = convertirHombreTalla(tallaInput, sistema);
    } else if (activeTab === 'mujer') {
      resultado = convertirMujerTalla(tallaInput, sistema);
    } else if (activeTab === 'calzado') {
      const tallaNum = parseFloat(tallaInput);
      if (isNaN(tallaNum)) {
        alert('Introduce un número válido para la talla de calzado');
        return;
      }
      resultado = convertirCalzado(tallaNum, sistema);
    }

    setResultados(resultado);
  };

  return (
    <>
      <AnalyticsTracker appName="conversor-tallas" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Conversor de Tallas Internacional",
            "description": "Aplicación web gratuita para convertir tallas internacionales de ropa, calzado y complementos entre sistemas ES/EU, US y UK. Ideal para compras online internacionales.",
            "url": "https://meskeia.com/beta/conversor-tallas",
            "applicationCategory": "Shopping",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR"
            },
            "provider": {
              "@type": "Organization",
              "name": "meskeIA",
              "url": "https://meskeia.com"
            }
          })
        }}
      />

      <MeskeiaLogo />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Conversor de Tallas Internacional</h1>
          <p>Convierte tallas de ropa y calzado entre ES/EU, US y UK</p>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'hombre' ? styles.active : ''}`}
            onClick={() => { setActiveTab('hombre'); setResultados({}); }}
            type="button"
          >
            👔 Ropa Hombre
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'mujer' ? styles.active : ''}`}
            onClick={() => { setActiveTab('mujer'); setResultados({}); }}
            type="button"
          >
            👗 Ropa Mujer
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'calzado' ? styles.active : ''}`}
            onClick={() => { setActiveTab('calzado'); setResultados({}); }}
            type="button"
          >
            👟 Calzado
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.inputSection}>
            <h2>Introduce tu talla</h2>

            <div className={styles.formGroup}>
              <label htmlFor="sistema-select">Sistema de tallas:</label>
              <select
                id="sistema-select"
                value={sistema}
                onChange={(e) => setSistema(e.target.value as SistemaType)}
              >
                <option value="EU">Europa (EU)</option>
                <option value="US">Estados Unidos (US)</option>
                <option value="UK">Reino Unido (UK)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>
                {activeTab === 'calzado' ? 'Talla (número):' : 'Talla (XS, S, M, L, XL, XXL):'}
              </label>
              <input
                type="text"
                value={tallaInput}
                onChange={(e) => setTallaInput(e.target.value)}
                placeholder={activeTab === 'calzado' ? 'Ej: 42' : 'Ej: M'}
                className={styles.input}
              />
            </div>

            <button type="button" className={styles.btnConvertir} onClick={convertir}>
              Convertir Talla
            </button>
          </div>

          {Object.keys(resultados).length > 0 && (
            <div className={styles.resultsSection}>
              <h2>Equivalencias de talla</h2>

              <div className={styles.resultCard}>
                <span className={styles.resultLabel}>🇪🇺 Europa (EU):</span>
                <span className={styles.resultValue}>{resultados.EU}</span>
              </div>

              <div className={styles.resultCard}>
                <span className={styles.resultLabel}>🇺🇸 Estados Unidos (US):</span>
                <span className={styles.resultValue}>{resultados.US}</span>
              </div>

              <div className={styles.resultCard}>
                <span className={styles.resultLabel}>🇬🇧 Reino Unido (UK):</span>
                <span className={styles.resultValue}>{resultados.UK}</span>
              </div>

              <div className={styles.disclaimer}>
                <strong>Nota:</strong> Las conversiones son aproximadas. Cada marca puede variar, consulta siempre la guía de tallas del fabricante.
              </div>
            </div>
          )}
        </div>

        {/* Toggle para contenido educativo */}
        <div className={styles.educationalToggle}>
          <h3>📚 ¿Quieres aprender más sobre Tallas Internacionales?</h3>
          <p className={styles.educationalSubtitle}>
            Descubre por qué existen diferentes sistemas de tallas, cómo convertir entre ellos, consejos para compras online internacionales y guías de medición precisas
          </p>
          <button
            type="button"
            onClick={() => setShowEducationalContent(!showEducationalContent)}
            className={styles.btnSecondary}
          >
            {showEducationalContent ? '⬆️ Ocultar Guía Educativa' : '⬇️ Ver Guía Completa'}
          </button>
        </div>

        {/* Contenido educativo colapsable */}
        {showEducationalContent && (
          <div className={styles.educationalContent}>
            {/* Sección 1: Introducción */}
            <section className={styles.guideSection}>
              <h2>Guía Completa de Tallas Internacionales</h2>

              <div className={styles.introSection}>
                <h3>¿Por qué existen diferentes sistemas de tallas?</h3>
                <p>
                  Los <strong>sistemas de tallas internacionales</strong> varían porque cada país desarrolló sus propios
                  estándares basados en las características físicas promedio de su población, sistemas de medida
                  (métrico vs imperial) y tradiciones manufactureras. Esto hace que las compras online internacionales
                  requieran conversiones precisas.
                </p>
              </div>

              {/* Sistemas principales */}
              <div className={styles.systemsSection}>
                <h3>Sistemas de Tallas Principales</h3>
                <div className={styles.systemsGrid}>
                  <div className={styles.systemCard}>
                    <h4>🇪🇸 España/Europa (ES/EU)</h4>
                    <p>
                      <strong>Sistema métrico</strong> basado en centímetros. Usado en toda la Unión Europea.
                      Para ropa usa medidas directas del cuerpo, para calzado longitud en centímetros (Paris Point).
                    </p>
                  </div>

                  <div className={styles.systemCard}>
                    <h4>🇺🇸 Estados Unidos (US)</h4>
                    <p>
                      <strong>Sistema imperial</strong> basado en pulgadas. Usa letras (XS, S, M, L, XL) y números.
                      Las tallas americanas suelen ser más grandes que las europeas para la misma medida corporal.
                    </p>
                  </div>

                  <div className={styles.systemCard}>
                    <h4>🇬🇧 Reino Unido (UK)</h4>
                    <p>
                      <strong>Sistema mixto</strong> que combina elementos imperiales y propios. Similar al americano
                      pero con diferencias significativas en calzado y ropa formal.
                    </p>
                  </div>

                  <div className={styles.systemCard}>
                    <h4>🌏 Otros Sistemas</h4>
                    <p>
                      <strong>Francia (FR):</strong> Similar al EU pero con pequeñas diferencias<br/>
                      <strong>Italia (IT):</strong> Propio sistema numérico<br/>
                      <strong>Asia:</strong> Generalmente más pequeño que occidentales
                    </p>
                  </div>
                </div>
              </div>

              {/* Consejos para compras */}
              <div className={styles.tipsSection}>
                <h3>Consejos para Compras Online Internacionales</h3>
                <div className={styles.tipsGrid}>
                  <div className={styles.tipCard}>
                    <h4>📏 Mide tu Cuerpo</h4>
                    <p>
                      Toma medidas precisas de <strong>pecho, cintura, cadera y largo</strong>. Para calzado,
                      mide tu pie en centímetros. Estas medidas son más fiables que las tallas.
                    </p>
                  </div>

                  <div className={styles.tipCard}>
                    <h4>📋 Consulta Guías Específicas</h4>
                    <p>
                      Cada marca tiene su <strong>guía de tallas</strong>. Las marcas asiáticas suelen tallar
                      1-2 tallas más pequeñas que las occidentales.
                    </p>
                  </div>

                  <div className={styles.tipCard}>
                    <h4>📱 Lee Reseñas</h4>
                    <p>
                      Los comentarios de otros compradores suelen mencionar si el producto <strong>"talla grande"
                      o "talla pequeño"</strong> respecto a la guía oficial.
                    </p>
                  </div>

                  <div className={styles.tipCard}>
                    <h4>📦 Política de Devoluciones</h4>
                    <p>
                      Antes de comprar, verifica la <strong>política de cambios</strong> y devoluciones.
                      Algunos sitios ofrecen cambios gratuitos de talla.
                    </p>
                  </div>

                  <div className={styles.tipCard}>
                    <h4>🎯 Talla de Seguridad</h4>
                    <p>
                      En caso de duda, elige la <strong>talla mayor</strong>. Es más fácil ajustar una
                      prenda grande que estirar una pequeña.
                    </p>
                  </div>

                  <div className={styles.tipCard}>
                    <h4>🕐 Horario de la Medición</h4>
                    <p>
                      Mide tu pie por la <strong>tarde-noche</strong> cuando está más hinchado. Para ropa,
                      mide sobre la ropa interior que usarás normalmente.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Sección 2: Conversiones Detalladas */}
            <section className={styles.guideSection}>
              <h2>Conversiones Detalladas por Categoría</h2>

              <div className={styles.conversionsGrid}>
                <div className={styles.conversionCard}>
                  <h3>👔 Ropa de Hombre</h3>
                  <ul>
                    <li><strong>Camisas casuales:</strong> XS-XXL (letras universales)</li>
                    <li><strong>Camisas formales:</strong> Por medida del cuello en cm/pulgadas</li>
                    <li><strong>Pantalones:</strong> Cintura en cm (ES) vs pulgadas (US/UK)</li>
                    <li><strong>Chaquetas:</strong> Sistema numérico directo con diferencias</li>
                    <li><strong>Diferencia típica:</strong> ES = US + 10, UK similar a US</li>
                  </ul>
                </div>

                <div className={styles.conversionCard}>
                  <h3>👗 Ropa de Mujer</h3>
                  <ul>
                    <li><strong>Blusas:</strong> XS-XXL con equivalencias numéricas</li>
                    <li><strong>Pantalones:</strong> ES: 34-50, US: 0-16, UK: 6-22</li>
                    <li><strong>Vestidos:</strong> Similar a pantalones con ajustes por tipo</li>
                    <li><strong>Fórmula aproximada:</strong> US = (ES-34)/2, UK = ES-28</li>
                    <li><strong>Nota:</strong> Mayor variación entre marcas que en hombre</li>
                  </ul>
                </div>

                <div className={styles.conversionCard}>
                  <h3>👟 Calzado</h3>
                  <ul>
                    <li><strong>Hombre:</strong> ES: 39-47, US: 6-14, UK: 5.5-13</li>
                    <li><strong>Mujer:</strong> ES: 35-42, US: 5-11, UK: 2.5-8.5</li>
                    <li><strong>Niños:</strong> ES: 16-35, US: 1-4, UK: 0.5-3.5</li>
                    <li><strong>Centímetros:</strong> La medida más precisa universalmente</li>
                    <li><strong>Consejo:</strong> Mide ambos pies y usa la medida mayor</li>
                  </ul>
                </div>

                <div className={styles.conversionCard}>
                  <h3>💍 Complementos</h3>
                  <ul>
                    <li><strong>Anillos:</strong> ES: 10-24, US: 0-13, UK: J-Z</li>
                    <li><strong>Gorros:</strong> Circunferencia craneal en cm</li>
                    <li><strong>Guantes:</strong> Longitud de mano en cm o letras</li>
                    <li><strong>Cinturones:</strong> Longitud total en cm/pulgadas</li>
                    <li><strong>Medición clave:</strong> Diámetro interior para anillos</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Sección 3: Guía de Medición */}
            <section className={styles.guideSection}>
              <h2>Cómo Medir Correctamente</h2>

              <div className={styles.measuringGrid}>
                <div className={styles.measureCategory}>
                  <h3>📏 Medidas Corporales</h3>
                  <div className={styles.measuresList}>
                    <div className={styles.measureItem}>
                      <h4>Pecho/Busto</h4>
                      <p>
                        Mide la parte más ancha del pecho con los brazos relajados. La cinta debe estar
                        horizontal y ajustada pero sin apretar.
                      </p>
                    </div>
                    <div className={styles.measureItem}>
                      <h4>Cintura</h4>
                      <p>
                        Parte más estrecha del torso, generalmente a la altura del ombligo. Mide sin meter la barriga.
                      </p>
                    </div>
                    <div className={styles.measureItem}>
                      <h4>Cadera</h4>
                      <p>
                        Parte más ancha de las caderas, incluyendo los glúteos. La cinta debe estar horizontal.
                      </p>
                    </div>
                    <div className={styles.measureItem}>
                      <h4>Largo de Brazo</h4>
                      <p>
                        Desde el hombro hasta la muñeca con el brazo ligeramente flexionado.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.measureCategory}>
                  <h3>👟 Medidas de Pie</h3>
                  <div className={styles.measuresList}>
                    <div className={styles.measureItem}>
                      <h4>Longitud</h4>
                      <p>
                        Desde el talón hasta el dedo más largo. Hazlo de pie y con peso distribuido.
                      </p>
                    </div>
                    <div className={styles.measureItem}>
                      <h4>Ancho</h4>
                      <p>
                        La parte más ancha del pie, generalmente a la altura de los metatarsos.
                      </p>
                    </div>
                    <div className={styles.measureItem}>
                      <h4>Momento del día</h4>
                      <p>
                        Por la tarde cuando el pie está más hinchado. Mide ambos pies y usa la medida mayor.
                      </p>
                    </div>
                    <div className={styles.measureItem}>
                      <h4>Con calcetines</h4>
                      <p>
                        Usa el tipo de calcetín que planeas llevar con esos zapatos.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.measureCategory}>
                  <h3>💍 Medidas de Complementos</h3>
                  <div className={styles.measuresList}>
                    <div className={styles.measureItem}>
                      <h4>Anillos</h4>
                      <p>
                        Diámetro interior de un anillo que te quede bien, o circunferencia del dedo con hilo.
                      </p>
                    </div>
                    <div className={styles.measureItem}>
                      <h4>Guantes</h4>
                      <p>
                        Circunferencia de la mano en la parte más ancha, excluyendo el pulgar.
                      </p>
                    </div>
                    <div className={styles.measureItem}>
                      <h4>Gorros</h4>
                      <p>
                        Circunferencia de la cabeza 2cm por encima de las orejas y cejas.
                      </p>
                    </div>
                    <div className={styles.measureItem}>
                      <h4>Cinturones</h4>
                      <p>
                        Medida de la cintura donde llevas habitualmente el cinturón, no la talla del pantalón.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Sección 4: FAQ */}
            <section className={styles.guideSection}>
              <h2>Preguntas Frecuentes sobre Tallas</h2>

              <div className={styles.faqContainer}>
                <div className={styles.faqItem}>
                  <h4>¿Por qué una talla M americana no es igual a una M europea?</h4>
                  <p>
                    Cada país desarrolló sus estándares basándose en las características físicas promedio de su población.
                    Las tallas americanas suelen ser más amplias que las europeas debido a diferencias en la constitución
                    física promedio y en los estándares de la industria textil.
                  </p>
                </div>

                <div className={styles.faqItem}>
                  <h4>¿Cómo sé si una marca talla grande o pequeño?</h4>
                  <p>
                    Lee las reseñas de otros compradores, ya que suelen mencionar el ajuste real. Marcas asiáticas
                    típicamente tallan 1-2 números más pequeñas. Marcas deportivas pueden tallar diferente que ropa casual.
                  </p>
                </div>

                <div className={styles.faqItem}>
                  <h4>¿Qué hago si estoy entre dos tallas?</h4>
                  <p>
                    Considera el tipo de prenda: para ropa ajustada elige la mayor, para oversize la menor. Para calzado,
                    elige la mayor si tienes pies anchos, la menor si son estrechos. Siempre consulta las medidas en centímetros.
                  </p>
                </div>

                <div className={styles.faqItem}>
                  <h4>¿Las tallas de hombre y mujer se convierten igual?</h4>
                  <p>
                    No, tienen sistemas diferentes. En calzado, las tallas de mujer son típicamente 1.5-2 números menores
                    que las de hombre para el mismo pie. En ropa, los sistemas son completamente diferentes.
                  </p>
                </div>

                <div className={styles.faqItem}>
                  <h4>¿Cómo afecta el material a la talla?</h4>
                  <p>
                    Materiales elásticos (lycra, spandex) permiten más flexibilidad en el tallaje. Materiales rígidos
                    (denim sin elastano, cuero) requieren tallas más precisas. Tejidos que encogen (algodón 100%) pueden
                    requerir una talla mayor.
                  </p>
                </div>
              </div>
            </section>

            {/* Sección 5: Consejos por Tipo de Compra */}
            <section className={styles.guideSection}>
              <h2>Consejos Específicos por Tipo de Compra</h2>

              <div className={styles.shoppingGrid}>
                <div className={styles.shoppingCard}>
                  <h3>🛍️ Ropa Casual</h3>
                  <ul>
                    <li>Las tallas de letra (S, M, L) son más permisivas</li>
                    <li>Marcas fast-fashion suelen tallar más grande</li>
                    <li>Ropa deportiva puede tallar diferente que casual</li>
                    <li>Considera el fit deseado: ajustado vs holgado</li>
                  </ul>
                </div>

                <div className={styles.shoppingCard}>
                  <h3>👔 Ropa Formal</h3>
                  <ul>
                    <li>Usa siempre medidas corporales exactas</li>
                    <li>Los trajes requieren ajustes profesionales</li>
                    <li>Camisas formales se miden por cuello y manga</li>
                    <li>Considera el uso de corbata en camisas</li>
                  </ul>
                </div>

                <div className={styles.shoppingCard}>
                  <h3>👟 Calzado Deportivo</h3>
                  <ul>
                    <li>Suele tallar 0.5-1 número más grande</li>
                    <li>Considera el grosor del calcetín deportivo</li>
                    <li>Para running, deja espacio para el dedo gordo</li>
                    <li>Diferentes marcas pueden variar significativamente</li>
                  </ul>
                </div>

                <div className={styles.shoppingCard}>
                  <h3>👠 Calzado Formal</h3>
                  <ul>
                    <li>Debe quedar ajustado pero cómodo</li>
                    <li>Considera el ancho del pie, no solo el largo</li>
                    <li>Los tacones requieren más precisión en la talla</li>
                    <li>Materiales rígidos no ceden con el uso</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
