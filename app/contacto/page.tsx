'use client';
// @disclaimer: exempt

import { useState } from 'react';
import FixedHeader from '@/components/FixedHeader';
import { ShareCard } from '@/components';
import Footer from '@/components/Footer';
import InfoBox from '@/components/legal/InfoBox';
import styles from './Contacto.module.css';

const ASUNTOS = [
  'Sugerencia de nueva app o mejora',
  'Problema técnico',
  'Colaboración o propuesta',
  'Consulta general',
  'Otro',
];

export default function ContactoPage() {
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;

    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asunto, mensaje, honeypot }),
      });

      if (res.ok) {
        setStatus('success');
        setAsunto('');
        setMensaje('');
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Error al enviar el mensaje');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Error de conexión. Por favor, inténtelo de nuevo.');
      setStatus('error');
    }
  };

  return (
    <>
      <FixedHeader />

      <main className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Contacto</h1>
            <p className={styles.subtitle}>
              ¿Tienes una sugerencia, has encontrado un problema o quieres colaborar?
              Escríbenos. No necesitas proporcionar tu nombre ni correo electrónico.
            </p>
          </div>

          <InfoBox type="success" title="FORMULARIO ANÓNIMO" icon="🔒">
            <p>
              Este formulario <strong>no solicita ningún dato personal</strong>.
              No hay campo de email ni nombre. Solo tu mensaje llega a nuestro equipo.
              Cumple íntegramente con el RGPD.
            </p>
          </InfoBox>

          {status === 'success' ? (
            <div className={styles.successBox} role="alert">
              <span className={styles.successIcon} aria-hidden="true">✅</span>
              <h2>Mensaje enviado</h2>
              <p>Gracias por escribirnos. Lo tendremos en cuenta.</p>
              <button
                type="button"
                className={styles.resetButton}
                onClick={() => setStatus('idle')}
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              {/* Honeypot anti-spam: oculto para humanos, visible para bots */}
              <div aria-hidden="true" className={styles.honeypot}>
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="asunto" className={styles.label}>
                  Asunto <span className={styles.required} aria-label="obligatorio">*</span>
                </label>
                <select
                  id="asunto"
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  className={styles.select}
                  required
                >
                  <option value="">Selecciona un asunto...</option>
                  {ASUNTOS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="mensaje" className={styles.label}>
                  Mensaje <span className={styles.required} aria-label="obligatorio">*</span>
                </label>
                <textarea
                  id="mensaje"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  className={styles.textarea}
                  placeholder="Escribe tu mensaje aquí..."
                  rows={6}
                  maxLength={2000}
                  required
                />
                <span className={styles.charCount} aria-live="polite">
                  {mensaje.length}/2000 caracteres
                </span>
              </div>

              {status === 'error' && (
                <div className={styles.errorBox} role="alert">
                  ❌ {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className={styles.submitButton}
                disabled={status === 'sending' || !asunto || !mensaje.trim()}
                aria-busy={status === 'sending'}
              >
                {status === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          )}
        </div>
      </main>

      <ShareCard appName="pag:contacto" />
      <Footer appName="pag:contacto" />
    </>
  );
}
