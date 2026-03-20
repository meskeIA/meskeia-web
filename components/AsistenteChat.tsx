'use client';

import { useState, useRef, useEffect } from 'react';
import type { AppRecomendada, MensajeHistorial } from '@/app/api/asistente/route';
import styles from './AsistenteChat.module.css';

interface MensajeUI {
  rol: 'usuario' | 'asistente';
  texto?: string;
  apps?: AppRecomendada[];
}

interface RespuestaAPI {
  texto?: string;
  apps?: AppRecomendada[];
  historial?: MensajeHistorial[];
  error?: string;
}

export default function AsistenteChat() {
  const [mensajes, setMensajes] = useState<MensajeUI[]>([]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [historial, setHistorial] = useState<MensajeHistorial[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const mensajesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes, cargando]);

  // Focus al montar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const enviar = async () => {
    const consulta = input.trim();
    if (!consulta || cargando) return;

    setInput('');
    setMensajes((prev) => [...prev, { rol: 'usuario', texto: consulta }]);
    setCargando(true);

    try {
      const res = await fetch('/api/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consulta, historial }),
      });

      const datos = await res.json() as RespuestaAPI;

      if (!res.ok || datos.error) {
        setMensajes((prev) => [
          ...prev,
          { rol: 'asistente', texto: 'No he podido procesar tu consulta. Inténtalo de nuevo.' },
        ]);
        return;
      }

      setMensajes((prev) => [
        ...prev,
        { rol: 'asistente', texto: datos.texto, apps: datos.apps },
      ]);

      if (datos.historial) setHistorial(datos.historial);

    } catch {
      setMensajes((prev) => [
        ...prev,
        { rol: 'asistente', texto: 'Error de conexión. Comprueba tu red e inténtalo de nuevo.' },
      ]);
    } finally {
      setCargando(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void enviar();
    }
  };

  const reiniciar = () => {
    setMensajes([]);
    setHistorial([]);
    setInput('');
    inputRef.current?.focus();
  };

  return (
    <div className={styles.chat}>
      {/* Historial de mensajes */}
      {mensajes.length > 0 && (
        <div className={styles.mensajes} ref={mensajesRef}>
          {mensajes.map((m, i) => (
            <div
              key={i}
              className={`${styles.mensaje} ${m.rol === 'usuario' ? styles.mensajeUsuario : styles.mensajeAsistente}`}
            >
              {m.rol === 'asistente' && (
                <span className={styles.avatarAsistente} aria-hidden="true">✨</span>
              )}
              <div className={styles.mensajeContenido}>
                {m.texto && <p className={styles.mensajeTexto}>{m.texto}</p>}
                {m.apps && m.apps.length > 0 && (
                  <div className={styles.appCards}>
                    {m.apps.map((app) => (
                      <a key={app.url} href={app.url} className={styles.appCard}>
                        <span className={styles.appCardIcon}>{app.icon}</span>
                        <div className={styles.appCardBody}>
                          <div className={styles.appCardName}>{app.name}</div>
                          <div className={styles.appCardDesc}>{app.description}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Indicador de carga */}
          {cargando && (
            <div className={`${styles.mensaje} ${styles.mensajeAsistente}`}>
              <span className={styles.avatarAsistente} aria-hidden="true">✨</span>
              <div className={styles.mensajeContenido}>
                <div className={styles.typing}>
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className={styles.inputArea}>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder={mensajes.length === 0
            ? 'Describe lo que necesitas... (pulsa Enter)'
            : 'Continúa la conversación...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={cargando}
          aria-label="Mensaje al asistente"
        />
        <button
          type="button"
          className={styles.btnEnviar}
          onClick={() => void enviar()}
          disabled={!input.trim() || cargando}
          aria-label="Enviar mensaje"
        >
          ↵
        </button>
        {mensajes.length > 0 && (
          <button
            type="button"
            className={styles.btnReiniciar}
            onClick={reiniciar}
            aria-label="Nueva conversación"
            title="Nueva conversación"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
