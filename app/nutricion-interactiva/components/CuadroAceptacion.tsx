'use client';

import { useState } from 'react';
import styles from './CuadroAceptacion.module.css';

interface CuadroAceptacionProps {
  onAceptar: () => void;
}

export default function CuadroAceptacion({ onAceptar }: CuadroAceptacionProps) {
  const [checkboxMarcado, setCheckboxMarcado] = useState(false);

  const handleAceptar = () => {
    if (checkboxMarcado) {
      // Guardar en localStorage para no pedir cada vez
      localStorage.setItem('nutricion-aceptado', 'true');
      onAceptar();
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.icon}>⚕️</div>

        <h1 className={styles.title}>
          Aviso Importante sobre Información de Salud
        </h1>

        <div className={styles.content}>
          <h2 className={styles.warningTitle}>
            ⚠️ Antes de continuar, lee atentamente:
          </h2>

          <div className={styles.warningBox}>
            <h3>Esta aplicación NO es asesoramiento médico</h3>
            <ul>
              <li>
                La información proporcionada tiene <strong>fines educativos únicamente</strong>
              </li>
              <li>
                <strong>NO sustituye</strong> el asesoramiento de un médico, nutricionista o
                profesional de la salud
              </li>
              <li>
                Las recomendaciones se basan en estudios científicos generales, pero cada
                persona es diferente
              </li>
              <li>
                <strong>Consulta con un profesional</strong> antes de realizar cambios
                significativos en tu dieta
              </li>
            </ul>
          </div>

          <div className={styles.warningBox}>
            <h3>Responsabilidades del usuario</h3>
            <ul>
              <li>Verifica la información con fuentes médicas profesionales</li>
              <li>
                Si tienes condiciones médicas, alergias o tomas medicamentos,{' '}
                <strong>consulta con tu médico</strong>
              </li>
              <li>No uses esta información para autodiagnóstico o automedicación</li>
              <li>
                meskeIA NO se responsabiliza de decisiones tomadas basándose
                exclusivamente en esta información
              </li>
            </ul>
          </div>

          <div className={styles.sourcesInfo}>
            <h3>📚 Fuentes de información</h3>
            <p>
              Los datos se basan en estudios científicos publicados y revisados por pares,
              pero la ciencia nutricional está en constante evolución.
            </p>
            <p>
              <strong>Última actualización:</strong> Febrero 2026
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={checkboxMarcado}
              onChange={(e) => setCheckboxMarcado(e.target.checked)}
              aria-label="Aceptar términos"
            />
            <span>
              He leído y entendido que esta información NO sustituye
              asesoramiento médico profesional
            </span>
          </label>

          <button
            onClick={handleAceptar}
            className={styles.btnAceptar}
            disabled={!checkboxMarcado}
            aria-label="Aceptar y continuar a la aplicación"
          >
            Acepto y continuar
          </button>

          <a href="/curso-nutrisalud/" className={styles.linkVolver}>
            ← Volver al Curso NutriSalud
          </a>
        </div>
      </div>
    </div>
  );
}
