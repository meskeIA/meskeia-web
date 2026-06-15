'use client';
// @disclaimer: exempt

import { useState, useCallback, useMemo } from 'react';
import styles from './CifradoPlayfair.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type ModoType = 'cifrar' | 'descifrar';

export default function CifradoPlayfairPage() {
  const [modo, setModo] = useState<ModoType>('cifrar');
  const [texto, setTexto] = useState('');
  const [clave, setClave] = useState('SECRETO');
  const [resultado, setResultado] = useState('');
  const [digramasResaltados, setDigramasResaltados] = useState<[string, string][]>([]);
  const [copiado, setCopiado] = useState(false);

  // Estados para HTML code generation
  const [htmlCode, setHtmlCode] = useState('');
  const [htmlExpanded, setHtmlExpanded] = useState(false);
  const [htmlCopiado, setHtmlCopiado] = useState(false);

  // Generar matriz 5x5 a partir de la clave
  const generarMatriz = (clave: string): string[][] => {
    // Normalizar: mayúsculas, sin espacios, J→I
    const claveNorm = clave.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    const alfabeto = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // Sin J

    // Construir secuencia única
    let secuencia = '';
    for (const char of claveNorm + alfabeto) {
      if (!secuencia.includes(char)) {
        secuencia += char;
      }
    }

    // Crear matriz 5x5
    const matriz: string[][] = [];
    for (let i = 0; i < 5; i++) {
      matriz.push(secuencia.slice(i * 5, (i + 1) * 5).split(''));
    }

    return matriz;
  };

  // Encontrar posición de una letra en la matriz
  const encontrarPosicion = (matriz: string[][], letra: string): [number, number] => {
    const letraNorm = letra.toUpperCase().replace('J', 'I');
    for (let fila = 0; fila < 5; fila++) {
      for (let col = 0; col < 5; col++) {
        if (matriz[fila][col] === letraNorm) {
          return [fila, col];
        }
      }
    }
    return [-1, -1];
  };

  // Preparar texto en digramas
  const prepararDigramas = (texto: string): string[] => {
    // Normalizar: mayúsculas, solo letras, J→I
    let textoNorm = texto.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');

    // Insertar X entre letras repetidas y al final si es impar
    let digramas: string[] = [];
    let i = 0;

    while (i < textoNorm.length) {
      const primera = textoNorm[i];
      const segunda = textoNorm[i + 1] || 'X';

      if (primera === segunda) {
        digramas.push(primera + 'X');
        i += 1;
      } else {
        digramas.push(primera + segunda);
        i += 2;
      }
    }

    // Si el último digrama tiene solo una letra, añadir X
    if (digramas.length > 0) {
      const ultimo = digramas[digramas.length - 1];
      if (ultimo.length === 1) {
        digramas[digramas.length - 1] = ultimo + 'X';
      }
    }

    return digramas;
  };

  // Cifrar un digrama
  const cifrarDigrama = (matriz: string[][], digrama: string, descifrar: boolean = false): string => {
    const [fila1, col1] = encontrarPosicion(matriz, digrama[0]);
    const [fila2, col2] = encontrarPosicion(matriz, digrama[1]);

    if (fila1 === -1 || fila2 === -1) return digrama;

    let nueva1: string, nueva2: string;
    const desplazamiento = descifrar ? -1 : 1;

    if (fila1 === fila2) {
      // Misma fila: mover a la derecha (cifrar) o izquierda (descifrar)
      nueva1 = matriz[fila1][(col1 + desplazamiento + 5) % 5];
      nueva2 = matriz[fila2][(col2 + desplazamiento + 5) % 5];
    } else if (col1 === col2) {
      // Misma columna: mover abajo (cifrar) o arriba (descifrar)
      nueva1 = matriz[(fila1 + desplazamiento + 5) % 5][col1];
      nueva2 = matriz[(fila2 + desplazamiento + 5) % 5][col2];
    } else {
      // Rectángulo: intercambiar columnas
      nueva1 = matriz[fila1][col2];
      nueva2 = matriz[fila2][col1];
    }

    return nueva1 + nueva2;
  };

  // Procesar texto
  const procesar = () => {
    if (!texto.trim() || !clave.trim()) return;

    const matriz = generarMatriz(clave);
    const digramas = prepararDigramas(texto);
    const descifrar = modo === 'descifrar';

    const resultadoDigramas = digramas.map(d => cifrarDigrama(matriz, d, descifrar));
    const resJoin = resultadoDigramas.join(' ');
    setResultado(resJoin);
    setDigramasResaltados(digramas.map((d, i) => [d, resultadoDigramas[i]]));
    generarCodigoHTML(resJoin, clave.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, ''));
  };

  // Matriz calculada
  const matriz = useMemo(() => generarMatriz(clave), [clave]);

  // Generar código HTML exportable
  const generarCodigoHTML = useCallback((res: string, clv: string) => {
    if (!res) { setHtmlCode(''); return; }

    let codigo = `<!-- Cifrado Playfair - generado con meskeIA -->\n\n`;
    codigo += `<!-- Clave usada: ${clv} -->\n`;
    codigo += `<div class="mensaje-playfair">\n`;
    codigo += `  <p class="etiqueta">Cifrado Playfair · Clave: <strong>${clv}</strong></p>\n`;
    codigo += `  <p class="texto-cifrado">${res}</p>\n`;
    codigo += `  <p class="sin-espacios">Sin espacios: ${res.replace(/\s/g, '')}</p>\n`;
    codigo += `</div>\n\n`;
    codigo += `<!-- CSS recomendado -->\n`;
    codigo += `<style>\n`;
    codigo += `  .mensaje-playfair {\n`;
    codigo += `    font-family: 'Courier New', monospace;\n`;
    codigo += `    background: #f0f4f8;\n`;
    codigo += `    border-left: 4px solid #2E86AB;\n`;
    codigo += `    padding: 1rem 1.5rem;\n`;
    codigo += `    border-radius: 8px;\n`;
    codigo += `  }\n`;
    codigo += `  .etiqueta { color: #666; font-size: 0.85rem; margin: 0 0 0.5rem; }\n`;
    codigo += `  .texto-cifrado { color: #1A1A1A; font-size: 1.1rem; margin: 0 0 0.25rem; letter-spacing: 2px; }\n`;
    codigo += `  .sin-espacios { color: #666; font-size: 0.85rem; margin: 0; }\n`;
    codigo += `</style>\n`;

    setHtmlCode(codigo);
  }, []);

  // Copiar resultado
  const copiarResultado = async () => {
    if (resultado) {
      await navigator.clipboard.writeText(resultado.replace(/\s/g, ''));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const copiarCodigoHTML = async () => {
    if (htmlCode) {
      await navigator.clipboard.writeText(htmlCode);
      setHtmlCopiado(true);
      setTimeout(() => setHtmlCopiado(false), 2000);
    }
  };

  // Limpiar
  const limpiar = () => {
    setTexto('');
    setResultado('');
    setDigramasResaltados([]);
    setHtmlCode('');
    setHtmlExpanded(false);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Cifrado Playfair</h1>
        <p className={styles.subtitle}>
          Cifrado por pares de letras con matriz 5x5
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Configuración */}
        <section className={styles.configPanel}>
          <div className={styles.modoSelector}>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'cifrar' ? styles.active : ''}`}
              onClick={() => setModo('cifrar')}
              aria-pressed={modo === 'cifrar'}
            >
              <span aria-hidden="true">🔒</span> Cifrar
            </button>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'descifrar' ? styles.active : ''}`}
              onClick={() => setModo('descifrar')}
              aria-pressed={modo === 'descifrar'}
            >
              <span aria-hidden="true">🔓</span> Descifrar
            </button>
          </div>

          <div className={styles.configItem}>
            <label className={styles.label}>Palabra clave</label>
            <input
              type="text"
              value={clave}
              onChange={(e) => setClave(e.target.value.toUpperCase())}
              placeholder="Ej: MONARQUIA"
              className={styles.input}
              maxLength={25}
            />
            <span className={styles.hint}>
              Define el orden de la matriz (la J se trata como I)
            </span>
          </div>
        </section>

        {/* Matriz 5x5 */}
        <section className={styles.matrizPanel}>
          <h2 className={styles.sectionTitle}>Matriz Playfair</h2>
          <div className={styles.matrizContainer}>
            <table className={styles.matriz}>
              <tbody>
                {matriz.map((fila, i) => (
                  <tr key={i}>
                    {fila.map((letra, j) => (
                      <td key={j} className={styles.celda}>
                        {letra}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.matrizHint}>
            Clave: <strong>{clave.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '') || 'ninguna'}</strong>
          </p>
        </section>

        {/* Entrada de texto */}
        <section className={styles.inputPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.sectionTitle}>
              Texto a {modo === 'cifrar' ? 'cifrar' : 'descifrar'}
            </h2>
            <button type="button" onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={modo === 'cifrar'
              ? 'Escribe tu mensaje secreto...'
              : 'Pega los digramas cifrados...'}
            className={styles.textArea}
            rows={4}
          />
          <button
            type="button"
            onClick={procesar}
            className={styles.btnPrimary}
            disabled={!texto.trim() || !clave.trim()}
          >
            {modo === 'cifrar' ? <><span aria-hidden="true">🔒</span> Cifrar</> : <><span aria-hidden="true">🔓</span> Descifrar</>}
          </button>
        </section>

        {/* Digramas procesados */}
        {digramasResaltados.length > 0 && (
          <section className={styles.digramasPanel} role="status" aria-live="polite" aria-atomic="true">
            <h2 className={styles.sectionTitle}>Proceso de {modo === 'cifrar' ? 'cifrado' : 'descifrado'}</h2>
            <div className={styles.digramasGrid}>
              {digramasResaltados.map(([original, cifrado], i) => (
                <div key={i} className={styles.digramaItem}>
                  <span className={styles.digramaOriginal}>{original}</span>
                  <span className={styles.digramaFlecha}>→</span>
                  <span className={styles.digramaCifrado}>{cifrado}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Resultado */}
        {resultado && (
          <section className={styles.resultPanel} role="status" aria-live="polite" aria-atomic="true">
            <div className={styles.panelHeader}>
              <h2 className={styles.sectionTitle}>Resultado</h2>
              <button type="button" onClick={copiarResultado} className={styles.btnCopy}>
                {copiado ? <><span aria-hidden="true">✅</span> Copiado</> : <><span aria-hidden="true">📋</span> Copiar</>}
              </button>
            </div>
            <div className={styles.resultBox}>
              {resultado}
            </div>
            <p className={styles.resultHint}>
              Sin espacios: {resultado.replace(/\s/g, '')}
            </p>
          </section>
        )}

        {/* ========== HTML CODE GENERATION ========== */}
        {htmlCode && (
          <div className={styles.htmlCodeSection}>
            <button
              type="button"
              className={styles.htmlToggleBtn}
              onClick={() => setHtmlExpanded(!htmlExpanded)}
            >
              <span>{htmlExpanded ? '▲' : '▼'} Exportar como código HTML</span>
              <span className={styles.htmlBadge}>Nuevo</span>
            </button>

            {htmlExpanded && (
              <div className={styles.htmlCodeContent}>
                <p className={styles.htmlDescription}>
                  Copia este código HTML para incrustar el mensaje cifrado en cualquier página web:
                </p>
                <pre className={styles.htmlPre}>{htmlCode}</pre>
                <button type="button" onClick={copiarCodigoHTML} className={styles.btnCopyHtml}>
                  {htmlCopiado ? <><span aria-hidden="true">✅</span> ¡Copiado!</> : <><span aria-hidden="true">📋</span> Copiar código HTML</>}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reglas */}
        <section className={styles.reglasPanel}>
          <h3>Reglas del cifrado Playfair</h3>
          <div className={styles.reglasList}>
            <div className={styles.regla}>
              <span className={styles.reglaIcon}>↔</span>
              <div>
                <strong>Misma fila</strong>
                <p>Cada letra se reemplaza por la siguiente a su derecha (circular)</p>
              </div>
            </div>
            <div className={styles.regla}>
              <span className={styles.reglaIcon}>↕</span>
              <div>
                <strong>Misma columna</strong>
                <p>Cada letra se reemplaza por la siguiente hacia abajo (circular)</p>
              </div>
            </div>
            <div className={styles.regla}>
              <span className={styles.reglaIcon}>▢</span>
              <div>
                <strong>Rectángulo</strong>
                <p>Cada letra se reemplaza por la de su fila en la columna de la otra</p>
              </div>
            </div>
            <div className={styles.regla}>
              <span className={styles.reglaIcon}>XX</span>
              <div>
                <strong>Letras repetidas</strong>
                <p>Se inserta una X entre letras iguales consecutivas</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ========== SECCIÓN EDUCATIVA ========== */}
      <EducationalSection
        title="¿Quieres aprender más sobre el cifrado Playfair?"
        subtitle="Historia, reglas, uso militar y análisis de este ingenioso cifrado de digramas"
      >
        {/* ========== SECCIÓN 1: TABLA COMPARATIVA ========== */}
        <section className={styles.comparativaSection}>
          <h2><span aria-hidden="true">📊</span> Playfair vs otros cifrados clásicos</h2>
          <p className={styles.comparativaSubtitle}>
            Comparativa entre los principales cifrados de la era pre-computacional
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th><span aria-hidden="true">👑</span> César</th>
                  <th><span aria-hidden="true">🌊</span> Vigenère</th>
                  <th><span aria-hidden="true">🔲</span> Playfair</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Unidad de cifrado</td>
                  <td>Letra</td>
                  <td>Letra</td>
                  <td>Par de letras (digrama)</td>
                </tr>
                <tr>
                  <td>Clave</td>
                  <td>Número (1-25)</td>
                  <td>Palabra</td>
                  <td>Palabra (matriz 5x5)</td>
                </tr>
                <tr>
                  <td>Resistencia a frecuencias</td>
                  <td className={styles.tdNegative}>Nula</td>
                  <td className={styles.tdWarning}>Parcial</td>
                  <td className={styles.tdPositive}>Buena</td>
                </tr>
                <tr>
                  <td>Unidades posibles a analizar</td>
                  <td>26 letras</td>
                  <td>26 letras</td>
                  <td>600 digramas</td>
                </tr>
                <tr>
                  <td>Uso militar real</td>
                  <td className={styles.tdNegative}>No</td>
                  <td className={styles.tdWarning}>Limitado</td>
                  <td className={styles.tdPositive}>Sí (WWI, WWII)</td>
                </tr>
                <tr>
                  <td>Seguridad actual</td>
                  <td className={styles.tdNegative}>Nula</td>
                  <td className={styles.tdNegative}>Nula</td>
                  <td className={styles.tdNegative}>Nula</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========== SECCIÓN 2: HISTORIA ========== */}
        <section className={styles.infoSection}>
          <h2><span aria-hidden="true">🏛️</span> Historia del cifrado Playfair</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3><span aria-hidden="true">📜</span> Origen (1854)</h3>
              <p>
                Inventado por <strong>Charles Wheatstone</strong>, físico inglés conocido
                también por el puente de Wheatstone, pero popularizado por su amigo
                <strong> Lord Lyon Playfair</strong>, de quien tomó el nombre erróneamente.
                Fue el primer cifrado práctico de digramas de la historia.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3><span aria-hidden="true">⚔️</span> Guerra de los Boers (1899-1902)</h3>
              <p>
                Los británicos adoptaron oficialmente el Playfair para comunicaciones
                de campo durante la Guerra de los Boers en Sudáfrica. Su rapidez de
                uso manual sin equipo especial lo hacía ideal para mensajes urgentes
                en condiciones de combate.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3><span aria-hidden="true">🌍</span> Primera y Segunda Guerra Mundial</h3>
              <p>
                Se usó ampliamente en la WWI por las fuerzas aliadas. En la WWII,
                Australia lo mantuvo para comunicaciones tácticas de nivel bajo.
                El famoso mensaje del teniente John F. Kennedy en el Pacífico sur
                (1943) fue transmitido usando Playfair.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3><span aria-hidden="true">🔓</span> Primera ruptura documentada</h3>
              <p>
                El criptógrafo <strong>Alfred Dillwyn Knox</strong> del gobierno
                británico sistematizó métodos para romperlo durante la WWI. Con suficiente
                texto cifrado (~150 letras) y conocimiento del idioma, el análisis de
                digramas permite deducir la matriz completa.
              </p>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 3: FAQ ========== */}
        <section className={styles.faqSection}>
          <h2><span aria-hidden="true">❓</span> Preguntas frecuentes sobre Playfair</h2>
          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Por qué J se trata como I en Playfair?
              </summary>
              <p className={styles.faqAnswer}>
                El alfabeto tiene 26 letras, pero la matriz Playfair es 5×5 = 25 casillas.
                Para resolver esto, se combina I y J en una sola casilla. Históricamente
                I y J eran intercambiables en muchos idiomas europeos, y en inglés la
                confusión rara vez afecta la comprensión del mensaje.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Por qué se insertan X entre letras iguales?
              </summary>
              <p className={styles.faqAnswer}>
                El cifrado Playfair requiere que los dos caracteres de cada digrama sean
                diferentes. Si un par tiene letras iguales (ej. «LL»), se inserta una X
                (formando «LX» y «L» al inicio del siguiente digrama). Esto evita el caso
                especial donde la regla de «misma columna» produciría el mismo resultado.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Cuántos digramas posibles hay y por qué eso es importante?
              </summary>
              <p className={styles.faqAnswer}>
                Con 25 letras (sin J), hay 25×24 = 600 digramas posibles. El análisis de
                frecuencias clásico funciona sobre 26 letras. Al elevar el problema a 600
                unidades, se necesita mucho más texto cifrado para encontrar patrones
                estadísticos. Un texto corto de Playfair es mucho más difícil de romper
                que el mismo texto en César.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Cuánto texto se necesita para romper Playfair?
              </summary>
              <p className={styles.faqAnswer}>
                Con texto en inglés, se necesitan aproximadamente 150-300 letras para
                un ataque estadístico exitoso. Los criptanalistas de la WWI estimaban
                que mensajes de más de 200 caracteres podían resolverse en pocas horas
                con técnicas manuales. Los ordenadores modernos lo rompen en segundos
                con cualquier cantidad de texto.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                ¿Playfair es reversible perfectamente?
              </summary>
              <p className={styles.faqAnswer}>
                Casi. El proceso de descifrado recupera el texto original, pero con las X
                insertadas. Por ejemplo, «BALLOON» se convierte en «BA LX LO ON» al
                preparar digramas (la doble L requiere una X). Al descifrar, el receptor
                debe inferir dónde estaban las X insertadas por contexto.
              </p>
            </details>
          </div>
        </section>

        {/* ========== SECCIÓN 4: REGLAS DETALLADAS ========== */}
        <section className={styles.reglasDetalladasSection}>
          <h2><span aria-hidden="true">🔲</span> Las tres reglas de cifrado en detalle</h2>
          <div className={styles.reglasGrid}>
            <div className={styles.reglaDetallada}>
              <div className={styles.reglaNum}>↔</div>
              <h3>Misma fila</h3>
              <p>Si ambas letras están en la misma fila de la matriz, cada una se reemplaza
              por la letra inmediatamente a su derecha (con wrap circular: Z vuelve al inicio).</p>
              <div className={styles.reglaEjemplo}>
                <span>HI → IK</span>
                <span className={styles.reglaHint}>(si H, I, K están en la misma fila)</span>
              </div>
            </div>
            <div className={styles.reglaDetallada}>
              <div className={styles.reglaNum}>↕</div>
              <h3>Misma columna</h3>
              <p>Si ambas letras están en la misma columna, cada una se reemplaza por
              la letra inmediatamente debajo (con wrap circular).</p>
              <div className={styles.reglaEjemplo}>
                <span>AM → FK</span>
                <span className={styles.reglaHint}>(si A, M, F, K están en la misma columna)</span>
              </div>
            </div>
            <div className={styles.reglaDetallada}>
              <div className={styles.reglaNum}>▢</div>
              <h3>Rectángulo</h3>
              <p>Si las letras forman un rectángulo en la matriz, cada una se reemplaza
              por la letra de su misma fila pero en la columna de la otra letra del par.</p>
              <div className={styles.reglaEjemplo}>
                <span>DE → BH</span>
                <span className={styles.reglaHint}>(D→columna de E, E→columna de D)</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 5: CONSEJOS ========== */}
        <section className={styles.tipsSection}>
          <h2><span aria-hidden="true">💡</span> Consejos para usar Playfair correctamente</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔑</span>
              <div>
                <strong>Claves sin letras repetidas</strong>
                <p>Las repeticiones en la clave se eliminan al construir la matriz. «SECRETO» solo aporta las letras únicas S-E-C-R-T-O. Una clave más variada crea una matriz más impredecible.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔤</span>
              <div>
                <strong>Recuerda la regla I=J</strong>
                <p>Al descifrar un mensaje, recuerda que la I puede representar tanto I como J. El contexto del mensaje permite distinguir: «BANIO» vs «BANJO» según tiene sentido.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <div>
                <strong>Mensajes cortos son más seguros</strong>
                <p>Con menos de 100 caracteres, el análisis estadístico de digramas tiene poca muestra. Para uso lúdico, mantén los mensajes cortos y cambia la clave frecuentemente.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎭</span>
              <div>
                <strong>Ideal para puzzles y escape rooms</strong>
                <p>La matriz 5x5 visible añade un elemento visual atractivo. Los participantes pueden reconstruir la matriz manualmente, lo que lo hace perfecto para actividades educativas y juegos de enigmas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECCIÓN 6: WARNING BOX ========== */}
        <div className={styles.warningBox}>
          <h2><span aria-hidden="true">⚠️</span> Errores frecuentes con el cifrado Playfair</h2>
          <ul className={styles.warningList}>
            <li className={styles.warningItem}>
              <span className={styles.warningIcon} aria-hidden="true">🚫</span>
              <div>
                <strong>Olvidar que J se trata como I</strong>
                <p>Si envías un mensaje con J y el receptor no lo sabe, el descifrado producirá texto incomprensible. Ambas partes deben acordar esta convención antes de intercambiar mensajes.</p>
              </div>
            </li>
            <li className={styles.warningItem}>
              <span className={styles.warningIcon} aria-hidden="true">🚫</span>
              <div>
                <strong>Usarlo para datos sensibles reales</strong>
                <p>Playfair fue descifrado sistemáticamente durante la WWI (~1914). Cualquier programa moderno lo rompe en milisegundos. Para información confidencial real, usa AES-256 con una contraseña robusta.</p>
              </div>
            </li>
            <li className={styles.warningItem}>
              <span className={styles.warningIcon} aria-hidden="true">🚫</span>
              <div>
                <strong>No comunicar la clave por un canal seguro</strong>
                <p>Si el atacante captura la clave Playfair, puede descifrar todos los mensajes cifrados con ella. La seguridad de Playfair depende 100% del secreto de la clave.</p>
              </div>
            </li>
            <li className={styles.warningItem}>
              <span className={styles.warningIcon} aria-hidden="true">✅</span>
              <div>
                <strong>Uso correcto: educación, historia y juegos</strong>
                <p>Playfair es excepcional para aprender criptografía de digramas, diseñar escape rooms temáticos, recrear mensajes históricos de la WWI/WWII, y entender la evolución hacia los cifrados modernos.</p>
              </div>
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('cifrado-playfair')} />

      <ShareCard appName="cifrado-playfair" />
      <Footer appName="cifrado-playfair" />
    </div>
  );
}
