'use client';

import { useMemo, useState } from 'react';
import styles from './CantidadesEvento.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';
import { TIPOS_EVENTO, calcularEvento } from '@/lib/calculadoras/cantidadesEvento';

export default function CantidadesEventoPage() {
  const [tipoId, setTipoId] = useState('comida');
  const [invitados, setInvitados] = useState('10');

  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;
  const resultado = useMemo(() => calcularEvento(tipoId, num(invitados)), [tipoId, invitados]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.title}>Cuánta comida y bebida por invitado</h1>
        <p className={styles.subtitle}>Las cantidades que preparar según el número de invitados y el tipo de evento</p>
      </header>
      <LegalNotice />
      <DisclaimerCard variant="alcohol" severity="high" collapsible={false} />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Calculadora">
          <p className={styles.bloqueLabel}>Tipo de evento</p>
          <div className={styles.tipoBtns} role="group" aria-label="Tipo de evento">
            {TIPOS_EVENTO.map((t) => (
              <button key={t.id} type="button" aria-pressed={tipoId === t.id}
                className={`${styles.tipoBtn} ${tipoId === t.id ? styles.tipoBtnActivo : ''}`}
                onClick={() => setTipoId(t.id)}>
                <span className={styles.tipoBtnNombre}><span aria-hidden="true">{t.emoji}</span> {t.nombre}</span>
              </button>
            ))}
          </div>
          <div className={styles.campo}>
            <label htmlFor="invitados" className={styles.label}>Número de invitados</label>
            <input id="invitados" type="text" inputMode="numeric" className={styles.input}
              value={invitados} onChange={(e) => setInvitados(e.target.value)} />
          </div>

          {resultado ? (
            <div className={styles.ingredientesBox} role="status" aria-live="polite">
              {resultado.map((i) => (
                <div key={i.nombre} className={styles.ingRow}><span className={styles.ingNombre}>{i.nombre}</span><span className={styles.ingCantidad}>{i.cantidad}</span></div>
              ))}
            </div>
          ) : (
            <p className={styles.placeholder}>Indica el número de invitados.</p>
          )}
          <p className={styles.fuenteNota}>Cantidades orientativas por persona (producto crudo donde aplica). Ajústalas al apetito del grupo, la duración y la hora. Ofrece siempre opciones sin alcohol.</p>
        </section>

        <EducationalSection title="Organizar sin que falte (ni sobre)" subtitle="Cómo calcular comida y bebida para un grupo">
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>El secreto está en el tipo de evento</h2>
              <p>
                No se calcula igual un aperitivo de pie que una cena sentada o una barbacoa. En el
                aperitivo manda el número de bocados; en la comida, el gramaje del plato principal; y
                en la barbacoa, la carne. A partir de ahí, todo se multiplica por el número de
                invitados. Conviene prever un pequeño margen para que no falte, pero sin pasarse, y
                priorizar platos que se puedan guardar o congelar si sobra, para no desperdiciar.
              </p>
            </div>
            <div className={styles.conceptoSection}>
              <h2>Referencias por persona</h2>
              <table className={styles.comparativaTable}>
                <thead><tr><th scope="col">Elemento</th><th scope="col">Por persona</th></tr></thead>
                <tbody>
                  <tr><td>Carne/pescado (principal)</td><td>200-250 g (comida) · 400 g (barbacoa)</td></tr>
                  <tr><td>Canapés (aperitivo)</td><td>8-12 piezas</td></tr>
                  <tr><td>Pan</td><td>60-80 g</td></tr>
                  <tr><td>Agua</td><td>0,5 L</td></tr>
                  <tr><td>Vino</td><td>~1/3 de botella</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}><span className={styles.warningIcon} aria-hidden="true">⚠️</span><strong>A tener en cuenta</strong></div>
              <ul className={styles.warningList}>
                <li><strong>Ajusta al grupo.</strong> Apetito, edad, duración y hora cambian las cantidades fácilmente un 20%.</li>
                <li><strong>Ofrece sin alcohol.</strong> Siempre agua y opciones para quien no bebe o conduce.</li>
                <li><strong>El alcohol, con moderación.</strong> Solo para mayores de edad y consumo responsable.</li>
                <li><strong>Margen, no exceso.</strong> Que no falte, pero prioriza lo que se pueda aprovechar si sobra.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('cantidades-evento')} />
      <ShareCard appName="cantidades-evento" />
      <Footer appName="cantidades-evento" />
    </div>
  );
}
