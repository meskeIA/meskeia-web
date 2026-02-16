'use client';

import { useState } from 'react';
import styles from './[NombreApp].module.css';
import {
  MeskeiaLogo,
  Footer,
  NumberInput,
  ResultCard,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

export default function [NombreApp]Page() {
  const [input, setInput] = useState('');
  const [resultado, setResultado] = useState('');

  const calcular = () => {
    const num = parseSpanishNumber(input);
    const res = num * 2; // Tu lógica aquí
    setResultado(formatNumber(res, 2));
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <h1 className={styles.title}>🎯 [Título de la App]</h1>
        <p className={styles.subtitle}>[Descripción breve]</p>
      </header>

      {/* Enlaces legales RGPD */}
      <LegalNotice />

      {/* Herramienta principal */}
      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <NumberInput
            value={input}
            onChange={setInput}
            label="Valor"
            placeholder="0"
          />
          <button onClick={calcular} className={styles.btnPrimary}>
            Calcular
          </button>
        </div>

        <div className={styles.resultsPanel}>
          {resultado && (
            <ResultCard
              title="Resultado"
              value={resultado}
              variant="highlight"
              icon="✅"
            />
          )}
        </div>
      </div>

      {/* Disclaimer (si aplica: finanzas, salud, fiscal) */}
      {/*
      <DisclaimerCard
        variant="financial"
        severity="high"
        context="nombre-app"
        collapsible={true}
      />
      */}

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="📚 ¿Quieres aprender más?"
        subtitle="Descubre conceptos clave"
      >
        <section className={styles.guideSection}>
          <h2>Título</h2>
          <p>Contenido educativo...</p>
        </section>
      </EducationalSection>

      {/* Apps relacionadas */}
      <RelatedApps apps={getRelatedApps('[nombre-app]')} />

      {/* Footer */}
      <Footer appName="[nombre-app]" />
    </div>
  );
}
