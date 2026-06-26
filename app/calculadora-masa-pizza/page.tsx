'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './CalculadoraMasaPizza.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  ESTILOS_PIZZA,
  ESTILO_POR_ID,
  calcularMasaPizza,
} from '@/lib/calculadoras/masaPizza';
import { formatNumber } from '@/lib/formatters';

export default function CalculadoraMasaPizzaPage() {
  const [estiloId, setEstiloId] = useState('napolitana');
  const [numBolas, setNumBolas] = useState('4');
  const [pesoBola, setPesoBola] = useState('250');
  const [hidratacion, setHidratacion] = useState('62');
  const [sal, setSal] = useState('2.8');
  const [levadura, setLevadura] = useState('0.3');
  const [aceite, setAceite] = useState('0');

  const aplicarEstilo = (id: string) => {
    const e = ESTILO_POR_ID[id];
    if (!e) return;
    setEstiloId(id);
    setPesoBola(String(e.pesoBola));
    setHidratacion(String(e.hidratacion));
    setSal(String(e.sal));
    setLevadura(String(e.levadura));
    setAceite(String(e.aceite));
  };

  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;

  const resultado = useMemo(
    () =>
      calcularMasaPizza({
        numBolas: num(numBolas),
        pesoBola: num(pesoBola),
        hidratacion: num(hidratacion),
        sal: num(sal),
        levadura: num(levadura),
        aceite: num(aceite),
      }),
    [numBolas, pesoBola, hidratacion, sal, levadura, aceite],
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de masa de pizza</h1>
        <p className={styles.subtitle}>
          Los gramos exactos de harina, agua, sal, levadura y aceite para tus bolas, según el
          estilo de pizza
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        {/* Estilos */}
        <section className={styles.panel} aria-label="Estilo de pizza">
          <h2 className={styles.seccionTitulo}>Elige un estilo</h2>
          <div className={styles.estilosGrid} role="group" aria-label="Estilo de pizza">
            {ESTILOS_PIZZA.map((e) => (
              <button
                key={e.id}
                type="button"
                aria-pressed={estiloId === e.id}
                className={`${styles.estiloBtn} ${estiloId === e.id ? styles.estiloBtnActivo : ''}`}
                onClick={() => aplicarEstilo(e.id)}
              >
                <span className={styles.estiloNombre}>{e.nombre}</span>
                <span className={styles.estiloDesc}>{e.descripcion}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Parámetros */}
        <section className={styles.panel} aria-label="Parámetros de la masa">
          <div className={styles.paramsGrid}>
            <div className={styles.campo}>
              <label htmlFor="numBolas" className={styles.label}>Número de bolas</label>
              <input id="numBolas" type="text" inputMode="numeric" className={styles.input}
                value={numBolas} onChange={(e) => setNumBolas(e.target.value)} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="pesoBola" className={styles.label}>Peso por bola (g)</label>
              <input id="pesoBola" type="text" inputMode="numeric" className={styles.input}
                value={pesoBola} onChange={(e) => setPesoBola(e.target.value)} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="hidratacion" className={styles.label}>Hidratación (%)</label>
              <input id="hidratacion" type="text" inputMode="decimal" className={styles.input}
                value={hidratacion} onChange={(e) => setHidratacion(e.target.value)} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="sal" className={styles.label}>Sal (%)</label>
              <input id="sal" type="text" inputMode="decimal" className={styles.input}
                value={sal} onChange={(e) => setSal(e.target.value)} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="levadura" className={styles.label}>Levadura seca (%)</label>
              <input id="levadura" type="text" inputMode="decimal" className={styles.input}
                value={levadura} onChange={(e) => setLevadura(e.target.value)} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="aceite" className={styles.label}>Aceite (%)</label>
              <input id="aceite" type="text" inputMode="decimal" className={styles.input}
                value={aceite} onChange={(e) => setAceite(e.target.value)} />
            </div>
          </div>
        </section>

        {/* Resultado */}
        {resultado ? (
          <section className={styles.resultado} aria-live="polite">
            <div className={styles.resultadoHead}>
              <h2 className={styles.resultadoTitulo}>
                <span aria-hidden="true">🍕</span> Tu masa
              </h2>
              <span className={styles.totalBadge}>
                {resultado.numBolas} bolas · {formatNumber(resultado.pesoTotal, 0)} g de masa
              </span>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th scope="col">Ingrediente</th>
                    <th scope="col">Gramos</th>
                    <th scope="col">% panadero</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.ingredientes.map((ing) => (
                    <tr key={ing.nombre} className={ing.nombre === 'Harina' ? styles.filaHarina : ''}>
                      <td className={styles.celNombre}>{ing.nombre}</td>
                      <td className={styles.celGramos}>{formatNumber(ing.gramos, ing.gramos % 1 === 0 ? 0 : 1)} g</td>
                      <td>{formatNumber(ing.porcentaje, ing.porcentaje % 1 === 0 ? 0 : 1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <p className={styles.placeholder}>Introduce el número de bolas y su peso para calcular.</p>
        )}

        {/* Contenido educativo v2.0 */}
        <EducationalSection
          title="Cómo entender la masa de pizza"
          subtitle="Hidratación, levadura, fermentación y los errores que arruinan una buena masa"
        >
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>La masa son cuatro ingredientes y unas proporciones</h2>
              <p>
                Una masa de pizza solo necesita harina, agua, sal y levadura (y a veces aceite). Lo
                que cambia el resultado son las proporciones, que se expresan en porcentaje del
                panadero: la harina es el 100% y el resto se mide respecto a ella. Así, decir «65%
                de hidratación» significa 65 gramos de agua por cada 100 de harina, sea cual sea la
                cantidad total. Por eso, una vez sabes los porcentajes de tu estilo favorito, puedes
                hacer una pizza o veinte sin perder el equilibrio.
              </p>
            </div>

            <div className={styles.conceptoSection}>
              <h2>Los estilos y sus proporciones</h2>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th scope="col">Estilo</th>
                    <th scope="col">Hidratación</th>
                    <th scope="col">Bola</th>
                    <th scope="col">Carácter</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Napolitana</td><td>62%</td><td>250 g</td><td>Borde alto y aireado</td></tr>
                  <tr><td>Romana fina</td><td>58%</td><td>200 g</td><td>Crujiente y fina</td></tr>
                  <tr><td>Americana (NY)</td><td>63%</td><td>280 g</td><td>Flexible, se dobla</td></tr>
                  <tr><td>Estilo pan / focaccia</td><td>75%</td><td>350 g</td><td>Esponjosa, en molde</td></tr>
                </tbody>
              </table>
            </div>

            <div className={styles.conceptoSection}>
              <h2>Claves para que salga bien</h2>
              <div className={styles.tipsGrid}>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">💧</span>
                  <h4>Más agua, miga más abierta</h4>
                  <p>Subir la hidratación da más alveolos pero una masa más pegajosa y difícil de estirar. Empieza por el 60-62% si no tienes práctica.</p>
                </div>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">⏳</span>
                  <h4>Menos levadura, más tiempo</h4>
                  <p>Una fermentación larga (24-48 h en nevera) con poca levadura desarrolla más sabor y digestibilidad que una rápida con mucha.</p>
                </div>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">🔥</span>
                  <h4>Horno al máximo</h4>
                  <p>La napolitana quiere mucho calor. Precalienta el horno y, si tienes, una piedra o acero para una base crujiente.</p>
                </div>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">🧂</span>
                  <h4>La sal no toca la levadura</h4>
                  <p>Disuelve la sal en el agua o añádela aparte de la levadura: el contacto directo la frena. Suele ir al 2-3%.</p>
                </div>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Errores frecuentes con la masa de pizza</strong>
              </div>
              <ul className={styles.warningList}>
                <li><strong>Pasarse de levadura.</strong> Demasiada levadura da sabor a fermento y una masa que se sobrefermenta antes de hornear.</li>
                <li><strong>No respetar el reposo.</strong> Una masa sin fermentar lo suficiente queda dura y poco digestiva; date al menos unas horas.</li>
                <li><strong>Estirar con rodillo la napolitana.</strong> El rodillo expulsa el aire del borde; estírala con las manos para conservar el cornicione.</li>
                <li><strong>Poco calor en el horno.</strong> Una pizza fina necesita un horno muy caliente; a baja temperatura se reseca antes de dorarse.</li>
                <li><strong>Olvidar pesar la harina.</strong> Medir «a ojo» rompe las proporciones; pesa en gramos para que el porcentaje del panadero funcione.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('calculadora-masa-pizza')} />
      <ShareCard appName="calculadora-masa-pizza" />
      <Footer appName="calculadora-masa-pizza" />
    </div>
  );
}
