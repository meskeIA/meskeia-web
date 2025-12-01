'use client';

import { useState } from 'react';
import styles from './ContadorSilabas.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

// Algoritmo de silabeo en español
const separarSilabas = (palabra: string): string[] => {
  const vocales = 'aeiouáéíóúü';
  const vocalesFuertes = 'aeoáéó';
  const vocalesDebiles = 'iuíúü';
  const consonantes = 'bcdfghjklmnñpqrstvwxyz';

  palabra = palabra.toLowerCase().trim();
  if (!palabra) return [];

  const silabas: string[] = [];
  let silabaActual = '';

  const esVocal = (c: string) => vocales.includes(c);
  const esConsonante = (c: string) => consonantes.includes(c);
  const esVocalFuerte = (c: string) => vocalesFuertes.includes(c);
  const esVocalDebil = (c: string) => vocalesDebiles.includes(c);

  // Grupos consonánticos inseparables
  const gruposInseparables = ['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tr', 'ch', 'll', 'rr'];

  for (let i = 0; i < palabra.length; i++) {
    const char = palabra[i];
    const siguiente = palabra[i + 1] || '';
    const siguiente2 = palabra[i + 2] || '';

    silabaActual += char;

    // Si es vocal, verificamos si debemos cortar
    if (esVocal(char)) {
      // Si la siguiente es consonante
      if (esConsonante(siguiente)) {
        // Ver si hay grupo consonántico
        const grupo = siguiente + siguiente2;
        const esGrupoInseparable = gruposInseparables.includes(grupo.toLowerCase());

        // Si hay dos consonantes seguidas
        if (esConsonante(siguiente2)) {
          if (esGrupoInseparable) {
            // El grupo va con la siguiente sílaba
            silabas.push(silabaActual);
            silabaActual = '';
          } else {
            // Primera consonante va con esta sílaba, segunda con la siguiente
            silabaActual += siguiente;
            silabas.push(silabaActual);
            silabaActual = '';
            i++; // Saltamos la consonante que ya añadimos
          }
        } else if (esVocal(siguiente2) || !siguiente2) {
          // Consonante simple entre vocales: va con la siguiente
          silabas.push(silabaActual);
          silabaActual = '';
        }
      }
      // Si la siguiente es vocal
      else if (esVocal(siguiente)) {
        // Verificar diptongos e hiatos
        const esDiptongo =
          (esVocalDebil(char) && esVocalFuerte(siguiente)) ||
          (esVocalFuerte(char) && esVocalDebil(siguiente)) ||
          (esVocalDebil(char) && esVocalDebil(siguiente));

        // Las vocales acentuadas en débiles rompen el diptongo (hiato)
        const tieneAcentoDebil = 'íú'.includes(char) || 'íú'.includes(siguiente);

        if (!esDiptongo || tieneAcentoDebil) {
          // Hiato: cortar aquí
          silabas.push(silabaActual);
          silabaActual = '';
        }
        // Si es diptongo, continúan juntas
      }
    }
  }

  // Añadir última sílaba si queda algo
  if (silabaActual) {
    silabas.push(silabaActual);
  }

  return silabas;
};

const contarSilabasTexto = (texto: string): { palabra: string; silabas: string[]; total: number }[] => {
  // Extraer solo palabras (ignorar números y símbolos)
  const palabras = texto.match(/[a-záéíóúüñ]+/gi) || [];

  return palabras.map(palabra => {
    const silabas = separarSilabas(palabra);
    return {
      palabra,
      silabas,
      total: silabas.length,
    };
  });
};

