'use client';

import { useState } from 'react';
import styles from './DetectorIdioma.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Patrones de palabras frecuentes por idioma
const PATRONES_IDIOMAS: Record<string, { palabras: string[]; nombre: string; bandera: string }> = {
  es: {
    nombre: 'Español',
    bandera: '🇪🇸',
    palabras: ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'los', 'las', 'por', 'con', 'para', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'muy', 'sin', 'sobre', 'también', 'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'este', 'mí', 'antes', 'algunos', 'qué', 'unos', 'yo', 'otro', 'otras', 'otra', 'él', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar', 'estas', 'haber', 'esta', 'estaba', 'estamos', 'algunas', 'algo', 'nosotros']
  },
  en: {
    nombre: 'Inglés',
    bandera: '🇬🇧',
    palabras: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us']
  },
  fr: {
    nombre: 'Francés',
    bandera: '🇫🇷',
    palabras: ['le', 'la', 'de', 'et', 'est', 'en', 'un', 'une', 'que', 'les', 'du', 'des', 'à', 'ce', 'il', 'pas', 'je', 'ne', 'se', 'qui', 'pour', 'dans', 'au', 'son', 'sur', 'par', 'mais', 'avec', 'elle', 'ou', 'on', 'sa', 'si', 'nous', 'ses', 'plus', 'lui', 'être', 'tout', 'faire', 'comme', 'leur', 'bien', 'aussi', 'où', 'ces', 'fait', 'vous', 'encore', 'sans', 'peut', 'même', 'donc', 'très', 'entre', 'quand', 'sous', 'rien', 'autre', 'après', 'tous', 'leurs', 'cette', 'peu', 'ainsi', 'toujours', 'dont', 'chez', 'moins', 'alors', 'avoir', 'ils', 'été', 'sont', 'aux', 'mes', 'nos', 'était', 'ont', 'mon', 'été', 'avant']
  },
  de: {
    nombre: 'Alemán',
    bandera: '🇩🇪',
    palabras: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als', 'auch', 'es', 'an', 'werden', 'aus', 'er', 'hat', 'dass', 'sie', 'nach', 'wird', 'bei', 'einer', 'um', 'am', 'sind', 'noch', 'wie', 'einem', 'über', 'einen', 'so', 'zum', 'kann', 'war', 'haben', 'nur', 'oder', 'aber', 'vor', 'zur', 'bis', 'mehr', 'durch', 'man', 'sein', 'wurde', 'sei', 'dann', 'wir', 'sehr', 'zwischen', 'ob', 'ohne', 'nach', 'schon', 'mir', 'mich', 'wenn', 'immer', 'alle', 'mein', 'gibt', 'ihre']
  },
  it: {
    nombre: 'Italiano',
    bandera: '🇮🇹',
    palabras: ['di', 'che', 'è', 'e', 'la', 'il', 'un', 'a', 'per', 'in', 'una', 'mi', 'sono', 'ho', 'non', 'lo', 'ma', 'ti', 'si', 'le', 'con', 'cosa', 'se', 'io', 'come', 'da', 'ci', 'questo', 'qui', 'hai', 'bene', 'sei', 'del', 'tu', 'solo', 'al', 'me', 'era', 'tutto', 'della', 'più', 'lei', 'suo', 'sì', 'mio', 'fare', 'so', 'lui', 'stato', 'nella', 'sulla', 'quella', 'proprio', 'quando', 'tutti', 'essere', 'fatto', 'sua', 'gli', 'perché', 'noi', 'sempre', 'questa', 'hanno', 'quello', 'anche', 'fra', 'molto', 'poi', 'nel', 'cui', 'prima', 'ora', 'volta', 'mai']
  },
  pt: {
    nombre: 'Portugués',
    bandera: '🇵🇹',
    palabras: ['de', 'que', 'e', 'o', 'a', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'quem', 'nas', 'me', 'esse', 'eles', 'estão', 'você', 'tinha', 'foram', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'elas', 'havia']
  },
  nl: {
    nombre: 'Neerlandés',
    bandera: '🇳🇱',
    palabras: ['de', 'het', 'een', 'van', 'en', 'in', 'is', 'op', 'te', 'dat', 'die', 'voor', 'zijn', 'met', 'niet', 'aan', 'om', 'ook', 'als', 'maar', 'er', 'nog', 'worden', 'door', 'over', 'bij', 'werd', 'naar', 'uit', 'dan', 'tot', 'heeft', 'ze', 'kan', 'of', 'meer', 'al', 'zo', 'geen', 'zou', 'nu', 'wel', 'hun', 'jaar', 'deze', 'hebben', 'was', 'na', 'waar', 'tegen', 'onder', 'veel', 'twee', 'eerste', 'nieuwe', 'moet', 'komen', 'maken', 'zal', 'ging']
  },
  pl: {
    nombre: 'Polaco',
    bandera: '🇵🇱',
    palabras: ['i', 'w', 'nie', 'na', 'do', 'że', 'to', 'jest', 'się', 'z', 'co', 'jak', 'ale', 'po', 'tak', 'o', 'za', 'od', 'a', 'czy', 'są', 'by', 'już', 'był', 'przez', 'tylko', 'może', 'być', 'ze', 'mi', 'go', 'tego', 'tu', 'też', 'dla', 'ma', 'bo', 'je', 'jeszcze', 'mu', 'jej', 'my', 'będzie', 'jego', 'teraz', 'kiedy', 'tam', 'mnie', 'pan', 'bardzo', 'było', 'sobie', 'wszystko', 'jako', 'przed']
  },
  ru: {
    nombre: 'Ruso',
    bandera: '🇷🇺',
    palabras: ['и', 'в', 'не', 'на', 'я', 'что', 'он', 'с', 'как', 'а', 'то', 'все', 'она', 'так', 'его', 'но', 'за', 'к', 'у', 'же', 'вы', 'по', 'мне', 'это', 'ты', 'из', 'мы', 'от', 'был', 'еще', 'бы', 'было', 'ее', 'только', 'о', 'до', 'уже', 'для', 'ему', 'если', 'их', 'себя', 'который', 'когда', 'чтобы', 'ни', 'быть', 'есть', 'ли', 'при', 'нас', 'даже', 'вот', 'во', 'раз', 'после', 'об', 'может', 'между', 'там', 'над', 'под', 'чем']
  },
  ca: {
    nombre: 'Catalán',
    bandera: '🏴󠁥󠁳󠁣󠁴󠁿',
    palabras: ['de', 'i', 'el', 'la', 'que', 'a', 'en', 'un', 'és', 'per', 'amb', 'no', 'una', 'les', 'del', 'dels', 'com', 'més', 'es', 'els', 'al', 'ha', 'però', 'se', 'ser', 'va', 'tot', 'són', 'ja', 'si', 'als', 'hi', 'seu', 'quan', 'aquesta', 'molt', 'entre', 'havia', 'només', 'sobre', 'també', 'fer', 'aquest', 'seva', 'té', 'tots', 'era', 'fins', 'anys', 'altres', 'sense', 'part', 'dos', 'què', 'qual', 'forma', 'van', 'encara', 'molt', 'segons', 'tres', 'després', 'on', 'primer', 'són', 'sota']
  }
};

