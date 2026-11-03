'use client';
// @disclaimer: exempt

import { useId, useMemo, useState } from 'react';
import styles from './ConversorMoldes.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import {
  FORMAS_MOLDE,
  PRESETS_MOLDE,
  convertirMolde,
  type FormaMolde,
  type Molde,
} from '@/lib/calculadoras/conversorMoldes';
import { formatNumber, parseSpanishNumber } from '@/lib/formatters';

function MoldeControl({
  titulo,
  molde,
  onChange,
}: {
  titulo: string;
  molde: Molde;
  onChange: (m: Molde) => void;
}) {
  const baseId = useId();
  return (
    <div className={styles.moldeCard}>
      <h3 className={styles.moldeTitulo}>{titulo}</h3>
      <div className={styles.campo}>
        <label htmlFor={`${baseId}-forma`} className={styles.label}>Forma</label>
        <select
          id={`${baseId}-forma`}
          className={styles.select}
          value={molde.forma}
          onChange={(e) => onChange({ ...molde, forma: e.target.value as FormaMolde })}
        >
          {(Object.keys(FORMAS_MOLDE) as FormaMolde[]).map((f) => (
            <option key={f} value={f}>{FORMAS_MOLDE[f]}</option>
          ))}
        </select>
      </div>
      <div className={styles.dimsFila}>
        <CampoDimension
          id={`${baseId}-dim1`}
          etiqueta={molde.forma === 'redondo' ? 'Diámetro (cm)' : molde.forma === 'cuadrado' ? 'Lado (cm)' : 'Largo (cm)'}
          valor={molde.dim1}
          onValor={(n) => onChange({ ...molde, dim1: n })}
        />
        {molde.forma === 'rectangular' && (
          <CampoDimension
            id={`${baseId}-dim2`}
            etiqueta="Ancho (cm)"
            valor={molde.dim2 ?? 0}
            onValor={(n) => onChange({ ...molde, dim2: n })}
          />
        )}
      </div>
    </div>
  );
}