export default function ContadorSilabasPage() {
  const [texto, setTexto] = useState('');
  const [resultado, setResultado] = useState<{
    palabras: { palabra: string; silabas: string[]; total: number }[];
    totalSilabas: number;
    totalPalabras: number;
  } | null>(null);

  const analizar = () => {
    if (!texto.trim()) return;

    const palabrasAnalizadas = contarSilabasTexto(texto);
    const totalSilabas = palabrasAnalizadas.reduce((acc, p) => acc + p.total, 0);

    setResultado({
      palabras: palabrasAnalizadas,
      totalSilabas,
      totalPalabras: palabrasAnalizadas.length,
    });
  };

  const limpiar = () => {
    setTexto('');
    setResultado(null);
  };

  const ejemplos = [
    'murciélago',
    'electroencefalografista',
    'comunicación',
    'poesía',
    'aeropuerto',
  ];

  const cargarEjemplo = (ejemplo: string) => {
    setTexto(ejemplo);
    setResultado(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Contador de Sílabas</h1>
        <p className={styles.subtitle}>
          Separa y cuenta las sílabas de cualquier texto en español
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Introduce tu texto</h2>

          <div className={styles.inputGroup}>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribe una palabra, frase o texto completo..."
              className={styles.textarea}
              rows={6}
            />
          </div>

          <div className={styles.ejemplos}>
            <span className={styles.ejemplosLabel}>Ejemplos:</span>
            {ejemplos.map((ej) => (
              <button
                key={ej}
                onClick={() => cargarEjemplo(ej)}
                className={styles.ejemploBtn}
              >
                {ej}
              </button>
            ))}
          </div>

          <div className={styles.botones}>
            <button onClick={analizar} className={styles.btnPrimary}>
              Analizar Sílabas
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              {/* Resumen */}
              <div className={styles.resumen}>
                <div className={styles.resumenItem}>
                  <span className={styles.resumenValor}>{resultado.totalSilabas}</span>
                  <span className={styles.resumenLabel}>Sílabas totales</span>
                </div>
                <div className={styles.resumenItem}>
                  <span className={styles.resumenValor}>{resultado.totalPalabras}</span>
                  <span className={styles.resumenLabel}>Palabras</span>
                </div>
                <div className={styles.resumenItem}>
                  <span className={styles.resumenValor}>
                    {resultado.totalPalabras > 0
                      ? (resultado.totalSilabas / resultado.totalPalabras).toFixed(1)
                      : '0'}
                  </span>
                  <span className={styles.resumenLabel}>Media por palabra</span>
                </div>
              </div>

              {/* Lista de palabras */}
              <div className={styles.palabrasLista}>
                <h3>Análisis detallado</h3>
                <div className={styles.palabrasGrid}>
                  {resultado.palabras.map((p, index) => (
                    <div key={index} className={styles.palabraCard}>
                      <div className={styles.palabraOriginal}>{p.palabra}</div>
                      <div className={styles.palabraSilabas}>
                        {p.silabas.map((s, i) => (
                          <span key={i} className={styles.silaba}>
                            {s}
                            {i < p.silabas.length - 1 && <span className={styles.separador}>-</span>}
                          </span>
                        ))}
                      </div>
                      <div className={styles.palabraTotal}>
                        {p.total} {p.total === 1 ? 'sílaba' : 'sílabas'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>📝</span>
              <p>Introduce un texto para analizar sus sílabas</p>
            </div>
          )}
        </div>
      </div>

      {/* Información sobre reglas */}
      <div className={styles.reglas}>
        <h3>📚 Reglas de División Silábica en Español</h3>
        <div className={styles.reglasGrid}>
          <div className={styles.reglaCard}>
            <h4>Diptongos</h4>
            <p>
              Vocal fuerte (a, e, o) + vocal débil (i, u) = misma sílaba.
              <br />
              <em>Ejemplo: ai-re, cau-sa, pei-ne</em>
            </p>
          </div>
          <div className={styles.reglaCard}>
            <h4>Hiatos</h4>
            <p>
              Dos vocales fuertes = sílabas separadas.
              <br />
              <em>Ejemplo: po-e-ta, a-é-re-o</em>
            </p>
          </div>
          <div className={styles.reglaCard}>
            <h4>Consonantes Dobles</h4>
            <p>
              bl, br, cl, cr, dr, fl, fr, gl, gr, pl, pr, tr van juntas.
              <br />
              <em>Ejemplo: a-brir, o-tro</em>
            </p>
          </div>
          <div className={styles.reglaCard}>
            <h4>Consonante entre Vocales</h4>
            <p>
              Una consonante entre vocales va con la siguiente sílaba.
              <br />
              <em>Ejemplo: ca-sa, pe-lo</em>
            </p>
          </div>
        </div>
      </div>

      <Footer appName="contador-silabas" />
    </div>
  );
}