interface ResultadoDeteccion {
  idioma: string;
  codigo: string;
  bandera: string;
  confianza: number;
  coincidencias: number;
}

export default function DetectorIdiomaPage() {
  const [texto, setTexto] = useState('');
  const [resultados, setResultados] = useState<ResultadoDeteccion[]>([]);
  const [analizado, setAnalizado] = useState(false);

  const detectarIdioma = () => {
    if (!texto.trim()) return;

    const palabrasTexto = texto.toLowerCase()
      .replace(/[^\p{L}\s]/gu, '')
      .split(/\s+/)
      .filter(p => p.length > 1);

    const totalPalabras = palabrasTexto.length;
    if (totalPalabras === 0) return;

    const puntuaciones: ResultadoDeteccion[] = [];

    for (const [codigo, { palabras, nombre, bandera }] of Object.entries(PATRONES_IDIOMAS)) {
      let coincidencias = 0;
      for (const palabra of palabrasTexto) {
        if (palabras.includes(palabra)) {
          coincidencias++;
        }
      }

      const confianza = Math.min(100, Math.round((coincidencias / totalPalabras) * 100 * 2));

      if (coincidencias > 0) {
        puntuaciones.push({
          idioma: nombre,
          codigo,
          bandera,
          confianza,
          coincidencias
        });
      }
    }

    puntuaciones.sort((a, b) => b.confianza - a.confianza);
    setResultados(puntuaciones.slice(0, 5));
    setAnalizado(true);
  };

  const limpiar = () => {
    setTexto('');
    setResultados([]);
    setAnalizado(false);
  };

  const cargarEjemplo = (ejemplo: string) => {
    setTexto(ejemplo);
    setResultados([]);
    setAnalizado(false);
  };

  const ejemplos = [
    { texto: 'Hola, ¿cómo estás? Espero que todo esté bien contigo.', idioma: 'Español' },
    { texto: 'Hello, how are you? I hope everything is going well.', idioma: 'Inglés' },
    { texto: 'Bonjour, comment allez-vous? J\'espère que tout va bien.', idioma: 'Francés' },
    { texto: 'Guten Tag, wie geht es Ihnen? Ich hoffe, alles ist gut.', idioma: 'Alemán' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Detector de Idioma</h1>
        <p className={styles.subtitle}>
          Pega cualquier texto y descubre en qué idioma está escrito
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        <div className={styles.inputSection}>
          <label className={styles.label}>Texto a analizar</label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Pega aquí el texto del que quieres saber el idioma..."
            className={styles.textarea}
            rows={6}
          />
          <div className={styles.charCount}>
            {texto.length} caracteres · {texto.split(/\s+/).filter(p => p).length} palabras
          </div>
        </div>

        <div className={styles.buttonRow}>
          <button onClick={detectarIdioma} className={styles.btnPrimary} disabled={!texto.trim()}>
            🔍 Detectar Idioma
          </button>
          <button onClick={limpiar} className={styles.btnSecondary}>
            Limpiar
          </button>
        </div>

        {analizado && (
          <div className={styles.resultsSection}>
            <h3>Resultados del análisis</h3>
            {resultados.length > 0 ? (
              <div className={styles.resultsList}>
                {resultados.map((r, i) => (
                  <div key={r.codigo} className={`${styles.resultItem} ${i === 0 ? styles.topResult : ''}`}>
                    <div className={styles.resultMain}>
                      <span className={styles.resultFlag}>{r.bandera}</span>
                      <span className={styles.resultName}>{r.idioma}</span>
                      {i === 0 && <span className={styles.topBadge}>Más probable</span>}
                    </div>
                    <div className={styles.resultBar}>
                      <div
                        className={styles.resultFill}
                        style={{ width: `${r.confianza}%` }}
                      />
                    </div>
                    <span className={styles.resultPercent}>{r.confianza}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noResults}>
                No se pudo identificar el idioma. Prueba con un texto más largo.
              </div>
            )}
          </div>
        )}

        <div className={styles.examplesSection}>
          <h4>Probar con ejemplos:</h4>
          <div className={styles.examplesGrid}>
            {ejemplos.map((ej, i) => (
              <button
                key={i}
                onClick={() => cargarEjemplo(ej.texto)}
                className={styles.exampleBtn}
              >
                {ej.idioma}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className={styles.languagesSection}>
        <h2>Idiomas Detectables</h2>
        <div className={styles.languagesGrid}>
          {Object.entries(PATRONES_IDIOMAS).map(([codigo, { nombre, bandera }]) => (
            <div key={codigo} className={styles.languageCard}>
              <span className={styles.langFlag}>{bandera}</span>
              <span className={styles.langName}>{nombre}</span>
            </div>
          ))}
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('detector-idioma')} />

      <ShareCard appName="detector-idioma" />
      <Footer appName="detector-idioma" />
    </div>
  );
}