/** Una medida en cm: 0 si el texto no es un número mayor que 0. */
function leerCm(texto: string): number {
  const n = parseSpanishNumber(texto);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function textoDeCm(n: number): string {
  return n > 0 ? String(n).replace('.', ',') : '';
}

/**
 * Campo de una dimensión del molde (cabo C0597). Se leía con el parseo casero (cambiar la coma
 * por punto y pasarlo a parseFloat), que toma «1.500» por 1,5 y «12abc» por 12; y como el campo pintaba el número y no lo tecleado,
 * la coma de «22,5» desaparecía al escribirla y no había forma de dar un decimal. Ahora guarda el
 * texto, lo lee con parseSpanishNumber y avisa si no es un número mayor que 0.
 */
function CampoDimension({
  id,
  etiqueta,
  valor,
  onValor,
}: {
  id: string;
  etiqueta: string;
  valor: number;
  onValor: (n: number) => void;
}) {
  const [texto, setTexto] = useState(() => textoDeCm(valor));
  // Si el valor cambió desde fuera (un molde de la lista), se pinta ese; si es el que salió de
  // lo tecleado, se respeta el texto para poder escribir «22,».
  const mostrado = leerCm(texto) === valor ? texto : textoDeCm(valor);
  const invalido = mostrado.trim() !== '' && leerCm(mostrado) === 0;
  return (
    <div className={styles.campo}>
      <label htmlFor={id} className={styles.label}>{etiqueta}</label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        className={styles.input}
        value={mostrado}
        aria-invalid={invalido}
        aria-describedby={invalido ? `${id}-error` : undefined}
        onChange={(e) => {
          setTexto(e.target.value);
          onValor(leerCm(e.target.value));
        }}
      />
      <p id={`${id}-error`} className={styles.errorCampo} role="alert">
        {invalido ? 'Escribe una medida en cm mayor que 0, p. ej. 22,5' : ''}
      </p>
    </div>
  );
}

export default function ConversorMoldesPage() {
  const [origen, setOrigen] = useState<Molde>({ forma: 'redondo', dim1: 18 });
  const [destino, setDestino] = useState<Molde>({ forma: 'redondo', dim1: 24 });

  const resultado = useMemo(() => convertirMolde(origen, destino), [origen, destino]);

  const aplicarPreset = (etiqueta: string, set: (m: Molde) => void) => {
    const p = PRESETS_MOLDE.find((x) => x.etiqueta === etiqueta);
    if (p) set({ forma: p.forma, dim1: p.dim1, dim2: p.dim2 });
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor de moldes</h1>
        <p className={styles.subtitle}>
          La receta es para un molde y tú tienes otro: calcula por cuánto multiplicar los
          ingredientes según el área de la base
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Moldes">
          <div className={styles.moldesGrid}>
            <div>
              <MoldeControl titulo="Molde de la receta" molde={origen} onChange={setOrigen} />
              <select className={styles.presetSelect} aria-label="Molde habitual (origen)" defaultValue=""
                onChange={(e) => { aplicarPreset(e.target.value, setOrigen); e.currentTarget.selectedIndex = 0; }}>
                <option value="" disabled>Molde habitual…</option>
                {PRESETS_MOLDE.map((p) => <option key={p.etiqueta} value={p.etiqueta}>{p.etiqueta}</option>)}
              </select>
            </div>
            <div className={styles.flecha} aria-hidden="true">→</div>
            <div>
              <MoldeControl titulo="Molde que tienes" molde={destino} onChange={setDestino} />
              <select className={styles.presetSelect} aria-label="Molde habitual (destino)" defaultValue=""
                onChange={(e) => { aplicarPreset(e.target.value, setDestino); e.currentTarget.selectedIndex = 0; }}>
                <option value="" disabled>Molde habitual…</option>
                {PRESETS_MOLDE.map((p) => <option key={p.etiqueta} value={p.etiqueta}>{p.etiqueta}</option>)}
              </select>
            </div>
          </div>
        </section>

        {resultado ? (
          <section className={styles.resultado} aria-live="polite">
            <span className={styles.resultadoValor}>× {formatNumber(resultado.factor, 2)}</span>
            <span className={styles.resultadoTexto}>
              multiplica todos los ingredientes por este factor
            </span>
            <div className={styles.areas}>
              {formatNumber(resultado.areaOrigen, 0)} cm² → {formatNumber(resultado.areaDestino, 0)} cm²
            </div>
            <p className={styles.notaTiempo}>
              <span aria-hidden="true">⏱️</span> {resultado.notaTiempo}
            </p>
          </section>
        ) : (
          <p className={styles.placeholder}>Introduce las dimensiones de los dos moldes.</p>
        )}

        <EducationalSection
          title="Cambiar de molde sin estropear la receta"
          subtitle="Por qué manda el área de la base y cómo ajustar cantidades y tiempo"
        >
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>El secreto está en el área, no en el diámetro</h2>
              <p>
                Cuando cambias una receta de un molde a otro, lo que tienes que mantener es la altura
                de la masa, y eso depende de la superficie de la base. La superficie crece con el
                cuadrado del tamaño: un molde redondo de 24 cm no tiene «un poco más» que uno de 18,
                tiene casi el doble. Por eso, si te fías solo del diámetro, te quedas corto de masa y
                el bizcocho sale fino y seco. La herramienta calcula el área de cada molde y te da el
                factor exacto por el que multiplicar todos los ingredientes.
              </p>
            </div>

            <div className={styles.conceptoSection}>
              <h2>Equivalencias habituales</h2>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr><th scope="col">Molde</th><th scope="col">Área aprox.</th></tr>
                </thead>
                <tbody>
                  <tr><td>Redondo 18 cm</td><td>254 cm²</td></tr>
                  <tr><td>Redondo 20 cm</td><td>314 cm²</td></tr>
                  <tr><td>Redondo 24 cm</td><td>452 cm²</td></tr>
                  <tr><td>Cuadrado 20 cm</td><td>400 cm²</td></tr>
                  <tr><td>Rectangular 20 × 30 cm</td><td>600 cm²</td></tr>
                </tbody>
              </table>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>A tener en cuenta</strong>
              </div>
              <ul className={styles.warningList}>
                <li><strong>No llenes el molde hasta arriba.</strong> Llénalo hasta dos tercios para que la masa pueda subir sin desbordar.</li>
                <li><strong>El tiempo cambia con la altura.</strong> Más masa en un molde pequeño tarda más; menos masa en uno grande, menos. Comprueba con un palillo.</li>
                <li><strong>Los huevos no siempre cuadran.</strong> Si el factor pide 2,5 huevos, bate uno y mide el volumen necesario.</li>
                <li><strong>Cuidado con los moldes muy altos.</strong> Si la masa queda muy alta, baja 10 °C el horno para que el centro cuaje sin quemar el borde.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps />
      <ShareCard appName="conversor-moldes" />
      <Footer appName="conversor-moldes" />
    </div>
  );
}
