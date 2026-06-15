'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './SimuladorPagaAhorro.module.css';
import {
  MeskeiaLogo, Footer, LegalNotice, EducationalSection, RelatedApps,
  ShareCard,
} from '@/components';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Frecuencia = 'semanal' | 'mensual';

interface CategoriaGasto {
  id: string;
  nombre: string;
  icono: string;
  importe: string;
}

interface ObjetivoAhorro {
  nombre: string;
  importe: string;
}

const CATEGORIAS_INICIALES: CategoriaGasto[] = [
  { id: 'ocio', nombre: 'Ocio y salidas', icono: '🎬', importe: '' },
  { id: 'comida', nombre: 'Comida y snacks', icono: '🍕', importe: '' },
  { id: 'ropa', nombre: 'Ropa y accesorios', icono: '👕', importe: '' },
  { id: 'transporte', nombre: 'Transporte', icono: '🚌', importe: '' },
  { id: 'tecnologia', nombre: 'Apps, juegos, streaming', icono: '📱', importe: '' },
  { id: 'otros', nombre: 'Otros gastos', icono: '📦', importe: '' },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function SimuladorPagaAhorroPage() {
  const [paga, setPaga] = useState('');
  const [frecuencia, setFrecuencia] = useState<Frecuencia>('mensual');
  const [categorias, setCategorias] = useState<CategoriaGasto[]>(CATEGORIAS_INICIALES);
  const [objetivo, setObjetivo] = useState<ObjetivoAhorro>({ nombre: '', importe: '' });

  const parse = (v: string) => parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;

  const pagaMensual = useMemo(() => {
    const val = parse(paga);
    return frecuencia === 'semanal' ? val * 4.33 : val;
  }, [paga, frecuencia]);

  const totalGastos = useMemo(() =>
    categorias.reduce((sum, c) => sum + parse(c.importe), 0)
  , [categorias]);

  const gastosMensual = frecuencia === 'semanal' ? totalGastos * 4.33 : totalGastos;
  const sobrante = pagaMensual - gastosMensual;
  const objetivoImporte = parse(objetivo.importe);
  const mesesParaObjetivo = sobrante > 0 && objetivoImporte > 0
    ? Math.ceil(objetivoImporte / sobrante)
    : null;
  const porcentajeAhorro = pagaMensual > 0 ? (sobrante / pagaMensual) * 100 : 0;

  const updateCategoria = (id: string, importe: string) => {
    setCategorias(prev => prev.map(c => c.id === id ? { ...c, importe } : c));
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">🐷</span>
          <h1 className={styles.title}>Simulador de Paga y Ahorro</h1>
          <p className={styles.subtitle}>
            Aprende a gestionar tu dinero: distribuye tu paga, controla gastos y ahorra para tus objetivos
          </p>
        </header>

        <LegalNotice />

        <div className={styles.mainContent}>
          {/* ── Panel izquierdo ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Tu paga</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>¿Cada cuánto recibes tu paga?</label>
              <div className={styles.switchRow}>
                <button type="button" className={`${styles.switchBtn} ${frecuencia === 'semanal' ? styles.switchActivo : ''}`} onClick={() => setFrecuencia('semanal')}>Semanal</button>
                <button type="button" className={`${styles.switchBtn} ${frecuencia === 'mensual' ? styles.switchActivo : ''}`} onClick={() => setFrecuencia('mensual')}>Mensual</button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="paga">Importe de tu paga (€)</label>
              <input
                id="paga"
                type="text"
                inputMode="decimal"
                className={styles.input}
                placeholder={frecuencia === 'semanal' ? 'Ej: 20' : 'Ej: 80'}
                value={paga}
                onChange={e => setPaga(e.target.value)}
              />
            </div>

            <h3 className={styles.subTitle}>¿En qué gastas? ({frecuencia === 'semanal' ? 'por semana' : 'al mes'})</h3>

            {categorias.map(cat => (
              <div key={cat.id} className={styles.gastoRow}>
                <span className={styles.gastoIcono} aria-hidden="true">{cat.icono}</span>
                <span className={styles.gastoNombre}>{cat.nombre}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  className={styles.gastoInput}
                  placeholder="0"
                  value={cat.importe}
                  onChange={e => updateCategoria(cat.id, e.target.value)}
                  aria-label={`Gasto en ${cat.nombre}`}
                />
                <span className={styles.gastoEuro}>€</span>
              </div>
            ))}

            <div className={styles.objetivoSection}>
              <h3 className={styles.subTitle}>Objetivo de ahorro (opcional)</h3>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Ej: Auriculares, viaje, bici..."
                  value={objetivo.nombre}
                  onChange={e => setObjetivo(prev => ({ ...prev, nombre: e.target.value }))}
                  aria-label="Nombre del objetivo"
                />
              </div>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  inputMode="decimal"
                  className={styles.input}
                  placeholder="Precio del objetivo (€)"
                  value={objetivo.importe}
                  onChange={e => setObjetivo(prev => ({ ...prev, importe: e.target.value }))}
                  aria-label="Importe del objetivo"
                />
              </div>
            </div>
          </div>

          {/* ── Panel derecho: resultados ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Tu resumen</h2>

            {pagaMensual <= 0 ? (
              <p className={styles.placeholder}>Introduce tu paga para ver el resumen</p>
            ) : (
              <div className={styles.resultados}>
                {/* Barra visual */}
                <div className={styles.barraContainer}>
                  <div className={styles.barraLabel}>
                    <span>Gastos</span>
                    <span>Sobrante</span>
                  </div>
                  <div className={styles.barra}>
                    <div
                      className={styles.barraGastos}
                      style={{ width: `${Math.min((gastosMensual / pagaMensual) * 100, 100)}%` }}
                    />
                  </div>
                  <div className={styles.barraLabel}>
                    <span>{formatCurrency(gastosMensual)}</span>
                    <span className={sobrante >= 0 ? styles.positivo : styles.negativo}>
                      {formatCurrency(Math.abs(sobrante))}
                    </span>
                  </div>
                </div>

                {/* Resumen numérico */}
                <div className={styles.resumenGrid}>
                  <div className={styles.resumenItem}>
                    <span className={styles.resumenIcono} aria-hidden="true">💰</span>
                    <div>
                      <div className={styles.resumenValor}>{formatCurrency(pagaMensual)}</div>
                      <div className={styles.resumenLabel}>Paga mensual</div>
                    </div>
                  </div>
                  <div className={styles.resumenItem}>
                    <span className={styles.resumenIcono} aria-hidden="true">🛒</span>
                    <div>
                      <div className={styles.resumenValor}>{formatCurrency(gastosMensual)}</div>
                      <div className={styles.resumenLabel}>Gastos mensuales</div>
                    </div>
                  </div>
                  <div className={styles.resumenItem}>
                    <span className={styles.resumenIcono} aria-hidden="true">🐷</span>
                    <div>
                      <div className={`${styles.resumenValor} ${sobrante >= 0 ? styles.positivo : styles.negativo}`}>
                        {sobrante >= 0 ? '+' : ''}{formatCurrency(sobrante)}
                      </div>
                      <div className={styles.resumenLabel}>
                        {sobrante >= 0 ? 'Puedes ahorrar' : '¡Gastas más de lo que recibes!'}
                      </div>
                    </div>
                  </div>
                  <div className={styles.resumenItem}>
                    <span className={styles.resumenIcono} aria-hidden="true">📊</span>
                    <div>
                      <div className={styles.resumenValor}>{porcentajeAhorro.toFixed(0)}%</div>
                      <div className={styles.resumenLabel}>Tasa de ahorro</div>
                    </div>
                  </div>
                </div>

                {/* Consejo según tasa de ahorro */}
                <div className={styles.consejoCard} data-tipo={
                  porcentajeAhorro >= 30 ? 'excelente' :
                  porcentajeAhorro >= 20 ? 'bien' :
                  porcentajeAhorro >= 10 ? 'mejorable' : 'alerta'
                }>
                  <span aria-hidden="true">
                    {porcentajeAhorro >= 30 ? '🌟' : porcentajeAhorro >= 20 ? '👍' : porcentajeAhorro >= 10 ? '💪' : '⚠️'}
                  </span>
                  <p>
                    {porcentajeAhorro >= 30 && '¡Genial! Ahorras más del 30%. Tienes muy buen control de tu dinero.'}
                    {porcentajeAhorro >= 20 && porcentajeAhorro < 30 && 'Bien hecho. Ahorras más del 20%, que es el objetivo recomendado.'}
                    {porcentajeAhorro >= 10 && porcentajeAhorro < 20 && 'Puedes mejorar. Intenta llegar al 20% de ahorro reduciendo algún gasto.'}
                    {porcentajeAhorro > 0 && porcentajeAhorro < 10 && 'Ahorras poco. Revisa tus gastos: ¿hay algo que puedas reducir o eliminar?'}
                    {porcentajeAhorro <= 0 && '¡Cuidado! Gastas más de lo que recibes. Necesitas reducir gastos urgentemente.'}
                  </p>
                </div>

                {/* Objetivo */}
                {mesesParaObjetivo !== null && objetivo.nombre && (
                  <div className={styles.objetivoCard}>
                    <div className={styles.objetivoHeader}>
                      <span aria-hidden="true">🎯</span>
                      <strong>{objetivo.nombre}</strong>
                    </div>
                    <div className={styles.objetivoProgreso}>
                      <div className={styles.objetivoBarraFondo}>
                        <div
                          className={styles.objetivoBarra}
                          style={{ width: `${Math.min((sobrante / objetivoImporte) * 100, 100)}%` }}
                        />
                      </div>
                      <p className={styles.objetivoTexto}>
                        Ahorrando {formatCurrency(sobrante)}/mes, lo tendrás en <strong>{mesesParaObjetivo} {mesesParaObjetivo === 1 ? 'mes' : 'meses'}</strong>
                        {mesesParaObjetivo <= 3 && ' — ¡casi lo tienes!'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Desglose de gastos */}
                {gastosMensual > 0 && (
                  <div className={styles.desgloseCard}>
                    <h3 className={styles.desgloseTitle}>¿En qué se va tu dinero?</h3>
                    {categorias.filter(c => parse(c.importe) > 0).map(cat => {
                      const val = parse(cat.importe);
                      const mensual = frecuencia === 'semanal' ? val * 4.33 : val;
                      const pct = (mensual / pagaMensual) * 100;
                      return (
                        <div key={cat.id} className={styles.desgloseItem}>
                          <span aria-hidden="true">{cat.icono}</span>
                          <span className={styles.desgloseNombre}>{cat.nombre}</span>
                          <div className={styles.desgloseBarraWrapper}>
                            <div className={styles.desgloseBarra} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <span className={styles.desglosePct}>{pct.toFixed(0)}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <EducationalSection
          title="📚 Aprende a gestionar tu dinero"
          subtitle="Consejos prácticos para empezar a ahorrar"
        >
          <section className={styles.guideSection}>
            <h2>La regla del 50/30/20 adaptada para jóvenes</h2>
            <p>
              Una forma sencilla de organizar tu dinero es dividirlo en tres partes:
            </p>
            <div className={styles.reglasGrid}>
              <div className={styles.reglaCard} data-tipo="necesidades">
                <strong>50% — Lo necesario</strong>
                <p>Transporte, material escolar, comida fuera si es necesario</p>
              </div>
              <div className={styles.reglaCard} data-tipo="deseos">
                <strong>30% — Lo que te gusta</strong>
                <p>Ocio, ropa, apps, salidas con amigos</p>
              </div>
              <div className={styles.reglaCard} data-tipo="ahorro">
                <strong>20% — Ahorro</strong>
                <p>Para tus objetivos: viajes, tecnología, emergencias</p>
              </div>
            </div>

            <div className={styles.faqList}>
              <details className={styles.faqItem}>
                <summary>¿Por qué es importante ahorrar desde joven?</summary>
                <p>Cuanto antes empieces a ahorrar, más fácil será crear el hábito. Además, el interés compuesto hace que el dinero ahorrado pronto crezca mucho más que el ahorrado tarde. Es una de las habilidades más valiosas que puedes aprender.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Cómo puedo ahorrar si mi paga es pequeña?</summary>
                <p>Lo importante no es la cantidad, sino el hábito. Aunque solo ahorres 2 € a la semana, son 100 € al año. Empieza pequeño y aumenta cuando puedas. Lo que cuenta es la constancia.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Qué hago si no me llega para ahorrar?</summary>
                <p>Revisa tus gastos uno a uno: ¿hay suscripciones que no usas? ¿compras por impulso? A veces pequeños cambios liberan suficiente para empezar a ahorrar.</p>
              </details>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">💡</span>
                <strong>Truco: págate a ti primero</strong>
              </div>
              <ul className={styles.warningList}>
                <li>Cuando recibas tu paga, separa primero la parte de ahorro antes de gastar nada</li>
                <li>Usa una hucha física o una cuenta bancaria separada para tu ahorro</li>
                <li>Fíjate un objetivo concreto: es más fácil ahorrar cuando sabes para qué</li>
                <li>Revisa tu presupuesto cada semana para ir ajustando</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-paga-ahorro')} />
        <ShareCard appName="simulador-paga-ahorro" />
        <Footer appName="simulador-paga-ahorro" />
    </div>
  );
}
