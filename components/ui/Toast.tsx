'use client';

import React, { useEffect, useState } from 'react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export default function Toast({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  position = 'top-right',
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animación de entrada
    setIsVisible(true);

    // Auto-cerrar después de la duración especificada
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Esperar a que termine la animación de salida
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div
      className={`${styles.toast} ${styles[type]} ${styles[position]} ${isVisible ? styles.visible : ''}`}
      role="alert"
    >
      <span className={styles.icon}>{icons[type]}</span>
      <span className={styles.message}>{message}</span>
      <button
        className={styles.closeButton}
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        aria-label="Cerrar notificación"
        type="button"
      >
        ✕
      </button>
    </div>
  );
}

// Hook para gestionar toasts fácilmente
export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; props: Omit<ToastProps, 'onClose'> }>>([]);

  const showToast = (props: Omit<ToastProps, 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, props }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast,
    success: (message: string, duration?: number) =>
      showToast({ message, type: 'success', duration }),
    error: (message: string, duration?: number) =>
      showToast({ message, type: 'error', duration }),
    warning: (message: string, duration?: number) =>
      showToast({ message, type: 'warning', duration }),
    info: (message: string, duration?: number) =>
      showToast({ message, type: 'info', duration }),
  };
}

// Contenedor para renderizar múltiples toasts
export function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Array<{ id: string; props: Omit<ToastProps, 'onClose'> }>;
  removeToast: (id: string) => void;
}) {
  return (
    <>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast.props} onClose={() => removeToast(toast.id)} />
      ))}
    </>
  );
}
