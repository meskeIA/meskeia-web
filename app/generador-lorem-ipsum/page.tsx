'use client';

import { useState } from 'react';
import styles from './GeneradorLoremIpsum.module.css';
import { MeskeiaLogo, Footer, EducationalSection } from '@/components';

// Párrafos de Lorem Ipsum clásicos
const loremIpsumParrafos = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
  'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
  'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.',
  'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.',
  'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.',
  'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.',
  'Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.',
  'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.',
  'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.',
  'Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.',
];

type FormatoType = 'parrafos' | 'oraciones' | 'palabras';

export default function GeneradorLoremIpsumPage() {
  const [cantidad, setCantidad] = useState(3);
  const [formato, setFormato] = useState<FormatoType>('parrafos');
  const [resultado, setResultado] = useState('');
  const [copiado, setCopiado] = useState(false);

  // Generar texto
  const generarTexto = () => {
    let texto = '';

    if (formato === 'parrafos') {
      const parrafos = loremIpsumParrafos.slice(0, cantidad);
      texto = parrafos.join('\n\n');
    } else if (formato === 'oraciones') {
      // Extraer oraciones de los párrafos
      const todasOraciones = loremIpsumParrafos
        .join(' ')
        .split(/(?<=[.!?])\s+/)
        .filter(Boolean);
      texto = todasOraciones.slice(0, cantidad).join(' ');
    } else if (formato === 'palabras') {
      // Extraer palabras
      const todasPalabras = loremIpsumParrafos
        .join(' ')
        .split(/\s+/)
        .map(p => p.replace(/[.,!?;:]/g, ''));
      texto = todasPalabras.slice(0, cantidad).join(' ') + '.';
    }

    setResultado(texto);
    setCopiado(false);
  };

  // Copiar al portapapeles
  const copiarTexto = async () => {
    if (!resultado) return;
    try {
      await navigator.clipboard.writeText(resultado);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Silencioso
    }
  };

  // Limpiar
  const limpiar = () => {
    setResultado('');
    setCopiado(false);
  };

  // Obtener límite según formato
  const getLimite = () => {
    switch (formato) {
      case 'parrafos': return 12;
      case 'oraciones': return 50;
      case 'palabras': return 500;
    }
  };

  // Contar estadísticas del resultado
  const getStats = () => {
    if (!resultado) return { palabras: 0, caracteres: 0, parrafos: 0 };
    return {
      palabras: resultado.split(/\s+/).filter(Boolean).length,
      caracteres: resultado.length,
      parrafos: resultado.split('\n\n').filter(Boolean).length,
    };
  };

  const stats = getStats();

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Generador Lorem Ipsum</h1>
        <p className={styles.subtitle}>
          Texto de prueba para diseño y maquetación
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de configuración */}
        <section className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>Configuración</h2>

          <div className={styles.configGrid}>
            {/* Formato */}
            <div className={styles.configItem}>
              <label className={styles.label}>Formato</label>
              <div className={styles.formatoButtons}>
                <button
                  type="button"
                  className={`${styles.formatoBtn} ${formato === 'parrafos' ? styles.active : ''}`}
                  onClick={() => { setFormato('parrafos'); setCantidad(Math.min(cantidad, 12)); }}
                >
                  📄 Párrafos
                </button>
                <button
                  type="button"
                  className={`${styles.formatoBtn} ${formato === 'oraciones' ? styles.active : ''}`}
                  onClick={() => { setFormato('oraciones'); setCantidad(Math.min(cantidad, 50)); }}
                >
                  📝 Oraciones
                </button>
                <button
                  type="button"
                  className={`${styles.formatoBtn} ${formato === 'palabras' ? styles.active : ''}`}
                  onClick={() => { setFormato('palabras'); setCantidad(Math.min(cantidad, 500)); }}
                >
                  🔤 Palabras
                </button>
              </div>
            </div>

            {/* Cantidad */}
            <div className={styles.configItem}>
              <label className={styles.label}>
                Cantidad: <strong>{cantidad}</strong> {formato}
              </label>
              <input
                type="range"
                min={1}
                max={getLimite()}
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value))}
                className={styles.slider}
                title={`Seleccionar cantidad de ${formato}`}
              />
              <div className={styles.sliderLabels}>
                <span>1</span>
                <span>{getLimite()}</span>
              </div>
            </div>
          </div>

          <div className={styles.buttonRow}>
            <button type="button" onClick={generarTexto} className={styles.btnPrimary}>
              ✨ Generar Lorem Ipsum
            </button>
            <button type="button" onClick={limpiar} className={styles.btnSecondary} disabled={!resultado}>
              Limpiar
            </button>
          </div>
        </section>

        {/* Panel de resultado */}
        <section className={styles.resultPanel}>
          <div className={styles.resultHeader}>
            <h2 className={styles.sectionTitle}>Texto generado</h2>
            <button
              type="button"
              onClick={copiarTexto}
              className={styles.btnCopy}
              disabled={!resultado}
            >
              {copiado ? '✅ Copiado' : '📋 Copiar'}
            </button>
          </div>

          <textarea
            value={resultado}
            readOnly
            placeholder="El texto Lorem Ipsum aparecerá aquí..."
            className={styles.textArea}
            rows={12}
          />

          {resultado && (
            <div className={styles.stats}>
              <span>📄 {stats.parrafos} párrafo{stats.parrafos !== 1 ? 's' : ''}</span>
              <span>📝 {stats.palabras} palabra{stats.palabras !== 1 ? 's' : ''}</span>
              <span>🔤 {stats.caracteres} carácter{stats.caracteres !== 1 ? 'es' : ''}</span>
            </div>
          )}
        </section>
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="¿Quieres saber más sobre Lorem Ipsum?"
        subtitle="Historia, usos y por qué se utiliza en diseño"
      >
        <section className={styles.infoSection}>
          <h2>Sobre Lorem Ipsum</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>📜 Historia</h3>
              <p>
                Lorem Ipsum es un texto de relleno utilizado desde el siglo XVI.
                Proviene de &quot;De Finibus Bonorum et Malorum&quot; de Cicerón (45 a.C.),
                aunque las versiones modernas están modificadas.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>🎯 ¿Por qué usarlo?</h3>
              <p>
                Al tener una distribución de letras similar al texto real,
                permite visualizar diseños sin distraer con contenido legible.
                Los lectores se centran en el diseño, no en el texto.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>💡 Usos comunes</h3>
              <p>
                • Maquetación de páginas web<br />
                • Diseño de aplicaciones<br />
                • Prototipos y wireframes<br />
                • Presentaciones de diseño<br />
                • Pruebas de tipografía
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>⚠️ Consideraciones</h3>
              <p>
                Recuerda reemplazar el Lorem Ipsum por contenido real antes
                de publicar. Un error común es dejar texto de prueba en
                producción por descuido.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <Footer appName="generador-lorem-ipsum" />
    </div>
  );
}
