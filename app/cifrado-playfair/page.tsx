'use client';

import { useState, useMemo } from 'react';
import styles from './CifradoPlayfair.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type ModoType = 'cifrar' | 'descifrar';

export default function CifradoPlayfairPage() {
  const [modo, setModo] = useState<ModoType>('cifrar');
  const [texto, setTexto] = useState('');
  const [clave, setClave] = useState('SECRETO');
  const [resultado, setResultado] = useState('');
  const [digramasResaltados, setDigramasResaltados] = useState<[string, string][]>([]);

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
    setResultado(resultadoDigramas.join(' '));
    setDigramasResaltados(digramas.map((d, i) => [d, resultadoDigramas[i]]));
  };

  // Matriz calculada
  const matriz = useMemo(() => generarMatriz(clave), [clave]);

  // Copiar resultado
  const copiarResultado = async () => {
    if (resultado) {
      await navigator.clipboard.writeText(resultado.replace(/\s/g, ''));
    }
  };

  // Limpiar
  const limpiar = () => {
    setTexto('');
    setResultado('');
    setDigramasResaltados([]);
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

      <div className={styles.mainContent}>
        {/* Configuración */}
        <section className={styles.configPanel}>
          <div className={styles.modoSelector}>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'cifrar' ? styles.active : ''}`}
              onClick={() => setModo('cifrar')}
            >
              🔒 Cifrar
            </button>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'descifrar' ? styles.active : ''}`}
              onClick={() => setModo('descifrar')}
            >
              🔓 Descifrar
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
            {modo === 'cifrar' ? '🔒 Cifrar' : '🔓 Descifrar'}
          </button>
        </section>

        {/* Digramas procesados */}
        {digramasResaltados.length > 0 && (
          <section className={styles.digramasPanel}>
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
          <section className={styles.resultPanel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.sectionTitle}>Resultado</h2>
              <button type="button" onClick={copiarResultado} className={styles.btnCopy}>
                📋 Copiar
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

      {/* Sección educativa */}
      <EducationalSection
        title="¿Quieres aprender más sobre el cifrado Playfair?"
        subtitle="Historia y aplicaciones de este ingenioso método"
      >
        <section className={styles.infoSection}>
          <h2>Historia del cifrado Playfair</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>📜 Origen (1854)</h3>
              <p>
                Inventado por <strong>Charles Wheatstone</strong>, pero promocionado por
                su amigo <strong>Lord Playfair</strong>, de quien tomó el nombre.
                Fue el primer cifrado práctico de digramas de la historia.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>⚔️ Uso militar</h3>
              <p>
                Usado por los británicos en la <strong>Guerra de los Boers</strong> y
                en la <strong>Primera Guerra Mundial</strong>. Los australianos lo usaron
                en la Segunda Guerra Mundial para comunicaciones tácticas.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>🔐 Por qué es más seguro</h3>
              <p>
                Al cifrar pares de letras en lugar de letras individuales, dificulta el
                análisis de frecuencias. Hay 600 digramas posibles frente a solo 26 letras.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>⚠️ Debilidades</h3>
              <p>
                Aunque más seguro que César, es vulnerable a ataques de texto conocido.
                Los digramas repetidos producen el mismo cifrado. Se descifró en la
                WWI mediante criptoanálisis.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('cifrado-playfair')} />

      <Footer appName="cifrado-playfair" />
    </div>
  );
}
